// MAESTRO-Studio — WorkspaceStore
// Punto di accesso unico allo storage. Seleziona il driver migliore disponibile:
//   FSA (File System Access) → localStorage (cache/fallback) → bundle export/import.
// La fonte di verità è la cartella FSA (o il bundle .lesson). localStorage è CACHE.

import { type WorkspaceDriver, type FileEntry, PATHS, type StorageMode } from "./types"
import { localStorageDriver, type LocalStorageDriver } from "./drivers/localStorage"
import { createFSADriver } from "./drivers/fsa"
import { createBundleBlob, parseBundleBlob } from "./zipBundle"
import { exportLesson as buildLessonExport, importLesson as parseLessonImport } from "./lessonBundle"

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

  /** Tenta inizializzazione col driver migliore. Chiede la cartella all'utente se FSA disponibile. */
  async init(): Promise<StorageMode> {
    const fsa = createFSADriver()
    if (fsa.available()) {
      const ok = await fsa.init()
      if (ok) {
        this.driver = fsa
        this._mode = "fsa"
        return "fsa"
      }
    }
    // Fallback a localStorage (sempre disponibile)
    this.driver = this.fallback
    this._mode = "localStorage"
    return "localStorage"
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

  async exportLesson(room: string): Promise<Blob> {
    return buildLessonExport(this, room)
  }

  async importLessonBlob(blob: Blob): Promise<void> {
    await parseLessonImport(this, blob)
  }
}

/** Istanza singleton globale */
export const workspaceStore = new WorkspaceStore()
