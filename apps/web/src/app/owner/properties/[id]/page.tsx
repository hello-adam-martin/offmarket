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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-6" />
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in Required
          </h1>
          <p className="text-gray-600 mb-6">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Property Not Found
          </h1>
          <p className="text-gray-600 mb-6">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/owner/my-properties"
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
        Back to My Properties
      </Link>

      {/* Header with Property Info & Demand Summary */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Property Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {property.address}
            </h1>
            {location && (
              <p className="flex items-center gap-1.5 text-gray-600 mt-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>
            )}

            {/* Property Details Row */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
              {property.propertyType && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
                </span>
              )}
              {property.bedrooms && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v11a1 1 0 001 1h16a1 1 0 001-1V7M3 7l9-4 9 4M12 22V11" />
                  </svg>
                  {property.bedrooms} bed
                </span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                  {property.bathrooms} bath
                </span>
              )}
              {property.landSize && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                  </svg>
                  {property.landSize.toLocaleString()} m² land
                </span>
              )}
              {property.floorArea && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {property.floorArea.toLocaleString()} m² floor
                </span>
              )}
              {property.estimatedValue && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatNZD(property.estimatedValue)}
                </span>
              )}
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {property.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    {FEATURE_LABELS[feature] || feature}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Added {formatRelativeTime(property.createdAt)}
            </p>
          </div>

          {/* Demand Summary */}
          <div className="flex-shrink-0 lg:w-64 p-4 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Buyer Demand</h2>
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-primary-600">
                {demand?.totalBuyers || 0}
              </p>
              <p className="text-xs text-gray-600">
                Interested {(demand?.totalBuyers || 0) === 1 ? "Buyer" : "Buyers"}
              </p>
            </div>
            {demand && demand.totalBuyers > 0 && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">{demand.directInterestCount || 0}</p>
                    <p className="text-xs text-green-700">Direct</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-lg font-bold text-blue-600">{demand.criteriaMatchCount || 0}</p>
                    <p className="text-xs text-blue-700">Criteria</p>
                  </div>
                </div>
                <div className="text-center pt-2 border-t border-primary-100">
                  <p className="text-xs text-gray-500">
                    {demand.budgetRange.min === demand.budgetRange.max ? "Budget" : "Budget Range"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
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
            <h2 className="text-lg font-semibold text-gray-900">Property Photos</h2>
            <p className="text-sm text-gray-600">
              Add photos to share with interested buyers
            </p>
          </div>
          <button
            onClick={() => setShowImages(!showImages)}
            className="text-sm text-primary-600 hover:text-primary-800"
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
                className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500 hover:bg-gray-200"
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
            <div className="card border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Direct Interest ({demand.directInterestCount})
                  </h2>
                  <p className="text-sm text-green-700">
                    These buyers specifically named your property address
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {demand.directInterest.map((match) => (
                  <div
                    key={match.matchId}
                    className="p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {match.buyerName || "Anonymous"}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(match.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: {formatNZD(typeof match.buyerBudget === "number" ? match.buyerBudget : match.buyerBudget.min)}
                        </p>
                      </div>
                      <button
                        onClick={() => setContactModal({ isOpen: true, buyer: match })}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Criteria Matches {demand?.criteriaMatchCount ? `(${demand.criteriaMatchCount})` : ""}
                </h2>
                <p className="text-sm text-gray-600">
                  Buyers searching for properties matching your criteria
                </p>
              </div>
              <button
                onClick={calculateMatches}
                disabled={calculatingMatches}
                className="text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
              >
                {calculatingMatches ? "Refreshing..." : "Refresh Matches"}
              </button>
            </div>

            {!demand || (demand.criteriaMatches?.length === 0 && demand.directInterest?.length === 0) ? (
              <div className="text-center py-8">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">No matching buyers yet</p>
                <p className="text-sm text-gray-500">
                  Try refreshing matches or wait for new buyers to register interest in your area.
                </p>
              </div>
            ) : demand.criteriaMatches?.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No criteria-based matches yet.</p>
                <p className="text-sm mt-1">All current interest is from buyers who specifically want your property.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {demand.criteriaMatches?.map((match) => (
                  <div
                    key={match.matchId}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/wanted/${match.wantedAdId}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {match.wantedAdTitle}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: {formatNZD(typeof match.buyerBudget === "number" ? match.buyerBudget : match.buyerBudget.min)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.matchedOn.map((criterion) => (
                            <span
                              key={criterion}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
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
                        <p className="text-xs text-gray-500 mt-2">
                          Matched {formatRelativeTime(match.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-2xl font-bold ${
                            match.matchScore >= 75
                              ? "text-green-600"
                              : match.matchScore >= 50
                                ? "text-yellow-600"
                                : "text-orange-600"
                          }`}
                        >
                          {match.matchScore}%
                        </p>
                        <p className="text-xs text-gray-500">
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
