"use client";

import { useState, useMemo } from "react";
import { PROPERTY_TYPE_LABELS, FEATURE_LABELS } from "@/lib/constants";
import { formatNZD } from "@offmarket/utils";

interface AreaDemand {
  locations: { type: string; name: string }[];
  propertyTypes: string[];
  bedroomsMin: number | null;
  bedroomsMax: number | null;
  features: string[];
  buyerCount: number;
  budgetRange: {
    min: number;
    max: number;
    average: number;
  };
}

interface DemandCardGridProps {
  data: AreaDemand[];
}

interface AggregatedDemand {
  propertyType: string;
  totalBuyers: number;
  budgetRange: { min: number; max: number };
  bedroomRanges: string[];
  topFeatures: string[];
  demandCount: number;
}

const INITIAL_DISPLAY_COUNT = 6;

function aggregateDemandByType(data: AreaDemand[]): AggregatedDemand[] {
  const typeMap = new Map<string, {
    buyers: number;
    minBudget: number;
    maxBudget: number;
    bedrooms: Set<string>;
    features: Map<string, number>;
    count: number;
  }>();

  data.forEach((demand) => {
    const types = demand.propertyTypes.length > 0 ? demand.propertyTypes : ["ANY"];

    types.forEach((type) => {
      const existing = typeMap.get(type) || {
        buyers: 0,
        minBudget: Infinity,
        maxBudget: 0,
        bedrooms: new Set<string>(),
        features: new Map<string, number>(),
        count: 0,
      };

      existing.buyers += demand.buyerCount;
      existing.minBudget = Math.min(existing.minBudget, demand.budgetRange.min);
      existing.maxBudget = Math.max(existing.maxBudget, demand.budgetRange.max);
      existing.count += 1;

      if (demand.bedroomsMin || demand.bedroomsMax) {
        const bedStr = demand.bedroomsMin && demand.bedroomsMax
          ? `${demand.bedroomsMin}-${demand.bedroomsMax}`
          : demand.bedroomsMin
            ? `${demand.bedroomsMin}+`
            : `Up to ${demand.bedroomsMax}`;
        existing.bedrooms.add(bedStr);
      }

      demand.features.forEach((f) => {
        existing.features.set(f, (existing.features.get(f) || 0) + 1);
      });

      typeMap.set(type, existing);
    });
  });

  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      propertyType: type,
      totalBuyers: data.buyers,
      budgetRange: {
        min: data.minBudget === Infinity ? 0 : data.minBudget,
        max: data.maxBudget,
      },
      bedroomRanges: Array.from(data.bedrooms).slice(0, 3),
      topFeatures: Array.from(data.features.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([f]) => f),
      demandCount: data.count,
    }))
    .sort((a, b) => b.totalBuyers - a.totalBuyers);
}

export function DemandCardGrid({ data }: DemandCardGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary");

  const aggregated = useMemo(() => aggregateDemandByType(data), [data]);

  const totalBuyers = useMemo(
    () => data.reduce((sum, d) => sum + d.buyerCount, 0),
    [data]
  );

  const displayData = showAll ? data : data.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = data.length > INITIAL_DISPLAY_COUNT;

  if (data.length === 0) {
    return null;
  }

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalBuyers}</span> buyers across{" "}
          <span className="font-semibold text-gray-900">{data.length}</span> different requirements
        </p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("summary")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "summary"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode("detailed")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "detailed"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {viewMode === "summary" ? (
        /* Summary view - aggregated by property type */
        <div className="space-y-2">
          {aggregated.map((item) => (
            <div
              key={item.propertyType}
              className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-200 transition-colors"
            >
              {/* Property type icon */}
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <PropertyTypeIcon type={item.propertyType} />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {PROPERTY_TYPE_LABELS[item.propertyType] || "Any Property"}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({item.demandCount} {item.demandCount === 1 ? "request" : "requests"})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-600">
                  {item.bedroomRanges.length > 0 && (
                    <span>{item.bedroomRanges.join(", ")} bed</span>
                  )}
                  {item.topFeatures.length > 0 && (
                    <span className="text-gray-400">|</span>
                  )}
                  {item.topFeatures.slice(0, 2).map((f) => (
                    <span key={f} className="text-gray-500">
                      {FEATURE_LABELS[f] || f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buyer count */}
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-primary-600">{item.totalBuyers}</p>
                <p className="text-xs text-gray-500">buyers</p>
              </div>

              {/* Budget range */}
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {formatNZD(item.budgetRange.min)} - {formatNZD(item.budgetRange.max)}
                </p>
                <p className="text-xs text-gray-500">budget range</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed view - individual cards */
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {displayData.map((demand, i) => (
              <DemandCard key={i} demand={demand} />
            ))}
          </div>

          {/* Show more/less button */}
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {showAll ? (
                  <>
                    Show less
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Show all {data.length} requirements
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DemandCard({ demand }: { demand: AreaDemand }) {
  const description = useMemo(() => {
    const parts: string[] = [];

    if (demand.propertyTypes.length > 0) {
      const types = demand.propertyTypes
        .map((t) => PROPERTY_TYPE_LABELS[t]?.toLowerCase() || t.toLowerCase())
        .slice(0, 2);
      parts.push(types.join(" or "));
    } else {
      parts.push("any property");
    }

    if (demand.bedroomsMin) {
      parts.push(`${demand.bedroomsMin}+ bed`);
    }

    return parts.join(", ");
  }, [demand]);

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {demand.features.slice(0, 2).map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              >
                {FEATURE_LABELS[feature] || feature}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-primary-600">{demand.buyerCount}</p>
          <p className="text-xs text-gray-500">
            {demand.buyerCount === 1 ? "buyer" : "buyers"}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {demand.budgetRange.min === demand.budgetRange.max
          ? formatNZD(demand.budgetRange.min)
          : `${formatNZD(demand.budgetRange.min)} - ${formatNZD(demand.budgetRange.max)}`}
      </p>
    </div>
  );
}

function PropertyTypeIcon({ type }: { type: string }) {
  const iconClass = "w-5 h-5 text-primary-600";

  switch (type) {
    case "HOUSE":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "APARTMENT":
    case "UNIT":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "TOWNHOUSE":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      );
    case "SECTION":
    case "LIFESTYLE":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
  }
}
