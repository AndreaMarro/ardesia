// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import {
  createToolEmbedElement,
  createV1Cap9Esp6SimulationScene,
  renderToolCanvasEmbeddable,
  ELAB_V1_RGB_LAMP_EMBED_ID,
  type SimulationSceneV1,
} from "../toolhost/ToolCanvasEmbeddable"
import SimulationPluginWorkbench from "../design/SimulationPluginWorkbench"
import { solveElabExperiment } from "../../sim/solver/elabSolver"
import { createMultiPostitWorkbenchPostits, isSimulationPostitState } from "../design/multiPostitWorkbenchModel"
import { createPluginPostitBoardScene } from "../design/multiPostitBoardPersistence"
import { renderPluginPostitBoardEmbeddable } from "../toolhost/pluginPostitBoardRender"

afterEach(cleanup)

describe("unavailable simulation results stay unknown in real consumers", () => {
  it("a scene with no RGB result does not claim the LED is off", () => {
    const original = createV1Cap9Esp6SimulationScene()
    const scene = { ...original, components: original.components.filter(component => component.type !== "rgb-led") }
    const element = createToolEmbedElement({
      embedId: ELAB_V1_RGB_LAMP_EMBED_ID,
      state: { kind: "simulation-scene-v1", scene },
    })
    const view = renderToolCanvasEmbeddable(element as never)
    if (view === null) throw new Error("real simulation embed rejected")
    const { container } = render(view)
    expect(container.textContent).toContain("solve non disponibile")
    expect(container.textContent).toContain("LED RGB ?")
    expect(container.textContent).not.toContain("LED RGB OFF")
  })

  it("a failed solve with the RGB still present does not label it spento", () => {
    const original = createV1Cap9Esp6SimulationScene()
    // nano-r4 is admitted by the scene type but unsupported by this MNA solver.
    const scene: SimulationSceneV1 = {
      ...original,
      components: [...original.components, { id: "unsupported-nano", type: "nano-r4", label: "Nano" }],
    }
    const element = createToolEmbedElement({
      embedId: ELAB_V1_RGB_LAMP_EMBED_ID,
      state: { kind: "simulation-scene-v1", scene },
    })
    const view = renderToolCanvasEmbeddable(element as never)
    if (view === null) throw new Error("real simulation embed rejected")
    const { container } = render(view)
    expect(container.textContent).toContain("solve non disponibile")
    expect(container.querySelector('[aria-label^="LED RGB"]')?.getAttribute("aria-label")).toBe("LED RGB stato non disponibile")
    expect(container.textContent).toContain("LED RGB ?")
  })

  it("a real short circuit remains a failed solve instead of a measured OFF and zero channels", () => {
    const original = createV1Cap9Esp6SimulationScene()
    const scene: SimulationSceneV1 = {
      ...original,
      connections: [...original.connections, { from: "bat1:positive", to: "bat1:negative", color: "red", kind: "wire" }],
    }
    const solved = solveElabExperiment({
      components: scene.components,
      connections: scene.connections,
      pinAssignments: scene.pinAssignments,
    })
    expect(solved.ok).toBe(false)
    expect(solved.diagnostics.shortCircuit).toBe(true)
    const element = createToolEmbedElement({
      embedId: ELAB_V1_RGB_LAMP_EMBED_ID,
      state: { kind: "simulation-scene-v1", scene },
    })
    const view = renderToolCanvasEmbeddable(element as never)
    if (view === null) throw new Error("real simulation embed rejected")
    const { container } = render(view)
    expect(container.textContent).toContain("LED RGB ?")
    expect(container.textContent).toContain("solve non disponibile")
    expect(container.querySelector("[data-rgb-channels]")?.textContent).not.toContain("0.0 mA")
    expect(container.querySelector('[aria-label^="LED RGB"]')?.getAttribute("aria-label")).toBe("LED RGB stato non disponibile")
  })

  it("a successfully solved open circuit can still report a genuine OFF", () => {
    const original = createV1Cap9Esp6SimulationScene()
    const scene = { ...original, connections: [] }
    const solved = solveElabExperiment({ components: scene.components, connections: scene.connections, pinAssignments: scene.pinAssignments })
    expect(solved.ok).toBe(true)
    const element = createToolEmbedElement({ embedId: ELAB_V1_RGB_LAMP_EMBED_ID, state: { kind: "simulation-scene-v1", scene } })
    const view = renderToolCanvasEmbeddable(element as never)
    if (view === null) throw new Error("real simulation embed rejected")
    const { container } = render(view)
    expect(container.textContent).toContain("LED RGB OFF")
    expect(container.querySelector('[aria-label^="LED RGB"]')?.getAttribute("aria-label")).toBe("LED RGB spento")
  })

  it("a short circuit made with the Workbench cable tool cannot become LED OFF", () => {
    const { container } = render(<SimulationPluginWorkbench />)
    const palette = container.querySelector('[aria-label="palette Cavo"]')
    const supply = container.querySelector('[data-bb-hole="bb1:bus-top-plus-2"]')
    const ground = container.querySelector('[data-bb-hole="bb1:b9"]')
    if (!palette || !supply || !ground) throw new Error("real cable controls missing")
    fireEvent.click(palette)
    fireEvent.click(supply)
    fireEvent.click(ground)
    const strip = container.querySelector("[data-live-physics-status]")
    expect(strip?.getAttribute("data-live-physics-status")).toBe("blocked")
    expect(strip?.getAttribute("data-live-physics-current-ma")).toBe("?")
    expect(strip?.querySelector("[data-led-readout]")?.textContent).toBe("LED ?")
    expect(strip?.textContent).not.toContain("LED OFF")
    expect(strip?.textContent).toContain("corto circuito rilevato")
    const canvas = container.querySelector("[data-experiment-id]")
    expect(canvas?.textContent).toContain("LED ?")
    expect(canvas?.textContent).not.toContain("LED ON")
    expect(canvas?.textContent).not.toContain("corrente 0.0 mA")
    expect(canvas?.querySelector('[aria-label$="stato non disponibile"]')).not.toBeNull()
    const undo = container.querySelector("[data-montaggio-canvas-undo]")
    if (!undo) throw new Error("real undo control missing")
    fireEvent.click(undo)
    expect(strip?.getAttribute("data-live-physics-status")).toBe("ok")
    expect(strip?.querySelector("[data-led-readout]")?.textContent).toBe("LED ON")
    expect(canvas?.textContent).toContain("LED ON")
    expect(canvas?.querySelector('[aria-label$="acceso"]')).not.toBeNull()
  })

  it("the default unconfigured provider renders unknown, while real current retains its precision", () => {
    const postits = createMultiPostitWorkbenchPostits()
    const unavailable = postits.find(postit => postit.instanceId === "sim-b")!
    if (!isSimulationPostitState(unavailable.pluginState)) throw new Error("expected real simulation state")
    expect(unavailable.pluginState.providerOutput.providerId).toBe("fastapi")
    expect(unavailable.pluginState.providerOutput.solverOutput.currents).toEqual({})
    const board = createPluginPostitBoardScene(postits)
    for (const element of board.elements) {
      const view = renderPluginPostitBoardEmbeddable(element)
      if (view !== null) render(view)
    }
    expect(document.querySelector('[data-solver-output-instance="sim-b"]')?.textContent).toBe("led current ?")
    expect(document.querySelector('[data-solver-output-instance="sim-a"]')?.textContent).toBe("led current 0.0153")
  })

  it("a measured zero remains zero", () => {
    const postits = createMultiPostitWorkbenchPostits()
    const measured = postits.find(postit => postit.instanceId === "sim-a")!
    if (!isSimulationPostitState(measured.pluginState)) throw new Error("expected real simulation state")
    measured.pluginState.providerOutput.solverOutput.currents.led = 0
    const board = createPluginPostitBoardScene(postits)
    const view = renderPluginPostitBoardEmbeddable(board.elements[0]!)
    if (view === null) throw new Error("real post-it embed rejected")
    const { container } = render(view)
    expect(container.querySelector('[data-solver-output-instance="sim-a"]')?.textContent).toBe("led current 0")
  })
})
