// Product-factory (P30) — digesto di studio DERIVATO dal grafo LessonOS.
// Estrae il contenuto pedagogico "vendibile": concetti trattati + errori
// osservati (loop break→explain, inclusi i simulation.error.observed) con
// l'indicazione se sono stati corretti, e la PROVENIENZA (evidenceRefs) intatta.
// Funzione PURA e deterministica: nessuna affermazione inventata, ogni voce
// porta la sua evidenza.
import { materialize, type LessonGraph, type LessonNode } from "./materializer"
import { toLegacyLessonOsEvent, type AppendedEvent, type AppendedEventEnvelopeV2 } from "./eventlog"

export interface StudyDigestConcept {
  id: string
  label: string
  /** Ref di provenienza (pagina manuale, board, scena…) — mai vuoto se il nodo ne ha. */
  evidence: string[]
}

export interface StudyDigestError {
  id: string
  label: string
  /** Concetto da cui l'errore deriva (arco `deriva-da`), o null se non collegato. */
  conceptId: string | null
  /** L'errore è stato corretto (esiste un exercise.completed che lo corregge). */
  corrected: boolean
  evidence: string[]
}

export interface StudyDigest {
  concepts: StudyDigestConcept[]
  errors: StudyDigestError[]
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
 * Proietta envelope già attribuiti a UNA lezione da readEnvelopesByLesson.
 * L'identità è stabilita dalla query canonica, mai dai timestamp. Il projector
 * esistente conserva sequenza/provenienza e scarta gli envelope non fattuali.
 * Puro e deterministico; il chiamante gestisce eventuali errori di proiezione.
 */
export function buildLessonStudyDigest(envelopes: readonly AppendedEventEnvelopeV2[]): StudyDigest {
  const factual: AppendedEvent[] = []
  for (const envelope of envelopes) {
    const event = toLegacyLessonOsEvent(envelope)
    if (event !== null) factual.push(event)
  }
  return buildStudyDigest(materialize(factual))
}
