// @vitest-environment node
// Persistenza del taccuino attraverso lo STESSO WorkspaceStore della lavagna.
// PC-R1-001 → PRD §5.1 (NotebookDocument paginato in R1) e §6.3 (kernel
// condiviso). Il test prova la riapertura a freddo: scrivi, butta via ogni
// riferimento in memoria, rileggi da un'istanza nuova, ritrova identita',
// ordine e contenuto.

import { describe, it, expect } from "vitest"
import {
  appendNotebookPage,
  createNotebookDocument,
  loadNotebook,
  loadNotebookPageScene,
  orderedNotebookPages,
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
  it("ritrova identita', ordine delle pagine e contenuto dopo un reload", async () => {
    const store = fakeStore()

    const creato = appendNotebookPage(
      createNotebookDocument({ documentId: "taccuino-led", title: "LED", now: 1 }),
      { title: "Seconda", now: 2 },
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
      { now: 2 },
    )
    await saveNotebook(store, doc)
    await saveNotebookPageScene(store, "t1", doc.pages[0].pageId, JSON.stringify({ elements: ["a"] }))
    await saveNotebookPageScene(store, "t1", doc.pages[1].pageId, JSON.stringify({ elements: ["b"] }))

    const prima = await loadNotebookPageScene(store, "t1", doc.pages[0].pageId)
    const seconda = await loadNotebookPageScene(store, "t1", doc.pages[1].pageId)

    expect(JSON.parse(prima!).elements).toEqual(["a"])
    expect(JSON.parse(seconda!).elements).toEqual(["b"])
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
})

import { listNotebooks } from "../store/notebookDocument"
