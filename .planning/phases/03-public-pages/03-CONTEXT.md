# Phase 3: Public Pages - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Every public-facing page is styled to DESIGN.md and free of all AI slop blacklist violations. Pages in scope: homepage (page.tsx + DemandChecker), explore/browse, region pages, auth/signin, help/FAQ, privacy policy, terms of service. No new features. No backend changes. No content rewriting beyond removing AI slop copy (e.g., "Find Your Dream Home").

</domain>

<decisions>
## Implementation Decisions

### Homepage Hero
- **D-01:** Hero leads with live demand stats — active buyer count, regions with demand, avg budget. Data is the hero, not marketing copy. Teal CTA buttons below the stats.
- **D-02:** Hero background is warm off-white (`bg-surface` / `#fafaf7` light, `#0f0f1a` dark). No gradient, no SVG pattern, no colored background.
- **D-03:** Trust indicators row removed entirely. The data-forward approach IS the trust signal.
- **D-04:** Fallback when demand data unavailable: show static left-aligned value proposition copy about the reverse marketplace concept. No numbers shown, no skeleton loader.
- **D-05:** Hero text is left-aligned per DESIGN.md. The "Find Your Dream Home" copy is replaced with data-forward messaging.

### Homepage Sections
- **D-06:** All section headings left-aligned across the entire homepage. No centered text blocks anywhere.
- **D-07:** How It Works section: numbered steps (1, 2, 3) in plain left-aligned text. No icon-in-circle cards, no colored background panels (no `bg-primary-50`, `bg-accent-50`).
- **D-08:** Stats row: keep but restyle with `tabular-nums`, semantic color tokens, `max-w-site`. Grid layout acceptable for stats since it reads well as a data display.
- **D-09:** Demand Checker section: keep on homepage, restyle container with DESIGN.md tokens, left-align section heading, remove the pill badge pattern ("For Property Owners" badge).
- **D-10:** All sections switch from `max-w-7xl` (1280px) to `max-w-site` (1120px).

### Legal/Content Pages
- **D-11:** Privacy and Terms pages: drop `prose prose-gray` plugin. Use DESIGN.md semantic tokens directly — `text-primary` for headings (General Sans), `text-secondary` for body (DM Sans), `bg-surface`, `max-w-site`.
- **D-12:** Help/FAQ: keep accordion expand/collapse pattern. Restyle with DESIGN.md tokens — surface cards, `border-border`, accent color for expand/collapse icon. Left-aligned headings and content.

### Auth/Signin Page
- **D-13:** Auth page keeps centered card layout — this is a UX convention exception to the left-align-everything rule. Card restyled with `.card` class, semantic tokens, teal focus rings on inputs.
- **D-14:** Google OAuth button retains Google brand colors (white bg, Google 'G' icon with brand colors) as a trust signal. Not restyled to DESIGN.md button variants.

### Explore/Browse & Region Pages
- **D-15:** Explore page: swap `max-w-7xl` to `max-w-site`, replace all `gray-*` hardcoded colors with semantic tokens. Loading skeleton uses semantic surface colors instead of `bg-gray-200`.
- **D-16:** Region pages: same token swap treatment. Both pages already use BrowsePageClient and RegionPageClient components which were restyled in Phase 2 — page-level wrappers just need container and skeleton updates.

### Claude's Discretion
- Homepage section ordering and vertical rhythm/spacing between sections
- Exact demand stats to surface in hero (which API fields) — Claude picks what's available
- CTA section at bottom of homepage — restyle or remove based on DESIGN.md compliance
- Testimonials section treatment — restyle or remove if it has AI slop patterns
- Responsive breakpoint adjustments for hero and sections
- FAQ category tab styling (general/buyers/owners tabs in help page)

### Folded Todos
None.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN.md` — Single source of truth: typography, color palette, spacing, dark mode, AI slop blacklist (critical for homepage cleanup)
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Token values, CSS variable names, Tailwind config

### Phase Outputs (Foundation + Shared Components)
- `apps/web/tailwind.config.ts` — Semantic tokens: `bg-surface`, `text-primary`, `text-secondary`, `border-border`, `max-w-site`
- `apps/web/src/app/globals.css` — CSS variables, `.btn-primary`, `.btn-secondary`, `.card`, `.input` classes
- `apps/web/src/components/ThemeProvider.tsx` — Dark mode provider

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — PUBL-01 through PUBL-07 requirements
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria

### Codebase Reference
- `.planning/codebase/STRUCTURE.md` — File organization, page locations
- `.planning/codebase/CONVENTIONS.md` — Coding patterns, import conventions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.card` CSS class (globals.css) — Phase 2 output, use for auth card, FAQ items, any card containers
- `.btn-primary`, `.btn-secondary` CSS classes — Phase 2 output, use for all CTA buttons
- `.input` CSS class — Phase 2 output, use for auth form inputs
- `DemandChecker` component (`src/components/demand-checker.tsx`, 167 lines) — Already functional, needs token swap only
- `BrowsePageClient` (`src/components/browse/BrowsePageClient.tsx`, 334 lines) — Restyled in Phase 2
- `RegionPageClient` (`src/components/browse/RegionPageClient.tsx`, 555 lines) — Restyled in Phase 2
- `EmptyState` component — Restyled in Phase 2, used in explore pages

### Established Patterns
- All components use "use client" with direct Tailwind class application
- Homepage is a server component (no "use client") except DemandChecker
- Legal pages (privacy, terms) are server components with metadata exports
- Help/FAQ is a client component with useState for accordion

### Integration Points
- `apps/web/src/app/page.tsx` (692 lines) — Homepage, largest file, most AI slop to clean
- `apps/web/src/app/explore/page.tsx` — Wraps BrowsePageClient with loading skeleton
- `apps/web/src/app/explore/[region]/page.tsx` — Wraps RegionPageClient
- `apps/web/src/app/auth/signin/page.tsx` — Client component with next-auth signIn
- `apps/web/src/app/help/page.tsx` — Client component with FAQ accordion
- `apps/web/src/app/privacy/page.tsx` — Server component with metadata
- `apps/web/src/app/terms/page.tsx` — Server component with metadata
- `apps/web/src/components/demand-checker.tsx` — Embedded in homepage

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

*Phase: 03-public-pages*
*Context gathered: 2026-03-30*
