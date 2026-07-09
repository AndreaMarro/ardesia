import { breadboardGeometry } from "../breadboard/simulationBreadboard"
import type { SimulationPoint, SimulationScene } from "./simulationScene"
import type { SimulationRuntimeState } from "./simulationRuntime"

export const SIMULATION_VIEWPORT_SCHEMA = "simulation-viewport/1" as const
export const SIMULATION_RUNTIME_VIEWPORT_SCHEMA = "simulation-runtime-viewport/1" as const

export type SimulationViewportSize = {
  width: number
  height: number
}

export type SimulationViewportBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

export type SimulationViewportContentItemKind =
  | "breadboard"
  | "controller-board"
  | "component"
  | "wire-path"

export type SimulationViewportContentItem = {
  id: string
  type: string
  kind: SimulationViewportContentItemKind
  bounds: SimulationViewportBounds
}

export type SimulationViewportContent = {
  bounds: SimulationViewportBounds
  items: SimulationViewportContentItem[]
}

export type SimulationViewportState = {
  schema: typeof SIMULATION_VIEWPORT_SCHEMA
  instanceId: string
  viewport: SimulationViewportSize
  pan: SimulationPoint
  zoom: number
  content: SimulationViewportContent
}

export type CreateSimulationViewportStateInput = {
  instanceId: string
  viewport: SimulationViewportSize
  pan?: SimulationPoint
  zoom?: number
  contentBounds?: SimulationViewportBounds
  contentItems?: SimulationViewportContentItem[]
}

export type FitSimulationViewportToSceneInput = {
  instanceId: string
  scene: SimulationScene
  viewport: SimulationViewportSize
  padding?: number
}

export type SimulationViewportPanDelta = {
  dx: number
  dy: number
}

export type SimulationViewportZoomPatch = {
  zoom: number
}

export type SimulationViewportPostitOrigin = {
  x: number
  y: number
}

export type SimulationViewportPostitBounds = SimulationViewportPostitOrigin &
  SimulationViewportSize

export type SimulationRuntimeViewportAttachment = {
  schema: typeof SIMULATION_RUNTIME_VIEWPORT_SCHEMA
  instanceId: string
  runtimeInstanceId: string
  viewport: SimulationViewportState
}

const EMPTY_CONTENT_BOUNDS: SimulationViewportBounds = {
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
}

const CONTROLLER_BOARD_SIZE: SimulationViewportSize = {
  width: 260,
  height: 180,
}

const GENERIC_COMPONENT_SIZE: SimulationViewportSize = {
  width: 72,
  height: 72,
}

export function createSimulationViewportState(
  input: CreateSimulationViewportStateInput,
): SimulationViewportState {
  assertInstanceId(input.instanceId)
  assertViewportSize(input.viewport)
  const pan = input.pan ?? { x: 0, y: 0 }
  const zoom = input.zoom ?? 1
  const contentBounds = input.contentBounds ?? EMPTY_CONTENT_BOUNDS
  const contentItems = input.contentItems ?? []
  assertPoint(pan, "pan")
  assertZoom(zoom)
  assertBounds(contentBounds, "content bounds")
  contentItems.forEach(assertContentItem)

  return {
    schema: SIMULATION_VIEWPORT_SCHEMA,
    instanceId: input.instanceId,
    viewport: { ...input.viewport },
    pan: { ...pan },
    zoom,
    content: {
      bounds: { ...contentBounds },
      items: contentItems.map(cloneContentItem),
    },
  }
}

export function fitSimulationViewportToScene(
  input: FitSimulationViewportToSceneInput,
): SimulationViewportState {
  assertInstanceId(input.instanceId)
  assertViewportSize(input.viewport)
  const padding = input.padding ?? 24
  assertNonNegativeFinite(padding, "padding")

  const content = measureSimulationViewportContent(input.scene, padding)
  const zoom = fitZoom(input.viewport, content.bounds)
  const pan = panForCenteredContent(input.viewport, content.bounds, zoom)
  return createSimulationViewportState({
    instanceId: input.instanceId,
    viewport: input.viewport,
    pan,
    zoom,
    contentBounds: content.bounds,
    contentItems: content.items,
  })
}

export function resizeSimulationViewport(
  state: SimulationViewportState,
  viewport: SimulationViewportSize,
): SimulationViewportState {
  assertSimulationViewportState(state)
  assertViewportSize(viewport)
  return createSimulationViewportState({
    instanceId: state.instanceId,
    viewport,
    pan: state.pan,
    zoom: state.zoom,
    contentBounds: state.content.bounds,
    contentItems: state.content.items,
  })
}

export function panSimulationViewport(
  state: SimulationViewportState,
  delta: SimulationViewportPanDelta,
): SimulationViewportState {
  assertSimulationViewportState(state)
  assertFiniteNumber(delta.dx, "pan dx")
  assertFiniteNumber(delta.dy, "pan dy")
  return createSimulationViewportState({
    instanceId: state.instanceId,
    viewport: state.viewport,
    pan: {
      x: state.pan.x + delta.dx,
      y: state.pan.y + delta.dy,
    },
    zoom: state.zoom,
    contentBounds: state.content.bounds,
    contentItems: state.content.items,
  })
}

export function zoomSimulationViewport(
  state: SimulationViewportState,
  patch: SimulationViewportZoomPatch,
): SimulationViewportState {
  assertSimulationViewportState(state)
  assertZoom(patch.zoom)
  return createSimulationViewportState({
    instanceId: state.instanceId,
    viewport: state.viewport,
    pan: state.pan,
    zoom: patch.zoom,
    contentBounds: state.content.bounds,
    contentItems: state.content.items,
  })
}

export function visibleWorldBoundsForViewport(
  state: SimulationViewportState,
): SimulationViewportBounds {
  assertSimulationViewportState(state)
  return {
    left: -state.pan.x / state.zoom,
    top: -state.pan.y / state.zoom,
    right: (state.viewport.width - state.pan.x) / state.zoom,
    bottom: (state.viewport.height - state.pan.y) / state.zoom,
  }
}

export function serializeSimulationViewportState(
  state: SimulationViewportState,
): SimulationViewportState {
  assertSimulationViewportState(state)
  return cloneViewportState(state)
}

export function restoreSimulationViewportState(
  serialized: SimulationViewportState,
): SimulationViewportState {
  assertSimulationViewportState(serialized)
  return cloneViewportState(serialized)
}

export function simulationViewportPostitBounds(
  state: SimulationViewportState,
  origin: SimulationViewportPostitOrigin,
): SimulationViewportPostitBounds {
  assertSimulationViewportState(state)
  assertFiniteNumber(origin.x, "origin x")
  assertFiniteNumber(origin.y, "origin y")
  return {
    x: origin.x,
    y: origin.y,
    width: state.viewport.width,
    height: state.viewport.height,
  }
}

export function attachSimulationViewportToRuntime(
  runtime: Pick<SimulationRuntimeState, "instanceId">,
  viewport: SimulationViewportState,
): SimulationRuntimeViewportAttachment {
  assertInstanceId(runtime.instanceId)
  assertSimulationViewportState(viewport)
  if (runtime.instanceId !== viewport.instanceId) {
    throw new Error("runtime and viewport instanceId must match")
  }
  return {
    schema: SIMULATION_RUNTIME_VIEWPORT_SCHEMA,
    instanceId: runtime.instanceId,
    runtimeInstanceId: runtime.instanceId,
    viewport: cloneViewportState(viewport),
  }
}

function measureSimulationViewportContent(
  scene: SimulationScene,
  padding: number,
): SimulationViewportContent {
  const componentItems = scene.components.map((component) => {
    const size = componentSize(component.type, component.pose.rotation)
    return {
      id: component.id,
      type: component.type,
      kind: componentKind(component.type),
      bounds: boundsFromOriginAndSize(component.pose, size),
    }
  })
  const wireItems = scene.wires
    .filter((wire) => wire.path !== undefined)
    .map((wire) => ({
      id: wire.id,
      type: "wire",
      kind: "wire-path" as const,
      bounds: boundsFromPoints(wire.path?.points ?? []),
    }))
  const items = [...componentItems, ...wireItems]
  const bounds = paddedBounds(unionBounds(items.map((item) => item.bounds)), padding)

  return {
    bounds,
    items,
  }
}

function componentKind(type: string): SimulationViewportContentItemKind {
  if (type.includes("breadboard")) return "breadboard"
  if (/(arduino|nano|uno|mega|microcontroller|controller|board)/i.test(type)) {
    return "controller-board"
  }
  return "component"
}

function componentSize(type: string, rotation: number | undefined): SimulationViewportSize {
  const base = baseComponentSize(type)
  if (rotation === undefined) return base
  const normalized = ((rotation % 360) + 360) % 360
  return normalized === 90 || normalized === 270
    ? { width: base.height, height: base.width }
    : base
}

function baseComponentSize(type: string): SimulationViewportSize {
  if (type.includes("breadboard")) {
    return {
      width: breadboardGeometry.viewBoxWidth,
      height: breadboardGeometry.viewBoxHeight,
    }
  }
  if (/(arduino|nano|uno|mega|microcontroller|controller|board)/i.test(type)) {
    return CONTROLLER_BOARD_SIZE
  }
  return GENERIC_COMPONENT_SIZE
}

function fitZoom(
  viewport: SimulationViewportSize,
  bounds: SimulationViewportBounds,
): number {
  const contentWidth = Math.max(bounds.right - bounds.left, 1)
  const contentHeight = Math.max(bounds.bottom - bounds.top, 1)
  return Math.min(1, viewport.width / contentWidth, viewport.height / contentHeight)
}

function panForCenteredContent(
  viewport: SimulationViewportSize,
  bounds: SimulationViewportBounds,
  zoom: number,
): SimulationPoint {
  const contentWidth = bounds.right - bounds.left
  const contentHeight = bounds.bottom - bounds.top
  return {
    x: (viewport.width - contentWidth * zoom) / 2 - bounds.left * zoom,
    y: (viewport.height - contentHeight * zoom) / 2 - bounds.top * zoom,
  }
}

function boundsFromOriginAndSize(
  origin: SimulationPoint,
  size: SimulationViewportSize,
): SimulationViewportBounds {
  return {
    left: origin.x,
    top: origin.y,
    right: origin.x + size.width,
    bottom: origin.y + size.height,
  }
}

function boundsFromPoints(points: SimulationPoint[]): SimulationViewportBounds {
  if (points.length === 0) return { ...EMPTY_CONTENT_BOUNDS }
  return {
    left: Math.min(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    right: Math.max(...points.map((point) => point.x)),
    bottom: Math.max(...points.map((point) => point.y)),
  }
}

function unionBounds(boundsList: SimulationViewportBounds[]): SimulationViewportBounds {
  if (boundsList.length === 0) return { ...EMPTY_CONTENT_BOUNDS }
  return {
    left: Math.min(...boundsList.map((bounds) => bounds.left)),
    top: Math.min(...boundsList.map((bounds) => bounds.top)),
    right: Math.max(...boundsList.map((bounds) => bounds.right)),
    bottom: Math.max(...boundsList.map((bounds) => bounds.bottom)),
  }
}

function paddedBounds(
  bounds: SimulationViewportBounds,
  padding: number,
): SimulationViewportBounds {
  return {
    left: bounds.left - padding,
    top: bounds.top - padding,
    right: bounds.right + padding,
    bottom: bounds.bottom + padding,
  }
}

function cloneViewportState(state: SimulationViewportState): SimulationViewportState {
  return createSimulationViewportState({
    instanceId: state.instanceId,
    viewport: state.viewport,
    pan: state.pan,
    zoom: state.zoom,
    contentBounds: state.content.bounds,
    contentItems: state.content.items,
  })
}

function cloneContentItem(item: SimulationViewportContentItem): SimulationViewportContentItem {
  return {
    id: item.id,
    type: item.type,
    kind: item.kind,
    bounds: { ...item.bounds },
  }
}

function assertSimulationViewportState(state: SimulationViewportState): void {
  if (!isRecord(state)) {
    throw new Error("simulation viewport state must be an object")
  }
  if (state.schema !== SIMULATION_VIEWPORT_SCHEMA) {
    throw new Error("simulation viewport state schema must be simulation-viewport/1")
  }
  assertInstanceId(state.instanceId)
  assertViewportSize(state.viewport)
  assertPoint(state.pan, "pan")
  assertZoom(state.zoom)
  if (!isRecord(state.content)) {
    throw new Error("simulation viewport content must be an object")
  }
  assertBounds(state.content.bounds, "content bounds")
  if (!Array.isArray(state.content.items)) {
    throw new Error("simulation viewport content items must be an array")
  }
  state.content.items.forEach(assertContentItem)
}

function assertContentItem(item: SimulationViewportContentItem): void {
  if (!isRecord(item)) {
    throw new Error("viewport content item must be an object")
  }
  if (typeof item.id !== "string" || item.id.trim() === "") {
    throw new Error("viewport content item id must be non-empty")
  }
  if (typeof item.type !== "string" || item.type.trim() === "") {
    throw new Error("viewport content item type must be non-empty")
  }
  if (!["breadboard", "controller-board", "component", "wire-path"].includes(item.kind)) {
    throw new Error("viewport content item kind is invalid")
  }
  assertBounds(item.bounds, "viewport content item bounds")
}

function assertViewportSize(viewport: SimulationViewportSize): void {
  if (!isRecord(viewport)) {
    throw new Error("viewport size must be an object")
  }
  assertPositiveFinite(viewport.width, "viewport width")
  assertPositiveFinite(viewport.height, "viewport height")
}

function assertBounds(bounds: SimulationViewportBounds, label: string): void {
  if (!isRecord(bounds)) {
    throw new Error(`${label} must be an object`)
  }
  assertFiniteNumber(bounds.left, `${label} left`)
  assertFiniteNumber(bounds.top, `${label} top`)
  assertFiniteNumber(bounds.right, `${label} right`)
  assertFiniteNumber(bounds.bottom, `${label} bottom`)
  if (bounds.right < bounds.left || bounds.bottom < bounds.top) {
    throw new Error(`${label} must have ordered edges`)
  }
}

function assertPoint(point: SimulationPoint, label: string): void {
  if (!isRecord(point)) {
    throw new Error(`${label} must be an object`)
  }
  assertFiniteNumber(point.x, `${label} x`)
  assertFiniteNumber(point.y, `${label} y`)
}

function assertInstanceId(instanceId: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(instanceId)) {
    throw new Error("simulation viewport instanceId must be a stable non-empty id")
  }
}

function assertZoom(zoom: number): void {
  assertPositiveFinite(zoom, "viewport zoom")
}

function assertPositiveFinite(value: number, label: string): void {
  assertFiniteNumber(value, label)
  if (value <= 0) {
    throw new Error(`${label} must be positive`)
  }
}

function assertNonNegativeFinite(value: number, label: string): void {
  assertFiniteNumber(value, label)
  if (value < 0) {
    throw new Error(`${label} must be non-negative`)
  }
}

function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
