---
phase: 02-shared-components
plan: 03
subsystem: browse-components
tags: [restyling, semantic-tokens, ai-slop-removal, filter-panel, empty-state]
dependency_graph:
  requires: [02-01]
  provides: [restyled-filter-panel, restyled-region-filter-panel, restyled-empty-state]
  affects: [browse-page, region-browse-page]
tech_stack:
  added: []
  patterns: [semantic-token-replacement, badge-info-for-active-filters, flat-card-surfaces, inline-svg-icons]
key_files:
  created: []
  modified:
    - apps/web/src/components/browse/FilterPanel.tsx
    - apps/web/src/components/browse/RegionFilterPanel.tsx
    - apps/web/src/components/browse/EmptyState.tsx
decisions:
  - Property type pills changed from rounded-full to rounded-sm to match DESIGN.md badge pattern
  - Badge-info used for selected property type filters (active state indicator)
  - EmptyState rank numbers use badge-neutral instead of color-coded circle badges
  - Quick Actions icon containers removed entirely — inline SVG with text-text-muted only
metrics:
  duration: 15m
  completed: "2026-03-30"
  tasks_completed: 2
  files_modified: 3
---

# Phase 02 Plan 03: Browse Filter Components Summary

Semantic token restyling of FilterPanel, RegionFilterPanel, and EmptyState. EmptyState received structural rework to eliminate all AI slop patterns (gradient stat cards, icon-in-colored-circles, emoji in headings, color-coded rank badges).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Restyle FilterPanel and RegionFilterPanel | 96a119c | FilterPanel.tsx, RegionFilterPanel.tsx |
| 2 | Restyle EmptyState — remove AI slop | e2d51e2 | EmptyState.tsx |

## What Was Built

**FilterPanel.tsx:** Semantic token replacement throughout. Compact active-filter bar uses `bg-surface border-border`. Property type pills changed from `rounded-full bg-primary-600` to `badge-info` (active) and `bg-surface-raised text-text-secondary` (inactive). Clear button uses `.btn-ghost`. Dividers changed from `bg-gray-300` to `bg-border`. All `text-gray-*` replaced with semantic equivalents.

**RegionFilterPanel.tsx:** Same token replacement map. City/Town and Suburb dropdowns use `border-border bg-surface` with `focus:ring-accent-light focus:border-accent`. Save Search button changed from `text-primary-600` to `text-accent/text-accent-hover`. Clear button uses `.btn-ghost`. Property type pills match FilterPanel pattern.

**EmptyState.tsx:** Structural rework — 5 AI slop violations eliminated:
1. Gradient stat cards (`from-primary-500`, `from-accent-500`) replaced with flat `bg-surface rounded-lg border border-border p-4` cards
2. Stat numbers use `font-display text-xl font-semibold tabular-nums text-text-base`
3. Stat labels use `.label` class
4. Fire emoji removed from "Hot Regions" heading — plain `text-xl font-display font-semibold text-text-base`
5. Color-coded rank circles (`bg-yellow-100 text-yellow-700`, `bg-orange-100`) replaced with `badge-neutral`
6. Icon-in-colored-circles (`w-8 h-8 bg-primary-100 rounded-lg`, `w-8 h-8 bg-accent-100 rounded-lg`) replaced with inline `h-5 w-5 text-text-muted` SVG icons — no background container
7. Quick Actions container changed from `bg-gray-50 rounded-xl` to `bg-surface-raised rounded-lg`
8. All `rounded-xl` replaced with `rounded-lg`

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria met.

## Known Stubs

None — all components are fully wired to real data.

## Self-Check: PASSED

- `apps/web/src/components/browse/FilterPanel.tsx` — FOUND
- `apps/web/src/components/browse/RegionFilterPanel.tsx` — FOUND
- `apps/web/src/components/browse/EmptyState.tsx` — FOUND
- Commit 96a119c — FOUND
- Commit e2d51e2 — FOUND
- Build: passes (no TypeScript errors)
- FilterPanel: no `bg-white`, no `text-gray-`, no `border-gray-`, no `bg-primary-`
- RegionFilterPanel: no `bg-white`, no `text-gray-`, no `border-gray-`, no `bg-primary-`
- EmptyState: no gradients, no icon-in-circles, no emoji, no `rounded-xl`, no `text-gray-`, `tabular-nums` present
