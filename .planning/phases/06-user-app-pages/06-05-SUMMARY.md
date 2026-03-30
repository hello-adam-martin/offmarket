---
phase: 06-user-app-pages
plan: 05
subsystem: frontend/pages
tags: [design-overhaul, upgrade-page, claim-page, ai-slop-removal, semantic-tokens]
dependency_graph:
  requires: []
  provides: [upgrade-page-restyled, claim-page-restyled]
  affects: [apps/web/src/app/upgrade/page.tsx, apps/web/src/app/claim/[code]/page.tsx]
tech_stack:
  added: []
  patterns: [border-l-4-state-cards, billing-toggle-surface-raised, badge-info-recommended-tag]
key_files:
  created: []
  modified:
    - apps/web/src/app/upgrade/page.tsx
    - apps/web/src/app/claim/[code]/page.tsx
decisions:
  - "Upgrade page header left-aligned (no text-center) per D-01"
  - "Billing toggle outer container bg-surface-raised rounded-md p-1 per D-02"
  - "Pro card uses border-2 border-accent (not ring) for distinction per D-04"
  - "Claim page uses site Header + Footer replacing standalone mini header per D-16"
  - "Success/error states use border-l-4 card pattern (not icon-in-circle) per D-17"
  - "Claim code wrapped in bg-surface-raised rounded-md container with font-mono tabular-nums per D-19"
metrics:
  duration: "~8 minutes"
  completed: "2026-03-30"
  tasks_completed: 2
  files_modified: 2
---

# Phase 6 Plan 05: Upgrade and Claim Flow Restyle Summary

Restyled upgrade/pricing page and claim flow page — the two highest AI-slop-density files in Phase 6. The upgrade page now has left-aligned header, billing toggle with surface-raised container, Pro card with border-2 border-accent and badge-info Recommended tag, and semantic alert banners. The claim page now uses the standard site Header/Footer, bg-background layout, .card containers with border-l-4 success/error state cards, font-mono claim code, and zero gradient backgrounds.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Restyle upgrade/pricing page | faa7021 | apps/web/src/app/upgrade/page.tsx |
| 2 | Restyle claim flow page | d9d00c3 | apps/web/src/app/claim/[code]/page.tsx |

## Key Changes

### Upgrade Page (apps/web/src/app/upgrade/page.tsx)

**Layout:**
- `max-w-content` container (was `max-w-4xl`)
- Page header left-aligned (removed `text-center` from heading div)
- Two-column grid `grid-cols-1 md:grid-cols-2 gap-6`

**Billing toggle:**
- Container: `bg-surface-raised rounded-md p-1 inline-flex`
- Active tab: `bg-surface rounded-sm text-accent font-medium shadow-sm`
- Inactive tab: `text-secondary`
- Savings badge: `badge-success`

**Card design:**
- Free card: standard `.card` (no border override)
- Pro card: `.card border-2 border-accent` with `badge-info` "Recommended" tag

**Feature checklist:**
- Available: `text-accent` checkmark icon + `text-primary` text
- Unavailable: `text-muted` X icon + `text-muted` text

**Price display:** `tabular-nums font-bold` on price numbers

**Alert banners:**
- Success: `bg-success-light border border-success text-success`
- Canceled: `bg-secondary-light border border-warning text-warning`
- Error: `bg-error-light border border-error text-error`

### Claim Page (apps/web/src/app/claim/[code]/page.tsx)

**Layout overhaul:**
- Imported `Header` from `@/components/header` and `Footer` from `@/components/footer`
- Removed standalone `<header>` element
- `bg-background` page background
- `max-w-content mx-auto px-4` content container

**State cards:**
- All states use standard `.card` class (removed `rounded-2xl shadow-xl`)
- Success state: `.card border-l-4 border-success` + inline `text-success` icon
- Error state: `.card border-l-4 border-error` + inline `text-error` icon
- Loading: `bg-surface-raised animate-pulse` skeleton

**Icon-in-circle removal:**
- Removed all `w-16/20 h-16/20 rounded-full bg-*-100` icon container patterns
- Icons now inline `w-5 h-5 text-muted shrink-0`

**Claim code:**
- `font-mono tabular-nums` text
- Wrapped in `bg-surface-raised rounded-md px-4 py-3 text-center`

**Form fields:** `.input` + `.label` classes throughout

**Warning inline message:** `bg-secondary-light text-warning` (was `bg-amber-50 text-amber-600`)

## Token Swaps Applied

| Before | After |
|--------|-------|
| `gray-900` | `text-primary` |
| `gray-600`, `gray-500` | `text-secondary` |
| `gray-400`, `gray-300` | `text-muted` |
| `gray-50`, `gray-100` | `bg-surface-raised` |
| `primary-500`, `primary-600` | `accent` |
| `primary-100` | `bg-accent-light` |
| `green-*` | `success` / `success-light` |
| `red-*` | `error` / `error-light` |
| `amber-*`, `yellow-*` | `warning` / `bg-secondary-light` |
| `bg-gray-200` (skeletons) | `bg-surface-raised` |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all state cards render from API data.

## Self-Check: PASSED

- [x] `apps/web/src/app/upgrade/page.tsx` exists and contains `border-2 border-accent`
- [x] `apps/web/src/app/claim/[code]/page.tsx` exists and contains `font-mono tabular-nums`
- [x] Commit faa7021 exists
- [x] Commit d9d00c3 exists
- [x] Zero hardcoded color violations in both files
