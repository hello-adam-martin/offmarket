"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PaymentModal } from "./PaymentModal";

interface ContactBuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerName: string;
  buyerId: string;
  propertyId: string;
  propertyAddress: string;
  token: string;
}

export function ContactBuyerModal({
  isOpen,
  onClose,
  buyerName,
  buyerId,
  propertyId,
  propertyAddress,
  token,
}: ContactBuyerModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [_escrowId, setEscrowId] = useState<string | null>(null);

  // Check if owner has escrow access to contact this buyer
  useEffect(() => {
    if (isOpen && buyerId && propertyId) {
      checkEscrowAccess();
    }
  }, [isOpen, buyerId, propertyId]);

  const checkEscrowAccess = async () => {
    setCheckingAccess(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/escrow/check/${propertyId}/${buyerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setHasAccess(data.data.hasAccess);
        setEscrowId(data.data.escrowId);
      }
    } catch (error) {
      console.error("Failed to check escrow access:", error);
      // Default to showing payment flow
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handlePaymentSuccess = (newEscrowId: string) => {
    setEscrowId(newEscrowId);
    setHasAccess(true);
    setShowPaymentModal(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.length < 10) {
      setError("Message must be at least 10 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.createInquiry(
        { propertyId, buyerId, message },
        token
      );

      if (response.success && response.data) {
        // Navigate to the inquiry
        const data = response.data as { inquiryId: string };
        router.push(`/inquiries/${data.inquiryId}`);
        onClose();
      } else {
        setError(response.error?.message || "Failed to send message");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Show loading state while checking access
  if (checkingAccess) {
    return (
      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleBackdropClick}
      >
        <div className="modal-panel-sm p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4" />
            <p className="text-text-secondary">Checking access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show payment required screen if no access
  if (!hasAccess) {
    return (
      <>
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleBackdropClick}
        >
          <div className="modal-panel-sm">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-base font-display">
                Contact {buyerName}
              </h2>
              <button
                onClick={onClose}
                className="btn-ghost h-8 w-8 p-0 rounded-md"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="text-center py-2">
                <svg className="h-6 w-6 text-text-secondary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-lg font-medium text-text-base mb-2 font-display">
                  Finder&apos;s Fee Required
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  To contact this buyer about your property at{" "}
                  <span className="font-medium">{propertyAddress}</span>,
                  a one-time finder&apos;s fee is required.
                </p>

                <div className="bg-surface-raised rounded-lg p-4 mb-6 text-left">
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Direct messaging with this buyer
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Refunded if buyer declines or doesn&apos;t respond
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Secure payment via Stripe
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="btn-primary flex-1"
                  >
                    Pay Finder&apos;s Fee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          propertyId={propertyId}
          buyerId={buyerId}
          buyerName={buyerName}
          apiToken={token}
        />
      </>
    );
  }

  // Show contact form if has access
  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="modal-panel-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-base font-display">
            Contact {buyerName}
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost h-8 w-8 p-0 rounded-md"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-text-secondary mb-4">
            This buyer is interested in your property at{" "}
            <span className="font-medium">{propertyAddress}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="message"
                className="label"
              >
                Your message
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and express your interest in discussing the property..."
                className="input resize-none"
              />
              <p className="text-xs text-text-muted mt-1">
                {message.length}/1000 characters (minimum 10)
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || message.length < 10}
                className="btn-primary flex-1"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
