// @vitest-environment node
// Synthetic inputs through the real recorder and WorkspaceStore; no handcrafted V2 fixtures.
import { describe, expect, it, vi } from "vitest"
import { JournalRecorder } from "../store/JournalRecorder"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { buildRecap } from "../store/lessonRecap"
import { roomPaths } from "../store/roomPaths"
import { PATHS, type WorkspaceDriver } from "../store/types"

const A = "recap-recorder-a"
const B = "recap-recorder-b"
let nextId = 0

function workspace() {
  const data = new Map<string, ArrayBuffer>()
  const driver: WorkspaceDriver = {
    name: "synthetic-memory", available: () => true, init: async () => true,
    read: async (path) => data.has(path) ? new Blob([data.get(path)!]) : null,
    write: async (path, blob) => { data.set(path, await blob.arrayBuffer()) },
    delete: async (path) => { data.delete(path) },
    list: async (prefix) => [...data].filter(([p]) => !prefix || p.startsWith(prefix))
      .map(([path, bytes]) => ({ path, data: new Blob([bytes]), mtime: 0 })),
  }
  const store = new WorkspaceStore()
  Object.assign(store, { driver, fallback: driver })
  return store
}

async function record(store: WorkspaceStore, room: string) {
  let t = 1000
  const recorder = new JournalRecorder({
    store, journalPath: roomPaths(room).journal,
    identity: {
      lessonId: room, sessionId: "11111111-1111-4111-8111-111111111111",
      actor: { type: "teacher", id: "synthetic" },
    },
    producer: { id: "test.local.recap", version: "1.0.0", commitSha: "a".repeat(40) },
    now: () => { const current = t; t += 1000; return current },
    newEventId: () => `00000000-0000-4000-8000-${(++nextId).toString(16).padStart(12, "0")}`,
    withExclusiveLock: async (_name, work) => work(),
  })
  recorder.recordMathInsert(room === A ? "V = R I" : "F = m a")
  recorder.recordChange([{ id: `${room}-shape`, type: room === A ? "rectangle" : "ellipse", version: 1 }])
  // Imported PDF pages are not evidence that those pages were viewed.
  recorder.recordPdfPageView(9, 10, { documentId: "synthetic-pdf" })
  recorder.recordPdfPageObserved(room === A ? 3 : 7, 10, { documentId: "synthetic-pdf" },
    `pdf:synthetic-pdf#page=${room === A ? 3 : 7}`)
  await recorder.flush()
  return (await store.read(roomPaths(room).journal))!.text()
}

describe("recap from actual recorder bytes", () => {
  it("keeps overlapping A/B recordings separate despite an unrelated global journal", async () => {
    const store = workspace()
    await record(store, A)
    await record(store, B)
    await store.write(PATHS.JOURNAL, new Blob([JSON.stringify({ t: 99, type: "math.insert", latex: "FOREIGN FLAT" })]))
    expect(await buildRecap(store, A)).toMatchObject({
      mathFormulas: ["V = R I"], elementTypeCounts: { rectangle: 1 }, totalElementsAdded: 1,
      pdfPagesViewed: [3], firstEventTime: 1000, lastEventTime: 4000, durationMs: 3000,
    })
    expect(await buildRecap(store, B)).toMatchObject({
      mathFormulas: ["F = m a"], elementTypeCounts: { ellipse: 1 }, totalElementsAdded: 1,
      pdfPagesViewed: [7], firstEventTime: 1000, lastEventTime: 4000, durationMs: 3000,
    })
  })

  it("decodes the actual V2 format independently of the path correction", async () => {
    const store = workspace()
    const text = await record(store, A)
    expect(JSON.parse(text.split("\n")[0]!)).toMatchObject({ schemaVersion: 2, lessonId: A })
    // The old parser also sees these exact producer bytes, so the RED is about shape.
    await store.write(PATHS.JOURNAL, new Blob([text]))
    expect((await buildRecap(store, A))?.mathFormulas).toEqual(["V = R I"])
  })

  it("does not read the global journal when the named lesson has no journal", async () => {
    const store = workspace()
    await store.write(PATHS.JOURNAL, new Blob([JSON.stringify({ t: 1000, type: "math.insert", latex: "FOREIGN FLAT" })]))
    const read = vi.spyOn(store, "read")
    expect(await buildRecap(store, A)).toMatchObject({ mathFormulas: [], durationMs: 0, totalElementsAdded: 0 })
    expect(read).not.toHaveBeenCalledWith(PATHS.JOURNAL)
  })

  it("rejects B's valid envelopes misplaced inside A's journal", async () => {
    const store = workspace()
    const foreign = await record(store, B)
    await store.write(roomPaths(A).journal, new Blob([foreign]))
    await expect(buildRecap(store, A)).rejects.toThrow(/lesson\/source mismatch/)
  })

  it("rejects corrupt V2 instead of treating its legacy-looking fields as facts", async () => {
    const store = workspace()
    const text = await record(store, A)
    const bad = { ...JSON.parse(text.split("\n")[0]!), payload: { latex: 42 }, t: 1000, type: "math.insert", latex: "FORGED LEGACY" }
    await store.write(roomPaths(A).journal, new Blob([JSON.stringify(bad)]))
    await expect(buildRecap(store, A)).rejects.toThrow(/line 1/)
  })

  it("rejects truncated V2 JSON without silently omitting the corrupt record", async () => {
    const store = workspace()
    const text = await record(store, A)
    await store.write(roomPaths(A).journal, new Blob([text + '{"schemaVersion":2,"eventId":']))
    await expect(buildRecap(store, A)).rejects.toThrow(/invalid JSON in V2 envelope/)
  })

  it("rejects duplicate physical V2 records rather than inflating the counts", async () => {
    const store = workspace()
    const text = await record(store, A)
    await store.write(roomPaths(A).journal, new Blob([text + text]))
    await expect(buildRecap(store, A)).rejects.toThrow(/duplicate eventId/)
  })

  it("preserves per-room legacy aggregates with missing time alongside V2", async () => {
    const store = workspace()
    const text = await record(store, A)
    const legacy = [
      JSON.stringify({ type: "math.insert", latex: "legacy formula" }),
      JSON.stringify({ t: 500, type: "element.add", element: { id: "old", type: "text" } }),
      JSON.stringify({ t: 800, type: "pdf.page.view", page: 2, totalPages: 10 }),
      "null", "[]", "{malformed legacy",
    ].join("\n")
    await store.write(roomPaths(A).journal, new Blob([legacy + "\n" + text]))
    expect(await buildRecap(store, A)).toMatchObject({
      mathFormulas: ["V = R I", "legacy formula"], elementTypeCounts: { rectangle: 1, text: 1 },
      totalElementsAdded: 2, pdfPagesViewed: [2, 3], firstEventTime: 500, lastEventTime: 4000, durationMs: 3500,
    })
  })
})
