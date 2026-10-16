// @vitest-environment jsdom
// Superficie Materiali: export rigoroso come il Recap. Factory applicativa
// reale, IndexedDbEventLog reale, WorkspaceStore reale, ZIP reale; sintetici.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { IDBDatabase, IDBFactory, IDBKeyRange } from "fake-indexeddb"
import JSZip from "jszip"
import SavedLessonsView from "../design/SavedLessonsView"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import * as eventLogs from "../lessonos/indexedDbEventLog"

const ROOM = "mat-selected"
const OTHER = "mat-foreign"
const SESSION = "22222222-2222-4222-8222-222222222222"
const producer = { id: "test.mat.export", version: "1.0.0", commitSha: "b".repeat(40) }
const originalFactory = eventLogs.createEventLogStore
const originalOpen = eventLogs.IndexedDbEventLog.prototype.open
let nextId = 0
const uuid = () => `00000000-0000-4000-8000-${(++nextId).toString(16).padStart(12, "0")}`
let handles: eventLogs.IndexedDbEventLog[] = []
let savedDownloads: Blob[] = []

beforeEach(() => {
  vi.stubGlobal("IDBKeyRange", IDBKeyRange)
  handles = []
  savedDownloads = []
})

afterEach(async () => {
  cleanup()
  await Promise.all(handles.map((handle) => handle.close()))
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.history.replaceState(null, "", "/")
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
  // Memoria archiviata da una sessione sana precedente.
  const old = await originalFactory({ factory: undefined })
  await old.appendEnvelope(fact(ROOM, "OLD STORED"))
  await store.write(roomPaths(ROOM).lessonOsSnapshot, await eventLogs.exportEnvelopeEventLogSnapshot(old))

  const factory = new IDBFactory()
  vi.stubGlobal("indexedDB", factory)
  vi.spyOn(eventLogs.IndexedDbEventLog.prototype, "open")
    .mockImplementation(async function (this: eventLogs.IndexedDbEventLog) {
      if (!handles.includes(this)) {
        handles.push(this)
        vi.spyOn(this, "close")
      }
      return originalOpen.call(this)
    })
  const writer = new eventLogs.IndexedDbEventLog({ factory })
  await writer.open()
  return { store, writer }
}

async function showMaterials(store: WorkspaceStore) {
  window.history.replaceState(null, "", `/?vista=lezioni-salvate#${ROOM}`)
  render(<SavedLessonsView store={store} download={(blob) => { savedDownloads.push(blob) }} />)
  const button = await screen.findByRole("button", { name: "Esporta .lesson" })
  await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
  return button as HTMLButtonElement
}

async function exportMaterials(button: HTMLButtonElement) {
  const count = savedDownloads.length
  fireEvent.click(button)
  await waitFor(() => expect(
    savedDownloads.length > count || screen.queryByRole("alert") !== null,
  ).toBe(true))
}

async function snapshotText(index: number) {
  const zip = await JSZip.loadAsync(savedDownloads[index]!)
  return zip.file("raw/lessonos-events.jsonl")?.async("text") ?? null
}

describe("SavedLessonsView export authority", () => {
  it("never turns an unavailable backend into a verified-empty export", async () => {
    const { store } = await setup()
    // Il backend cade DOPO il mount: la factory al mount era sana, ma qui
    // simuliamo il fallback che la factory generale produrrebbe (log
    // canonico in-memory vuoto) intercettando la decisione reale di
    // acquisizione dell'export, senza mockare l'esportatore.
    vi.stubGlobal("indexedDB", undefined)
    const button = await showMaterials(store)
    const exportSpy = vi.spyOn(store, "exportLesson")
    await exportMaterials(button)
    expect(await screen.findByRole("alert")).not.toBeNull()
    expect(savedDownloads).toHaveLength(0)
    expect(exportSpy).not.toHaveBeenCalled()
    expect((screen.getByRole("button", { name: "Esporta .lesson" }) as HTMLButtonElement).disabled).toBe(false)
  })

  it("exports current memory on a healthy backend, excluding the foreign lesson", async () => {
    const { store, writer } = await setup()
    await writer.appendEnvelope(fact(ROOM, "OWN INITIAL"))
    await writer.appendEnvelope(fact(OTHER, "FOREIGN"))
    const button = await showMaterials(store)
    await exportMaterials(button)
    expect(screen.queryByRole("alert")).toBeNull()
    expect(savedDownloads).toHaveLength(1)
    const text = await snapshotText(0)
    expect(text).toContain("OWN INITIAL")
    expect(text).not.toContain("FOREIGN")
    expect(text).not.toContain("OLD STORED")
    const zip = await JSZip.loadAsync(savedDownloads[0]!)
    expect(JSON.parse(await zip.file("manifest.json")!.async("text")).lessonId).toBe(ROOM)
  })

  it("does not resurrect the stored snapshot when the current canonical log is empty", async () => {
    const { store } = await setup()
    const button = await showMaterials(store)
    await exportMaterials(button)
    expect(screen.queryByRole("alert")).toBeNull()
    expect(savedDownloads).toHaveLength(1)
    const zip = await JSZip.loadAsync(savedDownloads[0]!)
    expect(zip.file("raw/lessonos-events.jsonl")).toBeNull()
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("text"))
    expect(manifest.lessonOs.status).toBe("missing")
    expect(manifest.lessonOs.warnings.join(" ")).toContain("live canonical LessonOS state is empty")
  })

  it("shows live read failure without download, closes the handle and permits retry", async () => {
    const { store, writer } = await setup()
    await writer.appendEnvelope(fact(ROOM, "OWN RETRY"))
    const button = await showMaterials(store)
    vi.spyOn(eventLogs.IndexedDbEventLog.prototype, "readEnvelopesByLesson")
      .mockRejectedValueOnce(new Error("live read rejected"))
    const exportSpy = vi.spyOn(store, "exportLesson")
    await exportMaterials(button)
    expect((await screen.findByRole("alert")).textContent).toContain("live read rejected")
    expect(savedDownloads).toHaveLength(0)
    expect(exportSpy).toHaveBeenCalledOnce()
    expect(handles[handles.length - 1]!.close).toHaveBeenCalledOnce()
    expect(button.disabled).toBe(false)
    await exportMaterials(button)
    expect(await snapshotText(0)).toContain("OWN RETRY")
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("fails visibly and closes the handle when persistent log opening rejects", async () => {
    const { store } = await setup()
    const button = await showMaterials(store)
    const exportSpy = vi.spyOn(store, "exportLesson")
    const closeSpy = vi.spyOn(eventLogs.IndexedDbEventLog.prototype, "close")
    vi.spyOn(eventLogs.IndexedDbEventLog.prototype, "open")
      .mockRejectedValueOnce(new Error("log acquisition rejected"))
    await exportMaterials(button)
    expect((await screen.findByRole("alert")).textContent).toContain("indexeddb-open-failed")
    expect(savedDownloads).toHaveLength(0)
    expect(exportSpy).not.toHaveBeenCalled()
    expect(closeSpy).toHaveBeenCalledOnce()
    expect(button.disabled).toBe(false)
  })

  it.each(["missing", "throwing", "request-error"] as const)(
    "blocks an unavailable persistent backend (%s), preserves originals and permits a real retry",
    async (failure) => {
      const { store, writer } = await setup()
      const savedSnapshot = await (await store.read(roomPaths(ROOM).lessonOsSnapshot))!.text()
      const button = await showMaterials(store)
      const exportSpy = vi.spyOn(store, "exportLesson")
      const unavailable = new IDBFactory()
      if (failure === "missing") {
        vi.stubGlobal("indexedDB", undefined)
      } else {
        vi.stubGlobal("indexedDB", unavailable)
        vi.spyOn(unavailable, "open").mockImplementation(() => {
          if (failure === "throwing") throw new DOMException("access denied", "SecurityError")
          const request = { error: new DOMException("open failed", "UnknownError"), onerror: null as (() => void) | null }
          queueMicrotask(() => request.onerror?.())
          return request as unknown as IDBOpenDBRequest
        })
      }
      await exportMaterials(button)
      expect(await screen.findByRole("alert")).not.toBeNull()
      expect(savedDownloads).toHaveLength(0)
      expect(exportSpy).not.toHaveBeenCalled()
      expect(button.disabled).toBe(false)
      expect(await (await store.read(roomPaths(ROOM).lessonOsSnapshot))!.text()).toBe(savedSnapshot)
      const recovered = new IDBFactory()
      vi.stubGlobal("indexedDB", recovered)
      const restoredWriter = new eventLogs.IndexedDbEventLog({ factory: recovered })
      await restoredWriter.open()
      await restoredWriter.appendEnvelope(fact(ROOM, "RECOVERED CURRENT"))
      await writer.close()
      await exportMaterials(button)
      expect(await snapshotText(0)).toContain("RECOVERED CURRENT")
      expect(screen.queryByRole("alert")).toBeNull()
    },
  )

  it("closes a partially opened database on acquisition failure and allows retry", async () => {
    const { store, writer } = await setup()
    await writer.appendEnvelope(fact(ROOM, "AFTER OPEN RETRY"))
    const button = await showMaterials(store)
    const nativeClose = vi.spyOn(IDBDatabase.prototype, "close")
    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementationOnce(() => {
      throw new DOMException("cannot inspect opened database", "UnknownError")
    })
    const exportSpy = vi.spyOn(store, "exportLesson")
    await exportMaterials(button)
    expect((await screen.findByRole("alert")).textContent).toContain("indexeddb-open-failed")
    expect(savedDownloads).toHaveLength(0)
    expect(exportSpy).not.toHaveBeenCalled()
    expect(handles[handles.length - 1]!.close).toHaveBeenCalledOnce()
    expect(nativeClose).toHaveBeenCalledOnce()
    await exportMaterials(button)
    expect(await snapshotText(0)).toContain("AFTER OPEN RETRY")
    expect(screen.queryByRole("alert")).toBeNull()
  })
})


async function putPhysical(writer: eventLogs.IndexedDbEventLog, record: Record<string, unknown>) {
  const db = (writer as unknown as { db: IDBDatabase }).db
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("lessonos_events", "readwrite")
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore("lessonos_events").put(record)
  })
}

describe("Materials cannot misclassify damaged canonical memory as empty", () => {
  it.each(["target", "another-target-session", "unattributable"] as const)(
    "refuses malformed physical rows (%s) before creating a bundle", async kind => {
      const { store, writer } = await setup()
      const record: Record<string, unknown> = { ...fact(ROOM, "BROKEN CURRENT"), seq: 1, extra: "invalid" }
      if (kind === "another-target-session") record.sessionId = "33333333-3333-4333-8333-333333333333"
      if (kind === "unattributable") { delete record.lessonId; delete record.sessionId }
      await putPhysical(writer, record)
      const button = await showMaterials(store)
      const exportSpy = vi.spyOn(store, "exportLesson")
      await exportMaterials(button)
      expect(await screen.findByRole("alert")).not.toBeNull()
      expect(savedDownloads).toHaveLength(0)
      expect(exportSpy).not.toHaveBeenCalled()
      expect(button.disabled).toBe(false)
    },
  )

  it("does not assign malformed memory provably owned by another lesson to the selected lesson", async () => {
    const { store, writer } = await setup()
    await writer.appendEnvelope(fact(ROOM, "OWN HEALTHY"))
    await putPhysical(writer, { ...fact(OTHER, "FOREIGN BROKEN"), seq: 2, extra: "invalid" })
    const button = await showMaterials(store)
    await exportMaterials(button)
    expect(screen.queryByRole("alert")).toBeNull()
    expect(savedDownloads).toHaveLength(1)
    expect(await snapshotText(0)).toContain("OWN HEALTHY")
    expect(await snapshotText(0)).not.toContain("FOREIGN")
  })
})
