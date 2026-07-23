// ARDESIA Studio — ARD-06 Continuità: read model NUOVA e stretta.
//
// Questo modulo è puro: nessun I/O, nessun clock, nessun DOM, nessuna rete.
// Lo stesso snapshot deve produrre byte JSON identici (design §6).
//
// NON importa TeacherDashboardView né projectTeacherDashboard: la Continuità
// Founder non è il cruscotto storico filtrato, è una projection separata
// (design §1, §13).
//
// I tipi sotto sono estratti verbatim dalle sezioni congelate §5.1, §5.4 e §6
// del design, non ritrascritti: una trascrizione manuale di ~240 righe è una
// fonte di errori silenziosi.

import type { JsonObject } from "../core/contracts/eventEnvelope"
import type { AppendedEventEnvelopeV2 } from "./eventlog"
import type { JournalEnvelopeV2 } from "../store/JournalRecorder"
import type { SessionYamlV2 } from "../store/sessionState"
import { validateRoomId } from "../store/roomPaths"

// --- Tipi normativi: design §5.1, §5.4, §6 ---

export type ContinuityScopeV1 = Readonly<{
  lessonId: string
  roomId: string
  sessionId: string
}>

export type ContinuitySourceNameV1 =
  | "session"
  | "event-union"
  | "lesson-event-log"
  | "journal"
  | "scene"
  | "plugin-artifact"
  | "build"

export type ContinuitySourceIssueV1 = Readonly<{
  source: ContinuitySourceNameV1
  severity: "degraded" | "corrupt"
  code:
    | "unavailable"
    | "data-loss"
    | "missing"
    | "invalid-schema"
    | "scope-violation"
    | "duplicate-event-id"
    | "legacy-recovery-required"
    | "multiple-simulation-instances"
    | "unsupported-event-contract"
    | "digest-mismatch"
  preserved: null | Readonly<{ path: string; sha256: string; bytes: number }>
}>

export type ScopedContinuitySnapshotV1 = Readonly<{
  scope: ContinuityScopeV1
  session: null | Readonly<{ document: SessionYamlV2; sha256: string }>
  lessonEvents: readonly AppendedEventEnvelopeV2[]
  journalEvents: readonly Readonly<{
    line: number
    envelope: JournalEnvelopeV2
  }>[]
  scene: null | Readonly<{
    sha256: string
    elements: readonly JsonObject[]
    simulationEmbeds: readonly Readonly<{
      instanceId: string
      pluginId: string
      sceneDigest: string | null
    }>[]
  }>
  buildCommitSha: string | null
  /** Key esatto `${eventId}:${evidenceIndex}`; una ref ripetuta non collassa. */
  evidenceByOccurrence: ReadonlyMap<string, ContinuityEvidenceV1>
  issues: readonly ContinuitySourceIssueV1[]
}>

export type ContinuityEvidenceTargetV1 =
  | Readonly<{
      kind: "board-element"
      lessonId: string
      elementId: string
      href: string
    }>
  | Readonly<{
      kind: "manual-page"
      lessonId: string
      manualId: string
      page: number
      documentId: string
      href: string
    }>
  | Readonly<{
      kind: "lesson-event"
      lessonId: string
      sessionId: string
      eventId: string
      href: string
    }>
  | Readonly<{
      kind: "simulation-instance"
      lessonId: string
      instanceId: string
      sceneDigest: string
      href: string
    }>
  | Readonly<{
      kind: "plugin-artifact"
      pluginId: string
      sha256: string
      href: string
    }>
  | Readonly<{
      kind: "build"
      commitSha: string
      href: string
    }>

export type ContinuityEvidenceReasonV1 =
  | "declared-missing"
  | "invalid-ref"
  | "unsupported-namespace"
  | "target-not-found"
  | "target-out-of-scope"
  | "handler-unavailable"
  | "digest-mismatch"
  | "producer-mismatch"
  | "artifact-unverified"
  | "build-unverified"

export type ContinuityEvidenceV1 = Readonly<{
  occurrenceId: string
  eventId: string
  evidenceIndex: number
  ref: string
  declared: "verified" | "missing"
  status: "resolved" | "missing" | "unsupported" | "scope-mismatch"
  target: ContinuityEvidenceTargetV1 | null
  reason: ContinuityEvidenceReasonV1 | null
}>

export type ContinuityOpenLoopV1 = Readonly<{
  errorId: string
  conceptId: string
  label: Readonly<Record<string, string>>
  openedAt: string
  lastObservedAt: string
  observedCount: number
  evidence: readonly ContinuityEvidenceV1[]
}>

export type ContinuityMaterialV1 = Readonly<{
  materialId: string
  label: Readonly<Record<string, string>>
  eventId: string
  lastCitedAt: string
  evidence: readonly ContinuityEvidenceV1[]
}>

export type ContinuitySimulationResultV1 = Readonly<{
  eventId: string
  occurredAt: string
  pluginId: "io.ardesia.simulation"
  pluginVersion: string
  instanceId: string
  experimentId: string
  sceneDigest: string
  currentMa: number
  bookLayoutValid: boolean
  producerCommitSha: string
  evidence: readonly ContinuityEvidenceV1[]
}>

export type ContinuitySimulationErrorV1 = Readonly<{
  eventId: string
  occurredAt: string
  errorId: string
  conceptId: string
  label: Readonly<Record<string, string>>
  instanceId: string
  sceneDigest: string
  evidence: readonly ContinuityEvidenceV1[]
}>

export type ContinuitySimulationInstanceV1 = Readonly<{
  pluginId: "io.ardesia.simulation"
  pluginVersion: string
  instanceId: string
  mountedAt: string
  sceneDigest: string
  lastActivityAt: string
}>

export type ContinuitySimulationEvidenceBlockV1 =
  | Readonly<{
      kind: "result"
      eventId: string
      evidence: readonly [ContinuityEvidenceV1, ...ContinuityEvidenceV1[]]
    }>
  | Readonly<{
      kind: "error"
      error: ContinuitySimulationErrorV1
      evidence: readonly [ContinuityEvidenceV1, ...ContinuityEvidenceV1[]]
    }>

export type ContinuitySimulationStateV1 =
  | Readonly<{
      status: "not-mounted"
      instance: null
      openError: null
      evidenceBlock: null
    }>
  | Readonly<{
      status: "ready"
      instance: ContinuitySimulationInstanceV1
      openError: null
      evidenceBlock: null
    }>
  | Readonly<{
      status: "error-open"
      instance: ContinuitySimulationInstanceV1
      openError: ContinuitySimulationErrorV1
      evidenceBlock: null
    }>
  | Readonly<{
      status: "missing-evidence"
      instance: ContinuitySimulationInstanceV1
      openError: null
      evidenceBlock: ContinuitySimulationEvidenceBlockV1
    }>
  | Readonly<{
      status: "unavailable"
      instance: null
      openError: null
      evidenceBlock: null
      reason:
        | "event-contract-legacy"
        | "mount-receipt-missing"
        | "scene-missing"
        | "instance-mismatch"
        | "multiple-instances"
        | "digest-mismatch"
        | "source-unavailable"
        | "source-corrupt"
    }>

export type ContinuityRecoveryReasonV1 =
  | Readonly<{
      kind: "source"
      source: ContinuitySourceNameV1
      severity: ContinuitySourceIssueV1["severity"]
      code: ContinuitySourceIssueV1["code"]
      preserved: ContinuitySourceIssueV1["preserved"]
    }>
  | Readonly<{
      kind: "evidence"
      occurrenceId: string
      status: Exclude<ContinuityEvidenceV1["status"], "resolved">
    }>

export type ContinuityNextActionV1 =
  | Readonly<{
      kind: "recover-continuity"
      priority: 0
      reason: ContinuityRecoveryReasonV1
      href: string
      evidence: readonly ContinuityEvidenceV1[]
    }>
  | Readonly<{
      kind: "fix-simulation-error"
      priority: 1
      errorId: string
      instanceId: string
      href: string
      evidence: readonly ContinuityEvidenceV1[]
    }>
  | Readonly<{
      kind: "resume-open-loop"
      priority: 2
      errorId: string
      href: string
      evidence: readonly ContinuityEvidenceV1[]
    }>
  | Readonly<{
      kind: "open-current-material"
      priority: 3
      materialId: string
      href: string
      evidence: readonly ContinuityEvidenceV1[]
    }>
  | Readonly<{
      kind: "reopen-lesson"
      priority: 4
      href: string
      evidence: readonly []
    }>

export type ContinuityProjectionV1 = Readonly<{
  v: 1
  identity: ContinuityScopeV1
  phase: "empty" | "ready" | "missing-evidence" | "degraded" | "corrupt"
  sourceHealth: Readonly<{
    status: "verified" | "degraded" | "corrupt"
    issues: readonly ContinuitySourceIssueV1[]
  }>
  session: null | Readonly<{
    created: number
    revision: number
  }>
  lastVerifiedResult: ContinuitySimulationResultV1 | null
  openLoops: readonly ContinuityOpenLoopV1[]
  lastUncorrectedError: ContinuityOpenLoopV1 | null
  recentMaterials: readonly ContinuityMaterialV1[]
  simulation: ContinuitySimulationStateV1
  missingEvidence: readonly ContinuityEvidenceV1[]
  nextAction: ContinuityNextActionV1
}>

// --- Validazione dello scope: design §5.1 ---

const CANONICAL_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type ContinuityScopeErrorCode =
  | "invalid-lesson-id"
  | "invalid-room-id"
  | "room-lesson-mismatch"
  | "invalid-session-id"

export class ContinuityScopeError extends Error {
  readonly code: ContinuityScopeErrorCode
  constructor(code: ContinuityScopeErrorCode) {
    super(`Continuity scope: ${code}`)
    this.code = code
  }
}

/**
 * Valida la tripla PRIMA di qualunque I/O (design §5.1). Nessun default:
 * "current", ultimo globale, prima room o hash vuoto non esistono qui.
 */
export function validateContinuityScopeV1(input: {
  lessonId: unknown
  roomId: unknown
  sessionId: unknown
}): ContinuityScopeV1 {
  if (typeof input.lessonId !== "string") throw new ContinuityScopeError("invalid-lesson-id")
  if (typeof input.roomId !== "string") throw new ContinuityScopeError("invalid-room-id")
  if (typeof input.sessionId !== "string") throw new ContinuityScopeError("invalid-session-id")

  let lessonId: string
  try {
    lessonId = validateRoomId(input.lessonId)
  } catch {
    throw new ContinuityScopeError("invalid-lesson-id")
  }
  let roomId: string
  try {
    roomId = validateRoomId(input.roomId)
  } catch {
    throw new ContinuityScopeError("invalid-room-id")
  }
  // La room è alias di routing, non una terza identità (design §5.1 invariante 2).
  if (roomId !== lessonId) throw new ContinuityScopeError("room-lesson-mismatch")
  if (!CANONICAL_UUID_RE.test(input.sessionId)) {
    throw new ContinuityScopeError("invalid-session-id")
  }
  return Object.freeze({ lessonId, roomId, sessionId: input.sessionId })
}
