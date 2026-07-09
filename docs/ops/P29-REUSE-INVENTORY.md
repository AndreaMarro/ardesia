# P29 — REUSE INVENTORY

> Classify before implementing. reuse-now | reuse-after-adapter | inspect | do-not-use | duplicate | obsolete.
> Worktree `/Users/andreamarro/ardesia-wt/tutor-ux` @ `ab91e476`. Generated 2026-07-09.

## Simulation core (the P0 spine)

| Asset | Path | Class | Evidence / note |
|---|---|---|---|
| Mount adapter | `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx` | **reuse-now** | mounts real canvas handle, typed wire ops, persists `simulation-scene-v1` (L907-1146) |
| Scene bridge | `apps/studio/src/toolhost/elabSceneBridge.ts` | **reuse-now** | SVG→scene adapter (render layer only) |
| Step mode | `apps/studio/src/toolhost/simulationStepMode.ts` | **reuse-now** | e2e `sim-passo-passo.spec.ts` |
| Experiment catalog | `apps/studio/src/toolhost/elabExperimentCatalog.ts` | **reuse-now** | First-LED + esp2/esp6 |
| Sim plugin registry | `apps/studio/src/toolhost/simulationPluginRegistry.ts` | **reuse-now** | deny-by-default registry (per memory #45) |
| Solver (official) | `apps/studio/sim/solver/engine/CircuitSolver.js` + `elabSolver.ts` | **reuse-now (verify)** | golden 15.3mA per memory; re-run golden |
| Solver (plugin copy) | `plugins/elab-tutor/src/components/simulator/engine/CircuitSolver.js` | **duplicate** | keep as plugin-internal; studio uses `sim/solver` copy |
| SimulatorCanvas | `plugins/elab-tutor/src/components/simulator/canvas/SimulatorCanvas.jsx` | **reuse-now** | the REAL canvas mounted by ToolCanvasEmbeddable |
| Legacy harness | `apps/studio/src/design/SimulationPluginWorkbench.tsx` | **inspect / keep-as-fallback** | `data-simulation-surface="harness"` — the degraded fallback, do not promote |

## Board / plugin host

| Asset | Path | Class |
|---|---|---|
| Post-it objects | `toolhost/postitObject.ts`, `subPostitObject.ts` | reuse-now |
| Plugin manager / installer | `toolhost/{pluginManager,installer,essentialPlugins}.ts` | reuse-now |
| Marketplace | `toolhost/marketplace/*` | reuse-now (per memory: marketplaceItem union) |
| Board render | `toolhost/pluginPostitBoardRender.tsx` | reuse-now |

## LessonOS / graph / export

| Asset | Path | Class |
|---|---|---|
| Teacher dashboard projection | `apps/studio/src/lessonos/teacherDashboardProjection.ts` | reuse-now — defines `DashboardNodeKind` (now incl. `plugin`) |
| Graph canvas | `apps/studio/src/design/LessonGraphCanvas.tsx` | reuse-now — **fixed this session** (missing `plugin` in style maps) |
| Student pack / export | e2e `studentpack-artifact.spec.ts`, `saved-lessons.spec.ts` | reuse-now — verify .lesson/PDF/MD/HTML reopen |

## External reference repos (local, read-only inspiration)

| Repo | Path | Use |
|---|---|---|
| whiteboard-studio | `/Users/andreamarro/whiteboard-studio/{studio,sim}` | inspect — sim prior art |
| elabtutor backup | `/Users/andreamarro/repo-backups/elabtutor` | inspect |
| llmwiki / karpathy-skills | `/Users/andreamarro/elab-refs/*` | pattern only (content-gen), not runtime dep |
| Reference product research | see `docs/research/P29-REFERENCE-REQUIREMENTS-SYNTHESIS.md` | Tinkercad/Miro/Scratch-Arduino/study-AI (deep-research agent) |

## Existing P28-era docs to read before any new slice (do NOT duplicate)

`docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md`, `CLAUDE-P21-VERIFICATION-DOSSIER-20260708.md`,
`LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`, `docs/architecture/simulation-plugin-v2.md`,
`docs/{ELAB-AS-PLUGIN-CANON,ELAB-SCENE-FORGE-CANON,PRODUCT-CANON,CANON-INDEX}.md`.
