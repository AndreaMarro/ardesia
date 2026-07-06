// @vitest-environment jsdom
// Montaggio libero slice 3 — la palette del Simulation Plugin diventa VIVA:
// tap-tap sulla breadboard SVG (seleziona il componente dalla palette, tocca
// due fori → piazzato). Tap-tap e non drag: sulla LIM touch è il gesto
// affidabile, e ogni passo è falsificabile.
//
// Semantica occupazione = quella stabilita firsthand in #93: contano i SOLI
// pinAssignments (connections = topologia logica, non fili fisici). Un foro
// già assegnato rifiuta il tap con notice visibile — mai piazzamento muto.
//
// Fixture: scena reale v1-cap6-esp1 (createToolEmbedElement) — fori occupati
// bb1:bus-top-plus-9 / bb1:i9 / bb1:f9 / bb1:e9.

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

function palette(container: HTMLElement, label: string): Element {
  const item = container.querySelector(`[aria-label="palette ${label}"]`)
  if (item === null) throw new Error(`palette ${label} non trovata`)
  return item
}

function hole(container: HTMLElement, ref: string): Element {
  const target = container.querySelector(`[data-bb-hole="${ref}"]`)
  if (target === null) throw new Error(`foro ${ref} non trovato`)
  return target
}

function count(container: HTMLElement): string | null {
  return (
    container
      .querySelector("[data-montaggio-canvas-count]")
      ?.getAttribute("data-montaggio-canvas-count") ?? null
  )
}

function notice(container: HTMLElement): string {
  return container.querySelector("[data-montaggio-canvas-notice]")?.textContent ?? ""
}

describe("SimulationBoard — palette tap-tap (montaggio libero slice 3)", () => {
  it("la palette Resistenza si seleziona e deseleziona (aria-pressed)", () => {
    const container = mountSim()
    const resistenza = palette(container, "Resistenza")
    expect(resistenza.getAttribute("aria-pressed")).toBe("false")

    fireEvent.click(resistenza)
    expect(resistenza.getAttribute("aria-pressed")).toBe("true")

    fireEvent.click(palette(container, "Seleziona"))
    expect(resistenza.getAttribute("aria-pressed")).toBe("false")
  })

  it("tap su due fori LIBERI piazza una resistenza (conteggio + corpo SVG)", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "Resistenza"))

    fireEvent.click(hole(container, "bb1:c3"))
    // primo tap: pending visibile, ancora nessun piazzamento
    expect(hole(container, "bb1:c3").getAttribute("data-pending")).toBe("1")
    expect(count(container)).toBe("0")

    fireEvent.click(hole(container, "bb1:c4"))
    expect(count(container)).toBe("1")
    expect(
      container.querySelector('[aria-label="Resistore montaggio libero r-libero-1"]'),
    ).not.toBeNull()
  })

  it("tap su un foro OCCUPATO dal manuale: notice visibile, nessun piazzamento", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "LED"))

    fireEvent.click(hole(container, "bb1:i9"))
    expect(notice(container)).toContain("bb1:i9")
    expect(notice(container)).toContain("occupato")
    expect(count(container)).toBe("0")
  })

  it("il secondo tap sullo stesso foro del primo viene rifiutato", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "LED"))

    fireEvent.click(hole(container, "bb1:c3"))
    fireEvent.click(hole(container, "bb1:c3"))
    expect(notice(container)).toContain("stesso foro")
    expect(count(container)).toBe("0")
    expect(hole(container, "bb1:c3").getAttribute("data-pending")).toBe("1")
  })

  it("un piazzamento occupa i suoi fori anche per i tap successivi", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "Resistenza"))
    fireEvent.click(hole(container, "bb1:c3"))
    fireEvent.click(hole(container, "bb1:c4"))
    expect(count(container)).toBe("1")

    fireEvent.click(hole(container, "bb1:c4"))
    expect(notice(container)).toContain("occupato")
    expect(count(container)).toBe("1")
  })

  it("il LED piazzato rende il corpo LED e 'riparti dal manuale' azzera tutto", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "LED"))
    fireEvent.click(hole(container, "bb1:d12"))
    fireEvent.click(hole(container, "bb1:d13"))
    expect(count(container)).toBe("1")
    expect(
      container.querySelector('[aria-label="LED montaggio libero led-libero-1"]'),
    ).not.toBeNull()

    const reset = container.querySelector("[data-montaggio-canvas-reset]")
    if (reset === null) throw new Error("reset non trovato")
    fireEvent.click(reset)
    expect(count(container)).toBe("0")
    expect(
      container.querySelector('[aria-label="LED montaggio libero led-libero-1"]'),
    ).toBeNull()
  })

  it("tap su un foro senza componente selezionato: nessun effetto", () => {
    const container = mountSim()
    fireEvent.click(hole(container, "bb1:c3"))
    expect(count(container)).toBe("0")
    expect(notice(container)).toBe("")
    expect(hole(container, "bb1:c3").getAttribute("data-pending")).not.toBe("1")
  })
})
