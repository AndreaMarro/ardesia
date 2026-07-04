import { pointForBreadboardRef } from "../breadboard/simulationBreadboard.ts"
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
  const pages = [...new Set(scene.book.pages)].sort((a, b) => a - b)
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

function refComponentId(ref: string): string {
  const separator = ref.indexOf(":")
  return separator === -1 ? ref : ref.slice(0, separator)
}

// Ogni classificazione di ref deve chiudersi con un check esplicito contro gli
// id dichiarati: un ref che non matcha la grammatica breadboard NON è
// implicitamente un component ref valido (fail-closed, non fail-open).
function assertResolvableRefs(scene: ElabScene): void {
  const componentIds = new Set(scene.components.map((component) => component.id))

  const assertBoardDeclared = (ref: string, context: string): void => {
    const boardId = refComponentId(ref)
    if (!componentIds.has(boardId)) {
      throw new Error(`breadboard ${boardId} is not a declared component in ${context}: ${ref}`)
    }
  }

  const assertEndpoint = (ref: string, context: string): void => {
    if (looksLikeBreadboardRef(ref)) {
      assertBreadboardRef(ref, context)
      assertBoardDeclared(ref, context)
      return
    }
    if (!componentIds.has(refComponentId(ref))) {
      throw new Error(`unresolvable endpoint in ${context}: ${ref}`)
    }
  }

  for (const [pin, ref] of Object.entries(scene.pinAssignments)) {
    if (!componentIds.has(refComponentId(pin))) {
      throw new Error(`unresolvable component in pinAssignments key ${pin}`)
    }
    // I valori di pinAssignments sono fori breadboard per contratto: i pin dei
    // componenti atterrano sulla board, mai direttamente su un altro componente.
    assertBreadboardRef(ref, `pinAssignments ${pin}`)
    assertBoardDeclared(ref, `pinAssignments ${pin}`)
  }

  for (const wire of scene.wires) {
    assertEndpoint(wire.from, `wire ${wire.id}.from`)
    assertEndpoint(wire.to, `wire ${wire.id}.to`)
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
  assertResolvableRefs(scene)

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
