// Cruscotto docente (?vista=cruscotto) — TEACHER-DASHBOARD-SPEC: projection
// READ-ONLY dell'event log LessonOS, mai un secondo store. Micro-slice Z7
// (regola spec §7.10: ogni zona nuova = PR piccola con test): questa vista
// mostra SOLO la zona Student-pack (coda candidati da error.observed mai
// corretto, #100). Le altre zone arriveranno come slice successive.
//
// Onestà (spec §0.4): event log illeggibile → errore dichiarato, MAI una coda
// vuota spacciata per vera. Ogni riga porta le sue evidence refs (spec §0.3).

import ViewNav from "./ViewNav"
import LessonGraphCanvas from "./LessonGraphCanvas"
import StudentPackResult from "./StudentPackResult"
import {
  buildStudentPackArtifact,
  parseStudentPackArtifact,
  studentPackFileName,
  type StudentPackParseResult,
} from "../lessonos/studentPackArtifact"
import { useCallback, useEffect, useRef, useState } from "react"
import EmptyState from "./EmptyState"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import type { AppendedEvent, LessonOsEvent } from "../lessonos/eventlog"
import type { JournalEvent } from "../store/JournalRecorder"
import { deserializeEvents } from "../store/ReplayEngine"
import { roomPaths } from "../store/roomPaths"
import { workspaceStore } from "../store/WorkspaceStore"
import {
  projectTeacherDashboard,
  type TeacherDashboardProjection,
} from "../lessonos/teacherDashboardProjection"
import { mountRipassoPanel } from "../toolhost/panelHost"
import type { EventLogReadLike } from "../toolhost/caps/graph"

export interface TeacherDashboardViewDeps {
  /** Sorgente eventi (seam per i test jsdom); default: event log IndexedDB reale. */
  loadEvents?: () => Promise<readonly AppendedEvent[]>
  /** Journal lavagna della stessa stanza; default: raw/<room>/events.jsonl dal WorkspaceStore reale. */
  loadJournalEvents?: () => Promise<readonly JournalEvent[]>
  /** Room del journal letto e attribuito; default: quella dell'hash corrente. */
  journalRoom?: string
  /** Nodo iniziale del grafo; se assente viene derivato dal primo concetto/evento didattico. */
  focusNodeId?: string | null
  /** Sink degli eventi append-only (stessa memoria, mai un secondo store). */
  appendEvent?: (event: LessonOsEvent) => Promise<void>
  /**
   * Event-log in sola lettura per il ToolHost della zona ripasso (P0-LIVE):
   * default lo STESSO store LessonOS di loadEvents, mai un log separato.
   */
  eventLog?: EventLogReadLike
}

/** Vista read-only sull'event log reale: l'unico accesso concesso al ToolHost. */
const realEventLog: EventLogReadLike = {
  async readAll() {
    const store = await createEventLogStore()
    return store.readAll()
  },
}

async function loadEventsFromStore(): Promise<readonly AppendedEvent[]> {
  const store = await createEventLogStore()
  return store.readAll()
}

// Il journal è room-scoped da FB-4C2: leggere il path flat mostrerebbe nella
// lezione corrente gli eventi lasciati lì da un'altra (o nulla, dato che nessun
// writer scrive più flat) attribuendoli comunque a journalRoom.
async function loadJournalEventsFromStore(room: string): Promise<readonly JournalEvent[]> {
  if (workspaceStore.mode === "unavailable") await workspaceStore.init()
  const journalPath = roomPaths(room).journal
  const blob = await workspaceStore.read(journalPath)
  if (!blob) return []
  // Il source path non è decorativo: decodeJournalJsonl ne ricava la lessonId
  // attesa e rifiuta gli envelope v2 che dichiarano un'altra lezione. Omesso,
  // il default è il journal flat legacy, dove gli envelope v2 sono vietati.
  return deserializeEvents(await blob.text(), journalPath)
}

async function appendEventToStore(event: LessonOsEvent): Promise<void> {
  const store = await createEventLogStore()
  await store.append(event)
}

function roomFromHash(): string {
  const h = location.hash.replace(/^#/, "").trim()
  return h || "current"
}

function defaultFocusNodeId(events: readonly AppendedEvent[]): string | null {
  for (const ev of events) {
    if (ev.kind === "concept.introduced") return ev.conceptId
  }
  for (const ev of events) {
    if (ev.kind === "material.cited" && ev.conceptId !== undefined) return ev.conceptId
    if (ev.kind === "error.observed") return ev.conceptId
    if (ev.kind === "exercise.completed" && ev.conceptId !== undefined) return ev.conceptId
  }
  return null
}

type Z7Candidate = TeacherDashboardProjection["studentPackQueue"][number]

type Z7State =
  | { phase: "loading" }
  | { phase: "error"; detail: string }
  | { phase: "ready"; projection: TeacherDashboardProjection }

// D10: etichette docente per le stat del proiettore. Key sconosciuta → key
// verbatim (mai inventare né nascondere una stat che il proiettore ha derivato).
const STAT_LABELS_IT: Record<string, string> = {
  "lessons.count": "Lezioni",
  "board.elements.created": "Elementi creati sulla lavagna",
  "math.inserts.count": "Formule inserite",
  "manual.pages.viewed": "Pagine del manuale viste",
  "errors.count": "Errori osservati",
}

type RipassoZoneState =
  | { phase: "loading" }
  | { phase: "error"; detail: string }
  | { phase: "ready"; lines: readonly string[]; aperti: number }

/** Etichetta nella lingua del cruscotto, o la prima disponibile (mai inventata). */
function labelText(label: Record<string, string>): string {
  return label.it ?? Object.values(label)[0] ?? "(senza etichetta)"
}

export default function TeacherDashboardView({ deps }: { deps?: TeacherDashboardViewDeps }) {
  const loadEvents = deps?.loadEvents ?? loadEventsFromStore
  const journalRoom = deps?.journalRoom ?? roomFromHash()
  const loadJournalEvents = deps?.loadJournalEvents
    ?? ((): Promise<readonly JournalEvent[]> => loadJournalEventsFromStore(journalRoom))
  const appendEvent = deps?.appendEvent ?? appendEventToStore
  const eventLog = deps?.eventLog ?? realEventLog
  const [state, setState] = useState<Z7State>({ phase: "loading" })
  const [focusNodeId, setFocusNodeId] = useState<string | null>(deps?.focusNodeId ?? null)
  const [busyPackId, setBusyPackId] = useState<string | null>(null)
  // Import/riapertura pack: null = nessun import tentato; il risultato del
  // parse fail-closed (ok o errore) è SEMPRE visibile.
  const [importedPack, setImportedPack] = useState<StudentPackParseResult | null>(null)
  const [ripasso, setRipasso] = useState<RipassoZoneState>({ phase: "loading" })
  // Delta del grafo: nodi comparsi dall'ultimo refresh a PARITÀ di focus (quindi
  // per un evento appeso, non per la navigazione). Evidenziati come "new" nel canvas.
  const [deltaNodeIds, setDeltaNodeIds] = useState<readonly string[]>([])
  const prevGraphRef = useRef<{ focus: string | null; ids: Set<string> }>({ focus: null, ids: new Set() })

  // Zona ripasso (P0-LIVE): monta il plugin #117 su ToolHost REALE con
  // l'event-log LessonOS cablato — graph.query vivo fuori dai test. Il plugin
  // degrada da solo (capability negata / log non cablato → ripasso vuoto);
  // qui si dichiara SOLO il fallimento del mount, mai una lista vuota finta.
  useEffect(() => {
    let cancelled = false
    let close: (() => void) | null = null
    mountRipassoPanel({ eventLog })
      .then((handle) => {
        if (cancelled) {
          handle.close()
          return
        }
        close = handle.close
        const rendered = handle.plugin.render()
        setRipasso({ phase: "ready", lines: rendered.lines, aperti: handle.plugin.model().aperti.length })
      })
      .catch((err: unknown) => {
        if (!cancelled) setRipasso({ phase: "error", detail: String(err) })
      })
    return () => {
      cancelled = true
      close?.()
    }
    // eventLog è stabile per contratto del seam (default modulo o dep dei test)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = useCallback(async () => {
    const events = await loadEvents()
    const journalEvents = await loadJournalEvents()
    const focus = focusNodeId ?? defaultFocusNodeId(events)
    const projection = projectTeacherDashboard({
      lessonEvents: events,
      journalEvents,
      journalRoom,
      focusNodeId: focus,
      teacherId: "docente-locale",
      locale: "it",
      generatedAt: Date.now(),
    })
    // Delta a parità di focus: differenza dei nodi del vicinato dal refresh
    // precedente. Cambio focus (navigazione) → delta vuoto, mai un falso "new".
    const gv = projection.graphView
    const nowIds = new Set(gv.nodes.map((node) => node.id))
    const prev = prevGraphRef.current
    const delta = prev.focus === gv.focusNodeId ? [...nowIds].filter((id) => !prev.ids.has(id)) : []
    prevGraphRef.current = { focus: gv.focusNodeId, ids: nowIds }
    setDeltaNodeIds(delta)
    setState({ phase: "ready", projection })
    // loadEvents/loadJournalEvents sono stabili per contratto del seam (default modulo o dep dei test)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNodeId, journalRoom])

  useEffect(() => {
    let cancelled = false
    refresh().catch((err: unknown) => {
      if (!cancelled) setState({ phase: "error", detail: String(err) })
    })
    return () => {
      cancelled = true
    }
  }, [refresh])

  // Genera pack: appende studentpack.generated con le evidenze del candidato
  // (mai un fatto senza provenienza). Esporta: studentpack.exported. Entrambi
  // vanno nello STESSO event log; il projector lifta lo status al ricarico.
  const runPackAction = useCallback(
    async (event: LessonOsEvent, packId: string) => {
      setBusyPackId(packId)
      try {
        await appendEvent(event)
        await refresh()
      } catch (err) {
        setState({ phase: "error", detail: String(err) })
      } finally {
        setBusyPackId(null)
      }
      // appendEvent/refresh stabili per contratto del seam
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [refresh],
  )

  const onGenerate = (candidate: Z7Candidate) =>
    runPackAction(
      {
        kind: "studentpack.generated",
        packId: candidate.candidateId,
        errorId: candidate.errorId,
        ...(candidate.fromRoom !== "" ? { fromRoom: candidate.fromRoom } : {}),
        t: Date.now(),
        evidence: [...candidate.evidenceRefs],
      },
      candidate.candidateId,
    )

  // Esporta = evento sull'event-log E artefatto scaricabile (NOTTE-13):
  // il pack che il docente consegna è un FILE, non solo uno stato in coda.
  const onExport = async (candidate: Z7Candidate) => {
    await runPackAction(
      {
        kind: "studentpack.exported",
        packId: candidate.candidateId,
        t: Date.now(),
        evidence: [...candidate.evidenceRefs],
      },
      candidate.candidateId,
    )
    const artifact = buildStudentPackArtifact(candidate, { now: Date.now() })
    const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = studentPackFileName(candidate.candidateId, artifact.exportedAt)
    anchor.click()
    URL.revokeObjectURL(url)
  }

  // Import/riapertura del pack (round-trip): parse fail-closed, errore
  // VISIBILE, mai un pack parzialmente ricostruito.
  const onImportPack = async (file: File) => {
    const text = await file.text()
    const result = parseStudentPackArtifact(text)
    setImportedPack(result)
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header
        className="st-bar"
        style={{
          height: "auto",
          minHeight: 52,
          flex: "0 0 auto",
          flexWrap: "wrap",
          rowGap: 6,
          paddingTop: 6,
          paddingBottom: 6,
          overflow: "visible",
        }}
      >
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name" style={{ flex: "1 1 160px", minWidth: 0, maxWidth: 360 }}>
          <span className="st-name-text">Cruscotto docente — projection LessonOS (read-only) + azioni append-only</span>
        </span>
        <div style={{ marginLeft: "auto", maxWidth: "100%", overflowX: "auto", paddingBottom: 2 }}>
          <ViewNav current="cruscotto" />
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <section aria-labelledby="zstat-title" data-zstat style={{ marginBottom: 28 }}>
          <h2 id="zstat-title" style={{ margin: "0 0 4px" }}>
            Statistiche
          </h2>
          <p style={{ margin: "0 0 16px", opacity: 0.75 }}>
            Numeri derivati SOLO dall&apos;event log della lezione (projection read-only):
            ogni card porta la finestra temporale e le evidenze da cui deriva.
          </p>

          {state.phase === "loading" && <p aria-busy="true">Calcolo le statistiche…</p>}

          {state.phase === "ready" && (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {state.projection.stats.map((stat) => (
                <li
                  key={stat.key}
                  data-testid={`zstat-${stat.key}`}
                  data-zstat-value={stat.value}
                  style={{
                    border: "1px solid var(--st-line, #d8d2c6)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "grid",
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: 13, opacity: 0.75 }}>
                    {STAT_LABELS_IT[stat.key] ?? stat.key}
                  </span>
                  <strong style={{ fontSize: 24 }}>{stat.value}</strong>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>
                    {stat.window.from === 0 && stat.window.to === 0
                      ? "nessuna finestra (event log vuoto)"
                      : `dal ${new Date(stat.window.from).toLocaleString("it-IT")} al ${new Date(stat.window.to).toLocaleString("it-IT")}`}
                    {" · "}
                    {stat.evidenceRefs.length} evidenze
                  </span>
                </li>
              ))}
            </ul>
          )}

          {state.phase === "ready" && (
            <div data-zcharts style={{ marginTop: 14, display: "grid", gap: 8 }}>
              {state.projection.stats.map((stat) => {
                const max = Math.max(1, ...state.projection.stats.map((item) => item.value))
                const width = `${Math.max(4, Math.round((stat.value / max) * 100))}%`
                return (
                  <div key={stat.key} data-testid={`zchart-${stat.key}`} data-zchart-value={stat.value}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                      <span>{STAT_LABELS_IT[stat.key] ?? stat.key}</span>
                      <strong>{stat.value}</strong>
                    </div>
                    <div
                      aria-hidden
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: "rgba(21, 38, 56, 0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ width, height: "100%", background: "var(--st-accent, #2f6fed)" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section
          aria-labelledby="zgraph-title"
          data-testid="zgraph"
          data-zgraph-focus={state.phase === "ready" ? state.projection.graphView.focusNodeId ?? "" : undefined}
          style={{ marginBottom: 28 }}
        >
          <h2 id="zgraph-title" style={{ margin: "0 0 4px" }}>
            Grafo della lezione
          </h2>
          <p style={{ margin: "0 0 16px", opacity: 0.75 }}>
            Vista navigabile derivata dall&apos;event log LessonOS: nodi e archi portano solo id, label ed evidenze pseudonime.
          </p>

          {state.phase === "loading" && <p aria-busy="true">Materializzo il grafo…</p>}

          {state.phase === "ready" && state.projection.graphView.nodes.length === 0 && (
            <EmptyState
              title="Grafo non ancora navigabile"
              detail="Quando la lezione contiene concetti, materiali o errori, il vicinato del nodo in focus compare qui."
            />
          )}

          {state.phase === "ready" && state.projection.graphView.nodes.length > 0 && (
            <div style={{ display: "grid", gap: 12 }}>
              <div data-testid="zgraph-focus" style={{ fontSize: 13 }}>
                Focus:{" "}
                <strong>
                  {labelText(
                    state.projection.graphView.nodes.find((node) => node.id === state.projection.graphView.focusNodeId)?.label ?? {
                      it: state.projection.graphView.focusNodeId ?? "nessun nodo",
                    },
                  )}
                </strong>
              </div>
              <LessonGraphCanvas
                focusNodeId={state.projection.graphView.focusNodeId}
                nodes={state.projection.graphView.nodes}
                edges={state.projection.graphView.edges}
                onFocusNode={setFocusNodeId}
                newNodeIds={deltaNodeIds}
                locale="it"
              />
            </div>
          )}
        </section>

        <section aria-labelledby="z7-title" data-z7-count={state.phase === "ready" ? state.projection.studentPackQueue.length : undefined}>
          <h2 id="z7-title" style={{ margin: "0 0 4px" }}>
            Student-pack — coda candidati
          </h2>
          <p style={{ margin: "0 0 16px", opacity: 0.75 }}>
            Errori osservati in lezione e mai corretti da un esercizio: candidati per il
            prossimo student-pack. Derivati dall&apos;event log, nessun dato proprio del cruscotto.
          </p>

          {state.phase === "loading" && <p aria-busy="true">Leggo l&apos;event log…</p>}

          {state.phase === "error" && (
            <EmptyState
              tone="error"
              title="Memoria della lezione non leggibile"
              detail="La coda non può essere mostrata: l'event log non è accessibile (non è detto che sia vuota)."
              hint={state.detail}
            />
          )}

          {state.phase === "ready" && state.projection.studentPackQueue.length === 0 && (
            <EmptyState
              title="Nessun candidato in coda"
              detail="Quando un errore osservato in lezione resta senza esercizio correttivo, compare qui."
            />
          )}

          {state.phase === "ready" && state.projection.studentPackQueue.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {state.projection.studentPackQueue.map((candidate) => (
                <li
                  key={candidate.candidateId}
                  data-z7-candidate={candidate.candidateId}
                  style={{
                    border: "1px solid var(--st-line, #d8d2c6)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "grid",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <strong>{labelText(candidate.label)}</strong>
                    <span
                      data-z7-status={candidate.status}
                      style={{ fontSize: 12, border: "1px solid currentColor", borderRadius: 999, padding: "0 8px" }}
                    >
                      {candidate.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {candidate.fromRoom === ""
                      ? "fuori lezione (nessuna finestra lesson.started/ended)"
                      : `lezione: ${candidate.fromRoom}`}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    evidenze: {candidate.evidenceRefs.join(", ")}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {candidate.status === "candidate" && (
                      <button
                        type="button"
                        data-z7-generate={candidate.candidateId}
                        disabled={busyPackId === candidate.candidateId}
                        onClick={() => onGenerate(candidate)}
                      >
                        Genera pack
                      </button>
                    )}
                    {candidate.status === "generated" && (
                      <button
                        type="button"
                        data-z7-export={candidate.candidateId}
                        disabled={busyPackId === candidate.candidateId}
                        onClick={() => onExport(candidate)}
                      >
                        Esporta
                      </button>
                    )}
                    {candidate.status === "exported" && (
                      <span style={{ fontSize: 12, opacity: 0.7 }}>pack esportato</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Riapertura pack (round-trip export→import): parse fail-closed,
              esito sempre dichiarato. Zero PII: il pack porta solo id ed
              evidenze del libro. */}
          <div style={{ marginTop: 14, display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13 }}>
              Riapri uno student pack esportato (JSON):{" "}
              <input
                type="file"
                accept="application/json"
                data-z7-import
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file !== undefined) void onImportPack(file)
                }}
              />
            </label>
            {/* Stessa resa che vede chi RICEVE il pack (?vista=pack): una
                sola sorgente, cosi' i due capi del round-trip non possono
                divergere. */}
            <StudentPackResult result={importedPack} />
          </div>
        </section>

        <section
          aria-labelledby="zripasso-title"
          data-zripasso
          data-zripasso-aperti={ripasso.phase === "ready" ? ripasso.aperti : undefined}
          style={{ marginTop: 28 }}
        >
          <h2 id="zripasso-title" style={{ margin: "0 0 4px" }}>
            Ripasso errori
          </h2>
          <p style={{ margin: "0 0 16px", opacity: 0.75 }}>
            Plugin di sola lettura sul grafo della lezione (graph.query via ToolHost): errori aperti
            prima, poi i corretti — con la fonte di ogni osservazione.
          </p>

          {ripasso.phase === "loading" && <p aria-busy="true">Interrogo il grafo della lezione…</p>}

          {ripasso.phase === "error" && (
            <EmptyState
              tone="error"
              title="Ripasso non disponibile"
              detail="Il pannello ripasso non è stato montato: il grafo non è consultabile (non è detto che sia vuoto)."
              hint={ripasso.detail}
            />
          )}

          {ripasso.phase === "ready" && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {ripasso.lines.map((line, i) => (
                <li
                  key={i}
                  data-zripasso-line={i}
                  style={{
                    border: "1px solid var(--st-line, #d8d2c6)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 14,
                  }}
                >
                  {line}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
