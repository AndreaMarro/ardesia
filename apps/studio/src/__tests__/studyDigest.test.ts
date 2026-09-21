import { describe, it, expect } from "vitest"
import { InMemoryEventLog } from "../lessonos/eventlog"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import { materialize } from "../lessonos/materializer"
import { buildStudyDigest, buildLessonStudyDigest } from "../lessonos/studyDigest"

describe("buildStudyDigest (materiale di studio dal grafo LessonOS)", () => {
  it("estrae concetti + errori break→explain (incl. simulation.error.observed) con provenienza e stato-corretto", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "concept.introduced",
      conceptId: "circuito_chiuso",
      labels: { it: "Circuito chiuso" },
      t: 1,
      evidence: ["manual:page:29"],
    })
    // Errore del SIMULATORE (evento P30): nodo errore + arco deriva-da concetto.
    await log.append({
      kind: "simulation.error.observed",
      errorId: "sim-error:v1:open-circuit",
      conceptId: "circuito_chiuso",
      sceneId: "scene:v1",
      experimentId: "v1-cap6-esp1",
      labels: { it: "Circuito aperto" },
      t: 2,
      evidence: ["simulation:scene:v1-cap6-esp1"],
    })
    // Correzione: esercizio che corregge l'errore → correctedAt.
    await log.append({
      kind: "exercise.completed",
      exerciseId: "ex:ricollega",
      correctsErrorId: "sim-error:v1:open-circuit",
      labels: { it: "Ricollega il negativo" },
      t: 3,
      evidence: ["board:fix"],
    })

    const digest = buildStudyDigest(materialize(await log.readAll()))

    expect(digest.concepts.map((c) => c.id)).toContain("circuito_chiuso")
    const err = digest.errors.find((e) => e.id === "sim-error:v1:open-circuit")
    expect(err).toMatchObject({
      conceptId: "circuito_chiuso",
      corrected: true,
      label: "Circuito aperto",
    })
    expect(err?.evidence).toContain("simulation:scene:v1-cap6-esp1")
  })

  it("errore non corretto → corrected false; digest deterministico", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "simulation.error.observed",
      errorId: "sim-error:x",
      conceptId: "resistenza",
      labels: { it: "Resistenza mancante" },
      t: 1,
      evidence: ["simulation:scene:x"],
    })
    const events = await log.readAll()
    const digest = buildStudyDigest(materialize(events))
    expect(digest.errors.find((e) => e.id === "sim-error:x")?.corrected).toBe(false)
    expect(buildStudyDigest(materialize(events))).toEqual(digest)
  })

  it("projects scoped canonical facts with provenance, ignoring advisory envelopes", async () => {
    const log = await createEventLogStore({ factory: undefined })
    let counter = 0
    const append = async (lessonId: string, kind: string, payload: Record<string, string | { it: string }>) => {
      await log.appendEnvelope(createEventEnvelopeV2({ lessonId,
        sessionId: "11111111-1111-4111-8111-111111111111", kind, payload,
        actor: { type: "teacher", id: "synthetic" },
        producer: { id: "test.digest", version: "1.0.0", commitSha: "a".repeat(40) },
        causationId: null, idempotencyKey: null,
        evidence: [{ ref: `board:${lessonId}`, resolution: "verified" }],
      }, { eventId: () => `00000000-0000-4000-8000-${(++counter).toString(16).padStart(12, "0")}`,
        now: () => new Date(1000) }))
    }
    await append("A", "concept.introduced", { conceptId: "cA", labels: { it: "Concetto A" } })
    await append("A", "simulation.error.observed", { errorId: "err:A", conceptId: "cA", labels: { it: "Errore A" } })
    await append("B", "exercise.completed", { exerciseId: "ex:B", correctsErrorId: "err:A", labels: { it: "Correzione" } })
    await append("A", "tutor.suggestion.proposed", { conceptId: "advisory", labels: { it: "Not a fact" } })
    const digest = buildLessonStudyDigest(await log.readEnvelopesByLesson("A"))
    expect(digest.concepts).toEqual([{ id: "cA", label: "Concetto A", evidence: ["board:A"] }])
    expect(digest.errors).toEqual([{ id: "err:A", label: "Errore A", conceptId: "cA", corrected: false, evidence: ["board:A"] }])
    expect(buildLessonStudyDigest(await log.readEnvelopesByLesson("absent"))).toEqual({ concepts: [], errors: [] })
    await append("A", "exercise.completed", { exerciseId: "ex:A", correctsErrorId: "err:A", labels: { it: "Correzione" } })
    expect(buildLessonStudyDigest(await log.readEnvelopesByLesson("A")).errors[0]?.corrected).toBe(true)
  })
})
