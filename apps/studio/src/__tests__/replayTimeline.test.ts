// MAESTRO-Studio — Test replayTimeline: dati per il player di replay
// buildReplayTimeline è puro (events → timeline); loadReplayTimeline legge dal Workspace.

import { describe, it, expect, vi } from "vitest"
import { buildReplayTimeline, loadReplayTimeline } from "../store/replayTimeline"
import { PATHS } from "../store/types"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceStore } from "../store/WorkspaceStore"
import type { JournalEvent } from "../store/JournalRecorder"

const el = (id: string) => ({ id, type: "rectangle" })
const TEST_PATHS = roomPaths("replay-test-room")

const EVENTS: JournalEvent[] = [
  { t: 1000, type: "element.add", element: el("a") },
  { t: 2000, type: "element.add", element: el("b") },
  { t: 2500, type: "audio.chunk", chunkIndex: 0, startEpoch: 1000, endEpoch: 31000 },
  { t: 3000, type: "element.delete", elementId: "a" },
  { t: 32500, type: "audio.chunk", chunkIndex: 1, startEpoch: 31000, endEpoch: 61000 },
]

describe("buildReplayTimeline", () => {
  it("calcola first/lastEventTime come min/max dei t validi", () => {
    const tl = buildReplayTimeline(EVENTS, TEST_PATHS.audioDir)
    expect(tl.firstEventTime).toBe(1000)
    expect(tl.lastEventTime).toBe(32500)
  })

  it("estrae i chunk audio ordinati per chunkIndex con path raw/audio/chunk-N.webm", () => {
    const tl = buildReplayTimeline(EVENTS, TEST_PATHS.audioDir)
    expect(tl.audioChunks).toEqual([
      { chunkIndex: 0, startEpoch: 1000, endEpoch: 31000, path: `${TEST_PATHS.audioDir}chunk-0.webm` },
      { chunkIndex: 1, startEpoch: 31000, endEpoch: 61000, path: `${TEST_PATHS.audioDir}chunk-1.webm` },
    ])
  })

  it("journal senza eventi → timeline vuota, nessun crash", () => {
    const tl = buildReplayTimeline([], TEST_PATHS.audioDir)
    expect(tl.events).toEqual([])
    expect(tl.firstEventTime).toBeNull()
    expect(tl.lastEventTime).toBeNull()
    expect(tl.audioChunks).toEqual([])
  })

  it("t non numerico escluso da first/last ma l'evento resta nella timeline", () => {
    const events = [
      { t: Number.NaN, type: "element.add", element: el("x") },
      { t: 5000, type: "t0" },
    ] as JournalEvent[]
    const tl = buildReplayTimeline(events, TEST_PATHS.audioDir)
    expect(tl.firstEventTime).toBe(5000)
    expect(tl.lastEventTime).toBe(5000)
    expect(tl.events).toHaveLength(2)
  })

  it.each([
    { chunkIndex: "0/../../../room-b/audio/chunk-0", startEpoch: 1000, endEpoch: 2000 },
    { chunkIndex: -1, startEpoch: 1000, endEpoch: 2000 },
    { chunkIndex: 1.5, startEpoch: 1000, endEpoch: 2000 },
    { chunkIndex: Number.MAX_SAFE_INTEGER + 1, startEpoch: 1000, endEpoch: 2000 },
    { chunkIndex: 0, startEpoch: Number.NaN, endEpoch: 2000 },
    { chunkIndex: 0, startEpoch: 2000, endEpoch: 1000 },
  ])("marker audio malformato %# non produce alcun path", (payload) => {
    const events = [{ t: 1000, type: "audio.chunk", ...payload }] as unknown as JournalEvent[]

    expect(buildReplayTimeline(events, TEST_PATHS.audioDir).audioChunks).toEqual([])
  })
})

describe("loadReplayTimeline", () => {
  it("legge solo journal e audio della stanza richiesta, ignorando B e i flat legacy", async () => {
    const pathsA = roomPaths("room-a")
    const pathsB = roomPaths("room-b")
    const eventsA: JournalEvent[] = [
      { t: 1000, type: "element.add", element: el("only-a") },
      { t: 1100, type: "audio.chunk", chunkIndex: 0, startEpoch: 1000, endEpoch: 2000 },
    ]
    const eventsB: JournalEvent[] = [{ t: 9000, type: "element.add", element: el("only-b") }]
    const legacy: JournalEvent[] = [{ t: 8000, type: "element.add", element: el("legacy") }]
    const blobs = new Map([
      [pathsA.journal, new Blob([eventsA.map((event) => JSON.stringify(event)).join("\n") + "\n"])],
      [pathsB.journal, new Blob([eventsB.map((event) => JSON.stringify(event)).join("\n") + "\n"])],
      [PATHS.JOURNAL, new Blob([legacy.map((event) => JSON.stringify(event)).join("\n") + "\n"])],
    ])
    const store = { read: vi.fn(async (path: string) => blobs.get(path) ?? null) }

    const timeline = await loadReplayTimeline(store as unknown as WorkspaceStore, "room-a")

    expect(timeline.events.map((event) => event.type === "element.add" ? event.element.id : event.type)).toEqual([
      "only-a",
      "audio.chunk",
    ])
    expect(timeline.audioChunks[0]?.path).toBe(`${pathsA.audioDir}chunk-0.webm`)
    expect(store.read).toHaveBeenCalledWith(pathsA.journal)
    expect(store.read).not.toHaveBeenCalledWith(pathsB.journal)
    expect(store.read).not.toHaveBeenCalledWith(PATHS.JOURNAL)
  })

  it("rifiuta un room ID ostile prima di accedere allo store", async () => {
    const store = { read: vi.fn().mockResolvedValue(null) }

    await expect(loadReplayTimeline(store as unknown as WorkspaceStore, "../escape")).rejects.toThrow()
    expect(store.read).not.toHaveBeenCalled()
  })

  it("legge events.jsonl dallo store e costruisce la timeline", async () => {
    const jsonl = EVENTS.map((e) => JSON.stringify(e)).join("\n") + "\n"
    const store = { read: vi.fn().mockResolvedValue(new Blob([jsonl])) }
    const tl = await loadReplayTimeline(store as any, "replay-test-room")
    expect(store.read).toHaveBeenCalledWith(TEST_PATHS.journal)
    expect(tl.events).toHaveLength(EVENTS.length)
    expect(tl.firstEventTime).toBe(1000)
    expect(tl.audioChunks).toHaveLength(2)
  })

  it("journal assente (read → null) → timeline vuota", async () => {
    const store = { read: vi.fn().mockResolvedValue(null) }
    const tl = await loadReplayTimeline(store as any, "replay-test-room")
    expect(tl.events).toEqual([])
    expect(tl.firstEventTime).toBeNull()
    expect(tl.audioChunks).toEqual([])
  })
})
