# Phase 6: User App Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 06-user-app-pages
**Areas discussed:** Upgrade/pricing layout, Inquiry thread UI, Dashboard stat cards, Claim flow styling

---

## Upgrade/Pricing Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Left-aligned header, side-by-side cards | Left-align the header text per DESIGN.md. Keep 2-column card grid. Pro card gets border-accent highlight. | ✓ |
| Left-aligned header, stacked cards | Single column layout. Free tier as compact summary, Pro tier as expanded featured card below. | |
| You decide | Claude picks the best approach within DESIGN.md constraints | |

**User's choice:** Left-aligned header, side-by-side cards (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Surface-raised toggle with accent active state | bg-surface-raised container, active tab gets bg-surface + text-accent. Savings badge uses badge-success. | ✓ |
| You decide | Claude picks appropriate toggle styling | |

**User's choice:** Surface-raised toggle with accent active state (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Accent checks, muted X marks | Available: text-accent check. Unavailable: text-muted X with muted text. | ✓ |
| Success checks, muted X marks | Available: text-success (green) check. Unavailable: text-muted X with muted text. | |
| You decide | Claude picks | |

**User's choice:** Accent checks, muted X marks (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| border-accent + badge-info 'Recommended' tag | Pro card gets border-2 border-accent. Small badge-info tag at top. CTA uses btn-primary. | ✓ |
| You decide | Claude picks | |

**User's choice:** border-accent + badge-info 'Recommended' tag (Recommended)
**Notes:** None

---

## Inquiry Thread UI

| Option | Description | Selected |
|--------|-------------|----------|
| Accent own, surface-raised others | Your messages: bg-accent text-white. Other's: bg-surface-raised text-primary. Timestamps in text-muted. | ✓ |
| Surface-raised both, accent border for own | Both sides bg-surface-raised. Own messages get border-l-4 border-accent. | |
| You decide | Claude picks | |

**User's choice:** Accent own, surface-raised others (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| badge-success Accept, badge-error Decline | Accept uses badge-success styling. Decline uses badge-error. Mark Complete uses btn-secondary. | ✓ |
| btn-primary Accept, btn-secondary Decline | Accept gets full btn-primary. Decline gets btn-secondary. | |
| You decide | Claude picks | |

**User's choice:** badge-success Accept, badge-error Decline (Recommended)
**Notes:** None

---

## Dashboard Stat Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Flat card with accent left stripe | card + border-l-4 border-accent. No gradient. Progress bar uses bg-accent. | ✓ |
| Flat surface-raised card, no stripe | Plain bg-surface-raised card. | |
| You decide | Claude picks | |

**User's choice:** Flat card with accent left stripe (Recommended)
**Notes:** Removes purple gradient AI slop violation

| Option | Description | Selected |
|--------|-------------|----------|
| bg-surface border-border, hover:border-accent | Standard card interaction pattern. | ✓ |
| You decide | Claude picks | |

**User's choice:** bg-surface border-border, hover:border-accent (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| badge-info with Pro label | Uses badge-info class. Consistent with all badges. | ✓ |
| You decide | Claude picks | |

**User's choice:** badge-info with Pro label (Recommended)
**Notes:** None

---

## Claim Flow Styling

| Option | Description | Selected |
|--------|-------------|----------|
| Standard page layout with status cards | Replace gradients with bg-background. max-w-content. Status cards with border-l-4 stripes. Left-aligned. | ✓ |
| Centered card on plain background | Keep centered but remove gradients and icon-in-circle. | |
| You decide | Claude picks | |

**User's choice:** Standard page layout with status cards (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Standard site header/footer | Use shared Header + max-w-content. Consistent navigation. | ✓ |
| Keep standalone layout | Self-contained with minimal header for conversion focus. | |
| You decide | Claude picks | |

**User's choice:** Standard site header/footer (Recommended)
**Notes:** None

---

## Claude's Discretion

- Exact spacing/padding values within DESIGN.md 4px base unit
- Responsive breakpoint adjustments
- Profile, notifications, saved searches, wanted ad detail, property view page styling — follow established patterns
- Empty state patterns — reuse EmptyState component
- Back link styling on detail pages

## Deferred Ideas

None — discussion stayed within phase scope.
