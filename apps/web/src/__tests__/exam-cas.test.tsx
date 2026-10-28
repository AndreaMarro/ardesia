// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Exam} from '../features/Exam';
import type {Workspace} from '../api';
const rules={totalQuestions:1,mcq:1,completion:0,correctTenths:10,wrongTenths:-1,omittedTenths:0,maxTenths:310,scoring:'Risposta corretta +1,00; risposta errata -0,10; risposta omessa 0,00.',maxScore:31};
const questions=[{id:'q1',topic:'Misure',type:'mcq' as const,prompt:'Quale opzione è corretta?',options:['A-text','B-text','C-text','D-text','E-text'],answerType:'option_id' as const}];
const attempt={id:'attempt-cas',editionId:'physics',packId:'physics-semestre-2026-semestre-2026-v1',packVersion:1,status:'in_progress' as const,startedAt:1000,deadlineAt:4000,submittedAt:null,remainingSeconds:3000,answers:{},title:'Fisica — Prova di semestre',subtitle:'31 quesiti approvati',durationSeconds:3000,rules,questions,answerRevision:5,result:null};
const workspace={edition:{id:'physics',title:'Fisica',teacherId:'t',capacity:10,priceMinor:0,state:'running',sessions:[],timezone:'Europe/Rome'},enrolled:true,resources:[],submissions:[],layouts:[],layoutSaved:false,layoutVersion:'v'} as Workspace;
type Call={path:string;method:string;body?:{answers:Record<string,string>;expectedRevision:number}};
function response(value:unknown,status=200){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});}
const blocked=()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;};
function setup({conflicts=1,freshOverride={},readFailure=false}:{conflicts?:number;freshOverride?:Record<string,unknown>;readFailure?:boolean}={}){
 const calls:Call[]=[];let saves=0,reads=0;
 vi.stubGlobal('fetch',vi.fn(async(path:string,init:RequestInit={})=>{
  const method=init.method??'GET',body=init.body?JSON.parse(String(init.body)):undefined;calls.push({path,method,body});
  if(path.includes('/exams?editionId=physics'))return response({attempts:[],pack:{id:attempt.packId,version:1,title:attempt.title,subtitle:attempt.subtitle,durationSeconds:3000,rules,provenance:'Banca approvata.',questionCount:31}});
  if(path==='/study/exams'&&method==='POST')return response(attempt);
  if(path==='/study/exams/attempt-cas/answers'){saves++;return saves<=conflicts?response({error:'exam_revision_conflict'},409):response({...attempt,answers:body.answers,answerRevision:body.expectedRevision+1});}
  if(path==='/study/exams/attempt-cas'&&method==='GET'){reads++;return readFailure?response({error:'network_error'},503):response({...attempt,answers:{q1:'A'},answerRevision:reads===1?7:9,...freshOverride});}
  return response({error:'not_found'},404);
 }));return {calls,writes:()=>calls.filter(c=>c.method==='PUT')};
}
async function start(){render(<Exam data={workspace}/>);fireEvent.click(await screen.findByRole('button',{name:'Inizia la prova'}));await screen.findByText(questions[0].prompt);fireEvent.click(screen.getByRole('radio',{name:/C-text/}));await screen.findAllByRole('alert');await waitFor(()=>expect(screen.queryByText('Verifico la versione sul servizio…')).toBeNull());}
async function retry(){fireEvent.click(screen.getByRole('button',{name:'Salva le scelte di questa scheda'}));fireEvent.click(screen.getByRole('button',{name:'Conferma sostituzione sul servizio'}));}
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();window.history.replaceState({},'','/');});

test('a409 preserves local choices and guard, pauses autosave, then explicit replacement uses fresh CAS',async()=>{
 const api=setup();await start();expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(api.writes()[0].body).toEqual({answers:{q1:'C'},expectedRevision:5});
 fireEvent.click(screen.getByRole('radio',{name:/B-text/}));await new Promise(r=>setTimeout(r,850));expect(api.writes()).toHaveLength(1);expect(blocked()).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Salva le scelte di questa scheda'}));expect(screen.getByText(/sostituiranno quelle salvate sul servizio/)).toBeTruthy();expect(api.writes()).toHaveLength(1);
 fireEvent.click(screen.getByRole('button',{name:'Conferma sostituzione sul servizio'}));await screen.findByText('Risposte salvate');expect(api.writes()).toHaveLength(2);expect(api.writes()[1].body).toEqual({answers:{q1:'B'},expectedRevision:7});expect(blocked()).toBe(false);expect(screen.queryByText('Risposta attesa')).toBeNull();
});
test('server reload needs explicit discard confirmation and cancellation preserves the local draft',async()=>{
 const api=setup();await start();fireEvent.click(screen.getByRole('button',{name:'Ricarica le risposte del servizio'}));expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(screen.getByText(/perderai le modifiche locali/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Torna alle scelte'}));expect(blocked()).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Ricarica le risposte del servizio'}));fireEvent.click(screen.getByRole('button',{name:'Conferma scarto e ricarica'}));await waitFor(()=>expect((screen.getByRole('radio',{name:/A-text/}) as HTMLInputElement).checked).toBe(true));expect(api.writes()).toHaveLength(1);expect(blocked()).toBe(false);
});
test('a second409 keeps the draft and requires another confirmed retry at the newer revision',async()=>{
 const api=setup({conflicts:2});await start();await retry();await waitFor(()=>expect(api.writes()).toHaveLength(2));await screen.findByText(/Le risposte locali sono ancora qui/);expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);await new Promise(r=>setTimeout(r,850));expect(api.writes()).toHaveLength(2);await retry();await screen.findByText('Risposte salvate');expect(api.writes()[2].body).toEqual({answers:{q1:'C'},expectedRevision:9});expect(blocked()).toBe(false);
});
test('a failed conflict read keeps local answers guarded and offers no unchecked replacement',async()=>{
 const api=setup({readFailure:true});await start();await screen.findByText(/Non riesco a verificare la versione sul servizio/);expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(screen.queryByRole('button',{name:'Salva le scelte di questa scheda'})).toBeNull();fireEvent.click(screen.getByRole('radio',{name:/B-text/}));await new Promise(r=>setTimeout(r,850));expect(api.writes()).toHaveLength(1);
});
test('a different deadline or attempt identity cannot replace the current draft',async()=>{
 const api=setup({freshOverride:{deadlineAt:5000}});await start();await screen.findByText(/La prova ricevuta non corrisponde/);expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(screen.queryByRole('button',{name:'Salva le scelte di questa scheda'})).toBeNull();expect(api.writes()).toHaveLength(1);expect(screen.getByRole('timer').textContent).not.toContain('66:40');
});
test('canonical server expiry preserves local choices and blocks replacement and submission',async()=>{
 const api=setup({freshOverride:{status:'expired',remainingSeconds:0,result:{scoreTenths:0,questions:[]}}});await start();await screen.findByText(/La prova sul servizio è già chiusa/);expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(screen.queryByRole('button',{name:'Salva le scelte di questa scheda'})).toBeNull();expect((screen.getByRole('button',{name:'Consegna la prova'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.queryByText('Punteggio')).toBeNull();await new Promise(r=>setTimeout(r,850));expect(api.writes()).toHaveLength(1);expect(api.calls.some(c=>c.path.endsWith('/submit'))).toBe(false);
});

test('an explicit retry ACK cannot clear a newer local edit and its next save uses the acknowledged revision',async()=>{
 const api=setup(),base=globalThis.fetch;let count=0,resolveRetry!:(r:Response)=>void,retryBody:{answers:Record<string,string>;expectedRevision:number}|undefined;
 vi.stubGlobal('fetch',vi.fn((path:string,init:RequestInit={})=>{if(path.endsWith('/answers')&&++count===2){retryBody=JSON.parse(String(init.body));return new Promise<Response>(resolve=>{resolveRetry=resolve;});}return base(path,init);}));
 await start();await retry();await waitFor(()=>expect(resolveRetry).toBeTypeOf('function'));expect(retryBody).toEqual({answers:{q1:'C'},expectedRevision:7});
 fireEvent.click(screen.getByRole('radio',{name:/D-text/}));resolveRetry(response({...attempt,answers:retryBody!.answers,answerRevision:8}));
 expect((screen.getByRole('radio',{name:/D-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);
 await waitFor(()=>expect(api.writes()).toHaveLength(2));expect(api.writes()[1].body).toEqual({answers:{q1:'D'},expectedRevision:8});await screen.findByText('Risposte salvate');expect(blocked()).toBe(false);
});
test('an edit while confirmed server reload is in flight requires a new discard decision',async()=>{
 const api=setup(),base=globalThis.fetch;let reads=0,resolveRead!:(r:Response)=>void;
 vi.stubGlobal('fetch',vi.fn((path:string,init:RequestInit={})=>{if(path==='/study/exams/attempt-cas'&&++reads===2)return new Promise<Response>(resolve=>{resolveRead=resolve;});return base(path,init);}));
 await start();fireEvent.click(screen.getByRole('button',{name:'Ricarica le risposte del servizio'}));fireEvent.click(screen.getByRole('button',{name:'Conferma scarto e ricarica'}));await waitFor(()=>expect(resolveRead).toBeTypeOf('function'));
 fireEvent.click(screen.getByRole('radio',{name:/B-text/}));resolveRead(response({...attempt,answers:{q1:'A'},answerRevision:9}));await screen.findByText(/Le scelte locali sono cambiate durante la verifica/);expect((screen.getByRole('radio',{name:/B-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(api.writes()).toHaveLength(1);
});
test('expiry returned by a confirmed save keeps the local draft instead of claiming an ACK',async()=>{
 setup();const base=globalThis.fetch;let writes=0;
 vi.stubGlobal('fetch',vi.fn((path:string,init:RequestInit={})=>path.endsWith('/answers')&&++writes===2?Promise.resolve(response({...attempt,status:'expired',remainingSeconds:0,answers:{q1:'A'},answerRevision:8,result:{scoreTenths:0,questions:[]}})):base(path,init)));
 await start();await retry();await screen.findByText(/La prova sul servizio è già chiusa/);expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(screen.queryByText('Risposte salvate')).toBeNull();expect(screen.queryByRole('button',{name:'Salva le scelte di questa scheda'})).toBeNull();expect(screen.queryByText('Punteggio')).toBeNull();
});

test.each([
 {label:'another attempt',override:{id:'peer-attempt'}},
 {label:'another simulation reference',override:{simulationRef:{id:'different-simulation',version:1,sha256:'0'.repeat(64)}}},
 {label:'another frozen question reference',override:{questions:[{...questions[0],questionRef:{id:'q1',version:2,sha256:'1'.repeat(64)}}]}},
])('conflict data for $label cannot change the frozen examination',async({override})=>{
 const api=setup({freshOverride:override});await start();await screen.findByText(/La prova ricevuta non corrisponde/);expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(screen.queryByRole('button',{name:'Salva le scelte di questa scheda'})).toBeNull();expect(api.writes()).toHaveLength(1);
});
test('a submission409 preserves saved local choices and restores the guard until an explicit resolution',async()=>{
 setup({conflicts:0});const base=globalThis.fetch;
 vi.stubGlobal('fetch',vi.fn((path:string,init:RequestInit={})=>path.endsWith('/submit')?Promise.resolve(response({error:'exam_revision_conflict'},409)):base(path,init)));
 render(<Exam data={workspace}/>);fireEvent.click(await screen.findByRole('button',{name:'Inizia la prova'}));await screen.findByText(questions[0].prompt);fireEvent.click(screen.getByRole('radio',{name:/C-text/}));await screen.findByText('Risposte salvate');expect(blocked()).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Consegna la prova'}));fireEvent.click(screen.getByRole('button',{name:'Consegna definitivamente'}));await screen.findByText(/Le risposte locali sono ancora qui/);await screen.findByRole('button',{name:'Salva le scelte di questa scheda'});expect((screen.getByRole('radio',{name:/C-text/}) as HTMLInputElement).checked).toBe(true);expect(blocked()).toBe(true);expect(screen.queryByText('Risposta attesa')).toBeNull();
});
