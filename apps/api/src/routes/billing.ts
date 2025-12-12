import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";
import {
  getOrCreateStripeCustomer,
  createSubscriptionCheckout,
  createCustomerPortalSession,
  getUserSubscription,
  calculateEscrowFee,
  getFeeTierName,
  createEscrowPayment,
  createEscrowDeposit,
  getExistingEscrow,
  getBillingSettings,
  getSubscriptionFeatures,
} from "../services/stripe.js";

const createCheckoutSchema = z.object({
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  billingPeriod: z.enum(["monthly", "yearly"]).optional().default("monthly"),
});

const createPortalSchema = z.object({
  returnUrl: z.string().url(),
});

const createEscrowSchema = z.object({
  propertyId: z.string(),
  buyerId: z.string(),
});

export async function billingRoutes(server: FastifyInstance) {
  // Get public pricing info (no auth required)
  server.get("/pricing", async (_request, reply) => {
    try {
      const settings = await getBillingSettings();
      const freeFeatures = await getSubscriptionFeatures("FREE");
      const proFeatures = await getSubscriptionFeatures("PRO");

      return reply.send({
        success: true,
        data: {
          pro: {
            monthlyPrice: settings.proMonthlyPrice,
            monthlyPriceFormatted: `$${(settings.proMonthlyPrice / 100).toFixed(0)}`,
            yearlyPrice: settings.proYearlyPrice,
            yearlyPriceFormatted: `$${(settings.proYearlyPrice / 100).toFixed(0)}`,
            yearlyEnabled: settings.proYearlyEnabled,
            yearlyMonthlyEquivalent: Math.round(settings.proYearlyPrice / 12),
            yearlyMonthlyEquivalentFormatted: `$${(settings.proYearlyPrice / 12 / 100).toFixed(0)}`,
            yearlySavings: settings.proMonthlyPrice * 12 - settings.proYearlyPrice,
            yearlySavingsFormatted: `$${((settings.proMonthlyPrice * 12 - settings.proYearlyPrice) / 100).toFixed(0)}`,
          },
          features: {
            free: freeFeatures,
            pro: proFeatures,
          },
          currency: "NZD",
        },
      });
    } catch (error) {
      console.error("[Billing] Failed to get pricing:", error);
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get pricing",
        },
      });
    }
  });

  // Get current subscription status
  server.get(
    "/subscription",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        const subscription = await getUserSubscription(userId);

        return reply.send({
          success: true,
          data: subscription,
        });
      } catch (error) {
        console.error("[Billing] Failed to get subscription:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get subscription status",
          },
        });
      }
    }
  );

  // Create checkout session for Pro subscription
  server.post(
    "/create-checkout",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createCheckoutSchema.safeParse(request.body);
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
      const { successUrl, cancelUrl, billingPeriod } = body.data;

      try {
        // Get user email
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

        // Get or create Stripe customer
        const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name || undefined);

        if (!customerId) {
          return reply.send({
            success: false,
            error: {
              code: "STRIPE_NOT_CONFIGURED",
              message: "Payment system not configured",
            },
          });
        }

        // Create checkout session
        const checkoutUrl = await createSubscriptionCheckout(customerId, successUrl, cancelUrl, billingPeriod);

        if (!checkoutUrl) {
          return reply.status(500).send({
            success: false,
            error: {
              code: "CHECKOUT_FAILED",
              message: "Failed to create checkout session",
            },
          });
        }

        return reply.send({
          success: true,
          data: { url: checkoutUrl },
        });
      } catch (error) {
        console.error("[Billing] Failed to create checkout:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create checkout session",
          },
        });
      }
    }
  );

  // Create customer portal session for managing subscription
  server.post(
    "/portal",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createPortalSchema.safeParse(request.body);
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
      const { returnUrl } = body.data;

      try {
        // Get user's Stripe customer ID
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { stripeCustomerId: true },
        });

        if (!user?.stripeCustomerId) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "NO_CUSTOMER",
              message: "No billing account found",
            },
          });
        }

        // Create portal session
        const portalUrl = await createCustomerPortalSession(user.stripeCustomerId, returnUrl);

        if (!portalUrl) {
          return reply.status(500).send({
            success: false,
            error: {
              code: "PORTAL_FAILED",
              message: "Failed to create portal session",
            },
          });
        }

        return reply.send({
          success: true,
          data: { url: portalUrl },
        });
      } catch (error) {
        console.error("[Billing] Failed to create portal:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create portal session",
          },
        });
      }
    }
  );

  // Get escrow fee quote for contacting a buyer
  server.get(
    "/escrow/quote/:propertyId",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId } = request.params as { propertyId: string };

      try {
        // Get property value
        const property = await db.property.findUnique({
          where: { id: propertyId },
          select: { estimatedValue: true, rvValue: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "PROPERTY_NOT_FOUND",
              message: "Property not found",
            },
          });
        }

        // Use estimated value if available, otherwise RV
        const propertyValue = property.estimatedValue || property.rvValue;
        const fee = await calculateEscrowFee(propertyValue);
        const tierName = await getFeeTierName(propertyValue);

        return reply.send({
          success: true,
          data: {
            amount: fee,
            amountFormatted: `$${(fee / 100).toFixed(2)}`,
            tier: tierName,
            currency: "NZD",
          },
        });
      } catch (error) {
        console.error("[Billing] Failed to get escrow quote:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get fee quote",
          },
        });
      }
    }
  );

  // Create escrow payment intent for contacting a buyer
  server.post(
    "/escrow/create",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createEscrowSchema.safeParse(request.body);
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
      const { propertyId, buyerId } = body.data;

      try {
        // Get user and owner profile
        const user = await db.user.findUnique({
          where: { id: userId },
          include: { ownerProfile: true },
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

        if (!user.ownerProfile) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "NOT_OWNER",
              message: "You must be a property owner to contact buyers",
            },
          });
        }

        // Verify the property belongs to this owner
        const property = await db.property.findUnique({
          where: { id: propertyId },
          select: { ownerId: true, estimatedValue: true, rvValue: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "PROPERTY_NOT_FOUND",
              message: "Property not found",
            },
          });
        }

        if (property.ownerId !== user.ownerProfile.id) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "NOT_PROPERTY_OWNER",
              message: "You can only contact buyers for your own properties",
            },
          });
        }

        // Check if buyer exists
        const buyer = await db.buyerProfile.findUnique({
          where: { id: buyerId },
        });

        if (!buyer) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "BUYER_NOT_FOUND",
              message: "Buyer not found",
            },
          });
        }

        // Check for existing escrow
        const existingEscrow = await getExistingEscrow(
          user.ownerProfile.id,
          propertyId,
          buyerId
        );

        if (existingEscrow) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "ESCROW_EXISTS",
              message: "You already have an active escrow for this buyer",
              escrowId: existingEscrow.id,
            },
          });
        }

        // Get or create Stripe customer
        const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name || undefined);

        if (!customerId) {
          return reply.send({
            success: false,
            error: {
              code: "STRIPE_NOT_CONFIGURED",
              message: "Payment system not configured",
            },
          });
        }

        // Calculate fee
        const propertyValue = property.estimatedValue || property.rvValue;
        const amount = await calculateEscrowFee(propertyValue);

        // Create payment intent
        const payment = await createEscrowPayment(customerId, amount, {
          ownerId: user.ownerProfile.id,
          propertyId,
          buyerId,
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

        return reply.send({
          success: true,
          data: {
            clientSecret: payment.clientSecret,
            amount,
            amountFormatted: `$${(amount / 100).toFixed(2)}`,
          },
        });
      } catch (error) {
        console.error("[Billing] Failed to create escrow:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create escrow payment",
          },
        });
      }
    }
  );

  // Confirm escrow payment and create deposit record
  server.post(
    "/escrow/confirm",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const confirmSchema = z.object({
        paymentIntentId: z.string(),
        propertyId: z.string(),
        buyerId: z.string(),
      });

      const body = confirmSchema.safeParse(request.body);
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
      const { paymentIntentId, propertyId, buyerId } = body.data;

      try {
        // Get owner profile
        const user = await db.user.findUnique({
          where: { id: userId },
          include: { ownerProfile: true },
        });

        if (!user?.ownerProfile) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "NOT_OWNER",
              message: "You must be a property owner",
            },
          });
        }

        // Get property for amount calculation
        const property = await db.property.findUnique({
          where: { id: propertyId },
          select: { estimatedValue: true, rvValue: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "PROPERTY_NOT_FOUND",
              message: "Property not found",
            },
          });
        }

        // Calculate amount
        const propertyValue = property.estimatedValue || property.rvValue;
        const amount = await calculateEscrowFee(propertyValue);

        // Create escrow deposit record
        const escrowId = await createEscrowDeposit({
          ownerId: user.ownerProfile.id,
          propertyId,
          buyerId,
          amount,
          stripePaymentId: paymentIntentId,
        });

        return reply.send({
          success: true,
          data: {
            escrowId,
            message: "Payment confirmed. You can now contact this buyer.",
          },
        });
      } catch (error) {
        console.error("[Billing] Failed to confirm escrow:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to confirm escrow payment",
          },
        });
      }
    }
  );

  // Check if owner has access to contact a specific buyer (has valid escrow)
  server.get(
    "/escrow/check/:propertyId/:buyerId",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId, buyerId } = request.params as { propertyId: string; buyerId: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        // Get owner profile
        const user = await db.user.findUnique({
          where: { id: userId },
          include: { ownerProfile: true },
        });

        if (!user?.ownerProfile) {
          return reply.send({
            success: true,
            data: {
              hasAccess: false,
              reason: "NOT_OWNER",
            },
          });
        }

        // Check for existing escrow
        const escrow = await getExistingEscrow(user.ownerProfile.id, propertyId, buyerId);

        return reply.send({
          success: true,
          data: {
            hasAccess: escrow?.status === "HELD",
            escrowId: escrow?.id || null,
            status: escrow?.status || null,
          },
        });
      } catch (error) {
        console.error("[Billing] Failed to check escrow:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to check escrow status",
          },
        });
      }
    }
  );
}
