// LessonOS — event log append-only (micro-slice, da LESSONOS-MEMORY-ARCHITECTURE-RESEARCH).
// L'event log è l'UNICA fonte di verità della memoria didattica: il grafo è una
// vista materializzata (materializer.ts), sempre riderivabile da zero. AgentMemory
// resta una cache di recall, mai sorgente. Nessun graph-DB esterno.
//
// Vincoli di questa slice: zero LLM, zero MCP, zero dipendenze nuove. Lo schema
// SQLite sotto è il contratto di persistenza; il binding runtime (WASM lato client
// o nativo) è una decisione separata — qui c'è un'implementazione in-memory di
// riferimento con la stessa disciplina, usata dai test e dal materializer.

import type {
  EventActor,
  EventEnvelopeV2,
  JsonObject,
  ProducerIdentity,
} from "../core/contracts/eventEnvelope"

/**
 * Riferimento di evidenza: ogni nodo/arco del grafo DEVE citare da dove viene
 * (canone `provenance`). Formato `namespace:payload`, es.:
 *   "board:<elementId>" | "manual:vol1:p30" | "lesson:<room>@<t>" | "plugin:<id>@<version>"
 */
export type EvidenceRef = string

const EVIDENCE_RE = /^[a-z][a-z0-9-]*:.+$/

export function isValidEvidenceRef(ref: unknown): ref is EvidenceRef {
  return typeof ref === "string" && EVIDENCE_RE.test(ref)
}

/** Lancia se la lista evidenze è vuota o contiene ref malformati: nessun fatto senza provenienza. */
export function assertEvidence(refs: unknown, context: string): asserts refs is EvidenceRef[] {
  if (!Array.isArray(refs) || refs.length === 0) {
    throw new Error(`LessonOS event log: evidence obbligatoria mancante (${context})`)
  }
  for (const ref of refs) {
    if (!isValidEvidenceRef(ref)) {
      throw new Error(`LessonOS event log: evidence ref malformata "${String(ref)}" (${context}); atteso "namespace:payload"`)
    }
  }
}

/** Label multilingua: concept_id neutro + label per lingua (requisito strutturale, non traduzione finale). */
export type Labels = Record<string, string>

interface BaseEvent {
  /** Timestamp evento (ms epoch), fornito dal chiamante: il log non inventa tempi. */
  t: number
  evidence: EvidenceRef[]
}

export type LessonOsEvent =
  | (BaseEvent & { kind: "lesson.started"; room: string })
  | (BaseEvent & { kind: "lesson.ended"; room: string })
  | (BaseEvent & { kind: "concept.introduced"; conceptId: string; labels: Labels })
  | (BaseEvent & { kind: "material.cited"; materialId: string; conceptId?: string; labels: Labels })
  | (BaseEvent & {
      kind: "error.observed"
      errorId: string
      conceptId: string
      /** Studente a cui l'errore è attribuito; assente = non attribuito (lezione di classe). */
      studentId?: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "exercise.completed"
      exerciseId: string
      conceptId?: string
      /** Se presente: questo esercizio corregge l'errore osservato (arco `corregge`). */
      correctsErrorId?: string
      /** Studente che ha completato; assente = non attribuito. */
      studentId?: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "simulation.step.completed"
      stepId: string
      sceneId?: string
      experimentId?: string
      conceptId?: string
      labels: Labels
    })
  | (BaseEvent & {
      /** Il solve reale ha prodotto un risultato per l'esperimento (telemetria break→explain). */
      kind: "simulation.circuit.solved"
      experimentId: string
      sceneId?: string
      conceptId?: string
      /** Corrente misurata dal solve in mA (es. 15.3): payload per provenance/product-factory. */
      currentMa?: number
      /** Il circuito risolto è conforme al book-layout del volume (parità). */
      bookLayoutValid?: boolean
      labels: Labels
    })
  | (BaseEvent & {
      /** Errore elettrico osservato dal solver (filo scollegato, LED invertito, R mancante/pericolosa). */
      kind: "simulation.error.observed"
      errorId: string
      conceptId: string
      sceneId?: string
      experimentId?: string
      studentId?: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "plugin.mounted"
      pluginId: string
      pluginKind: string
      instanceId: string
      room?: string
      labels: Labels
    })
  | (BaseEvent & {
      /** Tentativo quiz per-studente: fatto registrato; ogni vista (media, debito) è derivata. */
      kind: "quiz.attempted"
      quizId: string
      conceptId?: string
      studentId?: string
      correct: number
      total: number
      labels: Labels
    })
  | (BaseEvent & {
      /**
       * Uno student-pack è stato generato da un candidato Z7 (errore osservato mai
       * corretto). Fatto append-only: il projector lifta lo status del candidato
       * da "candidate" a "generated". packId = candidateId (`sp-<errorId>`).
       */
      kind: "studentpack.generated"
      packId: string
      errorId: string
      /** Room della lezione da cui nasce il pack; assente = candidato orfano. */
      fromRoom?: string
    })
  | (BaseEvent & {
      /** Uno student-pack generato è stato esportato: lift "generated" → "exported". */
      kind: "studentpack.exported"
      packId: string
    })

/** Nome esplicito del contratto storico, mantenendo LessonOsEvent compatibile. */
export type LegacyLessonOsEventV1 = LessonOsEvent

type LessonOsPayloadV2<K extends LessonOsEvent["kind"]> = Omit<
  Extract<LessonOsEvent, { kind: K }>,
  "kind" | "t" | "evidence"
> &
  JsonObject

/** Union fattuale v2: ogni kind LessonOS conserva soltanto il payload corrispondente. */
export type LessonOsEnvelopeV2 = {
  [K in LessonOsEvent["kind"]]: EventEnvelopeV2<K, LessonOsPayloadV2<K>>
}[LessonOsEvent["kind"]]

export type AnyEventEnvelopeV2 = EventEnvelopeV2<string, JsonObject>

/** Envelope canonico accodato; seq è identità fisica, non parte dello schema v2. */
export type AppendedEventEnvelopeV2 = Readonly<AnyEventEnvelopeV2 & { readonly seq: number }>

export type AppendEnvelopeResult = Readonly<{
  event: AppendedEventEnvelopeV2
  appended: boolean
}>

export type EnvelopeQuery = Readonly<{
  lessonId: string
  sessionId?: string
}>

export interface EnvelopeEventLogStore extends EventLogStore {
  appendEnvelope(envelope: AnyEventEnvelopeV2): Promise<AppendEnvelopeResult>
  readAllEnvelopes(): Promise<AppendedEventEnvelopeV2[]>
  readEnvelopesByLesson(lessonId: string): Promise<AppendedEventEnvelopeV2[]>
  readEnvelopesBySession(lessonId: string, sessionId: string): Promise<AppendedEventEnvelopeV2[]>
}

export const UNASSIGNED_LESSON_ID = "unassigned"

export interface LegacyEnvelopeIdentity {
  lessonId: string
  sessionId: string
  eventId: string
  actor: EventActor
  producer: ProducerIdentity
  idempotencyKey: string | null
}

function legacyOccurredAt(t: number): string {
  const date = new Date(t)
  if (!Number.isFinite(t) || !Number.isFinite(date.getTime())) {
    throw new Error("LessonOS event log: timestamp legacy fuori dal range ISO-8601")
  }
  return date.toISOString()
}

function legacyPayload(event: LessonOsEvent): JsonObject {
  const snapshot = structuredClone(event) as LessonOsEvent
  const mutable = snapshot as unknown as Record<string, unknown>
  delete mutable.kind
  delete mutable.t
  delete mutable.evidence
  return mutable as JsonObject
}

/** Adatta un nuovo append v1 usando esclusivamente identità già fidate dal backend. */
export function adaptLegacyLessonOsV1Append(
  event: LegacyLessonOsEventV1,
  identity: LegacyEnvelopeIdentity,
): AnyEventEnvelopeV2 {
  return {
    schemaVersion: 2,
    eventId: identity.eventId,
    lessonId: identity.lessonId,
    sessionId: identity.sessionId,
    kind: event.kind,
    occurredAt: legacyOccurredAt(event.t),
    actor: structuredClone(identity.actor),
    producer: structuredClone(identity.producer),
    causationId: null,
    idempotencyKey: identity.idempotencyKey,
    evidence: event.evidence.map((ref) => ({ ref, resolution: "missing" as const })),
    payload: legacyPayload(event),
  }
}

/** Adatta una riga fisica v1 senza riscriverla; seq e identità derivata sono espliciti. */
export function adaptLegacyLessonOsV1Log(
  event: AppendedEvent,
  identity: LegacyEnvelopeIdentity,
): AppendedEventEnvelopeV2 {
  const { seq, ...legacy } = event
  return Object.freeze({ ...adaptLegacyLessonOsV1Append(legacy, identity), seq })
}

type LegacyPayloadField = "string" | "number" | "boolean" | "labels"
type LegacyPayloadRule = Readonly<{
  required: Readonly<Record<string, LegacyPayloadField>>
  optional?: Readonly<Record<string, LegacyPayloadField>>
}>

const LESSON_OS_PAYLOAD_RULES: Record<LessonOsEvent["kind"], LegacyPayloadRule> = {
  "lesson.started": { required: { room: "string" } },
  "lesson.ended": { required: { room: "string" } },
  "concept.introduced": { required: { conceptId: "string", labels: "labels" } },
  "material.cited": {
    required: { materialId: "string", labels: "labels" },
    optional: { conceptId: "string" },
  },
  "error.observed": {
    required: { errorId: "string", conceptId: "string", labels: "labels" },
    optional: { studentId: "string" },
  },
  "exercise.completed": {
    required: { exerciseId: "string", labels: "labels" },
    optional: { conceptId: "string", correctsErrorId: "string", studentId: "string" },
  },
  "simulation.step.completed": {
    required: { stepId: "string", labels: "labels" },
    optional: { sceneId: "string", experimentId: "string", conceptId: "string" },
  },
  "simulation.circuit.solved": {
    required: { experimentId: "string", labels: "labels" },
    optional: {
      sceneId: "string",
      conceptId: "string",
      currentMa: "number",
      bookLayoutValid: "boolean",
    },
  },
  "simulation.error.observed": {
    required: { errorId: "string", conceptId: "string", labels: "labels" },
    optional: { sceneId: "string", experimentId: "string", studentId: "string" },
  },
  "plugin.mounted": {
    required: { pluginId: "string", pluginKind: "string", instanceId: "string", labels: "labels" },
    optional: { room: "string" },
  },
  "quiz.attempted": {
    required: { quizId: "string", correct: "number", total: "number", labels: "labels" },
    optional: { conceptId: "string", studentId: "string" },
  },
  "studentpack.generated": {
    required: { packId: "string", errorId: "string" },
    optional: { fromRoom: "string" },
  },
  "studentpack.exported": { required: { packId: "string" } },
}

const FACTUAL_KINDS = new Set<LessonOsEvent["kind"]>(
  Object.keys(LESSON_OS_PAYLOAD_RULES) as LessonOsEvent["kind"][],
)

/**
 * I kind il cui payload PORTA un certo campo, derivati dalle regole.
 *
 * Esiste per non elencare a mano un insieme che le regole gia' contengono.
 * `LESSON_OS_PAYLOAD_RULES` e' un `Record` sull'unione dei kind: aggiungerne uno
 * OBBLIGA a scrivere la sua regola, quindi un kind nuovo che porta `room` entra
 * qui da solo. Un elenco scritto a mano altrove avrebbe smesso di coprirlo **in
 * silenzio**, ed e' la classe di difetto che questo progetto paga piu' spesso:
 * il referente si deriva dall'oggetto, non si ricorda.
 *
 * Il confronto e' sulla CHIAVE esatta: `studentpack.generated` porta `fromRoom`,
 * che non e' `room` e non deve entrare nello scope-check della stanza.
 */
export function kindsBearingPayloadField(
  rules: Readonly<
    Record<string, { required: Readonly<Record<string, unknown>>; optional?: Readonly<Record<string, unknown>> }>
  >,
  field: string,
): Set<string> {
  const bearing = new Set<string>()
  for (const [kind, rule] of Object.entries(rules)) {
    const inRequired = Object.prototype.hasOwnProperty.call(rule.required, field)
    const inOptional =
      rule.optional !== undefined && Object.prototype.hasOwnProperty.call(rule.optional, field)
    if (inRequired || inOptional) bearing.add(kind)
  }
  return bearing
}

/** Derivato una volta sola: i kind il cui payload porta `room`. */
export const ROOM_BEARING_KINDS: ReadonlySet<string> = kindsBearingPayloadField(
  LESSON_OS_PAYLOAD_RULES,
  "room",
)

/**
 * Tutti i kind LessonOS, a RUNTIME, derivati dalle stesse regole da cui li
 * deriva il tipo. Serve a chi deve filtrarli (p.es. i soli kind fattuali):
 * un `new Set<Union>([...])` scritto a mano **type-checka anche se dimentica un
 * membro**, quindi il tipo non protegge dall'omissione. Questo elenco si.
 */
export const ALL_LESSON_OS_KINDS: readonly LessonOsEvent["kind"][] = Object.freeze(
  Object.keys(LESSON_OS_PAYLOAD_RULES) as LessonOsEvent["kind"][],
)

function assertLegacyPayloadField(value: unknown, expected: LegacyPayloadField, context: string): void {
  if (expected === "string" && typeof value === "string") return
  if (expected === "number" && typeof value === "number" && Number.isFinite(value)) return
  if (expected === "boolean" && typeof value === "boolean") return
  if (
    expected === "labels" &&
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.values(value).every((label) => typeof label === "string")
  ) {
    return
  }
  throw new Error(`LessonOS event log: payload ${context} deve essere ${expected}`)
}

/** I kind fattuali hanno un payload runtime strict; kind advisory/unknown restano generici. */
export function assertLessonOsEnvelopePayload(kind: string, payload: JsonObject): void {
  if (!FACTUAL_KINDS.has(kind as LessonOsEvent["kind"])) return
  const factualKind = kind as LessonOsEvent["kind"]
  const rule = LESSON_OS_PAYLOAD_RULES[factualKind]
  const allowed = new Set([...Object.keys(rule.required), ...Object.keys(rule.optional ?? {})])
  const unknown = Object.keys(payload).find((key) => !allowed.has(key))
  if (unknown) throw new Error(`LessonOS event log: payload ${factualKind} contiene chiave unknown "${unknown}"`)
  for (const [key, expected] of Object.entries(rule.required)) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) {
      throw new Error(`LessonOS event log: payload ${factualKind}.${key} mancante`)
    }
    assertLegacyPayloadField(payload[key], expected, `${factualKind}.${key}`)
  }
  for (const [key, expected] of Object.entries(rule.optional ?? {})) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      assertLegacyPayloadField(payload[key], expected, `${factualKind}.${key}`)
    }
  }
}

export function assertLegacyLessonOsEvent(value: unknown): asserts value is LessonOsEvent {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("LessonOS event log: evento legacy deve essere un oggetto")
  }
  const event = value as Record<string, unknown>
  if (typeof event.kind !== "string" || !FACTUAL_KINDS.has(event.kind as LessonOsEvent["kind"])) {
    throw new Error(`LessonOS event log: kind legacy sconosciuto "${String(event.kind)}"`)
  }
  assertEvidence(event.evidence, event.kind)
  if (!Number.isFinite(event.t)) {
    throw new Error(`LessonOS event log: timestamp non valido per ${event.kind}`)
  }
  legacyOccurredAt(event.t as number)
  const payload = structuredClone(event)
  delete payload.kind
  delete payload.t
  delete payload.evidence
  assertLessonOsEnvelopePayload(event.kind, payload as JsonObject)
}

function exactLegacyPayload(kind: LessonOsEvent["kind"], payload: JsonObject): Record<string, unknown> {
  assertLessonOsEnvelopePayload(kind, payload)
  const rule = LESSON_OS_PAYLOAD_RULES[kind]
  const exact: Record<string, unknown> = {}
  for (const key of [...Object.keys(rule.required), ...Object.keys(rule.optional ?? {})]) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) exact[key] = structuredClone(payload[key])
  }
  return exact
}

/** Proiezione compatibile: advisory/unknown non diventano mai fatti LessonOS v1. */
export function toLegacyLessonOsEvent(event: AppendedEventEnvelopeV2): AppendedEvent | null {
  if (!FACTUAL_KINDS.has(event.kind as LessonOsEvent["kind"])) return null
  const kind = event.kind as LessonOsEvent["kind"]
  const t = new Date(event.occurredAt).getTime()
  const projected = {
    ...exactLegacyPayload(kind, event.payload),
    kind,
    t,
    evidence: event.evidence.map((item) => item.ref),
    seq: event.seq,
  } as AppendedEvent
  assertEvidence(projected.evidence, projected.kind)
  if (!Number.isFinite(projected.t)) {
    throw new Error(`LessonOS event log: timestamp non valido per ${projected.kind}`)
  }
  return Object.freeze(projected)
}

/** Evento accettato dal log: immutabile, con numero di sequenza monotono. */
export type AppendedEvent = LessonOsEvent & { readonly seq: number }

/**
 * Schema SQLite del log (contratto di persistenza).
 * Disciplina append-only: SOLO INSERT; niente UPDATE/DELETE; la compaction
 * (futura, non decisa) avviene per copia su nuova tabella + swap, mai in-place.
 */
export const EVENT_LOG_DDL = `
CREATE TABLE IF NOT EXISTS lessonos_events (
  seq      INTEGER PRIMARY KEY AUTOINCREMENT,
  t        INTEGER NOT NULL,
  kind     TEXT    NOT NULL,
  payload  TEXT    NOT NULL, -- JSON dell'evento completo (fonte per il materializer)
  evidence TEXT    NOT NULL  -- JSON array di EvidenceRef, mai vuoto (validato in append)
);
CREATE INDEX IF NOT EXISTS idx_lessonos_events_kind ON lessonos_events (kind);
CREATE INDEX IF NOT EXISTS idx_lessonos_events_t    ON lessonos_events (t);
`

/** Porta del log: qualunque backend (SQLite, in-memory) deve rispettarla. */
export interface EventLogStore {
  /** Valida l'evidenza, assegna `seq` e accoda. Rifiuta eventi senza provenienza. */
  append(event: LessonOsEvent): Promise<AppendedEvent>
  /** Tutti gli eventi in ordine di `seq` (l'ordine del log è l'ordine della verità). */
  readAll(): Promise<AppendedEvent[]>
}

/** Implementazione di riferimento in-memory: stessa disciplina dello schema SQLite. */
export class InMemoryEventLog implements EventLogStore {
  private events: AppendedEvent[] = []
  private nextSeq = 1

  async append(event: LessonOsEvent): Promise<AppendedEvent> {
    assertEvidence(event.evidence, event.kind)
    if (!Number.isFinite(event.t)) {
      throw new Error(`LessonOS event log: timestamp non valido per ${event.kind}`)
    }
    const appended: AppendedEvent = Object.freeze({ ...structuredClone(event), seq: this.nextSeq++ })
    this.events.push(appended)
    return appended
  }

  async readAll(): Promise<AppendedEvent[]> {
    return [...this.events]
  }
}
