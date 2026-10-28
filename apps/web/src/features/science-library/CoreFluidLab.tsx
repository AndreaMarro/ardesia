import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {describeError,requestKey,type StudyMe} from '../../api';
import type {PostitReference,CourseLessonContext} from '../../../../studio/src/study/contracts';
import type {ActivityCommit} from '../../course';
import {FluidThermoActivity,newLabSnapshot,type LabSnapshot} from './FluidThermoActivity';
import {useCourseDraft} from '../../courseExitGuard';
import {isStudySessionEpoch,studySessionEpoch} from '../../../../studio/src/study/sessionBoundary';
import {scienceTimestamp} from './scienceTimestamp';
import {scienceApi} from './scienceApi';
import {scienceResourceHref} from './resourceNavigation';
import type {Capability,ResourceRef,SavedScience,ScienceApi,Snapshot} from './types';

const canonical=(v:unknown):string=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(canonical(x))):Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,JSON.parse(canonical(x))])):v);

type Props={me:StudyMe;editionId:string;capability:Capability;saved?:SavedScience;
 courseLesson?:CourseLessonContext;api?:ScienceApi;onCommit?:(v:ActivityCommit|null)=>void;
 onSaved?:(ref:PostitReference)=>void;onAcknowledged?:(value:SavedScience,previous:ResourceRef|null)=>boolean|void;onInvalidated?:()=>void};
/** The only persistence boundary is the existing versioned Core science resource. */
export function CoreFluidLab({me,editionId,capability,saved,courseLesson,api=scienceApi,onCommit,onSaved,onAcknowledged,onInvalidated}:Props){
 const [initial]=useState(()=>saved?.snapshot.labSnapshot||newLabSnapshot(capability.fluidLab!.modelId,{
  schemaVersion:1,modelId:capability.fluidLab!.modelId,modelVersion:1,
  parameters:Object.fromEntries(capability.parameters.map(p=>[p.key,p.default])),
  ...(courseLesson?{lessonRef:courseLesson.lessonRef}:{})}));
 const work=useCourseDraft('laboratory');
 const acknowledged=useRef(initial),latestSnapshot=useRef(initial);
 const controls=useRef<HTMLDivElement>(null);
 const confirmed=useRef(canonical({snapshot:initial,courseLesson:saved?saved.snapshot.courseLesson||null:courseLesson||null}));
 const [ref,setRef]=useState<ResourceRef|null>(saved?{resourceId:saved.resource.id,revisionId:saved.resource.revisionId}:null);
 const [notice,setNotice]=useState(''),[failure,setFailure]=useState(''),[blocked,setBlocked]=useState(false);
 const pending=useRef<{snapshot:Snapshot;ref:ResourceRef|null;key:string;edit:number;checkpoint:number;identity:string;epoch:number}|null>(null),edits=useRef(0),alive=useRef(true);
 const identity=JSON.stringify([me.id,me.role,editionId]),activeIdentity=useRef(identity);activeIdentity.current=identity;
 const request=useRef<AbortController|null>(null);
 const contextIdentity=JSON.stringify(courseLesson||null),activeContext=useRef(contextIdentity);
 // A reader step can change while the same laboratory keeps its open draft.
 // Advance synchronously so an old response cannot attach after that render.
 if(activeContext.current!==contextIdentity){activeContext.current=contextIdentity;edits.current++;}
 function invalidate(){work.changed();edits.current++;setNotice('');onCommit?.(null);onInvalidated?.();}
 // The plugin retains its last valid snapshot while raw parameter text can differ.
 // An unrelated view event must not acknowledge text absent from that snapshot.
 function rawParametersMatch(snapshot:LabSnapshot){
  return !!controls.current&&Array.from(controls.current.querySelectorAll<HTMLInputElement|HTMLSelectElement>('input[type="number"],select[id]')).every(input=>
   input.value.trim()!==''&&input.validity.valid&&Object.entries(snapshot.configuration.parameters).some(([key,value])=>input.id.endsWith('-'+key)&&Number(input.value)===value));
 }
 function confirmUnchanged(snapshot:LabSnapshot){if(rawParametersMatch(snapshot)&&canonical({snapshot,courseLesson:courseLesson||null})===confirmed.current)work.confirm(work.checkpoint());}
 // A confirmed reset updates controlled inputs in the same render batch.
 useLayoutEffect(()=>{if(work.dirty)confirmUnchanged(latestSnapshot.current);});
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current?.abort();};},[]);
 useLayoutEffect(()=>{if(canonical({snapshot:initial,courseLesson:courseLesson||null})!==confirmed.current)work.changed();},[contextIdentity]);
 const readonly=saved&&(saved.resource.ownerId!==me.id||!saved.supported||saved.snapshot.implementationSha256!==capability.implementationSha256||saved.snapshot.capabilityVersion!==capability.version);
 async function save(snapshot:LabSnapshot){
  if(blocked)throw Error('Riapri la revisione corrente prima di salvare.');
  if(!pending.current)pending.current={snapshot:{schemaVersion:1,capabilityId:capability.id,capabilityVersion:capability.version,
   implementationSha256:capability.implementationSha256,parameters:{...snapshot.configuration.parameters},prediction:snapshot.prediction,
   note:snapshot.note,supportUsed:[...snapshot.supportUsed],labSnapshot:structuredClone(snapshot),...(courseLesson?{courseLesson}:{})},ref,key:requestKey(),edit:edits.current,checkpoint:work.checkpoint(),identity,epoch:studySessionEpoch()};
  const frozen=pending.current,controller=new AbortController();request.current=controller;setFailure('');setNotice('');
  try{
   if(frozen.identity!==activeIdentity.current||!isStudySessionEpoch(frozen.epoch))throw Error('Operazione interrotta.');
   const answer=await api.save(editionId,frozen.snapshot,frozen.key,frozen.ref,controller.signal);
   if(!alive.current||controller.signal.aborted||frozen.identity!==activeIdentity.current||!isStudySessionEpoch(frozen.epoch))throw Error('Operazione interrotta.');
   if(answer.resource.ownerId!==me.id||answer.resource.editionId!==editionId||answer.resource.kind!=='science-resource'||answer.resource.visibility!=='private'||!answer.resource.id?.trim()||!answer.resource.revisionId?.trim()||!answer.resource.contextId?.trim()||(frozen.ref&&answer.resource.id!==frozen.ref.resourceId)||canonical(answer.snapshot)!==canonical(frozen.snapshot)||canonical(JSON.parse(answer.resource.text))!==canonical(answer.snapshot))throw Error('Risposta di salvataggio incompatibile.');
   // Publish the confirmed resource even when newer edits stay dirty. Attaching
   // it as a submission source below still requires the matching edit generation.
   if(onAcknowledged?.(answer,frozen.ref)===false)throw Error('stale_revision');
   const next={resourceId:answer.resource.id,revisionId:answer.resource.revisionId};setRef(next);pending.current=null;
   if(edits.current===frozen.edit){acknowledged.current=frozen.snapshot.labSnapshot!;confirmed.current=canonical({snapshot:frozen.snapshot.labSnapshot,courseLesson:frozen.snapshot.courseLesson||null});work.confirm(frozen.checkpoint);setNotice('Configurazione e ragionamento salvati.'+(answer.updatedAt?' '+new Date(scienceTimestamp(answer.updatedAt)).toLocaleString('it-IT')+'.':''));onSaved?.({...next,contextId:answer.resource.contextId});}
   else {setNotice('Salvata la versione in attesa. Le modifiche aperte restano da salvare.');throw Error('Le modifiche aperte sono ancora da salvare.');}
  }catch(error){
   if(alive.current&&!controller.signal.aborted){const code=error instanceof Error?error.message:'';
    if(/revision|conflict|stale/.test(code)){setBlocked(true);setFailure('Un’altra scheda ha aggiornato questa risorsa. Il testo aperto resta qui. Riapri la revisione corrente prima di salvare.');}
    else setFailure(describeError(error,'Salvataggio non confermato. Riprova: la richiesta in attesa conserva gli stessi dati.'));}
   throw error;
  }
 }
 if(readonly)return <section><h3>Revisione conservata</h3><p>Configurazione in sola lettura. Il modello non viene eseguito.</p><p>Previsione: {saved.snapshot.prediction}</p><p>{saved.snapshot.note}</p><details><summary>Dati conservati</summary><pre>{JSON.stringify(saved.snapshot.labSnapshot||saved.snapshot.parameters,null,2)}</pre></details></section>;
 return <><div ref={controls} onClickCapture={event=>{const button=event.target instanceof Element?event.target.closest('button'):null;if(button?.textContent==='Ripristina lo scenario'&&!work.allowDiscard()){event.preventDefault();event.stopPropagation();}}} onChangeCapture={event=>{const target=event.target;if(target instanceof HTMLSelectElement&&target.closest('label')?.textContent?.startsWith('Scenario riproducibile')&&!work.allowDiscard()){event.preventDefault();event.stopPropagation();target.value='';return;}invalidate();}}><FluidThermoActivity initialSnapshot={initial} onSnapshotChange={snapshot=>{latestSnapshot.current=snapshot;invalidate();confirmUnchanged(snapshot);}}
  onInteraction={event=>{if(event.type==='compare'){const checkpoint=work.checkpoint(),compared=structuredClone(latestSnapshot.current);onCommit?.({activityId:capability.id,parameters:event.parameters,prediction:event.prediction,courseLesson,confirmDraft:()=>{const covered=(s:LabSnapshot)=>canonical({note:s.note,view:s.view,supportUsed:s.supportUsed});if(covered(compared)===covered(acknowledged.current)){acknowledged.current=compared;confirmed.current=canonical({snapshot:compared,courseLesson:courseLesson||null});work.confirm(checkpoint);}}});}else onCommit?.(null);}}
  onSave={save}/></div>
  {work.dirty&&<p role="status">Le modifiche del laboratorio non sono ancora tutte salvate. Salva la configurazione prima di uscire per ritrovare anche osservazioni e aiuti.</p>}
  {notice&&<p role="status">{notice}</p>}{failure&&<p role="alert">{failure}</p>}
  {ref&&<a href={scienceResourceHref(editionId,ref)}>Riapri questa revisione salvata</a>}
 </>;
}
