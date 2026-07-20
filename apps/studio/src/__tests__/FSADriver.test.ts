// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest"
import { FSADriver } from "../store/drivers/fsa"

type FakeEntry = FakeDirectoryHandle | FakeFileHandle
type FakeMetrics = {
  writable: number
  write: number
  close: number
  abort: number
  remove: number
  failWrite: boolean
  failClose: boolean
  getFileErrorName: string | null
  removeErrorName: string | null
}

function requestedLocator<T extends FakeEntry>(entry: T, name: string): T {
  return new Proxy(entry, {
    get(target, property) {
      if (property === "name") return name
      const value = Reflect.get(target, property, target) as unknown
      return typeof value === "function" ? value.bind(target) : value
    },
  })
}

function notFound(): DOMException {
  return new DOMException("Not found", "NotFoundError")
}

class FakeFileHandle {
  readonly kind = "file" as const
  readonly name: string
  private data = new Blob()
  private mtime = 0
  private readonly metrics: FakeMetrics

  constructor(name: string, metrics: FakeMetrics) {
    this.name = name
    this.metrics = metrics
  }

  async getFile(): Promise<File> {
    if (this.metrics.getFileErrorName) {
      const name = this.metrics.getFileErrorName
      this.metrics.getFileErrorName = null
      throw new DOMException("Injected getFile failure", name)
    }
    const file = new Blob([await this.data.arrayBuffer()], { type: this.data.type }) as File
    Object.defineProperties(file, {
      name: { value: this.name },
      lastModified: { value: this.mtime },
    })
    return file
  }

  async createWritable(): Promise<FileSystemWritableFileStream> {
    this.metrics.writable += 1
    let pending = this.data
    return {
      write: async (chunk: FileSystemWriteChunkType) => {
        this.metrics.write += 1
        if (this.metrics.failWrite) throw new Error("Injected write failure")
        if (!(chunk instanceof Blob)) throw new Error("Fake FSA accepts Blob writes only")
        pending = chunk
      },
      close: async () => {
        this.metrics.close += 1
        if (this.metrics.failClose) throw new Error("Injected close failure")
        this.data = pending
        this.mtime += 1
      },
      abort: async () => {
        this.metrics.abort += 1
      },
    } as FileSystemWritableFileStream
  }

  async seed(data: Blob): Promise<void> {
    this.data = data
  }
}

class FakeDirectoryHandle {
  readonly kind = "directory" as const
  readonly name: string
  private readonly children = new Map<string, FakeEntry>()
  readonly metrics: FakeMetrics
  private beforeDirectoryCreate: ((name: string) => Promise<void> | void) | null = null
  private beforeFileCreate: ((name: string) => Promise<void> | void) | null = null

  constructor(
    name: string,
    metrics: FakeMetrics = {
      writable: 0,
      write: 0,
      close: 0,
      abort: 0,
      remove: 0,
      failWrite: false,
      failClose: false,
      getFileErrorName: null,
      removeErrorName: null,
    },
  ) {
    this.name = name
    this.metrics = metrics
  }

  private find(name: string): FakeEntry | undefined {
    const folded = name.toLowerCase()
    return [...this.children.values()].find((entry) => entry.name.toLowerCase() === folded)
  }

  async getDirectoryHandle(
    name: string,
    options: FileSystemGetDirectoryOptions = {},
  ): Promise<FileSystemDirectoryHandle> {
    const existing = this.find(name)
    if (existing?.kind === "directory") {
      return requestedLocator(existing, name) as unknown as FileSystemDirectoryHandle
    }
    if (existing) throw new DOMException("Type mismatch", "TypeMismatchError")
    if (!options.create) throw notFound()
    if (this.beforeDirectoryCreate) await this.beforeDirectoryCreate(name)
    const raced = this.find(name)
    if (raced?.kind === "directory") {
      return requestedLocator(raced, name) as unknown as FileSystemDirectoryHandle
    }
    if (raced) throw new DOMException("Type mismatch", "TypeMismatchError")
    const created = new FakeDirectoryHandle(name, this.metrics)
    this.children.set(name, created)
    return requestedLocator(created, name) as unknown as FileSystemDirectoryHandle
  }

  async getFileHandle(
    name: string,
    options: FileSystemGetFileOptions = {},
  ): Promise<FileSystemFileHandle> {
    const existing = this.find(name)
    if (existing?.kind === "file") {
      return requestedLocator(existing, name) as unknown as FileSystemFileHandle
    }
    if (existing) throw new DOMException("Type mismatch", "TypeMismatchError")
    if (!options.create) throw notFound()
    if (this.beforeFileCreate) await this.beforeFileCreate(name)
    const raced = this.find(name)
    if (raced?.kind === "file") {
      return requestedLocator(raced, name) as unknown as FileSystemFileHandle
    }
    if (raced) throw new DOMException("Type mismatch", "TypeMismatchError")
    const created = new FakeFileHandle(name, this.metrics)
    this.children.set(name, created)
    return requestedLocator(created, name) as unknown as FileSystemFileHandle
  }

  async removeEntry(name: string): Promise<void> {
    const existing = this.find(name)
    if (!existing) throw notFound()
    this.metrics.remove += 1
    if (this.metrics.removeErrorName) {
      const errorName = this.metrics.removeErrorName
      this.metrics.removeErrorName = null
      throw new DOMException("Injected remove failure", errorName)
    }
    this.children.delete(existing.name)
  }

  async *entries(): AsyncIterableIterator<[string, FileSystemHandle]> {
    for (const entry of this.children.values()) {
      yield [entry.name, entry as unknown as FileSystemHandle]
    }
  }

  unsafeAddDirectory(name: string): FakeDirectoryHandle {
    const child = new FakeDirectoryHandle(name, this.metrics)
    this.children.set(name, child)
    return child
  }

  async unsafeAddFile(name: string, data: Blob): Promise<FakeFileHandle> {
    const child = new FakeFileHandle(name, this.metrics)
    await child.seed(data)
    this.children.set(name, child)
    return child
  }

  onNextDirectoryCreate(callback: (name: string) => Promise<void> | void): void {
    this.beforeDirectoryCreate = async (name) => {
      this.beforeDirectoryCreate = null
      await callback(name)
    }
  }

  onNextFileCreate(callback: (name: string) => Promise<void> | void): void {
    this.beforeFileCreate = async (name) => {
      this.beforeFileCreate = null
      await callback(name)
    }
  }
}

function driverWithRoot(root = new FakeDirectoryHandle("workspace")): {
  driver: FSADriver
  root: FakeDirectoryHandle
  metrics: FakeMetrics
} {
  const driver = new FSADriver()
  ;(driver as unknown as { _rootHandle: FileSystemDirectoryHandle })._rootHandle =
    root as unknown as FileSystemDirectoryHandle
  return { driver, root, metrics: root.metrics }
}

async function textOf(blob: Blob | null): Promise<string | null> {
  return blob ? blob.text() : null
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve = () => {}
  const promise = new Promise<void>((done) => { resolve = done })
  return { promise, resolve }
}

let lockRequests: Array<{ name: string; mode: LockMode | undefined }> = []

function installLocks(options: { grant?: boolean; error?: Error } = {}): void {
  type QueueEntry = { mode: LockMode; start: () => void }
  type LockState = { readers: number; writer: boolean; queue: QueueEntry[] }
  const states = new Map<string, LockState>()

  const pump = (state: LockState): void => {
    if (state.writer || state.queue.length === 0) return
    if (state.queue[0]!.mode === "exclusive") {
      if (state.readers === 0) state.queue.shift()!.start()
      return
    }
    while (!state.writer && state.queue[0]?.mode === "shared") {
      state.queue.shift()!.start()
    }
  }

  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: <T>(
        name: string,
        requestOptions: LockOptions,
        callback: (lock: Lock | null) => Promise<T> | T,
      ): Promise<T> => {
        lockRequests.push({ name, mode: requestOptions.mode })
        if (options.error) return Promise.reject(options.error)
        if (options.grant === false) return Promise.resolve().then(() => callback(null))

        const mode = requestOptions.mode ?? "exclusive"
        const state = states.get(name) ?? { readers: 0, writer: false, queue: [] }
        states.set(name, state)
        return new Promise<T>((resolve, reject) => {
          const start = () => {
            if (mode === "exclusive") state.writer = true
            else state.readers += 1
            const lock = { name, mode } as Lock
            Promise.resolve(callback(lock)).then(resolve, reject).finally(() => {
              if (mode === "exclusive") state.writer = false
              else state.readers -= 1
              pump(state)
            })
          }
          state.queue.push({ mode, start })
          pump(state)
        })
      },
    },
  })
}

describe("FSADriver case-stable paths", () => {
  beforeEach(() => {
    lockRequests = []
    delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker
    installLocks()
  })

  it("rifiuta alias case-only in read, write e delete senza alterare i byte", async () => {
    const { driver, root, metrics } = driverWithRoot()
    await driver.write("raw/roomA/events.jsonl", new Blob(["originale"]))
    const raw = await root.getDirectoryHandle("raw")
    const requestedAlias = await raw.getDirectoryHandle("rooma")
    expect(requestedAlias.name).toBe("rooma")
    const before = { ...metrics }

    await expect(driver.read("raw/rooma/events.jsonl")).rejects.toThrow(/casing|collision/i)
    await expect(driver.list("raw/rooma/")).rejects.toThrow(/casing|collision/i)
    await expect(
      driver.write("raw/rooma/events.jsonl", new Blob(["sovrascrittura"])),
    ).rejects.toThrow(/casing|collision/i)
    await expect(driver.delete("raw/rooma/events.jsonl")).rejects.toThrow(/casing|collision/i)

    expect(metrics).toEqual(before)
    expect(await textOf(await driver.read("raw/roomA/events.jsonl"))).toBe("originale")
  })

  it("serializza la creazione concorrente case-only: una sola variante riesce", async () => {
    const { driver, root, metrics } = driverWithRoot()
    const otherDriver = driverWithRoot(root).driver
    const outcomes = await Promise.allSettled([
      driver.write("raw/RoomA/events.jsonl", new Blob(["upper"])),
      otherDriver.write("raw/rooma/events.jsonl", new Blob(["lower"])),
    ])

    expect(outcomes.filter(({ status }) => status === "fulfilled")).toHaveLength(1)
    expect(outcomes.filter(({ status }) => status === "rejected")).toHaveLength(1)
    const winner = outcomes.findIndex(({ status }) => status === "fulfilled")
    const loser = outcomes.find(({ status }) => status === "rejected") as PromiseRejectedResult
    expect(loser.reason).toBeInstanceOf(Error)
    expect((loser.reason as Error).message).toMatch(/casing|collision/i)
    const files = await driver.list("raw/")
    expect(files).toHaveLength(1)
    expect(files[0]!.path).toBe(
      winner === 0 ? "raw/RoomA/events.jsonl" : "raw/rooma/events.jsonl",
    )
    expect(await files[0]!.data.text()).toBe(winner === 0 ? "upper" : "lower")
    expect(metrics.writable).toBe(1)
    expect(metrics.write).toBe(1)
    expect(metrics.close).toBe(1)
    expect(new Set(lockRequests.map(({ name }) => name))).toEqual(
      new Set(["ardesia:fsa:workspace"]),
    )
    expect(lockRequests.slice(0, 2).map(({ mode }) => mode)).toEqual(["exclusive", "exclusive"])
  })

  it("rifiuta un inventario che contiene già due sibling case-only", async () => {
    const root = new FakeDirectoryHandle("workspace")
    const raw = root.unsafeAddDirectory("raw")
    const upper = raw.unsafeAddDirectory("RoomA")
    const lower = raw.unsafeAddDirectory("rooma")
    const upperFile = await upper.unsafeAddFile("events.jsonl", new Blob(["upper-originale"]))
    const lowerFile = await lower.unsafeAddFile("events.jsonl", new Blob(["lower-originale"]))
    const { driver, metrics } = driverWithRoot(root)
    const before = { ...metrics }

    await expect(driver.read("raw/RoomA/events.jsonl")).rejects.toThrow(/casing|collision/i)
    await expect(driver.list("raw/")).rejects.toThrow(/casing|collision/i)
    await expect(
      driver.write("raw/RoomA/events.jsonl", new Blob(["overwrite"])),
    ).rejects.toThrow(/casing|collision/i)
    await expect(driver.delete("raw/RoomA/events.jsonl")).rejects.toThrow(/casing|collision/i)

    expect(metrics).toEqual(before)
    expect(await textOf(await upperFile.getFile())).toBe("upper-originale")
    expect(await textOf(await lowerFile.getFile())).toBe("lower-originale")
  })

  it.each(["directory", "file"] as const)(
    "ripete l'inventory dopo create e blocca una race case-only sul %s",
    async (kind) => {
      const root = new FakeDirectoryHandle("workspace")
      const raw = root.unsafeAddDirectory("raw")
      if (kind === "directory") {
        raw.onNextDirectoryCreate(() => { raw.unsafeAddDirectory("RoomA") })
      } else {
        const room = raw.unsafeAddDirectory("roomA")
        room.onNextFileCreate(async () => { await room.unsafeAddFile("Events.jsonl", new Blob()) })
      }
      const { driver, metrics } = driverWithRoot(root)

      const path = kind === "directory"
        ? "raw/rooma/events.jsonl"
        : "raw/roomA/events.jsonl"
      await expect(driver.write(path, new Blob(["mai scritto"]))).rejects.toThrow(
        /casing|collision/i,
      )
      expect(metrics.writable).toBe(0)
      expect(metrics.write).toBe(0)
      expect(metrics.close).toBe(0)
    },
  )

  it.each(["missing", "getter", "reject", "null"] as const)(
    "fallisce chiuso senza mutazioni se Web Locks è %s",
    async (failure) => {
      if (failure === "missing") {
        Object.defineProperty(navigator, "locks", { configurable: true, value: undefined })
      } else if (failure === "getter") {
        Object.defineProperty(navigator, "locks", {
          configurable: true,
          get: () => { throw new Error("Injected locks getter failure") },
        })
      } else if (failure === "reject") {
        installLocks({ error: new Error("Injected lock request failure") })
      } else {
        installLocks({ grant: false })
      }
      const { driver, metrics } = driverWithRoot()

      const operations = [
        () => driver.write("raw/roomA/events.jsonl", new Blob(["data"])),
        () => driver.read("raw/roomA/events.jsonl"),
        () => driver.list("raw/"),
        () => driver.delete("raw/roomA/events.jsonl"),
      ]
      for (const operation of operations) await expect(operation()).rejects.toThrow()
      const pickerRoot = new FakeDirectoryHandle("picker-root")
      Object.defineProperty(window, "showDirectoryPicker", {
        configurable: true,
        value: async () => pickerRoot as unknown as FileSystemDirectoryHandle,
      })
      await expect(new FSADriver().init()).rejects.toThrow()
      const pickerEntries: string[] = []
      for await (const [name] of pickerRoot.entries()) pickerEntries.push(name)
      expect(pickerEntries).toEqual([])
      expect(metrics.writable).toBe(0)
      expect(metrics.write).toBe(0)
      expect(metrics.close).toBe(0)
      expect(metrics.remove).toBe(0)
      if (failure === "reject" || failure === "null") {
        expect(lockRequests).toEqual([
          { name: "ardesia:fsa:workspace", mode: "exclusive" },
          { name: "ardesia:fsa:workspace", mode: "shared" },
          { name: "ardesia:fsa:workspace", mode: "shared" },
          { name: "ardesia:fsa:workspace", mode: "exclusive" },
          { name: "ardesia:fsa:workspace", mode: "exclusive" },
        ])
      } else {
        expect(lockRequests).toEqual([])
      }
    },
  )

  it("blocca read alias mentre il primo writer materializza il namespace", async () => {
    const root = new FakeDirectoryHandle("workspace")
    const raw = root.unsafeAddDirectory("raw")
    const writerEnteredCreate = deferred()
    const releaseWriter = deferred()
    raw.onNextDirectoryCreate(async () => {
      writerEnteredCreate.resolve()
      await releaseWriter.promise
    })
    const writer = driverWithRoot(root).driver
    const reader = driverWithRoot(root).driver

    const write = writer.write("raw/RoomA/events.jsonl", new Blob(["upper"]))
    await writerEnteredCreate.promise
    let readSettled = false
    const readOutcome = reader.read("raw/rooma/events.jsonl").then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    ).finally(() => { readSettled = true })
    await Promise.resolve()
    await Promise.resolve()
    expect(readSettled).toBe(false)

    releaseWriter.resolve()
    await write
    const outcome = await readOutcome
    expect("error" in outcome ? outcome.error : null).toBeInstanceOf(Error)
    expect("error" in outcome ? (outcome.error as Error).message : "").toMatch(/casing|collision/i)
    expect(lockRequests.map(({ mode }) => mode)).toEqual(["exclusive", "shared"])
  })

  it("consente update con casing esatto e mantiene stanze non collidenti isolate", async () => {
    const { driver } = driverWithRoot()
    await driver.write("raw/roomA/events.jsonl", new Blob(["a1"]))
    await driver.write("raw/roomA/events.jsonl", new Blob(["a2"]))
    await driver.write("raw/roomB/events.jsonl", new Blob(["b1"]))

    expect(await textOf(await driver.read("raw/roomA/events.jsonl"))).toBe("a2")
    expect(await textOf(await driver.read("raw/roomB/events.jsonl"))).toBe("b1")
  })

  it("attraversa la directory antenata quando list riceve un prefisso profondo", async () => {
    const { driver } = driverWithRoot()
    await driver.write("raw/roomA/events.jsonl", new Blob(["a"]))
    await driver.write("derived/index.json", new Blob(["derived"]))

    expect((await driver.list("raw/")).map(({ path }) => path)).toEqual([
      "raw/roomA/events.jsonl",
    ])
    expect((await driver.list("raw/roomA/")).map(({ path }) => path)).toEqual([
      "raw/roomA/events.jsonl",
    ])
    expect(await driver.list("raw/roomB/")).toEqual([])
  })

  it("verifica anche il basename prima di aprire writable o rimuovere", async () => {
    const { driver } = driverWithRoot()
    await driver.write("raw/roomA/Events.jsonl", new Blob(["originale"]))

    await expect(
      driver.write("raw/roomA/events.jsonl", new Blob(["sovrascrittura"])),
    ).rejects.toThrow(/casing|collision/i)
    await expect(driver.delete("raw/roomA/events.jsonl")).rejects.toThrow(/casing|collision/i)
    expect(await textOf(await driver.read("raw/roomA/Events.jsonl"))).toBe("originale")
  })

  it("serializza collisioni concorrenti del basename e lega winner, path e byte", async () => {
    const { driver, root, metrics } = driverWithRoot()
    const otherDriver = driverWithRoot(root).driver
    const outcomes = await Promise.allSettled([
      driver.write("raw/roomA/Events.jsonl", new Blob(["upper-name"])),
      otherDriver.write("raw/roomA/events.jsonl", new Blob(["lower-name"])),
    ])

    const winner = outcomes.findIndex(({ status }) => status === "fulfilled")
    expect(winner).toBeGreaterThanOrEqual(0)
    expect(outcomes.filter(({ status }) => status === "rejected")).toHaveLength(1)
    const files = await driver.list("raw/roomA/")
    expect(files).toHaveLength(1)
    expect(files[0]!.path).toBe(
      winner === 0 ? "raw/roomA/Events.jsonl" : "raw/roomA/events.jsonl",
    )
    expect(await files[0]!.data.text()).toBe(winner === 0 ? "upper-name" : "lower-name")
    expect(metrics.writable).toBe(1)
    expect(metrics.write).toBe(1)
    expect(metrics.close).toBe(1)
  })

  it("serializza write esatta e delete case-alias senza cancellazione o source confusion", async () => {
    const { driver, root, metrics } = driverWithRoot()
    await driver.write("raw/roomA/Events.jsonl", new Blob(["originale"]))
    const beforeRemove = metrics.remove
    const otherDriver = driverWithRoot(root).driver

    const outcomes = await Promise.allSettled([
      driver.write("raw/roomA/Events.jsonl", new Blob(["aggiornato"])),
      otherDriver.delete("raw/roomA/events.jsonl"),
    ])

    expect(outcomes[0].status).toBe("fulfilled")
    expect(outcomes[1].status).toBe("rejected")
    expect(metrics.remove).toBe(beforeRemove)
    expect(await textOf(await driver.read("raw/roomA/Events.jsonl"))).toBe("aggiornato")
  })

  it.each(["write", "close"] as const)(
    "aborta lo stream e preserva i byte se %s fallisce",
    async (failure) => {
      const { driver, metrics } = driverWithRoot()
      await driver.write("raw/roomA/events.jsonl", new Blob(["originale"]))
      if (failure === "write") metrics.failWrite = true
      else metrics.failClose = true

      await expect(
        driver.write("raw/roomA/events.jsonl", new Blob(["non-committibile"])),
      ).rejects.toMatchObject({
        message: "FSA write fallita",
        cause: expect.objectContaining({ message: `Injected ${failure} failure` }),
      })
      metrics.failWrite = false
      metrics.failClose = false

      expect(metrics.abort).toBe(1)
      expect(await textOf(await driver.read("raw/roomA/events.jsonl"))).toBe("originale")
    },
  )

  it("mappa solo NotFound concorrente a read null e delete no-op", async () => {
    const { driver, metrics } = driverWithRoot()
    await driver.write("raw/roomA/events.jsonl", new Blob(["originale"]))

    metrics.getFileErrorName = "NotFoundError"
    await expect(driver.read("raw/roomA/events.jsonl")).resolves.toBeNull()
    metrics.removeErrorName = "NotFoundError"
    await expect(driver.delete("raw/roomA/events.jsonl")).resolves.toBeUndefined()
    expect(await textOf(await driver.read("raw/roomA/events.jsonl"))).toBe("originale")

    metrics.getFileErrorName = "NotAllowedError"
    await expect(driver.read("raw/roomA/events.jsonl")).rejects.toMatchObject({
      name: "NotAllowedError",
    })
    metrics.removeErrorName = "NotAllowedError"
    await expect(driver.delete("raw/roomA/events.jsonl")).rejects.toMatchObject({
      name: "NotAllowedError",
    })
  })

  it("init fallisce chiuso se una directory radice ha casing ambiguo", async () => {
    const root = new FakeDirectoryHandle("workspace")
    await root.getDirectoryHandle("RAW", { create: true })
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => root as unknown as FileSystemDirectoryHandle,
    })

    const driver = new FSADriver()
    await expect(driver.init()).rejects.toThrow(/casing|collision/i)
    expect(await driver.list()).toEqual([])
  })

  it("init tratta solo la cancellazione esplicita del picker come esito false", async () => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => { throw new DOMException("Cancelled", "AbortError") },
    })

    const driver = new FSADriver()
    await expect(driver.init()).resolves.toBe(false)
  })

  it("propaga gli errori del picker diversi dalla cancellazione", async () => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => { throw new DOMException("Denied", "NotAllowedError") },
    })

    await expect(new FSADriver().init()).rejects.toMatchObject({ name: "NotAllowedError" })
  })

  it("serializza init concorrenti e ripristina l'ultimo root valido se il successivo fallisce", async () => {
    const goodRoot = new FakeDirectoryHandle("good")
    const conflictingRoot = new FakeDirectoryHandle("conflicting")
    conflictingRoot.unsafeAddDirectory("RAW")
    const picks = [goodRoot, conflictingRoot]
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => picks.shift() as unknown as FileSystemDirectoryHandle,
    })
    const driver = new FSADriver()

    const outcomes = await Promise.allSettled([driver.init(), driver.init()])
    expect(outcomes[0]).toMatchObject({ status: "fulfilled", value: true })
    expect(outcomes[1].status).toBe("rejected")
    await driver.write("raw/kept/events.jsonl", new Blob(["good-root"]))
    const goodReader = driverWithRoot(goodRoot).driver
    expect(await textOf(await goodReader.read("raw/kept/events.jsonl"))).toBe("good-root")
  })

  it("mantiene due init concorrenti nello stesso lock exclusive fino al commit del root", async () => {
    const firstRoot = new FakeDirectoryHandle("first")
    const secondRoot = new FakeDirectoryHandle("second")
    const firstEnteredCreate = deferred()
    const releaseFirst = deferred()
    firstRoot.onNextDirectoryCreate(async () => {
      firstEnteredCreate.resolve()
      await releaseFirst.promise
    })
    const picks = [firstRoot, secondRoot]
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => picks.shift() as unknown as FileSystemDirectoryHandle,
    })
    const driver = new FSADriver()

    const first = driver.init()
    await firstEnteredCreate.promise
    let secondSettled = false
    const second = driver.init().finally(() => { secondSettled = true })
    await Promise.resolve()
    await Promise.resolve()

    expect(secondSettled).toBe(false)
    expect(lockRequests).toEqual([
      { name: "ardesia:fsa:workspace", mode: "exclusive" },
      { name: "ardesia:fsa:workspace", mode: "exclusive" },
    ])
    releaseFirst.resolve()
    await expect(Promise.all([first, second])).resolves.toEqual([true, true])

    await driver.write("raw/active/events.jsonl", new Blob(["second-root"]))
    expect(await textOf(await driverWithRoot(firstRoot).driver.read("raw/active/events.jsonl"))).toBeNull()
    expect(await textOf(await driverWithRoot(secondRoot).driver.read("raw/active/events.jsonl"))).toBe(
      "second-root",
    )
  })
})
