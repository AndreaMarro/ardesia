import { applyPlacementEngineAdapterOperation } from "./placementEngineAdapter"
import { placementSnapshotFromScene } from "./placementEngineContract"
import type { SimulationOperationEnvelope } from "./simulationOperations"
import type {
  SimulationBreadboardModel,
  SimulationComponent,
  SimulationScene,
  SimulationWire,
} from "./simulationScene"
import type { SceneForSolve, SolverResult } from "../providers/simulationProviders"

export type RuntimePlacementValidationStep = {
  step: string
  ok: boolean
  skipped?: true
}

export type RuntimePlacementPatch = {
  schema: "simulation-placement-patch/1"
  components: SimulationComponent[]
  pinAssignments: Record<string, string>
  wires: SimulationWire[]
  diagnostics: string[]
}

export type RuntimePlacementPipelineResult = {
  ok: boolean
  scene: SceneForSolve
  patch: RuntimePlacementPatch
  validationPipeline: RuntimePlacementValidationStep[]
  providerResult: SolverResult | null
  diagnostics: string[]
}

export function runSimulationPlacementPipeline(input: {
  instanceId: string
  scene: SceneForSolve
  operationEnvelope: SimulationOperationEnvelope
}): RuntimePlacementPipelineResult {
  const canonicalScene = runtimeSceneToSimulationScene(input.scene, input.instanceId)
  const result = applyPlacementEngineAdapterOperation({
    scene: canonicalScene,
    snapshot: placementSnapshotFromScene(canonicalScene),
    operationEnvelope: input.operationEnvelope,
  })
  const patch = {
    schema: result.patch.schema,
    components: result.patch.components,
    pinAssignments: result.patch.pinAssignments,
    wires: result.patch.wires,
    diagnostics: result.patch.diagnostics,
  }

  return {
    ok: result.ok,
    scene: result.ok ? runtimeSceneFromPatch(input.scene, patch) : clonePlain(input.scene),
    patch,
    validationPipeline: result.validationPipeline.map((step) => ({ ...step })),
    providerResult: result.providerResult === null ? null : clonePlain(result.providerResult),
    diagnostics: [...result.diagnostics],
  }
}

function runtimeSceneToSimulationScene(scene: SceneForSolve, instanceId: string): SimulationScene {
  const record = scene as Record<string, unknown>
  const components = (scene.components ?? []).map((component) =>
    runtimeComponentToSimulationComponent(component, scene.layout?.[component.id]),
  )
  const explicitBreadboards = readBreadboards(record.breadboards)
  return {
    schemaVersion: "simulation-scene/2",
    id: readString(record.id) ?? readString(record.experimentId) ?? instanceId,
    title: readString(record.title) ?? instanceId,
    domain: "electronics",
    ...(explicitBreadboards.length === 0 ? {} : { breadboards: explicitBreadboards }),
    components,
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
    wires: (scene.connections ?? []).map(runtimeConnectionToSimulationWire),
    provenance: {
      source: {
        kind: "manual-description",
        label: readString(record.title) ?? instanceId,
        status: "reviewed",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
}

function runtimeComponentToSimulationComponent(
  component: NonNullable<SceneForSolve["components"]>[number],
  layout: NonNullable<SceneForSolve["layout"]>[string] | undefined,
): SimulationComponent {
  const attrs = {
    ...(component.attrs ?? {}),
    ...(typeof component.value === "number" && component.attrs?.value === undefined
      ? { value: component.value }
      : {}),
    ...(typeof component.color === "string" && component.attrs?.color === undefined
      ? { color: component.color }
      : {}),
  }
  return {
    id: component.id,
    type: component.type,
    pose: {
      x: layout?.x ?? 0,
      y: layout?.y ?? 0,
      ...(layout?.rotation === undefined ? {} : { rotation: layout.rotation }),
    },
    ...(component.label === undefined ? {} : { label: component.label }),
    ...(Object.keys(attrs).length === 0 ? {} : { attrs }),
    ...(component.pins === undefined
      ? {}
      : { pins: component.pins.map((pin) => ({ ...pin })) }),
  }
}

function runtimeConnectionToSimulationWire(
  connection: NonNullable<SceneForSolve["connections"]>[number],
  index: number,
): SimulationWire {
  return {
    id: connection.id ?? `wire-${index + 1}`,
    from: connection.from,
    to: connection.to,
    color: connection.color ?? "black",
    ...(connection.path === undefined
      ? {}
      : {
          path: {
            kind: connection.path.kind,
            points: connection.path.points.map((point) => ({ ...point })),
            ...(connection.path.sourceInstructions === undefined
              ? {}
              : { sourceInstructions: [...connection.path.sourceInstructions] }),
          },
        }),
  }
}

function runtimeSceneFromPatch(
  scene: SceneForSolve,
  patch: RuntimePlacementPatch,
): SceneForSolve {
  const base = clonePlain(scene) as SceneForSolve
  const previousComponents = new Map((base.components ?? []).map((component) => [component.id, component]))
  const previousConnections = base.connections ?? []
  return {
    ...base,
    components: patch.components.map((component) => {
      const previous = previousComponents.get(component.id) ?? {}
      const value = component.attrs?.value
      const color = component.attrs?.color
      return {
        ...previous,
        id: component.id,
        type: component.type,
        ...(component.label === undefined ? {} : { label: component.label }),
        ...(typeof value === "number" ? { value } : {}),
        ...(typeof color === "string" ? { color } : {}),
        ...(component.attrs === undefined ? {} : { attrs: { ...component.attrs } }),
        ...(component.pins === undefined
          ? {}
          : { pins: component.pins.map((pin) => ({ ...pin })) }),
      }
    }),
    connections: patch.wires.map((wire) => {
      const previous =
        previousConnections.find((connection) => connection.id === wire.id) ??
        previousConnections.find(
          (connection) =>
            connection.from === wire.from &&
            connection.to === wire.to &&
            connection.color === wire.color,
        ) ??
        {}
      return {
        ...previous,
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
      }
    }),
    pinAssignments: { ...patch.pinAssignments },
    layout: Object.fromEntries(
      patch.components.map((component) => [component.id, { ...component.pose }]),
    ),
  }
}

function readBreadboards(value: unknown): SimulationBreadboardModel[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(isBreadboardModel)
    .map((board) => ({
      id: board.id,
      kind: board.kind,
      columns: board.columns,
      terminalRows: [...board.terminalRows],
      rails: [...board.rails],
    }))
}

function isBreadboardModel(value: unknown): value is SimulationBreadboardModel {
  if (!isRecord(value)) return false
  return (
    typeof value.id === "string" &&
    (value.kind === "breadboard-half" || value.kind === "breadboard-full") &&
    Number.isInteger(value.columns) &&
    Array.isArray(value.terminalRows) &&
    value.terminalRows.every((row) => typeof row === "string") &&
    Array.isArray(value.rails) &&
    value.rails.every((rail) => typeof rail === "string")
  )
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
