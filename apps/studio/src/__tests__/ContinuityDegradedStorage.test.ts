// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { IDBFactory as FakeFactory, IDBKeyRange as FakeKeyRange } from "fake-indexeddb"
import { IndexedDbEventLog, openIndexedDbEventLog } from "../lessonos/indexedDbEventLog"
import { readResumableSessions } from "../lessonos/continuitySurface"
import { projectContinuityV1, type ContinuityScopeV1 } from "../lessonos/continuityProjection"
import { createImportedBundleContinuityWorkspaceReader, loadScopedContinuitySnapshot,
  openIndexedDbContinuityEventReader } from "../lessonos/continuityRuntime"

const LESSON = "wbstudio-degraded"
const OTHER = "wbstudio-other"
const SESSION = "11111111-1111-4111-8111-111111111111"
const OTHER_SESSION = "22222222-2222-4222-8222-222222222222"

function canonical(seq: number, lessonId = LESSON, sessionId = SESSION) {
  return {
    seq, schemaVersion: 2, eventId: `70000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    lessonId, sessionId, kind: "lesson.started", occurredAt: "2026-10-15T00:00:00.000Z",
    actor: { type: "teacher", id: "synthetic-teacher" },
    producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.0.0", commitSha: "a".repeat(40) },
    causationId: null, idempotencyKey: `degraded:${seq}`,
    evidence: [{ ref: `lesson:${lessonId}@${seq}`, resolution: "verified" }], payload: { room: lessonId },
  }
}

/** Schema reale del log, righe fisiche sintetiche: nessun mock del descrittore. */
async function physicalLog(rows: readonly Record<string, unknown>[]) {
  Object.defineProperty(globalThis, "IDBKeyRange", { configurable: true, value: FakeKeyRange })
  const factory = new FakeFactory() as unknown as IDBFactory
  const dbName = "degraded-test"
  const setup = new IndexedDbEventLog({ factory, dbName })
  await setup.open()
  await setup.close()
  async function database() {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open(dbName)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  const db = await database()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("lessonos_events", "readwrite")
      for (const row of rows) tx.objectStore("lessonos_events").put(row)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally { db.close() }
  return {
    eventReader: (scope?: ContinuityScopeV1) => openIndexedDbContinuityEventReader({ factory, dbName }, scope),
    async open() {
      const handle = await openIndexedDbEventLog({ factory, dbName })
      return { ...handle, close: vi.fn(() => handle.close()) }
    },
    async rows() {
      const db = await database()
      try {
        return await new Promise<unknown[]>((resolve, reject) => {
          const request = db.transaction("lessonos_events", "readonly").objectStore("lessonos_events").getAll()
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
      } finally { db.close() }
    },
  }
}

describe("Continuità: un archivio degradato non è una lezione vuota", () => {
  it("controllo sano realmente vuoto: no-sessions, handle chiuso", async () => {
    const store = await physicalLog([])
    const handle = await store.open()
    expect(handle.backend.kind).toBe("verified-indexeddb")
    expect(await readResumableSessions(LESSON, async () => handle)).toEqual({ kind: "no-sessions", lessonId: LESSON })
    expect(handle.close).toHaveBeenCalledTimes(1)
  })

  it("riga malformata non indicizzata: partial vuoto, mai no-sessions", async () => {
    const rows = [{ seq: 1, schemaVersion: 2, payload: { synthetic: true } }]
    const store = await physicalLog(rows)
    const handle = await store.open()
    expect(handle.backend.kind).toBe("data-loss")
    expect(await readResumableSessions(LESSON, async () => handle)).toEqual({
      kind: "storage-degraded", lessonId: LESSON, backend: handle.backend,
      discovery: { kind: "partial", sessionIds: [] },
    })
    expect(handle.close).toHaveBeenCalledTimes(1)
    expect(await store.rows()).toEqual(rows)
  })

  it("conserva il candidato utile e lo scope, senza affermare elenco completo", async () => {
    const rows = [canonical(1), { seq: 2, schemaVersion: 2 }, canonical(3, OTHER, OTHER_SESSION)]
    const store = await physicalLog(rows)
    const handle = await store.open()
    expect(await readResumableSessions(LESSON, async () => handle)).toEqual({
      kind: "storage-degraded", lessonId: LESSON, backend: handle.backend,
      discovery: { kind: "partial", sessionIds: [SESSION] },
    })
    expect(handle.close).toHaveBeenCalledTimes(1)
    expect(await store.rows()).toEqual(rows)
  })

  it("il candidato utile conserva l'evento canonico nel loader e resta degraded con build coerente", async () => {
    const rows = [canonical(1), { seq: 2, schemaVersion: 2 }]
    const store = await physicalLog(rows)
    const loaded = await loadScopedContinuitySnapshot({ lessonId: LESSON, roomId: LESSON, sessionId: SESSION }, {
      createEventReader: store.eventReader,
      createWorkspaceReader: async () => createImportedBundleContinuityWorkspaceReader(new Map()),
      buildCommitSha: "a".repeat(40),
    })
    expect(loaded.kind).toBe("loaded")
    if (loaded.kind !== "loaded") throw new Error("expected loaded snapshot")
    expect(loaded.snapshot.lessonEvents).toEqual([rows[0]])
    expect(loaded.snapshot.issues).toContainEqual(expect.objectContaining({ source: "lesson-event-log", code: "data-loss" }))
    expect(loaded.snapshot.issues.some(issue => issue.code === "digest-mismatch")).toBe(false)
    expect(projectContinuityV1(loaded.snapshot).phase).toBe("degraded")
    expect(await store.rows()).toEqual(rows)
  })

  it("chiavi non valide escluse; UUID valido resta candidato anche con byte malformati", async () => {
    const rows = [
      { seq: 1, schemaVersion: 2, lessonId: LESSON, sessionId: 7 },
      { seq: 2, schemaVersion: 2, lessonId: LESSON, sessionId: "not-a-uuid" },
      { seq: 3, schemaVersion: 2, lessonId: LESSON, sessionId: SESSION },
    ]
    const store = await physicalLog(rows)
    const handle = await store.open()
    expect(await readResumableSessions(LESSON, async () => handle)).toEqual({
      kind: "storage-degraded", lessonId: LESSON, backend: handle.backend,
      discovery: { kind: "partial", sessionIds: [SESSION] },
    })
    expect(handle.close).toHaveBeenCalledTimes(1)
    expect(await store.rows()).toEqual(rows)
  })

  it("sequenza corrotta: blocked prima di enumerare, sorgente conservata", async () => {
    const rows = [canonical(1), canonical(3)]
    const store = await physicalLog(rows)
    const handle = await store.open()
    expect(handle.backend.kind).toBe("corrupt")
    const list = vi.spyOn(handle.log!, "listSessionIds")
    expect(await readResumableSessions(LESSON, async () => handle)).toEqual({
      kind: "storage-degraded", lessonId: LESSON, backend: handle.backend, discovery: { kind: "blocked" },
    })
    expect(list).not.toHaveBeenCalled()
    expect(handle.close).toHaveBeenCalledTimes(1)
    const loaded = await loadScopedContinuitySnapshot({ lessonId: LESSON, roomId: LESSON, sessionId: SESSION }, {
      createEventReader: store.eventReader,
      createWorkspaceReader: async () => createImportedBundleContinuityWorkspaceReader(new Map()),
      buildCommitSha: "a".repeat(40),
    })
    expect(loaded.kind).toBe("loaded")
    if (loaded.kind !== "loaded") throw new Error("expected loaded snapshot")
    expect(loaded.snapshot.lessonEvents).toEqual([])
    expect(projectContinuityV1(loaded.snapshot).phase).toBe("corrupt")
    expect(await store.rows()).toEqual(rows)
  })

  it("lettura degradata fallita: conserva causa e descrittore distinti", async () => {
    const rows = [{ seq: 1, schemaVersion: 2 }]
    const store = await physicalLog(rows)
    const handle = await store.open()
    vi.spyOn(handle.log!, "listSessionIds").mockRejectedValueOnce(new Error("cursore non leggibile"))
    expect(await readResumableSessions(LESSON, async () => handle)).toEqual({
      kind: "storage-degraded", lessonId: LESSON, backend: handle.backend,
      discovery: { kind: "unreadable", code: "cursore non leggibile" },
    })
    expect(handle.close).toHaveBeenCalledTimes(1)
    expect(await store.rows()).toEqual(rows)
  })
})
