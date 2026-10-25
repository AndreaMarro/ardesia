// @vitest-environment jsdom
// Browser-order regression tests: stop queues final dataavailable, then stop.
// Deferred permission/storage promises deliberately expose races hidden by a
// synchronous MediaRecorder mock. All media are synthetic; no microphone opens.
import { afterEach, describe, expect, it, vi } from "vitest"
import { AudioRecorder, parseSessionYaml } from "../store/AudioRecorder"
import type { WorkspaceStore } from "../store/WorkspaceStore"

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function mediaStream() {
  const track = { stop: vi.fn() }
  return { stream: { getTracks: () => [track] } as unknown as MediaStream, track }
}

class BrowserOrderedRecorder {
  state: RecordingState = "inactive"
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  start = vi.fn(() => { this.state = "recording" })
  // Native stop() returns BEFORE either event. Tests deliver them explicitly.
  stop = vi.fn(() => { this.state = "inactive" })
  data(text = "synthetic-audio") { this.ondataavailable?.({ data: new Blob([text]) }) }
  finish(text?: string) {
    this.state = "inactive"
    if (text !== undefined) this.data(text)
    this.onstop?.()
  }
}

function harness() {
  const files = new Map<string, Blob>()
  const store = {
    write: vi.fn(async (path: string, blob: Blob) => { files.set(path, blob) }),
    delete: vi.fn(async (path: string) => { files.delete(path) }),
    list: vi.fn(async (prefix: string) => [...files].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => ({ path, data, mtime: 0 }))),
    saveSessionYaml: vi.fn(async (yaml: string) => { files.set("raw/session.yaml", new Blob([yaml])) }),
  }
  let now = 1000
  const media = mediaStream()
  const getUserMedia = vi.fn().mockResolvedValue(media.stream)
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } })
  const takes: BrowserOrderedRecorder[] = []
  const factory = vi.fn(() => {
    const take = new BrowserOrderedRecorder()
    takes.push(take)
    return take as unknown as MediaRecorder
  })
  const onChunk = vi.fn()
  const recorder = new AudioRecorder({
    store: store as unknown as WorkspaceStore,
    clock: () => now,
    onChunk,
    createMediaRecorder: factory,
  })
  return { recorder, store, files, media, takes, factory, getUserMedia, onChunk, setTime: (value: number) => { now = value } }
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe("AudioRecorder asynchronous browser lifecycle", () => {
  it("ordinary stop drains the final short recording before resolving", async () => {
    const h = harness()
    h.recorder.consent = true
    await h.recorder.start()
    h.setTime(1600)
    let finished = false
    const stopped = h.recorder.stop().then(() => { finished = true })
    await vi.waitFor(() => expect(h.takes[0]!.stop).toHaveBeenCalledOnce())
    expect(finished).toBe(false)
    const saved = deferred<void>()
    h.store.write.mockImplementationOnce(async (path, blob) => { await saved.promise; h.files.set(path, blob) })
    h.takes[0]!.finish("last-600-ms")
    await vi.waitFor(() => expect(h.store.write).toHaveBeenCalledOnce())
    expect(finished).toBe(false)
    expect(h.onChunk).not.toHaveBeenCalled()
    saved.resolve()
    await stopped
    expect(await h.files.get("raw/audio/chunk-0.webm")?.text()).toBe("last-600-ms")
    expect(h.onChunk).toHaveBeenCalledExactlyOnceWith(0, 1000, 1600)
    expect(h.recorder.recording).toBe(false)
    expect(h.media.track.stop).toHaveBeenCalled()
  })

  it.each(["revoke", "stop", "dispose"] as const)("%s during pending permission never starts the late microphone", async (action) => {
    const h = harness()
    const permission = deferred<MediaStream>()
    h.getUserMedia.mockReturnValueOnce(permission.promise)
    h.recorder.consent = true
    const started = h.recorder.start()
    await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledOnce())
    if (action === "revoke") { h.recorder.consent = false; await h.recorder.lastRevoke }
    if (action === "stop") await h.recorder.stop()
    if (action === "dispose") h.recorder.dispose()
    permission.resolve(h.media.stream)
    await started
    expect(h.media.track.stop).toHaveBeenCalled()
    expect(h.factory).not.toHaveBeenCalled()
    expect(h.recorder.recording).toBe(false)
    expect(h.files.has("raw/audio/chunk-0.webm")).toBe(false)
  })

  it("coalesces simultaneous starts while permission is pending", async () => {
    const h = harness()
    const permission = deferred<MediaStream>()
    h.getUserMedia.mockReturnValue(permission.promise)
    h.recorder.consent = true
    const first = h.recorder.start()
    const second = h.recorder.start()
    await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalled())
    expect(h.getUserMedia).toHaveBeenCalledOnce()
    permission.resolve(h.media.stream)
    await Promise.all([first, second])
    expect(h.factory).toHaveBeenCalledOnce()
  })

  it("an obsolete permission rejection cannot revoke a newer recording", async () => {
    const h = harness()
    const oldPermission = deferred<MediaStream>()
    const fresh = mediaStream()
    h.getUserMedia.mockReturnValueOnce(oldPermission.promise).mockResolvedValueOnce(fresh.stream)
    h.recorder.consent = true
    const oldStart = h.recorder.start()
    await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledOnce())
    h.recorder.consent = false
    await h.recorder.lastRevoke
    h.recorder.consent = true
    await h.recorder.start()
    oldPermission.reject(new Error("old prompt dismissed"))
    await oldStart
    expect(h.recorder.consent).toBe(true)
    expect(h.recorder.recording).toBe(true)
    expect(fresh.track.stop).not.toHaveBeenCalled()
    expect(parseSessionYaml(await h.files.get("raw/session.yaml")!.text()).audioConsent).toBe(true)
  })

  it("revocation releases tracks immediately even while a chunk write is blocked", async () => {
    const h = harness()
    h.recorder.consent = true
    await h.recorder.start()
    const write = deferred<void>()
    h.store.write.mockImplementationOnce(async (path, blob) => { await write.promise; h.files.set(path, blob) })
    h.takes[0]!.data()
    await vi.waitFor(() => expect(h.store.write).toHaveBeenCalledOnce())
    h.recorder.consent = false
    expect(h.media.track.stop).toHaveBeenCalled()
    h.takes[0]!.finish("discard-final-after-revoke")
    write.resolve()
    await h.recorder.lastRevoke
    expect([...h.files.keys()].filter(path => path.startsWith("raw/audio/"))).toEqual([])
    expect(h.onChunk).not.toHaveBeenCalled()
  })

  it("rapid re-consent waits for deletion and cannot reuse an old recorder callback", async () => {
    const h = harness()
    h.recorder.consent = true
    await h.recorder.start()
    h.takes[0]!.data("old")
    await vi.waitFor(() => expect(h.onChunk).toHaveBeenCalledOnce())
    const deletion = deferred<void>()
    h.store.delete.mockImplementationOnce(async path => { await deletion.promise; h.files.delete(path) })
    const oldData = h.takes[0]!.ondataavailable!
    const oldStop = h.takes[0]!.onstop!
    h.recorder.consent = false
    h.takes[0]!.finish("discard")
    await vi.waitFor(() => expect(h.store.delete).toHaveBeenCalled())
    h.recorder.consent = true
    const fresh = mediaStream()
    h.getUserMedia.mockResolvedValueOnce(fresh.stream)
    const restarted = h.recorder.start()
    await Promise.resolve()
    expect(h.getUserMedia).toHaveBeenCalledOnce()
    deletion.resolve()
    await restarted
    oldData({ data: new Blob(["stale-take"]) })
    oldStop()
    expect(h.recorder.recording).toBe(true)
    expect(fresh.track.stop).not.toHaveBeenCalled()
    h.takes[1]!.data("new")
    await vi.waitFor(async () => expect(await h.files.get("raw/audio/chunk-0.webm")?.text()).toBe("new"))
    expect(parseSessionYaml(await h.files.get("raw/session.yaml")!.text()).audioConsent).toBe(true)
  })

  it("serializes consent persistence so a delayed ON cannot overwrite revocation", async () => {
    const h = harness()
    const firstWrite = deferred<void>()
    h.store.saveSessionYaml.mockImplementationOnce(async yaml => { await firstWrite.promise; h.files.set("raw/session.yaml", new Blob([yaml])) })
    h.recorder.consent = true
    await vi.waitFor(() => expect(h.store.saveSessionYaml).toHaveBeenCalledOnce())
    h.recorder.consent = false
    firstWrite.resolve()
    await h.recorder.lastRevoke
    expect(parseSessionYaml(await h.files.get("raw/session.yaml")!.text()).audioConsent).toBe(false)
  })

  it("timestamps the actual start after a long permission prompt", async () => {
    const h = harness()
    const permission = deferred<MediaStream>()
    h.getUserMedia.mockReturnValueOnce(permission.promise)
    h.recorder.consent = true
    const started = h.recorder.start()
    await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledOnce())
    h.setTime(41000)
    permission.resolve(h.media.stream)
    await started
    h.setTime(42000)
    h.takes[0]!.data()
    await vi.waitFor(() => expect(h.onChunk).toHaveBeenCalledOnce())
    expect(h.onChunk).toHaveBeenCalledWith(0, 41000, 42000)
    expect(h.recorder.startEpoch).toBe(41000)
  })

  it("releases a granted stream if constructing MediaRecorder throws", async () => {
    const h = harness()
    h.factory.mockImplementationOnce(() => { throw new Error("unsupported encoder") })
    h.recorder.consent = true
    await h.recorder.start()
    expect(h.media.track.stop).toHaveBeenCalled()
    expect(h.recorder.recording).toBe(false)
  })

  it("dispose is terminal even if a caller later toggles consent and starts", async () => {
    const h = harness()
    h.recorder.dispose()
    h.recorder.consent = true
    await h.recorder.start()
    expect(h.getUserMedia).not.toHaveBeenCalled()
    expect(h.recorder.consent).toBe(false)
  })
})
