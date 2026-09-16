import { describe, it, expect } from "vitest"
import { InMemoryEventLog } from "../lessonos/eventlog"
import { createEventLogStore, IndexedDbEventLog } from "../lessonos/indexedDbEventLog"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"
import { materialize } from "../lessonos/materializer"
import {
  buildStudyDigest,
  buildLessonStudyDigest,
  type StudyDigest,
} from "../lessonos/studyDigest"

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
})

// NOTA DIAGNOSI C2A (overlap temporale RED): con il vecchio
// `buildRoomStudyDigest` (finestra lesson.started/ended) questo scenario
// dava `[ 'err:a', 'err:b' ]` — 130 ∈ [100,200] contaminava il digest A.
// La funzione temporale e' stata eliminata; la copertura vive nel Test 1
// sotto, sul path identity-scoped.

describe("buildLessonStudyDigest (identity-scoped, C2A)", () => {
  // Lezione A e B con UUID e timestamp deliberatamente intrecciati: l'unico
  // segnale che separa e' lessonId, mai il tempo.
  const LESSON_A = "lezione-a"
  const LESSON_B = "lezione-b"
  const SESSION_A1 = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1"
  const SESSION_A2 = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa2"
  const SESSION_B1 = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb1"
  const BUILD_SHA = "a".repeat(40)

  let envSeq = 0

  function envelopeV2(
    lessonId: string,
    sessionId: string,
    kind: string,
    occurredAt: string,
    payload: Record<string, unknown>,
  ): Omit<AppendedEventEnvelopeV2, "seq"> {
    envSeq += 1
    return {
      schemaVersion: 2,
      eventId: `70000000-0000-4000-8000-${String(envSeq).padStart(12, "0")}`,
      lessonId,
      sessionId,
      kind,
      occurredAt,
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: {
        id: "com.github.andreamarro.ardesia.studio",
        version: "0.0.0",
        commitSha: BUILD_SHA,
      },
      causationId: null,
      idempotencyKey: `digest:${envSeq}`,
      evidence: [{ ref: `lesson:${lessonId}@${envSeq}`, resolution: "verified" }],
      payload,
    } as Omit<AppendedEventEnvelopeV2, "seq">
  }

  function lessonStarted(lessonId: string, sessionId: string, occurredAt: string) {
    return envelopeV2(lessonId, sessionId, "lesson.started", occurredAt, { room: lessonId })
  }

  function errorObserved(
    lessonId: string,
    sessionId: string,
    errorId: string,
    conceptId: string,
    occurredAt: string,
  ) {
    return envelopeV2(lessonId, sessionId, "error.observed", occurredAt, {
      errorId,
      conceptId,
      labels: { it: errorId },
    })
  }

  /** Senza IndexedDB: createEventLogStore degrada all'in-memory canonico. */
  async function seededStore(envelopes: Array<Omit<AppendedEventEnvelopeV2, "seq">>) {
    const log = await createEventLogStore()
    for (const envelope of envelopes) {
      await log.appendEnvelope(envelope as AppendedEventEnvelopeV2)
    }
    return log
  }

  async function digestOfLesson(
    envelopes: Array<Omit<AppendedEventEnvelopeV2, "seq">>,
    lessonId: string,
  ): Promise<StudyDigest> {
    const log = await seededStore(envelopes)
    const scoped = await log.readEnvelopesByLesson(lessonId)
    return buildLessonStudyDigest(scoped)
  }

  it("Test 1 — overlap: A e B sovrapposte, il digest A esclude l'errore B", async () => {
    const digestA = await digestOfLesson(
      [
        lessonStarted(LESSON_A, SESSION_A1, "2026-08-01T00:01:40.000Z"),
        lessonStarted(LESSON_B, SESSION_B1, "2026-08-01T00:02:00.000Z"),
        errorObserved(LESSON_B, SESSION_B1, "err:b", "concetto-b", "2026-08-01T00:02:10.000Z"),
        errorObserved(LESSON_A, SESSION_A1, "err:a", "concetto-a", "2026-08-01T00:02:20.000Z"),
      ],
      LESSON_A,
    )
    expect(digestA.errors.map((e) => e.id)).toContain("err:a")
    expect(digestA.errors.map((e) => e.id)).not.toContain("err:b")
  })

  it("Test 2 — il timestamp non e' autorita': stesso istante, vince l'identita'", async () => {
    const digestA = await digestOfLesson(
      [
        errorObserved(LESSON_A, SESSION_A1, "err:a", "concetto-a", "2026-08-01T00:02:30.000Z"),
        errorObserved(LESSON_B, SESSION_B1, "err:b", "concetto-b", "2026-08-01T00:02:30.000Z"),
      ],
      LESSON_A,
    )
    expect(digestA.errors.map((e) => e.id)).toEqual(["err:a"])
  })

  it("Test 3 — due sessioni della stessa lesson: entrambe incluse", async () => {
    const digestA = await digestOfLesson(
      [
        errorObserved(LESSON_A, SESSION_A1, "err:a1", "concetto-a", "2026-08-01T09:00:00.000Z"),
        errorObserved(LESSON_A, SESSION_A2, "err:a2", "concetto-a", "2026-08-02T09:00:00.000Z"),
        errorObserved(LESSON_B, SESSION_B1, "err:b", "concetto-b", "2026-08-01T10:00:00.000Z"),
      ],
      LESSON_A,
    )
    expect(digestA.errors.map((e) => e.id).sort()).toEqual(["err:a1", "err:a2"])
  })

  it("Test 4 — altra lesson con timestamp identico: concetti separati per lessonId", async () => {
    const concept = (lessonId: string, sessionId: string, conceptId: string, label: string) =>
      envelopeV2(lessonId, sessionId, "concept.introduced", "2026-08-01T09:00:00.000Z", {
        conceptId,
        labels: { it: label },
      })
    const digestA = await digestOfLesson(
      [
        concept(LESSON_A, SESSION_A1, "concetto-a", "Concetto A"),
        concept(LESSON_B, SESSION_B1, "concetto-b", "Concetto B"),
      ],
      LESSON_A,
    )
    expect(digestA.concepts.map((c) => c.id)).toEqual(["concetto-a"])
  })

  it("Test 5 — advisory/non-fattuale: scartato, non inventa fatti", async () => {
    const digestA = await digestOfLesson(
      [
        envelopeV2(LESSON_A, SESSION_A1, "session.heartbeat", "2026-08-01T09:00:00.000Z", {}),
        errorObserved(LESSON_A, SESSION_A1, "err:a", "concetto-a", "2026-08-01T09:01:00.000Z"),
      ],
      LESSON_A,
    )
    expect(digestA.errors.map((e) => e.id)).toEqual(["err:a"])
    // Il concetto deriva dall'errore fattuale (arco deriva-da), non
    // dall'heartbeat: l'advisory non ha creato alcun nodo.
    expect(digestA.concepts.map((c) => c.id)).toEqual(["concetto-a"])
  })

  it("Test 6 — righe legacy con finestra valida: attribuite alla room, incluse", async () => {
    const { IDBFactory, IDBKeyRange: FakeKeyRange } = await import("fake-indexeddb")
    ;(globalThis as { IDBKeyRange?: unknown }).IDBKeyRange = FakeKeyRange
    const factory = new IDBFactory() as unknown as IDBFactory
    const log = new IndexedDbEventLog({ factory, dbName: `digest-legacy-${Math.random().toString(36).slice(2)}` })
    await log.open()
    const lines = [
      { seq: 1, kind: "lesson.started", room: "lezione-a", t: 100, evidence: ["lesson:lezione-a@100"] },
      { seq: 2, kind: "error.observed", errorId: "err:legacy-a", conceptId: "c", labels: { it: "Legacy A" }, t: 140, evidence: ["board:legacy-a"] },
      { seq: 3, kind: "lesson.ended", room: "lezione-a", t: 200, evidence: ["lesson:lezione-a@200"] },
      { seq: 4, kind: "lesson.started", room: "lezione-b", t: 300, evidence: ["lesson:lezione-b@300"] },
      { seq: 5, kind: "error.observed", errorId: "err:legacy-b", conceptId: "c", labels: { it: "Legacy B" }, t: 350, evidence: ["board:legacy-b"] },
      { seq: 6, kind: "lesson.ended", room: "lezione-b", t: 400, evidence: ["lesson:lezione-b@400"] },
    ]
    await log.importSnapshot(
      new Blob([`${lines.map((line) => JSON.stringify(line)).join("\n")}\n`], {
        type: "application/x-ndjson",
      }),
    )
    const digestA = buildLessonStudyDigest(await log.readEnvelopesByLesson("lezione-a"))
    await log.close()

    expect(digestA.errors.map((e) => e.id)).toEqual(["err:legacy-a"])
  })

  it("Test 6b — righe legacy con finestre sovrapposte: non attribuibili, digest vuoto (fail-soft)", async () => {
    // Intervalli A:[1..6] e B:[2..5] sovrapposti: il modello lifecycle li
    // dichiara entrambi invalidi (storia corrotta). Niente viene attribuito
    // a una lezione: il digest e' vuoto invece di mescolare A e B.
    const { IDBFactory, IDBKeyRange: FakeKeyRange } = await import("fake-indexeddb")
    ;(globalThis as { IDBKeyRange?: unknown }).IDBKeyRange = FakeKeyRange
    const factory = new IDBFactory() as unknown as IDBFactory
    const log = new IndexedDbEventLog({ factory, dbName: `digest-legacy-${Math.random().toString(36).slice(2)}` })
    await log.open()
    const lines = [
      { seq: 1, kind: "lesson.started", room: "lezione-a", t: 100, evidence: ["lesson:lezione-a@100"] },
      { seq: 2, kind: "lesson.started", room: "lezione-b", t: 120, evidence: ["lesson:lezione-b@120"] },
      { seq: 3, kind: "error.observed", errorId: "err:legacy-b", conceptId: "c", labels: { it: "Legacy B" }, t: 130, evidence: ["board:legacy-b"] },
      { seq: 4, kind: "error.observed", errorId: "err:legacy-a", conceptId: "c", labels: { it: "Legacy A" }, t: 140, evidence: ["board:legacy-a"] },
      { seq: 5, kind: "lesson.ended", room: "lezione-b", t: 180, evidence: ["lesson:lezione-b@180"] },
      { seq: 6, kind: "lesson.ended", room: "lezione-a", t: 200, evidence: ["lesson:lezione-a@200"] },
    ]
    await log.importSnapshot(
      new Blob([`${lines.map((line) => JSON.stringify(line)).join("\n")}\n`], {
        type: "application/x-ndjson",
      }),
    )
    const digestA = buildLessonStudyDigest(await log.readEnvelopesByLesson("lezione-a"))
    await log.close()

    expect(digestA).toEqual({ concepts: [], errors: [] })
  })
})
