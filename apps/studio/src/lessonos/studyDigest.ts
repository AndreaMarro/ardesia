// Product-factory (P30) — digesto di studio DERIVATO dal grafo LessonOS.
// Estrae il contenuto pedagogico "vendibile": concetti trattati + errori
// osservati (loop break→explain, inclusi i simulation.error.observed) con
// l'indicazione se sono stati corretti, e la PROVENIENZA (evidenceRefs) intatta.
// Funzione PURA e deterministica: nessuna affermazione inventata, ogni voce
// porta la sua evidenza.
import { materialize, type LessonGraph, type LessonNode } from "./materializer"
import type { AppendedEvent } from "./eventlog"
import type { EventEvidence } from "../core/contracts/eventEnvelope"

export interface StudyDigestRecord {
  eventId: string
  sessionId: string
  label: string
  evidence: readonly EventEvidence[]
  currentMa?: number
}

export interface StudyDigestConcept {
  id: string
  label: string
  /** Ref di provenienza (pagina manuale, board, scena…) — mai vuoto se il nodo ne ha. */
  evidence: string[]
  sessionId?: string
  evidenceDetails?: readonly EventEvidence[]
}

export interface StudyDigestError {
  id: string
  label: string
  /** Concetto da cui l'errore deriva (arco `deriva-da`), o null se non collegato. */
  conceptId: string | null
  /** L'errore è stato corretto (esiste un exercise.completed che lo corregge). */
  corrected: boolean
  evidence: string[]
  sessionId?: string
  evidenceDetails?: readonly EventEvidence[]
}

export interface StudyDigest {
  concepts: StudyDigestConcept[]
  errors: StudyDigestError[]
  results?: readonly StudyDigestRecord[]
  exercises?: readonly StudyDigestRecord[]
  materials?: ReadonlyArray<StudyDigestRecord & Readonly<{ id: string }>>
}

function labelOf(node: LessonNode): string {
  return node.labels.it ?? Object.values(node.labels)[0] ?? node.id
}

function byId(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

export function buildStudyDigest(graph: LessonGraph): StudyDigest {
  const nodes = [...graph.nodes.values()]

  const concepts: StudyDigestConcept[] = nodes
    .filter((node) => node.kind === "concetto")
    .map((node) => ({ id: node.id, label: labelOf(node), evidence: [...node.evidenceRefs] }))
    .sort(byId)

  const errors: StudyDigestError[] = nodes
    .filter((node) => node.kind === "errore")
    .map((node) => {
      const derivaDa = graph.edges.find((edge) => edge.from === node.id && edge.kind === "deriva-da")
      return {
        id: node.id,
        label: labelOf(node),
        conceptId: derivaDa?.to ?? null,
        corrected: node.correctedAt !== undefined,
        evidence: [...node.evidenceRefs],
      }
    })
    .sort(byId)

  return { concepts, errors }
}

/**
 * Digesto ROOM-SCOPED: il log LessonOS è app-wide, quindi per il materiale di
 * UNA lezione si restringono gli eventi alla finestra lesson.started/ended di
 * quella room prima di materializzare. Senza finestra (lezione mai "avviata"
 * formalmente) si usa best-effort l'intero log (caso comune: sessione singola).
 * Puro e deterministico.
 */
export function buildRoomStudyDigest(events: readonly AppendedEvent[], room: string): StudyDigest {
  const startTs = events.filter((e) => e.kind === "lesson.started" && e.room === room).map((e) => e.t)
  const endTs = events.filter((e) => e.kind === "lesson.ended" && e.room === room).map((e) => e.t)
  let scoped: readonly AppendedEvent[] = events
  if (startTs.length > 0) {
    const from = Math.min(...startTs)
    const to = endTs.length > 0 ? Math.max(...endTs) : Number.POSITIVE_INFINITY
    scoped = events.filter((e) => e.t >= from && e.t <= to)
  }
  return buildStudyDigest(materialize([...scoped]))
}
