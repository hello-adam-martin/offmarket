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
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-raised rounded w-1/3 mb-4" />
          <div className="h-4 bg-surface-raised rounded w-2/3 mb-8" />
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
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-xl font-display font-semibold text-primary mb-4">
            Sign in to View Messages
          </h1>
          <p className="text-secondary mb-6">
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
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-display font-semibold text-primary flex items-center gap-2">
            Messages
            {totalUnread > 0 && (
              <span className="badge-info tabular-nums">
                {totalUnread} unread
              </span>
            )}
          </h1>
          <p className="text-secondary mt-1">
            Your conversations with buyers and property owners.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-surface-raised rounded-md p-1 inline-flex gap-1 mb-6">
        {[
          { value: "all", label: "All" },
          { value: "buyer", label: "As Buyer" },
          { value: "owner", label: "As Owner" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-surface border-b-2 border-accent text-accent"
                : "text-secondary hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-error-light border border-error rounded-md text-error mb-6">
          {error}
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-display font-semibold text-primary mb-2">
            No messages yet
          </h2>
          <p className="text-secondary mb-6">
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
              className={`card-compact block hover:border-accent transition-colors ${
                inquiry.unreadCount > 0 ? "border-accent bg-surface" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-neutral">
                      {inquiry.role === "buyer" ? "Buyer" : "Owner"}
                    </span>
                    <span className={STATUS_LABELS[inquiry.status].badgeClass}>
                      {STATUS_LABELS[inquiry.status].label}
                    </span>
                    {inquiry.unreadCount > 0 && (
                      <span className="badge-info tabular-nums">
                        {inquiry.unreadCount} new
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-primary">
                    {inquiry.role === "owner"
                      ? inquiry.propertyAddress
                      : [inquiry.propertySuburb, inquiry.propertyCity]
                          .filter(Boolean)
                          .join(", ") || "Property"}
                  </p>

                  {inquiry.role === "owner" && inquiry.buyerName && (
                    <p className="text-sm text-secondary">
                      From: {inquiry.buyerName}
                    </p>
                  )}

                  <p className="text-sm text-muted mt-1 truncate">
                    {truncate(inquiry.lastMessage, 100)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-muted">
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
