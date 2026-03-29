# Phase 1: Foundation - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

The design system token layer is live — Tailwind config rewritten with DESIGN.md semantic colors/spacing/radius, CSS custom properties defined for light and dark modes, General Sans + DM Sans + JetBrains Mono loaded via next/font, ThemeProvider wired with suppressHydrationWarning, and globals.css component classes updated to reference new tokens. No page-specific UI work. No toggle component (Phase 2). No page restyling (Phases 2-7).

</domain>

<decisions>
## Implementation Decisions

### Font Loading
- **D-01:** General Sans woff2 stored in `src/app/fonts/` and loaded via `next/font/local` (Next.js convention, co-located with layout.tsx)
- **D-02:** Inter removed by swapping the import in `layout.tsx` only — no full-codebase audit needed (Inter is only referenced in layout.tsx lines 2 and 68)

### CSS Variables & Tailwind Config
- **D-03:** CSS custom properties map 1:1 to DESIGN.md token names — no extra abstraction layers or intermediate aliases
- **D-04:** Old Tailwind color scales (`primary-50` through `primary-950`, `accent-50` through `accent-950`) removed entirely — clean break, not aliased. Pages show wrong colors until restyled in Phases 2-7; this is expected.
- **D-05:** Border-radius scale overrides Tailwind defaults: `rounded-sm=4px`, `rounded-md=8px`, `rounded-lg=12px`, `rounded-full=9999px`
- **D-06:** Spacing uses Tailwind defaults (p-2=8px, p-4=16px, etc.) — no custom named aliases. Only `2xs` (2px) added as custom token per DESIGN.md.
- **D-07:** `max-w-site: 1120px` defined in tailwind.config.ts as a foundation token for all phases to consume

### Dark Mode
- **D-08:** Phase 1 wires ThemeProvider + dark CSS variables + suppressHydrationWarning only. The toggle component ships in Phase 2 with the Header restyle.
- **D-09:** globals.css component classes (.btn-primary, .card, .input, etc.) rewritten to use new DESIGN.md tokens in Phase 1 per FOUN-13

### Grain Texture
- **D-10:** CSS-only SVG noise filter via `feTurbulence` in globals.css — zero file assets, works in both light and dark mode with opacity adjustment

### Shipping Strategy
- **D-11:** One PR with multiple coherent commits (fonts, config, CSS vars, ThemeProvider, globals.css). No broken intermediate state on main. Each logical unit gets its own commit.

### Claude's Discretion
- **Font acquisition method:** Claude picks the simplest reliable approach to get GeneralSans-Variable.woff2 into `src/app/fonts/` (manual prerequisite vs automated script)
- **next-themes configuration:** Claude picks standard config (attribute, defaultTheme, storageKey) based on best practices

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN.md` — Single source of truth for all visual decisions: typography scale, color palette, spacing, border-radius, dark mode spec, grain texture, AI slop blacklist
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Detailed token values, CSS variable names, Tailwind config structure, and exemption notes for Phase 1

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions (dark mode included, motion deferred, no new features)
- `.planning/REQUIREMENTS.md` — FOUN-01 through FOUN-15 requirements with acceptance criteria
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, dependency chain

### Codebase Reference
- `.planning/codebase/STACK.md` — Technology stack details (Tailwind 3.4.16, Next.js 15.1, React 19)
- `.planning/codebase/CONVENTIONS.md` — Coding conventions, import patterns, module design

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/providers.tsx` — Existing Providers wrapper component; ThemeProvider should be added here
- `apps/web/src/app/layout.tsx` — Root layout with font loading (Inter) and body className application
- `apps/web/src/app/globals.css` — Existing component classes (.btn-primary, .card, .input) to rewrite

### Established Patterns
- Font loading via `next/font/google` in layout.tsx — General Sans will use `next/font/local` instead
- Tailwind config uses `satisfies Config` type annotation
- Content paths already configured for src/pages, src/components, src/app

### Integration Points
- `apps/web/tailwind.config.ts` — Complete rewrite of colors, add border-radius, add max-width
- `apps/web/src/app/globals.css` — CSS custom properties in `:root` and `.dark`, rewrite component classes
- `apps/web/src/app/layout.tsx` — Font swap (Inter -> General Sans + DM Sans), add suppressHydrationWarning to html element
- `apps/web/src/components/providers.tsx` — Wrap with ThemeProvider from next-themes
- `apps/web/postcss.config.js` — May need update if PostCSS plugins change (likely no change needed)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within DESIGN.md spec.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-30*
