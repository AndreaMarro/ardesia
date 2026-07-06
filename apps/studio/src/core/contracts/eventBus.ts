// Core contract — event-bus tipizzato Core↔Plugin (ARCHITECTURE-CANON §4).
// Bus sincrono, deterministico, zero dipendenze: la mappa kind→payload è il
// contratto. Gli eventi didattici riusano le forme dell'event-log LessonOS
// (eventlog.ts resta l'unica fonte di verità persistita; il bus è transito).

import type { EvidenceRef, Labels } from "../../lessonos/eventlog"

interface BusEventBase {
  /** Timestamp ms epoch fornito dall'emittente. */
  t: number
  evidence: EvidenceRef[]
}

/**
 * Vocabolario Core↔Plugin. Chiuso per design (deny-by-default come le
 * capability): un plugin non può emettere kind fuori mappa senza estendere
 * QUESTO tipo, cioè senza passare dal contratto.
 */
export interface ArdesiaEventMap {
  "material.cited": BusEventBase & {
    materialId: string
    conceptId?: string
    labels: Labels
  }
  "lesson.step": BusEventBase & {
    stepIndex: number
    room: string
  }
  /**
   * Errore didattico osservato dal plugin (es. common_mistakes del Pack):
   * stessa forma del kind `error.observed` dell'event-log — il bus trasporta,
   * l'host promuove a fatto (busEventLogBinding), il plugin non tocca la memoria.
   */
  "error.observed": BusEventBase & {
    errorId: string
    conceptId: string
    /** Studente cui l'errore è attribuito; assente = non attribuito. */
    studentId?: string
    labels: Labels
  }
}

export type ArdesiaEventKind = keyof ArdesiaEventMap

export interface TypedEventBus<EventMap> {
  on<K extends keyof EventMap>(kind: K, handler: (event: EventMap[K]) => void): () => void
  emit<K extends keyof EventMap>(kind: K, event: EventMap[K]): void
  /** Osservatore degli errori degli handler (mai swallow silenzioso). */
  onHandlerError(observer: (error: unknown, kind: string) => void): () => void
}

/**
 * Implementazione minima: consegna sincrona in ordine di iscrizione; un
 * handler che lancia NON blocca gli altri, l'errore va agli osservatori
 * (fail-visible, non fail-silent).
 */
export function createTypedEventBus<EventMap>(): TypedEventBus<EventMap> {
  const handlers = new Map<keyof EventMap, Set<(event: never) => void>>()
  const errorObservers = new Set<(error: unknown, kind: string) => void>()

  return {
    on(kind, handler) {
      let set = handlers.get(kind)
      if (!set) {
        set = new Set()
        handlers.set(kind, set)
      }
      set.add(handler as (event: never) => void)
      return () => {
        set.delete(handler as (event: never) => void)
      }
    },
    emit(kind, event) {
      const set = handlers.get(kind)
      if (!set) return
      for (const handler of [...set]) {
        try {
          ;(handler as (e: typeof event) => void)(event)
        } catch (error) {
          for (const observer of errorObservers) observer(error, String(kind))
        }
      }
    },
    onHandlerError(observer) {
      errorObservers.add(observer)
      return () => {
        errorObservers.delete(observer)
      }
    },
  }
}
