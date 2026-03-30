---
phase: 08-cross-cutting-audit
type: validation
created: 2026-03-30
---

# Phase 8: Cross-Cutting Audit — Validation Architecture

## Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed in apps/web/ |
| Config file | None — no jest.config, vitest.config, or playwright.config |
| Quick run command | `cd apps/web && pnpm lint` |
| Full suite command | `cd apps/web && pnpm build` |

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| XCUT-01 | No max-w-7xl/max-w-6xl/max-w-5xl/max-w-[1120px] in source | Grep assertion | `grep -rn "max-w-7xl\|max-w-6xl\|max-w-5xl\|max-w-\[1120px\]" apps/web/src/ --include="*.tsx"` should return empty | grep |
| XCUT-02 | No bg-gray-*/text-gray-*/border-gray-*/bg-white outside D-14 exception | Grep assertion | `grep -rn "bg-gray-\|text-gray-\|border-gray-\|bg-white" apps/web/src/ --include="*.tsx" \| grep -v "auth/signin"` should return empty | grep |
| XCUT-03 | No primary-N or accent-N color shades | Grep assertion | `grep -rn "primary-[0-9]\|accent-[0-9]" apps/web/src/ --include="*.tsx"` should return empty | grep |
| XCUT-04 | All h1/h2/h3 have font-display | Grep assertion | `grep -rn "<h[1-3]" apps/web/src/ --include="*.tsx" \| grep -v font-display` should return empty | grep |
| XCUT-05 | No bg-gradient in tsx files | Grep assertion | `grep -rn "bg-gradient" apps/web/src/ --include="*.tsx"` should return empty | grep |
| XCUT-06 | All images have alt, no icon-only buttons without labels | Confirmed clean by research | Build passes | build |
| XCUT-07 | Admin tables use overflow-x-auto, no fixed-width blocks | Confirmed clean by research | Build passes | build |

## Sampling Rate

- **Per task commit:** `grep -rn "max-w-7xl\|bg-gray-\|primary-[0-9]\|bg-gradient" apps/web/src/ --include="*.tsx"` (fast pattern check)
- **Per wave merge:** `cd apps/web && pnpm build`
- **Phase gate:** Full build green + all grep assertions empty

## Wave 0 Gaps

None — no test framework needed. Validation is grep-based (pattern absence checks) plus the existing `pnpm build` command.
