// @vitest-environment node

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  filterSimulationComponentCatalogForKit,
  getSimulationComponentCatalogEntry,
  listSimulationComponentCatalog,
} from "../../sim/core/componentCatalog"
import { solveWithProvider } from "../../sim/providers/simulationProviders"

function catalogIds(): string[] {
  return listSimulationComponentCatalog().map((entry) => entry.id)
}

describe("Simulation component catalog", () => {
  it("lists supported basics through the solver catalog adapter", () => {
    expect(catalogIds()).toEqual([
      "breadboard-half",
      "battery9v",
      "resistor",
      "led",
      "rgb-led",
      "potentiometer",
      "wire",
      "nano-r4",
    ])

    const breadboard = getSimulationComponentCatalogEntry("breadboard-half")
    expect(breadboard).toMatchObject({
      id: "breadboard-half",
      label: "Breadboard (Half)",
      category: "board",
      visual: { source: "simulation-plugin" },
      footprint: {
        kind: "breadboard",
        width: 253,
        height: 145,
        placement: "board-scoped-grid",
      },
      providerSupport: {
        local: { status: "supported", physics: "static-dc-circuit" },
      },
    })
    expect(breadboard?.pins).toHaveLength(422)
    expect(breadboard?.pins.map((pin) => pin.id)).toEqual(
      expect.arrayContaining(["a1", "j30", "bus-top-plus-1", "bus-bot-minus-30"]),
    )

    expect(getSimulationComponentCatalogEntry("resistor")?.pins.map((pin) => pin.id)).toEqual([
      "pin1",
      "pin2",
    ])
    expect(getSimulationComponentCatalogEntry("led")?.pins.map((pin) => pin.id)).toEqual([
      "anode",
      "cathode",
    ])
    expect(getSimulationComponentCatalogEntry("rgb-led")?.pins.map((pin) => pin.id)).toEqual([
      "red",
      "common",
      "green",
      "blue",
    ])
    expect(getSimulationComponentCatalogEntry("potentiometer")?.pins.map((pin) => pin.id)).toEqual([
      "vcc",
      "signal",
      "gnd",
    ])
  })

  it("keeps unsupported components listable but provider-blocked without fake solve state", () => {
    const nano = getSimulationComponentCatalogEntry("nano-r4")

    expect(nano).toMatchObject({
      id: "nano-r4",
      label: "Arduino Nano R4",
      category: "controller-board",
      pins: [
        { id: "D13", role: "digital" },
        { id: "GND", role: "power" },
        { id: "5V", role: "power" },
        { id: "A0", role: "analog" },
      ],
      footprint: {
        kind: "controller-board",
        width: 260,
        height: 180,
        placement: "free-board",
      },
      providerSupport: {
        local: {
          status: "unsupported",
          physics: "runtime-microcontroller",
          reason: "local provider cannot solve Arduino Nano R4 runtime physics",
        },
      },
    })
    expect(nano).not.toHaveProperty("solveState")
    expect(nano).not.toHaveProperty("componentStates")
    expect(nano).not.toHaveProperty("currents")
    expect(nano).not.toHaveProperty("voltages")

    const result = solveWithProvider("local", {
      scene: {
        components: [{ id: "nano1", type: "nano-r4" }],
        connections: [],
        pinAssignments: {},
      },
      provider: "local",
      mode: "static",
    })

    expect(result.ok).toBe(false)
    expect(result.providerDiagnostics).toEqual([
      {
        code: "provider-physics-unsupported",
        severity: "blocker",
        message: "local provider cannot solve component nano1 of type nano-r4",
      },
    ])
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })

  it("filters ELABTutor kit and manual views over the shared catalog entries", () => {
    const catalog = listSimulationComponentCatalog()
    const cap6View = filterSimulationComponentCatalogForKit(catalog, {
      packId: "io.elab.tutor",
      kitId: "elab-volume-1",
      manualRef: "vol1:cap6",
    })
    const cap9View = filterSimulationComponentCatalogForKit(catalog, {
      packId: "io.elab.tutor",
      kitId: "elab-volume-1",
      manualRef: "vol1:cap9",
    })
    const volume3View = filterSimulationComponentCatalogForKit(catalog, {
      packId: "io.elab.tutor",
      kitId: "elab-volume-3",
      manualRef: "vol3:cap8",
    })

    expect(cap6View.map((entry) => entry.id)).toEqual([
      "breadboard-half",
      "battery9v",
      "resistor",
      "led",
      "wire",
    ])
    expect(cap9View.map((entry) => entry.id)).toEqual([
      "breadboard-half",
      "battery9v",
      "resistor",
      "led",
      "rgb-led",
      "potentiometer",
      "wire",
    ])
    expect(volume3View.map((entry) => entry.id)).toEqual([
      "breadboard-half",
      "potentiometer",
      "wire",
      "nano-r4",
    ])
    expect(cap6View.every((entry) => catalog.includes(entry))).toBe(true)
    expect(cap9View.every((entry) => catalog.includes(entry))).toBe(true)
    expect(volume3View.every((entry) => catalog.includes(entry))).toBe(true)
  })

  it("exposes stable pins and placement footprints for multi-board scenes", () => {
    const breadboard = getSimulationComponentCatalogEntry("breadboard-half")
    const nano = getSimulationComponentCatalogEntry("nano-r4")

    expect(breadboard?.footprint.connectionScope).toBe("breadboard-nodes")
    expect(breadboard?.footprint.boardScoped).toBe(true)
    expect(nano?.footprint.connectionScope).toBe("component-pins")
    expect(nano?.footprint.boardScoped).toBe(true)
    expect(nano?.pins.map((pin) => pin.id)).toEqual(["D13", "GND", "5V", "A0"])

    const secondRead = getSimulationComponentCatalogEntry("nano-r4")
    expect(secondRead?.pins.map((pin) => pin.id)).toEqual(["D13", "GND", "5V", "A0"])
    expect(secondRead).not.toBe(nano)
  })

  it("keeps the catalog data-driven with no host switch or per-instance singleton state", () => {
    const source = readFileSync(join(process.cwd(), "sim", "core", "componentCatalog.ts"), "utf8")

    expect(source).not.toMatch(/\bswitch\s*\(/)
    expect(source).not.toMatch(/^\s*let\s+/m)
    expect(source).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(source).not.toMatch(/\bcurrent(Catalog|Component|Instance)\b/)
  })
})
