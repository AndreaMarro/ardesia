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

// ── Zone di stress LED (ADR-0003, decisione autonoma D4-2) ─────────────────
// Il motore vendored ha un burn BINARIO a >30mA che contraddice il libro:
// Vol.1 p.33 presenta 220Ω (LED verde → 30.9mA) come "più luminoso" e
// 100Ω (68mA) come pavimento di sicurezza. Fisica (datasheet LED 5mm
// tipico): 20mA nominale, ~30mA massimo continuo, ~100mA picco impulsivo —
// tra 30 e 100mA il LED si degrada NEL TEMPO, non esplode all'istante.
// Riconciliazione QUI nel wrapper (il motore resta byte-identico, drift-guard
// intatto): il verdetto binario viene reinterpretato in 4 zone oneste.
// Rollback: rimuovere reinterpretLedStress e le soglie (il binario torna).

export type LedStressZone = "nominale" | "overdrive" | "pericolo" | "bruciato"

export const LED_STRESS_THRESHOLDS = {
  /** Fino a qui il LED lavora nel rating continuo (20mA nominale + margine). */
  nominaleMaxAmps: 0.025,
  /** "Più luminoso" del libro: sopra il rating, vita ridotta, ma acceso. */
  overdriveMaxAmps: 0.05,
  /** Zona pericolo: il pavimento del libro ("mai sotto 100Ω" → 68mA) vive qui. */
  pericoloMaxAmps: 0.1,
  // > pericoloMaxAmps: oltre il picco impulsivo di datasheet → bruciato
  // all'istante (il caso "senza resistore", ~1A).
} as const

export function ledStressZone(currentAmps: number): LedStressZone {
  if (currentAmps <= LED_STRESS_THRESHOLDS.nominaleMaxAmps) return "nominale"
  if (currentAmps <= LED_STRESS_THRESHOLDS.overdriveMaxAmps) return "overdrive"
  if (currentAmps <= LED_STRESS_THRESHOLDS.pericoloMaxAmps) return "pericolo"
  return "bruciato"
}

/** A legacy mono verdict may omit brightness; malformed brightness is not evidence. */
export function monoLedStateFromSolve(
  result: SolveResult | null,
  ledId: string,
): ({ on: boolean; brightness: number } & Record<string, unknown>) | null {
  const raw = result?.componentStates[ledId]
  if (!result?.ok || raw === null || typeof raw !== "object" || typeof raw.on !== "boolean") return null
  const brightness = raw.brightness
  if (brightness !== undefined && (typeof brightness !== "number" || !Number.isFinite(brightness) || brightness < 0 || brightness > 1)) return null
  return { ...raw, on: raw.on, brightness: typeof brightness === "number" ? brightness : raw.on ? 1 : 0 }
}

// ── LED RGB: proiezione dei canali dal SolveResult ─────────────────────────
// PORTA UNICA. Il motore non pubblica una corrente per il LED RGB in
// `currents` (misurato: per v1-cap9-esp6 ci sono solo r1/r2/r3): l'unica
// grandezza per canale è `brightness`, e `currentMa` ne è l'inversione ESATTA
// della formula di CircuitSolver._solveRGBLed
//     brightness = min(1, clamped / 0.03)   con clamped = clamp(current, 0, 0.04)
// quindi sotto il clamp `brightness * 30` è il milliampere vero; a brightness
// 1 il motore ha clampato e il valore reale è ">= 30 mA", mai un numero finto.
//
// Chiunque mostri i canali passa DA QUI (canvas post-it e ELAB Lab): due
// letture a mano dello stesso stato erano l'origine di F5-1, dove una
// superficie diceva "acceso" e l'altra "spento" sullo stesso solve.

/** Fondo scala della brightness del motore, in mA (brightness 1 ⇒ clamp). */
export const RGB_BRIGHTNESS_FULL_SCALE_MA = 30

export interface RgbChannel {
  /** Derived readout validity, never inferred from an absent channel. */
  available: boolean
  on: boolean
  brightness: number
  /** Valido solo se `brightness < 1`; oltre, il motore ha clampato. */
  currentMa: number
}

export interface RgbChannels {
  red: RgbChannel
  green: RgbChannel
  blue: RgbChannel
}

/**
 * Legge i tre canali del LED RGB `rgbId` dal risultato del solve. Un id
 * assente o non valido produce un canale non disponibile. I consumer devono
 * verificare available prima di presentare un verdetto acceso/spento.
 */
export function rgbChannelsFromSolve(result: SolveResult, rgbId: string): RgbChannels {
  const state = result.componentStates[rgbId] as
    | Partial<Record<"red" | "green" | "blue", { on?: boolean; brightness?: number }>>
    | undefined
  const channel = (name: "red" | "green" | "blue"): RgbChannel => {
    const raw = state?.[name]
    const available = result.ok && typeof raw?.on === "boolean" &&
      typeof raw.brightness === "number" && Number.isFinite(raw.brightness) &&
      raw.brightness >= 0 && raw.brightness <= 1
    const brightness = available ? raw!.brightness! : 0
    return {
      available,
      on: raw?.on === true,
      brightness,
      currentMa: brightness * RGB_BRIGHTNESS_FULL_SCALE_MA,
    }
  }
  return { red: channel("red"), green: channel("green"), blue: channel("blue") }
}

/** Etichetta di un canale. Al clamp dichiara la soglia, non un valore inventato. */
export function formatRgbChannelMa(channel: RgbChannel): string {
  if (!channel.available || !Number.isFinite(channel.currentMa)) return "?"
  return channel.brightness >= 1
    ? `>= ${RGB_BRIGHTNESS_FULL_SCALE_MA} mA`
    : `${channel.currentMa.toFixed(1)} mA`
}

export const LED_STRESS_ZONE_LABELS: Record<LedStressZone, string> = {
  nominale: "corrente nominale",
  overdrive: "sopra corrente nominale: più luminoso, vita del LED ridotta",
  pericolo: "ZONA PERICOLO: rischio concreto di bruciatura (il libro dice: mai sotto 100 Ohm)",
  bruciato: "BRUCIATO: corrente oltre il picco sopportabile",
}

/**
 * Reinterpreta i flag visivi del LED secondo le zone. Le grandezze elettriche
 * (correnti/tensioni) NON vengono toccate: il burn del motore non altera la
 * soluzione MNA (il LED bruciato conserva la caduta diretta, vedi
 * CircuitSolver.js:1810), quindi la reinterpretazione dei soli flag è sana.
 */
function reinterpretLedStress(result: SolveResult, ledIds: ReadonlySet<string>): SolveResult {
  for (const [id, state] of Object.entries(result.componentStates)) {
    if (!ledIds.has(id)) continue
    const current = result.currents[id]
    if (current === undefined) continue
    const zone = ledStressZone(current)
    ;(state as Record<string, unknown>).stressZone = zone
    if (zone === "bruciato") continue // il verdetto del motore resta
    if (state.burned === true) {
      // Il motore ha bruciato un LED in zona overdrive/pericolo: acceso ma
      // sotto stress, con warning STRUTTURATO (mai un downgrade silenzioso).
      state.burned = false
      ;(state as { on?: boolean }).on = current > 0.0001
      ;(state as { brightness?: number }).brightness = Math.min(1, current / 0.03)
      result.diagnostics.overloadWarnings.push({
        compId: id,
        type: zone,
        message: `LED "${id}" a ${Math.round(current * 1000)}mA — ${LED_STRESS_ZONE_LABELS[zone]}`,
      })
    } else if (zone !== "nominale") {
      result.diagnostics.overloadWarnings.push({
        compId: id,
        type: zone,
        message: `LED "${id}" a ${Math.round(current * 1000)}mA — ${LED_STRESS_ZONE_LABELS[zone]}`,
      })
    }
  }
  return result
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
    const ledIds = new Set(
      experiment.components
        .filter((component) => component.type === "led")
        .map((component) => component.id),
    )
    return reinterpretLedStress(
      {
        ok: !diagnostics.shortCircuit,
        componentStates: solver.getState(),
        currents: solver.getComponentCurrents(),
        nodeVoltages: solver.getNodeVoltages(),
        diagnostics,
        warnings,
      },
      ledIds,
    )
  } finally {
    solver.destroy()
  }
}
