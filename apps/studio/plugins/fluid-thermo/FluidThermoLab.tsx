import { Component, lazy, Suspense, useId, useMemo, useRef, useState } from 'react';
import type {ReactNode} from 'react';
import { defaultParameters, getLab, labDefinitions } from './definitions';
import { evaluateLab } from './models';
import { LabDiagram } from './LabDiagram';
import { exportLabSnapshot, importLabSnapshot, newLabSnapshot, validateSnapshot } from './snapshot';
import type { LabConfiguration, LabId, LabInteraction, LabSnapshot } from './types';
import './fluid-thermo.css';

const Scene = lazy(()=>import('./LabScene3D').then(m=>({default:m.LabScene3D})));
const fmt=(n:number)=>n.toLocaleString('it-IT',{maximumSignificantDigits:6,useGrouping:false});
const choices:Record<string,string[]>={path:['Isoterma reversibile','Isobara reversibile','Isocora reversibile','Adiabatica reversibile','Libera espansione isolata'],topology:['Resistenze in serie','Resistenze in parallelo'],boundary:['Differenza di pressione fissata','Portata fissata'],surfaceMode:['Capillare','Goccia sferica · una interfaccia','Bolla saponosa · due interfacce']};
class SceneBoundary extends Component<{children:ReactNode;onUnavailable:()=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div role="alert"><p>Non è stato possibile caricare il renderer 3D. Dati, note e previsione sono conservati.</p><button type="button" onClick={this.props.onUnavailable}>Riprendi in 2D</button></div>:this.props.children;}
}
export type FluidThermoLabProps={configuration?:LabConfiguration;initialSnapshot?:unknown;
  onSnapshotChange?:(snapshot:LabSnapshot)=>void;onInteraction?:(event:LabInteraction)=>void;
  onSave?:(snapshot:LabSnapshot)=>Promise<void>;allowModelSelection?:boolean;authoringTools?:boolean;instanceKey?:string;readOnly?:boolean};

/** Host owns persistence and evidence. This component owns only the open draft. */
export function FluidThermoLab(props:FluidThermoLabProps){
  const initial=useMemo(()=>{
    try{
      if(props.readOnly&&props.initialSnapshot===undefined)throw Error('Snapshot registrato non disponibile.');
      return {snapshot:props.initialSnapshot===undefined?newLabSnapshot(props.configuration?.modelId,props.configuration):validateSnapshot(props.initialSnapshot)};
    }
    catch(error){return {error:error instanceof Error?error.message:'Configurazione non disponibile.'};}
  },[props.initialSnapshot,props.configuration,props.readOnly]);
  const emitted=useRef<string|null>(null),seen=useRef({fingerprint:'',revision:0});
  const fingerprint=initial.snapshot?JSON.stringify(initial.snapshot):'';
  if(seen.current.fingerprint!==fingerprint){
    if(seen.current.fingerprint&&fingerprint!==emitted.current)seen.current.revision++;
    seen.current.fingerprint=fingerprint;
  }
  if(!initial.snapshot)return <section className="fluid-thermo" aria-label="Laboratorio conservato"><h3>Configurazione non disponibile</h3><p role="alert">{initial.error}</p><p>Riapri la versione compatibile del plugin per riprendere questo scenario.</p></section>;
  // A seek replaces the exact recorded state and resets only local camera/view.
  // No authoring callback or mutable workspace crosses this boundary.
  if(props.readOnly)return <LabReadonlyView key={fingerprint} snapshot={initial.snapshot}/>;
  // Host echoes of our own snapshot must not remount controls or steal focus.
  // Set instanceKey to resourceId:revisionId when opening another Core revision.
  const identity=props.instanceKey??JSON.stringify([initial.snapshot.configuration.modelId,initial.snapshot.configuration.lessonRef,initial.snapshot.configuration.exerciseRef]);
  return <LabWorkspace key={identity+'#'+seen.current.revision} {...props} initial={initial.snapshot} onSnapshotChange={next=>{emitted.current=JSON.stringify(next);props.onSnapshotChange?.(next);}}/>;
}
function LabReadonlyView({snapshot}:{snapshot:LabSnapshot}){
  const [view,setView]=useState(snapshot.view);
  const definition=getLab(snapshot.configuration.modelId),parameters=snapshot.configuration.parameters;
  const result=useMemo(()=>evaluateLab(definition.id,parameters),[definition.id,parameters]);
  return <section className="fluid-thermo" aria-label="Laboratorio registrato · sola lettura" data-lab-id={definition.id}>
    <header className="ft-heading"><p className="ft-eyebrow">Laboratorio registrato · sola lettura</p><h3>{definition.title}</h3><p>{definition.objective}</p></header>
    <div className="ft-layout"><div className="ft-visual">
      <div className="ft-view-controls" role="group" aria-label="Rappresentazione del fenomeno">
        <button type="button" aria-pressed={view==='2d'} onClick={()=>setView('2d')}>Sezione e diagramma 2D</button>
        {definition.threeD&&<button type="button" aria-pressed={view==='3d'} onClick={()=>setView('3d')}>Esplora la geometria 3D</button>}
      </div>
      {view==='3d'?<SceneBoundary onUnavailable={()=>setView('2d')}><Suspense fallback={<p role="status">Preparo la scena. La sezione 2D resta disponibile.</p>}><Scene definition={definition} parameters={parameters} result={result} onUnavailable={()=>setView('2d')}/></Suspense></SceneBoundary>:<LabDiagram definition={definition} parameters={parameters} result={result} revealed/>}
      <div className="ft-observation"><span>Risultati ricalcolati dai parametri registrati</span><strong>{fmt(result.primary.value)} <small>{result.primary.unit}</small></strong><p>{result.primary.label}</p><p>Il confronto originale non è conservato nello snapshot. Questi risultati non attestano un confronto o una valutazione svolti durante la lezione.</p></div>
      {result.warnings.map(w=><p className="ft-warning" key={w}>{w}</p>)}
    </div><div className="ft-controls"><h4>Dati registrati del sistema</h4>
      <dl>{definition.parameters.map(field=><div className="ft-parameter" key={field.key}><dt>{field.label} [{field.unit}]</dt><dd aria-label={`${field.label} [${field.unit}]`}>{choices[field.key]?.[parameters[field.key]]??String(parameters[field.key])}</dd></div>)}</dl>
      <h4>Previsione registrata</h4><p style={{whiteSpace:'pre-wrap'}}>{snapshot.prediction||'Nessuna previsione registrata.'}</p>
      <h4>Osservazioni registrate</h4><p style={{whiteSpace:'pre-wrap'}}>{snapshot.note||'Nessuna osservazione registrata.'}</p>
      <p>Aiuti indicati nello snapshot: {snapshot.supportUsed.length?snapshot.supportUsed.map(kind=>kind==='model'?'modello':'suggerimento').join(', '):'nessuno indicato'}. Questo dato non attesta autonomia.</p>
    </div></div>
    <div className="ft-bottom"><details><summary>Modello, formula e intervalli di validità</summary><p className="ft-formula">{definition.formula}</p><ul>{definition.assumptions.map(a=><li key={a}>{a}</li>)}</ul><p>Modello analitico ideale. La geometria illustra lo stato; non calcola un campo CFD o una dinamica molecolare.</p></details>
      <details open className="ft-measurements"><summary>Misure ricalcolate</summary><table aria-label="Misure ricalcolate"><thead><tr><th>Grandezza</th><th>Valore</th><th>Unità</th></tr></thead><tbody>{result.measurements.map(m=><tr key={m.key}><th>{m.label}</th><td>{fmt(m.value)}</td><td>{m.unit}</td></tr>)}</tbody></table>
        {result.series.map((series,i)=><details key={i}><summary>{series.label}</summary><table><thead><tr><th>x [{series.xUnit}]</th><th>{series.label} [{series.unit}]</th></tr></thead><tbody>{series.points.map(([x,y],j)=><tr key={j}><td>{fmt(x)}</td><td>{fmt(y)}</td></tr>)}</tbody></table></details>)}
      </details>
    </div>
  </section>;
}
function LabWorkspace({initial,onSnapshotChange,onInteraction,onSave,allowModelSelection=false,authoringTools=false}:FluidThermoLabProps&{initial:LabSnapshot}){
  const [snapshot,setSnapshot]=useState(initial),[values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(Object.entries(initial.configuration.parameters).map(([k,v])=>[k,String(v)])));
  const [revealed,setRevealed]=useState(false),[json,setJson]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false);
  const edits=useRef(0);
  const baseline=useRef(structuredClone(initial.configuration));
  const [supports,setSupports]=useState({model:false,hint:false});
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
    setValues(Object.fromEntries(Object.entries(next.configuration.parameters).map(([k,v])=>[k,String(v)])));setRevealed(false);setSupports({model:false,hint:false});update(next,type);
  }
  function parameter(key:string,text:string){
    edits.current++;
    setValues(old=>({...old,[key]:text}));setRevealed(false);setSaved(false);setError('');
    const candidate={...values,[key]:text};
    if(definition.id==='process'&&((key==='path'&&Number(text)===2)||(key==='volume1'&&Number(candidate.path)===2))){candidate.volume2=candidate.volume1;setValues({...candidate});}
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
    {allowModelSelection&&<label className="ft-selector">Esperienza<select aria-label="Esperienza" value={definition.id} onChange={e=>apply(newLabSnapshot(e.target.value as LabId),'reset')}>{labDefinitions.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label>}
    <div className="ft-layout"><div className="ft-visual">
      <div className="ft-view-controls" role="group" aria-label="Rappresentazione del fenomeno"><button type="button" aria-pressed={snapshot.view==='2d'} onClick={()=>update({...snapshot,view:'2d'},'parameters')}>Sezione e diagramma 2D</button>
        {definition.threeD&&<button type="button" aria-pressed={snapshot.view==='3d'} onClick={()=>update({...snapshot,view:'3d'},'parameters')}>Esplora la geometria 3D</button>}</div>
      {current.result&&current.parameters?<>
        {snapshot.view==='3d'?<SceneBoundary key={definition.id} onUnavailable={()=>update({...snapshot,view:'2d'},'parameters')}><Suspense fallback={<p role="status">Preparo la scena. La sezione 2D resta disponibile.</p>}><Scene definition={definition} parameters={current.parameters} result={current.result} onUnavailable={()=>update({...snapshot,view:'2d'},'parameters')}/></Suspense></SceneBoundary>:<LabDiagram definition={definition} parameters={current.parameters} result={current.result} revealed={revealed}/>}
        <div className="ft-observation"><span>{revealed?'Confronto con il modello':'Osserva e formula una previsione'}</span>{revealed?<><strong>{fmt(current.result.primary.value)} <small>{current.result.primary.unit}</small></strong><p>{current.result.primary.label}. La tua previsione: {snapshot.prediction}.</p><p>Il confronto numerico non assegna un voto. {snapshot.supportUsed.length?'Hai consultato un aiuto: questa prova è assistita.':'Nessun aiuto richiesto in questa configurazione.'}</p></>:<p>{definition.prediction}</p>}</div>
      </>:<div className="ft-invalid" role="alert">{current.error}<p>Correggi il valore per riprendere il confronto.</p></div>}
      {revealed&&current.result?.warnings.map(w=><p className="ft-warning" key={w}>{w}</p>)}
    </div><div className="ft-controls"><h4>Dati del sistema</h4>
      {definition.parameters.map(field=>{const inactive=definition.id==='process'&&((field.key==='volume2'&&Number(values.path)===2)||(field.key==='temperature2K'&&Number(values.path)!==2));
        return <div className={'ft-parameter'+(choices[field.key]?' ft-choice':'')} key={field.key}><label htmlFor={instance+'-'+field.key}>{field.label} <span>[{field.unit}]</span></label>
        {choices[field.key]?<select id={instance+'-'+field.key} value={values[field.key]} onChange={e=>parameter(field.key,e.target.value)}>{choices[field.key].map((label,i)=><option value={i} key={i}>{label}</option>)}</select>:<><input id={instance+'-'+field.key} type="number" disabled={inactive} min={field.min} max={field.max} step="any" value={values[field.key]??''} onChange={e=>parameter(field.key,e.target.value)}/>
        <input type="range" disabled={inactive} aria-label={field.label+' · cursore'} min={field.min} max={field.max} step={field.step} value={Number(values[field.key])||field.min} onChange={e=>parameter(field.key,e.target.value)}/></>}</div>;})}
      <label>Scenario riproducibile<select value="" onChange={e=>{const preset=definition.presets.find(p=>p.id===e.target.value);if(preset)apply({...snapshot,configuration:{...snapshot.configuration,parameters:{...defaultParameters(definition.id),...preset.parameters}},prediction:'',supportUsed:[]},'preset');}}><option value="">Scegli un confronto…</option>{definition.presets.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
      <form onSubmit={e=>{e.preventDefault();if(current.result&&snapshot.prediction.trim()){setRevealed(true);update(snapshot,'compare');}}}>
        <label>La tua previsione<input maxLength={200} value={snapshot.prediction} onChange={e=>{setRevealed(false);update({...snapshot,prediction:e.target.value},'prediction');}} placeholder="Che cosa cambierà? In quale direzione?"/></label>
        <button className="button-primary" disabled={!current.result||!snapshot.prediction.trim()}>Confronta con il modello</button>
      </form><button type="button" onClick={()=>apply({...newLabSnapshot(definition.id,baseline.current.modelId===definition.id?baseline.current:undefined)},'reset')}>Ripristina lo scenario</button>
    </div></div>
    <div className="ft-bottom"><details open={supports.model} onToggle={e=>{const open=e.currentTarget.open;setSupports(s=>({...s,model:open}));if(open)support('model');}}><summary>Modello, formula e intervalli di validità</summary><p className="ft-formula">{definition.formula}</p><ul>{definition.assumptions.map(a=><li key={a}>{a}</li>)}</ul><p>Modello analitico ideale. La geometria illustra lo stato; non calcola un campo CFD o una dinamica molecolare.</p></details>
      <details open={supports.hint} onToggle={e=>{const open=e.currentTarget.open;setSupports(s=>({...s,hint:open}));if(open)support('hint');}}><summary>Un aiuto per ragionare</summary><p>Individua le grandezze fissate. Cambia un solo parametro, prevedi il segno o il rapporto e controlla le unità nella formula. Confronta poi un preset diverso.</p></details>
      {revealed&&current.result&&<details open className="ft-measurements"><summary>Misure e dati equivalenti</summary><table><thead><tr><th>Grandezza</th><th>Valore</th><th>Unità</th></tr></thead><tbody>{current.result.measurements.map(m=><tr key={m.key}><th>{m.label}</th><td>{fmt(m.value)}</td><td>{m.unit}</td></tr>)}</tbody></table>{current.result.series.map((series,i)=><details key={i}><summary>{series.label}</summary><table><thead><tr><th>x [{series.xUnit}]</th><th>{series.label} [{series.unit}]</th></tr></thead><tbody>{series.points.map(([x,y],j)=><tr key={j}><td>{fmt(x)}</td><td>{fmt(y)}</td></tr>)}</tbody></table></details>)}</details>}
      <label>Osservazioni<textarea rows={3} maxLength={4000} value={snapshot.note} onChange={e=>update({...snapshot,note:e.target.value},'parameters')}/></label>
      {onSave&&<button type="button" disabled={saving||!current.result} onClick={()=>void save()}>{saving?'Salvataggio in corso…':'Salva la configurazione nel corso'}</button>}{saved&&<p role="status">Configurazione salvata.</p>}
      {authoringTools&&<details><summary>Configura, esporta e riapri lo scenario</summary><p>Il docente può variare dati e preset e riutilizzare questa configurazione versionata in un’altra lezione. L’esportazione conserva previsioni, note e riferimenti; non equivale a una consegna Core.</p>
        <button type="button" disabled={!current.result} onClick={()=>setJson(exportLabSnapshot(snapshot))}>Prepara lo snapshot JSON</button><label>Configurazione JSON<textarea rows={6} maxLength={20000} value={json} onChange={e=>setJson(e.target.value)}/></label><button type="button" onClick={()=>{try{apply(importLabSnapshot(json),'reset');}catch(e){setError(e instanceof Error?e.message:'Il file non è valido.');}}}>Valida e riapri</button>
        <p>Plugin io.ardesia.fluid-thermo · 1.0.0 · Modello {definition.id} · 1. Nessuna migrazione implicita.</p>
      </details>}{error&&<p role="alert">{error}</p>}
    </div>
  </section>;
}
