import {
  createPluginPostitObject,
  resizePluginPostitObject,
  restorePluginPostitObject,
  scopePluginPostitProviderOutput,
  serializePluginPostitObject,
  type PluginPostitObject,
  type PluginPostitProviderOutput,
  type PostitBounds,
} from "../toolhost/postitObject"
import {
  essentialPluginById,
  type EssentialPluginState,
} from "../toolhost/essentialPlugins"
import type {
  PluginWindowCatalogItem,
  PluginWindowInsertRequest,
  PluginWindowKind,
  PluginWindowSource,
} from "./pluginWindowCatalog"
import {
  SIMULATION_RUNTIME_PLUGIN_ID,
  SIMULATION_RUNTIME_STATE_SCHEMA,
  loadSimulationRuntimeScene,
  serializeSimulationRuntimeState,
  simulationRuntimeProviderStatus,
  solveSimulationRuntimeProvider,
  type SimulationRuntimeProviderId,
  type SimulationRuntimeProviderStatus,
  type SimulationRuntimeSceneForSolve,
  type SimulationRuntimeSerializedState,
} from "../../sim/core/simulationRuntime"
import {
  simulationSceneDigest,
  type DigestSceneLike,
} from "../../sim/core/simulationSceneDigest"

export const SIMULATION_PLUGIN_ID = "io.ardesia.simulation"
export const ELABTUTOR_PLUGIN_ID = "io.elab.tutor"
export const SIMULATION_RUNTIME_API = "simulation-runtime/1"
export const MULTI_POSTIT_WORKBENCH_STATE_SCHEMA = "multi-postit-workbench-state/2"
const LEGACY_MULTI_POSTIT_WORKBENCH_STATE_SCHEMA = "multi-postit-workbench-state/1"

const SURFACE_BOUNDS = {
  compact: { width: 260, height: 180 },
  normal: { width: 560, height: 380 },
  expanded: { width: 960, height: 560 },
} as const
const SIMULATION_PROVIDER_IDS = ["local", "fastapi", "ngspice-wasm"] as const satisfies SimulationRuntimeProviderId[]

type WorkbenchSurfaceSize = keyof typeof SURFACE_BOUNDS

export type SolverSnapshot = {
  currents: Record<string, number>
  componentStates: Record<string, { on?: boolean }>
}

export type SimulationPostitState = {
  sceneId: string
  sceneDigest: string
  selectedComponentId: string | null
  providerStatus: SimulationRuntimeProviderStatus
  runtimeState: SimulationRuntimeSerializedState
  providerOutput: PluginPostitProviderOutput<SolverSnapshot>
}

export type ElabTutorPostitState = {
  activeFunction: string
  simulationInstanceId: string
  runtimeApi: typeof SIMULATION_RUNTIME_API
}

export type CatalogPluginPostitState = {
  kind: "catalog-plugin"
  pluginId: string
  label: string
  pluginKind: PluginWindowKind
  source: PluginWindowSource
  readiness: PluginWindowCatalogItem["readiness"]
  evidenceRef: string
  fixtureState: EssentialPluginState | { fixture: true; description: string }
}

export type MultiPostitState = SimulationPostitState | ElabTutorPostitState | CatalogPluginPostitState
export type MultiPostitObject = PluginPostitObject<MultiPostitState>
export type MultiPostitWorkbenchSnapshot = {
  schema: typeof MULTI_POSTIT_WORKBENCH_STATE_SCHEMA
  postits: MultiPostitObject[]
}

export function createMultiPostitWorkbenchPostits(): MultiPostitObject[] {
  const simA = createSimulationPostit("sim-a", "reference-circuit-a", "local", [
    "local solver available",
  ])
  const simB = createSimulationPostit("sim-b", "reference-circuit-b", "fastapi", [
    "fastapi provider hub not configured",
  ])
  const elabTutor = createPluginPostitObject<ElabTutorPostitState>({
    instanceId: "elab-consumer",
    pluginId: ELABTUTOR_PLUGIN_ID,
    bounds: { x: 640, y: 72, width: 740, height: 420 },
    zIndex: 3,
    proximity: "active",
    pluginState: {
      activeFunction: "simulatore",
      simulationInstanceId: "sim-a",
      runtimeApi: SIMULATION_RUNTIME_API,
    },
  })

  return [simA, simB, elabTutor]
}

export function createPostitFromPluginWindowInsert(
  request: PluginWindowInsertRequest,
  existingPostits: readonly MultiPostitObject[],
): MultiPostitObject {
  const item = request.item
  if (item.availability !== "available") {
    throw new Error(`plugin not insertable: ${item.pluginId}`)
  }

  const instanceId = nextPluginWindowPostitInstanceId(item, existingPostits)
  const bounds = pluginWindowPostitBounds(item, existingPostits.length)
  const zIndex = nextPluginWindowPostitZIndex(existingPostits)

  if (item.kind === "simulation") {
    return createSimulationPostit(instanceId, `inserted-${instanceId}`, "local", [
      "local solver available",
    ], bounds, zIndex)
  }

  if (item.kind === "elab-tutor") {
    return createPluginPostitObject<ElabTutorPostitState>({
      instanceId,
      pluginId: ELABTUTOR_PLUGIN_ID,
      bounds,
      zIndex,
      selected: true,
      proximity: "active",
      pluginState: {
        activeFunction: "simulatore",
        simulationInstanceId: firstSimulationPostitInstance(existingPostits),
        runtimeApi: SIMULATION_RUNTIME_API,
      },
    })
  }

  return createPluginPostitObject<CatalogPluginPostitState>({
    instanceId,
    pluginId: item.pluginId,
    bounds,
    zIndex,
    selected: true,
    proximity: "active",
    pluginState: {
      kind: "catalog-plugin",
      pluginId: item.pluginId,
      label: item.title,
      pluginKind: item.kind,
      source: item.source,
      readiness: item.readiness,
      evidenceRef: request.lessonOsEvent.evidenceRefs[0] ?? item.lessonOs.evidenceRef,
      fixtureState: catalogPluginFixtureState(item),
    },
  })
}

export function resizeMultiPostitInstance(
  postits: readonly MultiPostitObject[],
  instanceId: string,
  size: WorkbenchSurfaceSize,
): MultiPostitObject[] {
  const bounds = SURFACE_BOUNDS[size]
  return postits.map((postit) =>
    postit.instanceId === instanceId ? resizePluginPostitObject(postit, bounds) : postit,
  )
}

export function serializeMultiPostitWorkbench(
  postits: readonly MultiPostitObject[],
): MultiPostitWorkbenchSnapshot {
  assertUniquePostitInstances(postits)
  postits.forEach(assertWorkbenchPostit)
  return {
    schema: MULTI_POSTIT_WORKBENCH_STATE_SCHEMA,
    postits: postits.map((postit) => serializePluginPostitObject(postit)),
  }
}

export function restoreMultiPostitWorkbench(payload: unknown): MultiPostitObject[] {
  if (!isRecord(payload)) {
    throw new Error("serialized multi post-it workbench must be an object")
  }
  const sourceVersion = multiPostitWorkbenchSourceVersion(payload.schema)
  if (sourceVersion === null) {
    throw new Error("invalid multi post-it workbench schema")
  }
  if (!Array.isArray(payload.postits)) {
    throw new Error("serialized multi post-it workbench postits must be an array")
  }

  const restored = payload.postits.map((postit) =>
    restoreMultiPostitWorkbenchPostit(postit, sourceVersion),
  )
  assertUniquePostitInstances(restored)
  return restored
}

export function restoreMultiPostitWorkbenchPostit(
  payload: unknown,
  sourceVersion: 1 | 2,
): MultiPostitObject {
  const restored = restorePluginPostitObject<MultiPostitState>(payload)
  const migrated =
    sourceVersion === 1 ? migrateLegacySimulationSceneDigest(restored) : restored
  assertWorkbenchPostit(migrated)
  return migrated
}

export function isSimulationPostitState(state: unknown): state is SimulationPostitState {
  if (!isRecord(state)) return false
  const providerOutput = state.providerOutput
  const providerStatus = state.providerStatus
  const runtimeState = state.runtimeState
  if (!(
    typeof state.sceneId === "string" &&
    (state.selectedComponentId === null || typeof state.selectedComponentId === "string") &&
    isPluginPostitProviderOutput(providerOutput) &&
    isProviderStatus(providerStatus) &&
    isSimulationRuntimeSerializedState(runtimeState) &&
    runtimeState.instanceId === providerOutput.instanceId &&
    runtimeState.pluginId === SIMULATION_RUNTIME_PLUGIN_ID &&
    providerStatus.id === providerOutput.providerId
  )) {
    return false
  }
  const runtimeDigest = trySimulationRuntimeSceneDigest(runtimeState)
  return (
    typeof state.sceneDigest === "string" &&
    runtimeDigest !== null &&
    state.sceneDigest === runtimeDigest
  )
}

export function isElabTutorPostitState(state: unknown): state is ElabTutorPostitState {
  return (
    isRecord(state) &&
    typeof state.activeFunction === "string" &&
    typeof state.simulationInstanceId === "string" &&
    state.runtimeApi === SIMULATION_RUNTIME_API
  )
}

export function isCatalogPluginPostitState(state: unknown): state is CatalogPluginPostitState {
  return (
    isRecord(state) &&
    state.kind === "catalog-plugin" &&
    typeof state.pluginId === "string" &&
    typeof state.label === "string" &&
    isPluginWindowKind(state.pluginKind) &&
    isPluginWindowSource(state.source) &&
    isPluginReadiness(state.readiness) &&
    typeof state.evidenceRef === "string" &&
    isRecord(state.fixtureState)
  )
}

function createSimulationPostit(
  instanceId: string,
  sceneId: string,
  providerId: SimulationRuntimeProviderId,
  diagnostics: string[],
  bounds?: PostitBounds,
  zIndex?: number,
): MultiPostitObject {
  const runtimeState = createSimulationRuntimeSnapshot(instanceId, sceneId, providerId, diagnostics)
  const solverOutput = solverSnapshotFromRuntime(runtimeState)
  const scopedProviderOutput = scopePluginPostitProviderOutput(
    { instanceId, pluginId: SIMULATION_PLUGIN_ID },
    {
      providerId,
      diagnostics: runtimeState.diagnostics,
      solverOutput,
    },
  )

  return createPluginPostitObject<SimulationPostitState>({
    instanceId,
    pluginId: SIMULATION_PLUGIN_ID,
    bounds:
      bounds ?? (instanceId === "sim-b"
        ? { x: 48, y: 492, width: 560, height: 380 }
        : { x: 48, y: 72, width: 560, height: 380 }),
    zIndex: zIndex ?? (instanceId === "sim-a" ? 1 : 2),
    selected: true,
    pluginState: {
      sceneId,
      sceneDigest: requireSimulationRuntimeSceneDigest(runtimeState),
      selectedComponentId: null,
      providerStatus: simulationRuntimeProviderStatus(providerId),
      runtimeState,
      providerOutput: scopedProviderOutput,
    },
  })
}

function assertUniquePostitInstances(postits: readonly Pick<MultiPostitObject, "instanceId">[]): void {
  const ids = postits.map((postit) => postit.instanceId)
  if (new Set(ids).size !== ids.length) {
    throw new Error("duplicate plugin post-it instance")
  }
}

function assertWorkbenchPostit(postit: MultiPostitObject): void {
  if (postit.pluginId === SIMULATION_PLUGIN_ID) {
    assertSimulationPostit(postit)
    return
  }
  if (postit.pluginId === ELABTUTOR_PLUGIN_ID) {
    assertElabTutorPostit(postit)
    return
  }
  assertCatalogPluginPostit(postit)
}

function assertSimulationPostit(postit: MultiPostitObject): void {
  const state = postit.pluginState
  if (!isSimulationPostitState(state)) {
    throw new Error(`invalid Simulation state for ${postit.instanceId}`)
  }
  if (state.providerOutput.instanceId !== postit.instanceId) {
    throw new Error(`provider output instance mismatch for ${postit.instanceId}`)
  }
  if (state.providerOutput.pluginId !== postit.pluginId) {
    throw new Error(`provider output plugin mismatch for ${postit.instanceId}`)
  }
  if (state.providerStatus.id !== state.providerOutput.providerId) {
    throw new Error(`provider status mismatch for ${postit.instanceId}`)
  }
  if (state.runtimeState.instanceId !== postit.instanceId) {
    throw new Error(`runtime state instance mismatch for ${postit.instanceId}`)
  }
  if (state.runtimeState.pluginId !== SIMULATION_RUNTIME_PLUGIN_ID) {
    throw new Error(`runtime state plugin mismatch for ${postit.instanceId}`)
  }
}

function assertElabTutorPostit(postit: MultiPostitObject): void {
  const state = postit.pluginState
  if (!isElabTutorPostitState(state)) {
    throw new Error(`invalid ELABTutor state for ${postit.instanceId}`)
  }
  if (state.runtimeApi !== SIMULATION_RUNTIME_API) {
    throw new Error(`invalid ELABTutor runtime API for ${postit.instanceId}`)
  }
}

function assertCatalogPluginPostit(postit: MultiPostitObject): void {
  const state = postit.pluginState
  if (!isCatalogPluginPostitState(state)) {
    throw new Error(`invalid catalog plugin state for ${postit.instanceId}`)
  }
  if (state.pluginId !== postit.pluginId) {
    throw new Error(`catalog plugin id mismatch for ${postit.instanceId}`)
  }
}

function catalogPluginFixtureState(
  item: PluginWindowCatalogItem,
): CatalogPluginPostitState["fixtureState"] {
  const essentialPlugin = essentialPluginById(item.pluginId)
  return essentialPlugin?.fixtureState ?? { fixture: true, description: item.description }
}

function createSimulationRuntimeSnapshot(
  instanceId: string,
  sceneId: string,
  providerId: SimulationRuntimeProviderId,
  diagnostics: string[],
): SimulationRuntimeSerializedState {
  const loaded = loadSimulationRuntimeScene({
    instanceId,
    scene: createSimulationRuntimeScene(sceneId),
    diagnostics: [...diagnostics],
  })
  const solved = solveSimulationRuntimeProvider(loaded, {
    provider: providerId,
    mode: "static",
  })
  return serializeSimulationRuntimeState(solved.state)
}

function createSimulationRuntimeScene(sceneId: string): SimulationRuntimeSceneForSolve {
  return {
    components: [
      {
        id: "battery",
        type: "battery9v",
        value: 9,
        pins: [{ id: "positive" }, { id: "negative" }],
      },
      {
        id: "resistor",
        type: "resistor",
        value: 470,
        pins: [{ id: "pin1" }, { id: "pin2" }],
      },
      {
        id: "led",
        type: "led",
        color: "red",
        pins: [{ id: "anode" }, { id: "cathode" }],
      },
    ],
    connections: [
      {
        id: `${sceneId}:battery-resistor`,
        from: "battery:positive",
        to: "resistor:pin1",
        color: "red",
      },
      {
        id: `${sceneId}:resistor-led`,
        from: "resistor:pin2",
        to: "led:anode",
        color: "red",
      },
      {
        id: `${sceneId}:led-battery`,
        from: "led:cathode",
        to: "battery:negative",
        color: "black",
      },
    ],
    layout: {
      battery: { x: 56, y: 128 },
      resistor: { x: 236, y: 148 },
      led: { x: 386, y: 148, rotation: 90 },
    },
  }
}

function multiPostitWorkbenchSourceVersion(schema: unknown): 1 | 2 | null {
  if (schema === MULTI_POSTIT_WORKBENCH_STATE_SCHEMA) return 2
  if (schema === LEGACY_MULTI_POSTIT_WORKBENCH_STATE_SCHEMA) return 1
  return null
}

function migrateLegacySimulationSceneDigest(
  postit: MultiPostitObject,
): MultiPostitObject {
  if (postit.pluginId !== SIMULATION_PLUGIN_ID) return postit
  const pluginState: unknown = postit.pluginState
  if (!isRecord(pluginState) || pluginState.sceneDigest !== undefined) {
    return postit
  }
  const sceneDigest = trySimulationRuntimeSceneDigest(pluginState.runtimeState)
  if (sceneDigest === null) return postit
  const migratedState = {
    ...pluginState,
    sceneDigest,
  }
  if (!isSimulationPostitState(migratedState)) return postit
  return {
    ...postit,
    pluginState: migratedState,
  }
}

function requireSimulationRuntimeSceneDigest(
  runtimeState: SimulationRuntimeSerializedState,
): string {
  const digest = trySimulationRuntimeSceneDigest(runtimeState)
  if (digest === null) {
    throw new Error("Simulation runtime scene must expose a valid topology")
  }
  return digest
}

function trySimulationRuntimeSceneDigest(runtimeState: unknown): string | null {
  if (!isSimulationRuntimeSerializedState(runtimeState)) return null
  const scene: unknown = runtimeState.scene
  if (!isDigestSceneLike(scene)) return null
  try {
    return simulationSceneDigest(scene)
  } catch {
    return null
  }
}

function isDigestSceneLike(value: unknown): value is DigestSceneLike {
  if (!isRecord(value)) return false
  if (
    !Array.isArray(value.components) ||
    !value.components.every(
      (component) =>
        isRecord(component) &&
        isNonEmptyString(component.id) &&
        isNonEmptyString(component.type) &&
        (
          component.value === undefined ||
          (typeof component.value === "number" && Number.isFinite(component.value))
        ),
    )
  ) {
    return false
  }
  if (
    !Array.isArray(value.connections) ||
    !value.connections.every(
      (connection) =>
        isRecord(connection) &&
        isNonEmptyString(connection.from) &&
        isNonEmptyString(connection.to) &&
        (connection.id === undefined || isNonEmptyString(connection.id)) &&
        (connection.kind === undefined || isNonEmptyString(connection.kind)),
    )
  ) {
    return false
  }
  return (
    value.pinAssignments === undefined ||
    (
      isRecord(value.pinAssignments) &&
      Object.entries(value.pinAssignments).every(
        ([pin, target]) => isNonEmptyString(pin) && isNonEmptyString(target),
      )
    )
  )
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function solverSnapshotFromRuntime(runtimeState: SimulationRuntimeSerializedState): SolverSnapshot {
  const result = runtimeState.lastSolverResult
  return {
    currents: result === undefined ? {} : { ...result.currents },
    componentStates:
      result === undefined
        ? {}
        : Object.fromEntries(
            Object.entries(result.componentStates).map(([id, state]) => [id, { ...state }]),
          ),
  }
}

function pluginWindowPostitBounds(
  item: PluginWindowCatalogItem,
  index: number,
): PostitBounds {
  const defaultBounds = defaultBoundsForPluginWindowItem(item)
  const column = index % 2
  const row = Math.floor(index / 2)
  return {
    x: 48 + column * 640,
    y: 72 + row * 440,
    width: defaultBounds.width,
    height: defaultBounds.height,
  }
}

function defaultBoundsForPluginWindowItem(item: PluginWindowCatalogItem): Pick<PostitBounds, "width" | "height"> {
  const essentialPlugin = essentialPluginById(item.pluginId)
  if (essentialPlugin !== undefined) {
    return essentialPlugin.defaultBounds
  }
  if (item.kind === "simulation") {
    return { width: 560, height: 380 }
  }
  if (item.kind === "elab-tutor") {
    return { width: 740, height: 420 }
  }
  if (item.kind === "function") {
    return { width: 360, height: 260 }
  }
  return { width: 420, height: 300 }
}

function nextPluginWindowPostitZIndex(postits: readonly MultiPostitObject[]): number {
  return postits.reduce((max, postit) => Math.max(max, postit.zIndex), 0) + 1
}

function nextPluginWindowPostitInstanceId(
  item: PluginWindowCatalogItem,
  existingPostits: readonly MultiPostitObject[],
): string {
  const prefix = pluginWindowInstancePrefix(item)
  const existing = new Set(existingPostits.map((postit) => postit.instanceId))
  for (let index = 1; index <= 999; index += 1) {
    const candidate = `${prefix}-${index}`
    if (!existing.has(candidate)) return candidate
  }
  throw new Error(`unable to allocate plugin post-it instance for ${item.pluginId}`)
}

function pluginWindowInstancePrefix(item: PluginWindowCatalogItem): string {
  if (item.kind === "simulation") return "sim"
  if (item.kind === "elab-tutor") return "elab-tutor"
  const parts = item.pluginId.split(".")
  const rawPrefix = parts[parts.length - 1] ?? item.kind
  const prefix = rawPrefix
    .toLocaleLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
  return prefix.length > 0 ? prefix : "plugin"
}

function firstSimulationPostitInstance(postits: readonly MultiPostitObject[]): string {
  return postits.find((postit) => postit.pluginId === SIMULATION_PLUGIN_ID)?.instanceId ?? "sim-a"
}

function isPluginPostitProviderOutput(value: unknown): value is PluginPostitProviderOutput<SolverSnapshot> {
  return (
    isRecord(value) &&
    typeof value.instanceId === "string" &&
    typeof value.pluginId === "string" &&
    isProviderId(value.providerId) &&
    Array.isArray(value.diagnostics) &&
    value.diagnostics.every((diagnostic) => typeof diagnostic === "string") &&
    isSolverSnapshot(value.solverOutput)
  )
}

function isProviderStatus(value: unknown): value is SimulationRuntimeProviderStatus {
  if (!isRecord(value)) return false
  if (!isProviderId(value.id) || typeof value.available !== "boolean") return false
  if (value.available) return value.reason === undefined
  return typeof value.reason === "string" && value.reason.trim().length > 0
}

function isProviderId(value: unknown): value is SimulationRuntimeProviderId {
  return typeof value === "string" && SIMULATION_PROVIDER_IDS.includes(value as SimulationRuntimeProviderId)
}

function isSimulationRuntimeSerializedState(value: unknown): value is SimulationRuntimeSerializedState {
  return (
    isRecord(value) &&
    value.schema === SIMULATION_RUNTIME_STATE_SCHEMA &&
    value.pluginId === SIMULATION_RUNTIME_PLUGIN_ID &&
    typeof value.instanceId === "string" &&
    isRecord(value.scene) &&
    Array.isArray(value.diagnostics) &&
    value.diagnostics.every((diagnostic) => typeof diagnostic === "string") &&
    Array.isArray(value.appliedOperations)
  )
}

function isSolverSnapshot(value: unknown): value is SolverSnapshot {
  return isRecord(value) && isNumberRecord(value.currents) && isComponentStates(value.componentStates)
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "number")
}

function isComponentStates(value: unknown): value is SolverSnapshot["componentStates"] {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (entry) => isRecord(entry) && (entry.on === undefined || typeof entry.on === "boolean"),
    )
  )
}

function isPluginWindowKind(value: unknown): value is PluginWindowKind {
  return (
    value === "simulation" ||
    value === "elab-tutor" ||
    value === "essential" ||
    value === "function" ||
    value === "drawing-hd" ||
    value === "web" ||
    value === "marketplace" ||
    value === "user-created"
  )
}

function isPluginWindowSource(value: unknown): value is PluginWindowSource {
  return value === "builtin" || value === "essential" || value === "marketplace" || value === "user"
}

function isPluginReadiness(value: unknown): value is PluginWindowCatalogItem["readiness"] {
  return value === "ready" || value === "preview" || value === "planned"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
