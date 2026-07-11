// @vitest-environment jsdom
// Post-it v1-cap6-esp3 (ADR-0003): il LED è ACCESO in zona overdrive — più
// luminoso come dice il libro — con la zona dichiarata in diagnostica.
// Mai un burn contro il libro, mai un "acceso" senza l'avviso di stress.

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import {
  createToolEmbedElement,
  createV1Cap6Esp3SimulationScene,
  renderToolCanvasEmbeddable,
  validateBookLayoutScene,
  ELAB_V1_LUMINOSITA_EMBED_ID,
  ELAB_V1_CAP6_ESP3_MANUAL_PAGE_IMAGE,
  buildSimulationInsert,
} from "../toolhost/ToolCanvasEmbeddable"
import { ledStressZone } from "../../sim/solver/elabSolver"

afterEach(cleanup)

function mountEsp3() {
  const element = createToolEmbedElement({
    embedId: ELAB_V1_LUMINOSITA_EMBED_ID,
    state: { kind: "simulation-scene-v1", scene: createV1Cap6Esp3SimulationScene() },
  })
  const view = renderToolCanvasEmbeddable(element as never, undefined, "runtime")
  if (view === null) throw new Error("embeddable non renderizzato")
  return render(view).container
}

describe("createV1Cap6Esp3SimulationScene — bridge con zone ADR-0003", () => {
  it("runtime battery-led 220 Ohm, Vf verde 2.2 dal motore, validazione p.33 ok", () => {
    const scene = createV1Cap6Esp3SimulationScene()
    expect(scene.experimentId).toBe("v1-cap6-esp3")
    expect(scene.runtime.kind).toBe("battery-led")
    if (scene.runtime.kind === "battery-led") {
      expect(scene.runtime.resistorOhms).toBe(220)
      expect(scene.runtime.ledForwardVolts).toBe(2.2)
    }
    const validation = validateBookLayoutScene(scene)
    expect(validation.errors).toEqual([])
    expect(scene.bookLayout.manualSource.crop).toBe(ELAB_V1_CAP6_ESP3_MANUAL_PAGE_IMAGE)
  })

  it("la corrente della scena è in zona overdrive (30.9mA), non bruciato", () => {
    // (9 - 2.2) / 220 = 30.9mA → overdrive per ADR-0003.
    expect(ledStressZone((9 - 2.2) / 220)).toBe("overdrive")
  })
})

describe("post-it esp3 — zona di stress dichiarata", () => {
  it("diagnostica SVG: corrente 30.9 mA con avviso 'vita del LED ridotta'", () => {
    const container = mountEsp3()
    expect(container.textContent).toContain("30.9 mA")
    const zone = container.querySelector("[data-led-stress-zone]")
    expect(zone?.getAttribute("data-led-stress-zone")).toBe("overdrive")
    expect(zone?.textContent).toContain("vita del LED ridotta")
    expect(container.querySelector("[data-elab-catalog-summary]")).toBeNull()
  })

  it("controprova esp1 (470 Ohm, 15.3mA): NESSUN avviso di zona", () => {
    const element = createToolEmbedElement()
    const view = renderToolCanvasEmbeddable(element as never, undefined, "runtime")
    const { container } = render(view!)
    expect(container.querySelector("[data-led-stress-zone]")).toBeNull()
  })
})

describe("inserimento toolbar", () => {
  it("buildSimulationInsert('v1-cap6-esp3') produce il post-it con la scena esp3", () => {
    const insert = buildSimulationInsert([], "v1-cap6-esp3")
    expect(insert).not.toBeNull()
    expect(insert?.embedId).toBe(ELAB_V1_LUMINOSITA_EMBED_ID)
    const state = (insert?.embed.customData as Record<string, { state?: { scene?: { experimentId?: string } } }>)[
      "maestroTool"
    ]?.state
    expect(state?.scene?.experimentId).toBe("v1-cap6-esp3")
  })

  it("fail-closed: id senza scena montata = null", () => {
    // v1-cap9-esp6 è stato MONTATO (NOTTE-15): l'esempio di id non montato
    // passa al condensatore Vol.2 (ancora static-only in matrice).
    expect(buildSimulationInsert([], "v2-cap7-esp1")).toBeNull()
  })
})
