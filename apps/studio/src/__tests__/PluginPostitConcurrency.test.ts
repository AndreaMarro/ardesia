import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  createPluginPostitObject,
  deriveFunctionSurfaceMode,
  pluginPostitControlIds,
  scopePluginPostitProviderOutput,
  updatePluginPostitCollectionInteraction,
  updatePluginPostitCollectionState,
  type PluginPostitObject,
} from "../toolhost/postitObject"

type SimulationState = {
  sceneId: string
  selectedComponentId: string | null
  providerOutput?: unknown
}

function simulationPostit(instanceId: string, sceneId: string): PluginPostitObject<SimulationState> {
  return createPluginPostitObject({
    instanceId,
    pluginId: "io.ardesia.simulation",
    bounds: { x: 40, y: 60, width: 520, height: 360 },
    zIndex: 3,
    pluginState: {
      sceneId,
      selectedComponentId: null,
    },
  })
}

describe("Plugin post-it concurrency", () => {
  it("keeps two simulation post-it state mutations instance-scoped", () => {
    const first = simulationPostit("sim-a", "scene-a")
    const second = simulationPostit("sim-b", "scene-b")

    const updated = updatePluginPostitCollectionState([first, second], "sim-a", {
      sceneId: "scene-a",
      selectedComponentId: "led-a",
    })

    expect(updated).toHaveLength(2)
    expect(updated[0]).not.toBe(first)
    expect(updated[1]).toBe(second)
    expect(updated[0].pluginState).toEqual({
      sceneId: "scene-a",
      selectedComponentId: "led-a",
    })
    expect(updated[1].pluginState).toEqual({
      sceneId: "scene-b",
      selectedComponentId: null,
    })
  })

  it("keeps Simulation and ELABTutor function, hover, and proximity state separate", () => {
    const simulation = simulationPostit("sim-main", "reference-circuit")
    const elabTutor = createPluginPostitObject({
      instanceId: "elab-consumer",
      pluginId: "io.elab.tutor",
      bounds: { x: 620, y: 60, width: 760, height: 460 },
      zIndex: 4,
      pluginState: {
        activeFunction: "unlim",
        simulationInstanceId: "sim-main",
      },
    })

    const updated = updatePluginPostitCollectionInteraction([simulation, elabTutor], "elab-consumer", {
      hovered: true,
      proximity: "active",
    })

    expect(updated[0]).toMatchObject({
      instanceId: "sim-main",
      hovered: false,
      proximity: "far",
    })
    expect(updated[1]).toMatchObject({
      instanceId: "elab-consumer",
      hovered: true,
      proximity: "active",
    })
    expect(deriveFunctionSurfaceMode(updated[0])).toBe("hidden")
    expect(deriveFunctionSurfaceMode(updated[1])).toBe("normal")
  })

  it("generates instance-specific control ids with no duplicate DOM ids", () => {
    const ids = [
      pluginPostitControlIds(simulationPostit("sim-a", "scene-a")),
      pluginPostitControlIds(simulationPostit("sim-b", "scene-b")),
      pluginPostitControlIds(
        createPluginPostitObject({
          instanceId: "elab-consumer",
          pluginId: "io.elab.tutor",
          bounds: { x: 0, y: 0, width: 420, height: 300 },
          zIndex: 5,
          pluginState: {},
        }),
      ),
    ]

    const flatIds = ids.flatMap((record) => Object.values(record))

    expect(new Set(flatIds).size).toBe(flatIds.length)
    expect(flatIds).toContain("plugin-postit-sim-a-keyboard-scope")
    expect(flatIds).toContain("plugin-postit-sim-b-provider-diagnostics")
    expect(flatIds).toContain("plugin-postit-elab-consumer-solver-output")
  })

  it("attaches provider diagnostics and solver outputs to the correct instance id", () => {
    const first = simulationPostit("sim-a", "scene-a")
    const second = simulationPostit("sim-b", "scene-b")

    const firstOutput = scopePluginPostitProviderOutput(first, {
      providerId: "local",
      diagnostics: ["local solver available"],
      solverOutput: { currents: { ledA: 0.0153 }, componentStates: { ledA: { on: true } } },
    })
    const secondOutput = scopePluginPostitProviderOutput(second, {
      providerId: "fastapi",
      diagnostics: ["FastAPI provider hub not configured"],
      solverOutput: { currents: {}, componentStates: {} },
    })

    const updated = updatePluginPostitCollectionState(
      updatePluginPostitCollectionState([first, second], "sim-a", {
        ...first.pluginState,
        providerOutput: firstOutput,
      }),
      "sim-b",
      {
        ...second.pluginState,
        providerOutput: secondOutput,
      },
    )

    expect(updated[0].pluginState.providerOutput).toMatchObject({
      instanceId: "sim-a",
      pluginId: "io.ardesia.simulation",
      providerId: "local",
      diagnostics: ["local solver available"],
    })
    expect(updated[1].pluginState.providerOutput).toMatchObject({
      instanceId: "sim-b",
      pluginId: "io.ardesia.simulation",
      providerId: "fastapi",
      diagnostics: ["FastAPI provider hub not configured"],
    })
  })

  it("does not introduce mutable globals for per-instance state", () => {
    const source = readFileSync(join(process.cwd(), "src", "toolhost", "postitObject.ts"), "utf8")

    expect(source).not.toMatch(/^\s*let\s+/m)
    expect(source).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(source).not.toMatch(/\bcurrent(Postit|Instance|Provider|Diagnostics|Keyboard|Hover)\b/)
  })
})
