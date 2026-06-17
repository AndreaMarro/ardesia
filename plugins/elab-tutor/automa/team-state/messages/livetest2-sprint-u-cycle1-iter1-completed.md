# LiveTest-2 Completion — Sprint U Cycle 1 Iter 1

**Timestamp**: 2026-05-01T10:00:00Z
**Agent**: LiveTest-2
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Prod URL**: https://www.elabtutor.school

---

## Vol3 smoke tests: 8/8 PASS (10/10 total tests including API surface)

Run: `npx playwright test tests/e2e/sprint-u-cycle1-iter1-vol3-smoke.spec.js --config tests/e2e/sprint-u.config.js`
Result: **10 passed (1.1m)** — 0 failed, 0 skipped

---

## Full spec created: YES

- `tests/e2e/sprint-u-cycle1-iter1-vol3-smoke.spec.js` — 8 experiments, 10 tests, ALL PASS
- `tests/e2e/sprint-u-cycle1-iter1-vol3-full.spec.js` — 29 experiments (Cycle 2+ execution)

---

## Issues found

1. **n8n CORS error on vol3 mount** (KNOWN INFRA, P2): Vol3 AVR experiments auto-fire compile preflight to `n8n.srv1022317.hstgr.cloud` on mount, which fails CORS on prod. Filtered in test error collector (same as `onrender.com`). Does NOT block SVG rendering or editor UI.

2. **v3-cap7-mini / v3-cap8-serial: 0 `data-component-id` + no editor UI** (WARN P1, NEW iter37 experiments): Both NEW iter37 experiments mount via API without crash and SVG renders, BUT `data-component-id` count = 0 and Compila/Blocchi buttons not visible after 3s on `#tutor` route. Other 6 experiments work fine. Hypothesis: these experiments require `#lavagna` route + ExperimentPicker initialization. Deferred to Cycle 2 investigation.

3. **`__ELAB_API.getCircuitState` absent on `#tutor`**: Only `mountExperiment` needed for smoke. `getCircuitState` not in prod API keys on this route. Note for vol3 monitor spec writers.

---

## Findings: vol3 AVR behavior

- All vol3 experiments: `simulationMode: "avr"` — NO pure Scratch mode experiments in vol3
- All 6 working experiments show: Compila & Carica button + Arduino C++ tab + Blocchi tab all present simultaneously
- `data-component-id` count higher than component count (pins also get IDs): 4-10 IDs observed vs 1-3 components
- SVG count on loaded page: 41 (includes all simulator UI chrome)

---

## Screenshots saved

`docs/audits/sprint-u-screenshots/` — 9 PNG files (8 experiments + 1 API surface)

---

## Audit document

`docs/audits/sprint-u-cycle1-iter1-livetest-vol3.md`
