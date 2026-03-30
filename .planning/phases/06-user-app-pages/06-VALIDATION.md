---
phase: 6
slug: user-app-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No frontend test framework — visual UI restyling phase |
| **Config file** | N/A |
| **Quick run command** | `pnpm dev` + visual page inspection |
| **Full suite command** | `pnpm --filter @offmarket/api test` (API tests, not relevant to UI) |
| **Estimated runtime** | ~5 seconds (dev server hot reload) |

---

## Sampling Rate

- **After every task commit:** `pnpm dev` + visual page check in browser
- **After every plan wave:** Full page review in both light and dark mode
- **Before `/gsd:verify-work`:** All 10+ pages visually compliant
- **Max feedback latency:** 5 seconds (HMR)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | USER-01 | manual | Visual: dashboard stat cards tabular-nums, surface colors | N/A | ⬜ pending |
| 06-01-02 | 01 | 1 | USER-02 | manual | Visual: profile .input/.card classes | N/A | ⬜ pending |
| 06-02-01 | 02 | 1 | USER-03 | manual | Visual: inquiry list badge-* status labels | N/A | ⬜ pending |
| 06-02-02 | 02 | 1 | USER-04 | manual | Visual: message bubbles accent/surface-raised | N/A | ⬜ pending |
| 06-03-01 | 03 | 2 | USER-05 | manual | Visual: wanted ad detail — no icon-in-circle | N/A | ⬜ pending |
| 06-03-02 | 03 | 2 | USER-06 | manual | Visual: property view — correct tokens | N/A | ⬜ pending |
| 06-04-01 | 04 | 2 | USER-07 | manual | Visual: saved searches — rounded-sm badges | N/A | ⬜ pending |
| 06-04-02 | 04 | 2 | USER-08 | manual | Visual: notifications — no icon-in-circle | N/A | ⬜ pending |
| 06-05-01 | 05 | 3 | USER-09 | manual | Visual: upgrade page left-aligned, DESIGN.md cards | N/A | ⬜ pending |
| 06-05-02 | 05 | 3 | USER-10 | manual | Visual: claim page standard Header/Footer, no gradients | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — this is a visual restyling phase validated by browser inspection.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard stat cards use tabular-nums | USER-01 | CSS visual property | Inspect number elements in DevTools, verify `font-variant-numeric: tabular-nums` |
| Dark mode correct on all pages | USER-01–10 | Theme toggle visual | Toggle dark mode, verify surface colors match DESIGN.md |
| No AI slop patterns remain | USER-01, USER-09, USER-10 | Pattern recognition | Check for gradient backgrounds, icon-in-circle, centered hero text |
| Inquiry message bubbles correct | USER-04 | Visual layout | Send test message, verify own=accent, other=surface-raised |
| Claim page uses standard Header/Footer | USER-10 | Layout structure | Navigate to claim page, verify site-wide header renders |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Sampling continuity: visual check after every task commit
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s (HMR)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
