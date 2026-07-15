import { describe, expect, it } from "vitest"
import { samePartition } from "../core/contracts/kernel"
import {
  ObservationStoreError,
  classifyObservationStoreError,
  fullEnvelopeEqual,
  parseObservationForAppend,
} from "../core/kernel/observationStore"
import {
  openIndexedDbObservationStore,
  partitionDatabaseName,
} from "../adapters/indexeddb/indexedDbObservationStore"

const SHA = "a".repeat(64)
const EVENT = "00000000-0000-4000-8000-000000000001"

function scope(overrides: Record<string, unknown> = {}) {
  return {
    workspaceId: "workspace-a",
    audienceSpaceId: "audience-a",
    lessonId: "lesson-a",
    boardId: "board-a",
    pathId: "path-a",
    meetingId: "meeting-a",
    ...overrides,
  }
}

function observation(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    eventId: EVENT,
    producer: { producerId: "studio-host", producerKind: "host" },
    scope: scope(),
    privacy: "didactic-sensitive",
    authority: "observed",
    occurredAt: "2026-07-15T08:00:00.000Z",
    recordedAt: "2026-07-15T08:00:00.100Z",
    kind: "board.stroke.recorded",
    payload: { points: [1, 2], strokeCount: 1 },
    evidence: [],
    consent: { status: "not-required" },
    contentHash: SHA,
    sourceIdempotencyKey: "source-retry-1",
    ...overrides,
  }
}

describe("K2 observation store contract", () => {
  it("parses the complete K1 envelope before append", () => {
    expect(parseObservationForAppend(observation()).eventId).toBe(EVENT)
    expect(() => parseObservationForAppend({ ...observation(), partitionSeq: 1 })).toThrow()
    expect(() => parseObservationForAppend({ ...observation(), authority: "model-proposal" })).toThrow()
  })

  it("binds the adapter to workspace and audience, not lesson or board", () => {
    expect(samePartition(scope(), scope({ lessonId: "lesson-b", boardId: "board-b" }))).toBe(true)
    expect(samePartition(scope(), scope({ audienceSpaceId: "audience-b" }))).toBe(false)
  })

  it("compares every parsed envelope value recursively", () => {
    const parsed = parseObservationForAppend(observation())
    const reordered = parseObservationForAppend({
      ...observation(),
      payload: { strokeCount: 1, points: [1, 2] },
    })
    expect(fullEnvelopeEqual(parsed, reordered)).toBe(true)
    expect(fullEnvelopeEqual(parsed, parseObservationForAppend(observation({ recordedAt: "2026-07-15T08:00:00.101Z" })))).toBe(false)
    expect(fullEnvelopeEqual(parsed, parseObservationForAppend(observation({ payload: { points: [2, 1], strokeCount: 1 } })))).toBe(false)
  })

  it("uses a stable pseudonymous physical name per workspace and audience", async () => {
    const first = await partitionDatabaseName(scope())
    const acrossLesson = await partitionDatabaseName(scope({ lessonId: "lesson-b", boardId: "board-b" }))
    const otherAudience = await partitionDatabaseName(scope({ audienceSpaceId: "audience-b" }))
    expect(first).toBe(acrossLesson)
    expect(first).not.toBe(otherAudience)
    expect(first).toBe("ardesia.kernel.observations:3fc5032240a76982b2e59b0c246ed30fac1d8926ad6843857bba7380e34da95e")
    expect(first).not.toContain("workspace-a")
    expect(first).not.toContain("audience-a")
  })

  it("classifies a synchronous storage-open denial without exposing its message", async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "indexedDB")
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: { open: () => { throw new DOMException("sensitive scope", "SecurityError") } },
    })
    try {
      await expect(openIndexedDbObservationStore(scope())).rejects.toMatchObject({
        code: "security",
        message: "Observation store security",
      })
    } finally {
      if (original) Object.defineProperty(globalThis, "indexedDB", original)
      else Reflect.deleteProperty(globalThis, "indexedDB")
    }
  })

  it("rejects non-positive and non-finite timeouts before touching storage", async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "indexedDB")
    let openCalls = 0
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: { open: () => { openCalls += 1; throw new DOMException("sensitive", "SecurityError") } },
    })
    try {
      for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(openIndexedDbObservationStore(scope(), { openTimeoutMs: value })).rejects.toMatchObject({
          code: "unknown",
          message: "Observation store unknown",
        })
      }
      expect(openCalls).toBe(0)
    } finally {
      if (original) Object.defineProperty(globalThis, "indexedDB", original)
      else Reflect.deleteProperty(globalThis, "indexedDB")
    }
  })

  it.each([
    ["QuotaExceededError", "quota"],
    ["SecurityError", "security"],
    ["UnknownError", "unknown"],
    ["AbortError", "abort"],
    ["DataCloneError", "data-clone"],
    ["ConstraintError", "unknown"],
  ] as const)("classifies %s without leaking payloads", (name, code) => {
    const error = new DOMException("sensitive payload", name)
    const classified = classifyObservationStoreError(error)
    expect(classified).toBeInstanceOf(ObservationStoreError)
    expect(classified.code).toBe(code)
    expect(classified.message).not.toContain("sensitive")
  })
})
