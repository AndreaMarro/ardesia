// MAESTRO-Studio — Driver localStorage (cache)
// NOTA: localStorage NON è la fonte di verità; la fonte = cartella FSA / export bundle.
// I dati binari (audio etc.) sono codificati in base64 per non corrompersi.

import { type WorkspaceDriver, type FileEntry, type StorageUsage } from "../types"
import { blobToBase64, base64ToBlob } from "../codec"

const PREFIX = "maestro:"
const MTIME_SUFFIX = ":mtime"
const TYPE_SUFFIX = ":type"
/** Quota tipica localStorage per-origin (5MB) — il limite REALE che oggi tronca le scene */
const LOCALSTORAGE_QUOTA_BYTES = 5 * 1024 * 1024

export class LocalStorageDriver implements WorkspaceDriver {
  readonly name = "localStorage"

  available(): boolean {
    try {
      const k = PREFIX + "ping"
      localStorage.setItem(k, "1")
      localStorage.removeItem(k)
      return true
    } catch {
      return false
    }
  }

  async init(): Promise<boolean> {
    return this.available()
  }

  /**
   * Uso storage REALE: somma key+value di TUTTO il localStorage dell'origin
   * (la quota è per-origin, non per-prefisso) in byte UTF-16 (2 byte/char).
   */
  async usage(): Promise<StorageUsage> {
    let usedBytes = 0
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue
        usedBytes += (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2
      }
    } catch {
      // localStorage non disponibile: 0 usato, quota comunque riportata
    }
    return { usedBytes, quotaBytes: LOCALSTORAGE_QUOTA_BYTES }
  }

  private key(path: string): string {
    return PREFIX + path
  }

  private mtimeKey(path: string): string {
    return PREFIX + path + MTIME_SUFFIX
  }

  async read(path: string): Promise<Blob | null> {
    try {
      const raw = localStorage.getItem(this.key(path))
      if (raw === null) return null
      const type = localStorage.getItem(PREFIX + TYPE_SUFFIX + path) ?? undefined
      return base64ToBlob(raw, type)
    } catch {
      return null
    }
  }

  async write(path: string, data: Blob): Promise<void> {
    const b64 = await blobToBase64(data)
    localStorage.setItem(this.key(path), b64)
    localStorage.setItem(this.mtimeKey(path), String(Date.now()))
    if (data.type) {
      localStorage.setItem(PREFIX + TYPE_SUFFIX + path, data.type)
    }
  }

  async delete(path: string): Promise<void> {
    localStorage.removeItem(this.key(path))
    localStorage.removeItem(this.mtimeKey(path))
    localStorage.removeItem(PREFIX + TYPE_SUFFIX + path)
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    const entries: FileEntry[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(PREFIX) || key.endsWith(MTIME_SUFFIX) || key.startsWith(PREFIX + TYPE_SUFFIX)) continue
      const path = key.slice(PREFIX.length)
      if (prefix && !path.startsWith(prefix)) continue
      const raw = localStorage.getItem(key)!
      const mtimeRaw = localStorage.getItem(this.mtimeKey(path))
      const typeRaw = localStorage.getItem(PREFIX + TYPE_SUFFIX + path)
      entries.push({
        path,
        data: base64ToBlob(raw, typeRaw || undefined),
        mtime: mtimeRaw ? parseInt(mtimeRaw, 10) : 0,
      })
    }
    return entries
  }

  /** Legge scena legacy "studio-scene:{room}" per migrazione */
  getLegacyScene(room: string): string | null {
    try {
      return localStorage.getItem(`studio-scene:${room}`)
    } catch {
      return null
    }
  }

  /** Salva scena legacy per retrocompatibilità durante transizione */
  setLegacyScene(room: string, data: string): void {
    try {
      localStorage.setItem(`studio-scene:${room}`, data)
    } catch {
      // quota — non bloccare
    }
  }
}

export const localStorageDriver = new LocalStorageDriver()
