// LessonOS — test IndexedDbEventLog (fase 1 spec EVENTLOG-PERSISTENCE-SPEC §3.1/§5).
// Il punto della slice: l'event-log SOPRAVVIVE al reload (close → riapri → stessi
// eventi, stesso grafo). jsdom non fornisce IndexedDB e fake-indexeddb non è tra
// le dipendenze: qui c'è un fake in-file del SOLO subset IDB usato dall'adapter
// (open/upgrade, transaction, objectStore, add, getAll, getAllKeys), con dati che
// persistono nel factory attraverso close/reopen — è ciò che serve per testare la
// sopravvivenza. La fedeltà piena a IDB reale (eventi, ordering) resta delegata a
// fake-indexeddb come devDep, proponibile quando #24 è su main.

import { describe, it, expect } from "vitest"
import { InMemoryEventLog, type LessonOsEvent } from "../lessonos/eventlog"
import { bootstrapLessonOs, eventLogMarkerKey, type MarkerStorageLike } from "../lessonos/bootstrap"
import { materialize } from "../lessonos/materializer"
import {
  IndexedDbEventLog,
  createEventLogStore,
  destroyEventLogStorage,
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
  constructor(
    private records: Map<number, StoredRecord>,
    private keyPath: string,
    private txn: FakeTransaction,
  ) {}

  add(value: StoredRecord): FakeRequest<number> {
    const req = new FakeRequest<number>()
    const key = value[this.keyPath]
    this.txn.pending += 1
    if (typeof key !== "number" || !Number.isInteger(key) || key <= 0) {
      req.settleError(`chiave non valida: ${String(key)}`)
      this.txn.opSettled(false)
    } else if (this.records.has(key)) {
      req.settleError(`chiave duplicata: ${key}`)
      this.txn.opSettled(false)
    } else {
      this.records.set(key, structuredClone(value))
      req.settleSuccess(key)
      this.txn.opSettled(true)
    }
    return req
  }

  getAll(): FakeRequest<StoredRecord[]> {
    const req = new FakeRequest<StoredRecord[]>()
    this.txn.pending += 1
    const keys = [...this.records.keys()].sort((a, b) => a - b)
    req.settleSuccess(keys.map((k) => structuredClone(this.records.get(k)!)))
    this.txn.opSettled(true)
    return req
  }

  getAllKeys(): FakeRequest<number[]> {
    const req = new FakeRequest<number[]>()
    this.txn.pending += 1
    req.settleSuccess([...this.records.keys()].sort((a, b) => a - b))
    this.txn.opSettled(true)
    return req
  }
}

class FakeTransaction {
  pending = 0
  private failed = false
  oncomplete: ((ev: unknown) => void) | null = null
  onabort: ((ev: unknown) => void) | null = null
  onerror: ((ev: unknown) => void) | null = null

  constructor(
    private db: FakeDatabase,
    private storeName: string,
  ) {
    // Il complete arriva dopo che tutte le richieste sincrone sono state accodate.
    queueMicrotask(() => {
      queueMicrotask(() => {
        if (!this.failed) this.oncomplete?.({ target: this })
      })
    })
  }

  objectStore(name: string): FakeObjectStore {
    if (name !== this.storeName) throw new DOMException(`store sconosciuto: ${name}`, "NotFoundError")
    return new FakeObjectStore(this.db.data(name), this.db.keyPathOf(name), this)
  }

  opSettled(ok: boolean) {
    this.pending -= 1
    if (!ok) {
      this.failed = true
      queueMicrotask(() => this.onerror?.({ target: this }))
    }
  }
}

class FakeDatabase {
  constructor(private backing: FakeBacking) {}
  objectStoreNames = {
    contains: (name: string) => this.backing.stores.has(name),
  }
  createObjectStore(name: string, opts: { keyPath: string }) {
    this.backing.stores.set(name, { keyPath: opts.keyPath, records: new Map() })
    return new FakeObjectStore(this.data(name), opts.keyPath, new FakeTransaction(this, name))
  }
  transaction(name: string, _mode: IDBTransactionMode): FakeTransaction {
    if (!this.backing.stores.has(name)) throw new DOMException(`store sconosciuto: ${name}`, "NotFoundError")
    return new FakeTransaction(this, name)
  }
  close() {}
  data(name: string): Map<number, StoredRecord> {
    return this.backing.stores.get(name)!.records
  }
  keyPathOf(name: string): string {
    return this.backing.stores.get(name)!.keyPath
  }
}

interface FakeBacking {
  stores: Map<string, { keyPath: string; records: Map<number, StoredRecord> }>
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
      backing = { stores: new Map() }
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
    const backing: FakeBacking = { stores: new Map() }
    const map = new Map<number, StoredRecord>()
    for (const r of records) map.set(r[keyPath] as number, structuredClone(r))
    backing.stores.set(storeName, { keyPath, records: map })
    this.databases.set(dbName, backing)
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
    await expect(log.importSnapshot(new Blob(["{}"]))).rejects.toThrow(/log vuoto/)
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
