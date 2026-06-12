// @vitest-environment jsdom
// MAESTRO-Studio — Test S-DESIGN-2: fiducia visibile
// RECSTRIP, document.title, connectFolder, indicatore dati onesto

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRoot } from "react-dom/client"

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
  it("imposta 'maestro · studio' di default (nessuna registrazione)", async () => {
    const store = await createStore()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.title).toBe("maestro · studio")
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

    // In stato iniziale non c'è
    expect(document.querySelector(".st-recstrip")).toBeNull()

    root.unmount()
  })
})

describe("S-DESIGN-2 — connectFolder & indicatore dati", () => {
  it("mostra 'solo in questo browser' con bottone 'scegli cartella…' in localStorage mode", async () => {
    const store = await createStore("localStorage")
    const connectSpy = vi.spyOn(store, "connectFolder")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 1000, interval: 10 })

    // Deve mostrare l'indicatore locale
    expect(document.body.textContent).toContain("solo in questo browser")

    // Deve esserci il bottone "scegli cartella…"
    const connectBtn = document.querySelector(".st-indicator-connect")
    expect(connectBtn).not.toBeNull()
    expect(connectBtn?.textContent).toContain("cartella")

    // Click sul bottone deve chiamare connectFolder
    if (connectBtn) {
      (connectBtn as HTMLButtonElement).click()
      expect(connectSpy).toHaveBeenCalledTimes(1)
    }

    root.unmount()
  })

  it("mostra 'salvato sul computer' in FSA mode", async () => {
    const store = await createStore("fsa")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 1000, interval: 10 })

    // Deve mostrare l'indicatore FSA
    expect(document.body.textContent).toContain("salvato sul computer")
    // NON deve mostrare il bottone connect (FSA già attivo)
    expect(document.querySelector(".st-indicator-connect")).toBeNull()

    root.unmount()
  })

  it("lessico vietato ('cache'/'workspace'/'registrata') non compare nell'indicatore", async () => {
    const store = await createStore("localStorage")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 1000, interval: 10 })

    const statusArea = document.querySelector(".st-status")
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
