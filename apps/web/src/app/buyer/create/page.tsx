"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NZ_REGIONS } from "@offmarket/types";
import { PROPERTY_TYPES, FEATURES } from "@/lib/constants";
import { UpgradeModal } from "@/components/UpgradeModal";
import { PostcardRequestModal } from "@/components/PostcardRequestModal";

interface LimitInfo {
  currentCount: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
}

interface UsageInfo {
  wantedAds: LimitInfo;
  specificAddresses: LimitInfo;
  // Legacy fields
  currentCount: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
}

export default function CreateWantedAdPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<"specific-address" | "wanted-ad-limit">("specific-address");
  const [upgradeInfo, setUpgradeInfo] = useState<{ currentCount?: number; limit?: number }>({});
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  // Success state with postcard option
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdWantedAdId, setCreatedWantedAdId] = useState<string | null>(null);
  const [createdTargetAddressId, setCreatedTargetAddressId] = useState<string | null>(null);
  const [createdAddress, setCreatedAddress] = useState<string>("");
  const [showPostcardModal, setShowPostcardModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [financeStatus, setFinanceStatus] = useState<string>("");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [bedroomsMin, setBedroomsMin] = useState("");
  const [bedroomsMax, setBedroomsMax] = useState("");
  const [bathroomsMin, setBathroomsMin] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<"AREA" | "SPECIFIC_ADDRESS" | "BOTH">("AREA");
  const [locations, setLocations] = useState<{ type: string; name: string }[]>([]);
  const [newLocationType, setNewLocationType] = useState("SUBURB");
  const [newLocationName, setNewLocationName] = useState("");

  const addLocation = () => {
    if (newLocationName.trim()) {
      // For specific address, replace the existing location instead of adding
      if (targetType === "SPECIFIC_ADDRESS") {
        setLocations([{ type: "ADDRESS", name: newLocationName.trim() }]);
      } else {
        setLocations([
          ...locations,
          { type: newLocationType, name: newLocationName.trim() },
        ]);
      }
      setNewLocationName("");
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const togglePropertyType = (type: string) => {
    setPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Fetch usage info
  useEffect(() => {
    if (session) {
      fetchUsage();
    }
  }, [session]);

  const fetchUsage = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wanted-ads/usage`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wanted-ads`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({
            title,
            description: description || undefined,
            budget: parseInt(budget),
            financeStatus: financeStatus || undefined,
            propertyTypes: propertyTypes.length > 0 ? propertyTypes : undefined,
            bedroomsMin: bedroomsMin ? parseInt(bedroomsMin) : undefined,
            bedroomsMax: bedroomsMax ? parseInt(bedroomsMax) : undefined,
            bathroomsMin: bathroomsMin ? parseInt(bathroomsMin) : undefined,
            features: features.length > 0 ? features : undefined,
            targetType,
            // For specific addresses, use targetAddresses; for areas, use targetLocations
            ...(targetType === "SPECIFIC_ADDRESS"
              ? {
                  targetAddresses: locations.map((loc) => ({
                    address: loc.name,
                  })),
                }
              : {
                  targetLocations: locations.map((loc) => ({
                    locationType: loc.type,
                    name: loc.name,
                  })),
                }),
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        // Handle upgrade required errors
        if (data.error?.code === "UPGRADE_REQUIRED") {
          if (data.error.message.includes("specific address")) {
            setUpgradeFeature("specific-address");
          } else {
            setUpgradeFeature("wanted-ad-limit");
            setUpgradeInfo({
              currentCount: data.error.currentCount,
              limit: data.error.limit,
            });
          }
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(data.error?.message || "Failed to register buyer interest");
      }

      // For specific address, show success with postcard option
      if (targetType === "SPECIFIC_ADDRESS" && data.data.targetAddresses?.[0]) {
        setCreatedWantedAdId(data.data.id);
        setCreatedTargetAddressId(data.data.targetAddresses[0].id);
        setCreatedAddress(locations[0]?.name || "");
        setShowSuccess(true);
      } else {
        router.push("/buyer/my-ads");
      }
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
            Sign in to Register Your Interest
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to tell property owners what you&apos;re
            looking for.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/buyer/create"
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Success state UI
  if (showSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Interest Registered!
          </h1>
          <p className="text-gray-600 mb-8">
            Your interest in <span className="font-medium text-gray-900">{createdAddress}</span> has been saved.
          </p>

          {/* Postcard option */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm shrink-0">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Want to go the extra mile?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send a physical postcard directly to the property owner. It&apos;s a powerful way to stand out and show you&apos;re serious about their property.
                </p>
                <button
                  onClick={() => setShowPostcardModal(true)}
                  className="btn-primary"
                >
                  Send a Postcard
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/buyer/my-ads" className="btn-secondary">
              View My Interests
            </Link>
            <Link href="/buyer/create" className="btn-outline">
              Add Another Property
            </Link>
          </div>
        </div>

        {/* Postcard Modal */}
        {createdWantedAdId && createdTargetAddressId && (
          <PostcardRequestModal
            isOpen={showPostcardModal}
            onClose={() => setShowPostcardModal(false)}
            wantedAdId={createdWantedAdId}
            targetAddressId={createdTargetAddressId}
            address={createdAddress}
            onSuccess={() => {
              setShowPostcardModal(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Register Buyer Interest</h1>
        <p className="text-gray-600">
          Describe your ideal property and let owners know you&apos;re looking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location - First */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Target Location *
          </h2>

          <div className="space-y-4">
            {/* Usage Summary */}
            {usage && (
              <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Interests:</span>
                  {usage.wantedAds.isUnlimited ? (
                    <span className="font-medium text-primary-600">Unlimited</span>
                  ) : (
                    <span className={`font-medium ${usage.wantedAds.remaining === 0 ? "text-red-600" : "text-gray-900"}`}>
                      {usage.wantedAds.remaining} of {usage.wantedAds.limit} remaining
                    </span>
                  )}
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Specific addresses:</span>
                  {usage.specificAddresses.isUnlimited ? (
                    <span className="font-medium text-primary-600">Unlimited</span>
                  ) : (
                    <span className={`font-medium ${usage.specificAddresses.remaining === 0 ? "text-red-600" : "text-gray-900"}`}>
                      {usage.specificAddresses.remaining} of {usage.specificAddresses.limit} remaining
                    </span>
                  )}
                </div>
                {!usage.wantedAds.isUnlimited && (
                  <>
                    <span className="text-gray-300">|</span>
                    <Link href="/upgrade" className="text-primary-600 hover:text-primary-700 font-medium">
                      Upgrade for more
                    </Link>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="label">What are you targeting?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (targetType !== "AREA") {
                      setTargetType("AREA");
                      setLocations([]);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    targetType === "AREA"
                      ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${targetType === "AREA" ? "bg-primary-100" : "bg-gray-100"}`}>
                      <svg className={`w-5 h-5 ${targetType === "AREA" ? "text-primary-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-medium ${targetType === "AREA" ? "text-primary-700" : "text-gray-900"}`}>
                        General Area
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Looking anywhere in a suburb, city, or region
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Check if user has specific address limit remaining
                    if (usage && !usage.specificAddresses.isUnlimited && usage.specificAddresses.remaining === 0) {
                      setUpgradeFeature("specific-address");
                      setUpgradeInfo({ currentCount: usage.specificAddresses.currentCount, limit: usage.specificAddresses.limit });
                      setShowUpgradeModal(true);
                      return;
                    }
                    if (targetType !== "SPECIFIC_ADDRESS") {
                      setTargetType("SPECIFIC_ADDRESS");
                      setLocations([]);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    targetType === "SPECIFIC_ADDRESS"
                      ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                      : usage && !usage.specificAddresses.isUnlimited && usage.specificAddresses.remaining === 0
                        ? "border-gray-200 bg-gray-50 opacity-75"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${targetType === "SPECIFIC_ADDRESS" ? "bg-primary-100" : "bg-gray-100"}`}>
                      <svg className={`w-5 h-5 ${targetType === "SPECIFIC_ADDRESS" ? "text-primary-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${targetType === "SPECIFIC_ADDRESS" ? "text-primary-700" : "text-gray-900"}`}>
                          Specific Property
                        </p>
                        {usage && !usage.specificAddresses.isUnlimited && usage.specificAddresses.remaining === 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                            Limit reached
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        You have a particular property in mind
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* For specific address with location already set, show the address */}
            {targetType === "SPECIFIC_ADDRESS" && locations.length > 0 ? (
              <div>
                <label className="label">Property Address</label>
                <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="flex-1 font-medium text-primary-800">{locations[0].name}</span>
                  <button
                    type="button"
                    onClick={() => setLocations([])}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="label">
                  {targetType === "SPECIFIC_ADDRESS" ? "Property Address" : "Add Locations"}
                </label>
                <div className="flex gap-2">
                  {targetType !== "SPECIFIC_ADDRESS" && (
                    <select
                      value={newLocationType}
                      onChange={(e) => setNewLocationType(e.target.value)}
                      className="input w-32"
                    >
                      <option value="SUBURB">Suburb</option>
                      <option value="CITY">City</option>
                      <option value="DISTRICT">District</option>
                      <option value="REGION">Region</option>
                    </select>
                  )}
                  <input
                    type="text"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder={targetType === "SPECIFIC_ADDRESS"
                      ? "e.g., 123 Queen Street, Auckland"
                      : "e.g., Ponsonby, Auckland"}
                    className="input flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLocation();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addLocation}
                    className="btn-secondary"
                  >
                    {targetType === "SPECIFIC_ADDRESS" ? "Set" : "Add"}
                  </button>
                </div>
                {targetType !== "SPECIFIC_ADDRESS" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Quick add: {NZ_REGIONS.slice(0, 5).map((r) => r.name).join(", ")}
                    ...
                  </p>
                )}
              </div>
            )}

            {/* Show location tags for general area mode */}
            {targetType !== "SPECIFIC_ADDRESS" && locations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {locations.map((loc, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    <span className="text-xs text-primary-600">{loc.type}:</span>
                    {loc.name}
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Budget *
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="budget" className="label">
                Your budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="budget"
                  value={budget ? parseInt(budget).toLocaleString() : ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setBudget(value);
                  }}
                  placeholder="1,000,000"
                  required
                  className="input pl-7"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <label htmlFor="financeStatus" className="label">
                Finance status
              </label>
              <select
                id="financeStatus"
                value={financeStatus}
                onChange={(e) => setFinanceStatus(e.target.value)}
                className="input"
              >
                <option value="">Select...</option>
                <option value="CASH">Cash buyer</option>
                <option value="PRE_APPROVED">Pre-approved</option>
                <option value="REQUIRES_FINANCE">Requires finance</option>
                <option value="NOT_SPECIFIED">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {targetType === "SPECIFIC_ADDRESS" ? "Why This Property?" : "Basic Information"}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="label">
                {targetType === "SPECIFIC_ADDRESS" ? "Your Interest *" : "Title *"}
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={targetType === "SPECIFIC_ADDRESS"
                  ? "e.g., Interested in purchasing your home"
                  : "e.g., Looking for a family home in Ponsonby"}
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="description" className="label">
                {targetType === "SPECIFIC_ADDRESS" ? "Why are you interested?" : "Description"}
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={targetType === "SPECIFIC_ADDRESS"
                  ? "Tell the owner why you're specifically interested in their property..."
                  : "Tell owners more about what you're looking for..."}
                rows={3}
                className="input"
              />
              {targetType === "SPECIFIC_ADDRESS" && (
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about what attracts you to this property - it helps owners take your interest seriously.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Property Requirements - Only for General Area */}
        {targetType !== "SPECIFIC_ADDRESS" && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Property Requirements
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => togglePropertyType(type.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        propertyTypes.includes(type.value)
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="bedroomsMin" className="label">
                    Min Bedrooms
                  </label>
                  <select
                    id="bedroomsMin"
                    value={bedroomsMin}
                    onChange={(e) => setBedroomsMin(e.target.value)}
                    className="input"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}+
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="bedroomsMax" className="label">
                    Max Bedrooms
                  </label>
                  <select
                    id="bedroomsMax"
                    value={bedroomsMax}
                    onChange={(e) => setBedroomsMax(e.target.value)}
                    className="input"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="bathroomsMin" className="label">
                    Min Bathrooms
                  </label>
                  <select
                    id="bathroomsMin"
                    value={bathroomsMin}
                    onChange={(e) => setBathroomsMin(e.target.value)}
                    className="input"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}+
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Desired Features</label>
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
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={
              loading ||
              !title ||
              !budget ||
              locations.length === 0
            }
            className="btn-primary flex-1"
          >
            {loading ? "Submitting..." : "Submit Interest"}
          </button>
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        currentCount={upgradeInfo.currentCount}
        limit={upgradeInfo.limit}
      />
    </div>
  );
}
