// @vitest-environment node

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  attachSimulationViewportToRuntime,
  createSimulationViewportState,
  fitSimulationViewportToScene,
  panSimulationViewport,
  resizeSimulationViewport,
  restoreSimulationViewportState,
  serializeSimulationViewportState,
  simulationViewportPostitBounds,
  visibleWorldBoundsForViewport,
  zoomSimulationViewport,
} from "../../sim/core/simulationViewport"
import type { SimulationScene } from "../../sim/core/simulationScene"
import { loadSimulationRuntimeScene } from "../../sim/core/simulationRuntime"
import {
  derivePluginFunctionSurface,
  type PluginFunctionDescriptor,
} from "../toolhost/pluginFunctions"
import { createPluginPostitObject } from "../toolhost/postitObject"

const viewportFunctions: PluginFunctionDescriptor[] = [
  {
    id: "workspace",
    label: "Workspace",
    priority: 10,
    surfaces: {
      compact: { label: "Fit", role: "primary" },
      normal: { label: "Workspace", role: "primary" },
      expanded: { label: "Full workspace", role: "workspace" },
    },
  },
]

function multiBoardScene(): SimulationScene {
  return {
    schemaVersion: "simulation-scene/2",
    id: "multi-board-viewport-scene",
    title: "Multi-board viewport scene",
    domain: "electronics",
    components: [
      {
        id: "bb-left",
        type: "breadboard-half",
        pose: { x: 100, y: 80 },
      },
      {
        id: "arduino-a",
        type: "nano-r4",
        pose: { x: 520, y: 130, rotation: 90 },
        pins: [{ id: "D13" }, { id: "GND" }],
      },
      {
        id: "bb-right",
        type: "breadboard-half",
        pose: { x: 920, y: 420 },
      },
      {
        id: "led1",
        type: "led",
        pose: { x: 840, y: 360 },
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
    ],
    wires: [
      {
        id: "wire-cross-board",
        from: "arduino-a:D13",
        to: "led1:anode",
        color: "red",
        path: {
          kind: "polyline",
          points: [
            { x: 620, y: 220 },
            { x: 820, y: 360 },
          ],
        },
      },
    ],
    provenance: {
      source: {
        kind: "manual-description",
        label: "viewport contract fixture",
        status: "reviewed",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
}

describe("Simulation post-it viewport", () => {
  it("fits content around multiple breadboards and Arduino-style boards", () => {
    const viewport = fitSimulationViewportToScene({
      instanceId: "sim-viewport-fit",
      scene: multiBoardScene(),
      viewport: { width: 640, height: 360 },
      padding: 32,
    })

    expect(viewport.schema).toBe("simulation-viewport/1")
    expect(viewport.instanceId).toBe("sim-viewport-fit")
    expect(viewport.content.items.map((item) => [item.id, item.kind])).toEqual([
      ["bb-left", "breadboard"],
      ["arduino-a", "controller-board"],
      ["bb-right", "breadboard"],
      ["led1", "component"],
      ["wire-cross-board", "wire-path"],
    ])
    expect(viewport.content.bounds.left).toBeLessThanOrEqual(68)
    expect(viewport.content.bounds.top).toBeLessThanOrEqual(48)
    expect(viewport.content.bounds.right).toBeGreaterThan(1170)
    expect(viewport.content.bounds.bottom).toBeGreaterThan(560)
    expect(viewport.zoom).toBeGreaterThan(0)
    expect(viewport.zoom).toBeLessThanOrEqual(1)
    expect(Number.isFinite(viewport.pan.x)).toBe(true)
    expect(Number.isFinite(viewport.pan.y)).toBe(true)
  })

  it("resizes the visible workspace without mutating scene coordinates", () => {
    const scene = multiBoardScene()
    const originalScene = JSON.parse(JSON.stringify(scene)) as SimulationScene
    const viewport = fitSimulationViewportToScene({
      instanceId: "sim-viewport-resize",
      scene,
      viewport: { width: 720, height: 420 },
      padding: 24,
    })
    const beforeVisible = visibleWorldBoundsForViewport(viewport)

    const resized = resizeSimulationViewport(viewport, { width: 360, height: 220 })

    expect(scene).toEqual(originalScene)
    expect(resized.viewport).toEqual({ width: 360, height: 220 })
    expect(resized.content.bounds).toEqual(viewport.content.bounds)
    expect(visibleWorldBoundsForViewport(resized).right - visibleWorldBoundsForViewport(resized).left).not.toBe(
      beforeVisible.right - beforeVisible.left,
    )
  })

  it("round-trips pan and zoom through serialized runtime-scoped post-it state", () => {
    const runtime = loadSimulationRuntimeScene({
      instanceId: "sim-runtime-viewport",
      scene: {
        components: [{ id: "led1", type: "led" }],
        connections: [],
        pinAssignments: {},
      },
    })
    const viewport = zoomSimulationViewport(
      panSimulationViewport(
        createSimulationViewportState({
          instanceId: runtime.instanceId,
          viewport: { width: 800, height: 480 },
          contentBounds: { left: -120, top: -80, right: 1260, bottom: 780 },
        }),
        { dx: 140, dy: -60 },
      ),
      { zoom: 1.75 },
    )

    const attached = attachSimulationViewportToRuntime(runtime, viewport)
    const serialized = serializeSimulationViewportState(attached.viewport)
    const restored = restoreSimulationViewportState(serialized)

    expect(attached.instanceId).toBe("sim-runtime-viewport")
    expect(restored).toEqual(viewport)
    expect(restored.pan).toEqual({ x: 140, y: -60 })
    expect(restored.zoom).toBe(1.75)
    expect(() =>
      attachSimulationViewportToRuntime(
        { ...runtime, instanceId: "sim-runtime-other" },
        viewport,
      ),
    ).toThrow("runtime and viewport instanceId must match")
  })

  it("maps small and large viewports to compact and expanded function surfaces", () => {
    const compactViewport = createSimulationViewportState({
      instanceId: "sim-compact-viewport",
      viewport: { width: 260, height: 180 },
      contentBounds: { left: 0, top: 0, right: 900, bottom: 600 },
    })
    const expandedViewport = createSimulationViewportState({
      instanceId: "sim-expanded-viewport",
      viewport: { width: 1040, height: 680 },
      contentBounds: { left: 0, top: 0, right: 900, bottom: 600 },
    })

    const compact = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: compactViewport.instanceId,
        pluginId: "io.ardesia.simulation",
        bounds: simulationViewportPostitBounds(compactViewport, { x: 0, y: 0 }),
        zIndex: 1,
        hovered: true,
        pluginState: { viewport: serializeSimulationViewportState(compactViewport) },
      }),
      viewportFunctions,
    )
    const expanded = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: expandedViewport.instanceId,
        pluginId: "io.ardesia.simulation",
        bounds: simulationViewportPostitBounds(expandedViewport, { x: 400, y: 0 }),
        zIndex: 2,
        proximity: "near",
        pluginState: { viewport: serializeSimulationViewportState(expandedViewport) },
      }),
      viewportFunctions,
    )

    expect(compact).toMatchObject({
      instanceId: "sim-compact-viewport",
      mode: "compact",
      functions: [{ id: "workspace", label: "Fit", role: "primary", priority: 10 }],
    })
    expect(expanded).toMatchObject({
      instanceId: "sim-expanded-viewport",
      mode: "expanded",
      functions: [
        { id: "workspace", label: "Full workspace", role: "workspace", priority: 10 },
      ],
    })
  })

  it("does not introduce mutable global viewport state", () => {
    const source = readFileSync(join(process.cwd(), "sim", "core", "simulationViewport.ts"), "utf8")

    expect(source).not.toMatch(/^\s*let\s+/m)
    expect(source).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(source).not.toMatch(/\bcurrent(Viewport|Runtime|Instance)\b/)
  })
})
