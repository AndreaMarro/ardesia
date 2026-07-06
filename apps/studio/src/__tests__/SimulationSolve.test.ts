// @vitest-environment node
// Simulation Plugin — resolveNet + solveSeriesLoop (solve serie graph-driven)
// Il traversal percorre connections + pinAssignments sulla grammatica breadboard
// ELAB (tie top/bottom, rail interi) invece della formula hard-coded a due branch.

import { describe, expect, it } from "vitest"
import { resolveNet, solveSeriesLoop, type SeriesCircuitScene } from "../../sim/breadboard/simulationBreadboard"
import { createReferenceSimulationScene } from "../toolhost/ToolCanvasEmbeddable"

/** Scena di riferimento Vol.1 cap.6 esp.1: bat9V → r470 → LED → bat- */
function referenceScene(): SeriesCircuitScene {
  return createReferenceSimulationScene()
}

describe("resolveNet", () => {
  it("fori sulla stessa tie della breadboard condividono la net", () => {
    const scene = referenceScene()
    expect(resolveNet("bb1:j2", scene)).toBe(resolveNet("bb1:i2", scene))
    expect(resolveNet("bb1:f9", scene)).not.toBe(resolveNet("bb1:e9", scene))
  })

  it("pinAssignments uniscono i pin componente alla net del foro", () => {
    const scene = referenceScene()
    // r1:pin1 è assegnato a bb1:bus-top-plus-9 → stessa net dell'intero rail plus
    expect(resolveNet("r1:pin1", scene)).toBe(resolveNet("bb1:bus-top-plus-1", scene))
    // led1:anode @ bb1:f9 → stessa net di r1:pin2 @ bb1:i9 (tie top col 9)
    expect(resolveNet("led1:anode", scene)).toBe(resolveNet("r1:pin2", scene))
  })

  it("connections (fili) uniscono le net dei due capi", () => {
    const scene = referenceScene()
    // bat1:positive —filo→ bb1:bus-top-plus-1 → stesso rail di r1:pin1 (testo p30)
    expect(resolveNet("bat1:positive", scene)).toBe(resolveNet("r1:pin1", scene))
    // bat1:negative —filo→ bb1:a9 → stessa net del catodo LED (bb1:e9, tie bottom col 9)
    expect(resolveNet("bat1:negative", scene)).toBe(resolveNet("led1:cathode", scene))
  })

  it("net distinte restano distinte (nessun corto sul canale centrale)", () => {
    const scene = referenceScene()
    expect(resolveNet("bat1:positive", scene)).not.toBe(resolveNet("bat1:negative", scene))
  })
})

describe("solveSeriesLoop", () => {
  it("scena di riferimento: loop chiuso, R serie = 470, un LED", () => {
    const loop = solveSeriesLoop(referenceScene())
    expect(loop.closed).toBe(true)
    expect(loop.resistanceOhms).toBe(470)
    expect(loop.ledCount).toBe(1)
  })

  it("filo negativo rimosso → loop aperto", () => {
    const scene = referenceScene()
    scene.connections = scene.connections.filter((c) => c.from !== "bat1:negative")
    const loop = solveSeriesLoop(scene)
    expect(loop.closed).toBe(false)
  })

  it("valore del resistore preso dal COMPONENTE sul path, non dal runtime", () => {
    const scene = referenceScene()
    const r1 = scene.components.find((c) => c.id === "r1")!
    r1.value = 220
    const loop = solveSeriesLoop(scene)
    expect(loop.closed).toBe(true)
    expect(loop.resistanceOhms).toBe(220)
  })

  it("scena densa avversariale: il solve termina col budget, non impicca il tab", { timeout: 5000 }, () => {
    // 12 net completamente connesse da resistori (66 archi) + batteria con
    // negativo isolato: senza budget la DFS dei cammini semplici esplode
    // fattorialmente (verificato: 66 componenti = hang > 2 min). Le scene
    // arrivano anche da embed condivisi/importati → DoS lato client.
    const nets = Array.from({ length: 12 }, (_, i) => `bb1:a${i + 1}`)
    const components: SeriesCircuitScene["components"] = [
      { id: "bat1", type: "battery9v" },
    ]
    const connections: SeriesCircuitScene["connections"] = [
      { from: "bat1:positive", to: nets[0] },
      // bat1:negative NON connesso → circuito aperto
    ]
    const pinAssignments: Record<string, string> = {}
    let n = 0
    for (let i = 0; i < nets.length; i++) {
      for (let j = i + 1; j < nets.length; j++) {
        const id = `r${n++}`
        components.push({ id, type: "resistor", value: 100 })
        pinAssignments[`${id}:pin1`] = nets[i]
        pinAssignments[`${id}:pin2`] = nets[j]
      }
    }
    const scene: SeriesCircuitScene = { components, pinAssignments, connections }
    const loop = solveSeriesLoop(scene)
    expect(loop.closed).toBe(false)
  })

  it("scena senza batteria → loop aperto, nessun crash", () => {
    const scene = referenceScene()
    scene.components = scene.components.filter((c) => c.type !== "battery9v")
    const loop = solveSeriesLoop(scene)
    expect(loop.closed).toBe(false)
  })
})
