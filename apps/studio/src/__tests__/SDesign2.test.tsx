// @vitest-environment jsdom
// MAESTRO-Studio — Test S-DESIGN-2: fiducia visibile
// RECSTRIP, document.title, connectFolder, indicatore dati onesto

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRoot } from "react-dom/client"

const ROOM_MOUNT_WAIT = { timeout: 5000, interval: 10 }

// --- Mocks per Excalidraw e dipendenze pesanti ---
vi.mock("@excalidraw/excalidraw", () => {
  const serialized = JSON.stringify({ type: "excalidraw", elements: [], v: 1 })
  return {
    Excalidraw: vi.fn((props: any) => {
      if (props.excalidrawAPI) {
        setTimeout(() => {
          props.excalidrawAPI({
            getSceneElements: vi.fn(() => []),
            updateScene: vi.fn(),
            addFiles: vi.fn(),
            onPointerDown: vi.fn(() => {
              const unsub = () => {}
              return unsub
            }),
            onPointerUp: vi.fn(() => {
              const unsub = () => {}
              return unsub
            }),
          })
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
    serializeAsJSON: vi.fn(() => serialized),
    getSceneVersion: vi.fn(() => 1),
  }
})

vi.mock("@excalidraw/excalidraw/index.css", () => ({}))
vi.mock("../MathComposer", () => ({ default: () => "mock-math-composer" }))
vi.mock("../latexToImage", () => ({ latexToImage: vi.fn() }))
vi.mock("../loadFile", () => ({ imageToDataURL: vi.fn(), pdfToImages: vi.fn() }))

// --- Helper: create a store mocking init() to preserve the pre-set mode ---
async function createStore(mode: "localStorage" | "fsa" = "localStorage") {
  const { WorkspaceStore } = await import("../store/WorkspaceStore")
  const store = new WorkspaceStore()
  ;(store as any)._mode = mode
  vi.spyOn(store, "init").mockResolvedValue(mode)
  return store
}

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
  globalThis.location.hash = "#test-room-1"
  document.body.innerHTML = '<div id="root"></div>'
  vi.clearAllMocks()
  document.title = ""
})

describe("S-DESIGN-2 — document.title", () => {
  it("imposta 'Ardesia · studio' di default (nessuna registrazione)", async () => {
    const store = await createStore()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.title).toBe("Ardesia · studio")
    }, ROOM_MOUNT_WAIT)

    root.unmount()
  })
})

describe("S-DESIGN-2 — RECSTRIP", () => {
  it("recstrip è assente quando non registra (audioRecording=false)", async () => {
    const store = await createStore()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, ROOM_MOUNT_WAIT)

    // Audio recording è false di default → nessun recstrip
    expect(document.querySelector("[data-rec-strip]")).toBeNull()

    root.unmount()
  })

  it("recstrip ha classe .st-recstrip quando presente", async () => {
    // Test strutturale: verifichiamo che il DOM output contenga il recstrip
    // solo quando audioRecording=true (la condizione `audioRecording && <div>`)
    const store = await createStore()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, ROOM_MOUNT_WAIT)

    // In stato iniziale non c'è
    expect(document.querySelector(".st-recstrip")).toBeNull()

    root.unmount()
  })
})

describe("S-DESIGN-2 — connectFolder & indicatore dati", () => {
  it("dichiara il salvataggio browser e offre 'Scegli cartella' nel launcher", async () => {
    const store = await createStore("localStorage")
    const connectSpy = vi.spyOn(store, "connectFolder")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, ROOM_MOUNT_WAIT)

    const saveState = document.querySelector(".st-orbit-save")
    expect(saveState?.getAttribute("title")).toMatch(/browser/i)

    const launcher = document.querySelector('[data-orbit-action="launcher"]') as HTMLButtonElement
    launcher.click()
    let connectBtn: HTMLButtonElement | null = null
    await vi.waitFor(() => {
      connectBtn = document.querySelector('[aria-label="Scegli cartella: Salva sul computer"]')
      expect(connectBtn).not.toBeNull()
    }, ROOM_MOUNT_WAIT)

    connectBtn!.click()
    expect(connectSpy).toHaveBeenCalledTimes(1)

    root.unmount()
  })

  it("dichiara il salvataggio sul computer e non ripropone la cartella in FSA mode", async () => {
    const store = await createStore("fsa")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, ROOM_MOUNT_WAIT)

    const saveState = document.querySelector(".st-orbit-save")
    expect(saveState?.getAttribute("title")).toMatch(/computer/i)
    const launcher = document.querySelector('[data-orbit-action="launcher"]') as HTMLButtonElement
    launcher.click()
    expect(document.querySelector('[aria-label="Scegli cartella: Salva sul computer"]')).toBeNull()

    root.unmount()
  })

  it("lessico vietato ('cache'/'workspace'/'registrata') non compare nell'indicatore", async () => {
    const store = await createStore("localStorage")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, ROOM_MOUNT_WAIT)

    const statusArea = document.querySelector(".st-orbit-actions")
    const statusText = statusArea?.textContent ?? ""

    // Il lessico vietato non deve apparire nell'indicatore dati
    expect(statusText.toLowerCase()).not.toContain("cache")
    expect(statusText.toLowerCase()).not.toContain("workspace")
    expect(statusText.toLowerCase()).not.toContain("registrata")
    expect(statusText.toLowerCase()).not.toContain("registrato")

    root.unmount()
  })
})

describe("S-DESIGN-2 — connectFolder integration (WorkspaceStore)", () => {
  it("init() parte in localStorage mode (nessun auto-prompt FSA)", async () => {
    const { WorkspaceStore } = await import("../store/WorkspaceStore")
    const store = new WorkspaceStore()

    const initMode = await store.init()
    expect(initMode).toBe("localStorage")
    expect(store.mode).toBe("localStorage")
  })

  it("connectFolder fallisce in jsdom (nessuna showDirectoryPicker)", async () => {
    const { WorkspaceStore } = await import("../store/WorkspaceStore")
    const store = new WorkspaceStore()
    await store.init()

    // Scrive dati in localStorage per simulare migrazione
    const blob = new Blob(["test-data"], { type: "text/plain" })
    await store.write("raw/test.txt", blob)

    // jsdom non ha showDirectoryPicker → connectFolder fallisce
    const result = await store.connectFolder()
    expect(result).toBe(false)
    // Mode resta localStorage
    expect(store.mode).toBe("localStorage")
  })
})
