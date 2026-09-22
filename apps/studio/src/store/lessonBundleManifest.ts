import {
  assertFullCommitSha,
  studioProducerIdentity,
} from "../core/contracts/eventEnvelope"
import { validateProductRoomId } from "./roomPaths"
import type { FileEntry } from "./types"

/** Path normalizzati dentro il bundle .lesson. */
export const LESSON_PATHS = {
  MANIFEST: "manifest.json",
  SCENE: "raw/board.excalidraw",
  JOURNAL: "raw/events.jsonl",
  SESSION: "raw/session.yaml",
  AUDIO_DIR: "raw/audio/",
  /** Snapshot event-log LessonOS — distinto dal journal. */
  LESSONOS: "raw/lessonos-events.jsonl",
} as const

const REQUIRED_ARTIFACTS = Object.freeze([
  LESSON_PATHS.SCENE,
  LESSON_PATHS.JOURNAL,
  LESSON_PATHS.SESSION,
])

const OPTIONAL_ARTIFACTS = Object.freeze([
  LESSON_PATHS.LESSONOS,
  `${LESSON_PATHS.AUDIO_DIR}*`,
])

type LessonBundleFileManifest = Readonly<{
  path: string
  bytes: number
  sha256: string
  required: boolean
}>

export type LessonBundleManifestV1 = Readonly<{
  bundleVersion: 1
  schemaVersion: 1
  lessonId: string
  sessionIds: readonly string[]
  producer: ReturnType<typeof studioProducerIdentity>
  requiredArtifacts: readonly string[]
  optionalArtifacts: readonly string[]
  files: readonly LessonBundleFileManifest[]
  lessonOs: Readonly<{
    status: "included" | "missing"
    warnings: readonly string[]
  }>
  compatibility: Readonly<{
    minimumReaderSchemaVersion: 1
    migrations: readonly string[]
  }>
}>

type StagedBundleEntry = Readonly<{ path: string; data: Blob }>

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const REVERSE_DNS_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/

function manifestError(message: string): never {
  throw new Error(`Bundle manifest: ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    manifestError(`${field} deve essere un array di stringhe`)
  }
  return [...value] as string[]
}

export function sameOrderedStrings(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index])
}

export function parseLessonBundleManifestV1(value: unknown): LessonBundleManifestV1 {
  if (!isRecord(value)) manifestError("radice non-oggetto")
  if (value.bundleVersion !== 1 || value.schemaVersion !== 1) {
    manifestError("schema non supportato")
  }
  if (typeof value.lessonId !== "string") manifestError("lessonId mancante o non valido")
  const lessonId = validateProductRoomId(value.lessonId)
  const sessionIds = stringArray(value.sessionIds, "sessionIds")
  if (sessionIds.some((sessionId) => !SESSION_ID_RE.test(sessionId))) {
    manifestError("sessionIds contiene un UUID non canonico")
  }
  if (!sameOrderedStrings(sessionIds, [...new Set(sessionIds)].sort())) {
    manifestError("sessionIds deve essere ordinato e senza duplicati")
  }

  if (!isRecord(value.producer)) manifestError("producer mancante o non valido")
  const producer = value.producer
  if (typeof producer.id !== "string" || !REVERSE_DNS_RE.test(producer.id)) {
    manifestError("producer.id deve essere reverse-DNS")
  }
  if (typeof producer.version !== "string" || !SEMVER_RE.test(producer.version)) {
    manifestError("producer.version deve essere SemVer")
  }
  try {
    assertFullCommitSha(producer.commitSha)
  } catch {
    manifestError("producer.commitSha non è uno SHA completo")
  }

  const requiredArtifacts = stringArray(value.requiredArtifacts, "requiredArtifacts")
  const optionalArtifacts = stringArray(value.optionalArtifacts, "optionalArtifacts")
  if (!sameOrderedStrings(requiredArtifacts, REQUIRED_ARTIFACTS)) {
    manifestError("requiredArtifacts non coincide con il contratto FB-5")
  }
  if (!sameOrderedStrings(optionalArtifacts, OPTIONAL_ARTIFACTS)) {
    manifestError("optionalArtifacts non coincide con il contratto FB-5")
  }

  if (!Array.isArray(value.files)) manifestError("files deve essere un array")
  const seenPaths = new Set<string>()
  const files = value.files.map((item): LessonBundleFileManifest => {
    if (!isRecord(item)) manifestError("files contiene una voce non-oggetto")
    if (typeof item.path !== "string" || !item.path.startsWith("raw/")) {
      manifestError("files contiene un path non portabile")
    }
    if (item.path.split("/").some((segment) => segment === "..")) {
      manifestError("files contiene un path con traversal")
    }
    if (seenPaths.has(item.path)) manifestError(`path duplicato (${item.path})`)
    seenPaths.add(item.path)
    if (!Number.isInteger(item.bytes) || (item.bytes as number) < 0) {
      manifestError(`bytes non valido (${item.path})`)
    }
    if (typeof item.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(item.sha256)) {
      manifestError(`SHA-256 non valido (${item.path})`)
    }
    const required = REQUIRED_ARTIFACTS.includes(item.path as never)
    if (item.required !== required) manifestError(`required incoerente (${item.path})`)
    return Object.freeze({
      path: item.path,
      bytes: item.bytes as number,
      sha256: item.sha256,
      required,
    })
  })
  if (!sameOrderedStrings(files.map((file) => file.path), [...seenPaths].sort())) {
    manifestError("files deve essere ordinato per path")
  }

  for (const requiredPath of REQUIRED_ARTIFACTS) {
    if (!seenPaths.has(requiredPath)) manifestError(`file obbligatorio mancante (${requiredPath})`)
  }

  if (!isRecord(value.lessonOs)) manifestError("lessonOs mancante o non valido")
  if (value.lessonOs.status !== "included" && value.lessonOs.status !== "missing") {
    manifestError("lessonOs.status non valido")
  }
  const warnings = stringArray(value.lessonOs.warnings, "lessonOs.warnings")
  const hasLessonOs = seenPaths.has(LESSON_PATHS.LESSONOS)
  if ((value.lessonOs.status === "included") !== hasLessonOs) {
    manifestError("lessonOs.status non coincide con l'inventario")
  }

  if (!isRecord(value.compatibility)) manifestError("compatibility mancante o non valido")
  if (value.compatibility.minimumReaderSchemaVersion !== 1) {
    manifestError("minimumReaderSchemaVersion non supportato")
  }
  const migrations = stringArray(value.compatibility.migrations, "compatibility.migrations")

  return Object.freeze({
    bundleVersion: 1,
    schemaVersion: 1,
    lessonId,
    sessionIds: Object.freeze(sessionIds),
    producer: Object.freeze({
      id: producer.id,
      version: producer.version,
      commitSha: producer.commitSha as string,
    }),
    requiredArtifacts: Object.freeze(requiredArtifacts),
    optionalArtifacts: Object.freeze(optionalArtifacts),
    files: Object.freeze(files),
    lessonOs: Object.freeze({ status: value.lessonOs.status, warnings: Object.freeze(warnings) }),
    compatibility: Object.freeze({
      minimumReaderSchemaVersion: 1,
      migrations: Object.freeze(migrations),
    }),
  })
}

export async function verifyLessonBundleManifestPayload(
  manifest: LessonBundleManifestV1,
  stagedEntries: readonly StagedBundleEntry[],
): Promise<void> {
  const byPath = new Map(stagedEntries.map((entry) => [entry.path, entry.data]))
  if (byPath.size !== stagedEntries.length) manifestError("ZIP contiene path payload duplicati")
  if (!sameOrderedStrings([...byPath.keys()].sort(), manifest.files.map((file) => file.path))) {
    manifestError("inventario payload non coincide con lo ZIP")
  }
  for (const file of manifest.files) {
    const data = byPath.get(file.path)
    if (!data) manifestError(`file inventariato mancante (${file.path})`)
    if (data.size !== file.bytes) manifestError(`integrità bytes non coincide (${file.path})`)
    if (await sha256Hex(data) !== file.sha256) {
      manifestError(`SHA-256 non coincide (${file.path})`)
    }
  }
}

export function assertRequiredLessonBundleEntries(
  entries: ReadonlyMap<string, FileEntry>,
): void {
  for (const requiredPath of REQUIRED_ARTIFACTS) {
    if (!entries.has(requiredPath)) {
      throw new Error(`Lesson bundle export: file obbligatorio mancante (${requiredPath})`)
    }
  }
}

export async function buildLessonBundleManifest(
  lessonId: string,
  sessionIds: readonly string[],
  entries: ReadonlyMap<string, FileEntry>,
  lessonOsWarnings?: readonly string[],
): Promise<LessonBundleManifestV1> {
  const required = new Set<string>(REQUIRED_ARTIFACTS)
  const files = await Promise.all([...entries.values()]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map(async (entry): Promise<LessonBundleFileManifest> => ({
      path: entry.path,
      bytes: entry.data.size,
      sha256: await sha256Hex(entry.data),
      required: required.has(entry.path),
    })))
  const lessonOsIncluded = entries.has(LESSON_PATHS.LESSONOS)
  const defaultWarnings = lessonOsIncluded ? [] : ["LessonOS snapshot missing"]
  return Object.freeze({
    bundleVersion: 1,
    schemaVersion: 1,
    lessonId,
    sessionIds: Object.freeze([...sessionIds].sort()),
    producer: studioProducerIdentity(),
    requiredArtifacts: REQUIRED_ARTIFACTS,
    optionalArtifacts: OPTIONAL_ARTIFACTS,
    files: Object.freeze(files),
    lessonOs: Object.freeze({
      status: lessonOsIncluded ? "included" : "missing",
      warnings: Object.freeze(lessonOsWarnings ?? defaultWarnings),
    }),
    compatibility: Object.freeze({
      minimumReaderSchemaVersion: 1,
      migrations: Object.freeze([]),
    }),
  })
}

async function sha256Hex(blob: Blob): Promise<string> {
  const source = new Uint8Array(await blob.arrayBuffer())
  const bytes = Uint8Array.from(source)
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}
