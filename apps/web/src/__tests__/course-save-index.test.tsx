// @vitest-environment jsdom
import {afterEach,beforeAll,beforeEach,expect,test,vi} from 'vitest';
import {act,cleanup,fireEvent,render,renderHook,screen,waitFor} from '@testing-library/react';
import App from '../App';
import {useCourseWorkspace} from '../useCourseWorkspace';
import {learningCourses,type CourseRecord} from '../courseLearning';
import {getLab} from '../features/science-library/FluidThermoActivity';
import {CoreFluidLab} from '../features/science-library/CoreFluidLab';
import type {Capability,SavedScience,Snapshot,ScienceApi} from '../features/science-library/types';
import type {StudyMe,Workspace} from '../api';
import {beginStudySessionExchange,studySessionEpoch} from '../../../studio/src/study/sessionBoundary';
import {installPublicBrowserStorage} from './public-storage-fixture';

// Exercise real App -> Classroom -> CourseScope -> CoreFluidLab persistence and
// navigation. The unrelated destination panels have no role in the ACK path.
vi.mock('../features/Work',()=>({Work:()=> <h1>Il mio lavoro aperto</h1>}));
vi.mock('../features/learning-insights/LearningInsights',()=>({LearningInsights:()=>null}));
const me:StudyMe={id:'save-index-learner',role:'student',synthetic:true};
const definition=getLab('hydrostatic');
const capability:Capability={id:'hydrostatic-lab-v1',version:1,implementationSha256:'b'.repeat(64),title:definition.title,
 fluidLab:{modelId:'hydrostatic',pluginId:'io.ardesia.fluid-thermo',pluginVersion:'1.0.0',modelVersion:1},
 primaryOutput:{label:'Pressione',unit:'Pa'},domain:'Ideale',explanation:[],transfer:{},distribution:'BUNDLED_FIRST_PARTY',editorialStatus:'DRAFT',
 parameters:definition.parameters.map(p=>({key:p.key,label:p.label,unit:p.unit,default:p.default,minimum:p.min,maximum:p.max}))};
const manometer=getLab('manometer'),defaultCapability:Capability={...capability,id:'manometer-lab-v1',title:manometer.title,fluidLab:{...capability.fluidLab!,modelId:'manometer'},parameters:manometer.parameters.map(p=>({key:p.key,label:p.label,unit:p.unit,default:p.default,minimum:p.min,maximum:p.max}))};
const lessonRef={id:'ds-2026-u3-02',version:1,sha256:'a'.repeat(64)};
const edition=(id='fluidi')=>({id,title:'Corso '+id,teacherId:'teacher',capacity:10,priceMinor:0,state:'running',sessions:[],timezone:'Europe/Rome',courseId:'fluidi-termodinamica',packId:'sf-fluidi-termodinamica-v1',packVersion:1,packSha256:'a'.repeat(64)});
const workspace=(id='fluidi'):Workspace=>({edition:edition(id),enrolled:true,resources:[],submissions:[],layouts:[],layoutSaved:false,layoutVersion:'layout'});
const json=(value:unknown)=>new Response(JSON.stringify(value));
function course(){
 const result=structuredClone(learningCourses.courses.find(c=>c.pathId==='fluidi-termodinamica')!) as CourseRecord;
 result.lessons=[{...result.lessons[0],id:lessonRef.id,lessonRef,title:'Fluidi in quiete',activityId:'course-reasoning-v1',modelCases:undefined,controls:undefined,
  practice:{prompt:'Spiega il vincolo.'},transfer:{prompt:'Spiega il nuovo vincolo.'},learningSequence:[{id:'prediction',kind:'prediction',title:'Prevedi',prompt:'Prevedi prima di provare.'}]}];
 result.editorialMaterials=null;result.assessmentItems=[];result.diagnosticItems=[];return result;
}
function answer(snapshot:Snapshot,revisionId='ack-revision'):SavedScience{return{snapshot:structuredClone(snapshot),supported:true,updatedAt:'2026-10-28T15:00:00Z',
 resource:{id:'ack-resource',revisionId,contextId:'ack-context',ownerId:me.id,editionId:'fluidi',kind:'science-resource',visibility:'private',text:JSON.stringify(snapshot),sha256:'c'.repeat(64)}};}
const snapshot:Snapshot={schemaVersion:1,capabilityId:capability.id,capabilityVersion:1,implementationSha256:capability.implementationSha256,parameters:{depth:3.7},prediction:'',note:'Nota confermata',courseLesson:{lessonRef,phase:'practice',stepId:'prediction'}};
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
const note=()=>screen.getByLabelText('Osservazioni') as HTMLTextAreaElement;
let saved:SavedScience|undefined;
let saveResponse:((body:{snapshot:Snapshot;expectedRevision?:string})=>Promise<Response>)|undefined;
let requests:{path:string;body?:{snapshot:Snapshot;expectedRevision?:string}}[];
// Module compilation is outside the behavior under test; keep the real lazy
// consumers, but finish their first import before timing rendered assertions.
beforeAll(async()=>{await import('../features/Classroom');await import('../components/CourseLearningWorkspace');});
beforeEach(()=>{
 saved=undefined;saveResponse=undefined;requests=[];installPublicBrowserStorage();vi.stubGlobal('scrollTo',vi.fn());vi.spyOn(window,'confirm').mockReturnValue(false);
 history.replaceState(null,'','/?view=classroom&edition=fluidi');
 vi.stubGlobal('fetch',vi.fn(async(path:string,init?:RequestInit)=>{
  const body=init?.body?JSON.parse(String(init.body)):undefined;requests.push({path,body});
  if(path==='/study/me')return json(me);
  if(path.startsWith('/study/editions?'))return json({items:[edition(),edition('other')],nextCursor:null});
  if(path.startsWith('/study/workspace?'))return json(workspace(new URL(path,'http://localhost').searchParams.get('editionId')!));
  if(path.startsWith('/study/course-learning?'))return json({course:course()});
  if(path.endsWith('/science-library/catalog'))return json({schemaVersion:1,capabilities:[defaultCapability,capability],courses:[],referenceScope:'capability-definition'});
  if(path.includes('/science-library/resources/')&&init?.method!=='POST'){expect(path).toBe('/study/science-library/resources/'+saved!.resource.id+'?revisionId='+saved!.resource.revisionId);return json(saved);}
  if(path.includes('/science-library/resources')&&init?.method==='POST'){
   if(saveResponse)return saveResponse(body);
   saved=answer(body.snapshot,saved?'ack-revision-2':'ack-revision');return json(saved);
  }
  return json({items:[],entries:[],sources:[]});
 }));
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();history.replaceState(null,'','/');});
async function returnThroughWork(){
 fireEvent.click(screen.getByRole('button',{name:/^Il mio lavoro/}));await screen.findByRole('heading',{name:'Il mio lavoro aperto'});
 fireEvent.click(screen.getByRole('button',{name:/^Lezione/}));await screen.findByRole('heading',{name:'Fluidi in quiete'});await screen.findByLabelText('Osservazioni');
}
async function openLaboratory(){
 await screen.findByRole('button',{name:/Esci dall’account/});await screen.findByRole('heading',{name:'Fluidi in quiete'});
 await screen.findByLabelText('Fenomeno da esplorare');fireEvent.change(screen.getByLabelText('Fenomeno da esplorare'),{target:{value:'hydrostatic'}});await screen.findByLabelText('Profondità [m]');
}
test('an actual save ACK enters the workspace index before Work -> Lezione without reload',async()=>{
 render(<App/>);await openLaboratory();
 fireEvent.change(screen.getByLabelText('Profondità [m]'),{target:{value:'3.7'}});fireEvent.change(note(),{target:{value:'Nota B confermata prima del ritorno'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));await screen.findByText(/Configurazione e ragionamento salvati/);
 await returnThroughWork();expect(note().value).toBe('Nota B confermata prima del ritorno');expect(screen.getByLabelText('Profondità [m]')).toHaveProperty('value','3.7');
 expect(requests.filter(r=>r.path.startsWith('/study/workspace?'))).toHaveLength(1);expect(requests.filter(r=>r.path.startsWith('/study/science-library/resources/')).map(r=>r.path)).toEqual(['/study/science-library/resources/ack-resource?revisionId=ack-revision']);
 expect(window.confirm).not.toHaveBeenCalled();
});
test('a delayed A ACK indexes confirmed A while preserving open B, then saving B revises A exactly',async()=>{
 const pending=deferred<Response>();saveResponse=async body=>{saved=answer(body.snapshot);return pending.promise;};
 render(<App/>);await openLaboratory();fireEvent.change(note(),{target:{value:'Nota A in attesa'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));await waitFor(()=>expect(saved).toBeTruthy());fireEvent.change(note(),{target:{value:'Nota B ancora aperta'}});
 const originalTextarea=note();await act(async()=>pending.resolve(json(saved)));await screen.findByText(/Salvata la versione in attesa/);
 expect(note()).toBe(originalTextarea);expect(note().value).toBe('Nota B ancora aperta');expect(screen.queryByText('Configurazione collegata alla prossima consegna.')).toBeNull();
 const exit=new Event('beforeunload',{cancelable:true});window.dispatchEvent(exit);expect(exit.defaultPrevented).toBe(true);
 saveResponse=undefined;fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));await screen.findByText(/Configurazione e ragionamento salvati/);
 const writes=requests.filter(r=>r.body?.snapshot);expect(writes[1].path).toBe('/study/editions/fluidi/science-library/resources/ack-resource/revise');expect(writes[1].body?.expectedRevision).toBe('ack-revision');expect(writes[1].body?.snapshot.note).toBe('Nota B ancora aperta');
 await returnThroughWork();expect(note().value).toBe('Nota B ancora aperta');
 expect(requests.some(r=>r.path==='/study/science-library/resources/ack-resource?revisionId=ack-revision-2')).toBe(true);
});
test('discarding newer B after a delayed A ACK reopens confirmed A without a cold reload',async()=>{
 const pending=deferred<Response>();saveResponse=async body=>{saved=answer(body.snapshot);return pending.promise;};
 render(<App/>);await openLaboratory();fireEvent.change(note(),{target:{value:'A realmente confermata'}});fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
 await waitFor(()=>expect(saved).toBeTruthy());fireEvent.change(note(),{target:{value:'B da scartare esplicitamente'}});await act(async()=>pending.resolve(json(saved)));await screen.findByText(/Salvata la versione in attesa/);
 vi.mocked(window.confirm).mockReturnValue(true);await returnThroughWork();expect(note().value).toBe('A realmente confermata');expect(window.confirm).toHaveBeenCalledTimes(1);
});
test.each(['peer','edition','kind','visibility','reference','empty-revision'] as const)('rejects a %s resource ACK at the existing index boundary',async bad=>{
 const {result}=renderHook(()=>useCourseWorkspace(me));await waitFor(()=>expect(result.current.data?.edition.id).toBe('fluidi'));
 const ack=answer(snapshot);const previous={resourceId:'ack-resource',revisionId:'prior-revision'};
 if(bad==='peer')ack.resource.ownerId='another-learner';if(bad==='edition')ack.resource.editionId='other';if(bad==='kind')ack.resource.kind='notes';if(bad==='visibility')ack.resource.visibility='group';if(bad==='reference')previous.resourceId='different-resource';if(bad==='empty-revision')ack.resource.revisionId='';
 act(()=>result.current.acknowledgeScienceResource(ack,previous));expect(result.current.data?.resources).toEqual([]);
});
test.each(['actor','role','edition','epoch'] as const)('a stale %s callback cannot insert an old ACK into the workspace cache',async boundary=>{
 const {result,rerender}=renderHook(({actor,sessionVersion})=>useCourseWorkspace(actor,sessionVersion),{initialProps:{actor:me,sessionVersion:studySessionEpoch()}});
 await waitFor(()=>expect(result.current.data?.edition.id).toBe('fluidi'));const old=result.current.acknowledgeScienceResource;
 if(boundary==='edition'){act(()=>result.current.selectEdition('other'));await waitFor(()=>expect(result.current.data?.edition.id).toBe('other'));}
 else if(boundary==='epoch')act(()=>{beginStudySessionExchange();});
 else {rerender({actor:boundary==='actor'?{...me,id:'next-learner'}:{...me,role:'teacher'},sessionVersion:studySessionEpoch()});await waitFor(()=>expect(result.current.data?.edition.id).toBe('fluidi'));}
 act(()=>old(answer(snapshot),null));expect(result.current.data?.resources).toEqual([]);
});
test('an ACK updates both current data and the bounded cache and cannot be overtaken by a stale workspace read',async()=>{
 const {result}=renderHook(()=>useCourseWorkspace(me));await waitFor(()=>expect(result.current.data?.edition.id).toBe('fluidi'));
 const pending=deferred<Response>(),fetch=vi.mocked(globalThis.fetch),original=fetch.getMockImplementation()!;
 fetch.mockImplementation((path,init)=>String(path).startsWith('/study/workspace?editionId=fluidi')?pending.promise:original(path,init));
 let refresh!:Promise<void>;act(()=>{refresh=result.current.refresh();});await waitFor(()=>expect(result.current.loading).toBe(true));
 const ack=answer(snapshot);act(()=>result.current.acknowledgeScienceResource(ack,null));expect(result.current.data?.resources).toEqual([ack.resource]);
 await act(async()=>{pending.resolve(json(workspace()));await refresh;});expect(result.current.data?.resources).toEqual([ack.resource]);
 act(()=>result.current.selectEdition('other'));await waitFor(()=>expect(result.current.data?.edition.id).toBe('other'));
 const never=deferred<Response>();fetch.mockImplementation((path,init)=>String(path).startsWith('/study/workspace?editionId=fluidi')?never.promise:original(path,init));
 act(()=>result.current.selectEdition('fluidi'));await waitFor(()=>expect(result.current.data?.edition.id).toBe('fluidi'));expect(result.current.data?.resources).toEqual([ack.resource]);
 const wrongParent=answer(snapshot,'older-ack');act(()=>result.current.acknowledgeScienceResource(wrongParent,{resourceId:ack.resource.id,revisionId:'obsolete-parent'}));expect(result.current.data?.resources).toEqual([ack.resource]);
});
test('an old-step ACK publishes the confirmed original context without attaching it to the new step',async()=>{
 const pending=deferred<SavedScience>(),acknowledged=vi.fn(),linked=vi.fn();let frozen!:Snapshot;
 const api:ScienceApi={catalog:vi.fn(),read:vi.fn(),evaluate:vi.fn(),save:vi.fn(async(_edition,value)=>{frozen=value;return pending.promise;})};
 const props={me,editionId:'fluidi',capability,api,onAcknowledged:acknowledged,onSaved:linked};
 const view=render(<CoreFluidLab {...props} courseLesson={snapshot.courseLesson}/>);
 fireEvent.change(note(),{target:{value:'A del passaggio originale'}});fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));await waitFor(()=>expect(frozen).toBeTruthy());
 view.rerender(<CoreFluidLab {...props} courseLesson={{...snapshot.courseLesson!,stepId:'comparison'}}/>);
 await act(async()=>pending.resolve(answer(frozen)));expect(acknowledged).toHaveBeenCalledWith(expect.objectContaining({snapshot:expect.objectContaining({courseLesson:snapshot.courseLesson})}),null);expect(linked).not.toHaveBeenCalled();
 const exit=new Event('beforeunload',{cancelable:true});window.dispatchEvent(exit);expect(exit.defaultPrevented).toBe(true);
});
test.each(['resource-text','revision-resource','epoch'] as const)('a %s mismatch cannot publish or link an ACK',async mismatch=>{
 const pending=deferred<SavedScience>(),acknowledged=vi.fn(),linked=vi.fn();let frozen!:Snapshot;
 const api:ScienceApi={catalog:vi.fn(),read:vi.fn(),evaluate:vi.fn(),save:vi.fn(async(_edition,value)=>{frozen=value;return pending.promise;})};
 render(<CoreFluidLab me={me} editionId="fluidi" capability={capability} courseLesson={snapshot.courseLesson} saved={answer(snapshot,'prior-revision')} api={api} onAcknowledged={acknowledged} onSaved={linked}/>);
 fireEvent.change(note(),{target:{value:'Modifica da confermare'}});fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));await waitFor(()=>expect(frozen).toBeTruthy());
 const ack=answer(frozen);if(mismatch==='resource-text')ack.resource.text=JSON.stringify({...frozen,note:'Altro testo'});if(mismatch==='revision-resource')ack.resource.id='unrelated-resource';if(mismatch==='epoch')act(()=>{beginStudySessionExchange();});
 await act(async()=>pending.resolve(ack));expect(acknowledged).not.toHaveBeenCalled();expect(linked).not.toHaveBeenCalled();expect(note().value).toBe('Modifica da confermare');
});
test('a newer index revision rejects an obsolete ACK without confirming the open draft or attaching a source',async()=>{
 const linked=vi.fn(),acknowledged=vi.fn(()=>false);
 const api:ScienceApi={catalog:vi.fn(),read:vi.fn(),evaluate:vi.fn(),save:vi.fn(async(_edition,value)=>answer(value))};
 render(<CoreFluidLab me={me} editionId="fluidi" capability={capability} api={api} onAcknowledged={acknowledged} onSaved={linked}/>);
 fireEvent.change(note(),{target:{value:'Modifica da conservare'}});fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
 await screen.findByText(/Un’altra scheda ha aggiornato questa risorsa/);expect(acknowledged).toHaveBeenCalled();expect(linked).not.toHaveBeenCalled();expect(note().value).toBe('Modifica da conservare');
 const exit=new Event('beforeunload',{cancelable:true});window.dispatchEvent(exit);expect(exit.defaultPrevented).toBe(true);
});
