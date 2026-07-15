import { describe, expect, it } from "vitest"
import type {
  ObservationEnvelopeV1,
  ProducerObservationInputV1,
} from "../contracts/kernel"
import {
  ObservationStoreError,
  parseObservationForAppend,
  type ObservationAppendReceipt,
  type ObservationStore,
} from "../kernel/observationStore"
import {
  createHostObservationIntake,
  type HostObservationAssignmentV1,
  type HostObservationAuthorityPort,
} from "./hostObservationIntake"

const SHA = "a".repeat(64)
const EVENT_ID = "00000000-0000-4000-8000-000000000001"
const RECEIPT_ID = "00000000-0000-4000-8000-000000000002"

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

function evidence(evidenceScope = scope()) {
  return {
    evidenceId: "evidence-a",
    locator: { kind: "board-element", boardElementId: "element-a" },
    contentHash: SHA,
    scope: evidenceScope,
    privacy: "didactic-sensitive",
  }
}

function producerInput(overrides: Record<string, unknown> = {}) {
  return {
    clientEventId: "client-event-a",
    idempotencyHint: "producer-hint-a",
    occurredAt: "2026-07-15T08:00:00.000Z",
    kind: "board.stroke.recorded",
    payload: {
      points: [1, -0, 3],
      labels: ["accept", "attest", "publish", "apply"],
    },
    evidenceCandidates: [
      { candidateRef: "board:element-a", kind: "board-element" },
    ],
    ...overrides,
  }
}

function assignment(overrides: Record<string, unknown> = {}) {
  return {
    eventId: EVENT_ID,
    producer: { producerId: "studio-host", producerKind: "host" },
    scope: scope(),
    privacy: "didactic-sensitive",
    recordedAt: "2026-07-15T08:00:00.100Z",
    evidence: [evidence()],
    consent: { status: "not-required" },
    contentHash: SHA,
    sourceIdempotencyKey: "host-source-key-a",
    ...overrides,
  }
}

function storeHarness(
  appendBehavior?: (
    input: ObservationEnvelopeV1,
    receipt: ObservationAppendReceipt,
  ) => Promise<ObservationAppendReceipt>,
) {
  const appended: ObservationEnvelopeV1[] = []
  const calls = { append: 0 }
  const receipt: ObservationAppendReceipt = {
    partitionSeq: 1,
    eventId: EVENT_ID,
    sourceIdempotencyKey: "host-source-key-a",
    partition: { workspaceId: "workspace-a", audienceSpaceId: "audience-a" },
  }
  const store: ObservationStore = {
    lifecycle: "open",
    async append(input) {
      calls.append += 1
      const parsed = parseObservationForAppend(input)
      appended.push(parsed)
      if (appendBehavior) return appendBehavior(parsed, receipt)
      return receipt
    },
    close() {},
  }
  return { appended, calls, receipt, store }
}

function intakeWith(
  store: ObservationStore,
  authority: HostObservationAuthorityPort,
) {
  return createHostObservationIntake({
    authority,
    authorizedPartition: {
      workspaceId: "workspace-a",
      audienceSpaceId: "audience-a",
    },
    store,
  })
}

describe("host-authorized observation intake", () => {
  it.each(Object.entries({
    eventId: EVENT_ID,
    producer: { producerId: "forged", producerKind: "plugin" },
    scope: scope({ workspaceId: "workspace-b" }),
    privacy: "public",
    authority: "observed",
    recordedAt: "2026-07-15T08:00:00.100Z",
    consent: { status: "granted", receiptId: RECEIPT_ID },
    contentHash: SHA,
    sourceIdempotencyKey: "forged-source-key",
    partitionSeq: 9,
  }))("rejects producer-controlled %s before host authority or K2 append", async (key, value) => {
    const { appended, calls, store } = storeHarness()
    let authorityCalls = 0
    const intake = intakeWith(store, {
      async authorize() {
        authorityCalls += 1
        return assignment() as HostObservationAssignmentV1
      },
    })

    await expect(intake.record({ ...producerInput(), [key]: value })).rejects.toMatchObject({
      code: "invalid-producer-input",
      message: "Host observation intake invalid-producer-input",
    })
    expect(authorityCalls).toBe(0)
    expect(calls.append).toBe(0)
    expect(appended).toHaveLength(0)
  })

  it("rejects proposal-shaped and hostile producer values without leaking their content", async () => {
    const { appended, calls, store } = storeHarness()
    let authorityCalls = 0
    const intake = intakeWith(store, {
      async authorize() {
        authorityCalls += 1
        return assignment() as HostObservationAssignmentV1
      },
    })
    const hostile = { ...producerInput(), get kind(): string { throw new Error("sensitive lesson") } }
    const proposalShaped = {
      schemaVersion: 1,
      authority: "model-proposal",
      producer: { producerId: "model", producerKind: "model-adapter" },
      kind: "lesson.recap.proposed",
    }

    for (const raw of [hostile, proposalShaped]) {
      const rejection = intake.record(raw)
      await expect(rejection).rejects.toMatchObject({ code: "invalid-producer-input" })
      await expect(rejection).rejects.not.toThrow("sensitive lesson")
    }
    expect(authorityCalls).toBe(0)
    expect(calls.append).toBe(0)
    expect(appended).toHaveLength(0)
  })

  it.each([
    ["foreign workspace", assignment({
      scope: scope({ workspaceId: "workspace-b" }),
      evidence: [evidence(scope({ workspaceId: "workspace-b" }))],
    }), "scope-mismatch"],
    ["foreign audience", assignment({
      scope: scope({ audienceSpaceId: "audience-b" }),
      evidence: [evidence(scope({ audienceSpaceId: "audience-b" }))],
    }), "scope-mismatch"],
    ["cross-scope evidence", assignment({ evidence: [evidence(scope({ lessonId: "lesson-b" }))] }), "invalid-host-assignment"],
    ["raw audio without consent", assignment({ privacy: "raw-audio" }), "invalid-host-assignment"],
    ["model producer", assignment({ producer: { producerId: "model", producerKind: "model-adapter" } }), "invalid-host-assignment"],
    ["uppercase hash", assignment({ contentHash: "A".repeat(64) }), "invalid-host-assignment"],
    ["invalid event id", assignment({ eventId: "producer-id" }), "invalid-host-assignment"],
  ] as const)("rejects %s host assignment before K2 append", async (_label, hostAssignment, code) => {
    const { appended, calls, store } = storeHarness()
    const intake = intakeWith(store, {
      async authorize() {
        return hostAssignment as HostObservationAssignmentV1
      },
    })

    await expect(intake.record(producerInput())).rejects.toMatchObject({
      code,
      message: `Host observation intake ${code}`,
    })
    expect(calls.append).toBe(0)
    expect(appended).toHaveLength(0)
  })

  it("fails closed and redacts authority denial or failure before append", async () => {
    const deniedStore = storeHarness()
    const denied = intakeWith(deniedStore.store, { async authorize() { return null } })
    await expect(denied.record(producerInput())).rejects.toMatchObject({
      code: "not-authorized",
      message: "Host observation intake not-authorized",
    })
    expect(deniedStore.calls.append).toBe(0)
    expect(deniedStore.appended).toHaveLength(0)

    const failedStore = storeHarness()
    const failed = intakeWith(failedStore.store, {
      async authorize() { throw new Error("sensitive policy state") },
    })
    const rejection = failed.record(producerInput())
    await expect(rejection).rejects.toMatchObject({
      code: "authority-failed",
      message: "Host observation intake authority-failed",
    })
    await expect(rejection).rejects.not.toThrow("sensitive policy state")
    expect(failedStore.calls.append).toBe(0)
    expect(failedStore.appended).toHaveLength(0)
  })

  it("preserves immutable producer payload and cited host provenance in one observed envelope", async () => {
    const raw = producerInput()
    const seen: ProducerObservationInputV1[] = []
    const { appended, receipt, store } = storeHarness()
    const hostAssignment = assignment() as HostObservationAssignmentV1
    const intake = intakeWith(store, {
      async authorize(input) {
        seen.push(input)
        return hostAssignment
      },
    })

    await expect(intake.record(raw)).resolves.toEqual(receipt)
    expect(seen).toEqual([raw])
    expect(Object.isFrozen(seen[0])).toBe(true)
    expect(Object.isFrozen(seen[0].payload)).toBe(true)
    expect(Object.isFrozen((seen[0].payload as { points: number[] }).points)).toBe(true)
    expect(Object.isFrozen((seen[0].payload as { labels: string[] }).labels)).toBe(true)
    expect(Object.isFrozen(seen[0].evidenceCandidates)).toBe(true)
    expect(Object.isFrozen(seen[0].evidenceCandidates[0])).toBe(true)
    expect(appended).toEqual([{
      schemaVersion: 1,
      eventId: EVENT_ID,
      producer: hostAssignment.producer,
      scope: hostAssignment.scope,
      privacy: hostAssignment.privacy,
      authority: "observed",
      occurredAt: raw.occurredAt,
      recordedAt: hostAssignment.recordedAt,
      kind: raw.kind,
      payload: raw.payload,
      evidence: hostAssignment.evidence,
      consent: hostAssignment.consent,
      contentHash: hostAssignment.contentHash,
      sourceIdempotencyKey: hostAssignment.sourceIdempotencyKey,
    }])
    expect(appended[0].sourceIdempotencyKey).not.toBe(raw.idempotencyHint)
    expect(appended[0].authority).toBe("observed")
  })

  it("does not start a second authorization while a successful K2 append is pending", async () => {
    let authorizeCalls = 0
    let releaseAppend!: () => void
    let markAppendStarted!: () => void
    const appendStarted = new Promise<void>((resolve) => { markAppendStarted = resolve })
    const appendGate = new Promise<void>((resolve) => { releaseAppend = resolve })
    const { calls, receipt, store } = storeHarness(async (_input, value) => {
      markAppendStarted()
      await appendGate
      return value
    })
    const intake = intakeWith(store, {
      async authorize() {
        authorizeCalls += 1
        return assignment() as HostObservationAssignmentV1
      },
    })

    const first = intake.record(producerInput({ clientEventId: "client-first" }))
    const second = intake.record(producerInput({ clientEventId: "client-second" }))
    await appendStarted
    expect(authorizeCalls).toBe(1)
    expect(calls.append).toBe(1)

    releaseAppend()
    await expect(first).resolves.toEqual(receipt)
    await expect(second).resolves.toEqual(receipt)
    expect(authorizeCalls).toBe(2)
    expect(calls.append).toBe(2)
  })

  it("serializes authority and append, then continues after a denied operation", async () => {
    const { appended, receipt, store } = storeHarness()
    let authorizeCalls = 0
    let releaseFirst!: (value: HostObservationAssignmentV1 | null) => void
    let markStarted!: () => void
    const firstStarted = new Promise<void>((resolve) => { markStarted = resolve })
    const firstGate = new Promise<HostObservationAssignmentV1 | null>((resolve) => {
      releaseFirst = resolve
    })
    const intake = intakeWith(store, {
      async authorize() {
        authorizeCalls += 1
        if (authorizeCalls === 1) {
          markStarted()
          return firstGate
        }
        return assignment() as HostObservationAssignmentV1
      },
    })

    const first = intake.record(producerInput({ clientEventId: "client-first" }))
    const second = intake.record(producerInput({ clientEventId: "client-second" }))
    await firstStarted
    expect(authorizeCalls).toBe(1)
    expect(appended).toHaveLength(0)

    releaseFirst(null)
    await expect(first).rejects.toMatchObject({ code: "not-authorized" })
    await expect(second).resolves.toEqual(receipt)
    expect(authorizeCalls).toBe(2)
    expect(appended).toHaveLength(1)
  })

  it("propagates the exact K2 error without reclassification", async () => {
    const storeError = new ObservationStoreError("timeout", "unknown")
    const { calls, store } = storeHarness(async () => { throw storeError })
    const intake = intakeWith(store, {
      async authorize() { return assignment() as HostObservationAssignmentV1 },
    })

    await expect(intake.record(producerInput())).rejects.toBe(storeError)
    expect(calls.append).toBe(1)
  })

  it("passes stable host identity through unchanged across an in-process retry", async () => {
    const { appended, receipt, store } = storeHarness()
    const stable = assignment() as HostObservationAssignmentV1
    const intake = intakeWith(store, { async authorize() { return stable } })

    await expect(intake.record(producerInput())).resolves.toEqual(receipt)
    await expect(intake.record(producerInput())).resolves.toEqual(receipt)
    expect(appended).toHaveLength(2)
    expect(appended[1]).toEqual(appended[0])
  })
})
