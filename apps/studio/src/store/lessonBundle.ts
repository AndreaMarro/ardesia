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
import { roomPaths, validateRoomId } from "./roomPaths"

/** Nome del file bundle .lesson */
export const LESSON_EXTENSION = ".lesson"
export const LESSON_MIME = "application/zip"

/** Path normalizzati dentro il bundle .lesson */
export const LESSON_PATHS = {
  SCENE: "raw/board.excalidraw",
  JOURNAL: "raw/events.jsonl",
  SESSION: "raw/session.yaml",
  AUDIO_DIR: "raw/audio/",
  /** Snapshot event-log LessonOS (JSONL, spec #35 §4.3) — distinto dal journal. */
  LESSONOS: "raw/lessonos-events.jsonl",
} as const

function readOnlyLessonScope(
  log: EnvelopeEventLogStore,
  lessonId: string,
): EnvelopeEventLogStore {
  const rejectWrite = async (): Promise<never> => {
    throw new Error("Lesson bundle: read-only LessonOS export scope")
  }
  return {
    append: rejectWrite,
    readAll: async () => [],
    appendEnvelope: rejectWrite,
    readAllEnvelopes: () => log.readEnvelopesByLesson(lessonId),
    readEnvelopesByLesson: (requestedLessonId) => (
      requestedLessonId === lessonId ? log.readEnvelopesByLesson(lessonId) : Promise.resolve([])
    ),
    readEnvelopesBySession: (requestedLessonId, sessionId) => (
      requestedLessonId === lessonId
        ? log.readEnvelopesBySession(lessonId, sessionId)
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
  const lessonId = validateRoomId(room)
  const paths = roomPaths(lessonId)
  const entries = new Map<string, FileEntry>()

  // Legge session.yaml per verificare il consenso audio (GDPR Mode A)
  // Se audioConsent !== true, i chunk raw/audio/ NON devono finire nel bundle
  let audioConsent: boolean | undefined
  const sessionBlob = await store.read(LESSON_PATHS.SESSION)
  if (sessionBlob) {
    const sessionText = await sessionBlob.text()
    audioConsent = parseSessionYaml(sessionText).audioConsent
    addEntry(entries, LESSON_PATHS.SESSION, sessionBlob)
  }

  // L'audio resta il comportamento legacy già esistente: non è room identity e
  // questa slice non lo promuove. Il consenso OFF continua a escluderlo.
  if (audioConsent === true) {
    for (const entry of await store.list(LESSON_PATHS.AUDIO_DIR)) {
      entries.set(entry.path, entry)
    }
  }

  // Il workspace live è esclusivamente room-scoped. I tre file trasportabili
  // vengono adattati a path flat dentro lo ZIP, senza leggere residui flat o B.
  addEntry(entries, LESSON_PATHS.SCENE, await store.read(paths.scene))
  addEntry(entries, LESSON_PATHS.JOURNAL, await store.read(paths.journal))
  const storedLessonOsSnapshot = await store.read(paths.lessonOsSnapshot)

  // Snapshot canonico v2 e limitato alla lezione. Un log v1 non viene proiettato:
  // perdere event/session/producer identity sarebbe un falso export canonico.
  let lessonOsSnapshot: Blob | null = storedLessonOsSnapshot
  if (lessonOsLog && supportsEnvelopeExport(lessonOsLog)) {
    try {
      const snapshot = await exportEnvelopeEventLogSnapshot(
        readOnlyLessonScope(lessonOsLog, lessonId),
      )
      if (snapshot.size > 0) {
        lessonOsSnapshot = snapshot
      }
    } catch {
      // Il file room-scoped già persistito rimane il fallback; mai usare flat.
    }
  }
  addEntry(entries, LESSON_PATHS.LESSONOS, lessonOsSnapshot)

  // Costruisce ZIP
  const zip = new JSZip()
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
  /** importSnapshot ha fallito (snapshot malformato / scrittura): i file del
   *  bundle restano importati, l'errore è riportato qui — mai swallow. */
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

async function embeddedLessonIds(
  journal: Blob | null,
  lessonOs: Blob | null,
): Promise<Set<string>> {
  const lessonIds = new Set<string>()

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
      lessonIds.add(canonicalEnvelopeFromSnapshotRow(parsed).lessonId)
    }
  }

  return lessonIds
}

function importedPath(path: string, destinationLessonId: string | null): string {
  if (!destinationLessonId) return path
  const destination = roomPaths(destinationLessonId)
  switch (path) {
    case LESSON_PATHS.SCENE:
      return destination.scene
    case LESSON_PATHS.JOURNAL:
      return destination.journal
    case LESSON_PATHS.LESSONOS:
      return destination.lessonOsSnapshot
    default:
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
export async function importLesson(
  store: WorkspaceStore,
  blob: Blob,
  lessonOsLog?: EventLogStore | null,
  options: ImportLessonOptions = {},
): Promise<ImportLessonResult> {
  const requestedDestination = options.destinationLessonId === undefined
    ? null
    : validateRoomId(options.destinationLessonId)
  const zip = await JSZip.loadAsync(blob)

  // Prima passata: valida ogni path e raccoglie le letture, senza I/O sul workspace.
  const pendingEntries: Array<{ path: string; dataPromise: Promise<Blob> }> = []
  let hasAudioEntry = false

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return

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

    // Rileva entry audio per validazione coerenza
    if (relativePath.startsWith(LESSON_PATHS.AUDIO_DIR)) {
      hasAudioEntry = true
    }

    pendingEntries.push({ path: relativePath, dataPromise: zipEntry.async("blob") })
  })

  // Seconda passata di validazione: materializza tutte le entry prima della prima
  // write. Errori ZIP/Blob, GDPR e identità non possono lasciare scritture parziali.
  const stagedEntries: StagedZipEntry[] = await Promise.all(
    pendingEntries.map(async ({ path, dataPromise }) => ({ path, data: await dataPromise })),
  )
  const byPortablePath = new Map(stagedEntries.map((entry) => [entry.path, entry.data]))

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

  const lessonIds = await embeddedLessonIds(
    byPortablePath.get(LESSON_PATHS.JOURNAL) ?? null,
    byPortablePath.get(LESSON_PATHS.LESSONOS) ?? null,
  )
  if (lessonIds.size > 1) {
    throw new Error("Bundle identity: journal e LessonOS dichiarano lessonId differenti")
  }
  const embeddedLessonId = lessonIds.values().next().value as string | undefined
  if (embeddedLessonId !== undefined) validateRoomId(embeddedLessonId)
  if (
    requestedDestination !== null &&
    embeddedLessonId !== undefined &&
    embeddedLessonId !== requestedDestination
  ) {
    throw new Error("Bundle identity: lessonId embedded non coincide con la destinazione")
  }

  const confirmedLegacyDestination = (
    embeddedLessonId === undefined &&
    requestedDestination !== null &&
    options.legacyClaim?.userConfirmed === true
  ) ? requestedDestination : null
  const mappedDestination = requestedDestination !== null && embeddedLessonId !== undefined
    ? requestedDestination
    : confirmedLegacyDestination
  const identity: LessonImportIdentity = embeddedLessonId !== undefined
    ? { kind: "embedded", lessonId: embeddedLessonId }
    : confirmedLegacyDestination !== null
      ? { kind: "claimed", lessonId: confirmedLegacyDestination }
      : { kind: "unassigned" }

  const targetPaths = new Set<string>()
  const entriesToWrite = stagedEntries.map((entry) => {
    const path = importedPath(entry.path, mappedDestination)
    if (targetPaths.has(path)) {
      throw new Error(`Bundle identity: path destinazione duplicato (${path})`)
    }
    targetPaths.add(path)
    return { path, data: entry.data }
  })

  // Tutte le validazioni sono concluse. Solo ora il workspace può essere scritto.
  for (const entry of entriesToWrite) {
    await store.write(entry.path, entry.data)
  }

  return {
    lessonOsRestore: await restoreLessonOsSnapshot(zip, lessonOsLog),
    identity,
  }
}

/** Restore della memoria didattica dal bundle (vedi ImportLessonResult).
 *  Non lancia MAI: ogni esito, incluso il fallimento, è uno status esplicito. */
async function restoreLessonOsSnapshot(
  zip: JSZip,
  lessonOsLog: EventLogStore | null | undefined,
): Promise<LessonOsRestoreStatus> {
  if (!lessonOsLog) return { kind: "not-attempted" }
  const snapshotEntry = zip.file(LESSON_PATHS.LESSONOS)
  if (!snapshotEntry || snapshotEntry.dir) return { kind: "no-snapshot" }
  if (!supportsSnapshotRestore(lessonOsLog)) return { kind: "unsupported" }
  try {
    // Pre-check esplicito (stato leggibile) prima del guard interno di
    // importSnapshot: distingue "log non vuoto" (esito atteso, non un errore)
    // da un fallimento vero di parse/scrittura.
    const existing = supportsEnvelopeExport(lessonOsLog)
      ? await lessonOsLog.readAllEnvelopes()
      : await lessonOsLog.readAll()
    if (existing.length > 0) return { kind: "skipped-non-empty" }
    const report = await lessonOsLog.importSnapshot(await snapshotEntry.async("blob"))
    return { kind: "restored", recovered: report.recovered }
  } catch (err) {
    return { kind: "failed", error: err instanceof Error ? err.message : String(err) }
  }
}
