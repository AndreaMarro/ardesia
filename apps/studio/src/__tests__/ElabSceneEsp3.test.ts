// @vitest-environment node
//
// Scena reale v1-cap6-esp3 — "Cambia luminosità con resistenze diverse"
// (Vol.1 p.33). La metrica del libro è FALSIFICABILE sul motore reale:
// I(220Ω) > I(470Ω) > I(1kΩ) — con un resistore più basso passa più corrente.
//
// ⚠️ GATE-ANDREA D4-2 (caratterizzato qui, non mascherato): il motore brucia
// il LED verde a 220Ω (30.9 mA > soglia burn 30 mA) e a 100Ω (68 mA), mentre
// il libro presenta 220Ω come "più luminoso" e 100Ω come pavimento sicuro.
// La fixture dichiara electrical="unknown" (blocked-by-gate). Quando la
// tabella del motore cambierà, il test di caratterizzazione qui sotto DEVE
// rompersi e forzare l'aggiornamento di fixture + matrice.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { createSimulationAdapterPayloadFromElabScene } from "../../sim/elab/elabSceneAdapter.ts"
import { solveElabExperiment, type SolverExperiment } from "../../sim/solver/elabSolver.ts"
import { validateElabScene, type ElabScene } from "../../sim/elab/elabScene.ts"
import {
  checkBookConstraintsV1Cap6Esp3,
  checkBookConstraintsV1Cap6Esp2,
} from "../../sim/elab/bookConstraints.ts"
import { gradeSceneGeometry } from "../../sim/visual/structuralGrader.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function fixtureJson(name: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, "apps/studio/sim/fixtures", name), "utf-8"),
  )
}

function esp3Fixture(): unknown {
  return fixtureJson("elab-scene-v2-candidate-v1cap6esp3.json")
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

/** La scena canonica con il resistore sostituito (il gesto del libro p.33). */
function withResistor(ohms: number): SolverExperiment {
  const base = solverExperimentFromScene(esp3Fixture())
  return {
    ...base,
    components: base.components.map((component) =>
      component.id === "r1" ? { ...component, value: ohms } : component,
    ),
  }
}

describe("fixture v1-cap6-esp3 — schema e provenance", () => {
  it("valida contro circuit-scene/2: candidate, LED verde, resistore 220, p.33", () => {
    const scene = validScene(esp3Fixture())
    expect(scene.experimentId).toBe("v1-cap6-esp3")
    expect(scene.provenance.status).toBe("candidate")
    expect(scene.book.pages).toEqual([33])
    const led = scene.components.find((component) => component.type === "led")
    const resistor = scene.components.find((component) => component.type === "resistor")
    expect(led?.color).toBe("green")
    expect(resistor?.value).toBe(220)
  })

  it("il crop p.33 esiste e l'hash della fixture coincide", async () => {
    const scene = validScene(esp3Fixture())
    const cropPath = path.join(
      repoRoot,
      "apps/studio/public/elab/manuals/vol1/page-033-esercizio-6-3.png",
    )
    expect(fs.existsSync(cropPath)).toBe(true)
    const { createHash } = await import("node:crypto")
    const hash = createHash("sha256").update(fs.readFileSync(cropPath)).digest("hex")
    expect(scene.source.sourceImageHash).toBe(hash)
  })

  it("electrical è dichiarato UNKNOWN (blocked-by-gate D4-2), mai auto-asserito pass", () => {
    const scene = validScene(esp3Fixture())
    expect(scene.provenance.checks.electrical).toBe("unknown")
    expect(scene.provenance.sourceRef).toContain("GATE-ANDREA D4-2")
  })
})

describe("metrica del libro: resistenza più bassa ⇒ più corrente (falsificabile)", () => {
  it("I(220) > I(470) > I(1k) sul motore reale, con i valori attesi", () => {
    const i220 = solveElabExperiment(withResistor(220)).currents.led1
    const i470 = solveElabExperiment(withResistor(470)).currents.led1
    const i1k = solveElabExperiment(withResistor(1000)).currents.led1
    expect(i220).toBeGreaterThan(i470)
    expect(i470).toBeGreaterThan(i1k)
    // Valori dalla legge di Ohm con Vf verde 2.2 (tabella motore):
    expect(i220).toBeCloseTo(0.0309, 3)
    expect(i470).toBeCloseTo(0.0145, 3)
    expect(i1k).toBeCloseTo(0.0068, 3)
  })

  it("a 470 e 1k il LED è acceso e sano; a 1k la luminosità è minore che a 470", () => {
    const r470 = solveElabExperiment(withResistor(470))
    const r1k = solveElabExperiment(withResistor(1000))
    const led470 = r470.componentStates.led1 as { on?: boolean; burned?: boolean; brightness?: number }
    const led1k = r1k.componentStates.led1 as { on?: boolean; burned?: boolean; brightness?: number }
    expect(led470.on).toBe(true)
    expect(led470.burned).toBe(false)
    expect(led1k.on).toBe(true)
    expect(led1k.burned).toBe(false)
    expect(led470.brightness ?? 0).toBeGreaterThan(led1k.brightness ?? 0)
  })
})

describe("GATE-ANDREA D4-2 — conflitto tabella motore ↔ libro (caratterizzazione)", () => {
  it("OGGI il motore brucia il LED verde a 220Ω (30.9mA > soglia 30mA) mentre il libro dice 'più luminoso'", () => {
    // ⚠️ Questo test CARATTERIZZA il conflitto aperto: se si rompe, la
    // tabella del motore è cambiata (decisione Andrea) → aggiornare fixture
    // (electrical unknown→calcolato), matrice e questo file.
    const result = solveElabExperiment(withResistor(220))
    const led = result.componentStates.led1 as { on?: boolean; burned?: boolean }
    expect(result.currents.led1).toBeCloseTo(0.0309, 3)
    expect(led.burned).toBe(true)
  })

  it("OGGI il motore brucia anche a 100Ω, il pavimento di sicurezza del libro (68mA)", () => {
    const result = solveElabExperiment(withResistor(100))
    const led = result.componentStates.led1 as { burned?: boolean }
    expect(result.currents.led1).toBeCloseTo(0.068, 3)
    expect(led.burned).toBe(true)
  })
})

describe("bookConstraints p.33 — verdetto calcolato e falsificabile", () => {
  it("la fixture esp3 passa F1-F6 e ogni vincolo cita p.33", () => {
    const report = checkBookConstraintsV1Cap6Esp3(validScene(esp3Fixture()))
    expect(report.ok).toBe(true)
    expect(report.results.length).toBe(6)
    for (const result of report.results) {
      expect(result.bookRef).toContain("Vol.1 pag.33")
    }
  })

  it("il claim bookMatch della fixture coincide col verdetto calcolato", () => {
    const scene = validScene(esp3Fixture())
    const report = checkBookConstraintsV1Cap6Esp3(scene)
    expect(scene.provenance.checks.bookMatch).toBe(report.ok ? "pass" : "fail")
  })

  it("FALSIFICA la scena esp1 (470Ω): F5 fallisce (la figura 1 vuole 220)", () => {
    const report = checkBookConstraintsV1Cap6Esp3(
      validScene(fixtureJson("elab-scene-v2-candidate-v1cap6esp1.json")),
    )
    const f5 = report.results.find((result) => result.id === "bom-canonical-220")
    expect(f5?.ok).toBe(false)
  })

  it("FALSIFICA 90Ω: la guardia 'mai sotto 100 Ohm' del libro scatta", () => {
    const scene = validScene(esp3Fixture())
    const under = {
      ...scene,
      components: scene.components.map((component) =>
        component.id === "r1" ? { ...component, value: 90 } : component,
      ),
    }
    const report = checkBookConstraintsV1Cap6Esp3(under)
    const f6 = report.results.find((result) => result.id === "resistor-not-below-100-ohm")
    expect(f6?.ok).toBe(false)
  })

  it("controprova incrociata: esp3 NON passa i vincoli di esp2 (qui il resistore c'è)", () => {
    const report = checkBookConstraintsV1Cap6Esp2(validScene(esp3Fixture()))
    expect(report.ok).toBe(false)
  })
})

describe("grader strutturale — geometria esp3 sulla griglia reale", () => {
  it("pose e wire.path autorati coincidono con la griglia (onGrid)", () => {
    const grade = gradeSceneGeometry(validScene(esp3Fixture()))
    expect(grade.onGrid).toBe(true)
    expect(grade.wireEndpointErrorPx).toBeLessThanOrEqual(0.5)
    expect(grade.componentPoseErrorPx).toBeLessThanOrEqual(0.5)
    expect(grade.visualOverlayScore).toBeNull()
  })
})
