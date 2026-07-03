// LessonOS — bootstrap del runtime (EVENTLOG-PERSISTENCE-SPEC §4 + §5 inv. 7).
// Compone i due pezzi già esistenti senza aggiungerne di nuovi:
//   - createEventLogStore(): IndexedDbEventLog dove c'è IndexedDB, altrimenti
//     fallback InMemoryEventLog (la lezione parte comunque);
//   - runStoragePreflight(): capability snapshot in sola lettura (§4.1).
// I consumer (bridge #34, projection #30) vedranno SOLO EventLogStore.

import type { EventLogStore } from "./eventlog"
import { createEventLogStore } from "./indexedDbEventLog"
import {
  runStoragePreflight,
  type StorageCapabilitySnapshot,
  type StoragePreflightEnv,
} from "./storagePreflight"

export interface LessonOsRuntime {
  store: EventLogStore
  capabilities: StorageCapabilitySnapshot
}

/** Mai throwing: ogni degrado (no IndexedDB, open fallita) è già dentro i pezzi. */
export async function bootstrapLessonOs(
  env: StoragePreflightEnv = {},
): Promise<LessonOsRuntime> {
  const [store, capabilities] = await Promise.all([
    createEventLogStore("indexedDB" in env ? { factory: env.indexedDB } : {}),
    runStoragePreflight(env),
  ])
  return { store, capabilities }
}
