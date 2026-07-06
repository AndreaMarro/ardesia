// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  checkBookConstraintsV1Cap6Esp1,
  type BookConstraintsReport,
} from "../../sim/elab/bookConstraints.ts"
import type { ElabScene } from "../../sim/elab/elabScene.ts"

// Scena conforme al TESTO del manuale (Vol.1 pp.29-31): bat+ nel rail rosso,
// resistore a cavallo rail/zona, anodo sulla strip del pin-zona del resistore,
// catodo oltre il canale centrale, bat- nella colonna del catodo.
// I fori esatti (colonna 9) sono canonical simulator placement, non vincolo libro.
function conformingScene(): ElabScene {
  return {
    schemaVersion: "circuit-scene/2",
    experimentId: "v1-cap6-esp1",
    provenance: {
      status: "candidate",
      origin: "agent-authored",
      checks: { electrical: "unknown", geometry: "unknown", bookMatch: "unknown", visualMatch: "unknown" },
    },
    book: { volume: 1, chapter: 6, exp: "esp1", pages: [29, 30, 31] },
    source: {},
    board: {
      pose: { x: 0, y: 0, rotationDeg: 0, scale: 1 },
      grid: { columns: 30, columnPitch: 7.5 },
      orientation: "elab-volume",
    },
    components: [
      { id: "bat1", type: "battery9v" },
      { id: "bb1", type: "breadboard-half" },
      { id: "r1", type: "resistor", value: 470 },
      { id: "led1", type: "led", color: "red" },
    ],
    wires: [
      { id: "w1", from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
      { id: "w2", from: "bat1:negative", to: "bb1:a9", color: "black" },
    ],
    pinAssignments: {
      "r1:pin1": "bb1:bus-top-plus-9",
      "r1:pin2": "bb1:i9",
      "led1:anode": "bb1:f9",
      "led1:cathode": "bb1:e9",
    },
  }
}

function resultById(report: BookConstraintsReport, id: string) {
  const result = report.results.find((entry) => entry.id === id)
  if (!result) throw new Error(`constraint ${id} missing from report`)
  return result
}

describe("bookConstraints v1-cap6-esp1 (vincoli calcolati dal testo del manuale)", () => {
  it("passa sulla topologia fedele al testo", () => {
    const report = checkBookConstraintsV1Cap6Esp1(conformingScene())
    expect(report.results.map((r) => [r.id, r.ok])).toEqual([
      ["battery-positive-to-red-rail", true],
      ["resistor-bridges-rail-and-zone", true],
      ["led-anode-toward-resistor-cathode-past-channel", true],
      ["battery-negative-same-column-as-cathode", true],
      ["bom-matches-book", true],
    ])
    expect(report.ok).toBe(true)
  })

  it("ogni vincolo cita la pagina del manuale (evidenza, non opinione)", () => {
    const report = checkBookConstraintsV1Cap6Esp1(conformingScene())
    for (const result of report.results) {
      expect(result.bookRef).toMatch(/Vol\.1 pag\.(29|30|31)/)
    }
  })

  it("FALSIFICA la topologia storica della fixture (resistore con due gambe in zona)", () => {
    // Topologia pre-riconciliazione: r1 i9<->i3 + filo rail->j9. Il testo dice
    // "il resistore TRA la striscia rossa E la zona sotto": qui il resistore
    // non tocca il rail, quindi C2 deve fallire.
    const scene = conformingScene()
    scene.wires = [
      { id: "w1", from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
      { id: "w2", from: "bb1:bus-top-plus-9", to: "bb1:j9", color: "red" },
      { id: "w3", from: "bb1:a3", to: "bat1:negative", color: "black" },
    ]
    scene.pinAssignments = {
      "r1:pin1": "bb1:i9",
      "r1:pin2": "bb1:i3",
      "led1:anode": "bb1:f3",
      "led1:cathode": "bb1:e3",
    }
    const report = checkBookConstraintsV1Cap6Esp1(scene)
    expect(resultById(report, "resistor-bridges-rail-and-zone").ok).toBe(false)
    expect(report.ok).toBe(false)
  })

  it("FALSIFICA la topologia della scena reference (bat+ diretto in zona, nessun rail)", () => {
    const scene = conformingScene()
    scene.wires = [
      { id: "w1", from: "bat1:positive", to: "bb1:j2", color: "red" },
      { id: "w2", from: "bat1:negative", to: "bb1:a9", color: "black" },
    ]
    scene.pinAssignments = {
      "r1:pin1": "bb1:i2",
      "r1:pin2": "bb1:i9",
      "led1:anode": "bb1:f9",
      "led1:cathode": "bb1:e9",
    }
    const report = checkBookConstraintsV1Cap6Esp1(scene)
    expect(resultById(report, "battery-positive-to-red-rail").ok).toBe(false)
    expect(resultById(report, "resistor-bridges-rail-and-zone").ok).toBe(false)
    expect(report.ok).toBe(false)
  })

  it("FALSIFICA il LED invertito (anodo non verso il resistore)", () => {
    const scene = conformingScene()
    scene.pinAssignments = {
      ...scene.pinAssignments,
      "led1:anode": "bb1:e9",
      "led1:cathode": "bb1:f9",
    }
    const report = checkBookConstraintsV1Cap6Esp1(scene)
    expect(resultById(report, "led-anode-toward-resistor-cathode-past-channel").ok).toBe(false)
    expect(report.ok).toBe(false)
  })

  it("FALSIFICA bat- in una colonna diversa da quella del catodo", () => {
    const scene = conformingScene()
    scene.wires[1] = { id: "w2", from: "bat1:negative", to: "bb1:a5", color: "black" }
    const report = checkBookConstraintsV1Cap6Esp1(scene)
    expect(resultById(report, "battery-negative-same-column-as-cathode").ok).toBe(false)
    expect(report.ok).toBe(false)
  })

  it("FALSIFICA una BOM diversa dal libro (resistore 220 invece di 470)", () => {
    const scene = conformingScene()
    scene.components = scene.components.map((component) =>
      component.id === "r1" ? { ...component, value: 220 } : component,
    )
    const report = checkBookConstraintsV1Cap6Esp1(scene)
    expect(resultById(report, "bom-matches-book").ok).toBe(false)
    expect(report.ok).toBe(false)
  })

  it("fallisce chiuso se manca un componente del libro (niente crash, niente pass)", () => {
    const scene = conformingScene()
    scene.components = scene.components.filter((component) => component.id !== "led1")
    delete scene.pinAssignments["led1:anode"]
    delete scene.pinAssignments["led1:cathode"]
    const report = checkBookConstraintsV1Cap6Esp1(scene)
    expect(resultById(report, "bom-matches-book").ok).toBe(false)
    expect(resultById(report, "led-anode-toward-resistor-cathode-past-channel").ok).toBe(false)
    expect(report.ok).toBe(false)
  })
})
