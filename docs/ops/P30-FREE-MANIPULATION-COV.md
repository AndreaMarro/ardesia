# P30 Free-Manipulation — Coverage (COV)

Branch `p30/free-manipulation-trace-v0-20260709-185100`. **Not Tinkercad parity.** Trace logic proven; e2e quarantined (see P30-FREE-MANIPULATION-RED.md).

## USER-VISIBLE (on the mounted Room Simulation Plugin embed)
- `[data-simulation-free-mode]` strip: current badge ("corrente X mA"), error diagnostic, "Rompi i collegamenti" / "Ripristina" buttons.
- Palette + placement (legacy "Montaggio libero"): `palette Resistenza`, `data-montaggio-canvas-count`.

## TESTED
- `simulationSceneDigest` — 5/5 unit (determinism, order-invariance, runtime-exclusion, break-changes-digest).
- `ToolCanvasEmbeddable` + `SimulationPluginWorkbench` + `SimulationWireEditor` + `simulationSolveEvent` — 34/34 unit (no regression).
- Full trace e2e — passed **once clean (7.5s)** but flaky → `test.fixme` quarantined.

## IMPLEMENTED (real, wired to real physics)
- DOM contract from `boardScene`: `data-sim-solve-kind`, `data-sim-current-ma`, `data-sim-last-event-kind`, `data-sim-error-id`, `data-sim-scene-digest`.
- Break = disconnect battery net → `solveSeriesLoop.closed===false` → `deriveSimulationSolveOutcome` `open-circuit` → `simulation.error.observed` (real errorId + evidence).
- Save/reopen: break + placement persist via `host.persistEmbedState`; digest (topology of `boardScene`) identical after reload.

## PARTIAL
- Palette scope: resistor/LED via legacy tap-tap; battery9v/wire as first-class palette entries not added (v0).
- Wire connect/retarget via Excalidraw drag exists in the engine (`onConnectionAdd`/`onWireUpdate`) but is not driven by this e2e (drag-driving deferred).
- e2e reliability: flaky (Excalidraw interaction timing + IndexedDB `add` seq-collision) → quarantined.

## ABSENT
- Live-browser un-quarantined green trace, undo/redo, short-circuit/overcurrent/LED-reversed cases, export, deploy.

## NOT TINKERCAD PARITY
This run did NOT claim Tinkercad parity. It is the free-manipulation trace v0 with a stable DOM contract, logic-proven, e2e-quarantined pending a reliability fix.
