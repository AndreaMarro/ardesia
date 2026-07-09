// @vitest-environment node

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  evaluateSimulationRuntimeScope,
  simulationRuntimeBoardIds,
  simulationRuntimeScopes,
} from "../../sim/core/runtimeScopeContract"

describe("Simulation runtime scope contract", () => {
  it("declares ATmega328p and Nano R4 as different runtime scopes", () => {
    expect(simulationRuntimeBoardIds()).toEqual([
      "arduino-uno-atmega328p",
      "arduino-nano-classic-atmega328p",
      "arduino-nano-r4-renesas-ra4m1",
    ])
    expect(simulationRuntimeScopes()).toEqual([
      expect.objectContaining({
        boardId: "arduino-uno-atmega328p",
        microcontroller: "atmega328p",
        engineId: "elab-avrbridge-atmega328p",
        exactHardwareParity: false,
      }),
      expect.objectContaining({
        boardId: "arduino-nano-classic-atmega328p",
        microcontroller: "atmega328p",
        engineId: "elab-avrbridge-atmega328p",
        exactHardwareParity: false,
      }),
      expect.objectContaining({
        boardId: "arduino-nano-r4-renesas-ra4m1",
        microcontroller: "renesas-ra4m1",
        engineId: "renesas-ra4m1-runtime-unavailable",
        exactHardwareParity: false,
      }),
    ])
  })

  it("requires run operations to name a board before runtime evaluation", () => {
    const result = evaluateSimulationRuntimeScope({
      providerId: "local",
      providerMode: "run",
    })

    expect(result).toEqual({
      ok: false,
      canRun: false,
      providerBound: true,
      boardId: null,
      engineId: null,
      diagnostics: [
        {
          code: "runtime-board-required",
          severity: "blocker",
          boardId: null,
          providerId: "local",
          providerMode: "run",
          physics: "runtime-microcontroller",
          reason: "run operations must name the target microcontroller board",
          message: "microcontroller run requires an explicit boardId",
        },
      ],
    })
  })

  it("scopes ATmega328p as known but not executable until a runtime provider is wired", () => {
    const result = evaluateSimulationRuntimeScope({
      boardId: "arduino-uno-atmega328p",
      providerId: "local",
      providerMode: "run",
    })

    expect(result.ok).toBe(false)
    expect(result.canRun).toBe(false)
    expect(result.engineId).toBe("elab-avrbridge-atmega328p")
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "runtime-scope-atmega328p",
      "runtime-provider-unwired",
    ])
    expect(result.diagnostics[0]).toMatchObject({
      severity: "info",
      reason: "ATmega328p runtime scope only; not a Nano R4/Renesas RA4M1 runtime",
    })
    expect(result.diagnostics[1]).toMatchObject({
      severity: "blocker",
      reason: "no Studio runtime provider is wired for this board in this slice",
    })
  })

  it("blocks Nano R4 instead of substituting an ATmega328p runtime", () => {
    const result = evaluateSimulationRuntimeScope({
      boardId: "arduino-nano-r4-renesas-ra4m1",
      providerId: "local",
      providerMode: "run",
    })

    expect(result).toMatchObject({
      ok: false,
      canRun: false,
      boardId: "arduino-nano-r4-renesas-ra4m1",
      engineId: "renesas-ra4m1-runtime-unavailable",
    })
    expect(result.diagnostics).toEqual([
      {
        code: "runtime-board-unsupported",
        severity: "blocker",
        boardId: "arduino-nano-r4-renesas-ra4m1",
        providerId: "local",
        providerMode: "run",
        physics: "runtime-microcontroller",
        reason: "Nano R4 uses Renesas RA4M1; ATmega328p runtime cannot emulate it",
        message:
          "Arduino Nano R4 runtime is not available; do not substitute an ATmega328p simulation",
      },
    ])
  })

  it("keeps runtime scope metadata free of private bridge imports and browser state", () => {
    const source = readFileSync(
      join(process.cwd(), "sim", "core", "runtimeScopeContract.ts"),
      "utf8",
    )

    expect(source).not.toMatch(/plugins\/elab-tutor|AVRBridge|avrWorker|avr8js/)
    expect(source).not.toMatch(/\bglobalThis\b|\bwindow\b|\bdocument\b|\bWorker\b/)
  })
})
