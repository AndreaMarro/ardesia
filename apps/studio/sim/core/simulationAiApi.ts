import type { ProviderId, ProviderMode, SceneForSolve } from "../providers/simulationProviders"
import {
  applySimulationRuntimeOperation,
  loadSimulationRuntimeScene,
  readSimulationRuntimeDiagnostics,
  solveSimulationRuntimeProvider,
  type SimulationRuntimeDiagnosticsSnapshot,
  type SimulationRuntimeOperationResult,
  type SimulationRuntimeProviderResult,
  type SimulationRuntimeState,
} from "./simulationRuntime"
import type {
  SimulationOperationEnvelope,
  SimulationOperationOrigin,
  SimulationOperationWireDescriptor,
} from "./simulationOperations"
import type { SimulationProbeInstrumentId, SimulationRunInstrumentId } from "./instrumentContract"
import type { SimulationMicrocontrollerBoardId } from "./runtimeScopeContract"
import type {
  SimulationComponentPin,
  SimulationPoint,
  SimulationPose,
  SimulationWirePath,
} from "./simulationScene"

export const SIMULATION_AI_API_VERSION = "simulation-ai-api/1" as const

export type SimulationAiCommandContext = {
  state: SimulationRuntimeState
  operationId?: string
  origin?: SimulationOperationOrigin
  targetProvider?: ProviderId
  providerMode?: ProviderMode
}

export type AddComponentInput = {
  id: string
  type: string
  label?: string
  value?: number
  color?: string
  attrs?: Record<string, string | number | boolean>
  pins?: SimulationComponentPin[]
  pose: SimulationPose
  pinAssignments?: Record<string, string>
}

export type MoveComponentInput = {
  componentId: string
  pose: SimulationPose
}

export type RotateComponentInput = {
  componentId: string
  rotation: number
}

export type ConnectPinsInput = SimulationOperationWireDescriptor

export type MoveWireWaypointInput = {
  wireId: string
  pointIndex: number
  point: SimulationPoint
}

export type RetargetWireEndpointInput = {
  wireId: string
  side: "from" | "to"
  endpoint: string
}

export type ReplaceWirePathInput = {
  wireId: string
  path: SimulationWirePath
}

export type DeleteTargetInput = {
  kind: "component" | "wire"
  id: string
}

export type SetValueInput = {
  componentId: string
  field: string
  value: string | number | boolean
}

export type ProbeInput = {
  probeId: string
  instrumentId?: SimulationProbeInstrumentId
  positiveRef: string
  negativeRef?: string
  currentRef?: string
}

export type RunRuntimeInput = {
  boardId?: SimulationMicrocontrollerBoardId
  sketchRef?: string
}

export type RunInstrumentInput = RunRuntimeInput & {
  instrumentId: SimulationRunInstrumentId
}

export type LoadExperimentInput = {
  instanceId: string
  scene: SceneForSolve
  diagnostics?: string[]
}

export type RunSolveInput = {
  provider?: ProviderId
  mode?: ProviderMode
}

export type CompareToTargetResult = {
  ok: boolean
  missingComponents: string[]
  extraComponents: string[]
  missingConnections: string[]
  extraConnections: string[]
  pinMismatches: Array<{ pin: string; expected: string; actual: string | null }>
}

export function loadExperiment(input: LoadExperimentInput): SimulationRuntimeState {
  return loadSimulationRuntimeScene(input)
}

export function addComponent(
  context: SimulationAiCommandContext,
  input: AddComponentInput,
): SimulationRuntimeOperationResult {
  const attrs = {
    ...(input.attrs ?? {}),
    ...(input.value === undefined ? {} : { value: input.value }),
    ...(input.color === undefined ? {} : { color: input.color }),
  }
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "addComponent", {
      kind: "place-component",
      component: {
        id: input.id,
        type: input.type,
        ...(input.label === undefined ? {} : { label: input.label }),
        ...(Object.keys(attrs).length === 0 ? {} : { attrs }),
        ...(input.pins === undefined ? {} : { pins: input.pins.map((pin) => ({ ...pin })) }),
      },
      pose: { ...input.pose },
      ...(input.pinAssignments === undefined
        ? {}
        : { pinAssignments: { ...input.pinAssignments } }),
    }),
  )
}

export function moveComponent(
  context: SimulationAiCommandContext,
  input: MoveComponentInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "moveComponent", {
      kind: "move-component",
      componentId: input.componentId,
      pose: { ...input.pose },
    }),
  )
}

export function rotateComponent(
  context: SimulationAiCommandContext,
  input: RotateComponentInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "rotateComponent", {
      kind: "rotate-component",
      componentId: input.componentId,
      rotation: input.rotation,
    }),
  )
}

export function connectPins(
  context: SimulationAiCommandContext,
  input: ConnectPinsInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "connectPins", {
      kind: "connect-wire",
      wire: cloneWire(input),
    }),
  )
}

export function moveWireWaypoint(
  context: SimulationAiCommandContext,
  input: MoveWireWaypointInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "moveWireWaypoint", {
      kind: "edit-wire",
      wireId: input.wireId,
      edit: {
        kind: "move-waypoint",
        pointIndex: input.pointIndex,
        point: { ...input.point },
      },
    }),
  )
}

export function retargetWireEndpoint(
  context: SimulationAiCommandContext,
  input: RetargetWireEndpointInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "retargetWireEndpoint", {
      kind: "edit-wire",
      wireId: input.wireId,
      edit: {
        kind: "retarget-endpoint",
        side: input.side,
        endpoint: input.endpoint,
      },
    }),
  )
}

export function replaceWirePath(
  context: SimulationAiCommandContext,
  input: ReplaceWirePathInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "replaceWirePath", {
      kind: "edit-wire",
      wireId: input.wireId,
      edit: {
        kind: "replace-path",
        path: clonePath(input.path),
      },
    }),
  )
}

export function deleteTarget(
  context: SimulationAiCommandContext,
  input: DeleteTargetInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "deleteTarget", {
      kind: "delete",
      target: { ...input },
    }),
  )
}

export function setValue(
  context: SimulationAiCommandContext,
  input: SetValueInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "setValue", {
      kind: "set-value",
      componentId: input.componentId,
      field: input.field,
      value: input.value,
    }),
  )
}

export function probe(
  context: SimulationAiCommandContext,
  input: ProbeInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "probe", {
      kind: "probe",
      probeId: input.probeId,
      ...(input.instrumentId === undefined ? {} : { instrumentId: input.instrumentId }),
      positiveRef: input.positiveRef,
      ...(input.negativeRef === undefined ? {} : { negativeRef: input.negativeRef }),
      ...(input.currentRef === undefined ? {} : { currentRef: input.currentRef }),
    }),
  )
}

export function runRuntime(
  context: SimulationAiCommandContext,
  input: RunRuntimeInput = {},
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "runRuntime", {
      kind: "run",
      ...(input.boardId === undefined ? {} : { boardId: input.boardId }),
      ...(input.sketchRef === undefined ? {} : { sketchRef: input.sketchRef }),
    }),
  )
}

export function runInstrument(
  context: SimulationAiCommandContext,
  input: RunInstrumentInput,
): SimulationRuntimeOperationResult {
  return applySimulationRuntimeOperation(
    context.state,
    envelope(context, "runInstrument", {
      kind: "run",
      instrumentId: input.instrumentId,
      ...(input.boardId === undefined ? {} : { boardId: input.boardId }),
      ...(input.sketchRef === undefined ? {} : { sketchRef: input.sketchRef }),
    }),
  )
}

export function runSolve(
  state: SimulationRuntimeState,
  input: RunSolveInput = {},
): SimulationRuntimeProviderResult {
  return solveSimulationRuntimeProvider(state, {
    provider: input.provider ?? "local",
    mode: input.mode ?? "static",
  })
}

export function diagnose(state: SimulationRuntimeState): SimulationRuntimeDiagnosticsSnapshot {
  return readSimulationRuntimeDiagnostics(state)
}

export function compareToTarget(
  state: SimulationRuntimeState,
  target: SceneForSolve,
): CompareToTargetResult {
  const actualComponents = componentSignatures(state.scene)
  const targetComponents = componentSignatures(target)
  const actualConnections = connectionSignatures(state.scene)
  const targetConnections = connectionSignatures(target)
  const pinMismatches = Object.entries(target.pinAssignments ?? {})
    .map(([pin, expected]) => ({
      pin,
      expected,
      actual: state.scene.pinAssignments?.[pin] ?? null,
    }))
    .filter((entry) => entry.actual !== entry.expected)

  const result = {
    missingComponents: difference(targetComponents, actualComponents),
    extraComponents: difference(actualComponents, targetComponents),
    missingConnections: difference(targetConnections, actualConnections),
    extraConnections: difference(actualConnections, targetConnections),
    pinMismatches,
  }

  return {
    ok:
      result.missingComponents.length === 0 &&
      result.extraComponents.length === 0 &&
      result.missingConnections.length === 0 &&
      result.extraConnections.length === 0 &&
      result.pinMismatches.length === 0,
    ...result,
  }
}

function envelope(
  context: SimulationAiCommandContext,
  name: string,
  operation: SimulationOperationEnvelope["operation"],
): SimulationOperationEnvelope {
  return {
    schema: "simulation-operation/1",
    id: context.operationId ?? `ai:${name}:${operation.kind}`,
    actor: "ai",
    origin: context.origin ?? "llm",
    targetProvider: context.targetProvider ?? "local",
    providerMode: context.providerMode ?? "static",
    operation,
  }
}

function cloneWire(input: ConnectPinsInput): ConnectPinsInput {
  return {
    id: input.id,
    from: input.from,
    to: input.to,
    color: input.color,
    ...(input.path === undefined ? {} : { path: clonePath(input.path) }),
  }
}

function clonePath(path: SimulationWirePath): SimulationWirePath {
  return {
    kind: path.kind,
    points: path.points.map((point) => ({ ...point })),
    ...(path.sourceInstructions === undefined
      ? {}
      : { sourceInstructions: [...path.sourceInstructions] }),
  }
}

function componentSignatures(scene: SceneForSolve): string[] {
  return [...(scene.components ?? [])]
    .map((component) => `${component.id}:${component.type}`)
    .sort((a, b) => a.localeCompare(b))
}

function connectionSignatures(scene: SceneForSolve): string[] {
  return [...(scene.connections ?? [])]
    .map((connection) => `${connection.from}->${connection.to}:${connection.color ?? ""}`)
    .sort((a, b) => a.localeCompare(b))
}

function difference(expected: readonly string[], actual: readonly string[]): string[] {
  const actualSet = new Set(actual)
  return expected.filter((item) => !actualSet.has(item))
}
