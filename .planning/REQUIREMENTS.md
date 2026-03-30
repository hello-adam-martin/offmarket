# Requirements: OffMarket NZ — Design Overhaul

**Defined:** 2026-03-30
**Core Value:** Every page and component visually matches DESIGN.md — typography, color, spacing, layout, dark mode

## v1 Requirements

Requirements for design overhaul milestone. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: CSS custom properties defined for all DESIGN.md colors (primary, accent, secondary, neutrals, semantic) in :root and .dark
- [x] **FOUN-02**: Tailwind config rewritten with semantic color names mapping to CSS variables (accent, surface, border, text-secondary, etc.)
- [x] **FOUN-03**: Tailwind typography scale matches DESIGN.md (3xl through xs with correct font-family, weight, line-height)
- [x] **FOUN-04**: Tailwind spacing scale uses 4px base unit with DESIGN.md stops (2xs through 3xl)
- [x] **FOUN-05**: Tailwind border-radius scale matches DESIGN.md (sm:4px, md:8px, lg:12px, full:9999px)
- [x] **FOUN-06**: General Sans loaded via next/font/local (downloaded from Fontshare, variable woff2)
- [x] **FOUN-07**: DM Sans loaded via next/font/google with all required weights (300-700, italic 400)
- [x] **FOUN-08**: JetBrains Mono loaded via next/font/google (weights 400, 500)
- [x] **FOUN-09**: Inter font completely removed from layout.tsx and replaced with General Sans + DM Sans
- [x] **FOUN-10**: next-themes installed and ThemeProvider wrapping app with dark mode toggle
- [x] **FOUN-11**: Dark mode CSS variables defined per DESIGN.md (bg #0f0f1a, surface #1a1a2e, surface-raised #252540, reduced accent saturation, border #374151)
- [x] **FOUN-12**: suppressHydrationWarning on html element to prevent dark mode FOUC
- [x] **FOUN-13**: globals.css component classes (.btn-primary, .card, .input) updated to use DESIGN.md tokens
- [x] **FOUN-14**: font-variant-numeric: tabular-nums applied to all data/number displays via Tailwind utility or DM Sans config
- [x] **FOUN-15**: Subtle grain texture on card backgrounds per DESIGN.md

### Shared Components

- [x] **COMP-01**: Header restyled — DESIGN.md colors, typography, max-width 1120px, dark mode support
- [x] **COMP-02**: Footer restyled — DESIGN.md colors, typography, max-width 1120px, dark mode support
- [x] **COMP-03**: Dark mode toggle component in header
- [x] **COMP-04**: All modal components restyled (ContactBuyerModal, PaymentModal, UpgradeModal, PostcardRequestModal, SaveSearchModal)
- [x] **COMP-05**: Form primitives restyled (inputs, selects, textareas, checkboxes, radio buttons) with focus rings using accent-light
- [x] **COMP-06**: Button variants restyled (primary=teal, secondary=outlined, destructive=error red) with correct border-radius md:8px
- [x] **COMP-07**: Card components restyled (border-radius md:8px, surface background, border color, grain texture)
- [x] **COMP-08**: Badge components restyled (border-radius sm:4px, accent-light background for info badges)
- [x] **COMP-09**: EmptyState component restyled to DESIGN.md
- [x] **COMP-10**: FilterPanel and RegionFilterPanel restyled
- [x] **COMP-11**: DemandCardGrid restyled with DESIGN.md card pattern
- [x] **COMP-12**: NZRegionMap styled to match DESIGN.md color palette
- [x] **COMP-13**: AddressAutocomplete restyled
- [x] **COMP-14**: PropertyImageUpload restyled

### Public Pages

- [x] **PUBL-01**: Homepage restyled — remove AI slop (gradient hero, SVG pattern, centered text), left-align hero, data-forward design, teal accent CTAs
- [x] **PUBL-02**: Explore/browse page restyled with DESIGN.md grid, cards, filters
- [x] **PUBL-03**: Region pages restyled
- [x] **PUBL-04**: Help/FAQ page restyled
- [x] **PUBL-05**: Privacy policy page restyled
- [x] **PUBL-06**: Terms of service page restyled
- [x] **PUBL-07**: Auth/signin page restyled

### Buyer Pages

- [ ] **BUYR-01**: Create wanted ad page restyled — form layout, inputs, budget range, feature selection
- [x] **BUYR-02**: My ads listing page restyled — card grid, status badges, action buttons
- [x] **BUYR-03**: Postcards page restyled — request list, status indicators

### Owner Pages

- [ ] **OWNR-01**: Register property page restyled — form layout, image upload, address fields
- [ ] **OWNR-02**: My properties listing page restyled
- [ ] **OWNR-03**: Property detail page restyled — demand display, match scores, inquiry actions

### User App Pages

- [ ] **USER-01**: Dashboard page restyled — stats, recent activity, quick actions
- [ ] **USER-02**: Profile/settings page restyled
- [ ] **USER-03**: Inquiries listing page restyled
- [ ] **USER-04**: Inquiry detail page restyled — message thread, reply form
- [ ] **USER-05**: Wanted ad detail page restyled — match list, property cards, demand data with tabular-nums
- [ ] **USER-06**: Property view page restyled
- [ ] **USER-07**: Saved searches page restyled
- [ ] **USER-08**: Notifications page restyled
- [ ] **USER-09**: Upgrade/pricing page restyled — tier comparison, CTA buttons
- [ ] **USER-10**: Claim page restyled — postcard claim flow

### Admin Pages

- [ ] **ADMN-01**: Admin dashboard restyled — stats cards, data tables with tabular-nums
- [ ] **ADMN-02**: User management page restyled — data table, action buttons
- [ ] **ADMN-03**: Billing overview page restyled
- [ ] **ADMN-04**: Billing settings page restyled
- [ ] **ADMN-05**: Subscriptions page restyled — data table with status badges
- [ ] **ADMN-06**: Escrows page restyled — financial data with tabular-nums
- [ ] **ADMN-07**: Email templates page restyled
- [ ] **ADMN-08**: Email template editor page restyled
- [ ] **ADMN-09**: Postcards admin page restyled

### Cross-Cutting

- [ ] **XCUT-01**: All pages use max-width 1120px content container (not 1280px)
- [ ] **XCUT-02**: All pages support dark mode with correct surface colors
- [ ] **XCUT-03**: All interactive elements use teal accent (#0d9488) with hover (#0f766e)
- [ ] **XCUT-04**: All text uses correct DESIGN.md hierarchy (General Sans for h1-h3, DM Sans for body)
- [ ] **XCUT-05**: No AI slop blacklist violations remain in any page
- [ ] **XCUT-06**: All pages pass WCAG AA contrast ratios in both light and dark mode
- [ ] **XCUT-07**: All pages responsive across sm/md/lg/xl breakpoints

## v2 Requirements

Deferred to future milestone.

### Motion

- **MOTN-01**: Demand data numbers count-up animation on first load (long duration 400-700ms)
- **MOTN-02**: Tab switch fade + slide transition (short duration 150-250ms)
- **MOTN-03**: Chart data progressive reveal on scroll (medium duration 250-400ms)
- **MOTN-04**: Hover state color/shadow micro-transitions (50-100ms)
- **MOTN-05**: DESIGN.md easing curves implemented (enter: ease-out, exit: ease-in, move: ease-in-out)

### Content

- **CONT-01**: Homepage hero copy rewritten (remove generic "Find Your Dream Home" copy)
- **CONT-02**: Empty state copy finalized (per TODOS.md)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features (demand checker, social proof, digests, widget) | Per TODOS.md — deferred until data volume exists |
| Backend/API changes | Frontend-only design milestone |
| Mobile native app | Web only |
| Motion/animation | User decision — get static design right first |
| Content rewriting | Restyling only, not copywriting (except removing AI slop copy) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| FOUN-07 | Phase 1 | Complete |
| FOUN-08 | Phase 1 | Complete |
| FOUN-09 | Phase 1 | Complete |
| FOUN-10 | Phase 1 | Complete |
| FOUN-11 | Phase 1 | Complete |
| FOUN-12 | Phase 1 | Complete |
| FOUN-13 | Phase 1 | Complete |
| FOUN-14 | Phase 1 | Complete |
| FOUN-15 | Phase 1 | Complete |
| COMP-01 | Phase 2 | Complete |
| COMP-02 | Phase 2 | Complete |
| COMP-03 | Phase 2 | Complete |
| COMP-04 | Phase 2 | Complete |
| COMP-05 | Phase 2 | Complete |
| COMP-06 | Phase 2 | Complete |
| COMP-07 | Phase 2 | Complete |
| COMP-08 | Phase 2 | Complete |
| COMP-09 | Phase 2 | Complete |
| COMP-10 | Phase 2 | Complete |
| COMP-11 | Phase 2 | Complete |
| COMP-12 | Phase 2 | Complete |
| COMP-13 | Phase 2 | Complete |
| COMP-14 | Phase 2 | Complete |
| PUBL-01 | Phase 3 | Complete |
| PUBL-02 | Phase 3 | Complete |
| PUBL-03 | Phase 3 | Complete |
| PUBL-04 | Phase 3 | Complete |
| PUBL-05 | Phase 3 | Complete |
| PUBL-06 | Phase 3 | Complete |
| PUBL-07 | Phase 3 | Complete |
| BUYR-01 | Phase 4 | Pending |
| BUYR-02 | Phase 4 | Complete |
| BUYR-03 | Phase 4 | Complete |
| OWNR-01 | Phase 5 | Pending |
| OWNR-02 | Phase 5 | Pending |
| OWNR-03 | Phase 5 | Pending |
| USER-01 | Phase 6 | Pending |
| USER-02 | Phase 6 | Pending |
| USER-03 | Phase 6 | Pending |
| USER-04 | Phase 6 | Pending |
| USER-05 | Phase 6 | Pending |
| USER-06 | Phase 6 | Pending |
| USER-07 | Phase 6 | Pending |
| USER-08 | Phase 6 | Pending |
| USER-09 | Phase 6 | Pending |
| USER-10 | Phase 6 | Pending |
| ADMN-01 | Phase 7 | Pending |
| ADMN-02 | Phase 7 | Pending |
| ADMN-03 | Phase 7 | Pending |
| ADMN-04 | Phase 7 | Pending |
| ADMN-05 | Phase 7 | Pending |
| ADMN-06 | Phase 7 | Pending |
| ADMN-07 | Phase 7 | Pending |
| ADMN-08 | Phase 7 | Pending |
| ADMN-09 | Phase 7 | Pending |
| XCUT-01 | Phase 8 | Pending |
| XCUT-02 | Phase 8 | Pending |
| XCUT-03 | Phase 8 | Pending |
| XCUT-04 | Phase 8 | Pending |
| XCUT-05 | Phase 8 | Pending |
| XCUT-06 | Phase 8 | Pending |
| XCUT-07 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after roadmap creation — all 68 requirements mapped*
