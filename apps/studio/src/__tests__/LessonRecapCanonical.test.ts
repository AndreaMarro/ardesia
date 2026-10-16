// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { JournalRecorder } from "../store/JournalRecorder"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { buildRecap } from "../store/lessonRecap"
import { buildRecapHtml } from "../store/recapHtml"
import { roomPaths } from "../store/roomPaths"
import { PATHS, type WorkspaceDriver } from "../store/types"

const ROOM = "recap-synthetic"
const SESSION = "77777777-7777-4777-8777-777777777777"
const producer = { id: "test.material.source", version: "1.0.0", commitSha: "f".repeat(40) }
function setup() {
  const bytes = new Map<string, ArrayBuffer>()
  const driver: WorkspaceDriver = {
    name: "synthetic-memory", available: () => true, init: async () => true,
    read: async path => bytes.has(path) ? new Blob([bytes.get(path)!]) : null,
    write: async (path, blob) => { bytes.set(path, await blob.arrayBuffer()) },
    delete: async path => { bytes.delete(path) },
    list: async prefix => [...bytes].filter(([p]) => !prefix || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data: new Blob([data]), mtime: 0 })),
  }
  const store = new WorkspaceStore(); Object.assign(store, { driver })
  let n = 0
  const recorder = new JournalRecorder({ store, journalPath: roomPaths(ROOM).journal,
    identity: { lessonId: ROOM, sessionId: SESSION, actor: { type: "teacher", id: "synthetic" } },
    producer, now: () => 1000 + n, newEventId: () => `88888888-8888-4888-8888-${(++n).toString(16).padStart(12, "0")}`,
    withExclusiveLock: async (_name, work) => work() })
  return { store, recorder }
}
const flatFormula = new Blob([JSON.stringify({ t: 1, type: "math.insert", latex: "FOREIGN FLAT" })])

describe("canonical recap source", () => {
  it("reads the selected room journal without mixing a foreign flat journal", async () => {
    const { store, recorder } = setup()
    recorder.recordMathInsert("V = R I"); await recorder.flush()
    await store.write(PATHS.JOURNAL, flatFormula)
    const recap = await buildRecap(store, ROOM)
    expect(recap!.mathFormulas).toEqual(["V = R I"])
  })

  it("a present empty room journal cannot resurrect flat legacy content", async () => {
    const { store } = setup()
    await store.write(roomPaths(ROOM).journal, new Blob([]))
    await store.write(PATHS.JOURNAL, flatFormula)
    expect((await buildRecap(store, ROOM))!.mathFormulas).toEqual([])
  })

  it("a malformed canonical journal is visible instead of a successful partial recap", async () => {
    const { store, recorder } = setup()
    recorder.recordMathInsert("V = R I"); await recorder.flush()
    const text = await (await store.read(roomPaths(ROOM).journal))!.text()
    await store.write(roomPaths(ROOM).journal, new Blob([text, '{"schemaVersion":2,broken}\n']))
    await store.write(PATHS.JOURNAL, flatFormula)
    await expect(buildRecap(store, ROOM)).rejects.toThrow(/line|JSON|journal/i)
  })

  it("a foreign canonical identity in the selected path cannot be projected", async () => {
    const { store, recorder } = setup()
    recorder.recordMathInsert("V = R I"); await recorder.flush()
    const row = JSON.parse((await (await store.read(roomPaths(ROOM).journal))!.text()).trim())
    row.lessonId = "foreign-room"
    await store.write(roomPaths(ROOM).journal, new Blob([JSON.stringify(row)]))
    await expect(buildRecap(store, ROOM)).rejects.toThrow(/lesson|source|mismatch/i)
  })

  it("keeps an imported PDF distinct from an observed page with its actual document and evidence", async () => {
    const { store, recorder } = setup()
    recorder.recordPdfPageView(2, 20, { documentId: "doc:synthetic", documentName: "Appunti sintetici.pdf" })
    recorder.recordPdfPageObserved(3, 20, { documentId: "doc:synthetic", documentName: "Appunti sintetici.pdf" }, "pdf:doc%3Asynthetic#page=3")
    await recorder.flush()
    const recap = (await buildRecap(store, ROOM))!
    expect(recap.pdfPagesViewed).toEqual([3])
    expect(recap.pdfReferences).toEqual([
      { documentId: "doc:synthetic", documentName: "Appunti sintetici.pdf", page: 2, status: "imported", evidence: [{ ref: "pdf:doc%3Asynthetic#page=2", resolution: "missing" }] },
      { documentId: "doc:synthetic", documentName: "Appunti sintetici.pdf", page: 3, status: "observed", evidence: [{ ref: "pdf:doc%3Asynthetic#page=3", resolution: "verified" }] },
    ])
    const html = buildRecapHtml(recap)
    expect(html).toContain("Appunti sintetici.pdf")
    expect(html).toContain("importata")
    expect(html).toContain("osservata")
    expect(html).toContain("pdf:doc%3Asynthetic#page=3")
    expect(html).not.toContain("Le fonti citano le pagine reali del manuale mostrate")
  })

  it("includes the final board question, keeping its identity/evidence and escaping HTML", async () => {
    const { store, recorder } = setup()
    recorder.recordChange([{ id: "question", type: "text", text: "Domanda precedente", version: 1 }])
    recorder.recordChange([{ id: "question", type: "text", text: "Quanto vale I < 2?", version: 2 }])
    recorder.recordChange([
      { id: "question", type: "text", text: "Quanto vale I < 2?", version: 2 },
      { id: "deleted", type: "text", text: "Testo cancellato", version: 1 },
    ])
    recorder.recordChange([{ id: "question", type: "text", text: "Quanto vale I < 2?", version: 2 }])
    await recorder.flush()
    const recap = (await buildRecap(store, ROOM))!
    expect(recap.boardTexts).toEqual([{ elementId: "question", text: "Quanto vale I < 2?", evidence: [{ ref: "board:question", resolution: "verified" }] }])
    const html = buildRecapHtml(recap)
    expect(html).toContain("Quanto vale I &lt; 2?")
    expect(html).toContain("board:question")
    expect(html).not.toContain("Domanda precedente")
    expect(html).not.toContain("Testo cancellato")
  })
})
