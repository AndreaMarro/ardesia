// @vitest-environment jsdom
// Synthetic bytes/browser ordering; native decoding is a separate browser gate.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { studioProducerIdentity } from "../core/contracts/eventEnvelope"
import { sessionPaths, parseSessionYamlV2 } from "../store/sessionState"
import { loadReplayTimeline, resolveReplayTarget } from "../store/replayTimeline"
import type { FileEntry, WorkspaceDriver } from "../store/types"
import { exportLesson, importLesson } from "../store/lessonBundle"
import { buildLessonBundleManifest } from "../store/lessonBundleManifest"
import JSZip from "jszip"
const SESSION_A = "11111111-1111-4111-8111-111111111111"
const identity = { lessonId: "audio-a", sessionId: SESSION_A }
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

async function repack(zip: JSZip, sessionIds = [SESSION_A]): Promise<Blob> {
  const entries = new Map<string, FileEntry>()
  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir || path === "manifest.json") continue
    entries.set(path, {path, data: await file.async("blob"), mtime: 0})
  }
  const manifest = await buildLessonBundleManifest(identity.lessonId, sessionIds, entries)
  zip.file("manifest.json", JSON.stringify(manifest))
  return zip.generateAsync({type: "blob"})
}

beforeEach(() => {
  const storage = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key), get length() { return storage.size }, key: (index: number) => [...storage.keys()][index] ?? null,
  } })
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe("independent recorder adversarial review", () => {
  it("reports a native recorder error without requiring a second user stop", async () => {
    const h = await harness()
    await h.recorder.start()
    h.takes[0]!.onerror?.()
    h.takes[0]!.onstop?.()
    await Promise.resolve()
    expect(h.track.stop).toHaveBeenCalled()
    expect(h.recorder.getSnapshot().stage).toBe("error")
    expect(h.recorder.getSnapshot().error).toMatch(/audio|browser/i)
  })

  it("serializes OFF behind the pending effective-start ON and publishes no recording", async () => {
    const h = await harness()
    const gate = deferred<void>()
    const update = h.store.updateSessionAudioCAS.bind(h.store)
    let ons = 0
    vi.spyOn(h.store, "updateSessionAudioCAS").mockImplementation(async (id, value) => {
      if (value.audioConsent && ++ons === 2) await gate.promise
      return update(id, value)
    })
    const starting = h.recorder.start()
    await vi.waitFor(() => expect(ons).toBe(2))
    let done = false
    const revoked = h.recorder.revoke().then(() => { done = true })
    expect(done).toBe(false)
    h.takes[0]!.finish()
    gate.resolve()
    await Promise.all([starting, revoked])
    const session = await h.store.read(sessionPaths(identity).session)
    expect(parseSessionYamlV2(new Uint8Array(await session!.arrayBuffer())).audioConsent).toBe(false)
    expect((await loadReplayTimeline(h.store, identity.lessonId)).recordings).toEqual([])
    expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
    expect(h.recorder.getSnapshot()).toMatchObject({stage: "idle", lastRecording: null})
  })

  it("rejects an object version never recorded rather than marking its evidence verified", async () => {
    const h = await harness()
    h.journal.recordChange([{ id: "formula", type: "text", version: 2, text: "synthetic" }])
    h.recorder.setObjectRefs([{elementId: "formula", version: 99, label: "wrong version"}])
    await h.recorder.start()
    const stopping = h.recorder.stop()
    h.takes[0]!.finish()
    await expect(stopping).rejects.toThrow(/not recorded|version/i)
    expect((await loadReplayTimeline(h.store, identity.lessonId)).recordings).toEqual([])
  })

  it("drains a spontaneous native stop without a later button gesture", async () => {
    const h = await harness()
    await h.recorder.start()
    h.time(1300, 300)
    h.takes[0]!.state = "inactive"
    h.takes[0]!.finish("native-end-tail")
    await vi.waitFor(() => expect(h.recorder.getSnapshot().stage).toBe("idle"))
    const saved = h.recorder.getSnapshot().lastRecording
    expect(saved).toBeTruthy()
    expect(await (await h.store.read(saved!.assetPath))!.text()).toBe("native-end-tail")
    expect((await loadReplayTimeline(h.store, identity.lessonId)).recordings[0]?.availability).toBe("available")
  })

  it("a revoked session cannot be restored by importing an older bundle", async () => {
    const h = await harness()
    await h.recorder.start()
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); await stopping
    const bundle = await exportLesson(h.store, identity.lessonId)
    await h.recorder.revoke()
    await expect(importLesson(h.store, bundle)).rejects.toThrow(/newer|revok/i)
    expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
  })

  it("a revocation committed after import validation survives the import target writes", async () => {
    const h = await harness()
    await h.recorder.start()
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); await stopping
    const bundle = await exportLesson(h.store, identity.lessonId)
    const gate = deferred<void>()
    let entered = false
    const write = h.store.write.bind(h.store)
    vi.spyOn(h.store, "write").mockImplementation(async (path, data) => {
      if (path === `raw/${identity.lessonId}/board.excalidraw`) { entered = true; await gate.promise }
      await write(path, data)
    })
    const importing = importLesson(h.store, bundle).then(() => "committed", () => "rejected")
    await vi.waitFor(() => expect(entered).toBe(true))
    await h.recorder.revoke()
    gate.resolve()
    await importing
    const current = await h.store.read(sessionPaths(identity).session)
    expect(parseSessionYamlV2(new Uint8Array(await current!.arrayBuffer())).audioConsent).toBe(false)
    expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
    expect((await loadReplayTimeline(h.store, identity.lessonId)).recordings[0]?.availability).toBe("revoked")
  })


  it("rejects corrupt audio even when an attacker recomputes the outer manifest", async () => {
    const h = await harness()
    await h.recorder.start()
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); const saved = await stopping
    const zip = await JSZip.loadAsync(await exportLesson(h.store, identity.lessonId))
    zip.file(saved!.assetPath, "corrupt attacker bytes")
    const target = workspace()
    await expect(importLesson(target.store, await repack(zip))).rejects.toThrow(/corrupt|integrity/i)
    expect(target.driver.files.size).toBe(0)
  })

  it("rejects foreign canonical sessions before writing any target", async () => {
    const h = await harness()
    await h.recorder.start()
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); await stopping
    const zip = await JSZip.loadAsync(await exportLesson(h.store, identity.lessonId))
    const sessionB = "22222222-2222-4222-8222-222222222222"
    const other = await harness("audio-b", sessionB)
    const otherPaths = sessionPaths({lessonId: "audio-b", sessionId: sessionB})
    zip.file(otherPaths.session, (await other.store.read(otherPaths.session))!)
    const target = workspace()
    await expect(importLesson(target.store, await repack(zip, [SESSION_A, sessionB]))).rejects.toThrow(/foreign/i)
    expect(target.driver.files.size).toBe(0)
  })

  it("resolves a late annotation with all pins and rejects every mismatched pin", async () => {
    const h = await harness()
    await h.recorder.start()
    h.time(1200, 200)
    h.journal.recordChange([{ id: "late-formula", type: "text", version: 7, text: "synthetic" }])
    h.recorder.setObjectRefs([{elementId: "late-formula", version: 7, label: "late annotation"}])
    h.time(1500, 500)
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); const saved = await stopping
    const timeline = await loadReplayTimeline(h.store, identity.lessonId)
    const pins = new URLSearchParams({at: String(saved!.endEpoch), recording: saved!.recordingId,
      object: "late-formula", objectVersion: "7", session: SESSION_A, sha: saved!.sha256})
    expect(resolveReplayTarget(timeline, pins.toString()).epoch).toBe(1500)
    for (const [key, value] of [["session", "22222222-2222-4222-8222-222222222222"], ["sha", "b".repeat(64)],
      ["object", "different"], ["objectVersion", "8"], ["at", "999"], ["recording", "different"]]) {
      const altered = new URLSearchParams(pins)
      altered.set(key!, value!)
      expect(() => resolveReplayTarget(timeline, altered.toString())).toThrow()
    }
    const tooEarly = new URLSearchParams(pins)
    tooEarly.set("at", "1000")
    expect(() => resolveReplayTarget(timeline, tooEarly.toString())).toThrow(/scena|versione/i)
  })


  it("an untrusted higher imported revision cannot override an existing explicit OFF", async () => {
    const h = await harness()
    await h.recorder.start()
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); await stopping
    const zip = await JSZip.loadAsync(await exportLesson(h.store, identity.lessonId))
    await h.recorder.revoke()
    const yaml = await zip.file(sessionPaths(identity).session)!.async("text")
    zip.file(sessionPaths(identity).session, yaml.replace(/revision: \d+/, "revision: 999"))
    const importing = importLesson(h.store, await repack(zip)).then(() => "committed", () => "rejected")
    await importing
    const current = await h.store.read(sessionPaths(identity).session)
    expect(parseSessionYamlV2(new Uint8Array(await current!.arrayBuffer())).audioConsent).toBe(false)
    expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
  })


  it("dispose cancels a pending permission without persisting revocation or accepting its late stream", async () => {
    const h = await harness()
    const permission = deferred<MediaStream>()
    h.getUserMedia.mockReturnValueOnce(permission.promise)
    const starting = h.recorder.start()
    await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledOnce())
    await h.recorder.dispose()
    expect(h.recorder.getSnapshot().stage).toBe("disposed")
    permission.resolve(h.stream)
    await starting
    expect(h.takes).toHaveLength(0)
    expect(h.track.stop).toHaveBeenCalled()
    const session = await h.store.read(sessionPaths(identity).session)
    expect(parseSessionYamlV2(new Uint8Array(await session!.arrayBuffer())).audioConsent).toBe(true)
    expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
  })

  it("a failed purge stays observable and an explicit retry finishes deletion", async () => {
    const h = await harness()
    await h.recorder.start()
    const stopping = h.recorder.stop(); h.takes[0]!.finish(); const saved = await stopping
    const nativeDelete = h.driver.delete.bind(h.driver)
    let denied = true
    vi.spyOn(h.driver, "delete").mockImplementation(async (path) => {
      if (denied && path === saved!.assetPath) throw new Error("synthetic purge denied")
      return nativeDelete(path)
    })
    await expect(h.recorder.revoke()).rejects.toThrow(/purge denied/)
    expect(h.recorder.getSnapshot()).toMatchObject({stage: "error"})
    expect(await h.store.read(saved!.assetPath)).not.toBeNull()
    expect((await loadReplayTimeline(h.store, identity.lessonId)).recordings[0]?.availability).toBe("revoked")
    denied = false
    await h.recorder.revoke()
    expect(h.recorder.getSnapshot()).toMatchObject({stage: "idle", lastRecording: null})
    expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
  })


  it("a synchronous native start failure stays visible and leaves dispose drainable", async () => {
    const h = await harness()
    vi.spyOn(OrderedRecorder.prototype, "start").mockImplementationOnce(() => { throw new Error("synthetic native start denied") })
    await expect(h.recorder.start()).rejects.toThrow(/native start denied/)
    expect(h.track.stop).toHaveBeenCalled()
    expect(h.recorder.getSnapshot().stage).toBe("error")
    let disposed = false
    const closing = h.recorder.dispose().then(() => { disposed = true })
    await vi.waitFor(() => expect(disposed).toBe(true))
    await closing
  })

  it("a failed effective-start CAS cannot be reported as idle success after the tail closes", async () => {
    const h = await harness()
    const update = h.store.updateSessionAudioCAS.bind(h.store)
    let calls = 0
    vi.spyOn(h.store, "updateSessionAudioCAS").mockImplementation(async (id, value) => {
      if (++calls === 2) throw new Error("synthetic effective start CAS denied")
      return update(id, value)
    })
    await expect(h.recorder.start()).rejects.toThrow(/CAS denied/)
    h.takes[0]!.finish()
    await vi.waitFor(() => expect(h.recorder.getSnapshot().stage).toBe("error"))
    expect(h.recorder.getSnapshot().error).toMatch(/CAS denied/)
    expect((await loadReplayTimeline(h.store, identity.lessonId)).recordings).toEqual([])
  })

})
