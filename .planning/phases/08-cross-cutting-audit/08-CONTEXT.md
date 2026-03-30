---
phase: 08-cross-cutting-audit
type: context
created: 2026-03-30
---

# Phase 8: Cross-Cutting Audit — Context

## Goal

Every page passes the complete DESIGN.md compliance checklist — max-width, dark mode, accent, typography, AI slop blacklist, accessibility, and responsiveness all verified across the full site.

## Scope

This is the final audit phase. All 7 prior phases restyled individual page groups. Phase 8 sweeps the entire codebase for cross-cutting compliance issues that individual phases may have missed or that span multiple pages.

## Requirements

- **XCUT-01**: All pages use max-width 1120px content container (not 1280px)
- **XCUT-02**: All pages support dark mode with correct surface colors
- **XCUT-03**: All interactive elements use teal accent (#0d9488) with hover (#0f766e)
- **XCUT-04**: All text uses correct DESIGN.md hierarchy (General Sans for h1-h3, DM Sans for body)
- **XCUT-05**: No AI slop blacklist violations remain in any page
- **XCUT-06**: All pages pass WCAG AA contrast ratios in both light and dark mode
- **XCUT-07**: All pages responsive across sm/md/lg/xl breakpoints

## Success Criteria

1. Every page uses a 1120px max-width content container — no page bleeds to 1280px
2. Every page in dark mode shows correct surface colors with no gray-* hardcoded classes
3. No page contains any AI slop blacklist violation
4. Every page passes WCAG AA contrast ratios in both light and dark mode
5. Every page renders correctly at sm/md/lg/xl breakpoints

## Approach

Automated grep/scan of all page files and components for:
- Hardcoded `max-w-7xl` (1280px) instead of `max-w-content` (1120px)
- Remaining `bg-gray-*`, `text-gray-*`, `border-gray-*`, `bg-white` hardcoded tokens
- AI slop patterns: purple gradients, blob SVGs, icon-in-circle cards, centered hero text, generic copy
- Missing `font-display` on headings, missing `tabular-nums` on numeric data
- Accent color hardcoded instead of using CSS variables

Fix any violations found. Build must pass after all fixes.
