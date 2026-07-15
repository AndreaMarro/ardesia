import {
  ProducerObservationInputV1Schema,
  type ProducerObservationInputV1,
} from "./kernel"

export const KERNEL_INTAKE_LIMITS = {
  maxDepth: 16,
  maxNodes: 2_000,
  maxStringLength: 4_096,
  maxTotalStringBytes: 32_768,
  maxArrayLength: 128,
  maxObjectKeys: 128,
  maxObjectKeyLength: 128,
} as const

const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"])
const ARRAY_INDEX = /^(0|[1-9]\d*)$/
const SNAPSHOT_FAILED = Symbol("snapshot-failed")

function isDataDescriptor(descriptor: PropertyDescriptor | undefined): descriptor is PropertyDescriptor & { value: unknown } {
  return descriptor !== undefined && Object.hasOwn(descriptor, "value")
}

function snapshotData(raw: unknown, depth: number, seen: Set<object>, state: { nodes: number; stringBytes: number }): unknown | typeof SNAPSHOT_FAILED {
  state.nodes += 1
  if (state.nodes > KERNEL_INTAKE_LIMITS.maxNodes || depth > KERNEL_INTAKE_LIMITS.maxDepth) {
    return SNAPSHOT_FAILED
  }
  if (raw === null || typeof raw === "boolean") return raw
  if (typeof raw === "string") {
    state.stringBytes += new TextEncoder().encode(raw).byteLength
    return raw.length <= KERNEL_INTAKE_LIMITS.maxStringLength
      && state.stringBytes <= KERNEL_INTAKE_LIMITS.maxTotalStringBytes
      ? raw
      : SNAPSHOT_FAILED
  }
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : SNAPSHOT_FAILED
  if (typeof raw !== "object") return SNAPSHOT_FAILED
  if (seen.has(raw)) return SNAPSHOT_FAILED
  seen.add(raw)

  const prototype = Object.getPrototypeOf(raw)
  const isArray = Array.isArray(raw)
  if (isArray ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) {
    return SNAPSHOT_FAILED
  }

  let arrayLength: number | undefined
  if (isArray) {
    const lengthDescriptor = Object.getOwnPropertyDescriptor(raw, "length")
    if (!isDataDescriptor(lengthDescriptor)) return SNAPSHOT_FAILED
    const length = lengthDescriptor?.value
    if (!Number.isSafeInteger(length) || length < 0 || length > KERNEL_INTAKE_LIMITS.maxArrayLength) {
      return SNAPSHOT_FAILED
    }
    arrayLength = length as number
  }

  const keys = Reflect.ownKeys(raw)
  if (keys.some((key) => typeof key === "symbol")) return SNAPSHOT_FAILED

  if (isArray) {
    const length = arrayLength as number
    if (keys.length > KERNEL_INTAKE_LIMITS.maxArrayLength + 1) return SNAPSHOT_FAILED
    const elementKeys = keys.filter((key) => key !== "length")
    if (keys.length !== length + 1 || elementKeys.length !== length) return SNAPSHOT_FAILED
    const copy: unknown[] = []
    for (let index = 0; index < length; index += 1) {
      const key = String(index)
      if (!ARRAY_INDEX.test(key) || !elementKeys.includes(key)) return SNAPSHOT_FAILED
      const descriptor = Object.getOwnPropertyDescriptor(raw, key)
      if (!isDataDescriptor(descriptor)) return SNAPSHOT_FAILED
      const value = snapshotData(descriptor.value, depth + 1, seen, state)
      if (value === SNAPSHOT_FAILED) return SNAPSHOT_FAILED
      copy.push(value)
    }
    return copy
  }

  if (keys.length > KERNEL_INTAKE_LIMITS.maxObjectKeys) return SNAPSHOT_FAILED
  const copy: Record<string, unknown> = {}
  for (const key of keys) {
    if (typeof key !== "string" || FORBIDDEN_KEYS.has(key)) return SNAPSHOT_FAILED
    state.stringBytes += new TextEncoder().encode(key).byteLength
    if (key.length > KERNEL_INTAKE_LIMITS.maxObjectKeyLength
      || state.stringBytes > KERNEL_INTAKE_LIMITS.maxTotalStringBytes) return SNAPSHOT_FAILED
    const descriptor = Object.getOwnPropertyDescriptor(raw, key)
    if (!isDataDescriptor(descriptor)) return SNAPSHOT_FAILED
    const value = snapshotData(descriptor.value, depth + 1, seen, state)
    if (value === SNAPSHOT_FAILED) return SNAPSHOT_FAILED
    Object.defineProperty(copy, key, { value, enumerable: true, configurable: true, writable: true })
  }
  return copy
}

export function parseProducerObservationInputV1(raw: unknown): ProducerObservationInputV1 | null {
  try {
    const snapshot = snapshotData(raw, 0, new Set(), { nodes: 0, stringBytes: 0 })
    if (snapshot === SNAPSHOT_FAILED) return null
    const parsed = ProducerObservationInputV1Schema.safeParse(snapshot)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
