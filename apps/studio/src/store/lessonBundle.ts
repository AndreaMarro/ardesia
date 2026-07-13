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
import type { AppendedEvent, EventLogStore } from "../lessonos/eventlog"
import type { RecoveryReport } from "../lessonos/indexedDbEventLog"
import { roomPaths } from "./roomPaths"

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

const WINDOWS_RESERVED_SEGMENT = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i

function isPortableSegment(segment: string): boolean {
  return segment.length > 0
    && segment.length <= 255
    && segment === segment.trim()
    && !segment.endsWith(".")
    && !/[<>:"|?*]/.test(segment)
    && !WINDOWS_RESERVED_SEGMENT.test(segment)
}

function portablePayloadPath(relativePath: string): string {
  const portablePath = relativePath.startsWith("raw/") ? relativePath.slice(4) : ""
  const segments = portablePath.split("/")
  if (
    portablePath.length === 0
    || relativePath.includes("\\")
    || [...relativePath].some((char) => {
      const code = char.charCodeAt(0)
      return code <= 31 || code === 127
    })
    || relativePath.length > 1024
    || segments.some((segment) => segment === "." || segment === ".." || !isPortableSegment(segment))
  ) {
    throw new Error(
      `ZipSlip: path rifiutato "${relativePath}" — deve essere un path portabile sotto raw/`,
    )
  }
  return portablePath
}

function roomSessionSnapshot(events: readonly AppendedEvent[], room: string): Blob | null {
  const sorted = [...events].sort((a, b) => a.seq - b.seq)
  let startIndex = -1
  for (let index = 0; index < sorted.length; index += 1) {
    const event = sorted[index]
    if (event.kind === "lesson.started" && event.room === room) startIndex = index
  }
  if (startIndex < 0) return null

  let endIndex = sorted.length
  for (let index = startIndex + 1; index < sorted.length; index += 1) {
    const event = sorted[index]
    if (event.kind === "lesson.started") {
      endIndex = index
      break
    }
    if (event.kind === "lesson.ended" && event.room === room) {
      endIndex = index + 1
      break
    }
  }

  const session = sorted.slice(startIndex, endIndex)
  if (session.some((event) =>
    ("room" in event && event.room !== undefined && event.room !== room)
    || ("fromRoom" in event && event.fromRoom !== undefined && event.fromRoom !== room),
  )) {
    return null
  }
  const portableSession = session.map((event, index) => ({ ...event, seq: index + 1 }))
  return new Blob([portableSession.map((event) => JSON.stringify(event)).join("\n") + "\n"], {
    type: "application/x-ndjson",
  })
}

/**
 * Esporta la lezione corrente come Blob .lesson (ZIP).
 *
 * Strategy:
 *   - Elenca esclusivamente raw/<room>/ nello store
 *   - Converte i path della stanza nel formato portabile flat raw/ del bundle
 *   - Costruisce una Map per-path per dedup (lo snapshot LessonOS vince)
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
  const paths = roomPaths(room)
  const roomRoot = `raw/${room}/`
  const roomEntries = await store.list(roomRoot)
  const entries = new Map<string, FileEntry>()

  // Legge session.yaml per verificare il consenso audio (GDPR Mode A)
  // Se audioConsent !== true, i chunk raw/audio/ NON devono finire nel bundle
  let audioConsent: boolean | undefined
  const sessionBlob = await store.read(paths.session)
  if (sessionBlob) {
    const sessionText = await sessionBlob.text()
    audioConsent = parseSessionYaml(sessionText).audioConsent
  }

  for (const entry of roomEntries) {
    if (!entry.path.startsWith(roomRoot)) continue
    if (entry.path.startsWith(paths.audioDir) && audioConsent !== true) {
      continue
    }
    const portablePath = `raw/${entry.path.slice(roomRoot.length)}`
    portablePayloadPath(portablePath)
    entries.set(portablePath, {
      path: portablePath,
      mtime: entry.mtime,
      data: entry.data,
    })
  }

  // Snapshot event-log LessonOS (best-effort: un log guasto non blocca l'export
  // della lezione — il bundle resta valido, semplicemente senza memoria didattica)
  if (lessonOsLog) {
    try {
      const snapshot = roomSessionSnapshot(await lessonOsLog.readAll(), room)
      if (snapshot !== null && snapshot.size > 0) {
        entries.set(LESSON_PATHS.LESSONOS, {
          path: LESSON_PATHS.LESSONOS,
          mtime: Date.now(),
          data: snapshot,
        })
      }
    } catch {
      // log illeggibile: l'export procede senza snapshot
    }
  }

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

export interface ImportLessonResult {
  lessonOsRestore: LessonOsRestoreStatus
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
  room: string,
  lessonOsLog?: EventLogStore | null,
): Promise<ImportLessonResult> {
  roomPaths(room)
  const roomRoot = `raw/${room}/`
  if ((await store.list(roomRoot)).length > 0) {
    throw new Error(`Import rifiutato: la stanza "${room}" non vuota`)
  }
  const zip = await JSZip.loadAsync(blob)

  // Legge session.yaml dal bundle (se presente) per validare coerenza GDPR
  // Il parse è best-effort: se il file manca (bundle legacy pre-T2), saltiamo
  // la validazione coerenza audio — non possiamo giudicare un consenso assente.
  let audioConsent: boolean | undefined
  const sessionEntry = zip.file(LESSON_PATHS.SESSION)
  if (sessionEntry && !sessionEntry.dir) {
    const sessionText = await sessionEntry.async("text")
    audioConsent = parseSessionYaml(sessionText).audioConsent
  }

  // Prima passata: valida TUTTI i path + rileva entry audio (tutto prima di scrivere)
  const entriesToWrite: Array<{ path: string; dataPromise: Promise<Blob> }> = []
  let hasAudioEntry = false

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return

    // ZipSlip: per-segment check (non includes("..") che blocca filename
    // legittimi come "raw/notes..2024.jsonl")
    const portablePath = portablePayloadPath(relativePath)

    // Rileva entry audio per validazione coerenza
    if (relativePath.startsWith(LESSON_PATHS.AUDIO_DIR)) {
      hasAudioEntry = true
    }

    entriesToWrite.push({ path: `${roomRoot}${portablePath}`, dataPromise: zipEntry.async("blob") })
  })

  // Coerenza GDPR: bundle con audioConsent=false MA con chunk audio dentro è
  // incoerente (dati revocati che non devono MAI essere reintrodotti).
  // Se session.yaml manca (legacy), audioConsent è undefined — saltiamo il check.
  if (audioConsent === false && hasAudioEntry) {
    throw new Error(
      `Bundle incoerente: session.yaml riporta audioConsent=false ma il bundle contiene file raw/audio/`,
    )
  }

  // Materializza ogni Blob prima della prima write: anche un errore di lettura ZIP
  // deve lasciare lo store completamente intatto.
  const resolvedEntries = await Promise.all(entriesToWrite.map(async (entry) => ({
    path: entry.path,
    data: await entry.dataPromise,
  })))

  // Seconda passata: tutte le validazioni e letture passate, scrivi nella stanza scelta.
  for (const entry of resolvedEntries) {
    await store.write(entry.path, entry.data)
  }

  return { lessonOsRestore: await restoreLessonOsSnapshot(zip, lessonOsLog) }
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
    if ((await lessonOsLog.readAll()).length > 0) return { kind: "skipped-non-empty" }
    const report = await lessonOsLog.importSnapshot(await snapshotEntry.async("blob"))
    return { kind: "restored", recovered: report.recovered }
  } catch (err) {
    return { kind: "failed", error: err instanceof Error ? err.message : String(err) }
  }
}
