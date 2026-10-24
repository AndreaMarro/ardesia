import type { WorkspaceStore } from "./WorkspaceStore"
import { recordingSession, resolveReplayRecording, type AudioObjectReference, type AudioRecordingRef } from "./audioRecording"
import { loadReplayTimeline, resolveReplayTarget, type ReplayTimeline } from "./replayTimeline"

/** Existing canonical descriptor; the transport does not change its authority. */
export type LessonPassageDescriptor = Readonly<{
  schema: "ardesia.lesson-passage.v1"; workspaceId: "local-default"
  lessonId: string; sessionId: string; recordingId: string
  startEpoch: number; endEpoch: number; sha256: string
  objectRefs: readonly AudioObjectReference[]; replayUrl: string
}>
function verifyStoredRecording(timeline: ReplayTimeline, recording: AudioRecordingRef): void {
  const stored = timeline.recordings.find((item) => item.recordingId === recording.recordingId && item.assetPath === recording.assetPath)
  if (!stored || stored.sha256 !== recording.sha256 || stored.startEpoch !== recording.startEpoch || stored.endEpoch !== recording.endEpoch || JSON.stringify(stored.objectRefs) !== JSON.stringify(recording.objectRefs)) {
    throw new Error("Il riferimento del passaggio è cambiato: seleziona la registrazione salvata.")
  }
  if (stored.availability !== "available") throw new Error("Il passaggio audio non è più disponibile: controlla la registrazione.")
}
export async function prepareLessonPassage(store: WorkspaceStore, recording: AudioRecordingRef, href: string): Promise<LessonPassageDescriptor> {
  if (!recording.objectRefs.length) throw new Error("Collega un oggetto della lavagna al passaggio prima di inviarlo.")
  if ((await resolveReplayRecording(store, recording)).availability !== "available") throw new Error("Il passaggio audio non è più disponibile: controlla la registrazione.")
  const identity = recordingSession(recording)
  const timeline = await loadReplayTimeline(store, identity.lessonId)
  verifyStoredRecording(timeline, recording)
  const current = new URL(href)
  const base = current.pathname.startsWith("/studio/") || current.pathname === "/studio" ? "/studio/" : import.meta.env.BASE_URL
  const url = new URL(base, current)
  url.search = ""
  url.searchParams.set("vista", "replay")
  url.searchParams.set("at", String(recording.endEpoch))
  url.searchParams.set("recording", recording.recordingId)
  url.searchParams.set("object", recording.objectRefs[0]!.elementId)
  url.searchParams.set("session", identity.sessionId)
  url.searchParams.set("sha", recording.sha256)
  url.searchParams.set("objectVersion", String(recording.objectRefs[0]!.version))
  url.hash = identity.lessonId
  // This checks the actual historical scene, not just a matching object label.
  resolveReplayTarget(timeline, url.search)
  // Preflight reads must not hold a lease while another view completes OFF/purge.
  // The final descriptor is linearized with the existing lesson mutations, using
  // only driver reads: no new consent decision and no nested lock acquisition.
  return store.readLessonSnapshot(identity.lessonId, async (reader) => {
    const currentTimeline = await loadReplayTimeline(reader, identity.lessonId)
    verifyStoredRecording(currentTimeline, recording)
    resolveReplayTarget(currentTimeline, url.search)
    return Object.freeze({ schema: "ardesia.lesson-passage.v1", workspaceId: "local-default", ...identity,
      recordingId: recording.recordingId, startEpoch: recording.startEpoch, endEpoch: recording.endEpoch,
      sha256: recording.sha256, objectRefs: recording.objectRefs, replayUrl: url.href })
  })
}
