"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";

interface PostcardAllowance {
  postcardEnabled: boolean;
  freeMonthly: number;
  usedThisMonth: number;
  freeRemaining: number;
  extraCost: number;
}

interface PostcardRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  wantedAdId: string;
  targetAddressId: string;
  address: string;
  onSuccess?: () => void;
}

export function PostcardRequestModal({
  isOpen,
  onClose,
  wantedAdId,
  targetAddressId,
  address,
  onSuccess,
}: PostcardRequestModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Eligibility state
  const [canSend, setCanSend] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [costFormatted, setCostFormatted] = useState("");
  const [allowance, setAllowance] = useState<PostcardAllowance | null>(null);

  // Form state
  const [showBudget, setShowBudget] = useState(false);
  const [showFinanceStatus, setShowFinanceStatus] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  // Check eligibility when modal opens
  useEffect(() => {
    if (isOpen && session) {
      checkEligibility();
    }
  }, [isOpen, session, wantedAdId, targetAddressId]);

  const checkEligibility = async () => {
    setCheckingEligibility(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postcards/check/${wantedAdId}/${targetAddressId}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCanSend(data.data.canSend);
        if (!data.data.canSend) {
          setEligibilityReason(data.data.message);
        } else {
          setIsFree(data.data.isFree);
          setCostFormatted(data.data.costFormatted);
        }
      } else {
        setError(data.error?.message || "Failed to check eligibility");
      }

      // Also fetch allowance info
      const allowanceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postcards/allowance`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );

      const allowanceData = await allowanceResponse.json();
      if (allowanceData.success) {
        setAllowance(allowanceData.data);
      }
    } catch {
      setError("Failed to check postcard eligibility");
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postcards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({
            wantedAdId,
            targetAddressId,
            showBudget,
            showFinanceStatus,
            showTimeline,
            customMessage: customMessage.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.data.clientSecret) {
          // Needs payment - would integrate with Stripe here
          // For now, just show success
          setSuccess(true);
        } else {
          // Free postcard - submitted successfully
          setSuccess(true);
        }
        onSuccess?.();
      } else {
        setError(data.error?.message || "Failed to submit postcard request");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setSuccess(false);
    setError(null);
    setShowBudget(false);
    setShowFinanceStatus(false);
    setShowTimeline(false);
    setCustomMessage("");
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                {success ? (
                  // Success state
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 mb-2">
                      Postcard Request Submitted!
                    </Dialog.Title>
                    <p className="text-gray-600 mb-6">
                      Your postcard request has been submitted for review. We&apos;ll notify you once it&apos;s approved and sent.
                    </p>
                    <button
                      onClick={handleClose}
                      className="btn-primary w-full"
                    >
                      Done
                    </button>
                  </div>
                ) : checkingEligibility ? (
                  // Loading state
                  <div className="py-12 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Checking eligibility...</p>
                  </div>
                ) : !canSend ? (
                  // Not eligible
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 mb-2">
                      Cannot Send Postcard
                    </Dialog.Title>
                    <p className="text-gray-600 mb-6">
                      {eligibilityReason || "You're not eligible to send a postcard at this time."}
                    </p>
                    <button
                      onClick={handleClose}
                      className="btn-secondary w-full"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  // Request form
                  <>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 mb-1">
                      Send Postcard to Property Owner
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mb-4">
                      We&apos;ll mail a physical postcard to the owner of this property letting them know you&apos;re interested.
                    </p>

                    {/* Address preview */}
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recipient Address</p>
                      <p className="font-medium text-gray-900">{address}</p>
                    </div>

                    {/* Cost info */}
                    <div className={`p-3 rounded-lg mb-4 ${isFree ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {isFree ? "Free postcard" : "Postcard cost"}
                        </span>
                        <span className={`font-semibold ${isFree ? "text-green-600" : "text-blue-600"}`}>
                          {costFormatted}
                        </span>
                      </div>
                      {allowance && (
                        <p className="text-xs text-gray-500 mt-1">
                          {allowance.freeRemaining} of {allowance.freeMonthly} free postcards remaining this month
                        </p>
                      )}
                    </div>

                    {/* What to include */}
                    <div className="space-y-3 mb-4">
                      <p className="text-sm font-medium text-gray-700">What to show on the postcard:</p>

                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={showBudget}
                          onChange={(e) => setShowBudget(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Show my budget</p>
                          <p className="text-xs text-gray-500">Let the owner know your price range</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={showFinanceStatus}
                          onChange={(e) => setShowFinanceStatus(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Show finance status</p>
                          <p className="text-xs text-gray-500">Cash buyer or pre-approved</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={showTimeline}
                          onChange={(e) => setShowTimeline(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Show my timeline</p>
                          <p className="text-xs text-gray-500">When you&apos;re looking to buy</p>
                        </div>
                      </label>
                    </div>

                    {/* Custom message */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personal message (optional)
                      </label>
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value.slice(0, 200))}
                        placeholder="Add a brief personal note to the owner..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-500 text-right mt-1">
                        {customMessage.length}/200 characters
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                        {error}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleClose}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary flex-1"
                      >
                        {loading ? "Submitting..." : isFree ? "Send Postcard" : `Pay & Send (${costFormatted})`}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      All postcards are reviewed before sending to ensure quality.
                    </p>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
