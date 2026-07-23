// ARDESIA Studio — ARD-06 loader session-scoped.
//
// Porta minima (design §5.2): `readAll` non e' rappresentabile in questi tipi,
// quindi non e' un divieto di stile ma un fatto del sistema di tipi.
// Path unici letti (design §5.3): session A/SA, journal A, scene A, query A/SA.
// Nessun fallback InMemory travestito da event log vuoto verificato.

import {
  validateContinuityScopeV1,
  type ContinuityScopeV1,
  type ContinuitySourceIssueV1,
  type ScopedContinuitySnapshotV1,
} from "./continuityProjection"
import type { AppendedEventEnvelopeV2 } from "./eventlog"
import { roomPaths } from "../store/roomPaths"
import { sessionPaths } from "../store/sessionState"

export interface ContinuityEventReaderV1 {
  readonly persistence:
    | { kind: "verified-indexeddb"; database: string }
    | { kind: "unavailable"; code: string }
    | { kind: "data-loss"; code: string }
    | { kind: "corrupt"; code: string }
  readEnvelopesBySession(
    lessonId: string,
    sessionId: string,
  ): Promise<readonly AppendedEventEnvelopeV2[]>
}

export interface ContinuityWorkspaceReaderV1 {
  read(path: string): Promise<Blob | null>
}

export type ContinuityLoaderDepsV1 = Readonly<{
  reader: ContinuityEventReaderV1
  workspace: ContinuityWorkspaceReaderV1
}>

/**
 * Costruisce lo snapshot che il projector puro consumera'.
 *
 * Il gate di scope precede QUALUNQUE I/O: uno scope incoerente non deve
 * produrre nemmeno una read (design §5.1 invariante 5). Un record fuori scope
 * restituito dalla query non viene filtrato in silenzio: e' scope-violation e
 * azzera la sorgente, perche' un filtro silenzioso nasconderebbe il fatto che
 * la porta ha consegnato dati di un'altra lezione.
 */
export async function loadContinuitySnapshotV1(
  scopeInput: { lessonId: unknown; roomId: unknown; sessionId: unknown },
  deps: ContinuityLoaderDepsV1,
): Promise<ScopedContinuitySnapshotV1> {
  const scope: ContinuityScopeV1 = validateContinuityScopeV1(scopeInput)

  const paths = roomPaths(scope.lessonId)
  const session = sessionPaths({ lessonId: scope.lessonId, sessionId: scope.sessionId })
  const issues: ContinuitySourceIssueV1[] = []

  const [sessionBlob, journalBlob, sceneBlob, rawEvents] = await Promise.all([
    deps.workspace.read(session.session),
    deps.workspace.read(paths.journal),
    deps.workspace.read(paths.scene),
    deps.reader.readEnvelopesBySession(scope.lessonId, scope.sessionId),
  ])

  const outOfScope = rawEvents.some((event) => (
    event.lessonId !== scope.lessonId || event.sessionId !== scope.sessionId
  ))
  if (outOfScope) {
    issues.push({
      source: "event-union",
      severity: "corrupt",
      code: "scope-violation",
      preserved: null,
    })
  }
  const lessonEvents = outOfScope
    ? []
    : [...rawEvents].sort((left, right) => left.seq - right.seq)

  // Parsing di session, journal e scena arriva nella prossima slice: qui il
  // contratto congelato e' il CALL LEDGER e il gate di scope (RED-06-01/02).
  void sessionBlob
  void journalBlob
  void sceneBlob

  return Object.freeze({
    scope,
    session: null,
    lessonEvents: Object.freeze(lessonEvents),
    journalEvents: Object.freeze([]),
    scene: null,
    buildCommitSha: null,
    evidenceByOccurrence: new Map(),
    issues: Object.freeze(issues),
  })
}
