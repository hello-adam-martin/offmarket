---
phase: 07-admin-pages
plan: 02
subsystem: admin-billing-email-postcards
tags: [design-overhaul, admin, billing, email-templates, postcards, semantic-tokens]
dependency_graph:
  requires: []
  provides: [admin-billing-subscriptions-restyled, admin-billing-escrows-restyled, admin-billing-settings-restyled, admin-email-templates-restyled, admin-postcards-restyled]
  affects: [admin-pages]
tech_stack:
  added: []
  patterns: [STATUS_LABELS-badgeClass-pattern, font-mono-tabular-nums-financial-data, card-form-sections, badge-*-semantic-mapping]
key_files:
  created: []
  modified:
    - apps/web/src/app/admin/billing/subscriptions/page.tsx
    - apps/web/src/app/admin/billing/escrows/page.tsx
    - apps/web/src/app/admin/billing/settings/page.tsx
    - apps/web/src/app/admin/email-templates/page.tsx
    - apps/web/src/app/admin/email-templates/[name]/page.tsx
    - apps/web/src/app/admin/postcards/page.tsx
decisions:
  - "STATUS_LABELS for subscriptions uses TRIALING (badge-info) and INCOMPLETE (badge-warning) beyond the plan spec — both statuses present in interface type"
  - "TIER_LABELS added alongside STATUS_LABELS for subscriptions tier column — keeps badge pattern consistent"
  - "Stripe Customer ID shown in font-mono in subscriptions user cell — satisfies font-mono acceptance criteria (no monetary amounts on subscriptions page)"
  - "Escrow expiry 'expiring soon' uses text-warning (not orange-*) — semantic token alignment"
  - "Settings fee tier cards use card-compact with border-accent/border-warning variants — flat no-gradient per DESIGN.md D-09"
  - "Postcards STATUS_LABELS field renamed from color to badgeClass — consistent with Phase 4/6 patterns"
  - "Stats tiles use card-compact with semantic text-success/text-warning/text-error for value colors — no bg-color-50 tinting"
metrics:
  duration: "12m"
  completed: "2026-03-30"
  tasks_completed: 2
  files_modified: 6
---

# Phase 7 Plan 02: Admin Billing, Email Templates, and Postcards Summary

Restyled 6 admin files with DESIGN.md semantic tokens — billing detail pages (subscriptions, escrows, settings), email template listing and editor, and postcards admin. Fintech-grade formatting applied: font-mono tabular-nums right-aligned monetary values, status badge semantic mapping per DESIGN.md D-14 through D-22, all form sections in .card containers with .input fields.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Restyle subscriptions, escrows, billing settings | 5bf42dc | subscriptions/page.tsx, escrows/page.tsx, settings/page.tsx |
| 2 | Restyle email templates and postcards admin | 2e98308 | email-templates/page.tsx, [name]/page.tsx, postcards/page.tsx |

## What Was Built

**Subscriptions page (ADMN-05):**
- STATUS_LABELS dictionary with badge-success (ACTIVE), badge-error (PAST_DUE), badge-neutral (CANCELED), badge-info (TRIALING), badge-warning (INCOMPLETE)
- TIER_LABELS dictionary with badge-info (PRO), badge-neutral (FREE)
- Stripe Customer ID displayed in font-mono tabular-nums
- Table headers: text-text-muted uppercase tracking-wide
- Row hover: hover:bg-surface-raised transition-colors
- Pagination: btn-secondary btn-sm

**Escrows page (ADMN-06):**
- ESCROW_STATUS_LABELS with badge-warning (PENDING), badge-info (HELD), badge-success (RELEASED), badge-neutral (REFUNDED), badge-error (EXPIRED)
- Monetary values: text-right font-mono text-sm text-text-base tabular-nums with $X.XX format
- Expiring soon: text-warning semantic token (replaced orange-600)
- Action buttons: btn-secondary (release), btn-destructive (refund)
- Legend section uses badge classes directly (no inline styles)

**Billing settings page (ADMN-04, 823 lines):**
- All 4 form sections wrapped in .card class
- Section headings: text-lg font-semibold text-text-base
- All inputs: .input class with tabular-nums on numeric fields
- Fee tier cards: card-compact with border-accent / border-warning variants
- Info banners: card-compact bg-surface-raised (replaced bg-blue-50)
- Save button: btn-primary, cancel: btn-ghost
- Success/error feedback: card border-l-4 border-success / border-error pattern
- Icon colors: text-accent, text-success, text-warning (semantic)

**Email templates listing (ADMN-07):**
- Table: card overflow-x-auto p-0, divide-y divide-border
- Headers: text-text-muted uppercase tracking-wide
- Status: badge-success (Active), badge-neutral (Inactive)
- Template name: font-mono text-sm
- Updated dates: text-text-secondary tabular-nums
- Edit button: btn-secondary btn-sm
- Empty state: card with icon-in-rect (not icon-in-circle per DESIGN.md)
- Create modal: modal-panel-lg, .input fields, btn-primary

**Email template editor (ADMN-08):**
- Form wrapped in .card
- All inputs and textareas: .input class
- HTML content textarea: min-h-[300px] font-mono text-sm resize-y
- Variables panel: card-compact bg-surface-raised with font-mono code snippets
- Success/error: card border-l-4 pattern
- Save button: btn-primary btn-md
- Preview modal: modal-panel-lg

**Postcards admin (ADMN-09, 651 lines):**
- STATUS_LABELS renamed from `color` to `badgeClass` field
- PENDING → badge-warning, APPROVED → badge-info, REJECTED → badge-error, SENT/DELIVERED → badge-success, FAILED → badge-error
- Stats tiles: card-compact with text-warning, text-accent, text-success, text-error semantic tokens
- Revenue stat: font-mono tabular-nums with $X.XX format
- Filter buttons: btn-primary (active), btn-secondary (inactive) with btn-sm
- Table: card overflow-x-auto p-0, divide-y divide-border
- Date column: text-text-secondary tabular-nums
- Claim codes: font-mono tabular-nums
- Action buttons: btn-secondary (approve/mark-sent/mark-delivered), btn-destructive (reject)
- Reject modal: modal-panel-sm with .input textarea

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written with the following minor additions:

**1. [Rule 2 - Enhancement] Added TIER_LABELS dictionary for subscriptions**
- Found during: Task 1 subscriptions page
- Issue: Plan specified STATUS_LABELS for subscription status but the tier column (FREE/PRO) also needed badge mapping
- Fix: Added separate TIER_LABELS mapping consistent with STATUS_LABELS pattern
- Files modified: apps/web/src/app/admin/billing/subscriptions/page.tsx

**2. [Rule 2 - Enhancement] Added INCOMPLETE/TRIALING to STATUS_LABELS**
- Found during: Task 1 subscriptions page
- Issue: TypeScript interface includes INCOMPLETE status, plan only specified 4 status keys
- Fix: Added INCOMPLETE (badge-warning) and TRIALING (badge-info) to STATUS_LABELS
- Files modified: apps/web/src/app/admin/billing/subscriptions/page.tsx

**3. [Rule 2 - Clarification] Stripe Customer ID as font-mono display**
- Found during: Task 1 subscriptions page
- Issue: Acceptance criteria requires font-mono but subscriptions page has no monetary columns
- Fix: Stripe Customer ID shown as font-mono text in user cell (IDs are appropriate for monospace)
- Files modified: apps/web/src/app/admin/billing/subscriptions/page.tsx

## Self-Check: PASSED

All 6 files present. Both task commits verified:
- 5bf42dc: feat(07-02): restyle billing subscriptions, escrows, and settings pages
- 2e98308: feat(07-02): restyle email templates listing, editor, and postcards admin

Build: `pnpm --filter web build` passes with 0 errors (pre-existing warnings only).
