# Phase 3: Public Pages - Research

**Researched:** 2026-03-30
**Domain:** Next.js 15 / Tailwind CSS 3 — page-level restyling, token migration, AI slop removal
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Hero leads with live demand stats — active buyer count, regions with demand, avg budget. Data is the hero, not marketing copy. Teal CTA buttons below the stats.
- **D-02:** Hero background is warm off-white (`bg-surface` / `#fafaf7` light, `#0f0f1a` dark). No gradient, no SVG pattern, no colored background.
- **D-03:** Trust indicators row removed entirely. The data-forward approach IS the trust signal.
- **D-04:** Fallback when demand data unavailable: show static left-aligned value proposition copy about the reverse marketplace concept. No numbers shown, no skeleton loader.
- **D-05:** Hero text is left-aligned per DESIGN.md. The "Find Your Dream Home" copy is replaced with data-forward messaging.
- **D-06:** All section headings left-aligned across the entire homepage. No centered text blocks anywhere.
- **D-07:** How It Works section: numbered steps (1, 2, 3) in plain left-aligned text. No icon-in-circle cards, no colored background panels (no `bg-primary-50`, `bg-accent-50`).
- **D-08:** Stats row: keep but restyle with `tabular-nums`, semantic color tokens, `max-w-site`. Grid layout acceptable for stats since it reads well as a data display.
- **D-09:** Demand Checker section: keep on homepage, restyle container with DESIGN.md tokens, left-align section heading, remove the pill badge pattern ("For Property Owners" badge).
- **D-10:** All sections switch from `max-w-7xl` (1280px) to `max-w-site` (1120px) → in this project the custom token is `max-w-content`.
- **D-11:** Privacy and Terms pages: drop `prose prose-gray` plugin. Use DESIGN.md semantic tokens directly — `text-primary` for headings (General Sans), `text-secondary` for body (DM Sans), `bg-surface`, `max-w-site`.
- **D-12:** Help/FAQ: keep accordion expand/collapse pattern. Restyle with DESIGN.md tokens — surface cards, `border-border`, accent color for expand/collapse icon. Left-aligned headings and content.
- **D-13:** Auth page keeps centered card layout — UX convention exception. Card restyled with `.card` class, semantic tokens, teal focus rings on inputs.
- **D-14:** Google OAuth button retains Google brand colors (white bg, Google 'G' icon with brand colors) as a trust signal. Not restyled to DESIGN.md button variants.
- **D-15:** Explore page: swap `max-w-7xl` to `max-w-content`, replace all `gray-*` hardcoded colors with semantic tokens. Loading skeleton uses semantic surface colors instead of `bg-gray-200`.
- **D-16:** Region pages: same token swap treatment. Both pages already use BrowsePageClient and RegionPageClient which were restyled in Phase 2 — page-level wrappers just need container and skeleton updates.

### Claude's Discretion

- Homepage section ordering and vertical rhythm/spacing between sections
- Exact demand stats to surface in hero (which API fields) — Claude picks what's available
- CTA section at bottom of homepage — restyle or remove based on DESIGN.md compliance
- Testimonials section treatment — restyle or remove if it has AI slop patterns
- Responsive breakpoint adjustments for hero and sections
- FAQ category tab styling (general/buyers/owners tabs in help page)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PUBL-01 | Homepage restyled — remove AI slop (gradient hero, SVG pattern, centered text), left-align hero, data-forward design, teal accent CTAs | Hero section audit complete — gradient + SVG pattern + centered h1 + trust row all confirmed present and must be removed |
| PUBL-02 | Explore/browse page restyled with DESIGN.md grid, cards, filters | Skeleton uses `bg-gray-200`/`bg-gray-100`; container uses `max-w-7xl` — both need token swap |
| PUBL-03 | Region pages restyled | Skeleton uses `bg-gray-200`/`bg-gray-100`; container uses `max-w-7xl` — identical fixes to PUBL-02 |
| PUBL-04 | Help/FAQ page restyled | Category tabs use `bg-primary-600`/`bg-gray-100`/`rounded-full` pills — blacklist violation; contact box uses `bg-gray-100 rounded-xl`; quick action cards have icon-in-colored-circle pattern |
| PUBL-05 | Privacy policy page restyled | Uses `prose prose-gray` wrapper + hardcoded `gray-*` tokens throughout |
| PUBL-06 | Terms of service page restyled | Same `prose prose-gray` pattern as privacy page |
| PUBL-07 | Auth/signin page restyled | Google button uses hardcoded `gray-300`/`gray-700`; divider uses `gray-200`/`gray-500`; fallback skeleton uses `bg-gray-200`; sign-in heading uses `text-gray-900`; disclaimer uses `text-primary-600` (non-existent token in new config) |
</phase_requirements>

---

## Summary

Phase 3 is a pure restyling pass over seven public-facing pages. The infrastructure (tokens, fonts, dark mode, component classes) is fully established from Phases 1 and 2 — no new dependencies, no new component classes, and no backend changes are required. The work is entirely token migration and AI slop removal.

The homepage (`apps/web/src/app/page.tsx`, 692 lines) is the largest file and contains the most violations: gradient hero with SVG background pattern, centered text throughout, hardcoded `gray-*` and `primary-*` tokens, icon-in-colored-circle cards in three sections, a testimonials section (fake quotes, star ratings — classic AI slop), a pricing section with a gradient `bg-primary-600` Pro tier card, and a final CTA section with another gradient. The homepage hero also requires a structural change: the data-forward stats moved from a standalone row to the hero itself.

The other six pages are lighter lifts. Explore and region pages need only skeleton color token swaps and `max-w-7xl` → `max-w-content` container fixes — their inner components (BrowsePageClient, RegionPageClient) were already restyled in Phase 2. Legal pages (privacy, terms) need the `prose prose-gray` wrapper removed and tokens replaced. The auth page and help/FAQ are medium-complexity — right structural skeleton, wrong color tokens throughout.

**Primary recommendation:** Break Phase 3 into five plans: (1) homepage hero + stats structural rebuild, (2) homepage remaining sections cleanup, (3) explore + region page wrapper fixes, (4) auth + help/FAQ restyling, (5) legal pages (privacy + terms) restyling.

---

## Standard Stack

No new libraries are needed. All tools are already installed.

### Core (all already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Tailwind CSS | 3.4.16 | Utility classes + semantic tokens | Active — `tailwind.config.ts` complete |
| Next.js | 15.1.0 | App Router pages, server components | Active |
| React | 19.0.0 | Client components (`"use client"`) | Active |
| next-themes | 0.4.6 | Dark mode via `.dark` class | Active — ThemeProvider wired |

### Phase 2 Outputs Available for Reuse
| Asset | Location | Used In Phase 3 |
|-------|----------|-----------------|
| `.card` | `globals.css` | Auth card, FAQ items, demand checker wrapper |
| `.btn-primary` | `globals.css` | All CTAs on every page |
| `.btn-secondary` | `globals.css` | Secondary CTAs, cancel actions |
| `.input` | `globals.css` | Auth form email field |
| `.label` | `globals.css` | Auth form label |
| `.badge-info`, `.badge-neutral` | `globals.css` | FAQ category indicators |
| `BrowsePageClient` | `src/components/browse/` | Already restyled — no changes needed |
| `RegionPageClient` | `src/components/browse/` | Already restyled — no changes needed |
| `DemandChecker` | `src/components/demand-checker.tsx` | Mostly uses semantic tokens already; needs container + result-state color fixes |

**No `npm install` required for this phase.**

---

## Architecture Patterns

### Page Component Patterns (already established in codebase)

**Server components** (no `"use client"`): `page.tsx` (homepage), `privacy/page.tsx`, `terms/page.tsx`, `explore/[region]/page.tsx`. These export metadata and render static or Suspense-wrapped content.

**Client components** (`"use client"`): `auth/signin/page.tsx`, `help/page.tsx`, `demand-checker.tsx`. These use `useState`/`useEffect` and event handlers.

**Suspense wrapper pattern** (explore, region, auth):
```typescript
// Source: apps/web/src/app/explore/page.tsx
function BrowseLoading() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* skeleton with bg-surface-raised animate-pulse instead of bg-gray-200 */}
    </div>
  );
}
export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowsePageClient />
    </Suspense>
  );
}
```

### Token Usage Patterns (from Phase 2 precedents)

```typescript
// CORRECT: semantic tokens only
className="bg-surface border-border text-text-base"
className="text-text-secondary"
className="bg-surface-raised"  // for nested surfaces, skeletons

// WRONG: hardcoded gray-* or primary-* tokens
className="bg-gray-200"        // replace with bg-surface-raised
className="bg-gray-100"        // replace with bg-surface-raised
className="text-gray-600"      // replace with text-text-secondary
className="text-gray-900"      // replace with text-text-base
className="border-gray-200"    // replace with border-border
className="bg-primary-600"     // replace with bg-accent (for CTAs) or bg-primary
className="text-primary-600"   // replace with text-accent (for links)
```

### Max-Width Pattern

```typescript
// CORRECT
className="max-w-content mx-auto px-4 sm:px-6 lg:px-8"

// WRONG — replace in all 7 pages
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
// Also wrong:
className="max-w-4xl mx-auto px-4"  // legal/help pages — replace with max-w-content
className="max-w-3xl mx-auto px-4"  // homepage FAQ section — use max-w-content or narrower as appropriate
```

### Homepage Hero Structural Pattern (D-01 through D-05)

The hero must become a data-forward, left-aligned section on `bg-bg`. The structural shift:

```typescript
// BEFORE: gradient bg, SVG pattern, centered, marketing copy hero
<section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden">
  <div className="absolute inset-0 opacity-10">
    {/* SVG pattern */}
  </div>
  <h1>Find Your Dream Home</h1>
  {/* trust indicators row */}
</section>

// AFTER: bg-bg surface, left-aligned, data-forward
<section className="bg-bg py-16 md:py-24">
  <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
    {/* Left column: stats grid then CTA buttons */}
    {/* DemandSignal stats (or fallback copy if API unavailable) */}
    {/* NO trust indicators row */}
  </div>
</section>
```

### Legal Pages Pattern (D-11)

Remove `prose prose-gray` wrapper — it requires the Tailwind Typography plugin which is not installed. Replace all inline color tokens:

```typescript
// BEFORE
<div className="prose prose-gray max-w-none">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Section</h2>
  <p className="text-gray-700 mb-4">Body copy</p>
</div>

// AFTER
<div className="max-w-none">
  <h2 className="text-xl font-display font-semibold text-text-base mb-4">Section</h2>
  <p className="text-md text-text-secondary mb-4">Body copy</p>
</div>
```

**Note:** `prose prose-gray` is already non-functional since Tailwind Typography plugin is not in `tailwind.config.ts` plugins array. The classes are being silently ignored. Removing the div wrapper has no visual regression risk — the actual styling comes from the inline classes which need to be fixed regardless.

### FAQ Accordion Pattern (D-12)

Keep existing `useState` toggle pattern. Fix:
- Category tab pills: replace `rounded-full bg-primary-600 text-white` active state with `rounded-sm bg-accent text-white`; inactive: `bg-surface-raised text-text-secondary hover:bg-surface border-border`
- FAQ card: already uses `.card` class — check overflow-hidden is preserved for expand animation
- Answer text: `text-gray-600` → `text-text-secondary`
- Chevron icon: `text-gray-500` → `text-accent` when open, `text-text-muted` when closed
- Category badges in "all" view: replace `bg-blue-100 text-blue-700` with `badge-info`, `bg-green-100 text-green-700` with `badge-success`, `bg-gray-100 text-gray-700` with `badge-neutral`
- Contact box: `bg-gray-100 rounded-xl` → `bg-surface-raised rounded-lg`
- Quick action card icons: `text-primary-600` → `text-accent`

### Auth Page Pattern (D-13, D-14)

Centered card layout is preserved as a UX exception. Fixes needed:
- Page wrapper heading: `text-gray-900` → `text-text-base`, `text-gray-600` → `text-text-secondary`
- Google button: keep `border border-gray-300 text-gray-700 hover:bg-gray-50` — this is intentional (D-14, Google brand trust signal). Do NOT replace with semantic tokens.
- Divider: `border-t border-gray-200` → `border-t border-border`; span `bg-white text-gray-500` → `bg-surface text-text-muted`
- Error state: `bg-red-50 border border-red-200 rounded-lg text-red-700` → `bg-error/10 border border-error/30 rounded-md text-error`
- Disclaimer links: `text-primary-600 hover:underline` → `text-accent hover:underline`
- Skeleton fallback: `bg-gray-200` → `bg-surface-raised`

### Demand Checker Restyling (D-09)

The `DemandChecker` component uses mostly semantic tokens already (`.card`, `.btn-primary`, `.input`, `.label`). Remaining fixes:
- Result state when `hasInterest`: `bg-green-50 border-green-200` → `bg-success/10 border border-success/30`; `text-green-600` → `text-success`; `text-green-700` → `text-success`
- Result state when no interest: `bg-gray-50 border-gray-200` → `bg-surface-raised border-border`; `text-gray-600` → `text-text-secondary`; `text-gray-500` → `text-text-muted`

---

## AI Slop Inventory

Violations found in each file, mapped to DESIGN.md blacklist:

### Homepage (`apps/web/src/app/page.tsx`)
| Violation | Location | Fix |
|-----------|----------|-----|
| Gradient hero background | Line 8 | Remove — bg-bg only per D-02 |
| SVG cross-hatch pattern overlay | Lines 10-14 | Remove entirely per D-02 |
| Centered h1 "Find Your Dream Home" | Line 26 | Left-align, replace copy per D-05 |
| Trust indicators row (checkmark list) | Lines 56-79 | Remove entirely per D-03 |
| Fake/hardcoded stats (`500+`, `$1.2M`, `48hrs`) | Lines 88-105 | Replace with real API data or live fetch per DESIGN.md |
| `max-w-7xl` throughout | Multiple | → `max-w-content` per D-10 |
| Centered section headings | Lines 115, 131, 275, 381, 514 | → left-aligned per D-06 |
| Icon-in-colored-circle (buyer/owner steps) | Lines 143-147, 207-211 | Remove circles, use plain numbered text per D-07 |
| `bg-primary-50` / `bg-accent-50` section panels | Lines 141, 205 | → no background or `bg-surface-raised` per D-07 |
| Icon-in-colored-circle benefits grid | Lines 285-295, 300-305, etc. | Remove circles. Benefits grid itself is 3-col feature grid blacklist pattern — consider removing section |
| Hardcoded `bg-white rounded-xl shadow-sm` benefit cards | Lines 284, 299, etc. | → `.card` class |
| Pricing section: gradient Pro tier `bg-primary-600` | Lines 423-463 | Restyle using `bg-accent` or restructure — no gradient card |
| Testimonials section with star ratings + fake quotes | Lines 511-589 | High AI slop signal — remove or restyle without stars |
| Final CTA gradient `bg-gradient-to-br from-primary-600 to-primary-800` | Line 662 | Remove gradient — `bg-primary` or `bg-accent` or plain `bg-bg` |
| "Ready to Find Your Dream Home?" final CTA copy | Line 664 | AI slop copy — replace with DESIGN.md compliant messaging |
| All `text-gray-*`, `bg-gray-*` inline tokens | Throughout | → semantic tokens |

### Explore (`apps/web/src/app/explore/page.tsx`)
| Violation | Location | Fix |
|-----------|----------|-----|
| `max-w-7xl` container | Line 8 | → `max-w-content` |
| `bg-gray-200` skeleton pulses | Lines 11, 14, 18 | → `bg-surface-raised` |
| `bg-gray-100` skeleton cards | Lines 14, 18 | → `bg-surface-raised` |

### Region (`apps/web/src/app/explore/[region]/page.tsx`)
| Violation | Location | Fix |
|-----------|----------|-----|
| `max-w-7xl` container | Lines 55, 65 | → `max-w-content` |
| `bg-gray-200` / `bg-gray-100` skeleton | Lines 57, 58, 62, 66 | → `bg-surface-raised` |

### Auth (`apps/web/src/app/auth/signin/page.tsx`)
| Violation | Location | Fix |
|-----------|----------|-----|
| `text-gray-900` heading | Line 141 | → `text-text-base` |
| `text-gray-600` subtitle | Line 142 | → `text-text-secondary` |
| Google button `border-gray-300 text-gray-700 hover:bg-gray-50` | Lines 42-43 | KEEP per D-14 |
| Divider `border-gray-200` | Line 67 | → `border-border` |
| Divider span `bg-white text-gray-500` | Lines 69-71 | → `bg-surface text-text-muted` |
| Error `bg-red-50 border-red-200 text-red-700` | Lines 94-96 | → `bg-error/10 border-error/30 text-error` |
| Disclaimer `text-gray-500` + `text-primary-600` | Lines 108, 110, 114 | → `text-text-muted` + `text-accent` |
| Skeleton `bg-gray-200` | Lines 125-132 | → `bg-surface-raised` |

### Help (`apps/web/src/app/help/page.tsx`)
| Violation | Location | Fix |
|-----------|----------|-----|
| `text-center` heading | Line 122 | → left-align |
| `text-gray-900` / `text-gray-600` | Lines 123-132 | → semantic tokens |
| `justify-center` category tabs | Line 137 | → `justify-start` |
| `rounded-full` pills (active + inactive) | Line 145 | → `rounded-sm` |
| `bg-primary-600 text-white` active pill | Line 147 | → `bg-accent text-white` |
| `bg-gray-100 text-gray-700 hover:bg-gray-200` inactive pill | Line 148 | → semantic tokens |
| `text-gray-900` question text | Line 185 | → `text-text-base` |
| FAQ category badge `bg-blue-100 text-blue-700` buyers | Lines 171-183 | → `badge-info` |
| FAQ category badge `bg-green-100 text-green-700` owners | Lines 171-183 | → `badge-success` |
| FAQ category badge `bg-gray-100 text-gray-700` general | Lines 171-183 | → `badge-neutral` |
| `text-gray-500` chevron icon | Line 188 | → `text-accent` (open) / `text-text-muted` (closed) |
| `text-gray-600` answer text | Line 204 | → `text-text-secondary` |
| `border-gray-100` answer separator | Line 205 | → `border-border` |
| Quick action card `text-primary-600` icon | Lines 222, 247 | → `text-accent` |
| Contact box `bg-gray-100 rounded-xl` | Line 264 | → `bg-surface-raised rounded-lg` |
| `text-gray-900` / `text-gray-600` contact box text | Lines 265, 268 | → semantic tokens |
| `max-w-4xl` container | Line 121 | → `max-w-content` |

### Privacy (`apps/web/src/app/privacy/page.tsx`)
| Violation | Location | Fix |
|-----------|----------|-----|
| `prose prose-gray max-w-none` wrapper div | Line 13 | Remove plugin class — plugin not installed |
| `text-gray-900` all h2 headings | 12 instances | → `text-text-base font-display` |
| `text-gray-800` h3 headings | 2 instances | → `text-text-base font-display` |
| `text-gray-700` body paragraphs and lists | Throughout | → `text-text-secondary` |
| `text-gray-600` intro paragraph | Line 15 | → `text-text-secondary` |
| `text-primary-600 hover:text-primary-800` links | Lines 147, 204, 224, 226 | → `text-accent hover:text-accent-hover` |
| `border-gray-200` footer separator | Line 222 | → `border-border` |
| `max-w-4xl` container | Line 10 | → `max-w-content` |

### Terms (`apps/web/src/app/terms/page.tsx`)
Same pattern as privacy page — `prose prose-gray`, `gray-*` tokens throughout, `text-primary-600` links.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hero demand stats display | Custom data fetch + skeleton | Existing DemandChecker API endpoint (`/api/properties/check-demand`) or adapt stats to use a dedicated hero stats endpoint if available | Stats come from the same DB the DemandChecker uses |
| Typography hierarchy for legal pages | Custom CSS classes | Tailwind utilities (`font-display`, `text-text-base`, `text-text-secondary`) + existing token system | All tokens defined in Phase 1 |
| FAQ accordion animation | CSS transition library or framer-motion | Tailwind `overflow-hidden` + conditional `max-h` or just toggling a hidden div | No motion phase (v2 deferred) |
| Dark mode surface handling | Per-component dark: overrides | `.dark` CSS variable overrides in globals.css already handle all semantic tokens | Phase 1 already solved this |
| Prose formatting for legal pages | Reinstalling Tailwind Typography plugin | Inline Tailwind utilities — only 3 patterns: `font-display text-text-base` for headings, `text-text-secondary` for body, `text-accent` for links | Plugin is not installed and not needed given the limited typography variety |

---

## Common Pitfalls

### Pitfall 1: `max-w-site` token does not exist — use `max-w-content`
**What goes wrong:** CONTEXT.md references `max-w-site` (from DESIGN.md spec). The actual Tailwind token defined in `tailwind.config.ts` is `max-w-content` (maps to 1120px).
**Why it happens:** DESIGN.md documentation uses `max-w-site` as the conceptual name; the implemented token name is `max-w-content`.
**How to avoid:** Always use `max-w-content` in JSX. Never use `max-w-site`.
**Evidence:** `tailwind.config.ts` line 56: `maxWidth: { content: "1120px" }`.

### Pitfall 2: `text-secondary` is the amber color — not the secondary text color
**What goes wrong:** Using `text-secondary` thinking it maps to `--color-text-secondary` (gray `#6b7280`). It actually maps to `--color-secondary` (amber `#d97706`).
**Why it happens:** Tailwind token naming collision. The color token `secondary` = amber brand color. The text color token is `text-secondary` which maps to `text-text-secondary` utility class.
**How to avoid:** Use `text-text-secondary` for secondary/muted text. Never use `text-secondary` alone for body text.
**Evidence:** `tailwind.config.ts` — `secondary: "var(--color-secondary)"` (amber), `"text-secondary": "var(--color-text-secondary)"` (gray).

### Pitfall 3: `prose prose-gray` silently does nothing — but removing the div may reveal layout issues
**What goes wrong:** Since Tailwind Typography is not installed, `prose prose-gray` classes are compiled away. The legal pages' visual appearance today comes entirely from inline `text-gray-*` classes. When those inline classes are replaced with semantic tokens, appearance changes correctly. However, the `<div className="prose prose-gray max-w-none">` wrapper still affects document flow via `max-w-none` and `overflow: visible` cascade.
**How to avoid:** Replace the wrapper div with a plain `<div>` or remove it entirely. Fix all inline classes in the same commit.

### Pitfall 4: Homepage hero data fetch — homepage is a server component
**What goes wrong:** Adding a live data fetch for hero stats while keeping the file as a server component. Trying to use `useState` or `useEffect` in a server component causes a build error.
**Why it happens:** `apps/web/src/app/page.tsx` has no `"use client"` directive. It is a server component.
**How to avoid:** The hero stats can be fetched server-side using `async/await` directly in the page component, or extracted into a small `"use client"` component if interactivity is needed. For this phase, D-01 requires live stats — the simplest approach is a server-side fetch at render time with a try/catch that falls back to D-04 static copy.
**Warning signs:** TypeScript error "hooks cannot be called in server components."

### Pitfall 5: The DemandChecker stats and hero stats use different endpoints
**What goes wrong:** Assuming the `/api/properties/check-demand` endpoint used by DemandChecker returns aggregate stats (total buyers, regions active, avg budget). It does not — it returns demand for a specific address. Hero stats (D-01: active buyer count, regions with demand, avg budget) require a different endpoint.
**How to avoid:** Research whether a `/api/stats` or `/api/demand-signal` endpoint exists before planning the hero data fetch. If not, the fallback (D-04) applies and no data fetch is needed — render static copy.
**Research status:** Not yet verified — flagged as Open Question below.

### Pitfall 6: Testimonials section — strategic decision required
**What goes wrong:** Testimonials (fake quotes + star ratings + avatar initials) is a textbook AI slop pattern. But simply removing it leaves a visual gap between the Benefits section and FAQ section.
**How to avoid:** Per Claude's Discretion, the planner can remove the section entirely. The section provides no real trust signal (fake data) and violates the blacklist on multiple counts. Removing it and tightening spacing between sections is the correct call per DESIGN.md.

### Pitfall 7: `bg-primary-50`, `bg-accent-50`, `bg-accent-100`, `bg-accent-600`, `bg-accent-500` are stale color tokens
**What goes wrong:** The old Tailwind config used numeric scales (`primary-600`, `accent-500`, etc.). The new config uses semantic single-value tokens (`accent`, `accent-hover`, `accent-light`). The numeric scale tokens no longer exist and will compile to nothing (no CSS output, no error).
**Why it happens:** Phase 1 replaced the numeric scale with semantic tokens. Pages using old-config tokens silently lose their styling.
**How to avoid:** Any class using `primary-*` (except `primary` itself), `accent-*` (except `accent`, `accent-hover`, `accent-light`), must be replaced. The token mapping:
- `bg-primary-600` → `bg-accent` (for CTAs) or `bg-primary` (for dark navy)
- `text-primary-600` → `text-accent`
- `bg-accent-600` → `bg-accent`
- `bg-accent-100` → `bg-accent-light`
- `bg-accent-50` → `bg-accent-light/50` or `bg-surface-raised`
- `text-accent-600` → `text-accent`
- `text-accent-700` → `text-accent-hover`

---

## Code Examples

### Semantic Loading Skeleton
```typescript
// Source: apps/web/src/app/explore/page.tsx — Phase 3 target pattern
function BrowseLoading() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-surface-raised rounded-md animate-pulse" />
        <div className="h-4 w-96 bg-surface-raised rounded-md animate-pulse mt-2" />
      </div>
      <div className="card mb-6">
        <div className="h-10 bg-surface-raised rounded-md animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card h-32 bg-surface-raised animate-pulse" />
        ))}
      </div>
    </div>
  );
}
```

### Homepage Section Heading (left-aligned, no centering)
```typescript
// Source: DESIGN.md + CONTEXT.md D-06
<section className="py-16 bg-bg">
  <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl font-display font-bold text-text-base mb-4">
      How It Works
    </h2>
    <p className="text-lg text-text-secondary mb-10">
      A smarter way to buy and sell property in New Zealand
    </p>
  </div>
</section>
```

### How It Works — Plain Numbered Steps (D-07)
```typescript
// NO icon-in-circle, NO bg-primary-50 panel
<ol className="space-y-6">
  <li className="flex gap-4">
    <span className="flex-shrink-0 text-xl font-display font-bold text-accent w-6">1</span>
    <div>
      <p className="font-semibold text-text-base">Register Your Interest</p>
      <p className="text-sm text-text-secondary mt-1">
        Describe your ideal property — location, budget, bedrooms, features
      </p>
    </div>
  </li>
</ol>
```

### Legal Page Heading Hierarchy (D-11)
```typescript
// Source: DESIGN.md Typography section — General Sans for headings, DM Sans for body
// h1
<h1 className="text-2xl font-display font-bold text-text-base mb-8">Privacy Policy</h1>
// h2
<h2 className="text-xl font-display font-semibold text-text-base mb-4">1. Introduction</h2>
// h3
<h3 className="text-lg font-display font-medium text-text-base mb-3">Personal Information</h3>
// body
<p className="text-md text-text-secondary mb-4">...</p>
// link
<a href="..." className="text-accent hover:text-accent-hover underline">...</a>
```

### FAQ Tab Buttons (D-12)
```typescript
// DESIGN.md: rounded-sm for badges/tabs, accent for active
<button
  className={`px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wide transition-colors ${
    activeCategory === category
      ? "bg-accent text-white"
      : "bg-surface-raised text-text-secondary border border-border hover:bg-surface hover:text-text-base"
  }`}
>
```

### Auth Error State
```typescript
// DESIGN.md error token: bg-error/10 border-error/30 text-error
{error && (
  <div className="p-3 bg-error/10 border border-error/30 rounded-md text-error text-sm">
    {error}
  </div>
)}
```

---

## Open Questions

1. **Does a hero stats API endpoint exist?**
   - What we know: The API has `/api/properties/check-demand` (address-specific demand) and demand signal data in the database.
   - What's unclear: Whether there is an endpoint returning aggregate stats (total active buyer count, regions count, average budget) suitable for the hero.
   - Recommendation: The planner should probe `apps/api/src/routes/` for a stats or demand-signal summary endpoint. If none exists, D-04 fallback applies (static copy, no data fetch), avoiding any backend changes. This phase is frontend-only.

2. **Testimonials section — remove or restyle?**
   - What we know: Star ratings + fake quotes = AI slop blacklist violations. DESIGN.md explicitly forbids fake/hardcoded stats. Fake testimonials are the same category.
   - What's unclear: Whether the user wants the space filled with something else.
   - Recommendation: Per Claude's Discretion, remove the section entirely. The homepage already has a stats row and DemandChecker as trust signals. Removing the section tightens the page and eliminates slop.

3. **Pricing section treatment**
   - What we know: The pricing section (lines 377-508) has the `bg-primary-600` Pro tier card (gradient-adjacent — solid dark primary background) and hardcoded border/text tokens throughout.
   - What's unclear: Whether to keep the section and restyle, or remove it (the actual pricing is on `/upgrade`).
   - Recommendation: Keep the section — pricing on homepage is a legitimate marketing element. Restyle: Pro tier card uses `bg-accent text-white` instead of gradient `bg-primary-600`. Free and Owner tiers use `.card` with `border-2 border-border`. All `rounded-2xl` → `rounded-lg`.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is purely frontend code changes with no external tool dependencies beyond the already-running development environment.

---

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.8 (configured for `apps/api`) — no frontend test framework detected |
| Config file | No `vitest.config.*` or `jest.config.*` found in `apps/web/` |
| Quick run command | Visual inspection — no automated frontend tests |
| Full suite command | `pnpm --filter @offmarket/api test` (API tests only) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PUBL-01 | Homepage has no gradient, no SVG, left-aligned hero | manual visual | — | ❌ no web test setup |
| PUBL-02 | Explore page uses semantic tokens, max-w-content | manual visual | — | ❌ no web test setup |
| PUBL-03 | Region page uses semantic tokens, max-w-content | manual visual | — | ❌ no web test setup |
| PUBL-04 | Help/FAQ uses semantic tokens, left-aligned, DESIGN.md tabs | manual visual | — | ❌ no web test setup |
| PUBL-05 | Privacy page uses semantic tokens, no prose plugin classes | manual visual | — | ❌ no web test setup |
| PUBL-06 | Terms page uses semantic tokens, no prose plugin classes | manual visual | — | ❌ no web test setup |
| PUBL-07 | Auth page uses semantic tokens, Google button preserved | manual visual | — | ❌ no web test setup |

### Sampling Rate
- **Per task commit:** `pnpm --filter @offmarket/web build` (TypeScript compile + Next.js build confirms no broken imports)
- **Per wave merge:** Full visual inspection in browser (light mode + dark mode)
- **Phase gate:** All 7 pages visually verified in browser before `/gsd:verify-work`

### Wave 0 Gaps
No test files need to be created — this phase uses build verification (TypeScript compile errors catch token typos) and manual visual review. A broken token name like `bg-surface-raied` compiles without error but renders incorrectly — the verifier visual check catches this.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `apps/web/src/app/globals.css` — confirmed all component classes and CSS variable definitions
- Direct file inspection: `apps/web/tailwind.config.ts` — confirmed token names (`max-w-content`, `text-text-secondary`, `accent`, etc.)
- Direct file inspection: `DESIGN.md` — color values, typography scale, AI slop blacklist
- Direct file inspection: `.planning/phases/01-foundation/01-UI-SPEC.md` — token reference table

### Secondary (MEDIUM confidence)
- Direct file inspection: all 7 target page files — violations inventoried line by line from source

### Tertiary (LOW confidence)
None needed — all findings are from direct file inspection.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 3 |
|-----------|-------------------|
| DESIGN.md is single source of truth for all visual decisions | All token choices, layout decisions, and copy treatment must match DESIGN.md |
| No functionality changes | Page logic, routing, API calls, accordion behavior, auth flow must remain identical |
| Tailwind CSS only — no separate CSS files beyond globals.css | No inline `style={}` props for visual changes; all styling via utility classes |
| Responsive across sm/md/lg/xl breakpoints | All restyle work must preserve existing responsive breakpoints |
| WCAG AA contrast ratios | Semantic tokens are all WCAG AA compliant; hardcoded tokens being replaced have been audited in Phase 1 |
| Dark mode support | All replaced tokens must use semantic tokens that auto-adapt via CSS variable override in `.dark` |
| GSD workflow required | No direct repo edits outside GSD workflow unless explicitly bypassed |

---

## Metadata

**Confidence breakdown:**
- AI slop violation inventory: HIGH — verified by reading every source file line by line
- Token replacement map: HIGH — token names verified against tailwind.config.ts + globals.css
- Architecture patterns: HIGH — based on established Phase 2 patterns
- Hero stats API question: LOW — not verified; endpoint existence unknown without reading API routes

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable Tailwind/Next.js versions; token system locked in Phase 1)
