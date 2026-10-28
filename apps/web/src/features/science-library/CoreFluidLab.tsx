import {useEffect,useRef,useState} from 'react';
import {describeError,requestKey,type StudyMe} from '../../api';
import type {PostitReference,CourseLessonContext} from '../../../../studio/src/study/contracts';
import type {ActivityCommit} from '../../course';
import {FluidThermoActivity,newLabSnapshot,type LabSnapshot} from './FluidThermoActivity';
import {scienceApi} from './scienceApi';
import {scienceResourceHref} from './resourceNavigation';
import type {Capability,ResourceRef,SavedScience,ScienceApi,Snapshot} from './types';

const canonical=(v:unknown):string=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(canonical(x))):Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,JSON.parse(canonical(x))])):v);

type Props={me:StudyMe;editionId:string;capability:Capability;saved?:SavedScience;
 courseLesson?:CourseLessonContext;api?:ScienceApi;onCommit?:(v:ActivityCommit|null)=>void;
 onSaved?:(ref:PostitReference)=>void;onInvalidated?:()=>void};
/** The only persistence boundary is the existing versioned Core science resource. */
export function CoreFluidLab({me,editionId,capability,saved,courseLesson,api=scienceApi,onCommit,onSaved,onInvalidated}:Props){
 const [initial]=useState(()=>saved?.snapshot.labSnapshot||newLabSnapshot(capability.fluidLab!.modelId,{
  schemaVersion:1,modelId:capability.fluidLab!.modelId,modelVersion:1,
  parameters:Object.fromEntries(capability.parameters.map(p=>[p.key,p.default])),
  ...(courseLesson?{lessonRef:courseLesson.lessonRef}:{})}));
 const [ref,setRef]=useState<ResourceRef|null>(saved?{resourceId:saved.resource.id,revisionId:saved.resource.revisionId}:null);
 const [notice,setNotice]=useState(''),[failure,setFailure]=useState(''),[blocked,setBlocked]=useState(false);
 const pending=useRef<{snapshot:Snapshot;ref:ResourceRef|null;key:string;edit:number}|null>(null),edits=useRef(0),alive=useRef(true);
 const request=useRef<AbortController|null>(null);
 const contextIdentity=JSON.stringify(courseLesson||null),activeContext=useRef(contextIdentity);
 // A reader step can change while the same laboratory keeps its open draft.
 // Advance synchronously so an old response cannot attach after that render.
 if(activeContext.current!==contextIdentity){activeContext.current=contextIdentity;edits.current++;}
 function invalidate(){edits.current++;setNotice('');onCommit?.(null);onInvalidated?.();}
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current?.abort();};},[]);
 const readonly=saved&&(saved.resource.ownerId!==me.id||!saved.supported||saved.snapshot.implementationSha256!==capability.implementationSha256||saved.snapshot.capabilityVersion!==capability.version);
 async function save(snapshot:LabSnapshot){
  if(blocked)throw Error('Riapri la revisione corrente prima di salvare.');
  if(!pending.current)pending.current={snapshot:{schemaVersion:1,capabilityId:capability.id,capabilityVersion:capability.version,
   implementationSha256:capability.implementationSha256,parameters:{...snapshot.configuration.parameters},prediction:snapshot.prediction,
   note:snapshot.note,supportUsed:[...snapshot.supportUsed],labSnapshot:structuredClone(snapshot),...(courseLesson?{courseLesson}:{})},ref,key:requestKey(),edit:edits.current};
  const frozen=pending.current,controller=new AbortController();request.current=controller;setFailure('');setNotice('');
  try{
   const answer=await api.save(editionId,frozen.snapshot,frozen.key,frozen.ref,controller.signal);
   if(!alive.current||controller.signal.aborted)throw Error('Operazione interrotta.');
   if(answer.resource.ownerId!==me.id||answer.resource.editionId!==editionId||answer.resource.kind!=='science-resource'||canonical(answer.snapshot)!==canonical(frozen.snapshot))throw Error('Risposta di salvataggio incompatibile.');
   const next={resourceId:answer.resource.id,revisionId:answer.resource.revisionId};setRef(next);pending.current=null;
   if(edits.current===frozen.edit){setNotice('Configurazione e ragionamento salvati.'+(answer.updatedAt?' '+new Date(answer.updatedAt).toLocaleString('it-IT')+'.':''));onSaved?.({...next,contextId:answer.resource.contextId});}
   else {setNotice('Salvata la versione in attesa. Le modifiche aperte restano da salvare.');throw Error('Le modifiche aperte sono ancora da salvare.');}
  }catch(error){
   if(alive.current&&!controller.signal.aborted){const code=error instanceof Error?error.message:'';
    if(/revision|conflict|stale/.test(code)){setBlocked(true);setFailure('Un’altra scheda ha aggiornato questa risorsa. Il testo aperto resta qui. Riapri la revisione corrente prima di salvare.');}
    else setFailure(describeError(error,'Salvataggio non confermato. Riprova: la richiesta in attesa conserva gli stessi dati.'));}
   throw error;
  }
 }
 if(readonly)return <section><h3>Revisione conservata</h3><p>Configurazione in sola lettura. Il modello non viene eseguito.</p><p>Previsione: {saved.snapshot.prediction}</p><p>{saved.snapshot.note}</p><details><summary>Dati conservati</summary><pre>{JSON.stringify(saved.snapshot.labSnapshot||saved.snapshot.parameters,null,2)}</pre></details></section>;
 return <><div onChangeCapture={invalidate}><FluidThermoActivity initialSnapshot={initial} onSnapshotChange={invalidate}
  onInteraction={event=>{if(event.type==='compare')onCommit?.({activityId:capability.id,parameters:event.parameters,prediction:event.prediction,courseLesson});else onCommit?.(null);}}
  onSave={save}/></div>
  {notice&&<p role="status">{notice}</p>}{failure&&<p role="alert">{failure}</p>}
  {ref&&<a href={scienceResourceHref(editionId,ref)}>Riapri questa revisione salvata</a>}
 </>;
}
