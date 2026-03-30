"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  tier: "FREE" | "PRO";
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  ACTIVE: { label: "Active", badgeClass: "badge-success" },
  CANCELED: { label: "Canceled", badgeClass: "badge-neutral" },
  PAST_DUE: { label: "Past Due", badgeClass: "badge-error" },
  TRIALING: { label: "Trialing", badgeClass: "badge-info" },
  INCOMPLETE: { label: "Incomplete", badgeClass: "badge-warning" },
};

const TIER_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PRO: { label: "Pro", badgeClass: "badge-info" },
  FREE: { label: "Free", badgeClass: "badge-neutral" },
};

export default function SubscriptionsPage() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (session) {
      fetchSubscriptions();
    }
  }, [session, page, filter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (filter !== "all") {
        params.append("status", filter);
      }
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/subscriptions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.data.subscriptions);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/billing"
            className="text-text-secondary hover:text-text-base"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-display font-semibold text-text-base">Subscriptions</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or name..."
                className="input pl-10"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELED">Canceled</option>
            <option value="INCOMPLETE">Incomplete</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-surface-raised rounded animate-pulse" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            No subscriptions found
          </div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Period End
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-surface-raised transition-colors">
                  <td className="px-6 py-4 text-sm text-text-base">
                    <div>
                      <p className="font-medium text-text-base">
                        {sub.user.name || "—"}
                      </p>
                      <p className="text-sm text-text-secondary">{sub.user.email}</p>
                      {sub.stripeCustomerId && (
                        <p className="text-xs text-text-muted font-mono tabular-nums mt-0.5">
                          {sub.stripeCustomerId}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-base">
                    <span className={TIER_LABELS[sub.tier]?.badgeClass || "badge-neutral"}>
                      {TIER_LABELS[sub.tier]?.label || sub.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-base">
                    <span className={STATUS_LABELS[sub.status]?.badgeClass || "badge-neutral"}>
                      {STATUS_LABELS[sub.status]?.label || sub.status}
                    </span>
                    {sub.cancelAtPeriodEnd && (
                      <span className="ml-2 text-xs text-error">
                        Canceling
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
                    {formatDate(sub.currentPeriodEnd)}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
                    {formatDate(sub.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-base">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users?id=${sub.userId}`}
                        className="btn-secondary btn-sm"
                      >
                        View User
                      </Link>
                      {sub.stripeSubscriptionId && (
                        <a
                          href={`https://dashboard.stripe.com/subscriptions/${sub.stripeSubscriptionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary btn-sm"
                        >
                          Stripe
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary tabular-nums">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
