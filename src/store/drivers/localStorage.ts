// MAESTRO-Studio — Driver localStorage (cache)
// NOTA: localStorage NON è la fonte di verità; la fonte = cartella FSA / export bundle.
// I dati binari (audio etc.) sono codificati in base64 per non corrompersi.

import { type WorkspaceDriver, type FileEntry } from "../types"

const PREFIX = "maestro:"
const MTIME_SUFFIX = ":mtime"

/** Converte Blob → base64 usando arrayBuffer (NON text() — corrompe byte binari) */
async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBlob(b64: string, type?: string): Blob {
  const binaryStr = atob(b64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return new Blob([bytes], type ? { type } : { type: "application/octet-stream" })
}

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
      return base64ToBlob(raw)
    } catch {
      return null
    }
  }

  async write(path: string, data: Blob): Promise<void> {
    const b64 = await blobToBase64(data)
    localStorage.setItem(this.key(path), b64)
    localStorage.setItem(this.mtimeKey(path), String(Date.now()))
  }

  async delete(path: string): Promise<void> {
    localStorage.removeItem(this.key(path))
    localStorage.removeItem(this.mtimeKey(path))
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    const entries: FileEntry[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(PREFIX) || key.endsWith(MTIME_SUFFIX)) continue
      const path = key.slice(PREFIX.length)
      if (prefix && !path.startsWith(prefix)) continue
      const raw = localStorage.getItem(key)!
      const mtimeRaw = localStorage.getItem(this.mtimeKey(path))
      entries.push({
        path,
        data: base64ToBlob(raw),
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
