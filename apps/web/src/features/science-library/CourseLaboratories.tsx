import {useEffect,useState} from 'react';
import type {StudyMe,Submission} from '../../api';
import type {CourseLessonContext,PostitReference} from '../../../../studio/src/study/contracts';
import type {CourseLesson} from '../../courseLearning';
import type {ActivityCommit} from '../../course';
import {confirmCourseExit,useCourseDraftScope} from '../../courseExitGuard';
import {CoreFluidLab} from './CoreFluidLab';
import {scienceApi} from './scienceApi';
import type {Capability,ResourceRef,SavedScience} from './types';
const models:Record<string,string[]>={
 'ds-2026-u3-01':['pascal'],
 'ds-2026-u3-02':['manometer','hydrostatic','pascal','buoyancy'],
 'ds-2026-u3-03':['continuity','venturi'],'ds-2026-u3-04':['poiseuille','hydraulic-network'],
 'ds-2026-u3-05':['capillary'],'ds-2026-u5-01':['ideal-gas'],
 'ds-2026-u5-02':['calorimetry','phase-change'],'ds-2026-u5-03':['heat-transfer'],
 'ds-2026-u5-04':['process'],'ds-2026-u5-05':['carnot','entropy']};
export const lessonSupportsLab=(lessonId:string,activityId:string)=>Boolean(models[lessonId]?.some(id=>activityId===id+'-lab-v1'));
export type CourseLabHost={me:StudyMe;editionId:string;saved:SavedScience[];onSaved:(ref:PostitReference)=>void;onAcknowledged?:(value:SavedScience,previous:ResourceRef|null)=>boolean|void;onInvalidated:()=>void;resume?:CourseLessonContext;resumeActivityId?:string;lastAttempt?:Submission};
export function CourseLaboratories({host,lesson,phase,stepId,initialActivityId,onCommit}:{host:CourseLabHost;lesson:CourseLesson;phase:CourseLessonContext['phase'];stepId?:string;initialActivityId?:string;onCommit?:(v:ActivityCommit|null)=>void}){
 const exitScope=useCourseDraftScope();
 const [capabilities,setCapabilities]=useState<Capability[]>([]),[error,setError]=useState(''),[retry,setRetry]=useState(0),[loading,setLoading]=useState(true);
 const matches=host.saved.filter(s=>s.snapshot.courseLesson?.lessonRef.sha256===lesson.lessonRef.sha256&&s.snapshot.courseLesson.phase===phase&&s.snapshot.labSnapshot);
 const [selected,setSelected]=useState(initialActivityId?models[lesson.id]?.find(id=>initialActivityId===id+'-lab-v1'):matches[0]?.snapshot.labSnapshot?.configuration.modelId||models[lesson.id]?.[0]);
 useEffect(()=>{const c=new AbortController();setError('');setLoading(true);void scienceApi.catalog(host.editionId,c.signal).then(d=>{if(!c.signal.aborted)setCapabilities(d.capabilities);}).catch(()=>{if(!c.signal.aborted)setError('Non riesco ad aprire i laboratori del corso.');}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[host.editionId,retry]);
 if(!models[lesson.id])return null;
 const available=capabilities.filter(c=>c.fluidLab&&models[lesson.id].includes(c.fluidLab.modelId));
 const cap=available.find(c=>c.fluidLab?.modelId===selected);
 const saved=matches.find(s=>s.snapshot.capabilityId===cap?.id);
 return <section className="course-laboratories" aria-label="Laboratori della lezione"><h3>Metti alla prova il fenomeno</h3>
  {error?<><p role="alert">{error}</p><button onClick={()=>setRetry(x=>x+1)}>Riprova</button></>:loading?<p role="status">Apro il laboratorio…</p>:!cap?<p role="alert">Il laboratorio richiesto non è disponibile per questa lezione. Nessun altro modello viene aperto.</p>:<>
   {available.length>1&&<label>Fenomeno da esplorare<select value={selected} onChange={e=>{if(e.target.value!==selected&&!confirmCourseExit(exitScope,['laboratory']))return;setSelected(e.target.value as typeof selected);onCommit?.(null);host.onInvalidated();}}>{available.map(c=><option key={c.id} value={c.fluidLab!.modelId}>{c.title}</option>)}</select></label>}
   {lesson.id==='ds-2026-u3-01'&&<p>In questo passaggio mantieni fissa la forza di ingresso e varia l’area di ingresso. Confronta la tua previsione con l’incremento di pressione F₁/A₁ nella tabella delle misure, in pascal. La forza di uscita F₂, mostrata dal torchio in newton, è una grandezza diversa.</p>}
   {/* Background ACKs preserve the open draft. Explicit revision navigation remounts its consumer. */}
   <CoreFluidLab key={JSON.stringify([host.me.id,host.me.role,host.editionId,lesson.lessonRef,phase,cap.id])} me={host.me} editionId={host.editionId} capability={cap} saved={saved} courseLesson={{lessonRef:lesson.lessonRef,phase,...(stepId?{stepId}:{})}} onCommit={onCommit} onSaved={host.onSaved} onAcknowledged={host.onAcknowledged} onInvalidated={host.onInvalidated}/>
  </>}
 </section>;
}
