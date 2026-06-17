# DesignCritique Completion — Sprint U Cycle 1 Iter 1

**Timestamp**: 2026-05-01T08:45:00+02:00
**Agent**: DesignCritique (read-only audit)
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815

---

## Audit Results

**Palette violations**: 833 (across 80+ component files; most are `var(--color-primary, #1E4D8C)` pattern with raw hex fallback; TeacherDashboard.jsx = 55 violations, worst offender with bare hex inline styles)

**Typography violations (CSS below 13px)**: 17 (10px ×3 in ChatbotOnly, 11px in EasterModal + PercorsoCapitoloView, 12px ×5 in IncrementalBuildHint + DocenteSidebar + CapitoloPicker)

**Typography violations (JSX below 13px)**: 42 (SimulatorCanvas SVG labels + TeacherDashboard inline styles)

**Touch target violations (interactive CSS elements <44px)**: 4 (ChatbotOnly tool buttons 36px, ElabTutorV4 nav 28px+36px, FloatingWindow close 32px)

**console.log count**: 4 (UpdatePrompt.jsx ×2, simulator-api.js ×1, VisionButton.jsx ×1)

**Emoji as icons**: 0 (clean — ElabIcons.jsx used correctly throughout)

---

## Lighthouse Scores

**Lighthouse home** (`https://www.elabtutor.school`): perf=43 a11y=100 seo=100 bp=92

**Lighthouse chatbot** (`https://www.elabtutor.school/#chatbot-only`): perf=43 a11y=100 seo=100 bp=92

---

## Critical Issues

1. **CRITICAL — Lighthouse perf=43 on both routes**: Root cause is eager-loading of `react-pdf` (407KB unused JS waste) and `mammoth` (70KB) on initial page load. Lazy-loading these two alone should lift score to ~65-70. Full 90+ target requires also fixing render-blocking CSS and image delivery.

2. **HIGH — 833 palette hex violations**: Most critical are TeacherDashboard.jsx (55, raw inline hex) and GalileoAdapter.jsx (29, high user-facing surface). The `var(--elab-*)` CSS system IS defined in design-system.css — the fix is adoption/migration, not new infrastructure.

3. **HIGH — Typography 10px/11px** in ChatbotOnly (10px ×3), EasterModal (11px), PercorsoCapitoloView (11px): LIM-projected at 5m, these are below threshold visibility for 8-14yr audience.

4. **MEDIUM — BP=92** (below 96 target): CSP violation flagged by Chrome DevTools inspector. Origin: Content Security Policy mismatch — needs header audit.

5. **LOW — 42 JSX sub-13px fontSize values**: Mostly in SVG labels and dashboard inline styles; systematic pass needed.

---

## Full Report

`docs/audits/sprint-u-cycle1-iter1-design-critique.md`
