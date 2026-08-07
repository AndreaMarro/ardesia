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

import { useEffect, useRef } from "react"

import type { NotebookManagerModel } from "../store/notebookPageManager"

export type NotebookPageManagerProps = Readonly<{
  model: NotebookManagerModel
  open: boolean
  busy: boolean
  onClose: () => void
  onActivatePage: (pageId: string) => void
  onToggleSelection: (pageId: string) => void
  onMoveSelection: (direction: "up" | "down") => void
  onRotateSelection: () => void
  onDuplicatePage: () => void
  onInsertBefore: () => void
}>

const ORIENTAMENTO: Readonly<Record<number, string>> = {
  0: "verticale",
  90: "orizzontale",
  180: "verticale capovolta",
  270: "orizzontale capovolta",
}

export default function NotebookPageManager({
  model,
  open,
  busy,
  onClose,
  onActivatePage,
  onToggleSelection,
  onMoveSelection,
  onRotateSelection,
  onDuplicatePage,
  onInsertBefore,
}: NotebookPageManagerProps) {
  const chiudiRef = useRef<HTMLButtonElement | null>(null)
  const pannelloRef = useRef<HTMLElement | null>(null)
  const ultimoControlloRef = useRef<string | null>(null)
  const eraOccupatoRef = useRef(busy)

  // All'apertura il focus entra nel gestore: senza questo passaggio la tastiera
  // resterebbe sul trigger e il pannello sarebbe raggiungibile solo tabulando
  // attraverso tutta la strip. Il ritorno del focus al trigger e' responsabilita'
  // di chi possiede il trigger, cioe' della vista.
  useEffect(() => {
    if (!open) return
    chiudiRef.current?.focus()
  }, [open])

  // Ogni comando disabilita i controlli mentre e' in volo. Disabilitare
  // l'elemento che ha il focus lo fa cadere sul `body`: da tastiera la
  // superficie diventa muta subito dopo l'azione che l'utente ha appena
  // eseguito, ed Esc smette di funzionare. Qui il focus viene restituito al
  // controllo di partenza quando il comando finisce.
  useEffect(() => {
    const eraOccupato = eraOccupatoRef.current
    eraOccupatoRef.current = busy
    if (busy || !eraOccupato || !open) return
    const controllo = ultimoControlloRef.current
    if (!controllo) return
    const bersaglio = pannelloRef.current?.querySelector<HTMLElement>(
      `[data-notebook-manager-control="${CSS.escape(controllo)}"]`,
    )
    if (bersaglio && !(bersaglio as HTMLButtonElement).disabled) bersaglio.focus()
  }, [busy, open])

  if (!open) return null

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
