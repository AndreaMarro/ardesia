// P0-D — capability graph.query READ-ONLY (TOOLHOST-SPEC-v0 §2, capability già
// nel vocabolario, instradata qui per la prima volta). La vista wire è SEMPRE
// derivata on-demand dall'event-log LessonOS via materialize(): il grafo NON è
// un secondo store (canone LESSONOS-MEMORY: cancellare la vista non perde nulla)
// e per questo NON viene mai cachato qui.
//
// Read-only alla radice: questa classe consuma l'interfaccia strutturale
// { readAll() } — il tipo non espone append, quindi nessun percorso di scrittura
// esiste nemmeno per bug. graph.proposeClaims resta fuori registro (T3).

import { materialize } from "../../lessonos/materializer"
import type { LessonEdge, LessonNode } from "../../lessonos/materializer"
import type { AppendedEvent } from "../../lessonos/eventlog"
import type { GraphQueryParams, GraphQueryResult } from "../../toolhost-protocol/index.ts"

/** Sottoinsieme in sola lettura dell'EventLogStore: l'unico accesso concesso. */
export interface EventLogReadLike {
  readAll(): Promise<AppendedEvent[]>
}

/** Tetto di default sugli array in risposta (il wire ammette limit ≤ 500). */
export const GRAPH_QUERY_DEFAULT_LIMIT = 200

function wireNode(n: LessonNode): NonNullable<GraphQueryResult["nodes"]>[number] {
  return {
    id: n.id,
    kind: n.kind,
    labels: { ...n.labels },
    evidenceRefs: [...n.evidenceRefs],
    introducedAt: n.introducedAt,
    ...(n.correctedAt === undefined ? {} : { correctedAt: n.correctedAt }),
  }
}

function wireEdge(e: LessonEdge): NonNullable<GraphQueryResult["edges"]>[number] {
  return {
    from: e.from,
    to: e.to,
    kind: e.kind,
    introducedAt: e.introducedAt,
    evidenceRefs: [...e.evidenceRefs],
  }
}

export class ToolGraph {
  private _log: EventLogReadLike

  constructor(log: EventLogReadLike) {
    this._log = log
  }

  /**
   * graph.query (forma wire GraphQueryResult). I params arrivano GIÀ validati
   * dal router (GraphQueryParamsSchema, incluso il cross-field kind/select).
   * `total` è il conteggio PRE-limit: il tool vede se la risposta è troncata.
   */
  async query(params: GraphQueryParams): Promise<GraphQueryResult> {
    const graph = materialize(await this._log.readAll())
    const limit = params.limit ?? GRAPH_QUERY_DEFAULT_LIMIT

    if (params.select === "summary") {
      const nodeCounts: Record<string, number> = {}
      let uncorrected = 0
      for (const node of graph.nodes.values()) {
        nodeCounts[node.kind] = (nodeCounts[node.kind] ?? 0) + 1
        if (node.kind === "errore" && node.correctedAt === undefined) uncorrected += 1
      }
      const edgeCounts: Record<string, number> = {}
      for (const edge of graph.edges) {
        edgeCounts[edge.kind] = (edgeCounts[edge.kind] ?? 0) + 1
      }
      return { total: graph.nodes.size, summary: { nodeCounts, edgeCounts, uncorrectedErrors: uncorrected } }
    }

    if (params.select === "nodes") {
      const all = [...graph.nodes.values()].filter((n) => params.kind === undefined || n.kind === params.kind)
      return { total: all.length, nodes: all.slice(0, limit).map(wireNode) }
    }

    const all = graph.edges.filter((e) => params.kind === undefined || e.kind === params.kind)
    return { total: all.length, edges: all.slice(0, limit).map(wireEdge) }
  }
}
