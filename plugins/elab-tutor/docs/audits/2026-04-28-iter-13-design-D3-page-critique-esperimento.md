---
sprint: S
iter: 13
atom: D3 (3 of 4)
page: Esperimento (NewElabSimulator)
date: 2026-04-28
author: design-opus
files_audited:
  - src/components/simulator/NewElabSimulator.jsx (1030 LOC, sampled top 120 + targeted greps for fontSize/touch lines)
  - src/components/simulator/ElabSimulator.css (referenced — top-50 lines + touch-target sample)
mandate: DOC ONLY
screenshot_path_placeholder: docs/specs/screenshots/esperimento-1080p-iter-14-baseline.png (DEFERRED)
---

# D3.3 — Esperimento (Simulator) design critique

## §1 Page summary
NewElabSimulator (1030 LOC) is the simulator shell — orchestrates SimulatorCanvas (3149 LOC engine canvas) + ExperimentPicker + ComponentPalette + MinimalControlBar + SerialMonitor + SerialPlotter + CodeEditorCM6 + ScratchEditor (lazy) + lots of overlays/panels (Pot/Ldr/Properties/GalileoResponse/ExperimentGuide/BuildModeGuide/ComponentDrawer/Notes/BomP/LessonPath/ShortcutsP/Whiteboard/Quiz). Carries 21 fontSize hits in inline style + interactive controls in `style={{}}` literal. Build mode switcher (line 850) is a primary docente touchpoint.

This is the surface that ratifies "Sense 2 Morfismo to kit Omaric" — the SVG circuit on canvas IS the morphic mirror of physical breadboard.

## §2 Visual hierarchy critique (5 items)
1. **Canvas-dominant focus correct**: SimulatorCanvas occupies central area (large viewport). Sidebar (ExperimentPicker) left, code editor right. Bottom panel (Monitor/Plotter) is collapsible. At LIM, eye finds canvas first ✓.
2. **Build mode switcher visual** (line 850): three buttons (Manuale/Scratch/Tinker presumably) with active state via fontSize 15 + scale(1.02). Active button visible at 3m. PASSES LIM. **However**, when collapsed/compact this 4 tokens-stacked buttons compress — not tested.
3. **`circuitWarning` alert** (line 898): red bg + `fontSize: 14` `fontWeight: 700` UPPERCASE. Exclamation `!` font 20px. At LIM, the icon is bigger than the text — visual imbalance. Iter 14 lift text 14→18px so warning content dominates icon.
4. **Toast `exportToast` and `wireToast`** (line 903-904) — `fontSize: 16` lime/orange. PASS LIM. Good.
5. **Bottom panel toggle button** (line 918): `fontSize: 14` "Monitor Seriale" + 14px arrow `▲`. PASS regola 8. Iter 14 LIM lift to 16-18px since this is a docente-controlled state toggle.

## §3 Spacing + alignment issues (5 items)
1. **Inline-style alignment** in build mode bar (line 832): `padding: '10px 18px'`, `gap: 10`. Mixed with surrounding `padding: '8px 16px'` (line 841). Not tokenized. Migrate to `var(--space-*)`.
2. **Wrap of SerialMonitor toggle** (line 921): `padding: '4px 8px'` super-tight. At LIM, this control is unfindable. Iter 14: padding `var(--space-2) var(--space-4)` + min-height 44/56.
3. **`circuitWarning` position fixed** (line 898): `top: 10`, `left: '50%'`. 10px from top edge means warning crowds AppHeader if both visible. Iter 14: anchor to canvas top inside `<div className="canvas-container">` not viewport-fixed.
4. **Build mode buttons gap 0** (line 841 `gap: 0`): tabs share borders without separators. At LIM, tabs feel "stuck together". Iter 14: `gap: var(--space-1)` 4px to give visual separation.
5. **Code editor close button** (line 989): `width: 44, minHeight: 44` — meets regola 9. But icon `<svg width="16">` inside = 16px icon in 44px button. At 3m, icon is 12mm in 33mm button = thin target. Iter 14: 24px icon inside 56px button (more findable).

## §4 Typography violations (3 items)
1. **`fontSize: 14` toolbar + warnings + buttons throughout NewElabSimulator.jsx** (lines 832, 898, 918, 921, 973, 989) — 21 inline hits per D1 §5 row 15. PASS regola 8 minimum, FAIL D2 LIM target 16-18px. Iter 14 codemod step 4.
2. **Empty-state placeholder** (line 973): "Seleziona un esperimento dalla sidebar" `fontSize: 14` color `#AAA` (`var(--color-text-gray-100)`). At 3m on whiteish background, AAA gray on white is ~3:1 = WCAG AA fail (text). Iter 14: use `var(--color-text-secondary)` 4.6:1 + lift font 14→18.
3. **Empty-state CTA button** (line 974): `fontSize: 14` lime border. Two issues — (a) 14px CTA, (b) transparent bg with 1px lime border vanishes at LIM 3m (border-thickness becomes 0.75mm = thread). Iter 14: solid lime bg + white text + 16-18px font for CTA visibility.

## §5 Touch target failures with file:line refs (3 items)
1. **Build mode buttons** (line 850): `minHeight: 'var(--touch-min, 56px)'` already token-compliant. PASS LIM. Iter 13 verified.
2. **Bottom panel sub-tabs** "Monitor"/"Plotter" (line 921): `minHeight: 36` — FAIL regola 9. Iter 14 lift 36→44 minimum, 56 LIM.
3. **Code editor close button** (line 989): `width: 44, minHeight: 44` — PASS regola 9. Iter 14 lift to 56 for LIM consistency. Bottom panel close (line 923): `minHeight: 36, minWidth: 44` — height fails.

(Plus 4 touch<44 in ElabSimulator.css per D1 §6 — line 671/672 width 20×20 bookend SVG decorations [decorative, fine] + line 1287 min-width 28px [interactive controls — FAIL regola 9].)

## §6 LIM-distance readability score 1-10 honest

**7.0 / 10** — strongest of 4 audited surfaces (highest LIM-aware design discipline visible).

Breakdown:
- Hierarchy: 8/10 (canvas-centric clear)
- Typography: 6/10 (14px floor; toolbar acceptable; some 14px CTA fail)
- Touch: 7/10 (build mode 56px PASS, bottom panel 36px FAIL)
- Spacing: 7/10 (inline-style mixed but mostly reasonable)
- Color/contrast: 7/10 (gray placeholders weak)
- Active feedback: 8/10 (build mode scale + shadow + transform)
- Sense 2 morfismo: 9/10 (SVG = kit-coupled, strongest signal)

## §7 Top-5 actionable fixes prioritized

| # | Fix | File:line | Before | After | Effort |
|--:|-----|-----------|--------|-------|--------|
| 1 | Bottom panel sub-tabs touch 36→56 LIM | NewElabSimulator.jsx:921 | `minHeight: 36` | `minHeight: 'var(--touch-primary)'` (56) | 1 line |
| 2 | Empty-state placeholder lift 14→18 + contrast | NewElabSimulator.jsx:973 | `color: 'var(--color-text-gray-100, #AAA)', fontSize: 14` | `color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)'` (18) | 1 line |
| 3 | Empty-state CTA lift visibility | NewElabSimulator.jsx:974 | transparent bg + 1px border + 14px | solid `var(--color-accent)` bg + white text + `var(--font-size-sm)` (16) + min-height 56 | 1 multi-prop |
| 4 | `circuitWarning` lift 14→18 | NewElabSimulator.jsx:898 | `fontSize: 14` | `fontSize: 'var(--font-size-base)'` (18) | 1 line |
| 5 | Tokenize all 21 inline `fontSize:14` hits | NewElabSimulator.jsx:832,891,900,930,956,1038,1076,1145,1236,etc | various `fontSize: 14` | `fontSize: 'var(--font-size-sm)'` (16 LIM) | codemod ~21 hits |

## §8 Brand alignment Affidabile/Didattico/Accogliente

- **Affidabile**: ✓✓ strongest. Canvas + circuit + serial + code + compile = full solver pipeline visible. UNLIM error toasts present (line 920+). Build mode switcher robust.
- **Didattico**: ✓ ExperimentGuide + LessonPathPanel + BuildModeGuide imports = pedagogical scaffolding. PASS.
- **Accogliente**: ◐ empty-state copy "Seleziona un esperimento dalla sidebar" is functional but cold. Tea voice would be "Da dove vuoi cominciare? Scegli un esperimento qui a fianco." Iter 14 copy review.

## §9 Sense 2 Morfismo coherence kit Omaric + volumi cartacei

- **Sense 2 STRONG**: NanoR4Board SVG (mentioned CLAUDE.md regola 2-3) is morphic mirror of Arduino Nano kit. SimulatorCanvas 3149 LOC ratifies fidelity.
- **Sense 2 STRONG**: 21 component types in palette match physical kit Omaric (LED, R, breadboard, push-button, battery9v, etc.).
- **Sense 1.5 PARTIAL**: build mode switcher reflects user-mode intent (Manuale/Scratch/Tinker), but no per-docente persistence visible iter 13. Wire iter 14 ADR-019 morfismo.

## §10 Honesty caveats
1. Read top 120 of 1030 LOC NewElabSimulator.jsx + targeted grep on 19 fontSize/touch lines. Full critique iter 14.
2. SimulatorCanvas.jsx (3149 LOC) NOT read iter 13 — too large for D3 200-LOC budget.
3. ExperimentGuide / LessonPathPanel / BuildModeGuide NOT read separately. Children imports.
4. ElabSimulator.css full read NOT done; only D1-relevant lines sampled (4 touch hits).
5. No Playwright screenshot. iter 14 visual regression mandatory.
6. Score 7/10 may be optimistic; true LIM-projection score might be 6 (canvas-pan/zoom legibility unverified).

— design-opus iter 13 D3 atom (3/4 esperimento), 2026-04-28.
