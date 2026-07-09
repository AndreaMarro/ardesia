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
import { analyzeFreeAssembly, type FreeAssemblyScene } from "../../sim/freeAssembly"
import {
  createMontaggioPlacementOperations,
  createBoardSceneWithPlacements,
  createReferenceSimulationScene,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
  type SimulationSceneV1,
} from "../toolhost/ToolCanvasEmbeddable"

afterEach(cleanup)

function freeAssemblySceneOf(scene: SimulationSceneV1): FreeAssemblyScene {
  return {
    components: scene.components.map((component) => ({
      id: component.id,
      type: component.type,
    })),
    pinAssignments: scene.pinAssignments,
    wires: scene.connections.map((connection) => ({
      from: connection.from,
      to: connection.to,
    })),
  }
}

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
  it("i piazzamenti liberi scrivono componenti e pinAssignments strutturati", () => {
    const base = createReferenceSimulationScene()
    const boardScene = createBoardSceneWithPlacements(base, [
      { id: "r-libero-1", type: "resistor", holes: ["bb1:c3", "bb1:c4"] },
      { id: "led-libero-1", type: "led", holes: ["bb1:d12", "bb1:d13"] },
    ])

    expect(base.pinAssignments["r-libero-1:pin1"]).toBeUndefined()
    expect(base.pinAssignments["led-libero-1:anode"]).toBeUndefined()
    expect(boardScene.components.map((component) => component.id)).toContain("r-libero-1")
    expect(boardScene.components.map((component) => component.id)).toContain("led-libero-1")
    expect(boardScene.pinAssignments).toMatchObject({
      "r-libero-1:pin1": "bb1:c3",
      "r-libero-1:pin2": "bb1:c4",
      "led-libero-1:anode": "bb1:d12",
      "led-libero-1:cathode": "bb1:d13",
    })
    expect(analyzeFreeAssembly(freeAssemblySceneOf(boardScene)).ok).toBe(true)
  })

  it("i piazzamenti liberi producono operazioni strutturate per il placement pipeline", () => {
    const operations = createMontaggioPlacementOperations({
      embedId: "sim-embed-1",
      placements: [
        { id: "r-libero-1", type: "resistor", holes: ["bb1:c3", "bb1:c4"] },
        { id: "led-libero-1", type: "led", holes: ["bb1:d12", "bb1:d13"] },
      ],
    })

    expect(operations.map((operation) => operation.operation.kind)).toEqual([
      "place-component",
      "place-component",
    ])
    expect(operations[0]).toMatchObject({
      schema: "simulation-operation/1",
      id: "sim-embed-1:montaggio:place:r-libero-1",
      actor: "manual",
      origin: "canvas",
      targetProvider: "local",
      providerMode: "static",
      operation: {
        kind: "place-component",
        component: {
          id: "r-libero-1",
          type: "resistor",
          attrs: { value: 470 },
          pins: [{ id: "pin1" }, { id: "pin2" }],
        },
        pinAssignments: {
          "r-libero-1:pin1": "bb1:c3",
          "r-libero-1:pin2": "bb1:c4",
        },
      },
    })
    expect(operations[1]).toMatchObject({
      id: "sim-embed-1:montaggio:place:led-libero-1",
      operation: {
        kind: "place-component",
        component: {
          id: "led-libero-1",
          type: "led",
          attrs: { color: "red" },
          pins: [{ id: "anode" }, { id: "cathode" }],
        },
        pinAssignments: {
          "led-libero-1:anode": "bb1:d12",
          "led-libero-1:cathode": "bb1:d13",
        },
      },
    })
  })

  it("un piazzamento su foro gia occupato resta bloccabile dal netlist validator", () => {
    const base = createReferenceSimulationScene()
    const boardScene = createBoardSceneWithPlacements(base, [
      { id: "led-libero-1", type: "led", holes: ["bb1:i9", "bb1:d13"] },
    ])
    const report = analyzeFreeAssembly(freeAssemblySceneOf(boardScene))

    expect(report.ok).toBe(false)
    expect(
      report.findings.some((finding) => finding.source === "occupancy" && finding.ref === "bb1:i9"),
    ).toBe(true)
  })

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

describe("SimulationBoard — palette CAVO come connection reale (P32 D6)", () => {
  it("il cavo entra in connections (kind wire), NON in components/pinAssignments; il digest cambia", async () => {
    const { simulationSceneDigest } = await import("../../sim/core/simulationSceneDigest")
    const base = createReferenceSimulationScene()
    const boardScene = createBoardSceneWithPlacements(base, [
      { id: "cavo-libero-1", type: "wire", holes: ["bb1:c3", "bb1:d12"] },
    ])

    expect(boardScene.connections).toContainEqual(
      expect.objectContaining({ from: "bb1:c3", to: "bb1:d12", kind: "wire" }),
    )
    expect(boardScene.connections).toHaveLength(base.connections.length + 1)
    expect(boardScene.components).toHaveLength(base.components.length)
    expect(boardScene.pinAssignments).toEqual(base.pinAssignments)
    expect(simulationSceneDigest(boardScene)).not.toBe(simulationSceneDigest(base))
  })

  it("FISICA: il cavo unisce le net reali e chiude un circuito serie aperto", async () => {
    const { solveSeriesLoop, resolveNet } = await import("../../sim/breadboard/simulationBreadboard")
    const base = createReferenceSimulationScene()
    // Circuito serie sintetico con un GAP: tie-top-10 e tie-top-20 non comunicano.
    const synthetic: SimulationSceneV1 = {
      ...base,
      components: [
        { id: "bat1", type: "battery9v", label: "Batteria 9V", anchor: "bb1" },
        { id: "r1", type: "resistor", label: "Resistore", value: 470, anchor: "bb1" },
        { id: "led1", type: "led", label: "LED", color: "red", anchor: "bb1" },
      ],
      pinAssignments: {
        "bat1:positive": "bb1:f1",
        "r1:pin1": "bb1:g1",
        "r1:pin2": "bb1:f5",
        "led1:anode": "bb1:g5",
        "led1:cathode": "bb1:f10",
        "bat1:negative": "bb1:f20",
      },
      connections: [],
    }
    expect(solveSeriesLoop(synthetic).closed).toBe(false)
    expect(resolveNet("bb1:g10", synthetic)).not.toBe(resolveNet("bb1:g20", synthetic))

    const bridged = createBoardSceneWithPlacements(synthetic, [
      { id: "cavo-libero-1", type: "wire", holes: ["bb1:g10", "bb1:g20"] },
    ])
    expect(resolveNet("bb1:g10", bridged)).toBe(resolveNet("bb1:g20", bridged))
    const solved = solveSeriesLoop(bridged)
    expect(solved.closed).toBe(true)
    expect(solved.resistanceOhms).toBe(470)
    expect(solved.ledCount).toBe(1)
  })

  it("il cavo produce un envelope connect-wire (vocabolario operazioni esistente)", () => {
    const operations = createMontaggioPlacementOperations({
      embedId: "sim-embed-1",
      placements: [{ id: "cavo-libero-1", type: "wire", holes: ["bb1:c3", "bb1:d12"] }],
    })

    expect(operations).toHaveLength(1)
    expect(operations[0]).toMatchObject({
      schema: "simulation-operation/1",
      id: "sim-embed-1:montaggio:connect:cavo-libero-1",
      actor: "manual",
      origin: "canvas",
      targetProvider: "local",
      providerMode: "static",
      operation: {
        kind: "connect-wire",
        wire: {
          id: "cavo-libero-1",
          from: "bb1:c3",
          to: "bb1:d12",
        },
      },
    })
  })

  it("la palette Cavo si seleziona (aria-pressed) e il tap-tap piazza un cavo", () => {
    const container = mountSim()
    const cavo = palette(container, "Cavo")
    fireEvent.click(cavo)
    expect(cavo.getAttribute("aria-pressed")).toBe("true")

    fireEvent.click(hole(container, "bb1:c3"))
    expect(hole(container, "bb1:c3").getAttribute("data-pending")).toBe("1")
    fireEvent.click(hole(container, "bb1:c4"))
    expect(count(container)).toBe("1")
    expect(notice(container)).toBe("")
  })

  it("FISICA (D6-bis): il pin di un componente si raggiunge dal foro LIBERO della stessa tie", async () => {
    // L'equivalente breadboard-reale del "wire al terminale" di Tinkercad NON è
    // due reofori nello stesso foro (impossibile fisicamente) ma un foro libero
    // della STESSA tie-strip (colonna a 5 fori). Qui il cavo tocca g10 (libero)
    // e la net risultante include f10 (occupato dal catodo del LED).
    const { resolveNet } = await import("../../sim/breadboard/simulationBreadboard")
    const base = createReferenceSimulationScene()
    const synthetic: SimulationSceneV1 = {
      ...base,
      components: [
        { id: "bat1", type: "battery9v", label: "Batteria 9V", anchor: "bb1" },
        { id: "led1", type: "led", label: "LED", color: "red", anchor: "bb1" },
      ],
      pinAssignments: {
        "bat1:positive": "bb1:f1",
        "led1:anode": "bb1:g1",
        "led1:cathode": "bb1:f10",
        "bat1:negative": "bb1:f20",
      },
      connections: [],
    }
    expect(resolveNet("bb1:f10", synthetic)).not.toBe(resolveNet("bb1:f20", synthetic))
    const bridged = createBoardSceneWithPlacements(synthetic, [
      { id: "cavo-libero-1", type: "wire", holes: ["bb1:g10", "bb1:g20"] },
    ])
    // Il cavo non ha toccato f10, eppure la net del PIN è unificata via tie.
    expect(resolveNet("bb1:f10", bridged)).toBe(resolveNet("bb1:f20", bridged))
  })

  it("FISICA (D6-bis): il cavo verso un foro LIBERO della rail unifica la net della rail", async () => {
    const { solveSeriesLoop } = await import("../../sim/breadboard/simulationBreadboard")
    const base = createReferenceSimulationScene()
    // Circuito instradato ATTRAVERSO la rail plus: si chiude SOLO se il cavo
    // g1→bus-top-plus-3 unifica la rail (r1:pin1 sta su bus-top-plus-7: stessa
    // rail-net, colonna diversa).
    const synthetic: SimulationSceneV1 = {
      ...base,
      components: [
        { id: "bat1", type: "battery9v", label: "Batteria 9V", anchor: "bb1" },
        { id: "r1", type: "resistor", label: "Resistore", value: 470, anchor: "bb1" },
        { id: "led1", type: "led", label: "LED", color: "red", anchor: "bb1" },
      ],
      pinAssignments: {
        "bat1:positive": "bb1:f1",
        "r1:pin1": "bb1:bus-top-plus-7",
        "r1:pin2": "bb1:f5",
        "led1:anode": "bb1:g5",
        "led1:cathode": "bb1:f10",
        "bat1:negative": "bb1:f20",
      },
      connections: [],
    }
    expect(solveSeriesLoop(synthetic).closed).toBe(false)
    const bridged = createBoardSceneWithPlacements(synthetic, [
      { id: "cavo-libero-1", type: "wire", holes: ["bb1:g1", "bb1:bus-top-plus-3"] },
      { id: "cavo-libero-2", type: "wire", holes: ["bb1:g10", "bb1:g20"] },
    ])
    expect(solveSeriesLoop(bridged).closed).toBe(true)
  })

  it("UI (D6-bis): un foro di RAIL libero è tappabile col Cavo (jumper verso la rail)", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "Cavo"))
    fireEvent.click(hole(container, "bb1:bus-top-plus-3"))
    expect(hole(container, "bb1:bus-top-plus-3").getAttribute("data-pending")).toBe("1")
    fireEvent.click(hole(container, "bb1:c3"))
    expect(count(container)).toBe("1")
    expect(notice(container)).toBe("")
  })

  it("cavo su foro occupato dal manuale: notice, nessun piazzamento (regola v1 uniforme)", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "Cavo"))
    fireEvent.click(hole(container, "bb1:i9"))
    expect(notice(container)).toContain("occupato")
    expect(count(container)).toBe("0")
  })

  it("'riparti dal manuale' azzera anche i cavi", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "Cavo"))
    fireEvent.click(hole(container, "bb1:c3"))
    fireEvent.click(hole(container, "bb1:c4"))
    expect(count(container)).toBe("1")
    const reset = container.querySelector('[aria-label="riparti dal manuale"]')
    if (reset === null) throw new Error("reset non trovato")
    fireEvent.click(reset)
    expect(count(container)).toBe("0")
  })
})
