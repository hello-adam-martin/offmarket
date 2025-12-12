import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";
import type { CreateWantedAdInput } from "@offmarket/types";
import { isLocationInRegion, getRegionForLocation } from "../lib/nz-locations";
import { createMatchesForWantedAd } from "../services/matching.js";
import { getUserSubscription, getFeatureLimit } from "../services/stripe.js";

const createWantedAdSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(2000).optional(),
  budget: z.number().positive(),
  financeStatus: z.enum(["CASH", "PRE_APPROVED", "REQUIRES_FINANCE", "NOT_SPECIFIED"]).optional(),
  propertyTypes: z.array(z.string()).optional(),
  bedroomsMin: z.number().int().positive().optional(),
  bedroomsMax: z.number().int().positive().optional(),
  bathroomsMin: z.number().int().positive().optional(),
  landSizeMin: z.number().positive().optional(),
  landSizeMax: z.number().positive().optional(),
  floorAreaMin: z.number().positive().optional(),
  floorAreaMax: z.number().positive().optional(),
  features: z.array(z.string()).optional(),
  targetType: z.enum(["SPECIFIC_ADDRESS", "AREA", "BOTH"]),
  targetLocations: z
    .array(
      z.object({
        locationType: z.enum(["SUBURB", "CITY", "DISTRICT", "REGION"]),
        name: z.string(),
      })
    )
    .optional(),
  targetAddresses: z
    .array(
      z.object({
        address: z.string(),
        suburb: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        postcode: z.string().optional(),
      })
    )
    .optional(),
});

export async function wantedAdsRoutes(server: FastifyInstance) {
  // Get user's wanted ad usage and limits
  server.get(
    "/usage",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        // Get buyer profile
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });

        // Get limits
        const wantedAdLimit = await getFeatureLimit(userId, "wantedAdLimit");
        const specificAddressLimit = await getFeatureLimit(userId, "specificAddressLimit");

        if (!buyerProfile) {
          // No buyer profile, return zero counts with limits
          return reply.send({
            success: true,
            data: {
              wantedAds: {
                currentCount: 0,
                limit: wantedAdLimit,
                remaining: wantedAdLimit === -1 ? -1 : wantedAdLimit,
                isUnlimited: wantedAdLimit === -1,
              },
              specificAddresses: {
                currentCount: 0,
                limit: specificAddressLimit,
                remaining: specificAddressLimit === -1 ? -1 : specificAddressLimit,
                isUnlimited: specificAddressLimit === -1,
              },
              // Legacy fields for backwards compatibility
              currentCount: 0,
              limit: wantedAdLimit,
              remaining: wantedAdLimit === -1 ? -1 : wantedAdLimit,
              isUnlimited: wantedAdLimit === -1,
            },
          });
        }

        // Get current count of active wanted ads
        const currentCount = await db.wantedAd.count({
          where: { buyerId: buyerProfile.id, isActive: true },
        });

        // Get current count of specific address wanted ads
        const specificAddressCount = await db.wantedAd.count({
          where: {
            buyerId: buyerProfile.id,
            isActive: true,
            targetType: { in: ["SPECIFIC_ADDRESS", "BOTH"] },
          },
        });

        const wantedAdRemaining = wantedAdLimit === -1 ? -1 : Math.max(0, wantedAdLimit - currentCount);
        const specificAddressRemaining = specificAddressLimit === -1 ? -1 : Math.max(0, specificAddressLimit - specificAddressCount);

        return reply.send({
          success: true,
          data: {
            wantedAds: {
              currentCount,
              limit: wantedAdLimit,
              remaining: wantedAdRemaining,
              isUnlimited: wantedAdLimit === -1,
            },
            specificAddresses: {
              currentCount: specificAddressCount,
              limit: specificAddressLimit,
              remaining: specificAddressRemaining,
              isUnlimited: specificAddressLimit === -1,
            },
            // Legacy fields for backwards compatibility
            currentCount,
            limit: wantedAdLimit,
            remaining: wantedAdRemaining,
            isUnlimited: wantedAdLimit === -1,
          },
        });
      } catch (error) {
        console.error("[WantedAds] Failed to get usage:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get usage information",
          },
        });
      }
    }
  );

  // Get aggregated area demand - groups similar wanted ads together (public)
  // Supports filtering by region/city/suburb and pagination for scale
  server.get("/area-demand", async (request, reply) => {
    const {
      region,
      city,
      suburb,
      propertyType,
      bedroomsMin: bedroomsMinParam,
      page = "1",
      limit = "20",
      sortBy = "buyerCount",
    } = request.query as Record<string, string | undefined>;

    try {
      const pageNum = parseInt(page, 10);
      const limitNum = Math.min(parseInt(limit, 10), 50);
      const skip = (pageNum - 1) * limitNum;
      const bedroomsMinFilter = bedroomsMinParam ? parseInt(bedroomsMinParam, 10) : undefined;

      // Build wanted ad filter
      const wantedAdWhere: any = {
        isActive: true,
        targetType: { in: ["AREA", "BOTH"] },
      };

      // Filter by property type if specified
      if (propertyType) {
        wantedAdWhere.propertyTypes = { contains: propertyType };
      }

      // Filter by bedrooms if specified
      if (bedroomsMinFilter) {
        wantedAdWhere.bedroomsMin = { gte: bedroomsMinFilter };
      }

      // Get all wanted ads with their target locations
      // We filter by location in JS since SQLite doesn't support case-insensitive mode
      const wantedAds = await db.wantedAd.findMany({
        where: wantedAdWhere,
        include: {
          targetLocations: true,
        },
      });

      // Filter target locations by region/city/suburb in JavaScript
      const hasLocationFilter = region || city || suburb;
      const filteredWantedAds = hasLocationFilter
        ? wantedAds.map((ad) => ({
            ...ad,
            targetLocations: ad.targetLocations.filter((loc) => {
              // Direct match for region-type location
              if (region && loc.locationType === "REGION" && loc.name.toLowerCase() === region.toLowerCase()) return true;
              // Direct match for city-type location
              if (city && loc.locationType === "CITY" && loc.name.toLowerCase() === city.toLowerCase()) return true;
              // Direct match for suburb-type location
              if (suburb && loc.locationType === "SUBURB" && loc.name.toLowerCase() === suburb.toLowerCase()) return true;
              // If filtering by region only, check if this suburb/city belongs to the region
              if (region && !city && !suburb) {
                // Use the location hierarchy to check if the location is in the region
                if (isLocationInRegion(loc.name, region)) {
                  return true;
                }
              }
              return false;
            }),
          })).filter((ad) => ad.targetLocations.length > 0)
        : wantedAds;

      // Create a map to group similar demand
      const demandGroups = new Map<
        string,
        {
          locations: { type: string; name: string }[];
          propertyTypes: string[];
          bedroomsMin: number | null;
          bedroomsMax: number | null;
          features: string[];
          buyerCount: number;
          budgets: number[];
          adIds: string[];
        }
      >();

      for (const ad of filteredWantedAds) {
        for (const loc of ad.targetLocations) {
          const propertyTypes: string[] = ad.propertyTypes
            ? JSON.parse(ad.propertyTypes)
            : [];
          const features: string[] = ad.features
            ? JSON.parse(ad.features)
            : [];

          const bedroomKey = ad.bedroomsMin ? `${ad.bedroomsMin}+` : "any";
          const propertyTypeKey = propertyTypes.sort().join(",") || "any";
          const key = `${loc.locationType}:${loc.name.toLowerCase()}|${propertyTypeKey}|${bedroomKey}`;

          if (demandGroups.has(key)) {
            const group = demandGroups.get(key)!;
            if (!group.adIds.includes(ad.id)) {
              group.buyerCount += 1;
              group.budgets.push(ad.budget);
              group.adIds.push(ad.id);
              for (const f of features) {
                if (!group.features.includes(f)) {
                  group.features.push(f);
                }
              }
            }
          } else {
            demandGroups.set(key, {
              locations: [{ type: loc.locationType, name: loc.name }],
              propertyTypes,
              bedroomsMin: ad.bedroomsMin,
              bedroomsMax: ad.bedroomsMax,
              features,
              buyerCount: 1,
              budgets: [ad.budget],
              adIds: [ad.id],
            });
          }
        }
      }

      // Convert to array and calculate stats, keeping adIds for unique buyer count
      let aggregatedDemandWithIds = Array.from(demandGroups.values())
        .map((group) => ({
          locations: group.locations,
          propertyTypes: group.propertyTypes,
          bedroomsMin: group.bedroomsMin,
          bedroomsMax: group.bedroomsMax,
          features: group.features.slice(0, 5),
          buyerCount: group.buyerCount,
          budgetRange: {
            min: Math.min(...group.budgets),
            max: Math.max(...group.budgets),
            average: Math.round(
              group.budgets.reduce((sum, b) => sum + b, 0) / group.budgets.length
            ),
          },
          adIds: group.adIds, // Keep for unique count
        }))
        .filter((group) => group.buyerCount >= 1);

      // Sort
      if (sortBy === "avgBudget") {
        aggregatedDemandWithIds.sort((a, b) => b.budgetRange.average - a.budgetRange.average);
      } else {
        aggregatedDemandWithIds.sort((a, b) => b.buyerCount - a.buyerCount);
      }

      // Calculate summary before pagination
      // Count UNIQUE buyers across all groups (a buyer may appear in multiple suburb groups)
      const allAdIds = new Set<string>();
      for (const group of aggregatedDemandWithIds) {
        for (const adId of group.adIds) {
          allAdIds.add(adId);
        }
      }
      const totalGroups = aggregatedDemandWithIds.length;
      const totalBuyers = allAdIds.size; // Unique buyers, not aggregated count
      const avgBudget = totalGroups > 0
        ? Math.round(
            aggregatedDemandWithIds.reduce((sum, g) => sum + g.budgetRange.average, 0) / totalGroups
          )
        : 0;

      // Remove adIds from response data (internal use only)
      const aggregatedDemand = aggregatedDemandWithIds.map(({ adIds, ...rest }) => rest);

      // Paginate
      const paginatedData = aggregatedDemand.slice(skip, skip + limitNum);

      return {
        success: true,
        data: paginatedData,
        summary: {
          totalGroups,
          totalBuyers,
          avgBudget,
        },
        meta: {
          page: pageNum,
          limit: limitNum,
          total: totalGroups,
          totalPages: Math.ceil(totalGroups / limitNum),
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch area demand" },
      });
    }
  });

  // Get specific properties with aggregated buyer interest (public)
  // Supports filtering by region/city/suburb and pagination for scale
  server.get("/property-demand", async (request, reply) => {
    const {
      region,
      city,
      suburb,
      page = "1",
      limit = "12",
      sortBy = "buyerCount",
    } = request.query as Record<string, string | undefined>;

    try {
      const pageNum = parseInt(page, 10);
      const limitNum = Math.min(parseInt(limit, 10), 50);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause for target addresses
      const where: any = {
        wantedAd: {
          isActive: true,
          targetType: { in: ["SPECIFIC_ADDRESS", "BOTH"] },
        },
      };

      // Get all target addresses (we'll filter by location in JS for case-insensitivity)
      // SQLite doesn't support case-insensitive mode in Prisma
      const targetAddresses = await db.targetAddress.findMany({
        where,
        include: {
          wantedAd: {
            select: {
              budget: true,
            },
          },
        },
      });

      // Filter by location in JS (SQLite doesn't support case-insensitive mode)
      const filteredAddresses = targetAddresses.filter((ta) => {
        if (region && ta.region?.toLowerCase() !== region.toLowerCase()) return false;
        if (city && ta.city?.toLowerCase() !== city.toLowerCase()) return false;
        if (suburb && ta.suburb?.toLowerCase() !== suburb.toLowerCase()) return false;
        return true;
      });

      // Group by address to aggregate buyer interest
      const addressMap = new Map<
        string,
        {
          address: string;
          suburb?: string;
          city?: string;
          region?: string;
          buyerCount: number;
          budgets: number[];
        }
      >();

      for (const ta of filteredAddresses) {
        const key = `${ta.address}|${ta.suburb || ""}|${ta.city || ""}`.toLowerCase();

        if (addressMap.has(key)) {
          const existing = addressMap.get(key)!;
          existing.buyerCount += 1;
          existing.budgets.push(ta.wantedAd.budget);
        } else {
          addressMap.set(key, {
            address: ta.address,
            suburb: ta.suburb || undefined,
            city: ta.city || undefined,
            region: ta.region || undefined,
            buyerCount: 1,
            budgets: [ta.wantedAd.budget],
          });
        }
      }

      // Convert to array
      let properties = Array.from(addressMap.values())
        .map((p) => ({
          address: p.address,
          suburb: p.suburb,
          city: p.city,
          region: p.region,
          buyerCount: p.buyerCount,
          budgets: p.budgets.sort((a, b) => a - b),
        }));

      // Sort
      if (sortBy === "avgBudget") {
        properties.sort((a, b) => {
          const avgA = a.budgets.reduce((sum, x) => sum + x, 0) / a.budgets.length;
          const avgB = b.budgets.reduce((sum, x) => sum + x, 0) / b.budgets.length;
          return avgB - avgA;
        });
      } else {
        properties.sort((a, b) => b.buyerCount - a.buyerCount);
      }

      // Calculate summary before pagination
      const totalProperties = properties.length;
      const totalBuyers = properties.reduce((sum, p) => sum + p.buyerCount, 0);

      // Paginate
      const paginatedData = properties.slice(skip, skip + limitNum);

      return {
        success: true,
        data: paginatedData,
        summary: {
          totalProperties,
          totalBuyers,
        },
        meta: {
          page: pageNum,
          limit: limitNum,
          total: totalProperties,
          totalPages: Math.ceil(totalProperties / limitNum),
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch property demand" },
      });
    }
  });

  // Get location counts for filter dropdowns (public)
  // Returns counts of buyer interest by region, city, or suburb
  server.get("/location-counts", async (request, reply) => {
    const { level = "region", parentRegion, parentCity } = request.query as Record<string, string | undefined>;

    try {
      // Group by location name and count unique wanted ads
      // For region level, we aggregate suburbs/cities into their parent region
      const locationCounts = new Map<string, Set<string>>();

      // 1. Get counts from TargetLocation (area-based targeting)
      const targetLocations = await db.targetLocation.findMany({
        where: {
          wantedAd: {
            isActive: true,
            targetType: { in: ["AREA", "BOTH"] },
          },
        },
        include: {
          wantedAd: {
            select: { id: true },
          },
        },
      });

      for (const loc of targetLocations) {
        let name: string | null = null;

        if (level === "region") {
          // Map suburb/city to region, or use region directly
          if (loc.locationType === "REGION") {
            name = loc.name;
          } else {
            // Look up the region for this suburb/city
            name = getRegionForLocation(loc.name);
          }
        } else if (level === "city" && loc.locationType === "CITY") {
          name = loc.name;
        } else if (level === "suburb" && loc.locationType === "SUBURB") {
          name = loc.name;
        }

        if (name) {
          if (!locationCounts.has(name)) {
            locationCounts.set(name, new Set());
          }
          locationCounts.get(name)!.add(loc.wantedAd.id);
        }
      }

      // 2. Also get counts from TargetAddress (specific address targeting)
      // These addresses have region/city/suburb fields
      const targetAddresses = await db.targetAddress.findMany({
        where: {
          wantedAd: {
            isActive: true,
            targetType: { in: ["SPECIFIC_ADDRESS", "BOTH"] },
          },
        },
        include: {
          wantedAd: {
            select: { id: true },
          },
        },
      });

      for (const addr of targetAddresses) {
        let name: string | null = null;
        if (level === "region" && addr.region) {
          name = addr.region;
        } else if (level === "city" && addr.city) {
          name = addr.city;
        } else if (level === "suburb" && addr.suburb) {
          name = addr.suburb;
        }

        if (name) {
          if (!locationCounts.has(name)) {
            locationCounts.set(name, new Set());
          }
          locationCounts.get(name)!.add(addr.wantedAd.id);
        }
      }

      // Convert to array and sort by count
      const data = Array.from(locationCounts.entries())
        .map(([name, adIds]) => ({
          name,
          count: adIds.size,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        success: true,
        data,
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch location counts" },
      });
    }
  });

  // Get demand details for a specific property address (public)
  server.get("/property-demand/:encodedAddress", async (request, reply) => {
    const { encodedAddress } = request.params as { encodedAddress: string };

    try {
      // Decode the address (it's base64 encoded to handle special chars in URL)
      const addressKey = Buffer.from(encodedAddress, "base64").toString("utf-8");
      const [address, suburb, city] = addressKey.split("|");

      // Find all wanted ads targeting this address
      // Note: SQLite doesn't support case-insensitive mode, so we compare lowercased values
      const targetAddresses = await db.targetAddress.findMany({
        where: {
          wantedAd: {
            isActive: true,
            targetType: { in: ["SPECIFIC_ADDRESS", "BOTH"] },
          },
        },
        include: {
          wantedAd: {
            select: {
              budget: true,
              propertyTypes: true,
              bedroomsMin: true,
              bedroomsMax: true,
              bathroomsMin: true,
              features: true,
              createdAt: true,
            },
          },
        },
      });

      // Filter in JS for case-insensitive matching
      const matchingAddresses = targetAddresses.filter((ta) => {
        const addressMatch = ta.address.toLowerCase() === address.toLowerCase();
        const suburbMatch = !suburb || (ta.suburb?.toLowerCase() === suburb.toLowerCase());
        const cityMatch = !city || (ta.city?.toLowerCase() === city.toLowerCase());
        return addressMatch && suburbMatch && cityMatch;
      });

      if (matchingAddresses.length === 0) {
        return reply.status(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "No buyer interest found for this property" },
        });
      }

      // Aggregate the data
      const budgets = matchingAddresses.map((ta) => ta.wantedAd.budget);

      const allPropertyTypes = matchingAddresses
        .flatMap((ta) => (ta.wantedAd.propertyTypes ? JSON.parse(ta.wantedAd.propertyTypes) : []))
        .filter((v, i, a) => a.indexOf(v) === i);

      const allFeatures = matchingAddresses
        .flatMap((ta) => (ta.wantedAd.features ? JSON.parse(ta.wantedAd.features) : []))
        .filter((v, i, a) => a.indexOf(v) === i);

      const bedroomRequirements = matchingAddresses
        .filter((ta) => ta.wantedAd.bedroomsMin || ta.wantedAd.bedroomsMax)
        .map((ta) => ({ min: ta.wantedAd.bedroomsMin, max: ta.wantedAd.bedroomsMax }));

      const firstTarget = matchingAddresses[0];

      return {
        success: true,
        data: {
          address: firstTarget.address,
          suburb: firstTarget.suburb,
          city: firstTarget.city,
          region: firstTarget.region,
          buyerCount: matchingAddresses.length,
          budgets: budgets.sort((a, b) => a - b),
          budgetRange: {
            min: Math.min(...budgets),
            max: Math.max(...budgets),
            average: Math.round(budgets.reduce((sum, b) => sum + b, 0) / budgets.length),
          },
          propertyTypesWanted: allPropertyTypes,
          featuresWanted: allFeatures,
          bedroomRequirements,
          oldestInterest: matchingAddresses
            .map((ta) => ta.wantedAd.createdAt)
            .sort((a, b) => a.getTime() - b.getTime())[0],
          newestInterest: matchingAddresses
            .map((ta) => ta.wantedAd.createdAt)
            .sort((a, b) => b.getTime() - a.getTime())[0],
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch property demand" },
      });
    }
  });

  // List all wanted ads (public - for owners to browse demand)
  server.get("/", async (request, reply) => {
    const {
      page = "1",
      limit = "20",
      suburb,
      city,
      region,
      minBudget,
      maxBudget,
    } = request.query as Record<string, string | undefined>;

    try {
      const pageNum = parseInt(page, 10);
      const limitNum = Math.min(parseInt(limit, 10), 50);
      const skip = (pageNum - 1) * limitNum;

      // Only show area-based wanted ads publicly (not specific address targeting)
      const where: any = {
        isActive: true,
        targetType: { in: ["AREA", "BOTH"] },
      };

      if (minBudget) where.budget = { ...where.budget, gte: parseInt(minBudget, 10) };
      if (maxBudget) where.budget = { ...where.budget, lte: parseInt(maxBudget, 10) };

      // Location filtering through relations
      if (suburb || city || region) {
        where.OR = [
          {
            targetLocations: {
              some: {
                ...(suburb && { name: suburb, locationType: "SUBURB" }),
                ...(city && { name: city, locationType: "CITY" }),
                ...(region && { name: region, locationType: "REGION" }),
              },
            },
          },
          {
            targetAddresses: {
              some: {
                ...(suburb && { suburb }),
                ...(city && { city }),
                ...(region && { region }),
              },
            },
          },
        ];
      }

      const [wantedAds, total] = await Promise.all([
        db.wantedAd.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          include: {
            targetLocations: true,
            _count: { select: { targetAddresses: true, targetLocations: true } },
          },
        }),
        db.wantedAd.count({ where }),
      ]);

      return {
        success: true,
        data: wantedAds.map((ad) => ({
          id: ad.id,
          title: ad.title,
          budget: ad.budget,
          propertyTypes: ad.propertyTypes ? JSON.parse(ad.propertyTypes) : [],
          bedroomsMin: ad.bedroomsMin,
          bedroomsMax: ad.bedroomsMax,
          targetType: ad.targetType,
          locationCount: ad._count.targetAddresses + ad._count.targetLocations,
          locations: ad.targetLocations.map((l) => ({
            type: l.locationType,
            name: l.name,
          })),
          createdAt: ad.createdAt,
        })),
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch wanted ads" },
      });
    }
  });

  // Get a single wanted ad (public - doesn't expose specific addresses)
  server.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const wantedAd = await db.wantedAd.findUnique({
        where: { id },
        include: {
          targetLocations: true,
          _count: { select: { targetAddresses: true } },
          buyer: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
        },
      });

      // Hide specific-address-only wanted ads from public view
      if (!wantedAd || wantedAd.targetType === "SPECIFIC_ADDRESS") {
        return reply.status(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "Wanted ad not found" },
        });
      }

      // Return count of target addresses instead of actual addresses for privacy
      return {
        success: true,
        data: {
          id: wantedAd.id,
          title: wantedAd.title,
          description: wantedAd.description,
          budget: wantedAd.budget,
          propertyTypes: wantedAd.propertyTypes,
          bedroomsMin: wantedAd.bedroomsMin,
          bedroomsMax: wantedAd.bedroomsMax,
          bathroomsMin: wantedAd.bathroomsMin,
          landSizeMin: wantedAd.landSizeMin,
          landSizeMax: wantedAd.landSizeMax,
          floorAreaMin: wantedAd.floorAreaMin,
          floorAreaMax: wantedAd.floorAreaMax,
          features: wantedAd.features,
          targetType: wantedAd.targetType,
          targetLocations: wantedAd.targetLocations,
          targetAddresses: Array(wantedAd._count.targetAddresses).fill({ hidden: true }),
          isActive: wantedAd.isActive,
          createdAt: wantedAd.createdAt,
          buyer: {
            name: wantedAd.buyer.user.name,
            image: wantedAd.buyer.user.image,
          },
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch wanted ad" },
      });
    }
  });

  // Create a wanted ad (protected)
  server.post(
    "/",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createWantedAdSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: body.error.flatten().fieldErrors,
          },
        });
      }

      const { sub: userId } = request.user as { sub: string };
      const data = body.data as CreateWantedAdInput;

      try {
        // Ensure buyer profile exists first (needed for counting existing specific address interests)
        let buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });

        if (!buyerProfile) {
          buyerProfile = await db.buyerProfile.create({
            data: { userId },
          });
        }

        // Check specific address limit if targeting specific addresses
        if ((data.targetType === "SPECIFIC_ADDRESS" || data.targetType === "BOTH") &&
            data.targetAddresses && data.targetAddresses.length > 0) {
          const specificAddressLimit = await getFeatureLimit(userId, "specificAddressLimit");

          // -1 means unlimited
          if (specificAddressLimit !== -1) {
            // Count existing specific address wanted ads
            const existingSpecificCount = await db.wantedAd.count({
              where: {
                buyerId: buyerProfile.id,
                isActive: true,
                targetType: { in: ["SPECIFIC_ADDRESS", "BOTH"] },
              },
            });

            if (existingSpecificCount >= specificAddressLimit) {
              return reply.status(402).send({
                success: false,
                error: {
                  code: "UPGRADE_REQUIRED",
                  message: specificAddressLimit === 0
                    ? "Upgrade to Pro for specific address interests"
                    : `You've reached your limit of ${specificAddressLimit} specific address interest${specificAddressLimit === 1 ? '' : 's'}. Upgrade to Pro for unlimited.`,
                  upgradeUrl: "/upgrade",
                  currentCount: existingSpecificCount,
                  limit: specificAddressLimit,
                },
              });
            }
          }
        }

        // Check wanted ad limit (use configurable limits from billing settings)
        const wantedAdLimit = await getFeatureLimit(userId, "wantedAdLimit");

        // -1 means unlimited
        if (wantedAdLimit !== -1) {
          const existingAdsCount = await db.wantedAd.count({
            where: { buyerId: buyerProfile.id, isActive: true },
          });

          if (existingAdsCount >= wantedAdLimit) {
            return reply.status(402).send({
              success: false,
              error: {
                code: "UPGRADE_REQUIRED",
                message: `You've reached your limit of ${wantedAdLimit} wanted ads. Upgrade to Pro for unlimited.`,
                upgradeUrl: "/upgrade",
                currentCount: existingAdsCount,
                limit: wantedAdLimit,
              },
            });
          }
        }

        const wantedAd = await db.wantedAd.create({
          data: {
            buyerId: buyerProfile.id,
            title: data.title,
            description: data.description,
            budget: data.budget,
            financeStatus: data.financeStatus,
            propertyTypes: data.propertyTypes ? JSON.stringify(data.propertyTypes) : null,
            bedroomsMin: data.bedroomsMin,
            bedroomsMax: data.bedroomsMax,
            bathroomsMin: data.bathroomsMin,
            landSizeMin: data.landSizeMin,
            landSizeMax: data.landSizeMax,
            floorAreaMin: data.floorAreaMin,
            floorAreaMax: data.floorAreaMax,
            features: data.features ? JSON.stringify(data.features) : null,
            targetType: data.targetType,
            targetLocations: data.targetLocations
              ? {
                  create: data.targetLocations.map((loc) => ({
                    locationType: loc.locationType,
                    name: loc.name,
                  })),
                }
              : undefined,
            targetAddresses: data.targetAddresses
              ? {
                  create: data.targetAddresses.map((addr) => ({
                    address: addr.address,
                    suburb: addr.suburb,
                    city: addr.city,
                    region: addr.region,
                    postcode: addr.postcode,
                  })),
                }
              : undefined,
          },
          include: {
            targetLocations: true,
            targetAddresses: true,
          },
        });

        // Auto-match with existing properties and notify owners
        const matchCount = await createMatchesForWantedAd(wantedAd.id, wantedAd.title);
        server.log.info(`Created ${matchCount} matches for wanted ad ${wantedAd.id}`);

        return reply.status(201).send({
          success: true,
          data: {
            ...wantedAd,
            matchCount,
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to create wanted ad" },
        });
      }
    }
  );

  // Update a wanted ad (protected)
  server.patch(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const wantedAd = await db.wantedAd.findUnique({
          where: { id },
          include: { buyer: true },
        });

        if (!wantedAd) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Wanted ad not found" },
          });
        }

        // Check ownership
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });

        if (wantedAd.buyerId !== buyerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const body = request.body as Record<string, any>;

        const updated = await db.wantedAd.update({
          where: { id },
          data: {
            ...(body.title && { title: body.title }),
            ...(body.description !== undefined && {
              description: body.description,
            }),
            ...(body.budget && { budget: body.budget }),
            ...(body.isActive !== undefined && { isActive: body.isActive }),
          },
          include: {
            targetLocations: true,
            targetAddresses: true,
          },
        });

        return { success: true, data: updated };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to update wanted ad" },
        });
      }
    }
  );

  // Delete a wanted ad (protected)
  server.delete(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const wantedAd = await db.wantedAd.findUnique({
          where: { id },
          include: { buyer: true },
        });

        if (!wantedAd) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Wanted ad not found" },
          });
        }

        // Check ownership
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });

        if (wantedAd.buyerId !== buyerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        await db.wantedAd.delete({ where: { id } });

        return { success: true, data: { deleted: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to delete wanted ad" },
        });
      }
    }
  );

  // Get my wanted ads (protected)
  server.get(
    "/me/ads",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });

        if (!buyerProfile) {
          return { success: true, data: [] };
        }

        const wantedAds = await db.wantedAd.findMany({
          where: { buyerId: buyerProfile.id },
          orderBy: { createdAt: "desc" },
          include: {
            targetLocations: true,
            targetAddresses: true,
            _count: { select: { matchingProperties: true } },
          },
        });

        return {
          success: true,
          data: wantedAds.map((ad) => ({
            ...ad,
            targetAddresses: ad.targetAddresses.map((addr) => ({
              ...addr,
              propertyData: addr.propertyData ? JSON.parse(addr.propertyData) : null,
            })),
            matchCount: ad._count.matchingProperties,
          })),
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch wanted ads" },
        });
      }
    }
  );

  // Get a single one of my wanted ads (protected) - allows viewing specific address ads
  server.get(
    "/me/ads/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };
      const { id } = request.params as { id: string };

      try {
        const buyerProfile = await db.buyerProfile.findUnique({
          where: { userId },
        });

        if (!buyerProfile) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Buyer profile not found" },
          });
        }

        const wantedAd = await db.wantedAd.findUnique({
          where: { id },
          include: {
            targetLocations: true,
            targetAddresses: true,
            postcardRequests: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                status: true,
                recipientAddress: true,
                customMessage: true,
                showBudget: true,
                claimedAt: true,
                ownerResponseAt: true,
                ownerName: true,
                ownerEmail: true,
                ownerPhone: true,
                ownerMessage: true,
                sentAt: true,
                createdAt: true,
              },
            },
            _count: { select: { matchingProperties: true } },
            buyer: {
              include: {
                user: { select: { name: true, image: true } },
              },
            },
          },
        });

        // Check ownership
        if (!wantedAd || wantedAd.buyerId !== buyerProfile.id) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Wanted ad not found" },
          });
        }

        return {
          success: true,
          data: {
            id: wantedAd.id,
            title: wantedAd.title,
            description: wantedAd.description,
            budget: wantedAd.budget,
            financeStatus: wantedAd.financeStatus,
            propertyTypes: wantedAd.propertyTypes,
            bedroomsMin: wantedAd.bedroomsMin,
            bedroomsMax: wantedAd.bedroomsMax,
            bathroomsMin: wantedAd.bathroomsMin,
            landSizeMin: wantedAd.landSizeMin,
            landSizeMax: wantedAd.landSizeMax,
            floorAreaMin: wantedAd.floorAreaMin,
            floorAreaMax: wantedAd.floorAreaMax,
            features: wantedAd.features,
            targetType: wantedAd.targetType,
            targetLocations: wantedAd.targetLocations,
            targetAddresses: wantedAd.targetAddresses.map((addr) => ({
              ...addr,
              propertyData: addr.propertyData ? JSON.parse(addr.propertyData) : null,
            })),
            postcardRequests: wantedAd.postcardRequests,
            isActive: wantedAd.isActive,
            createdAt: wantedAd.createdAt,
            matchCount: wantedAd._count.matchingProperties,
            buyer: {
              name: wantedAd.buyer.user.name,
              image: wantedAd.buyer.user.image,
            },
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch wanted ad" },
        });
      }
    }
  );
}
