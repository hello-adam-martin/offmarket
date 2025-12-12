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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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

          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Save This Search</h2>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when new buyer demand matches your criteria.
            </p>
          </div>

          {/* Search summary */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">
              Search criteria
            </p>
            <p className="text-sm text-gray-700">{getSearchDescription()}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="search-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search name
              </label>
              <input
                type="text"
                id="search-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Auckland houses"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  Email me when new buyers match this search
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Search"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
