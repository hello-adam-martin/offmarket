---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [tailwind, next-themes, next/font, css-variables, dark-mode, fonts]

# Dependency graph
requires: []
provides:
  - Tailwind CSS semantic token config with DESIGN.md color/typography/radius/spacing mappings
  - CSS custom properties in globals.css for all 18 color tokens (light + dark mode)
  - Three-font stack: General Sans (local woff2), DM Sans (google), JetBrains Mono (google)
  - ThemeProvider client component wrapping next-themes with class-based dark mode
  - DESIGN.md component class layer (btn, card, input, label) in globals.css
affects:
  - 01-02 (layout.tsx wiring)
  - All subsequent phases (token consumption)

# Tech tracking
tech-stack:
  added:
    - next-themes (0.4.x — dark mode with SSR-safe localStorage persistence)
    - next/font/local (General Sans variable woff2)
    - next/font/google (DM Sans with opsz axis, JetBrains Mono)
  patterns:
    - CSS custom properties in :root/.dark → Tailwind token mapping pattern
    - darkMode: 'selector' enabling .dark class on <html> via next-themes
    - next/font CSS variable output pattern (--font-x variables)

key-files:
  created:
    - apps/web/src/app/fonts.ts
    - apps/web/src/app/fonts/GeneralSans-Variable.woff2
    - apps/web/src/components/ThemeProvider.tsx
  modified:
    - apps/web/tailwind.config.ts
    - apps/web/src/app/globals.css
    - apps/web/package.json
    - pnpm-lock.yaml

key-decisions:
  - "DM Sans axes: use ['opsz'] only — 'ital' is not a valid DM_Sans axis in next/font types"
  - "globals.css CSS variables defined in :root (not @layer base) so they are always available outside Tailwind layers"
  - "GeneralSans-Variable.woff2 downloaded from Fontshare CDN via fontshare v2 CSS API"

patterns-established:
  - "Pattern 1: Tailwind tokens use CSS variable references (var(--color-x)) enabling runtime dark mode switching without class regeneration"
  - "Pattern 2: All color tokens map semantically (bg, surface, accent) not numerically (primary-600) — enables DESIGN.md 1:1 alignment"
  - "Pattern 3: Font variables declared on <html> element via className, consumed in Tailwind fontFamily config"

requirements-completed: [FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, FOUN-08, FOUN-10]

# Metrics
duration: 3min
completed: 2026-03-30
---

# Phase 01 Plan 01: Design System Contracts Summary

**Tailwind token config rewritten with 18 semantic CSS-variable-mapped color tokens, 7-stop typography scale, and custom radius/spacing; General Sans variable font self-hosted; ThemeProvider + globals.css CSS variables establish full DESIGN.md design system contract**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-29T14:58:10Z
- **Completed:** 2026-03-30T00:01:15Z
- **Tasks:** 3 (+ 2 auto-fix deviations)
- **Files modified:** 7

## Accomplishments
- Installed next-themes and downloaded GeneralSans-Variable.woff2 (38KB from Fontshare CDN)
- Created fonts.ts exporting three font instances with correct CSS variable names
- Rewrote tailwind.config.ts: removed old primary/accent numeric scales, added 18 semantic tokens, 7-stop fontSize, custom borderRadius, 2xs spacing, content maxWidth
- Created ThemeProvider.tsx as 'use client' component with class-based dark mode
- Rewrote globals.css with :root CSS variables, .dark overrides, and updated component classes
- Build passes with TypeScript compilation clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Install next-themes, acquire font, create fonts.ts** - `a8a46de` (feat)
2. **Task 2: Rewrite tailwind.config.ts with DESIGN.md semantic tokens** - `11ce20d` (feat)
3. **Task 3: Create ThemeProvider client component** - `a21790d` (feat)
4. **Deviation: globals.css rewrite + fonts.ts axis fix** - `04deef3` (fix)

## Files Created/Modified
- `apps/web/src/app/fonts.ts` - Three font instance exports with CSS variables
- `apps/web/src/app/fonts/GeneralSans-Variable.woff2` - Self-hosted General Sans variable font
- `apps/web/src/components/ThemeProvider.tsx` - next-themes client component wrapper
- `apps/web/tailwind.config.ts` - Complete semantic token config replacing old numeric scales
- `apps/web/src/app/globals.css` - CSS custom properties + .dark overrides + DESIGN.md component classes
- `apps/web/package.json` - Added next-themes dependency
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- Used `axes: ["opsz"]` only for DM Sans (next/font TypeScript types don't accept "ital" as a valid axis for DM_Sans — optical sizing is the correct axis)
- CSS variables defined in :root at file root (not @layer base) for universal availability
- General Sans downloaded automatically via Fontshare v2 CSS API CDN URL — manual download not required

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] globals.css rewrites required to unblock build**
- **Found during:** Build verification after all 3 tasks
- **Issue:** globals.css still referenced `bg-primary-600`, `border-gray-300`, `rounded-xl` — classes removed from Tailwind config — causing build to fail with "class does not exist" error
- **Fix:** Rewrote globals.css with full :root CSS variables (all 18 tokens), .dark overrides, and updated all @layer components classes to use new semantic tokens (btn-primary → bg-accent, .card → bg-surface rounded-lg, etc.). Also added btn-destructive class and table tabular-nums per FOUN-13/FOUN-14.
- **Files modified:** `apps/web/src/app/globals.css`
- **Verification:** Build passes after fix
- **Committed in:** `04deef3`

**2. [Rule 1 - Bug] DM Sans axes type error fixed**
- **Found during:** Build verification (same build run)
- **Issue:** `axes: ["ital", "opsz"]` caused TypeScript error "Type '"ital"' is not assignable to type '"opsz"'" — DM_Sans only accepts "opsz" axis in next/font types
- **Fix:** Changed `axes: ["ital", "opsz"]` to `axes: ["opsz"]`
- **Files modified:** `apps/web/src/app/fonts.ts`
- **Verification:** TypeScript compilation passes
- **Committed in:** `04deef3`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes were required for build correctness. The globals.css rewrite was called out in UI-SPEC.md as FOUN-13 (plan scope) — the per-task plan structure placed it outside the 3 explicit tasks but it was always intended work. No scope creep.

## Issues Encountered
- Fontshare v2 CSS API with `@variable` query returns 500 error — used the woff2 URL from the standard API response (which is the same variable font file packaged as woff2)

## User Setup Required
None - General Sans was downloaded automatically. No external service configuration required.

## Next Phase Readiness
- All design system contracts established — tailwind.config.ts, globals.css, fonts.ts, ThemeProvider all ready
- Plan 02 can proceed: wire fonts into layout.tsx (remove Inter, add font variables to `<html>`), wrap ThemeProvider in providers.tsx, add suppressHydrationWarning
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-03-30*
