"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PROPERTY_TYPE_LABELS, FEATURE_LABELS } from "@/lib/constants";
import { parseJsonArray } from "@/lib/utils";
import Link from "next/link";
import {
  formatNZD,
  formatBedroomRange,
  formatPropertySize,
  formatRelativeTime,
} from "@offmarket/utils";

interface PostcardRequest {
  id: string;
  status: string;
  recipientAddress: string;
  customMessage?: string;
  showBudget: boolean;
  claimedAt?: string;
  ownerResponseAt?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerMessage?: string;
  sentAt?: string;
  createdAt: string;
}

interface PropertyData {
  // Basic info
  propertyType?: string;
  yearBuilt?: number;

  // Size
  landArea?: number; // sqm
  floorArea?: number; // sqm

  // Rooms
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;

  // Valuation
  capitalValue?: number;
  landValue?: number;
  improvementsValue?: number;
  valuationDate?: string;

  // Features
  features?: string[];

  // Images
  streetViewUrl?: string;
  aerialViewUrl?: string;
}

interface TargetAddress {
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  propertyData?: PropertyData;
}

interface WantedAd {
  id: string;
  title: string;
  description?: string;
  budget: number;
  financeStatus?: string;
  propertyTypes?: string[] | string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  landSizeMin?: number;
  landSizeMax?: number;
  floorAreaMin?: number;
  floorAreaMax?: number;
  features?: string[] | string;
  targetType: string;
  targetLocations?: { locationType: string; name: string }[];
  targetAddresses?: TargetAddress[];
  postcardRequests?: PostcardRequest[];
  isActive: boolean;
  createdAt: string;
  buyer?: {
    name?: string;
    image?: string;
  };
}

export default function WantedAdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const [ad, setAd] = useState<WantedAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      const { id } = await params;

      // First try authenticated endpoint if logged in
      if (session) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/wanted-ads/me/ads/${id}`,
            {
              headers: {
                Authorization: `Bearer ${(session as any)?.apiToken}`,
              },
            }
          );
          const data = await response.json();
          if (data.success && data.data) {
            setAd(data.data);
            setIsOwner(true);
            setLoading(false);
            return;
          }
        } catch {
          // Fall through to public endpoint
        }
      }

      // Try public endpoint
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/wanted-ads/${id}`
        );
        const data = await response.json();
        if (data.success && data.data) {
          setAd(data.data);
          setLoading(false);
          return;
        }
      } catch {
        // Not found
      }

      setNotFound(true);
      setLoading(false);
    };

    fetchAd();
  }, [params, session]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
          <div className="h-8 w-2/3 bg-gray-200 rounded mb-4" />
          <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="card h-48" />
              <div className="card h-64" />
            </div>
            <div className="card h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !ad) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Buyer Interest Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This buyer interest may have been removed or is not publicly visible.
          </p>
          <Link href="/explore" className="btn-primary">
            Explore Buyer Demand
          </Link>
        </div>
      </div>
    );
  }

  const propertyTypes = parseJsonArray(ad.propertyTypes);
  const features = parseJsonArray(ad.features);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href={isOwner ? "/buyer/my-ads" : "/explore"}
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {isOwner ? "Back to My Interests" : "Back to Explorer"}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {ad.title}
          </h1>
          {isOwner && ad.targetType === "SPECIFIC_ADDRESS" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Specific Property
            </span>
          )}
        </div>
        <p className="text-xl font-semibold text-primary-600 mt-2">
          {formatNZD(ad.budget)}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* For SPECIFIC_ADDRESS: Show the property prominently */}
          {ad.targetType === "SPECIFIC_ADDRESS" && ad.targetAddresses && ad.targetAddresses.length > 0 ? (
            <>
              {/* Property Card(s) */}
              {isOwner ? (
                <div className="space-y-6">
                  {ad.targetAddresses.map((addr, i) => {
                    const propData = addr.propertyData;
                    return (
                      <div key={i} className="card overflow-hidden">
                        {/* Property Images */}
                        {propData?.streetViewUrl || propData?.aerialViewUrl ? (
                          <div className="grid grid-cols-2 gap-1 -mx-6 -mt-6 mb-4">
                            {propData.streetViewUrl && (
                              <div className="aspect-video bg-gray-100">
                                <img
                                  src={propData.streetViewUrl}
                                  alt="Street view"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {propData.aerialViewUrl && (
                              <div className="aspect-video bg-gray-100">
                                <img
                                  src={propData.aerialViewUrl}
                                  alt="Aerial view"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Address Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900">{addr.address}</h2>
                            <p className="text-sm text-gray-500">
                              {[addr.suburb, addr.city, addr.region].filter(Boolean).join(", ")}
                            </p>
                          </div>
                          {propData?.propertyType && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {PROPERTY_TYPE_LABELS[propData.propertyType] || propData.propertyType}
                            </span>
                          )}
                        </div>

                        {/* Property Stats Grid */}
                        {propData && (propData.bedrooms || propData.bathrooms || propData.garages || propData.landArea || propData.floorArea || propData.yearBuilt) && (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 py-4 border-t border-b border-gray-100">
                            {propData.bedrooms !== undefined && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{propData.bedrooms}</p>
                                <p className="text-xs text-gray-500">Beds</p>
                              </div>
                            )}
                            {propData.bathrooms !== undefined && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 7a2 2 0 012-2h6a2 2 0 012 2v1H7V7zM4 10h16v8a3 3 0 01-3 3H7a3 3 0 01-3-3v-8z" />
                                  </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{propData.bathrooms}</p>
                                <p className="text-xs text-gray-500">Baths</p>
                              </div>
                            )}
                            {propData.garages !== undefined && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                  </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{propData.garages}</p>
                                <p className="text-xs text-gray-500">Garage</p>
                              </div>
                            )}
                            {propData.landArea && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                                  </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{propData.landArea.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">m² Land</p>
                              </div>
                            )}
                            {propData.floorArea && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                  </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{propData.floorArea.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">m² Floor</p>
                              </div>
                            )}
                            {propData.yearBuilt && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{propData.yearBuilt}</p>
                                <p className="text-xs text-gray-500">Built</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Valuation Section */}
                        {propData?.capitalValue && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-medium text-gray-500">Council Valuation</h3>
                              {propData.valuationDate && (
                                <span className="text-xs text-gray-400">
                                  {new Date(propData.valuationDate).toLocaleDateString("en-NZ", {
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>

                            {/* Capital Value vs Your Budget Comparison */}
                            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">CV</span>
                                <span className="text-lg font-bold text-gray-900">{formatNZD(propData.capitalValue)}</span>
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600">Your Budget</span>
                                <span className="text-lg font-bold text-primary-600">{formatNZD(ad.budget)}</span>
                              </div>
                              {/* Budget comparison indicator */}
                              <div className="relative pt-2">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      ad.budget >= propData.capitalValue
                                        ? "bg-green-500"
                                        : ad.budget >= propData.capitalValue * 0.9
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${Math.min((ad.budget / propData.capitalValue) * 100, 100)}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1 text-xs">
                                  <span className={`${
                                    ad.budget >= propData.capitalValue
                                      ? "text-green-600 font-medium"
                                      : ad.budget >= propData.capitalValue * 0.9
                                        ? "text-amber-600 font-medium"
                                        : "text-red-600 font-medium"
                                  }`}>
                                    {ad.budget >= propData.capitalValue
                                      ? `${((ad.budget / propData.capitalValue - 1) * 100).toFixed(0)}% above CV`
                                      : `${((1 - ad.budget / propData.capitalValue) * 100).toFixed(0)}% below CV`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Land & Improvements breakdown */}
                            {(propData.landValue || propData.improvementsValue) && (
                              <div className="grid grid-cols-2 gap-3">
                                {propData.landValue && (
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Land Value</p>
                                    <p className="font-semibold text-gray-900">{formatNZD(propData.landValue)}</p>
                                  </div>
                                )}
                                {propData.improvementsValue && (
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Improvements</p>
                                    <p className="font-semibold text-gray-900">{formatNZD(propData.improvementsValue)}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Features */}
                        {propData?.features && propData.features.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Property Features</h3>
                            <div className="flex flex-wrap gap-2">
                              {propData.features.map((feature, j) => (
                                <span
                                  key={j}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {FEATURE_LABELS[feature] || feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No data fallback */}
                        {!propData && (
                          <div className="py-4 text-center text-gray-500">
                            <p className="text-sm">Property details not yet available</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Property of Interest
                  </h2>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      This buyer is interested in a specific property
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Address is only shared with the property owner
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {ad.description && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Message to Owner
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
                </div>
              )}

              {/* Budget info */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Buyer Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold text-primary-600">{formatNZD(ad.budget)}</span>
                  </div>
                  {ad.financeStatus && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Finance Status</span>
                      <span className="font-medium text-gray-900">{ad.financeStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Communication with Owner - only show for owner viewing their own ad */}
              {isOwner && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Communication with Owner
                  </h2>

                  {ad.postcardRequests && ad.postcardRequests.length > 0 ? (
                    <div className="space-y-4">
                      {ad.postcardRequests.map((postcard) => (
                        <div key={postcard.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Postcard Status Header */}
                          <div className={`px-4 py-3 ${
                            postcard.ownerResponseAt
                              ? "bg-green-50 border-b border-green-200"
                              : postcard.status === "SENT" || postcard.status === "DELIVERED"
                                ? "bg-blue-50 border-b border-blue-200"
                                : postcard.status === "APPROVED"
                                  ? "bg-amber-50 border-b border-amber-200"
                                  : "bg-gray-50 border-b border-gray-200"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {postcard.ownerResponseAt ? (
                                  <>
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <span className="font-medium text-green-800">Owner Responded</span>
                                  </>
                                ) : postcard.claimedAt ? (
                                  <>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </div>
                                    <span className="font-medium text-blue-800">Owner Viewed</span>
                                  </>
                                ) : postcard.status === "SENT" || postcard.status === "DELIVERED" ? (
                                  <>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <span className="font-medium text-blue-800">Postcard Sent</span>
                                  </>
                                ) : postcard.status === "APPROVED" ? (
                                  <>
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <span className="font-medium text-amber-800">Being Prepared</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Pending Review</span>
                                  </>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(postcard.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 space-y-3">
                            {/* Your message to owner */}
                            {postcard.customMessage && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Your message</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{postcard.customMessage}</p>
                              </div>
                            )}

                            {/* Owner's response */}
                            {postcard.ownerResponseAt && (
                              <div className="border-t border-gray-100 pt-3">
                                <p className="text-xs font-medium text-green-600 mb-2">Owner&apos;s Response</p>
                                <div className="bg-green-50 p-3 rounded-lg space-y-2">
                                  {postcard.ownerName && (
                                    <p className="font-medium text-gray-900">{postcard.ownerName}</p>
                                  )}
                                  {postcard.ownerMessage && (
                                    <p className="text-sm text-gray-700">{postcard.ownerMessage}</p>
                                  )}
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {postcard.ownerEmail && (
                                      <a href={`mailto:${postcard.ownerEmail}`} className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {postcard.ownerEmail}
                                      </a>
                                    )}
                                    {postcard.ownerPhone && (
                                      <a href={`tel:${postcard.ownerPhone}`} className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {postcard.ownerPhone}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Waiting for response */}
                            {!postcard.ownerResponseAt && (postcard.status === "SENT" || postcard.status === "DELIVERED") && (
                              <p className="text-sm text-gray-500 italic">
                                Waiting for the property owner to respond...
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-1">No postcard sent yet</p>
                      <p className="text-sm text-gray-500">
                        Send a postcard to reach out to the property owner
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Description */}
              {ad.description && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
                </div>
              )}

              {/* Property Requirements - Only for AREA or BOTH types */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Requirements
                </h2>
                <div className="space-y-4">
                  {/* Property Types */}
                  {propertyTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Property Types
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypes.map((type: string) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {PROPERTY_TYPE_LABELS[type] || type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-2 gap-4">
                    {(ad.bedroomsMin || ad.bedroomsMax) && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Bedrooms</p>
                        <p className="text-gray-900">
                          {formatBedroomRange(ad.bedroomsMin, ad.bedroomsMax)}
                        </p>
                      </div>
                    )}
                    {ad.bathroomsMin && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Bathrooms</p>
                        <p className="text-gray-900">{ad.bathroomsMin}+</p>
                      </div>
                    )}
                  </div>

                  {/* Land & Floor Area */}
                  {(ad.landSizeMin || ad.landSizeMax || ad.floorAreaMin || ad.floorAreaMax) && (
                    <div className="grid grid-cols-2 gap-4">
                      {(ad.landSizeMin || ad.landSizeMax) && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Land Size</p>
                          <p className="text-gray-900">
                            {ad.landSizeMin && ad.landSizeMax
                              ? `${formatPropertySize(ad.landSizeMin)} - ${formatPropertySize(ad.landSizeMax)}`
                              : ad.landSizeMin
                                ? `${formatPropertySize(ad.landSizeMin)}+`
                                : `Up to ${formatPropertySize(ad.landSizeMax)}`}
                          </p>
                        </div>
                      )}
                      {(ad.floorAreaMin || ad.floorAreaMax) && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Floor Area</p>
                          <p className="text-gray-900">
                            {ad.floorAreaMin && ad.floorAreaMax
                              ? `${formatPropertySize(ad.floorAreaMin)} - ${formatPropertySize(ad.floorAreaMax)}`
                              : ad.floorAreaMin
                                ? `${formatPropertySize(ad.floorAreaMin)}+`
                                : `Up to ${formatPropertySize(ad.floorAreaMax)}`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  {features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Desired Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {features.map((feature: string) => (
                          <span
                            key={feature}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800"
                          >
                            {FEATURE_LABELS[feature] || feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Locations */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Target Locations
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  {ad.targetType === "AREA" && "Looking in specific areas"}
                  {ad.targetType === "BOTH" &&
                    "Looking for specific properties and general areas"}
                </p>

                {ad.targetLocations && ad.targetLocations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {ad.targetLocations.map((loc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          <span className="text-xs text-primary-600">
                            {loc.locationType}:
                          </span>
                          {loc.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show actual addresses if owner, otherwise show count */}
                {ad.targetAddresses && ad.targetAddresses.length > 0 && (
                  isOwner ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Specific Properties</p>
                      <div className="space-y-2">
                        {ad.targetAddresses.map((addr, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                          >
                            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium text-amber-900">{addr.address}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-primary-600">
                          {ad.targetAddresses.length}
                        </span>{" "}
                        specific {ad.targetAddresses.length === 1 ? "property" : "properties"} of interest
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Addresses are only shared with registered property owners who match
                      </p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar - only show for non-owners */}
        {!isOwner && (
          <div className="space-y-6">
            {/* Buyer Info */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                About the Buyer
              </h2>
              <div className="flex items-center gap-3 mb-4">
                {ad.buyer?.image ? (
                  <img
                    src={ad.buyer.image}
                    alt={ad.buyer.name || "Buyer"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {(ad.buyer?.name || "B").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {ad.buyer?.name || "Anonymous Buyer"}
                  </p>
                  <p className="text-sm text-gray-500">Verified Buyer</p>
                </div>
              </div>
            </div>

            {/* CTA for Owners */}
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Own a matching property?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Register your property to see if it matches this buyer&apos;s
                requirements and connect directly.
              </p>
              <Link href="/owner/register" className="btn-primary w-full text-center">
                Register Your Property
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
