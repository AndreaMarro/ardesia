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

import type {
  AnyEventEnvelopeV2,
  AppendEnvelopeResult,
  EnvelopeEventLogStore,
  EventLogStore,
  LessonOsEvent,
} from "./eventlog"
import {
  IndexedDbEventLog,
  createEventLogStore,
  type IndexedDbEventLogOptions,
} from "./indexedDbEventLog"
import {
  createEventEnvelopeV2,
  studioProducerIdentity,
  type EventActor,
  type EventEvidence,
  type JsonObject,
  type ProducerIdentity,
} from "../core/contracts/eventEnvelope"
import { validateRoomId } from "../store/roomPaths"
import {
  runStoragePreflight,
  type StorageCapabilitySnapshot,
  type StoragePreflightEnv,
} from "./storagePreflight"

/** Prefisso del marker "un event-log con contenuto esiste" (telemetria §4.4). */
export const EVENTLOG_EXPECTED_KEY = "lessonos:eventlog-expected"

/**
 * Chiave del marker scopata sul database fisico: un marker per-DB, non per-origin.
 * Evita che il segnale di una lezione/DB diverso venga interpretato come perdita
 * di un altro DB sullo stesso origin.
 */
export function eventLogMarkerKey(dbName: string): string {
  return `${EVENTLOG_EXPECTED_KEY}:${dbName}`
}

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
   * true = lo store realmente in uso persiste su disco (IndexedDbEventLog).
   * false = fallback InMemory (la lezione vive solo in RAM): l'advice UX deve
   * dire "da esportare" anche se l'API IndexedDB era presente ma open() è fallita.
   */
  persistent: boolean
  /**
   * true = alla riapertura il log atteso non c'era (eviction avvenuta, §4.4).
   * Il chiamante DEVE renderlo visibile al docente, mai silenzioso.
   */
  dataLoss: boolean
  /** true = open() ha trovato una sequenza bucata (§5 inv. 5): proporre restore da export. */
  corrupted: boolean
}

export type LessonOsFactKind = Exclude<
  LessonOsEvent["kind"],
  "lesson.started" | "lesson.ended"
>

export type LessonPayload<K extends LessonOsFactKind> = Omit<
  Extract<LessonOsEvent, { kind: K }>,
  "kind" | "t" | "evidence"
> & JsonObject

export type FactMeta = Readonly<{
  evidence: readonly EventEvidence[]
  causationId?: string | null
  idempotencyKey?: string | null
}>

export interface OpenLessonOsSessionOptions {
  room: string
  actor?: Extract<EventActor, { type: "teacher" }>
  now?: () => number
  newSessionId?: () => string
  newEventId?: () => string
  env?: LessonOsBootstrapEnv
}

export interface LessonOsSessionHandle extends LessonOsRuntime {
  store: EnvelopeEventLogStore
  identity: Readonly<{
    lessonId: string
    sessionId: string
    actor: EventActor
  }>
  producer: ProducerIdentity
  appendFact<K extends LessonOsFactKind>(
    kind: K,
    payload: LessonPayload<K>,
    meta: FactMeta,
  ): Promise<AppendEnvelopeResult>
  close(): Promise<AppendEnvelopeResult>
}

export type LessonOsSessionOpener = (
  options: OpenLessonOsSessionOptions,
) => Promise<LessonOsSessionHandle>

export const DEFAULT_LESSON_ACTOR = Object.freeze({
  type: "teacher" as const,
  id: "founder-beta-teacher",
})

const FACTUAL_KINDS = new Set<LessonOsFactKind>([
  "concept.introduced",
  "material.cited",
  "error.observed",
  "exercise.completed",
  "simulation.step.completed",
  "simulation.circuit.solved",
  "simulation.error.observed",
  "plugin.mounted",
  "quiz.attempted",
  "studentpack.generated",
  "studentpack.exported",
])

const FACT_META_KEYS = new Set(["evidence", "causationId", "idempotencyKey"])

function canonicalRandomUuid(): string {
  const crypto = (globalThis as { crypto?: Crypto }).crypto
  if (!crypto) throw new Error("LessonOS session: Web Crypto non disponibile")
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID().toLowerCase()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function frozenTeacherActor(
  actor: OpenLessonOsSessionOptions["actor"],
): Extract<EventActor, { type: "teacher" }> {
  const snapshot = structuredClone(actor ?? DEFAULT_LESSON_ACTOR) as EventActor
  if (snapshot.type !== "teacher") {
    throw new Error("LessonOS session: actor must be teacher")
  }
  return Object.freeze(snapshot)
}

function assertFactMetaHasNoAuthorityOverrides(meta: FactMeta): void {
  for (const key of Reflect.ownKeys(meta)) {
    if (typeof key !== "string" || !FACT_META_KEYS.has(key)) {
      throw new Error(`LessonOS session: trusted context override rifiutato (${String(key)})`)
    }
  }
}

function closePhysicalStore(store: EnvelopeEventLogStore): Promise<void> {
  const candidate = store as EnvelopeEventLogStore & { close?: () => Promise<void> }
  return typeof candidate.close === "function" ? candidate.close() : Promise.resolve()
}

function resolveMarkerStorage(env: LessonOsBootstrapEnv): MarkerStorageLike | undefined {
  if ("markerStorage" in env) return env.markerStorage
  try {
    return (globalThis as { localStorage?: MarkerStorageLike }).localStorage
  } catch {
    return undefined
  }
}

/** Mai throwing: ogni degrado (no IndexedDB, open fallita, marker illeggibile) è assorbito. */
async function bootstrapLessonOsWithStoreOptions(
  env: LessonOsBootstrapEnv = {},
  storeOptions: IndexedDbEventLogOptions = {},
): Promise<LessonOsRuntime & { store: EnvelopeEventLogStore }> {
  const [store, capabilities] = await Promise.all([
    createEventLogStore({
      ...storeOptions,
      ...("indexedDB" in env ? { factory: env.indexedDB } : {}),
    }),
    runStoragePreflight(env),
  ])

  // Telemetria di perdita (§4.4) — solo sul backend persistente: sul fallback
  // InMemory il log è SEMPRE vuoto all'avvio e il marker non è giudicabile.
  const persistent = store instanceof IndexedDbEventLog
  let dataLoss = false
  let corrupted = false
  if (store instanceof IndexedDbEventLog) {
    // open() è idempotente: qui ritorna il RecoveryReport già calcolato.
    const report = await store.open()
    corrupted = report.corrupted
    const marker = resolveMarkerStorage(env)
    const key = eventLogMarkerKey(store.databaseName)
    // Lettura del marker in un try SEPARATO dalla scrittura: se getItem lancia
    // (es. accesso a storage negato), la telemetria degrada senza confondere il
    // caso "letto false" con un errore di scrittura successivo.
    let expected = false
    try {
      expected = Boolean(marker?.getItem(key))
    } catch {
      expected = false
    }
    try {
      if (report.recovered > 0) {
        marker?.setItem(key, "1")
      } else if (expected) {
        dataLoss = true
        marker?.removeItem(key)
      }
    } catch {
      // marker non scrivibile (private mode): best-effort, mai bloccante
    }
  }

  return { store, capabilities, persistent, dataLoss, corrupted }
}

/** Compatibility entry point for non-session consumers. */
export async function bootstrapLessonOs(
  env: LessonOsBootstrapEnv = {},
): Promise<LessonOsRuntime> {
  return bootstrapLessonOsWithStoreOptions(env)
}

/**
 * Opens one fresh, room-bound Founder Beta session. Room validation happens
 * before UUID generation and before every IndexedDB/preflight/marker access.
 */
export async function openLessonOsSession(
  options: OpenLessonOsSessionOptions,
): Promise<LessonOsSessionHandle> {
  const lessonId = validateRoomId(options.room)
  const now = options.now ?? Date.now
  const newSessionId = options.newSessionId ?? canonicalRandomUuid
  const newEventId = options.newEventId ?? canonicalRandomUuid
  const sessionId = newSessionId()
  const actor = frozenTeacherActor(options.actor)
  const producer = studioProducerIdentity()
  const identity = Object.freeze({ lessonId, sessionId, actor })

  const lifecycleEnvelope = (
    kind: "lesson.started" | "lesson.ended",
    suffix: "started" | "ended",
  ): AnyEventEnvelopeV2 => {
    const occurredAt = now()
    return createEventEnvelopeV2(
      {
        lessonId,
        sessionId,
        kind,
        actor,
        producer,
        causationId: null,
        idempotencyKey: `session:${sessionId}:${suffix}`,
        evidence: [{ ref: `lesson:${lessonId}@${occurredAt}`, resolution: "verified" }],
        payload: { room: lessonId },
      },
      { eventId: newEventId, now: () => new Date(occurredAt) },
    )
  }

  // Assemble and validate the start envelope before storage/preflight I/O.
  const started = lifecycleEnvelope("lesson.started", "started")
  const runtime = await bootstrapLessonOsWithStoreOptions(options.env, {
    trustedContext: { lessonId, sessionId, actor, producer },
  })
  try {
    const startResult = await runtime.store.appendEnvelope(started)
    if (!startResult.appended) {
      throw new Error("LessonOS session: fresh session collision; start already exists")
    }
  } catch (error) {
    try {
      await closePhysicalStore(runtime.store)
    } catch (closeError) {
      throw new AggregateError([error, closeError], "LessonOS session: start e cleanup falliti")
    }
    throw error
  }

  let closing = false
  let closed = false
  let ended: AnyEventEnvelopeV2 | null = null
  let endedResult: AppendEnvelopeResult | null = null
  let closeAttempt: Promise<AppendEnvelopeResult> | null = null

  const handle: LessonOsSessionHandle = {
    ...runtime,
    identity,
    producer,
    async appendFact<K extends LessonOsFactKind>(
      kind: K,
      payload: LessonPayload<K>,
      meta: FactMeta,
    ): Promise<AppendEnvelopeResult> {
      if (closing || closed) throw new Error("LessonOS session: closing/closed; appendFact rifiutato")
      if (!FACTUAL_KINDS.has(kind)) {
        throw new Error(`LessonOS session: kind lifecycle/non-factual rifiutato (${String(kind)})`)
      }
      assertFactMetaHasNoAuthorityOverrides(meta)
      const envelope = createEventEnvelopeV2(
        {
          lessonId,
          sessionId,
          kind,
          actor,
          producer,
          causationId: meta.causationId ?? null,
          idempotencyKey: meta.idempotencyKey ?? null,
          evidence: meta.evidence,
          payload,
        },
        { eventId: newEventId, now: () => new Date(now()) },
      )
      return runtime.store.appendEnvelope(envelope)
    },
    close(): Promise<AppendEnvelopeResult> {
      closing = true
      if (closed && endedResult) return Promise.resolve(endedResult)
      if (closeAttempt) return closeAttempt

      const attempt = (async () => {
        ended ??= lifecycleEnvelope("lesson.ended", "ended")
        endedResult ??= await runtime.store.appendEnvelope(ended!)
        await closePhysicalStore(runtime.store)
        closed = true
        return endedResult
      })()
      closeAttempt = attempt.then(
        (result) => result,
        (error) => {
          closeAttempt = null
          throw error
        },
      )
      return closeAttempt
    },
  }
  return handle
}
