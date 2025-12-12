import type { FastifyInstance, FastifyRequest } from "fastify";
import type Stripe from "stripe";
import {
  stripe,
  syncSubscriptionFromStripe,
  handleSubscriptionDeleted,
} from "../services/stripe.js";

export async function webhooksRoutes(server: FastifyInstance) {
  // Stripe webhook handler
  // Note: This endpoint needs raw body access for signature verification
  server.post(
    "/stripe",
    async (request: FastifyRequest, reply) => {
      if (!stripe) {
        console.log("[Webhook] Stripe not configured, skipping");
        return reply.status(200).send({ received: true });
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.warn("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return reply.status(400).send({ error: "Webhook secret not configured" });
      }

      const signature = request.headers["stripe-signature"] as string;
      if (!signature) {
        return reply.status(400).send({ error: "Missing stripe-signature header" });
      }

      let event;

      try {
        // Get raw body for signature verification
        const rawBody = (request as any).rawBody || request.body;

        event = stripe.webhooks.constructEvent(
          typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody),
          signature,
          webhookSecret
        );
      } catch (err) {
        console.error("[Webhook] Signature verification failed:", err);
        return reply.status(400).send({
          error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }

      console.log(`[Webhook] Received event: ${event.type}`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object;
            console.log(`[Webhook] Checkout completed for customer ${session.customer}`);
            // Subscription will be handled by customer.subscription.created
            break;
          }

          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            // Access items to get period dates from the first item
            const periodStart = subscription.items?.data[0]?.current_period_start
              ?? Math.floor(Date.now() / 1000);
            const periodEnd = subscription.items?.data[0]?.current_period_end
              ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

            await syncSubscriptionFromStripe(
              subscription.id,
              subscription.customer as string,
              subscription.status,
              new Date(periodStart * 1000),
              new Date(periodEnd * 1000),
              subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
            );
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object;
            await handleSubscriptionDeleted(subscription.id);
            break;
          }

          case "invoice.payment_succeeded": {
            const invoice = event.data.object;
            console.log(`[Webhook] Invoice payment succeeded: ${invoice.id}`);
            // Subscription status handled by subscription.updated event
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object;
            console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);
            // Update subscription status to past_due via subscription.updated event
            break;
          }

          case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            console.log(`[Webhook] Payment intent succeeded: ${paymentIntent.id}`);
            // Escrow payments are handled client-side after confirmation
            break;
          }

          case "payment_intent.canceled": {
            const paymentIntent = event.data.object;
            console.log(`[Webhook] Payment intent canceled: ${paymentIntent.id}`);
            // Could update escrow status here if needed
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error(`[Webhook] Error handling event ${event.type}:`, err);
        // Return 200 to prevent Stripe from retrying
        return reply.status(200).send({ received: true, error: "Handler error" });
      }

      return reply.status(200).send({ received: true });
    }
  );
}
