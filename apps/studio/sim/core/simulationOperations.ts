import type { ProviderId, ProviderMode } from "../providers/simulationProviders"
import type { SimulationProbeInstrumentId, SimulationRunInstrumentId } from "./instrumentContract"
import {
  simulationRuntimeBoardIds,
  type SimulationMicrocontrollerBoardId,
} from "./runtimeScopeContract"
import type {
  SimulationComponent,
  SimulationComponentPin,
  SimulationPoint,
  SimulationPose,
  SimulationWirePath,
} from "./simulationScene"

export const SIMULATION_OPERATION_KINDS = [
  "place-component",
  "move-component",
  "rotate-component",
  "connect-wire",
  "edit-wire",
  "delete",
  "set-value",
  "probe",
  "run",
  "stop",
] as const

export type SimulationOperationKind = (typeof SIMULATION_OPERATION_KINDS)[number]

export type SimulationOperationActor = "manual" | "ai" | "system"
export type SimulationOperationOrigin = "toolbar" | "canvas" | "keyboard" | "llm" | "automation"

export type SimulationOperationComponentDescriptor = {
  id: string
  type: string
  label?: string
  attrs?: SimulationComponent["attrs"]
  pins?: SimulationComponentPin[]
}

export type SimulationOperationWireDescriptor = {
  id: string
  from: string
  to: string
  color: string
  path?: SimulationWirePath
}

export type SimulationOperationValue = string | number | boolean

export type PlaceComponentOperation = {
  kind: "place-component"
  component: SimulationOperationComponentDescriptor
  pose: SimulationPose
  pinAssignments?: Record<string, string>
}

export type MoveComponentOperation = {
  kind: "move-component"
  componentId: string
  pose: SimulationPose
}

export type RotateComponentOperation = {
  kind: "rotate-component"
  componentId: string
  rotation: number
}

export type ConnectWireOperation = {
  kind: "connect-wire"
  wire: SimulationOperationWireDescriptor
}

export type EditWireOperation =
  | {
      kind: "edit-wire"
      wireId: string
      edit: {
        kind: "move-waypoint"
        pointIndex: number
        point: SimulationPoint
      }
    }
  | {
      kind: "edit-wire"
      wireId: string
      edit: {
        kind: "retarget-endpoint"
        side: "from" | "to"
        endpoint: string
      }
    }
  | {
      kind: "edit-wire"
      wireId: string
      edit: {
        kind: "replace-path"
        path: SimulationWirePath
      }
    }

export type DeleteSimulationOperation = {
  kind: "delete"
  target: {
    kind: "component" | "wire"
    id: string
  }
}

export type SetValueOperation = {
  kind: "set-value"
  componentId: string
  field: string
  value: SimulationOperationValue
}

export type ProbeOperation = {
  kind: "probe"
  probeId: string
  instrumentId?: SimulationProbeInstrumentId
  positiveRef: string
  negativeRef?: string
  currentRef?: string
}

export type RunOperation = {
  kind: "run"
  boardId?: SimulationMicrocontrollerBoardId
  sketchRef?: string
  instrumentId?: SimulationRunInstrumentId
}

export type StopOperation = {
  kind: "stop"
  reason?: string
}

export type SimulationOperation =
  | PlaceComponentOperation
  | MoveComponentOperation
  | RotateComponentOperation
  | ConnectWireOperation
  | EditWireOperation
  | DeleteSimulationOperation
  | SetValueOperation
  | ProbeOperation
  | RunOperation
  | StopOperation

export type SimulationOperationEnvelope = {
  schema: "simulation-operation/1"
  id: string
  actor: SimulationOperationActor
  origin: SimulationOperationOrigin
  targetProvider: ProviderId
  providerMode: ProviderMode
  operation: SimulationOperation
}

export const SIMULATION_OPERATION_PIPELINE = [
  "parse-structured-operation",
  "authorize-operation-origin",
  "apply-scene-patch",
  "validateSimulationScene",
  "placementSnapshotFromScene",
  "applyPlacementEngineAdapterOperation",
  "analyzeBreadboardOccupancy",
  "analyzePinVocabulary",
  "providerCapabilityProfile",
  "solveWithProvider",
  "emit-diagnostics",
] as const

export type SimulationOperationPipelineStep = (typeof SIMULATION_OPERATION_PIPELINE)[number]

export const SIMULATION_OPERATION_FORBIDDEN_MUTATION_TARGETS = [
  "dom-node",
  "canvas-pixel",
  "react-handler-ref",
  "window.__ELAB_API",
  "legacy-azione-tag",
] as const

export type SimulationOperationForbiddenMutationTarget =
  (typeof SIMULATION_OPERATION_FORBIDDEN_MUTATION_TARGETS)[number]

export const SIMULATION_OPERATION_CONTRACT = {
  schema: "simulation-operation-contract/1",
  envelopeSchema: "simulation-operation/1",
  operationKinds: SIMULATION_OPERATION_KINDS,
  manualAndAiSharePipeline: true,
  requiredPipeline: SIMULATION_OPERATION_PIPELINE,
  forbiddenMutationTargets: SIMULATION_OPERATION_FORBIDDEN_MUTATION_TARGETS,
  requiredOutputs: [
    "simulation-scene-patch",
    "provider-diagnostics",
    "instrument-diagnostics",
    "instrument-readings",
    "operation-diagnostics",
  ],
} as const

export type SimulationOperationIssueCode =
  | "invalid-schema"
  | "invalid-actor"
  | "invalid-origin"
  | "invalid-operation-payload"
  | "missing-operation"
  | "missing-provider"
  | "unknown-operation-kind"
  | "dom-mutation-forbidden"
  | "legacy-operation-format"

export type SimulationOperationIssue = {
  code: SimulationOperationIssueCode
  path: string
  message: string
}

export type SimulationOperationReport = {
  ok: boolean
  issues: SimulationOperationIssue[]
}

const SIMULATION_OPERATION_ACTORS = ["manual", "ai", "system"] as const satisfies
  SimulationOperationActor[]
const SIMULATION_OPERATION_ORIGINS = [
  "toolbar",
  "canvas",
  "keyboard",
  "llm",
  "automation",
] as const satisfies SimulationOperationOrigin[]
const PROVIDER_IDS = ["local", "fastapi", "ngspice-wasm"] as const satisfies ProviderId[]
const PROVIDER_MODES = ["static", "run"] as const satisfies ProviderMode[]
const PROBE_INSTRUMENT_IDS = [
  "ammeter",
  "logic-probe",
  "probe",
  "voltmeter",
] as const satisfies SimulationProbeInstrumentId[]
const RUN_INSTRUMENT_IDS = [
  "custom-chip",
  "oscilloscope",
  "serial-monitor",
  "serial-plotter",
  "spice-transient",
] as const satisfies SimulationRunInstrumentId[]
const RUNTIME_BOARD_IDS = simulationRuntimeBoardIds()

const FORBIDDEN_DOM_MUTATION_KEYS = new Set([
  "domNode",
  "dom-node",
  "element",
  "htmlElement",
  "selector",
  "event",
  "clientX",
  "clientY",
  "pageX",
  "pageY",
  "screenX",
  "screenY",
  "canvasContext",
  "handlerRef",
  "reactHandler",
  "innerHTML",
  "outerHTML",
  "window.__ELAB_API",
])

export function operationPipelineFor(
  operationKind: SimulationOperationKind,
): SimulationOperationPipelineStep[] {
  void operationKind
  return [...SIMULATION_OPERATION_PIPELINE]
}

export function validateSimulationOperationEnvelope(
  envelope: unknown,
): SimulationOperationReport {
  const issues: SimulationOperationIssue[] = []

  if (!isRecord(envelope)) {
    return {
      ok: false,
      issues: [
        {
          code: "invalid-schema",
          path: "envelope",
          message: "operation envelope must be an object",
        },
      ],
    }
  }

  if (envelope.schema !== SIMULATION_OPERATION_CONTRACT.envelopeSchema) {
    issues.push({
      code: "invalid-schema",
      path: "schema",
      message: "operation envelope schema must be simulation-operation/1",
    })
  }

  if (!isOneOf(envelope.actor, SIMULATION_OPERATION_ACTORS)) {
    issues.push({
      code: "invalid-actor",
      path: "actor",
      message: "operation actor must be manual, ai, or system",
    })
  }

  if (!isOneOf(envelope.origin, SIMULATION_OPERATION_ORIGINS)) {
    issues.push({
      code: "invalid-origin",
      path: "origin",
      message: "operation origin must be toolbar, canvas, keyboard, llm, or automation",
    })
  }

  if (
    !isOneOf(envelope.targetProvider, PROVIDER_IDS) ||
    !isOneOf(envelope.providerMode, PROVIDER_MODES)
  ) {
    issues.push({
      code: "missing-provider",
      path: "targetProvider",
      message: "operation must name a provider id and provider mode",
    })
  }

  const operation = envelope.operation
  if (!isRecord(operation)) {
    issues.push({
      code: "missing-operation",
      path: "operation",
      message: "operation payload must be an object",
    })
  } else {
    if (!isOneOf(operation.kind, SIMULATION_OPERATION_KINDS)) {
      issues.push({
        code: "unknown-operation-kind",
        path: "operation.kind",
        message: "operation kind is not in the simulator operation vocabulary",
      })
    } else {
      issues.push(...validateOperationPayload(operation.kind, operation))
    }
    issues.push(...collectForbiddenMutationIssues(operation, "operation"))
  }

  return { ok: issues.length === 0, issues }
}

function validateOperationPayload(
  kind: SimulationOperationKind,
  operation: Record<string, unknown>,
): SimulationOperationIssue[] {
  switch (kind) {
    case "place-component":
      return [
        ...requireComponentDescriptor(operation.component, "operation.component"),
        ...requirePose(operation.pose, "operation.pose"),
      ]
    case "move-component":
      return [
        ...requireString(operation.componentId, "operation.componentId"),
        ...requirePose(operation.pose, "operation.pose"),
      ]
    case "rotate-component":
      return [
        ...requireString(operation.componentId, "operation.componentId"),
        ...requireNumber(operation.rotation, "operation.rotation"),
      ]
    case "connect-wire":
      return requireWireDescriptor(operation.wire, "operation.wire")
    case "edit-wire":
      return requireEditWirePayload(operation)
    case "delete":
      return requireDeleteTarget(operation.target, "operation.target")
    case "set-value":
      return [
        ...requireString(operation.componentId, "operation.componentId"),
        ...requireString(operation.field, "operation.field"),
        ...requirePrimitiveValue(operation.value, "operation.value"),
      ]
    case "probe":
      return [
        ...requireString(operation.probeId, "operation.probeId"),
        ...(operation.instrumentId === undefined
          ? []
          : !isOneOf(operation.instrumentId, PROBE_INSTRUMENT_IDS)
            ? invalidPayload(
                "operation.instrumentId",
                "probe instrumentId must be ammeter, logic-probe, probe, or voltmeter",
              )
            : []),
        ...requireString(operation.positiveRef, "operation.positiveRef"),
        ...(operation.negativeRef === undefined
          ? []
          : requireString(operation.negativeRef, "operation.negativeRef")),
        ...(operation.currentRef === undefined
          ? []
          : requireString(operation.currentRef, "operation.currentRef")),
      ]
    case "run":
      return [
        ...(operation.instrumentId === undefined
          ? []
          : !isOneOf(operation.instrumentId, RUN_INSTRUMENT_IDS)
            ? invalidPayload(
                "operation.instrumentId",
                "run instrumentId must be custom-chip, oscilloscope, serial-monitor, serial-plotter, or spice-transient",
              )
            : []),
        ...(operation.boardId === undefined
          ? []
          : !isOneOf(operation.boardId, RUNTIME_BOARD_IDS)
            ? invalidPayload("operation.boardId", "run boardId is not supported")
            : []),
        ...(operation.sketchRef === undefined
          ? []
          : requireString(operation.sketchRef, "operation.sketchRef")),
      ]
    case "stop":
      return operation.reason === undefined ? [] : requireString(operation.reason, "operation.reason")
  }
}

function requireEditWirePayload(operation: Record<string, unknown>): SimulationOperationIssue[] {
  const issues = [...requireString(operation.wireId, "operation.wireId")]
  if (!isRecord(operation.edit)) {
    return [...issues, ...invalidPayload("operation.edit", "wire edit must be an object")]
  }
  if (operation.edit.kind === "move-waypoint") {
      return [
        ...issues,
        ...requireNumber(operation.edit.pointIndex, "operation.edit.pointIndex"),
        ...requirePoint(operation.edit.point, "operation.edit.point"),
      ]
  }
  if (operation.edit.kind === "retarget-endpoint") {
    return [
      ...issues,
      ...(!isOneOf(operation.edit.side, ["from", "to"] as const)
        ? invalidPayload("operation.edit.side", "wire endpoint side must be from or to")
        : []),
      ...requireString(operation.edit.endpoint, "operation.edit.endpoint"),
    ]
  }
  if (operation.edit.kind === "replace-path") {
    return [
      ...issues,
      ...requireWirePath(operation.edit.path, "operation.edit.path"),
    ]
  }
  return [
    ...issues,
    ...invalidPayload(
      "operation.edit.kind",
      "wire edit kind must be move-waypoint, retarget-endpoint, or replace-path",
    ),
  ]
}

function requireComponentDescriptor(
  value: unknown,
  path: string,
): SimulationOperationIssue[] {
  if (!isRecord(value)) return invalidPayload(path, "component descriptor must be an object")
  return [
    ...requireString(value.id, `${path}.id`),
    ...requireString(value.type, `${path}.type`),
  ]
}

function requireWireDescriptor(value: unknown, path: string): SimulationOperationIssue[] {
  if (!isRecord(value)) return invalidPayload(path, "wire descriptor must be an object")
  return [
    ...requireString(value.id, `${path}.id`),
    ...requireString(value.from, `${path}.from`),
    ...requireString(value.to, `${path}.to`),
    ...requireString(value.color, `${path}.color`),
  ]
}

function requireDeleteTarget(value: unknown, path: string): SimulationOperationIssue[] {
  if (!isRecord(value)) return invalidPayload(path, "delete target must be an object")
  return [
    ...(!isOneOf(value.kind, ["component", "wire"] as const)
      ? invalidPayload(`${path}.kind`, "delete target kind must be component or wire")
      : []),
    ...requireString(value.id, `${path}.id`),
  ]
}

function requirePose(value: unknown, path: string): SimulationOperationIssue[] {
  if (!isRecord(value)) return invalidPayload(path, "pose must be an object")
  return [
    ...requireNumber(value.x, `${path}.x`),
    ...requireNumber(value.y, `${path}.y`),
    ...(value.rotation === undefined ? [] : requireNumber(value.rotation, `${path}.rotation`)),
  ]
}

function requirePoint(value: unknown, path: string): SimulationOperationIssue[] {
  if (!isRecord(value)) return invalidPayload(path, "point must be an object")
  return [
    ...requireNumber(value.x, `${path}.x`),
    ...requireNumber(value.y, `${path}.y`),
  ]
}

function requireWirePath(value: unknown, path: string): SimulationOperationIssue[] {
  if (!isRecord(value)) return invalidPayload(path, "wire path must be an object")
  const issues: SimulationOperationIssue[] = []
  if (!isOneOf(value.kind, ["orthogonal", "polyline"] as const)) {
    issues.push(...invalidPayload(`${path}.kind`, "wire path kind must be orthogonal or polyline"))
  }
  if (!Array.isArray(value.points) || value.points.length < 2) {
    issues.push(...invalidPayload(`${path}.points`, "wire path requires at least two points"))
  } else {
    value.points.forEach((point, index) => {
      issues.push(...requirePoint(point, `${path}.points.${index}`))
    })
  }
  return issues
}

function requireString(value: unknown, path: string): SimulationOperationIssue[] {
  if (typeof value === "string" && value.trim() !== "") return []
  return invalidPayload(path, "value must be a non-empty string")
}

function requireNumber(value: unknown, path: string): SimulationOperationIssue[] {
  if (typeof value === "number" && Number.isFinite(value)) return []
  return invalidPayload(path, "value must be a finite number")
}

function requirePrimitiveValue(value: unknown, path: string): SimulationOperationIssue[] {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return []
  }
  return invalidPayload(path, "value must be string, number, or boolean")
}

function invalidPayload(path: string, message: string): SimulationOperationIssue[] {
  return [{ code: "invalid-operation-payload", path, message }]
}

function collectForbiddenMutationIssues(
  value: unknown,
  path: string,
): SimulationOperationIssue[] {
  const issues: SimulationOperationIssue[] = []

  if (typeof value === "string" && value.trim().toUpperCase().startsWith("[AZIONE:")) {
    issues.push({
      code: "legacy-operation-format",
      path,
      message: "legacy AZIONE strings are not valid simulator operations",
    })
    return issues
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      issues.push(...collectForbiddenMutationIssues(item, `${path}.${index}`))
    })
    return issues
  }

  if (!isRecord(value)) return issues

  Object.entries(value).forEach(([key, child]) => {
    const childPath = `${path}.${key}`
    if (FORBIDDEN_DOM_MUTATION_KEYS.has(key)) {
      issues.push({
        code: "dom-mutation-forbidden",
        path: childPath,
        message: "operation payloads may not target DOM, canvas, or handler references",
      })
    }
    issues.push(...collectForbiddenMutationIssues(child, childPath))
  })

  return issues
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
}
