// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest"
import { createReferenceSimulationScene } from "../toolhost/ToolCanvasEmbeddable"
import {
  PHYSICS_PROVIDER_ADAPTER_REFERENCES,
  providerCapabilityProfile,
  providerStatus,
  solveWithProvider,
} from "../../sim/providers/simulationProviders"
import * as elabSolver from "../../sim/solver/elabSolver"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Simulation provider boundary", () => {
  it("local provider is available and preserves diagnostics", () => {
    const status = providerStatus("local")
    expect(status).toEqual({ id: "local", available: true })

    const result = solveWithProvider("local", {
      scene: createReferenceSimulationScene(),
      provider: "local",
      mode: "static",
    })

    expect(result.ok).toBe(true)
    expect(result.provider).toBe("local")
    expect(result.diagnostics).toContain("local solver available")
    expect(result.providerDiagnostics).toContainEqual({
      code: "provider-available",
      severity: "info",
      message: "local solver available",
    })
    expect(result.solverDiagnostics?.shortCircuit).toBe(false)
    expect(Array.isArray(result.solverDiagnostics?.disconnectedPins)).toBe(true)
    expect(Array.isArray(result.solverDiagnostics?.overloadWarnings)).toBe(true)
    expect(result.componentStates.led1?.on).toBe(true)
    expect(result.currents.led1).toBeCloseTo(0.0153, 3)
    expect(Object.keys(result.voltages).length).toBeGreaterThan(0)
  })

  it("FastAPI provider is optional and unavailable without fake results", () => {
    const status = providerStatus("fastapi")
    expect(status.available).toBe(false)
    if (status.available) {
      throw new Error("FastAPI provider unexpectedly available")
    }
    expect(status.reason).toBe("FastAPI provider hub not configured")

    const result = solveWithProvider("fastapi", {
      scene: createReferenceSimulationScene(),
      provider: "fastapi",
      mode: "static",
    })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe("fastapi")
    expect(result.diagnostics).toEqual(["FastAPI provider hub not configured"])
    expect(result.providerDiagnostics).toEqual([
      {
        code: "provider-unavailable",
        severity: "blocker",
        message: "FastAPI provider hub not configured",
      },
    ])
    expect(result.solverDiagnostics).toBeNull()
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })

  it("ngspice-wasm provider is explicit but unavailable without fake results", () => {
    const status = providerStatus("ngspice-wasm")
    expect(status.available).toBe(false)
    if (status.available) {
      throw new Error("ngspice-wasm provider unexpectedly available")
    }
    expect(status.reason).toBe("ngspice-wasm provider not configured")

    const result = solveWithProvider("ngspice-wasm", {
      scene: createReferenceSimulationScene(),
      provider: "ngspice-wasm",
      mode: "static",
    })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe("ngspice-wasm")
    expect(result.diagnostics).toEqual(["ngspice-wasm provider not configured"])
    expect(result.providerDiagnostics).toEqual([
      {
        code: "provider-unavailable",
        severity: "blocker",
        message: "ngspice-wasm provider not configured",
      },
    ])
    expect(result.solverDiagnostics).toBeNull()
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })

  it("keeps selected provider and request provider in lockstep", () => {
    const result = solveWithProvider("local", {
      scene: createReferenceSimulationScene(),
      provider: "fastapi",
      mode: "static",
    })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe("local")
    expect(result.providerDiagnostics).toEqual([
      {
        code: "provider-selection-mismatch",
        severity: "blocker",
        message: "Provider selection mismatch: selected local but request targeted fastapi",
      },
    ])
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })

  it("refuses runtime run mode through the static local solver", () => {
    const profile = providerCapabilityProfile("local")
    expect(profile.supportedModes).toEqual(["static"])
    expect(profile.targetPhysics).toContain("static-dc-circuit")
    expect(profile.unsupportedPhysics).toContain("runtime-microcontroller")

    const result = solveWithProvider("local", {
      scene: createReferenceSimulationScene(),
      provider: "local",
      mode: "run",
    })

    expect(result.ok).toBe(false)
    expect(result.providerDiagnostics).toEqual([
      {
        code: "provider-mode-unsupported",
        severity: "blocker",
        message: "local provider supports static solving only; runtime run mode requires a runtime provider",
      },
    ])
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })

  it("reports unsupported local physics before attempting a fake solve", () => {
    const scene = {
      ...createReferenceSimulationScene(),
      components: [
        ...createReferenceSimulationScene().components,
        { id: "nano1", type: "nano-r4" },
      ],
    }

    const result = solveWithProvider("local", {
      scene,
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
    expect(result.solverDiagnostics).toBeNull()
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })

  it("records external adapter references as research direction, not dependencies", () => {
    expect(PHYSICS_PROVIDER_ADAPTER_REFERENCES).toEqual([
      {
        id: "circuitjs1",
        url: "https://github.com/sharpie7/circuitjs1",
        direction: "reference-only browser circuit behavior; do not install as a dependency in this slice",
      },
      {
        id: "avr8js",
        url: "https://github.com/wokwi/avr8js",
        direction: "future AVR-class runtime reference; current ELABTutor AVRBridge is ATmega328p and not Nano R4 exact",
      },
      {
        id: "ngspice",
        url: "https://ngspice.sourceforge.io/",
        direction: "future SPICE-class provider boundary for analog and mixed-signal solving",
      },
      {
        id: "wokwi-custom-chips-wasm",
        url: "https://docs.wokwi.com/guides/custom-chips-to-wasm",
        direction: "future custom-chip provider packaging reference",
      },
      {
        id: "wokwi-chips-api",
        url: "https://docs.wokwi.com/chips-api/getting-started",
        direction: "future sensor/chip pin model reference",
      },
    ])
  })

  it("local provider converts solver exceptions into user-visible failure results", () => {
    vi.spyOn(elabSolver, "solveElabExperiment").mockImplementation(() => {
      throw new Error("solver exploded")
    })

    const result = solveWithProvider("local", {
      scene: createReferenceSimulationScene(),
      provider: "local",
      mode: "static",
    })

    expect(result).toEqual({
      ok: false,
      provider: "local",
      diagnostics: ["Local solver failed: solver exploded"],
      providerDiagnostics: [
        {
          code: "provider-solve-failed",
          severity: "blocker",
          message: "Local solver failed: solver exploded",
        },
      ],
      solverDiagnostics: null,
      componentStates: {},
      currents: {},
      voltages: {},
    })
  })
})
