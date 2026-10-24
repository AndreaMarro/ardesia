// @vitest-environment jsdom
// MAESTRO-Studio — Test ReplayView: player di replay (?vista=replay)
// Seam: mock Excalidraw come Room.integration.test.tsx — si asserisce sulla
// PROIEZIONE (element id passati a updateScene), non sui pixel.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createRoot } from "react-dom/client"
import { ReplayEngine } from "../store/ReplayEngine"
import { PATHS } from "../store/types"
import { roomPaths } from "../store/roomPaths"
import type { JournalEvent } from "../store/JournalRecorder"
import { hasEmoji } from "./emojiGuard"

// --- Mock Excalidraw (pattern Room.integration.test.tsx) ---

let capturedApi: { updateScene: ReturnType<typeof vi.fn> } | null = null
let capturedExcalidrawProps: any = null

vi.mock("@excalidraw/excalidraw", () => {
  return {
    Excalidraw: vi.fn((props: any) => {
      capturedExcalidrawProps = props
      if (props.excalidrawAPI) {
        setTimeout(() => {
          capturedApi = {
            updateScene: vi.fn(),
          }
          props.excalidrawAPI({
            ...capturedApi,
            getSceneElements: vi.fn(() => []),
            addFiles: vi.fn(),
            scrollToContent: vi.fn(),
          })
          document.body.setAttribute("data-mock-excalidraw-api", "1")
        }, 0)
      }
      return "mock-excalidraw"
    }),
    MainMenu: Object.assign(vi.fn(() => null), {
      DefaultItems: { ClearCanvas: vi.fn(() => null), SaveAsImage: vi.fn(() => null) },
    }),
    WelcomeScreen: Object.assign(vi.fn(() => null), {
      Center: Object.assign(vi.fn(() => null), {
        Heading: vi.fn(() => null),
        Logo: vi.fn(() => null),
      }),
      Hints: { ToolbarHint: vi.fn(() => null), MenuHint: vi.fn(() => null), HelpHint: vi.fn(() => null) },
    }),
    FONT_FAMILY: { Nunito: 6 },
    convertToExcalidrawElements: vi.fn((els: any) => els),
    serializeAsJSON: vi.fn(() => "{}"),
  }
})
vi.mock("@excalidraw/excalidraw/index.css", () => ({}))

// Mock per il mount di Room (dipendenze pesanti, come Room.integration.test.tsx)
vi.mock("../MathComposer", () => ({ default: () => "mock-math-composer" }))
vi.mock("../latexToImage", () => ({ latexToImage: vi.fn() }))
vi.mock("../loadFile", () => ({ imageToDataURL: vi.fn(), pdfToImages: vi.fn() }))
vi.mock("../store/studentView", () => ({ isStudentView: vi.fn(() => false) }))
vi.mock("../store/isReplayView", () => ({ isReplayView: vi.fn(() => false) }))

// --- Fixture journal ---

const el = (id: string) => ({ id, type: "freedraw" })

/** a@1000, b@2000, delete b@2500, c@3000 — scena varia lungo la timeline */
const JOURNAL_EVENTS: JournalEvent[] = [
  { t: 1000, type: "element.add", element: el("a") },
  { t: 2000, type: "element.add", element: el("b") },
  { t: 2500, type: "element.delete", elementId: "b" },
  { t: 3000, type: "element.add", element: el("c") },
]

const AUDIO_EVENTS: JournalEvent[] = [
  ...JOURNAL_EVENTS,
  { t: 3100, type: "audio.chunk", chunkIndex: 0, startEpoch: 1000, endEpoch: 31000 },
  { t: 33100, type: "audio.chunk", chunkIndex: 1, startEpoch: 31000, endEpoch: 61000 },
]

function journalBlob(events: JournalEvent[]): Blob {
  return new Blob([events.map((e) => JSON.stringify(e)).join("\n") + "\n"])
}

function makeMockStore(events: JournalEvent[] | null, room = "test-room") {
  const journal = events ? journalBlob(events) : null
  const paths = roomPaths(room)
  return {
    registerActiveLesson: vi.fn(async (lessonId: string) => {
      const completion = Promise.resolve()
      return { lessonId, release: () => completion }
    }),
    read: vi.fn(async (path: string) => {
      if (path === paths.journal) return journal
      if (path.startsWith(paths.audioDir)) return new Blob([new Uint8Array([1, 2, 3])])
      return null
    }),
    write: vi.fn(async (_path: string, _data: Blob) => {}),
    list: vi.fn(async () => []),
    loadMeta: vi.fn(async () => ({ v: 1, name: "Lezione di prova", createdAt: 1 })),
    loadScene: vi.fn(async () => null),
    saveScene: vi.fn(async () => {}),
    saveMeta: vi.fn(async () => {}),
    init: vi.fn(async () => {}),
    mode: "localStorage",
  }
}

describe("ReplayView", () => {
  let container: HTMLDivElement
  let mountedRoots: Array<ReturnType<typeof createRoot>>

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    mountedRoots = []
    capturedApi = null
    capturedExcalidrawProps = null
    document.body.removeAttribute("data-mock-excalidraw-api")
    // jsdom non implementa createObjectURL
    URL.createObjectURL = vi.fn(() => "blob:replay-test")
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    // Smonta i root: rimuovere il container dal DOM NON smonta React — il
    // caricamento audio del test precedente restava vivo e chiamava il mock
    // URL.createObjectURL del test successivo (conteggio 2 invece di 1).
    for (const root of mountedRoots) root.unmount()
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  async function renderReplayView(store: any) {
    const { default: ReplayView } = await import("../ReplayView")
    const root = createRoot(container)
    mountedRoots.push(root)
    root.render(<ReplayView store={store} room="test-room" />)
    // attesa fine caricamento: l'header renderizza subito, quindi il testo
    // deve essere NON vuoto e fuori dallo stato "caricamento…"
    await vi.waitFor(() => {
      const text = container.textContent ?? ""
      expect(text).not.toBe("")
      expect(text).not.toContain("caricamento")
    }, { timeout: 3000, interval: 10 })
    return root
  }

  /** Scrub della timeline al tempo t (setter nativo + evento input per React) */
  function scrubTo(t: number) {
    const range = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(range).not.toBeNull()
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
    setter.call(range, String(t))
    range.dispatchEvent(new Event("input", { bubbles: true }))
  }

  it("scrub a t proietta ESATTAMENTE getSceneAt(events, t) — stessi id, stesso ordine", async () => {
    const store = makeMockStore(JOURNAL_EVENTS)
    await renderReplayView(store)
    await vi.waitFor(() => expect(capturedApi).not.toBeNull())

    // attese LETTERALI calcolate a mano (non tautologiche): a t=2600 b è già
    // cancellato e c non è ancora nato; a t=3000 la delete di b resta efficace.
    const cases: Array<[number, string[]]> = [
      [2200, ["a", "b"]],
      [2600, ["a"]],
      [3000, ["a", "c"]],
    ]
    const engine = new ReplayEngine()
    for (const [t, expected] of cases) {
      scrubTo(t)
      await vi.waitFor(() => {
        const calls = capturedApi!.updateScene.mock.calls
        expect(calls.length).toBeGreaterThan(0)
        const last = calls.at(-1)![0]
        expect((last.elements as any[]).map((e) => e.id)).toEqual(expected)
      })
      // criterio §5: la proiezione coincide ESATTAMENTE con getSceneAt(events, t)
      expect(engine.getSceneAt(JOURNAL_EVENTS, t).map((e) => e.id)).toEqual(expected)
    }
  })

  it("uses the selected room journal even when unrelated flat legacy data exists", async () => {
    const store = makeMockStore(null)
    store.read.mockImplementation(async (path: string) => {
      if (path === roomPaths("test-room").journal) return journalBlob(JOURNAL_EVENTS)
      if (path === PATHS.JOURNAL) return journalBlob([
        { t: 9999, type: "element.add", element: el("unrelated-legacy") },
      ])
      return null
    })
    await renderReplayView(store)
    await vi.waitFor(() => {
      const range = container.querySelector('input[type="range"]') as HTMLInputElement
      expect(range.min).toBe("1000")
      expect(range.max).toBe("3000")
    })
    expect(store.read).toHaveBeenCalledWith(roomPaths("test-room").journal)
    expect(store.read).not.toHaveBeenCalledWith(PATHS.JOURNAL)
  })

  it("the native range can reach the final event when duration is not a multiple of 100 ms", async () => {
    const store = makeMockStore([
      { t: 1000, type: "t0" },
      { t: 1405, type: "element.add", element: el("final-stroke") },
    ])
    await renderReplayView(store)
    await vi.waitFor(() => expect(capturedApi).not.toBeNull())
    const range = container.querySelector('input[type="range"]') as HTMLInputElement
    // Native range stepping clamps to its greatest allowed value, just as End
    // does in Chromium. A coarse step would leave the final event unreachable.
    range.stepUp(1000)
    expect(range.valueAsNumber).toBe(1405)
    range.dispatchEvent(new Event("input", { bubbles: true }))
    await vi.waitFor(() => {
      const scene = capturedApi!.updateScene.mock.calls.at(-1)?.[0].elements as Array<{ id: string }>
      expect(scene.map((element) => element.id)).toEqual(["final-stroke"])
    })
  })

  it("room change hides the previous title and audio while the new journal is pending", async () => {
    const store = makeMockStore(AUDIO_EVENTS)
    let finishRead!: (blob: Blob | null) => void
    const pending = new Promise<Blob | null>((resolve) => { finishRead = resolve })
    const firstRead = store.read.getMockImplementation()!
    store.read.mockImplementation((path: string) => (
      path === roomPaths("room-b").journal ? pending : firstRead(path)
    ))
    store.loadMeta.mockImplementation(async () => ({ v: 1, name: "Prima lezione", createdAt: 1 }))
    const root = await renderReplayView(store)
    await vi.waitFor(() => expect(container.querySelector("audio")?.src).toBe("blob:replay-test"))

    const { default: ReplayView } = await import("../ReplayView")
    root.render(<ReplayView store={store as any} room="room-b" />)
    await vi.waitFor(() => expect(container.textContent).toContain("caricamento"))
    expect(container.textContent).not.toContain("Prima lezione")
    expect(container.querySelector("audio")).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:replay-test")

    finishRead(journalBlob([{ t: 5000, type: "element.add", element: el("only-b") }]))
    await vi.waitFor(() => {
      const range = container.querySelector('input[type="range"]') as HTMLInputElement
      expect(range.min).toBe("5000")
    })
    expect(container.querySelector("audio")).toBeNull()
  })

  it("a previous room read failure cannot hide a later room's valid journal", async () => {
    const store = makeMockStore(null)
    store.read.mockImplementation(async (path: string) => {
      if (path === roomPaths("test-room").journal) throw new Error("synthetic read failure")
      if (path === roomPaths("room-b").journal) return journalBlob(JOURNAL_EVENTS)
      return null
    })
    const root = await renderReplayView(store)
    expect(container.textContent).toContain("Registrazione non disponibile")
    const { default: ReplayView } = await import("../ReplayView")
    root.render(<ReplayView store={store as any} room="room-b" />)
    await vi.waitFor(() => {
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    })
    expect(container.textContent).not.toContain("synthetic read failure")
  })

  it("la timeline copre firstEventTime..lastEventTime", async () => {
    const store = makeMockStore(JOURNAL_EVENTS)
    await renderReplayView(store)
    const range = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(range).not.toBeNull()
    expect(range.min).toBe("1000")
    expect(range.max).toBe("3000")
  })

  it("initialData contiene la scena a firstEventTime (niente lavagna vuota al mount)", async () => {
    // Regressione trovata in smoke: initialData vuoto viene applicato DOPO la
    // prima updateScene e cancella la scena iniziale finché non si scrubba.
    const store = makeMockStore(JOURNAL_EVENTS)
    await renderReplayView(store)
    await vi.waitFor(() => expect(capturedExcalidrawProps).not.toBeNull())
    const engine = new ReplayEngine()
    const expected = engine.getSceneAt(JOURNAL_EVENTS, 1000).map((e) => e.id)
    expect((capturedExcalidrawProps.initialData.elements as any[]).map((e) => e.id)).toEqual(expected)
    expect(expected).toEqual(["a"])
  })

  it("Excalidraw è montato in sola lettura (viewModeEnabled)", async () => {
    const store = makeMockStore(JOURNAL_EVENTS)
    await renderReplayView(store)
    await vi.waitFor(() => expect(capturedExcalidrawProps).not.toBeNull())
    expect(capturedExcalidrawProps.viewModeEnabled).toBe(true)
  })

  it("lezione senza audio: timeline visuale presente, nessun <audio>, nessun crash", async () => {
    const store = makeMockStore(JOURNAL_EVENTS)
    await renderReplayView(store)
    expect(container.querySelector('input[type="range"]')).not.toBeNull()
    expect(container.querySelector("audio")).toBeNull()
    expect(hasEmoji(container.textContent ?? "")).toBe(false)
  })

  it("lezione con chunk audio: <audio> presente", async () => {
    const store = makeMockStore(AUDIO_EVENTS)
    await renderReplayView(store)
    await vi.waitFor(() => {
      expect(container.querySelector("audio")).not.toBeNull()
    })
  })

  /** Rende la vista con audio e attende la sorgente audio pronta */
  async function renderWithLoadedAudio() {
    const store = makeMockStore(AUDIO_EVENTS)
    await renderReplayView(store)
    const audio = await vi.waitFor(() => {
      const a = container.querySelector("audio") as HTMLAudioElement
      expect(a).not.toBeNull()
      return a
    })
    await vi.waitFor(() => expect(audio.src).not.toBe(""))
    return { store, audio }
  }

  it("concatena TUTTI i chunk in un'unica sorgente (i chunk N>0 non sono decodificabili da soli)", async () => {
    // MediaRecorder con timeslice: solo chunk-0 contiene l'init segment WebM.
    // La sorgente audio deve essere la concatenazione ordinata di tutti i chunk.
    const { store } = await renderWithLoadedAudio()
    expect(store.read).toHaveBeenCalledWith(`${roomPaths("test-room").audioDir}chunk-0.webm`)
    expect(store.read).toHaveBeenCalledWith(`${roomPaths("test-room").audioDir}chunk-1.webm`)
    // un solo object URL creato per l'audio (blob unico), non uno per chunk
    const urlCalls = vi.mocked(URL.createObjectURL).mock.calls.length
    expect(urlCalls).toBe(1)
  })

  it("l'audio che avanza muove il cursore journal (audio→t via startEpoch del primo chunk)", async () => {
    const { audio } = await renderWithLoadedAudio()
    Object.defineProperty(audio, "paused", { value: false, configurable: true })
    Object.defineProperty(audio, "currentTime", { value: 5, configurable: true, writable: true })
    audio.dispatchEvent(new Event("timeupdate"))
    // t atteso = startEpoch chunk0 (1000) + 5s = 6000
    await vi.waitFor(() => {
      const range = container.querySelector('input[type="range"]') as HTMLInputElement
      expect(range.value).toBe("6000")
    })
    expect(container.textContent).toContain("0:05")
  })

  it("scrub prima dei metadata: il seek è applicato a loadedmetadata (non perso)", async () => {
    const { audio } = await renderWithLoadedAudio()
    let stored = 0
    Object.defineProperty(audio, "currentTime", {
      configurable: true,
      get: () => stored,
      set: (v: number) => { stored = v },
    })
    // jsdom: readyState resta 0 → il seek va in pending
    scrubTo(7000)
    audio.dispatchEvent(new Event("loadedmetadata"))
    // (7000 - startEpoch 1000) / 1000 = 6s
    expect(stored).toBe(6)
  })

  it("lezione senza journal: stato vuoto, nessun crash", async () => {
    const store = makeMockStore(null)
    await renderReplayView(store)
    expect(container.querySelector('input[type="range"]')).toBeNull()
    expect(container.textContent).toMatch(/nessun|vuota/i)
  })

  it("il replay NON scrive mai sullo store (vista sola lettura)", async () => {
    const store = makeMockStore(JOURNAL_EVENTS)
    await renderReplayView(store)
    await vi.waitFor(() => expect(capturedApi).not.toBeNull())
    scrubTo(2600)
    await new Promise((r) => setTimeout(r, 50))
    expect(store.write).not.toHaveBeenCalled()
    expect(store.saveScene).not.toHaveBeenCalled()
  })
})

describe("Room in ?vista=replay", () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    globalThis.location.hash = "#replay-room-1"
    URL.createObjectURL = vi.fn(() => "blob:replay-test")
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it("non istanzia JournalRecorder né AudioRecorder e non scrive sul journal", async () => {
    const { isReplayView } = await import("../store/isReplayView")
    vi.mocked(isReplayView).mockReturnValue(true)

    const store = makeMockStore(JOURNAL_EVENTS, "replay-room-1")
    const { default: Room } = await import("../Room")
    const root = createRoot(container)
    root.render(<Room store={store as any} />)

    await vi.waitFor(() => {
      expect((window as any).__MAESTRO_TEST__?.ready).toBe(true)
    }, { timeout: 5000, interval: 10 })

    const harness = (window as any).__MAESTRO_TEST__
    expect(harness.recorder).toBeNull()
    expect(harness.audioRecorder).toBeNull()
    // zero write sul journal durante il replay
    const journalWrites = store.write.mock.calls.filter(([p]) => p === roomPaths("replay-room-1").journal)
    expect(journalWrites).toHaveLength(0)
    // la vista replay è renderizzata (timeline presente dopo il load)
    await vi.waitFor(() => {
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    })
    root.unmount()
  })
})
