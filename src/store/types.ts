// MAESTRO-Studio — WorkspaceStore types
// Interfaccia storage UNICA: localStorage (cache) + File System Access (vero) + bundle fallback.

export interface FileEntry {
  path: string       // relativa a root (es. "raw/events.jsonl")
  data: Blob         // il contenuto
  mtime: number      // epoch ms (ultima modifica)
}

/** Uso storage del driver (per indicatore quota in UI) */
export interface StorageUsage {
  usedBytes: number
  quotaBytes: number
}

export interface WorkspaceDriver {
  /** Nome leggibile del driver (per debug/log) */
  readonly name: string

  /** Uso/quota storage. Assente quando la quota non è applicabile (es. FSA = disco vero) */
  usage?(): Promise<StorageUsage>

  /** Legge un file dal path relativo. null = non trovato */
  read(path: string): Promise<Blob | null>

  /** Scrive/sovrascrive un file */
  write(path: string, data: Blob): Promise<void>

  /** Elimina un file (nessun errore se non esiste) */
  delete(path: string): Promise<void>

  /** Elenca ricorsivamente i file con mtime */
  list(prefix?: string): Promise<FileEntry[]>

  /** Controlla se il driver è disponibile (es. FSA richiede Chrome) */
  available(): boolean

  /** Inizializza: prepara lo spazio di lavoro (es. chiede cartella al docente) */
  init(): Promise<boolean>
}

/** Struttura workspace: raw/ = immutabile, derived/ = rigenerabile */
export const WORKSPACE_STRUCTURE = {
  RAW: "raw/",
  DERIVED: "derived/",
} as const

// Path fissi nel workspace
export const PATHS = {
  SCENE: "raw/board.excalidraw",
  JOURNAL: "raw/events.jsonl",
  SESSION: "raw/session.yaml",
  AUDIO_DIR: "raw/audio/",
} as const

/** Meta di una lezione (raw/<room>/meta.json) */
export interface LessonMeta {
  v: 1
  name: string
  createdAt: number
}

export type RoomInfo = LessonMeta & {
  /** L'id (chiave) della room */
  room: string
  /** Ultima modifica in epoch ms */
  mtime: number
}

// Schema versionato (campo `v` nei dati)
export const SCHEMA_VERSION = 1

export type StorageMode = "localStorage" | "fsa" | "unavailable"
