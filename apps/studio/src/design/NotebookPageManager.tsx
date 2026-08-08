// Gestore pagine del Taccuino: la sola superficie da cui si seleziona e si
// comanda una selezione multipla.
//
// GN-A0-012 → PRD §5.1/§19.2. Tre scelte esplicite, perche' ognuna aveva
// un'alternativa plausibile e sbagliata:
//
// 1. Il gestore non possiede stato di dominio. Riceve un `NotebookManagerModel`
//    — proiezione pura del `NotebookDocument` — e richiama gli stessi comandi
//    persistiti della strip. Non esiste un secondo array di pagine, ne' una
//    seconda verita' su pagina attiva e selezione.
// 2. Non e' modale. La scrittura resta l'attivita' dominante (Atlante: una sola
//    attivita' dominante), quindi niente focus trap e niente sfondo inerte: e'
//    un `aside` etichettato, chiudibile con Esc e con un controllo visibile.
//    Chiamarlo `dialog` mentre lo sfondo resta interattivo mentirebbe alle
//    tecnologie assistive.
// 3. Nessuna miniatura. Un renderer derivato affidabile non esiste ancora e una
//    miniatura finta sarebbe un badge senza referente: le righe mostrano
//    identita' testuale onesta (ordinale, titolo, orientamento). La thumbnail
//    resta DEFERRED e non e' implicata come fatta.

// 4. Bozze e ripristino del focus appartengono a QUESTA superficie, non alla
//    vista. Un form vive dove e' disegnato: tenerne lo stato altrove costringeva
//    la vista a possedere `ref` verso bottoni che non renderizza piu'. La vista
//    conserva comando e persistenza; il gestore conserva bozza e focus.

import { useEffect, useRef, useState } from "react"

import type { NotebookManagerModel } from "../store/notebookPageManager"

export type NotebookPageManagerProps = Readonly<{
  model: NotebookManagerModel
  busy: boolean
  onClose: () => void
  onActivatePage: (pageId: string) => void
  onToggleSelection: (pageId: string) => void
  onMoveSelection: (direction: "up" | "down") => void
  onRotateSelection: () => void
  onDuplicatePage: () => void
  onInsertBefore: () => void
  /** Ritorna `true` solo se il comando ha committato. */
  onRenamePage: (pageId: string, title: string) => Promise<boolean>
  /** Ritorna `true` solo se il comando ha committato. */
  onDeletePage: (pageId: string) => Promise<boolean>
}>

const ORIENTAMENTO: Readonly<Record<number, string>> = {
  0: "verticale",
  90: "orizzontale",
  180: "verticale capovolta",
  270: "orizzontale capovolta",
}

export default function NotebookPageManager({
  model,
  busy,
  onClose,
  onActivatePage,
  onToggleSelection,
  onMoveSelection,
  onRotateSelection,
  onDuplicatePage,
  onInsertBefore,
  onRenamePage,
  onDeletePage,
}: NotebookPageManagerProps) {
  const [rinominaDraft, setRinominaDraft] = useState<Readonly<{
    pageId: string
    value: string
  }> | null>(null)
  const [eliminaDraft, setEliminaDraft] = useState<Readonly<{
    pageId: string
    title: string
  }> | null>(null)
  const [revisionePrecedente, setRevisionePrecedente] = useState(model.revision)
  const rinominaButtonRef = useRef<HTMLButtonElement | null>(null)
  const eliminaButtonRef = useRef<HTMLButtonElement | null>(null)
  const paginaAttivaRef = useRef<HTMLButtonElement | null>(null)
  const ripristinaFocusRinominaRef = useRef(false)
  const focusDopoEliminaRef = useRef<"delete" | "page" | null>(null)
  const chiudiRef = useRef<HTMLButtonElement | null>(null)

  function chiudiRinominaConFocus() {
    ripristinaFocusRinominaRef.current = true
    setRinominaDraft(null)
  }

  function chiudiEliminaConFocus(target: "delete" | "page") {
    focusDopoEliminaRef.current = target
    setEliminaDraft(null)
  }

  const pannelloRef = useRef<HTMLElement | null>(null)
  const ultimoControlloRef = useRef<string | null>(null)
  const eraOccupatoRef = useRef(busy)

  // All'apertura il focus entra nel gestore: senza questo passaggio la tastiera
  // resterebbe sul trigger e il pannello sarebbe raggiungibile solo tabulando
  // attraverso tutta la strip. Il ritorno del focus al trigger e' responsabilita'
  // di chi possiede il trigger, cioe' della vista.
  //
  // Il montaggio E' l'apertura: la vista renderizza questo componente solo
  // quando il gestore e' aperto, quindi la chiusura lo smonta e con esso spariscono
  // bozze e riferimenti. Prima c'era un prop `open` e un effetto che azzerava le
  // bozze alla chiusura — cioe' uno stato invisibile che sopravviveva a una
  // superficie chiusa, ripulito da un `setState` dentro un effetto.
  useEffect(() => {
    chiudiRef.current?.focus()
  }, [])

  // Ogni comando disabilita i controlli mentre e' in volo. Disabilitare
  // l'elemento che ha il focus lo fa cadere sul `body`: da tastiera la
  // superficie diventa muta subito dopo l'azione che l'utente ha appena
  // eseguito, ed Esc smette di funzionare. Qui il focus viene restituito al
  // controllo di partenza quando il comando finisce.
  useEffect(() => {
    const eraOccupato = eraOccupatoRef.current
    eraOccupatoRef.current = busy
    if (busy || !eraOccupato) return
    const controllo = ultimoControlloRef.current
    if (!controllo) return
    const bersaglio = pannelloRef.current?.querySelector<HTMLElement>(
      `[data-notebook-manager-control="${CSS.escape(controllo)}"]`,
    )
    if (bersaglio && !(bersaglio as HTMLButtonElement).disabled) bersaglio.focus()
  }, [busy])

  // Chiudere un form non deve scaricare il focus sul `body`: torna al controllo
  // che il form ha sostituito.
  useEffect(() => {
    if (rinominaDraft || !ripristinaFocusRinominaRef.current || !rinominaButtonRef.current) return
    ripristinaFocusRinominaRef.current = false
    rinominaButtonRef.current.focus()
  }, [rinominaDraft])

  // Dopo un'eliminazione riuscita il bottone Elimina puo' essere diventato
  // impossibile — resta una pagina sola. In quel caso il focus va sulla pagina
  // in scrittura, non su un controllo disabilitato.
  useEffect(() => {
    if (eliminaDraft || busy || !focusDopoEliminaRef.current) return
    const bersaglio = focusDopoEliminaRef.current === "delete"
      ? eliminaButtonRef.current
      : paginaAttivaRef.current
    if (!bersaglio || bersaglio.disabled) return
    focusDopoEliminaRef.current = null
    bersaglio.focus()
  }, [busy, eliminaDraft, model.activePageId, model.rows.length])

  // Una bozza descrive una pagina a una revisione precisa. Se il documento
  // cambia sotto — undo, riordino, selezione, qualunque comando — la bozza
  // descrive uno stato che non esiste piu': si chiude.
  //
  // L'aggiustamento avviene DURANTE il render confrontando la prop con il suo
  // valore precedente: e' il modo documentato di reagire al cambio di una prop
  // senza un effetto, e senza la latenza di un secondo passaggio in cui il form
  // resterebbe visibile su dati sbagliati.
  if (model.revision !== revisionePrecedente) {
    setRevisionePrecedente(model.revision)
    if (rinominaDraft) setRinominaDraft(null)
    if (eliminaDraft) setEliminaDraft(null)
  }

  const paginaInScrittura = model.rows.find((row) => row.isActive) ?? null

  return (
    <aside
      ref={pannelloRef}
      data-notebook-page-manager
      aria-label="Gestore pagine del taccuino"
      style={pannello}
      onFocusCapture={(event) => {
        const controllo = (event.target as HTMLElement).getAttribute(
          "data-notebook-manager-control",
        )
        if (controllo) ultimoControlloRef.current = controllo
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          onClose()
          return
        }
        if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return
        const direction = event.key === "ArrowUp" ? "up" : "down"
        if (direction === "up" ? !model.canMoveUp : !model.canMoveDown) return
        event.preventDefault()
        onMoveSelection(direction)
      }}
    >
      <header style={intestazione}>
        <h2 style={titoloPannello}>Pagine</h2>
        <button
          type="button"
          ref={chiudiRef}
          className="st-chip"
          data-close-notebook-page-manager
          data-notebook-manager-control="close"
          aria-label="Chiudi il gestore pagine"
          onClick={onClose}
          style={comando}
        >
          Chiudi
        </button>
      </header>

      {/* La conseguenza di un comando bulk si legge PRIMA di premerlo: target,
          ordine e effetto in una frase, annunciata anche via aria-live. */}
      <p
        data-notebook-manager-announcement
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={annuncio}
      >
        {model.announcement}
      </p>

      <ul data-notebook-manager-list style={elenco}>
        {model.rows.map((row) => (
          <li key={row.pageId} style={riga}>
            <button
              type="button"
              ref={row.isActive ? paginaAttivaRef : undefined}
              data-notebook-manager-page={row.pageId}
              data-notebook-manager-control={`page:${row.pageId}`}
              data-notebook-manager-page-selected={row.isSelected ? "true" : "false"}
              aria-current={row.isActive ? "true" : undefined}
              disabled={busy}
              onClick={() => { onActivatePage(row.pageId) }}
              style={row.isActive ? { ...vocePagina, ...vocePaginaAttiva } : vocePagina}
            >
              <span style={voceOrdinale}>{row.ordinal + 1}.</span>
              <span style={voceTitolo}>{row.title}</span>
              <span style={voceStato}>
                {ORIENTAMENTO[row.orientation] ?? `${row.orientation}°`}
                {row.isActive ? " · in scrittura" : ""}
              </span>
            </button>
            <button
              type="button"
              className="st-chip"
              data-toggle-notebook-page-selection={row.pageId}
              data-notebook-manager-control={`toggle:${row.pageId}`}
              // Un controllo disabilitato non deve promettere l'azione che non
              // puo' compiere: sulla pagina in scrittura il nome dice perche'
              // resta nel target, non «rimuovi».
              aria-label={row.isActive
                ? `${row.title} è in scrittura e resta nella selezione`
                : row.isSelected
                  ? `Rimuovi ${row.title} dalla selezione`
                  : `Aggiungi ${row.title} alla selezione`}
              aria-pressed={row.isSelected}
              // La pagina in scrittura resta sempre nel target: toglierla
              // renderebbe la selezione diversa da cio' che l'utente vede
              // sotto il pennino.
              disabled={busy || row.isActive}
              onClick={() => { onToggleSelection(row.pageId) }}
              style={row.isSelected ? { ...seleziona, ...selezionaAttiva } : seleziona}
            >
              {row.isSelected ? "✓" : "+"}
            </button>
          </li>
        ))}
      </ul>

      {/* Due gruppi, perche' operano su due referenti diversi: la SELEZIONE e
          la pagina IN SCRITTURA. Tenerli in un'unica fila costringeva a
          dedurre da sola l'etichetta quale dei due un comando toccasse. */}
      <h3 style={titoloGruppo}>Pagina in scrittura</h3>
      <div style={comandi}>
        <button
          type="button"
          className="st-chip"
          data-insert-notebook-page-before
          data-notebook-manager-control="insert-before"
          aria-label="Inserisci una pagina prima di quella in scrittura"
          disabled={busy}
          onClick={onInsertBefore}
          style={comando}
        >
          + Prima
        </button>
        <button
          type="button"
          className="st-chip"
          data-duplicate-notebook-page
          data-notebook-manager-control="duplicate"
          aria-label="Duplica la pagina in scrittura"
          disabled={busy}
          onClick={onDuplicatePage}
          style={comando}
        >
          Duplica
        </button>
        {rinominaDraft ? (
          <form
            data-rename-notebook-form
            style={rinominaForm}
            onSubmit={(event) => {
              event.preventDefault()
              void onRenamePage(rinominaDraft.pageId, rinominaDraft.value).then((riuscito) => {
                if (riuscito) chiudiRinominaConFocus()
              })
            }}
          >
            <label htmlFor="notebook-page-title" style={rinominaLabel}>
              Titolo pagina
            </label>
            <input
              id="notebook-page-title"
              data-rename-notebook-input
              value={rinominaDraft.value}
              maxLength={120}
              autoFocus
              disabled={busy}
              onChange={(event) => {
                setRinominaDraft({ ...rinominaDraft, value: event.currentTarget.value })
              }}
              style={rinominaInput}
            />
            <button
              type="submit"
              data-save-notebook-page-title
              disabled={busy}
              style={comando}
            >
              Salva titolo
            </button>
            <button
              type="button"
              data-cancel-notebook-page-title
              disabled={busy}
              onClick={chiudiRinominaConFocus}
              style={comando}
            >
              Annulla rinomina
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="st-chip"
            ref={rinominaButtonRef}
            data-rename-notebook-page
            data-notebook-manager-control="rename"
            aria-label="Rinomina la pagina in scrittura"
            disabled={busy || !paginaInScrittura}
            onClick={() => {
              if (!paginaInScrittura) return
              setEliminaDraft(null)
              setRinominaDraft({
                pageId: paginaInScrittura.pageId,
                value: paginaInScrittura.title,
              })
            }}
            style={comando}
          >
            Rinomina
          </button>
        )}
        {/* Conferma recuperabile: PRD §4.4/§19.2, PC-R1-001,
            GN-A1-003/GN-A7-012; non e' un prompt nativo opaco. */}
        {eliminaDraft ? (
          <form
            data-delete-notebook-confirmation
            aria-label="Conferma eliminazione pagina"
            style={eliminaFormStile}
            onSubmit={(event) => {
              event.preventDefault()
              void onDeletePage(eliminaDraft.pageId).then((riuscito) => {
                if (riuscito) chiudiEliminaConFocus(model.rows.length > 2 ? "delete" : "page")
              })
            }}
          >
            <span style={eliminaCopy}>
              Eliminare “{eliminaDraft.title}”? La pagina scompare, ma Annulla la recupera con tutto il contenuto.
            </span>
            <button
              type="submit"
              data-confirm-delete-notebook-page
              disabled={busy}
              style={eliminaConferma}
            >
              Elimina pagina
            </button>
            <button
              type="button"
              data-cancel-delete-notebook-page
              autoFocus
              disabled={busy}
              onClick={() => { chiudiEliminaConFocus("delete") }}
              style={comando}
            >
              Mantieni pagina
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="st-chip"
            ref={eliminaButtonRef}
            data-delete-notebook-page
            data-notebook-manager-control="delete"
            aria-label="Elimina la pagina in scrittura"
            disabled={busy || !paginaInScrittura || !model.canDelete}
            onClick={() => {
              if (!paginaInScrittura) return
              setRinominaDraft(null)
              setEliminaDraft({
                pageId: paginaInScrittura.pageId,
                title: paginaInScrittura.title,
              })
            }}
            style={eliminaPulsante}
          >
            Elimina
          </button>
        )}
      </div>

      <h3 style={titoloGruppo}>Selezione</h3>
      <div style={comandi}>
        <button
          type="button"
          className="st-chip"
          data-move-notebook-selection-up
          data-notebook-manager-control="move-up"
          aria-label="Sposta la selezione verso l'inizio"
          title="Sposta su — Alt+Freccia su"
          disabled={busy || !model.canMoveUp}
          onClick={() => { onMoveSelection("up") }}
          style={comando}
        >
          ↑ Sposta
        </button>
        <button
          type="button"
          className="st-chip"
          data-move-notebook-selection-down
          data-notebook-manager-control="move-down"
          aria-label="Sposta la selezione verso la fine"
          title="Sposta giù — Alt+Freccia giù"
          disabled={busy || !model.canMoveDown}
          onClick={() => { onMoveSelection("down") }}
          style={comando}
        >
          ↓ Sposta
        </button>
        <button
          type="button"
          className="st-chip"
          data-rotate-notebook-selection
          data-notebook-manager-control="rotate"
          aria-label={model.target.count === 1
            ? "Ruota di 90 gradi la pagina selezionata"
            : `Ruota di 90 gradi le ${model.target.count} pagine selezionate`}
          disabled={busy || !model.canRotate}
          onClick={onRotateSelection}
          style={comando}
        >
          ↻ Ruota
        </button>
      </div>
    </aside>
  )
}

// Bersagli tattili >= 44 px, come nella strip: PRD §22.
const TAP = 44

// Il pannello vive dentro l'area di scrittura, non sopra la strip: sovrapporre
// i controlli di pagina per mostrarne il gestore sarebbe un attrito inutile.
// Insetto su tutti i lati, quindi il contenitore con `overflow: hidden` non lo
// taglia mai; la larghezza relativa al contenitore, non a `100vw`, impedisce
// overflow orizzontale del documento su iPad.
const pannello = {
  position: "absolute",
  right: 12,
  top: 12,
  bottom: 12,
  zIndex: 30,
  width: "min(340px, calc(100% - 24px))",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(21,38,56,0.16)",
  background: "#ffffff",
  boxShadow: "0 8px 28px rgba(21,38,56,0.20)",
  overflowY: "auto",
  overflowX: "hidden",
} as const

const intestazione = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
} as const

const titoloPannello = {
  margin: 0,
  font: "600 14px/1.2 system-ui",
  color: "#152638",
} as const

const titoloGruppo = {
  margin: "4px 0 0",
  font: "600 11px/1.2 system-ui",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#6b7f96",
} as const

const annuncio = {
  margin: 0,
  font: "400 12px/1.45 system-ui",
  color: "#41556d",
} as const

const elenco = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 6,
} as const

const riga = {
  display: "flex",
  alignItems: "stretch",
  gap: 6,
} as const

const vocePagina = {
  flex: 1,
  minWidth: 0,
  minHeight: TAP,
  display: "flex",
  alignItems: "baseline",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid rgba(21,38,56,0.16)",
  background: "#ffffff",
  color: "#41556d",
  font: "600 13px/1.3 system-ui",
  textAlign: "left",
  cursor: "pointer",
} as const

const vocePaginaAttiva = {
  color: "#1f3f63",
  border: "1px solid #1f3f63",
  background: "#f5f9fd",
} as const

const voceOrdinale = { font: "600 12px/1.3 system-ui", color: "#6b7f96" } as const

const voceTitolo = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const

const voceStato = { font: "400 11px/1.3 system-ui", color: "#6b7f96", whiteSpace: "nowrap" } as const

const seleziona = {
  minWidth: TAP,
  minHeight: TAP,
  borderRadius: 8,
  border: "1px dashed rgba(21,38,56,0.28)",
  background: "#ffffff",
  color: "#41556d",
  font: "600 13px/1 system-ui",
  cursor: "pointer",
} as const

const selezionaAttiva = {
  color: "#1f3f63",
  border: "1px solid #1f3f63",
  background: "#edf4fb",
} as const

const comandi = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
} as const

const rinominaForm = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "wrap",
  width: "100%",
} as const

const rinominaLabel = {
  font: "600 11px/1.2 system-ui",
  color: "#6b7f96",
} as const

const rinominaInput = {
  flex: 1,
  minWidth: 120,
  minHeight: TAP,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid rgba(21,38,56,0.24)",
  font: "400 13px/1.2 system-ui",
  color: "#152638",
} as const

const eliminaFormStile = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "wrap",
  width: "100%",
} as const

const eliminaCopy = {
  flexBasis: "100%",
  font: "400 12px/1.45 system-ui",
  color: "#41556d",
} as const



const comando = {
  minHeight: TAP,
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px dashed rgba(21,38,56,0.32)",
  background: "#ffffff",
  color: "#1f3f63",
  font: "600 13px/1 system-ui",
  whiteSpace: "nowrap",
  cursor: "pointer",
} as const

const eliminaPulsante = {
  ...comando,
  color: "#8a2b2b",
  border: "1px dashed rgba(138,43,43,0.45)",
} as const
const eliminaConferma = {
  ...comando,
  color: "#ffffff",
  background: "#8a2b2b",
  border: "1px solid #8a2b2b",
} as const
