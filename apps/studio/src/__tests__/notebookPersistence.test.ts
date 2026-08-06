// @vitest-environment node
// Persistenza del taccuino attraverso lo STESSO WorkspaceStore della lavagna.
// PC-R1-001 → PRD §5.1 (NotebookDocument paginato in R1) e §6.3 (kernel
// condiviso). Il test prova la riapertura a freddo: scrivi, butta via ogni
// riferimento in memoria, rileggi da un'istanza nuova, ritrova identita',
// ordine e contenuto.

import { describe, it, expect } from "vitest"
import {
  appendNotebookPage,
  createNotebookIfMissing,
  createNotebookDocument,
  inspectNotebook,
  insertNotebookPageAfter,
  insertNotebookPageBefore,
  loadNotebook,
  loadNotebookPageScene,
  orderedNotebookPages,
  parseNotebookDocument,
  saveNotebook,
  saveNotebookPageScene,
} from "../store/notebookDocument"

/** Store finto ma NON compiacente: un vero dizionario path → bytes. */
function fakeStore() {
  const files = new Map<string, string>()
  return {
    files,
    async read(path: string): Promise<Blob | null> {
      const content = files.get(path)
      if (content === undefined) return null
      return new Blob([content], { type: "application/json" })
    },
    async write(path: string, data: Blob): Promise<void> {
      files.set(path, await data.text())
    },
  }
}

const SCENA = JSON.stringify({
  type: "excalidraw",
  version: 2,
  elements: [{ id: "tratto-1", type: "freedraw", x: 10, y: 20 }],
  appState: {},
})

describe("riapertura a freddo del taccuino", () => {
  it("rifiuta anche il pageId di un manifest che tenta path traversal", () => {
    const doc = createNotebookDocument({ documentId: "t1", title: "T", now: 1 })
    const alterato = JSON.parse(JSON.stringify(doc))
    alterato.pages[0].pageId = "../fuori"

    expect(parseNotebookDocument(JSON.stringify(alterato))).toBeNull()
  })

  it("distingue un manifest corrotto da un taccuino davvero assente", async () => {
    const store = fakeStore()
    store.files.set("notebooks/t1/notebook.json", "non e' json")

    await expect(inspectNotebook(store, "t1")).resolves.toEqual({
      kind: "corrupt",
      reason: "invalid-manifest",
    })
    await expect(inspectNotebook(store, "mai-visto")).resolves.toEqual({ kind: "missing" })
  })

  it("non accetta un manifest che dichiara l'identita' di un altro percorso", async () => {
    const store = fakeStore()
    const intruso = createNotebookDocument({ documentId: "altro", title: "Altro", now: 1 })
    store.files.set("notebooks/richiesto/notebook.json", JSON.stringify(intruso))

    await expect(inspectNotebook(store, "richiesto")).resolves.toEqual({
      kind: "corrupt",
      reason: "document-id-mismatch",
    })
    await expect(loadNotebook(store, "richiesto")).resolves.toBeNull()
  })

  it("serializza due creazioni concorrenti dello stesso taccuino senza sovrascrivere", async () => {
    const base = fakeStore()
    let writes = 0
    const store = {
      ...base,
      async write(path: string, data: Blob): Promise<void> {
        writes += 1
        await new Promise((resolve) => setTimeout(resolve, 5))
        await base.write(path, data)
      },
    }
    const prima = createNotebookDocument({ documentId: "concorrente", title: "Prima", now: 1 })
    const seconda = createNotebookDocument({ documentId: "concorrente", title: "Seconda", now: 2 })

    const [uno, due] = await Promise.all([
      createNotebookIfMissing(store, prima),
      createNotebookIfMissing(store, seconda),
    ])

    expect(writes).toBe(1)
    expect(uno).toEqual(due)
    expect(uno.title).toBe("Prima")
  })

  it("rifiuta un candidato invalido prima di creare il manifest", async () => {
    const store = fakeStore()
    const valido = createNotebookDocument({ documentId: "candidato", title: "T", now: 1 })
    const invalido = {
      ...valido,
      pages: [{ ...valido.pages[0], pageId: "../fuori" }],
    }

    await expect(saveNotebook(store, invalido)).rejects.toThrow("Invalid notebook document")
    expect(store.files.size).toBe(0)
    await expect(createNotebookIfMissing(store, invalido)).rejects.toThrow(
      "Invalid notebook document",
    )
    await expect(inspectNotebook(store, "candidato")).resolves.toEqual({ kind: "missing" })
    expect(store.files.size).toBe(0)

    const storeConManifest = fakeStore()
    const manifestEsistente = JSON.stringify({ ...valido, title: "Manifest da conservare" })
    storeConManifest.files.set("notebooks/candidato/notebook.json", manifestEsistente)

    await expect(saveNotebook(storeConManifest, invalido)).rejects.toThrow(
      "Invalid notebook document",
    )
    await expect(createNotebookIfMissing(storeConManifest, invalido)).rejects.toThrow(
      "Invalid notebook document",
    )
    expect(storeConManifest.files.get("notebooks/candidato/notebook.json")).toBe(
      manifestEsistente,
    )
  })

  it("ritrova identita', ordine delle pagine e contenuto dopo un reload", async () => {
    const store = fakeStore()

    const creato = appendNotebookPage(
      createNotebookDocument({ documentId: "taccuino-led", title: "LED", now: 1 }),
      { pageId: "page-b", title: "Seconda", now: 2 },
    )
    await saveNotebook(store, creato)
    await saveNotebookPageScene(store, "taccuino-led", creato.pages[0].pageId, SCENA)

    // Riapertura a freddo: nessun riferimento all'oggetto in memoria.
    const riaperto = await loadNotebook(store, "taccuino-led")
    expect(riaperto).not.toBeNull()
    expect(riaperto!.documentId).toBe("taccuino-led")
    expect(riaperto!.title).toBe("LED")
    expect(orderedNotebookPages(riaperto!).map((p) => p.ordinal)).toEqual([0, 1])

    const scena = await loadNotebookPageScene(store, "taccuino-led", riaperto!.pages[0].pageId)
    expect(scena).not.toBeNull()
    expect(JSON.parse(scena!).elements[0].id).toBe("tratto-1")
  })

  it("tiene separate le scene di due pagine dello stesso taccuino", async () => {
    const store = fakeStore()
    const doc = appendNotebookPage(
      createNotebookDocument({ documentId: "t1", title: "T", now: 1 }),
      { pageId: "page-b", now: 2 },
    )
    await saveNotebook(store, doc)
    await saveNotebookPageScene(store, "t1", doc.pages[0].pageId, JSON.stringify({ elements: ["a"] }))
    await saveNotebookPageScene(store, "t1", doc.pages[1].pageId, JSON.stringify({ elements: ["b"] }))

    const prima = await loadNotebookPageScene(store, "t1", doc.pages[0].pageId)
    const seconda = await loadNotebookPageScene(store, "t1", doc.pages[1].pageId)

    expect(JSON.parse(prima!).elements).toEqual(["a"])
    expect(JSON.parse(seconda!).elements).toEqual(["b"])
  })

  it("rilegge a freddo lo stesso ordine e le stesse identita' dopo un inserimento intermedio", async () => {
    const store = fakeStore()
    const base = appendNotebookPage(
      createNotebookDocument({ documentId: "t1", title: "T", now: 1 }),
      { pageId: "page-b", title: "Seconda", now: 2 },
    )
    const inserito = insertNotebookPageAfter(base, "p1", {
      pageId: "page-new",
      now: 3,
    })
    await saveNotebook(store, inserito)
    await saveNotebookPageScene(store, "t1", "p1", JSON.stringify({ elements: ["a"] }))
    await saveNotebookPageScene(store, "t1", "page-b", JSON.stringify({ elements: ["b"] }))

    const riaperto = await loadNotebook(store, "t1")
    expect(riaperto?.pages.map((page) => page.pageId)).toEqual(["p1", "page-new", "page-b"])
    expect(riaperto?.pages.map((page) => page.ordinal)).toEqual([0, 1, 2])
    expect(JSON.parse((await loadNotebookPageScene(store, "t1", "p1"))!).elements).toEqual(["a"])
    expect(JSON.parse((await loadNotebookPageScene(store, "t1", "page-b"))!).elements).toEqual(["b"])
  })

  it("rilegge ordine e scene per identita' dopo un inserimento prima della pagina centrale", async () => {
    const store = fakeStore()
    const uno = createNotebookDocument({ documentId: "before", title: "T", now: 1 })
    const due = appendNotebookPage(uno, { pageId: "page-b", title: "B", now: 2 })
    const tre = appendNotebookPage(due, { pageId: "page-c", title: "C", now: 3 })
    const inserito = insertNotebookPageBefore(tre, "page-b", {
      pageId: "page-new",
      title: "Nuova",
      now: 4,
    })
    await saveNotebook(store, inserito)
    await saveNotebookPageScene(store, "before", "p1", JSON.stringify({ elements: ["a"] }))
    await saveNotebookPageScene(store, "before", "page-b", JSON.stringify({ elements: ["b"] }))
    await saveNotebookPageScene(store, "before", "page-c", JSON.stringify({ elements: ["c"] }))

    const riaperto = await loadNotebook(store, "before")
    expect(riaperto?.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-new",
      "page-b",
      "page-c",
    ])
    expect(riaperto?.pages.map((page) => page.ordinal)).toEqual([0, 1, 2, 3])
    expect(JSON.parse((await loadNotebookPageScene(store, "before", "p1"))!).elements).toEqual(["a"])
    expect(JSON.parse((await loadNotebookPageScene(store, "before", "page-b"))!).elements).toEqual(["b"])
    expect(JSON.parse((await loadNotebookPageScene(store, "before", "page-c"))!).elements).toEqual(["c"])
  })

  it("tiene separati due taccuini diversi", async () => {
    const store = fakeStore()
    await saveNotebook(store, createNotebookDocument({ documentId: "a", title: "A", now: 1 }))
    await saveNotebook(store, createNotebookDocument({ documentId: "b", title: "B", now: 1 }))

    expect((await loadNotebook(store, "a"))!.title).toBe("A")
    expect((await loadNotebook(store, "b"))!.title).toBe("B")
  })

  it("restituisce null per un taccuino che non esiste, senza crearlo", async () => {
    const store = fakeStore()
    expect(await loadNotebook(store, "mai-visto")).toBeNull()
    expect(store.files.size).toBe(0)
  })

  it("non scrive un solo byte sotto raw/: nessuna stanza di lavagna viene creata", async () => {
    const store = fakeStore()
    const doc = createNotebookDocument({ documentId: "taccuino-led", title: "LED", now: 1 })
    await saveNotebook(store, doc)
    await saveNotebookPageScene(store, "taccuino-led", doc.pages[0].pageId, SCENA)

    const sottoRaw = [...store.files.keys()].filter((p) => p.startsWith("raw/"))
    expect(sottoRaw).toEqual([])
    expect(store.files.size).toBeGreaterThan(0)
  })

  it("elenca i taccuini esistenti senza confonderli con le stanze", async () => {
    const store = fakeStore()
    await saveNotebook(store, createNotebookDocument({ documentId: "uno", title: "Uno", now: 1 }))
    await saveNotebook(store, createNotebookDocument({ documentId: "due", title: "Due", now: 2 }))

    const elenco = await listNotebooks({
      ...store,
      async list(prefix?: string) {
        return [...store.files.keys()]
          .filter((p) => !prefix || p.startsWith(prefix))
          .map((path) => ({ path, size: 0, mtime: 0 }))
      },
    })

    expect(elenco.map((n) => n.documentId).sort()).toEqual(["due", "uno"])
  })

  it("non cataloga un manifest sotto l'identita' dichiarata da un altro percorso", async () => {
    const store = fakeStore()
    const intruso = createNotebookDocument({ documentId: "altro", title: "Altro", now: 1 })
    store.files.set("notebooks/richiesto/notebook.json", JSON.stringify(intruso))

    const elenco = await listNotebooks({
      ...store,
      async list() {
        return [...store.files.keys()].map((path) => ({ path }))
      },
    })

    expect(elenco).toEqual([])
  })
})

import { listNotebooks } from "../store/notebookDocument"
