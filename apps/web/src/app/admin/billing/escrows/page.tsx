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

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      HELD: "bg-blue-100 text-blue-700",
      RELEASED: "bg-green-100 text-green-700",
      REFUNDED: "bg-orange-100 text-orange-700",
      EXPIRED: "bg-gray-100 text-gray-600",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
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
            className="text-gray-500 hover:text-gray-700"
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
          <h1 className="text-2xl font-bold text-gray-900">Escrow Deposits</h1>
        </div>
      </div>

      {actionResult && (
        <div
          className={`p-4 rounded-lg ${
            actionResult.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {actionResult.message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : escrows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No escrow deposits found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {escrows.map((escrow) => (
                  <tr key={escrow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {escrow.property.address}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {escrow.owner.name || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {escrow.owner.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {escrow.buyer.name || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        ${(escrow.amount / 100).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(escrow.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className={`text-sm ${
                            isExpiringSoon(escrow.expiresAt)
                              ? "text-orange-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {formatDate(escrow.expiresAt)}
                        </p>
                        {isExpiringSoon(escrow.expiresAt) &&
                          escrow.status === "HELD" && (
                            <p className="text-xs text-orange-500">
                              Expiring soon
                            </p>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {escrow.status === "HELD" && (
                          <>
                            <button
                              onClick={() => handleAction(escrow.id, "release")}
                              disabled={actionLoading === escrow.id}
                              className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 disabled:opacity-50"
                            >
                              {actionLoading === escrow.id
                                ? "..."
                                : "Release"}
                            </button>
                            <button
                              onClick={() => handleAction(escrow.id, "refund")}
                              disabled={actionLoading === escrow.id}
                              className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200 disabled:opacity-50"
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
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            View Inquiry
                          </Link>
                        )}
                        {escrow.stripePaymentId && (
                          <a
                            href={`https://dashboard.stripe.com/payments/${escrow.stripePaymentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-700"
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
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
              PENDING
            </span>
            <span className="text-gray-600">Payment initiated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              HELD
            </span>
            <span className="text-gray-600">Payment captured, awaiting outcome</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
              RELEASED
            </span>
            <span className="text-gray-600">Payment sent to platform</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
              REFUNDED
            </span>
            <span className="text-gray-600">Payment returned to owner</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              EXPIRED
            </span>
            <span className="text-gray-600">Auto-refunded after 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
