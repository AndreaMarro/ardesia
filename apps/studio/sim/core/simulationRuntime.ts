import {
  SIMULATION_OPERATION_CONTRACT,
  validateSimulationOperationEnvelope,
  type SimulationOperationEnvelope,
  type SimulationOperationReport,
} from "./simulationOperations"
import {
  providerStatus,
  solveWithProvider,
  type ProviderDiagnostic,
  type ProviderId,
  type ProviderMode,
  type ProviderStatus,
  type SceneForSolve,
  type SolverResult,
} from "../providers/simulationProviders"
import {
  runSimulationPlacementPipeline,
  type RuntimePlacementPipelineResult,
  type RuntimePlacementValidationStep,
} from "./simulationPlacementPipeline"
import {
  evaluateSimulationInstrumentCapability,
  evaluateSimulationInstrumentReading,
  type SimulationInstrumentDiagnostic,
  type SimulationInstrumentReading,
  type SimulationInstrumentReadingResult,
} from "./instrumentContract"
import {
  evaluateSimulationRuntimeScope,
  type SimulationRuntimeScopeDiagnostic,
  type SimulationRuntimeScopeResult,
} from "./runtimeScopeContract"

export const SIMULATION_RUNTIME_PLUGIN_ID = "io.ardesia.simulation" as const
export const SIMULATION_RUNTIME_API_VERSION = "simulation-runtime/1" as const
export const SIMULATION_RUNTIME_STATE_SCHEMA = "simulation-runtime-state/1" as const
export const SIMULATION_RUNTIME_PROVIDER_REQUEST_SCHEMA =
  "simulation-provider-request/1" as const

export const SIMULATION_RUNTIME_CAPABILITIES = [
  "load-scene",
  "apply-operation",
  "solve-provider",
  "read-diagnostics",
  "serialize-state",
] as const

export type SimulationRuntimeCapability = (typeof SIMULATION_RUNTIME_CAPABILITIES)[number]

export type SimulationRuntimeProviderId = ProviderId
export type SimulationRuntimeProviderStatus = ProviderStatus
export type SimulationRuntimeSceneForSolve = SceneForSolve

export type SimulationRuntimeProviderRequest = {
  provider: ProviderId
  mode: ProviderMode
}

export type SimulationRuntimeState = {
  schema: typeof SIMULATION_RUNTIME_STATE_SCHEMA
  instanceId: string
  pluginId: typeof SIMULATION_RUNTIME_PLUGIN_ID
  scene: SceneForSolve
  diagnostics: string[]
  appliedOperations: SimulationOperationEnvelope[]
  lastSolverResult?: SolverResult
  lastPlacementResult?: RuntimePlacementPipelineResult
  lastInstrumentResult?: SimulationInstrumentReadingResult
  lastRuntimeScopeResult?: SimulationRuntimeScopeResult
}

export type SimulationRuntimeSerializedState = SimulationRuntimeState

export type SimulationRuntimeApiContract = {
  pluginId: typeof SIMULATION_RUNTIME_PLUGIN_ID
  apiVersion: typeof SIMULATION_RUNTIME_API_VERSION
  stateSchema: typeof SIMULATION_RUNTIME_STATE_SCHEMA
  operationEnvelopeSchema: typeof SIMULATION_OPERATION_CONTRACT.envelopeSchema
  providerRequestSchema: typeof SIMULATION_RUNTIME_PROVIDER_REQUEST_SCHEMA
  capabilities: SimulationRuntimeCapability[]
  methods: {
    loadScene: "loadSimulationRuntimeScene"
    applyOperation: "applySimulationRuntimeOperation"
    solveProvider: "solveSimulationRuntimeProvider"
    readDiagnostics: "readSimulationRuntimeDiagnostics"
    serializeState: "serializeSimulationRuntimeState"
  }
}

export type SimulationRuntimeLoadSceneInput = {
  instanceId: string
  scene: SceneForSolve
  diagnostics?: string[]
}

export type SimulationRuntimeOperationResult = {
  instanceId: string
  report: SimulationOperationReport
  diagnostics: string[]
  state: SimulationRuntimeState
  placement: RuntimePlacementPipelineResult | null
  instrument: SimulationInstrumentReadingResult | null
  runtimeScope: SimulationRuntimeScopeResult | null
}

export type SimulationRuntimeProviderResult = {
  instanceId: string
  result: SolverResult
  diagnostics: string[]
  state: SimulationRuntimeState
}

export type SimulationRuntimeDiagnosticsSnapshot = {
  instanceId: string
  provider: ProviderId | null
  messages: string[]
  providerDiagnostics: ProviderDiagnostic[]
  solverDiagnostics: SolverResult["solverDiagnostics"]
  placementDiagnostics: string[]
  placementPipeline: RuntimePlacementValidationStep[]
  instrumentDiagnostics: SimulationInstrumentDiagnostic[]
  instrumentReadings: SimulationInstrumentReading[]
  runtimeScopeDiagnostics: SimulationRuntimeScopeDiagnostic[]
}

export function describeSimulationRuntimeApi(): SimulationRuntimeApiContract {
  return {
    pluginId: SIMULATION_RUNTIME_PLUGIN_ID,
    apiVersion: SIMULATION_RUNTIME_API_VERSION,
    stateSchema: SIMULATION_RUNTIME_STATE_SCHEMA,
    operationEnvelopeSchema: SIMULATION_OPERATION_CONTRACT.envelopeSchema,
    providerRequestSchema: SIMULATION_RUNTIME_PROVIDER_REQUEST_SCHEMA,
    capabilities: [...SIMULATION_RUNTIME_CAPABILITIES],
    methods: {
      loadScene: "loadSimulationRuntimeScene",
      applyOperation: "applySimulationRuntimeOperation",
      solveProvider: "solveSimulationRuntimeProvider",
      readDiagnostics: "readSimulationRuntimeDiagnostics",
      serializeState: "serializeSimulationRuntimeState",
    },
  }
}

export function simulationRuntimeProviderStatus(
  id: SimulationRuntimeProviderId,
): SimulationRuntimeProviderStatus {
  return providerStatus(id)
}

export function loadSimulationRuntimeScene(
  input: SimulationRuntimeLoadSceneInput,
): SimulationRuntimeState {
  assertRuntimeInstanceId(input.instanceId)

  return {
    schema: SIMULATION_RUNTIME_STATE_SCHEMA,
    instanceId: input.instanceId,
    pluginId: SIMULATION_RUNTIME_PLUGIN_ID,
    scene: clonePlain(input.scene),
    diagnostics: [...(input.diagnostics ?? [])],
    appliedOperations: [],
  }
}

export function applySimulationRuntimeOperation(
  state: SimulationRuntimeState,
  envelope: SimulationOperationEnvelope,
): SimulationRuntimeOperationResult {
  assertRuntimeState(state)

  const report = validateSimulationOperationEnvelope(envelope)
  const baseState = cloneRuntimeState(state)
  const placementResult = report.ok && operationRequiresPlacement(envelope.operation.kind)
    ? runSimulationPlacementPipeline({
        instanceId: state.instanceId,
        scene: baseState.scene,
        operationEnvelope: envelope,
      })
    : null
  const operationAccepted = report.ok && (placementResult === null || placementResult.ok)
  const operationDiagnostics = operationDiagnosticsFor(
    state.instanceId,
    envelope,
    report,
    placementResult,
  )
  const appliedOperations = operationAccepted
    ? [...baseState.appliedOperations, clonePlain(envelope)]
    : baseState.appliedOperations
  const patchedScene =
    operationAccepted && placementResult !== null ? clonePlain(placementResult.scene) : baseState.scene
  const solverResult = operationAccepted
    ? placementResult?.providerResult ??
      solveWithProvider(envelope.targetProvider, {
        scene: clonePlain(patchedScene),
        provider: envelope.targetProvider,
        mode: envelope.providerMode,
      })
    : null
  const instrumentResult = instrumentResultFor(envelope, solverResult)
  const runtimeScopeResult = runtimeScopeFor(envelope, operationAccepted)
  const diagnostics = [
    ...baseState.diagnostics,
    ...operationDiagnostics,
    ...(placementResult?.diagnostics.map((diagnostic) => `placement: ${diagnostic}`) ?? []),
    ...(solverResult?.diagnostics ?? []),
    ...(instrumentResult?.diagnostics.map((diagnostic) => diagnostic.message) ?? []),
    ...(runtimeScopeResult?.diagnostics.map((diagnostic) => diagnostic.message) ?? []),
  ]
  const nextState: SimulationRuntimeState = {
    ...baseState,
    scene: patchedScene,
    diagnostics,
    appliedOperations,
    ...(solverResult === null ? {} : { lastSolverResult: clonePlain(solverResult) }),
    ...(placementResult === null ? {} : { lastPlacementResult: clonePlain(placementResult) }),
    ...(instrumentResult === null ? {} : { lastInstrumentResult: clonePlain(instrumentResult) }),
    ...(runtimeScopeResult === null
      ? {}
      : { lastRuntimeScopeResult: clonePlain(runtimeScopeResult) }),
  }

  return {
    instanceId: state.instanceId,
    report,
    diagnostics,
    state: nextState,
    placement: placementResult === null ? null : clonePlain(placementResult),
    instrument: instrumentResult === null ? null : clonePlain(instrumentResult),
    runtimeScope: runtimeScopeResult === null ? null : clonePlain(runtimeScopeResult),
  }
}

export function solveSimulationRuntimeProvider(
  state: SimulationRuntimeState,
  request: SimulationRuntimeProviderRequest,
): SimulationRuntimeProviderResult {
  assertRuntimeState(state)

  const result = solveWithProvider(request.provider, {
    scene: clonePlain(state.scene),
    provider: request.provider,
    mode: request.mode,
  })
  const baseState = cloneRuntimeState(state)
  const diagnostics = [...baseState.diagnostics, ...result.diagnostics]
  const nextState: SimulationRuntimeState = {
    ...baseState,
    diagnostics,
    lastSolverResult: clonePlain(result),
  }

  return {
    instanceId: state.instanceId,
    result: clonePlain(result),
    diagnostics,
    state: nextState,
  }
}

export function readSimulationRuntimeDiagnostics(
  state: SimulationRuntimeState,
): SimulationRuntimeDiagnosticsSnapshot {
  assertRuntimeState(state)

  return {
    instanceId: state.instanceId,
    provider: state.lastSolverResult?.provider ?? null,
    messages: [...state.diagnostics],
    providerDiagnostics: state.lastSolverResult
      ? clonePlain(state.lastSolverResult.providerDiagnostics)
      : [],
    solverDiagnostics: state.lastSolverResult
      ? clonePlain(state.lastSolverResult.solverDiagnostics)
      : null,
    placementDiagnostics: state.lastPlacementResult
      ? [...state.lastPlacementResult.diagnostics]
      : [],
    placementPipeline: state.lastPlacementResult
      ? state.lastPlacementResult.validationPipeline.map((step) => ({ ...step }))
      : [],
    instrumentDiagnostics: state.lastInstrumentResult
      ? clonePlain(state.lastInstrumentResult.diagnostics)
      : [],
    instrumentReadings: state.lastInstrumentResult
      ? clonePlain(state.lastInstrumentResult.readings)
      : [],
    runtimeScopeDiagnostics: state.lastRuntimeScopeResult
      ? clonePlain(state.lastRuntimeScopeResult.diagnostics)
      : [],
  }
}

export function serializeSimulationRuntimeState(
  state: SimulationRuntimeState,
): SimulationRuntimeSerializedState {
  assertRuntimeState(state)
  return cloneRuntimeState(state)
}

export function restoreSimulationRuntimeState(
  serialized: SimulationRuntimeSerializedState,
): SimulationRuntimeState {
  assertRuntimeState(serialized)
  return cloneRuntimeState(serialized)
}

function cloneRuntimeState(state: SimulationRuntimeState): SimulationRuntimeState {
  return {
    schema: SIMULATION_RUNTIME_STATE_SCHEMA,
    instanceId: state.instanceId,
    pluginId: SIMULATION_RUNTIME_PLUGIN_ID,
    scene: clonePlain(state.scene),
    diagnostics: [...state.diagnostics],
    appliedOperations: state.appliedOperations.map((operation) => clonePlain(operation)),
    ...(state.lastSolverResult === undefined
      ? {}
      : { lastSolverResult: clonePlain(state.lastSolverResult) }),
    ...(state.lastPlacementResult === undefined
      ? {}
      : { lastPlacementResult: clonePlain(state.lastPlacementResult) }),
    ...(state.lastInstrumentResult === undefined
      ? {}
      : { lastInstrumentResult: clonePlain(state.lastInstrumentResult) }),
    ...(state.lastRuntimeScopeResult === undefined
      ? {}
      : { lastRuntimeScopeResult: clonePlain(state.lastRuntimeScopeResult) }),
  }
}

function instrumentResultFor(
  envelope: SimulationOperationEnvelope,
  solverResult: SolverResult | null,
): SimulationInstrumentReadingResult | null {
  if (envelope.operation.kind === "run" && envelope.operation.instrumentId !== undefined) {
    return evaluateSimulationInstrumentCapability({
      instrumentId: envelope.operation.instrumentId,
      providerId: envelope.targetProvider,
      providerMode: envelope.providerMode,
    })
  }

  if (solverResult === null || envelope.operation.kind !== "probe") return null
  return evaluateSimulationInstrumentReading({
    instrumentId: envelope.operation.instrumentId ?? "probe",
    providerId: envelope.targetProvider,
    providerMode: envelope.providerMode,
    probeId: envelope.operation.probeId,
    positiveRef: envelope.operation.positiveRef,
    ...(envelope.operation.negativeRef === undefined
      ? {}
      : { negativeRef: envelope.operation.negativeRef }),
    ...(envelope.operation.currentRef === undefined
      ? {}
      : { currentRef: envelope.operation.currentRef }),
    solverResult,
  })
}

function runtimeScopeFor(
  envelope: SimulationOperationEnvelope,
  operationAccepted: boolean,
): SimulationRuntimeScopeResult | null {
  if (!operationAccepted || envelope.operation.kind !== "run") return null
  return evaluateSimulationRuntimeScope({
    ...(envelope.operation.boardId === undefined
      ? {}
      : { boardId: envelope.operation.boardId }),
    providerId: envelope.targetProvider,
    providerMode: envelope.providerMode,
  })
}

function operationDiagnosticsFor(
  instanceId: string,
  envelope: SimulationOperationEnvelope,
  report: SimulationOperationReport,
  placementResult: RuntimePlacementPipelineResult | null,
): string[] {
  if (!report.ok) return report.issues.map((issue) => `${issue.path}: ${issue.message}`)
  if (placementResult !== null && !placementResult.ok) {
    return [`operation ${envelope.id} rejected by placement pipeline for ${instanceId}`]
  }
  return [`operation ${envelope.id} accepted for ${instanceId}`]
}

function operationRequiresPlacement(
  kind: SimulationOperationEnvelope["operation"]["kind"],
): boolean {
  return [
    "place-component",
    "move-component",
    "rotate-component",
    "connect-wire",
    "edit-wire",
    "delete",
    "set-value",
  ].includes(kind)
}

function assertRuntimeState(state: SimulationRuntimeState): void {
  if (!isRecord(state)) {
    throw new Error("simulation runtime state must be an object")
  }
  if (state.schema !== SIMULATION_RUNTIME_STATE_SCHEMA) {
    throw new Error("simulation runtime state schema must be simulation-runtime-state/1")
  }
  if (state.pluginId !== SIMULATION_RUNTIME_PLUGIN_ID) {
    throw new Error("simulation runtime state must belong to io.ardesia.simulation")
  }
  assertRuntimeInstanceId(state.instanceId)
  if (!isRecord(state.scene)) {
    throw new Error("simulation runtime state must include a scene object")
  }
  if (!Array.isArray(state.diagnostics)) {
    throw new Error("simulation runtime state diagnostics must be an array")
  }
  if (!Array.isArray(state.appliedOperations)) {
    throw new Error("simulation runtime state applied operations must be an array")
  }
}

function assertRuntimeInstanceId(instanceId: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(instanceId)) {
    throw new Error("simulation runtime instanceId must be a stable non-empty id")
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
