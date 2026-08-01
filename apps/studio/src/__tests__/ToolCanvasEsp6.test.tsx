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
import { solveElabExperiment } from "../../sim/solver/elabSolver"

afterEach(cleanup)

function mountEsp6() {
  const element = createToolEmbedElement({
    embedId: ELAB_V1_RGB_LAMP_EMBED_ID,
    state: { kind: "simulation-scene-v1", scene: createV1Cap9Esp6SimulationScene() },
  })
  const view = renderToolCanvasEmbeddable(element as never)
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
  // Rinforzato il 2026-07-31 (F5-1). L'assert precedente era `toMatch(/\d+\.\d
  // mA/)`: QUALUNQUE numero lo soddisfa. Un control run che portava il fondo
  // scala della brightness da 30 a 20 mA — cioè il pannello che dichiara 3.8
  // dove il motore dice 5.7 — lasciava questo test VERDE. Ora il valore mostrato
  // è confrontato col motore: brightness × 30, inversione di
  // CircuitSolver._solveRGBLed (brightness = clamped / 0.03). Il 30 è scritto
  // QUI a mano apposta: importare la costante di produzione renderebbe il test
  // d'accordo con qualsiasi valore essa assuma.
  it("diagnostica per canale: R, G e B col milliampere del solve MNA, non solo la forma", () => {
    const scene = createV1Cap9Esp6SimulationScene()
    const rgb = scene.components.find((component) => component.type === "rgb-led")
    expect(rgb).toBeDefined()
    const engine = solveElabExperiment({
      components: scene.components.map((component) => ({ id: component.id, type: component.type, ...(component.value !== undefined ? { value: component.value } : {}) })),
      connections: scene.connections.map((connection) => ({ from: connection.from, to: connection.to })),
      pinAssignments: scene.pinAssignments,
    })
    const state = engine.componentStates[rgb!.id] as Record<string, { brightness?: number } | undefined>

    const container = mountEsp6()
    const text = container.querySelector("[data-rgb-channels]")?.textContent ?? ""
    for (const [label, key] of [["R", "red"], ["G", "green"], ["B", "blue"]] as const) {
      const brightness = state[key]?.brightness ?? 0
      expect(brightness, `canale ${key} spento: la scena non accende`).toBeGreaterThan(0)
      expect(text).toContain(`${label} ${(brightness * 30).toFixed(1)} mA`)
    }
  })

  it("SVG: 3 potenziometri e il LED RGB acceso (canali indipendenti dal solve)", () => {
    const container = mountEsp6()
    expect(container.querySelectorAll("[aria-label^='Potenziometro']").length).toBe(3)
    const rgb = container.querySelector("[aria-label^='LED RGB']")
    expect(rgb).not.toBeNull()
    expect(rgb?.getAttribute("aria-label")).toContain("acceso")
  })

  it("banner onestà: 4 scene montate su 88", () => {
    const container = mountEsp6()
    const banner = container.querySelector("[data-elab-catalog-summary]")
    expect(banner?.getAttribute("data-elab-catalog-summary")).toBe("4/88")
  })
})

describe("il LED non dichiara OFF quando la risposta non c'è", () => {
  // `mnaView?.ok === true && mnaView.anyOn ? "ON" : "OFF"` schiacciava tre
  // realtà su una parola: LED spento, solve fallito, vista non calcolata.
  // Quattro righe sotto, nello stesso <text>, `mnaView === null` era GIÀ un
  // caso a sé — il file conosceva il tri-stato e la parola lo ignorava.
  //
  // Questi due test guardano il PRODOTTO, non l'helper: il modulo `ledReadout`
  // ha i suoi test, ma nessun oracolo osservava questi due punti d'uso, quindi
  // la riparazione sarebbe stata invisibile a tutta la suite.

  function mountSenzaRgb() {
    const scene = createV1Cap9Esp6SimulationScene()
    const element = createToolEmbedElement({
      embedId: ELAB_V1_RGB_LAMP_EMBED_ID,
      state: {
        kind: "simulation-scene-v1",
        scene: {
          ...scene,
          // computeElabMnaView: senza rgb-led torna { ok: false }, il ramo che
          // prima stampava "OFF".
          components: scene.components.filter((component) => component.type !== "rgb-led"),
        },
      },
    })
    const view = renderToolCanvasEmbeddable(element as never)
    if (view === null) throw new Error("embeddable non renderizzato")
    return render(view).container
  }

  it("scena integra: il readout è 'on', quindi l'attributo riflette un solve vero", () => {
    const readout = mountEsp6().querySelector("[data-led-readout]")
    expect(readout).not.toBeNull()
    expect(readout?.getAttribute("data-led-readout")).toBe("on")
  })

  it("solve non disponibile: il readout è 'unknown' e la parola OFF non compare", () => {
    const readout = mountSenzaRgb().querySelector("[data-led-readout]")
    expect(readout).not.toBeNull()
    expect(readout?.getAttribute("data-led-readout")).toBe("unknown")
    expect(readout?.textContent ?? "").not.toContain("OFF")
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
