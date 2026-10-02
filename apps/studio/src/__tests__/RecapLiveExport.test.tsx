// @vitest-environment jsdom
// Actual recorder, IndexedDbEventLog, WorkspaceStore and ZIP exporter; synthetic inputs only.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { IDBDatabase, IDBFactory, IDBKeyRange } from "fake-indexeddb"
import JSZip from "jszip"
import RecapView from "../RecapView"
import SavedLessonsView from "../design/SavedLessonsView"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import * as eventLogs from "../lessonos/indexedDbEventLog"
import { recapRevisionSha256 } from "../lessonos/materialReview"

const ROOM = "r03-selected"
const OTHER = "r03-foreign"
const SESSION = "11111111-1111-4111-8111-111111111111"
const producer = { id: "test.r03.export", version: "1.0.0", commitSha: "a".repeat(40) }
const originalFactory = eventLogs.createEventLogStore
const originalOpen = eventLogs.IndexedDbEventLog.prototype.open
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
  vi.stubGlobal("indexedDB", factory)
  const openSpy = vi.spyOn(eventLogs.IndexedDbEventLog.prototype, "open")
    .mockImplementation(async function (this: eventLogs.IndexedDbEventLog) {
      if (!handles.includes(this)) {
        handles.push(this)
        vi.spyOn(this, "close")
      }
      return originalOpen.call(this)
    })
  const writer = new eventLogs.IndexedDbEventLog({ factory })
  await writer.open()
  return { store, writer, openSpy }
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
  it("refuses to approve a preview superseded by a canonical fact", async () => {
    const {store,writer} = await setup()
    await showRecap(store)
    fireEvent.change(screen.getByLabelText("Nome docente"),{target:{value:"docente"}})
    const approve = screen.getByRole("button",{name:"Approva questa versione"})
    await waitFor(() => expect((approve as HTMLButtonElement).disabled).toBe(false))
    await writer.appendEnvelope(fact(ROOM,"NUOVO CONCETTO DOPO ANTEPRIMA"))
    fireEvent.click(approve)
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Il materiale è cambiato"))
    const events = await writer.readEnvelopesByLesson(ROOM)
    expect(events.some(event => event.kind === "material.reviewed")).toBe(false)
    expect(screen.getByRole("status").textContent).toContain("da revisionare")
  })

  it("records an explicit teacher review for the exact HTML bytes in the exported lesson", async () => {
    const {store,writer} = await setup()
    const view = await showRecap(store)
    expect(screen.getByRole("status").textContent).toContain("da revisionare")
    const approve = screen.getByRole("button",{name:"Approva questa versione"})
    fireEvent.change(screen.getByLabelText("Nome docente"),{target:{value:" Prof. Rossi "}})
    await waitFor(() => expect((approve as HTMLButtonElement).disabled).toBe(false), {timeout:5000})
    fireEvent.click(approve)
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("approvata da Prof. Rossi"))
    const zip = await downloadRecap()
    const events = (await zip.file("raw/lessonos-events.jsonl")!.async("text")).trim().split("\n")
      .map(line => JSON.parse(line) as {kind:string;payload:{revisionSha256?:string;reviewer?:string}})
    const review = events.find(event => event.kind === "material.reviewed")
    expect(review?.payload.reviewer).toBe("Prof. Rossi")
    const count = downloads.length
    fireEvent.click(screen.getByRole("button",{name:"scarica recap"}))
    await waitFor(() => expect(downloads).toHaveLength(count+1))
    expect(await recapRevisionSha256(await downloads[count]!.text())).toBe(review?.payload.revisionSha256)
    view.unmount()
    render(<RecapView store={store} room={ROOM}/>)
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("approvata da Prof. Rossi"))
    await writer.appendEnvelope(fact(ROOM,"CONCETTO INSERITO DOPO APPROVAZIONE"))
    fireEvent.click(screen.getByRole("button",{name:"scarica recap"}))
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("da revisionare"))
    expect((await recapRevisionSha256(await downloads.at(-1)!.text()))).not.toBe(review?.payload.revisionSha256)
  })

  it("prints only the live approved revision with a visible review reference", async () => {
    const {store,writer} = await setup()
    await showRecap(store)
    const reviewed = screen.getByRole("button",{name:"scarica materiale revisionato per PDF"})
    expect((reviewed as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText("Nome docente"),{target:{value:"Prof. Rossi"}})
    const approve = screen.getByRole("button",{name:"Approva questa versione"})
    await waitFor(() => expect((approve as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(approve)
    await waitFor(() => expect((reviewed as HTMLButtonElement).disabled).toBe(false))
    const review = (await writer.readEnvelopesByLesson(ROOM)).find(event => event.kind === "material.reviewed")
    const count = downloads.length
    fireEvent.click(reviewed)
    await waitFor(() => expect(downloads).toHaveLength(count+1))
    const printed = await downloads[count]!.text()
    expect(printed).toContain("Revisione docente registrata")
    expect(printed).toContain("Prof. Rossi")
    expect(printed).toContain(review?.payload.revisionSha256)
    expect(printed).toContain("window.print()")
    await writer.appendEnvelope(fact(ROOM,"MODIFICA DOPO APPROVAZIONE"))
    fireEvent.click(reviewed)
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Il materiale è cambiato"))
    expect(downloads).toHaveLength(count+1)
    await waitFor(() => expect((reviewed as HTMLButtonElement).disabled).toBe(true))
  })

  it("keeps a flag visible and records rejection on the exact reviewed revision", async () => {
    const {store,writer} = await setup()
    await showRecap(store)
    fireEvent.change(screen.getByLabelText("Nome docente"),{target:{value:"Prof. Rossi"}})
    const flag = screen.getByRole("button",{name:"Segnala un problema"})
    await waitFor(() => expect((flag as HTMLButtonElement).disabled).toBe(false))
    fireEvent.change(screen.getByLabelText("Nota di revisione"),{target:{value:"Controllare il verso del ramo"}})
    fireEvent.click(flag)
    await waitFor(() => expect(screen.getByText(/Problema segnalato/)).toBeTruthy())
    fireEvent.click(screen.getByRole("button",{name:"Approva questa versione"}))
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("approvata da Prof. Rossi"))
    expect((screen.getByRole("button",{name:"scarica materiale revisionato per PDF"}) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole("button",{name:"Rifiuta questa versione"}))
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("da revisionare"))
    const events = await writer.readEnvelopesByLesson(ROOM)
    expect(events.filter(event => event.kind === "material.reviewed").map(event => event.payload.action))
      .toEqual(["flag","approve","reject"])
    expect(new Set(events.filter(event => event.kind === "material.reviewed")
      .map(event => event.payload.revisionSha256)).size).toBe(1)
  })

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
    const { store, writer } = await setup()
    await writer.appendEnvelope(fact(ROOM, "OWN RETRY"))
    const view = await showRecap(store)
    vi.spyOn(eventLogs.IndexedDbEventLog.prototype, "readEnvelopesByLesson")
      .mockRejectedValueOnce(new Error("live read rejected"))
    fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
    expect((await screen.findByRole("alert")).textContent).toContain("live read rejected")
    expect(downloads).toHaveLength(0)
    expect(handles[2]!.close).toHaveBeenCalledOnce()
    expect(view.container.querySelector("iframe")).not.toBeNull()
    expect((screen.getByRole("button", { name: "esporta .lesson" }) as HTMLButtonElement).disabled).toBe(false)
    const zip = await downloadRecap()
    expect(await zip.file("raw/lessonos-events.jsonl")?.async("text")).toContain("OWN RETRY")
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("fails visibly and closes the handle when persistent log opening rejects", async () => {
    const { store, openSpy } = await setup()
    await showRecap(store)
    const exportSpy = vi.spyOn(store, "exportLesson")
    const closeSpy = vi.spyOn(eventLogs.IndexedDbEventLog.prototype, "close")
    openSpy.mockRejectedValueOnce(new Error("log acquisition rejected"))
    fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
    expect((await screen.findByRole("alert")).textContent).toContain("log acquisition rejected")
    expect(downloads).toHaveLength(0)
    expect(exportSpy).not.toHaveBeenCalled()
    expect(closeSpy).toHaveBeenCalledOnce()
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
  it.each(["missing", "throwing", "request-error"] as const)(
    "blocks an unavailable persistent backend (%s), preserves the recap and permits a real retry",
    async (failure) => {
      const { store, writer } = await setup()
      const view = await showRecap(store)
      const savedSnapshot = await (await store.read(roomPaths(ROOM).lessonOsSnapshot))!.text()
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
      fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
      await waitFor(() => expect(screen.queryByRole("alert") !== null || downloads.length > 0).toBe(true))
      expect(screen.queryByRole("alert")).not.toBeNull()
      expect(downloads).toHaveLength(0)
      expect(exportSpy).not.toHaveBeenCalled()
      expect(view.container.querySelector("iframe")).not.toBeNull()
      expect((screen.getByRole("button", { name: "esporta .lesson" }) as HTMLButtonElement).disabled).toBe(false)
      expect(await (await store.read(roomPaths(ROOM).lessonOsSnapshot))!.text()).toBe(savedSnapshot)
      // Restore a real persistent database and verify that retry exports current facts.
      const recovered = new IDBFactory()
      vi.stubGlobal("indexedDB", recovered)
      const restoredWriter = new eventLogs.IndexedDbEventLog({ factory: recovered })
      await restoredWriter.open()
      await restoredWriter.appendEnvelope(fact(ROOM, "RECOVERED CURRENT"))
      await writer.close()
      const zip = await downloadRecap()
      expect(await zip.file("raw/lessonos-events.jsonl")?.async("text")).toContain("RECOVERED CURRENT")
      expect(screen.queryByRole("alert")).toBeNull()
    },
  )

  it("closes a partially opened database on acquisition failure and allows retry", async () => {
    const { store, writer } = await setup()
    await writer.appendEnvelope(fact(ROOM, "AFTER OPEN RETRY"))
    await showRecap(store)
    const nativeClose = vi.spyOn(IDBDatabase.prototype, "close")
    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementationOnce(() => {
      throw new DOMException("cannot inspect opened database", "UnknownError")
    })
    const exportSpy = vi.spyOn(store, "exportLesson")
    fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
    expect((await screen.findByRole("alert")).textContent).toContain("cannot inspect opened database")
    expect(downloads).toHaveLength(0)
    expect(exportSpy).not.toHaveBeenCalled()
    expect(handles[2]!.close).toHaveBeenCalledOnce()
    expect(nativeClose).toHaveBeenCalledOnce()
    const zip = await downloadRecap()
    expect(await zip.file("raw/lessonos-events.jsonl")?.async("text")).toContain("AFTER OPEN RETRY")
    expect(screen.queryByRole("alert")).toBeNull()
  })

})
