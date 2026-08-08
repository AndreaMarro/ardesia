import { describe, expect, it } from "vitest"

import { NOTEBOOK_DEFAULT_LOGICAL_SIZE } from "../store/notebookDocument"
import type { NotebookDocument, NotebookPage } from "../store/notebookDocument"
import { notebookManagerModel } from "../store/notebookPageManager"

function page(pageId: string, ordinal: number, title: string): NotebookPage {
  return {
    pageId,
    ordinal,
    title,
    orientation: 0,
    logicalSize: { ...NOTEBOOK_DEFAULT_LOGICAL_SIZE },
  }
}

/**
 * Documento congelato a mano: il gestore e' una proiezione, quindi il test deve
 * poter descrivere stati che i comandi produrrebbero solo indirettamente
 * (array non ordinato, selezione in ordine di click, selezione fantasma).
 */
function doc(options: {
  pages: ReadonlyArray<NotebookPage>
  activePageId: string
  selectedPageIds: ReadonlyArray<string>
}): NotebookDocument {
  return {
    v: 2,
    kind: "notebook",
    documentId: "taccuino-test",
    title: "Taccuino",
    createdAt: 1,
    updatedAt: 1,
    pages: options.pages,
    revision: 0,
    recentCommandIds: [],
    activePageId: options.activePageId,
    selectedPageIds: options.selectedPageIds,
    history: { undo: [], redo: [] },
  }
}

const quattroPagine = [
  page("pa", 0, "Introduzione"),
  page("pb", 1, "Circuito"),
  page("pc", 2, "Misure"),
  page("pd", 3, "Conclusioni"),
]

describe("notebookManagerModel", () => {
  it("elenca le pagine in ordine di documento, non nell'ordine dell'array", () => {
    const modello = notebookManagerModel(doc({
      // L'array e' deliberatamente disordinato: l'ordinale e' l'autorita'.
      pages: [quattroPagine[2], quattroPagine[0], quattroPagine[3], quattroPagine[1]],
      activePageId: "pa",
      selectedPageIds: ["pa"],
    }))

    expect(modello.rows.map((row) => row.pageId)).toEqual(["pa", "pb", "pc", "pd"])
    expect(modello.rows.map((row) => row.ordinal)).toEqual([0, 1, 2, 3])
  })

  it("dichiara il target bulk in ordine di documento, non in ordine di click", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      // L'utente ha toccato prima l'ultima pagina, poi la seconda.
      selectedPageIds: ["pd", "pb"],
    }))

    expect(modello.target.pageIds).toEqual(["pb", "pd"])
    expect(modello.target.titles).toEqual(["Circuito", "Conclusioni"])
    expect(modello.target.count).toBe(2)
  })

  it("non produce un target fantasma da una selezione che punta a pagine inesistenti", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pb", "pz"],
    }))

    expect(modello.target.pageIds).toEqual(["pb"])
    expect(modello.target.count).toBe(1)
  })

  it("marca una sola pagina come attiva", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pc",
      selectedPageIds: ["pc"],
    }))

    expect(modello.rows.filter((row) => row.isActive).map((row) => row.pageId)).toEqual(["pc"])
    expect(modello.activePageId).toBe("pc")
  })

  it("marca come selezionate esattamente le pagine del target", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pd", "pb"],
    }))

    expect(modello.rows.filter((row) => row.isSelected).map((row) => row.pageId)).toEqual(["pb", "pd"])
  })

  it("non permette di spostare verso l'inizio una selezione gia' in testa", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pa", "pb"],
    }))

    expect(modello.canMoveUp).toBe(false)
    expect(modello.canMoveDown).toBe(true)
  })

  it("non permette di spostare verso la fine una selezione gia' in coda", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pc", "pd"],
    }))

    expect(modello.canMoveUp).toBe(true)
    expect(modello.canMoveDown).toBe(false)
  })

  it("non promette uno spostamento quando non c'e' selezione", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: [],
    }))

    expect(modello.canMoveUp).toBe(false)
    expect(modello.canMoveDown).toBe(false)
    expect(modello.canRotate).toBe(false)
  })

  it("consente la rotazione solo con almeno una pagina realmente selezionata", () => {
    const conSelezione = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pb"],
    }))
    const soloFantasma = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pz"],
    }))

    expect(conSelezione.canRotate).toBe(true)
    expect(soloFantasma.canRotate).toBe(false)
  })

  it("non consente di eliminare l'ultima pagina rimasta", () => {
    const unaSola = notebookManagerModel(doc({
      pages: [quattroPagine[0]],
      activePageId: "pa",
      selectedPageIds: ["pa"],
    }))
    const due = notebookManagerModel(doc({
      pages: [quattroPagine[0], quattroPagine[1]],
      activePageId: "pa",
      selectedPageIds: ["pa"],
    }))

    expect(unaSola.canDelete).toBe(false)
    expect(due.canDelete).toBe(true)
  })

  it("annuncia quante pagine, in quale ordine e con quale conseguenza", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pd", "pb"],
    }))

    // La frase deve nominare il numero, i titoli nell'ordine di applicazione e
    // il fatto che l'ordine relativo non cambia: e' cio' che l'utente deve
    // poter leggere *prima* di premere un comando bulk.
    expect(modello.announcement).toContain("2 pagine")
    expect(modello.announcement).toContain("Circuito")
    expect(modello.announcement).toContain("Conclusioni")
    expect(modello.announcement.indexOf("Circuito"))
      .toBeLessThan(modello.announcement.indexOf("Conclusioni"))
    expect(modello.announcement).toMatch(/ordine relativo/i)
  })

  it("annuncia il caso senza selezione senza inventare un target", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: [],
    }))

    expect(modello.announcement).toMatch(/nessuna pagina selezionata/i)
  })

  it("annuncia una sola pagina al singolare", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pb"],
    }))

    expect(modello.announcement).toContain("1 pagina")
    expect(modello.announcement).not.toContain("1 pagine")
  })

  it("espone l'indice di reinserimento misurato senza la selezione", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      // Selezione non contigua: pb e pd. Davanti a pb c'e' una sola pagina non
      // selezionata, quindi il blocco si reinserisce all'indice 1 di una lista
      // che, tolta la selezione, ne contiene 2.
      selectedPageIds: ["pb", "pd"],
    }))

    expect(modello.reorderTargetIndex).toBe(1)
    expect(modello.reorderBound).toBe(2)
    expect(modello.canMoveUp).toBe(true)
    expect(modello.canMoveDown).toBe(true)
  })

  it("tiene l'indice di reinserimento entro i limiti quando la selezione e' vuota", () => {
    const modello = notebookManagerModel(doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: [],
    }))

    expect(modello.reorderTargetIndex).toBe(0)
    expect(modello.reorderBound).toBe(4)
  })

  it("accorda il numero nel nome accessibile di chi apre il gestore", () => {
    const base = { pages: quattroPagine, activePageId: "pa" }
    const nessuna = notebookManagerModel(doc({ ...base, selectedPageIds: [] }))
    const una = notebookManagerModel(doc({ ...base, selectedPageIds: ["pb"] }))
    const due = notebookManagerModel(doc({ ...base, selectedPageIds: ["pb", "pd"] }))

    expect(nessuna.triggerLabel).toBe("Gestisci pagine")
    expect(una.triggerLabel).toBe("Gestisci pagine, 1 selezionata")
    expect(due.triggerLabel).toBe("Gestisci pagine, 2 selezionate")
  })

  it("espone la revisione del documento proiettato", () => {
    const sorgente = doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pa"],
    })

    expect(notebookManagerModel(sorgente).revision).toBe(0)
    expect(notebookManagerModel({ ...sorgente, revision: 7 }).revision).toBe(7)
  })

  it("non muta il documento che proietta", () => {
    const sorgente = doc({
      pages: quattroPagine,
      activePageId: "pa",
      selectedPageIds: ["pd", "pb"],
    })
    const prima = JSON.stringify(sorgente)

    notebookManagerModel(sorgente)

    expect(JSON.stringify(sorgente)).toBe(prima)
  })
})
