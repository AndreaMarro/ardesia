import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  AuthorityClassSchema,
  CommandReceiptV1Schema,
  ContextManifestV1Schema,
  EvidenceRefV2Schema,
  KERNEL_INTAKE_LIMITS,
  ObservationEnvelopeV1Schema,
  PrivacyClassSchema,
  ProducerObservationInputV1Schema,
  ProposalEnvelopeV1Schema,
  TeacherDecisionProposalBindingV1Schema,
  TeacherDecisionV1Schema,
  TeachingScopeV1Schema,
  parseProducerObservationInputV1,
  sameFullScope,
  samePartition,
} from "../core/contracts"
const SHA = "a".repeat(64)
const UUID = {
  event: "00000000-0000-4000-8000-000000000001", manifest: "00000000-0000-4000-8000-000000000002",
  proposal: "00000000-0000-4000-8000-000000000003", run: "00000000-0000-4000-8000-000000000007",
  decision: "00000000-0000-4000-8000-000000000004", command: "00000000-0000-4000-8000-000000000005",
  receipt: "00000000-0000-4000-8000-000000000006",
}
function scope(overrides: Record<string, unknown> = {}) {
  return {
    workspaceId: "workspace-a", audienceSpaceId: "audience-a", lessonId: "lesson-a",
    boardId: "board-a", pathId: "path-a", meetingId: "meeting-a", ...overrides,
  }
}
function evidence(evidenceId: string, evidenceScope = scope()) {
  return {
    evidenceId, locator: { kind: "board-element", boardElementId: evidenceId },
    contentHash: SHA, scope: evidenceScope, privacy: "didactic-sensitive",
  }
}

function context(evidenceRefs = [evidence("ev-a")]) {
  return {
    schemaVersion: 1, manifestId: UUID.manifest, retrieverVersion: "retriever-v1",
    contextScope: scope(), selectors: [{ kind: "teaching-scope", scope: scope() }],
    evidence: evidenceRefs.map((ref) => ({ ref, selectionReason: "scope-retrieval" })),
  }
}
function producerInput() {
  const payload: unknown = { strokeCount: 1, points: [1, 2, 3] }
  return {
    clientEventId: "client-1", idempotencyHint: "retry-1",
    occurredAt: "2026-07-15T08:00:00.000Z", kind: "board.stroke.recorded",
    payload,
    evidenceCandidates: [{ candidateRef: "board:element-1", kind: "board-element" }],
  }
}
function observation() {
  return {
    schemaVersion: 1, eventId: UUID.event,
    producer: { producerId: "studio-host", producerKind: "host" },
    scope: scope(), privacy: "didactic-sensitive", authority: "observed",
    occurredAt: "2026-07-15T08:00:00.000Z", recordedAt: "2026-07-15T08:00:00.100Z",
    kind: "board.stroke.recorded", payload: { strokeCount: 1 },
    evidence: [evidence("ev-a")],
    consent: { status: "not-required" },
    contentHash: SHA,
    sourceIdempotencyKey: "source-retry-1",
  }
}

function proposal() {
  return {
    schemaVersion: 1,
    proposalId: UUID.proposal,
    producer: { producerId: "model-adapter", producerKind: "model-adapter" },
    scope: scope(),
    privacy: "didactic-sensitive",
    authority: "model-proposal",
    runId: UUID.run,
    providerId: "provider-a",
    modelId: "model-a",
    promptVersion: "prompt-v1",
    outputSchemaVersion: "proposal-items-v1",
    consent: { status: "not-required" },
    uncertainty: { level: "unknown", basis: "unknown" },
    usage: { inputTokens: 10, outputTokens: 20, latencyMs: 25, costUsdMicros: 0 },
    createdAt: "2026-07-15T08:01:00.000Z",
    kind: "lesson.recap.proposed",
    context: context(),
    contextManifestHash: SHA,
    items: [
      { itemId: "claim-a", itemType: "factual-claim", claim: {
        subject: "synthetic-led", predicate: "has-state", object: "on",
      }, evidenceIds: ["ev-a"] },
      { itemId: "action-a", itemType: "action", actionKind: "create-exercise", parameters: {}, evidenceIds: ["ev-a"] },
    ],
  }
}

function expectInvalidProposalItems(items: unknown[]) {
  expect(() => ProposalEnvelopeV1Schema.parse({ ...proposal(), items })).toThrow()
}

const decisionSource = { proposalId: UUID.proposal, itemIds: ["claim-a"], evidenceIds: ["ev-a"] }
const decisionBase = {
  schemaVersion: 1, decisionId: UUID.decision, teacherId: "teacher-a",
  scope: scope(), decidedAt: "2026-07-15T08:02:00.000Z",
  source: decisionSource,
}

function receipt(status: "applied" | "failed") {
  const base = {
    schemaVersion: 1, receiptId: UUID.receipt, commandId: UUID.command,
    decisionId: UUID.decision, authority: "deterministic-derived", action: "apply",
    commandScope: scope(), targetScope: scope(),
    recordedAt: "2026-07-15T08:03:00.000Z",
  }
  return status === "applied"
    ? { ...base, status, beforeHash: "b".repeat(64), afterHash: SHA, undo: { kind: "restore-hash", targetHash: "b".repeat(64) } }
    : { ...base, status, failureCode: "target-unavailable" }
}

describe("K1 closed authority, privacy, hash and scope contracts", () => {
  it("freezes closed authority/privacy classes and lowercase SHA-256", () => {
    expect(AuthorityClassSchema.options).toEqual([
      "observed", "deterministic-derived", "model-proposal", "teacher-attested",
    ])
    expect(PrivacyClassSchema.options).toEqual([
      "public", "operational", "pseudonymous", "didactic-sensitive", "raw-audio",
    ])
    expect(() => PrivacyClassSchema.parse("vendor-private")).toThrow()
    expect(EvidenceRefV2Schema.parse(evidence("ev-a")).contentHash).toBe(SHA)
    for (const contentHash of ["a".repeat(63), "a".repeat(65), "A".repeat(64), "g".repeat(64)]) {
      expect(() => EvidenceRefV2Schema.parse({ ...evidence("ev-a"), contentHash })).toThrow()
    }
    for (const key of ["locator", "contentHash", "scope"] as const) {
      const incomplete = { ...evidence("ev-a") }
      delete incomplete[key]
      expect(() => EvidenceRefV2Schema.parse(incomplete)).toThrow()
    }
    for (const locator of ["javascript:alert(1)", "https://example.invalid", { kind: "unknown", id: "x" }]) {
      expect(() => EvidenceRefV2Schema.parse({ ...evidence("ev-a"), locator })).toThrow()
    }
  })

  it("requires every full-scope field and compares partition separately from full scope", () => {
    const valid = scope()
    expect(TeachingScopeV1Schema.parse(valid)).toEqual(valid)
    for (const key of ["workspaceId", "audienceSpaceId", "lessonId", "boardId"] as const) {
      const missing = { ...valid }
      delete missing[key]
      expect(() => TeachingScopeV1Schema.parse(missing)).toThrow()
    }
    expect(samePartition(valid, scope({ lessonId: "lesson-b", boardId: "board-b" }))).toBe(true)
    expect(samePartition(valid, scope({ audienceSpaceId: "audience-b" }))).toBe(false)
    expect(sameFullScope(valid, { ...valid })).toBe(true)
    expect(sameFullScope(valid, scope({ pathId: undefined }))).toBe(false)
  })

  it("accepts explicit multi-lesson evidence only inside one workspace+audience partition", () => {
    const multi = context([
      evidence("ev-a", scope()),
      evidence("ev-b", scope({ lessonId: "lesson-b", boardId: "board-b", pathId: "path-b" })),
    ])
    expect(ContextManifestV1Schema.parse(multi).evidence).toHaveLength(2)
    for (const mismatch of [
      scope({ workspaceId: "workspace-b", lessonId: "lesson-b", boardId: "board-b" }),
      scope({ audienceSpaceId: "audience-b", lessonId: "lesson-b", boardId: "board-b" }),
    ]) {
      expect(() => ContextManifestV1Schema.parse(context([evidence("ev-a"), evidence("ev-b", mismatch)]))).toThrow()
    }
    expect(() => ContextManifestV1Schema.parse(context([evidence("ev-a"), evidence("ev-a")]))).toThrow()
    expect(() => ContextManifestV1Schema.parse({ ...context(), selectors: [{ kind: "teaching-scope", scope: scope({ workspaceId: "workspace-b" }) }] })).toThrow()
    expect(() => ContextManifestV1Schema.parse({ ...context(), selectors: [{ kind: "evidence-id", evidenceId: "ev-missing" }] })).toThrow()
  })
})

describe("K1 producer boundary and hardened intake", () => {
  it("allows only producer-owned non-authoritative fields", () => {
    expect(ProducerObservationInputV1Schema.parse(producerInput()).kind).toBe("board.stroke.recorded")
    for (const [key, value] of Object.entries({
      eventId: UUID.event,
      producer: { producerId: "plugin", producerKind: "plugin" },
      scope: scope(),
      privacy: "lesson-content",
      authority: "observed",
      recordedAt: "2026-07-15T08:00:01.000Z",
      consent: { status: "granted", receiptId: UUID.receipt },
      contentHash: SHA,
      partitionSeq: 1,
    })) {
      expect(() => ProducerObservationInputV1Schema.parse({ ...producerInput(), [key]: value })).toThrow()
    }
    expect(() => ProducerObservationInputV1Schema.parse({ ...producerInput(), extra: true })).toThrow()
    expect(() => ProducerObservationInputV1Schema.parse({ ...producerInput(), evidenceCandidates: [{ candidateRef: "x", kind: "board-element", extra: true }] })).toThrow()
  })

  it("snapshots descriptor data once and never throws on hostile object graphs", () => {
    expect(parseProducerObservationInputV1(producerInput())).toEqual(producerInput())
    const topProto = JSON.parse(`${JSON.stringify(producerInput()).slice(0, -1)},"__proto__":{}}`)
    const nestedProto = { ...producerInput(), payload: JSON.parse('{"__proto__":{}}') }
    const nestedConstructor = { ...producerInput(), payload: { safe: { constructor: "blocked" } } }
    const nestedPrototype = { ...producerInput(), payload: { safe: { prototype: "blocked" } } }
    const getter = { ...producerInput(), get kind(): string { throw new Error("boom") } }
    const proxy = new Proxy(producerInput(), { ownKeys() { throw new Error("trap") } })
    const cycle = producerInput() as ReturnType<typeof producerInput> & { self?: unknown }
    cycle.self = cycle
    const symbol = { ...producerInput(), [Symbol("hidden")]: true }
    const deep = producerInput()
    deep.payload = {}
    let cursor = deep.payload as Record<string, unknown>
    for (let i = 0; i <= KERNEL_INTAKE_LIMITS.maxDepth; i += 1) {
      cursor.next = {}
      cursor = cursor.next as Record<string, unknown>
    }
    const oversized = { ...producerInput(), payload: { values: Array(KERNEL_INTAKE_LIMITS.maxArrayLength + 1).fill(0) } }
    const longString = { ...producerInput(), payload: "x".repeat(KERNEL_INTAKE_LIMITS.maxStringLength + 1) }
    const manyStrings = { ...producerInput(), payload: { values: Array(120).fill("é".repeat(150)) } }
    const longKey = { ...producerInput(), payload: { ["k".repeat(KERNEL_INTAKE_LIMITS.maxObjectKeyLength + 1)]: true } }
    const undefinedAccessor = producerInput()
    Object.defineProperty(undefinedAccessor, "kind", {
      get: undefined, set: undefined, enumerable: true, configurable: true,
    })
    const overNodeBudget = {
      ...producerInput(),
      payload: Array.from({ length: KERNEL_INTAKE_LIMITS.maxArrayLength }, () => Array(16).fill(0)),
    }
    for (const raw of [topProto, nestedProto, nestedConstructor, nestedPrototype, getter, proxy, cycle, symbol, { ...producerInput(), payload: { n: Infinity } }, deep, oversized, longString, manyStrings, longKey, undefinedAccessor, overNodeBudget]) {
      expect(() => parseProducerObservationInputV1(raw)).not.toThrow()
      expect(parseProducerObservationInputV1(raw)).toBeNull()
    }
  })

  it("rejects oversized containers before materializing their descriptors", () => {
    let largeArrayOwnKeys = 0
    let largeArrayDescriptorReads = 0
    const largeArray = new Proxy(Array(KERNEL_INTAKE_LIMITS.maxArrayLength + 1).fill(0), {
      ownKeys(target) { largeArrayOwnKeys += 1; return Reflect.ownKeys(target) },
      getOwnPropertyDescriptor(target, key) { largeArrayDescriptorReads += 1; return Reflect.getOwnPropertyDescriptor(target, key) },
    })
    expect(parseProducerObservationInputV1({ ...producerInput(), payload: largeArray })).toBeNull()
    expect(largeArrayOwnKeys).toBe(0)
    expect(largeArrayDescriptorReads).toBe(1)

    let largeObjectOwnKeys = 0
    let largeObjectDescriptorReads = 0
    const largeObject = new Proxy(
      Object.fromEntries(Array.from({ length: KERNEL_INTAKE_LIMITS.maxObjectKeys + 1 }, (_, index) => [`key-${index}`, index])),
      {
        ownKeys(target) { largeObjectOwnKeys += 1; return Reflect.ownKeys(target) },
        getOwnPropertyDescriptor(target, key) { largeObjectDescriptorReads += 1; return Reflect.getOwnPropertyDescriptor(target, key) },
      },
    )
    expect(parseProducerObservationInputV1({ ...producerInput(), payload: largeObject })).toBeNull()
    expect(largeObjectOwnKeys).toBe(1)
    expect(largeObjectDescriptorReads).toBe(0)
  })
})

describe("K1 host envelopes, citations, decisions and receipts", () => {
  it("host-stamps required observation fields and literal observed authority", () => {
    expect(ObservationEnvelopeV1Schema.parse(observation()).eventId).toBe(UUID.event)
    for (const key of ["schemaVersion", "eventId", "occurredAt", "recordedAt", "sourceIdempotencyKey"] as const) {
      const missing = { ...observation() }
      delete missing[key]
      expect(() => ObservationEnvelopeV1Schema.parse(missing)).toThrow()
    }
    expect(() => ObservationEnvelopeV1Schema.parse({ ...observation(), authority: "teacher-attested" })).toThrow()
    expect(() => ObservationEnvelopeV1Schema.parse({ ...observation(), producer: { producerId: "model", producerKind: "model-adapter" } })).toThrow()
    expect(() => ObservationEnvelopeV1Schema.parse({ ...observation(), partitionSeq: 1 })).toThrow()
    expect(() => ProducerObservationInputV1Schema.parse({ ...producerInput(), sourceIdempotencyKey: "injected" })).toThrow()
    expect(() => ObservationEnvelopeV1Schema.parse({ ...observation(), privacy: "raw-audio" })).toThrow()
    expect(() => ObservationEnvelopeV1Schema.parse({ ...observation(), privacy: "raw-audio", consent: { status: "granted", receiptId: UUID.receipt } })).not.toThrow()
    for (const targetScope of [
      scope({ lessonId: "lesson-b" }),
      scope({ boardId: "board-b" }),
      scope({ pathId: "path-b" }),
      scope({ meetingId: "meeting-b" }),
    ]) {
      expect(() => ObservationEnvelopeV1Schema.parse({ ...observation(), evidence: [evidence("ev-a", targetScope)] })).toThrow()
    }
  })

  it("binds model proposals to same-partition manifests and in-manifest citations", () => {
    expect(ProposalEnvelopeV1Schema.parse(proposal()).authority).toBe("model-proposal")
    expect(() => ProposalEnvelopeV1Schema.parse({ ...proposal(), authority: "observed" })).toThrow()
    for (const producerKind of ["host", "plugin", "import"]) {
      expect(() => ProposalEnvelopeV1Schema.parse({ ...proposal(), producer: { producerId: "not-model", producerKind } })).toThrow()
    }
    expect(() => ProposalEnvelopeV1Schema.parse({ ...proposal(), contextManifestHash: "short" })).toThrow()
    expectInvalidProposalItems([{ itemId: "claim-a", itemType: "factual-claim", claim: {}, evidenceIds: [] }])
    expectInvalidProposalItems([{ itemId: "claim-a", itemType: "factual-claim", claim: {}, evidenceIds: ["ev-missing"] }])
    expectInvalidProposalItems([{ itemId: "claim-a", itemType: "factual-claim", claim: {}, evidenceIds: ["ev-a", "ev-a"] }])
    expectInvalidProposalItems([proposal().items[0], proposal().items[0]])
    for (const items of [
      [{ itemId: "action-a", itemType: "action", actionKind: "create-exercise", parameters: {} }],
      [{ itemId: "action-a", itemType: "action", actionKind: "create-exercise", parameters: {}, evidenceIds: ["ev-a", "ev-a"] }],
      [{ itemId: "action-a", itemType: "action", actionKind: "create-exercise", parameters: {}, evidenceIds: ["ev-missing"] }],
      [{ itemId: "claim-a", itemType: "factual-claim", claim: { statements: ["one", "two"] }, evidenceIds: ["ev-a"] }],
    ]) expectInvalidProposalItems(items)
    expect(() => ProposalEnvelopeV1Schema.parse({ ...proposal(), usage: { ...proposal().usage, costMicrounits: 1 } })).toThrow()
    for (const field of ["inputTokens", "outputTokens", "costUsdMicros"] as const) {
      expect(() => ProposalEnvelopeV1Schema.parse({
        ...proposal(), usage: { ...proposal().usage, [field]: Number.MAX_SAFE_INTEGER + 1 },
      })).toThrow()
    }
    expect(() => ProposalEnvelopeV1Schema.parse({ ...proposal(), scope: scope({ audienceSpaceId: "audience-b" }) })).toThrow()
    expect(() => ProposalEnvelopeV1Schema.parse({ ...proposal(), scope: scope({ workspaceId: "workspace-b" }) })).toThrow()
    for (const missing of ["providerId", "modelId", "promptVersion", "outputSchemaVersion", "runId", "consent", "uncertainty", "usage"] as const) {
      const invalid = { ...proposal() }
      delete invalid[missing]
      expect(() => ProposalEnvelopeV1Schema.parse(invalid)).toThrow()
    }
  })

  it("keeps six teacher actions exclusive; only attest yields teacher-attested", () => {
    const variants = [
      { ...decisionBase, action: "accept" },
      { ...decisionBase, action: "edit", editedPayload: { title: "Edited" } },
      { ...decisionBase, action: "reject", reasonCode: "not-grounded" },
      { ...decisionBase, action: "attest", assertionHash: SHA, resultAuthority: "teacher-attested" },
      { ...decisionBase, action: "publish", artifactId: "artifact-a" },
      { ...decisionBase, action: "apply", commandId: UUID.command },
    ]
    for (const variant of variants) expect(TeacherDecisionV1Schema.parse(variant).action).toBe(variant.action)
    expect(() => TeacherDecisionV1Schema.parse({ ...variants[0], assertionHash: SHA })).toThrow()
    expect(() => TeacherDecisionV1Schema.parse({ ...variants[0], resultAuthority: "teacher-attested" })).toThrow()
    expect(() => TeacherDecisionV1Schema.parse({ ...variants[3], resultAuthority: "observed" })).toThrow()
    expect(() => TeacherDecisionV1Schema.parse({ ...variants[5], artifactId: "artifact-a" })).toThrow()
  })

  it("binds nonempty unique decision itemIds and evidenceIds to the exact proposal", () => {
    const valid = { decision: { ...decisionBase, action: "accept" }, proposal: proposal() }
    expect(TeacherDecisionProposalBindingV1Schema.parse(valid).decision.source.itemIds).toEqual(["claim-a"])
    for (const source of [
      { ...decisionSource, itemIds: [] },
      { ...decisionSource, itemIds: ["claim-a", "claim-a"] },
      { ...decisionSource, itemIds: ["item-missing"] },
      { ...decisionSource, evidenceIds: ["ev-a", "ev-a"] },
      { ...decisionSource, evidenceIds: ["ev-missing"] },
    ]) {
      expect(() => TeacherDecisionProposalBindingV1Schema.parse({ ...valid, decision: { ...valid.decision, source } })).toThrow()
    }
    expect(() => TeacherDecisionProposalBindingV1Schema.parse({ ...valid,
      decision: { ...valid.decision, source: { ...decisionSource, proposalId: UUID.event } },
    })).toThrow()
    for (const decisionScope of [
      scope({ audienceSpaceId: "audience-b" }),
      scope({ lessonId: "lesson-b" }),
      scope({ boardId: "board-b" }),
    ]) {
      expect(() => TeacherDecisionProposalBindingV1Schema.parse({
        ...valid, decision: { ...valid.decision, scope: decisionScope },
      })).toThrow()
    }
  })

  it("records applied/failed outcomes without authorizing and requires exact full scope", () => {
    expect(CommandReceiptV1Schema.parse(receipt("applied")).status).toBe("applied")
    expect(CommandReceiptV1Schema.parse(receipt("failed")).status).toBe("failed")
    expect(() => CommandReceiptV1Schema.parse({ ...receipt("applied"), failureCode: "x" })).toThrow()
    for (const contamination of [{ beforeHash: SHA }, { afterHash: SHA }, { undo: { kind: "restore-hash", targetHash: SHA } }]) {
      expect(() => CommandReceiptV1Schema.parse({ ...receipt("failed"), ...contamination })).toThrow()
    }
    expect(() => CommandReceiptV1Schema.parse({ ...receipt("applied"), undo: { kind: "restore-hash", targetHash: SHA } })).toThrow()
    expect(() => CommandReceiptV1Schema.parse({ ...receipt("applied"), authorized: true })).toThrow()
    expect(() => CommandReceiptV1Schema.parse({ ...receipt("applied"), targetScope: scope({ meetingId: undefined }) })).toThrow()
  })

  it("keeps K1 contracts free of provider/vendor imports", () => {
    const contractsDir = fileURLToPath(new URL("../core/contracts/", import.meta.url))
    for (const name of ["kernel.ts", "kernelIntake.ts"]) {
      const source = readFileSync(`${contractsDir}${name}`, "utf8")
      expect(source).not.toMatch(/from\s+["'][^"']*(openai|anthropic|google|posthog|sentry|vercel|render)/i)
    }
    const intakeSource = readFileSync(`${contractsDir}kernelIntake.ts`, "utf8")
    expect(intakeSource).not.toContain("Object.getOwnPropertyDescriptors")
    expect(intakeSource).toContain('Object.hasOwn(descriptor, "value")')
  })
})
