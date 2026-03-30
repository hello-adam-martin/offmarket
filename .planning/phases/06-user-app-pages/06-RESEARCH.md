# Phase 6: User App Pages - Research

**Researched:** 2026-03-30
**Domain:** Next.js 15 / React 19 / Tailwind CSS — design token migration and AI slop removal
**Confidence:** HIGH

## Summary

Phase 6 is a pure visual restyling pass over 11 user-facing application files (~3900 lines). No new features, no API changes, no structural refactors — only Tailwind class replacement. The pattern is identical to Phases 2–5 and well-understood: swap hardcoded `gray-*`, `primary-*`, `red-*`, `green-*`, `blue-*`, `purple-*` color classes for semantic tokens, replace AI slop patterns (gradients, rounded-full badges, icon-in-circle, centered text), and ensure max-w-content, tabular-nums, and dark mode compliance.

The most work-intensive files are `upgrade/page.tsx` (459 lines — billing toggle, two pricing cards, FAQ, alert banners), `claim/[code]/page.tsx` (391 lines — most AI slop violations, standalone header must be replaced with site Header/Footer), and `wanted/[id]/page.tsx` (889 lines — largest file, has icon-in-circle violations and hardcoded primary-* colors throughout). The remaining 8 files are routine token swaps with known patterns.

A key finding: `STATUS_LABELS` in `apps/web/src/lib/constants.ts` still uses raw Tailwind color classes (`bg-yellow-100 text-yellow-800`, etc.) rather than the semantic `badge-*` classes established in Phase 4. This must be updated as part of Phase 6 so all inquiry status badges across the site comply. The `saved-searches/page.tsx` and `notifications/page.tsx` have `rounded-full` icon-in-circle empty-state patterns that violate the AI slop blacklist.

**Primary recommendation:** Split into 3 plans — (1) dashboard + profile + inquiries listing, (2) inquiry detail + notifications + saved searches, (3) upgrade + claim + wanted detail + property view. The upgrade and claim pages require the most surgical work due to AI slop concentration; wanted ad detail is large but straightforward token swap.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Upgrade/Pricing Page
- **D-01:** Left-aligned header text (not centered). Side-by-side 2-column card grid for Free vs Pro tiers. Consistent with DESIGN.md anti-pattern: no centered hero text.
- **D-02:** Billing period toggle (Monthly/Yearly) uses `bg-surface-raised` container. Active tab gets `bg-surface` + `text-accent`. Savings badge uses `badge-success`.
- **D-03:** Feature checklist icons: available features use `text-accent` check icon, unavailable features use `text-muted` X icon with `text-muted` feature text.
- **D-04:** Pro card highlighted with `border-2 border-accent`. Small `badge-info` tag at top reading "Recommended". CTA uses `btn-primary`. Free card uses standard `card` class with `border-border`.
- **D-05:** Success/canceled/error alert banners: success uses `bg-success-light border-success text-success`, canceled uses `bg-warning-light border-warning text-warning` (if available, else `badge-warning` pattern), error uses `bg-error-light border-error text-error`.
- **D-06:** Price numbers use `tabular-nums` and `font-bold`.

#### Inquiry Thread UI
- **D-07:** Message bubbles: own messages use `bg-accent text-white`, other's messages use `bg-surface-raised text-primary`. Timestamps in `text-muted`.
- **D-08:** Accept button uses `badge-success` styling (bg-success-light, text-success, rounded-sm). Decline button uses `badge-error` styling (bg-error-light, text-error, rounded-sm). "Mark Complete" uses `btn-secondary`.
- **D-09:** User avatar fallback circle uses `bg-accent-light text-accent` (replaces `bg-primary-100 text-primary-600`).
- **D-10:** Status badges in inquiry listing and detail use existing `badge-*` classes mapped to inquiry status (PENDING: `badge-warning`, ACCEPTED: `badge-success`, DECLINED: `badge-error`, COMPLETED: `badge-neutral`).

#### Dashboard
- **D-11:** Free-user upgrade CTA card: flat `card` + `border-l-4 border-accent`. No gradient (removes `bg-gradient-to-r from-purple-50 via-primary-50 to-accent-50` — AI slop violation). Progress bar uses `bg-accent` fill. "Free Plan" uses `badge-neutral`. Usage warning uses `badge-warning` or `badge-error` based on remaining count.
- **D-12:** Quick action links use `bg-surface` with `border-border`, on hover `border-accent` transition. Text in `text-primary` / `text-secondary`. Arrow icon in `text-muted`.
- **D-13:** Pro member badge uses `badge-info` class (accent-light background, rounded-sm 4px). Replaces `bg-primary-100 text-primary-700 rounded-full`.
- **D-14:** Usage progress bar: full uses `bg-error`, high (>=66%) uses `bg-warning`, normal uses `bg-accent`. Track uses `bg-surface-raised`.

#### Claim Flow
- **D-15:** Remove all full-screen gradient backgrounds (`bg-gradient-to-br from-primary-50 to-white`, `from-green-50 to-primary-50`, etc.). Use standard `bg-background` page background.
- **D-16:** Use standard site Header and Footer (not standalone mini header). Page content in `max-w-content` container. Consistent navigation experience.
- **D-17:** Remove all icon-in-circle patterns (AI slop blacklist). Success state: `card` with `border-l-4 border-success`, inline icon, left-aligned text. Error state: `card` with `border-l-4 border-error`. No `rounded-full` icon containers.
- **D-18:** Replace `rounded-2xl shadow-xl` cards with standard `.card` class (8px border-radius, no heavy shadow).
- **D-19:** Claim code displayed with `font-mono tabular-nums` (JetBrains Mono).

#### Cross-Cutting Token Swaps (All Pages)
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| USER-01 | Dashboard page restyled — stats, recent activity, quick actions | D-11/D-12/D-13/D-14 govern DashboardClient.tsx and dashboard/page.tsx; specific violations catalogued below |
| USER-02 | Profile/settings page restyled | Follows `.input`/`.card`/`.label` patterns established in Phase 4-5; minor gray-* token swaps, divider token swap |
| USER-03 | Inquiries listing page restyled | STATUS_LABELS refactor required (constants.ts); role badge colors; filter tab colors; unread count badge |
| USER-04 | Inquiry detail page restyled — message thread, reply form | D-07/D-08/D-09/D-10; message bubble colors; avatar fallback; action button restyle |
| USER-05 | Wanted ad detail page restyled — match list, property cards, demand data with tabular-nums | 889-line file; icon-in-circle removal; primary-* → accent; gradient card removal; tabular-nums on budget/stats |
| USER-06 | Property view page restyled | Similar violations to wanted ad detail: gradient demand card, primary-* tokens, rounded-full badges |
| USER-07 | Saved searches page restyled | icon-in-circle removal in empty state AND in list items (w-10 h-10 rounded-full); green-*/blue-* type badge; blue-50 tip box |
| USER-08 | Notifications page restyled | icon-in-circle removal in empty state AND list items; primary-* link colors; blue/purple/green icon colors |
| USER-09 | Upgrade/pricing page restyled — tier comparison, CTA buttons | D-01 through D-06; most complex layout change; centered header must go left-aligned; billing toggle restyle |
| USER-10 | Claim page restyled — postcard claim flow | D-15 through D-19; most AI slop violations in phase; standalone header/footer replacement; 4 distinct states |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.4.16 | Utility-first CSS | Project standard; all semantic tokens already configured |
| Next.js | 15.1.0 | App Router pages | Project standard |
| React | 19.0.0 | Component rendering | Project standard |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next-themes` | installed | Dark mode `.dark` class toggling | Already wired in ThemeProvider |
| `@offmarket/utils` | workspace | `formatNZD`, `formatRelativeTime`, `formatBedroomRange` | Already imported in all target files |

**No new installs required.** Phase 6 is pure restyling with the existing stack.

---

## Architecture Patterns

### Established Token Mapping (from Phases 1-5)
```
gray-100  → bg-surface-raised
gray-200  → bg-surface-raised (or border-border for dividers)
gray-300  → border-border
gray-400  → text-muted (icons)
gray-500  → text-muted
gray-600  → text-secondary
gray-700  → text-secondary
gray-900  → text-primary (or text-base in Tailwind)

primary-50   → bg-accent-light (backgrounds/tints)
primary-100  → bg-accent-light
primary-200  → border-accent (light border)
primary-300  → border-accent
primary-500  → bg-accent
primary-600  → bg-accent (text: text-accent)
primary-700  → text-accent-hover
primary-800  → text-accent-hover

green-50   → bg-success-light
green-100  → bg-success-light
green-200  → border-success (light)
green-600  → text-success
green-700  → text-success
green-800  → text-success

red-50    → bg-error-light
red-100   → bg-error-light
red-200   → border-error (light)
red-600   → text-error
red-700   → text-error
red-800   → text-error

yellow-100 / amber-100 → bg-secondary-light (warning-light not defined; use secondary-light)
yellow-700 / amber-600 → text-warning
yellow-800             → text-warning

blue-100   → bg-accent-light (use accent for info)
blue-600   → text-accent
blue-700   → text-accent
blue-800   → text-accent
blue-900   → text-primary

purple-100 → bg-surface-raised (REMOVE — AI slop)
purple-600 → text-secondary (REMOVE — use semantic)
```

**Note on warning-light:** The CSS variables file defines `--color-secondary-light: #fef3c7` (amber tint) but NOT `--color-warning-light`. The warning background tint is achieved via `bg-secondary-light`. The tailwind config maps `secondary-light` to `var(--color-secondary-light)`. Use `bg-secondary-light text-warning` for warning alert banners (D-05).

### CSS Component Classes Available
```css
/* From globals.css — use these, don't re-implement */
.card            — bg-surface rounded-lg border border-border p-6 (with grain texture)
.card-compact    — bg-surface rounded-lg border border-border p-4 (no grain)
.btn-primary     — bg-accent text-white hover:bg-accent-hover rounded-md
.btn-secondary   — bg-surface text-text-base border border-border hover:bg-surface-raised rounded-md
.btn-ghost       — text-text-secondary hover:bg-surface-raised
.btn-destructive — bg-error text-white
.input           — rounded-md border border-border bg-surface focus:border-accent
.label           — text-xs font-semibold text-text-secondary uppercase tracking-wide
.badge           — inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide
.badge-info      — bg-accent-light text-accent
.badge-success   — bg-success-light text-success
.badge-warning   — bg-secondary-light text-warning
.badge-error     — bg-error-light text-error
.badge-neutral   — bg-surface-raised text-text-secondary
.modal-backdrop, .modal-panel, .modal-panel-sm, .modal-panel-lg
```

### Pattern: STATUS_LABELS Migration
The `apps/web/src/lib/constants.ts` STATUS_LABELS currently uses raw Tailwind classes. Must be migrated to use badge component class names (following Phase 4 `badgeClass` pattern from postcards):

```typescript
// BEFORE (current — constants.ts line 40-45):
export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  ACCEPTED: { label: "Accepted", className: "bg-green-100 text-green-800" },
  DECLINED: { label: "Declined", className: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-600" },
};

// AFTER (D-10 compliant):
export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "badge-warning" },
  ACCEPTED:  { label: "Accepted",  className: "badge-success" },
  DECLINED:  { label: "Declined",  className: "badge-error" },
  COMPLETED: { label: "Completed", className: "badge-neutral" },
};

// Usage sites use `className={STATUS_LABELS[inquiry.status].className}`
// The badge-* classes already include `inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold`
// So the wrapper span can drop its own inline-flex/px/py/text-xs/font-medium classes
// and just apply the badge class directly.
```

This single change in `constants.ts` fixes all STATUS_LABELS usages in both `inquiries/page.tsx` and `inquiries/[id]/page.tsx` simultaneously.

### Pattern: Badge Usage (rounded-full → rounded-sm)
All non-avatar `rounded-full` pills must become `rounded-sm` (4px). The `.badge-*` classes already use `rounded-sm`. The violations pattern in phase 6 files:

```typescript
// WRONG (found in inquiries/page.tsx, notifications, saved-searches):
className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white"

// RIGHT — use badge class:
className="badge-info"
// or for unread counts:
className="badge badge-info"
```

### Pattern: Icon-in-Circle Removal
Per AI slop blacklist. Found in: `notifications/page.tsx` (empty state + list items), `saved-searches/page.tsx` (empty state + list items), `claim/[code]/page.tsx` (all states), `wanted/[id]/page.tsx` (address header).

```typescript
// WRONG (AI slop):
<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
  <svg className="w-6 h-6 text-gray-400" .../>
</div>

// RIGHT — inline icon, no circle container:
<svg className="w-5 h-5 text-muted shrink-0" .../>

// For empty states — follow Phase 2 EmptyState pattern:
// Icon directly in the card, no circle wrapper
```

### Pattern: Gradient Card Removal
```typescript
// WRONG (AI slop — dashboard DashboardClient.tsx line 82):
<div className="card bg-gradient-to-r from-purple-50 via-primary-50 to-accent-50 border-purple-200 mb-6">

// RIGHT (D-11):
<div className="card border-l-4 border-accent mb-6">

// WRONG (property/[address]/page.tsx line 100):
<div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200 mb-8">

// RIGHT:
<div className="card mb-8">  {/* plain card, no gradient override */}
```

### Pattern: Claim Page — Header/Footer Replacement (D-16)
The claim page currently has a standalone mini-header (lines 172-181 of claim/[code]/page.tsx). This must be replaced with the standard site Header and Footer components. The page structure becomes:
```
<>
  <Header />  {/* already restyled in Phase 2 */}
  <main className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* page content */}
  </main>
  <Footer />  {/* already restyled in Phase 2 */}
</>
```
The loading/error/submitted states also need to lose their `min-h-screen bg-gradient-to-br` wrappers.

### Pattern: max-w-content Enforcement (D-20)
All pages currently use narrow containers. Replace all with `max-w-content`:

| File | Current | Correct |
|------|---------|---------|
| dashboard/page.tsx | `max-w-7xl` | `max-w-content` |
| upgrade/page.tsx | `max-w-4xl` | `max-w-content` |
| profile/page.tsx | `max-w-2xl` | `max-w-content` |
| inquiries/page.tsx | `max-w-4xl` | `max-w-content` |
| inquiries/[id]/page.tsx | `max-w-3xl` | `max-w-content` |
| notifications/page.tsx | `max-w-2xl` | `max-w-content` |
| saved-searches/page.tsx | `max-w-3xl` | `max-w-content` |
| claim/[code]/page.tsx | `max-w-2xl`/`max-w-4xl` | `max-w-content` |
| wanted/[id]/page.tsx | `max-w-4xl` | `max-w-content` |
| property/[address]/page.tsx | `max-w-4xl` | `max-w-content` |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status badge colors | Custom bg-*/text-* combinations | `.badge-*` CSS classes | Already defined in globals.css Phase 2 |
| Empty states | New component | Follow EmptyState pattern from Phase 2 | Consistent, no icon-in-circle |
| Alert banners | Custom styled divs | `bg-success-light border-success text-success` etc. | CSS variables auto-handle dark mode |
| Loading skeletons | Custom skeleton component | `animate-pulse bg-surface-raised rounded` | Phase pattern already established |
| Dark mode | Per-component dark: variants | CSS variables in :root and .dark | Variables switch automatically |

---

## File-by-File Violation Audit

### dashboard/page.tsx (191 lines) — USER-01
**Violations found:**
- Line 14: `max-w-7xl` → `max-w-content`
- Line 16: `text-gray-900` → `text-text-base`
- Line 17: `text-gray-600` → `text-text-secondary`
- Lines 38-43: quick action links — `border-gray-200` → `border-border`, `hover:border-primary-300 hover:bg-primary-50` → `hover:border-accent hover:bg-surface-raised`
- Lines 43-44: `text-gray-900`/`text-gray-500` → `text-text-base`/`text-text-muted`
- Lines 160, 163: `text-gray-900`/`text-gray-600` → `text-text-base`/`text-text-secondary`
- Multiple: `text-gray-400` (svg arrows) → `text-text-muted`
- Multiple: `border-gray-200` → `border-border`

### DashboardClient.tsx (175 lines) — USER-01
**Violations found (AI slop):**
- Line 65: `rounded-full bg-primary-100 text-primary-700` (Pro badge) → `badge-info` (D-13)
- Line 71: `text-gray-500` → `text-text-muted`
- Line 82: `bg-gradient-to-r from-purple-50 via-primary-50 to-accent-50 border-purple-200` (GRADIENT — AI slop) → `border-l-4 border-accent` (D-11)
- Line 86: `rounded-full bg-gray-100 text-gray-700` (Free Plan badge) → `badge-neutral` (D-11)
- Lines 90-96: `rounded-full bg-red-100 text-red-700` / `bg-yellow-100 text-yellow-700` / `bg-gray-100 text-gray-700` → `badge-error` / `badge-warning` / `badge-neutral` (D-11)
- Lines 103, 106-107: `text-gray-900`/`text-gray-600` → `text-text-base`/`text-text-secondary`
- Lines 113-114: `text-gray-500` → `text-text-muted`
- Line 117: `bg-gray-200 rounded-full` (progress track) → `bg-surface-raised rounded-full` (D-14)
- Lines 119-126: progress bar fill colors `bg-red-500`/`bg-yellow-500`/`bg-primary-500` → `bg-error`/`bg-warning`/`bg-accent` (D-14)
- Lines 134-151: feature list checkmarks `text-primary-500` → `text-accent`
- Lines 134-152: `text-gray-600` → `text-text-secondary`
- Line 167: `text-primary-600 hover:text-primary-700` → `text-accent hover:text-accent-hover`

### profile/page.tsx (304 lines) — USER-02
**Violations found:**
- `max-w-2xl` → `max-w-content` (multiple instances)
- `bg-gray-200 rounded` (loading skeletons) → `bg-surface-raised rounded`
- `text-gray-900`, `text-gray-600`, `text-gray-500`, `text-gray-700` → semantic tokens
- `bg-red-50 border-red-200 rounded-lg text-red-700` (error) → `bg-error-light border-error text-error`
- `bg-green-50 border-green-200 rounded-lg text-green-700` (success) → `bg-success-light border-success text-success`
- `bg-gray-50 text-gray-500 cursor-not-allowed` (disabled email) → `bg-surface-raised text-text-muted cursor-not-allowed`
- `border-gray-200` (pt-4 divider) → `border-border`
- Label classes `block text-sm font-medium text-gray-700 mb-1` → use `.label` class
- `text-green-600` (active status) → `text-success`
- `text-primary-600 hover:text-primary-800` (links) → `text-accent hover:text-accent-hover`
- Quick link cards: `border-gray-200 hover:border-primary-300 hover:bg-primary-50` → `border-border hover:border-accent hover:bg-surface-raised` (D-12)
- Icon colors `text-primary-600` in quick links → `text-accent`
- Icon colors `text-gray-400` → `text-text-muted`

### inquiries/page.tsx (229 lines) — USER-03
**Violations found:**
- `max-w-4xl` → `max-w-content`
- `bg-gray-200` (skeletons) → `bg-surface-raised`
- `text-gray-900`, `text-gray-600`, `text-gray-500` → semantic tokens
- `bg-primary-600 text-white` (unread count badge, line 105) → `badge-info`
- Filter tabs: `bg-primary-600 text-white` (active) → `bg-surface text-accent border border-accent`; `bg-gray-100 text-gray-700 hover:bg-gray-200` (inactive) → `bg-surface-raised text-text-secondary hover:bg-surface-raised`
- `bg-red-50 border-red-200 text-red-700` (error) → `bg-error-light border-error text-error`
- Inquiry cards: `hover:border-primary-300` → `hover:border-accent`; unread state `border-primary-300 bg-primary-50` → `border-accent bg-accent-light/10`
- **Role badges (lines 178-184):** `bg-blue-100 text-blue-800` (Buyer) → `badge-info`; `bg-purple-100 text-purple-800` (Owner) → `badge-neutral`
- STATUS_LABELS className is raw Tailwind → see constants.ts refactor above (D-10)
- Unread count in list `bg-primary-600 text-white rounded-full` → `badge-info`
- `text-gray-500` (timestamp) → `text-text-muted`

### inquiries/[id]/page.tsx (353 lines) — USER-04
**Violations found:**
- `max-w-3xl` → `max-w-content`
- `bg-gray-200` (skeletons) → `bg-surface-raised`
- `text-gray-900`, `text-gray-600`, `text-gray-500` → semantic tokens
- Back link: `text-gray-600 hover:text-gray-900` → `text-text-secondary hover:text-text-base`
- STATUS_LABELS badge: `rounded-full` in wrapper span → handled by constants.ts refactor (uses className directly)
- Avatar fallback (line 251): `bg-primary-100 text-primary-600` → `bg-accent-light text-accent` (D-09)
- Accept button (line 273): `bg-green-100 text-green-700 rounded-lg hover:bg-green-200` → `badge-success` inline-flex (D-08)
- Decline button (line 278): `bg-red-100 text-red-700 rounded-lg hover:bg-red-200` → `badge-error` inline-flex (D-08)
- Mark Complete button (line 287): `bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200` → `btn-secondary btn-sm` (D-08)
- Message bubbles (lines 304-309): `bg-primary-600 text-white` (own) → `bg-accent text-white` (D-07); `bg-gray-100 text-gray-900` (other) → `bg-surface-raised text-text-base` (D-07)
- Message timestamp (lines 311-315): `text-primary-200` (own) → `text-white/70`; `text-gray-500` (other) → `text-text-muted` (D-07)
- Closed conversation message (line 347): `text-gray-500` → `text-text-muted`

### notifications/page.tsx (323 lines) — USER-08
**Violations found:**
- `max-w-2xl` → `max-w-content`
- `bg-gray-200` (skeletons) → `bg-surface-raised`
- `text-gray-900`, `text-gray-600`, `text-gray-500` → semantic tokens
- `bg-red-50 border-red-200 text-red-700` (error) → `bg-error-light border-error text-error`
- **Icon-in-circle empty state (line 221-234):** `w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center` → remove circle container, inline icon only (AI slop)
- **List item icon-in-circles (line 255):** `w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center` → remove, use bare icon
- NOTIFICATION_ICONS colors: `text-green-600`/`text-blue-600`/`text-purple-600`/`text-accent-600`/`text-gray-600` → all → `text-accent` or `text-text-muted`
- Unread notification cards: `border-primary-200 bg-primary-50` → `border-accent bg-accent-light/10` (subtle accent tint)
- Unread dot (line 269): `bg-primary-600 rounded-full w-2 h-2` → `bg-accent rounded-full w-2 h-2`
- `text-primary-600 hover:text-primary-800` (links) → `text-accent hover:text-accent-hover`
- `hover:text-red-600` (delete) → `hover:text-error`

### saved-searches/page.tsx (350 lines) — USER-07
**Violations found:**
- `max-w-3xl` → `max-w-content`
- `bg-gray-200` (skeletons) → `bg-surface-raised`
- `text-gray-900`, `text-gray-600`, `text-gray-500` → semantic tokens
- `bg-red-50 border-red-200 text-red-700` (error) → `bg-error-light border-error text-error`
- **Empty state icon-in-circle (line 202-215):** `w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100` → remove circle, inline icon (AI slop)
- **List item icon-in-circles (lines 235-240):** `flex-shrink-0 w-10 h-10 rounded-full` with `bg-green-100`/`bg-blue-100` → remove circle container (AI slop), use bare icon
- Icon colors `text-green-600`/`text-blue-600` → `text-accent`/`text-text-muted`
- Type badges (lines 281-286): `bg-green-100 text-green-700 rounded-full` and `bg-blue-100 text-blue-700 rounded-full` → `badge-success` / `badge-info` (D-29)
- `text-primary-600 hover:text-primary-800` links → `text-accent hover:text-accent-hover`
- `text-green-600` (alerts on) → `text-accent`
- `hover:text-red-600` (delete) → `hover:text-error`
- **Tip box (line 340):** `bg-blue-50 rounded-lg` / `text-blue-900` / `text-blue-800` → `bg-surface-raised rounded-lg` / `text-text-base` / `text-text-secondary`

### upgrade/page.tsx (459 lines) — USER-09
**Violations found:**
- `max-w-4xl` → `max-w-content`
- `bg-gray-200` (skeletons) → `bg-surface-raised`
- **Centered header (lines 208-218):** `text-center mb-12` → left-aligned (D-01)
- Alert banners (lines 197-224):
  - `bg-green-50 border-green-200 text-green-700 text-center` → `bg-success-light border-success text-success` (D-05, remove text-center)
  - `bg-yellow-50 border-yellow-200 text-yellow-700 text-center` → `bg-secondary-light border-warning text-warning` (D-05, remove text-center)
  - `bg-red-50 border-red-200 text-red-700 text-center` → `bg-error-light border-error text-error` (D-05, remove text-center)
- **Billing toggle (lines 228-257):** `bg-gray-100 p-1 rounded-lg` container → `bg-surface-raised p-1 rounded-md`; active: `bg-white text-gray-900 shadow-sm` → `bg-surface text-accent`; inactive: `text-gray-600` → `text-text-secondary`; savings badge: `bg-green-100 text-green-700 rounded-full` → `badge-success` (D-02)
- **Free card (line 262):** `border-2 border-primary-500` (active) → use plain `card` with `border-border`; "Current Plan" badge: `bg-primary-500 text-white rounded-full` → `badge-info` text "Current Plan"
- **Pro card (line 321):** `border-primary-500 ring-primary-100` (active) → `border-2 border-accent`; "Current Plan"/Recommended badge: → `badge-info` text "Recommended" (D-04)
- Feature check icons: `text-green-500` → `text-accent` (available); `text-gray-300` → `text-text-muted` (unavailable) (D-03)
- Unavailable feature text: `text-gray-400` → `text-text-muted` (D-03)
- `text-gray-900` price headings → `text-text-base`; `text-gray-500` unit → `text-text-muted`
- Price numbers `text-4xl font-bold` → add `tabular-nums` (D-06)
- FAQ section: `text-gray-900`/`text-gray-600` → `text-text-base`/`text-text-secondary`
- Back link: `text-primary-600 hover:text-primary-700` → `text-accent hover:text-accent-hover`; `text-center` → left or inline

### claim/[code]/page.tsx (391 lines) — USER-10
**Violations found (highest AI slop density):**
- **Loading state (line 109):** `min-h-screen bg-gradient-to-br from-primary-50 to-primary-100` → `bg-background py-8` (D-15)
  - `w-16 h-16 bg-primary-200 rounded-full` (icon-in-circle) → remove (D-17)
- **Error state (line 120):** `min-h-screen bg-gradient-to-br from-gray-50 to-gray-100` → `bg-background py-8` (D-15)
  - `max-w-md bg-white rounded-2xl shadow-xl p-8` → `max-w-content card` (D-18, D-20)
  - `w-16 h-16 bg-red-100 rounded-full flex items-center justify-center` → remove circle, `card border-l-4 border-error` (D-17)
- **Submitted state (line 143):** `min-h-screen bg-gradient-to-br from-green-50 to-primary-50` → `bg-background py-8` (D-15)
  - `max-w-md bg-white rounded-2xl shadow-xl p-8 text-center` → `max-w-content card` left-aligned (D-18, D-20)
  - `w-20 h-20 bg-green-100 rounded-full` → `card border-l-4 border-success` (D-17)
- **Main page (line 170):** `min-h-screen bg-gradient-to-br from-primary-50 to-white` → `bg-background` (D-15)
- **Standalone header (lines 172-181):** Replace with `<Header />` + `<Footer />` components (D-16)
- **Introduction card (line 185):** `bg-white rounded-2xl shadow-lg p-8` → `.card` (D-18)
  - `p-3 bg-primary-100 rounded-xl` (icon-in-circle) → remove, inline icon (D-17)
- **Property section (line 202):** `bg-gray-50 rounded-xl` → `bg-surface-raised rounded-lg`
- `text-gray-500 uppercase tracking-wider` labels → `.label` class
- `text-gray-900`/`text-gray-600`/`text-gray-500` → semantic tokens
- **Finance status badge (line 244):** `bg-green-100 text-green-800 rounded-full` → `badge-success` (D-29)
- **Custom message box (line 251):** `bg-primary-50 border border-primary-100` → `bg-accent-light border border-accent/20`
- **Claim code display:** Add `font-mono tabular-nums` to claim code (D-19, line 178: `font-mono font-medium` → add `tabular-nums`)
- Response form (lines 281-376): standalone card `bg-white rounded-2xl shadow-lg p-8` → `.card`
  - All form label classes → `.label`
  - All `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500` inputs → `.input`
  - Warning `text-amber-600 bg-amber-50 p-3 rounded-lg` → `bg-secondary-light text-warning rounded-md`
  - Error `text-red-600 bg-red-50 p-3 rounded-lg` → `bg-error-light text-error rounded-md`
- Footer info: `text-gray-500`/`text-primary-600 hover:underline` → `text-text-muted`/`text-accent hover:text-accent-hover`

### wanted/[id]/page.tsx (889 lines) — USER-05
**Key violations (first 400 lines reviewed, file continues):**
- `max-w-4xl` → `max-w-content`
- `bg-gray-200` (skeletons) → `bg-surface-raised`
- `text-gray-900`/`text-gray-600`/`text-gray-500` → semantic tokens
- Back link `text-gray-600 hover:text-gray-900` → `text-text-secondary hover:text-text-base`
- Budget `text-primary-600` → `text-accent` + add `tabular-nums` (D-28)
- Target type badge `bg-amber-100 text-amber-800 rounded-full` → `badge-warning` (D-29)
- **Icon-in-circle at address header (line 276):** `w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center` → remove circle (D-17)
- Property type badge `bg-primary-100 text-primary-800 rounded-full` → `badge-info` (D-23, D-29)
- Property stats grid `border-gray-100` → `border-border`
- Property stat values — add `tabular-nums` (D-28)
- `bg-gray-100`/`bg-gray-50` → `bg-surface-raised`
- All primary-* color references → accent tokens

### property/[address]/page.tsx (248 lines) — USER-06
**Violations found:**
- `max-w-4xl` → `max-w-content`
- Back link `text-gray-600 hover:text-gray-900` → `text-text-secondary hover:text-text-base`
- `text-gray-900`/`text-gray-600`/`text-gray-500` → semantic tokens
- **Demand overview card (line 100):** `bg-gradient-to-br from-primary-50 to-white border-primary-200` → plain `.card` (AI slop gradient removal)
- `text-primary-600` (buyer count stat) → `text-accent` + `tabular-nums`
- Budget range line `bg-gray-200 rounded-full` → `bg-surface-raised`
- Budget bar gradient `bg-gradient-to-r from-primary-300 to-primary-500` → `bg-accent` (solid, no gradient)
- `bg-primary-600 rounded-full border-2 border-white` (slider indicator) → `bg-accent rounded-full border-2 border-surface`
- `text-gray-600`/`text-primary-600` (budget labels) → `text-text-secondary`/`text-accent` + `tabular-nums`
- Property type badges `bg-primary-100 text-primary-800 rounded-full` → `badge-info`
- Bedroom requirement badges `bg-gray-100 text-gray-700 rounded-full` → `badge-neutral`
- Feature badges `bg-accent-100 text-accent-800 rounded-full` → `badge-info` (using proper badge class)
- **CTA card (line 232):** `bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200` → plain `.card border-l-4 border-accent`
- `text-gray-600`/`text-center` in CTA → `text-text-secondary`/left-aligned

---

## Common Pitfalls

### Pitfall 1: warning-light Token Does Not Exist
**What goes wrong:** Developer writes `bg-warning-light` expecting an amber tint background — this token is not in the Tailwind config or CSS variables.
**Why it happens:** DESIGN.md mentions "warning backgrounds" conceptually, but the implementation uses `secondary-light` for amber/warning backgrounds.
**How to avoid:** Use `bg-secondary-light text-warning` for warning banners and alert states. The CSS variable `--color-secondary-light: #fef3c7` is the amber tint.
**Warning signs:** Tailwind compile output with unresolved class, or missing background color in browser.

### Pitfall 2: STATUS_LABELS className Contains Inline Classes
**What goes wrong:** After updating STATUS_LABELS to use `badge-*` class names, the consuming span elements still have their old inline `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium` classes, resulting in doubled/conflicting styles.
**Why it happens:** The STATUS_LABELS className field was previously a full set of Tailwind utilities. After migration to badge class names, those utilities are provided by the CSS class itself.
**How to avoid:** When updating STATUS_LABELS, also update all usage sites — remove the inline utility classes and just apply `className={STATUS_LABELS[status].className}` directly on the badge element.

### Pitfall 3: Claim Page min-h-screen States Create Layout Shift
**What goes wrong:** The loading/error/submitted states of the claim page use `min-h-screen` with centered flex layout. Removing these changes the page height behavior.
**Why it happens:** These states were designed as standalone full-screen views. After adding Header/Footer, they should be regular page sections.
**How to avoid:** All states (loading, error, submitted, main) should render inside the same Header + content + Footer wrapper. Loading and error states become centered content within `max-w-content` container, not full-screen.

### Pitfall 4: Icon-in-Circle Removal Breaking Alignment
**What goes wrong:** Removing the `w-10 h-10 rounded-full` icon container in list items changes how the icon aligns with adjacent text.
**Why it happens:** The circle was functioning as a fixed-size alignment anchor. Bare icons need `shrink-0` to prevent flex compression.
**How to avoid:** Replace icon-in-circle with bare `<svg className="w-5 h-5 text-text-muted shrink-0" .../>`. Adjust gap spacing if needed.

### Pitfall 5: Dark Mode Blind Spots with Hardcoded Colors
**What goes wrong:** Pages use hardcoded `gray-*` colors that have no dark mode counterpart, so dark mode shows incorrect colors.
**Why it happens:** The old design predates the CSS variable system.
**How to avoid:** Every `gray-*`, `primary-*`, `green-*`, `red-*`, `yellow-*`, `blue-*`, `purple-*` class must be replaced. The semantic tokens (bg-surface, text-text-secondary, etc.) automatically adapt to dark mode via CSS variables in `.dark`.

---

## Code Examples

### Loading Skeleton (standard pattern for phase 6)
```typescript
// Source: Established pattern from Phases 2-5
if (loading) {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-surface-raised rounded w-1/3" />
        <div className="h-4 bg-surface-raised rounded w-2/3" />
        <div className="card h-32" />
        <div className="card h-24" />
      </div>
    </div>
  );
}
```

### Badge Pattern for Inquiry Status
```typescript
// Source: D-10, established by Phase 4 postcards STATUS_LABELS pattern
// constants.ts after migration:
export const STATUS_LABELS = {
  PENDING:   { label: "Pending",   className: "badge-warning" },
  ACCEPTED:  { label: "Accepted",  className: "badge-success" },
  DECLINED:  { label: "Declined",  className: "badge-error" },
  COMPLETED: { label: "Completed", className: "badge-neutral" },
};

// Usage — span no longer needs inline utilities, badge-* provides them:
<span className={STATUS_LABELS[inquiry.status].className}>
  {STATUS_LABELS[inquiry.status].label}
</span>
```

### Dashboard Upgrade CTA Card (D-11)
```typescript
// Source: D-11 decision
// BEFORE: gradient AI slop
// AFTER: left-bordered card with semantic tokens
<div className="card border-l-4 border-accent mb-6">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="badge-neutral">Free Plan</span>
        <span className={usage?.remaining === 0 ? "badge-error" : usage?.remaining <= 1 ? "badge-warning" : "badge-neutral"}>
          {/* usage text */}
        </span>
      </div>
      {/* Usage progress bar */}
      <div className="w-full bg-surface-raised rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${
          usagePercent >= 100 ? "bg-error" : usagePercent >= 66 ? "bg-warning" : "bg-accent"
        }`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
      </div>
    </div>
    <Link href="/upgrade" className="btn-primary">Upgrade to Pro</Link>
  </div>
</div>
```

### Billing Toggle (D-02)
```typescript
// Source: D-02 decision
<div className="bg-surface-raised p-1 rounded-md inline-flex">
  <button
    onClick={() => setBillingPeriod("monthly")}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      billingPeriod === "monthly"
        ? "bg-surface text-accent shadow-sm"
        : "text-text-secondary hover:text-text-base"
    }`}
  >Monthly</button>
  <button
    onClick={() => setBillingPeriod("yearly")}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      billingPeriod === "yearly"
        ? "bg-surface text-accent shadow-sm"
        : "text-text-secondary hover:text-text-base"
    }`}
  >
    Yearly
    {savings > 0 && <span className="ml-2 badge-success">Save {formatted}</span>}
  </button>
</div>
```

### Claim Page State Cards (D-15, D-17, D-18)
```typescript
// Source: D-15/D-17/D-18 decisions

// Error state — no full-screen gradient, no icon-in-circle:
if (error || !postcard) {
  return (
    <>
      <Header />
      <main className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card border-l-4 border-error">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-error shrink-0 mt-0.5" .../>
            <div>
              <h1 className="text-xl font-display font-bold text-text-base">Postcard Not Found</h1>
              <p className="text-text-secondary mt-1">{error}</p>
              <Link href="/" className="btn-primary mt-4 inline-flex">Visit OffMarket NZ</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Submitted state — success card with left border:
<div className="card border-l-4 border-success">
  <div className="flex items-start gap-3">
    <svg className="w-5 h-5 text-success shrink-0 mt-0.5" .../>
    <div>
      <h1 className="text-xl font-display font-bold text-text-base">Response Sent!</h1>
      <p className="text-text-secondary mt-1">...</p>
    </div>
  </div>
</div>
```

### Quick Action Links (D-12)
```typescript
// Source: D-12 decision
<Link
  href="/buyer/my-ads"
  className="block p-4 border border-border rounded-lg hover:border-accent hover:bg-surface-raised transition-colors"
>
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-text-base">My Interests</p>
      <p className="text-sm text-text-secondary">View and manage your buyer interests</p>
    </div>
    <svg className="w-5 h-5 text-text-muted" .../>
  </div>
</Link>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded `gray-*` Tailwind colors | Semantic CSS variable tokens (`text-text-secondary`, `bg-surface`, etc.) | Phase 1 (Foundation) | Auto dark mode support |
| `bg-primary-600` blue/teal | `bg-accent` (#0d9488 teal) | Phase 1 | Brand differentiation from NZ property sites |
| `rounded-full` on badges | `rounded-sm` (4px) per DESIGN.md | Phase 2 badge spec | Consistent brand radius system |
| Gradient backgrounds | Flat surfaces, left-border accents | Phase 3 AI slop removal | Removes generic SaaS look |
| `max-w-7xl`/`max-w-4xl` etc. | `max-w-content` (1120px) | Phase 2+ | Consistent content width |
| Icon-in-colored-circle | Bare inline icons | Phase 2+ AI slop removal | Industrial/utilitarian aesthetic |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — pure Tailwind class replacement, no new tools or services required)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.8 (API) — no frontend test framework detected |
| Config file | No frontend test config found |
| Quick run command | Visual inspection in browser |
| Full suite command | `pnpm --filter @offmarket/api test` (API tests, not relevant to UI) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| USER-01 | Dashboard stat cards with tabular-nums and DESIGN.md colors | manual | Visual inspection | N/A |
| USER-02 | Profile form uses .input/.label/.card classes | manual | Visual inspection | N/A |
| USER-03 | Inquiry list uses badge-* status labels | manual | Visual inspection | N/A |
| USER-04 | Message bubbles bg-accent/bg-surface-raised | manual | Visual inspection | N/A |
| USER-05 | Wanted ad detail — no icon-in-circle, correct tokens | manual | Visual inspection | N/A |
| USER-06 | Property view — no gradient demand card | manual | Visual inspection | N/A |
| USER-07 | Saved searches — no rounded-full badges | manual | Visual inspection | N/A |
| USER-08 | Notifications — no icon-in-circle containers | manual | Visual inspection | N/A |
| USER-09 | Upgrade page — left-aligned header, DESIGN.md cards | manual | Visual inspection | N/A |
| USER-10 | Claim page — standard Header/Footer, no gradients | manual | Visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `pnpm dev` + visual page check in browser
- **Per wave merge:** Full page review in both light and dark mode
- **Phase gate:** All 10 pages visually compliant before `/gsd:verify-work`

### Wave 0 Gaps
None — this is a restyling phase with no test infrastructure requirements. No new test files needed.

---

## Open Questions

1. **warning-light CSS variable**
   - What we know: `--color-warning-light` is NOT in globals.css. D-05 references it for canceled alert banners.
   - What's unclear: D-05 says "if available, else `badge-warning` pattern" suggesting awareness of the gap.
   - Recommendation: Use `bg-secondary-light` (maps to `--color-secondary-light: #fef3c7`) for warning backgrounds. This is the amber tint that DESIGN.md defines as "Secondary Light". No need to add a new CSS variable.

2. **Filter tabs in inquiries/page.tsx — active state**
   - What we know: Current active state is `bg-primary-600 text-white`. D-10 doesn't specify the filter tab restyle.
   - What's unclear: Should active filter tab use solid teal fill or outlined/text approach?
   - Recommendation: Follow the established pattern from Phase 4 buyer pages — active filter uses `bg-surface text-accent border border-accent`, inactive uses `bg-surface-raised text-text-secondary hover:text-text-base`.

3. **Notification icon colors after removing icon-in-circle**
   - What we know: NOTIFICATION_ICONS use `text-green-600`/`text-blue-600`/`text-purple-600` icon colors for different notification types.
   - What's unclear: After removing circles, should each type have a distinct icon color, or all uniform?
   - Recommendation: Use `text-accent` for actionable notifications (NEW_MATCH, NEW_INQUIRY, INQUIRY_RESPONSE, PROPERTY_INTEREST) and `text-text-muted` for SYSTEM. This maintains semantic meaning while eliminating non-design-system colors.

---

## Sources

### Primary (HIGH confidence)
- `apps/web/src/app/globals.css` — All CSS component classes (.card, .btn-*, .badge-*, .input, .label, .modal-*)
- `apps/web/tailwind.config.ts` — All semantic color tokens and their CSS variable mappings
- `DESIGN.md` — Aesthetic direction, AI slop blacklist, color values, typography scale
- `.planning/phases/06-user-app-pages/06-CONTEXT.md` — All locked decisions D-01 through D-29

### Secondary (MEDIUM confidence)
- `apps/web/src/app/inquiries/page.tsx`, `apps/web/src/app/inquiries/[id]/page.tsx` — Current violation inventory verified by direct code read
- `apps/web/src/app/dashboard/DashboardClient.tsx`, `dashboard/page.tsx` — Current violation inventory verified
- `apps/web/src/app/upgrade/page.tsx` — Current violation inventory verified
- `apps/web/src/app/claim/[code]/page.tsx` — Current violation inventory verified
- `apps/web/src/app/notifications/page.tsx`, `saved-searches/page.tsx` — Current violation inventory verified
- `apps/web/src/app/profile/page.tsx` — Current violation inventory verified
- `apps/web/src/app/property/[address]/page.tsx` — Current violation inventory verified
- `apps/web/src/lib/constants.ts` — STATUS_LABELS current state verified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all tokens verified in globals.css and tailwind.config.ts
- Architecture: HIGH — token mapping verified against CSS variable values; patterns established in Phases 2-5
- Pitfalls: HIGH — all pitfalls derived from direct code inspection; warning-light gap confirmed by reading CSS file
- Violation inventory: HIGH — all 11 files read directly; violations catalogued line-by-line

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable — no external library changes affect this phase)
