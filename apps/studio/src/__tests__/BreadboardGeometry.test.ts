// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  analyzeElabV1Cap6Esp1BookTopology,
  parseBreadboardHole,
  parseBreadboardRail,
  reaches,
  reachesDirectlyWithoutRails,
  sameTie,
  straddlesCenterGap,
  validateElabV1Cap6Esp1BookTopology,
} from "../../sim/breadboard/geometry.ts"
import { validateElabV1Cap6Esp1Fixture, type ElabV1Cap6Esp1Fixture } from "../../sim/elab/fixtureAdapter.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const fixturePath = path.join(repoRoot, "apps/studio/sim/fixtures/elab-v1-cap6-esp1.json")

const OLD_PRE_BOOK_TOPOLOGY: Pick<ElabV1Cap6Esp1Fixture, "pinAssignments" | "wires"> = {
  pinAssignments: {
    "r1:pin1": "bb1:a2",
    "r1:pin2": "bb1:a9",
    "led1:anode": "bb1:f9",
    "led1:cathode": "bb1:f10",
  },
  wires: [
    { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
    { from: "bb1:bus-top-plus-2", to: "bb1:b2", color: "red" },
    { from: "bb1:e9", to: "bb1:f9", color: "green" },
    { from: "bb1:j10", to: "bb1:bus-bot-minus-10", color: "black" },
    { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-1", color: "black" },
    { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
  ],
}

function readFixture(): ElabV1Cap6Esp1Fixture {
  return validateElabV1Cap6Esp1Fixture(JSON.parse(fs.readFileSync(fixturePath, "utf-8")))
}

describe("breadboard geometry", () => {
  it("parses holes and rails into stable breadboard topology groups", () => {
    expect(parseBreadboardHole("bb1:i9")).toEqual({ boardId: "bb1", letter: "i", tie: 9, block: "top" })
    expect(parseBreadboardHole("bb1:e3")).toEqual({ boardId: "bb1", letter: "e", tie: 3, block: "bottom" })
    expect(parseBreadboardRail("bb1:bus-top-plus-9")).toEqual({
      boardId: "bb1",
      rail: "bus-top-plus",
      index: 9,
    })
    expect(straddlesCenterGap("bb1:f3", "bb1:e3")).toBe(true)
    expect(sameTie("bb1:i3", "bb1:f3")).toBe(true)
    expect(sameTie("bb1:f3", "bb1:e3")).toBe(false)
  })

  it("validates the canonical Vol.1 cap.6 esp.1 topology from the fixture", () => {
    const fixture = readFixture()
    const report = validateElabV1Cap6Esp1BookTopology(fixture)

    expect(report).toEqual({
      ledStraddlesCenterGap: true,
      resistorSharesAnodeTie: true,
      cathodeSharesNegativeReturnTie: true,
      positiveReachesResistorRailSide: true,
      negativeReturnsDirectlyWithoutRails: true,
      closedCircuit: true,
      pinsOnRails: [],
      usesMinusBus: false,
      wireCount: 3,
    })
  })

  it("builds a topological netlist with rails, ties, wires, and passive component conductors", () => {
    const fixture = readFixture()
    const circuit = {
      ...fixture,
      conductivePairs: [
        ["r1:pin1", "r1:pin2"],
        ["led1:anode", "led1:cathode"],
      ] as const,
    }

    expect(reaches("bat1:positive", "r1:pin1", circuit)).toBe(true)
    expect(reaches("bat1:positive", "bat1:negative", circuit)).toBe(true)
    expect(reachesDirectlyWithoutRails("bb1:a3", "bat1:negative", circuit)).toBe(true)
  })

  it("rejects the old main topology with named book-drift predicates", () => {
    const report = analyzeElabV1Cap6Esp1BookTopology(OLD_PRE_BOOK_TOPOLOGY)

    expect(report.ledStraddlesCenterGap).toBe(false)
    expect(report.resistorSharesAnodeTie).toBe(false)
    expect(report.negativeReturnsDirectlyWithoutRails).toBe(false)
    expect(report.usesMinusBus).toBe(true)
    expect(report.wireCount).toBe(6)
    expect(() => validateElabV1Cap6Esp1BookTopology(OLD_PRE_BOOK_TOPOLOGY)).toThrow(
      /LED must straddle|minus bus|expected 3 wires/,
    )
  })
})
