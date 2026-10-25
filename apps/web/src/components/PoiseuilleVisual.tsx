import {useId, useState} from "react";
import {publicGraphSeries, publicVisualState} from "../publicPreview";

const number = (value: number) => value.toLocaleString("it-IT", {maximumFractionDigits: 4});
export type PoiseuilleVisualState = {flowRatio: number; pressureRatio: number; meanSpeedRatio: number};
export function PoiseuilleModel({radius, boundary, revealed = false, graph = false, visualState, lengthRatio = 1, viscosityRatio = 1}: {
  radius: number; boundary: string; revealed?: boolean; graph?: boolean;
  visualState?: PoiseuilleVisualState; lengthRatio?: number; viscosityRatio?: number;
}) {
  const clip = useId();
  const [moving, setMoving] = useState(true);
  const visual = revealed ? visualState ?? publicVisualState(radius, boundary) : null;
  const height = 35 * radius;
  const referenceLength = 455 / Math.max(1, lengthRatio), comparisonLength = referenceLength * lengthRatio;
  const changedMaterial = lengthRatio !== 1 || viscosityRatio !== 1;
  function particles(y: number, halfHeight: number, speed: number, id: string) {
    return <g clipPath={`url(#${id})`} className={moving ? "flow-tracers" : "flow-tracers is-paused"}>
      {[-.5, 0, .5].flatMap((row, lane) => [0, 1, 2, 3, 4].map(index => <circle
        key={`${lane}-${index}`} cx="105" cy={y + row * halfHeight} r="3"
        className="flow-tracer" style={{animationDuration: `${8 / speed}s`, animationDelay: `${-(index / 5 + lane / 15) * 8 / speed}s`}} />))}
    </g>;
  }
  return <figure className="poiseuille-model discovery-model">
    <div className="model-key"><span>{changedMaterial ? `η/η₀ = ${number(viscosityRatio)} · L/L₀ = ${number(lengthRatio)}` : "Stesso fluido · stessa lunghezza"}</span><span>{boundary === "flow" ? "Q fissata" : "Δp fissata"}</span></div>
    <svg viewBox="0 0 680 335" role="img" aria-label={`Due tubi cilindrici con rapporto dei raggi ${radius}. ${changedMaterial ? `Rapporto viscosità ${viscosityRatio}, rapporto lunghezze ${lengthRatio}. ` : ""}${visual ? "Confronto del trasporto medio." : "Geometria prima della previsione."}`}>
      <defs>
        <clipPath id={clip + "-reference"}><rect x="95" y="48" width={referenceLength} height="70" /></clipPath>
        <clipPath id={clip + "-comparison"}><rect x="95" y={235 - height} width={comparisonLength} height={height * 2} /></clipPath>
      </defs>
      <g className="pipe-reference"><text x="24" y="30">riferimento</text>
        <rect x="95" y="48" width={referenceLength} height="70" className="tube-body" />
        <line x1="95" x2={95 + referenceLength} y1="83" y2="83" className="pipe-axis" />
        <path d={`M${125 + referenceLength} 48V118M${119 + referenceLength} 48H${131 + referenceLength}M${119 + referenceLength} 118H${131 + referenceLength}`} className="pipe-dimension" />
        <text x={141 + referenceLength} y="88">2r₀</text>
        {lengthRatio !== 1 && <text x={95 + referenceLength / 2} y="145" textAnchor="middle">L₀</text>}
        {visual && particles(83, 35, 1, clip + "-reference")}
      </g>
      <g className="pipe-comparison"><text x="24" y="153">confronto</text>
        <rect x="95" y={235 - height} width={comparisonLength} height={height * 2} className="tube-body" />
        <line x1="95" x2={95 + comparisonLength} y1="235" y2="235" className="pipe-axis" />
        <path d={`M${125 + comparisonLength} ${235 - height}V${235 + height}M${119 + comparisonLength} ${235 - height}H${131 + comparisonLength}M${119 + comparisonLength} ${235 + height}H${131 + comparisonLength}`} className="pipe-dimension" />
        <text x={141 + comparisonLength} y="240">2r</text>
        {visual && particles(235, height, visual.meanSpeedRatio, clip + "-comparison")}
      </g>
      <path d={`M95 317H${95 + comparisonLength}M95 312V322M${95 + comparisonLength} 312V322`} className="pipe-dimension" />
      <text x={95 + comparisonLength / 2} y="331" textAnchor="middle">{lengthRatio === 1 ? "L costante" : `L/L₀ = ${number(lengthRatio)}`}</text>
    </svg>
    <figcaption>r / r₀ = {number(radius)} · {boundary === "flow" ? "Q è costante: la portata non cambia." : "Δp è costante: confronta la portata."}</figcaption>
    {visual && <>
      <div className="flow-measures" data-testid="flow-measures" data-speed-ratio={visual.meanSpeedRatio}>
        <div><span>Portata</span><strong>Q/Q₀ = {number(visual.flowRatio)}</strong></div>
        <div><span>Differenza Δp</span><strong>Δp/Δp₀ = {number(visual.pressureRatio)}</strong></div>
        <div><span>Velocità media</span><strong>v/v₀ = {number(visual.meanSpeedRatio)}</strong></div>
      </div>
      <button type="button" className="flow-motion-control" aria-pressed={!moving} onClick={() => setMoving(value => !value)}>{moving ? "Ferma il flusso" : "Anima il flusso"}</button>
      <p className="model-note">I punti rappresentano il trasporto medio, non il profilo locale di velocità. Il loro numero non misura la portata. Q = velocità media × area; a Q fissata il tubo più largo richiede una velocità minore.</p>
    </>}
    {graph && visual && !changedMaterial && <PoiseuilleGraph radius={radius} boundary={boundary} />}
  </figure>;
}

function PoiseuilleGraph({radius, boundary}: {radius: number; boundary: string}) {
  const states = publicGraphSeries(boundary);
  const x = (r: number) => 65 + (r - .5) / 1.5 * 510;
  const y = (ratio: number) => 248 - ratio / 16 * 190;
  const selected = states.find(point => point.radius === radius)!;
  return <div className="poiseuille-graph" data-testid="poiseuille-graph">
    <h3>La relazione, punto per punto.</h3>
    <svg viewBox="0 0 650 305" role="img" aria-label={`Grafico dei 31 risultati del Core: ${boundary === "flow" ? "rapporto delle pressioni a portata fissata" : "rapporto delle portate a pressione fissata"}`}>
      {[0, 8, 16].map(tick => <g key={tick}><line x1="65" x2="590" y1={y(tick)} y2={y(tick)} className="graph-grid" /><text x="48" y={y(tick) + 4} textAnchor="end">{tick}</text></g>)}
      <path d="M65 44V248H590" className="graph-axis" />
      {[.5, 1, 1.5, 2].map(tick => <text key={tick} x={x(tick)} y="270" textAnchor="middle">{number(tick)}</text>)}
      <polyline points={states.map(point => `${x(point.radius)},${y(point.ratio)}`).join(" ")} className="graph-curve" />
      <line x1={x(radius)} x2={x(radius)} y1={y(selected.ratio)} y2="248" className="graph-guide" />
      <circle cx={x(radius)} cy={y(selected.ratio)} r="6" className="graph-current" />
      <text x="65" y="25">{boundary === "flow" ? "Δp/Δp₀" : "Q/Q₀"}</text><text x="575" y="295">r/r₀</text>
    </svg>
    <p className="model-note">31 configurazioni calcolate dal Core. I segmenti collegano i punti; il controllo usa soltanto i valori esatti, senza interpolare risultati.</p>
  </div>;
}
