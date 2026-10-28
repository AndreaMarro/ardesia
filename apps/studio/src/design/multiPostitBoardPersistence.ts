import {
  restoreMultiPostitWorkbench,
  serializeMultiPostitWorkbench,
  type MultiPostitObject,
  type MultiPostitWorkbenchSnapshot,
} from "./multiPostitWorkbenchModel"
import { EMBED_DATA_KEY, instanceOwner } from "../toolhost/caps/board"
import {
  deriveFunctionSurfaceMode,
  pluginPostitControlIds,
  resizePluginPostitObject,
  restorePluginPostitObject,
  type FunctionSurfaceMode,
  type PluginPostitObject,
  type PluginPostitControlIds,
  type PostitBounds,
  type PostitProximity,
} from "../toolhost/postitObject"

export const PLUGIN_POSTIT_BOARD_STATE_SCHEMA = "plugin-postit-board-state/1"
const PLUGIN_POSTIT_BOARD_LINK_SCHEME = "maestro-tool://"

type PluginPostitBoardMarker = {
  owner: string
  schema: typeof PLUGIN_POSTIT_BOARD_STATE_SCHEMA
  state: PluginPostitObject
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
    schema: "multi-postit-workbench-state/1",
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

  }
}

function restorePluginPostitFromBoardElement(element: unknown): MultiPostitObject | null {
  if (!isRecord(element)) return null
  const marker = readPluginPostitBoardMarker(element)
  if (marker === null) return null
  if (element.type !== "embeddable") {
    throw new Error("plugin post-it board element must be embeddable")
  }

  const postit = restorePluginPostitObject(marker.state) as MultiPostitObject
  const expectedOwner = instanceOwner(postit.pluginId, postit.instanceId)
  if (marker.owner !== expectedOwner) {
    throw new Error(`plugin post-it owner mismatch for ${postit.instanceId}`)
  }
  const expectedElementId = pluginPostitBoardElementId(postit.instanceId)
  const expectedLink = pluginPostitBoardLink(postit.pluginId, expectedElementId)
  const legacyElementId = postit.instanceId
  const legacyLink = pluginPostitBoardLink(postit.pluginId, postit.instanceId)
  if (element.link === expectedLink && element.id === expectedElementId) {
    return resizePluginPostitObject(postit, readBoardBounds(element))
  }
  if (element.link === legacyLink && element.id === legacyElementId) {
    return resizePluginPostitObject(postit, readBoardBounds(element))
  }
  if (element.link !== expectedLink && element.link !== legacyLink) {
    throw new Error(`plugin post-it board link mismatch for ${postit.instanceId}`)
  }
  throw new Error(`plugin post-it board id mismatch for ${postit.instanceId}`)
}

function readPluginPostitBoardMarker(element: Record<string, unknown>): PluginPostitBoardMarker | null {
  const customData = element.customData
  if (!isRecord(customData)) return null
  const marker = customData[EMBED_DATA_KEY]
  if (!isRecord(marker)) return null
  if (marker.schema !== PLUGIN_POSTIT_BOARD_STATE_SCHEMA) return null
  if (typeof marker.owner !== "string") {
    throw new Error("plugin post-it board owner must be a string")
  }
  return {
    owner: marker.owner,
    schema: PLUGIN_POSTIT_BOARD_STATE_SCHEMA,
    state: marker.state as PluginPostitObject,
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
