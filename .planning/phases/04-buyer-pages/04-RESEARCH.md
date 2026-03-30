# Phase 4: Buyer Pages - Research

**Researched:** 2026-03-30
**Domain:** Tailwind CSS token swap — React client components
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Form Layout (Create Wanted Ad)**
- D-01: Keep multi-card section layout — separate `.card` sections for Location, Budget, Basic Info, Property Requirements. Restyle with DESIGN.md tokens only.
- D-02: Keep target type selection cards (General Area vs Specific Property) — restyle with `border-accent` for selected state, `border-border` for unselected, `bg-surface` backgrounds. Remove `primary-*` hardcoded colors.
- D-03: Property type and feature selection badges use badge-info style — `accent-light` background, `rounded-sm` (4px radius) per Phase 2 convention. Replaces current `rounded-full` pills with `bg-primary-600` active state.
- D-04: Location tags use badge-info tokens — `accent-light` bg, `rounded-sm` (4px). Consistent with property type badges. Replaces `rounded-full` with `primary-100/primary-800`.

**Status Badges & Indicators**
- D-05: Postcard status badges use semantic badge variants: PENDING → badge-warning (amber), APPROVED → badge-info (accent), REJECTED/FAILED → badge-error (red), SENT/DELIVERED → badge-success (green). All with 4px border radius per DESIGN.md badge spec.
- D-06: Match count on My Ads cards: keep large number display with `text-accent` and `tabular-nums`, 'matches' label below in `text-secondary`. Data-forward, consistent with DESIGN.md approach.
- D-07: Specific address indicator: swap amber circle to `accent-light` circle with house icon. Token replacement only.
- D-08: Postcard allowance display: badge-info styling for 'N free left' badge, `text-secondary` for usage line, `tabular-nums` on all numbers.

**Success & Empty States**
- D-09: Post-creation success state: keep checkmark circle + text layout. Swap `green-100/green-600` to success semantic tokens. Replace `bg-gradient-to-r from-primary-50 to-primary-100` postcard CTA box with flat `bg-surface-raised` card with `border-border`. No gradient.
- D-10: Empty states reuse Phase 2 EmptyState component pattern (COMP-09). Icon-in-circle acceptable in functional empty states. Swap hardcoded colors to semantic tokens.
- D-11: 'How Postcards Work' info section: swap `bg-gray-50` to `bg-surface-raised`, `text-gray-900` to `text-primary`, `text-gray-600` to `text-secondary`. Keep numbered list.

**Cross-Cutting Token Swaps**
- D-12: All `max-w-3xl` / `max-w-4xl` containers swap to `max-w-content` (1120px) per Phase 3 convention.
- D-13: All `gray-*` hardcoded colors swap to semantic tokens (`text-primary`, `text-secondary`, `text-muted`, `bg-surface`, `bg-surface-raised`, `border-border`).
- D-14: All `red-*` error colors swap to `error` / `error-light` semantic tokens.
- D-15: All `primary-*` colors swap to `accent` / `accent-light` / `accent-hover` tokens.
- D-16: Loading skeletons use `bg-surface-raised` not `bg-gray-200`.
- D-17: All numeric displays (budget, match count, postcard cost, allowance numbers) use `tabular-nums`.

### Claude's Discretion
- Exact spacing/padding values within cards as long as they follow DESIGN.md 4px base unit
- Responsive breakpoint adjustments for the create form grid layouts
- Usage summary bar styling in create page (currently `bg-gray-50 rounded-lg`)
- Error state styling (currently `bg-red-50 border border-red-200`) — map to semantic error tokens
- Delete button styling on My Ads cards

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUYR-01 | Create wanted ad page restyled — form layout, inputs, budget range, feature selection | Token swap catalogue for all 3 create page states (loading, form, success); badge-info pattern for property type/feature toggle buttons; target type card selection pattern; `max-w-content` container |
| BUYR-02 | My ads listing page restyled — card grid, status badges, action buttons | Location tag badge pattern; match count `text-accent tabular-nums` display; specific address indicator with `accent-light` circle; delete button semantic error color; empty state from Phase 2 |
| BUYR-03 | Postcards page restyled — request list, status indicators | `STATUS_LABELS` map replacement using `.badge-*` class names; postcard allowance badge-info; info section `bg-surface-raised`; cost display with `tabular-nums`; empty states |
</phase_requirements>

---

## Summary

Phase 4 is a pure visual token swap across three buyer-facing client components. No new architecture, no API changes, no component creation. The scope is mechanical but concentrated: 766 lines in the create page, 267 in my-ads, 298 in postcards — all containing the same class of problem.

All three pages are `"use client"` components using `useSession`. The pattern established in Phases 1-3 applies directly: replace hardcoded `gray-*`, `primary-*`, `red-*`, `green-*`, `amber-*` Tailwind classes with semantic token classes from the completed foundation. The token vocabulary is fully defined in `tailwind.config.ts` and `globals.css`. No config changes are needed.

The highest-complexity area is the create page's target type selection cards (lines 356-435), which use inline conditional class strings with `primary-500`, `primary-50`, `ring-primary-200`, `primary-100`, `primary-600`, `gray-200`, `gray-50`, `gray-300`. Each conditional branch requires a systematic token swap. The postcards page has a `STATUS_LABELS` dictionary (lines 34-41) using hardcoded Tailwind color strings — these must be replaced with `.badge-*` class names by switching from inline `className={statusInfo.color}` to `className={statusInfo.badgeClass}`.

**Primary recommendation:** Work through each page file top-to-bottom, replacing every hardcoded color class with its semantic equivalent per the token map below. Three files, one pattern, no surprises.

---

## Standard Stack

This phase introduces no new dependencies. The entire stack is already installed and operational.

### Core (already in place)
| Token Class | CSS Variable | Purpose |
|-------------|-------------|---------|
| `text-primary` | `--color-text` | Headings, card titles, strong text |
| `text-secondary` | `--color-text-secondary` | Subheadings, body text |
| `text-muted` | `--color-text-muted` | Metadata, hints, timestamps |
| `text-accent` | `--color-accent` | Accent-colored text (match count, links) |
| `bg-surface` | `--color-surface` | Card/input backgrounds |
| `bg-surface-raised` | `--color-surface-raised` | Nested panels, info boxes, skeletons |
| `border-border` | `--color-border` | All card/input borders |
| `bg-accent-light` | `--color-accent-light` | Badge info backgrounds, selected state tint |
| `bg-error-light` | `--color-error-light` | Error state backgrounds |
| `bg-success-light` | `--color-success-light` | Success state backgrounds |
| `bg-secondary-light` | `--color-secondary-light` | Warning state backgrounds |
| `text-error` | `--color-error` | Error text |
| `text-success` | `--color-success` | Success text |
| `text-warning` | `--color-warning` | Warning text (amber) |
| `border-accent` | `--color-accent` | Selected card borders |
| `max-w-content` | 1120px | Page container width |

### Component Classes (already in globals.css)
| Class | Use |
|-------|-----|
| `.badge-info` | Active selection badges, postcard APPROVED, "free left" indicator |
| `.badge-warning` | Postcard PENDING |
| `.badge-success` | Postcard SENT, DELIVERED |
| `.badge-error` | Postcard REJECTED, FAILED |
| `.badge-neutral` | Overflow counts (`+N more`) |
| `.btn-primary` | Primary actions |
| `.btn-secondary` | Secondary/cancel actions |
| `.btn-destructive` | Delete button |
| `.card` | All card containers |
| `.input` | All form inputs, selects, textareas |
| `.label` | All form labels |

---

## Architecture Patterns

### File Structure (unchanged)
```
apps/web/src/app/buyer/
├── create/page.tsx      # 766 lines — multi-section form + success state
├── my-ads/page.tsx      # 267 lines — ad listing with cards
└── postcards/page.tsx   # 298 lines — postcard list + status + info section
```

No new files. No component extractions required. Pure in-place class replacement.

### Pattern 1: Token Swap — Hardcoded → Semantic

The canonical swap table for Phase 4:

| Hardcoded Class | Semantic Replacement | Context |
|-----------------|----------------------|---------|
| `text-gray-900` | `text-primary` | All headings, labels |
| `text-gray-600` | `text-secondary` | Body text, descriptions |
| `text-gray-500` | `text-muted` | Metadata, hints |
| `text-gray-400` | `text-muted` | Icon colors, placeholders |
| `text-gray-300` | `text-muted` | Dividers |
| `bg-gray-50` | `bg-surface-raised` | Info boxes, usage bar |
| `bg-gray-100` | `bg-surface-raised` | Inactive badge bg, icon containers |
| `bg-gray-200` | `bg-surface-raised` | Loading skeletons |
| `border-gray-200` | `border-border` | Card/input borders |
| `hover:bg-gray-50` | `hover:bg-surface-raised` | Hover states |
| `hover:border-gray-300` | `hover:border-border` | Hover borders (keep current) |
| `text-primary-600` | `text-accent` | Accent text (budget, links) |
| `text-primary-700` | `text-accent` | Selected card text |
| `text-primary-800` | `text-accent` | Active location tag text |
| `bg-primary-50` | `bg-accent-light` | Selected card tint bg |
| `bg-primary-100` | `bg-accent-light` | Badge/icon bg (active state) |
| `border-primary-500` | `border-accent` | Selected card border |
| `border-primary-200` | `border-accent` | Selected address container border |
| `ring-primary-200` | `ring-accent-light` | Selected card focus ring |
| `bg-primary-600` | `bg-accent` | Active toggle button bg |
| `bg-green-100` | `bg-success-light` | Success circle bg |
| `text-green-600` | `text-success` | Success icon/text |
| `bg-gradient-to-r from-primary-50 to-primary-100` | `bg-surface-raised` | Postcard CTA box (remove gradient) |
| `border-primary-200` (CTA box) | `border-border` | CTA box border |
| `bg-red-50` | `bg-error-light` | Error state bg |
| `border-red-200` | `border-error` | Error state border |
| `text-red-600` | `text-error` | Error text |
| `text-red-700` | `text-error` | Error text in containers |
| `hover:text-red-800` | `hover:text-error` | Delete button hover |
| `bg-amber-100` | `bg-accent-light` | Specific address tag / indicator bg (D-07) |
| `text-amber-800` | `text-accent` | Specific address tag text |
| `text-amber-600` | `text-accent` | Specific address indicator icon |
| `bg-amber-100 text-amber-700` | `badge-warning` | "Limit reached" badge |
| `bg-yellow-100 text-yellow-800` | `.badge-warning` | PENDING status label |
| `bg-blue-100 text-blue-800` | `.badge-info` | APPROVED status label |
| `bg-green-100 text-green-800` | `.badge-success` | SENT/DELIVERED status label |
| `bg-red-100 text-red-800` | `.badge-error` | REJECTED/FAILED status label |
| `bg-primary-100 text-primary-700` | `.badge-info` | Postcard allowance "free left" |
| `bg-primary-100 text-primary-800` | `.badge-info` | Location tag (inline) → switch to badge-info |
| `bg-primary-100 text-primary-800` (overflow) | `.badge-neutral` | "+N more" overflow tags |
| `max-w-3xl` | `max-w-content` | Create page container |
| `max-w-xl` | `max-w-content` | Create success state container |
| `max-w-4xl` | `max-w-content` | My-ads / postcards container |
| `text-2xl font-bold text-primary-600` | `text-2xl font-bold text-accent tabular-nums` | Match count number |
| `p-2xl font-bold text-primary-600` (budget) | `text-accent` + `tabular-nums` | Budget display |
| `text-sm text-gray-600` (cost) | `text-sm text-secondary tabular-nums` | Postcard cost |
| `text-xs text-gray-500` (usage line) | `text-xs text-secondary tabular-nums` | Allowance "N of M used" |

### Pattern 2: STATUS_LABELS Dictionary Replacement (postcards/page.tsx)

Current code uses an inline color string that gets applied as `className`:
```typescript
// BEFORE — postcards/page.tsx lines 34-41
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  SENT: { label: "Sent", color: "bg-green-100 text-green-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
};
```

The `<span className={statusInfo.color}>` usage at line 204 means the field must remain a valid Tailwind class string. Replace the hardcoded colors with the `.badge-*` class names:

```typescript
// AFTER — rename field to "badgeClass" for clarity
const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PENDING:   { label: "Pending Review", badgeClass: "badge-warning" },
  APPROVED:  { label: "Approved",       badgeClass: "badge-info" },
  REJECTED:  { label: "Rejected",       badgeClass: "badge-error" },
  SENT:      { label: "Sent",           badgeClass: "badge-success" },
  DELIVERED: { label: "Delivered",      badgeClass: "badge-success" },
  FAILED:    { label: "Failed",         badgeClass: "badge-error" },
};
```

Then update the `<span>` at line 204:
```typescript
// BEFORE
<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>

// AFTER
<span className={statusInfo.badgeClass}>
```

The `.badge-*` classes in `globals.css` already include all the inline styles (`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold`), so the wrapper classes are redundant and should be dropped.

### Pattern 3: Target Type Card Selection (create/page.tsx lines 356-435)

The selection card pattern in the create page uses `border-2` with conditional primary/gray classes. Replace with `border-accent` / `border-border`:

```typescript
// BEFORE (selected state)
"border-primary-500 bg-primary-50 ring-2 ring-primary-200"
// AFTER
"border-accent bg-accent-light ring-2 ring-accent-light"

// BEFORE (unselected state)
"border-gray-200 hover:border-gray-300 hover:bg-gray-50"
// AFTER
"border-border hover:border-border hover:bg-surface-raised"

// BEFORE (disabled/locked state — specific address at limit)
"border-gray-200 bg-gray-50 opacity-75"
// AFTER
"border-border bg-surface-raised opacity-75"

// BEFORE (icon bg active)
targetType === "AREA" ? "bg-primary-100" : "bg-gray-100"
// AFTER
targetType === "AREA" ? "bg-accent-light" : "bg-surface-raised"

// BEFORE (icon color active)
targetType === "AREA" ? "text-primary-600" : "text-gray-500"
// AFTER
targetType === "AREA" ? "text-accent" : "text-muted"

// BEFORE (card title text active)
targetType === "AREA" ? "text-primary-700" : "text-gray-900"
// AFTER
targetType === "AREA" ? "text-accent" : "text-primary"
```

### Pattern 4: Property Type / Feature Toggle Badges (create/page.tsx lines 633-648, 711-726)

Currently uses `rounded-full` pills with `bg-primary-600` active. Replace with `.badge-info` for active, `.badge-neutral` for inactive:

```typescript
// BEFORE
className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
  propertyTypes.includes(type.value)
    ? "bg-primary-600 text-white"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
}`}

// AFTER
className={`transition-colors cursor-pointer ${
  propertyTypes.includes(type.value)
    ? "badge-info"
    : "badge-neutral hover:bg-surface-raised"
}`}
```

Note: `.badge-*` classes in globals.css include `inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold` — the `px-3 py-1.5 text-sm` sizing from the original is slightly larger. The phase 2 convention (COMP-08, Phase 2 decision recorded in STATE.md) uses badge-info for active selection — follow that convention.

### Pattern 5: Location Tags (create/page.tsx lines 509-526)

```typescript
// BEFORE
"inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
// AFTER — use badge-info with gap-1 override
"badge-info gap-1"
```

The `&times;` remove button inside the tag should also update text color:
```typescript
// BEFORE
"ml-1 text-primary-600 hover:text-primary-800"
// AFTER
"ml-1 text-accent hover:text-accent-hover"
```

### Pattern 6: Success State (create/page.tsx lines 233-300)

```typescript
// Success circle
// BEFORE: "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
// AFTER: "w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6"

// Success icon
// BEFORE: "w-10 h-10 text-green-600"
// AFTER: "w-10 h-10 text-success"

// Postcard CTA box
// BEFORE: "bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 mb-8 text-left"
// AFTER: "bg-surface-raised border border-border rounded-lg p-6 mb-8 text-left"

// Icon inside CTA box
// BEFORE: "p-3 bg-white rounded-lg shadow-sm shrink-0"  /  "w-6 h-6 text-primary-600"
// AFTER: "p-3 bg-surface rounded-md border border-border shrink-0"  /  "w-6 h-6 text-accent"
```

### Pattern 7: Specific Address Indicator (my-ads/page.tsx lines 172-191)

```typescript
// Address tag in card (amber → accent-light)
// BEFORE: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
// AFTER: "badge-info gap-1"

// Match count / specific indicator
// BEFORE: "w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center"
// AFTER: "w-10 h-10 mx-auto rounded-full bg-accent-light flex items-center justify-center"

// BEFORE: "w-5 h-5 text-amber-600"
// AFTER: "w-5 h-5 text-accent"

// Match count number
// BEFORE: "text-2xl font-bold text-primary-600"
// AFTER: "text-2xl font-bold text-accent tabular-nums"

// Location area tags
// BEFORE: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
// AFTER: "badge-info"

// Overflow tag
// BEFORE: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
// AFTER: "badge-neutral"
```

### Pattern 8: Delete Button (my-ads/page.tsx line 255)

Decision D-Claude (discretion): Delete button should use semantic error color. Options per DESIGN.md:
- **Option A (recommended):** `text-sm text-error hover:text-red-700` — inline text button with semantic error color
- **Option B:** `btn-destructive btn-sm` — full destructive button style (heavier visual weight, may be too prominent)

Recommendation: Option A. The delete action is secondary to the view/edit flow. A subtle text link in error color is appropriate for a destructive but non-critical action in a list context.

### Anti-Patterns to Avoid

- **Gradient backgrounds:** `bg-gradient-to-r` anywhere — replace with flat `bg-surface-raised`
- **rounded-full on badges:** Selection badges and location tags must use `rounded-sm` (4px) per DESIGN.md badge spec
- **primary-* in class strings:** No `primary-50`, `primary-100`, `primary-200`, `primary-600`, `primary-700`, `primary-800` — these were the old blue-based design and have no CSS variable backing
- **Inline padding overrides on badge-* classes:** The `.badge-*` classes include padding — don't add extra `px-*/py-*` unless intentionally overriding
- **Icon-in-colored-circle on functional empty states:** D-10 explicitly permits icon-in-circle for functional empty states (postcards not enabled, no ads yet) — this is NOT AI slop in context; the blacklist targets decorative feature cards not functional feedback states

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Status badge colors | Custom color lookup object with hardcoded Tailwind strings | `.badge-warning`, `.badge-info`, `.badge-success`, `.badge-error` from globals.css |
| Selection toggle state | Conditional `bg-primary-*` inline strings | `border-accent bg-accent-light` (selected) / `border-border` (unselected) from tailwind.config |
| Loading skeleton color | `bg-gray-200` | `bg-surface-raised` — already in tailwind.config |
| Error container styling | `bg-red-50 border-red-200 text-red-700` | `bg-error-light border-error text-error` from tailwind.config |

**Key insight:** Every hardcoded color in these three files has a semantic token equivalent already defined in `tailwind.config.ts`. The foundation work in Phases 1-2 pre-solved all of these problems.

---

## Common Pitfalls

### Pitfall 1: `max-w-content` vs `max-w-site`
**What goes wrong:** Phase 3 CONTEXT.md and STATE.md mention `max-w-site`, but `tailwind.config.ts` defines the key as `content` (→ `max-w-content` = 1120px). There is no `max-w-site` utility registered.
**Why it happens:** Internal alias inconsistency between planning docs and actual config.
**How to avoid:** Always use `max-w-content`. Verified in `tailwind.config.ts` line 58: `content: "1120px"`.
**Warning signs:** Build compiles but container is unconstrained (falls back to full width with no error).

### Pitfall 2: `primary-*` Has No CSS Variable
**What goes wrong:** Using `text-primary-600` compiles without error (Tailwind generates a non-functional class using the `primary` color token which is mapped to `--color-primary` = `#1a1a2e`, not the old blue). The result is charcoal text instead of teal accent.
**Why it happens:** The `primary` token was repurposed in Phase 1 from a blue scale to the charcoal color `#1a1a2e`. There are no `primary-50`, `primary-100` etc. variants — only the base `primary` maps to a CSS variable.
**How to avoid:** Treat any `primary-{number}` class as a bug. Map to `accent`, `accent-light`, or `accent-hover` depending on intent.
**Warning signs:** Text appears very dark (charcoal) instead of teal.

### Pitfall 3: Badge Padding Conflict
**What goes wrong:** Adding extra `px-3 py-1.5` alongside `.badge-info` produces oversized badges because `.badge-info` already defines `px-2 py-0.5` via `@apply`.
**Why it happens:** The original toggle buttons used large pill sizing (`px-3 py-1.5 rounded-full`). When replacing with `.badge-info`, the original sizing classes are not removed.
**How to avoid:** When switching toggle buttons to `.badge-info` / `.badge-neutral`, remove all `px-*`, `py-*`, `rounded-*`, `text-*`, `font-*` classes from the element — `.badge-info` provides all of them.
**Warning signs:** Badges look visually larger than other badges in the same page.

### Pitfall 4: Opacity Modifier Syntax Fails in @apply
**What goes wrong:** Using `bg-accent/10` or `bg-error/10` opacity modifier syntax inside `@apply` rules in globals.css silently falls back to solid background.
**Why it happens:** Tailwind v3 CSS variable color opacity modifiers do not work in `@apply` with CSS variable-backed colors. This was discovered and resolved in Phase 3 — the solution was adding `--color-success-light` and `--color-error-light` CSS variables.
**How to avoid:** Always use `-light` suffix tokens (`bg-success-light`, `bg-error-light`, `bg-accent-light`) rather than opacity modifiers. These are already defined in `globals.css` and `tailwind.config.ts`.
**Warning signs:** Solid teal/green/red backgrounds where a tint was expected.

### Pitfall 5: STATUS_LABELS Field Name Mismatch
**What goes wrong:** Renaming `color` → `badgeClass` in the STATUS_LABELS dictionary but forgetting to update the JSX reference from `statusInfo.color` to `statusInfo.badgeClass`.
**Why it happens:** TypeScript will catch this if the type is correct, but the current `STATUS_LABELS` typing uses an implicit type — no explicit interface.
**How to avoid:** Update both the dictionary definition AND every usage point (`statusInfo.color` at line 204, and the fallback at lines 193-195).
**Warning signs:** TypeScript error on `statusInfo.color` (if types are strict) OR runtime undefined className (shows no badge styling).

### Pitfall 6: `btn-outline` Class Does Not Exist
**What goes wrong:** Line 280 in create/page.tsx uses `className="btn-outline"` which is not defined in globals.css.
**Why it happens:** This was likely intended as a ghost/outline variant but was never implemented.
**How to avoid:** Replace `btn-outline` with `btn-secondary` (the established secondary button class). This is consistent with Phase 2 conventions.
**Warning signs:** Button renders with no styling (plain text link appearance).

---

## Code Examples

### Complete Loading Skeleton (applies to all 3 pages)
```tsx
// max-w-content instead of max-w-3xl/4xl, bg-surface-raised instead of bg-gray-200
<div className="max-w-content mx-auto px-4 py-8">
  <div className="animate-pulse">
    <div className="h-8 bg-surface-raised rounded w-1/3 mb-4" />
    <div className="h-4 bg-surface-raised rounded w-2/3 mb-8" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card h-32" />
      ))}
    </div>
  </div>
</div>
```

### Error Container
```tsx
// bg-error-light border-error text-error instead of bg-red-50 border-red-200 text-red-700
<div className="p-4 bg-error-light border border-error rounded-md text-error mb-6">
  {error}
</div>
```

### Usage Summary Bar (create page)
```tsx
// bg-surface-raised instead of bg-gray-50
// text-secondary instead of text-gray-600
// text-error instead of text-red-600
// text-accent instead of text-primary-600
<div className="flex flex-wrap gap-3 p-3 bg-surface-raised rounded-md text-sm">
  <div className="flex items-center gap-2">
    <span className="text-secondary">Interests:</span>
    {usage.wantedAds.isUnlimited ? (
      <span className="font-medium text-accent">Unlimited</span>
    ) : (
      <span className={`font-medium tabular-nums ${usage.wantedAds.remaining === 0 ? "text-error" : "text-primary"}`}>
        {usage.wantedAds.remaining} of {usage.wantedAds.limit} remaining
      </span>
    )}
  </div>
  {/* ... */}
  <Link href="/upgrade" className="text-accent hover:text-accent-hover font-medium">
    Upgrade for more
  </Link>
</div>
```

### Postcard Allowance Badge
```tsx
// badge-info instead of bg-primary-100 text-primary-700 rounded-full
// text-secondary + tabular-nums instead of text-gray-500
<div className="text-right">
  <span className="badge-info">
    {allowance.freeRemaining} free left
  </span>
  <p className="text-xs text-secondary tabular-nums mt-1">
    {allowance.usedThisMonth} of {allowance.freeMonthly} used this month
  </p>
</div>
```

### How Postcards Work Info Section
```tsx
// bg-surface-raised instead of bg-gray-50, text-primary instead of text-gray-900, text-secondary instead of text-gray-600
<div className="mt-8 p-4 bg-surface-raised rounded-lg">
  <h3 className="font-medium text-primary mb-2">How Postcards Work</h3>
  <ul className="text-sm text-secondary space-y-1">
    {/* numbered list items unchanged */}
  </ul>
</div>
```

---

## Environment Availability

Step 2.6: SKIPPED — this phase contains only in-file CSS class substitutions. No external tools, CLIs, databases, or services beyond the existing Next.js dev server are required.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test files exist in apps/web |
| Config file | None — no jest.config.*, vitest.config.*, or playwright.config.* found |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

These are visual restyling requirements. Automated unit tests are not applicable — the correctness criteria are visual (does it match DESIGN.md?). Manual visual verification is the appropriate gate.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUYR-01 | Create page renders with DESIGN.md tokens, multi-step layout, badge-info selection | visual | N/A — manual-only | N/A |
| BUYR-02 | My Ads page renders with badge-info location tags, text-accent match count, correct status indicators | visual | N/A — manual-only | N/A |
| BUYR-03 | Postcards page renders with badge-* status indicators, tabular-nums on numbers, bg-surface-raised info section | visual | N/A — manual-only | N/A |

**Manual-only justification:** Visual token substitution correctness cannot be meaningfully verified by unit tests. The verifier phase for this milestone uses browser screenshots for visual QA. Automated visual regression tooling (Percy, Chromatic) is not part of the current stack.

### Sampling Rate
- **Per task commit:** `pnpm --filter web dev` — visual check in browser
- **Per wave merge:** Full browser walkthrough of all 3 pages in light + dark mode
- **Phase gate:** All 3 pages visually match DESIGN.md in both themes before `/gsd:verify-work`

### Wave 0 Gaps
None — no test infrastructure is needed for this visual-only phase. The `pnpm --filter web dev` command is sufficient for verification during implementation.

---

## Open Questions

1. **`btn-outline` class at create/page.tsx line 280**
   - What we know: Class is used but not defined in globals.css
   - What's unclear: Was this intentional (planned future variant) or a mistake?
   - Recommendation: Replace with `btn-secondary` — the established secondary action pattern from Phase 2. This is consistent and safe.

2. **Budget display — tabular-nums placement**
   - What we know: D-17 requires `tabular-nums` on all numeric displays. Budget is shown as `formatNZD(ad.budget)` in my-ads (line 167) wrapped in `text-primary-600 font-medium`.
   - What's unclear: Should the `tabular-nums` class go on the `<p>` element or a wrapping `<span>`?
   - Recommendation: Apply `tabular-nums` directly to the `<p className="text-accent font-medium tabular-nums">` element. Simplest approach, no wrapper needed.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `apps/web/src/app/buyer/create/page.tsx` (766 lines) — all hardcoded classes catalogued
- Direct file inspection: `apps/web/src/app/buyer/my-ads/page.tsx` (267 lines) — all hardcoded classes catalogued
- Direct file inspection: `apps/web/src/app/buyer/postcards/page.tsx` (298 lines) — all hardcoded classes catalogued
- Direct file inspection: `apps/web/tailwind.config.ts` — confirmed token names and values
- Direct file inspection: `apps/web/src/app/globals.css` — confirmed `.badge-*` class definitions
- Direct file inspection: `.planning/phases/04-buyer-pages/04-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Phase 2/3 accumulated decisions (badge-info for active selection, CSS variable opacity limitation)
- `.planning/phases/03-public-pages/03-CONTEXT.md` — confirmed `max-w-content` convention from Phase 3

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tokens verified against actual tailwind.config.ts and globals.css
- Architecture: HIGH — all three files fully read and catalogued; no unknowns
- Pitfalls: HIGH — most pitfalls discovered from actual code inspection (btn-outline, primary-* repurposing, max-w-content vs max-w-site naming) or recorded STATE.md learnings from prior phases

**Research date:** 2026-03-30
**Valid until:** Stable — only changes if globals.css or tailwind.config.ts is modified
