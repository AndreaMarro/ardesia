import { describe, expect, it } from "vitest"
import {
  encodeTaggedStructural,
  replayObservationJournal,
  validateObservationJournal,
} from "../core/kernel/observationReplay"

const SHA_A = "a".repeat(64)
const SHA_B = "b".repeat(64)
const GOLDEN_HASH = "d67f4e192f77ee25adad4cf35372f9182296f097150971bb90710e5deeed0813"

function scope(overrides: Record<string, unknown> = {}) {
  return {
    workspaceId: "workspace-k3-golden",
    audienceSpaceId: "audience-k3-golden",
    lessonId: "lesson-a",
    boardId: "board-a",
    pathId: "path-a",
    meetingId: "meeting-a",
    ...overrides,
  }
}

function observation(ordinal: number, overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    eventId: `00000000-0000-4000-8000-${String(ordinal).padStart(12, "0")}`,
    producer: { producerId: "studio-host", producerKind: "host" },
    scope: scope({ lessonId: `lesson-${ordinal}`, boardId: `board-${ordinal}` }),
    privacy: "didactic-sensitive",
    authority: "observed",
    occurredAt: `2026-07-15T08:00:0${ordinal}.000Z`,
    recordedAt: `2026-07-15T08:00:0${ordinal}.100Z`,
    kind: "synthetic.observed",
    payload: { ordinal, points: [ordinal, ordinal + 1] },
    evidence: [],
    consent: { status: "not-required" },
    contentHash: SHA_A,
    sourceIdempotencyKey: `source-${ordinal}`,
    ...overrides,
  }
}

function row(partitionSeq: number, envelope = observation(partitionSeq)) {
  return { partitionSeq, envelope }
}

const goldenRows = () => [row(1), row(2)]

describe("K3 deterministic observation replay", () => {
  it("sorts only by partitionSeq and converges on one hardcoded golden hash", async () => {
    const forward = await replayObservationJournal(goldenRows(), scope())
    const reverse = await replayObservationJournal(goldenRows().reverse(), scope())

    expect(forward.projection).toEqual(reverse.projection)
    expect(forward.projection.observations.map((item) => item.partitionSeq)).toEqual([1, 2])
    expect(forward.hash).toBe(GOLDEN_HASH)
    expect(reverse.hash).toBe(GOLDEN_HASH)
  })

  it("orders object keys but preserves array order and JavaScript -0", async () => {
    const reordered = goldenRows()
    reordered[0] = row(1, observation(1, {
      payload: { points: [1, 2], ordinal: 1 },
    }))
    const arrayChanged = goldenRows()
    arrayChanged[0] = row(1, observation(1, {
      payload: { ordinal: 1, points: [2, 1] },
    }))
    const negativeZero = goldenRows()
    negativeZero[0] = row(1, observation(1, { payload: { ordinal: -0, points: [1, 2] } }))
    const positiveZero = goldenRows()
    positiveZero[0] = row(1, observation(1, { payload: { ordinal: 0, points: [1, 2] } }))

    expect((await replayObservationJournal(reordered, scope())).hash).toBe(GOLDEN_HASH)
    expect((await replayObservationJournal(arrayChanged, scope())).hash).not.toBe(GOLDEN_HASH)
    expect((await replayObservationJournal(negativeZero, scope())).hash)
      .not.toBe((await replayObservationJournal(positiveZero, scope())).hash)
  })

  it("distinguishes a lone surrogate from the replacement character", async () => {
    const lone = goldenRows()
    lone[0] = row(1, observation(1, { payload: { text: "\ud800" } }))
    const replacement = goldenRows()
    replacement[0] = row(1, observation(1, { payload: { text: "\ufffd" } }))

    expect((await replayObservationJournal(lone, scope())).hash)
      .not.toBe((await replayObservationJournal(replacement, scope())).hash)
  })

  it.each([
    ["payload", { payload: { ordinal: 1, points: [1, 3] } }],
    ["eventId", { eventId: "00000000-0000-4000-8000-000000000091" }],
    ["kind", { kind: "synthetic.changed" }],
    ["contentHash", { contentHash: SHA_B }],
    ["scope", { scope: scope({ lessonId: "lesson-mutated", boardId: "board-1" }) }],
    ["scope.boardId", { scope: scope({ lessonId: "lesson-1", boardId: "board-mutated" }) }],
    ["scope.pathId", { scope: scope({ lessonId: "lesson-1", boardId: "board-1", pathId: "path-mutated" }) }],
    ["scope.meetingId", { scope: scope({ lessonId: "lesson-1", boardId: "board-1", meetingId: "meeting-mutated" }) }],
    ["producer", { producer: { producerId: "import-host", producerKind: "import" } }],
    ["consent", { consent: { status: "granted", receiptId: "00000000-0000-4000-8000-000000000099" } }],
    ["evidence", {
      evidence: [{
        evidenceId: "evidence-a",
        locator: { kind: "document", documentHash: SHA_B },
        contentHash: SHA_B,
        scope: scope({ lessonId: "lesson-1", boardId: "board-1" }),
        privacy: "didactic-sensitive",
      }],
    }],
    ["privacy", { privacy: "pseudonymous" }],
    ["occurredAt", { occurredAt: "2026-07-15T08:00:01.001Z" }],
    ["recordedAt", { recordedAt: "2026-07-15T08:00:01.101Z" }],
    ["sourceIdempotencyKey", { sourceIdempotencyKey: "source-1-mutated" }],
  ])("changes the hash when %s changes", async (_field, override) => {
    const changed = goldenRows()
    changed[0] = row(1, observation(1, override))
    expect((await replayObservationJournal(changed, scope())).hash).not.toBe(GOLDEN_HASH)
  })

  it.each(["workspaceId", "audienceSpaceId"] as const)(
    "changes the hash when partition field %s changes coherently",
    async (field) => {
      const requested = scope({ [field]: `${field}-mutated` })
      const changed = goldenRows().map((item) => row(item.partitionSeq, {
        ...item.envelope,
        scope: { ...item.envelope.scope, [field]: `${field}-mutated` },
      }))
      expect((await replayObservationJournal(changed, requested)).hash).not.toBe(GOLDEN_HASH)
    },
  )

  it.each([
    ["does not start at one", [row(2)]],
    ["contains a gap", [row(1), row(3)]],
    ["duplicates a sequence", [row(1), row(1, observation(2))]],
    ["uses an unsafe sequence", [row(Number.MAX_SAFE_INTEGER + 1)]],
  ])("rejects a journal that %s", (_case, rows) => {
    expect(() => validateObservationJournal(rows, scope())).toThrow()
  })

  it("rejects duplicate identities and cross-partition or corrupt rows", () => {
    expect(() => validateObservationJournal([
      row(1),
      row(2, observation(2, { eventId: observation(1).eventId })),
    ], scope())).toThrow()
    expect(() => validateObservationJournal([
      row(1),
      row(2, observation(2, { sourceIdempotencyKey: "source-1" })),
    ], scope())).toThrow()
    expect(() => validateObservationJournal([
      row(1, observation(1, {
        scope: scope({ audienceSpaceId: "audience-other", lessonId: "lesson-1", boardId: "board-1" }),
      })),
    ], scope())).toThrow()
    expect(() => validateObservationJournal([{ partitionSeq: 1, envelope: { eventId: "corrupt" } }], scope())).toThrow()
  })

  it("rejects unsupported, cyclic and non-finite structural values", () => {
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    const sparseArray: unknown[] = []
    sparseArray.length = 2
    sparseArray[1] = 1
    const arrayWithAlteredPrototype: unknown[] = [1]
    Object.setPrototypeOf(arrayWithAlteredPrototype, null)
    for (const value of [
      undefined,
      1n,
      Symbol("unsupported"),
      () => undefined,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      cyclic,
      sparseArray,
      arrayWithAlteredPrototype,
    ]) expect(() => encodeTaggedStructural(value)).toThrow()
  })
})
