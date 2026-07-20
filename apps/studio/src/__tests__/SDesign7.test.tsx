// @vitest-environment jsdom
// MAESTRO-Studio — Test S-DESIGN-7: responsive <=768px
// hamburger menu, drawer full-screen, recstrip sempre visibile

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
    registerActiveLesson: async (lessonId: string) => {
      const completion = Promise.resolve()
      return { lessonId, release: () => completion }
    },
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
vi.mock("../design/icons", () => ({ IconAlert: () => null, IconCheck: () => null, IconArrowUpRight: () => null }))
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

  it("renders header with st-bar class", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      const bars = document.querySelectorAll(".st-bar")
      expect(bars.length).toBe(1)
    }, { timeout: 1000, interval: 10 })
    root.unmount()
  })

  it("renders hamburger menu button in header", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      const btns = document.querySelectorAll(".st-menu-btn")
      expect(btns.length).toBe(1)
      expect(btns[0].getAttribute("aria-label")).toBe("Apri menu")
    }, { timeout: 1000, interval: 10 })
    root.unmount()
  })

  it("hamburger toggles st-actions-open class on st-actions", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-menu-btn")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const menuBtn = document.querySelector(".st-menu-btn") as HTMLButtonElement

    const actions = document.querySelector(".st-actions")
    expect(actions).toBeTruthy()
    expect(actions!.className).not.toContain("st-actions-open")

    menuBtn.click()
    await vi.waitFor(() => {
      expect(actions!.className).toContain("st-actions-open")
    }, { timeout: 1000, interval: 10 })

    menuBtn.click()
    await vi.waitFor(() => {
      expect(actions!.className).not.toContain("st-actions-open")
    }, { timeout: 1000, interval: 10 })

    root.unmount()
  })

  it("hamburger button shows ☰ when closed, ✕ when open", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-menu-btn")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const menuBtn = document.querySelector(".st-menu-btn") as HTMLButtonElement
    expect(menuBtn.textContent).toBe("☰")

    menuBtn.click()
    await vi.waitFor(() => {
      expect(menuBtn.textContent).toBe("✕")
    }, { timeout: 1000, interval: 10 })

    menuBtn.click()
    await vi.waitFor(() => {
      expect(menuBtn.textContent).toBe("☰")
    }, { timeout: 1000, interval: 10 })

    root.unmount()
  })

  it("espone soltanto la capability Founder Beta builtin-reviewed", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-actions")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const actions = document.querySelector(".st-actions")!
    const founderPlugins = actions.querySelectorAll("[data-founder-plugin-id]")
    expect(founderPlugins).toHaveLength(1)
    expect(founderPlugins[0].getAttribute("data-founder-plugin-id")).toBe("io.ardesia.simulation")
    expect(founderPlugins[0].getAttribute("data-plugin-trust-tier")).toBe("builtin-reviewed")

    const controls = Array.from(actions.querySelectorAll("button, a, [role='button']"))
    const text = controls.map((control) => [
      control.textContent ?? "",
      control.getAttribute("aria-label") ?? "",
      control.getAttribute("title") ?? "",
    ].join(" ")).join(" ").toLocaleLowerCase()
    for (const excluded of ["invita studente", "audio", "meet", "esporta lezione", "sim esp2", "sim esp3", "sim esp6"]) {
      expect(text).not.toContain(excluded)
    }
    root.unmount()
  })

  it("drawer overlay is absent when not open", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-bar")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const overlay = document.querySelector(".st-drawer-overlay")
    expect(overlay).toBeNull()
    root.unmount()
  })

  it("recstrip is absent when not recording", async () => {
    const root = await renderRoom()
    await vi.waitFor(() => {
      expect(document.querySelector(".st-bar")).toBeTruthy()
    }, { timeout: 1000, interval: 10 })
    const recstrip = document.querySelector(".st-recstrip")
    expect(recstrip).toBeNull()
    root.unmount()
  })
})
