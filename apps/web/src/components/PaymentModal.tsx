"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe outside component to avoid re-initialization
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Payment failed");
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
      } else {
        onSuccess();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="btn-primary flex-1"
        >
          {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (escrowId: string) => void;
  propertyId: string;
  buyerId: string;
  buyerName?: string;
  apiToken: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  propertyId,
  buyerId,
  buyerName,
  apiToken,
}: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentIntent();
    } else {
      // Reset state when modal closes
      setClientSecret(null);
      setAmount(0);
      setError(null);
      setPaymentSuccess(false);
    }
  }, [isOpen, propertyId, buyerId]);

  const fetchPaymentIntent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/escrow/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            propertyId,
            buyerId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.data.clientSecret);
        setAmount(data.data.amount);
      } else {
        setError(data.error?.message || "Failed to create payment");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Confirm the escrow deposit on the backend
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/escrow/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            paymentIntentId: clientSecret?.split("_secret_")[0],
            propertyId,
            buyerId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess(data.data.escrowId);
        }, 1500);
      } else {
        setError(data.error?.message || "Failed to confirm payment");
      }
    } catch {
      setError("Payment succeeded but confirmation failed. Please contact support.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center">
      {/* Clickable backdrop layer */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="modal-panel-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text-base">
              Contact {buyerName || "Buyer"}
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Pay a finder&apos;s fee to unlock direct messaging with this buyer.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost h-8 w-8 p-0 rounded-md"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <svg className="h-6 w-6 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium text-text-base mb-2">Payment Successful!</h3>
              <p className="text-text-secondary">You can now contact this buyer directly.</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4" />
              <p className="text-text-secondary">Loading payment details...</p>
            </div>
          ) : error && !clientSecret ? (
            <div className="text-center py-8">
              <svg className="h-6 w-6 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h3 className="text-lg font-medium text-text-base mb-2">Error</h3>
              <p className="text-text-secondary mb-4">{error}</p>
              <button onClick={fetchPaymentIntent} className="btn-secondary">
                Try Again
              </button>
            </div>
          ) : clientSecret && stripePromise ? (
            <>
              {/* Fee Info */}
              <div className="bg-surface-raised rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Finder&apos;s Fee</span>
                  <span className="text-lg font-semibold text-text-base">
                    ${(amount / 100).toFixed(2)} NZD
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  This fee is held until the inquiry is resolved. You&apos;ll be
                  refunded if the buyer doesn&apos;t respond within 30 days or
                  declines your inquiry.
                </p>
              </div>

              {/* Stripe Payment Form */}
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#4f46e5",
                    },
                  },
                }}
              >
                <PaymentForm
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onCancel={onClose}
                />
              </Elements>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary">
                Payment system not configured. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
