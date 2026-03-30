---
phase: 04-buyer-pages
plan: 01
subsystem: ui
tags: [tailwind, react, next.js, design-system, token-swap]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: CSS variables and Tailwind semantic tokens (text-primary, text-accent, bg-surface-raised, etc.)
  - phase: 02-shared-components
    provides: badge-info, badge-neutral, badge-warning, badge-error, badge-success CSS classes in globals.css
provides:
  - Restyled create wanted ad page with zero hardcoded color classes
  - Established badge-info/badge-neutral toggle button pattern for buyer pages
  - Established max-w-content container width for buyer page section
affects: [04-02-plan, buyer pages verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Property type / feature toggle buttons use badge-info (active) and badge-neutral (inactive) — no px/py/rounded overrides"
    - "Target type selection cards: border-accent/bg-accent-light/ring-2/ring-accent-light for selected, border-border/hover:bg-surface-raised for unselected"
    - "Location tags: badge-info with gap-1 for inline remove button spacing"
    - "Postcard CTA box: flat bg-surface-raised/border-border/rounded-lg — no gradients"
    - "btn-outline does not exist in globals.css — use btn-secondary for secondary actions"

key-files:
  created: []
  modified:
    - apps/web/src/app/buyer/create/page.tsx

key-decisions:
  - "btn-outline at line 280 replaced with btn-secondary — btn-outline was not defined in globals.css (Pitfall 6 from RESEARCH.md)"
  - "tabular-nums applied to budget input and usage count spans per D-17"
  - "Success state max-w-xl replaced with max-w-content per D-12 (all page containers use max-w-content)"
  - "Divider spans in usage bar changed from text-gray-300 to text-muted"

patterns-established:
  - "Toggle badge pattern: className={active ? 'badge-info' : 'badge-neutral hover:bg-surface-raised'} cursor-pointer transition-colors"
  - "Usage count spans: tabular-nums applied inline on the span element"

requirements-completed: [BUYR-01]

# Metrics
duration: 5min
completed: 2026-03-30
---

# Phase 4 Plan 01: Create Wanted Ad Page Summary

**Create wanted ad page restyled from hardcoded primary-*/gray-*/red-*/green-* Tailwind classes to DESIGN.md semantic tokens — badge-info selection toggles, border-accent selection cards, flat success state, max-w-content containers**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-30T03:14:47Z
- **Completed:** 2026-03-30T03:19:56Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Eliminated all 67 hardcoded color class instances from create/page.tsx
- Target type selection cards now use border-accent/bg-accent-light for selected state, border-border for unselected — consistent with DESIGN.md D-02
- Property type and feature toggle badges use badge-info (active) and badge-neutral (inactive) with rounded-sm per DESIGN.md badge spec
- Success state postcard CTA box uses flat bg-surface-raised with border-border (no gradient) per D-09
- Loading skeleton and all page containers use max-w-content (1120px) per D-12
- All numeric counts (budget, usage limits) use tabular-nums per D-17

## Task Commits

1. **Task 1: Restyle create wanted ad page with DESIGN.md tokens** - `aab1f4a` (feat)

## Files Created/Modified

- `apps/web/src/app/buyer/create/page.tsx` - Full token swap: 67 hardcoded color classes replaced with semantic equivalents; btn-outline replaced with btn-secondary; max-w-content containers; tabular-nums on numerics

## Decisions Made

- `btn-outline` at line 280 replaced with `btn-secondary` — `btn-outline` was never defined in globals.css (RESEARCH.md Pitfall 6 confirmed this)
- `max-w-xl` on success state replaced with `max-w-content` per D-12 — all buyer page containers standardize at 1120px
- Divider pipe spans use `text-muted` instead of `text-gray-300` (no direct gray-300 semantic token; text-muted is closest)

## Deviations from Plan

None - plan executed exactly as written. The btn-outline -> btn-secondary replacement was explicitly called out in the plan (line 87: "Replace btn-outline at line ~280 with btn-secondary").

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Create page complete with zero hardcoded color classes
- Badge-info/badge-neutral toggle pattern established for buyer pages
- Ready to proceed with 04-02 (my-ads and postcards pages)

---
*Phase: 04-buyer-pages*
*Completed: 2026-03-30*
