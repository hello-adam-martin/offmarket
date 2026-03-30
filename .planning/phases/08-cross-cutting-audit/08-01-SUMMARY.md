---
phase: 08-cross-cutting-audit
plan: "01"
subsystem: browse-components, header, footer, homepage
tags: [design-tokens, dark-mode, max-width, gradients, xcut]
dependency_graph:
  requires: []
  provides:
    - Browse components with semantic CSS variable tokens
    - Header/footer using max-w-content utility
    - Homepage pricing grid without max-w-5xl override
  affects:
    - All browse pages (/explore, /explore/[region])
    - All pages (header/footer are global layout components)
tech_stack:
  added: []
  patterns:
    - card utility class for surface containers (replaces manual bg-white + border-gray-200)
    - max-w-content utility (1120px) for all page containers
    - Semantic CSS variable tokens: text-text-base, text-text-secondary, text-text-muted, bg-surface, bg-surface-raised, border-border, text-accent
key_files:
  created: []
  modified:
    - apps/web/src/components/browse/BrowsePageClient.tsx
    - apps/web/src/components/browse/FilterPanel.tsx
    - apps/web/src/components/browse/RegionFilterPanel.tsx
    - apps/web/src/components/browse/RegionPageClient.tsx
    - apps/web/src/components/browse/MarketSummaryBar.tsx
    - apps/web/src/components/browse/Pagination.tsx
    - apps/web/src/components/browse/PropertyCardGrid.tsx
    - apps/web/src/components/header.tsx
    - apps/web/src/components/footer.tsx
    - apps/web/src/app/page.tsx
decisions:
  - "Stats cards in RegionPageClient use card utility with card p-4 (overrides default p-6 padding) — consistent with other insight panels in the same grid"
  - "Rank badge #2+ uses bg-surface-raised text-text-secondary (not badge-neutral) to match inline span context without full badge padding"
  - "page.tsx pricing grid max-w-5xl removed entirely — outer max-w-content container already constrains width correctly"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-30T09:32:46Z"
  tasks_completed: 2
  files_modified: 10
requirements:
  - XCUT-01
  - XCUT-02
  - XCUT-03
  - XCUT-05
---

# Phase 08 Plan 01: Browse Components & Global Layout XCUT Fixes Summary

**One-liner:** Replaced all undefined primary-N/accent-N shade classes, hardcoded gray tokens, gradients, and max-w-7xl/max-w-[1120px] violations in 10 files with DESIGN.md-compliant semantic CSS variable tokens.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Fix browse components — max-width, dark mode tokens, accent shades, AI slop | 8aa9047 | 7 browse component files |
| 2 | Fix header, footer, homepage max-width — then build verify | 78ce41c | header.tsx, footer.tsx, page.tsx |

## What Was Done

### Task 1: Browse Components (7 files)

**XCUT-01 (max-width):**
- `BrowsePageClient.tsx`: `max-w-7xl` → `max-w-content`
- `FilterPanel.tsx`: `max-w-7xl` → `max-w-content`
- `RegionFilterPanel.tsx`: `max-w-7xl` → `max-w-content`
- `RegionPageClient.tsx`: two instances of `max-w-7xl` → `max-w-content`

**XCUT-02 (dark mode gray tokens) — all 5 browse files:**
- All `text-gray-900`/`text-gray-700` → `text-text-base`
- All `text-gray-600` → `text-text-secondary`
- All `text-gray-500`/`text-gray-400` → `text-text-muted`
- All `border-gray-300`/`border-gray-200` → `border-border`
- All `bg-white` + `border-gray-200` patterns → `card` utility
- All `bg-gray-100`/`bg-gray-50` → `bg-surface-raised`
- `MarketSummaryBar.tsx`: `card bg-gray-50 border-gray-200` → `card` (utility defaults handle bg/border)

**XCUT-03 (undefined color shades):**
- `border-primary-600` (spinner) → `border-accent`
- `text-accent-600` → `text-accent`
- `text-primary-600` → `text-accent` or `text-text-base` (context-dependent)
- `bg-primary-600` (active pagination) → `bg-accent`
- `bg-primary-500` (progress bar) → `bg-accent`
- `hover:text-primary-600` (breadcrumbs) → `hover:text-accent`
- `border-primary-200`, `border-primary-100`, `border-primary-400` → `border-border`, `hover:border-accent`

**XCUT-05 (AI slop):**
- `PropertyCardGrid.tsx`: removed `bg-gradient-to-br from-white to-primary-50`, now uses `card` utility
- `RegionPageClient.tsx` CTA block: removed `bg-gradient-to-r from-primary-50 to-accent-50`, replaced with `bg-surface-raised`
- Rank badge `bg-yellow-100 text-yellow-700` → `bg-secondary-light text-secondary`

### Task 2: Header, Footer, Homepage (3 files)

- `header.tsx`: `max-w-[1120px]` → `max-w-content`
- `footer.tsx`: `max-w-[1120px]` → `max-w-content`
- `page.tsx`: removed `max-w-5xl` from pricing grid inner div (outer `max-w-content` container already constrains)

## Verification Results

All XCUT grep assertions pass (empty results = no violations):

```
XCUT-01: grep max-w-7xl|max-w-6xl|max-w-5xl|max-w-[1120px] → empty
XCUT-02: grep bg-gray-|text-gray-|border-gray-|bg-white in browse → empty
XCUT-03: grep primary-[0-9]|accent-[0-9] → empty
XCUT-05: grep bg-gradient in browse → empty
Build: pnpm build → exit 0, 44 pages generated, zero TypeScript errors
```

## Deviations from Plan

None — plan executed exactly as written. All line numbers from 08-RESEARCH.md matched actual file content.

## Known Stubs

None — all token replacements are complete and functional. No placeholder values.

## Self-Check: PASSED

Files exist:
- apps/web/src/components/browse/BrowsePageClient.tsx — FOUND
- apps/web/src/components/browse/RegionPageClient.tsx — FOUND
- apps/web/src/components/browse/PropertyCardGrid.tsx — FOUND
- apps/web/src/components/header.tsx — FOUND
- apps/web/src/components/footer.tsx — FOUND

Commits exist:
- 8aa9047 — FOUND (feat(08-01): fix browse components)
- 78ce41c — FOUND (feat(08-01): fix header, footer, homepage)
