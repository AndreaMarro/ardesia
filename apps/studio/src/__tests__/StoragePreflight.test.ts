// LessonOS — test preflight storage + bootstrap (spec EVENTLOG-PERSISTENCE-SPEC §4).
// Il punto della slice: il capability snapshot registra ciò che si sa senza mai
// bloccare né lanciare; persist() parte SOLO da ensurePersistentStorage (gesto
// utente), mai dal preflight d'avvio; il bootstrap degrada a InMemoryEventLog
// dove IndexedDB manca (jsdom = l'ambiente reale di questo degrado).

import { describe, it, expect } from "vitest"
import { InMemoryEventLog } from "../lessonos/eventlog"
import { bootstrapLessonOs } from "../lessonos/bootstrap"
import {
  deriveStorageAdvice,
  ensurePersistentStorage,
  runStoragePreflight,
  type StorageCapabilitySnapshot,
  type StorageManagerLike,
} from "../lessonos/storagePreflight"

/** Fake StorageManager con contatore chiamate persist() (il check chiave di §4.1). */
function fakeStorage(overrides: Partial<StorageManagerLike> & { persistResult?: boolean } = {}) {
  const calls = { persist: 0, persisted: 0, estimate: 0 }
  const storage: StorageManagerLike = {
    estimate:
      overrides.estimate ??
      (async () => {
        calls.estimate++
        return { usage: 1234, quota: 500_000 }
      }),
    persisted:
      overrides.persisted ??
      (async () => {
        calls.persisted++
        return false
      }),
    persist:
      overrides.persist ??
      (async () => {
        calls.persist++
        return overrides.persistResult ?? true
      }),
  }
  return { storage, calls }
}

const NOW = () => 42_000

describe("runStoragePreflight (§4.1 — sola lettura all'avvio)", () => {
  it("legge persisted() ed estimate() e NON chiama mai persist()", async () => {
    const { storage, calls } = fakeStorage()
    const snap = await runStoragePreflight({ storage, indexedDB: undefined, now: NOW })
    expect(snap).toEqual({
      at: 42_000,
      indexedDb: false,
      persisted: false,
      persistRequested: false,
      persistGranted: null,
      usageBytes: 1234,
      quotaBytes: 500_000,
    })
    expect(calls.persist).toBe(0)
    expect(calls.persisted).toBe(1)
    expect(calls.estimate).toBe(1)
  })

  it("senza Storage API degrada a null su tutto, senza lanciare", async () => {
    const snap = await runStoragePreflight({ storage: undefined, indexedDB: undefined, now: NOW })
    expect(snap.persisted).toBeNull()
    expect(snap.usageBytes).toBeNull()
    expect(snap.quotaBytes).toBeNull()
    expect(snap.persistRequested).toBe(false)
    expect(snap.indexedDb).toBe(false)
  })

  it("estimate() che lancia degrada usage/quota a null ma persisted resta letto", async () => {
    const { storage } = fakeStorage({
      estimate: async () => {
        throw new Error("quota interrogation failed")
      },
      persisted: async () => true,
    })
    const snap = await runStoragePreflight({ storage, indexedDB: undefined, now: NOW })
    expect(snap.persisted).toBe(true)
    expect(snap.usageBytes).toBeNull()
    expect(snap.quotaBytes).toBeNull()
  })
})

describe("ensurePersistentStorage (§4.1 — persist() su gesto utente)", () => {
  it("chiama persist() una volta e registra la concessione", async () => {
    const { storage, calls } = fakeStorage({ persistResult: true })
    const snap = await ensurePersistentStorage({ storage, indexedDB: undefined, now: NOW })
    expect(calls.persist).toBe(1)
    expect(snap.persistRequested).toBe(true)
    expect(snap.persistGranted).toBe(true)
  })

  it("il rifiuto (WebKit: negazione silenziosa) finisce nel snapshot, non in un errore", async () => {
    const { storage } = fakeStorage({ persistResult: false })
    const snap = await ensurePersistentStorage({ storage, indexedDB: undefined, now: NOW })
    expect(snap.persistRequested).toBe(true)
    expect(snap.persistGranted).toBe(false)
  })

  it("senza Storage API: persistRequested=true, persistGranted=null, nessun throw", async () => {
    const snap = await ensurePersistentStorage({ storage: undefined, indexedDB: undefined, now: NOW })
    expect(snap.persistRequested).toBe(true)
    expect(snap.persistGranted).toBeNull()
  })
})

describe("bootstrapLessonOs (§5 inv. 7 — factory + preflight, mai bloccante)", () => {
  it("senza IndexedDB degrada a InMemoryEventLog e lo snapshot lo dichiara", async () => {
    const { storage } = fakeStorage()
    const runtime = await bootstrapLessonOs({ storage, indexedDB: undefined, now: NOW })
    expect(runtime.store).toBeInstanceOf(InMemoryEventLog)
    expect(runtime.capabilities.indexedDb).toBe(false)
    expect(runtime.capabilities.persistRequested).toBe(false)
    // runtime.persistent = false col fallback: guida l'advice UX (§4.3).
    expect(runtime.persistent).toBe(false)
  })

  it("lo store degradato è funzionante: append + readAll come da contratto #24", async () => {
    const runtime = await bootstrapLessonOs({ storage: undefined, indexedDB: undefined })
    const appended = await runtime.store.append({
      kind: "lesson.started",
      room: "elab-v1-cap6",
      t: 1000,
      evidence: ["lesson:elab-v1-cap6@1000"],
    })
    expect(appended.seq).toBe(1)
    expect(await runtime.store.readAll()).toHaveLength(1)
  })

  it("in jsdom (ambiente reale senza indexedDB iniettato) non lancia e degrada", async () => {
    const runtime = await bootstrapLessonOs()
    expect(runtime.store).toBeDefined()
    expect(typeof runtime.capabilities.at).toBe("number")
  })
})

describe("deriveStorageAdvice (\u00a74.3 \u2014 salvato / da esportare, linguaggio docente)", () => {
  const base: StorageCapabilitySnapshot = {
    at: 1,
    indexedDb: true,
    persisted: true,
    persistRequested: true,
    persistGranted: true,
    usageBytes: 1000,
    quotaBytes: 100000,
  }

  it("storage sano \u21d2 ok, nessun motivo", () => {
    expect(deriveStorageAdvice(base)).toEqual({ advice: "ok", reason: null })
  })

  it("niente IndexedDB (memoria solo in RAM) \u21d2 export consigliato", () => {
    const { advice, reason } = deriveStorageAdvice({ ...base, indexedDb: false })
    expect(advice).toBe("export-advised")
    expect(reason).toContain(".lesson")
    expect(reason).not.toMatch(/OPFS|IndexedDB|quota/i)
  })

  it("persist() chiesto e negato (e non gi\u00e0 persisted) \u21d2 export consigliato", () => {
    const { advice } = deriveStorageAdvice({ ...base, persistGranted: false, persisted: false })
    expect(advice).toBe("export-advised")
    // Ma se l'origin risulta comunque persisted, il rifiuto non conta.
    expect(deriveStorageAdvice({ ...base, persistGranted: false, persisted: true }).advice).toBe("ok")
  })

  it("persist() FALLITO silenziosamente (granted=null) \u2261 negato \u21d2 export consigliato", () => {
    // Su WebKit un persist() che fallisce (null) \u00e8 inaffidabile come un rifiuto.
    const { advice } = deriveStorageAdvice({ ...base, persistGranted: null, persisted: false })
    expect(advice).toBe("export-advised")
  })

  it("storePersistent=false forza export anche con indexedDb presente (fallback InMemory: solo-RAM)", () => {
    // L'API IndexedDB c'\u00e8 (indexedDb=true) ma lo store reale NON persiste (open fallita).
    const snap = { ...base, indexedDb: true }
    expect(deriveStorageAdvice(snap, false).advice).toBe("export-advised")
    // Con il default (= indexedDb) direbbe erroneamente "ok": \u00e8 il gap che il param chiude.
    expect(deriveStorageAdvice(snap).advice).toBe("ok")
  })

  it("persist() NON ancora richiesto non \u00e8 un motivo (arriva col primo gesto, \u00a74.1)", () => {
    const { advice } = deriveStorageAdvice({
      ...base,
      persistRequested: false,
      persistGranted: null,
      persisted: false,
    })
    expect(advice).toBe("ok")
  })

  it("quota quasi piena (>80%) \u21d2 export consigliato; 50% \u21d2 ok", () => {
    expect(deriveStorageAdvice({ ...base, usageBytes: 85000 }).advice).toBe("export-advised")
    expect(deriveStorageAdvice({ ...base, usageBytes: 50000 }).advice).toBe("ok")
    // usage/quota ignoti (null): nessun falso allarme.
    expect(deriveStorageAdvice({ ...base, usageBytes: null, quotaBytes: null }).advice).toBe("ok")
  })
})
