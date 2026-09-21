// @vitest-environment jsdom
// Live canonical LessonOS snapshot authority (F-01).
// When a canonical live log is supplied, it is authoritative: read failure
// must fail visibly and an authoritative empty state must not resurrect
// older stored memory. Delay/failure lives IN THE TEST doubles.
import { describe, it, expect } from "vitest"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { FileEntry } from "../store/types"
import { exportLesson } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"
import type { AnyEventEnvelopeV2 } from "../lessonos/eventlog"

const ROOM = "f01-room"
const OLD_ROW = JSON.stringify({
  schemaVersion: 2,
  eventId: "11111111-1111-4111-8111-111111111111",
  lessonId: ROOM,
  sessionId: "11111111-1111-4111-8111-111111111111",
  seq: 1,
  kind: "error.observed",
  occurredAt: "2026-09-01T00:00:00.000Z",
  actor: { type: "teacher", id: "synthetic-teacher" },
  producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.0.0", commitSha: "a".repeat(40) },
  causationId: null,
  idempotencyKey: "old:1",
  evidence: [{ ref: "board:vecchio", resolution: "verified" }],
  payload: { errorId: "err:vecchio", conceptId: "ck:vecchio", labels: { it: "Errore vecchio" } },
})

function liveRow(errorId: string, seq: number): string {
  const parsed = JSON.parse(OLD_ROW) as Record<string, unknown>
  parsed["eventId"] = `22222222-2222-4222-8222-22222222222${seq}`
  parsed["seq"] = seq
  const payload = parsed["payload"] as Record<string, unknown>
  payload["errorId"] = errorId
  payload["labels"] = { it: `Errore ${errorId}` }
  parsed["idempotencyKey"] = `live:${seq}`
  return JSON.stringify(parsed)
}

/** Envelope log double with controllable live reads. */
function fakeLiveLog(mode: "facts" | "throws" | "empty") {
  const rows = mode === "facts" ? [liveRow("err:vivo", 7)] : []
  return {
    append: async () => { throw new Error("no legacy append in F-01 probe") },
    readAll: async () => [],
    appendEnvelope: async () => { throw new Error("no append in F-01 probe") },
    readAllEnvelopes: async () => rows.map((line) => JSON.parse(line)),
    readEnvelopesByLesson: async (lessonId: string) => {
      if (mode === "throws") throw new Error("live LessonOS read failed")
      return rows
        .map((line) => JSON.parse(line) as AnyEventEnvelopeV2)
        .filter((e) => (e as { lessonId: string }).lessonId === lessonId)
    },
    readEnvelopesBySession: async () => [],
  }
}

function mockStore(): WorkspaceStore {
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
  return store
}

async function baseStore(storedSnapshot: string | null): Promise<WorkspaceStore> {
  const store = mockStore()
  await store.write(roomPaths(ROOM).journal, new Blob(["{}\n"], { type: "application/x-ndjson" }))
  await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
  await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
  if (storedSnapshot !== null) {
    await store.write(
      roomPaths(ROOM).lessonOsSnapshot,
      new Blob([storedSnapshot], { type: "application/x-ndjson" }),
    )
  }
  return store
}

async function snapshotText(bundle: Blob): Promise<string | null> {
  const zip = await JSZip.loadAsync(bundle)
  const entry = zip.file("raw/lessonos-events.jsonl")
  return entry ? entry.async("text") : null
}

describe("live canonical LessonOS snapshot authority (F-01)", () => {
  it("Case A: live read failure must fail visibly, never export the old fact", async () => {
    const store = await baseStore(`${OLD_ROW}\n`)
    await expect(exportLesson(store, ROOM, fakeLiveLog("throws") as never)).rejects.toThrow(
      /live LessonOS|LessonOS.*fail|read failed/i,
    )
  })

  it("Case B: live read failure without stored snapshot must fail visibly", async () => {
    const store = await baseStore(null)
    await expect(exportLesson(store, ROOM, fakeLiveLog("throws") as never)).rejects.toThrow(
      /live LessonOS|LessonOS.*fail|read failed/i,
    )
  })

  it("Case C: authoritative empty live state must not resurrect old memory", async () => {
    const store = await baseStore(`${OLD_ROW}\n`)
    const bundle = await exportLesson(store, ROOM, fakeLiveLog("empty") as never)
    const zip = await JSZip.loadAsync(bundle)
    expect(zip.file("raw/lessonos-events.jsonl")).toBeNull()
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("text")) as {
      lessonOs: { status: string; warnings: string[] }
    }
    expect(manifest.lessonOs.status).toBe("missing")
    expect(manifest.lessonOs.warnings.join(" ")).toMatch(/live|empty|vuoto|corrente/i)
  })

  it("live facts still win over stored ones (no regression of the happy path)", async () => {
    const store = await baseStore(`${OLD_ROW}\n`)
    const bundle = await exportLesson(store, ROOM, fakeLiveLog("facts") as never)
    const text = await snapshotText(bundle)
    expect(text).toContain("err:vivo")
    expect(text).not.toContain("err:vecchio")
  })
})
