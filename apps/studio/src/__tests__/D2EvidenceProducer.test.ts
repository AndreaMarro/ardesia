// @vitest-environment jsdom
// D2 cross-boundary producer harness (kept, deterministic, offline).
// Production exportLesson() with synthetic journal + envelope log writes
// lesson-a/b.lesson to D2_EVIDENCE_OUT (default: os tmpdir). The CI
// evidence job consumes exactly these bytes with the current Engine.
// Fixed ids/timestamps/uuids: regeneration is byte-stable except ZIP
// container metadata and producer.commitSha (build git SHA) — both
// documented-normalized downstream, never silently dropped.
import { describe, it, expect } from "vitest"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { FileEntry } from "../store/types"
import { exportLesson } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import type { AppendedEventEnvelopeV2, EnvelopeEventLogStore } from "../lessonos/eventlog"

export const D2_ROOM_A = "d2-lesson-a"
export const D2_ROOM_B = "d2-lesson-b"
const SESSION = "aaaaaaaa-1111-4111-8111-111111111111"
const PRODUCER = {
  id: "com.github.andreamarro.ardesia.studio",
  version: "0.0.0",
  commitSha: "a".repeat(40),
}

let seq = 0
function env(lessonId: string, kind: string, payload: object, ref: string, idem: string, t: number, id: string) {
  seq += 1
  return createEventEnvelopeV2(
    {
      lessonId, sessionId: SESSION, kind,
      actor: { type: "teacher", id: "synthetic-teacher" },
      producer: PRODUCER, causationId: null, idempotencyKey: idem,
      evidence: [{ ref, resolution: "verified" }],
      payload,
    } as never,
    { eventId: () => id, now: () => new Date(t) },
  ) as unknown as AppendedEventEnvelopeV2
}

function journalText(lessonId: string, id: string, text: string, t: number, idem: string, uuid: string) {
  return JSON.stringify(env(lessonId, "journal.element.add",
    { element: { id, type: "text", text, version: 1 } }, `board:${id}`, idem, t, uuid))
}

class FixedLog implements EnvelopeEventLogStore {
  private envelopes: AppendedEventEnvelopeV2[]
  constructor(initial: readonly object[]) {
    this.envelopes = initial.map((e, i) => Object.freeze({ ...structuredClone(e), seq: i + 1 }) as AppendedEventEnvelopeV2)
  }
  async append(_event?: unknown): Promise<never> {
    throw new Error("legacy append unsupported in evidence harness")
  }
  async readAll() { return [] }
  async appendEnvelope(e: AppendedEventEnvelopeV2) { this.envelopes.push(e); return { event: e, appended: true as const } }
  async readAllEnvelopes() { return structuredClone(this.envelopes) }
  async readEnvelopesByLesson(l: string) {
    return (await this.readAllEnvelopes()).filter((e) => (e as { lessonId: string }).lessonId === l)
  }
  async readEnvelopesBySession(l: string, _s: string) { return this.readEnvelopesByLesson(l) }
  async importSnapshot() { return { recovered: 0, lastSeq: 0, droppedTail: 0, corrupted: false } }
}

function mockStore(): { store: WorkspaceStore; mem: Map<string, ArrayBuffer> } {
  const store = new WorkspaceStore()
  const mem = new Map<string, ArrayBuffer>()
  const mock = {
    available: () => true,
    init: async () => true,
    read: async (p: string) => { const b = mem.get(p); return b ? new Blob([b]) : null },
    write: async (p: string, d: Blob) => { mem.set(p, await d.arrayBuffer()) },
    delete: async (p: string) => { mem.delete(p) },
    list: async (prefix?: string) => [...mem.entries()]
      .filter(([p]) => !prefix || p.startsWith(prefix))
      .map(([p, data]) => ({ path: p, data: new Blob([data]), mtime: 0 }) as FileEntry),
    getLegacyScene: () => null,
    setLegacyScene: () => {},
  }
  ;(store as unknown as { driver: unknown }).driver = mock
  ;(store as unknown as { fallback: unknown }).fallback = mock
  return { store, mem }
}

describe("D2 evidence producer (kept)", () => {
  it("exports isolated A/B lessons with fixed synthetic content", async () => {
    const out = process.env.D2_EVIDENCE_OUT ?? path.join(os.tmpdir(), "d2-evidence")
    fs.mkdirSync(out, { recursive: true })
    const { store } = mockStore()

    const journalA = [
      journalText(D2_ROOM_A, "t1", "La corrente \u00e8 uguale in serie.", 1000, "j:a:t1", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"),
      journalText(D2_ROOM_A, "t2", "Legge di Ohm: $V = R I$.", 2000, "j:a:t2", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"),
    ].join("\n") + "\n"
    const journalB = [
      journalText(D2_ROOM_B, "u1", "Il parallelo divide la corrente.", 1000, "j:b:u1", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1"),
    ].join("\n") + "\n"
    await store.write(roomPaths(D2_ROOM_A).journal, new Blob([journalA], { type: "application/x-ndjson" }))
    await store.write(roomPaths(D2_ROOM_B).journal, new Blob([journalB], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(D2_ROOM_A, JSON.stringify({ type: "excalidraw", elements: [] }))
    await store.saveScene(D2_ROOM_B, JSON.stringify({ type: "excalidraw", elements: [] }))

    const log = new FixedLog([
      env(D2_ROOM_A, "lesson.started", { room: D2_ROOM_A }, `lesson:${D2_ROOM_A}@1`, "s:a", 900, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaab1"),
      env(D2_ROOM_A, "concept.introduced", { conceptId: "ck:d2a", labels: { it: "Serie D2" } }, "manual:d2:p1", "c:a", 1100, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaac1"),
      env(D2_ROOM_A, "error.observed", { errorId: "err:d2open", conceptId: "ck:d2a", labels: { it: "Somma in parallelo" } }, "board:t2", "e:a", 1200, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaad1"),
      env(D2_ROOM_A, "error.observed", { errorId: "err:d2shut", conceptId: "ck:d2a", labels: { it: "Verso invertito" } }, "board:t1", "e:b", 1300, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaae1"),
      env(D2_ROOM_A, "exercise.completed", { exerciseId: "ex:d2", correctsErrorId: "err:d2shut", labels: { it: "Correttivo" } }, "board:t1", "x:a", 1400, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaf1"),
      env(D2_ROOM_B, "concept.introduced", { conceptId: "ck:d2b", labels: { it: "Parallelo D2" } }, "manual:d2:p2", "c:b", 1100, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbc1"),
      env(D2_ROOM_B, "error.observed", { errorId: "err:d2b", conceptId: "ck:d2b", labels: { it: "Errore di B" } }, "board:u1", "e:c", 1200, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbd1"),
    ])

    for (const [room, name] of [[D2_ROOM_A, "lesson-a.lesson"], [D2_ROOM_B, "lesson-b.lesson"]] as const) {
      const blob = await exportLesson(store, room, log)
      fs.writeFileSync(path.join(out, name), Buffer.from(await blob.arrayBuffer()))
    }

    const zipA = await JSZip.loadAsync(fs.readFileSync(path.join(out, "lesson-a.lesson")))
    const manifest = JSON.parse(await zipA.file("manifest.json")!.async("text"))
    expect(manifest.lessonId).toBe(D2_ROOM_A)
    const journal = await zipA.file("raw/events.jsonl")!.async("text")
    expect(journal).toContain("uguale in serie")
    expect(journal).not.toContain("parallelo divide")
    const snap = await zipA.file("raw/lessonos-events.jsonl")!.async("text")
    expect(snap).toContain("err:d2open")
    expect(snap).not.toContain("err:d2b")
    for (const row of snap.split("\n").filter(Boolean)) {
      expect(JSON.parse(row).lessonId).toBe(D2_ROOM_A)
    }
  })
})
