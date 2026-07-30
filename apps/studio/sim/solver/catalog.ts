// Catalogo elettrico headless per il CircuitSolver vendored.
// Il motore legge dal component-registry solo pin.id e, per le breadboard,
// getInternalConnections(); qui registriamo esattamente quei dati, estratti
// firsthand dai registerComponent del plugin (zero React):
//   BreadboardHalf.jsx:15,56-57 (COLS=30, top a-e, bottom f-j),
//   294-338 (pin generati: 2 alias + 300 fori + 120 bus),
//   391-427 (strip: 30 net-top + 30 net-bot + 4 bus),
//   Led.jsx:136-148 · Resistor.jsx:137-148 · Battery9V.jsx:166-177 · Wire.jsx:127-138.
// Tipi non registrati restano deny-by-default per il solve (slice future).
import { registerComponent } from "./components/registry.js"
import type { CatalogInternalNet, CatalogPin } from "./components/registry.js"

const COLS = 30
const TOP_LABELS = ["a", "b", "c", "d", "e"] as const
const BOT_LABELS = ["f", "g", "h", "i", "j"] as const
const BUS_PREFIXES = ["bus-top-plus", "bus-top-minus", "bus-bot-plus", "bus-bot-minus"] as const

function breadboardHalfPins(): CatalogPin[] {
  const pins: CatalogPin[] = [
    { id: "bus-plus", label: "+ Bus", type: "power" },
    { id: "bus-minus", label: "- Bus", type: "power" },
  ]
  for (const rows of [TOP_LABELS, BOT_LABELS]) {
    for (const row of rows) {
      for (let col = 1; col <= COLS; col++) {
        pins.push({ id: `${row}${col}`, label: `${row}${col}`, type: "hole" })
      }
    }
  }
  for (const prefix of BUS_PREFIXES) {
    for (let col = 1; col <= COLS; col++) {
      pins.push({ id: `${prefix}-${col}`, label: `${prefix}-${col}`, type: "power" })
    }
  }
  return pins
}

function breadboardHalfInternalConnections(): CatalogInternalNet[] {
  const nets: CatalogInternalNet[] = []
  for (let col = 1; col <= COLS; col++) {
    nets.push({ id: `net-top-${col}`, holes: TOP_LABELS.map((row) => `${row}${col}`) })
  }
  for (let col = 1; col <= COLS; col++) {
    nets.push({ id: `net-bot-${col}`, holes: BOT_LABELS.map((row) => `${row}${col}`) })
  }
  for (const prefix of BUS_PREFIXES) {
    nets.push({
      id: `net-${prefix}`,
      holes: Array.from({ length: COLS }, (_, i) => `${prefix}-${i + 1}`),
    })
  }
  return nets
}

/** Registra i dati elettrici dei componenti Vol.1 base. Idempotente. */
export function registerElectricalCatalog(): void {
  registerComponent("breadboard-half", {
    pins: breadboardHalfPins(),
    defaultState: { activeHoles: {} },
    category: "passive",
    label: "Breadboard (Half)",
    getInternalConnections: breadboardHalfInternalConnections,
  })

  registerComponent("battery9v", {
    pins: [
      { id: "positive", label: "+ (9V)", type: "power" },
      { id: "negative", label: "− (GND)", type: "power" },
    ],
    defaultState: { voltage: 9, connected: true },
    category: "power",
    label: "Batteria 9V",
  })

  registerComponent("resistor", {
    pins: [
      { id: "pin1", label: "Pin 1", type: "digital" },
      { id: "pin2", label: "Pin 2", type: "digital" },
    ],
    defaultState: { current: 0, voltage: 0 },
    category: "passive",
    label: "Resistore",
  })

  registerComponent("led", {
    pins: [
      { id: "anode", label: "A (+)", type: "digital" },
      { id: "cathode", label: "K (−)", type: "digital" },
    ],
    defaultState: { on: false, brightness: 0 },
    category: "output",
    label: "LED",
  })

  registerComponent("wire", {
    pins: [
      { id: "start", label: "Start", type: "digital" },
      { id: "end", label: "End", type: "digital" },
    ],
    defaultState: { current: 0 },
    category: "wire",
    label: "Filo",
  })

  // ── Sblocco multi-pin (NOTTE-13, per v1-cap9-esp6 lampada RGB) ──────────
  // Il motore vendored supporta già potentiometer (_solvePotentiometer,
  // dynamic supply del wiper) e rgb-led (_solveRGBLed, 3 canali verso
  // common): era il catalogo host a negarli. Dati estratti firsthand da
  // Potentiometer.jsx:109-123 e RgbLed.jsx:84-96 del plugin.
  registerComponent("potentiometer", {
    pins: [
      { id: "vcc", label: "VCC", type: "power" },
      { id: "signal", label: "Signal", type: "analog" },
      { id: "gnd", label: "GND", type: "power" },
    ],
    defaultState: { position: 0.5, resistance: 5000 },
    category: "input",
    label: "Potenziometro",
  })

  // ── F5-8 (2026-07-31): i tipi di v2-cap7-esp1 e v2-cap7-esp2 ────────────
  // Stessa forma di NOTTE-13: il motore vendored li supporta GIA'
  // (`_solveCapacitor`, `_solveMultimeter`, i case `push-button` in
  // `_getMNAResistance` e nel dispatch), ed era QUESTO catalogo a negarli.
  // Finche' erano negati, due degli otto esperimenti che un docente puo'
  // aprire mostravano «solve fallito: tipo componente non catalogato» sotto un
  // disegno completo e corretto.
  //
  // Pin e defaultState estratti firsthand da Capacitor.jsx:155-166,
  // PushButton.jsx:91-101 e Multimeter.jsx:180-191 del plugin — gli stessi
  // file che chiamano `registerComponent` per l'app standalone. Restano una
  // ri-dichiarazione: e' il prezzo del deny-by-default dell'host, ed e'
  // sostenibile SOLO finche' i pin sono liste letterali corte.
  //
  // ⚠️ Per `nano-r4` NON lo e': i suoi ~40 pin sono CALCOLATI
  // (allTopPins/allBottomPins/allWingPins piu' l'aliasing `mapsTo` delle ali,
  // NanoR4Board.jsx:921-933). Ricopiarli qui sarebbe la duplicazione che il
  // flywheel esiste per togliere, e la riparazione giusta e' far LEGGERE
  // all'host le registrazioni del plugin invece di riscriverle. Unita' a se',
  // e `ElabVisibleExperimentsSolve.test.ts` la tiene visibile con un assert
  // invertito invece di lasciarla implicita.
  registerComponent("capacitor", {
    pins: [
      { id: "positive", label: "+ (Positive)", type: "passive" },
      { id: "negative", label: "− (Negative)", type: "passive" },
    ],
    defaultState: { charge: 0, voltage: 0, current: 0 },
    category: "passive",
    label: "Condensatore",
  })

  registerComponent("push-button", {
    pins: [
      { id: "pin1", label: "Pin 1", type: "digital" },
      { id: "pin2", label: "Pin 2", type: "digital" },
      { id: "pin3", label: "Pin 3", type: "digital" },
      { id: "pin4", label: "Pin 4", type: "digital" },
    ],
    defaultState: { pressed: false },
    category: "input",
    label: "Pulsante",
  })

  registerComponent("multimeter", {
    pins: [
      { id: "probe-negative", label: "COM (−)", type: "passive" },
      { id: "probe-positive", label: "V/Ω (+)", type: "passive" },
    ],
    defaultState: { reading: 0, mode: "voltage" },
    category: "passive",
    label: "Multimetro",
  })

  registerComponent("rgb-led", {
    pins: [
      { id: "red", label: "R (Red)", type: "digital" },
      { id: "common", label: "GND (−)", type: "power" },
      { id: "green", label: "G (Green)", type: "digital" },
      { id: "blue", label: "B (Blue)", type: "digital" },
    ],
    defaultState: {
      r: 0,
      g: 0,
      b: 0,
      red: { on: false, brightness: 0 },
      green: { on: false, brightness: 0 },
      blue: { on: false, brightness: 0 },
    },
    category: "output",
    label: "LED RGB",
  })
}
