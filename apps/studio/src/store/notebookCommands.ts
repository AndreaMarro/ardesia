import {
  NOTEBOOK_HISTORY_LIMIT,
  NOTEBOOK_RECENT_COMMAND_LIMIT,
  NOTEBOOK_SCHEMA_VERSION,
  insertNotebookPageAfter,
  insertNotebookPageBefore,
  notebookPaths,
  parseNotebookDocument,
  serializeNotebookDocument,
  validateNotebookCommandId,
  validateNotebookId,
  withMigratedNotebookDocumentLease,
  type NotebookDocument,
  type NotebookHistoryEntry,
  type NotebookPageStateSnapshot,
  type NotebookStore,
} from "./notebookDocument"

type CommandEnvelope = Readonly<{
  documentId: string
  commandId: string
  now: number
}>

export type NotebookCommandRequest =
  | (CommandEnvelope & Readonly<{
    kind: "insert_before"
    targetPageId: string
    pageId: string
    title?: string
  }>)
  | (CommandEnvelope & Readonly<{
    kind: "insert_after"
    targetPageId: string
    pageId: string
    title?: string
  }>)
  | (CommandEnvelope & Readonly<{ kind: "undo" }>)
  | (CommandEnvelope & Readonly<{ kind: "redo" }>)

export type NotebookCommandResult = Readonly<{
  status: "committed" | "deduplicated" | "noop"
  document: NotebookDocument
}>

function snapshot(doc: NotebookDocument): NotebookPageStateSnapshot {
  return {
    pages: doc.pages.map((page) => ({
      ...page,
      logicalSize: { ...page.logicalSize },
    })),
    activePageId: doc.activePageId,
    selectedPageIds: [...doc.selectedPageIds],
  }
}

function restoreSnapshot(
  doc: NotebookDocument,
  state: NotebookPageStateSnapshot,
): NotebookDocument {
  return {
    ...doc,
    pages: state.pages.map((page) => ({
      ...page,
      logicalSize: { ...page.logicalSize },
    })),
    activePageId: state.activePageId,
    selectedPageIds: [...state.selectedPageIds],
  }
}

function appendRecentCommand(doc: NotebookDocument, commandId: string): string[] {
  return [...doc.recentCommandIds, commandId].slice(-NOTEBOOK_RECENT_COMMAND_LIMIT)
}

function validateEnvelope(request: NotebookCommandRequest): void {
  validateNotebookId(request.documentId)
  validateNotebookCommandId(request.commandId)
  if (!Number.isFinite(request.now)) throw new Error("Invalid notebook command timestamp")
  if (
    (request.kind === "insert_before" || request.kind === "insert_after") &&
    request.title !== undefined && typeof request.title !== "string"
  ) {
    throw new Error("Invalid notebook page title")
  }
}

function createCandidate(
  doc: NotebookDocument,
  request: NotebookCommandRequest,
): NotebookCommandResult {
  if (doc.recentCommandIds.includes(request.commandId)) {
    return { status: "deduplicated", document: doc }
  }

  if (request.kind === "undo") {
    const entry = doc.history.undo.at(-1)
    if (!entry) return { status: "noop", document: doc }
    const restored = restoreSnapshot(doc, entry.before)
    return {
      status: "committed",
      document: {
        ...restored,
        updatedAt: request.now,
        revision: doc.revision + 1,
        recentCommandIds: appendRecentCommand(doc, request.commandId),
        history: {
          undo: doc.history.undo.slice(0, -1),
          redo: [...doc.history.redo, entry],
        },
      },
    }
  }

  if (request.kind === "redo") {
    const entry = doc.history.redo.at(-1)
    if (!entry) return { status: "noop", document: doc }
    const restored = restoreSnapshot(doc, entry.after)
    return {
      status: "committed",
      document: {
        ...restored,
        updatedAt: request.now,
        revision: doc.revision + 1,
        recentCommandIds: appendRecentCommand(doc, request.commandId),
        history: {
          undo: [...doc.history.undo, entry].slice(-NOTEBOOK_HISTORY_LIMIT),
          redo: doc.history.redo.slice(0, -1),
        },
      },
    }
  }

  const inserted = request.kind === "insert_before"
    ? insertNotebookPageBefore(doc, request.targetPageId, {
      pageId: request.pageId,
      title: request.title,
      now: request.now,
    })
    : insertNotebookPageAfter(doc, request.targetPageId, {
      pageId: request.pageId,
      title: request.title,
      now: request.now,
    })
  const withSelection: NotebookDocument = {
    ...inserted,
    activePageId: request.pageId,
    selectedPageIds: [request.pageId],
  }
  const entry: NotebookHistoryEntry = {
    commandId: request.commandId,
    kind: request.kind,
    at: request.now,
    before: snapshot(doc),
    after: snapshot(withSelection),
  }
  return {
    status: "committed",
    document: {
      ...withSelection,
      revision: doc.revision + 1,
      recentCommandIds: appendRecentCommand(doc, request.commandId),
      history: {
        undo: [...doc.history.undo, entry].slice(-NOTEBOOK_HISTORY_LIMIT),
        redo: [],
      },
    },
  }
}

async function restoreManifest(
  store: NotebookStore,
  path: string,
  originalBytes: string,
): Promise<void> {
  let writeFailure: unknown
  try {
    await store.write(path, new Blob([originalBytes], { type: "application/json" }))
  } catch (error) {
    writeFailure = error
  }
  try {
    const restored = await store.read(path)
    if (restored && await restored.text() === originalBytes) return
    throw new Error("Notebook command rollback byte mismatch")
  } catch (verificationError) {
    throw new AggregateError(
      [writeFailure, verificationError].filter(Boolean),
      "Notebook command rollback failed",
      { cause: verificationError },
    )
  }
}

async function persistCandidate(
  store: NotebookStore,
  originalBytes: string,
  candidate: NotebookDocument,
  commandId: string,
): Promise<NotebookDocument> {
  const path = notebookPaths(candidate.documentId).manifest
  const candidateBytes = serializeNotebookDocument(candidate)
  try {
    await store.write(path, new Blob([candidateBytes], { type: "application/json" }))
    const readback = await store.read(path)
    if (!readback) throw new Error("Notebook command readback is missing")
    const readbackBytes = await readback.text()
    const persisted = parseNotebookDocument(readbackBytes)
    if (
      readbackBytes !== candidateBytes ||
      !persisted ||
      persisted.revision !== candidate.revision ||
      !persisted.recentCommandIds.includes(commandId)
    ) {
      throw new Error("Notebook command readback verification failed")
    }
    return persisted
  } catch (commandError) {
    let currentBytes: string | null
    try {
      const current = await store.read(path)
      currentBytes = current ? await current.text() : null
    } catch (readError) {
      throw new AggregateError(
        [commandError, readError],
        "Notebook command failed and rollback state could not be read",
        { cause: readError },
      )
    }
    if (currentBytes !== originalBytes) {
      try {
        await restoreManifest(store, path, originalBytes)
      } catch (rollbackError) {
        throw new AggregateError(
          [commandError, rollbackError],
          "Notebook command and rollback failed",
          { cause: rollbackError },
        )
      }
    }
    throw commandError
  }
}

/**
 * Esegue un comando sul referente riletto dentro una lease per-documento e
 * rende visibile il candidato soltanto dopo write + readback verificati.
 */
export async function executeNotebookCommand(
  store: NotebookStore,
  request: NotebookCommandRequest,
): Promise<NotebookCommandResult> {
  validateEnvelope(request)
  return withMigratedNotebookDocumentLease(store, request.documentId, async () => {
    const path = notebookPaths(request.documentId).manifest
    const original = await store.read(path)
    if (!original) throw new Error("Notebook command manifest is missing")
    const originalBytes = await original.text()
    let stored: unknown
    try {
      stored = JSON.parse(originalBytes) as unknown
    } catch (parseError) {
      throw new Error("Notebook command manifest is corrupt", { cause: parseError })
    }
    if (
      !stored ||
      typeof stored !== "object" ||
      (stored as Record<string, unknown>).v !== NOTEBOOK_SCHEMA_VERSION
    ) {
      throw new Error("Notebook command manifest changed after migration")
    }
    const durable = parseNotebookDocument(originalBytes)
    if (!durable || durable.documentId !== request.documentId) {
      throw new Error("Notebook command manifest is invalid")
    }
    const candidate = createCandidate(durable, request)
    if (candidate.status !== "committed") return candidate
    const persisted = await persistCandidate(
      store,
      originalBytes,
      candidate.document,
      request.commandId,
    )
    return { status: "committed", document: persisted }
  })
}
