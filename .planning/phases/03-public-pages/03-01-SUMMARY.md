---
phase: 03-public-pages
plan: 01
subsystem: web/homepage
tags: [homepage, hero, design-system, public-pages]
dependency_graph:
  requires: [phase-01-foundation, phase-02-shared-components]
  provides: [homepage-restyled]
  affects: [apps/web/src/app/page.tsx, apps/web/src/app/globals.css]
tech_stack:
  added: []
  patterns: [async-server-component, data-forward-hero, css-variable-tokens]
key_files:
  created: []
  modified:
    - apps/web/src/app/page.tsx
    - apps/web/src/app/globals.css
decisions:
  - "Homepage hero uses async server component with area-demand API fetch and 5-min revalidation"
  - "Static fallback copy when API unavailable: 'The reverse way to buy property in New Zealand'"
  - "bg-error/10 and bg-success/10 opacity syntax replaced with bg-error-light/bg-success-light — Tailwind v3 @apply cannot use CSS variable opacity modifiers"
metrics:
  duration: 298s
  completed: 2026-03-30
  tasks_completed: 2
  files_modified: 2
---

# Phase 3 Plan 1: Homepage Restyling Summary

**One-liner:** Async data-forward hero with live demand stats replacing gradient/SVG hero, all sections restyled to DESIGN.md semantic tokens with no AI slop remaining.

## What Was Built

Complete restyle of `apps/web/src/app/page.tsx` (692 lines -> 437 lines):

1. **Hero section** — Replaced gradient/SVG/centered hero with async server component that fetches `/api/wanted-ads/area-demand` for live stats (totalBuyers, totalGroups, avgBudget) with 5-minute revalidation. Static fallback copy when API unavailable. Left-aligned, bg-bg, tabular-nums stat values.

2. **All remaining sections** — Stats row, Demand Checker, How It Works, Benefits, Pricing, FAQ, Final CTA — all restyled:
   - All `max-w-7xl` replaced with `max-w-content`
   - All `text-center` on headings removed (left-aligned per D-06)
   - All `gray-*` / `primary-*` hardcoded tokens replaced with semantic tokens
   - All `rounded-2xl` replaced with `rounded-lg`
   - How It Works: icon-in-circle elements removed, replaced with plain numbered steps using `<ol>`
   - Benefits: `.card` class used for all benefit cards, icon circles removed
   - Pricing: Pro tier uses `bg-accent text-white`, free/owner use `.card border-2 border-border`
   - Testimonials section: entirely removed
   - Final CTA: gradient replaced with `bg-primary`, copy changed to "Start your search today."
   - All numeric values: `tabular-nums` applied

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 + 2 | f14a3cf | feat(03-01): rewrite homepage hero with data-forward stats |
| Rule 1 fix | fd7bcbb | fix(03-01): fix badge-success/badge-error CSS variable opacity syntax |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed badge CSS variables with opacity syntax in globals.css**
- **Found during:** Task 1 verification (build failed)
- **Issue:** `bg-success/10` and `bg-error/10` in `.badge-success` / `.badge-error` @apply rules — Tailwind v3 cannot use opacity modifiers on CSS variable color tokens in @apply directives
- **Fix:** Replaced with `bg-success-light` / `bg-error-light` (tokens already defined in tailwind.config.ts as CSS variables from globals.css updates by parallel agents)
- **Files modified:** `apps/web/src/app/globals.css`
- **Commit:** fd7bcbb

### Tasks Combined

Tasks 1 and 2 were both implemented in a single file write since the complete redesign was planned together. Both sets of acceptance criteria were verified independently after the write.

## Verification Results

All plan verification criteria pass:
- `gray-` count: 0
- `primary-[0-9]` count: 0
- `max-w-7xl` count: 0
- `text-center` count: 0
- `gradient` count: 0
- `Dream Home` count: 0
- Build: compiled successfully, 44/44 static pages generated

## Known Stubs

None — all data is either live (heroStats from API) or real static content (pricing, FAQ).

## Self-Check: PASSED
