// @vitest-environment node
//
// P0-A aggregatore "montaggi liberi" — UN report per la vista.
// occupancy (#74) e pinVocabulary (#75) restano i validator falsificabili
// sorgente; qui si aggregano in un unico report deterministico con findings
// pronti per la UI (messaggio + dato strutturato). L'aggregatore è
// auto-sufficiente: registra lui il catalogo elettrico (idempotente), la
// vista non deve conoscere l'ordine di inizializzazione dei validator.

import { describe, expect, it } from "vitest"
import { analyzeFreeAssembly } from "../../sim/freeAssembly.ts"
import type { FreeAssemblyScene } from "../../sim/freeAssembly.ts"
import verifiedScene from "../../sim/fixtures/elab-scene-v2-verified-synthetic.json"

function sceneOf(overrides: Partial<FreeAssemblyScene>): FreeAssemblyScene {
  return {
    components: [
      { id: "bat1", type: "battery9v" },
      { id: "bb1", type: "breadboard-half" },
      { id: "r1", type: "resistor" },
      { id: "r2", type: "resistor" },
    ],
    wires: [],
    pinAssignments: {},
    ...overrides,
  }
}

describe("analyzeFreeAssembly (aggregatore montaggi liberi)", () => {
  it("fixture verified sintetica: ok, zero findings, sotto-report ok", () => {
    const report = analyzeFreeAssembly(verifiedScene as unknown as FreeAssemblyScene)
    expect(report.ok).toBe(true)
    expect(report.findings).toEqual([])
    expect(report.occupancy.ok).toBe(true)
    expect(report.pinVocabulary.ok).toBe(true)
  })

  it("conflitto di foro: finding occupancy con ref, occupanti e messaggio", () => {
    const report = analyzeFreeAssembly(
      sceneOf({
        pinAssignments: { "r1:pin1": "bb1:c5", "r2:pin1": "bb1:c5" },
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.occupancy.ok).toBe(false)
    expect(report.pinVocabulary.ok).toBe(true)
    expect(report.findings).toHaveLength(1)
    const finding = report.findings[0]
    if (finding.source !== "occupancy") throw new Error("atteso finding occupancy")
    expect(finding.ref).toBe("bb1:c5")
    expect(finding.occupants.map((occupant) => occupant.at)).toEqual(["r1:pin1", "r2:pin1"])
    expect(finding.message).toContain("bb1:c5")
  })

  it("typo pin: finding pin-vocabulary con flag strutturato e messaggio", () => {
    const report = analyzeFreeAssembly(
      sceneOf({
        pinAssignments: { "bat1:posittive": "bb1:bus-top-plus-1" },
      }),
    )
    expect(report.ok).toBe(false)
    expect(report.occupancy.ok).toBe(true)
    expect(report.pinVocabulary.ok).toBe(false)
    expect(report.findings).toHaveLength(1)
    const finding = report.findings[0]
    if (finding.source !== "pin-vocabulary") throw new Error("atteso finding pin-vocabulary")
    expect(finding.flag.kind).toBe("pin-unknown")
    expect(finding.message).toContain("posittive")
  })

  it("problemi misti: prima TUTTI gli occupancy (per ref), poi i pin (per sede) — deterministico", () => {
    const scene = sceneOf({
      wires: [{ from: "bb1:a1", to: "bb1:c5" }],
      pinAssignments: {
        "r1:pin1": "bb1:c5",
        "bat1:posittive": "bb1:bus-top-plus-1",
      },
    })
    const first = analyzeFreeAssembly(scene)
    const second = analyzeFreeAssembly(scene)
    expect(first).toEqual(second)
    expect(first.ok).toBe(false)
    expect(first.findings.map((finding) => finding.source)).toEqual([
      "occupancy",
      "pin-vocabulary",
    ])
  })

  it("componente non dichiarato: flag component-unknown aggregato con messaggio", () => {
    const report = analyzeFreeAssembly(
      sceneOf({ wires: [{ from: "ghost1:pin1", to: "bb1:a1" }] }),
    )
    expect(report.ok).toBe(false)
    const kinds = report.findings.map((finding) =>
      finding.source === "pin-vocabulary" ? finding.flag.kind : finding.source,
    )
    expect(kinds).toEqual(["component-unknown"])
  })

  it("auto-sufficienza: nessuna registrazione manuale del catalogo richiesta dal chiamante", () => {
    // Niente beforeAll con registerElectricalCatalog in questo file: se il
    // modulo non registrasse da sé, il tipo "resistor" risulterebbe
    // type-unregistered e questo assert fallirebbe.
    const report = analyzeFreeAssembly(
      sceneOf({ pinAssignments: { "r1:pin1": "bb1:a1" } }),
    )
    expect(report.ok).toBe(true)
    expect(report.findings).toEqual([])
  })
})
