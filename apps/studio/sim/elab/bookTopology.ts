// Topologia ELAB Vol.1 cap.6 esp.1 (id di esperimento hardcoded del pack ELAB).
// Vive nel modulo ELAB: sim/breadboard/geometry resta SOLO primitivi generici.

import {
  parseBreadboardRail,
  pinsOnRails,
  reaches,
  reachesDirectlyWithoutRails,
  sameTie,
  straddlesCenterGap,
  type BreadboardCircuit,
} from "../breadboard/geometry"

export type ElabV1Cap6Esp1TopologyReport = {
  ledStraddlesCenterGap: boolean
  resistorSharesAnodeTie: boolean
  cathodeSharesNegativeReturnTie: boolean
  positiveReachesResistorRailSide: boolean
  negativeReturnsDirectlyWithoutRails: boolean
  closedCircuit: boolean
  pinsOnRails: string[]
  usesMinusBus: boolean
  wireCount: number
}

const ELAB_V1_CAP6_ESP1_CONDUCTIVE_PAIRS = [
  ["r1:pin1", "r1:pin2"],
  ["led1:anode", "led1:cathode"],
] as const

function isMinusRail(ref: string): boolean {
  const rail = parseBreadboardRail(ref)
  return rail !== null && (rail.rail === "bus-top-minus" || rail.rail === "bus-bot-minus")
}

export function analyzeElabV1Cap6Esp1BookTopology(
  circuit: Pick<BreadboardCircuit, "pinAssignments" | "wires">,
): ElabV1Cap6Esp1TopologyReport {
  const withConductors: BreadboardCircuit = {
    ...circuit,
    conductivePairs: ELAB_V1_CAP6_ESP1_CONDUCTIVE_PAIRS,
  }
  const pin = circuit.pinAssignments

  // Tutti i fili che toccano il negativo della batteria, non solo il primo.
  const negativeReturnHoles = circuit.wires
    .filter((wire) => wire.from === "bat1:negative" || wire.to === "bat1:negative")
    .map((wire) => (wire.to === "bat1:negative" ? wire.from : wire.to))

  // Il resistore è elettricamente simmetrico: entrambi gli orientamenti valgono.
  // Il pin sul lato anodo è quello che condivide la tie dell'anodo; l'altro è il
  // lato rail. Se nessuno la condivide si ricade sull'orientamento canonico pin1.
  const resistorPins = ["r1:pin1", "r1:pin2"] as const
  const anodeSidePin = resistorPins.find((resistorPin) => sameTie(pin[resistorPin], pin["led1:anode"]))
  const railSidePin = anodeSidePin === "r1:pin1" ? "r1:pin2" : "r1:pin1"

  return {
    ledStraddlesCenterGap: straddlesCenterGap(pin["led1:anode"], pin["led1:cathode"]),
    resistorSharesAnodeTie: anodeSidePin !== undefined,
    cathodeSharesNegativeReturnTie: negativeReturnHoles.some((hole) => sameTie(pin["led1:cathode"], hole)),
    positiveReachesResistorRailSide: reaches("bat1:positive", railSidePin, withConductors),
    negativeReturnsDirectlyWithoutRails: negativeReturnHoles.some((hole) =>
      reachesDirectlyWithoutRails(hole, "bat1:negative", withConductors),
    ),
    closedCircuit: reaches("bat1:positive", "bat1:negative", withConductors),
    pinsOnRails: pinsOnRails(pin),
    usesMinusBus: circuit.wires.some((wire) => isMinusRail(wire.from) || isMinusRail(wire.to)),
    wireCount: circuit.wires.length,
  }
}

export function validateElabV1Cap6Esp1BookTopology(
  circuit: Pick<BreadboardCircuit, "pinAssignments" | "wires">,
): ElabV1Cap6Esp1TopologyReport {
  const report = analyzeElabV1Cap6Esp1BookTopology(circuit)
  const failures: string[] = []
  if (!report.ledStraddlesCenterGap) failures.push("LED must straddle the center gap on one tie")
  if (!report.resistorSharesAnodeTie) failures.push("resistor LED-side pin must share the LED anode tie")
  if (!report.cathodeSharesNegativeReturnTie) failures.push("battery negative must return to the LED cathode tie")
  if (!report.positiveReachesResistorRailSide) failures.push("battery positive must reach the resistor rail-side pin")
  if (!report.negativeReturnsDirectlyWithoutRails) failures.push("battery negative must return directly without a minus-bus chain")
  if (!report.closedCircuit) failures.push("topological circuit must be closed")
  if (report.pinsOnRails.length > 0) failures.push(`component pins cannot live on rails: ${report.pinsOnRails.join(", ")}`)
  if (report.usesMinusBus) failures.push("book-faithful topology must not use the minus bus")
  if (report.wireCount !== 3) failures.push(`expected 3 wires for the fixture grammar, got ${report.wireCount}`)
  if (failures.length > 0) {
    throw new Error(`ELAB v1 cap6 esp1 breadboard topology drift: ${failures.join("; ")}`)
  }
  return report
}
