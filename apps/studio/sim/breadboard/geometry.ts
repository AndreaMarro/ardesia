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

const HOLE_RE = /^([^:]+):([a-j])([1-9]\d*)$/
const RAIL_RE = /^([^:]+):(bus-(?:top|bot)-(?:plus|minus))-([1-9]\d*)$/

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
