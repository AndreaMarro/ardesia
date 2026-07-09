import {
  normalizeSimulationScene,
  validateSimulationScene,
  type SimulationPoint,
  type SimulationScene,
  type SimulationSceneNormalized,
  type SimulationWire,
  type SimulationWirePath,
} from "./simulationScene"

export type SimulationWireEndpointSide = "from" | "to"

export type SimulationWireEditAction =
  | "route-only"
  | "endpoint-retargeted"
  | "endpoint-rejected"
  | "wire-edit-rejected"

export type MoveSimulationWireWaypointInput = {
  wireId: string
  pointIndex: number
  point: SimulationPoint
}

export type RetargetSimulationWireEndpointInput = {
  wireId: string
  side: SimulationWireEndpointSide
  endpoint: string
}

export type ReplaceSimulationWirePathInput = {
  wireId: string
  path: SimulationWirePath
}

export type SimulationWireEditResult = {
  ok: boolean
  action: SimulationWireEditAction
  scene: SimulationScene
  normalizedBefore: SimulationSceneNormalized
  normalizedAfter: SimulationSceneNormalized
  diagnostics: string[]
}

export function moveSimulationWireWaypoint(
  scene: SimulationScene,
  input: MoveSimulationWireWaypointInput,
): SimulationWireEditResult {
  const normalizedBefore = normalizeSimulationScene(scene)
  const wire = scene.wires.find((candidate) => candidate.id === input.wireId)
  const diagnostics = waypointDiagnostics(wire, input)
  if (diagnostics.length > 0 || wire?.path === undefined) {
    return rejectedWireEdit(scene, normalizedBefore, diagnostics)
  }

  const nextScene = cloneScene(scene)
  const nextWire = nextScene.wires.find((candidate) => candidate.id === input.wireId)
  if (nextWire?.path === undefined) {
    return rejectedWireEdit(scene, normalizedBefore, ["wire path disappeared before edit"])
  }

  nextWire.path = {
    kind: nextWire.path.kind,
    points: nextWire.path.points.map((point, index) =>
      index === input.pointIndex ? { ...input.point } : { ...point },
    ),
  }
  const validation = validateSimulationScene(nextScene)
  if (!validation.ok) {
    return rejectedWireEdit(scene, normalizedBefore, validation.blockers)
  }

  return {
    ok: true,
    action: "route-only",
    scene: nextScene,
    normalizedBefore,
    normalizedAfter: normalizeSimulationScene(nextScene),
    diagnostics: [],
  }
}

export function retargetSimulationWireEndpoint(
  scene: SimulationScene,
  input: RetargetSimulationWireEndpointInput,
): SimulationWireEditResult {
  const normalizedBefore = normalizeSimulationScene(scene)
  const nextScene = cloneScene(scene)
  const nextWire = nextScene.wires.find((wire) => wire.id === input.wireId)
  if (nextWire === undefined) {
    return {
      ok: false,
      action: "endpoint-rejected",
      scene: cloneScene(scene),
      normalizedBefore,
      normalizedAfter: normalizedBefore,
      diagnostics: [`unknown-wire: ${input.wireId}`],
    }
  }

  nextWire[input.side] = input.endpoint
  const validation = validateSimulationScene(nextScene)
  if (!validation.ok) {
    return {
      ok: false,
      action: "endpoint-rejected",
      scene: cloneScene(scene),
      normalizedBefore,
      normalizedAfter: normalizedBefore,
      diagnostics: validation.blockers,
    }
  }

  return {
    ok: true,
    action: "endpoint-retargeted",
    scene: nextScene,
    normalizedBefore,
    normalizedAfter: normalizeSimulationScene(nextScene),
    diagnostics: [],
  }
}

export function replaceSimulationWirePath(
  scene: SimulationScene,
  input: ReplaceSimulationWirePathInput,
): SimulationWireEditResult {
  const normalizedBefore = normalizeSimulationScene(scene)
  const wire = scene.wires.find((candidate) => candidate.id === input.wireId)
  const diagnostics = replacePathDiagnostics(wire, input)
  if (diagnostics.length > 0) {
    return rejectedWireEdit(scene, normalizedBefore, diagnostics)
  }

  const nextScene = cloneScene(scene)
  const nextWire = nextScene.wires.find((candidate) => candidate.id === input.wireId)
  if (nextWire === undefined) {
    return rejectedWireEdit(scene, normalizedBefore, [`unknown-wire: ${input.wireId}`])
  }

  nextWire.path = cloneWirePath(input.path)
  const validation = validateSimulationScene(nextScene)
  if (!validation.ok) {
    return rejectedWireEdit(scene, normalizedBefore, validation.blockers)
  }

  return {
    ok: true,
    action: "route-only",
    scene: nextScene,
    normalizedBefore,
    normalizedAfter: normalizeSimulationScene(nextScene),
    diagnostics: [],
  }
}

function waypointDiagnostics(
  wire: SimulationWire | undefined,
  input: MoveSimulationWireWaypointInput,
): string[] {
  if (wire === undefined) return [`unknown-wire: ${input.wireId}`]
  if (wire.path === undefined) return [`wire-path-missing: ${input.wireId}`]
  const lastIndex = wire.path.points.length - 1
  if (input.pointIndex <= 0 || input.pointIndex >= lastIndex) {
    return [`locked-wire-anchor: ${input.wireId}:${input.pointIndex}`]
  }
  if (!Number.isFinite(input.point.x) || !Number.isFinite(input.point.y)) {
    return [`invalid-wire-waypoint: ${input.wireId}:${input.pointIndex}`]
  }
  return []
}

function replacePathDiagnostics(
  wire: SimulationWire | undefined,
  input: ReplaceSimulationWirePathInput,
): string[] {
  if (wire === undefined) return [`unknown-wire: ${input.wireId}`]
  if (input.path.kind !== "orthogonal" && input.path.kind !== "polyline") {
    return [`invalid-wire-path-kind: ${input.wireId}`]
  }
  if (input.path.points.length < 2) return [`invalid-wire-path: ${input.wireId}`]
  const invalidPoint = input.path.points.findIndex(
    (point) => !Number.isFinite(point.x) || !Number.isFinite(point.y),
  )
  return invalidPoint === -1 ? [] : [`invalid-wire-waypoint: ${input.wireId}:${invalidPoint}`]
}

function cloneWirePath(path: SimulationWirePath): SimulationWirePath {
  return {
    kind: path.kind,
    points: path.points.map((point) => ({ ...point })),
    ...(path.sourceInstructions === undefined
      ? {}
      : { sourceInstructions: [...path.sourceInstructions] }),
  }
}

function rejectedWireEdit(
  scene: SimulationScene,
  normalizedBefore: SimulationSceneNormalized,
  diagnostics: string[],
): SimulationWireEditResult {
  return {
    ok: false,
    action: "wire-edit-rejected",
    scene: cloneScene(scene),
    normalizedBefore,
    normalizedAfter: normalizedBefore,
    diagnostics,
  }
}

function cloneScene(scene: SimulationScene): SimulationScene {
  return {
    schemaVersion: scene.schemaVersion,
    id: scene.id,
    title: scene.title,
    domain: scene.domain,
    ...(scene.breadboards !== undefined
      ? {
          breadboards: scene.breadboards.map((board) => ({
            ...board,
            terminalRows: [...board.terminalRows],
            rails: [...board.rails],
          })),
        }
      : {}),
    components: scene.components.map((component) => ({
      ...component,
      pose: { ...component.pose },
      ...(component.attrs !== undefined ? { attrs: { ...component.attrs } } : {}),
      ...(component.pins !== undefined
        ? { pins: component.pins.map((pin) => ({ ...pin })) }
        : {}),
    })),
    ...(scene.pinAssignments !== undefined
      ? { pinAssignments: { ...scene.pinAssignments } }
      : {}),
    wires: scene.wires.map((wire) => ({
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
    })),
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
