// @vitest-environment jsdom
// MAESTRO-Studio — Test JournalRecorder + ReplayEngine
//
// JournalRecorder: eventi registrati con clock iniettato per determinismo.
// ReplayEngine: ricostruzione scena da journal, comparabile a board.excalidraw.
// NON tautologici: ogni test verifica una proprietà DISTINTA del sistema.

import { describe, it, expect, beforeEach, vi } from "vitest"
import type { JournalEvent } from "../store/JournalRecorder"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { ReplayEngine, serializeEvents, deserializeEvents } from "../store/ReplayEngine"
import * as JournalRecorderModule from "../store/JournalRecorder"
import * as ReplayEngineModule from "../store/ReplayEngine"
import { PATHS } from "../store/types"
import type { WorkspaceDriver, FileEntry } from "../store/types"
import { roomPaths } from "../store/roomPaths"
import {
  createEventEnvelopeV2,
  studioProducerIdentity,
  type JsonObject,
} from "../core/contracts/eventEnvelope"

// --- Mock driver (stesso pattern di WorkspaceStore.test.ts) ---

class MockDriver implements WorkspaceDriver {
  readonly name = "mock"
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
      entries.push({ path, data: new Blob([buf]), mtime: this.mtim.get(path) ?? 0 })
    }
    return entries
  }
}

function withMockDriver(store: WorkspaceStore, mock: MockDriver) {
  ;(store as any).driver = mock
}

// --- Helpers ---

function makeElement(id: string, version: number, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    type: "rectangle",
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    angle: 0,
    strokeColor: "#000",
    backgroundColor: "#fff",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    boundElements: null,
    updated: version,
    link: null,
    locked: false,
    version,
    versionNonce: version * 10,
    isDeleted: false,
    seed: version * 100,
    roundness: null,
    ...overrides,
  }
}

// Clock deterministico: conta le chiamate e restituisce timestamp progressivi
function makeClock() {
  let tick = 1000
  return () => {
    const t = tick
    tick += 100
    return t
  }
}

function makeIncrementingEventIdSource() {
  let index = 0
  return () => {
    index += 1
    return `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`
  }
}

// --- Tests ---

describe("JournalRecorder", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  let clock: () => number
  let recorder: JournalRecorder
  let journalPath: string

  beforeEach(() => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
    clock = makeClock()
    journalPath = roomPaths("roomA").journal
    recorder = new JournalRecorder({
      store,
      journalPath,
      identity: {
        lessonId: "roomA",
        sessionId: "11111111-1111-4111-8111-111111111111",
        actor: { type: "teacher", id: "founder-beta-teacher" },
      },
      producer: studioProducerIdentity(),
      now: clock,
      newEventId: makeIncrementingEventIdSource(),
      withExclusiveLock: async (_name, work) => work(),
    })
  })

  it("rifiuta il costruttore posizionale che scriverebbe nel journal flat", () => {
    expect(() => new (JournalRecorder as any)(store, clock)).toThrow(
      /options|canonical|journal|flat/i,
    )
  })

  it("recordChange rileva un element.add per nuovo elemento", () => {
    const el = makeElement("el1", 1)
    recorder.recordChange([el])
    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0].type).toBe("element.add")
    expect((buf[0] as any).element.id).toBe("el1")
    expect(buf[0].t).toBe(1000)
  })

  it("recordChange rileva un element.update quando version cresce", () => {
    const el1 = makeElement("el1", 1)
    recorder.recordChange([el1]) // add

    const el2 = makeElement("el1", 2)
    recorder.recordChange([el2]) // update

    const buf = recorder.getBuffer()
    // Primo buffer già schedulato ma non flushato — il secondo onChange accumula
    expect(buf).toHaveLength(2)
    expect(buf[0].type).toBe("element.add")
    expect(buf[1].type).toBe("element.update")
    expect((buf[1] as any).element.version).toBe(2)
  })

  it("recordChange NON registra update per stessa version (move/restyle)", () => {
    const el1 = makeElement("el1", 1)
    recorder.recordChange([el1]) // add
    const el2 = makeElement("el1", 1, { x: 50, y: 30 }) // move: same version
    recorder.recordChange([el2]) // no update

    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0].type).toBe("element.add")
  })

  it("recordChange rileva element.delete per elemento sparito dal set", () => {
    const el = makeElement("el1", 1)
    recorder.recordChange([el]) // add
    recorder.recordChange([]) // delete (sparito)

    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(2)
    expect(buf[1].type).toBe("element.delete")
    expect((buf[1] as any).elementId).toBe("el1")
  })

  it("recordChange rileva element.delete per isDeleted flag", () => {
    const el = makeElement("el1", 1)
    recorder.recordChange([el]) // add

    const deleted = makeElement("el1", 2, { isDeleted: true })
    recorder.recordChange([deleted]) // delete via flag

    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(2)
    expect(buf[1].type).toBe("element.delete")
    expect((buf[1] as any).elementId).toBe("el1")
  })

  it("recordPointerDown/Up produce t0 e t1 con debounce", () => {
    recorder.recordPointerDown()
    recorder.recordPointerDown() // debounce — ignorato
    recorder.recordPointerUp()

    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(2)
    expect(buf[0].type).toBe("t0")
    expect(buf[1].type).toBe("t1")
  })

  it("recordPointerUp senza down non produce evento", () => {
    recorder.recordPointerUp()
    expect(recorder.getBuffer()).toHaveLength(0)
  })

  it("recordMathInsert registra evento con latex", () => {
    recorder.recordMathInsert("E = mc^2")
    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0].type).toBe("math.insert")
    expect((buf[0] as any).latex).toBe("E = mc^2")
  })

  it("recordPdfPageView registra evento con pagina", () => {
    recorder.recordPdfPageView(3, 10)
    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0].type).toBe("pdf.page.view")
    expect((buf[0] as any).page).toBe(3)
    expect((buf[0] as any).totalPages).toBe(10)
  })

  it("flush scrive events.jsonl su store e svuota buffer", async () => {
    const el = makeElement("el1", 1)
    recorder.recordChange([el])
    await recorder.flush()

    const blob = await store.read(journalPath)
    expect(blob).not.toBeNull()
    const text = await blob!.text()
    expect(text).toContain('"kind":"journal.element.add"')
    expect(text).toContain("el1")
    expect(recorder.getBuffer()).toHaveLength(0)
  })

  it("flush multipli accumulano eventi (append di fatto)", async () => {
    const el1 = makeElement("el1", 1)
    recorder.recordChange([el1])
    await recorder.flush()

    const el2 = makeElement("el2", 1)
    // onChange include SEMPRE tutti gli elementi correnti, non solo i nuovi
    recorder.recordChange([el1, el2])
    await recorder.flush()

    const blob = await store.read(journalPath)
    const text = await blob!.text()
    const lines = text.trim().split("\n")
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain("el1")
    expect(lines[1]).toContain("el2")
  })

  it("seed previene falsi element.add per elementi esistenti", () => {
    const el = makeElement("el1", 1)
    recorder.seed([el])
    // Dopo seed, stesso elemento non viene registrato come add
    recorder.recordChange([el])
    expect(recorder.getBuffer()).toHaveLength(0)
  })

  it("seed permette update dopo caricamento scena", () => {
    const el1 = makeElement("el1", 1)
    recorder.seed([el1])
    const el2 = makeElement("el1", 2)
    recorder.recordChange([el2])
    const buf = recorder.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0].type).toBe("element.update")
  })

  it("flush serializzato gestisce chiamate sequenziali senza perdere eventi", async () => {
    recorder.recordChange([makeElement("el1", 1)])
    await recorder.flush()

    recorder.recordChange([makeElement("el1", 2)])
    await recorder.flush()

    const blob = await store.read(journalPath)
    const text = await blob!.text()
    const lines = text.trim().split("\n")
    // Due flush separati: primo ha add(el1), secondo ha update(el1)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain("element.add")
    expect(lines[1]).toContain("element.update")
  })

  // --- T2b punto 3: recovery della flush chain (write fallita NON avvelena _pendingFlush) ---

  it("write fallita NON avvelena la flush chain: eventi recuperati al flush successivo", async () => {
    recorder.recordMathInsert("E=mc^2")
    const writeSpy = vi.spyOn(store, "write").mockRejectedValueOnce(new Error("quota esaurita"))

    // Il caller vede l'errore (onestà), ma gli eventi NON sono persi
    await expect(recorder.flush()).rejects.toThrow("quota esaurita")
    expect(recorder.getBuffer()).toHaveLength(1)

    // La chain NON è avvelenata: il flush successivo scrive davvero
    await recorder.flush()
    expect(recorder.getBuffer()).toHaveLength(0)
    const blob = await store.read(journalPath)
    expect(blob).not.toBeNull()
    const text = await blob!.text()
    expect(text).toContain("E=mc^2")
    writeSpy.mockRestore()
  })

  it("recovery preserva l'ordine: il batch fallito precede gli eventi nuovi", async () => {
    recorder.recordMathInsert("primo")
    const writeSpy = vi.spyOn(store, "write").mockRejectedValueOnce(new Error("disk"))
    await expect(recorder.flush()).rejects.toThrow("disk")

    recorder.recordMathInsert("secondo")
    await recorder.flush()

    const text = await (await store.read(journalPath))!.text()
    const latex = text.trim().split("\n").map((line) => {
      const row = JSON.parse(line) as { payload: { latex: string } }
      return row.payload.latex
    })
    expect(latex).toEqual(["primo", "secondo"])
    writeSpy.mockRestore()
  })

  it("due write fallite di fila: la chain resta viva e il terzo flush recupera tutto", async () => {
    recorder.recordMathInsert("a")
    const writeSpy = vi
      .spyOn(store, "write")
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"))

    await expect(recorder.flush()).rejects.toThrow("fail-1")
    await expect(recorder.flush()).rejects.toThrow("fail-2")
    expect(recorder.getBuffer()).toHaveLength(1)

    await recorder.flush()
    expect(recorder.getBuffer()).toHaveLength(0)
    const text = await (await store.read(journalPath))!.text()
    expect(text).toContain('"a"')
    writeSpy.mockRestore()
  })
})

describe("ReplayEngine", () => {
  let engine: ReplayEngine

  beforeEach(() => {
    engine = new ReplayEngine()
  })

  it("replay di solo element.add restituisce elementi", () => {
    const events = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("a", 1) },
        { t: 1100, type: "element.add", element: makeElement("b", 1) },
      ]),
    )
    const result = engine.replay(events)
    expect(result).toHaveLength(2)
    const ids = result.map((e) => e.id)
    expect(ids).toContain("a")
    expect(ids).toContain("b")
  })

  it("replay di add→update restituisce versione finale", () => {
    const events = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("a", 1) },
        { t: 1100, type: "element.update", element: makeElement("a", 2, { x: 200 }) },
      ]),
    )
    const result = engine.replay(events)
    expect(result).toHaveLength(1)
    expect(result[0].x).toBe(200)
    expect(result[0].version).toBe(2)
  })

  it("replay di add→delete restituisce zero elementi", () => {
    const events = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("a", 1) },
        { t: 1100, type: "element.delete", elementId: "a" },
      ]),
    )
    const result = engine.replay(events)
    expect(result).toHaveLength(0)
  })

  it("t0/t1/math.insert/pdf.page.view non alterano stato elementi", () => {
    const events = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("a", 1) },
        { t: 1100, type: "t0" },
        { t: 1200, type: "element.update", element: makeElement("a", 2) },
        { t: 1300, type: "t1" },
        { t: 1400, type: "math.insert", latex: "x^2" },
      ]),
    )
    const result = engine.replay(events)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("a")
    expect(result[0].version).toBe(2)
  })

  it("replay di aggiornamenti multipli produce stato finale corretto", () => {
    // Ogni evento element.update contiene lo STATO COMPLETO dell'elemento a quella versione
    // (così come Excalidraw onChange lo passa — non solo delta)
    const events = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("a", 1) },
        { t: 1000, type: "element.add", element: makeElement("b", 1) },
        { t: 1100, type: "element.update", element: makeElement("a", 2, { width: 300 }) },
        { t: 1200, type: "element.delete", elementId: "b" },
        { t: 1300, type: "element.update", element: makeElement("a", 3, { width: 300, x: 99 }) },
      ]),
    )
    const result = engine.replay(events)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("a")
    expect(result[0].width).toBe(300)
    expect(result[0].x).toBe(99)
    expect(result[0].version).toBe(3)
  })

  it("replay deterministico stesso input = stesso output", () => {
    const events = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("x", 1) },
        { t: 2000, type: "element.add", element: makeElement("y", 1) },
      ]),
    )
    const r1 = engine.replay(events)
    engine.reset()
    const r2 = engine.replay(events)
    expect(r1).toEqual(r2)
  })

  it("ricostruzione da journal corrisponde a board.excalidraw iniziale", () => {
    // Simula: scena salvata = 3 elementi; journal registra la loro creazione.
    const elements = [
      makeElement("r1", 1, { type: "rectangle", x: 0, y: 0, width: 100, height: 50 }),
      makeElement("d1", 1, { type: "diamond", x: 200, y: 50, width: 80, height: 80 }),
      makeElement("t1", 1, { type: "text", x: 100, y: 200, width: 200, height: 30, text: "Ciao" }),
    ]

    const events = deserializeEvents(
      serializeEvents(
        elements.map((el) => ({ t: 1000, type: "element.add" as const, element: el })),
      ),
    )
    const result = engine.replay(events)

    // Lo stato replay deve avere esattamente 3 elementi con gli stessi id
    expect(result).toHaveLength(3)
    const ids = result.map((e) => e.id).sort()
    expect(ids).toEqual(["d1", "r1", "t1"])

    // Verifica che ogni elemento dal replay matchi l'originale
    for (const orig of elements) {
      const replayed = result.find((e) => e.id === orig.id)
      expect(replayed).toBeDefined()
      expect(replayed!.type).toBe(orig.type)
      expect(replayed!.version).toBe(orig.version)
    }
  })
})

describe("serializeEvents / deserializeEvents", () => {
  it("roundtrip produce eventi identici", () => {
    const events: JournalEvent[] = [
      { t: 1000, type: "element.add", element: makeElement("a", 1) },
      { t: 1100, type: "t0" },
    ]
    const text = serializeEvents(events)
    const parsed = deserializeEvents(text)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].t).toBe(1000)
    expect(parsed[0].type).toBe("element.add")
    expect(parsed[1].type).toBe("t0")
  })

  it("deserializeEvents salta righe vuote e malformate", () => {
    const text = '{"t":1,"type":"element.add","element":{"id":"a","version":1}}\n\nbad json\n{"t":2,"type":"t0"}\n'
    const parsed = deserializeEvents(text)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].type).toBe("element.add")
    expect(parsed[1].type).toBe("t0")
  })
})

// --- FB-4A RED: journal v2 room-scoped, lock-safe e replay misto ---

const FB4A_SESSION_A = "11111111-1111-4111-8111-111111111111"
const FB4A_SESSION_B = "22222222-2222-4222-8222-222222222222"
const FB4A_EVENT_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const FB4A_EVENT_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
const FB4A_EVENT_C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
const FB4A_PRODUCER = studioProducerIdentity()

type RuntimeJournalEnvelope = Readonly<{
  schemaVersion: 2
  eventId: string
  lessonId: string
  sessionId: string
  kind: string
  occurredAt: string
  actor: Readonly<{ type: string; id: string }>
  producer: typeof FB4A_PRODUCER
  causationId: string | null
  idempotencyKey: string | null
  evidence: readonly Readonly<{ ref: string; resolution: "verified" | "missing" }>[]
  payload: Readonly<Record<string, unknown>>
}>

type RuntimeJournalRecorder = JournalRecorder & {
  getEnvelopeBuffer(): readonly RuntimeJournalEnvelope[]
  recordPdfPageObserved(
    page: number,
    totalPages: number,
    document: { documentId?: string; documentName?: string },
    evidenceRef: string,
  ): void
}

type RuntimeDecodeResult = Readonly<{
  envelopes: readonly RuntimeJournalEnvelope[]
  legacy: readonly JournalEvent[]
  issues: readonly Readonly<{ source: string; line: number; reason: string }>[]
}>

function makeIdSource(ids: readonly string[]): () => string {
  let index = 0
  return () => {
    const id = ids[index]
    if (!id) throw new Error("test UUID source exhausted")
    index += 1
    return id
  }
}

function makeSharedExclusiveLock() {
  let tail = Promise.resolve()
  return async <T>(_name: string, work: () => Promise<T>): Promise<T> => {
    const run = tail.then(work)
    tail = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }
}

function makeV2Recorder(
  store: WorkspaceStore,
  overrides: Record<string, unknown> = {},
): RuntimeJournalRecorder {
  const options = {
    store,
    journalPath: roomPaths("roomA").journal,
    identity: {
      lessonId: "roomA",
      sessionId: FB4A_SESSION_A,
      actor: { type: "teacher", id: "founder-beta-teacher" },
    },
    producer: FB4A_PRODUCER,
    now: () => 1_700_000_000_000,
    newEventId: makeIdSource([FB4A_EVENT_A, FB4A_EVENT_B, FB4A_EVENT_C]),
    withExclusiveLock: makeSharedExclusiveLock(),
    ...overrides,
  }
  return new (JournalRecorder as unknown as { new(options: unknown): RuntimeJournalRecorder })(options)
}

function runtimeDecode(text: string, source: string): RuntimeDecodeResult {
  const decode = (ReplayEngineModule as unknown as {
    decodeJournalJsonl?: (value: string, sourcePath: string) => RuntimeDecodeResult
  }).decodeJournalJsonl
  expect(typeof decode).toBe("function")
  return decode!(text, source)
}

describe("FB-4A — JournalRecorder v2", () => {
  it("rifiuta path flat, foreign e hostile prima di qualunque I/O store", () => {
    const store = new WorkspaceStore()
    const read = vi.spyOn(store, "read")
    const write = vi.spyOn(store, "write")
    const construct = (journalPath: string, lessonId = "roomA") => () =>
      makeV2Recorder(store, {
        journalPath,
        identity: {
          lessonId,
          sessionId: FB4A_SESSION_A,
          actor: { type: "teacher", id: "founder-beta-teacher" },
        },
      })

    expect(construct(PATHS.JOURNAL)).toThrow(/journal|path|room/i)
    expect(construct(roomPaths("roomB").journal)).toThrow(/journal|path|room/i)
    expect(construct(roomPaths("unassigned").journal, "unassigned")).toThrow(
      /reserved|journal|room/i,
    )
    expect(construct("raw/../events.jsonl", "../")).toThrow(/journal|path|room/i)
    expect(read).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
  })

  it("minta al record un envelope completo, exact-SHA e ricorsivamente frozen", () => {
    const store = new WorkspaceStore()
    const recorder = makeV2Recorder(store)
    recorder.recordChange([makeElement("board-el", 1)])

    const envelope = recorder.getEnvelopeBuffer()[0]!
    expect(Object.keys(envelope).sort()).toEqual([
      "actor",
      "causationId",
      "eventId",
      "evidence",
      "idempotencyKey",
      "kind",
      "lessonId",
      "occurredAt",
      "payload",
      "producer",
      "schemaVersion",
      "sessionId",
    ])
    expect(envelope).toMatchObject({
      schemaVersion: 2,
      eventId: FB4A_EVENT_A,
      lessonId: "roomA",
      sessionId: FB4A_SESSION_A,
      kind: "journal.element.add",
      producer: FB4A_PRODUCER,
    })
    expect(envelope.evidence).toEqual([
      expect.objectContaining({ ref: expect.stringMatching(/^board:/), resolution: "verified" }),
    ])
    expect(Object.isFrozen(envelope)).toBe(true)
    expect(Object.isFrozen(envelope.payload)).toBe(true)
    expect(Object.isFrozen(envelope.evidence)).toBe(true)
    expect(Object.isFrozen(envelope.evidence[0])).toBe(true)
    expect(Object.isFrozen((envelope.payload as { element: object }).element)).toBe(true)
  })

  it("rifiuta payload non JSON al record senza accodare un envelope", () => {
    const store = new WorkspaceStore()
    const recorder = makeV2Recorder(store)
    const unsafe = makeElement("unsafe", 1, { x: Number.NaN })

    expect(() => recorder.recordChange([unsafe])).toThrow(/non-finite|JSON|payload/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(0)
  })

  it("aggiorna lo stato pointer solo dopo un enqueue riuscito", () => {
    const store = new WorkspaceStore()
    const downClock = vi.fn()
      .mockImplementationOnce(() => { throw new Error("clock down") })
      .mockReturnValue(1_700_000_000_000)
    const down = makeV2Recorder(store, { now: downClock })

    expect(() => down.recordPointerDown()).toThrow("clock down")
    expect(down.pointerDown).toBe(false)
    down.recordPointerDown()
    expect(down.pointerDown).toBe(true)
    expect(down.getEnvelopeBuffer().map((event) => event.kind)).toEqual(["journal.pointer.down"])

    const upClock = vi.fn()
      .mockReturnValueOnce(1_700_000_000_000)
      .mockImplementationOnce(() => { throw new Error("clock up") })
      .mockReturnValue(1_700_000_000_100)
    const up = makeV2Recorder(store, { now: upClock })
    up.recordPointerDown()
    expect(() => up.recordPointerUp()).toThrow("clock up")
    expect(up.pointerDown).toBe(true)
    up.recordPointerUp()
    expect(up.pointerDown).toBe(false)
    expect(up.getEnvelopeBuffer().map((event) => event.kind)).toEqual([
      "journal.pointer.down",
      "journal.pointer.up",
    ])
  })

  it("mantiene atomica una cattura multi-elemento se un payload è JSON-unsafe", () => {
    const store = new WorkspaceStore()
    const recorder = makeV2Recorder(store)
    const safe = makeElement("safe", 1)
    const unsafe = makeElement("unsafe", 1, { x: Number.NaN })

    expect(() => recorder.recordChange([safe, unsafe])).toThrow(/non-finite|JSON|payload/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(0)

    recorder.recordChange([safe])
    expect(recorder.getEnvelopeBuffer()).toHaveLength(1)
    expect(recorder.getEnvelopeBuffer()[0]).toMatchObject({
      eventId: FB4A_EVENT_C,
      kind: "journal.element.add",
      payload: { element: { id: "safe" } },
    })
  })

  it("distingue import PDF missing da osservazione esplicita verified e non canonizza audio", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const recorder = makeV2Recorder(store)

    recorder.recordPdfPageView(3, 10, { documentId: "manual-1", documentName: "Manuale.pdf" })
    recorder.recordPdfPageObserved(
      4,
      10,
      { documentId: "manual-1", documentName: "Manuale.pdf" },
      "pdf:manual-1#page=4",
    )
    const beforeInvalidObservation = recorder.getEnvelopeBuffer().length
    expect(() => recorder.recordPdfPageObserved(4, 10, {}, "board:pointer")).toThrow(
      /documentId|evidence|PDF/i,
    )
    expect(() => recorder.recordPdfPageObserved(
      4,
      10,
      { documentId: "manual-1" },
      "pdf:another-document#page=4",
    )).toThrow(/evidence|document|page/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(beforeInvalidObservation)
    const beforeAudio = recorder.getEnvelopeBuffer().length
    expect(() => recorder.recordAudioChunk(0, 100, 200)).toThrow(/audio|Founder Beta/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(beforeAudio)

    const [imported, observed] = recorder.getEnvelopeBuffer()
    expect(imported).toMatchObject({
      kind: "journal.pdf.imported",
      evidence: [{ ref: "pdf:manual-1#page=3", resolution: "missing" }],
    })
    expect(observed).toMatchObject({
      kind: "journal.pdf.page-observed",
      evidence: [{ ref: "pdf:manual-1#page=4", resolution: "verified" }],
    })
    await recorder.flush()
    const text = await (await store.read(roomPaths("roomA").journal))!.text()
    expect(text).not.toContain("journal.audio")
    expect(text).not.toContain('"audio.chunk"')
  })

  it("fallisce chiuso senza lock V2 e conserva lo stesso batch", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const rejectingLock = vi.fn(
      async (_name: string, _work: () => Promise<unknown>) => {
        throw new Error("exclusive lock unavailable")
      },
    )
    const recorder = makeV2Recorder(store, { withExclusiveLock: rejectingLock })
    recorder.recordMathInsert("E=mc^2")
    const before = recorder.getEnvelopeBuffer().map((event) => event.eventId)

    await expect(recorder.flush()).rejects.toThrow(/lock/i)
    expect(rejectingLock).toHaveBeenCalledWith(
      "ardesia:journal:roomA",
      expect.any(Function),
    )
    expect(recorder.getEnvelopeBuffer().map((event) => event.eventId)).toEqual(before)
    expect(await store.read(roomPaths("roomA").journal)).toBeNull()
  })

  it("serializza due recorder sotto lock condiviso senza perdita o duplicati", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const sharedLock = makeSharedExclusiveLock()
    const first = makeV2Recorder(store, {
      newEventId: makeIdSource([FB4A_EVENT_A]),
      withExclusiveLock: sharedLock,
    })
    const second = makeV2Recorder(store, {
      identity: {
        lessonId: "roomA",
        sessionId: FB4A_SESSION_B,
        actor: { type: "teacher", id: "founder-beta-teacher" },
      },
      newEventId: makeIdSource([FB4A_EVENT_B]),
      withExclusiveLock: sharedLock,
    })
    first.recordMathInsert("primo")
    second.recordMathInsert("secondo")

    await Promise.all([first.flush(), second.flush()])
    const text = await (await store.read(roomPaths("roomA").journal))!.text()
    const decoded = runtimeDecode(text, roomPaths("roomA").journal)
    expect(decoded.envelopes.map((event) => event.eventId).sort()).toEqual([
      FB4A_EVENT_A,
      FB4A_EVENT_B,
    ])
    expect(text.match(/"journal\.math\.insert"/g)).toHaveLength(2)
  })

  it("ripristina ordine e ID dopo write fallita senza avvelenare la chain", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const recorder = makeV2Recorder(store)
    recorder.recordMathInsert("primo")
    recorder.recordMathInsert("secondo")
    const before = recorder.getEnvelopeBuffer().map((event) => event.eventId)
    vi.spyOn(store, "write").mockRejectedValueOnce(new Error("quota"))

    await expect(recorder.flush()).rejects.toThrow("quota")
    expect(recorder.getEnvelopeBuffer().map((event) => event.eventId)).toEqual(before)
    await recorder.flush()

    const text = await (await store.read(roomPaths("roomA").journal))!.text()
    const decoded = runtimeDecode(text, roomPaths("roomA").journal)
    expect(decoded.envelopes.map((event) => event.eventId)).toEqual(before)
  })

  it("su read fallita reinserisce il batch prima degli eventi registrati dopo", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const recorder = makeV2Recorder(store)
    recorder.recordMathInsert("prima del read fallito")
    vi.spyOn(store, "read").mockRejectedValueOnce(new Error("read unavailable"))

    await expect(recorder.flush()).rejects.toThrow("read unavailable")
    recorder.recordMathInsert("dopo il read fallito")
    expect(recorder.getEnvelopeBuffer().map((event) => event.eventId)).toEqual([
      FB4A_EVENT_A,
      FB4A_EVENT_B,
    ])

    await recorder.flush()
    const text = await (await store.read(roomPaths("roomA").journal))!.text()
    expect(runtimeDecode(text, roomPaths("roomA").journal).envelopes.map((event) => event.eventId)).toEqual([
      FB4A_EVENT_A,
      FB4A_EVENT_B,
    ])
  })

  it("deduplica il retry se la write persiste ma rigetta e preserva il prefisso byte-esatto", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const path = roomPaths("roomA").journal
    const legacy = JSON.stringify({ t: 900, type: "t0" })
    const prefix = new Uint8Array([
      0xef,
      0xbb,
      0xbf,
      ...new TextEncoder().encode(legacy),
    ])
    await store.write(path, new Blob([prefix]))
    const recorder = makeV2Recorder(store, { newEventId: makeIdSource([FB4A_EVENT_A]) })
    recorder.recordMathInsert("retry-stabile")
    const originalWrite = store.write.bind(store)
    vi.spyOn(store, "write").mockImplementationOnce(async (writePath, data) => {
      await originalWrite(writePath, data)
      throw new Error("ack perso")
    })

    await expect(recorder.flush()).rejects.toThrow("ack perso")
    await recorder.flush()
    const persisted = new Uint8Array(await (await store.read(path))!.arrayBuffer())
    expect([...persisted.slice(0, prefix.length)]).toEqual([...prefix])
    expect(persisted[prefix.length]).toBe(0x0a)
    const text = new TextDecoder().decode(persisted)
    expect(text.match(new RegExp(`"eventId":"${FB4A_EVENT_A}"`, "g"))).toHaveLength(1)
  })

  it("rifiuta una collisione eventId con bytes diversi e conserva il batch conflittuale", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const first = makeV2Recorder(store, { newEventId: makeIdSource([FB4A_EVENT_A]) })
    first.recordMathInsert("originale")
    await first.flush()

    const second = makeV2Recorder(store, { newEventId: makeIdSource([FB4A_EVENT_A]) })
    second.recordMathInsert("conflitto")
    await expect(second.flush()).rejects.toThrow(/eventId|idempotency|conflict/i)
    expect(second.getEnvelopeBuffer()).toHaveLength(1)
    const text = await (await store.read(roomPaths("roomA").journal))!.text()
    expect(text).toContain("originale")
    expect(text).not.toContain("conflitto")
  })

  it("rifiuta il riuso della sola idempotency key con eventId diverso", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const path = roomPaths("roomA").journal
    const keyReservedForB = `journal:${FB4A_SESSION_A}:${FB4A_EVENT_B}`
    const stored = createEventEnvelopeV2(
      {
        lessonId: "roomA",
        sessionId: FB4A_SESSION_A,
        kind: "journal.math.insert",
        actor: { type: "teacher", id: "founder-beta-teacher" },
        producer: FB4A_PRODUCER,
        causationId: null,
        idempotencyKey: keyReservedForB,
        evidence: [{ ref: "journal:math-input", resolution: "verified" }],
        payload: { latex: "stored under the reserved key" },
      },
      { eventId: () => FB4A_EVENT_A, now: () => new Date(1_700_000_000_000) },
    )
    await store.write(path, new Blob([JSON.stringify(stored) + "\n"]))
    const recorder = makeV2Recorder(store, { newEventId: makeIdSource([FB4A_EVENT_B]) })
    recorder.recordMathInsert("conflicting key, different event")

    await expect(recorder.flush()).rejects.toThrow(/idempotency.*conflict/i)
    expect(recorder.getEnvelopeBuffer().map((event) => event.eventId)).toEqual([FB4A_EVENT_B])
    const persisted = await (await store.read(path))!.text()
    expect(persisted).toContain("stored under the reserved key")
    expect(persisted).not.toContain("conflicting key, different event")
  })

  it("blocca append su envelope fisico foreign o V2-looking malformato", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const path = roomPaths("roomA").journal
    const foreign = createEventEnvelopeV2(
      {
        lessonId: "roomB",
        sessionId: FB4A_SESSION_B,
        kind: "journal.math.insert",
        actor: { type: "teacher", id: "founder-beta-teacher" },
        producer: FB4A_PRODUCER,
        causationId: null,
        idempotencyKey: "journal:foreign",
        evidence: [{ ref: "journal:math-input", resolution: "verified" }],
        payload: { latex: "foreign" },
      },
      { eventId: () => FB4A_EVENT_B, now: () => new Date(1_700_000_000_000) },
    )
    await store.write(path, new Blob([JSON.stringify(foreign) + "\n"]))
    const recorder = makeV2Recorder(store, { newEventId: makeIdSource([FB4A_EVENT_A]) })
    recorder.recordMathInsert("local")
    await expect(recorder.flush()).rejects.toThrow(/lesson|source|mismatch/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(1)

    await store.write(path, new Blob([`{"eventId":"${FB4A_EVENT_C}"}\n`]))
    await expect(recorder.flush()).rejects.toThrow(/envelope|schemaVersion|missing/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(1)
  })

  it("rifiuta duplicati V2 già presenti fisicamente in replay e append", async () => {
    const source = roomPaths("roomA").journal
    const stored = createEventEnvelopeV2(
      {
        lessonId: "roomA",
        sessionId: FB4A_SESSION_A,
        kind: "journal.math.insert",
        actor: { type: "teacher", id: "founder-beta-teacher" },
        producer: FB4A_PRODUCER,
        causationId: null,
        idempotencyKey: "journal:stored:duplicate",
        evidence: [{ ref: "journal:math-input", resolution: "verified" }],
        payload: { latex: "duplicato fisico" },
      },
      { eventId: () => FB4A_EVENT_A, now: () => new Date(1_700_000_000_000) },
    )
    const duplicated = `${JSON.stringify(stored)}\n${JSON.stringify(stored)}\n`

    expect(() => runtimeDecode(duplicated, source)).toThrow(/duplicate|eventId|idempotency/i)

    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    await store.write(source, new Blob([duplicated]))
    const recorder = makeV2Recorder(store, { newEventId: makeIdSource([FB4A_EVENT_B]) })
    recorder.recordMathInsert("non accodare su storage corrotto")
    await expect(recorder.flush()).rejects.toThrow(/duplicate|eventId|idempotency/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(1)
  })
})

describe("FB-4A — codec e replay misto", () => {
  function makeCanonicalUpdateEnvelope() {
    return createEventEnvelopeV2(
      {
        lessonId: "roomA",
        sessionId: FB4A_SESSION_A,
        kind: "journal.element.update",
        actor: { type: "teacher", id: "founder-beta-teacher" },
        producer: FB4A_PRODUCER,
        causationId: null,
        idempotencyKey: "journal:test:update-a",
        evidence: [{ ref: "board:a", resolution: "verified" }],
        payload: { element: makeElement("a", 2, { x: 200 }) as JsonObject },
      },
      { eventId: () => FB4A_EVENT_B, now: () => new Date(1_700_000_000_100) },
    )
  }

  it("usa un solo resolver canonico per source flat, room e hostile", () => {
    const resolveSource = (JournalRecorderModule as unknown as {
      journalSourceLessonId?: (source: string) => string
    }).journalSourceLessonId
    expect(typeof resolveSource).toBe("function")
    expect(resolveSource!(PATHS.JOURNAL)).toBe("unassigned")
    expect(resolveSource!(roomPaths("roomA").journal)).toBe("roomA")
    expect(() => resolveSource!(roomPaths("unassigned").journal)).toThrow(/reserved|source|invalid/i)
    expect(() => resolveSource!("raw/../events.jsonl")).toThrow(/source|room|invalid/i)
  })

  it("proietta V1/V2 interleaved in ordine fisico e ricostruisce la scena attesa", () => {
    const v1AddA = JSON.stringify({ t: 1_700_000_000_000, type: "element.add", element: makeElement("a", 1) })
    const v2UpdateA = JSON.stringify(makeCanonicalUpdateEnvelope())
    const v1AddB = JSON.stringify({ t: 1_700_000_000_200, type: "element.add", element: makeElement("b", 1) })
    const decoded = runtimeDecode(
      `${v1AddA}\n${v2UpdateA}\n${v1AddB}\n`,
      roomPaths("roomA").journal,
    )

    expect(decoded.legacy.map((event) => event.type)).toEqual([
      "element.add",
      "element.update",
      "element.add",
    ])
    const scene = new ReplayEngine().replay([...decoded.legacy])
    expect(scene.map((element) => element.id)).toEqual(["a", "b"])
    expect(scene.find((element) => element.id === "a")?.x).toBe(200)
  })

  it("fa fallire visibilmente V2 malformato senza cast legacy", () => {
    const malformed = {
      ...makeCanonicalUpdateEnvelope(),
      payload: { unexpected: true },
    }
    const assertJournal = (JournalRecorderModule as unknown as {
      assertJournalEnvelopeV2?: (value: unknown) => void
    }).assertJournalEnvelopeV2
    expect(typeof assertJournal).toBe("function")
    expect(() => assertJournal!(malformed)).toThrow(/payload|element/i)
    expect(() => runtimeDecode(JSON.stringify(malformed), roomPaths("roomA").journal)).toThrow(
      /raw\/roomA\/events\.jsonl.*1|line.*1|payload/i,
    )
  })

  it("valida in modo esaustivo i payload di tutti i kind canonici", () => {
    const base = makeCanonicalUpdateEnvelope()
    const invalidCases: readonly [string, Record<string, unknown>][] = [
      ["journal.element.add", { element: {} }],
      ["journal.element.update", { element: {} }],
      ["journal.element.delete", { elementId: "" }],
      ["journal.pointer.down", { extra: true }],
      ["journal.pointer.up", { extra: true }],
      ["journal.math.insert", { latex: 42 }],
      ["journal.pdf.imported", { page: 0, totalPages: 1, documentId: null, documentName: null }],
      ["journal.pdf.page-observed", { page: 2, totalPages: 1, documentId: null, documentName: null }],
    ]
    const assertJournal = JournalRecorderModule.assertJournalEnvelopeV2

    for (const [kind, payload] of invalidCases) {
      expect(() => assertJournal({ ...base, kind, payload }), kind).toThrow(/payload|element|latex|page/i)
    }
  })

  it("valida la proof binding PDF anche sugli envelope fisici non prodotti dal writer", () => {
    const base = makeCanonicalUpdateEnvelope()
    const unbound = {
      ...base,
      kind: "journal.pdf.page-observed",
      evidence: [{ ref: "board:pointer", resolution: "verified" }],
      payload: { page: 4, totalPages: 10, documentId: null, documentName: "Manuale.pdf" },
    }
    const wrongDocument = {
      ...unbound,
      evidence: [{ ref: "pdf:other#page=4", resolution: "verified" }],
      payload: { ...unbound.payload, documentId: "manual-1" },
    }

    expect(() => JournalRecorderModule.assertJournalEnvelopeV2(unbound)).toThrow(
      /documentId|evidence|proof/i,
    )
    expect(() => runtimeDecode(
      JSON.stringify(wrongDocument),
      roomPaths("roomA").journal,
    )).toThrow(/document|evidence|proof|page/i)
  })

  it("rifiuta envelope V2 fisici nel journal flat legacy", () => {
    const physicalV2 = createEventEnvelopeV2(
      {
        lessonId: "unassigned",
        sessionId: FB4A_SESSION_A,
        kind: "journal.math.insert",
        actor: { type: "teacher", id: "founder-beta-teacher" },
        producer: FB4A_PRODUCER,
        causationId: null,
        idempotencyKey: "journal:flat:v2",
        evidence: [{ ref: "journal:math-input", resolution: "verified" }],
        payload: { latex: "ambiguous flat authority" },
      },
      { eventId: () => FB4A_EVENT_A, now: () => new Date(1_700_000_000_000) },
    )

    expect(() => runtimeDecode(JSON.stringify(physicalV2), PATHS.JOURNAL)).toThrow(
      /flat|legacy|physical|unassigned/i,
    )
  })

  it("rifiuta collisioni exactly-once tra legacy adattato e V2 fisico", () => {
    const source = roomPaths("roomA").journal
    const legacyRow = JSON.stringify({ t: 1_700_000_000_000, type: "math.insert", latex: "legacy" })
    const adapted = runtimeDecode(legacyRow, source).envelopes[0]!
    const adaptedAtLineTwo = runtimeDecode(`\n${legacyRow}`, source).envelopes[0]!

    expect(() => runtimeDecode(
      `${legacyRow}\n${JSON.stringify(adapted)}\n`,
      source,
    )).toThrow(/duplicate|eventId|idempotency/i)
    expect(() => runtimeDecode(
      `${JSON.stringify(adaptedAtLineTwo)}\n${legacyRow}\n`,
      source,
    )).toThrow(/duplicate|eventId|idempotency/i)
  })

  it("rifiuta source ostili anche se il journal è vuoto o contiene solo audio legacy", () => {
    expect(() => runtimeDecode("", "raw/../events.jsonl")).toThrow(/source|invalid/i)
    expect(() => runtimeDecode(
      JSON.stringify({ t: 1000, type: "audio.chunk", chunkIndex: 0, startEpoch: 900, endEpoch: 1000 }),
      "raw/../events.jsonl",
    )).toThrow(/source|invalid/i)
  })

  it("fallisce chiuso su V2 troncato o parziale invece di degradarlo a legacy", async () => {
    const source = roomPaths("roomA").journal
    const truncated = `{"schemaVersion":2,"eventId":"${FB4A_EVENT_A}"`
    const partial = JSON.stringify({
      kind: "journal.element.add",
      evidence: [],
      payload: { element: makeElement("partial", 1) },
    })

    expect(() => runtimeDecode(truncated, source)).toThrow(/line 1|trunc|JSON|V2|envelope/i)
    expect(() => runtimeDecode(partial, source)).toThrow(/line 1|schemaVersion|envelope/i)

    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    await store.write(source, new Blob([truncated + "\n"]))
    const recorder = makeV2Recorder(store, { newEventId: makeIdSource([FB4A_EVENT_B]) })
    recorder.recordMathInsert("non deve essere accodato")
    await expect(recorder.flush()).rejects.toThrow(/JSON|V2|envelope/i)
    expect(recorder.getEnvelopeBuffer()).toHaveLength(1)
  })

  it("salta e riporta legacy malformato ma mantiene la riga valida", () => {
    const valid = JSON.stringify({ t: 1000, type: "t0" })
    const decoded = runtimeDecode(`not-json\n{"t":"bad","type":"t1"}\n${valid}\n`, PATHS.JOURNAL)
    expect(decoded.legacy).toEqual([{ t: 1000, type: "t0" }])
    expect(decoded.issues).toHaveLength(2)
    expect(decoded.issues.map((issue) => issue.line)).toEqual([1, 2])
  })

  it("mantiene nel replay un legacy valido anche se il solo adapter V2 lo rifiuta", () => {
    const oversized = makeElement("oversized", 1, {
      points: Array.from({ length: 10_001 }, (_, index) => index),
    })
    const row = JSON.stringify({ t: 1_700_000_000_000, type: "element.add", element: oversized })
    const decoded = runtimeDecode(row, PATHS.JOURNAL)

    expect(decoded.legacy).toHaveLength(1)
    expect(decoded.legacy[0]).toMatchObject({ type: "element.add", element: { id: "oversized" } })
    expect(decoded.envelopes).toHaveLength(0)
    expect(decoded.issues).toEqual([
      expect.objectContaining({ line: 1, reason: expect.stringMatching(/budget|10.?000/i) }),
    ])
  })

  it("adatta legacy flat in modo deterministico, unassigned e sempre missing", () => {
    const row = JSON.stringify({
      t: 1_700_000_000_000,
      type: "element.add",
      element: makeElement("legacy", 1),
    })
    const first = runtimeDecode(row, PATHS.JOURNAL)
    const second = runtimeDecode(row, PATHS.JOURNAL)
    expect(first.envelopes).toEqual(second.envelopes)
    expect(first.envelopes[0]).toMatchObject({
      lessonId: "unassigned",
      sessionId: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
      evidence: [expect.objectContaining({ resolution: "missing" })],
    })
  })

  it("mantiene audio legacy nel replay metadata ma non lo promuove a envelope V2", () => {
    const audio = JSON.stringify({
      t: 1000,
      type: "audio.chunk",
      chunkIndex: 0,
      startEpoch: 900,
      endEpoch: 1000,
    })
    const decoded = runtimeDecode(audio, PATHS.JOURNAL)
    expect(decoded.legacy).toEqual([
      { t: 1000, type: "audio.chunk", chunkIndex: 0, startEpoch: 900, endEpoch: 1000 },
    ])
    expect(decoded.envelopes).toHaveLength(0)
  })
})
