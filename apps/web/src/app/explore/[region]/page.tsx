import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RegionPageClient } from "@/components/browse/RegionPageClient";

// Map URL slugs to display names
const REGION_SLUGS: Record<string, string> = {
  northland: "Northland",
  auckland: "Auckland",
  waikato: "Waikato",
  "bay-of-plenty": "Bay of Plenty",
  gisborne: "Gisborne",
  "hawkes-bay": "Hawke's Bay",
  taranaki: "Taranaki",
  "manawatu-whanganui": "Manawatu-Whanganui",
  wellington: "Wellington",
  tasman: "Tasman",
  nelson: "Nelson",
  marlborough: "Marlborough",
  "west-coast": "West Coast",
  canterbury: "Canterbury",
  otago: "Otago",
  southland: "Southland",
};

// Generate static params for all regions
export function generateStaticParams() {
  return Object.keys(REGION_SLUGS).map((region) => ({
    region,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const regionName = REGION_SLUGS[region.toLowerCase()];

  if (!regionName) {
    return {
      title: "Region Not Found | OffMarket NZ",
    };
  }

  return {
    title: `Buyer Demand in ${regionName} | OffMarket NZ`,
    description: `Discover what property buyers are looking for in ${regionName}. See buyer demand, property types wanted, and budget ranges.`,
  };
}

function RegionLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mt-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-24 bg-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card h-40 bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const regionName = REGION_SLUGS[region.toLowerCase()];

  if (!regionName) {
    notFound();
  }

  return (
    <Suspense fallback={<RegionLoading />}>
      <RegionPageClient regionSlug={region} regionName={regionName} />
    </Suspense>
  );
}
