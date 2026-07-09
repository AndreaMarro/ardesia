import type {
  SimulationComponent,
  SimulationPoint,
  SimulationScene,
  SimulationSourceKind,
  SimulationWire,
} from "./simulationScene"

export type StructuredSceneObservation = {
  kind: Extract<SimulationSourceKind, "image-observation" | "manual-description">
  label: string
  components: Array<{
    id: string
    type: string
    x: number
    y: number
    rotation?: number
    attrs?: Record<string, string | number | boolean>
  }>
  wires: Array<{
    from: string
    to: string
    color: string
    points?: SimulationPoint[]
  }>
}

type SourceMeta = {
  id: string
  title: string
}

export function structuredObservationToSimulationScene(
  observation: StructuredSceneObservation,
  meta: SourceMeta,
): SimulationScene {
  const blocker = observation.components.length === 0 ? "no structured components extracted" : undefined
  return {
    schemaVersion: "simulation-scene/2",
    id: meta.id,
    title: meta.title,
    domain: "electronics",
    components: observation.components.map(observedComponentToScene),
    wires: observation.wires.map(observedWireToScene),
    provenance: {
      source: {
        kind: observation.kind,
        label: observation.label,
        status: blocker === undefined ? "draft" : "blocked",
        blocker,
      },
    },
    adapters: {
      source: observation.kind,
      solver: ["local", "fastapi", "ngspice-wasm"],
    },
  }
}

function observedComponentToScene(
  component: StructuredSceneObservation["components"][number],
): SimulationComponent {
  return {
    id: component.id,
    type: component.type,
    pose: {
      x: component.x,
      y: component.y,
      rotation: component.rotation,
    },
    attrs: component.attrs,
  }
}

function observedWireToScene(
  wire: StructuredSceneObservation["wires"][number],
  index: number,
): SimulationWire {
  return {
    id: `wire-${index + 1}`,
    from: wire.from,
    to: wire.to,
    color: wire.color,
    path:
      wire.points === undefined
        ? undefined
        : {
            kind: "polyline",
            points: wire.points,
          },
  }
}
