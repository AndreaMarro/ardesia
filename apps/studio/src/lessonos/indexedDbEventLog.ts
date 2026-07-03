// LessonOS — IndexedDbEventLog: backend persistente dell'event-log (fase 1 di
// EVENTLOG-PERSISTENCE-SPEC §3.1, Opzione A). Chiude la perdita-al-reload su
// iPad/WebKit SENZA dipendenze nuove e senza gate: object store `lessonos_events`
// = trasposizione 1:1 di EVENT_LOG_DDL ({seq, t, kind, payload, evidence}, con
// payload = JSON dell'evento completo, fonte per il materializer).
//
// Il contratto #24 (EventLogStore: append/readAll) resta intatto: materializer,
// recall, bridge e projection non cambiano di una riga. Il backend SQLite/OPFS
// (opfs-sahpool) resta GATE ANDREA ⑦ e arriverà come implementazione sorella.
//
// seq: gestito esplicitamente (lastSeq + 1) con `add()` — che fallisce su chiave
// esistente — invece del key generator nativo IDB: il generator incrementa anche
// su transazioni abortite, e i buchi che ne nascerebbero sono indistinguibili
// dalla corruzione per la recovery conservativa (spec §5, invariante 5).

import {
  InMemoryEventLog,
  assertEvidence,
  type AppendedEvent,
  type EventLogStore,
  type LessonOsEvent,
} from "./eventlog"

/** Esito dell'apertura/recovery del log persistente (spec §5). */
export interface RecoveryReport {
  /** Eventi validi recuperati (ordine seq). */
  recovered: number
  /** Ultimo seq presente; il prossimo append usa lastSeq + 1. */
  lastSeq: number
  /** Record scartati in coda (torn write). Con IndexedDB le transazioni sono atomiche: sempre 0. */
  droppedTail: number
  /** Buco in mezzo alla sequenza: il log non si "ripara" inventando — restore da export. */
  corrupted: boolean
}

const DB_NAME = "lessonos-eventlog"
const STORE_NAME = "lessonos_events"
const DB_VERSION = 1

/** Record fisico: trasposizione 1:1 dello schema EVENT_LOG_DDL. */
interface StoredEventRecord {
  seq: number
  t: number
  kind: string
  /** JSON dell'evento completo (senza seq): la fonte che il materializer rilegge. */
  payload: string
  evidence: string[]
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("LessonOS event log: richiesta IndexedDB fallita"))
  })
}

export interface IndexedDbEventLogOptions {
  /** Iniettabile per test/ambienti senza global; default: globalThis.indexedDB. */
  factory?: IDBFactory
  dbName?: string
}

export class IndexedDbEventLog implements EventLogStore {
  private readonly factory: IDBFactory | undefined
  private readonly dbName: string
  private db: IDBDatabase | null = null
  private lastSeq = 0
  private lastReport: RecoveryReport | null = null

  constructor(options: IndexedDbEventLogOptions = {}) {
    this.factory = options.factory ?? (globalThis as { indexedDB?: IDBFactory }).indexedDB
    this.dbName = options.dbName ?? DB_NAME
  }

  /** Apre lo storage, ricostruisce lastSeq, verifica la contiguità della sequenza. Idempotente. */
  async open(): Promise<RecoveryReport> {
    if (this.db && this.lastReport) return this.lastReport
    if (!this.factory) {
      throw new Error("LessonOS event log: IndexedDB non disponibile in questo ambiente")
    }
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.factory!.open(this.dbName, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "seq" })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error("LessonOS event log: apertura IndexedDB fallita"))
    })

    const keys = await requestToPromise(
      this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAllKeys(),
    )
    const seqs = (keys as number[]).slice().sort((a, b) => a - b)
    const lastSeq = seqs.length > 0 ? seqs[seqs.length - 1] : 0
    // Recovery conservativa (invariante 5): la sequenza DEVE essere 1..lastSeq
    // senza buchi; un buco è corruzione, mai da riparare in silenzio.
    const contiguous = seqs.every((seq, i) => seq === i + 1)
    this.lastSeq = lastSeq
    this.lastReport = {
      recovered: seqs.length,
      lastSeq,
      droppedTail: 0,
      corrupted: !contiguous,
    }
    return this.lastReport
  }

  async append(event: LessonOsEvent): Promise<AppendedEvent> {
    const db = this.requireOpenDb()
    // Validazione identica a InMemoryEventLog, PRIMA di toccare lo storage (invariante 4).
    assertEvidence(event.evidence, event.kind)
    if (!Number.isFinite(event.t)) {
      throw new Error(`LessonOS event log: timestamp non valido per ${event.kind}`)
    }
    const seq = this.lastSeq + 1
    const record: StoredEventRecord = {
      seq,
      t: event.t,
      kind: event.kind,
      payload: JSON.stringify(event),
      evidence: [...event.evidence],
    }
    const txn = db.transaction(STORE_NAME, "readwrite")
    const done = new Promise<void>((resolve, reject) => {
      txn.oncomplete = () => resolve()
      txn.onabort = () => reject(txn.error ?? new Error("LessonOS event log: transazione abortita"))
      txn.onerror = () => reject(txn.error ?? new Error("LessonOS event log: scrittura fallita"))
    })
    // `add`, mai `put`: su chiave esistente fallisce — il log non riscrive mai (append-only).
    await requestToPromise(txn.objectStore(STORE_NAME).add(record))
    await done
    this.lastSeq = seq
    return Object.freeze({ ...structuredClone(event), seq })
  }

  async readAll(): Promise<AppendedEvent[]> {
    const db = this.requireOpenDb()
    const records = await requestToPromise(
      db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll(),
    )
    return (records as StoredEventRecord[])
      .slice()
      .sort((a, b) => a.seq - b.seq)
      .map((record) => Object.freeze({ ...(JSON.parse(record.payload) as LessonOsEvent), seq: record.seq }))
  }

  /** Snapshot JSONL dell'intero log (spec §5): una riga = un AppendedEvent, seq inclusi. */
  async exportSnapshot(): Promise<Blob> {
    return exportEventLogSnapshot(this)
  }

  async close(): Promise<void> {
    this.db?.close()
    this.db = null
    this.lastReport = null
  }

  private requireOpenDb(): IDBDatabase {
    if (!this.db) {
      throw new Error("LessonOS event log: chiamare open() prima di usare il log persistente")
    }
    return this.db
  }
}

/**
 * Factory di cablaggio (spec §5, invariante 7): IndexedDB dove c'è, altrimenti
 * fallback InMemoryEventLog (test/SSR/private-browsing). I consumer vedono solo
 * EventLogStore; se anche open() fallisce (quota, private mode) si degrada in
 * memoria: la lezione parte comunque, la durabilità vera resta l'export .lesson.
 */
/**
 * Snapshot JSONL da QUALSIASI EventLogStore (spec #35 §5: una riga = un
 * AppendedEvent, seq preservati — è il formato che importSnapshot/restore
 * rileggerà). Funziona anche sul fallback InMemoryEventLog: l'export .lesson
 * è l'unica durabilità vera proprio quando la persistenza locale manca (§4.3).
 */
export async function exportEventLogSnapshot(store: EventLogStore): Promise<Blob> {
  const events = await store.readAll()
  const lines = events.map((event) => JSON.stringify(event)).join("\n")
  return new Blob([lines.length > 0 ? `${lines}\n` : ""], { type: "application/x-ndjson" })
}

export async function createEventLogStore(
  options: IndexedDbEventLogOptions = {},
): Promise<EventLogStore> {
  const factory = "factory" in options ? options.factory : (globalThis as { indexedDB?: IDBFactory }).indexedDB
  if (!factory) return new InMemoryEventLog()
  const log = new IndexedDbEventLog({ ...options, factory })
  try {
    await log.open()
    return log
  } catch {
    return new InMemoryEventLog()
  }
}
