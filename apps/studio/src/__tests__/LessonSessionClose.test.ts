import { afterEach, describe, expect, it, vi } from "vitest"
import { openLessonOsSession } from "../lessonos/bootstrap"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import type { AnyEventEnvelopeV2 } from "../lessonos/eventlog"

const ROOM = "close-synthetic"
const SESSION = "30000000-0000-4000-8000-000000000001"
let id = 10
const uuid = () => `30000000-0000-4000-8000-${(++id).toString(16).padStart(12, "0")}`
async function session() {
  return openLessonOsSession({ room: ROOM, newSessionId: () => SESSION, newEventId: uuid,
    env: { indexedDB: undefined, markerStorage: undefined } })
}
async function draft(handle: Awaited<ReturnType<typeof session>>): Promise<AnyEventEnvelopeV2> {
  const { seq: _seq, ...start } = (await handle.store.readAllEnvelopes())[0]!
  void _seq
  return { ...start, eventId: uuid(), kind: "concept.introduced", idempotencyKey: null,
    payload: { conceptId: "synthetic-ohm", labels: { it: "Legge di Ohm" } } }
}

describe("sealed LessonOS revision rejects non-accepted input without poisoning recovery", () => {
  it("an invalid envelope cannot become a retained failed action that prevents closing", async () => {
    const h = await session()
    const invalid = { ...await draft(h), extra: "not-in-schema" }
    await expect(h.store.appendEnvelope(invalid)).rejects.toThrow()
    await expect(h.close()).resolves.toMatchObject({ event: { kind: "lesson.ended", seq: 2 } })
  })

  it("a session writer cannot accept another session's otherwise valid canonical envelope", async () => {
    const h = await session()
    const foreign = { ...await draft(h), sessionId: "30000000-0000-4000-8000-000000000002" }
    await expect(h.store.appendEnvelope(foreign)).rejects.toThrow(/session|identit|contesto/i)
    expect((await h.store.readAllEnvelopes()).map(e => e.kind)).toEqual(["lesson.started"])
    await h.close()
  })

  it("a producer cannot forge lesson.ended through the session's legacy append facade", async () => {
    const h = await session()
    await expect(h.store.append({ kind: "lesson.ended", room: ROOM, t: 1, evidence: ["board:synthetic"] })).rejects.toThrow(/lifecycle|factual|kind/i)
    expect((await h.store.readAllEnvelopes()).map(e => e.kind)).toEqual(["lesson.started"])
    await h.close()
  })
})


describe("cancellation belongs to the same sealed close attempt", () => {
  afterEach(() => vi.restoreAllMocks())
  it("an already cancelled close cannot retry a failed accepted write", async () => {
    const h = await session()
    const probe = await createEventLogStore({ factory: undefined })
    const prototype = Object.getPrototypeOf(probe) as typeof h.store
    const original = prototype.appendEnvelope
    let attempts = 0
    vi.spyOn(prototype, "appendEnvelope").mockImplementation(async function(this: typeof h.store, envelope) {
      if (envelope.kind === "concept.introduced") { attempts++; throw new Error("synthetic backend offline") }
      return original.call(this, envelope)
    })
    await expect(h.appendFact("concept.introduced", { conceptId: "ohm", labels: {} },
      { evidence: [{ ref: "board:synthetic", resolution: "verified" }] })).rejects.toThrow("synthetic backend offline")
    const cancellation = new AbortController(); cancellation.abort(new Error("synthetic cancellation"))
    await expect(h.close({ signal: cancellation.signal })).rejects.toThrow("synthetic cancellation")
    expect(attempts).toBe(1)
    expect((await h.store.readAllEnvelopes()).map(e => e.kind)).toEqual(["lesson.started"])
  })

  it("a cancelled pending pre-end flush cannot later append a stale end or block a new attempt", async () => {
    const h = await session()
    let start!: () => void; const started = new Promise<void>(r => { start = r })
    let release!: () => void; const pending = new Promise<void>(r => { release = r })
    const cancellation = new AbortController()
    const closing = h.close({ signal: cancellation.signal, beforeEnd: async () => { start(); await pending } })
    await started
    cancellation.abort(new Error("synthetic cancelled pending flush"))
    await expect(closing).rejects.toThrow("synthetic cancelled pending flush")
    release()
    await h.appendFact("concept.introduced", { conceptId: "ohm", labels: {} },
      { evidence: [{ ref: "board:synthetic", resolution: "verified" }] })
    await h.close()
    expect((await h.store.readAllEnvelopes()).map(e => e.kind)).toEqual(["lesson.started", "concept.introduced", "lesson.ended"])
  })
})


describe("an uncertain end preserves the already flushed revision", () => {
  afterEach(() => vi.restoreAllMocks())
  it("a retry reuses the end identity without running beforeEnd a second time", async () => {
    const h = await session()
    const probe = await createEventLogStore({ factory: undefined })
    const prototype = Object.getPrototypeOf(probe) as typeof h.store
    const original = prototype.appendEnvelope
    let loseAck = true
    vi.spyOn(prototype, "appendEnvelope").mockImplementation(async function(this: typeof h.store, envelope) {
      const result = await original.call(this, envelope)
      if (envelope.kind === "lesson.ended" && loseAck) {
        loseAck = false
        throw new Error("synthetic end ACK lost after commit")
      }
      return result
    })
    const beforeEnd = vi.fn(async () => {})
    await expect(h.close({ beforeEnd })).rejects.toThrow("synthetic end ACK lost")
    const end = (await h.store.readAllEnvelopes()).find(e => e.kind === "lesson.ended")!
    await expect(h.appendFact("concept.introduced", { conceptId: "late", labels: {} },
      { evidence: [{ ref: "board:synthetic", resolution: "verified" }] })).rejects.toThrow(/chiusura|closed/i)
    await h.close({ beforeEnd })
    expect(beforeEnd).toHaveBeenCalledOnce()
    const ends = (await h.store.readAllEnvelopes()).filter(e => e.kind === "lesson.ended")
    expect(ends).toEqual([end])
  })
})
