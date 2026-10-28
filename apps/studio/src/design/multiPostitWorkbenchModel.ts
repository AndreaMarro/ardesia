import { isRetiredPlugin } from "../toolhost/retiredPlugins"
import {
  createPluginPostitObject,
  resizePluginPostitObject,
  restorePluginPostitObject,
  serializePluginPostitObject,
  type PluginPostitObject,
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

export const MULTI_POSTIT_WORKBENCH_STATE_SCHEMA = "multi-postit-workbench-state/1"

const SURFACE_BOUNDS = {
  compact: { width: 260, height: 180 },
  normal: { width: 560, height: 380 },
  expanded: { width: 960, height: 560 },
} as const

type WorkbenchSurfaceSize = keyof typeof SURFACE_BOUNDS

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

export type MultiPostitState = CatalogPluginPostitState
export type MultiPostitObject = PluginPostitObject<MultiPostitState>
export type MultiPostitWorkbenchSnapshot = {
  schema: typeof MULTI_POSTIT_WORKBENCH_STATE_SCHEMA
  postits: MultiPostitObject[]
}

export function createMultiPostitWorkbenchPostits(): MultiPostitObject[] {
  return []
}

export function createPostitFromPluginWindowInsert(
  request: PluginWindowInsertRequest,
  existingPostits: readonly MultiPostitObject[],
): MultiPostitObject {
  const item = request.item
  if (isRetiredPlugin(item.pluginId)) throw new Error(`retired plugin: ${item.pluginId}`)
  if (item.availability !== "available") {
    throw new Error(`plugin not insertable: ${item.pluginId}`)
  }

  const instanceId = nextPluginWindowPostitInstanceId(item, existingPostits)
  const bounds = pluginWindowPostitBounds(item, existingPostits.length)
  const zIndex = nextPluginWindowPostitZIndex(existingPostits)

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
  if (payload.schema !== MULTI_POSTIT_WORKBENCH_STATE_SCHEMA) {
    throw new Error("invalid multi post-it workbench schema")
  }
  if (!Array.isArray(payload.postits)) {
    throw new Error("serialized multi post-it workbench postits must be an array")
  }

  const restored = payload.postits.map((postit) =>
    restorePluginPostitObject<MultiPostitState>(postit),
  )
  assertUniquePostitInstances(restored)
  restored.forEach(assertWorkbenchPostit)
  return restored
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

function assertUniquePostitInstances(postits: readonly Pick<MultiPostitObject, "instanceId">[]): void {
  const ids = postits.map((postit) => postit.instanceId)
  if (new Set(ids).size !== ids.length) {
    throw new Error("duplicate plugin post-it instance")
  }
}

function assertWorkbenchPostit(postit: MultiPostitObject): void {
  if (isRetiredPlugin(postit.pluginId)) throw new Error(`retired plugin: ${postit.pluginId}`)
  assertCatalogPluginPostit(postit)
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

function isPluginWindowKind(value: unknown): value is PluginWindowKind {
  return (
    value === "simulation" ||
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
