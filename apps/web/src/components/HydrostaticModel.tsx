export type HydrostaticPoint = {depth: number; value: number};
export type HydrostaticResult = {value: number; unit: string; domain: string; calculatedVariable?: string};
export const hydrostaticFormat = (value: number) => value.toLocaleString("it-IT", {maximumFractionDigits: 3});

/** Geometry maps supplied Core values; it never evaluates a pressure law. */
export function HydrostaticModel({depth, result, points = []}: {
  depth: number; result?: HydrostaticResult | null; points?: HydrostaticPoint[];
}) {
  const usable = points.length > 1 && points.every(p => Number.isFinite(p.value) && Number.isFinite(p.depth) && p.depth >= 0 && p.depth <= 4);
  const max = usable ? Math.max(...points.map(p => p.value), 1) : 1;
  return <figure className="hydrostatic-model">
    <svg viewBox="0 0 480 310" role="img" aria-label={`Liquido fermo, sonda a ${hydrostaticFormat(depth)} metri sotto la superficie. Schema geometrico.`}>
      <path d="M65 30V250H280V30" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M68 50H277V247H68Z" fill="var(--hydro-water, #d9e9ef)" />
      <path d="M68 50H277" stroke="var(--accent)" strokeWidth="2" />
      <text x="75" y="38">Superficie · h = 0</text>
      <path d={`M305 50V${50 + depth * 45}M297 50H313M297 ${50 + depth * 45}H313`} fill="none" stroke="currentColor" />
      <circle cx="180" cy={50 + depth * 45} r="7" fill="var(--accent)" />
      <path d={`M187 ${50 + depth * 45}H277`} stroke="var(--accent)" strokeDasharray="4 4" />
      <text x="320" y={65 + depth * 22}>h = {hydrostaticFormat(depth)} m</text>
      <text x="75" y="275"><tspan x="75">La profondità parte</tspan><tspan x="75" dy="25">dalla superficie.</tspan></text>
    </svg>
    {result && usable && <svg viewBox="0 0 480 255" role="img" aria-label="Pressione in funzione della profondità, punti calcolati dal Core" data-testid="hydrostatic-graph">
      <path d="M75 20V205H445" fill="none" stroke="currentColor" />
      <polyline points={points.map(p => `${75 + p.depth / 4 * 350},${200 - p.value / max * 165}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="3" />
      {points.map(p => <circle key={p.depth} cx={75 + p.depth / 4 * 350} cy={200 - p.value / max * 165} r="3" fill="var(--accent)"><title>{hydrostaticFormat(p.depth)} m: {hydrostaticFormat(p.value)} Pa</title></circle>)}
      <text x="8" y="24">p [Pa]</text><text x="95" y="24">max {hydrostaticFormat(max)}</text>
      <text x="65" y="225">0</text><text x="360" y="240">h [m] · 0–4</text>
    </svg>}
    <figcaption>{result ? `${usable ? "La curva usa soltanto valori del motore scientifico." : "Il valore viene dal motore scientifico."} Lo schema del liquido indica la posizione, non la distribuzione locale delle forze.` : `Prima osserva la posizione della sonda e formula una previsione.${usable ? " Il grafico compare dopo il confronto." : ""}`}</figcaption>
  </figure>;
}
