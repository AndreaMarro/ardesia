// @vitest-environment node

import { describe, expect, it } from "vitest"
import { sceneReadiness } from "../../sim/core/simulationScene"
import { structuredObservationToSimulationScene } from "../../sim/core/sourceIntake"

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
            from: "breadboard1:bb1:j4",
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
})
