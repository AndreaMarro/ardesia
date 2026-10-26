import {useEffect,useRef,useState} from 'react';
import {describeError,requestKey,type StudyMe} from '../../api';
import {scienceApi} from './scienceApi';
import {ScientificPlot} from './ScientificPlot';
import {checkResult} from './validateResult';
import {scienceResourceHref} from './resourceNavigation';
import type {Capability,Catalog,Parameters,ResourceRef,SavedScience,ScienceApi,ScienceResult,Snapshot} from './types';
import './science-library.css';

export type ScienceLibraryProps={me:StudyMe;editionId:string;api?:ScienceApi;resourceRef?:ResourceRef;
  onResourceSaved?:(ref:ResourceRef)=>void;context?:'course'|'notebook'};
type Draft={values:Record<string,string>;prediction:string;note:string;supportUsed?:('explanation'|'domain')[];
  ref:ResourceRef|null;readonly:boolean;unsupported:boolean};
type PendingSave={snapshot:Snapshot;ref:ResourceRef|null;key:string;capabilityId:string;edit:number};

export const formatScienceNumber=(n:number)=>n!==0&&(Math.abs(n)<.0001||Math.abs(n)>=1e6)
  ?n.toExponential(4).replace('.',','):n.toLocaleString('it-IT',{maximumSignificantDigits:6,useGrouping:false});
const valuesOf=(p:Parameters)=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,String(v)]));
const initialDraft=(c:Capability):Draft=>({values:Object.fromEntries(c.parameters.map(p=>[p.key,String(p.default)])),prediction:'',note:'',supportUsed:[],ref:null,readonly:false,unsupported:false});
const refOf=(s:SavedScience):ResourceRef=>({resourceId:s.resource.id,revisionId:s.resource.revisionId});
function message(error:unknown){
  const code=error instanceof Error?error.message:'';
  return ({invalid_physical_domain:'Questi dati sono fuori dal dominio del modello. Controlla valori e unità.',
    bodies_not_approaching:'Il corpo1 deve avvicinarsi al corpo2: controlla segni e velocità iniziali.',
    outside_paraxial_domain:'La configurazione esce dall’approssimazione paraassiale dichiarata.',
    near_focal_plane:'La configurazione è troppo vicina al piano focale per questo confronto numerico.',
    singular_or_excluded_position:'La sonda deve restare ad almeno 0,01 m dalla sorgente.',
    capability_version_unavailable:'Questa versione dello strumento non è disponibile.',
    invalid_science_snapshot:'La configurazione salvata non è compatibile. La revisione originale resta conservata.',
    incompatible_science_result:'Il risultato ricevuto non corrisponde alla configurazione aperta.',
    invalid_science_context:'La risorsa non corrisponde al contesto aperto.',
  } as Record<string,string>)[code]||describeError(error,'La rete o il servizio non rispondono. Il testo aperto resta qui; puoi riprovare.');
}
export function ScienceLibrary(props:ScienceLibraryProps){
  const key=JSON.stringify([props.me.id,props.me.role,props.editionId,props.resourceRef?.resourceId,props.resourceRef?.revisionId]);
  return <ScienceWorkspace key={key} {...props}/>;
}

function ScienceWorkspace({me,editionId,api=scienceApi,resourceRef,onResourceSaved,context='course'}:ScienceLibraryProps){
  const [catalog,setCatalog]=useState<Catalog|null>(null),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
  const [reload,setReload]=useState(0),[course,setCourse]=useState(''),[selected,setSelected]=useState('');
  const [drafts,setDrafts]=useState<Record<string,Draft>>({}),[result,setResult]=useState<ScienceResult|null>(null);
  const [comparing,setComparing]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [opened,setOpened]=useState<string[]>([]),[plotId,setPlotId]=useState('');
  const pending=useRef<PendingSave|null>(null),generation=useRef(0),edit=useRef(0),alive=useRef(true);
  const evaluateController=useRef<AbortController|null>(null),saveController=useRef<AbortController|null>(null);
  const predictionInput=useRef<HTMLInputElement>(null);
  const resultPanel=useRef<HTMLDivElement>(null),controls=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(result&&globalThis.matchMedia?.('(max-width:740px)').matches){
      resultPanel.current?.focus({preventScroll:true});
      resultPanel.current?.scrollIntoView?.({behavior:'instant',block:'center'});
    }
  },[result]);
  function editParameters(){
    const input=controls.current?.querySelector('input');
    input?.focus({preventScroll:true});input?.scrollIntoView?.({behavior:'instant',block:'center'});
  }
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;evaluateController.current?.abort();saveController.current?.abort();};},[]);
  useEffect(()=>{
    const controller=new AbortController();let active=true;setLoading(true);setLoadError('');
    void Promise.allSettled([api.catalog(editionId,controller.signal),resourceRef?api.read(resourceRef,controller.signal):Promise.resolve(null)]).then(([a,b])=>{
      if(!active)return;
      const data=a.status==='fulfilled'?a.value:null;
      if(resourceRef&&b.status==='rejected')throw b.reason;
      const saved=b.status==='fulfilled'?b.value:null;
      if(!data&&!saved)throw a.status==='rejected'?a.reason:new Error('catalog_unavailable');
      if(saved&&(saved.resource.editionId!==editionId||saved.resource.kind!=='science-resource'))throw new Error('invalid_science_context');
      const capability=saved?data?.capabilities.find(c=>c.id===saved.snapshot.capabilityId):data?.capabilities[0];
      const id=saved?.snapshot.capabilityId||capability?.id||'';
      setCatalog(data);setSelected(id);setCourse(data?.courses.find(c=>c.capabilityIds.includes(id))?.id||'');
      setDrafts(saved?{[id]:{values:valuesOf(saved.snapshot.parameters),note:saved.snapshot.note,prediction:saved.snapshot.prediction,
        supportUsed:saved.snapshot.supportUsed,ref:refOf(saved),readonly:saved.resource.ownerId!==me.id,
        unsupported:!saved.supported||!capability||capability.version!==saved.snapshot.capabilityVersion||capability.implementationSha256!==saved.snapshot.implementationSha256}}
        :capability?{[id]:initialDraft(capability)}:{});
      setResult(null);setOpened([]);setPlotId('');setLoading(false);
    }).catch(e=>{if(active){setLoadError(message(e));setLoading(false);}});
    return()=>{active=false;controller.abort();};
  },[api,editionId,resourceRef?.resourceId,resourceRef?.revisionId,reload,me.id]);
  const capability=catalog?.capabilities.find(c=>c.id===selected);
  const draft=drafts[selected];
  function invalidate(){generation.current++;evaluateController.current?.abort();setComparing(false);setResult(null);setError('');setNotice('');}
  function change(values:Partial<Draft>,clearResult=true){
    edit.current++;if(clearResult)invalidate();
    setDrafts(old=>({...old,[selected]:{...old[selected],...values}}));
  }
  function choose(id:string){
    const c=catalog?.capabilities.find(c=>c.id===id);if(!c)return;
    invalidate();edit.current++;setSelected(id);setOpened([]);setPlotId('');
    setDrafts(old=>old[id]?old:{...old,[id]:initialDraft(c)});
  }
  function parameters():Parameters|null{
    if(!draft||!capability)return null;
    const p:Parameters={};
    for(const field of capability.parameters){const value=draft.values[field.key];const n=Number(value);
      if(!value?.trim()||!Number.isFinite(n)||n<field.minimum||n>field.maximum)return null;p[field.key]=n;}
    return p;
  }
  function snapshot():Snapshot|null{
    const p=parameters();return capability&&draft&&p?{schemaVersion:1,capabilityId:capability.id,capabilityVersion:capability.version,
      implementationSha256:capability.implementationSha256,parameters:p,note:draft.note,prediction:draft.prediction,
      ...(draft.supportUsed!==undefined?{supportUsed:draft.supportUsed}:{})}:null;
  }
  async function compare(){
    if(!capability||!draft||!draft.prediction.trim()||draft.unsupported)return;
    const state=snapshot();if(!state)return;
    const current=++generation.current;evaluateController.current?.abort();const controller=new AbortController();evaluateController.current=controller;
    setComparing(true);setError('');setResult(null);
    try{const answer=await api.evaluate(editionId,state,controller.signal);
      if(alive.current&&current===generation.current&&!controller.signal.aborted){setResult(checkResult(answer,capability,state.parameters));setPlotId(answer.result.raySegments?'rays':answer.result.plots[0]?.id||'');}}
    catch(e){if(alive.current&&current===generation.current&&!controller.signal.aborted)setError(message(e));}
    finally{if(alive.current&&current===generation.current)setComparing(false);}
  }
  async function save(){
    if(saving||!draft||draft.readonly||draft.unsupported)return;
    if(!pending.current){const state=snapshot();if(!state)return;pending.current={snapshot:structuredClone(state),ref:draft.ref,key:requestKey(),capabilityId:selected,edit:edit.current};}
    const frozen=pending.current,controller=new AbortController();saveController.current=controller;setSaving(true);setError('');setNotice('');
    try{
      const response=await api.save(editionId,frozen.snapshot,frozen.key,frozen.ref,controller.signal);
      if(!alive.current||controller.signal.aborted)return;
      if(response.resource.ownerId!==me.id||response.resource.editionId!==editionId||response.snapshot.capabilityId!==frozen.capabilityId)throw new Error('invalid_science_context');
      const ref=refOf(response);setDrafts(old=>({...old,[frozen.capabilityId]:{...old[frozen.capabilityId],ref}}));pending.current=null;
      if(edit.current===frozen.edit){setNotice('Configurazione e ragionamento salvati nel tuo quaderno privato.');onResourceSaved?.(ref);}
      else setNotice('Salvata la versione in attesa. Le modifiche aperte sono ancora da salvare.');
    }catch(e){if(alive.current&&!controller.signal.aborted)setError(message(e));}
    finally{if(alive.current&&!controller.signal.aborted)setSaving(false);}
  }
  function openSupport(which:'explanation'|'domain'){
    if(!draft)return;setOpened(v=>v.includes(which)?v.filter(x=>x!==which):[...v,which]);
    if(!(draft.supportUsed||[]).includes(which))change({supportUsed:[...(draft.supportUsed||[]),which]},false);
  }
  function exactLink(ref:ResourceRef){return scienceResourceHref(editionId,ref);}
  if(loading)return <section className="science-library" aria-busy="true"><h2>Libreria scientifica</h2><p role="status">Apro strumenti e revisione…</p></section>;
  if(loadError)return <section className="science-library"><h2>Revisione non disponibile</h2><p role="alert">{loadError}</p><button onClick={()=>setReload(v=>v+1)}>Riprova il caricamento</button></section>;
  if(!draft||draft.unsupported||draft.readonly||!capability)return <section className="science-library"><h2>Quaderno scientifico · revisione conservata</h2>
    <p>{draft?.unsupported?'Questa versione dello strumento non è disponibile.':'Questa revisione è condivisa in sola lettura.'}</p>
    <label>Il tuo ragionamento<textarea aria-label="Il tuo ragionamento" readOnly rows={6} value={draft?.note||''}/></label>
    <p>I dati restano leggibili senza eseguire il modello. Nessuna soluzione viene ricostruita con un’altra versione.</p>
    {draft?.ref&&<a href={exactLink(draft.ref)}>Collegamento alla revisione esatta</a>}</section>;
  const valid=parameters()!==null;
  const available=catalog?.courses.find(c=>c.id===course)?.capabilityIds||[];
  return <section className="science-library" aria-label="Libreria scientifica">
    <header className="science-heading"><p className="science-eyebrow">{context==='notebook'?'Nel quaderno':'Nel percorso'} · strumenti in verifica privata</p><h2>Libreria scientifica</h2>
      <p>Prevedi, cambia una grandezza e confronta. Le configurazioni salvate restano nel tuo quaderno; il confronto non assegna un voto.</p></header>
    <div className="science-selection"><label>Percorso di studio<select value={course} onChange={e=>{setCourse(e.target.value);const ids=catalog?.courses.find(c=>c.id===e.target.value)?.capabilityIds||[];choose(ids.includes(selected)?selected:ids[0]);}}>
      {catalog?.courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
      <label>Oggetto scientifico<select value={selected} onChange={e=>choose(e.target.value)}>{catalog?.capabilities.filter(c=>available.includes(c.id)).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
    <article className="science-object"><div className="science-object-title"><p className="science-eyebrow">Esperimento ideale · DRAFT</p><h3>{capability.title}</h3><p>Prevedi: {capability.primaryOutput.label.toLocaleLowerCase('it')}, in {capability.primaryOutput.unit}. Usa i dati attualmente selezionati.</p></div>
      <div className="science-workspace"><div ref={controls} className="science-controls"><h4>Dati del sistema</h4><div className="science-parameters">{capability.parameters.map(field=><label key={field.key}>{field.label} [{field.unit}]<input type="number" step="any" min={field.minimum} max={field.maximum} value={draft.values[field.key]??''} onChange={e=>change({values:{...draft.values,[field.key]:e.target.value},prediction:''})}/></label>)}</div>
        {!valid&&<p className="science-input-note">Completa i valori negli intervalli indicati.</p>}
        <form onSubmit={e=>{e.preventDefault();void compare();}}><label>La tua previsione<input ref={predictionInput} inputMode="decimal" maxLength={200} value={draft.prediction} onChange={e=>change({prediction:e.target.value})}/></label><p>Unità: {capability.primaryOutput.unit}</p>
          <button className="button-primary" disabled={!valid||!draft.prediction.trim()||comparing}>{comparing?'Confronto in corso…':'Confronta la previsione'}</button></form>
        <button type="button" className="science-transfer" onClick={()=>{change({values:valuesOf({...Object.fromEntries(capability.parameters.map(p=>[p.key,p.default])),...capability.transfer}),prediction:''});predictionInput.current?.focus();}}>Un problema diverso</button>
      </div><div className="science-main">
        {result?<><div ref={resultPanel} tabIndex={-1} aria-label="Risultato del modello" className="science-result" data-testid="science-result"><span>Risultato del modello</span><strong>{formatScienceNumber(result.value)} {result.unit}</strong><p>La tua previsione: {draft.prediction}. Il confronto non è un voto.</p><button type="button" onClick={editParameters}>Modifica i dati</button></div>
          <nav className="science-views" aria-label="Rappresentazioni scientifiche">{result.raySegments&&<button type="button" aria-pressed={plotId==='rays'} onClick={()=>setPlotId('rays')}>Raggi e immagine</button>}
            {result.plots.map(p=><button key={p.id} type="button" aria-pressed={plotId===p.id} onClick={()=>setPlotId(p.id)}>{p.label}</button>)}</nav>
          <ScientificPlot result={result} plotId={plotId}/>
          <details className="science-values"><summary>Valori e unità del modello</summary><table><thead><tr><th>Grandezza</th><th>Valore</th><th>Unità</th></tr></thead><tbody>{result.observables.map(o=><tr key={o.key}><th>{o.label}</th><td>{formatScienceNumber(o.value)}</td><td>{o.unit}</td></tr>)}</tbody></table></details>
        </>:<div className="science-before"><svg viewBox="0 0 480 180" role="img" aria-label="Lo spazio per il confronto resta vuoto prima della previsione"><path d="M40 30V145H450" fill="none" stroke="currentColor"/><text x="65" y="55">Prima immagina. Poi confronta.</text></svg><p>Il risultato, i grafici e le misure compaiono dopo la tua previsione.</p></div>}
      </div></div>
      {error&&<p role="alert" className="science-error">{error}</p>}
      <section className="science-support" aria-label="Spiegazione e ipotesi"><button type="button" aria-expanded={opened.includes('explanation')} onClick={()=>openSupport('explanation')}>Mostra il ragionamento</button>
        {opened.includes('explanation')&&<div>{capability.explanation.map((p,i)=><p key={i}>{p}</p>)}</div>}
        <button type="button" aria-expanded={opened.includes('domain')} onClick={()=>openSupport('domain')}>Ipotesi e limiti</button>{opened.includes('domain')&&<p>{capability.domain}</p>}
        <p className="science-fine">{draft.supportUsed===undefined?'Gli aiuti della revisione precedente non erano registrati.':draft.supportUsed.length?'Hai aperto un aiuto in questa configurazione.':'Nessun aiuto aperto in questo laboratorio; non è una prova di autonomia.'}</p></section>
      <section className="science-notebook"><h4>Una traccia da ritrovare</h4><label>Il tuo ragionamento<textarea aria-label="Il tuo ragionamento" rows={5} maxLength={4000} value={draft.note} onChange={e=>change({note:e.target.value},false)}/></label>
        <p>Salva configurazione e testo nel tuo quaderno privato. Le modifiche restano aperte finché il salvataggio non viene confermato.</p>
        <button type="button" disabled={saving||(!pending.current&&!valid)} onClick={()=>void save()}>{saving?'Salvataggio in corso…':pending.current?'Riprova il salvataggio in attesa':'Salva nel quaderno'}</button>
        {notice&&<p role="status">{notice}</p>}{draft.ref&&<a href={exactLink(draft.ref)}>Collegamento alla revisione esatta</a>}</section>
      <details className="science-provenance"><summary>Versione e origine</summary><p>Definizione {capability.id}, versione {capability.version}. Modello originale Ardesia; grafico JSXGraph 1.14.0, licenza MIT. Questo oggetto non è ancora un plugin installabile.</p><p>Le viste di percorso riusano la definizione; permessi e revisioni delle risorse restano legati alla loro edizione.</p></details>
    </article>
  </section>;
}
