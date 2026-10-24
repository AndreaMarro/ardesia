// MAESTRO-Studio — replayTimeline
// Dati per il player di replay: eventi journal + estremi temporali + chunk audio.
// buildReplayTimeline è puro (testabile senza store); loadReplayTimeline legge
// events.jsonl dal Workspace riusando deserializeEvents.

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"
import { deserializeEvents } from "./ReplayEngine"
import type { JournalEvent } from "./JournalRecorder"
import { roomPaths } from "./roomPaths"

export interface AudioChunkRef {
  chunkIndex: number
  startEpoch: number
  endEpoch: number
  /** Path nella room selezionata; flat soltanto per la lettura legacy esplicita. */
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
export function buildReplayTimeline(events: JournalEvent[], room?: string): ReplayTimeline {
  const audioDir = room === undefined ? PATHS.AUDIO_DIR : roomPaths(room).audioDir
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
        path: `${audioDir}chunk-${ev.chunkIndex}.webm`,
      })
    }
  }

  audioChunks.sort((a, b) => a.chunkIndex - b.chunkIndex)
  return { events, firstEventTime, lastEventTime, audioChunks }
}

/**
 * La vista di una lezione legge soltanto il suo journal, anche quando è assente.
 * Omettere room è riservato ai consumer legacy espliciti: nessun fallback flat
 * può attribuire a una lezione gli eventi o l'audio di un'altra.
 */
export async function loadReplayTimeline(store: WorkspaceStore, room?: string): Promise<ReplayTimeline> {
  const source = room === undefined ? PATHS.JOURNAL : roomPaths(room).journal
  const blob = await store.read(source)
  if (!blob) return buildReplayTimeline([], room)
  const text = await blob.text()
  return buildReplayTimeline(deserializeEvents(text, source), room)
}
