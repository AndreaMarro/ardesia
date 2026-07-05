# Piano `simulature` — cicli piccoli TDD (aggiornato firsthand 2026-07-04)

> Fonte prodotto: `PROMPT-TOTALE-SIMULATURE-ARDESIA-FABLE5-2026-07-15.md` (VOLUME 3).
> Spec fase corrente: `docs/superpowers/specs/2026-07-04-simulature-p2-solver-design.md`.
> Ogni fase = branch + PR + CoV (`tsc -b` exit 0 · vitest ×3 flag canonici da `apps/studio` ·
> build · `git diff --check`). Merge = GATE-Andrea, sempre.

## Stato fasi (verificato firsthand, non dal prompt)

| Fase | Stato | Evidenza |
|---|---|---|
| 0 — merge #44-#47 | ✅ CHIUSA | `origin/main` = `f03ec119` (merge #47) |
| 1 — `-schema` freeze `circuit-scene/2` | ✅ implementata, PR **#49** aperta (gate-Andrea) | branch `feat/elab-scene-schema-20260716` |
| 1bis — adapter ElabScene→payload + F4/F5 | ✅ implementata, PR **#50** aperta (gate-Andrea) | branch `feat/elab-scene-adapter-20260717` |
| 2 — solver dietro registry (P2) | 🔨 QUESTA SESSIONE | branch `feat/p2-solver-package-20260704` da `origin/main` |
| 3 — `-eval` grader + round-trip | ⏭ dopo Fase 2 | — |
| 4 — 5 scene starter `verified` | ⏭ | richiede #49/#50 mergiate (schema) |
| 5/6 — vision · toolchain | ⏭ | — |
| 7 — assembly+UI+UNLIM | ⏭ | — |
| 8/9 — agent/adapter · scala | ⏭ | — |

## Fase 2 — task bite-sized (questa sessione)

### T1 — Vendored engine + drift-guard (Red→Green)
- Red: `SolverVendoredDrift.test.ts` — sha256 di
  `sim/solver/engine/CircuitSolver.js` e `sim/solver/components/registry.js`
  == sha256 delle sorgenti in `plugins/elab-tutor/.../simulator/{engine,components}/`.
  Fallisce: file vendored assenti.
- Green: copia byte-identica dei 2 file.
- Predicato: `npx vitest run src/__tests__/SolverVendoredDrift.test.ts` exit 0.

### T2 — Catalogo elettrico headless (Red→Green)
- Red: `SolverCatalog.test.ts` — dopo `registerElectricalCatalog()`:
  `getComponent('breadboard-half').getInternalConnections()` produce le strip
  (colonne top f-j, bottom a-e, 4 rail); `led/resistor/battery9v/wire` hanno i pin canonici
  (estratti firsthand dai `registerComponent` nei JSX).
- Green: `sim/solver/catalog.ts` (+ `.d.ts` per i 2 vendored).
- Predicato: test file exit 0.

### T3 — Wrapper `elabSolver.ts` + golden elettrico (Red→Green)
- Red: `ElabSolver.test.ts` — circuito reference (bat 9V + R470 + LED red, connections +
  pinAssignments della scena reference): `led1.current ≈ 0.0153` (3 decimali), `on === true`;
  circuito aperto → 0 A / off; warning Vf quando `sceneLedForwardVolts` ≠ tabella motore.
- Green: `solveElabExperiment()` minimo che carica catalog + engine e normalizza il risultato.
- Predicato: test file exit 0.

### T4 — Contratto registry `solve?` (Red→Green)
- Red: estensione `simulationPluginRegistry.test.ts` — entry registrata con `solve` la
  espone via `getSimulationTool(id)?.solve`; entry senza `solve` → undefined (deny-by-default).
  Reference tool: `getSimulationTool(REFERENCE_SIM_TOOL_ID)?.solve` definito e golden 15.3 mA
  attraverso il dispatch del registry.
- Green: campo `solve?` su `SimulationToolEntry` + wiring nel reference entry.
- Predicato: test file exit 0 + golden UI 14.9 mA invariato.

### T5 — CoV completo + review + PR
- `tsc -b` exit 0 · vitest ×3 = 773+N passed / 5 skipped, 0 rotti · build exit 0 ·
  `git diff --check` pulito · secret-scan diff.
- Review avversariale ≤2 lenti SYNC; constitutional self-check §13.2.
- PR su `main` con evidenza CoV nel body. **No merge** (GATE-Andrea).

## Open question BLOCCANTE (per Andrea, non blocca Fase 2)

- Vf canone Vol.1 LED rosso: **1.8 V** (motore, → 15.3 mA) o **2.0 V** (scena reference,
  → 14.9 mA)? Fase 2 preserva entrambi i golden e traccia il conflitto come warning;
  la riconciliazione cambia il golden delle 5 scene starter (Fase 4).
