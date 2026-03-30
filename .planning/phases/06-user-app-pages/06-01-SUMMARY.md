---
phase: 06-user-app-pages
plan: "01"
subsystem: frontend/user-pages
tags: [design-system, dashboard, profile, semantic-tokens, dark-mode]
dependency_graph:
  requires: [globals.css semantic tokens, Phase 2 component classes]
  provides: [dashboard restyled, profile page restyled]
  affects: [apps/web/src/app/dashboard/, apps/web/src/app/profile/]
tech_stack:
  added: []
  patterns: [semantic token replacement, badge-info/neutral, card border-l-4 stripe pattern, tabular-nums data display]
key_files:
  created: []
  modified:
    - apps/web/src/app/dashboard/page.tsx
    - apps/web/src/app/dashboard/DashboardClient.tsx
    - apps/web/src/app/profile/page.tsx
decisions:
  - "[06-01]: Dashboard upgrade CTA uses card with border-l-4 border-accent — removes bg-gradient AI slop, flat card signals prominence via left stripe"
  - "[06-01]: Usage remaining badge uses badge-error/badge-warning/badge-neutral tier logic matching progress bar thresholds"
  - "[06-01]: Profile quick links use hover:border-accent transition matching dashboard quick action pattern for consistency"
metrics:
  duration: 164s
  completed: "2026-03-30"
  tasks: 2
  files_modified: 3
---

# Phase 6 Plan 1: Dashboard + Profile Restyle Summary

Dashboard and profile/settings pages restyled with DESIGN.md semantic tokens — flat upgrade CTA card with accent left border, badge-info Pro badge, progress bar color tiers, and .card/.input/.label form patterns throughout.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Restyle dashboard server + DashboardClient | b407782 | page.tsx, DashboardClient.tsx |
| 2 | Restyle profile/settings page | 4b0e1fe | profile/page.tsx |

## Changes Made

### Task 1: Dashboard

**dashboard/page.tsx:**
- `max-w-7xl` → `max-w-content`
- `text-2xl font-bold text-gray-900` → `text-xl font-display font-semibold text-primary` (headings)
- `text-gray-600` → `text-secondary` (description text)
- Quick action links: `border-gray-200 hover:border-primary-300 hover:bg-primary-50` → `bg-surface border border-border hover:border-accent`
- Arrow icons: `text-gray-400` → `text-muted`
- All `p.font-medium text-gray-900` → `text-primary`
- All `text-sm text-gray-500` → `text-sm text-secondary`

**dashboard/DashboardClient.tsx:**
- Removed `bg-gradient-to-r from-purple-50 via-primary-50 to-accent-50` — replaced with `card border-l-4 border-accent`
- Pro badge: `bg-primary-100 text-primary-700 rounded-full` → `badge-info`
- Free Plan badge: `bg-gray-100 text-gray-700 rounded-full` → `badge-neutral`
- Usage warning badges: inline `rounded-full` → `badge-error` / `badge-warning` / `badge-neutral` tiers
- Progress bar track: `bg-gray-200 rounded-full` → `bg-surface-raised rounded-full`
- Progress bar fill: `bg-red-500` / `bg-yellow-500` / `bg-primary-500` → `bg-error` / `bg-warning` / `bg-accent`
- Feature list icons: `text-primary-500` → `text-accent`
- Feature list text: `text-gray-600` → `text-secondary`
- "View pricing details" link: `text-primary-600 hover:text-primary-700` → `text-accent hover:text-accent-hover`
- Upgrade CTA heading copy: "Upgrade to Pro for More" → "You're on the Free Plan" per UI-SPEC
- Upgrade CTA body copy updated per UI-SPEC copywriting contract
- `tabular-nums` added on usage count display container
- `text-gray-500` → `text-secondary` on Pro member subtitle

### Task 2: Profile

- `max-w-2xl` → `max-w-content` (all container variants)
- Loading skeletons: `bg-gray-200` → `bg-surface-raised`
- Sign-in prompt: `text-2xl font-bold text-gray-900` → `text-xl font-display font-semibold text-primary`
- Error banner: `bg-red-50 border-red-200 rounded-lg text-red-700` → `bg-error-light border-error rounded-md text-error`
- Success banner: `bg-green-50 border-green-200 rounded-lg text-green-700` → `bg-success-light border-success rounded-md text-success`
- Form labels: `block text-sm font-medium text-gray-700 mb-1` → `.label` class
- Email disabled input: `bg-gray-50 text-gray-500` → `bg-surface-raised text-muted`
- Helper text: `text-xs text-gray-500` → `text-xs text-muted`
- Section divider: `border-t border-gray-200` → `border-t border-border`
- "Save Changes" → "Save changes" per UI-SPEC copywriting
- Account Status heading: `text-lg font-semibold text-gray-900` → `text-xl font-display font-semibold text-primary`
- Profile status icons: `text-gray-400` → `text-muted`
- Profile status labels: `text-gray-700` → `text-secondary`
- Active status: `text-green-600` → `text-success`
- Register links: `text-primary-600 hover:text-primary-800` → `text-accent hover:text-accent-hover`
- Quick Links: `border-gray-200 hover:border-primary-300 hover:bg-primary-50` → `border-border hover:border-accent`
- Quick link icons: `text-primary-600` → `text-accent`
- Quick link labels: `text-gray-900` → `text-primary`
- Account status second row gets `border-t border-border pt-3` divider
- Form wrapped in `.card mb-6` per UI-SPEC card section pattern

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All data flows through existing API connections unchanged. No hardcoded placeholder data introduced.

## Self-Check: PASSED

- [x] apps/web/src/app/dashboard/page.tsx — exists, contains max-w-content, hover:border-accent
- [x] apps/web/src/app/dashboard/DashboardClient.tsx — exists, contains badge-info, badge-neutral, border-l-4 border-accent, no bg-gradient, no purple-
- [x] apps/web/src/app/profile/page.tsx — exists, contains max-w-content, card, btn-primary, border-border, no gray-/primary-/red-/green-
- [x] Commit b407782 — exists (dashboard task)
- [x] Commit 4b0e1fe — exists (profile task)
