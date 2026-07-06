// @vitest-environment jsdom
// Tool Lab (?vista=tool-lab) — presentazione del gate: iframe SOLO se la
// pipeline firmata è passata, fail-closed visibile altrimenti. La pipeline
// reale (firma/installer/lifecycle/kill) è testata in ToolLabGate.test.ts
// (env node); qui il modulo gate è mockato per pilotare i due esiti.

import { describe, it, expect, afterEach, vi } from "vitest"
import { createRoot } from "react-dom/client"
import { isToolLabView } from "../store/toolLabView"

vi.mock("@excalidraw/excalidraw", () => ({
  Excalidraw: vi.fn((props: { excalidrawAPI?: (api: unknown) => void }) => {
    // pattern ReplayView.test: l'API arriva async, come nel componente reale
    if (props.excalidrawAPI) {
      setTimeout(() => {
        props.excalidrawAPI!({
          getSceneElements: vi.fn(() => []),
          getAppState: vi.fn(() => ({ selectedElementIds: {} })),
          updateScene: vi.fn(),
        })
      }, 0)
    }
    return "mock-excalidraw"
  }),
  convertToExcalidrawElements: vi.fn((els: unknown[]) => els),
  FONT_FAMILY: { Nunito: 6 },
}))
vi.mock("@excalidraw/excalidraw/index.css", () => ({}))

const gateMock = vi.hoisted(() => ({
  installAndGateReferenceTool: vi.fn(),
}))
vi.mock("../toolhost/toolLab", () => gateMock)

describe("isToolLabView", () => {
  it("true solo con ?vista=tool-lab", () => {
    window.history.replaceState(null, "", "/?vista=tool-lab")
    expect(isToolLabView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=replay")
    expect(isToolLabView()).toBe(false)
    window.history.replaceState(null, "", "/")
    expect(isToolLabView()).toBe(false)
  })
})

describe("ToolLab component", () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  afterEach(() => {
    root?.unmount()
    if (container) document.body.removeChild(container)
    container = null
    root = null
    vi.restoreAllMocks()
  })

  async function renderToolLab() {
    const { default: ToolLab } = await import("../design/ToolLab")
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    root.render(<ToolLab deps={{ store: {} as never }} />)
    await vi.waitFor(() => {
      const state = container!.querySelector("[data-tool-lab-state]")!.getAttribute("data-tool-lab-state")
      expect(state).not.toBe("pending")
    })
  }

  it("gate superato → iframe presente, sandbox senza allow-popups/top-navigation", async () => {
    gateMock.installAndGateReferenceTool.mockResolvedValue({
      ok: true,
      manifest: { id: "io.maestro.sim-reference-blink", name: "Reference Sim", version: "0.1.0", capabilities: {} },
      entryHtml: "<html><body>tool</body></html>",
    })
    await renderToolLab()
    // L'iframe monta solo DOPO la callback excalidrawAPI (apiReady), che sotto
    // carico arriva oltre il settle dello stato gate: si attende l'iframe
    // stesso, non lo stato (flake riprodotto firsthand: state
    // "mounted-gate-passed" con iframe non ancora nel DOM).
    const frame = await vi.waitFor(() => {
      const el = container!.querySelector("iframe")
      expect(el).not.toBeNull()
      return el!
    })
    const sandbox = frame.getAttribute("sandbox") ?? ""
    expect(sandbox).toContain("allow-scripts")
    expect(sandbox).not.toContain("allow-popups")
    expect(sandbox).not.toContain("allow-top-navigation")
  })

  it("gate fallito → NESSUN iframe, stato fail-closed visibile", async () => {
    gateMock.installAndGateReferenceTool.mockResolvedValue({
      ok: false,
      reason: "install-failed",
      detail: "firma non valida",
    })
    await renderToolLab()
    expect(container!.querySelector("iframe")).toBeNull()
    expect(container!.querySelector("[data-tool-lab-state]")!.getAttribute("data-tool-lab-state")).toBe(
      "install-failed",
    )
    expect(container!.textContent).toContain("firma non valida")
  })
})
