import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";
import { sendNewInquiryEmail, sendInquiryResponseEmail } from "../services/email.js";
import { releaseEscrow, refundEscrow } from "../services/stripe.js";

const createInquirySchema = z.object({
  propertyId: z.string(),
  buyerId: z.string().optional(), // Required if owner is initiating
  message: z.string().min(10).max(1000),
});

const sendMessageSchema = z.object({
  message: z.string().min(1).max(1000),
});

export async function inquiriesRoutes(server: FastifyInstance) {
  // Create an inquiry (protected)
  server.post(
    "/",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createInquirySchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: body.error.flatten().fieldErrors,
          },
        });
      }

      const { sub: userId } = request.user as { sub: string };
      const { propertyId, buyerId, message } = body.data;

      try {
        // Determine who is initiating
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });
        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        const property = await db.property.findUnique({
          where: { id: propertyId },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        let initiatedBy: "OWNER" | "BUYER";
        let targetBuyerId: string;

        if (ownerProfile && property.ownerId === ownerProfile.id) {
          // Owner initiating contact with a buyer
          if (!buyerId) {
            return reply.status(400).send({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "buyerId is required when owner initiates",
              },
            });
          }
          initiatedBy = "OWNER";
          targetBuyerId = buyerId;
        } else if (buyerProfile) {
          // Buyer reaching out about a property
          initiatedBy = "BUYER";
          targetBuyerId = buyerProfile.id;
        } else {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        // Check if inquiry already exists
        const existingInquiry = await db.inquiry.findFirst({
          where: {
            propertyId,
            buyerId: targetBuyerId,
          },
        });

        if (existingInquiry) {
          // Add message to existing inquiry
          await db.inquiryMessage.create({
            data: {
              inquiryId: existingInquiry.id,
              senderId: userId,
              message,
            },
          });

          return {
            success: true,
            data: { inquiryId: existingInquiry.id, isExisting: true },
          };
        }

        // Create new inquiry
        const inquiry = await db.inquiry.create({
          data: {
            propertyId,
            buyerId: targetBuyerId,
            initiatedBy,
            message,
            messages: {
              create: {
                senderId: userId,
                message,
              },
            },
          },
        });

        // If owner initiated, link the escrow deposit to this inquiry
        if (initiatedBy === "OWNER" && ownerProfile) {
          const escrowDeposit = await db.escrowDeposit.findFirst({
            where: {
              ownerId: ownerProfile.id,
              propertyId,
              buyerId: targetBuyerId,
              status: "HELD",
              inquiryId: null, // Not yet linked to an inquiry
            },
            orderBy: { createdAt: "desc" },
          });

          if (escrowDeposit) {
            await db.escrowDeposit.update({
              where: { id: escrowDeposit.id },
              data: { inquiryId: inquiry.id },
            });
          }
        }

        // Create notification for the other party
        const property2 = await db.property.findUnique({
          where: { id: propertyId },
          include: { owner: { include: { user: true } } },
        });

        // Get buyer details for the email
        const buyer = await db.buyerProfile.findUnique({
          where: { id: targetBuyerId },
          include: { user: true },
        });

        if (initiatedBy === "BUYER" && property2) {
          await db.notification.create({
            data: {
              userId: property2.owner.userId,
              type: "NEW_INQUIRY",
              title: "New inquiry received",
              message: `A buyer has sent an inquiry about your property`,
              data: { inquiryId: inquiry.id, propertyId },
            },
          });

          // Send email notification to owner
          if (property2.owner.user.email) {
            sendNewInquiryEmail({
              ownerEmail: property2.owner.user.email,
              buyerName: buyer?.user.name || "A buyer",
              propertyAddress: property2.address,
              message,
            }).catch((err) => server.log.error("Failed to send email:", err));
          }
        }

        return reply.status(201).send({
          success: true,
          data: { inquiryId: inquiry.id, isExisting: false },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to create inquiry" },
        });
      }
    }
  );

  // Get my inquiries (protected)
  server.get(
    "/me",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };
      const { role = "all" } = request.query as { role?: string };

      try {
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });
        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        const inquiries: any[] = [];

        // Get inquiries as buyer
        if ((role === "all" || role === "buyer") && buyerProfile) {
          const buyerInquiries = await db.inquiry.findMany({
            where: { buyerId: buyerProfile.id },
            orderBy: { updatedAt: "desc" },
            include: {
              property: {
                select: {
                  id: true,
                  address: true,
                  suburb: true,
                  city: true,
                },
              },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              _count: {
                select: {
                  messages: { where: { isRead: false, senderId: { not: userId } } },
                },
              },
            },
          });

          inquiries.push(
            ...buyerInquiries.map((i) => ({
              ...i,
              role: "buyer",
              unreadCount: i._count.messages,
            }))
          );
        }

        // Get inquiries as owner
        if ((role === "all" || role === "owner") && ownerProfile) {
          const ownerProperties = await db.property.findMany({
            where: { ownerId: ownerProfile.id },
            select: { id: true },
          });

          const propertyIds = ownerProperties.map((p) => p.id);

          const ownerInquiries = await db.inquiry.findMany({
            where: { propertyId: { in: propertyIds } },
            orderBy: { updatedAt: "desc" },
            include: {
              property: {
                select: {
                  id: true,
                  address: true,
                  suburb: true,
                  city: true,
                },
              },
              buyer: {
                include: {
                  user: { select: { name: true, image: true } },
                },
              },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              _count: {
                select: {
                  messages: { where: { isRead: false, senderId: { not: userId } } },
                },
              },
            },
          });

          inquiries.push(
            ...ownerInquiries.map((i) => ({
              ...i,
              role: "owner",
              unreadCount: i._count.messages,
            }))
          );
        }

        // Sort by most recent activity
        inquiries.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return {
          success: true,
          data: inquiries.map((i) => ({
            id: i.id,
            role: i.role,
            propertyAddress: i.property.address,
            propertySuburb: i.property.suburb,
            propertyCity: i.property.city,
            initiatedBy: i.initiatedBy,
            status: i.status,
            lastMessage: i.messages[0]?.message || i.message,
            lastMessageAt: i.messages[0]?.createdAt || i.createdAt,
            unreadCount: i.unreadCount,
            buyerName: i.buyer?.user?.name,
          })),
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch inquiries" },
        });
      }
    }
  );

  // Get inquiry details (protected)
  server.get(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const inquiry = await db.inquiry.findUnique({
          where: { id },
          include: {
            property: {
              include: {
                owner: { include: { user: { select: { id: true } } } },
              },
            },
            buyer: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (!inquiry) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Inquiry not found" },
          });
        }

        // Check if user is part of this inquiry
        const isOwner = inquiry.property.owner.user.id === userId;
        const isBuyer = inquiry.buyer.user.id === userId;

        if (!isOwner && !isBuyer) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        // Mark messages as read
        await db.inquiryMessage.updateMany({
          where: {
            inquiryId: id,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true },
        });

        return {
          success: true,
          data: {
            id: inquiry.id,
            property: {
              id: inquiry.property.id,
              address: isOwner ? inquiry.property.address : undefined,
              suburb: inquiry.property.suburb,
              city: inquiry.property.city,
            },
            buyer: {
              name: inquiry.buyer.user.name,
              image: inquiry.buyer.user.image,
            },
            initiatedBy: inquiry.initiatedBy,
            status: inquiry.status,
            messages: inquiry.messages.map((m) => ({
              id: m.id,
              message: m.message,
              isOwn: m.senderId === userId,
              createdAt: m.createdAt,
            })),
            createdAt: inquiry.createdAt,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch inquiry" },
        });
      }
    }
  );

  // Send a message in an inquiry (protected)
  server.post(
    "/:id/messages",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = sendMessageSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid input" },
        });
      }

      const { sub: userId } = request.user as { sub: string };
      const { message } = body.data;

      try {
        const inquiry = await db.inquiry.findUnique({
          where: { id },
          include: {
            property: {
              include: { owner: { include: { user: { select: { id: true, name: true, email: true } } } } },
            },
            buyer: { include: { user: { select: { id: true, name: true, email: true } } } },
          },
        });

        if (!inquiry) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Inquiry not found" },
          });
        }

        // Check if user is part of this inquiry
        const isOwner = inquiry.property.owner.user.id === userId;
        const isBuyer = inquiry.buyer.user.id === userId;

        if (!isOwner && !isBuyer) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const newMessage = await db.inquiryMessage.create({
          data: {
            inquiryId: id,
            senderId: userId,
            message,
          },
        });

        // Update inquiry timestamp
        await db.inquiry.update({
          where: { id },
          data: { updatedAt: new Date() },
        });

        // Create notification for the other party
        const recipientUserId = isOwner
          ? inquiry.buyer.user.id
          : inquiry.property.owner.user.id;

        await db.notification.create({
          data: {
            userId: recipientUserId,
            type: "INQUIRY_RESPONSE",
            title: "New message",
            message: `You have a new message about ${inquiry.property.suburb || inquiry.property.city}`,
            data: { inquiryId: id },
          },
        });

        // Send email notification
        const recipientEmail = isOwner
          ? inquiry.buyer.user.email
          : inquiry.property.owner.user.email;
        const senderName = isOwner
          ? inquiry.property.owner.user.name || "The property owner"
          : inquiry.buyer.user.name || "A buyer";

        if (recipientEmail) {
          sendInquiryResponseEmail({
            recipientEmail,
            senderName,
            propertyAddress: inquiry.property.address,
          }).catch((err) => server.log.error("Failed to send email:", err));
        }

        return {
          success: true,
          data: {
            id: newMessage.id,
            message: newMessage.message,
            createdAt: newMessage.createdAt,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to send message" },
        });
      }
    }
  );

  // Update inquiry status (protected - accept/decline)
  server.patch(
    "/:id/status",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };
      const { sub: userId } = request.user as { sub: string };

      if (!["ACCEPTED", "DECLINED", "COMPLETED"].includes(status)) {
        return reply.status(400).send({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid status" },
        });
      }

      try {
        const inquiry = await db.inquiry.findUnique({
          where: { id },
          include: {
            property: { include: { owner: { include: { user: true } } } },
            buyer: { include: { user: true } },
          },
        });

        if (!inquiry) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Inquiry not found" },
          });
        }

        // Only the recipient can accept/decline
        const isOwner = inquiry.property.owner.user.id === userId;
        const isBuyer = inquiry.buyer.user.id === userId;
        const canUpdate =
          (inquiry.initiatedBy === "BUYER" && isOwner) ||
          (inquiry.initiatedBy === "OWNER" && isBuyer);

        if (!canUpdate && status !== "COMPLETED") {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const updated = await db.inquiry.update({
          where: { id },
          data: { status: status as any },
        });

        // Handle escrow based on status change
        if (status === "COMPLETED" || status === "DECLINED") {
          // Find linked escrow deposit
          const escrowDeposit = await db.escrowDeposit.findUnique({
            where: { inquiryId: id },
          });

          if (escrowDeposit && escrowDeposit.status === "HELD") {
            try {
              if (status === "COMPLETED") {
                // Release escrow to platform
                await releaseEscrow(escrowDeposit.id);
                server.log.info(`Released escrow ${escrowDeposit.id} for completed inquiry ${id}`);
              } else if (status === "DECLINED") {
                // Refund escrow to owner
                await refundEscrow(escrowDeposit.id);
                server.log.info(`Refunded escrow ${escrowDeposit.id} for declined inquiry ${id}`);
              }
            } catch (escrowError) {
              server.log.error(`Failed to process escrow for inquiry ${id}:`, escrowError);
              // Don't fail the status update, but log the error
            }
          }
        }

        return { success: true, data: { status: updated.status } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to update status" },
        });
      }
    }
  );
}
