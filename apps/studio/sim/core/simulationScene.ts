import {
  ELAB_BREADBOARD_COLUMNS,
  ELAB_RAILS,
  ELAB_TERMINAL_ROWS,
  ELAB_TOP_TERMINAL_ROWS,
  pointForBreadboardRef,
  type BreadboardRailName,
  type BreadboardTerminalRow,
} from "../breadboard/simulationBreadboard"

export type SimulationSourceKind =
  | "wokwi-diagram-json"
  | "manual-description"
  | "image-observation"
  | "kicad-schematic"
  | "fritzing-part"
  | "elab-pack"

export type SimulationPoint = {
  x: number
  y: number
}

export type SimulationPose = SimulationPoint & {
  rotation?: number
}

export type SimulationComponent = {
  id: string
  type: string
  label?: string
  pose: SimulationPose
  attrs?: Record<string, string | number | boolean>
  pins?: SimulationComponentPin[]
}

export type SimulationComponentPin = {
  id: string
  label?: string
  role?: string
}

export type SimulationBreadboardKind = "breadboard-half" | "breadboard-full"

export type SimulationBreadboardRail = BreadboardRailName

export type SimulationBreadboardModel = {
  id: string
  kind: SimulationBreadboardKind
  columns: number
  terminalRows: string[]
  rails: SimulationBreadboardRail[]
}

export type SimulationWirePath = {
  kind: "orthogonal" | "polyline"
  points: SimulationPoint[]
  sourceInstructions?: string[]
}

export type SimulationWire = {
  id: string
  from: string
  to: string
  color: string
  path?: SimulationWirePath
}

export type SimulationSceneSource = {
  kind: SimulationSourceKind
  label: string
  status: "draft" | "reviewed" | "verified" | "blocked"
  blocker?: string
}

export type SimulationScene = {
  schemaVersion: "simulation-scene/2"
  id: string
  title: string
  domain: "electronics"
  breadboards?: SimulationBreadboardModel[]
  components: SimulationComponent[]
  pinAssignments?: Record<string, string>
  wires: SimulationWire[]
  provenance: {
    source: SimulationSceneSource
    derivedFrom?: SimulationSceneSource[]
  }
  adapters: {
    source: SimulationSourceKind
    solver: Array<"local" | "fastapi" | "ngspice-wasm" | "external-adapter">
  }
}

export type SimulationSceneNormalized = {
  components: string[]
  pinAssignments?: string[]
  wires: string[]
}

export type SimulationSceneReadiness = {
  ok: boolean
  blockers: string[]
}

export type SimulationSceneBreadboardTopology = {
  id: string
  kind: SimulationBreadboardKind
  terminalNodeIds: string[]
  railNodeIds: string[]
}

export type SimulationSceneControllerBoardTopology = {
  id: string
  type: string
  pinNodeIds: string[]
}

export type SimulationSceneMultiBoardTopology = {
  breadboards: SimulationSceneBreadboardTopology[]
  controllerBoards: SimulationSceneControllerBoardTopology[]
  componentPinNodeIds: string[]
  nodeIds: string[]
}

export type ParsedSimulationSnapRef =
  | {
      kind: "terminal"
      boardId: string
      row: string
      column: number
      nodeId: string
    }
  | {
      kind: "rail"
      boardId: string
      rail: SimulationBreadboardRail
      column: number
      nodeId: string
    }

export type SimulationSnapPoint = ParsedSimulationSnapRef & SimulationPoint & {
  ref: string
}

export type SimulationWireEndpointKind =
  | "breadboard-terminal"
  | "breadboard-rail"
  | "component-pin"

export type SimulationWireEndpointDescriptor = {
  ref: string
  kind: SimulationWireEndpointKind
  componentId: string
  pinId: string
  nodeId: string
  assignedRef?: string
}

export type SimulationEditableWirePoint = SimulationPoint & {
  index: number
  role: "anchor" | "waypoint"
  editable: boolean
}

export type SimulationEditableWire = {
  id: string
  color: string
  from: SimulationWireEndpointDescriptor
  to: SimulationWireEndpointDescriptor
  pathPoints: SimulationEditableWirePoint[]
  pathKind?: SimulationWirePath["kind"]
  sourceInstructions?: string[]
}

export type SimulationValidationCode =
  | "empty-scene"
  | "duplicate-component-id"
  | "invalid-component-pose"
  | "duplicate-breadboard-id"
  | "invalid-breadboard-model"
  | "unknown-pin-component"
  | "unknown-pin-name"
  | "invalid-pin-target"
  | "invalid-wire-endpoint"
  | "invalid-wire-path"
  | "blocked-source"

export type SimulationValidationIssue = {
  code: SimulationValidationCode
  severity: "blocker" | "warning"
  message: string
}

export type SimulationValidationReport = {
  ok: boolean
  issues: SimulationValidationIssue[]
  blockers: string[]
}

const UPPER_TERMINAL_ROWS = new Set<BreadboardTerminalRow>(ELAB_TOP_TERMINAL_ROWS)
const VALID_TERMINAL_ROWS = new Set<string>(ELAB_TERMINAL_ROWS)
const VALID_RAILS = new Set<string>(ELAB_RAILS)
const TERMINAL_RE = /^([^:]+):([a-j])([1-9]\d*)$/
const RAIL_RE = /^([^:]+):(bus-(?:top|bot)-(?:plus|minus))-([1-9]\d*)$/

export function normalizeSimulationScene(scene: SimulationScene): SimulationSceneNormalized {
  const pinAssignments = Object.entries(scene.pinAssignments ?? {})
    .map(([pin, ref]) => `${pin}->${ref}`)
    .sort((a, b) => a.localeCompare(b))

  return {
    components: scene.components
      .map((component) => `${component.id}:${component.type}`)
      .sort((a, b) => a.localeCompare(b)),
    ...(pinAssignments.length > 0 ? { pinAssignments } : {}),
    wires: scene.wires
      .map((wire) => `${wire.from}->${wire.to}`)
      .sort((a, b) => a.localeCompare(b)),
  }
}

export function sceneReadiness(scene: SimulationScene): SimulationSceneReadiness {
  const report = validateSimulationScene(scene)
  return { ok: report.ok, blockers: report.blockers }
}

export function endpointComponentId(endpoint: string): string {
  const separator = endpoint.indexOf(":")
  return separator === -1 ? endpoint : endpoint.slice(0, separator)
}

export function createBreadboardModel(
  id: string,
  kind: SimulationBreadboardKind = "breadboard-half",
): SimulationBreadboardModel {
  return {
    id,
    kind,
    columns: ELAB_BREADBOARD_COLUMNS,
    terminalRows: [...ELAB_TERMINAL_ROWS],
    rails: [...ELAB_RAILS],
  }
}

export function sceneBreadboards(scene: SimulationScene): SimulationBreadboardModel[] {
  const explicit = scene.breadboards ?? []
  const explicitIds = new Set(explicit.map((model) => model.id))
  const inferred = scene.components
    .filter((component) => isBreadboardComponent(component) && !explicitIds.has(component.id))
    .map((component) => createBreadboardModel(component.id, breadboardKindForComponent(component)))
  return [...explicit, ...inferred]
}

export function simulationSceneMultiBoardTopology(
  scene: SimulationScene,
): SimulationSceneMultiBoardTopology {
  const breadboards = sceneBreadboards(scene).map((board) => {
    const terminalNodeIds = uniqueSorted(
      board.terminalRows.flatMap((row) =>
        rangeColumns(board).map((column) => `${board.id}:tie-${terminalSide(row)}-${column}`),
      ),
    )
    const railNodeIds = uniqueSorted(board.rails.map((rail) => `${board.id}:${rail}`))

    return {
      id: board.id,
      kind: board.kind,
      terminalNodeIds,
      railNodeIds,
    }
  })
  const controllerBoards = scene.components
    .filter(isControllerBoardComponent)
    .map((component) => ({
      id: component.id,
      type: component.type,
      pinNodeIds: componentPinNodeIds(component),
    }))
    .sort((left, right) => left.id.localeCompare(right.id))
  const componentPinNodes = uniqueSorted(
    scene.components
      .filter((component) => !isBreadboardComponent(component))
      .flatMap(componentPinNodeIds),
  )

  return {
    breadboards,
    controllerBoards,
    componentPinNodeIds: componentPinNodes,
    nodeIds: uniqueSorted([
      ...breadboards.flatMap((board) => [...board.terminalNodeIds, ...board.railNodeIds]),
      ...componentPinNodes,
    ]),
  }
}

export function parseSimulationSnapRef(
  ref: string,
  scene: SimulationScene,
): ParsedSimulationSnapRef | null {
  const boards = new Map(sceneBreadboards(scene).map((board) => [board.id, board]))
  const terminal = TERMINAL_RE.exec(ref)
  if (terminal) {
    const board = boards.get(terminal[1])
    if (board === undefined) return null
    const row = terminal[2]
    const column = Number(terminal[3])
    if (!board.terminalRows.includes(row) || !isValidColumn(column, board)) return null
    return {
      kind: "terminal",
      boardId: board.id,
      row,
      column,
      nodeId: `${board.id}:tie-${terminalSide(row)}-${column}`,
    }
  }

  const rail = RAIL_RE.exec(ref)
  if (rail) {
    const board = boards.get(rail[1])
    if (board === undefined) return null
    const railName = rail[2] as SimulationBreadboardRail
    const column = Number(rail[3])
    if (!board.rails.includes(railName) || !isValidColumn(column, board)) return null
    return {
      kind: "rail",
      boardId: board.id,
      rail: railName,
      column,
      nodeId: `${board.id}:${railName}`,
    }
  }

  return null
}

export function pointForSimulationSnapRef(
  ref: string,
  scene: SimulationScene,
): SimulationSnapPoint | null {
  const parsed = parseSimulationSnapRef(ref, scene)
  if (parsed === null) return null
  return { ...parsed, ref, ...snapPoint(parsed) }
}

export function editableWiresForScene(scene: SimulationScene): SimulationEditableWire[] {
  return scene.wires.map((wire) => ({
    id: wire.id,
    color: wire.color,
    from: describeWireEndpoint(scene, wire.from),
    to: describeWireEndpoint(scene, wire.to),
    pathPoints: editablePathPoints(wire.path),
    ...(wire.path !== undefined ? { pathKind: wire.path.kind } : {}),
    ...(wire.path?.sourceInstructions !== undefined
      ? { sourceInstructions: [...wire.path.sourceInstructions] }
      : {}),
  }))
}

export function simulationSnapPointsForBoard(
  board: SimulationBreadboardModel,
): SimulationSnapPoint[] {
  const scene: SimulationScene = {
    schemaVersion: "simulation-scene/2",
    id: `${board.id}-snap-model`,
    title: board.id,
    domain: "electronics",
    breadboards: [board],
    components: [],
    wires: [],
    provenance: {
      source: {
        kind: "manual-description",
        label: "technical snap model",
        status: "draft",
      },
    },
    adapters: { source: "manual-description", solver: ["local"] },
  }
  const terminalRefs = board.terminalRows.flatMap((row) =>
    rangeColumns(board).map((column) => `${board.id}:${row}${column}`),
  )
  const railRefs = board.rails.flatMap((rail) =>
    rangeColumns(board).map((column) => `${board.id}:${rail}-${column}`),
  )
  return [...terminalRefs, ...railRefs]
    .map((ref) => pointForSimulationSnapRef(ref, scene))
    .filter((point): point is SimulationSnapPoint => point !== null)
}

export function validateSimulationScene(scene: SimulationScene): SimulationValidationReport {
  const issues: SimulationValidationIssue[] = []
  const componentById = new Map<string, SimulationComponent>()
  const breadboards = sceneBreadboards(scene)
  const breadboardIds = new Set<string>()

  const addIssue = (
    code: SimulationValidationCode,
    message: string,
    severity: SimulationValidationIssue["severity"] = "blocker",
  ): void => {
    issues.push({ code, severity, message })
  }

  if (scene.components.length === 0) {
    addIssue("empty-scene", "scene has no components")
  }
  if (scene.provenance.source.status === "blocked") {
    addIssue(
      "blocked-source",
      scene.provenance.source.blocker ?? "source is blocked",
    )
  }

  for (const component of scene.components) {
    if (componentById.has(component.id)) {
      addIssue("duplicate-component-id", `duplicate component id: ${component.id}`)
    }
    componentById.set(component.id, component)
    if (!Number.isFinite(component.pose.x) || !Number.isFinite(component.pose.y)) {
      addIssue("invalid-component-pose", `invalid pose: ${component.id}`)
    }
  }

  for (const board of breadboards) {
    if (breadboardIds.has(board.id)) {
      addIssue("duplicate-breadboard-id", `duplicate breadboard id: ${board.id}`)
    }
    breadboardIds.add(board.id)
    if (!isValidBreadboardModel(board)) {
      addIssue("invalid-breadboard-model", `invalid breadboard model: ${board.id}`)
    }
  }

  for (const [pinEndpoint, snapRef] of Object.entries(scene.pinAssignments ?? {})) {
    const pinIssue = validateComponentEndpoint(pinEndpoint, componentById)
    if (pinIssue !== null) addIssue(pinIssue.code, pinIssue.message)
    if (parseSimulationSnapRef(snapRef, scene) === null) {
      addIssue("invalid-pin-target", `invalid-pin-target: ${pinEndpoint} -> ${snapRef}`)
    }
  }

  for (const wire of scene.wires) {
    const fromIssue = validateWireEndpoint(wire.from, "from", wire.id, scene, componentById)
    const toIssue = validateWireEndpoint(wire.to, "to", wire.id, scene, componentById)
    if (fromIssue !== null) addIssue(fromIssue.code, fromIssue.message)
    if (toIssue !== null) addIssue(toIssue.code, toIssue.message)
    if (wire.path !== undefined && !isValidWirePath(wire.path)) {
      addIssue("invalid-wire-path", `invalid-wire-path: ${wire.id}`)
    }
  }

  const blockers = issues
    .filter((issue) => issue.severity === "blocker")
    .map((issue) => issue.message)

  return {
    ok: blockers.length === 0,
    issues,
    blockers,
  }
}

function validateWireEndpoint(
  endpoint: string,
  side: "from" | "to",
  wireId: string,
  scene: SimulationScene,
  componentById: Map<string, SimulationComponent>,
): Pick<SimulationValidationIssue, "code" | "message"> | null {
  if (parseSimulationSnapRef(endpoint, scene) !== null) return null
  const componentIssue = validateComponentEndpoint(endpoint, componentById)
  if (componentIssue === null) return null
  return {
    code: "invalid-wire-endpoint",
    message: `invalid-wire-endpoint: ${wireId} ${side} ${endpoint}`,
  }
}

function validateComponentEndpoint(
  endpoint: string,
  componentById: Map<string, SimulationComponent>,
): Pick<SimulationValidationIssue, "code" | "message"> | null {
  const separator = endpoint.indexOf(":")
  if (separator === -1) {
    return { code: "unknown-pin-component", message: `unknown-pin-component: ${endpoint}` }
  }
  const componentId = endpoint.slice(0, separator)
  const pinName = endpoint.slice(separator + 1)
  const component = componentById.get(componentId)
  if (component === undefined || isBreadboardComponent(component)) {
    return { code: "unknown-pin-component", message: `unknown-pin-component: ${endpoint}` }
  }
  if (pinName.trim() === "") {
    return { code: "unknown-pin-name", message: `unknown-pin-name: ${endpoint}` }
  }
  if (component.pins !== undefined && component.pins.every((pin) => pin.id !== pinName)) {
    return { code: "unknown-pin-name", message: `unknown-pin-name: ${endpoint}` }
  }
  return null
}

function isValidWirePath(path: SimulationWirePath): boolean {
  return (
    path.points.length >= 2 &&
    path.points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
  )
}

function describeWireEndpoint(
  scene: SimulationScene,
  ref: string,
): SimulationWireEndpointDescriptor {
  const parsed = parseSimulationSnapRef(ref, scene)
  const parts = endpointParts(ref)
  if (parsed !== null) {
    return {
      ref,
      kind: parsed.kind === "terminal" ? "breadboard-terminal" : "breadboard-rail",
      componentId: parsed.boardId,
      pinId:
        parsed.kind === "terminal"
          ? `${parsed.row}${parsed.column}`
          : `${parsed.rail}-${parsed.column}`,
      nodeId: parsed.nodeId,
    }
  }

  const assignedRef = scene.pinAssignments?.[ref]
  const assigned = assignedRef === undefined ? null : parseSimulationSnapRef(assignedRef, scene)
  return {
    ref,
    kind: "component-pin",
    componentId: parts.componentId,
    pinId: parts.pinId,
    nodeId: assigned?.nodeId ?? ref,
    ...(assignedRef !== undefined ? { assignedRef } : {}),
  }
}

function editablePathPoints(path: SimulationWirePath | undefined): SimulationEditableWirePoint[] {
  if (path === undefined) return []
  const lastIndex = path.points.length - 1
  return path.points.map((point, index) => ({
    ...point,
    index,
    role: index === 0 || index === lastIndex ? "anchor" : "waypoint",
    editable: index > 0 && index < lastIndex,
  }))
}

function endpointParts(ref: string): { componentId: string; pinId: string } {
  const separator = ref.indexOf(":")
  if (separator === -1) return { componentId: ref, pinId: "" }
  return {
    componentId: ref.slice(0, separator),
    pinId: ref.slice(separator + 1),
  }
}

function isBreadboardComponent(component: SimulationComponent): boolean {
  return component.type.includes("breadboard")
}

function isControllerBoardComponent(component: SimulationComponent): boolean {
  return /(arduino|nano|uno|mega|microcontroller|controller|board)/i.test(component.type)
    && !isBreadboardComponent(component)
}

function componentPinNodeIds(component: SimulationComponent): string[] {
  return (component.pins ?? [])
    .map((pin) => `${component.id}:${pin.id}`)
    .sort((left, right) => left.localeCompare(right))
}

function breadboardKindForComponent(component: SimulationComponent): SimulationBreadboardKind {
  return component.type.includes("full") ? "breadboard-full" : "breadboard-half"
}

function isValidColumn(column: number, board: SimulationBreadboardModel): boolean {
  return Number.isInteger(column) && column >= 1 && column <= board.columns
}

function isValidBreadboardModel(board: SimulationBreadboardModel): boolean {
  const terminalRows = new Set(board.terminalRows)
  const rails = new Set<string>(board.rails)
  return (
    Number.isInteger(board.columns) &&
    board.columns >= 1 &&
    board.terminalRows.length > 0 &&
    board.terminalRows.length === terminalRows.size &&
    board.terminalRows.every((row) => VALID_TERMINAL_ROWS.has(row)) &&
    board.rails.length > 0 &&
    board.rails.length === rails.size &&
    board.rails.every((rail) => VALID_RAILS.has(rail))
  )
}

function terminalSide(row: string): "top" | "bottom" {
  return UPPER_TERMINAL_ROWS.has(row as BreadboardTerminalRow) ? "top" : "bottom"
}

function rangeColumns(board: SimulationBreadboardModel): number[] {
  return Array.from({ length: board.columns }, (_, index) => index + 1)
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function snapPoint(parsed: ParsedSimulationSnapRef): SimulationPoint {
  const canonicalRef =
    parsed.kind === "rail"
      ? `bb1:${parsed.rail}-${parsed.column}`
      : `bb1:${parsed.row}${parsed.column}`
  const point = pointForBreadboardRef(canonicalRef)
  if (point === null) return { x: 0, y: 0 }
  return { x: point.x, y: point.y }
}
