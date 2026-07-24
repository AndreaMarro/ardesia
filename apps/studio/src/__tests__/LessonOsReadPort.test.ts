// @vitest-environment jsdom
// ARDESIA Studio — porta di lettura LessonOS (ADR-0004, primo passo).
//
// Prima: RecapView ed ElabLab aprivano ciascuna la propria connessione allo
// stesso database, e RecapView la chiudeva dopo l'uso. Adesso l'istanza e' una
// sola e appartiene a LessonOS.
//
// Questi test fissano i tre fatti che rendono il cambio non-cosmetico:
// una sola istanza, i consumatori non la chiudono, il fail-soft e' intatto.

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  lessonEventLog,
  setLessonEventLogForTests,
  type LessonEventLog,
} from "../lessonos/eventLogProvider"
import { createStudyDigestReader } from "../lessonos/studyDigestReader"
import type { AppendedEvent } from "../lessonos/eventlog"

function fakeLog(events: AppendedEvent[], onClose?: () => void): LessonEventLog {
  return {
    append: () => Promise.reject(new Error("non usato")),
    readAll: () => Promise.resolve(events),
    appendEnvelope: () => Promise.reject(new Error("non usato")),
    readAllEnvelopes: () => Promise.resolve([]),
    readEnvelopesByLesson: () => Promise.resolve([]),
    readEnvelopesBySession: () => Promise.resolve([]),
    close: () => {
      onClose?.()
      return Promise.resolve()
    },
  } as unknown as LessonEventLog
}

function lessonEvent(kind: string, room: string, t: number): AppendedEvent {
  return { kind, room, t, seq: t, evidence: [] } as unknown as AppendedEvent
}

describe("provider dell'event log", () => {
  beforeEach(() => { setLessonEventLogForTests(null) })
  afterEach(() => { setLessonEventLogForTests(null) })

  it("apre una sola istanza per piu' consumatori", async () => {
    // il punto del provider: due consumatori, una connessione. Prima erano
    // cinque chiamate a createEventLogStore() da cinque punti diversi.
    const first = lessonEventLog({ factory: undefined })
    const second = lessonEventLog({ factory: undefined })
    expect(await first).toBe(await second)
  })

  it("l'iniezione per i test sostituisce l'istanza condivisa", async () => {
    const injected = fakeLog([])
    setLessonEventLogForTests(injected)
    expect(await lessonEventLog()).toBe(injected)
  })

  it("azzerare l'istanza evita che un test contamini il successivo", async () => {
    const injected = fakeLog([])
    setLessonEventLogForTests(injected)
    setLessonEventLogForTests(null)
    expect(await lessonEventLog({ factory: undefined })).not.toBe(injected)
  })
})

describe("porta di lettura del digesto", () => {
  beforeEach(() => { setLessonEventLogForTests(null) })
  afterEach(() => { setLessonEventLogForTests(null) })

  it("legge il digesto senza che il chiamante apra lo store", async () => {
    const events = [
      lessonEvent("lesson.started", "roomA", 1),
      lessonEvent("lesson.ended", "roomA", 9),
    ]
    const reader = createStudyDigestReader(() => Promise.resolve(fakeLog(events)))
    expect(await reader.readRoomDigest("roomA")).not.toBeNull()
  })

  it("NON chiude il log: l'istanza e' condivisa", async () => {
    let closed = 0
    const reader = createStudyDigestReader(
      () => Promise.resolve(fakeLog([], () => { closed += 1 })),
    )
    await reader.readRoomDigest("roomA")
    expect(closed).toBe(0)
  })

  it("fail-soft: log non apribile -> null, non un'eccezione", async () => {
    const reader = createStudyDigestReader(
      () => Promise.reject(new Error("IndexedDB non disponibile")),
    )
    await expect(reader.readRoomDigest("roomA")).resolves.toBeNull()
  })

  it("fail-soft: lettura che esplode -> null", async () => {
    const broken = {
      readAll: () => Promise.reject(new Error("boom")),
    } as unknown as LessonEventLog
    const reader = createStudyDigestReader(() => Promise.resolve(broken))
    await expect(reader.readRoomDigest("roomA")).resolves.toBeNull()
  })
})
