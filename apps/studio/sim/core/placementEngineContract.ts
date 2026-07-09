import type { SimulationComponent, SimulationPose, SimulationScene, SimulationWire } from "./simulationScene"

export type PlacementEngineSourceEntrypoint =
  | "validateIntent"
  | "OccupancyMap"
  | "placeComponent"
  | "resolveAutoWiring"
  | "resolvePlacement"

export type PlacementEngineForbiddenOutputFormat =
  | "legacy-azione-tags"
  | "svg-only-pixel-mutations"
  | "dom-only-drag-state"

export type PlacementEngineValidationStep =
  | "validateSimulationScene"
  | "analyzeBreadboardOccupancy"
  | "analyzePinVocabulary"
  | "activeSimulationProvider.solve"

export type SimulationPlacementOperationKind =
  | "place-component"
  | "move-component"
  | "rotate-component"
  | "edit-wire"
  | "delete"
  | "set-value"
  | "connect-wire"

export type PlacementEngineSnapshotComponent = {
  id: string
  type: string
  label?: string
  attrs?: SimulationComponent["attrs"]
}

export type PlacementEngineSnapshotConnection = {
  id: string
  from: string
  to: string
  color: string
}

export type PlacementEngineSnapshot = {
  schema: "simulation-placement-snapshot/1"
  components: PlacementEngineSnapshotComponent[]
  layout: Record<string, SimulationPose>
  pinAssignments: Record<string, string>
  connections: PlacementEngineSnapshotConnection[]
}

export type SimulationPlacementPatch = {
  schema: "simulation-placement-patch/1"
  components: SimulationComponent[]
  pinAssignments: Record<string, string>
  wires: SimulationWire[]
  diagnostics: string[]
}

export const PLACEMENT_ENGINE_ADAPTER_CONTRACT = {
  source: {
    modulePath: "plugins/elab-tutor/src/components/simulator/engine/PlacementEngine.js",
    entrypoints: [
      "validateIntent",
      "OccupancyMap",
      "placeComponent",
      "resolveAutoWiring",
      "resolvePlacement",
    ] satisfies PlacementEngineSourceEntrypoint[],
  },
  extractionMode: "adapter-first-no-runtime-import",
  inputSnapshotSchema: "simulation-placement-snapshot/1",
  adapterResultFormat: "structured-simulation-scene-patch",
  allowedOperationKinds: [
    "place-component",
    "move-component",
    "rotate-component",
    "edit-wire",
    "delete",
    "set-value",
    "connect-wire",
  ] satisfies SimulationPlacementOperationKind[],
  forbiddenOutputFormats: [
    "legacy-azione-tags",
    "svg-only-pixel-mutations",
    "dom-only-drag-state",
  ] satisfies PlacementEngineForbiddenOutputFormat[],
  legacySourceFormats: ["[AZIONE:addcomponent]", "[AZIONE:addwire]"],
  requiredValidationPipeline: [
    "validateSimulationScene",
    "analyzeBreadboardOccupancy",
    "analyzePinVocabulary",
    "activeSimulationProvider.solve",
  ] satisfies PlacementEngineValidationStep[],
} as const

export function placementSnapshotFromScene(scene: SimulationScene): PlacementEngineSnapshot {
  return {
    schema: "simulation-placement-snapshot/1",
    components: scene.components.map((component) => ({
      id: component.id,
      type: component.type,
      ...(component.label !== undefined ? { label: component.label } : {}),
      ...(component.attrs !== undefined ? { attrs: { ...component.attrs } } : {}),
    })),
    layout: Object.fromEntries(
      scene.components.map((component) => [component.id, { ...component.pose }]),
    ),
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
    connections: scene.wires.map((wire) => ({
      id: wire.id,
      from: wire.from,
      to: wire.to,
      color: wire.color,
    })),
  }
}
