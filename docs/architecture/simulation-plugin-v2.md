# Simulation Plugin v2

Status: design approved; primary board embed now mounts the ELABTutor core canvas adapter; ELAB canvas wire add/update/delete events are bridged into structured `connect-wire`, `edit-wire.replace-path`, and `delete` operations; AI/runtime mutations now pass through structured placement, wire-edit validation, provider-derived voltmeter/probe/ammeter readings, advanced instrument capability blockers, and board-scoped runtime diagnostics; persisted legacy free-assembly state is projected into the ELAB core canvas as sandbox/monta-tu; standalone workbench/generic post-it slices remain harnesses; advanced canvas-native instruments/tools, executable AVR/runtime providers, and full native free-assembly tooling remain future work
Date: 2026-07-07
Primary slice: contract-first refoundation of the simulator as an autonomous ARDESIA plugin.

## Decision

The simulator becomes a reusable ARDESIA tool plugin mounted on the board as a post-it. ELABTutor becomes a pack/plugin consumer that supplies didactic content, manual references, lesson paths, common mistakes, and final-scene intent, but it does not own the electrical solver, breadboard renderer, scene geometry, or circuit UI.

The canonical identities are:

- Ardesia Host: owns board embeds, plugin lifecycle, install/enable/disable, capability grants, provenance, and LessonOS memory/event-log boundaries.
- Simulation Plugin: `io.ardesia.simulation`, kind `plugin`, version floor `2.0.0`, mounted as a board post-it with multiple functions and explicit capabilities.
- ELABTutor Pack: `io.elab.tutor`, kind `pack`, depends on `io.ardesia.simulation >=2.0.0`, owns only ELAB didactic data and method.

This continues the current ToolHost direction: SDK 1.2.0 exposes a plugin contract, `graph.query`, and the append-only `lesson.event.emit` write channel for supported LessonOS events. The current simulator code still lives partly inside `ToolCanvasEmbeddable.tsx` and must keep moving behind a real plugin manifest and contract.

## Current Branch Implementation

This branch now contains the first contract slice plus a visible board-embed canvas slice:

- `apps/studio/plugins/simulation/manifest.ts` declares `io.ardesia.simulation`.
- `packs/elab-tutor/manifest.json` declares `io.elab.tutor` depending on `io.ardesia.simulation >=2.0.0`.
- `apps/studio/sim/core/simulationScene.ts` defines the generic `simulation-scene/2` core contract.
- `apps/studio/sim/core/wokwiDiagramAdapter.ts` converts an external `diagram.json`-style source into that generic scene.
- `apps/studio/sim/core/sourceIntake.ts` converts structured image/description observations into the same generic scene without inventing missing geometry.
- `apps/studio/src/design/SimulationPluginWorkbench.tsx` exposes `?vista=simulatore` as a standalone Simulation Plugin workbench before ELABTutor.
- `apps/studio/sim/elab/elabCanvasAdapter.ts` maps the canonical `SimulationScene` into the ELABTutor canvas experiment/state shape and converts ELAB canvas wire add/update/delete callbacks into canonical operation envelopes.
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx` mounts the ELABTutor `renderEmbeddable()` canvas as the primary board surface for the Simulation Plugin embed.
- `apps/studio/sim/core/simulationRuntime.ts`, `simulationPlacementPipeline.ts`, and `simulationAiApi.ts` route mutating AI/runtime operations through structured scene patching, wire endpoint/waypoint edits, occupancy validation, pin-vocabulary validation, and the active provider solve.
- `apps/studio/sim/core/instrumentContract.ts` keeps instrument readings provider-bound. AI/runtime `probe` operations can store voltmeter/probe voltage readings from `SolverResult.voltages` and ammeter current readings from `SolverResult.currents`; missing refs, missing negative leads, unavailable providers, and unsupported instrument physics fail closed with structured diagnostics. AI/runtime `runInstrument` operations can request serial monitor/plotter, oscilloscope, SPICE transient, and custom-chip tools as structured `run` operations, but they only return provider-bound diagnostics and block until a runtime/SPICE/custom-chip provider is wired.
- `apps/studio/sim/core/runtimeScopeContract.ts` scopes microcontroller runtime requests. ATmega328p boards are recognized as metadata-only runtime targets until a provider is wired; Nano R4/Renesas RA4M1 is blocked and cannot fall back to the ATmega328p bridge.
- Persisted legacy free-assembly placements are folded into the scene passed to the ELAB core canvas, projected as `buildMode: "sandbox"` / `projectionMode: "monta-tu"`, and persisted with structured `place-component` operation envelopes for the placement pipeline. The legacy SVG palette remains a harness until those placement tools are canvas-native in the extracted core.

This corrects the first visual slice: opening ARDESIA no longer presents the simulator primarily as "ELAB Plugin". The route order is now:

1. `lavagna`
2. `simulatore`
3. `ELABTutor`

ELAB Lab remains temporarily available as a legacy consumer path while its circuit render/solve ownership is migrated behind the Simulation Plugin runtime. The visible standalone `simulatore` workbench and generic multi-post-it workbench remain harness surfaces; they must not be described as Tinkercad parity or as the completed Simulation Plugin.

## Migration Decision: Extract the ELABTutor Simulator Core

The reusable Simulation Plugin must be built by extracting and hardening the
existing ELABTutor simulator core, not by growing the current workbench SVG into
a second simulator.

Canonical source modules to migrate behind `io.ardesia.simulation`:

- `plugins/elab-tutor/src/components/simulator/canvas/SimulatorCanvas.jsx`
- `plugins/elab-tutor/src/components/simulator/engine/CircuitSolver.js`
- `plugins/elab-tutor/src/components/simulator/engine/PlacementEngine.js`
- `plugins/elab-tutor/src/components/simulator/engine/AVRBridge.js`
- the simulator component registry, breadboard renderer, component SVGs, wire
  renderer, validators, and interaction model.

The primary board embed now mounts the ELABTutor canvas through an adapter, with
`SimulationScene` still treated as the source of truth and SVG output treated as
rendering. Mutating AI/runtime operations now pass through the shared placement
pipeline before state is accepted, including structured `edit-wire` operations
for waypoint movement, endpoint retargeting, and full path replacement from the
ELAB canvas `onWireUpdate` event. Probe operations can derive
voltmeter/probe readings from active provider voltage results and ammeter
readings from active provider current results, but only when the provider
returns the requested refs. `runInstrument` operations can request serial
monitor/plotter, oscilloscope, SPICE transient, and custom-chip tools through
the same runtime envelope; they remain blocked when their provider is missing
instead of producing fake traces. This is still partial: the
workbench route is a contract/harness surface, the legacy free-assembly SVG now
persists structured placement operations but is still secondary, and the full
production simulator is not accepted until instrument UI/tools,
executable AVR/runtime providers, and native free-assembly tools all operate on
the same scene graph.

The production simulator must use the extracted core so ELABTutor, and later
other plugins, share one scene graph, one breadboard geometry model, one
placement engine, one solver boundary, and one interaction model.

The extraction must not port the ELABTutor standalone shell, auth, dashboards,
Supabase functions, UNLIM memory, reports, or app bootstrap. Those remain
outside the Simulation Plugin boundary.

## Competitive Target: Complete Tinkercad Parity

This is the target state, not a claim about the current mounted UI. The current
primary board embed mounts the ELABTutor core canvas adapter and bridges ELAB
wire add/update/delete callbacks to structured scene operations, but it is still
a partial simulation harness until the component registry, advanced instrument
UI/tools, executable AVR/runtime bridge, native free-assembly controls, and
persistence are fully extracted behind `io.ardesia.simulation`. The AI/runtime
mutation path is no longer allowed to bypass placement validation, wire-edit
validation, occupancy checks, pin vocabulary, provider-derived voltage/current
readings, free-assembly projection into the core canvas, or the active provider
solve.

The Simulation Plugin target is not a lightweight teaching illustration. It must
become a full ARDESIA-native circuit simulator with nothing structurally missing
against Tinkercad for the electronic learning workflows ARDESIA supports.

Parity means the plugin must eventually support:

- drag/drop placement, rotation, deletion, duplication, undo/redo, zoom, pan, and
  board-level persistence;
- breadboard, Arduino-style boards, discrete components, sensors, instruments,
  probes, and code/runtime interaction;
- live electrical solving after every user mutation;
- realistic diagnostics for shorts, overload, wrong polarity, floating pins,
  missing resistors, unsupported parts, and provider failures;
- editable wires with real endpoints, colors, routing, and node semantics;
- serial/plotter-style runtime views where the simulated board supports them;
- import/export and restoration of the complete simulator state inside ARDESIA
  board objects;
- provider expansion through local solver, wasm/ngspice-style analog solving,
  and host-mediated remote providers without fake fallback values.

The current ELABTutor simulator is the starting asset, not the final standard.
Its limits must be corrected or removed while migrating:

- `NewElabSimulator` is a god-component and cannot define the plugin boundary;
  extract the simulator runtime/canvas/tools, leave the standalone app shell out.
- `CircuitSolver` is valuable and must remain drift-guarded, but unsupported
  physics must fail closed until provider coverage exists.
- `PlacementEngine` and breadboard geometry must become a general authored
  geometry system, including per-scene board orientation and manual-figure
  transforms.
- `AVRBridge` currently models ATmega328p behavior; it must not be presented as
  exact Nano R4/Renesas RA4M1 behavior until that runtime is supported or
  explicitly scoped.
- Component registry and canvas interaction must become plugin-general, not
  ELAB-only.
- Book fidelity and physics must be tested together: a visually correct but
  electrically wrong scene fails; an electrically valid but book-wrong ELAB
  scene also fails.

## External Research Notes

The generic simulator core is shaped by these external references:

- Wokwi `diagram.json` defines a compact browser-simulator scene format: parts have `id`, `type`, `left`, `top`, attributes, and rotation; connections use `partId:pinName` endpoints plus optional orthogonal wire-placement instructions.
- Wokwi Custom Chips show the provider-adapter direction for extensible simulation models compiled to WebAssembly.
- ngspice is the right long-term analog/mixed-signal provider boundary: it consumes netlists and returns currents/voltages/graphs, but it does not provide visual schematic entry.
- KiCad and Fritzing confirm why ARDESIA needs its own visual/physical scene layer: serious EDA tools separate geometry/coordinates/connectors from solver netlists and part metadata.
- Circuit-image extraction research supports a staged image pipeline: detect components/text, segment strokes/wires, assemble topology, then validate against a schema. Image import must therefore produce structured `SimulationScene` evidence and blockers, not a guessed circuit.

## Current State Audit

The current branch already contains useful foundations:

- ToolHost SDK boundary in `apps/studio/src/sdk/index.ts` with `CONTRACT_VERSION = "1.2.0"`.
- Capability vocabulary: `board.read`, `board.write`, `graph.query`, `graph.proposeClaims`, `lesson.event.emit`, `storage`, `llm.generate`, `net.fetch`, `ui`.
- A real LessonOS read channel through `graph.query`, consumed by `apps/studio/plugins/ripasso`.
- A host-mediated LessonOS write channel through `lesson.event.emit`, currently schema-limited to supported append-only events such as `lesson.started`, `lesson.ended`, `material.cited`, `error.observed`, `exercise.completed`, and `simulation.step.completed`.
- Simulation registry in `apps/studio/src/toolhost/simulationPluginRegistry.ts`.
- Scene schema and fail-closed validation in `apps/studio/sim/elab/elabScene.ts`.
- Bridge from `circuit-scene/2` to the current renderer in `apps/studio/src/toolhost/elabSceneBridge.ts`.
- Solver wrapper in `apps/studio/sim/solver/elabSolver.ts` around the vendored `CircuitSolver`.
- ELABTutor pack data in `packs/elab-tutor`.

The gaps are structural:

- No runtime plugin exists at `apps/studio/plugins/simulation` or equivalent.
- The canonical simulator id is still `io.ardesia.simulation-plugin`, not `io.ardesia.simulation`.
- `packs/elab-tutor/manifest.json` is a data manifest with id `elab-tutor-pack`; it does not declare `io.elab.tutor` or dependency `io.ardesia.simulation >=2.0.0`.
- The first requested target, `v3-cap6-esp4`, exists as a lesson-path, but there is no verified `circuit-scene/2` fixture for it in `apps/studio/sim/fixtures`.
- Existing step predicates are limited to Vol.1 cap.6 esp.1/2. There is no verified step model for `v3-cap6-esp4`.

## Non-Negotiable Invariants

1. One canonical scene per experiment.

Each experiment with simulation support has exactly one canonical `SimulationScene`. The three student-facing modes derive from that scene:

- `gia-montato`: the mounted canonical scene.
- `passo-passo`: ordered projections over the same canonical scene.
- `monta-tu`: a free-assembly state evaluated against the same canonical scene.

The final state of `passo-passo` must normalize to the same structural scene as `gia-montato`.

2. No invented geometry.

If a manual-authored or verified scene lacks component poses, pin assignments, or wire paths, the simulator must not autogenerate a lesson-driving scene. It may return a blocked/provenance state with a concrete blocker.

3. ELABTutor cannot render or solve circuits.

ELABTutor may request a simulation post-it and pass an experiment reference. It cannot import the solver, breadboard renderer, AVR bridge, or geometry adapters directly.

4. LessonOS remains the memory boundary.

Plugins do not write directly to LessonOS storage. They use ToolHost capabilities and host-mediated events/queries. The event log remains the source of truth; graphs are derived views.

5. First slice must not fake `v3-cap6-esp4`.

`v3-cap6-esp4` is the target, but current `origin/main` lacks verified scene data. The first implementation must mark it blocked until verified scene data exists, or use an already existing fixture only as a technical harness without claiming manual verification.

6. Real interaction, not image playback.

Every accepted simulator interaction must mutate structured circuit state:
component placement, pin assignment, wire endpoint, orientation, code/runtime
state, probe position, or mode projection. After each mutation the plugin must
rerun the relevant validators and solver provider, then render the resulting
diagnostics. A canvas that only changes SVG pixels without updating scene state,
netlist, occupancy, and diagnostics is not a simulator-ready implementation.

7. Book geometry is an acceptance gate.

For ELAB experiments, the visual layout must match the authored manual figure
for that exact volume/chapter/experiment/page. Breadboard orientation, component
orientation, relative placement, polarity, and wire routing are part of the
scene contract. If a manual page shows a vertical breadboard, the verified scene
must encode and render that vertical breadboard; a horizontal canonical fallback
is a blocker unless the manual explicitly permits arbitrary placement and the
scene provenance records that canonicalization.

## Module Boundaries

### Ardesia Host

Responsibilities:

- Mount post-it embeds on the board.
- Install, enable, disable, and revoke plugins.
- Enforce manifest, contract, lifecycle, origin isolation, and capability grants.
- Persist board embed state through `board.write`.
- Expose LessonOS read views through `graph.query`.
- Promote didactic observations to LessonOS only through host-approved event producers.

The host does not know ELAB-specific lesson semantics beyond pack/plugin metadata.

### Simulation Plugin: `io.ardesia.simulation`

Responsibilities:

- Render the circuit canvas, breadboard, components, wires, tools, diagnostics, and technical UI.
- Own the canonical scene runtime contracts.
- Own projection from canonical scene to supported modes.
- Own local solving and provider dispatch.
- Surface provider diagnostics honestly: local, wasm, FastAPI provider hub, or unavailable.
- Persist only its own post-it state and tool preferences.

Initial manifest shape:

```ts
{
  manifestVersion: 1,
  id: "io.ardesia.simulation",
  name: "ARDESIA Simulation",
  version: "2.0.0",
  protocol: ">=1.0 <2.0",
  contract: ">=1.1 <2.0",
  kind: "plugin",
  entry: "dist/index.html",
  surfaces: ["board-embed", "panel"],
  capabilities: {
    "board.read": {},
    "board.write": { scope: "own-embeds" },
    "graph.query": {},
    "storage": { quotaMB: 16 },
    "ui": {}
  },
  privacy: { dataOut: "none" }
}
```

The plugin must not request `llm.generate` or `net.fetch` in the first slice. Remote provider support is host-mediated later, not an unbounded browser fetch.

### ELABTutor Pack: `io.elab.tutor`

Responsibilities:

- Declare dependency on `io.ardesia.simulation >=2.0.0`.
- Own lesson paths, manual references, expected outcomes, common mistakes, teacher-facing didactic steps, and UNLIM method text.
- Call the Simulation Plugin by experiment id and mode.
- Provide provenance: volume, chapter, page, source manual, status, blocker.

Forbidden:

- Importing `CircuitSolver`, `AVRBridge`, breadboard renderer, or simulation canvas code.
- Declaring circuit geometry outside canonical scene contracts.
- Creating duplicate step geometry separate from mounted geometry.
- Claiming a scene is verified without source evidence.

## Data Contracts

### SimulationScene

The canonical scene is the source for all modes.

```ts
type SimulationScene = {
  schemaVersion: "simulation-scene/2";
  experimentId: string;
  components: ComponentInstance[];
  pinAssignments: Record<string, BreadboardRef>;
  wires: WirePath[];
  manual: ManualReference;
  expected: ExpectedOutcome[];
  commonMistakes: CommonMistake[];
  provenance: SceneProvenance;
};
```

For the current codebase, this maps to the existing `circuit-scene/2` discipline until the naming is unified. The implementation may use adapter names internally, but the contract-facing name is `SimulationScene`.

### ComponentInstance

```ts
type ComponentInstance = {
  id: string;
  type:
    | "battery9v"
    | "breadboard-half"
    | "nano-r4"
    | "resistor"
    | "led"
    | "builtin-led"
    | "potentiometer"
    | "rgb-led";
  label?: string;
  value?: number;
  color?: string;
  pose?: { x: number; y: number; rotation?: number; parentId?: string };
};
```

### BreadboardRef

```ts
type BreadboardRef = string;
```

The grammar remains the existing breadboard ref grammar. Invalid refs fail closed.

### WirePath

```ts
type WirePath = {
  id: string;
  from: string;
  to: string;
  color: string;
  kind: "wire" | "internal";
  path?: { kind: "polyline"; points: Array<{ x: number; y: number }> };
};
```

Only authored `polyline` is accepted for lesson-driving geometry. Bezier or missing paths must fail closed when a verified visual scene is required.

### SimulationStep

```ts
type SimulationStep = {
  id: string;
  order: number;
  instructionIt: string;
  evidence: ManualReference[];
  applies: Array<{
    op: "place-component" | "connect-wire" | "set-code" | "observe";
    target: string;
  }>;
  expectedStateRef: string;
};
```

Steps are projections over the canonical scene. A step may reveal a component or wire from the canonical scene; it may not define an alternative geometry.

### SolverRequest and SolverResult

```ts
type SolverRequest = {
  scene: SimulationScene;
  provider: "local" | "wasm" | "fastapi" | "external-adapter";
  mode: "static" | "run";
};

type SolverResult = {
  ok: boolean;
  provider: string;
  diagnostics: string[];
  componentStates: Record<string, unknown>;
  currents: Record<string, number>;
  voltages: Record<string, number>;
};
```

Solver failures are user-visible diagnostics, not silent fallback to fake values.

### ManualReference

```ts
type ManualReference = {
  volume: 1 | 2 | 3;
  chapter: number;
  page: number;
  source: string;
  quote?: string;
};
```

### ExpectedOutcome and CommonMistake

```ts
type ExpectedOutcome = {
  id: string;
  labelIt: string;
  checks: string[];
};

type CommonMistake = {
  id: string;
  mistakeIt: string;
  teacherResponseIt: string;
  conceptId?: string;
};
```

### SceneProvenance

```ts
type SceneProvenance = {
  experimentId: string;
  volume: 1 | 2 | 3;
  chapter: number;
  page: number;
  sourceManual: string;
  status: "draft" | "candidate" | "reviewed" | "verified" | "blocked";
  blocker?: string;
  checks: {
    electrical: "pass" | "fail" | "unknown";
    geometry: "pass" | "fail" | "unknown";
    bookMatch: "pass" | "fail" | "unknown";
    visualMatch: "pass" | "fail" | "unknown";
  };
};
```

`status: "verified"` requires all checks to be `pass` and source evidence to exist.

## Mode Derivation

The plugin exposes a pure projection API:

```ts
type SimulationMode = "gia-montato" | "passo-passo" | "monta-tu";

type SimulationModeProjection = {
  mode: SimulationMode;
  scene: SimulationScene;
  steps?: SimulationStep[];
  editable: boolean;
};

function deriveSimulationModes(scene: SimulationScene): {
  mounted: SimulationModeProjection;
  stepByStep: SimulationModeProjection;
  freeAssembly: SimulationModeProjection;
};
```

Required equality:

```ts
normalizeScene(finalStepState(stepByStep)) === normalizeScene(mounted.scene)
```

Normalization removes UI-only state, transient selection, hover state, timestamps, and local panel settings. It preserves components, pin assignments, wires, authored wire paths, manual references, and provenance.

## Provider Hub

The first implementation keeps local solving as the only required provider. The FastAPI provider hub is a future adapter boundary with this contract:

- `GET /health`
- `GET /providers`
- `POST /scene/normalize`
- `POST /solve`
- `POST /step/apply`
- future `WS /run/events`

The provider hub never becomes the source of scene truth. It receives scene payloads, returns normalized/solved results, and reports diagnostics. If unavailable, the plugin must show provider unavailable and continue with local capabilities only.

## LessonOS Integration

The plugin is a post-it with many functions, connected and connectable to LessonOS by declared capabilities.

Read path:

- `graph.query` lets the plugin inspect derived LessonOS graph context.
- Typical use: retrieve prior mistakes or concepts linked to the current experiment.

Write path:

- The plugin writes board embed state with `board.write`.
- Didactic observations go through host-approved `lesson.event.emit` events with evidence refs; the graph remains a derived view.
- Direct writes to the LessonOS event log are forbidden.

Evidence examples:

- `board:<embedId>`
- `manual:vol3:p54`
- `pack:io.elab.tutor:v3-cap6-esp4`
- `plugin:io.ardesia.simulation@2.0.0`

## `v3-cap6-esp4` Rule

`v3-cap6-esp4` is the target experiment: "Due LED che si alternano", Vol.3 pag.54.

Current status on `origin/main`:

- Lesson path exists at `packs/elab-tutor/data/lesson-paths/v3-cap6-esp4.json`.
- Legacy ELAB assets exist under `plugins/elab-tutor`.
- No verified `circuit-scene/2` fixture exists under `apps/studio/sim/fixtures`.

Therefore the first slice must encode:

```ts
{
  experimentId: "v3-cap6-esp4",
  status: "blocked",
  blocker: "missing verified SimulationScene/circuit-scene/2 fixture with authored geometry and manual evidence"
}
```

No adapter may synthesize a lesson-driving mounted scene for this experiment until the verified scene exists.

## RED Tests Required Before Implementation

### 1. Plugin identity and manifest

Create a failing test that expects:

- `io.ardesia.simulation` is the canonical plugin id.
- Manifest kind is `plugin`.
- Version is at least `2.0.0`.
- Contract range includes SDK `1.2.0`.
- Capabilities are exactly board read/write own embeds, graph query, lesson event emit, storage, ui.
- No `llm.generate` and no `net.fetch` in the first slice.

### 2. ELABTutor dependency boundary

Create a failing test that expects:

- `packs/elab-tutor/manifest.json` id is `io.elab.tutor`.
- Kind is `pack`.
- It declares dependency `io.ardesia.simulation >=2.0.0`.
- Pack files do not import solver, AVR bridge, renderer, or breadboard geometry implementation.

### 3. Canonical scene mode derivation

Create a failing test that expects:

- `deriveSimulationModes(scene)` returns mounted, step-by-step, and free assembly projections from one scene object.
- No projection duplicates component geometry as a separate source of truth.
- The final step state normalizes equal to mounted scene.

### 4. `v3-cap6-esp4` blocked until verified

Create a failing test that expects:

- The scene catalog does not return a synthesized mounted scene for `v3-cap6-esp4`.
- The returned status includes a blocker naming missing verified scene geometry/manual evidence.

### 5. Provider boundary

Create a failing test that expects:

- Local solver provider is available.
- FastAPI provider is optional and reports unavailable without fake results.
- Solver diagnostics are preserved in the UI-facing result.

## Implementation Slices

Slice A: contract and manifests.

- Add canonical Simulation Plugin manifest.
- Add or extend pack manifest schema for dependencies.
- Rename/alias canonical id to `io.ardesia.simulation` without breaking existing saved embeds.

Slice B: pure scene projection.

- Extract pure mode derivation from the current embeddable.
- Add normalized equality for final step vs mounted.
- Keep existing Vol.1 fixtures as technical harness only.

Slice C: ELABTutor dependency.

- Convert ELABTutor pack metadata to `io.elab.tutor`.
- Add boundary test preventing solver/render imports from pack code.
- Legacy debt accepted for this contract slice: `apps/studio/src/design/ElabLab.tsx`
  still imports `@elab-tutor-plugin/plugin/renderEmbeddable` and other
  `@elab-tutor-plugin/*` modules from the legacy ELAB integration path. That
  path is explicitly out of scope here; only the pack boundary under
  `packs/elab-tutor` is enforced in this slice.

Slice D: `v3-cap6-esp4` blocker.

- Register a blocked scene status for `v3-cap6-esp4`.
- Surface the blocker through provenance, not through fake geometry.

Slice E: provider hub adapter boundary.

- Define provider interface and local provider.
- Add FastAPI adapter as unavailable/no-op unless configured by host.

## Acceptance Criteria

- The simulator is describable as a standalone plugin with id `io.ardesia.simulation`.
- ELABTutor explicitly depends on the Simulation Plugin and cannot render or solve circuits directly.
- All supported modes derive from one canonical scene.
- `v3-cap6-esp4` is blocked honestly until verified scene data exists.
- LessonOS integration uses ToolHost capabilities and evidence refs.
- No new npm dependencies are introduced.
- No legacy demo/book-geometry shortcuts are reintroduced.
- Tests fail before implementation and pass after minimal implementation.

## Out of Scope

- Building a complete FastAPI provider service.
- Verifying the real `v3-cap6-esp4` scene geometry.
- Adding LLM generation to the Simulation Plugin.
- Marketplace publication.
- Migrating all ELAB experiments.
