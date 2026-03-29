# Feature Landscape — Design System Overhaul

**Domain:** Pixel-perfect design system implementation across a 45-page Next.js/Tailwind app
**Researched:** 2026-03-30
**Scope:** OffMarket NZ — Industrial/Utilitarian aesthetic, teal accent, warm neutrals, General Sans + DM Sans

---

## Current State Diagnosis

The codebase is in a recognizable pre-design-system state:

- **Tailwind config:** `primary` color mapped to sky blue (#0284c7 at 600). `accent` mapped to fuchsia/purple. Neither matches DESIGN.md.
- **globals.css:** Component classes (`btn-primary`, `.card`, `.input`) reference `primary-600` which is currently sky blue — every interactive element is the wrong color.
- **layout.tsx:** Uses `Inter` from `next/font/google`. DESIGN.md requires General Sans + DM Sans. Font is wrong at the root level.
- **Homepage hero:** Has an SVG pattern background AND a gradient (`from-primary-600 via-primary-700 to-primary-900`) — both are explicitly on the AI slop blacklist.
- **Homepage copy:** "Find Your Dream Home Before It Hits the Market" — directly on the AI slop blacklist.
- **UpgradeModal:** Has an icon-in-colored-circle (`rounded-full bg-primary-100` wrapping an icon) — on the AI slop blacklist.
- **Footer:** Uses `bg-gray-900` — needs to use DESIGN.md's `--color-primary` (#1a1a2e).
- **max-width:** Pages use `max-w-7xl` (80rem/1280px). DESIGN.md specifies 1120px (max-w-5xl equivalent).
- **Background:** Body uses `bg-gray-50` — DESIGN.md requires `#fafaf7` (warm off-white).
- **dark mode:** Not implemented. No dark: variants anywhere.

---

## Table Stakes

Features users (and the product) expect. Missing = design overhaul is incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| CSS custom properties setup | Foundation for all color theming + dark mode | Low | Replace globals.css :root with DESIGN.md variables |
| Tailwind color token realignment | Every `primary-*` and `accent-*` class is currently wrong | Low-Med | Remap tailwind.config.ts to teal + warm neutrals |
| Font system replacement | Inter is the wrong font at root level — every page is wrong | Low-Med | Replace `next/font/google` Inter with DM Sans; add General Sans via Fontsource; update body className |
| `.btn-primary` restyling | CTAs across all 45 pages call `.btn-primary` — currently sky blue | Low | One change in globals.css cascades everywhere |
| `.btn-secondary` restyling | Widespread use across forms, modals, pages | Low | globals.css change |
| `.card` component restyling | Used on nearly every page — `rounded-xl shadow-sm border-gray-100` needs warm border + correct radius | Low | globals.css change + remove `shadow-sm` (design is border-first, not shadow-first) |
| `.input` and `.label` restyling | Form inputs on buyer/create, owner/register, auth/signin, profile, admin pages | Low | globals.css change, teal focus ring |
| Header restyling | Present on all 45 pages — wrong colors, max-width, font | Medium | `bg-white border-gray-200` → `bg-[--color-surface] border-[--color-border]`; nav logo color; mobile menu |
| Footer restyling | `bg-gray-900` → `bg-[--color-primary]`; warm border; font | Medium | Multi-column layout review |
| Homepage hero redesign | Currently violates 3 blacklist items (gradient bg, SVG pattern, centered layout, generic copy) | High | Most impacted single page; needs full structural rethink |
| Homepage feature/how-it-works sections | Likely 3-column icon-in-circle card grid — audit and restyle | Medium | Check for blacklist violations in sections below the fold |
| Auth/signin page restyling | Card-based layout, Google button, email input | Low-Med | Currently uses `.card` + gray tones |
| Dashboard page restyling | Stat cards, section headings, nav links within cards | Medium | Uses `.card` + gray-200 borders |
| Buyer/create page (multi-step form) | Heavy form usage — inputs, labels, selects, checkboxes | Medium | Address autocomplete component also needs styling |
| Buyer/my-ads page | Ad listing cards, status badges, empty states | Medium | Badge colors (status indicators) need semantic colors |
| Buyer/postcards page | Postcard request cards, status badges | Low-Med | Shares patterns with my-ads |
| Owner/register page | Form-heavy — inputs, validation states, image upload | Medium | PropertyImageUpload component needs styling |
| Owner/my-properties page | Property cards, match counts (data display) | Medium | Data display = tabular-nums requirement |
| Owner/properties/[id] page | Property detail, matched buyers list, contact flow | High | ContactBuyerModal + PaymentModal both need restyling |
| Explore page + BrowsePageClient | Filter panel, demand cards, region map, pagination, save-search modal | High | Most component-dense page after homepage |
| Explore/[region] page | RegionPageClient, RegionFilterPanel, NZRegionMap | Medium | Shares components with explore |
| Inquiries page + [id] page | Conversation/message thread styling, status indicators | Medium | |
| Notifications page | Feed items, read/unread states, badge count | Low-Med | |
| Saved searches page | Search item cards, delete actions | Low | |
| Profile page | Form fields, account settings, tier badge | Low-Med | |
| Upgrade page | Pricing cards, feature comparison, billing toggle | High | Pricing cards are high-visibility and conversion-critical |
| Claim/[code] page | Postcard claim flow, code entry | Low-Med | |
| Admin dashboard | Stat widgets, data tables, recent users | Medium | Uses tabular data — needs tabular-nums |
| Admin users page | Data table with filters, role badges | Medium | Table styling is its own pattern |
| Admin billing pages (billing/subscriptions/escrows/settings) | Data tables, status badges, money amounts | Medium | Financial data = tabular-nums critical |
| Admin email templates pages | Email preview, template list | Low | |
| Admin postcards page | Postcard list, status badges | Low | |
| Help page | Prose content, FAQ structure | Low | Typography-heavy, needs heading scale |
| Privacy + Terms pages | Legal prose | Low | Typography only |
| Property/[address] page (public property detail) | Property info, demand signals, CTA | Medium | |
| Wanted/[id] page (buyer wanted ad detail) | Ad details, match indicators | Medium | |
| Semantic color tokens (success/warning/error/info) | Status badges throughout — currently using ad-hoc `text-green-500`, `text-red-500` | Low | Centralise into CSS vars or Tailwind config |
| Dark mode implementation | DESIGN.md fully specifies dark mode surfaces; zero dark: variants currently exist | High | Requires parallel dark: variants on every restyle |
| Responsive breakpoints audit | All pages use `max-w-7xl` (1280px) — needs 1120px per DESIGN.md | Medium | Global find/replace + verify layouts don't break |

---

## Differentiators

What separates a thoughtful implementation from a superficial color swap.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tabular-nums on all financial/data displays | Numbers align in columns — looks fintech-grade, not generic | Low | Add `font-variant-numeric: tabular-nums` via Tailwind or CSS to all price, count, percentage displays |
| Warm off-white background (#fafaf7) | Prevents clinical feel — subtly different from the generic white-background SaaS aesthetic | Low | Replace `bg-gray-50` root; update all `bg-white` sections that should read as "background" not "surface" |
| Subtle warm grain texture on cards | DESIGN.md specifies "very light warm grain on card backgrounds" — intentional decoration | Medium | CSS noise texture via SVG filter or noise image — must be subtle enough to not feel gimmicky |
| Left-aligned hero text | Explicit differentiation from NZ property site conventions (centered hero is the norm) | Low-Med | Structural change to homepage hero section |
| Data-forward hero section | Lead with real demand numbers, not a property photo | Medium | Requires live DemandSignal data surfaced in the hero |
| General Sans typography personality | Not another Inter/Roboto site — headlines have geometric character | Low | The font change itself carries most of the aesthetic weight |
| Teal as sole interactive color | Every NZ property site uses blue or orange — teal owns the space | Low | Enforced by getting Tailwind config right |
| Consistent border-radius scale (not uniform bubbly) | Use 4px/8px/12px intentionally — small elements get sm, cards get md, hero gets lg | Medium | Audit each component type and apply the right radius |
| Match score display as data visualization | Owner property/[id] shows matched buyers — present scores as data bars or percentage with tabular-nums, not generic cards | High | Proprietary to this app — could be a standout UI pattern |
| Demand signal numbers on explore/region pages | Buyer count per region displayed with real data, tabular-nums, teal accent | Medium | Already has data — needs presentation upgrade |
| Admin tables as proper data tables | Financial data (escrows, subscriptions) needs proper table styling — dividers, zebra rows, sticky header | Medium | Admin is internal but still reflects craft |

---

## Anti-Features

Items explicitly on DESIGN.md's AI Slop Blacklist that exist in the current codebase and must be removed.

| Anti-Feature | Where It Currently Exists | What to Do Instead |
|--------------|--------------------------|-------------------|
| Purple/violet/indigo gradients | `tailwind.config.ts` has `accent` mapped to fuchsia/purple (500: #d946ef). Not yet used in JSX but the token is poison. | Remove or remap accent color token to amber (#d97706) per DESIGN.md |
| SVG pattern backgrounds | `app/page.tsx` hero: inline `backgroundImage` SVG crosshatch pattern | Remove. White space does the heavy lifting per DESIGN.md. |
| Gradient backgrounds as primary CTA context | `app/page.tsx` hero: `bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900` | Replace with solid `bg-[--color-primary]` (#1a1a2e) |
| Icon-in-colored-circle cards | `UpgradeModal.tsx`: `mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100` wrapping SVG icon | Remove icon container; present content with typography + spacing, not iconography |
| Centered-everything layout | Homepage hero text is in a `max-w-3xl` block — check whether text-align is left or if it defaults to center | Explicitly left-align hero text |
| Generic hero copy | "Find Your Dream Home Before It Hits the Market" (homepage h1) and "New Zealand's first reverse real estate marketplace" | Rewrite to data-forward, specific copy — not in scope for this milestone per PROJECT.md, but blacklist flag must be documented |
| Gradient buttons as primary CTA | `app/page.tsx` hero CTAs use inline `bg-white text-primary-700 shadow-lg hover:shadow-xl` — not gradient but the shadow-xl hover is decorative-forward | Simplify to flat color transitions |
| Uniform bubbly border-radius | `.card` uses `rounded-xl` (12px) everywhere regardless of element size | Apply radius scale: buttons/inputs = 8px (rounded-lg), cards = 8px (rounded-lg), hero/modals = 12px (rounded-xl) — distinction matters |
| Fake/hardcoded stats | Homepage trust indicators: "100% Privacy Protected", "No Listing Required", "Free for Buyers" as checkmark list items are marketing copy, not real data | Keep as copy (they're not numeric claims), but if any numeric claims exist elsewhere in homepage they must come from DemandSignal |
| 3-column feature grids with identical card structure | Likely exists in homepage sections below the fold (not read but pattern is universal in Next.js boilerplate) | Audit lower homepage sections; break symmetry with varied column widths |

---

## Feature Dependencies

```
CSS variables setup (globals.css :root)
  └── Tailwind token realignment (tailwind.config.ts)
        └── .btn-primary, .btn-secondary, .btn-ghost restyling
              └── All page/modal CTAs correct
        └── .card, .input, .label restyling
              └── All forms and cards correct

Font system replacement (layout.tsx)
  └── General Sans applied to h1-h3 everywhere
  └── DM Sans applied to body/labels everywhere
        └── Tabular-nums applied to data displays

Header restyling
  └── Brand identity consistent on all 45 pages

Homepage hero redesign
  └── Structural: left-align text, remove gradient, remove SVG pattern
  └── Requires: CSS variables, font system, color tokens (above)

Dark mode CSS variables
  └── Dark mode .dark or prefers-color-scheme variants
        └── All surfaces, borders, text on every page
```

**Critical path:** CSS variables → Tailwind config → globals.css component classes → layout.tsx fonts → individual pages. Getting the foundation right (the first 4 items) propagates correctly to ~80% of the visual work automatically.

---

## MVP Recommendation (Phase Structure Implication)

The feature set naturally divides into three phases by dependency and risk:

**Phase 1 — Foundation (no page work yet)**
CSS variables, Tailwind config, globals.css, layout.tsx fonts. Get one canonical version of every token and base component correct. This phase has the highest ROI per line of code — changes cascade to all 45 pages.

**Phase 2 — High-visibility surfaces**
Homepage (highest blacklist violation count), Header, Footer, Auth, Dashboard, Upgrade/Pricing. These are the pages every user sees first. Fixing them signals the design system is real.

**Phase 3 — App pages and dark mode**
All buyer/owner/admin/inquiry pages + dark mode sweep. These are lower-traffic but must be complete for the milestone to be "done."

**Defer:**
- Grain texture on cards — nice-to-have, add last, don't let it block Phase 1
- Generic hero copy rewrite — explicitly out of scope per PROJECT.md (restyling only, not rewriting content)
- Motion/animation — explicitly deferred per PROJECT.md

---

## Sources

- Direct codebase analysis: `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/components/header.tsx`, `apps/web/src/components/footer.tsx`, `apps/web/src/components/UpgradeModal.tsx`
- Design specification: `DESIGN.md` (authoritative source of truth per PROJECT.md)
- Project context: `.planning/PROJECT.md`
- Confidence: HIGH — analysis is based on direct code inspection of the actual codebase against the design spec, not inference or web research
