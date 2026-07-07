// @vitest-environment jsdom
// Hover node highlight (breadboard copy system): passare su un foro illumina
// TUTTA la sua tie-strip/rail e dichiara il ref col vocabolario del libro.
// Il docente vede la NET, non un puntino — è il gesto che rende copiabile un
// circuito dalla figura ("questa gamba va in un punto qualsiasi della strip").

import { cleanup, fireEvent, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import {
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
} from "../toolhost/ToolCanvasEmbeddable"

afterEach(cleanup)

function mountSim() {
  const element = createToolEmbedElement()
  const view = renderToolCanvasEmbeddable(element as never)
  if (view === null) throw new Error("embeddable non renderizzato")
  return render(view).container
}

describe("hover node highlight sulla breadboard del post-it", () => {
  it("hover su f9: label col ref + tutta la strip f-j col.9 evidenziata, e9 NO", () => {
    const container = mountSim()
    const hole = container.querySelector('[data-bb-hole="bb1:f9"]')
    expect(hole).not.toBeNull()
    fireEvent.mouseEnter(hole!)

    const label = container.querySelector("[data-bb-hover-label]")
    expect(label).not.toBeNull()
    expect(label?.textContent).toContain("bb1:f9")
    expect(label?.textContent).toContain("colonna 9")

    // Tutta la tie-strip f-j della colonna 9 è evidenziata…
    for (const ref of ["bb1:f9", "bb1:g9", "bb1:h9", "bb1:i9", "bb1:j9"]) {
      expect(
        container.querySelector(`[data-bb-hole="${ref}"]`)?.getAttribute("data-highlight"),
        `${ref} deve essere evidenziato`,
      ).toBe("1")
    }
    // …ma la metà opposta (e9, oltre il canale) NO: le due strip sono net diverse.
    expect(
      container.querySelector('[data-bb-hole="bb1:e9"]')?.getAttribute("data-highlight"),
    ).toBeNull()
  })

  it("hover su un rail: si illumina l'intera striscia rossa, non le strip", () => {
    const container = mountSim()
    const rail = container.querySelector('[data-bb-hole="bb1:bus-top-plus-9"]')
    expect(rail).not.toBeNull()
    fireEvent.mouseEnter(rail!)
    expect(
      container.querySelector('[data-bb-hole="bb1:bus-top-plus-1"]')?.getAttribute("data-highlight"),
    ).toBe("1")
    expect(
      container.querySelector('[data-bb-hole="bb1:f9"]')?.getAttribute("data-highlight"),
    ).toBeNull()
    const label = container.querySelector("[data-bb-hover-label]")
    expect(label?.textContent).toContain("striscia rossa")
  })

  it("mouseLeave: highlight e label spariscono", () => {
    const container = mountSim()
    const hole = container.querySelector('[data-bb-hole="bb1:f9"]')!
    fireEvent.mouseEnter(hole)
    expect(container.querySelector("[data-bb-hover-label]")).not.toBeNull()
    fireEvent.mouseLeave(hole)
    expect(container.querySelector("[data-bb-hover-label]")).toBeNull()
    expect(container.querySelectorAll("[data-highlight]").length).toBe(0)
  })
})
