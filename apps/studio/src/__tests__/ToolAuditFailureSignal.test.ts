import { describe, expect, it, vi } from "vitest"
import type { AuditStore } from "../toolhost/audit"
import * as audit from "../toolhost/audit"
import { EMBED_DATA_KEY, type BoardApiLike, type BoardElementLike } from "../toolhost/caps/board"
import { persistRoomEmbedStateThroughToolHost } from "../toolhost/roomWriteBack"

class TransientAuditStore implements AuditStore {
  readonly files = new Map<string, Blob>()
  failNext: "read" | "write" | null = null

  async read(path: string): Promise<Blob | null> {
    if (this.failNext === "read") {
      this.failNext = null
      throw new Error("synthetic audit read unavailable")
    }
    return this.files.get(path) ?? null
  }

  async write(path: string, data: Blob): Promise<void> {
    if (this.failNext === "write") {
      this.failNext = null
      throw new Error("synthetic audit write unavailable")
    }
    this.files.set(path, data)
  }
}

function ownedBoard(owner = "io.ardesia.simulation") {
  let elements: BoardElementLike[] = [
    { id: "embed-a", customData: { [EMBED_DATA_KEY]: { owner, state: { placements: [] } } } },
  ]
  const updateScene = vi.fn((next: { elements: BoardElementLike[] }) => { elements = next.elements })
  const api: BoardApiLike = {
    getSceneElements: () => elements,
    getAppState: () => ({ selectedElementIds: {} }),
    updateScene,
  }
  return { api, updateScene, marker: () => elements[0]!.customData![EMBED_DATA_KEY] }
}

describe("ToolHost audit failure preserves the actual board result", () => {
  it.each(["read", "write"] as const)("Room does not report a committed write as failed when audit %s rejects", async (failure) => {
    const board = ownedBoard()
    const store = new TransientAuditStore()
    store.failNext = failure
    const reportError = vi.fn()
    const state = { placements: [{ id: "wire-a", from: "a1", to: "b2" }] }

    const result = await persistRoomEmbedStateThroughToolHost(
      board.api, store, "embed-a", state, "io.ardesia.simulation", reportError,
    )

    // Establish the actual scene commit before checking the reported outcome.
    expect(board.updateScene).toHaveBeenCalledOnce()
    expect(board.marker()).toEqual({ owner: "io.ardesia.simulation", state })
    expect(result).toBe(true)
    expect(reportError).not.toHaveBeenCalled()
  })
})

// This API reports rejected append attempts for a live store/tool. It does not
// assert durable loss, a UI warning, or a count surviving a process reload.
function rejectedAppends(store: AuditStore, tool: string): number | undefined {
  const read = (audit as typeof audit & {
    auditDropCount?: (store: AuditStore, tool: string) => number
  }).auditDropCount
  return read?.(store, tool)
}

describe("ToolHost rejected-append diagnostics", () => {
  const tool = "io.ardesia.simulation"

  it.each(["read", "write"] as const)("contains a synchronous audit %s throw without inventing a board failure", async (failure) => {
    const store = new TransientAuditStore()
    store[failure] = () => { throw new Error("synthetic synchronous audit failure") }
    const board = ownedBoard()
    const reportError = vi.fn()

    const result = await persistRoomEmbedStateThroughToolHost(
      board.api, store, "embed-a", { revision: 2 }, tool, reportError,
    )

    expect(board.marker()).toEqual({ owner: tool, state: { revision: 2 } })
    expect(board.updateScene).toHaveBeenCalledOnce()
    expect(result).toBe(true)
    expect(reportError).not.toHaveBeenCalled()
    expect(rejectedAppends(store, tool)).toBe(1)
  })

  it("healthy write keeps exactly one real audit entry and no rejected append", async () => {
    const store = new TransientAuditStore()
    const board = ownedBoard()
    const reportError = vi.fn()
    expect(await persistRoomEmbedStateThroughToolHost(
      board.api, store, "embed-a", { revision: 2 }, tool, reportError,
    )).toBe(true)
    expect(reportError).not.toHaveBeenCalled()
    expect(board.updateScene).toHaveBeenCalledOnce()
    const observed = await audit.readAuditLog(store, tool)
    expect(observed.malformed).toBe(0)
    expect(observed.entries).toEqual([
      { v: 1, t: expect.any(Number), tool, method: "board.write", outcome: "ok" },
    ])
    expect(rejectedAppends(store, tool)).toBe(0)
  })

  it("an audit failure never grants a write to a different owner", async () => {
    const store = new TransientAuditStore()
    store.failNext = "write"
    const board = ownedBoard()
    const reportError = vi.fn()
    const deniedTool = "io.ardesia.other"
    expect(await persistRoomEmbedStateThroughToolHost(
      board.api, store, "embed-a", { injected: true }, deniedTool, reportError,
    )).toBe(false)
    expect(board.updateScene).not.toHaveBeenCalled()
    expect(board.marker()).toEqual({ owner: tool, state: { placements: [] } })
    expect(reportError).toHaveBeenCalledExactlyOnceWith("Write-back ToolHost fallito: richiesta negata")
    expect(rejectedAppends(store, deniedTool)).toBe(1)
    expect(rejectedAppends(store, tool)).toBe(0)
  })

  it("recovery uses the same queued writer and does not double-count a rejected append", async () => {
    const store = new TransientAuditStore()
    const board = ownedBoard()
    store.failNext = "read"
    const reportError = vi.fn()
    expect(await persistRoomEmbedStateThroughToolHost(
      board.api, store, "embed-a", { revision: 2 }, tool, reportError,
    )).toBe(true)
    expect(rejectedAppends(store, tool)).toBe(1)
    expect(await persistRoomEmbedStateThroughToolHost(
      board.api, store, "embed-a", { revision: 3 }, tool, reportError,
    )).toBe(true)
    expect(board.updateScene).toHaveBeenCalledTimes(2)
    expect(board.marker()).toEqual({ owner: tool, state: { revision: 3 } })
    expect(reportError).not.toHaveBeenCalled()
    expect((await audit.readAuditLog(store, tool)).entries).toEqual([
      { v: 1, t: expect.any(Number), tool, method: "board.write", outcome: "ok" },
    ])
    expect(rejectedAppends(store, tool)).toBe(1)
  })

  it("direct append still rejects, the queue recovers and counters are isolated by live store/tool", async () => {
    const store = new TransientAuditStore()
    const otherStore = new TransientAuditStore()
    const first = new audit.ToolAuditLog(store, tool, () => 1)
    const second = new audit.ToolAuditLog(store, tool, () => 2)
    store.failNext = "write"
    await expect(first.append({ method: "failed-a", outcome: "ok" })).rejects.toThrow("synthetic audit write unavailable")
    store.failNext = "read"
    await expect(second.append({ method: "failed-b", outcome: "denied" })).rejects.toThrow("synthetic audit read unavailable")
    await first.idle()
    await second.idle()
    expect(rejectedAppends(store, tool)).toBe(2)
    expect(rejectedAppends(store, "io.ardesia.other")).toBe(0)
    expect(rejectedAppends(otherStore, tool)).toBe(0)
    await first.append({ method: "recovered", outcome: "ok" })
    expect(await audit.readAuditLog(store, tool)).toEqual({
      entries: [{ v: 1, t: 1, tool, method: "recovered", outcome: "ok" }], malformed: 0,
    })
    expect(rejectedAppends(store, tool)).toBe(2)
  })

  it("a missing embed neither writes the scene nor attempts audit", async () => {
    const store = new TransientAuditStore()
    store.failNext = "write"
    const board = ownedBoard()
    const reportError = vi.fn()
    expect(await persistRoomEmbedStateThroughToolHost(
      board.api, store, "missing", { revision: 2 }, tool, reportError,
    )).toBe(false)
    expect(board.updateScene).not.toHaveBeenCalled()
    expect(store.failNext).toBe("write")
    expect(rejectedAppends(store, tool)).toBe(0)
  })

  it("a real board exception is still rejected and audited as an error", async () => {
    const store = new TransientAuditStore()
    const board = ownedBoard()
    board.updateScene.mockImplementation(() => { throw new Error("synthetic scene commit failure") })
    const reportError = vi.fn()
    expect(await persistRoomEmbedStateThroughToolHost(
      board.api, store, "embed-a", { revision: 2 }, tool, reportError,
    )).toBe(false)
    expect(board.marker()).toEqual({ owner: tool, state: { placements: [] } })
    expect(reportError).toHaveBeenCalledOnce()
    expect((await audit.readAuditLog(store, tool)).entries[0]).toMatchObject({ method: "board.write", outcome: "error" })
    expect(rejectedAppends(store, tool)).toBe(0)
  })
})
