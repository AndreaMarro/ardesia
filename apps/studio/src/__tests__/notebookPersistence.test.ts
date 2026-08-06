// @vitest-environment node
// Persistenza del taccuino attraverso lo STESSO WorkspaceStore della lavagna.
// PC-R1-001 → PRD §5.1 (NotebookDocument paginato in R1) e §6.3 (kernel
// condiviso). Il test prova la riapertura a freddo: scrivi, butta via ogni
// riferimento in memoria, rileggi da un'istanza nuova, ritrova identita',
// ordine e contenuto.

import { describe, it, expect } from "vitest"
import {
  NOTEBOOK_SCHEMA_VERSION,
  appendNotebookPage,
  createNotebookIfMissing,
  createNotebookDocument,
  inspectNotebook,
  insertNotebookPageAfter,
  insertNotebookPageBefore,
  loadNotebook,
  loadNotebookPageScene,
  migrateNotebookDocument,
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
  it("legge una fixture v1 come v2 senza migrazione implicita", async () => {
    const store = fakeStore()
    const legacy = JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "legacy",
      title: "Legacy",
      createdAt: 1,
      updatedAt: 2,
      pages: [{ pageId: "p1", ordinal: 0, title: "Pagina storica" }],
    })
    store.files.set("notebooks/legacy/notebook.json", legacy)

    const inspection = await inspectNotebook(store, "legacy")

    expect(inspection.kind).toBe("ready")
    expect(inspection.kind === "ready" ? inspection.document.v : null)
      .toBe(NOTEBOOK_SCHEMA_VERSION)
    expect(inspection.kind === "ready" ? inspection.document.pages[0].orientation : null)
      .toBe(0)
    expect(store.files.get("notebooks/legacy/notebook.json")).toBe(legacy)
  })

  it("migra v1 una volta, verifica il readback e poi resta byte-idempotente", async () => {
    const base = fakeStore()
    const legacy = JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "migrazione",
      title: "Legacy",
      createdAt: 1,
      updatedAt: 2,
      pages: [{ pageId: "p1", ordinal: 0, title: "Pagina storica" }],
    })
    base.files.set("notebooks/migrazione/notebook.json", legacy)
    let writes = 0
    const store = {
      ...base,
      async write(path: string, data: Blob): Promise<void> {
        writes += 1
        await base.write(path, data)
      },
    }

    const first = await migrateNotebookDocument(store, "migrazione")
    const migratedBytes = base.files.get("notebooks/migrazione/notebook.json")
    const second = await migrateNotebookDocument(store, "migrazione")

    expect(first.kind).toBe("migrated")
    expect(first.document.v).toBe(NOTEBOOK_SCHEMA_VERSION)
    expect(second.kind).toBe("already-current")
    expect(base.files.get("notebooks/migrazione/notebook.json")).toBe(migratedBytes)
    expect(writes).toBe(1)
  })

  it("ripristina gli esatti byte v1 se la write di migrazione fallisce dopo aver scritto", async () => {
    const base = fakeStore()
    const legacy = '{ "v": 1, "kind": "notebook", "documentId": "rollback", "title": "Spazi intatti", "createdAt": 1, "updatedAt": 2, "pages": [{ "pageId": "p1", "ordinal": 0, "title": "P" }] }'
    base.files.set("notebooks/rollback/notebook.json", legacy)
    let writes = 0
    const store = {
      ...base,
      async write(path: string, data: Blob): Promise<void> {
        writes += 1
        await base.write(path, data)
        if (writes === 1) throw new Error("injected migration write failure")
      },
    }

    await expect(migrateNotebookDocument(store, "rollback")).rejects.toThrow(
      "injected migration write failure",
    )
    expect(base.files.get("notebooks/rollback/notebook.json")).toBe(legacy)
    expect(writes).toBe(2)
  })

  it("serializza due migrazioni concorrenti dello stesso referente", async () => {
    const base = fakeStore()
    base.files.set("notebooks/concurrent-migration/notebook.json", JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "concurrent-migration",
      title: "Legacy",
      createdAt: 1,
      updatedAt: 2,
      pages: [{ pageId: "p1", ordinal: 0, title: "P" }],
    }))
    let writes = 0
    const store = {
      ...base,
      async write(path: string, data: Blob): Promise<void> {
        writes += 1
        await new Promise((resolve) => setTimeout(resolve, 5))
        await base.write(path, data)
      },
    }

    const results = await Promise.all([
      migrateNotebookDocument(store, "concurrent-migration"),
      migrateNotebookDocument(store, "concurrent-migration"),
    ])

    expect(results.map((result) => result.kind).sort()).toEqual([
      "already-current",
      "migrated",
    ])
    expect(writes).toBe(1)
  })

  it("non sovrascrive un manifest v2 piu' recente osservato durante il rollback", async () => {
    const base = fakeStore()
    const path = "notebooks/newer-writer/notebook.json"
    base.files.set(path, JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "newer-writer",
      title: "Legacy",
      createdAt: 1,
      updatedAt: 2,
      pages: [{ pageId: "p1", ordinal: 0, title: "P" }],
    }))
    const newer = JSON.stringify({
      ...createNotebookDocument({ documentId: "newer-writer", title: "Writer recente", now: 9 }),
      revision: 3,
      updatedAt: 9,
    })
    let writes = 0
    const store = {
      ...base,
      async write(target: string, data: Blob): Promise<void> {
        writes += 1
        await base.write(target, data)
        base.files.set(target, newer)
        throw new Error("injected stale migration failure")
      },
    }

    await expect(migrateNotebookDocument(store, "newer-writer")).rejects.toThrow(
      "injected stale migration failure",
    )
    expect(base.files.get(path)).toBe(newer)
    expect(writes).toBe(1)
    expect((await loadNotebook(base, "newer-writer"))?.title).toBe("Writer recente")
  })

  it("propaga AggregateError se la compensazione non puo' essere verificata", async () => {
    const base = fakeStore()
    const path = "notebooks/rollback-aggregate/notebook.json"
    const legacy = JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "rollback-aggregate",
      title: "Legacy",
      createdAt: 1,
      updatedAt: 2,
      pages: [{ pageId: "p1", ordinal: 0, title: "P" }],
    })
    base.files.set(path, legacy)
    let writes = 0
    let corruptNextRead = false
    const store = {
      ...base,
      async read(target: string): Promise<Blob | null> {
        if (corruptNextRead) {
          corruptNextRead = false
          return new Blob(["corrupt rollback readback"])
        }
        return base.read(target)
      },
      async write(target: string, data: Blob): Promise<void> {
        writes += 1
        await base.write(target, data)
        if (writes === 1) throw new Error("injected migration failure")
        corruptNextRead = true
      },
    }

    const failure = migrateNotebookDocument(store, "rollback-aggregate")
    await expect(failure).rejects.toBeInstanceOf(AggregateError)
    await expect(failure).rejects.toThrow("Notebook migration and rollback failed")
    expect(base.files.get(path)).toBe(legacy)
  })

  it("ripristina v1 quando la write fallita lascia byte parziali", async () => {
    const base = fakeStore()
    const path = "notebooks/partial-write/notebook.json"
    const legacy = JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "partial-write",
      title: "Legacy",
      createdAt: 1,
      updatedAt: 2,
      pages: [{ pageId: "p1", ordinal: 0, title: "P" }],
    })
    base.files.set(path, legacy)
    let writes = 0
    const store = {
      ...base,
      async write(target: string, data: Blob): Promise<void> {
        writes += 1
        if (writes === 1) {
          base.files.set(target, (await data.text()).slice(0, 24))
          throw new Error("injected partial migration write")
        }
        await base.write(target, data)
      },
    }

    await expect(migrateNotebookDocument(store, "partial-write")).rejects.toThrow(
      "injected partial migration write",
    )
    expect(base.files.get(path)).toBe(legacy)
    expect(writes).toBe(2)
  })

  it("migra solo il target e riapre gli stessi byte v2 con un nuovo store", async () => {
    const files = new Map<string, string>()
    const store = fakeStore()
    for (const documentId of ["migration-a", "migration-b"]) {
      files.set(`notebooks/${documentId}/notebook.json`, JSON.stringify({
        v: 1,
        kind: "notebook",
        documentId,
        title: documentId,
        createdAt: 1,
        updatedAt: 2,
        pages: [{ pageId: "p1", ordinal: 0, title: "P" }],
      }))
    }
    store.files.clear()
    for (const [path, bytes] of files) store.files.set(path, bytes)
    const untouched = store.files.get("notebooks/migration-b/notebook.json")

    const migrated = await migrateNotebookDocument(store, "migration-a")
    const migratedBytes = store.files.get("notebooks/migration-a/notebook.json")
    const reopened = fakeStore()
    for (const [path, bytes] of store.files) reopened.files.set(path, bytes)
    const cold = await migrateNotebookDocument(reopened, "migration-a")

    expect(migrated.kind).toBe("migrated")
    expect(cold).toEqual({ kind: "already-current", document: migrated.document })
    expect(reopened.files.get("notebooks/migration-a/notebook.json")).toBe(migratedBytes)
    expect(reopened.files.get("notebooks/migration-b/notebook.json")).toBe(untouched)
  })

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
