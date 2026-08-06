// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  NOTEBOOK_RECENT_COMMAND_LIMIT,
  appendNotebookPage,
  createNotebookDocument,
  loadNotebook,
  migrateNotebookDocument,
  notebookPaths,
  saveNotebook,
  serializeNotebookDocument,
  type NotebookStore,
} from "../store/notebookDocument"
import { executeNotebookCommand } from "../store/notebookCommands"

function fakeStore(seed?: Map<string, string>) {
  const files = seed ?? new Map<string, string>()
  return {
    files,
    async read(path: string): Promise<Blob | null> {
      const content = files.get(path)
      return content === undefined
        ? null
        : new Blob([content], { type: "application/json" })
    },
    async write(path: string, data: Blob): Promise<void> {
      files.set(path, await data.text())
    },
    async delete(path: string): Promise<void> {
      files.delete(path)
    },
  }
}

async function seededNotebook(store: NotebookStore, documentId = "commands") {
  const base = appendNotebookPage(
    createNotebookDocument({ documentId, title: "Comandi", now: 1 }),
    { pageId: "page-b", title: "B", now: 2 },
  )
  await saveNotebook(store, base)
  return base
}

describe("command boundary persistito", () => {
  it("rinomina la stessa identita', preserva scena e snapshot storici, poi undo/redo", async () => {
    const store = fakeStore()
    await seededNotebook(store, "rename")
    const paths = notebookPaths("rename")
    const sourceScene = '{"type":"excalidraw","elements":[{"id":"rename-ink"}]}'
    store.files.set(paths.pageScene("page-b"), sourceScene)
    const duplicated = await executeNotebookCommand(store, {
      kind: "duplicate_page",
      documentId: "rename",
      commandId: "rename-setup-duplicate",
      sourcePageId: "page-b",
      pageId: "page-b-copy",
      now: 3,
    })
    const historicalDuplicate = JSON.stringify(duplicated.document.history.undo[0])

    const renamed = await executeNotebookCommand(store, {
      kind: "rename_page",
      documentId: "rename",
      commandId: "rename-page-b",
      pageId: "page-b",
      title: "  Titolo  nuovo  ",
      now: 4,
    })

    expect(renamed.status).toBe("committed")
    expect(renamed.document.pages.map((page) => [page.pageId, page.title])).toEqual([
      ["p1", "Pagina 1"],
      ["page-b", "Titolo  nuovo"],
      ["page-b-copy", "Copia di B"],
    ])
    expect(JSON.stringify(renamed.document.history.undo[0])).toBe(historicalDuplicate)
    expect(renamed.document.history.undo.at(-1)?.before.pages[1]?.title).toBe("B")
    expect(renamed.document.history.undo.at(-1)?.after.pages[1]?.title).toBe("Titolo  nuovo")
    expect(store.files.get(paths.pageScene("page-b"))).toBe(sourceScene)

    const undone = await executeNotebookCommand(store, {
      kind: "undo",
      documentId: "rename",
      commandId: "undo-rename-page-b",
      now: 5,
    })
    expect(undone.document.pages[1]?.pageId).toBe("page-b")
    expect(undone.document.pages[1]?.title).toBe("B")
    const redone = await executeNotebookCommand(store, {
      kind: "redo",
      documentId: "rename",
      commandId: "redo-rename-page-b",
      now: 6,
    })
    expect(redone.document.pages[1]?.pageId).toBe("page-b")
    expect(redone.document.pages[1]?.title).toBe("Titolo  nuovo")
    expect(store.files.get(paths.pageScene("page-b"))).toBe(sourceScene)
  })

  it("rifiuta titoli invalidi e tratta il titolo invariato come zero-I/O", async () => {
    const store = fakeStore()
    await seededNotebook(store, "rename-validation")
    const manifestPath = notebookPaths("rename-validation").manifest
    const manifestBefore = store.files.get(manifestPath)
    const originalWrite = store.write.bind(store)
    let writes = 0
    store.write = async (path: string, data: Blob): Promise<void> => {
      writes += 1
      await originalWrite(path, data)
    }

    for (const [commandId, title] of [
      ["rename-empty", "   "],
      ["rename-control", "titolo\nnuovo"],
      ["rename-control-leading", "\nTitolo"],
      ["rename-control-trailing", "Titolo\r"],
      ["rename-too-long", "x".repeat(121)],
    ] as const) {
      await expect(executeNotebookCommand(store, {
        kind: "rename_page",
        documentId: "rename-validation",
        commandId,
        pageId: "page-b",
        title,
        now: 10,
      })).rejects.toThrow("Invalid notebook page title")
    }

    const noop = await executeNotebookCommand(store, {
      kind: "rename_page",
      documentId: "rename-validation",
      commandId: "rename-noop",
      pageId: "page-b",
      title: "  B  ",
      now: 11,
    })
    expect(noop.status).toBe("noop")
    expect(writes).toBe(0)
    expect(store.files.get(manifestPath)).toBe(manifestBefore)
    expect(noop.document.revision).toBe(0)
    expect(noop.document.history.undo).toEqual([])
  })

  it("duplica byte e metadati su nuova identita' adiacente e li recupera con undo/redo", async () => {
    const store = fakeStore()
    const base = await seededNotebook(store, "duplicate")
    const source = {
      ...base,
      pages: base.pages.map((page) => page.pageId === "page-b"
        ? {
            ...page,
            title: "Schema B",
            orientation: 90 as const,
            logicalSize: { width: 1123, height: 794 },
          }
        : page),
    }
    await saveNotebook(store, source)
    const paths = notebookPaths("duplicate")
    const sourceScene = '{\n  "type": "excalidraw", "elements": [{"id":"ink-b"}]\n}'
    store.files.set(paths.pageScene("page-b"), sourceScene)

    const duplicated = await executeNotebookCommand(store, {
      kind: "duplicate_page",
      documentId: "duplicate",
      commandId: "duplicate-b",
      sourcePageId: "page-b",
      pageId: "page-b-copy",
      now: 10,
    })

    expect(duplicated.status).toBe("committed")
    expect(duplicated.document.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-b",
      "page-b-copy",
    ])
    expect(duplicated.document.pages[2]).toEqual({
      pageId: "page-b-copy",
      ordinal: 2,
      title: "Copia di Schema B",
      orientation: 90,
      logicalSize: { width: 1123, height: 794 },
    })
    expect(duplicated.document.activePageId).toBe("page-b-copy")
    expect(duplicated.document.selectedPageIds).toEqual(["page-b-copy"])
    expect(store.files.get(paths.pageScene("page-b"))).toBe(sourceScene)
    expect(store.files.get(paths.pageScene("page-b-copy"))).toBe(sourceScene)

    const undone = await executeNotebookCommand(store, {
      kind: "undo",
      documentId: "duplicate",
      commandId: "undo-duplicate-b",
      now: 11,
    })
    expect(undone.document.pages.map((page) => page.pageId)).toEqual(["p1", "page-b"])
    expect(store.files.get(paths.pageScene("page-b-copy"))).toBe(sourceScene)

    const redone = await executeNotebookCommand(store, {
      kind: "redo",
      documentId: "duplicate",
      commandId: "redo-duplicate-b",
      now: 12,
    })
    expect(redone.document.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-b",
      "page-b-copy",
    ])
    expect(store.files.get(paths.pageScene("page-b-copy"))).toBe(sourceScene)
    expect(store.files.get(paths.pageScene("page-b"))).toBe(sourceScene)
  })

  it("elimina e verifica la scena candidata se il manifest duplicate fallisce", async () => {
    const store = fakeStore()
    await seededNotebook(store, "duplicate-failure")
    const paths = notebookPaths("duplicate-failure")
    const manifestBefore = store.files.get(paths.manifest)
    const sourceScene = '{"type":"excalidraw","elements":[{"id":"source"}]}'
    store.files.set(paths.pageScene("page-b"), sourceScene)
    const originalWrite = store.write.bind(store)
    store.write = async (path: string, data: Blob): Promise<void> => {
      if (path === paths.manifest && store.files.has(paths.pageScene("page-copy"))) {
        throw new Error("manifest duplicate simulato")
      }
      await originalWrite(path, data)
    }

    await expect(executeNotebookCommand(store, {
      kind: "duplicate_page",
      documentId: "duplicate-failure",
      commandId: "duplicate-failure-command",
      sourcePageId: "page-b",
      pageId: "page-copy",
      now: 20,
    })).rejects.toThrow("manifest duplicate simulato")

    expect(store.files.get(paths.manifest)).toBe(manifestBefore)
    expect(store.files.get(paths.pageScene("page-b"))).toBe(sourceScene)
    expect(store.files.has(paths.pageScene("page-copy"))).toBe(false)
    expect((await loadNotebook(store, "duplicate-failure"))?.history.undo).toEqual([])
  })

  it("persiste active/selected senza creare history di pagina", async () => {
    const store = fakeStore()
    const base = await seededNotebook(store, "view-state")
    const other = await seededNotebook(store, "view-state-other")
    const otherPath = notebookPaths("view-state-other").manifest
    const otherBytes = store.files.get(otherPath)

    const result = await executeNotebookCommand(store, {
      kind: "set_view_state",
      documentId: "view-state",
      commandId: "select-page-b",
      activePageId: "page-b",
      selectedPageIds: ["p1", "page-b"],
      now: 4,
    })

    expect(result.status).toBe("committed")
    expect(result.document.activePageId).toBe("page-b")
    expect(result.document.selectedPageIds).toEqual(["p1", "page-b"])
    expect(result.document.history).toEqual(base.history)
    expect(result.document.revision).toBe(1)
    expect(await loadNotebook(store, "view-state")).toEqual(result.document)
    expect(store.files.get(otherPath)).toBe(otherBytes)
    expect(await loadNotebook(store, "view-state-other")).toEqual(other)

    const reopened = fakeStore(store.files)
    expect(await loadNotebook(reopened, "view-state")).toEqual(result.document)
    expect(await loadNotebook(reopened, "view-state-other")).toEqual(other)
  })

  it("modificare un documento non cambia manifest o pagine di un altro", async () => {
    const store = fakeStore()
    await seededNotebook(store, "doc-a")
    const docB = await seededNotebook(store, "doc-b")
    const pathB = notebookPaths("doc-b").manifest
    const bytesB = store.files.get(pathB)

    await executeNotebookCommand(store, {
      kind: "insert_after",
      documentId: "doc-a",
      commandId: "only-doc-a",
      targetPageId: "p1",
      pageId: "page-a-new",
      now: 5,
    })

    expect(store.files.get(pathB)).toBe(bytesB)
    expect(await loadNotebook(store, "doc-b")).toEqual(docB)
    expect((await loadNotebook(store, "doc-a"))?.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-a-new",
      "page-b",
    ])
  })

  it("mantiene migrazione e commit nella stessa lease osservabile", async () => {
    const store = fakeStore()
    store.files.set("notebooks/atomic-lease/notebook.json", JSON.stringify({
      v: 1,
      kind: "notebook",
      documentId: "atomic-lease",
      title: "Legacy",
      createdAt: 1,
      updatedAt: 1,
      pages: [{ pageId: "p1", ordinal: 0, title: "P" }],
    }))

    const command = executeNotebookCommand(store, {
      kind: "insert_after",
      documentId: "atomic-lease",
      commandId: "atomic-command",
      targetPageId: "p1",
      pageId: "page-new",
      now: 2,
    })
    const observed = migrateNotebookDocument(store, "atomic-lease")
    const [result, observation] = await Promise.all([command, observed])

    expect(result.status).toBe("committed")
    expect(observation.document.revision).toBe(1)
    expect(observation.document.pages.map((page) => page.pageId)).toEqual(["p1", "page-new"])
  })

  it("annulla e ripristina insert-before/after concatenati con gli stessi ID", async () => {
    const store = fakeStore()
    await seededNotebook(store)

    const before = await executeNotebookCommand(store, {
      kind: "insert_before",
      documentId: "commands",
      commandId: "insert-before-1",
      targetPageId: "page-b",
      pageId: "page-x",
      title: "X",
      now: 10,
    })
    const after = await executeNotebookCommand(store, {
      kind: "insert_after",
      documentId: "commands",
      commandId: "insert-after-1",
      targetPageId: "page-x",
      pageId: "page-y",
      title: "Y",
      now: 11,
    })

    expect(before.document.pages.map((page) => page.pageId)).toEqual(["p1", "page-x", "page-b"])
    expect(before.document.activePageId).toBe("page-x")
    expect(before.document.selectedPageIds).toEqual(["page-x"])
    expect(after.document.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-x",
      "page-y",
      "page-b",
    ])
    expect(after.document.history.undo).toHaveLength(2)

    const undoY = await executeNotebookCommand(store, {
      kind: "undo",
      documentId: "commands",
      commandId: "undo-y",
      now: 12,
    })
    const undoX = await executeNotebookCommand(store, {
      kind: "undo",
      documentId: "commands",
      commandId: "undo-x",
      now: 13,
    })
    expect(undoY.document.pages.map((page) => page.pageId)).toEqual(["p1", "page-x", "page-b"])
    expect(undoY.document.activePageId).toBe("page-x")
    expect(undoX.document.pages.map((page) => page.pageId)).toEqual(["p1", "page-b"])
    expect(undoX.document.activePageId).toBe("p1")

    const redoX = await executeNotebookCommand(store, {
      kind: "redo",
      documentId: "commands",
      commandId: "redo-x",
      now: 14,
    })
    const redoY = await executeNotebookCommand(store, {
      kind: "redo",
      documentId: "commands",
      commandId: "redo-y",
      now: 15,
    })
    expect(redoX.document.pages.map((page) => page.pageId)).toEqual(["p1", "page-x", "page-b"])
    expect(redoX.document.activePageId).toBe("page-x")
    expect(redoY.document.pages.map((page) => page.pageId)).toEqual([
      "p1",
      "page-x",
      "page-y",
      "page-b",
    ])
    expect(redoY.document.activePageId).toBe("page-y")
    expect(redoY.document.revision).toBe(6)
    expect(redoY.document.recentCommandIds).toEqual([
      "insert-before-1",
      "insert-after-1",
      "undo-y",
      "undo-x",
      "redo-x",
      "redo-y",
    ])

    const reloaded = await loadNotebook(store, "commands")
    expect(reloaded).toEqual(redoY.document)
  })

  it("serializza due retry concorrenti e applica lo stesso commandId una volta sola", async () => {
    const base = fakeStore()
    await seededNotebook(base, "retry")
    let writes = 0
    const store = {
      ...base,
      async write(path: string, data: Blob): Promise<void> {
        writes += 1
        await new Promise((resolve) => setTimeout(resolve, 5))
        await base.write(path, data)
      },
    }
    const request = {
      kind: "insert_after" as const,
      documentId: "retry",
      commandId: "same-command",
      targetPageId: "p1",
      pageId: "only-once",
      now: 20,
    }

    const [first, second] = await Promise.all([
      executeNotebookCommand(store, request),
      executeNotebookCommand(store, request),
    ])

    expect([first.status, second.status].sort()).toEqual(["committed", "deduplicated"])
    expect(second.document.pages.filter((page) => page.pageId === "only-once")).toHaveLength(1)
    expect(writes).toBe(1)
  })

  it("serializza lo stesso documento anche attraverso due adapter store distinti", async () => {
    const base = fakeStore()
    await seededNotebook(base, "two-adapters")
    const writeOrder: string[] = []
    const storeA = {
      ...base,
      async write(path: string, data: Blob): Promise<void> {
        writeOrder.push("a")
        await base.write(path, data)
      },
    }
    const storeB = {
      ...base,
      async write(path: string, data: Blob): Promise<void> {
        writeOrder.push("b")
        await base.write(path, data)
      },
    }

    const [resultA, resultB] = await Promise.all([
      executeNotebookCommand(storeA, {
        kind: "insert_after",
        documentId: "two-adapters",
        commandId: "adapter-a",
        targetPageId: "p1",
        pageId: "page-a",
        now: 20,
      }),
      executeNotebookCommand(storeB, {
        kind: "insert_after",
        documentId: "two-adapters",
        commandId: "adapter-b",
        targetPageId: "p1",
        pageId: "page-b2",
        now: 21,
      }),
    ])
    const reloaded = await loadNotebook(base, "two-adapters")

    expect(resultA.status).toBe("committed")
    expect(resultB.status).toBe("committed")
    expect(writeOrder).toEqual(["a", "b"])
    expect(reloaded?.pages.map((page) => page.pageId).sort()).toEqual([
      "p1", "page-a", "page-b", "page-b2",
    ])
    expect(reloaded?.revision).toBe(2)
  })

  it("rifiuta envelope invalidi e pageId duplicato oltre la finestra retry senza write", async () => {
    const base = fakeStore()
    const doc = {
      ...await seededNotebook(base, "invalid-envelope"),
      recentCommandIds: Array.from(
        { length: NOTEBOOK_RECENT_COMMAND_LIMIT },
        (_, index) => `recent-command-${index}`,
      ),
    }
    await saveNotebook(base, doc)
    const path = notebookPaths("invalid-envelope").manifest
    const originalBytes = base.files.get(path)
    let writes = 0
    const store = {
      ...base,
      async write(target: string, data: Blob): Promise<void> {
        writes += 1
        await base.write(target, data)
      },
    }
    const common = {
      kind: "insert_after" as const,
      documentId: "invalid-envelope",
      commandId: "valid-command",
      targetPageId: "p1",
      pageId: "new-page",
      now: 50,
    }

    await expect(executeNotebookCommand(store, { ...common, now: Number.NaN }))
      .rejects.toThrow("Invalid notebook command timestamp")
    await expect(executeNotebookCommand(store, {
      ...common,
      commandId: "invalid command id",
    })).rejects.toThrow("Invalid notebook command identifier")
    await expect(executeNotebookCommand(store, {
      ...common,
      title: 42 as unknown as string,
    })).rejects.toThrow("Invalid notebook page title")
    await expect(executeNotebookCommand(store, {
      ...common,
      commandId: "expired-command",
      pageId: "page-b",
    })).rejects.toThrow("Notebook page identifier already exists")
    expect(writes).toBe(0)
    expect(base.files.get(path)).toBe(originalBytes)
  })

  it("espone un errore chiaro se il manifest diventa corrotto al readback del comando", async () => {
    const base = fakeStore()
    await seededNotebook(base, "corrupt-command")
    let reads = 0
    const store = {
      ...base,
      async read(path: string): Promise<Blob | null> {
        reads += 1
        if (reads === 2) return new Blob(["not-json"])
        return base.read(path)
      },
    }

    await expect(executeNotebookCommand(store, {
      kind: "insert_after",
      documentId: "corrupt-command",
      commandId: "corrupt-read",
      targetPageId: "p1",
      pageId: "never-written",
      now: 60,
    })).rejects.toThrow("Notebook command manifest is corrupt")
  })

  it("compensa un readback del candidato che non corrisponde ai byte scritti", async () => {
    const base = fakeStore()
    const original = await seededNotebook(base, "readback-mismatch")
    const path = notebookPaths("readback-mismatch").manifest
    const originalBytes = base.files.get(path)!
    let candidateWritten = false
    let liedOnce = false
    const store = {
      ...base,
      async write(target: string, data: Blob): Promise<void> {
        await base.write(target, data)
        candidateWritten = true
      },
      async read(target: string): Promise<Blob | null> {
        if (candidateWritten && !liedOnce) {
          liedOnce = true
          return new Blob([originalBytes])
        }
        return base.read(target)
      },
    }

    await expect(executeNotebookCommand(store, {
      kind: "insert_after",
      documentId: "readback-mismatch",
      commandId: "mismatched-readback",
      targetPageId: "p1",
      pageId: "ghost-readback",
      now: 61,
    })).rejects.toThrow("Notebook command readback verification failed")
    expect(base.files.get(path)).toBe(originalBytes)
    expect(await loadNotebook(base, "readback-mismatch")).toEqual(original)
  })

  it("compensa una write fallita dopo il commit fisico senza storia o revisione fantasma", async () => {
    const base = fakeStore()
    const original = await seededNotebook(base, "failure")
    const path = notebookPaths("failure").manifest
    const originalBytes = base.files.get(path)
    let writes = 0
    const store = {
      ...base,
      async write(target: string, data: Blob): Promise<void> {
        writes += 1
        await base.write(target, data)
        if (writes === 1) throw new Error("injected command write failure")
      },
    }

    await expect(executeNotebookCommand(store, {
      kind: "insert_before",
      documentId: "failure",
      commandId: "must-rollback",
      targetPageId: "page-b",
      pageId: "ghost",
      now: 30,
    })).rejects.toThrow("injected command write failure")

    expect(base.files.get(path)).toBe(originalBytes)
    expect(writes).toBe(2)
    expect(await loadNotebook(base, "failure")).toEqual(original)
  })

  it("una write fallita durante undo conserva manifest, history e stato visibile", async () => {
    const base = fakeStore()
    await seededNotebook(base, "undo-failure")
    const inserted = await executeNotebookCommand(base, {
      kind: "insert_after",
      documentId: "undo-failure",
      commandId: "forward",
      targetPageId: "p1",
      pageId: "same-id",
      now: 40,
    })
    const path = notebookPaths("undo-failure").manifest
    const committedBytes = base.files.get(path)
    let writes = 0
    const failingStore = {
      ...base,
      async write(target: string, data: Blob): Promise<void> {
        writes += 1
        await base.write(target, data)
        if (writes === 1) throw new Error("injected undo write failure")
      },
    }

    await expect(executeNotebookCommand(failingStore, {
      kind: "undo",
      documentId: "undo-failure",
      commandId: "undo-fails",
      now: 41,
    })).rejects.toThrow("injected undo write failure")

    expect(base.files.get(path)).toBe(committedBytes)
    expect(await loadNotebook(base, "undo-failure")).toEqual(inserted.document)
    expect(serializeNotebookDocument(inserted.document)).toBe(committedBytes)
  })
})
