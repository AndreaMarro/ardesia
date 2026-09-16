// @vitest-environment jsdom
// MAESTRO-Studio — Test RecapView: riepilogo lezione

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createRoot } from "react-dom/client"
import { hasEmoji } from "./emojiGuard"

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

  async function renderRecapView(room = "test-room") {
    const { default: RecapView } = await import("../RecapView")
    const root = createRoot(container)
    root.render(<RecapView store={mockStore as any} room={room} />)
    // Poll fino a FINE caricamento: l'header renderizza subito, quindi
    // textContent non-vuoto non basta — serve l'uscita dallo stato "caricamento…"
    const deadline = Date.now() + 3000
    while (Date.now() < deadline) {
      const text = container.textContent ?? ""
      if (text !== "" && !text.includes("caricamento")) break
      await new Promise((r) => setTimeout(r, 10))
    }
  }

  // Rende il RecapView, clicca "esporta" e cattura il filename (a.download) del
  // link di download generato. Mocka URL.createObjectURL (assente in jsdom) e la
  // navigazione del click così il test isola SOLO la derivazione dello slug.
  async function captureExportDownload(): Promise<string[]> {
    const downloads: string[] = []
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloads.push(this.download)
      })
    const origCreate = URL.createObjectURL
    const origRevoke = URL.revokeObjectURL
    URL.createObjectURL = vi.fn(() => "blob:test")
    URL.revokeObjectURL = vi.fn()
    try {
      await renderRecapView()
      const exportBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("esporta"),
      )!
      exportBtn.click()
      await vi.waitFor(() => expect(downloads.length).toBe(1))
    } finally {
      clickSpy.mockRestore()
      URL.createObjectURL = origCreate
      URL.revokeObjectURL = origRevoke
    }
    return downloads
  }

  it("mostra errore quando buildRecap fallisce", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockRejectedValue(new Error("ERRORE-TEST"))
    await renderRecapView()
    expect(container.textContent).toContain("ERRORE-TEST")
  })

  it("lo stato di errore spiega cosa fare ed è privo di emoji", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockRejectedValue(new Error("boom"))
    await renderRecapView()
    const state = container.querySelector(".st-state-error")
    expect(state).not.toBeNull()
    expect(state?.getAttribute("role")).toBe("alert")
    // titolo (cosa) + dettaglio (cosa è successo) + suggerimento (cosa fare)
    expect(container.querySelector(".st-state-title")?.textContent).toContain("non disponibile")
    expect(container.querySelector(".st-state-hint")?.textContent).toMatch(/Riprova|esporta/i)
    expect(hasEmoji(container.textContent ?? "")).toBe(false)
  })

  it("lezione senza contenuto (recap a zero) mostra lo stato vuoto, non la griglia di zeri", async () => {
    // buildRecap NON restituisce mai null per una lezione vuota: torna un recap
    // a zero (no journal / no eventi). Lo stato vuoto deve scattare su QUESTO caso.
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Lezione senza nome",
      durationMs: 0,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: null,
      lastEventTime: null,
    })
    await renderRecapView()
    expect(container.querySelector(".st-state")).not.toBeNull()
    // la griglia metriche NON deve comparire
    expect(container.querySelector(".st-recap-grid")).toBeNull()
    expect(container.querySelector(".st-state-title")?.textContent).toMatch(/nessun appunto/i)
    expect(container.querySelector(".st-state-hint")?.textContent).toMatch(/lavagna/i)
    expect(hasEmoji(container.textContent ?? "")).toBe(false)
  })

  it("recap con sola durata (>0) mostra la griglia, non lo stato vuoto", async () => {
    // guardia anti-regressione: la soglia di vuoto non deve nascondere lezioni reali.
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Test",
      durationMs: 60_000,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 61_000,
    })
    await renderRecapView()
    expect(container.querySelector(".st-recap-grid")).not.toBeNull()
    expect(container.querySelector(".st-state")).toBeNull()
  })

  it("lezione con attività registrata ma durata 0 (es. solo audio) NON è vuota", async () => {
    // firstEventTime valorizzato = c'è stato un evento (audio.chunk): un singolo
    // evento dà durationMs 0, ma NON va marcata "vuota" (sarebbe fuorviante).
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Test",
      durationMs: 0,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 5000,
      lastEventTime: 5000,
    })
    await renderRecapView()
    expect(container.querySelector(".st-recap-grid")).not.toBeNull()
    expect(container.querySelector(".st-state")).toBeNull()
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

  it("export fallito: banner locale, il riepilogo resta visibile (no errore di pagina)", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Teoria dei Segnali",
      durationMs: 3600_000,
      mathFormulas: ["E = mc^2"],
      elementTypeCounts: { rectangle: 1 },
      totalElementsAdded: 1,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 3601_000,
    })
    mockStore.exportLesson = vi.fn().mockRejectedValue(new Error("disco pieno"))
    await renderRecapView()
    const exportBtn = Array.from(container.querySelectorAll("button"))
      .find((b) => b.textContent?.includes("esporta"))!
    exportBtn.click()
    await vi.waitFor(() => {
      expect(container.querySelector(".st-recap-export-err")).not.toBeNull()
    })
    const banner = container.querySelector(".st-recap-export-err")!
    expect(banner.getAttribute("role")).toBe("alert")
    expect(banner.textContent).toContain("Esportazione non riuscita")
    expect(banner.textContent).toContain("disco pieno")
    // il riepilogo NON deve sparire dietro lo stato di errore di pagina
    expect(container.querySelector(".st-recap-grid")).not.toBeNull()
    expect(container.querySelector(".st-state-error")).toBeNull()
    expect(container.textContent).toContain("Teoria dei Segnali")
    expect(hasEmoji(container.textContent ?? "")).toBe(false)
  })

  it("export: slug deriva dal titolo (caso normale)", async () => {
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "Teoria dei Segnali",
      durationMs: 1000,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 2000,
    })
    const downloads = await captureExportDownload()
    expect(downloads).toEqual(["lezione-teoria-dei-segnali.lesson"])
  })

  it("export: titolo senza caratteri utili ricade sul room id (no 'lezione-.lesson')", async () => {
    // Pre-fix RecapView duplicava lo slug inline SENZA il fallback di lessonSlug:
    // un titolo di soli simboli produceva slug vuoto -> filename 'lezione-.lesson'.
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "©™",
      durationMs: 1000,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 2000,
    })
    const downloads = await captureExportDownload()
    expect(downloads).toEqual(["lezione-test-room.lesson"])
  })

  it("export: taglio a 48 char non lascia un trattino finale nel filename", async () => {
    // Pre-fix l'inline tagliava a 48 SENZA il secondo strip del trattino: un titolo
    // lungo con confine di parola sul char 48 dava 'lezione-...-.lesson'.
    const { buildRecap } = await import("../store/lessonRecap")
    vi.mocked(buildRecap).mockResolvedValue({
      v: 1,
      title: "a".repeat(47) + " x",
      durationMs: 1000,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: 1000,
      lastEventTime: 2000,
    })
    const downloads = await captureExportDownload()
    expect(downloads).toEqual(["lezione-" + "a".repeat(47) + ".lesson"])
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

  it("digest identity-scoped: lezioni sovrapposte, l'anteprima esclude gli errori dell'altra lezione", async () => {
    // A: avviata t=100, errore t=140. B: avviata t=120, errore t=130, dentro
    // la finestra di A. Col vecchio path temporale l'anteprima mostrava
    // anche "Errore B"; col path identity-scoped mai.
    const { IDBFactory, IDBKeyRange: FakeKeyRange } = await import("fake-indexeddb")
    const g = globalThis as { indexedDB?: unknown; IDBKeyRange?: unknown }
    const prevIndexedDB = g.indexedDB
    const prevKeyRange = g.IDBKeyRange
    g.indexedDB = new IDBFactory()
    g.IDBKeyRange = FakeKeyRange
    try {
      const { createEventLogStore } = await import("../lessonos/indexedDbEventLog")
      const seed = await createEventLogStore()
      let n = 0
      const envelope = (
        lessonId: string,
        sessionId: string,
        kind: string,
        occurredAt: string,
        payload: Record<string, unknown>,
      ) => {
        n += 1
        return {
          schemaVersion: 2,
          eventId: `70000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
          lessonId,
          sessionId,
          kind,
          occurredAt,
          actor: { type: "teacher", id: "founder-beta-teacher" },
          producer: {
            id: "com.github.andreamarro.ardesia.studio",
            version: "0.0.0",
            commitSha: "a".repeat(40),
          },
          causationId: null,
          idempotencyKey: `recap-view:${n}`,
          evidence: [{ ref: `lesson:${lessonId}@${n}`, resolution: "verified" }],
          payload,
        } as never
      }
      const err = (lessonId: string, sessionId: string, errorId: string, label: string, t: string) =>
        envelope(lessonId, sessionId, "error.observed", t, {
          errorId,
          conceptId: "concetto",
          labels: { it: label },
        })
      const sessionA = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1"
      const sessionB = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb1"
      for (const env of [
        err("lezione-a", sessionA, "err:a", "Errore A", "2026-08-01T00:02:20.000Z"),
        err("lezione-b", sessionB, "err:b", "Errore B", "2026-08-01T00:02:10.000Z"),
      ]) {
        await seed.appendEnvelope(env)
      }
      if ("close" in seed) await (seed as { close(): Promise<void> }).close()

      const { buildRecap } = await import("../store/lessonRecap")
      vi.mocked(buildRecap).mockResolvedValue({
        v: 1,
        title: "Lezione A",
        durationMs: 1000,
        mathFormulas: [],
        elementTypeCounts: {},
        totalElementsAdded: 0,
        pdfPagesViewed: [],
        firstEventTime: 1000,
        lastEventTime: 2000,
      })
      await renderRecapView("lezione-a")

      // L'anteprima materiale e' un iframe: si legge srcDoc, non il DOM.
      let srcDoc = ""
      const deadline = Date.now() + 3000
      while (Date.now() < deadline) {
        srcDoc = (container.querySelector("iframe") as HTMLIFrameElement | null)?.srcdoc ?? ""
        if (srcDoc.includes("Errore A")) break
        await new Promise((r) => setTimeout(r, 10))
      }
      expect(srcDoc).toContain("Errore A")
      expect(srcDoc).not.toContain("Errore B")
    } finally {
      g.indexedDB = prevIndexedDB
      g.IDBKeyRange = prevKeyRange
    }
  })
})
