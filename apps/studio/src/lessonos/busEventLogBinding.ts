// LessonOS — binding host: event-bus Core↔Plugin → event-log (producer di
// error.observed e material.cited lato bus). Il bus è transito (eventBus.ts),
// l'event-log è l'unica verità persistita: qui l'host promuove i messaggi
// didattici del plugin a fatti. Il plugin non tocca mai la memoria (canon §6).
//
// Fail-visible: un append rifiutato (storage giù, evidence malformata) va a
// `onRecordError` — obbligatorio per contratto, così nessun chiamante può
// dimenticare il caso e perdere memoria in silenzio.
//
// Write acknowledgement (issue #246): l'append è async e il bus non lo aspetta,
// quindi senza un segnale di ritorno l'unica cosa che un chiamante può fare è
// indovinare — ed è esattamente quello che faceva la vista, dichiarando
// «segnato» mentre la scrittura era ancora in volo. `onRecorded` è quel
// segnale: arriva DOPO che l'event-log ha accettato il fatto, mai prima. Chi
// deve confermare qualcosa all'utente conferma qui, non all'emit.

import type { ArdesiaEventKind, ArdesiaEventMap, TypedEventBus } from "../core/contracts/eventBus"
import type { EventLogStore } from "./eventlog"

export interface BusEventLogBindingOptions {
  /** Osservatore dei fallimenti di registrazione: mai una memoria persa muta. */
  onRecordError: (error: unknown, kind: ArdesiaEventKind) => void
  /**
   * Acknowledgement della scrittura (#246): invocato SOLO dopo che l'append è
   * risolto, cioè quando il fatto è nella memoria della lezione. Opzionale
   * perché non ogni consumatore conferma qualcosa a un umano; obbligatorio nei
   * fatti per chi lo fa, perché è l'unico istante in cui la conferma è vera.
   */
  onRecorded?: (kind: ArdesiaEventKind) => void
}

/**
 * Sottoscrive i kind didattici del bus e li appende sull'event-log.
 * Ritorna l'unbind. La consegna del bus è sincrona; l'append è async: i rigetti
 * finiscono in `onRecordError`, le scritture accettate in `onRecorded`. Il bus
 * non aspetta la persistenza — ma chi mostra una conferma sì (#246).
 */
export function bindBusToEventLog(
  bus: TypedEventBus<ArdesiaEventMap>,
  log: EventLogStore,
  options: BusEventLogBindingOptions,
): () => void {
  const record = (event: Parameters<EventLogStore["append"]>[0], kind: ArdesiaEventKind) => {
    void log.append(event).then(
      () => {
        options.onRecorded?.(kind)
      },
      (error: unknown) => {
        options.onRecordError(error, kind)
      },
    )
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
