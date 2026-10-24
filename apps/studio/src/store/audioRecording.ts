import type { JsonObject } from "../core/contracts/eventEnvelope"
import { parseSessionYamlV2, sessionPaths, type LessonSessionIdentityV1, type SessionSnapshotV2 } from "./sessionState"
import type { WorkspaceStore } from "./WorkspaceStore"

export type AudioObjectReference = Readonly<{ elementId: string; version: number; label: string }>
/** One complete MediaRecorder stream. Different recording IDs are never joined. */
export type AudioRecordingRef = Readonly<{
  v: 1; recordingId: string; assetPath: string; mimeType: string; sha256: string; bytes: number
  startEpoch: number; endEpoch: number; durationMs: number; objectRefs: readonly AudioObjectReference[]
}>
export type ReplayRecording = AudioRecordingRef & Readonly<{
  availability: "unchecked" | "available" | "missing" | "corrupt" | "revoked"
  data?: Blob
}>
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const MIME = /^audio\/[a-z0-9.+-]+(?:;\s*codecs=[a-zA-Z0-9.," -]+)?$/
function fail(reason: string): never { throw new Error(`Audio recording v1: ${reason}`) }
function exact(value: object, keys: readonly string[]): void {
  if (Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !keys.includes(key))) fail("unknown or missing fields")
}
function integer(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 }
export function audioExtension(mimeType: string): string {
  if (!MIME.test(mimeType)) fail("invalid audio MIME")
  const format = mimeType.split(";", 1)[0]
  return format === "audio/mp4" ? "m4a" : format === "audio/ogg" ? "ogg" : format === "audio/wav" ? "wav" : "webm"
}
export function audioObjectEvidence(ref: AudioObjectReference): string { return `board:${encodeURIComponent(ref.elementId)}#version=${ref.version}` }
export function audioAssetEvidence(ref: AudioRecordingRef): string { return `asset:${ref.assetPath}#sha256=${ref.sha256}` }
export function snapshotAudioObjectRefs(refs: readonly AudioObjectReference[]): readonly AudioObjectReference[] {
  if (!Array.isArray(refs) || refs.length > 32) fail("object references must be a bounded array")
  const seen = new Set<string>()
  return Object.freeze(refs.map((ref) => {
    if (typeof ref !== "object" || ref === null || Array.isArray(ref)) fail("invalid object reference")
    exact(ref, ["elementId", "version", "label"])
    if (typeof ref.elementId !== "string" || !/^\S+$/.test(ref.elementId) || ref.elementId.length > 256) fail("invalid elementId")
    if (!integer(ref.version) || ref.version < 1) fail("invalid object version")
    if (typeof ref.label !== "string" || !ref.label.trim() || ref.label.length > 240) fail("invalid object label")
    const key = audioObjectEvidence(ref)
    if (seen.has(key)) fail("duplicate object reference")
    seen.add(key)
    return Object.freeze({ elementId: ref.elementId, version: ref.version, label: ref.label })
  }))
}
export function assertAudioRecordingRef(value: JsonObject, identity: LessonSessionIdentityV1): asserts value is JsonObject & AudioRecordingRef {
  exact(value, ["v", "recordingId", "assetPath", "mimeType", "sha256", "bytes", "startEpoch", "endEpoch", "durationMs", "objectRefs"])
  if (value.v !== 1 || typeof value.recordingId !== "string" || !UUID.test(value.recordingId)) fail("invalid version or recording ID")
  if (typeof value.mimeType !== "string") fail("missing MIME")
  if (value.assetPath !== `${sessionPaths(identity).audioDir}${value.recordingId}.${audioExtension(value.mimeType)}`) fail("asset path does not match session and recording")
  if (typeof value.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(value.sha256)) fail("invalid digest")
  if (!integer(value.bytes) || value.bytes < 1) fail("invalid byte length")
  if (!integer(value.startEpoch) || !integer(value.endEpoch) || !integer(value.durationMs) || value.endEpoch !== value.startEpoch + value.durationMs) fail("invalid media/lesson time mapping")
  snapshotAudioObjectRefs(value.objectRefs as unknown as readonly AudioObjectReference[])
}
export async function audioSha256(blob: Blob): Promise<string> {
  const bytes = Uint8Array.from(new Uint8Array(await blob.arrayBuffer()))
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
  return [...hash].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}
export async function readAudioSession(store: Pick<WorkspaceStore, "read">, identity: LessonSessionIdentityV1): Promise<SessionSnapshotV2 | null> {
  const path = sessionPaths(identity).session
  const bytes = await store.read(path)
  if (!bytes) return null
  const value = parseSessionYamlV2(new Uint8Array(await bytes.arrayBuffer()))
  if (value.lessonId !== identity.lessonId || value.sessionId !== identity.sessionId) fail("session identity mismatch")
  return Object.freeze({ path, bytes, value, sha256: await audioSha256(bytes) })
}
export function recordingSession(ref: AudioRecordingRef): LessonSessionIdentityV1 {
  const match = /^raw\/([^/]+)\/([^/]+)\/audio\/[^/]+$/.exec(ref.assetPath)
  if (!match) fail("invalid session asset path")
  return { lessonId: match[1]!, sessionId: match[2]! }
}
export async function resolveReplayRecording(store: Pick<WorkspaceStore, "read">, ref: AudioRecordingRef): Promise<ReplayRecording> {
  try {
    const session = await readAudioSession(store, recordingSession(ref))
    if (!session) return { ...ref, availability: "missing" }
    if (!session.value.audioConsent) return { ...ref, availability: "revoked" }
    const data = await store.read(ref.assetPath)
    if (!data) return { ...ref, availability: "missing" }
    if (data.size !== ref.bytes || await audioSha256(data) !== ref.sha256) return { ...ref, availability: "corrupt" }
    return { ...ref, availability: "available", data: new Blob([data], { type: ref.mimeType }) }
  } catch { return { ...ref, availability: "corrupt" } }
}
