# Long Run Codex - Simulation Post-it Tinkercad Parity

Date: 2026-07-08
Owner: Codex / implementation agents
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
Starting branch: `docs/simulation-plugin-v2-contract-20260707`
Source checkpoint: `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md` H+7

## Mission

Portare ARDESIA allo stato definitivo per questi assi prodotto:

- `ardesia-plugin-postit-objects`
- `simultaneous-plugin-postits`
- `responsive-plugin-functions`
- `elabtutor-postit-capabilities`
- `tinkercad-parity-simulation-postit`

La regola primaria e' una sola: il simulatore ELABTutor deve essere lo stesso
simulatore del Simulation Plugin. Non devono esistere un simulatore ELABTutor
separato, un secondo canvas, una copia semplificata, o un fork runtime.

Simulation Plugin possiede il simulatore generale: scene graph, canvas,
viewport, placement, wires, component catalog, provider, diagnostics,
persistenza, resize, multi-instance.

ELABTutor e' un pack/plugin consumer: porta manuali, lesson path, componenti
del kit, passo-passo, UNLIM, citazioni, vincoli didattici e funzioni
contestuali intorno allo stesso simulatore post-it.

## Product Target

Il plugin in ARDESIA e' un oggetto/post-it sulla lavagna, non un pannello fisso.

Ogni plugin deve:

- vivere come oggetto sulla board;
- essere spostabile e ridimensionabile;
- adattare funzioni e layout alla dimensione reale del post-it;
- mostrare strumenti contestuali quando l'utente passa o lavora nei dintorni;
- coesistere con altri plugin attivi senza collisioni di stato, DOM, eventi,
  provider, storage o shortcut;
- salvare/ripristinare il proprio stato come board object;
- non imporre dimensioni rigide predefinite quando il dominio richiede spazio
  aperto.

Il Simulation Plugin post-it deve diventare un simulatore generale verso
Tinkercad parity:

- piu' breadboard nella stessa area;
- piu' Arduino/board nella stessa area;
- componenti discreti, sensori, strumenti, probes e futuri custom chips;
- placement libero in qualunque posizione utile;
- collegamenti in qualunque vista/posizione valida;
- zoom, pan, resize, viewport, selezione, cancellazione, rotazione, duplicazione;
- wires con endpoint reali, colore, path, waypoint e node semantics;
- solver/provider dopo ogni mutazione strutturata;
- diagnostica onesta per unsupported physics, provider unavailable, overload,
  short, floating pins, polarity, missing resistor;
- nessun valore elettrico fake;
- nessuna fonte di verita' basata solo su pixel/SVG/DOM.

## Non-Negotiable Guardrails

- No push.
- No merge.
- No deploy.
- No staging unless the human explicitly asks.
- No `git add -A`.
- No destructive reset.
- No clean.
- No new npm dependencies without explicit approval.
- No fake simulator behavior.
- No static SVG-only simulator state.
- No second ELABTutor simulator.
- No direct ELABTutor runtime import from ARDESIA app code except through an
  explicit adapter contract being implemented and tested in that slice.
- No legacy `[AZIONE:...]`, `window.__ELAB_API`, DOM/canvas authority, or React
  handler authority as simulation mutation API.
- Vendored solver files under `apps/studio/sim/solver/` must remain byte-stable
  unless the slice is explicitly a dedicated solver refresh.
- Keep each code-changing cycle to max 5 files unless a written split plan is
  added before editing.
- Every code-changing cycle must run focused tests for the touched area.
- `npm --prefix apps/studio run typecheck` is mandatory before any green claim.
- Full Vitest and build are mandatory for parity-contract, workbench, provider,
  exported simulator module, or React-facing changes.
- `git diff --check` is mandatory before stopping.
- Vendored solver drift check is mandatory before stopping:

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

The command above must return no output.

## Required Recovery Before Every Session

Run from `/Users/andreamarro/ardesia-wt/tutor-ux`.

1. Read:

```text
AGENTS.md
apps/studio/AGENTS.md
docs/vault/ARDESIA-MAP.md
docs/architecture/simulation-plugin-v2.md
docs/product/ELABTUTOR-PLUGIN-SPEC.md
docs/ELAB-AS-PLUGIN-CANON.md
docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md
docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
```

2. Verify environment:

```bash
pwd
git branch --show-current
git status --short
git diff --stat
git diff --name-only
df -h .
```

3. If available, recall AgentMemory concepts:

```text
ardesia-plugin-postit-objects
simultaneous-plugin-postits
responsive-plugin-functions
elabtutor-postit-capabilities
tinkercad-parity-simulation-postit
single-simulation-plugin-runtime
elabtutor-consumes-simulation-plugin
no-elabtutor-simulator-fork
shared-tinkercad-parity-simulator
elabtutor-pack-on-simulator
```

4. Read latest checkpoint in this file.

5. Do only the next incomplete P+N block.

## Engineering Method

Apply SOLID and clean code as enforceable gates, not slogans.

Single Responsibility:

- Host post-it shell owns object lifecycle, resize, selection, hover/proximity,
  persistence and capability frame.
- Simulation runtime owns circuit scene, viewport, placement, wires, providers,
  diagnostics and simulator events.
- ELABTutor pack owns ELAB didactic content and commands, not simulator internals.

Open/Closed:

- New plugin functions are registered through typed function descriptors.
- New components/providers are added by registries/adapters, not by widening
  host switch statements.

Liskov:

- Every plugin post-it must satisfy the same post-it contract. A Simulation
  post-it and ELABTutor post-it can be mounted, resized, moved, duplicated and
  persisted through the same host object API.

Interface Segregation:

- Split APIs: `PostitObject`, `PostitViewport`, `PluginFunctionDescriptor`,
  `SimulationRuntime`, `SimulationProvider`, `ElabTutorPackContext`.
- Do not expose one giant object to all consumers.

Dependency Inversion:

- ELABTutor depends on the Simulation Plugin public API.
- The Simulation Plugin does not depend on ELABTutor lesson data.
- Host depends on plugin manifests/contracts, not implementation classes.

Clean code rules:

- Pure model functions before React state.
- Explicit TypeScript types at boundaries.
- No hidden globals.
- No module-level mutable singleton for per-post-it state.
- No God components. If a file grows because it owns two responsibilities,
  split before adding the next feature.
- Tests must verify behavior, not snapshots of implementation trivia.
- Accessibility and touch/LIM behavior are part of acceptance when UI changes.

## Architecture Target

```text
ARDESIA Board
  -> Postit Object Host
       -> plugin instance A: io.ardesia.simulation
       -> plugin instance B: io.ardesia.simulation
       -> plugin instance C: io.elab.tutor

io.ardesia.simulation
  -> SimulationRuntime
      -> SimulationScene graph
      -> viewport / zoom / pan / resize
      -> component catalog
      -> placement adapter
      -> wire editor
      -> provider dispatcher
      -> diagnostics

io.elab.tutor
  -> ELABTutorPackRuntime
      -> manual references
      -> step-by-step projections
      -> component kit filters
      -> UNLIM contextual functions
      -> common mistakes
      -> same SimulationRuntime instance contract
```

The host may render ELABTutor and Simulation Plugin as different post-it
objects, but ELABTutor must call the same Simulation Plugin runtime/API. It must
not own or fork circuit rendering/solving.

## Quality Matrix

Every completed P+N block records:

- exact files read;
- exact files changed;
- tests run with numeric pass/fail counts;
- typecheck/build result when applicable;
- scoped lint result for touched files;
- full lint result only if required or explicitly attempted;
- Playwright route/viewport/screenshot if UI/canvas changed;
- solver drift result;
- known warnings;
- product claim: reached / partially reached / blocked;
- next prompt.

Every session must end by writing the next session prompt in this file. The
prompt must itself be a long-run prompt: it must include recovery, scope,
non-negotiables, exact next P+N block, required commands, stop rules and
checkpoint requirements. Never end a session with only a generic continuation
sentence.

## P+0 - Recovery, Split, And Baseline For Post-it Parity

Goal: make the expanded target explicit before implementation.

Tasks:

- Confirm current H+7 state.
- Confirm disk space before running TypeScript/build.
- Map current board/post-it/toolhost files:
  - `apps/studio/src/Room.tsx`
  - `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
  - `apps/studio/src/toolhost/*`
  - `apps/studio/src/design/SimulationPluginWorkbench.tsx`
  - `apps/studio/plugins/simulation/manifest.ts`
  - `packs/elab-tutor/manifest.json`
- Map tests that already cover route, board embed, toolhost, workbench, and
  simulation.
- Write checkpoint P+0 in this file.

Required commands:

```bash
rg -n "ToolCanvas|post-it|postit|embed|plugin|SimulationPlugin|ELABTutor|io\\.ardesia\\.simulation|io\\.elab\\.tutor" apps/studio/src apps/studio/plugins packs/elab-tutor
npm --prefix apps/studio run test -- src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/ToolCanvasMontaggioLibero.test.tsx src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run typecheck
git diff --check
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

Exit criteria:

- Current post-it/plugin host state mapped.
- Expanded target decomposed into P+1 through P+12 with no contradictions.
- No code behavior changed.

### Session P+0 checkpoint - Recovery, split, and baseline (2026-07-08)

Status: completed 2026-07-08 11:52 Europe/Rome.

Scope:

- Executed only P+0 recovery and baseline.
- No code behavior changed.
- One runbook file changed: this checkpoint in
  `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or vendored solver edit.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text
  `/Users/andreamarro/.codex/attachments/5e303def-80f7-4a18-a5db-396063086942/pasted-text-1.txt`

Environment:

```bash
pwd
```

- `/Users/andreamarro/ardesia-wt/tutor-ux`

```bash
git branch --show-current
```

- `docs/simulation-plugin-v2-contract-20260707`

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 411 GiB used, 4.2 GiB available,
  99% capacity. Tight but sufficient for the focused P+0 commands.

Initial worktree state:

- Dirty worktree inherited from H+0-H+7 simulator parity work.
- Tracked delta before this P+0 checkpoint:
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
- Untracked inherited files:
  - `apps/studio/sim/core/placementEngineContract.ts`
  - `apps/studio/sim/core/simulationOperations.ts`
  - `apps/studio/src/__tests__/SimulationOperationsContract.test.ts`
  - `apps/studio/src/__tests__/SimulationPlacementEngineContract.test.ts`
  - `apps/studio/src/__tests__/SimulationWireContract.test.ts`
  - `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
  - `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  - `output/`
- `git diff --stat` before this runbook checkpoint: 16 tracked files changed,
  1874 insertions, 237 deletions.

H+7 state confirmed:

- H+7 in
  `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
  completed the full simulator contract matrix.
- H+7 evidence recorded:
  - focused operation contract passed: 1 file, 6 tests;
  - focused simulator contract suite passed: 9 files, 60 tests;
  - solver and physics regression suite passed: 8 files, 49 tests;
  - UI-adjacent simulator suite passed: 5 files, 31 tests;
  - typecheck passed after non-source build-info workaround;
  - full Vitest passed: 148 files, 1358 tests passed, 5 skipped;
  - build passed with existing Vite large chunk warnings;
  - repository-wide lint failed on known baseline, scoped delta lint passed;
  - `git diff --check` passed;
  - vendored solver drift check returned no files.
- H+7 residual gaps remain valid: authored esp6 rotation is encoded/tested but
  not yet consumed by the visual renderer; PlacementEngine adapter proof-of-use,
  editable wire UI handles, real provider expansion, runtime microcontroller
  fidelity, operation executor integration, and final Tinkercad parity remain
  future slices.

AgentMemory recovery:

- MCP `memory_smart_search` was not exposed in this Codex tool set, so the
  `agentmemory-rest-api` skill was used as fallback.
- REST endpoint used:

```bash
curl -sS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork","limit":10}'
```

- High-signal memories retrieved:
  - `mem_mrbvjq4t_f11e2d0abe6d`, strength 7:
    ARDESIA plugins must be board post-it objects, not fixed-size panels;
    multiple plugin post-its must run simultaneously; contextual functions
    adapt to post-it size/proximity; ELABTutor capabilities become post-it
    functions; Simulation Plugin post-it must support a real open simulator
    toward Tinkercad parity.
  - `mem_mrbvljxn_618783dd35c6`, strength 7:
    ELABTutor must use the same simulator as the Simulation Plugin; no separate
    ELABTutor simulator fork or second canvas; Simulation Plugin owns reusable
    runtime/canvas/physics/placement/wire/component model while ELABTutor
    supplies manuals, kit semantics, lesson paths, passo-passo, UNLIM, manual
    fidelity, and didactic functions.

Current host/post-it/plugin map:

- `apps/studio/src/Room.tsx`
  - `insertSimulationPlugin()` calls `buildSimulationInsert()` and appends a
    new Excalidraw embeddable element to the board.
  - Toolbar buttons insert default simulation plus mounted scenes for
    `v1-cap6-esp2`, `v1-cap6-esp3`, and `v1-cap9-esp6`.
  - `renderEmbeddable` delegates all `maestro-tool://` embeds to
    `renderToolCanvasEmbeddable()` and passes `persistEmbedState()` when the
    board is not student read-only mode.
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
  - owns current simulation embed state shape and render dispatch.
  - `nextSimulationEmbedId()` gives each new post-it a unique embed id.
  - `normalizeDuplicatedToolEmbeds()` repairs copied embeds so duplicates become
    independent instances.
  - `buildSimulationInsert()` is pure insertion logic and fail-closes for
    unsupported experiment ids instead of inventing scenes.
  - current render surface still contains simulation UI, manual card,
    passo-passo card, metrics, free-assembly placements, and solver display.
- `apps/studio/src/toolhost/caps/instance.ts`
  - defines strict `instanceId` grammar and fail-closed validation.
- `apps/studio/src/toolhost/caps/board.ts`
  - stores embed ownership in `customData[maestroTool]`.
  - `instanceOwner(toolId, instanceId)` supports `toolId#instanceId`.
  - `ToolBoard.write()` can create/update only owned embeds; ordinary teacher
    elements remain protected.
  - `persistEmbedState()` preserves the owner from the existing embed marker.
- `apps/studio/src/toolhost/simulationPluginRegistry.ts`
  - dispatches simulation embeds through a deny-by-default registry instead of
    hardcoded render ids.
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`
  - is the current standalone `?vista=simulatore` harness.
  - reads Wokwi/image/description structured sources into `SimulationScene`,
    validates/normalizes them, lists local/FastAPI/ngspice-wasm provider state,
    and embeds the existing board/free-assembly preview.
  - remains a technical harness, not the final post-it runtime.
- `apps/studio/plugins/simulation/manifest.ts`
  - declares canonical plugin id `io.ardesia.simulation`, kind `plugin`,
    version `2.0.0`, surfaces `board-embed` and `panel`, capabilities
    `board.read`, `board.write` own embeds, `graph.query`, `storage`, and `ui`,
    with `privacy.dataOut = "none"`.
- `packs/elab-tutor/manifest.json`
  - declares `io.elab.tutor` as a `pack` and depends on
    `io.ardesia.simulation >=2.0.0`.

Mapped tests already covering route, board embed, toolhost, workbench, and
simulation:

- Route/app surface:
  - `Room.integration.test.tsx`
  - `SimulationPluginWorkbench.test.tsx`
  - `SimulationPluginManifest.test.ts`
  - `simulationPluginRegistry.test.ts`
- Board embed/toolhost:
  - `ToolCanvasEmbeddable.test.tsx`
  - `ToolCanvasMontaggioLibero.test.tsx`
  - `ToolCanvasMontaggioPersistenza.test.tsx`
  - `ToolCanvasEsp2.test.tsx`
  - `ToolCanvasEsp3.test.tsx`
  - `ToolCanvasEsp6.test.tsx`
  - `ElabBoardPayload.test.ts`
  - `ElabSceneBridge.test.tsx`
  - `PluginManager.test.ts`
- Simulation contract/provider/scene:
  - `SimulationOperationsContract.test.ts`
  - `SimulationPlacementEngineContract.test.ts`
  - `SimulationWireContract.test.ts`
  - `SimulationProviders.test.ts`
  - `StructuredSceneIntake.test.ts`
  - `WokwiDiagramAdapter.test.ts`
  - `ElabSceneEsp6.test.ts`
  - `SimulationSceneModes.test.ts`
  - `SimulationStepByStep.test.tsx`
  - `SimulationSolve.test.ts`
  - `ElabScene*.test.ts`
  - `ElabSolver*.test.ts`
  - `SolverVendoredDrift.test.ts`
  - `PinVocabulary.test.ts`
  - `BreadboardOccupancy.test.ts`

Required P+0 commands and results:

```bash
rg -n "ToolCanvas|post-it|postit|embed|plugin|SimulationPlugin|ELABTutor|io\\.ardesia\\.simulation|io\\.elab\\.tutor" apps/studio/src apps/studio/plugins packs/elab-tutor
```

- Ran successfully. Output was large; terminal display was truncated after
  943 lines. Key mapped files are listed above.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/ToolCanvasMontaggioLibero.test.tsx src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 7 test files, 41 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
git diff --check
```

- Passed before this checkpoint with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

P+0 exit criteria:

- Current post-it/plugin host state mapped: reached.
- Expanded target decomposition P+1 through P+12 checked: reached, no
  contradictions found against H+7 residual gaps. P+1 starts from generic
  post-it object contract before concurrency, responsive functions, runtime API,
  viewport, multi-board model, catalog, PlacementEngine adapter proof-of-use,
  wire UI, ELABTutor function surfaces, provider/instrument boundary, and final
  evidence pack.
- No code behavior changed: reached.

Next action:

- Since P+0 is green, proceed to P+1 only.
- P+1 must stay test-first and within max 5 files for the code-changing cycle.
- Expected files:
  - create `apps/studio/src/toolhost/postitObject.ts`
  - create `apps/studio/src/__tests__/PluginPostitObject.test.ts`
  - modify a smallest host/toolhost export file only if actually required.
- Required focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/PluginPostitObject.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

## P+1 - Plugin Post-it Object Contract

Goal: define a real post-it object contract for plugins independent of
Simulation or ELABTutor details.

Target behavior:

- A plugin instance has stable `instanceId`, `pluginId`, bounds, z-order,
  selected/hover/proximity state, and serialized plugin state.
- The host can mount two instances of the same plugin without shared state.
- Resize does not hardcode domain dimensions.
- Contextual function surfaces can be hidden, compact, normal, or expanded
  based on bounds and proximity.

Likely files:

- Create `apps/studio/src/toolhost/postitObject.ts`
- Create or update `apps/studio/src/__tests__/PluginPostitObject.test.ts`
- Modify the smallest existing host/toolhost file only if needed to export the
  contract.

Required tests:

- two instances of `io.ardesia.simulation` have independent ids and state;
- bounds serialization round-trips;
- function surface mode derives from size/proximity, not plugin id;
- no plugin-specific simulator logic exists in the generic post-it model.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/PluginPostitObject.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Generic post-it contract exists and is tested.
- No Simulation or ELABTutor fork logic added.

### Session P+1 checkpoint - Plugin Post-it Object Contract (2026-07-08)

Status: completed 2026-07-08 12:00 Europe/Rome.

Scope:

- Executed only P+1 after confirming P+0 was already green in this runbook.
- Introduced a generic, host-side plugin post-it object model.
- No UI/canvas runtime changed.
- No manifest/boundary file changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or vendored solver edit.

Files read for this slice:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- `/Users/andreamarro/.codex/attachments/5e303def-80f7-4a18-a5db-396063086942/pasted-text-1.txt`
- `/Users/andreamarro/.codex/attachments/2226a877-111c-46ca-854d-1629755a9e03/pasted-text.txt`
- `apps/studio/src/toolhost/caps/instance.ts`
- Existing untracked partial files:
  - `apps/studio/src/toolhost/postitObject.ts`
  - `apps/studio/src/__tests__/PluginPostitObject.test.ts`

Files changed by P+1:

- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/__tests__/PluginPostitObject.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- `PluginPostitObject` is a pure model with stable `instanceId`, `pluginId`,
  bounds, z-index, selected/hover/proximity state, and cloned plugin state.
- `createPluginPostitObject()` validates instance id, plugin id, bounds, and
  z-index, then copies bounds and plugin state.
- `updatePluginPostitState()` updates one instance without mutating the old
  state or another post-it.
- `resizePluginPostitObject()` accepts arbitrary positive bounds and preserves
  plugin state; no domain-specific width/height is hardcoded.
- `serializePluginPostitObject()` emits a cloned persistence payload.
- `restorePluginPostitObject()` restores serialized payloads fail-closed with
  runtime validation for kind, instance id, plugin id, bounds, z-index,
  booleans, and proximity.
- `deriveFunctionSurfaceMode()` derives `hidden`, `compact`, `normal`, or
  `expanded` from size, selected/hover/proximity state, not from plugin id.
- The generic model contains no `io.ardesia.simulation`, `io.elab.tutor`,
  `Simulation`, `ELABTutor`, `CircuitSolver`, or `breadboard` branch.

Required P+1 tests:

- Two instances of `io.ardesia.simulation` have independent ids and state:
  reached.
- Bounds/state serialization and restoration round-trip: reached.
- Function surface mode derives from size/proximity, not plugin id: reached.
- No plugin-specific simulator logic exists in the generic post-it model:
  reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/PluginPostitObject.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- First baseline before added restore requirement passed: 1 test file, 5 tests.
- Red test after adding `restorePluginPostitObject` expectations failed as
  expected: 1 test file failed, 2 failed / 4 passed.
- Final run passed: 1 test file, 6 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/PluginPostitObject.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationWireContract.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 6 test files, 32 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- src/toolhost/postitObject.ts src/__tests__/PluginPostitObject.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

Playwright:

- Not run. P+1 changed only a pure TypeScript model/test and this runbook; no
  rendered UI/canvas/runtime behavior changed.

Known warnings and residual risk:

- Disk remains tight at about 3.0 GiB free on `/System/Volumes/Data`; the
  previous non-source TypeScript build-info symlink workaround is still relied
  on.
- Repository-wide lint was not rerun in P+1 because the known baseline failure
  is unrelated and scoped lint on touched code passed.
- P+1 proves the post-it object model only; it does not yet render concurrent
  plugin post-its or prove event/provider isolation in React. That is P+2.

Product claim:

- `ardesia-plugin-postit-objects`: partially reached at pure model level.
- `simultaneous-plugin-postits`: prepared but not yet reached in render/event
  behavior.
- `responsive-plugin-functions`: prepared at mode-derivation level; descriptor
  surfaces remain P+3.
- `elabtutor-postit-capabilities`: not touched in P+1.
- `tinkercad-parity-simulation-postit`: not advanced directly in P+1 except by
  establishing the host object contract needed for resizable simulator post-its.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Recupera, se disponibile, memoria per:
  ardesia-plugin-postit-objects,
  simultaneous-plugin-postits,
  responsive-plugin-functions,
  elabtutor-postit-capabilities,
  tinkercad-parity-simulation-postit,
  single-simulation-plugin-runtime,
  no-elabtutor-simulator-fork.

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+2 - Simultaneous Plugin Post-its.

Obiettivo P+2:
- provare che piu' plugin post-it possano essere attivi insieme senza collisioni
  di stato, eventi, provider o DOM;
- provare due Simulation post-it indipendenti;
- provare un ELABTutor consumer post-it accanto a un Simulation post-it;
- assicurare che keyboard/hover/proximity siano instance-scoped;
- assicurare che provider diagnostics e solver outputs siano associati
  all'istanza corretta;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio obbligatorio:
- Test-first.
- Parti dal contratto P+1 in apps/studio/src/toolhost/postitObject.ts.
- Crea un test dedicato, preferibilmente
  apps/studio/src/__tests__/PluginPostitConcurrency.test.tsx oppure .test.ts se
  il modello puro basta.
- Usa helper puri o registry/host minimale solo se necessario.
- Non introdurre nuove dipendenze.
- Non spostare o riscrivere ToolCanvasEmbeddable se bastano contratti puri.

Required tests:
- render/model di due simulation post-it: mutare una istanza non cambia l'altra;
- Simulation post-it + ELABTutor consumer post-it: function/proximity state
  resta separato;
- nessun duplicate DOM id o id di controllo per istanze diverse, se UI viene
  renderizzata;
- nessun mutable singleton globale usato per stato per-instance;
- diagnostics/provider output sono agganciati a instanceId corretto.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/PluginPostitConcurrency.test.tsx src/__tests__/PluginPostitObject.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Se scegli .test.ts invece di .test.tsx, usa il nome file corretto nel comando.

Gate obbligatori prima di claim verde:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+2 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+2 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+2.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+2 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+3.
```

## P+2 - Simultaneous Plugin Post-its

Goal: prove multiple plugin post-its can be active at the same time without
state, event, or provider collisions.

Target behavior:

- Two simulation post-its can mount with independent scenes.
- One ELABTutor post-it and one Simulation post-it can coexist.
- Keyboard/hover/proximity state is instance-scoped.
- Provider diagnostics and solver outputs are attached to the correct instance.

Likely files:

- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/toolhost/*registry*` or current plugin registry file
- `apps/studio/src/__tests__/PluginPostitConcurrency.test.tsx`

Required tests:

- render two simulation post-its, mutate one, assert the other is unchanged;
- render ELABTutor consumer post-it beside Simulation post-it, assert both keep
  separate function surfaces;
- no duplicate DOM ids for instance-specific controls;
- no global mutable singleton used for per-instance simulation state.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/PluginPostitConcurrency.test.tsx src/__tests__/SimulationPluginWorkbench.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Simultaneous plugin instances are proven by tests.
- Any old shared-state path is documented or removed.

### Session P+2 checkpoint - Simultaneous Plugin Post-its (2026-07-08)

Status: completed 2026-07-08 12:08 Europe/Rome.

Scope:

- Executed only P+2 after recovering the P+0/P+1 runbook state and H+7
  simulator parity handoff.
- Added a pure concurrency helper layer on top of the P+1
  `PluginPostitObject` contract.
- No React render path, board canvas, Simulation workbench runtime, provider
  implementation, ELABTutor pack/runtime, or vendored solver file was changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or broad refactor occurred.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/__tests__/PluginPostitObject.test.ts`
- `apps/studio/src/toolhost/caps/instance.ts`
- `apps/studio/sim/providers/simulationProviders.ts`
- `apps/studio/src/__tests__/SimulationProviders.test.ts`
- local skill docs:
  - `/Users/andreamarro/VOLUME 3/.agents/skills/recall/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/agentmemory-rest-api/SKILL.md`

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0/P+1 with simulator contract,
  provider, workbench, post-it object, runbook, and untracked `output/` files.

```bash
git diff --stat
```

- Before P+2 edits: 16 tracked files changed, 1874 insertions and 237
  deletions.

```bash
git diff --name-only
```

- Before P+2 edits, tracked delta:
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

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 411 GiB used, 3.1 GiB available,
  100% capacity. Tight but enough for P+2 focused tests and typecheck.

AgentMemory recovery:

- `memory_smart_search` was not exposed as an MCP tool in this Codex tool set,
  so the `agentmemory-rest-api` skill was used as fallback.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: Andrea directive that ARDESIA plugins must be
    board post-it objects, not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: Andrea clarification that the ELABTutor
    simulator must be the same simulator as the Simulation Plugin.
- Direct `/agentmemory/observations/<id>` detail endpoint returned 404 for both
  ids, so no additional memory detail was inferred beyond the search result and
  the P+0 checkpoint narrative.

Files changed by P+2:

- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/__tests__/PluginPostitConcurrency.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `updatePluginPostitCollectionState()` so a state patch targets exactly
  one `instanceId`, clones the new plugin state, preserves untouched object
  identity for other instances, and fails closed on unknown/malformed instance
  ids.
- Added `updatePluginPostitCollectionInteraction()` so selected/hover/proximity
  updates are scoped to exactly one post-it instance.
- Added `pluginPostitControlIds()` to generate deterministic instance-specific
  root, keyboard scope, hover scope, proximity scope, function surface,
  provider diagnostics, and solver output ids. This is a pure id contract for
  future UI rendering and prevents duplicated DOM/control ids across instances.
- Added `scopePluginPostitProviderOutput()` so provider diagnostics and solver
  output payloads are tagged with the owning `instanceId` and `pluginId` before
  they are stored in plugin state.
- Kept the generic model free of Simulation/ELABTutor branches and free of
  module-level mutable per-instance state.

Required P+2 tests:

- Two simulation post-its: mutating one instance does not change the other:
  reached.
- Simulation post-it plus ELABTutor consumer post-it: function/hover/proximity
  state remains separated: reached.
- No duplicate DOM/control id for different instances: reached through the pure
  `pluginPostitControlIds()` contract.
- No mutable singleton global for per-instance state: reached by source guard
  and pure helper behavior.
- Diagnostics/provider output attached to correct `instanceId`: reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/PluginPostitConcurrency.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- RED before implementation: 1 test file failed, 4 failed / 1 passed. Missing
  helpers were:
  - `updatePluginPostitCollectionState`
  - `updatePluginPostitCollectionInteraction`
  - `pluginPostitControlIds`
  - `scopePluginPostitProviderOutput`
- GREEN after implementation: 1 test file passed, 5 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/PluginPostitObject.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 3 test files, 17 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- src/toolhost/postitObject.ts src/__tests__/PluginPostitConcurrency.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed before this checkpoint with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed before this checkpoint with no output. Vendored solver drift is zero.

Playwright:

- Not run. P+2 stayed model-only/pure TypeScript: it added no rendered UI,
  canvas runtime, DOM renderer, route, provider implementation, or layout CSS.
  Duplicate DOM/control ids are covered at the pure id-contract level; visual
  nonblank/no-overlap verification belongs to the first slice that renders these
  ids in UI.

Known warnings and residual risk:

- Disk remains very tight at about 3.1 GiB free; future full Vitest/build
  slices may hit the same TypeScript build-info disk pressure recorded in H+7.
- P+2 proves concurrency at model/contract level only. It does not yet mount
  multiple rendered plugin post-its in React, attach keyboard listeners in the
  real board, or dispatch live provider calls through a runtime host.
- Provider output tagging is a host-side contract; real Simulation Runtime API
  attachment remains P+4.
- ELABTutor remains a consumer in the model test, not yet a rich function
  surface with declared capabilities. That is P+10 after responsive functions
  and single runtime contracts.

Product claim:

- `ardesia-plugin-postit-objects`: strengthened; model now supports collection
  updates, instance control ids, and scoped provider outputs.
- `simultaneous-plugin-postits`: reached at pure model/contract level.
- `responsive-plugin-functions`: prepared but not yet reached; P+2 only proves
  `deriveFunctionSurfaceMode()` remains instance-scoped.
- `elabtutor-postit-capabilities`: not implemented; coexistence with a
  Simulation post-it is proven at model level only.
- `tinkercad-parity-simulation-postit`: advanced indirectly by proving
  multi-instance isolation needed for simulator post-its; no new simulator
  physics/placement/wire UI was added.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+3 - Responsive Plugin Function Surfaces.

Obiettivo concreto P+3:
- modellare le funzioni contestuali dei plugin come descriptor dati, non if/else
  per plugin;
- derivare superfici hidden/compact/normal/expanded da bounds, selected, hover e
  proximity per singola istanza;
- provare che small post-it mostra controlli compatti, medium mostra funzioni
  primarie, large mostra workspace/funzioni complete;
- provare che proximity/hover rivela azioni contestuali senza rubare focus o
  stato alle altre istanze;
- provare che ELABTutor puo' dichiarare funzioni manuali, componenti,
  passo-passo, UNLIM e simulatore come consumer del Simulation Plugin;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+1/P+2 in apps/studio/src/toolhost/postitObject.ts.
- Crea un test dedicato:
  apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts
- Crea un helper puro, preferibilmente:
  apps/studio/src/toolhost/pluginFunctions.ts
- Non spostare o riscrivere ToolCanvasEmbeddable se bastano contratti puri.
- Non introdurre nuove dipendenze.

Required tests:
- stesso function descriptor produce hidden/compact/normal/expanded in base a
  bounds/proximity/selected/hover dell'istanza;
- proximity rivela azioni contestuali mentre post-it non vicini restano quiet;
- descriptors sono dati, non switch hardcoded per plugin;
- ELABTutor dichiara funzioni manuali, componenti, passo-passo, UNLIM,
  simulatore;
- la funzione simulatore di ELABTutor dipende da io.ardesia.simulation e non da
  solver/canvas/breadboard interni;
- nessun mutable singleton globale per stato funzioni per-instance.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/PluginPostitObject.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+3 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+3 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+3.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+3 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+4.
```

## P+3 - Responsive Plugin Function Surfaces

Goal: plugin functions appear contextually and adapt to post-it size without
hardcoded fixed panel assumptions.

Target behavior:

- Function surfaces derive from `bounds`, `proximity`, `selected`, and
  plugin-declared functions.
- Small post-it: compact controls.
- Medium post-it: primary controls and diagnostics.
- Large post-it: full domain workspace.
- Near/hover state can show contextual affordances without stealing focus from
  other plugin instances.

Likely files:

- Create `apps/studio/src/toolhost/pluginFunctions.ts`
- Create `apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts`
- Modify post-it host render file only if a minimal integration is needed.

Required tests:

- same function descriptor produces compact/normal/expanded surfaces depending
  on bounds;
- proximity reveals contextual actions while non-near post-its remain quiet;
- descriptors are data, not hardcoded if/else per plugin;
- ELABTutor can declare functions: manuali, componenti, passo-passo, UNLIM,
  simulatore.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/ResponsivePluginFunctions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Responsive function model is pure and tested.
- No UI clutter or text-only explanation panel added as substitute for function
  behavior.

### Session P+3 checkpoint - Responsive Plugin Function Surfaces (2026-07-08)

Status: completed 2026-07-08 12:16 Europe/Rome.

Scope:

- Executed only P+3 after recovering the local P+2 checkpoint.
- Added a pure plugin function descriptor/surface model.
- Added tests for responsive function surfaces, contextual reveal behavior,
  descriptor-as-data discipline, ELABTutor consumer function declarations, and
  no mutable singleton function state.
- No React render path, board canvas, Simulation workbench runtime,
  ToolCanvasEmbeddable, provider implementation, ELABTutor pack/runtime, or
  vendored solver file was changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`

Worktree isolation:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
git rev-parse --show-superproject-working-tree 2>/dev/null || true
```

- `GIT_DIR=/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
- `GIT_COMMON=/Users/andreamarro/VOLUME 3/ardesia/.git`
- `BRANCH=docs/simulation-plugin-v2-contract-20260707`
- No superproject path.
- Result: already in an isolated linked worktree; no new worktree was created.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/31fc03d9-2c66-4b98-97b9-ccec90c47ca9/pasted-text.txt`
- local skill docs:
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/executing-plans/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-git-worktrees/SKILL.md`
- Existing P+1/P+2 files:
  - `apps/studio/src/toolhost/postitObject.ts`
  - `apps/studio/src/__tests__/PluginPostitObject.test.ts`
  - `apps/studio/src/__tests__/PluginPostitConcurrency.test.ts`

Prompt/source reconciliation:

- The attached prompt includes the full long-run plan and P+2 history, but its
  final "Immediate Next Prompt" block still points to P+2.
- The local runbook checkpoint at
  `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  marks P+2 completed and gives P+3 as the next prompt.
- P+3 was executed because the runbook itself requires using the latest
  checkpoint and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0/P+2 plus unrelated product-doc
  changes. P+3 did not modify the unrelated product docs.

```bash
git diff --stat
```

- Before P+3 edits: 18 tracked files changed, 1893 insertions and 248
  deletions.

```bash
git diff --name-only
```

- Before P+3 edits, tracked delta:
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
  - `docs/product/TEACHER-DASHBOARD-SPEC.md`
  - `docs/product/UI-UX-DESIGN-DIRECTION.md`

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 411 GiB used, 3.1 GiB available,
  100% capacity. Tight but enough for P+3 focused tests and typecheck.

AgentMemory recovery:

- `memory_smart_search` was not exposed as an MCP tool in this Codex tool set,
  so the `agentmemory-rest-api` REST endpoint was used again.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: Andrea directive that ARDESIA plugins must be
    board post-it objects, not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: Andrea clarification that the ELABTutor
    simulator must be the same simulator as the Simulation Plugin.

Files changed by P+3:

- `apps/studio/src/toolhost/pluginFunctions.ts`
- `apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `PluginFunctionDescriptor` as a pure data descriptor with id, label,
  priority, optional dependency metadata, and per-mode presentations.
- Added `derivePluginFunctionSurface(postit, descriptors)`.
- The surface mode is derived from the existing P+1/P+2 post-it state via
  `deriveFunctionSurfaceMode(postit)`.
- `hidden` surfaces return `quiet: true` and no functions.
- `compact`, `normal`, and `expanded` surfaces select only descriptors that
  declare a presentation for the current mode, then sort by `priority` and id.
- The helper contains no plugin-id switch, no Simulation/ELABTutor hardcoded
  branch, no solver/canvas/breadboard import, and no module-level mutable
  per-instance state.

Required P+3 tests:

- Same descriptor produces hidden/compact/normal/expanded from instance
  bounds/proximity/selected/hover: reached.
- Proximity reveals contextual actions while non-near post-its remain quiet:
  reached.
- Descriptors are data, not switch branches per plugin: reached through a
  source guard.
- ELABTutor can declare manuali, componenti, passo-passo, UNLIM, and simulatore
  functions as data descriptors in the test harness: reached.
- ELABTutor simulator function depends on `io.ardesia.simulation` and not on
  solver/canvas/breadboard internals: reached through descriptor metadata and
  source guard.
- No mutable singleton global for function state: reached through source guard.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/ResponsivePluginFunctions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before helper existed: 1 failed suite, module
  `../toolhost/pluginFunctions` missing.
- Stub RED after adding only the type/module shell: 1 test file failed,
  3 failed / 2 passed. Failures were behavioral: compact/near/expanded surfaces
  returned no functions.
- GREEN after implementation: 1 test file passed, 5 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/PluginPostitObject.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 3 test files, 16 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- src/toolhost/pluginFunctions.ts src/__tests__/ResponsivePluginFunctions.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed before this checkpoint with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed before this checkpoint with no output. Vendored solver drift is zero.

Additional untracked-file whitespace check:

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/src/toolhost/pluginFunctions.ts apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts
```

- Passed with no output.

Playwright:

- Not run. P+3 stayed model-only/pure TypeScript: it added no rendered UI,
  canvas runtime, DOM renderer, route, layout CSS, or visual behavior. The
  responsive function behavior is covered by pure descriptor/surface tests.

Known warnings and residual risk:

- Disk remains very tight at about 3.1 GiB free; future full Vitest/build
  slices may hit the same TypeScript build-info disk pressure recorded in H+7.
- The current P+3 model proves data-driven responsive function surfaces only.
  It does not render the functions in the board UI yet.
- ELABTutor functions are demonstrated as test data descriptors, not as a pack
  artifact yet. Rich ELABTutor post-it capability files remain P+10.
- The helper relies on the P+1 mode thresholds. P+5 will need to connect this
  to a real simulator viewport model.
- Two unrelated product-doc files were already dirty at recovery:
  `docs/product/TEACHER-DASHBOARD-SPEC.md` and
  `docs/product/UI-UX-DESIGN-DIRECTION.md`. P+3 did not read deeply or change
  them.

Product claim:

- `ardesia-plugin-postit-objects`: unchanged from P+2 except function surface
  derivation now consumes the post-it contract.
- `simultaneous-plugin-postits`: preserved at model level; focused regression
  test passed.
- `responsive-plugin-functions`: reached at pure descriptor/model level.
- `elabtutor-postit-capabilities`: partially prepared through data descriptors
  for manuali, componenti, passo-passo, UNLIM, and simulatore.
- `tinkercad-parity-simulation-postit`: advanced indirectly by defining the
  responsive function surface model needed for resizable simulator post-its; no
  simulator runtime parity behavior was added.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+4 - Single Simulation Runtime API.

Obiettivo concreto P+4:
- rendere eseguibile la regola del singolo simulatore;
- esporre un public Simulation Runtime API per `io.ardesia.simulation`;
- permettere a ELABTutor pack/plugin di richiedere/aprire/controllare il
  simulatore solo attraverso quell'API;
- impedire al pack di importare solver, canvas, breadboard geometry,
  PlacementEngine, WireRenderer o provider internals;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+1/P+2/P+3:
  apps/studio/src/toolhost/postitObject.ts
  apps/studio/src/toolhost/pluginFunctions.ts
  apps/studio/sim/core/simulationOperations.ts
  apps/studio/sim/providers/simulationProviders.ts
- Crea un test dedicato:
  apps/studio/src/__tests__/SingleSimulationRuntimeContract.test.ts
- Crea un helper puro/API contract, preferibilmente:
  apps/studio/sim/core/simulationRuntime.ts
- Non spostare o riscrivere ToolCanvasEmbeddable se bastano contratti puri.
- Non introdurre nuove dipendenze.

Required tests:
- Simulation runtime API espone scene load, operation apply, provider solve,
  diagnostics e serialization contract;
- ELABTutor manifest dipende da `io.ardesia.simulation`;
- pack boundary rifiuta import diretti di simulator internals;
- nessun `plugins/elab-tutor/src/components/simulator/*` runtime import da
  `apps/studio/src` eccetto adapter source checks esplicitamente ammessi;
- la funzione simulatore ELABTutor/consumer usa `io.ardesia.simulation` runtime
  API, non un canvas/solver privato;
- nessun mutable singleton globale per runtime per-instance.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/SingleSimulationRuntimeContract.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+4 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+4 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+4.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+4 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+5.
```

## P+4 - Single Simulation Runtime API

Goal: make the single-runtime rule executable.

Target behavior:

- `io.ardesia.simulation` exposes a public Simulation Runtime API.
- ELABTutor pack/plugin can request/open/control simulation through that API.
- Pack code cannot import solver, canvas, breadboard geometry, PlacementEngine,
  WireRenderer, or provider internals.

Likely files:

- Create `apps/studio/sim/core/simulationRuntime.ts`
- Create `apps/studio/src/__tests__/SingleSimulationRuntimeContract.test.ts`
- Update `docs/architecture/simulation-plugin-v2.md` if the public API needs to
  be named in canon.

Required tests:

- Simulation runtime API exposes scene load, operation apply, provider solve,
  diagnostics, and serialization contracts;
- ELABTutor manifest depends on `io.ardesia.simulation`;
- pack boundary rejects direct imports of simulator internals;
- no `plugins/elab-tutor/src/components/simulator/*` runtime import from
  `apps/studio/src` except the explicitly allowed adapter source checks.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/SingleSimulationRuntimeContract.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- The single simulator rule is enforced by tests.
- ELABTutor is demonstrably a consumer, not a fork.

### Session P+4 checkpoint - Single Simulation Runtime API (2026-07-08)

Status: completed 2026-07-08 12:29 Europe/Rome.

Scope:

- Executed only P+4 after recovering the local P+3 checkpoint.
- Added a pure public Simulation Runtime API contract for
  `io.ardesia.simulation`.
- Added tests for scene load, operation apply, provider solve, diagnostics,
  serialization, ELABTutor manifest dependency, pack import boundaries, app
  fork-import boundaries, and no mutable singleton runtime state.
- No React render path, canvas, board UI, ToolCanvasEmbeddable,
  SimulationPluginWorkbench, ELABTutor pack data, ELABTutor runtime, provider
  implementation, or vendored solver file was changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/1213ebd1-f6c7-4304-8963-ef979562a480/pasted-text.txt`
- Existing P+1/P+2/P+3 contract files:
  - `apps/studio/src/toolhost/postitObject.ts`
  - `apps/studio/src/toolhost/pluginFunctions.ts`
  - `apps/studio/sim/core/simulationOperations.ts`
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `packs/elab-tutor/manifest.json`
  - `apps/studio/plugins/simulation/manifest.ts`
  - `packs/elab-tutor/README.md`
  - `packs/elab-tutor/data/lesson-paths/index.js`

Prompt/source reconciliation:

- The attached prompt includes long-run history and stale immediate blocks from
  earlier slices.
- The local runbook marks P+3 completed and gives P+4 as the next incomplete
  block.
- P+4 was executed because this runbook requires using the latest checkpoint
  and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0/P+2/P+3 plus unrelated product-doc
  changes. P+4 did not modify the unrelated product docs.

```bash
git diff --stat
```

- Before P+4 edits: 18 tracked files changed, 1893 insertions and 248
  deletions.

```bash
git diff --name-only
```

- Before P+4 edits, tracked delta:
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
  - `docs/product/TEACHER-DASHBOARD-SPEC.md`
  - `docs/product/UI-UX-DESIGN-DIRECTION.md`

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 411 GiB used, 2.1 GiB available,
  100% capacity. Tight but enough for P+4 focused tests and typecheck.

AgentMemory recovery:

- `memory_smart_search` was not exposed as an MCP tool in this Codex tool set,
  so the `agentmemory-rest-api` REST endpoint was used.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+4:

- `apps/studio/sim/core/simulationRuntime.ts`
- `apps/studio/src/__tests__/SingleSimulationRuntimeContract.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added runtime constants:
  - `SIMULATION_RUNTIME_PLUGIN_ID = "io.ardesia.simulation"`
  - `SIMULATION_RUNTIME_API_VERSION = "simulation-runtime/1"`
  - `SIMULATION_RUNTIME_STATE_SCHEMA = "simulation-runtime-state/1"`
  - `SIMULATION_RUNTIME_PROVIDER_REQUEST_SCHEMA =
    "simulation-provider-request/1"`
  - `SIMULATION_RUNTIME_CAPABILITIES`
- Added public pure helpers:
  - `describeSimulationRuntimeApi()`
  - `loadSimulationRuntimeScene(input)`
  - `applySimulationRuntimeOperation(state, envelope)`
  - `solveSimulationRuntimeProvider(state, request)`
  - `readSimulationRuntimeDiagnostics(state)`
  - `serializeSimulationRuntimeState(state)`
  - `restoreSimulationRuntimeState(serialized)`
- Runtime state is explicit and per instance:
  - `instanceId`
  - `pluginId`
  - `scene`
  - `diagnostics`
  - `appliedOperations`
  - optional `lastSolverResult`
- `applySimulationRuntimeOperation` validates the shared
  `simulation-operation/1` envelope before recording an operation.
- `solveSimulationRuntimeProvider` delegates through the existing provider
  boundary with the state's scene and records the provider result on that same
  runtime instance.
- Serialization and restore are clone-based and do not mutate the caller's
  state object.

Required P+4 tests:

- Runtime API exposes scene load, operation apply, provider solve, diagnostics,
  and serialization contracts: reached.
- ELABTutor manifest depends on `io.ardesia.simulation`: reached.
- Pack boundary rejects direct imports of simulator internals: reached through
  source guard over `packs/elab-tutor`.
- No `plugins/elab-tutor/src/components/simulator/*` runtime import from
  `apps/studio/src`: reached through source guard.
- ELABTutor/consumer simulator function depends on `io.ardesia.simulation`
  runtime API rather than private canvas/solver: reached through manifest and
  descriptor-level contract test.
- No mutable singleton global for per-instance runtime: reached through source
  guard and two-runtime independence test.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SingleSimulationRuntimeContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before helper existed: 1 failed suite, 0 tests collected, module
  `../../sim/core/simulationRuntime` missing.
- GREEN after implementation: 1 test file passed, 5 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SingleSimulationRuntimeContract.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 4 test files, 24 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- sim/core/simulationRuntime.ts src/__tests__/SingleSimulationRuntimeContract.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed after this checkpoint update with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed before this checkpoint with no output. Vendored solver drift is zero.

Playwright:

- Not run. P+4 stayed model-only/pure TypeScript: it added a public runtime API
  contract and tests, but no rendered UI, canvas, route, CSS, DOM behavior, or
  visual layout changed.

Known warnings and residual risk:

- Disk remains very tight at about 2.1 GiB free; future full Vitest/build
  slices may hit the same TypeScript build-info disk pressure recorded in H+7.
- The runtime API is a pure contract and state wrapper. It does not yet render,
  open, pan, zoom, or control the simulator UI.
- Provider solve currently delegates to the existing provider boundary. Real
  runtime providers beyond local/unavailable stubs remain future slices.
- ELABTutor is proven as a manifest/descriptor consumer, but a real ELABTutor
  post-it capability artifact remains P+10.
- The source guards are text-level boundaries. They prevent known fork/import
  paths but are not a full import graph analyzer.
- Two unrelated product-doc files were already dirty at recovery:
  `docs/product/TEACHER-DASHBOARD-SPEC.md` and
  `docs/product/UI-UX-DESIGN-DIRECTION.md`. P+4 did not read deeply or change
  them.

Product claim:

- `single-simulation-plugin-runtime`: reached at public pure API contract
  level. `io.ardesia.simulation` now exposes named runtime methods and a
  per-instance state contract.
- `no-elabtutor-simulator-fork`: reached by manifest dependency tests and pack
  boundary source guards.
- `elabtutor-postit-capabilities`: still partial; consumer dependency shape is
  proven, but ELABTutor capability files are not authored yet.
- `tinkercad-parity-simulation-postit`: advanced indirectly by making a single
  runtime control surface executable in tests; viewport/workspace behavior is
  next.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md
- docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
- docs/architecture/simulation-plugin-v2.md
- docs/product/ELABTUTOR-PLUGIN-SPEC.md
- docs/ELAB-AS-PLUGIN-CANON.md

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- simulation-postit-viewport

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+5 - Simulation Post-it Viewport And Infinite Workspace.

Obiettivo concreto P+5:
- modellare un viewport interno resizable per il Simulation post-it;
- supportare pan, zoom, content bounds, fit-to-content e serializzazione;
- garantire che il resize del post-it cambi lo spazio visibile senza mutare le
  coordinate della scena;
- tenere visibili piu' board/componenti tramite operazioni viewport;
- collegare il modello al modo funzione compact/normal/expanded solo se basta
  un contratto puro;
- non riscrivere UI/canvas se il modello puro basta;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+1/P+2/P+3/P+4:
  apps/studio/src/toolhost/postitObject.ts
  apps/studio/src/toolhost/pluginFunctions.ts
  apps/studio/sim/core/simulationOperations.ts
  apps/studio/sim/core/simulationRuntime.ts
  apps/studio/sim/providers/simulationProviders.ts
- Crea un test dedicato:
  apps/studio/src/__tests__/SimulationViewport.test.ts
- Crea un helper puro/API contract, preferibilmente:
  apps/studio/sim/core/simulationViewport.ts
- Integra in SimulationPluginWorkbench solo dopo test puri verdi e solo se
  necessario.
- Non introdurre nuove dipendenze.

Required tests:
- fit-to-content include multiple breadboards and Arduino boards;
- resizing the post-it does not mutate scene coordinates;
- pan/zoom round-trips through serialized post-it state;
- small viewport selects compact function mode, large viewport selects expanded
  mode;
- viewport state is per-instance and has no mutable singleton global;
- runtime/viewport serialization can be associated with the correct
  `instanceId`.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/SimulationViewport.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+5 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+5 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+5.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+5 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+6.
```

## P+5 - Simulation Post-it Viewport And Infinite Workspace

Goal: the simulator post-it has a resizable internal workspace, not a fixed
illustration.

Target behavior:

- Internal viewport has pan, zoom, content bounds, fit-to-content, and
  serialization.
- Resize changes visible workspace and control density without corrupting scene
  coordinates.
- Multiple boards/components can remain visible through viewport operations.

Likely files:

- Create `apps/studio/sim/core/simulationViewport.ts`
- Create `apps/studio/src/__tests__/SimulationViewport.test.ts`
- Integrate into `SimulationPluginWorkbench` only after pure model tests pass.

Required tests:

- fit-to-content includes multiple breadboards and Arduino boards;
- resizing the post-it does not mutate scene coordinates;
- pan/zoom round-trips through serialized post-it state;
- small viewport selects compact function mode, large viewport selects expanded
  mode.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationViewport.test.ts src/__tests__/ResponsivePluginFunctions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- The simulator can have an open workspace model.
- No fixed-size Tinkercad substitute remains as accepted final behavior.

### Session P+5 checkpoint - Simulation Post-it Viewport And Infinite Workspace (2026-07-08)

Status: completed 2026-07-08 12:40 Europe/Rome.

Scope:

- Executed only P+5 after recovering the local P+4 checkpoint.
- Added a pure Simulation post-it viewport contract for internal pan, zoom,
  content bounds, fit-to-content, visible-world calculation, post-it bounds
  projection, serialization/restore, and runtime instance attachment.
- Added tests for fitting multiple breadboards plus an Arduino-style board,
  resize without scene-coordinate mutation, pan/zoom round-trip through
  serialized post-it state, compact/expanded function density from viewport
  size, runtime/viewport instance association, and no mutable singleton
  viewport state.
- No React render path, canvas, board UI, `SimulationPluginWorkbench`,
  `ToolCanvasEmbeddable`, ELABTutor pack/runtime, provider implementation, or
  vendored solver file was changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`

Subagent note:

- Multi-agent tools were discoverable in this Codex environment, but the local
  tool rules only allow spawning subagents when the user explicitly asks for
  delegation. P+5 was executed locally.

Worktree isolation:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
git rev-parse --show-superproject-working-tree 2>/dev/null || true
```

- `GIT_DIR=/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
- `GIT_COMMON=/Users/andreamarro/VOLUME 3/ardesia/.git`
- `BRANCH=docs/simulation-plugin-v2-contract-20260707`
- No superproject path.
- Result: already in an isolated linked worktree; no new worktree was created.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/c6f5d93c-b5a8-4dd0-a57a-c4cd1cf47bb1/pasted-text.txt`
- Local skill docs:
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/executing-plans/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-git-worktrees/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/finishing-a-development-branch/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/recall/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/agentmemory-rest-api/SKILL.md`
- Existing P+1/P+2/P+3/P+4 contract files:
  - `apps/studio/src/toolhost/postitObject.ts`
  - `apps/studio/src/toolhost/pluginFunctions.ts`
  - `apps/studio/sim/core/simulationRuntime.ts`
  - `apps/studio/sim/core/simulationScene.ts`
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `apps/studio/sim/breadboard/simulationBreadboard.ts`
  - `apps/studio/src/__tests__/SingleSimulationRuntimeContract.test.ts`
  - `apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts`
  - `apps/studio/src/__tests__/PluginPostitObject.test.ts`
  - `apps/studio/src/__tests__/StructuredSceneIntake.test.ts`

Prompt/source reconciliation:

- The attached prompt contains a stale final "Immediate Next Prompt" pointing
  back to P+2.
- The local runbook marks P+4 completed and gives P+5 as the next incomplete
  block.
- P+5 was executed because this runbook requires using the latest checkpoint
  and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0/P+4 plus unrelated product-doc
  changes. P+5 did not modify the unrelated product docs.

```bash
git diff --stat
```

- Before P+5 edits: 18 tracked files changed, 1893 insertions and 248
  deletions.

```bash
git diff --name-only
```

- Before P+5 edits, tracked delta:
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
  - `docs/product/TEACHER-DASHBOARD-SPEC.md`
  - `docs/product/UI-UX-DESIGN-DIRECTION.md`

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 409 GiB used, 3.5 GiB available,
  100% capacity. Tight but enough for P+5 focused tests and typecheck.

AgentMemory recovery:

- `memory_smart_search` was not exposed as an MCP tool in this Codex tool set,
  so the `agentmemory-rest-api` REST endpoint was used.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork simulation-postit-viewport","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+5:

- `apps/studio/sim/core/simulationViewport.ts`
- `apps/studio/src/__tests__/SimulationViewport.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added viewport constants:
  - `SIMULATION_VIEWPORT_SCHEMA = "simulation-viewport/1"`
  - `SIMULATION_RUNTIME_VIEWPORT_SCHEMA = "simulation-runtime-viewport/1"`
- Added public pure helpers:
  - `createSimulationViewportState()`
  - `fitSimulationViewportToScene()`
  - `resizeSimulationViewport()`
  - `panSimulationViewport()`
  - `zoomSimulationViewport()`
  - `visibleWorldBoundsForViewport()`
  - `serializeSimulationViewportState()`
  - `restoreSimulationViewportState()`
  - `simulationViewportPostitBounds()`
  - `attachSimulationViewportToRuntime()`
- Viewport state is explicit and per instance:
  - `instanceId`
  - `viewport` size
  - `pan`
  - `zoom`
  - measured `content.bounds`
  - measured `content.items`
- Fit-to-content measures structured `SimulationScene` components and wire
  paths. Breadboards use the shared breadboard geometry dimensions; Arduino/
  Nano/controller-style boards are separate controller-board content items;
  generic components and wire paths are also included.
- Resize updates the visible viewport size without taking or mutating a scene.
  Scene coordinates remain owned by `SimulationScene`.
- Runtime attachment fail-closes when runtime and viewport `instanceId` differ.
- The helper contains no React, canvas, DOM, provider, solver, ELABTutor pack,
  or module-level mutable per-instance state.

Required P+5 tests:

- Fit-to-content includes multiple breadboards and Arduino boards: reached.
- Resizing the post-it does not mutate scene coordinates: reached.
- Pan/zoom round-trips through serialized post-it state: reached.
- Small viewport selects compact function mode, large viewport selects expanded
  mode: reached.
- Viewport state is per-instance and has no mutable singleton global: reached.
- Runtime/viewport serialization can be associated with the correct
  `instanceId`: reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationViewport.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before helper existed: 1 failed suite, 0 tests collected, module
  `../../sim/core/simulationViewport` missing.
- GREEN after implementation: 1 test file passed, 5 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationViewport.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 3 test files, 15 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- sim/core/simulationViewport.ts src/__tests__/SimulationViewport.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed with no output. Note: P+5 added untracked files, so an additional
  whitespace check was run on the new files.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/sim/core/simulationViewport.ts apps/studio/src/__tests__/SimulationViewport.test.ts
```

- Passed with no output.

Playwright:

- Not run. P+5 stayed model-only/pure TypeScript: it added a viewport contract
  and tests, but no rendered UI, canvas, route, CSS, DOM behavior, or visual
  layout changed. Visual nonblank/no-overlap checks remain for the first slice
  that renders the viewport model.

Known warnings and residual risk:

- Disk remains tight, though P+5 had about 3.5 GiB free at recovery. Future
  full Vitest/build slices may still hit the TypeScript build-info disk pressure
  recorded in H+7/P+4.
- The viewport model is pure and not yet wired into `SimulationPluginWorkbench`
  or board rendering. It proves the contract, not live pan/zoom UI.
- Controller-board dimensions are an explicit viewport content approximation
  for fit-to-content. P+6/P+7 should replace this with a richer board/catalog
  footprint contract.
- P+5 does not yet implement multi-board scene semantics, board-scoped pin
  vocabulary, cross-board wire validation, or provider blockers for unsupported
  board physics. That is P+6.
- Two unrelated product-doc files were already dirty at recovery:
  `docs/product/TEACHER-DASHBOARD-SPEC.md` and
  `docs/product/UI-UX-DESIGN-DIRECTION.md`. P+5 did not read deeply or change
  them.

Product claim:

- `simulation-postit-viewport`: reached at pure model/API contract level.
- `responsive-plugin-functions`: preserved and connected to viewport size via
  post-it bounds projection.
- `single-simulation-plugin-runtime`: preserved; viewport attachment is scoped
  to the runtime `instanceId`.
- `tinkercad-parity-simulation-postit`: advanced indirectly by modeling an
  open, resizable workspace with pan/zoom/content bounds. No live UI parity or
  physics parity was added.
- `no-elabtutor-simulator-fork`: preserved; P+5 added no ELABTutor simulator
  path and no pack imports.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- simulation-postit-viewport
- multi-board-simulation-scene

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+6 - General Multi-board Scene Model.

Obiettivo concreto P+6:
- supportare piu' breadboard e piu' board Arduino-style nella stessa
  SimulationScene contract;
- rendere board-scoped pin vocabulary, occupancy e snap/node semantics;
- validare wire cross-board tramite endpoint semantici;
- far emergere blocker provider onesti per board/runtime physics non supportate;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+1/P+2/P+3/P+4/P+5:
  apps/studio/src/toolhost/postitObject.ts
  apps/studio/src/toolhost/pluginFunctions.ts
  apps/studio/sim/core/simulationOperations.ts
  apps/studio/sim/core/simulationRuntime.ts
  apps/studio/sim/core/simulationViewport.ts
  apps/studio/sim/core/simulationScene.ts
  apps/studio/sim/providers/simulationProviders.ts
- Crea un test dedicato:
  apps/studio/src/__tests__/SimulationMultiBoardScene.test.ts
- Modifica solo i contratti core necessari. Non integrare UI/canvas se il
  modello puro basta.
- Non introdurre nuove dipendenze.

Required tests:
- due breadboard possono coesistere senza collisioni di tie/rail node;
- due Arduino-style board hanno pin indipendenti e board-scoped;
- endpoint wire cross-board validano tramite ref semantici;
- unsupported runtime board/provider mode produce structured blocker
  diagnostics, non fake output;
- viewport fit-to-content P+5 continua a includere piu' board;
- nessun mutable singleton globale per stato multi-board per-instance.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/SimulationMultiBoardScene.test.ts src/__tests__/SimulationViewport.test.ts src/__tests__/PinVocabulary.test.ts src/__tests__/BreadboardOccupancy.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+6 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+6 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+6.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+6 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+7.
```

## P+6 - General Multi-board Scene Model

Goal: support multiple breadboards and multiple Arduino-style boards in the
same SimulationScene contract.

Target behavior:

- Scene graph accepts multiple board models with stable ids.
- Pin vocabulary and occupancy are board-scoped.
- Wires can connect across boards through semantic endpoints.
- Unsupported board physics blocks honestly instead of faking runtime output.

Likely files:

- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/sim/solver/pinVocabulary.ts`
- `apps/studio/sim/breadboard/occupancy.ts`
- `apps/studio/src/__tests__/SimulationMultiBoardScene.test.ts`

Required tests:

- two breadboards can coexist without tie/rail node collisions;
- two Arduino boards can have independent pins;
- cross-board wire endpoints validate;
- unsupported runtime board returns provider blocker diagnostics.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationMultiBoardScene.test.ts src/__tests__/PinVocabulary.test.ts src/__tests__/BreadboardOccupancy.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Multiple boards are a structured scene capability.
- Solver/provider limitations are explicit.

### Session P+6 checkpoint - General Multi-board Scene Model (2026-07-08)

Status: completed 2026-07-08 12:50 Europe/Rome.

Scope:

- Executed only P+6 after recovering the local P+5 checkpoint.
- Added an explicit pure `SimulationScene` multi-board topology contract.
- Added tests for board-scoped breadboard tie/rail node ids, independent
  Arduino-style board pin ids, semantic cross-board wire endpoint validation,
  honest local-provider blocking for two unsupported `nano-r4` runtime boards,
  P+5 viewport fit-to-content across multiple boards, and no mutable global
  multi-board state.
- No React render path, canvas, board UI, `SimulationPluginWorkbench`,
  `ToolCanvasEmbeddable`, ELABTutor pack/runtime, or vendored solver file was
  changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`

Subagent note:

- Multi-agent tools were available in this Codex environment, but local tool
  rules only allow spawning subagents when the user explicitly asks for
  delegation. P+6 was executed locally.

Worktree isolation:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
git rev-parse --show-superproject-working-tree 2>/dev/null || true
```

- `GIT_DIR=/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
- `GIT_COMMON=/Users/andreamarro/VOLUME 3/ardesia/.git`
- `BRANCH=docs/simulation-plugin-v2-contract-20260707`
- No superproject path.
- Result: already in an isolated linked worktree; no new worktree was created.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
- Local skill docs:
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/executing-plans/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-git-worktrees/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/recall/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/agentmemory-rest-api/SKILL.md`
- Existing contracts and tests:
  - `apps/studio/sim/core/simulationScene.ts`
  - `apps/studio/sim/core/simulationViewport.ts`
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `apps/studio/sim/solver/pinVocabulary.ts`
  - `apps/studio/sim/breadboard/occupancy.ts`
  - `apps/studio/sim/breadboard/geometry.ts`
  - `apps/studio/src/__tests__/SimulationViewport.test.ts`
  - `apps/studio/src/__tests__/PinVocabulary.test.ts`
  - `apps/studio/src/__tests__/BreadboardOccupancy.test.ts`
  - `apps/studio/src/__tests__/SimulationProviders.test.ts`

Prompt/source reconciliation:

- The newly attached pasted prompt still contains stale immediate blocks from
  earlier slices.
- The local runbook marks P+5 completed and gives P+6 as the next incomplete
  block.
- P+6 was executed because this runbook requires using the latest checkpoint
  and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0-P+5 plus unrelated product-doc
  changes. P+6 did not modify the unrelated product docs.

```bash
git diff --stat
```

- Before P+6 edits: 18 tracked files changed, 1893 insertions and 248
  deletions.

```bash
git diff --name-only
```

- Before P+6 edits, tracked delta:
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
  - `docs/product/TEACHER-DASHBOARD-SPEC.md`
  - `docs/product/UI-UX-DESIGN-DIRECTION.md`

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 410 GiB used, 4.3 GiB available,
  99% capacity. Tight but enough for P+6 focused tests and typecheck.

AgentMemory recovery:

- `memory_smart_search` was not exposed as an MCP tool in this Codex tool set,
  so the `agentmemory-rest-api` REST endpoint was used.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork simulation-postit-viewport multi-board-simulation-scene","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+6:

- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/src/__tests__/SimulationMultiBoardScene.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `SimulationSceneMultiBoardTopology` and related topology types.
- Added `simulationSceneMultiBoardTopology(scene)`, a pure helper that returns:
  - breadboard ids/kinds;
  - board-scoped terminal node ids;
  - board-scoped rail node ids;
  - controller-board pin node ids;
  - all scene node ids with deterministic unique sorting.
- The topology derives from the existing `SimulationScene` graph. Breadboard
  nodes include the board id (`bb-left:tie-top-2`,
  `bb-right:tie-top-2`, etc.), so ties and rails on different boards do not
  collide.
- Arduino/Nano/controller-style boards are modeled as component pin nodes
  (`nano-a:D13`, `nano-b:D13`) until P+7 introduces richer catalog footprints.
- No provider code change was required: the existing local provider already
  blocks unsupported `nano-r4` physics before fake solve output. P+6 now pins
  the two-board case with tests.

Required P+6 tests:

- Two breadboards can coexist without tie/rail node collisions: reached.
- Two Arduino-style boards have independent board-scoped pins: reached.
- Cross-board wire endpoints validate through semantic refs: reached.
- Unsupported runtime board/provider mode produces structured blocker
  diagnostics, not fake output: reached.
- Viewport fit-to-content P+5 continues to include multiple boards: reached.
- No mutable singleton global for multi-board per-instance state: reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationMultiBoardScene.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before topology helper existed: 1 test file failed, 2 failed /
  4 passed. Failure: `simulationSceneMultiBoardTopology is not a function`.
- First implementation still failed: 1 test file failed, 2 failed / 4 passed.
  Failure: local variable shadowed the helper name and caused
  `Cannot access 'componentPinNodeIds' before initialization`.
- GREEN after the naming fix: 1 test file passed, 6 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationMultiBoardScene.test.ts src/__tests__/SimulationViewport.test.ts src/__tests__/PinVocabulary.test.ts src/__tests__/BreadboardOccupancy.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 5 test files, 34 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- sim/core/simulationScene.ts src/__tests__/SimulationMultiBoardScene.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed with no output. Note: P+6 added an untracked test file, so an
  additional whitespace check was run on the touched P+6 files.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/sim/core/simulationScene.ts apps/studio/src/__tests__/SimulationMultiBoardScene.test.ts
```

- Passed with no output.

Playwright:

- Not run. P+6 stayed model-only/pure TypeScript: it added a topology contract
  and tests, but no rendered UI, canvas, route, CSS, DOM behavior, or visual
  layout changed.

Known warnings and residual risk:

- Disk remains tight, though P+6 had about 4.3 GiB free at recovery.
- The multi-board model is still a contract layer, not live board UI. It does
  not yet render multiple boards or attach editor gestures to them.
- Arduino-style boards are represented by declared component pins and
  controller-board topology nodes. Full board footprints, pin definitions,
  support status, and kit filters remain P+7 catalog work.
- The provider blocker is honest but broad: `nano-r4` remains unsupported by
  local static solving. Runtime/microcontroller fidelity remains future work.
- P+6 did not update the older breadboard occupancy/pin-vocabulary helpers
  beyond regression coverage; they already preserved board ids in refs.
- Two unrelated product-doc files were already dirty at recovery:
  `docs/product/TEACHER-DASHBOARD-SPEC.md` and
  `docs/product/UI-UX-DESIGN-DIRECTION.md`. P+6 did not read deeply or change
  them.

Product claim:

- `multi-board-simulation-scene`: reached at pure model/topology contract
  level.
- `simulation-postit-viewport`: preserved; viewport fit-to-content still sees
  multiple boards.
- `tinkercad-parity-simulation-postit`: advanced by making multiple breadboards
  and Arduino-style boards explicit scene topology rather than a single-board
  assumption. Live Tinkercad-style UI and runtime physics are not reached.
- `single-simulation-plugin-runtime` and `no-elabtutor-simulator-fork`:
  preserved; P+6 added no forked ELABTutor runtime path and no pack imports.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- simulation-postit-viewport
- multi-board-simulation-scene
- simulation-component-catalog

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+7 - Component Catalog And Palette Contract.

Obiettivo concreto P+7:
- creare un catalogo componenti reale e riusabile per Simulation Plugin;
- descrivere component id, label, categoria, pin, footprint/placement,
  support status provider e disponibilita kit;
- permettere al Simulation Plugin di elencare il catalogo generale;
- permettere a ELABTutor di filtrare per kit/manuale usando lo stesso catalogo,
  non un catalogo parallelo;
- tenere unsupported components visibili ma provider-blocked, senza fake solve;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+1-P+6:
  apps/studio/sim/core/simulationScene.ts
  apps/studio/sim/core/simulationViewport.ts
  apps/studio/sim/providers/simulationProviders.ts
  apps/studio/sim/solver/catalog.ts
- Crea un test dedicato:
  apps/studio/src/__tests__/SimulationComponentCatalog.test.ts
- Crea un helper puro/API contract, preferibilmente:
  apps/studio/sim/core/componentCatalog.ts
- Connetti al solver catalog tramite adapter/metadata, non duplicando solver
  internals.
- Non introdurre nuove dipendenze.

Required tests:
- catalog includes current supported basics: breadboard, battery, resistor, LED,
  RGB LED, potentiometer, Arduino-like board where present;
- unsupported components are listable but provider-blocked;
- ELABTutor kit filter is a view over the same catalog;
- no fake solve state is attached to unsupported catalog entries;
- catalog exposes stable pins and placement footprints for P+6 multi-board use;
- no host switch statements or mutable singleton per-instance catalog state.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/SimulationComponentCatalog.test.ts src/__tests__/SolverCatalog.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/SimulationMultiBoardScene.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+7 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+7 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+7.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+7 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+8.
```

## P+7 - Component Catalog And Palette Contract

Goal: all available components appear from a real catalog, with support status
and connection rules.

Target behavior:

- Catalog describes component id, label, pins, category, visual asset source,
  placement footprint, provider support status, and kit availability.
- Simulation Plugin can show the complete general catalog.
- ELABTutor can filter by kit/manual while still using the same catalog/runtime.

Likely files:

- Create `apps/studio/sim/core/componentCatalog.ts`
- Create `apps/studio/src/__tests__/SimulationComponentCatalog.test.ts`
- Connect to existing solver component registry through an adapter, not by
  duplicating solver internals.

Required tests:

- catalog includes current supported basics: breadboard, battery, resistor, LED,
  RGB LED, potentiometer, Arduino-like board where present;
- unsupported components are still listable but provider-blocked;
- ELABTutor kit filter is a view over the same catalog;
- no fake solve state is attached to unsupported catalog entries.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationComponentCatalog.test.ts src/__tests__/SolverCatalog.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Palette can grow without host switch statements.
- ELABTutor component list is not a parallel catalog.

### Session P+7 checkpoint - Component Catalog And Palette Contract (2026-07-08)

Status: completed 2026-07-08 13:05 Europe/Rome.

Scope:

- Executed only P+7 after recovering the local P+6 checkpoint.
- Added a pure reusable Simulation Component Catalog contract.
- Added tests for solver-backed supported basics, listable unsupported Nano R4
  provider blocking, ELABTutor kit/manual filtering as a shared-catalog view,
  stable pins and placement footprints for multi-board scenes, and no host
  switch/per-instance singleton catalog state.
- No React render path, canvas, board UI, `SimulationPluginWorkbench`,
  `ToolCanvasEmbeddable`, ELABTutor pack/runtime, provider implementation, or
  vendored solver file was changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`

Subagent note:

- Superpowers' executing-plans skill notes that subagents improve quality when
  available. Local tool rules allow spawning subagents only when explicitly
  requested by the user, so P+7 was executed locally.

Worktree isolation:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
git rev-parse --show-superproject-working-tree 2>/dev/null || true
```

- `GIT_DIR=/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
- `GIT_COMMON=/Users/andreamarro/VOLUME 3/ardesia/.git`
- `BRANCH=docs/simulation-plugin-v2-contract-20260707`
- No superproject path.
- Result: already in an isolated linked worktree; no new worktree was created.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/c6f5d93c-b5a8-4dd0-a57a-c4cd1cf47bb1/pasted-text.txt`
- Local skill docs:
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/executing-plans/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-git-worktrees/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/recall/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/agentmemory-rest-api/SKILL.md`
- Existing contracts and tests:
  - `apps/studio/sim/core/simulationScene.ts`
  - `apps/studio/sim/core/simulationViewport.ts`
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `apps/studio/sim/solver/catalog.ts`
  - `apps/studio/sim/solver/components/registry.js`
  - `apps/studio/sim/solver/components/registry.d.ts`
  - `apps/studio/sim/breadboard/simulationBreadboard.ts`
  - `apps/studio/src/__tests__/SolverCatalog.test.ts`
  - `apps/studio/src/__tests__/SimulationProviders.test.ts`
  - `apps/studio/src/__tests__/SimulationMultiBoardScene.test.ts`
  - `apps/studio/src/__tests__/PinVocabulary.test.ts`
  - `apps/studio/src/__tests__/BreadboardOccupancy.test.ts`
  - `apps/studio/src/__tests__/SingleSimulationRuntimeContract.test.ts`

Prompt/source reconciliation:

- The newly attached pasted prompt and the final `Immediate Next Prompt` in this
  runbook still contain stale P+2 blocks.
- The local P+6 checkpoint gives P+7 as the next incomplete block.
- P+7 was executed because this runbook requires using the latest checkpoint
  and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0-P+6 plus unrelated product-doc
  changes. P+7 did not modify the unrelated product docs.

```bash
git diff --stat
```

- Before P+7 edits: 18 tracked files changed, 1971 insertions and 248
  deletions.

```bash
git diff --name-only
```

- Before P+7 edits, tracked delta:
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
  - `docs/product/TEACHER-DASHBOARD-SPEC.md`
  - `docs/product/UI-UX-DESIGN-DIRECTION.md`

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 410 GiB used, 4.5 GiB available,
  99% capacity. Tight but enough for P+7 focused tests and typecheck.

AgentMemory recovery:

- `memory_smart_search` was not exposed as an MCP tool in this Codex tool set,
  so the `agentmemory-rest-api` REST endpoint was used.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork simulation-postit-viewport multi-board-simulation-scene simulation-component-catalog","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+7:

- `apps/studio/sim/core/componentCatalog.ts`
- `apps/studio/src/__tests__/SimulationComponentCatalog.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `SIMULATION_COMPONENT_CATALOG_SCHEMA` and a pure typed
  `SimulationComponentCatalogEntry` contract.
- Added `listSimulationComponentCatalog()`.
- Added `getSimulationComponentCatalogEntry(id)`.
- Added `filterSimulationComponentCatalogForKit(catalog, filter)`.
- Solver-supported entries are adapted from the existing headless solver
  catalog via `registerElectricalCatalog()` and `getComponent()`.
- Product metadata lives in the new catalog only for category overrides,
  placement footprint, visual asset source, provider support, and ELABTutor kit
  availability.
- Supported basics now list through the catalog: `breadboard-half`,
  `battery9v`, `resistor`, `led`, `rgb-led`, `potentiometer`, and `wire`.
- `nano-r4` is listable as an Arduino-like controller board with stable pins
  and a controller-board footprint, but its local provider support is
  `unsupported` with `runtime-microcontroller` physics.
- Unsupported catalog entries carry no fake `solveState`, `componentStates`,
  `currents`, or `voltages`.
- ELABTutor filters are views over the passed shared catalog entries, not a
  parallel ELABTutor catalog.

Required P+7 tests:

- Catalog includes current supported basics and an Arduino-like board where
  present: reached.
- Unsupported components are listable but provider-blocked: reached.
- ELABTutor kit/manual filter is a view over the same catalog: reached.
- No fake solve state is attached to unsupported catalog entries: reached.
- Catalog exposes stable pins and placement footprints for P+6 multi-board use:
  reached.
- No host switch statements or mutable singleton per-instance catalog state:
  reached through source guard.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationComponentCatalog.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before implementation: 1 failed suite, 0 tests collected.
  Failure: missing module `../../sim/core/componentCatalog`.
- GREEN after implementation: 1 test file passed, 5 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationComponentCatalog.test.ts src/__tests__/SolverCatalog.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/SimulationMultiBoardScene.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 4 test files, 26 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- sim/core/componentCatalog.ts src/__tests__/SimulationComponentCatalog.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed with no output. Note: P+7 added untracked files, so an additional
  whitespace check was run on the touched P+7 files.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/sim/core/componentCatalog.ts apps/studio/src/__tests__/SimulationComponentCatalog.test.ts
```

- Passed with no output.

Playwright:

- Not run. P+7 stayed model-only/pure TypeScript: it added a component catalog
  contract and tests, but no rendered UI, canvas, route, CSS, DOM behavior, or
  visual layout changed.

Known warnings and residual risk:

- Disk remains tight, though P+7 had about 4.5 GiB free at recovery.
- The catalog is a model/API contract only. It does not yet render the palette
  or implement drag/drop placement UI.
- `nano-r4` pins are intentionally minimal and stable for current P+6
  multi-board semantics (`D13`, `GND`, `5V`, `A0`). Full Nano R4 pinout and
  Renesas RA4M1 runtime fidelity remain future provider/runtime work.
- ELABTutor kit filters are authored metadata in the shared catalog. Rich
  ELABTutor post-it capability artifacts remain P+10.
- Two unrelated product-doc files were already dirty at recovery:
  `docs/product/TEACHER-DASHBOARD-SPEC.md` and
  `docs/product/UI-UX-DESIGN-DIRECTION.md`. P+7 did not read deeply or change
  them.

Product claim:

- `simulation-component-catalog`: reached at pure catalog/API contract level.
- `multi-board-simulation-scene`: strengthened; catalog now exposes stable
  footprints and pins needed by P+6 board-scoped topology.
- `tinkercad-parity-simulation-postit`: advanced by replacing ad hoc component
  knowledge with a reusable general catalog foundation. Live palette UI and
  placement behavior are not reached.
- `elabtutor-postit-capabilities`: partially prepared through kit/manual
  filtering over the shared Simulation Plugin catalog.
- `single-simulation-plugin-runtime` and `no-elabtutor-simulator-fork`:
  preserved; P+7 added no forked ELABTutor runtime path and no pack imports.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- simulation-postit-viewport
- multi-board-simulation-scene
- simulation-component-catalog
- placement-engine-adapter

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+8 - PlacementEngine Adapter Proof-of-use.

Obiettivo concreto P+8:
- iniziare una prova d'uso reale del PlacementEngine come adapter strutturato;
- accettare snapshot e placement operation strutturati;
- restituire una scene patch strutturata;
- rifiutare output legacy `[AZIONE:addcomponent]` e `[AZIONE:addwire]`;
- rifiutare mutazioni SVG-only/DOM-only;
- eseguire validazione prima del provider solve;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+1-P+7:
  apps/studio/sim/core/placementEngineContract.ts
  apps/studio/sim/core/simulationOperations.ts
  apps/studio/sim/core/simulationScene.ts
  apps/studio/sim/core/componentCatalog.ts
  apps/studio/sim/providers/simulationProviders.ts
- Crea un adapter puro, preferibilmente:
  apps/studio/sim/core/placementEngineAdapter.ts
- Crea un test dedicato:
  apps/studio/src/__tests__/SimulationPlacementEngineAdapter.test.ts
- Non copiare broad legacy runtime. Se serve leggere la sorgente ELABTutor
  `PlacementEngine.js`, usarla come riferimento per shape e rifiutare i tag
  legacy come output runtime.
- Non introdurre nuove dipendenze.

Required tests:
- adapter creates a resistor/LED placement patch from structured operation;
- adapter refuses legacy tag output;
- adapter refuses SVG-only/DOM-only drag mutation;
- adapter deep-copies input snapshot;
- validation pipeline includes occupancy, pin vocabulary, scene validation and
  provider solve;
- unsupported catalog/provider entries stay blocked, not fake-solved.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/SimulationPlacementEngineAdapter.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationComponentCatalog.test.ts src/__tests__/ToolCanvasMontaggioLibero.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+8 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+8 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+8.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+8 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+9.
```

## P+8 - PlacementEngine Adapter Proof-of-use

Goal: begin real extraction from ELABTutor `PlacementEngine.js` without importing
legacy runtime outputs.

Target behavior:

- Adapter accepts a structured snapshot and placement operation.
- Adapter returns a structured scene patch.
- Legacy `[AZIONE:addcomponent]` and `[AZIONE:addwire]` strings are rejected.
- Placement validation runs before provider solve.

Likely files:

- `apps/studio/sim/core/placementEngineContract.ts`
- Create `apps/studio/sim/core/placementEngineAdapter.ts`
- Create `apps/studio/src/__tests__/SimulationPlacementEngineAdapter.test.ts`

Required tests:

- adapter creates a resistor/LED placement patch from structured operation;
- adapter refuses legacy tag output;
- adapter refuses SVG-only/DOM-only drag mutation;
- adapter deep-copies input snapshot;
- validation pipeline includes occupancy, pin vocabulary, scene validation and
  provider solve.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationPlacementEngineAdapter.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/ToolCanvasMontaggioLibero.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Placement has a real adapter path.
- Still no broad copy/paste migration.

### Session P+8 checkpoint - PlacementEngine Adapter Proof-of-use (2026-07-08)

Status: completed 2026-07-08 13:16 Europe/Rome.

Scope:

- Executed only P+8 after recovering the local P+7 checkpoint.
- Added a pure `PlacementEngine` adapter proof-of-use that accepts structured
  `SimulationOperationEnvelope` input plus `PlacementEngineSnapshot`, applies a
  structured scene patch, and runs validation before provider solving.
- Added tests for resistor/LED structured placement patches, legacy
  `[AZIONE:...]` refusal, DOM/SVG-only mutation refusal, deep-copy behavior,
  validation pipeline ordering, and unsupported provider blocking without fake
  solve output.
- No React render path, canvas, board UI, `SimulationPluginWorkbench`,
  `ToolCanvasEmbeddable`, ELABTutor pack/runtime, provider implementation, or
  vendored solver file was changed.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`

Subagent note:

- Superpowers' executing-plans skill notes that subagents improve quality when
  available. Local tool rules allow spawning subagents only when explicitly
  requested by the user, so P+8 was executed locally.

Worktree isolation:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
git rev-parse --show-superproject-working-tree 2>/dev/null || true
```

- `GIT_DIR=/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
- `GIT_COMMON=/Users/andreamarro/VOLUME 3/ardesia/.git`
- `BRANCH=docs/simulation-plugin-v2-contract-20260707`
- No superproject path.
- Result: already in an isolated linked worktree; no new worktree was created.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
- Local skill docs:
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/executing-plans/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-git-worktrees/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/recall/SKILL.md`
  - `/Users/andreamarro/VOLUME 3/.agents/skills/agentmemory-rest-api/SKILL.md`
- Existing contracts and tests:
  - `apps/studio/sim/core/placementEngineContract.ts`
  - `apps/studio/src/__tests__/SimulationPlacementEngineContract.test.ts`
  - `apps/studio/sim/core/simulationOperations.ts`
  - `apps/studio/sim/core/simulationScene.ts`
  - `apps/studio/sim/core/componentCatalog.ts`
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `apps/studio/sim/breadboard/occupancy.ts`
  - `apps/studio/sim/solver/pinVocabulary.ts`
  - `apps/studio/src/__tests__/SimulationOperationsContract.test.ts`
  - `plugins/elab-tutor/src/components/simulator/engine/PlacementEngine.js`

Prompt/source reconciliation:

- The required attached pasted prompt was read in full, but it contains stale
  final continuation blocks.
- The final `Immediate Next Prompt` in this runbook still contains an older P+2
  block, while the local P+7 checkpoint gives P+8 as the next incomplete block.
- P+8 was executed because this runbook requires using the latest checkpoint
  and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0-P+7 plus unrelated product-doc
  changes. P+8 did not modify the unrelated product docs.

```bash
git diff --stat
```

- Before P+8 edits: 18 tracked files changed, 1971 insertions and 248
  deletions.

```bash
git diff --name-only
```

- Before P+8 edits, tracked delta:
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
  - `docs/product/TEACHER-DASHBOARD-SPEC.md`
  - `docs/product/UI-UX-DESIGN-DIRECTION.md`

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 410 GiB used, 4.3 GiB available,
  99% capacity. Tight but enough for P+8 focused tests and typecheck.

AgentMemory recovery:

- `memory_smart_search` was not exposed as an MCP tool in this Codex tool set,
  so the `agentmemory-rest-api` REST endpoint was used.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork simulation-postit-viewport multi-board-simulation-scene simulation-component-catalog placement-engine-adapter","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+8:

- `apps/studio/sim/core/placementEngineAdapter.ts`
- `apps/studio/src/__tests__/SimulationPlacementEngineAdapter.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `applyPlacementEngineAdapterOperation(input)`.
- Added `PlacementEngineAdapterResult` with:
  - cloned `snapshot`;
  - structured `SimulationPlacementPatch`;
  - `validationPipeline`;
  - provider result or `null`;
  - diagnostics.
- The adapter accepts a structured `SimulationOperationEnvelope` and applies
  scene patches for `place-component`, `move-component`, `rotate-component`,
  `connect-wire`, `delete`, and `set-value`. `probe`, `run`, and `stop` remain
  no-scene-change operations while still preserving provider-bound contracts.
- The adapter rejects top-level legacy `[AZIONE:...]` strings before producing
  any new patch.
- The adapter reuses `validateSimulationOperationEnvelope()` to reject DOM or
  handler-authority payloads and adds a guard for SVG-only placement mutations.
- The validation pipeline runs in this order:
  - `validateSimulationScene`
  - `analyzeBreadboardOccupancy`
  - `analyzePinVocabulary`
  - `activeSimulationProvider.solve`
- Provider solve is skipped when structural placement validation fails.
- Pin vocabulary uses the shared P+7 component catalog resolver so listable
  unsupported components such as `nano-r4` can reach the provider boundary and
  be honestly blocked there instead of being fake-solved or stopped by an
  unrelated missing-pin error.
- The adapter imports neither legacy `PlacementEngine.js` nor browser/DOM APIs.

Required P+8 tests:

- Adapter creates resistor/LED placement patches from structured operations:
  reached.
- Adapter refuses legacy tag output: reached.
- Adapter refuses SVG-only/DOM-only drag mutation: reached.
- Adapter deep-copies input snapshot/scene before returning a patch: reached.
- Validation pipeline includes occupancy, pin vocabulary, scene validation and
  provider solve: reached.
- Unsupported catalog/provider entries stay blocked, not fake-solved: reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationPlacementEngineAdapter.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before implementation: 1 failed suite, 0 tests collected.
  Failure: missing module `../../sim/core/placementEngineAdapter`.
- GREEN after implementation: 1 test file passed, 7 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationPlacementEngineAdapter.test.ts src/__tests__/SimulationPlacementEngineContract.test.ts src/__tests__/SimulationComponentCatalog.test.ts src/__tests__/ToolCanvasMontaggioLibero.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- First focused run passed: 4 test files, 24 tests.
- Re-run after typecheck cleanup passed: 4 test files, 24 tests.

```bash
npm --prefix apps/studio run typecheck
```

- First run failed with `TS6133`: unused local `basePatch` in
  `sim/core/placementEngineAdapter.ts`.
- After removing that unused local, typecheck passed.

```bash
cd apps/studio && npm exec eslint -- sim/core/placementEngineAdapter.ts src/__tests__/SimulationPlacementEngineAdapter.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed with no output. Note: P+8 added untracked files, so an additional
  whitespace check was run on the touched P+8 files.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/sim/core/placementEngineAdapter.ts apps/studio/src/__tests__/SimulationPlacementEngineAdapter.test.ts
```

- Passed with no output.

Playwright:

- Not run. P+8 stayed model-only/pure TypeScript: it added a placement adapter
  contract and tests, but no rendered UI, canvas, route, CSS, DOM behavior, or
  visual layout changed.

Known warnings and residual risk:

- Disk remains tight, though P+8 had about 4.3 GiB free at recovery.
- This is a proof-of-use adapter path, not the full extraction of ELABTutor
  `PlacementEngine.js`. The legacy source was read to confirm entrypoints and
  anti-patterns, not imported.
- The adapter currently returns full structured patch contents rather than an
  incremental JSON patch format. That is sufficient for this slice but may need
  a narrower patch delta once UI integration starts.
- Provider solve runs through the current local/static provider. Runtime
  microcontroller fidelity and real provider expansion remain future work.
- Two unrelated product-doc files were already dirty at recovery:
  `docs/product/TEACHER-DASHBOARD-SPEC.md` and
  `docs/product/UI-UX-DESIGN-DIRECTION.md`. P+8 did not read deeply or change
  them.

Product claim:

- `placement-engine-adapter`: reached at pure model/API proof-of-use level.
- `tinkercad-parity-simulation-postit`: advanced by making structured placement
  operations produce scene patches and pass through validator/provider gates.
  Live drag/drop UI remains future work.
- `simulation-component-catalog`: preserved and reused as the pin resolver for
  unsupported-but-listable parts.
- `single-simulation-plugin-runtime` and `no-elabtutor-simulator-fork`:
  preserved; P+8 added no forked ELABTutor runtime path and no pack imports.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- simulation-postit-viewport
- multi-board-simulation-scene
- simulation-component-catalog
- placement-engine-adapter
- editable-wire-ui-handles

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+9 - Editable Wire UI Handles.

Obiettivo concreto P+9:
- collegare il contratto wire semantico H+3/P+6 a comportamento UI reale;
- quando un wire e' selezionato, esporre endpoint anchors e waypoint handles;
- spostare waypoint deve aggiornare `SimulationWire.path` senza cambiare la
  netlist normalizzata;
- cambiare endpoint deve cambiare la netlist normalizzata solo dopo validazione;
- endpoint invalido deve rifiutare la mutazione e produrre diagnostica;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+1-P+8:
  apps/studio/sim/core/simulationScene.ts
  apps/studio/sim/core/placementEngineAdapter.ts
  apps/studio/sim/core/simulationOperations.ts
  apps/studio/src/design/SimulationPluginWorkbench.tsx
- Crea un test dedicato:
  apps/studio/src/__tests__/SimulationWireEditor.test.tsx
- Integra UI/canvas solo nel punto minimo necessario.
- Non introdurre nuove dipendenze.

Required tests:
- selecting a wire renders locked endpoint anchors and editable middle handles;
- moving waypoint changes editable wire contract but not normalized netlist;
- changing endpoint changes normalized netlist after validation;
- invalid endpoint refuses mutation and emits diagnostics;
- existing structured scene intake and wire contract regressions stay green.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/SimulationWireEditor.test.tsx src/__tests__/SimulationWireContract.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/SimulationPlacementEngineAdapter.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+9 cambia render UI/canvas, esegui anche:
  npm --prefix apps/studio run build
- Poi avvia la route necessaria e registra route, viewport, screenshot path,
  console errors e prova di canvas non blank/stato handles visibile/no overlap.
- Se P+9 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario; ma P+9 ha obiettivo UI, quindi serve una motivazione forte per
  non fare Playwright.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+9.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+9 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+10.
```

## P+9 - Editable Wire UI Handles

Goal: connect the H+3 semantic wire contract to real UI behavior.

Target behavior:

- Selected wire exposes endpoint anchors and waypoint handles.
- Dragging a waypoint updates `SimulationWire.path`.
- Dragging an endpoint changes semantic endpoint only through validators.
- Route changes do not alter normalized netlist; endpoint changes do.

Likely files:

- `apps/studio/sim/core/simulationScene.ts`
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`
- Create `apps/studio/src/__tests__/SimulationWireEditor.test.tsx`

Required tests:

- selecting a wire renders locked endpoint anchors and editable middle handles;
- moving waypoint changes editable wire contract but not normalized netlist;
- changing endpoint changes normalized netlist after validation;
- invalid endpoint refuses mutation and emits diagnostics.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationWireEditor.test.tsx src/__tests__/SimulationWireContract.test.ts src/__tests__/StructuredSceneIntake.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

If UI/canvas runtime changes, add Playwright:

```bash
npm --prefix apps/studio run build
```

Then run a Playwright check for the simulator route and record route, viewport,
screenshot path, console errors, and canvas nonblank/state assertions.

Exit criteria:

- Wire editing is no longer contract-only.
- Electrical truth remains endpoint/netlist based.

### Session P+9 checkpoint - Editable Wire UI Handles (2026-07-08)

Status: completed 2026-07-08 13:27 Europe/Rome.

Scope:

- Executed only P+9 after recovering the local P+8 checkpoint.
- Added a real workbench wire editor surface for selected simulation wires.
- Added pure validated wire-edit helpers for waypoint routing and endpoint
  retargeting.
- Added UI tests proving selected wire handles, route-only waypoint edits,
  validated endpoint retargeting, and invalid endpoint refusal.
- No ELABTutor simulator fork, pack runtime import, vendored solver edit,
  push, merge, deploy, staging, reset, clean, `git add -A`, dependency change,
  or broad unrelated refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`
- local `playwright` skill for browser verification

Worktree isolation:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
git rev-parse --show-superproject-working-tree 2>/dev/null || true
```

- `GIT_DIR=/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
- `GIT_COMMON=/Users/andreamarro/VOLUME 3/ardesia/.git`
- `BRANCH=docs/simulation-plugin-v2-contract-20260707`
- No superproject path.
- Result: already in an isolated linked worktree; no new worktree was created.

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
- Local skill docs:
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/executing-plans/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-git-worktrees/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
  - `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
  - `/Users/andreamarro/.codex/skills/playwright/SKILL.md`
- Existing contracts and tests:
  - `apps/studio/sim/core/simulationScene.ts`
  - `apps/studio/sim/core/simulationOperations.ts`
  - `apps/studio/sim/core/placementEngineAdapter.ts`
  - `apps/studio/src/design/SimulationPluginWorkbench.tsx`
  - `apps/studio/src/__tests__/SimulationWireContract.test.ts`
  - `apps/studio/src/__tests__/StructuredSceneIntake.test.ts`
  - `apps/studio/src/__tests__/SimulationPluginWorkbench.test.tsx`
  - `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`

Prompt/source reconciliation:

- The required attached pasted prompt was read in full, but it contains stale
  continuation blocks ending at an older P+2 prompt.
- The local runbook checkpoint at P+8 is newer and identifies P+9 as the next
  incomplete block.
- P+9 was executed because this runbook requires using the latest checkpoint and
  doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0-P+8 plus unrelated product-doc and
  teacher-dashboard changes. P+9 did not modify unrelated product docs.

```bash
git diff --stat
```

- Before P+9 edits: 20 tracked files changed, 2116 insertions and 250
  deletions.

```bash
git diff --name-only
```

- Tracked delta before P+9 included simulator scene/provider/workbench files,
  teacher-dashboard files, and product docs already dirty from prior work.

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 409 GiB used, 4.5 GiB available,
  99% capacity.

AgentMemory recovery:

- `memory_smart_search` was not exposed in this Codex tool set, so the
  `agentmemory-rest-api` REST endpoint was used.
- REST command:

```bash
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"ardesia-plugin-postit-objects simultaneous-plugin-postits responsive-plugin-functions elabtutor-postit-capabilities tinkercad-parity-simulation-postit single-simulation-plugin-runtime no-elabtutor-simulator-fork simulation-postit-viewport multi-board-simulation-scene simulation-component-catalog placement-engine-adapter editable-wire-ui-handles","limit":10}'
```

- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+9:

- `apps/studio/sim/core/simulationWireEditor.ts`
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`
- `apps/studio/src/__tests__/SimulationWireEditor.test.tsx`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `moveSimulationWireWaypoint(scene, input)`.
  - Edits only non-anchor waypoint points.
  - Rejects locked anchors, missing paths, missing wires, and non-finite points.
  - Validates the resulting `SimulationScene`.
  - Returns before/after normalized netlists so tests and UI can prove route-only
    edits do not change electrical truth.
- Added `retargetSimulationWireEndpoint(scene, input)`.
  - Updates `from` or `to` only through `validateSimulationScene()`.
  - Accepts valid endpoint changes and rejects invalid endpoints while
    preserving the previous scene.
- Added a keyed `SimulationWireEditorPanel` inside
  `SimulationPluginWorkbench`.
  - Renders per-wire selection buttons.
  - Renders two locked endpoint anchors.
  - Renders editable waypoint handles for selected wire path points.
  - Pointer moving a waypoint updates `SimulationWire.path`.
  - Valid endpoint retarget changes normalized netlist.
  - Invalid endpoint retarget preserves normalized netlist and emits diagnostics.
- The existing `SimulationBoard`/free-assembly canvas remains untouched.
- No direct `plugins/elab-tutor` runtime import, no solver vendoring, and no
  DOM/SVG-only authority was introduced.

Required P+9 tests:

- Selecting a wire renders locked endpoint anchors and editable middle handles:
  reached.
- Moving waypoint changes editable wire contract but not normalized netlist:
  reached.
- Changing endpoint changes normalized netlist after validation: reached.
- Invalid endpoint refuses mutation and emits diagnostics: reached.
- Existing structured scene intake, wire contract, and placement adapter
  regressions stay green: reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationWireEditor.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before implementation: 1 test file failed, 1 failed / 0 passed.
  Failure: missing `[data-wire-select="wire-1"]`.
- GREEN after implementation: 1 test file passed, 1 test.
- Re-run after lint refactor: 1 test file passed, 1 test.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationWireEditor.test.tsx src/__tests__/SimulationWireContract.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/SimulationPlacementEngineAdapter.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 4 test files, 18 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- sim/core/simulationWireEditor.ts src/design/SimulationPluginWorkbench.tsx src/__tests__/SimulationWireEditor.test.tsx
```

- First run failed on `react-hooks/set-state-in-effect` in
  `SimulationPluginWorkbench.tsx`.
- Fixed by moving wire editor state into a keyed child component instead of
  resetting synchronously in an effect.
- Re-run passed.

```bash
npm --prefix apps/studio run build
```

- Passed.
- Existing Vite large chunk warnings remained.

```bash
git diff --check
```

- Passed with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/sim/core/simulationWireEditor.ts apps/studio/src/design/SimulationPluginWorkbench.tsx apps/studio/src/__tests__/SimulationWireEditor.test.tsx
```

- Passed with no output.

Playwright:

- `command -v npx` passed.
- The local Playwright CLI wrapper failed with `playwright-cli: command not
  found`, so browser verification used the already installed workspace
  Playwright package instead.
- Dev server:

```bash
npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5177
```

- Route: `http://127.0.0.1:5177/?vista=simulatore`
- Viewport: `1366x900`
- Screenshot:
  `output/playwright/simulation-wire-editor-p9-desktop.png`
- Browser verification output:
  - console errors: `[]`
  - endpoint anchors: `2`
  - waypoint handle visible: `true`
  - selected valid endpoint retarget included `bb1:bus-top-plus-2`
  - invalid endpoint diagnostics:
    `invalid-wire-endpoint: wire-1 to bb1:z99`
  - last action after invalid retarget: `endpoint-rejected`
  - screenshot PNG had non-white bytes: `true`
  - editor box was inside the simulation canvas bounds with no incoherent
    overlap detected.
- Dev server was stopped before checkpointing.

Known warnings and residual risk:

- The wire editor UI is still a technical workbench surface, not final polished
  canvas manipulation in the production post-it object.
- Waypoint dragging is represented by DOM pointer controls around selected wire
  data, not yet by direct SVG path hit-testing inside `SimulationBoard`.
- Endpoint retarget options are minimal harness controls; future work should
  snap to visible board/component endpoints.
- Build retains existing Vite large chunk warnings.
- The Playwright CLI wrapper was unavailable even though `npx` existed; the
  installed workspace Playwright package was used as fallback.
- Disk remains tight but stable at about 4.5 GiB free after P+9.
- Unrelated product-doc and teacher-dashboard changes were already dirty and
  were not touched by P+9.

Product claim:

- `editable-wire-ui-handles`: reached at workbench UI level.
- `tinkercad-parity-simulation-postit`: advanced by connecting semantic wire
  route and endpoint edits to real UI state and validation; not final
  Tinkercad parity.
- `single-simulation-plugin-runtime` and `no-elabtutor-simulator-fork`:
  preserved; P+9 added no second simulator path.
- Electrical truth remains endpoint/netlist based: route-only edits keep
  `normalizeSimulationScene()` stable, endpoint edits change it only after
  validation.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- editable-wire-ui-handles
- elabtutor-postit-capabilities-same-simulator

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+10 - ELABTutor Post-it Capabilities On The Same Simulator.

Obiettivo concreto P+10:
- esporre le capacita' ELABTutor come funzioni contestuali/post-it consumer;
- dichiarare manuali, componenti, passo-passo, UNLIM, simulatore, common
  mistakes e diagnostics;
- ogni funzione deve avere metadati compact/normal/expanded;
- la funzione simulatore deve dipendere da `io.ardesia.simulation` e usare il
  public runtime API, non solver/canvas/breadboard privati;
- passo-passo deve proiettare la stessa scena canonica, non geometria separata;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti P+3/P+4/P+9:
  apps/studio/src/toolhost/pluginFunctions.ts
  apps/studio/sim/core/simulationRuntime.ts
  apps/studio/sim/core/simulationScene.ts
  apps/studio/sim/core/simulationWireEditor.ts
  packs/elab-tutor/manifest.json
- Crea un test dedicato:
  apps/studio/src/__tests__/ElabTutorPostitCapabilities.test.ts
- Crea `packs/elab-tutor/postitFunctions.json` o typed equivalent solo se il
  progetto lo preferisce.
- Non introdurre nuove dipendenze.

Required tests:
- ELABTutor dichiara manuali, componenti, passo-passo, UNLIM, simulatore,
  common mistakes e diagnostics;
- ogni funzione ha compact/normal/expanded surface metadata;
- simulator function depends on `io.ardesia.simulation`;
- no solver/canvas/breadboard import from ELABTutor pack;
- passo-passo final state normalizes to mounted scene;
- no mutable singleton global for ELABTutor post-it capability state.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/ElabTutorPostitCapabilities.test.ts src/__tests__/SimulationSceneModes.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts src/__tests__/ResponsivePluginFunctions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+10 cambia render UI/canvas, esegui build e browser verification con route,
  viewport, screenshot, console errors e prova no blank/no overlap.
- Se P+10 resta modello puro/dati, dichiara esplicitamente perche' Playwright
  non era necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+10.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+10 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+11.
```

## P+10 - ELABTutor Post-it Capabilities On The Same Simulator

Goal: ELABTutor post-it exposes current ELABTutor capabilities as contextual
functions around the shared Simulation Plugin runtime.

Target behavior:

- ELABTutor functions include manuali, componenti, passo-passo, UNLIM,
  simulatore, common mistakes, diagnostics.
- These functions are descriptors/sub-post-it surfaces tied to the ELABTutor
  post-it.
- The simulator function opens or controls the shared Simulation Runtime.
- Passo-passo projects over the same canonical scene, not a separate geometry.

Likely files:

- Create `packs/elab-tutor/postitFunctions.json` or typed equivalent if project
  patterns prefer TS.
- Create `apps/studio/src/__tests__/ElabTutorPostitCapabilities.test.ts`
- Modify manifest/boundary files only if needed.

Required tests:

- ELABTutor declares the required functions;
- each function has compact/normal/expanded surface metadata;
- simulator function depends on `io.ardesia.simulation`;
- no solver/canvas/breadboard import from ELABTutor pack;
- passo-passo final state normalizes to mounted scene.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/ElabTutorPostitCapabilities.test.ts src/__tests__/SimulationSceneModes.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- ELABTutor is a rich post-it consumer of the same simulator.
- No second simulator path exists.

### Session P+10 checkpoint - ELABTutor Post-it Capabilities On The Same Simulator (2026-07-08)

Status: completed 2026-07-08 13:31 Europe/Rome.

Scope:

- Executed only P+10 after recovering the local P+9 checkpoint.
- Added an ELABTutor pack data artifact declaring post-it capabilities as data,
  not runtime code.
- Added tests proving ELABTutor contextual functions, compact/normal/expanded
  metadata, shared Simulation Runtime dependency, pack boundary guards, and
  passo-passo projection over the canonical mounted scene.
- No React render path, canvas, board UI, provider implementation, ELABTutor
  runtime code, vendored solver file, push, merge, deploy, staging, reset,
  clean, `git add -A`, dependency change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
- Existing P+10 source context:
  - `packs/elab-tutor/manifest.json`
  - `packs/elab-tutor/README.md`
  - `packs/elab-tutor/data/lesson-paths/v1-cap6-esp1.json`
  - `apps/studio/src/toolhost/pluginFunctions.ts`
  - `apps/studio/src/toolhost/postitObject.ts`
  - `apps/studio/sim/core/simulationRuntime.ts`
  - `apps/studio/sim/simulationSceneModes.ts`
  - `apps/studio/src/__tests__/SimulationSceneModes.test.ts`
  - `apps/studio/src/__tests__/SingleSimulationRuntimeContract.test.ts`
  - `apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts`

Prompt/source reconciliation:

- The required attached pasted prompt remains stale at its final continuation
  block.
- The local runbook P+9 checkpoint is newer and gives P+10 as the next
  incomplete block.
- P+10 was executed because this runbook requires using the latest checkpoint
  and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0-P+9 plus unrelated product-doc and
  teacher-dashboard changes. P+10 did not modify unrelated product docs.

```bash
git diff --stat
```

- Before P+10 edits: 20 tracked files changed, 2403 insertions and 244
  deletions.

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 409 GiB used, 4.5 GiB available,
  99% capacity.

AgentMemory recovery:

- `memory_smart_search` was not exposed in this Codex tool set, so the
  `agentmemory-rest-api` REST endpoint was used.
- Relevant results returned:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+10:

- `packs/elab-tutor/postitFunctions.json`
- `apps/studio/src/__tests__/ElabTutorPostitCapabilities.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `packs/elab-tutor/postitFunctions.json` with schema
  `elabtutor-postit-functions/1`.
- Declared ELABTutor post-it functions:
  - `manuali`
  - `componenti`
  - `passo-passo`
  - `unlim`
  - `simulatore`
  - `common-mistakes`
  - `diagnostics`
- Each function declares compact, normal, and expanded surface metadata.
- `simulatore` depends on `io.ardesia.simulation` and runtime API
  `simulation-runtime/1`.
- `simulatore` records forbidden private simulator import categories:
  `private-solver-runtime`, `private-canvas-renderer`,
  `private-breadboard-geometry`, `private-placement-engine`,
  `private-wire-renderer`, `private-microcontroller-runtime`, and
  `private-provider-internals`.
- `passo-passo` records that it projects from `canonical-scene` and its final
  state normalizes to the mounted scene.

Required P+10 tests:

- ELABTutor declares manuali, componenti, passo-passo, UNLIM, simulatore,
  common mistakes and diagnostics: reached.
- Each function has compact/normal/expanded surface metadata: reached.
- Simulator function depends on `io.ardesia.simulation`: reached.
- No solver/canvas/breadboard import from ELABTutor pack: reached through source
  guard.
- Passo-passo final state normalizes to mounted scene: reached.
- No mutable singleton global for ELABTutor post-it capability state: reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before artifact existed: 1 test file failed, 5 failed / 0 passed.
  Failure: missing `packs/elab-tutor/postitFunctions.json`.
- GREEN after implementation: 1 test file passed, 5 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/ElabTutorPostitCapabilities.test.ts src/__tests__/SimulationSceneModes.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts src/__tests__/ResponsivePluginFunctions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 4 test files, 18 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- src/__tests__/ElabTutorPostitCapabilities.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/src/__tests__/ElabTutorPostitCapabilities.test.ts packs/elab-tutor/postitFunctions.json
```

- Passed with no output.

Playwright:

- Not run. P+10 changed only pack data plus a node/jsdom-free model test. It did
  not change rendered UI, canvas, route, CSS, DOM behavior, or visual layout.

Known warnings and residual risk:

- ELABTutor capabilities are now a pack data artifact, not yet rendered as
  board sub-post-its.
- The simulator capability records the public dependency and forbidden imports,
  but actual open/control UI wiring remains future work.
- Source guards are text-level import checks, not a full import graph analyzer.
- Disk remains tight at about 4.5 GiB free.
- Unrelated product-doc and teacher-dashboard changes were already dirty and
  were not touched by P+10.

Product claim:

- `elabtutor-postit-capabilities`: reached at pack data/contract level.
- `single-simulation-plugin-runtime`: preserved; the simulator capability
  depends on `io.ardesia.simulation` and `simulation-runtime/1`.
- `no-elabtutor-simulator-fork`: preserved; no ELABTutor solver/canvas runtime
  import was added.
- `tinkercad-parity-simulation-postit`: advanced indirectly by making ELABTutor
  a capability consumer of the shared simulator instead of a parallel simulator.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- provider-instrument-boundary
- honest-simulation-physics

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+11 - Provider And Instrument Expansion Boundary.

Obiettivo concreto P+11:
- modellare strumenti e provider come capability esplicite, non letture fake;
- definire probe, voltmeter, serial/plotter, SPICE transient e custom chip come
  operazioni/provider-backed capabilities;
- rendere visibili ma bloccati gli strumenti non supportati dal provider local;
- mantenere il provider local onesto e stretto;
- includere diagnostics con provider id, mode, physics e blocking reason;
- non creare fake readings UI;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti:
  apps/studio/sim/providers/simulationProviders.ts
  apps/studio/sim/core/simulationOperations.ts
  apps/studio/sim/core/simulationRuntime.ts
  apps/studio/sim/core/componentCatalog.ts
- Crea:
  apps/studio/sim/core/instrumentContract.ts
  apps/studio/src/__tests__/SimulationInstrumentContract.test.ts
- Non introdurre nuove dipendenze.

Required tests:
- voltmeter/probe operation is provider-bound;
- serial/plotter requires runtime provider and blocks on local;
- SPICE transient requires ngspice-class provider and blocks when unavailable;
- custom chip support is provider capability metadata and blocks when missing;
- diagnostics contain provider id, mode, physics, and blocking reason;
- local static provider does not emit fake instrument readings.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/SimulationInstrumentContract.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+11 cambia render UI/canvas, esegui build e browser verification con
  route, viewport, screenshot, console errors e prova no blank/no overlap.
- Se P+11 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+11.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+11 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+12.
```

## P+11 - Provider And Instrument Expansion Boundary

Goal: prepare Tinkercad-class instrumentation without fake physics.

Target behavior:

- Probes, meters, serial/plotter, microcontroller runtime, SPICE analog and
  custom chip support are provider capabilities.
- Unsupported instruments are visible but blocked with structured diagnostics.
- Local static provider remains honest and narrow.

Likely files:

- `apps/studio/sim/providers/simulationProviders.ts`
- Create `apps/studio/sim/core/instrumentContract.ts`
- Create `apps/studio/src/__tests__/SimulationInstrumentContract.test.ts`

Required tests:

- voltmeter/probe operation is provider-bound;
- serial/plotter requires runtime provider and blocks on local;
- SPICE transient requires ngspice-class provider and blocks when unavailable;
- diagnostics contain provider id, mode, physics, and blocking reason.

Focused command:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationInstrumentContract.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationProviders.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Exit criteria:

- Instruments are modeled as provider-backed capabilities.
- No UI fake readings.

### Session P+11 checkpoint - Provider And Instrument Expansion Boundary (2026-07-08)

Status: completed 2026-07-08 13:35 Europe/Rome.

Scope:

- Executed only P+11 after recovering the local P+10 checkpoint.
- Added a pure instrument capability contract over the existing provider
  profiles.
- Added tests for voltmeter/probe, serial/plotter, SPICE transient, custom-chip
  provider metadata, structured blocking diagnostics, and no fake local
  readings.
- No React render path, canvas, board UI, provider implementation,
  ELABTutor runtime code, vendored solver file, push, merge, deploy, staging,
  reset, clean, `git add -A`, dependency change, or broad refactor occurred.

Superpowers skills used:

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`

Recovery files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Attached prompt text:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
- Existing P+11 source context:
  - `apps/studio/sim/providers/simulationProviders.ts`
  - `apps/studio/sim/core/simulationOperations.ts`
  - `apps/studio/sim/core/simulationRuntime.ts`
  - `apps/studio/sim/core/componentCatalog.ts`
  - `apps/studio/src/__tests__/SimulationProviders.test.ts`
  - `apps/studio/src/__tests__/SimulationOperationsContract.test.ts`
  - `apps/studio/src/__tests__/SingleSimulationRuntimeContract.test.ts`

Prompt/source reconciliation:

- The required attached pasted prompt remains stale at its final continuation
  block.
- The local runbook P+10 checkpoint is newer and gives P+11 as the next
  incomplete block.
- P+11 was executed because this runbook requires using the latest checkpoint
  and doing only the next incomplete P+N block.

Environment verified before code:

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

- Dirty worktree inherited from H+0-H+7/P+0-P+10 plus unrelated product-doc and
  teacher-dashboard changes. P+11 did not modify unrelated product docs.

```bash
git diff --stat
```

- Before P+11 edits: 20 tracked files changed, 2403 insertions and 244
  deletions.

```bash
df -h .
```

- `/System/Volumes/Data`: 460 GiB size, 410 GiB used, 4.5 GiB available,
  99% capacity.

AgentMemory recovery:

- `memory_smart_search` was not exposed in this Codex tool set, so the
  `agentmemory-rest-api` REST endpoint was used.
- Relevant results again included:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
    not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
    as the Simulation Plugin, not a fork or second canvas.

Files changed by P+11:

- `apps/studio/sim/core/instrumentContract.ts`
- `apps/studio/src/__tests__/SimulationInstrumentContract.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:

- Added `simulationInstrumentCapabilities()`.
- Added `evaluateSimulationInstrumentCapability(input)`.
- Modeled instruments:
  - `voltmeter`
  - `probe`
  - `serial-plotter`
  - `spice-transient`
  - `custom-chip`
- Every instrument uses `readingPolicy: "provider-result-only"`.
- Supported local static voltmeter/probe are provider-bound and return no fake
  readings.
- Unsupported instruments return blocker diagnostics containing:
  - provider id;
  - provider mode;
  - required physics;
  - blocking reason;
  - human-readable message.
- SPICE transient and custom chip remain visible provider capabilities but
  blocked until a real provider is available.

Required P+11 tests:

- Voltmeter/probe operation is provider-bound: reached.
- Serial/plotter requires runtime provider and blocks on local: reached.
- SPICE transient requires ngspice-class provider and blocks when unavailable:
  reached.
- Custom chip support is provider capability metadata and blocks when missing:
  reached.
- Diagnostics contain provider id, mode, physics, and blocking reason: reached.
- Local static provider does not emit fake instrument readings: reached.

Commands and results:

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationInstrumentContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Initial RED before helper existed: 1 failed suite, 0 tests collected. Failure:
  missing module `../../sim/core/instrumentContract`.
- First implementation run failed 1 of 5 tests due `FastAPI`/`fastapi` reason
  casing.
- GREEN after normalization fix: 1 test file passed, 5 tests.

```bash
npm --prefix apps/studio run test -- src/__tests__/SimulationInstrumentContract.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

- Passed: 4 test files, 24 tests.

```bash
npm --prefix apps/studio run typecheck
```

- Passed.

```bash
cd apps/studio && npm exec eslint -- sim/core/instrumentContract.ts src/__tests__/SimulationInstrumentContract.test.ts
```

- Passed.

```bash
git diff --check
```

- Passed with no output.

```bash
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

- Passed with no output. Vendored solver drift is zero.

```bash
perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/sim/core/instrumentContract.ts apps/studio/src/__tests__/SimulationInstrumentContract.test.ts
```

- Passed with no output.

Playwright:

- Not run. P+11 stayed model-only/pure TypeScript: it added a provider-backed
  instrument capability contract and node tests, but no rendered UI, canvas,
  route, CSS, DOM behavior, or visual layout changed.

Known warnings and residual risk:

- Instruments are capability metadata and provider-bound evaluation only; no
  final instrument UI or live measurement widgets were added.
- Local static voltmeter/probe support is expressed as provider-bound capability,
  not as a fabricated measurement layer.
- Serial/plotter, SPICE transient, and custom-chip remain blocked until real
  providers exist.
- Disk remains tight at about 4.5 GiB free.
- Unrelated product-doc and teacher-dashboard changes were already dirty and
  were not touched by P+11.

Product claim:

- `provider-instrument-boundary`: reached at contract level.
- `honest-simulation-physics`: strengthened; unsupported instruments are
  visible but blocked with structured diagnostics and empty readings.
- `tinkercad-parity-simulation-postit`: advanced by modeling instruments as
  provider-backed capabilities; not final Tinkercad parity.
- `single-simulation-plugin-runtime` and `no-elabtutor-simulator-fork`:
  preserved.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- editable-wire-ui-handles
- provider-instrument-boundary
- final-scientific-evidence-pack

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+12 - Final Scientific Evidence Pack.

Obiettivo concreto P+12:
- produrre un evidence pack finale per questa long-run P+0-P+12;
- verificare typecheck, focused suites, full Vitest se sostenibile, build,
  lint/delta lint, diff check e solver drift;
- registrare Playwright se qualsiasi UI/canvas/runtime e' stato cambiato in
  P+1-P+12;
- separare chiaramente definitivo, parziale, non ancora Tinkercad parity e
  bloccato da provider/fisica/UI futura;
- non fare commit, push, merge, deploy, staging, reset o clean.

Mandatory verification:
- npm --prefix apps/studio run typecheck
- npm --prefix apps/studio run test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
- npm --prefix apps/studio run build
- npm --prefix apps/studio run lint
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Required focused evidence to preserve if full Vitest/build/lint is blocked:
- P+9 focused:
  npm --prefix apps/studio run test -- src/__tests__/SimulationWireEditor.test.tsx src/__tests__/SimulationWireContract.test.ts src/__tests__/StructuredSceneIntake.test.ts src/__tests__/SimulationPlacementEngineAdapter.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
- P+10 focused:
  npm --prefix apps/studio run test -- src/__tests__/ElabTutorPostitCapabilities.test.ts src/__tests__/SimulationSceneModes.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts src/__tests__/ResponsivePluginFunctions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
- P+11 focused:
  npm --prefix apps/studio run test -- src/__tests__/SimulationInstrumentContract.test.ts src/__tests__/SimulationOperationsContract.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/SingleSimulationRuntimeContract.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Playwright obbligatorio:
- avvia route `/?vista=simulatore`;
- verifica desktop e mobile/tablet se sostenibile;
- seleziona wire, mostra handles, muovi waypoint, retarget endpoint valido,
  endpoint invalido;
- registra route, viewport, screenshot path, console errors, nonblank/no
  incoherent overlap.

Stop rules:
- fermati se disk space impedisce typecheck/build/test e non c'e workaround non
  source;
- fermati se full Vitest/build/lint falliscono e il fix eccede evidence pack;
- fermati se vendored solver drift appare;
- fermati se servono nuove dipendenze;
- fermati se la verifica richiede push, deploy, merge, staging, reset o clean.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+12 final evidence checkpoint;
- includi exact pass/fail counts, warnings, files touched, solver drift,
  Playwright artifacts, claim definitivo/parziale, gap residui Tinkercad,
  suggerimento commit message e PR body.
```

## P+12 - Final Scientific Evidence Pack

Goal: prove the post-it and simulator parity path is no longer just a contract.

Mandatory verification:

```bash
npm --prefix apps/studio run typecheck
npm --prefix apps/studio run test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run build
npm --prefix apps/studio run lint
git diff --check
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

Mandatory Playwright if any UI/canvas/runtime was changed in P+1-P+12:

- desktop viewport;
- tablet/LIM-like viewport;
- narrow viewport;
- two simultaneous Simulation post-its;
- Simulation plus ELABTutor post-it;
- resize post-it from compact to expanded;
- add or verify multiple board scene;
- verify no blank canvas;
- verify no overlapping controls;
- verify console has no runtime errors;
- save screenshot/result paths.

Final handoff must state:

- what is definitive;
- what is still partial;
- exact pass/fail counts;
- warnings;
- files touched;
- drift;
- whether ELABTutor still has any separate simulator path;
- residual Tinkercad gaps by subsystem;
- suggested commit message and PR body;
- next long-run prompt for the following session, unless the entire post-it and
  simulator parity program is actually complete and verified.

### Session P+12 final evidence checkpoint - Post-it and simulator parity evidence (2026-07-08)

Scope executed:

- Recovered the local P+11 checkpoint and executed only P+12 evidence work.
- Corrected the P+10 checkpoint wording after the pack boundary fix: the
  ELABTutor pack now records forbidden private simulator import categories,
  not concrete private runtime filenames.
- No commit, push, merge, deploy, staging, reset, clean, or new dependency was
  performed.

Environment:

- Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Disk before final evidence: `/System/Volumes/Data` showed 4.1 GiB available.
- Dev route used for browser evidence:
  `http://127.0.0.1:5177/?vista=simulatore`

Verification results:

- `npm --prefix apps/studio run typecheck`: passed.
- Full Vitest first pass: failed in `ElabTutorPackBoundary.test.ts` because
  `packs/elab-tutor/postitFunctions.json` still named private runtime tokens
  such as solver/canvas classes in metadata.
- Fix applied: changed those metadata values to private import category names
  and updated the P+10 capability expectation.
- Focused pack boundary rerun plus P+10 suite: passed, 5 test files / 20 tests.
- Full Vitest final pass:
  - test files: 162 passed, 1 skipped, 163 total;
  - tests: 1463 passed, 5 skipped, 1468 total;
  - duration: 69.50 s;
  - warning observed: jsdom printed existing
    `Not implemented: navigation to another Document` messages.
- `npm --prefix apps/studio run build`: passed.
  - warning observed: existing Vite chunk-size warnings for large chunks.
- `npm --prefix apps/studio run lint`: failed on the repository baseline with
  176 problems, 171 errors and 5 warnings. The visible failures were broad and
  unrelated to P+9/P+10/P+11/P+12 files, including `ReplayView.tsx`,
  `Room.tsx`, `RecapView.tsx`, `MathComposer.tsx`, several legacy tests, and
  toolhost support files.
- Scoped lint for touched P+9/P+10/P+11 source and tests: passed.
- `git diff --check`: passed with no output.
- Solver drift check:
  `git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  passed with no output.
- Whitespace scan over touched P+9/P+10/P+11/P+12 files and the runbook: passed
  with no output.

Focused evidence preserved:

- P+9 focused suite: passed, 4 files / 18 tests.
- P+10 focused suite after boundary metadata correction: passed, 5 files / 20
  tests.
- P+11 focused suite: passed, 4 files / 24 tests.

Playwright evidence:

- Desktop viewport 1366x900:
  - screenshot:
    `output/playwright/simulation-wire-editor-p12-desktop.png`
  - console errors: 0;
  - locked endpoint anchors: 2;
  - waypoint handle visible: true;
  - route edit changed only `SimulationWire.path`: true;
  - valid endpoint retarget changed normalized netlist to
    `bb1:bus-top-plus-2`: true;
  - invalid endpoint retarget was rejected with `invalid-wire-endpoint`: true;
  - layout overflow/text overflow problems in the wire editor: 0;
  - PNG 1366x900, 220732 bytes, non-white ratio 0.7169.
- Tablet/LIM-like viewport 1024x768:
  - screenshot:
    `output/playwright/simulation-wire-editor-p12-tablet.png`
  - console errors: 0;
  - locked endpoint anchors: 2;
  - waypoint handle visible: true;
  - valid endpoint retarget changed normalized netlist: true;
  - invalid endpoint retarget was rejected with `invalid-wire-endpoint`: true;
  - layout overflow/text overflow problems in the wire editor: 0;
  - PNG 1024x768, 151657 bytes, non-white ratio 0.6833.
- Narrow viewport 390x844:
  - screenshot:
    `output/playwright/simulation-wire-editor-p12-mobile.png`
  - console errors: 0;
  - locked endpoint anchors: 2;
  - waypoint handle visible: true;
  - route edit changed only `SimulationWire.path`: true;
  - valid endpoint retarget changed normalized netlist to
    `bb1:bus-top-plus-2`: true;
  - invalid endpoint retarget was rejected with `invalid-wire-endpoint`: true;
  - layout overflow/text overflow problems in the wire editor: 0;
  - PNG 390x844, 48250 bytes, non-white ratio 0.5684.
- Dev server was stopped after Playwright.

Files changed in this P+9-P+12 continuation slice:

- `apps/studio/sim/core/simulationWireEditor.ts`
- `apps/studio/sim/core/instrumentContract.ts`
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`
- `apps/studio/src/__tests__/SimulationWireEditor.test.tsx`
- `apps/studio/src/__tests__/ElabTutorPostitCapabilities.test.ts`
- `apps/studio/src/__tests__/SimulationInstrumentContract.test.ts`
- `packs/elab-tutor/postitFunctions.json`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- `output/playwright/simulation-wire-editor-p12-desktop.png`
- `output/playwright/simulation-wire-editor-p12-tablet.png`
- `output/playwright/simulation-wire-editor-p12-mobile.png`

Current dirty tree note:

- The worktree also contains earlier P+0-P+8 tracked edits and untracked source
  files from this long-run. `git diff --stat` reports 20 tracked files changed,
  2403 insertions and 244 deletions, excluding untracked files.

Definitive claims from P+0-P+12:

- Simulation Plugin is the owner of the simulator contract and runtime API.
- ELABTutor is represented as a consumer pack/post-it capability layer and
  depends on `io.ardesia.simulation` plus `simulation-runtime/1`.
- No second ELABTutor simulator path was introduced in this long-run.
- ELABTutor pack metadata does not name or import private solver/canvas/
  breadboard/provider internals.
- Generic post-it object, responsive function surfaces, concurrent post-it
  state isolation, single runtime API, viewport model, multi-board scene model,
  component catalog, placement adapter, editable wire UI, and provider/
  instrument expansion boundary are covered by focused tests.
- Vendored solver drift is zero.

Partial or not yet Tinkercad parity:

- Browser Playwright evidence covers the standalone simulator route and wire
  editor across desktop, tablet, and narrow viewports.
- Browser Playwright evidence does not yet cover a board-hosted UI with two
  simultaneous Simulation post-its, a visible ELABTutor consumer post-it beside
  Simulation, or resize from compact to expanded. The current proof for these
  is model/test-level, not browser-level.
- Instruments are boundary-correct but not fully live: voltmeter/probe are
  provider-result-only, serial plotter/SPICE/custom chip capabilities block
  honestly when provider support is unavailable.
- Tinkercad-level freeform drag/drop placement, richer wire canvas editing,
  broader component library, microcontroller execution, SPICE transient
  simulation, custom chip emulation, and final ELABTutor content UI remain
  future work.

Suggested commit message:

```text
feat(simulation): advance post-it parity contracts and evidence
```

Suggested PR body:

```text
Summary
- Adds editable wire handle behavior with route-only edits separated from
  normalized netlist changes.
- Declares ELABTutor post-it capabilities around the shared Simulation Plugin
  runtime without private simulator imports.
- Adds provider/instrument expansion boundaries and final evidence notes for
  the P+0-P+12 long-run.

Verification
- typecheck: pass
- full Vitest: 162 files passed, 1 skipped; 1463 tests passed, 5 skipped
- build: pass with existing chunk-size warnings
- lint: full repo baseline fails with 176 existing problems; scoped lint for
  touched P+9/P+10/P+11 files passes
- git diff --check: pass
- solver drift: none
- Playwright: desktop/tablet/mobile simulator route screenshots saved with 0
  console errors and nonblank/no-overflow wire editor evidence

Residual risk
- Browser evidence for multi post-it host and ELABTutor consumer post-it is
  still missing.
- This is not full Tinkercad parity; provider physics, instruments,
  microcontroller runtime, custom chips, and richer UI remain partial.
- Score PRIMA/DOPO: n/a for ARDESIA; no `evaluate-v3.sh` gate exists in this
  worktree.
```

## Stop Rules

Stop immediately and write a blocker if:

- disk space prevents typecheck/build/test and a non-source workaround is not
  enough;
- a focused test fails and the fix would exceed the current slice;
- typecheck fails;
- full Vitest fails in a block where it is mandatory;
- build fails in a block where it is mandatory;
- vendored solver drift appears;
- a new dependency is needed;
- implementation would require push, deploy, merge, reset, clean, staging, or
  broad unrelated UI shell work.

## Immediate Next Prompt

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+12.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+13 - Browser-hosted Multi Post-it Evidence.

Obiettivo concreto P+13:
- colmare il gap Playwright rimasto da P+12;
- rendere verificabile in browser una board/host con due Simulation post-it e
  un ELABTutor consumer post-it accanto allo stesso Simulation Plugin;
- provare resize compact -> normal -> expanded da UI o harness prodotto;
- provare che DOM ids, hover/proximity, provider diagnostics e solver output
  restano instance-scoped;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard/provider privati dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dai contratti esistenti:
  apps/studio/src/toolhost/postitObject.ts
  apps/studio/src/toolhost/pluginFunctions.ts
  apps/studio/src/__tests__/PluginPostitConcurrency.test.ts
  apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts
- Se manca una superficie browser stabile, crea il piu' piccolo harness
  prodotto/dev-only gia' coerente con il toolhost, non una demo finta.
- Riusa il Simulation Plugin runtime pubblico e i descriptor ELABTutor.
- Non introdurre nuove dipendenze.

Required tests:
- render di due Simulation post-it: mutare/resize una istanza non cambia
  l'altra;
- render Simulation + ELABTutor consumer: ELABTutor punta al Simulation runtime
  pubblico e non a un canvas/solver proprio;
- compact/normal/expanded sono derivati da bounds/proximity, non da branch
  plugin-specifici nel host;
- nessun duplicate DOM id fra istanze;
- diagnostics/provider output sono agganciati all'instanceId corretto;
- source guard: nessun import privato solver/canvas/breadboard/provider nel
  consumer ELABTutor.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright obbligatorio:
- avvia la route/harness browser multi post-it;
- verifica desktop, tablet/LIM e narrow;
- screenshot per ogni viewport;
- prova due Simulation post-it simultanei;
- prova Simulation + ELABTutor consumer post-it;
- prova resize compact -> expanded;
- registra route, viewport, screenshot path, console errors, nonblank/no
  incoherent overlap.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+13.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+13 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright, claim prodotto, rischi residui e
  prossimo prompt long-run completo.
```

### Session P+13 checkpoint - Browser-hosted Multi Post-it Evidence (2026-07-08)

Scope executed:

- Recovered from the P+12 checkpoint and executed only P+13.
- Used `superpowers:using-superpowers`, `executing-plans`,
  `using-git-worktrees`, `test-driven-development`,
  `verification-before-completion`, local `recall`, and
  `agentmemory-rest-api`.
- AgentMemory live recall confirmed the two active Andrea directives:
  board plugin objects must be post-it objects with simultaneous/responsive
  contextual functions, and ELABTutor must consume the same Simulation Plugin
  runtime without a second simulator/canvas.
- No commit, push, merge, deploy, staging, reset, clean, or dependency install
  was performed.

Files read:

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- P+12/P+13 section in this runbook
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/toolhost/pluginFunctions.ts`
- `apps/studio/src/__tests__/PluginPostitConcurrency.test.ts`
- `apps/studio/src/__tests__/ResponsivePluginFunctions.test.ts`
- `apps/studio/src/App.tsx`
- `apps/studio/src/design/ViewNav.tsx`
- `apps/studio/src/store/simulationPluginView.ts`
- `packs/elab-tutor/postitFunctions.json`

Files changed in P+13:

- `apps/studio/src/App.tsx`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/types/elab-pack.d.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Playwright artifacts:
  - `output/playwright/multi-postit-p13-desktop.png`
  - `output/playwright/multi-postit-p13-tablet.png`
  - `output/playwright/multi-postit-p13-mobile.png`

Implementation:

- Added route `/?vista=simulatore-postit` through `App.tsx`.
- Added `MultiPostitWorkbench`, a browser-hosted board evidence surface using
  the real `createPluginPostitObject`, `pluginPostitControlIds`,
  `resizePluginPostitObject`, `scopePluginPostitProviderOutput`, and
  `derivePluginFunctionSurface` contracts.
- Rendered two Simulation Plugin post-it instances (`sim-a`, `sim-b`) and one
  ELABTutor consumer post-it (`elab-consumer`).
- ELABTutor consumer reads `postitFunctions.json` through the typed
  `@elab-pack/postitFunctions.json` boundary and points at
  `simulation-runtime/1` on `sim-a`.
- No solver, canvas, breadboard, placement, wire renderer, AVR bridge, or
  provider internals are imported by the P+13 consumer route.
- Resize controls prove `compact -> expanded` for `sim-a`; `sim-b` remains
  normal and state-isolated.
- Provider diagnostics and solver output rows are attached to instance ids.

TDD evidence:

- RED:
  `npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  failed because `[data-testid="multi-postit-workbench"]` was absent.
- GREEN:
  same command passed after implementation, 1 file / 2 tests.

Verification:

- Focused P+13 suite:
  `npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  passed, 4 files / 17 tests.
- `npm --prefix apps/studio run typecheck`: passed.
- Scoped lint:
  `cd apps/studio && npm exec eslint -- src/App.tsx src/design/MultiPostitWorkbench.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx src/types/elab-pack.d.ts`
  passed.
- `npm --prefix apps/studio run build`: passed.
  - warning observed: existing Vite chunk-size warnings remain.
  - new route chunk: `MultiPostitWorkbench-*.js`, about 11.30 kB.
- `git diff --check`: passed with no output.
- Solver drift check:
  `git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  passed with no output.
- Whitespace scan over P+13 files and the runbook: passed with no output.
- Dev server on `127.0.0.1:5177` was stopped after Playwright; final `lsof`
  showed no listener.

Playwright evidence:

- Route:
  `http://127.0.0.1:5177/?vista=simulatore-postit`
- Desktop viewport 1366x900:
  - screenshot: `output/playwright/multi-postit-p13-desktop.png`
  - console errors: 0
  - post-it instances: `sim-a`, `sim-b`, `elab-consumer`
  - Simulation post-its: 2
  - ELABTutor post-its: 1
  - duplicate `plugin-postit-*` DOM ids: 0
  - ELAB runtime API: `simulation-runtime/1`
  - ELAB simulation instance: `sim-a`
  - private ELAB canvas nodes: 0
  - selecting LED on `sim-a` leaves `sim-b` selected component as `nessuno`
  - `sim-a` resize mode compact then expanded: reached
  - `sim-b` function surface remains normal
  - PNG 1366x1119, 67677 bytes, non-white ratio 0.8138
  - layout visible problems: 0
- Tablet/LIM viewport 1024x768:
  - screenshot: `output/playwright/multi-postit-p13-tablet.png`
  - same DOM/state assertions passed
  - PNG 1024x1513, 74794 bytes, non-white ratio 0.8356
  - layout visible problems: 0
- Narrow viewport 390x844:
  - screenshot: `output/playwright/multi-postit-p13-mobile.png`
  - same DOM/state assertions passed
  - PNG 390x1561, 72643 bytes, non-white ratio 0.8007
  - layout visible problems: 0

Product claim:

- P+13 closes the P+12 browser-evidence gap for simultaneous post-it behavior:
  there is now a browser route proving two Simulation post-it instances plus
  one ELABTutor consumer post-it, instance-scoped DOM ids, provider diagnostics,
  solver output rows, and resize-derived function surfaces.
- ELABTutor still does not own a separate simulator in this route; it points to
  `sim-a` through `simulation-runtime/1`.

Residual gaps:

- The P+13 route is a board-host evidence surface, not yet the full production
  Excalidraw/Room board persistence path.
- Export/import restore of these plugin post-it objects is not yet proven.
- Full Tinkercad parity remains partial: live drag/drop circuit placement,
  richer wire editing, instruments, microcontroller runtime, SPICE/custom chip
  providers, undo/redo, and production ELABTutor UI remain future work.
- Full repo lint was not rerun in P+13 because P+12 already established a broad
  unrelated baseline failure; scoped lint for touched P+13 files passed.

Next prompt:

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+13.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+14 - Board Persistence And Export/Import Evidence For Plugin
Post-its.

Obiettivo concreto P+14:
- spostare la prova P+13 dal solo harness browser verso persistenza board reale;
- dimostrare che gli oggetti plugin post-it Simulation/ELABTutor possono essere
  serializzati e restaurati senza perdere instanceId, pluginId, bounds, function
  surface mode, provider diagnostics e collegamento ELABTutor -> Simulation;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard/provider privati dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti da:
  apps/studio/src/toolhost/postitObject.ts
  apps/studio/src/design/MultiPostitWorkbench.tsx
  apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx
  apps/studio/src/toolhost/subPostitObject.ts
  eventuali contratti export/import esistenti in WorkspaceStore/Room.
- Se l'export/import reale di Room e' troppo ampio, crea un contratto puro e
  un harness prodotto minimale che usa lo stesso payload serializzato, senza
  demo finta.
- Non introdurre nuove dipendenze.

Required tests:
- serializzare due Simulation post-it + un ELABTutor consumer e restaurarli
  preserva instance ids e plugin ids;
- bounds e resize mode compact/normal/expanded sopravvivono al restore;
- provider diagnostics/solver output restano agganciati all'instanceId corretto;
- ELABTutor restore mantiene `simulationInstanceId` e `simulation-runtime/1`;
- nessun duplicate DOM id dopo restore;
- source guard: nessun import privato solver/canvas/breadboard/provider nel
  consumer ELABTutor.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- npm --prefix apps/studio run build
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- se P+14 cambia render UI/harness, avvia la route necessaria e registra route,
  viewport, screenshot, console errors, nonblank/no incoherent overlap;
- prova restore visibile dopo export/import o reload harness.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+14.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+14 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Session P+14 Checkpoint - Board Persistence And Export/Import Evidence

Date: 2026-07-08
Branch: `docs/simulation-plugin-v2-contract-20260707`
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`

### Recovery / Files Read

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  from P+13/P+14 scope
- `docs/architecture/simulation-plugin-v2.md` and product/canon context via
  recovered long-run attachment
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/toolhost/subPostitObject.ts`
- Skills read this turn: `superpowers:using-superpowers`,
  `executing-plans`, `test-driven-development`,
  `using-git-worktrees`, `verification-before-completion`, `playwright`.

### Files Changed

- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Screenshot artifacts:
- `output/playwright/multi-postit-p14-desktop.png`
- `output/playwright/multi-postit-p14-tablet.png`
- `output/playwright/multi-postit-p14-mobile.png`

### Product Claim

P+14 adds a real host-side snapshot contract for the P+13 browser evidence
board:

- `createMultiPostitWorkbenchPostits()` creates the two Simulation post-its
  and one ELABTutor consumer post-it from real `PluginPostitObject` contracts.
- `serializeMultiPostitWorkbench()` serializes a cloned payload with schema
  `multi-postit-workbench-state/1`.
- `restoreMultiPostitWorkbench()` restores fail-closed and validates:
  instance/plugin ids, bounds, Simulation provider output ownership,
  diagnostics/solver output shape, and ELABTutor
  `simulationInstanceId` + `simulation-runtime/1`.
- Browser route `/?vista=simulatore-postit` now has export/restore controls.
  The visible flow exports the three plugin post-its, mutates `sim-a`, restores
  from snapshot, and returns `sim-a` to `nessuno` / function mode `normal`.
- ELABTutor remains a consumer of `sim-a`; no second ELABTutor simulator,
  private canvas, private solver, private breadboard, or provider fork was
  introduced.

### TDD Evidence

Initial RED after adding tests:

```text
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 failed file, 4 tests total, 2 failed:
- createMultiPostitWorkbenchPostits is not a function
- missing button "esporta post-it"
```

Green after implementation:

```text
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 passed file, 4 passed tests
```

Focused P+14 suite:

```text
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

4 passed files, 19 passed tests
```

### Gates

- `npm --prefix apps/studio run typecheck` -> pass.
- `cd apps/studio && npm exec eslint -- src/design/MultiPostitWorkbench.tsx src/design/multiPostitWorkbenchModel.ts src/__tests__/BrowserHostedMultiPostit.test.tsx` -> pass.
  - Intermediate lint caught `react-refresh/only-export-components`; fixed by
    moving exported helpers from the component file into
    `multiPostitWorkbenchModel.ts`.
- `npm --prefix apps/studio run build` -> pass.
  - Existing Vite chunk-size warnings remain.
- `git diff --check` -> pass.
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components` -> empty.
- Dev server on `127.0.0.1:5177` stopped; final `lsof -tiTCP:5177 -sTCP:LISTEN` empty.

### Playwright Evidence

Route tested:

```text
http://127.0.0.1:5177/?vista=simulatore-postit
```

Flow on desktop/tablet/mobile:

1. Click `esporta post-it`.
2. Assert exported count `3` and status `snapshot-ready`.
3. Click `seleziona LED su sim-a`.
4. Click `riduci sim-a`.
5. Assert `sim-a` selected component `led-a` and function mode `compact`.
6. Click `ripristina post-it`.
7. Assert restore status `restored`, `sim-a` selected component `nessuno`,
   function mode `normal`, ELABTutor link `sim-a`, runtime API
   `simulation-runtime/1`.

Viewport results:

- Desktop `1440x980`: screenshot 61,850 bytes; 3 post-its; 2 Simulation; 1
  ELABTutor; duplicate IDs 0; zero-sized elements 0; horizontal overflow false;
  console errors 0.
- Tablet `820x1180`: screenshot 74,402 bytes; same assertions pass.
- Mobile `390x844`: screenshot 73,203 bytes; same assertions pass.

### Residual Risk

- P+14 proves a durable serialized payload and visible export/restore harness,
  not yet actual `Room` / `WorkspaceStore` persistence.
- No browser reload/local-storage persistence was added.
- Full repository lint is still not used as a completion gate because the
  inherited baseline is known dirty; scoped lint for touched files passed.

## Immediate Next Prompt P+15

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+14.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- board-persistence-plugin-postits
- multi-postit-workbench-state
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+15 - Real Board Persistence Wiring For Plugin Post-its.

Obiettivo concreto P+15:
- collegare il payload P+14 a un percorso reale di persistenza board
  `Room` / `WorkspaceStore` o al contratto board esistente piu' vicino;
- dimostrare che un board export/import reale mantiene due Simulation post-it
  e un ELABTutor consumer senza perdere instanceId, pluginId, bounds, function
  surface mode, provider diagnostics, solver output e link ELABTutor -> sim-a;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze.

Approccio:
- Test-first.
- Parti da:
  apps/studio/src/design/multiPostitWorkbenchModel.ts
  apps/studio/src/design/MultiPostitWorkbench.tsx
  apps/studio/src/toolhost/postitObject.ts
  apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx
  eventuali export/import reali in `Room` / `WorkspaceStore`.
- Se `Room` / `WorkspaceStore` e' troppo ampio, crea un adapter minimo ma reale
  lato board che usa lo stesso payload P+14 e puo' essere sostituito dal Room
  store senza cambiare schema.

Required tests:
- RED prima della fix.
- export/import board reale o adapter board reale serializza e restaura i tre
  plugin post-it;
- restore mantiene `simulation-runtime/1` e `simulationInstanceId: sim-a`;
- provider diagnostics e solver output restano instance-scoped;
- bounds e function surface mode compact/normal/expanded sopravvivono;
- source guard esteso: nessun import privato solver/canvas/breadboard/provider
  in ELABTutor consumer o adapter board;
- nessun duplicate DOM id dopo restore se c'e' render UI.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- npm --prefix apps/studio run build
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- se tocchi UI/harness, prova `/?vista=simulatore-postit`;
- registra route, viewport, screenshot, console errors,
  nonblank/no incoherent overlap;
- prova export/import o reload board visibile, non solo helper puro.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+15.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+15 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Session P+15 Checkpoint - Real Board Persistence Wiring For Plugin Post-its

Date: 2026-07-08
Branch: `docs/simulation-plugin-v2-contract-20260707`
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`

### Recovery / Files Read

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  from P+14/P+15 scope
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- Referenced attachment:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
  read in full. Its final immediate prompt is stale at P+2; the local
  runbook checkpoint is authoritative.
- `apps/studio/src/Room.tsx`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/caps/board.ts`
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/store/lessonBundle.ts`
- `apps/studio/src/store/zipBundle.ts`
- `apps/studio/src/store/types.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/__tests__/WorkspaceStore.test.ts`
- `apps/studio/src/__tests__/LessonBundle.test.ts`
- `apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx`

Skills used:
- `superpowers:using-superpowers`
- `test-driven-development`
- `executing-plans`
- `using-git-worktrees`
- `verification-before-completion`

Worktree isolation:
- `git rev-parse --git-dir`:
  `/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
- `git rev-parse --git-common-dir`:
  `/Users/andreamarro/VOLUME 3/ardesia/.git`
- `git rev-parse --show-superproject-working-tree`: empty.
- Result: already in linked worktree; no new worktree created.

AgentMemory recovery:
- REST smart-search returned the same two high-signal decisions:
  - `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it
    objects, not fixed-size panels.
  - `mem_mrbvljxn_618783dd35c6`: ELABTutor must use the same simulator as
    the Simulation Plugin; no fork / second canvas.

### Files Changed

- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

No push, merge, deploy, staging, reset, clean, dependency install, or
vendored solver edit.

### Implementation

P+15 adds a board persistence adapter for the P+14 multi-post-it payload:

- `createPluginPostitBoardScene(postits)` turns the two Simulation post-its
  plus one ELABTutor consumer into real Excalidraw-like board elements.
- Each element stores state in `customData[EMBED_DATA_KEY]`, using the existing
  board marker key `maestroTool`.
- Each marker includes:
  - owner marker `pluginId#instanceId` via `instanceOwner()`;
  - schema `plugin-postit-board-state/1`;
  - serialized `PluginPostitObject` state.
- Board element geometry (`x`, `y`, `width`, `height`) is authoritative on
  restore, so a board resize/move survives even if the embedded state still
  has older bounds.
- `restorePluginPostitsFromBoardScene(scene)` reads board elements, validates
  marker owner/link/id consistency, restores the post-it state, applies board
  element bounds, and reuses the P+14 workbench restore validation.

This connects the post-it payload to the existing real persistence path:

```text
board.excalidraw JSON
  -> WorkspaceStore.saveScene(room)
  -> exportLesson(...). raw/board.excalidraw
  -> importLesson(...)
  -> WorkspaceStore.loadScene(room)
  -> restorePluginPostitsFromBoardScene(...)
```

### TDD Evidence

RED:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 failed suite, 0 tests collected:
- failed to resolve import "../design/multiPostitBoardPersistence"
```

GREEN isolated:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 passed file, 2 passed tests
```

Focused P+15 suite:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

5 passed files, 21 passed tests
```

Intermediate focused run exposed one existing lazy-route race in
`BrowserHostedMultiPostit.test.tsx`: `findByTestId` timed out while `App` was
still in the Suspense fallback. The production runtime was unchanged; the test
now uses an explicit 5000ms wait for the lazy route.

### Gates

- `npm --prefix apps/studio run typecheck` -> exit 0.
- `cd apps/studio && npm exec eslint -- src/design/multiPostitBoardPersistence.ts src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx` -> exit 0.
- `npm --prefix apps/studio run build` -> exit 0.
  - Existing Vite chunk-size warnings remain.
- `git diff --check` -> exit 0, no output.
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components` -> exit 0, no output.
- Whitespace scan over P+15 files -> no output.

### Playwright

Not run for P+15. This slice added a pure board persistence adapter and tests
around `WorkspaceStore` / `.lesson` export-import. It did not change rendered
UI, CSS, DOM structure, canvas behavior, or runtime route behavior. The only
browser-test change was increasing the lazy-route wait timeout.

### Product Claim

P+15 moves P+14 from a browser-only snapshot to the real ARDESIA board
persistence route:

- plugin post-it state is stored inside board elements, not in a side store;
- `.lesson` export/import carries those board elements through
  `raw/board.excalidraw`;
- restore preserves two Simulation instances and one ELABTutor consumer;
- board element bounds survive restore and drive compact/expanded function
  mode;
- provider diagnostics and solver output stay instance-scoped;
- ELABTutor still points to `simulationInstanceId: sim-a` and
  `simulation-runtime/1`;
- adapter source guard confirms no private solver/canvas/breadboard/provider
  import and no ELABTutor runtime fork.

### Residual Risk

- P+15 proves the real board persistence/export/import data path, but it does
  not yet render these P+15 plugin post-it board elements through `Room`.
- The adapter is adjacent to the P+14 workbench model and can be moved into a
  generic toolhost layer later; P+15 intentionally avoided a broad host
  refactor.
- No browser reload visual proof exists yet for P+15 board elements.
- Full repository lint remains outside the slice because the broad inherited
  baseline is known dirty; scoped lint passed for touched files.

## Session P+16 Checkpoint - Visible Board Reload Evidence

Date: 2026-07-08
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
Branch: `docs/simulation-plugin-v2-contract-20260707`

### Scope

P+16 connected the P+15 board-element payload to visible browser evidence in
the existing `?vista=simulatore-postit` route.

The route can now:

- render two Simulation post-its and one ELABTutor consumer;
- save the currently rendered plugin post-its into a board scene using
  `createPluginPostitBoardScene`;
- mutate the visible UI after that save;
- reload from the saved board scene through
  `restorePluginPostitsFromBoardScene`;
- present the restored state as the same three visible post-it cards.

This is still intentionally a narrow visible harness, not the full `Room`
hydration path.

### Files Read

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  from the latest P+15 checkpoint
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/App.tsx`

Memory recovery note: the `recall` skill was read, but the backing
`memory_smart_search` tool was not exposed in this session. P+16 used the local
runbook and checked-in contracts as the operational source of truth.

### Files Changed

- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Playwright artifacts:

- `output/playwright/multi-postit-p16-desktop.png`
- `output/playwright/multi-postit-p16-tablet.png`
- `output/playwright/multi-postit-p16-mobile.png`

### RED

```text
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 failed file, 5 tests total, 1 failed / 4 passed
Failure: unable to find button "salva board post-it"
```

The failure proved the route had visible post-its but no visible board-scene
save/reload path.

### Implementation

- Added source guard coverage for `multiPostitBoardPersistence.ts` in the
  browser-hosted route test.
- Added a visible browser test that:
  - compacts `sim-a`;
  - saves the board-scene payload;
  - mutates `sim-a` to selected LED and normal size;
  - reloads from the board scene;
  - verifies three rendered plugin post-its, no duplicate control IDs,
    compact mode restored from board bounds, provider diagnostics, solver
    output, and ELABTutor `simulation-runtime/1 -> sim-a` link.
- Added board-scene state to `MultiPostitWorkbench` with two controls:
  - `salva board post-it`;
  - `ricarica board post-it`.

### Tests

Isolated browser route after implementation:

```text
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 passed file, 5 passed tests
```

Focused P+16 suite:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

5 passed files, 22 passed tests
```

### Gates

- `npm --prefix apps/studio run typecheck` -> exit 0.
- `cd apps/studio && npm exec eslint -- src/design/MultiPostitWorkbench.tsx src/design/multiPostitBoardPersistence.ts src/__tests__/BrowserHostedMultiPostit.test.tsx`
  -> exit 0.
- `npm --prefix apps/studio run build` -> exit 0.
  - Existing Vite chunk-size warnings remain.
- `git diff --check` -> exit 0, no output.
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  -> exit 0, no output.

### Playwright

Dev server:

```text
npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5177
```

First browser automation command used CommonJS `require` and failed because the
package runs as ESM in this repo. The same verification was rerun with
`node --input-type=module` and passed.

Verified route:

```text
http://127.0.0.1:5177/?vista=simulatore-postit
```

Viewport results:

```text
desktop 1440x1000: 0 console errors, 3 instances, sim-a compact, ELABTutor -> sim-a, 0 card overlaps, screenshot 64443 bytes
tablet  900x1000:  0 console errors, 3 instances, sim-a compact, ELABTutor -> sim-a, 0 card overlaps, screenshot 63464 bytes
mobile  390x844:   0 console errors, 3 instances, sim-a compact, ELABTutor -> sim-a, 0 card overlaps, screenshot 76969 bytes
```

Screenshots were visually inspected for desktop and mobile. The cards are
distinct, toolbar wraps on mobile, and no incoherent overlap was observed.

### Product Claim

P+16 proves that the P+15 plugin post-it board payload is not only a pure
persistence artifact:

- the saved board scene can be loaded back into the visible post-it host;
- all three plugin post-its render distinctly after reload;
- board element bounds drive function surface mode (`sim-a` reloads compact);
- Simulation provider diagnostics and solver output remain instance-scoped;
- ELABTutor remains a consumer of `simulation-runtime/1` for `sim-a`;
- no ELABTutor-owned second simulator was introduced;
- source guard still prevents private solver/canvas/breadboard/provider imports.

### Residual Risk

- The visible proof still lives in the dedicated browser evidence route, not in
  the production `Room` Excalidraw hydration path.
- The route uses in-memory board-scene state, while P+15 already proved
  `.lesson` export/import. P+17 should connect the same payload closer to
  `Room` / `ToolCanvasEmbeddable` / `WorkspaceStore` load behavior.
- Full repo lint remains outside this slice because the broader worktree is
  inherited and dirty; scoped lint passed.

## Immediate Next Prompt P+17

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+16.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- board-persistence-plugin-postits
- visible-board-reload-plugin-postits
- room-board-plugin-postit-hydration
- multi-postit-workbench-state
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+17 - Room/ToolCanvasEmbeddable Hydration For Plugin Post-it Board Elements.

Obiettivo concreto P+17:
- portare la prova P+16 un passo piu' vicino al board host reale;
- dimostrare che una scena `board.excalidraw` persistita con tre plugin
  post-it puo' essere caricata da `WorkspaceStore`/Room o da un adapter
  direttamente riusabile da `Room`/`ToolCanvasEmbeddable`;
- evitare una seconda UI parallela: se il render completo in `Room` e' troppo
  ampio, esponi un adapter/hook/toolhost helper che legge gli stessi board
  elements P+15 e produce render model consumabili dal board host;
- preservare instanceId, pluginId, bounds, function surface mode, provider
  diagnostics, solver output e link ELABTutor -> sim-a;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze.

Approccio:
- Test-first.
- Parti da:
  apps/studio/src/design/multiPostitBoardPersistence.ts
  apps/studio/src/design/MultiPostitWorkbench.tsx
  apps/studio/src/Room.tsx
  apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx
  apps/studio/src/toolhost/caps/board.ts
  apps/studio/src/store/WorkspaceStore.ts
- Cerca il punto piu' piccolo dove il board host puo' riconoscere gli embed
  `plugin-postit-board-state/1`.
- Non refactorare Room o Excalidraw se un adapter puro con test chiude meglio
  la tranche.

Required tests:
- RED prima della fix.
- scena board salvata con tre plugin post-it, caricata da store/Room adapter,
  produce tre render model o tre nodi renderizzabili coerenti;
- nessun duplicate DOM/control id dopo restore/hydration;
- board element bounds guidano compact/normal/expanded;
- provider diagnostics/solver output restano instance-scoped;
- ELABTutor render/model mantiene `simulation-runtime/1` e
  `simulationInstanceId: sim-a`;
- source guard esteso: nessun import privato solver/canvas/breadboard/provider
  nel nuovo adapter/hook/Room bridge.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Se aggiungi un nuovo test P+17, includilo esplicitamente nel focused command.

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- npm --prefix apps/studio run build
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- se tocchi UI/harness/Room, prova `/?vista=simulatore-postit` o la route Room
  usata;
- registra route, viewport, screenshot, console errors,
  nonblank/no incoherent overlap;
- prova reload/import visibile o hydration visibile, non solo helper puro.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+17.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+17 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Session P+17 Checkpoint - Room/ToolCanvas Hydration Adapter

Date: 2026-07-08
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
Branch: `docs/simulation-plugin-v2-contract-20260707`

### Scope

P+17 moved the P+15/P+16 board payload one step closer to the real board host
without refactoring `Room` or Excalidraw.

The new adapter reads a persisted `board.excalidraw` scene through a
`WorkspaceStore`-compatible `loadScene(room)` interface and produces
Room/ToolCanvas-consumable render models for plugin post-it board elements.

This is intentionally an adapter/hydration slice, not the final `Room`
renderer.

### Superpowers Skills Used

- `superpowers:using-superpowers`
- `superpowers:test-driven-development`
- `superpowers:executing-plans`
- `superpowers:verification-before-completion`
- `superpowers:using-git-worktrees`

### Files Read

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  from P+16
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/caps/board.ts`
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- local skill docs for `recall` and `agentmemory-rest-api`

### Environment

- `pwd` -> `/Users/andreamarro/ardesia-wt/tutor-ux`
- branch -> `docs/simulation-plugin-v2-contract-20260707`
- linked worktree:
  - `GIT_DIR=/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/tutor-ux`
  - `GIT_COMMON=/Users/andreamarro/VOLUME 3/ardesia/.git`
  - no superproject
- `df -h .` -> 3.0 GiB available, 100% capacity display

Memory recovery:

```text
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search ...
```

Relevant results:

- `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
  not fixed-size panels.
- `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
  as the Simulation Plugin, not a fork or second canvas.

### Files Changed

- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

### RED

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 failed file, 3 tests total, 2 failed / 1 passed
Failures:
- adapter source did not contain loadPluginPostitBoardHydrationFromStore
- loadPluginPostitBoardHydrationFromStore is not a function
```

### Implementation

Added the smallest board-host hydration adapter to
`multiPostitBoardPersistence.ts`:

- `PluginPostitBoardSceneStore`
- `PluginPostitBoardRenderModel`
- `PluginPostitBoardHydration`
- `loadPluginPostitBoardHydrationFromStore(store, room)`
- `hydratePluginPostitBoardScene(scene, room)`

The adapter:

- loads scene JSON through a `WorkspaceStore`-compatible `loadScene(room)`;
- parses the board scene;
- restores only elements with `plugin-postit-board-state/1`;
- ignores ordinary teacher board elements;
- emits render models with `elementId`, `link`, `owner`, `instanceId`,
  `pluginId`, `bounds`, `zIndex`, interaction state, function surface mode,
  control IDs, Simulation provider output, and ELABTutor runtime link.

It imports only the existing public post-it/workbench contracts. It does not
import private solver/canvas/breadboard/provider internals and does not create
an ELABTutor simulator path.

### Tests

Isolated P+17 test:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 passed file, 3 passed tests
```

Focused P+17 suite:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

5 passed files, 23 passed tests
```

### Gates

- `npm --prefix apps/studio run typecheck` -> exit 0.
- `cd apps/studio && npm exec eslint -- src/design/multiPostitBoardPersistence.ts src/__tests__/BoardPluginPostitPersistence.test.ts`
  -> exit 0.
- `npm --prefix apps/studio run build` -> exit 0.
  - Existing Vite chunk-size warnings remain.
- `git diff --check` -> exit 0, no output.
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  -> exit 0, no output.
- Extra whitespace scan on touched untracked files -> no output.

### Playwright

Not run for P+17. This slice added a pure adapter and tests. It did not change
rendered UI, `Room`, Excalidraw runtime, DOM structure, canvas behavior, CSS, or
the browser evidence route. P+16 remains the latest browser visual proof.

### Product Claim

P+17 proves that a persisted board scene with three plugin post-it board
elements can be loaded through the same store boundary `Room` uses and converted
to board-host render models:

- three post-it render models are produced from the persisted board scene;
- ordinary teacher board elements are ignored;
- element ids, owners, plugin ids, instance ids, bounds, z-order and interaction
  state are preserved;
- board bounds drive compact/normal/expanded mode;
- provider diagnostics and solver output remain instance-scoped;
- ELABTutor remains linked to `simulation-runtime/1` and `sim-a`;
- duplicate DOM/control IDs are prevented at render-model level;
- no private simulator internals or ELABTutor runtime fork were introduced.

### Residual Risk

- `Room.renderEmbeddable` still does not render `plugin-postit-board-state/1`
  elements directly. P+17 only provides the adapter that `Room` or
  `ToolCanvasEmbeddable` can consume.
- P+16 remains the visible proof route; P+18 should wire or demonstrate a
  real `Room` render/hydration path.
- Full repo lint remains outside this slice because the inherited worktree is
  dirty; scoped lint passed.

## Immediate Next Prompt P+18

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+17.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- board-persistence-plugin-postits
- visible-board-reload-plugin-postits
- room-board-plugin-postit-hydration
- room-render-plugin-postits
- multi-postit-workbench-state
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+18 - Room Render Path For Plugin Post-it Board Elements.

Obiettivo concreto P+18:
- usare l'adapter P+17 per collegare gli elementi `plugin-postit-board-state/1`
  al render path di `Room`/`ToolCanvasEmbeddable` o a un harness Room minimo;
- dimostrare con test e, se tocchi UI, Playwright che una scena
  `board.excalidraw` persistita con tre plugin post-it viene caricata e resa
  visibile attraverso il percorso Room/board host, non solo nel workbench
  parallelo;
- preservare instanceId, pluginId, bounds, function surface mode, provider
  diagnostics, solver output e link ELABTutor -> sim-a;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze.

Approccio:
- Test-first.
- Parti da:
  apps/studio/src/design/multiPostitBoardPersistence.ts
  apps/studio/src/design/MultiPostitWorkbench.tsx
  apps/studio/src/Room.tsx
  apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx
  apps/studio/src/toolhost/caps/board.ts
  apps/studio/src/store/WorkspaceStore.ts
- Cerca il punto piu' piccolo dove `renderToolCanvasEmbeddable` o un helper
  chiamabile da `Room.renderEmbeddable` riconosce `plugin-postit-board-state/1`.
- Non riscrivere `Room` o Excalidraw; aggiungi solo il bridge necessario.

Required tests:
- RED prima della fix.
- scena board salvata con tre plugin post-it produce tre nodi/render models
  attraverso il nuovo Room/ToolCanvas render path;
- nessun duplicate DOM/control id dopo hydration/render;
- board element bounds guidano compact/normal/expanded;
- provider diagnostics/solver output restano instance-scoped;
- ELABTutor mantiene `simulation-runtime/1` e `simulationInstanceId: sim-a`;
- source guard esteso: nessun import privato solver/canvas/breadboard/provider
  nel bridge Room/ToolCanvas.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Se aggiungi un nuovo test P+18, includilo esplicitamente nel focused command.

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- npm --prefix apps/studio run build
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- se tocchi UI/harness/Room/ToolCanvas render, prova la route Room usata e/o
  `/?vista=simulatore-postit`;
- registra route, viewport, screenshot, console errors,
  nonblank/no incoherent overlap;
- prova hydration visibile, non solo helper puro.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+18.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+18 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Session P+18 Checkpoint - Room Render Path For Plugin Post-it Board Elements

Date: 2026-07-08
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
Branch: `docs/simulation-plugin-v2-contract-20260707`

### Scope

P+18 connected persisted `plugin-postit-board-state/1` board elements to the
real `Room` / `ToolCanvasEmbeddable.renderEmbeddable` render path.

This slice keeps P+17 export/import hydration strict and adds a render-only
bridge that tolerates the normalized element shape Excalidraw passes at render
time.

### Superpowers Skills Used

- `superpowers:using-superpowers`
- `superpowers:executing-plans`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`
- `superpowers:using-git-worktrees`
- local `recall`
- local `agentmemory-rest-api`
- local `playwright`

### Files Read

- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  from P+17
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-git-worktrees/SKILL.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/executing-plans/SKILL.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
- `/Users/andreamarro/.codex/skills/playwright/SKILL.md`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/caps/board.ts`
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`

Memory recovery:

```text
curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search ...
```

Relevant results:

- `mem_mrbvjq4t_f11e2d0abe6d`: ARDESIA plugins must be board post-it objects,
  not fixed-size panels.
- `mem_mrbvljxn_618783dd35c6`: ELABTutor simulator must be the same simulator
  as the Simulation Plugin, not a fork or second canvas.

### Files Changed

- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Note: `ToolCanvasEmbeddable.tsx` already had inherited dirty changes from prior
slices. P+18 only added the `renderPluginPostitBoardEmbeddable` import and the
early dispatch before the existing simulation registry path.

### RED

Initial P+18 RED:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 failed file, 4 tests total, 1 failed / 3 passed
Failure:
- expected [] to deeply equal ["sim-a", "sim-b", "elab-consumer"]
```

Playwright then exposed a Room-normalized case where Excalidraw passed a valid
marker with a normalized/missing `link`. Second RED:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 failed file, 5 tests total, 1 failed / 4 passed
Failure:
- plugin post-it board link mismatch for sim-a
```

### Implementation

Added `pluginPostitBoardRender.tsx` as a small render bridge:

- recognizes elements whose `customData[maestroTool].schema` is
  `plugin-postit-board-state/1`;
- restores the public plugin post-it object state;
- validates owner as `pluginId#instanceId`;
- uses the element bounds passed by Room/Excalidraw;
- renders three board cards with stable DOM/control IDs;
- preserves compact/normal/expanded function surface mode;
- preserves instance-scoped provider diagnostics and solver output;
- preserves ELABTutor `simulation-runtime/1` and `simulationInstanceId: sim-a`;
- imports no private solver/canvas/breadboard/provider internals.

`renderToolCanvasEmbeddable` now calls this bridge before parsing the ordinary
`maestro-tool://` registry link. Non plugin-post-it elements continue through the
existing registry path unchanged.

`BrowserHostedMultiPostit.test.tsx` only changed its lazy workbench wait timeout
from 5s to 15s. Assertions are unchanged. This prevents the required focused
multi-file command from failing while the lazy workbench chunk is still loading.

### Tests

Isolated P+18 board test:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 passed file, 5 passed tests
```

Browser-hosted route regression file:

```text
npm --prefix apps/studio run test -- src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 passed file, 5 passed tests
```

Focused P+18 suite:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

5 passed files, 25 passed tests
```

### Gates

- `npm --prefix apps/studio run typecheck` -> exit 0.
- `cd apps/studio && npm exec eslint -- src/toolhost/pluginPostitBoardRender.tsx src/toolhost/ToolCanvasEmbeddable.tsx src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/design/multiPostitBoardPersistence.ts`
  -> exit 0.
- `npm --prefix apps/studio run build` -> exit 0.
  - Existing Vite chunk-size warnings remain.
- `git diff --check` -> exit 0, no output.
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  -> exit 0, no output.
- Extra trailing-whitespace scan on P+18 touched source/test files -> no output.

### Playwright

Dev server:

```text
npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5208 --strictPort
```

Playwright proof used the actual Room route, persisted the generated board scene
through `window.__MAESTRO_TEST__.store.saveScene(room, JSON.stringify(scene))`,
reloaded the page, then verified the real `Room` load/render path.

Desktop:

- route:
  `http://127.0.0.1:5208/#p18-room-plugin-postits-desktop-1783519106796`
- viewport: 1280x800
- screenshot:
  `/Users/andreamarro/ardesia-wt/tutor-ux/output/playwright/room-plugin-postit-p18-desktop.png`
- console errors: 0
- instances: `sim-a`, `sim-b`, `elab-consumer`
- modes: `sim-a=compact`, `sim-b=expanded`, `elab-consumer=normal`
- screenshot bytes: 65,781
- overlap count: 0

Mobile:

- route:
  `http://127.0.0.1:5208/#p18-room-plugin-postits-mobile-1783519116757`
- viewport: 390x844
- screenshot:
  `/Users/andreamarro/ardesia-wt/tutor-ux/output/playwright/room-plugin-postit-p18-mobile.png`
- console errors: 0
- instances: `sim-a`, `sim-b`, `elab-consumer`
- modes: `sim-a=compact`, `sim-b=expanded`, `elab-consumer=normal`
- screenshot bytes: 25,319
- overlap count: 0

The Playwright assertions also checked:

- persisted scene contains `plugin-postit-board-state/1`;
- `apiRef.current.getSceneElements().length === 3` after reload;
- two `io.ardesia.simulation` post-its and one `io.elab.tutor` post-it;
- no duplicate `id^="plugin-postit-"`;
- `sim-a` provider text contains `local`;
- `sim-b` provider text contains `fastapi`;
- `sim-a` solver text contains `0.0153`;
- ELABTutor runtime is `simulation-runtime/1`;
- ELABTutor linked simulation instance is `sim-a`;
- all post-it DOM boxes are visible in viewport after `scrollToContent`;
- no incoherent overlap.

### Product Claim

P+18 proves that a persisted `board.excalidraw` scene containing three plugin
post-it board elements is loaded by the same `WorkspaceStore` boundary used by
`Room` and rendered through `Room.renderEmbeddable -> renderToolCanvasEmbeddable`.

The path preserves:

- instanceId and pluginId;
- element bounds and z-state enough to derive compact/normal/expanded mode;
- function surface/control IDs without DOM duplication;
- provider diagnostics and solver output per Simulation instance;
- ELABTutor `simulation-runtime/1` consumer link to `sim-a`;
- no private ELABTutor simulator/canvas/solver imports;
- no second ELABTutor simulator.

### Residual Risk

- This slice proves Room store reload, not a full `.lesson` export/import
  browser flow through Room UI.
- The bridge renders a lightweight board card representation, not the full
  final simulator canvas inside every plugin post-it.
- Disk space is critically low: `df -h .` after P+18 showed about 595 MiB free
  on a 460 GiB volume at 100% capacity display. Avoid parallel Vitest and large
  artifact generation until space is reclaimed.
- Full repo lint remains outside this slice because the inherited worktree is
  dirty; scoped lint passed.

## Immediate Next Prompt P+19

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+18.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- room-render-plugin-postits
- room-plugin-postit-lesson-export-import
- board-persistence-plugin-postits
- visible-board-reload-plugin-postits
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+19 - Room .lesson Export/Import Evidence For Plugin Post-it Board Elements.

Obiettivo concreto P+19:
- dimostrare che una Room con tre elementi `plugin-postit-board-state/1`
  puo' essere esportata in `.lesson`, importata in uno store/room nuovo e resa
  visibile di nuovo attraverso `Room.renderEmbeddable`;
- preservare instanceId, pluginId, bounds, function surface mode, provider
  diagnostics, solver output e link ELABTutor -> sim-a dopo export/import;
- restare sullo stesso Simulation Plugin runtime;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze;
- attenzione allo spazio disco: evita Vitest paralleli e artifact non necessari.

Approccio:
- Test-first.
- Parti da:
  apps/studio/src/store/lessonBundle.ts
  apps/studio/src/store/WorkspaceStore.ts
  apps/studio/src/design/multiPostitBoardPersistence.ts
  apps/studio/src/toolhost/pluginPostitBoardRender.tsx
  apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx
  apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts
- Se il flusso UI import file completo e' troppo ampio per P+19, crea un test
  store-level `.lesson` export/import e una prova Playwright Room reload sullo
  store importato, documentando cosa resta fuori.

Required tests:
- RED prima della fix.
- `.lesson` export/import conserva tre plugin post-it board elements;
- Room render/hydration dopo import produce tre post-it visibili o render
  models coerenti;
- nessun duplicate DOM/control id dopo import/render;
- board element bounds guidano compact/normal/expanded;
- provider diagnostics/solver output restano instance-scoped;
- ELABTutor mantiene `simulation-runtime/1` e `simulationInstanceId: sim-a`;
- source guard: nessun import privato solver/canvas/breadboard/provider nel
  bridge Room/ToolCanvas.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Se aggiungi un nuovo test P+19, includilo esplicitamente nel focused command.

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- npm --prefix apps/studio run build
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- prova la route Room usata con scena importata;
- registra route, viewport, screenshot, console errors,
  nonblank/no incoherent overlap;
- prova import/reload visibile, non solo helper puro.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+19.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+19 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Session P+19 Checkpoint - Room .lesson Export/Import Evidence For Plugin Post-it Board Elements

Date: 2026-07-08
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
Branch: `docs/simulation-plugin-v2-contract-20260707`

### Scope

P+19 proves that a Room scene containing three
`plugin-postit-board-state/1` board elements can be exported as `.lesson`,
imported through a new `WorkspaceStore` instance, loaded by a new Room, and
rendered again through the real Room embeddable path.

No production runtime source changed in P+19. The new automated test passed
immediately after being added, so this slice is evidence/regression coverage
over the P+18 behavior rather than a new runtime fix. A test-only type error was
then caught by `typecheck` and corrected.

### Claude Product/UX Material Assessment

Andrea provided Claude's product-lane output during P+19. It was read and
reviewed before continuing.

Verdict:

- partially usable and good as product/UX lane material;
- not directly used for P+19 runtime/export/import code because it is orthogonal
  to `.lesson` Room embeddable proof;
- its strongest useful point is the stale-path correction: extend existing
  `lessonos/` and `toolhost/marketplace/` contracts, do not create a parallel
  `useraios/` store/projection;
- its created product contracts/tests were sanity-checked:
  `MarketplaceItem.test.ts`, `EssentialPlugins.test.ts`,
  `SubPostitObject.test.ts`, `TeacherDashboardProjection.test.ts` -> 4 files,
  65 tests passed;
- scoped ESLint on Claude product files -> exit 0;
- whole-tree `typecheck` was later proven green after the P+19 test type fix.

Claude material remains a separate product lane and was not folded into the
simulator/Room slice.

### Skills Used

- `superpowers:using-superpowers`
- `superpowers:test-driven-development`
- local `playwright`

### Files Read

- `/Users/andreamarro/.codex/attachments/ebec654e-f016-4a72-920e-376ac17a5cf3/pasted-text.txt`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/using-superpowers/references/codex-tools.md`
- `/Users/andreamarro/.codex/plugins/cache/openai-curated-remote/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
- `apps/studio/src/store/lessonBundle.ts`
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/App.tsx`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/src/__tests__/Room.integration.test.tsx`
- Claude product files:
  - `docs/ops/CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-20260708.md`
  - `docs/ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md`
  - `docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md`
  - `apps/studio/src/toolhost/marketplace/marketplaceItem.ts`
  - `apps/studio/src/toolhost/essentialPlugins.ts`
  - `apps/studio/src/toolhost/subPostitObject.ts`
  - `apps/studio/src/lessonos/teacherDashboardProjection.ts`

### Files Changed

- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
  - added P+19 evidence test:
    `.lesson` export -> new store import -> Room hydration models -> render
    imported embeddables with `renderPluginPostitBoardEmbeddable`.
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  - added this checkpoint and P+20 prompt.
- Generated Playwright evidence:
  - `output/playwright/room-plugin-postit-p19-desktop.png`
  - `output/playwright/room-plugin-postit-p19-mobile.png`

### Test Behavior

The new P+19 test passed immediately, meaning P+18 had already implemented the
needed runtime path. Because no production code changed, there was no runtime
RED/GREEN cycle. `typecheck` then found a test-only typing issue:

```text
src/__tests__/BoardPluginPostitPersistence.test.ts(224,59): error TS2345:
Argument of type 'unknown' is not assignable to parameter of type
'PluginPostitBoardEmbedLike'.
```

Fix:

- imported `type PluginPostitBoardScene`;
- parsed the imported scene as `PluginPostitBoardScene` instead of
  `{ elements: unknown[] }`.

### Tests

Claude product-lane sanity check:

```text
npm --prefix apps/studio run test -- src/__tests__/MarketplaceItem.test.ts src/__tests__/EssentialPlugins.test.ts src/__tests__/SubPostitObject.test.ts src/__tests__/TeacherDashboardProjection.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

4 passed files, 65 passed tests
```

P+19 isolated board test after type fix:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

1 passed file, 6 passed tests
```

Focused P+19 suite:

```text
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

5 passed files, 26 passed tests
```

### Gates

- `npm --prefix apps/studio run typecheck` -> exit 0.
- `cd apps/studio && npm exec eslint -- src/__tests__/BoardPluginPostitPersistence.test.ts`
  -> exit 0.
- `npm --prefix apps/studio run build` -> exit 0.
  - Existing Vite chunk-size warnings remain.
- `git diff --check` -> exit 0, no output.
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  -> exit 0, no output.

### Playwright

Dev server:

```text
npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5182 --strictPort
```

The proof script used the real Vite app and Room route. For each viewport it:

1. imported browser-side Vite modules;
2. created a source `WorkspaceStore`;
3. saved a board scene with three plugin post-it embeddables;
4. exported a `.lesson`;
5. created a separate `WorkspaceStore`;
6. imported the `.lesson`;
7. reloaded Room at a new target room;
8. verified rendered DOM from `Room.renderEmbeddable`.

Desktop:

- route:
  `http://127.0.0.1:5182/?proof=p19-mrc8qf85-desktop#p19-mrc8qf85-desktop-imported`
- viewport: 1280x800
- screenshot:
  `/Users/andreamarro/ardesia-wt/tutor-ux/output/playwright/room-plugin-postit-p19-desktop.png`
- `.lesson` bundle size: 2,355 bytes
- raw paths after import:
  - `raw/board.excalidraw`
  - `raw/p19-mrc8qf85-desktop-source/board.excalidraw`
- console errors: 0
- instances: `sim-a`, `sim-b`, `elab-consumer`
- plugins: two `io.ardesia.simulation`, one `io.elab.tutor`
- modes: `sim-a=compact`, `sim-b=expanded`, `elab-consumer=normal`
- providers: `sim-a=local`, `sim-b=fastapi`
- solver proof: `led current 0.0153`
- ELABTutor runtime: `simulation-runtime/1`, consumer of `sim-a`
- duplicate plugin DOM IDs: 0
- overlap count: 0
- body nonblank: 813 text chars

Mobile:

- route:
  `http://127.0.0.1:5182/?proof=p19-mrc8qf85-mobile#p19-mrc8qf85-mobile-imported`
- viewport: 390x844
- screenshot:
  `/Users/andreamarro/ardesia-wt/tutor-ux/output/playwright/room-plugin-postit-p19-mobile.png`
- `.lesson` bundle size: 2,355 bytes
- raw paths after import:
  - `raw/board.excalidraw`
  - `raw/p19-mrc8qf85-mobile-source/board.excalidraw`
- console errors: 0
- instances: `sim-a`, `sim-b`, `elab-consumer`
- plugins: two `io.ardesia.simulation`, one `io.elab.tutor`
- modes: `sim-a=compact`, `sim-b=expanded`, `elab-consumer=normal`
- providers: `sim-a=local`, `sim-b=fastapi`
- solver proof: `led current 0.0153`
- ELABTutor runtime: `simulation-runtime/1`, consumer of `sim-a`
- duplicate plugin DOM IDs: 0
- overlap count: 0
- body nonblank: 505 text chars

The dev server was stopped after the proof.

### Product Claim

P+19 proves the `.lesson` carrier preserves and restores Room plugin post-it
embeddables:

- three `plugin-postit-board-state/1` elements survive export/import;
- import into a separate `WorkspaceStore` writes `raw/board.excalidraw`;
- a new Room loads the imported scene through `WorkspaceStore.loadScene`;
- the real Room embeddable path renders three plugin post-its;
- instanceId/pluginId remain stable;
- element bounds continue to drive compact/expanded/normal surface mode;
- Simulation provider diagnostics and solver output remain instance-scoped;
- ELABTutor remains a consumer of `io.ardesia.simulation` via
  `simulation-runtime/1` and `simulationInstanceId: sim-a`;
- no second ELABTutor simulator was introduced;
- no vendored solver drift.

### Residual Risk

- P+19 did not add a user-facing file-picker import flow in Room. The proof uses
  `WorkspaceStore.importLessonBlob` and a browser-side reload of Room.
- Imported `.lesson` scenes currently travel as flat `raw/board.excalidraw` and
  are loaded by `WorkspaceStore.loadScene(room)` via its legacy flat-scene
  fallback. P+20 should decide whether Room import should normalize that flat
  scene into the current room path.
- The lightweight bridge still renders a board-card representation, not the
  final full simulator canvas inside each post-it.
- Claude product-lane files are present in the same dirty worktree but are not
  part of this P+19 simulator/Room claim.

## Immediate Next Prompt P+20

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+19.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- room-plugin-postit-lesson-export-import
- room-render-plugin-postits
- board-persistence-plugin-postits
- visible-board-reload-plugin-postits
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+20 - Room .lesson Import UI/Room-Path Normalization For Plugin Post-it Board Elements.

Obiettivo concreto P+20:
- chiudere il residuo P+19: import `.lesson` non solo tramite helper store-level
  ma tramite una boundary Room/UI o una API Room esplicita;
- decidere e implementare il comportamento corretto per una `.lesson` importata
  in una nuova stanza:
  - o normalizzare `raw/board.excalidraw` nel path della room corrente
    `raw/<room>/board.excalidraw`;
  - oppure documentare/testare formalmente che il fallback flat e' il contratto
    intenzionale;
- dimostrare che dopo l'import Room rende tre post-it tramite
  `Room.renderEmbeddable`;
- preservare instanceId, pluginId, bounds, function surface mode, provider
  diagnostics, solver output e link ELABTutor -> sim-a;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze;
- attenzione allo spazio disco: evita Vitest paralleli e artifact non necessari.

Approccio:
- Test-first.
- Parti da:
  apps/studio/src/Room.tsx
  apps/studio/src/store/WorkspaceStore.ts
  apps/studio/src/store/lessonBundle.ts
  apps/studio/src/design/multiPostitBoardPersistence.ts
  apps/studio/src/toolhost/pluginPostitBoardRender.tsx
  apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts
  apps/studio/src/__tests__/Room.integration.test.tsx
- Non riscrivere Excalidraw o ToolCanvas; usa il piu' piccolo boundary di
  import necessario.

Required tests:
- RED prima della fix se tocchi produzione.
- import `.lesson` in una nuova room produce una scena caricabile da Room;
- se si normalizza il path, `raw/<room>/board.excalidraw` esiste dopo import;
- se si mantiene il fallback flat, il contratto e' coperto da test esplicito;
- Room render/hydration dopo import produce tre post-it visibili o render models
  coerenti;
- nessun duplicate DOM/control id dopo import/render;
- board element bounds guidano compact/normal/expanded;
- provider diagnostics/solver output restano instance-scoped;
- ELABTutor mantiene `simulation-runtime/1` e `simulationInstanceId: sim-a`;
- source guard: nessun import privato solver/canvas/breadboard/provider nel
  bridge Room/ToolCanvas.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Se Room.integration risulta troppo grande per la memoria/disco, esegui prima il
nuovo test mirato e poi il focused pack P+19 senza Room.integration,
documentando il motivo.

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- npm --prefix apps/studio run build
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- prova la route Room usata con scena importata;
- registra route, viewport, screenshot, console errors,
  nonblank/no incoherent overlap;
- prova import/reload visibile, non solo helper puro.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+20.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+20 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Session P+20 Checkpoint - Room .lesson Import UI/Room-Path Normalization

Status: handed off early by Andrea request after code/tests/build gates; Playwright
route proof is still pending.

P+20 implemented the normalized-room import path:
- `WorkspaceStore.importLessonBlobForRoom(blob, room)` imports the `.lesson`
  raw entries, then copies `raw/board.excalidraw` into
  `raw/<room>/board.excalidraw` via `saveScene(room, ...)`.
- `Room.handleFile` now accepts `.lesson` from the existing media file picker,
  imports into the current room, reloads the normalized scene, seeds the
  journal, and calls Excalidraw `updateScene({ elements, appState, files })`.
- The `.lesson` raw flat scene is preserved; normalization adds the room path
  instead of deleting raw bundle content.

Files changed in this P+20 slice:
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/Room.integration.test.tsx`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

RED observed before fix:
- `BoardPluginPostitPersistence.test.ts`: failed with
  `importedStore.importLessonBlobForRoom is not a function`.
- `Room.integration.test.tsx`: failed because `.lesson` import did not write
  `raw/test-room-1/board.excalidraw`.

Automated tests/gates run:
- `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  -> 1 file, 7 tests passed.
- `npm --prefix apps/studio run test -- src/__tests__/Room.integration.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  -> 1 file, 44 tests passed. JSDOM still prints existing
  `Not implemented: navigation to another Document`.
- Focused P+20 pack:
  `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  -> 6 files, 71 tests passed.
- `npm --prefix apps/studio run typecheck` -> pass.
- `npm --prefix apps/studio run build` -> pass; Vite emitted existing large
  chunk warnings only.
- `git diff --check -- apps/studio/src/Room.tsx apps/studio/src/store/WorkspaceStore.ts apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts apps/studio/src/__tests__/Room.integration.test.tsx`
  -> clean.
- `git diff --exit-code -- apps/studio/sim/solver` -> clean.
- `cd apps/studio && npm exec eslint -- src/store/WorkspaceStore.ts src/__tests__/BoardPluginPostitPersistence.test.ts`
  -> pass.
- Full lint over all touched files was attempted and is blocked by existing
  baseline violations in `Room.tsx` and `Room.integration.test.tsx`
  (`no-explicit-any`, `react-hooks/set-state-in-effect`,
  `react-hooks/exhaustive-deps`, etc.). New P+20 test harness `any` usages were
  removed before handoff.

Product claim now covered by unit/integration tests:
- `.lesson` import through Room/UI boundary writes the board into
  `raw/<room>/board.excalidraw`.
- After import, Room updates Excalidraw with the restored board element ids.
- The restored board preserves the three plugin post-it objects:
  `io.ardesia.simulation:sim-a`, `io.ardesia.simulation:sim-b`,
  `io.elab.tutor:elab-consumer`.
- Existing P+19/P+20 focused pack still proves instance ids, provider outputs,
  solver current `0.0153`, function surface modes, duplicate-id guard, and
  ELABTutor `simulation-runtime/1` link to `sim-a`.

Not yet done because Andrea requested handoff ASAP:
- Playwright route proof for the actual Room UI file-picker import/reload flow.
- Screenshot/console/no-overlap evidence for desktop and mobile after `.lesson`
  import.
- Optional: decide whether to leave the full touched-file ESLint baseline as
  documented or create a separate lint-cleanup PR/slice. Do not mix that cleanup
  into the simulator parity slice unless Andrea explicitly asks.

## Immediate Next Prompt P+20-Handoff To Claude

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Andrea ha chiesto a Codex di passare la palla a Claude appena possibile.
Riparti dal checkpoint "Session P+20 Checkpoint - Room .lesson Import
UI/Room-Path Normalization" in:
docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md

Leggi prima:
- AGENTS.md e apps/studio/AGENTS.md
- docs/vault/ARDESIA-MAP.md
- docs/ELAB-AS-PLUGIN-CANON.md
- docs/architecture/simulation-plugin-v2.md
- docs/product/ELABTUTOR-PLUGIN-SPEC.md
- il checkpoint P+20 appena sopra

Stato ereditato:
- P+20 code path implementato:
  WorkspaceStore.importLessonBlobForRoom(blob, room)
  Room.handleFile accetta .lesson e normalizza raw/board.excalidraw in
  raw/<room>/board.excalidraw.
- Test/gate verdi:
  BoardPluginPostitPersistence 7 passed;
  Room.integration 44 passed;
  focused P+20 pack 6 files / 71 tests passed;
  typecheck pass;
  build pass;
  diff check pass;
  solver drift pass;
  partial lint on WorkspaceStore + Board test pass.
- Full lint touched-files resta bloccato da baseline storica in Room/Room test;
  non fare cleanup ampio in questa slice salvo ordine esplicito.

Compito immediato:
1. Non riscrivere la fix P+20 se i test sono ancora verdi.
2. Esegui Playwright sulla route Room reale:
   - genera o carica una .lesson con i tre post-it;
   - importa dal file picker UI;
   - prova che Room renderizza tre post-it via renderEmbeddable;
   - verifica provider local/fastapi, solver 0.0153, ELABTutor runtime link,
     zero duplicate DOM id, console errors zero, no incoherent overlap;
   - fai desktop + mobile screenshot;
   - prova reload/import visibile, non solo helper store.
3. Riesegui almeno focused P+20 pack se tocchi codice:
   npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
4. Riesegui typecheck/build/diff/solver drift before final.

Vincoli:
- massimo 5 file per ciclo; non aggiungere dipendenze;
- non toccare solver vendored;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- niente push/merge/deploy/reset/clean.

Output atteso:
- aggiorna questo runbook con Playwright evidence e stato finale P+20;
- se tutto è verde, crea il prossimo prompt P+21.
```

## Session P+20 Continuation - Playwright Room Import/Reload Evidence

Status: completed by Codex continuation after the early handoff note above.
No production code changed in this continuation; only Playwright artifacts and
this runbook were updated.

Playwright tool note:
- The local `playwright` skill was read.
- `command -v npx` passed.
- The bundled wrapper and direct `npx --package @playwright/mcp
  playwright-cli` both failed with `sh: playwright-cli: command not found` on
  this machine.
- Fallback used the repo-installed Playwright Node API from
  `apps/studio/node_modules`; no dependency was added.

Artifact setup:
- Generated `.lesson` fixture:
  `output/playwright/p20-room-import.lesson`
- Generated source board JSON:
  `output/playwright/p20-room-import-board.json`
- Evidence JSON:
  `output/playwright/room-plugin-postit-p20-import-evidence.json`
- Screenshots:
  `output/playwright/room-plugin-postit-p20-import-desktop.png`
  `output/playwright/room-plugin-postit-p20-import-mobile.png`
- Diagnostic artifact from the first failed attempt:
  `output/playwright/room-plugin-postit-p20-diagnostic.json`
  `output/playwright/room-plugin-postit-p20-diagnostic.png`

Important diagnostic found and handled in the fixture:
- A minimal synthetic Excalidraw embeddable payload imports into the store and
  appears in `apiRef.getSceneElements()`, but it does not render visible custom
  embeddables in the real Room DOM.
- The successful `.lesson` fixture uses the full Excalidraw embeddable skeleton
  shape from `createToolEmbedElement` and uses element ids in the
  `maestro-tool://<plugin>/<embed-id>` link, while the plugin post-it instance
  remains in `customData.maestroTool.state.instanceId`.
- This is not a production-code change, but it is a real hardening gap for the
  next slice: synthetic/export helpers for plugin board scenes should emit a
  real Excalidraw embeddable shape when the target is Room, not only a direct
  render-model fixture.

Dev server:
- `npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5187`
- Route used:
  `http://127.0.0.1:5187/#p20-room-import-1783528404792`

Playwright verified:
- Import happened through the actual Room `<input type="file">` file picker.
- Store after import:
  - `raw/<room>/board.excalidraw` exists.
  - flat `raw/board.excalidraw` is preserved.
  - room scene element ids:
    `plugin-postit-sim-a-board`,
    `plugin-postit-sim-b-board`,
    `plugin-postit-elab-consumer-board`.
- DOM after import:
  - `[data-plugin-postit-instance]` instances:
    `sim-a`, `sim-b`, `elab-consumer`.
  - plugins:
    `io.ardesia.simulation`,
    `io.ardesia.simulation`,
    `io.elab.tutor`.
  - function modes:
    `sim-a=compact`, `sim-b=expanded`, `elab-consumer=normal`.
  - provider diagnostics:
    `sim-a` contains `local`;
    `sim-b` contains `fastapi`.
  - solver:
    `sim-a` contains `led current 0.0153`.
  - ELABTutor runtime:
    `data-elabtutor-runtime-api=simulation-runtime/1`;
    `data-elabtutor-simulation-instance=sim-a`.
  - duplicate plugin DOM ids: `0`.
  - desktop visible post-it overlaps: `[]`.
  - console errors: `[]`.
- Reload proof:
  - After `page.reload()`, the same three instances, plugins, modes,
    providers, solver output, ELABTutor runtime link, duplicate-id count and
    no-overlap result were still present.
- Mobile proof:
  - Viewport `390x844` after reload still rendered the same three post-it DOM
    instances with the same provider/solver/runtime evidence and duplicate id
    count `0`.

P+20 final claim after continuation:
- Reached for the Room/UI import boundary and room-path normalization.
- Reached for real browser import/reload/render evidence.
- Remaining hardening is not a P+20 blocker, but should be P+21: make the
  synthetic/exported plugin board scene helper produce full Excalidraw
  embeddable elements so tests and real Room rendering cannot diverge again.

## Immediate Next Prompt P+21

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dal checkpoint P+20 e dalla sezione "Session P+20 Continuation -
  Playwright Room Import/Reload Evidence".

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+21 - Full Excalidraw Embeddable Shape For Plugin Board Scenes.

Obiettivo concreto P+21:
- chiudere il gap scoperto dalla prova Playwright P+20: le scene plugin board
  sintetiche/minimali passano i test diretti ma non necessariamente renderizzano
  nella Room Excalidraw reale;
- fare in modo che `createPluginPostitBoardScene` o un helper adiacente emetta
  elementi embeddable Excalidraw completi quando la scena deve viaggiare in
  `.lesson`/Room;
- preservare `state.instanceId` come identità plugin post-it (`sim-a`,
  `sim-b`, `elab-consumer`) e usare l'id elemento come embed id nel link
  `maestro-tool://<plugin>/<element-id>` se questo è il contratto necessario
  per non far scattare `normalizeDuplicatedToolEmbeds`;
- aggiornare i test in modo che il path unitario non possa divergere dal
  rendering reale osservato in Playwright;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze.

File di partenza:
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/Room.integration.test.tsx`

Approccio:
- Test-first.
- Prima crea/estendi un test che fallisce su un elemento board minimale che
  non contiene lo shape Excalidraw completo o che usa un link incompatibile con
  la normalizzazione.
- Implementa il più piccolo helper condiviso per lo skeleton Excalidraw se
  necessario. Non spostare tutto ToolCanvas.
- Non riscrivere la fix P+20 di import `.lesson` se i test restano verdi.

Required tests:
- `createPluginPostitBoardScene` produce elementi `type: embeddable` con campi
  Excalidraw completi: angle, stroke/background/fill/strokeWidth/strokeStyle,
  roughness, opacity, roundness, seed, version, versionNonce, index, isDeleted,
  groupIds, frameId, boundElements, updated, locked, link, customData.
- Il link usa un embed id coerente con l'id elemento oppure il test dimostra che
  `normalizeDuplicatedToolEmbeds` non riscrive la scena appena importata.
- `renderPluginPostitBoardEmbeddable` continua a renderizzare tre post-it con
  instanceId/pluginId/provider/solver/runtime invariati.
- `.lesson` import in Room continua a scrivere
  `raw/<room>/board.excalidraw` e a chiamare `updateScene`.
- Nessun duplicate DOM/control id.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files che non sono notoriamente
  bloccati dalla baseline Room/Room.integration>
- npm --prefix apps/studio run build se tocchi codice React/Room/ToolCanvas
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Ripeti la prova P+20 usando una `.lesson` generata dal helper di produzione,
  non un fixture hand-crafted:
  - import via Room file picker;
  - reload;
  - desktop + mobile screenshots;
  - console errors zero;
  - tre post-it DOM visibili;
  - provider local/fastapi, solver 0.0153, ELABTutor runtime link;
  - duplicate ids zero e no incoherent overlap.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+21.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+21 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright evidence, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Handoff To Claude - P+21 Pending (2026-07-08 18:42 CEST)

Reason for handoff:
- The Codex session has been running for roughly 5 hours; Andrea asked to pass
  the ball to Claude as soon as possible.
- Codex did not start P+21 code changes after that request. This section is a
  handoff checkpoint only.

Current working directory:
- `/Users/andreamarro/ardesia-wt/tutor-ux`

Current branch:
- `docs/simulation-plugin-v2-contract-20260707`

Known dirty state:
- The worktree is intentionally dirty from the long run and prior agents.
- Do not reset, clean, or revert unrelated files.
- `git diff --stat` currently reports 25 tracked modified files with about
  2538 insertions and 254 deletions.
- Additional untracked work includes the P+20/P+21 test/docs/output files,
  including:
  - `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
  - `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
  - `apps/studio/src/design/multiPostitBoardPersistence.ts`
  - `apps/studio/src/design/multiPostitWorkbenchModel.ts`
  - `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
  - `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  - `output/`

What is already done by Codex P+20:
- `WorkspaceStore.importLessonBlobForRoom(blob, room)` imports raw `.lesson`
  bundles and normalizes `raw/board.excalidraw` into
  `raw/<room>/board.excalidraw`.
- `Room.handleFile` accepts `.lesson`, imports into the current room, reloads
  the scene, seeds the journal, and calls Excalidraw `updateScene`.
- Focused Room/import tests, focused pack, typecheck, build, solver drift check
  and Playwright browser evidence were already recorded above in the P+20
  sections.
- Playwright P+20 proved that a hand-crafted full Excalidraw embeddable skeleton
  renders three plugin post-its in the real Room after file-picker import and
  reload, on desktop and mobile.

Critical P+21 gap:
- The current production helper in
  `apps/studio/src/design/multiPostitBoardPersistence.ts` emits minimal
  embeddable-like objects:
  `id`, `type`, `x`, `y`, `width`, `height`, `link`, `customData`.
- Real Room/Excalidraw rendering needs the full Excalidraw embeddable shape.
- `ToolCanvasEmbeddable.normalizeDuplicatedToolEmbeds` rewrites
  `maestro-tool://.../<embedId>` links when `element.id !== embedId`.
- Therefore new production board scenes should use:
  `maestro-tool://<pluginId>/<element.id>`
  while preserving `customData[EMBED_DATA_KEY].state.instanceId` as the true
  plugin identity (`sim-a`, `sim-b`, `elab-consumer`).

Recommended next move for Claude:
- Start exactly from the `Immediate Next Prompt P+21` above.
- Use TDD first.
- Add a RED test in
  `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts` proving that
  `createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())` emits
  full Excalidraw embeddable fields and is not rewritten by
  `normalizeDuplicatedToolEmbeds`.
- Then make the smallest production change in
  `apps/studio/src/design/multiPostitBoardPersistence.ts`.
- Prefer keeping backward compatibility in restore by accepting both the new
  element-id link and the legacy instance-id link.

Suggested RED assertion shape:
- For every generated element assert presence/value category for:
  `angle`, `strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`,
  `strokeStyle`, `roughness`, `opacity`, `roundness`, `seed`, `version`,
  `versionNonce`, `index`, `isDeleted`, `groupIds`, `frameId`,
  `boundElements`, `updated`, `locked`, `link`, `customData`.
- Assert `element.link.endsWith("/" + element.id)`.
- Assert `normalizeDuplicatedToolEmbeds(scene.elements).changed === false`.
- Assert `restorePluginPostitsFromBoardScene(scene)` still returns
  `io.ardesia.simulation:sim-a`, `io.ardesia.simulation:sim-b`,
  `io.elab.tutor:elab-consumer`.

Do not do during P+21:
- Do not touch vendored solver under `apps/studio/sim/solver/**`.
- Do not create a second ELABTutor simulator.
- Do not import private ELABTutor solver/canvas/breadboard/provider APIs.
- Do not add npm dependencies.
- Do not push, merge, deploy, reset, clean, or stage broad changes.

## Session P+21 Checkpoint - Full Excalidraw Embeddable Shape For Plugin Board Scenes

Status: completed by Codex on 2026-07-08 19:20 CEST.

Scope:
- Executed only P+21 after reading the attached 1817-line long-run document and
  reconciling it against the newer local runbook.
- Closed the P+20 Playwright gap: production helper-generated plugin board
  scenes now emit full Excalidraw embeddable elements and use the element id as
  the `maestro-tool://<plugin>/<embed-id>` link id.
- Also fixed the production-helper default layout so `sim-a`, `sim-b`, and
  `elab-consumer` do not start in incoherent overlap when a `.lesson` is
  generated directly from the helper.
- No push, merge, deploy, staging, reset, clean, `git add -A`, dependency
  change, or vendored solver edit.

Skills and recovery:
- Used:
  - `superpowers:using-superpowers`
  - `superpowers:test-driven-development`
  - `superpowers:verification-before-completion`
  - `superpowers:executing-plans`
  - local `playwright`
- Read:
  - `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
  - `AGENTS.md`
  - `apps/studio/AGENTS.md`
  - `docs/vault/ARDESIA-MAP.md`
  - `docs/ELAB-AS-PLUGIN-CANON.md`
  - `docs/architecture/simulation-plugin-v2.md`
  - `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
  - `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
  - `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  - P+21 files:
    `apps/studio/src/design/multiPostitBoardPersistence.ts`,
    `apps/studio/src/design/multiPostitWorkbenchModel.ts`,
    `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`,
    `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`,
    `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`

Environment:
- `pwd`: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Worktree inherited many dirty/untracked long-run files.
- Disk at recovery/final remained tight but usable: final `df -h .` showed
  `/System/Volumes/Data` 460Gi size, 410Gi used, 3.1Gi available, 100%
  capacity.
- AgentMemory REST fallback at `127.0.0.1:3111` was unavailable:
  `curl: (7) Failed to connect`.

Files changed by P+21:
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- Playwright artifacts under `output/playwright/`:
  - `p21-production-helper-room-import.lesson`
  - `p21-production-helper-board.json`
  - `room-plugin-postit-p21-production-helper-evidence.json`
  - `room-plugin-postit-p21-production-helper-desktop.png`
  - `room-plugin-postit-p21-production-helper-mobile.png`
  - diagnostic artifact also retained:
    `room-plugin-postit-p21-reload-diagnostic.json`
    and `room-plugin-postit-p21-reload-diagnostic.png`

Implementation:
- `createPluginPostitBoardScene()` now maps each post-it to a full Excalidraw
  `embeddable` skeleton with:
  `angle`, `strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`,
  `strokeStyle`, `roughness`, `opacity`, `roundness`, `seed`, `version`,
  `versionNonce`, `index`, `isDeleted`, `groupIds`, `frameId`,
  `boundElements`, `updated`, `locked`, `link`, and `customData`.
- New helper-generated links use:
  `maestro-tool://<pluginId>/<element.id>`.
- Plugin identity remains in:
  `customData[EMBED_DATA_KEY].state.instanceId`.
- Restore remains backward-compatible with old instance-id links while newly
  generated scenes use element-id links.
- `createMultiPostitWorkbenchPostits()` now places:
  - `sim-a`: `{ x: 48, y: 72, width: 560, height: 380 }`
  - `sim-b`: `{ x: 48, y: 492, width: 560, height: 380 }`
  - `elab-consumer`: `{ x: 640, y: 72, width: 740, height: 420 }`
  so production-helper `.lesson` scenes are non-overlapping by default.

TDD REDs observed:
- First RED:
  `BoardPluginPostitPersistence.test.ts` failed because `sim-a` link was still
  `maestro-tool://io.ardesia.simulation/sim-a` instead of
  `maestro-tool://io.ardesia.simulation/plugin-postit-sim-a-board`.
- Second RED after browser evidence showed overlap:
  default production-helper bounds produced overlap pairs:
  `plugin-postit-sim-a-board:plugin-postit-sim-b-board`,
  `plugin-postit-sim-a-board:plugin-postit-elab-consumer-board`,
  `plugin-postit-sim-b-board:plugin-postit-elab-consumer-board`.

Tests and gates:
- Isolated final test:
  `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  -> 1 test file, 9 tests passed.
- Focused P+21 pack after final layout fix:
  `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  -> 3 test files, 58 tests passed.
  Existing JSDOM warning observed:
  `Not implemented: navigation to another Document`.
- `npm --prefix apps/studio run typecheck`
  -> passed.
- `cd apps/studio && npm exec eslint -- src/design/multiPostitBoardPersistence.ts src/design/multiPostitWorkbenchModel.ts src/__tests__/BoardPluginPostitPersistence.test.ts`
  -> passed.
- `git diff --check`
  -> clean.
- Additional untracked-file whitespace check:
  `perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' apps/studio/src/design/multiPostitBoardPersistence.ts apps/studio/src/design/multiPostitWorkbenchModel.ts apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
  -> clean.
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  -> clean; vendored solver drift is zero.
- Build was not rerun in P+21 because no React, Room, or ToolCanvas production
  file was touched. P+21 runtime behavior was verified by Playwright instead.

Playwright:
- Local `playwright` skill was read.
- `npx` was available, but the wrapper still failed as in P+20:
  `sh: playwright-cli: command not found`.
- Fallback used repo-installed Playwright Node API from `apps/studio`
  dependencies; no dependency was added.
- Vite dev server used:
  `npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5187`
  and was stopped after the proof.
- Final route:
  `http://127.0.0.1:5187/#p21-prod-helper-1783530958181`
- Final evidence:
  `output/playwright/room-plugin-postit-p21-production-helper-evidence.json`
- Generated by production helper:
  `output/playwright/p21-production-helper-board.json`
  and bundled as:
  `output/playwright/p21-production-helper-room-import.lesson`
- Screenshots:
  `output/playwright/room-plugin-postit-p21-production-helper-desktop.png`
  `output/playwright/room-plugin-postit-p21-production-helper-mobile.png`
- Verified in browser:
  - helper scene has 3 elements with full Excalidraw embeddable shape;
  - all links use element id:
    `plugin-postit-sim-a-board`,
    `plugin-postit-sim-b-board`,
    `plugin-postit-elab-consumer-board`;
  - import happened through the actual Room file input;
  - loaded scene after import has full shape and element-id links;
  - desktop DOM instances:
    `sim-a`, `sim-b`, `elab-consumer`;
  - desktop reload preserved the same 3 instances;
  - mobile viewport screenshot on the reloaded scene preserved the same 3
    instances;
  - providers:
    `sim-a` contains `local`;
    `sim-b` contains `fastapi`;
  - solver:
    `sim-a` contains `led current 0.0153`;
  - ELABTutor runtime:
    `simulation-runtime/1`, linked to `sim-a`;
  - duplicate plugin control ids: `0`;
  - incoherent overlap pairs: `[]`;
  - browser console errors: `[]`;
  - page errors: `[]`.

Known warnings and residual risk:
- Browser proof generated `.lesson` by zipping the helper-produced
  `board.excalidraw` in the Playwright script. Store-level `exportLesson()` is
  still covered by the focused unit/integration tests, not by the final
  Playwright script.
- Direct `workspaceStore.read(raw/<room>/board.excalidraw)` from an extra
  dynamic-imported browser module was inconsistent in one final script attempt;
  a diagnostic run verified room and flat scenes after import/reload, and the
  final Playwright proof validates `workspaceStore.loadScene(room)` plus DOM
  reload/render. P+20/P+21 tests remain the authoritative room-path coverage.
- Full repository lint is still known-baseline red and was not rerun.
- The post-it card surfaces are still proof cards, not the final extracted
  Tinkercad-class simulator UI.

Product claim:
- P+21 reached the hardening target: helper-generated plugin board scenes now
  match the full Excalidraw embeddable shape that real Room rendering requires.
- P+21 reached the link-normalization target: freshly generated helper scenes
  no longer trigger `normalizeDuplicatedToolEmbeds`.
- P+21 preserved the single-simulator rule: no ELABTutor simulator fork, no
  private solver/canvas/breadboard/provider import from ELABTutor, and no
  vendored solver changes.
- P+21 advanced visible browser evidence by proving helper-generated `.lesson`
  import/reload/mobile rendering with no duplicate ids and no visible overlap.

## Immediate Next Prompt P+22

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dal checkpoint P+21.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md
  dal checkpoint H+7 se tocchi simulator core/provider/workbench.

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+22 - Store ExportLesson Browser Proof For Production Helper Scenes.

Obiettivo concreto P+22:
- chiudere il residuo documentato in P+21: la prova Playwright finale ha usato
  una `.lesson` zippata dallo script a partire dal production helper, mentre
  `exportLesson()` resta coperto dai test unit/integration;
- produrre una prova browser o un test mirato che generi la `.lesson` tramite
  `WorkspaceStore.saveScene(...)` + `WorkspaceStore.exportLesson(...)` /
  `exportLesson(...)`, non tramite zip manuale nello script;
- importare quella `.lesson` in Room via file picker e ripetere le assert P+21:
  3 post-it DOM, reload, desktop/mobile screenshot, provider local/fastapi,
  solver 0.0153, ELABTutor runtime link, duplicate ids zero, overlap zero,
  console errors zero;
- non riscrivere la fix P+21 se i test restano verdi;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze.

File di partenza:
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/store/lessonBundle.ts`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/Room.integration.test.tsx`

Approccio:
- Test-first se tocchi produzione.
- Se bastano Playwright/script evidence e nessun codice cambia, non introdurre
  un nuovo helper solo per il test.
- Preferisci usare API esistenti `WorkspaceStore.exportLesson` /
  `exportLesson` invece di replicare formato ZIP.

Comando focused minimo se tocchi codice/test:
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files che non sono notoriamente
  bloccati dalla baseline Room/Room.integration>
- npm --prefix apps/studio run build se tocchi React/Room/ToolCanvas o altra
  superficie runtime UI
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- usa route Room reale;
- genera `.lesson` tramite export API, non manual zip;
- import via file picker;
- reload;
- desktop + mobile screenshots;
- console errors zero;
- tre post-it DOM visibili;
- provider local/fastapi, solver 0.0153, ELABTutor runtime link;
- duplicate ids zero e no incoherent overlap.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+22.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+22 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright evidence, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Session P+22 Checkpoint - Store ExportLesson Browser Proof For Production Helper Scenes

Status: completed on 2026-07-08.

Scope executed:
- Completed only P+22 after recovery from the attached long-run document and
  local runbook.
- No production runtime code was changed in P+22.
- The P+22 browser proof generated a `.lesson` through
  `WorkspaceStore.saveScene(...)` plus `WorkspaceStore.exportLesson(...)` in the
  browser, then imported that exported file through the real Room file picker.
- Vite dev server used for evidence on `127.0.0.1:5187`; server was stopped
  after evidence and gates.

Files read during P+22 recovery and verification:
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- `$superpowers:using-superpowers` skill and Codex reference.
- Local `handoff` skill was inspected because Andrea asked to pass the ball to
  Claude as soon as possible.

Files changed by P+22:
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- `output/playwright/p22-workspace-exportlesson-room-import.lesson`
- `output/playwright/p22-workspace-exportlesson-board.json`
- `output/playwright/room-plugin-postit-p22-exportlesson-evidence.json`
- `output/playwright/room-plugin-postit-p22-exportlesson-desktop.png`
- `output/playwright/room-plugin-postit-p22-exportlesson-mobile.png`

P+22 Playwright evidence:
- Route:
  `http://127.0.0.1:5187/#p22-export-import-1783531670416`
- Exported ZIP entries:
  `raw/`, `raw/board.excalidraw`
- Exported board elements:
  `plugin-postit-sim-a-board`,
  `plugin-postit-sim-b-board`,
  `plugin-postit-elab-consumer-board`
- Export shape checks:
  full Excalidraw embeddable skeleton present for all 3 elements;
  all fresh links use board element ids;
  no legacy instance-id link in the exported helper scene.
- Imported Room checks:
  desktop DOM instances `sim-a`, `sim-b`, `elab-consumer`;
  reload DOM instances `sim-a`, `sim-b`, `elab-consumer`;
  mobile DOM instances `sim-a`, `sim-b`, `elab-consumer`;
  function modes all `normal`;
  providers `sim-a: local: local solver available`,
  `sim-b: fastapi: fastapi provider hub not configured`;
  solver `sim-a: led current 0.0153`, `sim-b: led current 0`;
  ELABTutor runtime link `simulation-runtime/1`;
  ELABTutor simulation instance `sim-a`;
  duplicate plugin control ids `0`;
  overlaps `[]`;
  console errors `[]`;
  page errors `[]`.
- Screenshots:
  `output/playwright/room-plugin-postit-p22-exportlesson-desktop.png`
  and
  `output/playwright/room-plugin-postit-p22-exportlesson-mobile.png`.
- Wrapper note:
  `npx playwright-cli --help` remained unavailable with
  `sh: playwright-cli: command not found`; P+22 used the repo-installed
  Playwright Node API fallback.

Verification:
- Focused pack:
  `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  -> 3 files passed, 58 tests passed. Known JSDOM warning observed:
  `Not implemented: navigation to another Document`.
- Typecheck:
  `npm --prefix apps/studio run typecheck` -> pass.
- Whitespace:
  `git diff --check` -> pass.
- Runbook trailing whitespace:
  `perl -ne 'print "$ARGV:$.:$_" if /[ \t]$/' docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  -> pass.
- Vendored solver drift:
  `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  -> no diff.
- ESLint was not rerun in P+22 because no code or test source was changed in
  this cycle.
- Build was not rerun in P+22 because no React, Room, ToolCanvas, or runtime UI
  production source was changed in this cycle.

Product claim after P+22:
- The residual from P+21 is closed: the visible Room import proof no longer uses
  a script-authored manual ZIP as the evidence source. The `.lesson` was emitted
  by the WorkspaceStore export path and then re-imported through the real Room
  picker.
- The single-simulator invariant still holds: no ELABTutor simulator fork, no
  private solver/canvas/breadboard/provider import from the ELABTutor pack, and
  vendored solver remains byte-stable.

Residual risks and handoff notes:
- The worktree remains intentionally dirty from the long run. Do not stage with
  `git add -A`; inspect diffs before any staging.
- The filesystem is still very full; last observed available space was about
  3.1 GiB on `/System/Volumes/Data`.
- Full PR readiness still needs a final build gate because earlier long-run
  iterations touched production UI/runtime files. P+22 itself did not require a
  build.
- No push, merge, deploy, commit, destructive reset, or clean was performed.

## Immediate Next Prompt P+23 - Claude Handoff And PR-Ready Evidence Pack

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Andrea ha chiesto di passare la palla a Claude appena possibile. Questa e' una
sessione di handoff/PR-readiness, non una nuova feature.

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dal checkpoint P+20 fino a P+22 incluso.
- Leggi docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md
  dal checkpoint H+7 se tocchi simulator core/provider/workbench.

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+23 - Claude Handoff And PR-Ready Evidence Pack.

Obiettivo concreto P+23:
- non implementare nuove feature se i gate restano verdi;
- auditare i cambi P+20/P+21/P+22 e produrre un evidence pack PR-ready;
- confermare che P+22 ha chiuso il residuo exportLesson:
  `.lesson` generata da `WorkspaceStore.exportLesson`, importata in Room via
  file picker, reload OK, mobile OK, 3 post-it DOM, provider local/fastapi,
  solver 0.0153, ELABTutor runtime link, duplicate ids zero, overlap zero,
  console/page errors zero;
- eseguire il build finale se lo spazio disco lo consente, perche' le iterazioni
  precedenti hanno toccato file React/runtime UI;
- preparare commit/PR notes, ma non pushare e non mergiare senza ordine esplicito
  di Andrea.

Artefatti P+22 da verificare:
- `output/playwright/p22-workspace-exportlesson-room-import.lesson`
- `output/playwright/p22-workspace-exportlesson-board.json`
- `output/playwright/room-plugin-postit-p22-exportlesson-evidence.json`
- `output/playwright/room-plugin-postit-p22-exportlesson-desktop.png`
- `output/playwright/room-plugin-postit-p22-exportlesson-mobile.png`

Gate minimi:
- `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
- `npm --prefix apps/studio run typecheck`
- `npm --prefix apps/studio run build` se lo spazio disco basta; se fallisce per
  spazio, documenta esattamente `df -h .` e non mascherare il failure.
- `git diff --check`
- `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se serve push, deploy, merge, staging ampio, reset o clean;
- fermati se il build fallisce per causa non banale e la fix eccede un handoff.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+23 checkpoint;
- includi file letti, file cambiati, test/build/typecheck/diff/drift,
  stato Playwright P+22, rischi residui, e proposta commit/PR body se tutto e'
  verde.
```

## Session P+23 Checkpoint - Claude Handoff And PR-Ready Evidence Pack

Status: completed by Codex on 2026-07-08.

Scope:
- Executed only P+23 as handoff/PR-readiness.
- No new feature work was implemented.
- No production code, test code, simulator code, pack data, or Playwright
  artifact was changed in this P+23 cycle.
- The P+22 exportLesson/browser evidence was re-verified from current files.
- Final focused test, typecheck, build, diff, and solver drift gates were run.
- No push, merge, deploy, commit, staging, destructive reset, clean,
  `git add -A`, or dependency change occurred.

Files read during P+23:
- Attached 1817-line prompt:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  from P+20 through P+23.
- `$superpowers:using-superpowers` skill and Codex reference.

Environment:
- `pwd`: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- Dirty worktree remains intentional from the long run.
- Recovery `df -h .`: `/System/Volumes/Data` 460Gi size, 410Gi used,
  2.8Gi available, 100% capacity.
- Pre-build `df -h .`: 1.8Gi available.
- Post-build `df -h .`: 2.8Gi available.

Files changed by P+23:
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
  only.

P+22 artifact audit:
- `output/playwright/p22-workspace-exportlesson-room-import.lesson`
  exists, 3392 bytes.
- `output/playwright/p22-workspace-exportlesson-board.json`
  exists, 5449 bytes.
- `output/playwright/room-plugin-postit-p22-exportlesson-evidence.json`
  exists, 6188 bytes.
- `output/playwright/room-plugin-postit-p22-exportlesson-desktop.png`
  exists, 92558 bytes.
- `output/playwright/room-plugin-postit-p22-exportlesson-mobile.png`
  exists, 46114 bytes.
- `.lesson` ZIP entries:
  `raw/`, `raw/board.excalidraw`.
- P+22 route:
  `http://127.0.0.1:5187/#p22-export-import-1783531670416`
- Loaded scene:
  `plugin-postit-sim-a-board`,
  `plugin-postit-sim-b-board`,
  `plugin-postit-elab-consumer-board`.
- All links use board element ids and all elements have full Excalidraw
  embeddable shape.
- Desktop/reload/mobile DOM instances:
  `sim-a`, `sim-b`, `elab-consumer`.
- Providers:
  `sim-a: local: local solver available`,
  `sim-b: fastapi: fastapi provider hub not configured`.
- Solver:
  `sim-a: led current 0.0153`, `sim-b: led current 0`.
- ELABTutor runtime:
  `simulation-runtime/1`, simulation instance `sim-a`.
- Duplicate plugin control ids:
  `0` on desktop, reload, and mobile.
- Overlaps:
  `[]` on desktop, reload, and mobile.
- Console errors:
  `[]`.
- Page errors:
  `[]`.

Verification run in P+23:
- Focused pack:
  `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/Room.integration.test.tsx src/__tests__/BrowserHostedMultiPostit.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`
  -> 3 test files passed, 58 tests passed.
  Known JSDOM warning observed:
  `Not implemented: navigation to another Document`.
- Typecheck:
  `npm --prefix apps/studio run typecheck`
  -> passed.
- Build:
  `npm --prefix apps/studio run build`
  -> passed. Vite emitted the existing large chunk warning for chunks above
  500 kB after minification.
- Whitespace:
  `git diff --check`
  -> passed.
- Vendored solver drift:
  `git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  -> no diff.

Current worktree note for Claude:
- The worktree still includes 25 tracked modified files from the long run plus
  many untracked P+0-P+23 files and `output/` artifacts.
- Do not use `git add -A`.
- Do not reset, clean, or revert unrelated dirty files.
- Inspect diffs and stage surgically only if Andrea explicitly asks for a
  commit/PR.

P+23 product claim:
- P+20-P+22 now have current evidence strong enough for PR review:
  room-path `.lesson` import, production helper Excalidraw shape, exportLesson
  browser proof, reload, mobile, provider diagnostics, solver evidence,
  ELABTutor shared-runtime link, no duplicate ids, and no overlap.
- Single-simulator invariant remains intact: no ELABTutor simulator fork, no
  private ELABTutor solver/canvas/breadboard/provider import, no vendored solver
  drift.
- This is PR-ready evidence for the post-it persistence/export/import slice,
  not a claim that full Tinkercad parity is complete.

Suggested commit message if Andrea asks Claude to commit:

```text
test(studio): harden plugin post-it lesson import evidence
```

Suggested PR body:

```text
## Summary
- add/verify plugin post-it board persistence through full Excalidraw
  embeddable scene shape
- prove `.lesson` Room import/export/reload with Simulation + ELABTutor
  post-its using `WorkspaceStore.exportLesson`
- preserve the single Simulation Runtime rule: ELABTutor remains a consumer of
  `io.ardesia.simulation`

## Evidence
- Focused pack: 3 files / 58 tests passed
- Typecheck: pass
- Build: pass, with existing Vite large chunk warning
- `git diff --check`: pass
- Vendored solver drift: no diff
- Playwright P+22:
  `output/playwright/room-plugin-postit-p22-exportlesson-evidence.json`

## Risk
- Worktree is large and dirty from the long run; stage surgically, never
  `git add -A`.
- Full repo lint was not rerun in P+23; previous checkpoints document known
  baseline lint issues around Room/Room integration files.
- This PR hardens post-it persistence/import evidence; it does not complete
  full Tinkercad parity.
```

## Immediate Next Prompt P+24 - Claude Final Review And Surgical Commit Prep

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Andrea ha chiesto di passare la palla a Claude appena possibile. Questa e' una
sessione di review/commit-prep, non una nuova feature.

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dal checkpoint P+20 fino a P+23 incluso.

Verifica ambiente prima di ogni azione:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+24 - Claude Final Review And Surgical Commit Prep.

Obiettivo concreto P+24:
- review severa del diff P+20-P+23;
- non implementare nuove feature;
- confermare che i gate P+23 restano verdi se Claude decide di rilanciarli;
- preparare, ma non eseguire senza ordine esplicito di Andrea, uno staging
  chirurgico e un commit/PR body;
- separare eventuali materiali Claude product-lane non collegati dal diff
  simulator/post-it;
- non pushare, non mergiare, non deployare.

Gate da considerare gia' verdi in P+23, da rilanciare solo se tocchi file:
- focused pack: 3 files / 58 tests passed;
- typecheck passed;
- build passed with existing Vite large chunk warning;
- `git diff --check` passed;
- vendored solver drift returned no diff.

Stop rules:
- fermati se serve `git add -A`, reset, clean, push, merge o deploy;
- fermati se il diff richiede una nuova feature o un refactor ampio;
- fermati se typecheck/build/test fallisce e la correzione eccede commit-prep;
- fermati se vendored solver drift appare.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+24 checkpoint se Claude esegue lavoro;
- includi review findings, staging plan, eventuali gate rilanciati e rischi
  residui.
```

## Session P+24 Partial Checkpoint - CodeRabbit Auth Required

Status: partial on 2026-07-08.

Scope attempted:
- Re-read the required 1817-line attached long-run prompt.
- Re-read `$superpowers:using-superpowers` and the Codex reference.
- Read the `coderabbit:code-review` skill because P+24 asks for review.
- Verified current worktree state and disk before attempting review.
- Did not implement features.
- Did not stage, commit, push, merge, deploy, reset, clean, or add
  dependencies.

Environment:
- `pwd`: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- `df -h .`: `/System/Volumes/Data` 460Gi size, 410Gi used, 3.8Gi available,
  100% capacity.
- Worktree remains dirty from the long run and includes the expected tracked
  and untracked simulator/post-it files plus output artifacts.

CodeRabbit review attempt:
- `command -v coderabbit` -> `/Users/andreamarro/.local/bin/coderabbit`
- `coderabbit --version` -> `0.5.2`
- `coderabbit auth status --agent` returned:
  `{"type":"status","phase":"auth","status":"not_authenticated","authenticated":false}`
- `coderabbit auth login --agent` started and returned
  `awaiting_browser_auth`; it did not complete without human/browser
  authentication.
- The login process was interrupted so no background process was left running.
- Per the CodeRabbit skill, no manual review is being represented as a
  CodeRabbit review.

P+24 result:
- CodeRabbit review is blocked on agent authentication, not on repository state.
- P+23 remains the latest fully green checkpoint:
  focused pack 3 files / 58 tests passed, typecheck passed, build passed,
  `git diff --check` passed, vendored solver drift returned no diff.
- No additional gate was rerun in this partial P+24 because no code changed and
  the only attempted work was review authentication.

Next action for Claude or Andrea:
- Complete CodeRabbit agent authentication with:
  `coderabbit auth login --agent`
- Then rerun:
  `coderabbit auth status --agent`
- If authenticated, run the intended review:
  `coderabbit review --agent -t uncommitted -c AGENTS.md`
- Parse CodeRabbit NDJSON findings by severity and update this runbook with a
  real P+24 review checkpoint.

## Immediate Next Prompt P+24 Retry - CodeRabbit Review And Surgical Commit Prep

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Questa e' ancora P+24. La sessione precedente non ha completato la review:
CodeRabbit CLI era installato ma non autenticato in agent-mode.

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dal checkpoint P+20 fino a "Session P+24 Partial Checkpoint -
  CodeRabbit Auth Required".

Verifica ambiente:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+24 Retry - CodeRabbit Review And Surgical Commit Prep.

Passi:
1. Verifica `coderabbit --version`.
2. Verifica `coderabbit auth status --agent`.
3. Se non autenticato, chiedi ad Andrea di completare
   `coderabbit auth login --agent` e fermati senza spacciarla per review.
4. Se autenticato, esegui:
   `coderabbit review --agent -t uncommitted -c AGENTS.md`
5. Riporta issue ordinate per severita'.
6. Prepara uno staging plan chirurgico, ma non fare staging/commit/push senza
   ordine esplicito di Andrea.

Gate da considerare gia' verdi da P+23, da rilanciare solo se tocchi file:
- focused pack: 3 files / 58 tests passed;
- typecheck passed;
- build passed with existing Vite large chunk warning;
- `git diff --check` passed;
- vendored solver drift returned no diff.

Stop rules:
- fermati se CodeRabbit non e' autenticato;
- fermati se serve `git add -A`, reset, clean, push, merge o deploy;
- fermati se il diff richiede una nuova feature o un refactor ampio;
- fermati se typecheck/build/test fallisce e la correzione eccede commit-prep;
- fermati se vendored solver drift appare.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+24 checkpoint;
- includi CodeRabbit status, review findings, staging plan, eventuali gate
  rilanciati e rischi residui.
```

## Session P+24 Retry Checkpoint - CodeRabbit Still Not Authenticated

Status: still blocked on CodeRabbit agent authentication on 2026-07-08.

Scope attempted:
- Re-read the required 1817-line attached long-run prompt.
- Re-read `$superpowers:using-superpowers`, the Codex reference, and the
  CodeRabbit review skill.
- Re-read the P+24 retry recovery set:
  `AGENTS.md`, `apps/studio/AGENTS.md`, `docs/vault/ARDESIA-MAP.md`,
  `docs/ELAB-AS-PLUGIN-CANON.md`,
  `docs/architecture/simulation-plugin-v2.md`,
  `docs/product/ELABTUTOR-PLUGIN-SPEC.md`, and this runbook from P+23/P+24.
- Verified environment:
  `pwd`, branch, dirty status, diff stat/name-only, and disk.
- Did not implement features.
- Did not stage, commit, push, merge, deploy, reset, clean, or add
  dependencies.

Environment:
- `pwd`: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch: `docs/simulation-plugin-v2-contract-20260707`
- `df -h .`: `/System/Volumes/Data` 460Gi size, 410Gi used, 3.8Gi available,
  100% capacity.
- Worktree still has the expected long-run dirty state:
  25 tracked modified files plus many untracked simulator/post-it/output files.

CodeRabbit status:
- `coderabbit --version` -> `0.5.2`
- `coderabbit auth status --agent` ->
  `{"type":"status","phase":"auth","status":"not_authenticated","authenticated":false}`
- Per the P+24 Retry prompt, no CodeRabbit review was run and no manual review
  is being represented as a CodeRabbit review.

Current state:
- P+23 remains the latest fully green checkpoint:
  focused pack 3 files / 58 tests passed, typecheck passed, build passed,
  `git diff --check` passed, vendored solver drift returned no diff.
- P+24 cannot complete until CodeRabbit agent auth is completed externally.

Required next action:
- Andrea or Claude must complete:
  `coderabbit auth login --agent`
- Then verify:
  `coderabbit auth status --agent`
- Only after authenticated, run:
  `coderabbit review --agent -t uncommitted -c AGENTS.md`

## Session P+24 Blocked Handoff - Third CodeRabbit Auth Check

Status: blocked on CodeRabbit agent authentication on 2026-07-08.

Third consecutive auth audit:
- Re-read `$superpowers:using-superpowers` and its Codex reference.
- Re-checked CodeRabbit agent auth:
  `coderabbit auth status --agent` ->
  `{"type":"status","phase":"auth","status":"not_authenticated","authenticated":false}`
- Confirmed no exact `coderabbit` executable process is left running:
  `pgrep -x coderabbit` returned no process.
- Ran `git diff --check`; it returned clean.
- No CodeRabbit review was run.
- No code, tests, staging, commit, push, merge, deploy, reset, clean, or
  dependency changes were made in this handoff pass.

Claude handoff:
- P+23 remains the latest fully green checkpoint:
  focused pack 3 files / 58 tests passed, typecheck passed, build passed,
  `git diff --check` passed, and vendored solver drift returned no diff.
- The only blocker for P+24 is external CodeRabbit agent authentication.
- Resume with:
  `coderabbit auth login --agent`
- Verify with:
  `coderabbit auth status --agent`
- Then run the real P+24 review:
  `coderabbit review --agent -t uncommitted -c AGENTS.md`

## Historical Immediate Next Prompt P+16 (superseded by P+17)

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+15.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Recupera memoria per:
- ardesia-plugin-postit-objects
- board-persistence-plugin-postits
- multi-postit-workbench-state
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork
- tinkercad-parity-simulation-postit

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+16 - Visible Room Reload Evidence For Persisted Plugin Post-its.

Obiettivo concreto P+16:
- collegare il payload board P+15 a una prova visibile o renderizzabile in
  `Room` / board host senza creare una seconda UI parallela;
- dimostrare che una scena `board.excalidraw` salvata con tre plugin post-it
  puo' essere ricaricata e presentata come tre post-it distinti;
- dimostrare che export/import/reload preserva instanceId, pluginId, bounds,
  function surface mode, provider diagnostics, solver output e link
  ELABTutor -> sim-a;
- nessun secondo simulatore ELABTutor;
- nessun import privato solver/canvas/breadboard/provider dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima;
- non introdurre nuove dipendenze.

Approccio:
- Test-first.
- Parti da:
  apps/studio/src/design/multiPostitBoardPersistence.ts
  apps/studio/src/design/MultiPostitWorkbench.tsx
  apps/studio/src/Room.tsx
  apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx
  apps/studio/src/toolhost/caps/board.ts
  apps/studio/src/store/WorkspaceStore.ts
- Se il render completo in `Room` e' troppo ampio, crea il piu' piccolo adapter
  renderizzabile che legge lo stesso board element payload P+15 e documenta
  esattamente cosa resta fuori.

Required tests:
- RED prima della fix.
- scena board con tre plugin post-it salvata e ricaricata produce tre post-it
  renderizzabili o tre render model coerenti;
- nessun duplicate DOM/control id dopo restore/render;
- board element bounds guidano compact/normal/expanded;
- provider diagnostics/solver output restano instance-scoped;
- ELABTutor render/model mantiene `simulation-runtime/1` e
  `simulationInstanceId: sim-a`;
- source guard esteso: nessun import privato solver/canvas/breadboard/provider
  nel render adapter.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- npm --prefix apps/studio run build
- git diff --check
- git diff -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- se tocchi UI/harness, prova `/?vista=simulatore-postit` o la route Room
  usata;
- registra route, viewport, screenshot, console errors,
  nonblank/no incoherent overlap;
- prova reload/import visibile, non solo helper puro.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+16.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+16 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/build/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo.
```

## Historical Immediate Next Prompt (superseded by P+12)

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md
- docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
- docs/architecture/simulation-plugin-v2.md
- docs/product/ELABTUTOR-PLUGIN-SPEC.md
- docs/ELAB-AS-PLUGIN-CANON.md

Recupera memoria per:
- ardesia-plugin-postit-objects
- simultaneous-plugin-postits
- responsive-plugin-functions
- elabtutor-postit-capabilities
- tinkercad-parity-simulation-postit
- single-simulation-plugin-runtime
- no-elabtutor-simulator-fork

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+2 - Simultaneous Plugin Post-its.

Obiettivo concreto P+2:
- provare piu' plugin post-it attivi insieme senza collisioni di stato, eventi,
  provider, DOM o shortcut;
- provare due Simulation post-it indipendenti;
- provare un ELABTutor consumer post-it accanto a un Simulation post-it;
- assicurare che keyboard/hover/proximity siano instance-scoped;
- assicurare che provider diagnostics e solver outputs siano associati
  all'istanza corretta;
- non creare un secondo simulatore ELABTutor;
- non importare solver/canvas/breadboard dal pack ELABTutor;
- non toccare solver vendored;
- massimo 5 file per ciclo, salvo split plan scritto prima.

Approccio:
- Test-first.
- Parti dal contratto P+1 in apps/studio/src/toolhost/postitObject.ts.
- Crea un test dedicato, preferibilmente
  apps/studio/src/__tests__/PluginPostitConcurrency.test.tsx oppure .test.ts se
  il modello puro basta.
- Usa helper puri o registry/host minimale solo se necessario.
- Non introdurre nuove dipendenze.
- Non spostare o riscrivere ToolCanvasEmbeddable se bastano contratti puri.

Required tests:
- due simulation post-it: mutare una istanza non cambia l'altra;
- Simulation post-it + ELABTutor consumer post-it: function/proximity state
  resta separato;
- nessun duplicate DOM id o id di controllo per istanze diverse, se UI viene
  renderizzata;
- nessun mutable singleton globale usato per stato per-instance;
- diagnostics/provider output sono agganciati a instanceId corretto.

Comando focused minimo:
npm --prefix apps/studio run test -- src/__tests__/PluginPostitConcurrency.test.tsx src/__tests__/PluginPostitObject.test.ts src/__tests__/SimulationPluginWorkbench.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000

Se scegli .test.ts invece di .test.tsx, usa il nome file corretto nel comando.

Gate obbligatori:
- npm --prefix apps/studio run typecheck
- cd apps/studio && npm exec eslint -- <touched files>
- git diff --check
- git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components

Playwright:
- Se P+2 cambia render UI/canvas, avvia la route necessaria e registra route,
  viewport, screenshot, console errors e prova di non-blank/no-overlap.
- Se P+2 resta modello puro, dichiara esplicitamente perche' Playwright non era
  necessario.

Stop rules:
- fermati se typecheck fallisce;
- fermati se vendored solver drift appare;
- fermati se serve una nuova dipendenza;
- fermati se la fix richiede push, deploy, merge, staging, reset, clean, o
  refactor ampio non previsto;
- fermati se il test focused fallisce e la correzione eccede P+2.

Checkpoint obbligatorio:
- aggiorna questo file con Session P+2 checkpoint;
- includi file letti, file cambiati, test con conteggi numerici,
  typecheck/lint/diff/drift, Playwright se applicabile, claim prodotto,
  rischi residui e prossimo prompt long-run completo per P+3.
```


---

## Session P+21 Checkpoint - Verified By Claude (already-implemented) — 2026-07-08

**Premise correction (factual, no speculation):** the "P+21 not started" handoff was STALE. This session began under a handoff claiming Codex did not start P+21 and the helper emits minimal fields; firsthand file reads CONTRADICT that — the full Excalidraw shape is present (`apps/studio/src/design/multiPostitBoardPersistence.ts:33-63,167-208`). File mtimes (18:50/19:04/19:06 CEST) place the work AFTER the 18:42 handoff, and the same runbook already carries a 19:20 CEST completion checkpoint. The premise was stale, not a fabrication. Authorship is not attributable from git (all files untracked).

### Files read (no modifications made)
- `apps/studio/src/design/multiPostitBoardPersistence.ts` (createPluginPostitBoardElement/Scene, restore, element factory)
- `apps/studio/src/design/multiPostitWorkbenchModel.ts` (createMultiPostitWorkbenchPostits → sim-a, sim-b, elab-consumer)
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts` (the P+21 test)
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx` (normalizeDuplicatedToolEmbeds — READ ONLY)
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx` (render path)
- `apps/studio/src/toolhost/postitObject.ts`, `src/toolhost/caps/board.ts`, `src/toolhost/caps/instance.ts`
- Cross-refs: `Room.tsx`, `Room.integration.test.tsx`, `WorkspaceStore.ts`, `lessonBundle.ts`, `node_modules/@excalidraw/excalidraw/dist/types/.../types.d.ts`

### Files changed
**NONE.** P+21 was already implemented in the working tree; this was a verification pass only. The three key files remain UNTRACKED (`??`): `multiPostitBoardPersistence.ts`, `BoardPluginPostitPersistence.test.ts`, `pluginPostitBoardRender.tsx` (plus `multiPostitWorkbenchModel.ts`, `postitObject.ts`); `ToolCanvasEmbeddable.tsx` is tracked+modified (`M`). Never committed; `git log --all` and `git stash list` empty for the production files.

### Gates (independently re-captured)
- **Tests:** `BoardPluginPostitPersistence.test.ts` = **9 passed / 9** in isolation (vitest v4.1.8) — NOTE: the handoff's "8" undercounts; the file has 9 `it()` blocks. Focused pack true total is **58, not 57**. One shared-run observed 2 pre-existing FLAKY Room.integration failures (`:176` mount-timeout, `:193` loading-indicator) under concurrent jsdom load (56/58) — unrelated to P+21 (the P+21 Room test `:1283` passed; both pass in isolation).
- **Build:** PASS — `npm run build` → "✓ built in 26.62s"; re-run TRUE `NPM_EXIT=0`; build.log grep `error|exception|failed|ERR!` → no match. Only advisory ">500 kB chunk" warning.
- **Typecheck:** established `tsc -b --noEmit: 0 errors` (NOT independently re-run; build exceeded local 2-min limit; vitest/esbuild does not typecheck).
- **Solver drift:** ZERO scoped — `git diff/status --porcelain -- apps/studio/sim/solver` empty; path verified to exist (not a false-negative); `touchedSolver=false`.
- **Whitespace:** `git diff --check` clean.

### Adversarial results (7 refutations; 2 SUCCEEDED)
- **SUCCEEDED #7 (high conf, executed):** render path can emit DUPLICATE DOM/control ids. Excalidraw copy/paste → `normalizeDuplicatedToolEmbeds` rewrites only `link`, not `state.instanceId`; `createRenderModelFromElement` (`pluginPostitBoardRender.tsx:42-53`) guards only on owner (recomputed from clone → always passes). Probe: 14 ids / 7 unique, `id=plugin-postit-sim-a` twice; hydration path REJECTS the same scene ('link mismatch'). Severity low; reachability requires a board.excalidraw scene loaded into a live Room (no current live UI flow does).
- **SUCCEEDED #4 (medium conf, executed):** `.lesson` round-trip HARD-FAILS on type-valid non-finite numbers — `Infinity`/`NaN` survive `structuredClone` but JSON coerces to `null`, then restore THROWS 'invalid Simulation state' (`multiPostitWorkbenchModel.ts:202,235-241`). No serialize-side finite guard. Latent: the production model only emits finite values.
- **FAILED (claims survived):** #1 real-Excalidraw render (field-parity + dist validator inspection), #2 normalize no-op, #3 restore 3 owners in order, #5 3 postits/unique ids/no private imports, #6 (confirms the legacy-branch finding).

### Gaps standing (all low severity / latent)
1. Render-vs-hydrate DOM-id divergence (§ refutation #7).
2. Non-finite-number `.lesson` hard-fail (§ refutation #4).
3. Legacy-link restore branch is effectively dead / internally inconsistent (`multiPostitBoardPersistence.ts:252-257`); canonical legacy element (id=bare instanceId) rejected with 'id mismatch'.
4. `type:"embeddable"` never asserted at runtime (tsc-only).

### Product claim (honest, bounded)
P+21's production-scoped functionality is CORRECT: `createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())` emits full-shape Excalidraw embeddables that round-trip losslessly through `.lesson` export/import, restore to exactly [io.ardesia.simulation:sim-a, sim-b, io.elab.tutor:elab-consumer] with unique DOM ids, no private simulator/solver imports, and no second ELABTutor simulator (elab-consumer is a pointer to sim-a). This is UNIT-verified. It is NOT proven in a real browser.

### Residual risks (real, unclosed)
- Real `<Excalidraw>` 0.18.1 render is inferred from field-parity with the e2e-proven `createToolEmbedElement`, never observed: `index:null` via `updateScene` (`Room.tsx:561`, no restore), `validateEmbeddable` admittance, `restore()` preserving customData/link/index, embeddable pointer/selection gating. Only Playwright can close these.
- The `BoardPluginPostitPersistence.test.ts:543` `link:null` render assertion exercises a path real Excalidraw rejects at `validateEmbeddable`.
- Link URL-safety guaranteed only by the `assertWorkbenchPostit` allow-list, not by `assertPluginId` (non-empty check only) — would break if a non-hostname-safe pluginId were allow-listed.
- The two flaky Room.integration failures under load were not isolated as non-deterministic vs regression.

### Verdict
**p21-gap-found** — implementation is real and tests are green (9/9), but two adversarial refutations succeeded and two audits are gap-found (all low/latent), and Playwright-class real-browser risk is unclosed. Not clean-complete.

### Next long-run prompt (P+22)
"P+22 — Close the P+21 real-browser and robustness gaps. (1) Add a Playwright e2e that generates a `.lesson` via the PRODUCTION helper `createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())`, imports it through the real Room file picker, reloads, and asserts: three plugin-postit cards render via real Excalidraw `renderEmbeddable` (not the mock), zero console errors, and no duplicate DOM ids — on desktop AND mobile viewports. (2) Fix the render-vs-hydrate divergence: make `createRenderModelFromElement` (`pluginPostitBoardRender.tsx:42-53`) reject duplicate `state.instanceId` OR have `normalizeDuplicatedToolEmbeds` re-key `state.instanceId`/`owner` on duplication, so the render path stops producing duplicate `id=plugin-postit-<instanceId>` articles; add a test that duplicates an element then renders. (3) Add a non-finite-number guard on the serialize side (`serializePluginPostitObject`/`createPluginPostitBoardElement`) so `Infinity`/`NaN` currents are rejected or sanitized BEFORE JSON, and add a round-trip test proving `.lesson` no longer hard-fails. (4) Either implement a genuine legacy-id branch at `multiPostitBoardPersistence.ts:255` (accept `element.id === bare instanceId` when the legacy link is present) or delete the dead legacyLink branch and document new-format-only. (5) Add a runtime assertion that `element.type === 'embeddable'`. (6) COMMIT the P+21 files (currently untracked) once gates are green. Gate every step with `tsc -b --noEmit` (NOT vitest alone — esbuild false-green), full focused vitest run, and `git diff --check`."

## Session P+22a checkpoint - Board Post-it Robustness Gaps (2026-07-08)

Status: robustness sub-slice completed; real-browser Playwright evidence still open.

Scope:
- Executed the non-browser robustness portion of P+22 only, staying within the
  5-file cycle limit.
- No route, Room wiring, Excalidraw runtime, Playwright spec, vendored solver,
  dependency, staging, commit, push, merge, deploy, reset, or clean.
- The P+22 commit instruction was not executed because the active guardrails
  forbid staging/commit without explicit human instruction.

Files read:
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/caps/board.ts`

Environment:
- `pwd` → `/Users/andreamarro/ardesia-wt/tutor-ux`
- Branch → `docs/simulation-plugin-v2-contract-20260707`
- `df -h .` → `/System/Volumes/Data` 460Gi size, 410Gi used,
  3.7Gi available, 100% capacity.
- Worktree remains intentionally dirty/uncommitted with many inherited tracked
  and untracked files from P+0-P+21 and Claude consolidation slices.

AgentMemory:
- Attempted required REST fallback:
  `curl -fsS --max-time 5 -X POST http://127.0.0.1:3111/agentmemory/smart-search ...`
- Result: failed to connect to `127.0.0.1:3111`; no memory data was available
  in this local session. No facts were inferred from memory.

Files changed by P+22a:
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`

Implementation:
- Added serialize-side finite-number validation for plugin post-it state.
  `serializePluginPostitObject()` now rejects `Infinity`/`NaN` before JSON can
  coerce them to `null` during `.lesson` export.
- Added runtime `type === "embeddable"` assertion for persisted plugin post-it
  board elements.
- Implemented the previously dead legacy branch: a legacy element with
  `element.id === instanceId` and link
  `maestro-tool://<pluginId>/<instanceId>` restores correctly.
- Hardened `renderPluginPostitBoardEmbeddable()` so a copied/normalized board
  element whose Excalidraw id no longer matches the persisted
  `state.instanceId` throws instead of rendering duplicate DOM/control ids.

TDD:
- RED before implementation: `BoardPluginPostitPersistence.test.ts` failed
  4 expected tests:
  duplicated render element accepted; non-finite state accepted; legacy bare-id
  branch rejected; non-embeddable marker accepted.
- GREEN after implementation: `BoardPluginPostitPersistence.test.ts` passed
  13/13 tests.

Commands and results:
- `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts ...`
  → 1 test file, 13 tests passed.
- `npm --prefix apps/studio run test -- src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts ...`
  → 5 test files, 33 tests passed.
- `npm --prefix apps/studio run typecheck`
  → passed.
- `cd apps/studio && npm exec eslint -- src/__tests__/BoardPluginPostitPersistence.test.ts src/design/multiPostitBoardPersistence.ts src/toolhost/pluginPostitBoardRender.tsx src/toolhost/postitObject.ts`
  → passed.

Playwright:
- Not run in P+22a. This sub-slice changed robust parsing/serialization/render
  guards only and intentionally stayed under the 5-file cycle limit.
- Real-browser Excalidraw evidence is still the main remaining P+22 gap and is
  the next sub-slice.

Product claim:
- P+21 robustness gaps #2, #3, #4, and #5 are closed at unit/integration-test
  level.
- P+21 real-browser risk remains unclosed: no production Room import/reload was
  observed in Playwright yet.

Known residual risks:
- Real Excalidraw 0.18 render/import/reload behavior remains inferred, not
  browser-proven.
- `normalizeDuplicatedToolEmbeds()` still only rewrites links for generic
  duplicated tool embeds; the plugin-postit render path now rejects the unsafe
  copied-state shape, but the UX recovery path is still "reject" rather than
  "auto re-key".
- The worktree is still uncommitted/untracked; P+21/P+22 artifacts are not
  durable in git.

Next long-run prompt (P+22b):

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+22a.
- Leggi docs/architecture/simulation-plugin-v2.md.
- Leggi docs/product/ELABTUTOR-PLUGIN-SPEC.md.
- Leggi docs/ELAB-AS-PLUGIN-CANON.md.

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- git diff --name-only
- df -h .

Esegui solo P+22b - Real-browser Room/Excalidraw Evidence.

Obiettivo concreto:
- aggiungere o eseguire una prova Playwright reale che usa helper di produzione
  `createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())`;
- importare o caricare la scena `.lesson`/`board.excalidraw` tramite il percorso
  reale di Room/Excalidraw disponibile nel repo;
- verificare su desktop e mobile/tablet: tre plugin post-it renderizzati, zero
  console error, nessun duplicate DOM/control id, canvas/embeddables non blank,
  nessun overlap incoerente dei controlli;
- registrare route, viewport, screenshot/result path e console errors;
- non toccare solver vendored;
- non introdurre dipendenze;
- massimo 5 file salvo split plan scritto prima;
- no staging/commit/push a meno di istruzione esplicita umana.

Gate:
- focused Playwright o test e2e appena aggiunto;
- focused Vitest board/postit pack;
- `npm --prefix apps/studio run typecheck`;
- scoped eslint sui file toccati;
- `git diff --check`;
- `git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  deve restituire zero output.

Checkpoint:
- aggiorna questo runbook con P+22b, includendo file letti/cambiati, test con
  conteggi, typecheck/lint/diff/drift, Playwright evidence, claim prodotto e
  prossimo prompt.
```

## Session P+22b checkpoint - Real Browser Room/Excalidraw Evidence (2026-07-08)

Scope executed:
- Added one real Playwright e2e under `apps/studio/e2e/` that builds a real
  `.lesson` ZIP in-test with `JSZip`.
- The `.lesson` uses the production helper chain exactly at the scene boundary:
  `createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())`.
- Import path is the real Room file input:
  `input[type="file"][accept*=".lesson"]` -> `handleFile()` ->
  `WorkspaceStore.importLessonBlobForRoom()` -> `api.updateScene()`.
- Rendering path is the real Excalidraw `renderEmbeddable` callback through
  `renderToolCanvasEmbeddable()` and `renderPluginPostitBoardEmbeddable()`.
- No production code was modified in P+22b.

Files read / checked in P+22b:
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- this runbook from P+22a/P+22b onward
- `apps/studio/package.json`
- `apps/studio/playwright.config.ts`
- `apps/studio/e2e/saved-lessons.spec.ts`
- `apps/studio/src/App.tsx`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/store/lessonBundle.ts`
- `apps/studio/src/store/types.ts`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- Excalidraw local type declarations:
  `apps/studio/node_modules/@excalidraw/excalidraw/dist/types/excalidraw/element/types.d.ts`
  and `fractionalIndex.d.ts`.

Files changed / generated by P+22b:
- Added `apps/studio/e2e/plugin-postit-room-reload.spec.ts`.
- Updated this runbook.
- Generated evidence:
  - `output/playwright/plugin-postit-room-desktop.png`
  - `output/playwright/plugin-postit-room-desktop.json`
  - `output/playwright/plugin-postit-room-tablet.png`
  - `output/playwright/plugin-postit-room-tablet.json`

Playwright evidence:
- Final command:
  `npm --prefix apps/studio run e2e -- e2e/plugin-postit-room-reload.spec.ts`
- Result: 2 tests passed, 2/2 viewports.
- Desktop:
  - route: `/#p22b-plugin-postit-desktop-0`
  - viewport: `1440x960`
  - screenshot: `output/playwright/plugin-postit-room-desktop.png`
  - result JSON: `output/playwright/plugin-postit-room-desktop.json`
  - screenshot bytes: `92148`
  - canvas rect: `1440x907`
  - cards: `elab-consumer`, `sim-a`, `sim-b`
  - plugins: 2x `io.ardesia.simulation`, 1x `io.elab.tutor`
  - console errors: `[]`
  - plugin duplicate ids: `[]`
- Tablet:
  - route: `/#p22b-plugin-postit-tablet-0`
  - viewport: `768x1024`
  - screenshot: `output/playwright/plugin-postit-room-tablet.png`
  - result JSON: `output/playwright/plugin-postit-room-tablet.json`
  - screenshot bytes: `68157`
  - canvas rect: `768x971`
  - cards: `elab-consumer`, `sim-a`, `sim-b`
  - plugins: 2x `io.ardesia.simulation`, 1x `io.elab.tutor`
  - console errors: `[]`
  - plugin duplicate ids: `[]`

Important caveat from real browser:
- The first stricter Playwright run failed because a full-page duplicate-id
  audit found one Excalidraw-generated global id per viewport with suffix
  `*-undefined`.
- The duplicate is outside the plugin-postit namespace; the feature-scoped
  `plugin-postit-*` control ids are unique in both viewports.
- Evidence JSON keeps both fields:
  - `duplicateIds`: includes the Excalidraw internal `*-undefined` duplicate.
  - `pluginDuplicateIds`: `[]`.
- Local Excalidraw type declarations confirm raw elements may have
  `index: FractionalIndex | null`; P+22b did not change the existing
  `index: null` embeddable contract used elsewhere.

No-overlap / nonblank checks:
- Each rendered card has positive dimensions, text content, and a feature id
  containing its instance id.
- Pairwise post-it card rectangles report no overlaps.
- Canvas rect is >240px in both dimensions on both viewports.
- Screenshot files are non-empty and exceed 10 KB.

Gates run:
- Playwright final:
  `npm --prefix apps/studio run e2e -- e2e/plugin-postit-room-reload.spec.ts`
  -> 2 passed.
- Focused Vitest board/postit pack:
  `cd apps/studio && npx vitest run src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts`
  -> 5 files passed, 33 tests passed.
- Note: an earlier Vitest invocation from repo root failed only because these
  tests intentionally read `process.cwd()/src/...`; rerun from `apps/studio`
  passed with the same focused pack.
- Typecheck:
  `npm --prefix apps/studio run typecheck`
  -> pass.
- Scoped eslint:
  `cd apps/studio && npx eslint e2e/plugin-postit-room-reload.spec.ts`
  -> pass.
- Build:
  `npm --prefix apps/studio run build`
  -> pass; Vite reported only the existing chunk-size warning.
- Whitespace:
  `git diff --check`
  -> pass, no output.
- Vendored solver drift:
  `git status --porcelain -- apps/studio/sim/solver`
  -> no output.
- Vendored solver sha256 test:
  `cd apps/studio && npx vitest run src/__tests__/SolverVendoredDrift.test.ts`
  -> 1 file passed, 2 tests passed.

P+22b product claim:
- Real browser Room can import a `.lesson` generated from production plugin
  post-it helpers and render three plugin post-it embeddables through the real
  Excalidraw host on desktop and tablet.
- The plugin post-it control namespace is duplicate-free, console-error-free,
  visible/nonblank, and non-overlapping in the captured evidence.
- A separate Excalidraw-internal duplicate id remains recorded as a caveat for
  follow-up; P+22b did not hide it.

Status:
- No staging.
- No commit.
- No push.
- No deploy.
- Worktree remains dirty/untracked from the broader P+21/P+22 long run.

Next long-run prompt (P+23, suitable for Claude handoff):

```text
CONTINUA LA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dall'ultimo checkpoint P+22b.
- Leggi la nuova spec:
  apps/studio/e2e/plugin-postit-room-reload.spec.ts
- Leggi evidence JSON:
  output/playwright/plugin-postit-room-desktop.json
  output/playwright/plugin-postit-room-tablet.json

Verifica ambiente prima del codice:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- df -h .

Obiettivo P+23 - Real-browser duplicate-id follow-up + commit readiness:
1. Investigare il duplicate id globale Excalidraw `*-undefined` registrato in
   P+22b. Determina se nasce dal nostro payload, da `index: null`, dal rendering
   interno Excalidraw, o da markup terzo non controllabile.
2. Se nasce dal nostro payload, correggi con patch minima e test browser reale.
   Se e' interno Excalidraw/non controllabile, documenta il perimetro e lascia
   il gate feature-scoped `pluginDuplicateIds: []`.
3. Non toccare solver vendored, non introdurre dipendenze, massimo 5 file salvo
   split plan scritto prima.
4. Non fare staging/commit/push senza istruzione esplicita umana, anche se i
   gate sono verdi.

Gate minimo:
- focused Playwright:
  npm --prefix apps/studio run e2e -- e2e/plugin-postit-room-reload.spec.ts
- focused Vitest board/postit pack da apps/studio
- npm --prefix apps/studio run typecheck
- scoped eslint sui file toccati
- git diff --check
- git status --porcelain -- apps/studio/sim/solver deve essere vuoto
- opzionale ma preferito: npm --prefix apps/studio run build

Checkpoint:
- aggiorna il runbook con P+23, includendo decisione sul duplicate id globale,
  file cambiati, evidence, gate, rischi residui e prossimo prompt.
```

## Session P+23 checkpoint - Excalidraw duplicate-id root cause + Claude handoff (2026-07-08)

Scope executed:
- Analyzed the Claude/user handoff material and used it only where it matched
  local evidence. The attached long-run text was historical/stale through
  P+4/P+12, while this local runbook and the P+22b evidence were the current
  source of truth.
- Investigated the P+22b caveat: one global duplicate DOM id with suffix
  `*-undefined` in the real Excalidraw page.
- Kept the investigation feature-scoped: no production code, no vendored solver
  code, no dependency, no node_modules patch.
- Strengthened the real-browser Playwright spec so it records pre-import
  duplicates, duplicate node details, scene element indexes, and asserts that
  importing the `.lesson` introduces no new duplicate ids.

Files read / checked in P+23:
- `AGENTS.md`
- `apps/studio/AGENTS.md`
- `docs/vault/ARDESIA-MAP.md`
- `docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ELAB-AS-PLUGIN-CANON.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `apps/studio/e2e/plugin-postit-room-reload.spec.ts`
- `output/playwright/plugin-postit-room-desktop.json`
- `output/playwright/plugin-postit-room-tablet.json`
- Read-only Excalidraw local source:
  `apps/studio/node_modules/@excalidraw/excalidraw/dist/dev/index.js`
- Attachment analyzed:
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`

Files changed / generated by P+23:
- Updated `apps/studio/e2e/plugin-postit-room-reload.spec.ts`.
- Regenerated:
  - `output/playwright/plugin-postit-room-desktop.png`
  - `output/playwright/plugin-postit-room-desktop.json`
  - `output/playwright/plugin-postit-room-tablet.png`
  - `output/playwright/plugin-postit-room-tablet.json`
- Updated this runbook.

Duplicate-id root cause:
- The duplicate id exists before importing the `.lesson`.
- Desktop:
  - `preImportDuplicateIds`: `["kMR46NoBFnh-cOXCNsAgI-undefined"]`
  - `duplicateIds`: `["kMR46NoBFnh-cOXCNsAgI-undefined"]`
  - `postImportNewDuplicateIds`: `[]`
  - `pluginDuplicateIds`: `[]`
- Tablet:
  - `preImportDuplicateIds`: `["W5YitbR0vlO8C68MmRmJ9-undefined"]`
  - `duplicateIds`: `["W5YitbR0vlO8C68MmRmJ9-undefined"]`
  - `postImportNewDuplicateIds`: `[]`
  - `pluginDuplicateIds`: `[]`
- Duplicate nodes are Excalidraw toolbar radio inputs, not plugin post-it
  controls:
  - tag: `INPUT`
  - class: `ToolIcon_type_radio ToolIcon_size_medium`
  - examples: `toolbar-hand`, `toolbar-selection`, `toolbar-rectangle`,
    `toolbar-diamond`, `toolbar-ellipse`, `toolbar-arrow`, `toolbar-line`,
    `toolbar-freedraw`, `toolbar-text`, `toolbar-eraser`
  - nearest Excalidraw container: `.excalidraw excalidraw-container`
  - nearest plugin post-it instance: `null`
- Read-only Excalidraw source confirms why the suffix is `undefined`:
  - `ToolButton` sets radio input id as ``${excalId}-${props.id}``.
  - toolbar `SHAPES.map(...)` passes `data-testid` but no `id` prop.
  - `HandButton` also calls `ToolButton` without an `id` prop.
- Decision: this is third-party/internal Excalidraw toolbar markup, already
  present before the plugin scene import. It is not caused by our payload,
  by `index: null`, or by plugin post-it rendering. No production patch is
  justified in this cycle.

Scene/payload evidence:
- After import, Excalidraw normalizes the three plugin board embeddables to
  non-null fractional indexes:
  - `plugin-postit-sim-a-board`, `type: embeddable`, `index: "a0"`
  - `plugin-postit-sim-b-board`, `type: embeddable`, `index: "a1"`
  - `plugin-postit-elab-consumer-board`, `type: embeddable`, `index: "a2"`
- Rendered post-it cards remain:
  - `plugin-postit-elab-consumer`
  - `plugin-postit-sim-a`
  - `plugin-postit-sim-b`
- Console errors remain `[]`.
- Post-import plugin namespace remains duplicate-free: `pluginDuplicateIds: []`.

Gates run in P+23:
- Focused Playwright:
  `npm --prefix apps/studio run e2e -- e2e/plugin-postit-room-reload.spec.ts`
  -> 2 passed.
- Focused Vitest board/postit pack from `apps/studio`:
  `npx vitest run src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts`
  -> 5 files passed, 33 tests passed.
- Typecheck:
  `npm --prefix apps/studio run typecheck`
  -> pass.
- Scoped eslint:
  `cd apps/studio && npx eslint e2e/plugin-postit-room-reload.spec.ts`
  -> pass.
- Whitespace:
  `git diff --check`
  -> pass, no output.
- Vendored solver status:
  `git status --porcelain -- apps/studio/sim/solver`
  -> no output.
- Vendored solver sha256 test:
  `cd apps/studio && npx vitest run src/__tests__/SolverVendoredDrift.test.ts`
  -> 1 file passed, 2 tests passed.
- Build:
  `npm --prefix apps/studio run build`
  -> pass; only the existing Vite chunk-size warning.

Residual risks / warnings:
- Worktree remains intentionally dirty/untracked from the broader long run.
- No staging, no commit, no push, no deploy.
- `output/playwright/` contains generated evidence and should be reviewed before
  deciding what to keep in git.
- AgentMemory REST on `127.0.0.1:3111` was unavailable during recovery
  (`connection refused`).
- Disk was tight at recovery time (`df -h .` showed about 3.7 GiB available and
  the volume at 100% capacity); avoid large artifacts unless cleaned/approved.

P+23 product claim:
- The real Room/Excalidraw `.lesson` import remains valid on desktop and
  tablet with three visible plugin post-it embeddables, no console errors, no
  plugin duplicate ids, no new duplicate ids introduced by import, and no
  vendored solver drift.
- The remaining global duplicate id is an existing Excalidraw toolbar issue,
  documented with source and runtime evidence.

Next prompt for Claude handoff (P+24):

```text
CLAUDE HANDOFF - CONTINUA LONG RUN POSTIT + SIMULATION TINKERCAD PARITY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery obbligatoria:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dai checkpoint P+22b e P+23.
- Leggi apps/studio/e2e/plugin-postit-room-reload.spec.ts.
- Leggi evidence JSON:
  output/playwright/plugin-postit-room-desktop.json
  output/playwright/plugin-postit-room-tablet.json

Ambiente:
- pwd
- git branch --show-current
- git status --short
- git diff --stat
- df -h .

Decisione gia' presa in P+23:
- Il duplicate id globale `*-undefined` e' markup interno Excalidraw toolbar,
  presente prima dell'import `.lesson`.
- Non patchare node_modules e non introdurre produzione workaround.
- Mantieni il gate feature-scoped:
  `postImportNewDuplicateIds: []` e `pluginDuplicateIds: []`.

Obiettivo P+24:
1. Fare review di commit readiness del pacchetto P+21-P+23.
2. Separare i file da proporre per commit dai soli artifact/rumore.
3. Non fare staging/commit/push senza conferma esplicita di Andrea.
4. Se Andrea approva commit/PR, applicare prima i gate:
   - focused Playwright plugin-postit room reload
   - focused Vitest board/postit pack
   - npm --prefix apps/studio run typecheck
   - scoped eslint sui file toccati
   - git diff --check
   - vendored solver status vuoto
   - npm --prefix apps/studio run build

Output richiesto:
- lista file consigliati per commit;
- lista artifact da lasciare fuori o da valutare;
- rischi residui;
- nessuna modifica distruttiva.
```

## Session P+24 manual handoff classification - Claude-ready package (2026-07-08)

Scope executed:
- Re-read the required attached prompt
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`.
- Re-read `$superpowers:using-superpowers` and its Codex reference.
- Checked the Codex thread tools: available tools can list/read/send/fork/handoff
  Codex threads, but they do not expose a direct destination named Claude, and
  `handoff_thread` cannot move the calling thread itself.
- Searched existing Codex threads for `Claude`; the matches are older Codex
  companion/review threads under `/Users/andreamarro/VOLUME 3`, not a safe
  destination for this active worktree handoff.
- Checked CodeRabbit agent auth again: still not authenticated. This manual
  classification is therefore not a CodeRabbit review.
- No production code, tests, pack data, artifacts, staging, commit, push, merge,
  deploy, reset, clean, dependency, or solver file was changed.

Current environment snapshot:
- `pwd`: `/Users/andreamarro/ardesia-wt/tutor-ux`
- branch: `docs/simulation-plugin-v2-contract-20260707`
- disk: `/System/Volumes/Data` has about 3.7 GiB available and is at 100%
  capacity.
- tracked dirty state: 25 modified files, 2538 insertions, 254 deletions.
- untracked state includes the P+0-P+23 simulator/post-it contract files,
  docs, Playwright artifacts, and `packs/elab-tutor/postitFunctions.json`.
- `git status --porcelain -- apps/studio/sim/solver` returned no output.
- `coderabbit auth status --agent` returned
  `{"type":"status","phase":"auth","status":"not_authenticated","authenticated":false}`.

Commit package recommendation:
- Do not stage the whole worktree.
- Do not use `git add -A`.
- Treat the work as multiple commits/PRs, not one monolith:
  1. Simulator core/parity contract slice from H+/P+0-P+12.
  2. Plugin post-it model/function/runtime/viewport/catalog slices from
     P+1-P+15.
  3. Room/Excalidraw persistence/import/browser evidence slice from P+21-P+23.
  4. Product/UX docs from Claude/product-lane separately, if Andrea wants them.

Highest-priority P+21-P+23 commit candidate:
- `apps/studio/src/design/multiPostitBoardPersistence.ts`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `apps/studio/src/toolhost/postitObject.ts`
- `apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts`
- `apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx`
- `apps/studio/e2e/plugin-postit-room-reload.spec.ts`
- this runbook, if the team wants the long-run evidence in git.

Candidate files that may belong in the same persistence/import PR only after a
diff review confirms ownership:
- `apps/studio/src/Room.tsx`
- `apps/studio/src/store/WorkspaceStore.ts`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/App.tsx`
- `apps/studio/src/__tests__/Room.integration.test.tsx`

Do not include by default in the P+21-P+23 commit:
- `output/` and `output/playwright/` as a directory. It is currently untracked,
  not ignored, and about 2.6 MiB. Keep local evidence unless Andrea explicitly
  wants selected artifacts versioned.
- Older Playwright screenshots from P+9/P+12/P+13/P+14/P+16/P+18/P+19/P+20.
- Product-lane docs unless the commit is explicitly a product-doc commit:
  `docs/product/TEACHER-DASHBOARD-SPEC.md`,
  `docs/product/UI-UX-DESIGN-DIRECTION.md`,
  `docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md`,
  `docs/ops/CLAUDE-*.md`.
- Broad simulator/catalog/instrument files unless Claude intentionally prepares
  the larger parity-contract PR:
  `apps/studio/sim/core/componentCatalog.ts`,
  `apps/studio/sim/core/instrumentContract.ts`,
  `apps/studio/sim/core/placementEngineAdapter.ts`,
  `apps/studio/sim/core/simulationViewport.ts`,
  `apps/studio/sim/core/simulationWireEditor.ts`, and related tests.

Selected evidence artifacts worth keeping locally for Claude review:
- `output/playwright/plugin-postit-room-desktop.json`
- `output/playwright/plugin-postit-room-desktop.png`
- `output/playwright/plugin-postit-room-tablet.json`
- `output/playwright/plugin-postit-room-tablet.png`
- `output/playwright/room-plugin-postit-p22-exportlesson-evidence.json`
- `output/playwright/room-plugin-postit-p22-exportlesson-desktop.png`
- `output/playwright/room-plugin-postit-p22-exportlesson-mobile.png`
- `output/playwright/p22-workspace-exportlesson-board.json`
- `output/playwright/p22-workspace-exportlesson-room-import.lesson`

Manual handoff verdict:
- P+23 remains the latest fully green checkpoint.
- The P+23 duplicate-id decision is stable: the global `*-undefined` duplicate
  id is internal Excalidraw toolbar markup already present before `.lesson`
  import. Keep `postImportNewDuplicateIds: []` and `pluginDuplicateIds: []` as
  the feature gate.
- Direct Claude handoff could not be executed from this Codex tool set. The
  correct handoff artifact is the P+24 prompt below plus the file lists above.
- CodeRabbit P+24 remains blocked until Andrea/Claude completes
  `coderabbit auth login --agent`.

Recommended command sequence before any human-approved staging:
```bash
npm --prefix apps/studio run e2e -- e2e/plugin-postit-room-reload.spec.ts
cd apps/studio && npx vitest run src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts
npm --prefix apps/studio run typecheck
cd apps/studio && npx eslint e2e/plugin-postit-room-reload.spec.ts src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/design/multiPostitBoardPersistence.ts src/design/multiPostitWorkbenchModel.ts src/toolhost/pluginPostitBoardRender.tsx src/toolhost/postitObject.ts
git diff --check
git status --porcelain -- apps/studio/sim/solver
npm --prefix apps/studio run build
```

Next prompt for Claude:

```text
CLAUDE HANDOFF - P+24 COMMIT READINESS, NO NEW FEATURE.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Recovery:
- Leggi AGENTS.md e apps/studio/AGENTS.md.
- Leggi docs/vault/ARDESIA-MAP.md.
- Leggi docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  dai checkpoint P+21, P+22a, P+22b, P+23 e P+24 manual handoff.
- Leggi apps/studio/e2e/plugin-postit-room-reload.spec.ts.
- Leggi evidence JSON:
  output/playwright/plugin-postit-room-desktop.json
  output/playwright/plugin-postit-room-tablet.json

Vincoli:
- Non fare staging/commit/push/merge/deploy senza conferma esplicita Andrea.
- Non usare git add -A.
- Non fare reset/clean.
- Non toccare apps/studio/sim/solver.
- Non patchare node_modules.
- Non rappresentare una review manuale come CodeRabbit.

Obiettivo:
1. Se CodeRabbit e' autenticato, esegui:
   coderabbit review --agent -t uncommitted -c AGENTS.md
   e riporta le issue ordinate per severita'.
2. Se CodeRabbit non e' autenticato, dichiara il blocco e usa la classificazione
   manuale P+24 solo come staging plan, non come CodeRabbit review.
3. Prepara un piano di staging chirurgico per il solo pacchetto P+21-P+23.
4. Escludi output/ salvo richiesta esplicita.
5. Prima di qualsiasi commit approvato, rilancia i gate elencati nel checkpoint
   P+24 manual handoff.
```

## Session P+24 standalone Claude handoff file (2026-07-08)

Scope executed:
- Re-read the requested `$superpowers:using-superpowers` skill and Codex
  reference.
- Re-read the full attached 1817-line prompt at
  `/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt`.
- Created a standalone Claude handoff document so the next agent does not need
  to mine this long runbook for the current action.
- No production code, test code, artifact, solver file, dependency, staging,
  commit, push, merge, deploy, reset, or clean was changed.

File added:
- `docs/ops/CLAUDE-HANDOFF-P24-POSTIT-SIMULATION-20260708.md`

Purpose:
- Keep the current P+24 state in one short, Claude-readable file.
- Preserve the P+23 duplicate-id decision.
- Preserve the CodeRabbit auth blocker without representing manual review as
  CodeRabbit output.
- Provide a surgical P+21-P+23 staging plan and gate list for a future
  human-approved commit.

Current handoff pointer:
- Open
  `docs/ops/CLAUDE-HANDOFF-P24-POSTIT-SIMULATION-20260708.md`
  first, then use this runbook only for detailed checkpoint history.

Next prompt remains:

```text
CLAUDE HANDOFF - P24 COMMIT READINESS ONLY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Read:
- AGENTS.md
- apps/studio/AGENTS.md
- docs/vault/ARDESIA-MAP.md
- docs/ops/CLAUDE-HANDOFF-P24-POSTIT-SIMULATION-20260708.md
- docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  checkpoints P+21, P+22a, P+22b, P+23, P+24
- apps/studio/e2e/plugin-postit-room-reload.spec.ts
- output/playwright/plugin-postit-room-desktop.json
- output/playwright/plugin-postit-room-tablet.json

Do:
1. Verify current git/disk state.
2. Check CodeRabbit auth. If authenticated, run:
   coderabbit review --agent -t uncommitted -c AGENTS.md
3. If not authenticated, say so and continue only with staging plan review.
4. Prepare a surgical staging plan for P+21-P+23 only.
5. Do not stage, commit, push, merge, deploy, reset, clean, or touch solver
   files unless Andrea explicitly orders it.
```
