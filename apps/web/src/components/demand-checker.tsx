"use client";

import { useState } from "react";
import { AddressAutocomplete } from "./AddressAutocomplete";

interface DemandResult {
  address: string;
  suburb?: string;
  city?: string;
  buyerCount: number;
  hasInterest: boolean;
  message: string;
}

export function DemandChecker() {
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemandResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (address) params.append("address", address);
      if (suburb) params.append("suburb", suburb);
      if (city) params.append("city", city);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/check-demand?${params}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to check demand");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleCheck} className="card">
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="label">
              Street Address
            </label>
            <AddressAutocomplete
              id="address"
              value={address}
              onChange={setAddress}
              onSelect={(selected) => {
                setAddress(selected.formattedAddress);
                if (selected.components.sublocality) {
                  setSuburb(selected.components.sublocality);
                }
                if (selected.components.locality) {
                  setCity(selected.components.locality);
                }
              }}
              placeholder="Start typing an NZ address..."
            />
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
          <button
            type="submit"
            disabled={loading || (!address && !suburb && !city)}
            className="btn-primary w-full"
          >
            {loading ? "Checking..." : "Check Demand"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div
          className={`mt-4 p-6 rounded-lg border ${
            result.hasInterest
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="text-center">
            {result.hasInterest ? (
              <>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {result.buyerCount}
                </div>
                <p className="text-lg text-green-700 font-medium">
                  {result.buyerCount === 1
                    ? "Buyer Interested"
                    : "Buyers Interested"}
                </p>
                <p className="text-gray-600 mt-2">{result.message}</p>
                <a
                  href="/owner"
                  className="btn-primary mt-4 inline-block"
                >
                  Register to See More Details
                </a>
              </>
            ) : (
              <>
                <p className="text-gray-600">{result.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Be the first to know when buyers register interest in this
                  area.
                </p>
                <a
                  href="/owner"
                  className="btn-secondary mt-4 inline-block"
                >
                  Get Notified
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
