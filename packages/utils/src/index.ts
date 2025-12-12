// ============================================================================
// Currency Formatting (NZD)
// ============================================================================

export function formatNZD(amount: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBudgetRange(min: number, max: number): string {
  if (min === max) return formatNZD(min);
  return `${formatNZD(min)} - ${formatNZD(max)}`;
}

export function formatBudgets(budgets: number[]): string {
  if (budgets.length === 0) return "N/A";
  if (budgets.length === 1) {
    const budget = budgets[0];
    if (budget === undefined) return "N/A";
    return formatNZD(budget);
  }
  const min = Math.min(...budgets);
  const max = Math.max(...budgets);
  if (min === max) return formatNZD(min);
  return `${formatNZD(min)} - ${formatNZD(max)}`;
}

// ============================================================================
// Address Formatting
// ============================================================================

export function formatAddress(parts: {
  address?: string;
  suburb?: string | null;
  city?: string | null;
  region?: string | null;
  postcode?: string | null;
}): string {
  const { address, suburb, city, postcode } = parts;
  const components = [address, suburb, city, postcode].filter(Boolean);
  return components.join(", ");
}

export function formatShortAddress(parts: {
  address?: string;
  suburb?: string | null;
}): string {
  const { address, suburb } = parts;
  if (suburb) return `${address}, ${suburb}`;
  return address || "";
}

// ============================================================================
// Date Formatting
// ============================================================================

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// ============================================================================
// Validation
// ============================================================================

export function isValidNZPostcode(postcode: string): boolean {
  // NZ postcodes are 4 digits
  return /^\d{4}$/.test(postcode);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidNZPhone(phone: string): boolean {
  // NZ mobile: 02x xxx xxxx or landline: 0x xxx xxxx
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^0[2-9]\d{7,9}$/.test(cleaned);
}

// ============================================================================
// String Utilities
// ============================================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================================================
// Match Score Utilities
// ============================================================================

export function getMatchScoreLabel(score: number): string {
  if (score >= 90) return "Excellent Match";
  if (score >= 75) return "Great Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

export function getMatchScoreColor(score: number): string {
  if (score >= 90) return "green";
  if (score >= 75) return "emerald";
  if (score >= 60) return "yellow";
  if (score >= 40) return "orange";
  return "red";
}

// ============================================================================
// Property Utilities
// ============================================================================

export function formatPropertySize(sqm: number | null | undefined): string {
  if (!sqm) return "N/A";
  return `${sqm.toLocaleString("en-NZ")}m²`;
}

export function formatBedroomRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  if (!min && !max) return "Any";
  if (min && !max) return `${min}+`;
  if (!min && max) return `Up to ${max}`;
  if (min === max) return `${min}`;
  return `${min}-${max}`;
}

// ============================================================================
// Array Utilities
// ============================================================================

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const k = String(item[key]);
      (groups[k] = groups[k] || []).push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

// ============================================================================
// API Utilities
// ============================================================================

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== undefined
  );
  if (filtered.length === 0) return "";
  const searchParams = new URLSearchParams();
  filtered.forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return `?${searchParams.toString()}`;
}
