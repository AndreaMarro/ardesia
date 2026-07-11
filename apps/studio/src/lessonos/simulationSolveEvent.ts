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
  /** PluginInstance post-it che produce l'evento. */
  instanceId?: string
  /** Comando/azione che ha causato il solve osservato. */
  causationId?: string
  /** Provenienza della superficie: per Slice A il default e' il post-it Simulation. */
  provenance?: {
    surface: "postit" | "notebook" | "whiteboard" | "overlay"
    pluginId?: string
    source?: string
  }
}

export function simulationSolveEvent(input: SimulationSolveEventInput): LessonOsEvent | null {
  const { experimentId, outcome, t, instanceId, causationId, provenance } = input
  if (!experimentId) return null
  const evidence = [`simulation:scene:${experimentId}`]
  const base = {
    t,
    evidence,
    ...(instanceId ? { instanceId } : {}),
    ...(causationId ? { causationId } : {}),
    ...(provenance ? { provenance } : {}),
  }
  if (outcome.kind === "solved") {
    return {
      kind: "simulation.circuit.solved",
      experimentId,
      sceneId: experimentId,
      currentMa: outcome.currentMa,
      bookLayoutValid: outcome.bookLayoutValid,
      labels: { it: `Circuito risolto: ${outcome.currentMa.toFixed(1)} mA` },
      ...base,
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
      ...base,
    }
  }
  return null
}
