/** A local mathematical artifact. Numerical plotting is not a proof of a theorem. */
export const FUNCTION_GRAPH_TOOL_ID = "io.ardesia.function-graph"
export const FUNCTION_GRAPH_EMBED_ID = "function-graph"
export type FunctionGraphState = {
  kind: "function-graph-v1"
  v: 1
  title: string
  coefficients: [string, string, string] | null
  domain: { min: string; max: string }
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export function graphNumber(text: string): number {
  if (typeof text !== "string" || text.length > 32) throw new Error("Numero troppo lungo.")
  const value = text.trim().replace(",", ".")
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:\/[1-9]\d*)?$/.test(value))
    throw new Error("Usa un numero decimale o una frazione, per esempio 1/3.")
  const [a, b] = value.split("/").map(Number)
  const result = a! / (b ?? 1)
  if (!Number.isFinite(result) || Math.abs(result) > 1_000_000)
    throw new Error("Il valore deve essere finito e compreso fra −1000000 e 1000000.")
  return result
}

export function emptyFunctionGraphState(): FunctionGraphState {
  return { kind: "function-graph-v1", v: 1, title: "", coefficients: null, domain: { min: "-5", max: "5" } }
}

export function readFunctionGraphState(value: unknown): FunctionGraphState {
  if (!record(value) || value.kind !== "function-graph-v1" || value.v !== 1 ||
      typeof value.title !== "string" || value.title.length > 120 || !record(value.domain) ||
      typeof value.domain.min !== "string" || typeof value.domain.max !== "string")
    throw new Error("Il grafico salvato ha un formato non supportato.")
  const min = graphNumber(value.domain.min), max = graphNumber(value.domain.max)
  if (Math.abs(min) > 10_000 || Math.abs(max) > 10_000 || max - min < 0.000001)
    throw new Error("Scegli un intervallo crescente fra −10000 e 10000, largo almeno 0,000001.")
  let coefficients: FunctionGraphState["coefficients"] = null
  if (value.coefficients !== null) {
    if (!Array.isArray(value.coefficients) || value.coefficients.length !== 3 ||
        !value.coefficients.every(c => typeof c === "string")) throw new Error("Servono i tre coefficienti a, b e c.")
    value.coefficients.forEach(graphNumber)
    coefficients = [...value.coefficients] as [string, string, string]
  }
  return { kind: "function-graph-v1", v: 1, title: value.title, coefficients,
    domain: { min: value.domain.min, max: value.domain.max } }
}

export function evaluateGraph(state: FunctionGraphState, x: number): number {
  const valid = readFunctionGraphState(state)
  if (!valid.coefficients || !Number.isFinite(x)) throw new Error("Inserisci una funzione e un valore finito di x.")
  const [a, b, c] = valid.coefficients.map(graphNumber)
  const y = (a! * x + b!) * x + c!
  if (!Number.isFinite(y)) throw new Error("Il risultato numerico non è finito.")
  return y
}

export function graphFormula(state: FunctionGraphState): string {
  return state.coefficients ? `y = (${state.coefficients[0]})x² + (${state.coefficients[1]})x + (${state.coefficients[2]})` : "Nessuna funzione inserita"
}

const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
const readable = (value: number) => Math.abs(value) >= 1_000_000 || (value !== 0 && Math.abs(value) < .0001)
  ? value.toExponential(3).replace(/\.?0+e/, "e") : Number(value.toPrecision(5)).toString()
const fitText = (value: string, limit: number) => value.length > limit ? ' textLength="500" lengthAdjust="spacingAndGlyphs"' : ""

/** A self-contained SVG: no scripts, external resources, provider or dependency. */
export function exportFunctionGraphSvg(input: FunctionGraphState): string {
  const state = readFunctionGraphState(input)
  const title = state.title || "Grafico di funzione"
  const formula = graphFormula(state)
  const min = graphNumber(state.domain.min), max = graphNumber(state.domain.max)
  const points: Array<[number, number]> = []
  if (state.coefficients) {
    const [a, b, c] = state.coefficients.map(graphNumber) as [number, number, number]
    for (let i = 0; i <= 400; i++) {
      const x = min + (max - min) * i / 400
      points.push([x, (a * x + b) * x + c])
    }
    const vertex = a === 0 ? NaN : -b / (2 * a)
    if (vertex > min && vertex < max) points.push([vertex, (a * vertex + b) * vertex + c])
    points.sort((left, right) => left[0] - right[0])
  }
  const ys = points.map(p => p[1])
  const low = ys.length ? Math.min(...ys) : -1, high = ys.length ? Math.max(...ys) : 1
  const pad = Math.max((high - low) * .1, Math.abs(high) * .01, .1)
  const bottom = low - pad, top = high + pad
  const px = (x: number) => 65 + (x - min) * 500 / (max - min)
  const py = (y: number) => 295 - (y - bottom) * 225 / (top - bottom)
  const path = points.map(([x, y], i) => `${i ? "L" : "M"}${px(x).toFixed(3)} ${py(y).toFixed(3)}`).join(" ")
  const yAxis = min <= 0 && max >= 0 ? px(0) : 65
  const xAxis = bottom <= 0 && top >= 0 ? py(0) : 295
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 345" role="img" aria-label="${xml(title)}">` +
    `<title>${xml(title)}</title><desc>${xml(graphFormula(state))}; x da ${xml(state.domain.min)} a ${xml(state.domain.max)}. Grafico numerico.</desc>` +
    `<rect width="620" height="345" fill="white"/><text x="65" y="26" font-family="sans-serif" font-size="17" fill="#203343"${fitText(title, 48)}>${xml(title)}</text>` +
    `<text x="65" y="49" font-family="sans-serif" font-size="13" fill="#405568"${fitText(formula, 60)}>${xml(formula)}</text>` +
    `<path d="M65 70 L65 295 L565 295" fill="none" stroke="#d1d8de"/>` +
    `<path d="M65 ${xAxis} L565 ${xAxis} M${yAxis} 70 L${yAxis} 295" fill="none" stroke="#687988"/>` +
    (path ? `<path data-function-curve="true" d="${path}" fill="none" stroke="#295cba" stroke-width="2.5"/>` : "") +
    `<text x="65" y="319" font-family="sans-serif" font-size="12" fill="#405568">${xml(state.domain.min)}</text>` +
    `<text x="565" y="319" text-anchor="end" font-family="sans-serif" font-size="12" fill="#405568">${xml(state.domain.max)}   x</text>` +
    `<text x="58" y="80" text-anchor="end" font-family="sans-serif" font-size="11" fill="#405568">${readable(top)}</text>` +
    `<text x="58" y="295" text-anchor="end" font-family="sans-serif" font-size="11" fill="#405568">${readable(bottom)}</text></svg>`
}
