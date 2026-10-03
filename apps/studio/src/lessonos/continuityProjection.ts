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
    | "local-storage-non-authoritative"
    | "workspace-uninitialised"
    | "workspace-factory-rejected"
    | "fsa-handle-lost"
    | "read-rejected"
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
  // Cattura esattamente una volta, prima di qualunque validazione e di qualunque
  // I/O. Un input con getter puo' cambiare valore o lanciare fra una lettura e
  // l'altra: rileggendo, lo scope validato non sarebbe quello effettivamente
  // usato per leggere, e un input valido al primo accesso verrebbe rifiutato.
  let rawLessonId: unknown
  let rawRoomId: unknown
  let rawSessionId: unknown
  try {
    rawLessonId = input.lessonId
  } catch {
    throw new ContinuityScopeError("invalid-lesson-id")
  }
  try {
    rawRoomId = input.roomId
  } catch {
    throw new ContinuityScopeError("invalid-room-id")
  }
  try {
    rawSessionId = input.sessionId
  } catch {
    throw new ContinuityScopeError("invalid-session-id")
  }

  if (typeof rawLessonId !== "string") throw new ContinuityScopeError("invalid-lesson-id")
  if (typeof rawRoomId !== "string") throw new ContinuityScopeError("invalid-room-id")
  if (typeof rawSessionId !== "string") throw new ContinuityScopeError("invalid-session-id")

  let lessonId: string
  try {
    lessonId = validateRoomId(rawLessonId)
  } catch {
    throw new ContinuityScopeError("invalid-lesson-id")
  }
  let roomId: string
  try {
    roomId = validateRoomId(rawRoomId)
  } catch {
    throw new ContinuityScopeError("invalid-room-id")
  }
  // La room è alias di routing, non una terza identità (design §5.1 invariante 2).
  if (roomId !== lessonId) throw new ContinuityScopeError("room-lesson-mismatch")
  if (!CANONICAL_UUID_RE.test(rawSessionId)) {
    throw new ContinuityScopeError("invalid-session-id")
  }
  return Object.freeze({ lessonId, roomId, sessionId: rawSessionId })
}

// --- Derivazione pura: design §6, §7, §9 ---

/** Href interno alla lezione, mai un link esterno (design §8.3). */
function continuityLessonHref(scope: ContinuityScopeV1): string {
  return `/#${scope.roomId}`
}

function continuityRecoveryHref(scope: ContinuityScopeV1): string {
  return `/?vista=continuita&lessonId=${encodeURIComponent(scope.lessonId)}`
    + `&sessionId=${scope.sessionId}#${scope.roomId}`
}

function sourceHealthStatus(
  issues: readonly ContinuitySourceIssueV1[],
): "verified" | "degraded" | "corrupt" {
  if (issues.some((issue) => issue.severity === "corrupt")) return "corrupt"
  if (issues.length > 0) return "degraded"
  return "verified"
}

/** Confronto per code point, mai locale-dependent (design §9.2). */
function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function readString(payload: JsonObject, key: string): string | null {
  const value = payload[key]
  return typeof value === "string" && value.length > 0 ? value : null
}

function readLabel(payload: JsonObject): Readonly<Record<string, string>> {
  const raw = payload.label
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return Object.freeze({})
  const out: Record<string, string> = {}
  for (const [locale, text] of Object.entries(raw)) {
    if (typeof text === "string") out[locale] = text
  }
  return Object.freeze(out)
}

type OpenLoopAccumulator = {
  errorId: string
  conceptId: string
  label: Readonly<Record<string, string>>
  openedAt: string
  lastObservedAt: string
  observedCount: number
  lastSeq: number
}

/**
 * Open loop Founder v1 (design §3.6, §7.3): un error.observed non chiuso da un
 * successivo exercise.completed.correctsErrorId nella STESSA sessione. Una
 * ri-osservazione dopo la correzione lo riapre; una correzione prima
 * dell'osservazione non inventa un loop. L'ordine è il seq append-only:
 * occurredAt è display, non autorità (design §7.1.5).
 * Output ordinato lastObserved seq DESC, poi errorId codepoint ASC.
 */
function deriveOpenLoops(
  lessonEvents: readonly AppendedEventEnvelopeV2[],
): readonly ContinuityOpenLoopV1[] {
  const open = new Map<string, OpenLoopAccumulator>()
  const observedTotal = new Map<string, number>()

  for (const event of [...lessonEvents].sort((left, right) => left.seq - right.seq)) {
    const payload = event.payload as JsonObject
    if (event.kind === "error.observed") {
      const errorId = readString(payload, "errorId")
      const conceptId = readString(payload, "conceptId")
      if (errorId === null || conceptId === null) continue
      const count = (observedTotal.get(errorId) ?? 0) + 1
      observedTotal.set(errorId, count)
      const previous = open.get(errorId)
      open.set(errorId, {
        errorId,
        conceptId,
        label: readLabel(payload),
        openedAt: previous?.openedAt ?? event.occurredAt,
        lastObservedAt: event.occurredAt,
        observedCount: count,
        lastSeq: event.seq,
      })
      continue
    }
    if (event.kind === "exercise.completed") {
      const corrects = readString(payload, "correctsErrorId")
      // Una correzione di un ID mai osservato non chiude nulla.
      if (corrects !== null) open.delete(corrects)
    }
  }

  return Object.freeze([...open.values()]
    .sort((left, right) => (
      right.lastSeq - left.lastSeq
      || compareCodePoints(left.errorId, right.errorId)
    ))
    .map((loop) => Object.freeze({
      errorId: loop.errorId,
      conceptId: loop.conceptId,
      label: loop.label,
      openedAt: loop.openedAt,
      lastObservedAt: loop.lastObservedAt,
      observedCount: loop.observedCount,
      evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
    })))
}

function unavailableSimulation(
  reason: Extract<ContinuitySimulationStateV1, { status: "unavailable" }>["reason"],
): ContinuitySimulationStateV1 {
  return Object.freeze({
    status: "unavailable" as const,
    instance: null,
    openError: null,
    evidenceBlock: null,
    reason,
  })
}

/**
 * Stato Simulation fail-closed (design §6, §7.5, gate G2).
 * Finche' ARD-07 non e' accepted gli eventi correnti sono legacy: nessuno
 * stato ready o error-open e' raggiungibile, e nessun solve viene associato a
 * un embed per euristica "tanto ce n'e' uno solo".
 */
function deriveSimulationState(
  lessonEvents: readonly AppendedEventEnvelopeV2[],
  scene: ScopedContinuitySnapshotV1["scene"],
  roomId: string,
): ContinuitySimulationStateV1 {
  const embeds = scene?.simulationEmbeds ?? []
  const mounts = lessonEvents.filter((event) => event.kind === "plugin.mounted")

  if (embeds.length === 0 && mounts.length === 0) {
    return Object.freeze({
      status: "not-mounted" as const,
      instance: null,
      openError: null,
      evidenceBlock: null,
    })
  }
  if (embeds.length > 1) return unavailableSimulation("multiple-instances")

  const strictMounts = mounts.filter((event) => (
    readString(event.payload as JsonObject, "room") === roomId
  ))
  if (mounts.length > 0 && strictMounts.length === 0) {
    // plugin.mounted storico privo di room: contratto non supportato, non
    // promosso a istanza (design §5.4, §12 RED-06-02).
    return unavailableSimulation("event-contract-legacy")
  }
  if (strictMounts.length === 0) return unavailableSimulation("mount-receipt-missing")

  // G2 non accepted: un mount strict esiste ma il contratto simulation.*
  // canonico (pluginVersion, sceneDigest, producer full SHA) non lo e'.
  return unavailableSimulation("event-contract-legacy")
}

// --- Required set e ordine P0 totale: design §9.1, §9.2 ---

const SOURCE_ORDER = [
  "session",
  "lesson-event-log",
  "journal",
  "event-union",
  "scene",
  "plugin-artifact",
  "build",
] as const

const SOURCE_CODE_ORDER = [
  "duplicate-event-id",
  "scope-violation",
  "invalid-schema",
  "digest-mismatch",
  "data-loss",
  "workspace-uninitialised",
  "workspace-factory-rejected",
  "fsa-handle-lost",
  "read-rejected",
  "unavailable",
  "missing",
  "local-storage-non-authoritative",
  "multiple-simulation-instances",
  "unsupported-event-contract",
  "legacy-recovery-required",
] as const

/**
 * Design §9.1. "Richiesta" distingue la disponibilita' della SORGENTE dalla
 * presenza del DOCUMENTO: una sorgente richiesta ma con documento assente
 * produce una issue missing, non trasforma la sessione in empty.
 */
function requiredSourceSet(
  snapshot: ScopedContinuitySnapshotV1,
): ReadonlySet<ContinuitySourceNameV1> {
  const required = new Set<ContinuitySourceNameV1>([
    "session",
    "lesson-event-log",
    "journal",
    "scene",
  ])
  const hasEvents = snapshot.lessonEvents.length > 0 || snapshot.journalEvents.length > 0
  if (hasEvents) {
    required.add("event-union")
    required.add("build")
  }
  const hasSimulation =
    (snapshot.scene?.simulationEmbeds.length ?? 0) > 0
    || snapshot.lessonEvents.some((event) => (
      event.kind === "plugin.mounted" || event.kind.startsWith("simulation.")
    ))
  if (hasSimulation) {
    required.add("plugin-artifact")
    required.add("build")
  }
  return required
}

function compareNullableString(left: string | null, right: string | null): number {
  return compareCodePoints(left ?? "", right ?? "")
}

/**
 * Chiave totale source (design §9.2). Copre TUTTI i campi di
 * ContinuitySourceIssueV1, quindi due candidati che comparano uguali sono
 * byte-identici e vengono deduplicati prima della selezione: l'ordine e'
 * totale per costruzione.
 */
function compareSourceCandidates(
  left: ContinuitySourceIssueV1,
  right: ContinuitySourceIssueV1,
): number {
  const severityRank = (issue: ContinuitySourceIssueV1): number => (
    issue.severity === "corrupt" ? 0 : 1
  )
  return (
    severityRank(left) - severityRank(right)
    || SOURCE_ORDER.indexOf(left.source) - SOURCE_ORDER.indexOf(right.source)
    || SOURCE_CODE_ORDER.indexOf(left.code) - SOURCE_CODE_ORDER.indexOf(right.code)
    || compareNullableString(left.preserved?.path ?? null, right.preserved?.path ?? null)
    || compareNullableString(left.preserved?.sha256 ?? null, right.preserved?.sha256 ?? null)
    || (left.preserved?.bytes ?? -1) - (right.preserved?.bytes ?? -1)
  )
}

/**
 * Una issue corrupt e' sempre P0, anche su sorgente opzionale. Una degraded
 * entra in P0 soltanto se la sua sorgente e' nel required set, cosi' una
 * sorgente opzionale degradata non oscura un'azione sicura (design §9.1).
 */
function p0SourceCandidates(
  snapshot: ScopedContinuitySnapshotV1,
): readonly ContinuitySourceIssueV1[] {
  const required = requiredSourceSet(snapshot)
  const candidates = snapshot.issues.filter((entry) => (
    entry.severity === "corrupt" || required.has(entry.source)
  ))
  // Deduplica soltanto issue byte-identiche, mai evidence occurrence.
  const byKey = new Map<string, ContinuitySourceIssueV1>()
  for (const entry of candidates) byKey.set(JSON.stringify(entry), entry)
  return [...byKey.values()].sort(compareSourceCandidates)
}

function recoverContinuityAction(
  scope: ContinuityScopeV1,
  candidate: ContinuitySourceIssueV1,
): ContinuityNextActionV1 {
  return Object.freeze({
    kind: "recover-continuity" as const,
    priority: 0 as const,
    reason: Object.freeze({
      kind: "source" as const,
      source: candidate.source,
      severity: candidate.severity,
      code: candidate.code,
      preserved: candidate.preserved,
    }),
    href: continuityRecoveryHref(scope),
    evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
  })
}

function recoverEvidenceAction(
  scope: ContinuityScopeV1,
  candidate: ContinuityEvidenceV1,
  missingEvidence: readonly ContinuityEvidenceV1[],
): ContinuityNextActionV1 {
  // Only unresolved occurrences reach recovery. A declaration alone never
  // establishes a target; supported resolvers must check the scoped sources.
  const status = candidate.status as Exclude<ContinuityEvidenceV1["status"], "resolved">
  return Object.freeze({
    kind: "recover-continuity" as const,
    priority: 0 as const,
    reason: Object.freeze({
      kind: "evidence" as const,
      occurrenceId: candidate.occurrenceId,
      status,
    }),
    href: continuityRecoveryHref(scope),
    evidence: Object.freeze([...missingEvidence]) as readonly ContinuityEvidenceV1[],
  })
}

/**
 * Deriva le evidence occurrence non risolte dal snapshot.
 * L'ordinamento e' deterministico: (eventId codepoint ASC, evidenceIndex ASC)
 * cosi' due snapshot identici producono la stessa lista byte per byte.
 */
function deriveMissingEvidence(
  snapshot: ScopedContinuitySnapshotV1,
): readonly ContinuityEvidenceV1[] {
  const unresolved = [...snapshot.evidenceByOccurrence.values()]
    .filter((entry) => entry.status !== "resolved")
    .sort((left, right) => (
      compareCodePoints(left.eventId, right.eventId)
      || (left.evidenceIndex - right.evidenceIndex)
    ))
  return Object.freeze(unresolved)
}

/**
 * Projection pura della Continuità (design §6, §7, §9).
 * Nessun I/O, nessun clock: lo stesso snapshot produce gli stessi byte.
 */
export function projectContinuityV1(
  snapshot: ScopedContinuitySnapshotV1,
): ContinuityProjectionV1 {
  const identity = validateContinuityScopeV1(snapshot.scope)
  const issues = [...snapshot.issues]
  const health = sourceHealthStatus(issues)

  if (health === "corrupt") {
    // Design §6: una source corruption non autorizza una projection parziale
    // dalle altre sorgenti. Restano identità, issue bounded e recover.
    const sortedIssues = Object.freeze([...issues].sort(compareSourceCandidates))
    const candidate = p0SourceCandidates(snapshot)[0]!
    return Object.freeze({
      v: 1 as const,
      identity,
      phase: "corrupt" as const,
      sourceHealth: Object.freeze({ status: health, issues: sortedIssues }),
      session: null,
      lastVerifiedResult: null,
      openLoops: Object.freeze([]) as readonly ContinuityOpenLoopV1[],
      lastUncorrectedError: null,
      recentMaterials: Object.freeze([]) as readonly ContinuityMaterialV1[],
      missingEvidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
      simulation: Object.freeze({
        status: "unavailable" as const,
        instance: null,
        openError: null,
        evidenceBlock: null,
        reason: "source-corrupt" as const,
      }),
      nextAction: recoverContinuityAction(identity, candidate),
    })
  }

  const sortedIssues = Object.freeze([...issues].sort(compareSourceCandidates))
  const p0 = p0SourceCandidates(snapshot)
  const openLoops = deriveOpenLoops(snapshot.lessonEvents)
  const lastUncorrectedError = openLoops[0] ?? null
  const hasResumableFacts = openLoops.length > 0
  const missingEvidence = deriveMissingEvidence(snapshot)
  const hasMissingEvidence = missingEvidence.length > 0
  // Selezione phase: degraded > missing-evidence > ready > empty. Corrupt e'
  // gia' stato risolto sopra. missing-evidence copre lo stato "avrei fatti
  // ricomponibili se il resolver evidence completasse".
  const phase = health === "degraded"
    ? ("degraded" as const)
    : hasMissingEvidence && (hasResumableFacts || snapshot.lessonEvents.length > 0)
    ? ("missing-evidence" as const)
    : hasResumableFacts
    ? ("ready" as const)
    : ("empty" as const)

  const nextAction: ContinuityNextActionV1 = p0.length > 0
    ? recoverContinuityAction(identity, p0[0]!)
    : phase === "missing-evidence"
    ? recoverEvidenceAction(identity, missingEvidence[0]!, missingEvidence)
    : openLoops.length > 0
    ? Object.freeze({
        kind: "resume-open-loop" as const,
        priority: 2 as const,
        errorId: openLoops[0]!.errorId,
        href: continuityLessonHref(identity),
        evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
      })
    : Object.freeze({
        kind: "reopen-lesson" as const,
        priority: 4 as const,
        href: continuityLessonHref(identity),
        evidence: Object.freeze([]) as readonly [],
      })

  return Object.freeze({
    v: 1 as const,
    identity,
    phase,
    sourceHealth: Object.freeze({ status: health, issues: sortedIssues }),
    session: null,
    lastVerifiedResult: null,
    openLoops,
    lastUncorrectedError,
    recentMaterials: Object.freeze([]) as readonly ContinuityMaterialV1[],
    missingEvidence,
    simulation: deriveSimulationState(snapshot.lessonEvents, snapshot.scene, identity.roomId),
    nextAction,
  })
}
