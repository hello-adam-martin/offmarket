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
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-surface-raised rounded mb-6" />
          <div className="h-8 w-2/3 bg-surface-raised rounded mb-4" />
          <div className="h-6 w-32 bg-surface-raised rounded mb-8" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <h1 className="text-xl font-semibold font-display text-primary mb-4">
            Buyer Interest Not Found
          </h1>
          <p className="text-secondary mb-6">
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
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href={isOwner ? "/buyer/my-ads" : "/explore"}
        className="inline-flex items-center gap-1 text-secondary hover:text-primary mb-6"
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
          <h1 className="text-xl font-semibold font-display text-primary md:text-2xl">
            {ad.title}
          </h1>
          {isOwner && ad.targetType === "SPECIFIC_ADDRESS" && (
            <span className="badge-warning shrink-0">
              Specific Property
            </span>
          )}
        </div>
        <p className="text-xl font-semibold tabular-nums text-accent mt-2">
          {formatNZD(ad.budget)}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
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
                              <div className="aspect-video bg-surface-raised">
                                <img
                                  src={propData.streetViewUrl}
                                  alt="Street view"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {propData.aerialViewUrl && (
                              <div className="aspect-video bg-surface-raised">
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
                          <svg className="w-5 h-5 text-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <div className="flex-1">
                            <h2 className="text-base font-semibold text-primary font-display">{addr.address}</h2>
                            <p className="text-sm text-muted">
                              {[addr.suburb, addr.city, addr.region].filter(Boolean).join(", ")}
                            </p>
                          </div>
                          {propData?.propertyType && (
                            <span className="badge-neutral">
                              {PROPERTY_TYPE_LABELS[propData.propertyType] || propData.propertyType}
                            </span>
                          )}
                        </div>

                        {/* Property Stats Grid */}
                        {propData && (propData.bedrooms || propData.bathrooms || propData.garages || propData.landArea || propData.floorArea || propData.yearBuilt) && (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 py-4 border-t border-b border-border">
                            {propData.bedrooms !== undefined && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                </div>
                                <p className="text-base font-semibold tabular-nums text-primary">{propData.bedrooms}</p>
                                <p className="text-xs text-muted">Beds</p>
                              </div>
                            )}
                            {propData.bathrooms !== undefined && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 7a2 2 0 012-2h6a2 2 0 012 2v1H7V7zM4 10h16v8a3 3 0 01-3 3H7a3 3 0 01-3-3v-8z" />
                                  </svg>
                                </div>
                                <p className="text-base font-semibold tabular-nums text-primary">{propData.bathrooms}</p>
                                <p className="text-xs text-muted">Baths</p>
                              </div>
                            )}
                            {propData.garages !== undefined && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                  </svg>
                                </div>
                                <p className="text-base font-semibold tabular-nums text-primary">{propData.garages}</p>
                                <p className="text-xs text-muted">Garage</p>
                              </div>
                            )}
                            {propData.landArea && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                                  </svg>
                                </div>
                                <p className="text-base font-semibold tabular-nums text-primary">{propData.landArea.toLocaleString()}</p>
                                <p className="text-xs text-muted">m² Land</p>
                              </div>
                            )}
                            {propData.floorArea && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                  </svg>
                                </div>
                                <p className="text-base font-semibold tabular-nums text-primary">{propData.floorArea.toLocaleString()}</p>
                                <p className="text-xs text-muted">m² Floor</p>
                              </div>
                            )}
                            {propData.yearBuilt && (
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-base font-semibold tabular-nums text-primary">{propData.yearBuilt}</p>
                                <p className="text-xs text-muted">Built</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Valuation Section */}
                        {propData?.capitalValue && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-medium text-secondary font-display">Council Valuation</h3>
                              {propData.valuationDate && (
                                <span className="text-xs text-muted">
                                  {new Date(propData.valuationDate).toLocaleDateString("en-NZ", {
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>

                            {/* Capital Value vs Your Budget Comparison */}
                            <div className="bg-surface-raised rounded-md p-4 mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-secondary">CV</span>
                                <span className="text-base font-semibold tabular-nums text-primary">{formatNZD(propData.capitalValue)}</span>
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-secondary">Your Budget</span>
                                <span className="text-base font-semibold tabular-nums text-accent">{formatNZD(ad.budget)}</span>
                              </div>
                              {/* Budget comparison indicator */}
                              <div className="relative pt-2">
                                <div className="h-2 bg-border rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      ad.budget >= propData.capitalValue
                                        ? "bg-success"
                                        : ad.budget >= propData.capitalValue * 0.9
                                          ? "bg-warning"
                                          : "bg-error"
                                    }`}
                                    style={{
                                      width: `${Math.min((ad.budget / propData.capitalValue) * 100, 100)}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1 text-xs">
                                  <span className={`font-medium tabular-nums ${
                                    ad.budget >= propData.capitalValue
                                      ? "text-success"
                                      : ad.budget >= propData.capitalValue * 0.9
                                        ? "text-warning"
                                        : "text-error"
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
                                  <div className="text-center p-3 bg-surface-raised rounded-md">
                                    <p className="text-xs text-muted mb-1">Land Value</p>
                                    <p className="font-semibold tabular-nums text-primary">{formatNZD(propData.landValue)}</p>
                                  </div>
                                )}
                                {propData.improvementsValue && (
                                  <div className="text-center p-3 bg-surface-raised rounded-md">
                                    <p className="text-xs text-muted mb-1">Improvements</p>
                                    <p className="font-semibold tabular-nums text-primary">{formatNZD(propData.improvementsValue)}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Features */}
                        {propData?.features && propData.features.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <h3 className="text-sm font-medium text-secondary mb-2 font-display">Property Features</h3>
                            <div className="flex flex-wrap gap-2">
                              {propData.features.map((feature, j) => (
                                <span
                                  key={j}
                                  className="badge-neutral"
                                >
                                  {FEATURE_LABELS[feature] || feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No data fallback */}
                        {!propData && (
                          <div className="py-4 text-center text-secondary">
                            <p className="text-sm">Property details not yet available</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card">
                  <h2 className="text-base font-semibold text-primary mb-4 font-display">
                    Property of Interest
                  </h2>
                  <div className="p-4 bg-surface-raised rounded-md text-center">
                    <svg className="w-5 h-5 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-sm text-secondary">
                      This buyer is interested in a specific property
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Address is only shared with the property owner
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {ad.description && (
                <div className="card">
                  <h2 className="text-base font-semibold text-primary mb-3 font-display">
                    Message to Owner
                  </h2>
                  <p className="text-secondary whitespace-pre-wrap">{ad.description}</p>
                </div>
              )}

              {/* Budget info */}
              <div className="card">
                <h2 className="text-base font-semibold text-primary mb-4 font-display">
                  Buyer Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-secondary">Budget</span>
                    <span className="font-semibold tabular-nums text-accent">{formatNZD(ad.budget)}</span>
                  </div>
                  {ad.financeStatus && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-secondary">Finance Status</span>
                      <span className="font-medium text-primary">{ad.financeStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Communication with Owner - only show for owner viewing their own ad */}
              {isOwner && (
                <div className="card">
                  <h2 className="text-base font-semibold text-primary mb-4 font-display">
                    Communication with Owner
                  </h2>

                  {ad.postcardRequests && ad.postcardRequests.length > 0 ? (
                    <div className="space-y-4">
                      {ad.postcardRequests.map((postcard) => (
                        <div key={postcard.id} className="border border-border rounded-md overflow-hidden">
                          {/* Postcard Status Header */}
                          <div className={`px-4 py-3 ${
                            postcard.ownerResponseAt
                              ? "bg-success-light border-b border-border"
                              : postcard.status === "SENT" || postcard.status === "DELIVERED"
                                ? "bg-accent-light border-b border-border"
                                : postcard.status === "APPROVED"
                                  ? "bg-secondary-light border-b border-border"
                                  : "bg-surface-raised border-b border-border"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {postcard.ownerResponseAt ? (
                                  <>
                                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium text-success">Owner Responded</span>
                                  </>
                                ) : postcard.claimedAt ? (
                                  <>
                                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="font-medium text-accent">Owner Viewed</span>
                                  </>
                                ) : postcard.status === "SENT" || postcard.status === "DELIVERED" ? (
                                  <>
                                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium text-accent">Postcard Sent</span>
                                  </>
                                ) : postcard.status === "APPROVED" ? (
                                  <>
                                    <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium text-warning">Being Prepared</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium text-secondary">Pending Review</span>
                                  </>
                                )}
                              </div>
                              <span className="text-xs text-muted">
                                {formatRelativeTime(postcard.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 space-y-3">
                            {/* Your message to owner */}
                            {postcard.customMessage && (
                              <div>
                                <p className="text-xs font-medium text-muted mb-1">Your message</p>
                                <p className="text-sm text-secondary bg-surface-raised p-2 rounded-sm">{postcard.customMessage}</p>
                              </div>
                            )}

                            {/* Owner's response */}
                            {postcard.ownerResponseAt && (
                              <div className="border-t border-border pt-3">
                                <p className="text-xs font-medium text-success mb-2">Owner&apos;s Response</p>
                                <div className="bg-success-light p-3 rounded-sm space-y-2">
                                  {postcard.ownerName && (
                                    <p className="font-medium text-primary">{postcard.ownerName}</p>
                                  )}
                                  {postcard.ownerMessage && (
                                    <p className="text-sm text-secondary">{postcard.ownerMessage}</p>
                                  )}
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {postcard.ownerEmail && (
                                      <a href={`mailto:${postcard.ownerEmail}`} className="text-accent hover:text-accent-hover flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {postcard.ownerEmail}
                                      </a>
                                    )}
                                    {postcard.ownerPhone && (
                                      <a href={`tel:${postcard.ownerPhone}`} className="text-accent hover:text-accent-hover flex items-center gap-1">
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
                              <p className="text-sm text-muted italic">
                                Waiting for the property owner to respond...
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg className="w-5 h-5 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-secondary mb-1">No postcard sent yet</p>
                      <p className="text-sm text-muted">
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
                  <h2 className="text-base font-semibold text-primary mb-3 font-display">
                    Description
                  </h2>
                  <p className="text-secondary whitespace-pre-wrap">{ad.description}</p>
                </div>
              )}

              {/* Property Requirements - Only for AREA or BOTH types */}
              <div className="card">
                <h2 className="text-base font-semibold text-primary mb-4 font-display">
                  Property Requirements
                </h2>
                <div className="space-y-4">
                  {/* Property Types */}
                  {propertyTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-secondary mb-2">
                        Property Types
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypes.map((type: string) => (
                          <span
                            key={type}
                            className="badge-info"
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
                        <p className="text-sm font-medium text-secondary">Bedrooms</p>
                        <p className="tabular-nums text-primary">
                          {formatBedroomRange(ad.bedroomsMin, ad.bedroomsMax)}
                        </p>
                      </div>
                    )}
                    {ad.bathroomsMin && (
                      <div>
                        <p className="text-sm font-medium text-secondary">Bathrooms</p>
                        <p className="tabular-nums text-primary">{ad.bathroomsMin}+</p>
                      </div>
                    )}
                  </div>

                  {/* Land & Floor Area */}
                  {(ad.landSizeMin || ad.landSizeMax || ad.floorAreaMin || ad.floorAreaMax) && (
                    <div className="grid grid-cols-2 gap-4">
                      {(ad.landSizeMin || ad.landSizeMax) && (
                        <div>
                          <p className="text-sm font-medium text-secondary">Land Size</p>
                          <p className="tabular-nums text-primary">
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
                          <p className="text-sm font-medium text-secondary">Floor Area</p>
                          <p className="tabular-nums text-primary">
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
                      <p className="text-sm font-medium text-secondary mb-2">
                        Desired Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {features.map((feature: string) => (
                          <span
                            key={feature}
                            className="badge-info"
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
                <h2 className="text-base font-semibold text-primary mb-4 font-display">
                  Target Locations
                </h2>
                <p className="text-sm text-secondary mb-3">
                  {ad.targetType === "AREA" && "Looking in specific areas"}
                  {ad.targetType === "BOTH" &&
                    "Looking for specific properties and general areas"}
                </p>

                {ad.targetLocations && ad.targetLocations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-secondary mb-2">Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {ad.targetLocations.map((loc, i) => (
                        <span
                          key={i}
                          className="badge-info"
                        >
                          <span className="opacity-70 mr-1">
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
                      <p className="text-sm font-medium text-secondary mb-2">Specific Properties</p>
                      <div className="space-y-2">
                        {ad.targetAddresses.map((addr, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-3 bg-surface-raised border border-border rounded-md"
                          >
                            <svg className="w-5 h-5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium text-primary">{addr.address}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-surface-raised rounded-md">
                      <p className="text-sm text-secondary">
                        <span className="font-semibold tabular-nums text-accent">
                          {ad.targetAddresses.length}
                        </span>{" "}
                        specific {ad.targetAddresses.length === 1 ? "property" : "properties"} of interest
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Addresses are only shared with registered property owners who match
                      </p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Demand Panel - shown for all users */}
          <div className="card border-l-4 border-accent">
            <h2 className="text-xl tabular-nums font-semibold font-display text-primary mb-3">
              {formatNZD(ad.budget)}
            </h2>
            <div className="flex items-center gap-2 text-sm text-secondary mb-4">
              <span>Budget</span>
              <span className="text-muted">·</span>
              <span className="tabular-nums">{ad.isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="text-xs text-muted">
              Posted {formatRelativeTime(ad.createdAt)}
            </div>
          </div>

          {/* Buyer Info - only show for non-owners */}
          {!isOwner && (
            <>
              <div className="card">
                <h2 className="text-base font-semibold text-primary mb-4 font-display">
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
                    <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center">
                      <span className="text-accent font-semibold text-lg">
                        {(ad.buyer?.name || "B").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-primary">
                      {ad.buyer?.name || "Anonymous Buyer"}
                    </p>
                    <p className="text-sm text-muted">Verified Buyer</p>
                  </div>
                </div>
              </div>

              {/* CTA for Owners */}
              <div className="card border-l-4 border-accent">
                <h3 className="font-semibold text-primary mb-2 font-display">
                  Own a matching property?
                </h3>
                <p className="text-sm text-secondary mb-4">
                  Register your property to see if it matches this buyer&apos;s
                  requirements and connect directly.
                </p>
                <Link href="/owner/register" className="btn-primary w-full text-center">
                  Register Your Property
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
