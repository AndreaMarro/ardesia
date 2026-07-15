import {
  ObservationEnvelopeV1Schema,
  type ObservationEnvelopeV1,
} from "../contracts/kernel"

export type ObservationStoreErrorCode =
  | "scope-mismatch"
  | "event-conflict"
  | "source-conflict"
  | "stale"
  | "degraded"
  | "closed"
  | "quota"
  | "security"
  | "unknown"
  | "abort"
  | "data-clone"
  | "blocked"
  | "timeout"

export type ObservationStoreLifecycle = "open" | "stale" | "degraded" | "closed"
export type ObservationStoreOutcome = "not-committed" | "unknown"

export class ObservationStoreError extends Error {
  readonly code: ObservationStoreErrorCode
  readonly outcome: ObservationStoreOutcome

  constructor(code: ObservationStoreErrorCode, outcome: ObservationStoreOutcome = "not-committed") {
    super(`Observation store ${code}`)
    this.name = "ObservationStoreError"
    this.code = code
    this.outcome = outcome
  }
}

export interface ObservationAppendReceipt {
  readonly partitionSeq: number
  readonly eventId: string
  readonly sourceIdempotencyKey: string
  readonly partition: {
    readonly workspaceId: string
    readonly audienceSpaceId: string
  }
}

export interface ObservationStore {
  readonly lifecycle: ObservationStoreLifecycle
  append(input: unknown): Promise<ObservationAppendReceipt>
  close(): void
}

function freezeJson(value: unknown): void {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return
  for (const child of Object.values(value)) freezeJson(child)
  Object.freeze(value)
}

export function parseObservationForAppend(input: unknown): ObservationEnvelopeV1 {
  const parsed = ObservationEnvelopeV1Schema.parse(input)
  freezeJson(parsed)
  return parsed
}

export function fullEnvelopeEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") return false
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((value, index) => fullEnvelopeEqual(value, right[index]))
  }
  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const leftKeys = Object.keys(leftRecord)
  const rightKeys = Object.keys(rightRecord)
  if (leftKeys.length !== rightKeys.length || leftKeys.some((key) => !Object.hasOwn(rightRecord, key))) return false
  return leftKeys.every((key) => fullEnvelopeEqual(leftRecord[key], rightRecord[key]))
}

export function classifyObservationStoreError(
  error: unknown,
  outcome: ObservationStoreOutcome = "not-committed",
): ObservationStoreError {
  const name = typeof error === "object" && error !== null && "name" in error
    ? String((error as { name: unknown }).name)
    : ""
  const code: ObservationStoreErrorCode = {
    QuotaExceededError: "quota",
    SecurityError: "security",
    UnknownError: "unknown",
    AbortError: "abort",
    DataCloneError: "data-clone",
  }[name] as ObservationStoreErrorCode | undefined ?? "unknown"
  return new ObservationStoreError(code, outcome)
}
