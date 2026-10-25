import "./scientific-models.css";

export type WaveResult = {
  activityId: string; version: number;
  parameters: {speed: number; frequency: number; amplitude: number; phase: number; time: number};
  wavelengthM: number; periodS: number; probeDisplacementM: number;
  spatialSamples: {xM: number; displacementM: number}[];
  temporalSamples: {timeS: number; displacementM: number}[];
};

// Bounds above the Core's SI domain also keep corrupt finite values from
// overflowing SVG range subtraction. This is data validation, not wave physics.
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 1e15;
const fmt = (value: number) => (Object.is(value, -0) ? 0 : value).toLocaleString("it-IT", {
  maximumSignificantDigits: 6, notation: Math.abs(value) > 0 && (Math.abs(value) < .001 || Math.abs(value) >= 1e6) ? "scientific" : "standard",
}).replace(/^-/, "−");

function valid(result: WaveResult): boolean {
  const p = result?.parameters;
  return result?.activityId === "harmonic-wave-v1" && result.version === 1 && Boolean(p)
    && [p.speed, p.frequency, p.amplitude, p.phase, p.time, result.wavelengthM, result.periodS, result.probeDisplacementM].every(finite)
    && p.speed > 0 && p.frequency > 0 && p.amplitude >= 0 && p.time >= 0 && result.wavelengthM > 0 && result.periodS > 0
    && Array.isArray(result.spatialSamples) && result.spatialSamples.length >= 2 && result.spatialSamples.length <= 257
    && result.spatialSamples.every(s => s && finite(s.xM) && finite(s.displacementM))
    && Array.isArray(result.temporalSamples) && result.temporalSamples.length >= 2 && result.temporalSamples.length <= 257
    && result.temporalSamples.every(s => s && finite(s.timeS) && finite(s.displacementM));
}

/** Two views of supplied Core samples; no wave equation, timer or sound synthesis here. */
export function ScientificWaveModel({result}: {result: WaveResult | null}) {
  if (result === null) return <figure className="scientific-model"><p>Formula una previsione: profilo e punto nel tempo compaiono dopo il confronto.</p></figure>;
  if (!valid(result)) return <p role="status" className="scientific-model">Dati dell’onda non disponibili o versione non supportata. Conserva i parametri e riapri la risorsa verificata.</p>;
  const {parameters: p, spatialSamples, temporalSamples} = result;
  const maxY = Math.max(p.amplitude, ...spatialSamples.map(s => Math.abs(s.displacementM)), ...temporalSamples.map(s => Math.abs(s.displacementM))) || 1;
  const y = (value: number) => 130 - value / maxY * 80;
  const xMin = Math.min(...spatialSamples.map(s => s.xM));
  const xMax = Math.max(...spatialSamples.map(s => s.xM));
  const tMin = Math.min(...temporalSamples.map(s => s.timeS));
  const tMax = Math.max(...temporalSamples.map(s => s.timeS));
  const x = (value: number) => 70 + (value - xMin) / (xMax - xMin || 1) * 360;
  const t = (value: number) => 70 + (value - tMin) / (tMax - tMin || 1) * 360;
  return <figure className="scientific-model scientific-wave">
    <dl className="scientific-readings">
      <div><dt>Lunghezza d’onda λ</dt><dd>{fmt(result.wavelengthM)} m</dd></div>
      <div><dt>Periodo T</dt><dd>{fmt(result.periodS)} s</dd></div>
      <div><dt>Spostamento a x = 0</dt><dd>{fmt(result.probeDisplacementM)} m</dd></div>
    </dl>
    <p>Propagazione verso +x a {fmt(p.speed)} m/s. Frequenza {fmt(p.frequency)} Hz. I punti del mezzo oscillano: non viaggiano con il profilo.</p>
    {p.amplitude === 0 && <p>Ampiezza nulla: il mezzo non si sposta; λ e T descrivono i parametri impostati, non creste osservabili.</p>}
    <svg viewBox="0 0 480 280" role="img" aria-label={`Profilo spaziale al tempo ${fmt(p.time)} s. Asse orizzontale posizione in metri, asse verticale spostamento in metri.`}>
      <path d="M70 28V225M70 130H445" fill="none" stroke="currentColor" />
      <polyline data-testid="wave-spatial-curve" points={spatialSamples.map(s => `${x(s.xM)},${y(s.displacementM)}`).join(" ")} fill="none" stroke="var(--accent-text, currentColor)" strokeWidth="3" />
      <circle cx={x(spatialSamples[0].xM)} cy={y(spatialSamples[0].displacementM)} r="5" fill="currentColor" />
      <text x="5" y="23">y [m]</text><text x="5" y="52">{fmt(p.amplitude)}</text><text x="5" y="215">{fmt(-p.amplitude)}</text>
      <text x="70" y="244">{fmt(xMin)}</text><text x="395" y="244">{fmt(xMax)}</text><text x="180" y="270">Posizione x [m]</text>
    </svg>
    <svg viewBox="0 0 480 280" role="img" aria-label="Spostamento del punto x uguale zero nel tempo. Asse orizzontale tempo in secondi, asse verticale spostamento in metri.">
      <path d="M70 28V225M70 130H445" fill="none" stroke="currentColor" />
      <polyline data-testid="wave-temporal-curve" points={temporalSamples.map(s => `${t(s.timeS)},${y(s.displacementM)}`).join(" ")} fill="none" stroke="var(--accent-text, currentColor)" strokeWidth="3" />
      <circle cx={t(temporalSamples[0].timeS)} cy={y(temporalSamples[0].displacementM)} r="5" fill="currentColor" />
      <text x="5" y="23">y [m]</text><text x="5" y="52">{fmt(p.amplitude)}</text><text x="5" y="215">{fmt(-p.amplitude)}</text>
      <text x="70" y="244">{fmt(tMin)}</text><text x="395" y="244">{fmt(tMax)}</text><text x="190" y="270">Tempo t [s]</text>
    </svg>
    <details><summary>Valori del profilo e del punto</summary>
      <div className="scientific-table-wrap"><table aria-label="Campioni spaziali dell’onda"><thead><tr><th scope="col">Posizione x [m]</th><th scope="col">Spostamento y [m]</th></tr></thead>
        <tbody>{spatialSamples.map((s, i) => <tr key={i}><td>{fmt(s.xM)}</td><td>{fmt(s.displacementM)}</td></tr>)}</tbody></table></div>
      <div className="scientific-table-wrap"><table aria-label="Campioni temporali del punto x uguale zero"><thead><tr><th scope="col">Tempo t [s]</th><th scope="col">Spostamento y [m]</th></tr></thead>
        <tbody>{temporalSamples.map((s, i) => <tr key={i}><td>{fmt(s.timeS)}</td><td>{fmt(s.displacementM)}</td></tr>)}</tbody></table></div>
    </details>
    <figcaption>Due rappresentazioni della stessa onda ideale: fotografia nello spazio e oscillazione di un punto. Il tempo è impostato nei parametri, senza riproduzione automatica. Il disegno trasversale non simula compressioni sonore né produce suono.</figcaption>
  </figure>;
}
