// LessonOS — test IndexedDbEventLog (fase 1 spec EVENTLOG-PERSISTENCE-SPEC §3.1/§5).
// Il punto della slice: l'event-log SOPRAVVIVE al reload (close → riapri → stessi
// eventi, stesso grafo). jsdom non fornisce IndexedDB e fake-indexeddb non è tra
// le dipendenze: qui c'è un fake in-file del SOLO subset IDB usato dall'adapter
// (open/upgrade, transaction, objectStore, add, getAll, getAllKeys), con dati che
// persistono nel factory attraverso close/reopen e transazioni readwrite FIFO sullo
// stesso store. La fedeltà piena a IDB reale resta coperta dall'E2E browser.

import { describe, it, expect } from "vitest"
import {
  InMemoryEventLog,
  UNASSIGNED_LESSON_ID,
  type AppendedEventEnvelopeV2,
  type EnvelopeEventLogStore,
  type LessonOsEvent,
} from "../lessonos/eventlog"
import { bootstrapLessonOs, eventLogMarkerKey, type MarkerStorageLike } from "../lessonos/bootstrap"
import { materialize } from "../lessonos/materializer"
import {
  createEventEnvelopeV2,
  type EventEnvelopeV2,
  type JsonObject,
} from "../core/contracts/eventEnvelope"
import {
  IndexedDbEventLog,
  createEventLogStore,
  destroyEventLogStorage,
  exportEnvelopeEventLogSnapshot,
  exportEventLogSnapshot,
} from "../lessonos/indexedDbEventLog"

/** Stessa fixture canonica di LessonOsEventLog.test.ts (Vol.1 Cap.6 Esp.1). */
const FIXTURE: LessonOsEvent[] = [
  { kind: "lesson.started", room: "elab-v1-cap6", t: 1000, evidence: ["lesson:elab-v1-cap6@1000"] },
  {
    kind: "concept.introduced",
    conceptId: "led_polarity",
    labels: { it: "Polarità del LED", en: "LED polarity" },
    t: 1100,
    evidence: ["manual:vol1:p30"],
  },
  {
    kind: "error.observed",
    errorId: "error:led-invertito-1",
    conceptId: "led_polarity",
    labels: { it: "LED montato invertito" },
    t: 1300,
    evidence: ["board:sim-embed-1", "lesson:elab-v1-cap6@1300"],
  },
  {
    kind: "exercise.completed",
    exerciseId: "exercise:rimonta-led",
    conceptId: "led_polarity",
    correctsErrorId: "error:led-invertito-1",
    labels: { it: "Rimonta il LED con anodo verso il resistore" },
    t: 1400,
    evidence: ["board:sim-embed-1"],
  },
  { kind: "lesson.ended", room: "elab-v1-cap6", t: 1500, evidence: ["lesson:elab-v1-cap6@1500"] },
]

// ---------------------------------------------------------------------------
// Fake IndexedDB minimale. I dati vivono nel factory: due IndexedDbEventLog
// creati sullo stesso factory vedono lo stesso storage (= stesso browser).
// ---------------------------------------------------------------------------

type StoredRecord = Record<string, unknown>

class FakeRequest<T> {
  result!: T
  error: DOMException | null = null
  onsuccess: ((ev: unknown) => void) | null = null
  onerror: ((ev: unknown) => void) | null = null
  settleSuccess(result: T) {
    this.result = result
    queueMicrotask(() => this.onsuccess?.({ target: this }))
  }
  settleError(message: string) {
    this.error = new DOMException(message, "ConstraintError")
    queueMicrotask(() => this.onerror?.({ target: this }))
  }
}

class FakeObjectStore {
  private keyPath: string
  private txn: FakeTransaction
  constructor(keyPath: string, txn: FakeTransaction) {
    this.keyPath = keyPath
    this.txn = txn
  }

  add(value: StoredRecord): FakeRequest<number> {
    return this.txn.request((records) => {
      const key = value[this.keyPath]
      if (typeof key !== "number" || !Number.isInteger(key) || key <= 0) {
        throw new DOMException(`chiave non valida: ${String(key)}`, "ConstraintError")
      }
      if (records.has(key)) {
        throw new DOMException(`chiave duplicata: ${key}`, "ConstraintError")
      }
      records.set(key, structuredClone(value))
      return key
    })
  }

  getAll(): FakeRequest<StoredRecord[]> {
    return this.txn.request((records) => {
      this.txn.noteGetAll()
      const keys = [...records.keys()].sort((a, b) => a - b)
      return keys.map((key) => structuredClone(records.get(key)!))
    })
  }

  getAllKeys(): FakeRequest<number[]> {
    return this.txn.request((records) => {
      const failure = this.txn.takeGetAllKeysFailure()
      if (failure) throw new DOMException(failure, "UnknownError")
      return [...records.keys()].sort((a, b) => a - b)
    })
  }
}

class FakeTransaction {
  pending = 0
  error: DOMException | null = null
  private failed = false
  private active = false
  private completed = false
  private activity = 0
  private operations: Array<() => void> = []
  private working: Map<number, StoredRecord> | null = null
  oncomplete: ((ev: unknown) => void) | null = null
  onabort: ((ev: unknown) => void) | null = null
  onerror: ((ev: unknown) => void) | null = null

  private db: FakeDatabase
  private storeName: string
  private mode: IDBTransactionMode
  private release: () => void
  constructor(db: FakeDatabase, storeName: string, mode: IDBTransactionMode, release: () => void) {
    this.db = db
    this.storeName = storeName
    this.mode = mode
    this.release = release
  }

  start() {
    if (this.active || this.completed) return
    this.active = true
    this.working = new Map(
      [...this.db.data(this.storeName)].map(([key, value]) => [key, structuredClone(value)]),
    )
    this.drain()
    this.scheduleComplete()
  }

  objectStore(name: string): FakeObjectStore {
    if (name !== this.storeName) throw new DOMException(`store sconosciuto: ${name}`, "NotFoundError")
    return new FakeObjectStore(this.db.keyPathOf(name), this)
  }

  takeGetAllKeysFailure(): string | undefined {
    return this.db.takeGetAllKeysFailure()
  }

  noteGetAll() {
    this.db.noteGetAll()
  }

  request<T>(operation: (records: Map<number, StoredRecord>) => T): FakeRequest<T> {
    if (this.completed) throw new DOMException("transazione non attiva", "TransactionInactiveError")
    const request = new FakeRequest<T>()
    this.pending += 1
    this.activity += 1
    this.operations.push(() => {
      try {
        request.settleSuccess(operation(this.working!))
        this.pending -= 1
        this.scheduleComplete()
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        request.settleError(message)
        this.pending -= 1
        this.error = request.error
        this.fail()
      }
    })
    this.drain()
    return request
  }

  private drain() {
    if (!this.active || this.failed || this.completed) return
    while (this.operations.length > 0 && !this.failed) this.operations.shift()!()
  }

  private scheduleComplete() {
    const activity = this.activity
    // Lascia passare l'onsuccess della request e la continuazione Promise che
    // può accodare la richiesta successiva nella stessa transazione attiva.
    queueMicrotask(() => {
      queueMicrotask(() => {
        if (
          this.active &&
          !this.failed &&
          !this.completed &&
          this.pending === 0 &&
          this.operations.length === 0 &&
          this.activity === activity
        ) {
          this.completed = true
          this.active = false
          if (this.mode === "readwrite") this.db.replaceData(this.storeName, this.working!)
          this.release()
          this.oncomplete?.({ target: this })
        }
      })
    })
  }

  private fail() {
    if (!this.failed) {
      this.failed = true
      queueMicrotask(() => {
        if (this.completed) return
        this.completed = true
        this.active = false
        this.release()
        this.onerror?.({ target: this })
        this.onabort?.({ target: this })
      })
    }
  }
}

class FakeDatabase {
  private backing: FakeBacking
  constructor(backing: FakeBacking) {
    this.backing = backing
  }
  objectStoreNames = {
    contains: (name: string) => this.backing.stores.has(name),
  }
  createObjectStore(name: string, opts: { keyPath: string }) {
    this.backing.stores.set(name, { keyPath: opts.keyPath, records: new Map() })
    const txn = new FakeTransaction(this, name, "readwrite", () => {})
    txn.start()
    return new FakeObjectStore(opts.keyPath, txn)
  }
  transaction(name: string, mode: IDBTransactionMode): FakeTransaction {
    if (!this.backing.stores.has(name)) throw new DOMException(`store sconosciuto: ${name}`, "NotFoundError")
    const txn = new FakeTransaction(
      this,
      name,
      mode,
      mode === "readwrite" ? () => this.releaseWriter(name) : () => {},
    )
    if (mode === "readwrite") this.backing.readwriteTransactions += 1
    if (mode === "readwrite") {
      const queue = this.backing.waitingWriters.get(name) ?? []
      this.backing.waitingWriters.set(name, queue)
      if (this.backing.activeWriters.has(name)) {
        queue.push(txn)
      } else {
        this.backing.activeWriters.add(name)
        queueMicrotask(() => txn.start())
      }
    } else {
      queueMicrotask(() => txn.start())
    }
    return txn
  }
  close() {}
  data(name: string): Map<number, StoredRecord> {
    return this.backing.stores.get(name)!.records
  }
  replaceData(name: string, source: Map<number, StoredRecord>) {
    this.backing.stores.get(name)!.records = new Map(
      [...source].map(([key, value]) => [key, structuredClone(value)]),
    )
  }
  keyPathOf(name: string): string {
    return this.backing.stores.get(name)!.keyPath
  }
  takeGetAllKeysFailure(): string | undefined {
    return this.backing.getAllKeysFailures.shift()
  }
  noteGetAll() {
    this.backing.getAllCalls += 1
  }
  private releaseWriter(name: string) {
    const queue = this.backing.waitingWriters.get(name)!
    const next = queue.shift()
    if (next) {
      queueMicrotask(() => next.start())
    } else {
      this.backing.activeWriters.delete(name)
    }
  }
}

interface FakeBacking {
  stores: Map<string, { keyPath: string; records: Map<number, StoredRecord> }>
  activeWriters: Set<string>
  waitingWriters: Map<string, FakeTransaction[]>
  getAllKeysFailures: string[]
  readwriteTransactions: number
  getAllCalls: number
}

class FakeOpenRequest extends FakeRequest<FakeDatabase> {
  onupgradeneeded: ((ev: unknown) => void) | null = null
}

/** Factory con storage persistente attraverso open/close (come un browser reale). */
class FakeIdbFactory {
  private databases = new Map<string, FakeBacking>()

  deleteDatabase(name: string): FakeRequest<void> {
    const req = new FakeRequest<void>()
    this.databases.delete(name)
    req.settleSuccess(undefined as void)
    return req
  }

  open(name: string, _version?: number): FakeOpenRequest {
    const req = new FakeOpenRequest()
    let backing = this.databases.get(name)
    const isNew = !backing
    if (!backing) {
      backing = {
        stores: new Map(),
        activeWriters: new Set(),
        waitingWriters: new Map(),
        getAllKeysFailures: [],
        readwriteTransactions: 0,
        getAllCalls: 0,
      }
      this.databases.set(name, backing)
    }
    const db = new FakeDatabase(backing)
    queueMicrotask(() => {
      if (isNew) {
        req.result = db
        req.onupgradeneeded?.({ target: req })
      }
      req.settleSuccess(db)
    })
    return req
  }

  /** Accesso diretto per seminare corruzione nei test. */
  seed(dbName: string, storeName: string, keyPath: string, records: StoredRecord[]) {
    const backing: FakeBacking = {
      stores: new Map(),
      activeWriters: new Set(),
      waitingWriters: new Map(),
      getAllKeysFailures: [],
      readwriteTransactions: 0,
      getAllCalls: 0,
    }
    const map = new Map<number, StoredRecord>()
    for (const r of records) map.set(r[keyPath] as number, structuredClone(r))
    backing.stores.set(storeName, { keyPath, records: map })
    this.databases.set(dbName, backing)
  }

  failNextGetAllKeys(message: string, dbName = "lessonos-eventlog") {
    const backing = this.databases.get(dbName)
    if (!backing) throw new Error(`database non aperto: ${dbName}`)
    backing.getAllKeysFailures.push(message)
  }

  readwriteTransactionCount(dbName = "lessonos-eventlog"): number {
    return this.databases.get(dbName)?.readwriteTransactions ?? 0
  }

  getAllCallCount(dbName = "lessonos-eventlog"): number {
    return this.databases.get(dbName)?.getAllCalls ?? 0
  }

  snapshotRecords(dbName = "lessonos-eventlog", storeName = "lessonos_events"): StoredRecord[] {
    const records = this.databases.get(dbName)?.stores.get(storeName)?.records
    if (!records) return []
    return [...records.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, value]) => structuredClone(value))
  }
}

const asFactory = (f: FakeIdbFactory) => f as unknown as IDBFactory

// ---------------------------------------------------------------------------

describe("IndexedDbEventLog — fase 1 spec #35", () => {
  it("append valida evidenza e timestamp PRIMA di scrivere (storage intatto)", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    await expect(
      log.append({ kind: "lesson.started", room: "x", t: 1, evidence: [] } as unknown as LessonOsEvent),
    ).rejects.toThrow(/evidence obbligatoria/)
    await expect(
      log.append({ kind: "lesson.started", room: "x", t: Number.NaN, evidence: ["lesson:x@1"] }),
    ).rejects.toThrow(/timestamp non valido/)
    expect(await log.readAll()).toEqual([])
  })

  it("append fotografa l'evento alla chiamata anche se attende una write e il caller lo muta subito", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    const callerOwned = {
      kind: "lesson.started" as const,
      room: "validated-room",
      t: 123,
      evidence: ["lesson:validated-room@123"],
    }
    const invocationSnapshot = structuredClone(callerOwned)

    const blocker = log.append(FIXTURE[0])
    const pending = log.append(callerOwned)
    callerOwned.room = "mutated-but-valid"
    callerOwned.t = 456
    callerOwned.evidence.splice(0, 1, "lesson:mutated-but-valid@456")

    expect((await blocker).seq).toBe(1)
    expect(await pending).toEqual({ ...invocationSnapshot, seq: 2 })
    expect((await log.readAll())[1]).toEqual({ ...invocationSnapshot, seq: 2 })
  })

  it("getAllKeys fallito produce una rejection al caller e zero rejection orfane", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    factory.failNextGetAllKeys("getAllKeys failure injected")
    const unhandled: unknown[] = []
    const captureUnhandled = (reason: unknown) => unhandled.push(reason)
    process.on("unhandledRejection", captureUnhandled)

    try {
      const settled = await Promise.allSettled([log.append(FIXTURE[0])])
      expect(settled).toHaveLength(1)
      expect(settled[0]?.status).toBe("rejected")
      if (settled[0]?.status === "rejected") {
        expect(String(settled[0].reason)).toContain("getAllKeys failure injected")
      }
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect(unhandled).toEqual([])
    } finally {
      process.off("unhandledRejection", captureUnhandled)
    }
  })

  it("append assegna seq monotono da 1 e readAll restituisce l'ordine del log", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    const report = await log.open()
    expect(report).toEqual({ recovered: 0, lastSeq: 0, droppedTail: 0, corrupted: false })
    for (const ev of FIXTURE) await log.append(ev)
    const all = await log.readAll()
    expect(all.map((e) => e.seq)).toEqual([1, 2, 3, 4, 5])
    expect(all.map((e) => e.kind)).toEqual(FIXTURE.map((e) => e.kind))
    expect(Object.isFrozen(all[0])).toBe(true)
  })

  it("due adapter già aperti appendono insieme con seq contigui e persistono al cold reopen", async () => {
    const factory = new FakeIdbFactory()
    const first = new IndexedDbEventLog({ factory: asFactory(factory) })
    const second = new IndexedDbEventLog({ factory: asFactory(factory) })
    await Promise.all([first.open(), second.open()])

    const appended = await Promise.all([first.append(FIXTURE[0]), second.append(FIXTURE[1])])
    expect(appended.map((event) => event.seq).sort((a, b) => a - b)).toEqual([1, 2])

    const persisted = await first.readAll()
    expect(persisted.map((event) => event.seq)).toEqual([1, 2])
    expect(persisted.map((event) => event.kind).sort()).toEqual(
      [FIXTURE[0].kind, FIXTURE[1].kind].sort(),
    )
    expect(new Set(persisted.map((event) => `${event.kind}:${event.t}`))).toEqual(
      new Set(FIXTURE.slice(0, 2).map((event) => `${event.kind}:${event.t}`)),
    )

    await Promise.all([first.close(), second.close()])
    const cold = new IndexedDbEventLog({ factory: asFactory(factory) })
    expect(await cold.open()).toEqual({ recovered: 2, lastSeq: 2, droppedTail: 0, corrupted: false })
    expect(await cold.readAll()).toEqual(persisted)
  })

  it("SOPRAVVIVE al reload: close → riapri stesso storage → recovery e grafo identici", async () => {
    const factory = new FakeIdbFactory()
    const first = new IndexedDbEventLog({ factory: asFactory(factory) })
    await first.open()
    for (const ev of FIXTURE) await first.append(ev)
    const before = materialize(await first.readAll())
    await first.close()

    const second = new IndexedDbEventLog({ factory: asFactory(factory) })
    const report = await second.open()
    expect(report).toEqual({ recovered: 5, lastSeq: 5, droppedTail: 0, corrupted: false })
    const after = materialize(await second.readAll())
    expect(after.nodes).toEqual(before.nodes)
    expect(after.edges).toEqual(before.edges)

    // Invariante 3: il primo append post-recovery usa lastSeq + 1.
    const appended = await second.append({
      kind: "lesson.started",
      room: "elab-v1-cap7",
      t: 2000,
      evidence: ["lesson:elab-v1-cap7@2000"],
    })
    expect(appended.seq).toBe(6)
  })

  it("recovery conservativa: buco in mezzo alla sequenza ⇒ corrupted, il log non si ripara", async () => {
    const factory = new FakeIdbFactory()
    const rec = (seq: number) => ({
      seq,
      t: seq * 100,
      kind: "lesson.started",
      payload: JSON.stringify({ kind: "lesson.started", room: "r", t: seq * 100, evidence: [`lesson:r@${seq}`] }),
      evidence: [`lesson:r@${seq}`],
    })
    factory.seed("lessonos-eventlog", "lessonos_events", "seq", [rec(1), rec(3)])
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    const report = await log.open()
    expect(report.corrupted).toBe(true)
    expect(report.recovered).toBe(2)
    expect(report.lastSeq).toBe(3)
  })

  it("drift-test: stesso fixture su InMemoryEventLog e IndexedDbEventLog ⇒ stesso grafo", async () => {
    const memory = new InMemoryEventLog()
    for (const ev of FIXTURE) await memory.append(ev)
    const idb = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await idb.open()
    for (const ev of FIXTURE) await idb.append(ev)
    const gMem = materialize(await memory.readAll())
    const gIdb = materialize(await idb.readAll())
    expect(gIdb.nodes).toEqual(gMem.nodes)
    expect(gIdb.edges).toEqual(gMem.edges)
    // Anche gli eventi stessi coincidono campo per campo (provenance intatta).
    expect(await idb.readAll()).toEqual(await memory.readAll())
  })

  it("createEventLogStore: fallback InMemoryEventLog quando IndexedDB non esiste (SSR/test)", async () => {
    const store = await createEventLogStore({ factory: undefined })
    expect(store).toBeInstanceOf(InMemoryEventLog)
    const appended = await store.append(FIXTURE[0])
    expect(appended.seq).toBe(1)
  })

  it("createEventLogStore: usa IndexedDB quando disponibile", async () => {
    const store = await createEventLogStore({ factory: asFactory(new FakeIdbFactory()) })
    expect(store).toBeInstanceOf(IndexedDbEventLog)
    const appended = await store.append(FIXTURE[0])
    expect(appended.seq).toBe(1)
  })

  it("exportSnapshot: JSONL una-riga-per-evento, seq preservati, roundtrip = stesso grafo (spec \u00a75)", async () => {
    const idb = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await idb.open()
    for (const ev of FIXTURE) await idb.append(ev)

    const snapshot = await idb.exportSnapshot()
    expect(snapshot.type).toBe("application/x-ndjson")
    const text = await snapshot.text()
    // Una riga per AppendedEvent, newline finale, nessuna riga vuota in mezzo.
    const lines = text.split("\n")
    expect(lines[lines.length - 1]).toBe("")
    const parsed = lines.slice(0, -1).map((line) => JSON.parse(line))
    expect(parsed).toEqual(await idb.readAll())
    // Il grafo rimaterializzato dallo snapshot coincide (provenance intatta).
    const g1 = materialize(await idb.readAll())
    const g2 = materialize(parsed)
    expect(g2.nodes).toEqual(g1.nodes)
    expect(g2.edges).toEqual(g1.edges)
  })

  it("exportEventLogSnapshot: funziona su QUALSIASI EventLogStore (anche il fallback InMemory)", async () => {
    const memory = new InMemoryEventLog()
    for (const ev of FIXTURE) await memory.append(ev)
    const snapshot = await exportEventLogSnapshot(memory)
    const parsed = (await snapshot.text()).trimEnd().split("\n").map((l) => JSON.parse(l))
    expect(parsed).toEqual(await memory.readAll())
  })

  it("exportSnapshot su log vuoto: Blob vuoto (size 0), nessuna riga fantasma", async () => {
    const idb = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await idb.open()
    const snapshot = await idb.exportSnapshot()
    expect(snapshot.size).toBe(0)
  })

  it("importSnapshot: restore su log vuoto preserva seq/eventi, append riparte da lastSeq+1 (spec \u00a75)", async () => {
    const source = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await source.open()
    for (const ev of FIXTURE) await source.append(ev)
    const snapshot = await source.exportSnapshot()

    const target = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await target.open()
    const report = await target.importSnapshot(snapshot)
    expect(report).toEqual({ recovered: 5, lastSeq: 5, droppedTail: 0, corrupted: false })
    expect(await target.readAll()).toEqual(await source.readAll())
    const gS = materialize(await source.readAll())
    const gT = materialize(await target.readAll())
    expect(gT.nodes).toEqual(gS.nodes)
    expect(gT.edges).toEqual(gS.edges)
    const appended = await target.append({
      kind: "lesson.started",
      room: "elab-v1-cap7",
      t: 3000,
      evidence: ["lesson:elab-v1-cap7@3000"],
    })
    expect(appended.seq).toBe(6)
  })

  it("importSnapshot su log NON vuoto: rifiutato (restore, mai merge)", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    await log.append(FIXTURE[0])
    const validSnapshot = JSON.stringify({ ...FIXTURE[1], seq: 1 })
    await expect(log.importSnapshot(new Blob([validSnapshot]))).rejects.toThrow(/log vuoto/)
  })

  it("importSnapshot vuoto rifiuta se un altro adapter ha scritto e lascia bytes/evento intatti", async () => {
    const factory = new FakeIdbFactory()
    const writer = new IndexedDbEventLog({ factory: asFactory(factory) })
    const stale = new IndexedDbEventLog({ factory: asFactory(factory) })
    await Promise.all([writer.open(), stale.open()])
    await writer.append(FIXTURE[0])
    const beforeLogical = await writer.readAll()
    const beforeBytes = await (await writer.exportSnapshot()).text()

    await expect(stale.importSnapshot(new Blob([]))).rejects.toThrow(/log vuoto/)

    expect(await stale.readAll()).toEqual(beforeLogical)
    expect(await (await stale.exportSnapshot()).text()).toBe(beforeBytes)
  })

  it("importSnapshot non vuoto su adapter stale rigetta una volta senza orphan e non altera il log", async () => {
    const factory = new FakeIdbFactory()
    const writer = new IndexedDbEventLog({ factory: asFactory(factory) })
    const stale = new IndexedDbEventLog({ factory: asFactory(factory) })
    await Promise.all([writer.open(), stale.open()])
    await writer.append(FIXTURE[0])
    const beforeLogical = await writer.readAll()
    const beforeBytes = await (await writer.exportSnapshot()).text()
    const replacement = new Blob([`${JSON.stringify({ ...FIXTURE[1], seq: 1 })}\n`])
    const unhandled: unknown[] = []
    const captureUnhandled = (reason: unknown) => unhandled.push(reason)
    process.on("unhandledRejection", captureUnhandled)

    try {
      const settled = await Promise.allSettled([stale.importSnapshot(replacement)])
      expect(settled).toHaveLength(1)
      expect(settled[0]?.status).toBe("rejected")
      const callerReason = settled[0]?.status === "rejected" ? String(settled[0].reason) : ""
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect({ callerReason, unhandled: unhandled.map(String) }).toEqual({
        callerReason: expect.stringContaining("log vuoto"),
        unhandled: [],
      })
      expect(await stale.readAll()).toEqual(beforeLogical)
      expect(await (await stale.exportSnapshot()).text()).toBe(beforeBytes)
    } finally {
      process.off("unhandledRejection", captureUnhandled)
    }
  })

  it("importSnapshot con sequenza bucata o riga non-JSON: rifiutato, il log resta vuoto", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    const holed = new Blob([
      JSON.stringify({ ...FIXTURE[0], seq: 1 }) + "\n" + JSON.stringify({ ...FIXTURE[1], seq: 3 }) + "\n",
    ])
    await expect(log.importSnapshot(holed)).rejects.toThrow(/non contigua/)
    await expect(log.importSnapshot(new Blob(["non-json\n"]))).rejects.toThrow(/non-JSON/)
    expect(await log.readAll()).toEqual([])
    // Il log resta usabile: primo append parte da 1.
    const appended = await log.append(FIXTURE[0])
    expect(appended.seq).toBe(1)
  })

  it("percorso restore completo: log corrotto \u2192 destroy (con conferma) \u2192 open vuoto \u2192 importSnapshot", async () => {
    const factory = new FakeIdbFactory()
    // Log sano di partenza: snapshot di riferimento.
    const healthy = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await healthy.open()
    for (const ev of FIXTURE) await healthy.append(ev)
    const backup = await healthy.exportSnapshot()

    // Storage corrotto (buco nella sequenza).
    const rec = (seq: number) => ({
      seq,
      t: seq * 100,
      kind: "lesson.started",
      payload: JSON.stringify({ kind: "lesson.started", room: "r", t: seq * 100, evidence: [`lesson:r@${seq}`] }),
      evidence: [`lesson:r@${seq}`],
    })
    factory.seed("lessonos-eventlog", "lessonos_events", "seq", [rec(1), rec(3)])
    const corrupted = new IndexedDbEventLog({ factory: asFactory(factory) })
    expect((await corrupted.open()).corrupted).toBe(true)
    await corrupted.close()

    // Senza conferma esplicita: rifiutato.
    await expect(
      destroyEventLogStorage({ userConfirmed: false as unknown as true }, { factory: asFactory(factory) }),
    ).rejects.toThrow(/conferma/)

    // Con conferma: storage azzerato, open pulito, restore dal backup.
    await destroyEventLogStorage({ userConfirmed: true }, { factory: asFactory(factory) })
    const restored = new IndexedDbEventLog({ factory: asFactory(factory) })
    expect((await restored.open()).recovered).toBe(0)
    const report = await restored.importSnapshot(backup)
    expect(report.corrupted).toBe(false)
    expect(report.recovered).toBe(5)
    expect(await restored.readAll()).toEqual(await healthy.readAll())
  })
})

describe("bootstrapLessonOs \u2014 telemetria di perdita (spec \u00a74.4, marker localStorage)", () => {
  // Il marker è scopato sul DB fisico (default "lessonos-eventlog").
  const KEY = eventLogMarkerKey("lessonos-eventlog")
  function fakeMarker(initial: Record<string, string> = {}): MarkerStorageLike & { data: Map<string, string> } {
    const data = new Map(Object.entries(initial))
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    }
  }

  it("log con eventi \u21d2 marker settato, dataLoss=false", async () => {
    const factory = asFactory(new FakeIdbFactory())
    const seedLog = new IndexedDbEventLog({ factory })
    await seedLog.open()
    for (const ev of FIXTURE) await seedLog.append(ev)
    await seedLog.close()

    const marker = fakeMarker()
    const runtime = await bootstrapLessonOs({ indexedDB: factory, storage: undefined, markerStorage: marker })
    expect(runtime.dataLoss).toBe(false)
    expect(runtime.corrupted).toBe(false)
    expect(runtime.persistent).toBe(true)
    expect(marker.getItem(KEY)).toBe("1")
  })

  it("marker per-DB: il segnale di un altro DB non provoca dataLoss (chiave scopata)", () => {
    // Verifica strutturale: chiavi di DB diversi non collidono.
    expect(eventLogMarkerKey("lessonos-eventlog")).not.toBe(eventLogMarkerKey("altro-db"))
    expect(eventLogMarkerKey("lessonos-eventlog")).toContain("lessonos-eventlog")
  })

  it("getItem che lancia (storage negato) ⇒ nessun dataLoss e nessun crash, telemetria degrada", async () => {
    const throwingMarker: MarkerStorageLike = {
      getItem: () => {
        throw new DOMException("storage negato", "SecurityError")
      },
      setItem: () => {},
      removeItem: () => {},
    }
    const runtime = await bootstrapLessonOs({
      indexedDB: asFactory(new FakeIdbFactory()),
      storage: undefined,
      markerStorage: throwingMarker,
    })
    expect(runtime.dataLoss).toBe(false)
  })

  it("log atteso (marker) ma storage vuoto \u21d2 dataLoss=true, marker CONSUMATO (avviso una volta sola)", async () => {
    const marker = fakeMarker({ [KEY]: "1" })
    const runtime = await bootstrapLessonOs({
      indexedDB: asFactory(new FakeIdbFactory()), // storage nuovo = eviction simulata
      storage: undefined,
      markerStorage: marker,
    })
    expect(runtime.dataLoss).toBe(true)
    expect(marker.getItem(KEY)).toBeNull()
    // Reload successivo: nessun nuovo allarme.
    const again = await bootstrapLessonOs({
      indexedDB: asFactory(new FakeIdbFactory()),
      storage: undefined,
      markerStorage: marker,
    })
    expect(again.dataLoss).toBe(false)
  })

  it("log vuoto SENZA marker (lavagna davvero nuova) \u21d2 dataLoss=false", async () => {
    const marker = fakeMarker()
    const runtime = await bootstrapLessonOs({
      indexedDB: asFactory(new FakeIdbFactory()),
      storage: undefined,
      markerStorage: marker,
    })
    expect(runtime.dataLoss).toBe(false)
    expect(marker.getItem(KEY)).toBeNull()
  })

  it("sequenza bucata \u21d2 corrupted=true nel runtime (\u00a75 inv. 5)", async () => {
    const factory = new FakeIdbFactory()
    const rec = (seq: number) => ({
      seq,
      t: seq * 100,
      kind: "lesson.started",
      payload: JSON.stringify({ kind: "lesson.started", room: "r", t: seq * 100, evidence: [`lesson:r@${seq}`] }),
      evidence: [`lesson:r@${seq}`],
    })
    factory.seed("lessonos-eventlog", "lessonos_events", "seq", [rec(1), rec(3)])
    const runtime = await bootstrapLessonOs({
      indexedDB: asFactory(factory),
      storage: undefined,
      markerStorage: fakeMarker(),
    })
    expect(runtime.corrupted).toBe(true)
  })

  it("fallback InMemory (niente IndexedDB): marker NON giudicabile \u21d2 mai falso allarme", async () => {
    const marker = fakeMarker({ [KEY]: "1" })
    const runtime = await bootstrapLessonOs({
      indexedDB: undefined,
      storage: undefined,
      markerStorage: marker,
    })
    expect(runtime.store).toBeInstanceOf(InMemoryEventLog)
    expect(runtime.dataLoss).toBe(false)
    expect(marker.getItem(KEY)).toBe("1")
  })
})

// ---------------------------------------------------------------------------
// P31 — affidabilità emit: gli append concorrenti/rapidi del Simulation Plugin
// (solved→error→solved durante break/restore) NON devono collidere sul seq né
// lasciare promise rejected orfane (era la causa dell'unhandled rejection
// "scrittura fallita" che rendeva flaky la trace P30).
// ---------------------------------------------------------------------------

const simError = (t: number): LessonOsEvent => ({
  kind: "simulation.error.observed",
  errorId: "sim-error:v1-cap6-esp1:open-circuit",
  conceptId: "circuito_chiuso",
  sceneId: "v1-cap6-esp1",
  experimentId: "v1-cap6-esp1",
  labels: { it: "Circuito aperto" },
  t,
  evidence: ["simulation:scene:v1-cap6-esp1"],
})

const simSolved = (t: number, currentMa: number): LessonOsEvent => ({
  kind: "simulation.circuit.solved",
  experimentId: "v1-cap6-esp1",
  sceneId: "v1-cap6-esp1",
  currentMa,
  bookLayoutValid: true,
  labels: { it: `Circuito risolto: ${currentMa} mA` },
  t,
  evidence: ["simulation:scene:v1-cap6-esp1"],
})

describe("IndexedDbEventLog — affidabilità emit (P31)", () => {
  it("append CONCORRENTI: seq distinti e monotoni, nessun reject (no seq-collision)", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    const events = [1, 2, 3, 4, 5, 6].map((n) => simSolved(1000 + n, n))
    const results = await Promise.all(events.map((ev) => log.append(ev)))
    expect(results.map((r) => r.seq).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
    expect((await log.readAll()).map((e) => e.seq)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it("solved→error→solved rapido: tre eventi distinti persistiti, seq distinti", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    const [a, b, c] = await Promise.all([
      log.append(simSolved(2001, 15.3)),
      log.append(simError(2002)),
      log.append(simSolved(2003, 15.3)),
    ])
    expect(new Set([a.seq, b.seq, c.seq]).size).toBe(3)
    const kinds = (await log.readAll()).map((e) => e.kind)
    expect(kinds).toContain("simulation.error.observed")
    expect(kinds.filter((k) => k === "simulation.circuit.solved")).toHaveLength(2)
  })

  it("emit rapido dello STESSO errore (benign): tutti risolvono, nessuna unhandled rejection", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    // dedup è responsabilità del chiamante (lastEmittedSolveRef): qui verifichiamo
    // solo che, anche senza dedup, append rapidi identici NON rigettano/collidono.
    const many = Array.from({ length: 8 }, (_, i) => log.append(simError(3000 + i)))
    const settled = await Promise.allSettled(many)
    expect(settled.every((s) => s.status === "fulfilled")).toBe(true)
    expect((await log.readAll()).length).toBe(8)
  })

  it("errore NON benigno resta VISIBILE al chiamante (no swallow)", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    await expect(
      log.append({ kind: "simulation.error.observed", errorId: "x", conceptId: "c", labels: {}, t: 1, evidence: [] } as unknown as LessonOsEvent),
    ).rejects.toThrow(/evidence obbligatoria/)
    // dopo un errore visibile, la coda continua a funzionare
    const ok = await log.append(simSolved(4000, 15.3))
    expect(ok.seq).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// FB-3B — persistenza dell'envelope canonico v2 e proiezione conservativa v1.
// Questi test sono volutamente sul confine fisico: nessuna inferenza da route,
// room corrente o range di seq può sostituire l'identità lesson/session.
// ---------------------------------------------------------------------------

const TEST_PRODUCER_SHA = "03ec2c40570f3259bd91e7c251de0bcc80fdfaf3"
const SESSION_A = "10000000-0000-4000-8000-000000000001"
const SESSION_B = "20000000-0000-4000-8000-000000000002"

interface CanonicalEnvelopeOptions {
  eventId?: string
  lessonId?: string
  sessionId?: string
  kind?: string
  occurredAt?: Date
  idempotencyKey?: string | null
  actor?: { type: "teacher" | "system" | "plugin"; id: string }
  evidence?: Array<{ ref: string; resolution: "verified" | "missing" }>
  payload?: JsonObject
}

function canonicalEnvelope(
  options: CanonicalEnvelopeOptions = {},
): EventEnvelopeV2<string, JsonObject> {
  return createEventEnvelopeV2(
    {
      lessonId: options.lessonId ?? "elab-v1-cap6",
      sessionId: options.sessionId ?? SESSION_A,
      kind: options.kind ?? "concept.introduced",
      actor: options.actor ?? { type: "teacher", id: "teacher:test" },
      producer: {
        id: "com.github.andreamarro.ardesia.studio.test",
        version: "0.1.0",
        commitSha: TEST_PRODUCER_SHA,
      },
      causationId: null,
      idempotencyKey: options.idempotencyKey === undefined ? "test:canonical:1" : options.idempotencyKey,
      evidence: options.evidence ?? [{ ref: "manual:vol1:p30", resolution: "verified" }],
      payload: options.payload ?? { conceptId: "led_polarity", labels: { it: "Polarità del LED" } },
    },
    {
      eventId: () => options.eventId ?? "30000000-0000-4000-8000-000000000003",
      now: () => options.occurredAt ?? new Date("2026-07-18T10:00:00.000Z"),
    },
  )
}

function aiAdviceEnvelope(): EventEnvelopeV2<string, JsonObject> {
  return canonicalEnvelope({
    eventId: "90000000-0000-4000-8000-000000000009",
    kind: "ai.advice.proposed",
    idempotencyKey: "test:ai:1",
    actor: { type: "system", id: "ai.consultative" },
    evidence: [{ ref: "manual:vol1:p30", resolution: "missing" }],
    payload: {
      model: { provider: "local", id: "review-only", version: "1" },
      sources: [{ ref: "manual:vol1:p30", resolution: "missing" }],
      actionLevel: "A0",
      humanReview: "pending",
    },
  })
}

function physicalV1Record(event: LessonOsEvent, seq: number): StoredRecord {
  return {
    seq,
    t: event.t,
    kind: event.kind,
    payload: JSON.stringify(event),
    evidence: [...event.evidence],
  }
}

function appendedCanonicalLine(envelope: EventEnvelopeV2<string, JsonObject>, seq: number): string {
  return JSON.stringify({ ...envelope, seq })
}

function cryptoWithFirstDigestDelayed(): Crypto {
  const realCrypto = globalThis.crypto
  let calls = 0
  const digest = async (...args: Parameters<SubtleCrypto["digest"]>) => {
    calls += 1
    if (calls === 1) await new Promise<void>((resolve) => setImmediate(resolve))
    return realCrypto.subtle.digest(...args)
  }
  return {
    subtle: { digest } as SubtleCrypto,
    randomUUID: realCrypto.randomUUID.bind(realCrypto),
    getRandomValues: realCrypto.getRandomValues.bind(realCrypto),
  } as unknown as Crypto
}

describe("IndexedDbEventLog — FB-3B canonical envelope v2", () => {
  it("rifiuta un timestamp legacy finito ma fuori range ISO prima di invocare SHA-256", async () => {
    const realCrypto = globalThis.crypto
    let digestCalls = 0
    const countingCrypto = {
      subtle: {
        digest: (...args: Parameters<SubtleCrypto["digest"]>) => {
          digestCalls += 1
          return realCrypto.subtle.digest(...args)
        },
      } as SubtleCrypto,
      randomUUID: realCrypto.randomUUID.bind(realCrypto),
      getRandomValues: realCrypto.getRandomValues.bind(realCrypto),
    } as unknown as Crypto
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory), crypto: countingCrypto })
    await log.open()

    await expect(log.append({ ...FIXTURE[0], t: Number.MAX_VALUE })).rejects.toThrow(/timestamp.*ISO|timestamp/i)
    expect(digestCalls).toBe(0)
    expect(factory.readwriteTransactionCount()).toBe(0)
  })

  it("non accoda nuovi eventi quando il recovery rileva una sequenza corrotta", async () => {
    const factory = new FakeIdbFactory()
    factory.seed("lessonos-eventlog", "lessonos_events", "seq", [
      physicalV1Record(FIXTURE[0], 1),
      physicalV1Record(FIXTURE[1], 3),
    ])
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    expect((await log.open()).corrupted).toBe(true)
    const beforeWrites = factory.readwriteTransactionCount()

    await expect(log.appendEnvelope(canonicalEnvelope())).rejects.toThrow(/corrott/i)
    expect(factory.readwriteTransactionCount()).toBe(beforeWrites)
    expect(factory.snapshotRecords().map((record) => record.seq)).toEqual([1, 3])
  })

  it("preserva l'ordine di invocazione v1 anche se il primo digest SHA-256 termina dopo il secondo", async () => {
    const log = new IndexedDbEventLog({
      factory: asFactory(new FakeIdbFactory()),
      crypto: cryptoWithFirstDigestDelayed(),
    })
    await log.open()

    const [first, second] = await Promise.all([log.append(FIXTURE[0]), log.append(FIXTURE[1])])

    expect([first.seq, second.seq]).toEqual([1, 2])
    expect((await log.readAll()).map((event) => event.kind)).toEqual([FIXTURE[0].kind, FIXTURE[1].kind])
  })

  it("rifiuta v2 invalido prima di aprire una write e fotografa profondamente l'input valido", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    const valid = canonicalEnvelope()
    const invalid = structuredClone(valid) as unknown as Record<string, unknown>
    invalid.producer = { ...valid.producer, commitSha: "short" }

    const before = factory.readwriteTransactionCount()
    await expect(log.appendEnvelope(invalid as never)).rejects.toThrow(/commitSha/)
    expect(factory.readwriteTransactionCount()).toBe(before)

    const mutable = structuredClone(valid) as EventEnvelopeV2<string, JsonObject>
    const invocationSnapshot = structuredClone(mutable)
    const pending = log.appendEnvelope(mutable)
    ;(mutable.payload as { conceptId: string }).conceptId = "mutated"
    ;(mutable.evidence[0] as { ref: string }).ref = "manual:mutated"
    ;(mutable.producer as { commitSha: string }).commitSha = "f".repeat(40)

    const result = await pending
    expect(result.appended).toBe(true)
    expect(result.event).toEqual({ ...invocationSnapshot, seq: 1 })
    expect((await log.readAllEnvelopes())[0]).toEqual(result.event)
  })

  it("rifiuta prima della write payload mancanti o extra per un kind fattuale noto", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    const before = factory.readwriteTransactionCount()

    await expect(log.appendEnvelope(canonicalEnvelope({ payload: {} }))).rejects.toThrow(/payload.*conceptId/i)
    await expect(
      log.appendEnvelope(
        canonicalEnvelope({
          eventId: "31000000-0000-4000-8000-000000000013",
          idempotencyKey: "test:canonical:extra",
          payload: { conceptId: "led", labels: { it: "LED" }, unexpected: true },
        }),
      ),
    ).rejects.toThrow(/payload.*unknown|payload.*unexpected/i)
    expect(factory.readwriteTransactionCount()).toBe(before)
    expect(factory.snapshotRecords()).toEqual([])
  })

  it("deduplica atomicamente lo stesso envelope fra due adapter già aperti", async () => {
    const factory = new FakeIdbFactory()
    const first = new IndexedDbEventLog({ factory: asFactory(factory) })
    const second = new IndexedDbEventLog({ factory: asFactory(factory) })
    await Promise.all([first.open(), second.open()])
    const envelope = canonicalEnvelope()

    const results = await Promise.all([
      first.appendEnvelope(structuredClone(envelope)),
      second.appendEnvelope(structuredClone(envelope)),
    ])

    expect(results.map((result) => result.appended).sort()).toEqual([false, true])
    expect(new Set(results.map((result) => result.event.seq))).toEqual(new Set([1]))
    expect(factory.snapshotRecords()).toHaveLength(1)
    expect(await first.readAllEnvelopes()).toEqual([results[0]!.event])
  })

  it("rifiuta conflitti separati di idempotencyKey/eventId senza alterare lo storage", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    const original = canonicalEnvelope()
    await log.appendEnvelope(original)
    const before = JSON.stringify(factory.snapshotRecords())

    await expect(
      log.appendEnvelope(
        canonicalEnvelope({
          eventId: "40000000-0000-4000-8000-000000000004",
          idempotencyKey: original.idempotencyKey,
          payload: { conceptId: "resistor", labels: { it: "Resistore" } },
        }),
      ),
    ).rejects.toThrow(/idempotency/i)
    expect(JSON.stringify(factory.snapshotRecords())).toBe(before)

    await expect(
      log.appendEnvelope(
        canonicalEnvelope({
          eventId: original.eventId,
          idempotencyKey: "test:canonical:different",
          payload: { conceptId: "capacitor", labels: { it: "Condensatore" } },
        }),
      ),
    ).rejects.toThrow(/eventId/i)
    expect(JSON.stringify(factory.snapshotRecords())).toBe(before)
  })

  it("rende visibile corruzione globale da identità v2 duplicate anche se l'input non coincide", async () => {
    const duplicate = canonicalEnvelope()
    const factory = new FakeIdbFactory()
    factory.seed("lessonos-eventlog", "lessonos_events", "seq", [
      { ...duplicate, seq: 1 },
      { ...duplicate, seq: 2 },
    ])
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()

    await expect(log.readAllEnvelopes()).rejects.toThrow(/corruzione|duplicat/i)
    await expect(
      log.appendEnvelope(
        canonicalEnvelope({
          eventId: "44000000-0000-4000-8000-000000000004",
          idempotencyKey: "unrelated:identity",
        }),
      ),
    ).rejects.toThrow(/corruzione|duplicat/i)
    expect(factory.snapshotRecords()).toHaveLength(2)
  })

  it("cold reopen preserva ogni campo e le query lesson/session filtrano identità esatte", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    const first = canonicalEnvelope({ eventId: "41000000-0000-4000-8000-000000000001", idempotencyKey: "q:1" })
    const middle = canonicalEnvelope({
      eventId: "42000000-0000-4000-8000-000000000002",
      idempotencyKey: "q:2",
      lessonId: "elab-v1-cap7",
      sessionId: SESSION_B,
    })
    const last = canonicalEnvelope({
      eventId: "43000000-0000-4000-8000-000000000003",
      idempotencyKey: "q:3",
      occurredAt: new Date("2026-07-18T10:02:00.000Z"),
    })
    await log.appendEnvelope(first)
    await log.appendEnvelope(middle)
    await log.appendEnvelope(last)
    await log.close()

    const cold = new IndexedDbEventLog({ factory: asFactory(factory) })
    await cold.open()
    const all = await cold.readAllEnvelopes()
    expect(all.map((event) => event.producer.commitSha)).toEqual([
      TEST_PRODUCER_SHA,
      TEST_PRODUCER_SHA,
      TEST_PRODUCER_SHA,
    ])
    expect(all[0]).toEqual({ ...first, seq: 1 })
    expect((await cold.readEnvelopesByLesson("elab-v1-cap6")).map((event) => event.seq)).toEqual([1, 3])
    expect((await cold.readEnvelopesBySession("elab-v1-cap6", SESSION_A)).map((event) => event.seq)).toEqual([
      1,
      3,
    ])
    expect(await cold.readEnvelopesBySession("elab-v1-cap6", SESSION_B)).toEqual([])
  })

  it("proietta un lifecycle legacy completo da un solo snapshot senza mutare i record fisici", async () => {
    const outsideBefore: LessonOsEvent = {
      kind: "concept.introduced",
      conceptId: "outside-before",
      labels: { it: "Fuori" },
      t: 900,
      evidence: ["manual:outside-before"],
    }
    const conflictingRoom: LessonOsEvent = {
      kind: "plugin.mounted",
      pluginId: "builtin-reviewed",
      pluginKind: "simulation",
      instanceId: "plugin-1",
      room: "elab-v1-cap7",
      labels: { it: "Plugin" },
      t: 1200,
      evidence: ["plugin:builtin-reviewed@1.0.0"],
    }
    const conflictingFromRoom: LessonOsEvent = {
      kind: "studentpack.generated",
      packId: "sp-error-1",
      errorId: "error-1",
      fromRoom: "elab-v1-cap7",
      t: 1250,
      evidence: ["lesson:elab-v1-cap7@1250"],
    }
    const outsideAfter: LessonOsEvent = {
      kind: "concept.introduced",
      conceptId: "outside-after",
      labels: { it: "Fuori" },
      t: 1600,
      evidence: ["manual:outside-after"],
    }
    const physical = [
      outsideBefore,
      ...FIXTURE.slice(0, 2),
      conflictingRoom,
      conflictingFromRoom,
      FIXTURE[4],
      outsideAfter,
    ].map((event, index) => physicalV1Record(event, index + 1))
    const factory = new FakeIdbFactory()
    factory.seed("lessonos-eventlog", "lessonos_events", "seq", physical)
    const beforeBytes = JSON.stringify(factory.snapshotRecords())
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    const beforeReads = factory.getAllCallCount()

    const projected = await log.readAllEnvelopes()

    expect(factory.getAllCallCount() - beforeReads).toBe(1)
    expect(JSON.stringify(factory.snapshotRecords())).toBe(beforeBytes)
    expect(projected.map((event) => event.seq)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(projected[0]?.lessonId).toBe(UNASSIGNED_LESSON_ID)
    expect(projected[1]?.lessonId).toBe("elab-v1-cap6")
    expect(projected[2]?.lessonId).toBe("elab-v1-cap6")
    expect(projected[3]?.lessonId).toBe(UNASSIGNED_LESSON_ID)
    expect(projected[4]?.lessonId).toBe(UNASSIGNED_LESSON_ID)
    expect(projected[5]?.lessonId).toBe("elab-v1-cap6")
    expect(projected[6]?.lessonId).toBe(UNASSIGNED_LESSON_ID)
    expect(new Set([projected[1]?.sessionId, projected[2]?.sessionId, projected[5]?.sessionId]).size).toBe(1)
    expect(projected.flatMap((event) => event.evidence).every((item) => item.resolution === "missing")).toBe(true)
    expect(
      projected.every(
        (event) => event.producer.id === "com.github.andreamarro.ardesia.studio.lessonos-v1-adapter",
      ),
    ).toBe(true)
    expect(projected.every((event) => event.eventId[14] === "8" && /^[89ab]$/.test(event.eventId[19]!))).toBe(true)
    expect(await log.readAllEnvelopes()).toEqual(projected)
    await log.close()
    const cold = new IndexedDbEventLog({ factory: asFactory(factory) })
    await cold.open()
    expect(await cold.readAllEnvelopes()).toEqual(projected)
  })

  it("lascia unassigned lifecycle incompleti, sovrapposti e room malformate", async () => {
    const cases: LessonOsEvent[][] = [
      [FIXTURE[0], FIXTURE[1]],
      [
        { kind: "lesson.started", room: "elab-v1-cap6", t: 1, evidence: ["lesson:a@1"] },
        { kind: "lesson.started", room: "elab-v1-cap7", t: 2, evidence: ["lesson:b@2"] },
        FIXTURE[1],
        { kind: "lesson.ended", room: "elab-v1-cap6", t: 4, evidence: ["lesson:a@4"] },
        { kind: "lesson.ended", room: "elab-v1-cap7", t: 5, evidence: ["lesson:b@5"] },
      ],
      [
        { kind: "lesson.started", room: "../escape", t: 1, evidence: ["lesson:bad@1"] },
        { kind: "lesson.ended", room: "../escape", t: 2, evidence: ["lesson:bad@2"] },
      ],
      [
        { kind: "lesson.started", room: "../escape", t: 1, evidence: ["lesson:bad@1"] },
        { kind: "lesson.started", room: "elab-v1-cap6", t: 2, evidence: ["lesson:good@2"] },
        FIXTURE[1],
        { kind: "lesson.ended", room: "elab-v1-cap6", t: 4, evidence: ["lesson:good@4"] },
      ],
    ]

    for (let index = 0; index < cases.length; index += 1) {
      const factory = new FakeIdbFactory()
      factory.seed(
        `legacy-ambiguous-${index}`,
        "lessonos_events",
        "seq",
        cases[index]!.map((event, seqIndex) => physicalV1Record(event, seqIndex + 1)),
      )
      const log = new IndexedDbEventLog({ factory: asFactory(factory), dbName: `legacy-ambiguous-${index}` })
      await log.open()
      expect((await log.readAllEnvelopes()).every((event) => event.lessonId === UNASSIGNED_LESSON_ID)).toBe(true)
    }
  })

  it("mantiene il grafo fattuale v1 ed esclude esplicitamente il consiglio AI", async () => {
    const log = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await log.open()
    for (const event of FIXTURE) await log.append(event)
    await log.appendEnvelope(aiAdviceEnvelope())

    const legacy = await log.readAll()
    expect(legacy).toEqual(FIXTURE.map((event, index) => Object.freeze({ ...event, seq: index + 1 })))
    expect(legacy.some((event) => event.kind.startsWith("ai."))).toBe(false)
    expect(materialize(legacy)).toEqual(materialize(FIXTURE.map((event, index) => ({ ...event, seq: index + 1 }))))
  })

  it("importa snapshot misto in modo conservativo ed esporta envelope preservando seq", async () => {
    const v1 = JSON.stringify({ ...FIXTURE[0], seq: 1 })
    const v2 = canonicalEnvelope({
      eventId: "50000000-0000-4000-8000-000000000005",
      idempotencyKey: "mixed:2",
    })
    const target = new IndexedDbEventLog({ factory: asFactory(new FakeIdbFactory()) })
    await target.open()
    await target.importSnapshot(new Blob([`${v1}\n${appendedCanonicalLine(v2, 2)}\n`]))

    expect((await target.readAllEnvelopes()).map((event) => event.seq)).toEqual([1, 2])
    const exported = await exportEnvelopeEventLogSnapshot(target)
    const parsed = (await exported.text()).trimEnd().split("\n").map((line) => JSON.parse(line))
    expect(parsed.map((event) => event.seq)).toEqual([1, 2])
    expect(parsed[1]).toEqual({ ...v2, seq: 2 })
  })

  it("rifiuta identità v2 duplicate nello snapshot prima della write e rigetta record v2 fisici malformati", async () => {
    const factory = new FakeIdbFactory()
    const target = new IndexedDbEventLog({ factory: asFactory(factory) })
    await target.open()
    const duplicate = canonicalEnvelope()
    const snapshot = new Blob([
      `${appendedCanonicalLine(duplicate, 1)}\n${appendedCanonicalLine(duplicate, 2)}\n`,
    ])
    const beforeWrites = factory.readwriteTransactionCount()
    await expect(target.importSnapshot(snapshot)).rejects.toThrow(/duplicat|eventId|idempotency/i)
    expect(factory.readwriteTransactionCount()).toBe(beforeWrites)
    expect(factory.snapshotRecords()).toEqual([])

    const corruptFactory = new FakeIdbFactory()
    corruptFactory.seed("lessonos-eventlog", "lessonos_events", "seq", [
      { seq: 1, schemaVersion: 2, eventId: "not-a-uuid" },
    ])
    const corrupt = new IndexedDbEventLog({ factory: asFactory(corruptFactory) })
    await corrupt.open()
    await expect(corrupt.readAllEnvelopes()).rejects.toThrow(/EventEnvelope v2/)
    await expect(corrupt.appendEnvelope(canonicalEnvelope())).rejects.toThrow(/EventEnvelope v2/)
    expect(corruptFactory.snapshotRecords()).toHaveLength(1)
  })

  it("rifiuta una riga v1 semanticamente malformata prima della transazione di import", async () => {
    const factory = new FakeIdbFactory()
    const log = new IndexedDbEventLog({ factory: asFactory(factory) })
    await log.open()
    const beforeWrites = factory.readwriteTransactionCount()
    const malformed = new Blob([
      `${JSON.stringify({
        kind: "concept.introduced",
        labels: { it: "Manca conceptId" },
        t: 1,
        evidence: ["manual:bad"],
        seq: 1,
      })}\n`,
    ])

    await expect(log.importSnapshot(malformed)).rejects.toThrow(/payload.*conceptId/i)
    expect(factory.readwriteTransactionCount()).toBe(beforeWrites)
    expect(factory.snapshotRecords()).toEqual([])
  })

  it("il fallback resta InMemoryEventLog ma implementa porta canonica e idempotenza", async () => {
    const fallback = await createEventLogStore({ factory: undefined })
    expect(fallback).toBeInstanceOf(InMemoryEventLog)
    const canonical = fallback as InMemoryEventLog & EnvelopeEventLogStore
    const envelope = canonicalEnvelope()
    const first = await canonical.appendEnvelope(envelope)
    const retry = await canonical.appendEnvelope(structuredClone(envelope))
    expect([first.appended, retry.appended]).toEqual([true, false])
    expect(first.event.seq).toBe(retry.event.seq)
    expect(await canonical.readEnvelopesByLesson(envelope.lessonId)).toEqual([first.event])
    const snapshot = await exportEnvelopeEventLogSnapshot(canonical)
    expect((JSON.parse((await snapshot.text()).trim()) as AppendedEventEnvelopeV2).seq).toBe(1)
  })
})
