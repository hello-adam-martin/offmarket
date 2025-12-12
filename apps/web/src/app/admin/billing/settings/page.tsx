"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SubscriptionFeatures {
  wantedAdLimit: number;
  specificAddressLimit: number; // -1 = unlimited
  priorityNotifications: boolean;
  earlyAccess: boolean;
  savedSearchLimit: number;
  matchNotifications: boolean;
  directMessaging: boolean;
  postcardEnabled: boolean;
  postcardFreeMonthly: number;
}

interface BillingSettings {
  // Pricing
  proMonthlyPrice: number;
  proYearlyPrice: number;
  proYearlyEnabled: boolean;

  // Finder's fees (escrow)
  escrowFeeStandard: number;
  escrowFeePremium: number;
  escrowFeeLuxury: number;
  premiumThreshold: number;
  luxuryThreshold: number;
  escrowExpiryDays: number;

  // Postcard settings
  postcardCost: number;
  postcardRateLimitDays: number;

  // Tier features
  freeFeatures: SubscriptionFeatures;
  proFeatures: SubscriptionFeatures;
}

const defaultSettings: BillingSettings = {
  proMonthlyPrice: 1900,
  proYearlyPrice: 19000,
  proYearlyEnabled: false,
  escrowFeeStandard: 29900,
  escrowFeePremium: 49900,
  escrowFeeLuxury: 79900,
  premiumThreshold: 1000000,
  luxuryThreshold: 2000000,
  escrowExpiryDays: 30,
  postcardCost: 1500,
  postcardRateLimitDays: 90,
  freeFeatures: {
    wantedAdLimit: 3,
    specificAddressLimit: 1,
    priorityNotifications: false,
    earlyAccess: false,
    savedSearchLimit: 5,
    matchNotifications: true,
    directMessaging: true,
    postcardEnabled: false,
    postcardFreeMonthly: 0,
  },
  proFeatures: {
    wantedAdLimit: -1,
    specificAddressLimit: -1,
    priorityNotifications: true,
    earlyAccess: true,
    savedSearchLimit: -1,
    matchNotifications: true,
    directMessaging: true,
    postcardEnabled: true,
    postcardFreeMonthly: 1,
  },
};

export default function BillingSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<BillingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/settings`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Deep merge to ensure nested objects have all default fields
        setSettings({
          ...defaultSettings,
          ...data.data,
          freeFeatures: {
            ...defaultSettings.freeFeatures,
            ...(data.data.freeFeatures || {}),
          },
          proFeatures: {
            ...defaultSettings.proFeatures,
            ...(data.data.proFeatures || {}),
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error?.message || "Failed to save settings");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const parseCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  const updateFreeFeature = (key: keyof SubscriptionFeatures, value: number | boolean) => {
    setSettings({
      ...settings,
      freeFeatures: { ...settings.freeFeatures, [key]: value },
    });
  };

  const updateProFeature = (key: keyof SubscriptionFeatures, value: number | boolean) => {
    setSettings({
      ...settings,
      proFeatures: { ...settings.proFeatures, [key]: value },
    });
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? "Unlimited" : limit.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/billing" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Billing Settings</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/billing" className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Billing Settings</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Pro Subscription Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Pro Subscription Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Price (NZD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formatCurrency(settings.proMonthlyPrice)}
                  onChange={(e) =>
                    setSettings({ ...settings, proMonthlyPrice: parseCurrency(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yearly Price (NZD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formatCurrency(settings.proYearlyPrice)}
                  onChange={(e) =>
                    setSettings({ ...settings, proYearlyPrice: parseCurrency(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!settings.proYearlyEnabled}
                />
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={settings.proYearlyEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, proYearlyEnabled: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Enable yearly billing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Subscription Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Subscription Tier Features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      Free
                    </span>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-primary-600">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Pro
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Buyer Interest Limit */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Buyer Interest Limit</p>
                      <p className="text-sm text-gray-500">Maximum number of buyer interests</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="-1"
                      value={settings.freeFeatures.wantedAdLimit}
                      onChange={(e) => updateFreeFeature("wantedAdLimit", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formatLimit(settings.freeFeatures.wantedAdLimit)}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="-1"
                      value={settings.proFeatures.wantedAdLimit}
                      onChange={(e) => updateProFeature("wantedAdLimit", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formatLimit(settings.proFeatures.wantedAdLimit)}</p>
                  </td>
                </tr>

                {/* Saved Search Limit */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Saved Search Limit</p>
                      <p className="text-sm text-gray-500">Maximum saved searches</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="-1"
                      value={settings.freeFeatures.savedSearchLimit}
                      onChange={(e) => updateFreeFeature("savedSearchLimit", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formatLimit(settings.freeFeatures.savedSearchLimit)}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="-1"
                      value={settings.proFeatures.savedSearchLimit}
                      onChange={(e) => updateProFeature("savedSearchLimit", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formatLimit(settings.proFeatures.savedSearchLimit)}</p>
                  </td>
                </tr>

                {/* Specific Address Limit */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Specific Address Interests</p>
                      <p className="text-sm text-gray-500">Max specific property interests (-1 = unlimited)</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="-1"
                      value={settings.freeFeatures.specificAddressLimit ?? 1}
                      onChange={(e) => updateFreeFeature("specificAddressLimit", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="-1"
                      value={settings.proFeatures.specificAddressLimit ?? -1}
                      onChange={(e) => updateProFeature("specificAddressLimit", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    />
                  </td>
                </tr>

                {/* Priority Notifications */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Priority Notifications</p>
                      <p className="text-sm text-gray-500">Get notified before other users</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.freeFeatures.priorityNotifications}
                      onChange={(e) => updateFreeFeature("priorityNotifications", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.proFeatures.priorityNotifications}
                      onChange={(e) => updateProFeature("priorityNotifications", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                </tr>

                {/* Early Access */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Early Access</p>
                      <p className="text-sm text-gray-500">Early access to new properties</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.freeFeatures.earlyAccess}
                      onChange={(e) => updateFreeFeature("earlyAccess", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.proFeatures.earlyAccess}
                      onChange={(e) => updateProFeature("earlyAccess", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                </tr>

                {/* Match Notifications */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Match Notifications</p>
                      <p className="text-sm text-gray-500">Get notified of property matches</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.freeFeatures.matchNotifications}
                      onChange={(e) => updateFreeFeature("matchNotifications", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.proFeatures.matchNotifications}
                      onChange={(e) => updateProFeature("matchNotifications", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                </tr>

                {/* Direct Messaging */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Direct Messaging</p>
                      <p className="text-sm text-gray-500">Message property owners/buyers</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.freeFeatures.directMessaging}
                      onChange={(e) => updateFreeFeature("directMessaging", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.proFeatures.directMessaging}
                      onChange={(e) => updateProFeature("directMessaging", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                </tr>

                {/* Postcard Direct Mail */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Postcard Direct Mail</p>
                      <p className="text-sm text-gray-500">Send physical postcards to owners</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.freeFeatures.postcardEnabled}
                      onChange={(e) => updateFreeFeature("postcardEnabled", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings.proFeatures.postcardEnabled}
                      onChange={(e) => updateProFeature("postcardEnabled", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                </tr>

                {/* Free Postcards per Month */}
                <tr>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Free Postcards/Month</p>
                      <p className="text-sm text-gray-500">Monthly free postcard allowance</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      value={settings.freeFeatures.postcardFreeMonthly}
                      onChange={(e) => updateFreeFeature("postcardFreeMonthly", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      value={settings.proFeatures.postcardFreeMonthly}
                      onChange={(e) => updateProFeature("postcardFreeMonthly", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            For numeric limits, use -1 for unlimited.
          </p>
        </div>

        {/* Finder's Fee Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Finder&apos;s Fees (Escrow)
          </h2>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Finder&apos;s fees are charged when a property owner contacts a buyer through the platform.
              Fees are tiered based on the estimated property value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Standard</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Under ${(settings.premiumThreshold / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formatCurrency(settings.escrowFeeStandard)}
                  onChange={(e) =>
                    setSettings({ ...settings, escrowFeeStandard: parseCurrency(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-4 border border-primary-200 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Premium</span>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                  ${(settings.premiumThreshold / 1000000).toFixed(1)}M - ${(settings.luxuryThreshold / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formatCurrency(settings.escrowFeePremium)}
                  onChange={(e) =>
                    setSettings({ ...settings, escrowFeePremium: parseCurrency(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Luxury</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  Over ${(settings.luxuryThreshold / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formatCurrency(settings.escrowFeeLuxury)}
                  onChange={(e) =>
                    setSettings({ ...settings, escrowFeeLuxury: parseCurrency(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium Threshold (NZD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="100000"
                  value={settings.premiumThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, premiumThreshold: parseInt(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luxury Threshold (NZD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="100000"
                  value={settings.luxuryThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, luxuryThreshold: parseInt(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escrow Expiry (Days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={settings.escrowExpiryDays}
                onChange={(e) =>
                  setSettings({ ...settings, escrowExpiryDays: parseInt(e.target.value) || 30 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-refund if no response
              </p>
            </div>
          </div>
        </div>

        {/* Postcard Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Postcard Direct Mail
          </h2>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Postcards allow buyers to contact property owners directly via physical mail.
              Owners can claim the postcard via a unique code to connect with the buyer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Postcard Cost (NZD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formatCurrency(settings.postcardCost)}
                  onChange={(e) =>
                    setSettings({ ...settings, postcardCost: parseCurrency(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cost for postcards beyond free monthly allowance
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Same Address Rate Limit (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.postcardRateLimitDays}
                onChange={(e) =>
                  setSettings({ ...settings, postcardRateLimitDays: parseInt(e.target.value) || 90 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum days between postcards to same address
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/billing"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Important Notes</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Feature changes take effect immediately for all users.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>
              Price changes only apply to new subscriptions. Update Stripe Dashboard for actual billing.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              Finder&apos;s fee changes apply to new escrow deposits only.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
