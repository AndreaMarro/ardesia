import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import viteConfig, { resolveBuildCommitSha } from "../../vite.config"
import {
  EVENT_ENVELOPE_SCHEMA_VERSION,
  assertEventEnvelopeV2,
  assertFounderBetaAuthority,
  assertFullCommitSha,
  createEventEnvelopeV2,
  studioProducerIdentity,
  type EventActor,
  type EventEnvelopeDraft,
  type EventEnvelopeV2,
  type JsonObject,
} from "../core/contracts/eventEnvelope"

const SHA_A = "a".repeat(40)
const SHA_B = "b".repeat(40)
const EVENT_ID = "11111111-1111-4111-8111-111111111111"
const SESSION_ID = "22222222-2222-4222-8222-222222222222"
const CAUSATION_ID = "33333333-3333-4333-8333-333333333333"
const OCCURRED_AT = "2026-07-18T02:00:00.000Z"
const DRAFT_KEYS = [
  "lessonId",
  "sessionId",
  "kind",
  "actor",
  "producer",
  "causationId",
  "idempotencyKey",
  "evidence",
  "payload",
] as const
const SHA_PROVIDERS = [
  "ARDESIA_GIT_SHA",
  "VERCEL_GIT_COMMIT_SHA",
  "GITHUB_SHA",
  "RENDER_GIT_COMMIT",
] as const
type TeacherActor = Extract<EventActor, { readonly type: "teacher" }>
const COMPILE_TIME_TEACHER_ACTOR: TeacherActor = { type: "teacher", id: "teacher-1" }

const deps = {
  eventId: () => EVENT_ID,
  now: () => new Date(OCCURRED_AT),
}

function baseDraft(
  overrides: Partial<EventEnvelopeDraft<string, JsonObject>> = {},
): EventEnvelopeDraft<string, JsonObject> {
  return {
    lessonId: "founder-beta-room_1",
    sessionId: SESSION_ID,
    kind: "lesson.started",
    actor: { type: "teacher", id: "teacher-1" },
    producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.0.0", commitSha: SHA_A },
    causationId: null,
    idempotencyKey: "lesson.started:founder-beta-room_1",
    evidence: [{ ref: "lesson:founder-beta-room_1@start", resolution: "verified" }],
    payload: { room: "founder-beta-room_1", nested: { values: [1, true, null, "ok"] } },
    ...overrides,
  }
}

function createEnvelope(
  overrides: Partial<EventEnvelopeDraft<string, JsonObject>> = {},
): EventEnvelopeV2<string, JsonObject> {
  return createEventEnvelopeV2(baseDraft(overrides), deps)
}

function aiPayload(): JsonObject {
  return {
    model: { provider: "openai", id: "gpt-5", version: "2026-07-01" },
    sources: [{ ref: "manual:vol1:p30", resolution: "missing" }],
    actionLevel: "A0",
    humanReview: "pending",
  }
}

function aiDraft(kind = "ai.advice.proposed", causationId: string | null = null) {
  return baseDraft({
    kind,
    actor: { type: "system", id: "ai.consultative" },
    causationId,
    evidence: [{ ref: "manual:vol1:p30", resolution: "missing" }],
    payload: aiPayload(),
  })
}

function cloneEnvelope(envelope = createEnvelope()): Record<string, unknown> {
  return JSON.parse(JSON.stringify(envelope)) as Record<string, unknown>
}

describe("EventEnvelope v2 — canonical runtime contract", () => {
  it("espone schemaVersion 2 e produce esattamente i dodici campi canonici", () => {
    const envelope = createEnvelope()

    expect(EVENT_ENVELOPE_SCHEMA_VERSION).toBe(2)
    expect(Object.keys(envelope).sort()).toEqual([
      "actor",
      "causationId",
      "eventId",
      "evidence",
      "idempotencyKey",
      "kind",
      "lessonId",
      "occurredAt",
      "payload",
      "producer",
      "schemaVersion",
      "sessionId",
    ])
    expect(envelope).toMatchObject({ schemaVersion: 2, eventId: EVENT_ID, occurredAt: OCCURRED_AT })
  })

  it("la factory accetta esattamente nove chiavi draft e rifiuta i tre campi generati dal caller", () => {
    for (const generated of ["schemaVersion", "eventId", "occurredAt"] as const) {
      const draft = { ...baseDraft(), [generated]: generated === "schemaVersion" ? 2 : "caller-value" }
      expect(() => createEventEnvelopeV2(draft as unknown as EventEnvelopeDraft<string, JsonObject>, deps)).toThrow(
        /unknown|chiav|draft/i,
      )
    }
  })

  it("rifiuta ciascuna delle nove chiavi draft se assente e ogni chiave arbitraria", () => {
    for (const key of DRAFT_KEYS) {
      const draft = { ...baseDraft() } as Record<string, unknown>
      delete draft[key]
      expect(
        () => createEventEnvelopeV2(draft as unknown as EventEnvelopeDraft<string, JsonObject>, deps),
        key,
      ).toThrow(/unknown|missing|chiav|draft/i)
    }
    const arbitrary = { ...baseDraft(), arbitrary: true }
    expect(() =>
      createEventEnvelopeV2(arbitrary as unknown as EventEnvelopeDraft<string, JsonObject>, deps),
    ).toThrow(/unknown|chiav|draft/i)
  })

  it("rifiuta accessor root senza invocarlo e draft con prototipo custom", () => {
    let reads = 0
    const accessorDraft = { ...baseDraft() }
    Object.defineProperty(accessorDraft, "lessonId", {
      enumerable: true,
      get() {
        reads += 1
        return "founder-beta-room_1"
      },
    })
    expect(() => createEventEnvelopeV2(accessorDraft, deps)).toThrow(/accessor|data propert/i)
    expect(reads).toBe(0)

    const customPrototype = Object.assign(Object.create({ inherited: true }), baseDraft())
    expect(() =>
      createEventEnvelopeV2(customPrototype as EventEnvelopeDraft<string, JsonObject>, deps),
    ).toThrow(/plain|prototype/i)
  })

  it("l'assertion accetta un envelope JSON parsed, mutabile e non frozen", () => {
    const parsed: unknown = JSON.parse(JSON.stringify(createEnvelope()))
    expect(Object.isFrozen(parsed)).toBe(false)
    expect(() => assertEventEnvelopeV2(parsed)).not.toThrow()
  })

  it("accetta esattamente gli actor teacher, system e plugin", () => {
    for (const actor of [
      COMPILE_TIME_TEACHER_ACTOR,
      { type: "system", id: "scheduler" },
      { type: "plugin", id: "plugin-instance-7" },
    ] as const) {
      expect(createEnvelope({ actor }).actor).toEqual(actor)
    }
    expect(() => createEnvelope({ actor: { type: "ai", id: "ai.consultative" } as never })).toThrow(/actor/i)
  })

  it("rifiuta ciascun campo top-level richiesto se assente", () => {
    const valid = cloneEnvelope()
    for (const key of Object.keys(valid)) {
      const candidate = { ...valid }
      delete candidate[key]
      expect(() => assertEventEnvelopeV2(candidate), key).toThrow()
    }
  })

  it("rifiuta chiavi sconosciute a envelope, actor, producer ed evidence", () => {
    const top = { ...cloneEnvelope(), surprise: true }
    expect(() => assertEventEnvelopeV2(top)).toThrow(/unknown|chiav/i)

    for (const nestedKey of ["actor", "producer"] as const) {
      const candidate = cloneEnvelope()
      candidate[nestedKey] = { ...(candidate[nestedKey] as object), surprise: true }
      expect(() => assertEventEnvelopeV2(candidate), nestedKey).toThrow(/unknown|chiav/i)
    }

    const evidence = cloneEnvelope()
    evidence.evidence = [{ ref: "manual:vol1:p30", resolution: "verified", surprise: true }]
    expect(() => assertEventEnvelopeV2(evidence)).toThrow(/unknown|chiav/i)
  })

  it("richiede UUID canonici per eventId, sessionId e causationId non nullo", () => {
    for (const [field, value] of [
      ["eventId", "short"],
      ["sessionId", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa".toUpperCase()],
      ["causationId", "33333333-3333-3333-3333-33333333333z"],
    ] as const) {
      const candidate = cloneEnvelope()
      candidate[field] = value
      expect(() => assertEventEnvelopeV2(candidate), field).toThrow(/UUID/i)
    }
    expect(createEnvelope({ causationId: CAUSATION_ID }).causationId).toBe(CAUSATION_ID)
  })

  it("valida lessonId non normalizzato, kind dotted e actor id senza whitespace", () => {
    expect(createEnvelope({ lessonId: "Room_A-1.2" }).lessonId).toBe("Room_A-1.2")
    for (const patch of [
      { lessonId: "../escape" },
      { lessonId: " room " },
      { kind: "lesson" },
      { kind: "Lesson.Started" },
      { kind: " lesson.started" },
    ]) {
      expect(() => createEnvelope(patch as Partial<EventEnvelopeDraft<string, JsonObject>>)).toThrow()
    }
  })

  it("riusa esattamente i boundary validateRoomId inclusi reserved roots e lunghezza 128", () => {
    const maxRoom = `r${"a".repeat(127)}`
    expect(createEnvelope({ lessonId: maxRoom }).lessonId).toBe(maxRoom)
    for (const lessonId of [
      "",
      `r${"a".repeat(128)}`,
      ".",
      "..",
      "room.",
      "audio",
      "BOARD.EXCALIDRAW",
      "events.jsonl",
      "session.yaml",
      "lessonos-events.jsonl",
      "CON",
      "com1.txt",
      "LPT9",
      "room/name",
    ]) {
      expect(() => createEnvelope({ lessonId }), lessonId).toThrow(/lessonId|room/i)
    }
  })

  it("rifiuta schemaVersion 1 anche con gli altri undici campi validi", () => {
    const candidate = cloneEnvelope()
    candidate.schemaVersion = 1
    expect(() => assertEventEnvelopeV2(candidate)).toThrow(/schemaVersion|2/i)
  })

  it("accetta solo timestamp UTC ISO-8601 canonici con millisecondi", () => {
    expect(createEnvelope().occurredAt).toBe(OCCURRED_AT)
    for (const occurredAt of [
      "1784340000000",
      "2026-07-18T04:00:00+02:00",
      "2026-07-18T02:00:00Z",
      "not-a-date",
      " 2026-07-18T02:00:00.000Z",
    ]) {
      const candidate = cloneEnvelope()
      candidate.occurredAt = occurredAt
      expect(() => assertEventEnvelopeV2(candidate), occurredAt).toThrow(/occurredAt|timestamp/i)
    }
  })

  it("valida producer reverse-DNS, SemVer e SHA completa", () => {
    expect(
      createEnvelope({
        producer: { id: "io.maestro.plugin-ref", version: "1.2.3-beta.1+build.7", commitSha: SHA_A },
      }).producer,
    ).toEqual({ id: "io.maestro.plugin-ref", version: "1.2.3-beta.1+build.7", commitSha: SHA_A })

    for (const producer of [
      { id: "studio", version: "1.2.3", commitSha: SHA_A },
      { id: "Com.Github.Studio", version: "1.2.3", commitSha: SHA_A },
      { id: "com.github.studio", version: "1.2", commitSha: SHA_A },
      { id: "com.github.studio", version: "01.2.3", commitSha: SHA_A },
      { id: "com.github.studio", version: "1.2.3", commitSha: "deadbeef" },
    ]) {
      expect(() => createEnvelope({ producer })).toThrow()
    }
  })

  it("assertFullCommitSha accetta solo quaranta caratteri esadecimali", () => {
    expect(() => assertFullCommitSha(SHA_A)).not.toThrow()
    expect(() => assertFullCommitSha(SHA_A.toUpperCase())).not.toThrow()
    for (const value of [undefined, "", "unknown", "deadbeef", ` ${SHA_A}`, `${SHA_A} `, "g".repeat(40)]) {
      expect(() => assertFullCommitSha(value), String(value)).toThrow(/SHA/i)
    }
  })

  it("preserva null per idempotencyKey e rifiuta la stringa vuota", () => {
    expect(createEnvelope({ idempotencyKey: null }).idempotencyKey).toBeNull()
    expect(() => createEnvelope({ idempotencyKey: "" })).toThrow(/idempotency/i)
  })

  it("richiede evidence non vuota, strict, con namespace:payload e resolution chiusa", () => {
    expect(
      createEnvelope({
        evidence: [
          { ref: "board:element-1", resolution: "verified" },
          { ref: "manual:vol1:p30 with context", resolution: "missing" },
        ],
      }).evidence,
    ).toHaveLength(2)

    for (const evidence of [
      [],
      [{ ref: "manual:", resolution: "verified" }],
      [{ ref: "manual:   ", resolution: "verified" }],
      [{ ref: " manual:vol1", resolution: "verified" }],
      [{ ref: "manual:vol1 ", resolution: "verified" }],
      [{ ref: "MANUAL:vol1", resolution: "verified" }],
      [{ ref: "manual:vol1", resolution: "trusted" }],
    ]) {
      expect(() => createEnvelope({ evidence: evidence as never })).toThrow(/evidence/i)
    }
  })
})

describe("EventEnvelope v2 — strict bounded JSON and immutability", () => {
  it("accetta oggetti JSON plain con primitive, array e oggetti annidati", () => {
    const payload = { string: "x", number: 1.5, bool: false, nil: null, array: [1, { nested: "yes" }] }
    expect(createEnvelope({ payload }).payload).toEqual(payload)
  })

  it("rifiuta array e null come root del payload", () => {
    for (const payload of [[], null]) {
      expect(() => createEnvelope({ payload: payload as never })).toThrow(/payload|object/i)
    }
  })

  it("rifiuta cicli prima di structuredClone", () => {
    const payload: Record<string, unknown> = {}
    payload.self = payload
    expect(() => createEnvelope({ payload: payload as JsonObject })).toThrow(/cycle|ciclo|JSON/i)
  })

  it("accetta alias DAG aciclici e ne fotografa entrambi i rami", () => {
    const shared = { value: "before" }
    const envelope = createEnvelope({ payload: { left: shared, right: shared } })
    shared.value = "after"
    expect(envelope.payload).toEqual({ left: { value: "before" }, right: { value: "before" } })
  })

  it("rifiuta undefined, array sparse e proprietà extra sugli array", () => {
    expect(() => createEnvelope({ payload: { value: undefined } as never })).toThrow(/undefined|JSON/i)
    const sparse = new Array(2)
    sparse[1] = "present"
    expect(() => createEnvelope({ payload: { sparse } as never })).toThrow(/sparse|JSON/i)
    const withExtra = ["value"] as string[] & { extra?: string }
    withExtra.extra = "not-json-array-data"
    expect(() => createEnvelope({ payload: { withExtra } as never })).toThrow(/dense|extra|JSON/i)
  })

  it("rifiuta function, symbol, bigint e numeri non finiti", () => {
    for (const value of [() => 1, Symbol("x"), 1n, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => createEnvelope({ payload: { value } as never }), String(value)).toThrow(/JSON|finite|support/i)
    }
  })

  it("rifiuta accessor senza invocarlo", () => {
    let reads = 0
    const payload = {}
    Object.defineProperty(payload, "secret", {
      enumerable: true,
      get() {
        reads += 1
        return "value"
      },
    })
    expect(() => createEnvelope({ payload })).toThrow(/accessor|data propert|JSON/i)
    expect(reads).toBe(0)
  })

  it("rifiuta accessor e prototipi non plain anche se annidati", () => {
    let reads = 0
    const nested = {}
    Object.defineProperty(nested, "secret", {
      enumerable: true,
      get() {
        reads += 1
        return "value"
      },
    })
    expect(() => createEnvelope({ payload: { nested } })).toThrow(/accessor|data propert|JSON/i)
    expect(reads).toBe(0)
    expect(() => createEnvelope({ payload: { nested: new Date() } as never })).toThrow(/plain|prototype|JSON/i)
  })

  it("rifiuta proprietà symbol e non-enumerable", () => {
    const symbolPayload: Record<PropertyKey, unknown> = { visible: true }
    symbolPayload[Symbol("hidden")] = true
    expect(() => createEnvelope({ payload: symbolPayload as JsonObject })).toThrow(/symbol|JSON/i)

    const hiddenPayload = { visible: true }
    Object.defineProperty(hiddenPayload, "hidden", { enumerable: false, value: true })
    expect(() => createEnvelope({ payload: hiddenPayload })).toThrow(/enumerable|JSON/i)
  })

  it("rifiuta Date, Map, Set, classi e prototipi non plain", () => {
    class CustomPayload {
      value = 1
    }
    for (const payload of [new Date(), new Map(), new Set(), new CustomPayload(), Object.create(null)]) {
      expect(() => createEnvelope({ payload: payload as JsonObject })).toThrow(/plain|prototype|payload/i)
    }
  })

  it("accetta depth 32 e rifiuta depth 33 senza ricorsione", () => {
    function nested(depth: number): JsonObject {
      const root: Record<string, unknown> = {}
      let cursor = root
      for (let i = 0; i < depth; i += 1) {
        const next: Record<string, unknown> = {}
        cursor.next = next
        cursor = next
      }
      return root as JsonObject
    }
    expect(() => createEnvelope({ payload: nested(32) })).not.toThrow()
    expect(() => createEnvelope({ payload: nested(33) })).toThrow(/depth|32/i)
  })

  it("accetta il budget di 10.000 valori e rifiuta il valore 10.001", () => {
    expect(() => createEnvelope({ payload: { values: Array(9_998).fill(0) } })).not.toThrow()
    expect(() => createEnvelope({ payload: { values: Array(9_999).fill(0) } })).toThrow(/10.?000|budget/i)
  })

  it("isola il risultato da mutazioni successive di actor, producer, evidence e payload", () => {
    const draft = {
      ...baseDraft(),
      actor: { type: "teacher" as const, id: "teacher-before" },
      producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.0.0", commitSha: SHA_A },
      evidence: [{ ref: "lesson:before", resolution: "verified" as const }],
      payload: { nested: { value: "before" } },
    }
    const envelope = createEventEnvelopeV2(draft, deps)

    draft.actor.id = "teacher-after"
    draft.producer.version = "9.9.9"
    draft.evidence[0]!.ref = "lesson:after"
    draft.payload.nested.value = "after"

    expect(envelope.actor.id).toBe("teacher-before")
    expect(envelope.producer.version).toBe("0.0.0")
    expect(envelope.evidence[0]?.ref).toBe("lesson:before")
    expect(envelope.payload).toEqual({ nested: { value: "before" } })
  })

  it("fotografa il draft prima che le dipendenze iniettate possano mutarlo", () => {
    const draft = {
      ...baseDraft(),
      actor: { type: "teacher" as const, id: "teacher-before" },
      evidence: [{ ref: "lesson:before", resolution: "verified" as const }],
      payload: { nested: { value: "before" } },
    }
    const envelope = createEventEnvelopeV2(draft, {
      eventId() {
        draft.actor.id = "teacher-mutated-by-dependency"
        draft.evidence[0]!.ref = "lesson:mutated-by-dependency"
        draft.payload.nested.value = "mutated-by-dependency"
        return EVENT_ID
      },
      now: deps.now,
    })

    expect(envelope.actor.id).toBe("teacher-before")
    expect(envelope.evidence[0]?.ref).toBe("lesson:before")
    expect(envelope.payload).toEqual({ nested: { value: "before" } })
  })

  it("congela ricorsivamente envelope, array e oggetti annidati", () => {
    const envelope = createEnvelope()
    const payload = envelope.payload as { nested: { values: readonly unknown[] } }
    for (const value of [
      envelope,
      envelope.actor,
      envelope.producer,
      envelope.evidence,
      envelope.evidence[0],
      envelope.payload,
      payload.nested,
      payload.nested.values,
    ]) {
      expect(Object.isFrozen(value)).toBe(true)
    }
    expect(() => {
      ;(payload.nested as { values: unknown[] }).values.push("mutation")
    }).toThrow()
  })

  it("rifiuta dipendenze che generano eventId o Date non canonici", () => {
    expect(() => createEventEnvelopeV2(baseDraft(), { ...deps, eventId: () => "not-a-uuid" })).toThrow(/UUID/i)
    expect(() => createEventEnvelopeV2(baseDraft(), { ...deps, now: () => new Date(Number.NaN) })).toThrow()
    const forgedDate = new Date(Number.NaN)
    forgedDate.toISOString = () => OCCURRED_AT
    expect(() => createEventEnvelopeV2(baseDraft(), { ...deps, now: () => forgedDate })).toThrow()
  })
})

describe("EventEnvelope v2 — Founder Beta AI authority", () => {
  it("accetta ai.advice.proposed solo come system ai.consultative con review pending", () => {
    const envelope = createEventEnvelopeV2(aiDraft(), deps)
    expect(envelope.actor).toEqual({ type: "system", id: "ai.consultative" })
    expect(envelope.payload).toEqual(aiPayload())
    expect(() => assertFounderBetaAuthority(envelope)).not.toThrow()
  })

  it("accetta ai.advice.revised solo con causationId e crea un nuovo envelope", () => {
    const proposed = createEventEnvelopeV2(aiDraft(), deps)
    const revised = createEventEnvelopeV2(aiDraft("ai.advice.revised", proposed.eventId), {
      eventId: () => "44444444-4444-4444-8444-444444444444",
      now: () => new Date("2026-07-18T02:01:00.000Z"),
    })
    expect(revised.causationId).toBe(proposed.eventId)
    expect(revised.eventId).not.toBe(proposed.eventId)
    expect(proposed.causationId).toBeNull()
    expect(Object.isFrozen(revised)).toBe(true)
    expect(() => createEventEnvelopeV2(aiDraft("ai.advice.revised", null), deps)).toThrow(/causation/i)
    expect(() => createEventEnvelopeV2(aiDraft("ai.advice.revised", EVENT_ID), deps)).toThrow(/causation|self/i)
  })

  it("riserva ogni kind ai.* all'actor ai.consultative e quell'actor ai due kind advice", () => {
    expect(() => createEnvelope({ kind: "ai.advice.proposed" })).toThrow(/AI|authority|actor/i)
    expect(() => createEventEnvelopeV2(aiDraft("lesson.started"), deps)).toThrow(/AI|authority|kind/i)
    expect(() =>
      createEventEnvelopeV2(
        baseDraft({ kind: "ai.advice.proposed", actor: { type: "system", id: "other-system" }, payload: aiPayload() }),
        deps,
      ),
    ).toThrow(/AI|authority|actor/i)
  })

  it("richiede payload AI strict con model, sources, actionLevel e humanReview pending", () => {
    const invalidPayloads: unknown[] = [
      { ...aiPayload(), extra: true },
      { ...aiPayload(), model: { provider: "openai", id: "gpt-5", version: "v", extra: true } },
      { ...aiPayload(), model: { provider: "", id: "gpt-5", version: "v" } },
      { ...aiPayload(), sources: [] },
      { ...aiPayload(), actionLevel: "A2" },
      { ...aiPayload(), humanReview: "accepted" },
    ]
    for (const payload of invalidPayloads) {
      expect(() => createEventEnvelopeV2({ ...aiDraft(), payload: payload as JsonObject }, deps)).toThrow(/AI|payload|model|source|review|action/i)
    }
  })

  it("valida strict ogni campo model e ogni source AI", () => {
    const invalidModels: unknown[] = [
      { provider: "openai", id: "gpt-5" },
      { provider: "openai", version: "v" },
      { id: "gpt-5", version: "v" },
      { provider: "open ai", id: "gpt-5", version: "v" },
      { provider: "openai", id: "   ", version: "v" },
      { provider: "openai", id: "gpt-5", version: "   " },
    ]
    for (const model of invalidModels) {
      expect(() =>
        createEventEnvelopeV2({ ...aiDraft(), payload: { ...aiPayload(), model } as JsonObject }, deps),
      ).toThrow(/AI|model/i)
    }

    const invalidSources: unknown[] = [
      [{ ref: "manual:", resolution: "missing" }],
      [{ ref: "manual:vol1:p30 ", resolution: "missing" }],
      [{ ref: "manual:vol1:p30", resolution: "missing", extra: true }],
      [{ ref: "manual:vol1:p30", resolution: "verified" }],
    ]
    for (const sources of invalidSources) {
      expect(() =>
        createEventEnvelopeV2({ ...aiDraft(), payload: { ...aiPayload(), sources } as JsonObject }, deps),
      ).toThrow(/AI|source|evidence|missing|unknown/i)
    }
  })

  it("impedisce all'AI di auto-verificare evidence o sources", () => {
    expect(() =>
      createEventEnvelopeV2(
        { ...aiDraft(), evidence: [{ ref: "manual:vol1:p30", resolution: "verified" }] },
        deps,
      ),
    ).toThrow(/missing|verif/i)
    expect(() =>
      createEventEnvelopeV2(
        {
          ...aiDraft(),
          payload: {
            ...aiPayload(),
            sources: [{ ref: "manual:vol1:p30", resolution: "verified" }],
          },
        },
        deps,
      ),
    ).toThrow(/missing|verif/i)
  })

  it("nega material facts, journal, verification, delete/update e audio promotion all'AI", () => {
    for (const kind of [
      "simulation.circuit.solved",
      "journal.claim.recorded",
      "fact.verified",
      "lesson.deleted",
      "lesson.updated",
      "audio.promoted",
    ]) {
      expect(() => createEventEnvelopeV2(aiDraft(kind), deps), kind).toThrow(/AI|authority|kind/i)
    }
  })

  it("l'assertion strutturale applica la stessa authority della factory", () => {
    const candidate = cloneEnvelope()
    candidate.kind = "ai.advice.proposed"
    expect(() => assertEventEnvelopeV2(candidate)).toThrow(/AI|authority|actor/i)
  })

  it("applica la stessa matrice authority a JSON parsed e chiamata diretta", () => {
    const validAi = createEventEnvelopeV2(aiDraft(), deps)
    const mutations: Array<(candidate: Record<string, unknown>) => void> = [
      (candidate) => {
        candidate.actor = { type: "teacher", id: "teacher-1" }
      },
      (candidate) => {
        candidate.kind = "lesson.started"
      },
      (candidate) => {
        candidate.kind = "ai.advice.revised"
        candidate.causationId = null
      },
      (candidate) => {
        candidate.kind = "ai.advice.revised"
        candidate.causationId = candidate.eventId
      },
      (candidate) => {
        candidate.evidence = [{ ref: "manual:vol1:p30", resolution: "verified" }]
      },
      (candidate) => {
        candidate.payload = { ...aiPayload(), humanReview: "accepted" }
      },
      (candidate) => {
        candidate.payload = {
          ...aiPayload(),
          sources: [{ ref: "manual:vol1:p30", resolution: "verified" }],
        }
      },
      (candidate) => {
        candidate.payload = { ...aiPayload(), extra: true }
      },
    ]
    for (const mutate of mutations) {
      const candidate = cloneEnvelope(validAi)
      mutate(candidate)
      expect(() => assertEventEnvelopeV2(candidate)).toThrow(/AI|authority|causation|missing|review/i)
      expect(() =>
        assertFounderBetaAuthority(candidate as unknown as EventEnvelopeV2<string, JsonObject>),
      ).toThrow(/AI|authority|causation|missing|review/i)
    }
  })
})

describe("FB-3A exact build provenance", () => {
  it("accetta provider popolati tutti concordi, case-insensitive, e Git concorde", () => {
    expect(
      resolveBuildCommitSha(
        {
          ARDESIA_GIT_SHA: SHA_A.toUpperCase(),
          VERCEL_GIT_COMMIT_SHA: SHA_A,
          GITHUB_SHA: SHA_A.toUpperCase(),
          RENDER_GIT_COMMIT: SHA_A,
        },
        () => SHA_A,
      ),
    ).toBe(SHA_A)
  })

  it("rifiuta qualunque provider popolato ma invalido senza fall-through", () => {
    for (const provider of SHA_PROVIDERS) {
      for (const value of ["deadbeef", "unknown", ` ${SHA_A}`, `${SHA_A} `]) {
        expect(() => resolveBuildCommitSha({ [provider]: value }, () => SHA_A), `${provider}=${value}`).toThrow(
          /SHA|provider/i,
        )
      }
    }
  })

  it("rifiuta ogni disaccordo tra provider più alto e provider più basso", () => {
    for (let high = 0; high < SHA_PROVIDERS.length; high += 1) {
      for (let low = high + 1; low < SHA_PROVIDERS.length; low += 1) {
        expect(() =>
          resolveBuildCommitSha(
            { [SHA_PROVIDERS[high]!]: SHA_A, [SHA_PROVIDERS[low]!]: SHA_B },
            () => SHA_A,
          ),
        ).toThrow(/disagree|mismatch|discord/i)
      }
    }
  })

  it("rifiuta disaccordo Git per ciascuno dei quattro provider", () => {
    for (const provider of SHA_PROVIDERS) {
      expect(() => resolveBuildCommitSha({ [provider]: SHA_A }, () => SHA_B), provider).toThrow(
        /disagree|mismatch|discord/i,
      )
    }
  })

  it("usa Git locale quando nessun provider è popolato", () => {
    expect(resolveBuildCommitSha({}, () => `${SHA_A}\n`)).toBe(SHA_A)
    expect(resolveBuildCommitSha({ ARDESIA_GIT_SHA: "" }, () => SHA_A)).toBe(SHA_A)
  })

  it("fallisce se provider e Git non forniscono alcuna SHA valida", () => {
    expect(() => resolveBuildCommitSha({}, () => "deadbeef")).toThrow(/SHA|Git/i)
    expect(() =>
      resolveBuildCommitSha({}, () => {
        throw new Error("git unavailable")
      }),
    ).toThrow(/SHA|Git/i)
  })

  it("tratta Git mancante o invalido come unavailable solo con provider concordi", () => {
    expect(resolveBuildCommitSha({ GITHUB_SHA: SHA_A }, () => "deadbeef")).toBe(SHA_A)
    expect(
      resolveBuildCommitSha({ RENDER_GIT_COMMIT: SHA_A }, () => {
        throw new Error("not a checkout")
      }),
    ).toBe(SHA_A)
  })

  it("studioProducerIdentity usa reverse-DNS, package version e SHA esatta del checkout", () => {
    const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
      version: string
    }
    const checkoutSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).replace(/\r?\n$/, "")
    expect(studioProducerIdentity()).toEqual({
      id: "com.github.andreamarro.ardesia.studio",
      version: pkg.version,
      commitSha: checkoutSha,
    })
    expect(viteConfig.define).toEqual({
      __ARDESIA_STUDIO_VERSION__: JSON.stringify(pkg.version),
      __ARDESIA_GIT_SHA__: JSON.stringify(checkoutSha),
    })
  })

  it("preserva dedupe React, alias, server allow-list e optimizeDeps", () => {
    const aliases = viteConfig.resolve?.alias as Record<string, string>
    expect(viteConfig.resolve?.dedupe).toEqual(["react", "react-dom"])
    expect(aliases).toEqual({
      "@elab-tutor-plugin": fileURLToPath(new URL("../../../../plugins/elab-tutor/src", import.meta.url)),
      "@elab-pack": fileURLToPath(new URL("../../../../packs/elab-tutor", import.meta.url)),
    })
    expect(viteConfig.server?.fs?.allow).toEqual([
      fileURLToPath(new URL("../../../..", import.meta.url)),
    ])
    expect(viteConfig.optimizeDeps).toEqual({ include: ["react", "react-dom", "react-dom/client"] })
  })
})
