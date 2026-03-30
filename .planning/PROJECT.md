# OffMarket NZ — Design Overhaul

## What This Is

A reverse real estate marketplace for New Zealand where buyers post "wanted ads" and property owners see demand for their unlisted homes. The app is fully built — API, database, 45+ pages, auth, billing, matching engine, postcards, admin. This milestone is a pixel-perfect design overhaul to implement the DESIGN.md design system across every page and component.

## Core Value

Every page and component visually matches DESIGN.md — typography, color, spacing, layout, dark mode — creating a cohesive, data-forward, industrial/utilitarian aesthetic that differentiates OffMarket from every other NZ property site.

## Requirements

### Validated

- ✓ Authentication (NextAuth + Google OAuth + email/credentials) — existing
- ✓ Buyer wanted ad creation and management — existing
- ✓ Owner property registration and management — existing
- ✓ Property-to-wanted-ad matching engine with scoring — existing
- ✓ Inquiry/messaging system between buyers and owners — existing
- ✓ Subscription billing (FREE/PRO tiers via Stripe) — existing
- ✓ Escrow deposits for finder's fees — existing
- ✓ Postcard request and claim flow — existing
- ✓ Admin dashboard, user management, billing settings — existing
- ✓ Email templates via Resend — existing
- ✓ Notifications system — existing
- ✓ Saved searches — existing
- ✓ Property image uploads via Vercel Blob — existing

### Active

- [x] Implement DESIGN.md typography system (General Sans headlines, DM Sans body, tabular-nums for data) — Validated in Phase 1: Foundation
- [x] Implement DESIGN.md color system (teal accent, warm neutrals, semantic colors, CSS variables) — Validated in Phase 1: Foundation
- [x] Implement DESIGN.md spacing system (4px base unit, comfortable density) — Validated in Phase 1: Foundation
- [x] Implement DESIGN.md layout system (12-col grid, breakpoints, max-width, border-radius scale) — Validated in Phase 1: Foundation
- [x] Implement dark mode (redesigned surfaces, reduced accent saturation, proper dark borders) — Validated in Phase 1: Foundation
- [x] Restyle all public pages (homepage, explore, region, help, privacy, terms, auth) — Validated in Phase 3: Public Pages
- [ ] Restyle all buyer pages (create ad, my ads, postcards)
- [ ] Restyle all owner pages (register property, my properties, property detail)
- [ ] Restyle all user pages (dashboard, profile, inquiries, wanted ad detail, property detail, saved searches, notifications, upgrade, claim)
- [ ] Restyle all admin pages (dashboard, users, billing settings/subscriptions/escrows, email templates, postcards)
- [x] Restyle all shared components (Header, Footer, modals, forms, buttons, cards, empty states, filters) — Validated in Phase 2: Shared Components
- [ ] Enforce AI slop blacklist from DESIGN.md (no purple gradients, no blob patterns, no icon-in-circle cards, left-align hero text, no generic copy)

### Out of Scope

- Motion/animation work — deferred to future milestone per user decision
- New features (demand checker, social proof, weekly digests, embeddable widget) — per TODOS.md, deferred until data volume exists
- Backend/API changes — this is a frontend-only design milestone
- Content/copywriting — restyling only, not rewriting page content
- Mobile native app — web only

## Context

- **Tech stack:** Next.js 15.1, React 19, Tailwind CSS, TypeScript — all styling is Tailwind utility classes
- **Existing state:** ~45 pages, 13+ components, all functional but not yet styled to DESIGN.md spec
- **Design system:** Fully specified in `DESIGN.md` at repo root — typography, color, spacing, layout, dark mode, AI slop blacklist
- **Fonts:** General Sans (via local woff2), DM Sans + JetBrains Mono (via Google Fonts CDN via next/font)
- **Codebase map:** Available at `.planning/codebase/` — architecture, stack, conventions, structure all documented
- **Monorepo:** Turborepo with pnpm workspaces — frontend is `apps/web/`

## Constraints

- **Design authority:** DESIGN.md is the single source of truth for all visual decisions
- **No functionality changes:** Existing features must continue working identically after restyling
- **Tailwind CSS:** All styling via Tailwind utilities — no separate CSS files beyond globals.css for CSS variables and font imports
- **Responsive:** All pages must work across sm(640px), md(768px), lg(1024px), xl(1280px) breakpoints
- **Accessibility:** WCAG AA contrast ratios, keyboard navigation, ARIA landmarks, proper touch targets
- **Dark mode:** Must support both light and dark themes with proper surface color redesign per DESIGN.md

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full overhaul, not incremental | User wants pixel-perfect match to DESIGN.md across all pages simultaneously | — Pending |
| Dark mode included | DESIGN.md has full dark mode spec, user confirmed inclusion | — Pending |
| Motion deferred | Get static design right first, motion is a separate concern | — Pending |
| No new features | This milestone is purely visual — functional changes are out of scope | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after Phase 1: Foundation completion*
