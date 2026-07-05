// @vitest-environment node
//
// P0-A validator falsificabile — coerenza scena ↔ catalogo elettrico.
// Oggi un pin inesistente nel vocabolario del componente (es. il typo
// "bat1:posittive") PASSA elabSceneAdapter: l'adapter verifica solo che il
// componente sia dichiarato, non che il pin esista per quel tipo. Questo
// report lo intercetta PRIMA del solve, per la modalità montaggi liberi.

import { beforeAll, describe, expect, it } from "vitest"
import { registerElectricalCatalog } from "../../sim/solver/catalog.ts"
import { analyzePinVocabulary } from "../../sim/solver/pinVocabulary.ts"
import verifiedScene from "../../sim/fixtures/elab-scene-v2-verified-synthetic.json"

beforeAll(() => {
  registerElectricalCatalog()
})

type SceneSlice = Parameters<typeof analyzePinVocabulary>[0]

function sliceOf(overrides: Partial<SceneSlice>): SceneSlice {
  return {
    components: [
      { id: "bat1", type: "battery9v" },
      { id: "bb1", type: "breadboard-half" },
      { id: "r1", type: "resistor" },
      { id: "led1", type: "led" },
    ],
    wires: [],
    pinAssignments: {},
    ...overrides,
  }
}

describe("analyzePinVocabulary", () => {
  it("fixture verified sintetica: nessun flag", () => {
    const report = analyzePinVocabulary({
      components: verifiedScene.components,
      wires: verifiedScene.wires,
      pinAssignments: verifiedScene.pinAssignments,
    })
    expect(report.ok).toBe(true)
    expect(report.flags).toEqual([])
  })

  it("typo sul pin di un wire (bat1:posittive) → pin-unknown con tipo e sede", () => {
    const report = analyzePinVocabulary(
      sliceOf({ wires: [{ from: "bat1:posittive", to: "bb1:a1" }] }),
    )
    expect(report.ok).toBe(false)
    expect(report.flags).toEqual([
      {
        kind: "pin-unknown",
        componentId: "bat1",
        type: "battery9v",
        pin: "posittive",
        at: "wire[0].from",
      },
    ])
  })

  it("pin inesistente in pinAssignments (r1:pin3) → pin-unknown", () => {
    const report = analyzePinVocabulary(
      sliceOf({ pinAssignments: { "r1:pin3": "bb1:c5" } }),
    )
    expect(report.ok).toBe(false)
    expect(report.flags[0]).toMatchObject({
      kind: "pin-unknown",
      componentId: "r1",
      type: "resistor",
      pin: "pin3",
      at: "pinAssignments r1:pin3",
    })
  })

  it("anche il lato DESTRO di pinAssignments è verificato (foro breadboard inesistente)", () => {
    const report = analyzePinVocabulary(
      sliceOf({ pinAssignments: { "r1:pin1": "bb1:z99" } }),
    )
    expect(report.ok).toBe(false)
    expect(report.flags[0]).toMatchObject({
      kind: "pin-unknown",
      componentId: "bb1",
      type: "breadboard-half",
      pin: "z99",
    })
  })

  it("tipo non registrato nel catalogo → type-unregistered (deny-by-default sul solve)", () => {
    const report = analyzePinVocabulary(
      sliceOf({
        components: [{ id: "bz1", type: "buzzer" }],
        wires: [{ from: "bz1:pin1", to: "bz1:pin2" }],
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.flags[0]).toMatchObject({
      kind: "type-unregistered",
      componentId: "bz1",
      type: "buzzer",
    })
    // il tipo ignoto è flaggato UNA volta per sede d'uso, senza pin-unknown a cascata
    expect(report.flags.every((f) => f.kind === "type-unregistered")).toBe(true)
  })

  it("componente non dichiarato nella scena → component-unknown", () => {
    const report = analyzePinVocabulary(
      sliceOf({ wires: [{ from: "ghost1:pin1", to: "bb1:a1" }] }),
    )
    expect(report.ok).toBe(false)
    expect(report.flags[0]).toMatchObject({
      kind: "component-unknown",
      componentId: "ghost1",
      at: "wire[0].from",
    })
  })

  it("report deterministico: flag ordinati per sede", () => {
    const report = analyzePinVocabulary(
      sliceOf({
        pinAssignments: { "r1:pin3": "bb1:c5", "led1:anodo": "bb1:f3" },
        wires: [{ from: "bat1:posittive", to: "bb1:a1" }],
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.flags.map((f) => f.at)).toEqual([
      "pinAssignments led1:anodo",
      "pinAssignments r1:pin3",
      "wire[0].from",
    ])
  })
})
