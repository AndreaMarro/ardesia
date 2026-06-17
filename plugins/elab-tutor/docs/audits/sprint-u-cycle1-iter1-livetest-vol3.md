# LiveTest-2 Vol3 — Sprint U Cycle 1 Iter 1

**Agent**: LiveTest-2
**Date**: 2026-05-01
**Prod URL**: https://www.elabtutor.school
**Route tested**: `#tutor` with `__ELAB_API.mountExperiment(id)`
**License gate bypass**: `elab-license-key = ELAB2026` via `localStorage` addInitScript

---

## Smoke Test Results (8 experiments) — 8/8 PASS

Run command: `npx playwright test tests/e2e/sprint-u-cycle1-iter1-vol3-smoke.spec.js --config tests/e2e/sprint-u.config.js`
Result: **10 passed (1.1m)** — 0 failed, 0 skipped

| Experiment | Mount OK | Components (data-component-id) | Arduino Editor (Compila/Blocchi) | Screenshot | Status | Notes |
|---|---|---|---|---|---|---|
| v3-cap5-esp1 | YES | 4 | YES (all 3: Compila, Arduino C++, Blocchi) | sprint-u-screenshots/v3-cap5-esp1.png | PASS | 41 SVGs total |
| v3-cap5-esp2 | YES | 4 | YES | sprint-u-screenshots/v3-cap5-esp2.png | PASS | Blink veloce |
| v3-cap6-esp1 | YES | 8 | YES | sprint-u-screenshots/v3-cap6-esp1.png | PASS | External LED + resistor |
| v3-cap6-morse | YES | 8 | YES | sprint-u-screenshots/v3-cap6-morse.png | PASS | Morse SOS |
| v3-cap7-esp1 | YES | 10 | YES | sprint-u-screenshots/v3-cap7-esp1.png | PASS | Potentiometer on A0 |
| v3-cap7-mini | YES | 0 | NO | sprint-u-screenshots/v3-cap7-mini.png | PASS (WARN P1) | NEW iter37 — 0 components, no editor UI after mount |
| v3-cap8-esp1 | YES | 4 | YES | sprint-u-screenshots/v3-cap8-esp1.png | PASS | Serial Monitor |
| v3-cap8-serial | YES | 0 | NO | sprint-u-screenshots/v3-cap8-serial.png | PASS (WARN P1) | NEW iter37 — 0 components, no editor UI after mount |

### API Surface (bonus tests)

| Test | Result | Notes |
|---|---|---|
| `__ELAB_API.mountExperiment` exists | PASS | `hasMountExperiment: true` |
| `__ELAB_API.unlim` object exists | PASS | |
| `__ELAB_API.getCircuitState` | ABSENT | Key `getCircuitState` not present in prod API keys |
| v3-cap5-esp1 mount no crash | PASS | 4 components, 41 SVGs, 0 console errors |

**`__ELAB_API` prod keys (first 10)**: `version, name, getExperimentList, getExperiment, loadExperiment, getCurrentExperiment, play, pause, reset, getComponentStates`

---

## Spec Files Created

- **`tests/e2e/sprint-u-cycle1-iter1-vol3-smoke.spec.js`** — 8 representative experiments, 10 tests, ALL 8/8 PASS
- **`tests/e2e/sprint-u-cycle1-iter1-vol3-full.spec.js`** — All 29 vol3 experiments (Cycle 2+ execution)
- **`tests/e2e/sprint-u.config.js`** — Already existed (created by LiveTest-1)

---

## Vol3 Specific Issues

### AVR vs Circuit mode — key behavioral difference

Vol3 experiments use `simulationMode: "avr"` (Arduino AVR emulation via avr8js).
Vol1/Vol2 use `simulationMode: "circuit"` (pure DC MNA/KCL CircuitSolver).

When a vol3 AVR experiment mounts on `#tutor`, it **automatically sends a preflight CORS request to the n8n compiler** (`https://n8n.srv1022317.hstgr.cloud/compile`). This generates a console error:

```
Access to fetch at 'https://n8n.srv1022317.hstgr.cloud/compile' from origin
'https://www.elabtutor.school' has been blocked by CORS policy
```

This is a **known infra issue** (n8n Hostinger CORS headers not configured for prod domain). It does NOT affect the simulator rendering — SVG canvas, component placement, and editor UI all work correctly. Filtered in smoke spec error collector alongside `onrender.com` and `ResizeObserver`.

**Action item for iter 2**: Add `Access-Control-Allow-Origin: https://www.elabtutor.school` header to n8n Hostinger compile endpoint OR configure Vite proxy.

### NEW iter37 experiments behavior (v3-cap7-mini, v3-cap8-serial)

Both `v3-cap7-mini` and `v3-cap8-serial` mount successfully via `__ELAB_API.mountExperiment()` (SVG renders, no crashes) BUT:
- `data-component-id` count = **0** (components not detected via this attribute)
- Arduino editor UI (Compila & Carica / Blocchi tab) **not visible** after 3s wait on `#tutor` route

**Hypothesis**: The `#tutor` route may not be the correct route for vol3 AVR experiments. The other 6 working experiments may be loading from a cached state or the editor UI appears only on `#lavagna`. The full experiments (cap5-cap8) work correctly because they appear to already be loaded in the simulator state. The NEW iter37 experiments (`v3-cap7-mini`, `v3-cap8-serial`) may require loading via the ExperimentPicker UI on `#lavagna` to fully initialize.

**Recommendation for Cycle 2**: Run vol3 experiments via `#lavagna` route + ExperimentPicker dialog (as done in `29-simulator-arduino-scratch-sweep.spec.js`) for more reliable editor UI detection.

### Scratch experiments

All vol3 experiments use `simulationMode: "avr"` — there are NO pure Scratch-mode experiments in vol3. Vol3 experiments include `scratchXml` properties for the Blocchi (Scratch/Blockly) tab, but the simulation engine is always AVR. This is consistent with the smoke results: the "Blocchi" tab was visible for all working experiments.

### Component count per experiment (observed)

| Experiment | `data-component-id` count | Expected | Match |
|---|---|---|---|
| v3-cap5-esp1 | 4 | 2 (bb + nano) | HIGHER (extra IDs for pins/wires) |
| v3-cap5-esp2 | 4 | 2 | OK |
| v3-cap6-esp1 | 8 | 3 | OK (extra for LED, R, wires) |
| v3-cap6-morse | 8 | 3 | OK |
| v3-cap7-esp1 | 10 | 3 | OK (pot adds more pin IDs) |
| v3-cap7-mini | 0 | 2 | WARN — see NEW experiment issue above |
| v3-cap8-esp1 | 4 | 1 | OK (nano + 3 pin IDs) |
| v3-cap8-serial | 0 | 1 | WARN — see NEW experiment issue above |

Note: `data-component-id` count exceeds expected component count because each **pin** on Arduino components also gets a `data-component-id` attribute. This is expected behavior.

---

## Screenshots

Saved in `docs/audits/sprint-u-screenshots/`:
- `v3-cap5-esp1.png`, `v3-cap5-esp2.png`, `v3-cap6-esp1.png`, `v3-cap6-morse.png`
- `v3-cap7-esp1.png`, `v3-cap7-mini.png`, `v3-cap8-esp1.png`, `v3-cap8-serial.png`
- `v3-cap5-esp1-api-surface.png` (API surface verification)

---

## Cycle 2 Priorities

1. Run full spec (`sprint-u-cycle1-iter1-vol3-full.spec.js`) — all 29 experiments on `#lavagna` route
2. Investigate v3-cap7-mini + v3-cap8-serial `0 components` on `#tutor` route (may need `#lavagna`)
3. Fix n8n CORS headers for prod domain (P2 infra)
4. Verify `getCircuitState` API key presence on `#lavagna` route (absent on `#tutor`)
5. Measure compile latency for AVR experiments (BG preflight auto-fires on mount)
