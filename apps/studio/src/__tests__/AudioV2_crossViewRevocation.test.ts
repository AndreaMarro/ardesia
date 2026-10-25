// @vitest-environment jsdom
// Real canonical store, synthetic native ordering. No physical microphone.
import { afterEach, expect, test, vi } from "vitest"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { SessionAudioRecorder, revokeStoredAudioSession } from "../store/SessionAudioRecorder"
import { sessionPaths, parseSessionYamlV2, type LessonSessionIdentityV1 } from "../store/sessionState"
import { exportLesson, importLesson } from "../store/lessonBundle"
import { createElement } from "react"
import { render, screen, cleanup as cleanupDom } from "@testing-library/react"
import SessionAudioControls from "../SessionAudioControls"

const identity = { lessonId: "synthetic-cross-view", sessionId: "11111111-1111-4111-8111-111111111111" }
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((yes) => { resolve = yes })
  return { promise, resolve }
}
class MemoryDriver {
  readonly name = "synthetic-probe-memory"
  readonly files = new Map<string, Blob>()
  async read(path: string) { return this.files.get(path) ?? null }
  async write(path: string, data: Blob) { this.files.set(path, data) }
  async delete(path: string) { this.files.delete(path) }
  async list(prefix = "") { return [...this.files].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => ({ path, data, mtime: 0 })) }
  available() { return true }
  async init() { return true }
}
class NativeRecorder {
  state = "inactive"
  mimeType = "audio/webm"
  autoFinish = true
  ondataavailable: ((value: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  start() { this.state = "recording" }
  stop() { this.state = "inactive"; if (this.autoFinish) queueMicrotask(() => this.finish()) }
  finish() { this.ondataavailable?.({ data: new Blob(["synthetic-tail"], { type: this.mimeType }) }); this.onstop?.() }
}
const cleanup: Array<() => Promise<unknown>> = []
async function fixture(selectedIdentity: LessonSessionIdentityV1 = identity) {
  const driver = new MemoryDriver()
  const store = new WorkspaceStore(), otherViewStore = new WorkspaceStore()
  Object.assign(store, { driver }); Object.assign(otherViewStore, { driver })
  const tracks: Array<{ stopped: boolean; stop(): void }> = []
  const stream = () => {
    const track = { stopped: false, stop() { this.stopped = true } }; tracks.push(track)
    return { getTracks: () => [track] } as unknown as MediaStream
  }
  const getUserMedia = vi.fn(async () => stream())
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } })
  const takes: NativeRecorder[] = []
  const journal = new JournalRecorder({ store, journalPath: `raw/${selectedIdentity.lessonId}/events.jsonl`,
    identity: { ...selectedIdentity, actor: { type: "teacher", id: "synthetic-teacher" } },
    producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.1.0", commitSha: "1898b63300000000000000000000000000000000" },
    now: () => 1000, withExclusiveLock: async (_name, work) => work(),
  })
  const recorder = new SessionAudioRecorder({ store, identity: selectedIdentity, journal, clock: () => 1000, monotonicClock: () => 0,
    createMediaRecorder: () => { const take = new NativeRecorder(); takes.push(take); return take as unknown as MediaRecorder },
  })
  cleanup.push(() => recorder.dispose())
  await recorder.initialize()
  await store.saveScene(selectedIdentity.lessonId, JSON.stringify({ type: "excalidraw", elements: [] }))
  // A finished take makes this session reachable in another opening's history.
  await recorder.start(); await recorder.stop()
  expect((await store.list(sessionPaths(selectedIdentity).audioDir)).length).toBe(1)
  return { identity: selectedIdentity, driver, store, otherViewStore, recorder, journal, tracks, takes, getUserMedia, stream }
}
afterEach(async () => {
  cleanupDom()
  await Promise.all(cleanup.splice(0).map((work) => work().catch(() => {})))
  vi.unstubAllGlobals()
})

test("control: same-recorder revoke cancels permission before native start", async () => {
  const h = await fixture(), permission = deferred<MediaStream>()
  h.getUserMedia.mockReturnValueOnce(permission.promise)
  const starting = h.recorder.start()
  await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledTimes(2))
  await h.recorder.revoke()
  permission.resolve(h.stream()); await starting
  expect(h.takes).toHaveLength(1)
  expect(h.tracks.at(-1)!.stopped).toBe(true)
})

test("another view's completed revocation stops an active take", async () => {
  const h = await fixture(); await h.recorder.start()
  await revokeStoredAudioSession(h.otherViewStore, identity)
  const session = await h.store.read(sessionPaths(identity).session)
  expect(parseSessionYamlV2(new Uint8Array(await session!.arrayBuffer())).audioConsent).toBe(false)
  expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
  const observation = { stage: h.recorder.getSnapshot().stage, nativeState: h.takes[1]!.state, trackStopped: h.tracks[1]!.stopped }
  await h.recorder.stop()
  expect(observation).toEqual({ stage: "idle", nativeState: "inactive", trackStopped: true })
})

test("another view's completed revocation rejects late permission before native start", async () => {
  const h = await fixture(), permission = deferred<MediaStream>()
  h.getUserMedia.mockReturnValueOnce(permission.promise)
  const starting = h.recorder.start()
  await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledTimes(2))
  await revokeStoredAudioSession(h.otherViewStore, identity)
  permission.resolve(h.stream()); await starting.catch(() => {})
  await h.recorder.stop().catch(() => {})
  expect(h.tracks.at(-1)!.stopped).toBe(true)
  expect(h.takes).toHaveLength(1)
})

test("revocation drains the native tail already stopping before reporting success", async () => {
  const h = await fixture(); await h.recorder.start()
  h.takes[1]!.autoFinish = false
  const stopped = h.recorder.stop()
  let completed = false
  const revoked = revokeStoredAudioSession(h.otherViewStore, identity).then(() => { completed = true })
  await vi.waitFor(async () => {
    const session = await h.store.read(sessionPaths(identity).session)
    expect(parseSessionYamlV2(new Uint8Array(await session!.arrayBuffer())).audioConsent).toBe(false)
  })
  const completedBeforeTail = completed
  h.takes[1]!.finish(); await Promise.all([stopped, revoked])
  expect(completedBeforeTail).toBe(false)
  expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
})

test("revoking another lesson leaves this capture active", async () => {
  const a = await fixture(); await a.recorder.start()
  const b = await fixture({ ...identity, lessonId: "other-lesson" })
  await revokeStoredAudioSession(b.otherViewStore, b.identity)
  expect(a.recorder.getSnapshot().stage).toBe("recording")
  expect(a.tracks[1]!.stopped).toBe(false)
})

test("copied session identities in unrelated drivers have separate revocation barriers", async () => {
  const a = await fixture(); await a.recorder.start()
  const b = await fixture()
  await revokeStoredAudioSession(b.otherViewStore, b.identity)
  expect(a.recorder.getSnapshot().stage).toBe("recording")
  expect(a.tracks[1]!.stopped).toBe(false)
})

test("case-distinct lesson paths cannot hold one another's audio barrier", async () => {
  const a = await fixture({ ...identity, lessonId: "Lesson" }); await a.recorder.start()
  const b = await fixture({ ...identity, lessonId: "lesson" })
  await revokeStoredAudioSession(b.otherViewStore, b.identity)
  expect(a.recorder.getSnapshot().stage).toBe("recording")
  expect(a.tracks[1]!.stopped).toBe(false)
})

test("local-only revocation works when BroadcastChannel is unavailable", async () => {
  vi.stubGlobal("BroadcastChannel", undefined)
  const h = await fixture(); await h.recorder.start()
  await revokeStoredAudioSession(h.otherViewStore, identity)
  expect(h.tracks[1]!.stopped).toBe(true)
  expect(h.recorder.getSnapshot().stage).toBe("idle")
})

test("external revocation refuses old bundle audio on import", async () => {
  const h = await fixture(), bundle = await exportLesson(h.store, identity.lessonId)
  await revokeStoredAudioSession(h.otherViewStore, identity)
  await expect(importLesson(h.store, bundle)).rejects.toThrow(/newer|revok/i)
  expect(await h.store.list(sessionPaths(identity).audioDir)).toEqual([])
})

test("unmount releases pending permission without holding another view's revocation", async () => {
  const h = await fixture(), permission = deferred<MediaStream>()
  h.getUserMedia.mockReturnValueOnce(permission.promise)
  const starting = h.recorder.start()
  await vi.waitFor(() => expect(h.getUserMedia).toHaveBeenCalledTimes(2))
  await h.recorder.dispose()
  await revokeStoredAudioSession(h.otherViewStore, identity)
  permission.resolve(h.stream()); await starting
  expect(h.takes).toHaveLength(1)
  expect(h.tracks.at(-1)!.stopped).toBe(true)
})

test("uncoordinated browser storage fails before consent ON or microphone access", async () => {
  const h = await fixture()
  vi.spyOn(h.store, "audioCaptureCoordinationBackend").mockReturnValue({ kind: "local-storage" })
  vi.stubGlobal("BroadcastChannel", undefined)
  const before = await h.store.read(sessionPaths(identity).session)
  await expect(h.recorder.start()).rejects.toThrow(/coordina|sospesa/)
  expect(h.getUserMedia).toHaveBeenCalledTimes(1)
  expect(await (await h.store.read(sessionPaths(identity).session))!.text()).toBe(await before!.text())
})

test("filesystem capture stays explicitly closed until directory identity can be coordinated", async () => {
  const h = await fixture()
  vi.spyOn(h.store, "audioCaptureCoordinationBackend").mockReturnValue({ kind: "filesystem" })
  await expect(h.recorder.start()).rejects.toThrow(/cartella sospesa/)
  expect(h.getUserMedia).toHaveBeenCalledTimes(1)
})

test("a disposed capture releases both lifetime locks", async () => {
  const h = await fixture(); await h.recorder.start(); await h.recorder.dispose()
  // Memory scope is intentionally not observable; the public native status and
  // completed revocation prove the session lease no longer holds its barrier.
  await revokeStoredAudioSession(h.otherViewStore, identity)
  expect(h.tracks[1]!.stopped).toBe(true)
})

test("a fresh explicit ON waits until the previous view's purge finishes", async () => {
  const h = await fixture(); await h.recorder.start()
  const gate = deferred<void>(), entered = deferred<void>()
  const remove = h.driver.delete.bind(h.driver)
  let held = false
  vi.spyOn(h.driver, "delete").mockImplementation(async (path) => {
    if (!held && path.startsWith(sessionPaths(identity).audioDir)) { held = true; entered.resolve(); await gate.promise }
    return remove(path)
  })
  const revoking = revokeStoredAudioSession(h.otherViewStore, identity)
  await entered.promise
  const starting = h.recorder.start()
  expect(h.recorder.getSnapshot().stage).toBe("requesting")
  const session = await h.store.read(sessionPaths(identity).session)
  expect(parseSessionYamlV2(new Uint8Array(await session!.arrayBuffer())).audioConsent).toBe(false)
  const acquisitionsBeforePurge = h.getUserMedia.mock.calls.length
  gate.resolve(); await Promise.all([revoking, starting])
  expect(acquisitionsBeforePurge).toBe(2)
  expect(h.getUserMedia).toHaveBeenCalledTimes(3)
})

test("unsupported capture is explained before the consent control", async () => {
  const h = await fixture()
  vi.spyOn(h.store, "audioCaptureCoordinationBackend").mockReturnValue({ kind: "filesystem" })
  render(createElement(SessionAudioControls, { recorder: h.recorder }))
  expect((screen.getByRole("checkbox", { name: "Solo il mio microfono docente" }) as HTMLInputElement).disabled).toBe(true)
  expect((screen.getByRole("button", { name: "Registra audio" }) as HTMLButtonElement).disabled).toBe(true)
  expect(screen.getByText(/Registrazione audio su cartella sospesa/)).toBeTruthy()
  expect((screen.getByRole("button", { name: "Revoca e cancella audio" }) as HTMLButtonElement).disabled).toBe(false)
})

test("a delayed OFF cancels a queued intent visibly and requires a new explicit click", async () => {
  const h = await fixture(), offWritten = deferred<void>(), returnCas = deferred<void>()
  const update = h.otherViewStore.updateSessionAudioCAS.bind(h.otherViewStore)
  vi.spyOn(h.otherViewStore, "updateSessionAudioCAS").mockImplementation(async (id, value) => {
    const result = await update(id, value)
    if (!value.audioConsent) { offWritten.resolve(); await returnCas.promise }
    return result
  })
  const revoking = revokeStoredAudioSession(h.otherViewStore, identity)
  await offWritten.promise
  const reopened = new SessionAudioRecorder({ store: h.store, identity, journal: h.journal, clock: () => 1000, monotonicClock: () => 0,
    createMediaRecorder: () => { const take = new NativeRecorder(); h.takes.push(take); return take as unknown as MediaRecorder },
  })
  cleanup.push(() => reopened.dispose())
  await reopened.initialize()
  const starting = reopened.start()
  expect(reopened.getSnapshot().stage).toBe("requesting")
  returnCas.resolve(); await Promise.all([revoking, starting])
  expect(reopened.getSnapshot()).toMatchObject({ stage: "error", error: "Consenso cambiato in un'altra vista. Premi Registra di nuovo per confermare." })
  expect(h.getUserMedia).toHaveBeenCalledTimes(1)
  await reopened.start() // A new human command after the completed revocation.
  expect(reopened.getSnapshot().stage).toBe("recording")
  expect(h.getUserMedia).toHaveBeenCalledTimes(2)
  expect(h.tracks.at(-1)!.stopped).toBe(false)
})

test("an intent created before idempotent OFF cannot start after delayed initialization", async () => {
  const h = await fixture()
  await revokeStoredAudioSession(h.otherViewStore, identity)
  const entered = deferred<void>(), release = deferred<void>()
  const initialize = h.recorder.initialize.bind(h.recorder)
  const latch = vi.spyOn(h.recorder, "initialize").mockImplementation(async () => { await initialize(); entered.resolve(); await release.promise })
  const starting = h.recorder.start()
  await entered.promise
  await revokeStoredAudioSession(h.otherViewStore, identity)
  release.resolve(); await starting
  expect(h.getUserMedia).toHaveBeenCalledTimes(1)
  expect(h.takes).toHaveLength(1)
  expect(h.recorder.getSnapshot().stage).toBe("error")
  expect(h.recorder.getSnapshot().error).toContain("Premi Registra di nuovo")
  const session = await h.store.read(sessionPaths(identity).session)
  expect(parseSessionYamlV2(new Uint8Array(await session!.arrayBuffer())).audioConsent).toBe(false)
  latch.mockRestore()
})
