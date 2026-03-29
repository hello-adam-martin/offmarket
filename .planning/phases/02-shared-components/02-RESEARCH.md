# Phase 2: Shared Components - Research

**Researched:** 2026-03-30
**Domain:** React component restyling — Tailwind CSS semantic token migration, Headless UI modals, next-themes toggle, SVG map fill system
**Confidence:** HIGH

## Summary

Phase 2 is a restyling-only phase with no new functionality. Every shared component currently uses hardcoded color classes (`bg-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*`, `bg-primary-*`) that must be replaced with the semantic tokens established in Phase 1. The token infrastructure is fully in place: `tailwind.config.ts` has all semantic color tokens, `globals.css` has CSS variable definitions for both `:root` and `.dark`, and the base component classes (`.btn-primary`, `.card`, `.input`, `.label`) already exist.

The work is largely mechanical token-swapping plus three net-new additions: a `ThemeToggle.tsx` component, button size variants (`.btn-sm`, `.btn-md`, `.btn-lg`) in globals.css, and badge/modal shell CSS classes in globals.css. The highest-complexity tasks are the NZRegionMap (requires migrating from hardcoded blue hex fills to a teal opacity-based heat-map system via inline SVG path props) and the EmptyState (contains AI-slop patterns — gradient stat cards, icon-in-colored-circles, emoji — that must be removed entirely).

**Primary recommendation:** Work wave by wave. Wave 1: globals.css additions (new CSS classes before any component uses them). Wave 2: Header + ThemeToggle (visible on every page, validates dark mode toggle works). Wave 3: Modals (5 files, repetitive pattern). Wave 4: Form primitives embedded in component files. Wave 5: Browse components (FilterPanel, EmptyState, DemandCardGrid, NZRegionMap, RegionFilterPanel). Wave 6: Address/upload utilities.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** CSS classes only — no React component primitives. Keep globals.css classes (.btn-primary, .card, .input, etc.) and apply via className strings. Matches existing codebase pattern.
- **D-02:** 4 button variants: primary (solid teal), secondary (outlined), ghost (text-only), destructive (error red). All defined as CSS classes in globals.css.
- **D-03:** 3 button sizes: .btn-sm (36px height, compact for tables), .btn-md (40px default), .btn-lg (48px for hero CTAs). All meet DESIGN.md 44px min touch target on mobile (sm uses padding compensation).
- **D-04:** Dark mode toggle placed right of nav links, before auth area. Sun/moon icon, always visible on desktop and mobile.
- **D-05:** Logo is text-only: "OffMarket" in accent teal (#0d9488), "NZ" in text-primary color. No icon or mark asset needed.
- **D-06:** Header uses border-b border-border (semantic token) for subtle separator. Changes correctly in dark mode.
- **D-07:** Header container switches from max-w-7xl (1280px) to max-w-site (1120px) per DESIGN.md.
- **D-08:** Shared CSS pattern for modal shell — .modal-backdrop and .modal-panel classes in globals.css. Each modal applies the class but keeps its own content layout. Headless UI Dialog stays as the underlying component.
- **D-09:** 2 modal sizes: .modal-panel-sm (max-w-md, 448px) for simple confirms/forms, .modal-panel-lg (max-w-xl, 576px) for complex content like PaymentModal.
- **D-10:** Teal accent system for region fills — accent-light for hover, accent for selected. Map visually integrates with the rest of the app.
- **D-11:** Heat-map shading by demand intensity — regions with more wanted ads get deeper teal fill. Data-forward, matches DESIGN.md's "data should be the hero" principle.

### Claude's Discretion

- Mobile menu styling and animation approach
- Notification badge styling (accent color assumed)
- EmptyState illustration/icon treatment
- FilterPanel and RegionFilterPanel layout approach
- Form field spacing and label positioning
- Close button style in modals
- Modal backdrop opacity
- AddressAutocomplete dropdown styling
- PropertyImageUpload drop zone styling
- Badge variant set (info, success, warning, error)
- Footer layout and link grouping

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | Header restyled — DESIGN.md colors, typography, max-width 1120px, dark mode support | Token swap + max-w-content + ThemeToggle insertion documented below |
| COMP-02 | Footer restyled — DESIGN.md colors, typography, max-width 1120px, dark mode support | Current footer uses bg-gray-900 (dark hardcoded, must switch to bg-surface-raised); token replacement map documented below |
| COMP-03 | Dark mode toggle component in header | ThemeToggle.tsx pattern documented; useTheme from next-themes already installed |
| COMP-04 | All modal components restyled (5 modals) | Modal shell CSS class pattern and per-modal size assignment documented in UI-SPEC; ContactBuyerModal code audit shows 6+ distinct color violations |
| COMP-05 | Form primitives restyled (inputs, selects, textareas, checkboxes, radios) | .input and .label already defined in globals.css; only embedding them in component files needed |
| COMP-06 | Button variants restyled (primary, secondary, destructive, ghost) with correct border-radius | All 4 variants already in globals.css from Phase 1; only size variants (.btn-sm/.btn-md/.btn-lg) are new additions |
| COMP-07 | Card components restyled (border-radius md, surface bg, border, grain texture) | .card already defined with grain in globals.css; .card-compact is the only new addition needed |
| COMP-08 | Badge components restyled (border-radius sm, accent-light bg) | .badge and .badge-* variants are new CSS classes to add to globals.css |
| COMP-09 | EmptyState component restyled | EmptyState has significant AI-slop violations (gradient cards, icon-in-circles, emoji); structural rework required per UI-SPEC |
| COMP-10 | FilterPanel and RegionFilterPanel restyled | Token swap; active filter indicator pattern uses .badge-info |
| COMP-11 | DemandCardGrid restyled with DESIGN.md card pattern | Apply .card class, tabular-nums on demand counts |
| COMP-12 | NZRegionMap styled to match DESIGN.md color palette | Color system migration from blue hex to teal opacity scale; requires changing getRegionColor() function |
| COMP-13 | AddressAutocomplete restyled | Token swap on input + dropdown container |
| COMP-14 | PropertyImageUpload restyled | Drop zone styling pattern documented in UI-SPEC |
</phase_requirements>

---

## Standard Stack

### Core (Phase 1 outputs — already in place)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Tailwind CSS | 3.4.16 | Utility CSS — all semantic tokens defined | Installed, configured |
| next-themes | 0.4.6 | Dark mode provider + useTheme hook | Installed, ThemeProvider wired in layout |
| Headless UI | 2.2.9 | Dialog component for modals | Installed, used in existing modals |
| React | 19.0.0 | Component framework | Installed |

### No New Packages Required

The UI-SPEC explicitly confirms: "No new npm packages are required for this phase." All implementation uses existing Tailwind utilities, Headless UI Dialog, and the CSS class layer in globals.css.

**Installation:** None required.

---

## Architecture Patterns

### Pattern 1: Semantic Token Replacement (PRIMARY PATTERN)

**What:** Every hardcoded Tailwind color class in a component is replaced with a semantic token from the Phase 1 design system.

**Replacement mapping — memorize this:**

| Old (hardcoded) | New (semantic) | Notes |
|-----------------|----------------|-------|
| `bg-white` | `bg-surface` | All card/modal/header surfaces |
| `bg-gray-50` / `bg-gray-100` | `bg-surface-raised` | Hover states, secondary surfaces |
| `bg-gray-900` (dark footer) | `bg-surface-raised` | Footer background — NOT dark hardcoded |
| `bg-gray-800` | `bg-surface` in dark context | — |
| `border-gray-200` / `border-gray-300` | `border-border` | All borders |
| `border-gray-800` | `border-border` | Dark section separators |
| `text-gray-900` / `text-gray-800` | `text-text-base` | Primary text |
| `text-gray-600` / `text-gray-700` | `text-text-secondary` | Secondary/subdued text |
| `text-gray-400` / `text-gray-500` | `text-text-muted` | Placeholder, metadata text |
| `text-white` (on colored bg) | `text-text-inverse` | Text on dark/accent backgrounds |
| `bg-primary-600` / `bg-primary-500` | `bg-accent` | CTA buttons, active states |
| `text-primary-600` | `text-accent` | Logo, links, active nav |
| `bg-primary-100` | `bg-accent-light` | Light accent backgrounds |
| `text-primary-100` | `text-text-inverse` | Text on accent-bg surfaces |
| `hover:bg-gray-50` / `hover:bg-gray-100` | `hover:bg-surface-raised` | Ghost button hover |
| `focus:ring-primary-500` | `focus:ring-accent-light` | Form focus rings |
| `focus:border-primary-500` | `focus:border-accent` | Form focus border |
| `bg-red-500` (notification) | `bg-accent` | Notification badge — per D-04/D-05 reasoning |
| `bg-red-50` / `border-red-200` (error) | `bg-error/10 border-error/20` | Error message boxes |
| `text-red-700` (error text) | `text-error` | Error text |
| `text-green-500` / `text-green-600` (success) | `text-success` | Success icons/text |
| `rounded-lg` (on buttons) | `rounded-md` | Buttons use 8px not 12px |
| `rounded-xl` | `rounded-lg` | Cards/panels use 12px max |

**IMPORTANT — footer special case:** The current footer uses `bg-gray-900 text-gray-300` — a dark-hardcoded design. The DESIGN.md approach is semantic surfaces (light in light mode, dark in dark mode). Replace with `bg-surface-raised border-t border-border` and semantic text tokens. This means the footer will be a light surface in light mode and dark surface in dark mode — which is the correct design system behavior.

### Pattern 2: CSS Class Application (globals.css classes)

**What:** Instead of writing inline Tailwind utilities, apply the component classes defined in globals.css via `className`.

**What already exists in globals.css:**
- `.btn` — base button
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-destructive` — button variants
- `.input` — form input
- `.label` — form label
- `.card` — card with grain texture

**What needs to be ADDED to globals.css in Wave 1:**
```css
/* Button size variants */
.btn-sm { @apply h-9 px-3 py-1.5 text-sm; }
.btn-md { @apply h-10 px-4 py-2 text-sm; }
.btn-lg { @apply h-12 px-6 py-3 text-base; }

/* Card compact variant */
.card-compact { @apply bg-surface rounded-lg border border-border p-4; }
/* Note: card-compact does not get grain texture — it's for tight contexts */

/* Badge classes */
.badge { @apply inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold leading-4 uppercase tracking-wide; }
.badge-info { @apply badge bg-accent-light text-accent; }
.badge-success { @apply badge bg-success/10 text-success; }
.badge-warning { @apply badge bg-secondary-light text-warning; }
.badge-error { @apply badge bg-error/10 text-error; }
.badge-neutral { @apply badge bg-surface-raised text-text-secondary; }

/* Modal shell */
.modal-backdrop { @apply fixed inset-0 bg-black/50 backdrop-blur-sm; }
.modal-panel { @apply relative bg-surface rounded-lg border border-border shadow-xl w-full mx-4; }
.modal-panel-sm { @apply modal-panel max-w-md; }
.modal-panel-lg { @apply modal-panel max-w-xl; }
```

**CRITICAL for modal-panel chaining:** Tailwind's `@apply` does not support chaining of custom component classes (e.g., `@apply modal-panel max-w-md` will fail if `modal-panel` references other `@apply` classes). The safe approach: expand `.modal-panel` inline in `.modal-panel-sm` and `.modal-panel-lg`, or define `.modal-panel` as base properties and use `@apply` only for Tailwind utilities:

```css
/* Safe approach */
.modal-panel {
  @apply relative bg-surface rounded-lg border border-border shadow-xl w-full mx-4;
}
.modal-panel-sm {
  @apply relative bg-surface rounded-lg border border-border shadow-xl w-full mx-4 max-w-md;
}
.modal-panel-lg {
  @apply relative bg-surface rounded-lg border border-border shadow-xl w-full mx-4 max-w-xl;
}
```

### Pattern 3: ThemeToggle Component

**What:** New `"use client"` component that reads theme state from next-themes and renders a sun/moon icon button.

**Key implementation detail:** `useTheme` from next-themes may return `undefined` for `theme` on initial server render. Use `mounted` state guard to prevent hydration mismatch:

```tsx
// apps/web/src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render same-size placeholder to prevent layout shift
    return <div className="btn-ghost h-9 w-9" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn-ghost h-9 w-9 p-0 rounded-md"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        /* Sun icon — outline, 20px */
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        /* Moon icon — outline, 20px */
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```

**Source:** next-themes documentation pattern for SSR-safe mounting.

### Pattern 4: NZRegionMap Color Migration

**What:** The current `getRegionColor()` function returns hardcoded blue hex strings. This must be replaced with the teal semantic system.

**Current state (lines 18-26):**
```typescript
function getRegionColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "#f3f4f6"; // gray-100
  const intensity = count / maxCount;
  if (intensity < 0.2) return "#dbeafe"; // blue-100
  if (intensity < 0.4) return "#93c5fd"; // blue-300
  if (intensity < 0.6) return "#3b82f6"; // blue-500
  if (intensity < 0.8) return "#2563eb"; // blue-600
  return "#1d4ed8"; // blue-700
}
```

**Problem:** SVG `fill` attributes cannot use Tailwind CSS variable-backed tokens directly — they require hex/rgb values or CSS custom properties referenced via `fill="var(--color-accent)"`.

**Solution — use CSS custom properties directly in fill attribute:**

```typescript
function getRegionFill(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "var(--color-surface-raised)";
  const intensity = count / maxCount;
  if (intensity < 0.25) return "color-mix(in srgb, var(--color-accent) 20%, transparent)";
  if (intensity < 0.5) return "color-mix(in srgb, var(--color-accent) 50%, transparent)";
  if (intensity < 0.75) return "color-mix(in srgb, var(--color-accent) 80%, transparent)";
  return "var(--color-accent)";
}
```

**Alternative simpler approach using opacity on teal hex directly:** Since CSS variables work in inline styles but not all SVG contexts, the safest approach is to reference CSS variable strings that work in SVG `fill` attributes in modern browsers. Both `var(--color-accent)` and `color-mix()` are supported in modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+). For the NZ market (modern browser assumption is safe), this approach is fine.

**Stroke changes:**
```typescript
stroke={isSelected ? "var(--color-accent)" : isHovered ? "var(--color-accent-light)" : "var(--color-border)"}
strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.5}
```

**Tooltip restyling:**
```tsx
// Old
className="... bg-gray-900 text-white ..."
// New — use semantic tokens, no hardcoded dark
className="... bg-primary text-text-inverse ..."
// (bg-primary = #1a1a2e light / #fafaf7 dark — creates natural contrast in both modes)
```

**Legend restyling:** Replace `bg-gray-100`, `bg-blue-300`, `bg-blue-600` with actual CSS variable squares using inline `style={{ backgroundColor: 'var(--color-surface-raised)' }}`, `style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)' }}`, `style={{ backgroundColor: 'var(--color-accent)' }}`.

### Pattern 5: Modal Content Structure

**What:** Modals currently implement their own backdrop and panel div. The pattern to apply is `.modal-backdrop` and `.modal-panel-sm`/`.modal-panel-lg` classes on those same elements, while keeping all internal content unchanged.

**Current ContactBuyerModal pattern (representative):**
```tsx
// Old — 3 separate states each build their own backdrop+panel
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
```

**New pattern:**
```tsx
// Modal backdrop
<div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center">
  {/* Modal panel */}
  <div className="modal-panel-lg">  {/* or modal-panel-sm */}
```

**NOTE:** The `fixed inset-0 z-50 flex items-center justify-center` positioning classes must still be applied on the backdrop wrapper — the `.modal-backdrop` class only provides `fixed inset-0 bg-black/50 backdrop-blur-sm`. The flex centering must remain. Consider composing: `className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center"`.

**IMPORTANT — ContactBuyerModal has 3 render branches:** The loading state, the "no access" state, and the contact form state each render their own backdrop+panel. All three must be updated individually. The modal-panel-sm (max-w-md) applies to loading and no-access states; modal-panel-lg applies to the contact form state per the UI-SPEC.

**AI slop violation in ContactBuyerModal line 157:** The "icon-in-colored-circle" pattern must be removed:
```tsx
// REMOVE THIS:
<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4">
  <svg className="h-6 w-6 text-primary-600" ...>
```
Replace with inline icon without background circle.

### Pattern 6: EmptyState Structural Rework

**What:** The EmptyState component has multiple AI-slop violations that require structural changes (not just token swaps):

1. **Gradient stat cards (lines 131-138):** `bg-gradient-to-br from-primary-500 to-primary-600` and `bg-gradient-to-br from-accent-500 to-accent-600` — remove gradients entirely, use flat `bg-surface border border-border` cards with `text-accent` numbers.

2. **Icon-in-colored-circle (lines 199-202, 213-215):** `w-8 h-8 bg-primary-100 rounded-lg` and `w-8 h-8 bg-accent-100 rounded-lg` icon containers — remove, use inline icon without background.

3. **Emoji usage (line 143):** `🔥` emoji in "Hot Regions" heading — remove emoji, use plain text heading.

4. **Numbered circles with color-coded ranks (lines 156-164):** `bg-yellow-100 text-yellow-700`, `bg-orange-100 text-orange-700` — replace with simple monochrome `.badge-neutral` or plain `text-sm text-text-muted` rank numbers.

5. **`rounded-xl` on containers (lines 122, 135, 142, 192):** Replace with `rounded-lg` (`.card` class preferred).

### Anti-Patterns to Avoid

- **Do NOT use `hover:bg-gray-100`** — always use `hover:bg-surface-raised` for hover states
- **Do NOT use `rounded-xl` on buttons** — buttons use `rounded-md` (8px) per DESIGN.md
- **Do NOT add `dark:` prefix utilities** — dark mode is handled automatically via `.dark` class on `<html>` and CSS variables; semantic tokens automatically apply dark values
- **Do NOT hardcode the footer as dark** — the footer currently looks like a dark section because it's `bg-gray-900`. Replace with `bg-surface-raised` — it will be light in light mode and dark in dark mode (correct behavior)
- **Do NOT use Headless UI `Transition` for modals unless it's already there** — ContactBuyerModal and some others use plain conditional rendering (`if (!isOpen) return null`), not Headless UI Dialog+Transition. Keep the existing pattern unless Headless UI Dialog is already being used

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle state | Custom localStorage/cookie solution | `useTheme` from next-themes (already installed) | SSR-safe, handles system preference, already wired |
| Modal overlay/backdrop | Custom z-index stacking | `.modal-backdrop` CSS class + existing conditional rendering | Consistency; no need for Headless UI upgrade if not already used |
| Focus ring implementation | Custom `:focus` CSS | Tailwind `focus:ring-2 focus:ring-accent-light focus:ring-offset-2` | Already in `.btn` base class; apply consistently |
| SVG color tokens | Hardcoded hex values | CSS custom properties via `style={{ fill: 'var(--color-accent)' }}` | Dark mode responds automatically; no JS theme detection needed |
| Checkbox/radio custom styling | Custom SVG replacements | `accent-color` CSS property or Tailwind `accent-accent` utility | Supported natively, low effort |

**Key insight:** Every "custom" implementation in this phase is worse than the semantic token approach. The token system was built in Phase 1 specifically so Phase 2 can do mechanical replacement, not creative problem-solving.

---

## Common Pitfalls

### Pitfall 1: `@apply` Chaining Custom Classes in Tailwind v3

**What goes wrong:** Writing `.modal-panel-sm { @apply modal-panel max-w-md; }` will silently fail or produce unexpected output if `modal-panel` itself uses `@apply`. Tailwind v3 processes `@apply` at build time and cannot reference custom component classes defined in the same `@layer components` block when chaining.

**Why it happens:** Tailwind processes custom class references in `@apply` differently than utility class references. The order of `@layer components` block processing matters.

**How to avoid:** Expand all properties inline in each variant. Do not use `@apply` with custom-defined class names — only with Tailwind utility names.

**Warning signs:** Classes appear to have no effect, or only partial properties apply.

### Pitfall 2: Missing `mounted` Guard on ThemeToggle

**What goes wrong:** If ThemeToggle renders immediately without a `mounted` guard, `useTheme()` returns `undefined` on the server, causing a hydration mismatch between server HTML (no icon) and client HTML (icon rendered based on theme).

**Why it happens:** `next-themes` requires client-side JS to know the active theme. On server render, theme is always undefined.

**How to avoid:** Always use `useState(false)` + `useEffect(() => setMounted(true), [])` before rendering the toggle icon. Render a same-size placeholder div (`aria-hidden="true"`) in the unmounted state to prevent layout shift.

**Warning signs:** Console hydration mismatch errors; toggle briefly shows wrong icon on load.

### Pitfall 3: Footer Color System Inversion

**What goes wrong:** Developer sees dark footer and assumes it stays dark, adds `dark:` prefix utilities to make it "dark in dark mode too."

**Why it happens:** Current footer is `bg-gray-900` — looks like a design choice. It's actually a Phase 0 default that was never updated.

**How to avoid:** Replace with `bg-surface-raised border-t border-border`. The semantic token system makes dark mode work automatically — `surface-raised` is `#f5f5f0` in light and `#252540` in dark. No `dark:` prefixes needed.

**Warning signs:** Footer `dark:` class overrides in the diff; footer text using `text-gray-300` or similar hardcoded values.

### Pitfall 4: SVG Fill Tokens in NZRegionMap

**What goes wrong:** Trying to use Tailwind `fill-accent` class on SVG `<path>` elements inside the map component. SVG paths that receive dynamic `fill` via inline prop don't respect Tailwind utility classes on the same element.

**Why it happens:** The NZRegionMap SVG paths use `fill={fillColor}` as a React prop (inline style), which overrides any Tailwind `fill-*` class. The two systems conflict.

**How to avoid:** Use CSS custom property strings in the `fill` prop: `fill="var(--color-accent)"`. Never mix Tailwind `fill-*` classes with inline `fill` prop on the same element.

**Warning signs:** Tailwind fill classes have no effect on map regions; map still renders in old colors.

### Pitfall 5: Modal Branch Count

**What goes wrong:** Developer updates the ContactBuyerModal's main branch but misses the loading state and no-access state branches which each have their own backdrop+panel.

**Why it happens:** ContactBuyerModal has three separate `return` statements each building a complete modal shell. This is unusual (most modals have one return) and easy to miss.

**How to avoid:** Audit ContactBuyerModal for all `return` statements before starting. Count: loading branch (line 116), no-access branch (line 132), and contact form branch (line 230). All three need token migration.

**Warning signs:** Two out of three modal states look correct; one state reverts to old styling.

### Pitfall 6: `max-w-content` vs `max-w-[1120px]`

**What goes wrong:** Developer uses `max-w-content` (the custom Tailwind token added in Phase 1) and it doesn't work, or uses `max-w-5xl` as a fallback.

**Why it happens:** The `tailwind.config.ts` defines `maxWidth: { content: '1120px' }` which maps to `max-w-content`. This is confirmed working. But the UI-SPEC uses `max-w-[1120px]` (arbitrary value) in some places and `max-w-content` in others — both work.

**How to avoid:** Use `max-w-[1120px]` everywhere (direct value, no dependency on config). Or use `max-w-content` — both are equivalent. Pick one and be consistent. Recommended: `max-w-[1120px]` since it's explicit and doesn't require remembering the custom token name.

### Pitfall 7: EmptyState is NOT a Standard Empty State

**What goes wrong:** Developer treats EmptyState as a simple "no results" component and gives it minimal restyling.

**Why it happens:** The component name implies it's shown when there are no results. In reality, it's a full discovery page with a map, stats, region list, and quick actions — shown when no region filter is selected.

**How to avoid:** Read the full EmptyState component (229 lines). It contains 5+ distinct sub-sections each needing individual attention. The AI-slop items (gradient cards, icon-in-circles, emoji) require structural removal, not just token swapping.

---

## Code Examples

### ThemeToggle — mounted guard pattern
```tsx
// Source: next-themes documentation, next-themes GitHub README
"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" aria-hidden="true" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="btn-ghost h-9 w-9 p-0 rounded-md"
      aria-label="Toggle theme"
    >
      {/* icon based on theme */}
    </button>
  );
}
```

### Header max-width + semantic tokens
```tsx
// BEFORE:
<header className="bg-white border-b border-gray-200">
  <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// AFTER:
<header className="bg-surface border-b border-border">
  <nav className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
```

### Logo text-only pattern
```tsx
// Source: CONTEXT.md D-05
<Link href="/" className="flex items-center">
  <span className="text-[20px] font-bold font-display text-accent">OffMarket</span>
  <span className="text-[20px] font-bold font-display text-text-base">NZ</span>
</Link>
```

### globals.css — safe modal class definitions
```css
/* @layer components */
.modal-backdrop {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm;
}
.modal-panel {
  @apply relative bg-surface rounded-lg border border-border shadow-xl w-full mx-4;
}
.modal-panel-sm {
  @apply relative bg-surface rounded-lg border border-border shadow-xl w-full mx-4 max-w-md;
}
.modal-panel-lg {
  @apply relative bg-surface rounded-lg border border-border shadow-xl w-full mx-4 max-w-xl;
}
```

### NZRegionMap fill migration
```typescript
// BEFORE (hardcoded blue hex):
function getRegionColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "#f3f4f6";
  const intensity = count / maxCount;
  if (intensity < 0.2) return "#dbeafe";
  // ...
}

// AFTER (CSS custom properties — dark mode aware):
function getRegionFill(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "var(--color-surface-raised)";
  const intensity = count / maxCount;
  if (intensity < 0.25) return "color-mix(in srgb, var(--color-accent) 20%, transparent)";
  if (intensity < 0.5)  return "color-mix(in srgb, var(--color-accent) 50%, transparent)";
  if (intensity < 0.75) return "color-mix(in srgb, var(--color-accent) 80%, transparent)";
  return "var(--color-accent)";
}
// Usage: fill={getRegionFill(count, maxCount)}
```

### Badge — correct border-radius (NOT rounded-full)
```tsx
// Per DESIGN.md: badges use rounded-sm (4px), NOT rounded-full
// WRONG:
<span className="rounded-full px-2 py-0.5 text-xs bg-blue-100 text-blue-800">Active</span>

// CORRECT:
<span className="badge badge-info">Active</span>
// or inline: <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold bg-accent-light text-accent">Active</span>
```

---

## State of the Art

| Old Pattern | Current Pattern | When Changed | Impact |
|-------------|-----------------|--------------|--------|
| Blue heat-map fills | Teal accent heat-map | Phase 2 | Map integrates with design system |
| `bg-gray-900` dark footer | `bg-surface-raised` semantic footer | Phase 2 | Footer light/dark correct |
| `max-w-7xl` (1280px) | `max-w-[1120px]` | Phase 2 | Matches DESIGN.md layout spec |
| Hardcoded `bg-white` | `bg-surface` semantic | Phase 2 | Dark mode works |
| Gradient CTA buttons | Flat `bg-accent` | Phase 2 | Removes AI slop pattern |
| Icon-in-colored-circle | Inline icon only | Phase 2 | Removes AI slop pattern |
| `rounded-xl` on all | `rounded-md` buttons / `rounded-lg` cards | Phase 2 | Correct token scale |

**Deprecated patterns being removed:**
- `bg-gradient-to-br from-primary-500 to-primary-600` — gradient buttons (AI slop blacklist)
- `bg-primary-100 rounded-full` icon containers — icon-in-circle (AI slop blacklist)
- Emoji in headings — not in DESIGN.md aesthetic direction
- `bg-gray-900` hardcoded dark footer — replaced by semantic surface

---

## Open Questions

1. **Headless UI Dialog upgrade for modals**
   - What we know: ContactBuyerModal uses manual backdrop div + `if (!isOpen) return null`. Some other modals may use Headless UI Dialog+Transition already.
   - What's unclear: Whether PaymentModal, UpgradeModal, etc. already use Headless UI Dialog (not fully read).
   - Recommendation: Keep existing implementation pattern per component. Do not force Headless UI Dialog upgrade — the CSS class system works with both patterns.

2. **`color-mix()` browser support for NZRegionMap**
   - What we know: `color-mix(in srgb, ...)` is supported in Chrome 111+, Firefox 113+, Safari 16.2+ (released 2022-2023).
   - What's unclear: If the project has any requirement to support older browsers.
   - Recommendation: `color-mix()` is safe for the NZ market demographic (modern browsers). Alternative: use hardcoded teal hex values at fixed opacity steps if `color-mix()` feels risky — `rgba(13, 148, 136, 0.2)` through `rgba(13, 148, 136, 1.0)` where `#0d9488` = `rgb(13, 148, 136)`.

3. **RegionFilterPanel — file location not confirmed**
   - What we know: `RegionFilterPanel.tsx` is listed in the component inventory but its exact path is assumed to be `apps/web/src/components/browse/RegionFilterPanel.tsx`.
   - What's unclear: Whether it exists at that path or elsewhere.
   - Recommendation: Executor should verify path before planning tasks for this file.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 2 is purely code/CSS changes. No external dependencies beyond the existing Next.js/Node.js/pnpm stack. All packages are already installed.

---

## Validation Architecture

> nyquist_validation not explicitly false in config — section included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No automated test suite detected for web frontend |
| Config file | None found in `apps/web/` |
| Quick run command | `pnpm --filter @offmarket/web build` (TypeScript compile check) |
| Full suite command | `pnpm --filter @offmarket/web lint` then build |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Header shows teal logo, 1120px max-width, semantic colors | manual-only | Visual inspection in browser | N/A |
| COMP-02 | Footer uses semantic surface tokens | manual-only | Visual inspection in browser | N/A |
| COMP-03 | Dark mode toggle cycles light/dark/system | manual-only | Click toggle, verify class on `<html>` | N/A |
| COMP-04 | Modals show surface background, correct buttons | manual-only | Open each modal, verify in light+dark | N/A |
| COMP-05 | Form inputs show teal focus ring | manual-only | Tab through form, verify focus state | N/A |
| COMP-06 | Button variants visually distinct | manual-only | Visual inspection of button showcase | N/A |
| COMP-07 | Cards show surface bg, 8px radius, grain | manual-only | Visual inspection with DevTools | N/A |
| COMP-08 | Badges show 4px radius, correct colors | manual-only | Visual inspection | N/A |
| COMP-09 | EmptyState no AI slop patterns | manual-only | Navigate to /explore with no region | N/A |
| COMP-10 | FilterPanel/RegionFilterPanel semantic tokens | manual-only | Open /explore with filters active | N/A |
| COMP-11 | DemandCardGrid uses .card class | compile | `pnpm --filter @offmarket/web build` | ❌ Wave 0 |
| COMP-12 | NZRegionMap teal fills, dark mode aware | manual-only | Visual inspection in light+dark mode | N/A |
| COMP-13 | AddressAutocomplete .input class + dropdown | manual-only | Focus autocomplete, type address | N/A |
| COMP-14 | PropertyImageUpload drop zone styling | manual-only | Navigate to property registration | N/A |

**Automated validation gate:** TypeScript compilation (`pnpm --filter @offmarket/web build`) catches import errors, type mismatches, and broken className syntax. Run after every wave.

**Visual validation protocol:** Open app in browser, toggle dark mode, verify each component in both modes. No automated visual regression tooling is in scope.

### Sampling Rate
- **Per task commit:** `pnpm --filter @offmarket/web build` — TypeScript compile
- **Per wave merge:** `pnpm --filter @offmarket/web lint && pnpm --filter @offmarket/web build`
- **Phase gate:** All components visually verified in light + dark mode before `/gsd:verify-work`

### Wave 0 Gaps
- None — no new test files required. TypeScript compilation is the only automated check. Manual browser verification covers all visual requirements.

---

## Project Constraints (from CLAUDE.md)

Directives the planner must enforce:

| Constraint | Source | Impact on Phase 2 |
|------------|--------|-------------------|
| DESIGN.md is single source of truth | `.claude/CLAUDE.md` | All visual decisions follow DESIGN.md; 02-UI-SPEC.md has already reconciled DESIGN.md values into component contracts |
| No functionality changes | `CLAUDE.md` | Restyling only — no new props, no behavior changes, no API calls modified |
| Tailwind CSS only — no separate CSS files | `CLAUDE.md` | All new styles go in globals.css `@layer components`. No new `.css` or `.module.css` files |
| Responsive across sm/md/lg/xl | `CLAUDE.md` | All components must be verified at 640px, 768px, 1024px, 1280px breakpoints |
| WCAG AA contrast | `CLAUDE.md` | Semantic tokens from Phase 1 were designed for AA compliance; no new color combinations should be introduced |
| Dark mode required | `CLAUDE.md` | Semantic tokens handle dark mode automatically; no hardcoded colors allowed |
| GSD workflow — no direct edits | `CLAUDE.md` | Phase must be executed through `/gsd:execute-phase` |

---

## Sources

### Primary (HIGH confidence)
- `DESIGN.md` — color values, typography scale, border-radius, AI slop blacklist, aesthetic direction
- `.planning/phases/01-foundation/01-UI-SPEC.md` — token names, CSS variable names, Tailwind config structure
- `apps/web/tailwind.config.ts` — confirmed token names (bg-surface, text-text-base, etc.)
- `apps/web/src/app/globals.css` — confirmed existing CSS classes (.btn-primary, .card, .input, .label)
- `.planning/phases/02-shared-components/02-UI-SPEC.md` — per-component visual contracts
- `.planning/phases/02-shared-components/02-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- `apps/web/src/components/header.tsx` — direct audit of lines needing change
- `apps/web/src/components/footer.tsx` — direct audit, confirmed `bg-gray-900` hardcoded dark issue
- `apps/web/src/components/ContactBuyerModal.tsx` — direct audit, confirmed 3-branch structure
- `apps/web/src/components/browse/NZRegionMap.tsx` — direct audit, confirmed blue hex color system
- `apps/web/src/components/browse/EmptyState.tsx` — direct audit, confirmed AI-slop violations

### Tertiary (LOW confidence — needs validation)
- `color-mix()` browser support claim — based on known browser release data; not re-verified against specific NZ browser analytics
- RegionFilterPanel.tsx file path — assumed, not directly read

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed from actual config files
- Architecture patterns: HIGH — based on direct code audit of component files
- Pitfalls: HIGH — identified from direct inspection of specific code lines causing issues
- Token replacement map: HIGH — verified against tailwind.config.ts and globals.css

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable — no external dependencies to become stale)
