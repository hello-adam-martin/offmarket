import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";
import { createMatchesForProperty } from "../services/matching.js";

const createPropertySchema = z.object({
  address: z.string().min(5),
  suburb: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postcode: z.string().regex(/^\d{4}$/).optional(),
  propertyType: z.string().optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  landSize: z.number().positive().optional(),
  floorArea: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(2030).optional(),
  features: z.array(z.string()).optional(),
  estimatedValue: z.number().positive().optional(),
  rvValue: z.number().positive().optional(),
});

export async function propertiesRoutes(server: FastifyInstance) {
  // Register a property (protected)
  server.post(
    "/",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createPropertySchema.safeParse(request.body);
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
      const data = body.data;

      try {
        // Ensure owner profile exists
        let ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (!ownerProfile) {
          ownerProfile = await db.ownerProfile.create({
            data: { userId },
          });
        }

        // Check if property already exists
        const existing = await db.property.findFirst({
          where: {
            address: data.address,
            suburb: data.suburb,
            city: data.city,
          },
        });

        if (existing) {
          return reply.status(409).send({
            success: false,
            error: {
              code: "PROPERTY_EXISTS",
              message: "This property is already registered",
            },
          });
        }

        const property = await db.property.create({
          data: {
            ownerId: ownerProfile.id,
            address: data.address,
            suburb: data.suburb,
            city: data.city,
            region: data.region,
            postcode: data.postcode,
            propertyType: data.propertyType,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            landSize: data.landSize,
            floorArea: data.floorArea,
            yearBuilt: data.yearBuilt,
            features: data.features ? JSON.stringify(data.features) : null,
            estimatedValue: data.estimatedValue,
            rvValue: data.rvValue,
          },
        });

        // Auto-match with existing wanted ads and notify owner
        const matchCount = await createMatchesForProperty(
          property.id,
          property.address,
          userId
        );
        server.log.info(`Created ${matchCount} matches for property ${property.id}`);

        return reply.status(201).send({
          success: true,
          data: {
            ...property,
            matchCount,
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to register property" },
        });
      }
    }
  );

  // Get my properties (protected)
  server.get(
    "/me",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (!ownerProfile) {
          return { success: true, data: [] };
        }

        const properties = await db.property.findMany({
          where: { ownerId: ownerProfile.id },
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { matches: true } },
          },
        });

        return {
          success: true,
          data: properties.map((p) => ({
            ...p,
            demandCount: p._count.matches,
          })),
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch properties" },
        });
      }
    }
  );

  // Get a single property (protected - owner only)
  server.get(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id },
          include: {
            owner: true,
            _count: { select: { matches: true } },
          },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        // Check ownership
        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized to view this property" },
          });
        }

        // Parse features if stored as JSON string
        let features: string[] = [];
        if (property.features) {
          try {
            features = typeof property.features === "string"
              ? JSON.parse(property.features)
              : property.features;
          } catch {
            features = [];
          }
        }

        return {
          success: true,
          data: {
            id: property.id,
            address: property.address,
            suburb: property.suburb,
            city: property.city,
            region: property.region,
            postcode: property.postcode,
            propertyType: property.propertyType,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            landSize: property.landSize,
            floorArea: property.floorArea,
            yearBuilt: property.yearBuilt,
            features,
            estimatedValue: property.estimatedValue,
            rvValue: property.rvValue,
            createdAt: property.createdAt,
            demandCount: property._count.matches,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch property" },
        });
      }
    }
  );

  // Get property demand (protected - owner only)
  server.get(
    "/:id/demand",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id },
          include: { owner: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        // Check ownership
        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        // Get matches for this property
        const matches = await db.propertyMatch.findMany({
          where: { propertyId: id },
          orderBy: { matchScore: "desc" },
          include: {
            wantedAd: {
              select: {
                id: true,
                title: true,
                budget: true,
                propertyTypes: true,
                bedroomsMin: true,
                bedroomsMax: true,
                createdAt: true,
                buyer: {
                  select: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Calculate aggregate stats
        const budgets = matches.map((m) => m.wantedAd.budget);

        const budgetStats =
          budgets.length > 0
            ? {
                min: Math.min(...budgets),
                max: Math.max(...budgets),
                average: Math.round(
                  budgets.reduce((acc, b) => acc + b, 0) / budgets.length
                ),
              }
            : { min: 0, max: 0, average: 0 };

        // Mark matches as viewed
        await db.propertyMatch.updateMany({
          where: { propertyId: id, viewedByOwner: false },
          data: { viewedByOwner: true, viewedAt: new Date() },
        });

        // Separate matches by type
        const directMatches = matches.filter((m) => m.matchType === "DIRECT");
        const criteriaMatches = matches.filter((m) => m.matchType === "CRITERIA");

        // Helper to obfuscate buyer name (e.g., "Sarah Anderson" -> "Sarah A.")
        const obfuscateName = (fullName: string | null | undefined): string => {
          if (!fullName) return "Anonymous";
          const parts = fullName.trim().split(/\s+/);
          if (parts.length === 1) return parts[0];
          const firstName = parts[0];
          const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
          return `${firstName} ${lastInitial}.`;
        };

        return {
          success: true,
          data: {
            propertyId: property.id,
            address: property.address,
            totalBuyers: matches.length,
            directInterestCount: directMatches.length,
            criteriaMatchCount: criteriaMatches.length,
            budgetRange: budgetStats,
            directInterest: directMatches.map((m) => ({
              matchId: m.id,
              matchScore: m.matchScore,
              matchType: m.matchType,
              matchedOn: JSON.parse(m.matchedOn),
              buyerBudget: m.wantedAd.budget,
              buyerName: obfuscateName(m.wantedAd.buyer?.user?.name),
              buyerId: m.wantedAd.buyer?.id,
              wantedAdId: m.wantedAd.id,
              wantedAdTitle: m.wantedAd.title,
              createdAt: m.createdAt,
            })),
            criteriaMatches: criteriaMatches.map((m) => ({
              matchId: m.id,
              matchScore: m.matchScore,
              matchType: m.matchType,
              matchedOn: JSON.parse(m.matchedOn),
              buyerBudget: { min: m.wantedAd.budget, max: m.wantedAd.budget },
              wantedAdId: m.wantedAd.id,
              wantedAdTitle: m.wantedAd.title,
              createdAt: m.createdAt,
            })),
            // Keep legacy matches array for backwards compatibility
            matches: matches.map((m) => ({
              matchId: m.id,
              matchScore: m.matchScore,
              matchType: m.matchType,
              matchedOn: JSON.parse(m.matchedOn),
              buyerBudget: { min: m.wantedAd.budget, max: m.wantedAd.budget },
              wantedAdId: m.wantedAd.id,
              wantedAdTitle: m.wantedAd.title,
              createdAt: m.createdAt,
            })),
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch demand" },
        });
      }
    }
  );

  // Check demand for an address (public - preview only, limited info)
  server.get("/check-demand", async (request, reply) => {
    const { address, suburb, city } = request.query as Record<string, string>;

    if (!address) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Address is required" },
      });
    }

    try {
      // Find matching wanted ads based on location
      const matchingAds = await db.wantedAd.count({
        where: {
          isActive: true,
          OR: [
            {
              targetAddresses: {
                some: {
                  OR: [
                    { address: { contains: address, mode: "insensitive" } },
                    ...(suburb ? [{ suburb: { equals: suburb, mode: "insensitive" as const } }] : []),
                    ...(city ? [{ city: { equals: city, mode: "insensitive" as const } }] : []),
                  ],
                },
              },
            },
            {
              targetLocations: {
                some: {
                  OR: [
                    ...(suburb ? [{ name: { equals: suburb, mode: "insensitive" as const }, locationType: "SUBURB" as const }] : []),
                    ...(city ? [{ name: { equals: city, mode: "insensitive" as const }, locationType: "CITY" as const }] : []),
                  ],
                },
              },
            },
          ],
        },
      });

      return {
        success: true,
        data: {
          address,
          suburb,
          city,
          buyerCount: matchingAds,
          hasInterest: matchingAds > 0,
          message:
            matchingAds > 0
              ? `${matchingAds} buyer${matchingAds > 1 ? "s" : ""} interested in this area`
              : "No current buyers registered for this area",
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to check demand" },
      });
    }
  });

  // Update a property (protected)
  server.patch(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id },
          include: { owner: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        // Check ownership
        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const body = request.body as Record<string, any>;

        const updated = await db.property.update({
          where: { id },
          data: {
            ...(body.bedrooms && { bedrooms: body.bedrooms }),
            ...(body.bathrooms && { bathrooms: body.bathrooms }),
            ...(body.landSize && { landSize: body.landSize }),
            ...(body.floorArea && { floorArea: body.floorArea }),
            ...(body.yearBuilt && { yearBuilt: body.yearBuilt }),
            ...(body.estimatedValue && { estimatedValue: body.estimatedValue }),
            ...(body.rvValue && { rvValue: body.rvValue }),
            ...(body.features && { features: body.features }),
          },
        });

        return { success: true, data: updated };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to update property" },
        });
      }
    }
  );

  // Delete a property (protected)
  server.delete(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id },
          include: { owner: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        // Check ownership
        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        await db.property.delete({ where: { id } });

        return { success: true, data: { deleted: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to delete property" },
        });
      }
    }
  );
}
