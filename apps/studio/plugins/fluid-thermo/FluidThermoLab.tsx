import { lazy, Suspense, useId, useMemo, useRef, useState } from 'react';
import { defaultParameters, getLab, labDefinitions } from './definitions';
import { evaluateLab } from './models';
import { LabDiagram } from './LabDiagram';
import { exportLabSnapshot, importLabSnapshot, newLabSnapshot, validateSnapshot } from './snapshot';
import type { LabConfiguration, LabId, LabInteraction, LabSnapshot } from './types';
import './fluid-thermo.css';

const Scene = lazy(()=>import('./LabScene3D').then(m=>({default:m.LabScene3D})));
const fmt=(n:number)=>n.toLocaleString('it-IT',{maximumSignificantDigits:6,useGrouping:false});
export type FluidThermoLabProps={configuration?:LabConfiguration;initialSnapshot?:unknown;
  onSnapshotChange?:(snapshot:LabSnapshot)=>void;onInteraction?:(event:LabInteraction)=>void;
  onSave?:(snapshot:LabSnapshot)=>Promise<void>;allowModelSelection?:boolean;instanceKey?:string};

/** Host owns persistence and evidence. This component owns only the open draft. */
export function FluidThermoLab(props:FluidThermoLabProps){
  const initial=useMemo(()=>{
    try{return {snapshot:props.initialSnapshot===undefined?newLabSnapshot(props.configuration?.modelId,props.configuration):validateSnapshot(props.initialSnapshot)};}
    catch(error){return {error:error instanceof Error?error.message:'Configurazione non disponibile.'};}
  },[props.initialSnapshot,props.configuration]);
  if(!initial.snapshot)return <section className="fluid-thermo" aria-label="Laboratorio conservato"><h3>Configurazione non disponibile</h3><p role="alert">{initial.error}</p><p>Riapri la versione compatibile del plugin per riprendere questo scenario.</p></section>;
  // Host echoes of our own snapshot must not remount controls or steal focus.
  // Set instanceKey to resourceId:revisionId when opening another Core revision.
  const identity=props.instanceKey??JSON.stringify([initial.snapshot.configuration.modelId,initial.snapshot.configuration.lessonRef,initial.snapshot.configuration.exerciseRef]);
  return <LabWorkspace key={identity} {...props} initial={initial.snapshot}/>;
}
function LabWorkspace({initial,onSnapshotChange,onInteraction,onSave,allowModelSelection=false}:FluidThermoLabProps&{initial:LabSnapshot}){
  const [snapshot,setSnapshot]=useState(initial),[values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(Object.entries(initial.configuration.parameters).map(([k,v])=>[k,String(v)])));
  const [revealed,setRevealed]=useState(false),[json,setJson]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false);
  const edits=useRef(0);
  const instance=useId(),definition=getLab(snapshot.configuration.modelId);
  const current=useMemo(()=>{
    try{
      const parameters=Object.fromEntries(Object.entries(values).map(([k,v])=>{if(!v.trim())throw Error('Completa tutti i parametri.');return [k,Number(v)];}));
      return {parameters,result:evaluateLab(definition.id,parameters),error:''};
    }catch(e){return {parameters:null,result:null,error:e instanceof Error?e.message:'Dati fuori dal dominio.'};}
  },[values,definition.id]);
  function update(next:LabSnapshot,type:LabInteraction['type']){
    edits.current++;setSnapshot(next);setSaved(false);setError('');onSnapshotChange?.(next);
    onInteraction?.({type,modelId:next.configuration.modelId,parameters:{...next.configuration.parameters},prediction:next.prediction,supportUsed:[...next.supportUsed]});
  }
  function apply(next:LabSnapshot,type:LabInteraction['type']){
    setValues(Object.fromEntries(Object.entries(next.configuration.parameters).map(([k,v])=>[k,String(v)])));setRevealed(false);update(next,type);
  }
  function parameter(key:string,text:string){
    edits.current++;
    setValues(old=>({...old,[key]:text}));setRevealed(false);setSaved(false);setError('');
    const candidate={...values,[key]:text};
    try{
      if(Object.values(candidate).some(v=>!v.trim()))return;
      const parameters=Object.fromEntries(Object.entries(candidate).map(([k,v])=>[k,Number(v)]));
      evaluateLab(definition.id,parameters);
      update({...snapshot,configuration:{...snapshot.configuration,parameters}},'parameters');
    }catch{/* Invalid text stays visible; the last valid snapshot is retained. */}
  }
  function support(kind:'model'|'hint'){
    if(!snapshot.supportUsed.includes(kind))update({...snapshot,supportUsed:[...snapshot.supportUsed,kind]},'support');
  }
  async function save(){
    if(!onSave||saving||!current.parameters)return;
    setSaving(true);setError('');const frozen=structuredClone(snapshot),edit=edits.current;
    try{await onSave(frozen);if(edit===edits.current)setSaved(true);else setError('La versione precedente è stata salvata. Le modifiche aperte restano da salvare.');}catch{setError('Il salvataggio non è confermato. La configurazione aperta è ancora qui.');}
    finally{setSaving(false);}
  }
  return <section className="fluid-thermo" aria-labelledby={instance+'-title'} data-lab-id={definition.id}>
    <header className="ft-heading"><p className="ft-eyebrow">Laboratorio · Fluidi e termodinamica</p><h3 id={instance+'-title'}>{definition.title}</h3><p>{definition.objective}</p></header>
    {allowModelSelection&&<label className="ft-selector">Esperienza<select value={definition.id} onChange={e=>apply(newLabSnapshot(e.target.value as LabId),'reset')}>{labDefinitions.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label>}
    <div className="ft-layout"><div className="ft-visual">
      <div className="ft-view-controls" role="group" aria-label="Rappresentazione del fenomeno"><button type="button" aria-pressed={snapshot.view==='2d'} onClick={()=>update({...snapshot,view:'2d'},'parameters')}>Sezione e diagramma 2D</button>
        {definition.threeD&&<button type="button" aria-pressed={snapshot.view==='3d'} onClick={()=>update({...snapshot,view:'3d'},'parameters')}>Esplora la geometria 3D</button>}</div>
      {current.result&&current.parameters?<>
        {snapshot.view==='3d'?<Suspense fallback={<p role="status">Preparo la scena. La sezione 2D resta disponibile.</p>}><Scene definition={definition} parameters={current.parameters} result={current.result} onUnavailable={()=>update({...snapshot,view:'2d'},'parameters')}/></Suspense>:<LabDiagram definition={definition} parameters={current.parameters} result={current.result}/>}
        <div className="ft-observation"><span>{revealed?'Confronto con il modello':'Osserva e formula una previsione'}</span>{revealed?<><strong>{fmt(current.result.primary.value)} <small>{current.result.primary.unit}</small></strong><p>{current.result.primary.label}. La tua previsione: {snapshot.prediction}.</p><p>Il confronto numerico non assegna un voto. {snapshot.supportUsed.length?'Hai consultato un aiuto: questa prova è assistita.':'Nessun aiuto richiesto in questa configurazione.'}</p></>:<p>{definition.prediction}</p>}</div>
      </>:<div className="ft-invalid" role="alert">{current.error}<p>Correggi il valore per riprendere il confronto.</p></div>}
      {current.result?.warnings.map(w=><p className="ft-warning" key={w}>{w}</p>)}
    </div><div className="ft-controls"><h4>Dati del sistema</h4>
      {definition.parameters.map(field=><div className="ft-parameter" key={field.key}><label htmlFor={instance+'-'+field.key}>{field.label} <span>[{field.unit}]</span></label><input id={instance+'-'+field.key} type="number" min={field.min} max={field.max} step="any" value={values[field.key]??''} onChange={e=>parameter(field.key,e.target.value)}/>
        <input type="range" aria-label={field.label+' · cursore'} min={field.min} max={field.max} step={field.step} value={Number(values[field.key])||field.min} onChange={e=>parameter(field.key,e.target.value)}/></div>)}
      <label>Scenario riproducibile<select value="" onChange={e=>{const preset=definition.presets.find(p=>p.id===e.target.value);if(preset)apply({...snapshot,configuration:{...snapshot.configuration,parameters:{...defaultParameters(definition.id),...preset.parameters}},prediction:'',supportUsed:[]},'preset');}}><option value="">Scegli un confronto…</option>{definition.presets.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
      <form onSubmit={e=>{e.preventDefault();if(current.result&&snapshot.prediction.trim()){setRevealed(true);update(snapshot,'compare');}}}>
        <label>La tua previsione<input maxLength={200} value={snapshot.prediction} onChange={e=>{setRevealed(false);update({...snapshot,prediction:e.target.value},'prediction');}} placeholder="Che cosa cambierà? In quale direzione?"/></label>
        <button className="button-primary" disabled={!current.result||!snapshot.prediction.trim()}>Confronta con il modello</button>
      </form><button type="button" onClick={()=>apply({...newLabSnapshot(definition.id,initial.configuration.modelId===definition.id?initial.configuration:undefined)},'reset')}>Ripristina lo scenario</button>
    </div></div>
    <div className="ft-bottom"><details onToggle={e=>{if(e.currentTarget.open)support('model');}}><summary>Modello, formula e intervalli di validità</summary><p className="ft-formula">{definition.formula}</p><ul>{definition.assumptions.map(a=><li key={a}>{a}</li>)}</ul><p>Modello analitico ideale. La geometria illustra lo stato; non calcola un campo CFD o una dinamica molecolare.</p></details>
      <details onToggle={e=>{if(e.currentTarget.open)support('hint');}}><summary>Un aiuto per ragionare</summary><p>Individua le grandezze fissate. Cambia un solo parametro, prevedi il segno o il rapporto e controlla le unità nella formula. Confronta poi un preset diverso.</p></details>
      {revealed&&current.result&&<details open className="ft-measurements"><summary>Misure e dati equivalenti</summary><table><thead><tr><th>Grandezza</th><th>Valore</th><th>Unità</th></tr></thead><tbody>{current.result.measurements.map(m=><tr key={m.key}><th>{m.label}</th><td>{fmt(m.value)}</td><td>{m.unit}</td></tr>)}</tbody></table>{current.result.series.map((series,i)=><details key={i}><summary>{series.label}</summary><table><thead><tr><th>x [{series.xUnit}]</th><th>{series.label} [{series.unit}]</th></tr></thead><tbody>{series.points.map(([x,y],j)=><tr key={j}><td>{fmt(x)}</td><td>{fmt(y)}</td></tr>)}</tbody></table></details>)}</details>}
      <label>Osservazioni<textarea rows={3} maxLength={4000} value={snapshot.note} onChange={e=>update({...snapshot,note:e.target.value},'parameters')}/></label>
      {onSave&&<button type="button" disabled={saving||!current.result} onClick={()=>void save()}>{saving?'Salvataggio in corso…':'Salva la configurazione nel corso'}</button>}{saved&&<p role="status">Salvataggio confermato dall’host.</p>}
      <details><summary>Configura, esporta e riapri lo scenario</summary><p>Il docente può variare dati e preset e riutilizzare questa configurazione versionata in un’altra lezione. L’esportazione conserva previsioni, note e riferimenti; non equivale a una consegna Core.</p>
        <button type="button" disabled={!current.result} onClick={()=>setJson(exportLabSnapshot(snapshot))}>Prepara lo snapshot JSON</button><label>Configurazione JSON<textarea rows={6} maxLength={20000} value={json} onChange={e=>setJson(e.target.value)}/></label><button type="button" onClick={()=>{try{apply(importLabSnapshot(json),'reset');}catch(e){setError(e instanceof Error?e.message:'Il file non è valido.');}}}>Valida e riapri</button>
        <p>Plugin io.ardesia.fluid-thermo · 1.0.0 · Modello {definition.id} · 1. Nessuna migrazione implicita.</p>
      </details>{error&&<p role="alert">{error}</p>}
    </div>
  </section>;
}
