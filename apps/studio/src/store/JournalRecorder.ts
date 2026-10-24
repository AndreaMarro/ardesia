// MAESTRO-Studio — JournalRecorder
// Registra eventi della lavagna in events.jsonl (JSONL append-only tramite buffer+flush).
// Usa id-set diff per add/delete e version per update. Non registra move/restyle
// (Excalidraw non bumpa version per coordinate-only changes).
//
// Eventi: element.add, element.update, element.delete, t0/t1 (pointer),
//         math.insert, pdf.page.view

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"
import { roomPaths } from "./roomPaths"
import { assertAudioRecordingRef, audioAssetEvidence, audioObjectEvidence, type AudioRecordingRef } from "./audioRecording"
import {
  assertEventEnvelopeV2,
  createEventEnvelopeV2,
  studioProducerIdentity,
  type EventActor,
  type EventEnvelopeV2,
  type EventEvidence,
  type JsonObject,
  type ProducerIdentity,
} from "../core/contracts/eventEnvelope"

// --- Tipi evento journal ---

export interface JournalElementAdd {
  type: "element.add"
  element: Record<string, unknown>
}

export interface JournalElementUpdate {
  type: "element.update"
  element: Record<string, unknown>
}

export interface JournalElementDelete {
  type: "element.delete"
  elementId: string
}

export interface JournalT0 {
  type: "t0"
}

export interface JournalT1 {
  type: "t1"
}

export interface JournalMathInsert {
  type: "math.insert"
  latex: string
}

export interface JournalPdfPageView {
  type: "pdf.page.view"
  /** 1-based page number */
  page: number
  totalPages: number
  /** Stable explicit identity of the PDF/document being viewed, when known. */
  documentId?: string
  /** Human-facing filename/title only; never used for manual inference. */
  documentName?: string
}

export interface JournalAudioChunk {
  type: "audio.chunk"
  chunkIndex: number
  startEpoch: number
  endEpoch: number
}

export interface JournalAudioRecording {
  type: "audio.recording"
  recording: AudioRecordingRef
}

export type JournalEventBody =
  | JournalElementAdd
  | JournalElementUpdate
  | JournalElementDelete
  | JournalT0
  | JournalT1
  | JournalMathInsert
  | JournalPdfPageView
  | JournalAudioChunk
  | JournalAudioRecording

export type JournalEvent = JournalEventBody & {
  /** Timestamp epoch ms */
  t: number
}

export const JOURNAL_KINDS = [
  "journal.element.add",
  "journal.element.update",
  "journal.element.delete",
  "journal.pointer.down",
  "journal.pointer.up",
  "journal.math.insert",
  "journal.pdf.imported",
  "journal.pdf.page-observed",
  "journal.audio.recording",
] as const

export type JournalKind = (typeof JOURNAL_KINDS)[number]

type JournalPayloadByKind = {
  "journal.audio.recording": AudioRecordingRef
  "journal.element.add": Readonly<{ element: JsonObject }>
  "journal.element.update": Readonly<{ element: JsonObject }>
  "journal.element.delete": Readonly<{ elementId: string }>
  "journal.pointer.down": Readonly<Record<string, never>>
  "journal.pointer.up": Readonly<Record<string, never>>
  "journal.math.insert": Readonly<{ latex: string }>
  "journal.pdf.imported": Readonly<{
    page: number
    totalPages: number
    documentId: string | null
    documentName: string | null
  }>
  "journal.pdf.page-observed": Readonly<{
    page: number
    totalPages: number
    documentId: string | null
    documentName: string | null
  }>
}

type JournalEnvelopeFor<K extends JournalKind> = K extends JournalKind
  ? EventEnvelopeV2<K, JournalPayloadByKind[K]>
  : never

export type JournalEnvelopeV2 = JournalEnvelopeFor<JournalKind>

export type JournalExclusiveLock = <T>(
  name: string,
  work: () => Promise<T>,
) => Promise<T>

export interface JournalRecorderV2Options {
  store: WorkspaceStore
  journalPath: string
  identity: Readonly<{
    lessonId: string
    sessionId: string
    actor: EventActor
  }>
  producer: ProducerIdentity
  now?: () => number
  newEventId?: () => string
  withExclusiveLock?: JournalExclusiveLock
}

type BufferedJournalRow = Readonly<{
  legacy: JournalEvent
  envelope: JournalEnvelopeV2
}>

const JOURNAL_KIND_SET = new Set<string>(JOURNAL_KINDS)
const ENVELOPE_HINT_KEYS = new Set([
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
])
const JOURNAL_V1_ADAPTER_ID = "com.github.andreamarro.ardesia.studio.journal-v1-adapter"
const CANONICAL_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

function failJournal(reason: string): never {
  throw new Error(`Journal v2: ${reason}`)
}

/**
 * Excalidraw uses own `undefined` fields for absent optional metadata. Omit
 * only those object data fields at capture; the canonical validator stays
 * strict. Preserve descriptors, array holes and unsupported values so they
 * are rejected, never coerced by JSON.stringify or erased by structuredClone.
 */
function snapshotBoardElement(element: Record<string, unknown>): Record<string, unknown> {
  const copies = new WeakMap<object, object>()
  const pending: Array<{ source: object; target: object }> = []
  const snapshot = (value: unknown): unknown => {
    if (typeof value !== "object" || value === null) return value
    const isArray = Array.isArray(value)
    if (Object.getPrototypeOf(value) !== (isArray ? Array.prototype : Object.prototype)) {
      return value // Leave non-JSON prototypes for the envelope validator.
    }
    const existing = copies.get(value)
    if (existing) return existing
    const target = isArray ? [] : {}
    copies.set(value, target)
    pending.push({ source: value, target })
    return target
  }

  const result = snapshot(element) as Record<string, unknown>
  // Iterative traversal also preserves cycles for the validator's bounded walk.
  while (pending.length > 0) {
    const { source, target } = pending.pop()!
    for (const key of Reflect.ownKeys(source)) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key)
      if (!descriptor) failJournal("board element property changed during capture")
      if (
        !Array.isArray(source) && typeof key === "string" &&
        descriptor.enumerable && "value" in descriptor && descriptor.value === undefined
      ) continue
      Object.defineProperty(target, key, "value" in descriptor
        ? { ...descriptor, value: snapshot(descriptor.value) }
        : descriptor)
    }
  }
  return result
}

export function looksLikeJournalEnvelopeV2(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false
  return Object.keys(value).some((key) => ENVELOPE_HINT_KEYS.has(key))
}

// Compilata una volta sola: looksLikeRawJournalEnvelopeV2 è invocata riga per
// riga (anche da embeddedIdentity su lessonBundle), quindi ricostruire il
// pattern a ogni chiamata sarebbe un costo per-riga sull'intero journal.
const RAW_ENVELOPE_HINT_RE = new RegExp(
  `"(?:${[...ENVELOPE_HINT_KEYS]
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})"\\s*:`,
)

export function looksLikeRawJournalEnvelopeV2(raw: string): boolean {
  return RAW_ENVELOPE_HINT_RE.test(raw)
}

function assertExactKeys(value: JsonObject, keys: readonly string[], context: string): void {
  const actual = Object.keys(value)
  if (actual.length !== keys.length || actual.some((key) => !keys.includes(key))) {
    failJournal(`${context} payload has unknown or missing keys`)
  }
}

function assertNonBlank(value: unknown, context: string): asserts value is string {
  if (typeof value !== "string" || !/^\S(?:.*\S)?$/.test(value)) {
    failJournal(`${context} must be a non-blank string`)
  }
}

function assertPdfPayload(payload: JsonObject, context: string): void {
  assertExactKeys(payload, ["page", "totalPages", "documentId", "documentName"], context)
  const page = payload.page
  const totalPages = payload.totalPages
  if (
    typeof page !== "number" ||
    !Number.isInteger(page) ||
    page < 1 ||
    typeof totalPages !== "number" ||
    !Number.isInteger(totalPages) ||
    totalPages < page
  ) {
    failJournal(`${context} page/totalPages must be positive ordered integers`)
  }
  if (payload.documentId !== null) assertNonBlank(payload.documentId, `${context}.documentId`)
  if (payload.documentName !== null) assertNonBlank(payload.documentName, `${context}.documentName`)
}

export function assertJournalEnvelopeV2(value: unknown): asserts value is JournalEnvelopeV2 {
  assertEventEnvelopeV2(value)
  if (!JOURNAL_KIND_SET.has(value.kind)) {
    failJournal(`unsupported kind ${value.kind}`)
  }
  const envelope = value as JournalEnvelopeV2
  switch (envelope.kind) {
    case "journal.audio.recording": {
      assertAudioRecordingRef(envelope.payload, envelope)
      const expected = [audioAssetEvidence(envelope.payload), ...envelope.payload.objectRefs.map(audioObjectEvidence)]
      if (envelope.evidence.length !== expected.length || envelope.evidence.some((item, index) => item.ref !== expected[index])) {
        failJournal("audio evidence must match its asset digest and explicit object versions")
      }
      break
    }
    case "journal.element.add":
    case "journal.element.update": {
      assertExactKeys(envelope.payload, ["element"], envelope.kind)
      const element = envelope.payload.element
      if (typeof element !== "object" || element === null || Array.isArray(element)) {
        failJournal(`${envelope.kind}.element must be an object`)
      }
      assertNonBlank(element.id, `${envelope.kind}.element.id`)
      break
    }
    case "journal.element.delete":
      assertExactKeys(envelope.payload, ["elementId"], envelope.kind)
      assertNonBlank(envelope.payload.elementId, `${envelope.kind}.elementId`)
      break
    case "journal.pointer.down":
    case "journal.pointer.up":
      assertExactKeys(envelope.payload, [], envelope.kind)
      break
    case "journal.math.insert":
      assertExactKeys(envelope.payload, ["latex"], envelope.kind)
      if (typeof envelope.payload.latex !== "string") {
        failJournal(`${envelope.kind}.latex must be a string`)
      }
      break
    case "journal.pdf.imported":
      assertPdfPayload(envelope.payload, envelope.kind)
      break
    case "journal.pdf.page-observed": {
      assertPdfPayload(envelope.payload, envelope.kind)
      const documentId = envelope.payload.documentId
      if (documentId === null) {
        failJournal("journal.pdf.page-observed.documentId is required")
      }
      const expectedRef = `pdf:${encodeURIComponent(documentId)}#page=${envelope.payload.page}`
      if (envelope.evidence.length !== 1 || envelope.evidence[0]?.ref !== expectedRef) {
        failJournal("journal.pdf.page-observed evidence must match its document and page")
      }
      break
    }
  }

  const resolutions = new Set(envelope.evidence.map((entry) => entry.resolution))
  const legacyAdapter = envelope.producer.id === JOURNAL_V1_ADAPTER_ID
  if (legacyAdapter || envelope.kind === "journal.pdf.imported") {
    if (resolutions.size !== 1 || !resolutions.has("missing")) {
      failJournal(`${envelope.kind} evidence must remain missing`)
    }
  } else if (resolutions.size !== 1 || !resolutions.has("verified")) {
    failJournal(`${envelope.kind} evidence must be verified`)
  }
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null) return value
  const stack: object[] = [value]
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

export function freezeJournalEnvelopeV2(value: unknown): JournalEnvelopeV2 {
  assertJournalEnvelopeV2(value)
  const snapshot: unknown = structuredClone(value)
  assertJournalEnvelopeV2(snapshot)
  return deepFreeze(snapshot) as JournalEnvelopeV2
}

function canonicalRandomUuid(): string {
  const crypto = (globalThis as { crypto?: Crypto }).crypto
  if (!crypto) failJournal("Web Crypto unavailable")
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID().toLowerCase()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const withWebExclusiveLock: JournalExclusiveLock = async <T>(
  name: string,
  work: () => Promise<T>,
): Promise<T> => {
  let locks: LockManager | undefined
  try {
    locks = typeof navigator === "undefined" ? undefined : navigator.locks
  } catch {
    locks = undefined
  }
  if (!locks || typeof locks.request !== "function") {
    failJournal("exclusive lock unavailable")
  }
  return locks.request<Promise<T>>(name, { mode: "exclusive" }, (lock) => {
    if (lock === null) return Promise.reject(new Error("Journal v2: exclusive lock not granted"))
    return work()
  })
}

function pdfPayload(event: JournalPdfPageView): JournalPayloadByKind["journal.pdf.imported"] {
  return {
    page: event.page,
    totalPages: event.totalPages,
    documentId: event.documentId ?? null,
    documentName: event.documentName ?? null,
  }
}

function journalPayload<K extends JournalKind>(
  event: JournalEvent,
  kind: K,
): JournalPayloadByKind[K] {
  let payload: JsonObject
  switch (kind) {
    case "journal.audio.recording":
      if (event.type !== "audio.recording") failJournal(`${kind} requires audio.recording`)
      payload = event.recording
      break
    case "journal.element.add":
    case "journal.element.update": {
      if (event.type !== "element.add" && event.type !== "element.update") {
        failJournal(`${kind} requires an element event`)
      }
      payload = { element: event.element as JsonObject }
      break
    }
    case "journal.element.delete":
      if (event.type !== "element.delete") failJournal(`${kind} requires element.delete`)
      payload = { elementId: event.elementId }
      break
    case "journal.pointer.down":
      if (event.type !== "t0") failJournal(`${kind} requires t0`)
      payload = {}
      break
    case "journal.pointer.up":
      if (event.type !== "t1") failJournal(`${kind} requires t1`)
      payload = {}
      break
    case "journal.math.insert":
      if (event.type !== "math.insert") failJournal(`${kind} requires math.insert`)
      payload = { latex: event.latex }
      break
    case "journal.pdf.imported":
    case "journal.pdf.page-observed":
      if (event.type !== "pdf.page.view") failJournal(`${kind} requires pdf.page.view`)
      payload = pdfPayload(event)
      break
  }
  return payload as JournalPayloadByKind[K]
}

type StoredEnvelopeBinding = Readonly<{ serialized: string; envelope: JournalEnvelopeV2 }>

function indexStoredEnvelopes(text: string, lessonId: string): {
  byEventId: Map<string, StoredEnvelopeBinding>
  byIdempotencyKey: Map<string, StoredEnvelopeBinding>
} {
  const byEventId = new Map<string, StoredEnvelopeBinding>()
  const byIdempotencyKey = new Map<string, StoredEnvelopeBinding>()
  for (const line of text.split("\n")) {
    if (!line.trim()) continue
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch {
      if (looksLikeRawJournalEnvelopeV2(line)) {
        failJournal("stored V2 envelope has invalid JSON")
      }
      continue
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      continue
    }
    if (!looksLikeJournalEnvelopeV2(parsed)) continue
    assertJournalEnvelopeV2(parsed)
    if (parsed.lessonId !== lessonId) {
      failJournal(`stored lesson/source mismatch (${parsed.lessonId} != ${lessonId})`)
    }
    const binding = { serialized: line, envelope: parsed }
    const eventBinding = byEventId.get(parsed.eventId)
    if (eventBinding) {
      const reason = eventBinding.serialized === line ? "duplicate" : "conflict"
      failJournal(`stored eventId ${reason} ${parsed.eventId}`)
    }
    byEventId.set(parsed.eventId, binding)
    if (parsed.idempotencyKey !== null) {
      const keyBinding = byIdempotencyKey.get(parsed.idempotencyKey)
      if (keyBinding) {
        const reason = keyBinding.serialized === line ? "duplicate" : "conflict"
        failJournal(`stored idempotency ${reason} ${parsed.idempotencyKey}`)
      }
      byIdempotencyKey.set(parsed.idempotencyKey, binding)
    }
  }
  return { byEventId, byIdempotencyKey }
}

/**
 * JournalRecorder: cattura eventi Excalidraw e li serializza in events.jsonl.
 *
 * Strategy:
 * - Buffer in memoria per batching (flush ogni 500ms o a chiamata esplicita).
 * - Re-write completo del file a ogni flush (driver Workspace non supporta append).
 * - Clock iniettato (`now`) per testabilità deterministica.
 * - Id-set diff per add/delete (non basta version: elementi cancellati spariscono
 *   dal set onChange e non hanno più version da confrontare).
 */
export class JournalRecorder {
  private store: WorkspaceStore
  private journalPath: string
  private buffer: BufferedJournalRow[] = []
  private identity: JournalRecorderV2Options["identity"]
  private producer: ProducerIdentity
  private newEventId: () => string = canonicalRandomUuid
  private withExclusiveLock: JournalExclusiveLock
  /** id → version degli elementi visti nell'ultimo onChange */
  private prevElements: Map<string, number> = new Map()
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private now: () => number
  /** Stato pointer: true = t0 emesso, in attesa di t1 */
  private _pointerDown: boolean = false

  constructor(options: JournalRecorderV2Options) {
    if (
      typeof options !== "object" ||
      options === null ||
      !Object.prototype.hasOwnProperty.call(options, "store")
    ) {
      failJournal("canonical options object required; flat positional constructor removed")
    }
    if (options.identity.lessonId === "unassigned") {
      failJournal("unassigned is reserved for legacy flat journal recovery")
    }
    const expectedPath = roomPaths(options.identity.lessonId).journal
    if (options.journalPath !== expectedPath) {
      failJournal(`journal path must exactly match room ${options.identity.lessonId}`)
    }
    if (!CANONICAL_UUID_RE.test(options.identity.sessionId)) {
      failJournal("sessionId must be a canonical UUID")
    }
    const identity = structuredClone(options.identity)
    const producer = structuredClone(options.producer)
    this.store = options.store
    this.journalPath = expectedPath
    this.identity = deepFreeze(identity) as JournalRecorderV2Options["identity"]
    this.producer = deepFreeze(producer) as ProducerIdentity
    this.now = options.now ?? (() => Date.now())
    this.newEventId = options.newEventId ?? canonicalRandomUuid
    this.withExclusiveLock = options.withExclusiveLock ?? withWebExclusiveLock
  }

  private prepareRow(
    event: JournalEvent,
    kind: JournalKind,
    evidence: readonly EventEvidence[],
  ): BufferedJournalRow {
    const eventId = this.newEventId()
    const payload = journalPayload(event, kind)
    const envelope = createEventEnvelopeV2(
      {
        lessonId: this.identity.lessonId,
        sessionId: this.identity.sessionId,
        kind,
        actor: this.identity.actor,
        producer: this.producer,
        causationId: null,
        idempotencyKey: `journal:${this.identity.sessionId}:${eventId}`,
        evidence,
        payload: payload as JsonObject,
      },
      { eventId: () => eventId, now: () => new Date(event.t) },
    ) as unknown as JournalEnvelopeV2
    assertJournalEnvelopeV2(envelope)
    return Object.freeze({ legacy: event, envelope })
  }

  private enqueue(event: JournalEvent, kind: JournalKind, evidence: readonly EventEvidence[]): void {
    this.buffer.push(this.prepareRow(event, kind, evidence))
  }

  private verifiedBoardEvidence(ref: string): readonly EventEvidence[] {
    return [{ ref, resolution: "verified" }]
  }

  /**
   * Seeding: inizializza prevElements con lo stato corrente SENZA registrare eventi.
   * Chiamato al mount con la scena caricata da storage per evitare falsi element.add.
   */
  seed(elements: readonly Record<string, unknown>[]): void {
    this.prevElements.clear()
    for (const el of elements) {
      this.prevElements.set(el.id as string, (el.version as number) ?? 0)
    }
  }

  /**
   * Chiamato da Excalidraw onChange (elements = scene elements correnti,
   * escluse le cancellate). Rileva add/update/delete via id-set diff + version.
   */
  recordChange(elements: readonly Record<string, unknown>[]): void {
    const t = this.now()
    const currentIds = new Set<string>()
    const nextPrevElements = new Map(this.prevElements)
    const staged: BufferedJournalRow[] = []
    const stage = (
      event: JournalEvent,
      kind: JournalKind,
      evidence: readonly EventEvidence[],
    ) => staged.push(this.prepareRow(event, kind, evidence))

    for (const el of elements) {
      const id = el.id as string
      currentIds.add(id)
      const version = (el.version as number) ?? 0
      const isDeleted = (el.isDeleted as boolean) ?? false
      const prevVersion = nextPrevElements.get(id)

      if (prevVersion === undefined && !isDeleted) {
        // Nuovo elemento
        const event: JournalEvent = { t, type: "element.add", element: snapshotBoardElement(el) }
        stage(event, "journal.element.add", this.verifiedBoardEvidence(`board:${encodeURIComponent(id)}`))
      } else if (prevVersion !== undefined && isDeleted) {
        // Elemento cancellato (isDeleted flag)
        const event: JournalEvent = { t, type: "element.delete", elementId: id }
        stage(event, "journal.element.delete", this.verifiedBoardEvidence(`board:${encodeURIComponent(id)}`))
        nextPrevElements.delete(id)
        continue
      } else if (prevVersion !== undefined && version > prevVersion && !isDeleted) {
        // Aggiornamento strutturale (non move/restyle)
        const event: JournalEvent = { t, type: "element.update", element: snapshotBoardElement(el) }
        stage(event, "journal.element.update", this.verifiedBoardEvidence(`board:${encodeURIComponent(id)}`))
      }

      nextPrevElements.set(id, version)
    }

    // Rileva cancellazioni per sparizione (elemento non più nel set onChange)
    for (const [id] of nextPrevElements) {
      if (!currentIds.has(id)) {
        const event: JournalEvent = { t, type: "element.delete", elementId: id }
        stage(event, "journal.element.delete", this.verifiedBoardEvidence(`board:${encodeURIComponent(id)}`))
        nextPrevElements.delete(id)
      }
    }

    this.buffer.push(...staged)
    this.prevElements = nextPrevElements
    this.scheduleFlush()
  }

  /** t0 = pointer down (inizio tratto) */
  recordPointerDown(): void {
    if (this._pointerDown) return
    const event: JournalEvent = { t: this.now(), type: "t0" }
    this.enqueue(event, "journal.pointer.down", this.verifiedBoardEvidence("board:pointer"))
    this._pointerDown = true
    this.scheduleFlush()
  }

  /** t1 = pointer up (fine tratto) */
  recordPointerUp(): void {
    if (!this._pointerDown) return
    const event: JournalEvent = { t: this.now(), type: "t1" }
    this.enqueue(event, "journal.pointer.up", this.verifiedBoardEvidence("board:pointer"))
    this._pointerDown = false
    this.scheduleFlush()
  }

  /** Inserimento formula LaTeX */
  recordMathInsert(latex: string): void {
    const event: JournalEvent = { t: this.now(), type: "math.insert", latex }
    this.enqueue(event, "journal.math.insert", this.verifiedBoardEvidence("journal:math-input"))
    this.scheduleFlush()
  }

  /** Cambio pagina PDF visualizzata */
  recordPdfPageView(
    page: number,
    totalPages: number,
    document?: { documentId?: string; documentName?: string },
  ): void {
    const event: JournalPdfPageView & { t: number } = {
      t: this.now(),
      type: "pdf.page.view",
      page,
      totalPages,
    }
    if (document?.documentId) event.documentId = document.documentId
    if (document?.documentName) event.documentName = document.documentName
    const ref = `pdf:${encodeURIComponent(document?.documentId ?? "unidentified")}#page=${page}`
    this.enqueue(event, "journal.pdf.imported", [{ ref, resolution: "missing" }])
    this.scheduleFlush()
  }

  /** Osservazione esplicita da un viewer registrato; il chiamante fornisce il ref verificato. */
  recordPdfPageObserved(
    page: number,
    totalPages: number,
    document: { documentId?: string; documentName?: string },
    evidenceRef: string,
  ): void {
    assertNonBlank(document.documentId, "journal.pdf.page-observed.documentId")
    const expectedRef = `pdf:${encodeURIComponent(document.documentId)}#page=${page}`
    if (evidenceRef !== expectedRef) {
      failJournal("journal.pdf.page-observed evidence must match its document and page")
    }
    const event: JournalPdfPageView & { t: number } = {
      t: this.now(),
      type: "pdf.page.view",
      page,
      totalPages,
    }
    if (document.documentId) event.documentId = document.documentId
    if (document.documentName) event.documentName = document.documentName
    this.enqueue(event, "journal.pdf.page-observed", [{ ref: evidenceRef, resolution: "verified" }])
    this.scheduleFlush()
  }

  /** Marker chunk audio allineato al clock del journal (stesso epoch del recorder) */
  recordAudioChunk(_chunkIndex: number, _startEpoch: number, _endEpoch: number): void {
    failJournal("audio is outside Founder Beta canonical journal")
  }

  /** Bytes have already passed durable readback. Explicit links must resolve to recorded board versions. */
  async recordAudioRecording(recording: AudioRecordingRef): Promise<void> {
    assertAudioRecordingRef(recording, this.identity)
    await this.flush()
    if (recording.objectRefs.length > 0) {
      const blob = await this.store.read(this.journalPath)
      const stored = indexStoredEnvelopes(blob ? await blob.text() : "", this.identity.lessonId)
      for (const ref of recording.objectRefs) {
        const found = [...stored.byEventId.values()].some(({ envelope }) => (
          (envelope.kind === "journal.element.add" || envelope.kind === "journal.element.update") &&
          envelope.payload.element.id === ref.elementId && envelope.payload.element.version === ref.version
        ))
        if (!found) failJournal(`audio object/version not recorded (${ref.elementId}@${ref.version})`)
      }
    }
    this.enqueue({ t: recording.endEpoch, type: "audio.recording", recording }, "journal.audio.recording", [
      { ref: audioAssetEvidence(recording), resolution: "verified" },
      ...recording.objectRefs.map((ref) => ({ ref: audioObjectEvidence(ref), resolution: "verified" as const })),
    ])
    await this.flush()
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) return
    this.flushTimer = setTimeout(() => {
      // Write fallita dal timer: gli eventi tornano nel buffer (recovery in flush),
      // riprova al prossimo tick invece di morire in unhandled rejection
      this.flush().catch(() => this.scheduleFlush())
    }, 500)
  }

  /** Promise chain per serializzare flush concorrenti (timer + cleanup su unmount) */
  private _pendingFlush: Promise<void> = Promise.resolve()

  private async appendBatch(batch: readonly BufferedJournalRow[]): Promise<void> {
    const existingBlob = await this.store.read(this.journalPath)
    const existingBytes = existingBlob
      ? new Uint8Array(await existingBlob.arrayBuffer())
      : new Uint8Array()
    const existing = new TextDecoder().decode(existingBytes)
    const { byEventId, byIdempotencyKey } = indexStoredEnvelopes(
      existing,
      this.identity.lessonId,
    )
    const serializedRows: string[] = []
    for (const row of batch) {
      const serialized = JSON.stringify(row.envelope)
      const eventBinding = byEventId.get(row.envelope.eventId)
      const keyBinding = row.envelope.idempotencyKey === null
        ? undefined
        : byIdempotencyKey.get(row.envelope.idempotencyKey)
      if (eventBinding && eventBinding.serialized !== serialized) {
        failJournal(`eventId conflict ${row.envelope.eventId}`)
      }
      if (keyBinding && keyBinding.serialized !== serialized) {
        failJournal(`idempotency conflict ${row.envelope.idempotencyKey}`)
      }
      if (eventBinding || keyBinding) continue

      const binding = { serialized, envelope: row.envelope }
      byEventId.set(row.envelope.eventId, binding)
      if (row.envelope.idempotencyKey !== null) {
        byIdempotencyKey.set(row.envelope.idempotencyKey, binding)
      }
      serializedRows.push(serialized)
    }

    if (serializedRows.length === 0) return
    const delimiter = existingBytes.length === 0 || existingBytes.at(-1) === 0x0a ? "" : "\n"
    const appended = delimiter + serializedRows.join("\n") + "\n"
    await this.store.write(
      this.journalPath,
      new Blob(existingBlob ? [existingBlob, appended] : [appended], {
        type: "application/x-ndjson",
      }),
    )
  }

  /**
   * Flush buffer su store: legge events.jsonl esistente, concatena, riscrive.
   * Serializzato via promise chain per evitare race tra timer e flush esplicito.
   * Recovery: una write fallita rimette il batch in testa al buffer (ordine
   * preservato, retry al flush successivo) e la chain NON resta avvelenata.
   */
  async flush(): Promise<void> {
    const run = this._pendingFlush.then(async () => {
      if (this.flushTimer !== null) {
        clearTimeout(this.flushTimer)
        this.flushTimer = null
      }
      if (this.buffer.length === 0) return

      const batch = this.buffer.splice(0)
      try {
        await this.withExclusiveLock(
          `ardesia:journal:${this.identity.lessonId}`,
          () => this.appendBatch(batch),
        )
      } catch (err) {
        this.buffer.unshift(...batch)
        throw err
      }
    })
    // La chain prosegue anche dopo un errore; il caller di flush() lo vede comunque
    this._pendingFlush = run.then(
      () => {},
      () => {},
    )
    return run
  }

  /** Esposto per test: buffer corrente non ancora flushato */
  getBuffer(): JournalEvent[] {
    return this.buffer.map((row) => row.legacy)
  }

  /** Envelope canonici già mintati; slice copy per impedire mutazioni del buffer. */
  getEnvelopeBuffer(): readonly JournalEnvelopeV2[] {
    return this.buffer.map((row) => row.envelope)
  }

  /** Esposto per test: stato pointerDown interno */
  get pointerDown(): boolean {
    return this._pointerDown
  }
}

function isFiniteEpoch(value: unknown): value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) return false
  try {
    new Date(value).toISOString()
    return true
  } catch {
    return false
  }
}

/** Explicit legacy validator: malformed JSON objects never reach replay by cast. */
export function parseLegacyJournalEvent(value: unknown): JournalEvent | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (!isFiniteEpoch(row.t) || typeof row.type !== "string") return null
  const t = row.t
  switch (row.type) {
    case "element.add":
    case "element.update": {
      if (
        typeof row.element !== "object" ||
        row.element === null ||
        Array.isArray(row.element) ||
        typeof (row.element as Record<string, unknown>).id !== "string"
      ) return null
      return { t, type: row.type, element: structuredClone(row.element as Record<string, unknown>) }
    }
    case "element.delete":
      return typeof row.elementId === "string" ? { t, type: row.type, elementId: row.elementId } : null
    case "t0":
    case "t1":
      return { t, type: row.type }
    case "math.insert":
      return typeof row.latex === "string" ? { t, type: row.type, latex: row.latex } : null
    case "pdf.page.view": {
      if (
        typeof row.page !== "number" ||
        !Number.isInteger(row.page) ||
        row.page < 1 ||
        typeof row.totalPages !== "number" ||
        !Number.isInteger(row.totalPages) ||
        row.totalPages < row.page ||
        (row.documentId !== undefined && typeof row.documentId !== "string") ||
        (row.documentName !== undefined && typeof row.documentName !== "string")
      ) return null
      const event: JournalEvent = { t, type: row.type, page: row.page, totalPages: row.totalPages }
      if (typeof row.documentId === "string") event.documentId = row.documentId
      if (typeof row.documentName === "string") event.documentName = row.documentName
      return event
    }
    case "audio.chunk":
      if (
        typeof row.chunkIndex !== "number" ||
        !Number.isInteger(row.chunkIndex) ||
        typeof row.startEpoch !== "number" ||
        !Number.isFinite(row.startEpoch) ||
        typeof row.endEpoch !== "number" ||
        !Number.isFinite(row.endEpoch)
      ) return null
      return {
        t,
        type: row.type,
        chunkIndex: row.chunkIndex,
        startEpoch: row.startEpoch,
        endEpoch: row.endEpoch,
      }
    default:
      return null
  }
}

function fnv1a64(bytes: Uint8Array, seed: bigint): bigint {
  let hash = seed
  const prime = 0x100000001b3n
  for (const byte of bytes) {
    hash ^= BigInt(byte)
    hash = BigInt.asUintN(64, hash * prime)
  }
  return hash
}

function deterministicUuid(seed: string): string {
  const bytes = new TextEncoder().encode(seed)
  const first = fnv1a64(bytes, 0xcbf29ce484222325n)
  const second = fnv1a64(bytes, 0x84222325cbf29ce4n)
  const uuidBytes = new Uint8Array(16)
  for (let index = 0; index < 8; index += 1) {
    uuidBytes[index] = Number((first >> BigInt((7 - index) * 8)) & 0xffn)
    uuidBytes[index + 8] = Number((second >> BigInt((7 - index) * 8)) & 0xffn)
  }
  uuidBytes[6] = (uuidBytes[6]! & 0x0f) | 0x50
  uuidBytes[8] = (uuidBytes[8]! & 0x3f) | 0x80
  const hex = [...uuidBytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function journalSourceLessonId(source: string): string {
  if (source === PATHS.JOURNAL) return "unassigned"
  const match = /^raw\/([^/]+)\/events\.jsonl$/.exec(source)
  if (!match) failJournal(`invalid journal source ${source}`)
  const lessonId = match[1]!
  if (lessonId === "unassigned") failJournal("unassigned is reserved for the flat journal source")
  if (roomPaths(lessonId).journal !== source) failJournal(`invalid journal source ${source}`)
  return lessonId
}

function legacyMapping(event: JournalEvent): {
  kind: JournalKind
  payload: JsonObject
} | null {
  switch (event.type) {
    case "element.add":
      return { kind: "journal.element.add", payload: { element: event.element as JsonObject } }
    case "element.update":
      return { kind: "journal.element.update", payload: { element: event.element as JsonObject } }
    case "element.delete":
      return { kind: "journal.element.delete", payload: { elementId: event.elementId } }
    case "t0":
      return { kind: "journal.pointer.down", payload: {} }
    case "t1":
      return { kind: "journal.pointer.up", payload: {} }
    case "math.insert":
      return { kind: "journal.math.insert", payload: { latex: event.latex } }
    case "pdf.page.view":
      return { kind: "journal.pdf.imported", payload: pdfPayload(event) }
    case "audio.chunk":
      return null
    case "audio.recording":
      return null // No legacy producer may mint a canonical recording identity.
  }
}

export function adaptLegacyJournalEvent(
  event: JournalEvent,
  source: string,
  line: number,
  rawLine: string,
): JournalEnvelopeV2 | null {
  const mapping = legacyMapping(event)
  if (!mapping) return null
  const lessonId = journalSourceLessonId(source)
  const sessionId = deterministicUuid(`journal-v1-session\0${source}`)
  const eventId = deterministicUuid(`journal-v1-event\0${source}\0${line}\0${rawLine}`)
  const baseProducer = studioProducerIdentity()
  const producer = {
    id: JOURNAL_V1_ADAPTER_ID,
    version: baseProducer.version,
    commitSha: baseProducer.commitSha,
  }
  const envelope = createEventEnvelopeV2(
    {
      lessonId,
      sessionId,
      kind: mapping.kind,
      actor: { type: "system", id: "journal-v1-adapter" },
      producer,
      causationId: null,
      idempotencyKey: `legacy:${eventId}`,
      evidence: [{
        ref: `legacy-journal:${encodeURIComponent(source)}#line=${line}`,
        resolution: "missing",
      }],
      payload: mapping.payload,
    },
    { eventId: () => eventId, now: () => new Date(event.t) },
  ) as JournalEnvelopeV2
  assertJournalEnvelopeV2(envelope)
  return envelope
}

export function toLegacyJournalEvent(envelope: JournalEnvelopeV2): JournalEvent | null {
  assertJournalEnvelopeV2(envelope)
  const t = Date.parse(envelope.occurredAt)
  switch (envelope.kind) {
    case "journal.audio.recording":
      return { t, type: "audio.recording", recording: structuredClone(envelope.payload) }
    case "journal.element.add":
      return { t, type: "element.add", element: structuredClone(envelope.payload.element) }
    case "journal.element.update":
      return { t, type: "element.update", element: structuredClone(envelope.payload.element) }
    case "journal.element.delete":
      return { t, type: "element.delete", elementId: envelope.payload.elementId }
    case "journal.pointer.down":
      return { t, type: "t0" }
    case "journal.pointer.up":
      return { t, type: "t1" }
    case "journal.math.insert":
      return { t, type: "math.insert", latex: envelope.payload.latex }
    case "journal.pdf.imported":
      return null
    case "journal.pdf.page-observed": {
      const event: JournalEvent = {
        t,
        type: "pdf.page.view",
        page: envelope.payload.page,
        totalPages: envelope.payload.totalPages,
      }
      if (envelope.payload.documentId !== null) event.documentId = envelope.payload.documentId
      if (envelope.payload.documentName !== null) event.documentName = envelope.payload.documentName
      return event
    }
  }
}
