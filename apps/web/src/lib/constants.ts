// Property types available in NZ real estate
export const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "UNIT", label: "Unit" },
  { value: "LIFESTYLE", label: "Lifestyle Property" },
  { value: "SECTION", label: "Section" },
  { value: "FARM", label: "Farm" },
] as const;

// Property features
export const FEATURES = [
  { value: "GARAGE", label: "Garage" },
  { value: "POOL", label: "Pool" },
  { value: "DECK", label: "Deck" },
  { value: "GARDEN", label: "Garden" },
  { value: "SEA_VIEW", label: "Sea View" },
  { value: "MOUNTAIN_VIEW", label: "Mountain View" },
  { value: "OFF_STREET_PARKING", label: "Off-street Parking" },
  { value: "ENSUITE", label: "Ensuite" },
  { value: "HEAT_PUMP", label: "Heat Pump" },
  { value: "FIREPLACE", label: "Fireplace" },
  { value: "NEW_BUILD", label: "New Build" },
  { value: "RENOVATED", label: "Recently Renovated" },
  { value: "FENCED", label: "Fenced" },
  { value: "PET_FRIENDLY", label: "Pet Friendly" },
] as const;

// Create lookup maps for efficient label retrieval
export const PROPERTY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((t) => [t.value, t.label])
);

export const FEATURE_LABELS: Record<string, string> = Object.fromEntries(
  FEATURES.map((f) => [f.value, f.label])
);

// Inquiry status labels and badge classes
export const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: "Pending", badgeClass: "badge-warning" },
  ACCEPTED: { label: "Accepted", badgeClass: "badge-success" },
  DECLINED: { label: "Declined", badgeClass: "badge-error" },
  COMPLETED: { label: "Completed", badgeClass: "badge-neutral" },
};
