// @vitest-environment node

// Stress generativo del sistema pagine del Taccuino.
//
// Regola che rende questo file utile invece che decorativo: il **modello di
// riferimento qui sotto non importa nessun trasformatore di produzione e non ne
// copia l'algoritmo**. È riscritto dalla specifica — inserimento, duplicazione,
// rinomina, eliminazione recuperabile, riordino, rotazione, undo/redo e stato di
// vista — perché un oracolo che chiama la funzione che deve sorvegliare non può
// vederla sbagliare.
//
// Tre proprietà che una suite di casi non copre:
//  1. sequenze lunghe: gli errori di ordinale e di selezione si accumulano;
//  2. serialize/parse/reload a intervalli deterministici: ciò che sopravvive al
//     disco è l'unica cosa che l'utente ritrova;
//  3. fault injection sul boundary di persistenza: una write fallita non deve
//     lasciare né stato visibile né storia fantasma.
//
// Determinismo: PRNG seedato, nessun `Math.random`, nessun `Date.now` — sono
// proprio le sorgenti che AGENTS.md §3 vieta nel percorso di REPLAY, e senza le
// quali un fallimento non si riproduce.

import { describe, expect, it } from "vitest"
import {
  NOTEBOOK_DEFAULT_LOGICAL_SIZE,
  createNotebookDocument,
  loadNotebook,
  notebookPaths,
  saveNotebook,
  serializeNotebookDocument,
  type NotebookDocument,
  type NotebookStore,
} from "../store/notebookDocument"
import { executeNotebookCommand } from "../store/notebookCommands"

// ---------------------------------------------------------------------------
// PRNG deterministico
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Modello di riferimento — scritto dalla specifica, non dal codice
// ---------------------------------------------------------------------------

type RefPage = {
  pageId: string
  title: string
  orientation: number
  width: number
  height: number
}

type RefSnapshot = {
  pages: RefPage[]
  activePageId: string
  selectedPageIds: string[]
}

type RefEntry = { before: RefSnapshot; after: RefSnapshot }

type RefState = {
  pages: RefPage[]
  activePageId: string
  selectedPageIds: string[]
  undo: RefEntry[]
  redo: RefEntry[]
}

const HISTORY_LIMIT = 50

function copyPages(pages: RefPage[]): RefPage[] {
  return pages.map((page) => ({ ...page }))
}

function snap(state: RefState): RefSnapshot {
  return {
    pages: copyPages(state.pages),
    activePageId: state.activePageId,
    selectedPageIds: [...state.selectedPageIds],
  }
}

function pushHistory(state: RefState, before: RefSnapshot): void {
  state.undo.push({ before, after: snap(state) })
  if (state.undo.length > HISTORY_LIMIT) state.undo.shift()
  state.redo = []
}

function restore(state: RefState, into: RefSnapshot): void {
  state.pages = copyPages(into.pages)
  state.activePageId = into.activePageId
  state.selectedPageIds = [...into.selectedPageIds]
}

/** La selezione vive in ordine di documento: qui si ricompatta, non si assume. */
function inDocumentOrder(state: RefState, ids: Iterable<string>): string[] {
  const wanted = new Set(ids)
  return state.pages.map((page) => page.pageId).filter((id) => wanted.has(id))
}

function refInitial(): RefState {
  return {
    pages: [{
      pageId: "p1",
      title: "Pagina 1",
      orientation: 0,
      width: NOTEBOOK_DEFAULT_LOGICAL_SIZE.width,
      height: NOTEBOOK_DEFAULT_LOGICAL_SIZE.height,
    }],
    activePageId: "p1",
    selectedPageIds: ["p1"],
    undo: [],
    redo: [],
  }
}

function refInsert(state: RefState, targetPageId: string, pageId: string, before: boolean): void {
  const prima = snap(state)
  const index = state.pages.findIndex((page) => page.pageId === targetPageId)
  const at = before ? index : index + 1
  state.pages.splice(at, 0, {
    pageId,
    title: `Pagina ${at + 1}`,
    orientation: 0,
    width: NOTEBOOK_DEFAULT_LOGICAL_SIZE.width,
    height: NOTEBOOK_DEFAULT_LOGICAL_SIZE.height,
  })
  state.activePageId = pageId
  state.selectedPageIds = [pageId]
  pushHistory(state, prima)
}

function refDuplicate(state: RefState, sourcePageId: string, pageId: string): void {
  const prima = snap(state)
  const index = state.pages.findIndex((page) => page.pageId === sourcePageId)
  const source = state.pages[index]!
  state.pages.splice(index + 1, 0, {
    ...source,
    pageId,
    title: `Copia di ${source.title}`,
  })
  state.activePageId = pageId
  state.selectedPageIds = [pageId]
  pushHistory(state, prima)
}

function refRename(state: RefState, pageId: string, title: string): boolean {
  const page = state.pages.find((candidate) => candidate.pageId === pageId)!
  if (page.title === title) return false
  const prima = snap(state)
  page.title = title
  pushHistory(state, prima)
  return true
}

function refDelete(state: RefState, pageId: string): void {
  const prima = snap(state)
  const index = state.pages.findIndex((page) => page.pageId === pageId)
  const successore = state.pages[index + 1]?.pageId ?? state.pages[index - 1]!.pageId
  state.pages.splice(index, 1)
  if (state.activePageId === pageId) state.activePageId = successore
  const superstiti = new Set(state.selectedPageIds.filter((id) => id !== pageId))
  superstiti.add(state.activePageId)
  state.selectedPageIds = inDocumentOrder(state, superstiti)
  pushHistory(state, prima)
}

function refReorder(state: RefState, targetIndex: number): boolean {
  const selezione = new Set(state.selectedPageIds)
  const mossi = state.pages.filter((page) => selezione.has(page.pageId))
  const restanti = state.pages.filter((page) => !selezione.has(page.pageId))
  const nuovo = [
    ...restanti.slice(0, targetIndex),
    ...mossi,
    ...restanti.slice(targetIndex),
  ]
  if (nuovo.every((page, i) => page.pageId === state.pages[i]?.pageId)) return false
  const prima = snap(state)
  state.pages = nuovo
  state.selectedPageIds = inDocumentOrder(state, selezione)
  pushHistory(state, prima)
  return true
}

function refRotate(state: RefState, quarterTurns: number): void {
  const prima = snap(state)
  const selezione = new Set(state.selectedPageIds)
  state.pages = state.pages.map((page) => {
    if (!selezione.has(page.pageId)) return page
    return {
      ...page,
      orientation: (page.orientation + quarterTurns * 90) % 360,
      width: quarterTurns % 2 === 1 ? page.height : page.width,
      height: quarterTurns % 2 === 1 ? page.width : page.height,
    }
  })
  pushHistory(state, prima)
}

function refUndo(state: RefState): boolean {
  const entry = state.undo.pop()
  if (!entry) return false
  restore(state, entry.before)
  state.redo.push(entry)
  return true
}

function refRedo(state: RefState): boolean {
  const entry = state.redo.pop()
  if (!entry) return false
  restore(state, entry.after)
  state.undo.push(entry)
  if (state.undo.length > HISTORY_LIMIT) state.undo.shift()
  return true
}

function refSetViewState(state: RefState, activePageId: string, selected: string[]): boolean {
  const uguale = state.activePageId === activePageId &&
    state.selectedPageIds.length === selected.length &&
    state.selectedPageIds.every((id, i) => id === selected[i])
  if (uguale) return false
  state.activePageId = activePageId
  state.selectedPageIds = [...selected]
  return true
}

// ---------------------------------------------------------------------------
// Store in memoria, con iniezione di guasto sul boundary di scrittura
// ---------------------------------------------------------------------------

type FaultStore = NotebookStore & {
  files: Map<string, string>
  failNextWrite: boolean
  delete(path: string): Promise<void>
}

function memoryStore(): FaultStore {
  const files = new Map<string, string>()
  const store: FaultStore = {
    files,
    failNextWrite: false,
    async read(path) {
      const content = files.get(path)
      return content === undefined ? null : new Blob([content], { type: "application/json" })
    },
    async write(path, data) {
      if (store.failNextWrite) {
        store.failNextWrite = false
        throw new Error("guasto iniettato sul boundary di scrittura")
      }
      files.set(path, await data.text())
    },
    async delete(path) {
      files.delete(path)
    },
  }
  return store
}

// ---------------------------------------------------------------------------
// Confronto
// ---------------------------------------------------------------------------

type Osservazione = {
  pagine: Array<{ pageId: string; ordinal: number; title: string; orientation: number; width: number; height: number }>
  activePageId: string
  selectedPageIds: string[]
  undo: number
  redo: number
}

function osservaProdotto(doc: NotebookDocument): Osservazione {
  const ordinate = [...doc.pages].sort((a, b) => a.ordinal - b.ordinal)
  return {
    pagine: ordinate.map((page, ordinal) => ({
      pageId: page.pageId,
      ordinal,
      title: page.title,
      orientation: page.orientation,
      width: page.logicalSize.width,
      height: page.logicalSize.height,
    })),
    activePageId: doc.activePageId,
    selectedPageIds: [...doc.selectedPageIds],
    undo: doc.history.undo.length,
    redo: doc.history.redo.length,
  }
}

function osservaRiferimento(state: RefState): Osservazione {
  return {
    pagine: state.pages.map((page, ordinal) => ({
      pageId: page.pageId,
      ordinal,
      title: page.title,
      orientation: page.orientation,
      width: page.width,
      height: page.height,
    })),
    activePageId: state.activePageId,
    selectedPageIds: [...state.selectedPageIds],
    undo: state.undo.length,
    redo: state.redo.length,
  }
}

// ---------------------------------------------------------------------------
// Generatore e corsa
// ---------------------------------------------------------------------------

type Passo =
  | { kind: "insert_before" | "insert_after"; targetPageId: string; pageId: string }
  | { kind: "duplicate_page"; sourcePageId: string; pageId: string }
  | { kind: "rename_page"; pageId: string; title: string }
  | { kind: "delete_page"; pageId: string }
  | { kind: "reorder_pages"; targetIndex: number }
  | { kind: "rotate_page"; quarterTurns: 1 | 2 | 3 }
  | { kind: "undo" }
  | { kind: "redo" }
  | { kind: "set_view_state"; activePageId: string; selectedPageIds: string[] }

/**
 * Genera un passo **valido rispetto al modello di riferimento**.
 *
 * Un comando invalido è già coperto dai test mirati e qui produrrebbe soltanto
 * rumore: la domanda di questa suite è se prodotto e riferimento divergano su
 * comandi leciti, non se entrambi rifiutino gli illeciti.
 */
function generaPasso(rnd: () => number, state: RefState, contatore: number): Passo {
  const ids = state.pages.map((page) => page.pageId)
  const scelta = Math.floor(rnd() * 100)
  const nuovoId = `g${contatore}`
  const target = ids[Math.floor(rnd() * ids.length)]!

  if (scelta < 14) return { kind: "insert_after", targetPageId: target, pageId: nuovoId }
  if (scelta < 26) return { kind: "insert_before", targetPageId: target, pageId: nuovoId }
  if (scelta < 36) return { kind: "duplicate_page", sourcePageId: target, pageId: nuovoId }
  if (scelta < 48) return { kind: "rename_page", pageId: target, title: `T${contatore}` }
  if (scelta < 58 && state.pages.length > 1) return { kind: "delete_page", pageId: target }
  if (scelta < 70) {
    const restanti = state.pages.length - state.selectedPageIds.length
    return { kind: "reorder_pages", targetIndex: Math.floor(rnd() * (restanti + 1)) }
  }
  if (scelta < 80) {
    const quarti = (1 + Math.floor(rnd() * 3)) as 1 | 2 | 3
    return { kind: "rotate_page", quarterTurns: quarti }
  }
  if (scelta < 88) return { kind: "undo" }
  if (scelta < 94) return { kind: "redo" }

  // Stato di vista: la selezione DEVE contenere la pagina attiva ed essere in
  // ordine di documento — è l'invariante del boundary, non una comodità.
  const attiva = ids[Math.floor(rnd() * ids.length)]!
  const scelti = new Set<string>([attiva])
  for (const id of ids) if (rnd() < 0.4) scelti.add(id)
  return {
    kind: "set_view_state",
    activePageId: attiva,
    selectedPageIds: ids.filter((id) => scelti.has(id)),
  }
}

function applicaRiferimento(state: RefState, passo: Passo): void {
  switch (passo.kind) {
    case "insert_after":
      refInsert(state, passo.targetPageId, passo.pageId, false)
      break
    case "insert_before":
      refInsert(state, passo.targetPageId, passo.pageId, true)
      break
    case "duplicate_page":
      refDuplicate(state, passo.sourcePageId, passo.pageId)
      break
    case "rename_page":
      refRename(state, passo.pageId, passo.title)
      break
    case "delete_page":
      refDelete(state, passo.pageId)
      break
    case "reorder_pages":
      refReorder(state, passo.targetIndex)
      break
    case "rotate_page":
      refRotate(state, passo.quarterTurns)
      break
    case "undo":
      refUndo(state)
      break
    case "redo":
      refRedo(state)
      break
    case "set_view_state":
      refSetViewState(state, passo.activePageId, passo.selectedPageIds)
      break
  }
}

async function applicaProdotto(
  store: NotebookStore,
  documentId: string,
  state: RefState,
  passo: Passo,
  commandId: string,
  now: number,
): Promise<NotebookDocument> {
  const comune = { documentId, commandId, now }
  switch (passo.kind) {
    case "insert_after":
    case "insert_before":
      return (await executeNotebookCommand(store, {
        ...comune, kind: passo.kind, targetPageId: passo.targetPageId, pageId: passo.pageId,
      })).document
    case "duplicate_page":
      return (await executeNotebookCommand(store, {
        ...comune, kind: "duplicate_page", sourcePageId: passo.sourcePageId, pageId: passo.pageId,
      })).document
    case "rename_page":
      return (await executeNotebookCommand(store, {
        ...comune, kind: "rename_page", pageId: passo.pageId, title: passo.title,
      })).document
    case "delete_page":
      return (await executeNotebookCommand(store, {
        ...comune, kind: "delete_page", pageId: passo.pageId,
      })).document
    case "reorder_pages":
      return (await executeNotebookCommand(store, {
        ...comune, kind: "reorder_pages",
        pageIds: [...state.selectedPageIds], targetIndex: passo.targetIndex,
      })).document
    case "rotate_page":
      return (await executeNotebookCommand(store, {
        ...comune, kind: "rotate_page",
        pageIds: [...state.selectedPageIds], quarterTurns: passo.quarterTurns,
      })).document
    case "undo":
    case "redo":
      return (await executeNotebookCommand(store, { ...comune, kind: passo.kind })).document
    case "set_view_state":
      return (await executeNotebookCommand(store, {
        ...comune, kind: "set_view_state",
        activePageId: passo.activePageId, selectedPageIds: passo.selectedPageIds,
      })).document
  }
}

type Divergenza = {
  seed: number
  passo: number
  comando: string
  atteso: Osservazione
  osservato: Osservazione
  sequenza: Passo[]
  /** Presente quando il prodotto ha sollevato invece di divergere in silenzio. */
  eccezione?: string
}

/** Una corsa deterministica. Ritorna la prima divergenza, oppure `null`. */
async function corsa(seed: number, passi: number): Promise<Divergenza | null> {
  const rnd = mulberry32(seed)
  const documentId = `gen-${seed}`
  const store = memoryStore()
  let doc = createNotebookDocument({ documentId, title: "Generativo", now: 1 })
  await saveNotebook(store, doc)
  const state = refInitial()
  const sequenza: Passo[] = []

  for (let i = 0; i < passi; i += 1) {
    const passo = generaPasso(rnd, state, i)
    sequenza.push(passo)

    // Iniezione di guasto ogni 7 passi: la write fallisce, il comando deve
    // rifiutare e NON deve lasciare stato visibile né storia fantasma.
    if (i % 7 === 6) {
      const primaBytes = store.files.get(notebookPaths(documentId).manifest)!
      store.failNextWrite = true
      let sollevato = false
      try {
        await applicaProdotto(store, documentId, state, passo, `f-${seed}-${i}`, 100 + i)
      } catch {
        sollevato = true
      }
      store.failNextWrite = false
      const dopoBytes = store.files.get(notebookPaths(documentId).manifest)!
      if (sollevato && dopoBytes !== primaBytes) {
        return {
          seed, passo: i, comando: `${passo.kind} (guasto iniettato)`,
          atteso: osservaRiferimento(state),
          osservato: osservaProdotto((await loadNotebook(store, documentId))!),
          sequenza,
        }
      }
      // Un comando che non solleva ha scritto davvero: si prosegue applicandolo
      // anche al riferimento, altrimenti i due stati divergerebbero per
      // costruzione invece che per un difetto.
      if (!sollevato) {
        applicaRiferimento(state, passo)
        doc = (await loadNotebook(store, documentId))!
      }
      continue
    }

    // Un'eccezione su un comando LECITO è già una divergenza, e va riportata
    // con seme e sequenza come tutte le altre. Lasciandola propagare si perdeva
    // esattamente l'informazione per cui questa suite esiste: quale seme, quale
    // passo, quale prefisso minimo.
    try {
      doc = await applicaProdotto(store, documentId, state, passo, `c-${seed}-${i}`, 100 + i)
    } catch (errore) {
      return {
        seed,
        passo: i,
        comando: passo.kind,
        atteso: osservaRiferimento(state),
        osservato: osservaProdotto(doc),
        sequenza,
        eccezione: (errore as Error).message,
      }
    }
    applicaRiferimento(state, passo)

    // Reload deterministico ogni 5 passi: ciò che sopravvive a serialize/parse
    // è l'unica cosa che l'utente ritrova.
    if (i % 5 === 4) {
      const riletto = await loadNotebook(store, documentId)
      if (!riletto || serializeNotebookDocument(riletto) !== serializeNotebookDocument(doc)) {
        return {
          seed, passo: i, comando: `${passo.kind} (reload)`,
          atteso: osservaProdotto(doc),
          osservato: riletto ? osservaProdotto(riletto) : { ...osservaProdotto(doc), pagine: [] },
          sequenza,
        }
      }
      doc = riletto
    }

    const atteso = osservaRiferimento(state)
    const osservato = osservaProdotto(doc)
    if (JSON.stringify(atteso) !== JSON.stringify(osservato)) {
      return { seed, passo: i, comando: passo.kind, atteso, osservato, sequenza }
    }
  }
  return null
}

/** Riduce la sequenza fallente al prefisso minimo che ancora fallisce. */
async function riduci(divergenza: Divergenza): Promise<number> {
  let minimo = divergenza.passo + 1
  for (let lunghezza = 1; lunghezza <= divergenza.passo; lunghezza += 1) {
    if (await corsa(divergenza.seed, lunghezza)) {
      minimo = lunghezza
      break
    }
  }
  return minimo
}

// ---------------------------------------------------------------------------

// Budget dichiarato, non implicito: un test generativo senza tetto non è
// riproducibile e non è nemmeno onesto su quanto ha davvero esplorato.
// `120 x 60` costa `8,1 s` misurati e copre 7200 comandi, di cui ~1000 con
// guasto iniettato sul boundary di scrittura e ~1400 seguiti da reload.
const SEMI = 120
const PASSI = 60

describe("stress generativo del sistema pagine", () => {
  it(`non diverge dal modello di riferimento su ${SEMI} semi x ${PASSI} passi`, async () => {
    for (let seed = 1; seed <= SEMI; seed += 1) {
      const divergenza = await corsa(seed, PASSI)
      if (divergenza) {
        const minimo = await riduci(divergenza)
        throw new Error(
          `divergenza al seme ${divergenza.seed}, passo ${divergenza.passo} ` +
          `(${divergenza.comando}); prefisso minimo fallente: ${minimo} passi\n` +
          (divergenza.eccezione ? `eccezione: ${divergenza.eccezione}\n` : "") +
          `atteso:    ${JSON.stringify(divergenza.atteso)}\n` +
          `osservato: ${JSON.stringify(divergenza.osservato)}\n` +
          `sequenza:  ${JSON.stringify(divergenza.sequenza.slice(0, minimo))}`,
        )
      }
    }
  }, 60_000)

  it("una pagina sola sopravvive a undo, redo e rotazioni ripetute", async () => {
    const documentId = "gen-limite"
    const store = memoryStore()
    await saveNotebook(store, createNotebookDocument({ documentId, title: "Limite", now: 1 }))
    const state = refInitial()

    const passi: Passo[] = [
      { kind: "rotate_page", quarterTurns: 1 },
      { kind: "rotate_page", quarterTurns: 1 },
      { kind: "rotate_page", quarterTurns: 2 },
      { kind: "undo" },
      { kind: "undo" },
      { kind: "redo" },
      { kind: "rename_page", pageId: "p1", title: "Sola" },
      { kind: "undo" },
      { kind: "redo" },
    ]

    for (const [i, passo] of passi.entries()) {
      const doc = await applicaProdotto(store, documentId, state, passo, `l-${i}`, 200 + i)
      applicaRiferimento(state, passo)
      expect(osservaProdotto(doc)).toEqual(osservaRiferimento(state))
    }

    const riletto = await loadNotebook(store, documentId)
    expect(riletto).not.toBeNull()
    expect(osservaProdotto(riletto!)).toEqual(osservaRiferimento(state))
  })

  it("un guasto sulla write non lascia stato visibile né storia fantasma", async () => {
    const documentId = "gen-guasto"
    const store = memoryStore()
    await saveNotebook(store, createNotebookDocument({ documentId, title: "Guasto", now: 1 }))
    const path = notebookPaths(documentId).manifest
    const prima = store.files.get(path)!

    store.failNextWrite = true
    await expect(executeNotebookCommand(store, {
      kind: "insert_after",
      documentId,
      commandId: "guasto-1",
      targetPageId: "p1",
      pageId: "g-guasto",
      now: 2,
    })).rejects.toThrow()

    expect(store.files.get(path)).toBe(prima)
    const riletto = (await loadNotebook(store, documentId))!
    expect(riletto.pages).toHaveLength(1)
    expect(riletto.history.undo).toHaveLength(0)
    expect(riletto.history.redo).toHaveLength(0)
  })
})
