import {useEffect,useState} from 'react';
import type {StudyMe} from '../../api';
import type {CourseLessonContext,PostitReference} from '../../../../studio/src/study/contracts';
import type {CourseLesson} from '../../courseLearning';
import type {ActivityCommit} from '../../course';
import {CoreFluidLab} from './CoreFluidLab';
import {scienceApi} from './scienceApi';
import type {Capability,SavedScience} from './types';
const models:Record<string,string[]>={
 'ds-2026-u3-02':['manometer','hydrostatic','pascal','buoyancy'],
 'ds-2026-u3-03':['continuity','venturi'],'ds-2026-u3-04':['poiseuille','hydraulic-network'],
 'ds-2026-u3-05':['capillary'],'ds-2026-u5-01':['ideal-gas'],
 'ds-2026-u5-02':['calorimetry','phase-change'],'ds-2026-u5-03':['heat-transfer'],
 'ds-2026-u5-04':['process'],'ds-2026-u5-05':['carnot','entropy']};
export type CourseLabHost={me:StudyMe;editionId:string;saved:SavedScience[];onSaved:(ref:PostitReference)=>void;onInvalidated:()=>void};
export function CourseLaboratories({host,lesson,phase,stepId,onCommit}:{host:CourseLabHost;lesson:CourseLesson;phase:CourseLessonContext['phase'];stepId?:string;onCommit?:(v:ActivityCommit|null)=>void}){
 const [capabilities,setCapabilities]=useState<Capability[]>([]),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const matches=host.saved.filter(s=>s.snapshot.courseLesson?.lessonRef.sha256===lesson.lessonRef.sha256&&s.snapshot.courseLesson.phase===phase&&s.snapshot.labSnapshot);
 const [selected,setSelected]=useState(matches[0]?.snapshot.labSnapshot?.configuration.modelId||models[lesson.id]?.[0]);
 useEffect(()=>{const c=new AbortController();setError('');void scienceApi.catalog(host.editionId,c.signal).then(d=>setCapabilities(d.capabilities)).catch(()=>{if(!c.signal.aborted)setError('Non riesco ad aprire i laboratori del corso.');});return()=>c.abort();},[host.editionId,retry]);
 if(!models[lesson.id])return null;
 const available=capabilities.filter(c=>c.fluidLab&&models[lesson.id].includes(c.fluidLab.modelId));
 const cap=available.find(c=>c.fluidLab?.modelId===selected);
 const saved=matches.find(s=>s.snapshot.capabilityId===cap?.id);
 return <section className="course-laboratories" aria-label="Laboratori della lezione"><h3>Metti alla prova il fenomeno</h3>
  {error?<><p role="alert">{error}</p><button onClick={()=>setRetry(x=>x+1)}>Riprova</button></>:!cap?<p role="status">Apro il laboratorio…</p>:<>
   {available.length>1&&<label>Fenomeno da esplorare<select value={selected} onChange={e=>{setSelected(e.target.value as typeof selected);onCommit?.(null);host.onInvalidated();}}>{available.map(c=><option key={c.id} value={c.fluidLab!.modelId}>{c.title}</option>)}</select></label>}
   <CoreFluidLab key={JSON.stringify([lesson.lessonRef,phase,cap.id,saved?.resource.id,saved?.resource.revisionId])} me={host.me} editionId={host.editionId} capability={cap} saved={saved} courseLesson={{lessonRef:lesson.lessonRef,phase,...(stepId?{stepId}:{})}} onCommit={onCommit} onSaved={host.onSaved} onInvalidated={host.onInvalidated}/>
  </>}
 </section>;
}
