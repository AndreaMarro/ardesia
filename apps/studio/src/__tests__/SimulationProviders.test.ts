// @vitest-environment node

import { describe, expect, it } from "vitest"
import { createReferenceSimulationScene } from "../toolhost/ToolCanvasEmbeddable"
import {
  providerStatus,
  solveWithProvider,
} from "../../sim/providers/simulationProviders"

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
    expect(result.solverDiagnostics).toBeNull()
    expect(result.componentStates).toEqual({})
    expect(result.currents).toEqual({})
    expect(result.voltages).toEqual({})
  })
})
