import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CourseLessonContext} from '../../../studio/src/study/contracts';
import {useCourseDraft} from '../courseExitGuard';
import type {ActivityCommit} from '../course';
import type {CourseDiagnosticItem,CourseLesson} from '../courseLearning';
const sameRef=(a:{id:string;version:number;sha256:string},b:{id:string;version:number;sha256:string})=>a.id===b.id&&a.version===b.version&&a.sha256===b.sha256;
export function CourseDiagnostic(props:{items:CourseDiagnosticItem[];lesson:CourseLesson;coursePathId:string;onCommit?:(v:ActivityCommit|null)=>void;onInvalidated:()=>void;initialContext?:CourseLessonContext;stepId?:string}){
 return <DiagnosticEditor key={JSON.stringify([props.lesson.lessonRef.id,props.lesson.lessonRef.version,props.lesson.lessonRef.sha256])} {...props}/>;
}
function DiagnosticEditor({items,lesson,coursePathId,onCommit,onInvalidated,initialContext,stepId}:{items:CourseDiagnosticItem[];lesson:CourseLesson;coursePathId:string;onCommit?:(v:ActivityCommit|null)=>void;onInvalidated:()=>void;initialContext?:CourseLessonContext;stepId?:string}){
 const work=useCourseDraft('diagnostic');
 const available=items.filter(i=>sameRef(i.lessonRef,lesson.lessonRef)&&i.recoveryTarget.lessonId===lesson.id&&lesson.objectiveIds.includes(i.objectiveId));
 const [selected,setSelected]=useState(initialContext?.assessmentRef?.id||available[0]?.id);
 const [response,setResponse]=useState(''),[prepared,setPrepared]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null),previousStep=useRef(stepId);
 useLayoutEffect(()=>{if(previousStep.current!==stepId){previousStep.current=stepId;if(response.trim())work.changed();setPrepared(false);onCommit?.(null);onInvalidated();}},[stepId]);
 useEffect(()=>{if(initialContext?.assessmentRef)heading.current?.focus();},[]);
 const initial=available.find(i=>i.id===initialContext?.assessmentRef?.id);
 const unavailable=initialContext?.assessmentRef&&(!initial||!sameRef(initial.assessmentRef,initialContext.assessmentRef)||initialContext.phase!=='practice'||!sameRef(initialContext.lessonRef,lesson.lessonRef));
 if(lesson.activityId&&lesson.activityId!=='course-reasoning-v1')return null;
 if(unavailable)return <section><h3 ref={heading} tabIndex={-1}>Diagnostica non disponibile</h3><p>La revisione o la fase della prova iniziale non è disponibile. Nessun altro problema è stato selezionato.</p></section>;
 if(!available.length)return null;
 const item=available.find(i=>i.id===selected);
 if(!item)return null;
 const recovery=new URL(location.href);recovery.searchParams.set('courseLessonPath',coursePathId);recovery.searchParams.set('courseLesson',item.recoveryTarget.lessonId);recovery.searchParams.set('courseRev',item.lessonRef.sha256);recovery.hash='course-lesson-title';
 return <section className="course-diagnostic" aria-label="Diagnostica iniziale"><h3 ref={heading} tabIndex={-1}>Prima di iniziare: che cosa sai già?</h3><p>Una prova iniziale da discutere con il docente. La risposta non genera un voto automatico.</p>
 {available.length>1&&<label>Prova iniziale<select value={selected} onChange={e=>{if(e.target.value!==selected&&!work.allowDiscard())return;setSelected(e.target.value);setResponse('');setPrepared(false);onCommit?.(null);onInvalidated();}}>{available.map((i,n)=><option key={i.id} value={i.id}>Prova iniziale {n+1}</option>)}</select></label>}
 <p>{item.prompt}</p><label>La tua risposta iniziale<textarea rows={4} maxLength={2000} value={response} onChange={e=>{work.changed();setResponse(e.target.value);setPrepared(false);onCommit?.(null);onInvalidated();}}/></label>
 <button type="button" className="button-primary" disabled={!response.trim()} onClick={()=>{const checkpoint=work.checkpoint();onInvalidated();onCommit?.({confirmDraft:()=>work.confirm(checkpoint),activityId:'course-reasoning-v1',parameters:{},prediction:response,courseLesson:{lessonRef:item.lessonRef,assessmentRef:item.assessmentRef,phase:'practice',...(stepId?{stepId}:{})}});setPrepared(true);}}>Prepara la risposta iniziale per il docente</button>
 {work.dirty&&<p>La risposta iniziale non è ancora consegnata.</p>}{prepared&&<p role="status">Risposta iniziale pronta. Inviala con il modulo di consegna del corso.</p>}
 <a href={recovery.pathname+recovery.search+recovery.hash}>Riprendi le basi per questo obiettivo</a>
 </section>;
}
