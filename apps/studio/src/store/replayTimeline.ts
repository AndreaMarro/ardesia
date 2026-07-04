// MAESTRO-Studio — replayTimeline
// Dati per il player di replay: eventi journal + estremi temporali + chunk audio.
// buildReplayTimeline è puro (testabile senza store); loadReplayTimeline legge
// events.jsonl dal Workspace riusando deserializeEvents.

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"
import { deserializeEvents } from "./ReplayEngine"
import type { JournalEvent } from "./JournalRecorder"

export interface AudioChunkRef {
  chunkIndex: number
  startEpoch: number
  endEpoch: number
  /** Path del file nel workspace: raw/audio/chunk-N.webm */
  path: string
}

export interface ReplayTimeline {
  events: JournalEvent[]
  /** min/max dei timestamp validi (stessa regola di lessonRecap: t corrotto escluso) */
  firstEventTime: number | null
  lastEventTime: number | null
  /** Chunk audio ordinati per chunkIndex (dai marker audio.chunk del journal) */
  audioChunks: AudioChunkRef[]
}

/** Costruisce la timeline di replay da un array di eventi journal. Puro. */
export function buildReplayTimeline(events: JournalEvent[]): ReplayTimeline {
  let firstEventTime: number | null = null
  let lastEventTime: number | null = null
  const audioChunks: AudioChunkRef[] = []

  for (const ev of events) {
    if (typeof ev.t === "number" && Number.isFinite(ev.t)) {
      if (firstEventTime === null || ev.t < firstEventTime) firstEventTime = ev.t
      if (lastEventTime === null || ev.t > lastEventTime) lastEventTime = ev.t
    }
    if (ev.type === "audio.chunk") {
      audioChunks.push({
        chunkIndex: ev.chunkIndex,
        startEpoch: ev.startEpoch,
        endEpoch: ev.endEpoch,
        path: `${PATHS.AUDIO_DIR}chunk-${ev.chunkIndex}.webm`,
      })
    }
  }

  audioChunks.sort((a, b) => a.chunkIndex - b.chunkIndex)
  return { events, firstEventTime, lastEventTime, audioChunks }
}

/** Legge events.jsonl dal workspace e costruisce la timeline. Journal assente → timeline vuota. */
export async function loadReplayTimeline(store: WorkspaceStore): Promise<ReplayTimeline> {
  const blob = await store.read(PATHS.JOURNAL)
  if (!blob) return buildReplayTimeline([])
  const text = await blob.text()
  return buildReplayTimeline(deserializeEvents(text))
}
