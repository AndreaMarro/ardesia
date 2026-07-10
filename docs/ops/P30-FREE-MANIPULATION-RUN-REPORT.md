# P30 Free-Manipulation — Run Report

Bounded TDD run. Base main `204ffefc`. Branch `p30/free-manipulation-trace-v0-20260709-185100`.

## Method executed
1. Sync main + single-writer gate: clean, no lock. ✅
2. Branch created. ✅
3. Tight recon (montaggio-canvas, first-led-ipad-touch, SimulationPluginWorkbench, ToolCanvasEmbeddable, simulationSolveEvent, eventlog, simulationWireEditor, solveSeriesLoop/buildNets). ✅ → PLAN.
4. Test written first → **RED-FIRST** confirmed (`[data-simulation-free-mode]` not found). ✅
5. Implemented minimal contract: `simulationSceneDigest` + `[data-simulation-free-mode]` DOM (real solve/diagnostic/digest from `boardScene`) + battery-disconnect break + persistence.
6. Iterated: RED→GREEN reached (**1 passed, 7.5s** full trace).
7. Adversarial review (fresh sub-agent) → found "badge from `scene` not `boardScene`" → **fixed** to `boardScene`; strengthened reopen to assert placement persistence.
8. e2e reliability then degraded under repeated/loaded runs (Excalidraw interaction timeouts + IndexedDB `add` seq-collision). Exceeded 2 repair cycles → **STOP, RED_BLOCKER**.

## Gates
| Gate | Result |
|---|---|
| typecheck (tsc -b) | 0 ✅ |
| build | 0 ✅ |
| digest unit | 5/5 ✅ |
| targeted units (incl. ToolCanvasEmbeddable) | 34/34 ✅ |
| e2e p30-free-manipulation | passed once (7.5s) then flaky → `test.fixme` ⚠️ |
| e2e regression (montaggio-canvas / first-led-ipad-touch) | flaky under load (needs clean-CI verify) ⚠️ |

## Verdict
**RED_BLOCKER** on e2e reliability (not logic). Details + next steps: `P30-FREE-MANIPULATION-RED.md`. COV: `P30-FREE-MANIPULATION-COV.md`.

Non ho dichiarato Tinkercad parity.
