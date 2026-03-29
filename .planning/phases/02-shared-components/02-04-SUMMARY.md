---
phase: 02-shared-components
plan: 04
subsystem: browse-components
tags: [design-system, tailwind, dark-mode, svg, heat-map]
dependency_graph:
  requires: ["02-01"]
  provides: ["DemandCardGrid-restyled", "NZRegionMap-teal-fill-system"]
  affects: ["apps/web/src/components/browse/DemandCardGrid.tsx", "apps/web/src/components/browse/NZRegionMap.tsx"]
tech_stack:
  added: []
  patterns: ["CSS custom properties in SVG fill attributes", "color-mix() for opacity-scaled heat maps", ".card class with grain texture"]
key_files:
  modified:
    - apps/web/src/components/browse/DemandCardGrid.tsx
    - apps/web/src/components/browse/NZRegionMap.tsx
decisions:
  - "NZRegionMap legend expanded to 4 tiers (No demand / Low / Medium / High) to match the 4-level getRegionFill function"
  - "tooltip uses bg-primary text-text-inverse for natural contrast in both light and dark modes"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-30"
  tasks_completed: 2
  files_modified: 2
---

# Phase 02 Plan 04: DemandCardGrid + NZRegionMap Restyle Summary

**One-liner:** DemandCardGrid restyled with .card grain-texture surfaces and tabular-nums data display; NZRegionMap migrated from hardcoded blue hex fills to teal CSS-variable heat-map system supporting dark mode.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Restyle DemandCardGrid with .card class and tabular-nums | 065c323 | DemandCardGrid.tsx |
| 2 | Migrate NZRegionMap to teal CSS-variable fill system | bd62379 | NZRegionMap.tsx |

## What Was Built

### Task 1 — DemandCardGrid

- Card containers: summary-view rows use `bg-surface border border-border rounded-lg hover:border-accent/40 hover:shadow-sm transition-all duration-100`
- Detailed-view individual cards: use `.card` class (provides grain texture, surface bg, border, rounded-lg, p-6) plus hover state override
- Demand count numbers: `font-display text-xl font-semibold text-accent tabular-nums` on all numeric displays
- Budget ranges: `tabular-nums` applied for aligned display
- Property type icon backgrounds: `bg-accent-light` (was `bg-primary-100`)
- Icon color: `text-accent` (was `text-primary-600`)
- View toggle: `bg-surface-raised` container, `bg-surface` active state (was `bg-gray-100` / `bg-white`)
- Show more button: `text-accent hover:text-accent-hover hover:bg-accent-light/30` (was `text-primary-600 hover:bg-primary-50`)
- All `text-gray-*`, `border-gray-*`, `bg-white`, `bg-primary-*`, `text-primary-*`, `bg-blue-*`, `text-blue-*` removed

### Task 2 — NZRegionMap

- `getRegionColor()` replaced with `getRegionFill()` — returns CSS custom property strings
- Heat-map tiers: `var(--color-surface-raised)` / `color-mix(accent 20%)` / `color-mix(accent 50%)` / `color-mix(accent 80%)` / `var(--color-accent)`
- SVG path strokes: `var(--color-border)` default, `var(--color-accent)` hover and selected
- Tooltip: `bg-primary text-text-inverse` (automatic contrast in dark mode)
- Legend: 4 tiers with `style={{ backgroundColor: '...' }}` using CSS vars — no Tailwind fill classes on SVG
- Legend expanded from 3 tiers (No/Low/High) to 4 tiers (No/Low/Medium/High) to match getRegionFill buckets
- All 6 hardcoded hex values removed: `#f3f4f6`, `#dbeafe`, `#93c5fd`, `#3b82f6`, `#2563eb`, `#1d4ed8`

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Minor Adjustments

**1. Legend tier count expanded (4 vs 3)**
- Found during: Task 2
- Issue: Plan specified 3 legend items (No demand / Low / High) but `getRegionFill()` has 4 distinct tiers
- Fix: Added Medium tier to legend for accuracy
- Files modified: NZRegionMap.tsx
- This is a correctness improvement, not a functional change

## Known Stubs

None. Both components display live data passed via props. No hardcoded placeholders.

## Self-Check: PASSED

Files exist:
- FOUND: apps/web/src/components/browse/DemandCardGrid.tsx
- FOUND: apps/web/src/components/browse/NZRegionMap.tsx

Commits exist:
- 065c323 — feat(02-04): restyle DemandCardGrid with .card class and tabular-nums
- bd62379 — feat(02-04): migrate NZRegionMap to teal CSS-variable fill system

Build: pnpm --filter @offmarket/web build exits 0
