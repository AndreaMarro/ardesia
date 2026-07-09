// @vitest-environment node

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  createBreadboardModel,
  editableWiresForScene,
  parseSimulationSnapRef,
  simulationSceneMultiBoardTopology,
  validateSimulationScene,
  type SimulationScene,
} from "../../sim/core/simulationScene"
import { fitSimulationViewportToScene } from "../../sim/core/simulationViewport"
import { solveWithProvider } from "../../sim/providers/simulationProviders"

function multiBoardScene(): SimulationScene {
  return {
    schemaVersion: "simulation-scene/2",
    id: "p6-multi-board-scene",
    title: "P+6 multi-board scene",
    domain: "electronics",
    breadboards: [
      createBreadboardModel("bb-left"),
      createBreadboardModel("bb-right"),
    ],
    components: [
      {
        id: "bb-left",
        type: "breadboard-half",
        pose: { x: 80, y: 80 },
      },
      {
        id: "bb-right",
        type: "breadboard-half",
        pose: { x: 860, y: 280 },
      },
      {
        id: "nano-a",
        type: "nano-r4",
        pose: { x: 420, y: 120 },
        pins: [{ id: "D13" }, { id: "GND" }],
      },
      {
        id: "nano-b",
        type: "nano-r4",
        pose: { x: 1180, y: 320 },
        pins: [{ id: "D13" }, { id: "GND" }],
      },
      {
        id: "led-left",
        type: "led",
        pose: { x: 240, y: 160 },
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
      {
        id: "led-right",
        type: "led",
        pose: { x: 1040, y: 360 },
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
    ],
    pinAssignments: {
      "nano-a:D13": "bb-left:j2",
      "nano-a:GND": "bb-left:bus-top-minus-1",
      "nano-b:D13": "bb-right:j2",
      "nano-b:GND": "bb-right:bus-top-minus-1",
      "led-left:anode": "bb-left:h2",
      "led-left:cathode": "bb-left:bus-bot-minus-2",
      "led-right:anode": "bb-right:h2",
      "led-right:cathode": "bb-right:bus-bot-minus-2",
    },
    wires: [
      {
        id: "wire-cross-positive",
        from: "nano-a:D13",
        to: "led-right:anode",
        color: "red",
        path: {
          kind: "polyline",
          points: [
            { x: 500, y: 180 },
            { x: 1040, y: 360 },
          ],
        },
      },
      {
        id: "wire-cross-ground",
        from: "bb-left:bus-top-minus-1",
        to: "bb-right:bus-top-minus-1",
        color: "black",
        path: {
          kind: "polyline",
          points: [
            { x: 140, y: 90 },
            { x: 900, y: 290 },
          ],
        },
      },
    ],
    provenance: {
      source: {
        kind: "manual-description",
        label: "P+6 multi-board fixture",
        status: "reviewed",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
}

describe("Simulation multi-board scene model", () => {
  it("keeps breadboard tie and rail nodes scoped per board", () => {
    const scene = multiBoardScene()
    const topology = simulationSceneMultiBoardTopology(scene)

    expect(topology.breadboards.map((board) => board.id)).toEqual([
      "bb-left",
      "bb-right",
    ])
    expect(parseSimulationSnapRef("bb-left:j2", scene)?.nodeId).toBe("bb-left:tie-top-2")
    expect(parseSimulationSnapRef("bb-right:j2", scene)?.nodeId).toBe("bb-right:tie-top-2")
    expect(parseSimulationSnapRef("bb-left:bus-top-minus-1", scene)?.nodeId).toBe(
      "bb-left:bus-top-minus",
    )
    expect(parseSimulationSnapRef("bb-right:bus-top-minus-1", scene)?.nodeId).toBe(
      "bb-right:bus-top-minus",
    )
    expect(topology.nodeIds).toContain("bb-left:tie-top-2")
    expect(topology.nodeIds).toContain("bb-right:tie-top-2")
    expect(new Set(topology.nodeIds).size).toBe(topology.nodeIds.length)
  })

  it("keeps Arduino-style board pins independent even with matching pin names", () => {
    const topology = simulationSceneMultiBoardTopology(multiBoardScene())

    expect(topology.controllerBoards).toEqual([
      {
        id: "nano-a",
        type: "nano-r4",
        pinNodeIds: ["nano-a:D13", "nano-a:GND"],
      },
      {
        id: "nano-b",
        type: "nano-r4",
        pinNodeIds: ["nano-b:D13", "nano-b:GND"],
      },
    ])
    expect(topology.componentPinNodeIds).toEqual(
      expect.arrayContaining(["nano-a:D13", "nano-b:D13"]),
    )
  })

  it("validates cross-board wire endpoints through semantic refs", () => {
    const scene = multiBoardScene()
    const report = validateSimulationScene(scene)
    const editable = editableWiresForScene(scene)

    expect(report).toEqual({ ok: true, issues: [], blockers: [] })
    expect(editable.find((wire) => wire.id === "wire-cross-positive")).toMatchObject({
      from: {
        kind: "component-pin",
        componentId: "nano-a",
        pinId: "D13",
        nodeId: "bb-left:tie-top-2",
        assignedRef: "bb-left:j2",
      },
      to: {
        kind: "component-pin",
        componentId: "led-right",
        pinId: "anode",
        nodeId: "bb-right:tie-top-2",
        assignedRef: "bb-right:h2",
      },
    })
    expect(editable.find((wire) => wire.id === "wire-cross-ground")).toMatchObject({
      from: { kind: "breadboard-rail", componentId: "bb-left", nodeId: "bb-left:bus-top-minus" },
      to: { kind: "breadboard-rail", componentId: "bb-right", nodeId: "bb-right:bus-top-minus" },
    })
  })

  it("blocks unsupported runtime boards without fake local provider output", () => {
    const result = solveWithProvider("local", {
      scene: {
        components: [
          { id: "nano-a", type: "nano-r4" },
          { id: "nano-b", type: "nano-r4" },
        ],
        connections: [{ from: "nano-a:D13", to: "nano-b:D13", color: "red" }],
        pinAssignments: {},
      },
      provider: "local",
      mode: "static",
    })

    expect(result.ok).toBe(false)
    expect(result.providerDiagnostics).toEqual([
      {
        code: "provider-physics-unsupported",
        severity: "blocker",
        message: "local provider cannot solve component nano-a of type nano-r4",
      },
      {
        code: "provider-physics-unsupported",
        severity: "blocker",
        message: "local provider cannot solve component nano-b of type nano-r4",
      },
    ])
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })

  it("keeps the P+5 viewport fit-to-content contract across multiple boards", () => {
    const viewport = fitSimulationViewportToScene({
      instanceId: "p6-multi-board-viewport",
      scene: multiBoardScene(),
      viewport: { width: 720, height: 420 },
      padding: 24,
    })

    expect(viewport.content.items.map((item) => [item.id, item.kind])).toEqual([
      ["bb-left", "breadboard"],
      ["bb-right", "breadboard"],
      ["nano-a", "controller-board"],
      ["nano-b", "controller-board"],
      ["led-left", "component"],
      ["led-right", "component"],
      ["wire-cross-positive", "wire-path"],
      ["wire-cross-ground", "wire-path"],
    ])
    expect(viewport.content.bounds.left).toBeLessThanOrEqual(56)
    expect(viewport.content.bounds.right).toBeGreaterThan(1320)
  })

  it("does not introduce mutable global state for multi-board scenes", () => {
    const sceneSource = readFileSync(join(process.cwd(), "sim", "core", "simulationScene.ts"), "utf8")
    const providerSource = readFileSync(join(process.cwd(), "sim", "providers", "simulationProviders.ts"), "utf8")

    expect(sceneSource).not.toMatch(/^\s*let\s+/m)
    expect(sceneSource).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(sceneSource).not.toMatch(/\bcurrent(Board|Scene|Instance)\b/)
    expect(providerSource).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
  })
})
