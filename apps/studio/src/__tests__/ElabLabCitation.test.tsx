// @vitest-environment jsdom
// Golden-path "manuale→citazione" — la vista ELAB Lab mostra la citazione
// REALE del libro per l'esperimento montato: etichetta Vol/Pag, capitolo,
// testo e istruzioni passo-passo VERBATIM dal Pack (volume-references,
// estratto dai PDF ufficiali). Principio Zero: niente testo inventato —
// se il riferimento manca, il pannello non c'è (stato dichiarato).

import { cleanup, render, waitFor } from "@testing-library/react"
import { StrictMode } from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import ElabLab from "../design/ElabLab"
import { getVolumeRef, getVolumeLabel } from "@elab-pack/data/volume-references"
import { InMemoryEventLog } from "../lessonos/eventlog"

beforeEach(() => {
  window.history.replaceState(null, "", "/?vista=elab-lab")
})

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("ELAB Lab — citazione dal libro (Pack volume-references)", () => {
  it("il Pack ha il riferimento reale di v1-cap6-esp1 (fonte, non fixture)", () => {
    const ref = getVolumeRef("v1-cap6-esp1")
    expect(ref?.volume).toBe(1)
    expect(ref?.bookPage).toBe(29)
    expect(getVolumeLabel("v1-cap6-esp1")).toBe("Vol. 1, p. 29")
  })

  it("la vista mostra etichetta, capitolo e istruzioni verbatim dal libro", async () => {
    const { container } = render(
      <StrictMode>
        <ElabLab eventLog={new InMemoryEventLog()} />
      </StrictMode>,
    )
    const panel = await waitFor(() => {
      const node = container.querySelector("[data-elab-lab-citation]")
      if (node === null) throw new Error("pannello citazione assente")
      return node
    })
    const ref = getVolumeRef("v1-cap6-esp1")
    if (ref === null) throw new Error("riferimento Pack assente")
    expect(panel.textContent).toContain("Vol. 1, p. 29")
    expect(panel.textContent).toContain(ref.chapter)
    // Istruzioni passo-passo: TUTTE e nell'ordine del libro.
    const steps = Array.from(panel.querySelectorAll("[data-book-step]")).map(
      (step) => step.textContent,
    )
    expect(steps).toEqual(ref.bookInstructions)
  })

  it("i pannelli laterali stanno in UNA colonna (niente overlap assoluto)", async () => {
    const { container } = render(
      <StrictMode>
        <ElabLab eventLog={new InMemoryEventLog()} />
      </StrictMode>,
    )
    await waitFor(() => {
      if (container.querySelector("[data-elab-lab-citation]") === null) {
        throw new Error("pannello citazione assente")
      }
    })
    const column = container.querySelector(".elab-lab-panels")
    expect(column).not.toBeNull()
    // Tutti i pannelli della vista vivono nella colonna: solve, citazione,
    // marcatura — così nessuno copre gli altri (debito UI chiuso).
    const panels = column?.querySelectorAll(".reference-tool-panel") ?? []
    expect(panels.length).toBeGreaterThanOrEqual(3)
  })
})
