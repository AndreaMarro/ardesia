import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import {
  CIRCUIT_CHECK_TOOL_ID, readCircuitState, type CircuitProof, type CircuitTraceStep,
} from "../toolhost/circuitCheckAdapter"
import type { AppendedEvent } from "./eventlog"

export type CircuitStudyEvidence = Readonly<{
  embedId: string
  proof: CircuitProof
  assessedTrace: readonly CircuitTraceStep[]
  assessment: string | null
}>

const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)

/** Project only board proof revisions that have a matching factual lesson event. */
export async function circuitStudyEvidence(
  sceneJson: string | null,
  events: readonly AppendedEvent[],
): Promise<CircuitStudyEvidence[]> {
  if (!sceneJson) return []
  let scene: unknown
  try { scene = JSON.parse(sceneJson) } catch { return [] }
  if (!object(scene) || !Array.isArray(scene.elements)) return []
  const result: CircuitStudyEvidence[] = []
  for (const element of scene.elements) {
    if (!object(element) || element.isDeleted === true || typeof element.id !== "string" ||
        !object(element.customData) || !object(element.customData[EMBED_DATA_KEY])) continue
    const marker = element.customData[EMBED_DATA_KEY]
    if (marker.owner !== CIRCUIT_CHECK_TOOL_ID) continue
    const state = readCircuitState(marker.state)
    const proof = state.proof
    if (!proof || proof.scope !== "electrical_result") continue
    const source = events.find(event => event.kind === "circuit.proof.verified" &&
      event.embedId === element.id && event.circuitFingerprint === proof.fingerprint &&
      event.answerExact === proof.answer.exact && event.unit === proof.answer.unit &&
      event.engineRevision === proof.sourceSha && event.verificationScope === proof.scope &&
      event.lessonBuild === proof.lessonBuild && event.evidence.includes(`board:${element.id}`))
    if (!source) continue

    let assessedTrace: readonly CircuitTraceStep[] = []
    let assessment: string | null = null
    if (state.trace.length) {
      const bytes = new TextEncoder().encode(JSON.stringify({fingerprint:proof.fingerprint,trace:state.trace}))
      const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
        .map(value => value.toString(16).padStart(2, "0")).join("")
      const attemptId = `circuit-attempt:${proof.fingerprint}:${hash.slice(0, 24)}`
      const attempt = events.find(event => event.kind === "circuit.trace.assessed" &&
        event.attemptId === attemptId && event.exerciseId === `circuit:${proof.fingerprint}` &&
        event.evidence.includes(`board:${element.id}`))
      if (attempt && attempt.kind === "circuit.trace.assessed") {
        assessedTrace = state.trace
        assessment = attempt.labels.it ?? "Tentativo valutato"
      }
    }
    result.push({embedId:element.id, proof, assessedTrace, assessment})
  }
  return result.sort((a,b) => a.embedId.localeCompare(b.embedId))
}
