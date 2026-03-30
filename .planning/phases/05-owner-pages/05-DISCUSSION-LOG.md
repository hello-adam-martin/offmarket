# Phase 5: Owner Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 05-owner-pages
**Areas discussed:** Demand summary panel, Match score display, Owner landing page CTA, Direct interest section

---

## Demand Summary Panel

| Option | Description | Selected |
|--------|-------------|----------|
| Flat card with accent highlight | bg-surface-raised with border-accent left border or top accent stripe. Total buyers in text-accent with tabular-nums. Direct/criteria split as inline text-secondary stats, no colored sub-cards. | ✓ |
| Standalone stat block | Keep it as a separate sidebar-like box but use bg-surface with border-border. Total buyers large text-accent, sub-stats in text-secondary. | |
| You decide | Claude picks the approach that best fits DESIGN.md industrial/utilitarian aesthetic | |

**User's choice:** Flat card with accent highlight
**Notes:** None

### Direct vs Criteria Buyer Split

| Option | Description | Selected |
|--------|-------------|----------|
| Inline stats row | "12 direct · 8 criteria" in a single text-secondary line under the total. No colored sub-boxes. | ✓ |
| Badge-style indicators | badge-success for direct count, badge-info for criteria count. Compact, uses existing badge system. | |
| You decide | Claude picks the best approach within DESIGN.md | |

**User's choice:** Inline stats row
**Notes:** None

---

## Match Score Display

### Score Styling

| Option | Description | Selected |
|--------|-------------|----------|
| Single accent color with tabular-nums | All scores in text-accent with tabular-nums and font-bold. No color-coding by threshold. | ✓ |
| Semantic color tiers | Keep tiered colors but use semantic tokens: text-success (>=75%), text-warning (>=50%), text-error (<50%). | |
| You decide | Claude picks within DESIGN.md | |

**User's choice:** Single accent color with tabular-nums
**Notes:** None

### Criteria Tags

| Option | Description | Selected |
|--------|-------------|----------|
| badge-info | Use existing badge-info class — accent-light bg, rounded-sm 4px. Consistent with badges across buyer pages. | ✓ |
| badge-neutral | Use badge-neutral for a more subdued look. | |
| You decide | Claude picks | |

**User's choice:** badge-info
**Notes:** None

---

## Owner Landing Page CTA

| Option | Description | Selected |
|--------|-------------|----------|
| Left-align hero, remove icon circles | Left-aligned hero text (like homepage Phase 3). Benefits: remove icon-in-circle, use left-aligned rows. CTA: flat bg-surface-raised, no gradient. | ✓ |
| Keep layout but swap tokens | Keep centered hero and benefit grid but remove gradients, swap to semantic tokens. Icon circles remain. | |
| You decide | Claude removes AI slop per DESIGN.md blacklist, picks best approach | |

**User's choice:** Left-align hero, remove icon circles
**Notes:** None

---

## Direct Interest Section

### Section Styling

| Option | Description | Selected |
|--------|-------------|----------|
| Accent-bordered card, no gradient | .card with border-accent left stripe. No gradient, no icon-in-circle. Contact btn-primary. Match items bg-surface. | ✓ |
| Success-themed card | border-success and bg-success-light. Contact button btn-primary. Match items on bg-surface. | |
| You decide | Claude picks the approach that fits DESIGN.md | |

**User's choice:** Accent-bordered card, no gradient
**Notes:** None

### Contact Button

| Option | Description | Selected |
|--------|-------------|----------|
| btn-primary | Standard teal primary button. Contact is the key action. | ✓ |
| btn-secondary | Outlined secondary button. Less visual weight. | |
| You decide | Claude picks | |

**User's choice:** btn-primary
**Notes:** None

---

## Claude's Discretion

- Exact spacing/padding within cards (DESIGN.md 4px base unit)
- Responsive breakpoint adjustments for register form grids
- Property image thumbnail styling
- Back link styling on property detail
- Error state styling (map to error tokens)
- Empty state patterns (reuse Phase 2 EmptyState)

## Deferred Ideas

None — discussion stayed within phase scope.
