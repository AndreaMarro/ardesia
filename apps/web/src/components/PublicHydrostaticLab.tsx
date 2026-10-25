import {useRef, useState} from "react";
import {publicPreviewData} from "../generated/publicPreviewData";
import {HydrostaticModel, hydrostaticFormat} from "./HydrostaticModel";

export function PublicHydrostaticLab() {
  const [depth, setDepth] = useState(2), [density, setDensity] = useState(1000);
  const [reference, setReference] = useState("gauge");
  const [prediction, setPrediction] = useState("");
  const [revealed, setRevealed] = useState(false), [hint, setHint] = useState(0), [transfer, setTransfer] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const cases = publicPreviewData.hydrostatic.cases;
  const selected = cases.find(c => c.parameters.depth === depth && c.parameters.density === density && c.parameters.reference === reference);
  const numeric = Number(prediction.replace(",", "."));
  const valid = prediction.trim() !== "" && Number.isFinite(numeric) && numeric >= 0;
  const result = revealed && selected ? selected.result : null;
  const points = cases.filter(c => c.parameters.density === density && c.parameters.reference === reference).map(c => ({depth: c.parameters.depth, value: c.result.value}));
  function change(update: () => void) { update(); setRevealed(false); setPrediction(""); setTransfer(false); }
  return <section className="physics-lab hydrostatic-lab" aria-labelledby="hydrostatic-title">
    <div className="lab-introduction"><p className="section-meta">Fisica · liquidi in equilibrio</p><h2 id="hydrostatic-title">Da dove misuri la pressione?</h2>
      <p>{transfer ? `Nuova prova: liquido di densità ${hydrostaticFormat(density)} kg/m³, sonda a ${hydrostaticFormat(depth)} m. Prevedi la pressione ${reference === "gauge" ? "relativa alla superficie" : "assoluta"} e confronta i contributi con il caso precedente.` : "Una sonda sotto la superficie. Prevedi la pressione, poi cambia profondità, liquido e riferimento."}</p>
    </div>
    <div className="lab-layout"><div className="lab-experiment">
      <div className="lab-caption"><span>{reference === "gauge" ? "Pressione relativa alla superficie" : "Pressione assoluta"}</span><span>Liquido fermo</span></div>
      <HydrostaticModel depth={depth} result={result} points={points} />
      <div className="lab-result" aria-live="polite">{result ? <>
        <span>{result.calculatedVariable}</span><strong data-testid="hydrostatic-result">{hydrostaticFormat(result.value)} Pa</strong>
        <p>{Math.abs(numeric - result.value) <= Math.max(1e-6, Math.abs(result.value) * 1e-6) ? "La previsione coincide con il valore del modello. Controlla anche il ragionamento e lo zero scelto." : "La previsione differisce dal modello. Conserva il tuo ragionamento: controlla lo zero della pressione, le unità e il contributo della profondità."}</p>
      </> : <><span>Prima la tua previsione.</span><p>Il valore e il grafico restano nascosti fino al confronto.</p></>}</div>
    </div><form className="lab-controls" onSubmit={event => {event.preventDefault(); if (valid && selected) setRevealed(true);}}>
      <label>Profondità della sonda<input aria-label="Profondità della sonda" type="range" min="0" max="4" step="0.5" value={depth} onChange={e => change(() => setDepth(Number(e.target.value)))} /><span>{hydrostaticFormat(depth)} m</span></label>
      <label>Densità del liquido<select value={density} onChange={e => change(() => setDensity(Number(e.target.value)))}><option value="1000">1000 kg/m³</option><option value="800">800 kg/m³</option></select></label>
      <label>Riferimento della pressione<select value={reference} onChange={e => change(() => setReference(e.target.value))}><option value="gauge">Relativa alla superficie</option><option value="absolute">Assoluta</option></select></label>
      <p>Alla superficie: {hydrostaticFormat(publicPreviewData.hydrostatic.surfacePressure)} Pa. g = 9,81 m/s².</p>
      <label>Pressione prevista in Pa<input ref={input} inputMode="decimal" maxLength={40} value={prediction} onChange={e => {setPrediction(e.target.value); setRevealed(false);}} /></label>
      <button className="button-primary" disabled={!valid || !selected}>Confronta la pressione</button>
      <button type="button" onClick={() => {if (hint < 2) setHint(n => n + 1);}} aria-disabled={hint === 2}>{hint === 0 ? "Un indizio sul riferimento" : "Un altro indizio"}</button>
      {hint > 0 && <p>Qual è lo zero? La pressione relativa considera solo l’aumento sotto la superficie; quella assoluta comprende anche la pressione alla superficie.</p>}
      {hint > 1 && <p>Il contributo della profondità è ρgh. Per la pressione assoluta aggiungi la pressione alla superficie. Scrivi le unità prima di confrontare.</p>}
      {result && <button type="button" onClick={() => {const lighter = density === 1000; setDensity(lighter ? 800 : 1000); setDepth(lighter ? 3 : 1.5); setReference(lighter ? "gauge" : "absolute"); setPrediction(""); setRevealed(false); setHint(0); setTransfer(true); input.current?.focus();}}>Cambia fluido: una nuova prova</button>}
      <details><summary>Ipotesi, provenienza e limiti</summary><p>{selected?.result.domain}</p><p>36 configurazioni calcolate dal Core durante la build, senza formule del modello nel browser. La previsione resta in questa pagina: non è una consegna o una misura di autonomia. Il grafico mostra solo il riferimento selezionato. Revisione scientifica umana da completare.</p></details>
    </form></div>
  </section>;
}
