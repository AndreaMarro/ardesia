// @vitest-environment jsdom
// Actual recorder, IndexedDbEventLog, WorkspaceStore and ZIP exporter; synthetic inputs only.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { IDBFactory, IDBKeyRange } from "fake-indexeddb"
import JSZip from "jszip"
import RecapView from "../RecapView"
import SavedLessonsView from "../design/SavedLessonsView"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import * as eventLogs from "../lessonos/indexedDbEventLog"

const ROOM = "r03-selected"
const OTHER = "r03-foreign"
const SESSION = "11111111-1111-4111-8111-111111111111"
const producer = { id: "test.r03.export", version: "1.0.0", commitSha: "a".repeat(40) }
const originalFactory = eventLogs.createEventLogStore
let nextId = 0
const uuid = () => `00000000-0000-4000-8000-${(++nextId).toString(16).padStart(12, "0")}`
let handles: eventLogs.IndexedDbEventLog[] = []
let downloads: Blob[] = []

beforeEach(() => {
  vi.stubGlobal("IDBKeyRange", IDBKeyRange)
  handles = []
  downloads = []
  vi.stubGlobal("URL", Object.assign(class extends URL {}, {
    createObjectURL: (blob: Blob) => { downloads.push(blob); return "blob:r03" },
    revokeObjectURL: () => {},
  }))
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
})

afterEach(async () => {
  cleanup()
  await Promise.all(handles.map((handle) => handle.close()))
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function fact(room: string, label: string) {
  return createEventEnvelopeV2({ lessonId: room, sessionId: SESSION,
    kind: "concept.introduced", actor: { type: "teacher", id: "synthetic" }, producer,
    causationId: null, idempotencyKey: null,
    evidence: [{ ref: `board:${room}`, resolution: "verified" }],
    payload: { conceptId: label, labels: { it: label } },
  }, { eventId: uuid, now: () => new Date(1000) })
}

async function setup() {
  const bytes = new Map<string, ArrayBuffer>()
  const driver: WorkspaceDriver = {
    name: "synthetic-memory", available: () => true, init: async () => true,
    read: async (path) => bytes.has(path) ? new Blob([bytes.get(path)!]) : null,
    write: async (path, blob) => { bytes.set(path, await blob.arrayBuffer()) },
    delete: async (path) => { bytes.delete(path) },
    list: async (prefix) => [...bytes].filter(([p]) => !prefix || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data: new Blob([data]), mtime: 0 })),
  }
  const store = new WorkspaceStore()
  Object.assign(store, { driver, fallback: driver })
  vi.spyOn(store, "init").mockResolvedValue("localStorage")
  const recorder = new JournalRecorder({ store, journalPath: roomPaths(ROOM).journal,
    identity: { lessonId: ROOM, sessionId: SESSION, actor: { type: "teacher", id: "synthetic" } },
    producer, now: () => 1000, newEventId: uuid, withExclusiveLock: async (_name, work) => work(),
  })
  recorder.recordMathInsert("V = R I")
  await recorder.flush()
  await store.write(roomPaths(ROOM).scene, new Blob([JSON.stringify({ type: "excalidraw", elements: [] })]))
  const old = await originalFactory({ factory: undefined })
  await old.appendEnvelope(fact(ROOM, "OLD STORED"))
  await store.write(roomPaths(ROOM).lessonOsSnapshot, await eventLogs.exportEnvelopeEventLogSnapshot(old))

  const factory = new IDBFactory()
  const open = async () => {
    const handle = new eventLogs.IndexedDbEventLog({ factory })
    await handle.open()
    handles.push(handle)
    vi.spyOn(handle, "close")
    return handle
  }
  const writer = await open()
  const createLog = vi.spyOn(eventLogs, "createEventLogStore").mockImplementation(open)
  return { store, writer, createLog, open }
}

async function showRecap(store: WorkspaceStore) {
  const view = render(<RecapView store={store} room={ROOM} />)
  await waitFor(() => expect(view.container.querySelector("iframe")).not.toBeNull())
  // The preview's handle is released before an independent export handle is opened.
  await waitFor(() => expect(handles[1]!.close).toHaveBeenCalledOnce())
  return view
}

async function downloadRecap() {
  const count = downloads.length
  fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
  await waitFor(() => expect(downloads).toHaveLength(count + 1))
  return JSZip.loadAsync(downloads[count]!)
}

describe("RecapView live export authority", () => {
  it("exports the same current memory as SavedLessonsView, including facts appended after preview", async () => {
    const { store, writer } = await setup()
    await writer.appendEnvelope(fact(ROOM, "OWN INITIAL"))
    await writer.appendEnvelope(fact(OTHER, "FOREIGN"))
    const view = await showRecap(store)
    await writer.appendEnvelope(fact(ROOM, "OWN NEW AFTER PREVIEW"))
    const recapZip = await downloadRecap()
    const recapSnapshot = await recapZip.file("raw/lessonos-events.jsonl")?.async("text")
    expect(recapSnapshot).toContain("OWN NEW AFTER PREVIEW")
    expect(recapSnapshot).toContain("OWN INITIAL")
    expect(recapSnapshot).not.toContain("FOREIGN")
    expect(recapSnapshot).not.toContain("OLD STORED")
    expect(handles[2]!.close).toHaveBeenCalledOnce()
    view.unmount()

    window.history.replaceState(null, "", `/?vista=lezioni-salvate#${ROOM}`)
    const savedDownloads: Blob[] = []
    render(<SavedLessonsView store={store} download={(blob) => { savedDownloads.push(blob) }} />)
    const button = await screen.findByRole("button", { name: "Esporta .lesson" })
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(button)
    await waitFor(() => expect(savedDownloads).toHaveLength(1))
    const savedZip = await JSZip.loadAsync(savedDownloads[0]!)
    expect(await savedZip.file("raw/lessonos-events.jsonl")?.async("text")).toBe(recapSnapshot)
    expect(JSON.parse(await recapZip.file("manifest.json")!.async("text")).lessonId).toBe(ROOM)
  })

  it("does not resurrect the stored snapshot when the current canonical log is empty", async () => {
    const { store } = await setup()
    await showRecap(store)
    const zip = await downloadRecap()
    expect(zip.file("raw/lessonos-events.jsonl")).toBeNull()
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("text"))
    expect(manifest.lessonOs.status).toBe("missing")
    expect(manifest.lessonOs.warnings.join(" ")).toContain("live canonical LessonOS state is empty")
    expect(handles[2]!.close).toHaveBeenCalledOnce()
  })

  it("shows live read failure without download or stale fallback, closes the handle and permits retry", async () => {
    const { store, writer, createLog, open } = await setup()
    await writer.appendEnvelope(fact(ROOM, "OWN RETRY"))
    const view = await showRecap(store)
    let failedHandle: eventLogs.IndexedDbEventLog | undefined
    createLog.mockImplementationOnce(async () => {
      failedHandle = await open()
      vi.spyOn(failedHandle, "readEnvelopesByLesson").mockRejectedValue(new Error("live read rejected"))
      return failedHandle
    })
    fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
    expect((await screen.findByRole("alert")).textContent).toContain("live read rejected")
    expect(downloads).toHaveLength(0)
    expect(failedHandle!.close).toHaveBeenCalledOnce()
    expect(view.container.querySelector("iframe")).not.toBeNull()
    expect((screen.getByRole("button", { name: "esporta .lesson" }) as HTMLButtonElement).disabled).toBe(false)
    const zip = await downloadRecap()
    expect(await zip.file("raw/lessonos-events.jsonl")?.async("text")).toContain("OWN RETRY")
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("fails visibly before exporting when the log factory rejects", async () => {
    const { store, createLog } = await setup()
    await showRecap(store)
    const exportSpy = vi.spyOn(store, "exportLesson")
    createLog.mockRejectedValueOnce(new Error("log acquisition rejected"))
    fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
    expect((await screen.findByRole("alert")).textContent).toContain("log acquisition rejected")
    expect(downloads).toHaveLength(0)
    expect(exportSpy).not.toHaveBeenCalled()
    expect((screen.getByRole("button", { name: "esporta .lesson" }) as HTMLButtonElement).disabled).toBe(false)
  })

  it("closes the export handle when the real exporter rejects an incomplete bundle", async () => {
    const { store } = await setup()
    await showRecap(store)
    await store.delete(roomPaths(ROOM).scene)
    fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
    expect((await screen.findByRole("alert")).textContent).toContain("board.excalidraw")
    expect(downloads).toHaveLength(0)
    expect(handles).toHaveLength(3)
    expect(handles[2]!.close).toHaveBeenCalledOnce()
    expect((screen.getByRole("button", { name: "esporta .lesson" }) as HTMLButtonElement).disabled).toBe(false)
  })
})
