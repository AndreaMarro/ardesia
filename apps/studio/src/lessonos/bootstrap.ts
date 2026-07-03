// LessonOS — bootstrap del runtime (EVENTLOG-PERSISTENCE-SPEC §4 + §5 inv. 7).
// Compone i pezzi già esistenti senza aggiungerne di nuovi:
//   - createEventLogStore(): IndexedDbEventLog dove c'è IndexedDB, altrimenti
//     fallback InMemoryEventLog (la lezione parte comunque);
//   - runStoragePreflight(): capability snapshot in sola lettura (§4.1);
//   - telemetria di perdita (§4.4): un marker in localStorage ricorda che un
//     log era atteso; alla riapertura, log vuoto + marker = eviction avvenuta →
//     l'evento va reso VISIBILE ("memoria non trovata, ripristina da export"),
//     mai silenzioso. Il marker è consumato alla rilevazione: l'avviso appare
//     una volta, non a ogni reload di una lavagna volutamente nuova.
// I consumer (bridge #34, projection #30) vedranno SOLO EventLogStore.

import type { EventLogStore } from "./eventlog"
import { IndexedDbEventLog, createEventLogStore } from "./indexedDbEventLog"
import {
  runStoragePreflight,
  type StorageCapabilitySnapshot,
  type StoragePreflightEnv,
} from "./storagePreflight"

/** Marker "un event-log con contenuto esiste su questo origin" (telemetria §4.4). */
export const EVENTLOG_EXPECTED_KEY = "lessonos:eventlog-expected"

/** Sottoinsieme di Storage usato per il marker; iniettabile nei test. */
export type MarkerStorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

export interface LessonOsBootstrapEnv extends StoragePreflightEnv {
  /** Default: globalThis.localStorage. Passare esplicitamente undefined = assente. */
  markerStorage?: MarkerStorageLike
}

export interface LessonOsRuntime {
  store: EventLogStore
  capabilities: StorageCapabilitySnapshot
  /**
   * true = alla riapertura il log atteso non c'era (eviction avvenuta, §4.4).
   * Il chiamante DEVE renderlo visibile al docente, mai silenzioso.
   */
  dataLoss: boolean
  /** true = open() ha trovato una sequenza bucata (§5 inv. 5): proporre restore da export. */
  corrupted: boolean
}

function resolveMarkerStorage(env: LessonOsBootstrapEnv): MarkerStorageLike | undefined {
  if ("markerStorage" in env) return env.markerStorage
  return (globalThis as { localStorage?: MarkerStorageLike }).localStorage
}

/** Mai throwing: ogni degrado (no IndexedDB, open fallita, marker illeggibile) è assorbito. */
export async function bootstrapLessonOs(
  env: LessonOsBootstrapEnv = {},
): Promise<LessonOsRuntime> {
  const [store, capabilities] = await Promise.all([
    createEventLogStore("indexedDB" in env ? { factory: env.indexedDB } : {}),
    runStoragePreflight(env),
  ])

  // Telemetria di perdita (§4.4) — solo sul backend persistente: sul fallback
  // InMemory il log è SEMPRE vuoto all'avvio e il marker non è giudicabile.
  let dataLoss = false
  let corrupted = false
  if (store instanceof IndexedDbEventLog) {
    // open() è idempotente: qui ritorna il RecoveryReport già calcolato.
    const report = await store.open()
    corrupted = report.corrupted
    const marker = resolveMarkerStorage(env)
    try {
      if (report.recovered > 0) {
        marker?.setItem(EVENTLOG_EXPECTED_KEY, "1")
      } else if (marker?.getItem(EVENTLOG_EXPECTED_KEY)) {
        dataLoss = true
        marker.removeItem(EVENTLOG_EXPECTED_KEY)
      }
    } catch {
      // marker illeggibile/scrivibile (private mode): telemetria best-effort, mai bloccante
    }
  }

  return { store, capabilities, dataLoss, corrupted }
}