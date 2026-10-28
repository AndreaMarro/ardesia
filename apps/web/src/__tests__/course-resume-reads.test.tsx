// @vitest-environment jsdom
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {CourseLearningWorkspace} from '../components/CourseLearningWorkspace';
import {scienceApi} from '../features/science-library/scienceApi';
import {StudyApiError,type StudyMe,type StudyResource} from '../api';
import type {SavedScience} from '../features/science-library/types';
import {beginStudySessionExchange} from '../../../studio/src/study/sessionBoundary';

const probe=vi.hoisted(()=>vi.fn());
vi.mock('../features/PublicCoursePlayer',()=>({CourseScope:(props:{course:{title:string};labHost?:{me:StudyMe;saved:SavedScience[]}})=>{
 probe(props);
 return <section aria-label="Corso riaperto"><h1>{props.course.title}</h1><pre data-testid="saved-configurations">{JSON.stringify(props.labHost?.saved||[])}</pre></section>;
}}));
const actor:StudyMe={id:'learner-a',role:'student',synthetic:true};
function resource(id:string,ownerId=actor.id,editionId='fluidi'):StudyResource{return{id,revisionId:'revision-'+id,contextId:'context-'+id,ownerId,editionId,kind:'science-resource',visibility:'private',text:'',sha256:'a'.repeat(64)};}
function saved(r:StudyResource,options:{supported?:boolean;lesson?:boolean}={}):SavedScience{return{
 resource:r,supported:options.supported??true,updatedAt:'2026-10-28T12:00:00Z',snapshot:{schemaVersion:1,capabilityId:'hydrostatic-lab-v1',capabilityVersion:options.supported===false?2:1,implementationSha256:'b'.repeat(64),parameters:{depth:4.2},prediction:'Previsione salvata '+r.id,note:'Ragionamento salvato '+r.id,...(options.lesson===false?{}:{courseLesson:{lessonRef:{id:'ds-2026-u3-02',version:1,sha256:'c'.repeat(64)},phase:'practice' as const,stepId:'comparison'}})}
};}
function deferred<T>(){let resolve!:(value:T)=>void;let reject!:(error:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
function courseResponse(title:string){return new Response(JSON.stringify({course:{title,pathId:'fluidi-termodinamica'}}));}
function openedSaved(){return JSON.parse(screen.getByTestId('saved-configurations').textContent||'[]') as SavedScience[];}
beforeEach(()=>{probe.mockClear();vi.stubGlobal('fetch',vi.fn(async()=>courseResponse('Fluidi riaperti')));});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});

test('reads seventeen exact revisions with at most four science requests in flight',async()=>{
 const resources=Array.from({length:17},(_,i)=>resource('saved-'+i));let active=0,maxActive=0;
 const pending:{finish:()=>void}[]=[];
 const read=vi.spyOn(scienceApi,'read').mockImplementation((ref,signal)=>{
  const r=resources.find(r=>r.id===ref.resourceId)!;expect(ref.revisionId).toBe(r.revisionId);expect(signal.aborted).toBe(false);
  active++;maxActive=Math.max(maxActive,active);const result=deferred<SavedScience>();
  pending.push({finish:()=>{active--;result.resolve(saved(r));}});return result.promise;
 });
 render(<CourseLearningWorkspace me={actor} editionId="fluidi" resources={resources} onCommit={vi.fn()}/>);
 await waitFor(()=>expect(read.mock.calls.length).toBeGreaterThanOrEqual(4));
 expect(read).toHaveBeenCalledTimes(4);expect(maxActive).toBe(4);expect(screen.queryByRole('region',{name:'Corso riaperto'})).toBeNull();
 while(read.mock.calls.length<resources.length||pending.length){await act(async()=>{pending.splice(0).forEach(item=>item.finish());});}
 await screen.findByRole('heading',{name:'Fluidi riaperti'});
 expect(maxActive).toBe(4);expect(active).toBe(0);expect(openedSaved()).toEqual(resources.map(r=>saved(r)));
 expect(new Set(read.mock.calls.map(([,signal])=>signal)).size).toBe(1);
});

test('any owned read failure closes the whole course; retry restores exact and unsupported revisions',async()=>{
 const current=resource('current'),generic=resource('generic'),historical=resource('historical');
 const owned=[current,generic,historical],resources=[...owned,resource('peer','learner-b'),resource('elsewhere',actor.id,'other-edition'),{...resource('plain-note'),kind:'notes'}];
 let retry=false;const signals:AbortSignal[]=[];
 const read=vi.spyOn(scienceApi,'read').mockImplementation(async(ref,signal)=>{
  signals.push(signal);const r=owned.find(r=>r.id===ref.resourceId)!;
  if(!retry&&r.id==='generic')throw new StudyApiError('database_unavailable',503);
  return saved(r,{lesson:r.id!=='generic',supported:r.id!=='historical'});
 });
 const onCommit=vi.fn();render(<CourseLearningWorkspace me={actor} editionId="fluidi" resources={resources} onCommit={onCommit}/>);
 await screen.findByRole('alert');expect(probe).not.toHaveBeenCalled();expect(screen.queryByRole('region',{name:'Corso riaperto'})).toBeNull();expect(onCommit).toHaveBeenLastCalledWith(null);
 expect(signals.every(s=>s.aborted)).toBe(true);
 retry=true;fireEvent.click(screen.getByRole('button',{name:'Riprova'}));
 await screen.findByRole('heading',{name:'Fluidi riaperti'});expect(screen.queryByRole('alert')).toBeNull();
 expect(openedSaved()).toEqual([saved(current),saved(historical,{supported:false})]);
 expect(read).toHaveBeenCalledTimes(6);expect(read.mock.calls.map(([ref])=>ref.resourceId)).not.toContain('peer');
});

test.each(['actor','edition'] as const)('a late old-%s read cannot replace the newly opened exact revisions',async boundary=>{
 const oldResource=resource('old'),oldRead=deferred<SavedScience>();let oldSignal!:AbortSignal;
 const nextActor=boundary==='actor'?{...actor,id:'learner-b'}:actor,nextEdition=boundary==='edition'?'other-edition':'fluidi';
 const nextResource=resource('new',nextActor.id,nextEdition);
 const read=vi.spyOn(scienceApi,'read').mockImplementation((ref,signal)=>{if(ref.resourceId===oldResource.id){oldSignal=signal;return oldRead.promise;}return Promise.resolve(saved(nextResource));});
 const onCommit=vi.fn();const view=render(<CourseLearningWorkspace me={actor} editionId="fluidi" resources={[oldResource]} onCommit={onCommit}/>);
 await waitFor(()=>expect(read).toHaveBeenCalledTimes(1));
 view.rerender(<CourseLearningWorkspace me={nextActor} editionId={nextEdition} resources={[nextResource]} onCommit={onCommit}/>);
 await screen.findByRole('heading',{name:'Fluidi riaperti'});expect(oldSignal.aborted).toBe(true);expect(openedSaved()).toEqual([saved(nextResource)]);
 await act(async()=>oldRead.resolve(saved(oldResource)));expect(openedSaved()).toEqual([saved(nextResource)]);
});

test('an already opened course is never painted with the next actor before new reads finish',async()=>{
 const oldResource=resource('old'),nextActor={...actor,id:'learner-b'},nextResource=resource('new',nextActor.id),nextRead=deferred<SavedScience>();
 const read=vi.spyOn(scienceApi,'read').mockImplementation(ref=>ref.resourceId===oldResource.id?Promise.resolve(saved(oldResource)):nextRead.promise);
 const onCommit=vi.fn();const view=render(<CourseLearningWorkspace me={actor} editionId="fluidi" resources={[oldResource]} onCommit={onCommit}/>);
 await screen.findByRole('heading',{name:'Fluidi riaperti'});probe.mockClear();
 view.rerender(<CourseLearningWorkspace me={nextActor} editionId="fluidi" resources={[nextResource]} onCommit={onCommit}/>);
 expect(probe).not.toHaveBeenCalled();expect(screen.queryByRole('region',{name:'Corso riaperto'})).toBeNull();
 await waitFor(()=>expect(read).toHaveBeenCalledTimes(2));await act(async()=>nextRead.resolve(saved(nextResource)));
 expect(openedSaved()).toEqual([saved(nextResource)]);expect(probe.mock.calls.every(([props])=>props.labHost.me.id===nextActor.id)).toBe(true);
});

test.each(['unmount','session'] as const)('an aborted %s batch cannot publish a late response or keep reading the queue',async boundary=>{
 const resources=Array.from({length:7},(_,i)=>resource('saved-'+i));const waits:{response:ReturnType<typeof deferred<SavedScience>>;r:StudyResource}[]=[];
 const read=vi.spyOn(scienceApi,'read').mockImplementation((ref)=>{const response=deferred<SavedScience>();waits.push({response,r:resources.find(r=>r.id===ref.resourceId)!});return response.promise;});
 const onCommit=vi.fn();const view=render(<CourseLearningWorkspace me={actor} editionId="fluidi" resources={resources} onCommit={onCommit}/>);
 await waitFor(()=>expect(read.mock.calls.length).toBeGreaterThanOrEqual(4));
 if(boundary==='unmount')view.unmount();else act(()=>{beginStudySessionExchange();});
 expect(read.mock.calls.every(([,signal])=>signal.aborted)).toBe(true);
 await act(async()=>waits.forEach(({response,r})=>response.resolve(saved(r))));
 expect(read).toHaveBeenCalledTimes(4);expect(probe).not.toHaveBeenCalled();expect(screen.queryByRole('region',{name:'Corso riaperto'})).toBeNull();expect(onCommit).toHaveBeenLastCalledWith(null);
});
