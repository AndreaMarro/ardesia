export type BreadboardBlock = "top" | "bottom"

export type BreadboardHoleRef = {
  boardId: string
  letter: string
  tie: number
  block: BreadboardBlock
}

export type BreadboardRailRef = {
  boardId: string
  rail: "bus-top-plus" | "bus-top-minus" | "bus-bot-plus" | "bus-bot-minus"
  index: number
}

export type CircuitWireLike = {
  from: string
  to: string
}

export type BreadboardCircuit = {
  pinAssignments: Record<string, string>
  wires: readonly CircuitWireLike[]
  conductivePairs?: ReadonlyArray<readonly [string, string]>
}

export type ConnectivityOptions = {
  includeRails?: boolean
}

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

const HOLE_RE = /^([^:]+):([a-j])([1-9]\d*)$/
const RAIL_RE = /^([^:]+):(bus-(?:top|bot)-(?:plus|minus))-([1-9]\d*)$/
const ELAB_V1_CAP6_ESP1_CONDUCTIVE_PAIRS = [
  ["r1:pin1", "r1:pin2"],
  ["led1:anode", "led1:cathode"],
] as const

class UnionFind {
  private parent = new Map<string, string>()

  add(item: string): void {
    if (!this.parent.has(item)) this.parent.set(item, item)
  }

  find(item: string): string {
    this.add(item)
    const parent = this.parent.get(item)
    if (parent === undefined || parent === item) return item
    const root = this.find(parent)
    this.parent.set(item, root)
    return root
  }

  union(a: string, b: string): void {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent.set(rb, ra)
  }

  connected(a: string, b: string): boolean {
    return this.find(a) === this.find(b)
  }
}

export function parseBreadboardHole(ref: string): BreadboardHoleRef | null {
  const match = HOLE_RE.exec(ref)
  if (!match) return null
  const letter = match[2]
  return {
    boardId: match[1],
    letter,
    tie: Number(match[3]),
    block: letter >= "f" && letter <= "j" ? "top" : "bottom",
  }
}

export function parseBreadboardRail(ref: string): BreadboardRailRef | null {
  const match = RAIL_RE.exec(ref)
  if (!match) return null
  return {
    boardId: match[1],
    rail: match[2] as BreadboardRailRef["rail"],
    index: Number(match[3]),
  }
}

export function isBreadboardHole(ref: string): boolean {
  return parseBreadboardHole(ref) !== null
}

export function isBreadboardRail(ref: string): boolean {
  return parseBreadboardRail(ref) !== null
}

export function straddlesCenterGap(a: string, b: string): boolean {
  const ha = parseBreadboardHole(a)
  const hb = parseBreadboardHole(b)
  return ha !== null && hb !== null && ha.boardId === hb.boardId && ha.tie === hb.tie && ha.block !== hb.block
}

export function sameTie(a: string, b: string): boolean {
  const ha = parseBreadboardHole(a)
  const hb = parseBreadboardHole(b)
  return ha !== null && hb !== null && ha.boardId === hb.boardId && ha.tie === hb.tie && ha.block === hb.block
}

export function isPinOnRail(pinAssignments: Record<string, string>, pin: string): boolean {
  const ref = pinAssignments[pin]
  return typeof ref === "string" && isBreadboardRail(ref)
}

export function pinsOnRails(pinAssignments: Record<string, string>): string[] {
  return Object.keys(pinAssignments).filter((pin) => isPinOnRail(pinAssignments, pin)).sort()
}

function tieGroup(ref: string, includeRails: boolean): string | null {
  const hole = parseBreadboardHole(ref)
  if (hole) return `${hole.boardId}:tie:${hole.block}:${hole.tie}`
  if (!includeRails) return null
  const rail = parseBreadboardRail(ref)
  if (rail) return `${rail.boardId}:rail:${rail.rail}`
  return null
}

function buildConnectivity(circuit: BreadboardCircuit, options: ConnectivityOptions): UnionFind {
  const includeRails = options.includeRails ?? true
  const uf = new UnionFind()

  function addEndpoint(ref: string): void {
    uf.add(ref)
    const group = tieGroup(ref, includeRails)
    if (group) uf.union(ref, group)
  }

  for (const [pin, ref] of Object.entries(circuit.pinAssignments)) {
    addEndpoint(pin)
    addEndpoint(ref)
    uf.union(pin, ref)
  }

  for (const wire of circuit.wires) {
    addEndpoint(wire.from)
    addEndpoint(wire.to)
    if (includeRails || (!isBreadboardRail(wire.from) && !isBreadboardRail(wire.to))) {
      uf.union(wire.from, wire.to)
    }
  }

  for (const [from, to] of circuit.conductivePairs ?? []) {
    addEndpoint(from)
    addEndpoint(to)
    uf.union(from, to)
  }

  return uf
}

export function reaches(a: string, b: string, circuit: BreadboardCircuit, options: ConnectivityOptions = {}): boolean {
  return buildConnectivity(circuit, options).connected(a, b)
}

export function reachesDirectlyWithoutRails(a: string, b: string, circuit: BreadboardCircuit): boolean {
  return reaches(a, b, circuit, { includeRails: false })
}

export function analyzeElabV1Cap6Esp1BookTopology(
  circuit: Pick<BreadboardCircuit, "pinAssignments" | "wires">,
): ElabV1Cap6Esp1TopologyReport {
  const withConductors: BreadboardCircuit = {
    ...circuit,
    conductivePairs: ELAB_V1_CAP6_ESP1_CONDUCTIVE_PAIRS,
  }
  const pin = circuit.pinAssignments
  const negativeReturn = circuit.wires.find((wire) => wire.to === "bat1:negative" || wire.from === "bat1:negative")
  const negativeReturnHole = negativeReturn?.to === "bat1:negative" ? negativeReturn.from : negativeReturn?.to

  return {
    ledStraddlesCenterGap: straddlesCenterGap(pin["led1:anode"], pin["led1:cathode"]),
    resistorSharesAnodeTie: sameTie(pin["r1:pin2"], pin["led1:anode"]),
    cathodeSharesNegativeReturnTie: negativeReturnHole !== undefined && sameTie(pin["led1:cathode"], negativeReturnHole),
    positiveReachesResistorRailSide: reaches("bat1:positive", "r1:pin1", withConductors),
    negativeReturnsDirectlyWithoutRails:
      negativeReturnHole !== undefined && reachesDirectlyWithoutRails(negativeReturnHole, "bat1:negative", withConductors),
    closedCircuit: reaches("bat1:positive", "bat1:negative", withConductors),
    pinsOnRails: pinsOnRails(pin),
    usesMinusBus: circuit.wires.some((wire) => wire.from.includes("bus-bot-minus") || wire.to.includes("bus-bot-minus")),
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
