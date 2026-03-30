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
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-raised rounded w-1/3 mb-4" />
          <div className="h-4 bg-surface-raised rounded w-2/3 mb-8" />
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
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-primary mb-4 font-display">
            Sign in to View Your Properties
          </h1>
          <p className="text-secondary mb-6">
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
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary font-display">My Properties</h1>
          <p className="text-secondary">
            See buyer demand for your properties.
          </p>
        </div>
        <Link href="/owner/register" className="btn-primary">
          Register Property
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-error-light border border-error rounded-lg text-error mb-6">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold text-primary mb-2 font-display">
            No properties registered
          </h2>
          <p className="text-secondary mb-6">
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
              className="card block hover:border-accent transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-primary mb-1 font-display">
                    {property.address}
                  </h2>
                  <p className="text-secondary text-sm mb-2">
                    {[property.suburb, property.city, property.region]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  <div className="flex flex-wrap gap-2 text-sm text-secondary">
                    <span className="badge-neutral">
                      {PROPERTY_TYPE_LABELS[property.propertyType] ||
                        property.propertyType}
                    </span>
                    {property.bedrooms && (
                      <span className="tabular-nums">{property.bedrooms} bed</span>
                    )}
                    {property.bathrooms && (
                      <span className="tabular-nums">{property.bathrooms} bath</span>
                    )}
                    {property.estimatedValue && (
                      <span className="tabular-nums">{formatNZD(property.estimatedValue)}</span>
                    )}
                  </div>

                  <p className="text-xs text-muted mt-2">
                    Added {formatRelativeTime(property.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Demand count */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent tabular-nums">
                      {property.demandCount}
                    </p>
                    <p className="text-xs text-secondary">
                      {property.demandCount === 1
                        ? "interested buyer"
                        : "interested buyers"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <span className="text-sm text-accent hover:text-accent-hover">
                      View Details
                    </span>
                    <button
                      onClick={(e) => deleteProperty(property.id, e)}
                      className="text-sm text-error hover:text-error-hover"
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
