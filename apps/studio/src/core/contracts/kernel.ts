import { z } from "zod"

const NON_EMPTY_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/
const SHA256 = /^[0-9a-f]{64}$/

const IdSchema = z.string().min(1).max(128).regex(NON_EMPTY_ID)
const UuidSchema = z.string().uuid()
const TimestampSchema = z.string().datetime({ offset: true })
const Sha256Schema = z.string().regex(SHA256)
const JsonValueSchema = z.json()
const SafeCounterSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)

export const AuthorityClassSchema = z.enum([
  "observed",
  "deterministic-derived",
  "model-proposal",
  "teacher-attested",
])
export type AuthorityClass = z.infer<typeof AuthorityClassSchema>

// Technical handling only. This does not decide policy, consent or controller ownership.
export const PrivacyClassSchema = z.enum([
  "public",
  "operational",
  "pseudonymous",
  "didactic-sensitive",
  "raw-audio",
])
export type PrivacyClass = z.infer<typeof PrivacyClassSchema>

export const TeachingScopeV1Schema = z.strictObject({
  workspaceId: IdSchema,
  audienceSpaceId: IdSchema,
  lessonId: IdSchema,
  boardId: IdSchema,
  pathId: IdSchema.optional(),
  meetingId: IdSchema.optional(),
})
export type TeachingScopeV1 = z.infer<typeof TeachingScopeV1Schema>

export function samePartition(left: TeachingScopeV1, right: TeachingScopeV1): boolean {
  return left.workspaceId === right.workspaceId
    && left.audienceSpaceId === right.audienceSpaceId
}

export function sameFullScope(left: TeachingScopeV1, right: TeachingScopeV1): boolean {
  return samePartition(left, right)
    && left.lessonId === right.lessonId
    && left.boardId === right.boardId
    && left.pathId === right.pathId
    && left.meetingId === right.meetingId
}

const EvidenceLocatorV1Schema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("manual"), manualId: IdSchema, page: z.number().int().min(1) }),
  z.strictObject({ kind: z.literal("board-element"), boardElementId: IdSchema }),
  z.strictObject({ kind: z.literal("document"), documentHash: Sha256Schema }),
  z.strictObject({ kind: z.literal("lesson-event"), eventId: UuidSchema }),
  z.strictObject({ kind: z.literal("plugin-output"), pluginId: IdSchema, outputId: IdSchema }),
])

export const EvidenceRefV2Schema = z.strictObject({
  evidenceId: IdSchema,
  locator: EvidenceLocatorV1Schema,
  contentHash: Sha256Schema,
  scope: TeachingScopeV1Schema,
  privacy: PrivacyClassSchema,
})
export type EvidenceRefV2 = z.infer<typeof EvidenceRefV2Schema>

const ContextEvidenceSelectionV1Schema = z.strictObject({
  ref: EvidenceRefV2Schema,
  selectionReason: z.enum(["direct-citation", "scope-retrieval", "teacher-selected", "deterministic-link"]),
})

const ContextSelectorV1Schema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("teaching-scope"), scope: TeachingScopeV1Schema }),
  z.strictObject({ kind: z.literal("evidence-id"), evidenceId: IdSchema }),
])

export const ContextManifestV1Schema = z
  .strictObject({
    schemaVersion: z.literal(1),
    manifestId: UuidSchema,
    retrieverVersion: IdSchema,
    contextScope: TeachingScopeV1Schema,
    selectors: z.array(ContextSelectorV1Schema).min(1).max(100),
    evidence: z.array(ContextEvidenceSelectionV1Schema).min(1).max(100),
  })
  .superRefine((manifest, context) => {
    const ids = new Set<string>()
    for (const selection of manifest.evidence) {
      if (!samePartition(manifest.contextScope, selection.ref.scope)) {
        context.addIssue({
          code: "custom",
          path: ["evidence"],
          message: "evidence must stay inside the manifest partition",
        })
      }
      if (ids.has(selection.ref.evidenceId)) {
        context.addIssue({
          code: "custom",
          path: ["evidence"],
          message: "evidenceId must be unique inside a manifest",
        })
      }
      ids.add(selection.ref.evidenceId)
    }
    manifest.selectors.forEach((selector, index) => {
      if (selector.kind === "teaching-scope" && !samePartition(manifest.contextScope, selector.scope)) {
        context.addIssue({ code: "custom", path: ["selectors", index, "scope"], message: "selector must stay inside the manifest partition" })
      }
      if (selector.kind === "evidence-id" && !ids.has(selector.evidenceId)) {
        context.addIssue({ code: "custom", path: ["selectors", index, "evidenceId"], message: "evidence selector must resolve inside the manifest" })
      }
    })
  })
export type ContextManifestV1 = z.infer<typeof ContextManifestV1Schema>

const EvidenceCandidateV1Schema = z.strictObject({
  candidateRef: z.string().min(1).max(2048),
  kind: IdSchema,
})

export const ProducerObservationInputV1Schema = z.strictObject({
  clientEventId: z.string().min(1).max(128).optional(),
  idempotencyHint: z.string().min(1).max(128).optional(),
  occurredAt: TimestampSchema,
  kind: IdSchema,
  payload: JsonValueSchema,
  evidenceCandidates: z.array(EvidenceCandidateV1Schema).max(100),
})
export type ProducerObservationInputV1 = z.infer<typeof ProducerObservationInputV1Schema>

const ObservedProducerIdentityV1Schema = z.strictObject({
  producerId: IdSchema,
  producerKind: z.enum(["host", "plugin", "import"]),
})

const ModelProducerIdentityV1Schema = z.strictObject({
  producerId: IdSchema,
  producerKind: z.literal("model-adapter"),
})

const ConsentV1Schema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("not-required") }),
  z.strictObject({ status: z.literal("granted"), receiptId: UuidSchema }),
])

export const ObservationEnvelopeV1Schema = z
  .strictObject({
    schemaVersion: z.literal(1),
    eventId: UuidSchema,
    producer: ObservedProducerIdentityV1Schema,
    scope: TeachingScopeV1Schema,
    privacy: PrivacyClassSchema,
    authority: z.literal("observed"),
    occurredAt: TimestampSchema,
    recordedAt: TimestampSchema,
    kind: IdSchema,
    payload: JsonValueSchema,
    evidence: z.array(EvidenceRefV2Schema).max(100),
    consent: ConsentV1Schema,
    contentHash: Sha256Schema,
    sourceIdempotencyKey: IdSchema,
  })
  .superRefine((observation, context) => {
    observation.evidence.forEach((evidence, index) => {
      if (!sameFullScope(observation.scope, evidence.scope)) {
        context.addIssue({
          code: "custom",
          path: ["evidence", index, "scope"],
          message: "observation evidence must match the full observation scope",
        })
      }
    })
    if (observation.privacy === "raw-audio" && observation.consent.status !== "granted") {
      context.addIssue({
        code: "custom",
        path: ["consent"],
        message: "raw audio requires a granted consent receipt",
      })
    }
  })
export type ObservationEnvelopeV1 = z.infer<typeof ObservationEnvelopeV1Schema>

const ProposalItemV1Schema = z.discriminatedUnion("itemType", [
  z.strictObject({
    itemId: IdSchema,
    itemType: z.literal("factual-claim"),
    claim: z.strictObject({
      subject: z.string().min(1).max(1_024),
      predicate: z.string().min(1).max(256),
      object: z.union([z.string().min(1).max(4_096), z.number().finite(), z.boolean()]),
    }),
    evidenceIds: z.array(IdSchema).min(1).max(100),
  }),
  z.strictObject({
    itemId: IdSchema,
    itemType: z.literal("action"),
    actionKind: IdSchema,
    parameters: JsonValueSchema,
    evidenceIds: z.array(IdSchema).min(1).max(100),
  }),
])

export const ProposalEnvelopeV1Schema = z
  .strictObject({
    schemaVersion: z.literal(1),
    proposalId: UuidSchema,
    producer: ModelProducerIdentityV1Schema,
    scope: TeachingScopeV1Schema,
    privacy: PrivacyClassSchema,
    authority: z.literal("model-proposal"),
    runId: UuidSchema,
    providerId: IdSchema,
    modelId: IdSchema,
    promptVersion: IdSchema,
    outputSchemaVersion: IdSchema,
    consent: ConsentV1Schema,
    uncertainty: z.strictObject({
      level: z.enum(["low", "medium", "high", "unknown"]),
      basis: z.enum(["model-reported", "eval-calibrated", "unknown"]),
    }),
    usage: z.strictObject({
      inputTokens: SafeCounterSchema,
      outputTokens: SafeCounterSchema,
      latencyMs: z.number().finite().min(0),
      costUsdMicros: SafeCounterSchema,
    }),
    createdAt: TimestampSchema,
    kind: IdSchema,
    context: ContextManifestV1Schema,
    contextManifestHash: Sha256Schema,
    items: z.array(ProposalItemV1Schema).min(1).max(100),
  })
  .superRefine((proposal, context) => {
    if (!samePartition(proposal.scope, proposal.context.contextScope)) {
      context.addIssue({
        code: "custom",
        path: ["context", "contextScope"],
        message: "proposal and context must share a partition",
      })
    }
    const available = new Set(proposal.context.evidence.map((item) => item.ref.evidenceId))
    const itemIds = new Set<string>()
    proposal.items.forEach((item, itemIndex) => {
      if (itemIds.has(item.itemId)) {
        context.addIssue({ code: "custom", path: ["items", itemIndex, "itemId"], message: "proposal itemId must be unique" })
      }
      itemIds.add(item.itemId)
      const seenEvidence = new Set<string>()
      for (const [evidenceIndex, evidenceId] of item.evidenceIds.entries()) {
        if (!available.has(evidenceId)) {
          context.addIssue({ code: "custom", path: ["items", itemIndex, "evidenceIds", evidenceIndex], message: "item evidence is not in the context manifest" })
        }
        if (seenEvidence.has(evidenceId)) {
          context.addIssue({ code: "custom", path: ["items", itemIndex, "evidenceIds", evidenceIndex], message: "item evidence must be unique" })
        }
        seenEvidence.add(evidenceId)
      }
    })
  })
export type ProposalEnvelopeV1 = z.infer<typeof ProposalEnvelopeV1Schema>

function uniqueIds(message: string) {
  return z.array(IdSchema).min(1).max(100).superRefine((ids, context) => {
    const seen = new Set<string>()
    ids.forEach((id, index) => {
      if (seen.has(id)) context.addIssue({ code: "custom", path: [index], message })
      seen.add(id)
    })
  })
}

const DecisionSourceV1Schema = z.strictObject({
  proposalId: UuidSchema,
  itemIds: uniqueIds("decision itemId must be unique"),
  evidenceIds: uniqueIds("decision evidenceId must be unique"),
})

const decisionShape = {
  schemaVersion: z.literal(1),
  decisionId: UuidSchema,
  teacherId: IdSchema,
  scope: TeachingScopeV1Schema,
  decidedAt: TimestampSchema,
  source: DecisionSourceV1Schema,
}

export const TeacherDecisionV1Schema = z.discriminatedUnion("action", [
  z.strictObject({ ...decisionShape, action: z.literal("accept") }),
  z.strictObject({ ...decisionShape, action: z.literal("edit"), editedPayload: JsonValueSchema }),
  z.strictObject({ ...decisionShape, action: z.literal("reject"), reasonCode: IdSchema }),
  z.strictObject({
    ...decisionShape,
    action: z.literal("attest"),
    assertionHash: Sha256Schema,
    resultAuthority: z.literal("teacher-attested"),
  }),
  z.strictObject({ ...decisionShape, action: z.literal("publish"), artifactId: IdSchema }),
  z.strictObject({ ...decisionShape, action: z.literal("apply"), commandId: UuidSchema }),
])
export type TeacherDecisionV1 = z.infer<typeof TeacherDecisionV1Schema>

export const TeacherDecisionProposalBindingV1Schema = z
  .strictObject({
    decision: TeacherDecisionV1Schema,
    proposal: ProposalEnvelopeV1Schema,
  })
  .superRefine(({ decision, proposal }, context) => {
    if (!sameFullScope(decision.scope, proposal.scope)) {
      context.addIssue({ code: "custom", path: ["decision", "scope"], message: "decision and proposal must share the full scope" })
    }
    if (decision.source.proposalId !== proposal.proposalId) {
      context.addIssue({ code: "custom", path: ["decision", "source", "proposalId"], message: "decision must bind the exact proposal" })
    }
    const proposalItems = new Map(proposal.items.map((item) => [item.itemId, item]))
    const manifestEvidence = new Set(proposal.context.evidence.map((selection) => selection.ref.evidenceId))
    const selectedEvidence = new Set(decision.source.evidenceIds)
    decision.source.itemIds.forEach((itemId, index) => {
      const item = proposalItems.get(itemId)
      if (item === undefined) {
        context.addIssue({ code: "custom", path: ["decision", "source", "itemIds", index], message: "decision item is not in the proposal" })
        return
      }
      item.evidenceIds.forEach((evidenceId) => {
        if (!selectedEvidence.has(evidenceId)) {
          context.addIssue({ code: "custom", path: ["decision", "source", "evidenceIds"], message: "decision must retain evidence for every selected item" })
        }
      })
    })
    decision.source.evidenceIds.forEach((evidenceId, index) => {
      if (!manifestEvidence.has(evidenceId)) {
        context.addIssue({ code: "custom", path: ["decision", "source", "evidenceIds", index], message: "decision evidence is not in the proposal manifest" })
      }
    })
  })
export type TeacherDecisionProposalBindingV1 = z.infer<typeof TeacherDecisionProposalBindingV1Schema>

const receiptShape = {
  schemaVersion: z.literal(1),
  receiptId: UuidSchema,
  commandId: UuidSchema,
  decisionId: UuidSchema,
  authority: z.literal("deterministic-derived"),
  action: z.enum(["publish", "apply"]),
  commandScope: TeachingScopeV1Schema,
  targetScope: TeachingScopeV1Schema,
  recordedAt: TimestampSchema,
}

export const CommandReceiptV1Schema = z
  .discriminatedUnion("status", [
    z.strictObject({
      ...receiptShape,
      status: z.literal("applied"),
      beforeHash: Sha256Schema,
      afterHash: Sha256Schema,
      undo: z.strictObject({ kind: z.literal("restore-hash"), targetHash: Sha256Schema }),
    }),
    z.strictObject({ ...receiptShape, status: z.literal("failed"), failureCode: IdSchema }),
  ])
  .superRefine((receipt, context) => {
    if (!sameFullScope(receipt.commandScope, receipt.targetScope)) {
      context.addIssue({
        code: "custom",
        path: ["targetScope"],
        message: "receipt target must match the full command scope",
      })
    }
    if (receipt.status === "applied" && receipt.undo.targetHash !== receipt.beforeHash) {
      context.addIssue({
        code: "custom",
        path: ["undo", "targetHash"],
        message: "undo must restore the recorded beforeHash",
      })
    }
  })
export type CommandReceiptV1 = z.infer<typeof CommandReceiptV1Schema>
