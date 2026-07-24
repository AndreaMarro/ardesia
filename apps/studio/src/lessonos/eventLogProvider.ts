// ARDESIA Studio — un solo proprietario dell'istanza del log eventi.
//
// Prima di questo modulo `createEventLogStore()` veniva chiamata da almeno
// cinque punti diversi (RecapView, ElabLab, SavedLessonsView, TeacherDashboardView
// ×3): ciascuno apriva la PROPRIA connessione IndexedDB allo stesso database, e
// ciascuno decideva per conto suo se chiuderla.
//
// Qui l'istanza è una sola e il suo ciclo di vita appartiene a LessonOS, non a
// chi legge. È il primo passo concreto di ADR-0004: le viste non provvedono più
// da sé lo store, lo ricevono.
//
// Conseguenza voluta: **i consumatori non chiudono più il log.** Prima RecapView
// lo chiudeva dopo l'uso; su un'istanza condivisa quella chiusura toglierebbe il
// log a tutti gli altri. Chiudere è responsabilità del proprietario, e oggi il
// proprietario lo tiene aperto per la durata della sessione — che è ciò che
// facevano già di fatto tutti gli altri consumatori.

import {
  createEventLogStore,
  type IndexedDbEventLogOptions,
} from "./indexedDbEventLog"
import type { EnvelopeEventLogStore, EventLogStore } from "./eventlog"

export type LessonEventLog = EventLogStore & EnvelopeEventLogStore

let shared: Promise<LessonEventLog> | null = null

/**
 * Istanza condivisa del log della lezione, creata alla prima richiesta.
 *
 * `createEventLogStore` è già fail-soft: senza IndexedDB utilizzabile ritorna
 * un log in memoria invece di lanciare. Quel comportamento è preservato tale e
 * quale — questo modulo non aggiunge né toglie tolleranza ai guasti.
 */
export function lessonEventLog(
  options: IndexedDbEventLogOptions = {},
): Promise<LessonEventLog> {
  shared ??= createEventLogStore(options)
  return shared
}

/**
 * Sostituisce l'istanza condivisa. Solo per i test.
 *
 * Un singleton di modulo rende i test dipendenti l'uno dall'altro: la stessa
 * trappola misurata sul broker dei lock (`LessonMutationReentrancy.test.ts`),
 * dove uno stato condiviso faceva fallire per contagio i casi successivi. Chi
 * tocca il log in un test deve poterlo azzerare.
 */
export function setLessonEventLogForTests(
  next: Promise<LessonEventLog> | LessonEventLog | null,
): void {
  shared = next === null ? null : Promise.resolve(next)
}
