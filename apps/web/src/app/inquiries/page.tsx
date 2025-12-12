"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime, truncate } from "@offmarket/utils";
import { STATUS_LABELS } from "@/lib/constants";

interface Inquiry {
  id: string;
  role: "buyer" | "owner";
  propertyAddress: string;
  propertySuburb?: string;
  propertyCity?: string;
  initiatedBy: "BUYER" | "OWNER";
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  buyerName?: string;
}

export default function InquiriesPage() {
  const { data: session, status } = useSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "buyer" | "owner">("all");

  useEffect(() => {
    if (session) {
      fetchInquiries();
    }
  }, [session, filter]);

  const fetchInquiries = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/me?role=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInquiries(data.data || []);
      } else {
        setError(data.error?.message || "Failed to load inquiries");
      }
    } catch {
      setError("Failed to load your inquiries");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to View Messages
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your inquiries and messages.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/inquiries"
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const totalUnread = inquiries.reduce((sum, i) => sum + i.unreadCount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Messages
            {totalUnread > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                {totalUnread} unread
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            Your conversations with buyers and property owners.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "All" },
          { value: "buyer", label: "As Buyer" },
          { value: "owner", label: "As Owner" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No messages yet
          </h2>
          <p className="text-gray-600 mb-6">
            {filter === "buyer"
              ? "When you reach out to property owners, your conversations will appear here."
              : filter === "owner"
                ? "When buyers contact you about your properties, conversations will appear here."
                : "Start by exploring buyer demand or registering your property to connect with others."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/explore" className="btn-primary">
              Explore Demand
            </Link>
            <Link href="/owner/register" className="btn-secondary">
              Register Property
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/inquiries/${inquiry.id}`}
              className={`card block hover:border-primary-300 transition-colors ${
                inquiry.unreadCount > 0 ? "border-primary-300 bg-primary-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        inquiry.role === "buyer"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {inquiry.role === "buyer" ? "Buyer" : "Owner"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_LABELS[inquiry.status].className}`}
                    >
                      {STATUS_LABELS[inquiry.status].label}
                    </span>
                    {inquiry.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                        {inquiry.unreadCount} new
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-gray-900">
                    {inquiry.role === "owner"
                      ? inquiry.propertyAddress
                      : [inquiry.propertySuburb, inquiry.propertyCity]
                          .filter(Boolean)
                          .join(", ") || "Property"}
                  </p>

                  {inquiry.role === "owner" && inquiry.buyerName && (
                    <p className="text-sm text-gray-600">
                      From: {inquiry.buyerName}
                    </p>
                  )}

                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {truncate(inquiry.lastMessage, 100)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(inquiry.lastMessageAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
