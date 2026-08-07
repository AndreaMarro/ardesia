// Modello del gestore pagine del Taccuino.
//
// GN-A0-012 → PRD §5.1/§19.2: il gestore e' una *superficie contestuale dello
// stesso documento*, non un secondo elenco di pagine. Per questo qui non c'e'
// stato: c'e' una funzione pura che proietta il `NotebookDocument` in cio' che
// la superficie deve mostrare e abilitare. Una proiezione non puo' divergere
// dalla sua sorgente; un secondo store si'.
//
// La conseguenza pratica e' che il gestore diventa falsificabile senza montare
// React: gli oracoli di §9.7 (ordine del target, abilitazioni, dichiarazione
// della conseguenza) sono asserzioni su dati.

import { orderedNotebookPages } from "./notebookDocument"
import type { NotebookDocument, NotebookOrientation } from "./notebookDocument"

/** Una riga del gestore: identita' onesta, nessuna miniatura finta. */
export type NotebookManagerRow = Readonly<{
  pageId: string
  /** 0-based, come nel documento; la UI mostra `ordinal + 1`. */
  ordinal: number
  title: string
  orientation: NotebookOrientation
  isActive: boolean
  isSelected: boolean
}>

/**
 * Target di un comando bulk.
 *
 * `pageIds` e' in **ordine di documento**, non nell'ordine in cui l'utente ha
 * toccato le pagine: e' l'ordine in cui il comando le trattera', quindi e'
 * l'ordine che va dichiarato prima del commit.
 */
export type NotebookManagerTarget = Readonly<{
  pageIds: ReadonlyArray<string>
  titles: ReadonlyArray<string>
  count: number
}>

export type NotebookManagerModel = Readonly<{
  rows: ReadonlyArray<NotebookManagerRow>
  activePageId: string
  target: NotebookManagerTarget
  /**
   * Indice a cui `reorder_pages` reinserisce il blocco selezionato, misurato
   * sulla lista senza la selezione. Esposto perche' chi esegue il comando e chi
   * abilita il controllo devono leggere lo stesso numero, non calcolarne due.
   */
  reorderTargetIndex: number
  /** Estremo superiore ammesso per `reorderTargetIndex`. */
  reorderBound: number
  canMoveUp: boolean
  canMoveDown: boolean
  canRotate: boolean
  canDelete: boolean
  /** Frase che dichiara target, ordine e conseguenza prima del commit. */
  announcement: string
  /**
   * Nome accessibile del controllo che apre il gestore.
   *
   * Sta qui e non nella vista perche' e' una regola di lingua — accordo di
   * numero — e una regola va dove la si puo' falsificare. Scritta inline nel
   * JSX diceva “1 selezionate”, e nessun test poteva accorgersene.
   */
  triggerLabel: string
}>

function declareTarget(target: NotebookManagerTarget): string {
  if (target.count === 0) {
    return "Nessuna pagina selezionata: i comandi che agiscono sulla selezione restano inattivi."
  }
  const elenco = target.titles.map((title) => `“${title}”`).join(", ")
  if (target.count === 1) {
    return `1 pagina selezionata: ${elenco}. I comandi sulla selezione la trattano da sola e ne conservano l’ordine relativo.`
  }
  return `${target.count} pagine selezionate, in quest’ordine: ${elenco}. I comandi sulla selezione le trattano come un blocco unico e ne conservano l’ordine relativo.`
}

export function notebookManagerModel(doc: NotebookDocument): NotebookManagerModel {
  const ordered = orderedNotebookPages(doc)
  const selectedPageIdSet = new Set(doc.selectedPageIds)

  // Il target si deriva dalle pagine che esistono davvero, intersecando la
  // selezione con il documento. Una selezione che nomina una pagina scomparsa
  // non deve produrre un target fantasma: il conteggio annunciato all'utente e
  // il conteggio che il comando trattera' devono essere lo stesso numero.
  const targetPages = ordered.filter((page) => selectedPageIdSet.has(page.pageId))
  const target: NotebookManagerTarget = {
    pageIds: targetPages.map((page) => page.pageId),
    titles: targetPages.map((page) => page.title),
    count: targetPages.length,
  }

  // Stessa aritmetica del comando `reorder_pages`: l'indice di destinazione si
  // misura sulla lista *senza* la selezione, perche' e' li' che il blocco viene
  // reinserito. Tenerla qui, e non nella vista, impedisce che le due divergano.
  const firstSelectedIndex = ordered.findIndex((page) => selectedPageIdSet.has(page.pageId))
  const targetIndex = firstSelectedIndex < 0
    ? 0
    : ordered
      .slice(0, firstSelectedIndex)
      .filter((page) => !selectedPageIdSet.has(page.pageId))
      .length
  const remainingPageCount = ordered.length - target.count

  return {
    rows: ordered.map((page) => ({
      pageId: page.pageId,
      ordinal: page.ordinal,
      title: page.title,
      orientation: page.orientation,
      isActive: page.pageId === doc.activePageId,
      isSelected: selectedPageIdSet.has(page.pageId),
    })),
    activePageId: doc.activePageId,
    target,
    reorderTargetIndex: targetIndex,
    reorderBound: remainingPageCount,
    // Un controllo abilitato promette un effetto. Senza selezione non c'e'
    // effetto, quindi non c'e' promessa: `canMove*` restano falsi.
    canMoveUp: target.count > 0 && targetIndex > 0,
    canMoveDown: target.count > 0 && targetIndex < remainingPageCount,
    canRotate: target.count > 0,
    canDelete: ordered.length > 1,
    announcement: declareTarget(target),
    triggerLabel: target.count === 0
      ? "Gestisci pagine"
      : target.count === 1
        ? "Gestisci pagine, 1 selezionata"
        : `Gestisci pagine, ${target.count} selezionate`,
  }
}
