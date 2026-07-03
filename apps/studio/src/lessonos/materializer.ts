// LessonOS — materializer: eventi → grafo (funzione pura, deterministica).
// Il grafo NON è un secondo store: è una vista derivata dall'event log,
// riderivabile da zero in ogni momento (cancellarla non perde nulla).
//
// Nodi: lesson | materiale | errore | esercizio | concetto
//   (il doc di ricerca elenca lesson/nota/materiale/errore/esercizio; `concetto`
//   è aggiunto qui perché il test canonico della slice — "evento errore → arco
//   corregge tra esercizio e concetto" — lo richiede come estremo d'arco;
//   `nota` non ha ancora un evento sorgente e arriverà con il suo evento.)
// Archi: cita | deriva-da | corregge (chiusi, dal doc di ricerca).
// Temporalità come ATTRIBUTI (introducedAt/correctedAt), non come motore nuovo.

import type { AppendedEvent, EvidenceRef, Labels } from "./eventlog"

export type LessonNodeKind = "lesson" | "materiale" | "errore" | "esercizio" | "concetto"
export type LessonEdgeKind = "cita" | "deriva-da" | "corregge"

export interface LessonNode {
  id: string
  kind: LessonNodeKind
  labels: Labels
  evidenceRefs: EvidenceRef[]
  introducedAt: number
  /** Solo per nodi `errore`: quando un esercizio l'ha corretto per la prima volta. */
  correctedAt?: number
}

export interface LessonEdge {
  from: string
  to: string
  kind: LessonEdgeKind
  introducedAt: number
  evidenceRefs: EvidenceRef[]
}

export interface LessonGraph {
  nodes: Map<string, LessonNode>
  edges: LessonEdge[]
}

function edgeKey(e: Pick<LessonEdge, "from" | "to" | "kind">): string {
  return `${e.from} ${e.kind} ${e.to}`
}

function mergeEvidence(target: EvidenceRef[], extra: EvidenceRef[]): void {
  for (const ref of extra) if (!target.includes(ref)) target.push(ref)
}

/**
 * Materializza il grafo dall'intero log (ordine `seq`).
 * Regole deterministiche:
 * - primo evento che introduce un nodo fissa `introducedAt`; i successivi
 *   arricchiscono labels/evidenze senza riscrivere la storia;
 * - arco duplicato (from,kind,to) → si tiene il primo, si uniscono le evidenze;
 * - `error.observed` → nodo errore + arco errore -deriva-da→ concetto;
 * - `exercise.completed` con `correctsErrorId` → arco esercizio -corregge→ errore,
 *   PROPAGATO a esercizio -corregge→ concetto per ogni concetto da cui l'errore
 *   deriva (è questa propagazione che rende vero il test canonico), e `correctedAt`
 *   sul nodo errore alla prima correzione.
 */
export function materialize(events: readonly AppendedEvent[]): LessonGraph {
  const nodes = new Map<string, LessonNode>()
  const edges: LessonEdge[] = []
  const edgeIndex = new Map<string, LessonEdge>()

  function upsertNode(id: string, kind: LessonNodeKind, labels: Labels, evidence: EvidenceRef[], t: number): LessonNode {
    const existing = nodes.get(id)
    if (existing) {
      if (existing.kind !== kind) {
        throw new Error(`LessonOS materializer: id "${id}" riusato con kind diverso (${existing.kind} vs ${kind})`)
      }
      existing.labels = { ...labels, ...existing.labels } // le label più vecchie vincono: la storia non si riscrive
      mergeEvidence(existing.evidenceRefs, evidence)
      return existing
    }
    const node: LessonNode = { id, kind, labels: { ...labels }, evidenceRefs: [...evidence], introducedAt: t }
    nodes.set(id, node)
    return node
  }

  function addEdge(from: string, to: string, kind: LessonEdgeKind, evidence: EvidenceRef[], t: number): void {
    const key = edgeKey({ from, to, kind })
    const existing = edgeIndex.get(key)
    if (existing) {
      mergeEvidence(existing.evidenceRefs, evidence)
      return
    }
    const edge: LessonEdge = { from, to, kind, introducedAt: t, evidenceRefs: [...evidence] }
    edgeIndex.set(key, edge)
    edges.push(edge)
  }

  const sorted = [...events].sort((a, b) => a.seq - b.seq)
  for (const ev of sorted) {
    switch (ev.kind) {
      case "lesson.started":
      case "lesson.ended":
        upsertNode(`lesson:${ev.room}`, "lesson", { und: ev.room }, ev.evidence, ev.t)
        break

      case "concept.introduced":
        upsertNode(ev.conceptId, "concetto", ev.labels, ev.evidence, ev.t)
        break

      case "material.cited": {
        upsertNode(ev.materialId, "materiale", ev.labels, ev.evidence, ev.t)
        if (ev.conceptId) {
          upsertNode(ev.conceptId, "concetto", {}, ev.evidence, ev.t)
          addEdge(ev.materialId, ev.conceptId, "cita", ev.evidence, ev.t)
        }
        break
      }

      case "error.observed": {
        upsertNode(ev.errorId, "errore", ev.labels, ev.evidence, ev.t)
        upsertNode(ev.conceptId, "concetto", {}, ev.evidence, ev.t)
        addEdge(ev.errorId, ev.conceptId, "deriva-da", ev.evidence, ev.t)
        break
      }

      case "exercise.completed": {
        upsertNode(ev.exerciseId, "esercizio", ev.labels, ev.evidence, ev.t)
        if (ev.conceptId) {
          upsertNode(ev.conceptId, "concetto", {}, ev.evidence, ev.t)
          addEdge(ev.exerciseId, ev.conceptId, "cita", ev.evidence, ev.t)
        }
        if (ev.correctsErrorId) {
          const errorNode = nodes.get(ev.correctsErrorId)
          if (errorNode?.kind === "errore") {
            addEdge(ev.exerciseId, ev.correctsErrorId, "corregge", ev.evidence, ev.t)
            if (errorNode.correctedAt === undefined) errorNode.correctedAt = ev.t
            // Propagazione: l'esercizio corregge anche i concetti da cui l'errore
            // deriva (snapshot prima di aggiungere: niente iterazione su array mutato).
            const derivaDa = edges.filter((e) => e.from === ev.correctsErrorId && e.kind === "deriva-da")
            for (const e of derivaDa) {
              addEdge(ev.exerciseId, e.to, "corregge", ev.evidence, ev.t)
            }
          }
          // correctsErrorId sconosciuto: nessun arco inventato — l'evidenza prima di tutto.
        }
        break
      }
    }
  }

  return { nodes, edges }
}
