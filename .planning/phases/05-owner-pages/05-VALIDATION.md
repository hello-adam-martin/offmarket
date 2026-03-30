---
phase: 5
slug: owner-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Visual inspection + grep verification (design token compliance) |
| **Config file** | `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css` |
| **Quick run command** | `grep -rn "bg-gradient\|from-primary\|from-green\|from-accent\|rounded-full.*bg-\|text-gray-\|border-gray-\|bg-gray-\|text-red-\|text-green-\|text-blue-\|bg-green-\|bg-blue-\|bg-red-" apps/web/src/app/owner/` |
| **Full suite command** | `cd apps/web && npx next build 2>&1 \| head -50` |
| **Estimated runtime** | ~5 seconds (grep), ~30 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run quick grep command to verify no hardcoded colors remain in modified files
- **After every plan wave:** Run full build to verify no TypeScript/JSX errors
- **Before `/gsd:verify-work`:** Full build must pass + zero grep hits for banned patterns
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | OWNR-01 | grep | `grep -c "bg-gradient\|text-gray-\|rounded-full.*bg-" apps/web/src/app/owner/register/page.tsx` → 0 | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | OWNR-02 | grep | `grep -c "bg-gradient\|text-gray-\|rounded-full.*bg-" apps/web/src/app/owner/my-properties/page.tsx` → 0 | ✅ | ⬜ pending |
| 05-02-01 | 02 | 1 | OWNR-03 | grep | `grep -c "bg-gradient\|text-gray-\|text-green-\|text-red-\|border-green-" apps/web/src/app/owner/properties/\[id\]/page.tsx` → 0 | ✅ | ⬜ pending |
| 05-02-02 | 02 | 1 | OWNR-01 | grep | `grep -c "bg-gradient\|text-gray-\|rounded-full.*bg-" apps/web/src/app/owner/page.tsx` → 0 | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — grep-based token verification requires no additional tooling.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode renders correctly on all owner pages | OWNR-01, OWNR-02, OWNR-03 | Visual appearance check | Toggle dark mode, verify surfaces use `bg-surface`/`bg-surface-raised`, no white flashes |
| Responsive layout at sm/md/lg/xl breakpoints | OWNR-01 | Layout verification | Resize browser to each breakpoint, verify form sections stack properly |
| `tabular-nums` renders numeric data with aligned digits | OWNR-03 | Font feature verification | Inspect demand counts and match scores, verify digits align vertically |

---

## Validation Sign-Off

- [ ] All tasks have automated grep verify
- [ ] Sampling continuity: every task has grep verification
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
