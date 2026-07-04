import { pointForBreadboardRef } from "../../src/toolhost/simulationBreadboard.ts"
import {
  canDriveLesson,
  sceneGeometryStatus,
  validateElabScene,
  type ElabScene,
} from "./elabScene.ts"

export type ElabSceneSimulationComponent = {
  id: string
  type: string
  value?: string | number
  color?: string
}

export type ElabSceneSimulationWire = {
  id: string
  from: string
  to: string
  color: string
}

export type ElabSceneGeometryPayload = ReturnType<typeof sceneGeometryStatus> & {
  componentPoses: Record<string, NonNullable<ElabScene["components"][number]["pose"]>>
  wirePaths: Record<string, NonNullable<ElabScene["wires"][number]["path"]>>
}

export type ElabSceneSimulationAdapterPayload = {
  schema: "elab.scene-sim-adapter.v1"
  experimentId: string
  sourceLabel: string
  canDriveLesson: boolean
  circuit: {
    components: ElabSceneSimulationComponent[]
    wires: ElabSceneSimulationWire[]
    pinAssignments: Record<string, string>
  }
  geometry: ElabSceneGeometryPayload
  provenance: ElabScene["provenance"]
}

function formatSceneErrors(errors: ReadonlyArray<{ path: string; message: string }>): string {
  return errors.map((error) => `${error.path}: ${error.message}`).join("; ")
}

function sourceLabel(scene: ElabScene): string {
  const pages = [...scene.book.pages].sort((a, b) => a - b)
  const contiguous = pages.every((page, index) => index === 0 || page === pages[index - 1]! + 1)
  const pageLabel = contiguous && pages.length > 1 ? `${pages[0]}-${pages[pages.length - 1]}` : pages.join(",")
  return `Vol.${scene.book.volume} pag.${pageLabel}`
}

function looksLikeBreadboardRef(ref: string): boolean {
  return /^bb\d+:/.test(ref)
}

function assertBreadboardRef(ref: string, context: string): void {
  if (pointForBreadboardRef(ref) === null) {
    throw new Error(`invalid breadboard ref in ${context}: ${ref}`)
  }
}

function assertResolvableBreadboardRefs(scene: ElabScene): void {
  for (const [pin, ref] of Object.entries(scene.pinAssignments)) {
    assertBreadboardRef(ref, `pinAssignments ${pin}`)
  }

  for (const wire of scene.wires) {
    if (looksLikeBreadboardRef(wire.from)) assertBreadboardRef(wire.from, `wire ${wire.id}.from`)
    if (looksLikeBreadboardRef(wire.to)) assertBreadboardRef(wire.to, `wire ${wire.id}.to`)
  }
}

function geometryPayload(scene: ElabScene): ElabSceneGeometryPayload {
  const componentPoses: ElabSceneGeometryPayload["componentPoses"] = {}
  const wirePaths: ElabSceneGeometryPayload["wirePaths"] = {}

  for (const component of scene.components) {
    if (component.pose !== undefined) componentPoses[component.id] = { ...component.pose }
  }
  for (const wire of scene.wires) {
    if (wire.path !== undefined) {
      wirePaths[wire.id] = {
        ...wire.path,
        points: wire.path.points.map((point) => ({ ...point })),
      }
    }
  }

  return {
    ...sceneGeometryStatus(scene),
    componentPoses,
    wirePaths,
  }
}

export function createSimulationAdapterPayloadFromElabScene(
  input: unknown,
): ElabSceneSimulationAdapterPayload {
  const result = validateElabScene(input)
  if (!result.ok) {
    throw new Error(`invalid ElabScene - ${formatSceneErrors(result.errors)}`)
  }

  const { scene } = result
  assertResolvableBreadboardRefs(scene)

  return {
    schema: "elab.scene-sim-adapter.v1",
    experimentId: scene.experimentId,
    sourceLabel: sourceLabel(scene),
    canDriveLesson: canDriveLesson(scene),
    circuit: {
      components: scene.components.map((component) => ({
        id: component.id,
        type: component.type,
        ...(component.value !== undefined ? { value: component.value } : {}),
        ...(component.color !== undefined ? { color: component.color } : {}),
      })),
      wires: scene.wires.map((wire) => ({
        id: wire.id,
        from: wire.from,
        to: wire.to,
        color: wire.color,
      })),
      pinAssignments: { ...scene.pinAssignments },
    },
    geometry: geometryPayload(scene),
    provenance: {
      ...scene.provenance,
      checks: { ...scene.provenance.checks },
    },
  }
}
