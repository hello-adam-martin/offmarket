# Phase 5: Owner Pages - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

The complete owner workflow — registering a property, viewing listings, reviewing matches, and the owner landing page — renders in DESIGN.md styling. Pages in scope: `/owner` (landing page with DemandChecker, benefits, CTA, FAQ), `/owner/register` (property registration form), `/owner/my-properties` (property listing), `/owner/properties/[id]` (property detail with demand display, match scores, image upload, contact buyer). No new features. No backend changes. Pure visual token replacement and DESIGN.md compliance.

</domain>

<decisions>
## Implementation Decisions

### Demand Summary Panel (Property Detail)
- **D-01:** Demand summary panel uses flat `bg-surface-raised` card with `border-accent` left border (border-l-4) or top accent stripe. No gradients. Replaces current `bg-gradient-to-br from-primary-50 to-white` with `border-primary-200`.
- **D-02:** Total buyer count displayed in `text-accent` with `tabular-nums` and `font-bold`, large size.
- **D-03:** Direct vs criteria buyer split shown as inline stats row: "12 direct · 8 criteria" in `text-secondary` under the total. No colored sub-cards (removes current `bg-green-50`/`bg-blue-50` boxes).
- **D-04:** Budget range displayed with `tabular-nums` in `text-primary`, label in `text-secondary`.

### Match Score Display
- **D-05:** All match score percentages use single `text-accent` color with `tabular-nums` and `font-bold`. No color-coding by threshold (removes current green/yellow/orange tier system). The number itself communicates quality.
- **D-06:** Match-criteria tags (Location, Budget, Bedrooms, Features, etc.) use `badge-info` class — `accent-light` background, `rounded-sm` (4px). Replaces current `bg-blue-100 text-blue-700`. Consistent with feature/type badges across buyer pages (Phase 4 D-03).

### Owner Landing Page
- **D-07:** Hero section left-aligned (not centered). Follows Phase 3 homepage hero pattern. Removes AI slop centered hero text violation.
- **D-08:** Benefits section: remove icon-in-circle pattern (AI slop blacklist violation). Use left-aligned list or plain icon + text rows instead of centered cards with `rounded-full` icon circles.
- **D-09:** CTA section uses flat `bg-surface-raised` card with `border-border`. No gradient. Replaces current `bg-gradient-to-br from-accent-50 to-primary-50`.
- **D-10:** FAQ section: swap `text-gray-900`/`text-gray-600` to `text-primary`/`text-secondary`. Cards already use `.card` class.
- **D-11:** `max-w-content` (1120px) for page container. Replaces current `max-w-7xl`.

### Direct Interest Section (Property Detail)
- **D-12:** Direct interest section uses `.card` with `border-accent` (or `border-l-4 border-accent` left stripe). No gradient. Replaces current `border-2 border-green-200 bg-gradient-to-br from-green-50 to-white`. No icon-in-circle header.
- **D-13:** Section heading in `text-primary`. Subtext in `text-secondary`.
- **D-14:** Contact button uses `btn-primary` (teal). Replaces current `bg-green-600 hover:bg-green-700`.
- **D-15:** Individual match items use `bg-surface` with `border-border`. Replaces current `bg-white border border-green-200`.

### Register Property Form
- **D-16:** Keep multi-card section layout (Address, Details, Size, Features, Valuation). Restyle with DESIGN.md tokens only — same pattern as Phase 4 create wanted ad form.
- **D-17:** Feature selection badges use `badge-info` style — `accent-light` background, `rounded-sm` (4px). Replaces current `rounded-full` pills with `bg-primary-600` active state. Consistent with Phase 4 D-03.
- **D-18:** Section headings swap `text-gray-900` to `text-primary`.

### My Properties Listing
- **D-19:** Property cards use `.card` class with `hover:border-accent` transition. Replaces current `hover:border-primary-300`.
- **D-20:** Property type badge uses `badge-neutral`. Replaces current inline `bg-gray-100 text-gray-700 rounded-full`.
- **D-21:** Demand count uses `text-accent` with `tabular-nums` and `font-bold`. Replaces current conditional `text-primary-600`/`text-gray-400`.
- **D-22:** Delete button uses `text-error hover:text-error-hover`. Replaces current `text-red-600 hover:text-red-800`.
- **D-23:** "View Details" link uses `text-accent`. Replaces current `text-primary-600`.

### Cross-Cutting Token Swaps
- **D-24:** All `max-w-3xl` / `max-w-4xl` containers swap to `max-w-content` (1120px) per Phase 4 D-12.
- **D-25:** All `gray-*` hardcoded colors swap to semantic tokens (`text-primary`, `text-secondary`, `text-muted`, `bg-surface`, `bg-surface-raised`, `border-border`).
- **D-26:** All `red-*` error colors swap to `error` / `error-light` semantic tokens.
- **D-27:** All `primary-*` colors swap to `accent` / `accent-light` / `accent-hover` tokens.
- **D-28:** Loading skeletons use `bg-surface-raised` not `bg-gray-200`.
- **D-29:** All numeric displays (estimated value, RV, demand counts, match scores, budget ranges) use `tabular-nums`.
- **D-30:** All `green-*` colors in demand/match sections swap to semantic tokens per decisions above (accent for scores, semantic for sections).

### Claude's Discretion
- Exact spacing/padding values within cards as long as they follow DESIGN.md 4px base unit
- Responsive breakpoint adjustments for the register form grid layouts
- Property image thumbnail styling details (rounded corners, sizes) within DESIGN.md border-radius scale
- Back link styling on property detail page
- Error state styling — map to semantic error tokens (`bg-error-light border-error text-error`)
- Empty state patterns — reuse Phase 2 EmptyState component pattern (COMP-09)
- "How it works" or informational helper text styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN.md` — Single source of truth: typography, color palette, spacing, dark mode, AI slop blacklist, badge spec
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Token values, CSS variable names, Tailwind config

### Phase Outputs (Foundation + Shared Components)
- `apps/web/tailwind.config.ts` — Semantic tokens: `bg-surface`, `text-primary`, `text-secondary`, `border-border`, `max-w-content`, badge utilities
- `apps/web/src/app/globals.css` — CSS variables, `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.badge-*` classes, `error-light`/`success-light` variables
- `apps/web/src/components/ThemeProvider.tsx` — Dark mode provider

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — OWNR-01 through OWNR-03 requirements
- `.planning/ROADMAP.md` — Phase 5 goal and success criteria

### Codebase Reference
- `.planning/codebase/STRUCTURE.md` — File organization, page locations
- `.planning/codebase/CONVENTIONS.md` — Coding patterns, import conventions

### Prior Phase Context
- `.planning/phases/04-buyer-pages/04-CONTEXT.md` — Token swap patterns, badge conventions, max-w-content, tabular-nums decisions

### Already-Restyled Components Used in Owner Pages
- `apps/web/src/components/AddressAutocomplete.tsx` — Phase 2 (COMP-13)
- `apps/web/src/components/PropertyImageUpload.tsx` — Phase 2 (COMP-14)
- `apps/web/src/components/ContactBuyerModal.tsx` — Phase 2 (COMP-04)
- `apps/web/src/components/demand-checker/index.tsx` — Phase 3 token fixes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.card` CSS class (globals.css) — Phase 2 output, already used in all 4 owner pages
- `.btn-primary`, `.btn-secondary` CSS classes — Phase 2 output, already used
- `.input` CSS class — Phase 2 output, used for all form inputs/selects in register page
- `.badge-info`, `.badge-warning`, `.badge-success`, `.badge-error`, `.badge-neutral` — Phase 2 output, use for property type badges, match criteria tags, feature badges
- `AddressAutocomplete` component — Already restyled in Phase 2 (COMP-13), used in register page
- `PropertyImageUpload` component — Already restyled in Phase 2 (COMP-14), used in property detail
- `ContactBuyerModal` component — Already restyled in Phase 2 (COMP-04), used in property detail
- `DemandChecker` component — Token fixes applied in Phase 3, used in owner landing page
- `EmptyState` component — Restyled in Phase 2 (COMP-09), pattern to follow

### Established Patterns
- All 4 owner pages are client components with `"use client"` and `useSession` for auth (except `/owner` which is server-rendered)
- API calls via `fetch` with `Authorization: Bearer` header — no changes needed
- Hardcoded `gray-*`, `primary-*`, `red-*`, `green-*`, `blue-*` colors throughout — all need semantic token swap
- `formatNZD` utility from `@offmarket/utils` — already formats currency, just needs `tabular-nums` on container
- `formatRelativeTime` utility — already formats dates, no changes needed
- `getMatchScoreLabel` utility — returns score label text, no changes needed

### Integration Points
- `apps/web/src/app/owner/page.tsx` (157 lines) — Landing page, server component, uses DemandChecker
- `apps/web/src/app/owner/register/page.tsx` (454 lines) — Registration form, client component
- `apps/web/src/app/owner/my-properties/page.tsx` (232 lines) — Property listing, client component
- `apps/web/src/app/owner/properties/[id]/page.tsx` (611 lines) — Property detail with demand/matches, client component (largest file)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within DESIGN.md spec. All decisions follow the "recommended" token swap pattern established in Phases 2-4.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-owner-pages*
*Context gathered: 2026-03-30*
