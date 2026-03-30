"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  formatNZD,
  formatRelativeTime,
  getMatchScoreLabel,
} from "@offmarket/utils";
import { PROPERTY_TYPE_LABELS, FEATURE_LABELS } from "@/lib/constants";
import { ContactBuyerModal } from "@/components/ContactBuyerModal";
import { PropertyImageUpload } from "@/components/PropertyImageUpload";

interface PropertyImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  order: number;
  isPrimary: boolean;
}

interface Property {
  id: string;
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  landSize?: number;
  floorArea?: number;
  features?: string[];
  estimatedValue?: number;
  createdAt: string;
}

interface Match {
  matchId: string;
  matchScore: number;
  matchType: "DIRECT" | "CRITERIA";
  matchedOn: string[];
  buyerBudget: number | { min: number; max: number };
  buyerName?: string;
  buyerId?: string;
  wantedAdTitle: string;
  wantedAdId: string;
  createdAt: string;
}

interface DemandDetail {
  propertyId: string;
  totalBuyers: number;
  directInterestCount: number;
  criteriaMatchCount: number;
  budgetRange: { min: number; max: number; average: number };
  directInterest: Match[];
  criteriaMatches: Match[];
  matches: Match[];
}

export default function PropertyDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [demand, setDemand] = useState<DemandDetail | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatingMatches, setCalculatingMatches] = useState(false);
  const [contactModal, setContactModal] = useState<{ isOpen: boolean; buyer: Match | null }>({
    isOpen: false,
    buyer: null,
  });
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    if (session && propertyId) {
      fetchPropertyData();
    }
  }, [session, propertyId]);

  const fetchPropertyData = async () => {
    try {
      // Fetch property details
      const propertyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const propertyData = await propertyResponse.json();

      if (!propertyData.success) {
        throw new Error(propertyData.error?.message || "Property not found");
      }
      setProperty(propertyData.data);

      // Fetch demand details
      const demandResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}/demand`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const demandData = await demandResponse.json();

      if (demandData.success) {
        setDemand(demandData.data);
      }

      // Fetch property images
      const imagesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/uploads/properties/${propertyId}/images`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const imagesData = await imagesResponse.json();

      if (imagesData.success) {
        setImages(imagesData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  const calculateMatches = async () => {
    setCalculatingMatches(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matches/property/${propertyId}/calculate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Refresh data
        await fetchPropertyData();
      }
    } catch {
      console.error("Failed to calculate matches");
    } finally {
      setCalculatingMatches(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-raised rounded w-24 mb-6" />
          <div className="h-8 bg-surface-raised rounded w-2/3 mb-2" />
          <div className="h-4 bg-surface-raised rounded w-1/3 mb-8" />
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

  if (!session) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Sign in Required
          </h1>
          <p className="text-secondary mb-6">
            You need to be signed in to view your property details.
          </p>
          <Link
            href={`/auth/signin?callbackUrl=/owner/properties/${propertyId}`}
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Property Not Found
          </h1>
          <p className="text-secondary mb-6">
            {error || "This property doesn't exist or you don't have access to it."}
          </p>
          <Link href="/owner/my-properties" className="btn-primary">
            Back to My Properties
          </Link>
        </div>
      </div>
    );
  }

  const location = [property.suburb, property.city, property.region]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/owner/my-properties"
        className="inline-flex items-center gap-1 text-sm text-secondary hover:text-primary mb-6"
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
        Back to My Properties
      </Link>

      {/* Header with Property Info & Demand Summary */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Property Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              {property.address}
            </h1>
            {location && (
              <p className="flex items-center gap-1.5 text-secondary mt-1">
                <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>
            )}

            {/* Property Details Row */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-secondary">
              {property.propertyType && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
                </span>
              )}
              {property.bedrooms && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v11a1 1 0 001 1h16a1 1 0 001-1V7M3 7l9-4 9 4M12 22V11" />
                  </svg>
                  {property.bedrooms} bed
                </span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                  {property.bathrooms} bath
                </span>
              )}
              {property.landSize && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="tabular-nums">{property.landSize.toLocaleString()}</span> m² land
                </span>
              )}
              {property.floorArea && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span className="tabular-nums">{property.floorArea.toLocaleString()}</span> m² floor
                </span>
              )}
              {property.estimatedValue && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="tabular-nums">{formatNZD(property.estimatedValue)}</span>
                </span>
              )}
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {property.features.map((feature) => (
                  <span
                    key={feature}
                    className="badge-info"
                  >
                    {FEATURE_LABELS[feature] || feature}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-muted mt-3">
              Added {formatRelativeTime(property.createdAt)}
            </p>
          </div>

          {/* Demand Summary */}
          <div className="flex-shrink-0 lg:w-64 card border-l-4 border-accent">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-primary">Buyer Demand</h2>
            </div>
            <p className="text-xl font-bold text-accent tabular-nums mb-1">
              {demand?.totalBuyers || 0}
            </p>
            <p className="text-xs text-secondary mb-3">
              Interested {(demand?.totalBuyers || 0) === 1 ? "Buyer" : "Buyers"}
            </p>
            {demand && demand.totalBuyers > 0 && (
              <>
                <p className="text-sm text-secondary tabular-nums mb-3">
                  {demand.directInterestCount || 0} direct &middot; {demand.criteriaMatchCount || 0} criteria
                </p>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-secondary">
                    {demand.budgetRange.min === demand.budgetRange.max ? "Budget" : "Budget Range"}
                  </p>
                  <p className="text-sm font-semibold text-primary tabular-nums">
                    {demand.budgetRange.min === demand.budgetRange.max
                      ? formatNZD(demand.budgetRange.min)
                      : `${formatNZD(demand.budgetRange.min)} - ${formatNZD(demand.budgetRange.max)}`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Property Images Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Property Photos</h2>
            <p className="text-sm text-secondary">
              Add photos to share with interested buyers
            </p>
          </div>
          <button
            onClick={() => setShowImages(!showImages)}
            className="text-sm text-accent hover:text-accent-hover"
          >
            {showImages ? "Hide" : images.length > 0 ? `Show (${images.length})` : "Add Photos"}
          </button>
        </div>

        {showImages && (
          <PropertyImageUpload
            propertyId={propertyId}
            token={(session as any)?.apiToken || ""}
            images={images}
            onImagesChange={setImages}
          />
        )}

        {!showImages && images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(0, 4).map((image) => (
              <img
                key={image.id}
                src={image.url.startsWith("/uploads/")
                  ? `${process.env.NEXT_PUBLIC_API_URL}${image.url}`
                  : image.url}
                alt="Property"
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            ))}
            {images.length > 4 && (
              <button
                onClick={() => setShowImages(true)}
                className="w-24 h-24 bg-surface-raised rounded-lg flex-shrink-0 flex items-center justify-center text-secondary hover:opacity-80"
              >
                +{images.length - 4} more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main content - full width now */}
      <div className="space-y-6">

          {/* Direct Interest - Buyers who specifically want this property */}
          {demand && demand.directInterest && demand.directInterest.length > 0 && (
            <div className="card border-l-4 border-accent">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-primary">
                  Direct Interest ({demand.directInterestCount})
                </h2>
                <p className="text-sm text-secondary">
                  These buyers specifically named your property address
                </p>
              </div>

              <div className="space-y-3">
                {demand.directInterest.map((match) => (
                  <div
                    key={match.matchId}
                    className="p-4 bg-surface rounded-md border border-border hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-primary">
                            {match.buyerName || "Anonymous"}
                          </p>
                          <span className="text-xs text-muted">
                            {formatRelativeTime(match.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-secondary tabular-nums mt-1">
                          Budget: {formatNZD(typeof match.buyerBudget === "number" ? match.buyerBudget : match.buyerBudget.min)}
                        </p>
                      </div>
                      <button
                        onClick={() => setContactModal({ isOpen: true, buyer: match })}
                        className="btn-primary btn-sm flex-shrink-0"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Criteria Matches - Buyers looking for properties like yours */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Criteria Matches {demand?.criteriaMatchCount ? `(${demand.criteriaMatchCount})` : ""}
                </h2>
                <p className="text-sm text-secondary">
                  Buyers searching for properties matching your criteria
                </p>
              </div>
              <button
                onClick={calculateMatches}
                disabled={calculatingMatches}
                className="text-sm text-accent hover:text-accent-hover disabled:opacity-50"
              >
                {calculatingMatches ? "Refreshing..." : "Refresh Matches"}
              </button>
            </div>

            {!demand || (demand.criteriaMatches?.length === 0 && demand.directInterest?.length === 0) ? (
              <div className="text-center py-8">
                <svg
                  className="w-6 h-6 text-muted mx-auto mb-4"
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
                <p className="text-secondary mb-2">No matching buyers yet</p>
                <p className="text-sm text-muted">
                  Try refreshing matches or wait for new buyers to register interest in your area.
                </p>
              </div>
            ) : demand.criteriaMatches?.length === 0 ? (
              <div className="text-center py-6 text-secondary">
                <p>No criteria-based matches yet.</p>
                <p className="text-sm mt-1">All current interest is from buyers who specifically want your property.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {demand.criteriaMatches?.map((match) => (
                  <div
                    key={match.matchId}
                    className="p-4 bg-surface rounded-md border border-border hover:border-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/wanted/${match.wantedAdId}`}
                          className="font-medium text-primary hover:text-accent"
                        >
                          {match.wantedAdTitle}
                        </Link>
                        <p className="text-sm text-secondary tabular-nums mt-1">
                          Budget: {formatNZD(typeof match.buyerBudget === "number" ? match.buyerBudget : match.buyerBudget.min)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.matchedOn.map((criterion) => (
                            <span
                              key={criterion}
                              className="badge-info"
                            >
                              {criterion === "location" ? "Location" :
                               criterion === "budget" ? "Budget" :
                               criterion === "budget_partial" ? "Budget (close)" :
                               criterion === "propertyType" ? "Property type" :
                               criterion === "bedrooms" ? "Bedrooms" :
                               criterion === "features" ? "Features" : criterion}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted mt-2">
                          Matched {formatRelativeTime(match.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-accent tabular-nums">
                          {match.matchScore}%
                        </p>
                        <p className="text-xs text-secondary">
                          {getMatchScoreLabel(match.matchScore)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>

      {/* Contact Buyer Modal */}
      {contactModal.buyer && (
        <ContactBuyerModal
          isOpen={contactModal.isOpen}
          onClose={() => setContactModal({ isOpen: false, buyer: null })}
          buyerName={contactModal.buyer.buyerName || "This buyer"}
          buyerId={contactModal.buyer.buyerId || ""}
          propertyId={propertyId}
          propertyAddress={property.address}
          token={(session as any)?.apiToken || ""}
        />
      )}
    </div>
  );
}
