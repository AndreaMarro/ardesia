// Wrapper tipizzato del CircuitSolver vendored: experiment → SolveResult.
// Confine P2: il motore reale del plugin diventa invocabile dal Simulation
// Plugin studio con contratto tipizzato, senza riscritture (drift-guard su
// copia byte-identica) e senza toccare la superficie di sicurezza ToolHost.
import CircuitSolver from "./engine/CircuitSolver.js"
import { getComponent } from "./components/registry.js"
import { registerElectricalCatalog } from "./catalog"

export interface SolverComponent {
  id: string
  type: string
  value?: number
  color?: string | null
}

export interface SolverConnection {
  from: string
  to: string
  color?: string
}

export interface SolverExperiment {
  components: SolverComponent[]
  connections: SolverConnection[]
  pinAssignments?: Record<string, string>
}

export interface SolveResult {
  /**
   * `true` = solve eseguito SENZA corto circuito. NON significa "circuito
   * funzionante": un circuito aperto ha ok=true con LED spento e correnti
   * assenti — leggere componentStates/currents/diagnostics per il verdetto.
   */
  ok: boolean
  componentStates: Record<string, { on?: boolean } & Record<string, unknown>>
  currents: Record<string, number>
  nodeVoltages: Record<string, number>
  diagnostics: {
    shortCircuit: boolean
    disconnectedPins: Array<{ compId: string; pinName: string; pinRef: string }>
    overloadWarnings: Array<{ compId: string; type?: string; message?: string }>
  }
  warnings: string[]
}

export interface SolveOptions {
  /**
   * Vf dichiarato dalla scena (es. runtime.ledForwardVolts della scena
   * reference = 2). Se diverge dalla tabella del motore per il colore del
   * LED, il conflitto viene TRACCIATO come warning — mai riconciliato in
   * silenzio (spec D4: la scena dice 2.0, il motore usa LED_VF.red = 1.8).
   */
  sceneLedForwardVolts?: number
}

// Mirror della tabella Vf del motore, usato SOLO per rilevare il conflitto
// scena↔motore. Fonte: CircuitSolver.js:22-29 (LED_VF) + default 2.0
// (CircuitSolver.js:1190). La copia vendored è protetta da drift-guard.
const ENGINE_LED_VF: Record<string, number> = {
  red: 1.8,
  green: 2.2,
  blue: 3.0,
  yellow: 2.0,
  white: 3.2,
  orange: 2.0,
}
const ENGINE_LED_VF_DEFAULT = 2.0

function engineLedForwardVolts(color: string | null | undefined): number {
  return (color != null ? ENGINE_LED_VF[color] : undefined) ?? ENGINE_LED_VF_DEFAULT
}

/**
 * Vf che il motore userà per un LED di quel colore. Esposto perché chi
 * costruisce scene derivate (bridge ElabScene→SimulationSceneV1) dichiari il
 * Vf del motore invece di auto-dichiararne uno divergente (conflitto D4).
 */
export function engineLedForwardVoltsForColor(color: string | null | undefined): number {
  return engineLedForwardVolts(color)
}

/** Risolve un esperimento col motore vendored. Fail-closed sui tipi non catalogati. */
export function solveElabExperiment(
  experiment: SolverExperiment,
  options: SolveOptions = {},
): SolveResult {
  registerElectricalCatalog()

  for (const component of experiment.components) {
    if (getComponent(component.type) === null) {
      throw new Error(
        `tipo componente non catalogato per il solve: ${component.type} (id ${component.id})`,
      )
    }
  }

  const warnings: string[] = []
  if (options.sceneLedForwardVolts !== undefined) {
    for (const component of experiment.components) {
      if (component.type !== "led") continue
      const engineVf = engineLedForwardVolts(component.color)
      if (engineVf !== options.sceneLedForwardVolts) {
        warnings.push(
          `${component.id}: la scena dichiara Vf ${options.sceneLedForwardVolts} V ma la tabella del motore usa ${engineVf} V per il colore ${component.color ?? "(default)"}`,
        )
      }
    }
  }

  const solver = new CircuitSolver()
  try {
    // loadExperiment esegue già solve() e la diagnostica (CircuitSolver.js:116-219).
    solver.loadExperiment({
      components: experiment.components,
      connections: experiment.connections,
      pinAssignments: experiment.pinAssignments,
    })
    const diagnostics = solver.getDiagnostics()
    return {
      ok: !diagnostics.shortCircuit,
      componentStates: solver.getState(),
      currents: solver.getComponentCurrents(),
      nodeVoltages: solver.getNodeVoltages(),
      diagnostics,
      warnings,
    }
  } finally {
    solver.destroy()
  }
}
