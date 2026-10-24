// @vitest-environment jsdom
// Synthetic bytes/browser ordering; native decoding is a separate browser gate.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder, assertJournalEnvelopeV2 } from "../store/JournalRecorder"
import { createEventEnvelopeV2, studioProducerIdentity } from "../core/contracts/eventEnvelope"
import { sessionPaths, parseSessionYamlV2 } from "../store/sessionState"
import { loadReplayTimeline } from "../store/replayTimeline"
import type { FileEntry, WorkspaceDriver } from "../store/types"
import { exportLesson, importLesson } from "../store/lessonBundle"
import JSZip from "jszip"
import { parseLessonBundleManifestV1 } from "../store/lessonBundleManifest"

const SESSION_A = "11111111-1111-4111-8111-111111111111"
const SESSION_B = "22222222-2222-4222-8222-222222222222"
const RECORDING = "33333333-3333-4333-8333-333333333333"
const identity = { lessonId: "audio-a", sessionId: SESSION_A }
const payload = {
  v: 1, recordingId: RECORDING,
  assetPath: `${sessionPaths(identity).audioDir}${RECORDING}.webm`,
  mimeType: "audio/webm", sha256: "a".repeat(64), bytes: 3,
  startEpoch: 1000, endEpoch: 1600, durationMs: 600, objectRefs: [],
}
function envelope(body: Record<string, unknown> = payload) {
  return createEventEnvelopeV2({ ...identity, kind: "journal.audio.recording", actor: { type: "teacher", id: "synthetic-teacher" },
    producer: studioProducerIdentity(), causationId: null, idempotencyKey: `audio:${RECORDING}`,
    evidence: [{ ref: `asset:${payload.assetPath}#sha256=${payload.sha256}`, resolution: "verified" }], payload: body as never,
  }, { eventId: () => RECORDING, now: () => new Date(1600) })
}

class MemoryDriver implements WorkspaceDriver {
  readonly name = "audio-v2-memory"
  readonly files = new Map<string, Blob>()
  available() { return true }
  async init() { return true }
  async read(path: string) { return this.files.get(path) ?? null }
  async write(path: string, data: Blob) { this.files.set(path, data) }
  async delete(path: string) { this.files.delete(path) }
  async list(prefix = ""): Promise<FileEntry[]> {
    return [...this.files].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => ({ path, data, mtime: 0 }))
  }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((yes) => { resolve = yes })
  return { promise, resolve }
}
class OrderedRecorder {
  state: RecordingState = "inactive"
  mimeType = "audio/webm"
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  start() { this.state = "recording" }
  stop() { this.state = "inactive" }
  finish(text = "synthetic-tail") {
    this.ondataavailable?.({ data: new Blob([text], { type: this.mimeType }) })
    this.onstop?.()
  }
}
function workspace() {
  const driver = new MemoryDriver()
  const store = new WorkspaceStore()
  Object.assign(store, { driver })
  return { store, driver }
}
async function harness(lessonId = "audio-a", sessionId = SESSION_A, existing = workspace()) {
  const { SessionAudioRecorder } = await import("../store/SessionAudioRecorder")
  const takes: OrderedRecorder[] = []
  const track = { stop: vi.fn() }
  const stream = { getTracks: () => [track] } as unknown as MediaStream
  const getUserMedia = vi.fn(async () => stream)
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } })
  let epoch = 1000
  let mono = 0
  const journal = new JournalRecorder({ store: existing.store, journalPath: `raw/${lessonId}/events.jsonl`,
    identity: { lessonId, sessionId, actor: { type: "teacher", id: "synthetic-teacher" } }, producer: studioProducerIdentity(),
    now: () => epoch, withExclusiveLock: async (_name, work) => work(),
  })
  const recorder = new SessionAudioRecorder({ store: existing.store, identity: { lessonId, sessionId }, journal,
    clock: () => epoch, monotonicClock: () => mono,
    createMediaRecorder: () => { const take = new OrderedRecorder(); takes.push(take); return take as unknown as MediaRecorder },
  })
  await recorder.initialize()
  await existing.store.saveScene(lessonId, JSON.stringify({ type: "excalidraw", elements: [] }))
  return { ...existing, recorder, journal, takes, track, stream, getUserMedia,
    time: (nextEpoch: number, nextMono: number) => { epoch = nextEpoch; mono = nextMono } }
}

beforeEach(() => {
  const storage = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key), get length() { return storage.size }, key: (index: number) => [...storage.keys()][index] ?? null,
  } })
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe("canonical audio recording v2", () => {
  it("accepts a strict recording marker without downgrading its envelope", () => {
    expect(() => assertJournalEnvelopeV2(envelope())).not.toThrow()
  })
  it("keeps old bundle reader 1 compatibility and rejects an unsupported reader requirement", async () => {
    const h = await harness()
    h.journal.recordChange([{ id: "old-board", version: 1, type: "text" }]); await h.journal.flush()
    const zip = await JSZip.loadAsync(await exportLesson(h.store, "audio-a"))
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("text"))
    expect(parseLessonBundleManifestV1(manifest).compatibility.minimumReaderSchemaVersion).toBe(1)
    manifest.compatibility.minimumReaderSchemaVersion = 3
    expect(() => parseLessonBundleManifestV1(manifest)).toThrow(/minimumReaderSchemaVersion/)
  })
  it("validates exact replay targets and refuses wrong recording, object and out-of-range time", async () => {
    const h = await harness()
    h.journal.recordChange([{ id: "formula", version: 3, type: "text" }])
    h.recorder.setObjectRefs([{ elementId: "formula", version: 3, label: "Passaggio" }])
    await h.recorder.start(); h.time(1500, 500)
    const stop = h.recorder.stop(); h.takes[0]!.finish(); const saved = await stop
    const timeline = await loadReplayTimeline(h.store, "audio-a")
    const { resolveReplayTarget } = await import("../store/replayTimeline")
    expect(resolveReplayTarget(timeline, `?at=1250&recording=${saved!.recordingId}&object=formula`)).toMatchObject({ epoch: 1250, recordingId: saved!.recordingId, objectId: "formula" })
    expect(() => resolveReplayTarget(timeline, "?at=999999")).toThrow(/tempo|time/i)
    expect(() => resolveReplayTarget(timeline, `?recording=${RECORDING}`)).toThrow(/registrazione|recording/i)
    expect(() => resolveReplayTarget(timeline, `?recording=${saved!.recordingId}&object=foreign`)).toThrow(/oggetto|object/i)
    expect(() => resolveReplayTarget(timeline, "?at=1200junk")).toThrow()
  })
  it.each([
    { ...payload, arbitrary: true }, { ...payload, assetPath: `raw/audio-b/${SESSION_B}/audio/${RECORDING}.webm` },
    { ...payload, durationMs: 599 }, { ...payload, sha256: "placeholder" },
    { ...payload, objectRefs: [{ elementId: "formula", version: 1, label: "Formula", extra: true }] },
  ])("rejects malformed recording payload %#", (body) => {
    expect(() => assertJournalEnvelopeV2(envelope(body))).toThrow()
  })

  it("persists the short final tail before its durable marker and stop completion", async () => {
    const h = await harness()
    await h.recorder.start()
    h.time(1600, 600)
    const write = deferred<void>()
    const originalWrite = h.store.write.bind(h.store)
    vi.spyOn(h.store, "write").mockImplementation(async (path, data) => {
      if (path.startsWith(sessionPaths(identity).audioDir)) await write.promise
      await originalWrite(path, data)
    })
    let complete = false
    const stopped = h.recorder.stop().then((value) => { complete = true; return value })
    expect(h.track.stop).toHaveBeenCalled()
    expect(complete).toBe(false)
    h.takes[0]!.finish()
    await vi.waitFor(() => expect(h.store.write).toHaveBeenCalled())
    expect(await h.store.read("raw/audio-a/events.jsonl")).toBeNull()
    write.resolve()
    const saved = await stopped
    expect(saved).toMatchObject({ startEpoch: 1000, endEpoch: 1600, durationMs: 600, mimeType: "audio/webm" })
    expect(await (await h.store.read(saved!.assetPath))!.text()).toBe("synthetic-tail")
    const timeline = await loadReplayTimeline(h.store, "audio-a")
    expect(timeline.recordings).toHaveLength(1)
    expect(timeline.recordings[0]).toMatchObject({ availability: "available", recordingId: saved!.recordingId })
    expect(timeline.lastEventTime).toBe(1600)
  })

  it("keeps independent takes, a silent pause and the last visual instant", async () => {
    const h = await harness()
    await h.recorder.start(); h.time(1600, 600)
    const one = h.recorder.stop(); h.takes[0]!.finish("first"); const first = await one
    h.time(4000, 3000); await h.recorder.start(); h.time(900, 3500) // wall clock jumps; media time remains monotonic
    const two = h.recorder.stop(); h.takes[1]!.finish("second"); const second = await two
    expect(second!.recordingId).not.toBe(first!.recordingId)
    expect(second!.endEpoch).toBe(4500)
    h.time(4573, 3573); h.journal.recordChange([{ id: "last", version: 1, type: "text" }]); await h.journal.flush()
    const timeline = await loadReplayTimeline(h.store, "audio-a")
    const { recordingAtTime } = await import("../store/replayTimeline")
    expect(recordingAtTime(timeline.recordings, 2500)).toBeNull()
    expect(recordingAtTime(timeline.recordings, 4200)?.recordingId).toBe(second!.recordingId)
    expect(timeline.lastEventTime).toBe(4573)
  })

  it("round-trips A through a new store with identity, bytes and explicit object version, excluding B and hostile flat audio", async () => {
    const h = await harness()
    h.journal.recordChange([{ id: "formula", version: 7, type: "text", text: "Q = pi r^4 deltaP / (8 eta L)" }])
    h.recorder.setObjectRefs([{ elementId: "formula", version: 7, label: "Vincolo di pressione" }])
    await h.recorder.start(); h.time(1800, 800)
    const stopped = h.recorder.stop(); h.takes[0]!.finish("only-A"); const saved = await stopped
    const b = await harness("audio-b", SESSION_B, { store: h.store, driver: h.driver })
    await b.recorder.start(); b.time(1700, 700); const stopB = b.recorder.stop(); b.takes[0]!.finish("secret-B"); await stopB
    await h.store.write("raw/audio/chunk-0.webm", new Blob(["hostile-flat"]))
    const bundle = await exportLesson(h.store, "audio-a")
    const zip = await JSZip.loadAsync(bundle)
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("text"))
    expect(manifest.compatibility.minimumReaderSchemaVersion).toBe(2)
    expect(Object.keys(zip.files).some((path) => path.includes("audio-b"))).toBe(false)
    expect(zip.file("raw/audio/chunk-0.webm")).toBeNull()
    const restored = workspace()
    await importLesson(restored.store, bundle)
    const timeline = await loadReplayTimeline(restored.store, "audio-a")
    expect(timeline.recordings).toHaveLength(1)
    expect(timeline.recordings[0]).toMatchObject({ ...saved, availability: "available", objectRefs: [{ elementId: "formula", version: 7, label: "Vincolo di pressione" }] })
    expect(await (await restored.store.read(saved!.assetPath))!.text()).toBe("only-A")
    const reopened = await harness("audio-a", SESSION_A, restored)
    expect(reopened.getUserMedia).not.toHaveBeenCalled()
    expect(reopened.recorder.recording).toBe(false)
  })

  it.each(["missing", "corrupt", "revoked"] as const)("reports %s media explicitly without flat fallback", async (state) => {
    const h = await harness(); await h.recorder.start(); h.time(1300, 300)
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); const saved = await stopping
    if (state === "missing") await h.store.delete(saved!.assetPath)
    if (state === "corrupt") await h.store.write(saved!.assetPath, new Blob(["corrupt"]))
    if (state === "revoked") await h.recorder.revoke()
    const timeline = await loadReplayTimeline(h.store, "audio-a")
    expect(timeline.recordings[0]?.availability).toBe(state)
  })

  it("releases a late permission stream after revoke without constructing a take", async () => {
    const h = await harness(); const permission = deferred<MediaStream>()
    h.getUserMedia.mockReturnValueOnce(permission.promise)
    const starting = h.recorder.start()
    await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledOnce())
    await h.recorder.revoke(); permission.resolve(h.stream); await starting
    expect(h.takes).toHaveLength(0)
    expect(h.track.stop).toHaveBeenCalled()
    const blob = await h.store.read(sessionPaths(identity).session)
    expect(parseSessionYamlV2(new Uint8Array(await blob!.arrayBuffer())).audioConsent).toBe(false)
  })

  it("waits for a pending media write during revoke and never publishes its marker", async () => {
    const h = await harness(); await h.recorder.start(); h.time(1500, 500)
    const gate = deferred<void>(); let entered = false
    const write = h.store.write.bind(h.store)
    vi.spyOn(h.store, "write").mockImplementation(async (path, data) => {
      if (path.startsWith(sessionPaths(identity).audioDir)) { entered = true; await gate.promise }
      await write(path, data)
    })
    const stopped = h.recorder.stop(); h.takes[0]!.finish()
    await vi.waitFor(() => expect(entered).toBe(true))
    let revoked = false; const revoking = h.recorder.revoke().then(() => { revoked = true })
    await Promise.resolve(); expect(revoked).toBe(false)
    gate.resolve(); await Promise.all([stopped, revoking])
    expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
    expect((await loadReplayTimeline(h.store, "audio-a")).recordings).toEqual([])
  })

  it("dispose preserves the authorized tail while an empty native tail rejects stop", async () => {
    const h = await harness(); await h.recorder.start(); h.time(1200, 200)
    const disposed = h.recorder.dispose(); h.takes[0]!.finish("authorized-tail"); await disposed
    expect((await loadReplayTimeline(h.store, "audio-a")).recordings[0]?.availability).toBe("available")
    const other = await harness("audio-b", SESSION_B)
    await other.recorder.start(); const stopping = other.recorder.stop()
    other.takes[0]!.onstop?.()
    await expect(stopping).rejects.toThrow(/audio|dati/i)
    expect((await loadReplayTimeline(other.store, "audio-b")).recordings).toEqual([])
  })
})
