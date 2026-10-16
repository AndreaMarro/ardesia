// @vitest-environment jsdom
import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import ElabLab, { findElabLabExperiment, toSolverExperiment } from "../design/ElabLab"
import { getSimulationTool, registerSimulationTool } from "../toolhost/simulationPluginRegistry"
import { REFERENCE_SIM_TOOL_ID, createReferenceSimulationScene, createV1Cap9Esp6SimulationScene, createToolEmbedElement, renderToolCanvasEmbeddable, REFERENCE_SIM_EMBED_ID } from "../toolhost/ToolCanvasEmbeddable"
import { formatRgbChannelMa, rgbChannelsFromSolve, solveElabExperiment, type SolveResult } from "../../sim/solver/elabSolver"
import { simulationSceneToElabCanvasState } from "../../sim/elab/elabCanvasAdapter"
import { InMemoryEventLog } from "../lessonos/eventlog"
import * as solverBoundary from "../../sim/solver/elabSolver"
import { simulationSolveEvent } from "../lessonos/simulationSolveEvent"

afterEach(() => { cleanup(); window.history.replaceState(null, "", "/") })

function rgbSolve() {
  const scene = createV1Cap9Esp6SimulationScene()
  return solveElabExperiment({ components: scene.components, connections: scene.connections, pinAssignments: scene.pinAssignments })
}

describe("LED evidence is not reconstructed from absent or rejected solver fields", () => {
  it("an absent RGB channel has no invented zero current", () => {
    const result = rgbSolve()
    delete result.componentStates.rgb1.red
    expect(formatRgbChannelMa(rgbChannelsFromSolve(result, "rgb1").red)).toBe("?")
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -0.1])("invalid RGB brightness %s is not a current", brightness => {
    const result = rgbSolve()
    result.componentStates.rgb1.red = { on: true, brightness }
    expect(formatRgbChannelMa(rgbChannelsFromSolve(result, "rgb1").red)).toBe("?")
  })

  it("rejected result cannot reuse a previous known RGB value", () => {
    const result = { ...rgbSolve(), ok: false }
    expect(formatRgbChannelMa(rgbChannelsFromSolve(result, "rgb1").red)).toBe("?")
  })

  it("the core-canvas adapter does not fabricate LED brightness after a real short", () => {
    const scene = createReferenceSimulationScene()
    scene.connections.push({ from: "bat1:positive", to: "bat1:negative", color: "red", kind: "wire" })
    const projection = simulationSceneToElabCanvasState(scene)
    expect(projection.componentStates.led1).not.toHaveProperty("brightness")
    expect(projection.diagnostics.join(" ")).toMatch(/non disponibile|rifiutato|corto circuito/i)
  })

  it("partial or invalid core state is described as unavailable, without a fabricated glow", () => {
    const scene = createReferenceSimulationScene()
    const result = solveElabExperiment({ components: scene.components, connections: scene.connections, pinAssignments: scene.pinAssignments })
    result.componentStates.led1 = { on: true, brightness: Number.NaN }
    const spy = vi.spyOn(solverBoundary, "solveElabExperiment").mockReturnValue(result)
    try {
      const projection = simulationSceneToElabCanvasState(scene)
      expect(projection.componentStates.led1).not.toHaveProperty("brightness")
      expect(projection.diagnostics.join(" ")).toMatch(/non disponibile/i)
    } finally { spy.mockRestore() }
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY])("invalid current %s cannot become a solved event for export/recap", currentMa => {
    expect(simulationSolveEvent({ experimentId: "synthetic-led", outcome: { kind: "solved", currentMa, bookLayoutValid: true }, t: 1 })).toBeNull()
  })

  it("a valid zero can still be persisted as a measured result", () => {
    const event = simulationSolveEvent({ experimentId: "synthetic-led", outcome: { kind: "solved", currentMa: 0, bookLayoutValid: true }, t: 1 })
    expect(event).toMatchObject({ kind: "simulation.circuit.solved", currentMa: 0 })
  })
})

const real = getSimulationTool(REFERENCE_SIM_TOOL_ID)!
async function labWith(result: SolveResult, experiment = "v1-cap6-esp1") {
  window.history.replaceState(null, "", `/?vista=elab-lab&esperimento=${experiment}`)
  registerSimulationTool(REFERENCE_SIM_TOOL_ID, { ...real, solve: () => result })
  try { return render(<ElabLab eventLog={new InMemoryEventLog()} />) }
  finally { registerSimulationTool(REFERENCE_SIM_TOOL_ID, real) }
}

describe("Lab consumes the declared solver outcome, not a default Boolean", () => {
  it("the primary canvas receives the same known LED result as its panel", async () => {
    const result = solveElabExperiment(toSolverExperiment(findElabLabExperiment()!))
    const { container } = await labWith(result)
    expect(container.querySelector("[data-led-on]")?.textContent).toBe("acceso")
    await waitFor(() => expect(container.querySelector('[data-elab-canvas] [data-type="led"]')?.getAttribute("aria-label")).toContain("acceso"))
  })

  it("a rejected result with stale LED fields cannot be presented as solved", async () => {
    const old = solveElabExperiment(toSolverExperiment(findElabLabExperiment()!))
    const { container } = await labWith({ ...old, ok: false })
    expect(container.querySelector("[data-led-on]")).toBeNull()
    expect(container.querySelector("[data-elab-lab-solve]")?.getAttribute("data-elab-lab-solve")).toBe("error")
  })

  it("a present component without an on flag is not OFF", async () => {
    const result = solveElabExperiment(toSolverExperiment(findElabLabExperiment()!))
    result.componentStates.led1 = {}
    const { container } = await labWith(result)
    expect(container.querySelector("[data-led-on]")).toBeNull()
    expect(container.querySelector("[data-led-state=missing]")?.textContent).toContain("led1")
  })

  it("partial RGB channels cannot be presented as complete measured channels", async () => {
    const result = rgbSolve()
    delete result.componentStates.rgb1.red
    const { container } = await labWith(result, "v1-cap9-esp6")
    expect(container.querySelector("[data-led-on]")).toBeNull()
    expect(container.querySelector("[data-led-state=missing]")?.textContent).toContain("rgb1")
  })

  it("non-finite current is unavailable while a genuine measured zero remains zero", async () => {
    const result = solveElabExperiment(toSolverExperiment(findElabLabExperiment()!))
    result.currents.led1 = Number.NaN
    const bad = await labWith(result)
    expect(bad.container.querySelector("[data-led-current-ma]")?.textContent).toBe("?")
    bad.unmount()
    result.currents.led1 = 0
    result.componentStates.led1 = { on: false }
    const zero = await labWith(result)
    expect(zero.container.querySelector("[data-led-current-ma]")?.textContent).toBe("0.0")
    expect(zero.container.querySelector("[data-led-on]")?.textContent).toBe("spento")
  })
})


describe("review counterexamples remain coherent across actual mono consumers", () => {
  it.each([true, false])("legacy on-only state %s agrees between panel and primary Lab canvas", async on => {
    const result = solveElabExperiment(toSolverExperiment(findElabLabExperiment()!))
    result.componentStates.led1 = { on }
    const { container } = await labWith(result)
    expect(container.querySelector("[data-led-on]")?.textContent).toBe(on ? "acceso" : "spento")
    await waitFor(() => expect(container.querySelector('[data-elab-canvas] [data-type="led"]')).not.toBeNull())
    const label = container.querySelector('[data-elab-canvas] [data-type="led"]')!.getAttribute("aria-label")
    if (on) expect(label).toContain("acceso")
    else expect(label).not.toContain("acceso")
  })

  it("non-finite mono brightness cannot declare a verdict in the Lab panel", async () => {
    const result = solveElabExperiment(toSolverExperiment(findElabLabExperiment()!))
    result.componentStates.led1 = { on: true, brightness: Number.NaN }
    const { container } = await labWith(result)
    expect(container.querySelector("[data-led-on]")).toBeNull()
    expect(container.querySelector("[data-led-state=missing]")?.textContent).toContain("led1")
  })

  it.each(["short", "absent-runtime"] as const)("actual mono embed keeps %s evidence unknown", async kind => {
    const scene = createReferenceSimulationScene()
    if (kind === "short") scene.connections.push({ from: "bat1:positive", to: "bat1:negative", color: "red", kind: "wire" })
    else delete (scene.runtime as { ledOn?: boolean }).ledOn
    const element = createToolEmbedElement({ embedId: REFERENCE_SIM_EMBED_ID, state: { kind: "simulation-scene-v1", scene } })
    const view = renderToolCanvasEmbeddable(element as never)
    if (view === null) throw new Error("real mono embed rejected")
    const { container } = render(view)
    await waitFor(() => expect(container.querySelector("[data-elab-canvas-measurement]")).not.toBeNull())
    const legacy = container.querySelector("[data-legacy-free-assembly-harness]")!
    if (kind === "short") expect(container.querySelector("[data-elab-canvas-measurement]")?.getAttribute("data-elab-canvas-measurement")).toBe("unknown")
    expect(legacy.textContent).toContain("LED ?")
    expect(legacy.textContent).toContain("corrente ? mA")
    expect(container.querySelector("aside")?.textContent).toContain("LED?")
    expect(container.querySelector("aside")?.textContent).toContain("corrente? mA")
    expect(legacy.querySelector('[aria-label$="stato non disponibile"]')).not.toBeNull()
  })
})
