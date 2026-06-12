// @vitest-environment node
// MAESTRO-Studio — Test lessonRecap: buildRecap + formatDuration

import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildRecap, formatDuration } from "../store/lessonRecap"

/** Factory per JournalEvent di test */
function mkEvent(props: Record<string, unknown>) {
  return {
    t: props.t as number ?? Date.now(),
    type: props.type as string,
    ...props,
  } as any
}

function mockStore(entries: Record<string, string>) {
  const store: any = {
    loadMeta: vi.fn().mockResolvedValue(null),
    read: vi.fn(async (path: string) => {
      const content = (entries as any)[path]
      if (!content) return null
      return new Blob([content], { type: "application/json" })
    }),
  }
  return store
}

describe("formatDuration", () => {
  it("restituisce — per 0 ms", () => {
    expect(formatDuration(0)).toBe("—")
  })

  it("restituisce 'meno di un minuto' per pochi secondi", () => {
    expect(formatDuration(5000)).toBe("meno di un minuto")
  })

  it("restituisce minuti interi", () => {
    expect(formatDuration(180_000)).toBe("3 minuti")
  })

  it("restituisce 1 minuto per 60s", () => {
    expect(formatDuration(60_000)).toBe("1 minuti")
  })

  it("restituisce ore e minuti", () => {
    expect(formatDuration(3900_000)).toBe("1 ora e 5 minuti")
  })

  it("restituisce solo ore", () => {
    expect(formatDuration(7200_000)).toBe("2 ore")
  })
})

describe("buildRecap", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("restituisce LessonRecap con titolo di default se nessun meta", async () => {
    const store = mockStore({})
    const recap = await buildRecap(store, "room-1")
    expect(recap).not.toBeNull()
    expect(recap!.title).toBe("Lezione senza nome")
    expect(recap!.durationMs).toBe(0)
    expect(recap!.mathFormulas).toEqual([])
    expect(recap!.totalElementsAdded).toBe(0)
    expect(recap!.pdfPagesViewed).toEqual([])
  })

  it("legge il titolo dal meta quando presente", async () => {
    const store = mockStore({})
    store.loadMeta = vi.fn().mockResolvedValue({ v: 1, name: "Teoria dei Segnali", createdAt: 1000 })
    const recap = await buildRecap(store, "room-1")
    expect(recap!.title).toBe("Teoria dei Segnali")
  })

  it("calcola durata da primo e ultimo evento journal", async () => {
    const store = mockStore({
      "raw/events.jsonl": [
        mkEvent({ t: 1000, type: "t0" }),
        mkEvent({ t: 2000, type: "t1" }),
        mkEvent({ t: 5000, type: "t0" }),
        mkEvent({ t: 12000, type: "t1" }),
      ].map((e) => JSON.stringify(e)).join("\n"),
    })
    const recap = await buildRecap(store, "room-1")
    expect(recap!.firstEventTime).toBe(1000)
    expect(recap!.lastEventTime).toBe(12000)
    expect(recap!.durationMs).toBe(11000)
  })

  it("estrae formula math.insert uniche", async () => {
    const store = mockStore({
      "raw/events.jsonl": [
        mkEvent({ t: 1000, type: "math.insert", latex: "E = mc^2" }),
        mkEvent({ t: 2000, type: "math.insert", latex: "\\int_a^b f(x) dx" }),
        mkEvent({ t: 3000, type: "math.insert", latex: "E = mc^2" }), // duplicata
      ].map((e) => JSON.stringify(e)).join("\n"),
    })
    const recap = await buildRecap(store, "room-1")
    expect(recap!.mathFormulas).toEqual(["E = mc^2", "\\int_a^b f(x) dx"])
  })

  it("conta elementi aggiunti per tipo", async () => {
    const store = mockStore({
      "raw/events.jsonl": [
        mkEvent({ t: 1000, type: "element.add", element: { id: "a", type: "rectangle", version: 1 } }),
        mkEvent({ t: 2000, type: "element.add", element: { id: "b", type: "text", version: 1 } }),
        mkEvent({ t: 3000, type: "element.add", element: { id: "c", type: "rectangle", version: 1 } }),
        mkEvent({ t: 4000, type: "element.add", element: { id: "d", type: "image", version: 1 } }),
      ].map((e) => JSON.stringify(e)).join("\n"),
    })
    const recap = await buildRecap(store, "room-1")
    expect(recap!.totalElementsAdded).toBe(4)
    expect(recap!.elementTypeCounts).toEqual({
      rectangle: 2,
      text: 1,
      image: 1,
    })
  })

  it("conta pagine PDF uniche", async () => {
    const store = mockStore({
      "raw/events.jsonl": [
        mkEvent({ t: 1000, type: "pdf.page.view", page: 1, totalPages: 10 }),
        mkEvent({ t: 2000, type: "pdf.page.view", page: 2, totalPages: 10 }),
        mkEvent({ t: 3000, type: "pdf.page.view", page: 1, totalPages: 10 }), // duplicata
        mkEvent({ t: 4000, type: "pdf.page.view", page: 5, totalPages: 10 }),
      ].map((e) => JSON.stringify(e)).join("\n"),
    })
    const recap = await buildRecap(store, "room-1")
    expect(recap!.pdfPagesViewed).toEqual([1, 2, 5])
  })

  it("gestisce journal vuoto (solo newline)", async () => {
    const store = mockStore({
      "raw/events.jsonl": "\n\n",
    })
    const recap = await buildRecap(store, "room-1")
    expect(recap!.durationMs).toBe(0)
    expect(recap!.mathFormulas).toEqual([])
    expect(recap!.totalElementsAdded).toBe(0)
  })

  it("gestisce journal assente", async () => {
    const store = mockStore({})
    const recap = await buildRecap(store, "room-1")
    expect(recap!.durationMs).toBe(0)
    expect(recap!.totalElementsAdded).toBe(0)
  })

  it("salta righe JSON malformate", async () => {
    const store = mockStore({
      "raw/events.jsonl": "{valido}\n{corrotto\n{valido2}\n",
    })
    // Solo {valido} e {valido2} vengono parsati (se sono JSON validi)
    const recap = await buildRecap(store, "room-1")
    // Nessun evento riconosciuto (i JSON non corrispondono al formato atteso)
    // ma la funzione non crasha
    expect(recap).not.toBeNull()
  })
})
