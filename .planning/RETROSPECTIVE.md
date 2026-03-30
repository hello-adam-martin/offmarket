# Retrospective

## Milestone: v1.0 — Design Overhaul

**Shipped:** 2026-03-30
**Phases:** 8 | **Plans:** 24

### What Was Built
- 18-token CSS variable design system with automatic dark mode
- General Sans + DM Sans + JetBrains Mono typography hierarchy
- Card grain texture, badge-* status system, btn-* variant system
- All 45+ pages restyled: public, buyer, owner, user, admin
- Cross-cutting audit: max-width, token compliance, font-display sweep

### What Worked
- Phase-by-phase dependency ordering (foundation first, then shared components, then pages) prevented rework
- Semantic CSS variables meant dark mode worked automatically once tokens were in place
- STATUS_LABELS badgeClass pattern established in Phase 4 and reused in Phases 5-7
- Research-before-planning caught browse component violations that individual phases missed
- Parallel executor agents (worktree isolation) cut execution time significantly

### What Was Inefficient
- Some SUMMARY.md one-liners were truncated or malformed — summary-extract didn't always produce clean data
- Phase 8 research found browse components had never been properly restyled in earlier phases — could have caught this with a mid-milestone grep check
- XCUT-06 and XCUT-07 confirmed clean by grep but still flagged as human_needed — no way to auto-verify accessibility/responsive without browser testing

### Patterns Established
- `card` utility class (bg-surface, border-border, grain texture) — used in 100+ locations
- `badge-*` classes (success, error, warning, info, neutral) for all status indicators
- `STATUS_LABELS` dictionary pattern with `badgeClass` field for status badge mapping
- `border-l-4 border-accent` for emphasized cards, `border-l-4 border-success/error` for feedback states
- `tabular-nums` on all numeric data, `font-mono` on monetary values
- `max-w-content` (1120px) on all page containers
- `font-display` on all h1/h2/h3 for General Sans

### Key Lessons
- Token replacement is mechanical but volume matters — 29 files x ~100 headings in Phase 8 typography sweep
- D-14 exception (Google OAuth button) must be documented explicitly or automated tools will "fix" it
- Plan checker caught real blocker (parallel plans writing same files) that would have caused data loss

### Cost Observations
- Model mix: orchestrator on opus, executors/verifiers on sonnet
- 8 phases completed in a single session day
- Parallel worktree execution effective for independent plans within same wave

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 8 |
| Plans | 24 |
| Files Changed | 154 |
| Lines +/- | +21,507 / -3,350 |
| Timeline | 1 day |
