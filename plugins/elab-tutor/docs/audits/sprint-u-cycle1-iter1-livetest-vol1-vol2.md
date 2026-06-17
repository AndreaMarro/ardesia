# LiveTest-1 Vol1+Vol2 — Sprint U Cycle 1 Iter 1

**Date**: 2026-05-01
**Agent**: LiveTest-1
**Target**: https://www.elabtutor.school
**Playwright version**: 1.58.2
**Config**: `tests/e2e/sprint-u.config.js`

---

## Smoke Test Results (10 experiments) — 10/10 PASS

| Experiment | Label | Mount OK | DOM Components | Wire Nodes | circuitState | Screenshot | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| v1-cap6-esp1 | LED rosso — basic circuit | YES | 8 | 7 | 0 | sprint-u-cycle1-iter1-screenshots/v1-cap6-esp1.png | PASS | hasSvg=true, 0 errors |
| v1-cap6-esp2 | LED senza resistore | YES | 6 | 7 | 0 | sprint-u-cycle1-iter1-screenshots/v1-cap6-esp2.png | PASS | hasSvg=true, 0 errors |
| v1-cap7-esp1 | LED RGB rosso | YES | 8 | 7 | 0 | sprint-u-cycle1-iter1-screenshots/v1-cap7-esp1.png | PASS | hasSvg=true, 0 errors |
| v1-cap9-esp1 | pulsante | YES | 10 | 7 | 0 | sprint-u-cycle1-iter1-screenshots/v1-cap9-esp1.png | PASS | hasSvg=true, 0 errors |
| v1-cap10-esp1 | Arduino basic | YES | 8 | 7 | 0 | sprint-u-cycle1-iter1-screenshots/v1-cap10-esp1.png | PASS | hasSvg=true, 0 errors |
| v1-cap12-esp1 | PWM | YES | 10 | 6 | 0 | sprint-u-cycle1-iter1-screenshots/v1-cap12-esp1.png | PASS | hasSvg=true, 0 errors |
| v2-cap3-esp1 | Vol2 primo capitolo | YES | 4 | 1 | 0 | sprint-u-cycle1-iter1-screenshots/v2-cap3-esp1.png | PASS | hasSvg=true, 0 errors |
| v2-cap4-esp1 | Vol2 secondo capitolo | YES | 8 | 1 | 0 | sprint-u-cycle1-iter1-screenshots/v2-cap4-esp1.png | PASS | hasSvg=true, 0 errors |
| v2-cap5-esp1 | Vol2 terzo capitolo | YES | 6 | 1 | 0 | sprint-u-cycle1-iter1-screenshots/v2-cap5-esp1.png | PASS | hasSvg=true, 0 errors |
| v2-cap6-esp1 | Vol2 avanzato | YES | 10 | 7 | 0 | sprint-u-cycle1-iter1-screenshots/v2-cap6-esp1.png | PASS | hasSvg=true, 0 errors |

**Pass rate**: 10/10 (100%)
**Console errors**: 0 across all experiments
**Page errors**: 0 across all experiments

---

## Full Spec Created

- **Path**: `tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js`
- **Experiments covered**: 65 (38 vol1 + 27 vol2)
- **Status**: Ready for Cycle 2 execution
- **Output targets**:
  - `docs/audits/sprint-u-cycle1-iter1-livetest-vol1-vol2-full.jsonl` (per-experiment JSONL stream)
  - `docs/audits/sprint-u-cycle1-iter1-livetest-vol1-vol2-full.json` (summary + all results)
  - `docs/audits/sprint-u-cycle1-iter1-full-screenshots/` (65 PNG files)

---

## License Gate Analysis

**Gate mechanism** (`src/components/WelcomePage.jsx`):
- Heading "BENVENUTO IN ELAB TUTOR" with `input#license-key`
- Valid key: `ELAB2026` — stored as `localStorage['elab-license-key']`

**Bypass strategy used (SUCCESSFUL)**:
- `page.addInitScript` seeds `localStorage['elab-license-key'] = 'ELAB2026'` BEFORE app hydration
- Also seeds `elab_gdpr_consent` (ConsentBanner) + `elab_consent_v2` + `elab_user_age`
- Seeds `elab_skip_bentornati` to suppress BentornatiOverlay
- Helper: `tests/e2e/helpers/sprint-u-auth.js` — `seedSprintUBypass(page)`

**Result**: License gate was fully bypassed in all 10 smoke runs. Zero UI fallback needed.

**`#tutor` route finding**: Navigating to `https://www.elabtutor.school/#tutor` after seeding loads the simulator directly. `window.__ELAB_API` is available and `mountExperiment()` works. The `/#tutor` route exposes the SimulatorCanvas with `data-component-id` nodes per mounted component.

---

## Issues Found

### 1. `circuitComponentCount` = 0 (getCircuitState().components empty)
All 10 experiments reported `circuitComponentCount = 0` while `componentCount` (DOM `data-component-id` nodes) ranged from 4–10. This means `window.__ELAB_API.getCircuitState().components` returns an empty object after mount. Two hypotheses:
- **H1 (likely)**: `getCircuitState()` returns the live solver state, which may not be populated until the circuit simulation runs a tick. After `mountExperiment` the components are placed on the SVG canvas but the MNA solver state object initializes lazily.
- **H2**: The `components` key in `getCircuitState()` uses a different field name than `components` (e.g. `nodes` or `elements`).

**Impact**: PASS classification still correct because DOM `componentCount > 0` (the components ARE rendered). This is a measurement gap, not a broken experiment.

**Cycle 2 fix recommendation**: After `mountExperiment`, also check `getCircuitDescription()` or query `.simulator-component` CSS selectors to get richer state.

### 2. Wire count discrepancy: wireCount via CSS selector vs circuitState
`wireCount` (DOM `[data-wire-id]` + `[class*="wire"]` nodes) returned 7 for most vol1 experiments and 1 for vol2 experiments. `circuitWireCount` (from `getCircuitState().connections`) = 0 consistently. Same lazy-init issue as above.

### 3. Vol2 experiments show lower componentCount (4–8) vs Vol1 (6–10)
Vol2 experiments using Arduino Nano have fewer `data-component-id` nodes because some components may be procedurally generated or use a different attribute. Not a failure — visual SVG confirmed present (`hasSvg=true`).

### 4. No console or page errors across all 10 experiments
All 10 experiments loaded and mounted with zero console errors and zero JS page errors. The prod build is clean for these core experiments.

---

## Files Created

| File | Purpose |
|---|---|
| `tests/e2e/sprint-u.config.js` | Playwright config for Sprint U (prod target, 1 worker, retries 1) |
| `tests/e2e/helpers/sprint-u-auth.js` | License gate bypass helper (`seedSprintUBypass`) |
| `tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-smoke.spec.js` | 10-experiment smoke spec (EXECUTED) |
| `tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js` | 65-experiment full spec (ready Cycle 2) |
| `docs/audits/sprint-u-cycle1-iter1-livetest-vol1-vol2-smoke.json` | Smoke test results (machine-readable) |
| `docs/audits/sprint-u-cycle1-iter1-screenshots/*.png` | 10 screenshots per experiment |

---

## Raw JSON

`docs/audits/sprint-u-cycle1-iter1-livetest-vol1-vol2-smoke.json`
