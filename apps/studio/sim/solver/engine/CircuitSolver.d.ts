// Superficie tipizzata minima del motore vendored (CircuitSolver.js resta
// byte-identico alla sorgente plugin; qui si dichiara solo ciò che il wrapper
// studio usa davvero — vedi elabSolver.ts).
export interface EngineComponentInput {
  id: string
  type: string
  value?: number
  color?: string | null
}

export interface EngineConnectionInput {
  from: string
  to: string
  color?: string
}

export interface EngineExperimentInput {
  components: EngineComponentInput[]
  connections?: EngineConnectionInput[]
  pinAssignments?: Record<string, string>
}

export interface EngineDiagnostics {
  shortCircuit: boolean
  disconnectedPins: Array<{ compId: string; pinName: string; pinRef: string }>
  overloadWarnings: Array<{ compId: string; type?: string; message?: string }>
}

export default class CircuitSolver {
  loadExperiment(experiment: EngineExperimentInput, options?: { preserveState?: boolean }): void
  solve(isTimeStep?: boolean): void
  getState(): Record<string, Record<string, unknown>>
  getDiagnostics(): EngineDiagnostics
  getComponentCurrents(): Record<string, number>
  getNodeVoltages(): Record<string, number>
  destroy(): void
}
