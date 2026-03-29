# Design System Overhaul Pitfalls

**Domain:** Design system implementation on existing Next.js 15 + Tailwind CSS marketplace app
**Researched:** 2026-03-30
**Scope:** Pixel-perfect overhaul of 45+ pages, dark mode, custom fonts, warm neutrals, teal accent

---

## Critical Pitfalls

Mistakes that cause rewrites, broken functionality, or regression nightmares.

---

### Pitfall 1: Wrong Color Palette Wired Into Tailwind Config

**What goes wrong:** The existing `tailwind.config.ts` defines `primary` as sky blue (#0284c7 at 600) and `accent` as purple/fuchsia (#c026d3 at 600). These are the WRONG colors. The codebase has 303 occurrences of `primary-*` and 30 occurrences of `accent-*`. If the Tailwind config is updated to the correct teal/amber palette but the semantic scale (50–950) isn't restructured to match, components will get wrong shades. Worse: if `primary-600` becomes the teal accent `#0d9488` but `primary-100` is remapped to teal-tint, the `.btn-secondary` focus ring (which uses `focus:ring-primary-500`) may become unrecognizable.

**Why it happens:** Tailwind color scales are numeric (50–950) and imply relative lightness. Designers specify exact hex values; developers remap scales naively without verifying every shade is used.

**Consequences:** Hover states, focus rings, disabled states, badge tints — all defined relative to the scale — become wrong colors. Requires a second pass across all 45+ pages.

**Prevention:** Map the exact DESIGN.md hex values to explicit named tokens in tailwind.config.ts rather than building a full 50–950 scale. Use CSS variables (`--color-accent`, `--color-bg`, etc.) as the source of truth in globals.css, then expose them as Tailwind tokens via `theme.extend.colors`. Each token maps to exactly one variable, not a shade range.

```ts
// tailwind.config.ts - preferred approach
colors: {
  accent: 'var(--color-accent)',
  'accent-hover': 'var(--color-accent-hover)',
  'accent-light': 'var(--color-accent-light)',
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  'surface-raised': 'var(--color-surface-raised)',
  border: 'var(--color-border)',
  primary: 'var(--color-primary)',
  'text-secondary': 'var(--color-text-secondary)',
  'text-muted': 'var(--color-text-muted)',
  'text-inverse': 'var(--color-text-inverse)',
}
```

**Detection:** After remapping, grep for `primary-100`, `primary-200`, `accent-300` etc. Any shade-numbered references are red flags — they likely map to wrong values.

**Phase:** First task of any styling phase. Must be done before touching a single component.

---

### Pitfall 2: Dark Mode Flash of Wrong Theme (FOUC) on SSR

**What goes wrong:** Next.js App Router renders HTML on the server. The server does not know the user's saved theme preference (stored in localStorage). It renders the default (light) theme. The client hydrates, reads localStorage, and switches to dark — causing a visible flash. Without `suppressHydrationWarning` on the `<html>` element, React also throws hydration warnings because next-themes modifies `className` on `<html>` before hydration completes.

**Why it happens:** The `<html>` tag lives in `layout.tsx` as a server component. Theme state is client-only. The mismatch between server render and client reality causes both visual flash and React warnings.

**Consequences:** Every dark mode user sees a light flash on page load. React console errors. Potential hydration tree mismatch if any component renders differently based on theme before mount.

**Prevention:**
1. Install `next-themes`. Wrap content in `ThemeProvider` inside a `"use client"` wrapper component — not directly in `layout.tsx`.
2. Add `suppressHydrationWarning` to the `<html>` tag in `layout.tsx`.
3. Use `attribute="class"` on `ThemeProvider` so Tailwind's `darkMode: 'class'` works.
4. Any component that reads the current theme must use a `mounted` state guard — render a neutral skeleton until mounted to avoid hydration mismatch.

```tsx
// layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProviderWrapper> {/* "use client" wrapper */}
      {children}
    </ThemeProviderWrapper>
  </body>
</html>
```

**Detection:** Test with Chrome devtools → Network → Slow 3G throttle. Watch for a white flash before dark mode loads. Check console for hydration warnings.

**Phase:** Dark mode setup phase, before any `dark:` classes are written.

---

### Pitfall 3: Inter Font Not Removed — Two Font Stacks Coexist

**What goes wrong:** The current `layout.tsx` hardcodes `Inter` via `next/font/google` and applies `inter.className` to `<body>`. If General Sans and DM Sans are added but Inter is not removed, the body still inherits Inter's className applied to the `<body>` element. CSS specificity may let General Sans win for headings (if applied via a more specific class), but DM Sans for body copy will not override Inter unless the `<body>` class is fully replaced.

**Why it happens:** Developers add new font imports without removing the old one. The `inter.className` on `<body>` sets `font-family` globally; the new fonts need to be set via CSS variables that override this.

**Consequences:** Body text remains Inter. General Sans headlines may work. DM Sans is never applied. The typographic voice defined in DESIGN.md does not materialize.

**Prevention:** Replace `inter.className` entirely. Use CSS variable approach for both fonts:

```tsx
// layout.tsx - correct approach
import { DM_Sans } from 'next/font/google'
import localFont from 'next/font/local' // or Fontsource import

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// Apply both variables to html, not className to body
<html lang="en" className={`${dmSans.variable} ${generalSans.variable}`}>
```

**Warning sign:** After font setup, inspect the `<body>` element in Chrome DevTools computed styles. If `font-family` shows "Inter", the migration is incomplete.

**Phase:** Font setup must be the very first task — it affects every page.

---

### Pitfall 4: General Sans via Fontsource Loads All Weights Unnecessarily

**What goes wrong:** `@fontsource/general-sans` ships individual weight files. If the import in globals.css loads all weights (e.g., `@import '@fontsource/general-sans'`), it pulls in 300, 400, 500, 600, 700 — including italic variants — as separate `.woff2` files. Most will never be used. DESIGN.md only requires 600 and 700 for General Sans.

**Why it happens:** The default Fontsource import pattern loads everything. Developers copy the install example without trimming to needed weights.

**Consequences:** Unnecessary 100–200KB of font data. Extra network requests. Slower LCP (Largest Contentful Paint) on hero sections that rely on General Sans for h1 display text.

**Prevention:** Import only the specific weights used:

```css
/* globals.css — import only what DESIGN.md specifies */
@import '@fontsource/general-sans/600.css';
@import '@fontsource/general-sans/700.css';
```

Or use the variable font variant if available (`@fontsource-variable/general-sans`) for a single file with full range. Check Fontsource package contents before deciding.

**Detection:** Open Chrome DevTools Network tab → filter by "font". Count woff2 requests. More than 3 for General Sans is wasteful (600, 700, plus maybe variable).

**Phase:** Font setup phase.

---

### Pitfall 5: 1,260 Hardcoded `gray-*` Classes Not Systematically Replaced

**What goes wrong:** The codebase has 1,260 occurrences of `bg-gray-*`, `text-gray-*`, `border-gray-*` across 58 files. Simple find-replace is dangerous because:
- `gray-50` may mean "surface" in one context and "hover background" in another
- `gray-200` might be a border, a disabled state background, or a skeleton loader
- `gray-900` is likely body text but could also be a dark button

If each `gray-*` shade is mechanically mapped to a single design token, the wrong semantic token gets applied in some contexts. After replacing, the visual appearance changes in ways that break the UI without breaking tests.

**Why it happens:** Gray scales are overloaded — the same shade value is used for structurally different purposes. Mass find-replace cannot distinguish semantic intent.

**Consequences:** Modals with wrong surface colors, form borders that disappear in dark mode, hover states that clash with new warm neutrals.

**Prevention:** Do not bulk find-replace. Replace by component, reviewing each file visually. Use this mapping guide but apply judgment:

| Current class | Likely semantic intent | DESIGN.md token |
|---|---|---|
| `bg-gray-50` | page background | `bg-bg` (`#fafaf7`) |
| `bg-gray-100` | surface raised / hover | `bg-surface-raised` |
| `bg-white` | card surface | `bg-surface` |
| `text-gray-900` / `text-gray-800` | primary text | `text-primary` |
| `text-gray-600` / `text-gray-500` | secondary text | `text-text-secondary` |
| `text-gray-400` | muted text | `text-text-muted` |
| `border-gray-200` / `border-gray-100` | default border | `border-border` |
| `border-gray-300` | input border | `border-border` |
| `bg-gray-200` in skeleton | loading state | keep `bg-gray-200` or use `bg-surface-raised` |

Dark mode requires most of these to flip, so every `gray-*` must become a semantic token — not another hardcoded gray.

**Detection:** After restyling, grep for remaining `gray-` occurrences. Any that remain are dark-mode blind spots.

**Phase:** Every styling phase. Budget for this work per-component, not as a batch operation.

---

### Pitfall 6: `globals.css` Component Classes Become Invisible Tech Debt

**What goes wrong:** The existing `globals.css` defines `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input`, `.label`, `.card` using `@apply` with hardcoded `gray-*` and `primary-*` values. These classes are used throughout 45+ pages. If the Tailwind config is updated but `globals.css` is not — or if pages are restyled but some still use `.btn-primary` instead of explicit Tailwind utilities — the new design token system will have silent leaks where old gray/blue colors appear.

**Why it happens:** Shared component classes in `@layer components` are applied as opaque string classnames. Developers restyle pages with new utility classes on top, not realizing the base `.card` still has `bg-white rounded-xl shadow-sm border border-gray-100`.

**Consequences:** Cards look almost right but have wrong border radius (xl=12px, DESIGN.md says md=8px for cards), wrong border color (`gray-100` vs `#e5e5e0`), wrong shadow.

**Prevention:** Treat `globals.css` as the first file to update, not the last. Update every `@layer components` class to use the new token names before touching any page. This ensures that pages still using shorthand classes like `.card` automatically inherit the correct design.

**Detection:** Audit `globals.css` after initial token setup. Verify `.card` uses `rounded-md` (8px) not `rounded-xl` (12px) — DESIGN.md specifies `md: 8px` for cards.

**Phase:** Must be done in the same phase as Tailwind config token update (Phase 1).

---

## Moderate Pitfalls

Issues that create real work but don't require rewrites.

---

### Pitfall 7: Dark Mode Missing from Form States and Interactive Elements

**What goes wrong:** Developers apply `dark:` classes to backgrounds and text but miss interactive states: focus rings, placeholder text, disabled inputs, select dropdowns, checkboxes, radio buttons. These elements often use browser-native styling that ignores dark mode CSS unless explicitly overridden.

**Why it happens:** Dark mode is tested with basic page layouts. Form-heavy pages (buyer create ad, owner register, profile, admin billing settings) are tested last or not at all.

**Consequences:** On dark mode, form inputs may show white backgrounds with white text, making them unreadable. Focus rings may be invisible.

**Prevention:** Define a dark mode variant for every form element in `globals.css`:
```css
.input {
  @apply ... border-border bg-surface text-primary placeholder:text-text-muted;
  @apply dark:bg-surface dark:border-border dark:text-primary;
}
```

Ensure the dark mode CSS variables in `:root.dark` or `[data-theme=dark]` cover all surface and border tokens.

**Detection:** Test every form page in dark mode. Check: placeholder text visible, input background correct, focus ring visible (teal `--color-accent-light` on dark), disabled state has appropriate opacity.

**Phase:** Dark mode implementation phase.

---

### Pitfall 8: `max-w-7xl` vs `max-w-5xl` Content Width Mismatch

**What goes wrong:** The existing header uses `max-w-7xl` (1280px). DESIGN.md specifies max content width of 1120px (`max-w-5xl` equivalent). If the header keeps `max-w-7xl` but page content uses the new 1120px width, the nav and content columns will not align horizontally on wide screens.

**Why it happens:** The header is often the last component updated, or it's updated separately from page layouts.

**Consequences:** Navigation items sit wider than page content, creating visual misalignment. The header nav effectively has wider gutters than the page.

**Prevention:** Update the header and footer in the first component pass. Establish a `max-w-[1120px]` utility or custom class in tailwind.config.ts as the canonical container width, then apply it everywhere consistently. Do not mix `max-w-5xl` and `max-w-7xl`.

**Detection:** Temporarily add a `border border-red-500` to the content container and header nav container. They should align on a 1280px+ viewport.

**Phase:** Shared component phase (header/footer), which should happen early.

---

### Pitfall 9: `rounded-xl` Used Universally — Violates DESIGN.md Radius Scale

**What goes wrong:** The existing `.card` class uses `rounded-xl` (12px). DESIGN.md specifies `md: 8px` for cards and `lg: 12px` only for larger cards, modals, and hero sections. The AI slop blacklist explicitly calls out "uniform bubbly border-radius on all elements." Using `rounded-xl` everywhere is exactly this pattern.

**Why it happens:** `rounded-xl` is the default card pattern in most Tailwind starter kits. It gets copied without checking the design spec.

**Consequences:** The industrial/utilitarian aesthetic softens into generic SaaS. Cards feel more like consumer apps than a data-forward fintech.

**Prevention:** Use Tailwind's default named radius values:
- `rounded` (4px) — badges, small elements
- `rounded-md` (6px, close enough to 8px) — buttons, inputs, cards
- `rounded-lg` (8px) — larger cards, modals
Use `rounded-xl` or `rounded-2xl` nowhere except full pills (`rounded-full`).

Note: Tailwind's default `rounded-md` is 6px, not 8px. Add a custom `rounded-card: '8px'` to tailwind.config.ts to hit the exact spec value.

**Detection:** grep for `rounded-xl` after restyling. Every match is a potential violation of DESIGN.md.

**Phase:** Any styling phase. Catch during QA.

---

### Pitfall 10: AI Slop Patterns Already Present Get Re-introduced During Restyling

**What goes wrong:** DESIGN.md has a specific blacklist. The current codebase already contains some of these patterns (e.g., the owner marketing page likely uses icon-in-circle feature grids, the homepage uses centered layout). During restyling, a developer might fix colors and fonts but faithfully reproduce the same layout structure — just in the new color palette — without realizing the layout itself is on the blacklist.

**Why it happens:** Developers treat restyling as "update colors and fonts, preserve layout." The AI slop blacklist requires structural layout changes, not just token swaps.

**Consequences:** The hero still looks like every other proptech site. The homepage feature section still has the generic 3-column icon grid. The restyled product fails its differentiation goal.

**Prevention:** Before restyling each page, run it against the DESIGN.md AI slop blacklist explicitly:
- Is hero text centered? → Left-align it
- Are there icon-in-circle cards? → Redesign as text-forward data cards
- Are there SVG decorative patterns? → Remove them
- Are stats hardcoded/fake? → Wire to real DemandSignal data or remove
- Is there a purple/violet gradient anywhere? → Remove entirely

**Detection:** QA mode in CLAUDE.md flags code not matching DESIGN.md. Do a dedicated blacklist audit after all pages are restyled.

**Phase:** Every page restyling phase. Final QA phase is mandatory.

---

### Pitfall 11: Tabular Nums Not Applied to Data Tables and Stats

**What goes wrong:** DESIGN.md specifies `font-variant-numeric: tabular-nums` for DM Sans on data/tables. This makes numbers align in columns (preventing column jitter as values change). This is critical for the admin billing pages, dashboard stats, and the demand score display. If omitted, number columns visually wobble and the "data-forward" aesthetic is undermined.

**Why it happens:** `tabular-nums` is not a Tailwind default utility in v3. Developers familiar with Tailwind don't know it exists and don't add it.

**Prevention:** Add a custom utility or use Tailwind's `tabular-nums` class (it exists in Tailwind v3 under `font-variant-numeric`). Apply it as part of the table/data component classes.

```css
/* tailwind.config.ts already supports this: */
/* className="tabular-nums" */
```

Verify `tabular-nums` is in the Tailwind v3 docs — it is, under `Font Variant Numeric`. Apply to all numeric columns in tables, stat displays, and price fields.

**Detection:** Find all numeric dashboard values and billing table cells. Check devtools computed styles for `font-variant-numeric: tabular-nums`.

**Phase:** Dashboard, admin, and any data-heavy page phase.

---

## Minor Pitfalls

---

### Pitfall 12: Amber Secondary Color Conflicts With Error Red

**What goes wrong:** DESIGN.md uses `#d97706` (warm amber) as the secondary color for urgency signals AND `#dc2626` (red) for errors. Both are warm-spectrum colors. If amber is applied too liberally (e.g., on form validation warnings), users may confuse warning states with error states.

**Prevention:** Amber is for urgency/highlights (e.g., "property is in high demand"). Red is for form errors and destructive actions. Never use amber on form validation — only red. Define a clear semantic mapping in component conventions.

**Phase:** Form component restyling phase.

---

### Pitfall 13: `bg-gray-50` on `<body>` Replaced but Sub-Layouts Still Inherit Gray

**What goes wrong:** The current `layout.tsx` sets `bg-gray-50` on the outermost div. Changing this to `bg-bg` (`#fafaf7`) is straightforward. However, sub-layouts — notably `apps/web/src/app/admin/layout.tsx` — may have their own background colors that are not updated in the same pass.

**Prevention:** Search for all `layout.tsx` files (not just the root one) and update their background color. The admin layout likely has a sidebar or different surface color that also needs migrating.

**Detection:** `grep -r "bg-gray-50\|bg-white" apps/web/src/app/*/layout.tsx`

**Phase:** First page restyling pass.

---

### Pitfall 14: `text-primary-600` in Header Logo Becomes Wrong Teal Shade

**What goes wrong:** The header logo uses `text-primary-600` for "OffMarket" and `text-gray-900` for "NZ". After remapping the color tokens, `primary-600` must correctly resolve to `#0d9488` (teal accent), not to some intermediate teal shade. This is a brand-critical element — it's wrong on every page if misconfigured.

**Prevention:** After remapping the Tailwind config, manually verify the header logo color in both light and dark mode. It should be `#0d9488` in light mode and the dark-mode reduced-saturation teal in dark mode.

**Phase:** Header component restyling — verify immediately.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Tailwind config token remap | Wrong shade values silently applied everywhere (Pitfall 1) | Map only semantic tokens, not shade ranges; verify with DevTools |
| Font setup | Inter persists on `<body>` alongside new fonts (Pitfall 3) | Remove `inter.className` completely; use CSS variable approach |
| Font setup | Fontsource loads all General Sans weights (Pitfall 4) | Import only 600.css and 700.css |
| globals.css update | `.card` radius stays at xl, wrong border color (Pitfall 6) | Update globals.css in same phase as token remap |
| Dark mode setup | FOUC / hydration warning on every page load (Pitfall 2) | Add `suppressHydrationWarning`, use next-themes properly |
| Header/footer component | max-w-7xl misaligns with 1120px content width (Pitfall 8) | Update header container width first |
| Page restyling (any page) | gray-* replaced incorrectly for context (Pitfall 5) | Replace per-component with semantic intent review |
| Page restyling (any page) | AI slop patterns preserved through restyling (Pitfall 10) | Explicit blacklist check per page before marking done |
| Form pages | Dark mode invisible inputs (Pitfall 7) | Test every form in dark mode after dark: classes added |
| Dashboard / admin pages | Numbers not tabular-nums aligned (Pitfall 11) | Apply tabular-nums utility to all numeric columns |
| QA / final pass | rounded-xl scattered throughout (Pitfall 9) | grep for rounded-xl; check each against radius scale |

---

## Sources

- Next.js Font Optimization: https://nextjs.org/docs/app/getting-started/fonts
- Fontsource Next.js Guide: https://fontsource.org/docs/guides/nextjs
- next-themes GitHub: https://github.com/pacocoursey/next-themes
- Next.js dark mode hydration discussion: https://github.com/vercel/next.js/discussions/53063
- Fixing dark mode FOUC: https://notanumber.in/blog/fixing-react-dark-mode-flickering
- Tailwind dark mode strategies: https://prismic.io/blog/tailwind-css-darkmode-tutorial
- WCAG contrast checker: https://webaim.org/resources/contrastchecker/
- Tailwind large codebase pitfalls: https://medium.com/@vishalthakur2463/tailwind-css-in-large-projects-best-practices-pitfalls-bf745f72862b
- Tailwind alchemist color finder: https://www.einenlum.com/articles/tailwind-alchemist-find-all-tailwind-colors-in-your-codebase/
