// MAESTRO-Studio — Driver File System Access API (Chrome)
// Usa showDirectoryPicker() (Chrome 86+) per chiedere al docente una cartella.
// La struttura workspace: raw/ (immutabile), derived/ (rigenerabile).

import { type WorkspaceDriver, type FileEntry } from "../types"

let _rootHandle: FileSystemDirectoryHandle | null = null

export class FSADriver implements WorkspaceDriver {
  readonly name = "FSA"

  available(): boolean {
    return typeof window !== "undefined" && "showDirectoryPicker" in window
  }

  async init(): Promise<boolean> {
    if (!this.available()) return false
    try {
      _rootHandle = await (window as any).showDirectoryPicker({
        id: "maestro-workspace",
        mode: "readwrite",
        startIn: "documents",
      })
      await this.ensureDir("raw")
      await this.ensureDir("derived")
      return true
    } catch {
      return false
    }
  }

  /** Naviga un path relativo e restituisce { parent, basename }.
   *  Se createMissing è true, crea le directory intermedie mancanti. */
  private async resolvePath(
    path: string,
    createMissing: boolean = false,
  ): Promise<{ parent: FileSystemDirectoryHandle; basename: string } | null> {
    if (!_rootHandle) return null
    const parts = path.split("/").filter(Boolean)
    const basename = parts.pop()!
    let parent: FileSystemDirectoryHandle = _rootHandle
    for (const dir of parts) {
      try {
        parent = await parent.getDirectoryHandle(dir, { create: createMissing })
      } catch {
        return null
      }
    }
    return { parent, basename }
  }

  private async ensureDir(relPath: string): Promise<void> {
    if (!_rootHandle) return
    const parts = relPath.split("/").filter(Boolean)
    let dir = _rootHandle
    for (const p of parts) {
      dir = await dir.getDirectoryHandle(p, { create: true })
    }
  }

  async read(path: string): Promise<Blob | null> {
    const resolved = await this.resolvePath(path)
    if (!resolved) return null
    try {
      const fileHandle = await resolved.parent.getFileHandle(resolved.basename)
      const file = await fileHandle.getFile()
      return file
    } catch {
      return null
    }
  }

  async write(path: string, data: Blob): Promise<void> {
    // Crea le directory intermedie mancanti (es. raw/audio/ per raw/audio/x.webm)
    const resolved = await this.resolvePath(path, true)
    if (!resolved) throw new Error("FSA non inizializzato")
    try {
      const fileHandle = await resolved.parent.getFileHandle(resolved.basename, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(data)
      await writable.close()
    } catch (err) {
      throw new Error(`FSA write fallita per ${path}: ${(err as Error).message}`)
    }
  }

  async delete(path: string): Promise<void> {
    const resolved = await this.resolvePath(path)
    if (!resolved) return
    try {
      await resolved.parent.removeEntry(resolved.basename)
    } catch {
      // non esiste — ok
    }
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    if (!_rootHandle) return []
    const entries: FileEntry[] = []
    await this.walkDir(_rootHandle, "", prefix, entries)
    return entries
  }

  private async walkDir(
    dir: FileSystemDirectoryHandle,
    pathPrefix: string,
    filterPrefix: string | undefined,
    out: FileEntry[],
  ): Promise<void> {
    for await (const [name, handle] of (dir as any).entries()) {
      const relPath = pathPrefix ? `${pathPrefix}/${name}` : name
      if (filterPrefix && !relPath.startsWith(filterPrefix)) continue
      if (handle.kind === "directory") {
        await this.walkDir(handle as FileSystemDirectoryHandle, relPath, filterPrefix, out)
      } else if (handle.kind === "file") {
        try {
          const file = await (handle as FileSystemFileHandle).getFile()
          out.push({ path: relPath, data: file, mtime: file.lastModified })
        } catch {
          // skip files we can't read
        }
      }
    }
  }
}

/** Crea un driver FSA; condivide l'handle radice */
export function createFSADriver(): FSADriver {
  return new FSADriver()
}
