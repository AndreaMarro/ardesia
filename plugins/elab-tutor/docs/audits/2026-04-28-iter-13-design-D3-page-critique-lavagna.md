---
sprint: S
iter: 13
atom: D3 (1 of 4)
page: Lavagna (LavagnaShell)
date: 2026-04-28
author: design-opus
files_audited:
  - src/components/lavagna/LavagnaShell.jsx (1143 LOC)
  - src/components/lavagna/LavagnaShell.module.css (353 LOC)
mandate: DOC ONLY — no src/ touch
screenshot_path_placeholder: docs/specs/screenshots/lavagna-1080p-iter-14-baseline.png (DEFERRED — Playwright env not configured iter 13)
---

# D3.1 — Lavagna design critique

## §1 Page summary
LavagnaShell is the primary docente surface in LIM-front-class workflow. It composes AppHeader + lazy NewElabSimulator + FloatingToolbar + RetractablePanel (component palette left) + GalileoAdapter (UNLIM chat) + VideoFloat + ExperimentPicker + LessonReader + LessonSelector + MascotPresence + ErrorToast + dynamic Bentornati overlay. Strangler-Fig pattern wraps NewElabSimulator without modifying it.

This is the screen on which docente spends >70% of class time. Failures here cascade to all teaching outcomes.

## §2 Visual hierarchy critique (5 items)
1. **No primary call-to-action**: at 1080p LIM, eye lands on simulator canvas (correct), but FloatingToolbar (top docking) competes with AppHeader (top fixed) for top-of-screen attention. Two horizontal bands at viewport-top split focus. Recommend iter 14: merge or subordinate FloatingToolbar visually under AppHeader.
2. **Mascot positioning ambiguity**: MascotPresence component positioning rules unclear (LavagnaShell.jsx import line 17). At LIM-front-class, mascot at fixed corner draws docente eye away from circuit — should be context-bound (only appears when speaking, otherwise hide).
3. **Component palette quick-add (RetractablePanel)**: 8 components rendered in `buildQuickComponents` (LavagnaShell.jsx:45) using inline SVG icons 28×28. At 3-4m LIM distance these icons are 21mm tall — borderline readable. Labels below (see §4) at 13px FAIL.
4. **Bottom placeholder** (`.bottomPlaceholder` LavagnaShell.module.css:172-180) text 14px gray — visible only when no simulator loaded. Acceptable, but a 14px message at 3m is bordering invisible — should be 22px+ if shown to whole class.
5. **Z-index chaos potential**: Bentornati overlay z:1000, FloatingWindow chat overlay (probably 999), tooltip layers, mascot speech bubbles. Currently no explicit z-stack token discipline (design-system.css has `--z-{base,dropdown,sticky,overlay,modal,toast,max}` 1/100/200/300/400/500/9999 but no audit run on adoption). Stack overlap risk LIM = "ah, ho cliccato sotto un'altra finestra". Refactor iter 14+: enforce token usage.

## §3 Spacing + alignment issues (5 items)
1. **`.componentBtn` padding 12px 8px (line 53)** while parent `.panel` panel sets padding `0 4px 8px`. Tight: 4+8=12px between scroll-edge and button leftmost — at 3m, components feel cramped against panel boundary. Iter 14: standardize to `var(--space-3)` 12px both axes for breathing room.
2. **Button `.componentBtn:active` uses `transform: scale(0.97) translateY(0)` (line 124-126)** — visual feedback OK, but LIM tap is fingertip-precision; subtle 0.97 scale won't read at 3m. Recommend stronger feedback: scale(0.92) + brief color flash.
3. **`.bentornatiOverlay` uses `inset: 0` + `align/justify: center` (lines 202-209)** — overlay covers WHOLE screen but content centered in viewport. On 65" LIM with docente standing left: content at 32" off-axis = uncomfortable head-turn. Recommend `align-items: flex-start; padding-top: 20vh;` so content is at upper-third.
4. **Quick-add components grid not specified by `display: grid`** in LavagnaShell.module.css excerpt — likely uses default flex from RetractablePanel. Without explicit grid, alignment is content-driven (varies as labels grow). Iter 14: pin to `grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))`.
5. **`.canvas :global([class*="zoomControls"])` hidden via `display: none !important` (line 153)** — internal simulator zoom hidden because Lavagna provides its own. But if internal zoom regresses (e.g. iter 14 simulator refactor adds a new zoom selector), Lavagna won't know. Brittle coupling — Iter 14: prefer prop-based hide (`hideInternalZoom={true}`) over CSS `!important`.

## §4 Typography violations (3 items)
1. **`.showAllBtn` font-size 13px (LavagnaShell.module.css:107)** — interactive button label at 13px. CRITICAL LIM offense. Iter 14 D2 target: `var(--font-size-xs)` 14px minimum, ideally lift to `var(--font-size-sm)` 16px.
2. **Quick-add SVG `text` elements use `fontSize="5"` to `fontSize="7"` (LavagnaShell.jsx:58, 84, 87, 88, 106)** — these are SVG-internal labels (`+`/`-`/`9V` etc.), measured in user-units of 28-viewBox. Effectively ~3-4mm at 3m = invisible from 3m. They are decorative cues for close-up reads, BUT at LIM context they should disappear or scale up. Iter 14 propose: hide SVG-internal labels in `viewBox` ≤32 OR scale parent SVG up 1.5× in LIM mode.
3. **`.bottomPlaceholder` font-size 14px (line 178)** "Open Sans" hardcoded family — should be `var(--font-sans)` token. 14px text at 3m on 1080p ≈ 11mm = readable for sighted user but uncomfortable. Iter 14: lift `var(--font-size-base)` 18px.

## §5 Touch target failures with file:line refs (3 items)
1. **`.componentBtn` min-height 48px (LavagnaShell.module.css:81 baseline; 185 + 196 responsive)** — already meets regola 9 (≥44). PASSES iter 13. **However** D2 spec target `--touch-primary` 56px — iter 14 lift recommended.
2. **`.showAllBtn` min-height 44px (line 102)** — meets minimum exactly. Border 1px dashed gives illusion of smaller hit area. iter 14 lift 56px + solid border on hover.
3. **Quick-add component buttons grid not gap-enforced** — `gap` not set in `.panel` excerpt. Touch-spacing-min 8px regola 9 supplement may be violated. Iter 14: explicit `gap: var(--space-2)` 8px.

(Cross-references: `.bentornatiCloseButton` and similar dialog controls not in 350-LOC excerpt — full audit iter 14 step 5 reads remaining 300+ LOC.)

## §6 LIM-distance readability score 1-10 honest

**6.5 / 10** — average for primary surface.

Breakdown:
- Hierarchy: 7/10 (clear primary canvas focus)
- Typography: 5/10 (13px labels critical, 14px body borderline)
- Touch: 7/10 (48px baseline meets minimum)
- Spacing: 6/10 (cramped panel padding)
- Color/contrast: 8/10 (palette compliant; tokens leak partial)
- Motion/feedback: 6/10 (subtle scale active, mascot positioning ambiguous)
- LIM-mode awareness: 5/10 (no explicit LIM media query)

## §7 Top-5 actionable fixes prioritized

| # | Fix | File:line | Before | After | Effort |
|--:|-----|-----------|--------|-------|--------|
| 1 | Lift `.showAllBtn` font 13→16 LIM | LavagnaShell.module.css:107 | `font-size: 13px;` | `font-size: var(--font-size-sm);` (16) | 1 line |
| 2 | Lift `.bottomPlaceholder` font 14→18 + tokenize family | LavagnaShell.module.css:177-179 | `font-family: 'Open Sans', sans-serif; font-size: 14px;` | `font-family: var(--font-sans); font-size: var(--font-size-base);` (18) | 2 lines |
| 3 | Lift `.componentBtn` min-height 48→56 LIM-primary | LavagnaShell.module.css:81 + 185 + 196 | `min-height: 48px;` | `min-height: var(--touch-primary);` (56) | 3 lines |
| 4 | Hide internal zoom via prop instead of `!important` CSS | LavagnaShell.jsx + LavagnaShell.module.css:153 | `:global([class*="zoomControls"]) { display: none !important; }` | Pass prop `hideInternalZoom={true}` to NewElabSimulator | ~10 LOC modify across 2 files |
| 5 | Apply z-index tokens consistently | LavagnaShell.jsx (Bentornati 1000 etc.) + LavagnaShell.module.css:205 | `z-index: 1000;` | `z-index: var(--z-overlay);` (300) — adjust value per design-system.css §11 scale | ~5 LOC across overlays |

## §8 Brand alignment Affidabile/Didattico/Accogliente

- **Affidabile**: ✓ no crashes evident in shell pattern, error toast component imported (line 18). Mid-strong.
- **Didattico**: ✓ Volume picker + Lesson reader + Capitolo flow all present. Strong.
- **Accogliente**: ⚠ Bentornati overlay (warm welcome) GOOD, but mascot positioning ambiguous + 13px labels chip away accoglienza. Mid.

## §9 Sense 2 Morfismo coherence kit Omaric + volumi cartacei

- **Sense 2 PASS**: imports `VolumeViewer` (line 36) + `LessonReader` + `CapitoloPicker` — all volume-coupled.
- **Sense 2 PASS**: `buildQuickComponents` Vol1 filtering by `volumeNumber` arg (line 45) — components shown match physical kit available for that Volume.
- **Sense 2 BORDERLINE**: SVG component icons in JSX (LED, resistor, push-button, battery9v) — palette coherent (#4A7A25 lime LED, #E8941C orange button cap, #1E4D8C navy battery, #E54B3D red `+` polarity). Triplet coherence visible.
- **Sense 1.5 GAP**: no per-docente runtime adaptation visible in this 120-line excerpt — relies on auth context + classProfile import line 20. Adoption depth unverified iter 13.

## §10 Honesty caveats
1. Read 120 of 1143 LavagnaShell.jsx LOC + first 220 of 353 module.css LOC. Full critique iter 14 step 5 reads complete file.
2. Did not see Bentornati content (closure of overlay JSX), MascotPresence rendering, or RetractablePanel actual layout. Critique covers what was read.
3. No Playwright screenshot — visual regression deferred iter 14.
4. Score 6.5/10 informed by code analysis only; LIM-projection visual test would refine.
5. RetractablePanel + FloatingWindow not directly read — D3.4 covers FloatingWindow.module.css separately if assigned (not in iter 13 D3 atom scope).
6. No HTML5 semantic audit (heading levels, landmark roles) attempted iter 13 — defer iter 14.

— design-opus iter 13 D3 atom (1/4 lavagna), 2026-04-28.
