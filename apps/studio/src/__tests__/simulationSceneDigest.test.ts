import { describe, expect, it } from "vitest"
import {
  canonicalSceneTopology,
  simulationSceneDigest,
  type DigestSceneLike,
} from "../../sim/core/simulationSceneDigest"

const BASE: DigestSceneLike = {
  components: [
    { id: "bat1", type: "battery9v" },
    { id: "r1", type: "resistor", value: 470 },
    { id: "led1", type: "led" },
  ],
  connections: [
    { from: "bat1:positive", to: "r1:pin1", kind: "wire" },
    { from: "r1:pin2", to: "led1:anode", kind: "wire" },
    { from: "led1:cathode", to: "bat1:negative", kind: "wire" },
  ],
  pinAssignments: { "r1:pin1": "bb1:a1" },
}

describe("simulationSceneDigest (topologia stabile per save/reopen)", () => {
  it("è deterministico: stessa scena → stesso digest", () => {
    expect(simulationSceneDigest(BASE)).toBe(simulationSceneDigest(BASE))
  })

  it("è invariante all'ordine di componenti/collegamenti (canonicalizza)", () => {
    const shuffled: DigestSceneLike = {
      components: [BASE.components[2]!, BASE.components[0]!, BASE.components[1]!],
      connections: [BASE.connections[2]!, BASE.connections[0]!, BASE.connections[1]!],
      pinAssignments: BASE.pinAssignments,
    }
    expect(simulationSceneDigest(shuffled)).toBe(simulationSceneDigest(BASE))
  })

  it("ignora runtime/animazione: il digest è pura topologia", () => {
    // due oggetti scena con campi extra non-topologici → stesso digest
    const withRuntime = { ...BASE, runtime: { kind: "battery-led", ledOn: true } }
    const withoutRuntime = { ...BASE, runtime: { kind: "battery-led", ledOn: false } }
    expect(simulationSceneDigest(withRuntime as DigestSceneLike)).toBe(
      simulationSceneDigest(withoutRuntime as DigestSceneLike),
    )
  })

  it("cambia quando un collegamento viene rotto (open-circuit ≠ chiuso)", () => {
    const broken: DigestSceneLike = {
      ...BASE,
      connections: BASE.connections.slice(1), // rimuovi bat1→r1: circuito aperto
    }
    expect(simulationSceneDigest(broken)).not.toBe(simulationSceneDigest(BASE))
  })

  it("canonicalSceneTopology produce sezioni C/W/P ordinate", () => {
    const canon = canonicalSceneTopology(BASE)
    expect(canon).toContain("C:")
    expect(canon).toContain("W:")
    expect(canon).toContain("P:")
    expect(canon.indexOf("C:")).toBeLessThan(canon.indexOf("W:"))
  })
})
