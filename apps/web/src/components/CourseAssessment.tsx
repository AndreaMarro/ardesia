import {useEffect,useRef,useState} from 'react';
import type {CourseLessonContext} from '../../../studio/src/study/contracts';
import type {ActivityCommit} from '../course';
import type {CourseLesson} from '../courseLearning';
export type AssessmentItem={id:string;objectiveId:string;prompt:string;transfer:{prompt:string};assessmentRef:{id:string;version:number;sha256:string}};
export function CourseAssessment({items,lesson,onCommit,onInvalidated,initialContext}:{items:AssessmentItem[];lesson:CourseLesson;onCommit?:(v:ActivityCommit|null)=>void;onInvalidated:()=>void;initialContext?:CourseLessonContext}){
 const available=items.filter(i=>lesson.objectiveIds.includes(i.objectiveId));
 const [open,setOpen]=useState(Boolean(initialContext?.assessmentRef));
 const [selected,setSelected]=useState(initialContext?.assessmentRef?.id||available[0]?.id),[phase,setPhase]=useState<'practice'|'transfer'>(initialContext?.phase||'practice');
 const [response,setResponse]=useState(''),[prepared,setPrepared]=useState(false);const heading=useRef<HTMLHeadingElement>(null);
 const item=available.find(i=>i.id===selected);
 const unavailable=initialContext?.assessmentRef&&(!item||item.assessmentRef.sha256!==initialContext.assessmentRef.sha256||item.assessmentRef.version!==initialContext.assessmentRef.version);
 useEffect(()=>{if(initialContext?.assessmentRef)heading.current?.focus();},[]);
 function invalidate(){setPrepared(false);onCommit?.(null);onInvalidated();}
 if(!available.length)return null;
 if(unavailable)return <section><h3 ref={heading} tabIndex={-1}>Verifica non disponibile</h3><p>Il problema di questo tentativo appartiene a una revisione non disponibile. Riapri la consegna originale: nessun altro problema è stato selezionato.</p></section>;
 return <details className="course-assessment" open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary>Verifica il ragionamento · {available.length} prove della lezione</summary>
  {open&&item&&<section aria-label="Verifica del ragionamento"><h3 ref={heading} tabIndex={-1}>Spiega, confronta, trasferisci</h3><p>Queste prove richiedono la revisione del docente. La consegna e l’uso di aiuti non equivalgono alla padronanza dell’argomento.</p>
   <label>Problema<select value={selected} onChange={e=>{setSelected(e.target.value);setResponse('');invalidate();}}>{available.map((i,n)=><option key={i.id} value={i.id}>Prova {n+1} · {i.prompt.length>90?i.prompt.slice(0,87)+'…':i.prompt}</option>)}</select></label>
   <div role="group" aria-label="Fase della verifica"><button type="button" aria-pressed={phase==='practice'} onClick={()=>{setPhase('practice');setResponse('');invalidate();}}>Prima prova</button><button type="button" aria-pressed={phase==='transfer'} onClick={()=>{setPhase('transfer');setResponse('');invalidate();}}>Problema di trasferimento</button></div>
   <p className="course-situation">{phase==='practice'?item.prompt:item.transfer.prompt}</p>
   <label>La tua risposta alla verifica<textarea rows={5} maxLength={2000} value={response} onChange={e=>{setResponse(e.target.value);invalidate();}}/></label>
   <button type="button" className="button-primary" disabled={!response.trim()} onClick={()=>{onInvalidated();onCommit?.({activityId:'course-reasoning-v1',parameters:{},prediction:response,courseLesson:{lessonRef:lesson.lessonRef,phase,assessmentRef:item.assessmentRef,...(initialContext?.stepId?{stepId:initialContext.stepId}:{})}});setPrepared(true);}}>Prepara questa risposta per il docente</button>
   {prepared&&<p role="status">Risposta pronta. Completa il procedimento e invia con il modulo di consegna qui sotto.</p>}
  </section>}
 </details>;
}
