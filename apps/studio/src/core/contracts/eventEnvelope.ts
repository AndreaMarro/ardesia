import { isValidEvidenceRef } from "../../lessonos/eventlog"
import { validateRoomId } from "../../store/roomPaths"

export const EVENT_ENVELOPE_SCHEMA_VERSION = 2 as const

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[]
export type JsonObject = { readonly [key: string]: JsonValue }

export type EventActor =
  | Readonly<{ type: "teacher"; id: string }>
  | Readonly<{ type: "system"; id: string }>
  | Readonly<{ type: "plugin"; id: string }>

export type ProducerIdentity = Readonly<{
  id: string
  version: string
  commitSha: string
}>

export type EventEvidence = Readonly<{
  ref: string
  resolution: "verified" | "missing"
}>

export type EventEnvelopeV2<K extends string, P extends JsonObject> = Readonly<{
  schemaVersion: 2
  eventId: string
  lessonId: string
  sessionId: string
  kind: K
  occurredAt: string
  actor: EventActor
  producer: ProducerIdentity
  causationId: string | null
  idempotencyKey: string | null
  evidence: readonly EventEvidence[]
  payload: Readonly<P>
}>

export type EventEnvelopeDraft<K extends string, P extends JsonObject> = Readonly<{
  lessonId: string
  sessionId: string
  kind: K
  actor: EventActor
  producer: ProducerIdentity
  causationId: string | null
  idempotencyKey: string | null
  evidence: readonly EventEvidence[]
  payload: Readonly<P>
}>

declare const __ARDESIA_STUDIO_VERSION__: string
declare const __ARDESIA_GIT_SHA__: string

const FULL_COMMIT_SHA_RE = /^[0-9a-fA-F]{40}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const KIND_RE = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/
const REVERSE_DNS_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
const EVIDENCE_REF_RE = /^[a-z][a-z0-9-]*:\S(?:.*\S)?$/
const ACTOR_ID_RE = /^\S+$/

const ENVELOPE_KEYS = [
  "schemaVersion",
  "eventId",
  "lessonId",
  "sessionId",
  "kind",
  "occurredAt",
  "actor",
  "producer",
  "causationId",
  "idempotencyKey",
  "evidence",
  "payload",
] as const

const DRAFT_KEYS = [
  "lessonId",
  "sessionId",
  "kind",
  "actor",
  "producer",
  "causationId",
  "idempotencyKey",
  "evidence",
  "payload",
] as const

const AI_ACTOR: EventActor = { type: "system", id: "ai.consultative" }
const AI_KINDS = new Set(["ai.advice.proposed", "ai.advice.revised"])
const MAX_JSON_DEPTH = 32
const MAX_JSON_VALUES = 10_000

type DataRecord = Record<string, unknown>

function invalid(context: string, reason: string): never {
  throw new Error(`EventEnvelope v2: ${context} ${reason}`)
}

function assertStrictObject(
  value: unknown,
  expectedKeys: readonly string[] | null,
  context: string,
): asserts value is DataRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    invalid(context, "must be a plain object")
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    invalid(context, "must have the plain Object prototype")
  }

  const ownKeys = Reflect.ownKeys(value)
  if (ownKeys.some((key) => typeof key === "symbol")) {
    invalid(context, "must not contain symbol properties")
  }
  const stringKeys = ownKeys as string[]
  for (const key of stringKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (!descriptor || !("value" in descriptor)) {
      invalid(`${context}.${key}`, "accessor properties are not supported")
    }
    if (!descriptor.enumerable) {
      invalid(`${context}.${key}`, "must be enumerable")
    }
  }

  if (expectedKeys !== null) {
    const expected = new Set(expectedKeys)
    if (stringKeys.length !== expected.size || stringKeys.some((key) => !expected.has(key))) {
      invalid(context, `has unknown or missing keys; expected ${expectedKeys.join(", ")}`)
    }
  }
}

function valueOf(record: DataRecord, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(record, key)
  if (!descriptor || !("value" in descriptor)) {
    invalid(key, "must be a data property")
  }
  return descriptor.value
}

function strictArrayValues(value: unknown, context: string): unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    invalid(context, "must be an array")
  }
  const ownKeys = Reflect.ownKeys(value)
  if (ownKeys.some((key) => typeof key === "symbol")) {
    invalid(context, "must not contain symbol properties")
  }
  const dataKeys = (ownKeys as string[]).filter((key) => key !== "length")
  const dataKeySet = new Set(dataKeys)
  if (
    dataKeys.length !== value.length ||
    dataKeys.some((key) => !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length) ||
    !Array.from({ length: value.length }, (_, index) => String(index)).every((key) => dataKeySet.has(key))
  ) {
    invalid(context, "must be dense and must not contain extra properties")
  }
  return dataKeys.map((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      invalid(`${context}[${key}]`, "must be an enumerable data property")
    }
    return descriptor.value
  })
}

function assertJsonObject(value: unknown, context: string): asserts value is JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    invalid(context, "payload root must be a JSON object")
  }

  type Frame = { value: unknown; depth: number; path: string; exit?: boolean }
  const stack: Frame[] = [{ value, depth: 0, path: context }]
  const active = new WeakSet<object>()
  let valuesSeen = 0

  while (stack.length > 0) {
    const frame = stack.pop()!
    if (frame.exit) {
      active.delete(frame.value as object)
      continue
    }
    valuesSeen += 1
    if (valuesSeen > MAX_JSON_VALUES) {
      invalid(context, `exceeds the ${MAX_JSON_VALUES}-value budget`)
    }
    if (frame.depth > MAX_JSON_DEPTH) {
      invalid(frame.path, `exceeds maximum JSON depth ${MAX_JSON_DEPTH}`)
    }

    const current = frame.value
    if (current === null || typeof current === "string" || typeof current === "boolean") continue
    if (typeof current === "number") {
      if (!Number.isFinite(current)) invalid(frame.path, "contains a non-finite number")
      continue
    }
    if (typeof current !== "object") {
      invalid(frame.path, `contains a non-JSON value of type ${typeof current}`)
    }
    if (active.has(current)) {
      invalid(frame.path, "contains a cycle")
    }
    active.add(current)
    stack.push({ ...frame, exit: true })

    if (Array.isArray(current)) {
      const entries = strictArrayValues(current, frame.path)
      for (let index = entries.length - 1; index >= 0; index -= 1) {
        stack.push({ value: entries[index], depth: frame.depth + 1, path: `${frame.path}[${index}]` })
      }
      continue
    }

    assertStrictObject(current, null, frame.path)
    const keys = Reflect.ownKeys(current) as string[]
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index]!
      stack.push({ value: valueOf(current, key), depth: frame.depth + 1, path: `${frame.path}.${key}` })
    }
  }
}

function deepFreeze<T>(value: T): Readonly<T> {
  const stack: object[] = [value as object]
  const seen = new WeakSet<object>()
  while (stack.length > 0) {
    const current = stack.pop()!
    if (seen.has(current)) continue
    seen.add(current)
    for (const key of Reflect.ownKeys(current)) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key)
      if (descriptor && "value" in descriptor && typeof descriptor.value === "object" && descriptor.value !== null) {
        stack.push(descriptor.value)
      }
    }
    Object.freeze(current)
  }
  return value
}

function assertCanonicalUuid(value: unknown, context: string): asserts value is string {
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    invalid(context, "must be a canonical lowercase UUID")
  }
}

function assertLessonId(value: unknown): asserts value is string {
  if (typeof value !== "string") invalid("lessonId", "must be a reviewed room identifier")
  try {
    validateRoomId(value)
  } catch {
    invalid("lessonId", "must be a reviewed room identifier")
  }
}

function assertKind(value: unknown): asserts value is string {
  if (typeof value !== "string" || !KIND_RE.test(value)) {
    invalid("kind", "must be a lowercase dotted namespace")
  }
}

function assertCanonicalTimestamp(value: unknown): asserts value is string {
  if (typeof value !== "string") invalid("occurredAt", "must be a canonical UTC timestamp")
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    invalid("occurredAt", "must be canonical UTC ISO-8601 with milliseconds")
  }
}

function assertActor(value: unknown): asserts value is EventActor {
  assertStrictObject(value, ["type", "id"], "actor")
  const type = valueOf(value, "type")
  const id = valueOf(value, "id")
  if (type !== "teacher" && type !== "system" && type !== "plugin") {
    invalid("actor.type", "must be teacher, system or plugin")
  }
  if (typeof id !== "string" || !ACTOR_ID_RE.test(id)) {
    invalid("actor.id", "must be a stable non-whitespace string")
  }
}

export function assertFullCommitSha(value: unknown): asserts value is string {
  if (typeof value !== "string" || !FULL_COMMIT_SHA_RE.test(value)) {
    invalid("producer.commitSha", "must be a full 40-character hexadecimal SHA")
  }
}

function assertProducer(value: unknown): asserts value is ProducerIdentity {
  assertStrictObject(value, ["id", "version", "commitSha"], "producer")
  const id = valueOf(value, "id")
  const version = valueOf(value, "version")
  const commitSha = valueOf(value, "commitSha")
  if (typeof id !== "string" || !REVERSE_DNS_RE.test(id)) {
    invalid("producer.id", "must be reverse-DNS")
  }
  if (typeof version !== "string" || !SEMVER_RE.test(version)) {
    invalid("producer.version", "must be SemVer")
  }
  assertFullCommitSha(commitSha)
}

function assertEvidenceRef(value: unknown, context: string): asserts value is string {
  if (typeof value !== "string" || !isValidEvidenceRef(value) || !EVIDENCE_REF_RE.test(value)) {
    invalid(context, "must use namespace:payload without boundary whitespace")
  }
}

function assertEvidence(value: unknown, context = "evidence"): asserts value is readonly EventEvidence[] {
  const entries = strictArrayValues(value, context)
  if (entries.length === 0) invalid(context, "must be non-empty")
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    assertStrictObject(entry, ["ref", "resolution"], `${context}[${index}]`)
    assertEvidenceRef(valueOf(entry, "ref"), `${context}[${index}].ref`)
    const resolution = valueOf(entry, "resolution")
    if (resolution !== "verified" && resolution !== "missing") {
      invalid(`${context}[${index}].resolution`, "must be verified or missing")
    }
  }
}

function assertNullableUuid(value: unknown, context: string): asserts value is string | null {
  if (value !== null) assertCanonicalUuid(value, context)
}

function assertIdempotencyKey(value: unknown): asserts value is string | null {
  if (value !== null && (typeof value !== "string" || value.length === 0)) {
    invalid("idempotencyKey", "must be null or a non-empty string")
  }
}

function assertStableString(value: unknown, context: string): asserts value is string {
  if (typeof value !== "string" || !ACTOR_ID_RE.test(value)) {
    invalid(context, "must be a non-whitespace string")
  }
}

function assertAiPayload(value: JsonObject): void {
  assertStrictObject(value, ["model", "sources", "actionLevel", "humanReview"], "AI payload")
  const model = valueOf(value, "model")
  assertStrictObject(model, ["provider", "id", "version"], "AI payload.model")
  assertStableString(valueOf(model, "provider"), "AI payload.model.provider")
  assertStableString(valueOf(model, "id"), "AI payload.model.id")
  assertStableString(valueOf(model, "version"), "AI payload.model.version")

  const sources = valueOf(value, "sources")
  assertEvidence(sources, "AI payload.sources")
  if (sources.some((source) => source.resolution !== "missing")) {
    invalid("AI payload.sources", "must remain resolution missing")
  }
  const actionLevel = valueOf(value, "actionLevel")
  if (actionLevel !== "A0" && actionLevel !== "A1") {
    invalid("AI payload.actionLevel", "must be A0 or A1")
  }
  if (valueOf(value, "humanReview") !== "pending") {
    invalid("AI payload.humanReview", "must remain pending")
  }
}

function assertAuthorityFields(
  kind: string,
  actor: EventActor,
  eventId: string | null,
  causationId: string | null,
  evidence: readonly EventEvidence[],
  payload: JsonObject,
): void {
  const isAiActor = actor.type === AI_ACTOR.type && actor.id === AI_ACTOR.id
  const isAiKind = kind.startsWith("ai.")
  if (isAiKind && !isAiActor) {
    invalid("AI authority", "every ai.* kind requires system actor ai.consultative")
  }
  if (!isAiActor) return
  if (!AI_KINDS.has(kind)) {
    invalid("AI authority", "ai.consultative may emit only ai.advice.proposed or ai.advice.revised")
  }
  if (kind === "ai.advice.revised" && causationId === null) {
    invalid("AI authority", "ai.advice.revised requires causationId")
  }
  if (kind === "ai.advice.revised" && eventId !== null && causationId === eventId) {
    invalid("AI authority", "ai.advice.revised causationId must not equal its own eventId")
  }
  if (evidence.some((item) => item.resolution !== "missing")) {
    invalid("AI evidence", "must remain resolution missing")
  }
  assertAiPayload(payload)
}

function assertDraft(value: unknown): asserts value is EventEnvelopeDraft<string, JsonObject> {
  assertStrictObject(value, DRAFT_KEYS, "draft")
  const lessonId = valueOf(value, "lessonId")
  const sessionId = valueOf(value, "sessionId")
  const kind = valueOf(value, "kind")
  const actor = valueOf(value, "actor")
  const producer = valueOf(value, "producer")
  const causationId = valueOf(value, "causationId")
  const idempotencyKey = valueOf(value, "idempotencyKey")
  const evidence = valueOf(value, "evidence")
  const payload = valueOf(value, "payload")
  assertLessonId(lessonId)
  assertCanonicalUuid(sessionId, "sessionId")
  assertKind(kind)
  assertActor(actor)
  assertProducer(producer)
  assertNullableUuid(causationId, "causationId")
  assertIdempotencyKey(idempotencyKey)
  assertEvidence(evidence)
  assertJsonObject(payload, "payload")
  assertAuthorityFields(kind, actor, null, causationId, evidence, payload)
}

export function assertFounderBetaAuthority(envelope: EventEnvelopeV2<string, JsonObject>): void {
  assertAuthorityFields(
    envelope.kind,
    envelope.actor,
    envelope.eventId,
    envelope.causationId,
    envelope.evidence,
    envelope.payload,
  )
}

export function assertEventEnvelopeV2(
  value: unknown,
): asserts value is EventEnvelopeV2<string, JsonObject> {
  assertStrictObject(value, ENVELOPE_KEYS, "envelope")
  if (valueOf(value, "schemaVersion") !== EVENT_ENVELOPE_SCHEMA_VERSION) {
    invalid("schemaVersion", "must be 2")
  }
  assertCanonicalUuid(valueOf(value, "eventId"), "eventId")
  assertLessonId(valueOf(value, "lessonId"))
  assertCanonicalUuid(valueOf(value, "sessionId"), "sessionId")
  assertKind(valueOf(value, "kind"))
  assertCanonicalTimestamp(valueOf(value, "occurredAt"))
  assertActor(valueOf(value, "actor"))
  assertProducer(valueOf(value, "producer"))
  assertNullableUuid(valueOf(value, "causationId"), "causationId")
  assertIdempotencyKey(valueOf(value, "idempotencyKey"))
  assertEvidence(valueOf(value, "evidence"))
  assertJsonObject(valueOf(value, "payload"), "payload")
  assertFounderBetaAuthority(value as EventEnvelopeV2<string, JsonObject>)
}

export function createEventEnvelopeV2<K extends string, P extends JsonObject>(
  draft: EventEnvelopeDraft<K, P>,
  deps: { eventId(): string; now(): Date },
): EventEnvelopeV2<K, P> {
  assertDraft(draft)
  const snapshot: unknown = structuredClone(draft)
  assertDraft(snapshot)
  const eventId = deps.eventId()
  assertCanonicalUuid(eventId, "eventId")
  const now = deps.now()
  if (!(now instanceof Date)) invalid("occurredAt", "dependency now() must return a Date")
  const occurredAt = Date.prototype.toISOString.call(now)
  assertCanonicalTimestamp(occurredAt)
  const envelope = {
    schemaVersion: EVENT_ENVELOPE_SCHEMA_VERSION,
    eventId,
    lessonId: snapshot.lessonId,
    sessionId: snapshot.sessionId,
    kind: snapshot.kind,
    occurredAt,
    actor: snapshot.actor,
    producer: snapshot.producer,
    causationId: snapshot.causationId,
    idempotencyKey: snapshot.idempotencyKey,
    evidence: snapshot.evidence,
    payload: snapshot.payload,
  }
  assertEventEnvelopeV2(envelope)
  return deepFreeze(envelope) as EventEnvelopeV2<K, P>
}

export function studioProducerIdentity(): ProducerIdentity {
  const producer = {
    id: "com.github.andreamarro.ardesia.studio",
    version: __ARDESIA_STUDIO_VERSION__,
    commitSha: __ARDESIA_GIT_SHA__,
  }
  assertProducer(producer)
  return Object.freeze(producer)
}
