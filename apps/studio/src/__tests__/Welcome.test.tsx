// @vitest-environment jsdom
// MAESTRO-Studio — S-DESIGN-1(d): WelcomeScreen MAESTRO italiano dentro Room.
// Il mock di Excalidraw RENDERIZZA i children: quello che assertiamo è il
// markup welcome che Room monta davvero (heading, brand, guida, hint).

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRoot } from "react-dom/client"
import type { ReactNode } from "react"
import type { WorkspaceStore } from "../store/WorkspaceStore"

const Pass = ({ children }: { children?: ReactNode }) => <div>{children}</div>

vi.mock("@excalidraw/excalidraw", () => ({
  Excalidraw: (props: { children?: ReactNode }) => (
    <div data-testid="excalidraw-mock">{props.children}</div>
  ),
  MainMenu: Object.assign(({ children }: { children?: ReactNode }) => <div data-testid="main-menu">{children}</div>, {
    DefaultItems: {
      ClearCanvas: () => <button>pulisci la lavagna</button>,
      SaveAsImage: () => <button>salva come immagine</button>,
    },
  }),
  WelcomeScreen: Object.assign(Pass, {
    Center: Object.assign(Pass, {
      Heading: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
      Logo: Pass,
    }),
    Hints: { ToolbarHint: Pass, MenuHint: Pass, HelpHint: Pass },
  }),
  FONT_FAMILY: { Nunito: 6 },
  convertToExcalidrawElements: vi.fn((els: unknown) => els),
  serializeAsJSON: vi.fn(() => "{}"),
}))
vi.mock("@excalidraw/excalidraw/index.css", () => ({}))
vi.mock("../MathComposer", () => ({ default: () => null }))
vi.mock("../latexToImage", () => ({ latexToImage: vi.fn() }))
vi.mock("../loadFile", () => ({ imageToDataURL: vi.fn(), pdfToImages: vi.fn() }))

const fakeStore = {
  registerActiveLesson: async (lessonId: string) => {
    const completion = Promise.resolve()
    return { lessonId, release: () => completion }
  },
  init: async () => {},
  loadScene: async () => null,
  saveScene: async () => {},
  storageUsage: async () => null,
  exportLesson: async () => new Blob(),
} as unknown as WorkspaceStore

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
  globalThis.location.hash = "#welcome-room"
  document.body.innerHTML = '<div id="root"></div>'
})

async function mountRoom() {
  const root = createRoot(document.getElementById("root")!)
  const RoomModule = await import("../Room")
  root.render(<RoomModule.default store={fakeStore} />)
  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="excalidraw-mock"]')).not.toBeNull()
  }, { timeout: 1000, interval: 10 })
  return root
}

describe("WelcomeScreen MAESTRO (§3.A)", () => {
  it("heading 'La lavagna che ricorda la tua lezione' dentro la lavagna", async () => {
    const root = await mountRoom()
    expect(document.body.textContent).toMatch(/lavagna che ricorda la tua lezione/i)
    root.unmount()
  })

  it("wordmark serif + punto blu dentro il welcome (.st-welcome-brand)", async () => {
    const root = await mountRoom()
    const brand = document.querySelector('[data-testid="excalidraw-mock"] .st-welcome-brand')
    expect(brand).not.toBeNull()
    expect(brand!.textContent).toContain("Ardesia")
    expect(brand!.querySelector(".st-bdot")).not.toBeNull()
    root.unmount()
  })

  it("3 righe guida italiane col lessico onesto ('si salva', mai 'registra' per lo scritto)", async () => {
    const root = await mountRoom()
    const guide = document.querySelector(".st-welcome-guide")
    expect(guide).not.toBeNull()
    const lines = guide!.querySelectorAll("p")
    expect(lines).toHaveLength(3)
    expect(guide!.textContent).toContain("si salva da solo")
    // "registra*" è lessico RISERVATO all'audio: lo scritto si salva
    const written = Array.from(lines).filter((p) => !p.textContent!.includes("audio"))
    for (const p of written) {
      expect(p.textContent).not.toMatch(/registr/i)
    }
    root.unmount()
  })

  it("hint toolbar 'Scegli una penna e inizia'", async () => {
    const root = await mountRoom()
    expect(document.body.textContent).toContain("Scegli una penna e inizia")
    root.unmount()
  })

  it("markup di Room: zero 'Excalidraw'/excalidraw.com nel JSX NOSTRO (la UI del pacchetto è mockata: il branding del pacchetto reale è fuori scope qui, copre la copia che scriviamo noi)", async () => {
    const root = await mountRoom()
    expect(document.body.textContent).not.toContain("Excalidraw")
    expect(document.body.innerHTML).not.toContain("excalidraw.com")
    root.unmount()
  })

  it("MainMenu custom: esattamente 2 DefaultItems (ClearCanvas + SaveAsImage), zero extra", async () => {
    const root = await mountRoom()
    const menu = document.querySelector('[data-testid="main-menu"]')
    expect(menu).not.toBeNull()
    // i label dei bottoni sono finzione del mock: qui contiamo SOLO che Room
    // renderizzi 2 item, i testi reali vengono dal locale it-IT di Excalidraw
    expect(menu!.querySelectorAll("button")).toHaveLength(2)
    root.unmount()
  })
})
