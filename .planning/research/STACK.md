# Technology Stack: Design System Overhaul

**Project:** OffMarket NZ — Design System Implementation
**Researched:** 2026-03-30
**Scope:** Adding DESIGN.md design system to existing Next.js 15.1 + React 19 + Tailwind CSS 3.4 app

---

## Current State (What Exists)

| Item | Current Value | Problem |
|------|--------------|---------|
| Font | `Inter` via `next/font/google` | Wrong font — needs General Sans + DM Sans + JetBrains Mono |
| Colors | Sky blue `primary` + fuchsia `accent` palette | Wrong — DESIGN.md specifies teal + warm neutrals |
| Dark mode | Not configured | Missing — no `darkMode` in tailwind.config.ts |
| CSS variables | Not defined | Missing — no `--color-*` tokens in globals.css |
| Component classes | `.btn-primary`, `.card` etc use gray/sky colors | Need full restyle to DESIGN.md tokens |

---

## Recommended Stack

### Font Loading

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `next/font/local` (built-in) | Next.js 15.1 | General Sans (self-hosted) | General Sans is NOT on Google Fonts and NOT in Fontsource. It's from Indian Type Foundry via Fontshare (free commercial license). Must be self-hosted using `next/font/local`. |
| `next/font/google` (built-in) | Next.js 15.1 | DM Sans variable font | DM Sans is a Google Font. `next/font/google` self-hosts at build time — zero Google DNS leakage, automatic `font-display: swap`, built-in CLS prevention. |
| `next/font/google` (built-in) | Next.js 15.1 | JetBrains Mono | Same rationale as DM Sans. Available as a variable font on Google Fonts. |

**Do NOT use:**
- Google Fonts CDN `<link>` tags in `<head>` — DESIGN.md mentions CDN but `next/font/google` is strictly superior: self-hosts, eliminates external requests, handles subsetting, prevents layout shift. The CDN approach in DESIGN.md is a loading mechanism suggestion only.
- `@fontsource/general-sans` — this package does NOT exist in the Fontsource registry (verified via Fontsource API returning 404). The DESIGN.md suggestion to use this package cannot be fulfilled as written.
- `@fontsource-variable/dm-sans` — valid package (v5.2.8 exists) but `next/font/google` is the better choice for Google Fonts in Next.js.

**Confidence:** HIGH (verified via Next.js official docs, Fontsource API, npm registry)

### Dark Mode

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `next-themes` | 0.4.6 | Theme toggle + persistence | Industry standard for Next.js dark mode. Handles SSR hydration, localStorage persistence, system preference detection, and the `suppressHydrationWarning` requirement. Supports React 19. |
| Tailwind `darkMode: 'selector'` | Tailwind 3.4.x | Apply `dark:` utilities | v3.4.1+ replaced `'class'` with `'selector'` strategy. Both work identically (add `.dark` to `<html>`), but `'selector'` is the current canonical option. |

**Strategy: class-based (not media query)**
- `next-themes` with `attribute="class"` adds/removes the `.dark` class on `<html>`
- Tailwind `darkMode: 'selector'` applies `dark:` utilities when `.dark` is present
- Users get three-way toggle: Light / Dark / System
- No flash of wrong theme because `next-themes` injects a blocking script before first paint

**Do NOT use:**
- `darkMode: 'media'` — removes user control, ignores localStorage preference
- Manual localStorage + inline script approach — `next-themes` handles this correctly with SSR safety
- `darkMode: ['selector', '[data-theme="dark"]']` data-attribute variant — more complex setup, no benefit for this project since we're not combining with other theming systems

**Confidence:** HIGH (verified via next-themes GitHub, Tailwind v3 docs)

### CSS Variables + Tailwind Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS custom properties in `globals.css` | CSS native | Store DESIGN.md color tokens | Single source of truth. Variables update automatically on dark mode toggle. Referenced by both Tailwind utilities and any raw CSS. |
| Tailwind `theme.extend.colors` with `var()` | Tailwind 3.4.x | Map CSS vars to Tailwind classes | Allows `bg-surface`, `text-primary`, `border-border` utility classes that automatically switch in dark mode via the CSS variable values. |

**The pattern:**

```css
/* globals.css — light mode defaults */
:root {
  --color-bg: #fafaf7;
  --color-surface: #ffffff;
  --color-surface-raised: #f5f5f0;
  --color-border: #e5e5e0;
  --color-text: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-inverse: #fafaf7;
  --color-primary: #1a1a2e;
  --color-accent: #0d9488;
  --color-accent-hover: #0f766e;
  --color-accent-light: #ccfbf1;
  --color-secondary: #d97706;
  --color-secondary-light: #fef3c7;
  --color-success: #059669;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #0d9488;
}

/* Dark mode overrides — applied when <html class="dark"> */
.dark {
  --color-bg: #0f0f1a;
  --color-surface: #1a1a2e;
  --color-surface-raised: #252540;
  --color-border: #374151;
  --color-text: #fafaf7;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-text-inverse: #1a1a2e;
  --color-accent: #0b8276;    /* reduced saturation ~15% */
  --color-accent-hover: #0d6b62;
  --color-accent-light: #134e4a;
}
```

```ts
// tailwind.config.ts — map CSS variables to utility classes
theme: {
  extend: {
    colors: {
      bg: 'var(--color-bg)',
      surface: 'var(--color-surface)',
      'surface-raised': 'var(--color-surface-raised)',
      border: 'var(--color-border)',
      primary: 'var(--color-primary)',
      accent: 'var(--color-accent)',
      'accent-hover': 'var(--color-accent-hover)',
      'accent-light': 'var(--color-accent-light)',
      secondary: 'var(--color-secondary)',
      'secondary-light': 'var(--color-secondary-light)',
      'text-base': 'var(--color-text)',
      'text-secondary': 'var(--color-text-secondary)',
      'text-muted': 'var(--color-text-muted)',
      'text-inverse': 'var(--color-text-inverse)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      info: 'var(--color-info)',
    },
    fontFamily: {
      display: ['var(--font-general-sans)', 'system-ui', 'sans-serif'],
      sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-jetbrains-mono)', 'monospace'],
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    },
    maxWidth: {
      content: '1120px',
    },
  },
}
```

**Why CSS variables over Tailwind dark: prefix per-class:**
Tailwind's `dark:bg-gray-900` approach requires adding `dark:` variants to every single utility class on every element. With CSS variables, you define the color semantics once in globals.css and every usage of `bg-surface` automatically adapts. For a 45-page app, this is the only maintainable approach.

**Confidence:** HIGH (well-established pattern, verified in Next.js and Tailwind docs)

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@headlessui/react` | ^2.2.9 (already installed) | Dark mode toggle UI (Switch component) | Use for the theme toggle button — accessible, zero styling, integrates with useTheme |

No additional UI component libraries needed. The project is already using Headless UI.

---

## Font Loading Architecture

### General Sans (self-hosted via `next/font/local`)

General Sans is distributed by Indian Type Foundry via [Fontshare](https://www.fontshare.com/fonts/general-sans) under the ITF Free Font License (free for commercial use). It is NOT on Google Fonts and NOT in Fontsource.

**Required steps:**
1. Download General Sans variable font (`GeneralSans-Variable.woff2`) from Fontshare
2. Place in `apps/web/src/app/fonts/GeneralSans-Variable.woff2`
3. Load with `next/font/local`

```ts
// apps/web/src/app/fonts.ts
import localFont from 'next/font/local'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'

export const generalSans = localFont({
  src: './fonts/GeneralSans-Variable.woff2',
  variable: '--font-general-sans',
  display: 'swap',
  // Variable font covers weight 300-700
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  // Variable font — no weight needed
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  // Variable font
})
```

```tsx
// apps/web/src/app/layout.tsx
import { generalSans, dmSans, jetbrainsMono } from './fonts'

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning  // required by next-themes
    >
      <body className="font-sans bg-bg text-text-base antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Why `suppressHydrationWarning` on `<html>`:** `next-themes` modifies the `class` attribute on the HTML element client-side to inject the correct theme class before hydration mismatch detection fires. Without `suppressHydrationWarning`, React logs hydration errors on every page load.

### DM Sans (via `next/font/google`)

DM Sans is a variable Google Font. `next/font/google` downloads it at build time and serves it from your own domain. The `opsz` optical-size axis from DESIGN.md's Google Fonts URL (`9..40`) is automatically handled by the variable font.

**Note on tabular-nums:** `font-variant-numeric: tabular-nums` is a CSS property, not a font feature that needs special loading. Apply it in Tailwind via `tabular-nums` utility class, or in `@layer base` for all `<table>` and data display contexts.

### JetBrains Mono (via `next/font/google`)

Variable Google Font. Used only for code blocks. Load with `preload: false` since it's not used on every page.

---

## Installation

```bash
# From apps/web directory
pnpm add next-themes

# No other new packages needed:
# - next/font is built into Next.js 15
# - Tailwind 3.4.x already installed (3.4.16 in package.json)
# - @headlessui/react already installed
```

**Manual step (no package):** Download `GeneralSans-Variable.woff2` from https://www.fontshare.com/fonts/general-sans and place in `apps/web/src/app/fonts/`.

---

## What NOT to Use

| Option | Why Not |
|--------|---------|
| `@fontsource/general-sans` | Does not exist — 404 from Fontsource API. The DESIGN.md reference to this package cannot be fulfilled; use `next/font/local` instead. |
| `@fontsource-variable/dm-sans` | Valid package (v5.2.8) but `next/font/google` is the correct Next.js pattern — same result, better integration (automatic self-hosting, CLS prevention, subset handling). |
| Google Fonts CDN `<link>` tags | External request on every page load, no self-hosting, no CLS protection, Next.js docs explicitly recommend against this. |
| Tailwind CSS v4 | Project is on v3.4.16. v4 is available (4.2.2) but upgrading is a separate large task — config format is completely different (`tailwind.config.ts` becomes CSS-only config). Do not migrate during this milestone. |
| `shadcn/ui` or similar component library | Project already has working components. Adding a component library means migrating 45 pages of existing markup — out of scope. |
| CSS Modules or styled-components | All styling is Tailwind utility classes per PROJECT.md constraint. No separate CSS files beyond globals.css. |
| `darkMode: 'media'` | Removes user agency — can't override system preference. |
| Per-element `dark:` variants without CSS variables | Unworkable for 45 pages. Requires `dark:` prefix on every color utility. CSS variables + semantic color names is the only maintainable approach at this scale. |

---

## Tailwind Configuration Summary

### darkMode
```ts
darkMode: 'selector'  // applies dark: utilities when .dark class on <html>
```

### Color naming convention
Use semantic names that describe purpose, not value:
- `bg-bg` (background)
- `bg-surface` (cards, panels)
- `bg-surface-raised` (nested panels)
- `border-border` (standard borders)
- `text-text-base` (primary text — note: avoid `text-text` naming collision)
- `text-text-secondary`, `text-text-muted`
- `bg-accent`, `hover:bg-accent-hover`, `bg-accent-light`

### Font utility classes
- `font-display` — General Sans, for h1/h2/h3 and hero text
- `font-sans` — DM Sans, default body font
- `font-mono` — JetBrains Mono, code blocks only
- `tabular-nums` — Tailwind's built-in class for `font-variant-numeric: tabular-nums`

---

## Version Summary

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `next` | 15.1.x | 15.1.x | No change |
| `tailwindcss` | 3.4.16 | 3.4.19 | Minor patch bump optional, not required |
| `next-themes` | not installed | 0.4.6 | Add |
| `@headlessui/react` | 2.2.9 | 2.2.9 | No change, already supports dark mode toggle |
| General Sans font | not loaded | self-hosted woff2 | Download from Fontshare |
| DM Sans | not loaded | via next/font/google | Built-in |
| JetBrains Mono | not loaded | via next/font/google | Built-in |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| `next/font` variable + CSS pattern | HIGH | Official Next.js docs (version 16.2.1, updated 2026-03-25) |
| General Sans NOT in Fontsource | HIGH | Fontsource API returns 404 for `general-sans` (verified) |
| General Sans available from Fontshare | HIGH | Multiple sources confirm ITF/Fontshare distribution, commercial-free license |
| `next-themes` v0.4.6 API | HIGH | npm registry confirmed, GitHub README reviewed |
| Tailwind v3 `darkMode: 'selector'` | HIGH | v3.tailwindcss.com docs confirmed |
| CSS variables + Tailwind `var()` pattern | HIGH | Tailwind docs + Next.js docs confirm |
| DM Sans variable font in `next/font/google` | HIGH | Fontsource confirms variable, Next.js docs show pattern |

---

## Sources

- Next.js Font docs (updated 2026-03-25): https://nextjs.org/docs/app/api-reference/components/font
- Next.js Font Getting Started (updated 2026-03-25): https://nextjs.org/docs/app/getting-started/fonts
- Tailwind CSS v3 Dark Mode: https://v3.tailwindcss.com/docs/dark-mode
- next-themes GitHub: https://github.com/pacocoursey/next-themes
- Fontsource General Sans (404 confirmed): https://api.fontsource.org/v1/fonts/general-sans
- Fontshare General Sans: https://www.fontshare.com/fonts/general-sans
- npm next-themes: https://www.npmjs.com/package/next-themes (v0.4.6 confirmed via registry)
- npm @fontsource-variable/dm-sans: v5.2.8 confirmed via npm registry
