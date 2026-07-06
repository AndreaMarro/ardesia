// ELAB Lab (?vista=elab-lab) — P0 accoppiato canon ELAB-AS-PLUGIN §6:
// l'host di prodotto consuma l'UNICO entry renderEmbeddable() del Simulation
// Plugin (MOUNT-CANVAS: il plugin possiede solo il canvas, la shell è
// dell'host) e il calcolo elettrico passa ESCLUSIVAMENTE dal dispatch
// simulationPluginRegistry.solve (motore reale dietro registry, deny-by-
// default) — mai un import diretto del solver dalla vista.
//
// Dato montato: l'esperimento reale del Pack v1-cap6-esp1 ("Accendi il tuo
// primo LED", Vol.1 cap.6) — zero mock, stessa topologia del golden elettrico
// (ElabSolver.test.ts).

import { useEffect, useMemo, useRef } from "react"
import { renderEmbeddable } from "@elab-tutor-plugin/plugin/renderEmbeddable"
import EXPERIMENTS_VOL1 from "@elab-tutor-plugin/data/experiments-vol1"
import type { ElabVolumeExperiment } from "@elab-tutor-plugin/data/experiments-vol1"
import { getSimulationTool } from "../toolhost/simulationPluginRegistry"
// Import con side-effect deliberato: registra l'entry del Simulation Plugin
// (render + solve reale) nel registry — lo stesso dispatch usato dal canvas.
import { REFERENCE_SIM_TOOL_ID } from "../toolhost/ToolCanvasEmbeddable"
import type { SolveResult, SolverExperiment } from "../../sim/solver/elabSolver"

export const ELAB_LAB_EXPERIMENT_ID = "v1-cap6-esp1"

/** L'esperimento reale del Pack montato dalla vista (null = dato assente). */
export function findElabLabExperiment(): ElabVolumeExperiment | null {
  return EXPERIMENTS_VOL1.experiments.find((e) => e.id === ELAB_LAB_EXPERIMENT_ID) ?? null
}

/** Proiezione dell'esperimento Pack sul contratto del solve (solo i campi elettrici). */
export function toSolverExperiment(experiment: ElabVolumeExperiment): SolverExperiment {
  return {
    components: experiment.components,
    connections: experiment.connections,
    pinAssignments: experiment.pinAssignments,
  }
}

type SolveOutcome =
  | { kind: "ok"; result: SolveResult }
  | { kind: "no-solve" }
  | { kind: "error"; detail: string }

function dispatchSolve(experiment: ElabVolumeExperiment): SolveOutcome {
  const entry = getSimulationTool(REFERENCE_SIM_TOOL_ID)
  if (entry?.solve === undefined) return { kind: "no-solve" }
  try {
    return { kind: "ok", result: entry.solve(toSolverExperiment(experiment)) }
  } catch (error) {
    return { kind: "error", detail: String(error) }
  }
}

export default function ElabLab() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const experiment = useMemo(findElabLabExperiment, [])
  const solve = useMemo(
    () => (experiment === null ? null : dispatchSolve(experiment)),
    [experiment],
  )

  useEffect(() => {
    const node = canvasRef.current
    if (node === null || experiment === null) return
    const handle = renderEmbeddable(node, { experiment })
    return () => handle.dispose()
  }, [experiment])

  const ledOn = solve?.kind === "ok" && solve.result.componentStates.led1?.on === true
  const ledCurrent = solve?.kind === "ok" ? solve.result.currents.led1 : undefined

  return (
    <div
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}
      data-elab-lab-state={experiment === null ? "no-experiment" : "mounted"}
    >
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">ELAB Lab — Simulation Plugin (motore reale via registry)</span>
        </span>
        {experiment !== null && (
          <span className="st-chip-student st-chip-lesson" title="Esperimento del Pack ELAB (Vol.1 cap.6 esp.1)">
            {experiment.title}
          </span>
        )}
      </header>

      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {experiment === null && (
          <div role="alert" className="reference-tool-panel" style={{ padding: 16 }}>
            <strong>Esperimento del Pack non trovato (fail-closed).</strong>
            <div>id atteso: {ELAB_LAB_EXPERIMENT_ID}</div>
          </div>
        )}

        {experiment !== null && (
          <>
            <div ref={canvasRef} data-elab-canvas style={{ position: "absolute", inset: 0 }} />
            <div className="reference-tool-panel" data-elab-lab-solve={solve?.kind ?? "no-solve"}>
              <div className="reference-tool-panel-bar">
                <span className="reference-tool-dot" data-on={ledOn ? "1" : "0"} aria-hidden />
                verifica circuito (registry.solve)
              </div>
              {solve?.kind === "ok" && (
                <dl style={{ margin: 0, padding: "4px 8px" }}>
                  <div>
                    <dt style={{ display: "inline" }}>LED: </dt>
                    <dd style={{ display: "inline", margin: 0 }} data-led-on={ledOn ? "1" : "0"}>
                      {ledOn ? "acceso" : "spento"}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ display: "inline" }}>Corrente LED (mA): </dt>
                    <dd style={{ display: "inline", margin: 0 }} data-led-current-ma>
                      {ledCurrent === undefined ? "—" : (ledCurrent * 1000).toFixed(1)}
                    </dd>
                  </div>
                  {solve.result.diagnostics.shortCircuit && (
                    <div role="alert">
                      <strong>Corto circuito rilevato.</strong>
                    </div>
                  )}
                  {solve.result.warnings.map((warning) => (
                    <div key={warning} data-solve-warning>
                      {warning}
                    </div>
                  ))}
                </dl>
              )}
              {solve?.kind === "no-solve" && (
                <div role="alert" style={{ padding: "4px 8px" }}>
                  solve non dispatchabile: tool non registrato (deny-by-default)
                </div>
              )}
              {solve?.kind === "error" && (
                <div role="alert" style={{ padding: "4px 8px" }}>
                  solve fallito: {solve.detail}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
