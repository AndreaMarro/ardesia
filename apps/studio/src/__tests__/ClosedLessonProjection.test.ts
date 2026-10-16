import { describe, expect, it } from "vitest"
import { createEventEnvelopeV2, type JsonObject } from "../core/contracts/eventEnvelope"
import { projectClosedLessonEvents } from "../store/lessonMaterial"

const ROOM = "closed-material-synthetic"
const A = "11111111-1111-4111-8111-111111111111"
const B = "22222222-2222-4222-8222-222222222222"
const producer = { id: "test.closed.material", version: "1.0.0", commitSha: "f".repeat(40) }
let next = 0
function event(seq: number, kind: string, payload: JsonObject, sessionId = A, lessonId = ROOM) {
  return { ...createEventEnvelopeV2({ lessonId, sessionId, kind, payload,
    actor: { type: "teacher", id: `synthetic-${sessionId}` }, producer,
    causationId: null, idempotencyKey: null,
    evidence: [{ ref: `board:synthetic-${seq}`, resolution: "verified" }],
  }, { eventId: () => `bbbbbbbb-bbbb-4bbb-8bbb-${(++next).toString(16).padStart(12, "0")}`, now: () => new Date(1000) }), seq }
}
const start = (seq = 1, sessionId = A, lessonId = ROOM) => event(seq, "lesson.started", { room: lessonId }, sessionId, lessonId)
const end = (seq = 3, sessionId = A, lessonId = ROOM) => event(seq, "lesson.ended", { room: lessonId }, sessionId, lessonId)
const concept = (seq = 2, sessionId = A, lessonId = ROOM) => event(seq, "concept.introduced", { conceptId: "ohm", labels: { it: lessonId === ROOM ? "Legge di Ohm" : "FOREIGN" } }, sessionId, lessonId)
const error = (seq: number, sessionId = A) => event(seq, "error.observed", { errorId: "same-error-id", conceptId: "ohm", labels: { it: "Riferimento errato" } }, sessionId)
const exercise = (seq: number, sessionId = A) => event(seq, "exercise.completed", { exerciseId: "same-exercise-id", correctsErrorId: "same-error-id", conceptId: "ohm", labels: { it: "Riferimento corretto" } }, sessionId)

describe("closed canonical material projection", () => {
  it("uses canonical lesson/session/seq identity with interleaved lessons at the same timestamp", () => {
    const foreign = "foreign-synthetic"
    const rows = [start(), start(2, B, foreign), concept(3), concept(4, B, foreign), end(5), end(6, B, foreign)]
    const projected = projectClosedLessonEvents(rows, ROOM)
    expect(projected.digest.concepts.map(c => c.label)).toEqual(["Legge di Ohm"])
    expect(projected.watermarks).toEqual([{ sessionId: A, endEventId: rows[4]!.eventId, endSeq: 5 }])
  })

  it("another author cannot correct this session's error merely by reusing the same error ID", () => {
    const rows = [start(), error(2), start(3, B), exercise(4, B), end(5), end(6, B)]
    const projected = projectClosedLessonEvents(rows, ROOM)
    expect(projected.digest.errors).toEqual([expect.objectContaining({ id: "same-error-id", sessionId: A, corrected: false })])
    expect(projected.watermarks.map(w => w.sessionId)).toEqual([A, B])
  })

  it("retains the same-session correction, result, exercise and original evidence IDs", () => {
    const solved = event(5, "simulation.circuit.solved", { experimentId: "synthetic-series", labels: { it: "Corrente calcolata" }, currentMa: 4 })
    const cited = event(6, "material.cited", { materialId: "source-synthetic", labels: { it: "Fonte sintetica" } })
    const rows = [start(), concept(), error(3), exercise(4), solved, cited, end(7)]
    const copy = structuredClone(rows)
    const { digest } = projectClosedLessonEvents(rows, ROOM)
    expect(digest.errors[0]).toMatchObject({ id: "same-error-id", corrected: true, sessionId: A, evidence: ["board:synthetic-3"] })
    expect(digest.results).toEqual([expect.objectContaining({ eventId: solved.eventId, sessionId: A, currentMa: 4, label: "Corrente calcolata", evidence: solved.evidence })])
    expect(digest.exercises).toEqual([expect.objectContaining({ eventId: rows[3]!.eventId, label: "Riferimento corretto" })])
    expect(digest.materials).toEqual([expect.objectContaining({ id: "source-synthetic", label: "Fonte sintetica", evidence: cited.evidence })])
    expect(rows).toEqual(copy)
  })

  it.each(["missing-start", "missing-end", "double-end", "after-end", "wrong-actor", "wrong-producer", "wrong-room", "duplicate-event", "duplicate-seq"] as const)(
    "refuses an unprovable closed revision (%s)", fault => {
      let rows = [start(), concept(), end()]
      if (fault === "missing-start") rows = rows.slice(1)
      if (fault === "missing-end") rows = rows.slice(0, 2)
      if (fault === "double-end") rows.push(end(4))
      if (fault === "after-end") rows.push(concept(4))
      if (fault === "wrong-actor") rows[1] = { ...rows[1]!, actor: { type: "teacher", id: "another-author" } }
      if (fault === "wrong-producer") rows[1] = { ...rows[1]!, producer: { ...producer, commitSha: "a".repeat(40) } }
      if (fault === "wrong-room") rows[2] = { ...rows[2]!, payload: { room: "different-room" } }
      if (fault === "duplicate-event") rows[1] = { ...rows[1]!, eventId: rows[0]!.eventId }
      if (fault === "duplicate-seq") rows[1] = { ...rows[1]!, seq: rows[0]!.seq }
      expect(() => projectClosedLessonEvents(rows, ROOM)).toThrow()
    },
  )

  it("does not turn an absent current into zero in recorded results", () => {
    const rows = [start(), event(2, "simulation.circuit.solved", { experimentId: "synthetic", labels: { it: "Dato assente" } }), end()]
    expect(projectClosedLessonEvents(rows, ROOM).digest.results?.[0]).not.toHaveProperty("currentMa")
  })

  it("does not attest an empty log or a legacy row as complete canonical material", () => {
    expect(() => projectClosedLessonEvents([], ROOM)).toThrow()
    expect(() => projectClosedLessonEvents([{ kind: "lesson.ended", room: ROOM, t: 1000, seq: 1, evidence: [] }], ROOM)).toThrow()
  })
})
