/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties, ReactElement } from "react"
import { measureReadout } from "../core/contracts/ledReadout"

import {
  isElabTutorPostitState,
  isSimulationPostitState,
  type ElabTutorPostitState,
  type MultiPostitObject,
  type SimulationPostitState,
} from "../design/multiPostitWorkbenchModel"
import {
  PLUGIN_POSTIT_BOARD_STATE_SCHEMA,
  pluginPostitBoardElementId,
  pluginPostitBoardLink,
  type PluginPostitBoardRenderModel,
} from "../design/multiPostitBoardPersistence"
import { EMBED_DATA_KEY, instanceOwner } from "./caps/board"
import {
  deriveFunctionSurfaceMode,
  pluginPostitControlIds,
  resizePluginPostitObject,
  restorePluginPostitObject,
  type PluginPostitObject,
  type PostitBounds,
} from "./postitObject"

type PluginPostitBoardEmbedLike = {
  id?: string
  type?: string
  link?: string | null
  customData?: Record<string, unknown> | null
  [key: string]: unknown
}

const simulationFunctionLabels = ["Circuito", "Provider", "Diagnostica", "Montaggio"]
const elabTutorFunctionLabels = ["Manuale", "Simulatore", "Passi", "Errori comuni"]
const genericPluginFunctionLabels = ["Apri", "Configura"]

export function renderPluginPostitBoardEmbeddable(
  element: PluginPostitBoardEmbedLike,
): ReactElement | null {
  const model = createRenderModelFromElement(element)
  return model === null ? null : <PluginPostitBoardCard model={model} />
}

function createRenderModelFromElement(element: PluginPostitBoardEmbedLike): PluginPostitBoardRenderModel | null {
  const marker = readPluginPostitBoardMarker(element)
  if (marker === null) return null
  if (element.type !== "embeddable") {
    throw new Error("plugin post-it board element must be embeddable")
  }

  const postit = resizePluginPostitObject(
    restorePluginPostitObject(marker.state) as MultiPostitObject,
    readBoardBounds(element),
  )
  const expectedOwner = instanceOwner(postit.pluginId, postit.instanceId)
  if (marker.owner !== expectedOwner) {
    throw new Error(`plugin post-it owner mismatch for ${postit.instanceId}`)
  }
  const expectedElementId = pluginPostitBoardElementId(postit.instanceId)
  if (element.id !== expectedElementId) {
    throw new Error(`plugin post-it board id mismatch for ${postit.instanceId}`)
  }
  if (
    element.link !== null &&
    element.link !== undefined &&
    element.link !== pluginPostitBoardLink(postit.pluginId, expectedElementId)
  ) {
    throw new Error(`plugin post-it board link mismatch for ${postit.instanceId}`)
  }
  const simulationState = isSimulationPostitState(postit.pluginState) ? postit.pluginState : null
  const elabTutorState = isElabTutorPostitState(postit.pluginState) ? postit.pluginState : null

  return {
    elementId: expectedElementId,
    link: typeof element.link === "string" ? element.link : "",
    owner: marker.owner,
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
    elabTutorRuntime: elabTutorRuntime(elabTutorState),
  }
}

function elabTutorRuntime(
  state: ElabTutorPostitState | null,
): Pick<ElabTutorPostitState, "runtimeApi" | "simulationInstanceId"> | undefined {
  return state === null
    ? undefined
    : {
        runtimeApi: state.runtimeApi,
        simulationInstanceId: state.simulationInstanceId,
      }
}

function readPluginPostitBoardMarker(
  element: PluginPostitBoardEmbedLike,
): { owner: string; state: PluginPostitObject<SimulationPostitState | ElabTutorPostitState> } | null {
  const marker = element.customData?.[EMBED_DATA_KEY]
  if (!isRecord(marker)) return null
  if (marker.schema !== PLUGIN_POSTIT_BOARD_STATE_SCHEMA) return null
  if (typeof marker.owner !== "string") {
    throw new Error("plugin post-it board owner must be a string")
  }
  return {
    owner: marker.owner,
    state: marker.state as PluginPostitObject<SimulationPostitState | ElabTutorPostitState>,
  }
}

function readBoardBounds(element: PluginPostitBoardEmbedLike): PostitBounds {
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

function PluginPostitBoardCard({ model }: { model: PluginPostitBoardRenderModel }) {
  const pluginLabel =
    model.pluginId === "io.ardesia.simulation"
      ? "Simulation"
      : model.pluginId === "io.elab.tutor"
        ? "ELABTutor"
        : model.pluginId
  const functionLabels =
    model.pluginId === "io.ardesia.simulation"
      ? simulationFunctionLabels
      : model.pluginId === "io.elab.tutor"
        ? elabTutorFunctionLabels
        : genericPluginFunctionLabels
  const visibleFunctions =
    model.functionSurfaceMode === "compact" ? functionLabels.slice(0, 2) : functionLabels
  // Espressione citata verbatim dal CARDINE (P1-3): `currents.led ?? 0`
  // «puo' trasformare un valore assente in uno zero apparente».
  const ledCurrent = measureReadout(model.providerOutput?.solverOutput.currents.led, null)

  return (
    <article
      id={model.controlIds.rootId}
      aria-label={`${pluginLabel} post-it ${model.instanceId}`}
      data-plugin-postit-board-schema={PLUGIN_POSTIT_BOARD_STATE_SCHEMA}
      data-plugin-postit-instance={model.instanceId}
      data-plugin-postit-plugin={model.pluginId}
      style={cardStyle}
    >
      <div style={headerStyle}>
        <strong style={titleStyle}>{pluginLabel}</strong>
        <span style={instanceStyle}>{model.instanceId}</span>
      </div>
      <div
        id={model.controlIds.keyboardScopeId}
        data-keyboard-scope-instance={model.instanceId}
        style={scopeRowStyle}
      >
        keyboard scope
      </div>
      <div
        id={model.controlIds.hoverScopeId}
        data-hover-scope-instance={model.instanceId}
        style={scopeRowStyle}
      >
        hover: {model.hovered ? "on" : "off"}
      </div>
      <div
        id={model.controlIds.proximityScopeId}
        data-proximity-scope-instance={model.instanceId}
        style={scopeRowStyle}
      >
        proximity: {model.proximity}
      </div>
      <div
        id={model.controlIds.functionSurfaceId}
        data-function-surface-instance={model.instanceId}
        data-function-surface-mode={model.functionSurfaceMode}
        style={functionSurfaceStyle}
      >
        {visibleFunctions.map((label) => (
          <span key={label} data-function-id={label.toLowerCase()} style={functionPillStyle}>
            {label}
          </span>
        ))}
      </div>
      {model.providerOutput !== undefined && (
        <>
          <div
            id={model.controlIds.providerDiagnosticsId}
            data-provider-output-instance={model.instanceId}
            style={dataRowStyle}
          >
            {model.providerOutput.providerId}: {model.providerOutput.diagnostics.join(", ")}
          </div>
          <div
            id={model.controlIds.solverOutputId}
            data-solver-output-instance={model.instanceId}
            style={dataRowStyle}
          >
            led current {ledCurrent}
          </div>
        </>
      )}
      {model.elabTutorRuntime !== undefined && (
        <div
          data-elabtutor-runtime-api={model.elabTutorRuntime.runtimeApi}
          data-elabtutor-simulation-instance={model.elabTutorRuntime.simulationInstanceId}
          style={dataRowStyle}
        >
          consumer of {model.elabTutorRuntime.simulationInstanceId}
        </div>
      )}
    </article>
  )
}

const cardStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 12,
  border: "1px solid #44606f",
  borderRadius: 8,
  background: "#fffdf5",
  color: "#152026",
  fontFamily: "Inter, Nunito, system-ui, sans-serif",
  fontSize: 13,
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
}

const titleStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.2,
}

const instanceStyle: CSSProperties = {
  fontSize: 12,
  color: "#4b6471",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}

const scopeRowStyle: CSSProperties = {
  color: "#4b6471",
  fontSize: 12,
  lineHeight: 1.3,
}

const functionSurfaceStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  minHeight: 28,
}

const functionPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 24,
  padding: "3px 8px",
  border: "1px solid #b5c6cd",
  borderRadius: 6,
  background: "#eef6f3",
  color: "#20323a",
  fontSize: 12,
  lineHeight: 1.1,
}

const dataRowStyle: CSSProperties = {
  color: "#243640",
  background: "#f3f6f0",
  borderRadius: 6,
  padding: "5px 7px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}
