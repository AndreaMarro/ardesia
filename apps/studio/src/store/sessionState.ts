import { validateRoomId } from "./roomPaths"

export type LessonSessionIdentityV1 = Readonly<{
  lessonId: string
  sessionId: string
}>

export type SessionPathsV1 = Readonly<{
  root: `raw/${string}/${string}/`
  session: `raw/${string}/${string}/session.yaml`
  audioDir: `raw/${string}/${string}/audio/`
}>

export type SessionYamlV2 = Readonly<{
  v: 2
  lessonId: string
  sessionId: string
  created: number
  revision: number
  audioConsent: boolean
  audioStartEpoch: number | null
}>

export type SessionSnapshotV2 = Readonly<{
  path: string
  value: SessionYamlV2
  bytes: Blob
  sha256: string
}>

export type SessionYamlParseErrorCode =
  | "invalid-utf8"
  | "noncanonical-utf8"
  | "invalid-grammar"
  | "invalid-schema"

export type SessionCreateResultV1 =
  | Readonly<{ kind: "created"; snapshot: SessionSnapshotV2 }>
  | Readonly<{ kind: "idempotent"; snapshot: SessionSnapshotV2 }>
  | Readonly<{
      kind: "conflict"
      reason: "different-existing" | "identity-mismatch"
      observedSha256: string
    }>
  | Readonly<{
      kind: "corrupt"
      reason: SessionYamlParseErrorCode
      observedSha256: string
    }>

export type SessionMutationResultV1 =
  | Readonly<{ kind: "updated"; snapshot: SessionSnapshotV2 }>
  | Readonly<{ kind: "idempotent"; snapshot: SessionSnapshotV2 }>
  | Readonly<{ kind: "absent" }>
  | Readonly<{
      kind: "conflict"
      reason: "stale-hash" | "identity-mismatch" | "revision-overflow"
      observedSha256: string
    }>
  | Readonly<{
      kind: "corrupt"
      reason: SessionYamlParseErrorCode
      observedSha256: string
    }>

export type SessionIdentitySnapshotV1 = Readonly<{
  lessonId: string
  sessionId: string
}>

export type SessionCreateSnapshotV1 = Readonly<{
  identity: SessionIdentitySnapshotV1
  created: number
}>

export type SessionCasSnapshotV1 = Readonly<{
  identity: SessionIdentitySnapshotV1
  expectedSha256: string
  audioConsent: boolean
  audioStartEpoch: number | null
}>

export type SessionPostWriteVerificationPhase = "create-readback" | "cas-readback"

export class SessionYamlParseError extends Error {
  readonly code: SessionYamlParseErrorCode

  constructor(code: SessionYamlParseErrorCode, options?: ErrorOptions) {
    super("SessionYamlV2 parse failed", options)
    this.name = "SessionYamlParseError"
    this.code = code
  }
}

export class SessionPostWriteVerificationError extends Error {
  readonly phase: SessionPostWriteVerificationPhase

  constructor(phase: SessionPostWriteVerificationPhase, options?: ErrorOptions) {
    super("SessionYamlV2 post-write verification failed", options)
    this.name = "SessionPostWriteVerificationError"
    this.phase = phase
  }
}

const SESSION_ID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const SHA256_HEX = /^[0-9a-f]{64}$/
const CANONICAL_UNSIGNED_INTEGER = /^(?:0|[1-9][0-9]*)$/
const LEXICAL_NUMBER = /^-?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?$/
const TEXT_ENCODER = new TextEncoder()

function validateSessionId(value: string): string {
  if (!SESSION_ID_V4.test(value)) throw new Error("Session identity invalid")
  return value
}

function validateNonNegativeSafeInteger(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Session value invalid")
  }
  return value
}

function validateAudioPair(audioConsent: boolean, audioStartEpoch: number | null): void {
  if (typeof audioConsent !== "boolean") throw new Error("Session value invalid")
  if (audioConsent) {
    if (audioStartEpoch === null) throw new Error("Session value invalid")
    validateNonNegativeSafeInteger(audioStartEpoch)
    return
  }
  if (audioStartEpoch !== null) throw new Error("Session value invalid")
}

function validateSessionValue(value: SessionYamlV2): SessionYamlV2 {
  if (value.v !== 2) throw new Error("Session value invalid")
  const lessonId = validateRoomId(value.lessonId)
  const sessionId = validateSessionId(value.sessionId)
  const created = validateNonNegativeSafeInteger(value.created)
  const revision = validateNonNegativeSafeInteger(value.revision)
  validateAudioPair(value.audioConsent, value.audioStartEpoch)
  return Object.freeze({
    v: 2 as const,
    lessonId,
    sessionId,
    created,
    revision,
    audioConsent: value.audioConsent,
    audioStartEpoch: value.audioStartEpoch,
  })
}

export function sessionPaths(identity: LessonSessionIdentityV1): SessionPathsV1 {
  const lessonId = validateRoomId(identity.lessonId)
  const sessionId = validateSessionId(identity.sessionId)
  const root = `raw/${lessonId}/${sessionId}/` as const
  return Object.freeze({
    root,
    session: `${root}session.yaml` as const,
    audioDir: `${root}audio/` as const,
  })
}

export function serializeSessionYamlV2(value: SessionYamlV2): Uint8Array {
  const valid = validateSessionValue(value)
  return TEXT_ENCODER.encode(
    `v: 2\n` +
    `lessonId: ${valid.lessonId}\n` +
    `sessionId: ${valid.sessionId}\n` +
    `created: ${valid.created}\n` +
    `revision: ${valid.revision}\n` +
    `audioConsent: ${valid.audioConsent ? "true" : "false"}\n` +
    `audioStartEpoch: ${valid.audioStartEpoch === null ? "null" : valid.audioStartEpoch}\n`,
  )
}

function parseFailure(code: SessionYamlParseErrorCode, cause?: unknown): SessionYamlParseError {
  return cause === undefined
    ? new SessionYamlParseError(code)
    : new SessionYamlParseError(code, { cause })
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false
  }
  return true
}

function parseUnsignedInteger(token: string): number | null {
  if (!CANONICAL_UNSIGNED_INTEGER.test(token)) return null
  const value = Number(token)
  return Number.isSafeInteger(value) && value >= 0 ? value : null
}

export function parseSessionYamlV2(bytes: Uint8Array): SessionYamlV2 {
  if (!ArrayBuffer.isView(bytes) || bytes.BYTES_PER_ELEMENT !== 1) {
    throw new TypeError("Session bytes required")
  }
  const inputBytes = Uint8Array.from(bytes)
  if (inputBytes.byteLength >= 3 && inputBytes[0] === 0xef && inputBytes[1] === 0xbb && inputBytes[2] === 0xbf) {
    throw parseFailure("noncanonical-utf8")
  }

  let text: string
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(inputBytes)
  } catch (error) {
    throw parseFailure("invalid-utf8", error)
  }

  const lines = text.split("\n")
  if (lines.length !== 8 || lines[7] !== "") throw parseFailure("invalid-grammar")
  const keys = [
    "v",
    "lessonId",
    "sessionId",
    "created",
    "revision",
    "audioConsent",
    "audioStartEpoch",
  ] as const
  const tokens: string[] = []
  for (let index = 0; index < keys.length; index += 1) {
    const prefix = `${keys[index]}: `
    const line = lines[index]!
    if (!line.startsWith(prefix) || line.length === prefix.length) {
      throw parseFailure("invalid-grammar")
    }
    tokens.push(line.slice(prefix.length))
  }

  const [versionToken, lessonId, sessionId, createdToken, revisionToken, consentToken, epochToken] = tokens as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ]
  const grammarValid = (
    LEXICAL_NUMBER.test(versionToken) &&
    /^[A-Za-z0-9._-]+$/.test(lessonId) &&
    /^[A-Za-z0-9-]+$/.test(sessionId) &&
    LEXICAL_NUMBER.test(createdToken) &&
    LEXICAL_NUMBER.test(revisionToken) &&
    /^[A-Za-z]+$/.test(consentToken) &&
    (epochToken === "null" || LEXICAL_NUMBER.test(epochToken))
  )
  if (!grammarValid) throw parseFailure("invalid-grammar")

  const created = parseUnsignedInteger(createdToken)
  const revision = parseUnsignedInteger(revisionToken)
  const parsedEpoch = epochToken === "null" ? null : parseUnsignedInteger(epochToken)
  if (
    versionToken !== "2" ||
    created === null ||
    revision === null ||
    (epochToken !== "null" && parsedEpoch === null) ||
    !SESSION_ID_V4.test(sessionId) ||
    (consentToken !== "true" && consentToken !== "false")
  ) {
    throw parseFailure("invalid-schema")
  }
  try {
    validateRoomId(lessonId)
  } catch {
    throw parseFailure("invalid-schema")
  }
  const audioConsent = consentToken === "true"
  if ((audioConsent && parsedEpoch === null) || (!audioConsent && parsedEpoch !== null)) {
    throw parseFailure("invalid-schema")
  }

  const value = Object.freeze({
    v: 2 as const,
    lessonId,
    sessionId,
    created,
    revision,
    audioConsent,
    audioStartEpoch: parsedEpoch,
  })
  const canonical = serializeSessionYamlV2(value)
  if (!bytesEqual(canonical, inputBytes)) throw parseFailure("invalid-grammar")
  return value
}

export function validateSessionCreateSnapshot(snapshot: SessionCreateSnapshotV1): void {
  validateRoomId(snapshot.identity.lessonId)
  validateSessionId(snapshot.identity.sessionId)
  validateNonNegativeSafeInteger(snapshot.created)
}

export function validateSessionCasSnapshot(snapshot: SessionCasSnapshotV1): void {
  validateRoomId(snapshot.identity.lessonId)
  validateSessionId(snapshot.identity.sessionId)
  if (!SHA256_HEX.test(snapshot.expectedSha256)) throw new Error("Session hash invalid")
  validateAudioPair(snapshot.audioConsent, snapshot.audioStartEpoch)
}
