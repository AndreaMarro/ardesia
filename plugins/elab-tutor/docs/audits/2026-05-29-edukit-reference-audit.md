# Edukits.co Code Kit — Reference Audit for HomeCompileLayoutV2

**Date**: 2026-05-29
**Swarm**: 2 (UI/UX redesign)
**Author**: Claude (Swarm 2 sub-agent: content-marketing:search-specialist role)
**Andrea reference verbatim**: "rendi ui e ux homecompile bellissima moltissimo simile al sito edukit"
**Real target site**: `https://edukits.co/code` (Code Kit drag-and-drop Arduino app, EduKits International Pty Ltd, Australia)
**Note**: domain `edukit.co` (no `s`) is parked/for-sale; the canonical reference is `edukits.co/code`, the WordPress-plugin SPA. Andrea memory note `blockly-editor-inspiration.md` confirms `edukits.co/code` is the "suprema fonte di ispirazione" for ELAB Blockly/IDE.

## 1. Source artifacts inspected

| Artifact | URL / location |
|---|---|
| Lander HTML | `https://edukits.co/code` (preloader + Vite-style React SPA bundle) |
| Main CSS bundle | `https://edukits.co/wp-content/plugins/code-kit/app/assets/index-BB22FFVA.css` |
| Theme color meta | `<meta name="theme-color" content="#9A35FF">` (purple primary) |
| Page title | `Code Kit - Drag-and-Drop Coding for Arduino` |

Static CSS bundle, page metadata, font manifest, and Andrea stored notes from prior live use. Live runtime screenshot not feasible from curl-only environment.

## 2. Layout grid

- left toolbox column locked 230px (`--max-toolbox-width:230px;`)
- workspace fills remaining horizontal space (no fixed right rail)
- output panel mounts as overlay/modal — matches `[data-dialog-overlay]` + `[data-dialog-content]` with `backdrop-filter:blur(2px)`

## 3. Palette (extracted)

### Themes (data-theme attribute):
| Theme | --c-primary | --bg-main | --bg-workspace |
|---|---|---|---|
| dark (default) | #9A35FF purple | #260245 | gradient #1c007b -> #5c0593 |
| light | #9A35FF purple | #FFFFFF | #FFFFFF |
| magma | #FF8935 orange | #331010 | gradient #4d2700 -> #20002a |
| edukits (brand) | #34B7FA cyan | #FFFFFF | #FFFFFF |

### Alpha steps on primary:
- `--c-primary-20: 33` (20%), `-30: 4D` (30%), `-50: 80`, `-70: B3`, `-90: E6`

### Text scale (alpha on bg)
- 12-step alpha pattern: `--text-main`, `--text-90 ... --text-5`. Light mode uses black with alphas, dark mode uses white with alphas. Same Radix-UI / Vercel approach.

### Gray scale
- `--gray1` `#fcfcfc` -> `--gray12` `#171717` (Radix gray parity)

### Status colors
- success `#16a34a`, error `#e60000`, info `#0973dc`, warning amber

## 4. Typography

- `--font-body: "Inter", sans-serif`
- `--font-display: "Konnected", sans-serif` (custom WOFF2 semibold)
- `--font-mono: "JetBrains Mono", monospace`
- body 15px line-height 1.5
- h2 25px, h3 20px
- buttons in Konnected semibold 600

## 5. Button styling

```css
.cdk-button {
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.18), inset 0 0 0 1px var(--text-30);
  background-color: var(--bg-main);
  border-radius: 6px;
  padding: .5em 1em;
  font-family: Konnected;
  font-weight: 600;
}
.cdk-button:hover:not(:disabled) {
  box-shadow:
    0 1px 3px 0 rgba(0,0,0,0.25),
    inset 0 0 0 1px var(--text-30),
    inset 0 0 0 50px var(--text-10);  /* 10% darken */
}
.cdk-button.primary { background-color: var(--c-primary); color: #fff; }
```

Vocabulary: hairline shadow + ambient + inset darken on hover. No FAB, no gradient, no scale transform. Vercel/Linear minimal button.

## 6. Border radius scale

Single coherent radius `--g-border-radius: 6px`. Modal at `calc(2 * --g-border-radius) = 12px`. Drastic simplification vs ELAB's 6 / 10 / 14 / 20 / 24 / 9999.

## 7. Form inputs

3px-tinted-alpha focus outline:
```css
input:focus { border-color: var(--c-primary); outline: 3px solid var(--c-primary-30); outline-offset: 0; }
```

## 8. Output panel modal

```css
[data-dialog-content] {
  border-radius: 12px;
  background: var(--bg-workspace);
  max-width: 450px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.18);
}
[data-dialog-overlay] { backdrop-filter: blur(2px); background: rgba(0,0,0,.5); }
```

Glass-lite (2px blur).

## 9. Animation timing

CSS bundle uses `.25s opacity` preloader fade. Hover transitions are implicit via `box-shadow` change with no explicit timing — snaps. No "lift on hover", no 300ms ease-in-out. Good for ELAB LIM projector latency.

## 10. Mascot

EduKits "K" logomark with glow filter only. No runtime mascotte. ELAB adds UNLIM mascot — improvement over baseline.

## 11. IDE sizing ratios

- toolbox: 230px locked
- workspace: fluid
- mobile breakpoint at `width <= 800px`

ELAB will deviate: needs right aside 360-420px for UNLIM chat + compile/upload + status. Deliberate adaptation, not copy.

## 12. Adaptation rules for ELAB HomeCompileLayoutV2

What we COPY from edukits:
1. Alpha-step palette tokens (5 on primary, 12 on text)
2. Single global radius (8px in ELAB, 6 in edukits)
3. Inter equivalent for body (Open Sans), Oswald display, Fira Code mono (.impeccable.md §17)
4. Button shadow vocabulary: `0 1px 3px ambient + inset 1px hairline + inset darken on hover`
5. 3px tinted-alpha focus outline
6. Modal output with `backdrop-filter:blur(2px)`
7. Instant hover (no transform)
8. Hairline 1px borders only

What we ADAPT for ELAB (Morfismo):
1. Palette = ELAB volume colors (Navy/Lime/Orange/Red), NOT purple
2. Right aside is required (not modal-only) — Andrea wants prominent compile+upload pill front-and-center
3. Mascot REQUIRED via unlimSlot prop
4. Touch target floor 44x44px (vs edukits' .25em / .5em which is below)
5. Bilingual via useTranslation()
6. LIM-first light mode (.impeccable.md §4)
7. Plurale "Ragazzi," teacher voice (Principio Zero)

What we REJECT from edukits:
1. Purple-on-purple gradients
2. Compile-button-in-modal (Andrea wants prominent pill)
3. JS theme switching (ELAB light-only)
4. FontAwesome 6 Pro (paid; use ElabIcons.jsx)

## 13. Concrete tokens for HomeCompileLayoutV2.module.css

Locally-scoped `--hcv2-*` CSS vars. Every var falls back to design-system.css globals.

## 14. Open questions for orchestrator

- Right aside collapse on iPad portrait? Recommendation: collapse on `<= 1024px` (inclusive)
- Modal vs persistent compile result? Recommendation: persistent on `>= 1024px`, modal on `< 1024px`
- UNLIM chat slot height: 60% aside, 40% for pill + status + picker

End audit.
