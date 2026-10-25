import { describe, expect, it, vi } from "vitest"
import { JournalRecorder, type JournalEvent } from "../store/JournalRecorder"
import { ReplayEngine, serializeEvents } from "../store/ReplayEngine"
import { loadReplayTimeline } from "../store/replayTimeline"
import { roomPaths } from "../store/roomPaths"
import { PATHS } from "../store/types"
import type { WorkspaceStore } from "../store/WorkspaceStore"
import { studioProducerIdentity } from "../core/contracts/eventEnvelope"

function memoryStore() {
  const files = new Map<string, Blob>()
  const read = vi.fn(async (path: string) => files.get(path) ?? null)
  const write = vi.fn(async (path: string, blob: Blob) => { files.set(path, blob) })
  return { files, read, write, port: { read, write } as unknown as WorkspaceStore }
}

async function recordRoom(store: WorkspaceStore, room: string, elementId: string) {
  const recorder = new JournalRecorder({
    store,
    journalPath: roomPaths(room).journal,
    identity: {
      lessonId: room,
      sessionId: "00000000-0000-4000-8000-000000000001",
      actor: { type: "teacher", id: "synthetic-teacher" },
    },
    producer: studioProducerIdentity(),
    now: () => 1000,
    newEventId: () => "00000000-0000-4000-8000-000000000002",
    withExclusiveLock: async (_name, work) => work(),
  })
  recorder.recordChange([{ id: elementId, type: "rectangle", version: 1 }])
  await recorder.flush()
}

describe("room-scoped replay loading", () => {
  it("replays real canonical journal writes in two rooms and after a fresh load", async () => {
    const store = memoryStore()
    await recordRoom(store.port, "room-a", "only-a")
    await recordRoom(store.port, "room-b", "only-b")
    store.files.set(PATHS.JOURNAL, new Blob([serializeEvents([
      { t: 1000, type: "element.add", element: { id: "unassigned-legacy" } },
    ])]))
    store.read.mockClear()

    for (const [room, expected] of [["room-a", "only-a"], ["room-b", "only-b"], ["room-a", "only-a"]]) {
      const timeline = await loadReplayTimeline(store.port, room)
      const scene = new ReplayEngine().getSceneAt(timeline.events, 1000)
      expect(scene.map((element) => element.id)).toEqual([expected])
    }
    expect(store.read.mock.calls.map(([path]) => path)).toEqual([
      roomPaths("room-a").journal, roomPaths("room-b").journal, roomPaths("room-a").journal,
    ])
  })

  it("never substitutes flat legacy events when the requested room is missing", async () => {
    const store = memoryStore()
    store.files.set(PATHS.JOURNAL, new Blob([serializeEvents([
      { t: 1000, type: "element.add", element: { id: "another-lesson" } },
    ])]))
    const timeline = await loadReplayTimeline(store.port, "empty-room")
    expect(timeline.events).toEqual([])
    expect(timeline.firstEventTime).toBeNull()
    expect(store.read).not.toHaveBeenCalledWith(PATHS.JOURNAL)
  })

  it("rejects a canonical envelope belonging to a different physical room", async () => {
    const store = memoryStore()
    await recordRoom(store.port, "room-b", "only-b")
    store.files.set(roomPaths("room-a").journal, store.files.get(roomPaths("room-b").journal)!)
    await expect(loadReplayTimeline(store.port, "room-a")).rejects.toThrow(/lesson\/source mismatch/)
  })

  it("resolves imported legacy audio only inside its room; the flat API stays explicit", async () => {
    const store = memoryStore()
    const events: JournalEvent[] = [
      { t: 1000, type: "audio.chunk", chunkIndex: 0, startEpoch: 900, endEpoch: 1000 },
    ]
    store.files.set(roomPaths("room-a").journal, new Blob([serializeEvents(events)]))
    store.files.set(PATHS.JOURNAL, new Blob([serializeEvents(events)]))
    const scoped = await loadReplayTimeline(store.port, "room-a")
    const legacy = await loadReplayTimeline(store.port)
    expect(scoped.audioChunks[0].path).toBe("raw/room-a/audio/chunk-0.webm")
    expect(legacy.audioChunks[0].path).toBe("raw/audio/chunk-0.webm")
  })

  it("rejects invalid room identifiers before reading any file", async () => {
    const store = memoryStore()
    await expect(loadReplayTimeline(store.port, "../room-b")).rejects.toThrow(/room identifier/)
    expect(store.read).not.toHaveBeenCalled()
  })
})
