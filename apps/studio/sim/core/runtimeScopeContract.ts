import type { ProviderId, ProviderMode, ProviderPhysics } from "../providers/simulationProviders"

export type SimulationMicrocontrollerBoardId =
  | "arduino-uno-atmega328p"
  | "arduino-nano-classic-atmega328p"
  | "arduino-nano-r4-renesas-ra4m1"

export type SimulationRuntimeEngineId =
  | "elab-avrbridge-atmega328p"
  | "renesas-ra4m1-runtime-unavailable"

export type SimulationRuntimeScope = {
  boardId: SimulationMicrocontrollerBoardId
  label: string
  microcontroller: "atmega328p" | "renesas-ra4m1"
  engineId: SimulationRuntimeEngineId
  providerMode: Extract<ProviderMode, "run">
  physics: Extract<ProviderPhysics, "runtime-microcontroller">
  exactHardwareParity: boolean
  reason: string
}

export type SimulationRuntimeScopeDiagnostic = {
  code:
    | "runtime-board-required"
    | "runtime-scope-atmega328p"
    | "runtime-provider-unwired"
    | "runtime-provider-mode-unsupported"
    | "runtime-board-unsupported"
  severity: "info" | "blocker"
  boardId: SimulationMicrocontrollerBoardId | null
  providerId: ProviderId
  providerMode: ProviderMode
  physics: Extract<ProviderPhysics, "runtime-microcontroller">
  reason: string
  message: string
}

export type SimulationRuntimeScopeInput = {
  boardId?: SimulationMicrocontrollerBoardId
  providerId: ProviderId
  providerMode: ProviderMode
}

export type SimulationRuntimeScopeResult = {
  ok: boolean
  canRun: boolean
  providerBound: true
  boardId: SimulationMicrocontrollerBoardId | null
  engineId: SimulationRuntimeEngineId | null
  diagnostics: SimulationRuntimeScopeDiagnostic[]
}

const RUNTIME_PHYSICS = "runtime-microcontroller" as const

const SIMULATION_RUNTIME_SCOPES: SimulationRuntimeScope[] = [
  {
    boardId: "arduino-uno-atmega328p",
    label: "Arduino Uno R3",
    microcontroller: "atmega328p",
    engineId: "elab-avrbridge-atmega328p",
    providerMode: "run",
    physics: RUNTIME_PHYSICS,
    exactHardwareParity: false,
    reason: "ATmega328p runtime scope only; not a Nano R4/Renesas RA4M1 runtime",
  },
  {
    boardId: "arduino-nano-classic-atmega328p",
    label: "Arduino Nano classic",
    microcontroller: "atmega328p",
    engineId: "elab-avrbridge-atmega328p",
    providerMode: "run",
    physics: RUNTIME_PHYSICS,
    exactHardwareParity: false,
    reason: "ATmega328p runtime scope only; not a Nano R4/Renesas RA4M1 runtime",
  },
  {
    boardId: "arduino-nano-r4-renesas-ra4m1",
    label: "Arduino Nano R4",
    microcontroller: "renesas-ra4m1",
    engineId: "renesas-ra4m1-runtime-unavailable",
    providerMode: "run",
    physics: RUNTIME_PHYSICS,
    exactHardwareParity: false,
    reason: "Nano R4 uses Renesas RA4M1; ATmega328p runtime cannot emulate it",
  },
]

export function simulationRuntimeScopes(): SimulationRuntimeScope[] {
  return SIMULATION_RUNTIME_SCOPES.map((scope) => ({ ...scope }))
}

export function simulationRuntimeBoardIds(): SimulationMicrocontrollerBoardId[] {
  return SIMULATION_RUNTIME_SCOPES.map((scope) => scope.boardId)
}

export function evaluateSimulationRuntimeScope(
  input: SimulationRuntimeScopeInput,
): SimulationRuntimeScopeResult {
  const scope = input.boardId === undefined ? null : requireRuntimeScope(input.boardId)
  const diagnostics =
    scope === null
      ? [boardRequiredDiagnostic(input)]
      : scope.microcontroller === "renesas-ra4m1"
        ? scopeDiagnostics(scope, input)
      : [
          ...scopeDiagnostics(scope, input),
          ...providerDiagnostics(scope, input),
        ]
  const canRun = diagnostics.every((diagnostic) => diagnostic.severity !== "blocker")

  return {
    ok: canRun,
    canRun,
    providerBound: true,
    boardId: scope?.boardId ?? null,
    engineId: scope?.engineId ?? null,
    diagnostics,
  }
}

function requireRuntimeScope(
  boardId: SimulationMicrocontrollerBoardId,
): SimulationRuntimeScope {
  const scope = SIMULATION_RUNTIME_SCOPES.find((candidate) => candidate.boardId === boardId)
  if (scope === undefined) {
    throw new Error(`unknown simulation runtime board: ${boardId}`)
  }
  return scope
}

function scopeDiagnostics(
  scope: SimulationRuntimeScope,
  input: SimulationRuntimeScopeInput,
): SimulationRuntimeScopeDiagnostic[] {
  if (scope.microcontroller === "renesas-ra4m1") {
    return [
      {
        code: "runtime-board-unsupported",
        severity: "blocker",
        boardId: scope.boardId,
        providerId: input.providerId,
        providerMode: input.providerMode,
        physics: RUNTIME_PHYSICS,
        reason: scope.reason,
        message: `${scope.label} runtime is not available; do not substitute an ATmega328p simulation`,
      },
    ]
  }

  return [
    {
      code: "runtime-scope-atmega328p",
      severity: "info",
      boardId: scope.boardId,
      providerId: input.providerId,
      providerMode: input.providerMode,
      physics: RUNTIME_PHYSICS,
      reason: scope.reason,
      message: `${scope.label} is scoped to an ATmega328p-compatible runtime only`,
    },
  ]
}

function providerDiagnostics(
  scope: SimulationRuntimeScope,
  input: SimulationRuntimeScopeInput,
): SimulationRuntimeScopeDiagnostic[] {
  if (input.providerMode !== "run") {
    return [
      {
        code: "runtime-provider-mode-unsupported",
        severity: "blocker",
        boardId: scope.boardId,
        providerId: input.providerId,
        providerMode: input.providerMode,
        physics: RUNTIME_PHYSICS,
        reason: "microcontroller runtime requires providerMode run",
        message: `${scope.label} runtime requires run mode`,
      },
    ]
  }

  return [
    {
      code: "runtime-provider-unwired",
      severity: "blocker",
      boardId: scope.boardId,
      providerId: input.providerId,
      providerMode: input.providerMode,
      physics: RUNTIME_PHYSICS,
      reason: "no Studio runtime provider is wired for this board in this slice",
      message: `${scope.label} runtime is scoped but not executable in this provider`,
    },
  ]
}

function boardRequiredDiagnostic(
  input: SimulationRuntimeScopeInput,
): SimulationRuntimeScopeDiagnostic {
  return {
    code: "runtime-board-required",
    severity: "blocker",
    boardId: null,
    providerId: input.providerId,
    providerMode: input.providerMode,
    physics: RUNTIME_PHYSICS,
    reason: "run operations must name the target microcontroller board",
    message: "microcontroller run requires an explicit boardId",
  }
}
