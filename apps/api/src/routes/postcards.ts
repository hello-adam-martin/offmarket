import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";
import {
  getPostcardAllowance,
  canSendPostcardToAddress,
  createPostcardPayment,
  getOrCreateStripeCustomer,
  getUserSubscription,
  getSubscriptionFeatures,
} from "../services/stripe.js";

const createPostcardSchema = z.object({
  wantedAdId: z.string(),
  targetAddressId: z.string(),
  showBudget: z.boolean().default(false),
  showFinanceStatus: z.boolean().default(false),
  showTimeline: z.boolean().default(false),
  customMessage: z.string().max(200).optional(),
});

export async function postcardsRoutes(server: FastifyInstance) {
  // Get postcard allowance for current user
  server.get(
    "/allowance",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        const allowance = await getPostcardAllowance(userId);

        return reply.send({
          success: true,
          data: allowance,
        });
      } catch (error) {
        console.error("[Postcards] Failed to get allowance:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get postcard allowance",
          },
        });
      }
    }
  );

  // Get my postcard requests
  server.get(
    "/me",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        // Get buyer profile
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (!buyerProfile) {
          return reply.send({
            success: true,
            data: [],
          });
        }

        const postcards = await db.postcardRequest.findMany({
          where: { buyerId: buyerProfile.id },
          orderBy: { createdAt: "desc" },
          include: {
            wantedAd: {
              select: { title: true },
            },
            targetAddr: {
              select: { address: true, suburb: true, city: true },
            },
          },
        });

        return reply.send({
          success: true,
          data: postcards.map((p) => ({
            id: p.id,
            wantedAdTitle: p.wantedAd.title,
            recipientAddress: p.recipientAddress,
            recipientSuburb: p.recipientSuburb,
            recipientCity: p.recipientCity,
            status: p.status,
            costInCents: p.costInCents,
            showBudget: p.showBudget,
            showFinanceStatus: p.showFinanceStatus,
            showTimeline: p.showTimeline,
            customMessage: p.customMessage,
            rejectionReason: p.rejectionReason,
            sentAt: p.sentAt,
            deliveredAt: p.deliveredAt,
            createdAt: p.createdAt,
          })),
        });
      } catch (error) {
        console.error("[Postcards] Failed to get postcards:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get postcards",
          },
        });
      }
    }
  );

  // Request a postcard
  server.post(
    "/",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createPostcardSchema.safeParse(request.body);
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
      const { wantedAdId, targetAddressId, showBudget, showFinanceStatus, showTimeline, customMessage } = body.data;

      try {
        // Check if user has postcard feature enabled
        const subscription = await getUserSubscription(userId);
        const features = await getSubscriptionFeatures(subscription.tier);

        if (!features.postcardEnabled) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "FEATURE_NOT_ENABLED",
              message: "Postcard direct mail is a Pro feature. Upgrade to Pro to send postcards.",
            },
          });
        }

        // Get buyer profile
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (!buyerProfile) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "NO_BUYER_PROFILE",
              message: "You need a buyer profile to send postcards",
            },
          });
        }

        // Verify the wantedAd belongs to this buyer and is SPECIFIC_ADDRESS type
        const wantedAd = await db.wantedAd.findFirst({
          where: {
            id: wantedAdId,
            buyerId: buyerProfile.id,
            targetType: { in: ["SPECIFIC_ADDRESS", "BOTH"] },
          },
          select: { id: true, budget: true, financeStatus: true },
        });

        if (!wantedAd) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "WANTED_AD_NOT_FOUND",
              message: "Buyer interest not found or does not target a specific address",
            },
          });
        }

        // Verify the targetAddress belongs to this wantedAd
        const targetAddress = await db.targetAddress.findFirst({
          where: {
            id: targetAddressId,
            wantedAdId,
          },
        });

        if (!targetAddress) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "ADDRESS_NOT_FOUND",
              message: "Target address not found",
            },
          });
        }

        // Check rate limit (same address)
        const rateLimitCheck = await canSendPostcardToAddress(buyerProfile.id, targetAddressId);
        if (!rateLimitCheck.allowed) {
          return reply.status(429).send({
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: rateLimitCheck.reason,
              nextAllowedDate: rateLimitCheck.nextAllowedDate,
            },
          });
        }

        // Get allowance to determine if free or paid
        const allowance = await getPostcardAllowance(userId);
        const isFree = allowance.freeRemaining > 0;
        const costInCents = isFree ? 0 : allowance.extraCost;

        // If paid, create payment intent
        let stripePaymentId: string | null = null;
        let clientSecret: string | null = null;

        if (!isFree) {
          // Get user for Stripe customer
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
          });

          if (!user) {
            return reply.status(404).send({
              success: false,
              error: {
                code: "USER_NOT_FOUND",
                message: "User not found",
              },
            });
          }

          const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name || undefined);

          if (!customerId) {
            return reply.status(500).send({
              success: false,
              error: {
                code: "STRIPE_NOT_CONFIGURED",
                message: "Payment system not configured",
              },
            });
          }

          const payment = await createPostcardPayment(customerId, {
            buyerId: buyerProfile.id,
            wantedAdId,
            targetAddressId,
          });

          if (!payment) {
            return reply.status(500).send({
              success: false,
              error: {
                code: "PAYMENT_FAILED",
                message: "Failed to create payment",
              },
            });
          }

          stripePaymentId = payment.paymentIntentId;
          clientSecret = payment.clientSecret;
        }

        // Create the postcard request
        const postcardRequest = await db.postcardRequest.create({
          data: {
            buyerId: buyerProfile.id,
            wantedAdId,
            targetAddressId,
            recipientAddress: targetAddress.address,
            recipientSuburb: targetAddress.suburb,
            recipientCity: targetAddress.city,
            recipientRegion: targetAddress.region,
            recipientPostcode: targetAddress.postcode,
            showBudget,
            showFinanceStatus,
            showTimeline,
            customMessage,
            costInCents,
            stripePaymentId,
            status: "PENDING",
          },
        });

        // TODO: Send admin notification email for review

        return reply.send({
          success: true,
          data: {
            id: postcardRequest.id,
            status: postcardRequest.status,
            isFree,
            costInCents,
            costFormatted: isFree ? "Free" : `$${(costInCents / 100).toFixed(2)}`,
            clientSecret, // null if free, otherwise Stripe client secret
            message: isFree
              ? "Your postcard request has been submitted for review."
              : "Please complete payment to submit your postcard request.",
          },
        });
      } catch (error) {
        console.error("[Postcards] Failed to create postcard request:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create postcard request",
          },
        });
      }
    }
  );

  // Confirm postcard payment (called after Stripe payment success)
  server.post(
    "/:id/confirm-payment",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        // Get buyer profile
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (!buyerProfile) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "NO_BUYER_PROFILE",
              message: "Buyer profile not found",
            },
          });
        }

        // Verify the postcard request belongs to this buyer
        const postcardRequest = await db.postcardRequest.findFirst({
          where: {
            id,
            buyerId: buyerProfile.id,
          },
        });

        if (!postcardRequest) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Postcard request not found",
            },
          });
        }

        // Update status to confirm payment was received
        // In production, this should be validated via Stripe webhook
        // For now, we trust the client (frontend should verify payment succeeded)

        return reply.send({
          success: true,
          data: {
            id: postcardRequest.id,
            status: postcardRequest.status,
            message: "Payment confirmed. Your postcard request is pending review.",
          },
        });
      } catch (error) {
        console.error("[Postcards] Failed to confirm payment:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to confirm payment",
          },
        });
      }
    }
  );

  // Get single postcard details
  server.get(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        // Get buyer profile
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (!buyerProfile) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "NO_BUYER_PROFILE",
              message: "Buyer profile not found",
            },
          });
        }

        const postcard = await db.postcardRequest.findFirst({
          where: {
            id,
            buyerId: buyerProfile.id,
          },
          include: {
            wantedAd: {
              select: { title: true, budget: true, financeStatus: true },
            },
            targetAddr: {
              select: { address: true, suburb: true, city: true, region: true, postcode: true },
            },
          },
        });

        if (!postcard) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Postcard request not found",
            },
          });
        }

        return reply.send({
          success: true,
          data: {
            id: postcard.id,
            wantedAd: postcard.wantedAd,
            targetAddress: postcard.targetAddr,
            recipientAddress: postcard.recipientAddress,
            recipientSuburb: postcard.recipientSuburb,
            recipientCity: postcard.recipientCity,
            recipientRegion: postcard.recipientRegion,
            recipientPostcode: postcard.recipientPostcode,
            claimCode: postcard.claimCode,
            status: postcard.status,
            costInCents: postcard.costInCents,
            showBudget: postcard.showBudget,
            showFinanceStatus: postcard.showFinanceStatus,
            showTimeline: postcard.showTimeline,
            customMessage: postcard.customMessage,
            rejectionReason: postcard.rejectionReason,
            sentAt: postcard.sentAt,
            deliveredAt: postcard.deliveredAt,
            createdAt: postcard.createdAt,
          },
        });
      } catch (error) {
        console.error("[Postcards] Failed to get postcard:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get postcard",
          },
        });
      }
    }
  );

  // Check if postcard can be sent to a specific address
  server.get(
    "/check/:wantedAdId/:targetAddressId",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { wantedAdId, targetAddressId } = request.params as {
        wantedAdId: string;
        targetAddressId: string;
      };
      const { sub: userId } = request.user as { sub: string };

      try {
        // Check feature access
        const subscription = await getUserSubscription(userId);
        const features = await getSubscriptionFeatures(subscription.tier);

        if (!features.postcardEnabled) {
          return reply.send({
            success: true,
            data: {
              canSend: false,
              reason: "FEATURE_NOT_ENABLED",
              message: "Upgrade to Pro to send postcards",
            },
          });
        }

        // Get buyer profile
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (!buyerProfile) {
          return reply.send({
            success: true,
            data: {
              canSend: false,
              reason: "NO_BUYER_PROFILE",
              message: "You need a buyer profile to send postcards",
            },
          });
        }

        // Verify ownership
        const wantedAd = await db.wantedAd.findFirst({
          where: {
            id: wantedAdId,
            buyerId: buyerProfile.id,
            targetType: { in: ["SPECIFIC_ADDRESS", "BOTH"] },
          },
        });

        if (!wantedAd) {
          return reply.send({
            success: true,
            data: {
              canSend: false,
              reason: "INVALID_WANTED_AD",
              message: "Buyer interest not found or does not target specific addresses",
            },
          });
        }

        // Check rate limit
        const rateLimitCheck = await canSendPostcardToAddress(buyerProfile.id, targetAddressId);
        if (!rateLimitCheck.allowed) {
          return reply.send({
            success: true,
            data: {
              canSend: false,
              reason: "RATE_LIMITED",
              message: rateLimitCheck.reason,
              nextAllowedDate: rateLimitCheck.nextAllowedDate,
            },
          });
        }

        // Get allowance
        const allowance = await getPostcardAllowance(userId);

        return reply.send({
          success: true,
          data: {
            canSend: true,
            isFree: allowance.freeRemaining > 0,
            freeRemaining: allowance.freeRemaining,
            costIfPaid: allowance.extraCost,
            costFormatted: allowance.freeRemaining > 0 ? "Free" : `$${(allowance.extraCost / 100).toFixed(2)}`,
          },
        });
      } catch (error) {
        console.error("[Postcards] Failed to check postcard eligibility:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to check postcard eligibility",
          },
        });
      }
    }
  );

  // ============================================
  // PUBLIC ENDPOINTS (for property owners)
  // ============================================

  // Look up postcard by claim code (public, no auth required)
  server.get(
    "/claim/:code",
    async (request, reply) => {
      const { code } = request.params as { code: string };

      try {
        const postcard = await db.postcardRequest.findFirst({
          where: { claimCode: code.toUpperCase() },
          include: {
            buyer: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
            wantedAd: {
              select: {
                title: true,
                description: true,
                budget: true,
                financeStatus: true,
              },
            },
            targetAddr: {
              select: { address: true, suburb: true, city: true },
            },
          },
        });

        if (!postcard) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Postcard not found. Please check your claim code.",
            },
          });
        }

        // Only show information that the buyer opted to share
        const response: any = {
          id: postcard.id,
          claimCode: postcard.claimCode,
          buyerName: postcard.buyer.user.name || "Anonymous Buyer",
          interestTitle: postcard.wantedAd.title,
          interestDescription: postcard.wantedAd.description,
          propertyAddress: postcard.recipientAddress,
          propertySuburb: postcard.recipientSuburb,
          propertyCity: postcard.recipientCity,
          customMessage: postcard.customMessage,
          claimedAt: postcard.claimedAt,
        };

        if (postcard.showBudget && postcard.wantedAd.budget) {
          response.budget = postcard.wantedAd.budget;
        }

        if (postcard.showFinanceStatus && postcard.wantedAd.financeStatus) {
          response.financeStatus = postcard.wantedAd.financeStatus;
        }

        if (postcard.showTimeline) {
          // Timeline would come from wantedAd if we add it
          response.showTimeline = true;
        }

        return reply.send({
          success: true,
          data: response,
        });
      } catch (error) {
        console.error("[Postcards] Failed to look up claim code:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to look up postcard",
          },
        });
      }
    }
  );

  // Mark postcard as claimed/viewed (public, no auth required)
  server.post(
    "/claim/:code/view",
    async (request, reply) => {
      const { code } = request.params as { code: string };

      try {
        const postcard = await db.postcardRequest.findFirst({
          where: { claimCode: code.toUpperCase() },
        });

        if (!postcard) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Postcard not found",
            },
          });
        }

        // Mark as claimed/viewed if not already
        if (!postcard.claimedAt) {
          await db.postcardRequest.update({
            where: { id: postcard.id },
            data: { claimedAt: new Date() },
          });
        }

        return reply.send({
          success: true,
          data: { viewed: true },
        });
      } catch (error) {
        console.error("[Postcards] Failed to mark as viewed:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to update postcard",
          },
        });
      }
    }
  );

  // Submit owner interest (store response on postcard)
  server.post(
    "/claim/:code/respond",
    async (request, reply) => {
      const { code } = request.params as { code: string };
      const { message, contactEmail, contactPhone, ownerName } = request.body as {
        message?: string;
        contactEmail?: string;
        contactPhone?: string;
        ownerName?: string;
      };

      if (!contactEmail && !contactPhone) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide at least an email or phone number",
          },
        });
      }

      try {
        const postcard = await db.postcardRequest.findFirst({
          where: { claimCode: code.toUpperCase() },
          include: {
            buyer: {
              include: {
                user: true,
              },
            },
            wantedAd: true,
          },
        });

        if (!postcard) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Postcard not found",
            },
          });
        }

        // Check if already responded
        if (postcard.ownerResponseAt) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "ALREADY_RESPONDED",
              message: "You have already responded to this postcard",
            },
          });
        }

        // Update postcard with owner response
        await db.postcardRequest.update({
          where: { id: postcard.id },
          data: {
            claimedAt: postcard.claimedAt || new Date(),
            ownerResponseAt: new Date(),
            ownerName,
            ownerEmail: contactEmail,
            ownerPhone: contactPhone,
            ownerMessage: message || "I received your postcard and am interested in discussing.",
          },
        });

        // TODO: Send notification email to buyer about owner response

        return reply.send({
          success: true,
          data: {
            message: "Your response has been sent to the buyer. They will contact you soon.",
          },
        });
      } catch (error) {
        console.error("[Postcards] Failed to submit response:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to submit response",
          },
        });
      }
    }
  );
}
