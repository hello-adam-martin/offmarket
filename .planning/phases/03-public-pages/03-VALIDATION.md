---
phase: 3
slug: public-pages
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-30
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Visual inspection + grep verification (no unit test framework for CSS-only changes) |
| **Config file** | none — visual/structural verification only |
| **Quick run command** | `pnpm --filter @offmarket/web build 2>&1 | tail -5` |
| **Full suite command** | `pnpm --filter @offmarket/web build && echo "BUILD_OK"` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @offmarket/web build 2>&1 | tail -5`
- **After every plan wave:** Run full build + grep verification commands
- **Before `/gsd:verify-work`:** Full build must pass + all grep checks green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | PUBL-01 | grep | `grep -c 'bg-gradient' apps/web/src/app/page.tsx` (must be 0) | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | PUBL-01 | grep | `grep -c 'max-w-7xl' apps/web/src/app/page.tsx` (must be 0) + `grep -c 'font-display' apps/web/src/app/page.tsx` (must be > 0) + `grep -c 'gray-' apps/web/src/app/page.tsx` (must be 0) | N/A | ⬜ pending |
| 03-02-01 | 02 | 1 | PUBL-07 | grep | `grep -c 'border-gray' apps/web/src/app/auth/signin/page.tsx` (must be <= 1, Google button only) | N/A | ⬜ pending |
| 03-02-02 | 02 | 1 | PUBL-04 | grep | `grep -c 'justify-center' apps/web/src/app/help/page.tsx` (must be 0) + `grep -c 'rounded-full' apps/web/src/app/help/page.tsx` (must be 0) + `grep -c 'gray-' apps/web/src/app/help/page.tsx` (must be 0) | N/A | ⬜ pending |
| 03-03-01 | 03 | 1 | PUBL-05, PUBL-06 | grep | `grep -c 'gray-' apps/web/src/app/privacy/page.tsx` (must be 0) + `grep -c 'prose' apps/web/src/app/privacy/page.tsx` (must be 0) + `grep -c 'gray-' apps/web/src/app/terms/page.tsx` (must be 0) + `grep -c 'prose' apps/web/src/app/terms/page.tsx` (must be 0) | N/A | ⬜ pending |
| 03-03-02 | 03 | 1 | PUBL-02, PUBL-03 | grep | `grep -c 'max-w-7xl' apps/web/src/app/explore/page.tsx` (must be 0) + `grep -c 'gray-' apps/web/src/app/explore/page.tsx` (must be 0) + `grep -c 'gray-' apps/web/src/components/demand-checker.tsx` (must be 0) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — this phase is CSS/markup only. Verification is via build success + grep for banned patterns. All tasks have automated verify commands in their plan files.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode rendering | PUBL-01-07 | Visual appearance check | Toggle dark mode, verify all pages show correct surface colors |
| Left-aligned hero | PUBL-01 | Layout visual check | Open homepage, confirm hero text is left-aligned |
| Typography hierarchy | PUBL-04-06 | Font family visual check | Open legal pages, inspect heading/body fonts in DevTools |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
