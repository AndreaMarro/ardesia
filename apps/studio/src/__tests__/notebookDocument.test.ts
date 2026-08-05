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
  NOTEBOOK_SCHEMA_VERSION,
  appendNotebookPage,
  createNotebookDocument,
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
    expect(doc.pages[0].ordinal).toBe(0)
    expect(doc.pages[0].pageId).toMatch(/^[A-Za-z0-9._-]{1,128}$/)
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
})

describe("collezione ordinata di pagine", () => {
  it("aggiunge una seconda pagina in coda mantenendo gli ordinali contigui", () => {
    const uno = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const due = appendNotebookPage(uno, { title: "Seconda", now: 2 })

    expect(due.pages).toHaveLength(2)
    expect(due.pages.map((p) => p.ordinal)).toEqual([0, 1])
    expect(due.pages[1].pageId).not.toBe(due.pages[0].pageId)
    expect(due.updatedAt).toBe(2)
  })

  it("restituisce le pagine per ordinale anche se il manifest le elenca disordinate", () => {
    const uno = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const due = appendNotebookPage(uno, { title: "Seconda", now: 2 })
    const disordinato = { ...due, pages: [due.pages[1], due.pages[0]] }

    expect(orderedNotebookPages(disordinato).map((p) => p.ordinal)).toEqual([0, 1])
  })

  it("sopravvive al round-trip: serializza, rileggi, ritrova identita' e ordine", () => {
    const uno = createNotebookDocument({ documentId: "t1", title: "Taccuino", now: 1 })
    const due = appendNotebookPage(uno, { title: "Seconda", now: 2 })

    const riletto = parseNotebookDocument(serializeNotebookDocument(due))

    expect(riletto).not.toBeNull()
    expect(riletto!.documentId).toBe("t1")
    expect(riletto!.title).toBe("Taccuino")
    expect(orderedNotebookPages(riletto!).map((p) => p.pageId))
      .toEqual(due.pages.map((p) => p.pageId))
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
