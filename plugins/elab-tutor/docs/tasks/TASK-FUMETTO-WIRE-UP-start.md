# Pre-audit TASK-FUMETTO-WIRE-UP

- **Data**: 2026-04-19T20:04Z
- **Branch**: feature/fumetto-wire-up
- **SHA pre-task**: dbd4cca (main HEAD post PR #6 Fumetto MVP merged)
- **Working tree**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-wireup` (isolated)
- **Baseline test (local pre-task)**: 12098 PASS (from prior session CoV)
- **Node**: v22.14.0

## Objective

Wire up Fumetto Report in LavagnaShell — l'MVP shipped in PR #6 era standalone component. Feature inutile finché non wired in UI.

## Scope (Phase 1.5)

1. Aggiungere `onFumettoOpen` prop in `AppHeader.jsx` + button "Fumetto" con SVG 3-panel icon
2. LavagnaShell handler `handleFumettoOpen` → dynamic import `UnlimReport` → `openReportWindow(experimentId)`
3. Voice command listener `elab-voice-command` action `createReport` → trigger stesso handler
4. TDD 5 unit assertions AppHeader button (render conditionally, click callback, aria-label, touch target, disabled state)

## Regola 0 — RIUSO existing system

`src/components/unlim/UnlimReport.jsx` già implementa fumetto completo (pannelli irregolari, balloon SVG, mascotte, scene typed, stats). Non duplicate — RIUSO via `openReportWindow()`.

`SessionReportComic.jsx` (shipped PR #6) resta standalone per eventuale future inline use MVP. Not wired here.

## Cuts (out of MVP scope)

- TRES JOLIE asset import — separate PR (ops script + file copies > 10MB)
- html2pdf.js upgrade — regola 13 (no npm install senza Andrea)
- UX bugs lavagna (empty selectable + persistenza Esci) — separate PR dedicated

## Files modified

- `src/components/lavagna/AppHeader.jsx` — 1 new prop + button block
- `src/components/lavagna/LavagnaShell.jsx` — handler + useEffect listener + prop passage

## Files created

- `tests/unit/lavagna/AppHeader-fumetto.test.jsx` — 5 unit tests
- `docs/tasks/TASK-FUMETTO-WIRE-UP-start.md` — this file
- (pending) `docs/reports/TASK-FUMETTO-WIRE-UP-cov.md` — CoV 3/3
- (pending) `docs/audits/TASK-FUMETTO-WIRE-UP-audit.md` — audit
- (pending) CHANGELOG entry
