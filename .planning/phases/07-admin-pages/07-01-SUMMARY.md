---
phase: 07-admin-pages
plan: 01
subsystem: admin-ui
tags: [design-system, tailwind, admin, restyling]
dependency_graph:
  requires: [06-user-app-pages, 01-foundation, 02-shared-components]
  provides: [admin-layout-shell, admin-dashboard, admin-users-table, admin-billing-overview]
  affects: [all admin pages via layout.tsx]
tech_stack:
  added: []
  patterns: [semantic-token-swap, card-class, badge-variants, border-l-4-feedback]
key_files:
  created: []
  modified:
    - apps/web/src/app/admin/layout.tsx
    - apps/web/src/app/admin/page.tsx
    - apps/web/src/app/admin/users/page.tsx
    - apps/web/src/app/admin/billing/page.tsx
decisions:
  - "[07-01]: Quick Actions in billing page use flat .card links — icon renders inline with text-text-secondary, no colored circle wrappers per AI slop blacklist"
  - "[07-01]: Postcards nav item uses document-style SVG icon — distinct from Email Templates envelope icon"
  - "[07-01]: Quick Action card links nest .card inside another .card parent — outer card is the Quick Actions section wrapper; inner card is each link block with hover:bg-surface-raised"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-30T08:59:28Z"
  tasks_completed: 2
  files_modified: 4
---

# Phase 07 Plan 01: Admin Layout Shell, Dashboard, Users Table, and Billing Overview Summary

Admin layout shell and four highest-traffic admin pages restyled with DESIGN.md semantic tokens — bg-primary header, bg-surface sidebar with accent active nav, uniform .card stat cards, border-l-4 feedback states, and semantic badge variants replacing all rainbow and hardcoded colors.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Restyle admin layout shell and dashboard page | a33fdd8 | layout.tsx, page.tsx |
| 2 | Restyle users table and billing overview page | 03ac7dd | users/page.tsx, billing/page.tsx |

## What Was Built

### Task 1: Admin Layout Shell + Dashboard

**layout.tsx:**
- Header changed from `bg-gray-900` to `bg-primary text-text-inverse`
- Header title uses `font-display font-semibold text-lg text-text-inverse`
- Subtitle uses `text-sm text-text-muted`; back link uses `text-sm text-text-muted hover:text-text-inverse transition-colors`
- Header removed `max-w-7xl` constraint (full-width per D-05)
- Sidebar changed from `bg-white shadow-sm` to `bg-surface border-r border-border`
- Active nav items: `bg-accent-light text-accent rounded-md` replacing `bg-primary-50 text-primary-700`
- Inactive nav items: `text-text-secondary hover:bg-surface-raised hover:text-text-base` replacing `text-gray-700 hover:bg-gray-100`
- Added Postcards as 5th nav item linking to `/admin/postcards`
- Loading spinner updated to `border-accent`

**page.tsx:**
- Removed `colorClasses` rainbow object entirely
- All 7 stat cards use uniform `.card` class
- Total Users card has `border-l-4 border-accent` (emphasized)
- All stat values use `text-xl font-display font-semibold text-text-base tabular-nums`
- Loading skeletons use `bg-surface-raised` not `bg-gray-200`
- Role badges use `badge-warning` (ADMIN) and `badge-neutral` (USER)
- Page heading: `text-xl font-display font-semibold text-text-base`
- Recent users section uses `card overflow-hidden p-0` with `divide-y divide-border`

### Task 2: Users Table + Billing Overview

**users/page.tsx:**
- Search input uses `.input` class; search button uses `btn-primary`
- Table wrapper: `card overflow-x-auto p-0`; table: `w-full min-w-[640px]`
- Table headers: `text-xs font-semibold text-text-muted uppercase tracking-wide`
- Table body: `divide-y divide-border`; rows: `hover:bg-surface-raised transition-colors`
- Role badges: `badge-warning` (ADMIN) / `badge-neutral` (USER) — removes `bg-purple-100 text-purple-700`
- Profile badges: `badge-info` (Buyer) / `badge-neutral` (Owner) — removes hardcoded green/blue
- Action buttons: `btn-secondary` / `btn-destructive` with `min-h-[44px]`
- Pagination: `btn-secondary btn-sm` buttons; pagination info uses `tabular-nums`

**billing/page.tsx:**
- All 10 stat cards converted to uniform `.card`; Total Subscriptions has `border-l-4 border-accent`
- Removed all semantic-colored stat values: `text-green-600` (active), `text-yellow-600` (pastDue), `text-blue-600` (held), `text-orange-500` (refunded), `text-gray-400` (canceled/expired)
- All stat values: `text-xl font-display font-semibold text-text-base tabular-nums`
- processResult feedback: `card border-l-4 border-success` / `card border-l-4 border-error` with `text-sm text-text-base`
- Quick Actions: Removed icon-in-colored-circle pattern (`bg-primary-100`, `bg-green-100`, `bg-purple-100`)
- Quick Actions: Flat `.card` link blocks with inline icons `text-text-secondary w-5 h-5`
- Nav buttons converted to `btn-secondary` (Settings) and `btn-primary` (Manage links)

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes

- Pre-existing ESLint warnings (`react-hooks/exhaustive-deps`, `@typescript-eslint/no-explicit-any`) exist in OTHER admin files not modified in this plan — out of scope per scope boundary rules. These were present before this plan and are not caused by our changes.
- The Quick Action cards in billing/page.tsx technically nest inside the outer "Quick Actions" card wrapper. The inner cards use `hover:bg-surface-raised transition-colors` for interactive state.

## Known Stubs

None — all data bindings are wired to real API endpoints. No placeholders introduced.

## Self-Check: PASSED

Files exist:
- apps/web/src/app/admin/layout.tsx — FOUND
- apps/web/src/app/admin/page.tsx — FOUND
- apps/web/src/app/admin/users/page.tsx — FOUND
- apps/web/src/app/admin/billing/page.tsx — FOUND

Commits exist:
- a33fdd8 — Task 1 (layout + dashboard)
- 03ac7dd — Task 2 (users + billing)

Build: `pnpm --filter web build` exits 0 — CONFIRMED
