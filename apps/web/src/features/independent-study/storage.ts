import type {DraftScope,StudyState} from './types';
const prefix='ardesia.independent-study.v1.';
const key=(s:DraftScope)=>prefix+JSON.stringify(s);
export function saveDraft(s:DraftScope,d:{value:string;reasoning:string}){
 try{if(d.reasoning.length>4000||d.value.length>64)return false;localStorage.setItem(key(s),JSON.stringify(d));return true;}catch{return false;}
}
export function readDraft(s:DraftScope):{value:string;reasoning:string}|null{
 try{const raw=localStorage.getItem(key(s));if(!raw||raw.length>10000)return null;const d=JSON.parse(raw);return typeof d.value==='string'&&d.value.length<=64&&typeof d.reasoning==='string'&&d.reasoning.length<=4000?d:null;}catch{return null;}
}
export function eraseDraft(s:DraftScope){try{localStorage.removeItem(key(s));}catch{/* Device storage is optional. */}}
export function saveOffline(actor:string,edition:string,state:StudyState){
 try{const safe={...state,attempts:[],pendingAttempt:null};const text=JSON.stringify({savedAt:Date.now(),state:safe});if(text.length>50000)return false;localStorage.setItem(prefix+'offline.'+JSON.stringify([actor,edition]),text);return true;}catch{return false;}
}
export function readOffline(actor:string,edition:string):{savedAt:number;state:StudyState}|null{
 try{const raw=localStorage.getItem(prefix+'offline.'+JSON.stringify([actor,edition]));if(!raw||raw.length>50000)return null;const d=JSON.parse(raw);const s=d.state;const strings=(v:unknown)=>Array.isArray(v)&&v.every(x=>typeof x==='string');if(!s||s.editionId!==edition||typeof s.id!=='string'||typeof s.revisionId!=='string'||typeof s.lessonRef?.sha256!=='string'||!Number.isFinite(d.savedAt)||!strings(s.phases)||!strings(s.prerequisites)||!strings(s.phaseSupport)||!Array.isArray(s.attempts)||s.attempts.length!==0||s.pendingAttempt!==null||typeof s.title!=='string'||typeof s.phase!=='string'||!s.phases.includes(s.phase)||typeof s.sourceRef?.revisionId!=='string'||typeof s.sourceRef?.resourceId!=='string'||s.source&&(!strings(s.source.explanation)||!strings(s.source.recap))||s.hints&&!strings(s.hints)||s.task&&(typeof s.task.prompt!=='string'||typeof s.task.unit!=='string'||!s.task.parameters||typeof s.task.parameters!=='object')||s.simulation&&(!s.simulation.parameters||!s.simulation.controls))return null;return d;}catch{return null;}
}
export function clearOffline(actor:string,edition:string){
 try{
  localStorage.removeItem(prefix+'offline.'+JSON.stringify([actor,edition]));
  const remove:string[]=[];
  for(let i=0;i<localStorage.length;i++){
   const candidate=localStorage.key(i);if(!candidate?.startsWith(prefix+'{'))continue;
   try{const scope=JSON.parse(candidate.slice(prefix.length));if(scope.actor===actor&&scope.edition===edition)remove.push(candidate);}catch{/* Ignore unrelated malformed storage. */}
  }
  remove.forEach(k=>localStorage.removeItem(k));
 }catch{/* Optional cache. */}
}
