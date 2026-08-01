import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react"
import {
  editableWiresForScene,
  normalizeSimulationScene,
  sceneReadiness,
  validateSimulationScene,
  type SimulationEditableWire,
  type SimulationEditableWirePoint,
  type SimulationScene,
} from "../../sim/core/simulationScene"
import {
  moveSimulationWireWaypoint,
  retargetSimulationWireEndpoint,
  type SimulationWireEditAction,
} from "../../sim/core/simulationWireEditor"
import {
  providerStatus,
  solveWithProvider,
  type ProviderId,
} from "../../sim/providers/simulationProviders"
import { LED_READOUT_LABELS, ledReadout, measureReadout } from "../core/contracts/ledReadout"
import { wokwiDiagramToSimulationScene } from "../../sim/core/wokwiDiagramAdapter"
import {
  structuredObservationToSimulationScene,
  type StructuredSceneObservation,
} from "../../sim/core/sourceIntake"
import { analyzeFreeAssembly } from "../../sim/freeAssembly"
import {
  createBoardSceneWithPlacements,
  createReferenceSimulationScene,
  SimulationBoard,
  type MontaggioCanvas,
  type MontaggioPlacement,
  type MontaggioTool,
} from "../toolhost/ToolCanvasEmbeddable"
import ViewNav from "./ViewNav"

const technicalHarnessDiagram = {
  version: 1,
  author: "Simulation Plugin technical harness",
  editor: "wokwi",
  parts: [
    { id: "bat1", type: "wokwi-battery-9v", left: 112, top: 286 },
    { id: "bb1", type: "wokwi-breadboard-half", left: 410, top: 390 },
    { id: "led1", type: "wokwi-led", left: 656, top: 236, attrs: { color: "red" } },
    { id: "r1", type: "wokwi-resistor", left: 464, top: 252, attrs: { value: "470" } },
  ],
  connections: [
    ["bat1:+", "bb1:bus-top-plus-1", "#dc2626", ["h166", "v-126"]],
    ["bb1:bus-top-plus-8", "r1:1", "#dc2626", ["v-132", "h52"]],
    ["r1:2", "led1:A", "#f59e0b", ["h74"]],
    ["led1:C", "bb1:a8", "#64748b", ["v146", "h-236"]],
    ["bb1:a8", "bat1:-", "#111827", ["h-260", "v-64"]],
  ],
}

type SourceMode = "wokwi" | "image" | "description"

const SIMULATION_HARNESS_STATUS =
  "simulation harness: canvas ELABTutor reale non ancora montato"

const imageObservation: StructuredSceneObservation = {
  kind: "image-observation" as const,
  label: "structured bench image observation",
  components: [
    { id: "battery1", type: "battery9v", x: 72, y: 168 },
    { id: "breadboard1", type: "breadboard-half", x: 150, y: 168 },
    { id: "led1", type: "led", x: 546, y: 158, attrs: { color: "red" } },
    { id: "r1", type: "resistor", x: 374, y: 184, attrs: { value: 470 } },
  ],
  wires: [
    {
      from: "battery1:+",
      to: "breadboard1:bus-top-plus-1",
      color: "#dc2626",
      points: [
        { x: 100, y: 196 },
        { x: 178, y: 196 },
      ],
    },
    {
      from: "breadboard1:bus-top-plus-8",
      to: "r1:1",
      color: "#dc2626",
      points: [
        { x: 178, y: 196 },
        { x: 374, y: 212 },
      ],
    },
    {
      from: "r1:2",
      to: "led1:A",
      color: "#f59e0b",
      points: [
        { x: 458, y: 212 },
        { x: 546, y: 186 },
      ],
    },
    {
      from: "led1:C",
      to: "breadboard1:a8",
      color: "#64748b",
      points: [
        { x: 580, y: 202 },
        { x: 238, y: 238 },
      ],
    },
    {
      from: "breadboard1:a8",
      to: "battery1:-",
      color: "#111827",
      points: [
        { x: 238, y: 238 },
        { x: 100, y: 238 },
      ],
    },
  ],
}

const descriptionObservation: StructuredSceneObservation = {
  kind: "manual-description" as const,
  label: "structured teacher description",
  components: [
    { id: "supply", type: "battery9v", x: 86, y: 160 },
    { id: "bb1", type: "breadboard-half", x: 150, y: 168 },
    { id: "r1", type: "resistor", x: 338, y: 178, attrs: { value: 470 } },
    { id: "led1", type: "led", x: 556, y: 158, attrs: { color: "red" } },
  ],
  wires: [
    {
      from: "supply:+",
      to: "bb1:bus-top-plus-1",
      color: "#dc2626",
      points: [
        { x: 114, y: 188 },
        { x: 178, y: 188 },
      ],
    },
    {
      from: "bb1:bus-top-plus-8",
      to: "r1:1",
      color: "#dc2626",
      points: [
        { x: 208, y: 188 },
        { x: 338, y: 206 },
      ],
    },
    {
      from: "r1:2",
      to: "led1:A",
      color: "#f59e0b",
      points: [
        { x: 422, y: 206 },
        { x: 556, y: 186 },
      ],
    },
    {
      from: "led1:C",
      to: "bb1:a8",
      color: "#64748b",
      points: [
        { x: 584, y: 214 },
        { x: 238, y: 238 },
      ],
    },
    {
      from: "bb1:a8",
      to: "supply:-",
      color: "#111827",
      points: [
        { x: 238, y: 238 },
        { x: 114, y: 238 },
      ],
    },
  ],
}

export default function SimulationPluginWorkbench() {
  const [sourceMode, setSourceMode] = useState<SourceMode>("wokwi")
  const narrowViewport = useNarrowViewport()
  const scene = useMemo(
    () => buildScene(sourceMode),
    [sourceMode],
  )
  const readiness = useMemo(() => sceneReadiness(scene), [scene])
  const normalized = useMemo(() => normalizeSimulationScene(scene), [scene])
  const validation = useMemo(() => validateSimulationScene(scene), [scene])
  const providerRows = useMemo(
    () => (["local", "fastapi", "ngspice-wasm"] satisfies ProviderId[]).map(providerStatus),
    [],
  )

  return (
    <div
      data-simulation-workbench-state={readiness.ok ? "ready" : "blocked"}
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}
    >
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">ARDESIA Simulation Harness</span>
        </span>
        <ViewNav current="simulatore" />
      </header>
      <main
        data-simulation-workbench-main
        style={narrowViewport ? narrowShellStyle : shellStyle}
      >
        <section aria-label="Simulation harness canvas" style={canvasShellStyle}>
          <SimulationSceneCanvas scene={scene} />
        </section>
        <aside style={narrowViewport ? narrowPanelColumnStyle : panelColumnStyle}>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">stato canvas</div>
            <div style={contractStyle}>
              <strong>harness</strong>
              <span>{SIMULATION_HARNESS_STATUS}</span>
            </div>
          </section>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">sorgenti scena</div>
            <div style={sourceGridStyle}>
              <button
                type="button"
                style={sourceMode === "wokwi" ? activeButtonStyle : buttonStyle}
                onClick={() => setSourceMode("wokwi")}
              >
                Wokwi diagram.json
              </button>
              <button
                type="button"
                style={sourceMode === "image" ? activeButtonStyle : buttonStyle}
                onClick={() => setSourceMode("image")}
              >
                Immagine
              </button>
              <button
                type="button"
                style={sourceMode === "description" ? activeButtonStyle : buttonStyle}
                onClick={() => setSourceMode("description")}
              >
                Descrizione
              </button>
            </div>
          </section>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">provider</div>
            <dl style={definitionListStyle}>
              {providerRows.map((provider) => (
                <div key={provider.id}>
                  <dt style={termStyle}>{provider.id}</dt>
                  <dd style={descriptionStyle}>
                    {provider.available ? "available" : provider.reason}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">contratto scena</div>
            <div style={contractStyle}>
              <strong>{scene.schemaVersion}</strong>
              <span data-simulation-source-kind>{scene.adapters.source}</span>
              <span>{normalized.components.length} componenti</span>
              <span>{normalized.wires.length} fili</span>
              <span>{readiness.ok ? "ready" : readiness.blockers.join(", ")}</span>
            </div>
          </section>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">diagnostica scena</div>
            <div style={contractStyle}>
              <strong data-scene-diagnostic-status>
                {validation.ok ? "ready" : "blocked"}
              </strong>
              <span>{validation.blockers.length} blocker</span>
              {validation.issues.length === 0 ? (
                <span>nessun blocker tecnico</span>
              ) : (
                validation.issues.map((issue) => (
                  <span key={`${issue.code}:${issue.message}`}>
                    {issue.code}: {issue.message}
                  </span>
                ))
              )}
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

function useNarrowViewport(): boolean {
  const [narrowViewport, setNarrowViewport] = useState(readNarrowViewport)

  useEffect(() => {
    const handleResize = () => setNarrowViewport(readNarrowViewport())
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return narrowViewport
}

function readNarrowViewport(): boolean {
  if (typeof window === "undefined") return false
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(max-width: 760px)").matches
  }
  return window.innerWidth <= 760
}

function buildScene(sourceMode: SourceMode) {
  if (sourceMode === "image") {
    return structuredObservationToSimulationScene(imageObservation, {
      id: "simulation-plugin-image-observation",
      title: "ARDESIA Simulation",
    })
  }
  if (sourceMode === "description") {
    return structuredObservationToSimulationScene(descriptionObservation, {
      id: "simulation-plugin-description-observation",
      title: "ARDESIA Simulation",
    })
  }
  return wokwiDiagramToSimulationScene(technicalHarnessDiagram, {
    id: "simulation-plugin-technical-harness",
    title: "ARDESIA Simulation",
  })
}

function SimulationSceneCanvas({ scene }: { scene: SimulationScene }) {
  const previewScene = useMemo(() => createReferenceSimulationScene({ ledOn: true }), [])
  const [montaggioTool, setMontaggioTool] = useState<MontaggioTool | null>(null)
  const [pendingHole, setPendingHole] = useState<string | null>(null)
  const [placements, setPlacements] = useState<MontaggioPlacement[]>([])
  const [montaggioNotice, setMontaggioNotice] = useState<string | null>(null)
  // ANNULLA one-step (D8): specchio dell'embed, volatile.
  const [undoSnapshot, setUndoSnapshot] = useState<MontaggioPlacement[] | null>(null)
  const occupiedHoles = useMemo(() => {
    const occupied = new Set(Object.values(previewScene.pinAssignments))
    for (const placement of placements) {
      occupied.add(placement.holes[0])
      occupied.add(placement.holes[1])
    }
    return occupied
  }, [previewScene, placements])
  const boardScene = useMemo(
    () => createBoardSceneWithPlacements(previewScene, placements),
    [previewScene, placements],
  )
  const freeAssemblyScene = useMemo(
    () => ({
      components: boardScene.components.map((component) => ({
        id: component.id,
        type: component.type,
      })),
      wires: boardScene.connections.map((connection) => ({
        from: connection.from,
        to: connection.to,
      })),
      pinAssignments: boardScene.pinAssignments,
    }),
    [boardScene],
  )
  const freeAssembly = useMemo(() => analyzeFreeAssembly(freeAssemblyScene), [freeAssemblyScene])
  const liveSolve = useMemo(
    () =>
      solveWithProvider("local", {
        scene: boardScene,
        provider: "local",
        mode: "static",
      }),
    [boardScene],
  )

  function handleSelectTool(tool: MontaggioTool | null) {
    setMontaggioTool(tool)
    setPendingHole(null)
    setMontaggioNotice(null)
  }

  function handleHoleTap(ref: string) {
    if (montaggioTool === null) return
    if (montaggioTool === "eraser") {
      // Specchio del gesto GOMMA dell'embed (D7): rimuove il placement del foro.
      const target = placements.find((p) => p.holes[0] === ref || p.holes[1] === ref)
      if (!target) {
        setMontaggioNotice(
          occupiedHoles.has(ref)
            ? `foro ${ref}: componente del manuale, non si cancella`
            : `foro ${ref}: nessun componente libero da cancellare`,
        )
        return
      }
      setUndoSnapshot(placements)
      setPlacements(placements.filter((p) => p.id !== target.id))
      setMontaggioNotice(null)
      return
    }
    if (occupiedHoles.has(ref)) {
      setMontaggioNotice(`foro ${ref} occupato: scegline uno libero`)
      return
    }
    if (pendingHole === null) {
      setPendingHole(ref)
      setMontaggioNotice(null)
      return
    }
    if (pendingHole === ref) {
      setMontaggioNotice("stesso foro del primo tap: tocca un secondo foro diverso")
      return
    }
    const ordinal = placements.filter((placement) => placement.type === montaggioTool).length + 1
    // Fix drift iter-4: anche qui il cavo ha il suo prefisso id (era led-libero).
    const id =
      montaggioTool === "resistor"
        ? `r-libero-${ordinal}`
        : montaggioTool === "wire"
          ? `cavo-libero-${ordinal}`
          : `led-libero-${ordinal}`
    setUndoSnapshot(placements)
    setPlacements([...placements, { id, type: montaggioTool, holes: [pendingHole, ref] }])
    setPendingHole(null)
    setMontaggioNotice(null)
  }

  function handleMontaggioReset() {
    setUndoSnapshot(placements)
    setPlacements([])
    setPendingHole(null)
    setMontaggioNotice(null)
    setMontaggioTool(null)
  }

  function handleMontaggioUndo() {
    if (undoSnapshot === null) return
    setUndoSnapshot(placements) // toggle one-step, specchio dell'embed (D8)
    setPlacements(undoSnapshot)
    setPendingHole(null)
    setMontaggioNotice(null)
  }

  const montaggio: MontaggioCanvas = {
    tool: montaggioTool,
    pending: pendingHole,
    notice: montaggioNotice,
    placements,
    onSelectTool: handleSelectTool,
    onHoleTap: handleHoleTap,
    onReset: handleMontaggioReset,
    canUndo: undoSnapshot !== null,
    onUndo: handleMontaggioUndo,
  }
  // `?? 0` mostrava 0.0 mA per una corrente NON misurata: accanto a «LED ?»
  // erano due affermazioni contraddittorie sullo stesso circuito (CARDINE P1-3).
  const liveLed1A = liveSolve.currents.led1
  const liveCurrentMa = liveLed1A === undefined || liveLed1A === null ? null : liveLed1A * 1000
  const liveLedState = liveSolve.componentStates.led1
  // `led1` può non esistere in questa scena, o il solver può non aver risposto:
  // in entrambi i casi non sappiamo, e «non lo so» non si scrive «OFF».
  const liveLedReadout = ledReadout(liveLedState?.on)

  return (
    <div
      data-simulation-canvas
      role="img"
      aria-label={scene.title}
      data-elab-comparable-canvas="false"
      data-elab-core-canvas-mounted="false"
      data-simulation-surface="harness"
      data-preview-source-kind={scene.adapters.source}
      style={elabCanvasFrameStyle}
    >
      <SimulationBoard scene={boardScene} montaggio={montaggio} />
      <SimulationWireEditorPanel key={scene.id} scene={scene} />
      <div
        data-live-physics-status={liveSolve.ok ? "ok" : "blocked"}
        data-live-physics-current-ma={measureReadout(liveCurrentMa)}
        data-live-physics-disconnected={String(liveSolve.solverDiagnostics?.disconnectedPins.length ?? 0)}
        data-free-assembly-findings={String(freeAssembly.findings.length)}
        style={physicsStripStyle}
      >
        <strong>fisica reale</strong>
        <span>{liveSolve.ok ? "solver local OK" : liveSolve.diagnostics.join(", ")}</span>
        <span data-led-readout={liveLedReadout}>LED {LED_READOUT_LABELS[liveLedReadout]}</span>
        <span>{measureReadout(liveCurrentMa)} mA</span>
        <span>{liveSolve.solverDiagnostics?.disconnectedPins.length ?? 0} pin scollegati</span>
        {freeAssembly.findings.length > 0 && (
          <span>{freeAssembly.findings[0]?.message}</span>
        )}
      </div>
    </div>
  )
}

function SimulationWireEditorPanel({ scene }: { scene: SimulationScene }) {
  const [editableScene, setEditableScene] = useState(scene)
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null)
  const [wireDiagnostics, setWireDiagnostics] = useState<string[]>([])
  const [wireLastAction, setWireLastAction] = useState<SimulationWireEditAction | "idle">("idle")
  const [draggingWaypoint, setDraggingWaypoint] = useState<string | null>(null)
  const editableWires = useMemo(() => editableWiresForScene(editableScene), [editableScene])
  const selectedWire = useMemo(
    () => editableWires.find((wire) => wire.id === selectedWireId) ?? null,
    [editableWires, selectedWireId],
  )
  const wireEditorNormalized = useMemo(
    () => JSON.stringify(normalizeSimulationScene(editableScene)),
    [editableScene],
  )
  const wireEditorPath = useMemo(
    () => JSON.stringify(selectedWire?.pathPoints.map(serializedWirePoint) ?? []),
    [selectedWire],
  )
  const validRetargetEndpoint = firstValidWireRetargetEndpoint(editableScene)

  function handleWireSelect(wireId: string) {
    setSelectedWireId(wireId)
    setWireDiagnostics([])
    setWireLastAction("idle")
  }

  function handleWaypointMove(wireId: string, pointIndex: number, point: { x: number; y: number }) {
    const result = moveSimulationWireWaypoint(editableScene, { wireId, pointIndex, point })
    setEditableScene(result.scene)
    setWireDiagnostics(result.diagnostics)
    setWireLastAction(result.action)
  }

  function handleEndpointRetarget(endpoint: string) {
    if (selectedWireId === null) return
    const result = retargetSimulationWireEndpoint(editableScene, {
      wireId: selectedWireId,
      side: "to",
      endpoint,
    })
    setEditableScene(result.scene)
    setWireDiagnostics(result.diagnostics)
    setWireLastAction(result.action)
  }

  function handleWaypointPointerMove(
    wireId: string,
    point: SimulationEditableWirePoint,
    event: ReactPointerEvent,
  ) {
    if (draggingWaypoint !== `${wireId}:${point.index}`) return
    handleWaypointMove(wireId, point.index, {
      x: Number.isFinite(event.clientX) ? event.clientX : point.x,
      y: Number.isFinite(event.clientY) ? event.clientY : point.y,
    })
  }

  return (
    <div
      data-simulation-wire-editor
      data-selected-wire-id={selectedWire?.id ?? ""}
      data-wire-editor-normalized={wireEditorNormalized}
      data-wire-editor-path={wireEditorPath}
      data-wire-editor-diagnostics={wireDiagnostics.join(" | ")}
      data-wire-editor-last-action={wireLastAction}
      style={wireEditorStyle}
    >
      <div style={wireSelectorRowStyle}>
        {editableWires.map((wire) => (
          <button
            key={wire.id}
            type="button"
            data-wire-select={wire.id}
            aria-pressed={selectedWireId === wire.id}
            onClick={() => handleWireSelect(wire.id)}
            style={wireButtonStyle}
          >
            {wire.id}
          </button>
        ))}
      </div>
      {selectedWire !== null && (
        <WireHandles
          wire={selectedWire}
          validRetargetEndpoint={validRetargetEndpoint}
          onInvalidRetarget={() => handleEndpointRetarget("bb1:z99")}
          onValidRetarget={() => handleEndpointRetarget(validRetargetEndpoint)}
          onWaypointPointerDown={(wireId, point) => {
            setDraggingWaypoint(`${wireId}:${point.index}`)
            setWireDiagnostics([])
          }}
          onWaypointPointerMove={handleWaypointPointerMove}
          onWaypointPointerUp={() => setDraggingWaypoint(null)}
        />
      )}
    </div>
  )
}

function WireHandles({
  wire,
  validRetargetEndpoint,
  onInvalidRetarget,
  onValidRetarget,
  onWaypointPointerDown,
  onWaypointPointerMove,
  onWaypointPointerUp,
}: {
  wire: SimulationEditableWire
  validRetargetEndpoint: string
  onInvalidRetarget: () => void
  onValidRetarget: () => void
  onWaypointPointerDown: (wireId: string, point: SimulationEditableWirePoint) => void
  onWaypointPointerMove: (
    wireId: string,
    point: SimulationEditableWirePoint,
    event: ReactPointerEvent,
  ) => void
  onWaypointPointerUp: () => void
}) {
  return (
    <div style={wireHandlesStyle}>
      <button
        type="button"
        data-wire-endpoint-anchor="from"
        data-wire-endpoint-ref={wire.from.ref}
        data-wire-endpoint-anchor-locked="true"
        aria-disabled="true"
        style={wireAnchorStyle}
      >
        {wire.from.ref}
      </button>
      {wire.pathPoints.map((point) =>
        point.editable ? (
          <button
            key={`${wire.id}:${point.index}`}
            type="button"
            data-wire-waypoint-handle={`${wire.id}:${point.index}`}
            aria-disabled="false"
            onPointerDown={() => onWaypointPointerDown(wire.id, point)}
            onPointerMove={(event) => onWaypointPointerMove(wire.id, point, event)}
            onPointerUp={onWaypointPointerUp}
            style={wireWaypointStyle}
          >
            {point.index}
          </button>
        ) : (
          <span
            key={`${wire.id}:${point.index}`}
            data-wire-waypoint-anchor={`${wire.id}:${point.index}`}
            aria-disabled="true"
            style={wireAnchorDotStyle}
          >
            {point.index}
          </span>
        ),
      )}
      <button
        type="button"
        data-wire-endpoint-anchor="to"
        data-wire-endpoint-ref={wire.to.ref}
        data-wire-endpoint-anchor-locked="true"
        aria-disabled="true"
        style={wireAnchorStyle}
      >
        {wire.to.ref}
      </button>
      <button
        type="button"
        data-wire-retarget-valid-to
        data-wire-retarget-endpoint={validRetargetEndpoint}
        onClick={onValidRetarget}
        style={wireActionStyle}
      >
        endpoint valido
      </button>
      <button
        type="button"
        data-wire-retarget-invalid-to
        onClick={onInvalidRetarget}
        style={wireActionStyle}
      >
        endpoint invalido
      </button>
    </div>
  )
}

function serializedWirePoint(point: SimulationEditableWirePoint) {
  return {
    index: point.index,
    role: point.role,
    editable: point.editable,
    x: point.x,
    y: point.y,
  }
}

function firstValidWireRetargetEndpoint(scene: SimulationScene): string {
  const board = scene.components.find((component) => component.type.includes("breadboard"))
  return `${board?.id ?? "bb1"}:bus-top-plus-2`
}

const shellStyle = {
  flex: 1,
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 360px",
  background: "var(--m-paper)",
} as const

const narrowShellStyle = {
  ...shellStyle,
  gridTemplateColumns: "1fr",
  gridTemplateRows: "minmax(360px, 52vh) auto",
  overflow: "auto",
} as const

const canvasShellStyle = {
  minWidth: 0,
  minHeight: 0,
  borderRight: "var(--m-rule-weight) solid var(--m-line)",
} as const

const elabCanvasFrameStyle = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  padding: 12,
  boxSizing: "border-box",
  overflow: "auto",
  background: "#f3f7f9",
} as const

const wireEditorStyle = {
  display: "grid",
  gap: 8,
  marginTop: 10,
  padding: 10,
  border: "1px solid #b8c6d2",
  borderRadius: 8,
  background: "#ffffff",
  color: "#203044",
  font: "650 12px var(--m-font-ui)",
} as const

const wireSelectorRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  minHeight: 30,
} as const

const wireButtonStyle = {
  minWidth: 64,
  height: 28,
  border: "1px solid #b8c6d2",
  borderRadius: 6,
  background: "#eef4f8",
  color: "#203044",
  font: "700 12px var(--m-font-ui)",
} as const

const wireHandlesStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
  minHeight: 32,
} as const

const wireAnchorStyle = {
  minWidth: 96,
  height: 28,
  border: "1px solid #cfd7df",
  borderRadius: 6,
  background: "#f7f9fb",
  color: "#52677f",
  font: "700 11px var(--m-font-ui)",
} as const

const wireAnchorDotStyle = {
  display: "inline-grid",
  placeItems: "center",
  width: 28,
  height: 28,
  border: "1px solid #cfd7df",
  borderRadius: 14,
  background: "#f7f9fb",
  color: "#52677f",
} as const

const wireWaypointStyle = {
  width: 28,
  height: 28,
  border: "1px solid #0f766e",
  borderRadius: 14,
  background: "#ccfbf1",
  color: "#134e4a",
  font: "800 12px var(--m-font-ui)",
  cursor: "grab",
} as const

const wireActionStyle = {
  minWidth: 112,
  height: 28,
  border: "1px solid #9f7a2f",
  borderRadius: 6,
  background: "#fff6d8",
  color: "#573d09",
  font: "750 12px var(--m-font-ui)",
} as const

const physicsStripStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px 14px",
  alignItems: "center",
  marginTop: 10,
  padding: "10px 12px",
  border: "1px solid #c9d7e2",
  borderRadius: 8,
  background: "#ffffff",
  color: "#203044",
  font: "650 13px var(--m-font-ui)",
} as const

const panelColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 12,
  overflow: "auto",
  background: "var(--m-fill)",
} as const

const narrowPanelColumnStyle = {
  ...panelColumnStyle,
  overflow: "visible",
} as const

const panelStyle = {
  position: "static",
  width: "auto",
} as const

const sourceGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 8,
  padding: 8,
} as const

const buttonStyle = {
  minHeight: 34,
  border: "1px solid var(--m-line-2)",
  borderRadius: 8,
  background: "var(--m-paper)",
  color: "var(--m-ink-2)",
  font: "600 13px var(--m-font-ui)",
} as const

const activeButtonStyle = {
  ...buttonStyle,
  border: "1px solid var(--m-accent)",
  color: "var(--m-accent)",
  background: "var(--m-accent-wash)",
} as const

const definitionListStyle = {
  display: "grid",
  gap: 8,
  margin: 0,
  padding: 8,
} as const

const termStyle = {
  display: "inline",
  fontWeight: 700,
  marginRight: 8,
} as const

const descriptionStyle = {
  display: "inline",
  margin: 0,
  color: "var(--m-ink-3)",
} as const

const contractStyle = {
  display: "grid",
  gap: 6,
  padding: 8,
  fontSize: 13,
} as const
