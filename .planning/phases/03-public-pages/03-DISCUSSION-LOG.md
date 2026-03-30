# Phase 3: Public Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 03-public-pages
**Areas discussed:** Homepage hero redesign, Homepage sections, Legal page typography, Auth page layout

---

## Homepage Hero Redesign

| Option | Description | Selected |
|--------|-------------|----------|
| Live demand stats | Lead with real numbers — active buyer count, regions with demand, avg budget. Data is the hero. Teal CTA below. Falls back to static copy if API unavailable. | ✓ |
| Value proposition text | Clean left-aligned headline describing the reverse marketplace concept. No data fetch needed. Teal CTA buttons below. | |
| Demand checker upfront | Move the DemandChecker component into the hero area so the first interaction is 'enter your address'. High engagement, but slower load. | |

**User's choice:** Live demand stats
**Notes:** None

### Hero Background

| Option | Description | Selected |
|--------|-------------|----------|
| Warm off-white | bg-surface (#fafaf7 light / #0f0f1a dark) — consistent with rest of site | ✓ |
| Subtle surface-raised | bg-surface-raised for slight contrast from page body | |
| Accent-tinted section | Very light teal tint at low opacity | |

**User's choice:** Warm off-white
**Notes:** None

### Trust Indicators

| Option | Description | Selected |
|--------|-------------|----------|
| Remove entirely | Trust indicators are generic fluff. The data-forward approach IS the trust signal. | ✓ |
| Restyle as minimal text | Keep the 3 points but strip the icon-in-circle pattern | |
| Move to footer area | Relocate trust points to just above the footer | |

**User's choice:** Remove entirely
**Notes:** None

### Fallback Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Static value prop copy | Show left-aligned headline about the reverse marketplace concept when API is down or data empty. | ✓ |
| Skeleton then static | Show loading skeleton briefly, then fall back to static copy | |
| You decide | Claude picks the most robust approach | |

**User's choice:** Static value prop copy
**Notes:** None

---

## Homepage Sections

### How It Works Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Numbered steps, left-aligned | Replace icon-in-circle cards with numbered steps (1, 2, 3) in plain text. Left-aligned. No colored bg panels. | ✓ |
| Two-column cards, restyled | Keep Buyers/Owners split but restyle cards with .card class, no icon-in-circle. | |
| You decide | Claude picks the most DESIGN.md-compliant layout | |

**User's choice:** Numbered steps, left-aligned
**Notes:** None

### Stats Row

| Option | Description | Selected |
|--------|-------------|----------|
| Keep but restyle | Numbers are good data-forward content. Restyle with tabular-nums, semantic colors, max-w-site. | ✓ |
| Merge into hero | Fold key numbers into the hero section's demand stats display | |
| Remove | Hero already has demand data. Stats row is redundant. | |

**User's choice:** Keep but restyle
**Notes:** None

### Demand Checker Section

| Option | Description | Selected |
|--------|-------------|----------|
| Keep, restyle | Key conversion tool for owners. Restyle container with DESIGN.md tokens, left-align heading, remove pill badge. | ✓ |
| Keep but simplify | Reduce to just address input and results — strip surrounding chrome | |
| You decide | Claude determines the right treatment | |

**User's choice:** Keep, restyle
**Notes:** None

### Section Alignment

| Option | Description | Selected |
|--------|-------------|----------|
| Left-align everything | All section headings left-aligned. No centered text blocks. Matches DESIGN.md industrial/utilitarian aesthetic. | ✓ |
| Mixed alignment | Section headings centered for visual rhythm, body text left-aligned. | |
| You decide | Claude picks alignment per section | |

**User's choice:** Left-align everything
**Notes:** None

---

## Legal Page Typography

### Prose Styling

| Option | Description | Selected |
|--------|-------------|----------|
| Direct DESIGN.md classes | Drop prose plugin. Use DESIGN.md semantic tokens directly — text-primary for headings, text-secondary for body. | ✓ |
| Restyled prose plugin | Keep @tailwindcss/typography but override colors via prose-custom config. | |
| You decide | Claude picks simpler approach | |

**User's choice:** Direct DESIGN.md classes
**Notes:** None

### FAQ Accordion

| Option | Description | Selected |
|--------|-------------|----------|
| Keep accordion, restyle | Good UX for FAQ. Restyle with DESIGN.md tokens: surface cards, border-border, accent expand/collapse icon. | ✓ |
| Flat list | Show all Q&A expanded by default. Simpler, better SEO. | |
| You decide | Claude picks best approach | |

**User's choice:** Keep accordion, restyle
**Notes:** None

---

## Auth Page Layout

### Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Centered card | Auth forms are a UX exception — centered single-column card is standard. Restyle with .card class and semantic tokens. | ✓ |
| Left-aligned form | Match left-align approach. Form on left, right side empty or branding. | |
| You decide | Claude picks balanced approach | |

**User's choice:** Centered card
**Notes:** Exception to the left-align-everything rule for auth pages.

### Google OAuth Button

| Option | Description | Selected |
|--------|-------------|----------|
| Google brand colors | Keep Google's branded look (white bg, Google 'G' icon). Trust signal — users expect standard appearance. | ✓ |
| DESIGN.md secondary button | Style as .btn-secondary with Google 'G' icon. More consistent but less recognizable. | |
| You decide | Claude picks balanced approach | |

**User's choice:** Google brand colors
**Notes:** None

---

## Claude's Discretion

- Homepage section ordering and vertical rhythm
- Exact demand stats to surface in hero (which API fields)
- CTA section at bottom of homepage — restyle or remove
- Testimonials section treatment
- Responsive breakpoint adjustments
- FAQ category tab styling

## Deferred Ideas

None — discussion stayed within phase scope.
