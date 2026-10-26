// @vitest-environment jsdom
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {IndependentStudy} from './IndependentStudy';
import {installPublicBrowserStorage} from '../../__tests__/public-storage-fixture';
const ref={id:'spring',version:1,sha256:'a'.repeat(64)};
const base={id:'session',revisionId:'rev',editionId:'mechanics',lessonRef:ref,title:'Molla',phase:'practice',phases:['diagnostic','practice','transfer'],cycle:0,diagnostic:'unità',sourceRef:{resourceId:'source',revisionId:'original',sha256:'b'.repeat(64)},task:{prompt:'Trova x.',parameters:{force:10,stiffness:50},unit:'m'},hintLevel:0,phaseSupport:[],attempts:[],prerequisites:[],reviewAt:null,reviewReason:'Obiettivo scelto da te',mastery:'NOT_INFERRED',pendingAttempt:null,tutorRequest:null,dispute:null};
beforeEach(installPublicBrowserStorage);afterEach(()=>{cleanup();vi.unstubAllGlobals();});
test('does not reveal a solution on resume and a revoked request removes private state',async()=>{
 let revoked=false;
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(revoked)return new Response(JSON.stringify({error:'forbidden'}),{status:403});
  return new Response(JSON.stringify(path.endsWith('/session')?base:{objectives:[],sessions:[{id:'session'}],reason:'Riprendi',coverageWarning:'DRAFT'}));
 }));
 render(<IndependentStudy editionId="mechanics" me={{id:'student-a',role:'student',synthetic:true}}/>);
 await screen.findByText('Trova x.');expect(screen.queryByText('0.2')).toBeNull();
 fireEvent.change(screen.getByLabelText('Il tuo procedimento'),{target:{value:'Faccio un controllo delle unità'}});
 revoked=true;fireEvent.click(screen.getByRole('button',{name:'Chiedi un indizio'}));
 await screen.findByRole('alert');expect(screen.queryByText('Trova x.')).toBeNull();
});

test('keeps a single main landmark when mounted inside the application shell',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>new Response(JSON.stringify(path.endsWith('/session')?base:{objectives:[],sessions:[{id:'session'}],reason:'Riprendi',coverageWarning:'DRAFT'}))));
 render(<main aria-label="Applicazione"><IndependentStudy editionId="mechanics" me={{id:'student-a',role:'student',synthetic:true}}/></main>);
 await screen.findByText('Trova x.');expect(screen.getAllByRole('main')).toHaveLength(1);
});

test('records an explicit self report and undo then reloads authoritative state',async()=>{
 const scheduler={engine:'py-fsrs',version:'6.3.2',basis:'learner_self_report',rated:false,lastRating:null,canUndo:false,manualOverride:null,explanation:'Una tua scelta, non un voto.',choices:[{rating:'good',label:'Ricordato',due:1761437400}]};
 let current={...base,task:undefined,phase:'review',reviewScheduler:scheduler};const commands:unknown[]=[];
 vi.stubGlobal('fetch',vi.fn(async(path:string,options?:RequestInit)=>{
  if(path.endsWith('/actions')){
   const command=JSON.parse(options!.body as string);commands.push(command);
   current={...current,revisionId:current.revisionId+'x',reviewScheduler:{...scheduler,rated:command.action==='rate',canUndo:command.action==='rate',choices:command.action==='rate'?[]:scheduler.choices}};
  }
  return new Response(JSON.stringify(path.endsWith('/session')||path.endsWith('/actions')?current:{objectives:[],sessions:[{id:'session'}],reason:'Riprendi',coverageWarning:'DRAFT'}));
 }));
 render(<IndependentStudy editionId="mechanics" me={{id:'student-a',role:'student',synthetic:true}}/>);
 fireEvent.click(await screen.findByRole('button',{name:/Autovalutazione: Ricordato/}));
 fireEvent.click(await screen.findByRole('button',{name:'Annulla l’autovalutazione'}));
 await screen.findByRole('button',{name:/Autovalutazione: Ricordato/});
 expect(commands).toMatchObject([{action:'rate',fields:{rating:'good'}},{action:'undo-rating',fields:{}}]);
});

test('an invalid rating stays an input error without claiming a lost connection',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>path.endsWith('/actions')?new Response(JSON.stringify({error:'invalid_study_rating'}),{status:422}):new Response(JSON.stringify(path.endsWith('/session')?{...base,phase:'review',task:undefined,reviewScheduler:{rated:false,canUndo:false,choices:[{rating:'good',label:'Ricordato',due:1761437400}],explanation:'Autovalutazione'}}:{objectives:[],sessions:[{id:'session'}]}))));
 render(<IndependentStudy editionId="mechanics" me={{id:'student-a',role:'student',synthetic:true}}/>);
 fireEvent.click(await screen.findByRole('button',{name:/Autovalutazione: Ricordato/}));
 expect((await screen.findByRole('alert')).textContent).toContain('scelta non è valida');
 expect(screen.queryByText(/Connessione assente o non verificata/)).toBeNull();
});

test.each([['study_scheduler_unavailable','Serve un aggiornamento compatibile'],['study_clock_regressed','L’orario del servizio precede']])('explains %s without suggesting an endless reopen loop',async(code,message)=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({error:code}),{status:409})));
 render(<IndependentStudy editionId="mechanics" me={{id:'student-a',role:'student',synthetic:true}}/>);
 expect((await screen.findByRole('alert')).textContent).toContain(message);
 expect(screen.queryByText(/Connessione assente o non verificata/)).toBeNull();
});
