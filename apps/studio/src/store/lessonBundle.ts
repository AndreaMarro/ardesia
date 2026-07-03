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
import type { EventLogStore } from "../lessonos/eventlog"
import { exportEventLogSnapshot } from "../lessonos/indexedDbEventLog"

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
  const allRaw = await store.list("raw/")
  const entries = new Map<string, FileEntry>()

  // Legge session.yaml per verificare il consenso audio (GDPR Mode A)
  // Se audioConsent !== true, i chunk raw/audio/ NON devono finire nel bundle
  let audioConsent: boolean | undefined
  const sessionBlob = await store.read(LESSON_PATHS.SESSION)
  if (sessionBlob) {
    const sessionText = await sessionBlob.text()
    audioConsent = parseSessionYaml(sessionText).audioConsent
  }

  // Filtra: escludi scene per-room (raw/<room>/board.excalidraw etc.)
  // e tieni solo file flat in raw/ o raw/audio/ (se consentito)
  for (const entry of allRaw) {
    // Salta scene per-room (es. raw/sala123/board.excalidraw),
    // ma tieni raw/audio/chunk-*.webm
    const parts = entry.path.split("/")
    if (parts.length >= 3 && parts[0] === "raw" && parts[2] && parts[1] !== "audio") {
      // raw/<room>/board.excalidraw → skip (verrà iniettato flat)
      continue
    }

    // GDPR: se audioConsent !== true, escludi TUTTI i file raw/audio/
    if (entry.path.startsWith(LESSON_PATHS.AUDIO_DIR) && audioConsent !== true) {
      continue
    }

    // raw/events.jsonl, raw/session.yaml, raw/audio/chunk-*.webm → keep
    entries.set(entry.path, entry)
  }

  // Inietta la scena corrente come raw/board.excalidraw (normalizzata flat)
  const sceneJson = await store.loadScene(room)
  if (sceneJson !== null) {
    entries.set(LESSON_PATHS.SCENE, {
      path: LESSON_PATHS.SCENE,
      mtime: Date.now(),
      data: new Blob([sceneJson], { type: "application/json" }),
    })
  }

  // Snapshot event-log LessonOS (best-effort: un log guasto non blocca l'export
  // della lezione — il bundle resta valido, semplicemente senza memoria didattica)
  if (lessonOsLog) {
    try {
      const snapshot = await exportEventLogSnapshot(lessonOsLog)
      if (snapshot.size > 0) {
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
 * Importa una lezione da un Blob .lesson (ZIP).
 * Scrive ogni entry sullo store.
 *
 * Validazioni PRIMA della scrittura:
 *   1. ZipSlip: path devono iniziare con raw/ e nessun segmento deve essere ".."
 *   2. Coerenza GDPR: se session.yaml riporta audioConsent=false,
 *      il bundle NON deve contenere entry raw/audio/ (dati revocati che
 *      non devono mai essere reintrodotti)
 */
export async function importLesson(
  store: WorkspaceStore,
  blob: Blob,
): Promise<void> {
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

    entriesToWrite.push({ path: relativePath, dataPromise: zipEntry.async("blob") })
  })

  // Coerenza GDPR: bundle con audioConsent=false MA con chunk audio dentro è
  // incoerente (dati revocati che non devono MAI essere reintrodotti).
  // Se session.yaml manca (legacy), audioConsent è undefined — saltiamo il check.
  if (audioConsent === false && hasAudioEntry) {
    throw new Error(
      `Bundle incoerente: session.yaml riporta audioConsent=false ma il bundle contiene file raw/audio/`,
    )
  }

  // Seconda passata: tutte le validazioni passate, scrivi
  for (const entry of entriesToWrite) {
    const data = await entry.dataPromise
    await store.write(entry.path, data)
  }
}
