"use client";

import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { BrowseFilters } from "./BrowsePageClient";

interface LocationCount {
  name: string;
  count: number;
}

interface FilterPanelProps {
  filters: BrowseFilters;
  regionCounts: LocationCount[];
  onChange: (filters: Partial<BrowseFilters>) => void;
  onClear: () => void;
}

const NZ_REGIONS = [
  "Northland",
  "Auckland",
  "Waikato",
  "Bay of Plenty",
  "Gisborne",
  "Hawke's Bay",
  "Taranaki",
  "Manawatu-Whanganui",
  "Wellington",
  "Tasman",
  "Nelson",
  "Marlborough",
  "West Coast",
  "Canterbury",
  "Otago",
  "Southland",
];

const BEDROOM_OPTIONS = [
  { value: null, label: "Beds" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

export function FilterPanel({ filters, regionCounts, onChange, onClear }: FilterPanelProps) {
  const hasActiveFilters = filters.region || filters.propertyTypes.length > 0 || filters.bedroomsMin;

  const getRegionCount = (region: string) => {
    const found = regionCounts.find((r) => r.name.toLowerCase() === region.toLowerCase());
    return found?.count || 0;
  };

  const handlePropertyTypeToggle = (type: string) => {
    const current = filters.propertyTypes;
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ propertyTypes: newTypes });
  };

  // When filters are active, show compact full-width bar
  if (hasActiveFilters) {
    return (
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main filter row */}
          <div className="flex items-center gap-3 py-3">
            {/* Region dropdown - compact */}
            <select
              value={filters.region || ""}
              onChange={(e) => onChange({ region: e.target.value || null, city: null, suburb: null })}
              className="text-sm font-medium border-0 bg-transparent text-gray-900 focus:ring-0 cursor-pointer pr-8 py-1"
            >
              <option value="">All Regions</option>
              {NZ_REGIONS.map((region) => {
                const count = getRegionCount(region);
                return (
                  <option key={region} value={region}>
                    {region} {count > 0 && `(${count})`}
                  </option>
                );
              })}
            </select>

            <div className="h-4 w-px bg-gray-300" />

            {/* Suburb input - inline */}
            <input
              type="text"
              placeholder="Suburb..."
              value={filters.suburb || ""}
              onChange={(e) => onChange({ suburb: e.target.value.trim() || null })}
              className="text-sm border-0 bg-transparent text-gray-700 placeholder-gray-400 focus:ring-0 w-28 py-1"
            />

            <div className="h-4 w-px bg-gray-300" />

            {/* Bedrooms - compact */}
            <select
              value={filters.bedroomsMin ?? ""}
              onChange={(e) => onChange({ bedroomsMin: e.target.value ? parseInt(e.target.value, 10) : null })}
              className={`text-sm border-0 bg-transparent focus:ring-0 cursor-pointer pr-6 py-1 ${
                filters.bedroomsMin ? "text-gray-900 font-medium" : "text-gray-500"
              }`}
            >
              {BEDROOM_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ""}>
                  {opt.value ? `${opt.value}+ beds` : opt.label}
                </option>
              ))}
            </select>

            <div className="h-4 w-px bg-gray-300" />

            {/* Property type pills - scrollable */}
            <div className="flex-1 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-1.5">
                {Object.entries(PROPERTY_TYPE_LABELS).map(([type, label]) => {
                  const isSelected = filters.propertyTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handlePropertyTypeToggle(type)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        isSelected
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear button */}
            <button
              onClick={onClear}
              className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - show card with full form
  return (
    <div className="card mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Region Select */}
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="region" className="label">
            Region
          </label>
          <select
            id="region"
            value={filters.region || ""}
            onChange={(e) => onChange({ region: e.target.value || null, city: null, suburb: null })}
            className="input"
          >
            <option value="">Select a region...</option>
            {NZ_REGIONS.map((region) => {
              const count = getRegionCount(region);
              return (
                <option key={region} value={region}>
                  {region} {count > 0 && `(${count} buyers)`}
                </option>
              );
            })}
          </select>
        </div>

        {/* City/Suburb Input */}
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="suburb" className="label">
            City / Suburb
          </label>
          <input
            type="text"
            id="suburb"
            placeholder="e.g. Ponsonby"
            value={filters.suburb || filters.city || ""}
            onChange={(e) => {
              const value = e.target.value.trim() || null;
              onChange({ suburb: value, city: null });
            }}
            className="input"
            disabled={!filters.region}
          />
        </div>

        {/* Bedrooms */}
        <div className="w-24">
          <label htmlFor="bedrooms" className="label">
            Beds
          </label>
          <select
            id="bedrooms"
            value={filters.bedroomsMin ?? ""}
            onChange={(e) => onChange({ bedroomsMin: e.target.value ? parseInt(e.target.value, 10) : null })}
            className="input"
          >
            <option value="">Any</option>
            {BEDROOM_OPTIONS.slice(1).map((opt) => (
              <option key={opt.label} value={opt.value ?? ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Property Type Pills - show when region selected */}
      {filters.region && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROPERTY_TYPE_LABELS).map(([type, label]) => {
              const isSelected = filters.propertyTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => handlePropertyTypeToggle(type)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
