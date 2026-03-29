"use client";

import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: "specific-address" | "wanted-ad-limit";
  currentCount?: number;
  limit?: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  currentCount,
  limit,
}: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push("/upgrade");
  };

  const getTitle = () => {
    switch (feature) {
      case "specific-address":
        return "Unlock Specific Address Alerts";
      case "wanted-ad-limit":
        return "Interest Limit Reached";
      default:
        return "Upgrade to Pro";
    }
  };

  const getDescription = () => {
    switch (feature) {
      case "specific-address":
        return "Target specific property addresses you're interested in. Get notified instantly when that exact property owner registers.";
      case "wanted-ad-limit":
        return `You've reached the free tier limit of ${limit} buyer interests${currentCount ? ` (${currentCount}/${limit})` : ""}. Upgrade to Pro for unlimited interests.`;
      default:
        return "Unlock all Pro features for better property searching.";
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center">
      {/* Clickable backdrop layer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="modal-panel-sm relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-text-base">
            {getTitle()}
          </h3>
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

        {/* Body */}
        <div className="p-6">
          <p className="text-text-secondary mb-6">
            {getDescription()}
          </p>

          {/* Pro Features */}
          <div className="bg-surface-raised rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-text-base mb-3">Pro includes:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited buyer interests
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Specific address alerts
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority notifications
              </li>
            </ul>
            <p className="text-sm font-medium text-text-base mt-3">
              Only $19/month
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="btn-primary flex-1"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
