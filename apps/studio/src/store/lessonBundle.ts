// MAESTRO-Studio — LessonBundle (.lesson ZIP format)
// Esporta la lezione come ZIP con struttura raw/ immutabile:
//   raw/events.jsonl
//   raw/session.yaml
//   raw/board.excalidraw
//   raw/audio/chunk-{N}.webm  (solo se esistenti)
//
// Usa JSZip per creare un vero file ZIP (.lesson) che il Mini può
// processare via unzip. Dipendenza ~27KB gzip (~100KB minified)
// giustificata: il formato .lesson serve come contenitore portabile
// per il push offline al Mini; un JSONL+base64 non è unzip-abile
// con tool di sistema.
//
// Vedi anche: zipBundle.ts (formato JSONL+base64 legacy per compatibilità)

import JSZip from "jszip"
import { PDF_ASSET_DIR, PDF_ASSET_LIMITS, pdfAssetPath, portablePdfId, validatePdfAsset, validatePdfInventory } from "./pdfAssets"

// JSZip 3 exposes this stream on ZipObject; its bundled types omit the method.
declare module "jszip" {
  interface JSZipObject { internalStream(type: "uint8array"): JSZipStreamHelper<Uint8Array> }
}

function boundedZipBlob(entry: JSZip.JSZipObject, limit: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array<ArrayBuffer>[] = []
    let size = 0
    let stopped = false
    const stream = entry.internalStream("uint8array")
    stream.on("data", chunk => {
      if (stopped) return
      size += chunk.byteLength
      if (size > limit) {
        stopped = true
        stream.pause()
        chunks.length = 0
        reject(new Error("Bundle PDF: limite di decompressione superato"))
      } else chunks.push(Uint8Array.from(chunk))
    }).on("error", reject).on("end", () => { if (!stopped) resolve(new Blob(chunks)) }).resume()
  })
}
import type { WorkspaceStore } from "./WorkspaceStore"
import type { FileEntry } from "./types"
import { parseSessionYaml } from "./AudioRecorder"
import {
  assertLessonOsEnvelopePayload,
  type AnyEventEnvelopeV2,
  type EnvelopeEventLogStore,
  type EventLogStore,
} from "../lessonos/eventlog"
import type { RecoveryReport } from "../lessonos/indexedDbEventLog"
import { exportEnvelopeEventLogSnapshot } from "../lessonos/indexedDbEventLog"
import {
  assertEventEnvelopeV2,
  assertFounderBetaAuthority,
} from "../core/contracts/eventEnvelope"
import {
  assertJournalEnvelopeV2,
  looksLikeRawJournalEnvelopeV2,
} from "./JournalRecorder"
import {
  LESSON_PATHS,
  assertRequiredLessonBundleEntries,
  buildLessonBundleManifest,
  parseLessonBundleManifestV1,
  portableSessionId,
  sameOrderedStrings,
  verifyLessonBundleManifestPayload,
  type LessonBundleManifestV1,
} from "./lessonBundleManifest"
import {
  LESSON_IMPORT_TRANSACTION_ROOT,
  abandonStagedLessonImport,
  commitLessonImportWorkspace,
  finalizeLessonImport,
  lessonImportWorkspaceMatchesNext,
  prepareLessonImport,
  readPendingLessonImport,
  rollbackLessonImport,
  stagedLessonImportSource,
  type PendingLessonImport,
} from "./lessonImportTransaction"
import { roomPaths, validateProductRoomId } from "./roomPaths"
import { parseSessionYamlV2, sessionPaths } from "./sessionState"

export { LESSON_PATHS } from "./lessonBundleManifest"

/** Nome del file bundle .lesson */
export const LESSON_EXTENSION = ".lesson"
export const LESSON_MIME = "application/zip"

function readOnlyLessonScope(
  log: EnvelopeEventLogStore,
  lessonId: string,
): EnvelopeEventLogStore {
  const rejectWrite = async (): Promise<never> => {
    throw new Error("Lesson bundle: read-only LessonOS export scope")
  }
  const readScope = async () => {
    const events = await log.readEnvelopesByLesson(lessonId)
    let previousSeq = 0
    return events.map((event, index) => {
      // seq addresses the source database, which can contain other lessons.
      // The portable log gets its own contiguous positions; canonical event
      // identity, evidence and payload remain unchanged. Never repair invalid
      // source ordering or accept events outside the requested lesson.
      if (event.lessonId !== lessonId || !Number.isSafeInteger(event.seq) || event.seq <= previousSeq) {
        throw new Error("Lesson bundle: invalid LessonOS export scope or sequence")
      }
      previousSeq = event.seq
      return { ...event, seq: index + 1 }
    })
  }
  return {
    append: rejectWrite,
    readAll: async () => [],
    appendEnvelope: rejectWrite,
    readAllEnvelopes: readScope,
    readEnvelopesByLesson: (requestedLessonId) => (
      requestedLessonId === lessonId ? readScope() : Promise.resolve([])
    ),
    readEnvelopesBySession: (requestedLessonId, sessionId) => (
      requestedLessonId === lessonId
        ? readScope().then(events => events.filter(event => event.sessionId === sessionId))
        : Promise.resolve([])
    ),
  }
}

function supportsEnvelopeExport(log: EventLogStore): log is EnvelopeEventLogStore {
  const candidate = log as Partial<EnvelopeEventLogStore>
  return (
    typeof candidate.readAllEnvelopes === "function" &&
    typeof candidate.readEnvelopesByLesson === "function" &&
    typeof candidate.readEnvelopesBySession === "function"
  )
}

/**
 * Sessione sintetizzata quando la lezione non ne ha ancora una persistita.
 * Deterministica (created fisso) perché l'export deve restare idempotente:
 * export → import → export produce gli stessi byte.
 */
const DEFAULT_SESSION_YAML = "v: 1\ncreated: 0\naudioConsent: false\n"
/** Archive provenance only: this is not a canonical session document. */
export const SHARED_VIEWER_SESSION_YAML = DEFAULT_SESSION_YAML + "# ardesia-archive: shared-viewer-snapshot.v1\n# Remote event history was not transferred.\n"
export const SHARED_VIEWER_HISTORY_WARNING = "Shared viewer copy: remote event history was not transferred; included events, if any, are local."

function addEntry(
  entries: Map<string, FileEntry>,
  path: string,
  data: Blob | null,
  mtime = Date.now(),
): void {
  if (!data) return
  entries.set(path, { path, data, mtime })
}

/**
 * Esporta la lezione corrente come Blob .lesson (ZIP).
 *
 * Strategy:
 *   - Elenca tutti i file raw/ dallo store
 *   - Esclude scene per-room (raw/{room}/board.excalidraw) — la scena
 *     corrente viene iniettata flat come raw/board.excalidraw
 *   - Costruisce una Map per-path per dedup (l'iniettato vince)
 *   - Crea ZIP via JSZip e restituisce Blob
 */
export async function exportLesson(
  store: WorkspaceStore,
  room: string,
  /**
   * Event-log LessonOS opzionale (spec #35 §4.3: l'export è l'unica durabilità
   * VERA). Se fornito e non vuoto, il suo snapshot JSONL entra nel bundle come
   * raw/lessonos-events.jsonl. Il restore nell'event-log (importSnapshot) è
   * fase successiva: qui il file viaggia nel bundle e sopravvive come raw/.
   */
  lessonOsLog?: EventLogStore | null,
): Promise<Blob> {
  const lessonId = validateProductRoomId(room)
  const paths = roomPaths(lessonId)
  const entries = new Map<string, FileEntry>()

  // Legge session.yaml per verificare il consenso audio (GDPR Mode A)
  // Se audioConsent !== true, i chunk raw/audio/ NON devono finire nel bundle.
  // La sessione è room-scoped come gli altri artefatti: leggere il path flat
  // legacy trasporterebbe nel bundle di A la sessione (e il consenso) di B.
  let audioConsent: boolean | undefined
  let sharedViewerCopy = false
  const sessionBlob = await store.read(paths.session)
  if (sessionBlob) {
    const sessionText = await sessionBlob.text()
    sharedViewerCopy = sessionText === SHARED_VIEWER_SESSION_YAML
    audioConsent = parseSessionYaml(sessionText).audioConsent
    addEntry(entries, LESSON_PATHS.SESSION, sessionBlob)
  } else {
    // Nessuna sessione persistita per questa lezione: il consenso è assente,
    // non ignoto. Sintetizza il default esplicito invece di far fallire un
    // artefatto obbligatorio su un file flat scritto da un'altra lezione.
    audioConsent = false
    addEntry(entries, LESSON_PATHS.SESSION, new Blob([DEFAULT_SESSION_YAML], {
      type: "text/yaml",
    }))
  }

  // L'audio non è ancora promosso a room identity nella UI, ma il suo path
  // resta room-scoped: un chunk registrato in B non deve uscire nel bundle di A.
  // Il consenso OFF continua a escluderlo.
  if (audioConsent === true) {
    for (const entry of await store.list(paths.audioDir)) {
      const portablePath = `${LESSON_PATHS.AUDIO_DIR}${entry.path.slice(paths.audioDir.length)}`
      entries.set(portablePath, { ...entry, path: portablePath })
    }
  }

  // Il workspace live è esclusivamente room-scoped. I tre file trasportabili
  // vengono adattati a path flat dentro lo ZIP, senza leggere residui flat o B.
  addEntry(entries, LESSON_PATHS.SCENE, await store.read(paths.scene))
  addEntry(entries, LESSON_PATHS.JOURNAL, await store.read(paths.journal))
  const storedLessonOsSnapshot = await store.read(paths.lessonOsSnapshot)

  // Snapshot canonico v2 e limitato alla lezione. Un log v1 non viene proiettato:
  // perdere event/session/producer identity sarebbe un falso export canonico.
  //
  // Autorità live (F-01): quando un canonical live log è fornito, il suo stato
  // è autorevole. Un errore di lettura live fallisce visibile (mai fallback
  // silenzioso allo snapshot archiviato); uno stato live vuoto e canonico
  // significa memoria corrente vuota — non resuscita fatti archiviati.
  let lessonOsSnapshot: Blob | null = storedLessonOsSnapshot
  let lessonOsWarnings: readonly string[] | undefined
  if (lessonOsLog && supportsEnvelopeExport(lessonOsLog)) {
    const snapshot = await exportEnvelopeEventLogSnapshot(
      readOnlyLessonScope(lessonOsLog, lessonId),
    )
    if (snapshot.size > 0) {
      lessonOsSnapshot = snapshot
    } else {
      lessonOsSnapshot = null
      lessonOsWarnings = ["live canonical LessonOS state is empty; stored snapshot not resurrected"]
    }
  }
  addEntry(entries, LESSON_PATHS.LESSONOS, lessonOsSnapshot)

  // Carry existing canonical sessions byte-for-byte. Missing historical
  // documents remain missing; an export must not invent their provenance.
  const sourceRoot = `raw/${lessonId}/`
  for (const entry of await store.list(sourceRoot)) {
    if (entry.path === paths.session || !entry.path.endsWith("/session.yaml")) continue
    const portablePath = `${LESSON_PATHS.SESSIONS_DIR}${entry.path.slice(sourceRoot.length)}`
    portableSessionId(portablePath) // rejects malformed/nested session paths
    entries.set(portablePath,{...entry,path:portablePath})
  }

  const documentsRoot = `raw/${lessonId}/documents/`
  const documents = await store.list(documentsRoot)
  validatePdfInventory(documents.map(entry => ({ path: PDF_ASSET_DIR + entry.path.slice(documentsRoot.length), bytes: entry.data.size })))
  for (const entry of documents) {
    const path = PDF_ASSET_DIR + entry.path.slice(documentsRoot.length)
    await validatePdfAsset(entry.data, portablePdfId(path)!)
    entries.set(path, { ...entry, path })
  }

  assertRequiredLessonBundleEntries(entries)

  const identity = await embeddedIdentity(
    entries.get(LESSON_PATHS.JOURNAL)?.data ?? null,
    entries.get(LESSON_PATHS.LESSONOS)?.data ?? null,
    [...entries.values()],
  )
  for (const embeddedLessonId of identity.lessonIds) {
    if (embeddedLessonId !== lessonId) {
      throw new Error("Lesson bundle: payload identity differs from requested lesson")
    }
  }
  if (sharedViewerCopy) lessonOsWarnings = [...(lessonOsWarnings ?? (lessonOsSnapshot ? [] : ["LessonOS snapshot missing"])), SHARED_VIEWER_HISTORY_WARNING]
  const manifest = await buildLessonBundleManifest(lessonId, [...identity.sessionIds], entries, lessonOsWarnings)

  // Costruisce ZIP
  const zip = new JSZip()
  zip.file(LESSON_PATHS.MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  for (const [, entry] of entries) {
    zip.file(entry.path, entry.data, { date: new Date(entry.mtime) })
  }

  const zipBlob = await zip.generateAsync({ type: "blob", mimeType: LESSON_MIME })
  return zipBlob
}

/**
 * Esito del restore dell'event-log LessonOS all'import (P32 R10).
 * Sempre esplicito, mai silenzioso: il chiamante sa PERCHÉ la memoria
 * didattica è stata o non è stata ripristinata.
 */
export type LessonOsRestoreStatus =
  /** Snapshot presente, log vuoto, restore riuscito (seq originali preservati). */
  | { kind: "restored"; recovered: number }
  /** Il bundle non contiene raw/lessonos-events.jsonl (export senza memoria). */
  | { kind: "no-snapshot" }
  /** Il chiamante non ha fornito un log: restore non richiesto. */
  | { kind: "not-attempted" }
  /** Il log fornito non supporta importSnapshot (fallback InMemory). */
  | { kind: "unsupported" }
  /** Il log ha già eventi: restore SOLO su log vuoto (mai merge — i seq collidono). */
  | { kind: "skipped-non-empty" }
  /** importSnapshot ha fallito (snapshot malformato / scrittura): il workspace
   *  viene ripristinato byte per byte e l'errore resta esplicito. */
  | { kind: "failed"; error: string }

export type LessonImportIdentity =
  | Readonly<{ kind: "embedded"; lessonId: string }>
  | Readonly<{ kind: "claimed"; lessonId: string }>
  | Readonly<{ kind: "unassigned" }>

export interface ImportLessonOptions {
  /** Destinazione selezionata esplicitamente dal file-import UI. */
  destinationLessonId?: string
  /** Necessaria soltanto per assegnare un bundle legacy privo di envelope v2. */
  legacyClaim?: Readonly<{ userConfirmed: true }>
}

export interface ImportLessonResult {
  lessonOsRestore: LessonOsRestoreStatus
  identity: LessonImportIdentity
}

export type LessonImportPreview = Readonly<{
  kind: "validated"
  identity: LessonImportIdentity
  manifest: LessonBundleManifestV1 | null
  lessonOs: "included" | "missing"
  files: readonly Readonly<{
    sourcePath: string
    targetPath: string
    bytes: number
    action: "create" | "replace"
  }>[]
  pendingRecovery: Readonly<Pick<PendingLessonImport, "id" | "phase" | "createdAt">> | null
  commitReady: boolean
}>

/** Log capace di restore da snapshot (oggi: IndexedDbEventLog). L'interfaccia
 *  EventLogStore resta minima (append+readAll); il restore è una capacità
 *  opzionale rilevata a runtime, MAI richiesta ai fallback. */
type SnapshotRestorableLog = EventLogStore & {
  importSnapshot(snapshot: Blob): Promise<RecoveryReport>
}

function supportsSnapshotRestore(log: EventLogStore): log is SnapshotRestorableLog {
  return typeof (log as Partial<SnapshotRestorableLog>).importSnapshot === "function"
}

type StagedZipEntry = Readonly<{ path: string; data: Blob }>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function canonicalEnvelopeFromSnapshotRow(value: unknown): AnyEventEnvelopeV2 {
  if (!isRecord(value)) throw new Error("Bundle identity: riga LessonOS v2 non-oggetto")
  const seq = value.seq
  if (!Number.isInteger(seq) || (seq as number) < 1) {
    throw new Error("Bundle identity: seq LessonOS v2 non valido")
  }
  const { seq: _seq, ...envelope } = value
  void _seq
  assertEventEnvelopeV2(envelope)
  assertFounderBetaAuthority(envelope)
  assertLessonOsEnvelopePayload(envelope.kind, envelope.payload)
  return envelope
}

async function embeddedIdentity(
  journal: Blob | null,
  lessonOs: Blob | null,
  entries: readonly StagedZipEntry[] = [],
): Promise<Readonly<{ lessonIds: Set<string>; sessionIds: Set<string> }>> {
  const lessonIds = new Set<string>()
  const sessionIds = new Set<string>()

  for (const entry of entries) {
    const pathSessionId = portableSessionId(entry.path)
    if (pathSessionId === null) continue
    const doc = parseSessionYamlV2(new Uint8Array(await entry.data.arrayBuffer()))
    if (doc.sessionId !== pathSessionId) throw new Error("Bundle identity: sessionId non coincide con il path")
    lessonIds.add(doc.lessonId)
    sessionIds.add(doc.sessionId)
  }

  if (journal) {
    for (const rawLine of (await journal.text()).split("\n")) {
      if (!rawLine || !looksLikeRawJournalEnvelopeV2(rawLine)) continue
      let parsed: unknown
      try {
        parsed = JSON.parse(rawLine)
      } catch {
        throw new Error("Bundle identity: journal v2 malformato")
      }
      assertJournalEnvelopeV2(parsed)
      lessonIds.add(parsed.lessonId)
      sessionIds.add(parsed.sessionId)
    }
  }

  if (lessonOs) {
    for (const rawLine of (await lessonOs.text()).split("\n")) {
      if (!rawLine) continue
      let parsed: unknown
      try {
        parsed = JSON.parse(rawLine)
      } catch {
        if (rawLine.includes('"schemaVersion"')) {
          throw new Error("Bundle identity: snapshot LessonOS v2 malformato")
        }
        continue
      }
      if (!isRecord(parsed) || !("schemaVersion" in parsed)) continue
      const envelope = canonicalEnvelopeFromSnapshotRow(parsed)
      lessonIds.add(envelope.lessonId)
      sessionIds.add(envelope.sessionId)
    }
  }

  return { lessonIds, sessionIds }
}

function importedPath(path: string, destinationLessonId: string | null): string {
  if (!destinationLessonId) return path
  const sessionId = portableSessionId(path)
  if (sessionId !== null) return sessionPaths({lessonId:destinationLessonId,sessionId}).session
  const documentId = portablePdfId(path)
  if (documentId !== null) return pdfAssetPath(destinationLessonId, documentId)
  const destination = roomPaths(destinationLessonId)
  switch (path) {
    case LESSON_PATHS.SCENE:
      return destination.scene
    case LESSON_PATHS.JOURNAL:
      return destination.journal
    case LESSON_PATHS.LESSONOS:
      return destination.lessonOsSnapshot
    case LESSON_PATHS.SESSION:
      return destination.session
    default:
      // L'audio segue la lezione: atterrare su raw/audio/ flat lo renderebbe
      // visibile all'export di qualunque altra lezione.
      if (path.startsWith(LESSON_PATHS.AUDIO_DIR)) {
        return `${destination.audioDir}${path.slice(LESSON_PATHS.AUDIO_DIR.length)}`
      }
      return path
  }
}

/**
 * Importa una lezione da un Blob .lesson (ZIP).
 * Scrive ogni entry sullo store e — se fornito un log restorabile — ripristina
 * la memoria didattica da raw/lessonos-events.jsonl (P32 R10).
 *
 * Validazioni PRIMA della scrittura:
 *   1. ZipSlip: path devono iniziare con raw/ e nessun segmento deve essere ".."
 *   2. Coerenza GDPR: se session.yaml riporta audioConsent=false,
 *      il bundle NON deve contenere entry raw/audio/ (dati revocati che
 *      non devono mai essere reintrodotti)
 *
 * Il restore avviene DOPO la scrittura dei file (bundle valido) ed è
 * SECONDARIO: un restore fallito non compromette l'import del board; l'esito
 * è sempre esplicito in ImportLessonResult.lessonOsRestore.
 * NOTA onestà: importSnapshot accetta solo log VUOTI (semantica disaster-recovery,
 * indexedDbEventLog.ts). Nella Room live il log contiene già lesson.started al
 * mount ⇒ l'esito atteso lì è "skipped-non-empty"; il flusso di recovery
 * esplicito (destroy con conferma utente → restore) è una slice successiva.
 */
async function runLessonImport(
  store: WorkspaceStore,
  blob: Blob,
  lessonOsLog: EventLogStore | null | undefined,
  options: ImportLessonOptions,
  mode: "preview",
): Promise<LessonImportPreview>
async function runLessonImport(
  store: WorkspaceStore,
  blob: Blob,
  lessonOsLog: EventLogStore | null | undefined,
  options: ImportLessonOptions,
  mode: "commit",
): Promise<ImportLessonResult>
async function runLessonImport(
  store: WorkspaceStore,
  blob: Blob,
  lessonOsLog: EventLogStore | null | undefined,
  options: ImportLessonOptions,
  mode: "preview" | "commit",
): Promise<LessonImportPreview | ImportLessonResult> {
  if (mode === "commit") await recoverPendingLessonImport(store, lessonOsLog)
  const requestedDestination = options.destinationLessonId === undefined
    ? null
    : validateProductRoomId(options.destinationLessonId)
  const zip = await JSZip.loadAsync(blob)

  // Prima passata: valida ogni path e raccoglie le letture, senza I/O sul workspace.
  const pendingEntries: Array<{ path: string; entry: JSZip.JSZipObject }> = []
  let manifestEntry: JSZip.JSZipObject | null = null
  let hasAudioEntry = false

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return

    if (zipEntry.unsafeOriginalName !== undefined && zipEntry.unsafeOriginalName !== relativePath) {
      throw new Error("ZipSlip: path normalizzato non ammesso")
    }

    if (relativePath === LESSON_PATHS.MANIFEST) {
      manifestEntry = zipEntry
      return
    }

    // ZipSlip: per-segment check (non includes("..") che blocca filename
    // legittimi come "raw/notes..2024.jsonl")
    if (
      !relativePath.startsWith("raw/") ||
      relativePath.split("/").some((s) => s === "..")
    ) {
      throw new Error(
        `ZipSlip: path rifiutato "${relativePath}" — deve iniziare con raw/ e non contenere .. come segmento`,
      )
    }
    portablePdfId(relativePath)
    if (/^raw\/[^/]+\/documents(?:\/|$)/.test(relativePath)) {
      throw new Error("Bundle PDF: path workspace non portabile")
    }
    const portableSession = portableSessionId(relativePath)
    if (portableSession === null && /^raw\/[^/]+\/[^/]+\/session\.yaml$/.test(relativePath)) {
      // Old readers accepted arbitrary raw files. A canonical workspace path
      // must never bypass the portable namespace and overwrite another lesson.
      throw new Error("Bundle identity: path sessione workspace non portabile")
    }

    // Rileva entry audio per validazione coerenza
    if (relativePath.startsWith(LESSON_PATHS.AUDIO_DIR)) {
      hasAudioEntry = true
    }

    pendingEntries.push({ path: relativePath, entry: zipEntry })
  })

  let manifest: LessonBundleManifestV1 | null = null
  if (manifestEntry !== null) {
    let parsedManifest: unknown
    try {
      parsedManifest = JSON.parse(await (await boundedZipBlob(manifestEntry, 1024 * 1024)).text())
    } catch {
      throw new Error("Bundle manifest: JSON malformato o oltre il limite")
    }
    manifest = parseLessonBundleManifestV1(parsedManifest)
    if (requestedDestination !== null && manifest.lessonId !== requestedDestination) {
      throw new Error("Bundle manifest: lessonId non coincide con la destinazione")
    }
  }
  const pdfEntries = pendingEntries.filter(entry => portablePdfId(entry.path) !== null)
  if (pdfEntries.length > 0 && manifest?.schemaVersion !== 3) {
    throw new Error("Bundle PDF: originali richiedono manifest v3")
  }
  if (pdfEntries.length > PDF_ASSET_LIMITS.count) throw new Error("Bundle PDF: più di 32 documenti")

  // All validation and bounded PDF decompression precede any workspace write.
  const stagedEntries: StagedZipEntry[] = []
  let pdfBytes = 0
  for (const { path, entry } of pendingEntries) {
    const documentId = portablePdfId(path)
    const data = documentId === null
      ? await entry.async("blob")
      : await boundedZipBlob(entry, Math.min(PDF_ASSET_LIMITS.perFile, PDF_ASSET_LIMITS.total - pdfBytes))
    if (documentId !== null) {
      await validatePdfAsset(data, documentId)
      pdfBytes += data.size
    }
    stagedEntries.push({ path, data })
  }
  const byPortablePath = new Map(stagedEntries.map((entry) => [entry.path, entry.data]))
  if (manifest !== null) await verifyLessonBundleManifestPayload(manifest, stagedEntries)

  // Legge session.yaml dal bundle (se presente) per validare coerenza GDPR.
  // Se manca (bundle legacy pre-T2), il consenso è ignoto e il controllo storico
  // resta invariato.
  let audioConsent: boolean | undefined
  const sessionBlob = byPortablePath.get(LESSON_PATHS.SESSION)
  if (sessionBlob) audioConsent = parseSessionYaml(await sessionBlob.text()).audioConsent

  // Coerenza GDPR: bundle con audioConsent=false MA con chunk audio dentro è
  // incoerente (dati revocati che non devono MAI essere reintrodotti).
  // Se session.yaml manca (legacy), audioConsent è undefined — saltiamo il check.
  if (audioConsent === false && hasAudioEntry) {
    throw new Error(
      `Bundle incoerente: session.yaml riporta audioConsent=false ma il bundle contiene file raw/audio/`,
    )
  }

  const { lessonIds, sessionIds } = await embeddedIdentity(
    byPortablePath.get(LESSON_PATHS.JOURNAL) ?? null,
    byPortablePath.get(LESSON_PATHS.LESSONOS) ?? null,
    stagedEntries,
  )
  if (manifest === null && (lessonIds.size > 0 || sessionIds.size > 0)) {
    throw new Error("Bundle manifest mancante: downgrade di payload canonico v2 rifiutato")
  }
  if (manifest !== null && !sameOrderedStrings(manifest.sessionIds, [...sessionIds].sort())) {
    throw new Error("Bundle identity: manifest sessionIds e payload canonico sono discordanti")
  }
  if (lessonIds.size > 1) {
    throw new Error("Bundle identity: journal e LessonOS dichiarano lessonId differenti")
  }
  const embeddedLessonId = lessonIds.values().next().value as string | undefined
  if (embeddedLessonId !== undefined) validateProductRoomId(embeddedLessonId)
  if (
    manifest !== null &&
    embeddedLessonId !== undefined &&
    manifest.lessonId !== embeddedLessonId
  ) {
    throw new Error("Bundle identity: manifest e payload dichiarano lessonId differenti")
  }
  if (
    requestedDestination !== null &&
    embeddedLessonId !== undefined &&
    embeddedLessonId !== requestedDestination
  ) {
    throw new Error("Bundle identity: lessonId embedded non coincide con la destinazione")
  }

  const authoritativeLessonId = embeddedLessonId ?? manifest?.lessonId

  const confirmedLegacyDestination = (
    authoritativeLessonId === undefined &&
    requestedDestination !== null &&
    options.legacyClaim?.userConfirmed === true
  ) ? requestedDestination : null
  const mappedDestination = authoritativeLessonId !== undefined
    ? requestedDestination ?? authoritativeLessonId
    : confirmedLegacyDestination
  const identity: LessonImportIdentity = authoritativeLessonId !== undefined
    ? { kind: "embedded", lessonId: authoritativeLessonId }
    : confirmedLegacyDestination !== null
      ? { kind: "claimed", lessonId: confirmedLegacyDestination }
      : { kind: "unassigned" }

  const targetPaths = new Set<string>()
  const entriesToWrite = stagedEntries.map((entry) => {
    const path = importedPath(entry.path, mappedDestination)
    if (
      path === LESSON_IMPORT_TRANSACTION_ROOT ||
      path.startsWith(`${LESSON_IMPORT_TRANSACTION_ROOT}/`)
    ) {
      throw new Error("Lesson import transaction: target riservato")
    }
    if (targetPaths.has(path)) {
      throw new Error(`Bundle identity: path destinazione duplicato (${path})`)
    }
    targetPaths.add(path)
    return { path, data: entry.data }
  })

  if (pdfEntries.length > 0 && mappedDestination !== null) {
    const root = `raw/${mappedDestination}/documents/`
    const union = new Map((await store.list(root)).map(entry => {
      const path = PDF_ASSET_DIR + entry.path.slice(root.length)
      return [path, {path, bytes: entry.data.size}]
    }))
    // Import adds assets to an existing lesson; files omitted by the bundle
    // survive. Apply limits to that resulting inventory, deduplicating hashes.
    for (const entry of stagedEntries) {
      if (portablePdfId(entry.path) !== null) union.set(entry.path, {path: entry.path, bytes: entry.data.size})
    }
    validatePdfInventory([...union.values()])
  }

  for (const entry of stagedEntries) {
    const documentId = portablePdfId(entry.path)
    if (documentId === null) continue
    const previous = await store.read(importedPath(entry.path, mappedDestination))
    if (previous) await validatePdfAsset(previous, documentId)
  }

  if (mode === "preview") {
    const pending = await readPendingLessonImport(store)
    const files = await Promise.all(entriesToWrite.map(async (entry, index) => ({
      sourcePath: stagedEntries[index]!.path,
      targetPath: entry.path,
      bytes: entry.data.size,
      action: await store.read(entry.path) === null ? "create" as const : "replace" as const,
    })))
    return {
      kind: "validated",
      identity,
      manifest,
      lessonOs: byPortablePath.has(LESSON_PATHS.LESSONOS) ? "included" : "missing",
      files,
      pendingRecovery: pending === null
        ? null
        : { id: pending.id, phase: pending.phase, createdAt: pending.createdAt },
      commitReady: pending === null,
    }
  }

  // Tutte le validazioni sono concluse. Stage e backup durevoli precedono ogni
  // mutazione dei target; un errore di commit viene compensato byte per byte.
  const transaction = await prepareLessonImport(
    store,
    entriesToWrite.map((entry, index) => ({
      sourcePath: stagedEntries[index]!.path,
      targetPath: entry.path,
      data: entry.data,
    })),
  )

  let restoringTransaction: PendingLessonImport
  try {
    restoringTransaction = await commitLessonImportWorkspace(store, transaction)
  } catch (error) {
    const pending = await readPendingLessonImport(store) ?? transaction
    try {
      await rollbackLessonImport(store, pending)
    } catch (rollbackError) {
      throw new Error(
        `Lesson import transaction: commit fallito e recovery pendente: ${
          rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
        }`,
        { cause: error },
      )
    }
    throw new Error(
      `Lesson import transaction: commit fallito, rollback verificato: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    )
  }

  const lessonOsRestore = await restoreLessonOsSnapshot(
    await stagedLessonImportSource(store, restoringTransaction, LESSON_PATHS.LESSONOS),
    lessonOsLog,
  )
  if (lessonOsRestore.kind === "failed") {
    await rollbackLessonImport(store, restoringTransaction)
    return { lessonOsRestore, identity }
  }

  try {
    await finalizeLessonImport(store, restoringTransaction)
  } catch {
    // Il workspace e il log sono gia verificati: il record in fase restoring
    // permette al prossimo avvio di completare idempotentemente il cleanup.
  }

  return {
    lessonOsRestore,
    identity,
  }
}

export async function importLesson(
  store: WorkspaceStore,
  blob: Blob,
  lessonOsLog?: EventLogStore | null,
  options: ImportLessonOptions = {},
): Promise<ImportLessonResult> {
  return runLessonImport(store, blob, lessonOsLog, options, "commit")
}

/** Valida e descrive un bundle senza creare stage, recuperare transazioni o
 * mutare target/cache. Una recovery pendente rende il commit non pronto ma
 * resta osservabile, cosi la UI puo richiederne l'esecuzione esplicita. */
export async function previewLessonImport(
  store: WorkspaceStore,
  blob: Blob,
  options: ImportLessonOptions = {},
): Promise<LessonImportPreview> {
  return runLessonImport(store, blob, null, options, "preview")
}

/**
 * Riprende una transazione lasciata da un arresto precedente. Lo staging non
 * ancora committato viene abbandonato senza toccare la lezione; un commit
 * incompleto viene compensato; la fase restore viene completata idempotentemente.
 */
export async function recoverPendingLessonImport(
  store: WorkspaceStore,
  lessonOsLog?: EventLogStore | null,
): Promise<LessonOsRestoreStatus | null> {
  const transaction = await readPendingLessonImport(store)
  if (!transaction) return null

  if (transaction.phase === "staging" || transaction.phase === "prepared") {
    await abandonStagedLessonImport(store, transaction)
    return null
  }
  if (
    transaction.phase === "committing" ||
    transaction.phase === "rollback-needed"
  ) {
    await rollbackLessonImport(store, transaction)
    return null
  }
  if (
    transaction.phase === "committed" ||
    transaction.phase === "rolled-back" ||
    transaction.phase === "aborted"
  ) {
    await finalizeLessonImport(store, transaction)
    return null
  }

  if (!await lessonImportWorkspaceMatchesNext(store, transaction)) {
    await rollbackLessonImport(store, transaction)
    return null
  }
  const status = await restoreLessonOsSnapshot(
    await stagedLessonImportSource(store, transaction, LESSON_PATHS.LESSONOS),
    lessonOsLog,
  )
  if (status.kind === "failed") {
    await rollbackLessonImport(store, transaction)
    return status
  }
  try {
    await finalizeLessonImport(store, transaction)
  } catch {
    // Lascia il record attivo per un retry futuro; i target sono gia verificati.
  }
  return status
}

/** Restore della memoria didattica dal bundle (vedi ImportLessonResult).
 *  Non lancia MAI: ogni esito, incluso il fallimento, è uno status esplicito. */
async function restoreLessonOsSnapshot(
  snapshot: Blob | null,
  lessonOsLog: EventLogStore | null | undefined,
): Promise<LessonOsRestoreStatus> {
  if (!lessonOsLog) return { kind: "not-attempted" }
  if (!snapshot) return { kind: "no-snapshot" }
  if (!supportsSnapshotRestore(lessonOsLog)) return { kind: "unsupported" }
  try {
    // Pre-check esplicito (stato leggibile) prima del guard interno di
    // importSnapshot: distingue "log non vuoto" (esito atteso, non un errore)
    // da un fallimento vero di parse/scrittura.
    const existing = supportsEnvelopeExport(lessonOsLog)
      ? await lessonOsLog.readAllEnvelopes()
      : await lessonOsLog.readAll()
    if (existing.length > 0) return { kind: "skipped-non-empty" }
    const report = await lessonOsLog.importSnapshot(snapshot)
    return { kind: "restored", recovered: report.recovered }
  } catch (err) {
    return { kind: "failed", error: err instanceof Error ? err.message : String(err) }
  }
}
