import { isRetiredPlugin } from "../toolhost/retiredPlugins"
import { ESSENTIAL_PLUGINS, type PluginReadiness } from "../toolhost/essentialPlugins"
import type { LessonOsEvent } from "../lessonos/eventlog"
import type { PluginRegistryEntry } from "../lessonos/teacherDashboardProjection"
import type { PluginMarketplaceItem } from "../toolhost/marketplace/marketplaceItem"

export type PluginWindowKind =
  | "simulation"
  | "essential"
  | "function"
  | "drawing-hd"
  | "web"
  | "marketplace"
  | "user-created"

export type PluginWindowSource = "builtin" | "essential" | "marketplace" | "user"

export type PluginWindowAvailability = "available" | "disabled" | "unavailable"

export type LessonOsPluginInsertEvent = {
  type: "plugin.insert.requested"
  pluginId: string
  pluginKind: PluginWindowKind
  evidenceRefs: string[]
  label: string
}

export type PluginWindowCatalogItem = {
  id: string
  pluginId: string
  title: string
  description: string
  kind: PluginWindowKind
  source: PluginWindowSource
  readiness: PluginReadiness
  availability: PluginWindowAvailability
  version: string
  publisher: string
  disabledReason?: string
  lessonOs: {
    eventType: LessonOsPluginInsertEvent["type"]
    evidenceRef: string
  }
}

export type BuildDefaultPluginWindowCatalogInput = {
  marketplaceItems?: readonly PluginMarketplaceItem[]
  userCreated?: readonly PluginWindowCatalogItem[]
}

export type PluginWindowInsertRequest = {
  item: PluginWindowCatalogItem
  lessonOsEvent: LessonOsPluginInsertEvent
}

export type PluginMountedEventInput = {
  instanceId: string
  elementId: string
  room?: string
  t: number
}

export type PluginWindowRegistryEntry = PluginRegistryEntry & {
  pluginKind: PluginWindowKind
  source: PluginWindowSource
  evidenceRef: string
}

const BUILTIN_PLUGIN_ITEMS: readonly PluginWindowCatalogItem[] = [
  catalogItem({pluginId:"io.ardesia.fluid-thermo",title:"Fluidi e termodinamica",description:"Sedici laboratori configurabili con dati, preset e viste 2D/3D.",kind:"simulation",readiness:"preview",version:"1.0.0"}),
  catalogItem({
    pluginId: "com.ardesia.plugin-functions",
    title: "Funzioni",
    description: "Superficie funzioni per azioni compatte, normali o espanse nel post-it.",
    kind: "function",
    readiness: "ready",
    version: "0.1.0",
  }),
]

export function buildDefaultPluginWindowCatalog({
  marketplaceItems = [],
  userCreated = [],
}: BuildDefaultPluginWindowCatalogInput = {}): PluginWindowCatalogItem[] {
  return [
    ...BUILTIN_PLUGIN_ITEMS,
    ...ESSENTIAL_PLUGINS.map((plugin) =>
      catalogItem({
        pluginId: plugin.manifest.id,
        title: plugin.manifest.i18n?.it?.name ?? plugin.manifest.name,
        description: plugin.manifest.i18n?.it?.consentBlurb ?? plugin.manifest.name,
        kind: plugin.family ?? "essential",
        source: "essential",
        readiness: plugin.readiness,
        version: plugin.manifest.version,
        publisher: plugin.manifest.publisher.id,
      }),
    ),
    ...marketplaceItems.map(marketplacePluginToCatalogItem),
    ...userCreated,
  ].filter((item) => !isRetiredPlugin(item.pluginId))
}

export function createPluginWindowInsertRequest(item: PluginWindowCatalogItem): PluginWindowInsertRequest {
  if (isRetiredPlugin(item.pluginId)) throw new Error(`retired plugin: ${item.pluginId}`)
  return {
    item,
    lessonOsEvent: {
      type: item.lessonOs.eventType,
      pluginId: item.pluginId,
      pluginKind: item.kind,
      evidenceRefs: [item.lessonOs.evidenceRef],
      label: item.title,
    },
  }
}

export function pluginMountedEventFromInsertRequest(
  request: PluginWindowInsertRequest,
  input: PluginMountedEventInput,
): LessonOsEvent {
  return {
    kind: "plugin.mounted",
    pluginId: request.lessonOsEvent.pluginId,
    pluginKind: request.lessonOsEvent.pluginKind,
    instanceId: input.instanceId,
    ...(input.room === undefined ? {} : { room: input.room }),
    labels: { it: request.lessonOsEvent.label },
    evidence: [...request.lessonOsEvent.evidenceRefs, `board:${input.elementId}`],
    t: input.t,
  }
}

export function pluginRegistryFromCatalog(
  catalog: readonly PluginWindowCatalogItem[],
): PluginWindowRegistryEntry[] {
  const seen = new Set<string>()
  const entries: PluginWindowRegistryEntry[] = []

  for (const item of catalog) {
    if (seen.has(item.pluginId)) {
      throw new Error(`duplicate plugin catalog entry: ${item.pluginId}`)
    }
    seen.add(item.pluginId)
    entries.push({
      id: item.pluginId,
      version: item.version,
      publisher: item.publisher,
      kind: "tool",
      readiness: item.readiness,
      pluginKind: item.kind,
      source: item.source,
      evidenceRef: item.lessonOs.evidenceRef,
    })
  }

  return entries.sort((a, b) => byPluginId(a.id, b.id))
}

function marketplacePluginToCatalogItem(item: PluginMarketplaceItem): PluginWindowCatalogItem {
  const manifest = item.manifest
  const availability = item.availability.status
  return catalogItem({
    pluginId: manifest.id,
    title: manifest.i18n?.it?.name ?? manifest.name,
    description: manifest.i18n?.it?.consentBlurb ?? manifest.name,
    kind: "marketplace",
    source: "marketplace",
    readiness: availability === "available" ? "ready" : "preview",
    availability,
    disabledReason: item.availability.status === "unavailable" ? item.availability.reason : undefined,
    version: manifest.version,
    publisher: manifest.publisher.id,
  })
}

function byPluginId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function catalogItem(input: {
  pluginId: string
  title: string
  description: string
  kind: PluginWindowKind
  source?: PluginWindowSource
  readiness: PluginReadiness
  availability?: PluginWindowAvailability
  version: string
  publisher?: string
  disabledReason?: string
}): PluginWindowCatalogItem {
  return {
    id: input.pluginId,
    pluginId: input.pluginId,
    title: input.title,
    description: input.description,
    kind: input.kind,
    source: input.source ?? "builtin",
    readiness: input.readiness,
    availability: input.availability ?? "available",
    version: input.version,
    publisher: input.publisher ?? "ardesia",
    disabledReason: input.disabledReason,
    lessonOs: {
      eventType: "plugin.insert.requested",
      evidenceRef: `plugin:${input.pluginId}@${input.version}`,
    },
  }
}
