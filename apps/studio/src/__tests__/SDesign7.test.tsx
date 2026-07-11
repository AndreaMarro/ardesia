// @vitest-environment jsdom
// MAESTRO-Studio — Test S-DESIGN-7: shell responsive <=768px
// launcher unico, navigazione stabile, drawer e recstrip

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRoot, type Root } from "react-dom/client"

// --- Mocks per Excalidraw e dipendenze pesanti ---
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
    convertToExcalidrawElements: (v: any) => v,
    serializeAsJSON: () => "{}",
  }
})

vi.mock("../store/WorkspaceStore", () => ({
  workspaceStore: {
    init: () => Promise.resolve(),
    mode: "localStorage",
    loadScene: () => Promise.resolve(null),
    saveScene: () => Promise.resolve(),
    loadMeta: () => Promise.resolve(null),
    saveMeta: () => Promise.resolve(),
    listRooms: () => Promise.resolve([]),
    connectFolder: () => Promise.resolve(false),
    exportLesson: () => Promise.resolve(new Blob()),
    usage: () => ({ used: 0, quota: 5 * 1024 * 1024 }),
  },
}))

vi.mock("../store/AudioRecorder", () => ({
  AudioRecorder: () => ({
    start: () => Promise.resolve(),
    stop: () => {},
    dispose: () => {},
    recording: false,
    consent: false,
    lastRevoke: Promise.resolve(),
  }),
}))

vi.mock("../store/studentView", () => ({ isStudentView: () => false }))
vi.mock("../store/isRecapView", () => ({ isRecapView: () => false }))
vi.mock("../latexToImage", () => ({ latexToImage: () => Promise.resolve({ dataURL: "", width: 100, height: 50 }) }))
vi.mock("../loadFile", () => ({ imageToDataURL: () => {}, pdfToImages: () => Promise.resolve([]) }))
vi.mock("pdfjs-dist", () => ({}))
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({}))
vi.mock("../design/icons", () => ({
  IconAlert: () => null,
  IconCheck: () => null,
  IconDownload: () => null,
  IconFunction: () => null,
  IconImage: () => null,
  IconLink: () => null,
  IconMic: () => null,
}))
vi.mock("../MathComposer", () => ({ default: () => null }))
vi.mock("../RecapView", () => ({ default: () => null }))

// --- Setup ---
beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
  const store: Record<string, string> = {}
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v },
      removeItem: (k: string) => { delete store[k] },
      clear: () => { for (const k in store) delete store[k] },
      get length() { return Object.keys(store).length },
      key: (i: number) => Object.keys(store)[i] ?? null,
    },
    writable: true,
    configurable: true,
  })
  globalThis.location.hash = "#test-room-7"
})

import Room from "../Room"

describe("S-DESIGN-7 — responsive <=768px", () => {
  async function renderRoom(): Promise<Root> {
    const container = document.getElementById("root")!
    const root = createRoot(container)
    root.render(<Room />)
    // Aspetta che React 19 flush la render
    await vi.waitFor(() => {
      expect(container.textContent).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    return root
  }

  it("renders the shared Studio shell header", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      const bars = document.querySelectorAll(".st-shell-topbar")
      expect(bars.length).toBe(1)
      expect(document.querySelector(".st-name-text")?.textContent).toBe("Lezione senza titolo")
    }, { timeout: 1000, interval: 10 })
    root.unmount()
  })

  it("rende un solo launcher in testata", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      const btns = document.querySelectorAll('[data-orbit-action="launcher"]')
      expect(btns.length).toBe(1)
      expect(btns[0].getAttribute("aria-label")).toBe("Cerca e crea")
    }, { timeout: 1000, interval: 10 })
    root.unmount()
  })

  it("il launcher apre e chiude lo stesso pannello", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-shell-launcher")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const launcher = document.querySelector(".st-shell-launcher") as HTMLButtonElement
    expect(document.querySelector(".st-launcher-panel")).toBeNull()

    launcher.click()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-launcher-panel")).toBeTruthy()
      expect(launcher.getAttribute("aria-expanded")).toBe("true")
    }, { timeout: 1000, interval: 10 })
    expect(
      Array.from(document.querySelectorAll(".st-launcher-group h2"), (heading) => heading.textContent),
    ).toEqual(["Crea", "Attività", "Lezione"])

    launcher.click()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-launcher-panel")).toBeNull()
      expect(launcher.getAttribute("aria-expanded")).toBe("false")
    }, { timeout: 1000, interval: 10 })

    root.unmount()
  })

  it("espone esattamente quattro destinazioni globali", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelectorAll("[data-view-nav-item]").length).toBe(4)
    }, { timeout: 1000, interval: 10 })
    const nav = document.querySelector(".st-view-nav")!
    expect(nav.textContent).toContain("Lavagna")
    expect(nav.textContent).toContain("Knowledge")
    expect(nav.textContent).toContain("Library")
    expect(nav.textContent).toContain("Marketplace")
    expect(nav.textContent).not.toContain("Simulatore")
    expect(nav.textContent).not.toContain("ELABTutor")

    root.unmount()
  })

  it("mantiene al massimo due azioni persistenti in testata", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-shell-topbar")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    expect(document.querySelectorAll("[data-orbit-action]").length).toBe(2)
    expect(document.querySelector(".st-actions")).toBeNull()
    root.unmount()
  })

  it("drawer overlay is absent when not open", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-shell-topbar")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const overlay = document.querySelector(".st-drawer-overlay")
    expect(overlay).toBeNull()
    root.unmount()
  })

  it("recstrip is absent when not recording", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-shell-topbar")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const recstrip = document.querySelector(".st-recstrip")
    expect(recstrip).toBeNull()
    root.unmount()
  })
})
