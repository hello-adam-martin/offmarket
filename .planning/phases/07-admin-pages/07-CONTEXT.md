# Phase 7: Admin Pages - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

All admin pages — dashboard, user management, billing (overview, subscriptions, escrows, settings), email templates (listing + editor), and postcards admin — render in DESIGN.md styling with fintech-grade financial data tables. 9 requirements (ADMN-01 through ADMN-09), 10 files, ~3800 lines. No new features. No backend changes. Pure visual token replacement and DESIGN.md compliance.

</domain>

<decisions>
## Implementation Decisions

### Admin Layout Shell
- **D-01:** Keep the distinct admin chrome (dark header + sidebar nav) — do NOT replace with the site-wide Header/Footer. The admin stays visually separate from user-facing pages.
- **D-02:** Restyle the dark header bar with `bg-primary` (DESIGN.md dark surface). "Admin Panel" title in `text-text-inverse`. "Back to Site" link in `text-muted` with `hover:text-text-inverse`.
- **D-03:** Sidebar uses `bg-surface` (white in light mode, #1a1a2e in dark mode). Active nav item uses `bg-accent-light text-accent`. Inactive items use `text-secondary hover:bg-surface-raised`.
- **D-04:** Add Postcards as a 5th nav item in the admin sidebar (currently exists at `/admin/postcards` but is not in the nav).
- **D-05:** Admin header and sidebar max-width: full-width (no `max-w-content` constraint on the admin shell itself — content area can use it where appropriate).

### Stat Card Color System
- **D-06:** All dashboard stat cards use uniform `.card` class styling (bg-surface, border-border). Remove the 7-color rainbow approach (blue, green, purple, orange, pink, cyan, yellow).
- **D-07:** Numbers in `text-primary` with `tabular-nums`. Labels in `text-secondary`.
- **D-08:** One highlighted card (e.g., Total Users) may use `border-l-4 border-accent` for emphasis. All others are standard `.card`.

### Financial Data Tables
- **D-09:** Clean minimal table style — no alternating striped rows. Subtle `border-border` dividers between rows.
- **D-10:** Row hover state: `hover:bg-surface-raised` for interactive feedback.
- **D-11:** Table header row: `text-muted uppercase tracking-wide text-xs` for column labels.
- **D-12:** Dollar amounts always show cents (e.g., `$299.00` not `$299`). Use `tabular-nums font-mono` (JetBrains Mono) for all monetary values. Right-aligned in table columns.
- **D-13:** Date columns use `text-secondary tabular-nums`.

### Status Badge Mapping — Escrow
- **D-14:** PENDING = `badge-warning` (amber)
- **D-15:** HELD = `badge-info` (teal/accent)
- **D-16:** RELEASED = `badge-success` (green)
- **D-17:** REFUNDED = `badge-neutral` (gray)
- **D-18:** EXPIRED = `badge-error` (red)

### Status Badge Mapping — Subscription
- **D-19:** ACTIVE = `badge-success`
- **D-20:** CANCELED = `badge-neutral`
- **D-21:** PAST_DUE = `badge-error`
- **D-22:** TRIALING = `badge-info`

### Cross-Cutting Token Swaps (All Admin Pages)
- **D-23:** All `gray-*` hardcoded colors → semantic tokens (`text-primary`, `text-secondary`, `text-muted`, `bg-surface`, `bg-surface-raised`, `border-border`) — per Phase 6 D-21.
- **D-24:** All `bg-white` → `bg-surface` for dark mode support.
- **D-25:** All `max-w-7xl` → `max-w-content` (1120px) where applicable in content areas.
- **D-26:** Loading skeletons use `bg-surface-raised` not `bg-gray-200` — per Phase 6 D-27.
- **D-27:** All `rounded-lg shadow` cards → `.card` class (8px border-radius, DESIGN.md border).
- **D-28:** All hardcoded status colors (e.g., `bg-purple-100 text-purple-700` for ADMIN role badge) → semantic `badge-*` classes.
- **D-29:** All numeric displays use `tabular-nums`.

### Claude's Discretion
- Exact spacing/padding values within tables and cards as long as they follow DESIGN.md 4px base unit
- Responsive breakpoint adjustments for admin layout, stat grid, and table scroll behavior
- Email template editor form layout — follow established `.input` and `.card` section patterns
- Postcards admin page table/card layout
- Action button placement in table rows (inline vs dropdown)
- Filter/search bar styling — follow established patterns from prior phases
- Empty state patterns — reuse Phase 2 EmptyState component pattern (COMP-09)
- Billing settings form section styling — follow established form patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN.md` — Single source of truth: typography, color palette, spacing, dark mode, AI slop blacklist, badge spec
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Token values, CSS variable names, Tailwind config

### Phase Outputs (Foundation + Shared Components)
- `apps/web/tailwind.config.ts` — Semantic tokens: `bg-surface`, `text-primary`, `text-secondary`, `border-border`, `max-w-content`, badge utilities
- `apps/web/src/app/globals.css` — CSS variables, `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.badge-*` classes

### Prior Phase Context
- `.planning/phases/06-user-app-pages/06-CONTEXT.md` — Cross-cutting token swap patterns (D-20 through D-29) that apply identically here

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.card` CSS class in globals.css — used for all card containers (stat cards, table wrappers)
- `.badge-*` classes (info, success, warning, error, neutral) — used for all status badges
- `.btn-primary`, `.btn-secondary` — action buttons in tables and forms
- `.input` class — form inputs in billing settings and email template editor
- `tabular-nums` Tailwind utility — already established for numeric data display

### Established Patterns
- Token swap pattern from Phases 3-6: `gray-*` → semantic, `bg-white` → `bg-surface`, `rounded-lg shadow` → `.card`
- Badge mapping pattern from Phase 6: status enums → `badge-*` classes via STATUS_LABELS-style objects
- Form styling pattern from Phases 4-5: sections in `.card`, inputs use `.input`, buttons use `.btn-*`

### Integration Points
- `apps/web/src/app/admin/layout.tsx` — Admin shell (header + sidebar + main area). All admin pages render inside this layout.
- Admin layout is independent from site Header/Footer — restyled separately.
- Billing settings page (823 lines) is the most complex — multiple form sections with conditional display.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following DESIGN.md and established patterns from prior phases.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-admin-pages*
*Context gathered: 2026-03-30*
