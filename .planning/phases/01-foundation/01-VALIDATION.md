---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (config/CSS phase — build-time TypeScript is the gate) |
| **Config file** | None |
| **Quick run command** | `pnpm --filter @offmarket/web build` |
| **Full suite command** | `pnpm --filter @offmarket/web build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @offmarket/web build`
- **After every plan wave:** Run `pnpm --filter @offmarket/web build` + manual visual inspection
- **Before `/gsd:verify-work`:** Full build must pass + manual verification of 5 success criteria
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUN-06 | build | `pnpm --filter @offmarket/web build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUN-10 | build | `pnpm --filter @offmarket/web build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUN-02, FOUN-04, FOUN-05 | build | `pnpm --filter @offmarket/web build` | N/A (config) | ⬜ pending |
| 01-03-01 | 03 | 2 | FOUN-01, FOUN-11 | build | `pnpm --filter @offmarket/web build` | N/A (CSS) | ⬜ pending |
| 01-03-02 | 03 | 2 | FOUN-13, FOUN-14, FOUN-15 | build | `pnpm --filter @offmarket/web build` | N/A (CSS) | ⬜ pending |
| 01-04-01 | 04 | 2 | FOUN-06, FOUN-07, FOUN-08, FOUN-09 | build | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 01-04-02 | 04 | 2 | FOUN-12 | build | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |
| 01-05-01 | 05 | 2 | FOUN-10 | build | `pnpm --filter @offmarket/web build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/app/fonts/` directory created
- [ ] `GeneralSans-Variable.woff2` downloaded and placed in fonts directory
- [ ] `pnpm --filter @offmarket/web add next-themes` executed

*These are prerequisites — not test stubs. Phase 1 has no test files.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| General Sans renders in headlines | FOUN-06 | Font rendering requires visual inspection | Open any page, inspect `<h1>` — computed font-family should show "General Sans" |
| DM Sans renders in body | FOUN-07 | Font rendering requires visual inspection | Open any page, inspect `<p>` — computed font-family should show "DM Sans" |
| Dark mode surface colors | FOUN-11 | Theme toggle requires browser interaction | Add `.dark` to `<html>`, verify `--color-bg` computes to `#0f0f1a` in DevTools |
| Accent teal on buttons/links | FOUN-01 | Visual verification of color propagation | Open any page, inspect `.btn-primary` — background should compute to `#0d9488` |
| Grain texture visible | FOUN-15 | Subtle visual effect requires inspection | Inspect `.card` element — `::before` pseudo-element should show grain SVG |
| tabular-nums on tables | FOUN-14 | Requires numeric data to visually verify | Inspect any `<table>` — computed `font-variant-numeric` should be `tabular-nums` |
| No flash-of-wrong-theme | FOUN-12 | Requires full page load observation | Hard refresh with dark theme set — page should not flash white then dark |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
