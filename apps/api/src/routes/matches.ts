import type { FastifyInstance } from "fastify";
import { db } from "@offmarket/database";

export async function matchesRoutes(server: FastifyInstance) {
  // Manually trigger matching for a property (protected - owner only)
  server.post(
    "/property/:propertyId/calculate",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId } = request.params as { propertyId: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id: propertyId },
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

        // Find matching wanted ads
        const wantedAds = await db.wantedAd.findMany({
          where: {
            isActive: true,
            // Budget within 20% of estimated value
            ...(property.estimatedValue && {
              budget: {
                gte: property.estimatedValue * 0.8,
                lte: property.estimatedValue * 1.2,
              },
            }),
          },
          include: {
            targetLocations: true,
            targetAddresses: true,
          },
        });

        // Calculate match scores and create/update matches
        const matchResults = [];

        for (const ad of wantedAds) {
          let score = 0;
          const matchedOn: string[] = [];
          let matchType: "DIRECT" | "CRITERIA" = "CRITERIA";

          // Check for DIRECT address match first (buyer specifically named this property)
          let isDirectAddressMatch = false;
          let locationMatch = false;

          for (const addr of ad.targetAddresses) {
            // Check if the buyer specifically named this property address
            if (
              addr.address.toLowerCase().includes(property.address.toLowerCase()) ||
              (property.address.toLowerCase().includes(addr.address.toLowerCase()) &&
                addr.address.length > 5)
            ) {
              locationMatch = true;
              isDirectAddressMatch = true;
              break;
            }
            // Suburb/city matches from targetAddresses
            if (
              addr.suburb?.toLowerCase() === property.suburb?.toLowerCase() ||
              addr.city?.toLowerCase() === property.city?.toLowerCase()
            ) {
              locationMatch = true;
              break;
            }
          }

          // Check target locations (these are CRITERIA matches)
          if (!locationMatch) {
            locationMatch = ad.targetLocations.some(
              (loc) =>
                (loc.locationType === "SUBURB" &&
                  loc.name.toLowerCase() === property.suburb?.toLowerCase()) ||
                (loc.locationType === "CITY" &&
                  loc.name.toLowerCase() === property.city?.toLowerCase()) ||
                (loc.locationType === "REGION" &&
                  loc.name.toLowerCase() === property.region?.toLowerCase())
            );
          }

          if (locationMatch) {
            // Direct address matches are 100% - buyer specifically wants this property
            if (isDirectAddressMatch) {
              score = 100;
              matchedOn.push("direct_address");
              matchType = "DIRECT";
              // Create/update match immediately for direct matches
              const match = await db.propertyMatch.upsert({
                where: {
                  wantedAdId_propertyId: {
                    wantedAdId: ad.id,
                    propertyId: property.id,
                  },
                },
                update: {
                  matchScore: score,
                  matchType,
                  matchedOn: JSON.stringify(matchedOn),
                },
                create: {
                  wantedAdId: ad.id,
                  propertyId: property.id,
                  matchScore: score,
                  matchType,
                  matchedOn: JSON.stringify(matchedOn),
                },
              });

              matchResults.push({
                matchId: match.id,
                wantedAdId: ad.id,
                score,
                matchType,
                matchedOn,
              });
              continue;
            } else {
              score += 40;
              matchedOn.push("location");
            }
          } else {
            // Skip if no location match
            continue;
          }

          // Budget match (30 points)
          if (property.estimatedValue) {
            const diff = Math.abs(property.estimatedValue - ad.budget);
            const tolerance = property.estimatedValue * 0.2; // 20% tolerance
            if (diff <= tolerance) {
              // Full match if within 20%
              score += 30;
              matchedOn.push("budget");
            } else if (diff <= tolerance * 2) {
              // Partial match if within 40%
              score += 15;
              matchedOn.push("budget_partial");
            }
          }

          // Property type match (10 points)
          const adPropertyTypes = ad.propertyTypes ? JSON.parse(ad.propertyTypes) : [];
          if (
            property.propertyType &&
            adPropertyTypes.includes(property.propertyType)
          ) {
            score += 10;
            matchedOn.push("propertyType");
          }

          // Bedrooms match (10 points)
          if (property.bedrooms) {
            const bedsMatch =
              (!ad.bedroomsMin || property.bedrooms >= ad.bedroomsMin) &&
              (!ad.bedroomsMax || property.bedrooms <= ad.bedroomsMax);
            if (bedsMatch) {
              score += 10;
              matchedOn.push("bedrooms");
            }
          }

          // Features match (10 points)
          const propertyFeatures = property.features ? JSON.parse(property.features) : [];
          const adFeatures = ad.features ? JSON.parse(ad.features) : [];
          if (propertyFeatures.length > 0 && adFeatures.length > 0) {
            const matchingFeatures = propertyFeatures.filter((f: string) =>
              adFeatures.includes(f)
            );
            const featureScore = Math.min(
              10,
              (matchingFeatures.length / adFeatures.length) * 10
            );
            if (featureScore > 0) {
              score += Math.round(featureScore);
              matchedOn.push("features");
            }
          }

          // Only create match if score is above threshold
          if (score >= 40) {
            const match = await db.propertyMatch.upsert({
              where: {
                wantedAdId_propertyId: {
                  wantedAdId: ad.id,
                  propertyId: property.id,
                },
              },
              update: {
                matchScore: score,
                matchType,
                matchedOn: JSON.stringify(matchedOn),
              },
              create: {
                wantedAdId: ad.id,
                propertyId: property.id,
                matchScore: score,
                matchType,
                matchedOn: JSON.stringify(matchedOn),
              },
            });

            matchResults.push({
              matchId: match.id,
              wantedAdId: ad.id,
              score,
              matchType,
              matchedOn,
            });
          }
        }

        return {
          success: true,
          data: {
            propertyId,
            matchesFound: matchResults.length,
            matches: matchResults,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to calculate matches" },
        });
      }
    }
  );

  // Get matches for a wanted ad (protected - buyer only)
  server.get(
    "/wanted-ad/:wantedAdId",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { wantedAdId } = request.params as { wantedAdId: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const wantedAd = await db.wantedAd.findUnique({
          where: { id: wantedAdId },
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

        const matches = await db.propertyMatch.findMany({
          where: { wantedAdId },
          orderBy: { matchScore: "desc" },
          include: {
            property: {
              select: {
                id: true,
                suburb: true,
                city: true,
                region: true,
                propertyType: true,
                bedrooms: true,
                bathrooms: true,
                // Note: address not included for privacy
              },
            },
          },
        });

        return {
          success: true,
          data: matches.map((m) => ({
            matchId: m.id,
            matchScore: m.matchScore,
            matchedOn: JSON.parse(m.matchedOn),
            property: {
              id: m.property.id,
              suburb: m.property.suburb,
              city: m.property.city,
              region: m.property.region,
              propertyType: m.property.propertyType,
              bedrooms: m.property.bedrooms,
              bathrooms: m.property.bathrooms,
            },
            createdAt: m.createdAt,
          })),
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch matches" },
        });
      }
    }
  );
}
