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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  SENT: { label: "Sent", color: "bg-green-100 text-green-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
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
        <h1 className="text-2xl font-bold text-gray-900">Postcard Requests</h1>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-yellow-700">Pending</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <p className="text-sm text-blue-700">Approved</p>
            <p className="text-2xl font-bold text-blue-800">{stats.approved}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-green-700">Sent</p>
            <p className="text-2xl font-bold text-green-800">{stats.sent}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-green-700">Delivered</p>
            <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-red-700">Rejected</p>
            <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg shadow">
            <p className="text-sm text-primary-700">Revenue</p>
            <p className="text-2xl font-bold text-primary-800">
              ${(stats.revenuePaid / 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              statusFilter === status
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === "ALL" ? "All" : STATUS_LABELS[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buyer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : postcards.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No postcards found
                </td>
              </tr>
            ) : (
              postcards.map((postcard) => {
                const statusInfo = STATUS_LABELS[postcard.status] || {
                  label: postcard.status,
                  color: "bg-gray-100 text-gray-800",
                };

                return (
                  <tr key={postcard.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {postcard.recipientAddress}
                        </p>
                        <p className="text-sm text-gray-500">
                          {[postcard.recipientSuburb, postcard.recipientCity]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          Code: {postcard.claimCode}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {postcard.buyerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {postcard.buyerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{postcard.wantedAdTitle}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {postcard.showBudget && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                            Budget
                          </span>
                        )}
                        {postcard.showFinanceStatus && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                            Finance
                          </span>
                        )}
                        {postcard.showTimeline && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                            Timeline
                          </span>
                        )}
                        {postcard.customMessage && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                            Message
                          </span>
                        )}
                      </div>
                      {postcard.costInCents > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ${(postcard.costInCents / 100).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                      {postcard.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          {postcard.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(postcard.createdAt)}
                      {postcard.sentAt && (
                        <p className="text-xs text-green-600">
                          Sent {formatRelativeTime(postcard.sentAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex flex-col gap-1 items-end">
                        {postcard.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(postcard.id)}
                              disabled={actionLoading === postcard.id}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              {actionLoading === postcard.id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPostcard(postcard);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {postcard.status === "APPROVED" && (
                          <button
                            onClick={() => handleMarkSent(postcard.id)}
                            disabled={actionLoading === postcard.id}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {actionLoading === postcard.id ? "..." : "Mark Sent"}
                          </button>
                        )}
                        {postcard.status === "SENT" && (
                          <button
                            onClick={() => handleMarkDelivered(postcard.id)}
                            disabled={actionLoading === postcard.id}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
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
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} postcards
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPostcards(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchPostcards(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900 mb-4"
                  >
                    Reject Postcard Request
                  </Dialog.Title>

                  {selectedPostcard && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {selectedPostcard.recipientAddress}
                      </p>
                      <p className="text-sm text-gray-500">
                        From: {selectedPostcard.buyerName}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection reason (optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for the rejection..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setSelectedPostcard(null);
                        setRejectionReason("");
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading === selectedPostcard?.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
