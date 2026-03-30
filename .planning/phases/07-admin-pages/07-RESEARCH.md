# Phase 7: Admin Pages - Research

**Researched:** 2026-03-30
**Domain:** Admin UI — token replacement, fintech table patterns, status badge mapping, admin layout shell
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Admin Layout Shell**
- D-01: Keep the distinct admin chrome (dark header + sidebar nav) — do NOT replace with the site-wide Header/Footer
- D-02: Restyle the dark header bar with `bg-primary`. "Admin Panel" title in `text-text-inverse`. "Back to Site" link in `text-muted` with `hover:text-text-inverse`
- D-03: Sidebar uses `bg-surface`. Active nav item uses `bg-accent-light text-accent`. Inactive items use `text-secondary hover:bg-surface-raised`
- D-04: Add Postcards as a 5th nav item in the admin sidebar (currently exists at `/admin/postcards` but is not in the nav)
- D-05: Admin header and sidebar max-width: full-width. Content area can use `max-w-content` where appropriate

**Stat Card Color System**
- D-06: All dashboard stat cards use uniform `.card` class styling. Remove the 7-color rainbow approach
- D-07: Numbers in `text-primary` with `tabular-nums`. Labels in `text-secondary`
- D-08: One highlighted card (Total Users) may use `border-l-4 border-accent`. All others are standard `.card`

**Financial Data Tables**
- D-09: Clean minimal table style — no alternating striped rows. Subtle `border-border` dividers between rows
- D-10: Row hover state: `hover:bg-surface-raised`
- D-11: Table header row: `text-muted uppercase tracking-wide text-xs` for column labels
- D-12: Dollar amounts always show cents. Use `tabular-nums font-mono` (JetBrains Mono) for monetary values. Right-aligned in table columns
- D-13: Date columns use `text-secondary tabular-nums`

**Status Badge Mapping — Escrow**
- D-14: PENDING = `badge-warning`
- D-15: HELD = `badge-info`
- D-16: RELEASED = `badge-success`
- D-17: REFUNDED = `badge-neutral`
- D-18: EXPIRED = `badge-error`

**Status Badge Mapping — Subscription**
- D-19: ACTIVE = `badge-success`
- D-20: CANCELED = `badge-neutral`
- D-21: PAST_DUE = `badge-error`
- D-22: TRIALING = `badge-info`

**Cross-Cutting Token Swaps (All Admin Pages)**
- D-23: All `gray-*` hardcoded colors → semantic tokens
- D-24: All `bg-white` → `bg-surface`
- D-25: All `max-w-7xl` → `max-w-content` where applicable
- D-26: Loading skeletons use `bg-surface-raised` not `bg-gray-200`
- D-27: All `rounded-lg shadow` cards → `.card` class
- D-28: All hardcoded status colors → semantic `badge-*` classes
- D-29: All numeric displays use `tabular-nums`

### Claude's Discretion
- Exact spacing/padding values within tables and cards as long as they follow DESIGN.md 4px base unit
- Responsive breakpoint adjustments for admin layout, stat grid, and table scroll behavior
- Email template editor form layout — follow established `.input` and `.card` section patterns
- Postcards admin page table/card layout
- Action button placement in table rows (inline vs dropdown)
- Filter/search bar styling — follow established patterns from prior phases
- Empty state patterns — reuse Phase 2 EmptyState component pattern (COMP-09)
- Billing settings form section styling — follow established form patterns

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMN-01 | Admin dashboard restyled — stats cards, data tables with tabular-nums | Stat card pattern documented; rainbow colorClasses → `.card`; recent users table restyle |
| ADMN-02 | User management page restyled — data table, action buttons | Table pattern documented; role badge mapping documented; search input → `.input` |
| ADMN-03 | Billing overview page restyled | Stat card pattern; feedback state pattern (border-l-4); Quick Actions icon-circle removal |
| ADMN-04 | Billing settings page restyled | Form section pattern in `.card`; `.input` for all inputs; section icon color tokens |
| ADMN-05 | Subscriptions page restyled — data table with status badges | STATUS_LABELS → badge-* documented; table pattern documented |
| ADMN-06 | Escrows page restyled — financial data with tabular-nums | Font-mono tabular-nums for amounts; badge mapping D-14–D-18; expiring-soon token |
| ADMN-07 | Email templates page restyled | Table pattern; empty state via EmptyState component; create modal → Headless UI pattern |
| ADMN-08 | Email template editor page restyled | Editor form in `.card`; textarea with `font-mono`; variable hint panel; preview modal |
| ADMN-09 | Postcards admin page restyled | Stat cards; STATUS_LABELS badge mapping; reject modal; filter tabs → btn pattern |

</phase_requirements>

---

## Summary

Phase 7 is a pure visual overhaul of 10 admin files (~3,799 lines total). The work is entirely token replacement and DESIGN.md compliance — no new features, no API changes. Every pattern needed already exists in globals.css from Phases 1–2.

The admin section has its own layout shell (layout.tsx) that is independent from the site Header/Footer. That shell needs two structural changes: (1) the dark header and sidebar get token swaps from hardcoded grays to semantic tokens, and (2) a 5th nav item (Postcards) needs to be added. All content pages render inside this shell.

The heaviest file is billing/settings/page.tsx at 823 lines. It contains a feature comparison table with inline inputs — this needs careful token work but no structural changes. The postcards/page.tsx (651 lines) has the most interactive complexity with a Headless UI reject modal that already uses the correct Dialog/Transition pattern from Phase 2.

**Primary recommendation:** Split into two plans by file complexity. Plan 1 handles layout shell + simpler pages (dashboard, users, billing overview, email templates listing + editor). Plan 2 handles the billing sub-pages (subscriptions, escrows, settings) and postcards — the files with the most hardcoded financial data and status badge work.

---

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.4.16 | All styling via utility classes | Project convention — no separate CSS files |
| globals.css | — | `.card`, `.btn-*`, `.badge-*`, `.input`, `.label` component classes | Defined in Phase 1–2; used across all prior phases |
| Headless UI | 2.2.9 | Dialog/Transition for modals (postcards reject modal already uses it) | Already installed; Phase 2 pattern established |

### No New Dependencies

Phase 7 installs nothing. All required classes already exist in globals.css:
- `.card` — bg-surface rounded-lg border border-border p-6 (with grain texture)
- `.card-compact` — bg-surface rounded-lg border border-border p-4 (no grain)
- `.btn-primary` — bg-accent text-white hover:bg-accent-hover
- `.btn-secondary` — bg-surface text-text-base border border-border hover:bg-surface-raised
- `.btn-destructive` — bg-error text-white hover:bg-red-700
- `.btn-sm` / `.btn-md` / `.btn-lg` — size variants
- `.badge-info` / `.badge-success` / `.badge-warning` / `.badge-error` / `.badge-neutral`
- `.input` — block w-full rounded-md border border-border bg-surface focus ring
- `.label` — uppercase tracking-wide text-xs font-semibold text-text-secondary

---

## Architecture Patterns

### File Structure (no changes — existing admin structure)

```
apps/web/src/app/admin/
├── layout.tsx              # Admin shell — header + sidebar (D-01 through D-05)
├── page.tsx                # Dashboard (ADMN-01)
├── users/
│   └── page.tsx            # User management (ADMN-02)
├── billing/
│   ├── page.tsx            # Billing overview (ADMN-03)
│   ├── settings/
│   │   └── page.tsx        # Billing settings (ADMN-04) — 823 lines
│   ├── subscriptions/
│   │   └── page.tsx        # Subscriptions table (ADMN-05)
│   └── escrows/
│       └── page.tsx        # Escrows table (ADMN-06)
├── email-templates/
│   ├── page.tsx            # Templates listing (ADMN-07)
│   └── [name]/
│       └── page.tsx        # Template editor (ADMN-08)
└── postcards/
    └── page.tsx            # Postcards admin (ADMN-09) — 651 lines
```

### Pattern 1: Admin Layout Shell Restyle

**What:** The `layout.tsx` provides the dark header and sidebar for all admin pages.
**Current violations:**
- `bg-gray-900` (header) → `bg-primary`
- `bg-white shadow-sm` (sidebar) → `bg-surface border-r border-border`
- `bg-primary-50 text-primary-700` (active nav) → `bg-accent-light text-accent rounded-md`
- `text-gray-700 hover:bg-gray-100` (inactive nav) → `text-text-secondary hover:bg-surface-raised`
- `border-b-2 border-primary-600` (spinner) → `border-b-2 border-accent`
- Missing Postcards nav item (D-04)
- `min-h-screen bg-gray-100` (outer container) → `min-h-screen bg-bg`
- `max-w-7xl` on header → remove (full-width per D-05)
- `font-bold text-lg` on "Admin Panel" → `font-display font-semibold text-lg text-text-inverse`
- `text-gray-400 text-sm` on subtitle → `text-sm text-text-muted`
- `text-sm text-gray-300 hover:text-white` on back link → `text-sm text-text-muted hover:text-text-inverse transition-colors`

**Postcards nav item to add:**
```tsx
{ href: "/admin/postcards", label: "Postcards", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }
```
(The envelope icon matches the Postcards domain well and is already used in email-templates nav item — use a different icon, e.g., the postcard/letter icon path, or reuse the mail icon with a distinct SVG.)

### Pattern 2: Stat Card Grid

**What:** Dashboard and billing pages show grid stat cards.
**Current violation:** Rainbow `colorClasses` object in admin/page.tsx; colored number text in billing/page.tsx.
**Replacement:**

```tsx
// Standard stat card
<div className="card">
  <p className="text-sm text-text-secondary mb-1">{label}</p>
  <p className="text-xl font-display font-semibold text-text-base tabular-nums">{value}</p>
</div>

// Emphasized stat card (one per section — Total Users on dashboard)
<div className="card border-l-4 border-accent">
  <p className="text-sm text-text-secondary mb-1">{label}</p>
  <p className="text-xl font-display font-semibold text-text-base tabular-nums">{value}</p>
</div>

// Loading skeleton
<div className="card animate-pulse">
  <div className="h-4 w-24 bg-surface-raised rounded mb-2" />
  <div className="h-8 w-16 bg-surface-raised rounded" />
</div>
```

Note: `text-3xl font-bold` → `text-xl font-display font-semibold`. Remove color coding from stat values (D-06, D-07).

### Pattern 3: Financial Data Table

**What:** All billing tables (subscriptions, escrows) and user/template tables.
**Current violation:** `bg-white rounded-lg shadow overflow-hidden` wrapper; `bg-gray-50` thead; `hover:bg-gray-50` rows; `divide-gray-200` dividers.

```tsx
<div className="card overflow-x-auto p-0">  {/* p-0 overrides card padding for tables */}
  <table className="w-full min-w-[640px]">
    <thead>
      <tr className="border-b border-border">
        <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
          Column Name
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-surface-raised transition-colors">
        <td className="px-6 py-4 text-sm text-text-base">value</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Important:** The `.card` class includes `overflow-hidden` from `@apply relative overflow-hidden`. This is correct behavior for tables — content clips at the border-radius. Use `p-0` to remove card padding when the table provides its own cell padding.

**Monetary cell:**
```tsx
<td className="px-6 py-4 text-right font-mono text-sm text-text-base tabular-nums">
  ${(amount / 100).toFixed(2)}
</td>
```

**Date cell:**
```tsx
<td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
  {formatDate(dateString)}
</td>
```

**Pagination footer:**
```tsx
<div className="px-6 py-3 border-t border-border flex items-center justify-between">
  <p className="text-sm text-text-secondary">Showing X to Y of Z</p>
  <div className="flex gap-2">
    <button className="btn-secondary btn-sm" disabled={...}>Previous</button>
    <button className="btn-secondary btn-sm" disabled={...}>Next</button>
  </div>
</div>
```

### Pattern 4: Status Badge Mapping

**What:** Replace all inline `px-2 py-1 text-xs ... rounded-full` badge patterns with `badge-*` classes.

**Escrow STATUS_LABELS replacement:**
```tsx
const ESCROW_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: "Pending", badgeClass: "badge-warning" },
  HELD: { label: "Held", badgeClass: "badge-info" },
  RELEASED: { label: "Released", badgeClass: "badge-success" },
  REFUNDED: { label: "Refunded", badgeClass: "badge-neutral" },
  EXPIRED: { label: "Expired", badgeClass: "badge-error" },
};
```

**Subscription STATUS_LABELS replacement:**
```tsx
const SUBSCRIPTION_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  ACTIVE: { label: "Active", badgeClass: "badge-success" },
  PAST_DUE: { label: "Past Due", badgeClass: "badge-error" },
  CANCELED: { label: "Canceled", badgeClass: "badge-neutral" },
  INCOMPLETE: { label: "Incomplete", badgeClass: "badge-warning" },
  TRIALING: { label: "Trialing", badgeClass: "badge-info" },
};
```

**Subscription tier badge:**
```tsx
// PRO tier
<span className="badge-info">PRO</span>
// FREE tier
<span className="badge-neutral">FREE</span>
```

**User role badges (admin/page.tsx and users/page.tsx):**
```tsx
// ADMIN role
<span className="badge-warning">ADMIN</span>
// USER role
<span className="badge-neutral">USER</span>
```

**Profile badges in users table (Buyer/Owner):**
```tsx
// Both use badge-info — consistent with Phase 6 D-19 pattern
<span className="badge-info">Buyer</span>
<span className="badge-info">Owner</span>
```

**Postcards STATUS_LABELS replacement:**
```tsx
const POSTCARD_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: "Pending", badgeClass: "badge-warning" },
  APPROVED: { label: "Approved", badgeClass: "badge-info" },
  REJECTED: { label: "Rejected", badgeClass: "badge-error" },
  SENT: { label: "Sent", badgeClass: "badge-success" },
  DELIVERED: { label: "Delivered", badgeClass: "badge-success" },
  FAILED: { label: "Failed", badgeClass: "badge-error" },
};
```

### Pattern 5: Feedback State (Success/Error)

**What:** Replace `bg-green-50 border-green-200 text-green-700` and `bg-red-50 border-red-200 text-red-700` in billing pages.

```tsx
// Success feedback
<div className="card border-l-4 border-success p-4">
  <p className="text-sm text-text-base">{message}</p>
</div>

// Error feedback
<div className="card border-l-4 border-error p-4">
  <p className="text-sm text-text-base">{message}</p>
</div>
```

This pattern applies to:
- `billing/page.tsx` processResult state
- `billing/escrows/page.tsx` actionResult state
- `billing/settings/page.tsx` error/success state
- `email-templates/[name]/page.tsx` error/success state

### Pattern 6: Form Section (Billing Settings)

**What:** billing/settings/page.tsx uses `bg-white rounded-lg shadow p-6` for each section wrapper.
**Replacement:** `.card` for each section.

```tsx
<div className="card space-y-6">
  <h2 className="text-lg font-semibold text-text-base flex items-center gap-2">
    <svg className="w-5 h-5 text-text-secondary" .../>  {/* icon text-text-secondary, not text-primary-600/text-purple-600 */}
    Section Title
  </h2>
  {/* form fields use .input and .label */}
  <div>
    <label className="label">Field Name</label>
    <input className="input" ... />
  </div>
</div>
```

Note: Section heading icons currently use `text-primary-600` (subscription pricing) and `text-purple-600` (tier features). Replace with `text-text-secondary` (neutral, not semantic accent — icons are decorative here).

### Pattern 7: Quick Actions Cards (Billing Overview)

**What:** The 3 Quick Actions cards in billing/page.tsx use icon-in-colored-circle (AI slop blacklist violation).

**Current:**
```tsx
<div className="p-2 bg-primary-100 rounded-lg">  // icon circle
  <svg className="w-5 h-5 text-primary-600">
```

**Replacement:** Remove the icon circle entirely. Flat card link with inline icon.

```tsx
<Link href="/admin/billing/subscriptions" className="card p-4 hover:border-accent transition-colors block">
  <div className="flex items-center gap-3">
    <svg className="w-5 h-5 text-text-secondary flex-shrink-0" .../>
    <div>
      <p className="font-medium text-text-base text-sm">View Subscriptions</p>
      <p className="text-xs text-text-secondary">Manage user Pro subscriptions</p>
    </div>
  </div>
</Link>
```

The `.card` class has `overflow-hidden` which is fine. Use `block` on the Link to make the entire card clickable. `hover:border-accent` (border color change on hover) signals interactivity without AI slop.

### Pattern 8: Email Template Editor

**What:** `email-templates/[name]/page.tsx` — form inside a single card section.

Variable hints panel restyle (currently `bg-blue-50` — AI slop):
```tsx
<div className="card-compact bg-surface-raised border-border">
  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
    Available Variables
  </p>
  <div className="flex flex-wrap gap-2">
    {variables.map(v => (
      <code key={v} className="px-2 py-0.5 bg-surface border border-border rounded text-xs font-mono text-text-secondary cursor-pointer hover:border-accent hover:text-accent transition-colors">
        {`{{${v}}}`}
      </code>
    ))}
  </div>
</div>
```

Textarea (HTML content):
```tsx
<textarea className="input min-h-[300px] font-mono text-sm resize-y" ... />
```

Preview modal: uses the same modal shell pattern from Phase 2 (inline `fixed inset-0 z-50 bg-black/50` overlay + `card` panel).

### Pattern 9: Postcards Filter Tabs

**What:** postcards/page.tsx uses filter tab buttons (`bg-primary-600 text-white` for active, `bg-gray-100 text-gray-700` for inactive).

**Replacement:** Use the established btn pattern.
```tsx
<button className={statusFilter === status ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
  {label}
</button>
```

### Pattern 10: Escrow Expiring-Soon Warning

**What:** `isExpiringSoon` logic in escrows/page.tsx currently uses `text-orange-600 font-medium` for the date text and `text-orange-500` for the "Expiring soon" sub-label.

**Replacement:**
```tsx
<p className={`text-sm tabular-nums ${isExpiringSoon(escrow.expiresAt) ? "text-warning font-medium" : "text-text-secondary"}`}>
  {formatDate(escrow.expiresAt)}
</p>
{isExpiringSoon(escrow.expiresAt) && escrow.status === "HELD" && (
  <p className="text-xs text-warning">Expiring soon</p>
)}
```

### Pattern 11: Postcards Stat Cards (Rainbow Removal)

**What:** postcards/page.tsx uses `bg-yellow-50`, `bg-blue-50`, `bg-green-50`, `bg-red-50`, `bg-primary-50` for stat cards.

**Replacement:** All become `.card` per D-06. Revenue card gets `border-l-4 border-accent` as the emphasized card (D-08 — one per section).

### Anti-Patterns to Avoid

- **`rounded-full` on badges:** All badge spans must use `badge-*` classes (which use `rounded-sm`). Never retain `rounded-full`.
- **Chaining `.badge-*` in @apply:** As established in Phase 2, expand all badge utilities inline in JSX className strings, not via @apply.
- **`bg-primary-*` token:** This token does not exist in globals.css. Current admin code uses it incorrectly for accent (primary-600 = accent, primary-50 = accent-light). Always replace with explicit `accent`/`accent-light`.
- **`bg-gray-50` on thead:** Replace with no background (thead row uses only `border-b border-border` per D-11).
- **Inline `p-4 bg-primary-100 rounded-lg` icon circles:** These are on the AI slop blacklist. Remove entirely.
- **`shadow` utility class:** The `.card` class already provides border — no shadow needed. Remove any standalone `shadow` or `shadow-xl`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status badge rendering | Inline conditional className strings per status | `badge-*` classes from globals.css | Already implemented in Phase 2; consistent across all pages |
| Modal dialog | Custom fixed-position div | Headless UI `Dialog` + `Transition` (already used in postcards reject modal) | Accessibility (focus trap, aria-modal) baked in |
| Loading skeleton | New skeleton component | `animate-pulse` + `bg-surface-raised` divs inline | Established pattern from Phase 2 (D-26) |
| Form field styling | Per-field className strings | `.input` and `.label` classes | Defined in globals.css Phase 1 |
| Empty state | Per-page empty state markup | `EmptyState` component (COMP-09, Phase 2) | Consistent messaging; already built |

---

## Common Pitfalls

### Pitfall 1: `.card` Class Has `overflow-hidden` Built In

**What goes wrong:** Adding `overflow-hidden` explicitly to a `.card` wrapper is redundant (the class already has it). Adding `overflow-visible` to counteract it for dropdowns causes visual inconsistency.
**Why it happens:** The `.card` @apply definition includes `relative overflow-hidden`. Table wrappers using `.card` need to be aware that content clips at the border-radius.
**How to avoid:** Use `p-0` on the `.card` wrapper when it wraps a `<table>` directly. The table's `<thead>` and `<tbody>` provide their own spacing via `px-6 py-3/py-4` cell padding.
**Warning signs:** If the first row of a table has rounded corners clipped, the card's overflow-hidden is correct behavior — not a bug.

### Pitfall 2: `text-primary` vs `text-text-base`

**What goes wrong:** The token `text-primary` in Tailwind config maps to `var(--color-primary)` which is #1a1a2e in light mode and #fafaf7 in dark mode (inverts). The token `text-text-base` maps to `var(--color-text)` which is also #1a1a2e / #fafaf7. These are the same values but `text-primary` is documented in the UI-SPEC as for the admin header background — using it for body text creates semantic confusion.
**How to avoid:** Use `text-text-base` for all body/table cell text. Reserve `bg-primary` for the admin header background per D-02.

### Pitfall 3: Billing Settings Page — `text-primary-600` Icon Colors

**What goes wrong:** The settings page uses `text-primary-600` (subscription icon) and `text-purple-600` (tier features icon) and `text-green-600` (Stripe icon, etc.) in section headings. These are hardcoded non-semantic colors.
**Why it happens:** These icons were decorative accents — not semantic status indicators.
**How to avoid:** Replace all section heading icon colors with `text-text-secondary`. Icons are decorative here; semantic color belongs to badges and feedback states only.

### Pitfall 4: Postcard `STATUS_LABELS` Uses `color` Field, Not `badgeClass`

**What goes wrong:** The existing `STATUS_LABELS` in postcards/page.tsx uses a `color` field with inline Tailwind class strings. Other admin files (subscriptions, escrows) use inline `statusStyles` record. Neither pattern uses the established `badgeClass` field naming from Phase 4 (CONTEXT.md [Phase 04-02]).
**How to avoid:** Rename/rebuild all STATUS_LABELS to use the `badgeClass` field. Use the badge class name as the string value (e.g., `"badge-warning"`). Apply as: `<span className={statusInfo.badgeClass}>`.

### Pitfall 5: billing/settings page — `tabular-nums` on Input Fields

**What goes wrong:** The billing settings page has numeric inputs (prices, limits, days). Adding `tabular-nums` to inputs is correct for monetary inputs but may need to be applied to the `value` display text as well (the `formatLimit` display below inline inputs).
**How to avoid:** For display-only numeric text under inputs, add `tabular-nums text-xs text-text-muted`. For the inputs themselves, the `.input` class doesn't include tabular-nums by default — add it inline: `className="input tabular-nums"` for number inputs.

### Pitfall 6: Subscriptions Page — INCOMPLETE Status

**What goes wrong:** The subscriptions page has `INCOMPLETE` as a 4th status not covered in the CONTEXT.md badge mapping (D-19 through D-22 only cover ACTIVE, CANCELED, PAST_DUE, TRIALING).
**How to avoid:** Map `INCOMPLETE` to `badge-warning` (same as PENDING in escrows — signifies an unresolved intermediate state). Document this discretion decision in the plan.

### Pitfall 7: Email Templates Create Modal — Not a Headless UI Modal

**What goes wrong:** The create template modal in `email-templates/page.tsx` is a raw `fixed inset-0 z-50` div, not a Headless UI `Dialog`. This means no focus trap, no aria-modal. The postcards reject modal does use Headless UI correctly.
**How to avoid:** The existing implementation is functional and not within the scope of Phase 7 (no functionality changes). Retain the raw div modal approach for email templates create modal. Apply token swaps only: `bg-white rounded-lg shadow-xl` → `.card`; `bg-gray-50 rounded-b-lg` footer → `bg-surface-raised border-t border-border rounded-b-lg`; all inputs → `.input`; buttons → `.btn-primary` / `.btn-secondary`.

---

## Code Examples

### Token Swap Reference (Complete)

All verified from globals.css and UI-SPEC:

```tsx
// Source: apps/web/src/app/globals.css (Phase 1–2)

// Page/section headings
"text-2xl font-bold text-gray-900"  →  "text-xl font-display font-semibold text-text-base"
"text-lg font-semibold text-gray-900"  →  "text-lg font-semibold text-text-base"

// Stat values
"text-3xl font-bold text-gray-900"  →  "text-xl font-display font-semibold text-text-base tabular-nums"
"text-2xl font-bold text-gray-900"  →  "text-xl font-display font-semibold text-text-base tabular-nums"

// Body text
"text-gray-900" (body)  →  "text-text-base"
"text-gray-700"  →  "text-text-secondary"
"text-gray-600"  →  "text-text-secondary"
"text-gray-500"  →  "text-text-secondary" or "text-text-muted" (captions/metadata)
"text-gray-400"  →  "text-text-muted"

// Borders and dividers
"border-gray-200"  →  "border-border"
"divide-gray-200"  →  "divide-border"
"border-gray-100"  →  "border-border"

// Backgrounds
"bg-white"  →  "bg-surface"
"bg-gray-50"  →  "bg-surface-raised" (or remove if on thead row)
"bg-gray-100" (page bg)  →  "bg-bg"
"bg-gray-100" (element)  →  "bg-surface-raised"
"bg-gray-200" (skeleton)  →  "bg-surface-raised"

// Hover states
"hover:bg-gray-50"  →  "hover:bg-surface-raised"
"hover:bg-gray-100"  →  "hover:bg-surface-raised"

// Accent / primary tokens (broken in current admin code)
"text-primary-600"  →  "text-accent"
"text-primary-700"  →  "text-accent"
"text-primary-800"  →  "text-accent-hover" (hover state text)
"bg-primary-50"  →  "bg-accent-light"
"bg-primary-100"  →  "bg-accent-light"
"hover:bg-primary-100"  →  "hover:bg-surface-raised"
"bg-primary-600"  →  "bg-accent"
"hover:bg-primary-700"  →  "hover:bg-accent-hover"
"focus:ring-primary-500"  →  "focus:ring-accent-light" (handled by .input class)
"focus:ring-primary-600"  →  "focus:ring-accent-light"
"border-primary-600"  →  "border-accent"

// Hardcoded semantic colors (non-accent)
"text-green-600"  →  "text-success" (semantic) or "text-text-base" (non-semantic counts)
"text-green-700"  →  "text-success"
"text-yellow-600"  →  "text-warning"
"text-yellow-500"  →  "text-warning"
"text-orange-500"  →  "text-warning" or "text-text-secondary" (contextual)
"text-orange-600"  →  "text-warning"
"text-red-600"  →  "text-error"
"text-blue-600"  →  "text-accent" (if accent-semantic context) or "text-text-base"

// Card containers
"bg-white rounded-lg shadow"  →  ".card"
"bg-white rounded-lg shadow p-4"  →  ".card-compact"
"bg-white rounded-lg shadow overflow-hidden"  →  ".card p-0 overflow-hidden" (for tables)

// Admin-specific
"bg-gray-900 text-white" (header)  →  "bg-primary text-text-inverse"
"min-h-screen bg-gray-100" (outer)  →  "min-h-screen bg-bg"
"bg-white shadow-sm min-h-[...]" (sidebar)  →  "bg-surface border-r border-border min-h-[...]"
"max-w-7xl mx-auto"  →  "max-w-content mx-auto"
```

---

## Files in Scope — Complexity Breakdown

| File | Lines | Complexity | Key Work |
|------|-------|-----------|----------|
| `admin/layout.tsx` | 127 | Low | Header/sidebar token swap, add Postcards nav item |
| `admin/page.tsx` | 152 | Low | Remove rainbow colorClasses, uniform stat cards, role badge |
| `admin/users/page.tsx` | 262 | Medium | Table restyle, role/profile badges, search input → .input, pagination |
| `admin/billing/page.tsx` | 398 | Medium | Stat cards, revenue cards, feedback state, Quick Actions icon-circle removal |
| `admin/billing/subscriptions/page.tsx` | 309 | Medium | Table restyle, STATUS_LABELS → badge-*, filter .input/.card, pagination |
| `admin/billing/escrows/page.tsx` | 422 | Medium-High | Table restyle, STATUS_LABELS, monetary font-mono, expiring-soon warning, legend badges, pagination |
| `admin/billing/settings/page.tsx` | 823 | High | 7+ card sections, all inputs → .input, feature table token swap, icon colors |
| `admin/email-templates/page.tsx` | 317 | Medium | Table, empty state, create modal token swap |
| `admin/email-templates/[name]/page.tsx` | 338 | Medium | Editor form, variable hints, preview modal |
| `admin/postcards/page.tsx` | 651 | High | Stat cards, STATUS_LABELS, filter tabs, reject modal token swap |

**Total:** 3,799 lines

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — pure frontend token replacement, no new tools, services, or CLIs required).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.8 (configured for API; no frontend test framework detected) |
| Config file | No jest/vitest config found in apps/web |
| Quick run command | `pnpm --filter web build` (TypeScript compile check) |
| Full suite command | `pnpm --filter web build` |

### Phase Requirements → Test Map

Admin page styling is visual. No automated unit/integration tests exist or are needed for token replacement work. The validation strategy for this phase is build-pass + manual visual inspection.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMN-01 through ADMN-09 | Token classes render correctly, no TypeScript errors | Build check | `pnpm --filter web build` | N/A — no test files |

### Sampling Rate
- **Per task commit:** `pnpm --filter web build` — confirms no TypeScript errors introduced
- **Per wave merge:** `pnpm --filter web build`
- **Phase gate:** Build passes + visual review before `/gsd:verify-work`

### Wave 0 Gaps
None — no test infrastructure needed for visual token replacement. The build check is sufficient to catch broken imports or TypeScript errors from the restyling.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `bg-gray-*` hardcoded colors | Semantic CSS tokens (`bg-surface`, `bg-surface-raised`, `text-text-base`) | Phase 1 | Dark mode support requires semantic tokens |
| Rainbow colored stat cards | Uniform `.card` with one accent-bordered emphasis card | Phase 6 decision D-11 → Phase 7 D-06 | DESIGN.md data-forward industrial aesthetic |
| `rounded-full` badge pills | `rounded-sm` (4px) badges via `.badge-*` classes | Phase 2 | Matches DESIGN.md badge spec |
| `bg-primary-*` (broken token) | `bg-accent` / `bg-accent-light` | All phases | `primary-*` tokens don't exist in Tailwind config |
| Colored number text (green active, yellow past-due) | `text-text-base` for all aggregate counts | Phase 7 | Semantic color belongs to status badges, not counts |

**Deprecated/outdated:**
- `bg-primary-50`, `bg-primary-100`, `text-primary-600`, `text-primary-700`: These Tailwind classes don't resolve to any defined token in `tailwind.config.ts`. They appear throughout admin files as broken relics. Replace with `bg-accent-light`, `text-accent`.
- `rounded-full` on badge spans: DESIGN.md specifies `border-radius: 4px` (rounded-sm) for badges.

---

## Open Questions

1. **Postcards icon for 5th nav item**
   - What we know: Current 4 nav items use outline SVG paths. The email-templates item uses an envelope icon.
   - What's unclear: Postcards conceptually could reuse the envelope icon (letter) but that conflicts with Email Templates nav item.
   - Recommendation: Use a different icon path for Postcards. A document/postcard icon — e.g., the `M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2` clipboard path distinguishes it clearly from the envelope.

2. **Subscriptions INCOMPLETE status badge**
   - What we know: D-19 through D-22 cover ACTIVE, CANCELED, PAST_DUE, TRIALING. The subscriptions page also has INCOMPLETE in its filter options and `getStatusBadge` function.
   - What's unclear: No explicit badge mapping for INCOMPLETE in CONTEXT.md.
   - Recommendation: Map to `badge-warning` (intermediate/unresolved state, same logic as PENDING in escrows).

3. **Email templates create modal — Headless UI vs raw div**
   - What we know: The create template modal is a raw div, not Headless UI. The reject modal in postcards correctly uses Headless UI.
   - What's unclear: Should we upgrade the create modal to Headless UI for consistency?
   - Recommendation: No — Phase 7 is pure visual token replacement. Upgrading the modal implementation would be a functionality change, which is explicitly out of scope. Retain the raw div approach; apply token swaps only.

---

## Sources

### Primary (HIGH confidence)
- `apps/web/src/app/globals.css` — Verified `.card`, `.btn-*`, `.badge-*`, `.input`, `.label` class definitions; CSS variable values
- `apps/web/src/app/admin/*` — All 10 admin files read directly; current violations catalogued from actual code
- `.planning/phases/07-admin-pages/07-CONTEXT.md` — All locked decisions (D-01 through D-29)
- `.planning/phases/07-admin-pages/07-UI-SPEC.md` — Visual contract verified against CONTEXT.md decisions
- `.planning/phases/06-user-app-pages/06-CONTEXT.md` — Cross-cutting token patterns (D-20 through D-29) confirmed identical for Phase 7

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Accumulated context: Phase 2 decision on badge @apply expansion; Phase 4 badgeClass field naming; Phase 6 border-l-4 card feedback pattern

### Tertiary (LOW confidence)
- None — all research was against live project files, not external sources.

---

## Project Constraints (from CLAUDE.md)

| Directive | Enforcement |
|-----------|-------------|
| DESIGN.md is single source of truth for all visual decisions | All pattern decisions reference DESIGN.md tokens; no color values hardcoded |
| No functionality changes — existing features continue working | Token replacement only; no logic changes to API calls, state management, or event handlers |
| Tailwind CSS only — no separate CSS files | All styling via utility classes and existing globals.css component classes |
| Responsive: sm/md/lg/xl breakpoints | Table wrappers use `overflow-x-auto` with `min-w-[640px]` on tables |
| Dark mode: both themes supported | Semantic token use (bg-surface, bg-bg, text-text-base) resolves correctly via CSS variables in both :root and .dark |
| No AI slop: rainbow cards, icon-in-circle, gradient backgrounds | D-06 removes rainbow stat cards; D-27 removes Quick Actions icon circles; feedback states replace gradient/color-coded divs |
| Accessibility: WCAG AA contrast, keyboard navigation, ARIA | `.badge-*` and `.btn-*` use DESIGN.md-verified contrast ratios; Headless UI Dialog in postcards modal retained |

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all required classes exist in globals.css; verified from source
- Architecture: HIGH — all 10 files read; violations catalogued directly from code
- Pitfalls: HIGH — identified from actual code patterns (broken `primary-*` tokens, INCOMPLETE status gap, overflow-hidden table interaction)

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable — globals.css classes are locked; no external dependencies)
