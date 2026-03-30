"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatNZD } from "@offmarket/utils";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface PostcardInfo {
  id: string;
  claimCode: string;
  buyerName: string;
  interestTitle: string;
  interestDescription?: string;
  propertyAddress: string;
  propertySuburb?: string;
  propertyCity?: string;
  customMessage?: string;
  budget?: number;
  financeStatus?: string;
  showTimeline?: boolean;
  claimedAt?: string;
}

const FINANCE_STATUS_LABELS: Record<string, string> = {
  CASH: "Cash buyer",
  PRE_APPROVED: "Pre-approved finance",
  REQUIRES_FINANCE: "Requires finance",
  NOT_SPECIFIED: "Not specified",
};

export default function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postcard, setPostcard] = useState<PostcardInfo | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Response form state
  const [ownerName, setOwnerName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPostcard();
  }, [code]);

  const fetchPostcard = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postcards/claim/${code}`
      );
      const data = await response.json();

      if (data.success) {
        setPostcard(data.data);
        // Mark as viewed
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/postcards/claim/${code}/view`, {
          method: "POST",
        });
      } else {
        setError(data.error?.message || "Postcard not found");
      }
    } catch {
      setError("Failed to load postcard information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postcards/claim/${code}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerName,
            contactEmail,
            contactPhone,
            message,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error?.message || "Failed to submit response");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <main className="max-w-content mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-surface-raised rounded w-1/3" />
            <div className="h-4 bg-surface-raised rounded w-2/3" />
            <div className="h-48 bg-surface-raised rounded-lg mt-6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !postcard) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <main className="max-w-content mx-auto px-4 py-12">
          <div className="card border-l-4 border-error">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <h1 className="text-xl font-display font-semibold text-primary mb-2">
                  This claim link is not valid
                </h1>
                <p className="text-secondary mb-6">
                  {error || "The link may have expired or already been used. Check your postcard for details."}
                </p>
                <Link href="/" className="btn-primary inline-flex">
                  Visit OffMarket NZ
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <main className="max-w-content mx-auto px-4 py-12">
          <div className="card border-l-4 border-success">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h1 className="text-xl font-display font-semibold text-primary mb-2">
                  Property claimed successfully
                </h1>
                <p className="text-secondary mb-6">
                  Your response has been sent to {postcard.buyerName}. They will contact you soon to discuss your property.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/" className="btn-primary">
                    Learn More About OffMarket NZ
                  </Link>
                  <Link href="/auth/signup" className="btn-secondary">
                    Create a Free Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <main className="max-w-content mx-auto px-4 py-8">
        {/* Claim code display */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">Claim Code</p>
          <div className="bg-surface-raised rounded-md px-4 py-3 text-center inline-block">
            <span className="font-mono tabular-nums text-primary">{postcard.claimCode}</span>
          </div>
        </div>

        {/* Introduction card */}
        <div className="card mb-6">
          <div className="flex items-start gap-3 mb-6">
            <svg className="w-5 h-5 text-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <h1 className="text-xl font-display font-semibold text-primary mb-1">
                You Received a Postcard
              </h1>
              <p className="text-secondary">
                A verified buyer is interested in your property
              </p>
            </div>
          </div>

          <div className="bg-surface-raised rounded-md p-4 mb-6">
            <p className="label mb-1">Your Property</p>
            <p className="text-primary font-semibold">{postcard.propertyAddress}</p>
            {(postcard.propertySuburb || postcard.propertyCity) && (
              <p className="text-secondary text-sm">
                {[postcard.propertySuburb, postcard.propertyCity].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {/* Buyer Info */}
          <div className="border-t border-border pt-6">
            <h2 className="font-semibold text-primary mb-4 font-display">
              About the Interested Buyer
            </h2>

            <div className="space-y-4">
              <div>
                <p className="label">Buyer</p>
                <p className="font-medium text-primary">{postcard.buyerName}</p>
              </div>

              <div>
                <p className="label">Their Interest</p>
                <p className="font-medium text-primary">{postcard.interestTitle}</p>
                {postcard.interestDescription && (
                  <p className="text-secondary text-sm mt-1">{postcard.interestDescription}</p>
                )}
              </div>

              {postcard.budget && (
                <div>
                  <p className="label">Budget</p>
                  <p className="tabular-nums font-semibold text-accent text-lg">
                    {formatNZD(postcard.budget)}
                  </p>
                </div>
              )}

              {postcard.financeStatus && (
                <div>
                  <p className="label">Finance Status</p>
                  <span className="badge-success">
                    {FINANCE_STATUS_LABELS[postcard.financeStatus] || postcard.financeStatus}
                  </span>
                </div>
              )}

              {postcard.customMessage && (
                <div className="bg-accent-light border border-accent rounded-md p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-1">Personal Message</p>
                  <p className="text-primary italic">&quot;{postcard.customMessage}&quot;</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Response Form */}
        {!showResponseForm ? (
          <div className="card">
            <h2 className="text-xl font-display font-semibold text-primary mb-2">
              Interested in Connecting?
            </h2>
            <p className="text-secondary mb-6">
              If you&apos;re open to discussing your property, let the buyer know.
              There&apos;s no obligation — just a chance to explore the opportunity.
            </p>
            <button
              onClick={() => setShowResponseForm(true)}
              className="btn-primary w-full sm:w-auto"
            >
              Yes, I&apos;m Interested
            </button>
            <p className="text-xs text-muted mt-4">
              Your contact information will only be shared with this verified buyer
            </p>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-xl font-display font-semibold text-primary mb-2">
              Share Your Contact Details
            </h2>
            <p className="text-secondary mb-6">
              Let {postcard.buyerName} know how to reach you.
            </p>

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label htmlFor="ownerName" className="label">
                  Your Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter your name"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="021 xxx xxxx"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="message" className="label">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything you'd like the buyer to know..."
                  rows={3}
                  className="input"
                />
              </div>

              {!contactEmail && !contactPhone && (
                <p className="text-sm text-warning bg-secondary-light p-3 rounded-md">
                  Please provide at least an email or phone number so the buyer can reach you.
                </p>
              )}

              {error && (
                <p className="text-sm text-error bg-error-light p-3 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResponseForm(false)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!contactEmail && !contactPhone)}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send My Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-sm text-secondary">
          <p className="mb-2">
            OffMarket NZ connects property buyers directly with owners —
            no listings required.
          </p>
          <Link href="/" className="text-accent hover:text-accent-hover">
            Learn more about how it works
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
