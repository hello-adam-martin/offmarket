# Phase 5: Owner Pages - Research

**Researched:** 2026-03-30
**Domain:** Tailwind CSS token replacement — Next.js App Router pages (owner workflow)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Demand Summary Panel (Property Detail)**
- D-01: Demand summary panel uses flat `bg-surface-raised` card with `border-l-4 border-accent` left border. No gradients. Replaces `bg-gradient-to-br from-primary-50 to-white` with `border-primary-200`.
- D-02: Total buyer count displayed in `text-accent` with `tabular-nums` and `font-bold`, large size.
- D-03: Direct vs criteria buyer split shown as inline stats row: "12 direct · 8 criteria" in `text-secondary` under the total. No colored sub-cards (removes current `bg-green-50`/`bg-blue-50` boxes).
- D-04: Budget range displayed with `tabular-nums` in `text-primary`, label in `text-secondary`.

**Match Score Display**
- D-05: All match score percentages use single `text-accent` color with `tabular-nums` and `font-bold`. No color-coding by threshold (removes current green/yellow/orange tier system).
- D-06: Match-criteria tags (Location, Budget, Bedrooms, Features, etc.) use `badge-info` class — `accent-light` background, `rounded-sm` (4px). Replaces current `bg-blue-100 text-blue-700`.

**Owner Landing Page**
- D-07: Hero section left-aligned (not centered). Follows Phase 3 homepage hero pattern. Removes centered hero text.
- D-08: Benefits section: remove icon-in-circle pattern (AI slop blacklist violation). Use left-aligned list or plain icon + text rows — `flex items-start gap-4`, plain Lucide icon (24px, text-accent), no `rounded-full` icon circles.
- D-09: CTA section uses flat `bg-surface-raised` card with `border-border`. No gradient. Replaces `bg-gradient-to-br from-accent-50 to-primary-50`.
- D-10: FAQ section: swap `text-gray-900`/`text-gray-600` to `text-primary`/`text-secondary`. Cards already use `.card` class.
- D-11: `max-w-content` (1120px) for page container. Replaces current `max-w-7xl`.

**Direct Interest Section (Property Detail)**
- D-12: Direct interest section uses `.card` with `border-l-4 border-accent`. No gradient. Replaces `border-2 border-green-200 bg-gradient-to-br from-green-50 to-white`. No icon-in-circle header.
- D-13: Section heading in `text-primary`. Subtext in `text-secondary`.
- D-14: Contact button uses `btn-primary` (teal). Replaces `bg-green-600 hover:bg-green-700`.
- D-15: Individual match items use `bg-surface border border-border`. Replaces `bg-white border border-green-200`.

**Register Property Form**
- D-16: Keep multi-card section layout (Address, Details, Size, Features, Valuation). Restyle with DESIGN.md tokens only.
- D-17: Feature selection badges use `badge-info` style — `accent-light` background, `rounded-sm` (4px). Replaces `rounded-full` pills with `bg-primary-600` active state.
- D-18: Section headings swap `text-gray-900` to `text-primary`.

**My Properties Listing**
- D-19: Property cards use `.card` class with `hover:border-accent transition-colors`. Replaces `hover:border-primary-300`.
- D-20: Property type badge uses `badge-neutral`. Replaces inline `bg-gray-100 text-gray-700 rounded-full`.
- D-21: Demand count uses `text-accent` with `tabular-nums` and `font-bold`. Replaces conditional `text-primary-600`/`text-gray-400`.
- D-22: Delete button uses `text-error hover:text-error-hover`. Replaces `text-red-600 hover:text-red-800`.
- D-23: "View Details" link uses `text-accent`. Replaces `text-primary-600`.

**Cross-Cutting Token Swaps**
- D-24: All `max-w-3xl` / `max-w-4xl` containers swap to `max-w-content` (1120px).
- D-25: All `gray-*` hardcoded colors swap to semantic tokens (`text-primary`, `text-secondary`, `text-muted`, `bg-surface`, `bg-surface-raised`, `border-border`).
- D-26: All `red-*` error colors swap to `error` / `error-light` semantic tokens.
- D-27: All `primary-*` colors swap to `accent` / `accent-light` / `accent-hover` tokens.
- D-28: Loading skeletons use `bg-surface-raised` not `bg-gray-200`.
- D-29: All numeric displays use `tabular-nums`.
- D-30: All `green-*` colors in demand/match sections swap to semantic tokens per decisions above.

### Claude's Discretion
- Exact spacing/padding values within cards as long as they follow DESIGN.md 4px base unit
- Responsive breakpoint adjustments for the register form grid layouts
- Property image thumbnail styling details (rounded corners, sizes) within DESIGN.md border-radius scale
- Back link styling on property detail page
- Error state styling — map to semantic error tokens (`bg-error-light border-error text-error`)
- Empty state patterns — reuse Phase 2 EmptyState component pattern (COMP-09)
- "How it works" or informational helper text styling

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OWNR-01 | Register property page restyled — form layout, image upload, address fields | Token swap map, feature badge pattern, section card pattern documented below |
| OWNR-02 | My properties listing page restyled | Card hover pattern, badge-neutral, demand count tabular-nums, inline delete confirm pattern documented below |
| OWNR-03 | Property detail page restyled — demand display, match scores, inquiry actions | Demand panel flat card pattern, match score single-color pattern, direct interest card pattern, criteria tag badge-info documented below |
</phase_requirements>

---

## Summary

Phase 5 is a pure visual token replacement phase — no new features, no API changes, no new dependencies. The owner workflow covers 4 pages: the landing page (`/owner`), the register form (`/owner/register`), the property listing (`/owner/my-properties`), and the property detail page (`/owner/properties/[id]`). All styling infrastructure needed (CSS variables, Tailwind tokens, component classes) was established in Phases 1-2 and is confirmed present in `globals.css` and `tailwind.config.ts`.

The primary work is systematic replacement of hardcoded color classes (`gray-*`, `primary-*`, `green-*`, `blue-*`, `red-*`) with semantic tokens, removal of gradient backgrounds, removal of icon-in-circle patterns, and restructuring of the demand summary panel and match score display to the flat, data-forward DESIGN.md spec. The property detail page (`611 lines`) is the most complex file — it contains three separate areas requiring structural changes (demand panel, direct interest section, criteria match rows) rather than pure token swaps.

**Primary recommendation:** Work page-by-page from simplest to most complex: `/owner` (landing, structural changes to benefits + CTA), `/owner/register` (form, mostly token swaps + feature badge pattern), `/owner/my-properties` (listing, token swaps + inline delete confirm), `/owner/properties/[id]` (detail, structural changes to demand panel + direct interest section).

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.4.16 | All styling via utility classes | Project constraint per CLAUDE.md |
| Next.js | 15.1.0 | App Router pages | Existing framework |
| React | 19.0.0 | Component rendering | Existing framework |
| Headless UI | 2.2.9 | Accessible modal primitives | Already used for ContactBuyerModal |
| Lucide React | (in use) | Icon replacement for SVG icon-in-circle pattern | Already in use across codebase |

### Supporting (already available)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@offmarket/utils` | workspace | `formatNZD`, `formatRelativeTime`, `getMatchScoreLabel` | Wrapping numeric displays in `tabular-nums` container |
| `next-auth/react` | 5.0.0-beta.25 | Session access | All client pages use `useSession` |

### No New Installations Required

This phase requires zero new packages. All CSS classes, tokens, and components needed are already present.

---

## Architecture Patterns

### Token Mapping Reference

The Tailwind config maps semantic names to CSS variables. The following mappings are confirmed in `tailwind.config.ts` and `globals.css`:

```
text-primary          → var(--color-primary)     → #1a1a2e / dark: #fafaf7
text-secondary        → var(--color-text-secondary) → #6b7280 / dark: #9ca3af
text-muted            → var(--color-text-muted)   → #9ca3af / dark: #6b7280
text-accent           → var(--color-accent)        → #0d9488 / dark: #0b8276
text-error            → var(--color-error)          → #dc2626
bg-surface            → var(--color-surface)       → #ffffff / dark: #1a1a2e
bg-surface-raised     → var(--color-surface-raised) → #f5f5f0 / dark: #252540
bg-accent-light       → var(--color-accent-light)  → #ccfbf1 / dark: #134e4a
bg-error-light        → var(--color-error-light)   → #fee2e2 / dark: #7f1d1d
border-border         → var(--color-border)        → #e5e5e0 / dark: #374151
border-accent         → var(--color-accent)        → #0d9488
max-w-content         → 1120px
```

**Critical note:** In `tailwind.config.ts` the color key for body text is `"text-base": "var(--color-text)"`. This means the Tailwind class is `text-text-base`, NOT `text-primary`. However, the color key `"primary": "var(--color-primary)"` also exists — so `text-primary` uses `--color-primary` (#1a1a2e in light, #fafaf7 in dark). Both are used as `text-primary` in Phase 4 buyer pages and work correctly for headings. This is confirmed as the established pattern.

### Pattern 1: Flat Card with Left Accent Border

Used for demand summary panel (D-01) and direct interest section (D-12).

```tsx
// Source: 05-CONTEXT.md D-01, D-12
<div className="card border-l-4 border-accent">
  {/* content */}
</div>
```

**Important:** The `.card` class from `globals.css` applies `border border-border`. Adding `border-l-4 border-accent` overrides the left border. The `border-l-4` utility sets only the left border width, while `border-accent` sets the left border color. The three other sides remain `border-border` from the `.card` class — this works correctly in Tailwind CSS (border-side utilities are independent).

### Pattern 2: Feature/Type Toggle Badges

Used in register form features section (D-17) and consistent with Phase 4 D-03.

```tsx
// Source: 05-CONTEXT.md D-17, Phase 4 D-03 (established pattern)
<button
  type="button"
  onClick={() => toggleFeature(feature.value)}
  className={
    features.includes(feature.value)
      ? "badge-info cursor-pointer"
      : "badge-neutral cursor-pointer hover:bg-surface-raised"
  }
>
  {feature.label}
</button>
```

Active state: `badge-info` (accent-light background, accent text, rounded-sm).
Inactive state: `badge-neutral` (surface-raised background, secondary text).
No `rounded-full`. No `bg-primary-600`.

### Pattern 3: Inline Delete Confirm State

The UI-SPEC requires inline confirm state (not `window.confirm()`) for delete on `/owner/my-properties`. Current code uses `window.confirm()`. This is a small structural change — add a `confirmDeleteId` state variable.

```tsx
// Source: 05-UI-SPEC.md delete confirmation contract
const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

// In the card actions area:
{confirmDeleteId === property.id ? (
  <span className="text-sm text-secondary">
    Are you sure?{" "}
    <button
      onClick={(e) => { e.preventDefault(); deleteProperty(property.id); }}
      className="text-error hover:text-error-hover font-medium"
    >
      Yes, delete
    </button>
    {" · "}
    <button
      onClick={(e) => { e.preventDefault(); setConfirmDeleteId(null); }}
      className="text-secondary hover:text-primary"
    >
      Keep
    </button>
  </span>
) : (
  <button
    onClick={(e) => { e.preventDefault(); setConfirmDeleteId(property.id); }}
    className="text-sm text-error hover:text-error-hover"
  >
    Delete
  </button>
)}
```

### Pattern 4: Benefits Section (AI Slop Removal)

The current benefits section uses icon-in-colored-circle cards (AI slop blacklist). D-08 requires replacement with left-aligned icon + text rows.

```tsx
// Source: 05-CONTEXT.md D-08, DESIGN.md AI Slop Blacklist
// REMOVE: centered card grid with w-12 h-12 mx-auto rounded-full bg-accent-100
// ADD: left-aligned rows
<div className="flex items-start gap-4">
  <SomeIcon className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
  <div>
    <h3 className="text-base font-bold text-primary mb-1">100% Private</h3>
    <p className="text-sm text-secondary">Your property is never publicly listed...</p>
  </div>
</div>
```

Also: remove the `md:grid-cols-3` grid layout for benefits. Use `space-y-6` or `grid md:grid-cols-3 gap-6` with left-aligned rows inside each cell (not centered cards).

### Pattern 5: Demand Summary Panel Restructure

The current demand panel (`/owner/properties/[id]`) is a gradient sub-card with `bg-green-50`/`bg-blue-50` sub-boxes. D-01 through D-04 require full structural replacement.

**Current structure:**
- `bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-200`
- Sub-cards: `text-center p-2 bg-green-50 rounded` / `bg-blue-50 rounded`
- Total: `text-3xl font-bold text-primary-600`

**New structure:**
```tsx
// Source: 05-CONTEXT.md D-01 to D-04, 05-UI-SPEC.md
<div className="card border-l-4 border-accent">
  <h2 className="text-sm font-semibold text-primary mb-3">Buyer Demand</h2>
  <p className="text-xl font-bold text-accent tabular-nums">
    {demand?.totalBuyers || 0}
  </p>
  <p className="text-xs text-secondary">
    Interested {(demand?.totalBuyers || 0) === 1 ? "Buyer" : "Buyers"}
  </p>
  {demand && demand.totalBuyers > 0 && (
    <>
      <p className="text-sm text-secondary tabular-nums mt-1">
        {demand.directInterestCount || 0} direct · {demand.criteriaMatchCount || 0} criteria
      </p>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-secondary">Budget Range</p>
        <p className="text-sm text-primary tabular-nums font-medium">
          {/* formatNZD range */}
        </p>
      </div>
    </>
  )}
</div>
```

No `w-5 h-5 text-primary-500` icon in the heading (remove inline SVG icon from demand summary header per D-08 pattern extension).

### Pattern 6: Match Score Single Color

Current code uses conditional `text-green-600` / `text-yellow-600` / `text-orange-600` based on threshold. D-05 removes this.

```tsx
// Source: 05-CONTEXT.md D-05
// REMOVE: ternary color logic
// ADD: single color
<p className="text-2xl font-bold text-accent tabular-nums">
  {match.matchScore}%
</p>
```

### Anti-Patterns to Avoid

- **`bg-gradient-to-br from-*`:** Every gradient must be replaced with flat `bg-surface-raised`. This appears in the CTA section of `/owner` and the demand panel + direct interest section of `/owner/properties/[id]`.
- **`rounded-full` on badges/pills:** Must be `rounded-sm` (4px). Appears in property type badges and feature toggles.
- **`text-center` on hero:** `/owner` page hero is currently `text-center mb-12`. Must become left-aligned.
- **`window.confirm()`:** The `deleteProperty` function in `/owner/my-properties` uses `window.confirm()`. Replace with inline confirm state.
- **Icon-in-circle pattern:** Three benefit cards in `/owner` use `w-12 h-12 mx-auto rounded-full bg-accent-100`. Remove circles entirely per D-08.
- **`max-w-7xl` / `max-w-4xl` / `max-w-3xl`:** All containers must become `max-w-content`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Feature toggle active/inactive styles | Custom inline ternary styles | `.badge-info` / `.badge-neutral` CSS classes | Consistent with Phase 4 pattern; already defined in globals.css |
| Error display | Custom error div | `bg-error-light border-error text-error` semantic tokens | Consistent with Phase 3/4 pattern (D-26) |
| Loading skeletons | Custom colors | `bg-surface-raised animate-pulse rounded-md` | Matches token system, works in dark mode |
| Empty state layout | Custom empty div | Follow EmptyState component pattern (COMP-09) | Phase 2 output, already restyled |
| Delete confirmation | `window.confirm()` dialog | Inline confirm state with `btn-destructive`/`btn-ghost` | UI-SPEC requirement; native dialog is unstyled |
| Modal | Custom modal | Existing `ContactBuyerModal` (Phase 2 COMP-04) | Already restyled; use as-is |

**Key insight:** All CSS class infrastructure is already built. The task is purely replacing old tokens in JSX with the established classes.

---

## Common Pitfalls

### Pitfall 1: `border-l-4 border-accent` on `.card`

**What goes wrong:** Developer adds `border-l-4 border-accent` to a `.card` element but `.card` has `border border-border` — they worry the left side will conflict.
**Why it happens:** Tailwind border utilities are side-specific. `border-l-4` sets `border-left-width: 4px`. `border-accent` sets `border-color` for ALL sides. But `border border-border` from `.card` also sets all sides. The last class wins for color, and `border-l-4` overrides just the left width.
**How to avoid:** Apply BOTH classes together: `className="card border-l-4 border-accent"`. The visual result is: left=4px accent, top/right/bottom=1px border-border — which is the intended design.
**Warning signs:** If the entire card border turns teal, the `border-accent` class is being applied without the `border-l-4` constraint — verify class order and that `border-l` width is set.

### Pitfall 2: `text-primary` vs `text-text-base`

**What goes wrong:** Developer uses `text-text-base` (the Tailwind color key name) instead of `text-primary` for heading text.
**Why it happens:** The Tailwind config has `"text-base": "var(--color-text)"` as a color key — generating `text-text-base` utility. But Phase 4 established that headings use `text-primary` (which maps to `var(--color-primary)` — same value #1a1a2e).
**How to avoid:** Follow Phase 4 pattern: `text-primary` for headings and primary body text. Both `text-primary` and `text-text-base` produce the same light-mode color but `text-primary` is the established convention.
**Warning signs:** Checking Phase 4 buyer pages confirms `text-primary` is the correct class.

### Pitfall 3: Demand Panel Layout Context

**What goes wrong:** The demand summary panel in `/owner/properties/[id]` is currently inside a flex row `lg:flex-row lg:items-start lg:justify-between` alongside property info. After restructuring to `card border-l-4 border-accent`, the panel may break out of the flex layout.
**Why it happens:** The current panel is `flex-shrink-0 lg:w-64` with inline `bg-gradient-*` styling — not a `.card` class element. Adding `.card` (which has `p-6`) changes the sizing.
**How to avoid:** When replacing the demand panel, keep the outer flex container intact. Replace only the panel's internal div — maintaining `flex-shrink-0 lg:w-64` on the container, then applying `.card border-l-4 border-accent` on the inner wrapper.
**Warning signs:** Demand panel wrapping or stretching to full width on desktop.

### Pitfall 4: `tabular-nums` Application

**What goes wrong:** `tabular-nums` is applied to parent container but the number is in a nested element — the font-variant-numeric doesn't cascade in all browsers.
**Why it happens:** `font-variant-numeric: tabular-nums` is inherited, but some browsers require it on the element containing the actual text.
**How to avoid:** Apply `tabular-nums` on the element containing the number directly, not just on the outer container. Use Tailwind's `tabular-nums` utility class.
**Warning signs:** Numbers in demand count / budget ranges not aligning consistently.

### Pitfall 5: Benefits Section Grid Structure

**What goes wrong:** Developer removes icon circles but keeps `text-center` on the benefit card, making the left-aligned icon row look misaligned.
**Why it happens:** The benefits grid cards currently have `text-center` applied at the card level.
**How to avoid:** When converting to left-aligned rows (D-08), remove `text-center` from each benefit card. Keep the `md:grid-cols-3` grid for layout, but change card content from centered to `flex items-start gap-4`.
**Warning signs:** Icon and text still appearing centered after removing `rounded-full` icon circles.

### Pitfall 6: `window.confirm()` Delete Pattern

**What goes wrong:** Token swap is applied to the delete button styling, but `window.confirm()` is left in place — the UI-SPEC requires inline confirm state.
**Why it happens:** This is a behavioral change, not a visual change — easy to miss in a "token swap" phase.
**How to avoid:** Treat the delete flow as a structural change task, not just a color token swap. Add `confirmDeleteId` state to the component. Remove the `if (!confirm(...)) return` guard.
**Warning signs:** Running the app and seeing a browser native dialog appear on delete click.

---

## Code Examples

### Error Display Pattern (established in Phase 3/4)

```tsx
// Source: globals.css error tokens, Phase 3-02 decision
{error && (
  <div className="p-4 bg-error-light border border-error rounded-md text-error text-sm">
    {error}
  </div>
)}
```

### Loading Skeleton Pattern (established across phases)

```tsx
// Source: 05-UI-SPEC.md, D-28
<div className="animate-pulse">
  <div className="h-8 bg-surface-raised rounded-md w-1/3 mb-4" />
  <div className="h-4 bg-surface-raised rounded-md w-2/3 mb-8" />
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="card h-32" />
    ))}
  </div>
</div>
```

### Property Type Badge (badge-neutral)

```tsx
// Source: 05-CONTEXT.md D-20
<span className="badge-neutral">
  {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
</span>
```

### Match Criteria Tags (badge-info)

```tsx
// Source: 05-CONTEXT.md D-06
{match.matchedOn.map((criterion) => (
  <span key={criterion} className="badge-info">
    {criterion === "location" ? "Location" :
     criterion === "budget" ? "Budget" :
     criterion === "budget_partial" ? "Budget (close)" :
     criterion === "propertyType" ? "Property type" :
     criterion === "bedrooms" ? "Bedrooms" :
     criterion === "features" ? "Features" : criterion}
  </span>
))}
```

### Demand Count Display

```tsx
// Source: 05-CONTEXT.md D-21, D-29
<p className="text-2xl font-bold text-accent tabular-nums">
  {property.demandCount}
</p>
<p className="text-xs text-secondary">
  {property.demandCount === 1 ? "interested buyer" : "interested buyers"}
</p>
```

### Container Width

```tsx
// Source: 05-CONTEXT.md D-24
// BEFORE: className="max-w-4xl mx-auto px-4 py-8"
// AFTER:
<div className="max-w-content mx-auto px-4 py-8">
```

---

## File-by-File Change Inventory

### `apps/web/src/app/owner/page.tsx` (157 lines) — Owner Landing

| Section | Current | Change Required | Type |
|---------|---------|-----------------|------|
| Container | `max-w-7xl` | `max-w-content` | Token swap |
| Hero | `text-center` layout, `text-gray-900`, `text-gray-600` | Left-aligned, `text-primary`, `text-secondary` | Structural + token |
| Benefits grid | Icon-in-`rounded-full` cards, `text-gray-900/600` | Left-aligned icon+text rows, remove `rounded-full` circles | Structural |
| Quick Check h2 | `text-gray-900 text-center` | `text-primary` left-aligned | Token |
| CTA card | `bg-gradient-to-br from-accent-50 to-primary-50 text-center` | `bg-surface-raised border-border` flat, remove center | Structural + token |
| FAQ headings | `text-gray-900`, `text-gray-600` | `text-primary`, `text-secondary` | Token swap |

### `apps/web/src/app/owner/register/page.tsx` (454 lines) — Register Form

| Section | Current | Change Required | Type |
|---------|---------|-----------------|------|
| Container | `max-w-3xl` | `max-w-content` | Token swap |
| Loading skeleton | `bg-gray-200` | `bg-surface-raised` | Token swap |
| Page heading | `text-gray-900`, `text-gray-600` | `text-primary`, `text-secondary` | Token swap |
| All section card headings | `text-gray-900` | `text-primary` | Token swap |
| Helper text | `text-gray-500`, `text-gray-600` | `text-secondary`, `text-muted` | Token swap |
| Feature toggle buttons | `rounded-full bg-primary-600 text-white` / `bg-gray-100 text-gray-700` | `badge-info` / `badge-neutral` | Token + structural |
| Error display | `bg-red-50 border border-red-200 rounded-lg text-red-700` | `bg-error-light border-error rounded-md text-error` | Token swap |

### `apps/web/src/app/owner/my-properties/page.tsx` (232 lines) — Property Listing

| Section | Current | Change Required | Type |
|---------|---------|-----------------|------|
| Container | `max-w-4xl` | `max-w-content` | Token swap |
| Loading skeleton | `bg-gray-200` | `bg-surface-raised` | Token swap |
| Page heading | `text-gray-900`, `text-gray-600` | `text-primary`, `text-secondary` | Token swap |
| Error display | `bg-red-50 border border-red-200 rounded-lg text-red-700` | `bg-error-light border-error rounded-md text-error` | Token swap |
| Empty state headings | `text-gray-900`, `text-gray-600` | `text-primary`, `text-secondary` | Token swap |
| Property card hover | `hover:border-primary-300` | `hover:border-accent` | Token swap |
| Property type badge | `px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700` | `badge-neutral` | Token + structural |
| Property meta text | `text-gray-500`, `text-gray-400` | `text-secondary`, `text-muted` | Token swap |
| Demand count | `text-2xl font-bold text-primary-600` / `text-gray-400` | `text-2xl font-bold text-accent tabular-nums` | Token swap |
| View Details | `text-primary-600` | `text-accent` | Token swap |
| Delete button | `text-red-600 hover:text-red-800` + `window.confirm()` | `text-error hover:text-error-hover` + inline confirm state | Token + behavioral |

### `apps/web/src/app/owner/properties/[id]/page.tsx` (611 lines) — Property Detail

| Section | Current | Change Required | Type |
|---------|---------|-----------------|------|
| Container | `max-w-4xl` | `max-w-content` | Token swap |
| Loading skeleton | `bg-gray-200` | `bg-surface-raised` | Token swap |
| Back link | `text-gray-600 hover:text-gray-900` | `text-secondary hover:text-primary` | Token swap |
| Property address | `text-gray-900` | `text-primary` | Token swap |
| Location text | `text-gray-600`, `text-gray-400` | `text-secondary`, `text-muted` | Token swap |
| Property detail row | `text-gray-600`, `text-gray-400` | `text-secondary`, `text-muted` | Token swap |
| Feature pills | `bg-gray-100 text-gray-600 rounded-full` | `badge-neutral` | Token + structural |
| Timestamp | `text-gray-400` | `text-muted` | Token swap |
| Demand summary panel | `flex-shrink-0 lg:w-64 p-4 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-200` + `text-3xl font-bold text-primary-600` + `bg-green-50`/`bg-blue-50` sub-cards | Flat `.card border-l-4 border-accent`, total `text-xl font-bold text-accent tabular-nums`, inline stats row | Structural |
| Photos toggle | `text-primary-600 hover:text-primary-800` | `text-accent hover:text-accent-hover` | Token swap |
| Image thumbnails | `w-24 h-24 object-cover rounded-lg` | Keep size, `rounded-md`, `bg-surface-raised` placeholder | Token swap |
| "Show more" button | `bg-gray-100 text-gray-500 hover:bg-gray-200` | `bg-surface-raised text-secondary hover:bg-surface` | Token swap |
| Photos section heading | `text-gray-900`, `text-gray-600` | `text-primary`, `text-secondary` | Token swap |
| Direct interest card | `card border-2 border-green-200 bg-gradient-to-br from-green-50 to-white` + icon-in-circle header + `text-green-700` subtext | `card border-l-4 border-accent`, no icon-circle, `text-primary`/`text-secondary` | Structural |
| Contact button | `px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700` | `btn-primary btn-sm` | Token + structural |
| Direct match items | `bg-white border border-green-200 hover:border-green-400` | `bg-surface border border-border` | Token swap |
| Buyer name | `text-gray-900` | `text-primary` | Token swap |
| Budget text | `text-gray-600` | `text-secondary` | Token swap |
| Criteria matches heading | `text-gray-900`, `text-gray-600` | `text-primary`, `text-secondary` | Token swap |
| Refresh button | `text-primary-600 hover:text-primary-800` | `text-accent hover:text-accent-hover` | Token swap |
| Empty state icon-circle | `w-12 h-12 mx-auto rounded-full bg-gray-100` | EmptyState component or `text-muted` icon (no circle) | Structural |
| No-matches text | `text-gray-600`, `text-gray-500` | `text-secondary`, `text-muted` | Token swap |
| Criteria match items | `bg-gray-50 border border-gray-200 hover:border-primary-200` | `bg-surface border border-border hover:border-accent` | Token swap |
| Match item link | `text-gray-900 hover:text-primary-600` | `text-primary hover:text-accent` | Token swap |
| Match criteria tags | `px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700` | `badge-info` | Token + structural |
| Match score | conditional `text-green-600`/`text-yellow-600`/`text-orange-600` | `text-accent tabular-nums` | Token swap |
| Score label | `text-gray-500` | `text-muted` | Token swap |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.confirm()` for delete | Inline confirm state | Phase 5 (this phase) | No browser native dialog |
| `bg-gradient-to-br` for emphasis | Flat `bg-surface-raised` card | Phase 2+ | AI slop removal |
| Color-coded match scores | Single `text-accent` | Phase 5 (this phase) | Simpler, consistent |
| Icon-in-rounded-full circles | Plain icon + text rows | Phase 5 (this phase) | AI slop removal |
| `max-w-4xl`/`max-w-7xl` | `max-w-content` | Phase 3+ | 1120px standard |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — phase is purely frontend code token replacement with no new runtimes, CLIs, or services).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test files in `apps/web/` |
| Config file | None |
| Quick run command | Visual inspection in browser |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OWNR-01 | Register form shows DESIGN.md layout with correct badge pattern, inputs, max-w-content | manual-visual | N/A — no test framework in apps/web | N/A |
| OWNR-02 | My properties shows cards with badge-neutral, text-accent demand count, inline delete confirm | manual-visual | N/A | N/A |
| OWNR-03 | Property detail shows flat demand panel, single-color match scores, badge-info criteria tags | manual-visual | N/A | N/A |

**Justification for manual-only:** The `apps/web` package has no test framework, no test files, and no test scripts in `package.json`. This is consistent with all prior phases (1-4) which also had no automated visual tests. Validation is visual inspection against the UI-SPEC.

### Wave 0 Gaps

None — no test infrastructure exists or is required. Validation is by visual inspection per UI-SPEC.

---

## Open Questions

1. **`text-primary` in UI-SPEC vs `text-text-base` in Tailwind config**
   - What we know: The Tailwind config color key is `"text-base": "var(--color-text)"` (generates `text-text-base`), and `"primary": "var(--color-primary)"` (generates `text-primary`). Both map to `#1a1a2e` in light mode.
   - What's unclear: The UI-SPEC uses `text-primary` consistently. Phase 4 buyer pages use `text-primary` for headings. The distinction only matters if `--color-text` and `--color-primary` ever diverge.
   - Recommendation: Use `text-primary` following Phase 4 convention. This is confirmed working.

2. **Benefits section grid layout after removing icon circles**
   - What we know: Current layout is `grid md:grid-cols-3 gap-6` with centered card content. D-08 requires left-aligned `flex items-start gap-4` rows.
   - What's unclear: Whether to keep the 3-column grid (benefits as columns) or switch to a single column with 3 rows.
   - Recommendation: Keep `grid md:grid-cols-3 gap-6` for desktop layout — one benefit per column — but change each cell content from centered cards to left-aligned icon+text rows. This retains the horizontal layout without the icon-in-circle violation.

---

## Project Constraints (from CLAUDE.md)

The following directives from `CLAUDE.md` apply directly to this phase:

- **Design authority:** DESIGN.md is the single source of truth for all visual decisions
- **No functionality changes:** Existing features must continue working identically after restyling
- **Tailwind CSS:** All styling via Tailwind utilities — no separate CSS files beyond globals.css for CSS variables and font imports
- **Responsive:** All pages must work across sm(640px), md(768px), lg(1024px), xl(1280px) breakpoints
- **Accessibility:** WCAG AA contrast ratios, keyboard navigation, ARIA landmarks, proper touch targets (min 44px)
- **Dark mode:** Must support both light and dark themes — all semantic token replacements handle dark mode automatically via CSS variables

---

## Sources

### Primary (HIGH confidence)
- `apps/web/src/app/globals.css` — All CSS class definitions confirmed (.card, .btn-primary, .badge-*, .input, .label, modal classes)
- `apps/web/tailwind.config.ts` — All semantic token mappings confirmed (max-w-content: 1120px, color tokens)
- `DESIGN.md` — Aesthetic direction, AI slop blacklist, spacing scale, typography scale
- `.planning/phases/05-owner-pages/05-CONTEXT.md` — All 30 locked decisions
- `.planning/phases/05-owner-pages/05-UI-SPEC.md` — Page-level interaction contracts, token swap reference table
- `apps/web/src/app/owner/page.tsx` — Current code (157 lines) read directly
- `apps/web/src/app/owner/register/page.tsx` — Current code (454 lines) read directly
- `apps/web/src/app/owner/my-properties/page.tsx` — Current code (232 lines) read directly
- `apps/web/src/app/owner/properties/[id]/page.tsx` — Current code (611 lines) read directly

### Secondary (MEDIUM confidence)
- `.planning/phases/04-buyer-pages/04-CONTEXT.md` — Phase 4 established patterns (badge-info for toggles, max-w-content, tabular-nums usage)
- `.planning/STATE.md` — Accumulated decisions from Phases 1-4

### Tertiary (LOW confidence)
None — all findings are verified against source code and config files.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed, all classes confirmed in globals.css
- Architecture patterns: HIGH — confirmed in source code, validated against Tailwind config
- Token swap reference: HIGH — all tokens verified against tailwind.config.ts and globals.css
- Pitfalls: HIGH — identified from direct code reading and Phase 4 accumulated decisions

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable codebase — CSS variables and Tailwind config won't change within this phase)
