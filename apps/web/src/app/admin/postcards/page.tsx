"use client";

import { useState, useEffect, Fragment } from "react";
import { useSession } from "next-auth/react";
import { Dialog, Transition } from "@headlessui/react";
import { formatRelativeTime } from "@offmarket/utils";

interface Postcard {
  id: string;
  buyerName: string;
  buyerEmail: string;
  wantedAdTitle: string;
  recipientAddress: string;
  recipientSuburb?: string;
  recipientCity?: string;
  recipientRegion?: string;
  recipientPostcode?: string;
  claimCode: string;
  status: string;
  costInCents: number;
  showBudget: boolean;
  showFinanceStatus: boolean;
  showTimeline: boolean;
  customMessage?: string;
  rejectionReason?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  sent: number;
  delivered: number;
  failed: number;
  revenueTotal: number;
  revenuePaid: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: "Pending", badgeClass: "badge-warning" },
  APPROVED: { label: "Approved", badgeClass: "badge-info" },
  REJECTED: { label: "Rejected", badgeClass: "badge-error" },
  SENT: { label: "Sent", badgeClass: "badge-success" },
  DELIVERED: { label: "Delivered", badgeClass: "badge-success" },
  FAILED: { label: "Failed", badgeClass: "badge-error" },
};

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "SENT", "DELIVERED", "FAILED"];

export default function AdminPostcardsPage() {
  const { data: session } = useSession();
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/postcards/stats`,
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
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchPostcards = async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(status !== "ALL" && { status }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/postcards?${params}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPostcards(data.data.postcards);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch postcards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStats();
      fetchPostcards();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchPostcards(1, statusFilter);
    }
  }, [statusFilter]);

  const handleApprove = async (postcardId: string) => {
    setActionLoading(postcardId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/postcards/${postcardId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPostcards((prev) =>
          prev.map((p) => (p.id === postcardId ? { ...p, status: "APPROVED" } : p))
        );
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to approve postcard:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedPostcard) return;

    setActionLoading(selectedPostcard.id);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/postcards/${selectedPostcard.id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({ reason: rejectionReason || undefined }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setPostcards((prev) =>
          prev.map((p) =>
            p.id === selectedPostcard.id
              ? { ...p, status: "REJECTED", rejectionReason }
              : p
          )
        );
        fetchStats();
        setShowRejectModal(false);
        setSelectedPostcard(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Failed to reject postcard:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSent = async (postcardId: string) => {
    setActionLoading(postcardId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/postcards/${postcardId}/mark-sent`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPostcards((prev) =>
          prev.map((p) =>
            p.id === postcardId
              ? { ...p, status: "SENT", sentAt: new Date().toISOString() }
              : p
          )
        );
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to mark sent:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDelivered = async (postcardId: string) => {
    setActionLoading(postcardId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/postcards/${postcardId}/mark-delivered`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPostcards((prev) =>
          prev.map((p) =>
            p.id === postcardId
              ? { ...p, status: "DELIVERED", deliveredAt: new Date().toISOString() }
              : p
          )
        );
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to mark delivered:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/postcards/export/csv?${params}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `postcards-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-text-base">Postcard Requests</h1>
        <button
          onClick={handleExportCSV}
          className="btn-secondary btn-md"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="card-compact">
            <p className="text-sm text-text-muted">Total</p>
            <p className="text-2xl font-bold text-text-base tabular-nums">{stats.total}</p>
          </div>
          <div className="card-compact">
            <p className="text-sm text-warning">Pending</p>
            <p className="text-2xl font-bold text-warning tabular-nums">{stats.pending}</p>
          </div>
          <div className="card-compact">
            <p className="text-sm text-accent">Approved</p>
            <p className="text-2xl font-bold text-accent tabular-nums">{stats.approved}</p>
          </div>
          <div className="card-compact">
            <p className="text-sm text-success">Sent</p>
            <p className="text-2xl font-bold text-success tabular-nums">{stats.sent}</p>
          </div>
          <div className="card-compact">
            <p className="text-sm text-success">Delivered</p>
            <p className="text-2xl font-bold text-success tabular-nums">{stats.delivered}</p>
          </div>
          <div className="card-compact">
            <p className="text-sm text-error">Rejected</p>
            <p className="text-2xl font-bold text-error tabular-nums">{stats.rejected}</p>
          </div>
          <div className="card-compact">
            <p className="text-sm text-text-secondary">Revenue</p>
            <p className="text-2xl font-bold text-text-base font-mono tabular-nums">
              ${(stats.revenuePaid / 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`btn-sm transition-colors ${
              statusFilter === status
                ? "btn-primary"
                : "btn-secondary"
            }`}
          >
            {status === "ALL" ? "All" : STATUS_LABELS[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Buyer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-4 bg-surface-raised rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : postcards.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                  No postcard requests found
                </td>
              </tr>
            ) : (
              postcards.map((postcard) => {
                const statusInfo = STATUS_LABELS[postcard.status] || {
                  label: postcard.status,
                  badgeClass: "badge-neutral",
                };

                return (
                  <tr key={postcard.id} className="hover:bg-surface-raised transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-base">
                          {postcard.recipientAddress}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {[postcard.recipientSuburb, postcard.recipientCity]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p className="text-xs text-text-muted font-mono mt-1 tabular-nums">
                          Code: {postcard.claimCode}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-base">
                          {postcard.buyerName}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {postcard.buyerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-base">{postcard.wantedAdTitle}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {postcard.showBudget && (
                          <span className="badge-neutral">Budget</span>
                        )}
                        {postcard.showFinanceStatus && (
                          <span className="badge-neutral">Finance</span>
                        )}
                        {postcard.showTimeline && (
                          <span className="badge-neutral">Timeline</span>
                        )}
                        {postcard.customMessage && (
                          <span className="badge-neutral">Message</span>
                        )}
                      </div>
                      {postcard.costInCents > 0 && (
                        <p className="text-xs text-success font-mono tabular-nums mt-1">
                          ${(postcard.costInCents / 100).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={statusInfo.badgeClass}>
                        {statusInfo.label}
                      </span>
                      {postcard.rejectionReason && (
                        <p className="text-xs text-error mt-1">
                          {postcard.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary tabular-nums">
                      {formatRelativeTime(postcard.createdAt)}
                      {postcard.sentAt && (
                        <p className="text-xs text-success">
                          Sent {formatRelativeTime(postcard.sentAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col gap-1 items-end">
                        {postcard.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(postcard.id)}
                              disabled={actionLoading === postcard.id}
                              className="btn-secondary btn-sm disabled:opacity-50"
                            >
                              {actionLoading === postcard.id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPostcard(postcard);
                                setShowRejectModal(true);
                              }}
                              className="btn-destructive btn-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {postcard.status === "APPROVED" && (
                          <button
                            onClick={() => handleMarkSent(postcard.id)}
                            disabled={actionLoading === postcard.id}
                            className="btn-secondary btn-sm disabled:opacity-50"
                          >
                            {actionLoading === postcard.id ? "..." : "Mark Sent"}
                          </button>
                        )}
                        {postcard.status === "SENT" && (
                          <button
                            onClick={() => handleMarkDelivered(postcard.id)}
                            disabled={actionLoading === postcard.id}
                            className="btn-secondary btn-sm disabled:opacity-50"
                          >
                            {actionLoading === postcard.id ? "..." : "Mark Delivered"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-3 bg-surface-raised border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-secondary tabular-nums">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} postcards
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPostcards(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchPostcards(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Transition appear show={showRejectModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setShowRejectModal(false);
            setSelectedPostcard(null);
            setRejectionReason("");
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="modal-panel-sm">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-text-base mb-4"
                  >
                    Reject Postcard Request
                  </Dialog.Title>

                  {selectedPostcard && (
                    <div className="mb-4 card-compact bg-surface-raised">
                      <p className="font-medium text-text-base">
                        {selectedPostcard.recipientAddress}
                      </p>
                      <p className="text-sm text-text-secondary">
                        From: {selectedPostcard.buyerName}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Rejection reason (optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for the rejection..."
                      rows={3}
                      className="input resize-y"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setSelectedPostcard(null);
                        setRejectionReason("");
                      }}
                      className="flex-1 btn-secondary btn-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading === selectedPostcard?.id}
                      className="flex-1 btn-destructive btn-md disabled:opacity-50"
                    >
                      {actionLoading === selectedPostcard?.id
                        ? "Rejecting..."
                        : "Reject Postcard"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
