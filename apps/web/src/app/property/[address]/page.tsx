import { api } from "@/lib/api";
import { PROPERTY_TYPE_LABELS, FEATURE_LABELS } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatNZD, formatRelativeTime } from "@offmarket/utils";

export const dynamic = "force-dynamic";

interface PropertyDemandDetail {
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  buyerCount: number;
  budgetRange: {
    min: number;
    max: number;
    average: number;
  };
  propertyTypesWanted: string[];
  featuresWanted: string[];
  bedroomRequirements: { min?: number; max?: number }[];
  oldestInterest: string;
  newestInterest: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: encodedAddress } = await params;
  const response = await api.getPropertyDemandDetail(encodedAddress);

  if (!response.success || !response.data) {
    return { title: "Property Not Found | OffMarket NZ" };
  }

  const data = response.data as PropertyDemandDetail;
  const location = [data.suburb, data.city].filter(Boolean).join(", ");

  return {
    title: `${data.address}${location ? `, ${location}` : ""} - ${data.buyerCount} Interested Buyers | OffMarket NZ`,
    description: `${data.buyerCount} buyers interested in this property with budgets from ${formatNZD(data.budgetRange.min)} to ${formatNZD(data.budgetRange.max)}`,
  };
}

export default async function PropertyDemandPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: encodedAddress } = await params;
  const response = await api.getPropertyDemandDetail(encodedAddress);

  if (!response.success || !response.data) {
    notFound();
  }

  const data = response.data as PropertyDemandDetail;
  const location = [data.suburb, data.city, data.region].filter(Boolean).join(", ");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/explore"
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
        Back to Explorer
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {data.address}
          </h1>
          {location && <p className="text-lg text-gray-600 mt-1">{location}</p>}
        </div>
        <Link href="/buyer/create" className="btn-primary shrink-0">
          I Want to Buy This Property
        </Link>
      </div>

      {/* Demand Overview Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Buyer Count - Hero stat */}
          <div className="flex-shrink-0 text-center md:text-left md:pr-6 md:border-r md:border-primary-200">
            <p className="text-5xl font-bold text-primary-600">{data.buyerCount}</p>
            <p className="text-gray-600 font-medium">
              Interested {data.buyerCount === 1 ? "Buyer" : "Buyers"}
            </p>
          </div>

          {/* Budget Range Visual */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-3">Budget Range</p>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{formatNZD(data.budgetRange.min)}</p>
                <p className="text-xs text-gray-500">Low</p>
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-300 to-primary-500 rounded-full" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full border-2 border-white shadow"
                  style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{formatNZD(data.budgetRange.max)}</p>
                <p className="text-xs text-gray-500">High</p>
              </div>
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              Average: <span className="font-semibold text-primary-600">{formatNZD(data.budgetRange.average)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        {/* Buyer Requirements */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What Buyers Want
          </h2>

          {data.propertyTypesWanted.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Property Types
              </p>
              <div className="flex flex-wrap gap-2">
                {data.propertyTypesWanted.map((type) => (
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

          {data.bedroomRequirements.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Bedrooms</p>
              <div className="flex flex-wrap gap-2">
                {data.bedroomRequirements.map((req, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {req.min && req.max
                      ? `${req.min}-${req.max} bed`
                      : req.min
                        ? `${req.min}+ bed`
                        : `Up to ${req.max} bed`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.featuresWanted.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Desired Features
              </p>
              <div className="flex flex-wrap gap-2">
                {data.featuresWanted.map((feature) => (
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

          {data.propertyTypesWanted.length === 0 &&
            data.bedroomRequirements.length === 0 &&
            data.featuresWanted.length === 0 && (
              <p className="text-gray-500 text-sm">
                Buyers haven&apos;t specified detailed requirements.
              </p>
            )}
        </div>
      </div>

      {/* Interest Timeline */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Interest Timeline
        </h2>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">First interest</p>
            <p className="font-medium text-gray-900">
              {formatRelativeTime(data.oldestInterest)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Most recent</p>
            <p className="font-medium text-gray-900">
              {formatRelativeTime(data.newestInterest)}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="card mt-6 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Is this your property?
          </h3>
          <p className="text-gray-600 mb-4">
            Register your property to connect with these interested buyers and
            start a conversation.
          </p>
          <Link href="/owner/register" className="btn-primary">
            Register This Property
          </Link>
        </div>
      </div>
    </div>
  );
}
