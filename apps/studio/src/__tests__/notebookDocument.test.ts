// @vitest-environment node
// NotebookDocument — PC-OBJ-001 / PC-R1-001, PRD §6.1 (gerarchia canonica),
// §6.3 (due documenti distinti, un kernel condiviso), §5.1 (R1 include un
// NotebookDocument paginato).
//
// Questi test falsificano quattro cose diverse, e nessuna di esse e' "il file
// esiste": identita' stabile, schema versionato, ordine delle pagine, e la
// distinzione strutturale dalla lavagna infinita.

import { describe, it, expect } from "vitest"
import {
  NOTEBOOK_HISTORY_LIMIT,
  NOTEBOOK_RECENT_COMMAND_LIMIT,
  NOTEBOOK_SCHEMA_VERSION,
  appendNotebookPage,
  createNotebookDocument,
  insertNotebookPageAfter,
  insertNotebookPageBefore,
  notebookPaths,
  orderedNotebookPages,
  parseNotebookDocument,
  serializeNotebookDocument,
} from "../store/notebookDocument"
import { roomPaths } from "../store/roomPaths"

describe("identita' e schema", () => {
  it("crea un taccuino con documentId stabile, schema versionato e una prima pagina reale", () => {
    const doc = createNotebookDocument({
      documentId: "taccuino-led",
      title: "LED: polarita' e resistenza",
      now: 1_000,
    })

    expect(doc.documentId).toBe("taccuino-led")
    expect(doc.v).toBe(NOTEBOOK_SCHEMA_VERSION)
    expect(doc.kind).toBe("notebook")
    expect(doc.pages).toHaveLength(1)
    expect(doc.pages[0]).toEqual({
      pageId: "p1",
      ordinal: 0,
      title: "Pagina 1",
      orientation: 0,
      logicalSize: { width: 794, height: 1123 },
    })
    expect(doc).toMatchObject({
      revision: 0,
      recentCommandIds: [],
      activePageId: "p1",
      selectedPageIds: ["p1"],
      history: { undo: [], redo: [] },
    })
  })

  it("normalizza una fixture v1 senza riscrivere identita' o titoli", () => {
    const legacy = JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "legacy-v1",
      title: "Titolo storico",
      createdAt: 10,
      updatedAt: 20,
      pages: [
        { pageId: "storica-b", ordinal: 1, title: "B  storico" },
        { pageId: "storica-a", ordinal: 0, title: "A storico" },
      ],
    })

    const parsed = parseNotebookDocument(legacy)

    expect(parsed).toMatchObject({
      v: NOTEBOOK_SCHEMA_VERSION,
      revision: 0,
      recentCommandIds: [],
      activePageId: "storica-a",
      selectedPageIds: ["storica-a"],
      history: { undo: [], redo: [] },
    })
    expect(parsed?.pages).toEqual([
      {
        pageId: "storica-b",
        ordinal: 1,
        title: "B  storico",
        orientation: 0,
        logicalSize: { width: 794, height: 1123 },
      },
      {
        pageId: "storica-a",
        ordinal: 0,
        title: "A storico",
        orientation: 0,
        logicalSize: { width: 794, height: 1123 },
      },
    ])
  })

  it("rifiuta un manifest con schema diverso invece di degradare in silenzio", () => {
    const doc = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const alieno = JSON.parse(serializeNotebookDocument(doc))
    alieno.v = NOTEBOOK_SCHEMA_VERSION + 1

    expect(parseNotebookDocument(JSON.stringify(alieno))).toBeNull()
  })

  it("rifiuta un manifest con ordinali non contigui: un buco nell'ordine e' corruzione, non uno stato valido", () => {
    const doc = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const rotto = JSON.parse(serializeNotebookDocument(doc))
    rotto.pages.push({ pageId: "p9", ordinal: 7, title: "salto" })

    expect(parseNotebookDocument(JSON.stringify(rotto))).toBeNull()
  })

  it("rifiuta orientamento non canonico e selezioni che non contengono l'attiva", () => {
    const doc = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const orientamentoRotto = JSON.parse(serializeNotebookDocument(doc))
    orientamentoRotto.pages[0].orientation = 45
    expect(parseNotebookDocument(JSON.stringify(orientamentoRotto))).toBeNull()

    const selezioneRotta = JSON.parse(serializeNotebookDocument(doc))
    selezioneRotta.selectedPageIds = []
    expect(parseNotebookDocument(JSON.stringify(selezioneRotta))).toBeNull()
  })

  it("rifiuta history/retry oltre limite, ID duplicati e selezione fuori ordine", () => {
    const base = appendNotebookPage(
      createNotebookDocument({ documentId: "limits", title: "T", now: 1 }),
      { pageId: "page-b", now: 2 },
    )
    const snapshot = {
      pages: base.pages,
      activePageId: base.activePageId,
      selectedPageIds: base.selectedPageIds,
    }
    expect(parseNotebookDocument(serializeNotebookDocument(base))).not.toBeNull()
    const entry = (commandId: string) => ({
      commandId,
      kind: "insert_after",
      at: 3,
      before: snapshot,
      after: snapshot,
    })

    const troppaHistory = JSON.parse(serializeNotebookDocument(base))
    troppaHistory.history.undo = Array.from(
      { length: NOTEBOOK_HISTORY_LIMIT + 1 },
      (_, index) => entry(`history-${index}`),
    )
    expect(parseNotebookDocument(JSON.stringify(troppaHistory))).toBeNull()

    const historyDuplicata = JSON.parse(serializeNotebookDocument(base))
    historyDuplicata.history.undo = [entry("duplicate-history")]
    historyDuplicata.history.redo = [entry("duplicate-history")]
    expect(parseNotebookDocument(JSON.stringify(historyDuplicata))).toBeNull()

    const rotateSenzaEffetto = JSON.parse(serializeNotebookDocument(base))
    rotateSenzaEffetto.history.undo = [{
      ...entry("rotate-without-effect"),
      kind: "rotate_page",
    }]
    expect(parseNotebookDocument(JSON.stringify(rotateSenzaEffetto))).toBeNull()

    const retryTroppi = JSON.parse(serializeNotebookDocument(base))
    retryTroppi.recentCommandIds = Array.from(
      { length: NOTEBOOK_RECENT_COMMAND_LIMIT + 1 },
      (_, index) => `recent-${index}`,
    )
    expect(parseNotebookDocument(JSON.stringify(retryTroppi))).toBeNull()

    const retryDuplicati = JSON.parse(serializeNotebookDocument(base))
    retryDuplicati.recentCommandIds = ["same-retry", "same-retry"]
    expect(parseNotebookDocument(JSON.stringify(retryDuplicati))).toBeNull()

    const selezioneFuoriOrdine = JSON.parse(serializeNotebookDocument(base))
    selezioneFuoriOrdine.activePageId = "p1"
    selezioneFuoriOrdine.selectedPageIds = ["page-b", "p1"]
    expect(parseNotebookDocument(JSON.stringify(selezioneFuoriOrdine))).toBeNull()
  })
})

describe("collezione ordinata di pagine", () => {
  it("aggiunge una seconda pagina in coda mantenendo gli ordinali contigui", () => {
    const uno = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const due = appendNotebookPage(uno, { pageId: "page-2", title: "Seconda", now: 2 })

    expect(due.pages).toHaveLength(2)
    expect(due.pages.map((p) => p.ordinal)).toEqual([0, 1])
    expect(due.pages[1].pageId).not.toBe(due.pages[0].pageId)
    expect(due.updatedAt).toBe(2)
  })

  it("restituisce le pagine per ordinale anche se il manifest le elenca disordinate", () => {
    const uno = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const due = appendNotebookPage(uno, { pageId: "page-2", title: "Seconda", now: 2 })
    const disordinato = { ...due, pages: [due.pages[1], due.pages[0]] }

    expect(orderedNotebookPages(disordinato).map((p) => p.ordinal)).toEqual([0, 1])
  })

  it("sopravvive al round-trip: serializza, rileggi, ritrova identita' e ordine", () => {
    const uno = createNotebookDocument({ documentId: "t1", title: "Taccuino", now: 1 })
    const due = appendNotebookPage(uno, { pageId: "page-2", title: "Seconda", now: 2 })

    const riletto = parseNotebookDocument(serializeNotebookDocument(due))

    expect(riletto).not.toBeNull()
    expect(riletto!.documentId).toBe("t1")
    expect(riletto!.title).toBe("Taccuino")
    expect(orderedNotebookPages(riletto!).map((p) => p.pageId))
      .toEqual(due.pages.map((p) => p.pageId))
  })
})

describe("identita' indipendente dall'ordine", () => {
  function duePagine() {
    const uno = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    return appendNotebookPage(uno, {
      pageId: "page-b",
      title: "Seconda",
      now: 2,
    })
  }

  it("inserisce una nuova identita' dopo la pagina corrente e ricostruisce soltanto gli ordinali", () => {
    const base = duePagine()
    const bytesPrima = serializeNotebookDocument(base)
    const inserito = insertNotebookPageAfter(base, "p1", {
      pageId: "page-new",
      title: "Nuova",
      now: 3,
    })

    expect(inserito.pages.map((page) => page.pageId)).toEqual(["p1", "page-new", "page-b"])
    expect(inserito.pages.map((page) => page.ordinal)).toEqual([0, 1, 2])
    expect(inserito.pages.map(({ pageId, title }) => ({ pageId, title }))).toEqual([
      { pageId: "p1", title: "Pagina 1" },
      { pageId: "page-new", title: "Nuova" },
      { pageId: "page-b", title: "Seconda" },
    ])
    expect(inserito.updatedAt).toBe(3)
    expect(serializeNotebookDocument(base)).toBe(bytesPrima)

    const riletto = parseNotebookDocument(serializeNotebookDocument(inserito))
    expect(riletto?.pages.map((page) => page.pageId)).toEqual(["p1", "page-new", "page-b"])
  })

  it("inserire dopo l'ultima pagina equivale all'append", () => {
    const base = duePagine()
    const inserito = insertNotebookPageAfter(base, "page-b", {
      pageId: "page-last",
      now: 4,
    })
    const appeso = appendNotebookPage(base, { pageId: "page-last", now: 4 })

    expect(inserito).toEqual(appeso)
    expect(inserito.pages.map((page) => page.pageId)).toEqual(["p1", "page-b", "page-last"])
  })

  it("rigetta pagina corrente assente e nuove identita' duplicate o invalide senza mutare l'originale", () => {
    const base = duePagine()
    const bytesPrima = serializeNotebookDocument(base)
    const casi = [
      () => insertNotebookPageAfter(base, "assente", { pageId: "page-x", now: 4 }),
      () => insertNotebookPageAfter(base, "p1", { pageId: "page-b", now: 4 }),
      () => insertNotebookPageAfter(base, "p1", { pageId: "../fuori", now: 4 }),
    ]

    for (const inserisci of casi) {
      expect(inserisci).toThrow()
      expect(serializeNotebookDocument(base)).toBe(bytesPrima)
    }
  })
})

describe("inserimento prima dell'identita' corrente", () => {
  function trePagine() {
    const uno = createNotebookDocument({ documentId: "t1", title: "Taccuino", now: 1 })
    const due = appendNotebookPage(uno, {
      pageId: "page-b",
      title: "Seconda storica",
      now: 2,
    })
    return appendNotebookPage(due, {
      pageId: "page-c",
      title: "Terza storica",
      now: 3,
    })
  }

  it("inserisce prima della pagina centrale preservando identita', titoli, metadati e input", () => {
    const base = trePagine()
    const bytesPrima = serializeNotebookDocument(base)
    const inserito = insertNotebookPageBefore(base, "page-b", {
      pageId: "page-new",
      title: "Nuova",
      now: 4,
    })

    expect(inserito.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-new",
      "page-b",
      "page-c",
    ])
    expect(inserito.pages.map((page) => page.ordinal)).toEqual([0, 1, 2, 3])
    expect(inserito.pages.map(({ pageId, title }) => ({ pageId, title }))).toEqual([
      { pageId: "p1", title: "Pagina 1" },
      { pageId: "page-new", title: "Nuova" },
      { pageId: "page-b", title: "Seconda storica" },
      { pageId: "page-c", title: "Terza storica" },
    ])
    expect({
      v: inserito.v,
      kind: inserito.kind,
      documentId: inserito.documentId,
      title: inserito.title,
      createdAt: inserito.createdAt,
    }).toEqual({
      v: base.v,
      kind: base.kind,
      documentId: base.documentId,
      title: base.title,
      createdAt: base.createdAt,
    })
    expect(inserito.updatedAt).toBe(4)
    expect(serializeNotebookDocument(base)).toBe(bytesPrima)

    const riletto = parseNotebookDocument(serializeNotebookDocument(inserito))
    expect(riletto?.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-new",
      "page-b",
      "page-c",
    ])
  })

  it("inserisce prima della prima pagina e assegna titolo e ordinali dalla nuova posizione", () => {
    const base = trePagine()
    const inserito = insertNotebookPageBefore(base, "p1", {
      pageId: "page-first",
      now: 4,
    })

    expect(inserito.pages.map((page) => page.pageId)).toEqual([
      "page-first",
      "p1",
      "page-b",
      "page-c",
    ])
    expect(inserito.pages.map((page) => page.ordinal)).toEqual([0, 1, 2, 3])
    expect(inserito.pages[0].title).toBe("Pagina 1")
    expect(inserito.pages.slice(1).map((page) => page.title)).toEqual([
      "Pagina 1",
      "Seconda storica",
      "Terza storica",
    ])
  })

  it("rigetta current assente e nuove identita' duplicate o invalide senza mutare un byte", () => {
    const base = trePagine()
    const bytesPrima = serializeNotebookDocument(base)
    const casi = [
      () => insertNotebookPageBefore(base, "assente", { pageId: "page-x", now: 4 }),
      () => insertNotebookPageBefore(base, "page-b", { pageId: "page-c", now: 4 }),
      () => insertNotebookPageBefore(base, "page-b", { pageId: "../fuori", now: 4 }),
    ]

    for (const inserisci of casi) {
      expect(inserisci).toThrow()
      expect(serializeNotebookDocument(base)).toBe(bytesPrima)
      expect(base.updatedAt).toBe(3)
    }
  })
})

describe("distinzione strutturale dalla lavagna infinita (PRD §6.3)", () => {
  // Questo e' il test che rende falsificabile «nessun tipo e' un travestimento
  // dell'altro». WorkspaceStore.listRooms() enumera le stanze scandendo `raw/`:
  // se una pagina di taccuino vivesse li' dentro, il Taccuino SAREBBE una
  // lavagna sotto altro nome, e la prova sarebbe che comparirebbe fra le stanze.
  it("non scrive nulla sotto raw/: le pagine del taccuino non sono stanze della lavagna", () => {
    const paths = notebookPaths("taccuino-led")

    expect(paths.manifest.startsWith("raw/")).toBe(false)
    expect(paths.pageScene("p1").startsWith("raw/")).toBe(false)
    expect(paths.manifest.startsWith("notebooks/")).toBe(true)
  })

  it("non collide con il path scena di una stanza omonima", () => {
    const stanza = roomPaths("taccuino-led")
    const taccuino = notebookPaths("taccuino-led")

    expect(taccuino.pageScene("p1")).not.toBe(stanza.scene)
    expect(taccuino.manifest).not.toBe(stanza.meta)
  })

  it("rifiuta un documentId che tenta path traversal", () => {
    expect(() => notebookPaths("../fuori")).toThrow()
    expect(() => notebookPaths("")).toThrow()
  })

  it("usa lo stesso kernel scena della lavagna: la pagina e' un .excalidraw", () => {
    // PRD §6.3: «entrambi usano lo stesso modello di tratti, testo, immagini».
    // La distinzione sta nel DOCUMENTO (ordinato/paginato vs spaziale), non nel
    // formato del contenuto: duplicare il formato sarebbe duplicare il renderer.
    expect(notebookPaths("t1").pageScene("p1")).toMatch(/\.excalidraw$/)
    expect(roomPaths("t1").scene).toMatch(/\.excalidraw$/)
  })
})
