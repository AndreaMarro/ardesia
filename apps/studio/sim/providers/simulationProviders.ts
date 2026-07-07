import { solveElabExperiment } from "../solver/elabSolver"
import type { SolveResult as ElabSolveResult, SolverExperiment } from "../solver/elabSolver"

export type ProviderId = "local" | "fastapi"

export type SceneForSolve = {
  components?: Array<{ id: string; type: string; value?: number; color?: string | null }>
  connections?: Array<{ from: string; to: string; color?: string }>
  pinAssignments?: Record<string, string>
}

export type SolverRequest = {
  scene: SceneForSolve
  provider: ProviderId
  mode: "static" | "run"
}

export type SolverResult = {
  ok: boolean
  provider: ProviderId
  diagnostics: string[]
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
    const result = solveElabExperiment(solverExperimentFromScene(request.scene))
    return {
      ok: result.ok,
      provider: "local",
      diagnostics: [
        "local solver available",
        ...result.warnings,
        ...result.diagnostics.overloadWarnings.map(
          (warning) => warning.message ?? warning.type ?? warning.compId,
        ),
      ],
      solverDiagnostics: result.diagnostics,
      componentStates: result.componentStates,
      currents: result.currents,
      voltages: result.nodeVoltages,
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
  solve: () => ({
    ok: false,
    provider: "fastapi",
    diagnostics: ["FastAPI provider hub not configured"],
    solverDiagnostics: null,
    componentStates: {},
    currents: {},
    voltages: {},
  }),
}

export const simulationProviders: Record<ProviderId, SimulationProvider> = {
  local: localProvider,
  fastapi: fastapiProvider,
}

export function providerStatus(id: ProviderId): ProviderStatus {
  return simulationProviders[id].status()
}

export function solveWithProvider(id: ProviderId, request: SolverRequest): SolverResult {
  return simulationProviders[id].solve(request)
}
