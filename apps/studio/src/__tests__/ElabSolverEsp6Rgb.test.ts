// @vitest-environment node
//
// v1-cap9-esp6 "Lampada RGB con 3 potenziometri" — sblocco multi-pin del
// catalogo host (NOTTE-13): il motore vendored supportava già potentiometer
// (_solvePotentiometer, dynamic supply del wiper) e rgb-led (_solveRGBLed,
// 3 canali verso common), era il catalogo studio a negarli (deny-by-default).
// Qui il solve dell'esperimento REALE del corpus diventa falsificabile:
// 3 canali accesi e INDIPENDENTI (staccare un canale spegne solo quello).
//
// Stato onesto: questo è il livello SOLVE (mounted in ElabLab via URL).
// La scena circuit-scene/2 (pose/path dalle figure pp.71-74) è il prossimo
// passo dichiarato in matrice — nessun claim di parità visiva qui.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import vm from "node:vm"
import { solveElabExperiment, type SolverExperiment } from "../../sim/solver/elabSolver.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

type RgbChannel = { on?: boolean; brightness?: number }
type RgbState = { on?: boolean; red?: RgbChannel; green?: RgbChannel; blue?: RgbChannel }

function esp6Experiment(): SolverExperiment & { connections: Array<{ from: string; to: string; color?: string }> } {
  let src = fs.readFileSync(
    path.join(repoRoot, "plugins/elab-tutor/src/data/experiments-vol1.js"),
    "utf-8",
  )
  src = src
    .replace(/export const /g, "const ")
    .replace(/export default[\s\S]*?;?\s*$/m, "")
    .replace(/export \{[\s\S]*?\};?\s*$/m, "")
  const context: { result?: Array<Record<string, unknown>> } = {}
  vm.runInNewContext(`${src}\nresult = EXPERIMENTS_VOL1.experiments;`, context)
  const experiment = context.result!.find((entry) => entry.id === "v1-cap9-esp6") as unknown as
    | (SolverExperiment & { connections: Array<{ from: string; to: string; color?: string }> })
    | undefined
  if (experiment === undefined) throw new Error("v1-cap9-esp6 assente dal corpus")
  return experiment
}

describe("v1-cap9-esp6 — solve reale della lampada RGB (multi-pin sbloccato)", () => {
  it("il corpus dichiara la BOM del libro p.71: 3 pot, 3 resistori, 1 LED RGB", () => {
    const experiment = esp6Experiment()
    const types = experiment.components.map((component) => component.type)
    expect(types.filter((type) => type === "potentiometer").length).toBe(3)
    expect(types.filter((type) => type === "resistor").length).toBe(3)
    expect(types.filter((type) => type === "rgb-led").length).toBe(1)
  })

  it("i 3 canali sono ACCESI con brightness reali (wiper a metà corsa)", () => {
    const result = solveElabExperiment(esp6Experiment())
    expect(result.ok).toBe(true)
    expect(result.diagnostics.shortCircuit).toBe(false)
    expect(result.diagnostics.disconnectedPins).toEqual([])
    const rgb = result.componentStates.rgb1 as RgbState
    expect(rgb.on).toBe(true)
    for (const channel of ["red", "green", "blue"] as const) {
      expect(rgb[channel]?.on, channel).toBe(true)
      expect(rgb[channel]?.brightness ?? 0, channel).toBeGreaterThan(0)
    }
  })

  it("FALSIFICA l'indipendenza dei canali: gamba blu staccata → SOLO il blu si spegne", () => {
    const experiment = esp6Experiment()
    const pins = { ...experiment.pinAssignments }
    expect(pins["rgb1:blue"]).toBeTruthy()
    delete pins["rgb1:blue"]
    const result = solveElabExperiment({ ...experiment, pinAssignments: pins })
    const rgb = result.componentStates.rgb1 as RgbState
    expect(rgb.blue?.brightness ?? 0).toBe(0)
    expect(rgb.red?.on).toBe(true)
    expect(rgb.green?.on).toBe(true)
  })

  it("FALSIFICA il ritorno comune: gamba common staccata → TUTTI i canali si spengono", () => {
    const experiment = esp6Experiment()
    const pins = { ...experiment.pinAssignments }
    expect(pins["rgb1:common"]).toBeTruthy()
    delete pins["rgb1:common"]
    const result = solveElabExperiment({ ...experiment, pinAssignments: pins })
    const rgb = result.componentStates.rgb1 as RgbState
    for (const channel of ["red", "green", "blue"] as const) {
      expect(rgb[channel]?.brightness ?? 0, channel).toBe(0)
    }
  })

  it("tipo ancora NON catalogato resta deny-by-default (fail-closed intatto)", () => {
    expect(() =>
      solveElabExperiment({
        components: [{ id: "x1", type: "servo" }],
        connections: [],
      }),
    ).toThrow(/non catalogato/)
  })
})
