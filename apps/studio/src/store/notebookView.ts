// Rotta della superficie Taccuino (?vista=taccuino). Stesso pattern di
// isContinuityView / isToolLabView: un file separato perche' sia testabile
// senza montare React.
//
// PC-R1-001 → PRD §5.1: il NotebookDocument paginato e' una superficie R1
// distinta, non una modalita' della lavagna.

import { validateNotebookId } from "./notebookDocument"

export const NOTEBOOK_VIEW_PARAM = "taccuino"

export function isNotebookView(): boolean {
  try {
    if (typeof window === "undefined") return false
    return new URL(window.location.href).searchParams.get("vista") === "taccuino"
  } catch {
    return false
  }
}

/**
 * Id del taccuino da aprire, letto dall'URL.
 *
 * Restituisce `null` quando il parametro manca o non e' un id valido: come per
 * `continuityLessonIdFromLocation`, una superficie che osserva non inventa cio'
 * che sta osservando. Chi apre il taccuino decide l'id; questa funzione lo
 * legge soltanto.
 */
export function notebookIdFromLocation(): string | null {
  try {
    if (typeof window === "undefined") return null
    const raw = new URL(window.location.href).searchParams.get(NOTEBOOK_VIEW_PARAM)
    if (!raw) return null
    return validateNotebookId(raw)
  } catch {
    return null
  }
}

/**
 * Id del taccuino legato a una lezione.
 *
 * Deterministico: la stessa lezione riapre lo stesso taccuino. Nessun
 * `Math.random`, nessun `Date.now` — il percorso di replay dipende da questi
 * identificatori (AGENTS.md §3: nessuna sorgente non deterministica nel
 * percorso di REPLAY).
 */
export function notebookIdForLesson(lessonId: string): string {
  return validateNotebookId(`taccuino-${lessonId}`)
}

/** Href della superficie taccuino, preservando lo hash della stanza. */
export function notebookHref(notebookId: string, currentHash: string = ""): string {
  const hash = currentHash.startsWith("#") ? currentHash : currentHash ? `#${currentHash}` : ""
  return `/?vista=taccuino&${NOTEBOOK_VIEW_PARAM}=${encodeURIComponent(notebookId)}${hash}`
}
