// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  normalizeSimulationScene,
  sceneReadiness,
} from "../../sim/core/simulationScene"
import { wokwiDiagramToSimulationScene } from "../../sim/core/wokwiDiagramAdapter"
import { pointForBreadboardRef } from "../../sim/breadboard/simulationBreadboard"

const diagram = {
  version: 1,
  author: "technical fixture",
  editor: "wokwi",
  parts: [
    { id: "uno", type: "wokwi-arduino-uno", left: 40, top: 60 },
    { id: "led1", type: "wokwi-led", left: 280, top: 96, attrs: { color: "red" } },
    { id: "r1", type: "wokwi-resistor", left: 210, top: 110, attrs: { value: "220" } },
  ],
  connections: [
    ["uno:13", "r1:1", "green", ["v20", "h40", "*", "h-20"]],
    ["r1:2", "led1:A", "orange", []],
    ["led1:C", "uno:GND.1", "black", ["v40"]],
  ],
}

describe("wokwiDiagramToSimulationScene", () => {
  it("converts external diagram.json into the generic SimulationScene contract", () => {
    const scene = wokwiDiagramToSimulationScene(diagram, {
      id: "generic-uno-led",
      title: "Arduino LED technical harness",
    })

    expect(scene.schemaVersion).toBe("simulation-scene/2")
    expect(scene.domain).toBe("electronics")
    expect(scene.provenance.source.kind).toBe("wokwi-diagram-json")
    expect(scene.components.map((component) => component.id)).toEqual(["uno", "led1", "r1"])
    expect(scene.wires).toHaveLength(3)
    expect(scene.wires[0]?.path?.kind).toBe("orthogonal")
    expect(scene.adapters).toEqual({
      source: "wokwi-diagram-json",
      solver: ["local", "fastapi", "ngspice-wasm"],
    })
  })

  it("normalizes deterministically for mounted/step/free-assembly projections", () => {
    const scene = wokwiDiagramToSimulationScene(diagram, {
      id: "generic-uno-led",
      title: "Arduino LED technical harness",
    })

    expect(sceneReadiness(scene)).toEqual({ ok: true, blockers: [] })
    expect(normalizeSimulationScene(scene)).toEqual({
      components: ["led1:wokwi-led", "r1:wokwi-resistor", "uno:wokwi-arduino-uno"],
      wires: ["led1:C->uno:GND.1", "r1:2->led1:A", "uno:13->r1:1"],
    })
  })

  it("anchors breadboard endpoints to generic snap coordinates", () => {
    const scene = wokwiDiagramToSimulationScene(
      {
        version: 1,
        parts: [
          { id: "bb1", type: "wokwi-breadboard-half", left: 200, top: 300 },
          { id: "r1", type: "wokwi-resistor", left: 420, top: 220 },
        ],
        connections: [["bb1:j5", "r1:1", "green", []]],
      },
      {
        id: "breadboard-anchor",
        title: "Breadboard anchor harness",
      },
    )

    const j5 = pointForBreadboardRef("bb1:j5")
    expect(scene.wires[0]?.path?.points[0]).toEqual({
      x: 200 + (j5?.x ?? 0),
      y: 300 + (j5?.y ?? 0),
    })
  })
})
