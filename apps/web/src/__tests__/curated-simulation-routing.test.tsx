// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {CuratedCoursePractice} from '../components/CuratedCoursePractice';
import {PhysicsQuestionBank,QuestionCard,type Question} from '../components/PhysicsQuestionBank';
import {studyRequest} from '../api';
vi.mock('../api',async original=>({...await original<typeof import('../api')>(),studyRequest:vi.fn()}));
afterEach(()=>{cleanup();vi.mocked(studyRequest).mockReset();});
const ids=['closure1-fluid-thermal-mock-1','closure1-fluid-thermal-mock-2'];
const materials={curatedPractice:{bankId:'physics-semestre-2026',bankVersion:1,manifestSha256:'a'.repeat(64),questionRefs:[]},examSimulations:ids.map((id,i)=>({id,title:`Simulazione ${i+1}`,scopeWarning:'Selezione tematica U3/U5.',durationSeconds:3000,questionRefs:Array.from({length:31},(_,n)=>({id:`q-${i}-${n}`,version:1,sha256:'b'.repeat(64),lessonId:'lesson'}))}))};
it('links both curated mocks to the same-site persisted exam instead of31 instant-feedback cards',async()=>{
 vi.mocked(studyRequest).mockResolvedValue({bankSha256:'a'.repeat(64)});render(<CuratedCoursePractice materials={materials} editionId="edition/id" me={{id:'learner',role:'student',synthetic:true}} lessonId="lesson"/>);fireEvent.click(screen.getByText('Problemi scelti per questa lezione e allenamenti tematici'));
 const links=await screen.findAllByRole('link',{name:/Simulazione [12]/});expect(links).toHaveLength(2);links.forEach((link,i)=>{const url=new URL((link as HTMLAnchorElement).href);expect(url.pathname).toBe('/');expect(url.searchParams.get('view')).toBe('exam');expect(url.searchParams.get('edition')).toBe('edition/id');expect(url.searchParams.get('simulation')).toBe(ids[i]);});
 expect(screen.getByRole('combobox').querySelectorAll('option')).toHaveLength(2);expect(screen.queryByText('Mostra lo svolgimento')).toBeNull();expect(vi.mocked(studyRequest).mock.calls.every(([path])=>!path.includes('/questions/')&&!path.endsWith('/attempts'))).toBe(true);
});
it('shows draft reference status before feedback and never an early practice answer',async()=>{
 const question:Question={id:'q',prompt:'Prevedi la pressione.',format:'multiple_choice',options:[{id:'A',text:'Prima'},{id:'B',text:'Seconda'}],taxonomy:{unitId:'U3',macroarea:'Fisica',microarea:'Fluidi',topic:'Pressione'},difficulty:{level:'base',reason:'Sintetico'},familyId:'pressure',status:'DRAFT',humanApproval:false};
 vi.mocked(studyRequest).mockResolvedValue({questionId:'q',outcome:'correct',score:1,matchingPolicy:'choice_id',answer:{text:'Seconda',unit:'1',correctOptionId:'B'},solution:'Soluzione di riferimento privata.',scientificApproval:'NOT_RUN',humanApproval:false});
 render(<QuestionCard question={question} base="/bank" bankSha256={'a'.repeat(64)} index={0}/>);expect(screen.getByRole('note').textContent).toContain('approvazione umana non eseguita');expect(screen.queryByText('Soluzione di riferimento privata.')).toBeNull();expect(studyRequest).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('radio',{name:/Seconda/}));fireEvent.click(screen.getByRole('button',{name:'Verifica risposta'}));expect(await screen.findByText('Coerente con il riferimento')).toBeTruthy();expect(screen.getByText('Soluzione di riferimento privata.')).toBeTruthy();expect(screen.queryByText('Risposta corretta')).toBeNull();
});

it('labels synthetic bank sampling as personal draft training rather than the persisted mock',async()=>{
 vi.mocked(studyRequest).mockImplementation(async path=>String(path).includes('/questions?')?{items:[],total:0,nextCursor:null,bankSha256:'a'.repeat(64)} as never:{title:'Banca',questionCount:199,bankSha256:'a'.repeat(64),countsByDifficulty:{base:199},humanApproval:false,editorialStatus:'DRAFT'} as never);
 render(<PhysicsQuestionBank editionId="course"/>);fireEvent.click(screen.getByText(/Allenati con la banca di fisica/));expect(await screen.findByRole('button',{name:'Genera un allenamento · 31 quesiti'})).toBeTruthy();expect(screen.getByText(/Quesiti di riferimento senza approvazione umana/)).toBeTruthy();expect(screen.queryByRole('button',{name:'Genera una prova 2026 · 31 quesiti'})).toBeNull();
});
