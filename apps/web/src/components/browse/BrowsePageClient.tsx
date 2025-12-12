"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterPanel } from "./FilterPanel";
import { DemandCardGrid } from "./DemandCardGrid";
import { PropertyCardGrid } from "./PropertyCardGrid";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { MarketSummaryBar } from "./MarketSummaryBar";

export interface BrowseFilters {
  region: string | null;
  city: string | null;
  suburb: string | null;
  propertyTypes: string[];
  bedroomsMin: number | null;
  page: number;
}

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

export function BrowsePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial filters from URL
  const [filters, setFilters] = useState<BrowseFilters>(() => ({
    region: searchParams.get("region"),
    city: searchParams.get("city"),
    suburb: searchParams.get("suburb"),
    propertyTypes: searchParams.get("types")?.split(",").filter(Boolean) || [],
    bedroomsMin: searchParams.get("beds") ? parseInt(searchParams.get("beds")!, 10) : null,
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
  }));

  const [propertyPage, setPropertyPage] = useState(1);
  const [areaDemand, setAreaDemand] = useState<AreaDemandResponse | null>(null);
  const [propertyDemand, setPropertyDemand] = useState<PropertyDemandResponse | null>(null);
  const [regionCounts, setRegionCounts] = useState<LocationCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch region counts on mount (client-side only)
  useEffect(() => {
    let mounted = true;

    async function fetchRegionCounts() {
      try {
        const res = await fetch(`${API_URL}/api/wanted-ads/location-counts?level=region`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (mounted && data.success) {
          setRegionCounts(data.data);
        }
      } catch (error) {
        // Silently handle - region counts are optional enhancement
        if (mounted) {
          console.error("Failed to fetch region counts:", error);
        }
      }
    }

    // Only fetch on client side
    if (typeof window !== "undefined") {
      fetchRegionCounts();
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Sync filters to URL
  const syncFiltersToUrl = useCallback((newFilters: BrowseFilters) => {
    const params = new URLSearchParams();
    if (newFilters.region) params.set("region", newFilters.region);
    if (newFilters.city) params.set("city", newFilters.city);
    if (newFilters.suburb) params.set("suburb", newFilters.suburb);
    if (newFilters.propertyTypes.length) params.set("types", newFilters.propertyTypes.join(","));
    if (newFilters.bedroomsMin) params.set("beds", String(newFilters.bedroomsMin));
    if (newFilters.page > 1) params.set("page", String(newFilters.page));

    const queryString = params.toString();
    router.push(`/explore${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router]);

  // Fetch data when filters change
  const fetchData = useCallback(async (currentFilters: BrowseFilters) => {
    if (!currentFilters.region) {
      setAreaDemand(null);
      setPropertyDemand(null);
      return;
    }

    setLoading(true);
    try {
      const areaParams = new URLSearchParams();
      if (currentFilters.region) areaParams.set("region", currentFilters.region);
      if (currentFilters.city) areaParams.set("city", currentFilters.city);
      if (currentFilters.suburb) areaParams.set("suburb", currentFilters.suburb);
      if (currentFilters.propertyTypes.length) {
        areaParams.set("propertyType", currentFilters.propertyTypes[0]);
      }
      if (currentFilters.bedroomsMin) areaParams.set("bedroomsMin", String(currentFilters.bedroomsMin));
      areaParams.set("page", String(currentFilters.page));
      areaParams.set("limit", "12");

      const propertyParams = new URLSearchParams();
      if (currentFilters.region) propertyParams.set("region", currentFilters.region);
      if (currentFilters.city) propertyParams.set("city", currentFilters.city);
      if (currentFilters.suburb) propertyParams.set("suburb", currentFilters.suburb);
      propertyParams.set("page", String(propertyPage));
      propertyParams.set("limit", "6");

      const [areaRes, propRes] = await Promise.all([
        fetch(`${API_URL}/api/wanted-ads/area-demand?${areaParams}`),
        fetch(`${API_URL}/api/wanted-ads/property-demand?${propertyParams}`),
      ]);

      const [areaData, propData] = await Promise.all([areaRes.json(), propRes.json()]);

      if (areaData.success) setAreaDemand(areaData);
      if (propData.success) setPropertyDemand(propData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [propertyPage]);

  // Effect to fetch data when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(filters);
      syncFiltersToUrl(filters);
    }, 100);
    return () => clearTimeout(timeout);
  }, [filters, fetchData, syncFiltersToUrl]);

  // Effect to refetch property data when property page changes
  useEffect(() => {
    if (filters.region && !initialLoad) {
      const propertyParams = new URLSearchParams();
      if (filters.region) propertyParams.set("region", filters.region);
      if (filters.city) propertyParams.set("city", filters.city);
      if (filters.suburb) propertyParams.set("suburb", filters.suburb);
      propertyParams.set("page", String(propertyPage));
      propertyParams.set("limit", "6");

      fetch(`${API_URL}/api/wanted-ads/property-demand?${propertyParams}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setPropertyDemand(data);
        })
        .catch(console.error);
    }
  }, [propertyPage, filters.region, filters.city, filters.suburb, initialLoad]);

  const handleFilterChange = (newFilters: Partial<BrowseFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? (newFilters.region !== undefined ? 1 : prev.page),
    }));
    if (newFilters.region !== undefined) {
      setPropertyPage(1);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      region: null,
      city: null,
      suburb: null,
      propertyTypes: [],
      bedroomsMin: null,
      page: 1,
    });
    setPropertyPage(1);
  };

  const hasFilters = !!filters.region;
  const showResults = hasFilters && (areaDemand?.data?.length || propertyDemand?.data?.length);

  return (
    <>
      {/* Filter Bar - full width when filters active */}
      {hasFilters && (
        <FilterPanel
          filters={filters}
          regionCounts={regionCounts}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading demand data...</p>
          </div>
        )}

        {/* Empty State - No Filters */}
        {!hasFilters && !loading && (
          <EmptyState
            regionCounts={regionCounts}
            onSelectRegion={(region) => handleFilterChange({ region })}
          />
        )}

      {/* Results */}
      {showResults && !loading && (
        <>
          {/* Market Summary */}
          <MarketSummaryBar
            areaSummary={areaDemand?.summary}
            propertySummary={propertyDemand?.summary}
            filters={filters}
            regionBuyerCount={regionCounts.find(r => r.name.toLowerCase() === filters.region?.toLowerCase())?.count}
          />

          {/* Area Demand Section */}
          {areaDemand && areaDemand.data.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What Buyers Are Looking For</h2>
              <DemandCardGrid data={areaDemand.data} />
              {areaDemand.meta.totalPages > 1 && (
                <Pagination
                  currentPage={filters.page}
                  totalPages={areaDemand.meta.totalPages}
                  onPageChange={(page) => handleFilterChange({ page })}
                />
              )}
            </section>
          )}

          {/* Property Demand Section */}
          {propertyDemand && propertyDemand.data.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
      )}

        {/* No Results for Filters */}
        {hasFilters && !loading && !showResults && (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No buyer demand found for this area yet.</p>
            <button onClick={handleClearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
