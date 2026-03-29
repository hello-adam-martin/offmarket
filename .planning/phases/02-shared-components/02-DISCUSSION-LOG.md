# Phase 2: Shared Components - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 02-shared-components
**Areas discussed:** Component extraction, Header redesign, Modal consistency, NZ Region Map colors

---

## Component Extraction

### Shared primitives approach

| Option | Description | Selected |
|--------|-------------|----------|
| CSS classes only | Keep globals.css classes, apply via className | ✓ |
| React components | Create Button.tsx, Input.tsx, Badge.tsx, Card.tsx with props | |
| You decide | Claude picks | |

**User's choice:** CSS classes only
**Notes:** Matches existing codebase pattern, less abstraction

### Button variants

| Option | Description | Selected |
|--------|-------------|----------|
| 4 variants | primary, secondary, ghost, destructive | ✓ |
| 3 variants | primary, secondary, destructive only | |
| You decide | Claude audits existing buttons | |

**User's choice:** 4 variants
**Notes:** Covers all existing button uses across the app

### Button sizes

| Option | Description | Selected |
|--------|-------------|----------|
| 3 sizes | sm (36px), md (40px), lg (48px) | ✓ |
| Single size | One button size everywhere | |

**User's choice:** 3 sizes

---

## Header Redesign

### Dark mode toggle placement

| Option | Description | Selected |
|--------|-------------|----------|
| Right of nav, before auth | Sun/moon icon, always visible | ✓ |
| Inside mobile menu only | Toggle only in hamburger menu | |
| You decide | Claude picks best placement | |

**User's choice:** Right of nav, before auth

### Logo treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Text in accent teal | 'OffMarket' in teal, 'NZ' in text-primary | ✓ |
| Custom logo/icon | Add icon before text | |
| You decide | Claude picks based on DESIGN.md | |

**User's choice:** Text in accent teal

### Header border style

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle border | border-b border-border semantic token | ✓ |
| Shadow instead | shadow-sm for softer edge | |
| No separator | Remove border entirely | |

**User's choice:** Subtle border

---

## Modal Consistency

### Modal shell approach

| Option | Description | Selected |
|--------|-------------|----------|
| Shared CSS pattern | .modal-backdrop and .modal-panel classes | ✓ |
| Shared Modal component | Modal.tsx wrapper with children | |
| Stay independent | Each modal keeps own styling | |

**User's choice:** Shared CSS pattern

### Modal width strategy

| Option | Description | Selected |
|--------|-------------|----------|
| 2 sizes | .modal-panel-sm (448px), .modal-panel-lg (576px) | ��� |
| Single size | One max-width for all | |
| You decide | Claude picks per modal | |

**User's choice:** 2 sizes

---

## NZ Region Map Colors

### Color integration

| Option | Description | Selected |
|--------|-------------|----------|
| Teal accent system | accent-light hover, accent selected | ✓ |
| Neutral with accent highlights | Gray default, teal only on interaction | |
| You decide | Claude evaluates | |

**User's choice:** Teal accent system

### Data visualization

| Option | Description | Selected |
|--------|-------------|----------|
| Heat-map shading | Deeper teal for higher demand | ✓ |
| Interactive only | All regions same color | |
| You decide | Claude evaluates data flow | |

**User's choice:** Heat-map shading

---

## Claude's Discretion

Mobile menu styling, notification badge, EmptyState treatment, FilterPanel layout, form field spacing, close buttons, backdrop opacity, AddressAutocomplete dropdown, PropertyImageUpload drop zone, badge variants, footer layout.

## Deferred Ideas

None — discussion stayed within phase scope.
