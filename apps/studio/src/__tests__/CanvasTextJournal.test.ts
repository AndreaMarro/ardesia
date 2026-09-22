// @vitest-environment jsdom
// Elementi canvas reali (Excalidraw) portano chiavi con valore undefined
// (es. customData): il journal non deve mai abortire il batch onChange.
// Solo sintetici.
import { describe, expect, it } from "vitest"
import { JournalRecorder } from "../store/JournalRecorder"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"

const producer = { id: "test.ctx.sanitize", version: "1.0.0", commitSha: "f".repeat(40) }

function workspace() {
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
  Object.assign(store, { driver, fallback: {} })
  return store
}

function recorder(store: WorkspaceStore) {
  let n = 0
  const nextId = () => `88888888-8888-4888-8888-${(++n).toString(16).padStart(12, "0")}`
  return new JournalRecorder({ store, journalPath: roomPaths("ctx-room").journal,
    identity: { lessonId: "ctx-room", sessionId: "77777777-7777-4777-8777-777777777777",
      actor: { type: "teacher", id: "synthetic" } },
    producer, now: () => 1000, newEventId: nextId,
    withExclusiveLock: async (_name, work) => work() })
}

describe("canvas element sanitization", () => {
  it("records a real-shape text element with undefined customData", async () => {
    const store = workspace()
    const rec = recorder(store)
    const element: Record<string, unknown> = {
      id: "e1", type: "text", x: 640, y: 333.5, width: 5, height: 27,
      strokeColor: "#14130f", backgroundColor: "transparent",
      opacity: 100, groupIds: [], frameId: null, index: "a0", seed: 1,
      version: 1, versionNonce: 2, isDeleted: false, boundElements: null,
      updated: 1000, link: null, locked: false, customData: undefined,
      text: "La corrente e uguale in serie.", fontSize: 20, fontFamily: 6,
      containerId: null, originalText: "La corrente e uguale in serie.",
    }
    expect(() => rec.recordChange([element])).not.toThrow()
    await rec.flush()
    const text = await (await store.read(roomPaths("ctx-room").journal))!.text()
    expect(text).toContain("uguale in serie")
    expect(text).not.toContain("customData")
  })

  it("keeps recording later batches after a sanitized element", async () => {
    const store = workspace()
    const rec = recorder(store)
    rec.recordChange([{ id: "e1", type: "text", text: "primo", version: 1, customData: undefined }])
    rec.recordChange([
      { id: "e1", type: "text", text: "primo", version: 1, customData: undefined },
      { id: "e2", type: "text", text: "secondo", version: 1 },
    ])
    await rec.flush()
    const text = await (await store.read(roomPaths("ctx-room").journal))!.text()
    expect(text).toContain("secondo")
  })

  it("still rejects genuinely non-JSON element payloads", () => {
    const store = workspace()
    const rec = recorder(store)
    const element: Record<string, unknown> = {
      id: "e9", type: "text", text: "x", version: 1, evil: 10n,
    }
    expect(() => rec.recordChange([element])).toThrow()
  })
})
