// Modello "Board Outline" — nucleo del SECONDO plugin concreto di riferimento.
// Riassume la scena della lavagna (letta via board.read) in un sommario tipizzato
// che il pannello del plugin (capability `ui`) presenta al docente. Puro e
// deterministico: non importa nulla — l'unico accoppiamento al sistema è il
// boundary src/sdk in main.ts. A differenza del primo reference plugin (Arduino
// Blink: board.read + board.write su un embed), questo è SOLA LETTURA e stressa
// l'altra coppia di capability del contratto Layer-0: board.read + ui.

/** Sommario serializzabile della scena: totale, selezione, conteggio per tipo. */
export interface BoardOutline {
  readonly v: 1
  readonly total: number
  readonly selected: number
  /** Conteggio per tipo di elemento, chiavi ORDINATE per stabilità del confronto. */
  readonly byType: Readonly<Record<string, number>>
}

export type PanelView = "summary" | "byType"

/** Stato del pannello UI — sopravvive a suspend/restore (è ciò che la cap `ui` adatta). */
export interface PanelState {
  readonly v: 1
  readonly view: PanelView
  readonly expanded: boolean
}

export const DEFAULT_PANEL_STATE: PanelState = { v: 1, view: "summary", expanded: false }

export const EMPTY_OUTLINE: BoardOutline = { v: 1, total: 0, selected: 0, byType: {} }

/** Tipo dichiarato dell'elemento, o "unknown" se assente/non-stringa. */
function elementType(el: unknown): string {
  if (typeof el !== "object" || el === null) return "unknown"
  const t = (el as { type?: unknown }).type
  return typeof t === "string" && t.length > 0 ? t : "unknown"
}

/**
 * Riassume scena + selezione in un BoardOutline. `byType` è costruito con chiavi
 * ORDINATE: il confronto e il rendering non dipendono dall'ordine di scansione
 * della scena (invariante di stabilità, come la deriva del contratto SDK).
 */
export function summarize(scene: readonly unknown[], selection: readonly unknown[]): BoardOutline {
  const counts = new Map<string, number>()
  for (const el of scene) {
    const t = elementType(el)
    counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  const byType: Record<string, number> = {}
  for (const k of [...counts.keys()].sort()) byType[k] = counts.get(k) as number
  return { v: 1, total: scene.length, selected: selection.length, byType }
}

export interface PanelRender {
  readonly title: string
  readonly lines: readonly string[]
  /** prodotto con la capability `ui` (pannello adattivo) o fallback testuale inerte. */
  readonly adaptive: boolean
}

const TITLE = "Contorno lavagna"

function byTypeLines(outline: BoardOutline): readonly string[] {
  const keys = Object.keys(outline.byType) // già ordinate da summarize()
  if (keys.length === 0) return ["(nessun elemento)"]
  return keys.map((k) => `${k}: ${outline.byType[k]}`)
}

/**
 * Vista del pannello. Con `ui` concesso il pannello è ADATTIVO: rispetta
 * view/expanded scelti dal docente. Senza `ui` degrada a un sommario testuale
 * inerte di una riga (nessun controllo, nessuna espansione). Il plugin gate sul
 * grant EFFETTIVO, non sul manifest — difesa in profondità identica a come il
 * primo reference plugin gate board.write — anche se in v0 `ui` è concessa di
 * default dalla policy (resolveGrant la inietta sempre).
 */
export function renderPanel(outline: BoardOutline, state: PanelState, uiGranted: boolean): PanelRender {
  if (!uiGranted) {
    return {
      title: TITLE,
      lines: [`${outline.total} elementi, ${outline.selected} selezionati`],
      adaptive: false,
    }
  }
  if (state.view === "byType") {
    return { title: TITLE, lines: [`Totale: ${outline.total}`, ...byTypeLines(outline)], adaptive: true }
  }
  const lines = [`Totale: ${outline.total}`, `Selezionati: ${outline.selected}`]
  if (state.expanded) lines.push(...byTypeLines(outline))
  return { title: TITLE, lines, adaptive: true }
}

/** Controllo UI: alterna la vista sommario ⇄ per-tipo. */
export function flipView(s: PanelState): PanelState {
  return { ...s, view: s.view === "summary" ? "byType" : "summary" }
}

/** Controllo UI: espande/comprime il sommario. */
export function flipExpanded(s: PanelState): PanelState {
  return { ...s, expanded: !s.expanded }
}

/** Type-guard per uno stato pannello ricevuto dal restore (state opaco dal host). */
export function isPanelState(value: unknown): value is PanelState {
  if (typeof value !== "object" || value === null) return false
  const s = value as Record<string, unknown>
  return s.v === 1 && (s.view === "summary" || s.view === "byType") && typeof s.expanded === "boolean"
}
