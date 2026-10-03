import {
  assertFullCommitSha,
  studioProducerIdentity,
} from "../core/contracts/eventEnvelope"
import { validateProductRoomId } from "./roomPaths"
import type { FileEntry } from "./types"
import { PDF_ASSET_DIR, portablePdfId, validatePdfInventory } from "./pdfAssets"

/** Path normalizzati dentro il bundle .lesson. */
export const LESSON_PATHS = {
  MANIFEST: "manifest.json",
  SCENE: "raw/board.excalidraw",
  JOURNAL: "raw/events.jsonl",
  SESSION: "raw/session.yaml",
  SESSIONS_DIR: "raw/sessions/",
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
const OPTIONAL_ARTIFACTS_V2 = Object.freeze([...OPTIONAL_ARTIFACTS, `${LESSON_PATHS.SESSIONS_DIR}*/session.yaml`])

const OPTIONAL_ARTIFACTS_V3 = Object.freeze([...OPTIONAL_ARTIFACTS_V2, `${PDF_ASSET_DIR}*.pdf`])

type LessonBundleFileManifest = Readonly<{
  path: string
  bytes: number
  sha256: string
  required: boolean
}>

export type LessonBundleManifestV1 = Readonly<{
  bundleVersion: 1
  schemaVersion: 1 | 2 | 3
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
  sessions?: Readonly<{
    includedSessionIds: readonly string[]
    missingSessionIds: readonly string[]
  }>
  compatibility: Readonly<{
    minimumReaderSchemaVersion: 1 | 2 | 3
    migrations: readonly string[]
  }>
}>

type StagedBundleEntry = Readonly<{ path: string; data: Blob }>

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

/** This namespace contains only canonical session documents, never arbitrary files. */
export function portableSessionId(path: string): string | null {
  if (path === LESSON_PATHS.SESSIONS_DIR.slice(0,-1)) manifestError("path sessione non canonico")
  if (!path.startsWith(LESSON_PATHS.SESSIONS_DIR)) return null
  const relative = path.slice(LESSON_PATHS.SESSIONS_DIR.length)
  const parts = relative.split("/")
  if (parts.length !== 2 || !SESSION_ID_RE.test(parts[0]!) || parts[1] !== "session.yaml") {
    manifestError("path sessione non canonico")
  }
  return parts[0]!
}
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
  if (value.bundleVersion !== 1 || (value.schemaVersion !== 1 && value.schemaVersion !== 2 && value.schemaVersion !== 3)) {
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
  if (!sameOrderedStrings(optionalArtifacts, value.schemaVersion === 3 ? OPTIONAL_ARTIFACTS_V3 : value.schemaVersion === 2 ? OPTIONAL_ARTIFACTS_V2 : OPTIONAL_ARTIFACTS)) {
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
    const sessionId = portableSessionId(item.path)
    if (sessionId !== null && (value.schemaVersion === 1 || !sessionIds.includes(sessionId))) {
      manifestError("sessione fuori scope o schema non supportato")
    }
    const documentId = portablePdfId(item.path)
    if (documentId !== null && value.schemaVersion !== 3) manifestError("PDF originale richiede schema v3")
    if (documentId !== null && item.sha256 !== documentId) manifestError("impronta PDF discordante dal path")
    if ((value.schemaVersion === 2 || value.schemaVersion === 3) &&
      ![...REQUIRED_ARTIFACTS,LESSON_PATHS.LESSONOS].includes(item.path as never) &&
      !/^raw\/audio\/[^/\\]+$/.test(item.path) && sessionId === null && documentId === null) {
      manifestError("path fuori dal contratto portabile")
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

  validatePdfInventory(files)
  if (value.schemaVersion === 3 && !files.some(file => portablePdfId(file.path) !== null)) manifestError("schema v3 senza PDF originali")

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
  if (value.compatibility.minimumReaderSchemaVersion !== value.schemaVersion) {
    manifestError("minimumReaderSchemaVersion non supportato")
  }
  const migrations = stringArray(value.compatibility.migrations, "compatibility.migrations")
  let sessions: LessonBundleManifestV1["sessions"]
  if (value.schemaVersion >= 2) {
    if (!isRecord(value.sessions)) manifestError("sessions mancante o non valido")
    const includedSessionIds = stringArray(value.sessions.includedSessionIds,"sessions.includedSessionIds")
    const missingSessionIds = stringArray(value.sessions.missingSessionIds,"sessions.missingSessionIds")
    const included = files.map(file=>portableSessionId(file.path)).filter((id):id is string=>id !== null).sort()
    if (!sameOrderedStrings(includedSessionIds,included) ||
      !sameOrderedStrings(missingSessionIds,sessionIds.filter(id=>!included.includes(id)))) {
      manifestError("inventario sessioni discordante")
    }
    sessions = Object.freeze({includedSessionIds:Object.freeze(includedSessionIds),missingSessionIds:Object.freeze(missingSessionIds)})
  }

  return Object.freeze({
    bundleVersion: 1,
    schemaVersion: value.schemaVersion,
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
    ...(sessions ? {sessions} : {}),
    compatibility: Object.freeze({
      minimumReaderSchemaVersion: value.schemaVersion,
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
  const sortedSessionIds = [...sessionIds].sort()
  const includedSessionIds = files.map(file=>portableSessionId(file.path)).filter((id):id is string=>id !== null).sort()
  const schemaVersion = files.some(file => portablePdfId(file.path) !== null) ? 3 : 2
  return parseLessonBundleManifestV1({
    bundleVersion: 1,
    schemaVersion,
    lessonId,
    sessionIds: Object.freeze(sortedSessionIds),
    producer: studioProducerIdentity(),
    requiredArtifacts: REQUIRED_ARTIFACTS,
    optionalArtifacts: schemaVersion === 3 ? OPTIONAL_ARTIFACTS_V3 : OPTIONAL_ARTIFACTS_V2,
    files: Object.freeze(files),
    lessonOs: Object.freeze({
      status: lessonOsIncluded ? "included" : "missing",
      warnings: Object.freeze(lessonOsWarnings ?? defaultWarnings),
    }),
    sessions:Object.freeze({
      includedSessionIds:Object.freeze(includedSessionIds),
      missingSessionIds:Object.freeze(sortedSessionIds.filter(id=>!includedSessionIds.includes(id))),
    }),
    compatibility: Object.freeze({
      minimumReaderSchemaVersion: schemaVersion,
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
