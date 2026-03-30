---
phase: 4
slug: buyer-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test files exist in apps/web |
| **Config file** | None — no jest.config.*, vitest.config.*, or playwright.config.* found |
| **Quick run command** | `pnpm --filter web dev` (visual check in browser) |
| **Full suite command** | `pnpm --filter web dev` (full browser walkthrough, light + dark mode) |
| **Estimated runtime** | ~10 seconds (dev server startup) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web dev` — visual check in browser
- **After every plan wave:** Full browser walkthrough of all 3 buyer pages in light + dark mode
- **Before `/gsd:verify-work`:** All 3 pages visually match DESIGN.md in both themes
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | BUYR-01 | visual | N/A — manual-only | N/A | ⬜ pending |
| 04-02-01 | 02 | 1 | BUYR-02 | visual | N/A — manual-only | N/A | ⬜ pending |
| 04-03-01 | 03 | 1 | BUYR-03 | visual | N/A — manual-only | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — this is a visual-only restyling phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Create page renders with DESIGN.md tokens, multi-step layout, badge-info selection | BUYR-01 | Visual token substitution correctness cannot be verified by unit tests | Open /buyer/create, verify General Sans headings, teal accent, badge-info selection badges, .card sections, correct input styling in both light and dark mode |
| My Ads page renders with badge-info location tags, text-accent match count, correct status indicators | BUYR-02 | Visual verification required | Open /buyer/my-ads, verify .card pattern, tabular-nums on match counts, badge-info location tags, teal action buttons, empty state |
| Postcards page renders with badge-* status indicators, tabular-nums on numbers, bg-surface-raised info section | BUYR-03 | Visual verification required | Open /buyer/postcards, verify badge-warning/info/error/success status badges, tabular-nums on numeric data, bg-surface-raised info section |

---

## Validation Sign-Off

- [x] All tasks have manual verify or Wave 0 dependencies
- [x] Sampling continuity: visual check after every task commit
- [x] Wave 0 covers all MISSING references (none needed)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
