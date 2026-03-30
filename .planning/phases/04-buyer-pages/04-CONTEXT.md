# Phase 4: Buyer Pages - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

The complete buyer workflow — creating a wanted ad, managing ads, and viewing postcards — renders in DESIGN.md styling. Pages in scope: `/buyer/create` (create wanted ad form), `/buyer/my-ads` (ad listing), `/buyer/postcards` (postcard requests). No new features. No backend changes. Pure visual token replacement and DESIGN.md compliance.

</domain>

<decisions>
## Implementation Decisions

### Form Layout (Create Wanted Ad)
- **D-01:** Keep multi-card section layout — separate `.card` sections for Location, Budget, Basic Info, Property Requirements. Restyle with DESIGN.md tokens only.
- **D-02:** Keep target type selection cards (General Area vs Specific Property) — restyle with `border-accent` for selected state, `border-border` for unselected, `bg-surface` backgrounds. Remove `primary-*` hardcoded colors.
- **D-03:** Property type and feature selection badges use badge-info style — `accent-light` background, `rounded-sm` (4px radius) per Phase 2 convention. Replaces current `rounded-full` pills with `bg-primary-600` active state.
- **D-04:** Location tags use badge-info tokens — `accent-light` bg, `rounded-sm` (4px). Consistent with property type badges. Replaces `rounded-full` with `primary-100/primary-800`.

### Status Badges & Indicators
- **D-05:** Postcard status badges use semantic badge variants: PENDING → badge-warning (amber), APPROVED → badge-info (accent), REJECTED/FAILED → badge-error (red), SENT/DELIVERED → badge-success (green). All with 4px border radius per DESIGN.md badge spec.
- **D-06:** Match count on My Ads cards: keep large number display with `text-accent` and `tabular-nums`, 'matches' label below in `text-secondary`. Data-forward, consistent with DESIGN.md approach.
- **D-07:** Specific address indicator: swap amber circle to `accent-light` circle with house icon. Token replacement only.
- **D-08:** Postcard allowance display: badge-info styling for 'N free left' badge, `text-secondary` for usage line, `tabular-nums` on all numbers.

### Success & Empty States
- **D-09:** Post-creation success state: keep checkmark circle + text layout. Swap `green-100/green-600` to success semantic tokens. Replace `bg-gradient-to-r from-primary-50 to-primary-100` postcard CTA box with flat `bg-surface-raised` card with `border-border`. No gradient.
- **D-10:** Empty states reuse Phase 2 EmptyState component pattern (COMP-09). Icon-in-circle acceptable in functional empty states. Swap hardcoded colors to semantic tokens.
- **D-11:** 'How Postcards Work' info section: swap `bg-gray-50` to `bg-surface-raised`, `text-gray-900` to `text-primary`, `text-gray-600` to `text-secondary`. Keep numbered list.

### Cross-Cutting Token Swaps
- **D-12:** All `max-w-3xl` / `max-w-4xl` containers swap to `max-w-site` (1120px) per Phase 3 convention.
- **D-13:** All `gray-*` hardcoded colors swap to semantic tokens (`text-primary`, `text-secondary`, `text-muted`, `bg-surface`, `bg-surface-raised`, `border-border`).
- **D-14:** All `red-*` error colors swap to `error` / `error-light` semantic tokens.
- **D-15:** All `primary-*` colors swap to `accent` / `accent-light` / `accent-hover` tokens.
- **D-16:** Loading skeletons use `bg-surface-raised` not `bg-gray-200`.
- **D-17:** All numeric displays (budget, match count, postcard cost, allowance numbers) use `tabular-nums`.

### Claude's Discretion
- Exact spacing/padding values within cards as long as they follow DESIGN.md 4px base unit
- Responsive breakpoint adjustments for the create form grid layouts
- Usage summary bar styling in create page (currently `bg-gray-50 rounded-lg`)
- Error state styling (currently `bg-red-50 border border-red-200`) — map to semantic error tokens
- Delete button styling on My Ads cards

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN.md` — Single source of truth: typography, color palette, spacing, dark mode, AI slop blacklist, badge spec
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Token values, CSS variable names, Tailwind config

### Phase Outputs (Foundation + Shared Components)
- `apps/web/tailwind.config.ts` — Semantic tokens: `bg-surface`, `text-primary`, `text-secondary`, `border-border`, `max-w-site`, badge utilities
- `apps/web/src/app/globals.css` — CSS variables, `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.badge-*` classes, `error-light`/`success-light` variables
- `apps/web/src/components/ThemeProvider.tsx` — Dark mode provider

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — BUYR-01 through BUYR-03 requirements
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria

### Codebase Reference
- `.planning/codebase/STRUCTURE.md` — File organization, page locations
- `.planning/codebase/CONVENTIONS.md` — Coding patterns, import conventions

### Prior Phase Context
- `.planning/phases/03-public-pages/03-CONTEXT.md` — Token swap patterns, max-w-site convention, semantic color decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.card` CSS class (globals.css) — Phase 2 output, already used in all 3 buyer pages
- `.btn-primary`, `.btn-secondary` CSS classes — Phase 2 output, already used
- `.input` CSS class — Phase 2 output, used for all form inputs/selects/textareas
- `.badge-info`, `.badge-warning`, `.badge-success`, `.badge-error`, `.badge-neutral` — Phase 2 output, use for status badges and selection badges
- `UpgradeModal` component — Already restyled in Phase 2 (COMP-04), used in create page
- `PostcardRequestModal` component — Already restyled in Phase 2 (COMP-04), used in create page success state
- `EmptyState` component — Restyled in Phase 2 (COMP-09), pattern to follow for empty states

### Established Patterns
- All 3 buyer pages are client components with `"use client"` and `useSession` for auth
- API calls via `fetch` with `Authorization: Bearer` header — no changes needed
- Hardcoded `gray-*`, `primary-*`, `red-*`, `green-*`, `amber-*`, `yellow-*`, `blue-*` colors throughout — all need semantic token swap
- `formatNZD` utility from `@offmarket/utils` — already formats currency, just needs `tabular-nums` on container
- `formatRelativeTime` utility — already formats dates, no changes needed

### Integration Points
- `apps/web/src/app/buyer/create/page.tsx` (766 lines) — Largest file, multi-section form + success state
- `apps/web/src/app/buyer/my-ads/page.tsx` (267 lines) — Ad listing with cards
- `apps/web/src/app/buyer/postcards/page.tsx` (298 lines) — Postcard list with status badges + info section

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within DESIGN.md spec. All decisions follow the "recommended" token swap pattern established in Phases 2 and 3.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-buyer-pages*
*Context gathered: 2026-03-30*
