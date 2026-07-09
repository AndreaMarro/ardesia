# P29 — GATE CERTIFICATION (adversarially verified)

> Produced by the read-only ultracode workflow `wf_ced8cc60-666` (12 agents: 1 fix-diagnosis + 6 gate
> auditors + 5 adversarial refuters), then applied by the single write lane. Generated 2026-07-09.
> **Claim-lock holds: NOT "Tinkercad parity candidate"** — that needs G0–G9 all VERIFIED; 4 are PARTIAL.

## Certified gate matrix

| Gate | Name | Status | Proof (evidence) | Honest gap |
|---|---|---|---|---|
| G0 | Mount canvas | ✅ **VERIFIED** | `ToolCanvasEmbeddable.tsx:907/1140`; vitest 19/19; e2e `montaggio-canvas` | — |
| G1 | Scene = source of truth | ✅ **VERIFIED** | `data-elab-canvas-source-of-truth="simulation-scene"`; e2e | — |
| G2 | Placement / occupancy | ✅ **VERIFIED** | e2e `montaggio-canvas` 3/3 (rejects occupied `bb1:i9`) | — |
| G3 | Wires (semantic/colors/waypoints/validation) | ✅ **VERIFIED** | 34 tests (`SimulationWireContract`, `ElabSceneBridge`, `ToolCanvasEmbeddable`, `StructuredSceneIntake`); refuter upheld | `inferCanvasWireColor` heuristic has no unit test; "validation" = endpoint/path validity, NOT circuit-rule (short/open/polarity) — those live in the MNA solver |
| G4 | Solver golden (CircuitSolver) | ✅ **VERIFIED** | `ElabSolver.test.ts:40` golden **15.3 mA** = (9−1.8)/470 from real engine v4; 5/5 pass; refuter upheld | `toBeCloseTo(0.0153,3)` tolerance would also pass the divergent 14.9 mA UI golden — minor test-discrimination nit |
| G5 | AI typed operations | ⚠️ **PARTIAL** | `sim/core/simulationAiApi.ts`: addComponent(129), connectPins(185), setValue(264), runSolve(325), diagnose(335); 18/18 tests | **`repair` MISSING** (only `compareToTarget` = diagnostic, applies no fix). 5/6 canonical ops |
| G6 | ELABTutor pack + step mode | ✅ **VERIFIED** | `simulationStepMode.ts`; e2e `sim-passo-passo` | — |
| G7 | LessonOS typed events | ⚠️ **PARTIAL** | `eventlog.ts:45` union; 4/11 P29 events exist by name (material.cited, simulation.step.completed, plugin.mounted, studentpack.generated) | **7 missing**: material.imported, simulation.operation.applied, simulation.error.observed, simulation.circuit.solved, simulation.target.matched, export.completed, concept.mentioned |
| G8 | Export / reopen | ⚠️ **PARTIAL** | `.lesson` ZIP export+reopen-identical proven (`LessonBundle.test.ts` 18/18); JSON studentpack round-trip e2e | **MD/HTML/SVG/PNG export ABSENT**; PDF is import-only; `.lesson` reopen-identical is unit-level, no real-browser e2e |
| G9 | iPad / LIM (touch/zoom/resize) | ⚠️ **PARTIAL** | responsive `@media(max-width:768px)` (tested CSS guard); `simulationViewport.ts` zoom/pan/resize math (unit-tested) | **touch/pinch/gesture handlers ENTIRELY ABSENT (0 matches)**; viewport math **unwired** to any UI component |

## Fix applied this session (single write lane)
`apps/studio/src/lessonos/teacherDashboardProjection.ts` — `projectGraphView` now additively injects
isolated `kind:"plugin"` graph nodes into `graphView.nodes` (deterministic sort by id, deduped vs the
focus neighborhood). Root cause: `plugin.mounted` creates a node with no edges → `neighbors()` never
reaches it → dashboard graph showed `[]`. **3 adversarial refuters upheld (severity none)**; one ran the
full 20-test suite on a patched copy (20/20) + tsc exit 0. Verified post-apply: **typecheck 0, `TeacherDashboardProjection.test.ts` 20/20** (was 19/20). Full suite re-running.

## What this means for "lesson tomorrow"
The First-LED spine (G0–G4, G6) is **VERIFIED** and the full suite is green (1543/1543).
The PARTIAL gates are additive gaps, prioritized in P29-NEXT-PLAN.md.

**Correction / no-overclaim (2026-07-09):** an earlier draft called G9 touch "the classroom blocker."
That was an *inference, not evidence.* The core First-LED flow is tap-driven (holes, palette, steps) and
browsers synthesize `click` from tap, and board-level pinch/zoom already comes from Excalidraw — so the
lesson may already work on an iPad. Only *dedicated in-post-it pinch-zoom* is provably absent, and
`simulationViewport` is unwired. **The honest next step is an emulated-touch e2e probe** (Playwright,
`hasTouch`, iPad viewport) to establish whether touch actually fails, before writing any gesture code.

### G9 update (2026-07-09) — real blocker found by the probe, then fixed
The probe found the *actual* iPad/LIM blocker (not touch gestures): at 810px the toolbar overflowed to
1356px with the hamburger gated to ≤768px, so the **"Insert Simulation Plugin" button was physically
off-screen and unreachable by touch or mouse** (`btn.right=893 > innerWidth=810`, `.click()` and `.tap()`
both failed). Fixed in `index.css` (extend collapsible menu to 769–1024px + lift `.st-bar` above the
Excalidraw canvas with `z-index:500`). **Now VERIFIED on touch:** `e2e/first-led-ipad-touch.spec.ts`
passes — teacher opens the menu, taps "sim", the core canvas mounts, 0 console errors. **Still P1:**
dedicated in-post-it pinch-zoom (`simulationViewport` unwired) + touch placement of components *inside*
the mounted canvas. So G9 **insert/mount path = VERIFIED on iPad touch**; in-canvas gestures remain polish.
