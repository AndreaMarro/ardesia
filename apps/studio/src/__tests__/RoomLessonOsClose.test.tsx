// @vitest-environment jsdom
// Ultima azione Simulation → chiusura/navigazione → export: la navigazione
// non deve superare gli append accettati e l'export non deve mancarli.
// Percorso UI reale (harness DEV espone la stessa emitLessonEvent passata
// all'host dei tool), evento reale dal mapper puro, persistenza ritardata
// senza sostituire la produzione dell'evento. Solo sintetici.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { IDBFactory, IDBKeyRange } from "fake-indexeddb"
import JSZip from "jszip"

vi.mock("@excalidraw/excalidraw", () => {
  const FONT_FAMILY = { Nunito: 1 }
  return {
    FONT_FAMILY,
    Excalidraw: () => "mock-excalidraw",
    MainMenu: Object.assign(() => null, {
      DefaultItems: { ClearCanvas: () => null, SaveAsImage: () => null },
    }),
    WelcomeScreen: Object.assign(() => null, {
      Center: Object.assign(() => null, {
        Heading: () => null,
        Logo: () => null,
      }),
      Hints: { ToolbarHint: () => null, MenuHint: () => null, HelpHint: () => null },
    }),
    convertToExcalidrawElements: (v: unknown) => v,
    serializeAsJSON: () => "{}",
  }
})

vi.mock("../store/WorkspaceStore", async (importOriginal) => ({
  ...await importOriginal<typeof import("../store/WorkspaceStore")>(),
  workspaceStore: {},
}))

vi.mock("../store/AudioRecorder", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    AudioRecorder: () => ({
      start: () => Promise.resolve(),
      stop: () => {},
      dispose: () => {},
      recording: false,
      consent: false,
      lastRevoke: Promise.resolve(),
    }),
  }
})

vi.mock("../store/studentView", () => ({ isStudentView: () => false }))
vi.mock("../store/isRecapView", () => ({ isRecapView: () => false }))
vi.mock("../store/isReplayView", () => ({ isReplayView: () => false }))
vi.mock("../latexToImage", () => ({ latexToImage: () => Promise.resolve({ dataURL: "", width: 100, height: 50 }) }))
vi.mock("../loadFile", () => ({ imageToDataURL: () => {}, pdfToImages: () => Promise.resolve([]) }))
vi.mock("pdfjs-dist", () => ({}))
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({}))
vi.mock("../design/icons", () => ({ IconAlert: () => null, IconCheck: () => null, IconArrowUpRight: () => null }))
vi.mock("../MathComposer", () => ({ default: () => null }))
vi.mock("../RecapView", () => ({ default: () => null }))
vi.mock("../ReplayView", () => ({ default: () => null }))

import Room from "../Room"
import { openLessonOsSession, type LessonOsSessionHandle } from "../lessonos/bootstrap"
import { IndexedDbEventLog } from "../lessonos/indexedDbEventLog"
import { simulationSolveEvent } from "../lessonos/simulationSolveEvent"
import { roomPaths } from "../store/roomPaths"
import { exportLesson } from "../store/lessonBundle"
import type { WorkspaceDriver } from "../store/types"
import { JournalRecorder } from "../store/JournalRecorder"
import { WorkspaceStore } from "../store/WorkspaceStore"

const ROOM_A = "cls-room-a"
const ROOM_B = "cls-room-b"
const SESSION = "55555555-5555-4555-8555-555555555555"
const producer = { id: "test.cls.close", version: "1.0.0", commitSha: "e".repeat(40) }
let nextId = 0
const uuid = () => `00000000-0000-4000-8000-${(++nextId).toString(16).padStart(12, "0")}`

type Harness = {
  ready: boolean
  emitLessonEvent: (event: unknown) => void
  navigateToLesson: (target: string) => Promise<void>
}

function harness(): Harness {
  const h = (window as unknown as { __MAESTRO_TEST__?: Harness }).__MAESTRO_TEST__
  if (!h) throw new Error("Room test harness unavailable")
  return h
}

function memoryStore() {
  const bytes = new Map<string, ArrayBuffer>()
  const driver: WorkspaceDriver = {
    name: "synthetic-memory", available: () => true, init: async () => true,
    read: async (path) => bytes.has(path) ? new Blob([bytes.get(path)!]) : null,
    write: async (path, blob) => { bytes.set(path, await blob.arrayBuffer()) },
    delete: async (path) => { bytes.delete(path) },
    list: async (prefix) => [...bytes].filter(([p]) => !prefix || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data: new Blob([data]), mtime: 0 })),
  }
  // Exercise the canonical session writer against these same bytes, so the
  // lifecycle fixture satisfies the production archive contract as well.
  const canonical = new WorkspaceStore()
  ;(canonical as any).driver = driver
  return {
    mode: "localStorage",
    init: async () => "localStorage",
    registerActiveLesson: async (lessonId: string) => ({ lessonId, release: async () => {} }),
    createSessionOnce: canonical.createSessionOnce.bind(canonical),
    loadScene: async () => null,
    saveScene: async () => {},
    loadMeta: async () => null,
    saveMeta: async () => {},
    listRooms: async () => [],
    read: driver.read,
    write: driver.write,
    delete: driver.delete,
    list: driver.list,
  }
}

async function writeRoomFiles(store: ReturnType<typeof memoryStore>, room: string) {
  await store.write(roomPaths(room).scene, new Blob([JSON.stringify({ type: "excalidraw", elements: [] })]))
  await store.write(roomPaths(room).session, new Blob(["v: 1\ncreated: 0\naudioConsent: false\n"]))
  const recorder = new JournalRecorder({ store: store as never, journalPath: roomPaths(room).journal,
    identity: { lessonId: room, sessionId: SESSION, actor: { type: "teacher", id: "synthetic" } },
    producer, now: () => 1000, newEventId: uuid, withExclusiveLock: async (_name, work) => work(),
  })
  recorder.recordMathInsert("V = R I")
  await recorder.flush()
}

function solvedEvent() {
  const event = simulationSolveEvent({ experimentId: "synth-exp",
    outcome: { kind: "solved", currentMa: 14.9, bookLayoutValid: true }, t: 1000 })
  if (!event) throw new Error("synthetic solve must produce an event")
  return event
}

let factory: IDBFactory
let captured: LessonOsSessionHandle | null
let roots: Root[] = []

function trackRoot(root: Root): Root {
  roots.push(root)
  return root
}

function untrackRoot(root: Root): void {
  roots = roots.filter((candidate) => candidate !== root)
  root.unmount()
}

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
  const mem: Record<string, string> = {}
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => { mem[k] = v },
      removeItem: (k: string) => { delete mem[k] },
      clear: () => { for (const k in mem) delete mem[k] },
      get length() { return Object.keys(mem).length },
      key: (i: number) => Object.keys(mem)[i] ?? null,
    },
    writable: true,
    configurable: true,
  })
  vi.stubGlobal("IDBKeyRange", IDBKeyRange)
  factory = new IDBFactory()
  vi.stubGlobal("indexedDB", factory)
  captured = null
  roots = []
  delete (window as unknown as { __MAESTRO_TEST__?: unknown }).__MAESTRO_TEST__
  window.history.replaceState(null, "", `/#${ROOM_A}`)
})

afterEach(() => {
  for (const root of roots) root.unmount()
  roots = []
  delete (window as unknown as { __MAESTRO_TEST__?: unknown }).__MAESTRO_TEST__
  document.body.innerHTML = ""
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.history.replaceState(null, "", "/")
})

function opener() {
  return async (options: { room: string }) => {
    const handle = await openLessonOsSession({
      room: options.room, now: () => 1000, newSessionId: () => SESSION, newEventId: uuid,
    })
    captured = handle
    return handle
  }
}

async function renderRoom(store: ReturnType<typeof memoryStore>): Promise<Root> {
  const container = document.getElementById("root")!
  const root = trackRoot(createRoot(container))
  root.render(<Room store={store as never} lessonOsOpener={opener() as never} />)
  await vi.waitFor(() => expect(harness().ready).toBe(true), { timeout: 5000, interval: 25 })
  return root
}

async function freshReader() {
  const log = new IndexedDbEventLog({ factory })
  await log.open()
  return log
}

describe("Room LessonOS close boundary", () => {
  it("navigation waits for the delayed Simulation append and the export contains it exactly once", async () => {
    const store = memoryStore()
    await writeRoomFiles(store, ROOM_A)
    const root = await renderRoom(store)
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    const appendSpy = vi.spyOn(captured!.store, "append").mockImplementation(async (event) => {
      await gate
      return IndexedDbEventLog.prototype.append.call(captured!.store, event)
    })
    harness().emitLessonEvent(solvedEvent())
    await vi.waitFor(() => expect(appendSpy).toHaveBeenCalled(), { timeout: 2000, interval: 10 })
    const nav = harness().navigateToLesson(ROOM_B)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(window.location.hash).toBe(`#${ROOM_A}`)
    release()
    await nav
    expect(window.location.hash).toBe(`#${ROOM_B}`)
    untrackRoot(root)

    const reader = await freshReader()
    try {
      const own = await reader.readEnvelopesByLesson(ROOM_A)
      const solved = own.filter((e) => e.kind === "simulation.circuit.solved")
      expect(solved).toHaveLength(1)
      expect(JSON.stringify(solved[0])).toContain("synth-exp")
      const zip = await JSZip.loadAsync(await exportLesson(store as never, ROOM_A, reader))
      expect(await zip.file("raw/lessonos-events.jsonl")?.async("text")).toContain("synth-exp")
      expect(JSON.parse(await zip.file("manifest.json")!.async("text")).lessonId).toBe(ROOM_A)
    } finally {
      await reader.close()
    }
  })

  it("a rejected Simulation append cancels navigation visibly and retry succeeds", async () => {
    const store = memoryStore()
    await writeRoomFiles(store, ROOM_A)
    const root = await renderRoom(store)
    vi.spyOn(captured!.store, "append").mockRejectedValueOnce(new Error("write refused"))
    harness().emitLessonEvent(solvedEvent())
    await harness().navigateToLesson(ROOM_B)
    expect(window.location.hash).toBe(`#${ROOM_A}`)
    const container = document.getElementById("root")!
    await vi.waitFor(() => {
      expect(document.getElementById("root")!.textContent).toMatch(/annullato|non registrata/i)
    }, { timeout: 2000, interval: 25 })
    expect(container.textContent).toMatch(/annullato|non registrata/i)
    harness().emitLessonEvent(solvedEvent())
    await harness().navigateToLesson(ROOM_B)
    expect(window.location.hash).toBe(`#${ROOM_B}`)
    untrackRoot(root)
    const reader = await freshReader()
    try {
      const solved = (await reader.readEnvelopesByLesson(ROOM_A))
        .filter((e) => e.kind === "simulation.circuit.solved")
      expect(solved).toHaveLength(1)
    } finally {
      await reader.close()
    }
  })

  it("unmount drains the pending append before session close, in order", async () => {
    const store = memoryStore()
    await writeRoomFiles(store, ROOM_A)
    const root = await renderRoom(store)
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    vi.spyOn(captured!.store, "append").mockImplementation(async (event) => {
      await gate
      return IndexedDbEventLog.prototype.append.call(captured!.store, event)
    })
    const closeSpy = vi.spyOn(captured!, "close")
    harness().emitLessonEvent(solvedEvent())
    untrackRoot(root)
    release()
    await vi.waitFor(() => expect(closeSpy).toHaveBeenCalled(), { timeout: 3000, interval: 25 })
    const reader = await freshReader()
    try {
      const own = await reader.readEnvelopesByLesson(ROOM_A)
      const kinds = own.map((e) => e.kind)
      expect(kinds).toContain("simulation.circuit.solved")
      expect(kinds[kinds.length - 1]).toBe("lesson.ended")
      expect(kinds.indexOf("simulation.circuit.solved")).toBeLessThan(kinds.indexOf("lesson.ended"))
    } finally {
      await reader.close()
    }
  })

  it("keeps the foreign lesson out of the post-navigation bundle", async () => {
    const store = memoryStore()
    await writeRoomFiles(store, ROOM_A)
    const root = await renderRoom(store)
    await captured!.store.appendEnvelope({
      schemaVersion: 2, eventId: uuid(), lessonId: "cls-foreign", sessionId: SESSION,
      kind: "concept.introduced", occurredAt: new Date(1000).toISOString(),
      actor: { type: "teacher", id: "synthetic" },
      producer, causationId: null, idempotencyKey: null,
      evidence: [{ ref: "board:cls-foreign", resolution: "verified" }],
      payload: { conceptId: "FOREIGN", labels: { it: "FOREIGN" } },
    } as never)
    harness().emitLessonEvent(solvedEvent())
    await harness().navigateToLesson(ROOM_B)
    untrackRoot(root)
    const reader = await freshReader()
    try {
      const zip = await JSZip.loadAsync(await exportLesson(store as never, ROOM_A, reader))
      const text = await zip.file("raw/lessonos-events.jsonl")?.async("text")
      expect(text).toContain("synth-exp")
      expect(text).not.toContain("FOREIGN")
    } finally {
      await reader.close()
    }
  })
})
