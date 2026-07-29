// Quali sessioni di una lezione si possono riprendere.
//
// Sta fuori da React per lo stesso motivo per cui `continuityProjection` sta
// fuori da `ContinuityResumeCard`: uno stato calcolabile e' verificabile senza
// montare nulla, e la vista resta una funzione dello stato.

import type { IndexedDbEventLogHandle } from "./indexedDbEventLog"

export type ContinuitySurfaceStateV1 =
  /** Nessuna lezione nello scope: non c'e' niente da riprendere, e non e' un errore. */
  | Readonly<{ kind: "no-lesson" }>
  /** Il log non e' apribile. Si riporta il descrittore reale, non un'etichetta nostra. */
  | Readonly<{ kind: "storage-unavailable"; backend: IndexedDbEventLogHandle["backend"] }>
  /** Il log e' apribile ma la lettura e' fallita: distinto da "nessuna sessione". */
  | Readonly<{ kind: "unreadable"; code: string }>
  | Readonly<{ kind: "no-sessions"; lessonId: string }>
  | Readonly<{ kind: "sessions"; lessonId: string; sessionIds: readonly string[] }>

/**
 * Enumera le sessioni riprendibili della lezione.
 *
 * Tre proprieta' che il sottosistema ha gia' violato in passato e che qui sono
 * strutturali, non raccomandate:
 *
 * 1. **Niente si apre senza scope.** Con `lessonId === null` si ritorna prima
 *    di chiamare `open`: aprire IndexedDB per scoprire di non avere una lezione
 *    da leggere e' esattamente l'accesso non necessario da evitare.
 * 2. **L'handle si chiude su ogni ramo**, degradati e fallimenti compresi.
 * 3. **"Non leggibile" non collassa in "nessuna sessione".** Una lettura
 *    fallita che si presentasse come lista vuota sarebbe una ricevuta che
 *    mente: l'utente vedrebbe "nessuna sessione da riprendere" mentre le
 *    sessioni ci sono e non si e' riusciti a leggerle.
 *
 * `open` e' iniettato per lo stesso motivo per cui lo sono le factory del
 * loader: la superficie e' verificabile con un backend reale in test senza
 * dipendere da `globalThis.indexedDB`.
 */
export async function readResumableSessions(
  lessonId: string | null,
  open: () => Promise<IndexedDbEventLogHandle>,
): Promise<ContinuitySurfaceStateV1> {
  if (lessonId === null) return Object.freeze({ kind: "no-lesson" as const })

  const handle = await open()
  try {
    const log = handle.log
    if (log === null) {
      return Object.freeze({ kind: "storage-unavailable" as const, backend: handle.backend })
    }
    let sessionIds: readonly string[]
    try {
      sessionIds = await log.listSessionIds(lessonId)
    } catch (error) {
      return Object.freeze({
        kind: "unreadable" as const,
        code: error instanceof Error ? error.message : String(error),
      })
    }
    if (sessionIds.length === 0) {
      return Object.freeze({ kind: "no-sessions" as const, lessonId })
    }
    return Object.freeze({
      kind: "sessions" as const,
      lessonId,
      sessionIds: Object.freeze([...sessionIds]),
    })
  } finally {
    // Best effort: una chiusura fallita non deve trasformare uno stato letto
    // correttamente in un errore.
    try {
      await handle.close()
    } catch {
      /* best effort */
    }
  }
}
