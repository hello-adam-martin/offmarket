# Phase 7: Admin Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 07-admin-pages
**Areas discussed:** Admin layout shell, Stat card color system, Financial data tables, Status badge mapping

---

## Admin Layout Shell

| Option | Description | Selected |
|--------|-------------|----------|
| Keep distinct admin chrome | Restyle existing dark header + sidebar with DESIGN.md tokens. Admin stays visually separate. | ✓ |
| Use site Header/Footer | Remove admin chrome, wrap in site-wide Header/Footer with sub-nav. | |

**User's choice:** Keep distinct admin chrome
**Notes:** None

### Sidebar Dark Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar inverts to bg-surface | Light: bg-white. Dark: bg-surface (#1a1a2e). Active nav uses bg-accent-light/text-accent. | ✓ |
| Sidebar stays dark always | Both modes: bg-primary (#0f0f1a). Dark-on-dark aesthetic. | |
| You decide | Claude picks based on DESIGN.md patterns. | |

**User's choice:** Sidebar inverts to bg-surface
**Notes:** None

### Postcards Nav Link

| Option | Description | Selected |
|--------|-------------|----------|
| Add Postcards to nav | Add as 5th nav item. Currently /admin/postcards exists but isn't in nav. | ✓ |
| Keep current 4 items | Leave Postcards discoverable only by URL. | |
| You decide | Claude adds if it makes sense. | |

**User's choice:** Add Postcards to nav
**Notes:** None

---

## Stat Card Color System

| Option | Description | Selected |
|--------|-------------|----------|
| Uniform neutral with accent | All cards use .card class. Numbers in text-primary tabular-nums. One highlighted card gets border-l-4 border-accent. | ✓ |
| Semantic color accents | Keep differentiated but map to DESIGN.md semantic palette only (max 3 colors). | |
| You decide | Claude picks matching DESIGN.md aesthetic. | |

**User's choice:** Uniform neutral with accent
**Notes:** None

---

## Financial Data Tables

### Table Style

| Option | Description | Selected |
|--------|-------------|----------|
| Clean minimal tables | No stripes. Subtle border-border dividers. Hover: bg-surface-raised. Header: text-muted uppercase tracking-wide text-xs. | ✓ |
| Striped rows | Alternating bg-surface / bg-surface-raised rows. Same header treatment. | |
| You decide | Claude picks based on DESIGN.md patterns. | |

**User's choice:** Clean minimal tables
**Notes:** None

### Money Format

| Option | Description | Selected |
|--------|-------------|----------|
| $299.00 — always show cents | Fintech standard. All monetary values 2 decimal places, tabular-nums font-mono, right-aligned. | ✓ |
| $299 — whole dollars only | Cleaner for round numbers. Only show cents when fractional. | |
| You decide | Claude picks the approach. | |

**User's choice:** $299.00 — always show cents
**Notes:** None

---

## Status Badge Mapping

### Escrow Statuses

| Option | Description | Selected |
|--------|-------------|----------|
| Semantic mapping | PENDING=warning, HELD=info, RELEASED=success, REFUNDED=neutral, EXPIRED=error | ✓ |
| Conservative mapping | PENDING=warning, HELD=warning, RELEASED=success, REFUNDED=info, EXPIRED=neutral | |
| You decide | Claude picks semantically correct colors. | |

**User's choice:** Semantic mapping
**Notes:** HELD as info (teal) because held money is actively being managed. EXPIRED as error because it represents a failed outcome.

### Subscription Statuses

| Option | Description | Selected |
|--------|-------------|----------|
| Semantic mapping | ACTIVE=success, CANCELED=neutral, PAST_DUE=error, TRIALING=info | ✓ |
| You decide | Claude picks based on financial semantics. | |

**User's choice:** Semantic mapping
**Notes:** None

---

## Claude's Discretion

- Exact spacing/padding within tables and cards
- Responsive breakpoint adjustments
- Email template editor form layout
- Postcards admin table/card layout
- Action button placement in table rows
- Filter/search bar styling
- Empty state patterns
- Billing settings form section styling

## Deferred Ideas

None — discussion stayed within phase scope.
