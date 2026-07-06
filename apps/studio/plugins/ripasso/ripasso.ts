// Modello "Ripasso errori" — nucleo del TERZO plugin concreto di riferimento,
// primo consumatore reale di graph.query (contratto SDK 1.1.0). Puro e
// deterministico: non importa nulla — l'unico accoppiamento al sistema è il
// boundary src/sdk in main.ts. Trasforma la vista wire del grafo LessonOS
// (nodi errore/concetto + archi deriva-da) nel ripasso della lezione: errori
// APERTI prima (mai corretti da un esercizio), poi i corretti. La provenienza
// (evidenceRefs) viaggia VERBATIM: il canone LessonOS vieta fatti senza fonte,
// il plugin non riscrive né inventa.

/** Forma STRUTTURALE del nodo/arco wire di graph.query (il plugin non importa i tipi host). */
export interface GraphNodeLike {
  readonly id: string
  readonly kind: string
  readonly labels: Readonly<Record<string, string>>
  readonly evidenceRefs: readonly string[]
  readonly introducedAt: number
  readonly correctedAt?: number
}

export interface GraphEdgeLike {
  readonly from: string
  readonly to: string
  readonly kind: string
  readonly introducedAt: number
  readonly evidenceRefs: readonly string[]
}

/** Una voce del ripasso: UN errore osservato, con i concetti da cui deriva. */
export interface RipassoItem {
  readonly errorId: string
  /** labels.it dell'errore, o l'id se la label manca (mai testo inventato). */
  readonly label: string
  /** Label (o id) dei concetti raggiunti via arco deriva-da. */
  readonly concepts: readonly string[]
  /** Provenienza VERBATIM dall'event-log (board:…, manual:vol…:p…). */
  readonly evidence: readonly string[]
  readonly introducedAt: number
  readonly correctedAt?: number
}

export interface RipassoModel {
  readonly v: 1
  /** Errori MAI corretti, ordinati per introducedAt: i primi da riprendere. */
  readonly aperti: readonly RipassoItem[]
  /** Errori già corretti da un esercizio (arco corregge → correctedAt). */
  readonly corretti: readonly RipassoItem[]
}

export const EMPTY_RIPASSO: RipassoModel = { v: 1, aperti: [], corretti: [] }

function labelOf(node: Pick<GraphNodeLike, "id" | "labels">): string {
  return node.labels.it ?? node.id
}

/**
 * Costruisce il ripasso dai nodi (errore + concetto) e dagli archi deriva-da
 * della vista graph.query. I concetti sono risolti in label via i nodi concetto
 * presenti; un concetto non presente degrada al suo id (mai inventare).
 */
export function buildRipasso(nodes: readonly GraphNodeLike[], edges: readonly GraphEdgeLike[]): RipassoModel {
  const conceptLabels = new Map<string, string>()
  for (const n of nodes) if (n.kind === "concetto") conceptLabels.set(n.id, labelOf(n))

  const items: RipassoItem[] = nodes
    .filter((n) => n.kind === "errore")
    .map((n) => ({
      errorId: n.id,
      label: labelOf(n),
      concepts: edges
        .filter((e) => e.kind === "deriva-da" && e.from === n.id)
        .map((e) => conceptLabels.get(e.to) ?? e.to),
      evidence: [...n.evidenceRefs],
      introducedAt: n.introducedAt,
      ...(n.correctedAt === undefined ? {} : { correctedAt: n.correctedAt }),
    }))
    .sort((a, b) => a.introducedAt - b.introducedAt)

  return {
    v: 1,
    aperti: items.filter((i) => i.correctedAt === undefined),
    corretti: items.filter((i) => i.correctedAt !== undefined),
  }
}

/** Guardia per host.restore: mai consegnare spazzatura al pannello. */
export function isRipassoModel(x: unknown): x is RipassoModel {
  if (typeof x !== "object" || x === null) return false
  const m = x as { v?: unknown; aperti?: unknown; corretti?: unknown }
  return m.v === 1 && Array.isArray(m.aperti) && Array.isArray(m.corretti)
}

export interface RipassoRender {
  readonly title: string
  readonly lines: readonly string[]
}

function renderItem(prefix: string, i: RipassoItem): string {
  const deriva = i.concepts.length > 0 ? ` · deriva da: ${i.concepts.join(", ")}` : ""
  const fonte = i.evidence.length > 0 ? ` · fonte: ${i.evidence.join(", ")}` : ""
  return `${prefix} · ${i.label}${deriva}${fonte}`
}

/** Righe testuali del pannello: APERTI prima (i primi da riprendere), poi corretti. */
export function renderRipasso(model: RipassoModel): RipassoRender {
  if (model.aperti.length === 0 && model.corretti.length === 0) {
    return { title: "Ripasso errori", lines: ["Nessun errore osservato in questa lezione."] }
  }
  return {
    title: "Ripasso errori",
    lines: [
      ...model.aperti.map((i) => renderItem("DA RIPRENDERE", i)),
      ...model.corretti.map((i) => renderItem("corretto", i)),
    ],
  }
}
