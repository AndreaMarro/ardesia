// @vitest-environment jsdom
// MAESTRO-Studio — Test integrazione Room.tsx ↔ WorkspaceStore
// Verifica che Room persista e carichi correttamente via WorkspaceStore,
// e che gli errori di quota siano visibili all'utente.

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRoot } from "react-dom/client"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { readFileSync } from "node:fs"
import { PATHS, type WorkspaceDriver, type FileEntry } from "../store/types"
import { hasEmoji } from "./emojiGuard"
import { createMultiPostitWorkbenchPostits } from "../design/multiPostitWorkbenchModel"
import { createPluginPostitBoardScene } from "../design/multiPostitBoardPersistence"
import { exportLesson } from "../store/lessonBundle"

// --- Mocks per Excalidraw e dipendenze pesanti ---

const mockExcalidrawHarness = vi.hoisted(() => ({
  updateSceneCalls: [] as Array<{ elements?: Array<{ id?: string }> }>,
  scrollToContentCalls: [] as Array<{ elements: Array<{ id?: string }>; options?: unknown }>,
  activeToolCalls: [] as Array<{ type: string }>,
  sceneElements: [] as Array<{ id?: string }>,
  appState: { zoom: { value: 1 } },
}))

vi.mock("@excalidraw/excalidraw", () => {
  let serialized = JSON.stringify({ type: "excalidraw", elements: [], v: 1 })
  return {
    Excalidraw: vi.fn((props: any) => {
      if (props.excalidrawAPI) {
        setTimeout(() => {
          const unsubs: Array<() => void> = []
          props.excalidrawAPI({
            getSceneElements: vi.fn(() => mockExcalidrawHarness.sceneElements),
            getAppState: vi.fn(() => mockExcalidrawHarness.appState),
            updateScene: vi.fn((scene: { elements?: Array<{ id?: string }> }) => {
              mockExcalidrawHarness.updateSceneCalls.push(scene)
            }),
            addFiles: vi.fn(),
            scrollToContent: vi.fn((elements: Array<{ id?: string }>, options?: unknown) => {
              mockExcalidrawHarness.scrollToContentCalls.push({ elements, options })
            }),
            setActiveTool: vi.fn((tool: { type: string }) => {
              mockExcalidrawHarness.activeToolCalls.push(tool)
            }),
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
  window.history.replaceState(null, "", "/#test-room-1")
  document.body.innerHTML = '<div id="root"></div>'
  mockExcalidrawHarness.updateSceneCalls = []
  mockExcalidrawHarness.scrollToContentCalls = []
  mockExcalidrawHarness.activeToolCalls = []
  mockExcalidrawHarness.sceneElements = []
  mockExcalidrawHarness.appState = { zoom: { value: 1 } }
  document.body.removeAttribute("data-mock-excalidraw-api")
  vi.clearAllMocks()
})

async function launcherAction(label: string): Promise<HTMLButtonElement> {
  const launcher = document.querySelector('[data-orbit-action="launcher"]') as HTMLButtonElement | null
  expect(launcher).not.toBeNull()
  if (!document.querySelector(".st-launcher-panel")) launcher!.click()
  let action: HTMLButtonElement | null = null
  await vi.waitFor(() => {
    action = Array.from(document.querySelectorAll<HTMLButtonElement>(".st-launcher-item"))
      .find((button) => button.querySelector("strong")?.textContent === label) ?? null
    expect(action).not.toBeNull()
  }, { timeout: 5000, interval: 10 })
  return action!
}

describe("Room ↔ WorkspaceStore integration", () => {
  it("apre il launcher condiviso quando la Library porta l'intento iniziale", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    window.history.replaceState(null, "", "/?crea=1#library-room")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    expect(await screen.findByRole("dialog", { name: "Cerca e crea" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Cerca e crea" }).getAttribute("aria-expanded")).toBe("true")
    expect(mockExcalidrawHarness.updateSceneCalls).toHaveLength(0)

    root.unmount()
  })

  it("espone la lavagna vuota e apre gli strumenti radiali reali", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const container = document.getElementById("root")!
    const root = createRoot(container)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(container.querySelector('[data-board-state="empty"]')).toBeTruthy()
      expect(container.querySelector("[data-radial-tools]")).toBeTruthy()
    }, { timeout: 5000, interval: 10 })

    fireEvent.click(screen.getByRole("button", { name: "Inizia da qui" }))
    expect(screen.getByRole("dialog", { name: "Cerca e crea" })).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Apri strumenti" }))
    expect(screen.getByRole("button", { name: "Aggiungi plugin" })).toBeTruthy()
    await vi.waitFor(() => {
      expect(document.body.getAttribute("data-mock-excalidraw-api")).toBe("1")
    }, { timeout: 5000, interval: 10 })
    fireEvent.click(screen.getByRole("button", { name: "Penna" }))
    expect(mockExcalidrawHarness.activeToolCalls.at(-1)).toEqual({ type: "freedraw" })
    expect(container.textContent).not.toMatch(/FQBN|capability|provider diagnostics|keyboard scope/i)

    root.unmount()
  })

  it("deriva lo stato popolato dagli elementi vivi della scena", async () => {
    const { store } = await createMockStore()
    const liveElement = { id: "nota-live", type: "text", isDeleted: false }
    vi.spyOn(store, "loadScene").mockResolvedValue(JSON.stringify({
      elements: [liveElement, { id: "nota-cancellata", type: "text", isDeleted: true }],
      appState: {},
      files: {},
    }))

    const container = document.getElementById("root")!
    const root = createRoot(container)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(container.querySelector('[data-board-state="populated"]')).toBeTruthy()
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("mantiene diagnostica e provenienza fuori dalla copia primaria dei post-it", async () => {
    const {
      createArduinoToolchainEmbedElement,
      createElabTutorLinkedEmbedElement,
      createToolEmbedElement,
      renderToolCanvasEmbeddable,
    } = await import("../toolhost/ToolCanvasEmbeddable")
    const elements = [
      createToolEmbedElement(),
      createArduinoToolchainEmbedElement(),
      createElabTutorLinkedEmbedElement(),
    ]

    for (const element of elements) {
      const view = renderToolCanvasEmbeddable(element)
      expect(view).not.toBeNull()
      const rendered = render(view!)
      const postit = rendered.container.querySelector("[data-plugin-instance-id]")
      const technicalDetails = postit?.querySelector("details[data-plugin-technical-details]")
      const visibleClone = postit?.cloneNode(true) as HTMLElement | undefined
      visibleClone?.querySelectorAll("details").forEach((details) => details.remove())
      const primaryCopy = visibleClone?.textContent ?? ""
      expect(postit?.getAttribute("data-motion-state")).toBe("settled")
      expect(primaryCopy).toBeTruthy()
      expect(primaryCopy).not.toMatch(/FQBN|capabilit|provider|diagnostics?|instance(?:-id)?|sha(?:256)?|image\/[a-z]+|application\/[a-z]+|scope|provenance|maestro-tool|io\.[a-z]/i)
      expect(technicalDetails).toBeTruthy()
      expect(technicalDetails?.hasAttribute("open")).toBe(false)
      rendered.unmount()
    }
  })

  it("inserisce i tre PluginInstance come post-it compatti sulla stessa riga", async () => {
    const {
      buildArduinoToolchainInsert,
      buildElabTutorLinkedInsert,
      buildSimulationInsert,
    } = await import("../toolhost/ToolCanvasEmbeddable")
    const simulation = buildSimulationInsert([])!
    const arduino = buildArduinoToolchainInsert([simulation.embed])!
    const tutor = buildElabTutorLinkedInsert([simulation.embed, arduino.embed])!
    const geometry = [simulation.embed, arduino.embed, tutor.embed].map((embed) => ({
      x: embed.x,
      y: embed.y,
      width: embed.width,
      height: embed.height,
    }))

    expect(geometry).toEqual([
      { x: 220, y: 56, width: 300, height: 180 },
      { x: 544, y: 56, width: 300, height: 180 },
      { x: 868, y: 56, width: 300, height: 180 },
    ])
  })

  it("espande e riduce il runtime Simulation della stessa istanza senza duplicarlo", async () => {
    const {
      createReferenceSimulationScene,
      createToolEmbedElement,
      renderToolCanvasEmbeddable,
    } = await import("../toolhost/ToolCanvasEmbeddable")
    const scene = { ...createReferenceSimulationScene(), title: "LED reale della scena" }
    const element = createToolEmbedElement({
      embedId: "simulation-same-instance",
      state: { kind: "simulation-scene-v1", scene },
    })
    const rendered = render(renderToolCanvasEmbeddable(element)!)

    const anchor = rendered.container.querySelector('[data-plugin-instance-id="simulation-same-instance"]')
    expect(anchor?.textContent).toContain("LED reale della scena")
    expect(document.querySelectorAll('[data-plugin-instance-id="simulation-same-instance"]')).toHaveLength(1)

    fireEvent.click(rendered.getByRole("button", { name: "Espandi LED reale della scena" }))
    const overlay = await screen.findByRole("dialog", { name: "LED reale della scena" })
    expect(overlay.getAttribute("data-plugin-runtime-instance-id")).toBe("simulation-same-instance")
    expect(document.querySelectorAll('[data-plugin-instance-id="simulation-same-instance"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-simulation-surface="elab-core-canvas"]')).toHaveLength(1)

    fireEvent.click(screen.getByRole("button", { name: "Riduci LED reale della scena" }))
    expect(screen.queryByRole("dialog", { name: "LED reale della scena" })).toBeNull()
    expect(rendered.container.querySelector('[data-plugin-instance-id="simulation-same-instance"]')?.textContent).toContain("LED reale della scena")
    rendered.unmount()
  })

  it("deriva le etichette compatte dallo stato reale di Simulation, Arduino ed ElabTutor", async () => {
    const {
      createArduinoToolchainEmbedElement,
      createElabTutorLinkedEmbedElement,
      createReferenceSimulationScene,
      createToolEmbedElement,
      renderToolCanvasEmbeddable,
    } = await import("../toolhost/ToolCanvasEmbeddable")
    const simulation = createToolEmbedElement({
      state: { kind: "simulation-scene-v1", scene: { ...createReferenceSimulationScene(), title: "Titolo dalla scena" } },
    })
    const arduino = createArduinoToolchainEmbedElement()
    const tutor = createElabTutorLinkedEmbedElement()

    const simulationView = render(renderToolCanvasEmbeddable(simulation)!)
    expect(simulationView.container.textContent).toContain("Titolo dalla scena")
    simulationView.unmount()

    const arduinoView = render(renderToolCanvasEmbeddable(arduino)!)
    expect(arduinoView.container.textContent).toMatch(/Arduino Nano.*\d+ righe/i)
    expect(arduinoView.container.textContent).not.toContain("lampeggio")
    arduinoView.unmount()

    const tutorView = render(renderToolCanvasEmbeddable(tutor)!)
    expect(tutorView.container.textContent).toContain("Circuito collegato")
    expect(tutorView.container.textContent).toContain("Sketch collegato")
    expect(tutorView.container.textContent).toContain("Nota pronta")
    expect(tutorView.container.textContent).not.toContain("Corso base")
    tutorView.unmount()
  })

  it("allinea azione visibile, nome accessibile ed evento ElabTutor", async () => {
    const { createElabTutorLinkedEmbedElement, renderToolCanvasEmbeddable } = await import("../toolhost/ToolCanvasEmbeddable")
    const emitted: Array<{ labels?: { it?: string }; command?: string }> = []
    const rendered = render(renderToolCanvasEmbeddable(createElabTutorLinkedEmbedElement(), {
      emitLessonEvent: (event) => emitted.push(event as { labels?: { it?: string }; command?: string }),
    })!)

    fireEvent.click(rendered.getByRole("button", { name: "Espandi Guida collegata" }))
    const dialog = await screen.findByRole("dialog", { name: "Guida collegata" })
    const action = within(dialog).getByRole("button", { name: "Invia comando alla simulazione" })
    expect(action.textContent).toBe("Invia comando alla simulazione")
    fireEvent.click(action)
    expect(emitted.at(-1)).toMatchObject({
      command: "simulation.command",
      labels: { it: "Invia comando alla simulazione" },
    })
    rendered.unmount()
  })

  it("ordina il trigger radiale prima degli strumenti e lascia il focus alla ricerca plugin", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    const trigger = await screen.findByRole("button", { name: "Apri strumenti" })
    fireEvent.click(trigger)
    const select = screen.getByRole("button", { name: "Seleziona" })
    expect(trigger.compareDocumentPosition(select) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Aggiungi plugin" }))
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("searchbox"))
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

  it("mantiene i target della shell, dell'orbita e dei dettagli ad almeno 44px", async () => {
    const css = readFileSync("src/index.css", "utf8")
    expect(css).toMatch(/\.st-shell-launcher\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s)
    expect(css).not.toMatch(/\.st-radial-tools\s*\{[^}]*transform:\s*scale\(/s)
    const reducedMotion = css.slice(
      css.indexOf("@media (prefers-reduced-motion: reduce) {", css.indexOf("/* ── Library")),
      css.indexOf("/* La shell approvata affida la creazione all'orbita"),
    )
    expect(reducedMotion).toMatch(/\.st-library-shelf,\s*\.st-library-asset\s*\{[^}]*animation:\s*none !important;[^}]*transform:\s*none !important;/s)
    expect(reducedMotion).toMatch(/\.st-shell-launcher:hover,\s*\.st-shell-launcher\[aria-expanded="true"\][^{]*\{[^}]*transform:\s*none !important;/s)
    expect(css).not.toMatch(/@media \(max-width:\s*768px\) and \(min-height:\s*800px\)[\s\S]*?\.st-view-nav\s*\{[^}]*bottom:/)
    expect(css).toMatch(/@media \(max-width:\s*768px\)[\s\S]*?\.st-library-inner\s*\{[^}]*padding:\s*var\(--m-sp-4\) var\(--m-sp-4\) 180px 140px;/)

    const { createArduinoToolchainEmbedElement, renderToolCanvasEmbeddable } = await import("../toolhost/ToolCanvasEmbeddable")
    const rendered = render(renderToolCanvasEmbeddable(createArduinoToolchainEmbedElement())!)
    expect(rendered.getByRole("button", { name: /Espandi/ }).style.minHeight).toBe("44px")
    expect(rendered.container.querySelector("summary")?.style.minHeight).toBe("44px")
    rendered.unmount()
  })

  it("riframe i plugin reali quando il viewport passa a iPad", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const plugins = [
      { id: "sim-a", link: "maestro-tool://io.ardesia.simulation/sim-a" },
      { id: "arduino-a", link: "maestro-tool://io.ardesia.arduino-toolchain/arduino-a" },
      { id: "tutor-a", link: "maestro-tool://io.ardesia.elabtutor/tutor-a" },
    ]
    mockExcalidrawHarness.sceneElements = plugins

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)
    await vi.waitFor(() => expect(document.body.getAttribute("data-mock-excalidraw-api")).toBe("1"))
    mockExcalidrawHarness.scrollToContentCalls = []

    const originalWidth = window.innerWidth
    Object.defineProperty(window, "innerWidth", { value: 768, configurable: true })
    fireEvent(window, new Event("resize"))

    await vi.waitFor(() => {
      expect(mockExcalidrawHarness.scrollToContentCalls).toContainEqual({
        elements: plugins,
        options: {
          fitToContent: true,
          animate: false,
          viewportZoomFactor: 1,
          canvasOffsets: { left: 140, right: 16, top: 58, bottom: 0 },
        },
      })
      expect(mockExcalidrawHarness.updateSceneCalls).toContainEqual({
        appState: expect.objectContaining({ zoom: { value: 0.64 } }),
      })
    })
    Object.defineProperty(window, "innerWidth", { value: originalWidth, configurable: true })
    root.unmount()
  })

  it("focus query centra e seleziona l'elemento richiesto dalla Library", async () => {
    const { store } = await createMockStore()
    const element = { id: "postit-focus", type: "rectangle" }
    mockExcalidrawHarness.sceneElements = [element]
    vi.spyOn(store, "loadScene").mockResolvedValue(JSON.stringify({ elements: [element], appState: {}, files: {} }))
    window.history.replaceState(null, "", "/?focus=postit-focus#focus-room")

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(mockExcalidrawHarness.updateSceneCalls).toContainEqual({
        appState: { selectedElementIds: { "postit-focus": true } },
      })
      expect(mockExcalidrawHarness.scrollToContentCalls).toContainEqual({
        elements: [element],
        options: { fitToContent: false, animate: false },
      })
    }, { timeout: 5000, interval: 10 })

    root.unmount()
  })

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

  it("mostra 'apro' durante il load iniziale", async () => {
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

    // Lo stato compatto resta leggibile senza esporre dettagli di storage.
    await vi.waitFor(() => {
      const el = container.querySelector(".st-orbit-save")
      expect(el?.textContent).toContain("apro")
    }, { timeout: 300, interval: 50 })

    // In questo stato, Excalidraw NON è ancora montato (condizionale su !loading)
    expect(container.textContent).not.toContain("mock-excalidraw")

    // Aspetta che loadScene si risolva e loading diventi false
    await vi.waitFor(() => {
      expect(container.querySelector(".st-orbit-save")?.textContent).not.toContain("apro")
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

  // --- Audio toggle tests ---

  it("launcher mostra registrazione audio default OFF", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const audioBtn = await launcherAction("Registra audio")
    expect(audioBtn.getAttribute("aria-label")).toMatch(/microfono del docente/i)
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
    }, { timeout: 5000, interval: 10 })

    const audioBtn = await launcherAction("Registra audio")
    audioBtn.click()

    // Verifica che getUserMedia sia stato chiamato
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })

    vi.unstubAllGlobals()
    root.unmount()
  })

  // --- T2b punto 4: indicatore quota REALE in header ---

  it("shell e launcher descrivono onestamente il salvataggio locale", async () => {
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.querySelector(".st-orbit-save")?.getAttribute("title")).toMatch(/browser/i)
    }, { timeout: 5000, interval: 10 })
    expect(await launcherAction("Scegli cartella")).toBeDefined()

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
    // cosa fare: seguire la diretta su Meet
    expect(empty.querySelector(".st-state-hint")?.textContent).toMatch(/diretta su Meet/i)
    expect(hasEmoji(empty.textContent ?? "")).toBe(false)

    root.unmount()
  })

  it("shareUrl per vista docente: 'condividi' copia un link con ?vista=studente", async () => {
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

    let shareBtn: HTMLButtonElement | null = null
    await vi.waitFor(() => {
      shareBtn = document.querySelector('[data-orbit-action="share"]') as HTMLButtonElement | null
      expect(shareBtn).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    shareBtn!.click()

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1)
      const copiedUrl = writeText.mock.calls[0]![0]
      expect(copiedUrl).toContain("?vista=studente")
      // L'hash della stanza resta nel link (stessa stanza, vista sola-lettura)
      expect(copiedUrl).toMatch(/\?vista=studente#.+/)
    }, { timeout: 5000, interval: 10 })

    root.unmount()
    // Ripristina il clipboard originale: niente contaminazione dei test successivi
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", originalClipboard)
    } else {
      delete (navigator as any).clipboard
    }
  })

  it("condividi: se la copia clipboard fallisce, mostra l'errore e non segna 'copiato'", async () => {
    const { isStudentView } = await import("../store/studentView")
    vi.mocked(isStudentView).mockReturnValue(false)
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)

    const writeText = vi.fn((_text: string) =>
      Promise.reject(new Error("permesso negato")),
    )
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard")
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })

    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    let shareBtn: HTMLButtonElement | null = null
    await vi.waitFor(() => {
      shareBtn = document.querySelector('[data-orbit-action="share"]') as HTMLButtonElement | null
      expect(shareBtn).not.toBeNull()
    }, { timeout: 5000, interval: 10 })

    shareBtn!.click()

    // La reiezione di writeText viene risuperficiata come errore, non ingoiata.
    await vi.waitFor(() => {
      const err = document.querySelector(".st-err")
      expect(err?.textContent).toContain("Copia del link non riuscita")
      expect(err?.textContent).toContain("permesso negato")
    }, { timeout: 5000, interval: 10 })
    // Su fallimento il bottone NON deve passare a 'copiato'.
    expect(
      Array.from(document.querySelectorAll("button")).some(
        (b) => b.textContent?.trim() === "copiato",
      ),
    ).toBe(false)

    root.unmount()
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

    const lezioniBtn = await launcherAction("Lezioni")
    lezioniBtn.click()

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

    const lezioniBtn = await launcherAction("Lezioni")
    lezioniBtn.click()

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

    const launcher = document.querySelector('[data-orbit-action="launcher"]') as HTMLButtonElement
    const lezioniBtn = await launcherAction("Lezioni")
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
    expect(document.activeElement).toBe(launcher)

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

    const mediaBtn = await launcherAction("Media")
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
    await sourceStore.saveScene("source-room", JSON.stringify(boardScene))
    const bundle = await exportLesson(sourceStore, "source-room")

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

  it("import PDF registra pdf.page.view con identita documento esplicita nel journal", async () => {
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
    const blob = await store.read(PATHS.JOURNAL)
    const events = (await blob!.text())
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line))

    expect(events.map((event) => event.type)).toEqual(["pdf.page.view", "pdf.page.view"])
    expect(events.map((event) => event.documentId)).toEqual([
      "document:sha256:abc123",
      "document:sha256:abc123",
    ])
    expect(events.map((event) => event.page)).toEqual([1, 2])
    expect(events.map((event) => event.totalPages)).toEqual([2, 2])
    expect(events.map((event) => event.documentName)).toEqual(["manuale.pdf", "manuale.pdf"])

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

  it("bridge LessonOS: pdf riconosciuto dal registry → esattamente UN material.cited con evidence doppia", async () => {
    const { root, harness } = await importPdfAndGetHarness([pdfPage("document:sha256:abc123", 3)])

    await harness.promoteJournalToLessonOs()

    const all = await harness.lessonOs.current.store.readAll()
    const cited = all.filter((e: any) => e.kind === "material.cited")
    expect(cited).toHaveLength(1)
    expect(cited[0].materialId).toBe("manual:vol1:p3")
    expect(cited[0].evidence).toContain("manual:vol1:p3")
    expect(cited[0].evidence.some((r: string) => /^journal:pdf\.page\.view@\d+$/.test(r))).toBe(true)
    expect(cited[0].evidence.some((r: string) => r.startsWith("lesson:"))).toBe(true)

    root.unmount()
  })

  it("bridge LessonOS: replay completo → nessun duplicato (cursore lastPromotedJournalT)", async () => {
    const { root, harness } = await importPdfAndGetHarness([pdfPage("document:sha256:abc123", 5)])

    await harness.promoteJournalToLessonOs()
    const after1 = (await harness.lessonOs.current.store.readAll()).length
    await harness.promoteJournalToLessonOs()
    const after2 = (await harness.lessonOs.current.store.readAll()).length

    expect(after1).toBeGreaterThan(0)
    expect(after2).toBe(after1)

    root.unmount()
  })

  it("bridge LessonOS: documento NON riconosciuto → zero material.cited, journal intatto", async () => {
    const { root, store, harness } = await importPdfAndGetHarness([pdfPage("document:sha256:zzz", 3)])

    await harness.promoteJournalToLessonOs()

    const all = await harness.lessonOs.current.store.readAll()
    expect(all.filter((e: any) => e.kind === "material.cited")).toHaveLength(0)
    // il journal registra comunque pdf.page.view (promote flusha prima di leggere)
    const blob = await store.read(PATHS.JOURNAL)
    expect(blob).not.toBeNull()
    expect(await blob!.text()).toContain('"pdf.page.view"')

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

describe("toggleAudio: il microfono negato usa il chip d'errore invece di spegnersi muto", () => {
  it("getUserMedia non disponibile (permesso negato): risuperficia nel chip st-err", async () => {
    // jsdom non espone navigator.mediaDevices.getUserMedia -> AudioRecorder.start()
    // cattura il fallimento e azzera consent: e' esattamente il path permesso-negato.
    const { store } = await createMockStore()
    vi.spyOn(store, "loadScene").mockResolvedValue(null)
    const root = createRoot(document.getElementById("root")!)
    const RoomModule = await import("../Room")
    root.render(<RoomModule.default store={store} />)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("mock-excalidraw")
    }, { timeout: 5000, interval: 10 })

    const audioBtn = await launcherAction("Registra audio")
    audioBtn.click()

    await vi.waitFor(() => {
      const err = document.querySelector(".st-err")
      expect(err?.textContent).toContain("Microfono non disponibile")
    }, { timeout: 5000, interval: 10 })

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

    // Apre il composer dal launcher -> il mock cattura onInsert=insertMath.
    const formulaBtn = await launcherAction("Formula")
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
