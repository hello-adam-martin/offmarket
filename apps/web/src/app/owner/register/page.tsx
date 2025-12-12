"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NZ_REGIONS } from "@offmarket/types";
import { PROPERTY_TYPES, FEATURES } from "@/lib/constants";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

export default function RegisterPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [landSize, setLandSize] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [estimatedValue, setEstimatedValue] = useState("");
  const [rvValue, setRvValue] = useState("");

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({
            address,
            suburb: suburb || undefined,
            city: city || undefined,
            region: region || undefined,
            postcode: postcode || undefined,
            propertyType,
            bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
            bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
            landSize: landSize ? parseInt(landSize) : undefined,
            floorArea: floorArea ? parseInt(floorArea) : undefined,
            yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
            features: features.length > 0 ? features : undefined,
            estimatedValue: estimatedValue
              ? parseInt(estimatedValue) * 1000
              : undefined,
            rvValue: rvValue ? parseInt(rvValue) * 1000 : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to register property");
      }

      router.push("/owner/my-properties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="card h-96" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to Register Your Property
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to register your property and see buyer
            demand.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/owner/register"
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Register Your Property
        </h1>
        <p className="text-gray-600">
          Add your property details to see how many buyers are interested.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Property Address
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="label">
                Street Address *
              </label>
              <AddressAutocomplete
                id="address"
                value={address}
                onChange={setAddress}
                onSelect={(selected) => {
                  setAddress(selected.formattedAddress);
                  // Auto-fill location fields from Google Places
                  if (selected.components.sublocality) {
                    setSuburb(selected.components.sublocality);
                  }
                  if (selected.components.locality) {
                    setCity(selected.components.locality);
                  }
                  if (selected.components.administrativeArea) {
                    // Try to match to NZ region
                    const matchedRegion = NZ_REGIONS.find(
                      (r) =>
                        r.name.toLowerCase() ===
                        selected.components.administrativeArea?.toLowerCase()
                    );
                    if (matchedRegion) {
                      setRegion(matchedRegion.name);
                    }
                  }
                  if (selected.components.postalCode) {
                    setPostcode(selected.components.postalCode);
                  }
                }}
                placeholder="Start typing an address..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing to search for NZ addresses
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="suburb" className="label">
                  Suburb
                </label>
                <input
                  type="text"
                  id="suburb"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="e.g., Ponsonby"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="city" className="label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Auckland"
                  className="input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="region" className="label">
                  Region
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="input"
                >
                  <option value="">Select region</option>
                  {NZ_REGIONS.map((r) => (
                    <option key={r.code} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="postcode" className="label">
                  Postcode
                </label>
                <input
                  type="text"
                  id="postcode"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g., 1011"
                  maxLength={4}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Property Details
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="propertyType" className="label">
                Property Type *
              </label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                required
                className="input"
              >
                <option value="">Select type</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bedrooms" className="label">
                  Bedrooms
                </label>
                <select
                  id="bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="input"
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bathrooms" className="label">
                  Bathrooms
                </label>
                <select
                  id="bathrooms"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="input"
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Property Size
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="landSize" className="label">
                Land Size (m²)
              </label>
              <input
                type="number"
                id="landSize"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                placeholder="e.g., 600"
                min="0"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="floorArea" className="label">
                Floor Area (m²)
              </label>
              <input
                type="number"
                id="floorArea"
                value={floorArea}
                onChange={(e) => setFloorArea(e.target.value)}
                placeholder="e.g., 180"
                min="0"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="yearBuilt" className="label">
                Year Built
              </label>
              <input
                type="number"
                id="yearBuilt"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                placeholder="e.g., 1990"
                min="1800"
                max={new Date().getFullYear()}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((feature) => (
              <button
                key={feature.value}
                type="button"
                onClick={() => toggleFeature(feature.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  features.includes(feature.value)
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        {/* Valuation */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Valuation (Optional)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Adding valuations helps match your property with buyers in the right
            budget range.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimatedValue" className="label">
                Estimated Value ($000s)
              </label>
              <input
                type="number"
                id="estimatedValue"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="e.g., 1200"
                min="0"
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                {estimatedValue &&
                  `$${parseInt(estimatedValue).toLocaleString()},000`}
              </p>
            </div>
            <div>
              <label htmlFor="rvValue" className="label">
                RV / CV ($000s)
              </label>
              <input
                type="number"
                id="rvValue"
                value={rvValue}
                onChange={(e) => setRvValue(e.target.value)}
                placeholder="e.g., 1100"
                min="0"
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                {rvValue && `$${parseInt(rvValue).toLocaleString()},000`}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !address || !propertyType}
            className="btn-primary flex-1"
          >
            {loading ? "Registering..." : "Register Property"}
          </button>
          <Link href="/owner" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
