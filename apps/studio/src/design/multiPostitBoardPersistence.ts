import {
  isElabTutorPostitState,
  isSimulationPostitState,
  MULTI_POSTIT_WORKBENCH_STATE_SCHEMA,
  restoreMultiPostitWorkbenchPostit,
  restoreMultiPostitWorkbench,
  serializeMultiPostitWorkbench,
  type ElabTutorPostitState,
  type MultiPostitObject,
  type MultiPostitWorkbenchSnapshot,
  type SimulationPostitState,
} from "./multiPostitWorkbenchModel"
import { EMBED_DATA_KEY, instanceOwner } from "../toolhost/caps/board"
import {
  deriveFunctionSurfaceMode,
  pluginPostitControlIds,
  resizePluginPostitObject,
  type FunctionSurfaceMode,
  type PluginPostitObject,
  type PluginPostitControlIds,
  type PostitBounds,
  type PostitProximity,
} from "../toolhost/postitObject"

export const PLUGIN_POSTIT_BOARD_STATE_SCHEMA = "plugin-postit-board-state/2"
const LEGACY_PLUGIN_POSTIT_BOARD_STATE_SCHEMA = "plugin-postit-board-state/1"
const PLUGIN_POSTIT_BOARD_LINK_SCHEME = "maestro-tool://"

type PluginPostitBoardMarker = {
  owner: string
  schema: typeof PLUGIN_POSTIT_BOARD_STATE_SCHEMA
  state: PluginPostitObject
}

type RestorablePluginPostitBoardMarker = {
  owner: string
  sourceVersion: 1 | 2
  state: unknown
}

export type PluginPostitBoardElement = {
  id: string
  type: "embeddable"
  x: number
  y: number
  width: number
  height: number
  angle: number
  strokeColor: string
  backgroundColor: string
  fillStyle: "solid"
  strokeWidth: number
  strokeStyle: "solid"
  roughness: number
  opacity: number
  roundness: { type: 3 }
  seed: number
  version: number
  versionNonce: number
  index: null
  isDeleted: boolean
  groupIds: string[]
  frameId: null
  boundElements: null
  updated: number
  link: string
  locked: boolean
  customData: {
    [EMBED_DATA_KEY]: PluginPostitBoardMarker
  }
}

export type PluginPostitBoardScene = {
  type: "excalidraw"
  elements: PluginPostitBoardElement[]
  appState: Record<string, unknown>
}

export type PluginPostitBoardSceneStore = {
  loadScene(room: string): Promise<string | null>
}

export type PluginPostitBoardRenderModel = {
  elementId: string
  link: string
  owner: string
  instanceId: string
  pluginId: string
  bounds: PostitBounds
  zIndex: number
  selected: boolean
  hovered: boolean
  proximity: PostitProximity
  functionSurfaceMode: FunctionSurfaceMode
  controlIds: PluginPostitControlIds
  providerStatus?: SimulationPostitState["providerStatus"]
  runtimeState?: SimulationPostitState["runtimeState"]
  providerOutput?: SimulationPostitState["providerOutput"]
  elabTutorRuntime?: Pick<ElabTutorPostitState, "runtimeApi" | "simulationInstanceId">
}

export type PluginPostitBoardHydration = {
  room: string
  sceneType: "excalidraw"
  renderModels: PluginPostitBoardRenderModel[]
}

export function pluginPostitBoardElementId(instanceId: string): string {
  return `${pluginPostitControlIds({ instanceId }).rootId}-board`
}

export function createPluginPostitBoardScene(
  postits: readonly MultiPostitObject[],
): PluginPostitBoardScene {
  const snapshot = serializeMultiPostitWorkbench(postits)
  return {
    type: "excalidraw",
    elements: snapshot.postits.map((postit, index) => createPluginPostitBoardElement(postit, index)),
    appState: {},
  }
}

export function restorePluginPostitsFromBoardScene(scene: unknown): MultiPostitObject[] {
  if (!isRecord(scene)) {
    throw new Error("plugin post-it board scene must be an object")
  }
  if (!Array.isArray(scene.elements)) {
    throw new Error("plugin post-it board scene elements must be an array")
  }
  return restorePluginPostitsFromBoardElements(scene.elements)
}

export function restorePluginPostitsFromBoardElements(elements: readonly unknown[]): MultiPostitObject[] {
  const postits = elements.flatMap((element) => {
    const restored = restorePluginPostitFromBoardElement(element)
    return restored === null ? [] : [restored]
  })
  const snapshot: MultiPostitWorkbenchSnapshot = {
    schema: MULTI_POSTIT_WORKBENCH_STATE_SCHEMA,
    postits,
  }
  return restoreMultiPostitWorkbench(snapshot)
}

export async function loadPluginPostitBoardHydrationFromStore(
  store: PluginPostitBoardSceneStore,
  room: string,
): Promise<PluginPostitBoardHydration> {
  const sceneText = await store.loadScene(room)
  if (sceneText === null) {
    return {
      room,
      sceneType: "excalidraw",
      renderModels: [],
    }
  }
  return hydratePluginPostitBoardScene(JSON.parse(sceneText), room)
}

export function hydratePluginPostitBoardScene(
  scene: unknown,
  room: string,
): PluginPostitBoardHydration {
  if (!isRecord(scene)) {
    throw new Error("plugin post-it board hydration scene must be an object")
  }
  if (scene.type !== undefined && scene.type !== "excalidraw") {
    throw new Error("plugin post-it board hydration scene must be excalidraw")
  }
  return {
    room,
    sceneType: "excalidraw",
    renderModels: restorePluginPostitsFromBoardScene(scene).map(createPluginPostitBoardRenderModel),
  }
}

function createPluginPostitBoardElement(
  postit: MultiPostitObject,
  index: number,
): PluginPostitBoardElement {
  const elementId = pluginPostitBoardElementId(postit.instanceId)

  return {
    id: elementId,
    type: "embeddable",
    x: postit.bounds.x,
    y: postit.bounds.y,
    width: postit.bounds.width,
    height: postit.bounds.height,
    angle: 0,
    strokeColor: "#1f3f63",
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    roundness: { type: 3 },
    seed: 1733 + index,
    version: 1,
    versionNonce: 1733001 + index,
    index: null,
    isDeleted: false,
    groupIds: [],
    frameId: null,
    boundElements: null,
    updated: 0,
    link: pluginPostitBoardLink(postit.pluginId, elementId),
    locked: false,
    customData: {
      [EMBED_DATA_KEY]: {
        owner: instanceOwner(postit.pluginId, postit.instanceId),
        schema: PLUGIN_POSTIT_BOARD_STATE_SCHEMA,
        state: postit,
      },
    },
  }
}

function createPluginPostitBoardRenderModel(postit: MultiPostitObject): PluginPostitBoardRenderModel {
  const simulationState = isSimulationPostitState(postit.pluginState) ? postit.pluginState : null
  const elabTutorState = isElabTutorPostitState(postit.pluginState) ? postit.pluginState : null
  const elementId = pluginPostitBoardElementId(postit.instanceId)

  return {
    elementId,
    link: pluginPostitBoardLink(postit.pluginId, elementId),
    owner: instanceOwner(postit.pluginId, postit.instanceId),
    instanceId: postit.instanceId,
    pluginId: postit.pluginId,
    bounds: { ...postit.bounds },
    zIndex: postit.zIndex,
    selected: postit.selected,
    hovered: postit.hovered,
    proximity: postit.proximity,
    functionSurfaceMode: deriveFunctionSurfaceMode(postit),
    controlIds: pluginPostitControlIds(postit),
    providerStatus: simulationState?.providerStatus,
    runtimeState: simulationState?.runtimeState,
    providerOutput: simulationState?.providerOutput,
    elabTutorRuntime:
      elabTutorState === null
        ? undefined
        : {
            runtimeApi: elabTutorState.runtimeApi,
            simulationInstanceId: elabTutorState.simulationInstanceId,
          },
  }
}

function restorePluginPostitFromBoardElement(element: unknown): MultiPostitObject | null {
  if (!isRecord(element)) return null
  const marker = readPluginPostitBoardMarker(element)
  if (marker === null) return null
  if (element.type !== "embeddable") {
    throw new Error("plugin post-it board element must be embeddable")
  }

  const postit = restoreMultiPostitWorkbenchPostit(
    marker.state,
    marker.sourceVersion,
  )
  const expectedOwner = instanceOwner(postit.pluginId, postit.instanceId)
  if (marker.owner !== expectedOwner) {
    throw new Error(`plugin post-it owner mismatch for ${postit.instanceId}`)
  }
  assertPluginPostitBoardElementIdentity({
    sourceVersion: marker.sourceVersion,
    elementId: element.id,
    link: element.link,
    pluginId: postit.pluginId,
    instanceId: postit.instanceId,
  })
  return resizePluginPostitObject(postit, readBoardBounds(element))
}

function readPluginPostitBoardMarker(
  element: Record<string, unknown>,
): RestorablePluginPostitBoardMarker | null {
  const customData = element.customData
  if (!isRecord(customData)) return null
  const marker = customData[EMBED_DATA_KEY]
  if (!isRecord(marker)) return null
  const version = pluginPostitBoardStateVersion(marker.schema)
  if (version === null) return null
  if (typeof marker.owner !== "string") {
    throw new Error("plugin post-it board owner must be a string")
  }
  return {
    owner: marker.owner,
    sourceVersion: version,
    state: marker.state,
  }
}

export function pluginPostitBoardStateVersion(schema: unknown): 1 | 2 | null {
  if (schema === PLUGIN_POSTIT_BOARD_STATE_SCHEMA) return 2
  if (schema === LEGACY_PLUGIN_POSTIT_BOARD_STATE_SCHEMA) return 1
  return null
}

export function assertPluginPostitBoardElementIdentity(input: {
  sourceVersion: 1 | 2
  elementId: unknown
  link: unknown
  pluginId: string
  instanceId: string
  allowMissingLink?: boolean
}): void {
  const canonicalId = pluginPostitBoardElementId(input.instanceId)
  const legacyId = input.instanceId
  const isLegacyId = input.sourceVersion === 1 && input.elementId === legacyId
  if (input.elementId !== canonicalId && !isLegacyId) {
    throw new Error(`plugin post-it board id mismatch for ${input.instanceId}`)
  }
  const expectedLink = pluginPostitBoardLink(
    input.pluginId,
    isLegacyId ? legacyId : canonicalId,
  )
  if (
    input.allowMissingLink === true &&
    (input.link === null || input.link === undefined)
  ) {
    return
  }
  if (input.link !== expectedLink) {
    throw new Error(`plugin post-it board link mismatch for ${input.instanceId}`)
  }
}

function readBoardBounds(element: Record<string, unknown>): PostitBounds {
  const bounds = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  }
  if (!isBounds(bounds)) {
    throw new Error("plugin post-it board element bounds must be finite")
  }
  return bounds
}

function pluginPostitBoardLink(pluginId: string, embedId: string): string {
  return `${PLUGIN_POSTIT_BOARD_LINK_SCHEME}${pluginId}/${embedId}`
}

function isBounds(value: unknown): value is PostitBounds {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number" &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    Number.isFinite(value.width) &&
    Number.isFinite(value.height)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
