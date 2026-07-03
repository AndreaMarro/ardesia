// @vitest-environment node
//
// ELAB Vol.1 cap.6 esp.1 didactic-step data layer:
// (a) every step anchored to real manual evidence (pp.29-31);
// (b) DRIFT-TEST against the canonical fixture;
// (c) counter-examples MUST fail the right step;
// (d) determinism: ordered by `order`, unique ids, pure evaluation.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  DIDACTIC_STEPS_V1_CAP6_ESP1,
  evaluateDidacticStep,
  evaluateDidacticSteps,
  firstFailingDidacticStep,
  type ElabCircuitSlice,
} from "../../sim/elab/didacticSteps.ts"
import { validateElabV1Cap6Esp1Fixture } from "../../sim/elab/fixtureAdapter.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const fixturePath = path.join(repoRoot, "apps/studio/sim/fixtures/elab-v1-cap6-esp1.json")

const STEP_IDS = {
  positive: "v1-cap6-esp1-step-1-positivo-striscia-rossa",
  resistor: "v1-cap6-esp1-step-2-resistore-striscia-zona-sotto",
  led: "v1-cap6-esp1-step-3-led-cavallo-divisione",
  negative: "v1-cap6-esp1-step-4-negativo-colonna-catodo",
} as const

function readRawFixture(): {
  sourceOfTruth: { manualPages: number[] }
  pinAssignments: Record<string, string>
  wires: Array<{ from: string; to: string; color: string }>
} {
  return JSON.parse(fs.readFileSync(fixturePath, "utf-8"))
}

function canonicalCircuit(): ElabCircuitSlice {
  const fixture = readRawFixture()
  return {
    pinAssignments: { ...fixture.pinAssignments },
    wires: fixture.wires.map((wire) => ({ ...wire })),
  }
}

describe("ELAB Vol.1 cap.6 esp.1 didactic steps", () => {
  it("anchors every step to non-empty manual evidence with real pages 29-31", () => {
    expect(DIDACTIC_STEPS_V1_CAP6_ESP1).toHaveLength(4)

    for (const step of DIDACTIC_STEPS_V1_CAP6_ESP1) {
      expect(step.manualEvidence.length).toBeGreaterThan(0)
      for (const evidence of step.manualEvidence) {
        expect([29, 30, 31]).toContain(evidence.page)
        expect(evidence.claim.length).toBeGreaterThan(0)
        expect(evidence.evidence.length).toBeGreaterThan(0)
      }
      expect(step.instruction.it.length).toBeGreaterThan(0)
      expect(step.instruction.en.length).toBeGreaterThan(0)
      expect(step.expects.length).toBeGreaterThan(0)
    }

    const [step1, step2, step3, step4] = DIDACTIC_STEPS_V1_CAP6_ESP1
    // Book p.30: "Collega il positivo della batteria alla striscia rossa superiore"
    expect(step1.instruction.it).toContain("striscia rossa superiore")
    expect(step1.manualEvidence.map((evidence) => evidence.page)).toContain(30)
    // Book p.30: "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa"
    expect(step2.instruction.it).toContain("resistore da 470 Ohm")
    expect(step2.manualEvidence.map((evidence) => evidence.page)).toContain(30)
    // Book p.30: "la gambetta lunga del LED verso il resistore ... dopo la divisione centrale"
    expect(step3.instruction.it).toContain("gambetta lunga del LED verso il resistore")
    expect(step3.instruction.it).toContain("divisione centrale")
    expect(step3.manualEvidence.map((evidence) => evidence.page)).toContain(30)
    // Book p.31: "Collega il negativo della batteria ... stessa colonna della gambetta corta"
    expect(step4.instruction.it).toContain("negativo della batteria")
    expect(step4.instruction.it).toContain("stessa colonna della gambetta corta")
    expect(step4.manualEvidence.map((evidence) => evidence.page)).toContain(31)
  })

  it("DRIFT-TEST: every step passes against the canonical fixture, which stays canonical", () => {
    // If the fixture topology drifts in any way (holes, wires, pins) this throws.
    const fixture = validateElabV1Cap6Esp1Fixture(readRawFixture())

    const results = evaluateDidacticSteps(DIDACTIC_STEPS_V1_CAP6_ESP1, fixture)
    expect(results).toHaveLength(DIDACTIC_STEPS_V1_CAP6_ESP1.length)
    for (const result of results) {
      expect(result.failures, `step ${result.stepId} must pass on the fixture`).toEqual([])
      expect(result.passed).toBe(true)
    }
    expect(firstFailingDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1, fixture)).toBeNull()

    // Step evidence pages stay inside the fixture source-of-truth pages.
    const fixturePages = new Set(fixture.sourceOfTruth.manualPages)
    for (const step of DIDACTIC_STEPS_V1_CAP6_ESP1) {
      for (const evidence of step.manualEvidence) {
        expect(fixturePages.has(evidence.page)).toBe(true)
      }
    }
  })

  it("COUNTER-EXAMPLE: LED with both legs on the same column fails step 3", () => {
    const circuit = canonicalCircuit()
    // anode stays bb1:f3; cathode moves to the same column/top block: no straddle.
    circuit.pinAssignments["led1:cathode"] = "bb1:g3"

    const results = evaluateDidacticSteps(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)
    expect(results[0].passed).toBe(true)
    expect(results[1].passed).toBe(true)
    expect(results[2].passed).toBe(false)
    expect(results[2].failures.join("; ")).toMatch(/ledStraddlesCenterGap/)
    expect(firstFailingDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)?.stepId).toBe(STEP_IDS.led)
  })

  it("COUNTER-EXAMPLE: negative return via the minus bus fails step 4", () => {
    const circuit = canonicalCircuit()
    circuit.wires = [
      circuit.wires[0],
      circuit.wires[1],
      { from: "bb1:a3", to: "bb1:bus-bot-minus-3" },
      { from: "bb1:bus-bot-minus-1", to: "bat1:negative" },
    ]

    const results = evaluateDidacticSteps(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)
    expect(results[0].passed).toBe(true)
    expect(results[1].passed).toBe(true)
    expect(results[2].passed).toBe(true)
    expect(results[3].passed).toBe(false)
    expect(results[3].failures.join("; ")).toMatch(/usesMinusBus/)
    expect(results[3].failures.join("; ")).toMatch(/negativeReturnsDirectlyWithoutRails/)
    expect(firstFailingDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)?.stepId).toBe(
      STEP_IDS.negative,
    )
  })

  it("COUNTER-EXAMPLE: positive lead on the wrong (minus) strip fails step 1", () => {
    const circuit = canonicalCircuit()
    circuit.wires = [
      { from: "bat1:positive", to: "bb1:bus-top-minus-1" },
      circuit.wires[1],
      circuit.wires[2],
    ]

    const step1 = evaluateDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1[0], circuit)
    expect(step1.passed).toBe(false)
    expect(step1.failures.join("; ")).toMatch(/bus-top-plus/)
    expect(firstFailingDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)?.stepId).toBe(
      STEP_IDS.positive,
    )
  })

  it("COUNTER-EXAMPLE: positive lead on a plus rail of a non-existent board fails step 1", () => {
    // QA probe: bat1:positive → bb2:bus-top-plus-1 with no component mounted on bb2
    // must NOT give a per-step green on step 1.
    const circuit = canonicalCircuit()
    circuit.wires = [
      { from: "bat1:positive", to: "bb2:bus-top-plus-1" },
      circuit.wires[1],
      circuit.wires[2],
    ]

    const step1 = evaluateDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1[0], circuit)
    expect(step1.passed).toBe(false)
    expect(step1.failures.join("; ")).toMatch(/bus-top-plus/)
    expect(firstFailingDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)?.stepId).toBe(
      STEP_IDS.positive,
    )
  })

  it("COUNTER-EXAMPLE: a component pin parked on a bus rail fails step 4 (never pins on bus-*)", () => {
    const circuit = canonicalCircuit()
    circuit.pinAssignments["led1:cathode"] = "bb1:bus-bot-minus-3"

    const step4 = evaluateDidacticStep(DIDACTIC_STEPS_V1_CAP6_ESP1[3], circuit)
    expect(step4.passed).toBe(false)
    expect(step4.failures.join("; ")).toMatch(/pins/)
  })

  it("determinism: steps ordered by `order`, unique ids, repeatable evaluation", () => {
    const orders = DIDACTIC_STEPS_V1_CAP6_ESP1.map((step) => step.order)
    expect(orders).toEqual([1, 2, 3, 4])
    expect([...orders].sort((a, b) => a - b)).toEqual(orders)

    const ids = DIDACTIC_STEPS_V1_CAP6_ESP1.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual([STEP_IDS.positive, STEP_IDS.resistor, STEP_IDS.led, STEP_IDS.negative])

    expect(Object.isFrozen(DIDACTIC_STEPS_V1_CAP6_ESP1)).toBe(true)
    for (const step of DIDACTIC_STEPS_V1_CAP6_ESP1) {
      expect(Object.isFrozen(step)).toBe(true)
    }

    const circuit = canonicalCircuit()
    const first = evaluateDidacticSteps(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)
    const second = evaluateDidacticSteps(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })
})
