// @vitest-environment jsdom
// MAESTRO-Studio — Test integrazione Room.tsx ↔ WorkspaceStore
// Verifica che Room persista e carichi correttamente via WorkspaceStore,
// e che gli errori di quota siano visibili all'utente.

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRoot } from "react-dom/client"
import { act, Component, type ReactNode } from "react"
import { PATHS, type WorkspaceDriver, type FileEntry } from "../store/types"
import { hasEmoji } from "./emojiGuard"
import { createMultiPostitWorkbenchPostits } from "../design/multiPostitWorkbenchModel"
import { createPluginPostitBoardScene } from "../design/multiPostitBoardPersistence"
import { exportLesson } from "../store/lessonBundle"
import {
  openLessonOsSession,
  type LessonOsSessionHandle,
  type LessonOsSessionOpener,
} from "../lessonos/bootstrap"
import { studioProducerIdentity } from "../core/contracts/eventEnvelope"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import { roomPaths } from "../store/roomPaths"
import { FOUNDER_BETA_PLUGINS } from "../toolhost/founderBetaPlugin"
import { REFERENCE_SIM_TOOL_ID } from "../toolhost/ToolCanvasEmbeddable"

// --- Mocks per Excalidraw e dipendenze pesanti ---

const mockExcalidrawHarness = vi.hoisted(() => ({
  updateSceneCalls: [] as Array<{ elements?: Array<{ id?: string }> }>,
}))

vi.mock("@excalidraw/excalidraw", () => {
  let serialized = JSON.stringify({ type: "excalidraw", elements: [], v: 1 })
  return {
    Excalidraw: vi.fn((props: any) => {
      if (props.excalidrawAPI) {
        setTimeout(() => {
          const unsubs: Array<() => void> = []
          props.excalidrawAPI({
            getSceneElements: vi.fn(() => []),
            updateScene: vi.fn((scene: { elements?: Array<{ id?: string }> }) => {
              mockExcalidrawHarness.updateSceneCalls.push(scene)
            }),
            addFiles: vi.fn(),
            onPointerDown: vi.fn(() => {
              const unsub = () => {}
              unsubs.push(unsub)
              return unsub
            }),
            onPointerUp: vi.fn(() => {
              const unsub = () => {}
              unsubs.push(unsub)
              return unsub
            }),
          })
          // Segnale DOM-osservabile: l'API è stata consegnata (Room.apiRef è settato).
          // Room non produce alcun segnale DOM quando excalidrawAPI viene chiamato,
          // quindi i test che dipendono da apiRef devono aspettare QUESTO attributo,
          // non il testo "mock-excalidraw" (che appare al render, PRIMA di questo timer).
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
    serializeAsJSON: vi.fn(() => serialized),
    getSceneVersion: vi.fn(() => 1),
  }
})

vi.mock("@excalidraw/excalidraw/index.css", () => ({}))
// Cattura onInsert per esercitare Room.insertMath (il composer vero e' pesante).
let capturedOnInsert: ((latex: string) => void) | null = null
vi.mock("../MathComposer", () => ({
  default: (props: { onInsert: (latex: string) => void }) => {
    capturedOnInsert = props.onInsert
    return "mock-math-composer"
  },
}))
vi.mock("../latexToImage", () => ({ latexToImage: vi.fn() }))
vi.mock("../loadFile", () => ({ imageToDataURL: vi.fn(), pdfToImages: vi.fn() }))
vi.mock("../store/studentView", () => ({ isStudentView: vi.fn(() => false) }))
vi.mock("../store/isRecapView", () => ({ isRecapView: vi.fn(() => false) }))
vi.mock("../store/isReplayView", () => ({ isReplayView: vi.fn(() => false) }))
// LessonOS bridge: nei test il registry di default riconosce il manuale di prova
// (in prod defaultManualRegistry è vuoto finché non esiste una config manuali).
vi.mock("../lessonos/manualRegistry", async (importOriginal) => {
  const mod = (await importOriginal()) as typeof import("../lessonos/manualRegistry")
  return {
    ...mod,
    defaultManualRegistry: mod.staticManualRegistry({
      "document:sha256:abc123": { manualId: "manual:vol1", title: "ELAB Volume 1", pages: [1, 40] },
    }),
  }
})

// --- Mock driver (supporta anche metodi legacy) ---

let legacySceneStore: Record<string, string> = {}

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

  /** Legacy localStorage cache (richiesto da WorkspaceStore.saveScene/loadScene) */
  getLegacyScene(room: string): string | null {
    return legacySceneStore[room] ?? null
  }

  setLegacyScene(room: string, data: string): void {
    legacySceneStore[room] = data
  }
}

/** Crea un WorkspaceStore con un MockDriver iniettabile */
async function createMockStore() {
  const { WorkspaceStore } = await import("../store/WorkspaceStore")
  const store = new WorkspaceStore()
  const driver = new MockDriver()
  ;(store as any).driver = driver
  ;(store as any).fallback = driver
  ;(store as any)._mode = "localStorage"
  return { store, driver }
}

// Stub localStorage per jsdom
let storage: Record<string, string> = {}
beforeEach(() => {
  legacySceneStore = {}
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
  let lockTail = Promise.resolve()
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: vi.fn((name: string, options: { mode: LockMode }, callback: (lock: Lock) => unknown) => {
        const run = lockTail.then(() => callback({ name, mode: options.mode } as Lock))
        lockTail = run.then(
          () => undefined,
          () => undefined,
        )
        return run
      }),
    },
  })
  document.body.innerHTML = '<div id="root"></div>'
  delete (window as any).__MAESTRO_TEST__
  mockExcalidrawHarness.updateSceneCalls = []
  vi.clearAllMocks()
})

describe("Room ↔ WorkspaceStore integration", () => {
  it("chiama store.init() e store.loadScene() al mount", async () => {
    const { store } = await createMockStore()
    const initSpy = vi.spyOn(store, "init")
    const loadSpy = vi.spyOn(store, "loadScene")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(initSpy).toHaveBeenCalledTimes(1)
      expect(loadSpy).toHaveBeenCalledWith("test-room-1")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("mostra 'caricamento…' durante il load iniziale", async () => {
    const { store } = await createMockStore()
    // Delay loadScene per vedere lo stato loading (Excalidraw NON monta finché loading=true)
    vi.spyOn(store, "loadScene").mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(null), 500))
    )
    vi.spyOn(store, "loadMeta").mockResolvedValue(null)

    const container = document.getElementById("root")!
    const root = createRoot(container)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // Il div.st-status contiene 'caricamento…' durante il load iniziale
    await vi.waitFor(() => {
      const el = container.querySelector(".st-status")
      expect(el?.textContent).toContain("caricamento")
    }, { timeout: 300, interval: 50 })

    // In questo stato, Excalidraw NON è ancora montato (condizionale su !loading)
    expect(container.textContent).not.toContain("mock-excalidraw")

    // Aspetta che loadScene si risolva e loading diventi false
    await vi.waitFor(() => {
      expect(container.textContent).not.toContain("caricamento")
    }, { timeout: 1500, interval: 10 })

    // Ora Excalidraw è montato
    expect(container.textContent).toContain("mock-excalidraw")

    root.unmount()
  })

  it("persist serializza salvataggi async sovrapposti via mutex", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    // Deferred promise: primo saveScene si blocca finché non la risolviamo
    let resolveFirst: (value: unknown) => void = () => {}
    const firstPromise = new Promise((resolve) => { resolveFirst = resolve })
    const saveSpy = vi.spyOn(store, "saveScene")
    // Primo saveScene restituisce una promise in sospeso, poi saveScene normale
    saveSpy.mockImplementationOnce(() => firstPromise as Promise<void>)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // Aspetta che Excalidraw sia montato (loading finito)
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const call = vi.mocked(Excalidraw).mock.calls.at(-1)
    const onChangeFn = call?.[0]?.onChange
    expect(onChangeFn).toBeDefined()

    const makeEl = (v: number) => ({ id: "a", version: v, type: "rectangle", x: 0, y: 0, width: 100, height: 50, strokeColor: "#000", backgroundColor: "#fff", fillStyle: "solid" as const, strokeWidth: 1, strokeStyle: "solid" as const, roughness: 1, opacity: 100, angle: 0, groupIds: [] as string[], boundElements: null, updated: v, link: null, locked: false, versionNonce: v * 10, isDeleted: false, seed: v * 100, roundness: null })

    // Primo onChange: saveScene sarà deferred (in sospeso)
    onChangeFn!([makeEl(1)] as any, {} as any, {})

    // Aspetta che il debounce scatti e saveScene venga chiamato (promessa bloccata)
    await vi.waitFor(() => {
      expect(saveSpy).toHaveBeenCalledTimes(1)
    }, { timeout: 1500, interval: 50 })

    // Mentre il primo save è bloccato, secondo onChange — deve accodarsi
    onChangeFn!([makeEl(2)] as any, {} as any, {})

    // Rilascia il primo save
    resolveFirst(undefined)

    // Dopo che il primo save si completa, il secondo save con mutex deve eseguire
    await vi.waitFor(() => {
      // Il mutex serializza: secondo save parte solo dopo che primo termina
      expect(saveSpy).toHaveBeenCalledTimes(2)
    }, { timeout: 2000, interval: 50 })

    // Verifica ordine: secondo save ha version 2
    const secondCall = saveSpy.mock.calls[1]
    expect(secondCall[0]).toBe("test-room-1")

    root.unmount()
  })

  it("passa initialData a Excalidraw quando loadScene restituisce dati", async () => {
    const { store } = await createMockStore()
    const sceneData = {
      type: "excalidraw",
      elements: [{ id: "el1", type: "rectangle", x: 0, y: 0, strokeColor: "#000", backgroundColor: "#fff", fillStyle: "solid", strokeWidth: 1, strokeStyle: "solid", roundness: null, roughness: 1, opacity: 100, width: 100, height: 100, angle: 0, groupIds: [], boundElements: null, updated: 1, link: null, locked: false, version: 1, versionNonce: 1, isDeleted: false, seed: 1 }],
    }
    // Scrivo la scena prima del mount
    await store.saveScene("test-room-1", JSON.stringify(sceneData))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // Excalidraw monta SOLO dopo caricamento: initialData è al primo mount
    const { Excalidraw } = await import("@excalidraw/excalidraw")
    await vi.waitFor(() => {
      const calls = vi.mocked(Excalidraw).mock.calls
      const lastCall = calls.at(-1)
      expect(lastCall).toBeDefined()
      const initialData = lastCall![0]?.initialData
      // Con render condizionale, il primo mount di Excalidraw ha già i dati
      expect(initialData).not.toBeUndefined()
      expect((initialData as any)?.elements).toBeDefined()
      expect((initialData as any)?.elements[0]?.id).toBe("el1")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("persist chiama store.saveScene con i dati serializzati", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const saveSpy = vi.spyOn(store, "saveScene")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // Aspetta che Excalidraw sia montato (loading finito)
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    // Prendi onChange
    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const call = vi.mocked(Excalidraw).mock.calls.at(-1)
    const onChangeFn = call?.[0]?.onChange
    expect(onChangeFn).toBeDefined()

    // Simula un cambiamento
    onChangeFn!([], { isLoading: false } as any, {})

    // Aspetta il debounce di 700ms
    await vi.waitFor(
      () => {
        expect(saveSpy).toHaveBeenCalledWith(
          "test-room-1",
          expect.any(String),
        )
      },
      { timeout: 1500, interval: 50 },
    )
    root.unmount()
  })

  it("mostra errore visibile in header quando saveScene fallisce (quota)", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "saveScene").mockRejectedValue(new Error("Quota esaurita (5MB)"))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const call = vi.mocked(Excalidraw).mock.calls.at(-1)
    const onChangeFn = call?.[0]?.onChange

    expect(onChangeFn).toBeDefined()
    onChangeFn!([], { isLoading: false } as any, {})

    await vi.waitFor(
      () => {
        expect(document.body.textContent).toContain("Quota esaurita")
      },
      { timeout: 1500, interval: 50 },
    )
    root.unmount()
  })

  it("scena grande gestita senza throw silenzioso — mostra errore", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "saveScene").mockRejectedValue(new Error("Quota localStorage esaurita (5MB)"))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const call = vi.mocked(Excalidraw).mock.calls.at(-1)
    const onChangeFn = call?.[0]?.onChange
    expect(onChangeFn).toBeDefined()

    onChangeFn!([], { isLoading: false } as any, {})

    await vi.waitFor(
      () => {
        expect(document.body.textContent).toContain("5MB")
      },
      { timeout: 1500, interval: 50 },
    )

    root.unmount()
  })

  // --- Founder Beta: audio escluso dalla superficie e nessun permesso implicito ---

  it("header non espone audio né stato di registrazione", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const audioBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "audio")
    expect(audioBtn).toBeUndefined()
    expect(document.body.textContent).not.toContain("audio attivo")
    expect(document.body.textContent).not.toContain("registrando")
    expect(document.querySelector("[data-rec-strip]")).toBeNull()

    root.unmount()
  })

  it("il mount della Lezione non richiede accesso al microfono", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const getUserMedia = vi.fn().mockRejectedValue(new Error("non deve essere chiamato"))
    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: { getUserMedia },
    })

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    expect(getUserMedia).not.toHaveBeenCalled()
    expect(Array.from(document.querySelectorAll("button")).some(
      (button) => button.textContent?.trim() === "audio",
    )).toBe(false)

    vi.unstubAllGlobals()
    root.unmount()
  })

  // --- T2b punto 4: indicatore quota REALE in header ---

  it("header mostra l'indicatore dati onesto (localStorage → 'solo in questo browser')", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // S-DESIGN-2: l'indicatore dati sostituisce la micro-barra cache.
    // In localStorage mode mostra "solo in questo browser" + "scegli cartella…"
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("solo in questo browser")
      expect(document.querySelector(".st-indicator-connect")).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("nessun indicatore quota quando non applicabile (driver senza usage, es. FSA)", async () => {
    // MockDriver non implementa usage() ⇒ storageUsage() = null
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    expect(document.body.textContent).not.toContain("cache ")

    root.unmount()
  })

  // --- S-DESIGN-1(c): Room passa la config canonica a Excalidraw ---

  it("Excalidraw riceve langCode it-IT, theme light, aiEnabled false, UIOptions canonici", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    await vi.waitFor(() => {
      const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
      expect(props).toBeDefined()
      expect(props!.langCode).toBe("it-IT")
      expect(props!.theme).toBe("light")
      expect(props!.aiEnabled).toBe(false)
      expect(props!.UIOptions?.canvasActions?.loadScene).toBe(false)
      expect(props!.UIOptions?.canvasActions?.toggleTheme).toBe(false)
      expect(props!.UIOptions?.tools?.image).toBe(false)
      expect(props!.validateEmbeddable).toBeInstanceOf(RegExp)
      expect((props!.validateEmbeddable as RegExp).test("maestro-tool://io.ardesia.simulation-plugin/elab-v1-cap6-esp1-first-led")).toBe(true)
      expect(props!.renderEmbeddable).toEqual(expect.any(Function))
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("room NUOVA: initialData.appState è NEW_ROOM_APPSTATE (Nunito, ink, canvas)", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const { EXCALIDRAW_CONFIG } = await import("../design/excalidrawConfig")
    await vi.waitFor(() => {
      const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
      expect(props).toBeDefined()
      expect((props!.initialData as any)?.appState).toEqual(EXCALIDRAW_CONFIG.newRoomAppState)
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("room ESISTENTE: appState salvato vince chiave-per-chiave, default MAESTRO sotto", async () => {
    const { store } = await createMockStore()
    await store.saveScene("test-room-1", JSON.stringify({
      type: "excalidraw",
      elements: [],
      appState: { viewBackgroundColor: "#eeeeee" },
    }))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const { EXCALIDRAW_CONFIG } = await import("../design/excalidrawConfig")
    await vi.waitFor(() => {
      const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
      expect(props).toBeDefined()
      const initialData = props!.initialData as any
      // asserzione POSITIVA: scena salvata vince dove definita…
      expect(initialData?.appState).toEqual({
        ...EXCALIDRAW_CONFIG.newRoomAppState,
        viewBackgroundColor: "#eeeeee",
      })
      // …e gli elementi della scena restano
      expect(initialData?.elements).toEqual([])
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("scena salvata SENZA appState (import esterno): default MAESTRO non persi", async () => {
    const { store } = await createMockStore()
    await store.saveScene("test-room-1", JSON.stringify({ type: "excalidraw", elements: [] }))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const { EXCALIDRAW_CONFIG } = await import("../design/excalidrawConfig")
    await vi.waitFor(() => {
      const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
      expect(props).toBeDefined()
      expect((props!.initialData as any)?.appState).toEqual(EXCALIDRAW_CONFIG.newRoomAppState)
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("scena corrotta con JSON falsy ('\"\"') non finisce in initialData: si parte da zero", async () => {
    const { store } = await createMockStore()
    await store.saveScene("test-room-1", JSON.stringify(""))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const { EXCALIDRAW_CONFIG } = await import("../design/excalidrawConfig")
    await vi.waitFor(() => {
      const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
      expect(props).toBeDefined()
      expect(props!.initialData).toEqual({ appState: EXCALIDRAW_CONFIG.newRoomAppState })
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })
})

// ── FB-3C: sessione canonica LessonOS v2 ───────────────────────────────────────

const SESSION_A = "10000000-0000-4000-8000-000000000001"
const SESSION_B = "10000000-0000-4000-8000-000000000002"
const EVENT_START = "20000000-0000-4000-8000-000000000001"
const EVENT_FACT = "20000000-0000-4000-8000-000000000002"
const EVENT_END = "20000000-0000-4000-8000-000000000003"

function deterministicSessionDeps(options: {
  sessionId?: string
  eventIds?: string[]
  times?: number[]
} = {}) {
  const eventIds = [...(options.eventIds ?? [EVENT_START, EVENT_FACT, EVENT_END])]
  const times = [...(options.times ?? [
    "2026-07-18T10:00:00.000Z",
    "2026-07-18T10:01:00.000Z",
    "2026-07-18T10:02:00.000Z",
  ].map(Date.parse))]
  return {
    newSessionId: vi.fn(() => options.sessionId ?? SESSION_A),
    newEventId: vi.fn(() => {
      const next = eventIds.shift()
      if (!next) throw new Error("event id fixture esaurita")
      return next
    }),
    now: vi.fn(() => {
      const next = times.shift()
      if (!next) throw new Error("clock fixture esaurito")
      return next
    }),
  }
}

async function openInMemorySession(
  lessonId = "test-room-1",
  deps = deterministicSessionDeps(),
): Promise<LessonOsSessionHandle> {
  return openLessonOsSession({
    room: lessonId,
    env: { indexedDB: undefined, markerStorage: undefined },
    ...deps,
  })
}

describe("FB-3C: openLessonOsSession", () => {
  it("due aperture della stessa lezione hanno sessionId canonici distinti", async () => {
    const first = await openInMemorySession(
      "test-room-1",
      deterministicSessionDeps({ sessionId: SESSION_A, eventIds: [EVENT_START] }),
    )
    const second = await openInMemorySession(
      "test-room-1",
      deterministicSessionDeps({
        sessionId: SESSION_B,
        eventIds: ["20000000-0000-4000-8000-000000000004"],
      }),
    )

    expect(first.identity.lessonId).toBe("test-room-1")
    expect(first.identity.sessionId).toBe(SESSION_A)
    expect(second.identity.lessonId).toBe("test-room-1")
    expect(second.identity.sessionId).toBe(SESSION_B)
    expect(first.identity.sessionId).not.toBe(second.identity.sessionId)
    expect(Object.isFrozen(first.identity)).toBe(true)
    expect(Object.isFrozen(first.identity.actor)).toBe(true)
    expect(Object.isFrozen(first.producer)).toBe(true)
  })

  it("rifiuta una room non valida prima di UUID, IndexedDB, preflight o marker", async () => {
    const open = vi.fn()
    const markerStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
    const deps = deterministicSessionDeps()

    await expect(openLessonOsSession({
      room: "../escape",
      env: { indexedDB: { open } as unknown as IDBFactory, markerStorage },
      ...deps,
    })).rejects.toThrow("Invalid room identifier")

    expect(deps.newSessionId).not.toHaveBeenCalled()
    expect(deps.newEventId).not.toHaveBeenCalled()
    expect(deps.now).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
    expect(markerStorage.getItem).not.toHaveBeenCalled()
    expect(markerStorage.setItem).not.toHaveBeenCalled()
    expect(markerStorage.removeItem).not.toHaveBeenCalled()
  })

  it("degrada se il getter globale localStorage lancia SecurityError", async () => {
    const indexedDbModule = await import("../lessonos/indexedDbEventLog")
    const canonical = await createEventLogStore({ factory: undefined })
    const persistent = Object.create(indexedDbModule.IndexedDbEventLog.prototype) as any
    Object.defineProperties(persistent, {
      databaseName: { configurable: true, value: "fb3c-localstorage-getter" },
      open: {
        configurable: true,
        value: vi.fn(async () => ({ recovered: 0, lastSeq: 0, droppedTail: 0, corrupted: false })),
      },
      append: { configurable: true, value: canonical.append.bind(canonical) },
      readAll: { configurable: true, value: canonical.readAll.bind(canonical) },
      appendEnvelope: { configurable: true, value: canonical.appendEnvelope.bind(canonical) },
      readAllEnvelopes: { configurable: true, value: canonical.readAllEnvelopes.bind(canonical) },
      readEnvelopesByLesson: { configurable: true, value: canonical.readEnvelopesByLesson.bind(canonical) },
      readEnvelopesBySession: { configurable: true, value: canonical.readEnvelopesBySession.bind(canonical) },
      close: { configurable: true, value: vi.fn(async () => {}) },
    })
    const createStoreSpy = vi.spyOn(indexedDbModule, "createEventLogStore").mockResolvedValue(persistent)
    const localStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("storage negato", "SecurityError")
      },
    })

    try {
      const handle = await openLessonOsSession({
        room: "test-room-1",
        env: { storage: undefined },
        ...deterministicSessionDeps(),
      })
      expect(handle.persistent).toBe(true)
      await handle.close()
    } finally {
      createStoreSpy.mockRestore()
      if (localStorageDescriptor) {
        Object.defineProperty(globalThis, "localStorage", localStorageDescriptor)
      } else {
        delete (globalThis as { localStorage?: Storage }).localStorage
      }
    }
  })

  it("rifiuta a runtime un actor non-teacher prima dello storage", async () => {
    const open = vi.fn()
    await expect(openLessonOsSession({
      room: "test-room-1",
      actor: { type: "system", id: "forged-authority" } as any,
      env: { indexedDB: { open } as unknown as IDBFactory, markerStorage: undefined },
      ...deterministicSessionDeps(),
    })).rejects.toThrow(/teacher/i)
    expect(open).not.toHaveBeenCalled()
  })

  it("rifiuta una collisione start invece di riusare una sessione precedente", async () => {
    const probe = await createEventLogStore({ factory: undefined })
    const prototype = Object.getPrototypeOf(probe) as {
      appendEnvelope: typeof probe.appendEnvelope
    }
    const appendSpy = vi.spyOn(prototype, "appendEnvelope").mockImplementation(async (envelope) => ({
      event: Object.freeze({ ...structuredClone(envelope), seq: 1 }),
      appended: false,
    }))
    try {
      await expect(openInMemorySession()).rejects.toThrow(/fresh|collision|already/i)
    } finally {
      appendSpy.mockRestore()
    }
  })

  it("scrive start/end v2 completi con SHA, evidenza verificata e chiavi lifecycle stabili", async () => {
    const handle = await openInMemorySession()
    const store = handle.store
    await handle.close()
    await handle.close()

    const rows = await store.readEnvelopesBySession("test-room-1", SESSION_A)
    expect(rows).toHaveLength(2)
    const [started, ended] = rows
    const expectedProducer = studioProducerIdentity()
    expect(started).toMatchObject({
      schemaVersion: 2,
      eventId: EVENT_START,
      lessonId: "test-room-1",
      sessionId: SESSION_A,
      kind: "lesson.started",
      occurredAt: "2026-07-18T10:00:00.000Z",
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: expectedProducer,
      causationId: null,
      idempotencyKey: `session:${SESSION_A}:started`,
      evidence: [{ ref: "lesson:test-room-1@1784368800000", resolution: "verified" }],
      payload: { room: "test-room-1" },
    })
    expect(ended).toMatchObject({
      eventId: EVENT_FACT,
      kind: "lesson.ended",
      occurredAt: "2026-07-18T10:01:00.000Z",
      idempotencyKey: `session:${SESSION_A}:ended`,
      evidence: [{ ref: "lesson:test-room-1@1784368860000", resolution: "verified" }],
      payload: { room: "test-room-1" },
    })
    expect(Object.keys(started!.payload)).toEqual(["room"])
    expect(Object.keys(ended!.payload)).toEqual(["room"])
    expect(handle.producer).toEqual(expectedProducer)
    expect(handle.producer.commitSha).toMatch(/^[0-9a-f]{40}$/)
  })

  it("appendFact applica identità trusted e rifiuta override o lifecycle", async () => {
    const handle = await openInMemorySession()

    await handle.appendFact(
      "concept.introduced",
      { conceptId: "ohm-law", labels: { it: "Legge di Ohm" } },
      {
        evidence: [{ ref: "board:element-1", resolution: "verified" }],
        idempotencyKey: "board:element-1:introduced",
      },
    )

    const rows = await handle.store.readEnvelopesBySession("test-room-1", SESSION_A)
    expect(rows[1]).toMatchObject({
      eventId: EVENT_FACT,
      lessonId: "test-room-1",
      sessionId: SESSION_A,
      actor: handle.identity.actor,
      producer: handle.producer,
      kind: "concept.introduced",
      occurredAt: "2026-07-18T10:01:00.000Z",
      causationId: null,
      idempotencyKey: "board:element-1:introduced",
      evidence: [{ ref: "board:element-1", resolution: "verified" }],
      payload: { conceptId: "ohm-law", labels: { it: "Legge di Ohm" } },
    })

    await expect(handle.appendFact(
      "concept.introduced",
      { conceptId: "bad", labels: {} },
      {
        evidence: [{ ref: "board:bad", resolution: "verified" }],
        actor: { type: "system", id: "forged" },
      } as any,
    )).rejects.toThrow(/override|trusted/i)
    await expect(handle.appendFact(
      "lesson.ended" as any,
      { room: "test-room-1" },
      { evidence: [{ ref: "lesson:test-room-1", resolution: "verified" }] },
    )).rejects.toThrow(/lifecycle|factual/i)
  })

  it("close concorrente/ripetuto riusa un solo end envelope e blocca nuovi fatti", async () => {
    const deps = deterministicSessionDeps()
    const handle = await openInMemorySession("test-room-1", deps)
    const store = handle.store

    await Promise.all([handle.close(), handle.close(), handle.close()])
    await handle.close()

    const rows = await store.readEnvelopesBySession("test-room-1", SESSION_A)
    expect(rows.filter((row) => row.kind === "lesson.ended")).toHaveLength(1)
    expect(rows.map((row) => row.eventId)).toEqual([EVENT_START, EVENT_FACT])
    expect(deps.newEventId).toHaveBeenCalledTimes(2)
    expect(deps.now).toHaveBeenCalledTimes(2)
    await expect(handle.appendFact(
      "concept.introduced",
      { conceptId: "late", labels: {} },
      { evidence: [{ ref: "board:late", resolution: "verified" }] },
    )).rejects.toThrow(/closing|closed/i)
  })

  it("close rilascia il backend fisico soltanto dopo avere accodato end", async () => {
    const probe = await createEventLogStore({ factory: undefined })
    const prototype = Object.getPrototypeOf(probe) as Record<PropertyKey, unknown>
    const originalClose = Object.getOwnPropertyDescriptor(prototype, "close")
    const calls: string[] = []
    Object.defineProperty(prototype, "close", {
      configurable: true,
      value: vi.fn(async () => { calls.push("physical-close") }),
    })
    try {
      const handle = await openInMemorySession()
      const originalAppend = handle.store.appendEnvelope.bind(handle.store)
      vi.spyOn(handle.store, "appendEnvelope").mockImplementation(async (envelope) => {
        const result = await originalAppend(envelope)
        calls.push(envelope.kind)
        return result
      })

      await handle.close()

      expect(calls).toEqual(["lesson.ended", "physical-close"])
      expect(prototype.close).toHaveBeenCalledTimes(1)
    } finally {
      if (originalClose) {
        Object.defineProperty(prototype, "close", originalClose)
      } else {
        delete prototype.close
      }
    }
  })

  it("close ritenta con lo stesso envelope se il primo append end fallisce", async () => {
    const deps = deterministicSessionDeps()
    const handle = await openInMemorySession("test-room-1", deps)
    const originalAppend = handle.store.appendEnvelope.bind(handle.store)
    const appendSpy = vi.spyOn(handle.store, "appendEnvelope")
      .mockRejectedValueOnce(new Error("transient end append failure"))
      .mockImplementation(originalAppend)

    await expect(handle.close()).rejects.toThrow("transient end append failure")
    await handle.close()

    const rows = await handle.store.readEnvelopesBySession("test-room-1", SESSION_A)
    expect(rows.filter((row) => row.kind === "lesson.ended")).toHaveLength(1)
    expect(rows.at(-1)?.eventId).toBe(EVENT_FACT)
    expect(appendSpy).toHaveBeenCalledTimes(2)
    expect(appendSpy.mock.calls[0]?.[0]).toEqual(appendSpy.mock.calls[1]?.[0])
    expect(deps.newEventId).toHaveBeenCalledTimes(2)
    expect(deps.now).toHaveBeenCalledTimes(2)
  })

  it("un errore della factory end diventa una Promise rigettata, mai un throw sincrono", async () => {
    const deps = deterministicSessionDeps({
      eventIds: [EVENT_START],
      times: [Date.parse("2026-07-18T10:00:00.000Z"), Date.parse("2026-07-18T10:01:00.000Z")],
    })
    const handle = await openInMemorySession("test-room-1", deps)
    let closeResult: Promise<unknown> | undefined

    expect(() => {
      closeResult = handle.close()
    }).not.toThrow()
    await expect(closeResult).rejects.toThrow("event id fixture esaurita")
  })
})

function makeDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

class TestErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    return this.state.error ? this.state.error.message : this.props.children
  }
}

describe("FB-3C: ownership Room della sessione LessonOS", () => {
  it("hash con whitespace fallisce esattamente prima di store e opener", async () => {
    vi.stubGlobal("location", { hash: "# roomA " })
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { store } = await createMockStore()
    const initSpy = vi.spyOn(store, "init")
    const opener: LessonOsSessionOpener = vi.fn()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(
      <TestErrorBoundary>
        <RoomModule.default store={store} lessonOsOpener={opener} />
      </TestErrorBoundary>,
    )

    await vi.waitFor(() => expect(document.body.textContent).toContain("Invalid room identifier"))
    expect(initSpy).not.toHaveBeenCalled()
    expect(opener).not.toHaveBeenCalled()
    root.unmount()
    consoleSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it("chiude immediatamente un handle che risolve dopo unmount", async () => {
    const deferred = makeDeferred<LessonOsSessionHandle>()
    const opener: LessonOsSessionOpener = vi.fn(() => deferred.promise)
    const lateHandle = await openInMemorySession()
    const closeSpy = vi.spyOn(lateHandle, "close")
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)

    await vi.waitFor(() => expect(opener).toHaveBeenCalledWith({ room: "test-room-1" }))
    root.unmount()
    deferred.resolve(lateHandle)
    await vi.waitFor(() => expect(closeSpy).toHaveBeenCalledTimes(1))
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it("rende diagnostico un close tardivo fallito dopo unmount", async () => {
    const deferred = makeDeferred<LessonOsSessionHandle>()
    const opener: LessonOsSessionOpener = vi.fn(() => deferred.promise)
    const lateHandle = await openInMemorySession()
    const closeSpy = vi.spyOn(lateHandle, "close")
      .mockRejectedValueOnce(new Error("late lifecycle close failed"))
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)

    await vi.waitFor(() => expect(opener).toHaveBeenCalledWith({ room: "test-room-1" }))
    root.unmount()
    deferred.resolve(lateHandle)
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "LessonOS session cleanup failed after Room unmount",
        expect.objectContaining({ message: "late lifecycle close failed" }),
      )
    })
    closeSpy.mockRestore()
    consoleSpy.mockRestore()
    await lateHandle.close()
  })

  it("rende diagnostico il rigetto reale della factory end durante unmount", async () => {
    const handle = await openInMemorySession(
      "test-room-1",
      deterministicSessionDeps({
        eventIds: [EVENT_START],
        times: [Date.parse("2026-07-18T10:00:00.000Z"), Date.parse("2026-07-18T10:01:00.000Z")],
      }),
    )
    const opener: LessonOsSessionOpener = vi.fn(async () => handle)
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)
    await vi.waitFor(() => expect((window as any).__MAESTRO_TEST__?.lessonOs?.current).toBe(handle))

    expect(() => root.unmount()).not.toThrow()
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "LessonOS session cleanup failed during Room unmount",
        expect.objectContaining({ message: "event id fixture esaurita" }),
      )
    })
    consoleSpy.mockRestore()
  })

  it("rimontare la stessa lezione apre una nuova sessione", async () => {
    const opened: LessonOsSessionHandle[] = []
    const ids = [SESSION_A, SESSION_B]
    const opener: LessonOsSessionOpener = vi.fn(async ({ room: lessonId }) => {
      const index = opened.length
      const handle = await openInMemorySession(
        lessonId,
        deterministicSessionDeps({
          sessionId: ids[index],
          eventIds: [
            `30000000-0000-4000-8000-00000000000${index + 1}`,
            `40000000-0000-4000-8000-00000000000${index + 1}`,
          ],
        }),
      )
      opened.push(handle)
      return handle
    })
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const RoomModule = await import("../Room")

    const firstRoot = createRoot(document.getElementById("root")!)
    firstRoot.render(<RoomModule.default store={store} lessonOsOpener={opener} />)
    await vi.waitFor(() => {
      expect(opened).toHaveLength(1)
      expect((window as any).__MAESTRO_TEST__?.lessonOs?.current).toBe(opened[0])
    })
    firstRoot.unmount()

    document.body.innerHTML = '<div id="root"></div>'
    delete (window as any).__MAESTRO_TEST__
    const secondRoot = createRoot(document.getElementById("root")!)
    secondRoot.render(<RoomModule.default store={store} lessonOsOpener={opener} />)
    await vi.waitFor(() => {
      expect(opened).toHaveLength(2)
      expect((window as any).__MAESTRO_TEST__?.lessonOs?.current).toBe(opened[1])
    })

    expect(opened.map((handle) => handle.identity.sessionId)).toEqual([SESSION_A, SESSION_B])
    secondRoot.unmount()
  })

  it("rende visibile il rigetto dell'opener", async () => {
    const opener: LessonOsSessionOpener = vi.fn(async () => {
      throw new Error("canonical session unavailable")
    })
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)

    await vi.waitFor(() => {
      expect(document.querySelector(".st-err")?.textContent).toContain("canonical session unavailable")
    })
    root.unmount()
  })

  it("allowlist Founder Beta contiene un solo plugin first-party senza capability remote", async () => {
    expect(FOUNDER_BETA_PLUGINS).toHaveLength(1)
    const plugin = FOUNDER_BETA_PLUGINS[0]
    expect(plugin.id).toBe(REFERENCE_SIM_TOOL_ID)
    expect(plugin.trustTier).toBe("builtin-reviewed")
    expect(plugin.manifest.publisher).toEqual({
      id: "maestro-sdk",
      pubkey: "ed25519:Jr4+9LNWwK1Mxs6qCzr+qgLZI72pbGZaXEZ87HALHFk=",
    })
    expect(plugin.manifest.privacy.dataOut).toBe("none")
    expect(plugin.manifest.capabilities["net.fetch"]).toBeUndefined()
    expect(plugin.manifest.capabilities["llm.generate"]).toBeUndefined()
    expect(plugin.manifest.capabilities["board.write"]).toEqual({ scope: "own-embeds" })

    const handle = await openInMemorySession()
    const opener: LessonOsSessionOpener = vi.fn(async () => handle)
    const appendFactSpy = vi.spyOn(handle, "appendFact")
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)

    await vi.waitFor(() => {
      expect((window as any).__MAESTRO_TEST__?.lessonOs?.current).toBe(handle)
      expect(document.querySelectorAll("[data-founder-plugin-id]")).toHaveLength(1)
    })
    const rows = await handle.store.readEnvelopesBySession("test-room-1", SESSION_A)
    expect(rows).toHaveLength(1)
    expect(rows.some((row) => row.kind.includes("audio"))).toBe(false)
    expect(rows.flatMap((row) => row.evidence).some((item) => item.ref.startsWith("audio:"))).toBe(false)
    expect(appendFactSpy).not.toHaveBeenCalled()
    root.unmount()
  })

  it("non apre sessioni in vista studente", async () => {
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReturnValue(true)
    const opener: LessonOsSessionOpener = vi.fn()
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)
    await vi.waitFor(() => expect((window as any).__MAESTRO_TEST__?.ready).toBe(true))
    expect(opener).not.toHaveBeenCalled()
    root.unmount()
    vi.mocked(isStudentView).mockReturnValue(false)
  })

  it.each(["recap", "replay"])("non apre sessioni in vista %s", async (view) => {
    const { isRecapView } = await import("../store/isRecapView")
    const { isReplayView } = await import("../store/isReplayView")
    vi.mocked(isRecapView).mockReturnValue(view === "recap")
    vi.mocked(isReplayView).mockReturnValue(view === "replay")
    const opener: LessonOsSessionOpener = vi.fn()
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)
    await vi.waitFor(() => expect((window as any).__MAESTRO_TEST__?.ready).toBe(true))
    expect(opener).not.toHaveBeenCalled()
    root.unmount()
    vi.mocked(isRecapView).mockReturnValue(false)
    vi.mocked(isReplayView).mockReturnValue(false)
  })
})

describe("FB-4C: Room usa il journal v2 della sessione canonica", () => {
  async function mountWithSession(
    providedHandle?: LessonOsSessionHandle,
  ) {
    const handle = providedHandle ?? await openInMemorySession(
      "test-room-1",
      deterministicSessionDeps({
        sessionId: SESSION_A,
        eventIds: [EVENT_START, EVENT_END],
      }),
    )
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const opener: LessonOsSessionOpener = vi.fn(async () => handle)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} lessonOsOpener={opener} />)
    let harness: any
    await vi.waitFor(() => {
      harness = (window as any).__MAESTRO_TEST__
      expect(harness?.lessonOs?.current).toBe(handle)
      expect(harness?.recorder).toBeTruthy()
    })
    return { root, store, handle, harness }
  }

  it("scrive solo nel path room e usa identita/producer esatti della sessione", async () => {
    const { root, store, handle, harness } = await mountWithSession()

    harness.recorder.recordMathInsert("V = RI")
    await harness.recorder.flush()

    const canonicalPath = roomPaths("test-room-1").journal
    const canonical = await store.read(canonicalPath)
    expect(canonical).not.toBeNull()
    expect(await store.read(PATHS.JOURNAL)).toBeNull()
    const rows = (await canonical!.text()).trim().split("\n").map((line) => JSON.parse(line))
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      schemaVersion: 2,
      lessonId: handle.identity.lessonId,
      sessionId: handle.identity.sessionId,
      actor: handle.identity.actor,
      producer: handle.producer,
      kind: "journal.math.insert",
    })
    expect(harness.journal).toEqual({
      path: canonicalPath,
      identity: handle.identity,
      producer: handle.producer,
    })
    expect(harness.PATHS.JOURNAL).toBe(canonicalPath)

    root.unmount()
  })

  it("attende il flush journal prima di chiudere la sessione", async () => {
    const { root, store, handle, harness } = await mountWithSession()
    const closeSpy = vi.spyOn(handle, "close")
    const originalWrite = store.write.bind(store)
    const writeStarted = makeDeferred<void>()
    const allowWrite = makeDeferred<void>()
    vi.spyOn(store, "write").mockImplementation(async (path, data) => {
      writeStarted.resolve()
      await allowWrite.promise
      await originalWrite(path, data)
    })
    harness.recorder.recordMathInsert("P = VI")

    root.unmount()
    try {
      await writeStarted.promise
      expect(closeSpy).not.toHaveBeenCalled()
      allowWrite.resolve()
      await vi.waitFor(() => expect(closeSpy).toHaveBeenCalledTimes(1))
    } finally {
      allowWrite.resolve()
    }
  })

  it("se il flush di unmount fallisce lo diagnostica e rilascia comunque LessonOS", async () => {
    const { root, handle, harness } = await mountWithSession()
    const closeSpy = vi.spyOn(handle, "close")
    vi.spyOn(harness.recorder, "flush").mockRejectedValue(new Error("flush cleanup fallito"))
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    root.unmount()

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Room journal flush failed before LessonOS close",
        expect.objectContaining({ message: "flush cleanup fallito" }),
      )
      expect(closeSpy).toHaveBeenCalledTimes(1)
    })
    consoleSpy.mockRestore()
  })

  it("Lezione non duplica l'export: il workflow .lesson vive solo in Materiali", async () => {
    const { root, store } = await mountWithSession()
    const exportSpy = vi.spyOn(store, "exportLesson")
    const exportButton = Array.from(document.querySelectorAll("button"))
      .find((button) => button.textContent?.trim() === "esporta lezione")
    expect(exportButton).toBeUndefined()
    expect(exportSpy).not.toHaveBeenCalled()
    root.unmount()
  })
})

// ── S-DESIGN-5: Vista studente ───────────────────────────────────

describe("S-DESIGN-5: Vista studente (?vista=studente)", () => {

  beforeEach(async () => {
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReturnValue(true)
    // L'harness resta sul window tra un test e l'altro: senza pulizia il
    // waitFor sul recorder passerebbe su un harness stantio (falso verde)
    delete (window as any).__MAESTRO_TEST__
  })

  it("header mostra solo wordmark + chip 'stai guardando la lavagna', zero bottoni docente", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "loadMeta").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("stai guardando la lavagna")
    }, { timeout: 5000, interval: 10 })

    // Chip studente presente
    expect(document.querySelector(".st-chip-student")).not.toBeNull()

    // ZERO bottoni docente: assert STRUTTURALE (regge anche a rinomine dei bottoni)
    expect(document.querySelector(".st-actions")).toBeNull()
    expect(document.querySelectorAll(".st-bar button").length).toBe(0)
    // E in più: nessun testo bottone docente noto
    const allButtons = document.querySelectorAll("button")
    const buttonTexts = Array.from(allButtons).map((b) => b.textContent?.trim() ?? "")
    expect(buttonTexts).not.toContain("audio")
    expect(buttonTexts).not.toContain("formula")
    expect(buttonTexts).not.toContain("media")
    expect(buttonTexts).not.toContain("lezioni")
    expect(buttonTexts).not.toContain("Meet")
    expect(buttonTexts).not.toContain("esporta lezione")
    expect(buttonTexts).not.toContain("invita studente")
    // Nessun indicatore dati (solo docente)
    expect(document.querySelector(".st-indicator")).toBeNull()

    root.unmount()
  })

  it("Excalidraw riceve viewModeEnabled=true con scena salvata", async () => {
    const { store } = await createMockStore()
    // Fornisci scena dati per far montare Excalidraw
    const sceneData = {
      type: "excalidraw",
      elements: [{ id: "el1", type: "rectangle" }],
      appState: {},
    }
    vi.spyOn(store, "loadScene").mockResolvedValue(JSON.stringify(sceneData))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    await vi.waitFor(() => {
      const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
      expect(props).toBeDefined()
      expect(props!.viewModeEnabled).toBe(true)
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("nessun JournalRecorder/AudioRecorder (recorder null nel test harness)", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      // Il test harness esiste (DEV), ma recorder e audioRecorder sono null.
      // L'harness è stato cancellato nel beforeEach: questo è quello di QUESTO mount.
      const harness = (window as any).__MAESTRO_TEST__
      expect(harness).toBeDefined()
      expect(harness.ready).toBe(true)
      expect(harness.recorder).toBeNull()
      expect(harness.audioRecorder).toBeNull()
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("vista studente senza scena: stato vuoto sobrio (cosa è successo + cosa fare), niente emoji", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      const empty = document.querySelector(".st-student-empty .st-state")
      expect(empty).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    const empty = document.querySelector(".st-student-empty .st-state")!
    expect(empty.querySelector(".st-state-title")?.textContent).toMatch(/lavagna è ancora vuota/i)
    expect(empty.querySelector(".st-state-hint")).toBeNull()
    expect(empty.textContent).not.toContain("Meet")
    expect(hasEmoji(empty.textContent ?? "")).toBe(false)

    root.unmount()
  })

  it("la Lezione docente non pubblicizza sharing e non scrive negli appunti", async () => {
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReturnValue(false)
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const writeText = vi.fn((_text: string) => Promise.resolve())
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard")
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    expect(Array.from(document.querySelectorAll("button")).some(
      (button) => button.textContent?.trim() === "invita studente",
    )).toBe(false)
    expect(writeText).not.toHaveBeenCalled()

    root.unmount()
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", originalClipboard)
    } else {
      delete (navigator as any).clipboard
    }
  })

  it("la Lezione docente non espone controlli esterni o workflow Materiali duplicati", async () => {
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReturnValue(false)
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const actions = document.querySelector(".st-actions")
    expect(actions).not.toBeNull()
    const text = actions?.textContent ?? ""
    for (const excluded of ["Meet", "esporta lezione", "audio", "invita studente", "sim esp2", "sim esp3", "sim esp6"]) {
      expect(text).not.toContain(excluded)
    }

    root.unmount()
  })

  it("vista studente: onChange non è cablato (nessun persist dal browser dello studente)", async () => {
    const { store } = await createMockStore()
    const sceneData = {
      type: "excalidraw",
      elements: [{ id: "el1", type: "rectangle" }],
      appState: {},
    }
    vi.spyOn(store, "loadScene").mockResolvedValue(JSON.stringify(sceneData))
    const saveSpy = vi.spyOn(store, "saveScene")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const { Excalidraw } = await import("@excalidraw/excalidraw")
    await vi.waitFor(() => {
      const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
      expect(props).toBeDefined()
      expect(props!.viewModeEnabled).toBe(true)
      // onChange assente in vista studente: la lavagna è sola-lettura
      expect(props!.onChange).toBeUndefined()
    }, { timeout: 5000, interval: 10 })

    expect(saveSpy).not.toHaveBeenCalled()

    root.unmount()
  })

  // S-TRIAGE-1 (report 20260612-1134): invariante "nessuna scrittura store" oltre
  // l'assenza della prop onChange — si esercita il path di persistenza REALE
  // (flushPersist → _doSave) e si verifica che in vista studente è un no-op.
  it("vista studente: onChange (se cablato) + flushPersist non scrivono nello store", async () => {
    const { store } = await createMockStore()
    const sceneData = {
      type: "excalidraw",
      elements: [{ id: "el1", type: "rectangle" }],
      appState: {},
    }
    vi.spyOn(store, "loadScene").mockResolvedValue(JSON.stringify(sceneData))
    const saveSpy = vi.spyOn(store, "saveScene")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    let harness: any
    await vi.waitFor(() => {
      harness = (window as any).__MAESTRO_TEST__
      expect(harness).toBeDefined()
      expect(harness.ready).toBe(true)
    }, { timeout: 5000, interval: 10 })

    // Kill-test: se una regressione cablasse onChange in vista studente,
    // questa chiamata popolerebbe i refs e flushPersist scriverebbe → rosso.
    // Oggi onChange è undefined: optional chaining = no-op.
    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const props = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]
    props?.onChange?.([{ id: "el2", type: "ellipse", version: 1 }] as any, {} as any, {} as any)

    // Unico path programmatico di salvataggio esposto: deve restare no-op
    await harness.flushPersist()
    expect(saveSpy).not.toHaveBeenCalled()

    root.unmount()
  })
})

// ── S-DESIGN-9a: chip stanza mostra il NOME della lezione ────────

describe("S-DESIGN-9a: chip stanza in vista studente (nome lezione, fallback id)", () => {
  beforeEach(async () => {
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReturnValue(true)
    delete (window as any).__MAESTRO_TEST__
  })

  it("con meta.json presente la chip mostra il NOME della lezione, non l'id", async () => {
    const { store } = await createMockStore()
    await store.saveMeta("test-room-1", { v: 1, name: "Teoria dei Segnali", createdAt: 1718000000000 })
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      const chip = document.querySelector(".st-chip-lesson")
      expect(chip).not.toBeNull()
      expect(chip!.textContent).toBe("Teoria dei Segnali")
    }, { timeout: 5000, interval: 10 })

    // L'id della stanza NON è il contenuto della chip quando il meta esiste
    expect(document.querySelector(".st-chip-lesson")!.textContent).not.toContain("test-room-1")
    // La chip informativa resta accanto a quella della lezione
    expect(document.body.textContent).toContain("stai guardando la lavagna")

    root.unmount()
  })

  it("senza meta.json la chip fa fallback all'id stanza", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      const chip = document.querySelector(".st-chip-lesson")
      expect(chip).not.toBeNull()
      expect(chip!.textContent).toBe("test-room-1")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("loadMeta che RIGETTA non è fatale: chip = id, nessun 'Caricamento scena fallito'", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "loadMeta").mockRejectedValue(new Error("permesso revocato"))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      const chip = document.querySelector(".st-chip-lesson")
      expect(chip).not.toBeNull()
      expect(chip!.textContent).toBe("test-room-1")
    }, { timeout: 5000, interval: 10 })

    expect(document.body.textContent).not.toContain("Caricamento scena fallito")

    root.unmount()
  })

  it("in vista studente loadMeta VIENE chiamato (il nome serve alla chip)", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const metaSpy = vi.spyOn(store, "loadMeta")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(metaSpy).toHaveBeenCalledWith("test-room-1")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })
})

describe("S-DESIGN-3b: flush-persist ordering + drawer error handling", () => {
  beforeEach(async () => {
    // Resetta isStudentView a false (S-DESIGN-5 beforeEach lo imposta a true)
    delete (window as any).__MAESTRO_TEST__
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReset()
    vi.mocked(isStudentView).mockReturnValue(false)
  })

  it("navigateToLesson attende saveScene prima di cambiare hash (flush-persist ordering)", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    // Deferred promise: primo saveScene si blocca finché non risolviamo
    let resolveSave: (value: unknown) => void = () => {}
    const saveDeferred = new Promise((resolve) => { resolveSave = resolve })
    const saveSpy = vi.spyOn(store, "saveScene")
    saveSpy.mockImplementationOnce(() => saveDeferred as Promise<void>)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // Aspetta che Excalidraw sia montato
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    // Assicura che il test harness sia disponibile (DEV)
    const harness = (window as any).__MAESTRO_TEST__
    expect(harness).toBeDefined()
    expect(harness.navigateToLesson).toBeDefined()
    expect(harness.flushPersist).toBeDefined()

    // Chiama onChange per impostare latestElementsRef (serve a _doSave per non uscire presto)
    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const call = vi.mocked(Excalidraw).mock.calls.at(-1)
    const onChangeFn = call?.[0]?.onChange
    expect(onChangeFn).toBeDefined()
    const makeEl = (v: number) => ({ id: "el1", version: v, type: "rectangle", x: 0, y: 0, width: 100, height: 50, strokeColor: "#000", backgroundColor: "#fff", fillStyle: "solid" as const, strokeWidth: 1, strokeStyle: "solid" as const, roughness: 1, opacity: 100, angle: 0, groupIds: [] as string[], boundElements: null, link: null, locked: false, versionNonce: v * 10, isDeleted: false, seed: v * 100, roundness: null, updated: v })
    onChangeFn!([makeEl(1)] as any, {} as any, {})

    // Chiama navigateToLesson SENZA await: il flush blocca su saveScene deferred
    const navPromise = harness.navigateToLesson("altra-room")

    // navigateToLesson è async ma non awaitato — diamo tempo agli await interni
    // di entrare nella coda microtask (flushPersist → _doSave → await _pendingSave)
    await vi.waitFor(() => {
      expect(saveSpy).toHaveBeenCalledTimes(1)
    }, { timeout: 5000, interval: 5 })

    // saveScene è in sospeso (deferred) — l'hash NON deve essere cambiato
    expect(globalThis.location.hash).toBe("#test-room-1")

    // Risolvi saveScene deferred
    resolveSave(undefined)

    // Ora navigateToLesson può proseguire: hash cambia
    await vi.waitFor(() => {
      expect(globalThis.location.hash).toBe("#altra-room")
    }, { timeout: 5000, interval: 5 })

    // Verifica che navPromise si risolva
    await expect(navPromise).resolves.toBeUndefined()

    root.unmount()
  })

  it("navigateToLesson attende anche il flush journal prima di cambiare hash", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    let harness: any
    await vi.waitFor(() => {
      harness = (window as any).__MAESTRO_TEST__
      expect(harness?.lessonOs?.current).toBeTruthy()
      expect(harness?.recorder).toBeTruthy()
    })
    harness.recorder.recordMathInsert("E = mc^2")
    const originalWrite = store.write.bind(store)
    const writeStarted = makeDeferred<void>()
    const allowWrite = makeDeferred<void>()
    vi.spyOn(store, "write").mockImplementation(async (path, data) => {
      writeStarted.resolve()
      await allowWrite.promise
      await originalWrite(path, data)
    })

    const navigation = harness.navigateToLesson("altra-room")
    try {
      await writeStarted.promise
      expect(globalThis.location.hash).toBe("#test-room-1")
      allowWrite.resolve()
      await navigation
      expect(globalThis.location.hash).toBe("#altra-room")
    } finally {
      allowWrite.resolve()
      root.unmount()
    }
  })

  it("il cambio superficie attende il journal e conserva l'ultimo evento prima della route", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const navigate = vi.fn()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} navigate={navigate} />)

    let harness: any
    await vi.waitFor(() => {
      harness = (window as any).__MAESTRO_TEST__
      expect(harness?.recorder).toBeTruthy()
    })
    const marker = "fb6c-last-event-before-surface"
    harness.recorder.recordMathInsert(marker)

    const originalWrite = store.write.bind(store)
    const writeStarted = makeDeferred<void>()
    const allowWrite = makeDeferred<void>()
    vi.spyOn(store, "write").mockImplementation(async (path, data) => {
      if (path === roomPaths("test-room-1").journal) {
        writeStarted.resolve()
        await allowWrite.promise
      }
      await originalWrite(path, data)
    })

    const link = document.querySelector<HTMLAnchorElement>(
      '[data-view-nav-item="continuita"]',
    )!
    link.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    }))

    try {
      await writeStarted.promise
      expect(navigate).not.toHaveBeenCalled()
      expect(globalThis.location.hash).toBe("#test-room-1")

      allowWrite.resolve()
      await vi.waitFor(() => {
        expect(navigate).toHaveBeenCalledWith(
          "/?vista=cruscotto#test-room-1",
        )
      })
      const journal = await store.read(roomPaths("test-room-1").journal)
      expect(await journal?.text()).toContain(marker)
    } finally {
      allowWrite.resolve()
      root.unmount()
    }
  })

  it("un errore journal annulla il cambio superficie e resta visibile", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const navigate = vi.fn()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} navigate={navigate} />)

    let harness: any
    await vi.waitFor(() => {
      harness = (window as any).__MAESTRO_TEST__
      expect(harness?.recorder).toBeTruthy()
    })
    harness.recorder.recordMathInsert("fb6c-journal-error")
    vi.spyOn(store, "write").mockRejectedValue(new Error("journal offline"))

    document.querySelector<HTMLAnchorElement>(
      '[data-view-nav-item="materiali"]',
    )!.click()

    await vi.waitFor(() => {
      expect(document.querySelector(".st-err")?.textContent).toContain(
        "Cambio superficie annullato: journal offline",
      )
    })
    expect(navigate).not.toHaveBeenCalled()
    root.unmount()
  })

  it("un errore scena annulla il cambio superficie invece di navigare con dati persi", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "saveScene").mockRejectedValue(new Error("scene offline"))
    const navigate = vi.fn()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} navigate={navigate} />)

    await vi.waitFor(() => {
      expect((window as any).__MAESTRO_TEST__?.recorder).toBeTruthy()
    })
    const { Excalidraw } = await import("@excalidraw/excalidraw")
    const onChange = vi.mocked(Excalidraw).mock.calls.at(-1)?.[0]?.onChange
    expect(onChange).toBeDefined()
    onChange!([{ id: "fb6c-element", version: 1 }] as any, {} as any, {})

    document.querySelector<HTMLAnchorElement>(
      '[data-view-nav-item="continuita"]',
    )!.click()

    await vi.waitFor(() => {
      expect(document.querySelector(".st-err")?.textContent).toContain(
        "Cambio superficie annullato: scene offline",
      )
    })
    expect(navigate).not.toHaveBeenCalled()
    root.unmount()
  })

  it("un flush sospeso scade senza cambiare route e libera il cambio superficie", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const navigate = vi.fn()
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} navigate={navigate} />)

    let harness: any
    await vi.waitFor(() => {
      harness = (window as any).__MAESTRO_TEST__
      expect(harness?.recorder).toBeTruthy()
    })
    harness.recorder.recordMathInsert("fb6c-never-finishes")
    const writeStarted = makeDeferred<void>()
    vi.spyOn(store, "write").mockImplementation(async () => {
      writeStarted.resolve()
      await new Promise<void>(() => {})
    })

    vi.useFakeTimers()
    try {
      document.querySelector<HTMLAnchorElement>(
        '[data-view-nav-item="continuita"]',
      )!.click()
      await writeStarted.promise
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000)
      })

      expect(navigate).not.toHaveBeenCalled()
      expect(globalThis.location.hash).toBe("#test-room-1")
      expect(document.querySelector(".st-err")?.textContent).toContain(
        "Salvataggio ancora in corso dopo 10 secondi",
      )
    } finally {
      vi.useRealTimers()
      root.unmount()
    }
  })

  it("toggleDrawer mostra errore quando listRooms fallisce", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    // listRooms lancia
    vi.spyOn(store, "listRooms").mockRejectedValue(new Error("store offline"))

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // Aspetta che Excalidraw sia montato
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    // Trova e clicca il bottone "lezioni"
    const lezioniBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "lezioni")
    expect(lezioniBtn).toBeDefined()
    lezioniBtn!.click()

    // L'errore deve apparire come banner st-err nel DOM
    await vi.waitFor(() => {
      const err = document.querySelector(".st-err")
      expect(err).toBeDefined()
      expect(err!.textContent).toContain("store offline")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("drawer senza lezioni: stato vuoto compatto che spiega come crearne una", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "listRooms").mockResolvedValue([])

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const lezioniBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "lezioni")
    expect(lezioniBtn).toBeDefined()
    lezioniBtn!.click()

    await vi.waitFor(() => {
      const empty = document.querySelector(".st-drawer-body .st-state-compact")
      expect(empty).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    const empty = document.querySelector(".st-drawer-body .st-state-compact")!
    expect(empty.querySelector(".st-state-title")?.textContent).toMatch(/nessuna lezione/i)
    expect(empty.querySelector(".st-state-hint")?.textContent).toMatch(/lavagna|salva/i)
    expect(hasEmoji(empty.textContent ?? "")).toBe(false)

    root.unmount()
  })
})

// ── S-UX-3: accessibilità tastiera e ARIA sui controlli ─────────────

describe("S-UX-3: accessibilità tastiera/ARIA", () => {
  beforeEach(async () => {
    delete (window as any).__MAESTRO_TEST__
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReset()
    vi.mocked(isStudentView).mockReturnValue(false)
  })

  it("il trigger di rinomina è raggiungibile da tastiera (role=button + tabindex + aria-label) e Enter apre l'input", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "loadMeta").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    let nameEl: Element | null = null
    await vi.waitFor(() => {
      nameEl = document.querySelector(".st-name")
      expect(nameEl).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    // Uno <span> cliccabile senza questi attributi è invisibile alla tastiera/SR.
    expect(nameEl!.getAttribute("role")).toBe("button")
    expect(nameEl!.getAttribute("tabindex")).toBe("0")
    expect(nameEl!.getAttribute("aria-label")).toBeTruthy()

    // Kill-test: prima del fix non c'era onKeyDown → Enter non apriva nulla.
    nameEl!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    await vi.waitFor(() => {
      expect(document.querySelector(".st-name-input")).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("il drawer è un dialog con focus management: focus-in all'apertura, Escape chiude e ridà il focus", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    vi.spyOn(store, "listRooms").mockResolvedValue([
      { v: 1, room: "altra", name: "Algebra Lineare", createdAt: Date.now(), mtime: Date.now() },
    ])

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const lezioniBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "lezioni")!
    // Focus esplicito sul trigger: così il dialog può restituirgli il focus alla chiusura.
    lezioniBtn.focus()
    lezioniBtn.click()

    let dialog: Element | null = null
    await vi.waitFor(() => {
      dialog = document.querySelector(".st-drawer")
      expect(dialog).not.toBeNull()
      expect(document.querySelector(".st-card")).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    expect(dialog!.getAttribute("role")).toBe("dialog")
    expect(dialog!.getAttribute("aria-label")).toBeTruthy()
    // aria-modal NON dichiarato: senza focus-trap reale sarebbe una bugia per gli AT.
    expect(dialog!.getAttribute("aria-modal")).toBeNull()

    // Card raggiungibile da tastiera
    const card = document.querySelector(".st-card")!
    expect(card.getAttribute("role")).toBe("button")
    expect(card.getAttribute("tabindex")).toBe("0")
    expect(card.getAttribute("aria-label")).toMatch(/Algebra Lineare/)

    // All'apertura il focus entra nel dialog (bottone chiudi)
    const closeBtn = dialog!.querySelector(".st-drawer-close")!
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(closeBtn)
    }, { timeout: 5000, interval: 10 })

    // Escape chiude…
    dialog!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await vi.waitFor(() => {
      expect(document.querySelector(".st-drawer")).toBeNull()
    }, { timeout: 5000, interval: 10 })
    // …e ridà il focus al trigger (WCAG 2.4.3)
    expect(document.activeElement).toBe(lezioniBtn)

    root.unmount()
  })

  it("il bottone media (etichetta breve) espone un aria-label descrittivo", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const mediaBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "media")!
    expect(mediaBtn).toBeDefined()
    expect(mediaBtn.getAttribute("aria-label")).toMatch(/immagine|pdf|lesson/i)

    root.unmount()
  })
})

describe("handleFile: i fallimenti import-file usano il chip d'errore (UX coerente, no alert)", () => {
  async function mountRoomAndGetFileInput(options: { mockLoadScene?: boolean } = {}) {
    const { mockLoadScene = true } = options
    const { store } = await createMockStore()
    if (mockLoadScene) {
      vi.spyOn(store, "loadScene").mockResolvedValue(null)
    }
    // Drena i timer pendenti dei test precedenti: OGNI re-render del mock Excalidraw
    // accoda una consegna API via setTimeout(0); una consegna stantia (Room già
    // smontato) setterebbe l'attributo qui sotto SENZA settare l'apiRef di QUESTO
    // Room. Dopo il drain, ogni consegna futura appartiene al mount corrente.
    await new Promise((r) => setTimeout(r, 1))
    // Azzera il segnale di consegna API di eventuali mount precedenti: l'attributo
    // vive su document.body e sopravvive a unmount/innerHTML reset del beforeEach.
    document.body.removeAttribute("data-mock-excalidraw-api")
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)
    // Attende il mount di Excalidraw E la consegna dell'API (apiRef impostato dal
    // mock via setTimeout(0)): handleFile esce subito, in silenzio, se apiRef.current
    // è null. Il solo testo "mock-excalidraw" NON basta: appare al render, mentre
    // l'API arriva in un timer successivo — race osservata flaky 4/10 run full-suite
    // (chip mai mostrato, pdfToImages mai chiamato).
    let input: HTMLInputElement | undefined
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
      expect(document.body.getAttribute("data-mock-excalidraw-api")).toBe("1")
      input = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toBeTruthy()
    }, { timeout: 5000, interval: 10 })
    return { root, input: input!, store }
  }

  function selectFile(input: HTMLInputElement, file: File) {
    Object.defineProperty(input, "files", { value: [file], configurable: true })
    input.dispatchEvent(new Event("change", { bubbles: true }))
  }

  it("formato non supportato: mostra il chip st-err, non una alert modale", async () => {
    const { root, input } = await mountRoomAndGetFileInput()

    selectFile(input, new File(["ciao"], "note.txt", { type: "text/plain" }))

    await vi.waitFor(() => {
      const err = document.querySelector(".st-err")
      expect(err?.textContent).toContain("Formato non supportato")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("import .lesson dalla Room scrive la board nel path della stanza e aggiorna Excalidraw", async () => {
    const { store: sourceStore } = await createMockStore()
    const boardScene = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())
    await sourceStore.saveScene("test-room-1", JSON.stringify(boardScene))
    await sourceStore.write(
      roomPaths("test-room-1").journal,
      new Blob(['{"t":1,"type":"t0"}\n'], { type: "application/x-ndjson" }),
    )
    await sourceStore.saveSessionYaml("v: 1\ncreated: 1\naudioConsent: false\n")
    const bundle = await exportLesson(sourceStore, "test-room-1")

    const { root, input, store } = await mountRoomAndGetFileInput({ mockLoadScene: false })

    selectFile(input, new File([bundle], "source.lesson", { type: "application/zip" }))

    await vi.waitFor(async () => {
      const roomSceneBlob = await store.read("raw/test-room-1/board.excalidraw")
      expect(roomSceneBlob).not.toBeNull()
      const roomScene = JSON.parse(await roomSceneBlob!.text()) as { elements: Array<{ id?: string }> }
      expect(roomScene.elements.map((element) => element.id)).toEqual(
        boardScene.elements.map((element) => element.id),
      )
    }, { timeout: 5000, interval: 10 })

    await vi.waitFor(() => {
      const err = document.querySelector(".st-err")
      expect(err?.textContent ?? "").not.toContain("Formato non supportato")
      expect(err?.textContent ?? "").not.toContain("Caricamento non riuscito")
    }, { timeout: 5000, interval: 10 })

    await vi.waitFor(() => {
      const updateSceneElementIds = mockExcalidrawHarness.updateSceneCalls.map((scene) =>
        scene.elements?.map((element) => element.id),
      )
      expect(updateSceneElementIds).toContainEqual(boardScene.elements.map((element) => element.id))
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("errore durante l'import (pdfToImages rigetta): risuperficia il messaggio nel chip st-err", async () => {
    const { pdfToImages } = await import("../loadFile")
    vi.mocked(pdfToImages).mockRejectedValueOnce(new Error("pdf corrotto"))

    const { root, input } = await mountRoomAndGetFileInput()

    selectFile(input, new File(["%PDF-1.4"], "lez.pdf", { type: "application/pdf" }))

    await vi.waitFor(() => {
      const err = document.querySelector(".st-err")
      expect(err?.textContent).toContain("Caricamento non riuscito")
      expect(err?.textContent).toContain("pdf corrotto")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("import PDF registra journal.pdf.imported con evidence missing nel path della room", async () => {
    const { pdfToImages } = await import("../loadFile")
    vi.mocked(pdfToImages).mockResolvedValueOnce([
      {
        dataURL: "data:image/png;base64,cDE=",
        width: 800,
        height: 1000,
        page: 1,
        totalPages: 2,
        documentId: "document:sha256:abc123",
        documentName: "manuale.pdf",
      },
      {
        dataURL: "data:image/png;base64,cDI=",
        width: 800,
        height: 1000,
        page: 2,
        totalPages: 2,
        documentId: "document:sha256:abc123",
        documentName: "manuale.pdf",
      },
    ])

    const { root, input, store } = await mountRoomAndGetFileInput()

    selectFile(input, new File(["%PDF-1.4"], "manuale.pdf", { type: "application/pdf" }))

    await vi.waitFor(() => {
      const recorder = (window as any).__MAESTRO_TEST__?.recorder
      expect(recorder?.getBuffer().filter((ev: any) => ev.type === "pdf.page.view")).toHaveLength(2)
    }, { timeout: 5000, interval: 10 })

    await (window as any).__MAESTRO_TEST__.recorder.flush()
    const blob = await store.read(roomPaths("test-room-1").journal)
    const events = (await blob!.text())
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line))

    expect(await store.read(PATHS.JOURNAL)).toBeNull()
    expect(events.map((event) => event.kind)).toEqual([
      "journal.pdf.imported",
      "journal.pdf.imported",
    ])
    expect(events.map((event) => event.evidence)).toEqual([
      [{ ref: "pdf:document%3Asha256%3Aabc123#page=1", resolution: "missing" }],
      [{ ref: "pdf:document%3Asha256%3Aabc123#page=2", resolution: "missing" }],
    ])
    expect(events.map((event) => event.payload.documentId)).toEqual([
      "document:sha256:abc123",
      "document:sha256:abc123",
    ])
    expect(events.map((event) => event.payload.page)).toEqual([1, 2])
    expect(events.map((event) => event.payload.totalPages)).toEqual([2, 2])
    expect(events.map((event) => event.payload.documentName)).toEqual(["manuale.pdf", "manuale.pdf"])

    root.unmount()
  })

  // --- Bridge Journal → LessonOS (LANE P5): registry + call-site promoteJournalToLessonOs ---

  function pdfPage(documentId: string, page: number) {
    return {
      dataURL: "data:image/png;base64,cDE=",
      width: 800,
      height: 1000,
      page,
      totalPages: 40,
      documentId,
      documentName: "manuale.pdf",
    }
  }

  /** Monta Room, aspetta LessonOS pronto, importa un PDF e ritorna l'harness */
  async function importPdfAndGetHarness(pages: ReturnType<typeof pdfPage>[]) {
    const { pdfToImages } = await import("../loadFile")
    vi.mocked(pdfToImages).mockResolvedValueOnce(pages)
    const { root, input, store } = await mountRoomAndGetFileInput()
    await vi.waitFor(() => {
      expect((window as any).__MAESTRO_TEST__?.lessonOs?.current?.store).toBeTruthy()
    }, { timeout: 5000, interval: 10 })
    selectFile(input, new File(["%PDF-1.4"], "manuale.pdf", { type: "application/pdf" }))
    await vi.waitFor(() => {
      const recorder = (window as any).__MAESTRO_TEST__?.recorder
      expect(
        recorder?.getBuffer().filter((ev: any) => ev.type === "pdf.page.view").length,
      ).toBeGreaterThan(0)
    }, { timeout: 5000, interval: 10 })
    return { root, store, harness: (window as any).__MAESTRO_TEST__ }
  }

  it("bridge LessonOS: un PDF soltanto importato non diventa material.cited verificato", async () => {
    const { root, harness } = await importPdfAndGetHarness([pdfPage("document:sha256:abc123", 3)])

    await harness.promoteJournalToLessonOs()

    const all = await harness.lessonOs.current.store.readAll()
    const cited = all.filter((e: any) => e.kind === "material.cited")
    expect(cited).toHaveLength(0)

    root.unmount()
  })

  it("bridge LessonOS: replay ripetuto di soli import resta privo di fatti verificati", async () => {
    const { root, harness } = await importPdfAndGetHarness([pdfPage("document:sha256:abc123", 5)])

    await harness.promoteJournalToLessonOs()
    const after1 = (await harness.lessonOs.current.store.readAll()).length
    await harness.promoteJournalToLessonOs()
    const after2 = (await harness.lessonOs.current.store.readAll()).length

    expect(after1).toBe(1) // solo lesson.started
    expect(after2).toBe(after1)

    root.unmount()
  })

  it("bridge LessonOS: documento NON riconosciuto → zero material.cited, journal intatto", async () => {
    const { root, store, harness } = await importPdfAndGetHarness([pdfPage("document:sha256:zzz", 3)])

    await harness.promoteJournalToLessonOs()

    const all = await harness.lessonOs.current.store.readAll()
    expect(all.filter((e: any) => e.kind === "material.cited")).toHaveLength(0)
    // il journal registra comunque l'import missing nel path canonico della room
    const blob = await store.read(roomPaths("test-room-1").journal)
    expect(blob).not.toBeNull()
    expect(await blob!.text()).toContain('"journal.pdf.imported"')

    root.unmount()
  })

  it("LessonOS session producer: Room appende lesson.started al mount e lesson.ended all'unmount", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    let lessonStore: { readAll(): Promise<Array<{ kind: string; room?: string; evidence: string[] }>> }
    await vi.waitFor(async () => {
      lessonStore = (window as any).__MAESTRO_TEST__?.lessonOs?.current?.store
      expect(lessonStore).toBeTruthy()
      const all = await lessonStore.readAll()
      expect(all.some((event) => event.kind === "lesson.started" && event.room === "test-room-1")).toBe(true)
    }, { timeout: 5000, interval: 10 })

    root.unmount()

    await vi.waitFor(async () => {
      const all = await lessonStore.readAll()
      const ended = all.find((event) => event.kind === "lesson.ended" && event.room === "test-room-1")
      expect(ended).toBeTruthy()
      expect(ended!.evidence.some((ref) => ref.startsWith("lesson:test-room-1@"))).toBe(true)
    }, { timeout: 5000, interval: 10 })
  })
})

describe("Founder Beta: audio fuori perimetro", () => {
  it("non espone alcuna azione capace di chiedere il permesso microfono", async () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal("navigator", { ...navigator, mediaDevices: { getUserMedia } })
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    expect(Array.from(document.querySelectorAll("button")).some(
      (button) => button.textContent?.trim() === "audio",
    )).toBe(false)
    expect(getUserMedia).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
    root.unmount()
  })
})

describe("insertMath: il fallimento di latexToImage usa il chip d'errore (offline = supportato)", () => {
  it("latexToImage rigetta (CDN MathJax giu): risuperficia il messaggio nel chip st-err", async () => {
    capturedOnInsert = null
    const { latexToImage } = await import("../latexToImage")
    vi.mocked(latexToImage).mockRejectedValueOnce(new Error("MathJax CDN load failed"))

    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // apiRef impostato dopo il mount di Excalidraw; insertMath esce subito se null.
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    // Apre il composer (bottone "formula") -> il mock cattura onInsert=insertMath
    const formulaBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "formula")!
    formulaBtn.click()

    await vi.waitFor(() => {
      expect(capturedOnInsert).toBeTypeOf("function")
    }, { timeout: 5000, interval: 10 })

    capturedOnInsert!("x^2")

    await vi.waitFor(() => {
      const err = document.querySelector(".st-err")
      expect(err?.textContent).toContain("Inserimento formula non riuscito")
      expect(err?.textContent).toContain("MathJax CDN load failed")
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })
})
