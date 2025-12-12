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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-12" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="h-96 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success/Canceled Messages */}
      {success && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
          Welcome to Pro! Your subscription is now active.
        </div>
      )}
      {canceled && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-center">
          Checkout was canceled. You can try again when you&apos;re ready.
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {isPro ? "Your Pro Subscription" : "Upgrade to Pro"}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {isPro
            ? "You have access to all Pro features. Manage your subscription below."
            : "Unlock unlimited specific address alerts and more powerful features to find your perfect property."}
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Billing Period Toggle */}
      {pricing?.pro.yearlyEnabled && !isPro && (
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              {pricing && pricing.pro.yearlySavings > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Save {pricing.pro.yearlySavingsFormatted}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Free Tier */}
        <div className={`card border-2 ${!isPro ? "border-primary-500" : "border-gray-200"}`}>
          {!isPro && (
            <div className="bg-primary-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
              Current Plan
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Up to {pricing?.features.free.wantedAdLimit ?? 3} buyer interests</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Area alerts (suburb, city, region)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Basic match notifications</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 shrink-0 ${pricing?.features.free.specificAddressAlerts ? "text-green-500" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                {pricing?.features.free.specificAddressAlerts ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                )}
              </svg>
              <span className={pricing?.features.free.specificAddressAlerts ? "" : "text-gray-400"}>Specific address alerts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 shrink-0 ${pricing?.features.free.priorityNotifications ? "text-green-500" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                {pricing?.features.free.priorityNotifications ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                )}
              </svg>
              <span className={pricing?.features.free.priorityNotifications ? "" : "text-gray-400"}>Priority notifications</span>
            </li>
          </ul>
          {!isPro && (
            <button disabled className="btn-secondary w-full cursor-default">
              Current Plan
            </button>
          )}
        </div>

        {/* Pro Tier */}
        <div className={`card border-2 ${isPro ? "border-primary-500 ring-2 ring-primary-100" : "border-gray-200"}`}>
          {isPro && (
            <div className="bg-primary-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
              Current Plan
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
          <div className="mb-6">
            {billingPeriod === "yearly" && pricing?.pro.yearlyEnabled ? (
              <>
                <span className="text-4xl font-bold">{pricing.pro.yearlyMonthlyEquivalentFormatted}</span>
                <span className="text-gray-500">/month</span>
                <p className="text-sm text-gray-500 mt-1">
                  Billed as {pricing.pro.yearlyPriceFormatted}/year
                </p>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold">{pricing?.pro.monthlyPriceFormatted ?? "$19"}</span>
                <span className="text-gray-500">/month</span>
              </>
            )}
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>{pricing?.features.pro.wantedAdLimit === -1 ? "Unlimited" : pricing?.features.pro.wantedAdLimit}</strong> buyer interests</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Area alerts (suburb, city, region)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Specific address</strong> alerts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Priority</strong> notifications</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Early access to new properties</span>
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
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              What are specific address alerts?
            </h3>
            <p className="text-gray-600">
              With Pro, you can target specific property addresses you&apos;re interested in.
              When an owner of that exact property registers, you&apos;ll be the first to know.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600">
              Yes! You can cancel your Pro subscription at any time. You&apos;ll continue
              to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How do priority notifications work?
            </h3>
            <p className="text-gray-600">
              Pro members get notified first when a property matching their criteria
              becomes available, giving you a head start in contacting owners.
            </p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-8 text-center">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-12" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="h-96 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    }>
      <UpgradePageContent />
    </Suspense>
  );
}
