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
