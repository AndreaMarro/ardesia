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

export const NOTEBOOK_SCHEMA_VERSION = 1

/** Namespace di archiviazione. Deliberatamente NON `raw/`: vedi sopra. */
const NOTEBOOK_ROOT = "notebooks"

const NOTEBOOK_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/
const WINDOWS_DEVICE_PATTERN = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i

export type NotebookPage = Readonly<{
  pageId: string
  /** Posizione nell'ordine, 0-based e contigua. Un buco e' corruzione. */
  ordinal: number
  title: string
}>

export type NotebookDocument = Readonly<{
  v: number
  kind: "notebook"
  documentId: string
  title: string
  createdAt: number
  updatedAt: number
  pages: ReadonlyArray<NotebookPage>
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

/**
 * Id di pagina derivato dall'ordinale.
 *
 * Vincolo che questa scelta impone e che va rispettato quando arrivera' la
 * cancellazione: **non ricompattare gli ordinali**, o due pagine diverse
 * finirebbero per condividere un id in momenti diversi della storia del
 * documento — esattamente il difetto di identita' che KERN-001 e KERN-007
 * vietano. Il giorno che serve cancellare, serve un contatore nel manifest, e
 * sara' un test a chiederlo.
 */
function pageIdForOrdinal(ordinal: number): string {
  return `p${ordinal + 1}`
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
    // pagine sarebbe uno stato vuoto che l'utente non ha chiesto.
    pages: [{ pageId: pageIdForOrdinal(0), ordinal: 0, title: "Pagina 1" }],
  }
}

export function appendNotebookPage(
  doc: NotebookDocument,
  options: { title?: string; now: number },
): NotebookDocument {
  const ordinal = doc.pages.length
  const page: NotebookPage = {
    pageId: pageIdForOrdinal(ordinal),
    ordinal,
    title: options.title ?? `Pagina ${ordinal + 1}`,
  }
  return { ...doc, pages: [...doc.pages, page], updatedAt: options.now }
}

/** Le pagine in ordine di lettura. L'ordine non dipende da come sono elencate. */
export function orderedNotebookPages(doc: NotebookDocument): ReadonlyArray<NotebookPage> {
  return [...doc.pages].sort((a, b) => a.ordinal - b.ordinal)
}

export function serializeNotebookDocument(doc: NotebookDocument): string {
  return JSON.stringify(doc)
}

/**
 * Rilegge un manifest. Restituisce `null` — e non un documento parziale — per
 * ogni forma che non riconosce: schema diverso, campi mancanti, ordinali non
 * contigui. Un taccuino mezzo letto sarebbe peggio di un taccuino non letto,
 * perche' verrebbe poi riscritto sopra l'originale.
 */
export function parseNotebookDocument(json: string): NotebookDocument | null {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return null
  }
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>

  if (candidate.v !== NOTEBOOK_SCHEMA_VERSION) return null
  if (candidate.kind !== "notebook") return null
  if (typeof candidate.documentId !== "string") return null
  if (typeof candidate.title !== "string") return null
  if (typeof candidate.createdAt !== "number") return null
  if (typeof candidate.updatedAt !== "number") return null
  if (!Array.isArray(candidate.pages) || candidate.pages.length === 0) return null

  const pages: NotebookPage[] = []
  for (const entry of candidate.pages) {
    if (!entry || typeof entry !== "object") return null
    const page = entry as Record<string, unknown>
    if (typeof page.pageId !== "string") return null
    if (typeof page.ordinal !== "number") return null
    if (typeof page.title !== "string") return null
    try {
      validateNotebookId(page.pageId)
    } catch {
      return null
    }
    pages.push({ pageId: page.pageId, ordinal: page.ordinal, title: page.title })
  }

  // Ordinali contigui 0..n-1: la sola forma d'ordine che questo documento
  // ammette. Un buco significa che una scrittura si e' persa.
  const ordinals = pages.map((p) => p.ordinal).sort((a, b) => a - b)
  for (let i = 0; i < ordinals.length; i += 1) {
    if (ordinals[i] !== i) return null
  }
  const ids = new Set(pages.map((p) => p.pageId))
  if (ids.size !== pages.length) return null

  try {
    validateNotebookId(candidate.documentId)
  } catch {
    return null
  }

  return {
    v: NOTEBOOK_SCHEMA_VERSION,
    kind: "notebook",
    documentId: candidate.documentId,
    title: candidate.title,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    pages,
  }
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
  const paths = notebookPaths(doc.documentId)
  await store.write(paths.manifest, jsonBlob(serializeNotebookDocument(doc)))
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
  const documentId = validateNotebookId(candidate.documentId)
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
    await saveNotebook(store, candidate)
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
  const entries = await store.list(`${NOTEBOOK_ROOT}/`)
  const summaries: NotebookSummary[] = []
  for (const entry of entries) {
    const match = /^notebooks\/([^/]+)\/notebook\.json$/.exec(entry.path)
    if (!match) continue
    const pathDocumentId = match[1]!
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
