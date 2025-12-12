"use client";

import Link from "next/link";
import { formatBudgets } from "@offmarket/utils";

interface PropertyDemand {
  address: string;
  suburb?: string;
  city?: string;
  region?: string;
  buyerCount: number;
  budgets: number[];
}

interface PropertyCardGridProps {
  data: PropertyDemand[];
}

export function PropertyCardGrid({ data }: PropertyCardGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {data.map((property, i) => {
        const addressKey = `${property.address}|${property.suburb || ""}|${property.city || ""}`;
        const encodedAddress = Buffer.from(addressKey).toString("base64");

        return (
          <Link
            key={i}
            href={`/property/${encodedAddress}`}
            className="card border-primary-200 bg-gradient-to-br from-white to-primary-50 hover:border-primary-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{property.address}</p>
                <p className="text-sm text-gray-600 truncate">
                  {[property.suburb, property.city].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-primary-600">{property.buyerCount}</p>
                <p className="text-xs text-gray-500">
                  {property.buyerCount === 1 ? "buyer" : "buyers"}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-primary-100">
              <p className="text-sm text-gray-600">
                Budgets:{" "}
                <span className="font-medium text-gray-900">{formatBudgets(property.budgets)}</span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
