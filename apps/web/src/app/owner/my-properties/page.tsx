"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatNZD, formatRelativeTime } from "@offmarket/utils";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";

interface Property {
  id: string;
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  estimatedValue?: number;
  demandCount: number;
  createdAt: string;
}

export default function MyPropertiesPage() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchMyProperties();
    }
  }, [session]);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/me`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setProperties(data.data || []);
      } else {
        setError(data.error?.message || "Failed to load properties");
      }
    } catch {
      setError("Failed to load your properties");
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } catch {
      console.error("Failed to delete property");
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
            Sign in to View Your Properties
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view and manage your registered
            properties.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/owner/my-properties"
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
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600">
            See buyer demand for your properties.
          </p>
        </div>
        <Link href="/owner/register" className="btn-primary">
          Register Property
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No properties registered
          </h2>
          <p className="text-gray-600 mb-6">
            Register your property to see how many buyers are interested.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/owner/register" className="btn-primary">
              Register Your First Property
            </Link>
            <Link href="/explore" className="btn-secondary">
              Explore Buyer Demand
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/owner/properties/${property.id}`}
              className="card block hover:border-primary-300 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {property.address}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    {[property.suburb, property.city, property.region]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {PROPERTY_TYPE_LABELS[property.propertyType] ||
                        property.propertyType}
                    </span>
                    {property.bedrooms && (
                      <span>{property.bedrooms} bed</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} bath</span>
                    )}
                    {property.estimatedValue && (
                      <span>{formatNZD(property.estimatedValue)}</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Added {formatRelativeTime(property.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Demand count */}
                  <div className="text-center">
                    <p
                      className={`text-2xl font-bold ${property.demandCount > 0 ? "text-primary-600" : "text-gray-400"}`}
                    >
                      {property.demandCount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {property.demandCount === 1
                        ? "interested buyer"
                        : "interested buyers"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <span className="text-sm text-primary-600">
                      View Details
                    </span>
                    <button
                      onClick={(e) => deleteProperty(property.id, e)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
