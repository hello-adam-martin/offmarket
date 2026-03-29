"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { NZRegionMap } from "./NZRegionMap";

// Convert region name to URL slug
function toSlug(name: string): string {
  return name.toLowerCase().replace(/['\\s]+/g, "-");
}

interface LocationCount {
  name: string;
  count: number;
}

interface EmptyStateProps {
  regionCounts: LocationCount[];
  onSelectRegion?: (region: string) => void; // Optional, using router instead
}

// All NZ regions for search
const ALL_REGIONS = [
  "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne",
  "Hawke's Bay", "Taranaki", "Manawatu-Whanganui", "Wellington",
  "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury",
  "Otago", "Southland"
];

export function EmptyState({ regionCounts }: EmptyStateProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const totalBuyers = regionCounts.reduce((sum, r) => sum + r.count, 0);

  // Navigate to friendly URL
  const handleSelectRegion = (regionName: string) => {
    router.push(`/explore/${toSlug(regionName)}`);
  };

  // Sort regions by buyer count for "hot regions"
  const topRegions = useMemo(() => {
    return [...regionCounts]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [regionCounts]);

  // Filter regions based on search
  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return ALL_REGIONS.filter(r => r.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleSearchSelect = (region: string) => {
    setSearchQuery("");
    handleSelectRegion(region);
  };

  return (
    <div className="py-6">
      {/* Header with Search */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-semibold text-text-base mb-2">
          Discover Buyer Demand
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Find out what buyers are looking for across New Zealand
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-border rounded-md bg-surface focus:ring-1 focus:ring-accent-light focus:border-accent text-text-base placeholder:text-text-muted text-lg"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Search Dropdown */}
          {filteredRegions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredRegions.map((region) => {
                const count = regionCounts.find(r => r.name === region)?.count || 0;
                return (
                  <button
                    key={region}
                    onClick={() => handleSearchSelect(region)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-raised flex justify-between items-center"
                  >
                    <span className="font-medium text-text-base">{region}</span>
                    <span className="text-sm text-text-muted">
                      {count} {count === 1 ? "buyer" : "buyers"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Side by Side Layout */}
      <div className="grid lg:grid-cols-5 gap-8 mb-8">
        {/* Map - Takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="bg-surface rounded-lg border border-border p-4">
            <NZRegionMap regionCounts={regionCounts} onSelectRegion={handleSelectRegion} />
          </div>
        </div>

        {/* Right Side - Stats and Top Regions - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg border border-border p-4">
              <p className="font-display text-xl font-semibold text-text-base tabular-nums">{totalBuyers}</p>
              <p className="label">Active Buyers</p>
            </div>
            <div className="bg-surface rounded-lg border border-border p-4">
              <p className="font-display text-xl font-semibold text-text-base tabular-nums">{regionCounts.filter(r => r.count > 0).length}</p>
              <p className="label">Active Regions</p>
            </div>
          </div>

          {/* Top Regions */}
          <div className="bg-surface rounded-lg border border-border p-4">
            <h3 className="text-xl font-display font-semibold text-text-base mb-2">
              Hot Regions
            </h3>
            {topRegions.length > 0 ? (
              <div className="space-y-2">
                {topRegions.map((region, index) => (
                  <button
                    key={region.name}
                    onClick={() => handleSelectRegion(region.name)}
                    className="w-full flex items-center justify-between p-3 rounded-md hover:bg-surface-raised transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="badge-neutral w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-text-base group-hover:text-accent">
                        {region.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-accent tabular-nums">
                        {region.count}
                      </span>
                      <span className="text-xs text-text-muted">buyers</span>
                      <svg
                        className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">No buyer activity yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-raised rounded-lg p-4">
            <h3 className="label mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/buyer/create"
                className="flex items-center gap-3 p-3 bg-surface rounded-md hover:shadow-sm transition-shadow group"
              >
                <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <div>
                  <p className="font-medium text-text-base text-sm">Register Interest</p>
                  <p className="text-xs text-text-muted">Tell owners what you&apos;re looking for</p>
                </div>
              </a>
              <a
                href="/owner"
                className="flex items-center gap-3 p-3 bg-surface rounded-md hover:shadow-sm transition-shadow group"
              >
                <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <p className="font-medium text-text-base text-sm">Check Your Property</p>
                  <p className="text-xs text-text-muted">See if buyers want your property</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
