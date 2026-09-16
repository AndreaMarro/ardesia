// @vitest-environment jsdom
//
// Stato della superficie di continuita': quali sessioni si possono riprendere.
//
// Logica tenuta fuori da React per lo stesso motivo per cui
// `continuityProjection` sta fuori da `ContinuityResumeCard`: uno stato
// calcolabile e' verificabile senza montare nulla.
//
// Due invarianti che questo sottosistema ha gia' violato in passato e che qui
// sono asserite, non sperate:
//   - nessuna sorgente viene aperta quando lo scope e' assente;
//   - l'handle viene chiuso su OGNI ramo, degradati compresi.

import { describe, it, expect, vi } from "vitest"
import { readResumableSessions } from "../lessonos/continuitySurface"
import { IndexedDbEventLog, type IndexedDbEventLogHandle } from "../lessonos/indexedDbEventLog"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"

const LESSON_ID = "wbstudio-abc123"
const OTHER_LESSON_ID = "wbstudio-zzz999"
const SESSION_ONE = "11111111-1111-4111-8111-111111111111"
const SESSION_TWO = "22222222-2222-4222-8222-222222222222"
const BUILD_SHA = "a".repeat(40)

let seq = 0

// `seq` lo assegna il log all'append: la fixture descrive l'envelope PRIMA di
// entrare, quindi il tipo qui e' l'envelope meno quel campo.
function envelope(
  lessonId: string,
  sessionId: string,
  occurredAt?: string,
): Omit<AppendedEventEnvelopeV2, "seq"> {
  seq += 1
  return {
    schemaVersion: 2 as const,
    eventId: `70000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    lessonId,
    sessionId,
    kind: "lesson.started",
    occurredAt: occurredAt ?? `2026-07-29T00:00:${String(seq).padStart(2, "0")}.000Z`,
    actor: { type: "teacher" as const, id: "founder-beta-teacher" },
    producer: {
      id: "com.github.andreamarro.ardesia.studio",
      version: "0.0.0",
      commitSha: BUILD_SHA,
    },
    causationId: null,
    idempotencyKey: `surface:${seq}`,
    evidence: [{ ref: `lesson:${lessonId}@${seq}`, resolution: "verified" as const }],
    payload: { room: lessonId },
  }
}

/** Handle reale su fake-indexeddb, seminato con le triple date (occurredAt opzionale). */
async function realHandle(
  pairs: ReadonlyArray<readonly [string, string, string?]>,
): Promise<{ handle: IndexedDbEventLogHandle; closed: () => number }> {
  const { IDBFactory, IDBKeyRange: FakeKeyRange } = await import("fake-indexeddb")
  ;(globalThis as { IDBKeyRange?: unknown }).IDBKeyRange = FakeKeyRange
  const factory = new IDBFactory() as unknown as IDBFactory
  const log = new IndexedDbEventLog({ factory, dbName: `surface-${Math.random().toString(36).slice(2)}` })
  await log.open()
  for (const [lessonId, sessionId, occurredAt] of pairs) {
    await log.appendEnvelope(envelope(lessonId, sessionId, occurredAt) as AppendedEventEnvelopeV2)
  }
  let closeCount = 0
  const handle: IndexedDbEventLogHandle = {
    backend: { kind: "verified-indexeddb", database: "test" } as IndexedDbEventLogHandle["backend"],
    log,
    async close() {
      closeCount += 1
      await log.close()
    },
  }
  return { handle, closed: () => closeCount }
}

describe("readResumableSessions", () => {
  it("scope assente: no-lesson, e NESSUNA sorgente viene aperta", async () => {
    // Aprire IndexedDB per scoprire di non avere una lezione da leggere e'
    // esattamente il tipo di accesso non necessario che questo sottosistema
    // deve evitare: la clausola e' rifiutare PRIMA di aprire.
    const open = vi.fn()
    expect(await readResumableSessions(null, open)).toEqual({ kind: "no-lesson" })
    expect(open).not.toHaveBeenCalled()
  })

  it("storage non disponibile: stato tipizzato col descrittore reale, handle chiuso", async () => {
    let closeCount = 0
    const backend = { kind: "unavailable", code: "indexeddb-unavailable" } as const
    const handle = {
      backend,
      log: null,
      async close() {
        closeCount += 1
      },
    } as unknown as IndexedDbEventLogHandle

    const state = await readResumableSessions(LESSON_ID, async () => handle)

    expect(state).toEqual({ kind: "storage-unavailable", backend })
    expect(closeCount).toBe(1)
  })

  it("lezione senza sessioni: no-sessions, non una lista vuota indistinguibile", async () => {
    const { handle, closed } = await realHandle([[OTHER_LESSON_ID, SESSION_ONE]])
    expect(await readResumableSessions(LESSON_ID, async () => handle)).toEqual({
      kind: "no-sessions",
      lessonId: LESSON_ID,
    })
    expect(closed()).toBe(1)
  })

  it("sessioni presenti: solo quelle della lezione richiesta, handle chiuso", async () => {
    const { handle, closed } = await realHandle([
      [LESSON_ID, SESSION_ONE, "2026-08-02T10:00:00.000Z"],
      [OTHER_LESSON_ID, SESSION_TWO, "2026-08-01T09:00:00.000Z"],
      [LESSON_ID, SESSION_TWO, "2026-08-03T10:00:00.000Z"],
    ])
    expect(await readResumableSessions(LESSON_ID, async () => handle)).toEqual({
      kind: "sessions",
      lessonId: LESSON_ID,
      // Dalla piu' recente: superficie di ripresa, non archivio.
      sessions: [
        { sessionId: SESSION_TWO, firstSeenAt: "2026-08-03T10:00:00.000Z" },
        { sessionId: SESSION_ONE, firstSeenAt: "2026-08-02T10:00:00.000Z" },
      ],
    })
    expect(closed()).toBe(1)
  })

  it("lettura che fallisce: stato unreadable, handle chiuso lo stesso, nessuna eccezione propagata", async () => {
    let closeCount = 0
    const handle = {
      backend: { kind: "verified-indexeddb", database: "test" },
      log: {
        async listSessionIds() {
          throw new Error("cursore esploso")
        },
      },
      async close() {
        closeCount += 1
      },
    } as unknown as IndexedDbEventLogHandle

    const state = await readResumableSessions(LESSON_ID, async () => handle)

    expect(state).toEqual({ kind: "unreadable", code: "cursore esploso" })
    expect(closeCount).toBe(1)
  })

  it("tre sessioni, UUID incompatibili con le date: l'ordine e' temporale DESC, non UUID né inserimento", async () => {
    // UUID crescente: 0000… < 8888… < ffff… — ma le date dicono l'opposto.
    // Inserimento: 8888, 0000, ffff (un terzo ordine ancora). L'unico output
    // accettabile e' [ffff/5-set, 8888/20-ago, 0000/1-ago]: temporale
    // decrescente, la sessione da riprendere per prima.
    const OLDEST_UUID = "00000000-0000-4000-8000-000000000001"
    const MID_UUID = "88888888-8888-4888-8888-888888888888"
    const NEWEST_UUID = "ffffffff-ffff-4fff-bfff-ffffffffffff"
    const { handle, closed } = await realHandle([
      [LESSON_ID, MID_UUID, "2026-08-20T09:00:00.000Z"],
      [LESSON_ID, OLDEST_UUID, "2026-08-01T09:00:00.000Z"],
      [LESSON_ID, NEWEST_UUID, "2026-09-05T09:00:00.000Z"],
    ])
    const state = await readResumableSessions(LESSON_ID, async () => handle)

    expect(state).toEqual({
      kind: "sessions",
      lessonId: LESSON_ID,
      sessions: [
        { sessionId: NEWEST_UUID, firstSeenAt: "2026-09-05T09:00:00.000Z" },
        { sessionId: MID_UUID, firstSeenAt: "2026-08-20T09:00:00.000Z" },
        { sessionId: OLDEST_UUID, firstSeenAt: "2026-08-01T09:00:00.000Z" },
      ],
    })
    expect(closed()).toBe(1)
  })

  it("sessione elencata ma senza eventi leggibili: resta in lista con data non disponibile, non sparisce", async () => {
    let closeCount = 0
    const handle = {
      backend: { kind: "verified-indexeddb", database: "test" },
      log: {
        async listSessionIds() {
          return [SESSION_ONE]
        },
        async readEnvelopesBySession() {
          return []
        },
      },
      async close() {
        closeCount += 1
      },
    } as unknown as IndexedDbEventLogHandle

    const state = await readResumableSessions(LESSON_ID, async () => handle)

    expect(state).toEqual({
      kind: "sessions",
      lessonId: LESSON_ID,
      sessions: [{ sessionId: SESSION_ONE, firstSeenAt: null }],
    })
    expect(closeCount).toBe(1)
  })

  it("lettura delle date che fallisce: stato unreadable, handle chiuso, nessuna eccezione propagata", async () => {
    let closeCount = 0
    const handle = {
      backend: { kind: "verified-indexeddb", database: "test" },
      log: {
        async listSessionIds() {
          return [SESSION_ONE]
        },
        async readEnvelopesBySession() {
          throw new Error("indice sessioni illeggibile")
        },
      },
      async close() {
        closeCount += 1
      },
    } as unknown as IndexedDbEventLogHandle

    const state = await readResumableSessions(LESSON_ID, async () => handle)

    expect(state).toEqual({ kind: "unreadable", code: "indice sessioni illeggibile" })
    expect(closeCount).toBe(1)
  })
})
