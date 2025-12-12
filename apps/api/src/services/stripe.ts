import Stripe from "stripe";
import { db } from "@offmarket/database";

// Initialize Stripe with optional API key (allows graceful degradation in dev)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Subscription feature type
export interface SubscriptionFeatures {
  wantedAdLimit: number; // -1 = unlimited
  specificAddressLimit: number; // -1 = unlimited, 0 = none
  priorityNotifications: boolean;
  earlyAccess: boolean;
  savedSearchLimit: number; // -1 = unlimited
  matchNotifications: boolean;
  directMessaging: boolean;
  postcardEnabled: boolean;
  postcardFreeMonthly: number; // Free postcards per month
}

// Default billing settings
const DEFAULT_SETTINGS = {
  proMonthlyPrice: 1900, // $19.00
  proYearlyPrice: 19000, // $190.00 (2 months free)
  proYearlyEnabled: false,
  escrowFeeStandard: 29900,
  escrowFeePremium: 49900,
  escrowFeeLuxury: 79900,
  premiumThreshold: 1000000,
  luxuryThreshold: 2000000,
  escrowExpiryDays: 30,
  // Postcard settings
  postcardCost: 1500, // $15.00 per additional postcard
  postcardRateLimitDays: 90, // Minimum days between postcards to same address
  freeFeatures: {
    wantedAdLimit: 3,
    specificAddressLimit: 1, // Free users get 1 specific address interest
    priorityNotifications: false,
    earlyAccess: false,
    savedSearchLimit: 5,
    matchNotifications: true,
    directMessaging: true,
    postcardEnabled: false,
    postcardFreeMonthly: 0,
  } as SubscriptionFeatures,
  proFeatures: {
    wantedAdLimit: -1,
    specificAddressLimit: -1, // Pro users get unlimited
    priorityNotifications: true,
    earlyAccess: true,
    savedSearchLimit: -1,
    matchNotifications: true,
    directMessaging: true,
    postcardEnabled: true,
    postcardFreeMonthly: 1,
  } as SubscriptionFeatures,
};

// Cache for billing settings
let settingsCache: typeof DEFAULT_SETTINGS | null = null;
let settingsCacheTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * Get billing settings from database with caching
 */
export async function getBillingSettings(): Promise<typeof DEFAULT_SETTINGS> {
  const now = Date.now();
  if (settingsCache && now - settingsCacheTime < CACHE_TTL_MS) {
    return settingsCache;
  }

  const settings = await db.systemSetting.findMany({
    where: {
      key: { startsWith: "billing." },
    },
  });

  const result = { ...DEFAULT_SETTINGS };
  for (const setting of settings) {
    const key = setting.key.replace("billing.", "") as keyof typeof DEFAULT_SETTINGS;
    if (key in result) {
      try {
        (result as any)[key] = JSON.parse(setting.value);
      } catch {
        // Ignore parse errors, use default
      }
    }
  }

  settingsCache = result;
  settingsCacheTime = now;
  return result;
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearBillingSettingsCache(): void {
  settingsCache = null;
  settingsCacheTime = 0;
}

/**
 * Get subscription features for a specific tier
 */
export async function getSubscriptionFeatures(
  tier: "FREE" | "PRO"
): Promise<SubscriptionFeatures> {
  const settings = await getBillingSettings();
  return tier === "PRO" ? settings.proFeatures : settings.freeFeatures;
}

/**
 * Check if a user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof SubscriptionFeatures
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  const features = await getSubscriptionFeatures(subscription.tier);

  const featureValue = features[feature];
  if (typeof featureValue === "boolean") {
    return featureValue;
  }
  // For numeric limits, return true if not 0
  return featureValue !== 0;
}

/**
 * Get the limit for a numeric feature (-1 means unlimited)
 */
export async function getFeatureLimit(
  userId: string,
  feature: "wantedAdLimit" | "savedSearchLimit" | "specificAddressLimit"
): Promise<number> {
  const subscription = await getUserSubscription(userId);
  const features = await getSubscriptionFeatures(subscription.tier);
  return features[feature];
}

/**
 * Get postcard allowance for a user
 * Returns remaining free postcards and cost for additional
 */
export async function getPostcardAllowance(userId: string): Promise<{
  postcardEnabled: boolean;
  freeMonthly: number;
  usedThisMonth: number;
  freeRemaining: number;
  extraCost: number;
}> {
  const subscription = await getUserSubscription(userId);
  const features = await getSubscriptionFeatures(subscription.tier);
  const settings = await getBillingSettings();

  // Get buyer profile
  const buyerProfile = await db.buyerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!buyerProfile) {
    return {
      postcardEnabled: false,
      freeMonthly: 0,
      usedThisMonth: 0,
      freeRemaining: 0,
      extraCost: settings.postcardCost,
    };
  }

  // Count postcards sent this month (free ones only)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usedThisMonth = await db.postcardRequest.count({
    where: {
      buyerId: buyerProfile.id,
      costInCents: 0, // Only count free postcards
      createdAt: { gte: startOfMonth },
      status: { not: "REJECTED" }, // Don't count rejected ones
    },
  });

  const freeRemaining = Math.max(0, features.postcardFreeMonthly - usedThisMonth);

  return {
    postcardEnabled: features.postcardEnabled,
    freeMonthly: features.postcardFreeMonthly,
    usedThisMonth,
    freeRemaining,
    extraCost: settings.postcardCost,
  };
}

/**
 * Check if a postcard can be sent to an address (rate limiting)
 */
export async function canSendPostcardToAddress(
  buyerId: string,
  targetAddressId: string
): Promise<{ allowed: boolean; reason?: string; nextAllowedDate?: Date }> {
  const settings = await getBillingSettings();

  // Check for existing postcard to this address
  const existingPostcard = await db.postcardRequest.findFirst({
    where: {
      buyerId,
      targetAddressId,
      status: { not: "REJECTED" },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingPostcard) {
    const daysSinceLast = Math.floor(
      (Date.now() - existingPostcard.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLast < settings.postcardRateLimitDays) {
      const nextAllowedDate = new Date(existingPostcard.createdAt);
      nextAllowedDate.setDate(nextAllowedDate.getDate() + settings.postcardRateLimitDays);
      return {
        allowed: false,
        reason: `You can only send a postcard to the same address every ${settings.postcardRateLimitDays} days`,
        nextAllowedDate,
      };
    }
  }

  return { allowed: true };
}

/**
 * Create a PaymentIntent for postcard payment
 */
export async function createPostcardPayment(
  customerId: string,
  metadata: {
    buyerId: string;
    wantedAdId: string;
    targetAddressId: string;
  }
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  if (!stripe) {
    console.log("[Stripe] Not configured, skipping postcard payment creation");
    return null;
  }

  const settings = await getBillingSettings();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: settings.postcardCost,
      currency: "nzd",
      customer: customerId,
      metadata,
      description: "OffMarket NZ - Postcard Direct Mail",
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("[Stripe] Failed to create postcard payment:", error);
    throw error;
  }
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string | null> {
  if (!stripe) {
    console.log("[Stripe] Not configured, skipping customer creation");
    return null;
  }

  // Check if user already has a Stripe customer ID
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { userId },
    });

    // Save customer ID to database
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    console.log(`[Stripe] Created customer ${customer.id} for user ${userId}`);
    return customer.id;
  } catch (error) {
    console.error("[Stripe] Failed to create customer:", error);
    throw error;
  }
}

/**
 * Create a Stripe Checkout session for Pro subscription
 */
export async function createSubscriptionCheckout(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  billingPeriod: "monthly" | "yearly" = "monthly"
): Promise<string | null> {
  if (!stripe) {
    console.log("[Stripe] Not configured, skipping checkout creation");
    return null;
  }

  // Get the appropriate price ID based on billing period
  const priceId = billingPeriod === "yearly"
    ? process.env.STRIPE_PRO_YEARLY_PRICE_ID
    : process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    throw new Error(`STRIPE_PRO_${billingPeriod === "yearly" ? "YEARLY_" : ""}PRICE_ID not configured`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { customerId, billingPeriod },
      },
    });

    return session.url;
  } catch (error) {
    console.error("[Stripe] Failed to create checkout session:", error);
    throw error;
  }
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string | null> {
  if (!stripe) {
    console.log("[Stripe] Not configured, skipping portal creation");
    return null;
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error("[Stripe] Failed to create portal session:", error);
    throw error;
  }
}

/**
 * Calculate escrow fee based on property value (async to use db settings)
 */
export async function calculateEscrowFee(propertyValue?: number | null): Promise<number> {
  const settings = await getBillingSettings();

  if (!propertyValue) {
    return settings.escrowFeeStandard;
  }

  if (propertyValue >= settings.luxuryThreshold) {
    return settings.escrowFeeLuxury;
  }

  if (propertyValue >= settings.premiumThreshold) {
    return settings.escrowFeePremium;
  }

  return settings.escrowFeeStandard;
}

/**
 * Get fee tier name for display (async to use db settings)
 */
export async function getFeeTierName(propertyValue?: number | null): Promise<string> {
  const settings = await getBillingSettings();

  if (!propertyValue) {
    return "Standard";
  }

  if (propertyValue >= settings.luxuryThreshold) {
    return "Luxury";
  }

  if (propertyValue >= settings.premiumThreshold) {
    return "Premium";
  }

  return "Standard";
}

/**
 * Create a PaymentIntent for escrow deposit
 */
export async function createEscrowPayment(
  customerId: string,
  amount: number,
  metadata: {
    ownerId: string;
    propertyId: string;
    buyerId: string;
  }
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  if (!stripe) {
    console.log("[Stripe] Not configured, skipping escrow payment creation");
    return null;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "nzd",
      customer: customerId,
      metadata,
      // Capture manually to hold funds in escrow
      capture_method: "manual",
      description: "OffMarket NZ - Finder's Fee Deposit",
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("[Stripe] Failed to create escrow payment:", error);
    throw error;
  }
}

/**
 * Capture a held payment (release escrow to platform)
 */
export async function captureEscrowPayment(paymentIntentId: string): Promise<boolean> {
  if (!stripe) {
    console.log("[Stripe] Not configured, skipping escrow capture");
    return false;
  }

  try {
    await stripe.paymentIntents.capture(paymentIntentId);
    console.log(`[Stripe] Captured payment ${paymentIntentId}`);
    return true;
  } catch (error) {
    console.error("[Stripe] Failed to capture payment:", error);
    throw error;
  }
}

/**
 * Cancel a held payment (refund escrow to owner)
 */
export async function cancelEscrowPayment(paymentIntentId: string): Promise<boolean> {
  if (!stripe) {
    console.log("[Stripe] Not configured, skipping escrow cancellation");
    return false;
  }

  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    console.log(`[Stripe] Cancelled payment ${paymentIntentId}`);
    return true;
  } catch (error) {
    console.error("[Stripe] Failed to cancel payment:", error);
    throw error;
  }
}

/**
 * Create an EscrowDeposit record after successful payment authorization
 */
export async function createEscrowDeposit(params: {
  ownerId: string;
  propertyId: string;
  buyerId: string;
  amount: number;
  stripePaymentId: string;
}): Promise<string> {
  const settings = await getBillingSettings();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + settings.escrowExpiryDays);

  const deposit = await db.escrowDeposit.create({
    data: {
      ownerId: params.ownerId,
      propertyId: params.propertyId,
      buyerId: params.buyerId,
      amount: params.amount,
      stripePaymentId: params.stripePaymentId,
      status: "HELD",
      expiresAt,
    },
  });

  console.log(`[Escrow] Created deposit ${deposit.id} for owner ${params.ownerId}`);
  return deposit.id;
}

/**
 * Link an inquiry to an escrow deposit
 */
export async function linkEscrowToInquiry(
  escrowId: string,
  inquiryId: string
): Promise<void> {
  await db.escrowDeposit.update({
    where: { id: escrowId },
    data: { inquiryId },
  });

  console.log(`[Escrow] Linked escrow ${escrowId} to inquiry ${inquiryId}`);
}

/**
 * Release escrow funds (deal completed)
 */
export async function releaseEscrow(escrowId: string): Promise<void> {
  const escrow = await db.escrowDeposit.findUnique({
    where: { id: escrowId },
  });

  if (!escrow || escrow.status !== "HELD") {
    console.warn(`[Escrow] Cannot release escrow ${escrowId}: invalid status`);
    return;
  }

  // Capture the payment
  if (escrow.stripePaymentId) {
    await captureEscrowPayment(escrow.stripePaymentId);
  }

  // Update status
  await db.escrowDeposit.update({
    where: { id: escrowId },
    data: {
      status: "RELEASED",
      releasedAt: new Date(),
    },
  });

  console.log(`[Escrow] Released deposit ${escrowId}`);
}

/**
 * Refund escrow funds (deal declined or expired)
 */
export async function refundEscrow(
  escrowId: string,
  reason: "REFUNDED" | "EXPIRED" = "REFUNDED"
): Promise<void> {
  const escrow = await db.escrowDeposit.findUnique({
    where: { id: escrowId },
  });

  if (!escrow || escrow.status !== "HELD") {
    console.warn(`[Escrow] Cannot refund escrow ${escrowId}: invalid status`);
    return;
  }

  // Cancel the payment intent (releases the hold)
  if (escrow.stripePaymentId) {
    await cancelEscrowPayment(escrow.stripePaymentId);
  }

  // Update status
  await db.escrowDeposit.update({
    where: { id: escrowId },
    data: {
      status: reason,
      refundedAt: new Date(),
    },
  });

  console.log(`[Escrow] Refunded deposit ${escrowId} (${reason})`);
}

/**
 * Check if owner has an existing escrow for a buyer
 */
export async function getExistingEscrow(
  ownerId: string,
  propertyId: string,
  buyerId: string
): Promise<{ id: string; status: string } | null> {
  const escrow = await db.escrowDeposit.findFirst({
    where: {
      ownerId,
      propertyId,
      buyerId,
      status: { in: ["HELD", "PENDING"] },
    },
    select: { id: true, status: true },
  });

  return escrow;
}

/**
 * Get user's subscription status
 */
export async function getUserSubscription(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    // Return default free tier
    return {
      tier: "FREE" as const,
      status: "ACTIVE" as const,
      currentPeriodEnd: null,
    };
  }

  return {
    tier: subscription.tier,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
}

/**
 * Create or update subscription from Stripe webhook
 */
export async function syncSubscriptionFromStripe(
  stripeSubscriptionId: string,
  customerId: string,
  status: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  canceledAt?: Date | null
): Promise<void> {
  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.warn(`[Stripe] No user found for customer ${customerId}`);
    return;
  }

  // Map Stripe status to our status
  const mappedStatus = mapStripeStatus(status);

  await db.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeSubscriptionId,
      tier: "PRO",
      status: mappedStatus,
      currentPeriodStart,
      currentPeriodEnd,
      canceledAt,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId,
      tier: "PRO",
      status: mappedStatus,
      currentPeriodStart,
      currentPeriodEnd,
      canceledAt,
    },
  });

  console.log(`[Stripe] Synced subscription for user ${user.id}: ${mappedStatus}`);
}

/**
 * Handle subscription cancellation/deletion
 */
export async function handleSubscriptionDeleted(
  stripeSubscriptionId: string
): Promise<void> {
  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!subscription) {
    console.warn(`[Stripe] No subscription found for ${stripeSubscriptionId}`);
    return;
  }

  // Downgrade to free tier
  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      tier: "FREE",
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });

  console.log(`[Stripe] Subscription ${stripeSubscriptionId} canceled`);
}

/**
 * Map Stripe subscription status to our enum
 */
function mapStripeStatus(stripeStatus: string): "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}
