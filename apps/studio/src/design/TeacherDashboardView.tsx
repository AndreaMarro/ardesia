// Cruscotto docente (?vista=cruscotto) — TEACHER-DASHBOARD-SPEC: projection
// READ-ONLY dell'event log LessonOS, mai un secondo store. Micro-slice Z7
// (regola spec §7.10: ogni zona nuova = PR piccola con test): questa vista
// mostra SOLO la zona Student-pack (coda candidati da error.observed mai
// corretto, #100). Le altre zone arriveranno come slice successive.
//
// Onestà (spec §0.4): event log illeggibile → errore dichiarato, MAI una coda
// vuota spacciata per vera. Ogni riga porta le sue evidence refs (spec §0.3).

import { useCallback, useEffect, useState } from "react"
import EmptyState from "./EmptyState"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import type { AppendedEvent, LessonOsEvent } from "../lessonos/eventlog"
import {
  projectTeacherDashboard,
  type TeacherDashboardProjection,
} from "../lessonos/teacherDashboardProjection"

export interface TeacherDashboardViewDeps {
  /** Sorgente eventi (seam per i test jsdom); default: event log IndexedDB reale. */
  loadEvents?: () => Promise<readonly AppendedEvent[]>
  /** Sink degli eventi append-only (stessa memoria, mai un secondo store). */
  appendEvent?: (event: LessonOsEvent) => Promise<void>
}

async function loadEventsFromStore(): Promise<readonly AppendedEvent[]> {
  const store = await createEventLogStore()
  return store.readAll()
}

async function appendEventToStore(event: LessonOsEvent): Promise<void> {
  const store = await createEventLogStore()
  await store.append(event)
}

type Z7Candidate = TeacherDashboardProjection["studentPackQueue"][number]

type Z7State =
  | { phase: "loading" }
  | { phase: "error"; detail: string }
  | { phase: "ready"; queue: Z7Candidate[] }

/** Etichetta nella lingua del cruscotto, o la prima disponibile (mai inventata). */
function labelText(label: Record<string, string>): string {
  return label.it ?? Object.values(label)[0] ?? "(senza etichetta)"
}

export default function TeacherDashboardView({ deps }: { deps?: TeacherDashboardViewDeps }) {
  const loadEvents = deps?.loadEvents ?? loadEventsFromStore
  const appendEvent = deps?.appendEvent ?? appendEventToStore
  const [state, setState] = useState<Z7State>({ phase: "loading" })
  const [busyPackId, setBusyPackId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const events = await loadEvents()
    const projection = projectTeacherDashboard({
      lessonEvents: events,
      teacherId: "docente-locale",
      locale: "it",
      generatedAt: Date.now(),
    })
    setState({ phase: "ready", queue: projection.studentPackQueue })
    // loadEvents è stabile per contratto del seam (default modulo o dep dei test)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const onExport = (candidate: Z7Candidate) =>
    runPackAction(
      {
        kind: "studentpack.exported",
        packId: candidate.candidateId,
        t: Date.now(),
        evidence: [...candidate.evidenceRefs],
      },
      candidate.candidateId,
    )

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">Cruscotto docente — projection LessonOS (read-only) + azioni append-only</span>
        </span>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <section aria-labelledby="z7-title" data-z7-count={state.phase === "ready" ? state.queue.length : undefined}>
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

          {state.phase === "ready" && state.queue.length === 0 && (
            <EmptyState
              title="Nessun candidato in coda"
              detail="Quando un errore osservato in lezione resta senza esercizio correttivo, compare qui."
            />
          )}

          {state.phase === "ready" && state.queue.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {state.queue.map((candidate) => (
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
        </section>
      </div>
    </div>
  )
}
