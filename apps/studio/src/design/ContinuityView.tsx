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
 * Etichetta docente per la data di inizio di una sessione.
 *
 * `null` = nessuna data affidabile da mostrare (sessione senza eventi
 * leggibili o istante non valido): la vista dice «data non disponibile»
 * invece di inventare o di stampare «Invalid Date». L'istante esatto resta
 * sulla macchina (`<time dateTime>`), il testo e' per il docente.
 */
function sessionStartLabel(firstSeenAt: string | null): { dateTime: string; text: string } | null {
  if (firstSeenAt === null) return null
  const instant = new Date(firstSeenAt)
  if (!Number.isFinite(instant.getTime())) return null
  return {
    dateTime: firstSeenAt,
    text: new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(instant),
  }
}

/**
 * Href della sessione, con lo hash della stanza preservato. Senza lo hash il
 * link porterebbe a una lezione diversa da quella che si sta guardando.
 */
function sessionHref(sessionId: string): string {
  const hash = window.location.hash
  return `/?vista=continuita&sessione=${encodeURIComponent(sessionId)}${hash}`
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
    case "sessions": {
      // L'ordine arriva dalla superficie (`readResumableSessions` ordina per
      // data di inizio, dalla piu' recente): la prima voce e' quella da cui
      // il docente normalmente vuole ripartire — questa e' una superficie di
      // ripresa, non un archivio storico. Il marchio «più recente» va sulla
      // prima voce SOLO quando ogni sessione ha una data nota: se anche una
      // sola manca, una ignota potrebbe essere la vera piu' recente e
      // incoronarne un'altra mentirebbe. Stessa ragione per le sessioni senza
      // data in fondo: restano in lista e lo si dice.
      const first = surface.sessions[0]
      const allDated =
        surface.sessions.length > 0 &&
        surface.sessions.every((session) => sessionStartLabel(session.firstSeenAt) !== null)
      const latestId = first !== undefined && allDated ? first.sessionId : null
      const someUndated = !allDated && surface.sessions.length > 0
      return (
        <section data-testid="continuity-surface" data-state="sessions" className="st-panel">
          <ViewNav current="continuita" />
          <h1>Riprendi una sessione</h1>
          <p>Lezione {surface.lessonId}</p>
          <p className="st-hint">
            In ordine di inizio, dalla più recente.
            {someUndated ? " Le sessioni senza data leggibile stanno in fondo." : ""}
          </p>
          <ul>
            {surface.sessions.map((session, indice) => {
              const label = sessionStartLabel(session.firstSeenAt)
              return (
                <li key={session.sessionId}>
                  {/*
                    Il testo visibile NON contiene l'identificatore: l'obiettivo
                    del prodotto e' che il docente non debba conoscere un solo
                    UUID. L'id resta in `href` e in `data-*`, che sono per le
                    macchine, e in `title`, che e' un aiuto di debug e non
                    qualcosa da leggere per usare il prodotto.
                  */}
                  <a
                    data-testid="continuity-session"
                    data-continuity-session-id={session.sessionId}
                    title={`Identificatore tecnico della sessione: ${session.sessionId}`}
                    href={sessionHref(session.sessionId)}
                  >
                    Sessione {indice + 1} —{" "}
                    {label === null ? (
                      "data non disponibile"
                    ) : (
                      <time dateTime={label.dateTime}>{label.text}</time>
                    )}
                    {session.sessionId === latestId ? " (più recente)" : ""}
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )
    }
  }
}
