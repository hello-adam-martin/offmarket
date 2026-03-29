# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 01-foundation
**Areas discussed:** Font loading strategy, CSS variable naming, Dark mode toggle scope, Grain texture approach, Tailwind config migration, globals.css component classes, Spacing token aliases, Layout max-width, Atomicity strategy, Border-radius scale, Inter removal approach, next-themes config

---

## Font File Location

| Option | Description | Selected |
|--------|-------------|----------|
| src/app/fonts/ (Recommended) | Next.js convention for next/font/local — co-located with layout.tsx | ✓ |
| public/fonts/ | Accessible via URL, standard web convention but bypasses Next.js font optimization | |
| You decide | Claude picks best approach | |

**User's choice:** src/app/fonts/ (Recommended)
**Notes:** None

---

## Font Acquisition

| Option | Description | Selected |
|--------|-------------|----------|
| Manual download prerequisite | Document as prerequisite, developer downloads from Fontshare | |
| Script in package.json | Automated download script | |
| You decide | Claude picks simplest reliable approach | ✓ |

**User's choice:** You decide
**Notes:** Claude's discretion

---

## CSS Variable Naming

| Option | Description | Selected |
|--------|-------------|----------|
| 1:1 with DESIGN.md (Recommended) | CSS vars match DESIGN.md exactly, Tailwind references directly | ✓ |
| Expanded with shade variants | Add intermediate shades beyond DESIGN.md names | |
| You decide | Claude determines granularity | |

**User's choice:** 1:1 with DESIGN.md (Recommended)
**Notes:** None

---

## Dark Mode Toggle Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Provider only (Recommended) | ThemeProvider + dark CSS vars + suppressHydrationWarning. Toggle in Phase 2 | ✓ |
| Provider + basic toggle | Include minimal toggle button in Header now | |
| You decide | Claude picks cleanest for testing | |

**User's choice:** Provider only (Recommended)
**Notes:** None

---

## Grain Texture Approach

| Option | Description | Selected |
|--------|-------------|----------|
| CSS-only SVG noise (Recommended) | Inline SVG filter using feTurbulence. Zero file size, works in both modes | ✓ |
| Static PNG tile | Small repeating PNG texture. Classic approach, needs dark variant | |
| You decide | Claude picks lightest-weight approach | |

**User's choice:** CSS-only SVG noise (Recommended)
**Notes:** None

---

## Tailwind Config Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Remove entirely (Recommended) | Delete old primary/accent scales. Pages show wrong colors until restyled | ✓ |
| Alias old names to new values | Map primary-600 to accent (teal). Temporary compat code | |
| Keep both, deprecate old | Add new tokens alongside old scales. Doubles config | |

**User's choice:** Remove entirely (Recommended)
**Notes:** Clean break, wrong colors on unstyled pages is expected

---

## globals.css Component Classes

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite in Phase 1 (Recommended) | FOUN-13 requires this. Update all classes to new tokens | ✓ |
| Minimal update only | Fix only what's broken by config change | |
| You decide | Claude determines scope based on FOUN-13 | |

**User's choice:** Rewrite in Phase 1 (Recommended)
**Notes:** Per FOUN-13 requirement

---

## Spacing Token Aliases

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind defaults only (Recommended) | p-2=8px, p-4=16px etc. Only add 2xs (2px) as p-0.5 | ✓ |
| Add named aliases | spacing-2xs, spacing-xs etc. in config | |
| You decide | Claude picks based on minimal config bloat | |

**User's choice:** Tailwind defaults only (Recommended)
**Notes:** None

---

## Layout Max-Width

| Option | Description | Selected |
|--------|-------------|----------|
| Define in Phase 1 (Recommended) | Add max-w-site: 1120px to config. Foundation token for all phases | ✓ |
| Defer to Phase 8 | XCUT-01 assigned to Phase 8. Each phase applies manually | |
| You decide | Claude determines if token or audit item | |

**User's choice:** Define in Phase 1 (Recommended)
**Notes:** None

---

## Atomicity Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| One PR, multiple commits (Recommended) | Each logical unit gets own commit. PR merges as one unit | ✓ |
| Truly one commit | Squash everything. Simpler history but harder to review | |
| You decide | Claude balances history with reviewability | |

**User's choice:** One PR, multiple commits (Recommended)
**Notes:** None

---

## Border-Radius Scale

| Option | Description | Selected |
|--------|-------------|----------|
| Override Tailwind defaults (Recommended) | rounded-sm=4px, rounded-md=8px, rounded-lg=12px. Clean mapping | ✓ |
| Custom token names | rounded-design-sm etc. alongside defaults. Two competing scales | |
| You decide | Claude picks minimal disruption | |

**User's choice:** Override Tailwind defaults (Recommended)
**Notes:** None

---

## Inter Removal

| Option | Description | Selected |
|--------|-------------|----------|
| Swap in layout.tsx only (Recommended) | Replace import, apply DM Sans body class. Inter only in layout.tsx | ✓ |
| Full audit first | Grep codebase for Inter references before removing | |
| You decide | Claude determines if audit needed | |

**User's choice:** Swap in layout.tsx only (Recommended)
**Notes:** None

---

## next-themes Config

| Option | Description | Selected |
|--------|-------------|----------|
| You decide (Recommended) | Claude picks standard config: attribute='class', defaultTheme='system', storageKey='offmarket-theme' | ✓ |
| Default to light | Force light mode default regardless of OS preference | |
| Default to system | Respect OS dark/light preference from first visit | |

**User's choice:** You decide (Recommended)
**Notes:** Claude's discretion

---

## Claude's Discretion

- Font acquisition method (manual prerequisite vs automated script)
- next-themes configuration (attribute, defaultTheme, storageKey)

## Deferred Ideas

None — discussion stayed within phase scope.
