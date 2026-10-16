// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { createHash } from "node:crypto"
import JSZip from "jszip"
import { IDBFactory } from "fake-indexeddb"
import { captureClosedLessonMaterial } from "../store/lessonMaterial"
import { IndexedDbEventLog } from "../lessonos/indexedDbEventLog"
import { openLessonOsSession } from "../lessonos/bootstrap"
import { JournalRecorder } from "../store/JournalRecorder"
import { captureLessonRevisionEvidence } from "../store/lessonRevision"
import { createLessonMutationCoordinator } from "../store/lessonMutationLock"
import { roomPaths } from "../store/roomPaths"
import { captureBroker, closedLessonFixture, memoryLessonWorkspace, MATERIAL_QUESTION, MATERIAL_ROOM, MATERIAL_SESSION } from "./closedLessonFixture"

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
const hash = async (blob: Blob) => createHash("sha256").update(new Uint8Array(await blob.arrayBuffer())).digest("hex")

describe("one closed material capture", () => {
  it("builds the human document and portable bundle from the same captured data and watermark", async () => {
    const { store } = await closedLessonFixture()
    const material = await captureClosedLessonMaterial(store, MATERIAL_ROOM)
    expect(material.html).toContain(MATERIAL_QUESTION)
    expect(material.html).toContain("Legge di Ohm")
    expect(material.html).toContain("Corrente in serie")
    expect(material.html).toContain("4 mA")
    expect(material.revision.bundleSha256).toBe(await hash(material.bundle))
    expect(material.html).toContain(material.revision.bundleSha256)
    expect(material.revision.sessions).toEqual([expect.objectContaining({ sessionId: MATERIAL_SESSION, endSeq: expect.any(Number) })])
    const zip = await JSZip.loadAsync(material.bundle)
    expect(await zip.file("raw/events.jsonl")!.async("text")).toContain(MATERIAL_QUESTION)
    const canonical = (await zip.file("raw/lessonos-events.jsonl")!.async("text")).trim().split("\n").map(line => JSON.parse(line))
    expect(canonical.at(-1).eventId).toBe(material.revision.sessions[0]!.endEventId)
    expect(canonical.at(-1).seq).toBe(material.revision.sessions[0]!.endSeq)
  })

  it("keeps the captured document and bundle unchanged after later workspace changes", async () => {
    const { store } = await closedLessonFixture()
    const material = await captureClosedLessonMaterial(store, MATERIAL_ROOM)
    const before = await hash(material.bundle)
    await store.write(roomPaths(MATERIAL_ROOM).journal, new Blob(["LATER INVALID JOURNAL"]))
    await store.saveMeta(MATERIAL_ROOM, { v: 1, name: "LATER TITLE", createdAt: 2000 })
    expect(await hash(material.bundle)).toBe(before)
    expect(material.html).toContain("Lezione sintetica DC")
    expect(material.html).not.toContain("LATER TITLE")
    expect(await (await JSZip.loadAsync(material.bundle)).file("raw/events.jsonl")!.async("text")).not.toContain("LATER")
  })

  it("reads each workspace artifact only once, without a second live digest/export read", async () => {
    const { store } = await closedLessonFixture()
    const read = vi.spyOn(store, "read")
    const canonical = vi.spyOn(IndexedDbEventLog.prototype, "readEnvelopesByLesson")
    await captureClosedLessonMaterial(store, MATERIAL_ROOM)
    for (const path of Object.values(roomPaths(MATERIAL_ROOM)).filter(path => !path.endsWith("/"))) {
      expect(read.mock.calls.filter(call => call[0] === path).length).toBeLessThanOrEqual(1)
    }
    expect(canonical).toHaveBeenCalledOnce()
  })

  it("refuses unavailable memory and verified-empty current memory instead of reusing stored events", async () => {
    const { store } = await closedLessonFixture()
    await store.write(roomPaths(MATERIAL_ROOM).lessonOsSnapshot, new Blob(["OLD STORED"]))
    vi.stubGlobal("indexedDB", undefined)
    await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow()
    vi.stubGlobal("indexedDB", new IDBFactory())
    await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow(/memoria|mancante/i)
    expect(await (await store.read(roomPaths(MATERIAL_ROOM).lessonOsSnapshot))!.text()).toBe("OLD STORED")
  })

  it("closes the fresh persistent reader even when the canonical query rejects", async () => {
    const { store } = await closedLessonFixture()
    const close = vi.spyOn(IndexedDbEventLog.prototype, "close")
    vi.spyOn(IndexedDbEventLog.prototype, "readEnvelopesByLesson").mockRejectedValueOnce(new Error("synthetic canonical read failure"))
    await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow("synthetic canonical read failure")
    expect(close).toHaveBeenCalledOnce()
  })

  it.each(["active", "local-only", "invalid-room"] as const)("fails before acquiring event/workspace data (%s)", async reason => {
    const coordinator = createLessonMutationCoordinator(captureBroker(reason === "active", reason === "local-only"))
    // Arrange the valid source using a separate fixture coordinator.
    const { factory } = await closedLessonFixture()
    const store = memoryLessonWorkspace(coordinator)
    const open = vi.spyOn(factory, "open"); const read = vi.spyOn(store, "read")
    await expect(captureClosedLessonMaterial(store, reason === "invalid-room" ? "../foreign" : MATERIAL_ROOM)).rejects.toThrow()
    expect(open).not.toHaveBeenCalled(); expect(read).not.toHaveBeenCalled()
  })

  it.each(["missing", "corrupt", "legacy", "orphan-session"] as const)("refuses an incomplete journal (%s)", async reason => {
    const { store } = await closedLessonFixture(); const path = roomPaths(MATERIAL_ROOM).journal
    if (reason === "missing") await store.delete(path)
    if (reason === "corrupt") await store.write(path, new Blob(['{"schemaVersion":2,broken}\n']))
    if (reason === "legacy") await store.write(path, new Blob([JSON.stringify({ t: 1, type: "math.insert", latex: "legacy" })]))
    if (reason === "orphan-session") {
      const rows = (await (await store.read(path))!.text()).trim().split("\n").map(line => JSON.parse(line))
      rows[0].sessionId = "22222222-2222-4222-8222-222222222222"
      await store.write(path, new Blob([rows.map(row => JSON.stringify(row)).join("\n")]))
    }
    await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow()
  })

  it("does not silently omit a question present only in the scene", async () => {
    const { store } = await closedLessonFixture()
    await store.write(roomPaths(MATERIAL_ROOM).scene, new Blob([JSON.stringify({ type: "excalidraw", elements: [{ id: "other", type: "text", text: "SCENE ONLY" }] })]))
    await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow(/lavagna|journal|coeren|revisione/i)
  })

  it("rejects a matching journal and scene changed after the canonical end", async () => {
    const { store } = await closedLessonFixture(); const paths = roomPaths(MATERIAL_ROOM)
    const journal = (await (await store.read(paths.journal))!.text()).replaceAll(MATERIAL_QUESTION, "DOMANDA CAMBIATA DOPO LA FINE")
    const scene = (await (await store.read(paths.scene))!.text()).replaceAll(MATERIAL_QUESTION, "DOMANDA CAMBIATA DOPO LA FINE")
    await store.write(paths.journal, new Blob([journal])); await store.write(paths.scene, new Blob([scene]))
    await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow(/revisione|ricevuta/i)
  })

  it("rejects a title changed after the canonical end", async () => {
    const { store } = await closedLessonFixture()
    await store.saveMeta(MATERIAL_ROOM, { v: 1, name: "TITOLO SUCCESSIVO ALLA FINE", createdAt: 2000 })
    await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow(/revisione|ricevuta/i)
  })

  it("preserves the lesson title when the captured bundle is reopened by a fresh recipient", async () => {
    const { store } = await closedLessonFixture()
    const material = await captureClosedLessonMaterial(store, MATERIAL_ROOM)
    const recipient = memoryLessonWorkspace(createLessonMutationCoordinator(captureBroker()))
    const factory = new IDBFactory(); vi.stubGlobal("indexedDB", factory)
    const log = new IndexedDbEventLog({ factory }); await log.open()
    try {
      const result = await recipient.importLessonBlobForRoom(material.bundle, MATERIAL_ROOM, log)
      expect(result.lessonOsRestore.kind).toBe("restored")
      expect((await recipient.loadMeta(MATERIAL_ROOM))?.name).toBe("Lezione sintetica DC")
      const reopened = await captureClosedLessonMaterial(recipient, MATERIAL_ROOM)
      expect(reopened.html).toContain(MATERIAL_QUESTION)
      expect(reopened.revision.sessions).toEqual(material.revision.sessions)
    } finally { await log.close() }
  })

  it.each(["Zeta", "Z", "Teacher-Lesson", "zeta"])("reopens its own bundle for the valid lesson ID %s", async room => {
    const { store } = await closedLessonFixture(undefined, room)
    const material = await captureClosedLessonMaterial(store, room)
    const recipient = memoryLessonWorkspace(createLessonMutationCoordinator(captureBroker()))
    const factory = new IDBFactory(); vi.stubGlobal("indexedDB", factory)
    const log = new IndexedDbEventLog({ factory }); await log.open()
    try {
      await recipient.importLessonBlobForRoom(material.bundle, room, log)
      expect((await recipient.loadMeta(room))?.name).toBe("Lezione sintetica DC")
      expect((await captureClosedLessonMaterial(recipient, room)).html).toContain(MATERIAL_QUESTION)
    } finally { await log.close() }
  })

  it.each(["A-after-end", "B-before-end"] as const)("checks the journal against its own author's end (%s)", async source => {
    const { store, factory, recorder: recorderA } = await closedLessonFixture()
    let id = 0
    const uuid = () => `eeeeeeee-eeee-4eee-8eee-${(++id).toString(16).padStart(12, "0")}`
    const b = await openLessonOsSession({ room: MATERIAL_ROOM, actor: { type: "teacher", id: "synthetic-B" },
      newSessionId: () => "22222222-2222-4222-8222-222222222222", newEventId: uuid, now: () => 1000,
      env: { indexedDB: factory, storage: undefined, markerStorage: undefined } })
    const recorderB = new JournalRecorder({ store, journalPath: roomPaths(MATERIAL_ROOM).journal,
      identity: b.identity, producer: b.producer, newEventId: uuid, now: () => 1000,
      withExclusiveLock: async (_name, work) => work() })
    const active = source === "A-after-end" ? recorderA : recorderB
    active.recordMathInsert("LATE_SUFFIX_AT_SAME_CLOCK")
    await b.close({ beforeEnd: async () => { await active.flush(); return captureLessonRevisionEvidence(store, MATERIAL_ROOM) } })
    if (source === "A-after-end") {
      await expect(captureClosedLessonMaterial(store, MATERIAL_ROOM)).rejects.toThrow(/sessione|chiusura/)
    } else {
      const material = await captureClosedLessonMaterial(store, MATERIAL_ROOM)
      expect(material.recap.mathFormulas).toContain("LATE_SUFFIX_AT_SAME_CLOCK")
      expect(material.revision.sessions).toHaveLength(2)
    }
  })
})
