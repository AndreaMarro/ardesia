// MAESTRO-Studio — WorkspaceStore
// Punto di accesso unico allo storage. Seleziona il driver migliore disponibile:
//   FSA (File System Access) → localStorage (cache/fallback) → bundle export/import.
// La fonte di verità è la cartella FSA (o il bundle .lesson). localStorage è CACHE.

import { type WorkspaceDriver, type FileEntry, PATHS, type StorageMode, type StorageUsage, type LessonMeta, type RoomInfo } from "./types"
import { localStorageDriver, type LocalStorageDriver } from "./drivers/localStorage"
import { createFSADriver } from "./drivers/fsa"
import { createBundleBlob, parseBundleBlob } from "./zipBundle"
import {
  exportLesson as buildLessonExport,
  importLesson as parseLessonImport,
  previewLessonImport as buildLessonPreview,
  recoverPendingLessonImport as recoverLessonImport,
  type ImportLessonOptions,
  type ImportLessonResult,
  type LessonImportPreview,
  type LessonOsRestoreStatus,
} from "./lessonBundle"
import { roomPaths, validateRoomId } from "./roomPaths"
import type { EventLogStore } from "../lessonos/eventlog"
import {
  originLessonMutationCoordinator,
  type LessonMutationCoordinator,
  type MutationSafety,
} from "./lessonMutationLock"

export interface WorkspaceState {
  mode: StorageMode
  /** room id attuale (usato per chiave legacy localStorage) */
  room: string
}

export type WorkspaceStoreOptions = Readonly<{
  mutationCoordinator?: LessonMutationCoordinator
  createFsaDriver?: () => WorkspaceDriver
}>

export type WorkspaceCompensationOperation =
  | "connect-folder-migration"
  | "legacy-bundle-import"

export type WorkspaceRollbackFailure = Readonly<{
  path: string
  error: unknown
}>

export class WorkspaceCompensationError extends Error {
  readonly operation: WorkspaceCompensationOperation
  readonly originalCause: unknown
  readonly rollbackFailures: readonly WorkspaceRollbackFailure[]

  constructor(
    operation: WorkspaceCompensationOperation,
    originalCause: unknown,
    rollbackFailures: readonly WorkspaceRollbackFailure[],
  ) {
    const failures = Object.freeze(rollbackFailures.map(({ path, error }) => (
      Object.freeze({ path, error })
    )))
    super(`Workspace compensation failed (${operation})`, {
      cause: new AggregateError(
        [originalCause, ...failures.map(({ error }) => error)],
        "Workspace operation and rollback causes",
      ),
    })
    this.name = "WorkspaceCompensationError"
    this.operation = operation
    this.originalCause = originalCause
    this.rollbackFailures = failures
  }
}

async function snapshotWorkspacePaths(
  driver: WorkspaceDriver,
  paths: Iterable<string>,
): Promise<Map<string, Blob | null>> {
  const previousByPath = new Map<string, Blob | null>()
  for (const path of paths) {
    if (!previousByPath.has(path)) {
      previousByPath.set(path, await driver.read(path))
    }
  }
  return previousByPath
}

async function compensateWorkspacePaths(
  operation: WorkspaceCompensationOperation,
  driver: WorkspaceDriver,
  touchedPaths: readonly string[],
  previousByPath: ReadonlyMap<string, Blob | null>,
  originalCause: unknown,
): Promise<never> {
  const rollbackFailures: WorkspaceRollbackFailure[] = []
  for (let index = touchedPaths.length - 1; index >= 0; index -= 1) {
    const path = touchedPaths[index]!
    try {
      if (!previousByPath.has(path)) {
        throw new Error("Workspace rollback snapshot missing")
      }
      const previous = previousByPath.get(path)
      if (previous) await driver.write(path, previous)
      else await driver.delete(path)
    } catch (error) {
      rollbackFailures.push({ path, error })
    }
  }
  if (rollbackFailures.length > 0) {
    throw new WorkspaceCompensationError(operation, originalCause, rollbackFailures)
  }
  throw originalCause
}

async function writeEntriesWithCompensation(
  operation: WorkspaceCompensationOperation,
  driver: WorkspaceDriver,
  entries: Iterable<Pick<FileEntry, "path" | "data">>,
): Promise<void> {
  const materializedEntries = Array.from(entries)
  const previousByPath = await snapshotWorkspacePaths(
    driver,
    materializedEntries.map(({ path }) => path),
  )
  const touchedPaths: string[] = []
  const touched = new Set<string>()
  try {
    for (const entry of materializedEntries) {
      if (!touched.has(entry.path)) {
        touched.add(entry.path)
        touchedPaths.push(entry.path)
      }
      await driver.write(entry.path, entry.data)
    }
  } catch (operationError) {
    await compensateWorkspacePaths(
      operation,
      driver,
      touchedPaths,
      previousByPath,
      operationError,
    )
  }
}

export class WorkspaceStore {
  private driver: WorkspaceDriver
  private fallback: LocalStorageDriver
  private readonly mutationCoordinator: LessonMutationCoordinator
  private readonly createFsaDriver: () => WorkspaceDriver
  private pendingFolderConnection: Promise<boolean> | null = null
  private _mode: StorageMode = "unavailable"

  constructor(options: WorkspaceStoreOptions = {}) {
    this.fallback = localStorageDriver
    this.driver = this.fallback
    this.mutationCoordinator = options.mutationCoordinator ?? originLessonMutationCoordinator
    this.createFsaDriver = options.createFsaDriver ?? createFSADriver
  }

  get mode(): StorageMode {
    return this._mode
  }

  get mutationSafety(): MutationSafety {
    return this.mutationCoordinator.safety
  }

  /**
   * Inizializzazione SILENZIOSA: parte con localStorage (sempre disponibile).
   * MAI chiedere la cartella FSA qui — connectFolder() lo fa su gesto utente.
   */
  async init(): Promise<StorageMode> {
    if (this._mode === "fsa") return "fsa"
    this.driver = this.fallback
    this._mode = "localStorage"
    return "localStorage"
  }

  /**
   * Chiede all'utente una cartella FSA (showDirectoryPicker) e migra i dati
   * esistenti da localStorage. DA CHIAMARE SOLO SU GESTO UTENTE.
   */
  connectFolder(): Promise<boolean> {
    if (this._mode === "fsa") return Promise.resolve(true)
    if (this.pendingFolderConnection) return this.pendingFolderConnection

    const fsa = this.createFsaDriver()
    if (!fsa.available()) return Promise.resolve(false)

    // showDirectoryPicker() richiede transient user activation: init() deve
    // essere invocato sincronicamente dal gesto, prima di attendere Web Locks.
    let initialization: Promise<boolean>
    try {
      initialization = fsa.init()
    } catch (error) {
      return Promise.reject(error)
    }

    const connection = initialization.then(async (ok) => {
      if (!ok) return false
      return this.mutationCoordinator.withWorkspaceExclusive(async () => {
        if (this._mode === "fsa") return true

        // Migra i dati esistenti da localStorage → FSA. La porta driver resta
        // interna alla lease workspace-exclusive: non riacquisire path lock.
        const existingEntries = (await this.fallback.list()).filter(
          ({ path }) => path.startsWith("raw/"),
        )
        await writeEntriesWithCompensation(
          "connect-folder-migration",
          fsa,
          existingEntries,
        )

        // Passa a FSA soltanto dopo la migrazione completata.
        this.driver = fsa
        this._mode = "fsa"
        return true
      })
    })
    this.pendingFolderConnection = connection
    void connection.then(
      () => { if (this.pendingFolderConnection === connection) this.pendingFolderConnection = null },
      () => { if (this.pendingFolderConnection === connection) this.pendingFolderConnection = null },
    )
    return connection
  }

  // --- OPERAZIONI FILE ---

  async read(path: string): Promise<Blob | null> {
    return this.driver.read(path)
  }

  async write(path: string, data: Blob): Promise<void> {
    await this.mutationCoordinator.withPathMutation(path, () => this.driver.write(path, data))
  }

  async delete(path: string): Promise<void> {
    await this.mutationCoordinator.withPathMutation(path, () => this.driver.delete(path))
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
    const paths = roomPaths(room)
    const blob = new Blob([sceneJson], { type: "application/json" })
    // Path per-room: raw/<room>/board.excalidraw — due room NON si sovrascrivono
    await this.write(paths.scene, blob)
    // Sync su localStorage come cache
    this.fallback.setLegacyScene(room, sceneJson)
  }

  async loadScene(room: string): Promise<string | null> {
    const paths = roomPaths(room)
    // Prima: tenta dal driver primario con path per-room
    const blob = await this.read(paths.scene)
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

  // --- OPERAZIONI META (nome lezione) ---

  async saveMeta(room: string, meta: LessonMeta): Promise<void> {
    const paths = roomPaths(room)
    const json = JSON.stringify(meta)
    await this.write(paths.meta, new Blob([json], { type: "application/json" }))
  }

  async loadMeta(room: string): Promise<LessonMeta | null> {
    const paths = roomPaths(room)
    const blob = await this.read(paths.meta)
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
      if (parts.length !== 3 || parts[0] !== "raw" || parts[2] !== "board.excalidraw") continue
      const room = parts[1]
      try {
        if (entry.path !== roomPaths(room).scene) continue
      } catch {
        continue
      }
      const existing = rooms.get(room)
      if (!existing || entry.mtime > existing.mtime) {
        rooms.set(room, { mtime: entry.mtime })
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
    await this.mutationCoordinator.withWorkspaceExclusive(async () => {
      // Porta interna già sotto lease: this.write() riacquisirebbe il lock.
      const driver = this.driver
      await writeEntriesWithCompensation(
        "legacy-bundle-import",
        driver,
        entries,
      )
    })
  }

  // --- EXPORT/IMPORT .lesson (ZIP) ---

  async exportLesson(room: string, lessonOsLog?: EventLogStore | null): Promise<Blob> {
    const validRoom = validateRoomId(room)
    return buildLessonExport(this, validRoom, lessonOsLog)
  }

  async importLessonBlob(blob: Blob, lessonOsLog?: EventLogStore | null): Promise<ImportLessonResult> {
    return parseLessonImport(this, blob, lessonOsLog)
  }

  async importLessonBlobForRoom(
    blob: Blob,
    room: string,
    lessonOsLog?: EventLogStore | null,
    legacyClaim: NonNullable<ImportLessonOptions["legacyClaim"]> = { userConfirmed: true },
  ): Promise<ImportLessonResult> {
    const validRoom = validateRoomId(room)
    const result = await parseLessonImport(this, blob, lessonOsLog, {
      destinationLessonId: validRoom,
      legacyClaim,
    })
    const importedScene = await this.read(roomPaths(validRoom).scene)
    if (importedScene) this.fallback.setLegacyScene(validRoom, await importedScene.text())
    return result
  }

  async previewLessonBlobForRoom(
    blob: Blob,
    room: string,
    legacyClaim?: NonNullable<ImportLessonOptions["legacyClaim"]>,
  ): Promise<LessonImportPreview> {
    const validRoom = validateRoomId(room)
    return buildLessonPreview(this, blob, {
      destinationLessonId: validRoom,
      ...(legacyClaim ? { legacyClaim } : {}),
    })
  }

  async recoverPendingLessonImport(
    lessonOsLog?: EventLogStore | null,
  ): Promise<LessonOsRestoreStatus | null> {
    return recoverLessonImport(this, lessonOsLog)
  }
}

/** Istanza singleton globale */
export const workspaceStore = new WorkspaceStore()
