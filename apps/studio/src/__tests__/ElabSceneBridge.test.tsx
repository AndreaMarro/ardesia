// @vitest-environment jsdom
//
// Round-trip render della scena REALE circuit-scene/2: il bridge la traduce in
// SimulationSceneV1 e il renderer vero la disegna. Chiude il dead-end "lo
// schema congelato non alimenta nulla che renderizza".

import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { simulationSceneFromElabScene } from "../toolhost/elabSceneBridge"
import {
  ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
  ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
  validateBookLayoutScene,
} from "../toolhost/ToolCanvasEmbeddable"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function candidateFixture(): unknown {
  return JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json"),
      "utf-8",
    ),
  )
}

const BRIDGE_OPTS = {
  title: "Accendi il tuo primo LED",
  chapter: "Capitolo 6 - Cos'e il diodo LED?",
  bookText:
    "Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.",
  bookInstructions: [
    "Ragazzi, collegate la clip alla batteria e il positivo alla striscia rossa superiore della breadboard.",
    "Ragazzi, collegate il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto.",
    "Ragazzi, inserite il LED a cavallo della separazione centrale: gambetta lunga verso il resistore, gambetta corta dopo la divisione.",
    "Ragazzi, collegate il negativo della batteria nella stessa colonna della gambetta corta del LED.",
  ],
  bookQuote: "Il LED si e acceso! Bellissimo vero?",
  manualCrop: ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
  manualFinalCrop: ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
}

describe("bridge ElabScene -> SimulationSceneV1 (round-trip render della scena reale)", () => {
  it("produce una SimulationSceneV1 che passa validateBookLayoutScene", () => {
    const bridged = simulationSceneFromElabScene(candidateFixture(), BRIDGE_OPTS)
    const validation = validateBookLayoutScene(bridged)
    expect(validation.errors).toEqual([])
    expect(validation.ok).toBe(true)
  })

  it("preserva pinAssignments e wires della scena schema-frozen (nessuna reinvenzione)", () => {
    const bridged = simulationSceneFromElabScene(candidateFixture(), BRIDGE_OPTS)
    expect(bridged.pinAssignments).toEqual({
      "r1:pin1": "bb1:bus-top-plus-9",
      "r1:pin2": "bb1:i9",
      "led1:anode": "bb1:f9",
      "led1:cathode": "bb1:e9",
    })
    expect(bridged.connections).toEqual([
      { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red", kind: "wire" },
      { from: "bat1:negative", to: "bb1:a9", color: "black", kind: "wire" },
    ])
    expect(bridged.experimentId).toBe("v1-cap6-esp1")
    expect(bridged.manual.volume).toBe(1)
    expect(bridged.manual.page).toBe(29)
  })

  it("runtime coerente col motore: Vf red dalla tabella engine (1.8), non 2.0 auto-dichiarato", () => {
    const bridged = simulationSceneFromElabScene(candidateFixture(), BRIDGE_OPTS)
    expect(bridged.runtime).toMatchObject({
      kind: "battery-led",
      supplyVolts: 9,
      resistorOhms: 470,
      ledForwardVolts: 1.8,
    })
  })

  it("il renderer REALE disegna la scena bridgata con la corrente coerente 15.3 mA", () => {
    const bridged = simulationSceneFromElabScene(candidateFixture(), BRIDGE_OPTS)
    const element = createToolEmbedElement({
      state: { kind: "simulation-scene-v1", scene: bridged },
    })
    const view = renderToolCanvasEmbeddable(element)
    expect(view).not.toBeNull()
    const html = renderToStaticMarkup(view!)
    expect(html).toContain("15.3 mA")
    expect(html).toContain("Accendi il tuo primo LED")
  })

  it("la provenance NON viene gonfiata: candidate -> draft, mai verified", () => {
    const bridged = simulationSceneFromElabScene(candidateFixture(), BRIDGE_OPTS)
    expect(bridged.provenance.status).toBe("draft")
    expect(bridged.bookLayout.status).toBe("draft")
  })

  it("fail-closed: scena senza geometria autorata completa -> errore, niente layout inventato", () => {
    const scene = candidateFixture() as { components: Array<Record<string, unknown>> }
    scene.components = scene.components.map((component) =>
      component.id === "led1" ? { ...component, pose: undefined } : component,
    )
    expect(() => simulationSceneFromElabScene(scene, BRIDGE_OPTS)).toThrow(
      /pose mancante per led1/,
    )
  })
})
