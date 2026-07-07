// @vitest-environment node
//
// Breadboard copy system — helper di authoring PURI + grader severo.
// Invariante: una scena costruita con gli helper è on-grid PER COSTRUZIONE
// (helper e grader leggono la stessa griglia); la modalità severa trasforma
// i buchi di copertura (fili senza path, pose mancanti) in liste nominate,
// mai in pass silenziosi.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  describeHole,
  holePoint,
  insertBendPoint,
  pathWithBends,
  poseBetween,
  straightPath,
} from "../../sim/breadboard/sceneAuthoring.ts"
import { pointForBreadboardRef } from "../../sim/breadboard/simulationBreadboard.ts"
import {
  gradeSceneGeometry,
  gradeSceneGeometryStrict,
} from "../../sim/visual/structuralGrader.ts"
import { validateElabScene, type ElabScene } from "../../sim/elab/elabScene.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function fixtureScene(name: string): ElabScene {
  const raw = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "apps/studio/sim/fixtures", name), "utf-8"),
  )
  const result = validateElabScene(raw)
  if (!result.ok) throw new Error(`fixture invalid: ${name}`)
  return result.scene
}

describe("sceneAuthoring — coordinate dalla griglia reale, mai inventate", () => {
  it("holePoint coincide con pointForBreadboardRef; ref ignoto = errore", () => {
    const grid = pointForBreadboardRef("bb1:f9")!
    expect(holePoint("bb1:f9")).toEqual({ x: grid.x, y: grid.y })
    expect(() => holePoint("bb1:z99")).toThrow(/non sulla griglia/)
    expect(() => holePoint("bat1:positive")).toThrow(/non sulla griglia/)
  })

  it("poseBetween = centroide dei due fori (la definizione del grader)", () => {
    // La pose del LED di esp1/esp2 (f9/e9) è esattamente questa.
    expect(poseBetween("bb1:f9", "bb1:e9")).toEqual({ x: 77.75, y: 72.5 })
    // E quella del resistore esp1/esp3 (rail col9 → i9).
    expect(poseBetween("bb1:bus-top-plus-9", "bb1:i9")).toEqual({ x: 77.75, y: 31.25 })
  })

  it("straightPath e pathWithBends ancorano gli estremi alla griglia", () => {
    const straight = straightPath("bb1:bus-top-plus-9", "bb1:i9")
    expect(straight.points).toEqual([
      { x: 77.75, y: 21.25 },
      { x: 77.75, y: 41.25 },
    ])
    const bent = pathWithBends("bb1:bus-top-plus-1", [{ x: -40, y: 4 }], "bb1:a9")
    expect(bent.points[0]).toEqual({ x: 17.75, y: 21.25 })
    expect(bent.points[1]).toEqual({ x: -40, y: 4 })
    expect(bent.points[2]).toEqual({ x: 77.75, y: 111.25 })
  })

  it("insertBendPoint è puro e rifiuta indici fuori dai segmenti", () => {
    const base = straightPath("bb1:bus-top-plus-9", "bb1:i9")
    const bent = insertBendPoint(base, 0, { x: 70, y: 30 })
    expect(bent.points.length).toBe(3)
    expect(bent.points[1]).toEqual({ x: 70, y: 30 })
    // L'originale resta intatto (pure).
    expect(base.points.length).toBe(2)
    // Ancore non violabili: non si inserisce oltre l'ultimo segmento.
    expect(() => insertBendPoint(base, 1, { x: 0, y: 0 })).toThrow(/fuori dai segmenti/)
    expect(() => insertBendPoint(base, -1, { x: 0, y: 0 })).toThrow(/fuori dai segmenti/)
  })

  it("describeHole parla il vocabolario del libro (strip/colonna/metà)", () => {
    expect(describeHole("bb1:f9").labelIt).toContain("metà sopra")
    expect(describeHole("bb1:f9").labelIt).toContain("colonna 9")
    expect(describeHole("bb1:a9").labelIt).toContain("metà sotto")
    expect(describeHole("bb1:bus-top-plus-9").labelIt).toContain("striscia rossa")
    // Fori della stessa tie-strip condividono il nodeId (la net dell'hover).
    expect(describeHole("bb1:f9").nodeId).toBe(describeHole("bb1:i9").nodeId)
    expect(describeHole("bb1:f9").nodeId).not.toBe(describeHole("bb1:e9").nodeId)
  })
})

describe("grader severo — copertura obbligatoria, buchi nominati", () => {
  it("le 3 scene reali (esp1/esp2/esp3) sono strictOnGrid: copertura completa", () => {
    for (const name of [
      "elab-scene-v2-candidate-v1cap6esp1.json",
      "elab-scene-v2-candidate-v1cap6esp2.json",
      "elab-scene-v2-candidate-v1cap6esp3.json",
    ]) {
      const report = gradeSceneGeometryStrict(fixtureScene(name))
      expect(report.strictOnGrid, `${name}: ${JSON.stringify(report)}`).toBe(true)
      expect(report.uncoveredWires).toEqual([])
      expect(report.unposedComponents).toEqual([])
      expect(report.wireErrors.length).toBeGreaterThan(0)
      for (const wire of report.wireErrors) {
        expect(wire.errorPx, `${name} ${wire.id}`).toBeLessThanOrEqual(0.5)
      }
    }
  })

  it("FALSIFICA un filo senza path: il grader base passa, quello severo lo nomina", () => {
    const scene = fixtureScene("elab-scene-v2-candidate-v1cap6esp2.json")
    const stripped = {
      ...scene,
      wires: scene.wires.map((wire) => {
        if (wire.id !== "w2") return wire
        const { path: _dropped, ...rest } = wire
        return rest
      }),
    }
    // Il grader base non vede il buco (misura solo ciò che c'è)…
    expect(gradeSceneGeometry(stripped).onGrid).toBe(true)
    // …quello severo lo dichiara per nome.
    const strict = gradeSceneGeometryStrict(stripped)
    expect(strict.strictOnGrid).toBe(false)
    expect(strict.uncoveredWires).toEqual(["w2"])
  })

  it("FALSIFICA una pose mancante su componente con pin in griglia", () => {
    const scene = fixtureScene("elab-scene-v2-candidate-v1cap6esp3.json")
    const stripped = {
      ...scene,
      components: scene.components.map((component) => {
        if (component.id !== "led1") return component
        const { pose: _dropped, ...rest } = component
        return rest
      }),
    }
    const strict = gradeSceneGeometryStrict(stripped)
    expect(strict.strictOnGrid).toBe(false)
    expect(strict.unposedComponents).toEqual(["led1"])
  })

  it("gli errori per-filo permettono la diagnosi puntuale (3px su un solo filo)", () => {
    const scene = fixtureScene("elab-scene-v2-candidate-v1cap6esp2.json")
    const corrupted = {
      ...scene,
      wires: scene.wires.map((wire) =>
        wire.id === "w2"
          ? {
              ...wire,
              path: {
                kind: "polyline" as const,
                points: wire.path!.points.map((point, index) =>
                  index === 0 ? { x: point.x + 3, y: point.y } : point,
                ),
              },
            }
          : wire,
      ),
    }
    const strict = gradeSceneGeometryStrict(corrupted)
    expect(strict.strictOnGrid).toBe(false)
    const w2 = strict.wireErrors.find((wire) => wire.id === "w2")
    expect(w2?.errorPx).toBeCloseTo(3, 5)
    const w1 = strict.wireErrors.find((wire) => wire.id === "w1")
    expect(w1?.errorPx).toBeLessThanOrEqual(0.5)
  })
})
