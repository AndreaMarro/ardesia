import { analyzeBreadboardOccupancy } from "../breadboard/occupancy"
import { solveWithProvider, type SceneForSolve, type SolverResult } from "../providers/simulationProviders"
import { registerElectricalCatalog } from "../solver/catalog"
import { analyzePinVocabulary } from "../solver/pinVocabulary"
import { getSimulationComponentCatalogEntry } from "./componentCatalog"
import {
  type PlacementEngineSnapshot,
  type PlacementEngineValidationStep,
  type SimulationPlacementPatch,
} from "./placementEngineContract"
import {
  validateSimulationOperationEnvelope,
  type ConnectWireOperation,
  type DeleteSimulationOperation,
  type EditWireOperation,
  type MoveComponentOperation,
  type PlaceComponentOperation,
  type RotateComponentOperation,
  type SetValueOperation,
  type SimulationOperation,
  type SimulationOperationEnvelope,
} from "./simulationOperations"
import {
  validateSimulationScene,
  type SimulationComponent,
  type SimulationScene,
  type SimulationWire,
} from "./simulationScene"
import {
  moveSimulationWireWaypoint,
  replaceSimulationWirePath,
  retargetSimulationWireEndpoint,
} from "./simulationWireEditor"

export type PlacementEngineAdapterValidationResult = {
  step: PlacementEngineValidationStep
  ok: boolean
  skipped?: true
}

export type PlacementEngineAdapterInput = {
  scene: SimulationScene
  snapshot: PlacementEngineSnapshot
  operationEnvelope: unknown
}

export type PlacementEngineAdapterResult = {
  ok: boolean
  snapshot: PlacementEngineSnapshot
  patch: SimulationPlacementPatch
  validationPipeline: PlacementEngineAdapterValidationResult[]
  providerResult: SolverResult | null
  diagnostics: string[]
}

type PlacementOperationApplier = (
  scene: SimulationScene,
  operation: SimulationOperation,
) => SimulationScene

const SVG_ONLY_MUTATION_KEYS = new Set([
  "svgTransform",
  "svgPath",
  "pathData",
  "transform",
  "matrix",
])

const OPERATION_APPLIERS: Partial<Record<SimulationOperation["kind"], PlacementOperationApplier>> = {
  "place-component": (scene, operation) =>
    placeComponent(scene, operation as PlaceComponentOperation),
  "move-component": (scene, operation) =>
    moveComponent(scene, operation as MoveComponentOperation),
  "rotate-component": (scene, operation) =>
    rotateComponent(scene, operation as RotateComponentOperation),
  "connect-wire": (scene, operation) =>
    connectWire(scene, operation as ConnectWireOperation),
  "edit-wire": (scene, operation) => editWire(scene, operation as EditWireOperation),
  delete: (scene, operation) => deleteTarget(scene, operation as DeleteSimulationOperation),
  "set-value": (scene, operation) => setComponentValue(scene, operation as SetValueOperation),
  probe: cloneScene,
  run: cloneScene,
  stop: cloneScene,
}

export function applyPlacementEngineAdapterOperation(
  input: PlacementEngineAdapterInput,
): PlacementEngineAdapterResult {
  const baseScene = cloneScene(input.scene)
  const snapshot = cloneSnapshot(input.snapshot)
  const legacyDiagnostics = legacyOperationDiagnostics(input.operationEnvelope)
  if (legacyDiagnostics.length > 0) {
    return {
      ok: false,
      snapshot,
      patch: patchFromScene(baseScene, legacyDiagnostics),
      validationPipeline: [],
      providerResult: null,
      diagnostics: legacyDiagnostics,
    }
  }

  const operationReport = validateSimulationOperationEnvelope(input.operationEnvelope)
  const svgDiagnostics = svgOnlyMutationDiagnostics(input.operationEnvelope)
  const targetDiagnostics = operationReport.ok
    ? operationTargetDiagnostics(baseScene, (input.operationEnvelope as SimulationOperationEnvelope).operation)
    : []
  const operationDiagnostics = [
    ...operationReport.issues.map((issue) => issue.message),
    ...svgDiagnostics,
    ...targetDiagnostics,
  ]
  if (!operationReport.ok || operationDiagnostics.length > 0) {
    return {
      ok: false,
      snapshot,
      patch: patchFromScene(baseScene, operationDiagnostics),
      validationPipeline: [],
      providerResult: null,
      diagnostics: operationDiagnostics,
    }
  }

  const envelope = input.operationEnvelope as SimulationOperationEnvelope
  const patchedScene = applySceneOperation(baseScene, envelope.operation)
  const validation = validatePlacementPatch(patchedScene, envelope)
  return {
    ok: validation.pipeline.every((step) => step.ok),
    snapshot,
    patch: patchFromScene(patchedScene, validation.diagnostics),
    validationPipeline: validation.pipeline,
    providerResult: validation.providerResult,
    diagnostics: validation.diagnostics,
  }
}

function applySceneOperation(
  scene: SimulationScene,
  operation: SimulationOperation,
): SimulationScene {
  const applier = OPERATION_APPLIERS[operation.kind] ?? cloneScene
  return applier(scene, operation)
}

function placeComponent(
  scene: SimulationScene,
  operation: PlaceComponentOperation,
): SimulationScene {
  const component: SimulationComponent = {
    id: operation.component.id,
    type: operation.component.type,
    pose: { ...operation.pose },
    ...(operation.component.label !== undefined ? { label: operation.component.label } : {}),
    ...(operation.component.attrs !== undefined ? { attrs: { ...operation.component.attrs } } : {}),
    ...(operation.component.pins !== undefined
      ? { pins: operation.component.pins.map((pin) => ({ ...pin })) }
      : {}),
  }
  return {
    ...cloneScene(scene),
    components: [...cloneComponents(scene.components), component],
    pinAssignments: {
      ...(scene.pinAssignments ?? {}),
      ...(operation.pinAssignments ?? {}),
    },
  }
}

function moveComponent(scene: SimulationScene, operation: MoveComponentOperation): SimulationScene {
  return {
    ...cloneScene(scene),
    components: scene.components.map((component) =>
      component.id === operation.componentId
        ? { ...cloneComponent(component), pose: { ...operation.pose } }
        : cloneComponent(component),
    ),
  }
}

function rotateComponent(
  scene: SimulationScene,
  operation: RotateComponentOperation,
): SimulationScene {
  return {
    ...cloneScene(scene),
    components: scene.components.map((component) =>
      component.id === operation.componentId
        ? {
            ...cloneComponent(component),
            pose: { ...component.pose, rotation: operation.rotation },
          }
        : cloneComponent(component),
    ),
  }
}

function connectWire(scene: SimulationScene, operation: ConnectWireOperation): SimulationScene {
  return {
    ...cloneScene(scene),
    wires: [...cloneWires(scene.wires), cloneOperationWire(operation.wire)],
  }
}

function editWire(scene: SimulationScene, operation: EditWireOperation): SimulationScene {
  const result = wireEditResult(scene, operation)
  return result.ok ? result.scene : cloneScene(scene)
}

function wireEditResult(scene: SimulationScene, operation: EditWireOperation) {
  if (operation.edit.kind === "move-waypoint") {
    return moveSimulationWireWaypoint(scene, {
      wireId: operation.wireId,
      pointIndex: operation.edit.pointIndex,
      point: operation.edit.point,
    })
  }
  if (operation.edit.kind === "replace-path") {
    return replaceSimulationWirePath(scene, {
      wireId: operation.wireId,
      path: operation.edit.path,
    })
  }
  return retargetSimulationWireEndpoint(scene, {
    wireId: operation.wireId,
    side: operation.edit.side,
    endpoint: operation.edit.endpoint,
  })
}

function deleteTarget(scene: SimulationScene, operation: DeleteSimulationOperation): SimulationScene {
  const target = operation.target
  const cloned = cloneScene(scene)
  const componentPrefix = `${target.id}:`
  return {
    ...cloned,
    components:
      target.kind === "component"
        ? cloned.components.filter((component) => component.id !== target.id)
        : cloned.components,
    wires:
      target.kind === "wire"
        ? cloned.wires.filter((wire) => wire.id !== target.id)
        : cloned.wires.filter(
            (wire) => !wire.from.startsWith(componentPrefix) && !wire.to.startsWith(componentPrefix),
          ),
    pinAssignments:
      target.kind === "component"
        ? Object.fromEntries(
            Object.entries(cloned.pinAssignments ?? {}).filter(
              ([pin]) => !pin.startsWith(`${target.id}:`),
            ),
          )
        : cloned.pinAssignments,
  }
}

function setComponentValue(scene: SimulationScene, operation: SetValueOperation): SimulationScene {
  return {
    ...cloneScene(scene),
    components: scene.components.map((component) =>
      component.id === operation.componentId
        ? {
            ...cloneComponent(component),
            attrs: { ...(component.attrs ?? {}), [operation.field]: operation.value },
          }
        : cloneComponent(component),
    ),
  }
}

function validatePlacementPatch(
  scene: SimulationScene,
  envelope: SimulationOperationEnvelope,
): {
  pipeline: PlacementEngineAdapterValidationResult[]
  providerResult: SolverResult | null
  diagnostics: string[]
} {
  registerElectricalCatalog()
  const sceneReport = validateSimulationScene(scene)
  const occupancyReport = analyzeBreadboardOccupancy({
    pinAssignments: scene.pinAssignments ?? {},
    wires: scene.wires.map((wire) => ({ from: wire.from, to: wire.to })),
  })
  const pinVocabularyReport = analyzePinVocabulary(
    {
      components: scene.components.map((component) => ({
        id: component.id,
        type: component.type,
      })),
      wires: scene.wires.map((wire) => ({ from: wire.from, to: wire.to })),
      pinAssignments: scene.pinAssignments ?? {},
    },
    catalogPinResolver,
  )
  const structuralOk = sceneReport.ok && occupancyReport.ok && pinVocabularyReport.ok
  const diagnostics = [
    ...sceneReport.issues.map((issue) => issue.message),
    ...occupancyReport.conflicts.map(
      (conflict) =>
        `occupancy conflict at ${conflict.ref}: ${conflict.occupants
          .map((occupant) => occupant.at)
          .join(", ")}`,
    ),
    ...pinVocabularyReport.flags.map((flag) => pinVocabularyFlagMessage(flag)),
  ]
  if (!structuralOk) {
    return {
      pipeline: [
        { step: "validateSimulationScene", ok: sceneReport.ok },
        { step: "analyzeBreadboardOccupancy", ok: occupancyReport.ok },
        { step: "analyzePinVocabulary", ok: pinVocabularyReport.ok },
        { step: "activeSimulationProvider.solve", ok: false, skipped: true },
      ],
      providerResult: null,
      diagnostics,
    }
  }

  const providerResult = solveWithProvider(envelope.targetProvider, {
    scene: sceneForSolve(scene),
    provider: envelope.targetProvider,
    mode: envelope.providerMode,
  })
  const providerOk = providerResult.providerDiagnostics.every(
    (diagnostic) => diagnostic.severity !== "blocker",
  )
  return {
    pipeline: [
      { step: "validateSimulationScene", ok: true },
      { step: "analyzeBreadboardOccupancy", ok: true },
      { step: "analyzePinVocabulary", ok: true },
      { step: "activeSimulationProvider.solve", ok: providerOk },
    ],
    providerResult,
    diagnostics: [
      ...diagnostics,
      ...providerResult.providerDiagnostics
        .filter((diagnostic) => diagnostic.severity === "blocker")
        .map((diagnostic) => diagnostic.message),
    ],
  }
}

function sceneForSolve(scene: SimulationScene): SceneForSolve {
  return {
    components: scene.components.map((component) => ({
      id: component.id,
      type: component.type,
      ...(typeof component.attrs?.value === "number" ? { value: component.attrs.value } : {}),
      ...(typeof component.attrs?.color === "string" ? { color: component.attrs.color } : {}),
    })),
    connections: scene.wires.map((wire) => ({
      id: wire.id,
      from: wire.from,
      to: wire.to,
      color: wire.color,
      ...(wire.path === undefined
        ? {}
        : {
            path: {
              kind: wire.path.kind,
              points: wire.path.points.map((point) => ({ ...point })),
              ...(wire.path.sourceInstructions === undefined
                ? {}
                : { sourceInstructions: [...wire.path.sourceInstructions] }),
            },
          }),
    })),
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
  }
}

function legacyOperationDiagnostics(value: unknown): string[] {
  if (typeof value === "string" && value.trim().toUpperCase().startsWith("[AZIONE:")) {
    return ["legacy AZIONE strings are not valid placement operations"]
  }
  return []
}

function svgOnlyMutationDiagnostics(value: unknown): string[] {
  return containsSvgOnlyMutation(value)
    ? ["SVG-only placement mutation is not a structured simulator operation"]
    : []
}

function containsSvgOnlyMutation(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSvgOnlyMutation)
  if (!isRecord(value)) return false
  return Object.entries(value).some(
    ([key, child]) => SVG_ONLY_MUTATION_KEYS.has(key) || containsSvgOnlyMutation(child),
  )
}

function operationTargetDiagnostics(
  scene: SimulationScene,
  operation: SimulationOperation,
): string[] {
  const componentIds = new Set(scene.components.map((component) => component.id))
  const wireIds = new Set(scene.wires.map((wire) => wire.id))
  if (operation.kind === "move-component" && !componentIds.has(operation.componentId)) {
    return [`unknown component target: ${operation.componentId}`]
  }
  if (operation.kind === "rotate-component" && !componentIds.has(operation.componentId)) {
    return [`unknown component target: ${operation.componentId}`]
  }
  if (operation.kind === "set-value" && !componentIds.has(operation.componentId)) {
    return [`unknown component target: ${operation.componentId}`]
  }
  if (operation.kind === "delete" && operation.target.kind === "component" && !componentIds.has(operation.target.id)) {
    return [`unknown component target: ${operation.target.id}`]
  }
  if (operation.kind === "delete" && operation.target.kind === "wire" && !wireIds.has(operation.target.id)) {
    return [`unknown wire target: ${operation.target.id}`]
  }
  if (operation.kind === "edit-wire") {
    const result = wireEditResult(scene, operation)
    return result.ok ? [] : result.diagnostics
  }
  return []
}

function catalogPinResolver(type: string): ReadonlySet<string> | null {
  const entry = getSimulationComponentCatalogEntry(type)
  return entry === null ? null : new Set(entry.pins.map((pin) => pin.id))
}

function pinVocabularyFlagMessage(
  flag: ReturnType<typeof analyzePinVocabulary>["flags"][number],
): string {
  const messageByKind = {
    "component-unknown": `unknown component ${flag.componentId} at ${flag.at}`,
    "type-unregistered":
      "type" in flag
        ? `unregistered component type ${flag.type} for ${flag.componentId} at ${flag.at}`
        : "",
    "pin-unknown":
      "pin" in flag && "type" in flag
        ? `unknown pin ${flag.componentId}:${flag.pin} for type ${flag.type} at ${flag.at}`
        : "",
  } satisfies Record<typeof flag.kind, string>
  return messageByKind[flag.kind]
}

function patchFromScene(scene: SimulationScene, diagnostics: string[]): SimulationPlacementPatch {
  return {
    schema: "simulation-placement-patch/1",
    components: cloneComponents(scene.components),
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
    wires: cloneWires(scene.wires),
    diagnostics: [...diagnostics],
  }
}

function cloneScene(scene: SimulationScene): SimulationScene {
  return {
    schemaVersion: scene.schemaVersion,
    id: scene.id,
    title: scene.title,
    domain: scene.domain,
    ...(scene.breadboards !== undefined
      ? { breadboards: scene.breadboards.map((board) => ({ ...board })) }
      : {}),
    components: cloneComponents(scene.components),
    ...(scene.pinAssignments !== undefined ? { pinAssignments: { ...scene.pinAssignments } } : {}),
    wires: cloneWires(scene.wires),
    provenance: {
      source: { ...scene.provenance.source },
      ...(scene.provenance.derivedFrom !== undefined
        ? { derivedFrom: scene.provenance.derivedFrom.map((source) => ({ ...source })) }
        : {}),
    },
    adapters: {
      source: scene.adapters.source,
      solver: [...scene.adapters.solver],
    },
  }
}

function cloneSnapshot(snapshot: PlacementEngineSnapshot): PlacementEngineSnapshot {
  return {
    schema: snapshot.schema,
    components: snapshot.components.map((component) => ({
      id: component.id,
      type: component.type,
      ...(component.label !== undefined ? { label: component.label } : {}),
      ...(component.attrs !== undefined ? { attrs: { ...component.attrs } } : {}),
    })),
    layout: Object.fromEntries(
      Object.entries(snapshot.layout).map(([id, pose]) => [id, { ...pose }]),
    ),
    pinAssignments: { ...snapshot.pinAssignments },
    connections: snapshot.connections.map((connection) => ({ ...connection })),
  }
}

function cloneComponents(components: readonly SimulationComponent[]): SimulationComponent[] {
  return components.map(cloneComponent)
}

function cloneComponent(component: SimulationComponent): SimulationComponent {
  return {
    id: component.id,
    type: component.type,
    pose: { ...component.pose },
    ...(component.label !== undefined ? { label: component.label } : {}),
    ...(component.attrs !== undefined ? { attrs: { ...component.attrs } } : {}),
    ...(component.pins !== undefined
      ? { pins: component.pins.map((pin) => ({ ...pin })) }
      : {}),
  }
}

function cloneWires(wires: readonly SimulationWire[]): SimulationWire[] {
  return wires.map((wire) => ({
    id: wire.id,
    from: wire.from,
    to: wire.to,
    color: wire.color,
    ...(wire.path !== undefined
      ? {
          path: {
            kind: wire.path.kind,
            points: wire.path.points.map((point) => ({ ...point })),
            ...(wire.path.sourceInstructions !== undefined
              ? { sourceInstructions: [...wire.path.sourceInstructions] }
              : {}),
          },
        }
      : {}),
  }))
}

function cloneOperationWire(wire: ConnectWireOperation["wire"]): SimulationWire {
  return {
    id: wire.id,
    from: wire.from,
    to: wire.to,
    color: wire.color,
    ...(wire.path !== undefined
      ? {
          path: {
            kind: wire.path.kind,
            points: wire.path.points.map((point) => ({ ...point })),
            ...(wire.path.sourceInstructions !== undefined
              ? { sourceInstructions: [...wire.path.sourceInstructions] }
              : {}),
          },
        }
      : {}),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
