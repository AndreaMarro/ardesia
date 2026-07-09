// @vitest-environment node

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  SIMULATION_OPERATION_CONTRACT,
  SIMULATION_OPERATION_KINDS,
  operationPipelineFor,
  validateSimulationOperationEnvelope,
  type SimulationOperationEnvelope,
} from "../../sim/core/simulationOperations"

function envelopeFor(
  operation: SimulationOperationEnvelope["operation"],
  overrides: Partial<SimulationOperationEnvelope> = {},
): SimulationOperationEnvelope {
  return {
    schema: "simulation-operation/1",
    id: "op-test-1",
    actor: "ai",
    origin: "llm",
    targetProvider: "local",
    providerMode: "static",
    operation,
    ...overrides,
  }
}

describe("Simulation operation contract", () => {
  it("defines the finite AI/manual operation vocabulary", () => {
    expect(SIMULATION_OPERATION_KINDS).toEqual([
      "place-component",
      "move-component",
      "rotate-component",
      "connect-wire",
      "edit-wire",
      "delete",
      "set-value",
      "probe",
      "run",
      "stop",
    ])
    expect(SIMULATION_OPERATION_CONTRACT.operationKinds).toEqual(SIMULATION_OPERATION_KINDS)
    expect(SIMULATION_OPERATION_CONTRACT.manualAndAiSharePipeline).toBe(true)
    expect(SIMULATION_OPERATION_CONTRACT.forbiddenMutationTargets).toEqual([
      "dom-node",
      "canvas-pixel",
      "react-handler-ref",
      "window.__ELAB_API",
      "legacy-azione-tag",
    ])
    expect(SIMULATION_OPERATION_CONTRACT.requiredOutputs).toContain("instrument-readings")
  })

  it("routes every operation through scene validators and the active provider boundary", () => {
    for (const operationKind of SIMULATION_OPERATION_KINDS) {
      const pipeline = operationPipelineFor(operationKind)

      expect(pipeline).toEqual(SIMULATION_OPERATION_CONTRACT.requiredPipeline)
      expect(pipeline).toContain("validateSimulationScene")
      expect(pipeline).toContain("placementSnapshotFromScene")
      expect(pipeline).toContain("applyPlacementEngineAdapterOperation")
      expect(pipeline).toContain("analyzeBreadboardOccupancy")
      expect(pipeline).toContain("analyzePinVocabulary")
      expect(pipeline).toContain("providerCapabilityProfile")
      expect(pipeline).toContain("solveWithProvider")
      expect(pipeline).toContain("emit-diagnostics")
    }
  })

  it("accepts a structured AI placement operation without DOM authority", () => {
    const report = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "place-component",
        component: {
          id: "led2",
          type: "led",
          label: "LED red",
          attrs: { color: "red" },
          pins: [{ id: "anode" }, { id: "cathode" }],
        },
        pose: { x: 120, y: 80, rotation: 90 },
        pinAssignments: {
          "led2:anode": "bb1:j4",
          "led2:cathode": "bb1:a6",
        },
      }),
    )

    expect(report).toEqual({ ok: true, issues: [] })
  })

  it("accepts structured wire waypoint, path, and endpoint edits without pixel mutation authority", () => {
    const waypoint = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "edit-wire",
        wireId: "wire-led",
        edit: {
          kind: "move-waypoint",
          pointIndex: 1,
          point: { x: 120, y: 96 },
        },
      }),
    )
    const path = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "edit-wire",
        wireId: "wire-led",
        edit: {
          kind: "replace-path",
          path: {
            kind: "polyline",
            points: [
              { x: 90, y: 96 },
              { x: 120, y: 96 },
              { x: 120, y: 144 },
            ],
          },
        },
      }),
    )
    const endpoint = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "edit-wire",
        wireId: "wire-led",
        edit: {
          kind: "retarget-endpoint",
          side: "to",
          endpoint: "bb1:bus-top-plus-2",
        },
      }),
    )

    expect(waypoint).toEqual({ ok: true, issues: [] })
    expect(path).toEqual({ ok: true, issues: [] })
    expect(endpoint).toEqual({ ok: true, issues: [] })
  })

  it("rejects direct DOM or legacy AZIONE mutation attempts", () => {
    const report = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "move-component",
        componentId: "led1",
        pose: { x: 140, y: 84 },
        domNode: "#led1",
        clientX: 222,
        script: "[AZIONE:addwire]",
      } as unknown as SimulationOperationEnvelope["operation"]),
    )

    expect(report.ok).toBe(false)
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["dom-mutation-forbidden", "legacy-operation-format"]),
    )
    expect(report.issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(["operation.domNode", "operation.clientX", "operation.script"]),
    )
  })

  it("keeps probe, ammeter, logic-probe, run, and stop operations provider-bound", () => {
    const probe = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "probe",
        probeId: "v-led",
        instrumentId: "voltmeter",
        positiveRef: "led1:anode",
        negativeRef: "led1:cathode",
      }),
    )
    const ammeter = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "probe",
        probeId: "i-led",
        instrumentId: "ammeter",
        positiveRef: "led1",
        currentRef: "led1",
      }),
    )
    const logicProbe = validateSimulationOperationEnvelope(
      envelopeFor(
        {
          kind: "probe",
          probeId: "logic-d13",
          instrumentId: "logic-probe",
          positiveRef: "nano1:D13",
        },
        { providerMode: "run" },
      ),
    )
    const run = validateSimulationOperationEnvelope(
      envelopeFor(
        {
          kind: "run",
          boardId: "arduino-uno-atmega328p",
          sketchRef: "sketches/blink.hex",
        },
        { providerMode: "run" },
      ),
    )
    const serialMonitor = validateSimulationOperationEnvelope(
      envelopeFor(
        {
          kind: "run",
          instrumentId: "serial-monitor",
          boardId: "arduino-uno-atmega328p",
          sketchRef: "sketches/blink.hex",
        },
        { providerMode: "run" },
      ),
    )
    const oscilloscope = validateSimulationOperationEnvelope(
      envelopeFor(
        {
          kind: "run",
          instrumentId: "oscilloscope",
        },
        {
          targetProvider: "ngspice-wasm",
          providerMode: "run",
        },
      ),
    )
    const stop = validateSimulationOperationEnvelope(envelopeFor({ kind: "stop" }))

    expect(probe.ok).toBe(true)
    expect(ammeter.ok).toBe(true)
    expect(logicProbe.ok).toBe(true)
    expect(run.ok).toBe(true)
    expect(serialMonitor.ok).toBe(true)
    expect(oscilloscope.ok).toBe(true)
    expect(stop.ok).toBe(true)
    expect(operationPipelineFor("probe")).toContain("solveWithProvider")
    expect(operationPipelineFor("run")).toContain("providerCapabilityProfile")
    expect(operationPipelineFor("stop")).toContain("solveWithProvider")
  })

  it("rejects unknown runtime board ids on run operations", () => {
    const report = validateSimulationOperationEnvelope(
      envelopeFor(
        {
          kind: "run",
          boardId: "arduino-nano-r4-atmega328p",
        } as unknown as SimulationOperationEnvelope["operation"],
        { providerMode: "run" },
      ),
    )

    expect(report).toEqual({
      ok: false,
      issues: [
        {
          code: "invalid-operation-payload",
          path: "operation.boardId",
          message: "run boardId is not supported",
        },
      ],
    })
  })

  it("rejects unknown probe instrument ids", () => {
    const report = validateSimulationOperationEnvelope(
      envelopeFor({
        kind: "probe",
        probeId: "v-led",
        instrumentId: "scope",
        positiveRef: "led1:anode",
        negativeRef: "led1:cathode",
      } as unknown as SimulationOperationEnvelope["operation"]),
    )

    expect(report).toEqual({
      ok: false,
      issues: [
        {
          code: "invalid-operation-payload",
          path: "operation.instrumentId",
          message: "probe instrumentId must be ammeter, logic-probe, probe, or voltmeter",
        },
      ],
    })
  })

  it("rejects unknown run instrument ids", () => {
    const report = validateSimulationOperationEnvelope(
      envelopeFor(
        {
          kind: "run",
          instrumentId: "logic-analyzer",
          boardId: "arduino-uno-atmega328p",
        } as unknown as SimulationOperationEnvelope["operation"],
        { providerMode: "run" },
      ),
    )

    expect(report).toEqual({
      ok: false,
      issues: [
        {
          code: "invalid-operation-payload",
          path: "operation.instrumentId",
          message:
            "run instrumentId must be custom-chip, oscilloscope, serial-monitor, serial-plotter, or spice-transient",
        },
      ],
    })
  })

  it("keeps the operation contract free of React and browser runtime imports", () => {
    const source = readFileSync(join(process.cwd(), "sim/core/simulationOperations.ts"), "utf8")

    expect(source).not.toMatch(/\bReact\b|HTMLElement|document\.|querySelector|addEventListener/)
    expect(SIMULATION_OPERATION_CONTRACT.forbiddenMutationTargets).toContain("window.__ELAB_API")
  })
})
