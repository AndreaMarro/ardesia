// @vitest-environment node

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  applyPlacementEngineAdapterOperation,
  type PlacementEngineAdapterResult,
} from "../../sim/core/placementEngineAdapter"
import { placementSnapshotFromScene } from "../../sim/core/placementEngineContract"
import type { SimulationOperationEnvelope } from "../../sim/core/simulationOperations"
import { type SimulationScene } from "../../sim/core/simulationScene"

function basePlacementScene(): SimulationScene {
  return {
    schemaVersion: "simulation-scene/2",
    id: "p8-placement-scene",
    title: "P+8 placement scene",
    domain: "electronics",
    components: [
      {
        id: "bb1",
        type: "breadboard-half",
        label: "Breadboard",
        pose: { x: 0, y: 0 },
      },
      {
        id: "bat1",
        type: "battery9v",
        label: "Batteria 9V",
        pose: { x: -120, y: 40 },
        pins: [{ id: "positive" }, { id: "negative" }],
      },
    ],
    pinAssignments: {},
    wires: [
      { id: "wire-power", from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
      { id: "wire-ground", from: "bat1:negative", to: "bb1:bus-bot-minus-1", color: "black" },
    ],
    provenance: {
      source: {
        kind: "manual-description",
        label: "P+8 placement fixture",
        status: "reviewed",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
}

function envelope(
  id: string,
  operation: SimulationOperationEnvelope["operation"],
): SimulationOperationEnvelope {
  return {
    schema: "simulation-operation/1",
    id,
    actor: "manual",
    origin: "canvas",
    targetProvider: "local",
    providerMode: "static",
    operation,
  }
}

function applyOperation(
  scene: SimulationScene,
  operation: SimulationOperationEnvelope["operation"],
): PlacementEngineAdapterResult {
  return applyPlacementEngineAdapterOperation({
    scene,
    snapshot: placementSnapshotFromScene(scene),
    operationEnvelope: envelope("op-p8", operation),
  })
}

describe("PlacementEngine adapter proof-of-use", () => {
  it("creates structured resistor and LED placement patches from operation envelopes", () => {
    const scene = basePlacementScene()

    const resistor = applyOperation(scene, {
      kind: "place-component",
      component: {
        id: "r1",
        type: "resistor",
        label: "470 Ohm",
        attrs: { value: 470 },
        pins: [{ id: "pin1" }, { id: "pin2" }],
      },
      pose: { x: 120, y: 92, rotation: 0 },
      pinAssignments: {
        "r1:pin1": "bb1:j4",
        "r1:pin2": "bb1:j8",
      },
    })

    expect(resistor.ok).toBe(true)
    expect(resistor.patch.schema).toBe("simulation-placement-patch/1")
    expect(resistor.patch.components.map((component) => component.id)).toEqual([
      "bb1",
      "bat1",
      "r1",
    ])
    expect(resistor.patch.pinAssignments).toMatchObject({
      "r1:pin1": "bb1:j4",
      "r1:pin2": "bb1:j8",
    })
    expect(resistor.validationPipeline.map((step) => step.step)).toEqual([
      "validateSimulationScene",
      "analyzeBreadboardOccupancy",
      "analyzePinVocabulary",
      "activeSimulationProvider.solve",
    ])
    expect(resistor.providerResult?.provider).toBe("local")

    const sceneWithResistor = { ...scene, components: resistor.patch.components, pinAssignments: resistor.patch.pinAssignments }
    const led = applyOperation(sceneWithResistor, {
      kind: "place-component",
      component: {
        id: "led1",
        type: "led",
        label: "LED rosso",
        attrs: { color: "red" },
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
      pose: { x: 180, y: 92, rotation: 90 },
      pinAssignments: {
        "led1:anode": "bb1:j10",
        "led1:cathode": "bb1:j12",
      },
    })

    expect(led.ok).toBe(true)
    expect(led.patch.components.map((component) => component.id)).toEqual([
      "bb1",
      "bat1",
      "r1",
      "led1",
    ])
    expect(led.patch.components.find((component) => component.id === "led1")).toMatchObject({
      type: "led",
      pose: { x: 180, y: 92, rotation: 90 },
      pins: [{ id: "anode" }, { id: "cathode" }],
    })
  })

  it("refuses legacy AZIONE strings before producing any scene patch", () => {
    const scene = basePlacementScene()
    const result = applyPlacementEngineAdapterOperation({
      scene,
      snapshot: placementSnapshotFromScene(scene),
      operationEnvelope: "[AZIONE:addcomponent type=led id=led1]",
    })

    expect(result.ok).toBe(false)
    expect(result.patch.components.map((component) => component.id)).toEqual(["bb1", "bat1"])
    expect(result.diagnostics).toContain("legacy AZIONE strings are not valid placement operations")
    expect(result.providerResult).toBeNull()
  })

  it("refuses SVG-only or DOM-only drag mutations", () => {
    const scene = basePlacementScene()
    const result = applyPlacementEngineAdapterOperation({
      scene,
      snapshot: placementSnapshotFromScene(scene),
      operationEnvelope: envelope("op-dom-drag", {
        kind: "move-component",
        componentId: "led1",
        pose: { x: 220, y: 110 },
        domNode: "#led1",
        clientX: 220,
        svgTransform: "translate(220 110)",
      } as unknown as SimulationOperationEnvelope["operation"]),
    })

    expect(result.ok).toBe(false)
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        "operation payloads may not target DOM, canvas, or handler references",
        "SVG-only placement mutation is not a structured simulator operation",
      ]),
    )
    expect(result.providerResult).toBeNull()
  })

  it("deep-copies the input snapshot and scene before returning a patch", () => {
    const scene = basePlacementScene()
    const snapshot = placementSnapshotFromScene(scene)
    const result = applyPlacementEngineAdapterOperation({
      scene,
      snapshot,
      operationEnvelope: envelope("op-copy", {
        kind: "place-component",
        component: {
          id: "r1",
          type: "resistor",
          pins: [{ id: "pin1" }, { id: "pin2" }],
        },
        pose: { x: 120, y: 92 },
      }),
    })

    snapshot.components.push({ id: "mutated-snapshot", type: "led" })
    scene.components.push({ id: "mutated-scene", type: "led", pose: { x: 1, y: 1 } })

    expect(result.snapshot.components.map((component) => component.id)).toEqual(["bb1", "bat1"])
    expect(result.patch.components.map((component) => component.id)).toEqual(["bb1", "bat1", "r1"])
    expect(result.patch.components).not.toBe(scene.components)
    expect(result.patch.pinAssignments).not.toBe(scene.pinAssignments)
  })

  it("blocks invalid placement before provider solve but still reports each validator step", () => {
    const scene = basePlacementScene()
    const result = applyOperation(scene, {
      kind: "place-component",
      component: {
        id: "r1",
        type: "resistor",
        pins: [{ id: "pin1" }, { id: "pin2" }],
      },
      pose: { x: 120, y: 92 },
      pinAssignments: {
        "r1:pin1": "bb1:j4",
        "r1:pin2": "bb1:j4",
      },
    })

    expect(result.ok).toBe(false)
    expect(result.validationPipeline).toEqual([
      { step: "validateSimulationScene", ok: true },
      { step: "analyzeBreadboardOccupancy", ok: false },
      { step: "analyzePinVocabulary", ok: true },
      { step: "activeSimulationProvider.solve", ok: false, skipped: true },
    ])
    expect(result.diagnostics).toContain("occupancy conflict at bb1:j4: r1:pin1, r1:pin2")
    expect(result.providerResult).toBeNull()
  })

  it("deletes components together with dependent wires and pin assignments", () => {
    const placed = applyOperation(basePlacementScene(), {
      kind: "place-component",
      component: {
        id: "led1",
        type: "led",
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
      pose: { x: 180, y: 92 },
      pinAssignments: {
        "led1:anode": "bb1:j10",
        "led1:cathode": "bb1:j12",
      },
    })
    const sceneWithLed: SimulationScene = {
      ...basePlacementScene(),
      components: placed.patch.components,
      pinAssignments: placed.patch.pinAssignments,
      wires: [
        ...placed.patch.wires,
        { id: "wire-led-ground", from: "led1:cathode", to: "bat1:negative", color: "black" },
      ],
    }

    const result = applyOperation(sceneWithLed, {
      kind: "delete",
      target: { kind: "component", id: "led1" },
    })

    expect(result.ok).toBe(true)
    expect(result.patch.components.map((component) => component.id)).not.toContain("led1")
    expect(Object.keys(result.patch.pinAssignments)).not.toContain("led1:anode")
    expect(result.patch.wires.map((wire) => wire.id)).not.toContain("wire-led-ground")
  })

  it("applies structured wire editor operations through the placement adapter", () => {
    const scene: SimulationScene = {
      ...basePlacementScene(),
      wires: [
        ...basePlacementScene().wires,
        {
          id: "wire-editable",
          from: "bb1:j7",
          to: "bb1:f7",
          color: "green",
          path: {
            kind: "polyline",
            points: [
              { x: 17.75, y: 33.75 },
              { x: 30, y: 30 },
              { x: 17.75, y: 63.75 },
            ],
          },
        },
      ],
    }

    const moved = applyOperation(scene, {
      kind: "edit-wire",
      wireId: "wire-editable",
      edit: {
        kind: "move-waypoint",
        pointIndex: 1,
        point: { x: 48, y: 20 },
      },
    })
    expect(moved.ok).toBe(true)
    expect(moved.patch.wires.find((wire) => wire.id === "wire-editable")?.path?.points[1]).toEqual({
      x: 48,
      y: 20,
    })

    const splitPath = applyOperation(
      {
        ...scene,
        wires: moved.patch.wires,
      },
      {
        kind: "edit-wire",
        wireId: "wire-editable",
        edit: {
          kind: "replace-path",
          path: {
            kind: "polyline",
            points: [
              { x: 17.75, y: 33.75 },
              { x: 48, y: 20 },
              { x: 70, y: 42 },
              { x: 17.75, y: 63.75 },
            ],
          },
        },
      },
    )
    expect(splitPath.ok).toBe(true)
    expect(splitPath.patch.wires.find((wire) => wire.id === "wire-editable")?.path?.points).toEqual([
      { x: 17.75, y: 33.75 },
      { x: 48, y: 20 },
      { x: 70, y: 42 },
      { x: 17.75, y: 63.75 },
    ])

    const retargeted = applyOperation(
      {
        ...scene,
        wires: splitPath.patch.wires,
      },
      {
        kind: "edit-wire",
        wireId: "wire-editable",
        edit: {
          kind: "retarget-endpoint",
          side: "to",
          endpoint: "bb1:bus-top-plus-2",
        },
      },
    )
    expect(retargeted.ok).toBe(true)
    expect(retargeted.patch.wires.find((wire) => wire.id === "wire-editable")?.to).toBe(
      "bb1:bus-top-plus-2",
    )

    const rejected = applyOperation(scene, {
      kind: "edit-wire",
      wireId: "wire-editable",
      edit: {
        kind: "move-waypoint",
        pointIndex: 0,
        point: { x: 99, y: 99 },
      },
    })
    expect(rejected.ok).toBe(false)
    expect(rejected.diagnostics).toContain("locked-wire-anchor: wire-editable:0")
  })

  it("rejects unknown move, rotate, set-value, and delete targets", () => {
    const scene = basePlacementScene()

    expect(applyOperation(scene, {
      kind: "move-component",
      componentId: "missing-led",
      pose: { x: 1, y: 2 },
    }).diagnostics).toContain("unknown component target: missing-led")
    expect(applyOperation(scene, {
      kind: "rotate-component",
      componentId: "missing-led",
      rotation: 90,
    }).diagnostics).toContain("unknown component target: missing-led")
    expect(applyOperation(scene, {
      kind: "set-value",
      componentId: "missing-led",
      field: "color",
      value: "red",
    }).diagnostics).toContain("unknown component target: missing-led")
    expect(applyOperation(scene, {
      kind: "delete",
      target: { kind: "wire", id: "missing-wire" },
    }).diagnostics).toContain("unknown wire target: missing-wire")
  })

  it("keeps unsupported catalog/provider entries blocked without fake solve output", () => {
    const scene = basePlacementScene()
    const result = applyOperation(scene, {
      kind: "place-component",
      component: {
        id: "nano1",
        type: "nano-r4",
        pins: [{ id: "D13" }, { id: "GND" }, { id: "5V" }, { id: "A0" }],
      },
      pose: { x: 260, y: 70 },
    })

    expect(result.ok).toBe(false)
    expect(result.validationPipeline.at(-1)).toEqual({
      step: "activeSimulationProvider.solve",
      ok: false,
    })
    expect(result.providerResult?.providerDiagnostics).toEqual([
      {
        code: "provider-physics-unsupported",
        severity: "blocker",
        message: "local provider cannot solve component nano1 of type nano-r4",
      },
    ])
    expect(result.providerResult?.componentStates).toEqual({})
    expect(result.providerResult?.currents).toEqual({})
    expect(result.providerResult?.voltages).toEqual({})
  })

  it("keeps the adapter free of legacy runtime, DOM, and host switch statements", () => {
    const source = readFileSync(join(process.cwd(), "sim", "core", "placementEngineAdapter.ts"), "utf8")

    expect(source).not.toMatch(/\bfrom\s+["'][^"']*PlacementEngine\.js["']/)
    expect(source).not.toMatch(/\bdocument\b|\bwindow\b|querySelector|HTMLElement|SVGElement/)
    expect(source).not.toMatch(/\bswitch\s*\(/)
    expect(source).not.toMatch(/^\s*let\s+/m)
  })
})
