---
phase: 7
slug: admin-pages
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-30
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No frontend test framework (visual token replacement phase) |
| **Config file** | None — build check validates TypeScript correctness |
| **Quick run command** | `pnpm --filter web build` |
| **Full suite command** | `pnpm --filter web build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web build`
- **After every plan wave:** Run `pnpm --filter web build`
- **Before `/gsd:verify-work`:** Full build must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-* | 01 | 1 | ADMN-01, ADMN-02, ADMN-03, ADMN-04 | Build check | `pnpm --filter web build` | N/A | ⬜ pending |
| 07-02-* | 02 | 1 | ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09 | Build check | `pnpm --filter web build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework install needed — `pnpm --filter web build` validates TypeScript compilation and catches broken imports from token replacement.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stat cards render uniform .card styling, no rainbow colors | ADMN-01 | Visual appearance not testable via build | Inspect admin dashboard — all stat cards should have identical card styling with one accent-bordered card |
| Financial tables show tabular-nums and right-aligned monetary values | ADMN-05, ADMN-06 | CSS class application is visual | Inspect billing tables — dollar amounts should use monospace font, right-aligned |
| Status badges use correct semantic colors | ADMN-05, ADMN-06 | Badge color mapping is visual | Verify: ACTIVE=green, CANCELED=gray, PAST_DUE=red, TRIALING=teal, PENDING=amber, HELD=teal, RELEASED=green, REFUNDED=gray, EXPIRED=red |
| Dark mode renders correctly across all admin pages | All ADMN-* | Dark mode requires visual verification | Toggle dark mode — verify bg-surface, bg-primary header, sidebar colors invert correctly |

---

## Validation Sign-Off

- [x] All tasks have automated verify (build check)
- [x] Sampling continuity: build check after every commit
- [x] Wave 0 covers all MISSING references (none missing)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-30
