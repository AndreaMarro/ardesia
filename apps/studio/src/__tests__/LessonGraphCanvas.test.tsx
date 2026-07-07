// @vitest-environment jsdom
//
// Grafo Tutor come VERO grafo visuale (Graphify-style), non una lista di
// nodi/archi. Il canvas SVG rende ogni nodo come elemento navigabile e ogni
// arco come segmento reale; il click su un nodo sposta il focus (expand del
// vicinato lato projector). Delta VISIBILE dopo l'append di un evento LessonOS:
// i nodi appena comparsi portano data-delta="new". Zero PII: le evidenze sono
// ref pseudonime del libro/journal, mai nomi/email.

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import LessonGraphCanvas from "../design/LessonGraphCanvas"

afterEach(() => {
  cleanup()
})

const NODES = [
  { id: "c-ohm", kind: "concept" as const, label: { it: "Legge di Ohm" }, evidenceRefs: ["manual:page:71"] },
  { id: "e-short", kind: "error" as const, label: { it: "Corto circuito" }, evidenceRefs: ["board:elem-1"] },
  { id: "m-vol1", kind: "material" as const, label: { it: "Manuale Vol.1" }, evidenceRefs: ["manual:page:70"] },
]

const EDGES = [
  { from: "m-vol1", to: "c-ohm", kind: "cita" as const, introducedAt: 10 },
  { from: "e-short", to: "c-ohm", kind: "cita" as const, introducedAt: 20 },
]

function renderCanvas(overrides: Partial<React.ComponentProps<typeof LessonGraphCanvas>> = {}) {
  const onFocusNode = overrides.onFocusNode ?? vi.fn()
  render(
    <LessonGraphCanvas
      focusNodeId="c-ohm"
      nodes={NODES}
      edges={EDGES}
      onFocusNode={onFocusNode}
      {...overrides}
    />,
  )
  return { onFocusNode }
}

describe("LessonGraphCanvas — vero grafo visuale, non lista", () => {
  it("rende un canvas SVG con un nodo navigabile per nodo e un arco reale per arco", () => {
    renderCanvas()
    // È un grafico vettoriale reale, non una lista di <li>.
    const svg = document.querySelector("svg[data-zgraph-canvas]")
    expect(svg).not.toBeNull()
    expect(document.querySelectorAll("[data-zgraph-node]")).toHaveLength(NODES.length)
    expect(document.querySelectorAll("[data-zgraph-edge]")).toHaveLength(EDGES.length)
    // Gli archi sono segmenti disegnati (linea/percorso), non testo "from → to".
    for (const edge of document.querySelectorAll("[data-zgraph-edge]")) {
      expect(["line", "path"]).toContain(edge.tagName.toLowerCase())
    }
  })

  it("ogni nodo è un button accessibile etichettato dal suo label", () => {
    renderCanvas()
    expect(screen.getByRole("button", { name: /Legge di Ohm/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /Corto circuito/i })).toBeTruthy()
  })

  it("click su un nodo non in focus emette onFocusNode(id) — navigazione/expand", () => {
    const { onFocusNode } = renderCanvas()
    fireEvent.click(screen.getByRole("button", { name: /Corto circuito/i }))
    expect(onFocusNode).toHaveBeenCalledWith("e-short")
  })

  it("il nodo in focus è marcato aria-pressed", () => {
    renderCanvas()
    const focus = document.querySelector('[data-zgraph-node="c-ohm"]')
    expect(focus?.getAttribute("aria-pressed")).toBe("true")
    const other = document.querySelector('[data-zgraph-node="e-short"]')
    expect(other?.getAttribute("aria-pressed")).toBe("false")
  })

  it("pannello descrittori: mostra tipo + evidenze pseudonime del nodo in focus, zero PII", () => {
    renderCanvas()
    const panel = screen.getByTestId("zgraph-descriptor")
    // tipo didattico e label
    expect(panel.textContent).toContain("Legge di Ohm")
    // provenienza: la ref del libro è citata verbatim (pseudonima)
    expect(within(panel).getByText(/manual:page:71/)).toBeTruthy()
    // nessun campo PII: il pannello non inventa nomi/email
    expect(panel.textContent).not.toMatch(/@/)
  })

  it("delta dopo append: i nodi in newNodeIds portano data-delta=\"new\", gli altri no", () => {
    renderCanvas({ newNodeIds: ["e-short"] })
    expect(document.querySelector('[data-zgraph-node="e-short"]')?.getAttribute("data-delta")).toBe("new")
    expect(document.querySelector('[data-zgraph-node="c-ohm"]')?.getAttribute("data-delta")).toBeNull()
  })
})
