// Wrapper tipizzato del CircuitSolver vendored (Fase 2 simulature, confine P2).
// Golden elettrico = canone del MOTORE: LED rosso Vf 1.8 V (CircuitSolver.js:22-29)
// → I = (9 − 1.8) / 470 = 15.3 mA (stesso golden del plugin,
// CircuitSolver.comprehensive.test.js:80-81). Il golden UI 14.9 mA
// (ToolCanvasEmbeddable, scena con ledForwardVolts=2) resta separato e intatto:
// la divergenza Vf è un CONFLITTO ESPLICITO, tracciato come warning, mai
// riconciliato in silenzio (spec D4).
import { describe, expect, it } from "vitest"
import { solveElabExperiment, type SolverExperiment } from "../../sim/solver/elabSolver"

// Circuito reference Vol.1 cap.6 esp.1 — stessa topologia della scena studio
// (ToolCanvasEmbeddable.tsx:202-217): 9V → strip f2-j2 → R470 (i2→i9) →
// LED (f9→e9) → strip a9-e9 → GND.
function referenceExperiment(): SolverExperiment {
  return {
    components: [
      { id: "bat1", type: "battery9v" },
      { id: "bb1", type: "breadboard-half" },
      { id: "r1", type: "resistor", value: 470 },
      { id: "led1", type: "led", color: "red" },
    ],
    connections: [
      { from: "bat1:positive", to: "bb1:j2" },
      { from: "bat1:negative", to: "bb1:a9" },
    ],
    pinAssignments: {
      "r1:pin1": "bb1:i2",
      "r1:pin2": "bb1:i9",
      "led1:anode": "bb1:f9",
      "led1:cathode": "bb1:e9",
    },
  }
}

describe("solveElabExperiment (motore vendored)", () => {
  it("GOLDEN elettrico: LED rosso acceso a 15.3 mA dal solve reale (canone motore)", () => {
    const result = solveElabExperiment(referenceExperiment())
    expect(result.ok).toBe(true)
    expect(result.componentStates.led1?.on).toBe(true)
    expect(result.currents.led1).toBeCloseTo(0.0153, 3)
    expect(result.diagnostics.shortCircuit).toBe(false)
  })

  it("circuito aperto (manca il filo negativo): LED spento, corrente assente", () => {
    const experiment = referenceExperiment()
    experiment.connections = experiment.connections.filter(
      (connection) => connection.from !== "bat1:negative",
    )
    const result = solveElabExperiment(experiment)
    expect(result.componentStates.led1?.on).toBe(false)
    expect(result.currents.led1 ?? 0).toBe(0)
  })

  it("conflitto Vf esplicito: scena dichiara 2.0 V, tabella motore dice 1.8 V per il rosso", () => {
    const result = solveElabExperiment(referenceExperiment(), { sceneLedForwardVolts: 2 })
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toContain("led1")
    expect(result.warnings[0]).toContain("2")
    expect(result.warnings[0]).toContain("1.8")
  })

  it("nessun warning quando la scena concorda con la tabella motore", () => {
    const result = solveElabExperiment(referenceExperiment(), { sceneLedForwardVolts: 1.8 })
    expect(result.warnings).toEqual([])
  })

  it("componente di tipo non catalogato: errore chiaro, niente solve muto", () => {
    const experiment = referenceExperiment()
    experiment.components.push({ id: "x1", type: "flux-capacitor" })
    expect(() => solveElabExperiment(experiment)).toThrowError(/flux-capacitor/)
  })
})
