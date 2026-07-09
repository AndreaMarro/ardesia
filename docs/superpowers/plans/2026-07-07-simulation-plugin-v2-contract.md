# Simulation Plugin v2 Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refound the simulator as the autonomous ARDESIA board post-it plugin `io.ardesia.simulation`, with ELABTutor depending on it instead of owning render/solver logic.

**Architecture:** Implement the contract in small TDD slices: canonical plugin manifest, ELABTutor dependency boundary, pure scene-mode projection, honest `v3-cap6-esp4` blocker, and provider boundary. Keep all runtime behavior additive and fail-closed; do not move the current renderer until the contracts and tests are green.

**Tech Stack:** TypeScript 6, Vitest 4, existing ToolHost SDK 1.1.0, existing Zod manifest schema, existing ELAB `circuit-scene/2` fixtures, no new npm dependencies.

## Global Constraints

- Work in the isolated worktree `/Users/andreamarro/ardesia-wt/tutor-ux` on branch `docs/simulation-plugin-v2-contract-20260707` or a fresh branch from `origin/main`.
- Max 5 files per implementation cycle; each task below stays within that limit.
- No new npm dependencies.
- No fake/mock/demo data; existing test fixtures may be used only as technical harnesses and must not be claimed verified if they are not verified.
- Do not reintroduce `book-geometry/*.json`, `demo-mode.js`, `renderMode='clip_simplified'`, or `Wire mode='book'`.
- ELABTutor must not import `CircuitSolver`, `AVRBridge`, breadboard renderer, or simulator canvas code.
- `v3-cap6-esp4` must remain blocked until verified authored geometry and manual evidence exist.
- Every production-code task starts with a RED test and the failure must be observed before implementation.
- Before committing each task, run its focused test. Before final handoff, run `npm test` and `npm run build`.

---

## File Structure

- Create `apps/studio/plugins/simulation/manifest.ts`: canonical first-party Simulation Plugin manifest, validated with `defineManifest`.
- Create `apps/studio/src/__tests__/SimulationPluginManifest.test.ts`: plugin identity, version, contract, capability, and no-LLM/no-net gate.
- Modify `packs/elab-tutor/manifest.json`: promote pack metadata to `io.elab.tutor` and add dependency on `io.ardesia.simulation >=2.0.0`.
- Create `apps/studio/src/__tests__/ElabTutorPackBoundary.test.ts`: validates pack metadata and import boundary.
- Create `apps/studio/sim/simulationSceneModes.ts`: pure canonical scene projection, normalization, final-step equality helpers.
- Create `apps/studio/src/__tests__/SimulationSceneModes.test.ts`: verifies one scene source drives mounted, step-by-step, and free-assembly projections.
- Create `apps/studio/sim/elab/sceneCatalog.ts`: ELAB scene catalog lookup with honest blocked status for `v3-cap6-esp4`.
- Create `apps/studio/src/__tests__/ElabSceneCatalog.test.ts`: verifies no synthesized scene for `v3-cap6-esp4`.
- Create `apps/studio/sim/providers/simulationProviders.ts`: provider registry with local provider and unavailable FastAPI provider result.
- Create `apps/studio/src/__tests__/SimulationProviders.test.ts`: verifies provider availability and diagnostics.

## Task 1: Canonical Simulation Plugin Manifest

**Files:**
- Create: `apps/studio/plugins/simulation/manifest.ts`
- Create: `apps/studio/src/__tests__/SimulationPluginManifest.test.ts`

**Interfaces:**
- Consumes: `defineManifest`, `ToolManifest`, `ToolManifestSchema`, `CONTRACT_VERSION`, `protocolSatisfies` from `apps/studio/src/sdk/index.ts`.
- Produces: exported `manifest: ToolManifest` from `apps/studio/plugins/simulation/manifest.ts`.

- [ ] **Step 1: Write the failing test**

Create `apps/studio/src/__tests__/SimulationPluginManifest.test.ts`:

```ts
// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  CONTRACT_VERSION,
  ToolManifestSchema,
  protocolSatisfies,
} from "../sdk/index.ts"
import { manifest } from "../../plugins/simulation/manifest.ts"

function parseSemver(version: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`invalid semver: ${version}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function atLeast(version: string, floor: string): boolean {
  const actual = parseSemver(version)
  const required = parseSemver(floor)
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index]! > required[index]!) return true
    if (actual[index]! < required[index]!) return false
  }
  return true
}

describe("Simulation Plugin v2 manifest", () => {
  it("declares canonical autonomous plugin identity", () => {
    expect(ToolManifestSchema.safeParse(manifest).success).toBe(true)
    expect(manifest.id).toBe("io.ardesia.simulation")
    expect(manifest.kind).toBe("plugin")
    expect(atLeast(manifest.version, "2.0.0")).toBe(true)
    expect(manifest.surfaces).toEqual(["board-embed", "panel"])
  })

  it("requires the current SDK contract and least-privilege capabilities", () => {
    expect(manifest.contract).toBe(">=1.1 <2.0")
    expect(protocolSatisfies(CONTRACT_VERSION, manifest.contract ?? "")).toBe(true)
    expect(manifest.capabilities).toEqual({
      "board.read": {},
      "board.write": { scope: "own-embeds" },
      "graph.query": {},
      storage: { quotaMB: 16 },
      ui: {},
    })
    expect(manifest.capabilities["llm.generate"]).toBeUndefined()
    expect(manifest.capabilities["net.fetch"]).toBeUndefined()
    expect(manifest.privacy.dataOut).toBe("none")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationPluginManifest.test.ts
```

Expected: FAIL with module-not-found for `../../plugins/simulation/manifest.ts`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/studio/plugins/simulation/manifest.ts`:

```ts
import { defineManifest } from "../../src/sdk/index.ts"
import type { ToolManifest } from "../../src/sdk/index.ts"

export const manifest: ToolManifest = defineManifest({
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
    storage: { quotaMB: 16 },
    ui: {},
  },
  publisher: { id: "ardesia-core", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Simulatore ARDESIA",
      consentBlurb:
        "Mostra circuiti, strumenti e diagnostica nel proprio post-it e legge il grafo LessonOS in sola lettura.",
    },
  },
})
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationPluginManifest.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/plugins/simulation/manifest.ts apps/studio/src/__tests__/SimulationPluginManifest.test.ts
git commit -m "feat(simulation): add canonical plugin manifest"
```

## Task 2: ELABTutor Pack Dependency Boundary

**Files:**
- Modify: `packs/elab-tutor/manifest.json`
- Create: `apps/studio/src/__tests__/ElabTutorPackBoundary.test.ts`

**Interfaces:**
- Consumes: JSON manifest at `packs/elab-tutor/manifest.json`.
- Produces: pack manifest with `id: "io.elab.tutor"`, `kind: "pack"`, and `dependencies.plugins["io.ardesia.simulation"] = ">=2.0.0"`.

- [ ] **Step 1: Write the failing test**

Create `apps/studio/src/__tests__/ElabTutorPackBoundary.test.ts`:

```ts
// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const packRoot = path.join(repoRoot, "packs/elab-tutor")
const manifestPath = path.join(packRoot, "manifest.json")

type ElabTutorPackManifest = {
  kind?: string
  id?: string
  version?: string
  dependencies?: { plugins?: Record<string, string> }
}

function readManifest(): ElabTutorPackManifest {
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as ElabTutorPackManifest
}

function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full))
    else if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) out.push(full)
  }
  return out
}

describe("ELABTutor pack boundary", () => {
  it("declares itself as io.elab.tutor pack depending on Simulation Plugin v2", () => {
    const manifest = readManifest()
    expect(manifest.kind).toBe("pack")
    expect(manifest.id).toBe("io.elab.tutor")
    expect(manifest.version).toBe("0.1.0")
    expect(manifest.dependencies?.plugins?.["io.ardesia.simulation"]).toBe(">=2.0.0")
  })

  it("pack data does not import or embed solver/renderer implementation", () => {
    const forbidden = [
      "CircuitSolver",
      "AVRBridge",
      "ToolCanvasEmbeddable",
      "simulationBreadboard",
      "elabSolver",
      "SimulatorCanvas",
      "NewElabSimulator",
    ]
    const violations: string[] = []
    for (const file of walkFiles(packRoot)) {
      const source = fs.readFileSync(file, "utf-8")
      for (const token of forbidden) {
        if (source.includes(token)) {
          violations.push(`${path.relative(repoRoot, file)} contains ${token}`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/ElabTutorPackBoundary.test.ts
```

Expected: FAIL because manifest id is currently `elab-tutor-pack` and no dependency is declared.

- [ ] **Step 3: Write minimal implementation**

Modify `packs/elab-tutor/manifest.json` to this exact JSON shape, preserving existing contents under `contents`:

```json
{
  "kind": "pack",
  "id": "io.elab.tutor",
  "name": "ELABTutor Pack",
  "version": "0.1.0",
  "description": "Dati + metodo ELAB per ARDESIA: lesson-path, volume-references, build-steps, prompt UNLIM, 2 modalità. Solo dati e metodo: zero shell, zero auth, zero dashboard (CI gate zero-tolerance su packs/).",
  "dependencies": {
    "plugins": {
      "io.ardesia.simulation": ">=2.0.0"
    }
  },
  "contents": {
    "planned": [
      "build-steps",
      "unlim-prompts (metodo, non runtime AI)",
      "modes (Già-Montato / Passo-Passo / Montaggi-Liberi)"
    ],
    "migrated": [
      "data/lesson-paths/ (88 percorsi JSON + index.js, slice S1)",
      "data/volume-references.js (copertura 88/88 lesson-path, slice S2)",
      "data/volume-citation.js (sostanza citazione Vol.N pag.M, slice S3)"
    ]
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/ElabTutorPackBoundary.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packs/elab-tutor/manifest.json apps/studio/src/__tests__/ElabTutorPackBoundary.test.ts
git commit -m "feat(elab): declare simulation plugin dependency"
```

## Task 3: Canonical Scene Mode Projection

**Files:**
- Create: `apps/studio/sim/simulationSceneModes.ts`
- Create: `apps/studio/src/__tests__/SimulationSceneModes.test.ts`

**Interfaces:**
- Consumes: plain scene object compatible with current `SimulationSceneV1` shape from `ToolCanvasEmbeddable.tsx`.
- Produces:
  - `deriveSimulationModes(scene: SimulationSceneLike): DerivedSimulationModes`
  - `finalStepState(projection: SimulationModeProjection): SimulationSceneLike`
  - `normalizeScene(scene: SimulationSceneLike): NormalizedSimulationScene`

- [ ] **Step 1: Write the failing test**

Create `apps/studio/src/__tests__/SimulationSceneModes.test.ts`:

```ts
// @vitest-environment node

import { describe, expect, it } from "vitest"
import { createReferenceSimulationScene } from "../toolhost/ToolCanvasEmbeddable"
import {
  deriveSimulationModes,
  finalStepState,
  normalizeScene,
} from "../../sim/simulationSceneModes"

describe("SimulationScene mode derivation", () => {
  it("derives all modes from the same canonical scene object", () => {
    const scene = createReferenceSimulationScene()
    const modes = deriveSimulationModes(scene)

    expect(modes.mounted.mode).toBe("gia-montato")
    expect(modes.stepByStep.mode).toBe("passo-passo")
    expect(modes.freeAssembly.mode).toBe("monta-tu")
    expect(modes.mounted.scene).toBe(scene)
    expect(modes.stepByStep.scene).toBe(scene)
    expect(modes.freeAssembly.scene).toBe(scene)
    expect(modes.mounted.editable).toBe(false)
    expect(modes.stepByStep.editable).toBe(false)
    expect(modes.freeAssembly.editable).toBe(true)
  })

  it("final step state normalizes equal to mounted scene", () => {
    const scene = createReferenceSimulationScene()
    const modes = deriveSimulationModes(scene)
    expect(modes.stepByStep.steps.length).toBeGreaterThan(0)
    expect(normalizeScene(finalStepState(modes.stepByStep))).toEqual(
      normalizeScene(modes.mounted.scene),
    )
  })

  it("normalization strips UI-only/transient fields but preserves topology and provenance", () => {
    const scene = createReferenceSimulationScene()
    const noisy = {
      ...scene,
      selectedComponentId: "led1",
      hoverRef: "bb1:a1",
      localPanel: { tab: "diagnostics" },
      updatedAt: 123,
    }
    expect(normalizeScene(noisy)).toEqual(normalizeScene(scene))
    expect(normalizeScene(noisy).pinAssignments).toEqual(scene.pinAssignments)
    expect(normalizeScene(noisy).connections).toEqual(scene.connections)
    expect(normalizeScene(noisy).provenance).toEqual(scene.provenance)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationSceneModes.test.ts
```

Expected: FAIL with module-not-found for `../../sim/simulationSceneModes`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/studio/sim/simulationSceneModes.ts`:

```ts
export type SimulationMode = "gia-montato" | "passo-passo" | "monta-tu"

export type SimulationStepProjection = {
  id: string
  order: number
  reveals: {
    components: readonly string[]
    connections: readonly string[]
  }
  scene: SimulationSceneLike
}

export type SimulationModeProjection = {
  mode: SimulationMode
  scene: SimulationSceneLike
  editable: boolean
  steps: readonly SimulationStepProjection[]
}

export type DerivedSimulationModes = {
  mounted: SimulationModeProjection
  stepByStep: SimulationModeProjection
  freeAssembly: SimulationModeProjection
}

export type SimulationSceneLike = {
  experimentId?: string
  components?: readonly { id: string }[]
  connections?: readonly { from: string; to: string; color?: string; kind?: string; path?: unknown }[]
  pinAssignments?: Record<string, string>
  manual?: unknown
  provenance?: unknown
  [key: string]: unknown
}

export type NormalizedSimulationScene = {
  experimentId?: string
  components: readonly { id: string }[]
  connections: readonly { from: string; to: string; color?: string; kind?: string; path?: unknown }[]
  pinAssignments: Record<string, string>
  manual?: unknown
  provenance?: unknown
}

function canonicalSteps(scene: SimulationSceneLike): SimulationStepProjection[] {
  const components = [...(scene.components ?? [])].map((component) => component.id)
  const connections = [...(scene.connections ?? [])].map(
    (connection, index) => `${connection.from}->${connection.to}#${index + 1}`,
  )
  return [
    {
      id: `${scene.experimentId ?? "scene"}-final`,
      order: 1,
      reveals: { components, connections },
      scene,
    },
  ]
}

export function deriveSimulationModes(scene: SimulationSceneLike): DerivedSimulationModes {
  const steps = canonicalSteps(scene)
  return {
    mounted: { mode: "gia-montato", scene, editable: false, steps: [] },
    stepByStep: { mode: "passo-passo", scene, editable: false, steps },
    freeAssembly: { mode: "monta-tu", scene, editable: true, steps: [] },
  }
}

export function finalStepState(projection: SimulationModeProjection): SimulationSceneLike {
  const last = projection.steps.at(-1)
  return last?.scene ?? projection.scene
}

export function normalizeScene(scene: SimulationSceneLike): NormalizedSimulationScene {
  return {
    experimentId: scene.experimentId,
    components: [...(scene.components ?? [])],
    connections: [...(scene.connections ?? [])],
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
    manual: scene.manual,
    provenance: scene.provenance,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationSceneModes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/sim/simulationSceneModes.ts apps/studio/src/__tests__/SimulationSceneModes.test.ts
git commit -m "feat(simulation): derive modes from canonical scene"
```

## Task 4: Honest `v3-cap6-esp4` Scene Catalog Blocker

**Files:**
- Create: `apps/studio/sim/elab/sceneCatalog.ts`
- Create: `apps/studio/src/__tests__/ElabSceneCatalog.test.ts`

**Interfaces:**
- Produces:
  - `getElabSceneStatus(experimentId: string): ElabSceneStatus`
  - `ElabSceneStatus` discriminated union with `kind: "ready"` or `kind: "blocked"`.

- [ ] **Step 1: Write the failing test**

Create `apps/studio/src/__tests__/ElabSceneCatalog.test.ts`:

```ts
// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  getElabSceneStatus,
  V3_CAP6_ESP4_BLOCKER,
} from "../../sim/elab/sceneCatalog"

describe("ELAB scene catalog", () => {
  it("blocks v3-cap6-esp4 until verified authored geometry exists", () => {
    const status = getElabSceneStatus("v3-cap6-esp4")
    expect(status.kind).toBe("blocked")
    if (status.kind !== "blocked") throw new Error("expected blocked status")
    expect(status.experimentId).toBe("v3-cap6-esp4")
    expect(status.provenance).toEqual({
      experimentId: "v3-cap6-esp4",
      volume: 3,
      chapter: 6,
      page: 54,
      sourceManual: "Vol.3 pag.54 - ESERCIZIO 6.4",
      status: "blocked",
      blocker: V3_CAP6_ESP4_BLOCKER,
      checks: {
        electrical: "unknown",
        geometry: "unknown",
        bookMatch: "unknown",
        visualMatch: "unknown",
      },
    })
    expect(status.scene).toBeUndefined()
  })

  it("unknown experiments fail closed instead of borrowing another scene", () => {
    const status = getElabSceneStatus("v9-cap9-esp9")
    expect(status.kind).toBe("blocked")
    if (status.kind !== "blocked") throw new Error("expected blocked status")
    expect(status.blocker).toContain("no SimulationScene registered")
    expect(status.scene).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/ElabSceneCatalog.test.ts
```

Expected: FAIL with module-not-found for `../../sim/elab/sceneCatalog`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/studio/sim/elab/sceneCatalog.ts`:

```ts
export const V3_CAP6_ESP4_BLOCKER =
  "missing verified SimulationScene/circuit-scene/2 fixture with authored geometry and manual evidence"

export type SceneCheck = "pass" | "fail" | "unknown"

export type SceneProvenance = {
  experimentId: string
  volume: 1 | 2 | 3
  chapter: number
  page: number
  sourceManual: string
  status: "blocked" | "draft" | "candidate" | "reviewed" | "verified"
  blocker?: string
  checks: {
    electrical: SceneCheck
    geometry: SceneCheck
    bookMatch: SceneCheck
    visualMatch: SceneCheck
  }
}

export type BlockedElabSceneStatus = {
  kind: "blocked"
  experimentId: string
  blocker: string
  provenance: SceneProvenance
  scene?: undefined
}

export type ReadyElabSceneStatus = {
  kind: "ready"
  experimentId: string
  provenance: SceneProvenance
  scene: unknown
}

export type ElabSceneStatus = BlockedElabSceneStatus | ReadyElabSceneStatus

function blocked(
  experimentId: string,
  blocker: string,
  manual: { volume: 1 | 2 | 3; chapter: number; page: number; sourceManual: string },
): BlockedElabSceneStatus {
  return {
    kind: "blocked",
    experimentId,
    blocker,
    provenance: {
      experimentId,
      volume: manual.volume,
      chapter: manual.chapter,
      page: manual.page,
      sourceManual: manual.sourceManual,
      status: "blocked",
      blocker,
      checks: {
        electrical: "unknown",
        geometry: "unknown",
        bookMatch: "unknown",
        visualMatch: "unknown",
      },
    },
  }
}

export function getElabSceneStatus(experimentId: string): ElabSceneStatus {
  if (experimentId === "v3-cap6-esp4") {
    return blocked("v3-cap6-esp4", V3_CAP6_ESP4_BLOCKER, {
      volume: 3,
      chapter: 6,
      page: 54,
      sourceManual: "Vol.3 pag.54 - ESERCIZIO 6.4",
    })
  }

  return blocked(experimentId, `no SimulationScene registered for ${experimentId}`, {
    volume: 1,
    chapter: 0,
    page: 0,
    sourceManual: "unknown",
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/ElabSceneCatalog.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/sim/elab/sceneCatalog.ts apps/studio/src/__tests__/ElabSceneCatalog.test.ts
git commit -m "feat(elab): block unverified v3 cap6 esp4 scene"
```

## Task 5: Provider Boundary and Diagnostics

**Files:**
- Create: `apps/studio/sim/providers/simulationProviders.ts`
- Create: `apps/studio/src/__tests__/SimulationProviders.test.ts`

**Interfaces:**
- Produces:
  - `simulationProviders: Record<string, SimulationProvider>`
  - `providerStatus(id: "local" | "fastapi"): ProviderStatus`
  - `solveWithProvider(id: "local" | "fastapi", request: SolverRequest): SolverResult`

- [ ] **Step 1: Write the failing test**

Create `apps/studio/src/__tests__/SimulationProviders.test.ts`:

```ts
// @vitest-environment node

import { describe, expect, it } from "vitest"
import { createReferenceSimulationScene } from "../toolhost/ToolCanvasEmbeddable"
import {
  providerStatus,
  solveWithProvider,
} from "../../sim/providers/simulationProviders"

describe("Simulation provider boundary", () => {
  it("local provider is available and preserves diagnostics", () => {
    const status = providerStatus("local")
    expect(status).toEqual({ id: "local", available: true })

    const result = solveWithProvider("local", {
      scene: createReferenceSimulationScene(),
      provider: "local",
      mode: "static",
    })

    expect(result.ok).toBe(true)
    expect(result.provider).toBe("local")
    expect(result.diagnostics).toContain("local solver available")
    expect(result.componentStates.led1?.on).toBe(true)
    expect(result.currents.led1).toBeCloseTo(0.0153, 3)
    expect(Object.keys(result.voltages).length).toBeGreaterThan(0)
  })

  it("FastAPI provider is optional and unavailable without fake results", () => {
    const status = providerStatus("fastapi")
    expect(status.available).toBe(false)
    expect(status.reason).toBe("FastAPI provider hub not configured")

    const result = solveWithProvider("fastapi", {
      scene: createReferenceSimulationScene(),
      provider: "fastapi",
      mode: "static",
    })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe("fastapi")
    expect(result.diagnostics).toEqual(["FastAPI provider hub not configured"])
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationProviders.test.ts
```

Expected: FAIL with module-not-found for `../../sim/providers/simulationProviders`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/studio/sim/providers/simulationProviders.ts`:

```ts
import { solveElabExperiment } from "../solver/elabSolver"
import type { SolverExperiment } from "../solver/elabSolver"

export type ProviderId = "local" | "fastapi"

export type SceneForSolve = {
  components?: Array<{ id: string; type: string; value?: number; color?: string | null }>
  connections?: Array<{ from: string; to: string; color?: string }>
  pinAssignments?: Record<string, string>
}

export type SolverRequest = {
  scene: SceneForSolve
  provider: ProviderId
  mode: "static" | "run"
}

export type SolverResult = {
  ok: boolean
  provider: ProviderId
  diagnostics: string[]
  componentStates: Record<string, unknown>
  currents: Record<string, number>
  voltages: Record<string, number>
}

export type ProviderStatus =
  | { id: ProviderId; available: true }
  | { id: ProviderId; available: false; reason: string }

export type SimulationProvider = {
  id: ProviderId
  status: () => ProviderStatus
  solve: (request: SolverRequest) => SolverResult
}

function solverExperimentFromScene(scene: SceneForSolve): SolverExperiment {
  return {
    components: [...(scene.components ?? [])].map((component) => ({
      id: component.id,
      type: component.type,
      value: component.value,
      color: component.color,
    })),
    connections: [...(scene.connections ?? [])].map((connection) => ({
      from: connection.from,
      to: connection.to,
      color: connection.color,
    })),
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
  }
}

const localProvider: SimulationProvider = {
  id: "local",
  status: () => ({ id: "local", available: true }),
  solve: (request) => {
    const result = solveElabExperiment(solverExperimentFromScene(request.scene))
    return {
      ok: result.ok,
      provider: "local",
      diagnostics: [
        "local solver available",
        ...result.warnings,
        ...result.diagnostics.overloadWarnings.map((warning) => warning.message ?? warning.type ?? warning.compId),
      ],
      componentStates: result.componentStates,
      currents: result.currents,
      voltages: result.nodeVoltages,
    }
  },
}

const fastapiProvider: SimulationProvider = {
  id: "fastapi",
  status: () => ({
    id: "fastapi",
    available: false,
    reason: "FastAPI provider hub not configured",
  }),
  solve: () => ({
    ok: false,
    provider: "fastapi",
    diagnostics: ["FastAPI provider hub not configured"],
    componentStates: {},
    currents: {},
    voltages: {},
  }),
}

export const simulationProviders: Record<ProviderId, SimulationProvider> = {
  local: localProvider,
  fastapi: fastapiProvider,
}

export function providerStatus(id: ProviderId): ProviderStatus {
  return simulationProviders[id].status()
}

export function solveWithProvider(id: ProviderId, request: SolverRequest): SolverResult {
  return simulationProviders[id].solve(request)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationProviders.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/sim/providers/simulationProviders.ts apps/studio/src/__tests__/SimulationProviders.test.ts
git commit -m "feat(simulation): add provider diagnostics boundary"
```

## Final Verification

- [ ] **Step 1: Run focused simulation contract tests**

```bash
npm --prefix apps/studio test -- --run \
  src/__tests__/SimulationPluginManifest.test.ts \
  src/__tests__/ElabTutorPackBoundary.test.ts \
  src/__tests__/SimulationSceneModes.test.ts \
  src/__tests__/ElabSceneCatalog.test.ts \
  src/__tests__/SimulationProviders.test.ts
```

Expected: all five test files PASS.

- [ ] **Step 2: Run full test gate**

```bash
npm test
```

Expected: Python and Studio tests pass. Baseline before this plan was Python `2044 passed, 7 skipped`; Studio `1308 passed, 5 skipped`.

- [ ] **Step 3: Run build gate**

```bash
npm run build
```

Expected: build exits 0. Vite chunk-size warnings are acceptable if unchanged.

- [ ] **Step 4: Review diff before final commit or PR**

```bash
git status --short
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

Expected touched files for implementation: at most the files listed in this plan plus the committed spec/plan docs.

## Self-Review

Spec coverage:

- Plugin identity and manifest: Task 1.
- ELABTutor dependency and forbidden imports: Task 2.
- Canonical scene to modes and final-step equality: Task 3.
- `v3-cap6-esp4` honest blocker: Task 4.
- Provider boundary and diagnostics: Task 5.
- LessonOS connectivity: Task 1 capability `graph.query`; direct event-log writes remain out of scope.

Placeholder scan:

- No TBD/TODO/fill-in instructions.
- Every task has exact paths, test code, implementation code, command, expected failure, expected pass, and commit command.

Type consistency:

- `ProviderId`, `SolverRequest`, `SolverResult`, `SimulationModeProjection`, and `ElabSceneStatus` are defined in the same tasks that first use them.
- Import paths match existing Studio test conventions: tests under `apps/studio/src/__tests__` import `../../sim/...` and `../sdk/...`.
