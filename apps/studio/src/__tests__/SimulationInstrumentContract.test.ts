// @vitest-environment node

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  evaluateSimulationInstrumentCapability,
  evaluateSimulationInstrumentReading,
  simulationInstrumentCapabilities,
} from "../../sim/core/instrumentContract"
import type { SolverResult } from "../../sim/providers/simulationProviders"

const solvedProviderResult: SolverResult = {
  ok: true,
  provider: "local",
  diagnostics: ["local solver available"],
  providerDiagnostics: [
    {
      code: "provider-available",
      severity: "info",
      message: "local solver available",
    },
  ],
  solverDiagnostics: null,
  componentStates: {},
  currents: {
    led1: 0.0153,
  },
  voltages: {
    "bb1:j4": 9,
    "bb1:a9": 0,
  },
}

describe("Simulation instrument contract", () => {
  it("keeps meter, probe, and advanced instrument operations provider-bound without local fake readings", () => {
    const capabilities = simulationInstrumentCapabilities()
    const ammeter = capabilities.find((capability) => capability.id === "ammeter")
    const voltmeter = capabilities.find((capability) => capability.id === "voltmeter")
    const probe = capabilities.find((capability) => capability.id === "probe")
    const logicProbe = capabilities.find((capability) => capability.id === "logic-probe")
    const serialMonitor = capabilities.find((capability) => capability.id === "serial-monitor")
    const oscilloscope = capabilities.find((capability) => capability.id === "oscilloscope")

    expect(ammeter).toMatchObject({
      id: "ammeter",
      operationKind: "probe",
      providerMode: "static",
      physics: "static-dc-circuit",
      readingPolicy: "provider-result-only",
    })
    expect(voltmeter).toMatchObject({
      id: "voltmeter",
      operationKind: "probe",
      providerMode: "static",
      physics: "static-dc-circuit",
      readingPolicy: "provider-result-only",
    })
    expect(probe).toMatchObject({
      id: "probe",
      operationKind: "probe",
      providerMode: "static",
      physics: "static-dc-circuit",
    })
    expect(logicProbe).toMatchObject({
      id: "logic-probe",
      operationKind: "probe",
      providerMode: "run",
      physics: "runtime-microcontroller",
    })
    expect(serialMonitor).toMatchObject({
      id: "serial-monitor",
      operationKind: "run",
      providerMode: "run",
      physics: "runtime-microcontroller",
    })
    expect(oscilloscope).toMatchObject({
      id: "oscilloscope",
      operationKind: "run",
      providerMode: "run",
      physics: "spice-analog-transient",
      requiredProvider: "ngspice-wasm",
    })

    const localVoltmeter = evaluateSimulationInstrumentCapability({
      instrumentId: "voltmeter",
      providerId: "local",
      providerMode: "static",
    })

    expect(localVoltmeter).toMatchObject({
      ok: true,
      providerBound: true,
      readings: [],
    })
    expect(localVoltmeter.diagnostics).toEqual([
      {
        code: "instrument-provider-bound",
        severity: "info",
        providerId: "local",
        providerMode: "static",
        physics: "static-dc-circuit",
        reason: "instrument readings must be derived from provider result data",
        message: "voltmeter is bound to local static static-dc-circuit provider result",
      },
    ])
  })

  it("derives voltmeter readings only from provider voltage results", () => {
    const result = evaluateSimulationInstrumentReading({
      instrumentId: "voltmeter",
      providerId: "local",
      providerMode: "static",
      probeId: "meter-1",
      positiveRef: "bb1:j4",
      negativeRef: "bb1:a9",
      solverResult: solvedProviderResult,
    })

    expect(result.ok).toBe(true)
    expect(result.readings).toEqual([
      {
        kind: "voltage",
        instrumentId: "voltmeter",
        probeId: "meter-1",
        providerId: "local",
        providerMode: "static",
        unit: "V",
        positiveRef: "bb1:j4",
        negativeRef: "bb1:a9",
        positiveVolts: 9,
        negativeVolts: 0,
        value: 9,
      },
    ])
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "instrument-provider-bound",
      "instrument-reading-available",
    ])
  })

  it("derives ammeter readings only from provider current results", () => {
    const result = evaluateSimulationInstrumentReading({
      instrumentId: "ammeter",
      providerId: "local",
      providerMode: "static",
      probeId: "ammeter-1",
      positiveRef: "led1",
      currentRef: "led1",
      solverResult: solvedProviderResult,
    })

    expect(result.ok).toBe(true)
    expect(result.readings).toEqual([
      {
        kind: "current",
        instrumentId: "ammeter",
        probeId: "ammeter-1",
        providerId: "local",
        providerMode: "static",
        unit: "A",
        currentRef: "led1",
        value: 0.0153,
      },
    ])
    expect(result.diagnostics.at(-1)).toMatchObject({
      code: "instrument-reading-available",
      reason: "instrument reading derived from provider current result",
      message: "ammeter-1 reads 0.0153 A through led1",
    })
  })

  it("fails closed when a requested current ref is absent from provider currents", () => {
    const result = evaluateSimulationInstrumentReading({
      instrumentId: "ammeter",
      providerId: "local",
      providerMode: "static",
      probeId: "ammeter-floating",
      positiveRef: "motor1",
      solverResult: solvedProviderResult,
    })

    expect(result.ok).toBe(false)
    expect(result.readings).toEqual([])
    expect(result.diagnostics.at(-1)).toMatchObject({
      code: "instrument-reading-unresolved",
      severity: "blocker",
      reason: "provider result does not include current for motor1",
    })
  })

  it("fails closed when a requested probe ref is absent from provider voltages", () => {
    const result = evaluateSimulationInstrumentReading({
      instrumentId: "probe",
      providerId: "local",
      providerMode: "static",
      probeId: "probe-floating",
      positiveRef: "led1:anode",
      negativeRef: "bb1:a9",
      solverResult: solvedProviderResult,
    })

    expect(result.ok).toBe(false)
    expect(result.readings).toEqual([])
    expect(result.diagnostics.at(-1)).toMatchObject({
      code: "instrument-reading-unresolved",
      severity: "blocker",
      providerId: "local",
      providerMode: "static",
      reason: "provider result does not include voltage for led1:anode",
    })
  })

  it("requires an explicit negativeRef instead of inventing ground", () => {
    const result = evaluateSimulationInstrumentReading({
      instrumentId: "probe",
      providerId: "local",
      providerMode: "static",
      probeId: "probe-single-ended",
      positiveRef: "bb1:j4",
      solverResult: solvedProviderResult,
    })

    expect(result.ok).toBe(false)
    expect(result.readings).toEqual([])
    expect(result.diagnostics.at(-1)).toMatchObject({
      code: "instrument-reading-unresolved",
      reason: "negativeRef is required for provider-derived differential voltage",
    })
  })

  it("blocks serial, plotter, and logic instruments on the unwired local runtime provider", () => {
    const monitor = evaluateSimulationInstrumentCapability({
      instrumentId: "serial-monitor",
      providerId: "local",
      providerMode: "run",
    })
    const serial = evaluateSimulationInstrumentCapability({
      instrumentId: "serial-plotter",
      providerId: "local",
      providerMode: "run",
    })
    const logic = evaluateSimulationInstrumentCapability({
      instrumentId: "logic-probe",
      providerId: "local",
      providerMode: "run",
    })

    expect(monitor.ok).toBe(false)
    expect(monitor.readings).toEqual([])
    expect(monitor.diagnostics[0]).toMatchObject({
      code: "instrument-provider-unsupported",
      providerId: "local",
      providerMode: "run",
      physics: "runtime-microcontroller",
      message: "serial-monitor requires run runtime-microcontroller provider support",
    })
    expect(serial.ok).toBe(false)
    expect(serial.readings).toEqual([])
    expect(serial.diagnostics).toEqual([
      {
        code: "instrument-provider-unsupported",
        severity: "blocker",
        providerId: "local",
        providerMode: "run",
        physics: "runtime-microcontroller",
        reason: "local provider supports static mode and static-dc-circuit physics only",
        message: "serial-plotter requires run runtime-microcontroller provider support",
      },
    ])
    expect(logic.ok).toBe(false)
    expect(logic.readings).toEqual([])
    expect(logic.diagnostics[0]).toMatchObject({
      code: "instrument-provider-unsupported",
      physics: "runtime-microcontroller",
      message: "logic-probe requires run runtime-microcontroller provider support",
    })
  })

  it("blocks oscilloscope and SPICE transient instruments until an ngspice-class provider is available", () => {
    const oscilloscope = evaluateSimulationInstrumentCapability({
      instrumentId: "oscilloscope",
      providerId: "ngspice-wasm",
      providerMode: "run",
    })
    const transient = evaluateSimulationInstrumentCapability({
      instrumentId: "spice-transient",
      providerId: "ngspice-wasm",
      providerMode: "run",
    })

    expect(oscilloscope.ok).toBe(false)
    expect(oscilloscope.readings).toEqual([])
    expect(oscilloscope.diagnostics[0]).toMatchObject({
      code: "instrument-provider-unsupported",
      severity: "blocker",
      providerId: "ngspice-wasm",
      providerMode: "run",
      physics: "spice-analog-transient",
    })
    expect(transient.ok).toBe(false)
    expect(transient.readings).toEqual([])
    expect(transient.diagnostics[0]).toMatchObject({
      code: "instrument-provider-unsupported",
      severity: "blocker",
      providerId: "ngspice-wasm",
      providerMode: "run",
      physics: "spice-analog-transient",
    })
    expect(transient.diagnostics[0]?.reason).toContain("not configured")
  })

  it("models custom chip support as provider capability metadata and blocks when missing", () => {
    const customChip = simulationInstrumentCapabilities().find(
      (capability) => capability.id === "custom-chip",
    )
    const result = evaluateSimulationInstrumentCapability({
      instrumentId: "custom-chip",
      providerId: "fastapi",
      providerMode: "run",
    })

    expect(customChip).toMatchObject({
      id: "custom-chip",
      physics: "custom-chip-wasm",
      readingPolicy: "provider-result-only",
    })
    expect(result.ok).toBe(false)
    expect(result.readings).toEqual([])
    expect(result.diagnostics[0]).toMatchObject({
      providerId: "fastapi",
      providerMode: "run",
      physics: "custom-chip-wasm",
      reason: "fastapi provider hub not configured",
    })
  })

  it("keeps the instrument contract free of DOM state and private simulator imports", () => {
    const source = readFileSync(join(process.cwd(), "sim", "core", "instrumentContract.ts"), "utf8")

    expect(source).not.toMatch(
      /CircuitSolver|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|AVRBridge|plugins\/elab-tutor/,
    )
    expect(source).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b/)
    expect(source).not.toMatch(/^\s*let\s+/m)
    expect(source).not.toMatch(/new\s+(?:Map|WeakMap|Set|WeakSet)\b/)
  })
})
