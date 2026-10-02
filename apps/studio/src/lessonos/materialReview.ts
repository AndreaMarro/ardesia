import { assertLessonOsEnvelopePayload, type AnyEventEnvelopeV2 } from "./eventlog"
import { createEventEnvelopeV2, studioProducerIdentity } from "../core/contracts/eventEnvelope"

function reviewUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID().toLowerCase()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2,"0")).join("")
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}

export function createRecapReviewEvent(
  lessonId: string, revisionSha256: string, reviewerInput: string,
  action: "approve" | "revise" | "reject" | "flag", commentInput = "",
) {
  const reviewer = reviewerInput.trim()
  const comment = commentInput.trim()
  if (!reviewer) throw new Error("Indica il nome del docente che ha controllato il materiale")
  if (comment.length > 1000) throw new Error("La nota di revisione supera 1000 caratteri")
  const materialId = `recap:${lessonId}`
  return createEventEnvelopeV2({lessonId,sessionId:reviewUuid(),kind:"material.reviewed",
    actor:{type:"teacher",id:encodeURIComponent(reviewer)},producer:studioProducerIdentity(),
    causationId:null,idempotencyKey:null,
    evidence:[{ref:`material:${materialId}`,resolution:"verified" as const}],
    payload:{materialId,revisionSha256,action,reviewer,comment,labels:{it:"Revisione docente"}},
  },{eventId:reviewUuid,now:()=>new Date()})
}

/** Same filename/byte framing as Engine material_revision_sha256({"recap.html": bytes}). */
export async function recapRevisionSha256(html: string): Promise<string> {
  const encoder = new TextEncoder()
  const name = encoder.encode("recap.html")
  const body = encoder.encode(html)
  const framed = new Uint8Array(16 + name.length + body.length)
  const view = new DataView(framed.buffer)
  view.setBigUint64(0, BigInt(name.length), false)
  framed.set(name, 8)
  view.setBigUint64(8 + name.length, BigInt(body.length), false)
  framed.set(body, 16 + name.length)
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", framed))]
    .map(value => value.toString(16).padStart(2,"0")).join("")
}

/** TeacherReviewSet semantics over the lesson's canonical append-only events. */
export function recapReviewStatus(
  events: readonly AnyEventEnvelopeV2[], lessonId: string, revisionSha256: string,
): Readonly<{approved:boolean;reviewer:string|null}> {
  const materialId = `recap:${lessonId}`
  let reviewer: string | null = null
  let blocked = false
  for (const event of events) {
    if (event.kind !== "material.reviewed" || event.lessonId !== lessonId) continue
    assertLessonOsEnvelopePayload(event.kind,event.payload)
    const payload = event.payload
    if (payload.materialId !== materialId || payload.revisionSha256 !== revisionSha256 ||
        event.actor.type !== "teacher" || event.actor.id !== encodeURIComponent(String(payload.reviewer)) ||
        !event.evidence.some(item => item.ref === `material:${materialId}` && item.resolution === "verified")) continue
    if (payload.action === "revise" || payload.action === "reject") blocked = true
    if (payload.action === "approve") reviewer = String(payload.reviewer)
  }
  return {approved:reviewer !== null && !blocked,reviewer:blocked ? null : reviewer}
}
