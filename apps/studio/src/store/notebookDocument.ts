// NotebookDocument — il documento ordinato e paginato.
//
// Catena: PC-OBJ-001 e PC-R1-001 → PRD §6.1 (`NotebookDocument └── Page[]`
// fratello di `WhiteboardDocument └── Board[]`), §6.3 («il Notebook e' ordinato
// e paginato; la Whiteboard e' spaziale e infinita; nessun tipo e' un
// travestimento CSS dell'altro»), §5.1 (R1 include un NotebookDocument
// paginato).
//
// Cosa e' condiviso e cosa e' distinto, perche' e' la sola decisione di
// architettura di questo modulo:
//
//   condiviso   il CONTENUTO di una pagina e' una scena Excalidraw, lo stesso
//               formato che usa la lavagna. PRD §6.3: «entrambi usano lo stesso
//               modello di tratti, testo, immagini». KERN-010 chiede che il
//               kernel sia indipendente dal renderer: duplicare il formato
//               significherebbe duplicare il renderer.
//   distinto    il DOCUMENTO. La lavagna vive sotto `raw/<room>/` ed e'
//               enumerata da WorkspaceStore.listRooms() come stanza; il
//               taccuino vive sotto `notebooks/<id>/` e non compare mai in
//               quell'elenco. La distinzione e' nella struttura di
//               archiviazione e nell'ordine esplicito, non in un foglio di
//               stile.
//
// Non c'e' un secondo store: si scrive con lo stesso WorkspaceStore, quindi
// con lo stesso driver FSA/localStorage e lo stesso coordinatore di mutazioni.

export const NOTEBOOK_SCHEMA_VERSION = 2
export const NOTEBOOK_HISTORY_LIMIT = 50
export const NOTEBOOK_RECENT_COMMAND_LIMIT = 100
export const NOTEBOOK_DEFAULT_LOGICAL_SIZE = Object.freeze({
  width: 794,
  height: 1123,
})

/** Namespace di archiviazione. Deliberatamente NON `raw/`: vedi sopra. */
const NOTEBOOK_ROOT = "notebooks"

const NOTEBOOK_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/
const WINDOWS_DEVICE_PATTERN = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i

export type NotebookOrientation = 0 | 90 | 180 | 270

export type NotebookLogicalSize = Readonly<{
  width: number
  height: number
}>

export type NotebookPage = Readonly<{
  pageId: string
  /** Posizione nell'ordine, 0-based e contigua. Un buco e' corruzione. */
  ordinal: number
  title: string
  orientation: NotebookOrientation
  logicalSize: NotebookLogicalSize
}>

export type NotebookPageStateSnapshot = Readonly<{
  pages: ReadonlyArray<NotebookPage>
  activePageId: string
  selectedPageIds: ReadonlyArray<string>
}>

export type NotebookHistoryCommandKind =
  | "insert_before"
  | "insert_after"
  | "duplicate_page"
  | "rename_page"
  | "delete_page"
  | "reorder_pages"
  | "rotate_page"

export type NotebookHistoryEffect = Readonly<{
  kind: "rotate_page"
  pageIds: ReadonlyArray<string>
  quarterTurns: 1 | 2 | 3
}>

export type NotebookHistoryEntry = Readonly<{
  commandId: string
  kind: NotebookHistoryCommandKind
  at: number
  before: NotebookPageStateSnapshot
  after: NotebookPageStateSnapshot
  effect?: NotebookHistoryEffect
}>

export type NotebookHistory = Readonly<{
  undo: ReadonlyArray<NotebookHistoryEntry>
  redo: ReadonlyArray<NotebookHistoryEntry>
}>

export type NotebookDocument = Readonly<{
  v: number
  kind: "notebook"
  documentId: string
  title: string
  createdAt: number
  updatedAt: number
  pages: ReadonlyArray<NotebookPage>
  revision: number
  /** Finestra bounded di idempotenza, non garanzia oltre gli ultimi 100 commit. */
  recentCommandIds: ReadonlyArray<string>
  activePageId: string
  selectedPageIds: ReadonlyArray<string>
  history: NotebookHistory
}>

export type NotebookPaths = Readonly<{
  manifest: string
  pageScene: (pageId: string) => string
}>

/**
 * Valida un identificatore di taccuino o di pagina con le stesse regole di
 * `validateRoomId`: stesso rischio (path traversal, device Windows), stessa
 * difesa. Non riusa quella funzione perche' li' l'insieme dei nomi riservati
 * descrive i file di una stanza, che qui non esistono.
 */
export function validateNotebookId(id: string): string {
  if (
    !NOTEBOOK_ID_PATTERN.test(id) ||
    id === "." ||
    id === ".." ||
    id.endsWith(".") ||
    WINDOWS_DEVICE_PATTERN.test(id)
  ) {
    throw new Error("Invalid notebook identifier")
  }
  return id
}

export function notebookPaths(documentId: string): NotebookPaths {
  const valid = validateNotebookId(documentId)
  const root = `${NOTEBOOK_ROOT}/${valid}`
  return {
    manifest: `${root}/notebook.json`,
    pageScene: (pageId: string) => `${root}/pages/${validateNotebookId(pageId)}.excalidraw`,
  }
}

const notebookDocumentQueues = new Map<string, Promise<unknown>>()

async function withBrowserNotebookLock<T>(
  documentId: string,
  operation: () => Promise<T>,
): Promise<T> {
  const lockManager = typeof navigator === "undefined"
    ? undefined
    : (navigator as Navigator & {
      locks?: { request: <Value>(name: string, callback: () => Promise<Value>) => Promise<Value> }
    }).locks
  if (!lockManager) return operation()
  return lockManager.request(`ardesia:notebook:${documentId}`, operation)
}

/**
 * Lease di processo per identita' documento, indipendente dall'adapter store.
 * Web Locks estende la stessa esclusione fra tab quando disponibile.
 */
function withNotebookDocumentLease<T>(
  documentId: string,
  operation: () => Promise<T>,
): Promise<T> {
  const validDocumentId = validateNotebookId(documentId)
  const previous = notebookDocumentQueues.get(validDocumentId) ?? Promise.resolve()
  const current = previous
    .catch(() => undefined)
    .then(() => withBrowserNotebookLock(validDocumentId, operation))
  notebookDocumentQueues.set(validDocumentId, current)
  void current.then(
    () => {
      if (notebookDocumentQueues.get(validDocumentId) === current) {
        notebookDocumentQueues.delete(validDocumentId)
      }
    },
    () => {
      if (notebookDocumentQueues.get(validDocumentId) === current) {
        notebookDocumentQueues.delete(validDocumentId)
      }
    },
  )
  return current
}

export function createNotebookDocument(options: {
  documentId: string
  title: string
  now: number
}): NotebookDocument {
  const documentId = validateNotebookId(options.documentId)
  return {
    v: NOTEBOOK_SCHEMA_VERSION,
    kind: "notebook",
    documentId,
    title: options.title,
    createdAt: options.now,
    updatedAt: options.now,
    // Un taccuino nasce con una pagina reale: un documento paginato senza
    // pagine sarebbe uno stato vuoto che l'utente non ha chiesto. `p1` resta
    // l'identita' legacy esplicita; le pagine successive ricevono un ID al
    // boundary chiamante e non lo derivano mai dalla posizione.
    pages: [{
      pageId: "p1",
      ordinal: 0,
      title: "Pagina 1",
      orientation: 0,
      logicalSize: { ...NOTEBOOK_DEFAULT_LOGICAL_SIZE },
    }],
    revision: 0,
    recentCommandIds: [],
    activePageId: "p1",
    selectedPageIds: ["p1"],
    history: { undo: [], redo: [] },
  }
}

function notebookPageIndex(
  pages: ReadonlyArray<NotebookPage>,
  currentPageId: string,
): number {
  const currentIndex = pages.findIndex((page) => page.pageId === currentPageId)
  if (currentIndex < 0) throw new Error("Current notebook page does not exist")
  return currentIndex
}

function insertNotebookPageAt(
  doc: NotebookDocument,
  pages: ReadonlyArray<NotebookPage>,
  insertionIndex: number,
  options: { pageId: string; title?: string; now: number },
): NotebookDocument {
  const pageId = validateNotebookId(options.pageId)
  if (pages.some((page) => page.pageId === pageId)) {
    throw new Error("Notebook page identifier already exists")
  }
  if (insertionIndex < 0 || insertionIndex > pages.length) {
    throw new Error("Invalid notebook page insertion index")
  }

  const inserted: NotebookPage = {
    pageId,
    ordinal: insertionIndex,
    title: options.title ?? `Pagina ${insertionIndex + 1}`,
    orientation: 0,
    logicalSize: { ...NOTEBOOK_DEFAULT_LOGICAL_SIZE },
  }
  const reordered = [
    ...pages.slice(0, insertionIndex),
    inserted,
    ...pages.slice(insertionIndex),
  ].map((page, ordinal) => (
    page.ordinal === ordinal ? page : { ...page, ordinal }
  ))

  return { ...doc, pages: reordered, updatedAt: options.now }
}

export function insertNotebookPageAfter(
  doc: NotebookDocument,
  currentPageId: string,
  options: { pageId: string; title?: string; now: number },
): NotebookDocument {
  const pages = orderedNotebookPages(doc)
  const currentIndex = notebookPageIndex(pages, currentPageId)
  return insertNotebookPageAt(doc, pages, currentIndex + 1, options)
}

export function insertNotebookPageBefore(
  doc: NotebookDocument,
  currentPageId: string,
  options: { pageId: string; title?: string; now: number },
): NotebookDocument {
  const pages = orderedNotebookPages(doc)
  const currentIndex = notebookPageIndex(pages, currentPageId)
  return insertNotebookPageAt(doc, pages, currentIndex, options)
}

export function appendNotebookPage(
  doc: NotebookDocument,
  options: { pageId: string; title?: string; now: number },
): NotebookDocument {
  const pages = orderedNotebookPages(doc)
  const last = pages[pages.length - 1]
  if (!last) throw new Error("Notebook document has no pages")
  return insertNotebookPageAfter(doc, last.pageId, options)
}

/** Le pagine in ordine di lettura. L'ordine non dipende da come sono elencate. */
export function orderedNotebookPages(doc: NotebookDocument): ReadonlyArray<NotebookPage> {
  return [...doc.pages].sort((a, b) => a.ordinal - b.ordinal)
}

export function serializeNotebookDocument(doc: NotebookDocument): string {
  return JSON.stringify(doc)
}

function normalizeNotebookDocument(doc: NotebookDocument): NotebookDocument {
  const normalized = parseNotebookDocument(serializeNotebookDocument(doc))
  if (!normalized) throw new Error("Invalid notebook document")
  return normalized
}

const NOTEBOOK_COMMAND_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/
const NOTEBOOK_HISTORY_KINDS = new Set<NotebookHistoryCommandKind>([
  "insert_before",
  "insert_after",
  "duplicate_page",
  "rename_page",
  "delete_page",
  "reorder_pages",
  "rotate_page",
])

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isCanonicalOrientation(value: unknown): value is NotebookOrientation {
  return value === 0 || value === 90 || value === 180 || value === 270
}

export function validateNotebookCommandId(commandId: string): string {
  if (!NOTEBOOK_COMMAND_ID_PATTERN.test(commandId)) {
    throw new Error("Invalid notebook command identifier")
  }
  return commandId
}

function parseNotebookPages(
  entries: unknown,
  sourceVersion: 1 | 2,
): NotebookPage[] | null {
  if (!Array.isArray(entries) || entries.length === 0) return null
  const pages: NotebookPage[] = []
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") return null
    const page = entry as Record<string, unknown>
    if (typeof page.pageId !== "string") return null
    if (!Number.isInteger(page.ordinal) || (page.ordinal as number) < 0) return null
    if (typeof page.title !== "string") return null
    try {
      validateNotebookId(page.pageId)
    } catch {
      return null
    }

    const orientation = sourceVersion === 1 ? 0 : page.orientation
    if (!isCanonicalOrientation(orientation)) return null
    const logicalSize = sourceVersion === 1
      ? NOTEBOOK_DEFAULT_LOGICAL_SIZE
      : page.logicalSize
    if (!logicalSize || typeof logicalSize !== "object") return null
    const size = logicalSize as Record<string, unknown>
    if (
      !isFiniteNumber(size.width) || size.width <= 0 ||
      !isFiniteNumber(size.height) || size.height <= 0
    ) return null

    pages.push({
      pageId: page.pageId,
      ordinal: page.ordinal as number,
      title: page.title,
      orientation,
      logicalSize: { width: size.width, height: size.height },
    })
  }

  const ordinals = pages.map((page) => page.ordinal).sort((a, b) => a - b)
  for (let index = 0; index < ordinals.length; index += 1) {
    if (ordinals[index] !== index) return null
  }
  if (new Set(pages.map((page) => page.pageId)).size !== pages.length) return null
  return pages
}

function validPageState(
  pages: ReadonlyArray<NotebookPage>,
  activePageId: unknown,
  selectedPageIds: unknown,
): activePageId is string {
  if (typeof activePageId !== "string" || !Array.isArray(selectedPageIds)) return false
  if (!pages.some((page) => page.pageId === activePageId)) return false
  if (!selectedPageIds.every((pageId) => typeof pageId === "string")) return false
  const selected = selectedPageIds as string[]
  if (new Set(selected).size !== selected.length || !selected.includes(activePageId)) return false
  const liveIds = new Set(pages.map((page) => page.pageId))
  if (selected.some((pageId) => !liveIds.has(pageId))) return false
  const documentOrder = [...pages]
    .sort((a, b) => a.ordinal - b.ordinal)
    .filter((page) => selected.includes(page.pageId))
    .map((page) => page.pageId)
  return documentOrder.length === selected.length &&
    documentOrder.every((pageId, index) => pageId === selected[index])
}

function parsePageStateSnapshot(raw: unknown): NotebookPageStateSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  const pages = parseNotebookPages(candidate.pages, 2)
  if (!pages || !validPageState(pages, candidate.activePageId, candidate.selectedPageIds)) {
    return null
  }
  return {
    pages,
    activePageId: candidate.activePageId,
    selectedPageIds: [...(candidate.selectedPageIds as string[])],
  }
}

function parseHistoryEntry(raw: unknown): NotebookHistoryEntry | null {
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  if (typeof candidate.commandId !== "string") return null
  try {
    validateNotebookCommandId(candidate.commandId)
  } catch {
    return null
  }
  if (
    typeof candidate.kind !== "string" ||
    !NOTEBOOK_HISTORY_KINDS.has(candidate.kind as NotebookHistoryCommandKind)
  ) return null
  if (!isFiniteNumber(candidate.at)) return null
  const before = parsePageStateSnapshot(candidate.before)
  const after = parsePageStateSnapshot(candidate.after)
  if (!before || !after) return null

  let effect: NotebookHistoryEffect | undefined
  if (candidate.kind === "rotate_page" && candidate.effect === undefined) return null
  if (candidate.effect !== undefined) {
    if (!candidate.effect || typeof candidate.effect !== "object") return null
    const rawEffect = candidate.effect as Record<string, unknown>
    if (
      candidate.kind !== "rotate_page" ||
      rawEffect.kind !== "rotate_page" ||
      !Array.isArray(rawEffect.pageIds) || rawEffect.pageIds.length === 0 ||
      !rawEffect.pageIds.every((pageId) => typeof pageId === "string") ||
      new Set(rawEffect.pageIds).size !== rawEffect.pageIds.length ||
      (rawEffect.quarterTurns !== 1 && rawEffect.quarterTurns !== 2 &&
        rawEffect.quarterTurns !== 3)
    ) return null
    effect = {
      kind: "rotate_page",
      pageIds: [...rawEffect.pageIds] as string[],
      quarterTurns: rawEffect.quarterTurns,
    }
  }

  return {
    commandId: candidate.commandId,
    kind: candidate.kind as NotebookHistoryCommandKind,
    at: candidate.at,
    before,
    after,
    ...(effect ? { effect } : {}),
  }
}

function parseHistory(raw: unknown): NotebookHistory | null {
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  if (!Array.isArray(candidate.undo) || !Array.isArray(candidate.redo)) return null
  if (candidate.undo.length + candidate.redo.length > NOTEBOOK_HISTORY_LIMIT) return null
  const undo = candidate.undo.map(parseHistoryEntry)
  const redo = candidate.redo.map(parseHistoryEntry)
  if (undo.some((entry) => !entry) || redo.some((entry) => !entry)) return null
  const entries = [...undo, ...redo] as NotebookHistoryEntry[]
  if (new Set(entries.map((entry) => entry.commandId)).size !== entries.length) return null
  return { undo: undo as NotebookHistoryEntry[], redo: redo as NotebookHistoryEntry[] }
}

type ParsedNotebookDocument = Readonly<{
  document: NotebookDocument
  sourceVersion: 1 | 2
}>

function parseNotebookDocumentWithVersion(json: string): ParsedNotebookDocument | null {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return null
  }
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  if (candidate.v !== 1 && candidate.v !== NOTEBOOK_SCHEMA_VERSION) return null
  const sourceVersion = candidate.v as 1 | 2
  if (candidate.kind !== "notebook") return null
  if (typeof candidate.documentId !== "string") return null
  if (typeof candidate.title !== "string") return null
  if (!isFiniteNumber(candidate.createdAt) || !isFiniteNumber(candidate.updatedAt)) return null
  try {
    validateNotebookId(candidate.documentId)
  } catch {
    return null
  }

  const pages = parseNotebookPages(candidate.pages, sourceVersion)
  if (!pages) return null
  const firstPage = [...pages].sort((a, b) => a.ordinal - b.ordinal)[0]
  if (!firstPage) return null

  if (sourceVersion === 1) {
    return {
      sourceVersion,
      document: {
        v: NOTEBOOK_SCHEMA_VERSION,
        kind: "notebook",
        documentId: candidate.documentId,
        title: candidate.title,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        pages,
        revision: 0,
        recentCommandIds: [],
        activePageId: firstPage.pageId,
        selectedPageIds: [firstPage.pageId],
        history: { undo: [], redo: [] },
      },
    }
  }

  if (!Number.isInteger(candidate.revision) || (candidate.revision as number) < 0) return null
  if (
    !Array.isArray(candidate.recentCommandIds) ||
    candidate.recentCommandIds.length > NOTEBOOK_RECENT_COMMAND_LIMIT ||
    !candidate.recentCommandIds.every((commandId) => typeof commandId === "string") ||
    new Set(candidate.recentCommandIds).size !== candidate.recentCommandIds.length
  ) return null
  for (const commandId of candidate.recentCommandIds as string[]) {
    try {
      validateNotebookCommandId(commandId)
    } catch {
      return null
    }
  }
  if (!validPageState(pages, candidate.activePageId, candidate.selectedPageIds)) return null
  const history = parseHistory(candidate.history)
  if (!history) return null
  return {
    sourceVersion,
    document: {
      v: NOTEBOOK_SCHEMA_VERSION,
      kind: "notebook",
      documentId: candidate.documentId,
      title: candidate.title,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      pages,
      revision: candidate.revision as number,
      recentCommandIds: [...(candidate.recentCommandIds as string[])],
      activePageId: candidate.activePageId,
      selectedPageIds: [...(candidate.selectedPageIds as string[])],
      history,
    },
  }
}

/**
 * Rilegge un manifest. Restituisce `null` — e non un documento parziale — per
 * ogni forma che non riconosce: schema diverso, campi mancanti, ordinali non
 * contigui. Un taccuino mezzo letto sarebbe peggio di un taccuino non letto,
 * perche' verrebbe poi riscritto sopra l'originale.
 */
export function parseNotebookDocument(json: string): NotebookDocument | null {
  return parseNotebookDocumentWithVersion(json)?.document ?? null
}

// --- PERSISTENZA ---
//
// Il contratto e' strutturale e minimo: read/write/list. `WorkspaceStore` lo
// soddisfa senza modifiche, e non nasce un secondo store. Prendere lo store
// come parametro invece di importare il singleton e' cio' che rende questi
// percorsi verificabili senza un browser.

export type NotebookStore = {
  read(path: string): Promise<Blob | null>
  write(path: string, data: Blob): Promise<void>
}

export type NotebookListStore = NotebookStore & {
  list(prefix?: string): Promise<ReadonlyArray<{ path: string }>>
}

export type NotebookSummary = Readonly<{
  documentId: string
  title: string
  updatedAt: number
  pageCount: number
}>

/**
 * Esito esplicito dell'apertura del manifest.
 *
 * `missing` e `corrupt` non sono intercambiabili: soltanto il primo autorizza
 * la creazione di un nuovo taccuino. Trattare un file illeggibile come assente
 * trasformerebbe un errore recuperabile in sovrascrittura distruttiva.
 */
export type NotebookInspection =
  | Readonly<{ kind: "ready"; document: NotebookDocument }>
  | Readonly<{ kind: "missing" }>
  | Readonly<{
    kind: "corrupt"
    reason: "invalid-manifest" | "document-id-mismatch"
  }>

function jsonBlob(text: string): Blob {
  return new Blob([text], { type: "application/json" })
}

export async function saveNotebook(store: NotebookStore, doc: NotebookDocument): Promise<void> {
  const normalized = normalizeNotebookDocument(doc)
  const paths = notebookPaths(normalized.documentId)
  await store.write(paths.manifest, jsonBlob(serializeNotebookDocument(normalized)))
}

const notebookCreations = new WeakMap<NotebookStore, Map<string, Promise<NotebookDocument>>>()

/**
 * Crea soltanto dopo aver verificato nuovamente l'assenza del manifest e
 * serializza le creazioni concorrenti nello stesso runtime.
 *
 * Il contratto read/write di NotebookStore non espone una CAS cross-processo:
 * questa funzione elimina le corse di StrictMode e delle viste nello stesso
 * runtime, ma non viene presentata come lock distribuito fra tab indipendenti.
 */
export function createNotebookIfMissing(
  store: NotebookStore,
  candidate: NotebookDocument,
): Promise<NotebookDocument> {
  let normalizedCandidate: NotebookDocument
  try {
    normalizedCandidate = normalizeNotebookDocument(candidate)
  } catch (error) {
    return Promise.reject(error)
  }
  const documentId = normalizedCandidate.documentId
  let byDocument = notebookCreations.get(store)
  if (!byDocument) {
    byDocument = new Map()
    notebookCreations.set(store, byDocument)
  }
  const pending = byDocument.get(documentId)
  if (pending) return pending

  const operation = (async () => {
    const inspection = await inspectNotebook(store, documentId)
    if (inspection.kind === "ready") return inspection.document
    if (inspection.kind === "corrupt") {
      throw new Error("Cannot create notebook over a corrupt manifest")
    }
    await saveNotebook(store, normalizedCandidate)
    const persisted = await inspectNotebook(store, documentId)
    if (persisted.kind !== "ready") {
      throw new Error("Notebook creation could not be verified")
    }
    return persisted.document
  })()
  byDocument.set(documentId, operation)
  void operation.then(
    () => {
      if (byDocument?.get(documentId) === operation) byDocument.delete(documentId)
    },
    () => {
      if (byDocument?.get(documentId) === operation) byDocument.delete(documentId)
    },
  )
  return operation
}

export async function loadNotebook(
  store: NotebookStore,
  documentId: string,
): Promise<NotebookDocument | null> {
  const inspection = await inspectNotebook(store, documentId)
  return inspection.kind === "ready" ? inspection.document : null
}

export async function inspectNotebook(
  store: NotebookStore,
  documentId: string,
): Promise<NotebookInspection> {
  const requestedId = validateNotebookId(documentId)
  const paths = notebookPaths(requestedId)
  const blob = await store.read(paths.manifest)
  if (!blob) return { kind: "missing" }
  const document = parseNotebookDocument(await blob.text())
  if (!document) return { kind: "corrupt", reason: "invalid-manifest" }
  if (document.documentId !== requestedId) {
    return { kind: "corrupt", reason: "document-id-mismatch" }
  }
  return { kind: "ready", document }
}

export type NotebookMigrationResult = Readonly<{
  kind: "migrated" | "already-current"
  document: NotebookDocument
}>

async function restoreNotebookManifest(
  store: NotebookStore,
  manifestPath: string,
  originalBytes: string,
): Promise<void> {
  let writeFailure: unknown
  try {
    await store.write(manifestPath, jsonBlob(originalBytes))
  } catch (error) {
    writeFailure = error
  }

  let restored: Blob | null
  try {
    restored = await store.read(manifestPath)
  } catch (verificationError) {
    throw new AggregateError(
      [writeFailure, verificationError].filter(Boolean),
      "Notebook manifest rollback could not be verified",
      { cause: verificationError },
    )
  }
  if (restored && await restored.text() === originalBytes) return
  throw new AggregateError(
    [writeFailure, new Error("Notebook manifest rollback byte mismatch")].filter(Boolean),
    "Notebook manifest rollback failed",
  )
}

/**
 * Converte esplicitamente un manifest v1 nel formato corrente.
 *
 * La lettura normale resta non mutante. La migrazione conserva invece gli
 * esatti byte originali, verifica il candidato riletto come v2 e compensa ogni
 * fallimento osservabile prima di propagare l'errore.
 */
async function migrateNotebookDocumentUnlocked(
  store: NotebookStore,
  documentId: string,
): Promise<NotebookMigrationResult> {
  const requestedId = validateNotebookId(documentId)
  const manifestPath = notebookPaths(requestedId).manifest
  const originalBlob = await store.read(manifestPath)
  if (!originalBlob) throw new Error("Cannot migrate a missing notebook manifest")
  const originalBytes = await originalBlob.text()
  const parsed = parseNotebookDocumentWithVersion(originalBytes)
  if (!parsed) throw new Error("Cannot migrate a corrupt notebook manifest")
  if (parsed.document.documentId !== requestedId) {
    throw new Error("Cannot migrate a mismatched notebook manifest")
  }
  if (parsed.sourceVersion === NOTEBOOK_SCHEMA_VERSION) {
    return { kind: "already-current", document: parsed.document }
  }

  const candidateBytes = serializeNotebookDocument(parsed.document)
  try {
    await store.write(manifestPath, jsonBlob(candidateBytes))
    const verifiedBlob = await store.read(manifestPath)
    if (!verifiedBlob) throw new Error("Notebook migration readback is missing")
    const verifiedBytes = await verifiedBlob.text()
    const verified = parseNotebookDocumentWithVersion(verifiedBytes)
    if (
      !verified ||
      verified.sourceVersion !== NOTEBOOK_SCHEMA_VERSION ||
      verified.document.documentId !== requestedId ||
      serializeNotebookDocument(verified.document) !== candidateBytes
    ) {
      throw new Error("Notebook migration readback verification failed")
    }
    return { kind: "migrated", document: verified.document }
  } catch (migrationError) {
    let currentBytes: string | null
    try {
      const current = await store.read(manifestPath)
      currentBytes = current ? await current.text() : null
    } catch (readError) {
      throw new AggregateError(
        [migrationError, readError],
        "Notebook migration failed and rollback state could not be read",
        { cause: readError },
      )
    }
    const currentParsed = currentBytes === null
      ? null
      : parseNotebookDocumentWithVersion(currentBytes)
    const distinctValidV2Writer = currentBytes !== candidateBytes &&
      currentParsed?.sourceVersion === NOTEBOOK_SCHEMA_VERSION &&
      currentParsed.document.documentId === requestedId
    if (currentBytes !== originalBytes && !distinctValidV2Writer) {
      try {
        await restoreNotebookManifest(store, manifestPath, originalBytes)
      } catch (rollbackError) {
        throw new AggregateError(
          [migrationError, rollbackError],
          "Notebook migration and rollback failed",
          { cause: rollbackError },
        )
      }
    }
    throw migrationError
  }
}

export function migrateNotebookDocument(
  store: NotebookStore,
  documentId: string,
): Promise<NotebookMigrationResult> {
  return withMigratedNotebookDocumentLease(
    store,
    documentId,
    async (result) => result,
  )
}

/** Compone migrazione e operazione chiamante nella stessa lease non rientrante. */
export function withMigratedNotebookDocumentLease<T>(
  store: NotebookStore,
  documentId: string,
  operation: (migration: NotebookMigrationResult) => Promise<T>,
): Promise<T> {
  return withNotebookDocumentLease(documentId, async () => {
    const migration = await migrateNotebookDocumentUnlocked(store, documentId)
    return operation(migration)
  })
}

export async function saveNotebookPageScene(
  store: NotebookStore,
  documentId: string,
  pageId: string,
  sceneJson: string,
): Promise<void> {
  const paths = notebookPaths(documentId)
  await store.write(paths.pageScene(pageId), jsonBlob(sceneJson))
}

export async function loadNotebookPageScene(
  store: NotebookStore,
  documentId: string,
  pageId: string,
): Promise<string | null> {
  const paths = notebookPaths(documentId)
  const blob = await store.read(paths.pageScene(pageId))
  if (!blob) return null
  return blob.text()
}

/**
 * Elenca i taccuini leggendo i manifest sotto `notebooks/`.
 *
 * Il referente e' derivato dal prefisso di path, non da un elenco mantenuto a
 * mano: un taccuino esiste se e solo se esiste il suo manifest. Un manifest
 * illeggibile viene saltato e non interrompe l'elenco — un file corrotto non
 * deve nascondere gli altri taccuini dell'utente.
 */
export async function listNotebooks(store: NotebookListStore): Promise<ReadonlyArray<NotebookSummary>> {
  const rootPrefix = `${NOTEBOOK_ROOT}/`
  const manifestSuffix = "/notebook.json"
  const entries = await store.list(rootPrefix)
  const summaries: NotebookSummary[] = []
  for (const entry of entries) {
    if (!entry.path.startsWith(rootPrefix) || !entry.path.endsWith(manifestSuffix)) continue
    const pathDocumentId = entry.path.slice(rootPrefix.length, -manifestSuffix.length)
    if (!pathDocumentId || pathDocumentId.includes("/")) continue
    try {
      validateNotebookId(pathDocumentId)
    } catch {
      continue
    }
    const blob = await store.read(entry.path)
    if (!blob) continue
    const doc = parseNotebookDocument(await blob.text())
    if (!doc || doc.documentId !== pathDocumentId) continue
    summaries.push({
      documentId: doc.documentId,
      title: doc.title,
      updatedAt: doc.updatedAt,
      pageCount: doc.pages.length,
    })
  }
  return summaries.sort((a, b) => b.updatedAt - a.updatedAt)
}
