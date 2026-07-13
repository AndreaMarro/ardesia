// MAESTRO-Studio — replayTimeline
// Dati per il player di replay: eventi journal + estremi temporali + chunk audio.
// buildReplayTimeline è puro (testabile senza store); loadReplayTimeline legge
// events.jsonl dal Workspace riusando deserializeEvents.

import { type WorkspaceStore } from "./WorkspaceStore"
import { deserializeEvents } from "./ReplayEngine"
import type { JournalEvent } from "./JournalRecorder"
import { roomPaths } from "./roomPaths"

export interface AudioChunkRef {
  chunkIndex: number
  startEpoch: number
  endEpoch: number
  /** Path del file nella stanza: raw/<room>/audio/chunk-N.webm */
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

function isValidAudioMarker(event: JournalEvent): boolean {
  if (event.type !== "audio.chunk") return false
  return Number.isSafeInteger(event.chunkIndex)
    && event.chunkIndex >= 0
    && Number.isFinite(event.startEpoch)
    && event.startEpoch >= 0
    && Number.isFinite(event.endEpoch)
    && event.endEpoch >= event.startEpoch
}

/** Costruisce la timeline di replay da un array di eventi journal. Puro. */
export function buildReplayTimeline(events: JournalEvent[], audioDir: string): ReplayTimeline {
  let firstEventTime: number | null = null
  let lastEventTime: number | null = null
  const audioChunks: AudioChunkRef[] = []

  for (const ev of events) {
    if (typeof ev.t === "number" && Number.isFinite(ev.t)) {
      if (firstEventTime === null || ev.t < firstEventTime) firstEventTime = ev.t
      if (lastEventTime === null || ev.t > lastEventTime) lastEventTime = ev.t
    }
    if (ev.type === "audio.chunk" && isValidAudioMarker(ev)) {
      audioChunks.push({
        chunkIndex: ev.chunkIndex,
        startEpoch: ev.startEpoch,
        endEpoch: ev.endEpoch,
        path: `${audioDir}chunk-${ev.chunkIndex}.webm`,
      })
    }
  }

  audioChunks.sort((a, b) => a.chunkIndex - b.chunkIndex)
  return { events, firstEventTime, lastEventTime, audioChunks }
}

/** Legge events.jsonl dal workspace e costruisce la timeline. Journal assente → timeline vuota. */
export async function loadReplayTimeline(store: WorkspaceStore, room: string): Promise<ReplayTimeline> {
  const paths = roomPaths(room)
  const blob = await store.read(paths.journal)
  if (!blob) return buildReplayTimeline([], paths.audioDir)
  const text = await blob.text()
  return buildReplayTimeline(deserializeEvents(text), paths.audioDir)
}
