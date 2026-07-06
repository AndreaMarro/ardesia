// @vitest-environment node
//
// Il check `electrical` della scena reale v1-cap6-esp1 smette di essere una
// stringa auto-asserita: qui viene RICALCOLATO col motore vendored (MNA) a
// partire dal payload adapter, e il claim scritto nella fixture deve
// coincidere col verdetto (drift-guard). Golden: (9 - 1.8) / 470 = 15.3 mA
// (Vf red 1.8 dalla tabella del motore, stessa cifra del golden registry).

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { createSimulationAdapterPayloadFromElabScene } from "../../sim/elab/elabSceneAdapter.ts"
import { solveElabExperiment, type SolverExperiment } from "../../sim/solver/elabSolver.ts"
import { validateElabScene, type ElabScene } from "../../sim/elab/elabScene.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function candidateFixture(): unknown {
  return JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json"),
      "utf-8",
    ),
  )
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

function validScene(): ElabScene {
  const result = validateElabScene(candidateFixture())
  if (!result.ok) throw new Error("fixture invalid")
  return result.scene
}

describe("electrical check calcolato per la scena reale v1-cap6-esp1", () => {
  it("il motore reale accende il LED con la corrente golden 15.3 mA", () => {
    const result = solveElabExperiment(solverExperimentFromScene(candidateFixture()))

    expect(result.ok).toBe(true)
    expect(result.diagnostics.shortCircuit).toBe(false)
    expect(result.diagnostics.disconnectedPins).toEqual([])
    expect(result.componentStates.led1?.on).toBe(true)
    expect(result.currents.led1).toBeCloseTo(0.0153, 3)
  })

  it("il claim electrical della fixture coincide col verdetto calcolato (drift-guard)", () => {
    const scene = validScene()
    const result = solveElabExperiment(solverExperimentFromScene(candidateFixture()))
    const computed =
      result.ok && result.componentStates.led1?.on === true && !result.diagnostics.shortCircuit
        ? "pass"
        : "fail"
    expect(scene.provenance.checks.electrical).toBe(computed)
  })

  it("FALSIFICA il LED invertito: catodo verso il resistore = LED spento", () => {
    const scene = validScene()
    const swapped = {
      ...scene,
      pinAssignments: {
        ...scene.pinAssignments,
        "led1:anode": "bb1:e9",
        "led1:cathode": "bb1:f9",
      },
    }
    const result = solveElabExperiment(solverExperimentFromScene(swapped))
    expect(result.componentStates.led1?.on ?? false).toBe(false)
  })

  it("FALSIFICA il circuito aperto: senza il filo del negativo il LED resta spento", () => {
    const scene = validScene()
    const open = { ...scene, wires: scene.wires.filter((wire) => wire.id !== "w2") }
    const result = solveElabExperiment(solverExperimentFromScene(open))
    expect(result.componentStates.led1?.on ?? false).toBe(false)
    expect(result.currents.led1 ?? 0).toBe(0)
  })
})
