# Phase 4: Buyer Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 04-buyer-pages
**Areas discussed:** Form layout approach, Status badges & indicators, Success & empty states

---

## Form Layout Approach

### Form Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Keep multi-card sections | Current pattern: separate .card sections for Location, Budget, Basic Info, Property Requirements. Just restyle with DESIGN.md tokens. | ✓ |
| Collapse to single card | One large card with section dividers. More compact but less scannable. | |
| You decide | Claude picks based on DESIGN.md patterns. | |

**User's choice:** Keep multi-card sections (Recommended)
**Notes:** Clean, scannable, already works. Just needs token replacement.

### Target Type Selector

| Option | Description | Selected |
|--------|-------------|----------|
| Keep selection cards | Two side-by-side bordered cards with icon + title + description. Restyle with DESIGN.md tokens. | ✓ |
| Tab/toggle switch | Horizontal tab bar or toggle. More compact, less visual weight. | |
| You decide | Claude picks approach. | |

**User's choice:** Keep selection cards (Recommended)
**Notes:** Familiar pattern, just needs token swap.

### Property Type & Feature Badges

| Option | Description | Selected |
|--------|-------------|----------|
| DESIGN.md badge-info style | Selected badges use badge-info (accent-light bg, 4px radius). Unselected use badge-neutral. | ✓ |
| Keep pill shape with token swap | Keep rounded-full shape, swap to semantic colors. | |
| You decide | Claude picks based on DESIGN.md badge spec. | |

**User's choice:** DESIGN.md badge-info style (Recommended)
**Notes:** Replaces current rounded-full pills and primary-600 bg.

### Location Tags

| Option | Description | Selected |
|--------|-------------|----------|
| Badge-info tokens | Use badge-info styling (accent-light bg, rounded-sm/4px) for location tags. | ✓ |
| Keep rounded-full with token swap | Keep pill shape to visually distinguish from property type badges. | |
| You decide | Claude's discretion on shape distinction. | |

**User's choice:** Badge-info tokens (Recommended)
**Notes:** Consistent with property type badge treatment.

---

## Status Badges & Indicators

### Postcard Status Badges

| Option | Description | Selected |
|--------|-------------|----------|
| Semantic badge variants | PENDING→warning, APPROVED→info, REJECTED/FAILED→error, SENT/DELIVERED→success. All 4px radius. | ✓ |
| Neutral badges with color dots | All badges neutral bg with small colored dot indicator. | |
| You decide | Claude picks mapping. | |

**User's choice:** Semantic badge variants (Recommended)
**Notes:** Maps directly to DESIGN.md semantic color system.

### Match Count & Specific Indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current layout with token swap | Large number in text-accent with tabular-nums. Specific address: accent-light circle. | ✓ |
| Inline badges instead | Match count as inline badge. More compact but less data-forward. | |
| You decide | Claude picks approach. | |

**User's choice:** Keep current layout with token swap (Recommended)
**Notes:** Data-forward approach consistent with DESIGN.md.

### Postcard Allowance Display

| Option | Description | Selected |
|--------|-------------|----------|
| Badge-info with semantic tokens | Badge-info for 'N free left', text-secondary for usage line, tabular-nums on numbers. | ✓ |
| Progress bar | Visual progress bar showing usage. More visual but adds new component. | |
| You decide | Claude picks. | |

**User's choice:** Badge-info with semantic tokens (Recommended)
**Notes:** Consistent with existing badge patterns.

---

## Success & Empty States

### Post-Creation Success State

| Option | Description | Selected |
|--------|-------------|----------|
| Clean success with token swap | Keep layout, swap to success tokens, replace gradient CTA box with flat surface-raised card. | ✓ |
| Minimal success | Remove checkmark circle. Simple text + CTA. More utilitarian. | |
| You decide | Claude picks. | |

**User's choice:** Clean success with token swap (Recommended)
**Notes:** Gradient removal is key — no gradients per DESIGN.md.

### Empty States

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse EmptyState component pattern | Follow Phase 2 convention (COMP-09). Icon-in-circle acceptable in functional empty states. Token swap. | ✓ |
| Strip icon circles entirely | Text-only empty states with CTA. More austere. | |
| You decide | Claude picks. | |

**User's choice:** Reuse EmptyState component pattern (Recommended)
**Notes:** Icon-in-circle in empty states is not AI slop — blacklist targets hero/feature sections.

### Info Section (Postcards)

| Option | Description | Selected |
|--------|-------------|----------|
| Surface card with semantic tokens | Swap to bg-surface-raised, text-primary, text-secondary. Keep numbered list. | ✓ |
| Remove it | Info is self-evident. Less clutter. | |
| You decide | Claude picks. | |

**User's choice:** Surface card with semantic tokens (Recommended)
**Notes:** Clean, informational, keeps helpful context for users.

---

## Claude's Discretion

- Exact spacing/padding values within cards (4px base unit)
- Responsive breakpoint adjustments for create form grids
- Usage summary bar styling in create page
- Error state styling mapping to semantic error tokens
- Delete button styling on My Ads cards

## Deferred Ideas

None — discussion stayed within phase scope.
