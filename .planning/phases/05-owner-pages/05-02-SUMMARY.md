---
phase: 05-owner-pages
plan: "02"
subsystem: owner-pages
tags: [design-overhaul, token-swap, demand-panel, match-display]
dependency_graph:
  requires: [05-01]
  provides: [OWNR-02, OWNR-03]
  affects: [owner-my-properties, owner-property-detail]
tech_stack:
  added: []
  patterns: [badge-neutral, badge-info, btn-primary, border-l-4 border-accent, tabular-nums, text-accent, bg-surface-raised]
key_files:
  created: []
  modified:
    - apps/web/src/app/owner/my-properties/page.tsx
    - apps/web/src/app/owner/properties/[id]/page.tsx
decisions:
  - "[Phase 05-02]: Demand summary panel uses card with border-l-4 border-accent — flat card, no gradient, left stripe signals section prominence"
  - "[Phase 05-02]: Demand total sized at text-xl (24px) not text-3xl (48px) — matches D-02 constraint, avoids oversized hero-style number in sidebar"
  - "[Phase 05-02]: Direct/criteria split as inline text row — removes colored sub-cards (bg-green-50/bg-blue-50), aligns with D-03 clean data display"
  - "[Phase 05-02]: All match scores use single text-accent color — removes green/yellow/orange tier coloring per D-05"
metrics:
  duration: "186s"
  completed_date: "2026-03-30"
  tasks: 2
  files: 2
---

# Phase 5 Plan 2: Restyle Owner Property Listing and Detail Pages Summary

Restyled /owner/my-properties and /owner/properties/[id] to full DESIGN.md compliance — flat demand panel with teal left stripe, single-color match scores, badge-neutral property types, and complete semantic token replacement.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Restyle my-properties listing page | 9c49f2e | apps/web/src/app/owner/my-properties/page.tsx |
| 2 | Restyle property detail page with demand panel and match display | 8fd8eff | apps/web/src/app/owner/properties/[id]/page.tsx |

## What Was Built

### Task 1: My Properties Listing Page

Applied full token swap to `/owner/my-properties/page.tsx`:

- All `max-w-4xl` replaced with `max-w-content` (3 containers: loading, no-session, main)
- Skeleton divs: `bg-gray-200` → `bg-surface-raised`
- All gray-* text tokens replaced: `text-primary`, `text-secondary`, `text-muted`
- Property type badge: inline `bg-gray-100 text-gray-700 rounded-full` → `badge-neutral`
- Demand count: conditional `text-primary-600`/`text-gray-400` → always `text-accent font-bold tabular-nums`
- Numeric data spans (bedrooms, bathrooms, estimatedValue) get `tabular-nums`
- Card hover: `hover:border-primary-300` → `hover:border-accent`
- View Details link: `text-primary-600` → `text-accent hover:text-accent-hover`
- Delete button: `text-red-600 hover:text-red-800` → `text-error hover:text-error-hover`
- Error state: `bg-red-50 border-red-200 text-red-700` → `bg-error-light border-error text-error`

### Task 2: Property Detail Page

Major structural changes plus token swaps to `/owner/properties/[id]/page.tsx`:

**Demand Summary Panel (D-01, D-02, D-03, D-04):**
- Replaced gradient wrapper with `card border-l-4 border-accent`
- Removed people SVG icon from header
- Demand total: `text-3xl text-primary-600 text-center` → `text-xl text-accent tabular-nums` left-aligned
- Removed 2-column colored sub-cards (`bg-green-50`/`bg-blue-50`)
- Added inline stats row: `{N} direct · {N} criteria` in `text-sm text-secondary tabular-nums`
- Budget separator: `border-primary-100` → `border-border`

**Direct Interest Section (D-12, D-13, D-14, D-15):**
- Outer card: `border-2 border-green-200 bg-gradient-to-br from-green-50 to-white` → `card border-l-4 border-accent`
- Removed icon-in-circle header (`w-8 h-8 rounded-full bg-green-100`)
- Section subtext: `text-green-700` → `text-secondary`
- Match items: `bg-white border-green-200 hover:border-green-400` → `bg-surface border-border hover:border-accent`
- Contact button: `bg-green-600 hover:bg-green-700` → `btn-primary btn-sm`
- Buyer name: `text-gray-900` → `text-primary`
- Match time: `text-gray-500` → `text-muted`
- Budget: `text-gray-600` → `text-secondary tabular-nums`

**Feature badges:** `bg-gray-100 text-gray-600 rounded-full` → `badge-info`

**Match Criteria Tags:** `bg-blue-100 text-blue-700` → `badge-info`

**Match Scores (D-05):**
- Removed conditional `text-green-600`/`text-yellow-600`/`text-orange-600` ternary
- All scores: `text-2xl font-bold text-accent tabular-nums`

**Empty state:** Removed `w-12 h-12 rounded-full bg-gray-100` wrapper, icon restyled as `w-6 h-6 text-muted`

**Property images "more" button:** `bg-gray-100 text-gray-500 hover:bg-gray-200` → `bg-surface-raised text-secondary hover:opacity-80`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both pages are fully wired to live API data. No hardcoded placeholders or stub values present.

## Verification

```
grep -rn "gray-|primary-[0-9]|green-|blue-[0-9]|yellow-|orange-|red-|bg-gradient|rounded-full|max-w-4xl|bg-white" \
  apps/web/src/app/owner/my-properties/page.tsx \
  "apps/web/src/app/owner/properties/[id]/page.tsx"
```
Returns zero matches.

TypeScript: `npx tsc --noEmit` passes with zero errors.

## Self-Check: PASSED

- [x] apps/web/src/app/owner/my-properties/page.tsx exists and contains `badge-neutral`, `text-accent tabular-nums`, `text-error`, `hover:border-accent`, `max-w-content`, `bg-surface-raised`, `bg-error-light`
- [x] apps/web/src/app/owner/properties/[id]/page.tsx exists and contains `border-l-4 border-accent` (2x), `badge-info`, `btn-primary`, `text-accent tabular-nums`, inline `direct · criteria`, `bg-surface-raised`, `border-border`, `text-primary`, `text-secondary`, `text-muted`
- [x] Commit 9c49f2e exists (my-properties)
- [x] Commit 8fd8eff exists (property detail)
- [x] Zero old tokens remain in either file
