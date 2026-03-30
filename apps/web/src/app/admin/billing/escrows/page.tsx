"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface EscrowDeposit {
  id: string;
  propertyId: string;
  ownerId: string;
  buyerId: string;
  inquiryId: string | null;
  amount: number;
  status: "PENDING" | "HELD" | "RELEASED" | "REFUNDED" | "EXPIRED";
  stripePaymentId: string;
  expiresAt: string;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  buyer: {
    id: string;
    name: string | null;
  };
  property: {
    id: string;
    address: string;
  };
}

const ESCROW_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: "Pending", badgeClass: "badge-warning" },
  HELD: { label: "Held", badgeClass: "badge-info" },
  RELEASED: { label: "Released", badgeClass: "badge-success" },
  REFUNDED: { label: "Refunded", badgeClass: "badge-neutral" },
  EXPIRED: { label: "Expired", badgeClass: "badge-error" },
};

export default function EscrowsPage() {
  const { data: session } = useSession();
  const [escrows, setEscrows] = useState<EscrowDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (session) {
      fetchEscrows();
    }
  }, [session, page, filter]);

  const fetchEscrows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/escrows?${params}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setEscrows(data.data.escrows);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch escrows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (escrowId: string, action: "release" | "refund") => {
    setActionLoading(escrowId);
    setActionResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/escrows/${escrowId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setActionResult({
          type: "success",
          message: `Escrow ${action === "release" ? "released" : "refunded"} successfully`,
        });
        fetchEscrows();
      } else {
        setActionResult({
          type: "error",
          message: data.error?.message || `Failed to ${action} escrow`,
        });
      }
    } catch {
      setActionResult({
        type: "error",
        message: "An error occurred",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
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
          <h1 className="text-xl font-display font-semibold text-text-base">Escrow Deposits</h1>
        </div>
      </div>

      {actionResult && (
        <div
          className={`card border-l-4 ${
            actionResult.type === "success"
              ? "border-success"
              : "border-error"
          }`}
        >
          <p className="text-sm text-text-base">{actionResult.message}</p>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="HELD">Held</option>
            <option value="RELEASED">Released</option>
            <option value="REFUNDED">Refunded</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Escrows Table */}
      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-surface-raised rounded animate-pulse" />
            ))}
          </div>
        ) : escrows.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            No escrow deposits found
          </div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Buyer
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {escrows.map((escrow) => (
                <tr key={escrow.id} className="hover:bg-surface-raised transition-colors">
                  <td className="px-6 py-4 text-sm text-text-base">
                    <p className="font-medium text-text-base truncate max-w-xs">
                      {escrow.property.address}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-base">
                    <div>
                      <p className="font-medium text-text-base">
                        {escrow.owner.name || "—"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {escrow.owner.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-base">
                    <p className="font-medium text-text-base">
                      {escrow.buyer.name || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-text-base tabular-nums">
                    ${(escrow.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-base">
                    <span className={ESCROW_STATUS_LABELS[escrow.status]?.badgeClass || "badge-neutral"}>
                      {ESCROW_STATUS_LABELS[escrow.status]?.label || escrow.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
                    <div>
                      <p
                        className={
                          isExpiringSoon(escrow.expiresAt)
                            ? "text-warning font-medium"
                            : "text-text-secondary"
                        }
                      >
                        {formatDate(escrow.expiresAt)}
                      </p>
                      {isExpiringSoon(escrow.expiresAt) &&
                        escrow.status === "HELD" && (
                          <p className="text-xs text-warning">
                            Expiring soon
                          </p>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-base">
                    <div className="flex items-center gap-2">
                      {escrow.status === "HELD" && (
                        <>
                          <button
                            onClick={() => handleAction(escrow.id, "release")}
                            disabled={actionLoading === escrow.id}
                            className="btn-secondary btn-sm disabled:opacity-50"
                          >
                            {actionLoading === escrow.id
                              ? "..."
                              : "Release"}
                          </button>
                          <button
                            onClick={() => handleAction(escrow.id, "refund")}
                            disabled={actionLoading === escrow.id}
                            className="btn-destructive btn-sm disabled:opacity-50"
                          >
                            {actionLoading === escrow.id
                              ? "..."
                              : "Refund"}
                          </button>
                        </>
                      )}
                      {escrow.inquiryId && (
                        <Link
                          href={`/inquiries/${escrow.inquiryId}`}
                          className="btn-secondary btn-sm"
                        >
                          View Inquiry
                        </Link>
                      )}
                      {escrow.stripePaymentId && (
                        <a
                          href={`https://dashboard.stripe.com/payments/${escrow.stripePaymentId}`}
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

      {/* Legend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-text-base mb-3">
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="badge-warning">PENDING</span>
            <span className="text-text-secondary">Payment initiated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-info">HELD</span>
            <span className="text-text-secondary">Payment captured, awaiting outcome</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-success">RELEASED</span>
            <span className="text-text-secondary">Payment sent to platform</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-neutral">REFUNDED</span>
            <span className="text-text-secondary">Payment returned to owner</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-error">EXPIRED</span>
            <span className="text-text-secondary">Auto-refunded after 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
