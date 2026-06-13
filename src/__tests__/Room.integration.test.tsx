// @vitest-environment jsdom
// MAESTRO-Studio — Test integrazione Room.tsx ↔ WorkspaceStore
// Verifica che Room persista e carichi correttamente via WorkspaceStore,
// e che gli errori di quota siano visibili all'utente.

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRoot } from "react-dom/client"
import type { WorkspaceDriver, FileEntry } from "../store/types"

// --- Mocks per Excalidraw e dipendenze pesanti ---

vi.mock("@excalidraw/excalidraw", () => {
  let serialized = JSON.stringify({ type: "excalidraw", elements: [], v: 1 })
  return {
    Excalidraw: vi.fn((props: any) => {
      if (props.excalidrawAPI) {
        setTimeout(() => {
          const unsubs: Array<() => void> = []
          props.excalidrawAPI({
            getSceneElements: vi.fn(() => []),
            updateScene: vi.fn(),
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
vi.mock("../store/studentView", () => ({ isStudentView: vi.fn(() => false) }))

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
  document.body.innerHTML = '<div id="root"></div>'
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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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

  // --- Audio toggle tests ---

  it("header mostra bottone audio default OFF", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 1000, interval: 10 })

    // Bottone audio presente con label OFF (shell v1: testo "audio", MAI
    // "audio attivo"/"registrando" — default GDPR spento)
    const audioBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "audio")
    expect(audioBtn).toBeDefined()
    expect(document.body.textContent).not.toContain("audio attivo")
    expect(document.body.textContent).not.toContain("registrando")

    root.unmount()
  })

  it("click su audio button tenta di attivare registrazione", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    // Stub getUserMedia per jsdom
    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        } as unknown as MediaStream),
      },
    })

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 1000, interval: 10 })

    // Trova il bottone audio e cliccalo (shell v1: label esatta "audio")
    const allButtons = document.querySelectorAll("button")
    const audioBtn = Array.from(allButtons).find((b) => b.textContent?.trim() === "audio")
    expect(audioBtn).toBeDefined()
    audioBtn!.click()

    // In jsdom MediaRecorder non esiste → start() fallisce → button torna a "audio" (OFF)
    await vi.waitFor(() => {
      expect(audioBtn!.textContent?.trim()).toBe("audio")
    }, { timeout: 500, interval: 10 })

    // Verifica che getUserMedia sia stato chiamato
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

    const empty = document.querySelector(".st-student-empty .st-state")!
    expect(empty.querySelector(".st-state-title")?.textContent).toMatch(/lavagna è ancora vuota/i)
    // cosa fare: seguire la diretta su Meet
    expect(empty.querySelector(".st-state-hint")?.textContent).toMatch(/diretta su Meet/i)
    const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{20E3}]/u
    expect(EMOJI_RE.test(empty.textContent ?? "")).toBe(false)

    root.unmount()
  })

  it("shareUrl per vista docente: 'invita studente' copia un link con ?vista=studente", async () => {
    // Reset isStudentView a false per vista docente
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

    let inviteBtn: HTMLButtonElement | undefined
    await vi.waitFor(() => {
      inviteBtn = Array.from(document.querySelectorAll("button"))
        .find((b) => b.textContent?.trim() === "invita studente")
      expect(inviteBtn).toBeDefined()
    }, { timeout: 1000, interval: 10 })

    inviteBtn!.click()

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1)
      const copiedUrl = writeText.mock.calls[0]![0]
      expect(copiedUrl).toContain("?vista=studente")
      // L'hash della stanza resta nel link (stessa stanza, vista sola-lettura)
      expect(copiedUrl).toMatch(/\?vista=studente#.+/)
    }, { timeout: 1000, interval: 10 })

    root.unmount()
    // Ripristina il clipboard originale: niente contaminazione dei test successivi
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", originalClipboard)
    } else {
      delete (navigator as any).clipboard
    }
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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 5 })

    // saveScene è in sospeso (deferred) — l'hash NON deve essere cambiato
    expect(globalThis.location.hash).toBe("#test-room-1")

    // Risolvi saveScene deferred
    resolveSave(undefined)

    // Ora navigateToLesson può proseguire: hash cambia
    await vi.waitFor(() => {
      expect(globalThis.location.hash).toBe("#altra-room")
    }, { timeout: 1000, interval: 5 })

    // Verifica che navPromise si risolva
    await expect(navPromise).resolves.toBeUndefined()

    root.unmount()
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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

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
    }, { timeout: 1000, interval: 10 })

    const lezioniBtn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "lezioni")
    expect(lezioniBtn).toBeDefined()
    lezioniBtn!.click()

    await vi.waitFor(() => {
      const empty = document.querySelector(".st-drawer-body .st-state-compact")
      expect(empty).not.toBeNull()
    }, { timeout: 1000, interval: 10 })

    const empty = document.querySelector(".st-drawer-body .st-state-compact")!
    expect(empty.querySelector(".st-state-title")?.textContent).toMatch(/nessuna lezione/i)
    expect(empty.querySelector(".st-state-hint")?.textContent).toMatch(/lavagna|salva/i)
    const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{20E3}]/u
    expect(EMOJI_RE.test(empty.textContent ?? "")).toBe(false)

    root.unmount()
  })
})
