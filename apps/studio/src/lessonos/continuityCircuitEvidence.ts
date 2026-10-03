import type { ScopedContinuitySnapshotV1, ContinuityEvidenceV1, ContinuityEvidenceTargetV1 } from "./continuityProjection"
import { circuitStudyEvidence } from "./circuitStudyEvidence"
import { toLegacyLessonOsEvent, type AppendedEventEnvelopeV2 } from "./eventlog"

type Sources = Omit<ScopedContinuitySnapshotV1,"evidenceByOccurrence">

/** Resolve current targets from validated, scoped sources without rewriting any
 * historical declaration or changing the workspace's persistence authority. */
export async function resolveCircuitContinuityEvidence(
  sources: Sources,
  occurrences: ReadonlyMap<string,ContinuityEvidenceV1>,
): Promise<ReadonlyMap<string,ContinuityEvidenceV1>> {
  const result = new Map(occurrences)
  const {scope,session,lessonEvents,scene,buildCommitSha,issues} = sources
  // Cache provenance stays visible. Missing/corrupt sources and data loss cannot
  // establish target identity or uniqueness, even if some rows survived.
  if (issues.some(issue=>issue.code !== "local-storage-non-authoritative") ||
    !buildCommitSha || !/^[a-f0-9]{40}$/i.test(buildCommitSha) || !session ||
    session.document.lessonId !== scope.lessonId || session.document.sessionId !== scope.sessionId) return result

  const eligible = (event: AppendedEventEnvelopeV2) =>
    event.lessonId === scope.lessonId && event.sessionId === scope.sessionId &&
    event.actor.id !== "ai.consultative" && !event.kind.startsWith("ai.") &&
    event.producer.id === "com.github.andreamarro.ardesia.studio" &&
    event.producer.commitSha.toLowerCase() === buildCommitSha.toLowerCase()
  const starts = lessonEvents.filter(event=>event.kind === "lesson.started")
  if (starts.length !== 1 || !eligible(starts[0]!) ||
    session.document.created !== Date.parse(starts[0]!.occurredAt)) return result

  const resolve = (key:string,target:ContinuityEvidenceTargetV1) => {
    const occurrence = occurrences.get(key)
    if (occurrence) result.set(key,Object.freeze({...occurrence,status:"resolved",reason:null,target:Object.freeze(target)}))
  }

  for (const event of lessonEvents) {
    if (!eligible(event)) continue
    for (const [index,evidence] of event.evidence.entries()) {
      const key = `${event.eventId}:${index}`
      const occurrence = occurrences.get(key)
      if (!occurrence || occurrence.ref !== evidence.ref) continue
      if ((event.kind === "lesson.started" || event.kind === "lesson.ended") && evidence.ref.startsWith("lesson:")) {
        const match = /^lesson:([^@]+)@(0|[1-9][0-9]*)$/.exec(evidence.ref)
        if (!match || match[1] !== scope.lessonId) continue
        const timestamp = Number(match[2])
        if (!Number.isSafeInteger(timestamp) || timestamp !== Date.parse(event.occurredAt)) continue
        const targets = lessonEvents.filter(candidate=>Date.parse(candidate.occurredAt) === timestamp)
        if (targets.length !== 1 || !eligible(targets[0]!)) continue
        resolve(key,{kind:"lesson-event",lessonId:scope.lessonId,sessionId:scope.sessionId,
          eventId:targets[0]!.eventId,
          href:`/?vista=continuita&sessione=${encodeURIComponent(scope.sessionId)}#${encodeURIComponent(scope.lessonId)}`})
      } else if (event.kind === "circuit.proof.verified" && evidence.ref.startsWith("board:")) {
        // Only this occurrence's factual proof may validate its board target.
        // Journal add/update/delete and AI citations keep their own status.
        const embedId = event.payload.embedId
        if (typeof embedId !== "string" || evidence.ref !== `board:${embedId}` || !scene) continue
        const elements = scene.elements.filter(element=>element.id === embedId)
        if (elements.length !== 1 || elements[0]!.isDeleted === true) continue
        const legacy = toLegacyLessonOsEvent(event)
        if (!legacy) continue
        const verified = await circuitStudyEvidence(JSON.stringify({elements}),[legacy])
        if (verified.length !== 1 || verified[0]!.embedId !== embedId) {
          result.set(key,Object.freeze({...occurrence,status:"missing",reason:"artifact-unverified",target:null}))
          continue
        }
        resolve(key,{kind:"board-element",lessonId:scope.lessonId,elementId:embedId,
          href:`/#${encodeURIComponent(scope.lessonId)}`})
      }
    }
  }
  return result
}
