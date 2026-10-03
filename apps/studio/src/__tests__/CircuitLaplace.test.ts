import { describe, expect, it } from "vitest"
import { assertLaplaceAnswerMath, readLaplaceInputs, readLaplaceTransform } from "../toolhost/circuitLaplace"

// Hand-derived algebraic identities and wire contracts, not fabricated backend lessons.
const transform = (numerator = ["1"], denominator = ["1"]) => ({
  variable: "s" as const, coefficient_order: "ascending" as const, numerator, denominator,
})
const number = (value: string) => ({kind: "number", coefficients: [value, "0", "0", "0"]})
const s = {kind: "symbol", name: "s"}
const add = (...args: unknown[]) => ({kind: "add", args})
const multiply = (...args: unknown[]) => ({kind: "multiply", args})
const divide = (numerator: unknown, denominator: unknown) => ({kind: "divide", numerator, denominator})
const netlist = `@laplace
V1 e 0 +1.2e-1 volt step
I1 0 a -3/4 ampere*s impulse
R1 e a 2 ohm
C1 a 0 1/3 farad
L1 a 0 1/2 henry
@initial C1 voltage -2.5e-1 volt
@initial L1 current +4.0 ampere
? voltage C1`
const inputs = () => ({
  schema: "laplace-inputs.v1", initial_time: "0-",
  sources: [
    {component: "V1", quantity: "voltage", waveform: "step", amplitude: {exact: "3/25", unit: "V"}, transform: {numerator: ["3/25"], denominator: ["0", "1"]}},
    {component: "I1", quantity: "current", waveform: "impulse", amplitude: {exact: "-3/4", unit: "A*s"}, transform: {numerator: ["-3/4"], denominator: ["1"]}},
  ],
  capacitor_voltages: [{component: "C1", exact: "-1/4", unit: "V"}],
  inductor_currents: [{component: "L1", exact: "4", unit: "A"}],
})

describe("Laplace transform wire", () => {
  it("normalizes bounded fractions and copies arrays", () => {
    const raw = transform(["2/4", "3/3"], ["2/4", "2/2"])
    const result = readLaplaceTransform(raw)
    expect(result).toEqual(transform(["1/2", "1"], ["1/2", "1"]))
    raw.numerator[0] = "99"
    expect(result.numerator[0]).toBe("1/2")
    expect(readLaplaceTransform(transform(["0/7"]))).toEqual(transform(["0"]))
  })
  it.each([
    null, {...transform(), variable: "t"}, {...transform(), coefficient_order: "descending"},
    transform([], ["1"]), transform(["1"], []), transform(["1"], ["0"]),
    transform(["1"], ["1", "0"]), transform(["1", "0"]),
    transform(["1"], ["2"]), transform(["0"], ["0", "1"]),
    transform(["1/0"]), transform(["1/-2"]), transform(["NaN"]), transform(["Infinity"]),
    transform(["0.5"]), transform(["1e3"]), transform(["1".repeat(513)]),
    transform(Array.from({length: 66}, () => "1")),
  ])("rejects malformed or unbounded RF %#", value => expect(() => readLaplaceTransform(value)).toThrow())
  it("accepts degree 64", () => {
    const raw = transform(Array.from({length: 65}, (_, i) => i === 64 ? "1" : "0"))
    expect(readLaplaceTransform(raw)).toEqual(raw)
  })
})

describe("Exact answer AST binding", () => {
  it("accepts equivalent fractions and expanded polynomial identities", () => {
    // (s+1)/(s+2) + 1/(s+2) = 1, without requiring identical AST shape.
    const expression = add(divide(add(s, number("1")), add(s, number("2"))), divide(number("1"), add(s, number("2"))))
    expect(() => assertLaplaceAnswerMath(expression, transform())).not.toThrow()
    expect(() => assertLaplaceAnswerMath(divide(add(multiply(number("3"), s), number("-2")), add(multiply(s, s), s, number("1"))),
      transform(["-2", "3"], ["1", "1", "1"]))).not.toThrow()
  })
  it("keeps integer distinctions above floating point precision", () => {
    expect(() => assertLaplaceAnswerMath(number("9007199254740993"), transform(["9007199254740993"]))).not.toThrow()
    expect(() => assertLaplaceAnswerMath(number("9007199254740992"), transform(["9007199254740993"]))).toThrow(/discordanti/)
    expect(() => assertLaplaceAnswerMath(add(number("1/3"), number("1/6")), transform(["1/2"]))).not.toThrow()
  })
  it("rejects a different polynomial even if it vanishes at selected sample points", () => {
    expect(() => assertLaplaceAnswerMath(multiply(add(s, number("-1")), add(s, number("-2"))), transform(["0"]))).toThrow(/discordanti/)
  })
  it.each([
    {kind: "symbol", name: "V(a)"}, {kind: "symbol", name: "eval(s)"},
    {kind: "number", coefficients: ["1", "1", "0", "0"]},
    {kind: "number", coefficients: ["1", "0", "0"]},
    {kind: "number", coefficients: ["NaN", "0", "0", "0"]},
    {kind: "equation", left: s, right: s},
    divide(number("1"), number("0")), divide(number("1"), add(s, multiply(number("-1"), s))),
  ])("rejects non-rational, unknown or undefined AST %#", expr => {
    expect(() => assertLaplaceAnswerMath(expr, transform())).toThrow()
  })
  it("bounds depth, nodes, degree, bits and arithmetic work", () => {
    let deep: unknown = number("1")
    for (let i = 0; i < 66; i++) deep = multiply(deep)
    expect(() => assertLaplaceAnswerMath(deep, transform())).toThrow(/profondità/)
    expect(() => assertLaplaceAnswerMath(add(...Array.from({length: 4096}, () => number("0"))), transform(["0"]))).toThrow(/nodi/)
    expect(() => assertLaplaceAnswerMath(multiply(...Array.from({length: 65}, () => s)), transform())).toThrow(/grado/)
    expect(() => assertLaplaceAnswerMath(multiply(...Array.from({length: 5}, () => number("9".repeat(300)))), transform())).toThrow(/bit/)
    let a = 1n, b = 1n
    for (let i = 0; i < 900; i++) [a, b] = [b, a + b]
    expect(() => assertLaplaceAnswerMath(add(...Array.from({length: 1000}, () => number(`${a}/${b}`))), transform())).toThrow(/operazioni/)
  })
  it("bounds cyclic in-memory ASTs", () => {
    const cycle: {kind: string; args: unknown[]} = {kind: "add", args: []}
    cycle.args.push(cycle)
    expect(() => assertLaplaceAnswerMath(cycle, transform())).toThrow(/profondità/)
  })
})

describe("Input metadata binding to the original netlist", () => {
  it("compares decimal, exponent and signed fraction values exactly", () => {
    expect(readLaplaceInputs(inputs(), netlist)).toEqual(inputs())
    const changed = inputs()
    changed.capacitor_voltages[0].exact = "-2/8"
    changed.sources.reverse()
    expect(readLaplaceInputs(changed, netlist)).toEqual(inputs())
  })
  it("accepts equivalent exact source transforms and canonical zero", () => {
    const changed = inputs()
    changed.sources[0].transform = {numerator: ["3/25", "3/25"], denominator: ["0", "1", "1"]}
    expect(() => readLaplaceInputs(changed, netlist)).not.toThrow()
    const zero = inputs()
    zero.sources[0].amplitude.exact = "0"
    zero.sources[0].transform = {numerator: ["0"], denominator: ["1"]}
    expect(() => readLaplaceInputs(zero, netlist.replace("+1.2e-1", "-0.000e+2"))).not.toThrow()
    zero.sources[0].transform.denominator = ["0", "1"]
    expect(() => readLaplaceInputs(zero, netlist.replace("+1.2e-1", "0"))).toThrow(/zero non normalizzato/)
  })
  it.each([
    (v: ReturnType<typeof inputs>) => { v.schema = "laplace-inputs.v2" },
    (v: ReturnType<typeof inputs>) => { v.initial_time = "0+" },
    (v: ReturnType<typeof inputs>) => { v.capacitor_voltages[0].exact = "1/4" },
    (v: ReturnType<typeof inputs>) => { v.inductor_currents[0].exact = "-4" },
    (v: ReturnType<typeof inputs>) => { v.capacitor_voltages[0].unit = "V*s" },
    (v: ReturnType<typeof inputs>) => { v.inductor_currents[0].unit = "V" },
    (v: ReturnType<typeof inputs>) => { v.capacitor_voltages = [] },
    (v: ReturnType<typeof inputs>) => { v.capacitor_voltages.push({...v.capacitor_voltages[0]}) },
    (v: ReturnType<typeof inputs>) => { v.inductor_currents[0].component = "L9" },
    (v: ReturnType<typeof inputs>) => { v.sources[0].quantity = "current" },
    (v: ReturnType<typeof inputs>) => { v.sources[0].waveform = "impulse" },
    (v: ReturnType<typeof inputs>) => { v.sources[0].amplitude.unit = "V*s" },
    (v: ReturnType<typeof inputs>) => { v.sources[1].amplitude.unit = "A" },
    (v: ReturnType<typeof inputs>) => { v.sources[1].amplitude.exact = "3/4" },
    (v: ReturnType<typeof inputs>) => { v.sources[0].transform.denominator = ["1"] },
    (v: ReturnType<typeof inputs>) => { v.sources[1].transform.denominator = ["0", "1"] },
    (v: ReturnType<typeof inputs>) => { v.sources[1].transform.numerator = ["1"] },
    (v: ReturnType<typeof inputs>) => { v.sources.pop() },
    (v: ReturnType<typeof inputs>) => { v.sources[1] = {...v.sources[0]} },
  ])("rejects wrong IC/source/units or contaminated inventory %#", mutate => {
    const changed = inputs(); mutate(changed)
    expect(() => readLaplaceInputs(changed, netlist)).toThrow()
  })
  it("binds large exact input integers without rounding", () => {
    const changed = inputs()
    changed.sources[0].amplitude.exact = "9007199254740993"
    changed.sources[0].transform.numerator = ["9007199254740993"]
    expect(() => readLaplaceInputs(changed, netlist.replace("+1.2e-1", "9007199254740993"))).not.toThrow()
    expect(() => readLaplaceInputs(changed, netlist.replace("+1.2e-1", "9007199254740992"))).toThrow(/discordante/)
  })
  it("bounds exponent conversion before allocating huge integers", () => {
    expect(() => readLaplaceInputs(inputs(), netlist.replace("+1.2e-1", "1e999999999999999999999999"))).toThrow(/esponente/)
    expect(() => readLaplaceInputs(inputs(), netlist.replace("-2.5e-1", "1e513"))).toThrow(/esponente/)
  })
  it("rejects DC input and incomplete initial states", () => {
    expect(() => readLaplaceInputs(inputs(), "V1 a 0 2 volt\nR1 a 0 1 ohm\n? current R1")).toThrow(/regime/)
    expect(() => readLaplaceInputs(inputs(), netlist.replace("@initial L1 current +4.0 ampere\n", ""))).toThrow()
  })
})
