---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [tailwind, css-variables, next/font, dark-mode, ThemeProvider, grain-texture]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Tailwind config with CSS variable tokens, fonts.ts, ThemeProvider.tsx"
provides:
  - globals.css with :root and .dark CSS variable blocks (all 18 DESIGN.md color tokens)
  - Grain texture pseudo-element on .card via SVG feTurbulence
  - tabular-nums on table elements
  - Inter font removed from layout.tsx
  - Three font CSS variables applied to html element
  - suppressHydrationWarning on html element
  - ThemeProvider wrapping app content via providers.tsx
affects:
  - All subsequent phases (component token consumption, dark mode testing)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS variables inside @layer base :root block (Tailwind-safe)
    - Grain texture via CSS ::before pseudo-element with SVG feTurbulence (no image files needed)
    - Font variables on html element, body uses font-sans utility class

key-files:
  created: []
  modified:
    - apps/web/src/app/globals.css
    - apps/web/src/app/layout.tsx
    - apps/web/src/components/providers.tsx
    - apps/web/src/app/fonts.ts

key-decisions:
  - "CSS variables placed OUTSIDE @layer base (at file root) — Tailwind 3.4 purges custom selectors inside @layer, which stripped .dark block entirely"
  - "DM Sans weight changed to 'variable' to allow axes: ['opsz'] — next/font requires variable weight when axes are specified"

patterns-established:
  - "Pattern: Card grain texture uses CSS ::before with inline SVG data URI — zero runtime cost, no extra files"

requirements-completed: [FOUN-01, FOUN-09, FOUN-11, FOUN-12, FOUN-13, FOUN-14, FOUN-15]

# Metrics
duration: ~5min
completed: 2026-03-30
---

# Phase 01 Plan 02: Design System Wiring Summary

**globals.css rewritten with 18-token CSS variable system (light + dark), grain texture on .card, Inter removed, three DESIGN.md fonts wired to html element, ThemeProvider connected in providers.tsx**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-30
- **Completed:** 2026-03-30
- **Tasks:** 3/3 complete (checkpoint approved)
- **Files modified:** 4

## Accomplishments
- Rewrote globals.css: moved CSS variables into @layer base, added .dark block with all 18 tokens, grain texture pseudo-element on .card, tabular-nums on tables
- Modified layout.tsx: removed Inter font completely, added generalSans/dmSans/jetbrainsMono variables to html className, added suppressHydrationWarning, body now uses `font-sans bg-bg text-text-base antialiased`
- Modified providers.tsx: added ThemeProvider wrapping inside SessionProvider
- Fixed fonts.ts: DM Sans weight changed to `"variable"` to allow axes usage (Rule 1 auto-fix)
- Build passes cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite globals.css with CSS variables, grain texture, and design tokens** - `0ebc4ed` (feat)
2. **Task 2: Wire fonts and ThemeProvider — remove Inter, apply font variables** - `119dd46` (feat)
3. **Task 3: Visual verification of foundation token layer** - checkpoint approved after dark mode fix `df4cd7d`

## Files Created/Modified
- `apps/web/src/app/globals.css` - CSS variables in @layer base, .dark overrides, grain texture on .card, component classes using semantic tokens
- `apps/web/src/app/layout.tsx` - Inter removed, three font variables on html, suppressHydrationWarning, body uses design system tokens
- `apps/web/src/components/providers.tsx` - ThemeProvider wrapping added inside SessionProvider
- `apps/web/src/app/fonts.ts` - DM Sans weight fixed to "variable" for axes compatibility

## Decisions Made
- CSS variables placed OUTSIDE `@layer base` at file root — Tailwind 3.4 purges custom selectors inside `@layer` that don't match its own utilities, which completely stripped the `.dark` block from compiled output
- DM Sans `weight: "variable"` instead of explicit weight array — required when `axes` is specified in next/font

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed DM Sans axes/weight incompatibility in fonts.ts**
- **Found during:** Task 2 build verification
- **Issue:** `next/font` error: "Axes can only be defined for variable fonts when the weight property is nonexistent or set to `variable`." — fonts.ts had both explicit weight array and axes
- **Fix:** Changed `weight: ["300", "400", "500", "600", "700"]` to `weight: "variable"` in DM_Sans config
- **Files modified:** `apps/web/src/app/fonts.ts`
- **Verification:** Build passes after fix
- **Committed in:** `119dd46`

---

**2. [Checkpoint Fix] Moved CSS variables outside @layer base for dark mode**
- **Found during:** Task 3 (visual verification checkpoint)
- **Issue:** Dark mode not working — `.dark` block inside `@layer base` was being purged by Tailwind 3.4
- **Fix:** Moved `:root` and `.dark` blocks outside `@layer base` to file root so they're always included
- **Files modified:** `apps/web/src/app/globals.css`
- **Verification:** `--color-bg` computes to `#0f0f1a` when `.dark` class on html; visual confirmation
- **Committed in:** `df4cd7d`

---

**Total deviations:** 2 auto-fixed (1 Rule 1 Bug, 1 checkpoint fix)
**Impact on plan:** Both required for correctness. No scope creep.

## Issues Encountered
- fonts.ts from Plan 01 had a DM Sans configuration error (axes with explicit weight array) that prevented build — auto-fixed per Rule 1

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Design token infrastructure complete — visual verification approved
- All foundation contracts are live — Phase 2 can begin restyling pages
- Dark mode switches correctly via `.dark` class on html

---
*Phase: 01-foundation*
*Completed: 2026-03-30*

## Self-Check: PASSED
- `apps/web/src/app/globals.css` — FOUND
- `apps/web/src/app/layout.tsx` — FOUND
- `apps/web/src/components/providers.tsx` — FOUND
- Commit `0ebc4ed` — FOUND
- Commit `119dd46` — FOUND
