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
import {
  appendNotebookPage,
  createNotebookDocument,
  loadNotebook,
  loadNotebookPageScene,
  orderedNotebookPages,
  saveNotebook,
  saveNotebookPageScene,
  type NotebookDocument,
} from "../store/notebookDocument"
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

export default function NotebookView() {
  const documentId = notebookIdFromLocation()
  const [doc, setDoc] = useState<NotebookDocument | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [sceneJson, setSceneJson] = useState<string | null>(null)
  const [elementCount, setElementCount] = useState(0)
  const [salvatoAlle, setSalvatoAlle] = useState<string | null>(null)
  const [caricato, setCaricato] = useState(false)

  const apiRef = useRef<ExcalidrawApi | null>(null)
  const salvaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carica (o crea) il taccuino e la scena della pagina corrente.
  useEffect(() => {
    let annullato = false
    if (!documentId) {
      setCaricato(true)
      return
    }
    void (async () => {
      await workspaceStore.init()
      let corrente = await loadNotebook(workspaceStore, documentId)
      if (!corrente) {
        corrente = createNotebookDocument({
          documentId,
          title: "Taccuino della lezione",
          now: Date.now(),
        })
        await saveNotebook(workspaceStore, corrente)
      }
      if (annullato) return
      setDoc(corrente)
      setCaricato(true)
    })()
    return () => {
      annullato = true
    }
  }, [documentId])

  const pagine = doc ? orderedNotebookPages(doc) : []
  const paginaCorrente = pagine[pageIndex] ?? null

  useEffect(() => {
    let annullato = false
    if (!documentId || !paginaCorrente) return
    void (async () => {
      const salvata = await loadNotebookPageScene(workspaceStore, documentId, paginaCorrente.pageId)
      if (annullato) return
      setSceneJson(salvata)
      try {
        setElementCount(salvata ? (JSON.parse(salvata).elements?.length ?? 0) : 0)
      } catch {
        setElementCount(0)
      }
    })()
    return () => {
      annullato = true
    }
  }, [documentId, paginaCorrente?.pageId])

  const salvaScena = useCallback(() => {
    const api = apiRef.current
    if (!api || !documentId || !paginaCorrente) return
    const elements = api.getSceneElements()
    setElementCount(elements.length)
    const json = serializeAsJSON(
      elements as never,
      api.getAppState() as never,
      api.getFiles() as never,
      "local",
    )
    void saveNotebookPageScene(workspaceStore, documentId, paginaCorrente.pageId, json).then(() => {
      setSalvatoAlle(
        new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
      )
    })
  }, [documentId, paginaCorrente?.pageId])

  const onChange = useCallback(() => {
    if (salvaTimer.current) clearTimeout(salvaTimer.current)
    salvaTimer.current = setTimeout(salvaScena, AUTOSAVE_MS)
  }, [salvaScena])

  // Il flush deve poter girare da un listener registrato una volta sola, senza
  // catturare una `salvaScena` vecchia: il ref segue l'ultima versione.
  const salvaScenaRef = useRef(salvaScena)
  salvaScenaRef.current = salvaScena

  /**
   * Scrive subito cio' che l'autosave sta ancora aspettando di scrivere.
   *
   * PRD §8.4 chiede «autosave locale con RPO 0 per eventi confermati». Un
   * debounce da solo lascia una finestra in cui un tratto gia' confermato
   * dall'utente non e' su disco: chi chiude il coperchio subito dopo aver
   * scritto lo perde. Misurato con `e2e/taccuino-rpo.spec.ts`, che senza questo
   * flush riapre la pagina con zero elementi.
   *
   * `pagehide` e `visibilitychange` coprono il caso reale (chiusura, cambio
   * tab, navigazione via `location.assign`), dove il cleanup di React non e'
   * garantito; il cleanup lo copre per lo smontaggio interno.
   */
  const flush = useCallback(() => {
    if (salvaTimer.current) {
      clearTimeout(salvaTimer.current)
      salvaTimer.current = null
    }
    salvaScenaRef.current()
  }, [])

  useEffect(() => {
    const alNascondersi = () => {
      if (document.visibilityState === "hidden") flush()
    }
    window.addEventListener("pagehide", flush)
    document.addEventListener("visibilitychange", alNascondersi)
    return () => {
      window.removeEventListener("pagehide", flush)
      document.removeEventListener("visibilitychange", alNascondersi)
      flush()
    }
  }, [flush])

  const aggiungiPagina = useCallback(() => {
    if (!doc || !documentId) return
    const aggiornato = appendNotebookPage(doc, { now: Date.now() })
    setDoc(aggiornato)
    setPageIndex(aggiornato.pages.length - 1)
    void saveNotebook(workspaceStore, aggiornato)
  }, [doc, documentId])

  if (!caricato) return <div className="st-bar" aria-busy="true" />

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
        <ViewNav current="lezione" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <h1 style={titolo}>{doc.title}</h1>
          <span style={statoSalvataggio} data-notebook-saved-at={salvatoAlle ?? ""}>
            {salvatoAlle ? `Salvato alle ${salvatoAlle}` : "Non ancora modificato"}
          </span>
        </div>
        <span style={posizione} aria-live="polite">
          Pagina {pageIndex + 1} di {pagine.length}
        </span>
      </header>

      {/* La superficie di scrittura e' l'elemento dominante: e' il solo
          principio di G01 che questo slice trasferisce senza riserve.

          `onPointerUp` scrive alla FINE del tratto invece di aspettare i 400 ms
          di quiete. Il debounce serve a non scrivere a ogni frame di un gesto
          continuo; ma un tratto finito e' un evento confermato dall'utente, e
          PRD §8.4 chiede RPO 0 su quelli. Misurato: senza questa riga il tratto
          si perde uscendo subito (`e2e/taccuino-rpo.spec.ts`). */}
      <main
        style={superficie}
        data-notebook-scene-elements={String(elementCount)}
        onPointerUp={flush}
      >
        <Excalidraw
          key={paginaCorrente?.pageId ?? "vuota"}
          langCode={EXCALIDRAW_CONFIG.langCode}
          theme={EXCALIDRAW_CONFIG.theme}
          aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
          UIOptions={EXCALIDRAW_CONFIG.UIOptions}
          initialData={
            sceneJson
              ? { ...JSON.parse(sceneJson), appState: EXCALIDRAW_CONFIG.newRoomAppState }
              : { appState: EXCALIDRAW_CONFIG.newRoomAppState }
          }
          excalidrawAPI={(api: unknown) => {
            apiRef.current = api as ExcalidrawApi
          }}
          onChange={onChange}
        />
      </main>

      {/* Striscia delle pagine: una sola navigazione sull'asse dell'ordine.
          G01 ne ha due (tab in alto + miniature in basso) e le due possono
          divergere; qui ce n'e' una. */}
      <nav style={striscia} aria-label="Pagine del taccuino">
        {pagine.map((pagina, indice) => (
          <button
            key={pagina.pageId}
            type="button"
            data-notebook-page-ordinal={String(pagina.ordinal)}
            aria-current={indice === pageIndex ? "true" : undefined}
            onClick={() => setPageIndex(indice)}
            style={indice === pageIndex ? { ...tabPagina, ...tabPaginaAttiva } : tabPagina}
          >
            {pagina.ordinal + 1}. {pagina.title}
          </button>
        ))}
        <button type="button" data-add-notebook-page onClick={aggiungiPagina} style={tabNuova}>
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

const superficie = { flex: 1, minHeight: 0, position: "relative" } as const

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
