import {
  isElabTutorPostitState,
  isSimulationPostitState,
  restoreMultiPostitWorkbench,
  serializeMultiPostitWorkbench,
  type ElabTutorPostitState,
  type MultiPostitObject,
  type MultiPostitWorkbenchSnapshot,
  type SimulationPostitState,
} from "./multiPostitWorkbenchModel"
import { EMBED_DATA_KEY, instanceOwner } from "../toolhost/caps/board"
import { isValidToolId } from "../toolhost-protocol"
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

type PluginPostitNormalizableElement = {
  id?: string
  type?: string
  x?: unknown
  y?: unknown
  width?: unknown
  height?: unknown
  link?: string | null
  customData?: Record<string, unknown> | null
  startBinding?: { elementId?: unknown; [key: string]: unknown } | null
  endBinding?: { elementId?: unknown; [key: string]: unknown } | null
  containerId?: string | null
}

type ValidatedPluginPostitElement<TElement extends PluginPostitNormalizableElement> = {
  element: TElement
  marker: PluginPostitBoardMarker
  postit: MultiPostitObject
  bounds: PostitBounds
  canonical: boolean
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

export function normalizeDuplicatedPluginPostits<
  TElement extends PluginPostitNormalizableElement,
>(
  elements: readonly TElement[],
  knownIdRemap: ReadonlyMap<string, string> = new Map(),
): { elements: TElement[]; changed: boolean } {
  const validated = new Map<number, ValidatedPluginPostitElement<TElement>>()
  const canonicalSources = new Map<string, number>()
  const reservedInstanceIds = new Set<string>()
  const reservedElementIds = new Set<string>()
  const canonicalPluginElementIds = new Set<string>()
  const allocations = new Map<number, { instanceId: string; elementId: string }>()
  const structuralIdRemap = new Map<string, string>()

  elements.forEach((element, index) => {
    if (typeof element.id === "string") reservedElementIds.add(element.id)
    const pluginElement = validatePluginPostitElement(element)
    if (pluginElement === null) return

    validated.set(index, pluginElement)
    reservedInstanceIds.add(pluginElement.postit.instanceId)
    if (!pluginElement.canonical) return
    if (typeof pluginElement.element.id === "string") {
      canonicalPluginElementIds.add(pluginElement.element.id)
    }
    if (canonicalSources.has(pluginElement.postit.instanceId)) {
      throw new Error(`duplicate canonical plugin post-it for ${pluginElement.postit.instanceId}`)
    }
    canonicalSources.set(pluginElement.postit.instanceId, index)
  })

  for (const pluginElement of validated.values()) {
    if (
      !pluginElement.canonical &&
      !canonicalSources.has(pluginElement.postit.instanceId)
    ) {
      throw new Error(
        `plugin post-it clone has no canonical source for ${pluginElement.postit.instanceId}`,
      )
    }
  }

  for (const [index, pluginElement] of validated) {
    if (pluginElement.canonical) continue
    if (typeof pluginElement.element.id !== "string") {
      throw new Error(`plugin post-it clone id must be a string for ${pluginElement.postit.instanceId}`)
    }
    const instanceId = allocatePluginPostitCopyId(
      pluginElement.postit.instanceId,
      reservedInstanceIds,
      reservedElementIds,
    )
    const elementId = pluginPostitBoardElementId(instanceId)
    reservedInstanceIds.add(instanceId)
    reservedElementIds.add(elementId)
    canonicalPluginElementIds.add(elementId)
    if (structuralIdRemap.has(pluginElement.element.id)) {
      throw new Error(`duplicate plugin post-it clone id ${pluginElement.element.id}`)
    }
    structuralIdRemap.set(pluginElement.element.id, elementId)
    allocations.set(index, { instanceId, elementId })
  }

  for (const [from, to] of knownIdRemap) {
    if (from !== to && canonicalPluginElementIds.has(to) && !structuralIdRemap.has(from)) {
      structuralIdRemap.set(from, to)
    }
  }

  let changed = allocations.size > 0
  const pluginNormalized = elements.map((element, index) => {
    const pluginElement = validated.get(index)
    const allocation = allocations.get(index)
    if (pluginElement === undefined || allocation === undefined) return element

    const state = clonePluginPostitForInstance(
      pluginElement.postit,
      allocation.instanceId,
      pluginElement.bounds,
    )
    const customData = structuredClone(pluginElement.element.customData ?? {})
    customData[EMBED_DATA_KEY] = {
      owner: instanceOwner(state.pluginId, allocation.instanceId),
      schema: PLUGIN_POSTIT_BOARD_STATE_SCHEMA,
      state,
    } satisfies PluginPostitBoardMarker

    return {
      ...pluginElement.element,
      id: allocation.elementId,
      link: pluginPostitBoardLink(state.pluginId, allocation.elementId),
      customData,
    } as TElement
  })

  const normalized = pluginNormalized.map((element) => {
    const remapped = remapPluginPostitStructuralReferences(element, structuralIdRemap)
    if (remapped !== element) changed = true
    return remapped
  })

  return changed ? { elements: normalized, changed } : { elements: [...elements], changed }
}

function remapPluginPostitStructuralReferences<
  TElement extends PluginPostitNormalizableElement,
>(element: TElement, idRemap: ReadonlyMap<string, string>): TElement {
  let remapped: TElement | null = null

  for (const bindingKey of ["startBinding", "endBinding"] as const) {
    const binding = element[bindingKey]
    if (binding === null || binding === undefined || typeof binding.elementId !== "string") continue
    const canonicalId = idRemap.get(binding.elementId)
    if (canonicalId === undefined || canonicalId === binding.elementId) continue
    remapped ??= { ...element }
    remapped[bindingKey] = { ...binding, elementId: canonicalId }
  }

  if (typeof element.containerId === "string") {
    const canonicalId = idRemap.get(element.containerId)
    if (canonicalId !== undefined && canonicalId !== element.containerId) {
      remapped ??= { ...element }
      remapped.containerId = canonicalId
    }
  }

  return remapped ?? element
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

  const postit = restorePluginPostitObject(marker.state) as MultiPostitObject
  if (!isValidToolId(postit.pluginId)) {
    throw new Error(`invalid plugin id for ${postit.instanceId}`)
  }
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

function validatePluginPostitElement<TElement extends PluginPostitNormalizableElement>(
  element: TElement,
): ValidatedPluginPostitElement<TElement> | null {
  const rawElement = element as Record<string, unknown>
  const customData = rawElement.customData
  if (!isRecord(customData)) return null
  const rawMarker = customData[EMBED_DATA_KEY]
  if (!isRecord(rawMarker)) return null

  const markerState = rawMarker.state
  const claimsPluginPostit =
    (typeof rawMarker.schema === "string" &&
      rawMarker.schema.startsWith("plugin-postit-board-state/")) ||
    (isRecord(markerState) && markerState.kind === "plugin-postit-object")
  if (rawMarker.schema !== PLUGIN_POSTIT_BOARD_STATE_SCHEMA) {
    if (claimsPluginPostit) throw new Error("invalid plugin post-it board schema")
    return null
  }

  const marker = readPluginPostitBoardMarker(rawElement)
  if (marker === null) {
    throw new Error("invalid plugin post-it board marker")
  }
  if (element.type !== "embeddable") {
    throw new Error("plugin post-it board element must be embeddable")
  }

  const postit = restoreMultiPostitWorkbench({
    schema: "multi-postit-workbench-state/1",
    postits: [marker.state],
  })[0]!
  if (!isValidToolId(postit.pluginId)) {
    throw new Error(`invalid plugin id for ${postit.instanceId}`)
  }
  const expectedOwner = instanceOwner(postit.pluginId, postit.instanceId)
  if (marker.owner !== expectedOwner) {
    throw new Error(`plugin post-it owner mismatch for ${postit.instanceId}`)
  }

  const canonicalElementId = pluginPostitBoardElementId(postit.instanceId)
  const canonicalLink = pluginPostitBoardLink(postit.pluginId, canonicalElementId)
  const legacyElementId = postit.instanceId
  const legacyLink = pluginPostitBoardLink(postit.pluginId, legacyElementId)
  const canonical =
    (element.id === canonicalElementId && element.link === canonicalLink) ||
    (element.id === legacyElementId && element.link === legacyLink)
  if (element.link !== canonicalLink && element.link !== legacyLink) {
    throw new Error(`plugin post-it board link mismatch for ${postit.instanceId}`)
  }
  if (
    !canonical &&
    (element.id === canonicalElementId || element.id === legacyElementId)
  ) {
    throw new Error(`plugin post-it board identity mismatch for ${postit.instanceId}`)
  }

  const bounds = readBoardBounds(rawElement)
  resizePluginPostitObject(postit, bounds)
  return { element, marker, postit, bounds, canonical }
}

function allocatePluginPostitCopyId(
  sourceInstanceId: string,
  reservedInstanceIds: ReadonlySet<string>,
  reservedElementIds: ReadonlySet<string>,
): string {
  const attemptLimit = reservedInstanceIds.size + reservedElementIds.size + 2
  for (let ordinal = 1; ordinal <= attemptLimit; ordinal += 1) {
    const suffix = ordinal === 1 ? "--copy" : `--copy-${ordinal}`
    const sourceLength = 64 - suffix.length
    if (sourceLength < 1) break
    const candidate = `${sourceInstanceId.slice(0, sourceLength)}${suffix}`
    const elementId = pluginPostitBoardElementId(candidate)
    if (!reservedInstanceIds.has(candidate) && !reservedElementIds.has(elementId)) {
      return candidate
    }
  }
  throw new Error(`unable to allocate plugin post-it clone identity for ${sourceInstanceId}`)
}

function clonePluginPostitForInstance(
  source: MultiPostitObject,
  instanceId: string,
  bounds: PostitBounds,
): MultiPostitObject {
  const state = structuredClone(source) as MultiPostitObject
  state.instanceId = instanceId
  state.bounds = { ...bounds }
  if (isSimulationPostitState(state.pluginState)) {
    state.pluginState.runtimeState.instanceId = instanceId
    state.pluginState.providerOutput.instanceId = instanceId
  }
  return restoreMultiPostitWorkbench({
    schema: "multi-postit-workbench-state/1",
    postits: [state],
  })[0]!
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
