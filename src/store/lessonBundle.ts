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

/** Nome del file bundle .lesson */
export const LESSON_EXTENSION = ".lesson"
export const LESSON_MIME = "application/zip"

/** Path normalizzati dentro il bundle .lesson */
export const LESSON_PATHS = {
  SCENE: "raw/board.excalidraw",
  JOURNAL: "raw/events.jsonl",
  SESSION: "raw/session.yaml",
  AUDIO_DIR: "raw/audio/",
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
 */
export async function importLesson(
  store: WorkspaceStore,
  blob: Blob,
): Promise<void> {
  const zip = await JSZip.loadAsync(blob)

  // Prima passata: valida TUTTI i path prima di scrivere (ZipSlip protection)
  // I path devono stare dentro raw/, non contenere .. e non essere assoluti
  const entriesToWrite: Array<{ path: string; dataPromise: Promise<Blob> }> = []
  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return

    if (
      !relativePath.startsWith("raw/") ||
      relativePath.includes("..")
    ) {
      throw new Error(
        `ZipSlip: path rifiutato "${relativePath}" — deve iniziare con raw/ e non contenere ..`,
      )
    }

    entriesToWrite.push({ path: relativePath, dataPromise: zipEntry.async("blob") })
  })

  // Seconda passata: tutte le validazioni passate, scrivi
  for (const entry of entriesToWrite) {
    const data = await entry.dataPromise
    await store.write(entry.path, data)
  }
}
