// @vitest-environment jsdom
// Post-it v1-cap9-esp6 — lampada RGB con 3 potenziometri: PRIMO esperimento
// multi-pin renderizzato dal Simulation Plugin. Il runtime "elab-mna" non
// pre-dichiara nulla: i 3 canali (correnti, brightness) escono dal motore MNA
// reale sui dati della scena, e la diagnostica li mostra per canale.

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import {
  createToolEmbedElement,
  createV1Cap9Esp6SimulationScene,
  renderToolCanvasEmbeddable,
  validateBookLayoutScene,
  ELAB_V1_RGB_LAMP_EMBED_ID,
  ELAB_V1_RGB_LAMP_EXPERIMENT_ID,
  buildSimulationInsert,
} from "../toolhost/ToolCanvasEmbeddable"

afterEach(cleanup)

function mountEsp6() {
  const element = createToolEmbedElement({
    embedId: ELAB_V1_RGB_LAMP_EMBED_ID,
    state: { kind: "simulation-scene-v1", scene: createV1Cap9Esp6SimulationScene() },
  })
  const view = renderToolCanvasEmbeddable(element as never, undefined, "runtime")
  if (view === null) throw new Error("embeddable non renderizzato")
  return render(view).container
}

describe("createV1Cap9Esp6SimulationScene — bridge multi-pin", () => {
  it("runtime elab-mna, 9 componenti (3 pot + 3 resistori + RGB), 16 fili autorati", () => {
    const scene = createV1Cap9Esp6SimulationScene()
    expect(scene.experimentId).toBe(ELAB_V1_RGB_LAMP_EXPERIMENT_ID)
    expect(scene.runtime.kind).toBe("elab-mna")
    if (scene.runtime.kind === "elab-mna") {
      expect(scene.runtime.supplyVolts).toBe(9)
    }
    const types = scene.components.map((component) => component.type)
    expect(types.filter((type) => type === "potentiometer").length).toBe(3)
    expect(types.filter((type) => type === "rgb-led").length).toBe(1)
    expect(scene.connections.length).toBe(16)
    for (const connection of scene.connections) {
      expect(connection.path?.kind, `${connection.from}→${connection.to}`).toBe("polyline")
    }
    const validation = validateBookLayoutScene(scene)
    expect(validation.errors).toEqual([])
  })

  it("le etichette dichiarano i componenti del libro (mai type raw)", () => {
    const scene = createV1Cap9Esp6SimulationScene()
    const pot = scene.components.find((component) => component.type === "potentiometer")
    const rgb = scene.components.find((component) => component.type === "rgb-led")
    expect(pot?.label).toContain("Potenziometro")
    expect(rgb?.label).toContain("LED RGB")
  })
})

describe("post-it esp6 — canali dal motore reale", () => {
  it("diagnostica per canale: R, G e B con corrente in mA dal solve MNA", () => {
    const container = mountEsp6()
    const diag = container.querySelector("[data-rgb-channels]")
    expect(diag).not.toBeNull()
    const text = diag?.textContent ?? ""
    for (const channel of ["R", "G", "B"]) {
      expect(text).toContain(`${channel} `)
    }
    expect(text).toMatch(/\d+\.\d mA/)
  })

  it("SVG: 3 potenziometri e il LED RGB acceso (canali indipendenti dal solve)", () => {
    const container = mountEsp6()
    expect(container.querySelectorAll("[aria-label^='Potenziometro']").length).toBe(3)
    const rgb = container.querySelector("[aria-label^='LED RGB']")
    expect(rgb).not.toBeNull()
    expect(rgb?.getAttribute("aria-label")).toContain("acceso")
  })

  it("non espone il conteggio tecnico del catalogo nella UI primaria", () => {
    const container = mountEsp6()
    expect(container.querySelector("[data-elab-catalog-summary]")).toBeNull()
  })
})

describe("inserimento toolbar", () => {
  it("buildSimulationInsert('v1-cap9-esp6') produce il post-it con la scena esp6", () => {
    const insert = buildSimulationInsert([], ELAB_V1_RGB_LAMP_EXPERIMENT_ID)
    expect(insert).not.toBeNull()
    expect(insert?.embedId).toBe(ELAB_V1_RGB_LAMP_EMBED_ID)
    const state = (insert?.embed.customData as Record<string, { state?: { scene?: { experimentId?: string } } }>)[
      "maestroTool"
    ]?.state
    expect(state?.scene?.experimentId).toBe(ELAB_V1_RGB_LAMP_EXPERIMENT_ID)
  })

  it("fail-closed intatto: id senza scena montata → null", () => {
    expect(buildSimulationInsert([], "v1-cap9-esp7")).toBeNull()
  })
})
