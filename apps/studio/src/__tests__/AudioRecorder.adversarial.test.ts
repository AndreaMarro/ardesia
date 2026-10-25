// @vitest-environment jsdom
// Independent failure probes: successful stop means final bytes AND marker
// were committed. A recorder failure must still release its microphone.
import { afterEach, describe, expect, it, vi } from "vitest"
import { AudioRecorder, parseSessionYaml } from "../store/AudioRecorder"
import type { WorkspaceStore } from "../store/WorkspaceStore"

function failingStorageRecorder(failure: "bytes" | "marker" | "marker-async" | "none") {
  const disk = new Map<string, Blob>()
  const problem = new Error(`synthetic ${failure} persistence failure`)
  const track = { stop: vi.fn() }
  vi.stubGlobal("navigator", {
    mediaDevices: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) },
  })
  const store = {
    saveSessionYaml: vi.fn(async (text: string) => { disk.set("raw/session.yaml", new Blob([text])) }),
    write: vi.fn(async (path: string, blob: Blob) => {
      if (failure === "bytes") throw problem
      disk.set(path, blob)
    }),
    list: vi.fn(async (prefix: string) => [...disk].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => ({ path, data, mtime: 0 }))),
    delete: vi.fn(async (path: string) => { disk.delete(path) }),
  }
  const marker = vi.fn((): void | Promise<void> => {
    if (failure === "marker") throw problem
    if (failure === "marker-async") return Promise.reject(problem)
  })
  const media = {
    state: "inactive" as RecordingState,
    ondataavailable: null as null | ((event: { data: Blob }) => void),
    onstop: null as null | (() => void),
    onerror: null as null | (() => void),
    start() { this.state = "recording" },
    stop() {
      this.state = "inactive"
      queueMicrotask(() => {
        this.ondataavailable?.({ data: new Blob(["synthetic final segment"]) })
        this.onstop?.()
      })
    },
  }
  const recorder = new AudioRecorder({
    store: store as unknown as WorkspaceStore,
    clock: () => 1000,
    onChunk: marker,
    createMediaRecorder: () => media as unknown as MediaRecorder,
  })
  return { recorder, disk, problem, marker, track, media }
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe("AudioRecorder independent persistence failures", () => {
  it.each(["bytes", "marker", "marker-async"] as const)("stop reports a %s failure instead of acknowledging a saved final segment", async (failure) => {
    const h = failingStorageRecorder(failure)
    h.recorder.consent = true
    await h.recorder.start()
    await expect(h.recorder.stop()).rejects.toThrow(h.problem.message)
    expect(h.recorder.recording).toBe(false)
    expect(h.recorder.lastError).toBe(h.problem)
    expect(h.track.stop).toHaveBeenCalled()
    if (failure === "bytes") {
      expect(h.disk.has("raw/audio/chunk-0.webm")).toBe(false)
      expect(h.marker).not.toHaveBeenCalled()
    }
  })

  it("revocation still deletes stored bytes after a failed marker callback", async () => {
    const h = failingStorageRecorder("marker")
    h.recorder.consent = true
    await h.recorder.start()
    await h.recorder.stop().catch(() => {})
    expect(h.disk.has("raw/audio/chunk-0.webm")).toBe(true)
    h.recorder.consent = false
    await h.recorder.lastRevoke
    expect([...h.disk.keys()].filter((path) => path.startsWith("raw/audio/"))).toEqual([])
    expect(parseSessionYaml(await h.disk.get("raw/session.yaml")!.text()).audioConsent).toBe(false)
    expect(h.recorder.lastError).toBe(h.problem)
  })

  it("stop waits for the asynchronous marker commit after bytes are stored", async () => {
    const h = failingStorageRecorder("none")
    let finishMarker!: () => void
    const markerCommit = new Promise<void>((resolve) => { finishMarker = resolve })
    h.marker.mockImplementationOnce(() => markerCommit)
    h.recorder.consent = true
    await h.recorder.start()
    let stopped = false
    const completion = h.recorder.stop().then(() => { stopped = true })
    await vi.waitFor(() => expect(h.marker).toHaveBeenCalledOnce())
    expect(h.disk.has("raw/audio/chunk-0.webm")).toBe(true)
    expect(stopped).toBe(false)
    finishMarker()
    await completion
    expect(stopped).toBe(true)
    expect(h.recorder.lastError).toBe(null)
  })

  it("a native recorder error is observable and releases the stream", async () => {
    const h = failingStorageRecorder("none")
    h.recorder.consent = true
    await h.recorder.start()
    h.media.onerror?.()
    await expect(h.recorder.stop()).rejects.toThrow("Audio recording failed")
    expect(h.recorder.recording).toBe(false)
    expect(h.track.stop).toHaveBeenCalled()
    expect(h.recorder.lastError?.message).toBe("Audio recording failed")
  })
})
