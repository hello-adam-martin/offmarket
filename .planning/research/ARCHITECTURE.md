# Architecture Patterns — Design System Overhaul

**Domain:** Next.js 15 / Tailwind CSS v3.4 design system implementation
**Researched:** 2026-03-30
**Confidence:** HIGH — based on direct codebase inspection + established Tailwind v3 patterns

---

## Current State Diagnosis

The codebase has three structural mismatches with DESIGN.md that must be resolved in sequence:

| Layer | Current State | Required State |
|-------|--------------|----------------|
| Tailwind config | `primary` = sky-blue scale, `accent` = fuchsia/purple scale | `primary` = teal (#0d9488), warm neutrals, semantic colors |
| globals.css | No CSS variables defined | Full `--color-*` variable set per DESIGN.md spec |
| layout.tsx | `Inter` font, no dark mode class, `bg-gray-50` | `General Sans` + `DM Sans` fonts, `dark` class support, `bg-[--color-bg]` |

Every page and component currently references `primary-*` and `gray-*` Tailwind utilities. Changing the Tailwind config palette is a cascading change — it ripples into every file that uses those utilities. This is why the foundation layer must ship before any component work.

---

## Recommended Architecture

### Layer Model

```
Layer 0: Foundation (global config, variables, fonts)
    |
    v
Layer 1: Primitives (buttons, inputs, badges, cards — globals.css @layer components)
    |
    v
Layer 2: Shared Structural Components (Header, Footer — used on all 45+ pages)
    |
    v
Layer 3: Page Groups (organized by user type and complexity)
         - Group A: Public / Auth pages (homepage, explore, auth, help, privacy, terms)
         - Group B: Buyer pages (create ad, my ads, postcards, wanted detail)
         - Group C: Owner pages (owner landing, register, my properties, property detail)
         - Group D: User app pages (dashboard, profile, inquiries, notifications, upgrade, claim, saved searches)
         - Group E: Admin pages (dashboard, users, billing, email templates, postcards)
```

**Data flows in one direction only: config changes cascade downward.** Never update a page before its foundation layer is in place.

---

## Component Boundaries

### Layer 0 — Foundation

| Component | File | Responsibility | Output |
|-----------|------|---------------|--------|
| Color palette | `tailwind.config.ts` | Maps DESIGN.md colors to Tailwind utilities | `text-accent`, `bg-surface`, `border-border-color` utilities |
| CSS variables | `globals.css` `:root` | Provides semantic color tokens for dynamic theming | `--color-accent`, `--color-bg`, etc. |
| Dark mode variables | `globals.css` `.dark` | Overrides `:root` values for dark surfaces | Entire surface stack flips |
| Font loading | `layout.tsx` `<head>` | Loads General Sans (Fontsource), DM Sans + JetBrains Mono (Google Fonts) | Font families available |
| Body class | `layout.tsx` `<body>` | Applies base font, color, bg via Tailwind utilities | Inherited by all children |
| Dark mode provider | New: `components/ThemeProvider.tsx` | Manages `dark` class on `<html>` element, persists preference | Enables dark mode toggle throughout app |

### Layer 1 — Primitives (globals.css @layer components)

These are CSS component classes applied via utility-first shorthand. They are defined once and consumed everywhere.

| Primitive | Current | Required Change |
|-----------|---------|----------------|
| `.btn` | `rounded-lg` | Change to `rounded-md` (8px per DESIGN.md) |
| `.btn-primary` | `bg-primary-600 text-white` | `bg-[--color-accent] text-white hover:bg-[--color-accent-hover]` |
| `.btn-secondary` | `border-gray-300 text-gray-700` | `border-[--color-border] text-[--color-text]` |
| `.btn-ghost` | `text-gray-600 hover:bg-gray-100` | `text-[--color-text-secondary] hover:bg-[--color-surface-raised]` |
| `.input` | `border-gray-300 text-gray-900` | `border-[--color-border] text-[--color-text] bg-[--color-surface]` |
| `.label` | `text-gray-700` | `text-[--color-text-secondary] uppercase tracking-wider text-xs` (xs scale per DESIGN.md) |
| `.card` | `bg-white rounded-xl shadow-sm border-gray-100` | `bg-[--color-surface] rounded-lg border-[--color-border]` (no shadow — border only) |

**Note:** `.card` currently uses `rounded-xl` — DESIGN.md specifies `lg` = 12px (`rounded-lg`). The existing `rounded-xl` is 16px which is too soft. This is a global change.

### Layer 2 — Shared Structural Components

| Component | File | Current Issues | Required Changes |
|-----------|------|---------------|-----------------|
| Header | `components/header.tsx` | `bg-white border-gray-200`, `max-w-7xl` (too wide), `primary-600` logo color, no dark mode | Use `bg-[--color-surface]`, max content width 1120px (`max-w-5xl`), logo in `--color-accent`, dark mode surface |
| Footer | `components/footer.tsx` | `bg-gray-900` hardcoded dark, `primary-400` accent, `max-w-7xl` | Use `bg-[--color-primary]` (#1a1a2e), `text-[--color-accent]`, max-w-5xl, consistent with dark mode |
| Providers | `components/providers.tsx` | SessionProvider only | Wrap with ThemeProvider |
| ThemeProvider | New file | Doesn't exist | Creates; manages `dark` class on `<html>`, localStorage persistence |

### Layer 3 — Page Groups

Pages consume primitives and shared components. They should not be touched until Layers 0-2 are complete. Group ordering is by visual impact and risk:

| Group | Pages | Priority Rationale |
|-------|-------|-------------------|
| A: Public | `/`, `/explore`, `/explore/[region]`, `/auth/signin`, `/help`, `/privacy`, `/terms` | Highest public visibility, homepage has most AI slop violations |
| B: Buyer | `/buyer/create`, `/buyer/my-ads`, `/buyer/postcards`, `/wanted/[id]` | Core buyer flow, data-forward cards |
| C: Owner | `/owner`, `/owner/register`, `/owner/my-properties`, `/owner/properties/[id]` | Core owner flow, property cards |
| D: User App | `/dashboard`, `/profile`, `/inquiries`, `/inquiries/[id]`, `/notifications`, `/upgrade`, `/claim/[code]`, `/saved-searches`, `/property/[address]` | Dashboard pages, dense data display |
| E: Admin | `/admin`, `/admin/users`, `/admin/billing/*`, `/admin/email-templates/*`, `/admin/postcards` | Internal tool, least public visibility |

---

## Dependency Flow

The strict build order is enforced by dependency:

```
tailwind.config.ts
  └─ Defines color utilities (text-accent, bg-surface, etc.)
  └─ Required by: everything

globals.css (:root CSS variables)
  └─ Defines --color-* tokens referenced by Tailwind arbitrary values
  └─ Required by: ThemeProvider, layout.tsx, all components

globals.css (.dark overrides)
  └─ Flips CSS variable values for dark surfaces
  └─ Required by: ThemeProvider (which triggers the class)

layout.tsx (fonts + body)
  └─ Loads General Sans + DM Sans
  └─ Sets base bg, text, font on <body>
  └─ Required by: all pages (inherited)

ThemeProvider
  └─ Toggles dark class on <html>
  └─ Required by: any component with dark: variants

globals.css (primitives: .btn, .card, etc.)
  └─ References updated color utilities
  └─ Required by: Header, Footer, all pages

Header + Footer
  └─ Use primitives + CSS variables
  └─ Required by: every page (rendered in layout)

Pages (Group A → B → C → D → E)
  └─ All foundation layers must be complete first
```

**Critical constraint:** If you restyle a page before updating `tailwind.config.ts`, the `text-accent` utilities won't exist. The config must be the first commit.

---

## Dark Mode Implementation Flow

### Mechanism: Class-based (not media-query)

Tailwind's `dark:` variant requires `darkMode: 'class'` in `tailwind.config.ts`. This is not currently configured. It must be added in Layer 0.

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',  // ADD THIS
  // ...
}
```

### How it propagates

```
User clicks theme toggle
  -> ThemeProvider sets/clears 'dark' class on <html>
  -> ThemeProvider saves preference to localStorage
  -> CSS: .dark { --color-bg: #0f0f1a; --color-surface: #1a1a2e; ... }
  -> All components using var(--color-*) automatically recolor
  -> Components with explicit dark: variants override as needed
```

### Two-tier dark mode strategy

**Tier 1 — CSS Variables (automatic, zero code):**
Background colors, surface colors, border colors, text colors defined via CSS variables automatically update when `.dark` is on `<html>`. Any component using `bg-[--color-bg]`, `text-[--color-text]`, `border-[--color-border]` gets dark mode for free.

**Tier 2 — Tailwind dark: variants (explicit, for exceptions):**
Used when a component needs behavior that can't be expressed via a CSS variable swap — e.g., a status badge that changes its opacity, an image that needs a filter, or a chart that needs a different stroke color.

**Rule:** Default to Tier 1. Only use `dark:` utilities when the CSS variable mechanism is insufficient.

### Dark mode variable overrides (from DESIGN.md)

```css
.dark {
  --color-bg: #0f0f1a;
  --color-surface: #1a1a2e;
  --color-surface-raised: #252540;
  --color-border: #374151;
  --color-text: #fafaf7;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-accent: #0d9488;      /* reduce saturation 10-20% for dark */
  --color-accent-hover: #0f766e;
}
```

---

## Tailwind Config Architecture

The current `tailwind.config.ts` uses a numeric scale (`primary-600`, `accent-300`, etc.). The new config must shift to semantic naming that maps to DESIGN.md:

```typescript
// Semantic color approach — maps to CSS variables for dynamic theming
colors: {
  primary: '#1a1a2e',          // --color-primary
  accent: {
    DEFAULT: '#0d9488',        // --color-accent
    hover: '#0f766e',          // --color-accent-hover
    light: '#ccfbf1',          // --color-accent-light
  },
  secondary: {
    DEFAULT: '#d97706',        // --color-secondary
    light: '#fef3c7',          // --color-secondary-light
  },
  bg: '#fafaf7',               // --color-bg
  surface: '#ffffff',          // --color-surface
  'surface-raised': '#f5f5f0', // --color-surface-raised
  border: '#e5e5e0',           // --color-border (named 'border-color' conflicts with Tailwind)
  text: '#1a1a2e',             // --color-text
  'text-secondary': '#6b7280', // --color-text-secondary
  'text-muted': '#9ca3af',     // --color-text-muted
  'text-inverse': '#fafaf7',   // --color-text-inverse
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0d9488',
}
```

**Migration impact:** Every instance of `text-primary-*`, `bg-primary-*`, `text-gray-*`, `bg-gray-*`, `border-gray-*` across all 45+ pages must be updated. This is unavoidable — it is the cost of correcting the current sky-blue/fuchsia palette that contradicts DESIGN.md.

---

## Font Architecture

### Current problem
`layout.tsx` uses `next/font/google` for Inter only. The body receives `inter.className` which sets the CSS font-family. General Sans must be loaded via Fontsource (npm package, not Google Fonts) while DM Sans and JetBrains Mono load from Google Fonts CDN.

### Required structure in layout.tsx

```typescript
// Google Fonts (via next/font/google — handled server-side, no layout shift)
import { DM_Sans, JetBrains_Mono } from "next/font/google";

// General Sans (Fontsource — imported in globals.css or directly)
// import '@fontsource/general-sans/400.css'
// import '@fontsource/general-sans/600.css'
// import '@fontsource/general-sans/700.css'
```

**Decision:** Use `next/font/google` for DM Sans (same mechanism as current Inter, but avoids external CDN request). Import General Sans via Fontsource in `globals.css` to avoid layout shift. JetBrains Mono is low-frequency (code only) — load via Fontsource or Google Fonts with `display=swap`.

### CSS font stack in tailwind.config.ts

```typescript
fontFamily: {
  sans: ['DM Sans', 'sans-serif'],        // body default
  display: ['General Sans', 'sans-serif'], // headlines
  mono: ['JetBrains Mono', 'monospace'],   // code
}
```

Apply `font-display` to heading elements in globals.css `@layer base`:
```css
h1, h2, h3 { font-family: theme('fontFamily.display'); }
```

---

## Anti-Patterns in Current Codebase to Eliminate

These patterns appear across the existing pages and must be systematically removed during each group's restyle pass:

| Pattern | Example Location | Why It Violates DESIGN.md |
|---------|-----------------|--------------------------|
| `bg-gradient-to-br from-primary-*` | `app/page.tsx` hero | AI slop blacklist: gradient backgrounds |
| SVG `backgroundImage` pattern | `app/page.tsx` hero overlay | AI slop blacklist: SVG pattern backgrounds |
| `max-w-7xl` container | Header, Footer, Dashboard | Too wide — DESIGN.md max is 1120px (`max-w-5xl`) |
| `rounded-xl` on cards | `globals.css .card` | Too soft — DESIGN.md card radius is `lg` = 12px = `rounded-lg` |
| `text-primary-600` logo | `header.tsx` | primary-600 is now sky-blue (wrong) → must be `text-accent` |
| Centered hero text | `app/page.tsx` | AI slop blacklist: center-everything layout |
| `text-xl font-bold text-primary-600` headline | Header logo | Wrong font weight and color |
| `shadow-sm` on cards | `globals.css .card` | DESIGN.md cards use border, not shadow |
| Fuchsia accent palette | `tailwind.config.ts` | DESIGN.md blacklists purple/violet/indigo |

---

## Build Order: Recommended Phase Sequence

### Phase 1 — Foundation (must be atomic, all files in one pass)

1. `tailwind.config.ts` — Replace color palette entirely, add `darkMode: 'class'`, add `fontFamily`
2. `globals.css` — Add `:root` CSS variables, `.dark` overrides, update primitives (`.btn`, `.card`, `.input`, `.label`), add font `@layer base` rules
3. `layout.tsx` — Replace Inter with DM Sans + General Sans loading, update body classes, wrap with ThemeProvider
4. `components/providers.tsx` — Add ThemeProvider wrapper
5. New: `components/ThemeProvider.tsx` — Dark mode class toggle + localStorage persistence

**Why atomic:** The config, variables, fonts, and layout are so tightly coupled that shipping any one without the others leaves the app in a broken intermediate state (e.g., `text-accent` utility exists but `--color-accent` variable isn't defined yet).

### Phase 2 — Shared Components

6. `components/header.tsx` — Full restyle using new palette + responsive + dark mode
7. `components/footer.tsx` — Full restyle using new palette

After Phase 2, every page in the app has the correct header and footer. Visual coherence improves site-wide immediately.

### Phase 3 — Modals and Form Primitives

8. `components/ContactBuyerModal.tsx`
9. `components/PaymentModal.tsx`
10. `components/PostcardRequestModal.tsx`
11. `components/UpgradeModal.tsx`
12. `components/PropertyImageUpload.tsx`
13. `components/AddressAutocomplete.tsx`

These are shared across page groups. Restyling them before pages avoids rework.

### Phase 4 — Public Pages (Group A)

Homepage, explore, region, auth signin, help, privacy, terms. These are the highest-traffic pages and contain the most AI slop violations (gradient hero, SVG background, centered text).

### Phase 5 — Buyer Pages (Group B)

Create ad, my ads, postcards, wanted detail.

### Phase 6 — Owner Pages (Group C)

Owner landing, register property, my properties, property detail view.

### Phase 7 — User App Pages (Group D)

Dashboard, profile, inquiries, notifications, upgrade, claim, saved searches, property address page.

### Phase 8 — Admin Pages (Group E)

Admin dashboard, users, billing subscriptions/escrows/settings, email templates, postcards.

---

## Scalability Considerations

| Concern | This project (45 pages) | If app grew to 200+ pages |
|---------|------------------------|--------------------------|
| CSS variable approach | Ideal — one place to update dark mode | Still ideal — variables scale to any size |
| Tailwind semantic palette | All utilities available everywhere | Same — no change needed |
| ThemeProvider | Simple class toggle, no performance cost | Same — no change needed |
| globals.css primitives | ~30 component classes, lightweight | Would consider splitting into separate CSS modules |
| Font loading | next/font handles optimization | Same — next/font works at any scale |

---

## Sources

- Direct codebase inspection: `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/components/header.tsx`, `apps/web/src/components/footer.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/components/providers.tsx` — HIGH confidence
- DESIGN.md at repo root — authoritative design spec, HIGH confidence
- Tailwind CSS v3 dark mode docs: `darkMode: 'class'` is the established pattern for user-toggled dark mode in Tailwind v3.x — HIGH confidence (Tailwind v3.4.16 confirmed from package.json)
- Next.js 15 `next/font` pattern for Google Fonts: same as v13/v14, unchanged — HIGH confidence
- Fontsource for General Sans: standard approach for non-Google fonts in Next.js projects — MEDIUM confidence (verify `@fontsource/general-sans` package exists before implementation)
