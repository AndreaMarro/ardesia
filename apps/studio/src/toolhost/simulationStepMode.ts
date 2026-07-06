// Modalità passo-passo del Simulation Plugin — modello puro, nessuna UI.
// Ponte tra la scena attiva del post-it (già-montato + placements del
// montaggio libero) e i predicati didattici canonici di sim/elab/didacticSteps.
// La valutazione è REALE: ogni step passa solo se la topologia del circuito
// attivo soddisfa i predicati del libro (semantica cumulativa, vedi
// didacticSteps.ts). Nessun "fatto" dichiarato senza topologia vera.

import {
  DIDACTIC_STEPS_V1_CAP6_ESP1,
  evaluateDidacticSteps,
  type ElabCircuitSlice,
} from "../../sim/elab/didacticSteps"

/** Placement del montaggio libero (twin strutturale di MontaggioPlacement). */
export type StepModePlacement = {
  id: string
  type: "resistor" | "led"
  holes: [string, string]
}

/** Fetta minima di SimulationSceneV1 necessaria alla valutazione. */
export type StepModeSceneSlice = {
  pinAssignments: Record<string, string>
  connections: ReadonlyArray<{
    from: string
    to: string
    color: string
    kind: "internal" | "wire"
  }>
}

export type StepEvidence = { page: number; evidence: string }

export type StepByStepStep = {
  id: string
  order: number
  instructionIt: string
  evidence: StepEvidence[]
  passed: boolean
  failures: readonly string[]
}

export type StepByStepModel = {
  steps: StepByStepStep[]
  firstFailingId: string | null
  passedCount: number
  total: number
}

/**
 * Circuito valutabile = pinAssignments della scena + pin dei placements
 * (stessa mappatura pin di boardScene nell'embeddable: resistor→pin1/pin2,
 * led→anode/cathode) + i soli fili fisici (kind "wire": gli "internal" sono
 * conduzione di strip, non jumper — i predicati ragionano sui jumper).
 */
export function buildEvaluationCircuit(
  scene: StepModeSceneSlice,
  placements: readonly StepModePlacement[],
): ElabCircuitSlice {
  const pinAssignments: Record<string, string> = { ...scene.pinAssignments }
  for (const placement of placements) {
    if (placement.type === "resistor") {
      pinAssignments[`${placement.id}:pin1`] = placement.holes[0]
      pinAssignments[`${placement.id}:pin2`] = placement.holes[1]
    } else {
      pinAssignments[`${placement.id}:anode`] = placement.holes[0]
      pinAssignments[`${placement.id}:cathode`] = placement.holes[1]
    }
  }
  const wires = scene.connections
    .filter((connection) => connection.kind === "wire")
    .map(({ from, to, color }) => ({ from, to, color }))
  return { pinAssignments, wires }
}

/** Modello del pannello passo-passo: step ordinati + stato reale per-step. */
export function stepByStepModel(
  scene: StepModeSceneSlice,
  placements: readonly StepModePlacement[],
): StepByStepModel {
  const circuit = buildEvaluationCircuit(scene, placements)
  const results = evaluateDidacticSteps(DIDACTIC_STEPS_V1_CAP6_ESP1, circuit)
  const byId = new Map(DIDACTIC_STEPS_V1_CAP6_ESP1.map((step) => [step.id, step]))

  const steps: StepByStepStep[] = results.map((result) => {
    const step = byId.get(result.stepId)
    if (!step) throw new Error(`step sconosciuto nel risultato: ${result.stepId}`)
    return {
      id: step.id,
      order: step.order,
      instructionIt: step.instruction.it,
      evidence: step.manualEvidence.map(({ page, evidence }) => ({ page, evidence })),
      passed: result.passed,
      failures: result.failures,
    }
  })

  const firstFailing = steps.find((step) => !step.passed)
  return {
    steps,
    firstFailingId: firstFailing?.id ?? null,
    passedCount: steps.filter((step) => step.passed).length,
    total: steps.length,
  }
}
