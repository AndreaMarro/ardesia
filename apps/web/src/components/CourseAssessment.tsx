import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CourseLessonContext} from '../../../studio/src/study/contracts';
import {describeError,requestKey,studyRequest} from '../api';
import {useCourseDraft} from '../courseExitGuard';
import type {ActivityCommit} from '../course';
import type {CourseAssessmentItem,CourseLesson} from '../courseLearning';
export type AssessmentItem=CourseAssessmentItem;
type Support={assessmentRef:NonNullable<CourseLessonContext['assessmentRef']>;phase:'practice'|'transfer';level:number;hintCount:number;text:string;kind:'HINT'|'EXPLICIT_HINT';assistanceRecorded:true};
type Props={items:AssessmentItem[];lesson:CourseLesson;onCommit?:(v:ActivityCommit|null)=>void;onInvalidated:()=>void;initialContext?:CourseLessonContext;stepId?:string;editionId?:string;actorId?:string};
const sameRef=(a:{id:string;version:number;sha256:string},b:{id:string;version:number;sha256:string})=>a.id===b.id&&a.version===b.version&&a.sha256===b.sha256;
export function CourseAssessment(props:Props){return <AssessmentEditor key={JSON.stringify([props.actorId,props.editionId,props.lesson.lessonRef.id,props.lesson.lessonRef.version,props.lesson.lessonRef.sha256])} {...props}/>;}
function AssessmentEditor({items,lesson,onCommit,onInvalidated,initialContext,stepId,editionId,actorId}:Props){
 const work=useCourseDraft('assessment');
 const available=items.filter(i=>lesson.objectiveIds.includes(i.objectiveId));
 const [open,setOpen]=useState(Boolean(initialContext?.assessmentRef));
 const [selected,setSelected]=useState(initialContext?.assessmentRef?.id||available[0]?.id),[phase,setPhase]=useState<'practice'|'transfer'>(initialContext?.phase||'practice');
 const [response,setResponse]=useState(''),[prepared,setPrepared]=useState(false);const heading=useRef<HTMLHeadingElement>(null);
 const previousStep=useRef(stepId);
 useLayoutEffect(()=>{if(previousStep.current!==stepId){previousStep.current=stepId;if(response.trim())work.changed();setPrepared(false);onCommit?.(null);onInvalidated();}},[stepId]);
 const item=available.find(i=>i.id===selected);
 const initialItem=available.find(i=>i.id===initialContext?.assessmentRef?.id);
 const unavailable=initialContext?.assessmentRef&&(!initialItem||!sameRef(initialItem.assessmentRef,initialContext.assessmentRef)||!sameRef(initialContext.lessonRef,lesson.lessonRef));
 useEffect(()=>{if(initialContext?.assessmentRef)heading.current?.focus();},[]);
 function invalidate(changed=true){if(changed)work.changed();setPrepared(false);onCommit?.(null);onInvalidated();}
 const hintCount=(phase==='practice'?item?.hintCount:item?.transfer.hintCount)||0;
 const contextKey=JSON.stringify([actorId,editionId,lesson.lessonRef.id,lesson.lessonRef.version,lesson.lessonRef.sha256,item?.assessmentRef.id,item?.assessmentRef.version,item?.assessmentRef.sha256,phase,stepId]);
 const contextNow=useRef(contextKey);contextNow.current=contextKey;
 const requestEpoch=useRef(0),busyRef=useRef(false),previousHintContext=useRef(contextKey);
 const pending=useRef<{scope:string;key:string;body:{courseLesson:CourseLessonContext;level:number}}|null>(null);
 const [hints,setHints]=useState<Support[]>([]),[hintError,setHintError]=useState(''),[hintBusy,setHintBusy]=useState(false);
 useLayoutEffect(()=>{if(previousHintContext.current!==contextKey){previousHintContext.current=contextKey;if(response.trim())work.changed();setPrepared(false);onCommit?.(null);onInvalidated();}requestEpoch.current++;pending.current=null;busyRef.current=false;setHints([]);setHintError('');setHintBusy(false);return()=>{requestEpoch.current++;};},[contextKey]);
 async function nextHint(){
  if(!item||!editionId||!actorId||busyRef.current||hints.length>=hintCount)return;
  const scope=contextKey;
  const courseLesson:CourseLessonContext={lessonRef:{...lesson.lessonRef},assessmentRef:{...item.assessmentRef},phase,...(stepId?{stepId}:{})};
  const request=pending.current?.scope===scope?pending.current:{scope,key:requestKey(),body:{courseLesson,level:hints.length+1}};
  pending.current=request;busyRef.current=true;setHintBusy(true);setHintError('');invalidate(Boolean(response.trim()));
  const epoch=++requestEpoch.current;
  try{
   const value=await studyRequest<Support>('/editions/'+encodeURIComponent(editionId)+'/course-assessments/'+encodeURIComponent(item.id)+'/support',request.body,{method:'POST',headers:{'Idempotency-Key':request.key}});
   if(contextNow.current!==scope||requestEpoch.current!==epoch)return;
   if(!value||!value.assessmentRef||!sameRef(value.assessmentRef,item.assessmentRef)||value.phase!==phase||value.level!==request.body.level||value.hintCount!==hintCount||value.assistanceRecorded!==true||typeof value.text!=='string'||!value.text.trim()||!['HINT','EXPLICIT_HINT'].includes(value.kind))throw Error('course_assessment_support_mismatch');
   setHints(previous=>[...previous,value]);pending.current=null;
  }catch(failure){if(contextNow.current===scope&&requestEpoch.current===epoch)setHintError(describeError(failure,'Non riesco ad aprire l’aiuto. Riprova la stessa richiesta.'));}
  finally{if(contextNow.current===scope&&requestEpoch.current===epoch){busyRef.current=false;setHintBusy(false);}}
 }
 if(!available.length||(lesson.activityId&&lesson.activityId!=='course-reasoning-v1'))return null;
 if(unavailable)return <section><h3 ref={heading} tabIndex={-1}>Verifica non disponibile</h3><p>Il problema di questo tentativo appartiene a una revisione non disponibile. Riapri la consegna originale: nessun altro problema è stato selezionato.</p></section>;
 return <details className="course-assessment" open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary>Verifica il ragionamento · {available.length} prove della lezione</summary>
  {open&&item&&<section aria-label="Verifica del ragionamento"><h3 ref={heading} tabIndex={-1}>Spiega, confronta, trasferisci</h3><p>Queste prove richiedono la revisione del docente. La consegna e l’uso di aiuti non equivalgono alla padronanza dell’argomento.</p>
   <label>Problema<select value={selected} onChange={e=>{if(e.target.value!==selected&&!work.allowDiscard())return;setSelected(e.target.value);setResponse('');invalidate(false);}}>{available.map((i,n)=><option key={i.id} value={i.id}>Prova {n+1} · {i.prompt.length>90?i.prompt.slice(0,87)+'…':i.prompt}</option>)}</select></label>
   <div role="group" aria-label="Fase della verifica"><button type="button" aria-pressed={phase==='practice'} onClick={()=>{if(phase==='practice'||!work.allowDiscard())return;setPhase('practice');setResponse('');invalidate(false);}}>Prima prova</button><button type="button" aria-pressed={phase==='transfer'} onClick={()=>{if(phase==='transfer'||!work.allowDiscard())return;setPhase('transfer');setResponse('');invalidate(false);}}>Problema di trasferimento</button></div>
   <p className="course-situation">{phase==='practice'?item.prompt:item.transfer.prompt}</p>
   {hintCount>0&&editionId&&actorId&&<section aria-label="Aiuti graduali"><p>Apri un aiuto alla volta. Il prossimo aiuto può includere esplicitamente la risposta; la richiesta viene registrata dal servizio.</p>
    {hints.map(h=><article key={h.level}><h4>Aiuto {h.level}{h.kind==='EXPLICIT_HINT'?' · riferimento esplicito di risposta':''}</h4><p>{h.text}</p><p>Uso dell’aiuto registrato nel servizio.</p></article>)}
    {hints.length<hintCount&&<button type="button" disabled={hintBusy} onClick={()=>void nextHint()}>{hintBusy?'Apro l’aiuto…':hintError?'Riprova lo stesso aiuto':'Apri aiuto '+(hints.length+1)+' di '+hintCount}</button>}
    {hintError&&<p role="alert">{hintError}</p>}
   </section>}
   <label>La tua risposta alla verifica<textarea rows={5} maxLength={2000} value={response} onChange={e=>{setResponse(e.target.value);invalidate();}}/></label>
   <button type="button" className="button-primary" disabled={!response.trim()} onClick={()=>{const checkpoint=work.checkpoint();onInvalidated();onCommit?.({confirmDraft:()=>work.confirm(checkpoint),activityId:'course-reasoning-v1',parameters:{},prediction:response,courseLesson:{lessonRef:lesson.lessonRef,phase,assessmentRef:item.assessmentRef,...(stepId?{stepId}:{})}});setPrepared(true);}}>Prepara questa risposta per il docente</button>
   {work.dirty&&<p>La risposta aperta non è ancora consegnata. Preparala e inviala prima di uscire per ritrovarla.</p>}
   {prepared&&<p role="status">Risposta pronta. Completa il procedimento e invia con il modulo di consegna qui sotto.</p>}
  </section>}
 </details>;
}
