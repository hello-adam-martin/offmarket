"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatNZD } from "@offmarket/utils";
import { DemandCardGrid } from "./DemandCardGrid";
import { PropertyCardGrid } from "./PropertyCardGrid";
import { Pagination } from "./Pagination";
import { RegionFilterPanel, type RegionFilters } from "./RegionFilterPanel";
import { SaveSearchModal } from "./SaveSearchModal";

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

interface PropertyDemand {
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  buyerCount: number;
  budgets: number[];
}

interface AreaDemandResponse {
  success: boolean;
  data: AreaDemand[];
  summary: {
    totalGroups: number;
    totalBuyers: number;
    avgBudget: number;
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PropertyDemandResponse {
  success: boolean;
  data: PropertyDemand[];
  summary: {
    totalProperties: number;
    totalBuyers: number;
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface LocationCount {
  name: string;
  count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Property type display names
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "Houses",
  TOWNHOUSE: "Townhouses",
  APARTMENT: "Apartments",
  UNIT: "Units",
  LIFESTYLE: "Lifestyle",
  SECTION: "Sections",
};

interface RegionPageClientProps {
  regionSlug: string;
  regionName: string;
}

export function RegionPageClient({ regionName }: RegionPageClientProps) {
  const { data: session } = useSession();
  const [areaDemand, setAreaDemand] = useState<AreaDemandResponse | null>(null);
  const [propertyDemand, setPropertyDemand] = useState<PropertyDemandResponse | null>(null);
  const [regionCount, setRegionCount] = useState<number>(0);
  const [areaPage, setAreaPage] = useState(1);
  const [propertyPage, setPropertyPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<RegionFilters>({
    city: null,
    suburb: null,
    propertyTypes: [],
    bedroomsMin: null,
  });

  // Save search modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingSearch, setSavingSearch] = useState(false);

  // Build query params from filters
  const buildQueryParams = useCallback((page: number, limit: number) => {
    const params = new URLSearchParams();
    params.set("region", regionName);
    if (filters.city) params.set("city", filters.city);
    if (filters.suburb) params.set("suburb", filters.suburb);
    if (filters.propertyTypes.length > 0) params.set("propertyType", filters.propertyTypes[0]);
    if (filters.bedroomsMin) params.set("bedroomsMin", String(filters.bedroomsMin));
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }, [regionName, filters]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [areaRes, propRes, countsRes] = await Promise.all([
          fetch(`${API_URL}/api/wanted-ads/area-demand?${buildQueryParams(areaPage, 12)}`),
          fetch(`${API_URL}/api/wanted-ads/property-demand?${buildQueryParams(propertyPage, 6)}`),
          fetch(`${API_URL}/api/wanted-ads/location-counts?level=region`),
        ]);

        const [areaData, propData, countsData] = await Promise.all([
          areaRes.json(),
          propRes.json(),
          countsRes.json(),
        ]);

        if (areaData.success) setAreaDemand(areaData);
        if (propData.success) setPropertyDemand(propData);
        if (countsData.success) {
          const found = countsData.data.find(
            (r: LocationCount) => r.name.toLowerCase() === regionName.toLowerCase()
          );
          setRegionCount(found?.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [regionName, areaPage, propertyPage, buildQueryParams]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<RegionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setAreaPage(1); // Reset to first page when filters change
    setPropertyPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      city: null,
      suburb: null,
      propertyTypes: [],
      bedroomsMin: null,
    });
    setAreaPage(1);
    setPropertyPage(1);
  };

  // Save search handler
  const handleSaveSearch = async (name: string, notifyOnNew: boolean) => {
    if (!session) return;

    setSavingSearch(true);
    try {
      const response = await fetch(`${API_URL}/api/saved-searches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.apiToken}`,
        },
        body: JSON.stringify({
          name,
          type: "DEMAND",
          region: regionName,
          city: filters.city,
          suburb: filters.suburb,
          propertyTypes: filters.propertyTypes,
          bedroomsMin: filters.bedroomsMin,
          notifyOnNew,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowSaveModal(false);
      } else {
        alert(data.error?.message || "Failed to save search");
      }
    } catch {
      alert("Failed to save search. Please try again.");
    } finally {
      setSavingSearch(false);
    }
  };

  // Calculate property type breakdown
  const propertyTypeBreakdown = useMemo(() => {
    if (!areaDemand?.data) return [];

    const counts: Record<string, number> = {};
    for (const group of areaDemand.data) {
      for (const type of group.propertyTypes) {
        counts[type] = (counts[type] || 0) + group.buyerCount;
      }
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type, count]) => ({
        type,
        label: PROPERTY_TYPE_LABELS[type] || type,
        count,
      }));
  }, [areaDemand]);

  // Calculate popular locations (suburbs, cities, or towns depending on region)
  const popularLocations = useMemo(() => {
    if (!areaDemand?.data) return [];

    const locationCounts: Record<string, number> = {};
    for (const group of areaDemand.data) {
      for (const loc of group.locations) {
        // Include both SUBURB and CITY types for "Popular Locations"
        if (loc.type === "SUBURB" || loc.type === "CITY") {
          locationCounts[loc.name] = (locationCounts[loc.name] || 0) + group.buyerCount;
        }
      }
    }

    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [areaDemand]);

  // Calculate bedroom demand
  const bedroomDemand = useMemo(() => {
    if (!areaDemand?.data) return [];

    const counts: Record<string, number> = {};
    for (const group of areaDemand.data) {
      if (group.bedroomsMin) {
        const key = group.bedroomsMin >= 5 ? "5+" : String(group.bedroomsMin);
        counts[key] = (counts[key] || 0) + group.buyerCount;
      }
    }

    return Object.entries(counts)
      .sort((a, b) => {
        const aNum = a[0] === "5+" ? 5 : parseInt(a[0]);
        const bNum = b[0] === "5+" ? 5 : parseInt(b[0]);
        return aNum - bNum;
      })
      .map(([beds, count]) => ({ beds: beds + "+ bed", count }));
  }, [areaDemand]);

  // Build filter description for subtitle
  const filterDescription = useMemo(() => {
    const parts: string[] = [];
    if (filters.suburb) parts.push(filters.suburb);
    else if (filters.city) parts.push(filters.city);
    if (filters.bedroomsMin) parts.push(`${filters.bedroomsMin}+ beds`);
    if (filters.propertyTypes.length > 0) {
      parts.push(filters.propertyTypes.map(t => PROPERTY_TYPE_LABELS[t] || t).join(", "));
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  }, [filters]);

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          <p className="mt-2 text-text-secondary">Loading demand data...</p>
        </div>
      </div>
    );
  }

  const hasData = areaDemand?.data?.length || propertyDemand?.data?.length;

  return (
    <>
      {/* Filter Panel */}
      <RegionFilterPanel
        regionName={regionName}
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        onSaveSearch={session ? () => setShowSaveModal(true) : undefined}
      />

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/explore" className="text-text-muted hover:text-accent">
                Explorer
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            {filters.city || filters.suburb ? (
              <li>
                <button
                  onClick={() => handleFilterChange({ city: null, suburb: null })}
                  className="text-text-muted hover:text-accent"
                >
                  {regionName}
                </button>
              </li>
            ) : (
              <li className="text-text-base font-medium">{regionName}</li>
            )}
            {filters.city && (
              <>
                <li className="text-text-muted">/</li>
                {filters.suburb ? (
                  <li>
                    <button
                      onClick={() => handleFilterChange({ suburb: null })}
                      className="text-text-muted hover:text-accent"
                    >
                      {filters.city}
                    </button>
                  </li>
                ) : (
                  <li className="text-text-base font-medium">{filters.city}</li>
                )}
              </>
            )}
            {filters.suburb && (
              <>
                <li className="text-text-muted">/</li>
                <li className="text-text-base font-medium">{filters.suburb}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-base mb-2">
            Buyer Demand in {filters.suburb || filters.city || regionName}
          </h1>
          <p className="text-text-secondary">
            {filterDescription
              ? `Showing results for: ${filterDescription}`
              : "Discover what property buyers are looking for in this region"}
          </p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-3xl font-bold text-accent">{regionCount}</p>
          <p className="text-sm text-text-muted">Active Buyers</p>
        </div>
        <div className="card p-4">
          <p className="text-3xl font-bold text-accent">{areaDemand?.summary?.totalGroups || 0}</p>
          <p className="text-sm text-text-muted">Buyer Groups</p>
        </div>
        <div className="card p-4">
          <p className="text-3xl font-bold text-text-base">
            {areaDemand?.summary?.avgBudget ? formatNZD(areaDemand.summary.avgBudget) : "$0"}
          </p>
          <p className="text-sm text-text-muted">Avg Budget</p>
        </div>
        <div className="card p-4">
          <p className="text-3xl font-bold text-text-base">{propertyDemand?.summary?.totalProperties || 0}</p>
          <p className="text-sm text-text-muted">Specific Properties</p>
        </div>
      </div>

      {hasData ? (
        <>
          {/* Insights Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Property Types */}
            {propertyTypeBreakdown.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-text-base mb-3">Property Types Wanted</h3>
                <div className="space-y-2">
                  {propertyTypeBreakdown.map(({ type, label, count }) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-text-base">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-surface-raised rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{
                              width: `${(count / (propertyTypeBreakdown[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-text-muted w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Locations */}
            {popularLocations.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-text-base mb-3">Popular Locations</h3>
                <div className="space-y-2">
                  {popularLocations.map(({ name, count }, index) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`
                          w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? "bg-secondary-light text-secondary" : "bg-surface-raised text-text-secondary"}
                        `}>
                          {index + 1}
                        </span>
                        <span className="text-sm text-text-base">{name}</span>
                      </div>
                      <span className="text-xs text-text-muted">{count} buyers</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bedroom Demand */}
            {bedroomDemand.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-text-base mb-3">Bedroom Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {bedroomDemand.map(({ beds, count }) => (
                    <div
                      key={beds}
                      className="px-3 py-2 bg-surface-raised rounded-lg text-center"
                    >
                      <p className="text-lg font-bold text-text-base">{count}</p>
                      <p className="text-xs text-text-muted">{beds}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Area Demand Section */}
          {areaDemand && areaDemand.data.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-base mb-4">
                What Buyers Are Looking For
              </h2>
              <DemandCardGrid data={areaDemand.data} />
              {areaDemand.meta.totalPages > 1 && (
                <Pagination
                  currentPage={areaPage}
                  totalPages={areaDemand.meta.totalPages}
                  onPageChange={setAreaPage}
                />
              )}
            </section>
          )}

          {/* Property Demand Section */}
          {propertyDemand && propertyDemand.data.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-base mb-4">
                Specific Properties with Buyer Interest
              </h2>
              <PropertyCardGrid data={propertyDemand.data} />
              {propertyDemand.meta.totalPages > 1 && (
                <Pagination
                  currentPage={propertyPage}
                  totalPages={propertyDemand.meta.totalPages}
                  onPageChange={setPropertyPage}
                />
              )}
            </section>
          )}
        </>
      ) : (
        /* No Data State */
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-base mb-2">
            No buyer demand yet in {regionName}
          </h3>
          <p className="text-text-secondary mb-6">
            Be the first to express interest in properties in this region.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/buyer/create" className="btn-primary">
              Register Interest
            </Link>
            <Link href="/explore" className="btn-secondary">
              Explore Other Regions
            </Link>
          </div>
        </div>
      )}

        {/* CTA Section */}
        {hasData && (
          <div className="bg-surface-raised rounded-xl p-6 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text-base">
                  Own property in {regionName}?
                </h3>
                <p className="text-text-secondary">
                  Check if any buyers are looking for your specific property.
                </p>
              </div>
              <Link href="/owner" className="btn-primary whitespace-nowrap">
                Check Your Property
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSearch}
        saving={savingSearch}
        defaultName={`${filters.suburb || filters.city || regionName} search`}
        filters={filters}
        regionName={regionName}
      />
    </>
  );
}
