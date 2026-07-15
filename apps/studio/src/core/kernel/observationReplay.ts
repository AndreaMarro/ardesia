import {
  TeachingScopeV1Schema,
  samePartition,
  type ObservationEnvelopeV1,
  type TeachingScopeV1,
} from "../contracts/kernel"
import { parseObservationForAppend } from "./observationStore"

const HASH_DOMAIN = "ardesia/observation-projection/v1\0"

export type ObservationReplayErrorCode =
  | "invalid-value"
  | "scope-mismatch"
  | "sequence"
  | "duplicate-event"
  | "duplicate-source"

export class ObservationReplayError extends Error {
  readonly code: ObservationReplayErrorCode

  constructor(code: ObservationReplayErrorCode) {
    super(`Observation replay ${code}`)
    this.name = "ObservationReplayError"
    this.code = code
  }
}

export interface SequencedObservationV1 {
  readonly partitionSeq: number
  readonly envelope: ObservationEnvelopeV1
}

export interface ObservationProjectionV1 {
  readonly schemaVersion: 1
  readonly partition: {
    readonly workspaceId: string
    readonly audienceSpaceId: string
  }
  readonly observations: readonly SequencedObservationV1[]
}

export interface ObservationPartitionReader {
  readPartition(scopeInput: unknown): Promise<readonly SequencedObservationV1[]>
}

function invalid(): never {
  throw new ObservationReplayError("invalid-value")
}

function encodeString(value: string): string {
  const quoted = JSON.stringify(value)
  if (quoted === undefined) return invalid()
  const byteLength = new TextEncoder().encode(quoted).byteLength
  return `s:${byteLength}:${quoted};`
}

function encodeValue(value: unknown, ancestors: Set<object>): string {
  if (value === null) return "z;"
  if (typeof value === "boolean") return value ? "b:1;" : "b:0;"
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return invalid()
    return `d:${Object.is(value, -0) ? "-0" : String(value)};`
  }
  if (typeof value === "string") return encodeString(value)
  if (typeof value !== "object") return invalid()
  if (ancestors.has(value)) return invalid()

  ancestors.add(value)
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return invalid()
      const ownKeys = Reflect.ownKeys(value)
      if (ownKeys.some((key) => typeof key !== "string" || (key !== "length" && !/^(0|[1-9][0-9]*)$/.test(key)))) {
        return invalid()
      }
      const encoded: string[] = []
      for (let index = 0; index < value.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
        if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) return invalid()
        encoded.push(encodeValue(descriptor.value, ancestors))
      }
      if (ownKeys.length !== value.length + 1) return invalid()
      return `a:${value.length}:[${encoded.join("")}]`
    }

    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return invalid()
    const ownKeys = Reflect.ownKeys(value)
    if (ownKeys.some((key) => typeof key !== "string")) return invalid()
    const keys = ownKeys as string[]
    keys.sort()
    const encoded: string[] = []
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) return invalid()
      encoded.push(encodeString(key), encodeValue(descriptor.value, ancestors))
    }
    return `o:${keys.length}:{${encoded.join("")}}`
  } finally {
    ancestors.delete(value)
  }
}

export function encodeTaggedStructural(value: unknown): Uint8Array {
  return new TextEncoder().encode(encodeValue(value, new Set()))
}

function readStoredRow(input: unknown): SequencedObservationV1 {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return invalid()
  const record = input as Record<string, unknown>
  const keys = Object.keys(record)
  if (keys.length !== 2 || !Object.hasOwn(record, "partitionSeq") || !Object.hasOwn(record, "envelope")) {
    return invalid()
  }
  if (!Number.isSafeInteger(record.partitionSeq) || Number(record.partitionSeq) < 1) {
    throw new ObservationReplayError("sequence")
  }
  return Object.freeze({
    partitionSeq: Number(record.partitionSeq),
    envelope: parseObservationForAppend(record.envelope),
  })
}

export function validateObservationJournal(
  input: unknown,
  scopeInput: unknown,
): ObservationProjectionV1 {
  const scope = TeachingScopeV1Schema.parse(scopeInput)
  if (!Array.isArray(input)) return invalid()
  const rows = input.map(readStoredRow).sort((left, right) => left.partitionSeq - right.partitionSeq)
  const eventIds = new Set<string>()
  const sourceKeys = new Set<string>()

  rows.forEach((row, index) => {
    if (row.partitionSeq !== index + 1) throw new ObservationReplayError("sequence")
    if (!samePartition(scope, row.envelope.scope)) throw new ObservationReplayError("scope-mismatch")
    if (eventIds.has(row.envelope.eventId)) throw new ObservationReplayError("duplicate-event")
    if (sourceKeys.has(row.envelope.sourceIdempotencyKey)) throw new ObservationReplayError("duplicate-source")
    eventIds.add(row.envelope.eventId)
    sourceKeys.add(row.envelope.sourceIdempotencyKey)
  })

  return Object.freeze({
    schemaVersion: 1 as const,
    partition: Object.freeze({
      workspaceId: scope.workspaceId,
      audienceSpaceId: scope.audienceSpaceId,
    }),
    observations: Object.freeze(rows),
  })
}

export async function hashObservationProjection(projection: ObservationProjectionV1): Promise<string> {
  const domain = new TextEncoder().encode(HASH_DOMAIN)
  const encoded = encodeTaggedStructural(projection)
  const bytes = new Uint8Array(domain.length + encoded.length)
  bytes.set(domain)
  bytes.set(encoded, domain.length)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function replayObservationJournal(
  input: unknown,
  scopeInput: TeachingScopeV1 | unknown,
): Promise<{ readonly projection: ObservationProjectionV1; readonly hash: string }> {
  const projection = validateObservationJournal(input, scopeInput)
  return Object.freeze({ projection, hash: await hashObservationProjection(projection) })
}
