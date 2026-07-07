// Vista "lezioni salvate" (?vista=lezioni-salvate) — monta SavedLessonsPanel
// sul client LessonOS reale, con l'event-log della lezione come attemptLog:
// da qui il producer quiz.attempted (#69) è raggiungibile dal browser.
//
// Fail-closed: senza baseUrl configurata NESSUNA fetch — la vista spiega al
// docente cosa manca e come configurarlo. Il token arriva SOLO da
// localStorage (mai dall'URL): la configurazione è del chiamante, il
// pannello resta ignaro di baseUrl/token (vedi SavedLessonsPanel).

import ViewNav from "./ViewNav"
import { useEffect, useMemo, useState } from "react"
import SavedLessonsPanel from "../SavedLessonsPanel"
import EmptyState from "./EmptyState"
import { LessonOsApiClient } from "../lessonos/apiClient"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import type { EventLogStore } from "../lessonos/eventlog"
import {
  LESSONOS_BASE_URL_STORAGE_KEY,
  readSavedLessonsConfig,
} from "../store/savedLessonsView"

export default function SavedLessonsView() {
  const config = useMemo(readSavedLessonsConfig, [])
  const client = useMemo(
    () =>
      config === null
        ? null
        : new LessonOsApiClient({ baseUrl: config.baseUrl, token: config.token }),
    [config],
  )
  const [attemptLog, setAttemptLog] = useState<EventLogStore | null>(null)

  useEffect(() => {
    if (client === null) return
    let cancelled = false
    void createEventLogStore().then((store) => {
      if (!cancelled) setAttemptLog(store)
    })
    return () => {
      cancelled = true
    }
  }, [client])

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">Lezioni salvate — quiz e flashcard</span>
        </span>
        <ViewNav current="lezioni-salvate" />
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {config === null || client === null ? (
          <EmptyState
            tone="error"
            title="LessonOS non configurato"
            detail="Manca l'indirizzo del backend delle lezioni salvate: nessuna richiesta è stata fatta."
            hint={`Imposta localStorage["${LESSONOS_BASE_URL_STORAGE_KEY}"] (e il token nella chiave dedicata) oppure VITE_LESSONOS_BASE_URL, poi ricarica.`}
          />
        ) : (
          <SavedLessonsPanel
            client={client}
            {...(attemptLog !== null ? { attemptLog } : {})}
            {...(config.room !== undefined ? { room: config.room } : {})}
          />
        )}
      </div>
    </div>
  )
}
