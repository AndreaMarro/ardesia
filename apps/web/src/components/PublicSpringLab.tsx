import {useRef, useState} from "react";
import {publicSpring, publicSpringCase, publicSpringGraph} from "../publicPreview";
import {readPublicDraft} from "../publicDraft";
import {PublicDraftControls} from "./PublicDraftControls";
import {PublicSpringModel, springFormat} from "./PublicSpringModel";

export function PublicSpringLab() {
  const [saved] = useState(() => readPublicDraft("spring"));
  const [force, setForce] = useState(saved?.force ?? 4), [stiffness, setStiffness] = useState(saved?.stiffness ?? 20);
  const [prediction, setPrediction] = useState(saved?.prediction ?? "");
  const [revealed, setRevealed] = useState(false), [hint, setHint] = useState(0), [transfer, setTransfer] = useState(saved?.transfer ?? false);
  const input = useRef<HTMLInputElement>(null);
  const selected = publicSpringCase(force, stiffness);
  const numeric = Number(prediction.replace(",", "."));
  const valid = prediction.trim() !== "" && Number.isFinite(numeric) && numeric >= 0;
  const result = revealed ? selected.result : null;
  function change(update: () => void) {update(); setRevealed(false); setPrediction(""); setHint(0); setTransfer(false);}
  function retry() {setRevealed(false); setPrediction(""); setHint(0); input.current?.focus();}
  return <section className="physics-lab public-spring-lab" aria-labelledby="spring-title">
    <div className="lab-introduction"><p className="section-meta">Fisica · forze ed equilibrio</p><h2 id="spring-title">Quanto si allunga la molla?</h2>
      <p>{transfer ? `Nuova prova: forza di ${springFormat(force)} N e rigidità ${springFormat(stiffness)} N/m. Le due grandezze sono cambiate: prevedi l’allungamento prima di confrontarlo.` : "Tiri lentamente una molla ideale. Prevedi quanto si allunga, poi confronta molle di diversa rigidità."}</p>
    </div>
    <div className="lab-layout"><div className="lab-experiment">
      <div className="lab-caption"><span>Trazione lungo l’asse</span><span>Equilibrio statico</span></div>
      <PublicSpringModel force={force} result={result} maxExtension={publicSpring.maxExtension} points={publicSpringGraph(stiffness)} />
      <div className="lab-result" aria-live="polite">{result ? <>
        <span>{result.calculatedVariable}</span><strong data-testid="spring-result">{springFormat(result.value)} m</strong>
        <p data-testid="spring-energy">Energia elastica: {springFormat(result.elasticEnergyJ)} J</p>
        <p>{Math.abs(numeric - result.value) <= Math.max(1e-8, Math.abs(result.value) * 1e-6) ? "La previsione coincide con il valore del modello. Spiega che cosa cambia quando aumenta la rigidità." : "La previsione differisce dal modello. Conserva il ragionamento: controlla le unità e distingui la forza dalla rigidità."}</p>
      </> : <><span>Prima la tua previsione.</span><p>Allungamento, energia e grafico compaiono dopo il confronto.</p></>}</div>
    </div><form className="lab-controls" onSubmit={event => {event.preventDefault(); if (valid) setRevealed(true);}}>
      <label>Forza applicata<input aria-label="Forza applicata" type="range" min={publicSpring.force.min} max={publicSpring.force.max} step={publicSpring.force.step} value={force} onChange={event => change(() => setForce(Number(event.target.value)))} /><span>{springFormat(force)} N</span></label>
      <label>Rigidità della molla<select value={stiffness} onChange={event => change(() => setStiffness(Number(event.target.value)))}>{publicSpring.stiffnesses.map(value => <option key={value} value={value}>{value} N/m</option>)}</select></label>
      <p>Forza: 0–10 N. Rigidità: 20, 40 o 80 N/m. Intervallo della demo: allungamento 0–0,5 m.</p>
      <label>Allungamento previsto in m<input ref={input} inputMode="decimal" maxLength={40} value={prediction} onChange={event => {setPrediction(event.target.value); setRevealed(false);}} /></label>
      <button className="button-primary" disabled={!valid}>Confronta l’allungamento</button>
      <button type="button" onClick={() => {if (hint < 2) setHint(value => value + 1);}} aria-disabled={hint === 2}>{hint === 0 ? "Un indizio sulla molla" : "Un altro indizio"}</button>
      {hint > 0 && <p>A parità di molla, una forza maggiore produce un allungamento maggiore. Quale grandezza descrive quanto è difficile allungarla?</p>}
      {hint > 1 && <p>In equilibrio F = kx. Isola x e controlla le unità: N diviso N/m dà metri. L’energia accumulata è U = kx²/2. Una previsione dopo questi indizi è assistita.</p>}
      {result && <>
        <button type="button" onClick={retry}>Riprova con questa molla</button>
        <button type="button" onClick={() => {retry(); setForce(stiffness === 80 ? 2 : 6); setStiffness(stiffness === 80 ? 40 : 80); setTransfer(true);}}>Una molla diversa: nuova prova</button>
      </>}
      <PublicDraftControls model="spring" data={{force, stiffness, prediction, transfer}} />
      <details><summary>Ipotesi, provenienza e limiti</summary><p>{selected.result.domain}</p><p>Scenario originale DEMO. 63 configurazioni verificate numericamente nel Core, senza formule del modello nel browser. Il controllo numerico è separato dall’approvazione editoriale umana. Non misura la padronanza del tema e non copre un corso completo.</p></details>
    </form></div>
  </section>;
}
