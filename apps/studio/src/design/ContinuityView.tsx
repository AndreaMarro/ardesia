// Superficie di continuita' (?vista=continuita).
//
// L'unico pezzo con effetti di questa feature. Tutto cio' che decide sta
// altrove ed e' gia' coperto da test propri: `readResumableSessions` per
// l'enumerazione, `loadScopedContinuitySnapshot` + `projectContinuityV1` per lo
// snapshot, `ContinuityResumeCard` per il rendering. Qui c'e' solo il
// cablaggio.
//
// La nav sta in OGNI ramo, compresi quelli di errore. Misurato il 2026-07-30:
// questa era l'unica superficie della shell senza `ViewNav` — Room, ElabLab,
// SavedLessonsView, TeacherDashboardView e SimulationPluginWorkbench lo
// rendono tutte. Il GOAL chiede che il docente ritrovi la lezione in
// Continuita' e la esporti in Materiali: senza nav quel passo non esiste, e i
// rami in cui serve di piu' sono proprio quelli in cui qualcosa e' andato
// storto.
//
// Regola che governa il file: stati diversi devono APPARIRE diversi. Nessuna
// sessione, storage non raggiungibile e lettura fallita sono tre cose distinte,
// e collassarle in un'unica schermata vuota e' il modo piu' rapido per far
// credere a un docente di aver perso una lezione che invece c'e'.

import { useEffect, useState } from "react"
import ViewNav from "./ViewNav"
import ContinuityResumeCard, {
  type ContinuityResumeCardStateV1,
} from "./ContinuityResumeCard"
import {
  readResumableSessions,
  type ContinuitySurfaceStateV1,
} from "../lessonos/continuitySurface"
import { continuityLessonIdFromLocation } from "../store/continuityView"
import {
  loadScopedContinuitySnapshot,
  openIndexedDbContinuityEventReader,
  createWorkspaceStoreContinuityWorkspaceReader,
  type LoadScopedContinuityResultV1,
} from "../lessonos/continuityRuntime"
import { projectContinuityV1 } from "../lessonos/continuityProjection"
import {
  openIndexedDbEventLog,
  type IndexedDbEventLogHandle,
} from "../lessonos/indexedDbEventLog"
import { workspaceStore } from "../store/WorkspaceStore"

declare const __ARDESIA_GIT_SHA__: string

export interface ContinuityViewDeps {
  openEventLog?: () => Promise<IndexedDbEventLogHandle>
  loadSnapshot?: typeof loadScopedContinuitySnapshot
  /**
   * Cucitura per l'enumerazione. Coerente con la regola dichiarata in cima al
   * file — «qui c'e' solo il cablaggio» — e serve a un test che deve poter
   * STABILIRE ogni ramo invece di sperare di raggiungerlo: i rami di errore
   * sono quelli in cui un docente ha piu' bisogno della nav, e sono anche
   * quelli che un test scritto sul caso buono non tocca mai.
   */
  readSessions?: typeof readResumableSessions
}

/** `sessione` nell'URL: quale sessione si sta chiedendo di riaprire. */
function requestedSessionId(): string | null {
  try {
    return new URL(window.location.href).searchParams.get("sessione")
  } catch {
    return null
  }
}

/**
 * Href della sessione, con lo hash della stanza preservato. Senza lo hash il
 * link porterebbe a una lezione diversa da quella che si sta guardando.
 */
function sessionHref(sessionId: string): string {
  const hash = window.location.hash
  return `${import.meta.env.BASE_URL}?vista=continuita&sessione=${encodeURIComponent(sessionId)}${hash}`
}

type ViewState =
  | Readonly<{ phase: "listing"; surface: ContinuitySurfaceStateV1 | null }>
  | Readonly<{ phase: "snapshot"; card: ContinuityResumeCardStateV1 }>

function SurfaceMessage(props: { state: string; title: string; detail: string }) {
  return (
    <section data-testid="continuity-surface" data-state={props.state} className="st-panel">
      <ViewNav current="continuita" />
      <h1>{props.title}</h1>
      <p>{props.detail}</p>
    </section>
  )
}

export default function ContinuityView(props: { deps?: ContinuityViewDeps } = {}) {
  const deps = props.deps
  const [state, setState] = useState<ViewState>({ phase: "listing", surface: null })

  useEffect(() => {
    let cancelled = false
    const lessonId = continuityLessonIdFromLocation()
    const sessionId = requestedSessionId()

    async function run(): Promise<void> {
      // Ramo snapshot: lo scope e' completo, si chiede il caricamento.
      if (lessonId !== null && sessionId !== null) {
        if (!cancelled) setState({ phase: "snapshot", card: { kind: "loading" } })
        const load = deps?.loadSnapshot ?? loadScopedContinuitySnapshot
        const result: LoadScopedContinuityResultV1 = await load(
          { lessonId, roomId: lessonId, sessionId },
          {
            createEventReader: (scope) => openIndexedDbContinuityEventReader({}, scope),
            createWorkspaceReader: async () =>
              createWorkspaceStoreContinuityWorkspaceReader(workspaceStore),
            buildCommitSha: typeof __ARDESIA_GIT_SHA__ === "string" ? __ARDESIA_GIT_SHA__ : null,
          },
        )
        if (cancelled) return
        setState({
          phase: "snapshot",
          card:
            result.kind === "scope-invalid"
              ? { kind: "scope-invalid", code: result.code }
              : { kind: "loaded", projection: projectContinuityV1(result.snapshot) },
        })
        return
      }

      // Ramo elenco: quale sessione riprendere non e' ancora stato scelto.
      const leggi = deps?.readSessions ?? readResumableSessions
      const surface = await leggi(
        lessonId,
        deps?.openEventLog ?? (() => openIndexedDbEventLog({})),
      )
      if (!cancelled) setState({ phase: "listing", surface })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [deps])

  // La nav sta QUI e non dentro `ContinuityResumeCard`: la card ha sei rami di
  // ritorno, e metterla in ognuno significherebbe sei punti da cui puo' sparire.
  // Cosi' resta un punto solo, e la card resta puramente presentazionale.
  if (state.phase === "snapshot") {
    return (
      <>
        <ViewNav current="continuita" />
        <ContinuityResumeCard state={state.card} />
      </>
    )
  }

  const surface = state.surface
  if (surface === null) {
    return <SurfaceMessage state="loading" title="Continuità" detail="Lettura delle sessioni…" />
  }

  switch (surface.kind) {
    case "no-lesson":
      return (
        <SurfaceMessage
          state="no-lesson"
          title="Nessuna lezione aperta"
          detail="Apri una lezione: la ripresa lavora sullo scope della stanza corrente."
        />
      )
    case "storage-unavailable":
      return (
        <SurfaceMessage
          state="storage-unavailable"
          title="Archivio non raggiungibile"
          // Distinto da "nessuna sessione": qui non sappiamo cosa ci sia, e
          // dirlo e' l'unica risposta onesta.
          detail={`Impossibile aprire l'archivio eventi (${surface.backend.kind}). Le sessioni potrebbero esistere: non sono state lette.`}
        />
      )
    case "unreadable":
      return (
        <SurfaceMessage
          state="unreadable"
          title="Sessioni non leggibili"
          detail={`L'archivio si è aperto ma l'elenco non è stato letto: ${surface.code}. Nessuna conclusione sulle sessioni presenti.`}
        />
      )
    case "no-sessions":
      return (
        <SurfaceMessage
          state="no-sessions"
          title="Nessuna sessione da riprendere"
          detail="L'archivio è stato letto e per questa lezione non risulta alcuna sessione."
        />
      )
    case "sessions":
      return (
        <section data-testid="continuity-surface" data-state="sessions" className="st-panel">
          <ViewNav current="continuita" />
          <h1>Riprendi una sessione</h1>
          <p>Lezione {surface.lessonId}</p>
          {/*
            L'ordine non e' quello temporale, e dirlo e' obbligatorio.
            `listSessionIds` scorre l'indice `[lessonId, sessionId, seq]`, quindi
            ordina LESSICOGRAFICAMENTE per `sessionId` — che e' un UUID casuale.
            Numerare le voci senza questa riga farebbe promettere alla vista una
            cronologia che l'archivio non conserva: sarebbe una ricevuta che
            mente, esattamente la classe di difetto che questo sottosistema
            documenta di voler evitare.
            La data di ciascuna sessione richiede di leggere il primo envelope
            per sessione: non e' fatto qui, ed e' il lavoro di F0-6.
          */}
          <p className="st-hint">
            L'archivio elenca le sessioni nel proprio ordine interno, che non è
            quello temporale: la numerazione qui sotto non dice quale sia la più
            recente.
          </p>
          <ul>
            {surface.sessionIds.map((sessionId, indice) => (
              <li key={sessionId}>
                {/*
                  Il testo visibile NON contiene l'identificatore: l'obiettivo
                  del prodotto e' che il docente non debba conoscere un solo
                  UUID. L'id resta in `href` e in `data-*`, che sono per le
                  macchine, e in `title`, che e' un aiuto di debug e non
                  qualcosa da leggere per usare il prodotto.
                */}
                <a
                  data-testid="continuity-session"
                  data-continuity-session-id={sessionId}
                  title={`Identificatore tecnico della sessione: ${sessionId}`}
                  href={sessionHref(sessionId)}
                >
                  Sessione {indice + 1}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )
  }
}
