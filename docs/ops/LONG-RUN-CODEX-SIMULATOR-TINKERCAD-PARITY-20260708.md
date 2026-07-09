# Long Run Codex — Simulation Plugin Tinkercad Parity

Date: 2026-07-08
Owner: Codex only
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
Expected branch: `docs/simulation-plugin-v2-contract-20260707`

## Scope Boundary

Codex owns only the simulator track:

- Turn the current simulator work into a real path toward Tinkercad parity.
- Start from the existing ELABTutor simulator core and its components.
- Generalize and improve geometry, physics, pin connections, wire manipulation,
  drag/drop, and future LLM/AI manipulation.
- Keep every step non-regressive and test-backed.

Codex does not own in this long run:

- Plugin dropdown/navigation shell.
- LessonOS product wiring.
- General UI/UX shell cleanup.
- Deploy operations.

Those are separate work and must not be mixed into this Codex simulator run.

## Non-Negotiable Guardrails

- No push.
- No merge.
- No destructive reset.
- No clean.
- No `git add -A`.
- No new dependencies without explicit approval.
- No external deploy.
- No fake simulator behavior.
- No replacing the ELABTutor simulator with a static SVG path.
- No route or product regressions.
- Every run must update this file before stopping.
- Every code-changing run must execute focused tests for the touched area.
- `npm --prefix apps/studio run typecheck` is mandatory before any green claim.
- Full Vitest is mandatory for H+7 and for any run that changes shared simulator
  contracts, providers, scene normalization, or workbench wiring.
- Build is mandatory for H+7 and for any run that changes exported simulator
  modules, React-facing code, or docs/specs consumed by app routes.
- `git diff --check` is mandatory before stopping.
- Vendored solver drift check is mandatory before stopping:

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- If this command returns any file, stop and explain before doing anything else.
- Repository-wide lint is currently known to fail on pre-existing baseline
  issues; do not claim lint green unless full lint passes. For changed files,
  scoped ESLint must pass or the run is not green.

## Current Strict State After H+6

Completed blocks:

- H+0: simulator recovery and baseline.
- H+1: breadboard orientation contract for the verified vertical-board scene.
- H+2: pin/netlist structured mutation contract.
- H+3: editable semantic wire contract.
- H+4: PlacementEngine adapter-first extraction gate.
- H+5: honest physics provider boundary and diagnostics.
- H+6: structured manual/AI operation envelope.

Current facts that must not regress:

- AI/manual manipulation is a structured operation envelope, not DOM/canvas
  authority.
- Operation kinds are exactly: `place-component`, `move-component`,
  `rotate-component`, `connect-wire`, `delete`, `set-value`, `probe`, `run`,
  `stop`.
- Manual and AI operations must share the same validation/provider pipeline.
- Local provider supports static solving only and must refuse fake runtime
  behavior.
- FastAPI and ngspice-wasm unavailable paths must remain explicit failures with
  empty physical outputs.
- Vendored solver files under `apps/studio/sim/solver/` must remain
  byte-stable unless a dedicated solver run explicitly authorizes otherwise.
- No reintroduction of legacy `[AZIONE:...]`, `window.__ELAB_API`, direct DOM
  mutation, static SVG-only simulator state, or fake electrical output.

## Obiettivi Da Raggiungere

Questa long run non serve a "toccare il simulatore"; serve a portarlo verso una
parita verificabile con Tinkercad senza perdere rigore fisico. Ogni obiettivo
deve chiudersi con evidenza: codice, test, build, o blocker scritto.

### Obiettivo 1 - Stato Circuitale Reale

Target:

- Ogni componente visibile deve avere una rappresentazione strutturata in
  `SimulationScene`.
- Ogni pin rilevante deve essere validabile tramite vocabolario pin.
- Ogni wire deve collegare endpoint semanticamente validi, non coordinate nude.
- Ogni modifica manuale o AI deve produrre una patch di scena, non un drag DOM.

Criteri di successo:

- `validateSimulationScene` passa sulle scene verificate.
- `normalizeSimulationScene` conserva componenti, pin assignments e wires.
- I test di structured intake, Wokwi adapter, wire contract e operation contract
  passano.

### Obiettivo 2 - Geometria E Montaggio Fisico Credibili

Target:

- Breadboard, rail, terminali, colonne e orientamento devono essere falsificabili
  da fixture e test.
- La scena verificata Vol.1 cap.9 esp.6 deve restare coerente con il montaggio
  fisico previsto, inclusa breadboard verticale/manuale.
- Occupancy e pin vocabulary devono bloccare sovrapposizioni o riferimenti
  impossibili.

Criteri di successo:

- `ElabSceneEsp6`, `BreadboardOccupancy`, `ToolCanvasMontaggioLibero` e
  `SimulationPluginWorkbench` passano.
- Nessun test deve accettare solo una disposizione estetica senza stato elettrico.

### Obiettivo 3 - Wire Manipulation Pronta Per UI Reale

Target:

- I wire devono essere oggetti editabili con endpoint, colore, path e waypoints.
- Drag futuro di componenti/wire deve aggiornare la scena strutturata.
- Il path visuale non deve diventare fonte di verita elettrica.

Criteri di successo:

- `SimulationWireContract.test.ts` passa.
- Nessun nuovo codice deve usare solo SVG/DOM pixel state come output di
  simulazione.

### Obiettivo 4 - PlacementEngine Senza Secondo Canvas Giocattolo

Target:

- Il percorso verso `PlacementEngine.js` ELABTutor deve restare adapter-first.
- Nessun import runtime diretto del legacy engine dentro Studio.
- Nessun ritorno a `[AZIONE:addcomponent]` o `[AZIONE:addwire]`.

Criteri di successo:

- `SimulationPlacementEngineContract.test.ts` passa.
- Il contratto nomina sorgente, entrypoint, snapshot e patch strutturata.

### Obiettivo 5 - Fisica Onesta E Provider Espliciti

Target:

- `local` risolve solo circuiti statici supportati.
- `run` runtime deve fallire su local finche non esiste provider runtime reale.
- FastAPI/ngspice-wasm devono essere indisponibili in modo esplicito, senza fake
  currents, voltages o component states.
- Componenti non supportati devono produrre diagnostics blocker prima del solve.

Criteri di successo:

- `SimulationProviders.test.ts`, solver suite e provider capability tests
  passano.
- Ogni failure provider deve essere visibile e strutturata.

### Obiettivo 6 - AI Manipulation Senza Bypass

Target:

- AI e manuale devono usare lo stesso envelope di operazione.
- LLM non puo editare DOM, canvas, handler React, `window.__ELAB_API`, o stringhe
  legacy.
- Ogni operazione AI deve passare da validators e provider, inclusi `probe`,
  `run` e `stop`.

Criteri di successo:

- `SimulationOperationsContract.test.ts` passa.
- Il vocabolario operazioni resta finito e testato.

### Obiettivo 7 - Evidence Pack Finale H+7

Target:

- Produrre un handoff finale che permetta ad Andrea di valutare il lavoro senza
  fidarsi di claim verbali.
- Elencare pass/fail count, warning noti, file toccati, solver drift, gap
  residui e commit message suggerito.
- Separare chiaramente:
  - completato;
  - verificato;
  - non ancora Tinkercad parity;
  - bloccato da provider/fisica/UI futura.

Criteri di successo:

- Typecheck passa.
- Focused simulator suite passa.
- Solver/physics regression suite passa.
- Full Vitest passa.
- Build passa.
- Scoped ESLint sui file cambiati passa.
- `git diff --check` passa.
- Vendored solver drift check restituisce zero file.
- Runbook aggiornato con checkpoint finale.

## Mandatory Test Matrix For H+7 And Any Contract-Level Run

Run these commands from `/Users/andreamarro/ardesia-wt/tutor-ux`.

1. Focused H+6 operation contract:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

2. Focused simulator contract suite:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/WokwiDiagramAdapter.test.ts src/__tests__/ElabSceneEsp6.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/ToolCanvasMontaggioLibero.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

3. Solver and physics regression suite:

```bash
npm --prefix apps/studio run test -- src/__tests__/ElabSolver.test.ts src/__tests__/ElabSolverEsp6Rgb.test.ts src/__tests__/SolverVendoredDrift.test.ts src/__tests__/SolverCatalog.test.ts src/__tests__/PinVocabulary.test.ts src/__tests__/BreadboardOccupancy.test.ts src/__tests__/FreeAssemblyReport.test.ts src/__tests__/SimulationStepByStep.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

4. TypeScript build graph:

```bash
npm --prefix apps/studio run typecheck
```

5. Full Vitest:

```bash
npm --prefix apps/studio run test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

6. Production build:

```bash
npm --prefix apps/studio run build
```

7. Scoped ESLint for every file changed in the current run. Example for H+6:

```bash
cd apps/studio && npm exec eslint -- sim/core/simulationOperations.ts src/__tests__/SimulationOperationsContract.test.ts
```

8. Repository hygiene:

```bash
git diff --check
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

9. If any UI/canvas runtime file changes, add Playwright visual verification and
   record the viewport, route, and screenshot/result path in the checkpoint.

Hard stop rules:

- Stop if any required focused test fails.
- Stop if typecheck fails.
- Stop if full Vitest fails.
- Stop if build fails.
- Stop if vendored solver drift appears.
- Stop if a change touches more than five files in a single cycle without a
  written split plan.
- Stop if the implementation needs a new dependency; ask Andrea first.
- Stop if the run would need push, deploy, merge, reset, clean, or staging.

## Required Recovery Before Every Run

1. Read this file from top to bottom.
2. Read the latest checkpoint.
3. Verify:

```bash
pwd
git branch --show-current
git status --short
git diff --stat
```

4. Recover session history if available.
5. Read current simulator canon before changing behavior:
   - `docs/architecture/simulation-plugin-v2.md`
   - `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
   - `docs/ELAB-AS-PLUGIN-CANON.md`
   - `apps/studio/AGENTS.md`
6. Do only the next incomplete H+N block.

## Source Assets To Preserve And Generalize

Primary source path:

- `plugins/elab-tutor/src/components/simulator/`

Core assets to inspect and preserve:

- `canvas/SimulatorCanvas.jsx`
- `engine/CircuitSolver.js`
- `engine/PlacementEngine.js`
- `engine/AVRBridge.js`
- component registry
- breadboard renderer
- wire renderer
- validators
- component SVGs

Current ARDESIA-side simulator assets:

- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/sim/breadboard/`
- `apps/studio/sim/solver/`
- `apps/studio/sim/providers/`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`

## External Tools To Evaluate, Not Install

Do not add dependencies during this run. Evaluate only.

| Tool | Source | Initial use | Constraint |
| --- | --- | --- | --- |
| CircuitJS1 | https://github.com/sharpie7/circuitjs1 | Browser circuit simulation reference; possible analog behavior research | Likely adapter/reference first, not direct dependency |
| AVR8js | https://github.com/wokwi/avr8js | AVR runtime reference already aligned with Wokwi/ELABTutor direction | Existing ELABTutor AVRBridge mismatch must be documented |
| ngspice | https://ngspice.sourceforge.io/ | Real SPICE provider target for analog/mixed-signal solving | Provider boundary only; no browser fake fallback |
| Wokwi Custom Chips WASM | https://docs.wokwi.com/guides/custom-chips-to-wasm | Component/provider extensibility model | Research adapter shape only |
| Wokwi Chips API | https://docs.wokwi.com/chips-api/getting-started | Sensor/chip pin/model contract reference | Research adapter shape only |

## H+0 — Simulator Recovery And Baseline

Goal: make the simulator state explicit before changing anything.

Tasks:

- Map ELABTutor simulator files and current ARDESIA simulator files.
- Identify existing tests covering solver, placement, wires, breadboard geometry,
  providers, and workbench.
- Identify gaps between current workbench and ELABTutor simulator core.
- Run a focused baseline that does not take the whole night.
- Write checkpoint H+0.

Suggested commands:

```bash
rg -n "class CircuitSolver|PlacementEngine|AVRBridge|SimulatorCanvas|WireRenderer|Breadboard" plugins/elab-tutor/src/components/simulator apps/studio/sim apps/studio/src
npm --prefix apps/studio run typecheck
npm --prefix apps/studio test -- ElabSolver SolverVendoredDrift SimulationProviders ToolCanvasMontaggioLibero SimulationPluginWorkbench --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Current simulator architecture mapped.
- Baseline result recorded.
- H+1 prompt written.

## H+1 — Geometry And Breadboard Orientation Contract

Goal: make book/manual geometry and physical board orientation falsifiable.

Tasks:

- Inspect `apps/studio/sim/breadboard/` and existing fixture geometry.
- Inspect known mismatch: volume/cap.9 RGB-style vertical breadboard case.
- Add or prepare a failing/pending test for explicit breadboard orientation in
  verified scenes.
- Do not hack the renderer unless a small test-backed patch is obvious.

Exit criteria:

- Geometry/orientation acceptance test or documented blocker.
- No broad renderer rewrite.
- H+2 prompt written.

## H+2 — Pin And Netlist Manipulation Contract

Goal: every placed part and wire must map to pins/nets, not pixels.

Tasks:

- Audit pin vocabulary, occupancy, solver catalog, and scene normalization.
- Add tests that prove free placements and wires update structured state.
- Block static-only canvas mutations from being considered simulator-ready.

Exit criteria:

- Test coverage improved for pin/netlist mutations.
- No fake electrical state introduced.
- H+3 prompt written.

## H+3 — Wire Manipulation Path

Goal: define and begin the path for manipulable wires.

Tasks:

- Inspect ELABTutor wire renderer/interaction model.
- Compare with `SimulationScene` wire path model.
- Add a small adapter or spec/test for wire endpoints, colors, waypoints, and
  node semantics.
- Keep UI changes minimal unless directly needed for a testable wire behavior.

Exit criteria:

- Wires are represented as editable semantic objects in the contract/test path.
- H+4 prompt written.

## H+4 — Drag/Drop And Placement Engine Extraction Gate

Goal: prevent a second toy canvas and point toward ELABTutor `PlacementEngine`.

Tasks:

- Inspect `PlacementEngine.js` and current ARDESIA placement/free-assembly code.
- Define the adapter seam between Simulation Plugin and placement engine.
- Add a boundary test or doc/spec that names the source engine and expected
  generalized API.

Exit criteria:

- Placement engine extraction path is concrete.
- No broad copy-paste migration.
- H+5 prompt written.

## H+5 — Physics Provider Boundary

Goal: separate local solver, future SPICE/ngspice, and unsupported physics.

Tasks:

- Audit `apps/studio/sim/providers/simulationProviders.ts`.
- Confirm local provider behavior is honest.
- Define provider diagnostics for unsupported physics.
- Evaluate CircuitJS1/ngspice/Wokwi references and record adapter direction.

Exit criteria:

- Provider path documented/tested enough that fake fallback is harder to add.
- H+6 prompt written.

## H+6 — LLM/AI Manipulation Contract

Goal: prepare future AI manipulation without letting AI bypass physics.

Tasks:

- Define operation vocabulary: place component, move component, rotate, connect
  wire, delete, set value, probe, run, stop.
- Ensure operations must go through the same validators and solver providers as
  manual interactions.
- Add docs/spec or a small pure operation type if it fits the current code.

Exit criteria:

- AI/LLM manipulation is framed as structured operations, not direct DOM edits.
- H+7 prompt written.

## H+7 — Full Verification And Handoff

Goal: prove no regression with a severe evidence trail and leave the next
simulator run clear.

Tasks:

- Do not change simulator behavior unless a verification failure exposes a
  small, directly related fix.
- Re-read the H+0 through H+6 checkpoints and summarize the history in the
  handoff.
- Run the full mandatory test matrix above.
- Record exact pass/fail counts, warnings, and known baseline failures.
- Confirm vendored solver files remain unchanged.
- Confirm no dependency, deploy, push, merge, staging, reset, clean, or broad
  UI shell work occurred.
- If UI/canvas changed in H+7, run Playwright visual check; otherwise explicitly
  state why Playwright was not needed.
- Write final handoff with remaining gaps to Tinkercad parity by subsystem.

Exit criteria:

- Tests/build recorded.
- Remaining gaps listed by subsystem.
- Suggested commit message written.
- Next run prompt written only if real follow-up work remains.

## Checkpoints

### H+0

Status: completed 2026-07-08 02:29 Europe/Rome

Objective:

- Recover simulator-only scope.
- Map current ELABTutor simulator assets and ARDESIA simulator assets.
- Run a focused no-regression baseline before further simulator work.

Files/docs read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap9esp6.json`

Current git state at recovery:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Existing dirty worktree from previous simulation slice: 11 modified files plus `output/`.
- This H+0 run added/updated only this runbook.

Simulator asset map:

- ELABTutor source core:
  - `NewElabSimulator.jsx` — 1340 LOC, god-component; source to mine, not plugin API.
  - `canvas/SimulatorCanvas.jsx` — 3173 LOC; real canvas, drag/drop/selection/wire handling surface.
  - `canvas/WireRenderer.jsx` — 1414 LOC; routed wires, waypoints, collision avoidance, net highlight, selected-wire handles.
  - `engine/PlacementEngine.js` — 856 LOC; placement intent, occupancy, generated pin assignments, auto wiring.
  - `engine/AVRBridge.js` — 1242 LOC; AVR runtime bridge, but ATmega328p mismatch remains a product caveat.
  - `engine/CircuitSolver.js` — 2486 LOC; solver canon copied byte-identical into ARDESIA.
  - `components/registry.js` plus component SVG modules; 22-component style registry.
  - `utils/breadboardSnap.js` — 542 LOC; half/full breadboard snap and auto pin assignment.
- ARDESIA simulator side:
  - `apps/studio/sim/core/simulationScene.ts`
  - `apps/studio/sim/breadboard/*`
  - `apps/studio/sim/solver/*`
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `apps/studio/sim/freeAssembly.ts`
  - `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
  - `apps/studio/src/design/SimulationPluginWorkbench.tsx`

Existing test coverage identified:

- Solver: `ElabSolver.test.ts`, `ElabSolverEsp6Rgb.test.ts`, `SolverVendoredDrift.test.ts`, `SolverCatalog.test.ts`.
- Breadboard topology/occupancy: `BreadboardGeometry.test.ts`, `BreadboardOccupancy.test.ts`, `BreadboardCopySystem.test.ts`.
- Free assembly/pin vocabulary: `FreeAssemblyReport.test.ts`, `ToolCanvasMontaggioLibero.test.tsx`, `SimulationStepByStep.test.tsx`.
- Providers: `SimulationProviders.test.ts`.
- Scene/adapters: `StructuredSceneIntake.test.ts`, `WokwiDiagramAdapter.test.ts`, `SimulationSceneModes.test.ts`, `ElabSceneBridge.test.tsx`.
- Workbench/render harness: `SimulationPluginWorkbench.test.tsx`, `ToolCanvasEmbeddable.test.tsx`.
- Visual/structural: `VisualOverlayReport.test.ts`, `apps/studio/sim/visual/structuralGrader.test.ts`.

Focused baseline run:

```bash
npm --prefix apps/studio run typecheck
npm --prefix apps/studio test -- ElabSolver SolverVendoredDrift SimulationProviders ToolCanvasMontaggioLibero SimulationPluginWorkbench BreadboardGeometry BreadboardOccupancy FreeAssemblyReport SolverCatalog WokwiDiagramAdapter StructuredSceneIntake SimulationSceneModes --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Result:

- Typecheck: passed.
- Focused simulator suite: 13 test files passed, 67 tests passed.

Key gaps found:

- The current workbench is still a harness; the final simulator must extract/generalize ELABTutor `SimulatorCanvas`, `WireRenderer`, `PlacementEngine`, `CircuitSolver`, `AVRBridge`, registry, and snap geometry.
- `v1-cap9-esp6` fixture currently has `bb1.pose.rotationDeg: 0` and `board.orientation: "elab-volume"` despite Andrea's manual-specific note that this case uses a vertical breadboard. H+1 must make orientation/book geometry falsifiable.
- ELABTutor already has richer Tinkercad-like interaction primitives: drag/drop, undo/redo, pinAssignments, full/half breadboard snapping, routed wire waypoints, selected-wire handles, and net highlight. ARDESIA currently exposes only a smaller subset.
- `AVRBridge` remains ATmega328p-oriented and must not be sold as exact Nano R4/Renesas RA4M1 simulation.
- No new dependencies were added. No push/merge/reset/clean/staging was performed.

Next prompt:

```text
CONTINUA LA LONG RUN CODEX SIMULATOR TINKERCAD PARITY.
Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
H+0 è completato: esegui solo H+1 — Geometry And Breadboard Orientation Contract.
Codex deve lavorare SOLO sul simulatore, non su dropdown, LessonOS o UI shell.
No interferenze, no regressioni, test mirati, aggiorna checkpoint.

H+1 focus:
- ispeziona `apps/studio/sim/breadboard/`, `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap9esp6.json`, `apps/studio/sim/visual/structuralGrader.ts`, e i renderer che consumano `pose.rotationDeg`;
- rendi falsificabile il requisito di orientamento breadboard/manual figure, in particolare il caso Vol.1 cap.9 esp.6 segnalato come verticale;
- preferisci test/documentazione falsificabile a patch renderer ampia;
- non toccare shell/dropdown/LessonOS;
- esegui focused tests sull'area toccata e aggiorna questo checkpoint.
```

### H+1

Status: completed 2026-07-08 02:47 Europe/Rome

Objective:

- Make manual/breadboard orientation falsifiable for the Vol.1 cap.9 esp.6
  RGB lamp scene.
- Keep the change simulator-only and test-backed.
- Avoid broad renderer work while the extraction path is still pending.

Recovery/history:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Starting dirty state matched H+0: 11 modified files plus `output/` and this
  untracked runbook.
- AgentMemory REST was live, but no sessions matched
  `/Users/andreamarro/ardesia-wt/tutor-ux`, and no memory-linked commits matched
  this branch. Reliable history for this run is H+0 checkpoint + local git state.

Files/docs read:

- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `/Users/andreamarro/ardesia-vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `apps/studio/sim/breadboard/*`
- `apps/studio/sim/visual/structuralGrader.ts`
- `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap9esp6.json`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`
- `apps/studio/public/elab/manuals/vol1/page-074-esercizio-9-6.png`

Changes made:

- Added an orientation enum to `ElabScene.board.orientation`:
  `elab-volume`, `manual-figure-horizontal`, `manual-figure-vertical`.
- Updated `elab-scene-v2-candidate-v1cap9esp6.json`:
  - `board.orientation: "manual-figure-vertical"`
  - `board.pose.rotationDeg: 90`
  - `bb1.pose.rotationDeg: 90`
  - provenance now records that p.74 final crop is the evidence for vertical
    breadboard orientation.
- Added `manual-breadboard-vertical` as G7 in
  `checkBookConstraintsV1Cap9Esp6`.
- Added tests proving the fixture passes G1-G7 and that the old horizontal
  fallback fails the orientation constraint.

Important non-change:

- Renderer was not rewritten. Inspection showed `SimulationBoard` currently
  renders the breadboard under a fixed SVG transform and does not consume
  `board.pose.rotationDeg`/`bb1.pose.rotationDeg`. This remains an honest gap:
  `bookMatch` now catches the manual-orientation contract, while `visualMatch`
  stays `unknown` until the extracted renderer consumes authored transforms.

Verification:

```bash
npm --prefix apps/studio test -- ElabSceneEsp6 --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- RED before implementation: 1 test file failed, 3 expected failures
  (`elab-volume`, missing G7, missing `manual-breadboard-vertical`).
- GREEN after implementation: 1 test file passed, 15 tests passed.

```bash
npm --prefix apps/studio test -- ElabSceneEsp6 ElabSolverEsp6Rgb ToolCanvasEsp6 ElabBookConstraints ElabSceneEsp2 structuralGrader BreadboardGeometry BreadboardOccupancy BreadboardCopySystem --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 9 test files, 78 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
npm --prefix apps/studio test -- ElabSolver SolverVendoredDrift SimulationProviders ToolCanvasMontaggioLibero SimulationPluginWorkbench BreadboardGeometry BreadboardOccupancy FreeAssemblyReport SolverCatalog WokwiDiagramAdapter StructuredSceneIntake SimulationSceneModes ElabSceneEsp6 ToolCanvasEsp6 BreadboardCopySystem structuralGrader --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 17 test files, 101 tests.

```bash
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 145 test files passed, 1 skipped; 1338 tests passed, 5 skipped.
- jsdom printed `Not implemented: navigation to another Document`; no test
  failure.

```bash
npm --prefix apps/studio run build
```

- Passed.
- Vite emitted existing large-chunk warnings only.

Files touched by this H+1 run:

- `apps/studio/sim/elab/bookConstraints.ts`
- `apps/studio/sim/elab/elabScene.ts`
- `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap9esp6.json`
- `apps/studio/src/__tests__/ElabSceneEsp6.test.ts`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`

No new dependencies were added. No push/merge/reset/clean/staging was performed.

Next prompt:

```text
CONTINUA LA LONG RUN CODEX SIMULATOR TINKERCAD PARITY.
Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
H+0 e H+1 sono completati: esegui solo H+2 — Pin And Netlist Manipulation Contract.
Codex deve lavorare SOLO sul simulatore, non su dropdown, LessonOS o UI shell.
No interferenze, no regressioni, test mirati, aggiorna checkpoint.

H+2 focus:
- audit pin vocabulary, occupancy, solver catalog, scene normalization, and free assembly state;
- prove with tests that free placements and wires update structured state, not only pixels;
- block static-only canvas mutations from being considered simulator-ready;
- do not introduce fake electrical state;
- execute focused tests for every touched area and update this runbook before stopping.
```

### H+2

Status: completed 2026-07-08 02:56 Europe/Rome

Objective:

- Make the pin/netlist mutation contract falsifiable.
- Prove free placements become structured components + `pinAssignments`.
- Prevent static-only canvas geometry edits from being treated as simulator-ready
  electrical state.

Recovery/history:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Starting dirty state matched H+1 plus earlier simulation work; this H+2 run
  did not stage, push, merge, reset, clean, deploy, or add dependencies.
- Session-history skill was consulted. AgentMemory REST returned many sessions
  for `/Users/andreamarro/VOLUME 3` and `/Users/andreamarro/VOLUME 3/ardesia`,
  but all exposed rows had 0 observations and no session matched
  `/Users/andreamarro/ardesia-wt/tutor-ux`. Reliable history for this long run
  remains the H+0/H+1 checkpoints plus local git state.

Files/docs read or audited for H+2:

- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/sim/freeAssembly.ts`
- `apps/studio/sim/breadboard/occupancy.ts`
- `apps/studio/sim/solver/pinVocabulary.ts`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/__tests__/StructuredSceneIntake.test.ts`
- `apps/studio/src/__tests__/ToolCanvasMontaggioLibero.test.tsx`
- `apps/studio/src/__tests__/FreeAssemblyReport.test.ts`
- `apps/studio/src/__tests__/PinVocabulary.test.ts`
- `apps/studio/src/__tests__/BreadboardOccupancy.test.ts`

Audit findings:

- `analyzePinVocabulary` checks component ids/types/pins against the electrical
  registry for both `pinAssignments` and wire endpoints.
- `analyzeBreadboardOccupancy` treats exact breadboard refs in
  `pinAssignments` and wires as physical occupancies; same exact hole conflicts,
  same tie on different holes remains allowed.
- `analyzeFreeAssembly` composes occupancy + pin vocabulary and self-registers
  the solver catalog idempotently.
- `createBoardSceneWithPlacements` already writes free placements into
  structured `components` and `pinAssignments`.
- Gap found: `normalizeSimulationScene` ignored `pinAssignments`, so a pin-only
  electrical mutation could be invisible while static geometry remained enough
  to produce the same normalized scene.

Changes made:

- `SimulationSceneNormalized` now exposes optional sorted
  `pinAssignments` entries when a scene has structured pin mappings.
- `normalizeSimulationScene` includes `pinAssignments` but still excludes
  component pose and wire path geometry, so pure pixel/route edits are not
  promoted to netlist changes.
- Added tests proving:
  - pin assignments and wire endpoints appear in the normalized simulator-ready
    netlist;
  - pose-only and path-only geometry edits keep the same normalized netlist;
  - pin reassignment and wire endpoint changes alter the normalized netlist;
  - free placements add structured resistor/LED components and pin assignments
    without mutating the base scene;
  - a placement on an already occupied manual hole is caught by
    `analyzeFreeAssembly`, not hidden by a static canvas body.

Verification:

```bash
npm --prefix apps/studio test -- StructuredSceneIntake ToolCanvasMontaggioLibero --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- RED before implementation: 1 test file failed, 2 expected failures. Cause:
  normalized scenes did not include `pinAssignments`, and pin reassignment was
  invisible to the normalized contract.
- GREEN after implementation: 2 test files passed, 16 tests passed.

```bash
npm --prefix apps/studio test -- StructuredSceneIntake ToolCanvasMontaggioLibero FreeAssemblyReport BreadboardOccupancy PinVocabulary WokwiDiagramAdapter SimulationSceneModes SimulationProviders --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 8 test files, 47 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
npm --prefix apps/studio test -- ElabSolver SolverVendoredDrift SimulationProviders ToolCanvasMontaggioLibero SimulationPluginWorkbench BreadboardGeometry BreadboardOccupancy FreeAssemblyReport SolverCatalog WokwiDiagramAdapter StructuredSceneIntake SimulationSceneModes ElabSceneEsp6 ToolCanvasEsp6 BreadboardCopySystem structuralGrader PinVocabulary ElabSolverEsp6Rgb --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 18 test files, 112 tests.

```bash
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 145 test files passed, 1 skipped; 1342 tests passed, 5 skipped.
- jsdom printed `Not implemented: navigation to another Document`; no test
  failure.

```bash
npm --prefix apps/studio run build
git diff --check
```

- Build passed.
- Vite emitted existing large-chunk warnings only.
- `git diff --check` passed.

Files touched by this H+2 run:

- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/src/__tests__/StructuredSceneIntake.test.ts`
- `apps/studio/src/__tests__/ToolCanvasMontaggioLibero.test.tsx`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`

No new dependencies were added. No push/merge/reset/clean/staging was performed.

Next prompt:

```text
CONTINUA LA LONG RUN CODEX SIMULATOR TINKERCAD PARITY.
Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
H+0, H+1 e H+2 sono completati: esegui solo H+3 -- Wire Manipulation Path.
Codex deve lavorare SOLO sul simulatore, non su dropdown, LessonOS o UI shell.
No interferenze, no regressioni, test mirati, aggiorna checkpoint.

H+3 focus:
- inspect ELABTutor `canvas/WireRenderer.jsx`, `canvas/SimulatorCanvas.jsx`,
  and current `SimulationScene` wire path/endpoints model;
- define or test the semantic wire contract: endpoint refs, colors, waypoints,
  node semantics, and editability;
- prefer a small adapter/spec/test over broad UI changes;
- do not introduce static-only wire rendering as simulator-ready state;
- execute focused tests for every touched area and update this runbook before stopping.
```

### H+3

Status: completed 2026-07-08 03:03 Europe/Rome

Objective:

- Define and begin the manipulable-wire path without rewriting the UI.
- Preserve ELABTutor's proven wire semantics: endpoint refs are anchors,
  intermediate waypoints are editable, and same-net highlighting is based on
  topology/node semantics rather than pixels.
- Keep route-only edits separate from netlist normalization.

Recovery/history:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Starting dirty state matched H+2 plus prior simulation work and untracked
  `output/`.
- Session-history skill was consulted again. AgentMemory REST returned many
  sessions for `/Users/andreamarro/VOLUME 3` and
  `/Users/andreamarro/VOLUME 3/ardesia`, but the exposed rows all had 0
  observations and no row matched this worktree. Reliable history remains this
  runbook plus local git state.

Files/docs read or audited for H+3:

- `/Users/andreamarro/.codex/attachments/ad2eea47-fbff-45e4-8fc7-38fe31251728/pasted-text-1.txt`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `/Users/andreamarro/ardesia-vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `plugins/elab-tutor/src/components/simulator/canvas/WireRenderer.jsx`
- `plugins/elab-tutor/src/components/simulator/canvas/SimulatorCanvas.jsx`
- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/sim/core/wokwiDiagramAdapter.ts`
- `apps/studio/sim/elab/elabScene.ts`
- `apps/studio/sim/elab/elabSceneAdapter.ts`
- `apps/studio/sim/breadboard/simulationBreadboard.ts`

Audit findings:

- ELABTutor `WireRenderer` computes routed paths from semantic connection
  endpoints, supports explicit `waypoints`, draws locked endpoint anchors, adds
  draggable middle-waypoint handles, and inserts new waypoints by splitting
  segments.
- ELABTutor `SimulatorCanvas` uses `onConnectionAdd` for wire creation and
  `onWireUpdate` for waypoint edits; the endpoints remain pin refs, while
  middle points are the editable route.
- ELABTutor net highlight is topology-based: breadboard refs are collapsed into
  tie/rail node ids before grouping selected-wire nets.
- ARDESIA `SimulationScene` already had `SimulationWire.from/to/color/path`,
  validation for endpoints and finite paths, and Wokwi import path instructions.
  The gap was a pure contract that exposes wires as editable semantic objects
  with endpoint descriptors, locked anchors, editable waypoints, and node ids.
- `circuit-scene/1` legacy `connections[].waypoints` are still refused by
  `elabScene.ts` until seam semantics are verified. H+3 did not relax that
  fail-closed migration gate.

Changes made:

- Added the generic editable wire contract to
  `apps/studio/sim/core/simulationScene.ts`:
  - `SimulationWireEndpointDescriptor`
  - `SimulationEditableWirePoint`
  - `SimulationEditableWire`
  - `editableWiresForScene(scene)`
- `editableWiresForScene` preserves scene wire order for UI index stability.
- Breadboard terminal/rail endpoints now expose collapsed node ids using the
  existing generic breadboard parser.
- Component-pin endpoints resolve through `pinAssignments` when present, so a
  component pin anchored to a breadboard hole exposes the breadboard tie/rail
  node instead of a decorative pixel.
- Wire path points are returned as locked `anchor` points at start/end and
  editable `waypoint` points in the middle, matching ELABTutor's selected-wire
  handle model.
- Route-only edits remain outside `normalizeSimulationScene`; the editable wire
  contract exposes color/path changes separately without pretending they are a
  netlist mutation.

Tests added:

- `apps/studio/src/__tests__/SimulationWireContract.test.ts`
  - endpoints, colors, waypoint handles, locked anchors, and same-tie node ids;
  - component-pin endpoint resolution through `pinAssignments`;
  - rail endpoints sharing one rail node id across columns;
  - route/color edits excluded from netlist normalization but visible in the
    editable-wire contract.

Verification:

```bash
npm --prefix apps/studio test -- SimulationWireContract --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- RED before implementation: 1 test file failed, 3 expected failures
  (`editableWiresForScene is not a function`).
- GREEN after implementation: 1 test file passed, 3 tests passed.

```bash
npm --prefix apps/studio test -- SimulationWireContract StructuredSceneIntake WokwiDiagramAdapter SimulationSceneModes BreadboardGeometry BreadboardOccupancy FreeAssemblyReport PinVocabulary structuralGrader --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 9 test files, 46 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
npm --prefix apps/studio test -- ElabSolver SolverVendoredDrift SimulationProviders ToolCanvasMontaggioLibero SimulationPluginWorkbench BreadboardGeometry BreadboardOccupancy FreeAssemblyReport SolverCatalog WokwiDiagramAdapter StructuredSceneIntake SimulationSceneModes SimulationWireContract ElabSceneEsp6 ToolCanvasEsp6 BreadboardCopySystem structuralGrader PinVocabulary ElabSolverEsp6Rgb --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 19 test files, 115 tests.

```bash
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 146 test files passed, 1 skipped; 1345 tests passed, 5 skipped.
- jsdom printed `Not implemented: navigation to another Document`; no test
  failure.

```bash
npm --prefix apps/studio run build
git diff --check
```

- Build passed.
- Vite emitted existing large-chunk warnings only.
- `git diff --check` passed.

Files touched by this H+3 run:

- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/src/__tests__/SimulationWireContract.test.ts`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`

No UI/canvas runtime code changed, so no Playwright visual check was required.
No new dependencies were added. No push/merge/reset/clean/staging was performed.

Next prompt:

```text
CONTINUA LA LONG RUN CODEX SIMULATOR TINKERCAD PARITY.
Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
H+0, H+1, H+2 e H+3 sono completati: esegui solo H+4 -- Drag/Drop And Placement Engine Extraction Gate.
Codex deve lavorare SOLO sul simulatore, non su dropdown, LessonOS o UI shell.
No interferenze, no regressioni, test mirati, aggiorna checkpoint.

H+4 focus:
- inspect ELABTutor `engine/PlacementEngine.js` and current ARDESIA
  placement/free-assembly code;
- define the adapter boundary between Simulation Plugin operations and the
  extracted placement engine;
- add a small boundary test or spec that names the source engine and expected
  generalized API;
- prevent a second toy placement canvas;
- do not copy/paste broad ELABTutor engine code;
- execute focused tests for every touched area and update this runbook before stopping.
```

### H+4

Status: completed 2026-07-08 03:11 Europe/Rome

Objective:

- Define the drag/drop and placement extraction gate before any broad engine
  migration.
- Name the ELABTutor source `PlacementEngine.js` explicitly while keeping the
  ARDESIA side adapter-first and runtime-import-free.
- Prevent the current two-hole free-assembly path from becoming a second toy
  placement engine.

Recovery/history:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Starting dirty state matched H+3 plus prior H+0-H+2 simulation work and
  untracked `output/`.
- The goal attachment and runbook were reread before edits.
- Session-history skill was consulted for the requested history recap. Its
  preferred `memory_sessions` tool is not exposed in this environment; fallback
  AgentMemory REST at `http://localhost:3111/agentmemory/sessions?limit=20`
  returned rows for nearby `VOLUME 3`/`ardesia` sessions, all with 0
  observations and no matching row for this worktree. Reliable history remains
  this runbook plus local git state.

Files/docs read or audited for H+4:

- `/Users/andreamarro/.codex/attachments/ad2eea47-fbff-45e4-8fc7-38fe31251728/pasted-text-1.txt`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/vault/ARDESIA-MAP.md`
- `/Users/andreamarro/ardesia-vault/ARDESIA-MAP.md`
- `plugins/elab-tutor/src/components/simulator/engine/PlacementEngine.js`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/simulationStepMode.ts`
- `apps/studio/sim/freeAssembly.ts`
- `apps/studio/src/__tests__/ToolCanvasMontaggioLibero.test.tsx`
- `apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx`
- `apps/studio/src/__tests__/SimulationStepByStep.test.tsx`
- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/src/__tests__/SimulationWireContract.test.ts`
- `apps/studio/src/__tests__/StructuredSceneIntake.test.ts`

Audit findings:

- ELABTutor `PlacementEngine.js` is a semantic placement engine, not a canvas
  widget. It validates intents, builds an occupancy map from `pinAssignments`,
  resolves relative placement (`above`, `below`, `left`, `right`, `next-to`),
  places components by pin layout, and auto-wires from structured templates.
- Its useful extraction surface is `validateIntent`, `OccupancyMap`,
  `placeComponent`, and `resolveAutoWiring`.
- The legacy `resolvePlacement` path emits `[AZIONE:addcomponent]` and
  `[AZIONE:addwire]` strings and includes timing/debug details; that output is
  not an acceptable ARDESIA adapter API.
- ARDESIA free assembly is currently a narrow tap-tap two-hole flow for
  resistor/LED placements. It correctly feeds `pinAssignments` and evaluation
  circuits, but it should become a client of a generalized placement adapter
  rather than grow into a parallel engine.
- H+3's wire contract intentionally keeps route waypoints separate from the
  netlist. H+4 preserves that rule: placement snapshots include connections as
  endpoint/color records, not legacy `connections[].waypoints`.

Changes made:

- Added `apps/studio/sim/core/placementEngineContract.ts`.
- The contract names the source engine path:
  `plugins/elab-tutor/src/components/simulator/engine/PlacementEngine.js`.
- The contract records the allowed source entrypoints, adapter result format,
  allowed operation kinds, forbidden output formats, legacy source tag formats,
  and required validation pipeline:
  - `validateSimulationScene`
  - `analyzeBreadboardOccupancy`
  - `analyzePinVocabulary`
  - `activeSimulationProvider.solve`
- Added `placementSnapshotFromScene(scene)`, which projects a generic
  `SimulationScene` into `simulation-placement-snapshot/1` with copied
  components, layout, `pinAssignments`, and endpoint/color connections.
- The snapshot intentionally omits wire route waypoints so the placement gate
  does not silently reintroduce legacy `connections[].waypoints` as simulator
  state.

Tests added:

- `apps/studio/src/__tests__/SimulationPlacementEngineContract.test.ts`
  - source engine path exists and the adapter contract names its expected
    entrypoints;
  - extraction mode is `adapter-first-no-runtime-import`;
  - legacy tag strings, SVG-only mutations, and DOM-only drag state are
    forbidden output formats;
  - `placementSnapshotFromScene` deep-copies layout and `pinAssignments` into a
    structured snapshot;
  - placement results must be structured scene patches validated by the
    simulator pipeline, not `[AZIONE]` strings.

Verification:

```bash
npm --prefix apps/studio test -- SimulationPlacementEngineContract --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- RED before implementation: 1 test file failed as expected because
  `../../sim/core/placementEngineContract` did not exist.
- GREEN after implementation: 1 test file passed, 3 tests passed.

```bash
npm --prefix apps/studio test -- SimulationPlacementEngineContract ToolCanvasMontaggioLibero ToolCanvasMontaggioPersistenza SimulationStepByStep FreeAssemblyReport BreadboardOccupancy PinVocabulary SimulationWireContract StructuredSceneIntake --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 9 test files, 58 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
npm --prefix apps/studio test -- ElabSolver SolverVendoredDrift SimulationProviders ToolCanvasMontaggioLibero ToolCanvasMontaggioPersistenza SimulationStepByStep SimulationPluginWorkbench BreadboardGeometry BreadboardOccupancy FreeAssemblyReport SolverCatalog WokwiDiagramAdapter StructuredSceneIntake SimulationSceneModes SimulationWireContract SimulationPlacementEngineContract ElabSceneEsp6 ToolCanvasEsp6 BreadboardCopySystem structuralGrader PinVocabulary ElabSolverEsp6Rgb --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 22 test files, 133 tests.

```bash
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 147 test files passed, 1 skipped; 1348 tests passed, 5 skipped.
- jsdom printed `Not implemented: navigation to another Document`; no test
  failure.

```bash
npm --prefix apps/studio run build
git diff --check
```

- Build passed.
- Vite emitted existing large-chunk warnings only.
- `git diff --check` passed.

Files touched by this H+4 run:

- `apps/studio/sim/core/placementEngineContract.ts`
- `apps/studio/src/__tests__/SimulationPlacementEngineContract.test.ts`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`

No UI/canvas runtime code changed, so no Playwright visual check was required.
No new dependencies were added. No push/merge/reset/clean/staging was
performed.

Next prompt:

```text
CONTINUA LA LONG RUN CODEX SIMULATOR TINKERCAD PARITY.
Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
H+0, H+1, H+2, H+3 e H+4 sono completati: esegui solo H+5 -- Physics Provider Boundary.
Codex deve lavorare SOLO sul simulatore, non su dropdown, LessonOS o UI shell.
No interferenze, no regressioni, test mirati, aggiorna checkpoint.

H+5 focus:
- inspect ELABTutor solver/provider code and current ARDESIA simulation
  providers;
- define the boundary between scene validation, placement, and physics solving;
- ensure provider selection remains explicit and testable;
- add a small boundary test/spec if the current provider contract is too loose;
- do not alter vendored solver bytes unless a dedicated drift gate requires it;
- execute focused tests for every touched area and update this runbook before stopping.
```

### H+5

Status: completed 2026-07-08 03:20 Europe/Rome

Objective:

- Tighten the physics provider boundary so the local solver, future FastAPI
  provider hub, future ngspice/WASM path, and unsupported runtime physics remain
  explicit.
- Prevent fake fallback from treating runtime `run` mode or unsupported board
  physics as local static DC solve.
- Record external provider references as adapter direction only, without adding
  dependencies.

Recovery/history:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Starting dirty state matched H+4 plus earlier H+0-H+3 simulation work and
  untracked `output/`.
- Goal attachment had 241 lines and was read completely before edits.
- `ARCHITECT-CURRENT.md` does not exist in this worktree.
- Session-history skill was consulted. The preferred `memory_sessions` tool is
  not exposed here. AgentMemory REST returned recent sessions for
  `/Users/andreamarro/VOLUME 3` and `/Users/andreamarro/VOLUME 3/ardesia`, but
  no session matched `/Users/andreamarro/ardesia-wt/tutor-ux`. Reliable H+0-H+5
  history remains this runbook plus local git state.

Files/docs read or audited for H+5:

- `/Users/andreamarro/.codex/attachments/ad2eea47-fbff-45e4-8fc7-38fe31251728/pasted-text-1.txt`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/vault/ARDESIA-MAP.md`
- `/Users/andreamarro/ardesia-vault/ARDESIA-MAP.md`
- `apps/studio/sim/providers/simulationProviders.ts`
- `apps/studio/src/__tests__/SimulationProviders.test.ts`
- `apps/studio/sim/solver/elabSolver.ts`
- `apps/studio/sim/solver/catalog.ts`
- `apps/studio/sim/solver/pinVocabulary.ts`
- `plugins/elab-tutor/src/components/simulator/NewElabSimulator.jsx`
- `plugins/elab-tutor/src/components/simulator/engine/CircuitSolver.js`
- `plugins/elab-tutor/src/components/simulator/engine/AVRBridge.js`

External references evaluated:

- CircuitJS1: `https://github.com/sharpie7/circuitjs1`
- AVR8js: `https://github.com/wokwi/avr8js`
- ngspice: `https://ngspice.sourceforge.io/`
- Wokwi Custom Chips WASM:
  `https://docs.wokwi.com/guides/custom-chips-to-wasm`
- Wokwi Chips API: `https://docs.wokwi.com/chips-api/getting-started`

Research conclusions:

- CircuitJS1 is useful as a browser-circuit behavior reference, but its GWT/Java
  web-app shape and GPL licensing make it a reference-only path for this slice,
  not a dependency.
- AVR8js is an AVR 8-bit CPU core and explicitly requires external hardware
  simulation/glue code. This matches the existing ELABTutor `AVRBridge`, but it
  must not be advertised as exact Nano R4/Renesas RA4M1 simulation.
- ngspice consumes netlists and returns electrical quantities; it does not
  provide schematic entry. This confirms ARDESIA must keep its own scene graph
  and use ngspice only behind a provider/netlist adapter.
- Wokwi Custom Chips compile to WASM and the Chips API defines custom chip pin
  models and simulation callbacks. This is a future custom-chip provider
  packaging reference, not something to install in H+5.

Audit findings:

- `CircuitSolver.js` is the valuable local static/DC engine: it builds nets,
  handles breadboard internals, solves loads, exposes diagnostics, currents,
  and node voltages, and supports start/pause time steps for its own static
  circuit model.
- `elabSolver.ts` keeps the vendored solver byte-identical and wraps it with
  typed diagnostics, LED stress reconciliation, and deny-by-default catalog
  checks.
- `NewElabSimulator.jsx` uses `CircuitSolver` for circuit experiments and
  lazy-loads `AVRBridge` for `simulationMode: "avr"`.
- `AVRBridge.js` is explicitly an ATmega328p/avr8js bridge with GPIO, serial,
  LCD, PWM/servo, worker fallback, and pin-state callbacks.
- The existing `simulationProviders.ts` already made FastAPI and ngspice-wasm
  unavailable instead of faking results. The loose part was that local `run`
  mode was accepted as if it were a static solve, and `solveWithProvider(id,
  request)` did not enforce `id === request.provider`.

Changes made:

- Extended `apps/studio/sim/providers/simulationProviders.ts` with:
  - `ProviderMode`
  - `ProviderPhysics`
  - `ProviderDiagnostic`
  - `ProviderCapabilityProfile`
  - `PhysicsProviderAdapterReference`
  - `PHYSICS_PROVIDER_ADAPTER_REFERENCES`
  - `providerCapabilityProfile(id)`
- `SolverResult` now always includes structured `providerDiagnostics` alongside
  the existing UI-facing `diagnostics` string array.
- Local provider capability is explicit:
  - supported mode: `static`
  - target physics: `static-dc-circuit`
  - unsupported physics: runtime microcontroller, SPICE analog/transient, custom
    chip WASM.
- Local provider now refuses `mode: "run"` with blocker diagnostic instead of
  silently running a static solve.
- All providers now detect provider-selection mismatch and return a blocker
  diagnostic without currents, voltages, component states, or solver diagnostics.
- Local provider preflights component types against the electrical catalog and
  returns `provider-physics-unsupported` for unsupported local physics before
  calling the solver.
- FastAPI and ngspice-wasm unavailable results now use structured
  `provider-unavailable` diagnostics and still return empty physical outputs.
- Vendored solver files were not modified.

Tests added/updated:

- `apps/studio/src/__tests__/SimulationProviders.test.ts`
  - local provider availability includes structured provider diagnostics;
  - FastAPI and ngspice-wasm remain unavailable without fake results;
  - selected provider and request provider must match;
  - local provider refuses runtime `run` mode;
  - local provider reports unsupported Nano R4 physics before attempting solve;
  - external provider references are recorded as research direction, not
    dependencies;
  - solver exceptions remain user-visible blocker results.

Verification:

```bash
npm --prefix apps/studio test -- SimulationProviders --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- RED before implementation: 1 test file failed, 8 expected failures
  (`providerDiagnostics` missing, capability profile missing, adapter references
  missing, provider mismatch still solved locally).
- GREEN after implementation: 1 test file passed, 8 tests passed.

```bash
npm --prefix apps/studio run typecheck
```

- Passed before and after the focused suite.

```bash
npm --prefix apps/studio test -- SimulationProviders ElabSolver SolverVendoredDrift SolverCatalog PinVocabulary FreeAssemblyReport BreadboardOccupancy SimulationStepByStep SimulationPlacementEngineContract SimulationWireContract StructuredSceneIntake --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 12 test files, 70 tests.

```bash
npm --prefix apps/studio test -- ElabSolver SolverVendoredDrift SimulationProviders ToolCanvasMontaggioLibero ToolCanvasMontaggioPersistenza SimulationStepByStep SimulationPluginWorkbench BreadboardGeometry BreadboardOccupancy FreeAssemblyReport SolverCatalog WokwiDiagramAdapter StructuredSceneIntake SimulationSceneModes SimulationWireContract SimulationPlacementEngineContract ElabSceneEsp6 ToolCanvasEsp6 BreadboardCopySystem structuralGrader PinVocabulary ElabSolverEsp6Rgb --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 22 test files, 137 tests.

```bash
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 147 test files passed, 1 skipped; 1352 tests passed, 5 skipped.
- jsdom printed `Not implemented: navigation to another Document`; no test
  failure.

```bash
npm --prefix apps/studio run build
git diff --check
```

- Build passed.
- Vite emitted existing large-chunk warnings only.
- `git diff --check` passed.

Files touched by this H+5 run:

- `apps/studio/sim/providers/simulationProviders.ts`
- `apps/studio/src/__tests__/SimulationProviders.test.ts`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`

No UI/canvas runtime code changed, so no Playwright visual check was required.
No vendored solver bytes were changed. No new dependencies were added. No
push/merge/reset/clean/staging was performed.

## Session H+6 checkpoint - LLM/AI manipulation contract (2026-07-08)

Scope executed:

- Completed the H+6 block only.
- Kept scope simulator-only: no dropdown/navigation shell, LessonOS wiring,
  deploy, or general UI shell changes.
- Added a pure operation contract instead of wiring AI into canvas/DOM/runtime
  handlers.
- No new dependencies, no staging, no commit, no push, no merge, no destructive
  reset/clean.

History recap used for this run:

- H+0 recovered simulator baseline and passed typecheck plus focused simulator
  tests.
- H+1 added manual vertical breadboard orientation for Vol.1 cap.9 esp.6.
- H+2 added pin/netlist structured contract so placements update circuit state.
- H+3 added structured editable wire contract.
- H+4 added PlacementEngine extraction gate and adapter-first contract.
- H+5 added honest provider diagnostics/capability boundary and blocked fake
  runtime physics through the local static solver.
- H+6 now defines the common manual/AI operation envelope and validation path.

Findings:

- Existing ARDESIA simulator seams already expose the necessary validator and
  provider boundary:
  - `validateSimulationScene`
  - `placementSnapshotFromScene`
  - `analyzeBreadboardOccupancy`
  - `analyzePinVocabulary`
  - `providerCapabilityProfile`
  - `solveWithProvider`
- ELABTutor legacy sources still expose imperative APIs such as `addWire`,
  `moveComponent`, `setEditorCode`, direct handler calls, and legacy
  `[AZIONE:...]` patterns. H+6 intentionally does not port these as executable
  authority; it records them as forbidden bypass formats for future AI/manual
  manipulation.

Changes made:

- Added `apps/studio/sim/core/simulationOperations.ts`.
- Defined the finite operation vocabulary:
  - `place-component`
  - `move-component`
  - `rotate-component`
  - `connect-wire`
  - `delete`
  - `set-value`
  - `probe`
  - `run`
  - `stop`
- Defined `SimulationOperationEnvelope` with schema, id, actor, origin,
  target provider, provider mode, and typed operation payload.
- Defined one shared required pipeline for manual and AI operations:
  - `parse-structured-operation`
  - `authorize-operation-origin`
  - `apply-scene-patch`
  - `validateSimulationScene`
  - `placementSnapshotFromScene`
  - `analyzeBreadboardOccupancy`
  - `analyzePinVocabulary`
  - `providerCapabilityProfile`
  - `solveWithProvider`
  - `emit-diagnostics`
- Added `validateSimulationOperationEnvelope(envelope)` to reject:
  - invalid schema/actor/origin/provider fields;
  - unknown operation kinds;
  - malformed minimum payloads;
  - DOM/canvas/React handler authority keys;
  - legacy `[AZIONE:...]` strings.
- Added explicit forbidden mutation targets:
  - `dom-node`
  - `canvas-pixel`
  - `react-handler-ref`
  - `window.__ELAB_API`
  - `legacy-azione-tag`

Tests added:

- `apps/studio/src/__tests__/SimulationOperationsContract.test.ts`
  - locks the exact operation vocabulary;
  - proves every operation uses the same validator/provider pipeline;
  - accepts a structured AI placement envelope;
  - rejects direct DOM/canvas/legacy `AZIONE` mutation attempts;
  - keeps `probe`, `run`, and `stop` provider-bound;
  - asserts the operation contract stays free of React/browser runtime imports.

Verification:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- RED before implementation: failed because
  `../../sim/core/simulationOperations` did not exist.
- GREEN after implementation: 1 test file passed, 6 tests passed.
- GREEN after final lint fix: 1 test file passed, 6 tests passed.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/WokwiDiagramAdapter.test.ts src/__tests__/ElabSceneEsp6.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 7 test files, 45 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed after H+6 implementation and after final lint fix.

```bash
npm --prefix apps/studio run test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed after final H+6 patch: 148 test files passed, 1 skipped; 1358 tests
  passed, 5 skipped.
- jsdom printed `Not implemented: navigation to another Document`; no test
  failure.

```bash
npm --prefix apps/studio run build
```

- Passed after final H+6 patch.
- Vite emitted existing large-chunk warnings only.

```bash
npm exec eslint -- sim/core/simulationOperations.ts src/__tests__/SimulationOperationsContract.test.ts
```

- Passed from `apps/studio`.

```bash
npm --prefix apps/studio run lint
```

- Failed on existing repository-wide lint baseline. One H+6 unused-parameter
  issue was reported in the first lint run and was fixed; scoped lint on the two
  H+6 files then passed. Remaining global lint failures are outside the H+6
  delta and include pre-existing `any`, React hook, fast-refresh, and preserve
  caught error findings.

```bash
git diff --check
```

- Passed.

Solver/vendor checks:

- `git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components` returned no files.
- Vendored solver bytes were not changed.

Files touched by this H+6 run:

- `apps/studio/sim/core/simulationOperations.ts`
- `apps/studio/src/__tests__/SimulationOperationsContract.test.ts`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`

No UI/canvas runtime code changed, so no Playwright visual check was required.

Next prompt:

```text
CONTINUA LA LONG RUN CODEX SIMULATOR TINKERCAD PARITY -- H+7 VERIFICA TOTALE.

WORKTREE:
/Users/andreamarro/ardesia-wt/tutor-ux

STATO ATTESO:
- branch: docs/simulation-plugin-v2-contract-20260707
- H+0, H+1, H+2, H+3, H+4, H+5 e H+6 sono già completati;
- devi eseguire SOLO H+7 -- Full Verification And Handoff;
- non devi pushare, mergiare, deployare, fare staging, reset, clean o git add -A;
- non devi aggiungere dipendenze;
- non devi toccare dropdown, LessonOS, UI shell generale o deploy;
- non devi implementare nuove feature salvo patch minima per una regressione
  scoperta dai test di verifica;
- se tocchi codice, massimo 5 file per ciclo e devi rieseguire i test pertinenti
  più la full matrix.

PRIMA DI FARE QUALSIASI COSA:
1. Leggi per intero:
   - docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md
   - docs/architecture/simulation-plugin-v2.md
   - docs/product/ELABTUTOR-PLUGIN-SPEC.md
   - docs/ELAB-AS-PLUGIN-CANON.md
   - apps/studio/AGENTS.md
2. Recupera la history disponibile della sessione se gli strumenti lo
   permettono; se non disponibile, usa questo runbook e git come fonte.
3. Esegui e registra:
   - pwd
   - git branch --show-current
   - git status --short
   - git diff --stat
   - git diff --name-only
4. Leggi i diff principali H+0-H+6 abbastanza da capire cosa stai verificando:
   - simulationScene
   - wokwiDiagramAdapter
   - bookConstraints / elabScene / fixture esp6
   - simulationProviders
   - placementEngineContract
   - simulationOperations
   - test nuovi e aggiornati
   - docs architettura/prodotto aggiornati

OBIETTIVO H+7:
Verificare scientificamente che il lavoro H+0-H+6 non abbia regressioni e che
gli Obiettivi Da Raggiungere 1-7 siano davvero sostenuti da evidenze. Non basta
dire "sembra ok": devi produrre evidenza da test, build, lint scoped, drift
check e handoff.

OBIETTIVI DA VERIFICARE UNO PER UNO:
1. Stato circuitale reale:
   - componenti, pinAssignments e wires devono restare strutturati;
   - nessuna simulazione basata solo su pixel/SVG/DOM.
2. Geometria e montaggio fisico:
   - breadboard, rail, terminali, orientamento e fixture esp6 devono restare
     coerenti;
   - occupancy e pin vocabulary devono bloccare riferimenti impossibili.
3. Wire manipulation:
   - wire endpoint, colore, path e waypoint devono essere oggetti semanticamente
     editabili;
   - il path visuale non deve diventare fonte di verità elettrica.
4. PlacementEngine:
   - adapter-first, no import runtime legacy;
   - no [AZIONE:addcomponent], no [AZIONE:addwire].
5. Physics provider:
   - local static only;
   - local deve rifiutare run runtime;
   - FastAPI/ngspice-wasm devono fallire esplicitamente senza fake outputs;
   - unsupported physics deve produrre diagnostics blocker.
6. AI manipulation:
   - AI e manuale usano lo stesso operation envelope;
   - no DOM/canvas/handler/window.__ELAB_API/[AZIONE] bypass;
   - probe/run/stop restano provider-bound.
7. Evidence pack:
   - history H+0-H+7;
   - pass/fail count;
   - warning noti;
   - file toccati;
   - solver drift;
   - gap residui Tinkercad parity;
   - commit message suggerito.

COMANDI OBBLIGATORI, IN ORDINE:

1. Focus H+6 operation contract:
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

2. Focus simulator contract suite:
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/WokwiDiagramAdapter.test.ts src/__tests__/ElabSceneEsp6.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/ToolCanvasMontaggioLibero.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

3. Solver and physics regression suite:
npm --prefix apps/studio run test -- src/__tests__/ElabSolver.test.ts src/__tests__/ElabSolverEsp6Rgb.test.ts src/__tests__/SolverVendoredDrift.test.ts src/__tests__/SolverCatalog.test.ts src/__tests__/PinVocabulary.test.ts src/__tests__/BreadboardOccupancy.test.ts src/__tests__/FreeAssemblyReport.test.ts src/__tests__/SimulationStepByStep.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

4. Workbench/UI-adjacent simulator suite:
npm --prefix apps/studio run test -- src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/ToolCanvasMontaggioLibero.test.tsx src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx src/__tests__/ToolCanvasEsp6.test.tsx src/__tests__/SimulationSceneModes.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

5. TypeScript:
npm --prefix apps/studio run typecheck

6. Full Vitest, NON opzionale:
npm --prefix apps/studio run test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

7. Build production:
npm --prefix apps/studio run build

8. Full lint attempt:
npm --prefix apps/studio run lint

Nota lint:
- Il lint globale è noto come baseline potenzialmente rosso. Devi comunque
  eseguirlo e registrare il risultato.
- Se fallisce, classifica se i failure sono baseline fuori delta oppure nuovi.
- Per ogni file cambiato in H+7, scoped ESLint deve passare. Se non hai cambiato
  file codice in H+7, scoped lint deve almeno passare sui file H+6 nuovi:
  cd apps/studio && npm exec eslint -- sim/core/simulationOperations.ts src/__tests__/SimulationOperationsContract.test.ts

9. Hygiene:
git diff --check
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Il secondo comando deve produrre output vuoto. Se produce file, STOP immediato.

10. Se H+7 tocca UI/canvas runtime:
- avvia verifica Playwright;
- registra route, viewport, screenshot/result path;
- verifica visivamente assenza di blank canvas, overlap, errori console e stato
  simulatore incoerente.
Se H+7 non tocca UI/canvas runtime, scrivi esplicitamente "Playwright non
necessario: nessun runtime UI/canvas modificato in H+7".

STOP RULES:
- se un focused test fallisce, fermati, analizza causa e correggi solo se la
  patch è piccola e nel perimetro simulator;
- se typecheck fallisce, non proseguire a build come se fosse verde;
- se full Vitest fallisce, non chiudere H+7;
- se build fallisce, non chiudere H+7;
- se scoped ESLint sui file cambiati fallisce, non chiudere H+7;
- se vendored solver drift non è vuoto, non chiudere H+7;
- se serve nuova dipendenza, chiedi Andrea;
- se superi 5 file toccati nel ciclo, scrivi split plan e fermati.

HANDOFF FINALE OBBLIGATORIO:
Aggiorna questo runbook con un checkpoint H+7 che contenga:
- data/ora;
- history H+0-H+7;
- obiettivi 1-7: raggiunto / parzialmente raggiunto / non raggiunto;
- comandi eseguiti e risultati numerici;
- warning noti, inclusi jsdom navigation e Vite large chunks se presenti;
- lint globale: verde o rosso baseline, con nota scoped lint;
- vendored solver drift: deve essere zero;
- file toccati in H+7;
- perché Playwright è stato eseguito o non necessario;
- gap residui verso Tinkercad parity per: geometry, placement, wire UI,
  physics provider, runtime microcontroller, AI operations, visual workbench;
- suggested commit message;
- next prompt solo se rimane lavoro reale.

RISPOSTA FINALE ALL'UTENTE:
Breve, ma con numeri. Devi riportare:
- cosa hai verificato;
- risultati test/build/typecheck/lint;
- regressioni trovate o assenti;
- gap residui;
- path del runbook aggiornato.
```

### H+7

Status: completed 2026-07-08 09:14 Europe/Rome

Objective:

- Verify H+0 through H+6 with the full H+7 evidence matrix.
- Do not add simulator behavior unless a verification failure requires a small
  simulator-scoped fix.
- Produce a final handoff with objective status, command results, warnings,
  solver drift, residual Tinkercad parity gaps, and suggested commit message.

Recovery:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`.
- Branch: `docs/simulation-plugin-v2-contract-20260707`.
- Required docs reread before verification:
  - `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
  - `docs/architecture/simulation-plugin-v2.md`
  - `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
  - `docs/ELAB-AS-PLUGIN-CANON.md`
  - `apps/studio/AGENTS.md`
  - root `AGENTS.md`
  - `docs/vault/ARDESIA-MAP.md`
  - `apps/studio/CLAUDE.md`
- `automa/ORDERS` does not exist in this worktree.
- `session-history` skill was read, but its preferred `memory_sessions` tool is
  not exposed here. The fallback troubleshooting file referenced by the skill is
  missing on disk.
- AgentMemory REST at `http://localhost:3111/agentmemory/sessions?limit=200`
  was reachable, but returned no session with cwd
  `/Users/andreamarro/ardesia-wt/tutor-ux`. Reliable history for this handoff is
  this runbook plus local git state.

Initial state recorded:

```bash
pwd
```

- `/Users/andreamarro/ardesia-wt/tutor-ux`

```bash
git branch --show-current
```

- `docs/simulation-plugin-v2-contract-20260707`

```bash
git status --short
```

- Dirty worktree matched the H+0-H+6 simulator/documentation delta:
  16 modified tracked files, 6 untracked simulator/runbook/test files, plus
  untracked `output/`.

```bash
git diff --stat
```

- Before H+7 runbook update: 16 tracked files changed, 1874 insertions and
  237 deletions.

```bash
git diff --name-only
```

- Tracked delta before H+7 runbook update:
  - `apps/studio/sim/core/simulationScene.ts`
  - `apps/studio/sim/core/wokwiDiagramAdapter.ts`
  - `apps/studio/sim/elab/bookConstraints.ts`
  - `apps/studio/sim/elab/elabScene.ts`
  - `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap9esp6.json`
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `apps/studio/src/__tests__/ElabSceneEsp6.test.ts`
  - `apps/studio/src/__tests__/SimulationPluginWorkbench.test.tsx`
  - `apps/studio/src/__tests__/SimulationProviders.test.ts`
  - `apps/studio/src/__tests__/StructuredSceneIntake.test.ts`
  - `apps/studio/src/__tests__/ToolCanvasMontaggioLibero.test.tsx`
  - `apps/studio/src/__tests__/WokwiDiagramAdapter.test.ts`
  - `apps/studio/src/design/SimulationPluginWorkbench.tsx`
  - `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
  - `docs/architecture/simulation-plugin-v2.md`
  - `docs/product/ELABTUTOR-PLUGIN-SPEC.md`

History H+0-H+7:

- H+0 recovered simulator scope, mapped ELABTutor and ARDESIA simulator assets,
  and established the baseline.
- H+1 made the Vol.1 cap.9 esp.6 vertical breadboard/manual figure orientation
  falsifiable.
- H+2 made pin assignments part of normalized circuit state and proved free
  placements update structured components and `pinAssignments`.
- H+3 added the editable semantic wire contract with endpoint descriptors,
  node ids, color, path, and waypoint roles.
- H+4 added the adapter-first PlacementEngine extraction gate and structured
  placement snapshot.
- H+5 tightened provider capability/diagnostic boundaries and blocked fake
  runtime physics through the local static solver.
- H+6 added the finite manual/AI operation envelope and shared validation/provider
  pipeline.
- H+7 verified the full matrix and updated this evidence pack only.

Objective status:

- Obiettivo 1 - Stato circuitale reale: reached for the current contract slice.
  Evidence: `StructuredSceneIntake`, `WokwiDiagramAdapter`,
  `SimulationWireContract`, `SimulationOperationsContract`, and full Vitest pass.
- Obiettivo 2 - Geometria e montaggio fisico credibili: partially reached.
  Evidence: `ElabSceneEsp6`, `BreadboardOccupancy`, `ToolCanvasMontaggioLibero`,
  and workbench tests pass. Remaining blocker: the current visual renderer still
  does not consume the authored esp6 board/breadboard rotation; this remains a
  visual extraction gap, not a hidden pass.
- Obiettivo 3 - Wire manipulation pronta per UI reale: partially reached.
  Evidence: semantic editable wire contract passes. Remaining gap: actual UI
  selected-wire handles and drag editing are not yet wired into the workbench.
- Obiettivo 4 - PlacementEngine senza secondo canvas giocattolo: partially
  reached. Evidence: adapter contract passes and forbids legacy `[AZIONE]`/DOM
  outputs. Remaining gap: real ELABTutor `PlacementEngine.js` extraction is not
  implemented yet.
- Obiettivo 5 - Fisica onesta e provider espliciti: reached for current provider
  boundary. Evidence: `SimulationProviders`, solver, catalog, pin vocabulary, and
  full suite pass. Remaining gap: FastAPI/ngspice/runtime providers are explicit
  unavailable paths, not implemented providers.
- Obiettivo 6 - AI manipulation senza bypass: reached as a contract. Evidence:
  operation vocabulary and validation pipeline are locked by tests. Remaining
  gap: no runtime operation executor/authorization integration yet.
- Obiettivo 7 - Evidence pack finale H+7: reached. This checkpoint records
  commands, counts, warnings, lint, drift, touched files, residual gaps, and
  suggested commit message.

Commands executed and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 1 test file, 6 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/WokwiDiagramAdapter.test.ts src/__tests__/ElabSceneEsp6.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/ToolCanvasMontaggioLibero.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 9 test files, 60 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/ElabSolver.test.ts src/__tests__/ElabSolverEsp6Rgb.test.ts src/__tests__/SolverVendoredDrift.test.ts src/__tests__/SolverCatalog.test.ts src/__tests__/PinVocabulary.test.ts src/__tests__/BreadboardOccupancy.test.ts src/__tests__/FreeAssemblyReport.test.ts src/__tests__/SimulationStepByStep.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 8 test files, 49 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/ToolCanvasMontaggioLibero.test.tsx src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx src/__tests__/ToolCanvasEsp6.test.tsx src/__tests__/SimulationSceneModes.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 5 test files, 31 tests.

```bash
npm --prefix apps/studio run typecheck
```

- First attempt failed with environmental `ENOSPC` while writing
  `apps/studio/node_modules/.tmp/tsconfig.app.tsbuildinfo`.
- Disk state at failure: `/System/Volumes/Data` was at 100% capacity with about
  203 MiB available.
- Non-source workaround applied: the two generated TypeScript build-info cache
  paths under `apps/studio/node_modules/.tmp/` were symlinked to `/dev/null`.
  No tracked source file was changed.
- Re-run passed.

```bash
npm --prefix apps/studio run test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 148 test files, 1 skipped; 1358 tests passed, 5 skipped.
- Warning observed: jsdom printed `Not implemented: navigation to another
  Document`; no test failure.

```bash
npm --prefix apps/studio run build
```

- Passed.
- Warning observed: Vite emitted existing large chunk warnings for chunks over
  500 kB.

```bash
npm --prefix apps/studio run lint
```

- Failed on known repository-wide lint baseline: 176 problems
  (171 errors, 5 warnings).
- Representative baseline categories: `no-explicit-any`, React hook compiler
  rules, fast-refresh export rules, `preserve-caught-error`, and existing
  no-useless-assignment/no-empty issues.
- No H+7 code file was changed.

```bash
npm exec eslint -- sim/core/simulationOperations.ts src/__tests__/SimulationOperationsContract.test.ts
```

- Passed from `apps/studio`.

Additional scoped delta lint:

```bash
npm exec eslint -- sim/core/simulationScene.ts sim/core/wokwiDiagramAdapter.ts sim/elab/bookConstraints.ts sim/elab/elabScene.ts sim/providers/simulationProviders.ts sim/core/placementEngineContract.ts sim/core/simulationOperations.ts src/__tests__/ElabSceneEsp6.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/SimulationProviders.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/ToolCanvasMontaggioLibero.test.tsx src/__tests__/WokwiDiagramAdapter.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/design/SimulationPluginWorkbench.tsx src/toolhost/ToolCanvasEmbeddable.tsx
```

- Passed from `apps/studio`.

```bash
git diff --check
```

- Passed with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

Files touched by H+7:

- Tracked source/code changes: none.
- Runbook updated: `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`.
- Non-tracked environment workaround: `apps/studio/node_modules/.tmp/tsconfig.app.tsbuildinfo`
  and `apps/studio/node_modules/.tmp/tsconfig.node.tsbuildinfo` now point to
  `/dev/null` because the local disk is full enough to break TypeScript
  build-info writes.

Playwright:

- Playwright not necessary: H+7 did not modify any UI/canvas runtime file.
  UI/canvas changes were pre-existing H+0-H+6 worktree deltas and were covered
  by the mandatory workbench/UI-adjacent simulator Vitest suite.

No-go confirmations:

- No push.
- No merge.
- No deploy.
- No staging.
- No `git add -A`.
- No reset.
- No clean.
- No new dependency.
- No vendored solver edit.
- No dropdown/navigation shell, LessonOS wiring, or general UI shell work in H+7.

Residual Tinkercad parity gaps:

- Geometry: esp6 manual-vertical orientation is encoded and tested, but the
  current visual renderer still does not consume the authored rotation for the
  final visual match.
- Placement: adapter-first extraction gate exists; real generalized extraction
  from ELABTutor `PlacementEngine.js`, drag/drop, rotation, duplication,
  undo/redo, and occupancy-driven placement UI remain future work.
- Wire UI: semantic editable wire objects exist; visual wire handles, endpoint
  dragging, waypoint insertion, and same-net highlight in the ARDESIA UI remain
  future work.
- Physics provider: local static DC solving is honest; FastAPI/ngspice-wasm,
  transient analog, sensors, instruments, and custom chip WASM are still explicit
  unavailable/unsupported paths.
- Runtime microcontroller: ELABTutor `AVRBridge` remains ATmega328p-oriented and
  must not be sold as exact Nano R4/Renesas RA4M1 simulation.
- AI operations: finite operation envelope and validation contract exist; actual
  operation executor, authorization, provenance, and UI/provider integration are
  not wired yet.
- Visual workbench: the current workbench is still a harness/reference surface,
  not full Tinkercad parity and not the final extracted simulator runtime.

Suggested commit message:

```text
test(simulation): verify tinkercad parity contracts h7
```

Next prompt:

```text
CONTINUA SOLO CON UNA NUOVA RUN DEDICATA SIMULATOR PARITY.
Parti dal checkpoint H+7 in docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
Scegli una slice singola e testabile tra:
1. renderer consumes authored board/breadboard rotation for esp6 visual match;
2. extracted PlacementEngine adapter proof-of-use without runtime legacy import;
3. real editable wire UI handles backed by SimulationEditableWire.
Prima di codice: verifica spazio disco, non toccare solver vendored, no push/deploy/merge/staging.
```
