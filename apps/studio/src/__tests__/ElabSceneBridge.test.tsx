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
import { pointForBreadboardRef } from "../../sim/breadboard/simulationBreadboard"

type FixtureWithWires = {
  components: Array<{ id: string; pose?: { x: number; y: number } }>
  wires: Array<{
    id: string
    from: string
    to: string
    path?: { kind: string; points: Array<{ x: number; y: number }> }
  }>
}

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
    // NOTTE-3: le connections trasportano anche wires[].path autorato
    // (assert dedicato nel blocco round-trip geometrico).
    expect(bridged.connections).toMatchObject([
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

  it("trasporta i wires[].path autorati nelle connections (round-trip geometrico, nessuna perdita)", () => {
    const fixture = candidateFixture() as FixtureWithWires
    const bridged = simulationSceneFromElabScene(candidateFixture(), BRIDGE_OPTS)
    expect(fixture.wires[0]?.path).toBeDefined()
    expect(fixture.wires[1]?.path).toBeDefined()
    expect(bridged.connections[0]?.path).toEqual(fixture.wires[0]?.path)
    expect(bridged.connections[1]?.path).toEqual(fixture.wires[1]?.path)
  })

  it("i path autorati si attaccano agli anchor reali: terminale batteria e foro breadboard", () => {
    // Il testo p30/31 non vincola il ROUTING del filo: i waypoint sono
    // canonical simulator placement. Ma gli ENDPOINT devono coincidere con
    // gli anchor che il renderer risolve per from/to, altrimenti il filo
    // "autorato" parte staccato dal componente disegnato.
    // bat1 pose (-120,45) + terminale renderer positive (114,20) / negative (114,48).
    const fixture = candidateFixture() as FixtureWithWires
    const w1 = fixture.wires.find((wire) => wire.id === "w1")
    const w2 = fixture.wires.find((wire) => wire.id === "w2")
    expect(w1?.path?.points[0]).toEqual({ x: -6, y: 65 })
    expect(w2?.path?.points[0]).toEqual({ x: -6, y: 93 })
    const w1End = w1?.path?.points.at(-1)
    const w2End = w2?.path?.points.at(-1)
    const railHole = pointForBreadboardRef("bb1:bus-top-plus-1")
    const a9Hole = pointForBreadboardRef("bb1:a9")
    expect(w1End).toEqual({ x: railHole?.x, y: railHole?.y })
    expect(w2End).toEqual({ x: a9Hole?.x, y: a9Hole?.y })
  })

  it("il renderer disegna la polyline autorata byte-identica, non una bezier risintetizzata", () => {
    const fixture = candidateFixture() as FixtureWithWires
    const bridged = simulationSceneFromElabScene(candidateFixture(), BRIDGE_OPTS)
    const element = createToolEmbedElement({
      state: { kind: "simulation-scene-v1", scene: bridged },
    })
    const firstRender = renderToStaticMarkup(renderToolCanvasEmbeddable(element)!)
    const secondRender = renderToStaticMarkup(renderToolCanvasEmbeddable(element)!)
    // Determinismo: render ripetuto su dati identici = markup identico.
    expect(secondRender).toBe(firstRender)
    // Il d del filo = ESATTAMENTE i punti autorati (M/L), zero geometria inventata.
    for (const wire of fixture.wires) {
      const points = wire.path!.points
      const authoredD = `M ${points[0]!.x} ${points[0]!.y}${points
        .slice(1)
        .map((point) => ` L ${point.x} ${point.y}`)
        .join("")}`
      expect(firstRender).toContain(`d="${authoredD}"`)
    }
  })

  it("fail-closed: path bezier autorato -> errore, mai conversione o drop silenzioso", () => {
    const scene = candidateFixture() as FixtureWithWires
    const w1 = scene.wires.find((wire) => wire.id === "w1")!
    w1.path = { kind: "bezier", points: w1.path!.points }
    expect(() => simulationSceneFromElabScene(scene, BRIDGE_OPTS)).toThrow(
      /bezier \(wire w1\)/,
    )
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
