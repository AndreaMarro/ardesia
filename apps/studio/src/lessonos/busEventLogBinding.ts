// LessonOS — binding host: event-bus Core↔Plugin → event-log (producer di
// error.observed e material.cited lato bus). Il bus è transito (eventBus.ts),
// l'event-log è l'unica verità persistita: qui l'host promuove i messaggi
// didattici del plugin a fatti. Il plugin non tocca mai la memoria (canon §6).
//
// Fail-visible: un append rifiutato (storage giù, evidence malformata) va a
// `onRecordError` — obbligatorio per contratto, così nessun chiamante può
// dimenticare il caso e perdere memoria in silenzio.

import type { ArdesiaEventKind, ArdesiaEventMap, TypedEventBus } from "../core/contracts/eventBus"
import type { EventLogStore } from "./eventlog"

export interface BusEventLogBindingOptions {
  /** Osservatore dei fallimenti di registrazione: mai una memoria persa muta. */
  onRecordError: (error: unknown, kind: ArdesiaEventKind) => void
}

/**
 * Sottoscrive i kind didattici del bus e li appende sull'event-log.
 * Ritorna l'unbind. La consegna del bus è sincrona; l'append è async e i
 * rigetti finiscono in `onRecordError` (il bus non aspetta la persistenza).
 */
export function bindBusToEventLog(
  bus: TypedEventBus<ArdesiaEventMap>,
  log: EventLogStore,
  options: BusEventLogBindingOptions,
): () => void {
  const record = (event: Parameters<EventLogStore["append"]>[0], kind: ArdesiaEventKind) => {
    void log.append(event).catch((error: unknown) => {
      options.onRecordError(error, kind)
    })
  }

  const unsubscribers = [
    bus.on("error.observed", (event) => {
      record(
        {
          kind: "error.observed",
          errorId: event.errorId,
          conceptId: event.conceptId,
          ...(event.studentId !== undefined ? { studentId: event.studentId } : {}),
          labels: event.labels,
          t: event.t,
          evidence: event.evidence,
        },
        "error.observed",
      )
    }),
    bus.on("material.cited", (event) => {
      record(
        {
          kind: "material.cited",
          materialId: event.materialId,
          ...(event.conceptId !== undefined ? { conceptId: event.conceptId } : {}),
          labels: event.labels,
          t: event.t,
          evidence: event.evidence,
        },
        "material.cited",
      )
    }),
  ]

  return () => {
    for (const unsubscribe of unsubscribers) unsubscribe()
  }
}
