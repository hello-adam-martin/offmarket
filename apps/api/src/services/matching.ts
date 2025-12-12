import { db } from "@offmarket/database";
import { sendDirectMatchEmail, sendCriteriaMatchEmail } from "./email.js";
import { formatNZD } from "@offmarket/utils";

interface MatchResult {
  propertyId: string;
  ownerId: string;
  ownerUserId: string;
  score: number;
  matchedOn: string[];
  matchType: "DIRECT" | "CRITERIA";
}

/**
 * Find all properties that match a given wanted ad's criteria
 */
export async function findMatchingPropertiesForWantedAd(
  wantedAdId: string
): Promise<MatchResult[]> {
  const wantedAd = await db.wantedAd.findUnique({
    where: { id: wantedAdId },
    include: {
      targetLocations: true,
      targetAddresses: true,
    },
  });

  if (!wantedAd || !wantedAd.isActive) {
    return [];
  }

  // Get all properties (filter in memory for SQLite case-insensitivity)
  const properties = await db.property.findMany({
    include: {
      owner: true,
    },
  });

  const matchResults: MatchResult[] = [];

  const adPropertyTypes: string[] = wantedAd.propertyTypes
    ? JSON.parse(wantedAd.propertyTypes)
    : [];
  const adFeatures: string[] = wantedAd.features
    ? JSON.parse(wantedAd.features)
    : [];

  for (const property of properties) {
    let score = 0;
    const matchedOn: string[] = [];
    let matchType: "DIRECT" | "CRITERIA" = "CRITERIA";

    // Location match (40 points for CRITERIA, 50 points for DIRECT address match)
    let locationMatch = false;
    let isDirectAddressMatch = false;

    // Check target addresses first (these are DIRECT matches)
    for (const addr of wantedAd.targetAddresses) {
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
      // Suburb/city from targetAddresses is still considered direct interest
      if (
        addr.suburb &&
        property.suburb &&
        addr.suburb.toLowerCase() === property.suburb.toLowerCase()
      ) {
        locationMatch = true;
        break;
      }
      if (
        addr.city &&
        property.city &&
        addr.city.toLowerCase() === property.city.toLowerCase()
      ) {
        locationMatch = true;
        break;
      }
    }

    // Check target locations (these are CRITERIA matches)
    if (!locationMatch) {
      for (const loc of wantedAd.targetLocations) {
        if (
          loc.locationType === "SUBURB" &&
          property.suburb &&
          loc.name.toLowerCase() === property.suburb.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
        if (
          loc.locationType === "CITY" &&
          property.city &&
          loc.name.toLowerCase() === property.city.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
        if (
          loc.locationType === "REGION" &&
          property.region &&
          loc.name.toLowerCase() === property.region.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
      }
    }

    if (locationMatch) {
      // Direct address matches are 100% - buyer specifically wants this property
      if (isDirectAddressMatch) {
        score = 100;
        matchedOn.push("direct_address");
        matchType = "DIRECT";
        // Skip other criteria checks for direct matches
        matchResults.push({
          propertyId: property.id,
          ownerId: property.ownerId,
          ownerUserId: property.owner.userId,
          score,
          matchedOn,
          matchType,
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
      const diff = Math.abs(property.estimatedValue - wantedAd.budget);
      const tolerance = property.estimatedValue * 0.2; // 20% tolerance
      if (diff <= tolerance) {
        score += 30;
        matchedOn.push("budget");
      } else if (diff <= tolerance * 2) {
        score += 15;
        matchedOn.push("budget_partial");
      }
    }

    // Property type match (10 points)
    if (property.propertyType && adPropertyTypes.includes(property.propertyType)) {
      score += 10;
      matchedOn.push("propertyType");
    }

    // Bedrooms match (10 points)
    if (property.bedrooms) {
      const bedsMatch =
        (!wantedAd.bedroomsMin || property.bedrooms >= wantedAd.bedroomsMin) &&
        (!wantedAd.bedroomsMax || property.bedrooms <= wantedAd.bedroomsMax);
      if (bedsMatch && (wantedAd.bedroomsMin || wantedAd.bedroomsMax)) {
        score += 10;
        matchedOn.push("bedrooms");
      }
    }

    // Features match (10 points)
    const propertyFeatures: string[] = property.features
      ? JSON.parse(property.features)
      : [];
    if (propertyFeatures.length > 0 && adFeatures.length > 0) {
      const matchingFeatures = propertyFeatures.filter((f) =>
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

    // Only include if score is above threshold
    if (score >= 40) {
      matchResults.push({
        propertyId: property.id,
        ownerId: property.ownerId,
        ownerUserId: property.owner.userId,
        score,
        matchedOn,
        matchType,
      });
    }
  }

  return matchResults.sort((a, b) => b.score - a.score);
}

/**
 * Create or update matches for a wanted ad and notify property owners
 */
export async function createMatchesForWantedAd(
  wantedAdId: string,
  wantedAdTitle: string,
  buyerName?: string,
  budget?: number
): Promise<number> {
  const matches = await findMatchingPropertiesForWantedAd(wantedAdId);

  let createdCount = 0;

  for (const match of matches) {
    // Create or update the match record
    const existingMatch = await db.propertyMatch.findUnique({
      where: {
        wantedAdId_propertyId: {
          wantedAdId,
          propertyId: match.propertyId,
        },
      },
    });

    if (!existingMatch) {
      // Create new match
      await db.propertyMatch.create({
        data: {
          wantedAdId,
          propertyId: match.propertyId,
          matchScore: match.score,
          matchType: match.matchType,
          matchedOn: JSON.stringify(match.matchedOn),
        },
      });

      // Create notification for property owner - different message for direct vs criteria
      const notificationTitle = match.matchType === "DIRECT"
        ? "A buyer wants YOUR property!"
        : "New buyer interest in your property";
      const notificationMessage = match.matchType === "DIRECT"
        ? `A buyer specifically listed your property address in their wanted ad "${wantedAdTitle}".`
        : `A buyer searching for "${wantedAdTitle}" matches your property's criteria.`;

      await db.notification.create({
        data: {
          userId: match.ownerUserId,
          type: "NEW_MATCH",
          title: notificationTitle,
          message: notificationMessage,
          data: {
            wantedAdId,
            propertyId: match.propertyId,
            matchScore: match.score,
            matchType: match.matchType,
          },
        },
      });

      // Send email notification for direct matches
      if (match.matchType === "DIRECT" && buyerName && budget) {
        const property = await db.property.findUnique({
          where: { id: match.propertyId },
          include: { owner: { include: { user: { select: { email: true } } } } },
        });

        if (property?.owner.user.email) {
          sendDirectMatchEmail({
            ownerEmail: property.owner.user.email,
            buyerName,
            propertyAddress: property.address,
            budget: formatNZD(budget),
          }).catch((err) => console.error("Failed to send direct match email:", err));
        }
      }

      createdCount++;
    } else {
      // Update existing match score/type if it changed
      if (existingMatch.matchScore !== match.score || existingMatch.matchType !== match.matchType) {
        await db.propertyMatch.update({
          where: { id: existingMatch.id },
          data: {
            matchScore: match.score,
            matchType: match.matchType,
            matchedOn: JSON.stringify(match.matchedOn),
          },
        });
      }
    }
  }

  return createdCount;
}

/**
 * Find all wanted ads that match a given property and create matches
 */
export async function findMatchingWantedAdsForProperty(
  propertyId: string
): Promise<MatchResult[]> {
  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: true,
    },
  });

  if (!property) {
    return [];
  }

  // Get all active wanted ads
  const wantedAds = await db.wantedAd.findMany({
    where: { isActive: true },
    include: {
      targetLocations: true,
      targetAddresses: true,
      buyer: true,
    },
  });

  const matchResults: MatchResult[] = [];

  const propertyFeatures: string[] = property.features
    ? JSON.parse(property.features)
    : [];

  for (const ad of wantedAds) {
    let score = 0;
    const matchedOn: string[] = [];

    const adPropertyTypes: string[] = ad.propertyTypes
      ? JSON.parse(ad.propertyTypes)
      : [];
    const adFeatures: string[] = ad.features ? JSON.parse(ad.features) : [];

    // Location match (40 points)
    let locationMatch = false;

    // Check target addresses
    for (const addr of ad.targetAddresses) {
      if (
        addr.address.toLowerCase().includes(property.address.toLowerCase()) ||
        (property.address.toLowerCase().includes(addr.address.toLowerCase()) &&
          addr.address.length > 5)
      ) {
        locationMatch = true;
        break;
      }
      if (
        addr.suburb &&
        property.suburb &&
        addr.suburb.toLowerCase() === property.suburb.toLowerCase()
      ) {
        locationMatch = true;
        break;
      }
      if (
        addr.city &&
        property.city &&
        addr.city.toLowerCase() === property.city.toLowerCase()
      ) {
        locationMatch = true;
        break;
      }
    }

    // Check target locations
    if (!locationMatch) {
      for (const loc of ad.targetLocations) {
        if (
          loc.locationType === "SUBURB" &&
          property.suburb &&
          loc.name.toLowerCase() === property.suburb.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
        if (
          loc.locationType === "CITY" &&
          property.city &&
          loc.name.toLowerCase() === property.city.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
        if (
          loc.locationType === "REGION" &&
          property.region &&
          loc.name.toLowerCase() === property.region.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
      }
    }

    if (locationMatch) {
      score += 40;
      matchedOn.push("location");
    } else {
      continue;
    }

    // Budget match (30 points)
    if (property.estimatedValue) {
      const diff = Math.abs(property.estimatedValue - ad.budget);
      const tolerance = property.estimatedValue * 0.2;
      if (diff <= tolerance) {
        score += 30;
        matchedOn.push("budget");
      } else if (diff <= tolerance * 2) {
        score += 15;
        matchedOn.push("budget_partial");
      }
    }

    // Property type match (10 points)
    if (property.propertyType && adPropertyTypes.includes(property.propertyType)) {
      score += 10;
      matchedOn.push("propertyType");
    }

    // Bedrooms match (10 points)
    if (property.bedrooms) {
      const bedsMatch =
        (!ad.bedroomsMin || property.bedrooms >= ad.bedroomsMin) &&
        (!ad.bedroomsMax || property.bedrooms <= ad.bedroomsMax);
      if (bedsMatch && (ad.bedroomsMin || ad.bedroomsMax)) {
        score += 10;
        matchedOn.push("bedrooms");
      }
    }

    // Features match (10 points)
    if (propertyFeatures.length > 0 && adFeatures.length > 0) {
      const matchingFeatures = propertyFeatures.filter((f) =>
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

    if (score >= 40) {
      matchResults.push({
        propertyId: property.id,
        ownerId: property.ownerId,
        ownerUserId: property.owner.userId,
        score,
        matchedOn,
      });
    }
  }

  return matchResults.sort((a, b) => b.score - a.score);
}

/**
 * Create matches when a new property is registered and notify the owner
 */
export async function createMatchesForProperty(
  propertyId: string,
  propertyAddress: string,
  ownerUserId: string
): Promise<number> {
  const property = await db.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) return 0;

  // Get all active wanted ads with their locations
  const wantedAds = await db.wantedAd.findMany({
    where: { isActive: true },
    include: {
      targetLocations: true,
      targetAddresses: true,
    },
  });

  let createdCount = 0;
  const propertyFeatures: string[] = property.features
    ? JSON.parse(property.features)
    : [];

  for (const ad of wantedAds) {
    let score = 0;
    const matchedOn: string[] = [];
    let matchType: "DIRECT" | "CRITERIA" = "CRITERIA";

    const adPropertyTypes: string[] = ad.propertyTypes
      ? JSON.parse(ad.propertyTypes)
      : [];
    const adFeatures: string[] = ad.features ? JSON.parse(ad.features) : [];

    // Location match (40 points for CRITERIA, 50 points for DIRECT)
    let locationMatch = false;
    let isDirectAddressMatch = false;

    for (const addr of ad.targetAddresses) {
      // Check if buyer specifically named this property address
      if (
        addr.address.toLowerCase().includes(property.address.toLowerCase()) ||
        (property.address.toLowerCase().includes(addr.address.toLowerCase()) &&
          addr.address.length > 5)
      ) {
        locationMatch = true;
        isDirectAddressMatch = true;
        break;
      }
      if (
        addr.suburb &&
        property.suburb &&
        addr.suburb.toLowerCase() === property.suburb.toLowerCase()
      ) {
        locationMatch = true;
        break;
      }
      if (
        addr.city &&
        property.city &&
        addr.city.toLowerCase() === property.city.toLowerCase()
      ) {
        locationMatch = true;
        break;
      }
    }

    if (!locationMatch) {
      for (const loc of ad.targetLocations) {
        if (
          loc.locationType === "SUBURB" &&
          property.suburb &&
          loc.name.toLowerCase() === property.suburb.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
        if (
          loc.locationType === "CITY" &&
          property.city &&
          loc.name.toLowerCase() === property.city.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
        if (
          loc.locationType === "REGION" &&
          property.region &&
          loc.name.toLowerCase() === property.region.toLowerCase()
        ) {
          locationMatch = true;
          break;
        }
      }
    }

    if (locationMatch) {
      // Direct address matches are 100% - buyer specifically wants this property
      if (isDirectAddressMatch) {
        score = 100;
        matchedOn.push("direct_address");
        matchType = "DIRECT";
        // Create match immediately for direct matches
        const existingMatch = await db.propertyMatch.findUnique({
          where: {
            wantedAdId_propertyId: {
              wantedAdId: ad.id,
              propertyId: property.id,
            },
          },
        });

        if (!existingMatch) {
          await db.propertyMatch.create({
            data: {
              wantedAdId: ad.id,
              propertyId: property.id,
              matchScore: score,
              matchType,
              matchedOn: JSON.stringify(matchedOn),
            },
          });
          createdCount++;
        }
        continue;
      } else {
        score += 40;
        matchedOn.push("location");
      }
    } else {
      continue;
    }

    // Budget match (30 points)
    if (property.estimatedValue) {
      const diff = Math.abs(property.estimatedValue - ad.budget);
      const tolerance = property.estimatedValue * 0.2;
      if (diff <= tolerance) {
        score += 30;
        matchedOn.push("budget");
      } else if (diff <= tolerance * 2) {
        score += 15;
        matchedOn.push("budget_partial");
      }
    }

    // Property type match (10 points)
    if (property.propertyType && adPropertyTypes.includes(property.propertyType)) {
      score += 10;
      matchedOn.push("propertyType");
    }

    // Bedrooms match (10 points)
    if (property.bedrooms) {
      const bedsMatch =
        (!ad.bedroomsMin || property.bedrooms >= ad.bedroomsMin) &&
        (!ad.bedroomsMax || property.bedrooms <= ad.bedroomsMax);
      if (bedsMatch && (ad.bedroomsMin || ad.bedroomsMax)) {
        score += 10;
        matchedOn.push("bedrooms");
      }
    }

    // Features match (10 points)
    if (propertyFeatures.length > 0 && adFeatures.length > 0) {
      const matchingFeatures = propertyFeatures.filter((f) =>
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

    if (score >= 40) {
      // Check if match already exists
      const existingMatch = await db.propertyMatch.findUnique({
        where: {
          wantedAdId_propertyId: {
            wantedAdId: ad.id,
            propertyId: property.id,
          },
        },
      });

      if (!existingMatch) {
        await db.propertyMatch.create({
          data: {
            wantedAdId: ad.id,
            propertyId: property.id,
            matchScore: score,
            matchType,
            matchedOn: JSON.stringify(matchedOn),
          },
        });
        createdCount++;
      }
    }
  }

  // Count direct vs criteria matches
  const directMatches = await db.propertyMatch.count({
    where: { propertyId, matchType: "DIRECT" },
  });
  const criteriaMatches = await db.propertyMatch.count({
    where: { propertyId, matchType: "CRITERIA" },
  });

  // Send notification to property owner about matches found
  if (createdCount > 0) {
    let notificationTitle = "Buyers found for your property";
    let notificationMessage = "";

    if (directMatches > 0 && criteriaMatches > 0) {
      notificationMessage = `${directMatches} buyer${directMatches > 1 ? "s" : ""} specifically want${directMatches === 1 ? "s" : ""} your property, and ${criteriaMatches} more match${criteriaMatches === 1 ? "es" : ""} your criteria.`;
    } else if (directMatches > 0) {
      notificationTitle = "A buyer wants YOUR property!";
      notificationMessage = `${directMatches} buyer${directMatches > 1 ? "s have" : " has"} specifically listed your property address at ${propertyAddress}.`;
    } else {
      notificationMessage = `${criteriaMatches} buyer${criteriaMatches > 1 ? "s are" : " is"} looking for properties matching yours at ${propertyAddress}.`;
    }

    await db.notification.create({
      data: {
        userId: ownerUserId,
        type: "NEW_MATCH",
        title: notificationTitle,
        message: notificationMessage,
        data: {
          propertyId,
          matchCount: createdCount,
          directMatches,
          criteriaMatches,
        },
      },
    });

    // Send email notification about matches
    const owner = await db.ownerProfile.findFirst({
      where: { userId: ownerUserId },
      include: { user: { select: { email: true } } },
    });

    if (owner?.user.email) {
      if (directMatches > 0) {
        // Get first direct match buyer info for email
        const directMatch = await db.propertyMatch.findFirst({
          where: { propertyId, matchType: "DIRECT" },
          include: {
            wantedAd: {
              include: { buyer: { include: { user: { select: { name: true } } } } },
            },
          },
        });

        if (directMatch) {
          sendDirectMatchEmail({
            ownerEmail: owner.user.email,
            buyerName: directMatch.wantedAd.buyer?.user.name || "A buyer",
            propertyAddress,
            budget: formatNZD(directMatch.wantedAd.budget),
          }).catch((err) => console.error("Failed to send direct match email:", err));
        }
      } else if (criteriaMatches > 0) {
        sendCriteriaMatchEmail({
          ownerEmail: owner.user.email,
          propertyAddress,
          matchCount: criteriaMatches,
        }).catch((err) => console.error("Failed to send criteria match email:", err));
      }
    }
  }

  return createdCount;
}
