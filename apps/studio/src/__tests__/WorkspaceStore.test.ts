// @vitest-environment jsdom
// MAESTRO-Studio — Test WorkspaceStore

import { describe, it, expect, beforeEach } from "vitest"
import { WorkspaceCompensationError, WorkspaceStore } from "../store/WorkspaceStore"
import { type WorkspaceDriver, type FileEntry } from "../store/types"
import { createBundleBlob, parseBundleBlob } from "../store/zipBundle"
import { LocalStorageDriver } from "../store/drivers/localStorage"
import { roomPaths, validateRoomId } from "../store/roomPaths"
import {
  createLessonMutationCoordinator,
  type MutationLockBroker,
  type MutationLockMode,
} from "../store/lessonMutationLock"

// jsdom non espone localStorage funzionante — stub esplicito.
let storage: Record<string, string> = {}
let storageOperations: string[] = []

beforeEach(() => {
  storage = {}
  storageOperations = []
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => {
        storageOperations.push(`get:${k}`)
        return storage[k] ?? null
      },
      setItem: (k: string, v: string) => {
        storageOperations.push(`set:${k}`)
        storage[k] = v
      },
      removeItem: (k: string) => {
        storageOperations.push(`remove:${k}`)
        delete storage[k]
      },
      clear: () => {
        storageOperations.push("clear")
        storage = {}
      },
      get length() { return Object.keys(storage).length },
      key: (i: number) => {
        storageOperations.push(`key:${i}`)
        return Object.keys(storage)[i] ?? null
      },
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
  private clock = 0
  readonly operations: string[] = []

  available(): boolean { return true }
  async init(): Promise<boolean> { return true }

  async read(path: string): Promise<Blob | null> {
    this.operations.push(`read:${path}`)
    const raw = this.store.get(path)
    if (!raw) return null
    return new Blob([raw])
  }

  async write(path: string, data: Blob): Promise<void> {
    this.operations.push(`write:${path}`)
    this.store.set(path, await data.arrayBuffer())
    this.mtim.set(path, ++this.clock)
  }

  async delete(path: string): Promise<void> {
    this.operations.push(`delete:${path}`)
    this.store.delete(path)
    this.mtim.delete(path)
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    this.operations.push(`list:${prefix ?? ""}`)
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

  clearOperations(): void {
    this.operations.length = 0
  }
}

type QueuedLock = {
  mode: MutationLockMode
  start(): void
}

type LockState = {
  readers: number
  writer: boolean
  queue: QueuedLock[]
}

class AdversarialMutationLockBroker implements MutationLockBroker {
  readonly safety = "origin-exclusive" as const
  readonly ledger: string[] = []
  private readonly states = new Map<string, LockState>()

  request<T>(
    name: string,
    options: Readonly<{ mode: MutationLockMode }>,
    work: () => Promise<T>,
  ): Promise<T> {
    this.ledger.push(`request:${options.mode}:${name}`)
    return new Promise<T>((resolve, reject) => {
      const queued: QueuedLock = {
        mode: options.mode,
        start: () => {
          const state = this.state(name)
          if (options.mode === "shared") state.readers += 1
          else state.writer = true
          this.ledger.push(`enter:${options.mode}:${name}`)
          void work().then(resolve, reject).finally(() => {
            this.ledger.push(`exit:${options.mode}:${name}`)
            if (options.mode === "shared") state.readers -= 1
            else state.writer = false
            this.drain(name)
          })
        },
      }
      this.state(name).queue.push(queued)
      this.drain(name)
    })
  }

  private state(name: string): LockState {
    let state = this.states.get(name)
    if (!state) {
      state = { readers: 0, writer: false, queue: [] }
      this.states.set(name, state)
    }
    return state
  }

  private drain(name: string): void {
    const state = this.state(name)
    if (state.writer || state.queue.length === 0) return
    const next = state.queue[0]!
    if (next.mode === "exclusive") {
      if (state.readers > 0) return
      state.queue.shift()
      next.start()
      return
    }
    while (!state.writer && state.queue[0]?.mode === "shared") {
      state.queue.shift()!.start()
    }
  }
}

function deferred(): { promise: Promise<void>; resolve(): void } {
  let resolvePromise: (() => void) | undefined
  const promise = new Promise<void>((resolve) => { resolvePromise = resolve })
  return {
    promise,
    resolve: () => { resolvePromise?.() },
  }
}

async function waitForLedger(
  broker: AdversarialMutationLockBroker,
  entry: string,
  count = 1,
): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (broker.ledger.filter((candidate) => candidate === entry).length >= count) return
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  }
  throw new Error(`lock ledger entry missing: ${entry}`)
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

  it("costruisce path canonici deterministici per una room", () => {
    expect(roomPaths("roomA.1")).toEqual({
      scene: "raw/roomA.1/board.excalidraw",
      meta: "raw/roomA.1/meta.json",
      journal: "raw/roomA.1/events.jsonl",
      session: "raw/roomA.1/session.yaml",
      audioDir: "raw/roomA.1/audio/",
      lessonOsSnapshot: "raw/roomA.1/lessonos-events.jsonl",
    })
  })

  it("preserva gli id compatibili senza normalizzarli", () => {
    const compatible = ["wbstudio-2026", "roomA", "_", "-", "roomA.1", "A".repeat(128)]
    for (const room of compatible) {
      expect(validateRoomId(room)).toBe(room)
    }
  })

  it("rifiuta id ostili, riservati e device Windows senza riflettere input", () => {
    const invalid = [
      "", ".", "..", "private/secret", "private\\secret", "room\u0000id", "room\nid",
      "room id", " room", "room\t", "%2e%2e", "room%2Fchild", "caffè", "room.",
      "A".repeat(129), "con", "PRN", "AuX.txt", "nul", "COM1", "com9.log", "lpt1",
      "LPT9.backup", "audio", "BOARD.EXCALIDRAW", "events.jsonl", "Session.Yaml",
      "lessonos-events.jsonl",
    ]
    const messages: string[] = []

    for (const room of invalid) {
      let error: unknown
      try {
        validateRoomId(room)
      } catch (caught) {
        error = caught
      }
      expect(error).toBeInstanceOf(Error)
      const message = (error as Error).message
      expect(message).toMatch(/room/i)
      messages.push(message)
    }
    expect(new Set(messages).size).toBe(1)
    expect(messages[0]).not.toContain("private/secret")
  })

  it("rifiuta room non valide prima di driver e cache legacy in ogni operazione room-scoped", async () => {
    for (const invalidRoom of ["private/secret", "audio"]) {
      const operations: Array<() => Promise<unknown>> = [
        () => store.saveScene(invalidRoom, "{}"),
        () => store.loadScene(invalidRoom),
        () => store.saveMeta(invalidRoom, { v: 1, name: "Hostile", createdAt: 1 }),
        () => store.loadMeta(invalidRoom),
        () => store.exportLesson(invalidRoom),
        () => store.importLessonBlobForRoom(new Blob(["not-a-zip"]), invalidRoom),
      ]

      for (const operation of operations) {
        mock.clearOperations()
        storageOperations = []
        await expect(operation()).rejects.toThrow(/room/i)
        expect(mock.operations).toEqual([])
        expect(storageOperations).toEqual([])
      }
    }
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

  it("non attiva fallback legacy quando il driver primario segnala collisione FSA", async () => {
    const collisionDriver = new MockDriver()
    collisionDriver.read = async () => { throw new Error("FSA path casing collision") }
    withMockDriver(store, collisionDriver)
    const fallback = (store as unknown as { fallback: LocalStorageDriver }).fallback
    fallback.setLegacyScene("rooma", "legacy-che-non-va-letto")
    storageOperations = []

    await expect(store.loadScene("rooma")).rejects.toThrow(/casing|collision/i)
    expect(storageOperations).toEqual([])
  })

  it("saveScene con 2 room diverse NON collide (room-aware path)", async () => {
    await store.saveScene("roomA", JSON.stringify({ room: "A" }))
    await store.saveScene("roomB", JSON.stringify({ room: "B" }))
    const roomA = await store.loadScene("roomA")
    const roomB = await store.loadScene("roomB")
    expect(roomA).toBe(JSON.stringify({ room: "A" }))
    expect(roomB).toBe(JSON.stringify({ room: "B" }))
  })

  it("write e read di blob binario (non-UTF8) preserva i byte", async () => {
    const original = new Uint8Array([0, 255, 128, 42, 0, 200])
    await store.write("raw/binary.bin", new Blob([original]))
    const blob = await store.read("raw/binary.bin")
    expect(blob).not.toBeNull()
    const result = new Uint8Array(await blob!.arrayBuffer())
    expect(Array.from(result)).toEqual(Array.from(original))
  })

  it("saveScene e loadScene via localStorage driver preserva MIME type", async () => {
    // Usa localStorage driver direttamente per test MIME roundtrip
    const { localStorageDriver } = await import("../store/drivers/localStorage")
    const imageBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG magic
    await localStorageDriver.write("raw/img.png", new Blob([imageBytes], { type: "image/png" }))
    const loaded = await localStorageDriver.read("raw/img.png")
    expect(loaded).not.toBeNull()
    expect(loaded!.type).toBe("image/png")
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

  // --- T2b punto 4: uso/quota storage ---

  it("storageUsage() = null quando il driver non espone usage (es. FSA)", async () => {
    // MockDriver non implementa usage(): quota non applicabile
    expect(await store.storageUsage()).toBeNull()
  })

  it("LocalStorageDriver.usage() conta i byte reali (UTF-16) e riporta quota 5MB", async () => {
    const driver = new LocalStorageDriver()
    const before = (await driver.usage()).usedBytes

    await driver.write("raw/test.bin", new Blob(["x".repeat(1000)]))

    const after = await driver.usage()
    expect(after.quotaBytes).toBe(5 * 1024 * 1024)
    // base64 di 1000 byte ≈ 1336 char × 2 byte UTF-16 (più chiavi e mtime)
    expect(after.usedBytes - before).toBeGreaterThanOrEqual(2 * 1336)

    await driver.delete("raw/test.bin")
    expect((await driver.usage()).usedBytes).toBe(before)
  })

  // --- S-DESIGN-3: lezioni con nome (meta.json + listRooms) ---

  it("saveMeta/loadMeta: scrive e legge meta.json", async () => {
    const meta = { v: 1 as const, name: "Teoria dei Segnali — cap. 3", createdAt: 1000 }
    await store.saveMeta("room1", meta)
    const loaded = await store.loadMeta("room1")
    expect(loaded).not.toBeNull()
    expect(loaded!.name).toBe("Teoria dei Segnali — cap. 3")
    expect(loaded!.createdAt).toBe(1000)
  })

  it("loadMeta su room senza meta.json = null", async () => {
    const loaded = await store.loadMeta("inexistent")
    expect(loaded).toBeNull()
  })

  it("listRooms restituisce room ordinate per mtime discendente", async () => {
    // Crea 2 room con scene
    await store.saveScene("roomA", JSON.stringify({ v: 1 }))
    await sleep(2)
    await store.saveScene("roomB", JSON.stringify({ v: 1 }))

    // Assegna nome a roomA
    await store.saveMeta("roomA", { v: 1, name: "Alpha", createdAt: 1000 })

    const rooms = await store.listRooms()
    // roomB è la più recente (scritta dopo)
    expect(rooms.length).toBe(2)
    expect(rooms[0].room).toBe("roomB")
    expect(rooms[0].name).toBe("roomB") // fallback-id senza meta
    expect(rooms[1].room).toBe("roomA")
    expect(rooms[1].name).toBe("Alpha")
  })

  it("listRooms ignora path invalidi, riservati o più profondi", async () => {
    await store.write("raw/roomA/board.excalidraw", new Blob(["{}"]))
    await store.write("raw/../board.excalidraw", new Blob(["{}"]))
    await store.write("raw/audio/board.excalidraw", new Blob(["{}"]))
    await store.write("raw/room./board.excalidraw", new Blob(["{}"]))
    await store.write("raw/deeper/board.excalidraw/extra", new Blob(["{}"]))
    await store.write("raw/roomB/board.excalidraw", new Blob(["{}"]))

    const rooms = await store.listRooms()

    expect(rooms.map(({ room }) => room)).toEqual(["roomB", "roomA"])
  })

  it("listRooms su store vuoto = []", async () => {
    const rooms = await store.listRooms()
    expect(rooms).toEqual([])
  })

  it("linearizza write/delete di due store sullo stesso dominio lesson case-folded", async () => {
    const broker = new AdversarialMutationLockBroker()
    const firstStore = new WorkspaceStore({
      mutationCoordinator: createLessonMutationCoordinator(broker),
    })
    const secondStore = new WorkspaceStore({
      mutationCoordinator: createLessonMutationCoordinator(broker),
    })
    const firstDriver = new MockDriver()
    const secondDriver = new MockDriver()
    withMockDriver(firstStore, firstDriver)
    withMockDriver(secondStore, secondDriver)

    const firstEnteredDriver = deferred()
    const releaseFirstDriver = deferred()
    const originalFirstWrite = firstDriver.write.bind(firstDriver)
    firstDriver.write = async (path, data) => {
      firstEnteredDriver.resolve()
      await releaseFirstDriver.promise
      await originalFirstWrite(path, data)
    }

    let secondReachedDriver = false
    const originalSecondDelete = secondDriver.delete.bind(secondDriver)
    secondDriver.delete = async (path) => {
      secondReachedDriver = true
      await originalSecondDelete(path)
    }

    const first = firstStore.write("raw/RoomC/board.excalidraw", new Blob(["first"]))
    await firstEnteredDriver.promise
    const second = secondStore.delete("raw/roomc/events.jsonl")

    const lessonLock = "ardesia:lesson-mutation:roomc"
    await waitForLedger(broker, `request:exclusive:${lessonLock}`, 2)
    expect(broker.ledger.filter((entry) => entry === `request:exclusive:${lessonLock}`)).toHaveLength(2)
    expect(broker.ledger.filter((entry) => entry === `enter:exclusive:${lessonLock}`)).toHaveLength(1)
    expect(secondReachedDriver).toBe(false)
    expect(broker.ledger.filter((entry) => entry === "enter:shared:ardesia:workspace-mutation")).toHaveLength(2)

    releaseFirstDriver.resolve()
    await Promise.all([first, second])

    expect(secondReachedDriver).toBe(true)
    expect(broker.ledger.filter((entry) => entry === `enter:exclusive:${lessonLock}`)).toHaveLength(2)
  })

  it("consente a room diverse di avanzare sotto workspace shared con lesson lock distinti", async () => {
    const broker = new AdversarialMutationLockBroker()
    const mutationCoordinator = createLessonMutationCoordinator(broker)
    const firstStore = new WorkspaceStore({ mutationCoordinator })
    const secondStore = new WorkspaceStore({ mutationCoordinator })
    const firstDriver = new MockDriver()
    const secondDriver = new MockDriver()
    withMockDriver(firstStore, firstDriver)
    withMockDriver(secondStore, secondDriver)

    const firstEnteredDriver = deferred()
    const releaseFirstDriver = deferred()
    const originalFirstWrite = firstDriver.write.bind(firstDriver)
    firstDriver.write = async (path, data) => {
      firstEnteredDriver.resolve()
      await releaseFirstDriver.promise
      await originalFirstWrite(path, data)
    }

    let secondReachedDriver = false
    const originalSecondWrite = secondDriver.write.bind(secondDriver)
    secondDriver.write = async (path, data) => {
      secondReachedDriver = true
      await originalSecondWrite(path, data)
    }

    const first = firstStore.write("raw/RoomA/board.excalidraw", new Blob(["first"]))
    await firstEnteredDriver.promise
    const second = secondStore.write("raw/RoomB/events.jsonl", new Blob(["second"]))

    const firstLessonLock = "ardesia:lesson-mutation:rooma"
    const secondLessonLock = "ardesia:lesson-mutation:roomb"
    try {
      await waitForLedger(broker, `enter:exclusive:${secondLessonLock}`)
      expect(secondReachedDriver).toBe(true)
      expect(broker.ledger).toContain(`enter:exclusive:${firstLessonLock}`)
      expect(firstLessonLock).not.toBe(secondLessonLock)
      expect(
        broker.ledger.filter(
          (entry) => entry === "enter:shared:ardesia:workspace-mutation",
        ),
      ).toHaveLength(2)
      expect(broker.ledger).not.toContain("request:exclusive:ardesia:workspace-mutation")
    } finally {
      releaseFirstDriver.resolve()
      await Promise.all([first, second])
    }
  })

  it("condivide il coordinator fallback module-global fra due WorkspaceStore no-arg", async () => {
    const firstStore = new WorkspaceStore()
    const secondStore = new WorkspaceStore()
    const firstDriver = new MockDriver()
    const secondDriver = new MockDriver()
    withMockDriver(firstStore, firstDriver)
    withMockDriver(secondStore, secondDriver)
    expect(firstStore.mutationSafety).toBe("local-only")
    expect(secondStore.mutationSafety).toBe("local-only")

    const firstEnteredDriver = deferred()
    const releaseFirstDriver = deferred()
    const originalFirstWrite = firstDriver.write.bind(firstDriver)
    firstDriver.write = async (path, data) => {
      firstEnteredDriver.resolve()
      await releaseFirstDriver.promise
      await originalFirstWrite(path, data)
    }

    let secondReachedDriver = false
    const originalSecondDelete = secondDriver.delete.bind(secondDriver)
    secondDriver.delete = async (path) => {
      secondReachedDriver = true
      await originalSecondDelete(path)
    }

    const first = firstStore.write("raw/RoomC/board.excalidraw", new Blob(["first"]))
    await firstEnteredDriver.promise
    const second = secondStore.delete("raw/roomc/events.jsonl")
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 0))
      expect(secondReachedDriver).toBe(false)
    } finally {
      releaseFirstDriver.resolve()
      await Promise.all([first, second])
    }
    expect(secondReachedDriver).toBe(true)
  })

  it("tratta alias non canonici e namespace di controllo come workspace-global", async () => {
    const broker = new AdversarialMutationLockBroker()
    const guardedStore = new WorkspaceStore({
      mutationCoordinator: createLessonMutationCoordinator(broker),
    })
    withMockDriver(guardedStore, new MockDriver())

    const aliases = [
      "/raw/C/file.bin",
      "Raw/C/file.bin",
      "derived/C/file.bin",
      "raw/C",
      "raw//C/file.bin",
      "raw/C/",
      "raw/.ardesia/import-transactions/tx.json",
      "raw/C/../B/file.bin",
      "raw/C/\u0000control.bin",
    ]
    for (const alias of aliases) {
      broker.ledger.length = 0
      await guardedStore.write(alias, new Blob(["x"]))
      expect(broker.ledger[0], alias).toBe("request:exclusive:ardesia:workspace-mutation")
      expect(broker.ledger.some((entry) => entry.includes("lesson-mutation")), alias).toBe(false)
    }
  })

  it("non espone ancora una lease clone o macro-import .lesson nella foundation S0A", () => {
    const coordinator = createLessonMutationCoordinator(new AdversarialMutationLockBroker())
    expect("withLessonImport" in coordinator).toBe(false)
    expect("registerActiveLesson" in coordinator).toBe(false)
  })

  it("mantiene importBundle workspace-exclusive rispetto alle mutazioni lesson", async () => {
    const broker = new AdversarialMutationLockBroker()
    const mutationCoordinator = createLessonMutationCoordinator(broker)
    const writer = new WorkspaceStore({ mutationCoordinator })
    const importer = new WorkspaceStore({ mutationCoordinator })
    const writerDriver = new MockDriver()
    const importerDriver = new MockDriver()
    withMockDriver(writer, writerDriver)
    withMockDriver(importer, importerDriver)

    const writerEnteredDriver = deferred()
    const releaseWriter = deferred()
    const originalWrite = writerDriver.write.bind(writerDriver)
    writerDriver.write = async (path, data) => {
      writerEnteredDriver.resolve()
      await releaseWriter.promise
      await originalWrite(path, data)
    }

    const bundle = await createBundleBlob([
      { path: "raw/C/imported.bin", mtime: 1, data: new Blob(["imported"]) },
    ])
    const activeWrite = writer.write("raw/C/live.bin", new Blob(["live"]))
    await writerEnteredDriver.promise
    const pendingImport = importer.importBundle(bundle)

    await waitForLedger(broker, "request:exclusive:ardesia:workspace-mutation")
    expect(importerDriver.operations).toEqual([])
    expect(broker.ledger).not.toContain("enter:exclusive:ardesia:workspace-mutation")

    releaseWriter.resolve()
    await Promise.all([activeWrite, pendingImport])

    expect(importerDriver.operations).toContain("write:raw/C/imported.bin")
    expect(broker.ledger).toContain("enter:exclusive:ardesia:workspace-mutation")
  })

  it("compensa un importBundle fallito byte-identico e rilascia la lease per il retry", async () => {
    const broker = new AdversarialMutationLockBroker()
    const legacyImporter = new WorkspaceStore({
      mutationCoordinator: createLessonMutationCoordinator(broker),
    })
    const driver = new MockDriver()
    withMockDriver(legacyImporter, driver)
    const existingPath = "raw/C/existing.bin"
    const createdPath = "raw/C/created.bin"
    const failingPath = "raw/C/failing.bin"
    const neverWrittenPath = "raw/C/never-written.bin"
    const originalBytes = new Uint8Array([0, 255, 17, 128, 42])
    await legacyImporter.write(existingPath, new Blob([originalBytes]))
    const bundle = await createBundleBlob([
      { path: existingPath, mtime: 1, data: new Blob(["replacement"]) },
      { path: createdPath, mtime: 2, data: new Blob(["created"]) },
      { path: failingPath, mtime: 3, data: new Blob(["fails-mid-import"]) },
      { path: neverWrittenPath, mtime: 4, data: new Blob(["never-written"]) },
    ])
    const importFailure = new Error("mid-import failure")
    let injectFailure = true
    const originalWrite = driver.write.bind(driver)
    driver.write = async (path, data) => {
      if (path === failingPath && injectFailure) {
        injectFailure = false
        driver.operations.push(`write-failed:${path}`)
        throw importFailure
      }
      await originalWrite(path, data)
    }
    driver.clearOperations()

    await expect(legacyImporter.importBundle(bundle)).rejects.toBe(importFailure)

    const restored = await driver.read(existingPath)
    expect(Array.from(new Uint8Array(await restored!.arrayBuffer()))).toEqual(Array.from(originalBytes))
    expect(await driver.read(createdPath)).toBeNull()
    expect(await driver.read(failingPath)).toBeNull()
    expect(await driver.read(neverWrittenPath)).toBeNull()
    const firstWrite = driver.operations.findIndex((entry) => entry.startsWith("write:"))
    for (const path of [existingPath, createdPath, failingPath, neverWrittenPath]) {
      expect(driver.operations.indexOf(`read:${path}`), path).toBeLessThan(firstWrite)
    }
    expect(broker.ledger).toContain("exit:exclusive:ardesia:workspace-mutation")

    await expect(legacyImporter.importBundle(bundle)).resolves.toBeUndefined()
    expect(await (await driver.read(existingPath))!.text()).toBe("replacement")
    expect(await (await driver.read(createdPath))!.text()).toBe("created")
    expect(await (await driver.read(failingPath))!.text()).toBe("fails-mid-import")
    expect(await (await driver.read(neverWrittenPath))!.text()).toBe("never-written")
  })

  it("preserva cause import e rollback quando la compensazione stessa fallisce", async () => {
    const broker = new AdversarialMutationLockBroker()
    const legacyImporter = new WorkspaceStore({
      mutationCoordinator: createLessonMutationCoordinator(broker),
    })
    const driver = new MockDriver()
    withMockDriver(legacyImporter, driver)
    const existingPath = "raw/C/existing.bin"
    const createdPath = "raw/C/created.bin"
    const failingPath = "raw/C/failing.bin"
    await legacyImporter.write(existingPath, new Blob(["original"]))
    const bundle = await createBundleBlob([
      { path: existingPath, mtime: 1, data: new Blob(["replacement"]) },
      { path: createdPath, mtime: 2, data: new Blob(["created"]) },
      { path: failingPath, mtime: 3, data: new Blob(["fails"]) },
    ])
    const importFailure = new Error("import write failed")
    const rollbackFailure = new Error("rollback delete failed")
    const originalWrite = driver.write.bind(driver)
    const originalDelete = driver.delete.bind(driver)
    let failImport = true
    let failRollback = true
    driver.write = async (path, data) => {
      if (path === failingPath && failImport) {
        failImport = false
        throw importFailure
      }
      await originalWrite(path, data)
    }
    driver.delete = async (path) => {
      if (path === createdPath && failRollback) {
        failRollback = false
        throw rollbackFailure
      }
      await originalDelete(path)
    }

    let caught: unknown
    try {
      await legacyImporter.importBundle(bundle)
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(WorkspaceCompensationError)
    const diagnostic = caught as WorkspaceCompensationError
    expect(diagnostic.operation).toBe("legacy-bundle-import")
    expect(diagnostic.originalCause).toBe(importFailure)
    expect(diagnostic.rollbackFailures).toEqual([
      { path: createdPath, error: rollbackFailure },
    ])
    expect(diagnostic.message).not.toContain(createdPath)
    const cause = diagnostic.cause
    expect(cause).toBeInstanceOf(AggregateError)
    expect((cause as AggregateError).errors[0]).toBe(importFailure)
    expect((cause as AggregateError).errors).toContain(rollbackFailure)
    expect(broker.ledger).toContain("exit:exclusive:ardesia:workspace-mutation")
    await expect(
      legacyImporter.write("raw/C/after-rollback-failure.bin", new Blob(["lease-released"])),
    ).resolves.toBeUndefined()
  })

  it("mantiene connectFolder workspace-exclusive e pubblica la safety tipata", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const writer = new WorkspaceStore({ mutationCoordinator: coordinator })
    const writerDriver = new MockDriver()
    withMockDriver(writer, writerDriver)

    const writerEnteredDriver = deferred()
    const releaseWriter = deferred()
    const originalWrite = writerDriver.write.bind(writerDriver)
    writerDriver.write = async (path, data) => {
      writerEnteredDriver.resolve()
      await releaseWriter.promise
      await originalWrite(path, data)
    }

    const fsa = new MockDriver()
    const originalFsaInit = fsa.init.bind(fsa)
    fsa.init = async () => {
      fsa.operations.push("init")
      return originalFsaInit()
    }
    let fsaFactoryCalls = 0
    const connector = new WorkspaceStore({
      mutationCoordinator: coordinator,
      createFsaDriver: () => {
        fsaFactoryCalls += 1
        return fsa
      },
    })
    await connector.write("raw/C/migrate.bin", new Blob(["migrate"]))
    broker.ledger.length = 0
    const activeWrite = writer.write("raw/C/live.bin", new Blob(["live"]))
    await writerEnteredDriver.promise
    const pendingConnect = connector.connectFolder()
    const duplicateConnect = connector.connectFolder()

    await waitForLedger(broker, "request:exclusive:ardesia:workspace-mutation")
    const queuedPath = "raw/C/queued-after-connect.bin"
    const queuedWrite = connector.write(queuedPath, new Blob(["new-fsa-only"]))
    await waitForLedger(broker, "request:shared:ardesia:workspace-mutation", 2)
    const fallback = (connector as unknown as { fallback: LocalStorageDriver }).fallback
    expect(duplicateConnect).toBe(pendingConnect)
    expect(fsaFactoryCalls).toBe(1)
    expect(fsa.operations).toEqual(["init"])
    expect(await fallback.read(queuedPath)).toBeNull()
    expect(connector.mode).toBe("unavailable")
    expect(coordinator.safety).toBe("origin-exclusive")

    releaseWriter.resolve()
    await activeWrite
    await expect(pendingConnect).resolves.toBe(true)
    await queuedWrite

    expect(fsa.operations[0]).toBe("init")
    expect(fsa.operations).toContain("write:raw/C/migrate.bin")
    expect(fsa.operations).toContain(`write:${queuedPath}`)
    expect(await fallback.read(queuedPath)).toBeNull()
    expect(broker.ledger).toContain("enter:exclusive:ardesia:workspace-mutation")
    await expect(connector.init()).resolves.toBe("fsa")
    await expect(connector.connectFolder()).resolves.toBe(true)
    expect(fsaFactoryCalls).toBe(1)
    await connector.write("raw/C/after-reopen.bin", new Blob(["still-fsa"]))
    expect(fsa.operations).toContain("write:raw/C/after-reopen.bin")
  })

  it("preserva driver e cache dopo migration failure, rilascia la lease e consente retry", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const failingCandidate = new MockDriver()
    const retryCandidate = new MockDriver()
    const existingPath = "raw/C/candidate-existing.bin"
    const createdPath = "raw/C/candidate-created.bin"
    const failingPath = "raw/C/candidate-failing.bin"
    const unrelatedPath = "raw/Z/unrelated.bin"
    const candidateExistingBytes = new Uint8Array([0, 200, 255, 17])
    const candidateFailingBytes = new Uint8Array([99, 0, 128])
    const candidateUnrelatedBytes = new Uint8Array([7, 8, 9])
    await failingCandidate.write(existingPath, new Blob([candidateExistingBytes]))
    await failingCandidate.write(failingPath, new Blob([candidateFailingBytes]))
    await failingCandidate.write(unrelatedPath, new Blob([candidateUnrelatedBytes]))
    failingCandidate.clearOperations()
    const migrationFailure = new Error("migration failed")
    const originalCandidateWrite = failingCandidate.write.bind(failingCandidate)
    let injectFailure = true
    failingCandidate.write = async (path, data) => {
      if (path === failingPath && injectFailure) {
        injectFailure = false
        failingCandidate.operations.push(`write-failed:${path}`)
        throw migrationFailure
      }
      await originalCandidateWrite(path, data)
    }
    const candidates: WorkspaceDriver[] = [failingCandidate, retryCandidate]
    let factoryCalls = 0
    const connector = new WorkspaceStore({
      mutationCoordinator: coordinator,
      createFsaDriver: () => candidates[factoryCalls++]!,
    })
    await expect(connector.init()).resolves.toBe("localStorage")
    const internals = connector as unknown as {
      driver: WorkspaceDriver
      fallback: LocalStorageDriver
    }
    const previousDriver = internals.driver
    await connector.write(existingPath, new Blob(["local-existing"]))
    await connector.write(createdPath, new Blob(["local-created"]))
    await connector.write(failingPath, new Blob(["local-failing"]))
    const localBefore = new Map<string, number[]>()
    for (const path of [existingPath, createdPath, failingPath]) {
      const bytes = new Uint8Array(await (await internals.fallback.read(path))!.arrayBuffer())
      localBefore.set(path, Array.from(bytes))
    }
    broker.ledger.length = 0

    await expect(connector.connectFolder()).rejects.toBe(migrationFailure)

    expect(connector.mode).toBe("localStorage")
    expect(internals.driver).toBe(previousDriver)
    for (const path of [existingPath, createdPath, failingPath]) {
      const bytes = new Uint8Array(await (await internals.fallback.read(path))!.arrayBuffer())
      expect(Array.from(bytes), path).toEqual(localBefore.get(path))
    }
    expect(Array.from(new Uint8Array(await (await failingCandidate.read(existingPath))!.arrayBuffer())))
      .toEqual(Array.from(candidateExistingBytes))
    expect(await failingCandidate.read(createdPath)).toBeNull()
    expect(Array.from(new Uint8Array(await (await failingCandidate.read(failingPath))!.arrayBuffer())))
      .toEqual(Array.from(candidateFailingBytes))
    expect(Array.from(new Uint8Array(await (await failingCandidate.read(unrelatedPath))!.arrayBuffer())))
      .toEqual(Array.from(candidateUnrelatedBytes))
    expect(broker.ledger).toContain("exit:exclusive:ardesia:workspace-mutation")

    const afterFailurePath = "raw/C/cache-after-failure.bin"
    await connector.write(afterFailurePath, new Blob(["lease-released"]))
    expect(await internals.fallback.read(afterFailurePath)).not.toBeNull()
    await expect(connector.connectFolder()).resolves.toBe(true)

    expect(factoryCalls).toBe(2)
    expect(connector.mode).toBe("fsa")
    expect(retryCandidate.operations).toContain(`write:${existingPath}`)
    expect(retryCandidate.operations).toContain(`write:${createdPath}`)
    expect(retryCandidate.operations).toContain(`write:${failingPath}`)
    expect(retryCandidate.operations).toContain(`write:${afterFailurePath}`)
    const afterRetryPath = "raw/C/write-after-retry.bin"
    await connector.write(afterRetryPath, new Blob(["new-candidate"]))
    expect(retryCandidate.operations).toContain(`write:${afterRetryPath}`)
  })

  it("associa il path alla failure di compensazione della migrazione FSA", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const candidate = new MockDriver()
    const existingPath = "raw/C/existing.bin"
    const createdPath = "raw/C/created.bin"
    const failingPath = "raw/C/failing.bin"
    await candidate.write(existingPath, new Blob(["candidate-original"]))
    const migrationFailure = new Error("candidate migration write failed")
    const rollbackFailure = new Error("candidate rollback delete failed")
    const originalWrite = candidate.write.bind(candidate)
    const originalDelete = candidate.delete.bind(candidate)
    let failMigration = true
    let failRollback = true
    candidate.write = async (path, data) => {
      if (path === failingPath && failMigration) {
        failMigration = false
        throw migrationFailure
      }
      await originalWrite(path, data)
    }
    candidate.delete = async (path) => {
      if (path === createdPath && failRollback) {
        failRollback = false
        throw rollbackFailure
      }
      await originalDelete(path)
    }
    const connector = new WorkspaceStore({
      mutationCoordinator: coordinator,
      createFsaDriver: () => candidate,
    })
    await connector.init()
    await connector.write(existingPath, new Blob(["local-existing"]))
    await connector.write(createdPath, new Blob(["local-created"]))
    await connector.write(failingPath, new Blob(["local-failing"]))

    let caught: unknown
    try {
      await connector.connectFolder()
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(WorkspaceCompensationError)
    const diagnostic = caught as WorkspaceCompensationError
    expect(diagnostic.operation).toBe("connect-folder-migration")
    expect(diagnostic.originalCause).toBe(migrationFailure)
    expect(diagnostic.rollbackFailures).toEqual([
      { path: createdPath, error: rollbackFailure },
    ])
    expect(diagnostic.message).not.toContain(createdPath)
    expect(diagnostic.cause).toBeInstanceOf(AggregateError)
    expect((diagnostic.cause as AggregateError).errors).toEqual([
      migrationFailure,
      rollbackFailure,
    ])
    expect(connector.mode).toBe("localStorage")
    expect(broker.ledger).toContain("exit:exclusive:ardesia:workspace-mutation")
  })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

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

  it("preserva MIME type nel roundtrip bundle", async () => {
    const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
    const entries: FileEntry[] = [
      { path: "raw/img.png", mtime: 3000, data: new Blob([pngBytes], { type: "image/png" }) },
      { path: "raw/data.bin", mtime: 3001, data: new Blob([new Uint8Array([0, 1, 2])]) },
    ]
    const blob = await createBundleBlob(entries)
    const parsed = await parseBundleBlob(blob)
    expect(parsed.length).toBe(2)
    const pngEntry = parsed.find((e) => e.path === "raw/img.png")
    expect(pngEntry).toBeDefined()
    expect(pngEntry!.data.type).toBe("image/png")
    const binEntry = parsed.find((e) => e.path === "raw/data.bin")
    expect(binEntry).toBeDefined()
    expect(binEntry!.data.type).toBe("application/octet-stream")
  })
})
