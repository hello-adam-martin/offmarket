---
phase: 2
slug: shared-components
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No automated test suite for web frontend |
| **Config file** | None in `apps/web/` |
| **Quick run command** | `pnpm --filter @offmarket/web build` |
| **Full suite command** | `pnpm --filter @offmarket/web lint && pnpm --filter @offmarket/web build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @offmarket/web build`
- **After every plan wave:** Run `pnpm --filter @offmarket/web lint && pnpm --filter @offmarket/web build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | COMP-01 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | COMP-02 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-01-03 | 01 | 1 | COMP-03 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-02-01 | 02 | 1 | COMP-04 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-02-02 | 02 | 1 | COMP-05 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-03-01 | 03 | 1 | COMP-06 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-03-02 | 03 | 1 | COMP-07 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-03-03 | 03 | 1 | COMP-08 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-04-01 | 04 | 2 | COMP-09 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-04-02 | 04 | 2 | COMP-10 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-04-03 | 04 | 2 | COMP-11 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-04-04 | 04 | 2 | COMP-12 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-04-05 | 04 | 2 | COMP-13 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 02-04-06 | 04 | 2 | COMP-14 | manual + compile | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — TypeScript compilation is the automated gate, visual browser verification covers all COMP requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Header teal logo, 1120px max-width | COMP-01 | Visual styling | Inspect header in light+dark, verify max-w-site |
| Footer semantic surface tokens | COMP-02 | Visual styling | Check footer bg in light+dark mode |
| Dark mode toggle cycles correctly | COMP-03 | Interactive behavior | Click toggle, verify html class changes |
| Modal surface colors and buttons | COMP-04 | Visual styling | Open each modal, check in light+dark |
| Form input teal focus ring | COMP-05 | Interactive state | Tab through form inputs, verify focus |
| Button variant distinction | COMP-06 | Visual styling | View all button types side by side |
| Card surface bg, radius, grain | COMP-07 | Visual styling | Inspect card elements with DevTools |
| Badge 4px radius, correct colors | COMP-08 | Visual styling | Visual inspection |
| EmptyState no AI slop | COMP-09 | Anti-pattern check | Navigate to empty states, verify no gradients/emoji |
| Filter panels semantic tokens | COMP-10 | Visual styling | Open /explore with filters |
| DemandCardGrid .card class | COMP-11 | Visual styling | Visual + grep for .card usage |
| NZRegionMap teal fills | COMP-12 | SVG styling | Inspect map in light+dark mode |
| AddressAutocomplete dropdown | COMP-13 | Interactive styling | Focus autocomplete, type address |
| PropertyImageUpload drop zone | COMP-14 | Visual styling | Navigate to property registration |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
