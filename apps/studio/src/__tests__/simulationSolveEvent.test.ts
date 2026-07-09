import { describe, it, expect } from "vitest"
import { simulationSolveEvent } from "../lessonos/simulationSolveEvent"

describe("simulationSolveEvent (esito solve → evento LessonOS)", () => {
  it("solved → simulation.circuit.solved con currentMa/bookLayoutValid/evidence", () => {
    const ev = simulationSolveEvent({
      experimentId: "v1-cap6-esp1",
      t: 1500,
      outcome: { kind: "solved", currentMa: 15.3, bookLayoutValid: true },
    })
    expect(ev).toMatchObject({
      kind: "simulation.circuit.solved",
      experimentId: "v1-cap6-esp1",
      sceneId: "v1-cap6-esp1",
      currentMa: 15.3,
      bookLayoutValid: true,
      t: 1500,
      evidence: ["simulation:scene:v1-cap6-esp1"],
    })
  })

  it("error → simulation.error.observed con errorId/conceptId/evidence", () => {
    const ev = simulationSolveEvent({
      experimentId: "v1-cap6-esp1",
      t: 1480,
      outcome: { kind: "error", code: "missing-resistor", conceptId: "resistenza", message: "Resistore mancante" },
    })
    expect(ev).toMatchObject({
      kind: "simulation.error.observed",
      errorId: "sim-error:v1-cap6-esp1:missing-resistor",
      conceptId: "resistenza",
      experimentId: "v1-cap6-esp1",
      labels: { it: "Resistore mancante" },
      evidence: ["simulation:scene:v1-cap6-esp1"],
    })
  })

  it("idle → null (nessun evento)", () => {
    expect(simulationSolveEvent({ experimentId: "x", t: 1, outcome: { kind: "idle" } })).toBeNull()
  })

  it("experimentId vuoto → null (mai eventi orfani)", () => {
    expect(
      simulationSolveEvent({ experimentId: "", t: 1, outcome: { kind: "solved", currentMa: 5, bookLayoutValid: false } }),
    ).toBeNull()
  })
})
