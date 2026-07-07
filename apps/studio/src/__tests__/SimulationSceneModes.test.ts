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
