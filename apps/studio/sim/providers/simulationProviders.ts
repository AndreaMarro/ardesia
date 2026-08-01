import { solveElabExperiment } from "../solver/elabSolver"
import type { SolveResult as ElabSolveResult, SolverExperiment } from "../solver/elabSolver"
import { registerElectricalCatalog } from "../solver/catalog"
import { getComponent } from "../solver/components/registry.js"

export type ProviderId = "local" | "fastapi" | "ngspice-wasm"
export type ProviderMode = "static" | "run"
export type ProviderPhysics =
  | "static-dc-circuit"
  | "runtime-microcontroller"
  | "spice-analog-transient"
  | "custom-chip-wasm"

export type ProviderDiagnosticSeverity = "info" | "warning" | "blocker"

export type ProviderDiagnosticCode =
  | "provider-available"
  | "provider-unavailable"
  | "provider-selection-mismatch"
  | "provider-mode-unsupported"
  | "provider-physics-unsupported"
  | "provider-solve-failed"
  | "solver-warning"
  | "solver-overload-warning"

export type ProviderDiagnostic = {
  code: ProviderDiagnosticCode
  severity: ProviderDiagnosticSeverity
  message: string
}

export type ProviderCapabilityProfile = {
  id: ProviderId
  supportedModes: ProviderMode[]
  targetPhysics: ProviderPhysics[]
  unsupportedPhysics: ProviderPhysics[]
  adapterDirection: string
}

export type PhysicsProviderAdapterReference = {
  id:
    | "circuitjs1"
    | "avr8js"
    | "ngspice"
    | "wokwi-custom-chips-wasm"
    | "wokwi-chips-api"
  url: string
  direction: string
}

export type SceneForSolve = {
  components?: Array<{
    id: string
    type: string
    label?: string
    value?: number
    color?: string | null
    attrs?: Record<string, string | number | boolean>
    pins?: Array<{ id: string; label?: string; role?: string }>
  }>
  connections?: Array<{
    id?: string
    from: string
    to: string
    color?: string
    path?: {
      kind: "orthogonal" | "polyline"
      points: Array<{ x: number; y: number }>
      sourceInstructions?: string[]
    }
  }>
  pinAssignments?: Record<string, string>
  layout?: Record<string, { x: number; y: number; rotation?: number; parentId?: string }>
}

export type SolverRequest = {
  scene: SceneForSolve
  provider: ProviderId
  mode: ProviderMode
}

export type SolverResult = {
  ok: boolean
  provider: ProviderId
  diagnostics: string[]
  providerDiagnostics: ProviderDiagnostic[]
  solverDiagnostics: ElabSolveResult["diagnostics"] | null
  componentStates: Record<string, { on?: boolean } & Record<string, unknown>>
  currents: Record<string, number>
  voltages: Record<string, number>
}

export type ProviderStatus =
  | { id: ProviderId; available: true }
  | { id: ProviderId; available: false; reason: string }

export type SimulationProvider = {
  id: ProviderId
  status: () => ProviderStatus
  solve: (request: SolverRequest) => SolverResult
}

export const PHYSICS_PROVIDER_ADAPTER_REFERENCES: PhysicsProviderAdapterReference[] = [
  {
    id: "circuitjs1",
    url: "https://github.com/sharpie7/circuitjs1",
    direction:
      "reference-only browser circuit behavior; do not install as a dependency in this slice",
  },
  {
    id: "avr8js",
    url: "https://github.com/wokwi/avr8js",
    direction:
      "future AVR-class runtime reference; current ELABTutor AVRBridge is ATmega328p and not Nano R4 exact",
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
]

const PROVIDER_CAPABILITY_PROFILES: Record<ProviderId, ProviderCapabilityProfile> = {
  local: {
    id: "local",
    supportedModes: ["static"],
    targetPhysics: ["static-dc-circuit"],
    unsupportedPhysics: [
      "runtime-microcontroller",
      "spice-analog-transient",
      "custom-chip-wasm",
    ],
    adapterDirection: "ELABTutor CircuitSolver wrapper for static DC circuit solving only",
  },
  fastapi: {
    id: "fastapi",
    supportedModes: [],
    targetPhysics: [
      "static-dc-circuit",
      "runtime-microcontroller",
      "spice-analog-transient",
      "custom-chip-wasm",
    ],
    unsupportedPhysics: [
      "static-dc-circuit",
      "runtime-microcontroller",
      "spice-analog-transient",
      "custom-chip-wasm",
    ],
    adapterDirection: "future host-mediated provider hub; unavailable until configured",
  },
  "ngspice-wasm": {
    id: "ngspice-wasm",
    supportedModes: [],
    targetPhysics: ["spice-analog-transient"],
    unsupportedPhysics: ["spice-analog-transient"],
    adapterDirection: "future ngspice-class WASM provider; unavailable until configured",
  },
}

function providerErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") return error.message
  return String(error)
}

function providerResult(
  provider: ProviderId,
  ok: boolean,
  providerDiagnostics: ProviderDiagnostic[],
  extras: Partial<Omit<SolverResult, "ok" | "provider" | "diagnostics" | "providerDiagnostics">> = {},
): SolverResult {
  return {
    ok,
    provider,
    diagnostics: providerDiagnostics.map((diagnostic) => diagnostic.message),
    providerDiagnostics,
    solverDiagnostics: extras.solverDiagnostics ?? null,
    componentStates: extras.componentStates ?? {},
    currents: extras.currents ?? {},
    voltages: extras.voltages ?? {},
  }
}

function providerSelectionMismatchResult(
  selectedProvider: ProviderId,
  requestedProvider: ProviderId,
): SolverResult | null {
  if (selectedProvider === requestedProvider) return null
  return providerResult(selectedProvider, false, [
    {
      code: "provider-selection-mismatch",
      severity: "blocker",
      message: `Provider selection mismatch: selected ${selectedProvider} but request targeted ${requestedProvider}`,
    },
  ])
}

function unavailableProviderResult(provider: ProviderId, reason: string): SolverResult {
  return providerResult(provider, false, [
    {
      code: "provider-unavailable",
      severity: "blocker",
      message: reason,
    },
  ])
}

function localUnsupportedModeResult(mode: ProviderMode): SolverResult | null {
  if (mode === "static") return null
  return providerResult("local", false, [
    {
      code: "provider-mode-unsupported",
      severity: "blocker",
      message: "local provider supports static solving only; runtime run mode requires a runtime provider",
    },
  ])
}

function localUnsupportedPhysicsDiagnostics(scene: SceneForSolve): ProviderDiagnostic[] {
  registerElectricalCatalog()
  return (scene.components ?? [])
    .filter((component) => {
      const catalogEntry = getComponent(component.type) as {
        requiresRuntimeFirmware?: boolean
      } | null
      return catalogEntry === null || catalogEntry.requiresRuntimeFirmware === true
    })
    .map((component) => ({
      code: "provider-physics-unsupported",
      severity: "blocker",
      message: `local provider cannot solve component ${component.id} of type ${component.type}`,
    }))
}

function providerDiagnosticsFromSolveResult(result: ElabSolveResult): ProviderDiagnostic[] {
  return [
    {
      code: "provider-available",
      severity: "info",
      message: "local solver available",
    },
    ...result.warnings.map((warning) => ({
      code: "solver-warning" as const,
      severity: "warning" as const,
      message: warning,
    })),
    ...result.diagnostics.overloadWarnings.map((warning) => ({
      code: "solver-overload-warning" as const,
      severity: "warning" as const,
      message: warning.message ?? warning.type ?? warning.compId,
    })),
  ]
}

function solverExperimentFromScene(scene: SceneForSolve): SolverExperiment {
  return {
    components: [...(scene.components ?? [])].map((component) => ({
      id: component.id,
      type: component.type,
      value: component.value,
      color: component.color,
    })),
    connections: [...(scene.connections ?? [])].map((connection) => ({
      from: connection.from,
      to: connection.to,
      color: connection.color,
    })),
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
  }
}

const localProvider: SimulationProvider = {
  id: "local",
  status: () => ({ id: "local", available: true }),
  solve: (request) => {
    const mismatch = providerSelectionMismatchResult("local", request.provider)
    if (mismatch !== null) return mismatch

    const unsupportedMode = localUnsupportedModeResult(request.mode)
    if (unsupportedMode !== null) return unsupportedMode

    const unsupportedPhysics = localUnsupportedPhysicsDiagnostics(request.scene)
    if (unsupportedPhysics.length > 0) {
      return providerResult("local", false, unsupportedPhysics)
    }

    try {
      const result = solveElabExperiment(solverExperimentFromScene(request.scene))
      const providerDiagnostics = providerDiagnosticsFromSolveResult(result)
      return {
        ok: result.ok,
        provider: "local",
        diagnostics: providerDiagnostics.map((diagnostic) => diagnostic.message),
        providerDiagnostics,
        solverDiagnostics: result.diagnostics,
        componentStates: result.componentStates,
        currents: result.currents,
        voltages: result.nodeVoltages,
      }
    } catch (error) {
      const message = `Local solver failed: ${providerErrorMessage(error)}`
      return providerResult("local", false, [
        {
          code: "provider-solve-failed",
          severity: "blocker",
          message,
        },
      ])
    }
  },
}

const fastapiProvider: SimulationProvider = {
  id: "fastapi",
  status: () => ({
    id: "fastapi",
    available: false,
    reason: "FastAPI provider hub not configured",
  }),
  solve: (request) =>
    providerSelectionMismatchResult("fastapi", request.provider) ??
    unavailableProviderResult("fastapi", "FastAPI provider hub not configured"),
}

const ngspiceWasmProvider: SimulationProvider = {
  id: "ngspice-wasm",
  status: () => ({
    id: "ngspice-wasm",
    available: false,
    reason: "ngspice-wasm provider not configured",
  }),
  solve: (request) =>
    providerSelectionMismatchResult("ngspice-wasm", request.provider) ??
    unavailableProviderResult("ngspice-wasm", "ngspice-wasm provider not configured"),
}

export const simulationProviders: Record<ProviderId, SimulationProvider> = {
  local: localProvider,
  fastapi: fastapiProvider,
  "ngspice-wasm": ngspiceWasmProvider,
}

export function providerStatus(id: ProviderId): ProviderStatus {
  return simulationProviders[id].status()
}

export function providerCapabilityProfile(id: ProviderId): ProviderCapabilityProfile {
  const profile = PROVIDER_CAPABILITY_PROFILES[id]
  return {
    ...profile,
    supportedModes: [...profile.supportedModes],
    targetPhysics: [...profile.targetPhysics],
    unsupportedPhysics: [...profile.unsupportedPhysics],
  }
}

export function solveWithProvider(id: ProviderId, request: SolverRequest): SolverResult {
  return simulationProviders[id].solve(request)
}
