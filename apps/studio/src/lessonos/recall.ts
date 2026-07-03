// LessonOS — recall deterministico sul grafo materializzato.
// Query O(vicinato), mai O(grafo): il client (iPad incluso) interroga il
// vicinato di un nodo, non attraversa tutto. Output SEMPRE ordinati: stesso
// grafo → stessa risposta, byte per byte (nessun LLM, nessuna euristica).

import type { LessonEdge, LessonGraph, LessonNode } from "./materializer"

export interface NeighborhoodView {
  focus: LessonNode
  nodes: LessonNode[]
  edges: LessonEdge[]
}

function byId(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

function byEdge(a: LessonEdge, b: LessonEdge): number {
  const ka = `${a.from} ${a.kind} ${a.to}`
  const kb = `${b.from} ${b.kind} ${b.to}`
  return ka < kb ? -1 : ka > kb ? 1 : 0
}

/**
 * Vicinato di `nodeId` a profondità `depth` (default 1, archi in entrambe le direzioni:
 * il modello backlink — cita/citato-da — è bidirezionale per costruzione).
 * Ritorna null se il nodo non esiste: il recall non inventa nodi.
 */
export function neighbors(graph: LessonGraph, nodeId: string, depth = 1): NeighborhoodView | null {
  const focus = graph.nodes.get(nodeId)
  if (!focus) return null

  const seen = new Set<string>([nodeId])
  const pickedEdges: LessonEdge[] = []
  let frontier = new Set<string>([nodeId])

  for (let d = 0; d < depth; d++) {
    const next = new Set<string>()
    for (const edge of graph.edges) {
      const touchesFrontier = frontier.has(edge.from) || frontier.has(edge.to)
      if (!touchesFrontier) continue
      if (!pickedEdges.includes(edge)) pickedEdges.push(edge)
      for (const end of [edge.from, edge.to]) {
        if (!seen.has(end)) {
          seen.add(end)
          next.add(end)
        }
      }
    }
    frontier = next
    if (frontier.size === 0) break
  }

  const nodes = [...seen]
    .map((id) => graph.nodes.get(id))
    .filter((n): n is LessonNode => n !== undefined)
    .sort(byId)
  return { focus, nodes, edges: [...pickedEdges].sort(byEdge) }
}

/** Errori (corretti e non) che derivano da un concetto, ordinati per id. */
export function recallErrorsForConcept(graph: LessonGraph, conceptId: string): LessonNode[] {
  const out: LessonNode[] = []
  for (const edge of graph.edges) {
    if (edge.kind !== "deriva-da" || edge.to !== conceptId) continue
    const node = graph.nodes.get(edge.from)
    if (node?.kind === "errore") out.push(node)
  }
  return out.sort(byId)
}

/** Esercizi che correggono un concetto (via propagazione del materializer), ordinati per id. */
export function recallCorrectionsForConcept(graph: LessonGraph, conceptId: string): LessonNode[] {
  const out: LessonNode[] = []
  for (const edge of graph.edges) {
    if (edge.kind !== "corregge" || edge.to !== conceptId) continue
    const node = graph.nodes.get(edge.from)
    if (node?.kind === "esercizio" && !out.includes(node)) out.push(node)
  }
  return out.sort(byId)
}
