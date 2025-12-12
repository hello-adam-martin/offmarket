import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";
import { processExpiredEscrows } from "../jobs/escrow-expiry.js";
import { releaseEscrow, refundEscrow, clearBillingSettingsCache } from "../services/stripe.js";

// Middleware to check admin role
async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { sub: userId } = request.user as { sub: string };
  const user = await db.user.findUnique({ where: { id: userId } });

  if (user?.role !== "ADMIN") {
    reply.status(403).send({
      success: false,
      error: { code: "FORBIDDEN", message: "Admin access required" },
    });
    return;
  }
}

const updateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

const updateTemplateSchema = z.object({
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  isActive: z.boolean().optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).regex(/^[a-z_]+$/),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateSettingSchema = z.object({
  value: z.string(),
});

const subscriptionFeaturesSchema = z.object({
  wantedAdLimit: z.number().int().min(-1), // -1 = unlimited
  specificAddressLimit: z.number().int().min(-1), // -1 = unlimited
  priorityNotifications: z.boolean(),
  earlyAccess: z.boolean(),
  savedSearchLimit: z.number().int().min(-1), // -1 = unlimited
  matchNotifications: z.boolean(),
  directMessaging: z.boolean(),
  postcardEnabled: z.boolean(),
  postcardFreeMonthly: z.number().int().min(0),
});

const billingSettingsSchema = z.object({
  // Pricing
  proMonthlyPrice: z.number().int().min(0),
  proYearlyPrice: z.number().int().min(0),
  proYearlyEnabled: z.boolean(),

  // Finder's fees
  escrowFeeStandard: z.number().int().min(0),
  escrowFeePremium: z.number().int().min(0),
  escrowFeeLuxury: z.number().int().min(0),
  premiumThreshold: z.number().int().min(0),
  luxuryThreshold: z.number().int().min(0),
  escrowExpiryDays: z.number().int().min(1).max(90),

  // Postcard settings
  postcardCost: z.number().int().min(0),
  postcardRateLimitDays: z.number().int().min(1).max(365),

  // Tier features
  freeFeatures: subscriptionFeaturesSchema,
  proFeatures: subscriptionFeaturesSchema,
});

// Default billing settings
const DEFAULT_BILLING_SETTINGS = {
  proMonthlyPrice: 1900,
  proYearlyPrice: 19000,
  proYearlyEnabled: false,
  escrowFeeStandard: 29900,
  escrowFeePremium: 49900,
  escrowFeeLuxury: 79900,
  premiumThreshold: 1000000,
  luxuryThreshold: 2000000,
  escrowExpiryDays: 30,
  postcardCost: 1500,
  postcardRateLimitDays: 90,
  freeFeatures: {
    wantedAdLimit: 3,
    specificAddressLimit: 1, // 1 free specific address interest
    priorityNotifications: false,
    earlyAccess: false,
    savedSearchLimit: 5,
    matchNotifications: true,
    directMessaging: true,
    postcardEnabled: false,
    postcardFreeMonthly: 0,
  },
  proFeatures: {
    wantedAdLimit: -1, // unlimited
    specificAddressLimit: -1, // unlimited
    priorityNotifications: true,
    earlyAccess: true,
    savedSearchLimit: -1, // unlimited
    matchNotifications: true,
    directMessaging: true,
    postcardEnabled: true,
    postcardFreeMonthly: 1,
  },
};

export async function adminRoutes(server: FastifyInstance) {
  // All admin routes require authentication + admin role
  const preHandler = [(server as any).authenticate, requireAdmin];

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================

  server.get("/stats", { preHandler }, async () => {
    const [
      userCount,
      buyerCount,
      ownerCount,
      propertyCount,
      wantedAdCount,
      matchCount,
      inquiryCount,
    ] = await Promise.all([
      db.user.count(),
      db.buyerProfile.count(),
      db.ownerProfile.count(),
      db.property.count(),
      db.wantedAd.count(),
      db.propertyMatch.count(),
      db.inquiry.count(),
    ]);

    // Recent activity
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, createdAt: true, role: true },
    });

    return {
      success: true,
      data: {
        counts: {
          users: userCount,
          buyers: buyerCount,
          owners: ownerCount,
          properties: propertyCount,
          wantedAds: wantedAdCount,
          matches: matchCount,
          inquiries: inquiryCount,
        },
        recentUsers,
      },
    };
  });

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  server.get("/users", { preHandler }, async (request) => {
    const {
      page = "1",
      limit = "20",
      search = "",
    } = request.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          buyerProfile: { select: { id: true } },
          ownerProfile: { select: { id: true } },
        },
      }),
      db.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users: users.map((u) => ({
          ...u,
          isBuyer: !!u.buyerProfile,
          isOwner: !!u.ownerProfile,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };
  });

  server.patch("/users/:id/role", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateRoleSchema.safeParse(request.body);

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

    const user = await db.user.update({
      where: { id },
      data: { role: body.data.role },
      select: { id: true, email: true, role: true },
    });

    return { success: true, data: user };
  });

  // ============================================================================
  // EMAIL TEMPLATES
  // ============================================================================

  server.get("/email-templates", { preHandler }, async () => {
    const templates = await db.emailTemplate.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, data: templates };
  });

  server.get("/email-templates/:name", { preHandler }, async (request, reply) => {
    const { name } = request.params as { name: string };

    const template = await db.emailTemplate.findUnique({
      where: { name },
    });

    if (!template) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Template not found" },
      });
    }

    return { success: true, data: template };
  });

  server.post("/email-templates", { preHandler }, async (request, reply) => {
    const body = createTemplateSchema.safeParse(request.body);

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

    const existing = await db.emailTemplate.findUnique({
      where: { name: body.data.name },
    });

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: { code: "CONFLICT", message: "Template with this name already exists" },
      });
    }

    const template = await db.emailTemplate.create({
      data: body.data,
    });

    return reply.status(201).send({ success: true, data: template });
  });

  server.put("/email-templates/:name", { preHandler }, async (request, reply) => {
    const { name } = request.params as { name: string };
    const body = updateTemplateSchema.safeParse(request.body);

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

    const existing = await db.emailTemplate.findUnique({
      where: { name },
    });

    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Template not found" },
      });
    }

    const template = await db.emailTemplate.update({
      where: { name },
      data: body.data,
    });

    return { success: true, data: template };
  });

  // ============================================================================
  // SYSTEM SETTINGS
  // ============================================================================

  server.get("/settings", { preHandler }, async () => {
    const settings = await db.systemSetting.findMany();
    return {
      success: true,
      data: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    };
  });

  server.put("/settings/:key", { preHandler }, async (request, reply) => {
    const { key } = request.params as { key: string };
    const body = updateSettingSchema.safeParse(request.body);

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

    const setting = await db.systemSetting.upsert({
      where: { key },
      update: { value: body.data.value },
      create: { key, value: body.data.value },
    });

    return { success: true, data: setting };
  });

  // ============================================================================
  // BILLING & ESCROW MANAGEMENT
  // ============================================================================

  server.get("/billing/stats", { preHandler }, async () => {
    const PRO_PRICE_CENTS = 1900; // $19/month

    const [
      subscriptionStats,
      escrowStats,
      totalSubscriptions,
    ] = await Promise.all([
      // Subscription stats
      db.subscription.groupBy({
        by: ["tier", "status"],
        _count: { id: true },
      }),
      // Escrow stats
      db.escrowDeposit.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Total subscriptions count
      db.subscription.count(),
    ]);

    // Calculate subscription counts
    const proActive = subscriptionStats
      .filter((s) => s.tier === "PRO" && s.status === "ACTIVE")
      .reduce((sum, s) => sum + s._count.id, 0);

    const proPastDue = subscriptionStats
      .filter((s) => s.tier === "PRO" && s.status === "PAST_DUE")
      .reduce((sum, s) => sum + s._count.id, 0);

    const proCanceled = subscriptionStats
      .filter((s) => s.tier === "PRO" && s.status === "CANCELED")
      .reduce((sum, s) => sum + s._count.id, 0);

    // Calculate escrow stats
    const escrowByStatus = (status: string) => {
      const stat = escrowStats.find((s) => s.status === status);
      return {
        count: stat?._count.id || 0,
        value: stat?._sum.amount || 0,
      };
    };

    const pending = escrowByStatus("PENDING");
    const held = escrowByStatus("HELD");
    const released = escrowByStatus("RELEASED");
    const refunded = escrowByStatus("REFUNDED");
    const expired = escrowByStatus("EXPIRED");

    const totalEscrowCount = escrowStats.reduce((sum, s) => sum + s._count.id, 0);
    const totalEscrowValue = escrowStats.reduce((sum, s) => sum + (s._sum.amount || 0), 0);

    return {
      success: true,
      data: {
        subscriptions: {
          total: totalSubscriptions,
          active: proActive,
          pastDue: proPastDue,
          canceled: proCanceled,
        },
        revenue: {
          monthly: proActive * PRO_PRICE_CENTS,
          total: released.value,
        },
        escrow: {
          total: totalEscrowCount,
          pending: pending.count,
          held: held.count,
          released: released.count,
          refunded: refunded.count,
          expired: expired.count,
          totalValue: totalEscrowValue,
          heldValue: held.value,
        },
      },
    };
  });

  // Get all escrow deposits
  server.get("/billing/escrows", { preHandler }, async (request) => {
    const {
      page = "1",
      limit = "20",
      status,
    } = request.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status: status as any } : {};

    const [escrows, total] = await Promise.all([
      db.escrowDeposit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          owner: { include: { user: { select: { email: true, name: true } } } },
          buyer: { include: { user: { select: { name: true } } } },
          property: { select: { address: true, suburb: true } },
          inquiry: { select: { id: true, status: true } },
        },
      }),
      db.escrowDeposit.count({ where }),
    ]);

    return {
      success: true,
      data: {
        escrows: escrows.map((e) => ({
          id: e.id,
          amount: e.amount,
          status: e.status,
          stripePaymentId: e.stripePaymentId,
          owner: {
            id: e.ownerId,
            email: e.owner.user.email,
            name: e.owner.user.name,
          },
          buyer: {
            id: e.buyerId,
            name: e.buyer.user.name,
          },
          property: {
            id: e.propertyId,
            address: e.property.address,
            suburb: e.property.suburb,
          },
          inquiry: e.inquiry ? {
            id: e.inquiry.id,
            status: e.inquiry.status,
          } : null,
          createdAt: e.createdAt,
          expiresAt: e.expiresAt,
          releasedAt: e.releasedAt,
          refundedAt: e.refundedAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };
  });

  // Manually trigger escrow expiry processing
  server.post("/billing/process-expired-escrows", { preHandler }, async (request, reply) => {
    try {
      const result = await processExpiredEscrows();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      server.log.error("Failed to process expired escrows:", error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to process expired escrows" },
      });
    }
  });

  // Get all subscriptions
  server.get("/billing/subscriptions", { preHandler }, async (request) => {
    const {
      page = "1",
      limit = "20",
      status,
      search,
    } = request.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } },
        ],
      };
    }

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
      db.subscription.count({ where }),
    ]);

    return {
      success: true,
      data: {
        subscriptions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };
  });

  // Manual escrow release by admin
  server.post("/billing/escrows/:id/release", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const escrow = await db.escrowDeposit.findUnique({
      where: { id },
    });

    if (!escrow) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Escrow deposit not found" },
      });
    }

    if (escrow.status !== "HELD") {
      return reply.status(400).send({
        success: false,
        error: { code: "INVALID_STATUS", message: `Cannot release escrow with status ${escrow.status}` },
      });
    }

    try {
      const result = await releaseEscrow(id);
      return { success: true, data: result };
    } catch (error) {
      server.log.error("Failed to release escrow:", error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to release escrow" },
      });
    }
  });

  // Manual escrow refund by admin
  server.post("/billing/escrows/:id/refund", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const escrow = await db.escrowDeposit.findUnique({
      where: { id },
    });

    if (!escrow) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Escrow deposit not found" },
      });
    }

    if (escrow.status !== "HELD") {
      return reply.status(400).send({
        success: false,
        error: { code: "INVALID_STATUS", message: `Cannot refund escrow with status ${escrow.status}` },
      });
    }

    try {
      const result = await refundEscrow(id);
      return { success: true, data: result };
    } catch (error) {
      server.log.error("Failed to refund escrow:", error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to refund escrow" },
      });
    }
  });

  // ============================================================================
  // BILLING SETTINGS
  // ============================================================================

  // Get billing settings
  server.get("/billing/settings", { preHandler }, async () => {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          startsWith: "billing.",
        },
      },
    });

    // Convert to object
    const settingsObj: Record<string, any> = { ...DEFAULT_BILLING_SETTINGS };
    for (const setting of settings) {
      const key = setting.key.replace("billing.", "");
      try {
        settingsObj[key] = JSON.parse(setting.value);
      } catch {
        settingsObj[key] = setting.value;
      }
    }

    return { success: true, data: settingsObj };
  });

  // Update billing settings
  server.put("/billing/settings", { preHandler }, async (request, reply) => {
    const body = billingSettingsSchema.safeParse(request.body);

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

    // Save each setting
    const settingsToSave = Object.entries(body.data);
    await Promise.all(
      settingsToSave.map(([key, value]) =>
        db.systemSetting.upsert({
          where: { key: `billing.${key}` },
          update: { value: JSON.stringify(value) },
          create: { key: `billing.${key}`, value: JSON.stringify(value) },
        })
      )
    );

    // Clear the settings cache so new values take effect immediately
    clearBillingSettingsCache();

    return { success: true, data: body.data };
  });

  // ============================================================================
  // POSTCARD MANAGEMENT
  // ============================================================================

  // Get postcard stats
  server.get("/postcards/stats", { preHandler }, async () => {
    const [statusCounts, totalCount, recentPostcards] = await Promise.all([
      db.postcardRequest.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { costInCents: true },
      }),
      db.postcardRequest.count(),
      db.postcardRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          recipientAddress: true,
          recipientCity: true,
          createdAt: true,
        },
      }),
    ]);

    const getStatusCount = (status: string) => {
      const stat = statusCounts.find((s) => s.status === status);
      return {
        count: stat?._count.id || 0,
        revenue: stat?._sum.costInCents || 0,
      };
    };

    return {
      success: true,
      data: {
        total: totalCount,
        pending: getStatusCount("PENDING").count,
        approved: getStatusCount("APPROVED").count,
        rejected: getStatusCount("REJECTED").count,
        sent: getStatusCount("SENT").count,
        delivered: getStatusCount("DELIVERED").count,
        failed: getStatusCount("FAILED").count,
        revenue: statusCounts.reduce((sum, s) => sum + (s._sum.costInCents || 0), 0),
        recentPostcards,
      },
    };
  });

  // Get all postcards (with filters)
  server.get("/postcards", { preHandler }, async (request) => {
    const {
      page = "1",
      limit = "20",
      status,
    } = request.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status: status as any } : {};

    const [postcards, total] = await Promise.all([
      db.postcardRequest.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          wantedAd: {
            select: { title: true, budget: true },
          },
        },
      }),
      db.postcardRequest.count({ where }),
    ]);

    return {
      success: true,
      data: {
        postcards: postcards.map((p) => ({
          id: p.id,
          recipientAddress: p.recipientAddress,
          recipientSuburb: p.recipientSuburb,
          recipientCity: p.recipientCity,
          recipientRegion: p.recipientRegion,
          recipientPostcode: p.recipientPostcode,
          claimCode: p.claimCode,
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
          buyer: {
            id: p.buyerId,
            name: p.buyer.user.name,
            email: p.buyer.user.email,
          },
          wantedAd: {
            title: p.wantedAd.title,
            budget: p.wantedAd.budget,
          },
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };
  });

  // Get single postcard details
  server.get("/postcards/:id", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const postcard = await db.postcardRequest.findUnique({
      where: { id },
      include: {
        buyer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        wantedAd: {
          select: { title: true, budget: true, financeStatus: true },
        },
        targetAddr: true,
      },
    });

    if (!postcard) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Postcard not found" },
      });
    }

    return {
      success: true,
      data: {
        ...postcard,
        buyer: {
          id: postcard.buyerId,
          name: postcard.buyer.user.name,
          email: postcard.buyer.user.email,
        },
      },
    };
  });

  // Approve a postcard
  server.patch("/postcards/:id/approve", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sub: userId } = request.user as { sub: string };

    const postcard = await db.postcardRequest.findUnique({
      where: { id },
    });

    if (!postcard) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Postcard not found" },
      });
    }

    if (postcard.status !== "PENDING") {
      return reply.status(400).send({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Cannot approve postcard with status ${postcard.status}`,
        },
      });
    }

    const updated = await db.postcardRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: userId,
      },
    });

    // TODO: Send buyer notification email

    return { success: true, data: updated };
  });

  // Reject a postcard
  server.patch("/postcards/:id/reject", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sub: userId } = request.user as { sub: string };

    const rejectSchema = z.object({
      reason: z.string().min(1, "Rejection reason is required"),
    });

    const body = rejectSchema.safeParse(request.body);
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

    const postcard = await db.postcardRequest.findUnique({
      where: { id },
    });

    if (!postcard) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Postcard not found" },
      });
    }

    if (postcard.status !== "PENDING") {
      return reply.status(400).send({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Cannot reject postcard with status ${postcard.status}`,
        },
      });
    }

    const updated = await db.postcardRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: body.data.reason,
        reviewedAt: new Date(),
        reviewedBy: userId,
      },
    });

    // TODO: If paid, trigger refund
    // TODO: Send buyer notification email with rejection reason

    return { success: true, data: updated };
  });

  // Mark postcard as sent
  server.patch("/postcards/:id/mark-sent", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const markSentSchema = z.object({
      trackingNumber: z.string().optional(),
    });

    const body = markSentSchema.safeParse(request.body);

    const postcard = await db.postcardRequest.findUnique({
      where: { id },
    });

    if (!postcard) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Postcard not found" },
      });
    }

    if (postcard.status !== "APPROVED") {
      return reply.status(400).send({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Cannot mark as sent: postcard has status ${postcard.status}`,
        },
      });
    }

    const updated = await db.postcardRequest.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        trackingNumber: body.success ? body.data.trackingNumber : undefined,
      },
    });

    // TODO: Send buyer notification email

    return { success: true, data: updated };
  });

  // Mark postcard as delivered
  server.patch("/postcards/:id/mark-delivered", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const postcard = await db.postcardRequest.findUnique({
      where: { id },
    });

    if (!postcard) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Postcard not found" },
      });
    }

    if (postcard.status !== "SENT") {
      return reply.status(400).send({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Cannot mark as delivered: postcard has status ${postcard.status}`,
        },
      });
    }

    const updated = await db.postcardRequest.update({
      where: { id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    return { success: true, data: updated };
  });

  // Mark postcard as failed
  server.patch("/postcards/:id/mark-failed", { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const markFailedSchema = z.object({
      reason: z.string().min(1, "Failure reason is required"),
    });

    const body = markFailedSchema.safeParse(request.body);
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

    const postcard = await db.postcardRequest.findUnique({
      where: { id },
    });

    if (!postcard) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Postcard not found" },
      });
    }

    if (!["APPROVED", "SENT"].includes(postcard.status)) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Cannot mark as failed: postcard has status ${postcard.status}`,
        },
      });
    }

    const updated = await db.postcardRequest.update({
      where: { id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        failureReason: body.data.reason,
      },
    });

    // TODO: If paid, trigger refund
    // TODO: Send buyer notification email

    return { success: true, data: updated };
  });

  // Export postcards as CSV (for manual fulfillment)
  server.get("/postcards/export/csv", { preHandler }, async (request, reply) => {
    const { status = "APPROVED" } = request.query as Record<string, string>;

    const postcards = await db.postcardRequest.findMany({
      where: { status: status as any },
      orderBy: { createdAt: "asc" },
      include: {
        buyer: {
          include: {
            user: { select: { name: true } },
          },
        },
        wantedAd: {
          select: { budget: true, financeStatus: true },
        },
      },
    });

    // Build CSV
    const headers = [
      "ID",
      "Claim Code",
      "Recipient Address",
      "Suburb",
      "City",
      "Region",
      "Postcode",
      "Buyer Name",
      "Show Budget",
      "Budget",
      "Show Finance",
      "Finance Status",
      "Show Timeline",
      "Custom Message",
      "Created At",
    ].join(",");

    const rows = postcards.map((p) => [
      p.id,
      p.claimCode,
      `"${p.recipientAddress.replace(/"/g, '""')}"`,
      p.recipientSuburb || "",
      p.recipientCity || "",
      p.recipientRegion || "",
      p.recipientPostcode || "",
      `"${(p.buyer.user.name || "").replace(/"/g, '""')}"`,
      p.showBudget ? "Yes" : "No",
      p.showBudget ? p.wantedAd.budget : "",
      p.showFinanceStatus ? "Yes" : "No",
      p.showFinanceStatus ? (p.wantedAd.financeStatus || "") : "",
      p.showTimeline ? "Yes" : "No",
      `"${(p.customMessage || "").replace(/"/g, '""')}"`,
      p.createdAt.toISOString(),
    ].join(","));

    const csv = [headers, ...rows].join("\n");

    reply.header("Content-Type", "text/csv");
    reply.header("Content-Disposition", `attachment; filename="postcards-${status.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv"`);

    return csv;
  });
}
