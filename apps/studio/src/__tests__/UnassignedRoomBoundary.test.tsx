// @vitest-environment jsdom
// Il contenitore tecnico di recovery (UNASSIGNED_LESSON_ID) non deve mai
// coincidere con una lezione di prodotto. Proiezione legacy reale,
// IndexedDbEventLog reale, WorkspaceStore reale; soli sintetici.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import { IDBFactory, IDBKeyRange } from "fake-indexeddb"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"
import { UNASSIGNED_LESSON_ID } from "../lessonos/eventlog"
import type { LessonOsEvent } from "../lessonos/eventlog"
import * as eventLogs from "../lessonos/indexedDbEventLog"
import { openLessonOsSession } from "../lessonos/bootstrap"
import { exportLesson } from "../store/lessonBundle"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"

const ROOM_A = "unb-lesson-a"
const ROOM_B = "unb-lesson-b"
const SESSION = "33333333-3333-4333-8333-333333333333"
const producer = { id: "test.unb.boundary", version: "1.0.0", commitSha: "c".repeat(40) }
let nextId = 0
const uuid = () => `00000000-0000-4000-8000-${(++nextId).toString(16).padStart(12, "0")}`

beforeEach(() => {
  vi.stubGlobal("IDBKeyRange", IDBKeyRange)
  vi.stubGlobal("indexedDB", new IDBFactory())
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.history.replaceState(null, "", "/")
})

function workspace(): WorkspaceStore {
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
  Object.assign(store, { driver, fallback: { setLegacyScene: async () => {} } })
  return store
}

async function writeRoomFiles(store: WorkspaceStore, room: string) {
  await store.write(roomPaths(room).scene, new Blob([JSON.stringify({ type: "excalidraw", elements: [] })]))
  // Journal vuoto ma presente: nessun envelope, nessuna identità embedded.
  await store.write(roomPaths(room).journal, new Blob([""]))
  await store.write(roomPaths(room).session, new Blob(["v: 1\ncreated: 0\naudioConsent: false\n"]))
}

/** Fatto non attribuibile: append legacy senza contesto fidato. */
async function seedRecoveryFact(log: eventLogs.IndexedDbEventLog) {
  await log.append({
    kind: "concept.introduced", conceptId: "recovery-fact",
    labels: { it: "Recovery fact" }, t: 1000, evidence: ["board:legacy"],
  } as unknown as LessonOsEvent)
}

async function seedOwnFact(log: eventLogs.IndexedDbEventLog, room: string, label: string) {
  await log.appendEnvelope(createEventEnvelopeV2({ lessonId: room, sessionId: SESSION,
    kind: "concept.introduced", actor: { type: "teacher", id: "synthetic" }, producer,
    causationId: null, idempotencyKey: null,
    evidence: [{ ref: `board:${room}`, resolution: "verified" }],
    payload: { conceptId: label, labels: { it: label } },
  }, { eventId: uuid, now: () => new Date(1000) }))
}

describe("unassigned recovery container vs product lessons", () => {
  it("does not export recovery facts as the memory of a product room named unassigned", async () => {
    const store = workspace()
    await writeRoomFiles(store, UNASSIGNED_LESSON_ID)
    const log = new eventLogs.IndexedDbEventLog()
    await log.open()
    try {
      await seedRecoveryFact(log)
      await expect(exportLesson(store, UNASSIGNED_LESSON_ID, log)).rejects.toThrow(/reserved/i)
    } finally {
      await log.close()
    }
  })

  it("does not open a product session on the reserved name", async () => {
    await expect(openLessonOsSession({ room: UNASSIGNED_LESSON_ID })).rejects.toThrow(/reserved/i)
  })

  it("keeps healthy lessons isolated and usable, legacy bytes preserved", async () => {
    const store = workspace()
    await writeRoomFiles(store, ROOM_A)
    await writeRoomFiles(store, ROOM_B)
    const log = new eventLogs.IndexedDbEventLog()
    await log.open()
    try {
      await seedRecoveryFact(log)
      await seedOwnFact(log, ROOM_A, "OWN A")
      await seedOwnFact(log, ROOM_B, "OWN B")
      const zipA = await JSZip.loadAsync(await exportLesson(store, ROOM_A, log))
      const textA = await zipA.file("raw/lessonos-events.jsonl")?.async("text")
      expect(textA).toContain("OWN A")
      expect(textA).not.toContain("OWN B")
      expect(textA).not.toContain("Recovery fact")
      const zipB = await JSZip.loadAsync(await exportLesson(store, ROOM_B, log))
      const textB = await zipB.file("raw/lessonos-events.jsonl")?.async("text")
      expect(textB).toContain("OWN B")
      expect(textB).not.toContain("Recovery fact")
      // Il materiale non attribuibile resta leggibile allo strato storage.
      const unattributed = await log.readEnvelopesByLesson(UNASSIGNED_LESSON_ID)
      expect(unattributed.length).toBe(1)
      expect(unattributed[0]!.lessonId).toBe(UNASSIGNED_LESSON_ID)
      // …e gli indirizzi storici restano indirizzabili.
      expect(roomPaths(UNASSIGNED_LESSON_ID).journal).toBe("raw/unassigned/events.jsonl")
    } finally {
      await log.close()
    }
  })

  it("keeps legacy import recovery explicit without a silent attribution", async () => {
    const store = workspace()
    await writeRoomFiles(store, ROOM_A)
    const zip = new JSZip()
    zip.file("raw/board.excalidraw", JSON.stringify({ type: "excalidraw", elements: [] }))
    zip.file("raw/events.jsonl", JSON.stringify({ v: 1, rows: [] }) + "\n")
    zip.file("raw/session.yaml", "v: 1\ncreated: 0\naudioConsent: false\n")
    const blob = await zip.generateAsync({ type: "blob" })
    const preview = await store.previewLessonBlobForRoom(blob, ROOM_A)
    expect(preview.identity).toEqual({ kind: "unassigned" })
    const result = await store.importLessonBlobForRoom(blob, ROOM_A, null, { userConfirmed: true })
    expect(result.identity).toEqual({ kind: "claimed", lessonId: ROOM_A })
  })
})
