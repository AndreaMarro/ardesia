import {useEffect,useRef,useState} from 'react';
import {describeError,requestKey,studyRequest,StudyApiError,type StudyMe} from '../../api';
import type {Answer,DraftScope,StudyCatalog,StudyState} from './types';
import {clearOffline,eraseDraft,readDraft,readOffline,saveDraft,saveOffline} from './storage';
import './IndependentStudy.css';
import {subscribeStudySessionEnd,StudySessionChangedError} from '../../../../studio/src/study/sessionBoundary';
import {StudyModel} from './StudyModel';
import {modelLabels,phaseLabels as labels,parameterValue,supportLabel} from './modelLabels';
const endpoint='/independent-study';
const date=(n:number)=>new Date(n*1000).toLocaleString('it-IT',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'});

type Props={editionId:string;me:StudyMe;sessionVersion?:number};
export function IndependentStudy(props:Props){
 return props.me.role==='student'?<StudySession key={[props.me.id,props.editionId,props.sessionVersion??0].join(':')} {...props}/>:<p>Lo studio autonomo è disponibile nello spazio dello studente.</p>;
}
function StudySession({editionId,me}:Props){
 const [catalog,setCatalog]=useState<StudyCatalog|null>(null),[state,setState]=useState<StudyState|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [value,setValue]=useState(''),[reasoning,setReasoning]=useState(''),[diagnostic,setDiagnostic]=useState(''),[requestText,setRequestText]=useState('');
 const [offline,setOffline]=useState(false),[offlineSavedAt,setOfflineSavedAt]=useState<number|null>(null),[showFeedback,setShowFeedback]=useState(false),[denied,setDenied]=useState(false);
 const alive=useRef(true),working=useRef(false),generation=useRef(0);
 const pending=useRef<{id:string;revisionId:string;answer:Answer;key:string}|null>(null);
 const currentState=useRef<StudyState|null>(null);
 const scope=(s:StudyState):DraftScope=>({actor:me.id,edition:editionId,session:s.id,revision:s.revisionId,lesson:s.lessonRef.sha256,phase:s.phase});
 function adopt(next:StudyState,restoreDraft=false){
  if(next.editionId!==editionId)throw Error('course_response_mismatch');
  const previous=currentState.current;
  if(previous?.id!==next.id||previous.phase!==next.phase||previous.cycle!==next.cycle){setValue('');setReasoning('');setShowFeedback(false);}
  currentState.current=next;setState(next);
  if(restoreDraft){const draft=readDraft(scope(next));if(draft){setValue(draft.value);setReasoning(draft.reasoning);setMessage('Bozza recuperata dal dispositivo. Non è ancora una consegna.');}}
  setDiagnostic(next.diagnostic||'');setOffline(false);setOfflineSavedAt(null);
 }
 function handleFailure(e:unknown){
  if(e instanceof StudySessionChangedError||e instanceof StudyApiError&&[401,403,404].includes(e.status)){
   generation.current++;currentState.current=null;
   clearOffline(me.id,editionId);setState(null);setCatalog(null);setValue('');setReasoning('');pending.current=null;setDenied(true);
   setError(e instanceof StudySessionChangedError||e.status===401?'La sessione è scaduta o revocata. Accedi di nuovo.':'L’accesso al percorso non è più disponibile.');
  }else if(e instanceof StudyApiError&&e.message==='study_scheduler_unavailable'){setError('Il piano usa una versione del calendario che questa applicazione non può leggere. Serve un aggiornamento compatibile; la cronologia Core è conservata.');}
  else if(e instanceof StudyApiError&&e.message==='study_clock_regressed'){setError('L’orario del servizio precede l’ultimo ripasso registrato. Attendi il ripristino dell’orario del servizio: nessuna nuova autovalutazione è stata salvata.');}
  else if(e instanceof StudyApiError&&e.status===409){setError('Operazione non applicabile alla revisione corrente. Riapri il percorso per verificare lo stato; la bozza rimane sullo schermo.');}
  else if(e instanceof StudyApiError&&e.status===422){setError('La scelta non è valida. Controlla i dati e riprova.');}
  else{setError(describeError(e,'Connessione non disponibile. Il testo rimane qui; nessuna consegna è confermata senza ricevuta.'));setOffline(true);}
 }
 async function run(operation:()=>Promise<void>){
  if(working.current||denied)return;working.current=true;setBusy(true);setError('');setMessage('');
  try{await operation();}catch(e){if(alive.current)handleFailure(e);}finally{working.current=false;if(alive.current)setBusy(false);}
 }
 useEffect(()=>{
  return subscribeStudySessionEnd(()=>{generation.current++;clearOffline(me.id,editionId);setState(null);setCatalog(null);setValue('');setReasoning('');pending.current=null;setDenied(true);setError('La sessione è terminata. Accedi di nuovo.');});
 },[editionId,me.id]);
 useEffect(()=>{
  alive.current=true;const controller=new AbortController();const token=++generation.current;setBusy(true);
  void(async()=>{
   const result=await studyRequest<StudyCatalog>(endpoint+'?editionId='+encodeURIComponent(editionId),undefined,{signal:controller.signal});
   if(!alive.current||token!==generation.current)return;setCatalog(result);
   if(result.sessions.length){const next=await studyRequest<StudyState>(endpoint+'/'+result.sessions[0].id,undefined,{signal:controller.signal});if(alive.current&&token===generation.current)adopt(next,true);}
  })().catch(e=>{if(!alive.current||controller.signal.aborted||token!==generation.current)return;handleFailure(e);
   if(!(e instanceof StudyApiError)&&!(e instanceof StudySessionChangedError)){const local=readOffline(me.id,editionId);if(local){currentState.current=local.state;setState(local.state);setOfflineSavedAt(local.savedAt);if(local.omissions?.includes('simulation-result'))setMessage('Il risultato della simulazione non è conservato nella copia offline. Riconnettiti ed esegui il modello per ricalcolarlo nel Core.');const draft=readDraft(scope(local.state));if(draft){setValue(draft.value);setReasoning(draft.reasoning);}}}
  }).finally(()=>{if(alive.current)setBusy(false);});
  return()=>{alive.current=false;controller.abort();generation.current++;};
 },[editionId,me.id]);
 async function action(name:string,fields:Record<string,unknown>={}){
  if(!state||offline)return;
  const id=state.id;
  await run(async()=>{await studyRequest<StudyState>(endpoint+'/'+id+'/actions',{revisionId:state.revisionId,action:name,fields},{headers:{'Idempotency-Key':requestKey()}});const next=await studyRequest<StudyState>(endpoint+'/'+id);if(alive.current){adopt(next);if(name==='tutor'||name==='dispute')setMessage('Richiesta conservata nel percorso. Nessun messaggio esterno è stato inviato.');}});
 }
 async function sendAttempt(){
  if(!state||offline)return;
  const existing=state.pendingAttempt;
  const n=Number(value.replace(',','.'));
  if(!existing&&!pending.current&&(!value.trim()||!Number.isFinite(n)||!reasoning.trim())){setError('Inserisci un valore numerico e spiega il procedimento.');return;}
  const command=existing?{id:state.id,...existing}:pending.current??{id:state.id,revisionId:state.revisionId,answer:{value:n,unit:state.task!.unit,reasoning:reasoning.trim()},key:requestKey()};
  pending.current=command;
  await run(async()=>{
   await studyRequest(endpoint+'/'+command.id+'/attempts',{revisionId:command.revisionId,answer:command.answer},{headers:{'Idempotency-Key':command.key}});
   const next=await studyRequest<StudyState>(endpoint+'/'+command.id);
   if(alive.current){pending.current=null;adopt(next);eraseDraft(scope(state));setShowFeedback(true);setMessage('Consegna confermata dal Core. La ricevuta conserva fonte e assistenza osservata.');}
  });
 }
 async function reconnect(){
  await run(async()=>{
   if(state){const next=await studyRequest<StudyState>(endpoint+'/'+state.id);if(alive.current){adopt(next);setMessage('Accesso e revisione riconfermati. Puoi controllare la bozza prima di inviarla.');}}
   else{const result=await studyRequest<StudyCatalog>(endpoint+'?editionId='+encodeURIComponent(editionId));if(alive.current){setCatalog(result);setOffline(false);}}
  });
 }
 const currentAttempts=state?.attempts.filter(a=>a.phase===state.phase)??[];
 const latest=currentAttempts.at(-1);
 const blocked=busy||offline||!!state?.pendingAttempt;
 return <section className="independent-study" aria-label="Studio autonomo" aria-busy={busy}>
  <header className="is-heading"><p className="section-meta">IL TUO PERCORSO · SENZA TUTOR ONLINE</p><h1>Studia da solo.</h1><p>Un obiettivo alla volta. Capisci il modello, mettilo alla prova e ritrova il punto da cui ripartire.</p></header>
  <p className="is-status" role="status">{offline?(offlineSavedAt?'Copia sul dispositivo del '+new Date(offlineSavedAt).toLocaleString('it-IT')+' · accesso da riconfermare.':'Connessione assente o non verificata · nessuna nuova consegna confermata.'):'Risorse e ricevute nel Core · controllo numerico deterministico, senza provider AI.'}</p>
  {error&&<p className="is-error" role="alert">{error}</p>}{message&&<p className="is-notice" role="status">{message}</p>}
  {!denied&&<button type="button" className="button-quiet" onClick={()=>void reconnect()} aria-disabled={busy}>Riapri e verifica il percorso</button>}
  {busy&&!state&&!catalog&&<p role="status">Apro il tuo percorso…</p>}
  {state?<>
   <div className="is-layout"><aside className="is-sidebar"><p className="section-meta">OBIETTIVO SCELTO</p><h2>{state.title}</h2>
    <ol className="is-steps">{state.phases.map((phase,i)=><li key={phase} aria-current={state.phase===phase?'step':undefined}><span>{i+1}</span>{labels[phase]||phase}</li>)}</ol>
    <p className="is-reason">{state.reviewReason}</p>
    {state.reviewAt&&<p>Ripasso: <strong>{date(state.reviewAt)}</strong></p>}
    <label className="is-field">Scegli quando ripassare<select aria-label="Scegli quando ripassare" value="" disabled={blocked} onChange={e=>void action('schedule',{days:Number(e.target.value)})}><option value="">Modifica il piano</option>{[1,3,7,14].map(d=><option key={d} value={d}>Fra {d} giorni</option>)}</select></label>
    <button type="button" disabled={blocked} onClick={()=>void run(async()=>{const c=await studyRequest<StudyCatalog>(endpoint+'?editionId='+encodeURIComponent(editionId));if(alive.current){setCatalog(c);setState(null);pending.current=null;}})}>Scegli un altro obiettivo</button>
   </aside><section className="is-card" aria-label="Passaggio del percorso">
    <p className="section-meta">{labels[state.phase]}</p>
    {state.phase==='diagnostic'&&<><h2>Prima di cominciare</h2><p>Quale relazione useresti? Scrivi quello che sai e il dubbio da verificare. Non assegniamo un livello da questa risposta.</p>
     <label className="is-field">La tua idea iniziale<textarea maxLength={4000} value={diagnostic} onChange={e=>setDiagnostic(e.target.value)} disabled={blocked}/></label>
     <button className="button-primary" disabled={blocked||!diagnostic.trim()} onClick={()=>void action('diagnostic',{text:diagnostic})}>Comincia la spiegazione</button>
     {!!state.prerequisites.length&&<details><summary>Prerequisiti da recuperare</summary><ul>{state.prerequisites.map(p=><li key={p}>{p}</li>)}</ul><p>Usa questi punti per rivedere il tuo procedimento o registrare una richiesta al docente.</p></details>}
    </>}
    {state.source&&<><h2>{state.phase==='recovery'?'Ritrova il passaggio':'La relazione da capire'}</h2>{state.source.explanation.map((p,i)=><p key={i}>{p}</p>)}<ul>{state.source.recap.map((p,i)=><li key={i}>{p}</li>)}</ul>
     <button className="button-primary" disabled={blocked} onClick={()=>void action('next')}>{state.phase==='recovery'?'Affronta un problema diverso':'Esplora il modello'}</button></>}
    {state.phase==='simulation'&&state.simulation&&<><h2>Dal dato al modello</h2><p>Controlla e cambia i parametri. Osservare il risultato sarà registrato come aiuto nella prima prova.</p><div className="is-model-controls">{Object.entries(state.simulation.controls).map(([k,values])=><label className="is-field" key={k}>{modelLabels[k]||k}<select aria-label={modelLabels[k]||k} value={String(state.simulation!.parameters[k])} disabled={blocked} onChange={e=>{const selected=values.find(v=>String(v)===e.target.value)!;void action('simulate',{parameters:{...state.simulation!.parameters,[k]:selected}});}}>{values.map(v=><option key={String(v)} value={String(v)}>{parameterValue(v)}</option>)}</select></label>)}</div>
     <button disabled={blocked} onClick={()=>void action('simulate',{caseIndex:0})}>Esegui il modello</button>
     {state.simulation.result&&<div className="is-model"><p className="section-meta">RISULTATO DEL MODELLO CORE</p><p className="is-number">{Number(state.simulation.result.value).toLocaleString('it-IT',{maximumSignificantDigits:8})} <small>{state.simulation.result.unit}</small></p><p>{state.simulation.result.domain}</p></div>}
     {state.simulation.result&&<StudyModel simulation={state.simulation}/>}
     <button className="button-primary" disabled={blocked} onClick={()=>void action('next')}>Passa alla prova</button></>}
    {state.task&&<><h2>{state.phase==='transfer'?'Un problema diverso':'Metti alla prova il modello'}</h2><p className="is-prompt">{state.task.prompt}</p><Parameters values={state.task.parameters}/>
     <label className="is-field">Il tuo valore [{state.task.unit}]<input inputMode="decimal" autoComplete="off" maxLength={64} value={value} readOnly={busy||!!state.pendingAttempt} onChange={e=>{setValue(e.target.value);pending.current=null;}}/></label>
     <label className="is-field">Il tuo procedimento<textarea maxLength={4000} value={reasoning} readOnly={busy||!!state.pendingAttempt} onChange={e=>{setReasoning(e.target.value);pending.current=null;}} placeholder="Dati, relazione scelta, passaggi e controllo delle unità."/></label>
     <div className="is-actions"><button className="button-primary" disabled={busy||offline} onClick={()=>void sendAttempt()}>{state.pendingAttempt?'Recupera l’invio interrotto':'Consegna e confronta'}</button><button disabled={blocked||state.hintLevel>=3} onClick={()=>void action('hint')}>Chiedi un indizio</button></div>
     {!!state.hints?.length&&<div className="is-hints" role="note"><strong>Aiuto registrato</strong><ol>{state.hints.map((h,i)=><li key={i}>{h}</li>)}</ol></div>}
     {latest&&<div className="is-feedback"><p>Ricevuta <code>{latest.receipt.receiptId}</code> · consegna confermata.</p><button onClick={()=>setShowFeedback(v=>!v)}>{showFeedback?'Nascondi il confronto':'Mostra il confronto del tentativo'}</button>
      {showFeedback&&<><p>{latest.feedback.message}</p><p>Modello: {latest.feedback.expectedValue} {latest.feedback.unit}. Il procedimento resta da verificare con la rubrica.</p><ul>{latest.feedback.rubric.map(r=><li key={r}>{r}</li>)}</ul><p>{latest.feedback.assistance.observed.length?'Prova assistita: '+latest.feedback.assistance.observed.map(supportLabel).join(', '):'Nessun aiuto richiesto in questa fase osservato.'} Aiuti esterni non determinati. Nessuna mastery inferita.</p></>}
      <button className="button-primary" disabled={blocked} onClick={()=>void action(state.phase==='transfer'?'finish':'recover')}>{state.phase==='transfer'?'Organizza il ripasso':'Recupera dalla fonte'}</button></div>}
    </>}
    {state.phase==='review'&&<><h2>Un punto da cui ripartire.</h2><p>Il percorso conserva i tentativi e gli aiuti. La coincidenza numerica non certifica l’apprendimento.</p><p>{state.reviewReason}</p>
     {state.reviewScheduler&&<section className="is-review" aria-label="Piano di ripasso"><h3>Come hai ricordato?</h3><p>{state.reviewScheduler.explanation}</p>
      {!state.reviewScheduler.rated&&<div className="is-review-choices">{state.reviewScheduler.choices.map(choice=><button key={choice.rating} aria-label={'Autovalutazione: '+choice.label+', ripasso '+date(choice.due)} disabled={blocked} onClick={()=>void action('rate',{rating:choice.rating})}><strong>{choice.label}</strong><span>Ripasso {date(choice.due)}</span></button>)}</div>}
      {state.reviewScheduler.rated&&<p role="status">Autovalutazione registrata. La data proposta è nel tuo piano.</p>}
      {state.reviewScheduler.canUndo&&<button disabled={blocked} onClick={()=>void action('undo-rating')}>Annulla l’autovalutazione</button>}
      {state.reviewScheduler.manualOverride&&<p>Hai scelto una data personale. Questa modifica non conta come un nuovo ripasso.</p>}
      <details><summary>Come viene proposta la data</summary><p>FSRS propone intervalli dalla tua autovalutazione e dai ripassi precedenti. Gli aiuti osservati rimangono nella cronologia; eventuali aiuti esterni non sono determinati. Il primo piano usa parametri generali, senza stima personale di efficacia.</p></details>
     </section>}
     <button className="button-primary" disabled={blocked} onClick={()=>void action('restart')}>Ricomincia il ripasso</button></>}
    <details className="is-save"><summary>Bozza e lettura sul dispositivo</summary><p>Su un dispositivo personale puoi conservare il passaggio visibile e il testo. La copia non conferma accesso, voto o sincronizzazione.</p>
     <button disabled={busy} onClick={()=>{const a=saveDraft(scope(state),{value,reasoning});const b=saveOffline(me.id,editionId,state);setMessage(a&&b?'Salvato sul dispositivo. La bozza non è una consegna.':'Spazio del browser non disponibile. Il testo resta sullo schermo.');}}>Salva bozza e passaggio sul dispositivo</button>
     <button onClick={()=>{eraseDraft(scope(state));clearOffline(me.id,editionId);setMessage('Copia locale rimossa. Le ricevute Core rimangono nel percorso.');}}>Rimuovi la copia locale</button></details>
    <details><summary>Dubbi, contestazione e richiesta al docente</summary><label className="is-field">Descrivi il dubbio<textarea maxLength={4000} value={requestText} onChange={e=>setRequestText(e.target.value)} disabled={blocked}/></label><div className="is-actions"><button disabled={blocked||!requestText.trim()} onClick={()=>void action('dispute',{text:requestText})}>Contesta il feedback</button><button disabled={blocked||!requestText.trim()} onClick={()=>void action('tutor',{text:requestText})}>Registra richiesta al docente</button></div>
     {(state.tutorRequest||state.dispute)&&<p>Richiesta conservata. Non inviata al docente; nessun messaggio esterno.</p>}</details>
    <details><summary>Fonte e revisione esatte</summary><p>Lezione {state.lessonRef.id} · versione {state.lessonRef.version}</p><p className="is-reference">{state.lessonRef.sha256}</p><p>Risorsa {state.sourceRef.resourceId} · revisione {state.sourceRef.revisionId}</p></details>
   </section></div>
  </>:catalog&&<div className="is-catalog"><h2>Scegli da dove cominciare.</h2><p>{catalog.reason}</p>
   {!!catalog.sessions.length&&<div className="is-resume"><h3>I tuoi percorsi</h3>{catalog.sessions.map(s=><button key={s.id} disabled={busy||offline} onClick={()=>void run(async()=>{const v=await studyRequest<StudyState>(endpoint+'/'+s.id);if(alive.current)adopt(v,true);})}>Riprendi · {labels[s.phase]}{s.reviewAt?' · '+date(s.reviewAt):''}</button>)}</div>}
   <div className="is-objectives">{catalog.objectives.map(o=><article key={o.lessonRef.id}><p className="section-meta">OBIETTIVO</p><h3>{o.title}</h3><p>{o.objectiveIds.join(' · ')}</p><button className="button-primary" disabled={busy||offline} onClick={()=>void run(async()=>{const v=await studyRequest<StudyState>(endpoint,{editionId,lessonRef:o.lessonRef},{headers:{'Idempotency-Key':requestKey()}});if(alive.current)adopt(v);})}>Scegli questo obiettivo</button></article>)}</div><p>{catalog.coverageWarning}</p>
  </div>}
  <footer className="is-limit">Materiali originali DRAFT. Nessuna approvazione scientifica attestata. Il flusso copre pochi esempi dei corsi, non tutti i 200 sotto-obiettivi.</footer>
 </section>;
}
function Parameters({values}:{values:Record<string,string|number>}){return <dl className="is-parameters">{Object.entries(values).map(([k,v])=><div key={k}><dt>{modelLabels[k]||k}</dt><dd>{parameterValue(v)}</dd></div>)}</dl>;}
