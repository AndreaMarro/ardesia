// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const packRoot = path.join(repoRoot, "packs/elab-tutor")
const manifestPath = path.join(packRoot, "manifest.json")

type ElabTutorPackManifest = {
  kind?: string
  id?: string
  version?: string
  dependencies?: { plugins?: Record<string, string> }
}

function readManifest(): ElabTutorPackManifest {
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as ElabTutorPackManifest
}

function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full))
    else if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) out.push(full)
  }
  return out
}

describe("ELABTutor pack boundary", () => {
  it("declares itself as io.elab.tutor pack depending on Simulation Plugin v2", () => {
    const manifest = readManifest()
    expect(manifest.kind).toBe("pack")
    expect(manifest.id).toBe("io.elab.tutor")
    expect(manifest.version).toBe("0.1.0")
    expect(manifest.dependencies?.plugins?.["io.ardesia.simulation"]).toBe(">=2.0.0")
  })

  it("pack data does not import or embed solver/renderer implementation", () => {
    const forbidden = [
      "CircuitSolver",
      "AVRBridge",
      "ToolCanvasEmbeddable",
      "simulationBreadboard",
      "elabSolver",
      "SimulatorCanvas",
      "NewElabSimulator",
    ]
    const violations: string[] = []
    for (const file of walkFiles(packRoot)) {
      const source = fs.readFileSync(file, "utf-8")
      for (const token of forbidden) {
        if (source.includes(token)) {
          violations.push(`${path.relative(repoRoot, file)} contains ${token}`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})
