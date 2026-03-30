"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface BillingStats {
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
    pastDue: number;
  };
  revenue: {
    monthly: number;
    total: number;
  };
  escrow: {
    total: number;
    pending: number;
    held: number;
    released: number;
    refunded: number;
    expired: number;
    totalValue: number;
    heldValue: number;
  };
}

export default function BillingDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/stats`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch billing stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExpired = async () => {
    setProcessing(true);
    setProcessResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/process-expired-escrows`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setProcessResult({
          type: "success",
          message: `Processed ${data.data.processed} escrows, refunded ${data.data.refunded}.`,
        });
        fetchStats();
      } else {
        setProcessResult({
          type: "error",
          message: data.error?.message || "Failed to process expired escrows",
        });
      }
    } catch {
      setProcessResult({
        type: "error",
        message: "An error occurred while processing",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-display font-semibold text-text-base">Billing Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-24 bg-surface-raised rounded mb-2" />
              <div className="h-8 w-16 bg-surface-raised rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-text-base">Billing Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/billing/settings"
            className="btn-secondary"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </span>
          </Link>
          <Link
            href="/admin/billing/subscriptions"
            className="btn-primary"
          >
            Manage Subscriptions
          </Link>
          <Link
            href="/admin/billing/escrows"
            className="btn-primary"
          >
            Manage Escrows
          </Link>
        </div>
      </div>

      {/* Subscriptions Stats */}
      <div>
        <h2 className="text-lg font-semibold text-text-base mb-4">
          Subscriptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card border-l-4 border-accent">
            <p className="text-sm text-text-secondary mb-1">Total Subscriptions</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.subscriptions.total || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary mb-1">Active</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.subscriptions.active || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary mb-1">Past Due</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.subscriptions.pastDue || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary mb-1">Canceled</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.subscriptions.canceled || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-lg font-semibold text-text-base mb-4">Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-sm text-text-secondary mb-1">Monthly Recurring</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              ${((stats?.revenue.monthly || 0) / 100).toFixed(2)}
              <span className="text-base text-text-secondary font-normal"> NZD</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Based on active Pro subscriptions
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary mb-1">Total Escrow Released</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              ${((stats?.revenue.total || 0) / 100).toFixed(2)}
              <span className="text-base text-text-secondary font-normal"> NZD</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              From completed finder&apos;s fees
            </p>
          </div>
        </div>
      </div>

      {/* Escrow Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-base">
            Escrow Deposits
          </h2>
          <button
            onClick={handleProcessExpired}
            disabled={processing}
            className="btn-primary disabled:opacity-50"
          >
            {processing ? "Processing..." : "Process Expired"}
          </button>
        </div>

        {processResult && (
          <div
            className={`card mb-4 ${
              processResult.type === "success"
                ? "border-l-4 border-success"
                : "border-l-4 border-error"
            }`}
          >
            <p className="text-sm text-text-base">{processResult.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card">
            <p className="text-xs text-text-secondary mb-1">Total</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.escrow.total || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-text-secondary mb-1">Pending</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.escrow.pending || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-text-secondary mb-1">Held</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.escrow.held || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-text-secondary mb-1">Released</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.escrow.released || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-text-secondary mb-1">Refunded</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.escrow.refunded || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-text-secondary mb-1">Expired</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stats?.escrow.expired || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="card">
            <p className="text-sm text-text-secondary mb-1">Total Escrow Value</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              ${((stats?.escrow.totalValue || 0) / 100).toFixed(2)}
              <span className="text-base text-text-secondary font-normal"> NZD</span>
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary mb-1">Currently Held</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              ${((stats?.escrow.heldValue || 0) / 100).toFixed(2)}
              <span className="text-base text-text-secondary font-normal"> NZD</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Pending release or refund
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-base mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/billing/subscriptions"
            className="card hover:bg-surface-raised transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-base">View Subscriptions</p>
                <p className="text-sm text-text-secondary">
                  Manage user Pro subscriptions
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/billing/escrows"
            className="card hover:bg-surface-raised transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-base">View Escrows</p>
                <p className="text-sm text-text-secondary">
                  Manage finder&apos;s fee deposits
                </p>
              </div>
            </div>
          </Link>

          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="card hover:bg-surface-raised transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-base">Stripe Dashboard</p>
                <p className="text-sm text-text-secondary">
                  Open Stripe for detailed reports
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
