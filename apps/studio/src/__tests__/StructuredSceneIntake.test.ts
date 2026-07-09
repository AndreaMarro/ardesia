// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  createBreadboardModel,
  normalizeSimulationScene,
  parseSimulationSnapRef,
  pointForSimulationSnapRef,
  sceneReadiness,
  validateSimulationScene,
  type SimulationBreadboardModel,
  type SimulationScene,
} from "../../sim/core/simulationScene"
import { pointForBreadboardRef } from "../../sim/breadboard/simulationBreadboard"
import { structuredObservationToSimulationScene } from "../../sim/core/sourceIntake"

function pinNetlistScene(): SimulationScene {
  return {
    schemaVersion: "simulation-scene/2",
    id: "pin-netlist-contract",
    title: "Pin/netlist contract",
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
      "led1:cathode": "bb1:j5",
    },
    wires: [
      {
        id: "wire-ground",
        from: "led1:cathode",
        to: "bb1:bus-bot-minus-4",
        color: "black",
        path: {
          kind: "polyline",
          points: [
            { x: 120, y: 80 },
            { x: 140, y: 100 },
          ],
        },
      },
    ],
    provenance: {
      source: {
        kind: "manual-description",
        label: "pin/netlist contract",
        status: "reviewed",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
}

describe("structuredObservationToSimulationScene", () => {
  it("turns image-derived observations into the same SimulationScene contract", () => {
    const scene = structuredObservationToSimulationScene(
      {
        kind: "image-observation",
        label: "bench-photo-annotation",
        components: [
          { id: "breadboard1", type: "breadboard-half", x: 120, y: 130 },
          { id: "led1", type: "led", x: 420, y: 180, attrs: { color: "red" } },
        ],
        wires: [
          {
            from: "breadboard1:j4",
            to: "led1:A",
            color: "red",
            points: [
              { x: 148, y: 158 },
              { x: 420, y: 208 },
            ],
          },
        ],
      },
      { id: "image-led", title: "Image LED reconstruction" },
    )

    expect(scene.schemaVersion).toBe("simulation-scene/2")
    expect(scene.provenance.source.kind).toBe("image-observation")
    expect(sceneReadiness(scene)).toEqual({ ok: true, blockers: [] })
  })

  it("validates generic breadboard snaps, pin assignments, wire endpoints, and blockers", () => {
    const scene = structuredObservationToSimulationScene(
      {
        kind: "image-observation",
        label: "technical breadboard harness",
        components: [
          { id: "breadboard1", type: "breadboard-half", x: 120, y: 130 },
          { id: "led1", type: "led", x: 420, y: 180, attrs: { color: "red" } },
        ],
        wires: [
          {
            from: "breadboard1:j4",
            to: "led1:A",
            color: "red",
            points: [
              { x: 148, y: 158 },
              { x: 420, y: 208 },
            ],
          },
        ],
      },
      { id: "image-led", title: "Image LED reconstruction" },
    )

    const withPinAssignment: SimulationScene = {
      ...scene,
      pinAssignments: {
        "led1:A": "breadboard1:j4",
      },
    }

    expect(parseSimulationSnapRef("breadboard1:j4", withPinAssignment)).toEqual({
      kind: "terminal",
      boardId: "breadboard1",
      row: "j",
      column: 4,
      nodeId: "breadboard1:tie-top-4",
    })
    expect(validateSimulationScene(withPinAssignment)).toEqual({
      ok: true,
      issues: [],
      blockers: [],
    })

    const sharedBottomRail = pointForBreadboardRef("bb1:bus-bot-plus-9")
    const genericBottomRail = pointForSimulationSnapRef("breadboard1:bus-bot-plus-9", {
      ...withPinAssignment,
      components: [
        {
          id: "breadboard1",
          type: "breadboard-half",
          pose: { x: 0, y: 0 },
        },
      ],
    })
    expect(genericBottomRail).toMatchObject({
      kind: "rail",
      boardId: "breadboard1",
      rail: "bus-bot-plus",
      column: 9,
      nodeId: "breadboard1:bus-bot-plus",
    })
    expect(genericBottomRail).toMatchObject({
      x: sharedBottomRail?.x,
      y: sharedBottomRail?.y,
    })

    const invalidScene: SimulationScene = {
      ...withPinAssignment,
      pinAssignments: {
        "ghost:A": "breadboard1:j4",
      },
      wires: [
        {
          id: "wire-invalid",
          from: "breadboard1:z99",
          to: "led1:A",
          color: "red",
          path: {
            kind: "polyline",
            points: [
              { x: 148, y: 158 },
              { x: Number.NaN, y: 208 },
            ],
          },
        },
      ],
    }

    expect(validateSimulationScene(invalidScene).issues.map((issue) => issue.code)).toEqual([
      "unknown-pin-component",
      "invalid-wire-endpoint",
      "invalid-wire-path",
    ])
    expect(sceneReadiness(invalidScene).blockers).toEqual([
      "unknown-pin-component: ghost:A",
      "invalid-wire-endpoint: wire-invalid from breadboard1:z99",
      "invalid-wire-path: wire-invalid",
    ])
  })

  it("rejects malformed explicit breadboard models before snap rendering", () => {
    const malformedBoard = {
      ...createBreadboardModel("breadboard1"),
      terminalRows: ["j", "j", "z"],
      rails: ["bus-top-plus", "bus-side-plus"],
    } as unknown as SimulationBreadboardModel
    const scene: SimulationScene = {
      schemaVersion: "simulation-scene/2",
      id: "bad-board-model",
      title: "Bad board model",
      domain: "electronics",
      breadboards: [malformedBoard],
      components: [
        {
          id: "breadboard1",
          type: "breadboard-half",
          pose: { x: 0, y: 0 },
        },
      ],
      wires: [],
      provenance: {
        source: {
          kind: "manual-description",
          label: "bad board",
          status: "draft",
        },
      },
      adapters: { source: "manual-description", solver: ["local"] },
    }

    expect(validateSimulationScene(scene).issues.map((issue) => issue.code)).toEqual([
      "invalid-breadboard-model",
    ])
    expect(sceneReadiness(scene).blockers).toEqual([
      "invalid breadboard model: breadboard1",
    ])
  })

  it("turns description-derived observations into the same SimulationScene contract", () => {
    const scene = structuredObservationToSimulationScene(
      {
        kind: "manual-description",
        label: "teacher-description",
        components: [
          { id: "supply", type: "battery9v", x: 80, y: 120 },
          { id: "r1", type: "resistor", x: 240, y: 120, attrs: { value: 470 } },
        ],
        wires: [{ from: "supply:+", to: "r1:1", color: "red" }],
      },
      { id: "description-led", title: "Description LED reconstruction" },
    )

    expect(scene.provenance.source.kind).toBe("manual-description")
    expect(scene.adapters.source).toBe("manual-description")
    expect(sceneReadiness(scene).ok).toBe(true)
  })

  it("keeps incomplete observations blocked instead of inventing geometry", () => {
    const scene = structuredObservationToSimulationScene(
      {
        kind: "image-observation",
        label: "empty-photo",
        components: [],
        wires: [],
      },
      { id: "blocked-image", title: "Blocked image" },
    )

    expect(scene.provenance.source.status).toBe("blocked")
    expect(sceneReadiness(scene).blockers).toContain("no structured components extracted")
  })

  it("normalizes pin assignments and wire endpoints as the simulator-ready netlist", () => {
    const scene = pinNetlistScene()

    expect(validateSimulationScene(scene).ok).toBe(true)
    expect(normalizeSimulationScene(scene)).toEqual({
      components: ["bb1:breadboard-half", "led1:led"],
      pinAssignments: ["led1:anode->bb1:j4", "led1:cathode->bb1:j5"],
      wires: ["led1:cathode->bb1:bus-bot-minus-4"],
    })
  })

  it("ignores static-only geometry mutations while detecting pin and wire endpoint changes", () => {
    const scene = pinNetlistScene()
    const normalized = normalizeSimulationScene(scene)
    const poseOnly: SimulationScene = {
      ...scene,
      components: scene.components.map((component) =>
        component.id === "led1"
          ? { ...component, pose: { x: 999, y: 999, rotation: 45 } }
          : component,
      ),
      wires: scene.wires.map((wire) => ({
        ...wire,
        path: {
          kind: "polyline",
          points: [
            { x: 400, y: 400 },
            { x: 440, y: 440 },
          ],
        },
      })),
    }
    const reassignedPin: SimulationScene = {
      ...scene,
      pinAssignments: {
        ...scene.pinAssignments,
        "led1:anode": "bb1:j6",
      },
    }
    const rewiredEndpoint: SimulationScene = {
      ...scene,
      wires: scene.wires.map((wire) => ({
        ...wire,
        to: "bb1:bus-bot-minus-6",
      })),
    }

    expect(normalizeSimulationScene(poseOnly)).toEqual(normalized)
    expect(normalizeSimulationScene(reassignedPin)).not.toEqual(normalized)
    expect(normalizeSimulationScene(rewiredEndpoint)).not.toEqual(normalized)
    expect(validateSimulationScene(reassignedPin).ok).toBe(true)
    expect(validateSimulationScene(rewiredEndpoint).ok).toBe(true)
  })
})
