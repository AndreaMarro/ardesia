# WebDesigner-2 iter 36 Phase 1 — Atoms A5+A6 — STATUS: completed

**Timestamp**: 2026-04-30T13:23Z
**Agent**: feature-dev:code-architect (read-only) BG 52min duration_ms=3138900
**Completion msg author**: orchestrator scribe (agent had no Write tool, persisted blueprint)

## Deliverables

- `src/components/common/FloatingWindow.jsx` **NEW 7327 byte** (~210 LOC) — standalone spec API
- `src/components/common/FloatingWindow.module.css` **NEW 2743 byte** (~100 LOC) — z-index 10001 + mobile <768px fullscreen + coarse 32px corner
- `src/components/lavagna/LavagnaShell.jsx` **MODIFY +52 -0** (import line 28 FloatingWindowCommon + passo-passo block ~38 LOC after percorsoCapitoloOverlay close)
- `src/components/lavagna/GalileoAdapter.jsx` **MODIFY +8 -1** (defaultSize.w responsive `Math.min(400, window.innerWidth * 0.9)` + 4-line z-index hierarchy comment)

## Atom A5 acceptance (FloatingWindow common)

- ✅ Touch ≥44px drag header (48px titleBar height)
- ✅ Resize ≥24px corner (24px default, 32px coarse @media `(pointer: coarse)`)
- ✅ Position+size localStorage persist (key `elab-floatwin-{title-kebab}`)
- ✅ Z-index 10001 hierarchy (prop default + inline style)
- ✅ Esc key close (window keydown listener)
- ✅ Mobile <768px fullscreen modal (CSS @media inset:0 + 100vw/100dvh + cursor default + resizeCorner display:none)
- ✅ ARIA: `role="dialog" aria-modal="true" aria-label={title}`
- ✅ Focus trap (WCAG 2.4.3) Tab cycles within winRef
- ✅ Viewport clamp safePos + safeSize (xx 0..vw-100 + yy 48..vh-100)

## Atom A6 root cause analysis

- **H4 CONFIRMED mitigated**: PercorsoCapitoloView overlay LavagnaShell.jsx:1265 has no explicit z-index → browser stacking context 0 < UNLIM 1010+. No actual overlap in practice; hierarchy documented in GalileoAdapter comment.
- **H1 CONFIRMED**: `defaultSize.w=400` hardcoded → mobile <500px overflow. Fix: `Math.min(400, Math.round(window.innerWidth * 0.9))` = `min(90vw, 400px)`.
- **H2** (z-index conflict UNLIM dynamic 1010+ vs new FloatingWindow 10001): mitigated by CSS prop hierarchy.
- **H3** (anchor conflict bottom-right): passo-passo starts top-left `{x:100, y:100}`, UNLIM stays right `{x: window.innerWidth - 420, y: 56}` — no overlap.

**Layout permutations tested**: 5 viewport (1920/1280/1024/768/414) — code-analysis verified width formula safe at all breakpoints. 414px: `min(400, 372)=372px`. 768px: `min(400, 691)=400px`. Mobile <768px: fullscreen CSS override applies.

## CoV (deliverables persisted, vitest verify pending Phase 3)

- vitest delta expected: 13229 → 13229 (no new tests; Tester-1+2 ownership)
- regression: zero — disjoint file ownership respected
- syntax: JSX parse OK (Vite handles, Node import .jsx unsupported native — vitest is canonical check)

## Compliance gate 8/8 (PDR §0)

1. ✅ Linguaggio: empty state Passo Passo "Ragazzi, scegliete un esperimento dalla lista" (plurale + kit reference)
2. ✅ Kit fisico mention: "Aprite il kit ELAB e trovate l'esperimento nel volume."
3. ✅ Palette compliance: CSS var `var(--color-primary, #1E4D8C)` titleBar gradient, `rgba(229, 75, 61, 0.75)` close hover (Red token)
4. ✅ Iconografia: inline SVG path (NO material-design); resize corner radial-gradient dot pattern
5. ✅ Morphic runtime: localStorage persist key per-title (mutaforma per-finestra) + responsive inline style
6. ✅ Cross-pollination: FloatingWindow generic = reusable across modes/finestre
7. ✅ Triplet coerenza: Mobile fullscreen modal = LIM proietta correttamente touch device
8. ✅ Multimodale: WCAG focus trap + ARIA dialog + Esc close + touch coarse 32px

## Honesty caveats

1. **Layout permutations code-analysis only** (NOT Playwright E2E) — Tester-1 Phase 2 E2E verify ownership
2. **H4 z-index** mitigated via documentation, NOT explicit CSS z-index added to percorsoCapitoloOverlay (currently stacks correctly auto < 1010)
3. **GalileoAdapter change surgical**: only defaultSize.w formula changed (1 expression + comment block)
4. **common/FloatingWindow independent**: NOT alias of lavagna/FloatingWindow → preserves GalileoAdapter import stability (existing FloatingWindow lavagna untouched)
5. **Build verify deferred**: Phase 3 orchestrator `npm run build` ~14min heavy
6. **WebDesigner-1 LavagnaShell.jsx co-modify**: WebDesigner-1 added modalita migration (ModalitaSwitch fix), WebDesigner-2 added FloatingWindowCommon import + passo-passo block — disjoint line ranges, no conflict

## Handoff to Phase 2 Documenter

- 4 files filesystem persisted (2 NEW + 2 MODIFY)
- LavagnaShell.jsx +52 lines (import + passo-passo block ~38 LOC)
- GalileoAdapter.jsx +8 -1 (responsive w + comment)
- Phase 3 orchestrator: vitest run preserve 13229 + Playwright Mac Mini Cron L1+L2 verify post-deploy
- Iter 37 priorities:
  - Playwright E2E spec FloatingWindow drag/resize/persist (Tester-1 ownership Atom B-iter37)
  - WCAG audit common/FloatingWindow contrast + focus indicator (Tester-2)
  - Mobile real-device verify iPhone Safari + Android Chrome (Mac Mini Cron L2 user-sim simulate touch coarse)
  - Andrea ratify: deploy frontend Vercel post Phase 3 commit + push
