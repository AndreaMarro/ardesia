# Simulation Plugin v2

Status: design approved, implementation pending
Date: 2026-07-07
Primary slice: contract-first refoundation of the simulator as an autonomous ARDESIA plugin.

## Decision

The simulator becomes a reusable ARDESIA tool plugin mounted on the board as a post-it. ELABTutor becomes a pack/plugin consumer that supplies didactic content, manual references, lesson paths, common mistakes, and final-scene intent, but it does not own the electrical solver, breadboard renderer, scene geometry, or circuit UI.

The canonical identities are:

- Ardesia Host: owns board embeds, plugin lifecycle, install/enable/disable, capability grants, provenance, and LessonOS memory/event-log boundaries.
- Simulation Plugin: `io.ardesia.simulation`, kind `plugin`, version floor `2.0.0`, mounted as a board post-it with multiple functions and explicit capabilities.
- ELABTutor Pack: `io.elab.tutor`, kind `pack`, depends on `io.ardesia.simulation >=2.0.0`, owns only ELAB didactic data and method.

This continues the current `origin/main` direction: ToolHost SDK 1.1.0 already exposes a plugin contract and `graph.query`; the current simulator code still lives inside `ToolCanvasEmbeddable.tsx` and must be lifted behind a real plugin manifest and contract.

## Current State Audit

`origin/main` already contains useful foundations:

- ToolHost SDK boundary in `apps/studio/src/sdk/index.ts` with `CONTRACT_VERSION = "1.1.0"`.
- Capability vocabulary: `board.read`, `board.write`, `graph.query`, `graph.proposeClaims`, `storage`, `llm.generate`, `net.fetch`, `ui`.
- A real LessonOS read channel through `graph.query`, consumed by `apps/studio/plugins/ripasso`.
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

- First slice writes only board embed state with `board.write`.
- Didactic observations must go through host-approved producers and evidence refs.
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
- Contract range includes SDK `1.1.0`.
- Capabilities are exactly board read/write own embeds, graph query, storage, ui.
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
