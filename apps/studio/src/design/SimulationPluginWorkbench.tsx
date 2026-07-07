import { useMemo } from "react"
import {
  normalizeSimulationScene,
  sceneReadiness,
  type SimulationScene,
} from "../../sim/core/simulationScene"
import { wokwiDiagramToSimulationScene } from "../../sim/core/wokwiDiagramAdapter"
import ViewNav from "./ViewNav"

const technicalHarnessDiagram = {
  version: 1,
  author: "Simulation Plugin technical harness",
  editor: "wokwi",
  parts: [
    { id: "uno", type: "wokwi-arduino-uno", left: 78, top: 108 },
    { id: "led1", type: "wokwi-led", left: 548, top: 134, attrs: { color: "red" } },
    { id: "r1", type: "wokwi-resistor", left: 412, top: 158, attrs: { value: "220" } },
  ],
  connections: [
    ["uno:13", "r1:1", "#16a34a", ["h100", "v30", "*", "h-28"]],
    ["r1:2", "led1:A", "#f59e0b", ["h42"]],
    ["led1:C", "uno:GND.1", "#111827", ["v140", "h-430"]],
  ],
}

export default function SimulationPluginWorkbench() {
  const scene = useMemo(
    () =>
      wokwiDiagramToSimulationScene(technicalHarnessDiagram, {
        id: "simulation-plugin-technical-harness",
        title: "ARDESIA Simulation",
      }),
    [],
  )
  const readiness = useMemo(() => sceneReadiness(scene), [scene])
  const normalized = useMemo(() => normalizeSimulationScene(scene), [scene])

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
          <span className="st-name-text">ARDESIA Simulation</span>
        </span>
        <ViewNav current="simulatore" />
      </header>
      <main style={shellStyle}>
        <section aria-label="Simulation Plugin canvas" style={canvasShellStyle}>
          <SimulationSceneCanvas scene={scene} />
        </section>
        <aside style={panelColumnStyle}>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">sorgenti scena</div>
            <div style={sourceGridStyle}>
              <button style={activeButtonStyle}>Wokwi diagram.json</button>
              <button style={buttonStyle}>Immagine</button>
              <button style={buttonStyle}>Descrizione</button>
            </div>
          </section>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">provider</div>
            <dl style={definitionListStyle}>
              <div>
                <dt style={termStyle}>local</dt>
                <dd style={descriptionStyle}>available</dd>
              </div>
              <div>
                <dt style={termStyle}>fastapi</dt>
                <dd style={descriptionStyle}>adapter boundary</dd>
              </div>
              <div>
                <dt style={termStyle}>ngspice-wasm</dt>
                <dd style={descriptionStyle}>planned</dd>
              </div>
            </dl>
          </section>
          <section className="reference-tool-panel" style={panelStyle}>
            <div className="reference-tool-panel-bar">contratto scena</div>
            <div style={contractStyle}>
              <strong>{scene.schemaVersion}</strong>
              <span>{normalized.components.length} componenti</span>
              <span>{normalized.wires.length} fili</span>
              <span>{readiness.ok ? "ready" : readiness.blockers.join(", ")}</span>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

function SimulationSceneCanvas({ scene }: { scene: SimulationScene }) {
  return (
    <svg
      data-simulation-canvas
      viewBox="0 0 920 620"
      role="img"
      aria-label={scene.title}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id="simulation-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="var(--m-line)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="920" height="620" fill="var(--m-canvas)" />
      <rect x="0" y="0" width="920" height="620" fill="url(#simulation-grid)" />
      {scene.wires.map((wire) => (
        <polyline
          key={wire.id}
          data-wire-id={wire.id}
          points={(wire.path?.points ?? []).map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke={wire.color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {scene.components.map((component) => (
        <g
          key={component.id}
          data-component-id={component.id}
          transform={`translate(${component.pose.x} ${component.pose.y}) rotate(${component.pose.rotation ?? 0})`}
        >
          <ComponentGlyph type={component.type} attrs={component.attrs} />
          <text
            x="0"
            y="76"
            textAnchor="middle"
            style={{ font: "600 13px var(--m-font-ui)", fill: "var(--m-ink)" }}
          >
            {component.id}
          </text>
        </g>
      ))}
    </svg>
  )
}

function ComponentGlyph({
  type,
  attrs,
}: {
  type: string
  attrs?: Record<string, string | number | boolean>
}) {
  if (type.includes("arduino")) {
    return (
      <>
        <rect x="-46" y="-28" width="170" height="92" rx="8" fill="#f8fafc" stroke="#1f3f63" strokeWidth="2" />
        <text x="38" y="8" textAnchor="middle" style={glyphTextStyle}>
          ARDUINO
        </text>
        <text x="38" y="28" textAnchor="middle" style={smallGlyphTextStyle}>
          13 · GND
        </text>
      </>
    )
  }
  if (type.includes("led")) {
    const color = typeof attrs?.color === "string" ? attrs.color : "#ef4444"
    return (
      <>
        <circle cx="0" cy="12" r="28" fill={color} fillOpacity="0.82" stroke="#7f1d1d" strokeWidth="2" />
        <line x1="-38" y1="52" x2="38" y2="52" stroke="#111827" strokeWidth="3" />
      </>
    )
  }
  return (
    <>
      <rect x="-54" y="-13" width="108" height="26" rx="6" fill="#fff7ed" stroke="#b45309" strokeWidth="2" />
      <line x1="-84" y1="0" x2="-54" y2="0" stroke="#111827" strokeWidth="3" />
      <line x1="54" y1="0" x2="84" y2="0" stroke="#111827" strokeWidth="3" />
      <text x="0" y="5" textAnchor="middle" style={smallGlyphTextStyle}>
        {String(attrs?.value ?? "R")}
      </text>
    </>
  )
}

const shellStyle = {
  flex: 1,
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 360px",
  background: "var(--m-paper)",
} as const

const canvasShellStyle = {
  minWidth: 0,
  minHeight: 0,
  borderRight: "var(--m-rule-weight) solid var(--m-line)",
} as const

const panelColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 12,
  overflow: "auto",
  background: "var(--m-fill)",
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
  borderColor: "var(--m-accent)",
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

const glyphTextStyle = {
  font: "700 16px var(--m-font-ui)",
  fill: "#1f3f63",
} as const

const smallGlyphTextStyle = {
  font: "600 12px var(--m-font-ui)",
  fill: "#41556d",
} as const
