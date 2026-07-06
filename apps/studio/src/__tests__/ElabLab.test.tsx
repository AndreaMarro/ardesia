// @vitest-environment jsdom
// ELAB Lab (?vista=elab-lab) — P0 accoppiato canon ELAB-AS-PLUGIN §6:
// l'host di prodotto monta il Simulation Plugin via l'UNICO entry
// renderEmbeddable() (MOUNT-CANVAS) e consuma il solve SOLO attraverso il
// dispatch di simulationPluginRegistry (deny-by-default, motore reale).
// Qui NIENTE mock del plugin: monta il SimulatorCanvas vero e confronta il
// pannello col numero calcolato firsthand dal motore (mutation-aware).

import { describe, it, expect, afterEach } from "vitest"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { isElabLabView } from "../store/elabLabView"
import ElabLab, { ELAB_LAB_EXPERIMENT_ID, findElabLabExperiment, toSolverExperiment } from "../design/ElabLab"
import {
  registerSimulationTool,
  getSimulationTool,
} from "../toolhost/simulationPluginRegistry"
import { REFERENCE_SIM_TOOL_ID } from "../toolhost/ToolCanvasEmbeddable"
import { solveElabExperiment } from "../../sim/solver/elabSolver"

let host: HTMLDivElement | null = null
let root: Root | null = null

async function renderView(): Promise<HTMLDivElement> {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(<ElabLab />)
  })
  return host
}

afterEach(async () => {
  if (root !== null) {
    const r = root
    await act(async () => r.unmount())
    root = null
  }
  host?.remove()
  host = null
})

describe("isElabLabView", () => {
  it("true solo con ?vista=elab-lab", () => {
    window.history.replaceState(null, "", "/?vista=elab-lab")
    expect(isElabLabView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=tool-lab")
    expect(isElabLabView()).toBe(false)
    window.history.replaceState(null, "", "/")
    expect(isElabLabView()).toBe(false)
  })
})

describe("ElabLab (mount ELAB via renderEmbeddable + solve via registry)", () => {
  it("monta il SimulatorCanvas REALE del plugin nel container host", async () => {
    const view = await renderView()
    const canvasHost = view.querySelector<HTMLElement>("[data-elab-canvas]")
    expect(canvasHost).not.toBeNull()
    // renderEmbeddable vero: il plugin ha renderizzato dentro il container
    expect(canvasHost!.childElementCount).toBeGreaterThan(0)
    expect(canvasHost!.querySelector("svg")).not.toBeNull()
  })

  it("l'esperimento montato è il dato reale del Pack (v1-cap6-esp1), non un mock", () => {
    const experiment = findElabLabExperiment()
    expect(experiment?.id).toBe(ELAB_LAB_EXPERIMENT_ID)
    // topologia reale: batteria 9V + breadboard + R470 + LED rosso
    const types = experiment!.components.map((c) => c.type).sort()
    expect(types).toEqual(["battery9v", "breadboard-half", "led", "resistor"])
  })

  it("il pannello mostra il verdetto del MOTORE REALE: LED acceso, corrente = engine firsthand", async () => {
    const engine = solveElabExperiment(toSolverExperiment(findElabLabExperiment()!))
    expect(engine.componentStates.led1?.on).toBe(true) // precondizione: dato Pack sano
    const view = await renderView()
    expect(view.querySelector("[data-elab-lab-solve]")?.getAttribute("data-elab-lab-solve")).toBe("ok")
    expect(view.querySelector("[data-led-on]")?.getAttribute("data-led-on")).toBe("1")
    const shownMilliamps = view.querySelector("[data-led-current-ma]")?.textContent
    expect(shownMilliamps).toBe((engine.currents.led1 * 1000).toFixed(1))
  })

  it("il solve passa dal REGISTRY (deny-by-default), non da un import diretto del motore", async () => {
    const real = getSimulationTool(REFERENCE_SIM_TOOL_ID)
    expect(real?.solve).toBeDefined()
    try {
      registerSimulationTool(REFERENCE_SIM_TOOL_ID, {
        ...real!,
        solve: () => ({
          ok: true,
          componentStates: { led1: { on: false } },
          currents: { led1: 0.0042 },
          nodeVoltages: {},
          diagnostics: { shortCircuit: false, disconnectedPins: [], overloadWarnings: [] },
          warnings: [],
        }),
      })
      const view = await renderView()
      // se la vista importasse il motore direttamente mostrerebbe 15.3, non 4.2
      expect(view.querySelector("[data-led-current-ma]")?.textContent).toBe("4.2")
      expect(view.querySelector("[data-led-on]")?.getAttribute("data-led-on")).toBe("0")
    } finally {
      registerSimulationTool(REFERENCE_SIM_TOOL_ID, real!)
    }
  })

  it("dispose allo smontaggio: il container torna vuoto (nessun root React orfano)", async () => {
    const view = await renderView()
    const canvasHost = view.querySelector<HTMLElement>("[data-elab-canvas]")
    expect(canvasHost!.childElementCount).toBeGreaterThan(0)
    const r = root!
    await act(async () => r.unmount())
    root = null
    // #71: dispose() differisce l'unmount del root interno al task successivo
    // (vincolo React: niente unmount sincrono dentro il cleanup) — si attende
    // il flush del macrotask prima di verificare che non restino root orfani.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(canvasHost!.childElementCount).toBe(0)
  })
})
