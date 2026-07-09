// @vitest-environment jsdom

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import App from "../App"
import {
  createMultiPostitWorkbenchPostits,
  resizeMultiPostitInstance,
  restoreMultiPostitWorkbench,
  serializeMultiPostitWorkbench,
  type MultiPostitObject,
} from "../design/multiPostitWorkbenchModel"
import { deriveFunctionSurfaceMode, pluginPostitControlIds } from "../toolhost/postitObject"

const WORKBENCH_LOAD_TIMEOUT_MS = 15_000

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("Browser-hosted multi post-it evidence route", () => {
  it("has a dedicated route and imports no private simulator internals", () => {
    window.history.replaceState(null, "", "/?vista=simulatore-postit")

    const source = readFileSync(join(process.cwd(), "src", "design", "MultiPostitWorkbench.tsx"), "utf8")
    const modelSource = readFileSync(
      join(process.cwd(), "src", "design", "multiPostitWorkbenchModel.ts"),
      "utf8",
    )
    const boardSource = readFileSync(
      join(process.cwd(), "src", "design", "multiPostitBoardPersistence.ts"),
      "utf8",
    )
    const guardedSource = `${source}\n${modelSource}\n${boardSource}`

    expect(source).toContain("@elab-pack/postitFunctions.json")
    expect(boardSource).toContain("PLUGIN_POSTIT_BOARD_STATE_SCHEMA")
    expect(guardedSource).not.toMatch(
      /\b(?:CircuitSolver|AVRBridge|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|simulationProviders)\b/,
    )
    expect(guardedSource).not.toMatch(/@elab-tutor-plugin|sim\/solver|components\/simulator/)
  })

  it("renders two Simulation post-its and one ELABTutor consumer with instance-scoped state", async () => {
    window.history.replaceState(null, "", "/?vista=simulatore-postit")

    const { container } = render(<App />)

    const workbench = await screen.findByTestId("multi-postit-workbench", {}, { timeout: WORKBENCH_LOAD_TIMEOUT_MS })
    expect(workbench.getAttribute("data-multi-postit-workbench")).toBe("ready")

    expect(
      Array.from(container.querySelectorAll("[data-plugin-postit-instance]")).map((node) =>
        node.getAttribute("data-plugin-postit-instance"),
      ),
    ).toEqual(["sim-a", "sim-b", "elab-consumer"])
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.ardesia.simulation"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.elab.tutor"]')).toHaveLength(1)

    const ids = Array.from(container.querySelectorAll("[id^='plugin-postit-']")).map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)

    expect(container.querySelector('[data-provider-output-instance="sim-a"]')).not.toBeNull()
    expect(container.querySelector('[data-provider-output-instance="sim-b"]')).not.toBeNull()
    expect(container.querySelector('[data-provider-output-instance="sim-a"]')?.textContent).toContain("local")
    expect(container.querySelector('[data-provider-output-instance="sim-b"]')?.textContent).toContain("fastapi")

    fireEvent.click(screen.getByRole("button", { name: "seleziona LED su sim-a" }))

    expect(container.querySelector('[data-selected-component-instance="sim-a"]')?.textContent).toBe("led-a")
    expect(container.querySelector('[data-selected-component-instance="sim-b"]')?.textContent).toBe("nessuno")

    expect(container.querySelector('[data-elabtutor-runtime-api="simulation-runtime/1"]')).not.toBeNull()
    expect(container.querySelector("[data-elabtutor-simulation-instance]")?.getAttribute(
      "data-elabtutor-simulation-instance",
    )).toBe("sim-a")
    expect(container.querySelector("[data-elabtutor-private-canvas]")).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "riduci sim-a" }))
    await waitFor(() => {
      expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
        "data-function-surface-mode",
      )).toBe("compact")
    })

    fireEvent.click(screen.getByRole("button", { name: "espandi sim-a" }))
    await waitFor(() => {
      expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
        "data-function-surface-mode",
      )).toBe("expanded")
    })
    expect(container.querySelector('[data-function-surface-instance="sim-b"]')?.getAttribute(
      "data-function-surface-mode",
    )).toBe("normal")
  })

  it("serializes and restores Simulation plus ELABTutor plugin post-it instances without cross-instance drift", () => {
    const resized = resizeMultiPostitInstance(
      resizeMultiPostitInstance(createMultiPostitWorkbenchPostits(), "sim-a", "compact"),
      "sim-b",
      "expanded",
    )

    const snapshot = serializeMultiPostitWorkbench(resized)
    const restored = restoreMultiPostitWorkbench(snapshot)

    expect(snapshot.schema).toBe("multi-postit-workbench-state/1")
    expect(snapshot.postits).toHaveLength(3)
    expect(restored.map((postit) => `${postit.pluginId}:${postit.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
      "io.ardesia.simulation:sim-b",
      "io.elab.tutor:elab-consumer",
    ])

    const simA = findPostit(restored, "sim-a")
    const simB = findPostit(restored, "sim-b")
    const elabTutor = findPostit(restored, "elab-consumer")
    const simAState = expectSimulationState(simA)
    const simBState = expectSimulationState(simB)
    const elabTutorState = expectElabTutorState(elabTutor)

    expect(deriveFunctionSurfaceMode(simA)).toBe("compact")
    expect(deriveFunctionSurfaceMode(simB)).toBe("expanded")
    expect(deriveFunctionSurfaceMode(elabTutor)).toBe("normal")
    expect(simA.bounds).toMatchObject({ width: 260, height: 180 })
    expect(simB.bounds).toMatchObject({ width: 960, height: 560 })

    expect(simAState.providerOutput.instanceId).toBe("sim-a")
    expect(simAState.providerOutput.pluginId).toBe("io.ardesia.simulation")
    expect(simAState.providerOutput.providerId).toBe("local")
    expect(simAState.providerOutput.solverOutput.currents.led).toBe(0.0153)
    expect(simBState.providerOutput.instanceId).toBe("sim-b")
    expect(simBState.providerOutput.pluginId).toBe("io.ardesia.simulation")
    expect(simBState.providerOutput.providerId).toBe("fastapi")

    expect(elabTutorState.simulationInstanceId).toBe("sim-a")
    expect(elabTutorState.runtimeApi).toBe("simulation-runtime/1")

    const ids = restored.flatMap((postit) => Object.values(pluginPostitControlIds(postit)))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("exports, mutates, and restores the visible board-hosted post-it payload", async () => {
    window.history.replaceState(null, "", "/?vista=simulatore-postit")

    const { container } = render(<App />)
    const workbench = await screen.findByTestId("multi-postit-workbench", {}, { timeout: WORKBENCH_LOAD_TIMEOUT_MS })

    fireEvent.click(screen.getByRole("button", { name: "esporta post-it" }))

    expect(workbench.getAttribute("data-serialized-postit-count")).toBe("3")
    expect(workbench.getAttribute("data-postit-restore-status")).toBe("snapshot-ready")

    fireEvent.click(screen.getByRole("button", { name: "seleziona LED su sim-a" }))
    fireEvent.click(screen.getByRole("button", { name: "riduci sim-a" }))

    await waitFor(() => {
      expect(container.querySelector('[data-selected-component-instance="sim-a"]')?.textContent).toBe("led-a")
      expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
        "data-function-surface-mode",
      )).toBe("compact")
    })

    fireEvent.click(screen.getByRole("button", { name: "ripristina post-it" }))

    await waitFor(() => {
      expect(workbench.getAttribute("data-postit-restore-status")).toBe("restored")
      expect(container.querySelector('[data-selected-component-instance="sim-a"]')?.textContent).toBe("nessuno")
      expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
        "data-function-surface-mode",
      )).toBe("normal")
    })

    expect(container.querySelector("[data-elabtutor-simulation-instance]")?.getAttribute(
      "data-elabtutor-simulation-instance",
    )).toBe("sim-a")
    expect(container.querySelector("[data-elabtutor-runtime-api]")?.getAttribute(
      "data-elabtutor-runtime-api",
    )).toBe("simulation-runtime/1")
    const ids = Array.from(container.querySelectorAll("[id^='plugin-postit-']")).map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("reloads a visible board scene into three rendered plugin post-its", async () => {
    window.history.replaceState(null, "", "/?vista=simulatore-postit")

    const { container } = render(<App />)
    const workbench = await screen.findByTestId("multi-postit-workbench", {}, { timeout: WORKBENCH_LOAD_TIMEOUT_MS })

    fireEvent.click(screen.getByRole("button", { name: "riduci sim-a" }))
    await waitFor(() => {
      expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
        "data-function-surface-mode",
      )).toBe("compact")
    })

    fireEvent.click(screen.getByRole("button", { name: "salva board post-it" }))

    await waitFor(() => {
      expect(workbench.getAttribute("data-board-postit-reload-status")).toBe("board-ready")
      expect(workbench.getAttribute("data-board-postit-count")).toBe("3")
    })

    fireEvent.click(screen.getByRole("button", { name: "seleziona LED su sim-a" }))
    fireEvent.click(screen.getByRole("button", { name: "normalizza sim-a" }))

    await waitFor(() => {
      expect(container.querySelector('[data-selected-component-instance="sim-a"]')?.textContent).toBe("led-a")
      expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
        "data-function-surface-mode",
      )).toBe("normal")
    })

    fireEvent.click(screen.getByRole("button", { name: "ricarica board post-it" }))

    await waitFor(() => {
      expect(workbench.getAttribute("data-board-postit-reload-status")).toBe("board-reloaded")
      expect(container.querySelector('[data-selected-component-instance="sim-a"]')?.textContent).toBe("nessuno")
      expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
        "data-function-surface-mode",
      )).toBe("compact")
    })

    expect(
      Array.from(container.querySelectorAll("[data-plugin-postit-instance]")).map((node) =>
        node.getAttribute("data-plugin-postit-instance"),
      ),
    ).toEqual(["sim-a", "sim-b", "elab-consumer"])
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.ardesia.simulation"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.elab.tutor"]')).toHaveLength(1)
    expect(container.querySelector('[data-provider-output-instance="sim-a"]')?.textContent).toContain("local")
    expect(container.querySelector('[data-provider-output-instance="sim-b"]')?.textContent).toContain("fastapi")
    expect(container.querySelector('[data-solver-output-instance="sim-a"]')?.textContent).toContain("0.0153")
    expect(container.querySelector("[data-elabtutor-simulation-instance]")?.getAttribute(
      "data-elabtutor-simulation-instance",
    )).toBe("sim-a")
    expect(container.querySelector("[data-elabtutor-runtime-api]")?.getAttribute(
      "data-elabtutor-runtime-api",
    )).toBe("simulation-runtime/1")

    const ids = Array.from(container.querySelectorAll("[id^='plugin-postit-']")).map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

function findPostit(postits: readonly MultiPostitObject[], instanceId: string): MultiPostitObject {
  const postit = postits.find((candidate) => candidate.instanceId === instanceId)
  if (postit === undefined) throw new Error(`missing post-it ${instanceId}`)
  return postit
}

function expectSimulationState(postit: MultiPostitObject) {
  if (!("providerOutput" in postit.pluginState)) {
    throw new Error(`expected Simulation state for ${postit.instanceId}`)
  }
  return postit.pluginState
}

function expectElabTutorState(postit: MultiPostitObject) {
  if (!("simulationInstanceId" in postit.pluginState)) {
    throw new Error(`expected ELABTutor state for ${postit.instanceId}`)
  }
  return postit.pluginState
}
