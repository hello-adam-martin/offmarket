"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatNZD } from "@offmarket/utils";

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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-primary-200 rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !postcard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Postcard Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find a postcard with that code. Please check the code and try again."}
          </p>
          <Link href="/" className="btn-primary inline-block">
            Visit OffMarket NZ
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Response Sent!
          </h1>
          <p className="text-gray-600 mb-6">
            Your response has been sent to {postcard.buyerName}. They will contact you soon to discuss your property.
          </p>
          <div className="space-y-3">
            <Link href="/" className="btn-primary block">
              Learn More About OffMarket NZ
            </Link>
            <Link href="/auth/signup" className="btn-secondary block">
              Create a Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-600">
            OffMarket NZ
          </Link>
          <span className="text-sm text-gray-500">
            Code: <span className="font-mono font-medium">{postcard.claimCode}</span>
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary-100 rounded-xl shrink-0">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                You Received a Postcard!
              </h1>
              <p className="text-gray-600">
                A verified buyer is interested in your property
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Your Property</p>
            <p className="text-lg font-semibold text-gray-900">{postcard.propertyAddress}</p>
            {(postcard.propertySuburb || postcard.propertyCity) && (
              <p className="text-gray-600">
                {[postcard.propertySuburb, postcard.propertyCity].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {/* Buyer Info */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              About the Interested Buyer
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Buyer</p>
                <p className="font-medium text-gray-900">{postcard.buyerName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Their Interest</p>
                <p className="font-medium text-gray-900">{postcard.interestTitle}</p>
                {postcard.interestDescription && (
                  <p className="text-gray-600 text-sm mt-1">{postcard.interestDescription}</p>
                )}
              </div>

              {postcard.budget && (
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold text-primary-600 text-lg">
                    {formatNZD(postcard.budget)}
                  </p>
                </div>
              )}

              {postcard.financeStatus && (
                <div>
                  <p className="text-sm text-gray-500">Finance Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {FINANCE_STATUS_LABELS[postcard.financeStatus] || postcard.financeStatus}
                  </span>
                </div>
              )}

              {postcard.customMessage && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                  <p className="text-sm text-primary-700 font-medium mb-1">Personal Message</p>
                  <p className="text-gray-800 italic">&quot;{postcard.customMessage}&quot;</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Response Form */}
        {!showResponseForm ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Interested in Connecting?
            </h2>
            <p className="text-gray-600 mb-6">
              If you&apos;re open to discussing your property, let the buyer know.
              There&apos;s no obligation - just a chance to explore the opportunity.
            </p>
            <button
              onClick={() => setShowResponseForm(true)}
              className="btn-primary w-full sm:w-auto"
            >
              Yes, I&apos;m Interested
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Your contact information will only be shared with this verified buyer
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Share Your Contact Details
            </h2>
            <p className="text-gray-600 mb-6">
              Let {postcard.buyerName} know how to reach you.
            </p>

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="021 xxx xxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything you'd like the buyer to know..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {!contactEmail && !contactPhone && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  Please provide at least an email or phone number so the buyer can reach you.
                </p>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
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
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            OffMarket NZ connects property buyers directly with owners -
            no listings required.
          </p>
          <Link href="/" className="text-primary-600 hover:underline">
            Learn more about how it works
          </Link>
        </div>
      </main>
    </div>
  );
}
