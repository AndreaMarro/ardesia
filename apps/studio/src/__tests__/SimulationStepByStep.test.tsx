// @vitest-environment jsdom
// Product shell — modalità passo-passo VIVA nel Simulation Plugin.
// La logica didattica esiste da tempo (sim/elab/didacticSteps.ts, dati puri +
// predicati topologici, testata in DidacticSteps.test.ts) ma NESSUNA superficie
// la montava: il post-it mostrava solo già-montato + montaggio libero.
//
// Questo test pretende:
//   S1  stepByStepModel: valutazione REALE dei 4 step del libro sul circuito
//       attivo (scena + placements del montaggio libero) — scena canonica
//       v1-cap6-esp1 → tutti passed; scena senza fili batteria → step 1/4 rossi
//       (falsificabilità: il modello non può dire "fatto" senza topologia vera);
//   S2  catalogo onestà: 1 esperimento montato su 88 nel corpus, contati da
//       fonti reali (fixture su disco, lesson-paths su disco), mai hardcoded
//       silenziosi;
//   S3  UI: toggle "Passo-passo" nel post-it → pannello step ordinati con
//       istruzione it, evidenza Vol/pag VERBATIM dal manuale, stato per-step;
//       banner onestà catalogo sempre visibile.

import { cleanup, fireEvent, render } from "@testing-library/react"
import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import { DIDACTIC_STEPS_V1_CAP6_ESP1 } from "../../sim/elab/didacticSteps"
import {
  ELAB_CORPUS_TOTAL,
  ELAB_EXPERIMENT_CATALOG,
  catalogSummary,
} from "../toolhost/elabExperimentCatalog"
import { buildEvaluationCircuit, stepByStepModel } from "../toolhost/simulationStepMode"
import {
  createReferenceSimulationScene,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
} from "../toolhost/ToolCanvasEmbeddable"

afterEach(cleanup)

function mountSim() {
  const element = createToolEmbedElement()
  const view = renderToolCanvasEmbeddable(element as never)
  if (view === null) throw new Error("embeddable non renderizzato")
  return render(view).container
}

describe("simulationStepMode — valutazione passo-passo sul circuito attivo (S1)", () => {
  it("scena canonica v1-cap6-esp1: tutti i 4 step del libro passano", () => {
    const scene = createReferenceSimulationScene()
    const model = stepByStepModel(scene, [])
    expect(model.total).toBe(DIDACTIC_STEPS_V1_CAP6_ESP1.length)
    expect(model.passedCount).toBe(model.total)
    expect(model.firstFailingId).toBeNull()
    expect(model.steps.map((step) => step.order)).toEqual([1, 2, 3, 4])
  })

  it("senza i fili batteria gli step 1 e 4 falliscono (falsificabilità)", () => {
    const scene = createReferenceSimulationScene()
    const stripped = {
      ...scene,
      connections: scene.connections.filter(
        (connection) => !connection.from.startsWith("bat1:") && !connection.to.startsWith("bat1:"),
      ),
    }
    const model = stepByStepModel(stripped, [])
    expect(model.passedCount).toBeLessThan(model.total)
    expect(model.firstFailingId).toBe("v1-cap6-esp1-step-1-positivo-striscia-rossa")
    const failing = model.steps.filter((step) => !step.passed).map((step) => step.id)
    expect(failing).toContain("v1-cap6-esp1-step-1-positivo-striscia-rossa")
    expect(failing).toContain("v1-cap6-esp1-step-4-negativo-colonna-catodo")
  })

  it("i placements del montaggio libero entrano nel circuito valutato", () => {
    const scene = createReferenceSimulationScene()
    const circuit = buildEvaluationCircuit(scene, [
      { id: "r-libero-1", type: "resistor", holes: ["bb1:a12", "bb1:a15"] },
    ])
    expect(circuit.pinAssignments["r-libero-1:pin1"]).toBe("bb1:a12")
    expect(circuit.pinAssignments["r-libero-1:pin2"]).toBe("bb1:a15")
    // I pin della scena restano intatti.
    expect(circuit.pinAssignments["led1:anode"]).toBeTruthy()
  })

  it("ogni step espone istruzione it e evidenza Vol/pag verbatim dal manuale", () => {
    const scene = createReferenceSimulationScene()
    const model = stepByStepModel(scene, [])
    for (const step of model.steps) {
      expect(step.instructionIt.length).toBeGreaterThan(0)
      expect(step.evidence.length).toBeGreaterThan(0)
      for (const evidence of step.evidence) {
        expect(evidence.page).toBeGreaterThanOrEqual(29)
        expect(evidence.page).toBeLessThanOrEqual(31)
        expect(evidence.evidence.length).toBeGreaterThan(0)
      }
    }
  })
})

describe("elabExperimentCatalog — onestà 1/88 da fonti reali (S2)", () => {
  const repoRoot = join(process.cwd(), "../..")

  it("ogni esperimento montato ha la fixture scene dichiarata SU DISCO", () => {
    expect(ELAB_EXPERIMENT_CATALOG.length).toBeGreaterThan(0)
    for (const entry of ELAB_EXPERIMENT_CATALOG) {
      expect(
        existsSync(join(process.cwd(), entry.sceneFixture)),
        `${entry.experimentId}: fixture ${entry.sceneFixture} assente`,
      ).toBe(true)
      expect(entry.sceneStatus).toMatch(/^(candidate|verified)$/)
    }
  })

  it("il totale corpus dichiarato coincide con i lesson-path su disco", () => {
    const lessonPathsDir = join(repoRoot, "packs/elab-tutor/data/lesson-paths")
    const onDisk = readdirSync(lessonPathsDir).filter((name) =>
      /^v\d-cap\d+-esp\d+\.json$/.test(name),
    ).length
    expect(ELAB_CORPUS_TOTAL).toBe(onDisk)
  })

  it("catalogSummary dichiara montati/total senza gonfiare", () => {
    const summary = catalogSummary()
    expect(summary.mounted).toBe(ELAB_EXPERIMENT_CATALOG.length)
    expect(summary.total).toBe(ELAB_CORPUS_TOTAL)
    expect(summary.mounted).toBeLessThanOrEqual(summary.total)
  })
})

describe("Simulation Plugin — pannello passo-passo nel post-it (S3)", () => {
  it("il toggle Passo-passo apre il pannello con i 4 step tutti verdi sulla scena canonica", () => {
    const container = mountSim()
    const toggle = container.querySelector('[data-testid="step-mode-toggle"]')
    expect(toggle, "toggle Passo-passo assente").not.toBeNull()
    expect(toggle?.getAttribute("aria-pressed")).toBe("false")
    expect(container.querySelector("[data-step-id]")).toBeNull()

    fireEvent.click(toggle as Element)
    expect(toggle?.getAttribute("aria-pressed")).toBe("true")

    const steps = Array.from(container.querySelectorAll("[data-step-id]"))
    expect(steps).toHaveLength(4)
    for (const step of steps) {
      expect(step.getAttribute("data-step-passed")).toBe("true")
    }
    // Evidenza libro verbatim visibile (Vol.1 pag.30).
    expect(container.textContent).toContain(
      "Collega il positivo della batteria alla striscia rossa superiore della breadboard",
    )
    expect(container.textContent).toContain("pag.30")

    fireEvent.click(toggle as Element)
    expect(container.querySelector("[data-step-id]")).toBeNull()
  })

  it("il banner onestà catalogo è visibile nel post-it", () => {
    const container = mountSim()
    const banner = container.querySelector("[data-elab-catalog-summary]")
    expect(banner, "banner catalogo assente").not.toBeNull()
    expect(banner?.getAttribute("data-elab-catalog-summary")).toBe("1/88")
  })
})
