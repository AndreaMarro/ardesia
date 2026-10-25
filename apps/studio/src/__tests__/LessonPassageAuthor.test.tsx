// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import LessonPassageAuthor from "../LessonPassageAuthor"
import { revokeStoredAudioSession, SessionAudioRecorder } from "../store/SessionAudioRecorder"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"

const dispose: Array<() => Promise<void>> = []
beforeEach(() => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
    get length() { return values.size }, key: (index: number) => [...values.keys()][index] ?? null,
  } })
})
afterEach(async () => {
  cleanup()
  await Promise.all(dispose.splice(0).map((close) => close()))
  vi.unstubAllGlobals()
})
function props() {
  const state = { stage: "idle", error: null, lastRecording: null }
  const recorder = { identity: { lessonId: "aula-test", sessionId: "11111111-1111-4111-8111-111111111111" }, getSnapshot: () => state,
    subscribe: () => () => {}, captureUnavailableReason: () => null, setObjectRefs: vi.fn(), start: vi.fn(), stop: vi.fn(), revoke: vi.fn() }
  const selected = [{ elementId: "existing-formula", version: 7, label: "Formula già sulla lavagna" }]
  return { recorder: recorder as unknown as SessionAudioRecorder,
    store: { read: async () => null } as unknown as WorkspaceStore,
    onAnnotate: vi.fn(async () => selected), onLinkSelection: vi.fn(async () => selected), selectedObjects: selected }
}
describe("teacher's passage panel", () => {
  it("links an existing selected object without adding a second annotation or starting capture", async () => {
    const p = props(); render(<LessonPassageAuthor {...p} />)
    fireEvent.click(screen.getByRole("button", { name: "Registra e collega un passaggio" }))
    fireEvent.click(screen.getByRole("button", { name: "Collega oggetto selezionato" }))
    expect(await screen.findByText(/Passaggio collegato: Formula già sulla lavagna/)).toBeTruthy()
    expect(p.onLinkSelection).toHaveBeenCalledOnce()
    expect(p.onAnnotate).not.toHaveBeenCalled()
    expect(p.recorder.start).not.toHaveBeenCalled()
  })
  it("returns focus to the panel trigger on Escape and leaves recording default off", () => {
    const p = props(); render(<LessonPassageAuthor {...p} />)
    const trigger = screen.getByRole("button", { name: "Registra e collega un passaggio" })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText("Oppure aggiungi un'annotazione"))
    const field = screen.getByRole("textbox", { name: "Annotazione del docente" }); field.focus()
    fireEvent.keyDown(field, { key: "Escape" })
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(p.recorder.start).not.toHaveBeenCalled()
  })
  it("clears the saved marker and transfer reference when another view revokes the real recorder", async () => {
    const files = new Map<string, Blob>()
    const driver = {
      name: "passage-presentation-memory", available: () => true, init: async () => true,
      read: async (path: string) => files.get(path) ?? null,
      write: async (path: string, data: Blob) => { files.set(path, data) },
      delete: async (path: string) => { files.delete(path) },
      list: async (prefix = "") => [...files].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => ({ path, data, mtime: 0 })),
    }
    const store = new WorkspaceStore(), otherView = new WorkspaceStore()
    Object.assign(store, { driver }); Object.assign(otherView, { driver })
    const identity = { lessonId: "passage-presentation", sessionId: "11111111-1111-4111-8111-111111111111" }
    const objectRefs = [{ elementId: "existing-formula", version: 7, label: "Formula già sulla lavagna" }]
    const getUserMedia = vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] }) as unknown as MediaStream)
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia }, clipboard: { writeText: vi.fn(async () => {}) } })
    const journal = new JournalRecorder({ store, journalPath: `raw/${identity.lessonId}/events.jsonl`,
      identity: { ...identity, actor: { type: "teacher", id: "synthetic-teacher" } },
      producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.1.0", commitSha: "51023fc5f0e3df5cee52b40bbe3f7d47028bca5a" },
      now: () => 1000, withExclusiveLock: async (_name, work) => work(),
    })
    class SyntheticRecorder {
      state = "inactive"
      mimeType = "audio/webm"
      ondataavailable: ((event: { data: Blob }) => void) | null = null
      onstop: (() => void) | null = null
      start() { this.state = "recording" }
      stop() {
        this.state = "inactive"
        queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(["synthetic-tail"], { type: this.mimeType }) }); this.onstop?.() })
      }
    }
    const recorder = new SessionAudioRecorder({ store, identity, journal, clock: () => 1000, monotonicClock: () => 0,
      createMediaRecorder: () => new SyntheticRecorder() as unknown as MediaRecorder,
    })
    dispose.push(() => recorder.dispose())
    await recorder.initialize()
    await store.saveScene(identity.lessonId, JSON.stringify({ type: "excalidraw", elements: [] }))
    journal.recordChange([{ id: "existing-formula", version: 7, type: "text", text: "Contesto sintetico" }])
    render(<LessonPassageAuthor recorder={recorder} store={store} onAnnotate={async () => objectRefs} />)
    fireEvent.click(screen.getByRole("button", { name: "Registra e collega un passaggio" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Annotazione del docente" }), { target: { value: "Contesto sintetico" } })
    fireEvent.click(screen.getByRole("button", { name: "Annota passaggio" }))
    await screen.findByText(/Passaggio collegato: Formula già sulla lavagna/)
    await act(async () => { await recorder.start(); await recorder.stop() })
    expect(await screen.findByText("Passaggio salvato")).toBeTruthy()
    fireEvent.click(screen.getByText("Altri modi di trasferire il passaggio"))
    fireEvent.click(screen.getByRole("button", { name: "Copia passaggio per il corso" }))
    expect(await screen.findByRole("textbox", { name: "Riferimento del passaggio" })).toBeTruthy()
    await act(async () => { await revokeStoredAudioSession(otherView, identity) })
    await waitFor(() => expect(recorder.getSnapshot().lastRecording).toBeNull())
    expect(screen.queryByText("Passaggio salvato")).toBeNull()
    expect(screen.getByRole("button", { name: "Copia passaggio per il corso" }).hasAttribute("disabled")).toBe(true)
    expect(screen.queryByRole("textbox", { name: "Riferimento del passaggio" })).toBeNull()
    expect(screen.getByText(/Passaggio collegato: Formula già sulla lavagna/)).toBeTruthy()
    expect(getUserMedia).toHaveBeenCalledOnce()
  })
})
