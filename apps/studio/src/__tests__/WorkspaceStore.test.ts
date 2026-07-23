// @vitest-environment jsdom
// MAESTRO-Studio — Test WorkspaceStore

import { describe, it, expect, beforeEach, vi } from "vitest"
import { WorkspaceCompensationError, WorkspaceStore } from "../store/WorkspaceStore"
import { type WorkspaceDriver, type FileEntry } from "../store/types"
import { createBundleBlob, parseBundleBlob } from "../store/zipBundle"
import { LocalStorageDriver } from "../store/drivers/localStorage"
import { roomPaths, validateRoomId } from "../store/roomPaths"
import {
  createLessonMutationCoordinator,
  createWebLocksMutationLockBroker,
  type LessonMutationCoordinator,
  type MutationLockBroker,
  type MutationLockMode,
  type MutationSafety,
  type MutationTryLockResult,
} from "../store/lessonMutationLock"
import {
  parseSessionYamlV2,
  serializeSessionYamlV2,
  sessionPaths,
  SessionPostWriteVerificationError,
  SessionYamlParseError,
} from "../store/sessionState"

// jsdom non espone localStorage funzionante — stub esplicito.
let storage: Record<string, string> = {}
let storageOperations: string[] = []

beforeEach(() => {
  vi.restoreAllMocks()
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
  readonly safety: MutationSafety
  readonly ledger: string[] = []
  private readonly states = new Map<string, LockState>()

  constructor(safety: MutationSafety = "origin-exclusive") {
    this.safety = safety
  }

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
          void this.runGranted(name, options.mode, work).then(resolve, reject)
        },
      }
      this.state(name).queue.push(queued)
      this.drain(name)
    })
  }

  tryRequest<T>(
    name: string,
    options: Readonly<{ mode: MutationLockMode }>,
    work: () => Promise<T>,
  ): Promise<MutationTryLockResult<T>> {
    this.ledger.push(`try:${options.mode}:${name}`)
    const state = this.state(name)
    const available = (
      state.queue.length === 0 &&
      !state.writer &&
      (options.mode === "shared" || state.readers === 0)
    )
    if (!available) {
      this.ledger.push(`miss:${options.mode}:${name}`)
      return Promise.resolve(Object.freeze({ acquired: false as const }))
    }
    if (options.mode === "shared") state.readers += 1
    else state.writer = true
    this.ledger.push(`enter:${options.mode}:${name}`)
    return this.runGranted(name, options.mode, work).then((value) => (
      Object.freeze({ acquired: true as const, value })
    ))
  }

  private async runGranted<T>(
    name: string,
    mode: MutationLockMode,
    work: () => Promise<T>,
  ): Promise<T> {
    try {
      return await work()
    } finally {
      const state = this.state(name)
      this.ledger.push(`exit:${mode}:${name}`)
      if (mode === "shared") state.readers -= 1
      else state.writer = false
      this.drain(name)
    }
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

  it("non espone ancora una lease clone o macro-import .lesson nella foundation S0A2", () => {
    const coordinator = createLessonMutationCoordinator(new AdversarialMutationLockBroker())
    expect("withLessonImport" in coordinator).toBe(false)
    expect("registerActiveLesson" in coordinator).toBe(true)
  })

  it("registra activity shared case-folded e probe exclusive non si accoda", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const activityLock = "ardesia:lesson-active:c"

    const first = await coordinator.registerActiveLesson("C")
    const second = await coordinator.registerActiveLesson("c")
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(second)).toBe(true)
    expect(first.lessonId).toBe("C")
    expect(second.lessonId).toBe("c")
    expect(broker.ledger.filter((entry) => entry === `enter:shared:${activityLock}`)).toHaveLength(2)

    const firstProbe = coordinator.probeInactiveLesson("C")
    expect(broker.ledger.at(-1)).toBe(`miss:exclusive:${activityLock}`)
    await expect(firstProbe).resolves.toEqual({ status: "unavailable", reason: "active" })
    expect(broker.ledger).not.toContain(`request:exclusive:${activityLock}`)

    const firstRelease = first.release()
    expect(first.release()).toBe(firstRelease)
    await firstRelease
    expect(broker.ledger.filter((entry) => entry === `exit:shared:${activityLock}`)).toHaveLength(1)
    await expect(coordinator.probeInactiveLesson("c")).resolves.toEqual({
      status: "unavailable",
      reason: "active",
    })

    const secondRelease = second.release()
    expect(second.release()).toBe(secondRelease)
    await secondRelease
    expect(broker.ledger.filter((entry) => entry === `exit:shared:${activityLock}`)).toHaveLength(2)

    const inactive = await coordinator.probeInactiveLesson("c")
    expect(inactive).toEqual({ status: "inactive" })
    expect(broker.ledger.slice(-2)).toEqual([
      `enter:exclusive:${activityLock}`,
      `exit:exclusive:${activityLock}`,
    ])
  })

  it("separa activity di lesson diverse e propaga rejection prima del grant", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const registration = await coordinator.registerActiveLesson("C")

    await expect(coordinator.probeInactiveLesson("D")).resolves.toEqual({ status: "inactive" })
    expect(broker.ledger).toContain("enter:shared:ardesia:lesson-active:c")
    expect(broker.ledger).toContain("enter:exclusive:ardesia:lesson-active:d")
    await registration.release()

    const rejection = new Error("broker rejected before grant")
    const rejectingBroker: MutationLockBroker = {
      safety: "origin-exclusive",
      request: () => Promise.reject(rejection),
      tryRequest: () => Promise.resolve({ acquired: false }),
    }
    const rejectingCoordinator = createLessonMutationCoordinator(rejectingBroker)
    await expect(rejectingCoordinator.registerActiveLesson("C")).rejects.toBe(rejection)
  })

  it("fallisce closed local-only senza consultare il broker e delega dal WorkspaceStore", async () => {
    const localBroker = new AdversarialMutationLockBroker("local-only")
    const coordinator = createLessonMutationCoordinator(localBroker)
    const guardedStore = new WorkspaceStore({ mutationCoordinator: coordinator })

    expect(guardedStore.mutationSafety).toBe("local-only")
    await expect(guardedStore.probeInactiveLesson("C")).resolves.toEqual({
      status: "unavailable",
      reason: "local-only",
    })
    expect(localBroker.ledger).toEqual([])

    const registration = await guardedStore.registerActiveLesson("C")
    expect(localBroker.ledger).toContain("enter:shared:ardesia:lesson-active:c")
    await registration.release()
    expect(localBroker.ledger).toContain("exit:shared:ardesia:lesson-active:c")
  })

  it("converte un lesson id invalido in rejection Promise senza throw sincrono", async () => {
    const broker = new AdversarialMutationLockBroker()
    const guardedStore = new WorkspaceStore({
      mutationCoordinator: createLessonMutationCoordinator(broker),
    })
    let registration: ReturnType<WorkspaceStore["registerActiveLesson"]> | undefined

    expect(() => {
      registration = guardedStore.registerActiveLesson("private/lesson")
    }).not.toThrow()
    expect(registration).toBeDefined()
    await expect(registration).rejects.toThrow(/room/i)
    expect(broker.ledger).toEqual([])
  })

  it("il facade WorkspaceStore restituisce esattamente handle e probe del coordinator iniettato", async () => {
    const releaseCompletion = Promise.resolve()
    const handle = Object.freeze({ lessonId: "C", release: () => releaseCompletion })
    const calls: string[] = []
    const coordinator: LessonMutationCoordinator = {
      safety: "origin-exclusive",
      withPathMutation: async (_path, work) => work(),
      withWorkspaceExclusive: async (work) => work(),
      registerActiveLesson: async (lessonId) => {
        calls.push(`register:${lessonId}`)
        return handle
      },
      probeInactiveLesson: async (lessonId) => {
        calls.push(`probe:${lessonId}`)
        return Object.freeze({ status: "inactive" as const })
      },
    }
    const guardedStore = new WorkspaceStore({ mutationCoordinator: coordinator })

    await expect(guardedStore.registerActiveLesson("C")).resolves.toBe(handle)
    await expect(guardedStore.probeInactiveLesson("c")).resolves.toEqual({ status: "inactive" })
    expect(calls).toEqual(["register:C", "probe:c"])
  })

  it("adatta Web Locks con ifAvailable intrinseco e completa soltanto dopo il rilascio", async () => {
    const calls: Array<{ name: string; options: LockOptions }> = []
    const lifecycle: string[] = []
    let grantTry = false
    const fakeLock = Object.freeze({ name: "controlled", mode: "exclusive" as const }) as Lock
    const lockManager = {
      request: <T>(
        name: string,
        options: LockOptions,
        callback: (lock: Lock | null) => T | PromiseLike<T>,
      ): Promise<T> => {
        calls.push({ name, options: { ...options } })
        const granted = options.ifAvailable === true ? grantTry : true
        lifecycle.push(`callback:${granted ? "grant" : "null"}`)
        return Promise.resolve(callback(granted ? fakeLock : null)).finally(() => {
          lifecycle.push("unlock")
        })
      },
    } as unknown as LockManager
    const broker = createWebLocksMutationLockBroker(lockManager)

    const normal = broker.request("normal", { mode: "shared" }, async () => {
      lifecycle.push("normal-work")
      return 7
    })
    await expect(normal).resolves.toBe(7)
    expect(calls[0]).toEqual({ name: "normal", options: { mode: "shared" } })
    expect(lifecycle.at(-1)).toBe("unlock")

    const unavailable = broker.tryRequest("try", { mode: "exclusive" }, async () => {
      throw new Error("work must not run")
    })
    await expect(unavailable).resolves.toEqual({ acquired: false })
    expect(calls[1]).toEqual({
      name: "try",
      options: { mode: "exclusive", ifAvailable: true },
    })

    grantTry = true
    let workCalls = 0
    const acquired = broker.tryRequest("try", { mode: "exclusive" }, async () => {
      workCalls += 1
      lifecycle.push("try-work")
      return "value"
    })
    await expect(acquired).resolves.toEqual({ acquired: true, value: "value" })
    expect(workCalls).toBe(1)
    expect(lifecycle.at(-1)).toBe("unlock")

    const rejection = new Error("controlled rejection")
    await expect(broker.tryRequest("try", { mode: "exclusive" }, async () => {
      throw rejection
    })).rejects.toBe(rejection)
    expect(lifecycle.at(-1)).toBe("unlock")
  })

  it("il broker fallback completa una request soltanto dopo unlock e drain causale", async () => {
    const coordinator = createLessonMutationCoordinator()
    expect(coordinator.safety).toBe("local-only")
    const broker = (
      coordinator as unknown as { broker: MutationLockBroker }
    ).broker
    expect(broker).toBeDefined()
    const lockName = "ardesia:test:s0a2:settlement"
    const firstEntered = deferred()
    const releaseFirst = deferred()
    let secondEntered = false

    const first = broker.request(lockName, { mode: "exclusive" }, async () => {
      firstEntered.resolve()
      await releaseFirst.promise
      return "first"
    })
    await firstEntered.promise
    const second = broker.request(lockName, { mode: "exclusive" }, async () => {
      secondEntered = true
      return "second"
    })

    releaseFirst.resolve()
    await expect(first).resolves.toBe("first")
    expect(secondEntered).toBe(true)
    await expect(second).resolves.toBe("second")
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

const SESSION_A = "10000000-0000-4000-8000-000000000001"
const SESSION_B = "20000000-0000-4000-8000-000000000002"
const SESSION_PATH_A = `raw/lesson-A/${SESSION_A}/session.yaml`
const H_CREATE = "13585ca24497dd02d65bbb0327d65b5b9ece5d0aaa75ddeedb4a2b3f38a8cf10"
const H_DIFFERENT = "d414f608b2cc6142df622d351237b4729017146297c3b1afb198e2cb10407f07"
const H_UPDATED = "42f590f90f191ad7711cfda98435a674e83e0d01ab297ae959b3e38ba4d7628f"
const H_STALE_OBSERVED = "d833a47bc8b6465b97a379b2ad04e62ec50515bf379dec9064e1690529f671e0"
const H_CONNECT_CAS_INITIAL = "816dc2e5d10b80716b530d7de095b295fccc028744eae02048b0a83ccd73903f"
const H_CONNECT_CAS_UPDATED = "3727276581d76a570d604420e84cbd55dae949d10cfe595dacd0d19a0ff53257"

const YAML_CREATE =
  `v: 2\n` +
  `lessonId: lesson-A\n` +
  `sessionId: ${SESSION_A}\n` +
  `created: 1784491200000\n` +
  `revision: 0\n` +
  `audioConsent: false\n` +
  `audioStartEpoch: null\n`

const YAML_DIFFERENT = YAML_CREATE.replace(
  "created: 1784491200000",
  "created: 1784491200001",
)
const YAML_UPDATED = YAML_CREATE
  .replace("revision: 0", "revision: 1")
  .replace("audioConsent: false", "audioConsent: true")
  .replace("audioStartEpoch: null", "audioStartEpoch: 1784491201000")
const YAML_STALE_OBSERVED = YAML_CREATE.replace("revision: 0", "revision: 2")
const YAML_CONNECT_CAS_INITIAL = YAML_CREATE
  .replace("created: 1784491200000", "created: 1784491200123")
  .replace("revision: 0", "revision: 7")
const YAML_CONNECT_CAS_UPDATED = YAML_CONNECT_CAS_INITIAL
  .replace("revision: 7", "revision: 8")
  .replace("audioConsent: false", "audioConsent: true")
  .replace("audioStartEpoch: null", "audioStartEpoch: 1784491201999")

function fixtureBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function fixtureBlob(bytes: Uint8Array, type = ""): Blob {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new Blob([copy.buffer], type ? { type } : undefined)
}

class DeferredPathCoordinator implements LessonMutationCoordinator {
  readonly safety = "origin-exclusive" as const
  readonly paths: string[] = []
  workCalls = 0
  private readonly releaseGate = deferred()

  withPathMutation<T>(path: string, work: () => Promise<T>): Promise<T> {
    this.paths.push(path)
    return this.releaseGate.promise.then(() => {
      this.workCalls += 1
      return work()
    })
  }

  withWorkspaceExclusive<T>(work: () => Promise<T>): Promise<T> { return work() }
  async registerActiveLesson(lessonId: string) {
    return Object.freeze({ lessonId, release: async () => undefined })
  }
  async probeInactiveLesson() { return Object.freeze({ status: "inactive" as const }) }
  release(): void { this.releaseGate.resolve() }
}

type AccessLedger = Readonly<{
  proxy: Map<string, number>
  getter: Map<string, number>
}>

function adversarialProxy<T extends object>(
  first: Readonly<Record<string, unknown>>,
  second: Readonly<Record<string, unknown>>,
): Readonly<{ value: T; ledger: AccessLedger }> {
  const proxyLedger = new Map<string, number>()
  const getterLedger = new Map<string, number>()
  const target: Record<string, unknown> = {}
  for (const key of Object.keys(first)) {
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get: () => {
        const call = (getterLedger.get(key) ?? 0) + 1
        getterLedger.set(key, call)
        if (call === 1) return first[key]
        if (call === 2) return second[key]
        throw new Error("THIRD_ACCESS_SENTINEL")
      },
    })
  }
  const value = new Proxy(target, {
    get: (proxyTarget, property, receiver) => {
      if (typeof property === "string" && property in first) {
        proxyLedger.set(property, (proxyLedger.get(property) ?? 0) + 1)
      }
      return Reflect.get(proxyTarget, property, receiver)
    },
  }) as T
  return Object.freeze({
    value,
    ledger: Object.freeze({ proxy: proxyLedger, getter: getterLedger }),
  })
}

function expectExactOne(ledger: AccessLedger, fields: readonly string[]): void {
  for (const field of fields) {
    expect(ledger.proxy.get(field), `proxy ${field}`).toBe(1)
    expect(ledger.getter.get(field), `getter ${field}`).toBe(1)
  }
}

async function putFixture(driver: MockDriver, path: string, yaml: string): Promise<void> {
  await driver.write(path, fixtureBlob(fixtureBytes(yaml), "text/yaml"))
  driver.clearOperations()
}

function expectVerificationPhase(
  caught: unknown,
  phase: "create-readback" | "cas-readback",
): void {
  expect(caught).toBeInstanceOf(SessionPostWriteVerificationError)
  expect((caught as SessionPostWriteVerificationError).phase).toBe(phase)
}

async function captureRejection(work: Promise<unknown>): Promise<unknown> {
  try {
    await work
  } catch (error) {
    return error
  }
  throw new Error("expected rejection")
}

describe("SessionYamlV2 authority", () => {
  it("espone dal modulo sessionState soltanto il boundary puro previsto", async () => {
    const sessionState = await import("../store/sessionState")

    const forbiddenExports = [
      "SessionPort",
      "createSessionOnceAtPort",
      "updateSessionAudioCASAtPort",
    ]
    for (const exportName of forbiddenExports) {
      expect(Object.keys(sessionState), exportName).not.toContain(exportName)
    }
  })

  it("deriva path distinti dalla coppia lesson/session senza usare il flat legacy", () => {
    expect(sessionPaths({ lessonId: "lesson-A", sessionId: SESSION_A })).toEqual({
      root: `raw/lesson-A/${SESSION_A}/`,
      session: SESSION_PATH_A,
      audioDir: `raw/lesson-A/${SESSION_A}/audio/`,
    })
    expect(sessionPaths({ lessonId: "lesson-A", sessionId: SESSION_B }).session)
      .not.toBe(SESSION_PATH_A)
    expect(sessionPaths({ lessonId: "lesson-B", sessionId: SESSION_A }).session)
      .not.toBe(SESSION_PATH_A)
    expect(sessionPaths({ lessonId: "lesson-A", sessionId: SESSION_A }).session)
      .not.toBe("raw/session.yaml")
    expect(sessionPaths({ lessonId: "lesson-A", sessionId: SESSION_A }).session)
      .not.toBe("raw/lesson-A/session.yaml")
  })

  it("serializza sette righe byte-exact e il parser schema-only fa roundtrip", () => {
    const value = {
      v: 2 as const,
      lessonId: "lesson-A",
      sessionId: SESSION_A,
      created: 1784491200000,
      revision: 0,
      audioConsent: false,
      audioStartEpoch: null,
    }
    const bytes = serializeSessionYamlV2(value)
    expect(bytes).toEqual(fixtureBytes(YAML_CREATE))
    expect(bytes.byteLength).toBe(149)
    expect(parseSessionYamlV2(bytes)).toEqual(value)

    const embeddedOther = fixtureBytes(YAML_CREATE
      .replace("lessonId: lesson-A", "lessonId: lesson-B")
      .replace(`sessionId: ${SESSION_A}`, `sessionId: ${SESSION_B}`))
    expect(parseSessionYamlV2(embeddedOther)).toMatchObject({
      lessonId: "lesson-B",
      sessionId: SESSION_B,
    })
  })

  const invalidCases: ReadonlyArray<Readonly<{
    name: string
    bytes: Uint8Array
    code: "invalid-utf8" | "noncanonical-utf8" | "invalid-grammar" | "invalid-schema"
  }>> = [
    { name: "BOM", bytes: new Uint8Array([0xef, 0xbb, 0xbf, ...fixtureBytes(YAML_CREATE)]), code: "noncanonical-utf8" },
    { name: "continuation isolata", bytes: new Uint8Array([0x80]), code: "invalid-utf8" },
    { name: "multibyte troncato", bytes: new Uint8Array([0xe2, 0x82]), code: "invalid-utf8" },
    { name: "overlong", bytes: new Uint8Array([0xc0, 0xaf]), code: "invalid-utf8" },
    { name: "NUL", bytes: new Uint8Array([...fixtureBytes(YAML_CREATE), 0]), code: "invalid-grammar" },
    { name: "CRLF", bytes: fixtureBytes(YAML_CREATE.replaceAll("\n", "\r\n")), code: "invalid-grammar" },
    { name: "newline mancante", bytes: fixtureBytes(YAML_CREATE.slice(0, -1)), code: "invalid-grammar" },
    { name: "newline extra", bytes: fixtureBytes(`${YAML_CREATE}\n`), code: "invalid-grammar" },
    { name: "chiave duplicata", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "created: 0")), code: "invalid-grammar" },
    { name: "chiave unknown", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "unknown: 0")), code: "invalid-grammar" },
    { name: "chiave mancante", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0\n", "")), code: "invalid-grammar" },
    { name: "chiavi riordinate", bytes: fixtureBytes(YAML_CREATE.replace("created: 1784491200000\nrevision: 0", "revision: 0\ncreated: 1784491200000")), code: "invalid-grammar" },
    { name: "quote", bytes: fixtureBytes(YAML_CREATE.replace("lessonId: lesson-A", 'lessonId: "lesson-A"')), code: "invalid-grammar" },
    { name: "commento con raw marker", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "revision: 0 # RAW_YAML_SECRET_SENTINEL")), code: "invalid-grammar" },
    { name: "tag", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "revision: !!int 0")), code: "invalid-grammar" },
    { name: "alias", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "revision: *r")), code: "invalid-grammar" },
    { name: "document marker", bytes: fixtureBytes(`---\n${YAML_CREATE}`), code: "invalid-grammar" },
    { name: "multiline", bytes: fixtureBytes(YAML_CREATE.replace("lessonId: lesson-A", "lessonId: |\n  LEAK_LESSON_SENTINEL")), code: "invalid-grammar" },
    { name: "negativo", bytes: fixtureBytes(YAML_CREATE.replace("created: 1784491200000", "created: -1")), code: "invalid-schema" },
    { name: "decimale", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "revision: 1.0")), code: "invalid-schema" },
    { name: "esponente", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "revision: 1e2")), code: "invalid-schema" },
    { name: "leading zero", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "revision: 00")), code: "invalid-schema" },
    { name: "oltre safe integer", bytes: fixtureBytes(YAML_CREATE.replace("revision: 0", "revision: 9007199254740992")), code: "invalid-schema" },
    { name: "UUID uppercase", bytes: fixtureBytes(YAML_CREATE.replace(SESSION_A, "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF")), code: "invalid-schema" },
    { name: "UUID non v4", bytes: fixtureBytes(YAML_CREATE.replace(SESSION_A, "10000000-0000-3000-8000-000000000001")), code: "invalid-schema" },
    { name: "UUID variant", bytes: fixtureBytes(YAML_CREATE.replace(SESSION_A, "10000000-0000-4000-7000-000000000001")), code: "invalid-schema" },
    { name: "false con epoch", bytes: fixtureBytes(YAML_CREATE.replace("audioStartEpoch: null", "audioStartEpoch: 1")), code: "invalid-schema" },
    { name: "true con null", bytes: fixtureBytes(YAML_CREATE.replace("audioConsent: false", "audioConsent: true")), code: "invalid-schema" },
    { name: "trailing ASCII", bytes: fixtureBytes(`${YAML_CREATE}RAW_YAML_SECRET_SENTINEL`), code: "invalid-grammar" },
    { name: "trailing UTF-8 invalido", bytes: new Uint8Array([...fixtureBytes(YAML_CREATE), 0x80]), code: "invalid-utf8" },
  ]

  it.each(invalidCases)("rifiuta $name con code e messaggio non data-bearing", ({ bytes, code }) => {
    let caught: unknown
    try {
      parseSessionYamlV2(bytes)
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(SessionYamlParseError)
    const diagnostic = caught as SessionYamlParseError
    expect(diagnostic.code).toBe(code)
    expect(diagnostic.message).toBe("SessionYamlV2 parse failed")
    expect(String(diagnostic)).toBe("SessionYamlParseError: SessionYamlV2 parse failed")
    expect(diagnostic.message).not.toContain("LEAK_LESSON_SENTINEL")
    expect(diagnostic.message).not.toContain("LEAK_SESSION_SENTINEL")
    expect(diagnostic.message).not.toContain("RAW_YAML_SECRET_SENTINEL")
    expect(String(diagnostic)).not.toContain("raw/")
  })

  it.each([
    "v",
    "lessonId",
    "sessionId",
    "created",
    "revision",
    "audioConsent",
    "audioStartEpoch",
  ])("rifiuta una seconda occorrenza della chiave %s", (key) => {
    const line = YAML_CREATE.split("\n").find((candidate) => candidate.startsWith(`${key}: `))!
    const duplicate = fixtureBytes(YAML_CREATE.replace(`${line}\n`, `${line}\n${line}\n`))
    expect(() => parseSessionYamlV2(duplicate)).toThrow(SessionYamlParseError)
    try {
      parseSessionYamlV2(duplicate)
    } catch (error) {
      expect((error as SessionYamlParseError).code).toBe("invalid-grammar")
    }
  })

  it("conserva il decoder error solo come cause del boundary fatal", () => {
    let caught: unknown
    try {
      parseSessionYamlV2(new Uint8Array([0x80]))
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(SessionYamlParseError)
    expect((caught as SessionYamlParseError).code).toBe("invalid-utf8")
    expect((caught as SessionYamlParseError).cause).toBeDefined()
  })

  it("create-once produce H_CREATE, retry idempotente e conflitto diverso con hash indipendenti", async () => {
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }

    const created = await sessionStore.createSessionOnce(identity, { created: 1784491200000 })
    expect(created.kind).toBe("created")
    if (created.kind !== "created") throw new Error("created result required")
    expect(created.snapshot.sha256).toBe(H_CREATE)
    expect(await created.snapshot.bytes.text()).toBe(YAML_CREATE)
    expect(created.snapshot.value).toMatchObject({ revision: 0, audioConsent: false })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)

    const retry = await sessionStore.createSessionOnce(identity, { created: 1784491200000 })
    expect(retry.kind).toBe("idempotent")
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)

    await putFixture(driver, SESSION_PATH_A, YAML_DIFFERENT)
    const conflict = await sessionStore.createSessionOnce(identity, { created: 1784491200000 })
    expect(conflict).toEqual({
      kind: "conflict",
      reason: "different-existing",
      observedSha256: H_DIFFERENT,
    })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
  })

  it("CAS usa H_CREATE indipendente, produce H_UPDATED e rende il retry stale idempotente", async () => {
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }

    const updated = await sessionStore.updateSessionAudioCAS(identity, {
      expectedSha256: H_CREATE,
      audioConsent: true,
      audioStartEpoch: 1784491201000,
    })
    expect(updated.kind).toBe("updated")
    if (updated.kind !== "updated") throw new Error("updated result required")
    expect(updated.snapshot.sha256).toBe(H_UPDATED)
    expect(await updated.snapshot.bytes.text()).toBe(YAML_UPDATED)
    expect(updated.snapshot.value).toMatchObject({
      created: 1784491200000,
      revision: 1,
      audioConsent: true,
      audioStartEpoch: 1784491201000,
    })

    const retry = await sessionStore.updateSessionAudioCAS(identity, {
      expectedSha256: H_CREATE,
      audioConsent: true,
      audioStartEpoch: 1784491201000,
    })
    expect(retry.kind).toBe("idempotent")
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)
  })

  it("CAS osserva stale hash prima della write e conserva l'exact observed SHA", async () => {
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    await putFixture(driver, SESSION_PATH_A, YAML_STALE_OBSERVED)

    await expect(sessionStore.updateSessionAudioCAS(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      {
        expectedSha256: H_CREATE,
        audioConsent: true,
        audioStartEpoch: 1784491201000,
      },
    )).resolves.toEqual({
      kind: "conflict",
      reason: "stale-hash",
      observedSha256: H_STALE_OBSERVED,
    })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
  })

  it("CAS distingue absent, corrupt e identity mismatch senza mutare", async () => {
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }
    const input = {
      expectedSha256: H_CREATE,
      audioConsent: true,
      audioStartEpoch: 1784491201000,
    }
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    await expect(sessionStore.updateSessionAudioCAS(identity, input))
      .resolves.toEqual({ kind: "absent" })

    await driver.write(SESSION_PATH_A, new Blob([new Uint8Array([0x80])]))
    driver.clearOperations()
    await expect(sessionStore.updateSessionAudioCAS(identity, input)).resolves.toEqual({
      kind: "corrupt",
      reason: "invalid-utf8",
      observedSha256: "76be8b528d0075f7aae98d6fa57a6d3c83ae480a8469e668d7b0af968995ac71",
    })

    const mismatchYaml = YAML_CREATE
      .replace("lessonId: lesson-A", "lessonId: lesson-B")
      .replace(SESSION_A, SESSION_B)
    await putFixture(driver, SESSION_PATH_A, mismatchYaml)
    await expect(sessionStore.updateSessionAudioCAS(identity, input)).resolves.toEqual({
      kind: "conflict",
      reason: "identity-mismatch",
      observedSha256: "732a06f03bfdba8fabe73b2cf9d4e905e1799d7fbfc0aceb02305f81a7835701",
    })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
  })

  it("create non legge né modifica sessioni sibling o path flat sentinella", async () => {
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    const sentinels = new Map<string, string>([
      [`raw/lesson-A/${SESSION_B}/session.yaml`, "A/SB sentinel"],
      [`raw/lesson-B/${SESSION_A}/session.yaml`, "B/SA sentinel"],
      ["raw/session.yaml", "flat sentinel"],
      ["raw/lesson-A/session.yaml", "room-flat sentinel"],
    ])
    for (const [path, text] of sentinels) await driver.write(path, new Blob([text]))
    driver.clearOperations()

    await expect(sessionStore.createSessionOnce(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { created: 1784491200000 },
    )).resolves.toMatchObject({ kind: "created" })
    for (const [path, text] of sentinels) {
      expect(await (await driver.read(path))!.text(), path).toBe(text)
    }
    const sessionOperations = driver.operations.filter((entry) => (
      entry.startsWith("read:") || entry.startsWith("write:")
    ))
    expect(sessionOperations.slice(0, 3)).toEqual([
      `read:${SESSION_PATH_A}`,
      `write:${SESSION_PATH_A}`,
      `read:${SESSION_PATH_A}`,
    ])
  })

  it("fa hash prima del parse e distingue corrupt iniziale da identity mismatch", async () => {
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    const corruptBytes = new Uint8Array([0x80])
    await driver.write(SESSION_PATH_A, new Blob([corruptBytes]))
    driver.clearOperations()
    const corrupt = await sessionStore.createSessionOnce(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { created: 1784491200000 },
    )
    expect(corrupt).toEqual({
      kind: "corrupt",
      reason: "invalid-utf8",
      observedSha256: "76be8b528d0075f7aae98d6fa57a6d3c83ae480a8469e668d7b0af968995ac71",
    })

    const otherYaml = YAML_CREATE
      .replace("lessonId: lesson-A", "lessonId: lesson-B")
      .replace(SESSION_A, SESSION_B)
    await putFixture(driver, SESSION_PATH_A, otherYaml)
    const expectedOtherHash = "732a06f03bfdba8fabe73b2cf9d4e905e1799d7fbfc0aceb02305f81a7835701"
    const mismatch = await sessionStore.createSessionOnce(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { created: 1784491200000 },
    )
    expect(mismatch).toEqual({
      kind: "conflict",
      reason: "identity-mismatch",
      observedSha256: expectedOtherHash,
    })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
  })

  it.each(["corrupt", "identity-mismatch"] as const)(
    "WebCrypto rejection su %s precede parse/identity e propaga identity-exact",
    async (fixture) => {
      const sentinel = Object.freeze({ sentinel: `digest-before-${fixture}` })
      const driver = new MockDriver()
      const yaml = fixture === "corrupt"
        ? new Uint8Array([0x80])
        : fixtureBytes(YAML_CREATE
            .replace("lessonId: lesson-A", "lessonId: lesson-B")
            .replace(SESSION_A, SESSION_B))
      await driver.write(SESSION_PATH_A, fixtureBlob(yaml))
      driver.clearOperations()
      const sessionStore = new WorkspaceStore()
      withMockDriver(sessionStore, driver)
      const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest")
        .mockRejectedValueOnce(sentinel)
      await expect(sessionStore.createSessionOnce(
        { lessonId: "lesson-A", sessionId: SESSION_A },
        { created: 1784491200000 },
      )).rejects.toBe(sentinel)
      expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
      digestSpy.mockRestore()
    },
  )

  it("snapshotta ogni getter create exact-one prima del work deferred", async () => {
    const coordinator = new DeferredPathCoordinator()
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(sessionStore, driver)
    const identity = adversarialProxy<{ lessonId: string; sessionId: string }>(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { lessonId: "lesson-B", sessionId: SESSION_B },
    )
    const input = adversarialProxy<{ created: number }>(
      { created: 1784491200000 },
      { created: 1784491200001 },
    )
    const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest")

    const pending = sessionStore.createSessionOnce(identity.value, input.value)
    expectExactOne(identity.ledger, ["lessonId", "sessionId"])
    expectExactOne(input.ledger, ["created"])
    expect(coordinator.paths).toEqual([SESSION_PATH_A])
    expect(coordinator.workCalls).toBe(0)
    expect(driver.operations).toEqual([])
    expect(digestSpy).not.toHaveBeenCalled()

    coordinator.release()
    const result = await pending
    expect(result.kind).toBe("created")
    if (result.kind !== "created") throw new Error("created result required")
    expect(result.snapshot.sha256).toBe(H_CREATE)
    expectExactOne(identity.ledger, ["lessonId", "sessionId"])
    expectExactOne(input.ledger, ["created"])
    digestSpy.mockRestore()
  })

  it("snapshotta ogni getter CAS exact-one e costruisce il candidate solo dopo release", async () => {
    const coordinator = new DeferredPathCoordinator()
    const driver = new MockDriver()
    await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
    const sessionStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(sessionStore, driver)
    const identity = adversarialProxy<{ lessonId: string; sessionId: string }>(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { lessonId: "lesson-B", sessionId: SESSION_B },
    )
    const input = adversarialProxy<{
      expectedSha256: string
      audioConsent: boolean
      audioStartEpoch: number | null
    }>(
      {
        expectedSha256: H_CREATE,
        audioConsent: true,
        audioStartEpoch: 1784491201000,
      },
      {
        expectedSha256: H_DIFFERENT,
        audioConsent: false,
        audioStartEpoch: null,
      },
    )
    const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest")

    const pending = sessionStore.updateSessionAudioCAS(identity.value, input.value)
    expectExactOne(identity.ledger, ["lessonId", "sessionId"])
    expectExactOne(input.ledger, ["expectedSha256", "audioConsent", "audioStartEpoch"])
    expect(coordinator.paths).toEqual([SESSION_PATH_A])
    expect(coordinator.workCalls).toBe(0)
    expect(driver.operations).toEqual([])
    expect(digestSpy).not.toHaveBeenCalled()

    coordinator.release()
    const result = await pending
    expect(result.kind).toBe("updated")
    if (result.kind !== "updated") throw new Error("updated result required")
    expect(result.snapshot.sha256).toBe(H_UPDATED)
    expectExactOne(identity.ledger, ["lessonId", "sessionId"])
    expectExactOne(input.ledger, ["expectedSha256", "audioConsent", "audioStartEpoch"])
    digestSpy.mockRestore()
  })

  it("stacca gli alias mutabili create e CAS nella riga successiva alla chiamata", async () => {
    const createCoordinator = new DeferredPathCoordinator()
    const createDriver = new MockDriver()
    const createStore = new WorkspaceStore({ mutationCoordinator: createCoordinator })
    withMockDriver(createStore, createDriver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }
    const createInput = { created: 1784491200000 }
    const createPending = createStore.createSessionOnce(identity, createInput)
    identity.lessonId = "lesson-B"
    identity.sessionId = SESSION_B
    createInput.created = 1784491200001
    createCoordinator.release()
    const created = await createPending
    expect(created.kind).toBe("created")
    if (created.kind !== "created") throw new Error("created result required")
    expect(created.snapshot.path).toBe(SESSION_PATH_A)
    expect(created.snapshot.sha256).toBe(H_CREATE)

    const casCoordinator = new DeferredPathCoordinator()
    const casDriver = new MockDriver()
    await putFixture(casDriver, SESSION_PATH_A, YAML_CREATE)
    const casStore = new WorkspaceStore({ mutationCoordinator: casCoordinator })
    withMockDriver(casStore, casDriver)
    const casIdentity = { lessonId: "lesson-A", sessionId: SESSION_A }
    const casInput = {
      expectedSha256: H_CREATE,
      audioConsent: true,
      audioStartEpoch: 1784491201000 as number | null,
    }
    const casPending = casStore.updateSessionAudioCAS(casIdentity, casInput)
    casIdentity.lessonId = "lesson-B"
    casIdentity.sessionId = SESSION_B
    casInput.expectedSha256 = H_DIFFERENT
    casInput.audioConsent = false
    casInput.audioStartEpoch = null
    casCoordinator.release()
    const updated = await casPending
    expect(updated.kind).toBe("updated")
    if (updated.kind !== "updated") throw new Error("updated result required")
    expect(updated.snapshot.path).toBe(SESSION_PATH_A)
    expect(updated.snapshot.sha256).toBe(H_UPDATED)
  })

  it("rigetta caller input invalido come Promise prima di coordinator e driver", async () => {
    const paths: string[] = []
    const coordinator: LessonMutationCoordinator = {
      safety: "origin-exclusive",
      withPathMutation: async (path, work) => {
        paths.push(path)
        return work()
      },
      withWorkspaceExclusive: async (work) => work(),
      registerActiveLesson: async (lessonId) => Object.freeze({ lessonId, release: async () => undefined }),
      probeInactiveLesson: async () => Object.freeze({ status: "inactive" }),
    }
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(sessionStore, driver)
    let invalidCreate: Promise<unknown> | undefined
    expect(() => {
      invalidCreate = sessionStore.createSessionOnce(
        { lessonId: "private/lesson", sessionId: SESSION_A },
        { created: -1 },
      )
    }).not.toThrow()
    await expect(invalidCreate).rejects.toBeInstanceOf(Error)
    await expect(sessionStore.updateSessionAudioCAS(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { expectedSha256: "not-a-hash", audioConsent: true, audioStartEpoch: null },
    )).rejects.toBeInstanceOf(Error)
    expect(paths).toEqual([])
    expect(driver.operations).toEqual([])
  })

  it.each([
    ["create session uppercase", () => ({
      kind: "create" as const,
      identity: { lessonId: "lesson-A", sessionId: "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF" },
      input: { created: 1784491200000 },
    })],
    ["create created fractional", () => ({
      kind: "create" as const,
      identity: { lessonId: "lesson-A", sessionId: SESSION_A },
      input: { created: 1.5 },
    })],
    ["CAS false plus epoch", () => ({
      kind: "cas" as const,
      identity: { lessonId: "lesson-A", sessionId: SESSION_A },
      input: { expectedSha256: H_CREATE, audioConsent: false, audioStartEpoch: 1 },
    })],
    ["CAS true plus null", () => ({
      kind: "cas" as const,
      identity: { lessonId: "lesson-A", sessionId: SESSION_A },
      input: { expectedSha256: H_CREATE, audioConsent: true, audioStartEpoch: null },
    })],
  ])("%s rigetta prima di coordinator/driver", async (_name, buildCase) => {
    const paths: string[] = []
    const coordinator: LessonMutationCoordinator = {
      safety: "origin-exclusive",
      withPathMutation: async (path, work) => {
        paths.push(path)
        return work()
      },
      withWorkspaceExclusive: async (work) => work(),
      registerActiveLesson: async (lessonId) => Object.freeze({ lessonId, release: async () => undefined }),
      probeInactiveLesson: async () => Object.freeze({ status: "inactive" }),
    }
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(sessionStore, driver)
    const invalid = buildCase()
    const pending = invalid.kind === "create"
      ? sessionStore.createSessionOnce(invalid.identity, invalid.input)
      : sessionStore.updateSessionAudioCAS(invalid.identity, invalid.input)
    await expect(pending).rejects.toBeInstanceOf(Error)
    expect(paths).toEqual([])
    expect(driver.operations).toEqual([])
  })

  it.each(["null", "identity", "bytes", "parse"] as const)(
    "create read-back %s rigetta con classe e phase nominali",
    async (anomaly) => {
      const driver = new MockDriver()
      const sessionStore = new WorkspaceStore()
      withMockDriver(sessionStore, driver)
      let reads = 0
      driver.read = async (path) => {
        driver.operations.push(`read:${path}`)
        reads += 1
        if (reads === 1 || anomaly === "null") return null
        if (anomaly === "parse") return new Blob([new Uint8Array([0x80])])
        if (anomaly === "bytes") return fixtureBlob(fixtureBytes(YAML_DIFFERENT))
        return fixtureBlob(fixtureBytes(YAML_CREATE
          .replace("lessonId: lesson-A", "lessonId: lesson-B")
          .replace(SESSION_A, SESSION_B)))
      }

      const caught = await captureRejection(sessionStore.createSessionOnce(
        { lessonId: "lesson-A", sessionId: SESSION_A },
        { created: 1784491200000 },
      ))
      expectVerificationPhase(caught, "create-readback")
      if (anomaly === "parse") {
        expect((caught as SessionPostWriteVerificationError).cause)
          .toBeInstanceOf(SessionYamlParseError)
      }
    },
  )

  it.each(["null", "identity", "bytes", "parse"] as const)(
    "CAS read-back %s rigetta con classe e phase nominali",
    async (anomaly) => {
      const driver = new MockDriver()
      await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
      const originalRead = driver.read.bind(driver)
      const sessionStore = new WorkspaceStore()
      withMockDriver(sessionStore, driver)
      let reads = 0
      driver.read = async (path) => {
        reads += 1
        if (reads === 1) return originalRead(path)
        driver.operations.push(`read:${path}`)
        if (anomaly === "null") return null
        if (anomaly === "parse") return new Blob([new Uint8Array([0x80])])
        if (anomaly === "bytes") return fixtureBlob(fixtureBytes(YAML_CREATE))
        return fixtureBlob(fixtureBytes(YAML_UPDATED
          .replace("lessonId: lesson-A", "lessonId: lesson-B")
          .replace(SESSION_A, SESSION_B)))
      }

      const caught = await captureRejection(sessionStore.updateSessionAudioCAS(
        { lessonId: "lesson-A", sessionId: SESSION_A },
        {
          expectedSha256: H_CREATE,
          audioConsent: true,
          audioStartEpoch: 1784491201000,
        },
      ))
      expectVerificationPhase(caught, "cas-readback")
      if (anomaly === "parse") {
        expect((caught as SessionPostWriteVerificationError).cause)
          .toBeInstanceOf(SessionYamlParseError)
      }
    },
  )

  it.each(["create", "cas"] as const)(
    "%s read-back exact bytes con hash risolto divergente rigetta nominalmente",
    async (operation) => {
      const driver = new MockDriver()
      if (operation === "cas") await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
      const sessionStore = new WorkspaceStore()
      withMockDriver(sessionStore, driver)
      const realDigest = globalThis.crypto.subtle.digest.bind(globalThis.crypto.subtle)
      let digestCalls = 0
      const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest").mockImplementation(
        async (algorithm, data) => {
          digestCalls += 1
          if (digestCalls === (operation === "create" ? 2 : 3)) {
            return new Uint8Array(32).buffer
          }
          return realDigest(algorithm, data)
        },
      )
      const work = operation === "create"
        ? sessionStore.createSessionOnce(
            { lessonId: "lesson-A", sessionId: SESSION_A },
            { created: 1784491200000 },
          )
        : sessionStore.updateSessionAudioCAS(
            { lessonId: "lesson-A", sessionId: SESSION_A },
            {
              expectedSha256: H_CREATE,
              audioConsent: true,
              audioStartEpoch: 1784491201000,
            },
          )
      const caught = await captureRejection(work)
      expectVerificationPhase(caught, operation === "create" ? "create-readback" : "cas-readback")
      digestSpy.mockRestore()
    },
  )

  it.each(["create", "cas"] as const)(
    "%s read-back byte-divergente rigetta anche se il digest osservato eguaglia il candidate",
    async (operation) => {
      const driver = new MockDriver()
      if (operation === "cas") await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
      const originalRead = driver.read.bind(driver)
      let reads = 0
      driver.read = async (path) => {
        reads += 1
        if (reads === 1) return operation === "create" ? null : originalRead(path)
        driver.operations.push(`read:${path}`)
        return fixtureBlob(fixtureBytes(operation === "create" ? YAML_DIFFERENT : YAML_CREATE))
      }
      const realDigest = globalThis.crypto.subtle.digest.bind(globalThis.crypto.subtle)
      const candidateCall = operation === "create" ? 1 : 2
      const readBackCall = operation === "create" ? 2 : 3
      let digestCalls = 0
      let candidateDigest: ArrayBuffer | undefined
      const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest").mockImplementation(
        async (algorithm, data) => {
          digestCalls += 1
          if (digestCalls === readBackCall) return candidateDigest!.slice(0)
          const digest = await realDigest(algorithm, data)
          if (digestCalls === candidateCall) candidateDigest = digest.slice(0)
          return digest
        },
      )
      const sessionStore = new WorkspaceStore()
      withMockDriver(sessionStore, driver)
      const work = operation === "create"
        ? sessionStore.createSessionOnce(
            { lessonId: "lesson-A", sessionId: SESSION_A },
            { created: 1784491200000 },
          )
        : sessionStore.updateSessionAudioCAS(
            { lessonId: "lesson-A", sessionId: SESSION_A },
            {
              expectedSha256: H_CREATE,
              audioConsent: true,
              audioStartEpoch: 1784491201000,
            },
          )

      const caught = await captureRejection(work)
      expectVerificationPhase(caught, operation === "create" ? "create-readback" : "cas-readback")
      digestSpy.mockRestore()
    },
  )

  it.each(["create", "cas"] as const)(
    "%s propaga identity-exact i sentinel read, Blob, digest e write",
    async (operation) => {
      const identity = { lessonId: "lesson-A", sessionId: SESSION_A }
      const invoke = (sessionStore: WorkspaceStore) => operation === "create"
        ? sessionStore.createSessionOnce(identity, { created: 1784491200000 })
        : sessionStore.updateSessionAudioCAS(identity, {
            expectedSha256: H_CREATE,
            audioConsent: true,
            audioStartEpoch: 1784491201000,
          })

      const readSentinel = Object.freeze({ sentinel: `${operation}-read` })
      const readDriver = new MockDriver()
      readDriver.read = async () => { throw readSentinel }
      const readStore = new WorkspaceStore()
      withMockDriver(readStore, readDriver)
      await expect(invoke(readStore)).rejects.toBe(readSentinel)

      const blobSentinel = Object.freeze({ sentinel: `${operation}-blob` })
      const blobDriver = new MockDriver()
      blobDriver.read = async () => ({
        arrayBuffer: async () => { throw blobSentinel },
      }) as unknown as Blob
      const blobStore = new WorkspaceStore()
      withMockDriver(blobStore, blobDriver)
      await expect(invoke(blobStore)).rejects.toBe(blobSentinel)

      const digestSentinel = Object.freeze({ sentinel: `${operation}-digest` })
      const digestDriver = new MockDriver()
      await putFixture(digestDriver, SESSION_PATH_A, YAML_CREATE)
      const digestStore = new WorkspaceStore()
      withMockDriver(digestStore, digestDriver)
      const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest")
        .mockRejectedValueOnce(digestSentinel)
      await expect(invoke(digestStore)).rejects.toBe(digestSentinel)
      expect(digestDriver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
      digestSpy.mockRestore()

      const writeSentinel = Object.freeze({ sentinel: `${operation}-write` })
      const writeDriver = new MockDriver()
      if (operation === "cas") await putFixture(writeDriver, SESSION_PATH_A, YAML_CREATE)
      writeDriver.write = async () => { throw writeSentinel }
      const writeStore = new WorkspaceStore()
      withMockDriver(writeStore, writeDriver)
      await expect(invoke(writeStore)).rejects.toBe(writeSentinel)
    },
  )

  it.each(["create", "cas"] as const)(
    "%s propaga un read-back transport sentinel senza wrapping",
    async (operation) => {
      const sentinel = Object.freeze({ sentinel: `${operation}-readback` })
      const driver = new MockDriver()
      if (operation === "cas") await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
      const originalRead = driver.read.bind(driver)
      let reads = 0
      driver.read = async (path) => {
        reads += 1
        if (reads === 1) return operation === "create" ? null : originalRead(path)
        throw sentinel
      }
      const sessionStore = new WorkspaceStore()
      withMockDriver(sessionStore, driver)
      const work = operation === "create"
        ? sessionStore.createSessionOnce(
            { lessonId: "lesson-A", sessionId: SESSION_A },
            { created: 1784491200000 },
          )
        : sessionStore.updateSessionAudioCAS(
            { lessonId: "lesson-A", sessionId: SESSION_A },
            {
              expectedSha256: H_CREATE,
              audioConsent: true,
              audioStartEpoch: 1784491201000,
            },
          )
      await expect(work).rejects.toBe(sentinel)
    },
  )

  it.each(["create", "cas"] as const)(
    "%s propaga Blob e WebCrypto read-back sentinel senza wrapping",
    async (operation) => {
      const identity = { lessonId: "lesson-A", sessionId: SESSION_A }
      const invoke = (sessionStore: WorkspaceStore) => operation === "create"
        ? sessionStore.createSessionOnce(identity, { created: 1784491200000 })
        : sessionStore.updateSessionAudioCAS(identity, {
            expectedSha256: H_CREATE,
            audioConsent: true,
            audioStartEpoch: 1784491201000,
          })

      const blobSentinel = Object.freeze({ sentinel: `${operation}-readback-blob` })
      const blobDriver = new MockDriver()
      if (operation === "cas") await putFixture(blobDriver, SESSION_PATH_A, YAML_CREATE)
      const originalBlobRead = blobDriver.read.bind(blobDriver)
      let blobReads = 0
      blobDriver.read = async (path) => {
        blobReads += 1
        if (blobReads === 1) return operation === "create" ? null : originalBlobRead(path)
        return {
          arrayBuffer: async () => { throw blobSentinel },
        } as unknown as Blob
      }
      const blobStore = new WorkspaceStore()
      withMockDriver(blobStore, blobDriver)
      await expect(invoke(blobStore)).rejects.toBe(blobSentinel)

      const digestSentinel = Object.freeze({ sentinel: `${operation}-readback-digest` })
      const digestDriver = new MockDriver()
      if (operation === "cas") await putFixture(digestDriver, SESSION_PATH_A, YAML_CREATE)
      const digestStore = new WorkspaceStore()
      withMockDriver(digestStore, digestDriver)
      const realDigest = globalThis.crypto.subtle.digest.bind(globalThis.crypto.subtle)
      let digestCalls = 0
      const rejectAt = operation === "create" ? 2 : 3
      const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest").mockImplementation(
        async (algorithm, data) => {
          digestCalls += 1
          if (digestCalls === rejectAt) throw digestSentinel
          return realDigest(algorithm, data)
        },
      )
      await expect(invoke(digestStore)).rejects.toBe(digestSentinel)
      digestSpy.mockRestore()
    },
  )

  it("rigetto coordinator prima del work lascia I/O e WebCrypto a zero per create e CAS", async () => {
    const sentinel = Object.freeze({ sentinel: "coordinator" })
    const paths: string[] = []
    let workCalls = 0
    const coordinator: LessonMutationCoordinator = {
      safety: "origin-exclusive",
      withPathMutation: (path) => {
        paths.push(path)
        return Promise.reject(sentinel)
      },
      withWorkspaceExclusive: async (work) => work(),
      registerActiveLesson: async (lessonId) => Object.freeze({ lessonId, release: async () => undefined }),
      probeInactiveLesson: async () => Object.freeze({ status: "inactive" }),
    }
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(sessionStore, driver)
    const digestSpy = vi.spyOn(globalThis.crypto.subtle, "digest")
    await expect(sessionStore.createSessionOnce(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { created: 1784491200000 },
    )).rejects.toBe(sentinel)
    await expect(sessionStore.updateSessionAudioCAS(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { expectedSha256: H_CREATE, audioConsent: true, audioStartEpoch: 1784491201000 },
    )).rejects.toBe(sentinel)
    expect(paths).toEqual([SESSION_PATH_A, SESSION_PATH_A])
    expect(workCalls).toBe(0)
    expect(driver.operations).toEqual([])
    expect(digestSpy).not.toHaveBeenCalled()
    digestSpy.mockRestore()
  })

  it("persist-then-reject create converge al retry idempotente senza seconda write", async () => {
    const sentinel = Object.freeze({ sentinel: "persist-create" })
    const driver = new MockDriver()
    const originalWrite = driver.write.bind(driver)
    let first = true
    driver.write = async (path, data) => {
      await originalWrite(path, data)
      if (first) {
        first = false
        throw sentinel
      }
    }
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }
    await expect(sessionStore.createSessionOnce(identity, { created: 1784491200000 }))
      .rejects.toBe(sentinel)
    await expect(sessionStore.createSessionOnce(identity, { created: 1784491200000 }))
      .resolves.toMatchObject({ kind: "idempotent" })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)
    expect(await (await driver.read(SESSION_PATH_A))!.text()).toBe(YAML_CREATE)
  })

  it("persist-then-reject CAS converge al retry idempotente senza revision 2", async () => {
    const sentinel = Object.freeze({ sentinel: "persist-cas" })
    const driver = new MockDriver()
    await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
    const originalWrite = driver.write.bind(driver)
    let first = true
    driver.write = async (path, data) => {
      await originalWrite(path, data)
      if (first) {
        first = false
        throw sentinel
      }
    }
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }
    const input = {
      expectedSha256: H_CREATE,
      audioConsent: true,
      audioStartEpoch: 1784491201000,
    }
    await expect(sessionStore.updateSessionAudioCAS(identity, input)).rejects.toBe(sentinel)
    await expect(sessionStore.updateSessionAudioCAS(identity, input))
      .resolves.toMatchObject({ kind: "idempotent" })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)
    expect(await (await driver.read(SESSION_PATH_A))!.text()).toBe(YAML_UPDATED)
  })

  it("due store sullo stesso driver linearizzano create e CAS senza lost update", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const driver = new MockDriver()
    const firstStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    const secondStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(firstStore, driver)
    withMockDriver(secondStore, driver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }

    const createResults = await Promise.all([
      firstStore.createSessionOnce(identity, { created: 1784491200000 }),
      secondStore.createSessionOnce(identity, { created: 1784491200000 }),
    ])
    expect(createResults.map(({ kind }) => kind).sort()).toEqual(["created", "idempotent"])
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)

    driver.clearOperations()
    const casResults = await Promise.all([
      firstStore.updateSessionAudioCAS(identity, {
        expectedSha256: H_CREATE,
        audioConsent: true,
        audioStartEpoch: 1784491201000,
      }),
      secondStore.updateSessionAudioCAS(identity, {
        expectedSha256: H_CREATE,
        audioConsent: true,
        audioStartEpoch: 1784491201000,
      }),
    ])
    expect(casResults.map(({ kind }) => kind).sort()).toEqual(["idempotent", "updated"])
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)
  })

  it("due CAS con desired diversi producono updated più stale conflict", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const driver = new MockDriver()
    await putFixture(driver, SESSION_PATH_A, YAML_CREATE)
    const firstStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    const secondStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(firstStore, driver)
    withMockDriver(secondStore, driver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }

    const results = await Promise.all([
      firstStore.updateSessionAudioCAS(identity, {
        expectedSha256: H_CREATE,
        audioConsent: true,
        audioStartEpoch: 1784491201000,
      }),
      secondStore.updateSessionAudioCAS(identity, {
        expectedSha256: H_CREATE,
        audioConsent: true,
        audioStartEpoch: 1784491202000,
      }),
    ])
    expect(results.map(({ kind }) => kind).sort()).toEqual(["conflict", "updated"])
    const conflict = results.find(({ kind }) => kind === "conflict")
    expect(conflict).toMatchObject({ kind: "conflict", reason: "stale-hash" })
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(1)
  })

  it("CAS dà priorità a desired-idempotent prima di stale e overflow", async () => {
    const maxYaml = YAML_UPDATED.replace("revision: 1", `revision: ${Number.MAX_SAFE_INTEGER}`)
    const driver = new MockDriver()
    await putFixture(driver, SESSION_PATH_A, maxYaml)
    const sessionStore = new WorkspaceStore()
    withMockDriver(sessionStore, driver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }

    await expect(sessionStore.updateSessionAudioCAS(identity, {
      expectedSha256: H_CREATE,
      audioConsent: true,
      audioStartEpoch: 1784491201000,
    })).resolves.toMatchObject({ kind: "idempotent" })

    const observed = await sessionStore.updateSessionAudioCAS(identity, {
      expectedSha256: "9795219179a38b6c1aabab735d51b79707b1220180ade21edfeb6a141893687f",
      audioConsent: false,
      audioStartEpoch: null,
    })
    expect(observed).toMatchObject({ kind: "conflict" })
    if (observed.kind !== "conflict") throw new Error("conflict required")
    expect(observed.reason).toBe("revision-overflow")
    expect(observed.observedSha256)
      .toBe("9795219179a38b6c1aabab735d51b79707b1220180ade21edfeb6a141893687f")
    expect(driver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
  })

  it("una acquisition non-reentrant copre l'intera create e CAS", async () => {
    const nested = Object.freeze({ sentinel: "nested" })
    let depth = 0
    let acquisitions = 0
    const coordinator: LessonMutationCoordinator = {
      safety: "origin-exclusive",
      withPathMutation: async (_path, work) => {
        if (depth !== 0) throw nested
        acquisitions += 1
        depth += 1
        try {
          return await work()
        } finally {
          depth -= 1
        }
      },
      withWorkspaceExclusive: async (work) => work(),
      registerActiveLesson: async (lessonId) => Object.freeze({ lessonId, release: async () => undefined }),
      probeInactiveLesson: async () => Object.freeze({ status: "inactive" }),
    }
    const driver = new MockDriver()
    const sessionStore = new WorkspaceStore({ mutationCoordinator: coordinator })
    withMockDriver(sessionStore, driver)
    const identity = { lessonId: "lesson-A", sessionId: SESSION_A }
    await expect(sessionStore.createSessionOnce(identity, { created: 1784491200000 }))
      .resolves.toMatchObject({ kind: "created" })
    await expect(sessionStore.updateSessionAudioCAS(identity, {
      expectedSha256: H_CREATE,
      audioConsent: true,
      audioStartEpoch: 1784491201000,
    })).resolves.toMatchObject({ kind: "updated" })
    expect(acquisitions).toBe(2)
    expect(depth).toBe(0)
  })

  it("create accodata dietro connectFolder risolve il driver FSA dinamicamente", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const fallback = new MockDriver()
    const fsa = new MockDriver()
    const probePath = "raw/Z/connection-probe/create.bin"
    await fallback.write(probePath, new Blob(["probe"]))
    fallback.clearOperations()
    const probeEntered = deferred()
    const releaseProbe = deferred()
    const originalFsaWrite = fsa.write.bind(fsa)
    fsa.write = async (path, data) => {
      if (path === probePath) {
        probeEntered.resolve()
        await releaseProbe.promise
      }
      await originalFsaWrite(path, data)
    }
    const sessionStore = new WorkspaceStore({
      mutationCoordinator: coordinator,
      createFsaDriver: () => fsa,
    })
    ;(sessionStore as unknown as { fallback: WorkspaceDriver }).fallback = fallback
    withMockDriver(sessionStore, fallback)
    ;(sessionStore as unknown as { _mode: string })._mode = "localStorage"

    const connection = sessionStore.connectFolder()
    await probeEntered.promise
    const pending = sessionStore.createSessionOnce(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { created: 1784491200000 },
    )
    await waitForLedger(broker, "request:shared:ardesia:workspace-mutation")
    expect(fallback.operations.some((entry) => entry.includes(SESSION_PATH_A))).toBe(false)
    expect(fsa.operations.some((entry) => entry.includes(SESSION_PATH_A))).toBe(false)

    releaseProbe.resolve()
    await expect(connection).resolves.toBe(true)
    await expect(pending).resolves.toMatchObject({ kind: "created" })
    expect(fallback.operations.some((entry) => entry.includes(SESSION_PATH_A))).toBe(false)
    expect(fsa.operations).toContain(`write:${SESSION_PATH_A}`)
    expect(await (await fsa.read(SESSION_PATH_A))!.text()).toBe(YAML_CREATE)
  })

  it("CAS accodata dietro connectFolder legge revision/created dal solo FSA", async () => {
    const broker = new AdversarialMutationLockBroker()
    const coordinator = createLessonMutationCoordinator(broker)
    const fallback = new MockDriver()
    const fsa = new MockDriver()
    const probePath = "raw/Z/connection-probe/cas.bin"
    await fallback.write(probePath, new Blob(["probe"]))
    await putFixture(fsa, SESSION_PATH_A, YAML_CONNECT_CAS_INITIAL)
    fallback.clearOperations()
    const probeEntered = deferred()
    const releaseProbe = deferred()
    const originalFsaWrite = fsa.write.bind(fsa)
    fsa.write = async (path, data) => {
      if (path === probePath) {
        probeEntered.resolve()
        await releaseProbe.promise
      }
      await originalFsaWrite(path, data)
    }
    const sessionStore = new WorkspaceStore({
      mutationCoordinator: coordinator,
      createFsaDriver: () => fsa,
    })
    ;(sessionStore as unknown as { fallback: WorkspaceDriver }).fallback = fallback
    withMockDriver(sessionStore, fallback)
    ;(sessionStore as unknown as { _mode: string })._mode = "localStorage"

    const connection = sessionStore.connectFolder()
    await probeEntered.promise
    const pending = sessionStore.updateSessionAudioCAS(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      {
        expectedSha256: H_CONNECT_CAS_INITIAL,
        audioConsent: true,
        audioStartEpoch: 1784491201999,
      },
    )
    await waitForLedger(broker, "request:shared:ardesia:workspace-mutation")
    expect(fallback.operations.some((entry) => entry.includes(SESSION_PATH_A))).toBe(false)
    releaseProbe.resolve()
    await expect(connection).resolves.toBe(true)
    const result = await pending
    expect(result.kind).toBe("updated")
    if (result.kind !== "updated") throw new Error("updated required")
    expect(result.snapshot.sha256).toBe(H_CONNECT_CAS_UPDATED)
    expect(await result.snapshot.bytes.text()).toBe(YAML_CONNECT_CAS_UPDATED)
    expect(fallback.operations.some((entry) => entry.includes(SESSION_PATH_A))).toBe(false)
  })

  it("S0D: storage/Blob vuoto non diventano false absent e zero mutation su corrupt", async () => {
    const storageSentinel = Object.freeze({ sentinel: "storage-get" })
    const throwingDriver = new MockDriver()
    throwingDriver.read = async () => { throw storageSentinel }
    const throwingStore = new WorkspaceStore()
    withMockDriver(throwingStore, throwingDriver)
    await expect(throwingStore.createSessionOnce(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { created: 1784491200000 },
    )).rejects.toBe(storageSentinel)

    const emptyDriver = new MockDriver()
    await emptyDriver.write(SESSION_PATH_A, new Blob([]))
    emptyDriver.clearOperations()
    const emptyStore = new WorkspaceStore()
    withMockDriver(emptyStore, emptyDriver)
    const result = await emptyStore.updateSessionAudioCAS(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { expectedSha256: H_CREATE, audioConsent: true, audioStartEpoch: 1784491201000 },
    )
    expect(result).toMatchObject({ kind: "corrupt", reason: "invalid-grammar" })
    expect(emptyDriver.operations.filter((entry) => entry.startsWith("write:"))).toHaveLength(0)
  })

  it("S0D LocalStorage: base64 valido con YAML invalido resta corrupt senza set/remove", async () => {
    const { localStorageDriver } = await import("../store/drivers/localStorage")
    await localStorageDriver.write(SESSION_PATH_A, new Blob([new Uint8Array([0x80])]))
    storageOperations = []
    const sessionStore = new WorkspaceStore()
    await sessionStore.init()
    const result = await sessionStore.createSessionOnce(
      { lessonId: "lesson-A", sessionId: SESSION_A },
      { created: 1784491200000 },
    )
    expect(result).toMatchObject({ kind: "corrupt", reason: "invalid-utf8" })
    expect(storageOperations.some((entry) => entry.startsWith("set:"))).toBe(false)
    expect(storageOperations.some((entry) => entry.startsWith("remove:"))).toBe(false)
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
