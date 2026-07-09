import {
  applySimulationRuntimeOperation,
  type SimulationRuntimeState,
} from "../core/simulationRuntime"
import type {
  SimulationOperationEnvelope,
  SimulationOperationOrigin,
} from "../core/simulationOperations"
import type { SimulationWirePath } from "../core/simulationScene"
import { solveElabExperiment } from "../solver/elabSolver"
import type { SolveResult } from "../solver/elabSolver"

type ElabCanvasPoint = { x: number; y: number }

export type ElabCanvasSceneComponent = {
  id: string
  type: string
  label?: string
  value?: number
  color?: string
  anchor?: string
}

export type ElabCanvasSceneConnection = {
  id?: string
  from: string
  to: string
  color: string
  kind?: "internal" | "wire"
  path?: { kind: "polyline"; points: ElabCanvasPoint[] }
}

export type ElabCanvasWireEventConnection = {
  id?: string
  from: string
  to: string
  color?: string
  kind?: "internal" | "wire"
  path?: { kind: "polyline"; points: ElabCanvasPoint[] }
  waypoints?: ElabCanvasPoint[]
}

export type ElabCanvasSceneLike = {
  experimentId: string
  title: string
  components: ElabCanvasSceneComponent[]
  connections: ElabCanvasSceneConnection[]
  pinAssignments: Record<string, string>
  layout: Record<string, { x: number; y: number; rotation?: number; parentId?: string }>
}

export type ElabCanvasProjectionMode = "gia-montato" | "passo-passo" | "monta-tu"
export type ElabCanvasBuildMode = "complete" | "guided" | "sandbox"

export type ElabCanvasExperiment = {
  id: string
  title: string
  components: ElabCanvasSceneComponent[]
  connections: Array<{
    id?: string
    from: string
    to: string
    color: string
    waypoints?: ElabCanvasPoint[]
  }>
  pinAssignments: Record<string, string>
  layout: ElabCanvasSceneLike["layout"]
  buildMode: ElabCanvasBuildMode
}

export type ElabCanvasMountState = {
  sourceOfTruth: "simulation-scene"
  projectionMode: ElabCanvasProjectionMode
  experiment: ElabCanvasExperiment
  componentStates: Record<string, unknown>
  diagnostics: string[]
}

export function simulationSceneToElabCanvasState(
  scene: ElabCanvasSceneLike,
  options: {
    projectionMode?: ElabCanvasProjectionMode
    buildMode?: ElabCanvasBuildMode
  } = {},
): ElabCanvasMountState {
  const projectionMode = options.projectionMode ?? "gia-montato"
  const experiment: ElabCanvasExperiment = {
    id: scene.experimentId,
    title: scene.title,
    components: scene.components.map((component) => ({ ...component })),
    connections: scene.connections.map((connection) => ({
      ...(connection.id === undefined ? {} : { id: connection.id }),
      from: connection.from,
      to: connection.to,
      color: connection.color,
      ...(connection.path === undefined
        ? {}
        : { waypoints: connection.path.points.map((point) => ({ ...point })) }),
    })),
    pinAssignments: { ...scene.pinAssignments },
    layout: cloneLayout(scene.layout),
    buildMode: options.buildMode ?? buildModeForProjection(projectionMode),
  }

  const diagnostics: string[] = []
  let solve: SolveResult | null = null
  try {
    solve = solveElabExperiment({
      components: experiment.components.map((component) => ({
        id: component.id,
        type: component.type,
        ...(component.value === undefined ? {} : { value: component.value }),
        ...(component.color === undefined ? {} : { color: component.color }),
      })),
      connections: experiment.connections.map((connection) => ({
        from: connection.from,
        to: connection.to,
        color: connection.color,
      })),
      pinAssignments: experiment.pinAssignments,
    })
  } catch (error) {
    diagnostics.push(error instanceof Error ? error.message : String(error))
  }

  return {
    sourceOfTruth: "simulation-scene",
    projectionMode,
    experiment,
    componentStates: normalizeElabCanvasComponentStates(scene, solve),
    diagnostics,
  }
}

export function applyElabCanvasLayoutChange<TScene extends ElabCanvasSceneLike>(
  scene: TScene,
  componentId: string,
  pose: { x: number; y: number; rotation?: number; parentId?: string },
): TScene {
  return {
    ...scene,
    components: scene.components.map((component) => ({ ...component })),
    connections: scene.connections.map((connection) => ({
      ...connection,
      ...(connection.path === undefined
        ? {}
        : { path: { ...connection.path, points: connection.path.points.map((point) => ({ ...point })) } }),
    })),
    pinAssignments: { ...scene.pinAssignments },
    layout: {
      ...cloneLayout(scene.layout),
      [componentId]: { ...pose },
    },
  } as TScene
}

export function applyElabCanvasWireUpdate<TScene extends ElabCanvasSceneLike>(
  scene: TScene,
  wireIndex: number,
  connection: ElabCanvasWireEventConnection,
): TScene {
  if (!validWireIndex(scene, wireIndex)) return cloneSceneLike(scene) as TScene
  const nextConnections = cloneConnections(scene.connections)
  const previous = scene.connections[wireIndex]!
  nextConnections[wireIndex] = sceneConnectionFromElabWire(
    connection,
    previous,
    elabCanvasWireIdForIndex(scene, wireIndex),
  )
  return sceneWithConnections(scene, nextConnections)
}

export function applyElabCanvasConnectionAdd<TScene extends ElabCanvasSceneLike>(
  scene: TScene,
  connection: ElabCanvasWireEventConnection,
): TScene {
  const wireId = connection.id ?? `wire-${scene.connections.length + 1}`
  return sceneWithConnections(scene, [
    ...cloneConnections(scene.connections),
    sceneConnectionFromElabWire(connection, undefined, wireId),
  ])
}

export function applyElabCanvasWireDelete<TScene extends ElabCanvasSceneLike>(
  scene: TScene,
  wireIndex: number,
): TScene {
  if (!validWireIndex(scene, wireIndex)) return cloneSceneLike(scene) as TScene
  return sceneWithConnections(
    scene,
    scene.connections
      .filter((_, index) => index !== wireIndex)
      .map((connection) => cloneConnection(connection)),
  )
}

export function elabCanvasLayoutChangeOperation(
  input: {
    id: string
    componentId: string
    pose: { x: number; y: number; rotation?: number }
    origin?: SimulationOperationOrigin
  },
): SimulationOperationEnvelope {
  return {
    schema: "simulation-operation/1",
    id: input.id,
    actor: "manual",
    origin: input.origin ?? "canvas",
    targetProvider: "local",
    providerMode: "static",
    operation: {
      kind: "move-component",
      componentId: input.componentId,
      pose: { ...input.pose },
    },
  }
}

export function elabCanvasWireUpdateOperation(
  input: {
    id: string
    scene: ElabCanvasSceneLike
    wireIndex: number
    connection: ElabCanvasWireEventConnection
    origin?: SimulationOperationOrigin
  },
): SimulationOperationEnvelope {
  const existing = input.scene.connections[input.wireIndex]
  return operationEnvelope(input.id, input.origin, {
    kind: "edit-wire",
    wireId: elabCanvasWireIdForIndex(input.scene, input.wireIndex),
    edit: {
      kind: "replace-path",
      path: requireElabWirePath(input.connection, existing?.path),
    },
  })
}

export function elabCanvasConnectionAddOperation(
  input: {
    id: string
    connection: ElabCanvasWireEventConnection
    wireId?: string
    origin?: SimulationOperationOrigin
  },
): SimulationOperationEnvelope {
  const path = pathFromElabWire(input.connection)
  const wireId = input.connection.id ?? input.wireId ?? `${input.id}:wire`
  return operationEnvelope(input.id, input.origin, {
    kind: "connect-wire",
    wire: {
      id: wireId,
      from: input.connection.from,
      to: input.connection.to,
      color: input.connection.color ?? "black",
      ...(path === undefined ? {} : { path }),
    },
  })
}

export function elabCanvasWireDeleteOperation(
  input: {
    id: string
    scene: ElabCanvasSceneLike
    wireIndex: number
    origin?: SimulationOperationOrigin
  },
): SimulationOperationEnvelope {
  return operationEnvelope(input.id, input.origin, {
    kind: "delete",
    target: {
      kind: "wire",
      id: elabCanvasWireIdForIndex(input.scene, input.wireIndex),
    },
  })
}

export function elabCanvasWireIdForIndex(
  scene: ElabCanvasSceneLike,
  wireIndex: number,
): string {
  return scene.connections[wireIndex]?.id ?? `wire-${wireIndex + 1}`
}

export function applyElabCanvasLayoutChangeToRuntime(
  state: SimulationRuntimeState,
  input: {
    id: string
    componentId: string
    pose: { x: number; y: number; rotation?: number }
  },
): ReturnType<typeof applySimulationRuntimeOperation> {
  return applySimulationRuntimeOperation(state, elabCanvasLayoutChangeOperation(input))
}

function operationEnvelope(
  id: string,
  origin: SimulationOperationOrigin | undefined,
  operation: SimulationOperationEnvelope["operation"],
): SimulationOperationEnvelope {
  return {
    schema: "simulation-operation/1",
    id,
    actor: "manual",
    origin: origin ?? "canvas",
    targetProvider: "local",
    providerMode: "static",
    operation,
  }
}

function normalizeElabCanvasComponentStates(
  scene: ElabCanvasSceneLike,
  solve: SolveResult | null,
): Record<string, unknown> {
  const states: Record<string, unknown> = solve === null ? {} : structuredClone(solve.componentStates)

  for (const component of scene.components) {
    const raw = asRecord(states[component.id])
    if (component.type === "led") {
      const on = raw.on === true
      states[component.id] = {
        ...raw,
        brightness: typeof raw.brightness === "number" ? raw.brightness : on ? 1 : 0,
      }
    }
    if (component.type === "battery9v") {
      states[component.id] = { voltage: 9, connected: true, ...raw }
    }
  }

  for (const [boardId, activeHoles] of Object.entries(activeBreadboardHoles(scene))) {
    states[boardId] = { ...asRecord(states[boardId]), activeHoles }
  }

  return states
}

function activeBreadboardHoles(
  scene: ElabCanvasSceneLike,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  const mark = (ref: string, color: string) => {
    const parsed = parseBreadboardRefForCanvas(ref)
    if (parsed === null) return
    out[parsed.boardId] = { ...(out[parsed.boardId] ?? {}), [parsed.holeId]: color }
  }

  for (const [pinRef, holeRef] of Object.entries(scene.pinAssignments)) {
    mark(holeRef, pinRef.startsWith("led") ? "#2fa764" : "#b6852f")
  }
  for (const connection of scene.connections) {
    mark(connection.from, wireColor(connection.color))
    mark(connection.to, wireColor(connection.color))
  }
  return out
}

function parseBreadboardRefForCanvas(
  ref: string,
): { boardId: string; holeId: string } | null {
  const separator = ref.indexOf(":")
  if (separator === -1) return null
  const boardId = ref.slice(0, separator)
  const rawHoleId = ref.slice(separator + 1)
  if (!boardId || !rawHoleId) return null
  return { boardId, holeId: rawHoleId }
}

function cloneLayout(
  layout: ElabCanvasSceneLike["layout"],
): ElabCanvasSceneLike["layout"] {
  return Object.fromEntries(Object.entries(layout).map(([id, pose]) => [id, { ...pose }]))
}

function cloneSceneLike<TScene extends ElabCanvasSceneLike>(scene: TScene): TScene {
  return {
    ...scene,
    components: scene.components.map((component) => ({ ...component })),
    connections: cloneConnections(scene.connections),
    pinAssignments: { ...scene.pinAssignments },
    layout: cloneLayout(scene.layout),
  }
}

function sceneWithConnections<TScene extends ElabCanvasSceneLike>(
  scene: TScene,
  connections: ElabCanvasSceneConnection[],
): TScene {
  return {
    ...cloneSceneLike(scene),
    connections,
  }
}

function cloneConnections(
  connections: ElabCanvasSceneConnection[],
): ElabCanvasSceneConnection[] {
  return connections.map((connection) => cloneConnection(connection))
}

function cloneConnection(connection: ElabCanvasSceneConnection): ElabCanvasSceneConnection {
  return {
    ...(connection.id === undefined ? {} : { id: connection.id }),
    from: connection.from,
    to: connection.to,
    color: connection.color,
    ...(connection.kind === undefined ? {} : { kind: connection.kind }),
    ...(connection.path === undefined
      ? {}
      : {
          path: {
            kind: connection.path.kind,
            points: connection.path.points.map((point) => ({ ...point })),
          },
        }),
  }
}

function sceneConnectionFromElabWire(
  connection: ElabCanvasWireEventConnection,
  previous: ElabCanvasSceneConnection | undefined,
  fallbackId: string,
): ElabCanvasSceneConnection {
  const path = pathFromElabWire(connection)
  return {
    id: connection.id ?? previous?.id ?? fallbackId,
    from: connection.from,
    to: connection.to,
    color: connection.color ?? previous?.color ?? "black",
    kind: connection.kind ?? previous?.kind ?? "wire",
    ...(path === undefined ? {} : { path }),
  }
}

function pathFromElabWire(
  connection: ElabCanvasWireEventConnection,
): ElabCanvasSceneConnection["path"] | undefined {
  const points = connection.waypoints ?? connection.path?.points
  if (points === undefined) return undefined
  return {
    kind: "polyline",
    points: points.map((point) => ({ ...point })),
  }
}

function requireElabWirePath(
  connection: ElabCanvasWireEventConnection,
  fallback: ElabCanvasSceneConnection["path"] | undefined,
): SimulationWirePath {
  const path = pathFromElabWire(connection)
  if (path !== undefined) return path
  if (fallback !== undefined) {
    return {
      kind: fallback.kind,
      points: fallback.points.map((point) => ({ ...point })),
    }
  }
  throw new Error("ELAB wire update requires waypoints or path")
}

function validWireIndex(scene: ElabCanvasSceneLike, wireIndex: number): boolean {
  return Number.isInteger(wireIndex) && wireIndex >= 0 && wireIndex < scene.connections.length
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? { ...value }
    : {}
}

function wireColor(color: string): string {
  return (
    {
      orange: "#ee7b18",
      green: "#2fa764",
      black: "#15191e",
      red: "#d83b34",
      blue: "#2f68ad",
    }[color] ?? color
  )
}

function buildModeForProjection(mode: ElabCanvasProjectionMode): ElabCanvasBuildMode {
  if (mode === "passo-passo") return "guided"
  if (mode === "monta-tu") return "sandbox"
  return "complete"
}
