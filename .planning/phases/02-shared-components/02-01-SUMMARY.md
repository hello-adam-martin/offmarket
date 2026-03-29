---
phase: 02-shared-components
plan: 01
subsystem: shared-components
tags: [css, tailwind, theme, header, footer, dark-mode]
dependency_graph:
  requires: [01-foundation]
  provides: [btn-sizes, badge-classes, modal-shell, card-compact, ThemeToggle, header-semantic, footer-semantic]
  affects: [all-pages]
tech_stack:
  added: []
  patterns: [semantic-token-replacement, css-class-library, mounted-guard-pattern]
key_files:
  created:
    - apps/web/src/components/ThemeToggle.tsx
  modified:
    - apps/web/src/app/globals.css
    - apps/web/src/components/header.tsx
    - apps/web/src/components/footer.tsx
decisions:
  - "Badge variants expand all @apply utilities inline rather than chaining custom classes (Research Pitfall 1 avoidance)"
  - "Modal panel classes use full inline @apply expansion — not chaining .modal-panel in .modal-panel-sm"
  - "Footer grid changed from grid-cols-2 md:grid-cols-5 to grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 per UI-SPEC column layout contract"
  - "ThemeToggle rendered in both desktop nav and mobile header row for consistent dark mode access"
metrics:
  duration: "3 minutes"
  completed: "2026-03-30"
  tasks_completed: 3
  files_modified: 4
---

# Phase 02 Plan 01: CSS Class Library + Header + Footer Summary

CSS class foundation for all Phase 2 components established in globals.css; ThemeToggle component created with hydration-safe mounted guard; header and footer fully restyled with semantic tokens, 1120px max-width, and teal design system.

## What Was Built

### globals.css — CSS Class Library Extensions

Added 12 new classes to the `@layer components` block:

- **Button size variants:** `.btn-sm` (h-9), `.btn-md` (h-10), `.btn-lg` (h-12)
- **Card compact:** `.card-compact` — surface background, no grain texture, p-4
- **Badges (6):** `.badge` (base), `.badge-info`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`
- **Modal shell (3):** `.modal-backdrop`, `.modal-panel`, `.modal-panel-sm` (max-w-md), `.modal-panel-lg` (max-w-xl)

### ThemeToggle.tsx

New client component using `useTheme` from next-themes. Implements:
- `useState(false)` mounted guard to prevent hydration mismatch
- Placeholder `<div className="h-9 w-9">` during SSR to prevent layout shift
- Sun icon shown in dark mode (to switch to light); moon icon in light mode (to switch to dark)
- `aria-label="Toggle theme"` + dynamic `title` attribute
- `.btn-ghost h-9 w-9` button styling

### header.tsx — Full Semantic Token Restyle

All hardcoded color classes replaced with semantic tokens:
- `bg-white` -> `bg-surface`; `max-w-7xl` -> `max-w-[1120px]`
- Logo: "OffMarket" in `text-accent font-display`, "NZ" in `text-text-base font-display`
- Nav links: `text-text-secondary hover:text-text-base transition-colors`
- ThemeToggle added in desktop nav (right of links, left of auth) and mobile header row
- Notification badge: `bg-accent text-white tabular-nums`
- Mobile menu button: `aria-expanded` + `aria-label` per UI-SPEC
- Mobile menu panel: `bg-surface border-b border-border p-4`

### footer.tsx — Semantic Token Restyle + Grid Fix

Footer inverted from hardcoded dark (`bg-gray-900`) to semantic (`bg-surface-raised`):
- All `text-gray-*` -> `text-text-secondary` / `text-text-muted`
- All `border-gray-*` -> `border-border`
- `text-white` headings -> `text-text-base`
- Grid updated from `grid-cols-2 md:grid-cols-5` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` per UI-SPEC
- No `dark:` prefix utilities — semantic tokens handle dark mode automatically
- Logo uses `font-display` class matching header

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `8ecfc93` | feat(02-01): add CSS class library and ThemeToggle component |
| 2 | `f198ad6` | feat(02-01): restyle header with semantic tokens and ThemeToggle |
| 3 | `aea43d4` | feat(02-01): restyle footer with semantic tokens and 1120px max-width |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all components use live data (session, unreadCount polling, Link hrefs).

## Verification

- `pnpm --filter @offmarket/web build` — PASSED (0 errors)
- `pnpm --filter @offmarket/web lint` — PASSED (0 errors, 93 pre-existing warnings)
- globals.css contains all 12 new CSS classes
- header.tsx: no bg-white, text-gray-*, border-gray-*, bg-gray-*, max-w-7xl, text-primary-*, bg-primary-*
- footer.tsx: no bg-gray-*, text-gray-*, border-gray-*, text-white, dark: utilities

## Self-Check: PASSED
