// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Exam} from '../features/Exam';
import type {Workspace} from '../api';
const ids=['closure1-fluid-thermal-mock-1','closure1-fluid-thermal-mock-2'];
const rules={totalQuestions:31,mcq:21,completion:10,correctTenths:10,wrongTenths:-1,omittedTenths:0,maxTenths:310,maxScore:31,scoring:'Risposta corretta +1,00; risposta errata −0,10; risposta omessa 0,00.'};
const draft={editorialStatus:'DRAFT',humanApproval:false,releaseScope:'PRIVATE_SYNTHETIC_ACCEPTANCE',feedbackAuthority:'DRAFT_REFERENCE_NOT_HUMAN_APPROVAL',scopeWarning:'Selezione tematica U3/U5, non riproduce la distribuzione della prova nazionale.'};
const simulations=ids.map((id,i)=>({...draft,id,simulationId:id,title:`Simulazione tematica ${i+1}`,ready:true,durationSeconds:3000,questionCount:31,rules}));
const questions=Array.from({length:31},(_,i)=>i<21?{id:`q${i+1}`,topic:'Fluidi',type:'mcq',prompt:`Domanda canonica ${i+1}`,options:['Opzione A','Opzione B','Opzione C','Opzione D','Opzione E'],answerType:'option_id'}:{id:`q${i+1}`,topic:'Termodinamica',type:'completion',prompt:`Domanda canonica ${i+1}`,format:'Testo o numero'});
const data={edition:{id:'course',title:'Fluidi e termodinamica',teacherId:'t',state:'running',capacity:10,priceMinor:0,sessions:[],timezone:'Europe/Rome'},enrolled:true,resources:[],submissions:[],layouts:[],layoutSaved:false,layoutVersion:'v'} as Workspace;
function attempt(id=ids[0]){return {...draft,id:'attempt-'+id,simulationId:id,editionId:'course',packId:id,packVersion:1,status:'in_progress',startedAt:1000,deadlineAt:4000,submittedAt:null,remainingSeconds:3000,answers:{},title:simulations.find(s=>s.id===id)!.title,subtitle:'31 quesiti DRAFT',durationSeconds:3000,rules,questions,answerRevision:0,result:null};}
function summary(id=ids[0]){return {...draft,id:'attempt-'+id,simulationId:id,editionId:'course',status:'in_progress',startedAt:1000,deadlineAt:4000,submittedAt:null,scoreTenths:null,score:null,maxTenths:310,correct:null,wrong:null,omitted:null,answerRevision:0};}
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});}
function location(id:string){window.history.replaceState({},'',`/?view=exam&edition=course&simulation=${encodeURIComponent(id)}`);}
afterEach(()=>{cleanup();vi.unstubAllGlobals();window.history.replaceState({},'','/');});
it.each(ids)('starts exact %s with31 questions,50minutes and no instant correction',async id=>{
 location(id);const calls:{path:string;body:unknown}[]=[];
 vi.stubGlobal('fetch',vi.fn(async(path:string,init:RequestInit={})=>{const body=init.body?JSON.parse(String(init.body)):undefined;calls.push({path,body});return path.includes('/exams?')?reply({attempts:[],pack:null,simulations}):path==='/study/exams'&&init.method==='POST'?reply(attempt(id)):reply({error:'unexpected'},404);}));
 render(<Exam data={data}/>);await screen.findByRole('button',{name:'Inizia la simulazione'});
 expect(screen.getByText('31 quesiti: 21 scelte e 10 completamenti in 50 minuti.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Inizia la simulazione'}));await screen.findByText('Domanda canonica 1');
 expect(calls.find(c=>c.path==='/study/exams')?.body).toEqual({editionId:'course',simulationId:id});
 expect(screen.getByRole('timer').textContent).toContain('50:00');expect(screen.getAllByRole('button',{name:/^Domanda \d+/})).toHaveLength(31);
 expect(screen.getByRole('note').textContent).toContain('approvazione umana non eseguita');
 expect(screen.queryByText('Mostra lo svolgimento')).toBeNull();expect(screen.queryByText('Risposta attesa')).toBeNull();
 expect(calls.some(c=>c.path.includes('/question-banks/')||c.path.endsWith('/attempts'))).toBe(false);
});
it('refresh restores the selected server attempt and saved answers without another start',async()=>{
 location(ids[1]);let remaining=1700;
 const fetcher=vi.fn(async(path:string)=>path.includes('/exams?')?reply({attempts:[summary(ids[1])],pack:null,simulations}):reply({...attempt(ids[1]),remainingSeconds:remaining,answers:{q1:'B'},answerRevision:6}));vi.stubGlobal('fetch',fetcher);
 const mounted=render(<Exam data={data}/>);await screen.findByText('Domanda canonica 1');
 expect((screen.getByRole('radio',{name:/Opzione B/}) as HTMLInputElement).checked).toBe(true);expect(screen.getByRole('timer').textContent).toContain('28:20');
 mounted.unmount();remaining=1600;render(<Exam data={data}/>);await screen.findByText('Domanda canonica 1');
 expect(screen.getByRole('timer').textContent).toContain('26:40');expect(fetcher.mock.calls.every(([path])=>path!=='/study/exams')).toBe(true);expect(new URLSearchParams(window.location.search).get('simulation')).toBe(ids[1]);
});
it('requires explicit resumption when another mock is active',async()=>{
 location(ids[0]);const calls:string[]=[];vi.stubGlobal('fetch',vi.fn(async(path:string)=>{calls.push(path);return path.includes('/exams?')?reply({attempts:[summary(ids[1])],pack:null,simulations}):reply(attempt(ids[1]));}));
 render(<Exam data={data}/>);await screen.findByText('È in corso un’altra simulazione.');expect((screen.getByRole('button',{name:'Inizia la simulazione'}) as HTMLButtonElement).disabled).toBe(true);expect(calls).toHaveLength(1);
 fireEvent.click(screen.getByRole('button',{name:'Riprendi l’altra simulazione'}));await screen.findByText('Domanda canonica 1');expect(new URLSearchParams(window.location.search).get('simulation')).toBe(ids[1]);expect(calls.some(p=>p==='/study/exams')).toBe(false);
});
it('unknown cross-course selection never falls back to the default published paper',async()=>{
 location('other-course-mock');const fetcher=vi.fn(async()=>reply({attempts:[],simulations,pack:{id:'default',title:'Prova pubblicata',ready:true,subtitle:'Approvata',durationSeconds:3000,questionCount:31,rules}}));vi.stubGlobal('fetch',fetcher);
 render(<Exam data={data}/>);await screen.findByText(/Questa simulazione non appartiene all’edizione/);expect(screen.queryByRole('button',{name:'Inizia la prova'})).toBeNull();expect(screen.queryByRole('button',{name:'Inizia la simulazione'})).toBeNull();expect(fetcher).toHaveBeenCalledTimes(1);
});
it('refuses a server response for another selected simulation',async()=>{
 location(ids[1]);vi.stubGlobal('fetch',vi.fn(async(path:string)=>path.includes('/exams?')?reply({attempts:[],pack:null,simulations}):reply(attempt(ids[0]))));render(<Exam data={data}/>);
 await screen.findByRole('button',{name:'Inizia la simulazione'});fireEvent.click(screen.getByRole('button',{name:'Inizia la simulazione'}));await screen.findByText(/La prova ricevuta non corrisponde/);expect(screen.queryByText('Domanda canonica 1')).toBeNull();expect(new URLSearchParams(window.location.search).get('simulation')).toBe(ids[1]);
});
it('labels finalized results and history as draft reference feedback',async()=>{
 location(ids[0]);let finished=false;
 const result={...draft,scoreTenths:0,maxTenths:310,score:0,correct:0,wrong:0,omitted:31,questions:[{questionId:'q1',topic:'Fluidi',type:'mcq',prompt:'Domanda canonica 1',options:['A','B','C','D','E'],given:null,givenText:null,expected:'B',expectedText:'Opzione B di riferimento',accepted:null,status:'omitted',pointsTenths:0,explanation:'Spiegazione disponibile solo dopo la consegna.'}]};
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{if(path.includes('/exams?'))return reply({attempts:finished?[{...summary(),status:'submitted',scoreTenths:0,score:0,omitted:31}]:[],pack:null,simulations});if(path.endsWith('/submit')){finished=true;return reply({...attempt(),status:'submitted',remainingSeconds:0,result});}return reply(attempt());}));
 render(<Exam data={data}/>);await screen.findByRole('button',{name:'Inizia la simulazione'});fireEvent.click(screen.getByRole('button',{name:'Inizia la simulazione'}));await screen.findByText('Domanda canonica 1');expect(screen.queryByText('Spiegazione disponibile solo dopo la consegna.')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Consegna la prova'}));fireEvent.click(screen.getByRole('button',{name:'Consegna definitivamente'}));await screen.findByText('Punteggio di riferimento');expect(screen.getByText('Spiegazione disponibile solo dopo la consegna.')).toBeTruthy();expect(screen.getByRole('note').textContent).toContain('DRAFT');
 fireEvent.click(screen.getByRole('button',{name:'Torna alle prove'}));await screen.findByText('DRAFT · riscontro di riferimento · approvazione umana non eseguita');
});
it('keeps normal published starts unchanged without a simulation selection',async()=>{
 const calls:{path:string;body:unknown}[]=[];const normal={...attempt(),simulationId:undefined,humanApproval:true,releaseScope:'PUBLIC',editorialStatus:'PUBLISHED'};
 vi.stubGlobal('fetch',vi.fn(async(path:string,init:RequestInit={})=>{calls.push({path,body:init.body?JSON.parse(String(init.body)):undefined});return path.includes('/exams?')?reply({attempts:[],pack:{id:'published-paper',version:1,title:'Prova pubblicata',subtitle:'31 quesiti approvati',durationSeconds:3000,questionCount:31,rules,provenance:'Banca approvata',ready:true}}):reply(normal);}));
 render(<Exam data={data}/>);await screen.findByRole('button',{name:'Inizia la prova'});expect(screen.queryByRole('note')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Inizia la prova'}));await screen.findByText('Domanda canonica 1');expect(calls.find(c=>c.path==='/study/exams')?.body).toEqual({editionId:'course'});expect(screen.queryByRole('note')).toBeNull();
});
it('refreshes a stale listing after an active-other-mock409 without opening it silently',async()=>{
 location(ids[0]);let listed=0;const calls:string[]=[];vi.stubGlobal('fetch',vi.fn(async(path:string)=>{calls.push(path);if(path.includes('/exams?'))return reply({attempts:listed++?[summary(ids[1])]:[],pack:null,simulations});return reply({error:'exam_active_simulation_conflict'},409);}));
 render(<Exam data={data}/>);await screen.findByRole('button',{name:'Inizia la simulazione'});fireEvent.click(screen.getByRole('button',{name:'Inizia la simulazione'}));await screen.findByText('È già in corso un’altra simulazione. Puoi riprenderla esplicitamente qui sotto.');await screen.findByRole('button',{name:'Riprendi l’altra simulazione'});expect(screen.queryByText('Domanda canonica 1')).toBeNull();expect(calls.some(p=>p.includes('/exams/attempt-'))).toBe(false);
});
it('does not start a selected descriptor that the server marks unready',async()=>{
 location(ids[0]);const fetcher=vi.fn(async()=>reply({attempts:[],pack:null,simulations:simulations.map(s=>({...s,ready:false}))}));vi.stubGlobal('fetch',fetcher);render(<Exam data={data}/>);const button=await screen.findByRole('button',{name:'Inizia la simulazione'});expect((button as HTMLButtonElement).disabled).toBe(true);fireEvent.click(button);expect(fetcher).toHaveBeenCalledTimes(1);
});
it('keeps navigation guarded through autosave and ignores an older answer acknowledgement',async()=>{
 location(ids[0]);const pending:{resolve:(response:Response)=>void;body:{answers:Record<string,string>;expectedRevision:number}}[]=[];
 vi.stubGlobal('fetch',vi.fn((path:string,init:RequestInit={})=>{if(path.includes('/exams?'))return Promise.resolve(reply({attempts:[],pack:null,simulations}));if(path.endsWith('/answers'))return new Promise<Response>(resolve=>pending.push({resolve,body:JSON.parse(String(init.body))}));return Promise.resolve(reply(attempt()));}));
 const blocked=()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;};
 render(<Exam data={data}/>);await screen.findByRole('button',{name:'Inizia la simulazione'});fireEvent.click(screen.getByRole('button',{name:'Inizia la simulazione'}));await screen.findByText('Domanda canonica 1');fireEvent.click(screen.getByRole('radio',{name:/Opzione A/}));expect(blocked()).toBe(true);await waitFor(()=>expect(pending).toHaveLength(1));
 fireEvent.click(screen.getByRole('radio',{name:/Opzione B/}));pending[0].resolve(reply({...attempt(),answers:pending[0].body.answers,answerRevision:1}));await waitFor(()=>expect(pending).toHaveLength(2));expect(blocked()).toBe(true);expect(pending[1].body).toEqual({answers:{q1:'B'},expectedRevision:1});pending[1].resolve(reply({...attempt(),answers:pending[1].body.answers,answerRevision:2}));await screen.findByText('Risposte salvate');expect(blocked()).toBe(false);
});

it('a late start response cannot rewrite navigation after leaving the exam scope',async()=>{
 location(ids[0]);let resolveStart!:(response:Response)=>void;
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>path.includes('/exams?')?reply({attempts:[],pack:null,simulations}):new Promise<Response>(resolve=>{resolveStart=resolve;})));
 const mounted=render(<Exam data={data}/>);await screen.findByRole('button',{name:'Inizia la simulazione'});fireEvent.click(screen.getByRole('button',{name:'Inizia la simulazione'}));await waitFor(()=>expect(resolveStart).toBeTypeOf('function'));mounted.unmount();window.history.replaceState({},'','/?view=classroom&edition=other');resolveStart(reply(attempt()));await new Promise(resolve=>setTimeout(resolve,0));expect(new URLSearchParams(window.location.search).get('edition')).toBe('other');expect(new URLSearchParams(window.location.search).get('view')).toBe('classroom');
});
