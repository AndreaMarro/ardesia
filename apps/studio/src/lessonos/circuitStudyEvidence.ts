import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import {
  CIRCUIT_CHECK_TOOL_ID, readCircuitState, type CircuitProof, type CircuitTraceStep,
} from "../toolhost/circuitCheckAdapter"
import { toLegacyLessonOsEvent, type AppendedEvent, type AppendedEventEnvelopeV2,
  type ObservedCircuitStep } from "./eventlog"
import { circuitProofSha256 } from "./circuitCheckEvent"

export type CircuitStudyEvidence = Readonly<{
  embedId: string
  proof: CircuitProof
  assessedTrace: readonly CircuitTraceStep[]
  assessment: string | null
}>

export type CircuitNextLessonEvidence = Readonly<{
  embedId: string
  proof: CircuitProof
  errorId: string
  firstInvalidStep: number
  observedStep: ObservedCircuitStep
  corrected: boolean
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
    if (!proof || proof.scope === "legacy_unrecorded") continue
    const proofSha256 = await circuitProofSha256(proof)
    const source = events.find(event => event.kind === "circuit.proof.verified" &&
      event.embedId === element.id && event.circuitFingerprint === proof.fingerprint &&
      event.answerExact === proof.answer.exact && event.unit === proof.answer.unit &&
      event.engineRevision === proof.sourceSha && event.verificationScope === proof.scope &&
      event.lessonBuild === proof.lessonBuild && event.proofSha256 === proofSha256 &&
      event.evidence.includes(`board:${element.id}`))
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

/** Read prior-lesson exercise facts without projecting a student score or copying them into the new lesson. */
export async function circuitNextLessonEvidence(
  sceneJson: string | null,
  envelopes: readonly AppendedEventEnvelopeV2[],
  priorLessonId: string,
): Promise<CircuitNextLessonEvidence[]> {
  const events = envelopes.filter(item => item.lessonId === priorLessonId)
    .map(toLegacyLessonOsEvent).filter((item): item is AppendedEvent => item !== null)
  const verified = await circuitStudyEvidence(sceneJson, events)
  const result: CircuitNextLessonEvidence[] = []
  for (const {embedId, proof} of verified) {
    const exerciseId = `circuit:${proof.fingerprint}`
    const boardRef = `board:${embedId}`
    for (const error of events) {
      if (error.kind !== "circuit.trace.assessed" || error.outcome !== "first_invalid" ||
          error.exerciseId !== exerciseId || !error.errorId || !error.observedStep ||
          !error.firstInvalidStep || !error.evidence.includes(boardRef)) continue
      const corrected = events.some(item => item.kind === "circuit.trace.assessed" &&
        item.seq > error.seq && item.outcome === "valid_so_far" &&
        item.exerciseId === exerciseId && item.correctsErrorId === error.errorId &&
        item.evidence.includes(boardRef))
      result.push({embedId, proof, errorId:error.errorId,
        firstInvalidStep:error.firstInvalidStep, observedStep:error.observedStep, corrected})
    }
  }
  return result.sort((a,b) => a.errorId.localeCompare(b.errorId))
}
