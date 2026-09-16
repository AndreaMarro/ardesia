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
  | Readonly<{ kind: "sessions"; lessonId: string; sessions: readonly ContinuitySessionSummaryV1[] }>

/**
 * Una sessione riprendibile con la sua data di inizio.
 *
 * `firstSeenAt` e' l'`occurredAt` del primo envelope della sessione: e' la
 * base che permette alla vista di mostrare le sessioni in ordine temporale e
 * di dire al docente qual e' la piu' recente. `listSessionIds` da solo ordina
 * lessicograficamente per UUID casuale — senza questa data la numerazione
 * «Sessione 1, 2» prometterebbe una cronologia che l'archivio non conserva.
 * `null` = la sessione e' elencata ma nessun suo evento e' leggibile: resta
 * in lista (farla sparire sarebbe una ricevuta che mente per omissione) e la
 * vista lo dice.
 */
export type ContinuitySessionSummaryV1 = Readonly<{
  sessionId: string
  firstSeenAt: string | null
}>

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
 * 4. **L'ordine e' quello temporale, dalla piu' recente.** `listSessionIds`
 *    scorre l'indice `[lessonId, sessionId, seq]`, quindi ordina
 *    lessicograficamente per UUID casuale: numerare le voci in quell'ordine
 *    prometterebbe una cronologia che l'archivio non conserva. Ogni sessione
 *    porta la sua data di inizio e la lista e' ordinata per quella, dalla
 *    piu' recente: questa e' una superficie di ripresa, non un archivio
 *    storico, e la prima voce e' quella da cui il docente normalmente vuole
 *    ripartire.
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

  // L'apertura puo' rigettare (es. Web Crypto non disponibile in
  // costruzione): senza contenimento la rejection uscirebbe da qui e la vista
  // resterebbe su "loading" per sempre. Lo stato corretto e' quello esistente
  // `storage-unavailable` — l'archivio non si e' potuto aprire — col motivo
  // reale nel descrittore; nessun handle da chiudere, non essendocene uno.
  let handle: IndexedDbEventLogHandle
  try {
    handle = await open()
  } catch (error) {
    return Object.freeze({
      kind: "storage-unavailable" as const,
      backend: Object.freeze({
        kind: "unavailable" as const,
        code: error instanceof Error ? error.message : String(error),
      }),
    })
  }
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
    // Data di inizio per sessione, via indice composto (lessonId, sessionId):
    // lettura scoped, mai l'intero archivio. Un guasto qui e' "non leggibile"
    // come quello dell'elenco: degradare a lista senza date mostrerebbe un
    // ordine d'indice spacciato per cronologia.
    let sessions: ContinuitySessionSummaryV1[]
    try {
      sessions = []
      for (const sessionId of sessionIds) {
        const envelopes = await log.readEnvelopesBySession(lessonId, sessionId)
        sessions.push(
          Object.freeze({ sessionId, firstSeenAt: earliestOccurredAt(envelopes) }),
        )
      }
    } catch (error) {
      return Object.freeze({
        kind: "unreadable" as const,
        code: error instanceof Error ? error.message : String(error),
      })
    }
    sessions.sort(byRecencyThenId)
    return Object.freeze({
      kind: "sessions" as const,
      lessonId,
      sessions: Object.freeze([...sessions]),
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

/**
 * Data di inizio di una sessione: il minimo `occurredAt` dei suoi envelope.
 *
 * Gli `occurredAt` sono ISO-8601 con lo stesso formato (asserito in scrittura
 * da `assertEventEnvelopeV2`): il confronto lessicografico E' quello
 * temporale. `null` quando la sessione non ha envelope leggibili.
 */
function earliestOccurredAt(
  envelopes: ReadonlyArray<{ occurredAt: string }>,
): string | null {
  let earliest: string | null = null
  for (const envelope of envelopes) {
    if (earliest === null || envelope.occurredAt < earliest) earliest = envelope.occurredAt
  }
  return earliest
}

/**
 * Ordine di presentazione: temporale DECRESCENTE per data di inizio (la
 * sessione da cui riprendere sta per prima); le sessioni senza data
 * leggibile per ultime, a parita' per sessionId (UUID ordinabile,
 * deterministico). Mai l'ordine d'indice da solo: e' lessicografico per
 * UUID casuale, non una cronologia.
 */
function byRecencyThenId(
  left: ContinuitySessionSummaryV1,
  right: ContinuitySessionSummaryV1,
): number {
  if (left.firstSeenAt !== null && right.firstSeenAt !== null) {
    if (left.firstSeenAt !== right.firstSeenAt) {
      return left.firstSeenAt > right.firstSeenAt ? -1 : 1
    }
  } else if (left.firstSeenAt !== right.firstSeenAt) {
    return left.firstSeenAt === null ? 1 : -1
  }
  return left.sessionId < right.sessionId ? -1 : left.sessionId > right.sessionId ? 1 : 0
}
