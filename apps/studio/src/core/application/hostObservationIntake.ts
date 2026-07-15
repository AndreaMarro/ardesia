import type {
  ObservationEnvelopeV1,
  ProducerObservationInputV1,
} from "../contracts/kernel"
import { parseProducerObservationInputV1 } from "../contracts/kernelIntake"
import {
  parseObservationForAppend,
  type ObservationAppendReceipt,
  type ObservationStore,
} from "../kernel/observationStore"

export type HostObservationAssignmentV1 = Readonly<Pick<
  ObservationEnvelopeV1,
  | "eventId"
  | "producer"
  | "scope"
  | "privacy"
  | "recordedAt"
  | "evidence"
  | "consent"
  | "contentHash"
  | "sourceIdempotencyKey"
>>

export interface HostObservationAuthorityPort {
  authorize(
    input: Readonly<ProducerObservationInputV1>,
  ): Promise<HostObservationAssignmentV1 | null>
}

export interface HostObservationPartitionV1 {
  readonly workspaceId: string
  readonly audienceSpaceId: string
}

export interface HostObservationIntake {
  record(rawProducerInput: unknown): Promise<ObservationAppendReceipt>
}

export type HostObservationIntakeErrorCode =
  | "invalid-producer-input"
  | "not-authorized"
  | "authority-failed"
  | "invalid-host-assignment"
  | "scope-mismatch"

export class HostObservationIntakeError extends Error {
  readonly code: HostObservationIntakeErrorCode

  constructor(code: HostObservationIntakeErrorCode) {
    super(`Host observation intake ${code}`)
    this.name = "HostObservationIntakeError"
    this.code = code
  }
}

function freezeRecursively(value: unknown): void {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return
  for (const child of Object.values(value)) freezeRecursively(child)
  Object.freeze(value)
}

export function createHostObservationIntake(dependencies: {
  readonly authority: HostObservationAuthorityPort
  readonly authorizedPartition: HostObservationPartitionV1
  readonly store: ObservationStore
}): HostObservationIntake {
  const authorizedPartition = Object.freeze({
    workspaceId: dependencies.authorizedPartition.workspaceId,
    audienceSpaceId: dependencies.authorizedPartition.audienceSpaceId,
  })
  let queue: Promise<void> = Promise.resolve()

  async function authorizeAndAppend(
    input: Readonly<ProducerObservationInputV1>,
  ): Promise<ObservationAppendReceipt> {
    let assignment: HostObservationAssignmentV1 | null
    try {
      assignment = await dependencies.authority.authorize(input)
    } catch {
      throw new HostObservationIntakeError("authority-failed")
    }
    if (assignment === null) throw new HostObservationIntakeError("not-authorized")

    let envelope: ObservationEnvelopeV1
    try {
      envelope = parseObservationForAppend({
        schemaVersion: 1,
        eventId: assignment.eventId,
        producer: assignment.producer,
        scope: assignment.scope,
        privacy: assignment.privacy,
        authority: "observed",
        occurredAt: input.occurredAt,
        recordedAt: assignment.recordedAt,
        kind: input.kind,
        payload: input.payload,
        evidence: assignment.evidence,
        consent: assignment.consent,
        contentHash: assignment.contentHash,
        sourceIdempotencyKey: assignment.sourceIdempotencyKey,
      })
    } catch {
      throw new HostObservationIntakeError("invalid-host-assignment")
    }

    if (envelope.scope.workspaceId !== authorizedPartition.workspaceId
      || envelope.scope.audienceSpaceId !== authorizedPartition.audienceSpaceId) {
      throw new HostObservationIntakeError("scope-mismatch")
    }
    return dependencies.store.append(envelope)
  }

  return Object.freeze({
    record(rawProducerInput: unknown): Promise<ObservationAppendReceipt> {
      const input = parseProducerObservationInputV1(rawProducerInput)
      if (input === null) {
        return Promise.reject(new HostObservationIntakeError("invalid-producer-input"))
      }
      freezeRecursively(input)

      const operation = queue.then(() => authorizeAndAppend(input))
      queue = operation.then(() => undefined, () => undefined)
      return operation
    },
  })
}
