// @vitest-environment node

import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

import { describe, expect, it } from "vitest"

import {
  SIMULATION_RUNTIME_API_VERSION,
  SIMULATION_RUNTIME_PLUGIN_ID,
} from "../../sim/core/simulationRuntime"
import {
  deriveSimulationModes,
  finalStepState,
  normalizeScene,
} from "../../sim/simulationSceneModes"
import {
  derivePluginFunctionSurface,
  type PluginFunctionDescriptor,
} from "../toolhost/pluginFunctions"
import { createPluginPostitObject } from "../toolhost/postitObject"
import { createReferenceSimulationScene } from "../toolhost/ToolCanvasEmbeddable"

type RequiredSurface = "compact" | "normal" | "expanded"

type ElabTutorPostitFunction = PluginFunctionDescriptor & {
  capability: string
  dependencies?: PluginFunctionDescriptor["dependencies"] & {
    runtimeApi?: string
    forbiddenImports?: string[]
  }
  projection?: {
    source: "canonical-scene"
    finalStateNormalizesTo: "mounted-scene"
  }
}

type ElabTutorPostitFunctions = {
  schema: "elabtutor-postit-functions/1"
  packId: "io.elab.tutor"
  dependsOn: {
    pluginId: "io.ardesia.simulation"
    runtimeApi: "simulation-runtime/1"
  }
  functions: ElabTutorPostitFunction[]
}

type SourceFile = {
  path: string
  text: string
}

const repoRoot = join(process.cwd(), "..", "..")
const packRoot = join(repoRoot, "packs", "elab-tutor")
const postitFunctionsPath = join(packRoot, "postitFunctions.json")
const requiredFunctionIds = [
  "manuali",
  "componenti",
  "passo-passo",
  "unlim",
  "simulatore",
  "common-mistakes",
  "diagnostics",
]
const requiredSurfaces: RequiredSurface[] = ["compact", "expanded", "normal"]

function readPostitFunctions(): ElabTutorPostitFunctions {
  return JSON.parse(readFileSync(postitFunctionsPath, "utf8")) as ElabTutorPostitFunctions
}

function filesUnder(root: string): SourceFile[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(root, entry.name)
    if (entry.isDirectory()) return filesUnder(entryPath)
    if (!entry.isFile()) return []
    return [{ path: entryPath, text: readFileSync(entryPath, "utf8") }]
  })
}

function matchingFiles(files: SourceFile[], pattern: RegExp): string[] {
  return files
    .filter((file) => pattern.test(file.text))
    .map((file) => relative(process.cwd(), file.path))
}

describe("ELABTutor post-it capabilities", () => {
  it("declares the required contextual functions with compact, normal, and expanded metadata", () => {
    const pack = readPostitFunctions()

    expect(pack).toMatchObject({
      schema: "elabtutor-postit-functions/1",
      packId: "io.elab.tutor",
      dependsOn: {
        pluginId: SIMULATION_RUNTIME_PLUGIN_ID,
        runtimeApi: SIMULATION_RUNTIME_API_VERSION,
      },
    })
    expect(pack.functions.map((fn) => fn.id)).toEqual(requiredFunctionIds)
    for (const fn of pack.functions) {
      expect(fn.capability).toBeTruthy()
      expect(Object.keys(fn.surfaces).sort()).toEqual(requiredSurfaces)
    }
  })

  it("derives ELABTutor surfaces from data descriptors rather than a host switch", () => {
    const pack = readPostitFunctions()
    const surface = derivePluginFunctionSurface(
      createPluginPostitObject({
        instanceId: "elab-capabilities-expanded",
        pluginId: pack.packId,
        bounds: { x: 0, y: 0, width: 980, height: 620 },
        zIndex: 1,
        selected: true,
        pluginState: {},
      }),
      pack.functions,
    )

    expect(surface).toMatchObject({
      instanceId: "elab-capabilities-expanded",
      pluginId: "io.elab.tutor",
      mode: "expanded",
      quiet: false,
    })
    expect(surface.functions.map((fn) => fn.id)).toEqual(requiredFunctionIds)
    expect(surface.functions.every((fn) => fn.role === "workspace")).toBe(true)
  })

  it("depends on the shared simulation runtime for simulator capability only", () => {
    const simulator = readPostitFunctions().functions.find((fn) => fn.id === "simulatore")

    expect(simulator?.dependencies?.pluginIds).toEqual([SIMULATION_RUNTIME_PLUGIN_ID])
    expect(simulator?.dependencies?.runtimeApi).toBe(SIMULATION_RUNTIME_API_VERSION)
    expect(simulator?.dependencies?.forbiddenImports).toEqual([
      "private-solver-runtime",
      "private-canvas-renderer",
      "private-breadboard-geometry",
      "private-placement-engine",
      "private-wire-renderer",
      "private-microcontroller-runtime",
      "private-provider-internals",
    ])
  })

  it("keeps passo-passo projected over the canonical mounted scene", () => {
    const passoPasso = readPostitFunctions().functions.find((fn) => fn.id === "passo-passo")
    const scene = createReferenceSimulationScene()
    const modes = deriveSimulationModes(scene)

    expect(passoPasso?.projection).toEqual({
      source: "canonical-scene",
      finalStateNormalizesTo: "mounted-scene",
    })
    expect(normalizeScene(finalStepState(modes.stepByStep))).toEqual(
      normalizeScene(modes.mounted.scene),
    )
  })

  it("keeps the pack free of private simulator imports and mutable capability state", () => {
    const packFiles = filesUnder(packRoot)
    const postitFunctionsSource = readFileSync(postitFunctionsPath, "utf8")

    expect(
      matchingFiles(
        packFiles,
        /\b(?:from\s+|import\s*\(\s*|require\s*\(\s*)["'][^"']*(?:apps\/studio\/sim|sim\/solver|sim\/providers|components\/simulator|CircuitSolver|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|AVRBridge)[^"']*["']/,
      ),
    ).toEqual([])
    expect(postitFunctionsSource).not.toMatch(/^\s*let\s+/m)
    expect(postitFunctionsSource).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(postitFunctionsSource).not.toMatch(/\bcurrent(Function|Postit|Instance|Surface)\b/)
  })
})
