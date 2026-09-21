// @vitest-environment jsdom
// Independent R-03b probe: a real IDB transaction fails only after open succeeds.
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { IDBDatabase, IDBFactory, IDBKeyRange } from "fake-indexeddb"
import JSZip from "jszip"
import RecapView from "../RecapView"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import { IndexedDbEventLog } from "../lessonos/indexedDbEventLog"

const ROOM = "r03b-independent"
const SESSION = "22222222-2222-4222-8222-222222222222"
const producer = { id: "test.r03b.independent", version: "1.0.0", commitSha: "b".repeat(40) }
const fact = createEventEnvelopeV2({
  lessonId: ROOM, sessionId: SESSION, kind: "concept.introduced",
  actor: { type: "teacher", id: "synthetic" }, producer, causationId: null, idempotencyKey: null,
  evidence: [{ ref: "board:r03b-independent", resolution: "verified" }],
  payload: { conceptId: "post-open-current", labels: { it: "POST OPEN CURRENT" } },
}, { eventId: () => "00000000-0000-4000-8000-000000000002", now: () => new Date(1000) })

let downloads: Blob[] = []

beforeEach(() => {
  downloads = []
  vi.stubGlobal("IDBKeyRange", IDBKeyRange)
  vi.stubGlobal("URL", Object.assign(class extends URL {}, {
    createObjectURL: (blob: Blob) => { downloads.push(blob); return "blob:r03b-independent" },
    revokeObjectURL: () => {},
  }))
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it("closes a newly opened persistent handle after a real export-read transaction failure, then retries current facts", async () => {
  const bytes = new Map<string, ArrayBuffer>()
  const driver: WorkspaceDriver = {
    name: "independent-memory", available: () => true, init: async () => true,
    read: async (path) => bytes.has(path) ? new Blob([bytes.get(path)!]) : null,
    write: async (path, blob) => { bytes.set(path, await blob.arrayBuffer()) },
    delete: async (path) => { bytes.delete(path) },
    list: async (prefix) => [...bytes].filter(([path]) => !prefix || path.startsWith(prefix))
      .map(([path, data]) => ({ path, data: new Blob([data]), mtime: 0 })),
  }
  const store = new WorkspaceStore()
  Object.assign(store, { driver, fallback: driver })
  vi.spyOn(store, "init").mockResolvedValue("localStorage")
  const recorder = new JournalRecorder({
    store, journalPath: roomPaths(ROOM).journal,
    identity: { lessonId: ROOM, sessionId: SESSION, actor: { type: "teacher", id: "synthetic" } },
    producer, now: () => 1000, newEventId: () => "00000000-0000-4000-8000-000000000003",
    withExclusiveLock: async (_name, work) => work(),
  })
  recorder.recordMathInsert("V = R I")
  await recorder.flush()
  await store.write(roomPaths(ROOM).scene, new Blob([JSON.stringify({ type: "excalidraw", elements: [] })]))

  const factory = new IDBFactory()
  vi.stubGlobal("indexedDB", factory)
  const writer = new IndexedDbEventLog({ factory })
  await writer.open()
  await writer.appendEnvelope(fact)
  const view = render(<RecapView store={store} room={ROOM} />)
  await waitFor(() => expect(view.container.querySelector("iframe")).not.toBeNull())
  // Let the independent, fail-soft digest read release its own handle before
  // instrumenting the export click's newly created handle.
  await new Promise((resolve) => setTimeout(resolve, 0))

  const originalTransaction = IDBDatabase.prototype.transaction
  const originalOpen = IndexedDbEventLog.prototype.open
  const opened: IndexedDbEventLog[] = []
  const openSpy = vi.spyOn(IndexedDbEventLog.prototype, "open").mockImplementation(async function (this: IndexedDbEventLog) {
    opened.push(this)
    return originalOpen.call(this)
  })
  let transactions = 0
  const transactionSpy = vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(function (...args) {
    transactions += 1
    if (transactions === 2) throw new DOMException("export-read transaction rejected", "UnknownError")
    return originalTransaction.apply(this, args)
  })
  const closeSpy = vi.spyOn(IndexedDbEventLog.prototype, "close")
  const closesBefore = closeSpy.mock.instances.length
  const exportSpy = vi.spyOn(store, "exportLesson")
  fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
  expect((await screen.findByRole("alert")).textContent).toContain("export-read transaction rejected")
  expect(transactions).toBe(2)
  expect(downloads).toHaveLength(0)
  expect(openSpy).toHaveBeenCalledOnce()
  expect(closeSpy.mock.instances.slice(closesBefore)).toContain(opened[0])
  expect((screen.getByRole("button", { name: "esporta .lesson" }) as HTMLButtonElement).disabled).toBe(false)

  transactionSpy.mockRestore()
  fireEvent.click(screen.getByRole("button", { name: "esporta .lesson" }))
  await waitFor(() => expect(downloads).toHaveLength(1))
  const zip = await JSZip.loadAsync(downloads[0]!)
  expect(await zip.file("raw/lessonos-events.jsonl")?.async("text")).toContain("POST OPEN CURRENT")
  expect(exportSpy).toHaveBeenCalledTimes(2)
  await writer.close()
})
