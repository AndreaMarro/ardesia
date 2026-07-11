import { useCallback, useEffect, useMemo, useState } from "react"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import { materialize, type LessonNode } from "../lessonos/materializer"
import type { AppendedEvent } from "../lessonos/eventlog"
import type { DashboardNodeKind } from "../lessonos/teacherDashboardProjection"
import EmptyState from "./EmptyState"
import LessonGraphCanvas from "./LessonGraphCanvas"
import ViewNav, { viewHref } from "./ViewNav"

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

/** La vista usa l'ultima sessione effettivamente aperta per la stanza, mai un log globale implicito. */
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
      // Il materializer conserva correttamente una label vuota quando l'evento
      // non ne dichiara una. La superficie docente mostra allora l'ID reso
      // leggibile, non un placeholder che sembri un dato mancante.
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

function eventLabel(event: AppendedEvent): string {
  if (event.kind === "arduino.compile.completed") return event.diagnostic
  if (event.kind === "elabtutor.command.issued") return event.diagnostic
  if ("labels" in event) return labelOf(event.labels, event.kind)
  if (event.kind === "lesson.started") return "Lezione avviata"
  if (event.kind === "lesson.ended") return "Lezione conclusa"
  return event.kind
}

type ExplorerState =
  | { phase: "loading" }
  | { phase: "error"; detail: string }
  | { phase: "ready"; snapshot: KnowledgeExplorerSnapshot }

export default function KnowledgeExplorerView({ deps }: { deps?: KnowledgeExplorerViewDeps }) {
  const room = deps?.room ?? roomFromHash()
  const loadEvents = deps?.loadEvents ?? loadEventsFromStore
  const [state, setState] = useState<ExplorerState>({ phase: "loading" })
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)

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

  const focusedNode = useMemo(() => {
    if (state.phase !== "ready" || focusNodeId === null) return null
    return state.snapshot.nodes.find((node) => node.id === focusNodeId) ?? null
  }, [focusNodeId, state])

  const snapshot = state.phase === "ready" ? state.snapshot : null

  return (
    <div style={pageStyle} data-knowledge-explorer>
      <header className="st-bar" style={headerStyle}>
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <div style={titleBlockStyle}>
          <span style={eyebrowStyle}>Knowledge Explorer</span>
          <strong style={titleStyle}>Tracce della lezione</strong>
        </div>
        <div style={headerActionsStyle}>
          <ViewNav current="knowledge" />
          <button type="button" className="st-ghost" onClick={() => void refresh()} disabled={state.phase === "loading"}>
            aggiorna
          </button>
          <a className="st-ghost" href={viewHref("lavagna", room)}>
            lavagna
          </a>
        </div>
      </header>

      <main style={mainStyle}>
        <section aria-label="Contesto lezione" style={contextStyle}>
          <div>
            <span style={eyebrowStyle}>Lezione</span>
            <h1 style={headingStyle}>{room || "Nessuna lezione selezionata"}</h1>
          </div>
          <div style={breadcrumbStyle} aria-label="Percorso Knowledge Explorer">
            <span>Lezione</span>
            <span aria-hidden>›</span>
            <span>Eventi</span>
            <span aria-hidden>›</span>
            <strong>Grafo</strong>
          </div>
        </section>

        {state.phase === "loading" && <p aria-busy="true" style={quietStyle}>Leggo la memoria della lezione…</p>}

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
            detail="Apri la lavagna, aggiungi un post-it e compi un'azione: qui compariranno solo gli eventi registrati da LessonOS."
            hint="La vista non combina eventi di lezioni diverse."
          />
        )}

        {snapshot !== null && snapshot.sessionFound && (
          <>
            <section aria-label="Sintesi della sessione" style={summaryGridStyle}>
              <Metric label="Eventi" value={snapshot.events.length} color="#ed6b4f" />
              <Metric label="Nodi" value={snapshot.nodes.length} color="#2f6fed" />
              <Metric label="Evidenze" value={snapshot.evidenceRefs.length} color="#dfaa23" />
            </section>

            <section aria-labelledby="knowledge-graph-title" style={graphSectionStyle}>
              <div style={sectionHeadingStyle}>
                <div>
                  <span style={eyebrowStyle}>Mappa</span>
                  <h2 id="knowledge-graph-title" style={sectionTitleStyle}>Concetti e prove</h2>
                </div>
                {focusedNode !== null && <span style={focusChipStyle}>{labelOf(focusedNode.label, focusedNode.id)}</span>}
              </div>
              {snapshot.nodes.length === 0 ? (
                <EmptyState
                  compact
                  title="Gli eventi sono registrati, il grafo e' ancora vuoto"
                  detail="Il prossimo solve, errore o concetto con evidenza rendera' la relazione navigabile."
                />
              ) : (
                <LessonGraphCanvas
                  focusNodeId={focusNodeId}
                  nodes={snapshot.nodes}
                  edges={snapshot.edges}
                  onFocusNode={setFocusNodeId}
                  locale="it"
                />
              )}
            </section>

            <section aria-label="Eventi ed evidenze" style={detailGridStyle}>
              <div style={detailSectionStyle}>
                <div style={sectionHeadingStyle}>
                  <div>
                    <span style={eyebrowStyle}>Sequenza</span>
                    <h2 style={sectionTitleStyle}>Eventi</h2>
                  </div>
                </div>
                <ol style={timelineStyle}>
                  {snapshot.events.map((event) => (
                    <li key={event.seq} data-knowledge-event={event.kind} style={timelineItemStyle}>
                      <span style={sequenceStyle}>#{event.seq}</span>
                      <span>{eventLabel(event)}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div style={detailSectionStyle}>
                <div style={sectionHeadingStyle}>
                  <div>
                    <span style={eyebrowStyle}>Provenienza</span>
                    <h2 style={sectionTitleStyle}>Evidenze</h2>
                  </div>
                </div>
                <ul style={evidenceListStyle}>
                  {snapshot.evidenceRefs.map((ref) => <li key={ref}><code>{ref}</code></li>)}
                </ul>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={metricStyle}>
      <span style={{ ...metricAccentStyle, background: color }} aria-hidden />
      <span style={metricLabelStyle}>{label}</span>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  )
}

const pageStyle = { minHeight: "100vh", background: "#f8f5ed", color: "#17324d" } as const
const headerStyle = { height: "auto", minHeight: 60, flexWrap: "wrap", gap: 10, paddingTop: 8, paddingBottom: 8 } as const
const titleBlockStyle = { display: "grid", gap: 1, minWidth: 150 } as const
const headerActionsStyle = { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, maxWidth: "100%", overflowX: "auto", paddingBottom: 2 } as const
const mainStyle = { boxSizing: "border-box", width: "min(1320px, 100%)", margin: "0 auto", padding: "24px clamp(16px, 3vw, 40px) 44px", display: "grid", gap: 20 } as const
const contextStyle = { display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingBottom: 16, borderBottom: "2px solid #17324d" } as const
const eyebrowStyle = { display: "block", color: "#5c6f81", fontSize: 12, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" } as const
const titleStyle = { fontSize: 16, letterSpacing: 0 } as const
const headingStyle = { margin: "2px 0 0", fontSize: 26, letterSpacing: 0, overflowWrap: "anywhere" } as const
const breadcrumbStyle = { display: "flex", gap: 8, alignItems: "center", color: "#556a7e", fontSize: 14, flexWrap: "wrap" } as const
const quietStyle = { color: "#556a7e", margin: 0 } as const
const summaryGridStyle = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 } as const
const metricStyle = { minWidth: 0, minHeight: 92, padding: 14, border: "1px solid #d9d2c5", borderRadius: 8, background: "#fffdf8", display: "grid", gridTemplateColumns: "6px 1fr", columnGap: 10, alignItems: "center" } as const
const metricAccentStyle = { gridRow: "1 / span 2", width: 6, height: "100%", borderRadius: 4 } as const
const metricLabelStyle = { color: "#556a7e", fontSize: 13 } as const
const metricValueStyle = { fontSize: 30, lineHeight: 1, letterSpacing: 0 } as const
const graphSectionStyle = { display: "grid", gap: 12, padding: "20px 0", borderTop: "1px solid #d9d2c5", borderBottom: "1px solid #d9d2c5" } as const
const sectionHeadingStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } as const
const sectionTitleStyle = { margin: "2px 0 0", fontSize: 20, letterSpacing: 0 } as const
const focusChipStyle = { maxWidth: "100%", overflowWrap: "anywhere", padding: "4px 9px", borderRadius: 999, background: "#dce9ff", color: "#1e4d95", fontSize: 13, fontWeight: 700 } as const
const detailGridStyle = { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)", gap: 28 } as const
const detailSectionStyle = { minWidth: 0, display: "grid", gap: 12 } as const
const timelineStyle = { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 } as const
const timelineItemStyle = { display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 10, alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid #e6dfd2", overflowWrap: "anywhere" } as const
const sequenceStyle = { color: "#5c6f81", fontFamily: "var(--m-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)", fontSize: 12 } as const
const evidenceListStyle = { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 7, overflowWrap: "anywhere" } as const
