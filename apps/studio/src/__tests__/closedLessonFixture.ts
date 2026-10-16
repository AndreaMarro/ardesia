// Synthetic unit fixture. Tab scheduling is tested with the existing
// adversarial broker and, separately, real browser Web Locks.
import { vi } from "vitest"
import { IDBFactory, IDBKeyRange } from "fake-indexeddb"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { roomPaths } from "../store/roomPaths"
import { openLessonOsSession } from "../lessonos/bootstrap"
import { createLessonMutationCoordinator, type LessonMutationCoordinator, type MutationLockBroker } from "../store/lessonMutationLock"
import type { WorkspaceDriver } from "../store/types"
import { captureLessonRevisionEvidence } from "../store/lessonRevision"

export const MATERIAL_ROOM = "closed-material-synthetic"
export const MATERIAL_SESSION = "11111111-1111-4111-8111-111111111111"
export const MATERIAL_QUESTION = "Quanto vale la tensione su R2?"
export function memoryLessonWorkspace(coordinator?: LessonMutationCoordinator) {
  const bytes = new Map<string, ArrayBuffer>()
  const driver: WorkspaceDriver = {
    name: "synthetic-memory", available: () => true, init: async () => true,
    read: async path => bytes.has(path) ? new Blob([bytes.get(path)!]) : null,
    write: async (path, blob) => { bytes.set(path, await blob.arrayBuffer()) },
    delete: async path => { bytes.delete(path) },
    list: async prefix => [...bytes].filter(([p]) => !prefix || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data: new Blob([data]), mtime: 0 })),
  }
  const store = new WorkspaceStore({ mutationCoordinator: coordinator })
  Object.assign(store, { driver })
  return store
}
export function captureBroker(active = false, localOnly = false): MutationLockBroker {
  return {
    safety: localOnly ? "local-only" : "origin-exclusive",
    request: async (_name, _options, work) => work(),
    tryRequest: async (_name, _options, work) => active ? { acquired: false } : { acquired: true, value: await work() },
  }
}
export async function closedLessonFixture(coordinator = createLessonMutationCoordinator(captureBroker())) {
  const factory = new IDBFactory()
  vi.stubGlobal("indexedDB", factory); vi.stubGlobal("IDBKeyRange", IDBKeyRange)
  const local = new Map<string, string>()
  vi.stubGlobal("localStorage", { getItem: (key: string) => local.get(key) ?? null,
    setItem: (key: string, value: string) => { local.set(key, value) }, removeItem: (key: string) => { local.delete(key) },
    clear: () => { local.clear() }, key: (index: number) => [...local.keys()][index] ?? null,
    get length() { return local.size } })
  const store = memoryLessonWorkspace(coordinator)
  let id = 0
  const uuid = () => `cccccccc-cccc-4ccc-8ccc-${(++id).toString(16).padStart(12, "0")}`
  const handle = await openLessonOsSession({ room: MATERIAL_ROOM, actor: { type: "teacher", id: "synthetic" },
    newSessionId: () => MATERIAL_SESSION, newEventId: uuid, now: () => 1000 + id,
    env: { indexedDB: factory, storage: undefined, markerStorage: undefined } })
  const recorder = new JournalRecorder({ store, journalPath: roomPaths(MATERIAL_ROOM).journal,
    identity: handle.identity, producer: handle.producer, newEventId: uuid, now: () => 1000 + id,
    withExclusiveLock: async (_name, work) => work() })
  const question = { id: "question-synthetic", type: "text", text: MATERIAL_QUESTION, version: 1 }
  recorder.recordChange([question]); recorder.recordMathInsert("V_{R2}=R_2 I")
  await handle.appendFact("concept.introduced", { conceptId: "ohm", labels: { it: "Legge di Ohm" } },
    { evidence: [{ ref: "board:question-synthetic", resolution: "verified" }] })
  await handle.appendFact("simulation.circuit.solved", { experimentId: "synthetic-series", currentMa: 4, labels: { it: "Corrente in serie" } },
    { evidence: [{ ref: "simulation:synthetic-series", resolution: "verified" }] })
  await handle.close({ beforeEnd: async () => {
    await recorder.flush()
    await store.write(roomPaths(MATERIAL_ROOM).scene, new Blob([JSON.stringify({ type: "excalidraw", elements: [question] })]))
    await store.saveMeta(MATERIAL_ROOM, { v: 1, name: "Lezione sintetica DC", createdAt: 1000 })
    return captureLessonRevisionEvidence(store, MATERIAL_ROOM)
  } })
  return { store, factory, handle, recorder }
}
