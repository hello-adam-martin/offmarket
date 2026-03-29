---
phase: 02-shared-components
plan: 02
subsystem: web/components/modals
tags: [modals, design-system, semantic-tokens, tailwind, dark-mode]
dependency_graph:
  requires: [02-01]
  provides: [COMP-04, COMP-05]
  affects: [ContactBuyerModal, PaymentModal, UpgradeModal, PostcardRequestModal, SaveSearchModal]
tech_stack:
  added: []
  patterns: [modal-panel-sm, modal-panel-lg, modal-backdrop, semantic-tokens, .input, .label, .btn-primary, .btn-ghost]
key_files:
  created: []
  modified:
    - apps/web/src/components/ContactBuyerModal.tsx
    - apps/web/src/components/PaymentModal.tsx
    - apps/web/src/components/UpgradeModal.tsx
    - apps/web/src/components/PostcardRequestModal.tsx
    - apps/web/src/components/browse/SaveSearchModal.tsx
decisions:
  - All 5 modals use modal-panel-sm/lg shell classes from globals.css — no inline panel sizing remains
  - Icon-in-colored-circle pattern removed from ContactBuyerModal, UpgradeModal, SaveSearchModal
  - PostcardRequestModal retains Headless UI Dialog/Transition — styling updated within that structure
metrics:
  duration: "~8 minutes"
  completed: "2026-03-29"
  tasks: 2
  files: 5
---

# Phase 02 Plan 02: Modal Restyling Summary

All 5 modal components restyled to use DESIGN.md semantic tokens and modal shell CSS classes — `modal-panel-sm/lg`, `modal-backdrop`, `.input`, `.label`, `.btn-primary`.

## What Was Built

Restyled 5 modal components using the modal shell CSS classes established in Plan 01 (globals.css). Large-panel modals (ContactBuyerModal, PaymentModal) use `modal-panel-lg`; small-panel modals (UpgradeModal, PostcardRequestModal, SaveSearchModal) use `modal-panel-sm`. All hardcoded Tailwind color classes replaced with semantic design tokens.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Restyle ContactBuyerModal and PaymentModal (large panel) | 99062d7 | ContactBuyerModal.tsx, PaymentModal.tsx |
| 2 | Restyle UpgradeModal, PostcardRequestModal, SaveSearchModal (small panel) | efe142d | UpgradeModal.tsx, PostcardRequestModal.tsx, SaveSearchModal.tsx |

## Decisions Made

- **PostcardRequestModal retains Headless UI Dialog/Transition** — The animation/transition structure was kept intact; only className values inside the Dialog.Panel were updated. `modal-panel-sm` applied to `Dialog.Panel` directly.
- **Icon-in-colored-circle removed from 3 modals** — ContactBuyerModal (lock icon in no-access branch), UpgradeModal (lightning icon), SaveSearchModal (bookmark icon) — all replaced with inline icons or removed per AI slop blacklist.
- **PaymentModal backdrop clickability** — The original modal used nested `z-50 overflow-y-auto` + flex layout. Simplified to `modal-backdrop` with a clickable absolute overlay layer (consistent with other modals).
- **CTA copy updated per UI-SPEC copywriting contract** — "Upgrade to Pro", "Save search", "Send postcard request" (lowercase, no exclamation marks).

## Deviations from Plan

### Auto-fixed Issues

None. Plan executed exactly as written.

### Out-of-Scope Notes

- `text-primary-600` on Stripe payment color variable left as-is (it's a JS value `"#4f46e5"`, not a Tailwind class — outside the CSS token replacement scope).

## Known Stubs

None. All modal forms remain wired to existing API endpoints. No data is stubbed.

## Self-Check: PASSED

Files exist:
- apps/web/src/components/ContactBuyerModal.tsx — FOUND
- apps/web/src/components/PaymentModal.tsx — FOUND
- apps/web/src/components/UpgradeModal.tsx — FOUND
- apps/web/src/components/PostcardRequestModal.tsx — FOUND
- apps/web/src/components/browse/SaveSearchModal.tsx — FOUND

Commits:
- 99062d7 — FOUND (feat(02-02): restyle ContactBuyerModal and PaymentModal)
- efe142d — FOUND (feat(02-02): restyle UpgradeModal, PostcardRequestModal, and SaveSearchModal)

Build: pnpm --filter @offmarket/web build — PASSED
