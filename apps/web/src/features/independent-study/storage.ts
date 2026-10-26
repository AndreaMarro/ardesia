import type {DraftScope,StudyState} from './types';
import {phaseLabels} from './modelLabels';
const prefix='ardesia.independent-study.v1.';
const key=(s:DraftScope)=>prefix+JSON.stringify(s);
export function saveDraft(s:DraftScope,d:{value:string;reasoning:string}){
 try{if(d.reasoning.length>4000||d.value.length>64)return false;localStorage.setItem(key(s),JSON.stringify(d));return true;}catch{return false;}
}
export function readDraft(s:DraftScope):{value:string;reasoning:string}|null{
 try{const raw=localStorage.getItem(key(s));if(!raw||raw.length>10000)return null;const d=JSON.parse(raw);return typeof d.value==='string'&&d.value.length<=64&&typeof d.reasoning==='string'&&d.reasoning.length<=4000?d:null;}catch{return null;}
}
export function eraseDraft(s:DraftScope){try{localStorage.removeItem(key(s));}catch{/* Device storage is optional. */}}

export type OfflineCopy={savedAt:number;state:StudyState;omissions:('simulation-result')[]};
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string';
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(text);
const scalar=(v:unknown)=>text(v)||finite(v);
const parameters=(v:unknown)=>object(v)&&Object.values(v).every(scalar);
const timestamp=(v:unknown)=>finite(v)&&Number.isFinite(new Date(v*1000).getTime());
const request=(v:unknown)=>v===null||object(v)&&text(v.text)&&text(v.status);

/** Validate only the offline rendering shape, not scientific meaning or access. */
function readableState(s:unknown,edition:string):s is StudyState{
 if(!object(s)||s.editionId!==edition||!text(s.id)||!text(s.revisionId)||!text(s.title)||!text(s.phase)
  ||!strings(s.phases)||!s.phases.every(p=>Object.hasOwn(phaseLabels,p))||!Object.hasOwn(phaseLabels,s.phase)||!s.phases.includes(s.phase)||!strings(s.prerequisites)||!strings(s.phaseSupport)
  ||!Number.isSafeInteger(s.cycle)||Number(s.cycle)<0||!text(s.diagnostic)||!finite(s.hintLevel)||!text(s.mastery)
  ||!Array.isArray(s.attempts)||s.attempts.length!==0||s.pendingAttempt!==null
  ||!text(s.reviewReason)||(s.reviewAt!==null&&!timestamp(s.reviewAt))||!request(s.tutorRequest)||!request(s.dispute))return false;
 if(!object(s.lessonRef)||!text(s.lessonRef.id)||!Number.isSafeInteger(s.lessonRef.version)||!text(s.lessonRef.sha256)
  ||!object(s.sourceRef)||!text(s.sourceRef.resourceId)||!text(s.sourceRef.revisionId)||!text(s.sourceRef.sha256))return false;
 if(s.source!==undefined&&(!object(s.source)||!strings(s.source.explanation)||!strings(s.source.recap)))return false;
 if(s.hints!==undefined&&!strings(s.hints))return false;
 if(s.task!==undefined&&(!object(s.task)||!text(s.task.prompt)||!text(s.task.unit)||!parameters(s.task.parameters)))return false;
 if(s.simulation!==undefined&&(!object(s.simulation)||!text(s.simulation.activityId)||!parameters(s.simulation.parameters)
  ||!object(s.simulation.controls)||!Object.values(s.simulation.controls).every(v=>Array.isArray(v)&&v.every(scalar))))return false;
 if(s.reviewScheduler!==undefined){
  const r=s.reviewScheduler;
  if(!object(r)||!text(r.engine)||!text(r.version)||r.basis!=='learner_self_report'||typeof r.rated!=='boolean'
   ||typeof r.canUndo!=='boolean'||(r.lastRating!==null&&!text(r.lastRating))||!text(r.explanation)
   ||!Array.isArray(r.choices)||!r.choices.every(c=>object(c)&&text(c.rating)&&text(c.label)&&timestamp(c.due))
   ||(r.manualOverride!==null&&(!object(r.manualOverride)||!text(r.manualOverride.basis)||!finite(r.manualOverride.days))))return false;
 }
 return true;
}

function offlineProjection(state:StudyState):Pick<OfflineCopy,'state'|'omissions'>{
 const safe={...state,attempts:[],pendingAttempt:null};
 if(!state.simulation)return {state:safe,omissions:[]};
 // A cached result is not a newly validated Core result. Keep the inputs and
 // make the omission explicit for the caller's offline notice, including v1 caches.
 const {result:_result,...inputs}=state.simulation;
 return {state:{...safe,simulation:inputs},omissions:['simulation-result']};
}
export function saveOffline(actor:string,edition:string,state:StudyState){
 try{const copy=offlineProjection(state);if(!readableState(copy.state,edition))return false;const text=JSON.stringify({savedAt:Date.now(),...copy});if(text.length>50000)return false;localStorage.setItem(prefix+'offline.'+JSON.stringify([actor,edition]),text);return true;}catch{return false;}
}
export function readOffline(actor:string,edition:string):OfflineCopy|null{
 try{const raw=localStorage.getItem(prefix+'offline.'+JSON.stringify([actor,edition]));if(!raw||raw.length>50000)return null;
  const d:unknown=JSON.parse(raw);if(!object(d)||!finite(d.savedAt)||!Number.isFinite(new Date(d.savedAt).getTime())||!readableState(d.state,edition))return null;
  return {savedAt:d.savedAt,...offlineProjection(d.state)};
 }catch{return null;}
}

function clearCopies(actor:string,edition?:string){
 try{
  const remove:string[]=[];
  for(let i=0;i<localStorage.length;i++){
   const candidate=localStorage.key(i);if(!candidate?.startsWith(prefix))continue;
   try{
    const suffix=candidate.slice(prefix.length);
    if(suffix.startsWith('offline.')){
     const scope:unknown=JSON.parse(suffix.slice('offline.'.length));
     if(Array.isArray(scope)&&scope.length===2&&scope[0]===actor&&text(scope[1])&&(edition===undefined||scope[1]===edition))remove.push(candidate);
    }else if(suffix.startsWith('{')){
     const scope:unknown=JSON.parse(suffix);
     if(object(scope)&&scope.actor===actor&&text(scope.edition)&&(edition===undefined||scope.edition===edition))remove.push(candidate);
    }
   }catch{/* Do not erase a malformed key whose ownership cannot be established. */}
  }
  remove.forEach(k=>localStorage.removeItem(k));
 }catch{/* Optional cache. */}
}
export function clearOffline(actor:string,edition:string){clearCopies(actor,edition);}
/** Root session boundary cleanup also covers study views already unmounted. */
export function clearActorOffline(actor:string){clearCopies(actor);}
