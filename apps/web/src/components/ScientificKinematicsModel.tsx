import {useId, useState} from "react";
import "./scientific-models.css";

export type KinematicsSample = {
  timeS: number; positionXM: number; positionYM: number;
  velocityXMS: number; velocityYMS: number; accelerationXMS2: number; accelerationYMS2: number;
};
export type KinematicsResult = KinematicsSample & {
  activityId: string; version: number;
  parameters: {positionX: number; positionY: number; velocityX: number; velocityY: number;
    accelerationX: number; accelerationY: number; time: number; duration: number};
  speedMS: number; displacementM: number; samples: KinematicsSample[];
};
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1e15;
const fmt = (v: number) => (Object.is(v, -0) ? 0 : v).toLocaleString("it-IT", {maximumSignificantDigits: 6}).replace(/^-/, "−");
const keys = ["timeS", "positionXM", "positionYM", "velocityXMS", "velocityYMS", "accelerationXMS2", "accelerationYMS2"] as const;
const views = {
  trajectory: {label: "Traiettoria", unit: "m", x: "positionXM", y: "positionYM"},
  position: {label: "Posizione nel tempo", unit: "m", x: "positionXM", y: "positionYM"},
  velocity: {label: "Velocità nel tempo", unit: "m/s", x: "velocityXMS", y: "velocityYMS"},
  acceleration: {label: "Accelerazione nel tempo", unit: "m/s²", x: "accelerationXMS2", y: "accelerationYMS2"},
} as const;

function valid(r: KinematicsResult): boolean {
  return r?.activityId === "kinematics-v1" && r.version === 1 && Boolean(r.parameters)
    && ["positionX", "positionY", "velocityX", "velocityY", "accelerationX", "accelerationY", "time", "duration"].every(k => finite(r.parameters[k as keyof KinematicsResult["parameters"]]))
    && r.parameters.duration > 0 && r.parameters.time >= 0 && r.parameters.time <= r.parameters.duration
    && keys.every(k => finite(r[k])) && finite(r.speedMS) && finite(r.displacementM)
    && r.speedMS >= 0 && r.displacementM >= 0
    && Array.isArray(r.samples) && r.samples.length >= 2 && r.samples.length <= 257
    && r.samples.every(s => s && keys.every(k => finite(s[k])));
}

/** Positions, derivatives, vectors and table values are supplied by Core, never integrated here. */
export function ScientificKinematicsModel({result}: {result: KinematicsResult | null}) {
  const [view, setView] = useState<keyof typeof views>("trajectory");
  const arrowId = useId();
  if (result === null) return <figure className="scientific-model"><p>Formula una previsione: moto, vettori e grafici compaiono dopo il confronto.</p></figure>;
  if (!valid(result)) return <p role="status" className="scientific-model">Dati del moto non disponibili o versione non supportata. Conserva i parametri e riapri la risorsa verificata.</p>;
  const metric = views[view], samples = result.samples;
  const trajectory = view === "trajectory";
  const horizontal = (s: KinematicsSample) => trajectory ? s.positionXM : s.timeS;
  const xMin = Math.min(0, ...samples.map(horizontal));
  const xMax = Math.max(0, ...samples.map(horizontal));
  const yValues = trajectory ? samples.map(s => s.positionYM) : samples.flatMap(s => [s[metric.x], s[metric.y]]);
  const yMin = Math.min(0, ...yValues), yMax = Math.max(0, ...yValues);
  // The spatial plot uses equal metres-per-pixel on both axes: vector angles
  // and trajectory shape stay meaningful. Time plots have independent SI axes.
  const spatialScale = Math.min(350 / (xMax - xMin || 1), 160 / (yMax - yMin || 1));
  const x = (v: number) => 70 + (v - xMin) * (trajectory ? spatialScale : 350 / (xMax - xMin || 1));
  const y = (v: number) => 210 - (v - yMin) * (trajectory ? spatialScale : 160 / (yMax - yMin || 1));
  const currentX = x(horizontal(result)), currentY = y(trajectory ? result.positionYM : result[metric.x]);
  const velocityScale = 40 / (Math.max(Math.abs(result.velocityXMS), Math.abs(result.velocityYMS)) || 1);
  const accelerationScale = 30 / (Math.max(Math.abs(result.accelerationXMS2), Math.abs(result.accelerationYMS2)) || 1);
  return <figure className="scientific-model scientific-kinematics">
    <p>t = {fmt(result.timeS)} s · posizione ({fmt(result.positionXM)}; {fmt(result.positionYM)}) m</p>
    <p>v = ({fmt(result.velocityXMS)}; {fmt(result.velocityYMS)}) m/s · a = ({fmt(result.accelerationXMS2)}; {fmt(result.accelerationYMS2)}) m/s²</p>
    <div role="group" aria-label="Rappresentazione del moto" className="scientific-view-controls">
      {(Object.keys(views) as (keyof typeof views)[]).map(key => <button type="button" key={key} aria-pressed={view === key} onClick={() => setView(key)}>{views[key].label}</button>)}
    </div>
    <svg viewBox="0 0 480 290" role="img" aria-label={`${metric.label}: campioni del Core. ${trajectory ? "Posizioni x e y in metri, stessa scala sui due assi; punto pieno al tempo selezionato." : `Tempo in secondi; componenti x continua e y tratteggiata in ${metric.unit}.`}`}>
      <defs><marker id={arrowId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="context-stroke" /></marker></defs>
      <path d={`M${x(0)} 30V220M60 ${y(0)}H440`} fill="none" stroke="currentColor" />
      <polyline data-testid={trajectory ? "kinematics-trajectory" : "kinematics-component-x"} points={samples.map(s => `${x(horizontal(s))},${y(trajectory ? s.positionYM : s[metric.x])}`).join(" ")} fill="none" stroke="var(--accent-text, currentColor)" strokeWidth="3" />
      {!trajectory && <polyline points={samples.map(s => `${x(s.timeS)},${y(s[metric.y])}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" />}
      <circle cx={currentX} cy={currentY} r="5" fill="currentColor" />
      {trajectory && <>
        {(result.velocityXMS !== 0 || result.velocityYMS !== 0) && <path d={`M${currentX} ${currentY}l${result.velocityXMS * velocityScale} ${-result.velocityYMS * velocityScale}`} stroke="var(--accent-text, currentColor)" strokeWidth="3" markerEnd={`url(#${arrowId})`} />}
        {(result.accelerationXMS2 !== 0 || result.accelerationYMS2 !== 0) && <path d={`M${currentX} ${currentY}l${result.accelerationXMS2 * accelerationScale} ${-result.accelerationYMS2 * accelerationScale}`} stroke="currentColor" strokeDasharray="4 3" strokeWidth="3" markerEnd={`url(#${arrowId})`} />}
      </>}
      <text x="5" y="24">{trajectory ? "y [m]" : metric.unit}</text><text x="5" y="49">{fmt(yMax)}</text><text x="5" y="233">{fmt(yMin)}</text>
      <text x="70" y="253">{fmt(xMin)}</text><text x={x(xMax) - 18} y="253">{fmt(xMax)}</text><text x="185" y="281">{trajectory ? "Posizione x [m]" : "Tempo t [s]"}</text>
    </svg>
    <p>{trajectory ? "Freccia continua: velocità; tratteggiata: accelerazione. Le frecce mostrano direzioni con scale proprie: confronta i valori e le unità indicati, non la loro lunghezza reciproca." : "Linea continua: componente x. Linea tratteggiata: componente y. Il punto pieno identifica il tempo selezionato sulla componente x."}</p>
    <details><summary>Valori del moto</summary><div className="scientific-table-wrap"><table aria-label={`Campioni: ${metric.label.toLowerCase()}`}>
      <thead><tr>{trajectory ? <><th scope="col">x [m]</th><th scope="col">y [m]</th></> : <><th scope="col">t [s]</th><th scope="col">Componente x [{metric.unit}]</th><th scope="col">Componente y [{metric.unit}]</th></>}</tr></thead>
      <tbody>{samples.map((s, i) => <tr key={i}>{trajectory ? <><td>{fmt(s.positionXM)}</td><td>{fmt(s.positionYM)}</td></> : <><td>{fmt(s.timeS)}</td><td>{fmt(s[metric.x])}</td><td>{fmt(s[metric.y])}</td></>}</tr>)}</tbody>
    </table></div></details>
    <figcaption>Moto ideale ad accelerazione costante; nessun urto simulato. Rapidità: {fmt(result.speedMS)} m/s. Modulo dello spostamento: {fmt(result.displacementM)} m; non è la distanza percorsa se il moto cambia direzione.</figcaption>
  </figure>;
}
