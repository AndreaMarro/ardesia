# P30 Free-Manipulation Trace v0 — Plan

Branch `p30/free-manipulation-trace-v0-20260709-185100` off main `204ffefc`.
Goal: prove `apps/studio/e2e/p30-free-manipulation.spec.ts` green. **v0, not full Tinkercad parity.**

## Recon verdict — what already exists (real, on the Room embed `ReferenceSimulationCanvasTool`)
- Mount via `getByRole("button", {name:"Inserisci Simulation Plugin sulla lavagna"})` → `data-elab-core-canvas-mounted="true"` (ToolCanvasEmbeddable.tsx:970).
- **Palette + add**: legacy `<details data-legacy-free-assembly-harness>` → `getByRole("button",{name:"palette Resistenza"})`, tap-tap holes → `data-montaggio-canvas-count` (proven by `montaggio-canvas.spec`).
- **Free-manipulation engine**: core canvas `onConnectionAdd`/`onWireUpdate`/`onWireDelete`/`onLayoutChange` → `applyElabCanvas*` → persisted (ToolCanvasEmbeddable.tsx:1125-1174). Drag-driven (Excalidraw), not cleanly Playwright-drivable.
- **Real physics outcome**: `deriveSimulationSolveOutcome(scene,…)` → `solved{currentMa}` | `error{open-circuit|missing-resistor|…}` via `solveSeriesLoop`/`batteryLedCurrentMa` (ToolCanvasEmbeddable.tsx:1392). Mapped to `simulation.circuit.solved`/`simulation.error.observed` by pure `simulationSolveEvent`.
- **Persistence**: `host.persistEmbedState` round-trips embed state; placements restore on mount (line 823).

## Gap (why RED first)
| Requirement | Existing support | Missing | Test selector | Impl file |
|---|---|---|---|---|
| palette visible | `palette Resistenza` legacy | — | `getByRole button /palette Resistenza/` | (none) |
| add component | montaggio tap-tap → count | — | `[data-montaggio-canvas-count]` | (none) |
| solve → current badge | outcome computed, **host-only** | not in DOM | `[data-sim-solve-kind="solved"]`,`[data-sim-current-ma]` | ToolCanvasEmbeddable |
| break → open-circuit | `deriveSimulationSolveOutcome` open-circuit | **no drivable break control**, not in DOM | `[data-sim-break]`,`[data-sim-solve-kind="error"]` | ToolCanvasEmbeddable |
| error.observed | `simulationSolveEvent` pure | **not surfaced** | `[data-sim-last-event-kind="simulation.error.observed"]`,`[data-sim-error-id]` | ToolCanvasEmbeddable |
| diagnostic visible | — | **not surfaced** | `[data-sim-diagnostic]` role=status | ToolCanvasEmbeddable |
| save/reopen digest | persistEmbedState + restore | **no sceneDigest exposed** | `[data-sim-scene-digest]` stable across reload | new `simulationSceneDigest.ts` |

## Minimal honest implementation (no new architecture, no fake green)
1. `sim/core/simulationSceneDigest.ts` — pure FNV-1a hash over a canonical scene projection (components+connections). Unit test.
2. In `ReferenceSimulationCanvasTool`:
   - `connectionBreak` state (persisted in `marker.state.freeMode.connectionBreak`, restored on mount).
   - `workingScene = connectionBreak ? applyElabCanvasWireDelete(scene, 0) : scene` (real series open-circuit).
   - compute `solveOutcome`/`solveEvent`/`sceneDigest` from `workingScene`; feed `boardScene` + the host-emit effect from `workingScene` (single source).
   - surface DOM: `data-sim-solve-kind`,`data-sim-current-ma`,`data-sim-last-event-kind`,`data-sim-error-id`,`data-sim-scene-digest` on the mounted `<section>`.
   - add plain-DOM free-mode control: `[data-sim-break]` "Rompi un collegamento" / `[data-sim-restore]` "Ripristina", visible diagnostic `[data-sim-diagnostic]` when error.
3. e2e drives: mount → palette+add (legacy) → assert solved badge+current>0 → break → assert error + error.observed + diagnostic → capture digest → reload → assert same digest (reopen).

## Out of scope (documented, not faked)
- Excalidraw drag-based connect/retarget in e2e (engine exists, drag-driving deferred).
- battery/wire palette entries beyond resistor/LED (legacy palette scope).
- Full parity, plugins, deploy, graph/HTML.
