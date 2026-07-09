import { breadboardGeometry } from "../breadboard/simulationBreadboard"
import { providerCapabilityProfile, type ProviderId, type ProviderPhysics } from "../providers/simulationProviders"
import { registerElectricalCatalog } from "../solver/catalog"
import { getComponent, type CatalogEntry, type CatalogPin } from "../solver/components/registry.js"

export const SIMULATION_COMPONENT_CATALOG_SCHEMA = "simulation-component-catalog/1" as const

export type SimulationComponentCatalogCategory =
  | "board"
  | "controller-board"
  | "power"
  | "passive"
  | "input"
  | "output"
  | "wire"

export type SimulationComponentCatalogPin = {
  id: string
  label?: string
  role?: string
  mapsTo?: string
}

export type SimulationComponentCatalogFootprint = {
  kind: "breadboard" | "controller-board" | "discrete" | "wire"
  width: number
  height: number
  placement: "board-scoped-grid" | "free-board" | "free-component" | "wire-path"
  connectionScope: "breadboard-nodes" | "component-pins" | "wire-endpoints"
  boardScoped: boolean
}

export type SimulationComponentCatalogVisual = {
  source: "simulation-plugin" | "provider-placeholder"
  assetId: string
}

export type SimulationComponentProviderSupport =
  | {
      status: "supported"
      physics: ProviderPhysics
    }
  | {
      status: "unsupported"
      physics: ProviderPhysics
      reason: string
    }

export type SimulationComponentKitAvailability = {
  packId: "io.elab.tutor"
  kitIds: string[]
  manualRefs: string[]
}

export type SimulationComponentCatalogEntry = {
  schema: typeof SIMULATION_COMPONENT_CATALOG_SCHEMA
  id: string
  label: string
  category: SimulationComponentCatalogCategory
  pins: SimulationComponentCatalogPin[]
  footprint: SimulationComponentCatalogFootprint
  visual: SimulationComponentCatalogVisual
  providerSupport: Partial<Record<ProviderId, SimulationComponentProviderSupport>>
  kitAvailability: SimulationComponentKitAvailability[]
}

export type SimulationComponentCatalogKitFilter = {
  packId: "io.elab.tutor"
  kitId?: string
  manualRef?: string
}

type SolverBackedCatalogMetadata = {
  id: string
  category?: SimulationComponentCatalogCategory
  footprint: SimulationComponentCatalogFootprint
  visual: SimulationComponentCatalogVisual
  kitAvailability: SimulationComponentKitAvailability[]
}

type UnsupportedCatalogMetadata = SolverBackedCatalogMetadata & {
  label: string
  pins: SimulationComponentCatalogPin[]
  providerSupport: Partial<Record<ProviderId, SimulationComponentProviderSupport>>
}

const BREADBOARD_FOOTPRINT: SimulationComponentCatalogFootprint = {
  kind: "breadboard",
  width: breadboardGeometry.viewBoxWidth,
  height: breadboardGeometry.viewBoxHeight,
  placement: "board-scoped-grid",
  connectionScope: "breadboard-nodes",
  boardScoped: true,
}

const DISCRETE_FOOTPRINT: SimulationComponentCatalogFootprint = {
  kind: "discrete",
  width: 72,
  height: 72,
  placement: "free-component",
  connectionScope: "component-pins",
  boardScoped: false,
}

const WIRE_FOOTPRINT: SimulationComponentCatalogFootprint = {
  kind: "wire",
  width: 0,
  height: 0,
  placement: "wire-path",
  connectionScope: "wire-endpoints",
  boardScoped: true,
}

const CONTROLLER_BOARD_FOOTPRINT: SimulationComponentCatalogFootprint = {
  kind: "controller-board",
  width: 260,
  height: 180,
  placement: "free-board",
  connectionScope: "component-pins",
  boardScoped: true,
}

const LOCAL_STATIC_SUPPORT: SimulationComponentProviderSupport = {
  status: "supported",
  physics: providerCapabilityProfile("local").targetPhysics[0] ?? "static-dc-circuit",
}

const ELAB_VOLUME_1_CAP6: SimulationComponentKitAvailability = {
  packId: "io.elab.tutor",
  kitIds: ["elab-volume-1"],
  manualRefs: ["vol1:cap6"],
}

const ELAB_VOLUME_1_CAP9: SimulationComponentKitAvailability = {
  packId: "io.elab.tutor",
  kitIds: ["elab-volume-1"],
  manualRefs: ["vol1:cap9"],
}

const ELAB_VOLUME_3_CAP8: SimulationComponentKitAvailability = {
  packId: "io.elab.tutor",
  kitIds: ["elab-volume-3"],
  manualRefs: ["vol3:cap8"],
}

const SOLVER_BACKED_COMPONENTS: readonly SolverBackedCatalogMetadata[] = [
  {
    id: "breadboard-half",
    category: "board",
    footprint: BREADBOARD_FOOTPRINT,
    visual: { source: "simulation-plugin", assetId: "breadboard-half" },
    kitAvailability: [ELAB_VOLUME_1_CAP6, ELAB_VOLUME_1_CAP9, ELAB_VOLUME_3_CAP8],
  },
  {
    id: "battery9v",
    footprint: DISCRETE_FOOTPRINT,
    visual: { source: "simulation-plugin", assetId: "battery9v" },
    kitAvailability: [ELAB_VOLUME_1_CAP6, ELAB_VOLUME_1_CAP9],
  },
  {
    id: "resistor",
    footprint: DISCRETE_FOOTPRINT,
    visual: { source: "simulation-plugin", assetId: "resistor" },
    kitAvailability: [ELAB_VOLUME_1_CAP6, ELAB_VOLUME_1_CAP9],
  },
  {
    id: "led",
    footprint: DISCRETE_FOOTPRINT,
    visual: { source: "simulation-plugin", assetId: "led" },
    kitAvailability: [ELAB_VOLUME_1_CAP6, ELAB_VOLUME_1_CAP9],
  },
  {
    id: "rgb-led",
    footprint: DISCRETE_FOOTPRINT,
    visual: { source: "simulation-plugin", assetId: "rgb-led" },
    kitAvailability: [ELAB_VOLUME_1_CAP9],
  },
  {
    id: "potentiometer",
    footprint: DISCRETE_FOOTPRINT,
    visual: { source: "simulation-plugin", assetId: "potentiometer" },
    kitAvailability: [ELAB_VOLUME_1_CAP9, ELAB_VOLUME_3_CAP8],
  },
  {
    id: "wire",
    footprint: WIRE_FOOTPRINT,
    visual: { source: "simulation-plugin", assetId: "wire" },
    kitAvailability: [ELAB_VOLUME_1_CAP6, ELAB_VOLUME_1_CAP9, ELAB_VOLUME_3_CAP8],
  },
] as const

const UNSUPPORTED_COMPONENTS: readonly UnsupportedCatalogMetadata[] = [
  {
    id: "nano-r4",
    label: "Arduino Nano R4",
    category: "controller-board",
    pins: [
      { id: "D13", label: "D13", role: "digital" },
      { id: "GND", label: "GND", role: "power" },
      { id: "5V", label: "5V", role: "power" },
      { id: "A0", label: "A0", role: "analog" },
    ],
    footprint: CONTROLLER_BOARD_FOOTPRINT,
    visual: { source: "provider-placeholder", assetId: "nano-r4" },
    providerSupport: {
      local: {
        status: "unsupported",
        physics: "runtime-microcontroller",
        reason: "local provider cannot solve Arduino Nano R4 runtime physics",
      },
    },
    kitAvailability: [ELAB_VOLUME_3_CAP8],
  },
] as const

export function listSimulationComponentCatalog(): SimulationComponentCatalogEntry[] {
  registerElectricalCatalog()
  return [
    ...SOLVER_BACKED_COMPONENTS.map(entryFromSolverMetadata),
    ...UNSUPPORTED_COMPONENTS.map(entryFromUnsupportedMetadata),
  ].map(cloneCatalogEntry)
}

export function getSimulationComponentCatalogEntry(
  id: string,
): SimulationComponentCatalogEntry | null {
  return listSimulationComponentCatalog().find((entry) => entry.id === id) ?? null
}

export function filterSimulationComponentCatalogForKit(
  catalog: readonly SimulationComponentCatalogEntry[],
  filter: SimulationComponentCatalogKitFilter,
): SimulationComponentCatalogEntry[] {
  return catalog.filter((entry) =>
    entry.kitAvailability.some((availability) => matchesKitFilter(availability, filter)),
  )
}

function entryFromSolverMetadata(
  metadata: SolverBackedCatalogMetadata,
): SimulationComponentCatalogEntry {
  const solverEntry = getComponent(metadata.id)
  if (solverEntry === null) {
    throw new Error(`missing solver catalog entry for ${metadata.id}`)
  }
  return {
    schema: SIMULATION_COMPONENT_CATALOG_SCHEMA,
    id: metadata.id,
    label: solverEntry.label ?? metadata.id,
    category: metadata.category ?? solverCategory(solverEntry),
    pins: pinsFromSolverEntry(solverEntry),
    footprint: { ...metadata.footprint },
    visual: { ...metadata.visual },
    providerSupport: { local: { ...LOCAL_STATIC_SUPPORT } },
    kitAvailability: cloneKitAvailability(metadata.kitAvailability),
  }
}

function entryFromUnsupportedMetadata(
  metadata: UnsupportedCatalogMetadata,
): SimulationComponentCatalogEntry {
  return {
    schema: SIMULATION_COMPONENT_CATALOG_SCHEMA,
    id: metadata.id,
    label: metadata.label,
    category: metadata.category ?? "controller-board",
    pins: metadata.pins.map(cloneCatalogPin),
    footprint: { ...metadata.footprint },
    visual: { ...metadata.visual },
    providerSupport: cloneProviderSupport(metadata.providerSupport),
    kitAvailability: cloneKitAvailability(metadata.kitAvailability),
  }
}

function solverCategory(entry: CatalogEntry): SimulationComponentCatalogCategory {
  const category = entry.category ?? "passive"
  if (isSimulationComponentCatalogCategory(category)) return category
  return "passive"
}

function isSimulationComponentCatalogCategory(
  value: string,
): value is SimulationComponentCatalogCategory {
  return [
    "board",
    "controller-board",
    "power",
    "passive",
    "input",
    "output",
    "wire",
  ].includes(value)
}

function pinsFromSolverEntry(entry: CatalogEntry): SimulationComponentCatalogPin[] {
  return (entry.pins ?? []).map(pinFromSolverPin)
}

function pinFromSolverPin(pin: CatalogPin): SimulationComponentCatalogPin {
  return {
    id: pin.id,
    ...(pin.label !== undefined ? { label: pin.label } : {}),
    ...(pin.type !== undefined ? { role: pin.type } : {}),
    ...(pin.mapsTo !== undefined ? { mapsTo: pin.mapsTo } : {}),
  }
}

function matchesKitFilter(
  availability: SimulationComponentKitAvailability,
  filter: SimulationComponentCatalogKitFilter,
): boolean {
  const packMatches = availability.packId === filter.packId
  const kitMatches = filter.kitId === undefined || availability.kitIds.includes(filter.kitId)
  const manualMatches =
    filter.manualRef === undefined || availability.manualRefs.includes(filter.manualRef)
  return packMatches && kitMatches && manualMatches
}

function cloneCatalogEntry(
  entry: SimulationComponentCatalogEntry,
): SimulationComponentCatalogEntry {
  return {
    schema: entry.schema,
    id: entry.id,
    label: entry.label,
    category: entry.category,
    pins: entry.pins.map(cloneCatalogPin),
    footprint: { ...entry.footprint },
    visual: { ...entry.visual },
    providerSupport: cloneProviderSupport(entry.providerSupport),
    kitAvailability: cloneKitAvailability(entry.kitAvailability),
  }
}

function cloneCatalogPin(pin: SimulationComponentCatalogPin): SimulationComponentCatalogPin {
  return {
    id: pin.id,
    ...(pin.label !== undefined ? { label: pin.label } : {}),
    ...(pin.role !== undefined ? { role: pin.role } : {}),
    ...(pin.mapsTo !== undefined ? { mapsTo: pin.mapsTo } : {}),
  }
}

function cloneProviderSupport(
  support: Partial<Record<ProviderId, SimulationComponentProviderSupport>>,
): Partial<Record<ProviderId, SimulationComponentProviderSupport>> {
  return Object.fromEntries(
    Object.entries(support).map(([providerId, providerSupport]) => [
      providerId,
      { ...providerSupport },
    ]),
  ) as Partial<Record<ProviderId, SimulationComponentProviderSupport>>
}

function cloneKitAvailability(
  availability: readonly SimulationComponentKitAvailability[],
): SimulationComponentKitAvailability[] {
  return availability.map((entry) => ({
    packId: entry.packId,
    kitIds: [...entry.kitIds],
    manualRefs: [...entry.manualRefs],
  }))
}
