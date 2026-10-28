// @vitest-environment node
//
// P0-A validator falsificabile — occupazione fisica dei fori breadboard.
// Regola fisica del kit: UN foro ospita UN solo terminale (gamba di componente
// o capo di cavo). Stessa TIE = collegamento legittimo (è così che si monta);
// stesso FORO ESATTO = montaggio impossibile → conflitto.
// Serve alla modalità "montaggi liberi": report diagnostico completo, non
// throw-first (l'adapter resta l'autorità fail-closed sul solve).

import { describe, expect, it } from "vitest"
import { analyzeBreadboardOccupancy } from "../../sim/breadboard/occupancy.ts"
import type { BreadboardCircuit } from "../../sim/breadboard/geometry.ts"
const verifiedScene = { pinAssignments: { "r1:a": "bb1:f3" }, wires: [{ from: "supply:+", to: "bb1:g3" }] }

function circuitOf(overrides: Partial<BreadboardCircuit>): BreadboardCircuit {
  return { pinAssignments: {}, wires: [], ...overrides }
}

describe("analyzeBreadboardOccupancy", () => {
  it("fixture verified sintetica: nessun conflitto (baseline reale)", () => {
    const circuit: BreadboardCircuit = {
      pinAssignments: verifiedScene.pinAssignments,
      wires: verifiedScene.wires,
    }
    const report = analyzeBreadboardOccupancy(circuit)
    expect(report.ok).toBe(true)
    expect(report.conflicts).toEqual([])
  })

  it("due pin nello stesso foro → conflitto con entrambi gli occupanti", () => {
    const report = analyzeBreadboardOccupancy(
      circuitOf({
        pinAssignments: { "r1:pin1": "bb1:c5", "led1:anode": "bb1:c5" },
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0].ref).toBe("bb1:c5")
    expect(report.conflicts[0].occupants).toEqual([
      { kind: "pin", at: "led1:anode" },
      { kind: "pin", at: "r1:pin1" },
    ])
  })

  it("pin e capo di cavo nello stesso foro → conflitto misto", () => {
    const report = analyzeBreadboardOccupancy(
      circuitOf({
        pinAssignments: { "r1:pin1": "bb1:f7" },
        wires: [{ from: "bb1:f7", to: "bb1:a1" }],
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0].ref).toBe("bb1:f7")
    expect(report.conflicts[0].occupants).toEqual([
      { kind: "pin", at: "r1:pin1" },
      { kind: "wire", at: "wire[0].from" },
    ])
  })

  it("due capi di cavo nello stesso foro → conflitto (anche se dello stesso cavo)", () => {
    const report = analyzeBreadboardOccupancy(
      circuitOf({
        wires: [{ from: "bb1:b2", to: "bb1:b2" }],
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.conflicts[0].ref).toBe("bb1:b2")
    expect(report.conflicts[0].occupants).toHaveLength(2)
  })

  it("stessa rail con indice DIVERSO: nessun conflitto; stesso indice: conflitto", () => {
    const clean = analyzeBreadboardOccupancy(
      circuitOf({
        wires: [
          { from: "bb1:bus-top-plus-1", to: "bb1:a1" },
          { from: "bb1:bus-top-plus-2", to: "bb1:a2" },
        ],
      }),
    )
    expect(clean.ok).toBe(true)

    const dirty = analyzeBreadboardOccupancy(
      circuitOf({
        wires: [
          { from: "bb1:bus-top-plus-3", to: "bb1:a1" },
          { from: "bb1:bus-top-plus-3", to: "bb1:a2" },
        ],
      }),
    )
    expect(dirty.ok).toBe(false)
    expect(dirty.conflicts[0].ref).toBe("bb1:bus-top-plus-3")
  })

  it("ref non-breadboard (pin di componente, es. bat1:positive) sono ignorati", () => {
    const report = analyzeBreadboardOccupancy(
      circuitOf({
        wires: [
          { from: "bat1:positive", to: "bb1:a1" },
          { from: "bat1:positive", to: "bb1:a2" },
        ],
      }),
    )
    expect(report.ok).toBe(true)
    expect(report.conflicts).toEqual([])
  })

  it("stessa tie, fori diversi (bb1:f3 vs bb1:g3): montaggio legittimo, nessun conflitto", () => {
    const report = analyzeBreadboardOccupancy(
      circuitOf({
        pinAssignments: { "led1:anode": "bb1:f3" },
        wires: [{ from: "bb1:g3", to: "bb1:bus-top-plus-1" }],
      }),
    )
    expect(report.ok).toBe(true)
  })

  it("conflitti multipli ordinati per ref (report deterministico)", () => {
    const report = analyzeBreadboardOccupancy(
      circuitOf({
        pinAssignments: {
          "r1:pin1": "bb1:j9",
          "r1:pin2": "bb1:a1",
          "led1:anode": "bb1:j9",
          "led1:cathode": "bb1:a1",
        },
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.conflicts.map((c) => c.ref)).toEqual(["bb1:a1", "bb1:j9"])
  })
})
