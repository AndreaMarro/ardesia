import { useId, type CSSProperties } from "react"
import { circuitInputNetlist, circuitInputValueUnit, type CircuitInputComponent, type CircuitInputKind, type CircuitInputModel } from "./circuitInputModel"

const field: CSSProperties = {font:"inherit",padding:6,border:"1px solid #aebdc8",borderRadius:6,width:"100%",boxSizing:"border-box",background:"white",color:"#202c38"}
const names: Record<CircuitInputKind,string> = {R:"Resistore",V:"Generatore di tensione",I:"Generatore di corrente",L:"Induttore",C:"Condensatore"}

/** Shared semantic editor: no host, solver, storage or recognition dependency. */
export function CircuitInputEditor({value,onChange,disabled=false}: {
  value: CircuitInputModel; onChange:(model:CircuitInputModel,netlist:string|null)=>void; disabled?:boolean
}) {
  const listId = useId()
  const nodes = [...new Set(value.components.flatMap(c => [c.from,c.to]).filter(Boolean))]
  const change = (next:CircuitInputModel) => {
    let netlist:string|null = null
    try {netlist = circuitInputNetlist(next)} catch { /* Incomplete draft stays editable. */ }
    onChange(next,netlist)
  }
  const patch = (index:number,part:Partial<CircuitInputComponent>) => change({...value,
    components:value.components.map((c,i)=>i===index ? {...c,...part} : c)})
  function add(kind:CircuitInputKind) {
    let n=1;while(value.components.some(c=>c.id===`${kind}${n}`)) n++
    change({...value,components:[...value.components,{id:`${kind}${n}`,kind,from:"",to:"",value:"",phase:""}]})
  }
  let issue = ""
  try {circuitInputNetlist(value)} catch (error) {issue = (error as Error).message}
  return <fieldset disabled={disabled} style={{border:0,padding:0,margin:"12px 0"}} aria-label="Interpretazione modificabile del circuito">
    <legend style={{fontWeight:700}}>Componenti e collegamenti</legend>
    <p>Ricostruisci ciò che leggi nella fonte. Due morsetti con lo stesso nome sono collegati; <strong>0</strong> indica la massa. Un incrocio nel disegno non basta a dichiarare un collegamento.</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <label>Regime<select aria-label="Regime del circuito" style={field} value={value.domain} onChange={e=>change({...value,domain:e.target.value as CircuitInputModel["domain"]})}><option value="dc">Continuo (DC)</option><option value="ac">Sinusoidale (AC)</option><option value="laplace">Laplace e stato iniziale</option></select></label>
      {value.domain === "ac" && <><label>Pulsazione (rad/s)<input aria-label="Pulsazione rad/s" style={field} value={value.omega} onChange={e=>change({...value,omega:e.target.value})}/></label>
        <label>Ampiezza<select aria-label="Convenzione ampiezza" style={field} value={value.amplitude} onChange={e=>change({...value,amplitude:e.target.value as CircuitInputModel["amplitude"]})}><option value="unspecified">Da chiarire</option><option value="rms">Valore efficace (RMS)</option><option value="peak">Valore di picco</option></select></label></>}
    </div>
    {value.domain === "laplace" && <p>Indica le sorgenti applicate da t = 0 e lo stato di ogni condensatore e induttore subito prima di t = 0. Il calcolo restituisce la trasformata in s; la funzione del tempo richiede un ulteriore passaggio.</p>}
    <datalist id={listId}>{[...new Set(["0",...nodes])].map(n=><option key={n} value={n}/>)}</datalist>
    {value.components.map((c,i)=><fieldset key={i} style={{border:"1px solid #d0d8df",borderRadius:8,margin:"10px 0",padding:10}}>
      <legend>{names[c.kind]} · {c.id || `componente ${i+1}`}</legend>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
        <label>Nome<input aria-label={`Nome componente ${i+1}`} style={field} value={c.id} onChange={e=>patch(i,{id:e.target.value})}/></label>
        <label>{value.domain === "laplace" && c.waveform === "impulse" ? "Area dell’impulso" : "Valore"} ({circuitInputValueUnit(c,value.domain)})<input aria-label={`Valore ${c.id}`} style={field} value={c.value} placeholder="Numero o frazione" onChange={e=>patch(i,{value:e.target.value})}/></label>
        <label>{c.kind === "V" ? "Morsetto +" : c.kind === "I" ? "Origine freccia" : "Primo morsetto"}<input aria-label={`Primo morsetto ${c.id}`} list={listId} style={field} value={c.from} onChange={e=>patch(i,{from:e.target.value})}/></label>
        <label>{c.kind === "V" ? "Morsetto −" : c.kind === "I" ? "Punta freccia" : "Secondo morsetto"}<input aria-label={`Secondo morsetto ${c.id}`} list={listId} style={field} value={c.to} onChange={e=>patch(i,{to:e.target.value})}/></label>
        {value.domain === "ac" && ["V","I"].includes(c.kind) && <label>Fase (gradi)<input aria-label={`Fase ${c.id}`} style={field} value={c.phase} placeholder="Multipla di 30" onChange={e=>patch(i,{phase:e.target.value})}/></label>}
        {value.domain === "laplace" && ["V","I"].includes(c.kind) && <label>Forma della sorgente<select aria-label={`Forma sorgente ${c.id}`} style={field} value={c.waveform ?? ""} onChange={e=>patch(i,{waveform:e.target.value as CircuitInputComponent["waveform"]})}><option value="">Scegli la forma</option><option value="step">Gradino da t = 0</option><option value="impulse">Impulso in t = 0 (area)</option></select></label>}
        {value.domain === "laplace" && ["C","L"].includes(c.kind) && <label>{c.kind === "C" ? "Tensione iniziale" : "Corrente iniziale"} a 0− ({c.kind === "C" ? "volt" : "ampere"})<input aria-label={`Stato iniziale ${c.id}`} style={field} value={c.initial ?? ""} placeholder="Dichiarare anche lo zero" onChange={e=>patch(i,{initial:e.target.value})}/></label>}
      </div>
      <button type="button" style={{marginTop:8}} onClick={()=>change({...value,components:value.components.filter((_,n)=>n!==i)})}>Rimuovi {c.id || `componente ${i+1}`}</button>
    </fieldset>)}
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(Object.keys(names) as CircuitInputKind[]).map(kind=><button key={kind} type="button" disabled={value.components.length>=64} onClick={()=>add(kind)}>Aggiungi {names[kind].toLowerCase()}</button>)}</div>
    <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
      <label>Domanda<select aria-label="Grandezza da trovare" style={field} value={value.request.quantity} onChange={e=>change({...value,request:{...value.request,quantity:e.target.value as CircuitInputModel["request"]["quantity"]}})}><option value="voltage">Tensione</option><option value="current">Corrente</option><option value="resistance">Resistenza tra due morsetti (DC)</option><option value="impedance">Impedenza tra due morsetti (AC)</option><option value="power">Potenza complessa assorbita (AC)</option></select></label>
      {["resistance","impedance"].includes(value.request.quantity) ? <>{(["from","to"] as const).map((key,i)=><label key={key}>{i===0 ? "Primo" : "Secondo"} morsetto della porta<select aria-label={`${i===0 ? "Primo" : "Secondo"} morsetto della porta`} style={field} value={value.request[key]} onChange={e=>change({...value,request:{...value.request,[key]:e.target.value}})}><option value="">Scegli un morsetto</option>{nodes.map(n=><option key={n} value={n}>{n}</option>)}</select></label>)}</> :
        <label>Componente richiesto<select aria-label="Componente della domanda" style={field} value={value.request.target} onChange={e=>change({...value,request:{...value.request,target:e.target.value}})}><option value="">Scegli un componente</option>{value.components.map((c,i)=><option key={i} value={c.id}>{c.id}</option>)}</select></label>}
    </div>
    {!!nodes.length && <details style={{marginTop:10}}><summary>Rivedi i collegamenti per nodo</summary>{nodes.map(n=><p key={n}><strong>{n === "0" ? "0 · massa" : n}</strong>: {value.components.flatMap(c=>[...(c.from===n ? [`${c.id}, primo morsetto`] : []),...(c.to===n ? [`${c.id}, secondo morsetto`] : [])]).join("; ")}</p>)}</details>}
    {issue && <p role="status">{issue}</p>}
    <p style={{fontSize:13}}>Tensione: primo morsetto meno secondo. Corrente: dal primo al secondo. Questa interpretazione resta una proposta fino alla tua revisione.</p>
  </fieldset>
}
