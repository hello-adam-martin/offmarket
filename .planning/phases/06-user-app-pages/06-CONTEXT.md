# Phase 6: User App Pages - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

All user-facing application pages — dashboard, profile, inquiries (listing + detail/thread), notifications, upgrade/pricing, saved searches, wanted ad detail, property view, and claim flow — render in DESIGN.md styling. 10 requirements (USER-01 through USER-10), 11 files, ~3900 lines. No new features. No backend changes. Pure visual token replacement and DESIGN.md compliance.

</domain>

<decisions>
## Implementation Decisions

### Upgrade/Pricing Page
- **D-01:** Left-aligned header text (not centered). Side-by-side 2-column card grid for Free vs Pro tiers. Consistent with DESIGN.md anti-pattern: no centered hero text.
- **D-02:** Billing period toggle (Monthly/Yearly) uses `bg-surface-raised` container. Active tab gets `bg-surface` + `text-accent`. Savings badge uses `badge-success`.
- **D-03:** Feature checklist icons: available features use `text-accent` check icon, unavailable features use `text-muted` X icon with `text-muted` feature text.
- **D-04:** Pro card highlighted with `border-2 border-accent`. Small `badge-info` tag at top reading "Recommended". CTA uses `btn-primary`. Free card uses standard `card` class with `border-border`.
- **D-05:** Success/canceled/error alert banners: success uses `bg-success-light border-success text-success`, canceled uses `bg-warning-light border-warning text-warning` (if available, else `badge-warning` pattern), error uses `bg-error-light border-error text-error`.
- **D-06:** Price numbers use `tabular-nums` and `font-bold`.

### Inquiry Thread UI
- **D-07:** Message bubbles: own messages use `bg-accent text-white`, other's messages use `bg-surface-raised text-primary`. Timestamps in `text-muted`.
- **D-08:** Accept button uses `badge-success` styling (bg-success-light, text-success, rounded-sm). Decline button uses `badge-error` styling (bg-error-light, text-error, rounded-sm). "Mark Complete" uses `btn-secondary`.
- **D-09:** User avatar fallback circle uses `bg-accent-light text-accent` (replaces `bg-primary-100 text-primary-600`).
- **D-10:** Status badges in inquiry listing and detail use existing `badge-*` classes mapped to inquiry status (PENDING: `badge-warning`, ACCEPTED: `badge-success`, DECLINED: `badge-error`, COMPLETED: `badge-neutral`).

### Dashboard
- **D-11:** Free-user upgrade CTA card: flat `card` + `border-l-4 border-accent`. No gradient (removes `bg-gradient-to-r from-purple-50 via-primary-50 to-accent-50` — AI slop violation). Progress bar uses `bg-accent` fill. "Free Plan" uses `badge-neutral`. Usage warning uses `badge-warning` or `badge-error` based on remaining count.
- **D-12:** Quick action links use `bg-surface` with `border-border`, on hover `border-accent` transition. Text in `text-primary` / `text-secondary`. Arrow icon in `text-muted`.
- **D-13:** Pro member badge uses `badge-info` class (accent-light background, rounded-sm 4px). Replaces `bg-primary-100 text-primary-700 rounded-full`.
- **D-14:** Usage progress bar: full uses `bg-error`, high (>=66%) uses `bg-warning`, normal uses `bg-accent`. Track uses `bg-surface-raised`.

### Claim Flow
- **D-15:** Remove all full-screen gradient backgrounds (`bg-gradient-to-br from-primary-50 to-white`, `from-green-50 to-primary-50`, etc.). Use standard `bg-background` page background.
- **D-16:** Use standard site Header and Footer (not standalone mini header). Page content in `max-w-content` container. Consistent navigation experience.
- **D-17:** Remove all icon-in-circle patterns (AI slop blacklist). Success state: `card` with `border-l-4 border-success`, inline icon, left-aligned text. Error state: `card` with `border-l-4 border-error`. No `rounded-full` icon containers.
- **D-18:** Replace `rounded-2xl shadow-xl` cards with standard `.card` class (8px border-radius, no heavy shadow).
- **D-19:** Claim code displayed with `font-mono tabular-nums` (JetBrains Mono).

### Cross-Cutting Token Swaps (All Pages)
- **D-20:** All `max-w-3xl` / `max-w-4xl` / `max-w-md` containers swap to `max-w-content` (1120px) per established pattern.
- **D-21:** All `gray-*` hardcoded colors swap to semantic tokens (`text-primary`, `text-secondary`, `text-muted`, `bg-surface`, `bg-surface-raised`, `border-border`).
- **D-22:** All `red-*` error colors swap to `error` / `error-light` semantic tokens.
- **D-23:** All `primary-*` colors swap to `accent` / `accent-light` / `accent-hover` tokens.
- **D-24:** All `green-*` colors swap to `success` / `success-light` semantic tokens or `text-accent` depending on context.
- **D-25:** All `yellow-*` / `amber-*` colors swap to `warning` / `warning-light` semantic tokens.
- **D-26:** All `purple-*` / `indigo-*` / `sky-*` / `blue-*` hardcoded colors removed and replaced with semantic tokens.
- **D-27:** Loading skeletons use `bg-surface-raised` not `bg-gray-200`.
- **D-28:** All numeric displays (prices, counts, percentages, claim codes) use `tabular-nums`.
- **D-29:** All `rounded-full` on non-avatar elements reviewed — badges use `rounded-sm` (4px) per DESIGN.md.

### Claude's Discretion
- Exact spacing/padding values within cards as long as they follow DESIGN.md 4px base unit
- Responsive breakpoint adjustments for dashboard grid, pricing cards, and inquiry thread
- Profile page form field layout — follow established `.input` and `.card` section patterns from Phases 4-5
- Notifications page list item styling — follow established list patterns
- Saved searches page card/list layout — follow established patterns
- Wanted ad detail page — follow Phase 5 property detail patterns for match display, demand data
- Property view page — follow Phase 5 property detail patterns
- Back link styling on detail pages
- Empty state patterns — reuse Phase 2 EmptyState component pattern (COMP-09)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN.md` — Single source of truth: typography, color palette, spacing, dark mode, AI slop blacklist, badge spec
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Token values, CSS variable names, Tailwind config

### Phase Outputs (Foundation + Shared Components)
- `apps/web/tailwind.config.ts` — Semantic tokens: `bg-surface`, `text-primary`, `text-secondary`, `border-border`, `max-w-content`, badge utilities
- `apps/web/src/app/globals.css` — CSS variables, `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.badge-*` classes, `error-light`/`success-light`/`warning-light` variables

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — USER-01 through USER-10 requirements
- `.planning/ROADMAP.md` — Phase 6 goal and success criteria

### Codebase Reference
- `.planning/codebase/STRUCTURE.md` — File organization, page locations
- `.planning/codebase/CONVENTIONS.md` — Coding patterns, import conventions

### Prior Phase Context
- `.planning/phases/04-buyer-pages/04-CONTEXT.md` — Token swap patterns, badge conventions, max-w-content, tabular-nums decisions
- `.planning/phases/05-owner-pages/05-CONTEXT.md` — Demand panel, match score, property detail patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.card` CSS class (globals.css) — Phase 2 output, already used in dashboard and inquiry pages
- `.btn-primary`, `.btn-secondary` CSS classes — Phase 2 output, already used
- `.input` CSS class — Phase 2 output, used in inquiry reply form and profile page
- `.badge-info`, `.badge-warning`, `.badge-success`, `.badge-error`, `.badge-neutral` — Phase 2 output, use for status badges, plan badges, feature tags
- `EmptyState` component — Restyled in Phase 2 (COMP-09), pattern to follow for empty notifications/inquiries/saved searches
- `ContactBuyerModal` — Already restyled in Phase 2 (COMP-04)
- `Header` / `Footer` — Already restyled in Phase 2 (COMP-01, COMP-02), claim page should use these

### Established Patterns
- All user app pages are client components with `"use client"` and `useSession` for auth
- API calls via `fetch` with `Authorization: Bearer` header — no changes needed
- Hardcoded `gray-*`, `primary-*`, `red-*`, `green-*`, `blue-*`, `purple-*` colors throughout — all need semantic token swap
- `formatNZD` utility from `@offmarket/utils` — already formats currency, just needs `tabular-nums` on container
- `formatRelativeTime` utility — already formats dates, no changes needed
- STATUS_LABELS dictionary pattern from Phase 4 — inquiry status should follow same `badgeClass` field approach
- Phase 5 demand panel and match score patterns directly applicable to wanted ad detail page

### Integration Points
- `apps/web/src/app/dashboard/page.tsx` (191 lines) — Server component wrapper
- `apps/web/src/app/dashboard/DashboardClient.tsx` (175 lines) — Client component with subscription/usage display
- `apps/web/src/app/profile/page.tsx` (304 lines) — Profile/settings form
- `apps/web/src/app/inquiries/page.tsx` (229 lines) — Inquiry listing
- `apps/web/src/app/inquiries/[id]/page.tsx` (353 lines) — Inquiry detail/thread with messaging
- `apps/web/src/app/notifications/page.tsx` (323 lines) — Notification list with type filtering
- `apps/web/src/app/upgrade/page.tsx` (459 lines) — Pricing/upgrade page (most complex layout)
- `apps/web/src/app/saved-searches/page.tsx` (350 lines) — Saved search management
- `apps/web/src/app/claim/[code]/page.tsx` (391 lines) — Postcard claim flow (most AI slop violations)
- `apps/web/src/app/wanted/[id]/page.tsx` (889 lines) — Wanted ad detail with matches (largest file)
- `apps/web/src/app/property/[address]/page.tsx` (248 lines) — Public property view

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within DESIGN.md spec. All decisions follow the established token swap and AI slop removal patterns from Phases 2-5.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-user-app-pages*
*Context gathered: 2026-03-30*
