import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  derivePluginFunctionSurface,
  type PluginFunctionDescriptor,
} from "../toolhost/pluginFunctions"
import { createPluginPostitObject } from "../toolhost/postitObject"

const simulationFunctions: PluginFunctionDescriptor[] = [
  {
    id: "diagnostics",
    label: "Diagnostics",
    priority: 10,
    surfaces: {
      compact: { label: "Diag", role: "primary" },
      normal: { label: "Diagnostics", role: "primary" },
      expanded: { label: "Provider diagnostics", role: "workspace" },
    },
  },
]

const elabTutorFunctions: PluginFunctionDescriptor[] = [
  {
    id: "manuali",
    label: "Manuali",
    priority: 10,
    surfaces: {
      compact: { label: "Vol", role: "primary" },
      normal: { label: "Manuali", role: "primary" },
      expanded: { label: "Manuali e citazioni", role: "workspace" },
    },
  },
  {
    id: "componenti",
    label: "Componenti",
    priority: 20,
    surfaces: {
      normal: { label: "Componenti", role: "primary" },
      expanded: { label: "Kit componenti", role: "workspace" },
    },
  },
  {
    id: "passo-passo",
    label: "Passo-passo",
    priority: 30,
    surfaces: {
      normal: { label: "Passi", role: "primary" },
      expanded: { label: "Passo-passo", role: "workspace" },
    },
  },
  {
    id: "unlim",
    label: "UNLIM",
    priority: 40,
    surfaces: {
      expanded: { label: "UNLIM", role: "workspace" },
    },
  },
  {
    id: "simulatore",
    label: "Simulatore",
    priority: 50,
    dependencies: {
      pluginIds: ["io.ardesia.simulation"],
      forbiddenImports: ["CircuitSolver", "SimulatorCanvas", "Breadboard"],
    },
    surfaces: {
      compact: { label: "Sim", role: "contextual" },
      normal: { label: "Simulatore", role: "primary" },
      expanded: { label: "Simulatore condiviso", role: "workspace" },
    },
  },
]

describe("Responsive plugin function surfaces", () => {
  it("derives hidden, compact, normal, and expanded presentations from one descriptor", () => {
    const descriptor = simulationFunctions[0]

    const hidden = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "sim-hidden",
        pluginId: "io.ardesia.simulation",
        bounds: { x: 0, y: 0, width: 640, height: 460 },
        zIndex: 1,
        pluginState: {},
      }),
      [descriptor],
    )
    const compact = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "sim-compact",
        pluginId: "io.ardesia.simulation",
        bounds: { x: 0, y: 0, width: 260, height: 180 },
        zIndex: 1,
        hovered: true,
        pluginState: {},
      }),
      [descriptor],
    )
    const normal = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "sim-normal",
        pluginId: "io.ardesia.simulation",
        bounds: { x: 0, y: 0, width: 640, height: 460 },
        zIndex: 1,
        selected: true,
        pluginState: {},
      }),
      [descriptor],
    )
    const expanded = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "sim-expanded",
        pluginId: "io.ardesia.simulation",
        bounds: { x: 0, y: 0, width: 1040, height: 680 },
        zIndex: 1,
        proximity: "near",
        pluginState: {},
      }),
      [descriptor],
    )

    expect(hidden).toMatchObject({ instanceId: "sim-hidden", mode: "hidden", quiet: true, functions: [] })
    expect(compact.functions).toEqual([
      { id: "diagnostics", label: "Diag", role: "primary", priority: 10 },
    ])
    expect(normal.functions).toEqual([
      { id: "diagnostics", label: "Diagnostics", role: "primary", priority: 10 },
    ])
    expect(expanded.functions).toEqual([
      { id: "diagnostics", label: "Provider diagnostics", role: "workspace", priority: 10 },
    ])
  })

  it("reveals contextual actions only for the near or hovered post-it instance", () => {
    const far = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "elab-far",
        pluginId: "io.elab.tutor",
        bounds: { x: 0, y: 0, width: 320, height: 220 },
        zIndex: 1,
        pluginState: {},
      }),
      elabTutorFunctions,
    )
    const near = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "elab-near",
        pluginId: "io.elab.tutor",
        bounds: { x: 360, y: 0, width: 320, height: 220 },
        zIndex: 2,
        proximity: "near",
        pluginState: {},
      }),
      elabTutorFunctions,
    )

    expect(far).toMatchObject({ instanceId: "elab-far", mode: "hidden", quiet: true, functions: [] })
    expect(near).toMatchObject({ instanceId: "elab-near", mode: "compact", quiet: false })
    expect(near.functions.map((fn) => fn.id)).toEqual(["manuali", "simulatore"])
  })

  it("keeps plugin functions as data descriptors, not host switch branches", () => {
    const source = readFileSync(join(process.cwd(), "src", "toolhost", "pluginFunctions.ts"), "utf8")

    expect(source).not.toMatch(/switch\s*\(/)
    expect(source).not.toMatch(/io\.ardesia\.simulation|io\.elab\.tutor/)
    expect(source).not.toMatch(/CircuitSolver|SimulatorCanvas|Breadboard/)
  })

  it("lets ELABTutor declare contextual functions around the shared Simulation Plugin", () => {
    const surface = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "elab-expanded",
        pluginId: "io.elab.tutor",
        bounds: { x: 0, y: 0, width: 980, height: 620 },
        zIndex: 1,
        selected: true,
        pluginState: {},
      }),
      elabTutorFunctions,
    )

    expect(surface.functions.map((fn) => fn.id)).toEqual([
      "manuali",
      "componenti",
      "passo-passo",
      "unlim",
      "simulatore",
    ])
    expect(elabTutorFunctions.find((fn) => fn.id === "simulatore")?.dependencies).toEqual({
      pluginIds: ["io.ardesia.simulation"],
      forbiddenImports: ["CircuitSolver", "SimulatorCanvas", "Breadboard"],
    })
  })

  it("does not introduce mutable globals for per-instance function state", () => {
    const source = readFileSync(join(process.cwd(), "src", "toolhost", "pluginFunctions.ts"), "utf8")

    expect(source).not.toMatch(/^\s*let\s+/m)
    expect(source).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(source).not.toMatch(/\bcurrent(Function|Postit|Instance|Surface)\b/)
  })
})
