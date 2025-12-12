import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.inquiryMessage.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.propertyMatch.deleteMany();
  await prisma.targetAddress.deleteMany();
  await prisma.targetLocation.deleteMany();
  await prisma.wantedAd.deleteMany();
  await prisma.property.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.ownerProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.systemSetting.deleteMany();

  console.log("Cleaned existing data");

  // Create email templates
  await prisma.emailTemplate.create({
    data: {
      name: "new_inquiry",
      subject: "New inquiry about your property at {{propertyAddress}}",
      htmlContent: `<h2>Hi there!</h2>
<p>Great news - <strong>{{buyerName}}</strong> has sent you an inquiry about your property at <strong>{{propertyAddress}}</strong>.</p>
<p><strong>Their message:</strong></p>
<blockquote style="padding: 10px 20px; background: #f5f5f5; border-left: 4px solid #3b82f6;">
{{message}}
</blockquote>
<p>Log in to OffMarket NZ to respond and continue the conversation.</p>
<p><a href="https://offmarket.nz/inquiries" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">View Inquiry</a></p>
<p>Best,<br>The OffMarket NZ Team</p>`,
      textContent: `Hi there!

Great news - {{buyerName}} has sent you an inquiry about your property at {{propertyAddress}}.

Their message:
{{message}}

Log in to OffMarket NZ to respond and continue the conversation.

Best,
The OffMarket NZ Team`,
      isActive: true,
    },
  });

  await prisma.emailTemplate.create({
    data: {
      name: "inquiry_response",
      subject: "New message about {{propertyAddress}}",
      htmlContent: `<h2>You have a new message!</h2>
<p><strong>{{senderName}}</strong> has sent you a message about the property at <strong>{{propertyAddress}}</strong>.</p>
<p>Log in to OffMarket NZ to read and respond.</p>
<p><a href="https://offmarket.nz/inquiries" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">View Messages</a></p>
<p>Best,<br>The OffMarket NZ Team</p>`,
      textContent: `You have a new message!

{{senderName}} has sent you a message about the property at {{propertyAddress}}.

Log in to OffMarket NZ to read and respond.

Best,
The OffMarket NZ Team`,
      isActive: true,
    },
  });

  await prisma.emailTemplate.create({
    data: {
      name: "new_match_direct",
      subject: "A buyer wants YOUR property at {{propertyAddress}}!",
      htmlContent: `<h2>Exciting news!</h2>
<p><strong>{{buyerName}}</strong> has specifically named your property at <strong>{{propertyAddress}}</strong> in their wanted ad.</p>
<p><strong>Their budget:</strong> {{budget}}</p>
<p>This is a direct match - they're interested in your exact property, not just the area.</p>
<p>Log in to OffMarket NZ to see more details and reach out to them.</p>
<p><a href="https://offmarket.nz/owner/my-properties" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">View Buyer Interest</a></p>
<p>Best,<br>The OffMarket NZ Team</p>`,
      textContent: `Exciting news!

{{buyerName}} has specifically named your property at {{propertyAddress}} in their wanted ad.

Their budget: {{budget}}

This is a direct match - they're interested in your exact property, not just the area.

Log in to OffMarket NZ to see more details and reach out to them.

Best,
The OffMarket NZ Team`,
      isActive: true,
    },
  });

  await prisma.emailTemplate.create({
    data: {
      name: "new_match_criteria",
      subject: "{{matchCount}} buyers interested in properties like yours",
      htmlContent: `<h2>Good news!</h2>
<p>We found <strong>{{matchCount}} buyers</strong> looking for properties that match your listing at <strong>{{propertyAddress}}</strong>.</p>
<p>These buyers' search criteria match your property's features and location.</p>
<p>Log in to OffMarket NZ to see who's interested and their budgets.</p>
<p><a href="https://offmarket.nz/owner/my-properties" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">View Buyer Demand</a></p>
<p>Best,<br>The OffMarket NZ Team</p>`,
      textContent: `Good news!

We found {{matchCount}} buyers looking for properties that match your listing at {{propertyAddress}}.

These buyers' search criteria match your property's features and location.

Log in to OffMarket NZ to see who's interested and their budgets.

Best,
The OffMarket NZ Team`,
      isActive: true,
    },
  });

  console.log("Created email templates");

  // Create users
  const buyer1 = await prisma.user.create({
    data: {
      email: "sarah@example.com",
      name: "Sarah Johnson",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          bio: "Young professional looking for my first home in Auckland",
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: "mike@example.com",
      name: "Mike Chen",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          bio: "Growing family seeking a larger home with a garden",
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyer3 = await prisma.user.create({
    data: {
      email: "emma@example.com",
      name: "Emma Wilson",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          bio: "Investor looking for properties in Wellington region",
        },
      },
    },
    include: { buyerProfile: true },
  });

  // Additional buyers for overlapping interests
  const buyer4 = await prisma.user.create({
    data: {
      email: "david@example.com",
      name: "David Thompson",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          bio: "First home buyer looking in Grey Lynn",
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyer5 = await prisma.user.create({
    data: {
      email: "rachel@example.com",
      name: "Rachel Kim",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          bio: "Looking for a character home in Ponsonby",
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyer6 = await prisma.user.create({
    data: {
      email: "tom@example.com",
      name: "Tom Richards",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          bio: "Downsizing to Takapuna",
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyer7 = await prisma.user.create({
    data: {
      email: "anna@example.com",
      name: "Anna Patel",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          bio: "Young professional seeking inner city living",
        },
      },
    },
    include: { buyerProfile: true },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: "james@example.com",
      name: "James Smith",
      emailVerified: new Date(),
      ownerProfile: {
        create: {},
      },
    },
    include: { ownerProfile: true },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "lisa@example.com",
      name: "Lisa Brown",
      emailVerified: new Date(),
      ownerProfile: {
        create: {},
      },
    },
    include: { ownerProfile: true },
  });

  console.log("Created users");

  // Create wanted ads
  const wantedAd1 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer1.buyerProfile!.id,
      title: "First home in Ponsonby or Grey Lynn",
      description:
        "Looking for a 2-3 bedroom home in the inner Auckland suburbs. Would love character features but open to modern builds. Close to cafes and public transport a must!",
      budget: 1100000,
      propertyTypes: JSON.stringify(["HOUSE", "TOWNHOUSE"]),
      bedroomsMin: 2,
      bedroomsMax: 3,
      bathroomsMin: 1,
      features: JSON.stringify(["DECK", "OFF_STREET_PARKING"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Ponsonby" },
          { locationType: "SUBURB", name: "Grey Lynn" },
          { locationType: "SUBURB", name: "Westmere" },
        ],
      },
    },
  });

  const wantedAd2 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer2.buyerProfile!.id,
      title: "Family home with garden on North Shore",
      description:
        "We have two kids and a dog, looking for a spacious family home with a good-sized backyard. School zones for Takapuna Grammar or Westlake preferred.",
      budget: 1850000,
      propertyTypes: JSON.stringify(["HOUSE"]),
      bedroomsMin: 4,
      bedroomsMax: 5,
      bathroomsMin: 2,
      features: JSON.stringify([
        "GARDEN",
        "GARAGE",
        "FENCED",
        "PET_FRIENDLY",
      ]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Takapuna" },
          { locationType: "SUBURB", name: "Milford" },
          { locationType: "SUBURB", name: "Devonport" },
          { locationType: "SUBURB", name: "Northcote" },
        ],
      },
    },
  });

  const wantedAd3 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer3.buyerProfile!.id,
      title: "Investment apartment in Wellington CBD",
      description:
        "Looking for a modern apartment in Wellington central for investment purposes. Good rental yield potential important. Prefer newer builds with earthquake strengthening.",
      budget: 650000,
      propertyTypes: JSON.stringify(["APARTMENT", "UNIT"]),
      bedroomsMin: 1,
      bedroomsMax: 2,
      bathroomsMin: 1,
      features: JSON.stringify(["HEAT_PUMP", "NEW_BUILD"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Wellington Central" },
          { locationType: "SUBURB", name: "Te Aro" },
          { locationType: "SUBURB", name: "Thorndon" },
        ],
      },
    },
  });

  const wantedAd4 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer1.buyerProfile!.id,
      title: "Specific interest: 42 Jervois Road",
      description:
        "I've always loved this property walking past it. If the owner is ever interested in selling, I'd love to discuss.",
      budget: 1200000,
      propertyTypes: JSON.stringify(["HOUSE"]),
      bedroomsMin: 2,
      targetType: "SPECIFIC_ADDRESS",
      targetAddresses: {
        create: [
          {
            address: "42 Jervois Road",
            suburb: "Ponsonby",
            city: "Auckland",
            region: "Auckland",
            propertyData: JSON.stringify({
              propertyType: "HOUSE",
              yearBuilt: 1905,
              landArea: 380,
              floorArea: 145,
              bedrooms: 3,
              bathrooms: 2,
              garages: 1,
              capitalValue: 1520000,
              landValue: 1100000,
              improvementsValue: 420000,
              valuationDate: "2021-07-01",
              features: ["DECK", "FIREPLACE", "RENOVATED"],
              streetViewUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
              aerialViewUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            }),
          },
        ],
      },
    },
  });

  const wantedAd5 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer2.buyerProfile!.id,
      title: "Lifestyle property in Kumeu/Huapai",
      description:
        "Dreaming of a lifestyle block for the family. Room for chickens, maybe a horse. Work from home so commute not an issue.",
      budget: 2200000,
      propertyTypes: JSON.stringify(["LIFESTYLE", "HOUSE"]),
      bedroomsMin: 3,
      bathroomsMin: 2,
      landSizeMin: 4000,
      features: JSON.stringify(["GARDEN", "GARAGE", "FENCED"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Kumeu" },
          { locationType: "SUBURB", name: "Huapai" },
          { locationType: "SUBURB", name: "Waimauku" },
        ],
      },
    },
  });

  // Overlapping wanted ads - multiple buyers for same area/criteria
  // Grey Lynn - 2-3 bed house/townhouse (overlaps with buyer1)
  const wantedAd6 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer4.buyerProfile!.id,
      title: "Character home in Grey Lynn",
      description: "Looking for a villa or bungalow with original features. Garden a plus.",
      budget: 1250000,
      propertyTypes: JSON.stringify(["HOUSE", "TOWNHOUSE"]),
      bedroomsMin: 2,
      bedroomsMax: 3,
      bathroomsMin: 1,
      features: JSON.stringify(["GARDEN", "DECK"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Grey Lynn" },
          { locationType: "SUBURB", name: "Ponsonby" },
        ],
      },
    },
  });

  // Ponsonby - 2+ bed house (overlaps with buyer1)
  const wantedAd7 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer5.buyerProfile!.id,
      title: "Villa in Ponsonby",
      description: "After a renovated villa in Ponsonby. Must have character.",
      budget: 1350000,
      propertyTypes: JSON.stringify(["HOUSE", "TOWNHOUSE"]),
      bedroomsMin: 2,
      bedroomsMax: 3,
      bathroomsMin: 1,
      features: JSON.stringify(["DECK", "RENOVATED", "OFF_STREET_PARKING"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Ponsonby" },
          { locationType: "SUBURB", name: "Herne Bay" },
        ],
      },
    },
  });

  // Takapuna - 4+ bed house (overlaps with buyer2)
  const wantedAd8 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer6.buyerProfile!.id,
      title: "Downsizer in Takapuna",
      description: "Looking to downsize but still want space for grandkids. Beach access important.",
      budget: 1600000,
      propertyTypes: JSON.stringify(["HOUSE"]),
      bedroomsMin: 4,
      bedroomsMax: 5,
      bathroomsMin: 2,
      features: JSON.stringify(["GARAGE", "GARDEN", "SEA_VIEW"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Takapuna" },
          { locationType: "SUBURB", name: "Milford" },
        ],
      },
    },
  });

  // Wellington CBD apartment (overlaps with buyer3)
  const wantedAd9 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer7.buyerProfile!.id,
      title: "Modern apartment in Te Aro",
      description: "Young professional looking for low-maintenance living close to work.",
      budget: 580000,
      propertyTypes: JSON.stringify(["APARTMENT", "UNIT"]),
      bedroomsMin: 1,
      bedroomsMax: 2,
      bathroomsMin: 1,
      features: JSON.stringify(["HEAT_PUMP", "NEW_BUILD"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Te Aro" },
          { locationType: "SUBURB", name: "Wellington Central" },
        ],
      },
    },
  });

  // Another Ponsonby buyer for same criteria
  const wantedAd10 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer7.buyerProfile!.id,
      title: "Auckland pied-à-terre",
      description: "Also looking for a small place in Auckland for work trips.",
      budget: 950000,
      propertyTypes: JSON.stringify(["HOUSE", "TOWNHOUSE"]),
      bedroomsMin: 2,
      bedroomsMax: 3,
      bathroomsMin: 1,
      features: JSON.stringify(["DECK", "OFF_STREET_PARKING"]),
      targetType: "AREA",
      targetLocations: {
        create: [
          { locationType: "SUBURB", name: "Ponsonby" },
          { locationType: "SUBURB", name: "Grey Lynn" },
        ],
      },
    },
  });

  // More specific address wanted ads
  const wantedAd11 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer4.buyerProfile!.id,
      title: "Interest in 15 Victoria Road",
      description:
        "This beautiful villa caught my eye. Would love to make an offer if the owners are considering selling.",
      budget: 1450000,
      propertyTypes: JSON.stringify(["HOUSE"]),
      bedroomsMin: 3,
      targetType: "SPECIFIC_ADDRESS",
      targetAddresses: {
        create: [
          {
            address: "15 Victoria Road",
            suburb: "Devonport",
            city: "Auckland",
            region: "Auckland",
            propertyData: JSON.stringify({
              propertyType: "HOUSE",
              yearBuilt: 1895,
              landArea: 556,
              floorArea: 185,
              bedrooms: 4,
              bathrooms: 2,
              garages: 2,
              capitalValue: 1680000,
              landValue: 1200000,
              improvementsValue: 480000,
              valuationDate: "2021-07-01",
              features: ["GARDEN", "SEA_VIEW", "RENOVATED", "FIREPLACE", "DECK"],
              streetViewUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
              aerialViewUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            }),
          },
        ],
      },
    },
  });

  const wantedAd12 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer5.buyerProfile!.id,
      title: "Dream home on Herne Bay waterfront",
      description:
        "This property represents everything I've been looking for. Exceptional location and architecture.",
      budget: 3200000,
      propertyTypes: JSON.stringify(["HOUSE"]),
      bedroomsMin: 4,
      targetType: "SPECIFIC_ADDRESS",
      targetAddresses: {
        create: [
          {
            address: "8 Sentinel Road",
            suburb: "Herne Bay",
            city: "Auckland",
            region: "Auckland",
            propertyData: JSON.stringify({
              propertyType: "HOUSE",
              yearBuilt: 1935,
              landArea: 720,
              floorArea: 280,
              bedrooms: 5,
              bathrooms: 3,
              garages: 2,
              capitalValue: 4100000,
              landValue: 3200000,
              improvementsValue: 900000,
              valuationDate: "2021-07-01",
              features: ["SEA_VIEW", "POOL", "GARDEN", "DECK", "RENOVATED", "HEAT_PUMP"],
              streetViewUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
              aerialViewUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            }),
          },
        ],
      },
    },
  });

  const wantedAd13 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer6.buyerProfile!.id,
      title: "Interest in Takapuna Beach apartment",
      description:
        "Perfect location for our retirement. Would love to discuss if available.",
      budget: 1150000,
      propertyTypes: JSON.stringify(["APARTMENT"]),
      bedroomsMin: 2,
      targetType: "SPECIFIC_ADDRESS",
      targetAddresses: {
        create: [
          {
            address: "Unit 12, 45 The Strand",
            suburb: "Takapuna",
            city: "Auckland",
            region: "Auckland",
            propertyData: JSON.stringify({
              propertyType: "APARTMENT",
              yearBuilt: 2015,
              floorArea: 95,
              bedrooms: 2,
              bathrooms: 2,
              garages: 1,
              capitalValue: 1250000,
              landValue: null,
              improvementsValue: 1250000,
              valuationDate: "2021-07-01",
              features: ["SEA_VIEW", "HEAT_PUMP", "NEW_BUILD", "BALCONY"],
              streetViewUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
              aerialViewUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
            }),
          },
        ],
      },
    },
  });

  const wantedAd14 = await prisma.wantedAd.create({
    data: {
      buyerId: buyer3.buyerProfile!.id,
      title: "Wellington character home",
      description:
        "I've admired this property for years. The Art Deco features are stunning.",
      budget: 1800000,
      propertyTypes: JSON.stringify(["HOUSE"]),
      bedroomsMin: 3,
      targetType: "SPECIFIC_ADDRESS",
      targetAddresses: {
        create: [
          {
            address: "22 Hawkestone Street",
            suburb: "Thorndon",
            city: "Wellington",
            region: "Wellington",
            propertyData: JSON.stringify({
              propertyType: "HOUSE",
              yearBuilt: 1932,
              landArea: 420,
              floorArea: 165,
              bedrooms: 4,
              bathrooms: 2,
              garages: 1,
              capitalValue: 1950000,
              landValue: 1100000,
              improvementsValue: 850000,
              valuationDate: "2021-09-01",
              features: ["GARDEN", "FIREPLACE", "RENOVATED", "DECK", "CITY_VIEW"],
              streetViewUrl: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
              aerialViewUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
            }),
          },
        ],
      },
    },
  });

  console.log("Created wanted ads");

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      ownerId: owner1.ownerProfile!.id,
      address: "28 Surrey Crescent",
      suburb: "Grey Lynn",
      city: "Auckland",
      region: "Auckland",
      postcode: "1021",
      propertyType: "HOUSE",
      bedrooms: 3,
      bathrooms: 1,
      landSize: 450,
      floorArea: 120,
      yearBuilt: 1920,
      features: JSON.stringify(["DECK", "GARDEN", "RENOVATED"]),
      estimatedValue: 1350000,
      rvValue: 1280000,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      ownerId: owner1.ownerProfile!.id,
      address: "15 Taharoto Road",
      suburb: "Takapuna",
      city: "Auckland",
      region: "Auckland",
      postcode: "0622",
      propertyType: "HOUSE",
      bedrooms: 4,
      bathrooms: 2,
      landSize: 650,
      floorArea: 180,
      yearBuilt: 1985,
      features: JSON.stringify([
        "GARAGE",
        "GARDEN",
        "FENCED",
        "OFF_STREET_PARKING",
      ]),
      estimatedValue: 1850000,
      rvValue: 1750000,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      ownerId: owner2.ownerProfile!.id,
      address: "Unit 5, 120 Cuba Street",
      suburb: "Te Aro",
      city: "Wellington",
      region: "Wellington",
      postcode: "6011",
      propertyType: "APARTMENT",
      bedrooms: 2,
      bathrooms: 1,
      floorArea: 65,
      yearBuilt: 2018,
      features: JSON.stringify(["HEAT_PUMP", "NEW_BUILD"]),
      estimatedValue: 620000,
      rvValue: 580000,
    },
  });

  const property4 = await prisma.property.create({
    data: {
      ownerId: owner2.ownerProfile!.id,
      address: "42 Jervois Road",
      suburb: "Ponsonby",
      city: "Auckland",
      region: "Auckland",
      postcode: "1011",
      propertyType: "HOUSE",
      bedrooms: 3,
      bathrooms: 2,
      landSize: 380,
      floorArea: 145,
      yearBuilt: 1905,
      features: JSON.stringify(["DECK", "FIREPLACE", "RENOVATED"]),
      estimatedValue: 1600000,
      rvValue: 1520000,
    },
  });

  console.log("Created properties");

  // Create matches
  const match1 = await prisma.propertyMatch.create({
    data: {
      wantedAdId: wantedAd1.id,
      propertyId: property1.id,
      matchScore: 85,
      matchedOn: JSON.stringify(["location", "budget", "bedrooms", "propertyType"]),
    },
  });

  const match2 = await prisma.propertyMatch.create({
    data: {
      wantedAdId: wantedAd2.id,
      propertyId: property2.id,
      matchScore: 78,
      matchedOn: JSON.stringify(["location", "bedrooms", "features"]),
    },
  });

  const match3 = await prisma.propertyMatch.create({
    data: {
      wantedAdId: wantedAd3.id,
      propertyId: property3.id,
      matchScore: 92,
      matchedOn: JSON.stringify([
        "location",
        "budget",
        "propertyType",
        "bedrooms",
        "features",
      ]),
    },
  });

  const match4 = await prisma.propertyMatch.create({
    data: {
      wantedAdId: wantedAd4.id,
      propertyId: property4.id,
      matchScore: 95,
      matchedOn: JSON.stringify(["location", "propertyType", "bedrooms"]),
    },
  });

  console.log("Created matches");

  // Create an inquiry
  const inquiry1 = await prisma.inquiry.create({
    data: {
      propertyId: property4.id,
      buyerId: buyer1.buyerProfile!.id,
      initiatedBy: "BUYER",
      message:
        "Hi, I've been admiring your property at 42 Jervois Road for years. If you ever consider selling, I would be very interested in discussing. I'm pre-approved and ready to move quickly.",
      status: "PENDING",
      messages: {
        create: [
          {
            senderId: buyer1.id,
            message:
              "Hi, I've been admiring your property at 42 Jervois Road for years. If you ever consider selling, I would be very interested in discussing. I'm pre-approved and ready to move quickly.",
          },
        ],
      },
    },
  });

  // Create notification for owner
  await prisma.notification.create({
    data: {
      userId: owner2.id,
      type: "NEW_INQUIRY",
      title: "New inquiry received",
      message: "A buyer has sent an inquiry about your property at 42 Jervois Road",
      data: { inquiryId: inquiry1.id, propertyId: property4.id },
    },
  });

  console.log("Created inquiry and notification");

  // Summary
  console.log("\n--- Seed Complete ---");
  console.log(`Users: 9 (7 buyers, 2 owners)`);
  console.log(`Wanted Ads: 14 (10 area-based, 4 specific property, 1 with existing property match)`);
  console.log(`Properties: 4`);
  console.log(`Matches: 4`);
  console.log(`Inquiries: 1`);
  console.log(`Email Templates: 4`);
  console.log("\nTest accounts:");
  console.log("  Buyers: sarah@example.com, mike@example.com, emma@example.com, david@example.com, rachel@example.com, tom@example.com, anna@example.com");
  console.log("  Owners: james@example.com, lisa@example.com");
  console.log("\nSpecific property interests with property data:");
  console.log("  - 42 Jervois Road, Ponsonby (Sarah)");
  console.log("  - 15 Victoria Road, Devonport (David)");
  console.log("  - 8 Sentinel Road, Herne Bay (Rachel)");
  console.log("  - Unit 12, 45 The Strand, Takapuna (Tom)");
  console.log("  - 22 Hawkestone Street, Thorndon (Emma)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
