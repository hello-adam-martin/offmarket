/**
 * Safely parse JSON arrays that may come as strings from SQLite.
 * SQLite doesn't support array types, so we store them as JSON strings.
 */
export function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Get API token from session for authenticated requests
 */
export function getApiToken(session: unknown): string | undefined {
  return (session as { apiToken?: string })?.apiToken;
}
