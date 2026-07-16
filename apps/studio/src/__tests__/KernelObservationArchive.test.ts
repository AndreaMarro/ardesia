import { describe, expect, it } from "vitest"
import {
  encodeTaggedStructural,
  hashObservationProjection,
  replayObservationJournal,
  type ObservationPartitionReader,
  type ObservationProjectionV1,
  type SequencedObservationV1,
} from "../core/kernel/observationReplay"
import {
  OBSERVATION_ARCHIVE_LIMITS,
  ObservationArchiveError,
  decodeObservationArchive,
  exportObservationArchive,
} from "../core/kernel/observationArchive"

const MAGIC = Uint8Array.from([0x41, 0x52, 0x44, 0x45, 0x53, 0x49, 0x41, 0])
const VERSION_OFFSET = 8
const PAYLOAD_LENGTH_OFFSET = 9
const OBSERVATION_COUNT_OFFSET = 13
const PROJECTION_HASH_OFFSET = 17
const HEADER_BYTES = 49
const DIGEST_BYTES = 32
const ARTIFACT_DOMAIN = new TextEncoder().encode("ardesia/observation-archive/v1\0")
const SHA_A = "a".repeat(64)

function scope(overrides: Record<string, unknown> = {}) {
  return {
    workspaceId: "workspace-archive",
    audienceSpaceId: "audience-archive",
    lessonId: "lesson-current",
    boardId: "board-current",
    ...overrides,
  }
}

function observation(ordinal: number, overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    eventId: `00000000-0000-4000-8000-${String(ordinal).padStart(12, "0")}`,
    producer: { producerId: "studio-host", producerKind: "host" },
    scope: scope({ lessonId: `lesson-${ordinal}`, boardId: `board-${ordinal}` }),
    privacy: "didactic-sensitive",
    authority: "observed",
    occurredAt: "2026-07-15T08:00:00.000Z",
    recordedAt: "2026-07-15T08:00:00.100Z",
    kind: "synthetic.archive",
    payload: ordinal === 1
      ? { negativeZero: -0, loneSurrogate: "\ud800", ordered: ["first", "second"] }
      : { ordinal },
    evidence: [],
    consent: { status: "not-required" },
    contentHash: SHA_A,
    sourceIdempotencyKey: `source-${ordinal}`,
    ...overrides,
  }
}

function row(partitionSeq: number, envelope = observation(partitionSeq)): SequencedObservationV1 {
  return { partitionSeq, envelope } as unknown as SequencedObservationV1
}

function reader(rows: readonly SequencedObservationV1[]): ObservationPartitionReader {
  return { readPartition: async () => rows }
}

function hexToBytes(hex: string): Uint8Array {
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16))
}

function concat(...parts: readonly Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0))
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

async function artifactDigest(frame: Uint8Array): Promise<Uint8Array> {
  const preimage = concat(ARTIFACT_DOMAIN, frame)
  const buffer = new ArrayBuffer(preimage.length)
  new Uint8Array(buffer).set(preimage)
  return new Uint8Array(await crypto.subtle.digest("SHA-256", buffer))
}

async function frameProjection(
  projection: ObservationProjectionV1,
  options: { version?: number; count?: number; hash?: string; payload?: Uint8Array } = {},
): Promise<Uint8Array> {
  const payload = options.payload ?? encodeTaggedStructural(projection)
  const hash = options.hash ?? await hashObservationProjection(projection)
  const header = new Uint8Array(HEADER_BYTES)
  header.set(MAGIC)
  header[VERSION_OFFSET] = options.version ?? 1
  const view = new DataView(header.buffer)
  view.setUint32(PAYLOAD_LENGTH_OFFSET, payload.length)
  view.setUint32(OBSERVATION_COUNT_OFFSET, options.count ?? projection.observations.length)
  header.set(hexToBytes(hash), PROJECTION_HASH_OFFSET)
  const frame = concat(header, payload)
  return concat(frame, await artifactDigest(frame))
}

async function resign(archive: Uint8Array): Promise<Uint8Array> {
  const frame = archive.slice(0, -DIGEST_BYTES)
  return concat(frame, await artifactDigest(frame))
}

const rows = () => [row(1), row(2)]

async function expectCode(promise: Promise<unknown>, code: string): Promise<void> {
  try {
    await promise
    expect.fail(`expected ${code}`)
  } catch (error) {
    expect(error).toBeInstanceOf(ObservationArchiveError)
    expect(error).toMatchObject({ code, message: `Observation archive ${code}` })
    expect(error).not.toHaveProperty("projection")
    expect(error).not.toHaveProperty("rows")
    expect(error).not.toHaveProperty("cause")
    expect(String(error)).not.toContain("HOSTILE_BOUNDARY_TEXT")
  }
}

interface CanonicalMetrics { nodes: number; stringBytes: number; maxDepth: number; maxEntries: number }

function canonicalMetrics(value: unknown, depth = 0, result: CanonicalMetrics = {
  nodes: 0, stringBytes: 0, maxDepth: 0, maxEntries: 0,
}): CanonicalMetrics {
  result.nodes += 1
  result.maxDepth = Math.max(result.maxDepth, depth)
  if (typeof value === "string") result.stringBytes += new TextEncoder().encode(JSON.stringify(value)).length
  if (Array.isArray(value)) {
    result.maxEntries = Math.max(result.maxEntries, value.length)
    value.forEach((child) => canonicalMetrics(child, depth + 1, result))
  } else if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>
    const keys = Object.keys(record)
    result.maxEntries = Math.max(result.maxEntries, keys.length)
    for (const key of keys) {
      result.stringBytes += new TextEncoder().encode(JSON.stringify(key)).length
      canonicalMetrics(record[key], depth + 1, result)
    }
  }
  return result
}

function valueWithNodes(nodes: number): unknown {
  if (nodes === 1) return 0
  const root: unknown[] = []
  let remaining = nodes - 1
  while (remaining > 0) {
    if (remaining === 1) {
      root.push(0)
      remaining -= 1
      continue
    }
    const child: number[] = []
    const childValues = Math.min(OBSERVATION_ARCHIVE_LIMITS.maxContainerEntries, remaining - 1)
    for (let index = 0; index < childValues; index += 1) child.push(0)
    root.push(child)
    remaining -= childValues + 1
  }
  return root
}

function nestedValue(levels: number): unknown {
  let value: unknown = 0
  for (let level = 0; level < levels; level += 1) value = [value]
  return value
}

async function projectionWithPayload(payload: unknown): Promise<ObservationProjectionV1> {
  return (await replayObservationJournal([row(1, observation(1, { payload }))], scope())).projection
}

function numberedRows(count: number): SequencedObservationV1[] {
  return Array.from({ length: count }, (_value, index) => row(index + 1))
}

function numericChunks(count: number): readonly (readonly number[])[] {
  const chunks: number[][] = []
  let remaining = count
  while (remaining > 0) {
    const size = Math.min(OBSERVATION_ARCHIVE_LIMITS.maxContainerEntries, remaining)
    chunks.push(new Array<number>(size).fill(Number.MAX_SAFE_INTEGER))
    remaining -= size
  }
  return chunks
}

describe("K3 deterministic observation archive", () => {
  it("exports canonical bytes and exactly preserves K3 values and hash", async () => {
    const forward = await exportObservationArchive(reader(rows()), scope())
    const reverse = await exportObservationArchive(reader(rows().reverse()), scope())
    const decoded = await decodeObservationArchive(forward, scope())
    const payload = decoded.projection.observations[0].envelope.payload as Record<string, unknown>

    expect(Array.from(forward)).toEqual(Array.from(reverse))
    expect(Object.is(payload.negativeZero, -0)).toBe(true)
    expect((payload.loneSurrogate as string).charCodeAt(0)).toBe(0xd800)
    expect(payload.ordered).toEqual(["first", "second"])
    expect(decoded.projectionHash).toBe((await replayObservationJournal(rows(), scope())).hash)
    expect(Object.isFrozen(decoded.projection)).toBe(true)
  })

  it("rejects truncation, trailing bytes, unknown magic/version and artifact corruption", async () => {
    const valid = await exportObservationArchive(reader(rows()), scope())
    const badMagic = valid.slice()
    badMagic[0] ^= 1
    const badVersion = valid.slice()
    badVersion[VERSION_OFFSET] = 2
    const corrupted = valid.slice()
    corrupted[HEADER_BYTES + 10] ^= 1

    await expect(decodeObservationArchive(valid.slice(0, -1), scope())).rejects.toThrow()
    await expect(decodeObservationArchive(concat(valid, Uint8Array.of(0)), scope())).rejects.toThrow()
    await expect(decodeObservationArchive(badMagic, scope())).rejects.toThrow()
    await expect(decodeObservationArchive(badVersion, scope())).rejects.toThrow()
    await expect(decodeObservationArchive(corrupted, scope())).rejects.toThrow()
  })

  it("binds count, projection hash and caller-authorized partition", async () => {
    const valid = await exportObservationArchive(reader(rows()), scope())
    const countMismatch = valid.slice()
    new DataView(countMismatch.buffer).setUint32(OBSERVATION_COUNT_OFFSET, 3)
    const hashMismatch = valid.slice()
    hashMismatch[PROJECTION_HASH_OFFSET] ^= 1

    await expect(decodeObservationArchive(await resign(countMismatch), scope())).rejects.toThrow()
    await expect(decodeObservationArchive(await resign(hashMismatch), scope())).rejects.toThrow()
    await expect(decodeObservationArchive(valid, scope({ audienceSpaceId: "audience-other" }))).rejects.toThrow()
  })

  it("rejects sequence corruption, cross-partition contamination and non-canonical row order", async () => {
    const partition = { workspaceId: scope().workspaceId, audienceSpaceId: scope().audienceSpaceId }
    const gap = { schemaVersion: 1, partition, observations: [row(2)] } as ObservationProjectionV1
    const contaminated = {
      schemaVersion: 1,
      partition,
      observations: [row(1, observation(1, {
        scope: scope({ audienceSpaceId: "audience-other", lessonId: "lesson-1", boardId: "board-1" }),
      }))],
    } as ObservationProjectionV1
    const reversed = { schemaVersion: 1, partition, observations: rows().reverse() } as ObservationProjectionV1

    await expect(decodeObservationArchive(await frameProjection(gap), scope())).rejects.toThrow()
    await expect(decodeObservationArchive(await frameProjection(contaminated), scope())).rejects.toThrow()
    await expect(decodeObservationArchive(await frameProjection(reversed), scope())).rejects.toThrow()
  })

  it("rejects non-canonical number spelling and invalid UTF-8 even with a valid artifact digest", async () => {
    const projection = (await replayObservationJournal(rows(), scope())).projection
    const canonical = encodeTaggedStructural(projection)
    const text = new TextDecoder().decode(canonical)
    const numberOffset = text.indexOf("d:1;")
    expect(numberOffset).toBeGreaterThan(-1)
    const nonCanonical = new TextEncoder().encode(`${text.slice(0, numberOffset)}d:01;${text.slice(numberOffset + 4)}`)
    const invalidUtf8 = canonical.slice()
    invalidUtf8[invalidUtf8.indexOf(0x73) + 8] = 0xff

    await expect(decodeObservationArchive(await frameProjection(projection, { payload: nonCanonical }), scope())).rejects.toThrow()
    await expect(decodeObservationArchive(await frameProjection(projection, { payload: invalidUtf8 }), scope())).rejects.toThrow()
  })

  it("uses one complete-projection budget at exact and beyond depth, node and string limits", async () => {
    const base = await projectionWithPayload(null)
    const baseMetrics = canonicalMetrics(base)
    const payloadDepth = canonicalMetrics(await projectionWithPayload([0])).maxDepth - 1
    const exactDepthPayload = nestedValue(OBSERVATION_ARCHIVE_LIMITS.maxDepth - payloadDepth)
    const exactDepthRows = [row(1, observation(1, { payload: exactDepthPayload }))]
    expect(canonicalMetrics(await projectionWithPayload(exactDepthPayload)).maxDepth).toBe(OBSERVATION_ARCHIVE_LIMITS.maxDepth)
    await decodeObservationArchive(await exportObservationArchive(reader(exactDepthRows), scope()), scope())
    const beyondDepth = nestedValue(OBSERVATION_ARCHIVE_LIMITS.maxDepth - payloadDepth + 1)
    await expectCode(exportObservationArchive(reader([row(1, observation(1, { payload: beyondDepth }))]), scope()), "too-large")
    await expectCode(decodeObservationArchive(await frameProjection(await projectionWithPayload(beyondDepth)), scope()), "too-large")

    const payloadNodes = OBSERVATION_ARCHIVE_LIMITS.maxNodes - (baseMetrics.nodes - 1)
    const exactNodesPayload = valueWithNodes(payloadNodes)
    const exactNodesProjection = await projectionWithPayload(exactNodesPayload)
    expect(canonicalMetrics(exactNodesProjection).nodes).toBe(OBSERVATION_ARCHIVE_LIMITS.maxNodes)
    await decodeObservationArchive(await exportObservationArchive(reader([row(1, observation(1, { payload: exactNodesPayload }))]), scope()), scope())
    const beyondNodes = valueWithNodes(payloadNodes + 1)
    await expectCode(exportObservationArchive(reader([row(1, observation(1, { payload: beyondNodes }))]), scope()), "too-large")
    await expectCode(decodeObservationArchive(await frameProjection(await projectionWithPayload(beyondNodes)), scope()), "too-large")

    const emptyStringMetrics = canonicalMetrics(await projectionWithPayload(""))
    const exactStringLength = OBSERVATION_ARCHIVE_LIMITS.maxStringBytes - emptyStringMetrics.stringBytes
    const exactString = "x".repeat(exactStringLength)
    expect(canonicalMetrics(await projectionWithPayload(exactString)).stringBytes).toBe(OBSERVATION_ARCHIVE_LIMITS.maxStringBytes)
    await decodeObservationArchive(await exportObservationArchive(reader([row(1, observation(1, { payload: exactString }))]), scope()), scope())
    const beyondString = `${exactString}x`
    await expectCode(exportObservationArchive(reader([row(1, observation(1, { payload: beyondString }))]), scope()), "too-large")
    await expectCode(decodeObservationArchive(await frameProjection(await projectionWithPayload(beyondString)), scope()), "too-large")
  }, 30_000)

  it("accepts exact container/observation/archive limits and rejects one beyond on both boundaries", async () => {
    const exactContainer = new Array<number>(OBSERVATION_ARCHIVE_LIMITS.maxContainerEntries).fill(0)
    await decodeObservationArchive(await exportObservationArchive(reader([row(1, observation(1, { payload: exactContainer }))]), scope()), scope())
    const beyondContainer = [...exactContainer, 0]
    await expectCode(exportObservationArchive(reader([row(1, observation(1, { payload: beyondContainer }))]), scope()), "too-large")
    await expectCode(decodeObservationArchive(await frameProjection(await projectionWithPayload(beyondContainer)), scope()), "too-large")

    const exactObservations = numberedRows(OBSERVATION_ARCHIVE_LIMITS.maxObservations)
    await decodeObservationArchive(await exportObservationArchive(reader(exactObservations), scope()), scope())
    const beyondObservations = numberedRows(OBSERVATION_ARCHIVE_LIMITS.maxObservations + 1)
    await expectCode(exportObservationArchive(reader(beyondObservations), scope()), "too-large")
    await expectCode(decodeObservationArchive(await frameProjection((await replayObservationJournal(beyondObservations, scope())).projection), scope()), "too-large")

    const baseRows = [row(1, observation(1, { payload: { numbers: numericChunks(225_000), pad: "" } }))]
    const baseArchive = await exportObservationArchive(reader(baseRows), scope())
    const delta = OBSERVATION_ARCHIVE_LIMITS.maxArchiveBytes - baseArchive.length
    const padLength = Array.from({ length: 24 }, (_value, index) => Math.max(0, delta - 20 + index))
      .find((length) => length + String(length + 2).length - 1 === delta)
    expect(padLength).toBeTypeOf("number")
    if (padLength === undefined) throw new Error("archive padding not solvable")
    const exactArchiveRows = [row(1, observation(1, { payload: { numbers: numericChunks(225_000), pad: "x".repeat(padLength) } }))]
    const exactArchive = await exportObservationArchive(reader(exactArchiveRows), scope())
    expect(exactArchive.length).toBe(OBSERVATION_ARCHIVE_LIMITS.maxArchiveBytes)
    await decodeObservationArchive(exactArchive, scope())
    const beyondArchiveRows = [row(1, observation(1, { payload: { numbers: numericChunks(225_000), pad: `${"x".repeat(padLength)}x` } }))]
    await expectCode(exportObservationArchive(reader(beyondArchiveRows), scope()), "too-large")
    await expectCode(decodeObservationArchive(concat(exactArchive, Uint8Array.of(0)), scope()), "too-large")
  }, 30_000)

  it("snapshots a genuinely branded Uint8Array intrinsically and redacts hostile boundaries", async () => {
    const valid = await exportObservationArchive(reader(rows()), scope())
    let ownSliceCalled = false
    Object.defineProperty(valid, "slice", { value: () => {
      ownSliceCalled = true
      throw new Error("HOSTILE_BOUNDARY_TEXT")
    } })
    await decodeObservationArchive(valid, scope())
    expect(ownSliceCalled).toBe(false)

    let accessorCalled = false
    const fake = Object.create(Uint8Array.prototype)
    Object.defineProperty(fake, "length", { get: () => {
      accessorCalled = true
      throw new Error("HOSTILE_BOUNDARY_TEXT")
    } })
    await expectCode(decodeObservationArchive(fake as Uint8Array, scope()), "invalid-value")
    expect(accessorCalled).toBe(false)

    const proxied = new Proxy(valid, { getPrototypeOf: () => { throw new Error("HOSTILE_BOUNDARY_TEXT") } })
    await expectCode(decodeObservationArchive(proxied, scope()), "invalid-value")
    await expectCode(decodeObservationArchive(new Uint16Array([1, 2]) as unknown as Uint8Array, scope()), "invalid-value")

    const detached = new Uint8Array([1, 2, 3])
    structuredClone(detached.buffer, { transfer: [detached.buffer] })
    await expectCode(decodeObservationArchive(detached, scope()), "invalid-value")

    const hostileScope = Object.defineProperty({}, "workspaceId", {
      get: () => { throw new Error("HOSTILE_BOUNDARY_TEXT") },
    })
    await expectCode(decodeObservationArchive(valid, hostileScope), "invalid-value")
    const proxiedScope = new Proxy(scope(), { ownKeys: () => { throw new Error("HOSTILE_BOUNDARY_TEXT") } })
    await expectCode(decodeObservationArchive(valid, proxiedScope), "invalid-value")

    const forgedPublicError = new ObservationArchiveError("invalid-value")
    Object.defineProperty(forgedPublicError, "message", { value: "HOSTILE_BOUNDARY_TEXT" })
    const hostileRows = new Proxy(rows(), {
      getPrototypeOf: () => { throw forgedPublicError },
    })
    await expectCode(exportObservationArchive(reader(hostileRows), scope()), "invalid-value")
  })

  it("keeps authorized scope private and immutable across the reader boundary", async () => {
    const callerScope = scope()
    const crossScope = scope({ workspaceId: "workspace-cross", audienceSpaceId: "audience-cross" })
    let receivedScope: unknown
    const mutatingReader: ObservationPartitionReader = { readPartition: async (received) => {
      receivedScope = received
      try {
        ;(received as { workspaceId: string }).workspaceId = crossScope.workspaceId
        ;(received as { audienceSpaceId: string }).audienceSpaceId = crossScope.audienceSpaceId
      } catch { /* frozen reader view */ }
      return [row(1, observation(1, { scope: crossScope }))]
    } }
    await expectCode(exportObservationArchive(mutatingReader, callerScope), "journal-invalid")
    expect(receivedScope).toEqual(callerScope)
    expect(receivedScope).not.toBe(callerScope)
    expect(Object.isFrozen(receivedScope)).toBe(true)
  })

  it("does not narrow the K3 payload domain beyond the replay validator", async () => {
    const payload = Object.create(null) as Record<string, unknown>
    Object.defineProperty(payload, "__proto__", { value: "data", enumerable: true })
    const dangerousRows = [row(1, observation(1, { payload }))]
    const replayed = await replayObservationJournal(dangerousRows, scope())
    const valid = await exportObservationArchive(reader(dangerousRows), scope())
    const decoded = await decodeObservationArchive(valid, scope())
    expect(decoded.projection).toEqual(replayed.projection)
  })
})
