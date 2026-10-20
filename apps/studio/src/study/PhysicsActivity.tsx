import { useEffect, useRef, useState } from 'react'
import { studyRequest } from './apiClient'
type ActivityResult={ratio:number;fixedQuantity:string;calculatedVariable:string;domain:string;editorialStatus:string}
export function PhysicsActivity(){
  const [boundary,setBoundary]=useState('pressure')
  const [ratio,setRatio]=useState(1)
  const [prediction,setPrediction]=useState('')
  const [result,setResult]=useState<ActivityResult|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const sequence=useRef(0)
  useEffect(()=>{
    const current=++sequence.current
    setBusy(true);setError('');setResult(null)
    studyRequest<ActivityResult>('/activities/evaluate',{activityId:'poiseuille-v1',parameters:{radiusRatio:ratio,boundary}})
      .then(value=>{if(current===sequence.current)setResult(value)})
      .catch(()=>{if(current===sequence.current)setError('Calcolo non disponibile. Riprova tra poco.')})
      .finally(()=>{if(current===sequence.current)setBusy(false)})
    return ()=>{sequence.current++}
  },[ratio,boundary])
  return <section className="study-lab" aria-labelledby="physics-title">
    <p className="study-eyebrow">Laboratorio originale · contenuto DRAFT</p>
    <h2 id="physics-title">Che cosa tieni fisso?</h2>
    <p>Un tubo si allarga. Prima di calcolare, prevedi che cosa cambia.</p>
    <label>La tua previsione<input value={prediction} onChange={event=>setPrediction(event.target.value)} placeholder="Descrivi il cambiamento atteso"/></label>
    <label>Grandezza fissata<select aria-label="Grandezza fissata" value={boundary} onChange={event=>{setBoundary(event.target.value);setPrediction('')}}>
      <option value="pressure">Differenza di pressione Δp fissa</option><option value="flow">Portata Q fissa</option></select></label>
    <label>Rapporto dei raggi r/r₀: {ratio.toLocaleString('it-IT')}<input aria-label="Rapporto dei raggi" type="range" min="0.5" max="2" step="0.05" value={ratio} onChange={event=>setRatio(Number(event.target.value))}/></label>
    <svg viewBox="0 0 500 100" aria-label={`Schema idealizzato del tubo, raggio relativo ${ratio}`} role="img"><path d="M20 30H480M20 70H480" stroke="#245d4b" strokeWidth={2}/><rect x="180" y={50-ratio*18} width="150" height={ratio*36} fill="#e1ece5" stroke="#245d4b"/><text x="250" y="55" textAnchor="middle" fill="#202422">r / r₀ = {ratio.toLocaleString('it-IT')}</text></svg>
    {error&&<p role="alert">{error}</p>}
    <div aria-live="polite" aria-busy={busy} className="study-result">{!busy&&result&&<><strong data-testid="physics-ratio">{result.calculatedVariable} = {result.ratio.toLocaleString('it-IT',{maximumFractionDigits:6})}</strong><p>{result.fixedQuantity==='pressure'?'Δp, viscosità e lunghezza sono fissate. Calcoliamo la portata.':'Q, viscosità e lunghezza sono fissate. Calcoliamo la differenza di pressione.'}</p></>}</div>
    <details><summary>Modello e limiti</summary><p>Q = π r⁴ Δp / (8 η L)</p><p>{result?.domain}</p><p>Controllo numerico deterministico. La revisione scientifica umana è prevista prima del pilot.</p></details>
  </section>
}
