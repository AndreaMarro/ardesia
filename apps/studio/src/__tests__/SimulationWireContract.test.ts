// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  editableWiresForScene,
  normalizeSimulationScene,
  validateSimulationScene,
  type SimulationScene,
} from "../../sim/core/simulationScene"

function wireScene(): SimulationScene {
  return {
    schemaVersion: "simulation-scene/2",
    id: "editable-wire-contract",
    title: "Editable wire contract",
    domain: "electronics",
    components: [
      {
        id: "bb1",
        type: "breadboard-half",
        pose: { x: 0, y: 0 },
      },
      {
        id: "led1",
        type: "led",
        pose: { x: 120, y: 80 },
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
    ],
    pinAssignments: {
      "led1:anode": "bb1:j4",
      "led1:cathode": "bb1:a6",
    },
    wires: [
      {
        id: "wire-tie",
        from: "bb1:j4",
        to: "bb1:f4",
        color: "green",
        path: {
          kind: "polyline",
          points: [
            { x: 17.75, y: 33.75 },
            { x: 30, y: 30 },
            { x: 30, y: 60 },
            { x: 17.75, y: 63.75 },
          ],
        },
      },
      {
        id: "wire-led-ground",
        from: "led1:cathode",
        to: "bb1:bus-bot-minus-5",
        color: "black",
      },
      {
        id: "wire-rail",
        from: "bb1:bus-top-plus-1",
        to: "bb1:bus-top-plus-9",
        color: "red",
        path: {
          kind: "orthogonal",
          sourceInstructions: ["h60"],
          points: [
            { x: 17.75, y: 21.25 },
            { x: 77.75, y: 21.25 },
          ],
        },
      },
    ],
    provenance: {
      source: {
        kind: "manual-description",
        label: "editable wire contract",
        status: "reviewed",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
}

describe("editableWiresForScene", () => {
  it("describes endpoints, colors, waypoints, locked anchors, and breadboard node semantics", () => {
    const scene = wireScene()

    expect(validateSimulationScene(scene).ok).toBe(true)
    const wires = editableWiresForScene(scene)

    expect(wires.map((wire) => wire.id)).toEqual([
      "wire-tie",
      "wire-led-ground",
      "wire-rail",
    ])
    expect(wires[0]).toMatchObject({
      id: "wire-tie",
      color: "green",
      pathKind: "polyline",
      from: {
        ref: "bb1:j4",
        kind: "breadboard-terminal",
        componentId: "bb1",
        pinId: "j4",
        nodeId: "bb1:tie-top-4",
      },
      to: {
        ref: "bb1:f4",
        kind: "breadboard-terminal",
        componentId: "bb1",
        pinId: "f4",
        nodeId: "bb1:tie-top-4",
      },
    })
    expect(wires[0]?.from.nodeId).toBe(wires[0]?.to.nodeId)
    expect(
      wires[0]?.pathPoints.map((point) => ({
        index: point.index,
        role: point.role,
        editable: point.editable,
      })),
    ).toEqual([
      { index: 0, role: "anchor", editable: false },
      { index: 1, role: "waypoint", editable: true },
      { index: 2, role: "waypoint", editable: true },
      { index: 3, role: "anchor", editable: false },
    ])
  })

  it("resolves component-pin endpoints through pinAssignments and rail refs through shared node ids", () => {
    const wires = editableWiresForScene(wireScene())

    expect(wires[1]).toMatchObject({
      id: "wire-led-ground",
      from: {
        ref: "led1:cathode",
        kind: "component-pin",
        componentId: "led1",
        pinId: "cathode",
        assignedRef: "bb1:a6",
        nodeId: "bb1:tie-bottom-6",
      },
      to: {
        ref: "bb1:bus-bot-minus-5",
        kind: "breadboard-rail",
        componentId: "bb1",
        pinId: "bus-bot-minus-5",
        nodeId: "bb1:bus-bot-minus",
      },
      pathPoints: [],
    })
    expect(wires[2]).toMatchObject({
      sourceInstructions: ["h60"],
      from: { nodeId: "bb1:bus-top-plus" },
      to: { nodeId: "bb1:bus-top-plus" },
    })
    expect(wires[2]?.from.nodeId).toBe(wires[2]?.to.nodeId)
  })

  it("keeps route-only edits out of netlist normalization while exposing them to the wire editor", () => {
    const scene = wireScene()
    const rerouted: SimulationScene = {
      ...scene,
      wires: scene.wires.map((wire) =>
        wire.id === "wire-tie"
          ? {
              ...wire,
              color: "blue",
              path: {
                kind: "polyline",
                points: [
                  { x: 17.75, y: 33.75 },
                  { x: 48, y: 20 },
                  { x: 17.75, y: 63.75 },
                ],
              },
            }
          : wire,
      ),
    }

    expect(normalizeSimulationScene(rerouted)).toEqual(normalizeSimulationScene(scene))
    expect(editableWiresForScene(rerouted)).not.toEqual(editableWiresForScene(scene))
    expect(editableWiresForScene(rerouted)[0]?.color).toBe("blue")
  })
})
