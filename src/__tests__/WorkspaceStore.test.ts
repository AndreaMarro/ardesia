// @vitest-environment jsdom
// MAESTRO-Studio — Test WorkspaceStore

import { describe, it, expect, beforeEach } from "vitest"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { type WorkspaceDriver, type FileEntry } from "../store/types"
import { createBundleBlob, parseBundleBlob } from "../store/zipBundle"

// jsdom non espone localStorage funzionante — stub esplicito.
let storage: Record<string, string> = {}

beforeEach(() => {
  storage = {}
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => { storage[k] = v },
      removeItem: (k: string) => { delete storage[k] },
      clear: () => { storage = {} },
      get length() { return Object.keys(storage).length },
      key: (i: number) => Object.keys(storage)[i] ?? null,
    },
    configurable: true,
    writable: true,
  })
})

class MockDriver implements WorkspaceDriver {
  readonly name = "mock"
  // Store raw bytes as ArrayBuffer (not Uint8Array) to avoid TS strict issues
  private store = new Map<string, ArrayBuffer>()
  private mtim = new Map<string, number>()

  available(): boolean { return true }
  async init(): Promise<boolean> { return true }

  async read(path: string): Promise<Blob | null> {
    const raw = this.store.get(path)
    if (!raw) return null
    return new Blob([raw])
  }

  async write(path: string, data: Blob): Promise<void> {
    this.store.set(path, await data.arrayBuffer())
    this.mtim.set(path, Date.now())
  }

  async delete(path: string): Promise<void> {
    this.store.delete(path)
    this.mtim.delete(path)
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    const entries: FileEntry[] = []
    for (const [path, buf] of this.store) {
      if (prefix && !path.startsWith(prefix)) continue
      entries.push({
        path,
        data: new Blob([buf]),
        mtime: this.mtim.get(path) ?? 0,
      })
    }
    return entries
  }
}

function withMockDriver(store: WorkspaceStore, mock: MockDriver) {
  ;(store as any).driver = mock
  ;(store as any)._mode = "localStorage"
}

describe("WorkspaceStore", () => {
  let store: WorkspaceStore
  let mock: MockDriver

  beforeEach(() => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
  })

  it("init restituisce localStorage quando FSA non disponibile", async () => {
    const s = new WorkspaceStore()
    const mode = await s.init()
    expect(mode).toBe("localStorage")
  })

  it("saveScene/loadScene funziona", async () => {
    const scene = JSON.stringify({ type: "excalidraw", elements: [1, 2, 3] })
    await store.saveScene("room1", scene)
    const loaded = await store.loadScene("room1")
    expect(loaded).toBe(scene)
  })

  it("write e read di blob binario (non-UTF8) preserva i byte", async () => {
    const original = new Uint8Array([0, 255, 128, 42, 0, 200])
    await store.write("raw/binary.bin", new Blob([original]))
    const blob = await store.read("raw/binary.bin")
    expect(blob).not.toBeNull()
    const result = new Uint8Array(await blob!.arrayBuffer())
    expect(Array.from(result)).toEqual(Array.from(original))
  })

  it("exportBundle e importBundle roundtrip", async () => {
    await store.saveScene("room1", JSON.stringify({ v: 1, elements: [] }))
    await store.saveSessionYaml("lesson: test\nmode: A")
    const bundle = await store.exportBundle()

    const s2 = new WorkspaceStore()
    const m2 = new MockDriver()
    withMockDriver(s2, m2)
    await s2.importBundle(bundle)

    const loaded = await s2.loadScene("room1")
    expect(loaded).not.toBeNull()
    if (loaded) {
      const parsed = JSON.parse(loaded)
      expect(parsed.v).toBe(1)
    }
  })

  it("read restituisce null per file inesistente", async () => {
    const result = await store.read("raw/nonexistent.jsonl")
    expect(result).toBeNull()
  })

  it("write + read + delete ciclo", async () => {
    await store.write("raw/test.txt", new Blob(["hello"]))
    const blob = await store.read("raw/test.txt")
    expect(blob).not.toBeNull()
    expect(await blob!.text()).toBe("hello")

    await store.delete("raw/test.txt")
    const after = await store.read("raw/test.txt")
    expect(after).toBeNull()
  })

  it("list filtra per prefisso", async () => {
    await store.write("raw/a.jsonl", new Blob(["a"]))
    await store.write("derived/b.jsonl", new Blob(["b"]))
    await store.write("raw/audio/chunk1.webm", new Blob(["c"]))

    const rawList = await store.list("raw/")
    expect(rawList.length).toBe(2)

    const audioList = await store.list("raw/audio/")
    expect(audioList.length).toBe(1)
    expect(audioList[0].path).toBe("raw/audio/chunk1.webm")
  })
})

describe("zipBundle", () => {
  it("createBundleBlob + parseBundleBlob idempotente", async () => {
    const entries: FileEntry[] = [
      { path: "raw/board.excalidraw", mtime: 1000, data: new Blob(['{"scene":1}']) },
      { path: "raw/events.jsonl", mtime: 1001, data: new Blob(["event1\nevent2\n"]) },
    ]
    const blob = await createBundleBlob(entries)
    const parsed = await parseBundleBlob(blob)
    expect(parsed.length).toBe(2)
    expect(parsed[0].path).toBe("raw/board.excalidraw")
    expect(await parsed[0].data.text()).toBe('{"scene":1}')
    expect(parsed[1].path).toBe("raw/events.jsonl")
    expect(await parsed[1].data.text()).toBe("event1\nevent2\n")
  })

  it("parseBundleBlob rifiuta formato non valido", async () => {
    const bad = new Blob(['{"format":"unknown"}'], { type: "application/x-maestro-bundle" })
    await expect(parseBundleBlob(bad)).rejects.toThrow("Formato bundle sconosciuto")
  })

  it("preserva byte binari nel roundtrip", async () => {
    const originalBytes = new Uint8Array([0, 255, 128, 200, 50])
    const entries: FileEntry[] = [
      { path: "raw/audio/chunk.webm", mtime: 2000, data: new Blob([originalBytes]) },
    ]
    const blob = await createBundleBlob(entries)
    const parsed = await parseBundleBlob(blob)
    expect(parsed.length).toBe(1)
    const result = new Uint8Array(await parsed[0].data.arrayBuffer())
    expect(Array.from(result)).toEqual(Array.from(originalBytes))
  })
})
