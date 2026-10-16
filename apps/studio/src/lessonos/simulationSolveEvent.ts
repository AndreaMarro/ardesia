// Simulation Plugin → LessonOS: mappa PURA e deterministica dell'esito del
// solve in un evento tipato per il loop First-LED break→explain.
// Nessun accesso a React/DOM/clock: il tempo `t` lo fornisce il chiamante
// (il log non inventa tempi). Ritorna null per esiti non significativi.
import type { LessonOsEvent } from "./eventlog"

export type SimulationSolveOutcome =
  | { kind: "solved"; currentMa: number; bookLayoutValid: boolean }
  | { kind: "error"; code: string; conceptId: string; message: string }
  | { kind: "idle" }

export type SimulationSolveEventInput = {
  experimentId: string
  outcome: SimulationSolveOutcome
  /** Timestamp epoch(ms) fornito dal chiamante. */
  t: number
}

export function simulationSolveEvent(input: SimulationSolveEventInput): LessonOsEvent | null {
  const { experimentId, outcome, t } = input
  if (!experimentId) return null
  const evidence = [`simulation:scene:${experimentId}`]
  if (outcome.kind === "solved") {
    // Non-finite payloads cannot become measured facts in export or recap.
    if (!Number.isFinite(outcome.currentMa)) return null
    return {
      kind: "simulation.circuit.solved",
      experimentId,
      sceneId: experimentId,
      currentMa: outcome.currentMa,
      bookLayoutValid: outcome.bookLayoutValid,
      labels: { it: `Circuito risolto: ${outcome.currentMa.toFixed(1)} mA` },
      t,
      evidence,
    }
  }
  if (outcome.kind === "error") {
    return {
      kind: "simulation.error.observed",
      errorId: `sim-error:${experimentId}:${outcome.code}`,
      conceptId: outcome.conceptId,
      sceneId: experimentId,
      experimentId,
      labels: { it: outcome.message },
      t,
      evidence,
    }
  }
  return null
}
