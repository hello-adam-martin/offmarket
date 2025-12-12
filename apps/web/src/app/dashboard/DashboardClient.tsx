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
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Pro Member
        </span>
        <span className="text-sm text-gray-500">Unlimited buyer interests & priority features</span>
      </div>
    );
  }

  // Free users - show upgrade encouragement
  const usagePercent = usage && !usage.isUnlimited && usage.limit > 0
    ? Math.round((usage.currentCount / usage.limit) * 100)
    : 0;

  return (
    <div className="card bg-gradient-to-r from-purple-50 via-primary-50 to-accent-50 border-purple-200 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Free Plan
            </span>
            {usage && !usage.isUnlimited && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                usage.remaining === 0
                  ? "bg-red-100 text-red-700"
                  : usage.remaining <= 1
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
              }`}>
                {usage.remaining === 0
                  ? "Ad limit reached"
                  : `${usage.remaining} ad${usage.remaining !== 1 ? "s" : ""} remaining`}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Upgrade to Pro for More
          </h2>
          <p className="text-gray-600 text-sm mb-3">
            Get unlimited buyer interests, target specific addresses, and receive priority notifications.
          </p>

          {/* Usage Progress Bar */}
          {usage && !usage.isUnlimited && usage.limit > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Interests Used</span>
                <span>{usage.currentCount} / {usage.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usagePercent >= 100
                      ? "bg-red-500"
                      : usagePercent >= 66
                        ? "bg-yellow-500"
                        : "bg-primary-500"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Pro Features List */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center text-gray-600">
              <svg className="w-4 h-4 text-primary-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Unlimited ads
            </span>
            <span className="flex items-center text-gray-600">
              <svg className="w-4 h-4 text-primary-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Specific address alerts
            </span>
            <span className="flex items-center text-gray-600">
              <svg className="w-4 h-4 text-primary-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
            className="text-sm text-primary-600 hover:text-primary-700 text-center lg:text-right"
          >
            View pricing details
          </Link>
        </div>
      </div>
    </div>
  );
}
