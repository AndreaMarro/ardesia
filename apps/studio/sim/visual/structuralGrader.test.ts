// visualMatch — grader STRUTTURALE no-dep (canon §4/§8): incrocia la geometria
// pixel autorata (component.pose, wire.path) con i ref topologici
// (pinAssignments, wire.from/to) via il modello griglia
// `pointForBreadboardRef`. Misura px-error REALI senza CV e senza nuove dip.
// visualOverlayScore (overlay sul crop del libro) resta NON calcolabile
// no-dep → null; visualMatch resta "unknown" (serve CV+GT+gate umano).
import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { validateElabScene } from "../elab/elabScene"
import { gradeSceneGeometry, STRUCTURAL_GRADE_TOLERANCE_PX } from "./structuralGrader"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function candidateFixture(): unknown {
  return JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json"),
      "utf-8",
    ),
  )
}

function parsedFixture() {
  const result = validateElabScene(candidateFixture())
  if (!result.ok) throw new Error(`fixture non valida: ${JSON.stringify(result.errors)}`)
  return result.scene
}

describe("structuralGrader — visualMatch no-dep", () => {
  it("scena hand-authored: pose e path autorati coincidono con la griglia (px-error ~0)", () => {
    const report = gradeSceneGeometry(parsedFixture())

    // La fixture verified-in-spirito è autorata sulla griglia: gli errori
    // strutturali sono nulli entro la tolleranza tarata su di essa.
    expect(report.wireEndpointErrorPx).toBeLessThanOrEqual(STRUCTURAL_GRADE_TOLERANCE_PX)
    expect(report.componentPoseErrorPx).toBeLessThanOrEqual(STRUCTURAL_GRADE_TOLERANCE_PX)
    expect(report.onGrid).toBe(true)

    // Ha misurato qualcosa: almeno un wire-endpoint e un componente su griglia.
    expect(report.checkedWireEndpoints).toBeGreaterThan(0)
    expect(report.checkedComponentPoses).toBeGreaterThan(0)

    // Onestà: overlay sul crop del libro NON calcolabile no-dep → null,
    // visualMatch resta unknown (nessuna promozione automatica).
    expect(report.visualOverlayScore).toBeNull()
    expect(report.visualMatch).toBe("unknown")
  })

  it("path corrotta di 3px: il grader la flagga (falsificabile)", () => {
    const scene = parsedFixture()
    const corrupted = {
      ...scene,
      wires: scene.wires.map((wire, index) => {
        if (index !== 0 || wire.path === undefined) return wire
        const points = wire.path.points.map((point) => ({ ...point }))
        const last = points[points.length - 1]!
        last.x += 3
        return { ...wire, path: { ...wire.path, points } }
      }),
    }

    const report = gradeSceneGeometry(corrupted)
    expect(report.wireEndpointErrorPx).toBeGreaterThan(STRUCTURAL_GRADE_TOLERANCE_PX)
    expect(report.onGrid).toBe(false)
  })

  it("endpoint internal-net (bat1:negative) non è un foro griglia: viene saltato onestamente", () => {
    // w2 va da bat1:negative (internal-net) a bb1:a9 (foro): solo il lato foro
    // è controllabile. Il grader non deve inventare una griglia per il lato
    // batteria ne' contarlo come errore.
    const scene = parsedFixture()
    const report = gradeSceneGeometry(scene)
    // 2 wire, ciascuno con UN solo endpoint-foro controllabile (l'altro è
    // internal-net sul lato batteria) → 2 endpoint controllati, non 4.
    expect(report.checkedWireEndpoints).toBe(2)
  })
})
