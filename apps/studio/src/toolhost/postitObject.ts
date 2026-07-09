import { assertInstanceId } from "./caps/instance"

export type PostitProximity = "far" | "near" | "active"

export type FunctionSurfaceMode = "hidden" | "compact" | "normal" | "expanded"

export type PostitBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type PluginPostitObject<TPluginState = unknown> = {
  kind: "plugin-postit-object"
  instanceId: string
  pluginId: string
  bounds: PostitBounds
  zIndex: number
  selected: boolean
  hovered: boolean
  proximity: PostitProximity
  pluginState: TPluginState
}

export type CreatePluginPostitObjectInput<TPluginState> = {
  instanceId: string
  pluginId: string
  bounds: PostitBounds
  zIndex: number
  selected?: boolean
  hovered?: boolean
  proximity?: PostitProximity
  pluginState: TPluginState
}

export type PluginPostitInteractionPatch = Partial<
  Pick<PluginPostitObject, "selected" | "hovered" | "proximity">
>

export type PluginPostitControlIds = {
  rootId: string
  keyboardScopeId: string
  hoverScopeId: string
  proximityScopeId: string
  functionSurfaceId: string
  providerDiagnosticsId: string
  solverOutputId: string
}

export type PluginPostitProviderOutput<TSolverOutput = unknown> = {
  instanceId: string
  pluginId: string
  providerId: string
  diagnostics: string[]
  solverOutput: TSolverOutput
}

export type ScopePluginPostitProviderOutputInput<TSolverOutput> = {
  providerId: string
  diagnostics: string[]
  solverOutput: TSolverOutput
}

export function createPluginPostitObject<TPluginState>(
  input: CreatePluginPostitObjectInput<TPluginState>,
): PluginPostitObject<TPluginState> {
  assertInstanceId(input.instanceId)
  assertPluginId(input.pluginId)
  assertBounds(input.bounds)
  assertZIndex(input.zIndex)

  return {
    kind: "plugin-postit-object",
    instanceId: input.instanceId,
    pluginId: input.pluginId,
    bounds: copyBounds(input.bounds),
    zIndex: input.zIndex,
    selected: input.selected ?? false,
    hovered: input.hovered ?? false,
    proximity: input.proximity ?? "far",
    pluginState: clonePluginState(input.pluginState),
  }
}

export function updatePluginPostitState<TPluginState>(
  postit: PluginPostitObject,
  pluginState: TPluginState,
): PluginPostitObject<TPluginState> {
  return {
    ...postit,
    pluginState: clonePluginState(pluginState),
  }
}

export function updatePluginPostitCollectionState<TPluginState>(
  postits: ReadonlyArray<PluginPostitObject<TPluginState>>,
  instanceId: string,
  pluginState: TPluginState,
): PluginPostitObject<TPluginState>[] {
  assertKnownPostitInstance(postits, instanceId)
  return postits.map((postit) =>
    postit.instanceId === instanceId ? updatePluginPostitState(postit, pluginState) : postit,
  )
}

export function updatePluginPostitCollectionInteraction<TPostit extends PluginPostitObject>(
  postits: ReadonlyArray<TPostit>,
  instanceId: string,
  patch: PluginPostitInteractionPatch,
): TPostit[] {
  assertKnownPostitInstance(postits, instanceId)
  assertInteractionPatch(patch)
  return postits.map((postit) =>
    postit.instanceId === instanceId ? ({ ...postit, ...patch } as TPostit) : postit,
  )
}

export function resizePluginPostitObject<TPluginState>(
  postit: PluginPostitObject<TPluginState>,
  bounds: Partial<PostitBounds>,
): PluginPostitObject<TPluginState> {
  const nextBounds = { ...postit.bounds, ...bounds }
  assertBounds(nextBounds)
  return {
    ...postit,
    bounds: nextBounds,
  }
}

export function serializePluginPostitObject<TPluginState>(
  postit: PluginPostitObject<TPluginState>,
): PluginPostitObject<TPluginState> {
  assertJsonFinitePluginState(postit.pluginState)
  return {
    ...postit,
    bounds: copyBounds(postit.bounds),
    pluginState: clonePluginState(postit.pluginState),
  }
}

export function restorePluginPostitObject<TPluginState = unknown>(
  payload: unknown,
): PluginPostitObject<TPluginState> {
  if (!isRecord(payload)) {
    throw new Error("serialized post-it must be an object")
  }
  if (payload.kind !== "plugin-postit-object") {
    throw new Error("invalid post-it kind")
  }
  if (typeof payload.instanceId !== "string") {
    throw new Error("instanceId must be a string")
  }
  if (typeof payload.pluginId !== "string") {
    throw new Error("pluginId must be a string")
  }
  if (!isBounds(payload.bounds)) {
    throw new Error("bounds must be an object")
  }
  if (typeof payload.zIndex !== "number") {
    throw new Error("zIndex must be a number")
  }
  if (typeof payload.selected !== "boolean") {
    throw new Error("selected must be a boolean")
  }
  if (typeof payload.hovered !== "boolean") {
    throw new Error("hovered must be a boolean")
  }
  if (!isPostitProximity(payload.proximity)) {
    throw new Error("invalid proximity")
  }

  return createPluginPostitObject({
    instanceId: payload.instanceId,
    pluginId: payload.pluginId,
    bounds: payload.bounds,
    zIndex: payload.zIndex,
    selected: payload.selected,
    hovered: payload.hovered,
    proximity: payload.proximity,
    pluginState: payload.pluginState as TPluginState,
  })
}

export function pluginPostitControlIds(postit: Pick<PluginPostitObject, "instanceId">): PluginPostitControlIds {
  assertInstanceId(postit.instanceId)
  const prefix = `plugin-postit-${postit.instanceId}`
  return {
    rootId: prefix,
    keyboardScopeId: `${prefix}-keyboard-scope`,
    hoverScopeId: `${prefix}-hover-scope`,
    proximityScopeId: `${prefix}-proximity-scope`,
    functionSurfaceId: `${prefix}-function-surface`,
    providerDiagnosticsId: `${prefix}-provider-diagnostics`,
    solverOutputId: `${prefix}-solver-output`,
  }
}

export function scopePluginPostitProviderOutput<TSolverOutput>(
  postit: Pick<PluginPostitObject, "instanceId" | "pluginId">,
  input: ScopePluginPostitProviderOutputInput<TSolverOutput>,
): PluginPostitProviderOutput<TSolverOutput> {
  assertInstanceId(postit.instanceId)
  assertPluginId(postit.pluginId)
  assertProviderId(input.providerId)
  assertDiagnostics(input.diagnostics)
  return {
    instanceId: postit.instanceId,
    pluginId: postit.pluginId,
    providerId: input.providerId,
    diagnostics: [...input.diagnostics],
    solverOutput: clonePluginState(input.solverOutput),
  }
}

export function deriveFunctionSurfaceMode(postit: PluginPostitObject): FunctionSurfaceMode {
  if (!postit.selected && !postit.hovered && postit.proximity === "far") {
    return "hidden"
  }

  const area = postit.bounds.width * postit.bounds.height
  const shortSide = Math.min(postit.bounds.width, postit.bounds.height)

  if (shortSide < 220 || area < 96_000) {
    return "compact"
  }
  if (area < 420_000) {
    return "normal"
  }
  return "expanded"
}

function assertKnownPostitInstance(
  postits: ReadonlyArray<Pick<PluginPostitObject, "instanceId">>,
  instanceId: string,
): void {
  assertInstanceId(instanceId)
  if (!postits.some((postit) => postit.instanceId === instanceId)) {
    throw new Error(`unknown post-it instance: ${instanceId}`)
  }
}

function assertInteractionPatch(patch: PluginPostitInteractionPatch): void {
  if (patch.selected !== undefined && typeof patch.selected !== "boolean") {
    throw new Error("selected must be a boolean")
  }
  if (patch.hovered !== undefined && typeof patch.hovered !== "boolean") {
    throw new Error("hovered must be a boolean")
  }
  if (patch.proximity !== undefined && !isPostitProximity(patch.proximity)) {
    throw new Error("invalid proximity")
  }
}

function assertPluginId(pluginId: string): void {
  if (pluginId.trim().length === 0) {
    throw new Error("pluginId must be non-empty")
  }
}

function assertProviderId(providerId: string): void {
  if (providerId.trim().length === 0) {
    throw new Error("providerId must be non-empty")
  }
}

function assertDiagnostics(diagnostics: readonly string[]): void {
  if (!diagnostics.every((diagnostic) => typeof diagnostic === "string")) {
    throw new Error("diagnostics must be strings")
  }
}

function assertBounds(bounds: PostitBounds): void {
  for (const [key, value] of Object.entries(bounds)) {
    if (!Number.isFinite(value)) {
      throw new Error(`invalid bounds.${key}`)
    }
  }
  if (bounds.width <= 0 || bounds.height <= 0) {
    throw new Error("bounds width and height must be positive")
  }
}

function isBounds(value: unknown): value is PostitBounds {
  if (!isRecord(value)) {
    return false
  }
  return (
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number"
  )
}

function assertZIndex(zIndex: number): void {
  if (!Number.isSafeInteger(zIndex)) {
    throw new Error("zIndex must be a safe integer")
  }
}

function isPostitProximity(value: unknown): value is PostitProximity {
  return value === "far" || value === "near" || value === "active"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function copyBounds(bounds: PostitBounds): PostitBounds {
  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  }
}

function clonePluginState<TPluginState>(state: TPluginState): TPluginState {
  return structuredClone(state)
}

function assertJsonFinitePluginState(value: unknown): void {
  assertJsonFiniteValue(value, "")
}

function assertJsonFiniteValue(value: unknown, path: string): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`plugin state contains non-finite number at ${path || "<root>"}`)
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertJsonFiniteValue(entry, `${path}[${index}]`))
    return
  }
  if (!isRecord(value)) return

  for (const [key, entry] of Object.entries(value)) {
    assertJsonFiniteValue(entry, path.length === 0 ? key : `${path}.${key}`)
  }
}
