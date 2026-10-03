/** Bounded validation of Laplace wire data and expression identity, never a circuit solver. */
import { parseCircuitInputNetlist } from "./circuitInputModel"

type Coefficients = Readonly<{numerator: readonly string[]; denominator: readonly string[]}>
export type CircuitLaplaceTransform = Coefficients & Readonly<{
  variable: "s"; coefficient_order: "ascending"
}>
export type CircuitLaplaceInputs = Readonly<{
  schema: "laplace-inputs.v1"
  initial_time: "0-"
  sources: readonly Readonly<{
    component: string; quantity: "voltage" | "current"; waveform: "step" | "impulse"
    amplitude: Readonly<{exact: string; unit: "V" | "A" | "V*s" | "A*s"}>
    transform: Coefficients
  }>[]
  capacitor_voltages: readonly Readonly<{component: string; exact: string; unit: "V"}>[]
  inductor_currents: readonly Readonly<{component: string; exact: string; unit: "A"}>[]
}>

type Q = {n: bigint; d: bigint}
type Polynomial = Q[]
type RF = {n: Polynomial; d: Polynomial}
type Budget = {nodes: number; operations: number}
const MAX_COEFFICIENTS = 65, MAX_BITS = 4096, MAX_TEXT = 512
const MAX_DEPTH = 64, MAX_NODES = 4096, MAX_OPERATIONS = 100_000
const ZERO: Q = {n: 0n, d: 1n}, ONE: Q = {n: 1n, d: 1n}
const budget = (): Budget => ({nodes: 0, operations: 0})
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
function fail(reason: string): never { throw new Error(`Dati Laplace non validi: ${reason}.`) }
function need(condition: unknown, reason: string): asserts condition { if (!condition) fail(reason) }
function tick(b: Budget) { if (++b.operations > MAX_OPERATIONS) fail("limite di operazioni") }
const abs = (n: bigint) => n < 0n ? -n : n
function bounded(n: bigint) { need(abs(n).toString(2).length <= MAX_BITS, "limite di bit") }
function q(n: bigint, d: bigint, b: Budget): Q {
  tick(b); need(d !== 0n, "denominatore nullo")
  bounded(n); bounded(d)
  if (!n) return ZERO
  if (d < 0n) { n = -n; d = -d }
  let a = abs(n), c = d
  while (c) { tick(b); [a, c] = [c, a % c] }
  return {n: n / a, d: d / a}
}
function exact(value: unknown, b: Budget): Q {
  need(typeof value === "string" && value.length <= MAX_TEXT && /^-?\d+(?:\/[1-9]\d*)?$/.test(value), "frazione esatta")
  const [n, d = "1"] = value.split("/")
  return q(BigInt(n), BigInt(d), b)
}
/** Decimal/exponent input is converted through integer powers of ten, without binary floats. */
function inputExact(value: string, b: Budget): Q {
  need(value.length <= MAX_TEXT, "lunghezza del numero")
  if (value.includes("/")) {
    need(/^[+-]?\d+\/[1-9]\d*$/.test(value), "frazione di ingresso")
    return exact(value.startsWith("+") ? value.slice(1) : value, b)
  }
  const m = /^([+-]?)(\d+(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?$/.exec(value)
  need(m, "numero di ingresso")
  const exponent = m[3] ?? "0"
  need(exponent.replace(/^[+-]/, "").length <= 4, "limite di esponente")
  const e = Number(exponent)
  need(Math.abs(e) <= 512, "limite di esponente")
  const [whole, decimals = ""] = m[2].split(".")
  const digits = (whole || "0") + decimals
  const power = e - decimals.length
  need(Math.abs(power) <= 1024, "limite di esponente")
  const n = BigInt(digits) * (m[1] === "-" ? -1n : 1n)
  return power >= 0 ? q(n * 10n ** BigInt(power), 1n, b) : q(n, 10n ** BigInt(-power), b)
}
const text = (a: Q) => a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`
const equal = (a: Q, b: Q) => a.n === b.n && a.d === b.d
function add(a: Q, c: Q, b: Budget): Q { return q(a.n * c.d + c.n * a.d, a.d * c.d, b) }
function multiply(a: Q, c: Q, b: Budget): Q { return q(a.n * c.n, a.d * c.d, b) }
function trim(p: Polynomial): Polynomial {
  while (p.length > 1 && !p[p.length - 1].n) p.pop()
  return p
}
const zero = (p: Polynomial) => p.length === 1 && p[0].n === 0n
const same = (a: Polynomial, b: Polynomial) => a.length === b.length && a.every((v, i) => equal(v, b[i]))
function pAdd(a: Polynomial, c: Polynomial, b: Budget): Polynomial {
  return trim(Array.from({length: Math.max(a.length, c.length)}, (_, i) => add(a[i] ?? ZERO, c[i] ?? ZERO, b)))
}
function pMultiply(a: Polynomial, c: Polynomial, b: Budget, maxDegree = 64): Polynomial {
  tick(b)
  if (zero(a) || zero(c)) return [ZERO]
  need(a.length + c.length - 2 <= maxDegree, "limite di grado")
  const result = Array.from({length: a.length + c.length - 1}, () => ZERO)
  for (let i = 0; i < a.length; i++) for (let j = 0; j < c.length; j++) {
    result[i + j] = add(result[i + j], multiply(a[i], c[j], b), b)
  }
  return trim(result)
}
function rf(n: Polynomial, d: Polynomial): RF {
  need(!zero(d), "denominatore polinomiale nullo")
  return zero(n) ? {n: [ZERO], d: [ONE]} : {n, d}
}
function rfAdd(a: RF, c: RF, b: Budget): RF {
  if (zero(a.n)) return c
  if (zero(c.n)) return a
  if (same(a.d, c.d)) return rf(pAdd(a.n, c.n, b), a.d)
  return rf(pAdd(pMultiply(a.n, c.d, b), pMultiply(c.n, a.d, b), b), pMultiply(a.d, c.d, b))
}
function coefficients(value: unknown, b: Budget): {wire: Coefficients; rf: RF} {
  need(object(value), "trasformata assente")
  const read = (v: unknown): Polynomial => {
    need(Array.isArray(v) && v.length > 0 && v.length <= MAX_COEFFICIENTS, "limite di coefficienti")
    const result = v.map(x => exact(x, b))
    need(result.length === 1 || result[result.length - 1].n !== 0n, "zero terminale")
    return result
  }
  const n = read(value.numerator), d = read(value.denominator)
  need(equal(d[d.length - 1], ONE), "denominatore non monico")
  need(!zero(n) || (d.length === 1 && equal(d[0], ONE)), "zero non normalizzato")
  return {wire: {numerator: n.map(text), denominator: d.map(text)}, rf: rf(n, d)}
}

export function readLaplaceTransform(value: unknown): CircuitLaplaceTransform {
  need(object(value) && value.variable === "s" && value.coefficient_order === "ascending", "convenzioni della trasformata")
  return {variable: "s", coefficient_order: "ascending", ...coefficients(value, budget()).wire}
}

function expression(value: unknown, b: Budget, depth = 0): RF {
  need(depth <= MAX_DEPTH, "limite di profondità")
  need(++b.nodes <= MAX_NODES, "limite di nodi")
  need(object(value), "espressione assente")
  if (value.kind === "number") {
    need(Array.isArray(value.coefficients) && value.coefficients.length === 4, "coefficienti scalari")
    const c = value.coefficients.map(x => exact(x, b))
    need(c.slice(1).every(v => !v.n), "coefficiente non razionale")
    return {n: [c[0]], d: [ONE]}
  }
  if (value.kind === "symbol") {
    need(value.name === "s", "simbolo diverso da s")
    return {n: [ZERO, ONE], d: [ONE]}
  }
  if (value.kind === "add" || value.kind === "multiply") {
    need(Array.isArray(value.args) && value.args.length <= MAX_NODES, "limite di argomenti")
    let result: RF = {n: [value.kind === "add" ? ZERO : ONE], d: [ONE]}
    for (const child of value.args) {
      const next = expression(child, b, depth + 1)
      result = value.kind === "add" ? rfAdd(result, next, b) :
        rf(pMultiply(result.n, next.n, b), pMultiply(result.d, next.d, b))
    }
    return result
  }
  need(value.kind === "divide", "tipo di espressione")
  const numerator = expression(value.numerator, b, depth + 1)
  const denominator = expression(value.denominator, b, depth + 1)
  need(!zero(denominator.n), "divisione per zero")
  return rf(pMultiply(numerator.n, denominator.d, b), pMultiply(numerator.d, denominator.n, b))
}

/** Equality in Q(s), by exact polynomial cross-products. No values of s are sampled. */
export function assertLaplaceAnswerMath(math: unknown, transform: CircuitLaplaceTransform): void {
  const canonical = readLaplaceTransform(transform), b = budget()
  const expected = coefficients(canonical, b).rf, actual = expression(math, b)
  need(same(pMultiply(actual.n, expected.d, b, 128), pMultiply(expected.n, actual.d, b, 128)), "formula e trasformata discordanti")
}

export function readLaplaceInputs(value: unknown, netlist: string): CircuitLaplaceInputs {
  need(object(value) && value.schema === "laplace-inputs.v1" && value.initial_time === "0-", "schema o istante iniziale")
  const model = parseCircuitInputNetlist(netlist), b = budget()
  need(model.domain === "laplace", "regime diverso da Laplace")
  const records = (rows: unknown, ids: readonly string[]): Map<string, Record<string, unknown>> => {
    need(Array.isArray(rows) && rows.length === ids.length && rows.length <= 64, "inventario degli ingressi")
    const mapped = new Map<string, Record<string, unknown>>()
    for (const row of rows) {
      need(object(row) && typeof row.component === "string" && ids.includes(row.component) && !mapped.has(row.component), "componente duplicato o estraneo")
      mapped.set(row.component, row)
    }
    return mapped
  }
  const sources = model.components.filter(c => c.kind === "V" || c.kind === "I")
  const sourceRecords = records(value.sources, sources.map(c => c.id))
  const outputSources: CircuitLaplaceInputs["sources"] = sources.map(c => {
    const row = sourceRecords.get(c.id)!, quantity = c.kind === "V" ? "voltage" : "current"
    const waveform = c.waveform
    need(waveform === "step" || waveform === "impulse", "forma della sorgente")
    const unit = c.kind === "V" ? (waveform === "step" ? "V" : "V*s") : (waveform === "step" ? "A" : "A*s")
    need(row.quantity === quantity && row.waveform === waveform && object(row.amplitude) && row.amplitude.unit === unit, "forma o unità della sorgente")
    const amplitude = exact(row.amplitude.exact, b)
    need(equal(amplitude, inputExact(c.value, b)), "ampiezza o area discordante")
    const parsed = coefficients(row.transform, b)
    const expected = rf([amplitude], waveform === "step" ? [ZERO, ONE] : [ONE])
    need(same(pMultiply(parsed.rf.n, expected.d, b), pMultiply(expected.n, parsed.rf.d, b)), "trasformata della sorgente discordante")
    return {component: c.id, quantity, waveform, amplitude: {exact: text(amplitude), unit}, transform: parsed.wire}
  })
  function initials<K extends "C" | "L", U extends "V" | "A">(kind: K, unit: U, rows: unknown) {
    const components = model.components.filter(c => c.kind === kind)
    const mapped = records(rows, components.map(c => c.id))
    return components.map(c => {
      const row = mapped.get(c.id)!
      need(row.unit === unit && c.initial !== undefined, "unità o stato iniziale assente")
      const initial = exact(row.exact, b)
      need(equal(initial, inputExact(c.initial, b)), "stato iniziale discordante")
      return {component: c.id, exact: text(initial), unit}
    })
  }
  return {schema: "laplace-inputs.v1", initial_time: "0-", sources: outputSources,
    capacitor_voltages: initials("C", "V", value.capacitor_voltages),
    inductor_currents: initials("L", "A", value.inductor_currents)}
}
