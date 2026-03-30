"use client";

import { useState, useEffect } from "react";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { RegionFilters } from "./RegionFilterPanel";

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, notifyOnNew: boolean) => Promise<void>;
  saving: boolean;
  defaultName: string;
  filters: RegionFilters;
  regionName: string;
}

export function SaveSearchModal({
  isOpen,
  onClose,
  onSave,
  saving,
  defaultName,
  filters,
  regionName,
}: SaveSearchModalProps) {
  const [name, setName] = useState(defaultName);
  const [notifyOnNew, setNotifyOnNew] = useState(true);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setNotifyOnNew(true);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave(name.trim(), notifyOnNew);
  };

  // Build a description of what's being saved
  const getSearchDescription = () => {
    const parts: string[] = [];
    if (filters.suburb) parts.push(filters.suburb);
    else if (filters.city) parts.push(filters.city);
    else parts.push(regionName);

    if (filters.propertyTypes.length > 0) {
      parts.push(
        filters.propertyTypes.map((t) => PROPERTY_TYPE_LABELS[t] || t).join(", ")
      );
    }
    if (filters.bedroomsMin) {
      parts.push(`${filters.bedroomsMin}+ bedrooms`);
    }
    return parts.join(" - ");
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center">
      {/* Clickable backdrop layer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="modal-panel-sm relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text-base font-display">Save This Search</h2>
            <p className="text-sm text-text-secondary mt-1">
              Get notified when new buyer demand matches your criteria.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost h-8 w-8 p-0 rounded-md shrink-0 ml-4"
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Search summary */}
          <div className="bg-surface-raised rounded-lg p-3 mb-4">
            <p className="text-xs text-text-muted uppercase font-medium mb-1">
              Search criteria
            </p>
            <p className="text-sm text-text-secondary">{getSearchDescription()}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="search-name"
                className="label"
              >
                Search name
              </label>
              <input
                type="text"
                id="search-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Auckland houses"
                className="input"
                maxLength={100}
                required
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnNew}
                  onChange={(e) => setNotifyOnNew(e.target.checked)}
                  className="w-4 h-4 text-accent border-border rounded focus:ring-accent-light"
                />
                <span className="text-sm text-text-secondary">
                  Email me when new buyers match this search
                </span>
              </label>
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
                type="submit"
                disabled={saving || !name.trim()}
                className="btn-primary flex-1"
              >
                {saving ? "Saving..." : "Save search"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
