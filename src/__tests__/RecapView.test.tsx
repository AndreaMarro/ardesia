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
    const root = createRoot(container)
    root.render(<RecapView store={mockStore as any} room="test-room" />)
    // Poll fino a FINE caricamento: l'header renderizza subito, quindi
    // textContent non-vuoto non basta — serve l'uscita dallo stato "caricamento…"
    const deadline = Date.now() + 3000
    while (Date.now() < deadline) {
      const text = container.textContent ?? ""
      if (text !== "" && !text.includes("caricamento")) break
      await new Promise((r) => setTimeout(r, 10))
    }
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
    expect(container.textContent).toContain("1 ora e 1 minuto")
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
    // find() restituisce undefined, non null: not.toBeNull() passerebbe SEMPRE
    expect(exportBtn).toBeDefined()
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

  it("ogni card metrica ha una label propria, 'appunti salvati' solo nel sottotitolo", async () => {
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
    const labels = Array.from(container.querySelectorAll(".st-recap-label")).map(
      (e) => e.textContent,
    )
    // Tre card, tre label DISTINTE (prima del fix erano tutte "appunti salvati").
    expect(labels).toEqual(["tempo", "lavagna", "formule"])
    expect(new Set(labels).size).toBe(3)
    // La frase di dottrina compare esattamente una volta, nel sottotitolo.
    const occurrences = (container.textContent ?? "").split("appunti salvati").length - 1
    expect(occurrences).toBe(1)
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
