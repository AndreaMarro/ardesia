import {useState} from "react";
import "./scientific-models.css";

export type ElectricalResult = {
  activityId: string; version: number;
  parameters: {voltage: number; resistance1: number; resistance2: number; topology: "series" | "parallel"};
  currentA: number; equivalentResistanceOhm: number; totalPowerW: number;
  branches: {id: string; resistanceOhm: number; currentA: number; voltageV: number; powerW: number}[];
  ivSamples: {voltageV: number; currentA: number; totalPowerW: number}[];
};

// All outputs of the bounded Core model are below 10^15 in SI. A finite but
// corrupt 1e308 sample would overflow pixel-range subtraction; reject it too.
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 1e15;
const fmt = (value: number) => (Object.is(value, -0) ? 0 : value).toLocaleString("it-IT", {
  maximumSignificantDigits: 6, notation: Math.abs(value) > 0 && (Math.abs(value) < .001 || Math.abs(value) >= 1e6) ? "scientific" : "standard",
}).replace(/^-/, "−");

function valid(result: ElectricalResult): boolean {
  const p = result?.parameters;
  return result?.activityId === "dc-resistance-v1" && result.version === 1 && Boolean(p)
    && ["series", "parallel"].includes(p.topology)
    && [p.voltage, p.resistance1, p.resistance2, result.currentA, result.equivalentResistanceOhm, result.totalPowerW].every(finite)
    && p.resistance1 > 0 && p.resistance2 > 0 && result.equivalentResistanceOhm > 0 && result.totalPowerW >= 0
    && Array.isArray(result.branches) && result.branches.length === 2
    && result.branches.every(b => b && typeof b.id === "string" && [b.resistanceOhm, b.currentA, b.voltageV, b.powerW].every(finite) && b.resistanceOhm > 0 && b.powerW >= 0)
    && Array.isArray(result.ivSamples) && result.ivSamples.length >= 2 && result.ivSamples.length <= 257
    && result.ivSamples.every(s => s && [s.voltageV, s.currentA, s.totalPowerW].every(finite) && s.totalPowerW >= 0);
}

/** Presentation only: all SI values and graph points come from the versioned Core result. */
export function ScientificElectricalModel({result}: {result: ElectricalResult | null}) {
  const [view, setView] = useState<"circuit" | "current" | "power">("circuit");
  if (result === null) return <figure className="scientific-model"><p>Formula una previsione: circuito, misure e grafici compaiono dopo il confronto.</p></figure>;
  if (!valid(result)) return <p role="status" className="scientific-model">Dati del circuito non disponibili o versione non supportata. Conserva i parametri e riapri la risorsa verificata.</p>;
  const {parameters: p, ivSamples} = result;
  const topology = p.topology === "series" ? "serie" : "parallelo";
  // Pixel scaling only. Including zero keeps signed voltages/currents legible.
  const xMin = Math.min(0, ...ivSamples.map(s => s.voltageV));
  const xMax = Math.max(0, ...ivSamples.map(s => s.voltageV));
  const currentMin = Math.min(0, ...ivSamples.map(s => s.currentA));
  const currentMax = Math.max(0, ...ivSamples.map(s => s.currentA));
  const powerMax = Math.max(0, ...ivSamples.map(s => s.totalPowerW));
  const x = (v: number) => 60 + (v - xMin) / (xMax - xMin || 1) * 370;
  const yCurrent = (i: number) => 200 - (i - currentMin) / (currentMax - currentMin || 1) * 160;
  const yPower = (w: number) => 200 - w / (powerMax || 1) * 160;
  return <figure className="scientific-model scientific-electrical">
    <div role="group" aria-label="Rappresentazione del circuito" className="scientific-view-controls">
      <button type="button" aria-pressed={view === "circuit"} onClick={() => setView("circuit")}>Circuito e misure</button>
      <button type="button" aria-pressed={view === "current"} onClick={() => setView("current")}>Corrente e tensione</button>
      <button type="button" aria-pressed={view === "power"} onClick={() => setView("power")}>Potenza e tensione</button>
    </div>
    {view === "circuit" &&
    <svg viewBox="0 0 480 210" role="img" aria-label={`Circuito in ${topology}, generatore ideale ${fmt(p.voltage)} V, due resistori ${fmt(p.resistance1)} e ${fmt(p.resistance2)} ohm.`}>
      <path d="M75 85V40H410V170H75V125M55 85H95M63 125H87" fill="none" stroke="currentColor" strokeWidth="3" />
      {p.topology === "series" ? <>
        <rect x="170" y="28" width="55" height="24" /><rect x="285" y="28" width="55" height="24" />
        <text x="170" y="80">R₁</text><text x="285" y="80">R₂</text>
      </> : <>
        <path d="M150 40V105H350V40" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="220" y="28" width="55" height="24" /><rect x="220" y="93" width="55" height="24" />
        <text x="285" y="70">R₁</text><text x="285" y="137">R₂</text>
      </>}
      <text x="12" y="152">{fmt(p.voltage)} V</text><text x="155" y="197">Collegamento in {topology}</text>
    </svg>}
    <dl className="scientific-readings">
      <div><dt>Resistenza equivalente</dt><dd>{fmt(result.equivalentResistanceOhm)} Ω</dd></div>
      <div><dt>Corrente totale</dt><dd>{fmt(result.currentA)} A</dd></div>
      <div><dt>Potenza totale dissipata</dt><dd>{fmt(result.totalPowerW)} W</dd></div>
    </dl>
    {view === "circuit" && <div className="scientific-table-wrap"><table aria-label="Misure dei due resistori">
      <thead><tr><th scope="col">Resistore</th><th scope="col">R [Ω]</th><th scope="col">ΔV [V]</th><th scope="col">I [A]</th><th scope="col">P [W]</th></tr></thead>
      <tbody>{result.branches.map((b, index) => <tr key={index}><th scope="row">{b.id}</th><td>{fmt(b.resistanceOhm)}</td><td>{fmt(b.voltageV)}</td><td>{fmt(b.currentA)}</td><td>{fmt(b.powerW)}</td></tr>)}</tbody>
    </table></div>}
    {view !== "circuit" && <p>I due grafici usano le stesse resistenze e lo stesso collegamento. Cambia soltanto la tensione del generatore.</p>}
    {view === "current" && <svg viewBox="0 0 480 270" role="img" aria-label="Corrente totale in funzione della tensione, campioni del Core">
      <path d={`M${x(0)} 25V200M60 ${yCurrent(0)}H440`} fill="none" stroke="currentColor" />
      <polyline data-testid="electrical-iv-curve" points={ivSamples.map(s => `${x(s.voltageV)},${yCurrent(s.currentA)}`).join(" ")} fill="none" stroke="var(--accent-text, currentColor)" strokeWidth="3" />
      <text x="8" y="23">I [A]</text><text x="8" y="50">{fmt(currentMax)}</text><text x="8" y="222">{fmt(currentMin)}</text>
      <text x="60" y="240">{fmt(xMin)}</text><text x="395" y="240">{fmt(xMax)}</text><text x="175" y="263">Tensione ΔV [V]</text>
    </svg>}
    {view === "power" && <svg viewBox="0 0 480 270" role="img" aria-label="Potenza dissipata in funzione della tensione, campioni del Core">
      <path d={`M${x(0)} 25V200M60 200H440`} fill="none" stroke="currentColor" />
      <polyline data-testid="electrical-power-curve" points={ivSamples.map(s => `${x(s.voltageV)},${yPower(s.totalPowerW)}`).join(" ")} fill="none" stroke="var(--accent-text, currentColor)" strokeWidth="3" />
      <text x="8" y="23">P [W]</text><text x="8" y="50">{fmt(powerMax)}</text><text x="15" y="222">0</text>
      <text x="60" y="240">{fmt(xMin)}</text><text x="395" y="240">{fmt(xMax)}</text><text x="175" y="263">Tensione ΔV [V]</text>
    </svg>}
    {view !== "circuit" && <details><summary>Valori dei grafici elettrici</summary><div className="scientific-table-wrap"><table aria-label="Campioni di tensione corrente e potenza">
      <thead><tr><th scope="col">ΔV [V]</th><th scope="col">I [A]</th><th scope="col">P [W]</th></tr></thead>
      <tbody>{ivSamples.map((s, i) => <tr key={i}><td>{fmt(s.voltageV)}</td><td>{fmt(s.currentA)}</td><td>{fmt(s.totalPowerW)}</td></tr>)}</tbody>
    </table></div></details>}
    <figcaption>Modello ideale statico. Nessuna animazione rappresenta il moto degli elettroni. La potenza indicata non certifica il funzionamento sicuro di componenti reali.</figcaption>
  </figure>;
}
