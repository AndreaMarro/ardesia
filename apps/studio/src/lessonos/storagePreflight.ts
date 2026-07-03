// LessonOS — preflight storage (EVENTLOG-PERSISTENCE-SPEC §4).
// Due operazioni distinte, entrambe MAI bloccanti e MAI throwing:
//
//   - runStoragePreflight(): SOLO lettura (estimate() + persisted()) — all'avvio
//     workspace. Non chiama mai persist(): su WebKit la concessione dipende da
//     euristiche di interazione, chiederla all'avvio la sprecherebbe (§4.1).
//   - ensurePersistentStorage(): chiama persist() — da invocare in un momento di
//     chiara interazione utente (primo gesto sulla lavagna / lesson.started).
//
// Ogni campo non determinabile degrada a null: il capability snapshot registra
// ciò che si sa, la lezione parte comunque (la durabilità vera resta l'export).

/** Capability snapshot (spec §4.1): registrato, mai bloccante. */
export interface StorageCapabilitySnapshot {
  /** Epoch ms della rilevazione. */
  at: number
  /** IndexedDB presente nell'ambiente (prerequisito del backend persistente). */
  indexedDb: boolean
  /** Esito di navigator.storage.persisted(); null = API assente o errore. */
  persisted: boolean | null
  /** true se persist() è stato chiamato (solo ensurePersistentStorage). */
  persistRequested: boolean
  /** Esito di persist(); null = mai chiamato, API assente o errore. */
  persistGranted: boolean | null
  usageBytes: number | null
  quotaBytes: number | null
}

/** Sottoinsieme di StorageManager usato dal preflight; iniettabile nei test. */
export type StorageManagerLike = {
  estimate?: () => Promise<{ usage?: number; quota?: number }>
  persisted?: () => Promise<boolean>
  persist?: () => Promise<boolean>
}

export interface StoragePreflightEnv {
  /** Default: globalThis.navigator.storage (se esiste). */
  storage?: StorageManagerLike
  /** Default: globalThis.indexedDB. Passare esplicitamente undefined = assente. */
  indexedDB?: IDBFactory
  /** Clock iniettabile per test deterministici. */
  now?: () => number
}

function resolveStorage(env: StoragePreflightEnv): StorageManagerLike | undefined {
  if ("storage" in env) return env.storage
  return (globalThis as { navigator?: { storage?: StorageManagerLike } }).navigator?.storage
}

function resolveIndexedDb(env: StoragePreflightEnv): IDBFactory | undefined {
  if ("indexedDB" in env) return env.indexedDB
  return (globalThis as { indexedDB?: IDBFactory }).indexedDB
}

async function safeCall<T>(fn: (() => Promise<T>) | undefined): Promise<T | null> {
  if (typeof fn !== "function") return null
  try {
    return await fn()
  } catch {
    return null
  }
}

async function buildSnapshot(
  env: StoragePreflightEnv,
  persist: { requested: boolean; granted: boolean | null },
): Promise<StorageCapabilitySnapshot> {
  const storage = resolveStorage(env)
  const now = env.now ?? Date.now
  const persisted = await safeCall(storage?.persisted?.bind(storage))
  const estimate = await safeCall(storage?.estimate?.bind(storage))
  return {
    at: now(),
    indexedDb: resolveIndexedDb(env) !== undefined,
    persisted,
    persistRequested: persist.requested,
    persistGranted: persist.granted,
    usageBytes: typeof estimate?.usage === "number" ? estimate.usage : null,
    quotaBytes: typeof estimate?.quota === "number" ? estimate.quota : null,
  }
}

/** Preflight all'avvio workspace (§4.1): sola lettura, mai persist(), mai throw. */
export async function runStoragePreflight(
  env: StoragePreflightEnv = {},
): Promise<StorageCapabilitySnapshot> {
  return buildSnapshot(env, { requested: false, granted: null })
}

/**
 * Richiesta di storage persistente (§4.1): da chiamare su chiara interazione
 * utente. persist() è idempotente lato browser; l'esito (anche il rifiuto
 * silenzioso di WebKit) finisce nel capability snapshot, mai in un errore.
 */
export async function ensurePersistentStorage(
  env: StoragePreflightEnv = {},
): Promise<StorageCapabilitySnapshot> {
  const storage = resolveStorage(env)
  const granted = await safeCall(storage?.persist?.bind(storage))
  return buildSnapshot(env, { requested: true, granted })
}
