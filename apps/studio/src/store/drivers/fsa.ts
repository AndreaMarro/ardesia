// MAESTRO-Studio — Driver File System Access API (Chrome)
// Usa showDirectoryPicker() (Chrome 86+) per chiedere al docente una cartella.
// La struttura workspace: raw/ (immutabile), derived/ (rigenerabile).

import { type WorkspaceDriver, type FileEntry } from "../types"

class FSAPathCasingCollisionError extends Error {
  constructor() {
    super("FSA path casing collision")
    this.name = "FSAPathCasingCollisionError"
  }
}

type EnumeratedChild = {
  name: string
  handle: FileSystemHandle
}

const FSA_WORKSPACE_LOCK = "ardesia:fsa:workspace"

function asciiCaseFold(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => letter.toLowerCase())
}

function isErrorNamed(error: unknown, name: string): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === name
}

async function withFilesystemLock<T>(mode: LockMode, work: () => Promise<T>): Promise<T> {
  let locks: LockManager | undefined
  try {
    locks = typeof navigator === "undefined" ? undefined : navigator.locks
  } catch {
    locks = undefined
  }
  if (!locks || typeof locks.request !== "function") {
    throw new Error("FSA workspace lock unavailable")
  }
  return locks.request<Promise<T>>(FSA_WORKSPACE_LOCK, { mode }, (lock) => {
    if (lock === null) return Promise.reject(new Error("FSA workspace lock not granted"))
    return work()
  })
}

export class FSADriver implements WorkspaceDriver {
  readonly name = "FSA"
  private _rootHandle: FileSystemDirectoryHandle | null = null

  available(): boolean {
    return typeof window !== "undefined" && "showDirectoryPicker" in window
  }

  async init(): Promise<boolean> {
    if (!this.available()) return false
    let rootHandle: FileSystemDirectoryHandle
    try {
      rootHandle = await (window as any).showDirectoryPicker({
        id: "maestro-workspace",
        mode: "readwrite",
        startIn: "documents",
      })
    } catch (error) {
      if (isErrorNamed(error, "AbortError")) return false
      throw error
    }

    await withFilesystemLock("exclusive", async () => {
      const previousRoot = this._rootHandle
      this._rootHandle = rootHandle
      try {
        await this.ensureDir("raw")
        await this.ensureDir("derived")
      } catch (error) {
        if (this._rootHandle === rootHandle) this._rootHandle = previousRoot
        throw error
      }
    })
    return true
  }

  private async enumerateChildren(dir: FileSystemDirectoryHandle): Promise<EnumeratedChild[]> {
    // Non fidarsi di handle.name ottenuto da get*Handle(): Chromium può riflettere
    // il locator richiesto. L'inventory entries() espone invece i nomi del parent.
    const children: EnumeratedChild[] = []
    const namesByFold = new Map<string, string>()
    for await (const [name, handle] of (dir as any).entries()) {
      const folded = asciiCaseFold(name)
      const previous = namesByFold.get(folded)
      if (previous !== undefined && previous !== name) {
        throw new FSAPathCasingCollisionError()
      }
      namesByFold.set(folded, name)
      children.push({ name, handle: handle as FileSystemHandle })
    }
    return children
  }

  private async findChild(
    parent: FileSystemDirectoryHandle,
    requestedName: string,
    kind: FileSystemHandleKind,
  ): Promise<FileSystemHandle | null> {
    const folded = asciiCaseFold(requestedName)
    const matches = (await this.enumerateChildren(parent)).filter(
      ({ name }) => asciiCaseFold(name) === folded,
    )
    if (matches.length === 0) return null
    const match = matches[0]!
    if (matches.length !== 1 || match.name !== requestedName || match.handle.kind !== kind) {
      throw new FSAPathCasingCollisionError()
    }
    return match.handle
  }

  private async findOrCreateDirectory(
    parent: FileSystemDirectoryHandle,
    requestedName: string,
    create: boolean,
  ): Promise<FileSystemDirectoryHandle | null> {
    const existing = await this.findChild(parent, requestedName, "directory")
    if (existing) return existing as FileSystemDirectoryHandle
    if (!create) return null

    await parent.getDirectoryHandle(requestedName, { create: true })
    const verified = await this.findChild(parent, requestedName, "directory")
    if (!verified) throw new FSAPathCasingCollisionError()
    return verified as FileSystemDirectoryHandle
  }

  private async findOrCreateFile(
    parent: FileSystemDirectoryHandle,
    requestedName: string,
    create: boolean,
  ): Promise<FileSystemFileHandle | null> {
    const existing = await this.findChild(parent, requestedName, "file")
    if (existing) return existing as FileSystemFileHandle
    if (!create) return null

    await parent.getFileHandle(requestedName, { create: true })
    const verified = await this.findChild(parent, requestedName, "file")
    if (!verified) throw new FSAPathCasingCollisionError()
    return verified as FileSystemFileHandle
  }

  /** Naviga un path relativo e restituisce { parent, basename }.
   *  Se createMissing è true, crea le directory intermedie mancanti. */
  private async resolvePath(
    path: string,
    createMissing: boolean = false,
  ): Promise<{ parent: FileSystemDirectoryHandle; basename: string } | null> {
    if (!this._rootHandle) return null
    const parts = path.split("/").filter(Boolean)
    if (parts.length === 0) return null
    const basename = parts.pop()!
    let parent: FileSystemDirectoryHandle = this._rootHandle
    for (const dir of parts) {
      const next = await this.findOrCreateDirectory(parent, dir, createMissing)
      if (!next) return null
      parent = next
    }
    return { parent, basename }
  }

  private async ensureDir(relPath: string): Promise<void> {
    if (!this._rootHandle) return
    const parts = relPath.split("/").filter(Boolean)
    let dir = this._rootHandle
    for (const p of parts) {
      const next = await this.findOrCreateDirectory(dir, p, true)
      if (!next) throw new FSAPathCasingCollisionError()
      dir = next
    }
  }

  async read(path: string): Promise<Blob | null> {
    return withFilesystemLock("shared", async () => {
      const resolved = await this.resolvePath(path)
      if (!resolved) return null
      const fileHandle = await this.findOrCreateFile(resolved.parent, resolved.basename, false)
      if (!fileHandle) return null
      try {
        return await fileHandle.getFile()
      } catch (error) {
        if (isErrorNamed(error, "NotFoundError")) return null
        throw error
      }
    })
  }

  async write(path: string, data: Blob): Promise<void> {
    try {
      await withFilesystemLock("exclusive", async () => {
        // Crea le directory intermedie mancanti (es. raw/audio/ per raw/audio/x.webm)
        const resolved = await this.resolvePath(path, true)
        if (!resolved) throw new Error("FSA non inizializzato")
        const fileHandle = await this.findOrCreateFile(resolved.parent, resolved.basename, true)
        if (!fileHandle) throw new FSAPathCasingCollisionError()
        const writable = await fileHandle.createWritable()
        try {
          await writable.write(data)
          await writable.close()
        } catch (error) {
          try {
            await writable.abort()
          } catch {
            // Preserve the original write/close failure.
          }
          throw error
        }
      })
    } catch (error) {
      if (error instanceof FSAPathCasingCollisionError) throw error
      throw new Error("FSA write fallita", { cause: error })
    }
  }

  async delete(path: string): Promise<void> {
    await withFilesystemLock("exclusive", async () => {
      const resolved = await this.resolvePath(path)
      if (!resolved) return
      const fileHandle = await this.findOrCreateFile(resolved.parent, resolved.basename, false)
      if (!fileHandle) return
      try {
        await resolved.parent.removeEntry(resolved.basename)
      } catch (error) {
        if (isErrorNamed(error, "NotFoundError")) return
        throw error
      }
    })
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    return withFilesystemLock("shared", async () => {
      if (!this._rootHandle) return []
      const entries: FileEntry[] = []
      await this.walkDir(this._rootHandle, "", prefix, entries)
      return entries
    })
  }

  private async walkDir(
    dir: FileSystemDirectoryHandle,
    pathPrefix: string,
    filterPrefix: string | undefined,
    out: FileEntry[],
  ): Promise<void> {
    for (const { name, handle } of await this.enumerateChildren(dir)) {
      const relPath = pathPrefix ? `${pathPrefix}/${name}` : name
      if (handle.kind === "directory") {
        if (filterPrefix) {
          const exactRelation =
            relPath.startsWith(filterPrefix) || filterPrefix.startsWith(`${relPath}/`)
          const foldedPath = asciiCaseFold(relPath)
          const foldedFilter = asciiCaseFold(filterPrefix)
          const foldedRelation =
            foldedPath.startsWith(foldedFilter) || foldedFilter.startsWith(`${foldedPath}/`)
          if (!exactRelation && foldedRelation) throw new FSAPathCasingCollisionError()
          if (!exactRelation) continue
        }
        await this.walkDir(handle as FileSystemDirectoryHandle, relPath, filterPrefix, out)
      } else if (handle.kind === "file") {
        if (filterPrefix && !relPath.startsWith(filterPrefix)) {
          if (asciiCaseFold(relPath).startsWith(asciiCaseFold(filterPrefix))) {
            throw new FSAPathCasingCollisionError()
          }
          continue
        }
        try {
          const file = await (handle as FileSystemFileHandle).getFile()
          out.push({ path: relPath, data: file, mtime: file.lastModified })
        } catch (error) {
          if (!isErrorNamed(error, "NotFoundError")) throw error
          // External deletion after inventory: the file is simply no longer listed.
        }
      }
    }
  }
}

/** Crea un driver FSA; ogni istanza ha il proprio handle radice */
export function createFSADriver(): FSADriver {
  return new FSADriver()
}
