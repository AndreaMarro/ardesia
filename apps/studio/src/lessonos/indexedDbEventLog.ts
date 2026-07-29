// LessonOS — IndexedDB append-only event log.
// FB-3B keeps the v1 physical database contract intact while adding canonical
// EventEnvelope v2 rows. Legacy rows are never rewritten: they are projected
// deterministically from one readonly snapshot.

import {
  InMemoryEventLog,
  UNASSIGNED_LESSON_ID,
  adaptLegacyLessonOsV1Append,
  adaptLegacyLessonOsV1Log,
  assertEvidence,
  assertLegacyLessonOsEvent,
  assertLessonOsEnvelopePayload,
  toLegacyLessonOsEvent,
  type AnyEventEnvelopeV2,
  type AppendedEvent,
  type AppendedEventEnvelopeV2,
  type AppendEnvelopeResult,
  type EnvelopeEventLogStore,
  type EventLogStore,
  type LegacyEnvelopeIdentity,
  type LessonOsEvent,
} from "./eventlog"
import {
  assertEventEnvelopeV2,
  assertFounderBetaAuthority,
  studioProducerIdentity,
  type EventActor,
  type ProducerIdentity,
} from "../core/contracts/eventEnvelope"
import { validateRoomId } from "../store/roomPaths"

/** Esito dell'apertura/recovery del log persistente (spec §5). */
export interface RecoveryReport {
  recovered: number
  lastSeq: number
  droppedTail: number
  corrupted: boolean
}

const DB_NAME = "lessonos-eventlog"
const STORE_NAME = "lessonos_events"
const DB_VERSION = 2
const SESSION_INDEX_NAME = "by_lesson_session_seq"

interface StoredLegacyEventRecord {
  seq: number
  t: number
  kind: string
  payload: string
  evidence: string[]
}

type StoredEnvelopeRecord = AppendedEventEnvelopeV2
type StoredEventRecord = StoredLegacyEventRecord | StoredEnvelopeRecord

const V1_ADAPTER_PRODUCER_ID = "com.github.andreamarro.ardesia.studio.lessonos-v1-adapter"
const V1_ADAPTER_ACTOR: EventActor = { type: "system", id: "lessonos-v1-adapter" }
const V1_PROJECTION_ACTOR: EventActor = { type: "system", id: "lessonos-v1-projection" }

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("LessonOS event log: richiesta IndexedDB fallita"))
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasSchemaVersion(value: unknown): boolean {
  return isRecord(value) && Object.prototype.hasOwnProperty.call(value, "schemaVersion")
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null) return value
  const pending: object[] = [value as object]
  const seen = new WeakSet<object>()
  while (pending.length > 0) {
    const current = pending.pop()!
    if (seen.has(current)) continue
    seen.add(current)
    for (const key of Reflect.ownKeys(current)) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key)
      if (descriptor && "value" in descriptor && typeof descriptor.value === "object" && descriptor.value !== null) {
        pending.push(descriptor.value)
      }
    }
    Object.freeze(current)
  }
  return value
}

function assertSeq(value: unknown): asserts value is number {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw new Error("LessonOS event log: record fisico con seq non valido")
  }
}

function splitStoredEnvelope(value: unknown): {
  seq: number
  envelope: AnyEventEnvelopeV2
  appended: AppendedEventEnvelopeV2
} {
  if (!isRecord(value)) throw new Error("LessonOS event log: record v2 fisico malformato")
  const snapshot = structuredClone(value)
  const { seq, ...envelope } = snapshot
  assertSeq(seq)
  assertEventEnvelopeV2(envelope)
  assertFounderBetaAuthority(envelope)
  assertLessonOsEnvelopePayload(envelope.kind, envelope.payload)
  const appended = deepFreeze({ ...envelope, seq }) as AppendedEventEnvelopeV2
  return { seq, envelope, appended }
}

function parseStoredLegacy(value: unknown): AppendedEvent {
  if (!isRecord(value)) throw new Error("LessonOS event log: record legacy fisico malformato")
  const seq = value.seq
  assertSeq(seq)
  if (typeof value.payload !== "string") {
    throw new Error("LessonOS event log: payload legacy fisico malformato")
  }
  let event: LessonOsEvent
  try {
    event = JSON.parse(value.payload) as LessonOsEvent
  } catch {
    throw new Error("LessonOS event log: payload legacy non-JSON")
  }
  if (!isRecord(event) || typeof event.kind !== "string") {
    throw new Error("LessonOS event log: evento legacy fisico malformato")
  }
  assertLegacyLessonOsEvent(event)
  if (
    value.kind !== event.kind ||
    value.t !== event.t ||
    JSON.stringify(value.evidence) !== JSON.stringify(event.evidence)
  ) {
    throw new Error("LessonOS event log: record legacy incoerente con il payload")
  }
  return deepFreeze({ ...structuredClone(event), seq }) as AppendedEvent
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(",")}]`
  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`
}

function cryptoFor(optionsCrypto?: Crypto): Crypto {
  const resolved = optionsCrypto ?? (globalThis as { crypto?: Crypto }).crypto
  if (!resolved?.subtle || !resolved.getRandomValues) {
    throw new Error("LessonOS event log: Web Crypto non disponibile")
  }
  return resolved
}

function uuidFromBytes(bytes: Uint8Array): string {
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function randomUuid(crypto: Crypto): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID().toLowerCase()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  return uuidFromBytes(bytes)
}

async function deterministicUuidV8(crypto: Crypto, material: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material)))
  const bytes = digest.slice(0, 16)
  bytes[6] = (bytes[6]! & 0x0f) | 0x80
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  return uuidFromBytes(bytes)
}

function producerWithId(id: string): ProducerIdentity {
  const current = studioProducerIdentity()
  return Object.freeze({ ...current, id })
}

function validateLegacyInput(event: LessonOsEvent): LessonOsEvent {
  assertLegacyLessonOsEvent(event)
  const snapshot = structuredClone(event)
  assertLegacyLessonOsEvent(snapshot)
  return snapshot
}

function exactEnvelopeBytes(envelope: AnyEventEnvelopeV2): string {
  return JSON.stringify(envelope)
}

function scanEnvelopeIdentity(
  existing: AppendedEventEnvelopeV2[],
  incoming: AnyEventEnvelopeV2,
): { retry: AppendedEventEnvelopeV2 | null } {
  assertGlobalEnvelopeUniqueness(existing)
  const eventMatches = existing.filter((event) => event.eventId === incoming.eventId)
  const idempotencyMatches =
    incoming.idempotencyKey === null
      ? []
      : existing.filter((event) => event.idempotencyKey === incoming.idempotencyKey)
  const uniqueMatches = new Map<number, AppendedEventEnvelopeV2>()
  for (const event of [...eventMatches, ...idempotencyMatches]) uniqueMatches.set(event.seq, event)

  if (eventMatches.length > 1 || idempotencyMatches.length > 1 || uniqueMatches.size > 1) {
    throw new Error("LessonOS event log: corruzione v2, identità duplicate o divergenti")
  }
  const match = uniqueMatches.values().next().value as AppendedEventEnvelopeV2 | undefined
  if (!match) return { retry: null }

  const { seq: _seq, ...storedEnvelope } = match
  if (exactEnvelopeBytes(storedEnvelope) === exactEnvelopeBytes(incoming)) {
    return { retry: match }
  }
  if (match.eventId === incoming.eventId) {
    throw new Error("LessonOS event log: eventId già usato da un envelope differente")
  }
  throw new Error("LessonOS event log: idempotencyKey già usata da un envelope differente")
}

function assertGlobalEnvelopeUniqueness(events: AppendedEventEnvelopeV2[]): void {
  const eventIds = new Set<string>()
  const idempotencyKeys = new Set<string>()
  for (const event of events) {
    if (eventIds.has(event.eventId)) {
      throw new Error("LessonOS event log: corruzione v2, eventId duplicato")
    }
    eventIds.add(event.eventId)
    if (event.idempotencyKey !== null) {
      if (idempotencyKeys.has(event.idempotencyKey)) {
        throw new Error("LessonOS event log: corruzione v2, idempotencyKey duplicata")
      }
      idempotencyKeys.add(event.idempotencyKey)
    }
  }
}

interface LifecycleMarker {
  seq: number
  type: "start" | "end"
  room: string | null
}

interface LifecycleInterval {
  startSeq: number
  endSeq: number
  room: string
  valid: boolean
  sessionId?: string
}

function validRoomOrNull(room: unknown): string | null {
  if (typeof room !== "string") return null
  try {
    return validateRoomId(room)
  } catch {
    return null
  }
}

function explicitRoomSignal(event: LessonOsEvent): { present: boolean; room: string | null } {
  if (event.kind === "studentpack.generated" && event.fromRoom !== undefined) {
    return { present: true, room: validRoomOrNull(event.fromRoom) }
  }
  if (!("room" in event) || event.room === undefined) return { present: false, room: null }
  return { present: true, room: validRoomOrNull(event.room) }
}

function lifecycleIntervals(events: AppendedEvent[]): LifecycleInterval[] {
  const markers: LifecycleMarker[] = events
    .filter((event) => event.kind === "lesson.started" || event.kind === "lesson.ended")
    .map((event) => ({
      seq: event.seq,
      type: event.kind === "lesson.started" ? "start" : "end",
      room: validRoomOrNull(event.room),
    }))
  const startsByRoom = new Map<string, LifecycleMarker[]>()
  const candidates: LifecycleInterval[] = []

  for (const marker of markers) {
    if (marker.room === null) continue
    const starts = startsByRoom.get(marker.room) ?? []
    startsByRoom.set(marker.room, starts)
    if (marker.type === "start") {
      starts.push(marker)
      continue
    }
    const start = starts.shift()
    if (start) {
      candidates.push({ startSeq: start.seq, endSeq: marker.seq, room: marker.room, valid: true })
    }
  }

  const unmatchedStarts = [
    ...startsByRoom.values(),
    markers.filter((marker) => marker.type === "start" && marker.room === null),
  ].flat()
  for (const candidate of candidates) {
    if (
      markers.some(
        (marker) =>
          marker.seq > candidate.startSeq &&
          marker.seq < candidate.endSeq &&
          !(marker.room === candidate.room && marker.type === "end" && marker.seq === candidate.endSeq),
      )
    ) {
      candidate.valid = false
    }
    if (unmatchedStarts.some((marker) => marker.seq < candidate.startSeq)) candidate.valid = false
  }
  for (let left = 0; left < candidates.length; left += 1) {
    for (let right = left + 1; right < candidates.length; right += 1) {
      const a = candidates[left]!
      const b = candidates[right]!
      const overlap = a.startSeq <= b.endSeq && b.startSeq <= a.endSeq
      if (overlap) {
        a.valid = false
        b.valid = false
      }
    }
  }
  return candidates
}

async function projectLegacyRows(
  rows: Array<{ physical: StoredLegacyEventRecord; event: AppendedEvent }>,
  dbName: string,
  crypto: Crypto,
): Promise<AppendedEventEnvelopeV2[]> {
  const events = rows.map((row) => row.event)
  const intervals = lifecycleIntervals(events)
  const projectionProducer = producerWithId(V1_ADAPTER_PRODUCER_ID)

  for (const interval of intervals.filter((item) => item.valid)) {
    interval.sessionId = await deterministicUuidV8(
      crypto,
      `ardesia:legacy-session:v1|${dbName}|${STORE_NAME}|${interval.room}|${interval.startSeq}|${interval.endSeq}`,
    )
  }

  const projected: AppendedEventEnvelopeV2[] = []
  for (const row of rows) {
    const physicalBytes = stableJson(row.physical)
    const eventId = await deterministicUuidV8(
      crypto,
      `ardesia:legacy-event:v1|${dbName}|${STORE_NAME}|${row.event.seq}|${physicalBytes}`,
    )
    const owners = intervals.filter(
      (interval) => interval.valid && row.event.seq >= interval.startSeq && row.event.seq <= interval.endSeq,
    )
    const explicitRoom = explicitRoomSignal(row.event)
    const owner =
      owners.length === 1 &&
      (!explicitRoom.present || (explicitRoom.room !== null && explicitRoom.room === owners[0]!.room))
        ? owners[0]!
        : null
    const lessonId = owner?.room ?? UNASSIGNED_LESSON_ID
    const sessionId =
      owner?.sessionId ??
      (await deterministicUuidV8(
        crypto,
        `ardesia:legacy-unassigned-session:v1|${dbName}|${STORE_NAME}|${row.event.seq}|${physicalBytes}`,
      ))
    const identity: LegacyEnvelopeIdentity = {
      lessonId,
      sessionId,
      eventId,
      actor: V1_PROJECTION_ACTOR,
      producer: projectionProducer,
      idempotencyKey: `legacy:${eventId}`,
    }
    const envelope = adaptLegacyLessonOsV1Log(row.event, identity)
    const { seq: _seq, ...withoutSeq } = envelope
    assertEventEnvelopeV2(withoutSeq)
    assertFounderBetaAuthority(withoutSeq)
    projected.push(deepFreeze(structuredClone(envelope)) as AppendedEventEnvelopeV2)
  }
  return projected
}

export interface TrustedLegacyEventContext {
  lessonId: string
  sessionId: string
  actor?: EventActor
  producer?: ProducerIdentity
}

/** Scope richiesto: rende l'integrita' attribuibile invece che globale. */
export type EventLogIntegrityScope = Readonly<{ lessonId: string; sessionId: string }>

export interface IndexedDbEventLogOptions {
  /**
   * Quando presente, le righe fisiche malformate o legacy ATTRIBUIBILI a un
   * altro lesson/session non degradano piu' questo scope (design ARD-06 §5.2,
   * accept #6). Il materiale non attribuibile resta conservativo: non viene
   * assegnato a uno scope arbitrario ne' usato come evidenza verificata.
   */
  scope?: EventLogIntegrityScope

  factory?: IDBFactory
  dbName?: string
  crypto?: Crypto
  trustedContext?: TrustedLegacyEventContext
}

interface CanonicalStoreContext {
  dbName: string
  crypto: Crypto
  trustedContext?: TrustedLegacyEventContext
}

async function envelopeForLegacyAppend(
  event: LessonOsEvent,
  context: CanonicalStoreContext,
): Promise<AnyEventEnvelopeV2> {
  const trusted = context.trustedContext
  const lessonId = trusted?.lessonId ?? UNASSIGNED_LESSON_ID
  const sessionId =
    trusted?.sessionId ??
    (await deterministicUuidV8(
      context.crypto,
      `ardesia:v1-adapter-unassigned-session:v1|${context.dbName}|${STORE_NAME}`,
    ))
  const identity: LegacyEnvelopeIdentity = {
    lessonId,
    sessionId,
    eventId: randomUuid(context.crypto),
    actor: trusted?.actor ?? V1_ADAPTER_ACTOR,
    producer: trusted?.producer ?? producerWithId(V1_ADAPTER_PRODUCER_ID),
    idempotencyKey: null,
  }
  const envelope = adaptLegacyLessonOsV1Append(event, identity)
  assertEventEnvelopeV2(envelope)
  assertFounderBetaAuthority(envelope)
  assertLessonOsEnvelopePayload(envelope.kind, envelope.payload)
  return envelope
}

export class IndexedDbEventLog implements EventLogStore, EnvelopeEventLogStore {
  private readonly factory: IDBFactory | undefined
  private readonly dbName: string
  private readonly crypto: Crypto
  private readonly trustedContext: TrustedLegacyEventContext | undefined
  private db: IDBDatabase | null = null
  private lastSeq = 0
  private lastReport: RecoveryReport | null = null
  private writeQueue: Promise<unknown> = Promise.resolve()

  constructor(options: IndexedDbEventLogOptions = {}) {
    this.factory = options.factory ?? (globalThis as { indexedDB?: IDBFactory }).indexedDB
    this.dbName = options.dbName ?? DB_NAME
    this.crypto = cryptoFor(options.crypto)
    this.trustedContext = options.trustedContext
  }

  get databaseName(): string {
    return this.dbName
  }

  async open(): Promise<RecoveryReport> {
    if (this.db && this.lastReport) return this.lastReport
    if (!this.factory) throw new Error("LessonOS event log: IndexedDB non disponibile in questo ambiente")
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.factory!.open(this.dbName, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        const upgrade = request.transaction!
        const store = db.objectStoreNames.contains(STORE_NAME)
          ? upgrade.objectStore(STORE_NAME)
          : db.createObjectStore(STORE_NAME, { keyPath: "seq" })
        // Migration additiva (ARD-06 §5.2): nessuno store cancellato, nessun
        // record riscritto. Le righe fisiche V1 prive di lessonId/sessionId
        // canonici non entrano nell'indice e restano materia di recovery.
        if (!store.indexNames.contains(SESSION_INDEX_NAME)) {
          store.createIndex(SESSION_INDEX_NAME, ["lessonId", "sessionId", "seq"], {
            unique: false,
          })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error("LessonOS event log: apertura IndexedDB fallita"))
    })

    const keys = await requestToPromise(
      this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAllKeys(),
    )
    const seqs = (keys as number[]).slice().sort((a, b) => a - b)
    const lastSeq = seqs.length > 0 ? seqs[seqs.length - 1]! : 0
    const contiguous = seqs.every((seq, index) => seq === index + 1)
    this.lastSeq = lastSeq
    this.lastReport = { recovered: seqs.length, lastSeq, droppedTail: 0, corrupted: !contiguous }
    return this.lastReport
  }

  async append(event: LessonOsEvent): Promise<AppendedEvent> {
    const snapshot = validateLegacyInput(event)
    const appendAdapted = async () => {
      const envelope = await envelopeForLegacyAppend(snapshot, {
        dbName: this.dbName,
        crypto: this.crypto,
        trustedContext: this.trustedContext,
      })
      return this.appendEnvelopeNow(envelope)
    }
    const run = this.writeQueue.then(appendAdapted, appendAdapted)
    this.writeQueue = run.catch(() => {})
    const result = await run
    const projected = toLegacyLessonOsEvent(result.event)
    if (!projected) throw new Error("LessonOS event log: adattamento v1 non proiettabile")
    return projected
  }

  async appendEnvelope(envelope: AnyEventEnvelopeV2): Promise<AppendEnvelopeResult> {
    assertEventEnvelopeV2(envelope)
    assertFounderBetaAuthority(envelope)
    assertLessonOsEnvelopePayload(envelope.kind, envelope.payload)
    const snapshot = structuredClone(envelope)
    assertEventEnvelopeV2(snapshot)
    assertFounderBetaAuthority(snapshot)
    assertLessonOsEnvelopePayload(snapshot.kind, snapshot.payload)
    const run = this.writeQueue.then(
      () => this.appendEnvelopeNow(snapshot),
      () => this.appendEnvelopeNow(snapshot),
    )
    this.writeQueue = run.catch(() => {})
    return run
  }

  private async appendEnvelopeNow(snapshot: AnyEventEnvelopeV2): Promise<AppendEnvelopeResult> {
    if (this.lastReport?.corrupted) {
      throw new Error("LessonOS event log: append rifiutato su log corrotto; usare export e restore")
    }
    const db = this.requireOpenDb()
    const txn = db.transaction(STORE_NAME, "readwrite")
    const done = new Promise<void>((resolve, reject) => {
      txn.oncomplete = () => resolve()
      txn.onabort = () => reject(txn.error ?? new Error("LessonOS event log: transazione abortita"))
    })
    const settled = done.then(
      () => {},
      () => {},
    )
    try {
      const store = txn.objectStore(STORE_NAME)
      const keys = await requestToPromise(store.getAllKeys())
      const physicalSeqs = keys
        .filter((key): key is number => typeof key === "number" && Number.isInteger(key) && key > 0)
        .sort((left, right) => left - right)
      if (physicalSeqs.length !== keys.length || !physicalSeqs.every((seq, index) => seq === index + 1)) {
        throw new Error("LessonOS event log: append rifiutato su log fisicamente corrotto")
      }
      const records = await requestToPromise(store.getAll())
      const storedV2 = (records as StoredEventRecord[])
        .filter((record) => hasSchemaVersion(record))
        .map((record) => splitStoredEnvelope(record).appended)
      const { retry } = scanEnvelopeIdentity(storedV2, snapshot)
      if (retry) {
        await done
        return Object.freeze({ event: retry, appended: false })
      }

      const maxSeq = keys.reduce<number>(
        (max, key) => (typeof key === "number" && Number.isFinite(key) ? Math.max(max, key) : max),
        0,
      )
      const seq = maxSeq + 1
      const record = { ...snapshot, seq } as StoredEnvelopeRecord
      await requestToPromise(store.add(record))
      await done
      this.lastSeq = seq
      const appended = deepFreeze(structuredClone(record)) as AppendedEventEnvelopeV2
      return Object.freeze({ event: appended, appended: true })
    } catch (primaryError) {
      await settled
      throw primaryError
    }
  }

  async readAllEnvelopes(): Promise<AppendedEventEnvelopeV2[]> {
    const db = this.requireOpenDb()
    const physicalSnapshot = (await requestToPromise(
      db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll(),
    )) as StoredEventRecord[]
    const ordered = physicalSnapshot.slice().sort((left, right) => left.seq - right.seq)
    const v2: AppendedEventEnvelopeV2[] = []
    const legacy: Array<{ physical: StoredLegacyEventRecord; event: AppendedEvent }> = []
    for (const record of ordered) {
      if (hasSchemaVersion(record)) {
        v2.push(splitStoredEnvelope(record).appended)
      } else {
        legacy.push({ physical: structuredClone(record) as StoredLegacyEventRecord, event: parseStoredLegacy(record) })
      }
    }
    const projected = await projectLegacyRows(legacy, this.dbName, this.crypto)
    const canonical = [...v2, ...projected].sort((left, right) => left.seq - right.seq)
    assertGlobalEnvelopeUniqueness(canonical)
    return canonical
  }

  async readEnvelopesByLesson(lessonId: string): Promise<AppendedEventEnvelopeV2[]> {
    return (await this.readAllEnvelopes()).filter((event) => event.lessonId === lessonId)
  }

  /**
   * Query esatta (lessonId, sessionId) sul solo key-range dell'indice composto
   * (ARD-06 §5.2). NON legge tutto per poi filtrare: quello non e' un oracolo
   * privacy, e' soltanto un filtro piu' lento.
   */
  async readEnvelopesBySession(lessonId: string, sessionId: string): Promise<AppendedEventEnvelopeV2[]> {
    const db = this.db
    if (!db) throw new Error("LessonOS event log: database non aperto")
    const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME)
    const range = IDBKeyRange.bound(
      [lessonId, sessionId, 0],
      [lessonId, sessionId, Number.MAX_SAFE_INTEGER],
    )
    const rows = (await requestToPromise(
      store.index(SESSION_INDEX_NAME).getAll(range) as IDBRequest<StoredEnvelopeRecord[]>,
    )) as AppendedEventEnvelopeV2[]
    return [...rows].sort((left, right) => left.seq - right.seq)
  }

  async readAll(): Promise<AppendedEvent[]> {
    const projected = (await this.readAllEnvelopes()).map(toLegacyLessonOsEvent)
    return projected.filter((event): event is AppendedEvent => event !== null)
  }

  async exportSnapshot(): Promise<Blob> {
    return exportEventLogSnapshot(this)
  }

  async exportEnvelopeSnapshot(): Promise<Blob> {
    return exportEnvelopeEventLogSnapshot(this)
  }

  async flush(): Promise<void> {}

  async importSnapshot(snapshot: Blob): Promise<RecoveryReport> {
    const db = this.requireOpenDb()
    const lines = (await snapshot.text()).split("\n").filter((line) => line.length > 0)
    const records: StoredEventRecord[] = []
    const eventIds = new Set<string>()
    const idempotencyKeys = new Set<string>()

    for (const line of lines) {
      let parsed: unknown
      try {
        parsed = JSON.parse(line)
      } catch {
        throw new Error("LessonOS event log: snapshot malformato (riga non-JSON)")
      }
      if (!isRecord(parsed)) throw new Error("LessonOS event log: snapshot malformato (riga non-oggetto)")

      if (hasSchemaVersion(parsed)) {
        const { seq, envelope, appended } = splitStoredEnvelope(parsed)
        if (eventIds.has(envelope.eventId)) {
          throw new Error("LessonOS event log: snapshot v2 con eventId duplicato")
        }
        eventIds.add(envelope.eventId)
        if (envelope.idempotencyKey !== null) {
          if (idempotencyKeys.has(envelope.idempotencyKey)) {
            throw new Error("LessonOS event log: snapshot v2 con idempotencyKey duplicata")
          }
          idempotencyKeys.add(envelope.idempotencyKey)
        }
        records.push(structuredClone({ ...envelope, seq }) as StoredEnvelopeRecord)
        void appended
        continue
      }

      const { seq, ...event } = parsed
      assertSeq(seq)
      assertEvidence(event.evidence, String(event.kind))
      if (!Number.isFinite(event.t)) {
        throw new Error(`LessonOS event log: timestamp non valido per ${String(event.kind)}`)
      }
      const legacy = structuredClone(event) as unknown as LessonOsEvent
      assertLegacyLessonOsEvent(legacy)
      records.push({
        seq,
        t: legacy.t,
        kind: legacy.kind,
        payload: JSON.stringify(legacy),
        evidence: [...legacy.evidence],
      })
    }
    if (!records.every((record, index) => record.seq === index + 1)) {
      throw new Error("LessonOS event log: snapshot corrotto (sequenza non contigua) — non si ripara")
    }

    const txn = db.transaction(STORE_NAME, "readwrite")
    const done = new Promise<void>((resolve, reject) => {
      txn.oncomplete = () => resolve()
      txn.onabort = () => reject(txn.error ?? new Error("LessonOS event log: transazione abortita"))
    })
    const settled = done.then(
      () => {},
      () => {},
    )
    try {
      const store = txn.objectStore(STORE_NAME)
      const keys = await requestToPromise(store.getAllKeys())
      if (keys.length > 0) {
        throw new Error("LessonOS event log: importSnapshot richiede un log vuoto (restore, mai merge)")
      }
      for (const record of records) await requestToPromise(store.add(record))
      await done
    } catch (primaryError) {
      await settled
      throw primaryError
    }
    this.lastSeq = records.length
    this.lastReport = {
      recovered: records.length,
      lastSeq: this.lastSeq,
      droppedTail: 0,
      corrupted: false,
    }
    return this.lastReport
  }

  async close(): Promise<void> {
    this.db?.close()
    this.db = null
    this.lastReport = null
  }

  private requireOpenDb(): IDBDatabase {
    if (!this.db) throw new Error("LessonOS event log: chiamare open() prima di usare il log persistente")
    return this.db
  }
}

class InMemoryEnvelopeEventLog extends InMemoryEventLog implements EnvelopeEventLogStore {
  private readonly canonicalEvents: AppendedEventEnvelopeV2[] = []
  private readonly context: CanonicalStoreContext
  private writeQueue: Promise<unknown> = Promise.resolve()

  constructor(options: Pick<IndexedDbEventLogOptions, "crypto" | "trustedContext" | "dbName"> = {}) {
    super()
    this.context = {
      dbName: options.dbName ?? DB_NAME,
      crypto: cryptoFor(options.crypto),
      trustedContext: options.trustedContext,
    }
  }

  override async append(event: LessonOsEvent): Promise<AppendedEvent> {
    const snapshot = validateLegacyInput(event)
    const appendAdapted = async () => {
      const envelope = await envelopeForLegacyAppend(snapshot, this.context)
      return this.appendEnvelopeNow(envelope)
    }
    const run = this.writeQueue.then(appendAdapted, appendAdapted)
    this.writeQueue = run.catch(() => {})
    const result = await run
    const projected = toLegacyLessonOsEvent(result.event)
    if (!projected) throw new Error("LessonOS event log: adattamento v1 non proiettabile")
    return projected
  }

  async appendEnvelope(envelope: AnyEventEnvelopeV2): Promise<AppendEnvelopeResult> {
    assertEventEnvelopeV2(envelope)
    assertFounderBetaAuthority(envelope)
    assertLessonOsEnvelopePayload(envelope.kind, envelope.payload)
    const snapshot = structuredClone(envelope)
    assertEventEnvelopeV2(snapshot)
    assertFounderBetaAuthority(snapshot)
    assertLessonOsEnvelopePayload(snapshot.kind, snapshot.payload)
    const run = this.writeQueue.then(
      () => this.appendEnvelopeNow(snapshot),
      () => this.appendEnvelopeNow(snapshot),
    )
    this.writeQueue = run.catch(() => {})
    return run
  }

  private appendEnvelopeNow(snapshot: AnyEventEnvelopeV2): AppendEnvelopeResult {
    const { retry } = scanEnvelopeIdentity(this.canonicalEvents, snapshot)
    if (retry) return Object.freeze({ event: retry, appended: false })
    const event = deepFreeze({ ...snapshot, seq: this.canonicalEvents.length + 1 }) as AppendedEventEnvelopeV2
    this.canonicalEvents.push(event)
    return Object.freeze({ event, appended: true })
  }

  async readAllEnvelopes(): Promise<AppendedEventEnvelopeV2[]> {
    return [...this.canonicalEvents]
  }

  async readEnvelopesByLesson(lessonId: string): Promise<AppendedEventEnvelopeV2[]> {
    return this.canonicalEvents.filter((event) => event.lessonId === lessonId)
  }

  async readEnvelopesBySession(lessonId: string, sessionId: string): Promise<AppendedEventEnvelopeV2[]> {
    return this.canonicalEvents.filter((event) => event.lessonId === lessonId && event.sessionId === sessionId)
  }

  override async readAll(): Promise<AppendedEvent[]> {
    return this.canonicalEvents.map(toLegacyLessonOsEvent).filter((event): event is AppendedEvent => event !== null)
  }
}

/** Operazione distruttiva disponibile solo dietro conferma esplicita del chiamante. */
export async function destroyEventLogStorage(
  confirm: { userConfirmed: true },
  options: IndexedDbEventLogOptions = {},
): Promise<void> {
  if (confirm?.userConfirmed !== true) {
    throw new Error("LessonOS event log: distruzione rifiutata senza conferma esplicita dell'utente")
  }
  const factory = "factory" in options ? options.factory : (globalThis as { indexedDB?: IDBFactory }).indexedDB
  if (!factory) return
  await new Promise<void>((resolve, reject) => {
    const request = factory.deleteDatabase(options.dbName ?? DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error("LessonOS event log: cancellazione fallita"))
  })
}

/** Snapshot compatibile v1 per i consumer bundle esistenti. */
export async function exportEventLogSnapshot(store: EventLogStore): Promise<Blob> {
  const events = await store.readAll()
  const lines = events.map((event) => JSON.stringify(event)).join("\n")
  return new Blob([lines.length > 0 ? `${lines}\n` : ""], { type: "application/x-ndjson" })
}

/** Snapshot canonico v2: una riga per identità fisica, seq preservato. */
export async function exportEnvelopeEventLogSnapshot(store: EnvelopeEventLogStore): Promise<Blob> {
  const events = await store.readAllEnvelopes()
  const lines = events.map((event) => JSON.stringify(event)).join("\n")
  return new Blob([lines.length > 0 ? `${lines}\n` : ""], { type: "application/x-ndjson" })
}

export async function createEventLogStore(
  options: IndexedDbEventLogOptions = {},
): Promise<EventLogStore & EnvelopeEventLogStore> {
  const factory = "factory" in options ? options.factory : (globalThis as { indexedDB?: IDBFactory }).indexedDB
  if (!factory) return new InMemoryEnvelopeEventLog(options)
  const log = new IndexedDbEventLog({ ...options, factory })
  try {
    await log.open()
    return log
  } catch {
    return new InMemoryEnvelopeEventLog(options)
  }
}

/**
 * BETA-003 accept #2: descrittore tipato del backend reale, senza fallback
 * silenzioso. Nessuna promozione ottimistica di uno stato in-memory a
 * verified-indexeddb: verified indica lettura di byte fisici IndexedDB
 * verificati; unavailable/data-loss/corrupt restano stati distinti. Il
 * ramo data-loss e' popolato quando la storage contiene righe legacy prive
 * di identita' canonica (l'adattatore le proietta con UNASSIGNED_LESSON_ID)
 * o quando la recovery ha droppato la coda del log; un database recovery-only
 * non deve mai apparire come verified-empty (accept #4).
 */
export type IndexedDbBackendDescriptor =
  | Readonly<{ kind: "verified-indexeddb"; database: string }>
  | Readonly<{ kind: "unavailable"; code: string }>
  | Readonly<{ kind: "data-loss"; code: string; database: string }>
  | Readonly<{ kind: "corrupt"; code: string }>

/**
 * Descrittore backend + istanza IndexedDbEventLog aperta (o null quando il
 * backend non e' consultabile). Il chiamante deve `close()` la handle quando
 * fresca alla propria richiesta: il loader Continuity apre un adapter nuovo
 * ad ogni chiamata (design §5.2) e lo chiude a fine snapshot.
 */
export interface IndexedDbEventLogHandle {
  readonly backend: IndexedDbBackendDescriptor
  readonly log: IndexedDbEventLog | null
  close(): Promise<void>
}

/**
 * Ispeziona le righe fisiche del log e le classifica: legacy (nessuno
 * schemaVersion), canonical (V2 valido), o malformed (schemaVersion presente
 * ma envelope non conforme allo schema o non indicizzabile). Le righe
 * malformate non compaiono nell'indice composto lesson+session+seq, quindi
 * la query scoped restituirebbe 0 righe con backend "verified": e' il
 * classico verified-empty falso. Il descrittore backend viene quindi
 * marcato data-loss/malformed-v2-rows cosi' il loader Continuity lo
 * degrada esplicitamente (design §3.3 / §12 RED-06-03).
 */
/**
 * Una riga e' ATTRIBUIBILE quando porta lessonId e sessionId leggibili, anche
 * se il resto dell'envelope non e' canonico. Solo allora si puo' dire a quale
 * scope appartiene un guasto: senza questi campi la riga resta materiale non
 * attribuibile, e la clausola 6 vieta di assegnarla a uno scope arbitrario.
 */
function attributableScope(record: unknown): { lessonId: string; sessionId: string } | null {
  if (!isRecord(record)) return null
  const lessonId = record.lessonId
  const sessionId = record.sessionId
  if (typeof lessonId !== "string" || lessonId.length === 0) return null
  if (typeof sessionId !== "string" || sessionId.length === 0) return null
  return { lessonId, sessionId }
}

async function inspectPhysicalRows(
  log: IndexedDbEventLog,
  scope?: EventLogIntegrityScope,
): Promise<{
  legacyCount: number
  malformedCount: number
}> {
  const internal = log as unknown as { db: IDBDatabase | null }
  const db = internal.db
  if (db === null) return { legacyCount: 0, malformedCount: 0 }
  const rows = (await requestToPromise(
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll(),
  )) as StoredEventRecord[]
  let legacyCount = 0
  let malformedCount = 0
  for (const record of rows) {
    // Un guasto che appartiene dimostrabilmente a un altro lesson/session non
    // e' evidenza sull'integrita' dello scope richiesto. Le righe senza scope
    // leggibile non vengono saltate: restano conservative.
    if (scope !== undefined) {
      const owner = attributableScope(record)
      if (owner !== null && (owner.lessonId !== scope.lessonId || owner.sessionId !== scope.sessionId)) {
        continue
      }
    }
    if (!hasSchemaVersion(record)) {
      legacyCount += 1
      continue
    }
    try {
      splitStoredEnvelope(record)
    } catch {
      malformedCount += 1
    }
  }
  return { legacyCount, malformedCount }
}

export async function openIndexedDbEventLog(
  options: IndexedDbEventLogOptions = {},
): Promise<IndexedDbEventLogHandle> {
  const factory = "factory" in options
    ? options.factory
    : (globalThis as { indexedDB?: IDBFactory }).indexedDB
  if (!factory) {
    return Object.freeze({
      backend: Object.freeze({ kind: "unavailable" as const, code: "indexeddb-unavailable" }),
      log: null,
      async close() {},
    })
  }
  const log = new IndexedDbEventLog({ ...options, factory })
  let report: RecoveryReport
  try {
    report = await log.open()
  } catch {
    // Chiusura difensiva: open() puo' aver lasciato un db half-open.
    try { await log.close() } catch { /* best effort */ }
    return Object.freeze({
      backend: Object.freeze({ kind: "unavailable" as const, code: "indexeddb-open-failed" }),
      log: null,
      async close() {},
    })
  }
  if (report.corrupted) {
    return Object.freeze({
      backend: Object.freeze({ kind: "corrupt" as const, code: "sequence-non-contiguous" }),
      log,
      close: () => log.close(),
    })
  }
  if (report.droppedTail > 0) {
    return Object.freeze({
      backend: Object.freeze({
        kind: "data-loss" as const,
        code: "recovery-dropped-tail",
        database: log.databaseName,
      }),
      log,
      close: () => log.close(),
    })
  }
  let inspection: { legacyCount: number; malformedCount: number }
  try {
    inspection = await inspectPhysicalRows(log, options.scope)
  } catch {
    try { await log.close() } catch { /* best effort */ }
    return Object.freeze({
      backend: Object.freeze({ kind: "unavailable" as const, code: "indexeddb-inspect-failed" }),
      log: null,
      async close() {},
    })
  }
  // Righe V2 malformate: schemaVersion presente ma envelope non canonico ⇒
  // fuori dall'indice scoped, quindi la query per (lesson,session) tornerebbe
  // 0 righe con backend "verified". Prevenire il verified-empty falso
  // classificando il backend come data-loss.
  if (inspection.malformedCount > 0) {
    return Object.freeze({
      backend: Object.freeze({
        kind: "data-loss" as const,
        code: "malformed-v2-rows",
        database: log.databaseName,
      }),
      log,
      close: () => log.close(),
    })
  }
  if (inspection.legacyCount > 0) {
    return Object.freeze({
      backend: Object.freeze({
        kind: "data-loss" as const,
        code: "legacy-physical-rows",
        database: log.databaseName,
      }),
      log,
      close: () => log.close(),
    })
  }
  return Object.freeze({
    backend: Object.freeze({
      kind: "verified-indexeddb" as const,
      database: log.databaseName,
    }),
    log,
    close: () => log.close(),
  })
}
