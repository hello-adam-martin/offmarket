import type { ApiResponse } from "@offmarket/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  return data as ApiResponse<T>;
}

// Typed API methods
export const api = {
  // Auth
  async register(email: string, name?: string) {
    return apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  },

  async getMe(token: string) {
    return apiFetch("/api/auth/me", { token });
  },

  // Wanted Ads
  async getWantedAds(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/api/wanted-ads${query}`);
  },

  async getWantedAd(id: string) {
    return apiFetch(`/api/wanted-ads/${id}`);
  },

  async getMyWantedAd(id: string, token: string) {
    return apiFetch(`/api/wanted-ads/me/ads/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getPropertyDemandList(params?: {
    region?: string;
    city?: string;
    suburb?: string;
    page?: number;
    limit?: number;
    sortBy?: "buyerCount" | "avgBudget";
  }) {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )}`
      : "";
    return apiFetch(`/api/wanted-ads/property-demand${query}`);
  },

  async getPropertyDemandDetail(encodedAddress: string) {
    return apiFetch(`/api/wanted-ads/property-demand/${encodedAddress}`);
  },

  async getAreaDemand(params?: {
    region?: string;
    city?: string;
    suburb?: string;
    propertyType?: string;
    bedroomsMin?: number;
    page?: number;
    limit?: number;
    sortBy?: "buyerCount" | "avgBudget";
  }) {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )}`
      : "";
    return apiFetch(`/api/wanted-ads/area-demand${query}`);
  },

  async getLocationCounts(level: "region" | "city" | "suburb" = "region") {
    return apiFetch(`/api/wanted-ads/location-counts?level=${level}`);
  },

  async createWantedAd(data: any, token: string) {
    return apiFetch("/api/wanted-ads", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  },

  async getMyWantedAds(token: string) {
    return apiFetch("/api/wanted-ads/me/ads", { token });
  },

  // Properties
  async checkDemand(params: { address?: string; suburb?: string; city?: string }) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    );
    return apiFetch(`/api/properties/check-demand?${query}`);
  },

  async registerProperty(data: any, token: string) {
    return apiFetch("/api/properties", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  },

  async getMyProperties(token: string) {
    return apiFetch("/api/properties/me", { token });
  },

  async getPropertyDemand(propertyId: string, token: string) {
    return apiFetch(`/api/properties/${propertyId}/demand`, { token });
  },

  // Matches
  async calculateMatches(propertyId: string, token: string) {
    return apiFetch(`/api/matches/property/${propertyId}/calculate`, {
      method: "POST",
      token,
    });
  },

  // Inquiries
  async createInquiry(data: { propertyId: string; buyerId?: string; message: string }, token: string) {
    return apiFetch("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  },

  async getMyInquiries(token: string, role?: "buyer" | "owner" | "all") {
    const query = role ? `?role=${role}` : "";
    return apiFetch(`/api/inquiries/me${query}`, { token });
  },

  async getInquiry(id: string, token: string) {
    return apiFetch(`/api/inquiries/${id}`, { token });
  },

  async sendMessage(inquiryId: string, message: string, token: string) {
    return apiFetch(`/api/inquiries/${inquiryId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
      token,
    });
  },
};
