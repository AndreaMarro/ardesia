// @vitest-environment jsdom
// MAESTRO-Studio — Test RecapView: riepilogo lezione

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createRoot } from "react-dom/client"

// Mock buildRecap per isolare il componente
vi.mock("../store/lessonRecap", () => {
  const actual = vi.importActual("../store/lessonRecap") as Promise<any>
  return actual.then((mod: any) => ({
    ...mod,
    buildRecap: vi.fn(),
  }))
})

describe("RecapView", () => {
  let container: HTMLDivElement
  let mockStore: any

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    mockStore = {
      loadMeta: vi.fn().mockResolvedValue(null),
      read: vi.fn().mockResolvedValue(null),
      exportLesson: vi.fn().mockResolvedValue(new Blob()),
      list: vi.fn().mockResolvedValue([]),
      saveMeta: vi.fn().mockResolvedValue(undefined),
      mode: "localStorage",
    }
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  async function renderRecapView() {
    const { default: RecapView } = await import("../RecapView")
    return new Promise<void>((resolve) => {
      const root = createRoot(container)
      root.render(<RecapView store={mockStore as any} room="test-room" />)
      // React 19 flush
      setTimeout(resolve, 50)
    })
  }

  it("mostra errore quando buildRecap fallisce", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockRejectedValue(new Error("ERRORE-TEST"))
    await renderRecapView()
    expect(container.textContent).toContain("ERRORE-TEST")
  })

  it("mostra titolo della lezione", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Teoria dei Segnali",
      durationMs: 3600_000,
      mathFormulas: ["E = mc^2", "\\int f(x) dx"],
      elementTypeCounts: { rectangle: 3, text: 2 },
      totalElementsAdded: 5,
      pdfPagesViewed: [1, 2, 3],
      firstEventTime: 1000,
      lastEventTime: 3601_000,
    })
    await renderRecapView()
    expect(container.textContent).toContain("Teoria dei Segnali")
  })

  it("mostra durata formattata", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Test",
      durationMs: 3660_000,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 3661_000,
    })
    await renderRecapView()
    expect(container.textContent).toContain("1 ora e 1 minuti")
  })

  it("mostra conteggio formule", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Test",
      durationMs: 1000,
      mathFormulas: ["\\int", "\\sum", "f(x)"],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 2000,
    })
    await renderRecapView()
    expect(container.textContent).toContain("3")
  })

  it("mostra bottone esporta .lesson", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Test",
      durationMs: 1000,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 2000,
    })
    await renderRecapView()
    const buttons = container.querySelectorAll("button")
    const exportBtn = Array.from(buttons).find((b) => b.textContent?.includes("esporta"))
    expect(exportBtn).not.toBeNull()
  })

  it("usa linguaggio 'appunti salvati' mai 'cache'/'flush'/'workspace'", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Test",
      durationMs: 1000,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 2000,
    })
    await renderRecapView()
    const text = container.textContent ?? ""
    expect(text).toContain("appunti salvati")
    expect(text).not.toMatch(/\bflush\b/i)
    expect(text).not.toMatch(/\bcache\b/i)
    expect(text).not.toMatch(/\bworkspace\b/i)
  })

  it("mostra elenco formule inserite", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Test",
      durationMs: 1000,
      mathFormulas: ["E = mc^2", "\\int_a^b f(x) dx"],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 2000,
    })
    await renderRecapView()
    expect(container.textContent).toContain("E = mc^2")
    expect(container.textContent).toContain("\\int_a^b f(x) dx")
  })
})
