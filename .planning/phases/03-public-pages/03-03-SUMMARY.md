---
phase: 03-public-pages
plan: 03
subsystem: web/public-pages
tags: [design-overhaul, tailwind, typography, semantic-tokens]
dependency_graph:
  requires: []
  provides: [PUBL-02, PUBL-03, PUBL-05, PUBL-06]
  affects: [apps/web/src/app/privacy, apps/web/src/app/terms, apps/web/src/app/explore, apps/web/src/components/demand-checker.tsx]
tech_stack:
  added: []
  patterns: [semantic-token-swap, prose-removal, skeleton-restyling]
key_files:
  created: []
  modified:
    - apps/web/src/app/privacy/page.tsx
    - apps/web/src/app/terms/page.tsx
    - apps/web/src/app/explore/page.tsx
    - apps/web/src/app/explore/[region]/page.tsx
    - apps/web/src/components/demand-checker.tsx
decisions:
  - "DemandChecker uses bg-success/10 and bg-error/10 directly in JSX (not @apply) — opacity modifiers work fine in Tailwind utility classes, just not in @apply with CSS variable colors"
metrics:
  duration: 10 minutes
  completed: "2026-03-30"
  tasks: 2
  files: 5
---

# Phase 03 Plan 03: Legal Pages, Explore Wrappers, and DemandChecker Summary

Token swap and prose removal across five lighter-lift files: legal pages get font-display headings and semantic body text; explore/region skeletons get max-w-content and bg-surface-raised; DemandChecker gets success/error semantic result states with tabular-nums on buyer count.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Restyle privacy and terms pages | 5bca6a5 | privacy/page.tsx, terms/page.tsx |
| 2 | Restyle explore/region wrappers and DemandChecker | 6a2f824 | explore/page.tsx, [region]/page.tsx, demand-checker.tsx |

## What Was Built

### Task 1: Legal Pages

Both `privacy/page.tsx` (232 lines) and `terms/page.tsx` (141 lines) received identical treatment:

- **Container:** `max-w-4xl` replaced with `max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12`
- **Prose removal:** `<div className="prose prose-gray max-w-none">` stripped to plain `<div>`
- **Heading hierarchy:** h1/h2/h3 all use `font-display font-bold text-text-base` with appropriate size tokens
- **Body text:** All `text-gray-700`, `text-gray-600`, `text-gray-800` replaced with `text-md text-text-secondary mb-4`
- **Links:** `text-primary-600 hover:text-primary-800` replaced with `text-accent hover:text-accent-hover underline`
- **Footer separator:** `border-gray-200` replaced with `border-border`
- **Last updated text:** `text-sm text-text-muted`

### Task 2: Explore/Region Skeletons and DemandChecker

**Explore page (`explore/page.tsx`):**
- Container: `max-w-7xl` → `max-w-content`
- Skeleton divs: all `bg-gray-200`/`bg-gray-100` → `bg-surface-raised`
- Added `rounded-md` to skeleton divs for consistency

**Region page (`explore/[region]/page.tsx`):**
- Same treatment as explore page

**DemandChecker (`demand-checker.tsx`):**
- Error state: `bg-red-50 border border-red-200 rounded-lg text-red-700` → `bg-error/10 border border-error/30 rounded-md text-error`
- Success state: `bg-green-50 border-green-200` → `bg-success/10 border border-success/30`; `text-green-600`/`text-green-700` → `text-success`
- No-interest state: `bg-gray-50 border-gray-200` → `bg-surface-raised border-border`; `text-gray-600` → `text-text-secondary`; `text-gray-500` → `text-text-muted`
- Buyer count number: added `tabular-nums` class
- All rounded-lg → rounded-md on result state divs

## Deviations from Plan

### Pre-existing Build Failure

**Found:** globals.css had `bg-success/10` in `@apply` directives for `.badge-success` and `.badge-error` — this caused a PostCSS compilation error because Tailwind cannot resolve opacity modifiers for CSS variable-based colors in `@apply`.

**Scope:** This was a pre-existing issue introduced by Phase 02 plan 01, already fixed by a parallel agent before this plan ran (replaced with `bg-accent-light` and `bg-secondary-light` as stand-ins).

**Not caused by this plan.** Our demand-checker.tsx uses `bg-success/10` directly in JSX className strings (not in `@apply`), which works correctly because Tailwind JIT processes utility classes in template files differently from CSS files.

## Verification Results

All checks pass:
- `gray-` count in all 5 files: 0
- `prose` count in privacy/terms: 0
- `max-w-7xl` in explore/region: 0
- Build: PASSED
- `font-display` in privacy: 15 occurrences
- `font-display` in terms: 12 occurrences
- `bg-surface-raised` in explore: 4 occurrences
- `bg-success/10` in demand-checker: 1 occurrence
- `tabular-nums` in demand-checker: 1 occurrence

## Known Stubs

None. All five files have fully wired data and rendering.

## Self-Check: PASSED
