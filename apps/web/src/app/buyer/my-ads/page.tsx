"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatNZD } from "@offmarket/utils";
import { parseJsonArray } from "@/lib/utils";

interface WantedAd {
  id: string;
  title: string;
  budget: number;
  propertyTypes: string[] | string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  targetType: string;
  targetLocations: { locationType: string; name: string }[];
  targetAddresses: { address: string; suburb?: string }[];
  matchCount: number;
}

export default function MyWantedAdsPage() {
  const { data: session, status } = useSession();
  const [ads, setAds] = useState<WantedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchMyAds();
    }
  }, [session]);

  const fetchMyAds = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wanted-ads/me/ads`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAds(data.data || []);
      } else {
        setError(data.error?.message || "Failed to load ads");
      }
    } catch {
      setError("Failed to load your buyer interests");
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this buyer interest?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wanted-ads/${adId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
      }
    } catch {
      console.error("Failed to delete ad");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to View Your Interests
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view and manage your buyer interests.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/buyer/my-ads"
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Buyer Interests</h1>
          <p className="text-gray-600">
            Manage your property searches and view matches.
          </p>
        </div>
        <Link href="/buyer/create" className="btn-primary">
          Register New Interest
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {ads.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No buyer interests yet
          </h2>
          <p className="text-gray-600 mb-6">
            Register your first buyer interest to let property owners know what
            you&apos;re looking for.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/buyer/create" className="btn-primary">
              Register Your First Interest
            </Link>
            <Link href="/explore" className="btn-secondary">
              Explore Demand First
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/wanted/${ad.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-1 block"
                  >
                    {ad.title}
                  </Link>
                  <p className="text-primary-600 font-medium mb-2">
                    {formatNZD(ad.budget)}
                  </p>

                  {/* Locations or Addresses */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ad.targetType === "SPECIFIC_ADDRESS" || ad.targetType === "BOTH" ? (
                      <>
                        {ad.targetAddresses?.slice(0, 3).map((addr, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {addr.address}
                          </span>
                        ))}
                        {ad.targetAddresses?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{ad.targetAddresses.length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {ad.targetLocations?.slice(0, 3).map((loc, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {loc.name}
                          </span>
                        ))}
                        {ad.targetLocations?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{ad.targetLocations.length - 3} more
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {parseJsonArray(ad.propertyTypes).length > 0 && (
                      <span>{parseJsonArray(ad.propertyTypes).join(", ")}</span>
                    )}
                    {ad.bedroomsMin && (
                      <span>
                        {ad.bedroomsMin}
                        {ad.bedroomsMax && ad.bedroomsMax !== ad.bedroomsMin
                          ? `-${ad.bedroomsMax}`
                          : "+"}
                        {" bed"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Match count or specific address indicator */}
                  <div className="text-center">
                    {ad.targetType === "SPECIFIC_ADDRESS" ? (
                      <>
                        <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Specific
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-primary-600">
                          {ad.matchCount}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ad.matchCount === 1 ? "match" : "matches"}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteAd(ad.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
