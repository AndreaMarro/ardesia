import { TeachingScopeV1Schema, type TeachingScopeV1 } from "../contracts/kernel"
import {
  ObservationReplayError, encodeTaggedStructural, hashObservationProjection, validateObservationJournal,
  type ObservationPartitionReader, type ObservationProjectionV1,
} from "./observationReplay"
const MAGIC = Uint8Array.from([0x41, 0x52, 0x44, 0x45, 0x53, 0x49, 0x41, 0])
const VERSION = 1
const VERSION_OFFSET = 8
const PAYLOAD_LENGTH_OFFSET = 9
const OBSERVATION_COUNT_OFFSET = 13
const PROJECTION_HASH_OFFSET = 17
const HEADER_BYTES = 49
const DIGEST_BYTES = 32
const ARTIFACT_DOMAIN = new TextEncoder().encode("ardesia/observation-archive/v1\0")
const ARRAY_INDEX = /^(0|[1-9][0-9]*)$/
const TYPED_ARRAY_PROTOTYPE = Object.getPrototypeOf(Uint8Array.prototype) as object
const TYPED_ARRAY_TAG_GETTER = Object.getOwnPropertyDescriptor(TYPED_ARRAY_PROTOTYPE, Symbol.toStringTag)?.get
const TYPED_ARRAY_BYTE_LENGTH_GETTER = Object.getOwnPropertyDescriptor(TYPED_ARRAY_PROTOTYPE, "byteLength")?.get
const TYPED_ARRAY_VALUES = Uint8Array.prototype.values
const TYPED_ARRAY_SET = Uint8Array.prototype.set
export const OBSERVATION_ARCHIVE_LIMITS = Object.freeze({
  maxArchiveBytes: 8 * 1024 * 1024,
  maxObservations: 4_096,
  maxDepth: 32,
  maxNodes: 250_000,
  maxStringBytes: 4 * 1024 * 1024,
  maxContainerEntries: 4_096,
})
export type ObservationArchiveErrorCode = "invalid-value" | "too-large" | "truncated" | "trailing-data"
  | "invalid-magic" | "unsupported-version" | "integrity" | "invalid-encoding" | "non-canonical"
  | "scope-mismatch" | "journal-invalid"
export class ObservationArchiveError extends Error {
  readonly code: ObservationArchiveErrorCode
  constructor(code: ObservationArchiveErrorCode) {
    super("Observation archive " + code)
    this.name = "ObservationArchiveError"
    this.code = code
  }
}
export interface DecodedObservationArchiveV1 { readonly schemaVersion: 1; readonly projection: ObservationProjectionV1; readonly projectionHash: string }
const INTERNAL_FAILURES = new WeakMap<object, ObservationArchiveErrorCode>()
function internalFailureCode(error: unknown): ObservationArchiveErrorCode | undefined {
  return typeof error === "function" || (typeof error === "object" && error !== null)
    ? INTERNAL_FAILURES.get(error as object) : undefined
}
function fail(code: ObservationArchiveErrorCode): never {
  const signal = Object.freeze({})
  INTERNAL_FAILURES.set(signal, code); throw signal
}
function redactBoundary(error: unknown): never {
  if (internalFailureCode(error) !== undefined) throw error
  return fail("invalid-value")
}
function exposeBoundary(error: unknown): never { throw new ObservationArchiveError(internalFailureCode(error) ?? "invalid-value") }
function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}
function concatBytes(...parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    Reflect.apply(TYPED_ARRAY_SET, output, [part, offset])
    offset += part.length
  }
  return output
}
function copyRange(bytes: Uint8Array, start: number, end: number): Uint8Array {
  const output = new Uint8Array(end - start)
  for (let index = start; index < end; index += 1) output[index - start] = bytes[index]
  return output
}
async function digestBytes(...parts: readonly Uint8Array[]): Promise<Uint8Array> {
  const bytes = concatBytes(...parts)
  const buffer = new ArrayBuffer(bytes.length)
  Reflect.apply(TYPED_ARRAY_SET, new Uint8Array(buffer), [bytes])
  return new Uint8Array(await crypto.subtle.digest("SHA-256", buffer))
}
function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/.test(hex)) return fail("invalid-value")
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16))
}
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
function consumeString(value: string, budget: { nodes: number; stringBytes: number }): void {
  const quoted = JSON.stringify(value)
  if (quoted === undefined) return fail("invalid-value")
  budget.stringBytes += new TextEncoder().encode(quoted).length
  if (budget.stringBytes > OBSERVATION_ARCHIVE_LIMITS.maxStringBytes) fail("too-large")
}
function snapshotValue(raw: unknown, depth: number, seen: Set<object>, budget: { nodes: number; stringBytes: number }): unknown {
  budget.nodes += 1
  if (budget.nodes > OBSERVATION_ARCHIVE_LIMITS.maxNodes
    || depth > OBSERVATION_ARCHIVE_LIMITS.maxDepth) return fail("too-large")
  if (raw === null || typeof raw === "boolean") return raw
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : fail("invalid-value")
  if (typeof raw === "string") {
    consumeString(raw, budget)
    return raw
  }
  if (typeof raw !== "object" || seen.has(raw)) return fail("invalid-value")
  seen.add(raw)
  try {
    const isArray = Array.isArray(raw)
    const prototype = Object.getPrototypeOf(raw)
    if (isArray ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) {
      return fail("invalid-value")
    }
    let length: number | undefined
    if (isArray) {
      const descriptor = Object.getOwnPropertyDescriptor(raw, "length")
      if (!descriptor || !Object.hasOwn(descriptor, "value")
        || !Number.isSafeInteger(descriptor.value) || Number(descriptor.value) < 0) return fail("invalid-value")
      length = Number(descriptor.value)
      if (length > OBSERVATION_ARCHIVE_LIMITS.maxContainerEntries) return fail("too-large")
    }
    const keys = Reflect.ownKeys(raw)
    if (keys.some((key) => typeof key !== "string")) return fail("invalid-value")
    if (keys.length > OBSERVATION_ARCHIVE_LIMITS.maxContainerEntries + (isArray ? 1 : 0)) {
      return fail("too-large")
    }
    if (isArray) {
      if (keys.length !== (length as number) + 1) return fail("invalid-value")
      const copy: unknown[] = []
      for (let index = 0; index < (length as number); index += 1) {
        const key = String(index)
        if (!ARRAY_INDEX.test(key) || !keys.includes(key)) return fail("invalid-value")
        const descriptor = Object.getOwnPropertyDescriptor(raw, key)
        if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) return fail("invalid-value")
        copy.push(snapshotValue(descriptor.value, depth + 1, seen, budget))
      }
      return copy
    }
    const copy = Object.create(null) as Record<string, unknown>
    for (const key of keys as string[]) {
      consumeString(key, budget)
      const descriptor = Object.getOwnPropertyDescriptor(raw, key)
      if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) return fail("invalid-value")
      Object.defineProperty(copy, key, {
        value: snapshotValue(descriptor.value, depth + 1, seen, budget),
        enumerable: true,
      })
    }
    return copy
  } finally {
    seen.delete(raw)
  }
}
function snapshotCanonical(raw: unknown): unknown {
  try {
    return snapshotValue(raw, 0, new Set(), { nodes: 0, stringBytes: 0 })
  } catch (error) {
    return redactBoundary(error)
  }
}
function encodeCanonicalBounded(value: unknown): Uint8Array {
  const snapshot = snapshotCanonical(value)
  try {
    return encodeTaggedStructural(snapshot)
  } catch (error) {
    return redactBoundary(error)
  }
}
class TaggedStructuralParser {
  private offset = 0
  private nodes = 0
  private stringBytes = 0
  private readonly bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }
  parse(depth = 0): unknown {
    this.nodes += 1
    if (this.nodes > OBSERVATION_ARCHIVE_LIMITS.maxNodes
      || depth > OBSERVATION_ARCHIVE_LIMITS.maxDepth) return fail("too-large")
    const tag = this.take()
    if (tag === 0x7a) {
      this.expect(0x3b)
      return null
    }
    if (tag === 0x62) {
      this.expect(0x3a)
      const value = this.take()
      if (value !== 0x30 && value !== 0x31) return fail("invalid-encoding")
      this.expect(0x3b)
      return value === 0x31
    }
    if (tag === 0x64) {
      this.expect(0x3a)
      const token = this.readAsciiUntil(0x3b, 32)
      if (token === "-0") return -0
      const value = Number(token)
      if (!Number.isFinite(value) || String(value) !== token) return fail("non-canonical")
      return value
    }
    if (tag === 0x73) return this.parseString()
    if (tag !== 0x61 && tag !== 0x6f) return fail("invalid-encoding")
    this.expect(0x3a)
    const count = this.readUnsigned(0x3a, OBSERVATION_ARCHIVE_LIMITS.maxContainerEntries)
    this.expect(tag === 0x61 ? 0x5b : 0x7b)
    if (tag === 0x61) {
      const values: unknown[] = []
      for (let index = 0; index < count; index += 1) values.push(this.parse(depth + 1))
      this.expect(0x5d)
      return values
    }
    const record = Object.create(null) as Record<string, unknown>
    for (let index = 0; index < count; index += 1) {
      if (this.take() !== 0x73) return fail("invalid-encoding")
      const key = this.parseString()
      if (Object.hasOwn(record, key)) return fail("invalid-encoding")
      Object.defineProperty(record, key, { value: this.parse(depth + 1), enumerable: true })
    }
    this.expect(0x7d)
    return record
  }
  atEnd(): boolean {
    return this.offset === this.bytes.length
  }
  private parseString(): string {
    this.expect(0x3a)
    const length = this.readUnsigned(0x3a, OBSERVATION_ARCHIVE_LIMITS.maxStringBytes)
    if (this.offset + length > this.bytes.length) return fail("truncated")
    const encoded = copyRange(this.bytes, this.offset, this.offset + length)
    this.offset += length
    this.expect(0x3b)
    this.stringBytes += length
    if (this.stringBytes > OBSERVATION_ARCHIVE_LIMITS.maxStringBytes) return fail("too-large")
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(encoded)
      const value = JSON.parse(text) as unknown
      if (typeof value !== "string") return fail("invalid-encoding")
      if (!bytesEqual(encoded, new TextEncoder().encode(JSON.stringify(value)))) return fail("non-canonical")
      return value
    } catch (error) {
      if (internalFailureCode(error) !== undefined) throw error
      return fail("invalid-encoding")
    }
  }
  private readUnsigned(delimiter: number, maximum: number): number {
    const token = this.readAsciiUntil(delimiter, 10)
    if (!/^(0|[1-9][0-9]*)$/.test(token)) return fail("non-canonical")
    const value = Number(token)
    if (!Number.isSafeInteger(value)) return fail("non-canonical")
    if (value > maximum) return fail("too-large")
    return value
  }
  private readAsciiUntil(delimiter: number, maxLength: number): string {
    const start = this.offset
    while (this.offset < this.bytes.length && this.bytes[this.offset] !== delimiter) {
      const byte = this.bytes[this.offset]
      if (byte < 0x20 || byte > 0x7e || this.offset - start >= maxLength) return fail("invalid-encoding")
      this.offset += 1
    }
    if (this.offset >= this.bytes.length) return fail("truncated")
    const token = String.fromCharCode(...copyRange(this.bytes, start, this.offset))
    this.offset += 1
    return token
  }
  private expect(expected: number): void {
    if (this.take() !== expected) fail("invalid-encoding")
  }
  private take(): number {
    if (this.offset >= this.bytes.length) return fail("truncated")
    const value = this.bytes[this.offset]
    this.offset += 1
    return value
  }
}
function parseScope(input: unknown): TeachingScopeV1 {
  try {
    const parsed = TeachingScopeV1Schema.safeParse(snapshotCanonical(input))
    return parsed.success ? parsed.data : fail("invalid-value")
  } catch {
    return fail("invalid-value")
  }
}
function readProjectionShell(input: unknown, expectedScope: TeachingScopeV1, count: number): readonly unknown[] {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return fail("invalid-encoding")
  const record = input as Record<string, unknown>
  if (Object.keys(record).sort().join("\0") !== "observations\0partition\0schemaVersion"
    || record.schemaVersion !== 1) return fail("invalid-encoding")
  const partition = record.partition
  if (partition === null || typeof partition !== "object" || Array.isArray(partition)) return fail("invalid-encoding")
  const partitionRecord = partition as Record<string, unknown>
  if (Object.keys(partitionRecord).sort().join("\0") !== "audienceSpaceId\0workspaceId"
    || partitionRecord.workspaceId !== expectedScope.workspaceId
    || partitionRecord.audienceSpaceId !== expectedScope.audienceSpaceId) return fail("scope-mismatch")
  if (!Array.isArray(record.observations) || record.observations.length !== count) return fail("journal-invalid")
  return record.observations
}
function snapshotArchiveBytes(input: unknown): Uint8Array {
  try {
    if (!TYPED_ARRAY_TAG_GETTER || !TYPED_ARRAY_BYTE_LENGTH_GETTER
      || Reflect.apply(TYPED_ARRAY_TAG_GETTER, input, []) !== "Uint8Array") return fail("invalid-value")
    Reflect.apply(TYPED_ARRAY_VALUES, input, [])
    const length = Number(Reflect.apply(TYPED_ARRAY_BYTE_LENGTH_GETTER, input, []))
    if (length > OBSERVATION_ARCHIVE_LIMITS.maxArchiveBytes) return fail("too-large")
    const copy = new Uint8Array(length)
    Reflect.apply(TYPED_ARRAY_SET, copy, [input])
    if (Number(Reflect.apply(TYPED_ARRAY_BYTE_LENGTH_GETTER, copy, [])) !== length) return fail("invalid-value")
    return copy
  } catch (error) {
    return redactBoundary(error)
  }
}
async function exportArchive(reader: ObservationPartitionReader, scopeInput: unknown): Promise<Uint8Array> {
  const scope = Object.freeze(parseScope(scopeInput))
  let rawRows: unknown
  try {
    rawRows = await reader.readPartition(Object.freeze({ ...scope }))
  } catch {
    return fail("invalid-value")
  }
  if (!Array.isArray(rawRows)) return fail("invalid-value")
  const shell = snapshotCanonical({
    schemaVersion: 1,
    partition: { workspaceId: scope.workspaceId, audienceSpaceId: scope.audienceSpaceId },
    observations: rawRows,
  }) as Record<string, unknown>
  const rows = shell.observations
  if (!Array.isArray(rows)) return fail("invalid-value")
  if (rows.length > OBSERVATION_ARCHIVE_LIMITS.maxObservations) return fail("too-large")
  let projection: ObservationProjectionV1
  try {
    projection = validateObservationJournal(rows, scope)
  } catch {
    return fail("journal-invalid")
  }
  const payload = encodeCanonicalBounded(projection)
  if (payload.length + HEADER_BYTES + DIGEST_BYTES > OBSERVATION_ARCHIVE_LIMITS.maxArchiveBytes) {
    return fail("too-large")
  }
  const projectionHash = await hashObservationProjection(projection)
  const header = new Uint8Array(HEADER_BYTES)
  Reflect.apply(TYPED_ARRAY_SET, header, [MAGIC])
  header[VERSION_OFFSET] = VERSION
  const view = new DataView(header.buffer)
  view.setUint32(PAYLOAD_LENGTH_OFFSET, payload.length)
  view.setUint32(OBSERVATION_COUNT_OFFSET, projection.observations.length)
  Reflect.apply(TYPED_ARRAY_SET, header, [hexToBytes(projectionHash), PROJECTION_HASH_OFFSET])
  const frame = concatBytes(header, payload)
  return concatBytes(frame, await digestBytes(ARTIFACT_DOMAIN, frame))
}
export async function exportObservationArchive(reader: ObservationPartitionReader, scopeInput: unknown): Promise<Uint8Array> {
  try {
    return await exportArchive(reader, scopeInput)
  } catch (error) {
    return exposeBoundary(error)
  }
}
async function decodeArchive(input: unknown, expectedScopeInput: unknown): Promise<DecodedObservationArchiveV1> {
  const expectedScope = parseScope(expectedScopeInput)
  const bytes = snapshotArchiveBytes(input)
  if (bytes.length < HEADER_BYTES + DIGEST_BYTES) return fail("truncated")
  if (!bytesEqual(copyRange(bytes, 0, MAGIC.length), MAGIC)) return fail("invalid-magic")
  if (bytes[VERSION_OFFSET] !== VERSION) return fail("unsupported-version")
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const payloadLength = view.getUint32(PAYLOAD_LENGTH_OFFSET)
  const count = view.getUint32(OBSERVATION_COUNT_OFFSET)
  if (count > OBSERVATION_ARCHIVE_LIMITS.maxObservations
    || payloadLength + HEADER_BYTES + DIGEST_BYTES > OBSERVATION_ARCHIVE_LIMITS.maxArchiveBytes) {
    return fail("too-large")
  }
  const expectedLength = HEADER_BYTES + payloadLength + DIGEST_BYTES
  if (bytes.length < expectedLength) return fail("truncated")
  if (bytes.length > expectedLength) return fail("trailing-data")
  const frame = copyRange(bytes, 0, bytes.length - DIGEST_BYTES)
  if (!bytesEqual(copyRange(bytes, bytes.length - DIGEST_BYTES, bytes.length), await digestBytes(ARTIFACT_DOMAIN, frame))) {
    return fail("integrity")
  }
  const payload = copyRange(bytes, HEADER_BYTES, HEADER_BYTES + payloadLength)
  const parser = new TaggedStructuralParser(payload)
  const decoded = parser.parse()
  if (!parser.atEnd()) return fail("trailing-data")
  if (!bytesEqual(encodeCanonicalBounded(decoded), payload)) return fail("non-canonical")
  const rawRows = readProjectionShell(decoded, expectedScope, count)
  let projection: ObservationProjectionV1
  try {
    projection = validateObservationJournal(rawRows, expectedScope)
  } catch (error) {
    if (error instanceof ObservationReplayError && error.code === "scope-mismatch") return fail("scope-mismatch")
    return fail("journal-invalid")
  }
  if (!bytesEqual(encodeCanonicalBounded(projection), payload)) return fail("non-canonical")
  const projectionHash = bytesToHex(copyRange(bytes, PROJECTION_HASH_OFFSET, PROJECTION_HASH_OFFSET + 32))
  if (await hashObservationProjection(projection) !== projectionHash) return fail("integrity")
  return Object.freeze({ schemaVersion: 1 as const, projection, projectionHash })
}
export async function decodeObservationArchive(input: unknown, expectedScopeInput: unknown): Promise<DecodedObservationArchiveV1> {
  try {
    return await decodeArchive(input, expectedScopeInput)
  } catch (error) {
    return exposeBoundary(error)
  }
}
