// MAESTRO-Studio — Test replayTimeline: dati per il player di replay
// buildReplayTimeline è puro (events → timeline); loadReplayTimeline legge dal Workspace.

import { describe, it, expect, vi } from "vitest"
import { buildReplayTimeline, loadReplayTimeline } from "../store/replayTimeline"
import { PATHS } from "../store/types"
import type { JournalEvent } from "../store/JournalRecorder"

const el = (id: string) => ({ id, type: "rectangle" })

const EVENTS: JournalEvent[] = [
  { t: 1000, type: "element.add", element: el("a") },
  { t: 2000, type: "element.add", element: el("b") },
  { t: 2500, type: "audio.chunk", chunkIndex: 0, startEpoch: 1000, endEpoch: 31000 },
  { t: 3000, type: "element.delete", elementId: "a" },
  { t: 32500, type: "audio.chunk", chunkIndex: 1, startEpoch: 31000, endEpoch: 61000 },
]

describe("buildReplayTimeline", () => {
  it("calcola first/lastEventTime come min/max dei t validi", () => {
    const tl = buildReplayTimeline(EVENTS)
    expect(tl.firstEventTime).toBe(1000)
    expect(tl.lastEventTime).toBe(32500)
  })

  it("estrae i chunk audio ordinati per chunkIndex con path raw/audio/chunk-N.webm", () => {
    const tl = buildReplayTimeline(EVENTS)
    expect(tl.audioChunks).toEqual([
      { chunkIndex: 0, startEpoch: 1000, endEpoch: 31000, path: `${PATHS.AUDIO_DIR}chunk-0.webm` },
      { chunkIndex: 1, startEpoch: 31000, endEpoch: 61000, path: `${PATHS.AUDIO_DIR}chunk-1.webm` },
    ])
  })

  it("journal senza eventi → timeline vuota, nessun crash", () => {
    const tl = buildReplayTimeline([])
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
    const tl = buildReplayTimeline(events)
    expect(tl.firstEventTime).toBe(5000)
    expect(tl.lastEventTime).toBe(5000)
    expect(tl.events).toHaveLength(2)
  })
})

describe("loadReplayTimeline", () => {
  it("legge events.jsonl dallo store e costruisce la timeline", async () => {
    const jsonl = EVENTS.map((e) => JSON.stringify(e)).join("\n") + "\n"
    const store = { read: vi.fn().mockResolvedValue(new Blob([jsonl])) }
    const tl = await loadReplayTimeline(store as any)
    expect(store.read).toHaveBeenCalledWith(PATHS.JOURNAL)
    expect(tl.events).toHaveLength(EVENTS.length)
    expect(tl.firstEventTime).toBe(1000)
    expect(tl.audioChunks).toHaveLength(2)
  })

  it("journal assente (read → null) → timeline vuota", async () => {
    const store = { read: vi.fn().mockResolvedValue(null) }
    const tl = await loadReplayTimeline(store as any)
    expect(tl.events).toEqual([])
    expect(tl.firstEventTime).toBeNull()
    expect(tl.audioChunks).toEqual([])
  })
})
