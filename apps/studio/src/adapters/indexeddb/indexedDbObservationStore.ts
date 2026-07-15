import {
  TeachingScopeV1Schema,
  samePartition,
  type ObservationEnvelopeV1,
  type TeachingScopeV1,
} from "../../core/contracts/kernel"
import {
  ObservationStoreError,
  classifyObservationStoreError,
  fullEnvelopeEqual,
  parseObservationForAppend,
  type ObservationAppendReceipt,
  type ObservationStore,
  type ObservationStoreLifecycle,
} from "../../core/kernel/observationStore"
import {
  validateObservationJournal,
  type ObservationPartitionReader,
  type SequencedObservationV1,
} from "../../core/kernel/observationReplay"

const DATABASE_PREFIX = "ardesia.kernel.observations:"
const DATABASE_VERSION = 1
const STORE = "observations"
const EVENT_INDEX = "by_event_id"
const SOURCE_INDEX = "by_source_idempotency"

interface StoredObservation {
  partitionSeq?: number
  envelope: ObservationEnvelopeV1
}

export interface IndexedDbObservationStoreOptions {
  readonly openTimeoutMs?: number
  readonly blockedTimeoutMs?: number
  readonly commitTimeoutMs?: number
}

const DEFAULT_OPTIONS = {
  openTimeoutMs: 5_000,
  blockedTimeoutMs: 1_500,
  commitTimeoutMs: 5_000,
}

function positiveTimeout(value: number | undefined, fallback: number): number {
  const normalized = value ?? fallback
  if (!Number.isFinite(normalized) || normalized <= 0) throw new ObservationStoreError("unknown")
  return normalized
}

function assertExactSchema(db: IDBDatabase): void {
  if (db.objectStoreNames.length !== 1 || !db.objectStoreNames.contains(STORE)) {
    throw new ObservationStoreError("unknown")
  }
  const tx = db.transaction(STORE, "readonly")
  const store = tx.objectStore(STORE)
  if (
    store.indexNames.length !== 2
    || !store.indexNames.contains(EVENT_INDEX)
    || !store.indexNames.contains(SOURCE_INDEX)
  ) throw new ObservationStoreError("unknown")
  const eventIndex = store.index(EVENT_INDEX)
  const sourceIndex = store.index(SOURCE_INDEX)
  if (
    store.keyPath !== "partitionSeq"
    || !store.autoIncrement
    || eventIndex.keyPath !== "envelope.eventId"
    || !eventIndex.unique
    || eventIndex.multiEntry
    || sourceIndex.keyPath !== "envelope.sourceIdempotencyKey"
    || !sourceIndex.unique
    || sourceIndex.multiEntry
  ) throw new ObservationStoreError("unknown")
}

function receipt(record: StoredObservation): ObservationAppendReceipt {
  if (!Number.isSafeInteger(record.partitionSeq) || Number(record.partitionSeq) < 1) {
    throw new ObservationStoreError("unknown", "unknown")
  }
  return Object.freeze({
    partitionSeq: Number(record.partitionSeq),
    eventId: record.envelope.eventId,
    sourceIdempotencyKey: record.envelope.sourceIdempotencyKey,
    partition: Object.freeze({
      workspaceId: record.envelope.scope.workspaceId,
      audienceSpaceId: record.envelope.scope.audienceSpaceId,
    }),
  })
}

export async function partitionDatabaseName(
  scope: Pick<TeachingScopeV1, "workspaceId" | "audienceSpaceId">,
): Promise<string> {
  const tuple = JSON.stringify([scope.workspaceId, scope.audienceSpaceId])
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tuple))
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${DATABASE_PREFIX}${hex}`
}

class IndexedDbObservationStore implements ObservationStore, ObservationPartitionReader {
  private state: ObservationStoreLifecycle = "open"
  private readonly db: IDBDatabase
  private readonly partition: TeachingScopeV1
  private readonly commitTimeoutMs: number

  constructor(
    db: IDBDatabase,
    partition: TeachingScopeV1,
    commitTimeoutMs: number,
  ) {
    this.db = db
    this.partition = partition
    this.commitTimeoutMs = commitTimeoutMs
    db.onversionchange = () => {
      if (this.state === "open") this.state = "stale"
      db.close()
    }
    db.onclose = () => {
      if (this.state === "open") this.state = "degraded"
    }
  }

  get lifecycle(): ObservationStoreLifecycle {
    return this.state
  }

  close(): void {
    if (this.state !== "stale" && this.state !== "degraded") this.state = "closed"
    this.db.close()
  }

  private degrade(): void {
    this.state = "degraded"
    this.db.close()
  }

  async append(input: unknown): Promise<ObservationAppendReceipt> {
    const envelope = parseObservationForAppend(input)
    if (!samePartition(this.partition, envelope.scope)) throw new ObservationStoreError("scope-mismatch")
    if (this.state !== "open") throw new ObservationStoreError(this.state)

    return new Promise<ObservationAppendReceipt>((resolve, reject) => {
      let result: ObservationAppendReceipt | undefined
      let logicalError: ObservationStoreError | undefined
      let requestFailure: unknown
      let settled = false
      let tx: IDBTransaction
      try {
        tx = this.db.transaction(STORE, "readwrite")
      } catch (error) {
        reject(classifyObservationStoreError(error))
        return
      }
      const store = tx.objectStore(STORE)
      const finish = (action: () => void) => {
        if (settled) return
        settled = true
        clearTimeout(watchdog)
        action()
      }
      const watchdog = setTimeout(() => finish(() => {
        this.degrade()
        reject(new ObservationStoreError("unknown", "unknown"))
      }), this.commitTimeoutMs)

      tx.oncomplete = () => finish(() => {
        if (logicalError) reject(logicalError)
        else if (result) resolve(result)
        else reject(new ObservationStoreError("unknown", "unknown"))
      })
      tx.onabort = () => finish(() => reject(classifyObservationStoreError(requestFailure ?? tx.error)))
      tx.onerror = () => undefined

      const eventRequest = store.index(EVENT_INDEX).get(envelope.eventId)
      eventRequest.onerror = () => { requestFailure = eventRequest.error }
      eventRequest.onsuccess = () => {
        const existing = eventRequest.result as StoredObservation | undefined
        if (existing) {
          try {
            const parsedExisting = parseObservationForAppend(existing.envelope)
            if (fullEnvelopeEqual(parsedExisting, envelope)) result = receipt(existing)
            else logicalError = new ObservationStoreError("event-conflict")
          } catch {
            logicalError = new ObservationStoreError("unknown", "unknown")
          }
          return
        }

        const sourceRequest = store.index(SOURCE_INDEX).get(envelope.sourceIdempotencyKey)
        sourceRequest.onerror = () => { requestFailure = sourceRequest.error }
        sourceRequest.onsuccess = () => {
          if (sourceRequest.result !== undefined) {
            logicalError = new ObservationStoreError("source-conflict")
            return
          }
          const record: StoredObservation = { envelope }
          const addRequest = store.add(record)
          addRequest.onerror = () => { requestFailure = addRequest.error }
          addRequest.onsuccess = () => {
            record.partitionSeq = Number(addRequest.result)
            result = receipt(record)
          }
        }
      }
    })
  }

  async readPartition(scopeInput: unknown): Promise<readonly SequencedObservationV1[]> {
    const requestedScope = TeachingScopeV1Schema.parse(scopeInput)
    if (!samePartition(this.partition, requestedScope)) throw new ObservationStoreError("scope-mismatch")
    if (this.state !== "open") throw new ObservationStoreError(this.state)

    return new Promise<readonly SequencedObservationV1[]>((resolve, reject) => {
      let rows: unknown[] | undefined
      let requestFailure: unknown
      let settled = false
      let tx: IDBTransaction
      try {
        tx = this.db.transaction(STORE, "readonly")
      } catch (error) {
        reject(classifyObservationStoreError(error))
        return
      }
      const finish = (action: () => void) => {
        if (settled) return
        settled = true
        clearTimeout(watchdog)
        action()
      }
      const watchdog = setTimeout(() => finish(() => {
        this.degrade()
        reject(new ObservationStoreError("unknown", "unknown"))
      }), this.commitTimeoutMs)

      tx.oncomplete = () => finish(() => {
        if (!rows) {
          reject(new ObservationStoreError("unknown", "unknown"))
          return
        }
        try {
          resolve(validateObservationJournal(rows, requestedScope).observations)
        } catch (error) {
          if (error instanceof ObservationStoreError) reject(error)
          else if (error instanceof Error && "code" in error && error.code === "scope-mismatch") {
            reject(new ObservationStoreError("scope-mismatch"))
          } else reject(new ObservationStoreError("unknown", "unknown"))
        }
      })
      tx.onabort = () => finish(() => reject(classifyObservationStoreError(requestFailure ?? tx.error)))
      tx.onerror = () => undefined

      const request = tx.objectStore(STORE).getAll()
      request.onerror = () => { requestFailure = request.error }
      request.onsuccess = () => { rows = request.result as unknown[] }
    })
  }
}

export async function openIndexedDbObservationStore(
  scopeInput: unknown,
  options: IndexedDbObservationStoreOptions = {},
): Promise<ObservationStore & ObservationPartitionReader> {
  const scope = TeachingScopeV1Schema.parse(scopeInput)
  const settings = {
    openTimeoutMs: positiveTimeout(options.openTimeoutMs, DEFAULT_OPTIONS.openTimeoutMs),
    blockedTimeoutMs: positiveTimeout(options.blockedTimeoutMs, DEFAULT_OPTIONS.blockedTimeoutMs),
    commitTimeoutMs: positiveTimeout(options.commitTimeoutMs, DEFAULT_OPTIONS.commitTimeoutMs),
  }
  const name = await partitionDatabaseName(scope)
  return new Promise<ObservationStore & ObservationPartitionReader>((resolve, reject) => {
    let request: IDBOpenDBRequest
    try {
      request = indexedDB.open(name, DATABASE_VERSION)
    } catch (error) {
      reject(classifyObservationStoreError(error))
      return
    }
    let settled = false
    let blockedTimer: ReturnType<typeof setTimeout> | undefined
    const generalTimer = setTimeout(() => fail(new ObservationStoreError("timeout")), settings.openTimeoutMs)
    const clearTimers = () => {
      clearTimeout(generalTimer)
      if (blockedTimer !== undefined) clearTimeout(blockedTimer)
    }
    const fail = (error: ObservationStoreError) => {
      if (settled) return
      settled = true
      clearTimers()
      reject(error)
    }
    request.onupgradeneeded = () => {
      const db = request.result
      const store = db.createObjectStore(STORE, { keyPath: "partitionSeq", autoIncrement: true })
      store.createIndex(EVENT_INDEX, "envelope.eventId", { unique: true })
      store.createIndex(SOURCE_INDEX, "envelope.sourceIdempotencyKey", { unique: true })
    }
    request.onblocked = () => {
      if (blockedTimer === undefined) {
        blockedTimer = setTimeout(() => fail(new ObservationStoreError("blocked")), settings.blockedTimeoutMs)
      }
    }
    request.onerror = () => fail(classifyObservationStoreError(request.error))
    request.onsuccess = () => {
      if (settled) {
        request.result.close()
        return
      }
      settled = true
      clearTimers()
      try {
        assertExactSchema(request.result)
      } catch (error) {
        request.result.close()
        reject(error instanceof ObservationStoreError ? error : classifyObservationStoreError(error))
        return
      }
      resolve(new IndexedDbObservationStore(request.result, scope, settings.commitTimeoutMs))
    }
  })
}
