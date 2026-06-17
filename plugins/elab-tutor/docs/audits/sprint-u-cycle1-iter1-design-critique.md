# Design Critique — Sprint U Cycle 1 Iter 1

**Date**: 2026-05-01  
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815  
**Auditor**: DesignCritique agent (read-only scan)

---

## Summary

| Check | Count | Target | Status |
|---|---|---|---|
| Palette hardcoded hex violations | 833 | 0 | ❌ |
| Typography CSS <13px violations | 17 | 0 | ⚠️ |
| Typography JSX <13px violations | 42 | 0 | ❌ |
| Touch target <44px (interactive CSS) | 4 | 0 | ⚠️ |
| console.log/warn/error remaining | 4 | 0 | ⚠️ |
| Emoji as icons (non-Andrea-OK) | 0 | 0 | ✅ |

---

## Lighthouse Scores

| Route | Perf | A11y | SEO | BP | Status |
|---|---|---|---|---|---|
| Homepage `/` | 43 | 100 | 100 | 92 | ❌ perf / ⚠️ BP |
| `#chatbot-only` | 43 | 100 | 100 | 92 | ❌ perf / ⚠️ BP |

**Target**: perf ≥90, a11y ≥95, SEO ≥100, BP ≥96

**A11y 100 and SEO 100 are excellent.** Performance 43 is the critical blocker. Both routes score identically — the perf issue is in the shared JS bundle, not route-specific code.

### Lighthouse Perf Root Causes (Homepage)

| Audit | Score | Finding |
|---|---|---|
| First Contentful Paint | 0% | Very slow initial paint |
| Largest Contentful Paint | 0% | Critical bottleneck |
| Time to Interactive | 17% | 407KB unused JS on initial load |
| Total Blocking Time | 58% | Long tasks blocking main thread |
| Speed Index | 8% | Slow visual progression |
| Unused JavaScript | 0% | `react-pdf` 407KB, `mammoth` 70KB, `supabase` 41KB loaded eagerly |
| Render-blocking | 50% | CSS fonts + index CSS blocking paint |
| Image delivery | 50% | Images not optimized |
| Image aspect ratio | 0% | Images displayed with wrong ratio |
| Inspector issues | 0% | CSP violation logged |

**Root cause**: `react-pdf` (407KB waste) and `mammoth` (70KB waste) are loaded eagerly on the homepage/chatbot route. These are VolumeViewer dependencies that should be lazy-loaded on demand.

---

## Top 10 Palette Violations (by file)

The CSS variable system (`var(--elab-navy)`) IS defined in `src/styles/design-system.css`. The violation is widespread use of raw hex fallback values embedded in components instead of relying on the vars alone.

**Note**: Many violations are in `var(--color-primary, #1E4D8C)` pattern — technically using vars but with hardcoded hex fallback. These are partial compliance: they work with theming but should use `var(--elab-navy)` without fallback.

| # | File | Violations | Type |
|---|---|---|---|
| 1 | `src/components/teacher/TeacherDashboard.jsx` | 55 | JSX inline styles raw hex |
| 2 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 33 | SVG fill/stroke raw hex in fallback |
| 3 | `src/components/simulator/ElabSimulator.css` | 31 | CSS raw hex with var() fallback |
| 4 | `src/components/lavagna/GalileoAdapter.jsx` | 29 | JSX inline styles raw hex |
| 5 | `src/components/teacher/TeacherDashboard.module.css` | 28 | CSS module raw hex |
| 6 | `src/components/simulator/panels/LessonPathPanel.jsx` | 20 | JSX inline styles raw hex |
| 7 | `src/components/simulator/panels/ScratchEditor.jsx` | 19 | JSX inline styles raw hex |
| 8 | `src/components/unlim/UnlimReport.jsx` | 17 | JSX inline styles raw hex |
| 9 | `src/components/lavagna/VideoFloat.module.css` | 16 | CSS module raw hex |
| 10 | `src/components/VetrinaSimulatore.module.css` | 16 | CSS module raw hex |

**Total across all files**: 833 occurrences in ~80+ files.

**Pattern analysis**:
- Most violations use `var(--color-primary, #1E4D8C)` pattern (partial compliance — has var but with raw fallback)
- TeacherDashboard.jsx uses raw hex directly in inline style objects (worst violator, no var() wrapper)
- SimulatorCanvas.jsx uses raw hex in SVG attributes (`stroke="#4A7A25"`)

---

## Top 5 Typography Issues

All violations are CSS files with `font-size` below the 13px minimum floor.

| # | File | Line | Value | Context |
|---|---|---|---|---|
| 1 | `src/components/chatbot/ChatbotOnly.module.css` | 135, 199, 438 | 10px (×3) | Timestamp / badge labels in chatbot sidebar |
| 2 | `src/components/chatbot/ChatbotOnly.module.css` | 185 | 11px | Secondary label in session list |
| 3 | `src/components/easter/EasterModal.module.css` | 175 | 11px | Sub-caption in Easter modal |
| 4 | `src/components/lavagna/PercorsoCapitoloView.module.css` | 169 | 11px | Step indicator label |
| 5 | `src/components/simulator/IncrementalBuildHint.module.css` | 28, 45, 51, 75, 87 | 12px (×5) | Hint text in simulator build hints |

**Additional violations**:
- `src/components/lavagna/DocenteSidebar.module.css:30` — 12px secondary label
- `src/components/lavagna/CapitoloPicker.module.css:113,129` — 12px chapter sub-labels
- `src/components/lavagna/PercorsoCapitoloView.module.css:52,216,272` — 12px step labels

**JSX inline violations (42 total)**: Most are in `SimulatorCanvas.jsx` SVG label attributes and `TeacherDashboard.jsx` inline style objects using sub-13px values for secondary data points.

**Critical for 8–14 year audience**: 10px text on a LIM projected 5m away is essentially invisible. Minimum 13px should be treated as 14px for this use case.

---

## Touch Target Analysis

Only 4 confirmed interactive element CSS violations found (buttons/controls below 44px):

| File | Line | Value | Element context |
|---|---|---|---|
| `src/components/chatbot/ChatbotOnly.module.css` | 245 | `height: 36px` | Tool action buttons in chatbot palette |
| `src/components/tutor/ElabTutorV4.css` | 97 | `height: 36px` | Tab button |
| `src/components/tutor/ElabTutorV4.css` | 423 | `height: 28px` | Navigation control |
| `src/components/common/FloatingWindow.module.css` | 135 | `height: 32px` | Mobile floating window close button |

**Positive**: The grep for interactive-specific height violations found only 4 cases — better than prior audit claims of 103 violations. Many items flagged in prior audits (e.g., `height: 12px` on dividers/rules) are non-interactive decorative elements.

---

## Console.log Remaining

Only **4 occurrences** — significantly better than previous audit snapshots. The codebase is nearly clean.

| File | Type |
|---|---|
| `src/components/common/UpdatePrompt.jsx` (×2) | console.log |
| `src/services/simulator-api.js` (×1) | console.warn |
| `src/components/tutor/VisionButton.jsx` (×1) | console.log |

---

## Emoji as Icons

**0 violations** — no emoji used as functional icons outside approved locations. `ElabIcons.jsx` is used correctly throughout. The `HomePage.jsx` emoji (🧠📚⚡🐒) in the feature cards is Andrea-approved and excluded.

`src/components/auth/DataDeletion.jsx:112` uses `&#9888;` (Unicode warning sign) as a decorative icon — marginal case, not an emoji per se, but could be replaced with `ElabIcons`.

---

## Recommendations (prioritized for Cycle 3)

### P0 — Performance (blocks LIM usability)

1. **Lazy-load react-pdf** — 407KB waste on homepage. `VolumeViewer` component should use React lazy + Suspense. This alone should lift Perf score from 43 → ~65-70.
   - File: `src/components/lavagna/VolumeViewer.jsx` (or wherever react-pdf is imported)
   - Action: `const VolumeViewer = React.lazy(() => import('./VolumeViewer'))`

2. **Lazy-load mammoth** — 70KB waste. Mammoth (DOCX parser) should be loaded on demand.
   - Similar lazy-import pattern as above.

3. **Image delivery optimization** — Lighthouse flags images without proper `width`/`height` attributes causing layout shift. Add explicit dimensions or use `aspect-ratio` CSS.

4. **Fix image aspect ratio** — Some images rendered with wrong ratio (0% audit). Check `<img>` tags without `width`/`height` in HomePage and simulator.

### P1 — Typography (LIM readability critical for 8-14 yr audience)

5. **Eliminate 10px and 11px font sizes** — These are invisible at LIM projection distance.
   - `ChatbotOnly.module.css` (10px × 3) — raise timestamp labels to 12px minimum
   - `EasterModal.module.css:175` (11px) — raise to 12px
   - `PercorsoCapitoloView.module.css:169` (11px) — raise to 13px

6. **Raise 12px labels to 13px** — All instances in `DocenteSidebar`, `CapitoloPicker`, `PercorsoCapitoloView`, `IncrementalBuildHint` should target 13px minimum (secondary) or 14px (primary body).

### P2 — Palette (technical debt, theming risk)

7. **Migrate TeacherDashboard.jsx** (55 violations) from raw hex inline styles to CSS Modules with `var(--elab-*)` variables. This is the single highest-impact file for palette compliance.

8. **Remove hex fallbacks from `var()` calls** — `var(--color-primary, #1E4D8C)` should become `var(--elab-navy)` (CSS vars already defined in design-system.css). The fallback hex is no longer needed and causes theme override failures.

9. **GalileoAdapter.jsx** (29 violations) — Second highest JSX violator, high user-facing priority since it's the main UNLIM chat surface.

### P3 — Minor cleanup

10. **Remove 4 console.log calls** — `UpdatePrompt.jsx` (2), `simulator-api.js` (1), `VisionButton.jsx` (1). Low effort, clean up before Sprint U close.

11. **Fix 4 touch target violations** — Raise `ChatbotOnly` tool buttons to 44px height (currently 36px). LIM touch at 5m distance requires generous targets.

12. **Replace `&#9888;` in DataDeletion.jsx** with an ElabIcons SVG icon for consistency.

---

## CSS Variable System Status

The `--elab-*` variable system IS properly defined in `src/styles/design-system.css` (lines 311–329). The problem is adoption: most components were written before or parallel to the design system and use raw hex or `var(--color-*, #hex)` patterns. The fix is systematic migration, not defining new vars.

**Good news**: `src/components/HomePage.jsx` uses a `PALETTE` object that wraps `var(--elab-navy, #1E4D8C)` — this is the recommended pattern for JSX inline styles when CSS Modules are not used.

---

*Audit generated by DesignCritique agent — Sprint U Cycle 1 Iter 1 — 2026-05-01*
