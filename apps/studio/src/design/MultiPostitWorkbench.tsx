import { useState } from "react"
import { measureReadout } from "../core/contracts/ledReadout"
import postitFunctions from "@elab-pack/postitFunctions.json"
import {
  derivePluginFunctionSurface,
  type PluginFunctionDescriptor,
  type PluginFunctionPresentation,
  type PluginFunctionRole,
} from "../toolhost/pluginFunctions"
import { pluginPostitControlIds, updatePluginPostitCollectionState } from "../toolhost/postitObject"
import PluginWindow from "./PluginWindow"
import {
  createPostitFromPluginWindowInsert,
  createMultiPostitWorkbenchPostits,
  isCatalogPluginPostitState,
  isElabTutorPostitState,
  isSimulationPostitState,
  resizeMultiPostitInstance,
  restoreMultiPostitWorkbench,
  serializeMultiPostitWorkbench,
  type MultiPostitObject,
  type MultiPostitState,
  type MultiPostitWorkbenchSnapshot,
} from "./multiPostitWorkbenchModel"
import {
  createPluginPostitBoardScene,
  pluginPostitBoardElementId,
  restorePluginPostitsFromBoardScene,
  type PluginPostitBoardScene,
} from "./multiPostitBoardPersistence"
import {
  pluginMountedEventFromInsertRequest,
  type PluginWindowInsertRequest,
} from "./pluginWindowCatalog"
import type { EventLogStore } from "../lessonos/eventlog"

type PackFunctionSurface = {
  label: string
  role: string
}

type PackFunctionDescriptor = {
  id: string
  label: string
  priority: number
  dependencies?: PluginFunctionDescriptor["dependencies"] & {
    runtimeApi?: string
  }
  surfaces: Partial<Record<"compact" | "normal" | "expanded", PackFunctionSurface>>
}

const simulationFunctionDescriptors: readonly PluginFunctionDescriptor[] = [
  {
    id: "diagnostics",
    label: "Diagnostics",
    priority: 10,
    surfaces: {
      compact: { label: "Diag", role: "primary" },
      normal: { label: "Diagnostics", role: "primary" },
      expanded: { label: "Provider diagnostics", role: "workspace" },
    },
  },
]

const elabTutorFunctionDescriptors = toPluginFunctionDescriptors(
  postitFunctions.functions as PackFunctionDescriptor[],
)

const catalogPluginFunctionDescriptors: readonly PluginFunctionDescriptor[] = [
  {
    id: "open",
    label: "Apri",
    priority: 10,
    surfaces: {
      compact: { label: "Apri", role: "primary" },
      normal: { label: "Apri plugin", role: "primary" },
      expanded: { label: "Apri superficie plugin", role: "workspace" },
    },
  },
]

type MultiPostitWorkbenchProps = {
  eventLog?: EventLogStore
  room?: string
  now?: () => number
}

export function PluginWindowMultiPostitHarness({
  eventLog,
  room,
  now = Date.now,
}: MultiPostitWorkbenchProps = {}) {
  const [postits, setPostits] = useStateFromInitialPostits()
  const [lastInsert, setLastInsert] = useState<PluginWindowInsertRequest | null>(null)
  const [boardScene, setBoardScene] = useState<PluginPostitBoardScene | null>(null)

  function insertPluginPostit(request: PluginWindowInsertRequest) {
    setPostits((current) => {
      const postit = createPostitFromPluginWindowInsert(request, current)
      void eventLog?.append(
        pluginMountedEventFromInsertRequest(request, {
          instanceId: postit.instanceId,
          elementId: pluginPostitBoardElementId(postit.instanceId),
          ...(room === undefined ? {} : { room }),
          t: now(),
        }),
      )
      return [...current, postit]
    })
    setLastInsert(request)
  }

  function saveBoardPostits() {
    setBoardScene(createPluginPostitBoardScene(postits))
  }

  return (
    <main
      data-testid="plugin-window-workbench"
      data-plugin-window-workbench="ready"
      data-postit-count={postits.length}
      data-last-plugin-insert={lastInsert?.lessonOsEvent.pluginId ?? ""}
      data-board-postit-count={boardScene?.elements.length ?? 0}
      style={harnessShellStyle}
    >
      <aside style={pluginWindowRailStyle}>
        <PluginWindow onInsert={insertPluginPostit} />
        <button type="button" onClick={saveBoardPostits} style={buttonStyle}>
          salva board post-it da finestra
        </button>
      </aside>
      <section style={boardStyle} aria-label="Board-hosted plugin post-its">
        {postits.map((postit) => (
          <PluginPostitCard key={postit.instanceId} postit={postit} />
        ))}
      </section>
    </main>
  )
}

export default function MultiPostitWorkbench() {
  const [postits, setPostits] = useStateFromInitialPostits()
  const [snapshot, setSnapshot] = useState<MultiPostitWorkbenchSnapshot | null>(null)
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "snapshot-ready" | "restored">("idle")
  const [boardScene, setBoardScene] = useState<PluginPostitBoardScene | null>(null)
  const [boardReloadStatus, setBoardReloadStatus] = useState<"idle" | "board-ready" | "board-reloaded">(
    "idle",
  )

  function selectLedOnSimA() {
    setPostits((current) => {
      const postit = findPostit(current, "sim-a")
      if (!isSimulationPostitState(postit.pluginState)) return current
      return updatePluginPostitCollectionState<MultiPostitState>(current, "sim-a", {
        ...postit.pluginState,
        selectedComponentId: "led-a",
      })
    })
  }

  function resizeSimA(size: "compact" | "normal" | "expanded") {
    setPostits((current) => resizeMultiPostitInstance(current, "sim-a", size))
  }

  function exportPostits() {
    setSnapshot(serializeMultiPostitWorkbench(postits))
    setRestoreStatus("snapshot-ready")
  }

  function restorePostits() {
    if (snapshot === null) return
    setPostits(restoreMultiPostitWorkbench(snapshot))
    setRestoreStatus("restored")
  }

  function saveBoardPostits() {
    setBoardScene(createPluginPostitBoardScene(postits))
    setBoardReloadStatus("board-ready")
  }

  function reloadBoardPostits() {
    if (boardScene === null) return
    setPostits(restorePluginPostitsFromBoardScene(boardScene))
    setBoardReloadStatus("board-reloaded")
  }

  return (
    <main
      data-testid="multi-postit-workbench"
      data-multi-postit-workbench="ready"
      data-postit-restore-status={restoreStatus}
      data-serialized-postit-count={snapshot?.postits.length ?? 0}
      data-board-postit-reload-status={boardReloadStatus}
      data-board-postit-count={boardScene?.elements.length ?? 0}
      style={shellStyle}
    >
      <header style={headerStyle}>
        <div>
          <strong>Simulation post-it host</strong>
          <span style={headerSubStyle}>browser evidence</span>
        </div>
        <div style={toolbarStyle}>
          <button type="button" onClick={selectLedOnSimA} style={buttonStyle}>
            seleziona LED su sim-a
          </button>
          <button type="button" onClick={() => resizeSimA("compact")} style={buttonStyle}>
            riduci sim-a
          </button>
          <button type="button" onClick={() => resizeSimA("normal")} style={buttonStyle}>
            normalizza sim-a
          </button>
          <button type="button" onClick={() => resizeSimA("expanded")} style={buttonStyle}>
            espandi sim-a
          </button>
          <button type="button" onClick={exportPostits} style={buttonStyle}>
            esporta post-it
          </button>
          <button type="button" onClick={restorePostits} disabled={snapshot === null} style={buttonStyle}>
            ripristina post-it
          </button>
          <button type="button" onClick={saveBoardPostits} style={buttonStyle}>
            salva board post-it
          </button>
          <button type="button" onClick={reloadBoardPostits} disabled={boardScene === null} style={buttonStyle}>
            ricarica board post-it
          </button>
        </div>
      </header>
      <section style={boardStyle} aria-label="Board-hosted plugin post-its">
        {postits.map((postit) => (
          <PluginPostitCard key={postit.instanceId} postit={postit} />
        ))}
      </section>
    </main>
  )
}

function useStateFromInitialPostits() {
  return useState<MultiPostitObject[]>(createMultiPostitWorkbenchPostits)
}

function PluginPostitCard({ postit }: { postit: MultiPostitObject }) {
  const ids = pluginPostitControlIds(postit)
  const simulationState = isSimulationPostitState(postit.pluginState) ? postit.pluginState : null
  const elabTutorState = isElabTutorPostitState(postit.pluginState) ? postit.pluginState : null
  const catalogState = isCatalogPluginPostitState(postit.pluginState) ? postit.pluginState : null
  const descriptors =
    simulationState !== null
      ? simulationFunctionDescriptors
      : elabTutorState !== null
        ? elabTutorFunctionDescriptors
        : catalogPluginFunctionDescriptors
  const surface = derivePluginFunctionSurface(postit, descriptors)
  const pluginLabel =
    simulationState !== null ? "Simulation" : elabTutorState !== null ? "ELABTutor" : catalogState?.label ?? postit.pluginId
  const cardStyle = {
    ...postitStyle,
    width: Math.min(postit.bounds.width, 960),
    minHeight: Math.min(postit.bounds.height, 560),
  }

  return (
    <article
      id={ids.rootId}
      data-plugin-postit-instance={postit.instanceId}
      data-plugin-postit-plugin={postit.pluginId}
      style={cardStyle}
    >
      <div style={cardHeaderStyle}>
        <strong>{pluginLabel}</strong>
        <span>{postit.instanceId}</span>
      </div>
      <div id={ids.keyboardScopeId} data-keyboard-scope-instance={postit.instanceId} style={scopeRowStyle}>
        keyboard scope
      </div>
      <div id={ids.hoverScopeId} data-hover-scope-instance={postit.instanceId} style={scopeRowStyle}>
        hover: {postit.hovered ? "on" : "off"}
      </div>
      <div id={ids.proximityScopeId} data-proximity-scope-instance={postit.instanceId} style={scopeRowStyle}>
        proximity: {postit.proximity}
      </div>
      <div
        id={ids.functionSurfaceId}
        data-function-surface-instance={postit.instanceId}
        data-function-surface-mode={surface.mode}
        style={functionSurfaceStyle}
      >
        {surface.functions.map((fn) => (
          <span key={fn.id} data-function-id={fn.id} style={functionPillStyle}>
            {fn.label}
          </span>
        ))}
      </div>
      {simulationState !== null && (
        <>
          <div data-selected-component-instance={postit.instanceId} style={dataRowStyle}>
            {simulationState.selectedComponentId ?? "nessuno"}
          </div>
          <div
            id={ids.providerDiagnosticsId}
            data-provider-output-instance={postit.instanceId}
            style={dataRowStyle}
          >
            {simulationState.providerOutput.providerId}:{" "}
            {simulationState.providerOutput.diagnostics.join(", ")}
          </div>
          <div id={ids.solverOutputId} data-solver-output-instance={postit.instanceId} style={dataRowStyle}>
            led current {measureReadout(simulationState.providerOutput.solverOutput.currents.led, null)}
          </div>
        </>
      )}
      {elabTutorState !== null && (
        <div
          data-elabtutor-runtime-api={elabTutorState.runtimeApi}
          data-elabtutor-simulation-instance={elabTutorState.simulationInstanceId}
          style={dataRowStyle}
        >
          consumer of {elabTutorState.simulationInstanceId}
        </div>
      )}
      {catalogState !== null && (
        <div
          data-catalog-plugin-kind={catalogState.pluginKind}
          data-plugin-evidence-ref={catalogState.evidenceRef}
          style={dataRowStyle}
        >
          {catalogState.source}: {catalogState.readiness}
        </div>
      )}
    </article>
  )
}

function toPluginFunctionDescriptors(
  descriptors: readonly PackFunctionDescriptor[],
): readonly PluginFunctionDescriptor[] {
  return descriptors.map((descriptor) => ({
    id: descriptor.id,
    label: descriptor.label,
    priority: descriptor.priority,
    dependencies: descriptor.dependencies,
    surfaces: Object.fromEntries(
      Object.entries(descriptor.surfaces).map(([mode, presentation]) => [
        mode,
        toPluginFunctionPresentation(presentation),
      ]),
    ) as PluginFunctionDescriptor["surfaces"],
  }))
}

function toPluginFunctionPresentation(
  presentation: PackFunctionSurface | undefined,
): PluginFunctionPresentation {
  if (presentation === undefined) {
    throw new Error("missing post-it function presentation")
  }
  return {
    label: presentation.label,
    role: toPluginFunctionRole(presentation.role),
  }
}

function toPluginFunctionRole(role: string): PluginFunctionRole {
  if (role === "contextual" || role === "primary" || role === "workspace") return role
  throw new Error(`invalid plugin function role: ${role}`)
}

function findPostit(postits: readonly MultiPostitObject[], instanceId: string): MultiPostitObject {
  const postit = postits.find((candidate) => candidate.instanceId === instanceId)
  if (postit === undefined) {
    throw new Error(`unknown post-it instance: ${instanceId}`)
  }
  return postit
}

const shellStyle = {
  minHeight: "100vh",
  background: "#f6f3ee",
  color: "#233044",
  display: "grid",
  gridTemplateRows: "auto 1fr",
} as const

const harnessShellStyle = {
  minHeight: "100vh",
  background: "#f6f3ee",
  color: "#233044",
  display: "grid",
  gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)",
  alignItems: "start",
} as const

const pluginWindowRailStyle = {
  display: "grid",
  gap: 12,
  padding: 18,
  borderRight: "1px solid #d8d2c7",
  background: "#fffdf9",
} as const

const headerStyle = {
  minHeight: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "12px 18px",
  borderBottom: "1px solid #d8d2c7",
  background: "#fffdf9",
} as const

const headerSubStyle = {
  display: "block",
  marginTop: 2,
  fontSize: 12,
  color: "#6b7280",
} as const

const toolbarStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: 8,
} as const

const buttonStyle = {
  minHeight: 32,
  border: "1px solid #9aa7b6",
  borderRadius: 7,
  background: "#ffffff",
  color: "#24364f",
  font: "700 12px var(--m-font-ui)",
  padding: "6px 10px",
} as const

const boardStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: 14,
  padding: 18,
  overflow: "auto",
} as const

const postitStyle = {
  maxWidth: "100%",
  display: "grid",
  gap: 8,
  alignContent: "start",
  border: "1px solid #c7b56d",
  borderRadius: 8,
  background: "#fff7c7",
  boxShadow: "0 8px 18px rgba(35,48,68,0.12)",
  padding: 12,
  boxSizing: "border-box",
} as const

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  minHeight: 28,
  font: "800 13px var(--m-font-ui)",
} as const

const scopeRowStyle = {
  minHeight: 24,
  display: "flex",
  alignItems: "center",
  borderRadius: 6,
  background: "rgba(255,255,255,0.58)",
  padding: "3px 7px",
  font: "650 12px var(--m-font-ui)",
  color: "#48576a",
} as const

const functionSurfaceStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  minHeight: 30,
} as const

const functionPillStyle = {
  minHeight: 26,
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid #a6b7c6",
  borderRadius: 7,
  background: "#eef7ff",
  color: "#1f3f63",
  padding: "3px 8px",
  font: "750 12px var(--m-font-ui)",
} as const

const dataRowStyle = {
  minHeight: 26,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  borderRadius: 6,
  background: "#ffffff",
  padding: "4px 8px",
  font: "650 12px var(--m-font-ui)",
  color: "#233044",
  overflowWrap: "anywhere",
} as const
