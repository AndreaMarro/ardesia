export type SpringPoint = {force: number; extension: number};
export type SpringResult = {value: number; elasticEnergyJ: number};
export const springFormat = (value: number) => value.toLocaleString("it-IT", {maximumFractionDigits: 6});

/** Only geometric scaling of supplied Core values; no spring law is evaluated here. */
export function PublicSpringModel({force, maxExtension, result, points}: {
  force: number; maxExtension: number; result: SpringResult | null; points: SpringPoint[];
}) {
  const extensionPixels = result ? result.value / maxExtension * 190 : 0;
  const end = 230 + extensionPixels;
  const coils = Array.from({length: 19}, (_, index) => `${90 + (end - 90) * index / 18},${index === 0 || index === 18 ? 110 : index % 2 ? 90 : 130}`).join(" ");
  const maxForce = Math.max(...points.map(point => point.force), 1);
  return <figure className="public-spring-model">
    <svg viewBox="0 0 480 225" role="img" aria-label={result ? `Molla in equilibrio, allungamento ${springFormat(result.value)} metri. Schema, non misura di una molla reale.` : "Molla alla lunghezza a riposo. La posizione in equilibrio compare dopo la previsione."}>
      <path d="M55 55V155M40 60L55 75M40 80L55 95M40 100L55 115M40 120L55 135M40 140L55 155M55 110H90" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M230 45V165" fill="none" stroke="currentColor" strokeDasharray="4 5" opacity=".55" />
      <polyline points={coils} fill="none" stroke="var(--accent-text)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx={end} cy="110" r="5" fill="var(--accent-text)" />
      {result && result.value > 0 && <>
        <path d={`M${end} 110H${Math.min(end + 35, 465)}l-8 -6m8 6l-8 6`} fill="none" stroke="var(--accent-text)" strokeWidth="2" />
        <path d={`M230 175H${end}M230 168V182M${end} 168V182`} fill="none" stroke="currentColor" />
      </>}
      <text x="60" y="28">F applicata = {springFormat(force)} N</text>
      <text x="150" y="208">{result ? `x = ${springFormat(result.value)} m` : "Prima prevedi l’allungamento."}</text>
    </svg>
    {result && <svg viewBox="0 0 480 275" role="img" aria-label="Forza applicata in funzione dell’allungamento, valori del Core" data-testid="spring-graph">
      <path d="M70 30V215H445" fill="none" stroke="currentColor" />
      <polyline points={points.map(point => `${70 + point.extension / maxExtension * 350},${215 - point.force / maxForce * 165}`).join(" ")} fill="none" stroke="var(--accent-text)" strokeWidth="3" />
      {points.map(point => <circle key={point.force} cx={70 + point.extension / maxExtension * 350} cy={215 - point.force / maxForce * 165} r={point.force === force ? 6 : 2.5} fill="var(--accent-text)"><title>{springFormat(point.extension)} m: {springFormat(point.force)} N</title></circle>)}
      <text x="5" y="25">F [N]</text><text x="16" y="56">{springFormat(maxForce)}</text><text x="45" y="239">0</text>
      <text x="212" y="239">0,25</text><text x="400" y="239">0,5</text><text x="230" y="267">Allungamento x [m]</text>
    </svg>}
    <figcaption>{result ? "La linea tratteggiata indica la lunghezza a riposo. Il grafico usa solo risultati del motore scientifico: il punto grande è il caso scelto." : "Lo schema mostra il riferimento a riposo. Posizione finale, valore e grafico restano nascosti fino al confronto."} Il disegno non rappresenta oscillazioni.</figcaption>
  </figure>;
}
