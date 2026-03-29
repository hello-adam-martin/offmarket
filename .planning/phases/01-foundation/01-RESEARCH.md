# Phase 1: Foundation - Research

**Researched:** 2026-03-30
**Domain:** Tailwind CSS token layer, Next.js font loading, next-themes dark mode, CSS custom properties
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** General Sans woff2 stored in `src/app/fonts/` and loaded via `next/font/local` (Next.js convention, co-located with layout.tsx)
- **D-02:** Inter removed by swapping the import in `layout.tsx` only — no full-codebase audit needed (Inter is only referenced in layout.tsx lines 2 and 68)
- **D-03:** CSS custom properties map 1:1 to DESIGN.md token names — no extra abstraction layers or intermediate aliases
- **D-04:** Old Tailwind color scales (`primary-50` through `primary-950`, `accent-50` through `accent-950`) removed entirely — clean break, not aliased. Pages show wrong colors until restyled in Phases 2-7; this is expected.
- **D-05:** Border-radius scale overrides Tailwind defaults: `rounded-sm=4px`, `rounded-md=8px`, `rounded-lg=12px`, `rounded-full=9999px`
- **D-06:** Spacing uses Tailwind defaults (p-2=8px, p-4=16px, etc.) — no custom named aliases. Only `2xs` (2px) added as custom token per DESIGN.md.
- **D-07:** `max-w-site: 1120px` defined in tailwind.config.ts as a foundation token for all phases to consume
- **D-08:** Phase 1 wires ThemeProvider + dark CSS variables + suppressHydrationWarning only. The toggle component ships in Phase 2 with the Header restyle.
- **D-09:** globals.css component classes (.btn-primary, .card, .input, etc.) rewritten to use new DESIGN.md tokens in Phase 1 per FOUN-13

### Claude's Discretion

- **Font acquisition method:** Claude picks the simplest reliable approach to get GeneralSans-Variable.woff2 into `src/app/fonts/` (manual prerequisite vs automated script)
- **next-themes configuration:** Claude picks standard config (attribute, defaultTheme, storageKey) based on best practices

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUN-01 | CSS custom properties defined for all DESIGN.md colors in :root and .dark | Full token set documented in UI-SPEC.md; exact values confirmed from DESIGN.md |
| FOUN-02 | Tailwind config rewritten with semantic color names mapping to CSS variables | Tailwind 3.4.16 `extend.colors` with `var(--color-x)` pattern verified; full config structure in UI-SPEC.md |
| FOUN-03 | Tailwind typography scale matches DESIGN.md (3xl through xs) | 7-stop font scale with family/weight/line-height documented in UI-SPEC.md |
| FOUN-04 | Tailwind spacing scale uses 4px base unit with 2xs custom token | Tailwind default scale maps to DESIGN.md stops; only 2px (2xs) needs custom addition |
| FOUN-05 | Tailwind border-radius scale matches DESIGN.md | Custom override required: md=8px (Tailwind default is 6px); full scale in UI-SPEC.md |
| FOUN-06 | General Sans loaded via next/font/local | Font file prerequisite documented; `next/font/local` pattern confirmed for variable woff2 |
| FOUN-07 | DM Sans loaded via next/font/google with weights 300-700, italic 400 | `next/font/google` pattern with `axes: ['ital','opsz','wght']` needed for optical size axis |
| FOUN-08 | JetBrains Mono loaded via next/font/google (400, 500) | Standard `next/font/google` with `preload: false` (code font, not critical path) |
| FOUN-09 | Inter completely removed from layout.tsx | Confirmed: Inter only in layout.tsx lines 2 and 68 — single file change |
| FOUN-10 | next-themes installed and ThemeProvider wrapping app | next-themes 0.4.6 (latest); NOT currently installed in apps/web/package.json — install required |
| FOUN-11 | Dark mode CSS variables defined per DESIGN.md | All dark values documented in UI-SPEC.md; Tailwind `darkMode: 'selector'` required |
| FOUN-12 | suppressHydrationWarning on html element | Applied to `<html>` element in layout.tsx, not body |
| FOUN-13 | globals.css component classes updated to use DESIGN.md tokens | Current classes use old `primary-*`/`gray-*` tokens; replacement patterns in UI-SPEC.md |
| FOUN-14 | font-variant-numeric: tabular-nums applied to data displays | Applied via `@layer base` on `table` elements + Tailwind `tabular-nums` utility |
| FOUN-15 | Subtle grain texture on card backgrounds | CSS-only SVG `feTurbulence` filter; `::before` pseudo-element on `.card` at 0.03-0.04 opacity |

</phase_requirements>

---

## Summary

Phase 1 is pure infrastructure — it wires the design system token layer that all subsequent phases consume. No user-visible UI is produced. The five deliverables are: (1) rewrite `tailwind.config.ts` with semantic CSS-variable-mapped tokens, (2) rewrite `globals.css` with CSS custom properties and updated component classes, (3) swap font loading in `layout.tsx` from Inter to the three-font stack, (4) create `ThemeProvider.tsx` as a client component wrapping next-themes, and (5) create `fonts.ts` to export the three font instances.

The technical approach is well-established. Every pattern (next/font, next-themes, CSS custom properties in Tailwind) is documented in official sources. The main operational risk is a prerequisite gate: `GeneralSans-Variable.woff2` does not exist in the repo and must be downloaded from Fontshare manually before Phase 1 can complete FOUN-06. This is not a blocker for other tasks in the phase — it can be addressed last.

The current codebase starts from a known state: `tailwind.config.ts` has only `primary-*` (sky blue) and `accent-*` (fuchsia) numeric color scales — both get completely removed. `globals.css` has 7 component classes that all reference old tokens (`bg-primary-600`, `border-gray-300`, `rounded-xl`). `layout.tsx` uses `inter.className` on `<body>` which gets replaced with CSS variable approach on `<html>`. `providers.tsx` wraps only `SessionProvider` and will also wrap `ThemeProvider`.

**Primary recommendation:** Implement in five discrete commits in sequence: (1) install next-themes + font acquisition, (2) tailwind.config.ts rewrite, (3) globals.css CSS variables + component classes, (4) layout.tsx font swap + suppressHydrationWarning, (5) ThemeProvider wiring.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-themes | 0.4.6 | SSR-safe dark mode with localStorage persistence | de-facto standard for Next.js dark mode; handles hydration mismatch automatically |
| Tailwind CSS | 3.4.16 (installed) | Utility CSS with custom token extension | already installed; CSS-variable integration via `extend.colors` is first-class |
| next/font/local | built into Next.js 15.1 | Self-hosted variable font loading | zero external requests, automatic font-display swap, CSS variable output |
| next/font/google | built into Next.js 15.1 | Google Fonts with self-hosted subset | same benefits as /local; fonts served from same origin |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| General Sans Variable | woff2 from Fontshare | Display/headline font | Must be downloaded manually from https://www.fontshare.com/fonts/general-sans |
| DM Sans | Google Fonts via next/font | Body and data font | Supports tabular-nums, optical sizing, 300-700 weight range |
| JetBrains Mono | Google Fonts via next/font | Code/monospace | preload: false — not on critical path |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Custom ThemeContext | next-themes handles localStorage, system preference, SSR, and hydration — no value in custom solution |
| CSS custom properties | Tailwind plugin color generation | CSS variables give runtime switching for dark mode without class regeneration |
| next/font/local | Manual @font-face in globals.css | next/font handles font-display, preloading, subset, and CSS variable output automatically |

**Installation:**
```bash
# Run from repo root (pnpm workspace)
pnpm --filter @offmarket/web add next-themes
```

**Version verification:** next-themes 0.4.6 confirmed via `npm view next-themes version` on 2026-03-30.

---

## Architecture Patterns

### File Structure for This Phase

```
apps/web/src/
├── app/
│   ├── fonts/
│   │   └── GeneralSans-Variable.woff2   # PREREQUISITE: download from Fontshare
│   ├── fonts.ts                          # Font instance exports
│   ├── globals.css                       # Rewrite: CSS vars + component classes
│   └── layout.tsx                        # Modify: font swap + suppressHydrationWarning
└── components/
    ├── ThemeProvider.tsx                 # Create: "use client" next-themes wrapper
    └── providers.tsx                     # Modify: add ThemeProvider around SessionProvider
apps/web/
└── tailwind.config.ts                    # Complete rewrite
```

### Pattern 1: next/font/local for Variable Fonts

**What:** Export font instances from a dedicated `fonts.ts` file, apply as CSS variables on `<html>`, reference in Tailwind config.

**When to use:** Any self-hosted variable font (woff2 format).

**Example:**
```typescript
// apps/web/src/app/fonts.ts
import { localFont } from 'next/font/local'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'

export const generalSans = localFont({
  src: './fonts/GeneralSans-Variable.woff2',
  variable: '--font-general-sans',
  display: 'swap',
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  axes: ['ital', 'opsz'],
  weight: ['300', '400', '500', '600', '700'],
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500'],
  preload: false,
})
```

**Note on DM Sans import:** The package export is `DM_Sans` (underscore) not `DMSans`. The optical size axis is `opsz`. To include italic 400, the `ital` axis must be listed.

### Pattern 2: CSS Custom Properties + Tailwind Token Mapping

**What:** Define all color values as CSS variables in `:root` and `.dark`, then map Tailwind token names to those variables in `tailwind.config.ts`. Dark mode switches by swapping the CSS variable values, not by generating separate Tailwind classes.

**When to use:** Any design system that requires runtime theme switching.

**Tailwind config key settings:**
```typescript
// apps/web/tailwind.config.ts
darkMode: 'selector',   // Tailwind 3.4.x — activates dark: prefix when .dark on <html>
theme: {
  extend: {
    colors: {
      bg: 'var(--color-bg)',
      surface: 'var(--color-surface)',
      // ... all tokens
    }
  }
}
```

**CRITICAL:** `darkMode: 'selector'` is the Tailwind 3.4.x replacement for `darkMode: 'class'`. Both work — `'class'` still works in 3.4.x — but `'selector'` is the current canonical form. next-themes with `attribute="class"` adds `.dark` to `<html>`, which activates both approaches. Using `'selector'` is preferred for forward compatibility.

### Pattern 3: next-themes ThemeProvider as Client Component

**What:** next-themes Provider must be a client component. Create a thin wrapper file with `"use client"` directive.

**When to use:** Always — next-themes does not work as a server component.

**Example:**
```typescript
// apps/web/src/components/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

**disableTransitionOnChange:** Set to `true` to prevent CSS transitions firing during theme switch (prevents the "flash with transitions" problem where colors animate during the switch itself).

### Pattern 4: CSS SVG Noise Grain Texture

**What:** CSS-only grain texture using an embedded SVG `feTurbulence` filter as a `::before` pseudo-element. Zero assets required.

**When to use:** Subtle surface texture on cards per DESIGN.md D-10.

**Example:**
```css
/* In @layer components */
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
  opacity: 0.035;
  pointer-events: none;
}
```

**Note:** `.card` must have `position: relative` and `overflow: hidden` for the pseudo-element to be contained. The UI-SPEC uses `rounded-lg` on `.card` — ensure `overflow: hidden` so the grain doesn't bleed outside the border radius.

### Anti-Patterns to Avoid

- **Using `darkMode: 'media'`:** This uses `@media (prefers-color-scheme)` and cannot be toggled by user — always defer to next-themes class-based approach.
- **Applying font className to `<body>`:** The old Inter approach uses `inter.className` on `<body>`, which adds the font directly. The new approach uses `.variable` on `<html>` so CSS variables are available globally.
- **Defining CSS variables without `.dark` override:** If `:root` defines the variable but `.dark` block is missing, dark mode has no effect.
- **Using `px` in Tailwind `extend.colors`:** Color tokens must be `var(--color-x)` references, not hardcoded hex values — otherwise dark mode switching won't work.
- **Forgetting `satisfies Config`:** Current `tailwind.config.ts` uses `satisfies Config` type annotation — the rewrite must preserve this.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode persistence + system preference | Custom localStorage/media query hook | next-themes | Handles SSR hydration mismatch, localStorage sync, system preference detection, and FOUC prevention |
| Font loading optimization | Manual @font-face | next/font (local or google) | Handles font-display, preconnect, size-adjust, and CSS variable output automatically |
| CSS variable dark mode swap | JavaScript class toggle | next-themes + CSS `.dark` block | next-themes adds/removes `.dark` on `<html>` — CSS does the rest |

**Key insight:** Dark mode implementation has two insidious failure modes — flash-of-wrong-theme (FOUC) and hydration mismatch — that next-themes solves with a blocking inline script injected before hydration. Building a custom solution means re-solving both problems from scratch.

---

## Common Pitfalls

### Pitfall 1: Hydration Mismatch Without suppressHydrationWarning

**What goes wrong:** Next.js server renders `<html>` without the `.dark` class. next-themes adds `.dark` via inline script before React hydrates. React detects a mismatch and warns (or in strict mode, crashes).

**Why it happens:** Server doesn't know the user's preferred theme at render time.

**How to avoid:** Add `suppressHydrationWarning` to the `<html>` element in `layout.tsx` (not `<body>`). This is a per-element directive — it only suppresses warnings on that element, not its children.

**Warning signs:** Console warning "Extra attributes from the server" or "Prop className did not match."

### Pitfall 2: Naming Collision — `text-secondary`

**What goes wrong:** Tailwind generates `text-secondary` utility which could reference the amber `secondary` color (#d97706) instead of the text color token (`--color-text-secondary`).

**Why it happens:** Tailwind's `colors.secondary` and the need for a `text-text-secondary` utility share similar naming patterns.

**How to avoid:** Name the text color tokens with the `text-` prefix in the Tailwind config: use key `text-secondary` pointing to `var(--color-text-secondary)`. The resulting utility class is `text-text-secondary` which is verbose but unambiguous. See the full config in UI-SPEC.md.

**Warning signs:** Text that should be `#6b7280` rendering as `#d97706` amber.

### Pitfall 3: DM Sans Weight/Axis Specification

**What goes wrong:** Loading DM Sans with `weight: ['400', '700']` misses 300 and 600 weights needed per FOUN-07, and misses the italic variant.

**Why it happens:** `next/font/google` requires explicit weight array AND explicit axis inclusion for variable font features.

**How to avoid:** Specify `axes: ['ital', 'opsz']` alongside the weight array. The optical size axis (`opsz`) enables the font's optical sizing feature for the 9..40 range. Without `axes: ['ital']`, italic 400 weight (needed for body copy italics) is unavailable.

**Warning signs:** Italic text falling back to browser-synthesized italic (slanted roman) rather than true italic letterforms.

### Pitfall 4: Tailwind `darkMode: 'class'` vs `'selector'` Confusion

**What goes wrong:** Documentation for Tailwind 3.x references `'class'` but 3.4.x introduced `'selector'` as the preferred option.

**Why it happens:** `'class'` still works in 3.4.x — it's backward compatible — but new projects should use `'selector'`. next-themes adds `.dark` to `<html>` which triggers both.

**How to avoid:** Use `darkMode: 'selector'` in `tailwind.config.ts`. This is functionally identical to `'class'` for the next-themes setup but matches current Tailwind docs.

### Pitfall 5: Font File Not Found at Build Time

**What goes wrong:** `next/font/local` with a non-existent `src` path fails at build time with a cryptic module resolution error.

**Why it happens:** `GeneralSans-Variable.woff2` does not exist in the repo and must be downloaded manually from Fontshare.

**How to avoid:** Download `GeneralSans-Variable.woff2` from https://www.fontshare.com/fonts/general-sans and place at `apps/web/src/app/fonts/GeneralSans-Variable.woff2` BEFORE writing the font loading code. The `fonts/` directory does not exist yet — create it first.

**Warning signs:** `Error: Cannot find module` or `ENOENT` errors during `next build` or `next dev`.

### Pitfall 6: Old Color Tokens Left in globals.css

**What goes wrong:** After rewriting `tailwind.config.ts`, component classes in `globals.css` that reference removed tokens (`bg-primary-600`, `border-gray-300`) silently produce no output — Tailwind just omits unknown utilities.

**Why it happens:** Tailwind doesn't error on unknown utility references — it silently drops them.

**How to avoid:** Rewrite ALL `@layer components` classes in the same PR as the tailwind.config.ts change. Per D-11, ship as one PR with multiple commits.

**Warning signs:** Buttons and cards losing all styling (background, border, radius) without console errors.

---

## Code Examples

### globals.css — Complete Structure

```css
/* Source: DESIGN.md CSS Variables block + UI-SPEC.md */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #1a1a2e;
    --color-accent: #0d9488;
    --color-accent-hover: #0f766e;
    --color-accent-light: #ccfbf1;
    --color-secondary: #d97706;
    --color-secondary-light: #fef3c7;
    --color-bg: #fafaf7;
    --color-surface: #ffffff;
    --color-surface-raised: #f5f5f0;
    --color-border: #e5e5e0;
    --color-text: #1a1a2e;
    --color-text-secondary: #6b7280;
    --color-text-muted: #9ca3af;
    --color-text-inverse: #fafaf7;
    --color-success: #059669;
    --color-warning: #d97706;
    --color-error: #dc2626;
    --color-info: #0d9488;
  }

  .dark {
    --color-bg: #0f0f1a;
    --color-surface: #1a1a2e;
    --color-surface-raised: #252540;
    --color-border: #374151;
    --color-primary: #fafaf7;
    --color-text: #fafaf7;
    --color-text-secondary: #9ca3af;
    --color-text-muted: #6b7280;
    --color-text-inverse: #1a1a2e;
    --color-accent: #0b8276;
    --color-accent-hover: #0d6b62;
    --color-accent-light: #134e4a;
    --color-secondary-light: #451a03;
    /* success, warning, error, info unchanged in dark mode */
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply antialiased;
  }

  table {
    font-variant-numeric: tabular-nums;
  }
}
```

### layout.tsx — Font Application Pattern

```tsx
// Source: UI-SPEC.md layout.tsx Structure section
import { generalSans, dmSans, jetbrainsMono } from './fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-bg text-text-base antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
```

**Note:** `bg-gray-50` on the wrapper div in the current layout becomes `bg-bg` (or removed since `<body>` already has `bg-bg`).

### providers.tsx — ThemeProvider Integration

```tsx
// Source: project pattern from existing providers.tsx + next-themes docs
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `darkMode: 'class'` | `darkMode: 'selector'` | Tailwind 3.4.1 | Functionally identical for .dark class; 'selector' is canonical in docs |
| `next/font` import from `next/font/google` module name `Inter` | `localFont` from `next/font/local` | Next.js 13+ | next/font/local is correct for self-hosted woff2 variable fonts |
| Manual `@font-face` declarations | `next/font` (local or google) | Next.js 13 | Automatic preloading, font-display, size-adjust, CSS variable output |

**Current state (as of 2026-03-30):**
- next-themes: 0.4.6 is current stable — supports React 19 (`^19.0.0-rc` in peer deps confirmed)
- Tailwind CSS 3.4.16 is the project version — `'selector'` darkMode is available

---

## Open Questions

1. **D-07 notes `max-w-site: 1120px` but UI-SPEC.md uses `max-w-content: '1120px'`**
   - What we know: CONTEXT.md D-07 says `max-w-site`, UI-SPEC.md config shows key `content` producing `max-w-content`
   - What's unclear: Which key name to use in Tailwind config
   - Recommendation: Use `content` as the key (producing `max-w-content` utility) per UI-SPEC.md which was purpose-built for this phase. Both work; UI-SPEC.md is the more detailed and recent source.

2. **Font loading import syntax — `localFont` vs named import**
   - What we know: `next/font/local` exports a default export, commonly used as `import localFont from 'next/font/local'`
   - What's unclear: Whether a named export `localFont` exists
   - Recommendation: Use `import localFont from 'next/font/local'` (default import) — this is the documented pattern.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All build tooling | Yes | 22.22.0 | — |
| pnpm | Package management | Yes | 9.14.4 | — |
| next-themes | FOUN-10, FOUN-11, FOUN-12 | No (not in package.json) | 0.4.6 available on npm | — (no fallback; required) |
| GeneralSans-Variable.woff2 | FOUN-06 | No (file missing, fonts/ dir absent) | — | — (manual download required from Fontshare) |
| DM Sans via next/font/google | FOUN-07 | No install needed (loaded at build) | built into Next.js 15.1 | — |
| JetBrains Mono via next/font/google | FOUN-08 | No install needed | built into Next.js 15.1 | — |

**Missing dependencies with no fallback:**
- `next-themes` — must be installed via `pnpm --filter @offmarket/web add next-themes`
- `GeneralSans-Variable.woff2` — must be downloaded manually from https://www.fontshare.com/fonts/general-sans and placed at `apps/web/src/app/fonts/GeneralSans-Variable.woff2`. The `fonts/` directory does not yet exist and must be created.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected in web app |
| Config file | None |
| Quick run command | `pnpm --filter @offmarket/web build` (type-check via tsc + build smoke test) |
| Full suite command | `pnpm --filter @offmarket/web build` |

**Note:** No automated test infrastructure exists in `apps/web/`. The API has a Vitest dependency listed in CLAUDE.md but no test files found. For Phase 1 (infrastructure/config files only), the validation approach is:
1. TypeScript compilation: `pnpm --filter @offmarket/web build` must pass without errors
2. Visual verification: start dev server and check font rendering, CSS variable values in DevTools, dark mode toggle effect

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | CSS custom properties in :root and .dark | manual (DevTools) | — | — |
| FOUN-02 | Tailwind config tokens resolve to var() | manual (DevTools computed styles) | — | — |
| FOUN-03 | Typography scale correct px values | manual (DevTools) | — | — |
| FOUN-04 | Spacing scale with 2xs token | TypeScript build | `pnpm --filter @offmarket/web build` | N/A (config file) |
| FOUN-05 | Border radius scale | TypeScript build | `pnpm --filter @offmarket/web build` | N/A (config file) |
| FOUN-06 | General Sans renders in headlines | manual (browser visual) | — | — |
| FOUN-07 | DM Sans renders in body text | manual (browser visual) | — | — |
| FOUN-08 | JetBrains Mono loads without error | manual (DevTools Network) | — | — |
| FOUN-09 | Inter removed (no Inter network request) | manual (DevTools Network) | — | — |
| FOUN-10 | ThemeProvider wrapping app | TypeScript build | `pnpm --filter @offmarket/web build` | N/A (new file) |
| FOUN-11 | Dark mode CSS variables applied | manual (DevTools + toggle) | — | — |
| FOUN-12 | suppressHydrationWarning present | TypeScript build + code review | `pnpm --filter @offmarket/web build` | N/A |
| FOUN-13 | Component classes use new tokens | TypeScript build | `pnpm --filter @offmarket/web build` | N/A |
| FOUN-14 | tabular-nums on table elements | manual (DevTools computed styles) | — | — |
| FOUN-15 | Grain texture visible on cards | manual (browser visual) | — | — |

### Sampling Rate

- **Per task commit:** `pnpm --filter @offmarket/web build` (type-check + build smoke)
- **Per wave merge:** `pnpm --filter @offmarket/web build` + manual visual inspection in browser
- **Phase gate:** Build passes + manual verification of 5 success criteria from ROADMAP before `/gsd:verify-work`

### Wave 0 Gaps

- No test files needed for this phase — it is config/CSS/TypeScript only
- No test framework installation required
- Build command serves as the only automated gate

*(Existing test infrastructure (none) covers 0 of 15 phase requirements — all verification is manual or build-time TypeScript.)*

---

## Project Constraints (from CLAUDE.md)

These directives must be honored by the planner:

1. **Design authority:** DESIGN.md is the single source of truth — all token values must match exactly
2. **No functionality changes:** The font/theme infrastructure must not alter any existing page behavior
3. **Tailwind CSS only:** All styling via Tailwind utilities — no separate CSS files beyond `globals.css` for CSS variables and font imports
4. **Responsive:** All foundation tokens must support sm/md/lg/xl breakpoints (Tailwind defaults cover this)
5. **Accessibility:** WCAG AA contrast ratios must be maintained in both light and dark mode (verify accent teal on white surface meets 4.5:1)
6. **Dark mode:** Must support both light and dark themes — this is the primary output of FOUN-10/11/12
7. **GSD Workflow:** All file changes must go through GSD workflow (`/gsd:execute-phase`) — no direct repo edits

---

## Sources

### Primary (HIGH confidence)

- `DESIGN.md` (project) — All color values, typography scale, spacing scale, border radius, grain texture decision
- `.planning/phases/01-foundation/01-UI-SPEC.md` (project) — Exact token names, CSS variable names, Tailwind config structure, component class replacements
- `.planning/phases/01-foundation/01-CONTEXT.md` (project) — All locked decisions D-01 through D-11
- Direct file inspection: `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/components/providers.tsx`

### Secondary (MEDIUM confidence)

- `npm view next-themes version` → confirmed 0.4.6 current, React 19 peer dep support verified
- `npm view next-themes --json` → confirmed peerDependencies include React 19

### Tertiary (LOW confidence)

- None — all critical claims verified against project files or npm registry

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — next-themes version verified via npm; next/font patterns from Next.js docs (built into Next.js 15.1 already installed)
- Architecture: HIGH — token structure fully documented in UI-SPEC.md; existing code inspected directly
- Pitfalls: HIGH — derived from direct inspection of existing code (old tokens in globals.css) and known next-themes/next.js patterns

**Research date:** 2026-03-30
**Valid until:** 2026-05-30 (stable ecosystem — Tailwind 3.x, next-themes 0.4.x, Next.js 15.x all stable)
