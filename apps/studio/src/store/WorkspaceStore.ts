// MAESTRO-Studio — WorkspaceStore
// Punto di accesso unico allo storage. Seleziona il driver migliore disponibile:
//   FSA (File System Access) → localStorage (cache/fallback) → bundle export/import.
// La fonte di verità è la cartella FSA (o il bundle .lesson). localStorage è CACHE.

import { type WorkspaceDriver, type FileEntry, PATHS, type StorageMode, type StorageUsage, type LessonMeta, type RoomInfo } from "./types"
import { localStorageDriver, type LocalStorageDriver } from "./drivers/localStorage"
import { createFSADriver } from "./drivers/fsa"
import { createBundleBlob, parseBundleBlob } from "./zipBundle"
import { exportLesson as buildLessonExport, importLesson as parseLessonImport } from "./lessonBundle"
import type { EventLogStore } from "../lessonos/eventlog"

export interface WorkspaceState {
  mode: StorageMode
  /** room id attuale (usato per chiave legacy localStorage) */
  room: string
}

/** Costruisce il path della scena per una specifica room */
function roomScenePath(room: string): string {
  return `raw/${room}/board.excalidraw`
}

export class WorkspaceStore {
  private driver: WorkspaceDriver
  private fallback: LocalStorageDriver
  private _mode: StorageMode = "unavailable"

  constructor() {
    this.fallback = localStorageDriver
    this.driver = this.fallback
  }

  get mode(): StorageMode {
    return this._mode
  }

  /**
   * Inizializzazione SILENZIOSA: parte con localStorage (sempre disponibile).
   * MAI chiedere la cartella FSA qui — connectFolder() lo fa su gesto utente.
   */
  async init(): Promise<StorageMode> {
    this.driver = this.fallback
    this._mode = "localStorage"
    return "localStorage"
  }

  /**
   * Chiede all'utente una cartella FSA (showDirectoryPicker) e migra i dati
   * esistenti da localStorage. DA CHIAMARE SOLO SU GESTO UTENTE.
   */
  async connectFolder(): Promise<boolean> {
    const fsa = createFSADriver()
    if (!fsa.available()) return false
    const ok = await fsa.init()
    if (!ok) return false

    // Migra i dati esistenti da localStorage → FSA
    const existingEntries = await this.fallback.list()
    for (const entry of existingEntries) {
      if (entry.path.startsWith("raw/")) {
        await fsa.write(entry.path, entry.data)
      }
    }

    // Passa a FSA
    this.driver = fsa
    this._mode = "fsa"
    return true
  }

  // --- OPERAZIONI FILE ---

  async read(path: string): Promise<Blob | null> {
    return this.driver.read(path)
  }

  async write(path: string, data: Blob): Promise<void> {
    await this.driver.write(path, data)
  }

  async delete(path: string): Promise<void> {
    await this.driver.delete(path)
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    return this.driver.list(prefix)
  }

  /** Uso/quota storage del driver attivo. null = quota non applicabile (es. FSA) */
  async storageUsage(): Promise<StorageUsage | null> {
    if (!this.driver.usage) return null
    return this.driver.usage()
  }

  // --- OPERAZIONI SCENA (Excalidraw) ---

  async saveScene(room: string, sceneJson: string): Promise<void> {
    const blob = new Blob([sceneJson], { type: "application/json" })
    // Path per-room: raw/<room>/board.excalidraw — due room NON si sovrascrivono
    await this.write(roomScenePath(room), blob)
    // Sync su localStorage come cache
    this.fallback.setLegacyScene(room, sceneJson)
  }

  async loadScene(room: string): Promise<string | null> {
    // Prima: tenta dal driver primario con path per-room
    const blob = await this.read(roomScenePath(room))
    if (blob) {
      return await blob.text()
    }
    // Fallback: scena esistente su FSA al vecchio path (migrazione)
    const legacyBlob = await this.read(PATHS.SCENE)
    if (legacyBlob) {
      return await legacyBlob.text()
    }
    // Fallback: legacy localStorage (chiave studio-scene:{room})
    return this.fallback.getLegacyScene(room)
  }

  /** Path del file meta.json per una room */
  private roomMetaPath(room: string): string {
    return `raw/${room}/meta.json`
  }

  // --- OPERAZIONI META (nome lezione) ---

  async saveMeta(room: string, meta: LessonMeta): Promise<void> {
    const json = JSON.stringify(meta)
    await this.write(this.roomMetaPath(room), new Blob([json], { type: "application/json" }))
  }

  async loadMeta(room: string): Promise<LessonMeta | null> {
    const blob = await this.read(this.roomMetaPath(room))
    if (!blob) return null
    try {
      const parsed = JSON.parse(await blob.text()) as LessonMeta
      if (parsed && typeof parsed === "object" && parsed.v === 1 && typeof parsed.name === "string") {
        return parsed
      }
    } catch { /* malformed — return null */ }
    return null
  }

  /**
   * Elenca tutte le room disponibili (da raw/<room>/board.excalidraw)
   * e arricchisce con meta.json se presente, altrimenti fallback-id.
   * Ordine: mtime discendente.
   */
  async listRooms(): Promise<RoomInfo[]> {
    const all = await this.list("raw/")
    const rooms = new Map<string, { mtime: number }>()

    for (const entry of all) {
      const parts = entry.path.split("/")
      if (parts.length >= 3 && parts[0] === "raw" && parts[2] === "board.excalidraw") {
        const room = parts[1]
        const existing = rooms.get(room)
        if (!existing || entry.mtime > existing.mtime) {
          rooms.set(room, { mtime: entry.mtime })
        }
      }
    }

    const result: RoomInfo[] = []
    for (const [room, info] of rooms) {
      const meta = await this.loadMeta(room)
      result.push({
        v: 1,
        room,
        name: meta?.name ?? room,
        createdAt: meta?.createdAt ?? info.mtime,
        mtime: info.mtime,
      })
    }

    result.sort((a, b) => b.mtime - a.mtime)
    return result
  }

  // --- SESSION ---

  async saveSessionYaml(yaml: string): Promise<void> {
    await this.write(PATHS.SESSION, new Blob([yaml], { type: "text/yaml" }))
  }

  // --- EXPORT/IMPORT BUNDLE ---

  async exportBundle(): Promise<Blob> {
    const entries = await this.list()
    return createBundleBlob(entries)
  }

  async importBundle(blob: Blob): Promise<void> {
    const entries = await parseBundleBlob(blob)
    for (const entry of entries) {
      await this.write(entry.path, entry.data)
    }
  }

  // --- EXPORT/IMPORT .lesson (ZIP) ---

  async exportLesson(room: string, lessonOsLog?: EventLogStore | null): Promise<Blob> {
    return buildLessonExport(this, room, lessonOsLog)
  }

  async importLessonBlob(blob: Blob): Promise<void> {
    await parseLessonImport(this, blob)
  }
}

/** Istanza singleton globale */
export const workspaceStore = new WorkspaceStore()
