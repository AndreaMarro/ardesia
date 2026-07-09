// @vitest-environment node

import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  PLACEMENT_ENGINE_ADAPTER_CONTRACT,
  placementSnapshotFromScene,
} from "../../sim/core/placementEngineContract"
import type { SimulationScene } from "../../sim/core/simulationScene"

function placementScene(): SimulationScene {
  return {
    schemaVersion: "simulation-scene/2",
    id: "placement-engine-contract",
    title: "Placement engine contract",
    domain: "electronics",
    components: [
      {
        id: "bb1",
        type: "breadboard-half",
        label: "Breadboard",
        pose: { x: 0, y: 0 },
      },
      {
        id: "led1",
        type: "led",
        label: "LED red",
        pose: { x: 120, y: 80, rotation: 90 },
        attrs: { color: "red" },
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
    ],
    pinAssignments: {
      "led1:anode": "bb1:j4",
      "led1:cathode": "bb1:a6",
    },
    wires: [
      {
        id: "wire-led-ground",
        from: "led1:cathode",
        to: "bb1:bus-bot-minus-5",
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
        label: "placement engine contract",
        status: "reviewed",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
}

describe("PlacementEngine adapter contract", () => {
  it("names the ELABTutor source engine without importing the legacy tag runtime", () => {
    const contract = PLACEMENT_ENGINE_ADAPTER_CONTRACT

    expect(contract.source.modulePath).toBe(
      "plugins/elab-tutor/src/components/simulator/engine/PlacementEngine.js",
    )
    expect(existsSync(join(process.cwd(), "../..", contract.source.modulePath))).toBe(true)
    expect(contract.source.entrypoints).toEqual([
      "validateIntent",
      "OccupancyMap",
      "placeComponent",
      "resolveAutoWiring",
      "resolvePlacement",
    ])
    expect(contract.extractionMode).toBe("adapter-first-no-runtime-import")
    expect(contract.forbiddenOutputFormats).toEqual([
      "legacy-azione-tags",
      "svg-only-pixel-mutations",
      "dom-only-drag-state",
    ])
  })

  it("projects a SimulationScene into the structured snapshot expected by the adapter", () => {
    const scene = placementScene()
    const snapshot = placementSnapshotFromScene(scene)

    expect(snapshot).toEqual({
      schema: "simulation-placement-snapshot/1",
      components: [
        { id: "bb1", type: "breadboard-half", label: "Breadboard" },
        {
          id: "led1",
          type: "led",
          label: "LED red",
          attrs: { color: "red" },
        },
      ],
      layout: {
        bb1: { x: 0, y: 0 },
        led1: { x: 120, y: 80, rotation: 90 },
      },
      pinAssignments: {
        "led1:anode": "bb1:j4",
        "led1:cathode": "bb1:a6",
      },
      connections: [
        {
          id: "wire-led-ground",
          from: "led1:cathode",
          to: "bb1:bus-bot-minus-5",
          color: "black",
        },
      ],
    })
    expect(snapshot.layout.led1).not.toBe(scene.components[1]?.pose)
    expect(snapshot.pinAssignments).not.toBe(scene.pinAssignments)
    expect(snapshot.connections[0]).not.toHaveProperty("waypoints")
  })

  it("requires structured patches and validation instead of legacy AZIONE strings", () => {
    const contract = PLACEMENT_ENGINE_ADAPTER_CONTRACT

    expect(contract.adapterResultFormat).toBe("structured-simulation-scene-patch")
    expect(contract.legacySourceFormats).toEqual(["[AZIONE:addcomponent]", "[AZIONE:addwire]"])
    expect(contract.requiredValidationPipeline).toEqual([
      "validateSimulationScene",
      "analyzeBreadboardOccupancy",
      "analyzePinVocabulary",
      "activeSimulationProvider.solve",
    ])
    expect(contract.allowedOperationKinds).toEqual([
      "place-component",
      "move-component",
      "rotate-component",
      "edit-wire",
      "delete",
      "set-value",
      "connect-wire",
    ])
  })
})
