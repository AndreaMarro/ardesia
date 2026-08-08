// Superficie Taccuino — il documento ordinato e paginato.
//
// PC-R1-001 e PC-OBJ-001 → PRD §5.1 (R1 include un NotebookDocument paginato),
// §6.1 (`NotebookDocument └── Page[]`), §6.3 (ordinato e paginato, distinto
// dalla lavagna infinita).
//
// Cosa viene RIUSATO, per non duplicare il renderer:
//   - il componente Excalidraw e `EXCALIDRAW_CONFIG` (stessa carta calda
//     `#fffefb`, stesso inchiostro, stesso font della lavagna);
//   - `workspaceStore`, quindi lo stesso driver FSA/localStorage.
// Cosa e' NUOVO, perche' e' cio' che distingue il tipo di documento:
//   - un manifest ordinato di pagine e la loro navigazione.
//
// Fonti visuali (ledger `visual-source-ledger.md`): la striscia di pagine
// numerate viene da `G01_goodnotes_notebook_simulatore.png`, unica visuale del
// corpus con una superficie di scrittura paginata; la posizione esplicita
// nell'ordine viene da `A01_reader_editoriale_apple_books.png`. Respinti dal
// medesimo corpus: il pannello laterale sempre aperto di G01 e la doppia
// navigazione (tab + striscia) sullo stesso asse. `M07`/`M01` sono
// controesempi misurati di densita' e non sono stati trasferiti.

import { useCallback, useEffect, useRef, useState } from "react"
import { Excalidraw, serializeAsJSON } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./excalidrawConfig"
import ViewNav from "./ViewNav"
import NotebookPageManager from "./NotebookPageManager"
import {
  createNotebookIfMissing,
  createNotebookDocument,
  inspectNotebook,
  loadNotebookPageScene,
  migrateNotebookDocument,
  orderedNotebookPages,
  saveNotebookPageScene,
  type NotebookDocument,
} from "../store/notebookDocument"
import { executeNotebookCommand } from "../store/notebookCommands"
import { notebookManagerModel } from "../store/notebookPageManager"
import { notebookIdFromLocation } from "../store/notebookView"
import { workspaceStore } from "../store/WorkspaceStore"

type ExcalidrawApi = {
  getSceneElements: () => ReadonlyArray<unknown>
  getAppState: () => Record<string, unknown>
  getFiles: () => Record<string, unknown>
}

/** Ritardo di autosave. Abbastanza corto da non perdere un tratto, abbastanza
 *  lungo da non scrivere a ogni frame di un gesto continuo. */
const AUTOSAVE_MS = 400

type NotebookSceneData = Record<string, unknown>
type DirtyPage = Readonly<{ documentId: string; pageId: string }>
type SceneObservation = Readonly<{
  elements: ReadonlyArray<unknown>
  scrollX: unknown
  scrollY: unknown
  zoom: unknown
}>

function observeScene(
  elements: ReadonlyArray<unknown>,
  appState: object,
): SceneObservation {
  const state = appState as Readonly<Record<string, unknown>>
  const zoom = state.zoom && typeof state.zoom === "object"
    ? (state.zoom as Record<string, unknown>).value
    : state.zoom
  return {
    elements,
    scrollX: state.scrollX,
    scrollY: state.scrollY,
    zoom,
  }
}

function sameSceneObservation(a: SceneObservation | null, b: SceneObservation): boolean {
  return Boolean(
    a &&
    a.elements === b.elements &&
    a.scrollX === b.scrollX &&
    a.scrollY === b.scrollY &&
    a.zoom === b.zoom,
  )
}

function sceneInitialData(sceneJson: string | null): NotebookSceneData {
  if (!sceneJson) return { appState: EXCALIDRAW_CONFIG.newRoomAppState }
  const parsed: unknown = JSON.parse(sceneJson)
  if (!parsed || typeof parsed !== "object") throw new Error("invalid-scene")
  const scene = parsed as Record<string, unknown>
  if (!Array.isArray(scene.elements)) throw new Error("invalid-scene")
  const storedAppState = scene.appState && typeof scene.appState === "object"
    ? scene.appState as Record<string, unknown>
    : {}
  return {
    ...scene,
    // I default riempiono soltanto i campi assenti. Viewport, zoom e altre
    // preferenze salvate appartengono alla pagina e non vanno azzerate.
    appState: { ...EXCALIDRAW_CONFIG.newRoomAppState, ...storedAppState },
  }
}

function serializeNotebookScene(api: ExcalidrawApi, elements: ReadonlyArray<unknown>): string {
  const appState = api.getAppState()
  const exported = JSON.parse(serializeAsJSON(
    elements as never,
    appState as never,
    api.getFiles() as never,
    "local",
  )) as NotebookSceneData
  const exportedAppState = exported.appState && typeof exported.appState === "object"
    ? exported.appState as Record<string, unknown>
    : {}
  // `serializeAsJSON(..., "local")` filtra i campi browser-only. Nel
  // Taccuino il viewport appartiene invece alla singola pagina: lo rendiamo
  // esplicito nel file senza trascinare popup, selezioni o stato effimero.
  return JSON.stringify({
    ...exported,
    appState: {
      ...exportedAppState,
      scrollX: appState.scrollX,
      scrollY: appState.scrollY,
      zoom: appState.zoom,
    },
  })
}

export default function NotebookView() {
  const documentId = notebookIdFromLocation()
  const [doc, setDoc] = useState<NotebookDocument | null>(null)
  const [sceneData, setSceneData] = useState<NotebookSceneData | null>(null)
  /**
   * A quale pagina appartiene `sceneJson`. `null` = caricamento in corso.
   *
   * Excalidraw legge `initialData` UNA SOLA VOLTA, al montaggio. Montarlo appena
   * cambia la pagina significa montarlo sul contenuto della pagina precedente e
   * non riaggiornarlo mai: il canvas resta vuoto mentre lo stato dice che il
   * contenuto c'e'. E' esattamente il guasto che questo campo impedisce, ed e'
   * stato trovato guardando lo screenshot, non leggendo un test verde.
   */
  const [scenaPer, setScenaPer] = useState<string | null>(null)
  const [elementCount, setElementCount] = useState(0)
  const [salvatoAlle, setSalvatoAlle] = useState<string | null>(null)
  const [caricato, setCaricato] = useState(() => !documentId)
  const [erroreCaricamento, setErroreCaricamento] = useState<string | null>(null)
  const [erroreSalvataggio, setErroreSalvataggio] = useState<string | null>(null)
  const [modificheInAttesa, setModificheInAttesa] = useState(false)
  const [tentativo, setTentativo] = useState(0)
  const [ricaricaScena, setRicaricaScena] = useState(0)
  const [operazioneInCorso, setOperazioneInCorso] = useState(false)
  const [misuraSuperficie, setMisuraSuperficie] = useState<Readonly<{
    width: number
    height: number
  }> | null>(null)
  // Stato di VISTA, non di dominio: se il gestore e' aperto non cambia nulla di
  // cio' che il documento contiene, quindi non passa dal manifest e non entra
  // nella history. Pagina attiva e selezione — che sono dominio — restano
  // nell'unico posto in cui vivono gia': il `NotebookDocument`.
  const [gestoreAperto, setGestoreAperto] = useState(false)

  const apiRef = useRef<ExcalidrawApi | null>(null)
  const salvaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const paginaSporcaRef = useRef<DirtyPage | null>(null)
  const codaScrittureRef = useRef<Promise<void>>(Promise.resolve())
  const persistiScenaRef = useRef<() => Promise<void>>(async () => {})
  const flushInCorsoRef = useRef<Promise<void> | null>(null)
  const transizioneRef = useRef(false)
  const ultimaOsservazioneRef = useRef<SceneObservation | null>(null)
  const paginaAttivaButtonRef = useRef<HTMLButtonElement | null>(null)
  const superficieContenitoreRef = useRef<HTMLDivElement | null>(null)
  const gestoreButtonRef = useRef<HTMLButtonElement | null>(null)

  /** Chiude il gestore solo se il comando ha davvero committato. */
  function chiudiSeRiuscito(riuscito: boolean) {
    if (riuscito) chiudiGestoreConFocus()
  }

  function chiudiGestoreConFocus() {
    setGestoreAperto(false)
    // Il focus torna da dove e' partito: chiudere una superficie non deve
    // scaricare il focus sul body e costringere a ritabulare la strip.
    gestoreButtonRef.current?.focus()
  }

  // Carica (o crea) il taccuino e la scena della pagina corrente.
  useEffect(() => {
    let annullato = false
    if (!documentId) return
    void (async () => {
      try {
        await workspaceStore.init()
        const inspection = await inspectNotebook(workspaceStore, documentId)
        if (inspection.kind === "corrupt") {
          if (annullato) return
          setErroreCaricamento(
            "Il taccuino e' danneggiato o appartiene a un'altra lezione. " +
            "Il file originale non e' stato sovrascritto.",
          )
          setCaricato(true)
          return
        }
        let corrente = inspection.kind === "ready"
          ? (await migrateNotebookDocument(workspaceStore, documentId)).document
          : null
        if (!corrente) {
          const candidate = createNotebookDocument({
            documentId,
            title: "Taccuino della lezione",
            now: Date.now(),
          })
          if (annullato) return
          corrente = await createNotebookIfMissing(workspaceStore, candidate)
        }
        if (annullato) return
        setDoc(corrente)
      } catch (error) {
        if (annullato) return
        setErroreCaricamento(`Apertura del taccuino non riuscita: ${(error as Error).message}`)
      } finally {
        if (!annullato) setCaricato(true)
      }
    })()
    return () => {
      annullato = true
    }
  }, [documentId, tentativo])

  useEffect(() => {
    const contenitore = superficieContenitoreRef.current
    if (!contenitore) return
    const misura = () => {
      const bounds = contenitore.getBoundingClientRect()
      const next = { width: bounds.width, height: bounds.height }
      setMisuraSuperficie((current) => (
        current?.width === next.width && current.height === next.height ? current : next
      ))
    }
    misura()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(misura)
    observer.observe(contenitore)
    return () => { observer.disconnect() }
  }, [doc?.documentId])

  const pagine = doc ? orderedNotebookPages(doc) : []
  const pageIndex = doc
    ? pagine.findIndex((page) => page.pageId === doc.activePageId)
    : -1
  const paginaCorrente = pagine[pageIndex] ?? null
  const pageIdCorrente = paginaCorrente?.pageId ?? null
  // PC-R1-001 + GN-A0-012/GN-A1-002/GN-A7-012 → PRD §5.1 e §19.2:
  // selezione unica persistita e riordino equivalente fra input diversi.
  // Strip e gestore leggono la STESSA proiezione: quando la derivazione viveva
  // qui, il gestore avrebbe dovuto ricalcolarla e le due potevano divergere.
  const managerModel = doc ? notebookManagerModel(doc) : null
  const selectedPageIdSet = new Set(managerModel?.target.pageIds ?? [])
  const currentSelectionTargetIndex = managerModel?.reorderTargetIndex ?? 0
  const remainingPageCount = managerModel?.reorderBound ?? 0
  const identitaScenaCorrente = documentId && pageIdCorrente
    ? `${documentId}/${pageIdCorrente}`
    : null
  // PC-R1-001 + PC-OBJ-001 → PRD §5.1, §6.1 e §6.3: orientamento e
  // proporzioni appartengono alla Page del NotebookDocument. Il fit e' solo
  // una proiezione UI; non e' una prova dell'RPO 0 richiesto dal PRD §8.4.
  const pageAspectRatio = paginaCorrente
    ? paginaCorrente.logicalSize.width / paginaCorrente.logicalSize.height
    : 1
  const fittedSurfaceSize = misuraSuperficie
    ? misuraSuperficie.width / misuraSuperficie.height > pageAspectRatio
      ? {
          width: misuraSuperficie.height * pageAspectRatio,
          height: misuraSuperficie.height,
        }
      : {
          width: misuraSuperficie.width,
          height: misuraSuperficie.width / pageAspectRatio,
        }
    : null
  const superficiePagina = {
    ...superficie,
    width: fittedSurfaceSize?.width ?? "100%",
    height: fittedSurfaceSize?.height ?? "100%",
    aspectRatio: `${paginaCorrente?.logicalSize.width ?? 1} / ${paginaCorrente?.logicalSize.height ?? 1}`,
  }

  useEffect(() => {
    let annullato = false
    if (!documentId || !pageIdCorrente) return
    // La scena in memoria appartiene alla pagina PRECEDENTE finche' il caricamento
    // non finisce: dichiararlo subito impedisce di montare il canvas su dati
    // sbagliati.
    void (async () => {
      try {
        const salvata = await loadNotebookPageScene(workspaceStore, documentId, pageIdCorrente)
        const initialData = sceneInitialData(salvata)
        if (annullato) return
        setSceneData(initialData)
        setScenaPer(`${documentId}/${pageIdCorrente}`)
      } catch {
        if (annullato) return
        setErroreCaricamento(
          `La scena della pagina ${pageIdCorrente} e' danneggiata. Il file non e' stato sovrascritto.`,
        )
      }
    })()
    return () => {
      annullato = true
    }
  }, [documentId, pageIdCorrente, tentativo, ricaricaScena])

  async function persistiScena() {
    const sporca = paginaSporcaRef.current
    if (!sporca) {
      await codaScrittureRef.current
      return
    }
    const api = apiRef.current
    if (
      !api ||
      !documentId ||
      !pageIdCorrente ||
      sporca.documentId !== documentId ||
      sporca.pageId !== pageIdCorrente
    ) {
      const error = new Error("La pagina attiva e la modifica da salvare non coincidono")
      setErroreSalvataggio(error.message)
      throw error
    }
    const elements = api.getSceneElements()
    setElementCount(elements.length)
    const json = serializeNotebookScene(api, elements)
    // Lo snapshot e' catturato: una modifica successiva crea un nuovo marker.
    // In caso di errore questo marker viene ripristinato sotto.
    if (paginaSporcaRef.current === sporca) paginaSporcaRef.current = null
    const scrittura = codaScrittureRef.current.then(() => (
      saveNotebookPageScene(workspaceStore, sporca.documentId, sporca.pageId, json)
    ))
    // La coda continua anche dopo un errore; chi ha richiesto questa specifica
    // scrittura riceve invece il rigetto e puo' bloccare la navigazione.
    codaScrittureRef.current = scrittura.then(() => undefined, () => undefined)
    try {
      await scrittura
      if (!paginaSporcaRef.current) setModificheInAttesa(false)
      setErroreSalvataggio(null)
      setSalvatoAlle(
        new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
      )
    } catch (error) {
      if (!paginaSporcaRef.current) paginaSporcaRef.current = sporca
      setModificheInAttesa(true)
      setErroreSalvataggio(`Salvataggio non riuscito: ${(error as Error).message}`)
      throw error
    }
  }

  useEffect(() => {
    persistiScenaRef.current = persistiScena
  })

  function onChange(
    elements: ReadonlyArray<unknown>,
    appState: object,
  ) {
    if (transizioneRef.current || !documentId || !pageIdCorrente) return
    const osservazione = observeScene(elements, appState)
    if (sameSceneObservation(ultimaOsservazioneRef.current, osservazione)) return
    ultimaOsservazioneRef.current = osservazione
    setElementCount(elements.length)
    paginaSporcaRef.current = { documentId, pageId: pageIdCorrente }
    setModificheInAttesa(true)
    if (salvaTimer.current) clearTimeout(salvaTimer.current)
    salvaTimer.current = setTimeout(() => {
      salvaTimer.current = null
      void persistiScenaRef.current().catch(() => {})
    }, AUTOSAVE_MS)
  }

  /**
   * Scrive subito cio' che l'autosave sta ancora aspettando di scrivere.
   *
   * Pointer-up, key-up e navigazioni interne lo invocano. `pagehide` riduce la
   * finestra residua, ma una write asincrona avviata durante la terminazione
   * del processo non e' una prova di RPO 0: quel requisito resta separato.
   */
  const flush = useCallback((): Promise<void> => {
    if (flushInCorsoRef.current) return flushInCorsoRef.current
    const run = (async () => {
      if (salvaTimer.current) {
        clearTimeout(salvaTimer.current)
        salvaTimer.current = null
      }
      do {
        if (paginaSporcaRef.current) await persistiScenaRef.current()
        // Un flush e' una barriera di durabilita': se una seconda modifica e'
        // arrivata mentre la write precedente era in volo, deve drenare anche
        // quella. Restituire la promise gia' in corso senza questa seconda
        // passata farebbe apparire concluso il pointer-up lasciando il nuovo
        // marker affidato soltanto al debounce.
        await codaScrittureRef.current
      } while (paginaSporcaRef.current)
    })()
    flushInCorsoRef.current = run
    void run.finally(() => {
      if (flushInCorsoRef.current === run) flushInCorsoRef.current = null
    }).catch(() => {})
    return run
  }, [])

  useEffect(() => {
    const alNascondersi = () => {
      if (document.visibilityState === "hidden") void flush().catch(() => {})
    }
    const alUscire = () => { void flush().catch(() => {}) }
    window.addEventListener("pagehide", alUscire)
    document.addEventListener("visibilitychange", alNascondersi)
    return () => {
      window.removeEventListener("pagehide", alUscire)
      document.removeEventListener("visibilitychange", alNascondersi)
      void flush().catch(() => {})
    }
  }, [flush])

  const cambiaPagina = useCallback(async (pageId: string) => {
    if (!doc || !documentId || pageId === doc.activePageId || transizioneRef.current) return
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      await flush()
      const result = await executeNotebookCommand(workspaceStore, {
        kind: "set_view_state",
        documentId,
        commandId: `view-${crypto.randomUUID()}`,
        activePageId: pageId,
        selectedPageIds: [pageId],
        now: Date.now(),
      })
      apiRef.current = null
      ultimaOsservazioneRef.current = null
      setScenaPer(null)
      setSceneData(null)
      setDoc(result.document)
      setErroreSalvataggio(null)
    } catch (error) {
      if (!paginaSporcaRef.current) {
        setErroreSalvataggio(`Cambio pagina non riuscito: ${(error as Error).message}`)
      }
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }, [doc, documentId, flush])

  async function aggiungiPagina(posizione: "before" | "after"): Promise<boolean> {
    if (!doc || !documentId || !pageIdCorrente || transizioneRef.current) return false
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      try {
        await flush()
      } catch {
        // `persistiScena` ha gia' esposto l'errore specifico e la pagina
        // corrente non e' ancora durevole: non iniziare la creazione.
        return false
      }
      const pageId = `page-${crypto.randomUUID()}`
      const result = await executeNotebookCommand(workspaceStore, {
        kind: posizione === "before" ? "insert_before" : "insert_after",
        documentId,
        commandId: `insert-${crypto.randomUUID()}`,
        targetPageId: pageIdCorrente,
        pageId,
        now: Date.now(),
      })
      apiRef.current = null
      ultimaOsservazioneRef.current = null
      setScenaPer(null)
      setSceneData(null)
      setDoc(result.document)
      setErroreSalvataggio(null)
      return true
    } catch (error) {
      setErroreSalvataggio(`Creazione pagina non riuscita: ${(error as Error).message}`)
      return false
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  async function applicaCronologia(kind: "undo" | "redo") {
    if (!doc || !documentId || transizioneRef.current) return
    const historyEntry = kind === "undo"
      ? doc.history.undo.at(-1)
      : doc.history.redo.at(-1)
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      await flush()
      const result = await executeNotebookCommand(workspaceStore, {
        kind,
        documentId,
        commandId: `${kind}-${crypto.randomUUID()}`,
        now: Date.now(),
      })
      if (result.status === "noop") return
      if (
        historyEntry?.kind === "rotate_page" ||
        result.document.activePageId !== doc.activePageId
      ) {
        apiRef.current = null
        ultimaOsservazioneRef.current = null
        setScenaPer(null)
        setSceneData(null)
        setRicaricaScena((value) => value + 1)
      }
      setDoc(result.document)
      setErroreSalvataggio(null)
    } catch (error) {
      if (!paginaSporcaRef.current) {
        setErroreSalvataggio(`Cronologia pagina non riuscita: ${(error as Error).message}`)
      }
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  async function duplicaPagina(): Promise<boolean> {
    if (!doc || !documentId || !pageIdCorrente || transizioneRef.current) return false
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      await flush()
      const result = await executeNotebookCommand(workspaceStore, {
        kind: "duplicate_page",
        documentId,
        commandId: `duplicate-${crypto.randomUUID()}`,
        sourcePageId: pageIdCorrente,
        pageId: `page-${crypto.randomUUID()}`,
        now: Date.now(),
      })
      apiRef.current = null
      ultimaOsservazioneRef.current = null
      setScenaPer(null)
      setSceneData(null)
      setDoc(result.document)
      setErroreSalvataggio(null)
      return true
    } catch (error) {
      if (!paginaSporcaRef.current) {
        setErroreSalvataggio(`Duplicazione pagina non riuscita: ${(error as Error).message}`)
      }
      return false
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  async function rinominaPagina(pageId: string, title: string): Promise<boolean> {
    if (!doc || !documentId || transizioneRef.current) return false
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      await flush()
      const result = await executeNotebookCommand(workspaceStore, {
        kind: "rename_page",
        documentId,
        commandId: `rename-${crypto.randomUUID()}`,
        pageId,
        title,
        now: Date.now(),
      })
      setDoc(result.document)
      setErroreSalvataggio(null)
      return true
    } catch (error) {
      if (!paginaSporcaRef.current) {
        setErroreSalvataggio(`Rinomina pagina non riuscita: ${(error as Error).message}`)
      }
      return false
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  async function eliminaPagina(pageId: string): Promise<boolean> {
    // PC-R1-001 + GN-A1-003/GN-A7-012 → PRD §4.4 e §19.2:
    // il commit segue una conferma nominativa e mantiene un focus valido.
    if (!doc || !documentId || transizioneRef.current) return false
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      await flush()
      const result = await executeNotebookCommand(workspaceStore, {
        kind: "delete_page",
        documentId,
        commandId: `delete-${crypto.randomUUID()}`,
        pageId,
        now: Date.now(),
      })
      apiRef.current = null
      ultimaOsservazioneRef.current = null
      setScenaPer(null)
      setSceneData(null)
      setDoc(result.document)
      setErroreSalvataggio(null)
      return true
    } catch (error) {
      if (!paginaSporcaRef.current) {
        setErroreSalvataggio(`Eliminazione pagina non riuscita: ${(error as Error).message}`)
      }
      return false
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  // Boundary UI di PC-R1-001 / PRD §5.1 e §19.2: nessuna seconda
  // selezione volatile; ogni toggle e move passa dal manifest autorevole.
  async function toggleSelezionePagina(pageId: string, now: number) {
    if (!doc || !documentId || pageId === doc.activePageId || transizioneRef.current) return
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      const selected = new Set(doc.selectedPageIds)
      if (selected.has(pageId)) selected.delete(pageId)
      else selected.add(pageId)
      const selectedPageIds = pagine
        .map((page) => page.pageId)
        .filter((candidate) => selected.has(candidate))
      const result = await executeNotebookCommand(workspaceStore, {
        kind: "set_view_state",
        documentId,
        commandId: `selection-${crypto.randomUUID()}`,
        activePageId: doc.activePageId,
        selectedPageIds,
        now,
      })
      setDoc(result.document)
      setErroreSalvataggio(null)
    } catch (error) {
      setErroreSalvataggio(`Selezione pagine non riuscita: ${(error as Error).message}`)
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  async function spostaSelezione(direction: "up" | "down", now: number) {
    if (!doc || !documentId || transizioneRef.current) return
    const targetIndex = direction === "up"
      ? Math.max(0, currentSelectionTargetIndex - 1)
      : Math.min(remainingPageCount, currentSelectionTargetIndex + 1)
    if (targetIndex === currentSelectionTargetIndex) return
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      const result = await executeNotebookCommand(workspaceStore, {
        kind: "reorder_pages",
        documentId,
        commandId: `reorder-${crypto.randomUUID()}`,
        pageIds: doc.selectedPageIds,
        targetIndex,
        now,
      })
      setDoc(result.document)
      setErroreSalvataggio(null)
    } catch (error) {
      setErroreSalvataggio(`Riordino pagine non riuscito: ${(error as Error).message}`)
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  async function ruotaSelezione(now: number) {
    // PC-R1-001 + GN-A1-004/GN-A7-012 → PRD §5.1, §6.3 e §19.2:
    // il solo controllo opera sulla selezione persistita e rimonta la scena
    // trasformata; mouse, tastiera e touch condividono lo stesso button nativo.
    if (!doc || !documentId || transizioneRef.current) return
    transizioneRef.current = true
    setOperazioneInCorso(true)
    try {
      await flush()
      const result = await executeNotebookCommand(workspaceStore, {
        kind: "rotate_page",
        documentId,
        commandId: `rotate-${crypto.randomUUID()}`,
        pageIds: doc.selectedPageIds,
        quarterTurns: 1,
        now,
      })
      apiRef.current = null
      ultimaOsservazioneRef.current = null
      setScenaPer(null)
      setSceneData(null)
      setRicaricaScena((value) => value + 1)
      setDoc(result.document)
      setErroreSalvataggio(null)
    } catch (error) {
      if (!paginaSporcaRef.current) {
        setErroreSalvataggio(`Rotazione pagine non riuscita: ${(error as Error).message}`)
      }
    } finally {
      transizioneRef.current = false
      setOperazioneInCorso(false)
    }
  }

  const navigaDopoSalvataggio = useCallback((href: string) => {
    if (transizioneRef.current) return
    transizioneRef.current = true
    setOperazioneInCorso(true)
    void (async () => {
      try {
        await flush()
        window.location.assign(href)
      } catch {
        transizioneRef.current = false
        setOperazioneInCorso(false)
      }
    })()
  }, [flush])

  if (!caricato) {
    return <div className="st-bar" aria-busy="true" aria-label="Apertura del taccuino" />
  }

  if (erroreCaricamento) {
    return (
      <div style={shell}>
        <header style={topBar}>
          <ViewNav current="lezione" />
        </header>
        <main style={emptyWrap}>
          <div role="alert" data-notebook-error style={messaggioErrore}>
            {erroreCaricamento}
          </div>
          <button
            type="button"
            style={azioneButton}
            onClick={() => {
              setCaricato(false)
              setDoc(null)
              setErroreCaricamento(null)
              setErroreSalvataggio(null)
              setModificheInAttesa(false)
              setScenaPer(null)
              setSceneData(null)
              setTentativo((n) => n + 1)
            }}
          >
            Riprova senza sovrascrivere
          </button>
        </main>
      </div>
    )
  }

  if (!documentId || !doc) {
    // Stato vuoto: nessuna immagine del corpus mostra stati vuoti
    // (00-MANIFEST `not_checked`), quindi questo viene dal prodotto, non dal
    // raster. Dice cosa manca e come uscirne.
    return (
      <div style={shell}>
        <header style={topBar}>
          <ViewNav current="lezione" />
        </header>
        <main style={emptyWrap}>
          <h1 style={{ font: "600 20px/1.3 system-ui", color: "#1f3f63", margin: 0 }}>
            Nessun taccuino aperto
          </h1>
          <p style={{ color: "#41556d", maxWidth: "42ch", textAlign: "center" }}>
            Un taccuino si apre dalla Lezione: da lì il taccuino resta legato a
            quella lezione e la ritrova alla riapertura.
          </p>
          <a href="/" style={azione}>
            Torna alla Lezione
          </a>
        </main>
      </div>
    )
  }

  return (
    <div style={shell} data-notebook-document-id={doc.documentId}>
      <header style={topBar}>
        <ViewNav current="lezione" onNavigate={navigaDopoSalvataggio} />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <h1 style={titolo}>{doc.title}</h1>
          <span
            id="notebook-save-status"
            style={erroreSalvataggio ? { ...statoSalvataggio, ...statoSalvataggioErrore } : statoSalvataggio}
            role={erroreSalvataggio ? "alert" : "status"}
            aria-live={erroreSalvataggio ? "assertive" : "polite"}
            aria-atomic="true"
            data-notebook-saved-at={erroreSalvataggio ? "" : salvatoAlle ?? ""}
            data-notebook-save-state={
              erroreSalvataggio
                ? "errore"
                : modificheInAttesa
                  ? "in-corso"
                  : salvatoAlle
                    ? "salvato"
                    : "vuoto"
            }
          >
            {erroreSalvataggio
              ? erroreSalvataggio
              : modificheInAttesa
                ? "Modifiche in corso di salvataggio"
                : salvatoAlle
                  ? `Salvato alle ${salvatoAlle}`
                  : "Non ancora modificato"}
          </span>
        </div>
        {erroreSalvataggio && (
          <button
            type="button"
            data-notebook-save-error
            style={erroreSalvataggioButton}
            aria-describedby="notebook-save-status"
            onClick={() => { void flush().catch(() => {}) }}
          >
            Riprova il salvataggio
          </button>
        )}
        <span style={posizione} aria-live="polite">
          Pagina {pageIndex + 1} di {pagine.length}
        </span>
      </header>

      {/* La superficie di scrittura e' l'elemento dominante: e' il solo
          principio di G01 che questo slice trasferisce senza riserve.

          `onPointerUp` scrive alla FINE del tratto invece di aspettare i 400 ms
          di quiete. Il debounce serve a non scrivere a ogni frame di un gesto
          continuo. Il test `taccuino-rpo.spec.ts` prova la navigazione immediata
          dentro questa finestra; non simula un process-kill e quindi non viene
          presentato come prova completa dell'RPO 0 richiesto dal PRD §8.4. */}
      <div ref={superficieContenitoreRef} style={superficieContenitore}>
        <main
          inert={operazioneInCorso}
          aria-busy={operazioneInCorso || undefined}
          style={operazioneInCorso
            ? { ...superficiePagina, pointerEvents: "none" }
            : superficiePagina}
          data-notebook-page-surface
          data-notebook-page-orientation={paginaCorrente?.orientation ?? 0}
          data-notebook-page-width={paginaCorrente?.logicalSize.width ?? 0}
          data-notebook-page-height={paginaCorrente?.logicalSize.height ?? 0}
          data-notebook-scene-elements={String(elementCount)}
          onPointerUp={() => { void flush().catch(() => {}) }}
          onKeyUp={(evento) => {
            if (evento.key !== "Escape" && evento.key !== "Enter") return
            void flush().catch(() => {})
          }}
        >
          {scenaPer !== identitaScenaCorrente ? (
            <div className="st-bar" aria-busy="true" aria-label="Apertura della pagina" />
          ) : (
          <Excalidraw
            key={identitaScenaCorrente ?? "vuota"}
            langCode={EXCALIDRAW_CONFIG.langCode}
            theme={EXCALIDRAW_CONFIG.theme}
            aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
            UIOptions={EXCALIDRAW_CONFIG.UIOptions}
            initialData={(sceneData ?? { appState: EXCALIDRAW_CONFIG.newRoomAppState }) as never}
            excalidrawAPI={(api: unknown) => {
              apiRef.current = api as ExcalidrawApi
              ultimaOsservazioneRef.current = observeScene(
                (api as ExcalidrawApi).getSceneElements(),
                (api as ExcalidrawApi).getAppState(),
              )
              // Il conteggio esposto DEVE venire dalla scena viva, non dal JSON
              // che credo di aver caricato. Derivarlo dal JSON rende l'attributo
              // corretto anche quando il canvas e' vuoto: un oracolo che non puo'
              // vedere il guasto che deve sorvegliare.
              setElementCount((api as ExcalidrawApi).getSceneElements().length)
            }}
            onChange={onChange}
          />
          )}
        </main>
        {gestoreAperto && managerModel ? (
          <NotebookPageManager
            model={managerModel}
            busy={operazioneInCorso}
            onClose={chiudiGestoreConFocus}
            onActivatePage={(pageId) => { void cambiaPagina(pageId) }}
            onToggleSelection={(pageId) => { void toggleSelezionePagina(pageId, Date.now()) }}
            onMoveSelection={(direction) => { void spostaSelezione(direction, Date.now()) }}
            onRotateSelection={() => { void ruotaSelezione(Date.now()) }}
            // Un comando che consegna una pagina NUOVA in scrittura chiude il
            // gestore: il pannello sta sopra la superficie, e restare aperto
            // dopo aver creato la pagina su cui si sta per scrivere mette un
            // ostacolo esattamente dove serve lo spazio. I comandi sulla
            // selezione (Sposta, Ruota) non lo chiudono: lì si continua a
            // lavorare sulla stessa selezione.
            onDuplicatePage={() => { void duplicaPagina().then(chiudiSeRiuscito) }}
            onInsertBefore={() => { void aggiungiPagina("before").then(chiudiSeRiuscito) }}
            // Rinomina ed Elimina NON chiudono il gestore: non consegnano una
            // pagina nuova su cui scrivere, si sta gestendo. Il gestore decide
            // da solo dove torna il focus, perche' i controlli sono i suoi.
            onRenamePage={rinominaPagina}
            onDeletePage={eliminaPagina}
          />
        ) : null}
      </div>

      {/* Striscia delle pagine: una sola navigazione sull'asse dell'ordine.
          G01 ne ha due (tab in alto + miniature in basso) e le due possono
          divergere; qui ce n'e' una. */}
      <nav
        style={striscia}
        aria-label="Pagine del taccuino"
        data-notebook-pages-strip
      >
        <button
          type="button"
          className="st-chip"
          data-notebook-undo
          aria-label="Annulla ultima operazione sulle pagine"
          disabled={operazioneInCorso || doc.history.undo.length === 0}
          onClick={() => { void applicaCronologia("undo") }}
          style={tabNuova}
        >
          Annulla
        </button>
        <button
          type="button"
          className="st-chip"
          data-notebook-redo
          aria-label="Ripristina ultima operazione sulle pagine"
          disabled={operazioneInCorso || doc.history.redo.length === 0}
          onClick={() => { void applicaCronologia("redo") }}
          style={tabNuova}
        >
          Ripristina
        </button>
        {pagine.map((pagina) => (
          <button
            key={pagina.pageId}
            type="button"
            ref={pagina.pageId === doc.activePageId ? paginaAttivaButtonRef : undefined}
            data-notebook-page-id={pagina.pageId}
            data-notebook-page-ordinal={String(pagina.ordinal)}
            data-notebook-page-selected={selectedPageIdSet.has(pagina.pageId) ? "true" : "false"}
            data-notebook-page-orientation={String(pagina.orientation)}
            data-notebook-page-width={String(pagina.logicalSize.width)}
            data-notebook-page-height={String(pagina.logicalSize.height)}
            aria-current={pagina.pageId === doc.activePageId ? "true" : undefined}
            disabled={operazioneInCorso}
            onClick={() => { void cambiaPagina(pagina.pageId) }}
            style={pagina.pageId === doc.activePageId ? { ...tabPagina, ...tabPaginaAttiva } : tabPagina}
          >
            {pagina.ordinal + 1}. {pagina.title}
          </button>
        ))}
        {/* GN-A0-012 → PRD §5.1: selezione multipla e comandi che agiscono su
            una selezione stanno dietro un solo ingresso. La strip conserva la
            navigazione e i comandi sulla pagina corrente. */}
        <button
          type="button"
          className="st-chip"
          ref={gestoreButtonRef}
          data-open-notebook-page-manager
          aria-expanded={gestoreAperto}
          aria-label={managerModel?.triggerLabel ?? "Gestisci pagine"}
          disabled={operazioneInCorso}
          onClick={() => {
            if (gestoreAperto) {
              chiudiGestoreConFocus()
              return
            }
            setGestoreAperto(true)
          }}
          style={tabNuova}
        >
          Gestisci pagine
        </button>
        <button
          type="button"
          className="st-chip"
          data-add-notebook-page
          disabled={operazioneInCorso}
          // Stessa regola dei comandi del gestore: chi consegna una pagina
          // nuova su cui scrivere toglie il pannello dalla superficie. Qui pero'
          // il focus NON si sposta: il comando è partito dalla strip, e portare
          // il focus altrove sarebbe un salto che l'utente non ha chiesto.
          onClick={() => {
            void aggiungiPagina("after").then((riuscito) => {
              if (riuscito) setGestoreAperto(false)
            })
          }}
          style={tabNuova}
        >
          + Nuova pagina
        </button>
      </nav>
    </div>
  )
}

// Bersagli tattili >= 44 px e focus visibile: PRD §22/accessibilita'. Non
// derivano dall'atlante, che non mostra hover, focus o stati vuoti.
const TAP = 44

const shell = {
  display: "flex",
  flexDirection: "column",
  height: "100dvh",
  // Stessa carta della lavagna: il token e' quello, non uno nuovo.
  background: EXCALIDRAW_CONFIG.newRoomAppState.viewBackgroundColor,
  overflowX: "hidden",
} as const

const topBar = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 12px",
  borderBottom: "1px solid rgba(21,38,56,0.10)",
  flexWrap: "wrap",
} as const

const titolo = {
  font: "600 16px/1.2 system-ui",
  color: "#1f3f63",
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const

const statoSalvataggio = { font: "400 12px/1.4 system-ui", color: "#6b7f96" } as const

const posizione = {
  marginLeft: "auto",
  font: "600 13px/1 system-ui",
  color: "#41556d",
  whiteSpace: "nowrap",
} as const

const superficieContenitore = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  // Ancora del gestore pagine: il pannello e' inset su tutti i lati, quindi
  // `overflow: hidden` non lo taglia e non produce scroll orizzontale.
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background: "#e8edf2",
} as const

const superficie = {
  flex: "none",
  minHeight: 0,
  minWidth: 0,
  position: "relative",
  overflow: "hidden",
  background: EXCALIDRAW_CONFIG.newRoomAppState.viewBackgroundColor,
  boxShadow: "0 1px 5px rgba(21,38,56,0.16)",
} as const

const striscia = {
  display: "flex",
  gap: 6,
  padding: 8,
  borderTop: "1px solid rgba(21,38,56,0.10)",
  overflowX: "auto",
  alignItems: "center",
} as const

const tabPagina = {
  minHeight: TAP,
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid rgba(21,38,56,0.16)",
  background: "#ffffff",
  color: "#41556d",
  font: "600 13px/1 system-ui",
  whiteSpace: "nowrap",
  cursor: "pointer",
} as const

// `border` intero, non `borderColor`: React avverte quando una riscrittura
// rimuove una proprieta' non-shorthand mentre e' attiva la shorthand
// corrispondente, e l'avviso era reale — compariva nel log Playwright.
const tabPaginaAttiva = {
  color: "#1f3f63",
  border: "1px solid #1f3f63",
  boxShadow: "0 1px 3px rgba(21,38,56,0.18)",
} as const

const tabNuova = { ...tabPagina, border: "1px dashed rgba(21,38,56,0.32)", color: "#1f3f63" } as const

const emptyWrap = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: 24,
} as const

const azione = {
  minHeight: TAP,
  display: "inline-flex",
  alignItems: "center",
  padding: "0 16px",
  borderRadius: 8,
  background: "#1f3f63",
  color: "#ffffff",
  font: "600 14px/1 system-ui",
  textDecoration: "none",
} as const

const azioneButton = {
  ...azione,
  border: 0,
  cursor: "pointer",
} as const

const messaggioErrore = {
  color: "#7f1d1d",
  background: "#fff7f7",
  border: "1px solid #fecaca",
  borderRadius: 8,
  padding: 12,
  maxWidth: "54ch",
  font: "500 14px/1.5 system-ui",
} as const

const erroreSalvataggioButton = {
  minHeight: TAP,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #dc2626",
  background: "#fff7f7",
  color: "#991b1b",
  font: "600 12px/1.3 system-ui",
  cursor: "pointer",
  maxWidth: "min(100%, 28rem)",
  whiteSpace: "normal",
  textAlign: "center",
} as const

const statoSalvataggioErrore = {
  color: "#991b1b",
  font: "600 12px/1.4 system-ui",
} as const
