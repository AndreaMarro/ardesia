// Composition root della mutazione live Sessione 2:
// Room → SDK/MessageChannel → ToolHost → simulation-runtime/1 → board.write.
// Il Core host resta generico: l'unico import del runtime reale vive qui.

import { manifest as simulationManifest } from "../plugins/simulation/manifest"
import {
  applySimulationRuntimeOperation,
  describeSimulationRuntimeApi,
  loadSimulationRuntimeScene,
  readSimulationRuntimeDiagnostics,
  serializeSimulationRuntimeState,
  solveSimulationRuntimeProvider,
  type SimulationRuntimeProviderRequest,
  type SimulationRuntimeState,
} from "../sim/core/simulationRuntime"
import type { SimulationOperationEnvelope } from "../sim/core/simulationOperations"
import { simulationSceneDigest } from "../sim/core/simulationSceneDigest"
import { connectTool, type ToolConnection, type WindowLike } from "./sdk"
import {
  SimulationApplyOperationParamsSchema,
  SimulationApplyOperationResultSchema,
  SimulationLoadSceneParamsSchema,
  SimulationLoadSceneResultSchema,
  type SimulationApplyOperationParams,
  type SimulationApplyOperationResult,
  type SimulationScene,
} from "./toolhost-protocol"
import type {
  BoundSimulationConnectWireRequest,
  SimulationConnectWireResult,
} from "./toolhost/simulationPluginRegistry"
import { ToolHost, type ToolHostDeps } from "./toolhost/host"
import { resolveGrant } from "./toolhost/policy"
import {
  EMBED_DATA_KEY,
  persistEmbedStateThroughToolHost,
  type BoardApiLike,
} from "./toolhost/caps/board"
import type { SimulationRuntimeApiLike } from "./toolhost/caps/simulation"
import { validateRoomId } from "./store/roomPaths"

type RoomSimulationComposition = {
  roomId: string
  store: ToolHostDeps["store"]
  board: BoardApiLike
}

type MarkerBinding = {
  state: Record<string, unknown>
  scene: Record<string, unknown>
  stateJson: string
}

type MessageListener = (event: {
  data: unknown
  ports?: readonly unknown[]
}) => void

class LocalToolWindow implements WindowLike {
  private listeners = new Set<MessageListener>()

  addEventListener(_type: "message", listener: MessageListener): void {
    this.listeners.add(listener)
  }

  removeEventListener(_type: "message", listener: MessageListener): void {
    this.listeners.delete(listener)
  }

  deliver(data: unknown, ports: readonly unknown[]): void {
    for (const listener of [...this.listeners]) listener({ data, ports })
  }
}

const inFlight = new Set<string>()
const storeQueues = new WeakMap<object, Promise<void>>()

const realSimulationRuntime: SimulationRuntimeApiLike = {
  describe: () => describeSimulationRuntimeApi(),
  sceneDigest: (scene) => simulationSceneDigest(scene),
  loadScene: (input) => loadSimulationRuntimeScene(input),
  applyOperation: (state, operation) => {
    const applied = applySimulationRuntimeOperation(
      state as SimulationRuntimeState,
      operation as SimulationOperationEnvelope,
    )
    return {
      state: applied.state,
      accepted: applied.report.ok && (applied.placement === null || applied.placement.ok),
      result: applied.state.lastSolverResult ?? null,
      diagnostics: readSimulationRuntimeDiagnostics(applied.state),
    }
  },
  solve: (state, request) => {
    const solved = solveSimulationRuntimeProvider(
      state as SimulationRuntimeState,
      request as SimulationRuntimeProviderRequest,
    )
    return { state: solved.state, result: solved.result }
  },
  readDiagnostics: (state) =>
    readSimulationRuntimeDiagnostics(state as SimulationRuntimeState),
  serializeState: (state) =>
    serializeSimulationRuntimeState(state as SimulationRuntimeState),
}

/**
 * Esegue il solo connect-wire autorizzato. La scena ricca resta sulla board;
 * il servizio riceve la sua proiezione stretta e la receipt viene confrontata
 * contro la stessa topologia provider-visible prima dell'unico write-back.
 */
export async function applyRoomSimulationConnectWire<TScene>(
  composition: RoomSimulationComposition,
  request: BoundSimulationConnectWireRequest<TScene>,
): Promise<SimulationConnectWireResult<TScene>> {
  validateRoomId(composition.roomId)
  if (request.toolId !== simulationManifest.id) {
    throw new Error(`live simulation mutation denied for tool "${request.toolId}"`)
  }
  const flightKey = `${composition.roomId}\u0000${request.toolId}\u0000${request.embedId}`
  if (inFlight.has(flightKey)) {
    throw new Error(`simulation mutation already pending for "${request.embedId}"`)
  }
  inFlight.add(flightKey)
  let releaseStore: (() => void) | undefined

  try {
    releaseStore = await acquireStoreTurn(composition.store)
    const binding = readMarkerBinding(composition.board, request)
    const requestedScene = serviceSceneFrom(request.scene)
    const boardScene = serviceSceneFrom(binding.scene)
    if (!activeSceneMatchesBinding(
      request.scene,
      binding.scene,
      requestedScene,
      boardScene,
      binding.state,
    )) {
      throw new Error(`stale live scene for "${request.embedId}"`)
    }
    const expectedSceneDigest = simulationSceneDigest(requestedScene)
    const operationParams = SimulationApplyOperationParamsSchema.parse({
      expectedSceneDigest,
      operation: request.operation,
    })

    const instanceId = await runtimeInstanceId(
      composition.roomId,
      request.toolId,
      request.embedId,
    )
    const host = new ToolHost(
      simulationManifest,
      resolveGrant(simulationManifest, ["service.simulation"]),
      {
        store: composition.store,
        board: composition.board,
        roomId: composition.roomId,
        instanceId,
        simulation: realSimulationRuntime,
      },
    )
    if (await host.refreshKillSwitch()) {
      throw new Error(`simulation plugin "${simulationManifest.id}" is revoked`)
    }
    const mounted = await mountLocalTool(host)
    let result: SimulationApplyOperationResult
    try {
      const loaded = SimulationLoadSceneResultSchema.parse(
        await mounted.connection.call("simulation.loadScene", { scene: requestedScene }),
      )
      assertReceiptScope(
        loaded.receipt,
        instanceId,
        expectedSceneDigest,
      )
      result = SimulationApplyOperationResultSchema.parse(
        await mounted.connection.call("simulation.applyOperation", {
          expectedSceneDigest,
          operation: operationParams.operation,
        }),
      )
      if (
        result.roomId !== composition.roomId ||
        result.operationId !== operationParams.operation.id
      ) {
        throw new Error("simulation operation receipt scope mismatch")
      }
      await host.audit.idle()
    } finally {
      mounted.close()
    }

    const nextScene = appendAcceptedWire(
      asRecord(request.scene, "active simulation scene"),
      operationParams.operation,
    ) as TScene
    const persistedScene = appendAcceptedWire(binding.scene, operationParams.operation)
    const nextDigest = simulationSceneDigest(serviceSceneFrom(nextScene))
    assertReceiptScope(result.receipt, instanceId, nextDigest)

    // Nessuna mutazione ricca concorrente (anche solo layout) può essere persa:
    // il precondition topologico del servizio è necessario ma non sufficiente.
    const current = readMarkerBinding(composition.board, request)
    if (current.stateJson !== binding.stateJson) {
      throw new Error(`board state changed during simulation mutation "${operationParams.operation.id}"`)
    }
    const persisted = await persistEmbedStateThroughToolHost(
      composition.board,
      composition.store,
      request.embedId,
      { ...binding.state, scene: persistedScene },
      { toolId: request.toolId },
    )
    if (!persisted) {
      throw new Error(`simulation write-back denied for "${request.embedId}"`)
    }
    return { scene: nextScene, result }
  } finally {
    releaseStore?.()
    inFlight.delete(flightKey)
  }
}

function readMarkerBinding<TScene>(
  board: BoardApiLike,
  request: BoundSimulationConnectWireRequest<TScene>,
): MarkerBinding {
  const element = board.getSceneElements().find((candidate) => candidate.id === request.embedId)
  const expectedLink = `maestro-tool://${request.toolId}/${request.embedId}`
  if (element === undefined || element.link !== expectedLink) {
    throw new Error(`simulation embed binding missing for "${request.embedId}"`)
  }
  const marker = asRecord(element.customData?.[EMBED_DATA_KEY], "simulation marker")
  if (marker.owner !== request.toolId) {
    throw new Error(`simulation embed owner mismatch for "${request.embedId}"`)
  }
  const state = asRecord(marker.state, "simulation state")
  if (state.kind !== "simulation-scene-v1") {
    throw new Error(`unsupported simulation state for "${request.embedId}"`)
  }
  const scene = asRecord(state.scene, "simulation scene")
  return { state, scene, stateJson: JSON.stringify(state) }
}

function serviceSceneFrom(value: unknown): SimulationScene {
  const scene = asRecord(value, "simulation scene")
  if (!Array.isArray(scene.components) || !Array.isArray(scene.connections)) {
    throw new Error("simulation scene requires components and connections")
  }
  const components = scene.components.map((value) => {
    const component = asRecord(value, "simulation component")
    return {
      id: requiredString(component.id, "component.id"),
      type: requiredString(component.type, "component.type"),
      ...(typeof component.label === "string" ? { label: component.label } : {}),
      ...(typeof component.value === "number" ? { value: component.value } : {}),
    }
  })
  const connections = scene.connections.map((value) => {
    const connection = asRecord(value, "simulation connection")
    if (connection.kind !== undefined && connection.kind !== "wire") {
      throw new Error(`unsupported simulation connection kind "${String(connection.kind)}"`)
    }
    return {
      ...(typeof connection.id === "string" ? { id: connection.id } : {}),
      from: requiredString(connection.from, "connection.from"),
      to: requiredString(connection.to, "connection.to"),
    }
  })
  const pinAssignments = scene.pinAssignments
  const projected = {
    components,
    connections,
    ...(pinAssignments === undefined
      ? {}
      : { pinAssignments: stringRecord(pinAssignments, "pinAssignments") }),
  }
  return SimulationLoadSceneParamsSchema.parse({ scene: projected }).scene
}

function appendAcceptedWire(
  scene: Record<string, unknown>,
  envelope: SimulationApplyOperationParams["operation"],
): Record<string, unknown> {
  const connections = scene.connections
  if (!Array.isArray(connections)) throw new Error("simulation scene has no connections")
  const wire = envelope.operation.wire
  return {
    ...structuredClone(scene),
    connections: [
      ...structuredClone(connections),
      {
        id: wire.id,
        from: wire.from,
        to: wire.to,
        color: wire.color,
        kind: "wire",
      },
    ],
  }
}

function activeSceneMatchesBinding(
  requestedRich: unknown,
  persistedRich: unknown,
  requested: SimulationScene,
  persisted: SimulationScene,
  state: Record<string, unknown>,
): boolean {
  const montage = state.montaggio
  if (montage === undefined) {
    return JSON.stringify(requestedRich) === JSON.stringify(persistedRich)
  }
  const placements = asRecord(montage, "montaggio state").placements
  if (!Array.isArray(placements) || placements.length === 0) {
    return JSON.stringify(requestedRich) === JSON.stringify(persistedRich)
  }

  const expected = structuredClone(persisted)
  expected.pinAssignments = { ...(expected.pinAssignments ?? {}) }
  for (const value of placements) {
    const placement = asRecord(value, "montaggio placement")
    const id = requiredString(placement.id, "montaggio placement.id")
    const type = requiredString(placement.type, "montaggio placement.type")
    if (
      !Array.isArray(placement.holes) ||
      placement.holes.length !== 2
    ) return false
    const from = requiredString(placement.holes[0], "montaggio placement.holes[0]")
    const to = requiredString(placement.holes[1], "montaggio placement.holes[1]")
    if (type === "wire") {
      expected.connections.push({ from, to })
    } else if (type === "resistor") {
      expected.components.push({ id, type: "resistor", value: 470 })
      expected.pinAssignments[`${id}:pin1`] = from
      expected.pinAssignments[`${id}:pin2`] = to
    } else if (type === "led") {
      expected.components.push({ id, type: "led" })
      expected.pinAssignments[`${id}:anode`] = from
      expected.pinAssignments[`${id}:cathode`] = to
    } else {
      return false
    }
  }
  return simulationSceneDigest(requested) === simulationSceneDigest(expected)
}

async function acquireStoreTurn(store: object): Promise<() => void> {
  const previous = storeQueues.get(store) ?? Promise.resolve()
  let release = (): void => {}
  const current = new Promise<void>((resolve) => {
    release = resolve
  })
  const tail = previous.then(() => current)
  storeQueues.set(store, tail)
  await previous
  return () => {
    release()
    if (storeQueues.get(store) === tail) storeQueues.delete(store)
  }
}

async function runtimeInstanceId(
  roomId: string,
  toolId: string,
  embedId: string,
): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      `ardesia:simulation-embed:v2:${JSON.stringify([roomId, toolId, embedId])}`,
    ),
  )
  const hex = Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")
  return hex
}

async function mountLocalTool(host: ToolHost): Promise<{
  connection: ToolConnection
  close(): void
}> {
  const channel = new MessageChannel()
  const session = host.mount(channel.port1)
  const localWindow = new LocalToolWindow()
  const connectionPromise = connectTool({ windowRef: localWindow })
  localWindow.deliver(session.hello, [channel.port2])
  try {
    const connection = await connectionPromise
    return {
      connection,
      close: () => {
        connection.close()
        host.unmount()
      },
    }
  } catch (error) {
    host.unmount()
    channel.port2.close()
    throw error
  }
}

function assertReceiptScope(
  receipt: { pluginId: string; instanceId: string; sceneDigest: string },
  instanceId: string,
  sceneDigest: string,
): void {
  if (
    receipt.pluginId !== simulationManifest.id ||
    receipt.instanceId !== instanceId ||
    receipt.sceneDigest !== sceneDigest
  ) {
    throw new Error("simulation receipt does not bind the requested instance and scene")
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value
}

function stringRecord(value: unknown, label: string): Record<string, string> {
  const record = asRecord(value, label)
  for (const [key, entry] of Object.entries(record)) {
    if (typeof entry !== "string") throw new Error(`${label}.${key} must be a string`)
  }
  return record as Record<string, string>
}
