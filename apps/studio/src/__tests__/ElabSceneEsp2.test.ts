// @vitest-environment node
//
// Scena reale v1-cap6-esp2 — "LED senza resistore (cosa NON fare!)" (Vol.1
// p.32). L'esperimento è una dimostrazione d'errore: il solve onesto NON è
// "LED acceso", è "LED bruciato per sovracorrente" — esattamente ciò che il
// libro insegna. Ogni claim della fixture è ricalcolato, mai auto-asserito.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { createSimulationAdapterPayloadFromElabScene } from "../../sim/elab/elabSceneAdapter.ts"
import { solveElabExperiment, type SolverExperiment } from "../../sim/solver/elabSolver.ts"
import { validateElabScene, type ElabScene } from "../../sim/elab/elabScene.ts"
import {
  checkBookConstraintsV1Cap6Esp2,
  checkBookConstraintsV1Cap6Esp1,
} from "../../sim/elab/bookConstraints.ts"
import { gradeSceneGeometry } from "../../sim/visual/structuralGrader.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function fixtureJson(name: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, "apps/studio/sim/fixtures", name), "utf-8"),
  )
}

function esp2Fixture(): unknown {
  return fixtureJson("elab-scene-v2-candidate-v1cap6esp2.json")
}

function esp1Fixture(): unknown {
  return fixtureJson("elab-scene-v2-candidate-v1cap6esp1.json")
}

function validScene(input: unknown): ElabScene {
  const result = validateElabScene(input)
  if (!result.ok) throw new Error(`fixture invalid: ${JSON.stringify(result)}`)
  return result.scene
}

function solverExperimentFromScene(scene: unknown): SolverExperiment {
  const payload = createSimulationAdapterPayloadFromElabScene(scene)
  return {
    components: payload.circuit.components.map((component) => ({
      id: component.id,
      type: component.type,
      ...(typeof component.value === "number" ? { value: component.value } : {}),
      ...(component.color !== undefined ? { color: component.color } : {}),
    })),
    connections: payload.circuit.wires.map((wire) => ({
      from: wire.from,
      to: wire.to,
      color: wire.color,
    })),
    pinAssignments: payload.circuit.pinAssignments,
  }
}

describe("fixture v1-cap6-esp2 — schema e provenance", () => {
  it("valida contro circuit-scene/2 con status candidate e visualMatch unknown", () => {
    const scene = validScene(esp2Fixture())
    expect(scene.experimentId).toBe("v1-cap6-esp2")
    expect(scene.provenance.status).toBe("candidate")
    expect(scene.provenance.checks.visualMatch).toBe("unknown")
    expect(scene.book.pages).toEqual([32])
  })

  it("il crop dichiarato esiste su disco e l'hash della fixture coincide (provenance reale)", async () => {
    const scene = validScene(esp2Fixture())
    const cropPath = path.join(
      repoRoot,
      "apps/studio/public/elab/manuals/vol1/page-032-esercizio-6-2.png",
    )
    expect(fs.existsSync(cropPath)).toBe(true)
    const { createHash } = await import("node:crypto")
    const hash = createHash("sha256").update(fs.readFileSync(cropPath)).digest("hex")
    expect(scene.source.sourceImageHash).toBe(hash)
  })

  it("la scena NON contiene resistori e ha wire.path autorati per tutti i fili", () => {
    const scene = validScene(esp2Fixture())
    expect(scene.components.filter((component) => component.type === "resistor")).toEqual([])
    for (const wire of scene.wires) {
      expect(wire.path, `wire ${wire.id} senza path autorato`).toBeDefined()
      expect(wire.path?.points.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe("electrical calcolato — il LED si brucia come dice il libro (p.32)", () => {
  it("senza resistore: sovracorrente, LED bruciato e spento", () => {
    const result = solveElabExperiment(solverExperimentFromScene(esp2Fixture()))
    expect(result.ok).toBe(true)
    expect(result.diagnostics.shortCircuit).toBe(false)
    expect(result.diagnostics.disconnectedPins).toEqual([])
    const led = result.componentStates.led1 as { on?: boolean; burned?: boolean }
    expect(led?.burned).toBe(true)
    expect(led?.on).toBe(false)
    // Corrente ben oltre la soglia di burn (30 mA) — non un generico "off".
    expect(result.currents.led1).toBeGreaterThan(0.03)
  })

  it("il claim electrical della fixture coincide col verdetto calcolato (drift-guard)", () => {
    const scene = validScene(esp2Fixture())
    const result = solveElabExperiment(solverExperimentFromScene(esp2Fixture()))
    const led = result.componentStates.led1 as { on?: boolean; burned?: boolean }
    // "pass" per esp2 = la scena riproduce l'errore del libro: LED bruciato.
    const computed =
      result.ok && !result.diagnostics.shortCircuit && led?.burned === true ? "pass" : "fail"
    expect(scene.provenance.checks.electrical).toBe(computed)
  })

  it("CONTROFATTUALE: con un resistore 470 Ohm al posto del filo diretto il LED si accende sano", () => {
    const base = solverExperimentFromScene(esp2Fixture())
    const withResistor: SolverExperiment = {
      components: [...base.components, { id: "r1", type: "resistor", value: 470 }],
      // Il filo diretto rail→strip anodo viene sostituito dal resistore.
      connections: base.connections.filter(
        (connection) => connection.from !== "bb1:bus-top-plus-9",
      ),
      pinAssignments: {
        ...base.pinAssignments,
        "r1:pin1": "bb1:bus-top-plus-9",
        "r1:pin2": "bb1:i9",
      },
    }
    const result = solveElabExperiment(withResistor)
    const led = result.componentStates.led1 as { on?: boolean; burned?: boolean }
    expect(led?.burned).toBe(false)
    expect(led?.on).toBe(true)
    // LED blu Vf 3.0 (tabella motore): (9-3)/470 ≈ 12.8 mA.
    expect(result.currents.led1).toBeCloseTo(0.0128, 3)
  })

  it("FALSIFICA il circuito aperto: senza il filo del negativo niente corrente, niente burn", () => {
    const scene = validScene(esp2Fixture())
    const open = { ...scene, wires: scene.wires.filter((wire) => wire.id !== "w3") }
    const result = solveElabExperiment(solverExperimentFromScene(open))
    const led = result.componentStates.led1 as { on?: boolean; burned?: boolean }
    expect(led?.burned ?? false).toBe(false)
    expect(result.currents.led1 ?? 0).toBe(0)
  })
})

describe("bookConstraints p.32 — verdetto calcolato e falsificabile", () => {
  it("la fixture esp2 passa tutti i vincoli E1-E5 e ogni vincolo cita p.32", () => {
    const report = checkBookConstraintsV1Cap6Esp2(validScene(esp2Fixture()))
    expect(report.ok).toBe(true)
    expect(report.results.length).toBe(5)
    for (const result of report.results) {
      expect(result.bookRef).toContain("Vol.1 pag.32")
    }
  })

  it("il claim bookMatch della fixture coincide col verdetto calcolato (drift-guard)", () => {
    const scene = validScene(esp2Fixture())
    const report = checkBookConstraintsV1Cap6Esp2(scene)
    expect(scene.provenance.checks.bookMatch).toBe(report.ok ? "pass" : "fail")
  })

  it("FALSIFICA la scena esp1 (col resistore): E2 ed E5 falliscono", () => {
    const report = checkBookConstraintsV1Cap6Esp2(validScene(esp1Fixture()))
    expect(report.ok).toBe(false)
    const failed = report.results.filter((result) => !result.ok).map((result) => result.id)
    expect(failed).toContain("led-direct-to-battery-no-resistor")
    expect(failed).toContain("bom-demo-no-resistor")
  })

  it("FALSIFICA il filo diretto rimosso: E2 fallisce (niente percorso diretto)", () => {
    const scene = validScene(esp2Fixture())
    const noDirect = { ...scene, wires: scene.wires.filter((wire) => wire.id !== "w2") }
    const report = checkBookConstraintsV1Cap6Esp2(noDirect)
    const e2 = report.results.find((result) => result.id === "led-direct-to-battery-no-resistor")
    expect(e2?.ok).toBe(false)
  })

  it("FALSIFICA il LED tutto da un lato del canale: E3 fallisce", () => {
    const scene = validScene(esp2Fixture())
    const sameSide = {
      ...scene,
      pinAssignments: {
        "led1:anode": "bb1:f9",
        "led1:cathode": "bb1:g10",
      },
    }
    const report = checkBookConstraintsV1Cap6Esp2(sameSide)
    const e3 = report.results.find((result) => result.id === "led-straddles-central-channel")
    expect(e3?.ok).toBe(false)
  })

  it("controprova incrociata: esp2 NON passa i vincoli di esp1 (manca il resistore)", () => {
    const report = checkBookConstraintsV1Cap6Esp1(validScene(esp2Fixture()))
    expect(report.ok).toBe(false)
  })
})

describe("grader strutturale — geometria esp2 sulla griglia reale", () => {
  it("pose e wire.path autorati coincidono con la griglia (errore ~0, onGrid)", () => {
    const grade = gradeSceneGeometry(validScene(esp2Fixture()))
    expect(grade.onGrid).toBe(true)
    expect(grade.wireEndpointErrorPx).toBeLessThanOrEqual(0.5)
    expect(grade.componentPoseErrorPx).toBeLessThanOrEqual(0.5)
    // Il grader non promuove: overlay assente, visualMatch resta unknown.
    expect(grade.visualOverlayScore).toBeNull()
  })

  it("FALSIFICA una path corrotta di 3px: fuori griglia", () => {
    const scene = validScene(esp2Fixture())
    const corrupted = {
      ...scene,
      wires: scene.wires.map((wire) =>
        wire.id === "w2"
          ? {
              ...wire,
              path: {
                kind: "polyline" as const,
                points: wire.path!.points.map((point, index) =>
                  index === wire.path!.points.length - 1
                    ? { x: point.x + 3, y: point.y }
                    : point,
                ),
              },
            }
          : wire,
      ),
    }
    const grade = gradeSceneGeometry(corrupted)
    expect(grade.onGrid).toBe(false)
  })
})
