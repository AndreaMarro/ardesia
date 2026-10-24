import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { JournalRecorder, assertJournalEnvelopeV2 } from "../store/JournalRecorder"
import { ReplayEngine, deserializeEvents } from "../store/ReplayEngine"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceStore } from "../store/WorkspaceStore"
import { studioProducerIdentity } from "../core/contracts/eventEnvelope"

function harness() {
  const files = new Map<string, Blob>()
  const journalPath = roomPaths("board-boundary").journal
  const store = {
    read: vi.fn(async (path: string) => files.get(path) ?? null),
    write: vi.fn(async (path: string, blob: Blob) => { files.set(path, blob) }),
  }
  let eventId = 0
  const recorder = new JournalRecorder({
    store: store as unknown as WorkspaceStore,
    journalPath,
    identity: {
      lessonId: "board-boundary",
      sessionId: "00000000-0000-4000-8000-000000000001",
      actor: { type: "teacher", id: "synthetic-teacher" },
    },
    producer: studioProducerIdentity(),
    now: () => 1000,
    newEventId: () => `00000000-0000-4000-8000-${(++eventId).toString(16).padStart(12, "0")}`,
    withExclusiveLock: async (_name, work) => work(),
  })
  return { recorder, files, store, journalPath }
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers() })

describe("Excalidraw element to canonical journal boundary", () => {
  it.each(["add", "update"] as const)("captures a real board's optional undefined fields on %s", async (kind) => {
    const h = harness()
    if (kind === "update") h.recorder.seed([{ id: "rectangle", version: 1 }])
    const element = {
      id: "rectangle", type: "rectangle", version: kind === "update" ? 2 : 1,
      x: 20, y: 40, width: 100, height: 50, customData: undefined,
      boundElements: null, isDeleted: false,
    }
    h.recorder.recordChange([element])
    const envelope = h.recorder.getEnvelopeBuffer()[0]!
    expect(envelope.kind).toBe(`journal.element.${kind}`)
    expect(envelope.payload).toEqual({ element: {
      id: "rectangle", type: "rectangle", version: element.version,
      x: 20, y: 40, width: 100, height: 50, boundElements: null, isDeleted: false,
    } })
    expect(Object.hasOwn(element, "customData")).toBe(true)
    expect(() => assertJournalEnvelopeV2(envelope)).not.toThrow()
    await h.recorder.flush()
    const events = deserializeEvents(await h.files.get(h.journalPath)!.text(), h.journalPath)
    expect({ element: new ReplayEngine().getSceneAt(events, 1000)[0] }).toEqual(envelope.payload)
  })

  it("omits absent object fields recursively while preserving null, false, zero and array order", () => {
    const h = harness()
    const customData = {
      missing: undefined, nil: null, enabled: false, count: 0, label: "",
      points: [{ x: 0, label: undefined }, { x: 1, label: "end" }],
    }
    h.recorder.recordChange([{ id: "nested", version: 1, customData }])
    customData.points[0]!.x = 99
    const envelope = h.recorder.getEnvelopeBuffer()[0]!
    expect(envelope.payload).toEqual({ element: {
      id: "nested", version: 1, customData: {
        nil: null, enabled: false, count: 0, label: "",
        points: [{ x: 0 }, { x: 1, label: "end" }],
      },
    } })
    expect(Object.hasOwn(customData, "missing")).toBe(true)
    expect(Object.hasOwn(customData.points[0]!, "label")).toBe(true)
  })

  it.each([
    ["undefined array entry", () => [undefined]],
    ["array hole", () => Array(1)],
    ["non-finite number", () => ({ x: Number.NaN })],
    ["bigint", () => ({ value: 1n })],
    ["function", () => ({ method: () => "not data" })],
    ["date", () => new Date(0)],
    ["map", () => new Map([["value", 1]])],
    ["typed array", () => new Uint8Array([1, 2])],
    ["class instance", () => new (class BoardMetadata { value = 1 })()],
    ["symbol key", () => ({ [Symbol("hidden")]: "not JSON", value: 1 })],
    ["non-enumerable property", () => Object.defineProperty({}, "hidden", { value: 1 })],
    ["cycle", () => { const value: Record<string, unknown> = {}; value.self = value; return value }],
  ] as const)("rejects %s rather than silently changing it", (_name, invalidValue) => {
    const h = harness()
    expect(() => h.recorder.recordChange([
      { id: "safe", version: 1, customData: { label: "valid first element" } },
      { id: "invalid", version: 1, customData: invalidValue() },
    ])).toThrow()
    expect(h.recorder.getEnvelopeBuffer()).toEqual([])
    expect(h.store.write).not.toHaveBeenCalled()
    h.recorder.recordChange([{ id: "safe", version: 1 }])
    expect(h.recorder.getEnvelopeBuffer()[0]?.kind).toBe("journal.element.add")
  })

  it("rejects accessors without invoking them", () => {
    const h = harness()
    const getter = vi.fn(() => "must not run")
    const metadata = Object.defineProperty({}, "value", { enumerable: true, get: getter })
    expect(() => h.recorder.recordChange([{ id: "accessor", version: 1, customData: metadata }])).toThrow()
    expect(getter).not.toHaveBeenCalled()
    expect(h.recorder.getEnvelopeBuffer()).toEqual([])
  })

  it("keeps the canonical envelope validator strict about undefined", () => {
    const h = harness()
    h.recorder.recordChange([{ id: "canonical", version: 1 }])
    const altered = structuredClone(h.recorder.getEnvelopeBuffer()[0]!)
    const payload = altered.payload as unknown as { element: Record<string, unknown> }
    payload.element.customData = undefined
    expect(() => assertJournalEnvelopeV2(altered)).toThrow(/undefined|JSON/)
  })
})
