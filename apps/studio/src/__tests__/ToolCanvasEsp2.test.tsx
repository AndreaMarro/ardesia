// @vitest-environment jsdom
// Post-it Simulation Plugin con la scena reale v1-cap6-esp2 (LED senza
// resistore, Vol.1 p.32). La UI non può vendere un finto "acceso": runtime,
// metriche, SVG e passo-passo dichiarano il verdetto onesto (LED bruciato).

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  createToolEmbedElement,
  createV1Cap6Esp2SimulationScene,
  renderToolCanvasEmbeddable,
  validateBookLayoutScene,
  ELAB_V1_NO_RESISTOR_EMBED_ID,
  ELAB_V1_CAP6_ESP2_MANUAL_PAGE_IMAGE,
} from "../toolhost/ToolCanvasEmbeddable"
import { stepByStepModel } from "../toolhost/simulationStepMode"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"
import { waitFor } from "@testing-library/react"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

function mountEsp2() {
  const element = createToolEmbedElement({
    embedId: ELAB_V1_NO_RESISTOR_EMBED_ID,
    state: { kind: "simulation-scene-v1", scene: createV1Cap6Esp2SimulationScene() },
  })
  const view = renderToolCanvasEmbeddable(element as never)
  if (view === null) throw new Error("embeddable non renderizzato")
  return render(view).container
}

describe("createV1Cap6Esp2SimulationScene — bridge onesto", () => {
  it("runtime dichiara la dimostrazione senza resistore, LED mai acceso", () => {
    const scene = createV1Cap6Esp2SimulationScene()
    expect(scene.experimentId).toBe("v1-cap6-esp2")
    expect(scene.runtime.kind).toBe("battery-led-senza-resistore")
    expect(scene.runtime.ledOn).toBe(false)
    // Vf blu dalla tabella del motore, mai auto-dichiarato.
    if (scene.runtime.kind === "battery-led-senza-resistore") {
      expect(scene.runtime.ledForwardVolts).toBe(3.0)
    }
  })

  it("provenance punta alla fixture esp2 (path derivato, non hardcoded esp1)", () => {
    const scene = createV1Cap6Esp2SimulationScene()
    expect(scene.provenance.experimentData).toBe(
      "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp2.json",
    )
    expect(scene.provenance.status).toBe("draft")
    expect(scene.provenance.blocker).toContain("candidate")
  })

  it("passa la validazione book-layout con l'ancora Vol.1 p.32", () => {
    const validation = validateBookLayoutScene(createV1Cap6Esp2SimulationScene())
    expect(validation.errors).toEqual([])
    expect(validation.ok).toBe(true)
  })

  it("il crop del manuale p.32 è agganciato alla scena", () => {
    const scene = createV1Cap6Esp2SimulationScene()
    expect(scene.bookLayout.manualSource.crop).toBe(ELAB_V1_CAP6_ESP2_MANUAL_PAGE_IMAGE)
    expect(scene.manual.page).toBe(32)
  })
})

describe("post-it esp2 — la UI dichiara il LED bruciato", () => {
  it("metriche: resistore ASSENTE, LED BRUCIATO, sovracorrente; banner 2/88", () => {
    const container = mountEsp2()
    expect(container.textContent).toContain("ASSENTE")
    expect(container.textContent).toContain("BRUCIATO")
    expect(container.textContent).toContain("sovracorrente")
    const banner = container.querySelector("[data-elab-catalog-summary]")
    expect(banner?.getAttribute("data-elab-catalog-summary")).toBe("2/88")
  })

  it("SVG: LED marcato bruciato (aria-label) e monito del libro visibile", () => {
    const container = mountEsp2()
    const led = container.querySelector('[aria-label*="bruciato per sovracorrente"]')
    expect(led).not.toBeNull()
    expect(container.textContent).toContain("NON collegare MAI il LED direttamente alla batteria")
    const stage = container.querySelector('[data-experiment-id="v1-cap6-esp2"]')
    expect(stage).not.toBeNull()
  })

  it("mai un LED acceso: nessun aria-label 'acceso' nella scena esp2", () => {
    const container = mountEsp2()
    expect(container.querySelector('[aria-label*="acceso"]')).toBeNull()
  })
})

describe("passo-passo esp2 — valutazione reale con falsificatori", () => {
  it("la scena canonica esp2 passa tutti e 3 gli step (evidenza p.32)", () => {
    const scene = createV1Cap6Esp2SimulationScene()
    const model = stepByStepModel(scene, [])
    expect(model.total).toBe(3)
    expect(model.passedCount).toBe(3)
    expect(model.firstFailingId).toBeNull()
    for (const step of model.steps) {
      for (const evidence of step.evidence) expect(evidence.page).toBe(32)
    }
  })

  it("FALSIFICA: un resistore aggiunto sul tie dell'anodo NON è più la dimostrazione p.32", () => {
    const scene = createV1Cap6Esp2SimulationScene()
    const model = stepByStepModel(scene, [
      // Montaggio libero: resistore canonico (id r1, come la grammatica del
      // libro) sul tie dell'anodo (g9) — la scena diventa "esperimento 1",
      // lo step 3 deve fallire.
      { id: "r1", type: "resistor", holes: ["bb1:g9", "bb1:a12"] },
    ])
    expect(model.firstFailingId).toBe("v1-cap6-esp2-step-3-diretto-senza-resistore")
  })

  it("FALSIFICA: senza il filo del positivo lo step 1 fallisce", () => {
    const scene = createV1Cap6Esp2SimulationScene()
    const stripped = {
      ...scene,
      connections: scene.connections.filter(
        (connection) => !connection.from.startsWith("bat1:") && !connection.to.startsWith("bat1:"),
      ),
    }
    const model = stepByStepModel(stripped, [])
    expect(model.passedCount).toBeLessThan(model.total)
    expect(model.firstFailingId).toBe("v1-cap6-esp2-step-1-positivo-striscia-rossa")
  })
})

describe("ElabLab esp2 — il solve del corpus dichiara il LED bruciato", () => {
  it("?esperimento=v1-cap6-esp2: data-led-burned=1 e testo BRUCIATO", async () => {
    window.history.replaceState(null, "", "/?vista=elab-lab&esperimento=v1-cap6-esp2")
    const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
    await waitFor(() => {
      if (container.querySelector("[data-elab-lab-state=mounted]") === null) {
        throw new Error("vista non montata")
      }
    })
    const led = container.querySelector("[data-led-burned]")
    expect(led?.getAttribute("data-led-burned")).toBe("1")
    expect(led?.getAttribute("data-led-on")).toBe("0")
    expect(container.textContent).toContain("BRUCIATO (sovracorrente!)")
  })

  it("controprova esp1: LED acceso, mai marcato bruciato", async () => {
    window.history.replaceState(null, "", "/?vista=elab-lab&esperimento=v1-cap6-esp1")
    const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
    await waitFor(() => {
      if (container.querySelector("[data-elab-lab-state=mounted]") === null) {
        throw new Error("vista non montata")
      }
    })
    const led = container.querySelector("[data-led-burned]")
    expect(led?.getAttribute("data-led-burned")).toBe("0")
    expect(led?.getAttribute("data-led-on")).toBe("1")
  })
})
