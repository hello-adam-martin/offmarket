# Project Research Summary

**Project:** OffMarket NZ — Design System Overhaul
**Domain:** Next.js 15 / Tailwind CSS v3.4 design system implementation on existing marketplace app
**Researched:** 2026-03-30
**Confidence:** HIGH

## Executive Summary

OffMarket NZ is an existing 45-page Next.js 15 + React 19 + Tailwind CSS 3.4 marketplace app that needs a pixel-perfect design system overhaul to match DESIGN.md. The current codebase uses the wrong color palette (sky blue + fuchsia instead of teal + warm neutrals), the wrong font (Inter instead of General Sans + DM Sans), no dark mode, no CSS custom properties, and contains multiple patterns explicitly blacklisted by DESIGN.md. The entire problem is a structural mismatch between the existing Tailwind config and the DESIGN.md specification — fixing the foundation (tailwind.config.ts, globals.css, layout.tsx) cascades correctly to roughly 80% of the visual work across all 45 pages automatically.

The recommended approach is a strict layer-by-layer implementation: foundation first (color tokens, CSS variables, fonts, dark mode provider), then primitives (button/card/input classes in globals.css), then shared structural components (header, footer), then pages in descending order of public visibility. This order is non-negotiable — the config changes cascade downward, and touching page components before the foundation is complete produces broken intermediate states. The only new dependency is `next-themes` (v0.4.6); all other tools are already installed or built into Next.js 15.

The key risks are (1) the 1,260 hardcoded `gray-*` class references that cannot be safely bulk-replaced and require per-component semantic review, (2) the dark mode flash-of-unstyled-content problem on SSR that requires `suppressHydrationWarning` and a client-side ThemeProvider wrapper, and (3) the General Sans font which is not available via Fontsource and must be self-hosted using `next/font/local` after downloading from Fontshare. Research confidence is HIGH across all four areas — all findings are based on direct codebase inspection, official documentation, and verified API/registry checks.

---

## Key Findings

### Recommended Stack

The existing stack (Next.js 15.1, React 19, Tailwind 3.4.16, Headless UI 2.2.9) is correct and does not need to change. The implementation requires only one new package: `next-themes` v0.4.6 for dark mode theme management with SSR safety. Tailwind should be configured with `darkMode: 'selector'` (the v3.4.x canonical option, equivalent to `'class'`) so that `dark:` utilities activate when `.dark` is on `<html>`.

Font loading is the most non-obvious piece: General Sans is NOT on Google Fonts and NOT in the Fontsource registry (verified via API — returns 404). It must be self-hosted via `next/font/local` after downloading `GeneralSans-Variable.woff2` from Fontshare (free commercial license). DM Sans and JetBrains Mono are Google Fonts and should be loaded via `next/font/google` (not CDN links, not Fontsource) for automatic self-hosting, CLS prevention, and subset handling.

**Core technologies:**
- `next/font/local`: Load self-hosted General Sans variable font — only option since Fontsource does not carry this font
- `next/font/google`: Load DM Sans + JetBrains Mono — superior to CDN links; self-hosts at build time, eliminates external requests
- `next-themes` v0.4.6: Dark mode with SSR safety, localStorage persistence, system preference detection — industry standard for Next.js
- Tailwind `darkMode: 'selector'`: Activates `dark:` utilities via `.dark` class on `<html>` — required for class-based dark mode
- CSS custom properties in `globals.css`: Single source of truth for all DESIGN.md color tokens; auto-adapts on dark mode toggle without per-class `dark:` variants
- Tailwind `theme.extend.colors` with `var()` references: Maps CSS variables to semantic utility classes (`bg-surface`, `text-accent`, `border-border`)

**Do not use:**
- `@fontsource/general-sans` — package does not exist (404 confirmed)
- Google Fonts CDN `<link>` tags — external requests, no CLS protection, Next.js docs recommend against
- Tailwind CSS v4 — breaking config format change, out of scope for this milestone
- Per-element `dark:` variants without CSS variables — unworkable at 45-page scale

### Expected Features

The overhaul covers three levels of change: token-level (colors, fonts, spacing), primitive-level (button/card/input classes), and structural-level (layout violations on specific pages).

**Must have (table stakes):**
- CSS custom property setup in `globals.css` `:root` — foundation for all theming
- Tailwind config color token realignment — every `primary-*`/`accent-*` class is currently wrong
- Font system replacement — Inter is wrong at the root; every page inherits the wrong typographic voice
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` restyling — globals.css change cascades to all 45 pages
- `.card`, `.input`, `.label` restyling — same cascade, same ROI
- Header and footer restyling — present on all 45 pages; wrong colors, wrong max-width (1280px vs 1120px), wrong logo color
- Homepage hero redesign — contains 3+ blacklist violations (gradient background, SVG pattern, centered text)
- Dark mode implementation — DESIGN.md fully specifies dark surfaces; zero dark mode exists currently
- Responsive container width correction — all pages use `max-w-7xl` (1280px), DESIGN.md specifies 1120px
- Semantic color tokens (success/warning/error/info) — replace ad-hoc `text-green-500`/`text-red-500`

**Should have (differentiators):**
- Tabular-nums on all financial and data displays — makes admin billing and dashboard read as fintech-grade
- Warm off-white background (#fafaf7) throughout — prevents clinical SaaS feel
- Left-aligned hero text — explicitly differentiates from NZ property site conventions
- Data-forward hero with real demand numbers — replaces generic "Find Your Dream Home" copy with live DemandSignal data
- Consistent border-radius scale (4px/8px/12px by intent, not uniform `rounded-xl` everywhere)
- Match score visualization on owner property detail — proprietary UI pattern, potential standout feature
- Demand signal numbers on explore/region pages — data already exists, needs presentation upgrade

**Defer:**
- Grain texture on cards — nice-to-have, add last after all structural work is complete
- Motion and animation — explicitly deferred per PROJECT.md
- Generic hero copy rewrite — out of scope per PROJECT.md (restyling only, no content changes)
- Tailwind CSS v4 migration — breaking change, separate milestone

### Architecture Approach

The architecture is a strict 5-layer dependency stack where no layer can be implemented before the layer above it is complete. Layer 0 (Tailwind config + CSS variables + fonts + dark mode provider) must ship atomically because the config, variables, fonts, and layout.tsx are so tightly coupled that any partial state leaves the app broken. Layers flow downward: config defines utilities, variables define tokens, layout applies base styles, primitives consume both, shared components consume primitives, and pages consume all of the above.

**Major components:**
1. `tailwind.config.ts` — Replace numeric color scale with semantic tokens mapped to CSS variables; add `darkMode: 'selector'`; add font families; add custom border-radius values
2. `globals.css` — Define `:root` CSS variable set and `.dark` overrides; update all `@layer components` primitives (btn, card, input, label) to reference new tokens
3. `layout.tsx` — Replace Inter with DM Sans + General Sans via `next/font`; update body classes; add `suppressHydrationWarning` to `<html>`; wrap with ThemeProvider
4. `components/ThemeProvider.tsx` (new) — Client component managing `.dark` class on `<html>` via next-themes; persists to localStorage
5. `components/header.tsx` + `components/footer.tsx` — Restyle using new palette; fix container width to 1120px; apply dark mode surfaces
6. Shared modals (ContactBuyerModal, PaymentModal, PostcardRequestModal, UpgradeModal) — Restyle before page groups to avoid rework
7. Pages in 5 groups (Public → Buyer → Owner → User App → Admin) — Consume foundation layers; audit each against AI slop blacklist

### Critical Pitfalls

1. **Wrong color palette wired into Tailwind config** — Map only semantic tokens (not numeric shade ranges) via CSS variables. After remapping, grep for `primary-100`, `accent-300` — any shade-numbered references are red flags pointing to wrong values in hover/focus/disabled states.

2. **Dark mode flash of wrong theme (FOUC) on SSR** — Add `suppressHydrationWarning` to `<html>` in layout.tsx. Wrap content in a `"use client"` ThemeProvider (not directly in layout.tsx). Any component reading the current theme must gate on a `mounted` state before rendering to avoid hydration mismatch.

3. **Inter font not removed — two font stacks coexist** — Remove `inter.className` from `<body>` entirely. Apply DM Sans + General Sans as CSS variable classes on `<html>`, not as className on `<body>`. Verify in Chrome DevTools: if computed `font-family` shows "Inter", the migration is incomplete.

4. **1,260 hardcoded `gray-*` classes not systematically replaced** — Do not bulk find-replace. Replace per-component with semantic intent review (e.g., `bg-gray-50` is "background" in one context and "hover state" in another). Every remaining `gray-*` after restyling is a dark mode blind spot.

5. **globals.css component classes become invisible tech debt** — Update every `@layer components` class (`.btn`, `.card`, `.input`) in the same phase as the Tailwind config token update. Pages still using `.card` will silently inherit wrong border-radius, wrong border color, and wrong shadow if globals.css is not updated atomically with the config.

---

## Implications for Roadmap

Based on research, the dependency structure demands a 8-phase implementation ordered by layer depth and visual impact.

### Phase 1: Foundation (Atomic)
**Rationale:** Tailwind config, CSS variables, fonts, and dark mode provider are so tightly coupled that shipping any one without the others creates a broken intermediate state. This must be a single atomic commit.
**Delivers:** Color token system live; dark mode mechanism active; correct fonts applied globally; all 45 pages immediately inherit ~60% of correct colors and typography
**Addresses:** CSS variables setup, Tailwind realignment, font system replacement
**Avoids:** Pitfall 1 (wrong color scale), Pitfall 3 (dual font stacks), Pitfall 2 (FOUC — dark mode provider setup happens here)
**Files:** `tailwind.config.ts`, `globals.css` (`:root` + `.dark` + primitives), `layout.tsx`, `components/providers.tsx`, new `components/ThemeProvider.tsx`

### Phase 2: Shared Structural Components
**Rationale:** Header and footer appear on all 45 pages. Fixing them site-wide immediately raises visual coherence before any page-specific work.
**Delivers:** Correct brand identity on all pages; 1120px container width enforced; logo teal color correct
**Addresses:** Header restyling, footer restyling, max-width correction
**Avoids:** Pitfall 8 (container width misalignment)
**Files:** `components/header.tsx`, `components/footer.tsx`

### Phase 3: Shared Modals and Form Primitives
**Rationale:** Modals and shared form components (image upload, address autocomplete) are used across multiple page groups. Restyling them once here avoids rework during Phases 4–8.
**Delivers:** All modal and form shared components correct before any page group work begins
**Addresses:** ContactBuyerModal, PaymentModal, PostcardRequestModal, UpgradeModal, PropertyImageUpload, AddressAutocomplete
**Avoids:** Pitfall 7 (dark mode missing from form states — addressed in globals.css `.input` dark variant setup)

### Phase 4: Public Pages
**Rationale:** Highest public visibility; homepage has the highest concentration of AI slop blacklist violations (gradient background, SVG pattern, centered layout). Fixing public pages first signals the design system is real.
**Delivers:** Homepage, explore, region, auth, help, privacy, terms all correctly styled and blacklist-compliant
**Addresses:** Homepage hero redesign, explore page (filter panel, demand cards), auth/signin
**Avoids:** Pitfall 10 (AI slop patterns re-introduced — explicit blacklist audit per page required)

### Phase 5: Buyer Pages
**Rationale:** Core buyer conversion flow; form-heavy pages with data display requirements.
**Delivers:** Create ad form, my ads listing, postcards, wanted detail all styled
**Addresses:** Buyer/create (multi-step form), buyer/my-ads (status badges), postcards
**Avoids:** Pitfall 5 (gray-* semantic review per component), Pitfall 7 (dark mode on form inputs)

### Phase 6: Owner Pages
**Rationale:** Core owner conversion flow; property cards and match score visualization are differentiator UI.
**Delivers:** Owner landing, register, my properties, property detail with match score display
**Addresses:** Owner/register (form), owner/my-properties (property cards), owner/properties/[id] (match score)
**Avoids:** Pitfall 9 (rounded-xl audit), Pitfall 10 (blacklist check on owner landing marketing page)

### Phase 7: User App Pages
**Rationale:** Dashboard and app-core pages; data display is dense and requires tabular-nums treatment.
**Delivers:** Dashboard, profile, inquiries, notifications, upgrade/pricing, claim flow, saved searches
**Addresses:** Dashboard (stat cards), upgrade (pricing cards), inquiries (message thread)
**Avoids:** Pitfall 11 (tabular-nums missing from dashboard stats)

### Phase 8: Admin Pages
**Rationale:** Internal tool; lowest public visibility. Financial data tables require tabular-nums and proper table styling.
**Delivers:** Admin dashboard, users, billing (subscriptions/escrows/settings), email templates, postcards
**Addresses:** Admin data tables, status badges, financial display
**Avoids:** Pitfall 11 (tabular-nums critical for billing columns), Pitfall 12 (amber vs red semantic confusion in status badges)

### Phase Ordering Rationale

- Foundation must be atomic (Phase 1) because the Tailwind config defines utilities that globals.css references, which layout.tsx consumes — none of them work in isolation
- Shared components (Phases 2–3) before pages because header/footer render on every page and modals appear in multiple page groups — fix once, benefit everywhere
- Public pages (Phase 4) before app pages because they have the most blacklist violations and the highest conversion impact
- Admin pages (Phase 8) last because they have the lowest public visibility and are internal tools
- Dark mode is threaded throughout every phase rather than bolted on at the end — CSS variables handle ~90% of dark mode automatically once Phase 1 is complete

### Research Flags

Phases with well-documented patterns (skip additional research):
- **Phase 1:** Tailwind config + CSS variables + next-themes integration is a well-documented pattern; research already verified all API surface areas
- **Phase 2:** Header/footer restyling follows standard Tailwind patterns; no novel dependencies
- **Phases 5–8:** Routine Tailwind restyling; no new patterns introduced

Phases that may warrant deeper review during planning:
- **Phase 4 (Homepage hero):** Left-aligned data-forward hero with live DemandSignal data requires design decisions not fully specified in DESIGN.md — confirm which DemandSignal fields to surface and what the hero grid structure should be
- **Phase 3 (PaymentModal):** Payment UI has accessibility and trust-signal requirements beyond visual styling — confirm no functional behavior changes are inadvertently introduced

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings verified: Next.js 15 font docs (updated 2026-03-25), next-themes npm registry, Tailwind v3 dark mode docs, Fontsource API 404 for general-sans confirmed |
| Features | HIGH | Based on direct codebase inspection of all 45+ pages against DESIGN.md — not inference |
| Architecture | HIGH | Layer model is well-established; dependency order verified by tracing actual imports and class references in the codebase |
| Pitfalls | HIGH | All pitfalls sourced from direct codebase grep counts (1,260 gray-* occurrences, 303 primary-* occurrences) or verified technical constraints (SSR + localStorage, Fontsource 404) |

**Overall confidence:** HIGH

### Gaps to Address

- **General Sans font download:** Implementation requires a manual step — download `GeneralSans-Variable.woff2` from Fontshare before Phase 1 can be completed. Not a package install; must be remembered as a prerequisite.
- **Homepage hero data wiring:** DESIGN.md calls for data-forward hero content using real DemandSignal values. The exact fields, display format, and fallback behavior when data is unavailable need confirmation before Phase 4 implementation begins.
- **Grain texture implementation:** DESIGN.md specifies a "very light warm grain on card backgrounds." The exact implementation (CSS noise filter vs SVG filter vs image) was not researched — low priority but needs a decision before marking Phase 1 truly complete.
- **`rounded-md` vs 8px discrepancy:** Tailwind's default `rounded-md` is 6px; DESIGN.md specifies 8px for cards/buttons. A custom `borderRadius` entry in `tailwind.config.ts` is needed (e.g., `card: '8px'`). Document this as a named token in Phase 1.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `apps/web/tailwind.config.ts`, `globals.css`, `layout.tsx`, `page.tsx`, `header.tsx`, `footer.tsx`, `providers.tsx`, `UpgradeModal.tsx`
- `DESIGN.md` at repo root — authoritative design specification
- Next.js Font docs (updated 2026-03-25): https://nextjs.org/docs/app/api-reference/components/font
- Tailwind CSS v3 Dark Mode: https://v3.tailwindcss.com/docs/dark-mode
- next-themes GitHub v0.4.6: https://github.com/pacocoursey/next-themes
- npm next-themes registry: https://www.npmjs.com/package/next-themes
- Fontsource API (404 for general-sans confirmed): https://api.fontsource.org/v1/fonts/general-sans
- Fontshare General Sans: https://www.fontshare.com/fonts/general-sans

### Secondary (MEDIUM confidence)
- Fontsource Next.js Guide: https://fontsource.org/docs/guides/nextjs
- Next.js dark mode hydration: https://github.com/vercel/next.js/discussions/53063
- Fixing dark mode FOUC: https://notanumber.in/blog/fixing-react-dark-mode-flickering

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
