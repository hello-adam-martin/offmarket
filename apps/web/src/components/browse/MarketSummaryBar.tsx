"use client";

import { formatNZD } from "@offmarket/utils";
import type { BrowseFilters } from "./BrowsePageClient";

interface MarketSummaryBarProps {
  areaSummary?: {
    totalGroups: number;
    totalBuyers: number;
    avgBudget: number;
  };
  propertySummary?: {
    totalProperties: number;
    totalBuyers: number;
  };
  filters: BrowseFilters;
  regionBuyerCount?: number; // Total unique buyers for the region (from location-counts)
}

export function MarketSummaryBar({ areaSummary, propertySummary, filters, regionBuyerCount }: MarketSummaryBarProps) {
  const locationLabel = [filters.suburb, filters.city, filters.region].filter(Boolean).join(", ") || "Selected Area";

  // Use regionBuyerCount if available (accurate unique count), otherwise fall back to area summary
  const totalBuyers = regionBuyerCount ?? areaSummary?.totalBuyers ?? 0;

  return (
    <div className="card bg-gray-50 border-gray-200 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{locationLabel}</h2>
          <p className="text-sm text-gray-600">Market Overview</p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          {areaSummary && areaSummary.totalGroups > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-600">{areaSummary.totalGroups}</p>
              <p className="text-gray-500">Buyer Groups</p>
            </div>
          )}

          {propertySummary && propertySummary.totalProperties > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{propertySummary.totalProperties}</p>
              <p className="text-gray-500">Properties Wanted</p>
            </div>
          )}

          {totalBuyers > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalBuyers}</p>
              <p className="text-gray-500">Total Buyers</p>
            </div>
          )}

          {areaSummary && areaSummary.avgBudget > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNZD(areaSummary.avgBudget)}</p>
              <p className="text-gray-500">Avg Budget</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
