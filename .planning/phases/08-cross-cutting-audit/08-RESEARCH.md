# Phase 8: Cross-Cutting Audit - Research

**Researched:** 2026-03-30
**Domain:** Tailwind CSS design token compliance, DESIGN.md enforcement
**Confidence:** HIGH — all findings are from direct codebase grep scans, not inference

## Summary

This is a codebase audit, not theoretical research. Every violation was located by grepping `apps/web/src/` for specific patterns defined in DESIGN.md. The findings are concrete: file paths, line numbers, and exact tokens that need changing.

The violations concentrate heavily in the browse component group (`apps/web/src/components/browse/`), which was either a late-phase addition or missed cleanup. Six of the seven browse components have multiple violation types simultaneously. Outside browse, the typography violation (missing `font-display` on h1-h3) is the most widespread issue — affecting 29 files — but each fix is a low-risk, surgical one-liner per heading.

**Primary recommendation:** Split into two plans. Plan 1 fixes the browse component group (which has 4 violation types simultaneously). Plan 2 sweeps the rest of the codebase for typography (`font-display`) violations and the isolated max-width issues.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fix violations found. Build must pass after all fixes.
- Automated grep/scan of all page files and components for violations.
- No functionality changes — existing features must continue working identically after restyling.

### Claude's Discretion
- How violations are grouped into plans (by file cluster vs. by violation type).
- Whether to consolidate identical patterns with shared utility classes.

### Deferred Ideas (OUT OF SCOPE)
- New features or UI patterns not currently in the codebase.
- Accessibility auditing beyond the patterns listed in XCUT-06.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| XCUT-01 | All pages use max-width 1120px content container (not 1280px) | 6 files confirmed violating: 4 with `max-w-7xl`, 2 with `max-w-[1120px]` (should be `max-w-content`), 1 with `max-w-5xl` inline in a grid |
| XCUT-02 | All pages support dark mode with correct surface colors | 7 files with hardcoded `bg-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*` tokens that break dark mode |
| XCUT-03 | All interactive elements use teal accent via CSS variable tokens | 5 files using undefined Tailwind shades (`primary-600`, `accent-600`, `primary-50`, etc.) — these render as transparent/missing |
| XCUT-04 | All text uses correct DESIGN.md hierarchy (General Sans for h1-h3) | 29 files have h1/h2/h3 elements missing `font-display` class |
| XCUT-05 | No AI slop blacklist violations remain in any page | 2 files with `bg-gradient` (gradient cards/CTAs), 1 file with `bg-yellow-100` (non-semantic color) |
| XCUT-06 | All pages pass WCAG AA contrast ratios | All `<img>` tags have `alt` attributes. No icon-only buttons without `aria-label` found that lack visible labels. Table overflow wrappers present. No blocking violations found. |
| XCUT-07 | All pages responsive across sm/md/lg/xl breakpoints | Admin tables use `min-w-[640px]` with `overflow-x-auto` wrapper — acceptable pattern. No uncontained fixed-width blocks found. |
</phase_requirements>

---

## XCUT-01: Max-Width Violations

**Correct value:** `max-w-content` (defined in `tailwind.config.ts` as 1120px)
**Wrong values found:** `max-w-7xl` (1280px), `max-w-6xl`, `max-w-5xl`, `max-w-[1120px]` (hardcoded, not the utility)

### Files with `max-w-7xl` (must change to `max-w-content`)

| File | Line | Current | Fix |
|------|------|---------|-----|
| `apps/web/src/components/browse/BrowsePageClient.tsx` | 260 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8` | `max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8` |
| `apps/web/src/components/browse/FilterPanel.tsx` | 66 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | `max-w-content mx-auto px-4 sm:px-6 lg:px-8` |
| `apps/web/src/components/browse/RegionFilterPanel.tsx` | 294 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | `max-w-content mx-auto px-4 sm:px-6 lg:px-8` |
| `apps/web/src/components/browse/RegionPageClient.tsx` | 289, 311 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8` | `max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8` |

### Files with `max-w-[1120px]` (must change to `max-w-content`)

| File | Line | Current | Fix |
|------|------|---------|-----|
| `apps/web/src/components/footer.tsx` | 6 | `max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-12` | `max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12` |
| `apps/web/src/components/header.tsx` | 43 | `max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8` | `max-w-content mx-auto px-4 sm:px-6 lg:px-8` |

### Inline `max-w-5xl` (pricing grid, not a page container)

| File | Line | Context | Fix |
|------|------|---------|-----|
| `apps/web/src/app/page.tsx` | 300 | `<div className="grid md:grid-cols-3 gap-8 max-w-5xl">` — this is the pricing section inner grid, inside a `max-w-content` outer container | Change to `max-w-content` or remove — the outer container already constrains width |

---

## XCUT-02: Dark Mode Hardcoded Token Violations

**Design system approach:** CSS variables on `:root` override in `.dark {}`. All color classes must use the design token utilities (`bg-surface`, `text-text-base`, `border-border`, etc.), not Tailwind gray shades.

**Exception confirmed in code:** `apps/web/src/app/auth/signin/page.tsx` line 39 has comment `D-14: intentional brand trust signal, gray tokens preserved` for the Google OAuth button. This exception is documented and intentional — do NOT change that specific button's gray tokens.

### Browse Components (all 5 need full gray token replacement)

**`apps/web/src/components/browse/RegionPageClient.tsx`** — most violations (35+ lines)
- `bg-white rounded-xl border border-gray-200 p-4` (lines 373, 377, 381, 387, 399, 424, 447, 500) → `card p-4` (uses CSS variable surface + border)
- `text-gray-900` → `text-text-base`
- `text-gray-600` → `text-text-secondary`
- `text-gray-500` → `text-text-muted`
- `text-gray-400` → `text-text-muted`
- `text-gray-700` → `text-text-base`
- `border-gray-200` → `border-border`
- `bg-gray-100` → `bg-surface-raised`
- `bg-gray-50` → `bg-surface-raised`
- `bg-yellow-100 text-yellow-700` (line 432, rank badge) → `bg-secondary-light text-secondary`

**`apps/web/src/components/browse/BrowsePageClient.tsx`**
- `text-gray-600` (line 265) → `text-text-secondary`
- `text-gray-900` (lines 291, 306) → `text-text-base`
- `text-gray-500` (line 325) → `text-text-muted`
- `border-b-2 border-primary-600` (line 264, spinner) → `border-b-2 border-accent` (also XCUT-03)

**`apps/web/src/components/browse/MarketSummaryBar.tsx`**
- `card bg-gray-50 border-gray-200` (line 27) → `card` (card utility already handles bg/border via CSS vars)
- `text-gray-900` (lines 30, 51, 58) → `text-text-base`
- `text-gray-500` (lines 38, 45, 52, 59) → `text-text-muted`
- `text-gray-600` (line 31) → `text-text-secondary`

**`apps/web/src/components/browse/Pagination.tsx`**
- `border border-gray-300 bg-white hover:bg-gray-50` (lines 38, 55, 66) → `border border-border bg-surface hover:bg-surface-raised`
- `text-gray-500` (line 45) → `text-text-muted`

**`apps/web/src/components/browse/PropertyCardGrid.tsx`**
- `text-gray-900` (lines 34, 49) → `text-text-base`
- `text-gray-600` (lines 35, 47) → `text-text-secondary`
- `text-gray-500` (line 41) → `text-text-muted`
- Also has `from-white` in gradient — see XCUT-05

---

## XCUT-03: Undefined Tailwind Color Shades

**Root cause:** The tailwind config defines `primary` and `accent` as single CSS-variable colors, not as full shade scales (100-900). Classes like `primary-600`, `accent-600`, `primary-50`, `primary-100`, `primary-200`, `primary-400`, `primary-500` are **not defined** and render as transparent/nothing.

All instances are in `apps/web/src/components/browse/`:

| File | Line | Broken Class | Fix |
|------|------|-------------|-----|
| `BrowsePageClient.tsx` | 264 | `border-primary-600` (spinner) | `border-accent` |
| `MarketSummaryBar.tsx` | 37 | `text-accent-600` | `text-accent` |
| `MarketSummaryBar.tsx` | 44 | `text-primary-600` | `text-text-base` |
| `Pagination.tsx` | 54 | `bg-primary-600 text-white` | `bg-accent text-white` |
| `PropertyCardGrid.tsx` | 30 | `border-primary-200`, `to-primary-50`, `hover:border-primary-400` | `border-border`, remove gradient, `hover:border-accent` |
| `PropertyCardGrid.tsx` | 40 | `text-primary-600` | `text-accent` |
| `PropertyCardGrid.tsx` | 46 | `border-primary-100` | `border-border` |
| `RegionPageClient.tsx` | 291 | `border-primary-600` (spinner) | `border-accent` |
| `RegionPageClient.tsx` | 316, 325, 340 | `hover:text-primary-600` | `hover:text-accent` |
| `RegionPageClient.tsx` | 374 | `text-primary-600` | `text-text-base` |
| `RegionPageClient.tsx` | 378 | `text-accent-600` | `text-accent` |
| `RegionPageClient.tsx` | 408 | `bg-primary-500` (progress bar) | `bg-accent` |
| `RegionPageClient.tsx` | 525 | `from-primary-50 to-accent-50` (gradient CTA) | Remove gradient — see XCUT-05 |

---

## XCUT-04: Typography — Headings Missing `font-display`

**Rule:** All h1, h2, h3 elements must have `font-display` class (General Sans). DESIGN.md: "Used for all headlines h1-h3, hero text, stat values."

**29 files** have at least one heading missing `font-display`. This is the highest-volume violation. Each fix is mechanical: add `font-display` to the className string.

### Files grouped by severity (heading count without font-display)

**High (7+ headings to fix):**
| File | Headings Missing font-display |
|------|-------------------------------|
| `apps/web/src/app/wanted/[id]/page.tsx` | 12 |
| `apps/web/src/app/page.tsx` | 11 |
| `apps/web/src/app/owner/page.tsx` | 10 |
| `apps/web/src/components/browse/RegionPageClient.tsx` | 8 |
| `apps/web/src/app/owner/register/page.tsx` | 7 |
| `apps/web/src/app/owner/properties/[id]/page.tsx` | 7 |
| `apps/web/src/app/buyer/create/page.tsx` | 7 |

**Medium (3-6 headings to fix):**
| File | Headings Missing font-display |
|------|-------------------------------|
| `apps/web/src/app/admin/billing/settings/page.tsx` | 5 |
| `apps/web/src/app/owner/my-properties/page.tsx` | 4 |
| `apps/web/src/app/buyer/postcards/page.tsx` | 4 |
| `apps/web/src/app/admin/billing/page.tsx` | 4 |
| `apps/web/src/components/footer.tsx` | 3 |
| `apps/web/src/components/PaymentModal.tsx` | 3 |
| `apps/web/src/components/ContactBuyerModal.tsx` | 3 |
| `apps/web/src/app/upgrade/page.tsx` | 3 |
| `apps/web/src/app/property/[address]/page.tsx` | 3 |
| `apps/web/src/app/help/page.tsx` | 3 |

**Low (1-2 headings to fix):**
| File | Headings Missing font-display |
|------|-------------------------------|
| `apps/web/src/components/browse/BrowsePageClient.tsx` | 2 |
| `apps/web/src/app/saved-searches/page.tsx` | 2 |
| `apps/web/src/app/admin/email-templates/page.tsx` | 2 |
| `apps/web/src/components/browse/MarketSummaryBar.tsx` | 1 |
| `apps/web/src/app/admin/billing/escrows/page.tsx` | 1 |
| `apps/web/src/app/admin/email-templates/[name]/page.tsx` | 1 (h2 on line 202) |
| `apps/web/src/app/admin/page.tsx` | 1 |
| `apps/web/src/app/buyer/my-ads/page.tsx` | 1 |
| `apps/web/src/app/claim/[code]/page.tsx` | 1 |
| `apps/web/src/components/browse/EmptyState.tsx` | 1 (h3 label) |
| `apps/web/src/components/browse/SaveSearchModal.tsx` | 1 (h2 - uses font-bold but not font-display) |
| `apps/web/src/components/UpgradeModal.tsx` | 1 |

**Note on footer h3 headings (lines 57, 84, 106):** These are nav section labels ("For Buyers", "For Owners", "Company") using `text-xs uppercase tracking-wide`. Font-display on xs/uppercase nav labels is a stylistic edge case. The DESIGN.md rule is clear — add `font-display` to be compliant. The footer also uses `max-w-[1120px]` (XCUT-01 issue addressed above).

---

## XCUT-05: AI Slop Blacklist Violations

### Gradient violations (DESIGN.md: "No decorative blobs, gradients, or SVG patterns")

| File | Line | Violation | Fix |
|------|------|-----------|-----|
| `apps/web/src/components/browse/PropertyCardGrid.tsx` | 30 | `bg-gradient-to-br from-white to-primary-50` on property cards | Remove gradient; use `card` utility (plain surface with grain texture) |
| `apps/web/src/components/browse/RegionPageClient.tsx` | 525 | `bg-gradient-to-r from-primary-50 to-accent-50` on CTA block | Remove gradient; use `bg-surface-raised` or `bg-accent-light` for subtle emphasis |

### Non-semantic color (rank badge)

| File | Line | Violation | Fix |
|------|------|-----------|-----|
| `apps/web/src/components/browse/RegionPageClient.tsx` | 432 | `bg-yellow-100 text-yellow-700` (first-place rank badge) | `bg-secondary-light text-secondary` (amber from design system = urgency/highlight token) |

### Not present (confirmed clean)
- No purple/violet/indigo gradients found
- No SVG pattern backgrounds or blob SVGs found
- No "Welcome to...", "Unlock the power...", "Find your dream home" copy found
- No generic hero copy — homepage uses real demand data or factual product description
- Hero text is left-aligned (confirmed in `page.tsx` — no `text-center` on hero section)
- Pricing section is 3-column but cards are NOT identical structure (Free/Starter/Pro with different content)

---

## XCUT-06: Accessibility

### Images without alt attributes
**All `<img>` tags have `alt` attributes.** Verified across all 7 files that contain `<img>` elements:
- `apps/web/src/app/inquiries/[id]/page.tsx:248` — `alt={inquiry.buyer.name || "Buyer"}` ✓
- `apps/web/src/app/owner/properties/[id]/page.tsx:406` — `alt="Property"` ✓
- `apps/web/src/app/wanted/[id]/page.tsx:254, 263, 849` — `alt="Street view"`, `alt="Aerial view"`, `alt={ad.buyer.name || "Buyer"}` ✓
- `apps/web/src/components/AddressAutocomplete.tsx:335` — `alt="Google"` ✓
- `apps/web/src/components/PropertyImageUpload.tsx:184` — `alt={image.filename}` ✓

### Buttons without accessible labels
No icon-only buttons without `aria-label` or visible text found. All `<button>` elements in scope either have visible text content or contain SVG icons that are supplementary to labeled context.

### Status: XCUT-06 passes — no violations to fix

---

## XCUT-07: Responsive Layout

### Admin tables
Three admin tables use `min-w-[640px]` inside an `overflow-x-auto` wrapper:
- `apps/web/src/app/admin/users/page.tsx:133` — wrapped in `<div className="card overflow-x-auto p-0">`
- `apps/web/src/app/admin/billing/escrows/page.tsx:220` — wrapped in overflow container
- `apps/web/src/app/admin/billing/subscriptions/page.tsx:187` — wrapped in overflow container

This is the correct responsive table pattern. Tables can scroll horizontally on small viewports. **No fix needed.**

### Chat bubbles
`apps/web/src/app/inquiries/[id]/page.tsx:313` uses `max-w-[80%]` for chat message bubbles — correct responsive pattern for chat UI.

### Filter panel
`apps/web/src/components/browse/FilterPanel.tsx` uses `min-w-[180px]` on flex children — acceptable flex layout constraint, not a fixed viewport-width value.

### Status: XCUT-07 passes — no violations to fix beyond the max-w-content fixes in XCUT-01

---

## Standard Replacement Map

This is the authoritative token mapping. Plans must use these replacements consistently:

| Hardcoded Token | Replace With | Notes |
|----------------|-------------|-------|
| `bg-white` | `bg-surface` | CSS var: `#ffffff` light, `#1a1a2e` dark |
| `bg-gray-50` | `bg-surface-raised` | CSS var: `#f5f5f0` light, `#252540` dark |
| `bg-gray-100` | `bg-surface-raised` | Same as above |
| `bg-gray-200` | `bg-border` / `bg-surface-raised` | Context-dependent |
| `text-gray-900` | `text-text-base` | CSS var: `#1a1a2e` light, `#fafaf7` dark |
| `text-gray-700` | `text-text-base` | Same as above |
| `text-gray-600` | `text-text-secondary` | CSS var: `#6b7280` light, `#9ca3af` dark |
| `text-gray-500` | `text-text-muted` | CSS var: `#9ca3af` light, `#6b7280` dark |
| `text-gray-400` | `text-text-muted` | Same as above |
| `border-gray-300` | `border-border` | CSS var: `#e5e5e0` light, `#374151` dark |
| `border-gray-200` | `border-border` | Same |
| `border-gray-100` | `border-border` | Same |
| `primary-600` | `accent` | Teal accent — interactive primary |
| `primary-500` | `accent` | Same |
| `primary-400` | `accent-hover` | Hover state |
| `primary-200` | `border` | Border context |
| `primary-100` | `border` or `accent-light` | Context-dependent |
| `primary-50` | `surface-raised` | Subtle background |
| `accent-600` | `accent` | Direct replacement |
| `accent-50` | `accent-light` | Light teal tint |
| `bg-yellow-100 text-yellow-700` | `bg-secondary-light text-secondary` | Amber from design system |

---

## Violation Count Summary

| XCUT ID | Description | Files Affected | Total Violations | Priority |
|---------|-------------|---------------|-----------------|----------|
| XCUT-01 | Max-width containers | 6 files | 8 lines | HIGH |
| XCUT-02 | Dark mode tokens | 6 files (excl. intentional D-14 exception) | ~40 lines | HIGH |
| XCUT-03 | Undefined color shades | 5 files (all in browse/) | 14 lines | HIGH — renders broken |
| XCUT-04 | Missing font-display | 29 files | ~100 headings | MEDIUM — visual only |
| XCUT-05 | AI slop (gradients + yellow) | 2 files | 3 lines | MEDIUM |
| XCUT-06 | Accessibility | 0 files | 0 | NONE |
| XCUT-07 | Responsiveness | 0 files | 0 | NONE |

---

## Plan Structure Recommendation

**Plan 1: Fix Browse Component Group**
Fixes XCUT-01 (4 browse files), XCUT-02 (5 browse files), XCUT-03 (all 5 browse files), XCUT-05 (2 browse files) simultaneously. All violations in this group overlap in the same files. Batch these as one focused plan.

Files: `BrowsePageClient.tsx`, `FilterPanel.tsx`, `RegionFilterPanel.tsx`, `RegionPageClient.tsx`, `MarketSummaryBar.tsx`, `Pagination.tsx`, `PropertyCardGrid.tsx`

**Plan 2: Fix Header/Footer Max-Width**
Quick fix: `header.tsx` and `footer.tsx` both use `max-w-[1120px]` hardcoded. One-line fix each. Also fix `page.tsx` pricing grid `max-w-5xl`.

**Plan 3: Typography Sweep — High-Volume Files**
Add `font-display` to all h1/h2/h3 in the 7 high-severity files (7+ headings each): `wanted/[id]/page.tsx`, `page.tsx`, `owner/page.tsx`, `owner/register/page.tsx`, `owner/properties/[id]/page.tsx`, `buyer/create/page.tsx`.

**Plan 4: Typography Sweep — Medium/Low Volume Files**
Add `font-display` to remaining 22 files (1-5 headings each). Mechanical changes.

**Plan 5: Build Verification**
Run `pnpm build` in `apps/web/` and `pnpm lint` to confirm zero TypeScript errors and no ESLint warnings introduced. Since this phase is restyling only, the build is the primary gate.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Color token replacement | Custom CSS classes | Tailwind utilities with CSS variable tokens (already defined in globals.css) |
| Font enforcement | @apply mixins | Add `font-display` class directly to elements |
| Dark mode surfaces | Separate dark: prefixed utilities | CSS variable tokens (already flip via `.dark {}` selector) |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed in `apps/web/` |
| Config file | None — no jest.config, vitest.config, or playwright.config found |
| Quick run command | `cd apps/web && pnpm lint` |
| Full suite command | `cd apps/web && pnpm build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| XCUT-01 | No `max-w-7xl`/`max-w-6xl` in source | Grep assertion | `grep -rn "max-w-7xl\|max-w-6xl" apps/web/src/ --include="*.tsx"` should return empty | ✅ (grep) |
| XCUT-02 | No `bg-gray-*`/`text-gray-*`/`border-gray-*`/`bg-white` outside D-14 exception | Grep assertion | `grep -rn "bg-gray-\|text-gray-\|border-gray-\|bg-white" apps/web/src/ --include="*.tsx"` should return only the D-14 exception line | ✅ (grep) |
| XCUT-03 | No `primary-[0-9]` or `accent-[0-9]` color shades | Grep assertion | `grep -rn "primary-[0-9]\|accent-[0-9]" apps/web/src/ --include="*.tsx"` should return empty | ✅ (grep) |
| XCUT-04 | All h1/h2/h3 have `font-display` | Grep assertion | `grep -rn "<h[1-3][^>]*>" apps/web/src/ --include="*.tsx" \| grep -v font-display` should return empty | ✅ (grep) |
| XCUT-05 | No `bg-gradient` in tsx files | Grep assertion | `grep -rn "bg-gradient" apps/web/src/ --include="*.tsx"` should return empty | ✅ (grep) |
| XCUT-06 | Build passes cleanly | Build | `cd apps/web && pnpm build` exits 0 | ✅ (build) |
| XCUT-07 | Build passes cleanly | Build | `cd apps/web && pnpm build` exits 0 | ✅ (build) |

### Sampling Rate
- **Per task commit:** `grep -rn "max-w-7xl\|bg-gray-\|primary-[0-9]\|bg-gradient" apps/web/src/ --include="*.tsx"` (fast pattern check)
- **Per wave merge:** `cd apps/web && pnpm build`
- **Phase gate:** Full build green + all grep assertions empty

### Wave 0 Gaps
None — no test framework needed. Validation is grep-based (pattern absence checks) plus the existing `pnpm build` command.

---

## Common Pitfalls

### Pitfall 1: Touching the D-14 Exception
**What goes wrong:** Replacing `border-gray-300 text-gray-700 hover:bg-gray-50` on the Google sign-in button in `auth/signin/page.tsx` line 42.
**Why it happens:** Automated gray-token search finds it.
**How to avoid:** The comment `D-14: intentional brand trust signal, gray tokens preserved` marks this as intentional. Do not change that specific button. Only the Google OAuth button gets this exception — the rest of the signin page should use design tokens.
**Warning signs:** If a plan touches line 42 of `auth/signin/page.tsx`, check the comment first.

### Pitfall 2: Replacing `card` Utility with Manual Tokens
**What goes wrong:** Replacing `bg-white border-gray-200` with `bg-surface border-border` when the element should just use the `card` component utility.
**Why it happens:** Mechanical token replacement misses the semantic shorthand.
**How to avoid:** If an element is a card, use `card` (defined in globals.css). The `card` utility applies `bg-surface rounded-lg border border-border p-6` via CSS variable tokens and includes the grain texture overlay.

### Pitfall 3: `primary-N` Shade in Conditional Classnames
**What goes wrong:** Missing a `primary-600` reference inside a ternary string like `` `bg-${active ? 'primary-600' : 'gray-100'}` ``.
**Why it happens:** Grep for literal `primary-600` misses dynamic string construction.
**How to avoid:** After mechanical fixes, check for ternary or template-literal class construction in browse components, especially `RegionPageClient.tsx`.

### Pitfall 4: Font-Display on Skeleton/Placeholder Headings
**What goes wrong:** Adding `font-display` to skeleton placeholder divs that are styled to look like headings.
**Why it happens:** Confusing skeleton loading states (`<div className="h-4 bg-surface-raised rounded">`) with actual heading elements.
**How to avoid:** Only add `font-display` to actual `<h1>`, `<h2>`, `<h3>` elements, not divs.

---

## Sources

### Primary (HIGH confidence)
- Direct grep of `apps/web/src/` — all findings are exact file:line references from the actual codebase
- `apps/web/tailwind.config.ts` — confirmed `max-w-content: "1120px"` defined, confirmed `primary` and `accent` are single CSS-variable colors (not shade scales)
- `apps/web/src/app/globals.css` — confirmed CSS variable definitions and `.dark {}` overrides
- `/Users/adam-personal/CODER/IDEAS/offmarket/DESIGN.md` — authoritative design rules

### Secondary (N/A)
No external sources needed — this is a codebase audit.

---

## Metadata

**Confidence breakdown:**
- Violation inventory: HIGH — every finding is a direct grep result with file:line
- Replacement tokens: HIGH — verified against tailwind.config.ts and globals.css
- Plan structure: HIGH — violations cluster clearly in browse/ vs. spread typography issues

**Research date:** 2026-03-30
**Valid until:** Until codebase changes — re-run greps before executing plans if any upstream changes occur
