---
status: partial
phase: 01-foundation
source: [01-VERIFICATION.md]
started: 2026-03-30T00:00:00Z
updated: 2026-03-30T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Font rendering — General Sans headlines, DM Sans body
expected: Any heading element shows General Sans font-family; body copy shows DM Sans — not Inter or system fallback. Verify via DevTools Computed tab.
result: [pending]

### 2. DM Sans italic glyphs loaded from Google Fonts
expected: On a page with italic text (e.g. wanted/[id]), italic DM Sans renders true italic glyphs from Google Fonts CDN, not browser-synthesized slant. Verify via DevTools Network tab for italic font file request.
result: [pending]

### 3. Dark mode CSS variable switch
expected: Adding class 'dark' to <html> in DevTools changes body background to rgb(15,15,26) and card surfaces to rgb(26,26,46).
result: [pending]

### 4. Warm off-white background in light mode
expected: Body background computes to rgb(250,250,247) — warm off-white, not pure white rgb(255,255,255).
result: [pending]

### 5. Card grain texture on .card elements
expected: Inspect any .card ::before pseudo-element — grain SVG texture visible with opacity 0.035.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
