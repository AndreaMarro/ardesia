import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CourseLessonContext} from '../../../studio/src/study/contracts';
import {useCourseDraft} from '../courseExitGuard';
import type {ActivityCommit} from '../course';
import type {CourseLesson} from '../courseLearning';
export type AssessmentItem={id:string;objectiveId:string;prompt:string;transfer:{prompt:string};assessmentRef:{id:string;version:number;sha256:string}};
export function CourseAssessment({items,lesson,onCommit,onInvalidated,initialContext,stepId}:{items:AssessmentItem[];lesson:CourseLesson;onCommit?:(v:ActivityCommit|null)=>void;onInvalidated:()=>void;initialContext?:CourseLessonContext;stepId?:string}){
 const work=useCourseDraft('assessment');
 const available=items.filter(i=>lesson.objectiveIds.includes(i.objectiveId));
 const [open,setOpen]=useState(Boolean(initialContext?.assessmentRef));
 const [selected,setSelected]=useState(initialContext?.assessmentRef?.id||available[0]?.id),[phase,setPhase]=useState<'practice'|'transfer'>(initialContext?.phase||'practice');
 const [response,setResponse]=useState(''),[prepared,setPrepared]=useState(false);const heading=useRef<HTMLHeadingElement>(null);
 const previousStep=useRef(stepId);
 useLayoutEffect(()=>{if(previousStep.current!==stepId){previousStep.current=stepId;if(response.trim())work.changed();setPrepared(false);onCommit?.(null);onInvalidated();}},[stepId]);
 const item=available.find(i=>i.id===selected);
 const initialItem=available.find(i=>i.id===initialContext?.assessmentRef?.id);
 const unavailable=initialContext?.assessmentRef&&(!initialItem||initialItem.assessmentRef.sha256!==initialContext.assessmentRef.sha256||initialItem.assessmentRef.version!==initialContext.assessmentRef.version);
 useEffect(()=>{if(initialContext?.assessmentRef)heading.current?.focus();},[]);
 function invalidate(changed=true){if(changed)work.changed();setPrepared(false);onCommit?.(null);onInvalidated();}
 if(!available.length||(lesson.activityId&&lesson.activityId!=='course-reasoning-v1'))return null;
 if(unavailable)return <section><h3 ref={heading} tabIndex={-1}>Verifica non disponibile</h3><p>Il problema di questo tentativo appartiene a una revisione non disponibile. Riapri la consegna originale: nessun altro problema è stato selezionato.</p></section>;
 return <details className="course-assessment" open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary>Verifica il ragionamento · {available.length} prove della lezione</summary>
  {open&&item&&<section aria-label="Verifica del ragionamento"><h3 ref={heading} tabIndex={-1}>Spiega, confronta, trasferisci</h3><p>Queste prove richiedono la revisione del docente. La consegna e l’uso di aiuti non equivalgono alla padronanza dell’argomento.</p>
   <label>Problema<select value={selected} onChange={e=>{if(e.target.value!==selected&&!work.allowDiscard())return;setSelected(e.target.value);setResponse('');invalidate(false);}}>{available.map((i,n)=><option key={i.id} value={i.id}>Prova {n+1} · {i.prompt.length>90?i.prompt.slice(0,87)+'…':i.prompt}</option>)}</select></label>
   <div role="group" aria-label="Fase della verifica"><button type="button" aria-pressed={phase==='practice'} onClick={()=>{if(phase==='practice'||!work.allowDiscard())return;setPhase('practice');setResponse('');invalidate(false);}}>Prima prova</button><button type="button" aria-pressed={phase==='transfer'} onClick={()=>{if(phase==='transfer'||!work.allowDiscard())return;setPhase('transfer');setResponse('');invalidate(false);}}>Problema di trasferimento</button></div>
   <p className="course-situation">{phase==='practice'?item.prompt:item.transfer.prompt}</p>
   <label>La tua risposta alla verifica<textarea rows={5} maxLength={2000} value={response} onChange={e=>{setResponse(e.target.value);invalidate();}}/></label>
   <button type="button" className="button-primary" disabled={!response.trim()} onClick={()=>{const checkpoint=work.checkpoint();onInvalidated();onCommit?.({confirmDraft:()=>work.confirm(checkpoint),activityId:'course-reasoning-v1',parameters:{},prediction:response,courseLesson:{lessonRef:lesson.lessonRef,phase,assessmentRef:item.assessmentRef,...(stepId?{stepId}:{})}});setPrepared(true);}}>Prepara questa risposta per il docente</button>
   {work.dirty&&<p>La risposta aperta non è ancora consegnata. Preparala e inviala prima di uscire per ritrovarla.</p>}
   {prepared&&<p role="status">Risposta pronta. Completa il procedimento e invia con il modulo di consegna qui sotto.</p>}
  </section>}
 </details>;
}
