import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  createPluginPostitObject,
  deriveFunctionSurfaceMode,
  restorePluginPostitObject,
  resizePluginPostitObject,
  serializePluginPostitObject,
  updatePluginPostitState,
  type PluginPostitObject,
} from "../toolhost/postitObject"

describe("PluginPostitObject", () => {
  it("mounts two instances of the same plugin with independent ids and state", () => {
    const seedState = { sceneId: "same-scene", components: ["led"] }
    const first = createPluginPostitObject({
      instanceId: "sim-a",
      pluginId: "io.ardesia.simulation",
      bounds: { x: 40, y: 60, width: 520, height: 360 },
      zIndex: 3,
      pluginState: seedState,
    })
    const second = createPluginPostitObject({
      instanceId: "sim-b",
      pluginId: "io.ardesia.simulation",
      bounds: { x: 620, y: 60, width: 520, height: 360 },
      zIndex: 4,
      pluginState: seedState,
    })

    seedState.components.push("mutated-outside")
    const changedFirst = updatePluginPostitState(first, {
      sceneId: "same-scene",
      components: ["led", "resistor"],
    })

    expect(first.instanceId).toBe("sim-a")
    expect(second.instanceId).toBe("sim-b")
    expect(first.pluginId).toBe(second.pluginId)
    expect(first.pluginState).toEqual({ sceneId: "same-scene", components: ["led"] })
    expect(second.pluginState).toEqual({ sceneId: "same-scene", components: ["led"] })
    expect(changedFirst.pluginState).toEqual({ sceneId: "same-scene", components: ["led", "resistor"] })
    expect(second.pluginState).toEqual({ sceneId: "same-scene", components: ["led"] })
  })

  it("round-trips bounds, z-order, selection, hover, proximity, and serialized plugin state", () => {
    const postit = createPluginPostitObject({
      instanceId: "elab-note-1",
      pluginId: "io.elab.tutor",
      bounds: { x: -120, y: 320, width: 760, height: 460 },
      zIndex: 12,
      selected: true,
      hovered: true,
      proximity: "near",
      pluginState: {
        currentFunction: "passo-passo",
        nested: { step: 2 },
      },
    })

    const serialized = serializePluginPostitObject(postit)
    const restored = restorePluginPostitObject(serialized)

    expect(restored).toEqual({
      kind: "plugin-postit-object",
      instanceId: "elab-note-1",
      pluginId: "io.elab.tutor",
      bounds: { x: -120, y: 320, width: 760, height: 460 },
      zIndex: 12,
      selected: true,
      hovered: true,
      proximity: "near",
      pluginState: {
        currentFunction: "passo-passo",
        nested: { step: 2 },
      },
    })
    expect(restored).not.toBe(postit)
    expect(restored.bounds).not.toBe(postit.bounds)
    expect(restored.pluginState).not.toBe(postit.pluginState)
  })

  it("rejects malformed serialized post-it payloads fail-closed", () => {
    const serialized = serializePluginPostitObject(
      createPluginPostitObject({
        instanceId: "valid-postit",
        pluginId: "io.ardesia.simulation",
        bounds: { x: 0, y: 0, width: 320, height: 240 },
        zIndex: 1,
        pluginState: {},
      }),
    )

    expect(() => restorePluginPostitObject({ ...serialized, instanceId: "../escape" })).toThrow("invalid instance id")
    expect(() => restorePluginPostitObject({ ...serialized, bounds: { ...serialized.bounds, width: 0 } })).toThrow(
      "bounds width and height must be positive",
    )
    expect(() => restorePluginPostitObject({ ...serialized, proximity: "touching" })).toThrow("invalid proximity")
  })

  it("resizes without hardcoded domain dimensions or state loss", () => {
    const postit = createPluginPostitObject({
      instanceId: "free-size-1",
      pluginId: "io.any.plugin",
      bounds: { x: 0, y: 0, width: 320, height: 220 },
      zIndex: 1,
      pluginState: { persisted: true },
    })

    const resized = resizePluginPostitObject(postit, { width: 1337, height: 911 })

    expect(resized.bounds).toEqual({ x: 0, y: 0, width: 1337, height: 911 })
    expect(resized.pluginState).toEqual({ persisted: true })
    expect(resized.instanceId).toBe(postit.instanceId)
    expect(resized.pluginId).toBe(postit.pluginId)
  })

  it("derives hidden, compact, normal, and expanded function surfaces from size and proximity", () => {
    const base: PluginPostitObject = createPluginPostitObject({
      instanceId: "same-geometry",
      pluginId: "io.ardesia.simulation",
      bounds: { x: 0, y: 0, width: 600, height: 420 },
      zIndex: 1,
      proximity: "far",
      pluginState: {},
    })

    expect(deriveFunctionSurfaceMode(base)).toBe("hidden")
    expect(deriveFunctionSurfaceMode({ ...base, hovered: true, bounds: { ...base.bounds, width: 260, height: 180 } })).toBe("compact")
    expect(deriveFunctionSurfaceMode({ ...base, selected: true })).toBe("normal")
    expect(deriveFunctionSurfaceMode({ ...base, proximity: "near", bounds: { ...base.bounds, width: 980, height: 620 } })).toBe("expanded")
    expect(
      deriveFunctionSurfaceMode({
        ...base,
        pluginId: "io.elab.tutor",
        selected: true,
      }),
    ).toBe("normal")
  })

  it("keeps the generic post-it model free from simulator or ELABTutor branches", () => {
    const source = readFileSync(join(process.cwd(), "src", "toolhost", "postitObject.ts"), "utf8")

    expect(source).not.toContain("io.ardesia.simulation")
    expect(source).not.toContain("io.elab.tutor")
    expect(source).not.toMatch(/Simulation|ELABTutor|CircuitSolver|breadboard/)
  })
})
