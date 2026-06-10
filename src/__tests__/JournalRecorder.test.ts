// @vitest-environment jsdom
// MAESTRO-Studio — Test JournalRecorder + ReplayEngine
//
// JournalRecorder: eventi registrati con clock iniettato per determinismo.
// ReplayEngine: ricostruzione scena da journal, comparabile a board.excalidraw.
// NON tautologici: ogni test verifica una proprietà DISTINTA del sistema.

import { describe, it, expect, beforeEach } from "vitest"
import type { JournalEvent } from "../store/JournalRecorder"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { ReplayEngine, serializeEvents, deserializeEvents } from "../store/ReplayEngine"
import { PATHS } from "../store/types"
import type { WorkspaceDriver, FileEntry } from "../store/types"

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

// --- Tests ---

describe("JournalRecorder", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  let clock: () => number
  let recorder: JournalRecorder

  beforeEach(() => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
    clock = makeClock()
    recorder = new JournalRecorder(store, clock)
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

    const blob = await store.read(PATHS.JOURNAL)
    expect(blob).not.toBeNull()
    const text = await blob!.text()
    expect(text).toContain('"element.add"')
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

    const blob = await store.read(PATHS.JOURNAL)
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

    const blob = await store.read(PATHS.JOURNAL)
    const text = await blob!.text()
    const lines = text.trim().split("\n")
    // Due flush separati: primo ha add(el1), secondo ha update(el1)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain("element.add")
    expect(lines[1]).toContain("element.update")
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
