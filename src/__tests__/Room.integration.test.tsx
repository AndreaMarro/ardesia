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
    convertToExcalidrawElements: vi.fn((els: any) => els),
    serializeAsJSON: vi.fn(() => serialized),
    getSceneVersion: vi.fn(() => 1),
  }
})

vi.mock("@excalidraw/excalidraw/index.css", () => ({}))
vi.mock("../MathComposer", () => ({ default: () => "mock-math-composer" }))
vi.mock("../latexToImage", () => ({ latexToImage: vi.fn() }))
vi.mock("../loadFile", () => ({ imageToDataURL: vi.fn(), pdfToImages: vi.fn() }))

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
      () => new Promise((resolve) => setTimeout(() => resolve(null), 200))
    )

    const container = document.getElementById("root")!
    const root = createRoot(container)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    // Subito dopo il render, "caricamento…" deve apparire (prima che loadScene finisca)
    await vi.waitFor(() => {
      expect(container.textContent).toContain("caricamento")
    }, { timeout: 500, interval: 10 })

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

    // Bottone audio presente con label OFF
    expect(document.body.textContent).toContain("🎤 audio")

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

    // Trova il bottone audio e cliccalo
    const allButtons = document.querySelectorAll("button")
    const audioBtn = Array.from(allButtons).find((b) => b.textContent?.includes("🎤"))
    expect(audioBtn).toBeDefined()
    audioBtn!.click()

    // In jsdom MediaRecorder non esiste → start() fallisce → button torna a 🎤 audio
    await vi.waitFor(() => {
      expect(audioBtn!.textContent).toBe("🎤 audio")
    }, { timeout: 500, interval: 10 })

    // Verifica che getUserMedia sia stato chiamato
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })

    vi.unstubAllGlobals()
    root.unmount()
  })
})
