// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}

// ============================================================================
// Wanted Ad Types
// ============================================================================

export interface CreateWantedAdInput {
  title: string;
  description?: string;
  budget: number;
  propertyTypes?: PropertyType[];
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  landSizeMin?: number;
  landSizeMax?: number;
  floorAreaMin?: number;
  floorAreaMax?: number;
  features?: PropertyFeature[];
  targetType: TargetType;
  targetLocations?: TargetLocationInput[];
  targetAddresses?: TargetAddressInput[];
}

export interface UpdateWantedAdInput extends Partial<CreateWantedAdInput> {
  isActive?: boolean;
}

export interface TargetLocationInput {
  locationType: LocationType;
  name: string;
}

export interface TargetAddressInput {
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
}

export interface WantedAdSummary {
  id: string;
  title: string;
  budget: number;
  propertyTypes: PropertyType[];
  bedroomsMin: number | null;
  bedroomsMax: number | null;
  targetType: TargetType;
  locationCount: number;
  isActive: boolean;
  createdAt: Date;
}

// ============================================================================
// Property Types
// ============================================================================

export interface CreatePropertyInput {
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  landSize?: number;
  floorArea?: number;
  yearBuilt?: number;
  features?: PropertyFeature[];
  estimatedValue?: number;
  rvValue?: number;
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {}

export interface PropertyDemand {
  propertyId: string;
  address: string;
  totalBuyers: number;
  budgetRange: {
    min: number;
    max: number;
    average: number;
  };
  matches: PropertyMatchSummary[];
}

export interface PropertyMatchSummary {
  matchId: string;
  matchScore: number;
  matchedOn: string[];
  buyerBudget: number;
  wantedAdTitle: string;
  createdAt: Date;
}

// ============================================================================
// Inquiry Types
// ============================================================================

export interface CreateInquiryInput {
  propertyId: string;
  buyerId?: string; // Required if owner initiating
  message: string;
}

export interface InquirySummary {
  id: string;
  propertyAddress: string;
  initiatedBy: InquiryInitiator;
  status: InquiryStatus;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// ============================================================================
// Enums (mirroring Prisma enums for frontend use)
// ============================================================================

export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "TOWNHOUSE"
  | "UNIT"
  | "LIFESTYLE"
  | "SECTION"
  | "FARM"
  | "COMMERCIAL";

export type PropertyFeature =
  | "GARAGE"
  | "POOL"
  | "DECK"
  | "GARDEN"
  | "SEA_VIEW"
  | "MOUNTAIN_VIEW"
  | "OFF_STREET_PARKING"
  | "ENSUITE"
  | "HEAT_PUMP"
  | "FIREPLACE"
  | "NEW_BUILD"
  | "RENOVATED"
  | "FENCED"
  | "PET_FRIENDLY";

export type TargetType = "SPECIFIC_ADDRESS" | "AREA" | "BOTH";

export type LocationType = "SUBURB" | "CITY" | "DISTRICT" | "REGION";

export type InquiryInitiator = "OWNER" | "BUYER";

export type InquiryStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";

export type NotificationType =
  | "NEW_MATCH"
  | "NEW_INQUIRY"
  | "INQUIRY_RESPONSE"
  | "PROPERTY_INTEREST"
  | "SYSTEM";

// ============================================================================
// NZ-Specific Types
// ============================================================================

export interface NZRegion {
  name: string;
  code: string;
}

export const NZ_REGIONS: NZRegion[] = [
  { name: "Northland", code: "NTL" },
  { name: "Auckland", code: "AKL" },
  { name: "Waikato", code: "WKO" },
  { name: "Bay of Plenty", code: "BOP" },
  { name: "Gisborne", code: "GIS" },
  { name: "Hawke's Bay", code: "HKB" },
  { name: "Taranaki", code: "TKI" },
  { name: "Manawatū-Whanganui", code: "MWT" },
  { name: "Wellington", code: "WGN" },
  { name: "Tasman", code: "TAS" },
  { name: "Nelson", code: "NSN" },
  { name: "Marlborough", code: "MBH" },
  { name: "West Coast", code: "WTC" },
  { name: "Canterbury", code: "CAN" },
  { name: "Otago", code: "OTA" },
  { name: "Southland", code: "STL" },
];

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface WantedAdFilters {
  minBudget?: number;
  maxBudget?: number;
  propertyTypes?: PropertyType[];
  bedroomsMin?: number;
  region?: string;
  city?: string;
  suburb?: string;
}

export interface PropertyFilters {
  suburb?: string;
  city?: string;
  region?: string;
  propertyType?: PropertyType;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
