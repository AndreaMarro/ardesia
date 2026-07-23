// Le combinazioni impossibili della union Simulation devono fallire al TYPECHECK,
// non a runtime (design §12 RED-06-06). Ogni @ts-expect-error qui è un oracolo:
// se un giorno la union si allarga e uno di questi diventa assegnabile, tsc
// fallisce sull'expect-error inutilizzato e il gate cattura la regressione.
import type { ContinuitySimulationStateV1 } from "../lessonos/continuityProjection"

const instance = {
  pluginId: "io.ardesia.simulation",
  pluginVersion: "1.0.0",
  instanceId: "embed-1",
  mountedAt: "2026-07-23T00:00:00.000Z",
  sceneDigest: "a".repeat(64),
  lastActivityAt: "2026-07-23T00:00:01.000Z",
} as const

const openError = {
  eventId: "e1",
  occurredAt: "2026-07-23T00:00:02.000Z",
  errorId: "err-1",
  conceptId: "c1",
  label: { it: "corto" },
  instanceId: "embed-1",
  sceneDigest: "a".repeat(64),
  evidence: [],
} as const

// ready non può portare un errore aperto
// @ts-expect-error ready richiede openError null
const readyWithError: ContinuitySimulationStateV1 = {
  status: "ready",
  instance,
  openError,
  evidenceBlock: null,
}

// error-open non può avere errore nullo
// @ts-expect-error error-open richiede openError non nullo
const errorOpenWithoutError: ContinuitySimulationStateV1 = {
  status: "error-open",
  instance,
  openError: null,
  evidenceBlock: null,
}

// not-mounted non può portare un'istanza
// @ts-expect-error not-mounted richiede instance null
const notMountedWithInstance: ContinuitySimulationStateV1 = {
  status: "not-mounted",
  instance,
  openError: null,
  evidenceBlock: null,
}

// unavailable richiede un reason
// @ts-expect-error unavailable richiede reason
const unavailableWithoutReason: ContinuitySimulationStateV1 = {
  status: "unavailable",
  instance: null,
  openError: null,
  evidenceBlock: null,
}

// missing-evidence non può avere evidenceBlock nullo
// @ts-expect-error missing-evidence richiede un evidenceBlock non nullo
const missingEvidenceWithoutBlock: ContinuitySimulationStateV1 = {
  status: "missing-evidence",
  instance,
  openError: null,
  evidenceBlock: null,
}

void readyWithError
void errorOpenWithoutError
void notMountedWithInstance
void unavailableWithoutReason
void missingEvidenceWithoutBlock
