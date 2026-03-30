"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SubscriptionInfo {
  tier: "FREE" | "PRO";
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
  currentPeriodEnd: string | null;
}

interface UsageInfo {
  currentCount: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
}

export function DashboardClient() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [subRes, usageRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscription`, {
          headers: { Authorization: `Bearer ${(session as any)?.apiToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wanted-ads/usage`, {
          headers: { Authorization: `Bearer ${(session as any)?.apiToken}` },
        }),
      ]);

      const [subData, usageData] = await Promise.all([subRes.json(), usageRes.json()]);

      if (subData.success) setSubscription(subData.data);
      if (usageData.success) setUsage(usageData.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  const isPro = subscription?.tier === "PRO" && subscription?.status === "ACTIVE";

  // Pro users - show a subtle status badge
  if (isPro) {
    return (
      <div className="mb-6 flex items-center gap-2">
        <span className="badge-info">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Pro Member
        </span>
        <span className="text-sm text-secondary">Unlimited buyer interests & priority features</span>
      </div>
    );
  }

  // Free users - show upgrade encouragement
  const usagePercent = usage && !usage.isUnlimited && usage.limit > 0
    ? Math.round((usage.currentCount / usage.limit) * 100)
    : 0;

  return (
    <div className="card border-l-4 border-accent mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neutral">Free Plan</span>
            {usage && !usage.isUnlimited && (
              <span className={
                usage.remaining === 0
                  ? "badge-error"
                  : usage.remaining <= 1
                    ? "badge-warning"
                    : "badge-neutral"
              }>
                {usage.remaining === 0
                  ? "Ad limit reached"
                  : `${usage.remaining} ad${usage.remaining !== 1 ? "s" : ""} remaining`}
              </span>
            )}
          </div>
          <h2 className="text-xl font-display font-semibold text-primary mb-1">
            You&apos;re on the Free Plan
          </h2>
          <p className="text-secondary text-sm mb-3">
            Upgrade to Pro for unlimited ads and priority matching.
          </p>

          {/* Usage Progress Bar */}
          {usage && !usage.isUnlimited && usage.limit > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted mb-1 tabular-nums">
                <span>Interests Used</span>
                <span>{usage.currentCount} / {usage.limit}</span>
              </div>
              <div className="w-full bg-surface-raised h-2 rounded-full">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usagePercent >= 100
                      ? "bg-error"
                      : usagePercent >= 66
                        ? "bg-warning"
                        : "bg-accent"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Pro Features List */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center text-secondary">
              <svg className="w-4 h-4 text-accent mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Unlimited ads
            </span>
            <span className="flex items-center text-secondary">
              <svg className="w-4 h-4 text-accent mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Specific address alerts
            </span>
            <span className="flex items-center text-secondary">
              <svg className="w-4 h-4 text-accent mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Priority notifications
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:text-right">
          <Link
            href="/upgrade"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Upgrade to Pro
          </Link>
          <Link
            href="/upgrade"
            className="text-sm text-accent hover:text-accent-hover text-center lg:text-right"
          >
            View pricing details
          </Link>
        </div>
      </div>
    </div>
  );
}
