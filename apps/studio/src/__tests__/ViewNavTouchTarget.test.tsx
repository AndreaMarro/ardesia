// @vitest-environment jsdom
// Founder Beta — ogni bersaglio della nav deve essere alto almeno 44 CSS px.
//
// La soglia 44 e' scritta a mano qui e NON importata da ViewNav: se il test
// leggesse la stessa costante del componente, cambiare la costante cambierebbe
// insieme la regola e la sua verifica, e l'assert non potrebbe piu' fallire.

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ViewNav, { ARDESIA_VIEW_LINKS } from "../design/ViewNav"

const REQUIRED_TARGET_PX = 44

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

/**
 * Altezza minima dichiarata dal bersaglio, in CSS px.
 *
 * Legge lo stile calcolato invece dell'oggetto di stile esportato, cosi'
 * qualunque strada usata per fissare l'altezza viene osservata. jsdom non
 * impagina: `getBoundingClientRect()` qui e' sempre 0, e non e' un referente
 * utilizzabile. `min-height` invece e' il minimo dichiarato, ed e' esattamente
 * il referente del requisito.
 *
 * Un valore che non si legge come px e' un fallimento, non uno zero: se il
 * bersaglio prendesse l'altezza da un foglio di stile che jsdom non applica,
 * il test deve rompersi in modo rumoroso invece di passare in silenzio.
 */
function declaredMinHeightPx(element: Element, label: string): number {
  const raw = window.getComputedStyle(element).minHeight
  const parsed = /^(-?[\d.]+)px$/.exec(raw.trim())
  if (!parsed) {
    throw new Error(
      `[${label}] min-height non leggibile come px: "${raw}". ` +
        "L'altezza del bersaglio non e' osservabile da questo oracolo.",
    )
  }
  return Number(parsed[1])
}

describe("ViewNav — bersagli tattili da 44 CSS px", () => {
  it("nessun bersaglio della nav scende sotto i 44 px richiesti", () => {
    window.history.replaceState(null, "", "/?vista=cruscotto#wbstudio-room1")
    const { container } = render(<ViewNav current="cruscotto" />)
    const items = Array.from(container.querySelectorAll("[data-view-nav-item]"))

    // Precondizione: se la nav non rendesse nulla, il ciclo sotto sarebbe
    // vuoto e il test passerebbe per assenza di bersagli invece che per
    // conformita'. La precondizione va stabilita, non assunta.
    expect(items.length).toBe(ARDESIA_VIEW_LINKS.length)
    expect(items.length).toBeGreaterThan(0)

    const measured = items.map((item) => {
      const id = item.getAttribute("data-view-nav-item") ?? "(senza id)"
      return { id, minHeightPx: declaredMinHeightPx(item, id) }
    })

    const undersized = measured.filter(
      (target) => target.minHeightPx < REQUIRED_TARGET_PX,
    )

    // Il messaggio nomina i bersagli e i loro valori: un fallimento deve dire
    // QUALE riga e' sotto soglia, non solo che qualcosa lo e'.
    expect(
      undersized,
      `bersagli sotto ${REQUIRED_TARGET_PX}px: ${JSON.stringify(undersized)}`,
    ).toEqual([])
  })

  it("misura il bersaglio anche quando la nav non ha una superficie corrente", () => {
    window.history.replaceState(null, "", "/#wbstudio-room1")
    const { container } = render(<ViewNav current="lavagna" />)
    const items = Array.from(container.querySelectorAll("[data-view-nav-item]"))
    expect(items.length).toBe(ARDESIA_VIEW_LINKS.length)

    for (const item of items) {
      const id = item.getAttribute("data-view-nav-item") ?? "(senza id)"
      expect(
        declaredMinHeightPx(item, id),
        `bersaglio "${id}" sotto soglia`,
      ).toBeGreaterThanOrEqual(REQUIRED_TARGET_PX)
    }
  })
})
