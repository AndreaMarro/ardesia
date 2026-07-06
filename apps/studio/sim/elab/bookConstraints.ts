// Vincoli topologici del TESTO del manuale (Vol.1 cap.6 esp.1, pp.29-31) resi
// eseguibili: `bookMatch` smette di essere una stringa auto-asserita in
// provenance.checks e diventa un verdetto calcolato e falsificabile.
// Il testo lascia liberi i fori esatti ("un punto qualsiasi della striscia
// rossa", "un punto qualsiasi della zona sotto"): qui si verifica SOLO ciò che
// il libro impone, al livello delle net (tie-strip/rail), non dei fori.
import { parseBreadboardRef, type ParsedBreadboardRef } from "../breadboard/simulationBreadboard.ts"
import type { ElabScene } from "./elabScene.ts"

export type BookConstraintResult = {
  id: string
  ok: boolean
  detail: string
  bookRef: string
}

export type BookConstraintsReport = {
  ok: boolean
  results: BookConstraintResult[]
}

const BOOK_REF_P29 = "Vol.1 pag.29"
const BOOK_REF_P30 = "Vol.1 pag.30"
const BOOK_REF_P31 = "Vol.1 pag.31"

function isPlusRail(parsed: ParsedBreadboardRef | null): boolean {
  return parsed?.kind === "rail" && (parsed.rail === "bus-top-plus" || parsed.rail === "bus-bot-plus")
}

function isTerminalHole(parsed: ParsedBreadboardRef | null): parsed is ParsedBreadboardRef & { kind: "terminal" } {
  return parsed?.kind === "terminal"
}

/** Estremo opposto di un wire rispetto a un pin componente (`bat1:positive`). */
function wireEndpointOpposite(scene: ElabScene, componentPinRef: string): string | null {
  for (const wire of scene.wires) {
    if (wire.from === componentPinRef) return wire.to
    if (wire.to === componentPinRef) return wire.from
  }
  return null
}

export function checkBookConstraintsV1Cap6Esp1(scene: ElabScene): BookConstraintsReport {
  const battery = scene.components.find((component) => component.type === "battery9v")
  const resistor = scene.components.find((component) => component.type === "resistor")
  const led = scene.components.find((component) => component.type === "led")
  const breadboard = scene.components.find((component) => component.type === "breadboard-half")

  const results: BookConstraintResult[] = []

  // C1 — "Collega il positivo della batteria alla striscia rossa superiore
  // della breadboard" (p30): esiste un wire da bat:positive a una rail plus.
  {
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:positive`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok = isPlusRail(parsed)
    results.push({
      id: "battery-positive-to-red-rail",
      ok,
      detail: ok
        ? `bat+ collegato al rail rosso (${target})`
        : `bat+ non arriva a una striscia rossa (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P30} — "Collega il positivo della batteria alla striscia rossa superiore della breadboard"`,
    })
  }

  // C2 — "Collega il resistore da 470 Ohm tra un punto qualsiasi della
  // striscia rossa e un punto qualsiasi della zona sotto" (p30): dei due pin
  // del resistore, esattamente uno su una rail plus e uno su un foro zona.
  const resistorZonePin = (() => {
    if (!resistor) return null
    const pin1 = parseBreadboardRef(scene.pinAssignments[`${resistor.id}:pin1`] ?? "")
    const pin2 = parseBreadboardRef(scene.pinAssignments[`${resistor.id}:pin2`] ?? "")
    const railCount = [pin1, pin2].filter((pin) => isPlusRail(pin)).length
    const zonePins = [pin1, pin2].filter((pin) => isTerminalHole(pin))
    if (railCount === 1 && zonePins.length === 1) return zonePins[0]!
    return null
  })()
  results.push({
    id: "resistor-bridges-rail-and-zone",
    ok: resistorZonePin !== null,
    detail:
      resistorZonePin !== null
        ? `resistore a cavallo rail/zona (gamba zona: ${resistorZonePin.row}${resistorZonePin.column})`
        : "il resistore non ha esattamente una gamba nella striscia rossa e una nella zona fori",
    bookRef: `${BOOK_REF_P30} — "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto"`,
  })

  // C3 — "Collega la gambetta lunga del LED verso il resistore e la gambetta
  // corta in un punto qualsiasi della parte sotto dopo la divisione centrale"
  // (p30): anodo sulla stessa tie-strip della gamba-zona del resistore, catodo
  // su una tie-strip dell'altra metà (oltre il canale centrale).
  {
    const anode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:anode`] ?? "") : null
    const cathode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:cathode`] ?? "") : null
    const anodeTowardResistor =
      resistorZonePin !== null && isTerminalHole(anode) && anode.nodeId === resistorZonePin.nodeId
    const cathodePastChannel =
      isTerminalHole(anode) &&
      isTerminalHole(cathode) &&
      // nodeId codifica la metà (tie-top-N / tie-bottom-N): metà diverse,
      // stessa colonna NON richiesta dal testo per il catodo.
      anode.nodeId.includes("-top-") !== cathode.nodeId.includes("-top-")
    const ok = anodeTowardResistor && cathodePastChannel
    results.push({
      id: "led-anode-toward-resistor-cathode-past-channel",
      ok,
      detail: ok
        ? "anodo sulla strip del resistore, catodo oltre il canale centrale"
        : `LED non conforme (anodo verso resistore: ${anodeTowardResistor}, catodo oltre il canale: ${cathodePastChannel})`,
      bookRef: `${BOOK_REF_P30} — "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un punto qualsiasi della parte sotto dopo la divisione centrale"`,
    })
  }

  // C4 — "Collega il negativo della batteria in un punto qualsiasi della
  // stessa colonna della gambetta corta del LED" (p31): l'endpoint del filo
  // nero condivide la tie-strip del catodo.
  {
    const cathode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:cathode`] ?? "") : null
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:negative`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok =
      isTerminalHole(parsed) && isTerminalHole(cathode) && parsed.nodeId === cathode.nodeId
    results.push({
      id: "battery-negative-same-column-as-cathode",
      ok,
      detail: ok
        ? `bat- nella colonna del catodo (${target})`
        : `bat- non condivide la colonna del catodo (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P31} — "Collega il negativo della batteria in un punto qualsiasi della stessa colonna della gambetta corta del LED"`,
    })
  }

  // C5 — BOM del libro (p29, elenco materiali): esattamente batteria 9V,
  // breadboard, resistore 470 Ohm, LED rosso. La clip è parte della batteria.
  {
    const types = scene.components.map((component) => component.type).sort()
    const expected = ["battery9v", "breadboard-half", "led", "resistor"]
    const bomOk =
      types.length === expected.length &&
      types.every((type, index) => type === expected[index]) &&
      battery !== undefined &&
      breadboard !== undefined &&
      resistor?.value === 470 &&
      led?.color === "red"
    results.push({
      id: "bom-matches-book",
      ok: bomOk,
      detail: bomOk
        ? "componenti = LED rosso, breadboard, batteria 9V, resistore 470 Ohm"
        : `BOM diversa dal libro (trovati: ${types.join(", ") || "nessuno"}; r=${String(resistor?.value)}, led=${String(led?.color)})`,
      bookRef: `${BOOK_REF_P29} — elenco materiali dell'esperimento 1`,
    })
  }

  return { ok: results.every((result) => result.ok), results }
}
