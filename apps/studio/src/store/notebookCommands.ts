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
  | (CommandEnvelope & Readonly<{
    kind: "duplicate_page"
    sourcePageId: string
    pageId: string
  }>)
  | (CommandEnvelope & Readonly<{
    kind: "rename_page"
    pageId: string
    title: string
  }>)
  | (CommandEnvelope & Readonly<{ kind: "undo" }>)
  | (CommandEnvelope & Readonly<{ kind: "redo" }>)
  | (CommandEnvelope & Readonly<{
    kind: "set_view_state"
    activePageId: string
    selectedPageIds: ReadonlyArray<string>
  }>)

export type NotebookCommandResult = Readonly<{
  status: "committed" | "deduplicated" | "noop"
  document: NotebookDocument
}>

const NOTEBOOK_PAGE_TITLE_MAX = 120
const UNICODE_CONTROL_CHARACTER = /\p{Cc}/u

function normalizePageTitle(title: unknown): string {
  if (typeof title !== "string") throw new Error("Invalid notebook page title")
  if (UNICODE_CONTROL_CHARACTER.test(title)) {
    throw new Error("Invalid notebook page title")
  }
  const normalized = title.trim()
  if (
    normalized.length === 0 ||
    normalized.length > NOTEBOOK_PAGE_TITLE_MAX
  ) {
    throw new Error("Invalid notebook page title")
  }
  return normalized
}

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
  if (request.kind === "duplicate_page") {
    validateNotebookId(request.sourcePageId)
    validateNotebookId(request.pageId)
  }
  if (request.kind === "rename_page") {
    validateNotebookId(request.pageId)
    normalizePageTitle(request.title)
  }
  if (request.kind === "set_view_state") {
    if (
      typeof request.activePageId !== "string" ||
      !Array.isArray(request.selectedPageIds) ||
      !request.selectedPageIds.every((pageId) => typeof pageId === "string")
    ) {
      throw new Error("Invalid notebook view state")
    }
  }
}

function createCandidate(
  doc: NotebookDocument,
  request: NotebookCommandRequest,
): NotebookCommandResult {
  if (doc.recentCommandIds.includes(request.commandId)) {
    return { status: "deduplicated", document: doc }
  }

  if (request.kind === "set_view_state") {
    const orderedIds = [...doc.pages]
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((page) => page.pageId)
    const selected = [...request.selectedPageIds]
    if (
      !orderedIds.includes(request.activePageId) ||
      new Set(selected).size !== selected.length ||
      !selected.includes(request.activePageId) ||
      selected.some((pageId) => !orderedIds.includes(pageId)) ||
      orderedIds.filter((pageId) => selected.includes(pageId)).some(
        (pageId, index) => pageId !== selected[index],
      )
    ) {
      throw new Error("Invalid notebook view state")
    }
    const unchanged = doc.activePageId === request.activePageId &&
      doc.selectedPageIds.length === selected.length &&
      doc.selectedPageIds.every((pageId, index) => pageId === selected[index])
    if (unchanged) return { status: "noop", document: doc }
    return {
      status: "committed",
      document: {
        ...doc,
        activePageId: request.activePageId,
        selectedPageIds: selected,
        updatedAt: request.now,
        revision: doc.revision + 1,
        recentCommandIds: appendRecentCommand(doc, request.commandId),
      },
    }
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

  if (request.kind === "rename_page") {
    // PC-R1-001 + GN-A0-011/GN-A7-012 → PRD §5.1 e §19.2:
    // persistenza dello stesso pageId e snapshot storici prima/dopo immutabili.
    const normalizedTitle = normalizePageTitle(request.title)
    const current = doc.pages.find((page) => page.pageId === request.pageId)
    if (!current) throw new Error("Notebook rename target page does not exist")
    if (current.title === normalizedTitle) return { status: "noop", document: doc }
    const renamed: NotebookDocument = {
      ...doc,
      pages: doc.pages.map((page) => page.pageId === request.pageId
        ? { ...page, title: normalizedTitle, logicalSize: { ...page.logicalSize } }
        : page),
      updatedAt: request.now,
    }
    const entry: NotebookHistoryEntry = {
      commandId: request.commandId,
      kind: request.kind,
      at: request.now,
      before: snapshot(doc),
      after: snapshot(renamed),
    }
    return {
      status: "committed",
      document: {
        ...renamed,
        revision: doc.revision + 1,
        recentCommandIds: appendRecentCommand(doc, request.commandId),
        history: {
          undo: [...doc.history.undo, entry].slice(-NOTEBOOK_HISTORY_LIMIT),
          redo: [],
        },
      },
    }
  }

  let inserted: NotebookDocument
  if (request.kind === "duplicate_page") {
    const pages = [...doc.pages].sort((a, b) => a.ordinal - b.ordinal)
    const sourceIndex = pages.findIndex((page) => page.pageId === request.sourcePageId)
    if (sourceIndex < 0) throw new Error("Notebook duplicate source page does not exist")
    if (pages.some((page) => page.pageId === request.pageId)) {
      throw new Error("Notebook page identifier already exists")
    }
    const source = pages[sourceIndex]!
    const duplicated = {
      ...source,
      pageId: request.pageId,
      ordinal: sourceIndex + 1,
      title: `Copia di ${source.title}`,
      logicalSize: { ...source.logicalSize },
    }
    const reordered = [
      ...pages.slice(0, sourceIndex + 1),
      duplicated,
      ...pages.slice(sourceIndex + 1),
    ].map((page, ordinal) => page.ordinal === ordinal ? page : { ...page, ordinal })
    inserted = { ...doc, pages: reordered, updatedAt: request.now }
  } else {
    inserted = request.kind === "insert_before"
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
  }
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

type DeletableNotebookStore = NotebookStore & Readonly<{
  delete?: (path: string) => Promise<void>
}>

async function deleteAndVerifyAbsent(
  store: NotebookStore,
  path: string,
): Promise<void> {
  const remove = (store as DeletableNotebookStore).delete
  if (!remove) throw new Error("Notebook store cannot compensate a scene copy")
  let deleteFailure: unknown
  try {
    await remove.call(store, path)
  } catch (error) {
    deleteFailure = error
  }
  try {
    if (await store.read(path) === null) return
    throw new Error("Notebook duplicate scene cleanup mismatch")
  } catch (verificationError) {
    throw new AggregateError(
      [deleteFailure, verificationError].filter(Boolean),
      "Notebook duplicate scene cleanup failed",
      { cause: verificationError },
    )
  }
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && left.every((byte, index) => byte === right[index])
}

async function persistDuplicateCandidate(
  store: NotebookStore,
  originalBytes: string,
  request: Extract<NotebookCommandRequest, { kind: "duplicate_page" }>,
  candidate: NotebookDocument,
): Promise<NotebookDocument> {
  const paths = notebookPaths(request.documentId)
  const sourcePath = paths.pageScene(request.sourcePageId)
  const targetPath = paths.pageScene(request.pageId)
  if (await store.read(targetPath)) {
    throw new Error("Notebook duplicate target scene already exists")
  }
  const source = await store.read(sourcePath)
  if (!source) {
    return persistCandidate(store, originalBytes, candidate, request.commandId)
  }

  const remove = (store as DeletableNotebookStore).delete
  if (!remove) throw new Error("Notebook store cannot compensate a scene copy")
  const sourceBytes = new Uint8Array(await source.arrayBuffer())
  let targetTouched = false
  try {
    targetTouched = true
    await store.write(
      targetPath,
      new Blob([sourceBytes], { type: source.type || "application/json" }),
    )
    const copied = await store.read(targetPath)
    if (!copied) throw new Error("Notebook duplicate scene readback is missing")
    const copiedBytes = new Uint8Array(await copied.arrayBuffer())
    if (!equalBytes(sourceBytes, copiedBytes)) {
      throw new Error("Notebook duplicate scene readback mismatch")
    }
    return await persistCandidate(store, originalBytes, candidate, request.commandId)
  } catch (duplicateError) {
    if (targetTouched) {
      try {
        await deleteAndVerifyAbsent(store, targetPath)
      } catch (cleanupError) {
        throw new AggregateError(
          [duplicateError, cleanupError],
          "Notebook duplicate command and scene cleanup failed",
          { cause: cleanupError },
        )
      }
    }
    throw duplicateError
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
    if (request.kind === "duplicate_page") {
      const persisted = await persistDuplicateCandidate(
        store,
        originalBytes,
        request,
        candidate.document,
      )
      return { status: "committed", document: persisted }
    }
    const persisted = await persistCandidate(
      store,
      originalBytes,
      candidate.document,
      request.commandId,
    )
    return { status: "committed", document: persisted }
  })
}
