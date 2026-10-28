import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';

export type CourseDraftPart='lesson'|'laboratory'|'assessment';
export type CourseDraftScope={enabled:boolean;identity:symbol};
type Draft={scope:CourseDraftScope;part:CourseDraftPart;generation:number;dirty:boolean;mounted:boolean;notify:()=>void};
const Scope=createContext<CourseDraftScope|null>(null);
const mountedDrafts=new Set<Draft>();
const message='Ci sono modifiche non ancora salvate o consegnate. Vuoi uscire e perderle?';
let listening=false;
const dirtyDrafts=()=>[...mountedDrafts].filter(d=>d.mounted&&d.scope.enabled&&d.dirty);
function unload(event:BeforeUnloadEvent){if(dirtyDrafts().length){event.preventDefault();event.returnValue='';}}
function followLink(event:MouseEvent){
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
 if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
 const target=new URL(link.href,location.href);
 if(!['http:','https:'].includes(target.protocol))return;
 if(target.origin===location.origin&&target.pathname===location.pathname&&target.search===location.search)return;
 if(!confirmCourseExit()){event.preventDefault();event.stopPropagation();}
}
function syncListeners(){
 const needed=dirtyDrafts().length>0;
 if(needed===listening)return;
 listening=needed;
 if(needed){window.addEventListener('beforeunload',unload);document.addEventListener('click',followLink,true);}
 else{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',followLink,true);}
}
function clear(draft:Draft){draft.generation++;draft.dirty=false;draft.notify();}
/** Ephemeral UI checks only: these entries contain no response, progress or receipt. */
export function confirmCourseExit(scope?:CourseDraftScope|null,parts?:CourseDraftPart[]):boolean{
 const drafts=dirtyDrafts().filter(d=>(!scope||d.scope===scope)&&(!parts||parts.includes(d.part)));
 if(!drafts.length)return true;
 if(!window.confirm(message))return false;
 drafts.forEach(clear);syncListeners();return true;
}
export const createCourseDraftScope=(enabled=true):CourseDraftScope=>({enabled,identity:Symbol('course-draft')});
export function CourseDraftBoundary({scope,children}:{scope:CourseDraftScope;children:ReactNode}){return <Scope.Provider value={scope}>{children}</Scope.Provider>;}
export const useCourseDraftScope=()=>useContext(Scope);
export function useCourseDraft(part:CourseDraftPart){
 const parent=useCourseDraftScope(),local=useRef(createCourseDraftScope()),[,render]=useState(0);
 const ref=useRef<Draft|null>(null);
 if(!ref.current)ref.current={scope:parent||local.current,part,generation:0,dirty:false,mounted:false,notify:()=>{}};
 const draft=ref.current;
 useEffect(()=>{
  draft.mounted=true;draft.notify=()=>{if(draft.mounted)render(n=>n+1);};mountedDrafts.add(draft);syncListeners();
  return()=>{draft.mounted=false;draft.dirty=false;draft.generation++;draft.notify=()=>{};mountedDrafts.delete(draft);syncListeners();};
 },[draft]);
 const api=useRef({
  changed(){if(!draft.scope.enabled)return;draft.generation++;if(!draft.dirty){draft.dirty=true;draft.notify();}syncListeners();},
  checkpoint:()=>draft.generation,
  confirm(generation:number){if(draft.mounted&&draft.generation===generation){draft.dirty=false;draft.notify();syncListeners();}},
  get dirty(){return draft.dirty;},
  allowDiscard(parts:CourseDraftPart[]=[part]){return confirmCourseExit(draft.scope,parts);},
 });
 return api.current;
}

// History positions let a cancelled Back/Forward restore the original entry.
const historyKey='ardesiaCourseExitIndex';
let position:number|undefined,lastURL='',restoring=false;
const state=()=>history.state&&typeof history.state==='object'?history.state:{};
function ensurePosition(){
 if(position===undefined){position=typeof state()[historyKey]==='number'?state()[historyKey]:0;history.replaceState({...state(),[historyKey]:position},'',location.href);}
 lastURL=location.href;
}
export function pushCourseHistory(url:URL|string){ensurePosition();position=(position??0)+1;history.pushState({...state(),[historyKey]:position},'',url);lastURL=location.href;}
export function replaceCourseHistory(url:URL|string){ensurePosition();history.replaceState({...state(),[historyKey]:position},'',url);lastURL=location.href;}
export function initializeCourseHistory(){ensurePosition();}
export function acceptCoursePop(event:PopStateEvent):boolean{
 if(restoring){restoring=false;return false;}
 const next=typeof event.state?.[historyKey]==='number'?event.state[historyKey] as number:undefined;
 const previousURL=lastURL;
 if(previousURL){const a=new URL(previousURL),b=new URL(location.href);if(a.pathname===b.pathname&&a.search===b.search){position=next??position;lastURL=location.href;return true;}}
 if(!confirmCourseExit()){
  if(position!==undefined&&next!==undefined&&position!==next){restoring=true;history.go(position-next);}
  else if(previousURL)history.replaceState({...state(),[historyKey]:position},'',previousURL);
  return false;
 }
 position=next??position;lastURL=location.href;return true;
}
