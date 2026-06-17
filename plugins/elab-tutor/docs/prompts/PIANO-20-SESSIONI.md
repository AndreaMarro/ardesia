# Piano 20 Sessioni Dedicate — ELAB Tutor Deep Focus

> Creato: 11/03/2026 — Post Ciclo 160
> Basato su: MEGA-SPRINT-CIRCOLARE.md + Score Card 9.4/10

## Logica

Ogni sessione ha UN SOLO focus. Ogni sessione produce:
1. Fix implementati e testati nel browser
2. Build 0 errori
3. Deploy Vercel/Netlify/Render dove necessario
4. Prompt della sessione successiva

## Sequenza

| # | Focus | Score | Target | Prompt File |
|---|-------|-------|--------|-------------|
| 1 | Estetica — Design Tokens (inline colors → CSS vars) | 8.8 | 9.3 | `session-01-design-tokens.md` |
| 2 | Estetica — Spacing Grid & Typography Polish | 8.8 | 9.5 | `session-02-spacing-typography.md` |
| 3 | iPad — Toolbar & Main Layout Optimization | 8.8 | 9.2 | `session-03-ipad-toolbar.md` |
| 4 | iPad — Slide-Over, Split View, RotateOverlay | 8.8 | 9.5 | `session-04-ipad-splitview.md` |
| 5 | Responsive — Mobile (375-393px perfection) | 9.2 | 9.5 | `session-05-mobile-responsive.md` |
| 6 | Responsive — Desktop & Widescreen (1440px+) | 9.2 | 9.5 | `session-06-desktop-widescreen.md` |
| 7 | A11y — ARIA Live Regions & Semantic Landmarks | 9.2 | 9.5 | `session-07-aria-live.md` |
| 8 | A11y — Keyboard Navigation & Focus Management | 9.2 | 9.7 | `session-08-keyboard-focus.md` |
| 9 | Code Quality — confirm() → Custom Modal Refactor | 9.8 | 10.0 | `session-09-custom-modals.md` |
| 10 | Code Quality — Bundle Optimization & Lazy Loading | 9.8 | 10.0 | `session-10-bundle-optimization.md` |
| 11 | Sito Pubblico — 61 Orphan Files & Dead Code | 9.6 | 10.0 | `session-11-orphan-cleanup.md` |
| 12 | Galileo — Input Sanitization (P2-NAN-5/7) | 10.0 | 10.0+ | `session-12-galileo-sanitization.md` |
| 13 | Galileo — Knowledge Gaps & Response Quality | 10.0 | 10.0+ | `session-13-galileo-knowledge.md` |
| 14 | Notion Integration — DB ID Alignment | P1 | Fix | `session-14-notion-alignment.md` |
| 15 | Breadboard — Edge Cases & Drag Stress Test | 10.0 | 10.0+ | `session-15-breadboard-edge.md` |
| 16 | SVG Parità Visiva — 22 Components vs PDF | 10.0 | 10.0+ | `session-16-svg-parity.md` |
| 17 | Scratch — Compile Server & Missing Libraries | 10.0 | 10.0+ | `session-17-scratch-compile.md` |
| 18 | Physics — CircuitSolver Transient Simulation | 8.0 | 8.5 | `session-18-physics-transient.md` |
| 19 | Nano R4 — SVG True-to-Book Replacement | 10.0 | 10.0+ | `session-19-nano-r4-svg.md` |
| 20 | Integration Test & E2E Automation Setup | — | Suite | `session-20-e2e-automation.md` |

## Regole Per Ogni Sessione

1. Leggere i context files in `docs/prompts/context/` PRIMA di iniziare
2. Un argomento alla volta — non divagare
3. Build 0 errori prima di concludere
4. Testare nel browser con Claude Preview
5. Se iPad/responsive: testare almeno 3 viewport (375, 768x1024, 1440x900)
6. Se estetica: screenshot prima/dopo
7. Aggiornare context files pertinenti alla fine
8. Creare il prompt della sessione successiva
9. Deploy se ci sono modifiche
