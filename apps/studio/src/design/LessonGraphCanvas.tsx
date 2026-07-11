import cytoscape, { type Core, type NodeSingular } from "cytoscape"
import { useEffect, useMemo, useRef, useState } from "react"
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
  newNodeIds?: readonly string[]
  locale?: string
}

const KIND_COLOR: Record<DashboardNodeKind, string> = {
  concept: "#86a7cb",
  material: "#ef9a76",
  error: "#df7256",
  exercise: "#b8d79a",
  lesson: "#efca72",
  plugin: "#9bb9d7",
}

const KIND_LABEL_IT: Record<DashboardNodeKind, string> = {
  concept: "concetto",
  material: "materiale",
  error: "errore",
  exercise: "prova",
  lesson: "lezione",
  plugin: "plugin",
}

const EDGE_LABEL_IT: Record<EdgeKind, string> = {
  cita: "cita",
  "deriva-da": "deriva da",
  corregge: "corregge",
}

const EDGE_COLOR: Record<EdgeKind, string> = {
  cita: "#92a5b8",
  "deriva-da": "#70879c",
  corregge: "#5f9f72",
}

const LEVEL_COLOR = ["#44709e", "#7cab78", "#e3ad38", "#dd7458"]

const GRAPH_CSS = `
.zgraph-layout{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px;min-height:0;height:100%}
.zgraph-stage{position:relative;min-width:0;min-height:440px;overflow:hidden;border:1px solid var(--m-line-2,#d8d2c6);border-radius:8px;background:var(--m-canvas,#fffdf8)}
.zgraph-cy{position:absolute;inset:0;touch-action:none}
.zgraph-tools{position:absolute;left:12px;bottom:12px;z-index:3;display:flex;align-items:center;gap:4px;padding:4px;border:1px solid var(--m-line-2,#d8d2c6);border-radius:8px;background:rgba(255,253,248,.94);box-shadow:var(--m-shadow-pop,0 4px 16px rgba(31,45,61,.12))}
.zgraph-tool{width:34px;height:34px;border:0;border-radius:6px;background:transparent;color:var(--m-ink-2,#28425d);font:600 18px/1 var(--m-font-ui,system-ui);cursor:pointer}
.zgraph-tool:hover,.zgraph-tool:focus-visible{background:var(--m-fill,#eef0f2);outline:2px solid transparent}
.zgraph-node-list{position:absolute;left:12px;top:12px;z-index:3;max-width:min(260px,calc(100% - 24px));font-size:12px}
.zgraph-node-list summary{width:max-content;padding:6px 9px;border:1px solid var(--m-line-2,#d8d2c6);border-radius:6px;background:rgba(255,253,248,.94);cursor:pointer}
.zgraph-node-list ul{max-height:220px;overflow:auto;list-style:none;margin:4px 0 0;padding:5px;display:grid;gap:3px;border:1px solid var(--m-line-2,#d8d2c6);border-radius:6px;background:rgba(255,253,248,.98);box-shadow:var(--m-shadow-pop,0 4px 16px rgba(31,45,61,.12))}
.zgraph-node-list button{width:100%;min-height:32px;padding:5px 8px;border:0;border-radius:4px;background:transparent;color:var(--m-ink-2,#28425d);font:inherit;text-align:left;cursor:pointer}
.zgraph-node-list button[aria-pressed=true]{background:var(--m-accent-wash,#e8eef8);font-weight:700}
.zgraph-minimap{position:absolute;right:12px;bottom:12px;z-index:3;width:150px;height:94px;border:1px solid var(--m-line-2,#d8d2c6);border-radius:6px;background:rgba(255,253,248,.96);box-shadow:var(--m-shadow-pop,0 4px 16px rgba(31,45,61,.12))}
.zgraph-empty{position:absolute;inset:0;z-index:2;display:grid;place-items:center;padding:24px;color:var(--m-ink-3,#607080);font-size:13px;text-align:center;pointer-events:none}
.zgraph-rail{min-width:0;overflow:auto;border-left:1px solid var(--m-line,#e3ded5);padding:4px 4px 4px 14px;font-size:12px}
.zgraph-rail h3{margin:0;padding:8px 0 10px;border-bottom:1px solid var(--m-line,#e3ded5);font-size:13px}
.zgraph-rail-section{padding:11px 0;border-bottom:1px solid var(--m-line,#e3ded5)}
.zgraph-rail-label{display:block;margin-bottom:5px;color:var(--m-ink-4,#718092);font-size:10px;text-transform:uppercase}
.zgraph-rail ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;overflow-wrap:anywhere}
.zgraph-legend{position:absolute;left:50%;bottom:17px;z-index:3;transform:translateX(-50%);list-style:none;margin:0;padding:6px 10px;display:flex;align-items:center;gap:9px;border:1px solid var(--m-line,#e3ded5);border-radius:8px;background:rgba(255,253,248,.94);font-size:10px}
.zgraph-legend li{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
@media(max-width:760px){.zgraph-layout{grid-template-columns:1fr;height:auto}.zgraph-stage{min-height:400px}.zgraph-rail{border-left:0;border-top:1px solid var(--m-line,#e3ded5);padding:10px 0 0;max-height:220px}.zgraph-minimap{width:120px;height:76px}.zgraph-legend{left:auto;right:12px;bottom:96px;transform:none}}
`

interface MiniNode {
  id: string
  x: number
  y: number
  color: string
  focused: boolean
}

interface MiniEdge {
  id: string
  source: string
  target: string
  color: string
}

interface MiniGraph {
  nodes: MiniNode[]
  edges: MiniEdge[]
}

function labelText(label: Labels, locale: string): string {
  return label[locale] ?? label.it ?? Object.values(label)[0] ?? "(senza etichetta)"
}

function byId(a: { id: string }, b: { id: string }): number {
  return a.id.localeCompare(b.id)
}

export function graphDepths(
  nodes: readonly GraphCanvasNode[],
  edges: readonly GraphCanvasEdge[],
  focus: string | null,
): Map<string, number> {
  const depth = new Map<string, number>()
  if (focus === null || !nodes.some((node) => node.id === focus)) return depth
  const adjacency = new Map(nodes.map((node) => [node.id, new Set<string>()]))
  for (const edge of edges) {
    adjacency.get(edge.from)?.add(edge.to)
    adjacency.get(edge.to)?.add(edge.from)
  }
  depth.set(focus, 0)
  let frontier = [focus]
  while (frontier.length > 0) {
    const next: string[] = []
    for (const id of frontier) {
      for (const neighbor of [...(adjacency.get(id) ?? [])].sort()) {
        if (depth.has(neighbor)) continue
        depth.set(neighbor, (depth.get(id) ?? 0) + 1)
        next.push(neighbor)
      }
    }
    frontier = next
  }
  return depth
}

function reducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function isJsdom(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("jsdom")
}

function edgeId(edge: GraphCanvasEdge, index: number): string {
  return `edge:${index}:${edge.from}:${edge.kind}:${edge.to}`
}

function layoutGraph(cy: Core, focusNodeId: string | null, animate: boolean, afterLayout: () => void): () => void {
  const focus = focusNodeId === null ? cy.collection() : cy.getElementById(focusNodeId)
  const depths = new Map<string, number>()
  cy.nodes().forEach((node) => {
    depths.set(node.id(), Number(node.data("depth")))
  })
  const maximumDepth = Math.max(0, ...depths.values())
  const layout = cy.layout({
    name: "concentric",
    fit: false,
    padding: 58,
    avoidOverlap: true,
    minNodeSpacing: 54,
    startAngle: -Math.PI / 2,
    sweep: Math.PI * 2,
    clockwise: true,
    equidistant: true,
    animate,
    animationDuration: animate ? 280 : 0,
    concentric: (node: NodeSingular) => maximumDepth - (depths.get(node.id()) ?? maximumDepth),
    levelWidth: () => 1,
  })
  let cancelled = false
  let frame: number | null = null
  const active = () => !cancelled && !cy.destroyed()
  const finish = () => {
    frame = null
    if (!active()) return
    const framed = focus.nonempty() ? focus.closedNeighborhood() : cy.elements()
    if (!active()) return
    cy.fit(framed, focus.nonempty() ? 88 : 58)
    if (active()) afterLayout()
  }
  const onLayoutStop = () => {
    if (!active()) return
    if (animate && typeof requestAnimationFrame === "function") {
      frame = requestAnimationFrame(finish)
      return
    }
    finish()
  }
  cy.one("layoutstop", onLayoutStop)
  layout.run()

  return () => {
    cancelled = true
    if (frame !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame)
    cy.off("layoutstop", onLayoutStop)
    if (!cy.destroyed()) layout.stop()
  }
}

function snapshotMiniGraph(cy: Core, focusedId: string | null): MiniGraph {
  const raw = cy.nodes().map((node) => ({ id: node.id(), position: node.position(), color: String(node.data("color")) }))
  if (raw.length === 0) return { nodes: [], edges: [] }
  const xs = raw.map((node) => node.position.x)
  const ys = raw.map((node) => node.position.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = Math.max(1, maxX - minX)
  const height = Math.max(1, maxY - minY)
  const nodes = raw.map((node) => ({
    id: node.id,
    x: 10 + ((node.position.x - minX) / width) * 140,
    y: 10 + ((node.position.y - minY) / height) * 80,
    color: node.color,
    focused: node.id === focusedId,
  }))
  const edges = cy.edges().map((edge) => ({
    id: edge.id(),
    source: edge.source().id(),
    target: edge.target().id(),
    color: String(edge.data("color")),
  }))
  return { nodes, edges }
}

export default function LessonGraphCanvas({
  focusNodeId,
  nodes,
  edges,
  onFocusNode,
  newNodeIds,
  locale = "it",
}: LessonGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const focusRef = useRef(focusNodeId)
  const onFocusRef = useRef(onFocusNode)
  const modelSignatureRef = useRef("")
  const [miniGraph, setMiniGraph] = useState<MiniGraph>({ nodes: [], edges: [] })
  focusRef.current = focusNodeId
  onFocusRef.current = onFocusNode

  const sortedNodes = useMemo(() => [...nodes].sort(byId), [nodes])
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const depth = useMemo(() => graphDepths(nodes, edges, focusNodeId), [edges, focusNodeId, nodes])
  const deltaSet = useMemo(() => new Set(newNodeIds ?? []), [newNodeIds])
  const modelSignature = useMemo(() => JSON.stringify({
    nodes: sortedNodes.map((node) => [node.id, node.kind, labelText(node.label, locale), deltaSet.has(node.id)]),
    edges: edges.map((edge) => [edge.from, edge.to, edge.kind, edge.correctedAt]),
  }), [deltaSet, edges, locale, sortedNodes])
  const focusNode = focusNodeId === null ? null : nodeById.get(focusNodeId) ?? null
  const focusEdges = focusNode === null
    ? []
    : edges.filter((edge) => edge.from === focusNode.id || edge.to === focusNode.id)
  const levels = useMemo(() => {
    const values = new Set<number>()
    for (const node of nodes) values.add(Math.min(depth.get(node.id) ?? 3, 3))
    return [...values].sort((a, b) => a - b)
  }, [depth, nodes])

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return
    const headless = isJsdom()
    const cy = cytoscape({
      container: headless ? undefined : container,
      headless,
      elements: [],
      style: headless ? undefined : [
        {
          selector: "node",
          style: {
            width: 66,
            height: 66,
            "background-color": "#fffdf8",
            "border-color": "data(color)",
            "border-width": 2,
            label: "data(label)",
            color: "#263f5a",
            "font-family": "Inter, ui-sans-serif, system-ui, sans-serif",
            "font-size": 11,
            "font-weight": 600,
            "text-wrap": "wrap",
            "text-max-width": "74px",
            "text-valign": "center",
            "text-halign": "center",
            "overlay-opacity": 0,
          },
        },
        {
          selector: "node.is-focus",
          style: {
            width: 88,
            height: 88,
            "background-color": "#294968",
            "border-color": "#294968",
            "border-width": 4,
            color: "#ffffff",
            "font-size": 12,
            "text-max-width": "82px",
          },
        },
        {
          selector: "node.is-muted",
          style: { opacity: 0.34 },
        },
        {
          selector: "node.is-new",
          style: {
            "border-width": 5,
            "border-style": "double",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.4,
            "line-color": "data(color)",
            "target-arrow-color": "data(color)",
            "target-arrow-shape": "triangle",
            "arrow-scale": 0.7,
            "curve-style": "bezier",
            opacity: 0.72,
          },
        },
        {
          selector: "edge[kind = 'deriva-da']",
          style: { "line-style": "dashed" },
        },
        {
          selector: "edge.is-muted",
          style: { opacity: 0.16 },
        },
      ],
      minZoom: 0.42,
      maxZoom: 2.4,
      motionBlur: false,
      selectionType: "single",
      boxSelectionEnabled: false,
      autoungrabify: true,
      panningEnabled: true,
      userPanningEnabled: true,
      zoomingEnabled: true,
      userZoomingEnabled: true,
    })
    cyRef.current = cy
    cy.on("select", "node", (event) => {
      const id = event.target.id()
      if (id !== focusRef.current) onFocusRef.current(id)
    })
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      if (!cy.destroyed()) cy.resize()
    })
    resizeObserver?.observe(container)
    return () => {
      resizeObserver?.disconnect()
      cyRef.current = null
      if (!cy.destroyed()) {
        cy.stop()
        cy.destroy()
      }
    }
  }, [])

  useEffect(() => {
    const cy = cyRef.current
    if (cy === null || cy.destroyed()) return
    const depths = graphDepths(nodes, edges, focusNodeId)
    const dataChanged = modelSignatureRef.current !== modelSignature
    if (dataChanged) {
      const knownIds = new Set(nodes.map((node) => node.id))
      cy.startBatch()
      cy.elements().remove()
      cy.add([
        ...sortedNodes.map((node) => ({
          group: "nodes" as const,
          data: {
            id: node.id,
            label: labelText(node.label, locale),
            kind: node.kind,
            color: KIND_COLOR[node.kind],
            depth: Math.min(depths.get(node.id) ?? 3, 3),
          },
          classes: deltaSet.has(node.id) ? "is-new" : "",
        })),
        ...edges.flatMap((edge, index) => knownIds.has(edge.from) && knownIds.has(edge.to) ? [{
          group: "edges" as const,
          data: {
            id: edgeId(edge, index),
            source: edge.from,
            target: edge.to,
            kind: edge.kind,
            color: EDGE_COLOR[edge.kind],
          },
        }] : []),
      ])
      cy.endBatch()
      modelSignatureRef.current = modelSignature
    } else {
      cy.nodes().forEach((node) => {
        node.data("depth", Math.min(depths.get(node.id()) ?? 3, 3))
      })
    }
    const focus = focusNodeId === null ? cy.collection() : cy.getElementById(focusNodeId)
    cy.elements().removeClass("is-focus is-muted")
    cy.nodes().unselect()
    if (focus.nonempty()) {
      focus.addClass("is-focus").select()
      const neighborhood = focus.closedNeighborhood()
      cy.elements().not(neighborhood).addClass("is-muted")
    }
    return layoutGraph(cy, focusNodeId, !dataChanged && !isJsdom() && !reducedMotion(), () => {
      if (cyRef.current === cy && !cy.destroyed()) setMiniGraph(snapshotMiniGraph(cy, focusRef.current))
    })
  }, [deltaSet, edges, focusNodeId, locale, modelSignature, nodes, sortedNodes])

  const changeZoom = (factor: number) => {
    const cy = cyRef.current
    if (cy === null || cy.destroyed()) return
    cy.zoom(Math.max(cy.minZoom(), Math.min(cy.maxZoom(), cy.zoom() * factor)))
    setMiniGraph(snapshotMiniGraph(cy, focusRef.current))
  }

  const focusNeighborhood = () => {
    const cy = cyRef.current
    if (cy === null || cy.destroyed()) return
    const focus = focusNodeId === null ? cy.elements() : cy.getElementById(focusNodeId).closedNeighborhood()
    if (reducedMotion()) cy.fit(focus, 88)
    else cy.animate({ fit: { eles: focus, padding: 88 } }, { duration: 240 })
  }

  const miniNodeById = new Map(miniGraph.nodes.map((node) => [node.id, node]))

  return (
    <div className="zgraph-layout">
      <style>{GRAPH_CSS}</style>
      <div className="zgraph-stage">
        <div
          ref={containerRef}
          className="zgraph-cy"
          data-cytoscape-graph
          role="img"
          aria-label="Grafo interattivo della lezione: trascina per spostarti e usa il gesto di pizzico per lo zoom"
        />

        {nodes.length === 0 && <p className="zgraph-empty">Nessun nodo corrisponde ai filtri correnti.</p>}

        <details className="zgraph-node-list" data-knowledge-node-list>
          <summary>Nodi ({nodes.length})</summary>
          <ul aria-label="Nodi del grafo">
            {sortedNodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  data-zgraph-node={node.id}
                  data-zgraph-node-kind={node.kind}
                  {...(deltaSet.has(node.id) ? { "data-delta": "new" } : {})}
                  aria-pressed={node.id === focusNodeId}
                  onClick={() => onFocusNode(node.id)}
                >
                  {labelText(node.label, locale)}
                </button>
              </li>
            ))}
          </ul>
        </details>

        <div className="zgraph-tools" aria-label="Controlli del grafo">
          <button className="zgraph-tool" type="button" aria-label="Riduci zoom" title="Riduci zoom" onClick={() => changeZoom(0.82)}>−</button>
          <button className="zgraph-tool" type="button" aria-label="Aumenta zoom" title="Aumenta zoom" onClick={() => changeZoom(1.22)}>+</button>
          <button className="zgraph-tool" type="button" aria-label="Centra il vicinato" title="Centra il vicinato" onClick={focusNeighborhood}>◎</button>
        </div>

        <ul className="zgraph-legend" data-zgraph-legend aria-label="Livelli del grafo">
          <li>Livelli</li>
          {levels.map((level) => (
            <li key={level}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: LEVEL_COLOR[level], display: "inline-block" }} />
              {level + 1}
            </li>
          ))}
        </ul>

        <svg
          className="zgraph-minimap"
          data-knowledge-minimap
          data-zgraph-canvas
          viewBox="0 0 160 100"
          aria-hidden="true"
        >
          {miniGraph.edges.map((edge) => {
            const source = miniNodeById.get(edge.source)
            const target = miniNodeById.get(edge.target)
            if (source === undefined || target === undefined) return null
            return (
              <line
                key={edge.id}
                data-zgraph-edge={`${edge.source}:${edge.id}:${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.color}
                strokeWidth="1"
              />
            )
          })}
          {miniGraph.nodes.map((node) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.focused ? 5 : 3.5}
              fill={node.focused ? "#294968" : node.color}
              stroke="#fffdf8"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <aside className="zgraph-rail" data-testid="zgraph-descriptor" aria-label="Evidenze del nodo in focus">
        <h3>Evidenze</h3>
        {focusNode === null ? (
          <p>Seleziona un nodo per leggere relazioni e provenienza registrate.</p>
        ) : (
          <>
            <div className="zgraph-rail-section">
              <span className="zgraph-rail-label">{KIND_LABEL_IT[focusNode.kind]}</span>
              <strong>{labelText(focusNode.label, locale)}</strong>
            </div>
            <div className="zgraph-rail-section">
              <span className="zgraph-rail-label">Relazioni</span>
              {focusEdges.length === 0 ? (
                <span>nessuna relazione nel vicinato</span>
              ) : (
                <ul>
                  {focusEdges.map((edge, index) => {
                    const outbound = edge.from === focusNode.id
                    const otherId = outbound ? edge.to : edge.from
                    const other = nodeById.get(otherId)
                    return (
                      <li key={edgeId(edge, index)}>
                        <span style={{ color: EDGE_COLOR[edge.kind], fontWeight: 700 }}>{EDGE_LABEL_IT[edge.kind]}</span>{" "}
                        {other === undefined ? otherId : labelText(other.label, locale)}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
            <div className="zgraph-rail-section">
              <span className="zgraph-rail-label">Provenienza</span>
              {focusNode.evidenceRefs.length === 0 ? (
                <span>nessuna evidenza registrata</span>
              ) : (
                <ul>
                  {focusNode.evidenceRefs.map((ref) => <li key={ref} data-zgraph-evidence={ref}><code>{ref}</code></li>)}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
