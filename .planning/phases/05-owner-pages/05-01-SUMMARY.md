---
phase: 05-owner-pages
plan: 01
subsystem: owner-pages
tags: [design-overhaul, token-swap, ai-slop-removal, owner-landing, register-form]
dependency_graph:
  requires: [phase-01-foundation, phase-02-shared-components, phase-03-public-pages]
  provides: [owner-landing-restyled, register-form-restyled]
  affects: [apps/web/src/app/owner/page.tsx, apps/web/src/app/owner/register/page.tsx]
tech_stack:
  added: []
  patterns: [semantic-token-swap, badge-info-neutral-pattern, max-w-content-container, tabular-nums-numerics]
key_files:
  created: []
  modified:
    - apps/web/src/app/owner/page.tsx
    - apps/web/src/app/owner/register/page.tsx
decisions:
  - "Hero section left-aligned (remove text-center) per D-07 AI slop removal"
  - "Benefits section: flat flex rows with plain Lucide icons, not icon-in-circle grid per D-08"
  - "CTA section: flat bg-surface-raised card, no bg-gradient-to-br per D-09"
  - "Feature badges: badge-info (active) / badge-neutral (inactive) with no rounded-full per D-17"
  - "Error state: bg-error-light border-error text-error replacing all red-* tokens per D-26"
metrics:
  duration: 117s
  completed: 2026-03-30
  tasks_completed: 2
  files_modified: 2
---

# Phase 5 Plan 1: Owner Landing Page and Register Form Summary

Owner landing page and register property form restyled to DESIGN.md: left-aligned hero, flat benefit rows (no icon-in-circle), flat CTA card (no gradient), badge-info/badge-neutral feature toggles, semantic error tokens, tabular-nums on currency displays, max-w-content containers throughout.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Restyle owner landing page (/owner) | 9666e9e | apps/web/src/app/owner/page.tsx |
| 2 | Restyle register property form (/owner/register) | a1a065d | apps/web/src/app/owner/register/page.tsx |

## Decisions Made

1. **Hero left-aligned** (D-07): Removed `text-center` from hero wrapper div, removed `mx-auto max-w-2xl` from paragraph. Added `btn-primary btn-lg` CTA link to `/owner/register` below the hero paragraph.

2. **Benefits section flattened** (D-08): Replaced 3-column centered card grid with icon-in-circle pattern with a `space-y-6` single-column layout. Each benefit is a `flex items-start gap-4` row with plain SVG icon (`w-6 h-6 text-accent flex-shrink-0 mt-0.5`) and text div. No `rounded-full bg-accent-100` wrapper divs.

3. **CTA card flat** (D-09): Replaced `bg-gradient-to-br from-accent-50 to-primary-50` with `bg-surface-raised border-border`.

4. **Feature badges** (D-17): Feature toggle buttons use `badge-info` (active) and `badge-neutral hover:opacity-80` (inactive) with base classes `px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer`. Removed `rounded-full`, `bg-primary-600`, `bg-gray-100`, `text-gray-700`.

5. **Error state tokens** (D-26): Error div replaced `p-4 bg-red-50 border border-red-200 rounded-lg text-red-700` with `p-4 bg-error-light border border-error rounded-lg text-error`.

6. **tabular-nums on currency** (D-29): Added `tabular-nums` class to the estimated value and RV display paragraphs (`text-xs text-muted mt-1 tabular-nums`).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — both pages wire to real API data and existing authenticated state. No hardcoded placeholder values in rendered UI.

## Self-Check: PASSED

Files exist:
- FOUND: apps/web/src/app/owner/page.tsx
- FOUND: apps/web/src/app/owner/register/page.tsx

Commits exist:
- FOUND: 9666e9e (Task 1 — owner landing page)
- FOUND: a1a065d (Task 2 — register property form)
