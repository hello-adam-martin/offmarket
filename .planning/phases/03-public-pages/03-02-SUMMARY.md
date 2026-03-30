---
phase: 03-public-pages
plan: 02
subsystem: ui
tags: [tailwind, semantic-tokens, auth, faq, design-system]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: CSS variables and Tailwind semantic token config
  - phase: 02-shared-components
    provides: .card, .input, .label, .btn-primary, badge-* classes in globals.css
provides:
  - Auth/signin page fully restyled with semantic tokens and DESIGN.md error state
  - Help/FAQ page restyled with DESIGN.md tabs (rounded-sm), badge classes, semantic accordion
affects: [03-public-pages, future-pages-referencing-error-state-pattern]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Error state: bg-error-light border-error text-error (CSS variable opacity modifiers not supported in @apply)"
    - "FAQ category badges: badge-info/badge-success/badge-neutral replacing inline color classes"
    - "Tab pills: rounded-sm bg-accent active, bg-surface-raised inactive with border-border"
    - "D-14 Google button exception: border-gray-300 text-gray-700 preserved intentionally"

key-files:
  created: []
  modified:
    - apps/web/src/app/auth/signin/page.tsx
    - apps/web/src/app/help/page.tsx
    - apps/web/src/app/globals.css
    - apps/web/tailwind.config.ts

key-decisions:
  - "Error state uses bg-error-light/border-error instead of bg-error/10/border-error/30 — CSS variable opacity modifiers fail in Tailwind @apply; added error-light CSS variable instead"
  - "success-light and error-light CSS variables added to globals.css and tailwind.config.ts to support badge-success and badge-error without opacity modifier syntax"
  - "Google button gray tokens (border-gray-300, text-gray-700) preserved per D-14 brand trust signal"

patterns-established:
  - "Pattern: For semantic color backgrounds with opacity, define a dedicated *-light CSS variable rather than using Tailwind opacity modifier syntax (bg-color/10)"

requirements-completed: [PUBL-04, PUBL-07]

# Metrics
duration: 18min
completed: 2026-03-30
---

# Phase 03 Plan 02: Auth and Help Pages Summary

**Auth and help/FAQ pages restyled with semantic design tokens — tabs use rounded-sm DESIGN.md style, accordion uses badge-info/success/neutral, error state uses bg-error-light pattern.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-30T15:05:00Z
- **Completed:** 2026-03-30T15:23:00Z
- **Tasks:** 2 completed
- **Files modified:** 4

## Accomplishments
- Auth/signin page: all gray-*/primary-* tokens replaced with semantic equivalents; Google button preserved per D-14; error state uses DESIGN.md error colors; heading uses font-display; skeleton fallback uses bg-surface-raised
- Help/FAQ page: max-w-content container, left-aligned heading (no text-center), tabs changed from rounded-full justify-center to rounded-sm justify-start, badge-info/badge-success/badge-neutral for FAQ categories, contact box uses bg-surface-raised rounded-lg
- Fixed pre-existing build-blocking issue: bg-success/10 CSS variable opacity modifier syntax in badge-success — added success-light and error-light CSS variables

## Task Commits

Each task was committed atomically:

1. **Task 1: Restyle auth/signin page** - `9617052` (feat)
2. **Task 2: Restyle help/FAQ page** - `14210d1` (feat)

## Files Created/Modified
- `apps/web/src/app/auth/signin/page.tsx` - Restyled auth page with semantic tokens
- `apps/web/src/app/help/page.tsx` - Restyled help/FAQ page with DESIGN.md tabs and badges
- `apps/web/src/app/globals.css` - Added success-light and error-light CSS variables; updated badge-success/badge-error to use them
- `apps/web/tailwind.config.ts` - Added success-light and error-light to Tailwind color config

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed CSS variable opacity modifier syntax in badge definitions**
- **Found during:** Task 1 (build verification)
- **Issue:** `bg-success/10` and `bg-error/10` in globals.css badge-success/badge-error @apply rules fail at build time — Tailwind cannot compute opacity variants from CSS variable color references
- **Fix:** Added `--color-success-light` (#d1fae5 light, #064e3b dark) and `--color-error-light` (#fee2e2 light, #7f1d1d dark) CSS variables; updated badge definitions to use `bg-success-light` and `bg-error-light`; added both to tailwind.config.ts
- **Files modified:** `apps/web/src/app/globals.css`, `apps/web/tailwind.config.ts`
- **Commit:** `9617052`

**2. [Rule 1 - Bug] Auth error state uses bg-error-light instead of bg-error/10**
- **Found during:** Task 1
- **Issue:** Plan specified `bg-error/10 border-error/30` but these opacity modifiers don't work with CSS variable colors in Tailwind utility classes
- **Fix:** Used `bg-error-light border-error` instead, which is semantically equivalent (light red background, red border)
- **Files modified:** `apps/web/src/app/auth/signin/page.tsx`
- **Commit:** `9617052`

## Known Stubs

None. Both pages render with real content and no placeholder data.

## Self-Check: PASSED
