import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  ALL_EXPERIMENTS,
} from "@elab-tutor-plugin/data/experiments-index"
import {
  VISIBLE_EXP_IDS,
  filterVisibleExperiments,
} from "@elab-tutor-plugin/data/experiment-visibility"
import { solveElabExperiment } from "../../sim/solver/elabSolver"
import { registerElectricalCatalog } from "../../sim/solver/catalog"
import { getComponent } from "../../sim/solver/components/registry.js"

const visibleExperiments = filterVisibleExperiments(ALL_EXPERIMENTS)
const deferredCapacitorExperiments = visibleExperiments.filter((experiment) =>
  experiment.components.some((component) => component.type === "capacitor"),
)

describe("esperimenti ELAB visibili nel solver headless", () => {
  it("l'oracolo copre ogni id visibile senza una seconda enumerazione", () => {
    expect(visibleExperiments.map((experiment) => experiment.id)).toEqual([...VISIBLE_EXP_IDS])
  })

  it("registra i 51 pin Nano R4, inclusi gli alias usati dagli esperimenti", () => {
    registerElectricalCatalog()
    const entry = getComponent("nano-r4")
    if (entry === null) throw new Error("nano-r4 non registrato nel catalogo headless")

    expect(entry.pins).toHaveLength(51)
    const pinsById = new Map(entry.pins!.map((pin) => [pin.id, pin]))
    expect(pinsById.get("D13")).toMatchObject({ id: "D13", label: "D13", type: "digital" })
    expect(pinsById.get("W_D6")).toMatchObject({ id: "W_D6", mapsTo: "D6" })
    expect(pinsById.get("W_D13")).toMatchObject({ id: "W_D13", mapsTo: "D13" })
    expect(pinsById.get("W_GND2")).toMatchObject({ id: "W_GND2", mapsTo: "GND" })
  })

  it("la board e il catalogo headless derivano i pin dalla stessa sorgente", () => {
    const boardSource = readFileSync(
      new URL(
        "../../../../plugins/elab-tutor/src/components/simulator/components/NanoR4Board.jsx",
        import.meta.url,
      ),
      "utf8",
    )
    const headlessSource = readFileSync(
      new URL("../../sim/solver/catalog.ts", import.meta.url),
      "utf8",
    )

    expect(boardSource).toMatch(/from ['"]\.\/nanoR4Catalog\.js['"]/)
    expect(headlessSource).toMatch(/from ['"]@elab-tutor-plugin\/.*\/nanoR4Catalog\.js['"]/)
    expect(boardSource).not.toMatch(/const (?:TOP|BOTTOM|WING)_PINS\s*=\s*\[/)
    expect(boardSource).not.toContain("IMPORTANT_PIN_IDS")
    expect(boardSource).not.toMatch(/pin\.id\s*===/)
  })

  it("risolvono tutti i visibili salvo il tipo capacitor, fuori dalla slice F5-10", () => {
    const solved = visibleExperiments.filter((experiment) => {
      try {
        solveElabExperiment(experiment)
        return true
      } catch {
        return false
      }
    })

    expect(solved).toHaveLength(visibleExperiments.length - deferredCapacitorExperiments.length)
  })

  it.each(visibleExperiments)("$id rispetta il perimetro del catalogo", (experiment) => {
    const solve = () => solveElabExperiment(experiment)
    if (deferredCapacitorExperiments.includes(experiment)) {
      expect(solve).toThrow(/capacitor/)
    } else {
      expect(solve).not.toThrow()
    }
  })
})
