# Milestones

## v1.0 Design Overhaul (Shipped: 2026-03-30)

**Phases completed:** 8 phases, 24 plans, 30 tasks

**Key accomplishments:**

- Tailwind token config rewritten with 18 semantic CSS-variable-mapped color tokens, 7-stop typography scale, and custom radius/spacing; General Sans variable font self-hosted; ThemeProvider + globals.css CSS variables establish full DESIGN.md design system contract
- globals.css rewritten with 18-token CSS variable system (light + dark), grain texture on .card, Inter removed, three DESIGN.md fonts wired to html element, ThemeProvider connected in providers.tsx
- DM Sans italic variant now loaded from Google Fonts via style: ["normal", "italic"] parameter
- FilterPanel.tsx:
- One-liner:
- AddressAutocomplete and PropertyImageUpload restyled with semantic tokens — teal-accent dropdown, dashed-border drop zone with surface-raised background and accent hover states
- One-liner:
- Auth and help/FAQ pages restyled with semantic design tokens — tabs use rounded-sm DESIGN.md style, accordion uses badge-info/success/neutral, error state uses bg-error-light pattern.
- Explore page (`explore/page.tsx`):
- My-ads listing and postcards pages restyled with badge-info location tags, text-accent tabular-nums match counts, STATUS_LABELS badgeClass refactor, and max-w-content containers — zero hardcoded color classes remain
- dashboard/page.tsx:
- One-liner:
- Layout:
- layout.tsx:
- Subscriptions page (ADMN-05):
- One-liner:
- 1. [Rule 1 - Bug] admin/email-templates/[name]/page.tsx had 2 missing headings, not 1

---
