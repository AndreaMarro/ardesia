// @vitest-environment node

import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

import { describe, expect, it } from "vitest"

import {
  SIMULATION_RUNTIME_CAPABILITIES,
  SIMULATION_RUNTIME_PLUGIN_ID,
  applySimulationRuntimeOperation,
  describeSimulationRuntimeApi,
  loadSimulationRuntimeScene,
  readSimulationRuntimeDiagnostics,
  restoreSimulationRuntimeState,
  serializeSimulationRuntimeState,
  solveSimulationRuntimeProvider,
  type SimulationRuntimeSerializedState,
} from "../../sim/core/simulationRuntime"
import type { SimulationOperationEnvelope } from "../../sim/core/simulationOperations"
import type { SceneForSolve } from "../../sim/providers/simulationProviders"
import {
  derivePluginFunctionSurface,
  type PluginFunctionDescriptor,
} from "../toolhost/pluginFunctions"
import { createPluginPostitObject } from "../toolhost/postitObject"

type SourceFile = {
  path: string
  text: string
}

const runtimeScene: SceneForSolve = {
  components: [
    { id: "bb1", type: "breadboard-half" },
    { id: "battery1", type: "battery9v", value: 9, pins: [{ id: "positive" }, { id: "negative" }] },
    { id: "r1", type: "resistor", value: 1000, pins: [{ id: "pin1" }, { id: "pin2" }] },
    { id: "led1", type: "led", color: "red", pins: [{ id: "anode" }, { id: "cathode" }] },
  ],
  connections: [
    { from: "battery1:positive", to: "bb1:bus-top-plus-1", color: "red" },
    { from: "bb1:bus-top-plus-9", to: "r1:pin1", color: "red" },
    { from: "r1:pin2", to: "led1:anode", color: "red" },
    { from: "led1:cathode", to: "battery1:negative", color: "black" },
  ],
  pinAssignments: {
    "r1:pin1": "bb1:j4",
    "r1:pin2": "bb1:j8",
    "led1:anode": "bb1:j10",
    "led1:cathode": "bb1:j12",
  },
  layout: {
    bb1: { x: 0, y: 0 },
    battery1: { x: -120, y: 40 },
    r1: { x: 120, y: 92 },
    led1: { x: 180, y: 92, rotation: 90 },
  },
}

const moveLedOperation: SimulationOperationEnvelope = {
  schema: "simulation-operation/1",
  id: "op-move-led1",
  actor: "ai",
  origin: "llm",
  targetProvider: "local",
  providerMode: "static",
  operation: {
    kind: "move-component",
    componentId: "led1",
    pose: { x: 128, y: 64, rotation: 90 },
  },
}

function filesUnder(root: string): SourceFile[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(root, entry.name)
    if (entry.isDirectory()) return filesUnder(entryPath)
    if (!entry.isFile()) return []
    return [{ path: entryPath, text: readFileSync(entryPath, "utf8") }]
  })
}

function matchingFiles(files: SourceFile[], pattern: RegExp): string[] {
  return files
    .filter((file) => pattern.test(file.text))
    .map((file) => relative(process.cwd(), file.path))
}

describe("Single Simulation Runtime API contract", () => {
  it("exposes load, operation, provider, diagnostics, and serialization contracts", () => {
    const api = describeSimulationRuntimeApi()

    expect(SIMULATION_RUNTIME_PLUGIN_ID).toBe("io.ardesia.simulation")
    expect(api).toMatchObject({
      pluginId: "io.ardesia.simulation",
      apiVersion: "simulation-runtime/1",
      stateSchema: "simulation-runtime-state/1",
      operationEnvelopeSchema: "simulation-operation/1",
      providerRequestSchema: "simulation-provider-request/1",
      methods: {
        loadScene: "loadSimulationRuntimeScene",
        applyOperation: "applySimulationRuntimeOperation",
        solveProvider: "solveSimulationRuntimeProvider",
        readDiagnostics: "readSimulationRuntimeDiagnostics",
        serializeState: "serializeSimulationRuntimeState",
      },
    })
    expect(api.capabilities).toEqual(SIMULATION_RUNTIME_CAPABILITIES)
    expect(api.capabilities).toEqual([
      "load-scene",
      "apply-operation",
      "solve-provider",
      "read-diagnostics",
      "serialize-state",
    ])

    const loaded = loadSimulationRuntimeScene({
      instanceId: "sim-runtime-a",
      scene: runtimeScene,
      diagnostics: ["scene loaded from consumer request"],
    })
    expect(loaded).toMatchObject({
      schema: "simulation-runtime-state/1",
      instanceId: "sim-runtime-a",
      pluginId: "io.ardesia.simulation",
      diagnostics: ["scene loaded from consumer request"],
      appliedOperations: [],
    })

    const applied = applySimulationRuntimeOperation(loaded, moveLedOperation)
    expect(applied.instanceId).toBe("sim-runtime-a")
    expect(applied.report).toEqual({ ok: true, issues: [] })
    expect(applied.state.appliedOperations.map((operation) => operation.id)).toEqual([
      "op-move-led1",
    ])
    expect(applied.placement?.validationPipeline.map((step) => step.step)).toEqual([
      "validateSimulationScene",
      "analyzeBreadboardOccupancy",
      "analyzePinVocabulary",
      "activeSimulationProvider.solve",
    ])
    expect(applied.state.lastPlacementResult?.ok).toBe(true)
    expect(loaded.appliedOperations).toEqual([])

    const solved = solveSimulationRuntimeProvider(applied.state, {
      provider: "fastapi",
      mode: "static",
    })
    expect(solved.instanceId).toBe("sim-runtime-a")
    expect(solved.result).toMatchObject({
      ok: false,
      provider: "fastapi",
    })
    expect(solved.state.lastSolverResult?.providerDiagnostics).toEqual([
      {
        code: "provider-unavailable",
        severity: "blocker",
        message: "FastAPI provider hub not configured",
      },
    ])

    const diagnostics = readSimulationRuntimeDiagnostics(solved.state)
    expect(diagnostics).toMatchObject({
      instanceId: "sim-runtime-a",
      provider: "fastapi",
    })
    expect(diagnostics.messages).toEqual(
      expect.arrayContaining(["FastAPI provider hub not configured"]),
    )
    expect(diagnostics.placementPipeline.map((step) => step.step)).toEqual([
      "validateSimulationScene",
      "analyzeBreadboardOccupancy",
      "analyzePinVocabulary",
      "activeSimulationProvider.solve",
    ])

    const serialized = serializeSimulationRuntimeState(solved.state)
    expect(serialized.schema).toBe("simulation-runtime-state/1")
    expect(serialized.instanceId).toBe("sim-runtime-a")

    const serializedCopy: SimulationRuntimeSerializedState = JSON.parse(
      JSON.stringify(serialized),
    )
    serializedCopy.scene.components?.push({ id: "mutated", type: "led" })
    expect(solved.state.scene.components?.map((component) => component.id)).not.toContain(
      "mutated",
    )

    expect(restoreSimulationRuntimeState(serialized)).toEqual(solved.state)
  })

  it("records provider-bound probe readings in diagnostics and serialized state", () => {
    const loaded = loadSimulationRuntimeScene({
      instanceId: "sim-runtime-probe",
      scene: runtimeScene,
    })
    const solved = solveSimulationRuntimeProvider(loaded, {
      provider: "local",
      mode: "static",
    })
    const voltageEntries = Object.entries(solved.result.voltages).sort(
      ([, left], [, right]) => left - right,
    )
    expect(voltageEntries.length).toBeGreaterThanOrEqual(2)

    const [negativeRef] = voltageEntries[0]!
    const [positiveRef] = voltageEntries.at(-1)!
    const probed = applySimulationRuntimeOperation(solved.state, {
      schema: "simulation-operation/1",
      id: "op-probe-supply",
      actor: "ai",
      origin: "llm",
      targetProvider: "local",
      providerMode: "static",
      operation: {
        kind: "probe",
        probeId: "runtime-meter",
        instrumentId: "voltmeter",
        positiveRef,
        negativeRef,
      },
    })

    expect(probed.instrument?.ok).toBe(true)
    expect(probed.state.lastInstrumentResult?.readings[0]).toMatchObject({
      kind: "voltage",
      probeId: "runtime-meter",
      positiveRef,
      negativeRef,
    })
    const diagnostics = readSimulationRuntimeDiagnostics(probed.state)
    expect(diagnostics.instrumentDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "instrument-provider-bound",
      "instrument-reading-available",
    ])
    expect(diagnostics.instrumentReadings).toEqual(
      probed.state.lastInstrumentResult?.readings,
    )

    const serialized = serializeSimulationRuntimeState(probed.state)
    expect(restoreSimulationRuntimeState(serialized).lastInstrumentResult).toEqual(
      probed.state.lastInstrumentResult,
    )

    const currentProbed = applySimulationRuntimeOperation(probed.state, {
      schema: "simulation-operation/1",
      id: "op-probe-led-current",
      actor: "ai",
      origin: "llm",
      targetProvider: "local",
      providerMode: "static",
      operation: {
        kind: "probe",
        probeId: "runtime-ammeter",
        instrumentId: "ammeter",
        positiveRef: "led1",
        currentRef: "led1",
      },
    })

    expect(currentProbed.instrument?.ok).toBe(true)
    expect(currentProbed.state.lastInstrumentResult?.readings[0]).toMatchObject({
      kind: "current",
      probeId: "runtime-ammeter",
      currentRef: "led1",
    })
    const restoredCurrentProbe = restoreSimulationRuntimeState(
      serializeSimulationRuntimeState(currentProbed.state),
    )
    expect(restoredCurrentProbe.lastInstrumentResult).toEqual(
      currentProbed.state.lastInstrumentResult,
    )
  })

  it("records provider-bound run instrument blockers without fake runtime traces", () => {
    const loaded = loadSimulationRuntimeScene({
      instanceId: "sim-runtime-run-instrument",
      scene: runtimeScene,
    })

    const serialMonitor = applySimulationRuntimeOperation(loaded, {
      schema: "simulation-operation/1",
      id: "op-run-serial-monitor",
      actor: "ai",
      origin: "llm",
      targetProvider: "local",
      providerMode: "run",
      operation: {
        kind: "run",
        instrumentId: "serial-monitor",
        boardId: "arduino-uno-atmega328p",
        sketchRef: "sketches/blink.hex",
      },
    })

    expect(serialMonitor.report).toEqual({ ok: true, issues: [] })
    expect(serialMonitor.state.appliedOperations.map((operation) => operation.id)).toEqual([
      "op-run-serial-monitor",
    ])
    expect(serialMonitor.instrument).toMatchObject({
      ok: false,
      readings: [],
    })
    expect(serialMonitor.instrument?.diagnostics[0]).toMatchObject({
      code: "instrument-provider-unsupported",
      providerId: "local",
      providerMode: "run",
      physics: "runtime-microcontroller",
      message: "serial-monitor requires run runtime-microcontroller provider support",
    })
    expect(readSimulationRuntimeDiagnostics(serialMonitor.state).instrumentDiagnostics).toEqual(
      serialMonitor.instrument?.diagnostics,
    )
    const restored = restoreSimulationRuntimeState(
      serializeSimulationRuntimeState(serialMonitor.state),
    )
    expect(restored.lastInstrumentResult).toEqual(serialMonitor.state.lastInstrumentResult)
  })

  it("keeps two runtime instances independent without a shared mutable registry", () => {
    const first = loadSimulationRuntimeScene({
      instanceId: "sim-runtime-first",
      scene: runtimeScene,
    })
    const second = loadSimulationRuntimeScene({
      instanceId: "sim-runtime-second",
      scene: {
        components: [{ id: "led2", type: "led", color: "green" }],
        connections: [],
        pinAssignments: { "led2:anode": "bb2:a1" },
      },
    })

    const firstSolved = solveSimulationRuntimeProvider(first, {
      provider: "fastapi",
      mode: "static",
    })
    const secondApplied = applySimulationRuntimeOperation(second, {
      ...moveLedOperation,
      id: "op-second-stop",
      operation: { kind: "stop", reason: "consumer switched lesson" },
    })

    expect(firstSolved.state.instanceId).toBe("sim-runtime-first")
    expect(secondApplied.state.instanceId).toBe("sim-runtime-second")
    expect(firstSolved.state.appliedOperations).toEqual([])
    expect(secondApplied.state.appliedOperations.map((operation) => operation.id)).toEqual([
      "op-second-stop",
    ])
    expect(readSimulationRuntimeDiagnostics(firstSolved.state).provider).toBe("fastapi")
    expect(readSimulationRuntimeDiagnostics(secondApplied.state).provider).toBe("local")
    expect(readSimulationRuntimeDiagnostics(secondApplied.state).messages).toContain(
      "local solver available",
    )
  })

  it("keeps ELABTutor as a consumer of the shared simulation runtime", () => {
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "..", "..", "packs", "elab-tutor", "manifest.json"), "utf8"),
    ) as { dependencies?: { plugins?: Record<string, string> } }
    const elabTutorFunctions: PluginFunctionDescriptor[] = [
      {
        id: "simulatore",
        label: "Simulatore",
        priority: 10,
        dependencies: {
          pluginIds: [SIMULATION_RUNTIME_PLUGIN_ID],
          forbiddenImports: [
            "CircuitSolver",
            "SimulatorCanvas",
            "Breadboard",
            "PlacementEngine",
            "WireRenderer",
          ],
        },
        surfaces: {
          compact: { label: "Sim", role: "contextual" },
          normal: { label: "Simulatore", role: "primary" },
          expanded: { label: "Simulatore condiviso", role: "workspace" },
        },
      },
    ]

    const surface = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "elab-runtime-consumer",
        pluginId: "io.elab.tutor",
        bounds: { x: 0, y: 0, width: 760, height: 520 },
        zIndex: 1,
        selected: true,
        pluginState: {},
      }),
      elabTutorFunctions,
    )

    expect(manifest.dependencies?.plugins?.[SIMULATION_RUNTIME_PLUGIN_ID]).toBe(">=2.0.0")
    expect(surface.functions).toEqual([
      { id: "simulatore", label: "Simulatore", role: "primary", priority: 10 },
    ])
    expect(elabTutorFunctions[0]?.dependencies?.pluginIds).toEqual([
      "io.ardesia.simulation",
    ])
  })

  it("rejects pack imports of simulator internals and host imports of forked simulator UI", () => {
    const packFiles = filesUnder(join(process.cwd(), "..", "..", "packs", "elab-tutor"))
    const srcFiles = filesUnder(join(process.cwd(), "src"))

    expect(
      matchingFiles(
        packFiles,
        /\b(?:from\s+|import\s*\(\s*|require\s*\(\s*)["'][^"']*(?:apps\/studio\/sim|sim\/solver|sim\/providers|components\/simulator|CircuitSolver|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer)[^"']*["']/,
      ),
    ).toEqual([])
    expect(
      matchingFiles(
        srcFiles,
        /\b(?:from\s+|import\s*\(\s*|require\s*\(\s*)["'][^"']*plugins\/elab-tutor\/src\/components\/simulator\/[^"']*["']/,
      ),
    ).toEqual([])
  })

  it("keeps the public runtime API free of solver, canvas, DOM, and singleton state", () => {
    const source = readFileSync(join(process.cwd(), "sim", "core", "simulationRuntime.ts"), "utf8")

    expect(source).not.toMatch(
      /CircuitSolver|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|plugins\/elab-tutor/,
    )
    expect(source).not.toMatch(/(?:^|["'])\.\.?\/solver|sim\/solver/)
    expect(source).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(source).not.toMatch(/^\s*let\s+/m)
    expect(source).not.toMatch(/new\s+(?:Map|WeakMap|Set|WeakSet)\b/)
    expect(source).not.toMatch(/\bcurrent(Runtime|Instance|Provider|Scene)\b/)
  })
})
