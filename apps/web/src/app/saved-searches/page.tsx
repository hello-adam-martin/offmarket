"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime } from "@offmarket/utils";

interface SavedSearch {
  id: string;
  name: string;
  type: "DEMAND" | "PROPERTY";
  region: string | null;
  city: string | null;
  suburb: string | null;
  propertyTypes: string[];
  bedroomsMin: number | null;
  bedroomsMax: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  notifyOnNew: boolean;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const { data: session, status } = useSession();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchSavedSearches();
    }
  }, [session]);

  const fetchSavedSearches = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved-searches`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSavedSearches(data.data);
      } else {
        setError(data.error?.message || "Failed to load saved searches");
      }
    } catch {
      setError("Failed to load saved searches");
    } finally {
      setLoading(false);
    }
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved-searches/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      if (response.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      console.error("Failed to delete saved search");
    }
  };

  const toggleNotifications = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved-searches/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({ notifyOnNew: !currentValue }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setSavedSearches((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, notifyOnNew: !currentValue } : s
          )
        );
      }
    } catch {
      console.error("Failed to update notifications");
    }
  };

  const buildSearchUrl = (search: SavedSearch): string => {
    const params = new URLSearchParams();
    if (search.suburb) params.set("suburb", search.suburb);
    if (search.city) params.set("city", search.city);
    if (search.propertyTypes?.length > 0)
      params.set("propertyType", search.propertyTypes[0]);
    if (search.bedroomsMin) params.set("bedroomsMin", search.bedroomsMin.toString());

    if (search.region) {
      return `/explore/${search.region.toLowerCase()}${params.toString() ? `?${params}` : ""}`;
    }
    return `/explore${params.toString() ? `?${params}` : ""}`;
  };

  const formatSearchCriteria = (search: SavedSearch): string => {
    const parts: string[] = [];
    if (search.suburb) parts.push(search.suburb);
    else if (search.city) parts.push(search.city);
    else if (search.region) parts.push(search.region);

    if (search.propertyTypes?.length > 0) {
      parts.push(search.propertyTypes.join(", "));
    }
    if (search.bedroomsMin) {
      parts.push(`${search.bedroomsMin}+ beds`);
    }
    if (search.budgetMin || search.budgetMax) {
      const min = search.budgetMin
        ? `$${(search.budgetMin / 1000).toFixed(0)}k`
        : "";
      const max = search.budgetMax
        ? `$${(search.budgetMax / 1000).toFixed(0)}k`
        : "";
      if (min && max) parts.push(`${min} - ${max}`);
      else if (min) parts.push(`${min}+`);
      else if (max) parts.push(`up to ${max}`);
    }
    return parts.join(" · ") || "All areas";
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to View Saved Searches
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to save and manage your searches.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/saved-searches"
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
          <p className="text-sm text-gray-600 mt-1">
            Get notified when new demand matches your criteria
          </p>
        </div>
        <Link href="/explore" className="btn-primary text-sm">
          Explore Demand
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {savedSearches.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No saved searches yet
          </h2>
          <p className="text-gray-600 mb-6">
            Save your search criteria to get notified when new demand appears.
          </p>
          <Link href="/explore" className="btn-primary">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="card flex items-start gap-4"
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  search.type === "DEMAND"
                    ? "bg-green-100"
                    : "bg-blue-100"
                }`}
              >
                {search.type === "DEMAND" ? (
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{search.name}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {formatSearchCriteria(search)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      search.type === "DEMAND"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {search.type === "DEMAND" ? "Demand" : "Property"}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <p className="text-xs text-gray-500">
                    Saved {formatRelativeTime(search.createdAt)}
                  </p>
                  <Link
                    href={buildSearchUrl(search)}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    Run Search
                  </Link>
                  <button
                    onClick={() =>
                      toggleNotifications(search.id, search.notifyOnNew)
                    }
                    className={`text-xs flex items-center gap-1 ${
                      search.notifyOnNew
                        ? "text-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill={search.notifyOnNew ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {search.notifyOnNew ? "Alerts on" : "Alerts off"}
                  </button>
                  <button
                    onClick={() => deleteSavedSearch(search.id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Tip</h3>
        <p className="text-sm text-blue-800">
          When browsing the Explorer, look for the &quot;Save Search&quot; button to quickly
          save your current filters. You&apos;ll get notified when new buyer demand
          matches your criteria.
        </p>
      </div>
    </div>
  );
}
