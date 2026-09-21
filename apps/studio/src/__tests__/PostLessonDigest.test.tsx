// @vitest-environment jsdom
// Synthetic identity/lifecycle evidence through the actual store, log and view.
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, render, waitFor } from "@testing-library/react"
import RecapView from "../RecapView"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"
import * as eventLogs from "../lessonos/indexedDbEventLog"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"

const A = "recap-proof-a"
const B = "recap-proof-b"
const SESSION = "11111111-1111-4111-8111-111111111111"
const producer = { id: "test.local.postlesson", version: "1.0.0", commitSha: "a".repeat(40) }
let nextId = 0
const uuid = () => `00000000-0000-4000-8000-${(++nextId).toString(16).padStart(12, "0")}`

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

async function logWithLessons(started = false) {
  const log = await eventLogs.createEventLogStore({ factory: undefined })
  for (const room of [A, B]) {
    if (started) await log.appendEnvelope(createEventEnvelopeV2({ lessonId: room, sessionId: SESSION,
      kind: "lesson.started", actor: { type: "teacher", id: "synthetic" }, producer,
      causationId: null, idempotencyKey: null, evidence: [{ ref: `lesson:${room}`, resolution: "verified" }],
      payload: { room },
    }, { eventId: uuid, now: () => new Date(900) }))
    await log.appendEnvelope(createEventEnvelopeV2({ lessonId: room, sessionId: SESSION,
      kind: "concept.introduced", actor: { type: "teacher", id: "synthetic" }, producer,
      causationId: null, idempotencyKey: null, evidence: [{ ref: `board:${room}`, resolution: "verified" }],
      payload: { conceptId: room, labels: { it: room === A ? "Concetto SOLO A" : "Concetto SOLO B" } },
    }, { eventId: uuid, now: () => new Date(1000) }))
  }
  return log
}

// Per-room legacy compatibility keeps the digest lifecycle tests focused.
// Actual producer bytes are covered separately by lessonRecapRecorder.test.ts.
async function visibleRecap(store: WorkspaceStore, room: string) {
  const text = JSON.stringify({ t: 1000, type: "math.insert", latex: "V = R I" })
  await store.write(roomPaths(room).journal, new Blob([text]))
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe("post-lesson canonical identity", () => {
  for (const started of [false, true]) it(`excludes overlapping B facts from A (start=${started})`, async () => {
    const store = workspace()
    await visibleRecap(store, A)
    const log = await logWithLessons(started)
    vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")?.srcdoc).toContain("Concetto SOLO A"))
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO B")
  })

  it("clears the prior digest if reading the next lesson fails", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    await visibleRecap(store, B)
    const log = await logWithLessons()
    const factory = vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container, rerender } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")?.srcdoc).toContain("Concetto SOLO A"))
    factory.mockRejectedValue(new Error("synthetic read failure"))
    rerender(<RecapView store={store} room={B} />)
    await waitFor(() => expect(container.textContent).not.toContain("caricamento…"))
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO A")
  })

  it("does not assign unscoped legacy facts to a named lesson", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    const log = await eventLogs.createEventLogStore({ factory: undefined })
    await log.append({ kind: "concept.introduced", conceptId: "unassigned",
      labels: { it: "Unassigned private fact" }, t: 1000, evidence: ["board:legacy"] })
    vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull())
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Unassigned private fact")
  })

  it("closes the opened log even when reading rejects", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    const log = await logWithLessons()
    const close = vi.fn().mockResolvedValue(undefined)
    Object.assign(log, { close })
    vi.spyOn(log, "readAll").mockRejectedValue(new Error("synthetic read failure"))
    vi.spyOn(log, "readEnvelopesByLesson").mockRejectedValue(new Error("synthetic read failure"))
    vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull())
    expect(close).toHaveBeenCalledOnce()
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO")
  })

  it("ignores a late result after navigating to a different lesson", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    await visibleRecap(store, B)
    const log = await logWithLessons()
    let resolveOpen!: (value: typeof log) => void
    const pending = new Promise<typeof log>((resolve) => { resolveOpen = resolve })
    const factory = vi.spyOn(eventLogs, "createEventLogStore")
      .mockReturnValueOnce(pending).mockResolvedValue(log)
    const { container, rerender } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(factory).toHaveBeenCalledOnce())
    rerender(<RecapView store={store} room={B} />)
    await waitFor(() => expect(container.querySelector("iframe")?.srcdoc).toContain("Concetto SOLO B"))
    await act(async () => { resolveOpen(log); await pending })
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO A")
  })
})
