"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime } from "@offmarket/utils";

interface Postcard {
  id: string;
  wantedAdTitle: string;
  recipientAddress: string;
  recipientSuburb?: string;
  recipientCity?: string;
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

interface PostcardAllowance {
  postcardEnabled: boolean;
  freeMonthly: number;
  usedThisMonth: number;
  freeRemaining: number;
  extraCost: number;
}

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PENDING:   { label: "Pending Review", badgeClass: "badge-warning" },
  APPROVED:  { label: "Approved",       badgeClass: "badge-info" },
  REJECTED:  { label: "Rejected",       badgeClass: "badge-error" },
  SENT:      { label: "Sent",           badgeClass: "badge-success" },
  DELIVERED: { label: "Delivered",      badgeClass: "badge-success" },
  FAILED:    { label: "Failed",         badgeClass: "badge-error" },
};

export default function MyPostcardsPage() {
  const { data: session, status } = useSession();
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [allowance, setAllowance] = useState<PostcardAllowance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [postcardsRes, allowanceRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/postcards/me`, {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/postcards/allowance`, {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }),
      ]);

      const postcardsData = await postcardsRes.json();
      const allowanceData = await allowanceRes.json();

      if (postcardsData.success) {
        setPostcards(postcardsData.data || []);
      } else {
        setError(postcardsData.error?.message || "Failed to load postcards");
      }

      if (allowanceData.success) {
        setAllowance(allowanceData.data);
      }
    } catch {
      setError("Failed to load your postcards");
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
              <div key={i} className="card h-32" />
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
          <h1 className="text-2xl font-semibold font-display text-primary mb-4">
            Sign in to View Your Postcards
          </h1>
          <p className="text-secondary mb-6">
            You need to be signed in to view and manage your postcard requests.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/buyer/postcards"
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold font-display text-primary">My Postcards</h1>
          <p className="text-secondary">
            Track your direct mail postcard requests.
          </p>
        </div>
        {allowance && allowance.postcardEnabled && (
          <div className="text-right">
            <span className="badge-info tabular-nums">
              {allowance.freeRemaining} free left
            </span>
            <p className="text-xs text-secondary tabular-nums mt-1">
              {allowance.usedThisMonth} of {allowance.freeMonthly} used this month
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-error-light border border-error rounded-lg text-error mb-6">
          {error}
        </div>
      )}

      {!allowance?.postcardEnabled ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2 font-display">
            Postcard Direct Mail is a Pro Feature
          </h2>
          <p className="text-secondary mb-6">
            Upgrade to Pro to send physical postcards directly to property owners
            and stand out from other buyers.
          </p>
          <Link href="/upgrade" className="btn-primary">
            Upgrade to Pro
          </Link>
        </div>
      ) : postcards.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2 font-display">
            No postcards yet
          </h2>
          <p className="text-secondary mb-6">
            When you register interest in a specific property, you can send a
            physical postcard to the owner.
          </p>
          <Link href="/buyer/create" className="btn-primary">
            Register Interest in a Property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {postcards.map((postcard) => {
            const statusInfo = STATUS_LABELS[postcard.status] || {
              label: postcard.status,
              badgeClass: "badge-neutral",
            };

            return (
              <div key={postcard.id} className="card">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={statusInfo.badgeClass}>
                        {statusInfo.label}
                      </span>
                      {postcard.costInCents === 0 && (
                        <span className="badge-success">
                          Free
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-primary mb-1 font-display">
                      {postcard.recipientAddress}
                    </h3>
                    {(postcard.recipientSuburb || postcard.recipientCity) && (
                      <p className="text-sm text-muted mb-2">
                        {[postcard.recipientSuburb, postcard.recipientCity]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    <p className="text-sm text-secondary mb-2">
                      For: <span className="font-medium">{postcard.wantedAdTitle}</span>
                    </p>

                    {/* What&apos;s shown */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {postcard.showBudget && (
                        <span className="text-xs px-2 py-1 bg-surface-raised text-secondary rounded">
                          Shows budget
                        </span>
                      )}
                      {postcard.showFinanceStatus && (
                        <span className="text-xs px-2 py-1 bg-surface-raised text-secondary rounded">
                          Shows finance status
                        </span>
                      )}
                      {postcard.showTimeline && (
                        <span className="text-xs px-2 py-1 bg-surface-raised text-secondary rounded">
                          Shows timeline
                        </span>
                      )}
                      {postcard.customMessage && (
                        <span className="text-xs px-2 py-1 bg-surface-raised text-secondary rounded">
                          Custom message
                        </span>
                      )}
                    </div>

                    {postcard.rejectionReason && (
                      <p className="text-sm text-error mt-2">
                        Rejection reason: {postcard.rejectionReason}
                      </p>
                    )}

                    <p className="text-xs text-muted mt-2">
                      Requested {formatRelativeTime(postcard.createdAt)}
                      {postcard.sentAt && (
                        <> &middot; Sent {formatRelativeTime(postcard.sentAt)}</>
                      )}
                      {postcard.deliveredAt && (
                        <> &middot; Delivered {formatRelativeTime(postcard.deliveredAt)}</>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {postcard.costInCents > 0 && (
                      <p className="text-sm text-secondary tabular-nums">
                        Cost: ${(postcard.costInCents / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info section */}
      <div className="mt-8 p-4 bg-surface-raised rounded-lg">
        <h3 className="font-medium text-primary mb-2 font-display">How Postcards Work</h3>
        <ul className="text-sm text-secondary space-y-1">
          <li>1. Request a postcard when registering interest in a specific property</li>
          <li>2. Our team reviews your request for quality</li>
          <li>3. Once approved, we print and mail the postcard</li>
          <li>4. The property owner receives your interest in their mailbox</li>
          <li>5. They can contact you directly through the platform</li>
        </ul>
      </div>
    </div>
  );
}
