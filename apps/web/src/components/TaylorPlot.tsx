import { useId } from "react";
import "./TaylorPlot.css";

export type TaylorSample = {
  x: number;
  value: number;
  referenceValue: number;
  absoluteError: number;
  remainderBound: number;
};
type Plot = { schemaVersion: 1; domain: [-1, 1]; samples: TaylorSample[] };
export type TaylorResult = {
  value: number;
  degree: number;
  terms: number;
  remainderBound: number;
  domain: string;
  scientificApproval: "NOT_RUN";
  referenceValue?: number;
  absoluteError?: number;
  plot?: Plot;
};
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const positiveOrZero = (value: unknown): value is number => finite(value) && value >= 0;
const invalid = () => new Error("I dati del confronto non sono validi. Riprova senza modificare la previsione.");

/** Validate transport and request identity; numerical modelling stays in Core. */
export function readTaylorResult(value: unknown, parameters: { x: number; degree: number }): TaylorResult {
  if (!object(value) || !finite(value.value) || value.degree !== parameters.degree ||
      value.terms !== parameters.degree + 1 || !positiveOrZero(value.remainderBound) ||
      typeof value.domain !== "string" || value.scientificApproval !== "NOT_RUN" ||
      (value.x !== undefined && value.x !== parameters.x) ||
      (value.activityId !== undefined && value.activityId !== "taylor-exp-v1") ||
      (value.unit !== undefined && value.unit !== "1")) throw invalid();
  const result: TaylorResult = {
    value: value.value, degree: parameters.degree, terms: parameters.degree + 1,
    remainderBound: value.remainderBound, domain: value.domain, scientificApproval: "NOT_RUN",
  };
  if (value.referenceValue !== undefined || value.absoluteError !== undefined) {
    if (!finite(value.referenceValue) || value.referenceValue <= 0 || !positiveOrZero(value.absoluteError)) throw invalid();
    result.referenceValue = value.referenceValue;
    result.absoluteError = value.absoluteError;
  }
  // Legacy numeric responses remain usable. Absence never creates a schematic curve.
  if (value.plot === undefined) return result;
  const plot = value.plot;
  if (!object(plot) || plot.schemaVersion !== 1 || !Array.isArray(plot.domain) ||
      plot.domain.length !== 2 || plot.domain[0] !== -1 || plot.domain[1] !== 1 ||
      !Array.isArray(plot.samples) || plot.samples.length < 2 || plot.samples.length > 41 ||
      value.x !== parameters.x ||
      result.referenceValue === undefined || result.absoluteError === undefined) throw invalid();
  let previous = -Infinity;
  const samples = plot.samples.map((point): TaylorSample => {
    if (!object(point) || !finite(point.x) || point.x < -1 || point.x > 1 || point.x <= previous ||
        !finite(point.value) || !finite(point.referenceValue) || point.referenceValue <= 0 ||
        !positiveOrZero(point.absoluteError) || !positiveOrZero(point.remainderBound) ||
        !finite(point.value - point.remainderBound) || !finite(point.value + point.remainderBound)) throw invalid();
    previous = point.x;
    return { x: point.x, value: point.value, referenceValue: point.referenceValue,
      absoluteError: point.absoluteError, remainderBound: point.remainderBound };
  });
  if (samples[0].x !== -1 || samples.at(-1)!.x !== 1) throw invalid();
  const lower = Math.min(0, result.value - result.remainderBound, ...samples.map((point) => point.value - point.remainderBound));
  const upper = Math.max(3, result.value + result.remainderBound, result.referenceValue, ...samples.map((point) => point.value + point.remainderBound), ...samples.map((point) => point.referenceValue));
  if (!finite(upper - lower)) throw invalid();
  result.plot = { schemaVersion: 1, domain: [-1, 1], samples };
  return result;
}

const format = (value: number) => value.toLocaleString("it-IT", { maximumSignificantDigits: 7 });

export function TaylorPlot({ result, x }: { result: TaylorResult; x: number }) {
  const descriptionId = useId();
  if (!result.plot) return <p className="taylor-plot-unavailable" role="status">Grafico non disponibile per questa risposta del Core. Il confronto numerico resta utilizzabile.</p>;
  const { samples } = result.plot;
  const lower = Math.min(0, result.value - result.remainderBound, ...samples.map((point) => point.value - point.remainderBound));
  const upper = Math.max(3, result.value + result.remainderBound, result.referenceValue!, ...samples.map((point) => point.value + point.remainderBound), ...samples.map((point) => point.referenceValue));
  const px = (argument: number) => 54 + (argument + 1) * 226;
  const py = (value: number) => 28 + (upper - value) / (upper - lower) * 230;
  const path = (points: { x: number; value: number }[]) => points.map((point, index) => `${index ? "L" : "M"}${px(point.x)},${py(point.value)}`).join(" ");
  const reference = path(samples.map((point) => ({ x: point.x, value: point.referenceValue })));
  const polynomial = path(samples);
  const band = path(samples.map((point) => ({ x: point.x, value: point.value + point.remainderBound }))) + " " +
    [...samples].reverse().map((point) => `L${px(point.x)},${py(point.value - point.remainderBound)}`).join(" ") + " Z";
  return <figure className="taylor-plot">
    <svg viewBox="0 0 560 310" role="img" aria-label={`Curva di exp e polinomio di grado ${result.degree} dai campioni del Core`} aria-describedby={descriptionId}>
      <path d={band} data-series="bound" fill="var(--accent, #a15e43)" opacity=".12" />
      <path d={`M54 ${py(0)}H506M280 28V258`} fill="none" stroke="currentColor" opacity=".4" />
      <path d={reference} data-series="reference" fill="none" stroke="#3f5d4d" strokeWidth="2.5" />
      <path d={polynomial} data-series="polynomial" fill="none" stroke="var(--accent, #a15e43)" strokeWidth="2.5" strokeDasharray="7 4" />
      <path d={`M${px(x)} 28V258`} fill="none" stroke="currentColor" strokeDasharray="2 5" opacity=".6" />
      <circle cx={px(x)} cy={py(result.value)} r="4" fill="var(--accent, #a15e43)" />
      <circle cx={px(x)} cy={py(result.referenceValue!)} r="3" fill="#3f5d4d" />
      <text x="54" y="281" textAnchor="middle">−1</text><text x="280" y="281" textAnchor="middle">0</text><text x="506" y="281" textAnchor="middle">1</text>
      <text x="525" y="281">x</text>
      <text x="45" y="33" textAnchor="end">{format(upper)}</text>
      <text x="45" y="262" textAnchor="end">{format(lower)}</text>
      <text x="54" y="15">valore · unità 1</text>
    </svg>
    <figcaption id={descriptionId}>
      <span className="taylor-plot-legend"><span>Continua: exp</span><span>Tratteggio: P{result.degree}</span><span>Fascia: maggiorante ±R</span></span>
      {samples.length} campioni canonici su [−1, 1], collegati da segmenti. La fascia usa il maggiorante conservativo; lo scarto numerico non è una dimostrazione.
    </figcaption>
    <details><summary>Leggi i campioni del grafico</summary>
      <div className="taylor-samples-scroll"><table><caption>Valori restituiti dal Core, grado {result.degree}</caption>
        <thead><tr><th scope="col">x</th><th scope="col">P{result.degree}</th><th scope="col">exp</th><th scope="col">Scarto numerico</th><th scope="col">Maggiorante</th></tr></thead>
        <tbody>{samples.map((point) => <tr key={point.x}><th scope="row">{format(point.x)}</th><td>{format(point.value)}</td><td>{format(point.referenceValue)}</td><td>{format(point.absoluteError)}</td><td>{format(point.remainderBound)}</td></tr>)}</tbody>
      </table></div>
    </details>
  </figure>;
}
