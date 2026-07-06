// Passo-passo didattico ELAB Vol.1 cap.6 esp.1 (pp.29-31) come DATI PURI +
// predicati topologici. Nessuna UI, nessun LLM, nessuna dipendenza nuova:
// i predicati riusano i costrutti di sim/breadboard/geometry e di bookTopology.
//
// FA FEDE IL TESTO del manuale (pp.29-31), non le figure: prese alla lettera,
// le figure lasciano il circuito aperto (vedi driftNotes della fixture).
// La riga p.30 "Collega la clip della batteria alla batteria" è un prerequisito
// senza predicato topologico nella grammatica del circuito (la clip è implicita
// negli endpoint bat1:positive / bat1:negative): è registrata come evidenza
// dello step 1, non come step a sé.
//
// SEMANTICA CUMULATIVA: ogni step è valutato sullo STATO CORRENTE del circuito
// (tipicamente quello completo/finale), NON sul delta incrementale del singolo
// step. Per validazione passo-passo durante la costruzione usare
// `firstFailingDidacticStep` (indica il primo step non ancora soddisfatto).
// Una semantica incrementale per-delta è eventuale lavoro futuro, fuori scope.

import {
  isBreadboardHole,
  parseBreadboardHole,
  parseBreadboardRail,
  pinsOnRails,
  type BreadboardCircuit,
  type BreadboardRailRef,
} from "../breadboard/geometry"
import {
  analyzeElabV1Cap6Esp1BookTopology,
  type ElabV1Cap6Esp1TopologyReport,
} from "./bookTopology"
import type { ElabManualEvidence } from "./fixtureAdapter"

export type Labels = {
  readonly it: string
  readonly en: string
}

// Riuso del tipo evidenza già canonico nella fixture (page/claim/evidence).
export type EvidenceRef = ElabManualEvidence

export type ElabCircuitSlice = Pick<BreadboardCircuit, "pinAssignments" | "wires">

// Solo i flag booleani del report topologico canonico.
export type TopologyReportFlag = {
  [K in keyof ElabV1Cap6Esp1TopologyReport]: ElabV1Cap6Esp1TopologyReport[K] extends boolean
    ? K
    : never
}[keyof ElabV1Cap6Esp1TopologyReport]

export type TopologyExpectation =
  | { readonly kind: "report-flag"; readonly flag: TopologyReportFlag; readonly expected: boolean }
  | {
      readonly kind: "wire-endpoint-on-rail"
      readonly endpoint: string
      readonly rail: BreadboardRailRef["rail"]
    }
  | { readonly kind: "pins-in-holes"; readonly pins: readonly string[] }
  | { readonly kind: "no-pins-on-rails" }

export type DidacticStep = {
  readonly id: string
  readonly order: number
  readonly instruction: Labels
  readonly manualEvidence: readonly EvidenceRef[]
  readonly expects: readonly TopologyExpectation[]
}

export type DidacticStepResult = {
  readonly stepId: string
  readonly order: number
  readonly passed: boolean
  readonly failures: readonly string[]
}

function describeExpectation(expectation: TopologyExpectation): string {
  switch (expectation.kind) {
    case "report-flag":
      return `${expectation.flag} must be ${expectation.expected}`
    case "wire-endpoint-on-rail":
      return `${expectation.endpoint} must wire directly onto ${expectation.rail}`
    case "pins-in-holes":
      return `pins must sit in board holes, never on bus rails: ${expectation.pins.join(", ")}`
    case "no-pins-on-rails":
      return "no component pins may sit on bus rails"
  }
}

// Board su cui è montato almeno un componente (dai pinAssignments): un rail su
// una board estranea/inesistente non conta come collegamento valido.
function componentBoardIds(circuit: ElabCircuitSlice): Set<string> {
  const boards = new Set<string>()
  for (const ref of Object.values(circuit.pinAssignments)) {
    const hole = parseBreadboardHole(ref)
    if (hole) boards.add(hole.boardId)
  }
  return boards
}

function holdsExpectation(
  expectation: TopologyExpectation,
  circuit: ElabCircuitSlice,
  report: ElabV1Cap6Esp1TopologyReport,
): boolean {
  switch (expectation.kind) {
    case "report-flag":
      return report[expectation.flag] === expectation.expected
    case "wire-endpoint-on-rail": {
      const boards = componentBoardIds(circuit)
      return circuit.wires.some((wire) => {
        const other =
          wire.from === expectation.endpoint
            ? wire.to
            : wire.to === expectation.endpoint
              ? wire.from
              : null
        if (other === null) return false
        const rail = parseBreadboardRail(other)
        return rail !== null && rail.rail === expectation.rail && boards.has(rail.boardId)
      })
    }
    case "pins-in-holes":
      return expectation.pins.every((pin) => isBreadboardHole(circuit.pinAssignments[pin] ?? ""))
    case "no-pins-on-rails":
      return pinsOnRails(circuit.pinAssignments).length === 0
  }
}

function evaluateWithReport(
  step: DidacticStep,
  circuit: ElabCircuitSlice,
  report: ElabV1Cap6Esp1TopologyReport,
): DidacticStepResult {
  const failures = step.expects
    .filter((expectation) => !holdsExpectation(expectation, circuit, report))
    .map(describeExpectation)
  return { stepId: step.id, order: step.order, passed: failures.length === 0, failures }
}

export function evaluateDidacticStep(
  step: DidacticStep,
  circuit: ElabCircuitSlice,
): DidacticStepResult {
  return evaluateWithReport(step, circuit, analyzeElabV1Cap6Esp1BookTopology(circuit))
}

export function evaluateDidacticSteps(
  steps: readonly DidacticStep[],
  circuit: ElabCircuitSlice,
): DidacticStepResult[] {
  const report = analyzeElabV1Cap6Esp1BookTopology(circuit)
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step) => evaluateWithReport(step, circuit, report))
}

export function firstFailingDidacticStep(
  steps: readonly DidacticStep[],
  circuit: ElabCircuitSlice,
): DidacticStepResult | null {
  return evaluateDidacticSteps(steps, circuit).find((result) => !result.passed) ?? null
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const item of Object.values(value)) deepFreeze(item)
  }
  return value
}

// Passo-passo Vol.1 cap.6 esp.2 (p.32) — "LED senza resistore (cosa NON
// fare!)". Esperimento DIMOSTRATIVO: gli step riproducono l'errore del libro.
// Il predicato chiave è resistorSharesAnodeTie atteso FALSE: se uno studente
// aggiunge un resistore sul tie dell'anodo, la scena smette di essere la
// dimostrazione p.32 (diventa l'esperimento 1) e lo step fallisce onestamente.
export const DIDACTIC_STEPS_V1_CAP6_ESP2: readonly DidacticStep[] = deepFreeze([
  {
    id: "v1-cap6-esp2-step-1-positivo-striscia-rossa",
    order: 1,
    instruction: {
      it: "Collega il positivo della batteria alla striscia rossa della breadboard",
      en: "Connect the battery positive lead to the red strip of the breadboard",
    },
    manualEvidence: [
      {
        page: 32,
        claim: "demo-what-not-to-do",
        evidence:
          "Se infatti colleghi per errore il LED direttamente alla batteria, il LED si brucia e potrebbe addirittura esplodere!",
      },
    ],
    expects: [
      { kind: "wire-endpoint-on-rail", endpoint: "bat1:positive", rail: "bus-top-plus" },
    ],
  },
  {
    id: "v1-cap6-esp2-step-2-led-cavallo-divisione",
    order: 2,
    instruction: {
      it: "Inserisci il LED a cavallo della divisione centrale della breadboard",
      en: "Insert the LED straddling the central divide of the breadboard",
    },
    manualEvidence: [
      {
        page: 32,
        claim: "led-straddles-divide-figure",
        evidence: "Figura p.32: LED a cavallo della divisione centrale, senza resistore",
      },
    ],
    expects: [
      { kind: "report-flag", flag: "ledStraddlesCenterGap", expected: true },
      { kind: "pins-in-holes", pins: ["led1:anode", "led1:cathode"] },
    ],
  },
  {
    id: "v1-cap6-esp2-step-3-diretto-senza-resistore",
    order: 3,
    instruction: {
      it: "Collega (per errore!) la striscia rossa direttamente alla gambetta lunga del LED e il negativo alla colonna della gambetta corta: il LED si brucia",
      en: "Connect (by mistake!) the red strip directly to the LED long leg and the negative to the short-leg column: the LED burns out",
    },
    manualEvidence: [
      {
        page: 32,
        claim: "never-led-direct-to-battery",
        evidence:
          "RICORDA: NON collegare MAI il LED direttamente alla batteria, ma inserisci sempre un resistore al centro!",
      },
    ],
    expects: [
      // Circuito chiuso: la dimostrazione richiede che la corrente scorra.
      { kind: "report-flag", flag: "closedCircuit", expected: true },
      // Ritorno del negativo sulla colonna del catodo (filo nero in figura).
      { kind: "report-flag", flag: "cathodeSharesNegativeReturnTie", expected: true },
      // IL VINCOLO DELL'ERRORE: nessun resistore sul tie dell'anodo. Con un
      // resistore la scena non è più la dimostrazione p.32.
      { kind: "report-flag", flag: "resistorSharesAnodeTie", expected: false },
    ],
  },
])

// I predicati NON fissano i numeri di foro: il libro dice "punto qualsiasi".
// Le scelte canoniche (resistore i9/i3, LED f3/e3, tie 3) vivono nella fixture
// elab-v1-cap6-esp1.json e sono blindate da validateElabV1Cap6Esp1Fixture.
export const DIDACTIC_STEPS_V1_CAP6_ESP1: readonly DidacticStep[] = deepFreeze([
  {
    id: "v1-cap6-esp1-step-1-positivo-striscia-rossa",
    order: 1,
    instruction: {
      it: "Collega il positivo della batteria alla striscia rossa superiore della breadboard",
      en: "Connect the battery positive lead to the upper red strip of the breadboard",
    },
    manualEvidence: [
      {
        page: 30,
        claim: "battery-clip-precondition",
        evidence: "Collega la clip della batteria alla batteria",
      },
      {
        page: 30,
        claim: "positive-to-red-strip",
        evidence:
          "Collega il positivo della batteria alla striscia rossa superiore della breadboard",
      },
    ],
    expects: [
      { kind: "wire-endpoint-on-rail", endpoint: "bat1:positive", rail: "bus-top-plus" },
    ],
  },
  {
    id: "v1-cap6-esp1-step-2-resistore-striscia-zona-sotto",
    order: 2,
    instruction: {
      it: "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto",
      en: "Connect the 470 Ohm resistor between any point of the red strip and any point of the zone below",
    },
    manualEvidence: [
      {
        page: 29,
        claim: "resistor-470-part",
        evidence:
          "Un resistore da 470 Ohm: spiegheremo dopo perché. Ti ricordi i colori?(Giallo Viola Marrone)",
      },
      {
        page: 30,
        claim: "resistor-strip-to-zone-below",
        evidence:
          "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto",
      },
    ],
    expects: [
      // "striscia rossa" → il lato rail del resistore è raggiunto dal positivo.
      { kind: "report-flag", flag: "positiveReachesResistorRailSide", expected: true },
      // "zona sotto" = un foro della board. Il lato striscia invece è LIBERO:
      // il libro mette la gamba NELLA striscia rossa (scena canonica v2,
      // r1:pin1 su bus-top-plus) e la vecchia codifica la portava in un foro
      // via jumper — entrambe fedeli al testo, entrambe accettate.
      { kind: "pins-in-holes", pins: ["r1:pin2"] },
    ],
  },
  {
    id: "v1-cap6-esp1-step-3-led-cavallo-divisione",
    order: 3,
    instruction: {
      it: "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un punto qualsiasi della parte sotto dopo la divisione centrale",
      en: "Connect the LED long leg toward the resistor and the short leg into any point of the lower part beyond the central divide",
    },
    manualEvidence: [
      {
        page: 30,
        claim: "led-straddles-divide-long-leg-to-resistor",
        evidence:
          "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un punto qualsiasi della parte sotto dopo la divisione centrale",
      },
    ],
    expects: [
      // "a cavallo della divisione centrale": anodo e catodo su blocchi opposti, stesso tie.
      { kind: "report-flag", flag: "ledStraddlesCenterGap", expected: true },
      // "gambetta lunga verso il resistore": il resistore condivide il tie dell'anodo.
      { kind: "report-flag", flag: "resistorSharesAnodeTie", expected: true },
      { kind: "pins-in-holes", pins: ["led1:anode", "led1:cathode"] },
    ],
  },
  {
    id: "v1-cap6-esp1-step-4-negativo-colonna-catodo",
    order: 4,
    instruction: {
      it: "Collega il negativo della batteria in un punto qualsiasi della stessa colonna della gambetta corta del LED",
      en: "Connect the battery negative lead to any point in the same column as the LED short leg",
    },
    manualEvidence: [
      {
        page: 31,
        claim: "negative-direct-to-cathode-column",
        evidence:
          "Collega il negativo della batteria in un punto qualsiasi della stessa colonna della gambetta corta del LED e … MAGIA!",
      },
      {
        page: 31,
        claim: "closed-circuit-led-on",
        evidence: "Il LED si è acceso! Bellissimo vero?",
      },
    ],
    expects: [
      { kind: "report-flag", flag: "cathodeSharesNegativeReturnTie", expected: true },
      // "in un punto qualsiasi della stessa colonna" = ritorno DIRETTO, niente bus minus.
      { kind: "report-flag", flag: "negativeReturnsDirectlyWithoutRails", expected: true },
      { kind: "report-flag", flag: "usesMinusBus", expected: false },
      // "… MAGIA! Il LED si è acceso": il circuito è chiuso.
      { kind: "report-flag", flag: "closedCircuit", expected: true },
      // Le gambette del LED vivono SEMPRE nei fori, mai sui bus (il libro le
      // mette a cavallo della divisione). Il vecchio "no-pins-on-rails"
      // globale era più stretto del libro: bocciava r1:pin1 nella striscia
      // rossa, che il testo p.30 prescrive (scena canonica v2).
      { kind: "pins-in-holes", pins: ["led1:anode", "led1:cathode"] },
    ],
  },
])
