# /assets/home-compile/ — Swarm 4 Visual Polish + Morfismo

Owned by Swarm 4 (`style/swarm-4-home-compile-polish-morfismo-2026-05-29`).
Consumed via background-image URLs in
`src/styles/home-compile-polish.css` classes:

| File | Class | Morfismo source |
|------|-------|-----------------|
| `illustration-compile-idle.svg` | `.hcPolishIllustrationCompileIdle` | Blockly puzzle block (Vol1 pwm/blink) + C++ braces |
| `illustration-compile-success.svg` | `.hcPolishIllustrationCompileSuccess` | Nano R4 silhouette + Vol1 Lime checkmark |
| `illustration-upload-ready.svg` | `.hcPolishIllustrationUploadReady` | USB-C cable + Nano R4 in Vol3 Red palette |

## Why custom SVG and not Lottie / stock icons

`.impeccable.md` mandates Morfismo Sense 2: software must be
"morphic to" the kit Omaric + the printed volumi cartacei. Stock
SaaS illustrations and generic Material Design icons violate the
anti-pattern checklist (10/10 REJECT if violated).

- Palette derived from `src/styles/design-system.css`:
  Navy `#1E4D8C`, Lime `#4A7A25`, Orange `#E8941C`, Red `#E54B3D`.
- Iconography stylizes the Arduino Nano R4 board (kit Omaric) +
  Blockly block + C++ braces (the two editor modes in the
  HomeCompile route).
- No Lottie JSON — no new npm dep (`CLAUDE.md` immutable rule 13).
- Pure inline SVG so the polish CSS can fade them in via
  `animation: hcPolishSpeechIn ...` without binary asset bloat.

## File-size budget

Each SVG < 5 KB. Total directory < 15 KB. Well under the
"no new asset > 200 KB" task brief constraint.

## Forced-colors mode

Polish CSS sets `background-image: none` and falls back to a
dashed `CanvasText` border. SVG `viewBox` proportions keep slot
sizing predictable in High Contrast.
