// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {CourseAssessment} from '../components/CourseAssessment';
import {CourseDiagnostic} from '../components/CourseDiagnostic';
import {CourseScope,PublicCoursePlayer} from '../features/PublicCoursePlayer';
import {CourseDraftBoundary,confirmCourseExit,createCourseDraftScope} from '../courseExitGuard';
import {learningCourses,type CourseLesson,type CourseRecord} from '../courseLearning';
import {studyRequest} from '../api';
import safeDTO from './fixtures/course-support-safe.json';
vi.mock('../api',async original=>({...await original<typeof import('../api')>(),studyRequest:vi.fn()}));
vi.mock('../features/science-library/CourseLaboratories',()=>({CourseLaboratories:()=>null,lessonSupportsLab:()=>false}));
const base=learningCourses.courses.find(c=>c.pathId==='fluidi-termodinamica')!;
const items=safeDTO.assessmentItems;
function lessonFor(id=safeDTO.diagnosticItems[0].lessonRef.id):CourseLesson{return {...base.lessons[0],...safeDTO.lessons.find(l=>l.id===id)!,activityId:'course-reasoning-v1',modelCases:undefined,controls:undefined};}
function host(){return {me:{id:'learner',role:'student' as const,synthetic:true as const},editionId:'course',saved:[],onSaved:vi.fn(),onInvalidated:vi.fn()};}
function course():CourseRecord{return {...base,lessons:safeDTO.lessons.map(l=>lessonFor(l.id)),assessmentItems:items,diagnosticItems:safeDTO.diagnosticItems,editorialMaterials:null};}
const context=(item=items[0],phase:'practice'|'transfer'='practice')=>({lessonRef:lessonFor().lessonRef,assessmentRef:item.assessmentRef,phase});
const support=(phase:'practice'|'transfer'='practice',level=1,text='Aiuto autorizzato')=>({assessmentRef:items[0].assessmentRef,phase,level,hintCount:phase==='practice'?3:2,text,kind:'HINT',assistanceRecorded:true});
beforeEach(()=>{vi.mocked(studyRequest).mockReset();vi.spyOn(window,'confirm').mockReturnValue(true);window.history.replaceState({},'','/?view=classroom&edition=course');});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('uses the actual answer-free57+3safe projection and mounts each initial case before practice',()=>{
 expect(items).toHaveLength(57);expect(safeDTO.diagnosticItems).toHaveLength(3);expect(JSON.stringify(safeDTO.diagnosticItems)).not.toContain('answer');expect(items.every(i=>i.hintCount===3&&i.transfer.hintCount===2)).toBe(true);
 for(const diagnostic of safeDTO.diagnosticItems){
  const lesson=lessonFor(diagnostic.lessonRef.id),commit=vi.fn();const initial={lessonRef:diagnostic.lessonRef,assessmentRef:diagnostic.assessmentRef,phase:'practice' as const};
  const mounted=render(<CourseScope course={course()} allowLocalDrafts={false} labHost={host()} onCommit={commit} initialActivityId="course-reasoning-v1" initialCourseLesson={initial}/>);
  const section=screen.getByRole('region',{name:'Diagnostica iniziale'});expect(section.compareDocumentPosition(mounted.container.querySelector('.course-situation')!)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByText(diagnostic.prompt)).toBeTruthy();expect(screen.queryByText('Verifica non disponibile')).toBeNull();expect(screen.queryByLabelText('La tua risposta alla verifica')).toBeNull();
  fireEvent.change(screen.getByLabelText('La tua risposta iniziale'),{target:{value:'Ragionamento iniziale originale.'}});fireEvent.click(screen.getByRole('button',{name:'Prepara la risposta iniziale per il docente'}));
  expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({activityId:'course-reasoning-v1',parameters:{},prediction:'Ragionamento iniziale originale.',courseLesson:{...initial}}));
  const url=new URL((screen.getByRole('link',{name:'Riprendi le basi per questo obiettivo'}) as HTMLAnchorElement).href);expect(url.searchParams.get('courseLesson')).toBe(lesson.id);expect(url.searchParams.get('courseRev')).toBe(lesson.lessonRef.sha256);expect(url.searchParams.get('courseLessonPath')).toBe(course().pathId);
  mounted.unmount();
 }
 expect(studyRequest).not.toHaveBeenCalled();
});
it('routes stale or transfer diagnostic refs to diagnostic failure only and keeps truly unknown refs closed',()=>{
 const diagnostic=safeDTO.diagnosticItems[0];
 const mounted=render(<CourseScope course={course()} allowLocalDrafts={false} labHost={host()} initialActivityId="course-reasoning-v1" initialCourseLesson={{lessonRef:diagnostic.lessonRef,assessmentRef:diagnostic.assessmentRef,phase:'transfer'}}/>);
 expect(screen.getByText('Diagnostica non disponibile')).toBeTruthy();expect(screen.queryByText('Verifica non disponibile')).toBeNull();expect(screen.queryByLabelText('La tua risposta iniziale')).toBeNull();mounted.unmount();
 render(<CourseScope course={course()} allowLocalDrafts={false} labHost={host()} initialActivityId="course-reasoning-v1" initialCourseLesson={{lessonRef:diagnostic.lessonRef,assessmentRef:{id:'truly-unknown',version:1,sha256:'a'.repeat(64)},phase:'practice'}}/>);
 expect(screen.getByText('Verifica non disponibile')).toBeTruthy();expect(screen.queryByLabelText('La tua risposta alla verifica')).toBeNull();expect(screen.queryByLabelText('La tua risposta iniziale')).toBeNull();
});
it('diagnostic and assessment checkpoints never clear each other’s unsaved editor',()=>{
 const scope=createCourseDraftScope(),diagCommit=vi.fn(),atomicCommit=vi.fn();const lesson=lessonFor();
 render(<CourseDraftBoundary scope={scope}><CourseDiagnostic items={safeDTO.diagnosticItems} lesson={lesson} coursePathId={base.pathId} onCommit={diagCommit} onInvalidated={()=>{}}/><CourseAssessment items={items} lesson={lesson} onCommit={atomicCommit} onInvalidated={()=>{}} initialContext={context()}/></CourseDraftBoundary>);
 fireEvent.change(screen.getByLabelText('La tua risposta iniziale'),{target:{value:'Bozza diagnostica privata.'}});fireEvent.change(screen.getByLabelText('La tua risposta alla verifica'),{target:{value:'Bozza atomica distinta.'}});fireEvent.click(screen.getByRole('button',{name:'Prepara questa risposta per il docente'}));act(()=>atomicCommit.mock.lastCall?.[0].confirmDraft());
 vi.mocked(window.confirm).mockClear();expect(confirmCourseExit(scope,['assessment'])).toBe(true);expect(window.confirm).not.toHaveBeenCalled();vi.mocked(window.confirm).mockReturnValueOnce(false);expect(confirmCourseExit(scope,['diagnostic'])).toBe(false);expect((screen.getByLabelText('La tua risposta iniziale') as HTMLTextAreaElement).value).toBe('Bozza diagnostica privata.');
 fireEvent.click(screen.getByRole('button',{name:'Prepara la risposta iniziale per il docente'}));act(()=>diagCommit.mock.lastCall?.[0].confirmDraft());expect(confirmCourseExit(scope,['diagnostic'])).toBe(true);
});
it('opens only one authored hint per request, warns first and retries the frozen body/key',async()=>{
 const calls:{path:string;body:unknown;key:string|null}[]=[];let attempts=0;
 vi.mocked(studyRequest).mockImplementation(async(path,body,options)=>{calls.push({path,body:structuredClone(body),key:new Headers(options?.headers).get('Idempotency-Key')});if(attempts++===0)throw Error('network_error');return {...support('practice',(body as {level:number}).level,'Testo rilasciato su richiesta'),kind:(body as {level:number}).level===2?'EXPLICIT_HINT':'HINT'} as never;});
 render(<CourseAssessment items={items} lesson={lessonFor()} onInvalidated={()=>{}} initialContext={context()} editionId="course" actorId="learner" stepId="independent"/>);
 expect(studyRequest).not.toHaveBeenCalled();expect(screen.getByText(/Il prossimo aiuto può includere esplicitamente la risposta/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Apri aiuto 1 di 3'}));await screen.findByRole('button',{name:'Riprova lo stesso aiuto'});fireEvent.click(screen.getByRole('button',{name:'Riprova lo stesso aiuto'}));await screen.findByText('Testo rilasciato su richiesta');
 expect(calls[0]).toEqual(calls[1]);expect(calls[0].body).toEqual({courseLesson:{...context(),stepId:'independent'},level:1});expect(calls[0].key).toBeTruthy();expect(calls[0].path).toBe('/editions/course/course-assessments/'+items[0].id+'/support');fireEvent.click(screen.getByRole('button',{name:'Apri aiuto 2 di 3'}));await screen.findByText('Aiuto 2 · riferimento esplicito di risposta');expect(calls).toHaveLength(3);expect(calls[2].key).not.toBe(calls[0].key);expect(screen.queryByText(/autonomamente superata/)).toBeNull();
});
it.each(['step','phase','ref','actor'] as const)('ignores late hint responses after %s changes',async change=>{
 let resolve!:(v:unknown)=>void;vi.mocked(studyRequest).mockImplementation(()=>new Promise(r=>{resolve=r;}) as never);
 const props={items,lesson:lessonFor(),onInvalidated:()=>{},initialContext:context(),editionId:'course',actorId:'learner',stepId:'independent'};
 const mounted=render(<CourseAssessment {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Apri aiuto 1 di 3'}));await waitFor(()=>expect(resolve).toBeTypeOf('function'));
 if(change==='phase')fireEvent.click(screen.getByRole('button',{name:'Problema di trasferimento'}));
 else mounted.rerender(<CourseAssessment {...props} {...(change==='step'?{stepId:'feedback'}:change==='actor'?{actorId:'peer'}:{items:items.map((i,n)=>n===0?{...i,assessmentRef:{...i.assessmentRef,sha256:'b'.repeat(64)}}:i),initialContext:undefined})}/>);
 await act(async()=>resolve(support('practice',1,'AIUTO DEL CONTESTO PRECEDENTE')));expect(screen.queryByText('AIUTO DEL CONTESTO PRECEDENTE')).toBeNull();
});
it('rejects a hint response bound to the wrong canonical reference',async()=>{
 vi.mocked(studyRequest).mockResolvedValue({...support(),assessmentRef:{...items[0].assessmentRef,sha256:'f'.repeat(64)},text:'RISPOSTA NON VINCOLATA'});
 render(<CourseAssessment items={items} lesson={lessonFor()} onInvalidated={()=>{}} initialContext={context()} editionId="course" actorId="learner"/>);fireEvent.click(screen.getByRole('button',{name:'Apri aiuto 1 di 3'}));await screen.findByRole('alert');expect(screen.queryByText('RISPOSTA NON VINCOLATA')).toBeNull();
});
it('shows only server receipt assistance and never infers autonomy from an empty history',()=>{
 const diagnostic=safeDTO.diagnosticItems[0],lesson=lessonFor(diagnostic.lessonRef.id);const h={...host(),lastAttempt:{id:'receipt-attempt',text:'Originale consegnato',feedback:[],courseContext:{lessonRef:lesson.lessonRef,phase:'practice',modelId:null,parameters:{},assistance:{recorded:false,scope:'CUMULATIVE_PRIOR_HELP',events:[]}}}};
 render(<CourseScope course={course()} allowLocalDrafts={false} labHost={h as never} initialCourseLesson={{lessonRef:lesson.lessonRef,phase:'practice'}}/>);expect(screen.getByText(/questo non prova autonomia o comprensione/)).toBeTruthy();
});

it('uses the registry-verified official2026 source while distinguishing human acceptance',()=>{
 window.history.replaceState({},'','/corsi/');render(<PublicCoursePlayer/>);expect((screen.getByRole('link',{name:'Syllabus ufficiale MUR 2026'}) as HTMLAnchorElement).getAttribute('href')).toBe('https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_FISICA_%20finale%202026.pdf');expect(screen.queryByText(/accesso diretto al PDF MUR non riuscito/)).toBeNull();expect(screen.getByText(/La verifica dei byte della fonte è distinta/)).toBeTruthy();
});
