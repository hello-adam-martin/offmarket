# Roadmap: OffMarket NZ — Design Overhaul

## Overview

A pixel-perfect design system implementation across 45+ pages of an existing Next.js 15 marketplace. The work proceeds in strict dependency order: foundation tokens first (Tailwind config, CSS variables, fonts, dark mode) because config changes cascade to all pages automatically, then shared components that appear everywhere, then pages in descending order of public visibility, and finally a cross-cutting audit that verifies the complete design system holds end-to-end.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Tailwind config, CSS variables, fonts, and dark mode provider wired atomically
- [x] **Phase 2: Shared Components** - Header, footer, modals, form primitives, cards, and all shared UI restyled (completed 2026-03-29)
- [x] **Phase 3: Public Pages** - Homepage, explore, region, auth, and legal pages restyled and blacklist-clean (completed 2026-03-30)
- [x] **Phase 4: Buyer Pages** - Create ad, my ads, and postcards pages restyled (completed 2026-03-30)
- [ ] **Phase 5: Owner Pages** - Register property, my properties, and property detail pages restyled
- [ ] **Phase 6: User App Pages** - Dashboard, profile, inquiries, notifications, upgrade, and all user-facing app pages restyled
- [ ] **Phase 7: Admin Pages** - Admin dashboard, user management, billing, email templates, and postcards admin restyled
- [ ] **Phase 8: Cross-Cutting Audit** - Full-site verification of max-width, dark mode, accent color, typography hierarchy, AI slop, accessibility, and responsiveness

## Phase Details

### Phase 1: Foundation
**Goal**: The design system token layer is live — every page inherits correct colors, fonts, spacing, and dark mode without per-page changes
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, FOUN-08, FOUN-09, FOUN-10, FOUN-11, FOUN-12, FOUN-13, FOUN-14, FOUN-15
**Success Criteria** (what must be TRUE):
  1. Opening any page in the browser shows General Sans headlines and DM Sans body text — Inter is gone
  2. Toggling dark mode switches the page to dark surfaces (#0f0f1a background, #1a1a2e cards) with no flash-of-wrong-theme
  3. The teal accent (#0d9488) is the active button and link color on every page — the previous sky blue / fuchsia palette is gone
  4. The warm off-white (#fafaf7) background renders in light mode; card backgrounds show the subtle grain texture
  5. Tailwind utilities `bg-surface`, `text-accent`, `border-border` resolve to DESIGN.md values (verifiable in DevTools)
**Plans**: 3 plans
Plans:
- [x] 01-01-PLAN.md — Install prerequisites, create fonts.ts, rewrite tailwind.config.ts, create ThemeProvider
- [x] 01-02-PLAN.md — Rewrite globals.css, wire fonts in layout.tsx, connect ThemeProvider in providers.tsx
- [x] 01-03-PLAN.md — Gap closure: fix DM Sans italic font loading (FOUN-07)
**UI hint**: yes

### Phase 2: Shared Components
**Goal**: Every shared UI element — header, footer, modals, form controls, cards, badges — matches DESIGN.md before any page-specific work begins
**Depends on**: Phase 1
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMP-11, COMP-12, COMP-13, COMP-14
**Success Criteria** (what must be TRUE):
  1. The header shows the teal logo, correct nav typography, 1120px max-width, and a working dark mode toggle on all pages
  2. Opening any modal (contact buyer, payment, upgrade, postcard request, save search) shows DESIGN.md surface colors, correct button variants, and proper focus rings
  3. Every form input, select, and textarea shows the teal focus ring and correct border color in both light and dark mode
  4. Button variants are visually distinct: primary is solid teal, secondary is outlined, destructive is error red — all with 8px border radius
  5. Card components show the surface background, 8px border radius, DESIGN.md border color, and grain texture
**Plans**: 5 plans
Plans:
- [x] 02-01-PLAN.md — CSS class additions (btn sizes, badges, modal shell), ThemeToggle, header + footer restyle
- [x] 02-02-PLAN.md — Restyle all 5 modals with modal shell classes and semantic tokens
- [x] 02-03-PLAN.md — Restyle FilterPanel, RegionFilterPanel, EmptyState (AI slop removal)
- [x] 02-04-PLAN.md — Restyle DemandCardGrid (.card + tabular-nums) and NZRegionMap (teal fill system)
- [x] 02-05-PLAN.md — Restyle AddressAutocomplete and PropertyImageUpload
**UI hint**: yes

### Phase 3: Public Pages
**Goal**: Every public-facing page is styled to DESIGN.md and free of all AI slop blacklist violations
**Depends on**: Phase 2
**Requirements**: PUBL-01, PUBL-02, PUBL-03, PUBL-04, PUBL-05, PUBL-06, PUBL-07
**Success Criteria** (what must be TRUE):
  1. The homepage hero is left-aligned, has no gradient background, no SVG blob pattern, and leads with a data-forward teal CTA
  2. The explore/browse page shows DESIGN.md card grid with demand data, teal filter controls, and correct empty state
  3. The auth/signin page uses DESIGN.md form layout with no centered-text layout, correct input styling, and Google OAuth button
  4. Legal pages (privacy, terms) and help/FAQ use DESIGN.md typography hierarchy with correct heading and body font rendering
**Plans**: 3 plans
Plans:
- [x] 03-01-PLAN.md — Homepage full restyle: data-forward hero with live stats, AI slop removal, section cleanup
- [x] 03-02-PLAN.md — Auth/signin page and Help/FAQ page restyle with semantic tokens
- [x] 03-03-PLAN.md — Legal pages (privacy, terms), explore/region wrappers, and DemandChecker token fixes
**UI hint**: yes

### Phase 4: Buyer Pages
**Goal**: The complete buyer workflow — creating a wanted ad, managing ads, and viewing postcards — renders in DESIGN.md styling
**Depends on**: Phase 3
**Requirements**: BUYR-01, BUYR-02, BUYR-03
**Success Criteria** (what must be TRUE):
  1. The create wanted ad form shows DESIGN.md multi-step layout, correct input styling, budget range controls, and feature selection badges
  2. The my ads listing shows property cards with DESIGN.md status badges (accent-light background, 4px border radius), teal action buttons, and empty state
  3. The postcards page shows request list with DESIGN.md status indicators and correct tabular-nums on any numeric data
**Plans**: 2 plans
Plans:
- [x] 04-01-PLAN.md — Restyle create wanted ad page (token swap, badge-info toggles, success state)
- [x] 04-02-PLAN.md — Restyle my ads listing and postcards pages (badge-info tags, STATUS_LABELS refactor)
**UI hint**: yes

### Phase 5: Owner Pages
**Goal**: The complete owner workflow — registering a property, viewing listings, and reviewing matches — renders in DESIGN.md styling
**Depends on**: Phase 4
**Requirements**: OWNR-01, OWNR-02, OWNR-03
**Success Criteria** (what must be TRUE):
  1. The register property form shows DESIGN.md layout with image upload component, address autocomplete, and correct input styling end-to-end
  2. The my properties listing shows property cards with DESIGN.md card pattern, status badges, and correct empty state
  3. The property detail page shows demand display and match scores with tabular-nums — numeric data is visually distinct and readable
**Plans**: 2 plans
Plans:
- [ ] 05-01-PLAN.md — Restyle owner landing page and register property form
- [ ] 05-02-PLAN.md — Restyle my-properties listing and property detail page
**UI hint**: yes

### Phase 6: User App Pages
**Goal**: All user-facing application pages — dashboard, profile, inquiries, notifications, upgrade, saved searches, and claim flow — render in DESIGN.md styling
**Depends on**: Phase 5
**Requirements**: USER-01, USER-02, USER-03, USER-04, USER-05, USER-06, USER-07, USER-08, USER-09, USER-10
**Success Criteria** (what must be TRUE):
  1. The dashboard shows stat cards with tabular-nums on all numbers, correct surface colors, and DESIGN.md quick action buttons
  2. The upgrade/pricing page shows tier comparison with DESIGN.md card pattern, teal CTA on the recommended plan, and no AI slop layout patterns
  3. The inquiry message thread shows DESIGN.md surface colors, correct reply form input styling, and readable typography hierarchy
  4. Notifications and saved searches pages show DESIGN.md list styling with correct empty states
**Plans**: 2 plans
Plans:
- [ ] 05-01-PLAN.md — Restyle owner landing page and register property form
- [ ] 05-02-PLAN.md — Restyle my-properties listing and property detail page
**UI hint**: yes

### Phase 7: Admin Pages
**Goal**: All admin pages render in DESIGN.md styling with financial data tables that read as fintech-grade
**Depends on**: Phase 6
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09
**Success Criteria** (what must be TRUE):
  1. The admin dashboard shows stat cards and data tables with tabular-nums applied to all numeric columns
  2. The billing pages (subscriptions, escrows, overview, settings) show financial data with tabular-nums and semantically correct status badges (success green, error red, warning amber — not mixed up)
  3. The user management table shows DESIGN.md table styling with correct action button variants
  4. Email template editor and postcards admin pages render DESIGN.md form and card patterns
**Plans**: 2 plans
Plans:
- [ ] 05-01-PLAN.md — Restyle owner landing page and register property form
- [ ] 05-02-PLAN.md — Restyle my-properties listing and property detail page
**UI hint**: yes

### Phase 8: Cross-Cutting Audit
**Goal**: Every page passes the complete DESIGN.md compliance checklist — max-width, dark mode, accent, typography, AI slop blacklist, accessibility, and responsiveness all verified across the full site
**Depends on**: Phase 7
**Requirements**: XCUT-01, XCUT-02, XCUT-03, XCUT-04, XCUT-05, XCUT-06, XCUT-07
**Success Criteria** (what must be TRUE):
  1. Every page uses a 1120px max-width content container — no page bleeds to 1280px
  2. Every page in dark mode shows correct surface colors with no gray-* hardcoded classes creating dark mode blind spots
  3. No page contains any AI slop blacklist violation: no purple gradients, no blob/SVG patterns, no icon-in-circle cards, no centered hero text, no generic "Find Your Dream Home" copy
  4. Every page passes WCAG AA contrast ratios in both light and dark mode (verifiable via browser accessibility audit)
  5. Every page renders correctly at sm (640px), md (768px), lg (1024px), and xl (1280px) breakpoints
**Plans**: 2 plans
Plans:
- [ ] 05-01-PLAN.md — Restyle owner landing page and register property form
- [ ] 05-02-PLAN.md — Restyle my-properties listing and property detail page
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/3 | In Progress|  |
| 2. Shared Components | 5/5 | Complete   | 2026-03-29 |
| 3. Public Pages | 3/3 | Complete   | 2026-03-30 |
| 4. Buyer Pages | 2/2 | Complete   | 2026-03-30 |
| 5. Owner Pages | 0/2 | Not started | - |
| 6. User App Pages | 0/TBD | Not started | - |
| 7. Admin Pages | 0/TBD | Not started | - |
| 8. Cross-Cutting Audit | 0/TBD | Not started | - |
