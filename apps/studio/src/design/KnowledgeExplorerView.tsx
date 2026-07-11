import { useCallback, useEffect, useMemo, useState } from "react"
import type { AppendedEvent } from "../lessonos/eventlog"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import { materialize, type LessonNode } from "../lessonos/materializer"
import type { DashboardNodeKind } from "../lessonos/teacherDashboardProjection"
import EmptyState from "./EmptyState"
import LessonGraphCanvas, { graphDepths } from "./LessonGraphCanvas"
import StudioShell from "./StudioShell"
import { viewHref } from "./ViewNav"

export interface KnowledgeExplorerViewDeps {
  loadEvents?: () => Promise<readonly AppendedEvent[]>
  room?: string
}

export interface KnowledgeExplorerSnapshot {
  sessionFound: boolean
  events: readonly AppendedEvent[]
  nodes: Array<{ id: string; kind: DashboardNodeKind; label: Record<string, string>; evidenceRefs: string[] }>
  edges: Array<{ from: string; to: string; kind: "cita" | "deriva-da" | "corregge" }>
  evidenceRefs: string[]
}

const NODE_KIND: Record<LessonNode["kind"], DashboardNodeKind> = {
  concetto: "concept",
  errore: "error",
  esercizio: "exercise",
  lesson: "lesson",
  materiale: "material",
  plugin: "plugin",
}

const KIND_LABEL: Record<DashboardNodeKind, string> = {
  concept: "Concetti",
  material: "Materiali",
  error: "Errori",
  exercise: "Prove",
  lesson: "Lezioni",
  plugin: "Plugin",
}

const KNOWLEDGE_CSS = `
.st-knowledge-view{height:100%;box-sizing:border-box;overflow:auto;padding:20px clamp(18px,3vw,42px) 22px;background:var(--m-paper,#f8f5ed)}
.st-knowledge-inner{width:min(1180px,100%);min-height:100%;margin:0 auto;display:grid;grid-template-rows:auto minmax(520px,1fr);gap:12px}
.st-knowledge-toolbar{display:grid;grid-template-columns:minmax(180px,1fr) auto auto;align-items:center;gap:12px;min-width:0}
.st-knowledge-title{min-width:0;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.st-knowledge-title h1{margin:0;font-size:16px;letter-spacing:0;overflow-wrap:anywhere}
.st-knowledge-metrics{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.st-knowledge-metric{display:inline-flex;align-items:center;gap:5px;min-height:28px;padding:0 9px;border:1px solid var(--m-line,#e3ded5);border-radius:8px;background:var(--m-canvas,#fffdf8);color:var(--m-ink-3,#607080);font-size:10px;white-space:nowrap}
.st-knowledge-metric strong{color:var(--m-ink,#1f3247);font-size:11px}
.st-knowledge-filters{display:flex;align-items:center;justify-content:flex-end;gap:7px;min-width:0}
.st-knowledge-search{position:relative;min-width:180px;width:min(260px,30vw)}
.st-knowledge-search::before{content:'⌕';position:absolute;left:10px;top:50%;transform:translateY(-52%);color:var(--m-ink-4,#718092);pointer-events:none}
.st-knowledge-search input,.st-knowledge-filters select{height:36px;box-sizing:border-box;border:1px solid var(--m-line-2,#d8d2c6);border-radius:7px;background:var(--m-canvas,#fffdf8);color:var(--m-ink-2,#28425d);font:500 11px/1 var(--m-font-ui,system-ui)}
.st-knowledge-search input{width:100%;padding:0 10px 0 29px}
.st-knowledge-filters select{padding:0 28px 0 10px}
.st-knowledge-graph{min-width:0;min-height:0;padding-top:10px;border-top:1px solid var(--m-line,#e3ded5)}
.st-knowledge-shell-action{width:42px;height:42px;border:1px solid var(--m-line-2,#d8d2c6);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--m-canvas,#fffdf8);color:var(--m-ink-2,#28425d);font:600 18px/1 var(--m-font-ui,system-ui);text-decoration:none;cursor:pointer}
@media(max-width:980px){.st-knowledge-toolbar{grid-template-columns:1fr}.st-knowledge-filters{justify-content:flex-start;overflow-x:auto;padding-bottom:2px}.st-knowledge-search{width:min(340px,65vw)}.st-knowledge-inner{grid-template-rows:auto auto}}
@media(max-width:600px){.st-knowledge-view{padding:14px 12px}.st-knowledge-filters{align-items:stretch;flex-wrap:wrap}.st-knowledge-search{width:100%;min-width:100%}.st-knowledge-filters select{flex:1;min-width:130px}.st-knowledge-metrics{gap:4px}}
`

async function loadEventsFromStore(): Promise<readonly AppendedEvent[]> {
  const store = await createEventLogStore()
  try {
    return await store.readAll()
  } finally {
    if ("close" in store) await (store as { close(): Promise<void> }).close()
  }
}

function roomFromHash(): string {
  if (typeof window === "undefined") return ""
  return window.location.hash.replace(/^#/, "").trim()
}

function bySequence(a: AppendedEvent, b: AppendedEvent): number {
  return a.seq - b.seq
}

export function selectRoomSession(events: readonly AppendedEvent[], room: string): readonly AppendedEvent[] {
  if (!room) return []
  const sorted = [...events].sort(bySequence)
  const start = [...sorted].reverse().find((event) => event.kind === "lesson.started" && event.room === room)
  if (!start) return []
  const end = sorted.find((event) => event.seq > start.seq && event.kind === "lesson.ended" && event.room === room)
  return sorted.filter((event) => event.seq >= start.seq && (end === undefined || event.seq <= end.seq))
}

export function buildKnowledgeExplorerSnapshot(events: readonly AppendedEvent[], room: string): KnowledgeExplorerSnapshot {
  const session = selectRoomSession(events, room)
  const graph = materialize([...session])
  const nodes = [...graph.nodes.values()]
    .map((node) => ({
      id: node.id,
      kind: NODE_KIND[node.kind],
      label: Object.keys(node.labels).length > 0 ? node.labels : { und: readableNodeId(node.id) },
      evidenceRefs: [...node.evidenceRefs],
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
  const evidenceRefs = [...new Set(session.flatMap((event) => event.evidence))].sort()
  return {
    sessionFound: session.length > 0,
    events: session,
    nodes,
    edges: graph.edges.map((edge) => ({ from: edge.from, to: edge.to, kind: edge.kind })),
    evidenceRefs,
  }
}

function readableNodeId(id: string): string {
  return id.replace(/[_-]+/g, " ")
}

function labelOf(labels: Record<string, string>, fallback: string): string {
  return labels.it ?? Object.values(labels)[0] ?? fallback
}

type ExplorerState =
  | { phase: "loading" }
  | { phase: "error"; detail: string }
  | { phase: "ready"; snapshot: KnowledgeExplorerSnapshot }

type LevelFilter = "all" | "1" | "2"
type KindFilter = "all" | DashboardNodeKind

export default function KnowledgeExplorerView({ deps }: { deps?: KnowledgeExplorerViewDeps }) {
  const room = deps?.room ?? roomFromHash()
  const loadEvents = deps?.loadEvents ?? loadEventsFromStore
  const [state, setState] = useState<ExplorerState>({ phase: "loading" })
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("2")
  const [kindFilter, setKindFilter] = useState<KindFilter>("all")

  const refresh = useCallback(async () => {
    setState({ phase: "loading" })
    try {
      const events = await loadEvents()
      const snapshot = buildKnowledgeExplorerSnapshot(events, room)
      setState({ phase: "ready", snapshot })
      setFocusNodeId((current) => current ?? snapshot.nodes.find((node) => node.kind === "concept")?.id ?? snapshot.nodes[0]?.id ?? null)
    } catch (error) {
      setState({ phase: "error", detail: error instanceof Error ? error.message : String(error) })
    }
  }, [loadEvents, room])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const snapshot = state.phase === "ready" ? state.snapshot : null
  const filteredGraph = useMemo(() => {
    if (snapshot === null) return { nodes: [], edges: [], focusNodeId: null }
    const normalizedQuery = query.trim().toLocaleLowerCase("it")
    const depth = graphDepths(snapshot.nodes, snapshot.edges, focusNodeId)
    const maximumDepth = levelFilter === "all" ? Number.POSITIVE_INFINITY : Number(levelFilter)
    const nodes = snapshot.nodes.filter((node) => {
      const matchesQuery = normalizedQuery.length === 0
        || `${node.id} ${labelOf(node.label, node.id)}`.toLocaleLowerCase("it").includes(normalizedQuery)
      const matchesKind = kindFilter === "all" || node.kind === kindFilter
      const matchesLevel = focusNodeId === null || (depth.get(node.id) ?? 2) <= maximumDepth
      return matchesQuery && matchesKind && matchesLevel
    })
    const ids = new Set(nodes.map((node) => node.id))
    return {
      nodes,
      edges: snapshot.edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to)),
      focusNodeId: focusNodeId !== null && ids.has(focusNodeId) ? focusNodeId : null,
    }
  }, [focusNodeId, kindFilter, levelFilter, query, snapshot])

  const actions = (
    <>
      <button
        type="button"
        className="st-knowledge-shell-action"
        aria-label="Aggiorna il grafo"
        title="Aggiorna il grafo"
        onClick={() => void refresh()}
        disabled={state.phase === "loading"}
      >
        ↻
      </button>
      <a className="st-knowledge-shell-action" aria-label="Apri la lavagna" title="Apri la lavagna" href={viewHref("lavagna", room)}>↗</a>
    </>
  )

  return (
    <StudioShell current="knowledge" searchLabel="Cerca nella conoscenza…" actions={actions}>
      <style>{KNOWLEDGE_CSS}</style>
      <div className="st-knowledge-view" data-knowledge-explorer>
        <div className="st-knowledge-inner">
          {state.phase === "loading" && <p aria-busy="true">Leggo la memoria della lezione…</p>}

          {state.phase === "error" && (
            <EmptyState
              tone="error"
              title="Knowledge Explorer non disponibile"
              detail="L'event log della lezione non e' leggibile: non mostro un grafo vuoto come se fosse completo."
              hint={state.detail}
            />
          )}

          {snapshot !== null && !snapshot.sessionFound && (
            <EmptyState
              title="Nessuna traccia per questa lezione"
              detail="Apri la lavagna e compi un'azione: qui compariranno solo i nodi materializzati da LessonOS."
              hint="La vista non combina eventi di lezioni diverse."
            />
          )}

          {snapshot !== null && snapshot.sessionFound && (
            <>
              <header className="st-knowledge-toolbar">
                <div className="st-knowledge-title">
                  <h1>Grafo della lezione</h1>
                  <div className="st-knowledge-metrics" aria-label="Metriche del grafo">
                    <Metric label="eventi" value={snapshot.events.length} />
                    <Metric label="nodi" value={snapshot.nodes.length} />
                    <Metric label="evidenze" value={snapshot.evidenceRefs.length} />
                  </div>
                </div>

                <div className="st-knowledge-metric" aria-live="polite">
                  <strong>{filteredGraph.nodes.length}</strong> visibili
                </div>

                <div className="st-knowledge-filters">
                  <label className="st-knowledge-search">
                    <span className="sr-only">Cerca nel grafo</span>
                    <input
                      type="search"
                      aria-label="Cerca nel grafo"
                      placeholder="Cerca nel grafo"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                  <select aria-label="Tipi" value={kindFilter} onChange={(event) => setKindFilter(event.target.value as KindFilter)}>
                    <option value="all">Tutti i tipi</option>
                    {(Object.keys(KIND_LABEL) as DashboardNodeKind[]).map((kind) => (
                      <option key={kind} value={kind}>{KIND_LABEL[kind]}</option>
                    ))}
                  </select>
                  <select aria-label="Livelli" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as LevelFilter)}>
                    <option value="1">Livello 1</option>
                    <option value="2">Livelli 1–2</option>
                    <option value="all">Tutti i livelli</option>
                  </select>
                </div>
              </header>

              <section className="st-knowledge-graph" aria-label="Mappa della conoscenza">
                <LessonGraphCanvas
                  focusNodeId={filteredGraph.focusNodeId}
                  nodes={filteredGraph.nodes}
                  edges={filteredGraph.edges}
                  onFocusNode={setFocusNodeId}
                  locale="it"
                />
              </section>
            </>
          )}
        </div>
      </div>
    </StudioShell>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <span className="st-knowledge-metric"><strong>{value}</strong> {label}</span>
}
