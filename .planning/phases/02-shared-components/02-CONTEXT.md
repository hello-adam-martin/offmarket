# Phase 2: Shared Components - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle all shared UI components to match DESIGN.md: header, footer, modals, form primitives, buttons, cards, badges, empty states, filters, region map, address autocomplete, and property image upload. The dark mode toggle component ships here (deferred from Phase 1). No page-specific work. No new features or capabilities.

</domain>

<decisions>
## Implementation Decisions

### Component Extraction
- **D-01:** CSS classes only — no React component primitives. Keep globals.css classes (.btn-primary, .card, .input, etc.) and apply via className strings. Matches existing codebase pattern.
- **D-02:** 4 button variants: primary (solid teal), secondary (outlined), ghost (text-only), destructive (error red). All defined as CSS classes in globals.css.
- **D-03:** 3 button sizes: .btn-sm (36px height, compact for tables), .btn-md (40px default), .btn-lg (48px for hero CTAs). All meet DESIGN.md 44px min touch target on mobile (sm uses padding compensation).

### Header Redesign
- **D-04:** Dark mode toggle placed right of nav links, before auth area. Sun/moon icon, always visible on desktop and mobile.
- **D-05:** Logo is text-only: "OffMarket" in accent teal (#0d9488), "NZ" in text-primary color. No icon or mark asset needed.
- **D-06:** Header uses border-b border-border (semantic token) for subtle separator. Changes correctly in dark mode.
- **D-07:** Header container switches from max-w-7xl (1280px) to max-w-site (1120px) per DESIGN.md.

### Modal Consistency
- **D-08:** Shared CSS pattern for modal shell — .modal-backdrop and .modal-panel classes in globals.css. Each modal applies the class but keeps its own content layout. Headless UI Dialog stays as the underlying component.
- **D-09:** 2 modal sizes: .modal-panel-sm (max-w-md, 448px) for simple confirms/forms, .modal-panel-lg (max-w-xl, 576px) for complex content like PaymentModal.

### NZ Region Map
- **D-10:** Teal accent system for region fills — accent-light for hover, accent for selected. Map visually integrates with the rest of the app.
- **D-11:** Heat-map shading by demand intensity — regions with more wanted ads get deeper teal fill. Data-forward, matches DESIGN.md's "data should be the hero" principle.

### Claude's Discretion
- Mobile menu styling and animation approach
- Notification badge styling (accent color assumed)
- EmptyState illustration/icon treatment
- FilterPanel and RegionFilterPanel layout approach
- Form field spacing and label positioning
- Close button style in modals
- Modal backdrop opacity
- AddressAutocomplete dropdown styling
- PropertyImageUpload drop zone styling
- Badge variant set (info, success, warning, error)
- Footer layout and link grouping

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN.md` — Single source of truth for all visual decisions: typography, color palette, spacing, border-radius, dark mode spec, grain texture, AI slop blacklist
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Detailed token values, CSS variable names, Tailwind config structure

### Phase 1 Outputs (Foundation)
- `apps/web/tailwind.config.ts` — Semantic color tokens, typography scale, spacing, border-radius
- `apps/web/src/app/globals.css` — CSS variables (:root and .dark), existing component classes (.btn-primary, .btn-secondary, .card, .input, .label)
- `apps/web/src/components/ThemeProvider.tsx` — next-themes provider (toggle component will import useTheme from next-themes)

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — COMP-01 through COMP-14 requirements with acceptance criteria
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, dependency on Phase 1

### Codebase Reference
- `.planning/codebase/CONVENTIONS.md` — Coding conventions, import patterns
- `.planning/codebase/STRUCTURE.md` — File organization, component locations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/ThemeProvider.tsx` — Already wired; toggle component will use `useTheme` from `next-themes`
- `apps/web/src/app/globals.css` — Already has .btn-primary, .btn-secondary, .btn-ghost, .btn-destructive, .card, .input, .label from Phase 1
- Headless UI `Dialog` — Used by all 5 modals, keep as underlying component

### Established Patterns
- All components are "use client" with direct Tailwind class application
- Components use old color tokens (bg-white, border-gray-200, text-primary-600) — need swapping to semantic tokens
- Header has auth-aware nav (useSession), mobile menu (useState), notification polling (useEffect + fetch)
- Modals use Headless UI Dialog with Transition for animations

### Component Inventory (files to modify)
- `header.tsx` (263 lines) — Logo, nav, mobile menu, notifications, auth
- `footer.tsx` (152 lines) — Links, copyright
- `ContactBuyerModal.tsx` (304 lines) — Buyer contact form
- `PaymentModal.tsx` (313 lines) — Stripe payment form
- `UpgradeModal.tsx` (140 lines) — Plan upgrade CTA
- `PostcardRequestModal.tsx` — Postcard request form
- `SaveSearchModal.tsx` — Save search form (in browse/)
- `FilterPanel.tsx` (243 lines) — Browse filters
- `RegionFilterPanel.tsx` — Region-specific filters
- `EmptyState.tsx` (229 lines) — Empty state displays
- `DemandCardGrid.tsx` (332 lines) — Card grid for wanted ads
- `NZRegionMap.tsx` (173 lines) — SVG region map
- `AddressAutocomplete.tsx` (343 lines) — Google Maps autocomplete
- `PropertyImageUpload.tsx` (329 lines) — Image upload with preview

### Integration Points
- globals.css — New CSS classes (modal shell, button sizes, badge variants) added here
- header.tsx — Dark mode toggle added to nav, max-width changed to max-w-site
- All components — Old color classes swapped to semantic tokens

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

*Phase: 02-shared-components*
*Context gathered: 2026-03-30*
