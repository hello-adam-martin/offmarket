"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface SubscriptionStatus {
  tier: "FREE" | "PRO";
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
  currentPeriodEnd: string | null;
}

interface SubscriptionFeatures {
  wantedAdLimit: number;
  specificAddressAlerts: boolean;
  priorityNotifications: boolean;
  earlyAccess: boolean;
  savedSearchLimit: number;
  matchNotifications: boolean;
  directMessaging: boolean;
}

interface PricingInfo {
  pro: {
    monthlyPrice: number;
    monthlyPriceFormatted: string;
    yearlyPrice: number;
    yearlyPriceFormatted: string;
    yearlyEnabled: boolean;
    yearlyMonthlyEquivalent: number;
    yearlyMonthlyEquivalentFormatted: string;
    yearlySavings: number;
    yearlySavingsFormatted: string;
  };
  features: {
    free: SubscriptionFeatures;
    pro: SubscriptionFeatures;
  };
  currency: string;
}

function UpgradePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    // Fetch pricing (no auth needed)
    fetchPricing();

    if (status === "authenticated" && session) {
      fetchSubscription();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const fetchPricing = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/pricing`
      );
      const data = await response.json();
      if (data.success) {
        setPricing(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch pricing:", err);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscription`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/upgrade");
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({
            successUrl: `${window.location.origin}/upgrade?success=true`,
            cancelUrl: `${window.location.origin}/upgrade?canceled=true`,
            billingPeriod: pricing?.pro.yearlyEnabled ? billingPeriod : "monthly",
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error?.message || "Failed to start checkout");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/portal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({
            returnUrl: `${window.location.origin}/upgrade`,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error?.message || "Failed to open billing portal");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  const isPro = subscription?.tier === "PRO" && subscription?.status === "ACTIVE";

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-7 bg-surface-raised rounded w-1/3 mb-3" />
          <div className="h-4 bg-surface-raised rounded w-2/3 mb-10" />
          <div className="h-6 bg-surface-raised rounded w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-96 bg-surface-raised rounded-lg" />
            <div className="h-96 bg-surface-raised rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 py-12">
      {/* Alert Banners */}
      {success && (
        <div className="mb-8 p-4 bg-success-light border border-success text-success rounded-md">
          You&apos;re now on the Pro plan. All features are active.
        </div>
      )}
      {canceled && (
        <div className="mb-8 p-4 bg-secondary-light border border-warning text-warning rounded-md">
          Upgrade was not completed. Your plan has not changed.
        </div>
      )}
      {error && (
        <div className="mb-8 p-4 bg-error-light border border-error text-error rounded-md">
          Something went wrong with your upgrade. Contact support if this continues.
        </div>
      )}

      {/* Page Header — left-aligned per D-01 */}
      <div className="mb-8">
        <h1 className="text-xl font-display font-semibold text-primary">
          {isPro ? "Your Pro Subscription" : "Upgrade to Pro"}
        </h1>
        <p className="mt-2 text-secondary">
          {isPro
            ? "You have access to all Pro features. Manage your subscription below."
            : "Unlock unlimited specific address alerts and more powerful features to find your perfect property."}
        </p>
      </div>

      {/* Billing Period Toggle — per D-02 */}
      {pricing?.pro.yearlyEnabled && !isPro && (
        <div className="mb-8">
          <div className="bg-surface-raised rounded-md p-1 inline-flex">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-surface text-accent font-medium shadow-sm"
                  : "text-secondary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 text-sm rounded-sm transition-colors flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-surface text-accent font-medium shadow-sm"
                  : "text-secondary"
              }`}
            >
              Yearly
              {pricing && pricing.pro.yearlySavings > 0 && (
                <span className="badge-success">
                  Save {pricing.pro.yearlySavingsFormatted}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards — two-column grid at md+ per D-04 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Free Tier */}
        <div className="card">
          {!isPro && (
            <span className="badge-neutral mb-4 inline-flex">Current Plan</span>
          )}
          <h2 className="text-xl font-display font-semibold text-primary mb-2">Free</h2>
          <div className="mb-6">
            <span className="text-4xl tabular-nums font-bold text-primary">$0</span>
            <span className="text-secondary">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary">Up to {pricing?.features.free.wantedAdLimit ?? 3} buyer interests</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary">Area alerts (suburb, city, region)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary">Basic match notifications</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 shrink-0 ${pricing?.features.free.specificAddressAlerts ? "text-accent" : "text-muted"}`} fill="currentColor" viewBox="0 0 20 20">
                {pricing?.features.free.specificAddressAlerts ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                )}
              </svg>
              <span className={pricing?.features.free.specificAddressAlerts ? "text-primary" : "text-muted"}>Specific address alerts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 shrink-0 ${pricing?.features.free.priorityNotifications ? "text-accent" : "text-muted"}`} fill="currentColor" viewBox="0 0 20 20">
                {pricing?.features.free.priorityNotifications ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                )}
              </svg>
              <span className={pricing?.features.free.priorityNotifications ? "text-primary" : "text-muted"}>Priority notifications</span>
            </li>
          </ul>
          {!isPro && (
            <button disabled className="btn-secondary w-full cursor-default">
              Current Plan
            </button>
          )}
        </div>

        {/* Pro Tier — border-2 border-accent per D-04 */}
        <div className="card border-2 border-accent">
          <div className="flex items-center justify-between mb-4">
            {isPro ? (
              <span className="badge-info">Current Plan</span>
            ) : (
              <span className="badge-info">Recommended</span>
            )}
          </div>
          <h2 className="text-xl font-display font-semibold text-primary mb-2">Pro</h2>
          <div className="mb-6">
            {billingPeriod === "yearly" && pricing?.pro.yearlyEnabled ? (
              <>
                <span className="text-4xl tabular-nums font-bold text-primary">{pricing.pro.yearlyMonthlyEquivalentFormatted}</span>
                <span className="text-secondary">/month</span>
                <p className="text-sm text-secondary mt-1">
                  Billed as {pricing.pro.yearlyPriceFormatted}/year
                </p>
              </>
            ) : (
              <>
                <span className="text-4xl tabular-nums font-bold text-primary">{pricing?.pro.monthlyPriceFormatted ?? "$19"}</span>
                <span className="text-secondary">/month</span>
              </>
            )}
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary"><strong>{pricing?.features.pro.wantedAdLimit === -1 ? "Unlimited" : pricing?.features.pro.wantedAdLimit}</strong> buyer interests</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary">Area alerts (suburb, city, region)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary"><strong>Specific address</strong> alerts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary"><strong>Priority</strong> notifications</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary">Early access to new properties</span>
            </li>
          </ul>
          {isPro ? (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="btn-secondary w-full"
            >
              {portalLoading ? "Loading..." : "Manage Subscription"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="btn-primary w-full"
            >
              {checkoutLoading ? "Loading..." : `Upgrade to Pro${billingPeriod === "yearly" && pricing?.pro.yearlyEnabled ? " (Yearly)" : ""}`}
            </button>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card">
        <h2 className="text-xl font-display font-semibold text-primary mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-primary mb-2">
              What are specific address alerts?
            </h3>
            <p className="text-secondary">
              With Pro, you can target specific property addresses you&apos;re interested in.
              When an owner of that exact property registers, you&apos;ll be the first to know.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-primary mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-secondary">
              Yes! You can cancel your Pro subscription at any time. You&apos;ll continue
              to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-primary mb-2">
              How do priority notifications work?
            </h3>
            <p className="text-secondary">
              Pro members get notified first when a property matching their criteria
              becomes available, giving you a head start in contacting owners.
            </p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/dashboard" className="text-accent hover:text-accent-hover">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="max-w-content mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-7 bg-surface-raised rounded w-1/3 mb-3" />
          <div className="h-4 bg-surface-raised rounded w-2/3 mb-10" />
          <div className="h-6 bg-surface-raised rounded w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-96 bg-surface-raised rounded-lg" />
            <div className="h-96 bg-surface-raised rounded-lg" />
          </div>
        </div>
      </div>
    }>
      <UpgradePageContent />
    </Suspense>
  );
}
