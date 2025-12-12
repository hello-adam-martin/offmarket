import { Suspense } from "react";
import { BrowsePageClient } from "@/components/browse";

export const dynamic = "force-dynamic";

function BrowseLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mt-2"></div>
      </div>
      <div className="card mb-6">
        <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card h-32 bg-gray-100 animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowsePageClient />
    </Suspense>
  );
}
