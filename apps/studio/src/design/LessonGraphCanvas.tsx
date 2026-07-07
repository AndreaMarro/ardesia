// Grafo Tutor — VERO grafo visuale navigabile (Graphify-style), non una lista.
// Nodi = elementi SVG posizionati e cliccabili; archi = segmenti disegnati.
// La vista è SEMPRE derivata dal projector read-only dell'event-log LessonOS
// (nessun secondo store): riceve solo il vicinato già materializzato del nodo
// in focus. Layout radiale DETERMINISTICO (focus al centro, vicini su anelli
// per profondità BFS, angolo per indice ordinato): stesso grafo → stessa
// figura, byte per byte, senza Math.random (canone recall deterministico).
//
// Onestà/PII: le evidenze sono ref pseudonime del libro/journal citate
// verbatim; il pannello descrittori non inventa mai nomi, email o dati studente.

import { useMemo } from "react"
import type { DashboardNodeKind } from "../lessonos/teacherDashboardProjection"

type Labels = Record<string, string>
type EdgeKind = "cita" | "deriva-da" | "corregge"

export interface GraphCanvasNode {
  id: string
  kind: DashboardNodeKind
  label: Labels
  evidenceRefs: readonly string[]
}
export interface GraphCanvasEdge {
  from: string
  to: string
  kind: EdgeKind
  introducedAt?: number
  correctedAt?: number
}

export interface LessonGraphCanvasProps {
  focusNodeId: string | null
  nodes: readonly GraphCanvasNode[]
  edges: readonly GraphCanvasEdge[]
  onFocusNode: (id: string) => void
  /** Nodi comparsi dall'ultimo refresh a parità di focus: delta VISIBILE dopo append. */
  newNodeIds?: readonly string[]
  locale?: string
}

const KIND_COLOR: Record<DashboardNodeKind, string> = {
  concept: "#2f6fed",
  material: "#0f9d8f",
  error: "#e5484d",
  exercise: "#7c5cff",
  lesson: "#64748b",
}
const KIND_LABEL_IT: Record<DashboardNodeKind, string> = {
  concept: "concetto",
  material: "materiale",
  error: "errore",
  exercise: "esercizio",
  lesson: "lezione",
}
const EDGE_LABEL_IT: Record<EdgeKind, string> = {
  cita: "cita",
  "deriva-da": "deriva da",
  corregge: "corregge",
}
const EDGE_COLOR: Record<EdgeKind, string> = {
  cita: "#94a3b8",
  "deriva-da": "#64748b",
  corregge: "#16a34a",
}

const VIEW_W = 640
const VIEW_H = 420

// Layout responsivo senza toccare il CSS globale: due colonne su desktop,
// una sola (canvas sopra, descrittori sotto) su mobile/tablet stretto.
const ZGRAPH_LAYOUT_CSS = `
.zgraph-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:16px;align-items:start}
@media (max-width:640px){.zgraph-layout{grid-template-columns:1fr}}
`
const CX = VIEW_W / 2
const CY = VIEW_H / 2
const RING = [0, 118, 190] // raggio per profondità 0/1/2+

function labelText(label: Labels, locale: string): string {
  return label[locale] ?? label.it ?? Object.values(label)[0] ?? "(senza etichetta)"
}

function byId(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/** Profondità BFS (archi non orientati) dal focus; sconosciuta → ultimo anello. */
function depthMap(nodes: readonly GraphCanvasNode[], edges: readonly GraphCanvasEdge[], focus: string | null): Map<string, number> {
  const depth = new Map<string, number>()
  if (focus === null || !nodes.some((n) => n.id === focus)) return depth
  const adj = new Map<string, Set<string>>()
  for (const n of nodes) adj.set(n.id, new Set())
  for (const e of edges) {
    adj.get(e.from)?.add(e.to)
    adj.get(e.to)?.add(e.from)
  }
  depth.set(focus, 0)
  let frontier = [focus]
  let d = 0
  while (frontier.length > 0) {
    const next: string[] = []
    for (const id of frontier) {
      for (const nb of [...(adj.get(id) ?? [])].sort()) {
        if (!depth.has(nb)) {
          depth.set(nb, d + 1)
          next.push(nb)
        }
      }
    }
    frontier = next
    d += 1
  }
  return depth
}

interface Placed extends GraphCanvasNode {
  x: number
  y: number
  depth: number
}

function layout(nodes: readonly GraphCanvasNode[], edges: readonly GraphCanvasEdge[], focus: string | null): Placed[] {
  const depth = depthMap(nodes, edges, focus)
  const sorted = [...nodes].sort(byId)
  // Raggruppa per anello: 0 (focus), 1, 2+ (anche i nodi senza profondità nota).
  const rings = new Map<number, GraphCanvasNode[]>()
  for (const n of sorted) {
    const d = Math.min(depth.get(n.id) ?? 2, 2)
    const bucket = rings.get(d) ?? []
    bucket.push(n)
    rings.set(d, bucket)
  }
  const placed: Placed[] = []
  for (const [d, bucket] of [...rings.entries()].sort((a, b) => a[0] - b[0])) {
    const r = RING[d] ?? RING[2]
    if (d === 0) {
      for (const n of bucket) placed.push({ ...n, x: CX, y: CY, depth: 0 })
      continue
    }
    const step = (Math.PI * 2) / bucket.length
    bucket.forEach((n, i) => {
      // start in alto (-90°), leggero sfasamento per anello per non allineare i raggi
      const angle = -Math.PI / 2 + i * step + (d === 2 ? step / 2 : 0)
      placed.push({ ...n, x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle), depth: d })
    })
  }
  return placed
}

export default function LessonGraphCanvas({
  focusNodeId,
  nodes,
  edges,
  onFocusNode,
  newNodeIds,
  locale = "it",
}: LessonGraphCanvasProps) {
  const placed = useMemo(() => layout(nodes, edges, focusNodeId), [nodes, edges, focusNodeId])
  const posById = useMemo(() => new Map(placed.map((n) => [n.id, n])), [placed])
  const deltaSet = useMemo(() => new Set(newNodeIds ?? []), [newNodeIds])
  const focusNode = focusNodeId !== null ? posById.get(focusNodeId) ?? null : null

  // Archi incidenti al focus per il pannello descrittori (relazioni del nodo).
  const focusEdges = focusNode
    ? edges.filter((e) => e.from === focusNode.id || e.to === focusNode.id)
    : []

  return (
    <div className="zgraph-layout">
      <style>{ZGRAPH_LAYOUT_CSS}</style>
      <div style={{ position: "relative", overflowX: "auto" }}>
        <svg
          data-zgraph-canvas
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="group"
          aria-label="Grafo della lezione — vicinato del nodo in focus"
          style={{
            width: "100%",
            minWidth: 280,
            maxWidth: "100%",
            height: "auto",
            border: "1px solid var(--st-line, #d8d2c6)",
            borderRadius: 12,
            background: "var(--st-graph-bg, #fbfaf7)",
            display: "block",
          }}
        >
          {/* archi: segmenti reali dietro ai nodi */}
          <g>
            {edges.map((edge) => {
              const a = posById.get(edge.from)
              const b = posById.get(edge.to)
              if (!a || !b) return null
              const corrected = edge.correctedAt !== undefined
              return (
                <line
                  key={`${edge.from}:${edge.kind}:${edge.to}`}
                  data-zgraph-edge={`${edge.from}:${edge.kind}:${edge.to}`}
                  data-zgraph-edge-kind={edge.kind}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={EDGE_COLOR[edge.kind]}
                  strokeWidth={corrected ? 2.5 : 1.5}
                  strokeDasharray={edge.kind === "deriva-da" ? "5 4" : undefined}
                  strokeOpacity={0.75}
                >
                  <title>
                    {`${labelText(a.label, locale)} — ${EDGE_LABEL_IT[edge.kind]} → ${labelText(b.label, locale)}`}
                  </title>
                </line>
              )
            })}
          </g>

          {/* nodi: navigabili (button), colorati per tipo, focus enfatizzato */}
          {placed.map((node) => {
            const isFocus = node.id === focusNodeId
            const isNew = deltaSet.has(node.id)
            const r = isFocus ? 24 : 18
            const color = KIND_COLOR[node.kind]
            const name = labelText(node.label, locale)
            const handle = () => onFocusNode(node.id)
            return (
              <g
                key={node.id}
                data-zgraph-node={node.id}
                data-zgraph-node-kind={node.kind}
                {...(isNew ? { "data-delta": "new" } : {})}
                role="button"
                aria-label={name}
                aria-pressed={isFocus}
                tabIndex={0}
                onClick={handle}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handle()
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {isNew && (
                  <circle cx={node.x} cy={node.y} r={r + 6} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={isFocus ? color : "#ffffff"}
                  stroke={color}
                  strokeWidth={isFocus ? 3 : 2}
                />
                <text
                  x={node.x}
                  y={node.y + r + 14}
                  textAnchor="middle"
                  style={{ fontSize: 12, fontWeight: isFocus ? 700 : 500, fill: "var(--st-graph-fg, #1f3f63)" }}
                >
                  {name.length > 22 ? `${name.slice(0, 21)}…` : name}
                </text>
                <title>{`${KIND_LABEL_IT[node.kind]} · ${name}`}</title>
              </g>
            )
          })}
        </svg>

        {/* legenda tipi nodo */}
        <ul
          data-zgraph-legend
          style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11 }}
        >
          {(Object.keys(KIND_LABEL_IT) as DashboardNodeKind[]).map((kind) => (
            <li key={kind} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: KIND_COLOR[kind], display: "inline-block" }} />
              {KIND_LABEL_IT[kind]}
            </li>
          ))}
        </ul>
      </div>

      {/* pannello descrittori del nodo in focus — provenienza pseudonima, zero PII */}
      <aside
        data-testid="zgraph-descriptor"
        aria-label="Descrittori del nodo in focus"
        style={{
          border: "1px solid var(--st-line, #d8d2c6)",
          borderRadius: 12,
          padding: 14,
          display: "grid",
          gap: 10,
          fontSize: 13,
          minWidth: 0,
        }}
      >
        {focusNode === null ? (
          <p style={{ margin: 0, opacity: 0.7 }}>Seleziona un nodo del grafo per vederne tipo, relazioni ed evidenze.</p>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                data-zgraph-descriptor-kind={focusNode.kind}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  background: KIND_COLOR[focusNode.kind],
                  borderRadius: 999,
                  padding: "1px 9px",
                }}
              >
                {KIND_LABEL_IT[focusNode.kind]}
              </span>
              <strong style={{ fontSize: 14 }}>{labelText(focusNode.label, locale)}</strong>
            </div>

            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, opacity: 0.6, marginBottom: 4 }}>
                Relazioni
              </div>
              {focusEdges.length === 0 ? (
                <span style={{ opacity: 0.7 }}>nessun arco nel vicinato</span>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                  {focusEdges.map((edge) => {
                    const outbound = edge.from === focusNode.id
                    const otherId = outbound ? edge.to : edge.from
                    const other = posById.get(otherId)
                    return (
                      <li key={`${edge.from}:${edge.kind}:${edge.to}`} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                        <span style={{ color: EDGE_COLOR[edge.kind], fontWeight: 600 }} title={outbound ? "verso" : "da"}>
                          {outbound ? "↦" : "↤"} {EDGE_LABEL_IT[edge.kind]}
                        </span>
                        <span style={{ opacity: 0.85 }}>{other ? labelText(other.label, locale) : otherId}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, opacity: 0.6, marginBottom: 4 }}>
                Evidenze
              </div>
              {focusNode.evidenceRefs.length === 0 ? (
                <span style={{ opacity: 0.7 }}>nessuna evidenza registrata</span>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {focusNode.evidenceRefs.map((ref) => (
                    <li
                      key={ref}
                      data-zgraph-evidence={ref}
                      title={ref}
                      style={{
                        fontSize: 11,
                        border: "1px solid var(--st-line, #d8d2c6)",
                        borderRadius: 6,
                        padding: "1px 7px",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    >
                      {ref}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
