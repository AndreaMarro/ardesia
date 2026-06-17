// Runtime del SECONDO plugin concreto di riferimento: un ispettore SOLA LETTURA
// della lavagna ("Contorno lavagna") montato come pannello via ToolHost. Esercita
// la coppia di capability board.read + `ui` del contratto SDK Layer-0 usando SOLO
// la superficie pubblica `src/sdk`:
//   manifest (manifest.ts) · capabilities (grantedCaps) · message-protocol (call)
//   · lifecycle (handlers suspend/restore).
// Il modello vive in ./outline.ts (puro, deterministico): qui c'è solo il ponte
// lavagna ⇄ modello (board.read, due target) e lo stato del pannello adattato
// dalla capability `ui`. board.write NON è dichiarata né usata (least-privilege).
import { connectTool, isGranted } from "../../src/sdk/index.ts"
import type { ToolConnection, WindowLike } from "../../src/sdk/index.ts"
import {
  DEFAULT_PANEL_STATE,
  EMPTY_OUTLINE,
  flipExpanded,
  flipView,
  isPanelState,
  renderPanel,
  summarize,
} from "./outline.ts"
import type { BoardOutline, PanelRender, PanelState } from "./outline.ts"

export interface StartOptions {
  /** Finestra su cui attendere host.hello (default globalThis); override nei test. */
  windowRef?: WindowLike
}

/** Controller del plugin montato: il pannello chiama render(); i controlli mutano lo stato UI. */
export interface OutlinePlugin {
  readonly conn: ToolConnection
  /** Ultimo contorno calcolato (vuoto finché board.read non è disponibile). */
  outline(): BoardOutline
  /** Vista corrente del pannello (adattiva se `ui` è concessa, altrimenti fallback). */
  render(): PanelRender
  /** Ri-legge scena+selezione dalla lavagna e ricalcola il contorno. */
  refresh(): Promise<BoardOutline>
  /** Controllo UI: alterna sommario/per-tipo. No-op (false) senza `ui`. */
  toggleView(): boolean
  /** Controllo UI: espande/comprime il sommario. No-op (false) senza `ui`. */
  toggleExpanded(): boolean
}

async function readElements(conn: ToolConnection, target: "scene" | "selection"): Promise<readonly unknown[]> {
  const res = (await conn.call("board.read", { target })) as { elements: readonly unknown[] }
  return res.elements
}

/**
 * Handshake col host e prima lettura. Tutte le chiamate sono gated dalle capability
 * EFFETTIVAMENTE concesse (grantedCaps), non da quelle dichiarate nel manifest: il
 * docente può negarne alcune e il plugin deve degradare in sicurezza.
 */
export async function start(opts: StartOptions = {}): Promise<OutlinePlugin> {
  let panel: PanelState = DEFAULT_PANEL_STATE
  let outline: BoardOutline = EMPTY_OUTLINE

  const conn = await connectTool({
    windowRef: opts.windowRef,
    handlers: {
      suspend: () => panel,
      restore: (saved: unknown): void => {
        if (isPanelState(saved)) panel = saved
      },
    },
  })
  const caps = conn.grantedCaps
  const uiOn = isGranted(caps, "ui")

  async function refresh(): Promise<BoardOutline> {
    if (!isGranted(caps, "board.read")) {
      outline = EMPTY_OUTLINE
      return outline
    }
    const scene = await readElements(conn, "scene")
    const selection = await readElements(conn, "selection")
    outline = summarize(scene, selection)
    return outline
  }

  // Prima sincronizzazione: il pannello nasce con il contorno corrente della lavagna.
  await refresh()

  return {
    conn,
    outline: () => outline,
    render: () => renderPanel(outline, panel, uiOn),
    refresh,
    toggleView(): boolean {
      if (!uiOn) return false
      panel = flipView(panel)
      return true
    },
    toggleExpanded(): boolean {
      if (!uiOn) return false
      panel = flipExpanded(panel)
      return true
    },
  }
}
