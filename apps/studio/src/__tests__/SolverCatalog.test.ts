// Catalogo elettrico headless per il motore vendored (Fase 2 simulature).
// Il CircuitSolver legge dal component-registry SOLO pin.id e, per le
// breadboard, getInternalConnections() (CircuitSolver.js:625-665,955-957):
// il catalogo registra quei dati senza importare i componenti React del plugin.
// Valori estratti firsthand dai registerComponent nei JSX del simulatore
// (BreadboardHalf.jsx:15,56-57,294-338,391-427 · Led.jsx:136 · Resistor.jsx:137
//  · Battery9V.jsx:166 · Wire.jsx:127).
import { beforeAll, describe, expect, it } from "vitest"
import { registerElectricalCatalog } from "../../sim/solver/catalog"
import { getComponent } from "../../sim/solver/components/registry.js"

beforeAll(() => {
  registerElectricalCatalog()
  registerElectricalCatalog() // idempotente: doppia registrazione non deve rompere
})

describe("catalogo elettrico headless", () => {
  it("breadboard-half: 422 pin (300 fori + 120 bus + 2 alias) come la sorgente", () => {
    const entry = getComponent("breadboard-half")
    expect(entry).not.toBeNull()
    expect(entry!.pins!).toHaveLength(422)
    const ids = new Set(entry!.pins!.map((pin) => pin.id))
    expect(ids.has("a1")).toBe(true)
    expect(ids.has("j30")).toBe(true)
    expect(ids.has("bus-top-plus-1")).toBe(true)
    expect(ids.has("bus-bot-minus-30")).toBe(true)
    expect(ids.has("bus-plus")).toBe(true)
    expect(ids.has("bus-minus")).toBe(true)
  })

  it("breadboard-half: strip interne identiche al canone del plugin (a-e top, f-j bottom, 4 bus)", () => {
    const entry = getComponent("breadboard-half")
    const nets = entry!.getInternalConnections!()
    expect(nets).toHaveLength(64)

    const top9 = nets.find((net) => net.id === "net-top-9")
    expect(top9?.holes).toEqual(["a9", "b9", "c9", "d9", "e9"])

    const bot2 = nets.find((net) => net.id === "net-bot-2")
    expect(bot2?.holes).toEqual(["f2", "g2", "h2", "i2", "j2"])

    const busTopPlus = nets.find((net) => net.id === "net-bus-top-plus")
    expect(busTopPlus?.holes).toHaveLength(30)
    expect(busTopPlus?.holes[0]).toBe("bus-top-plus-1")
  })

  it.each([
    { type: "battery9v", pinIds: ["positive", "negative"], category: "power" },
    { type: "resistor", pinIds: ["pin1", "pin2"], category: "passive" },
    { type: "led", pinIds: ["anode", "cathode"], category: "output" },
    { type: "wire", pinIds: ["start", "end"], category: "wire" },
  ])("$type: pin e categoria del canone plugin", ({ type, pinIds, category }) => {
    const entry = getComponent(type)
    expect(entry).not.toBeNull()
    expect(entry!.pins!.map((pin) => pin.id)).toEqual(pinIds)
    expect(entry!.category).toBe(category)
  })

  it("battery9v: defaultState 9V connesso (fonte Battery9V.jsx:171)", () => {
    expect(getComponent("battery9v")!.defaultState).toEqual({ voltage: 9, connected: true })
  })
})
