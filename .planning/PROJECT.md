# OffMarket NZ

## What This Is

A reverse real estate marketplace for New Zealand where buyers post "wanted ads" and property owners see demand for their unlisted homes. Fully built — API, database, 45+ pages, auth, billing, matching engine, postcards, admin. v1.0 design overhaul shipped: every page and component now implements the DESIGN.md design system.

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
- ✓ DESIGN.md typography system (General Sans headlines, DM Sans body, tabular-nums) — v1.0
- ✓ DESIGN.md color system (teal accent, warm neutrals, semantic colors, CSS variables) — v1.0
- ✓ DESIGN.md spacing system (4px base unit, comfortable density) — v1.0
- ✓ DESIGN.md layout system (12-col grid, breakpoints, max-width 1120px, border-radius scale) — v1.0
- ✓ Dark mode (redesigned surfaces, reduced accent saturation, proper dark borders) — v1.0
- ✓ All public pages restyled (homepage, explore, region, help, privacy, terms, auth) — v1.0
- ✓ All buyer pages restyled (create ad, my ads, postcards) — v1.0
- ✓ All owner pages restyled (register property, my properties, property detail) — v1.0
- ✓ All user pages restyled (dashboard, profile, inquiries, notifications, upgrade, saved searches, claim) — v1.0
- ✓ All admin pages restyled (dashboard, users, billing, email templates, postcards) — v1.0
- ✓ All shared components restyled (Header, Footer, modals, forms, buttons, cards, filters) — v1.0
- ✓ AI slop blacklist enforced (no gradients, no blobs, no icon-circles, left-aligned heroes) — v1.0

### Active

(None — next milestone requirements TBD)

### Out of Scope

- Motion/animation work — deferred to future milestone per user decision
- New features (demand checker, social proof, weekly digests, embeddable widget) — per TODOS.md, deferred until data volume exists
- Backend/API changes — frontend-only design milestone
- Content/copywriting — restyling only, not rewriting page content
- Mobile native app — web only

## Context

- **Tech stack:** Next.js 15.1, React 19, Tailwind CSS 3.4, TypeScript — all styling is Tailwind utility classes
- **Current state:** ~45 pages, 13+ components, all restyled to DESIGN.md spec (v1.0 shipped)
- **Design system:** Fully implemented from `DESIGN.md` — 18 semantic CSS variable color tokens, General Sans + DM Sans + JetBrains Mono fonts, card grain texture, dark mode surfaces
- **Fonts:** General Sans (local woff2), DM Sans + JetBrains Mono (Google Fonts via next/font)
- **Codebase:** 154 files modified in v1.0, +21,507 / -3,350 lines
- **Monorepo:** Turborepo with pnpm workspaces — frontend is `apps/web/`

## Constraints

- **Design authority:** DESIGN.md is the single source of truth for all visual decisions
- **No functionality changes:** Existing features must continue working identically after restyling
- **Tailwind CSS:** All styling via Tailwind utilities — no separate CSS files beyond globals.css
- **Responsive:** All pages work across sm(640px), md(768px), lg(1024px), xl(1280px) breakpoints
- **Accessibility:** WCAG AA contrast ratios, keyboard navigation, ARIA landmarks, proper touch targets
- **Dark mode:** Both light and dark themes with proper surface color redesign per DESIGN.md

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full overhaul, not incremental | Pixel-perfect match to DESIGN.md across all pages simultaneously | ✓ Good — all 45+ pages restyled in 8 phases |
| Dark mode included | DESIGN.md has full dark mode spec | ✓ Good — CSS variable system makes dark mode automatic |
| Motion deferred | Get static design right first | ✓ Good — clean separation of concerns |
| No new features | Purely visual milestone | ✓ Good — zero functionality regressions |
| Semantic CSS variables over hardcoded colors | Single source of truth, dark mode for free | ✓ Good — 18 tokens replace all hardcoded gray/white |
| card utility class with grain texture | Consistent card styling across all pages | ✓ Good — used in ~100+ locations |
| badge-* classes for status indicators | Consistent semantic status badges | ✓ Good — STATUS_LABELS pattern established |
| font-display class for General Sans headings | Explicit typography control | ✓ Good — ~100 headings updated in Phase 8 audit |

---
*Last updated: 2026-03-30 after v1.0 Design Overhaul milestone*
