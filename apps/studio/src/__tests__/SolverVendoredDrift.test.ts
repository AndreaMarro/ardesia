// Drift-guard del motore vendored (Fase 2 simulature, confine P2).
// Il CircuitSolver vive canonicamente in plugins/elab-tutor; la copia sotto
// apps/studio/sim/solver DEVE restare byte-identica (pattern repo: cfr. drift
// guard packages/engine vs lessonos, commit 02973e01). Se il plugin evolve il
// motore, questo test fallisce e obbliga un refresh consapevole della copia.
import { describe, expect, it } from "vitest"
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

const VENDORED_PAIRS = [
  {
    canonical: "plugins/elab-tutor/src/components/simulator/engine/CircuitSolver.js",
    vendored: "apps/studio/sim/solver/engine/CircuitSolver.js",
  },
  {
    canonical: "plugins/elab-tutor/src/components/simulator/components/registry.js",
    vendored: "apps/studio/sim/solver/components/registry.js",
  },
] as const

function sha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(path.join(repoRoot, filePath))).digest("hex")
}

describe("solver vendored drift guard", () => {
  it.each(VENDORED_PAIRS)("$vendored è byte-identico alla sorgente canonica", ({ canonical, vendored }) => {
    expect(fs.existsSync(path.join(repoRoot, vendored)), `manca la copia vendored ${vendored}`).toBe(true)
    expect(sha256(vendored)).toBe(sha256(canonical))
  })
})
