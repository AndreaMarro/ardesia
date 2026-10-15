// Quali sessioni di una lezione si possono riprendere.
//
// Sta fuori da React per lo stesso motivo per cui `continuityProjection` sta
// fuori da `ContinuityResumeCard`: uno stato calcolabile e' verificabile senza
// montare nulla, e la vista resta una funzione dello stato.

import type { IndexedDbEventLogHandle } from "./indexedDbEventLog"
import { validateContinuityScopeV1 } from "./continuityProjection"

export type ContinuitySurfaceStateV1 =
  /** Nessuna lezione nello scope: non c'e' niente da riprendere, e non e' un errore. */
  | Readonly<{ kind: "no-lesson" }>
  /** Il log non e' apribile. Si riporta il descrittore reale, non un'etichetta nostra. */
  | Readonly<{ kind: "storage-unavailable"; backend: IndexedDbEventLogHandle["backend"] }>
  /** Il log e' apribile ma la lettura e' fallita: distinto da "nessuna sessione". */
  | Readonly<{ kind: "unreadable"; code: string }>
  /** Archivio aperto ma non integro: una lista vuota non prova l'assenza di sessioni. */
  | Readonly<{
      kind: "storage-degraded"
      lessonId: string
      backend: Extract<IndexedDbEventLogHandle["backend"], { kind: "corrupt" }>
      discovery: Readonly<{ kind: "blocked" }>
    }>
  | Readonly<{
      kind: "storage-degraded"
      lessonId: string
      backend: Extract<IndexedDbEventLogHandle["backend"], { kind: "data-loss" }>
      discovery:
        | Readonly<{ kind: "partial"; sessionIds: readonly string[] }>
        | Readonly<{ kind: "unreadable"; code: string }>
    }>
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

  let handle: IndexedDbEventLogHandle
  try {
    handle = await open()
  } catch (error) {
    // L'apertura puo' fallire prima di restituire un handle (per esempio
    // senza Web Crypto). Nessuna sessione e' stata letta: non e' una lista vuota.
    return Object.freeze({
      kind: "storage-unavailable" as const,
      backend: Object.freeze({
        kind: "unavailable" as const,
        code: error instanceof Error ? error.message : String(error),
      }),
    })
  }
  try {
    const backend = handle.backend
    if (backend.kind === "corrupt") {
      // Come il loader dello snapshot: una sequenza corrotta blocca la lettura.
      return Object.freeze({
        kind: "storage-degraded" as const, lessonId, backend,
        discovery: Object.freeze({ kind: "blocked" as const }),
      })
    }
    const log = handle.log
    if (log === null) {
      return Object.freeze({ kind: "storage-unavailable" as const, backend: handle.backend })
    }
    let sessionIds: readonly string[]
    try {
      sessionIds = await log.listSessionIds(lessonId)
    } catch (error) {
      const code = error instanceof Error ? error.message : String(error)
      if (backend.kind === "data-loss") {
        return Object.freeze({
          kind: "storage-degraded" as const, lessonId, backend,
          discovery: Object.freeze({ kind: "unreadable" as const, code }),
        })
      }
      return Object.freeze({
        kind: "unreadable" as const,
        code,
      })
    }
    if (backend.kind === "data-loss") {
      // Le chiavi non sono i byte degli eventi: lo scope valido rende una voce
      // indirizzabile, non certifica il contenuto. Il loader lo verifichera'.
      const candidates = sessionIds.filter(sessionId => {
        try {
          validateContinuityScopeV1({ lessonId, roomId: lessonId, sessionId })
          return true
        } catch {
          return false
        }
      })
      return Object.freeze({
        kind: "storage-degraded" as const, lessonId, backend,
        discovery: Object.freeze({ kind: "partial" as const, sessionIds: Object.freeze(candidates) }),
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
