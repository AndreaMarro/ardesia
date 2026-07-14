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
import {
  buildStudentPackArtifact,
  parseStudentPackArtifact,
  studentPackFileName,
  type StudentPackParseResult,
} from "../lessonos/studentPackArtifact"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import EmptyState from "./EmptyState"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import type { AppendedEvent, LessonOsEvent } from "../lessonos/eventlog"
import type { JournalEvent } from "../store/JournalRecorder"
import { deserializeEvents } from "../store/ReplayEngine"
import { roomPaths, validateRoomId } from "../store/roomPaths"
import { workspaceStore } from "../store/WorkspaceStore"
import {
  projectTeacherDashboard,
  type TeacherDashboardProjection,
} from "../lessonos/teacherDashboardProjection"
import { mountRipassoPanel } from "../toolhost/panelHost"
import type { EventLogReadLike } from "../toolhost/caps/graph"
import { selectDashboardRoomEvents } from "./knowledgeRoomSession"

export interface TeacherDashboardViewDeps {
  /** Sorgente eventi (seam per i test jsdom); default: event log IndexedDB reale. */
  loadEvents?: () => Promise<readonly AppendedEvent[]>
  /** Journal lavagna della stessa stanza; default: raw/<room>/events.jsonl dal WorkspaceStore reale. */
  loadJournalEvents?: (room: string) => Promise<readonly JournalEvent[]>
  /** Room di cui proiettare eventi LessonOS e journal. */
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
  /** Orologio iniettabile: il render resta puro e i test possono essere deterministici. */
  now?: () => number
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

async function loadJournalEventsFromStore(room: string): Promise<readonly JournalEvent[]> {
  const paths = roomPaths(room)
  if (workspaceStore.mode === "unavailable") await workspaceStore.init()
  const blob = await workspaceStore.read(paths.journal)
  if (!blob) return []
  return deserializeEvents(await blob.text())
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

type PackOperation = "generate" | "export" | "download"

function packOperationKey(room: string, packId: string, operation: PackOperation): string {
  return `${room}\u0000${packId}\u0000${operation}`
}

function packDeliveryKey(room: string, packId: string): string {
  return `${room}\u0000${packId}`
}

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
  const loadJournalEvents = deps?.loadJournalEvents ?? loadJournalEventsFromStore
  const journalRoom = deps?.journalRoom ?? roomFromHash()
  const appendEvent = deps?.appendEvent ?? appendEventToStore
  const eventLog = deps?.eventLog ?? realEventLog
  const scopeByRoom = deps === undefined || deps.journalRoom !== undefined
  const now = deps?.now ?? Date.now
  const scopedEventLog = useMemo<EventLogReadLike>(
    () => ({
      async readAll() {
        if (scopeByRoom) validateRoomId(journalRoom)
        const events = await eventLog.readAll()
        return scopeByRoom ? [...selectDashboardRoomEvents(events, journalRoom)] : events
      },
    }),
    [eventLog, journalRoom, scopeByRoom],
  )
  const [state, setState] = useState<Z7State>({ phase: "loading" })
  const [focusNodeId, setFocusNodeId] = useState<string | null>(deps?.focusNodeId ?? null)
  const [busyPackOperations, setBusyPackOperations] = useState<ReadonlySet<string>>(() => new Set())
  const [packDeliveryErrors, setPackDeliveryErrors] = useState<Readonly<Record<string, string>>>({})
  // Import/riapertura pack: null = nessun import tentato; il risultato del
  // parse fail-closed (ok o errore) è SEMPRE visibile.
  const [importedPack, setImportedPack] = useState<StudentPackParseResult | null>(null)
  const [ripasso, setRipasso] = useState<RipassoZoneState>({ phase: "loading" })
  // Delta del grafo: nodi comparsi dall'ultimo refresh a PARITÀ di focus (quindi
  // per un evento appeso, non per la navigazione). Evidenziati come "new" nel canvas.
  const [deltaNodeIds, setDeltaNodeIds] = useState<readonly string[]>([])
  const prevGraphRef = useRef<{ focus: string | null; ids: Set<string> }>({ focus: null, ids: new Set() })
  const refreshGenerationRef = useRef(0)
  const currentRoomRef = useRef<string | null>(journalRoom)
  const roomVisitGenerationRef = useRef(0)
  const activePackOperationsRef = useRef(new Set<string>())
  useLayoutEffect(() => {
    currentRoomRef.current = journalRoom
    roomVisitGenerationRef.current += 1
    return () => {
      currentRoomRef.current = null
      roomVisitGenerationRef.current += 1
    }
  }, [journalRoom])

  // Zona ripasso (P0-LIVE): monta il plugin #117 su ToolHost REALE con
  // l'event-log LessonOS cablato — graph.query vivo fuori dai test. Il plugin
  // degrada da solo (capability negata / log non cablato → ripasso vuoto);
  // qui si dichiara SOLO il fallimento del mount, mai una lista vuota finta.
  useEffect(() => {
    let cancelled = false
    let close: (() => void) | null = null
    mountRipassoPanel({ eventLog: scopedEventLog })
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
  }, [scopedEventLog])

  const refresh = useCallback(async () => {
    const generation = ++refreshGenerationRef.current
    if (scopeByRoom) validateRoomId(journalRoom)
    const loadedEvents = await loadEvents()
    if (generation !== refreshGenerationRef.current) return
    const events = scopeByRoom
      ? selectDashboardRoomEvents(loadedEvents, journalRoom)
      : loadedEvents
    const journalEvents = await loadJournalEvents(journalRoom)
    if (generation !== refreshGenerationRef.current) return
    const focus = focusNodeId ?? defaultFocusNodeId(events)
    const projection = projectTeacherDashboard({
      lessonEvents: events,
      journalEvents,
      journalRoom,
      focusNodeId: focus,
      teacherId: "docente-locale",
      locale: "it",
      generatedAt: now(),
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
  }, [focusNodeId, journalRoom, loadEvents, loadJournalEvents, now, scopeByRoom])
  const refreshRef = useRef(refresh)
  useLayoutEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  useEffect(() => {
    let cancelled = false
    refresh().catch((err: unknown) => {
      if (!cancelled) setState({ phase: "error", detail: String(err) })
    })
    return () => {
      cancelled = true
      refreshGenerationRef.current += 1
    }
  }, [refresh])

  const beginPackOperation = useCallback((key: string): boolean => {
    if (activePackOperationsRef.current.has(key)) return false
    activePackOperationsRef.current.add(key)
    setBusyPackOperations(new Set(activePackOperationsRef.current))
    return true
  }, [])

  const endPackOperation = useCallback((key: string) => {
    activePackOperationsRef.current.delete(key)
    setBusyPackOperations(new Set(activePackOperationsRef.current))
  }, [])

  // Genera pack: appende studentpack.generated con le evidenze del candidato
  // (mai un fatto senza provenienza). Esporta: studentpack.exported. Entrambi
  // vanno nello STESSO event log; il projector lifta lo status al ricarico.
  const runPackAction = useCallback(
    async (event: LessonOsEvent, packId: string, operation: Exclude<PackOperation, "download">) => {
      const actionRoom = journalRoom
      const actionRoomVisit = roomVisitGenerationRef.current
      const operationKey = packOperationKey(actionRoom, packId, operation)
      const isCurrentRoomVisit = () =>
        currentRoomRef.current === actionRoom &&
        roomVisitGenerationRef.current === actionRoomVisit
      if (!beginPackOperation(operationKey)) return false
      try {
        try {
          await appendEvent(event)
        } catch (err) {
          if (isCurrentRoomVisit()) {
            setState({ phase: "error", detail: String(err) })
          }
          return false
        }
        if (currentRoomRef.current === actionRoom) {
          try {
            await refreshRef.current()
          } catch (err) {
            if (isCurrentRoomVisit()) {
              setState({ phase: "error", detail: String(err) })
            }
          }
        }
        return isCurrentRoomVisit()
      } finally {
        endPackOperation(operationKey)
      }
    },
    [appendEvent, beginPackOperation, endPackOperation, journalRoom],
  )

  const onGenerate = (candidate: Z7Candidate) => {
    const generatedAt = now()
    return runPackAction(
      {
        kind: "studentpack.generated",
        packId: candidate.candidateId,
        errorId: candidate.errorId,
        ...(candidate.fromRoom !== "" ? { fromRoom: candidate.fromRoom } : {}),
        t: generatedAt,
        evidence: [...candidate.evidenceRefs],
      },
      candidate.candidateId,
      "generate",
    )
  }

  const deliverStudentPack = useCallback(
    (candidate: Z7Candidate, exportedAt: number): boolean => {
      const actionRoom = journalRoom
      const operationKey = packOperationKey(actionRoom, candidate.candidateId, "download")
      const deliveryKey = packDeliveryKey(actionRoom, candidate.candidateId)
      if (!beginPackOperation(operationKey)) return false
      try {
        const artifact = buildStudentPackArtifact(candidate, { now: exportedAt })
        const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        try {
          const anchor = document.createElement("a")
          anchor.href = url
          anchor.download = studentPackFileName(candidate.candidateId, artifact.exportedAt)
          anchor.click()
        } finally {
          URL.revokeObjectURL(url)
        }
        setPackDeliveryErrors((current) => {
          if (current[deliveryKey] === undefined) return current
          const next = { ...current }
          delete next[deliveryKey]
          return next
        })
        return true
      } catch (err) {
        setPackDeliveryErrors((current) => ({ ...current, [deliveryKey]: String(err) }))
        return false
      } finally {
        endPackOperation(operationKey)
      }
    },
    [beginPackOperation, endPackOperation, journalRoom],
  )

  // Esporta = evento sull'event-log E artefatto scaricabile (NOTTE-13):
  // il pack che il docente consegna è un FILE, non solo uno stato in coda.
  const onExport = async (candidate: Z7Candidate) => {
    const exportedAt = now()
    const refreshed = await runPackAction(
      {
        kind: "studentpack.exported",
        packId: candidate.candidateId,
        t: exportedAt,
        evidence: [...candidate.evidenceRefs],
      },
      candidate.candidateId,
      "export",
    )
    if (refreshed) deliverStudentPack(candidate, exportedAt)
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
                        disabled={busyPackOperations.has(packOperationKey(journalRoom, candidate.candidateId, "generate"))}
                        onClick={() => onGenerate(candidate)}
                      >
                        Genera pack
                      </button>
                    )}
                    {candidate.status === "generated" && (
                      <button
                        type="button"
                        data-z7-export={candidate.candidateId}
                        disabled={busyPackOperations.has(packOperationKey(journalRoom, candidate.candidateId, "export"))}
                        onClick={() => onExport(candidate)}
                      >
                        Esporta
                      </button>
                    )}
                    {candidate.status === "exported" && (
                      <>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>pack esportato</span>
                        <button
                          type="button"
                          data-z7-download={candidate.candidateId}
                          disabled={busyPackOperations.has(packOperationKey(journalRoom, candidate.candidateId, "download"))}
                          onClick={() => deliverStudentPack(candidate, now())}
                        >
                          Scarica di nuovo
                        </button>
                      </>
                    )}
                  </div>
                  {packDeliveryErrors[packDeliveryKey(journalRoom, candidate.candidateId)] !== undefined && (
                    <div role="alert" data-z7-download-error={candidate.candidateId} style={{ fontSize: 12 }}>
                      Consegna file fallita: {packDeliveryErrors[packDeliveryKey(journalRoom, candidate.candidateId)]}.
                      Puoi usare “Scarica di nuovo”.
                    </div>
                  )}
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
            {importedPack !== null && !importedPack.ok && (
              <div role="alert" data-z7-import-error style={{ fontSize: 13 }}>
                Import fallito: {importedPack.error}
              </div>
            )}
            {importedPack !== null && importedPack.ok && (
              <div
                data-imported-pack
                style={{
                  border: "1px solid var(--st-line, #d8d2c6)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "grid",
                  gap: 4,
                }}
              >
                <strong>Pack riaperto — {importedPack.artifact.packs.length} elemento/i</strong>
                {importedPack.artifact.packs.map((pack) => (
                  <div key={pack.candidateId} data-imported-pack-id={pack.candidateId}>
                    <div>{pack.label.it}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      errore: {pack.errorId}
                      {pack.fromRoom !== "" ? ` — lezione: ${pack.fromRoom}` : ""}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      evidenze: {pack.evidence.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
