// @vitest-environment jsdom
//
// Scoperta delle sessioni riprendibili di una lezione.
//
// `loadScopedContinuitySnapshot` pretende una tripla esatta
// (lessonId, roomId, sessionId), ma `bootstrapLessonOs` genera un `sessionId`
// nuovo a ogni avvio e non lo espone in nessuna URL. Senza un modo di
// enumerare le sessioni gia' scritte per una lezione, la ripresa non e'
// raggiungibile da nessuna superficie: si potrebbe riprendere solo una
// sessione di cui si conosca gia' l'UUID a memoria.
//
// Questo file copre il solo meccanismo di enumerazione. Quale sessione
// proporre all'utente - l'ultima, o una lista - e' una scelta di prodotto e
// non viene decisa qui.

import { describe, it, expect } from "vitest"
import { IndexedDbEventLog } from "../lessonos/indexedDbEventLog"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"

const LESSON_ID = "lezione-a"
const OTHER_LESSON_ID = "lezione-b"
const SESSION_ONE = "11111111-1111-4111-8111-111111111111"
const SESSION_TWO = "22222222-2222-4222-8222-222222222222"
const SESSION_THREE = "33333333-3333-4333-8333-333333333333"
const BUILD_SHA = "a".repeat(40)

let eventSeq = 0

function envelope(
  lessonId: string,
  sessionId: string,
): Omit<AppendedEventEnvelopeV2, "seq"> {
  eventSeq += 1
  return {
    schemaVersion: 2 as const,
    eventId: `70000000-0000-4000-8000-${String(eventSeq).padStart(12, "0")}`,
    lessonId,
    sessionId,
    kind: "lesson.started",
    occurredAt: `2026-07-29T00:00:${String(eventSeq).padStart(2, "0")}.000Z`,
    actor: { type: "teacher" as const, id: "founder-beta-teacher" },
    producer: {
      id: "com.github.andreamarro.ardesia.studio",
      version: "0.0.0",
      commitSha: BUILD_SHA,
    },
    causationId: null,
    idempotencyKey: `discovery:${eventSeq}`,
    evidence: [{ ref: `lesson:${lessonId}@${eventSeq}`, resolution: "verified" as const }],
    payload: { room: lessonId },
  } as Omit<AppendedEventEnvelopeV2, "seq">
}

/** Log fisico su fake-indexeddb, seminato con le coppie (lezione, sessione) date. */
async function seededLog(
  pairs: ReadonlyArray<readonly [string, string]>,
): Promise<IndexedDbEventLog> {
  const { IDBFactory, IDBKeyRange: FakeKeyRange } = await import("fake-indexeddb")
  ;(globalThis as { IDBKeyRange?: unknown }).IDBKeyRange = FakeKeyRange
  const factory = new IDBFactory() as unknown as IDBFactory
  const dbName = `discovery-${Math.random().toString(36).slice(2)}`
  const log = new IndexedDbEventLog({ factory, dbName })
  await log.open()
  for (const [lessonId, sessionId] of pairs) {
    await log.appendEnvelope(envelope(lessonId, sessionId) as AppendedEventEnvelopeV2)
  }
  return log
}

describe("IndexedDbEventLog.listSessionIds", () => {
  it("restituisce una sola volta ogni sessione della lezione, in ordine di indice", async () => {
    const log = await seededLog([
      [LESSON_ID, SESSION_ONE],
      [LESSON_ID, SESSION_ONE],
      [LESSON_ID, SESSION_TWO],
      [LESSON_ID, SESSION_TWO],
      [LESSON_ID, SESSION_TWO],
    ])
    try {
      expect(await log.listSessionIds(LESSON_ID)).toEqual([SESSION_ONE, SESSION_TWO])
    } finally {
      await log.close()
    }
  })

  it("non riporta le sessioni di un'altra lezione", async () => {
    // Lo scope leak e' il difetto ricorrente di questo sottosistema: un
    // lettore che dimentica il confine restituisce fatti di un'altra lezione
    // come se fossero verificati per quella richiesta.
    const log = await seededLog([
      [LESSON_ID, SESSION_ONE],
      [OTHER_LESSON_ID, SESSION_TWO],
      [OTHER_LESSON_ID, SESSION_THREE],
    ])
    try {
      expect(await log.listSessionIds(LESSON_ID)).toEqual([SESSION_ONE])
      expect(await log.listSessionIds(OTHER_LESSON_ID)).toEqual([SESSION_TWO, SESSION_THREE])
    } finally {
      await log.close()
    }
  })

  it("lezione senza eventi: lista vuota, non un errore", async () => {
    const log = await seededLog([[OTHER_LESSON_ID, SESSION_ONE]])
    try {
      expect(await log.listSessionIds(LESSON_ID)).toEqual([])
    } finally {
      await log.close()
    }
  })
})
