"use client";

import { useState, useCallback } from "react";
import { NZ_REGIONS, NZ_MAP_VIEWBOX } from "./nz-regions";

interface LocationCount {
  name: string;
  count: number;
}

interface NZRegionMapProps {
  regionCounts: LocationCount[];
  onSelectRegion: (region: string) => void;
  selectedRegion?: string | null;
}

// Get fill color based on buyer count (heat map style)
function getRegionColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "#f3f4f6"; // gray-100
  const intensity = count / maxCount;
  if (intensity < 0.2) return "#dbeafe"; // blue-100
  if (intensity < 0.4) return "#93c5fd"; // blue-300
  if (intensity < 0.6) return "#3b82f6"; // blue-500
  if (intensity < 0.8) return "#2563eb"; // blue-600
  return "#1d4ed8"; // blue-700
}

export function NZRegionMap({
  regionCounts,
  onSelectRegion,
  selectedRegion,
}: NZRegionMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Get count for a region name
  const getCount = useCallback(
    (name: string): number => {
      const found = regionCounts.find(
        (r) => r.name.toLowerCase() === name.toLowerCase()
      );
      return found?.count || 0;
    },
    [regionCounts]
  );

  // Calculate max count for color scaling
  const maxCount = Math.max(...regionCounts.map((r) => r.count), 1);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGElement>, regionName: string) => {
      const svgRect = (
        e.currentTarget.closest("svg") as SVGSVGElement
      )?.getBoundingClientRect();
      if (svgRect) {
        // Use mouse position relative to SVG container
        setTooltipPos({
          x: e.clientX - svgRect.left,
          y: e.clientY - svgRect.top - 10,
        });
      }
      setHoveredRegion(regionName);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredRegion(null);
  }, []);

  const handleClick = useCallback(
    (regionName: string) => {
      onSelectRegion(regionName);
    },
    [onSelectRegion]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, regionName: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectRegion(regionName);
      }
    },
    [onSelectRegion]
  );

  const hoveredData = hoveredRegion
    ? { name: hoveredRegion, count: getCount(hoveredRegion) }
    : null;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Tooltip */}
      {hoveredData && (
        <div
          className="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
          }}
        >
          <div className="font-medium">{hoveredData.name}</div>
          <div className="text-gray-300">
            {hoveredData.count} {hoveredData.count === 1 ? "buyer" : "buyers"}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Click to explore</div>
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}

      {/* SVG Map */}
      <svg
        viewBox={NZ_MAP_VIEWBOX}
        className="w-full h-auto"
        role="img"
        aria-label="Interactive map of New Zealand regions"
      >
        {/* Background */}
        <rect width="1000" height="1330" fill="transparent" />

        {/* Region paths */}
        {NZ_REGIONS.map((region) => {
          const count = getCount(region.name);
          const isHovered = hoveredRegion === region.name;
          const isSelected = selectedRegion === region.name;
          const fillColor = getRegionColor(count, maxCount);

          return (
            <path
              key={region.id}
              d={region.path}
              fill={fillColor}
              stroke={isSelected ? "#1e40af" : isHovered ? "#3b82f6" : "#94a3b8"}
              strokeWidth={isSelected ? 4 : isHovered ? 3 : 1.5}
              className="cursor-pointer transition-all duration-150"
              style={{
                filter: isHovered ? "brightness(1.1)" : undefined,
              }}
              role="button"
              tabIndex={0}
              aria-label={`${region.name}: ${count} ${count === 1 ? "buyer" : "buyers"}. Click to explore.`}
              onMouseMove={(e) => handleMouseMove(e, region.name)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(region.name)}
              onKeyDown={(e) => handleKeyDown(e, region.name)}
            />
          );
        })}

      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
          <span>No demand</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-300" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-600" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
