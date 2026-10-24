// MAESTRO-Studio — replayTimeline
// Dati per il player di replay: eventi journal + estremi temporali + chunk audio.
// buildReplayTimeline è puro (testabile senza store); loadReplayTimeline legge
// events.jsonl dal Workspace riusando deserializeEvents.

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"
import { deserializeEvents } from "./ReplayEngine"
import type { JournalEvent } from "./JournalRecorder"
import { roomPaths } from "./roomPaths"
import { recordingSession, resolveReplayRecording, type ReplayRecording } from "./audioRecording"

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
  recordings: ReplayRecording[]
}

/** Costruisce la timeline di replay da un array di eventi journal. Puro. */
export function buildReplayTimeline(events: JournalEvent[], room?: string): ReplayTimeline {
  const audioDir = room === undefined ? PATHS.AUDIO_DIR : roomPaths(room).audioDir
  let firstEventTime: number | null = null
  let lastEventTime: number | null = null
  const audioChunks: AudioChunkRef[] = []
  const recordings: ReplayRecording[] = []

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
    if (ev.type === "audio.recording") {
      const ref = ev.recording
      if (firstEventTime === null || ref.startEpoch < firstEventTime) firstEventTime = ref.startEpoch
      if (lastEventTime === null || ref.endEpoch > lastEventTime) lastEventTime = ref.endEpoch
      recordings.push({ ...ref, availability: "unchecked" })
    }
  }

  audioChunks.sort((a, b) => a.chunkIndex - b.chunkIndex)
  recordings.sort((a, b) => a.startEpoch - b.startEpoch || a.recordingId.localeCompare(b.recordingId))
  return { events, firstEventTime, lastEventTime, audioChunks, recordings }
}

/** A lesson pause has no active media. The endpoint still belongs to its take. */
export function recordingAtTime(recordings: readonly ReplayRecording[], epoch: number): ReplayRecording | null {
  return recordings.find((recording) => epoch >= recording.startEpoch && epoch <= recording.endEpoch) ?? null
}

export function resolveReplayTarget(timeline: ReplayTimeline, search: string): Readonly<{ epoch: number | null; recordingId: string | null; objectId: string | null }> {
  const params = new URLSearchParams(search)
  for (const key of ["at", "recording", "object", "session", "sha", "objectVersion"]) {
    if (params.getAll(key).length > 1) throw new Error("Riferimento al passaggio duplicato")
  }
  const id = params.get("recording")
  const objectId = params.get("object")
  const recording = id === null ? null : timeline.recordings.find((item) => item.recordingId === id)
  if (id !== null && !recording) throw new Error("La registrazione richiesta non appartiene a questa lezione")
  const session = params.get("session")
  if (session !== null && (!recording || session !== recordingSession(recording).sessionId)) throw new Error("La sessione richiesta non coincide con la registrazione")
  const sha = params.get("sha")
  if (sha !== null && (!recording || sha !== recording.sha256)) throw new Error("L'impronta audio richiesta non coincide con la registrazione")
  if (objectId !== null && (!recording || !recording.objectRefs.some((ref) => ref.elementId === objectId))) throw new Error("L'oggetto richiesto non è collegato a questo passaggio")
  const version = params.get("objectVersion")
  if (version !== null && (!/^[1-9]\d*$/.test(version) || !Number.isSafeInteger(Number(version)) || !recording || !recording.objectRefs.some((ref) => ref.elementId === objectId && ref.version === Number(version)))) throw new Error("La versione dell'oggetto non coincide con il passaggio")
  const at = params.get("at")
  if (at !== null && !/^(0|[1-9]\d*)$/.test(at)) throw new Error("Tempo del passaggio non valido")
  const epoch = at !== null ? Number(at) : recording?.startEpoch ?? timeline.firstEventTime
  if (at !== null && (epoch === null || !Number.isSafeInteger(epoch) || timeline.firstEventTime === null || timeline.lastEventTime === null || epoch < timeline.firstEventTime || epoch > timeline.lastEventTime)) throw new Error("Tempo del passaggio fuori dalla lezione")
  if (recording && epoch !== null && (epoch < recording.startEpoch || epoch > recording.endEpoch)) throw new Error("Tempo non appartenente alla registrazione richiesta")
  if (objectId !== null && epoch !== null && version !== null) {
    let observed: Record<string, unknown> | null = null
    for (const event of timeline.events) {
      if (event.t > epoch) continue
      if ((event.type === "element.add" || event.type === "element.update") && event.element.id === objectId) observed = event.element
      if (event.type === "element.delete" && event.elementId === objectId) observed = null
    }
    if (observed?.version !== Number(version)) throw new Error("L'oggetto nella scena di questo istante non corrisponde alla versione collegata")
  }
  return { epoch, recordingId: recording?.recordingId ?? null, objectId }
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
  const timeline = buildReplayTimeline(deserializeEvents(text, source), room)
  return { ...timeline, recordings: await Promise.all(timeline.recordings.map((recording) => resolveReplayRecording(store, recording))) }
}
