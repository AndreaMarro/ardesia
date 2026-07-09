// @vitest-environment node
//
// Scena reale v1-cap9-esp6 — "Lampada RGB con 3 potenziometri" (Vol.1
// pp.71-74). Primo esperimento MULTI-PIN con fixture circuit-scene/2:
// potenziometro (3 pin) e LED RGB (4 pin) escono dal fail-closed di bridge e
// renderer. La topologia elettrica è il corpus (experiments-vol1.js, sbloccato
// in #140 con falsificatori); qui la STESSA verità viene rigiudicata sui dati
// della fixture: solve reale, bookConstraints falsificabili, grader on-grid.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { createSimulationAdapterPayloadFromElabScene } from "../../sim/elab/elabSceneAdapter.ts"
import { solveElabExperiment, type SolverExperiment } from "../../sim/solver/elabSolver.ts"
import { validateElabScene, type ElabScene } from "../../sim/elab/elabScene.ts"
import {
  checkBookConstraintsV1Cap9Esp6,
  checkBookConstraintsV1Cap6Esp1,
} from "../../sim/elab/bookConstraints.ts"
import { gradeSceneGeometry, gradeSceneGeometryStrict } from "../../sim/visual/structuralGrader.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function fixtureJson(name: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, "apps/studio/sim/fixtures", name), "utf-8"),
  )
}

function esp6Fixture(): unknown {
  return fixtureJson("elab-scene-v2-candidate-v1cap9esp6.json")
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

type RgbChannel = { on?: boolean; brightness?: number }
type RgbState = { on?: boolean; red?: RgbChannel; green?: RgbChannel; blue?: RgbChannel }

describe("fixture v1-cap9-esp6 — schema e provenance", () => {
  it("valida contro circuit-scene/2: candidate, BOM 3 pot 10k + 3x470 + LED RGB, pp.71-74", () => {
    const scene = validScene(esp6Fixture())
    expect(scene.experimentId).toBe("v1-cap9-esp6")
    expect(scene.provenance.status).toBe("candidate")
    expect(scene.book.pages).toEqual([71, 72, 73, 74])
    expect(scene.board.orientation).toBe("manual-figure-vertical")
    expect(scene.board.pose.rotationDeg).toBe(90)
    expect(scene.components.find((component) => component.id === "bb1")?.pose?.rotationDeg).toBe(90)
    const types = scene.components.map((component) => component.type)
    expect(types.filter((type) => type === "potentiometer").length).toBe(3)
    expect(types.filter((type) => type === "resistor").length).toBe(3)
    expect(types.filter((type) => type === "rgb-led").length).toBe(1)
    for (const pot of scene.components.filter((component) => component.type === "potentiometer")) {
      expect(pot.value).toBe(10000)
    }
    for (const resistor of scene.components.filter((component) => component.type === "resistor")) {
      expect(resistor.value).toBe(470)
    }
  })

  it("i crop pp.71-74 esistono e l'hash della fixture coincide col build finale (p.74)", async () => {
    const scene = validScene(esp6Fixture())
    for (const page of ["071", "072", "073", "074"]) {
      const cropPath = path.join(
        repoRoot,
        `apps/studio/public/elab/manuals/vol1/page-${page}-esercizio-9-6.png`,
      )
      expect(fs.existsSync(cropPath), `crop p.${page} assente`).toBe(true)
    }
    const { createHash } = await import("node:crypto")
    const finalCrop = path.join(
      repoRoot,
      "apps/studio/public/elab/manuals/vol1/page-074-esercizio-9-6.png",
    )
    const hash = createHash("sha256").update(fs.readFileSync(finalCrop)).digest("hex")
    expect(scene.source.sourceImageHash).toBe(hash)
  })

  it("il claim electrical=pass coincide col verdetto calcolato (3 canali accesi)", () => {
    const scene = validScene(esp6Fixture())
    const result = solveElabExperiment(solverExperimentFromScene(esp6Fixture()))
    const rgb = result.componentStates.rgb1 as RgbState
    const computed =
      result.ok &&
      !result.diagnostics.shortCircuit &&
      result.diagnostics.disconnectedPins.length === 0 &&
      rgb.on === true &&
      (["red", "green", "blue"] as const).every(
        (channel) => rgb[channel]?.on === true && (rgb[channel]?.brightness ?? 0) > 0,
      )
        ? "pass"
        : "fail"
    expect(scene.provenance.checks.electrical).toBe(computed)
  })
})

describe("solve reale sui dati della FIXTURE — canali indipendenti falsificabili", () => {
  it("3 canali accesi con brightness reali (wiper a metà corsa)", () => {
    const result = solveElabExperiment(solverExperimentFromScene(esp6Fixture()))
    expect(result.ok).toBe(true)
    expect(result.diagnostics.shortCircuit).toBe(false)
    expect(result.diagnostics.disconnectedPins).toEqual([])
    const rgb = result.componentStates.rgb1 as RgbState
    for (const channel of ["red", "green", "blue"] as const) {
      expect(rgb[channel]?.on, channel).toBe(true)
      expect(rgb[channel]?.brightness ?? 0, channel).toBeGreaterThan(0)
    }
  })

  it("FALSIFICA: gamba blu staccata → SOLO il blu si spegne", () => {
    const experiment = solverExperimentFromScene(esp6Fixture())
    const pins = { ...experiment.pinAssignments }
    expect(pins["rgb1:blue"]).toBeTruthy()
    delete pins["rgb1:blue"]
    const result = solveElabExperiment({ ...experiment, pinAssignments: pins })
    const rgb = result.componentStates.rgb1 as RgbState
    expect(rgb.blue?.brightness ?? 0).toBe(0)
    expect(rgb.red?.on).toBe(true)
    expect(rgb.green?.on).toBe(true)
  })

  it("FALSIFICA: common staccato → TUTTI i canali si spengono", () => {
    const experiment = solverExperimentFromScene(esp6Fixture())
    const pins = { ...experiment.pinAssignments }
    delete pins["rgb1:common"]
    const result = solveElabExperiment({ ...experiment, pinAssignments: pins })
    const rgb = result.componentStates.rgb1 as RgbState
    for (const channel of ["red", "green", "blue"] as const) {
      expect(rgb[channel]?.brightness ?? 0, channel).toBe(0)
    }
  })
})

describe("bookConstraints pp.71-74 — verdetto calcolato e falsificabile", () => {
  it("la fixture esp6 passa G1-G7 e ogni vincolo cita Vol.1", () => {
    const report = checkBookConstraintsV1Cap9Esp6(validScene(esp6Fixture()))
    expect(report.ok, JSON.stringify(report.results, null, 1)).toBe(true)
    expect(report.results.length).toBe(7)
    for (const result of report.results) {
      expect(result.bookRef).toContain("Vol.1")
    }
  })

  it("il claim bookMatch della fixture coincide col verdetto calcolato", () => {
    const scene = validScene(esp6Fixture())
    const report = checkBookConstraintsV1Cap9Esp6(scene)
    expect(scene.provenance.checks.bookMatch).toBe(report.ok ? "pass" : "fail")
  })

  it("FALSIFICA la scena esp1: BOM diversa (niente pot/RGB)", () => {
    const report = checkBookConstraintsV1Cap9Esp6(
      validScene(fixtureJson("elab-scene-v2-candidate-v1cap6esp1.json")),
    )
    const bom = report.results.find((result) => result.id === "bom-matches-book")
    expect(bom?.ok).toBe(false)
  })

  it("FALSIFICA un resistore 220 al posto di 470: la BOM del libro scatta", () => {
    const scene = validScene(esp6Fixture())
    const tampered = {
      ...scene,
      components: scene.components.map((component) =>
        component.id === "r2" ? { ...component, value: 220 } : component,
      ),
    }
    const report = checkBookConstraintsV1Cap9Esp6(tampered)
    const bom = report.results.find((result) => result.id === "bom-matches-book")
    expect(bom?.ok).toBe(false)
  })

  it("FALSIFICA il filo del common rimosso: 'catodo al negativo' (p.72) fallisce", () => {
    const scene = validScene(esp6Fixture())
    const tampered = {
      ...scene,
      wires: scene.wires.filter(
        (wire) => !(wire.from === "bb1:a28" || wire.to === "bb1:a28"),
      ),
    }
    const report = checkBookConstraintsV1Cap9Esp6(tampered)
    const common = report.results.find((result) => result.id === "rgb-common-to-battery-negative")
    expect(common?.ok).toBe(false)
  })

  it("FALSIFICA il vecchio fallback orizzontale: la figura p.74 richiede breadboard verticale", () => {
    const scene = validScene(esp6Fixture())
    const tampered = {
      ...scene,
      board: {
        ...scene.board,
        orientation: "elab-volume" as const,
        pose: { ...scene.board.pose, rotationDeg: 0 },
      },
      components: scene.components.map((component) =>
        component.id === "bb1"
          ? { ...component, pose: { ...component.pose!, rotationDeg: 0 } }
          : component,
      ),
    }
    const report = checkBookConstraintsV1Cap9Esp6(tampered)
    const orientation = report.results.find((result) => result.id === "manual-breadboard-vertical")
    expect(orientation?.ok).toBe(false)
  })

  it("controprova incrociata: esp6 NON passa i vincoli C1-C5 di esp1", () => {
    const report = checkBookConstraintsV1Cap6Esp1(validScene(esp6Fixture()))
    expect(report.ok).toBe(false)
  })
})

describe("grader strutturale — geometria multi-pin sulla griglia reale", () => {
  it("pose (centroide 3-4 pin) e wire.path autorati coincidono con la griglia", () => {
    const grade = gradeSceneGeometry(validScene(esp6Fixture()))
    expect(grade.onGrid).toBe(true)
    expect(grade.wireEndpointErrorPx).toBeLessThanOrEqual(0.5)
    expect(grade.componentPoseErrorPx).toBeLessThanOrEqual(0.5)
  })

  it("severo: copertura completa — 16 wire con path, 7 componenti con pose su griglia", () => {
    const strict = gradeSceneGeometryStrict(validScene(esp6Fixture()))
    expect(strict.strictOnGrid).toBe(true)
    expect(strict.uncoveredWires).toEqual([])
    expect(strict.unposedComponents).toEqual([])
  })
})
