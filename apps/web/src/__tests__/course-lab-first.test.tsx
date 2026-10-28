// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {CourseScope} from '../features/PublicCoursePlayer';
import {learningCourses,type CourseRecord} from '../courseLearning';
vi.mock('../features/science-library/CourseLaboratories',()=>({lessonSupportsLab:()=>true,CourseLaboratories:({phase,stepId}:{phase:string;stepId?:string})=><section aria-label="Laboratorio principale" data-phase={phase} data-step={stepId}>La scena scientifica interattiva.</section>}));
const actor={id:'learner',role:'student' as const,synthetic:true as const};
function fixture(){
 const course=structuredClone(learningCourses.courses.find(c=>c.pathId==='fluidi-termodinamica')!) as CourseRecord;
 const lesson={...course.lessons[0],id:'ds-2026-u3-02',title:'Fluidi in quiete',activityId:'course-reasoning-v1',objectiveIds:['U3-02.01'],lessonRef:{id:'ds-2026-u3-02',version:1,sha256:'a'.repeat(64)},modelCases:undefined,controls:undefined,practice:{prompt:'Spiega il problema manuale della lezione.'},transfer:{prompt:'Spiega il vincolo nel nuovo problema.'},learningSequence:[{id:'prediction',kind:'prediction',title:'Prevedi',prompt:'Prevedi il fenomeno prima di variare i controlli.'}]};
 course.lessons=[lesson];course.editorialMaterials=null;course.diagnosticItems=[];course.assessmentItems=[{id:'final-U3-02.01',objectiveId:'U3-02.01',prompt:'Una prova distinta per questo obiettivo.',transfer:{prompt:'Trasferisci il ragionamento.'},assessmentRef:{id:'final-U3-02.01',version:1,sha256:'b'.repeat(64)}}];
 return {course,lesson,host:{me:actor,editionId:'course',saved:[],onSaved:vi.fn(),onInvalidated:vi.fn()}};
}
afterEach(()=>{cleanup();vi.restoreAllMocks();history.replaceState({},'','/');});
it('puts the actual private DS laboratory immediately after the current step and folds the generic exercise',()=>{
 const {course,host}=fixture();render(<CourseScope course={course} allowLocalDrafts={false} labHost={host}/>);
 const sequence=screen.getByRole('region',{name:'Passaggi della lezione'}),lab=screen.getByRole('region',{name:'Laboratorio principale'}),summary=screen.getByText('Un problema da spiegare'),disclosure=summary.closest('details')!;
 expect(lab.previousElementSibling).toBe(sequence);expect(lab.nextElementSibling).toBe(disclosure);expect(disclosure.open).toBe(false);
 // jsdom role queries retain descendants of closed native details; verify containment and the native open flag.
 expect(screen.getByRole('button',{name:'Confronta la previsione'}).closest('details')).toBe(disclosure);expect(screen.getByText(/Verifica il ragionamento/)).toBeTruthy();expect(screen.queryByRole('link',{name:'Chiedi informazioni su questo percorso'})).toBeNull();
});
it('keeps manual practice/transfer commits, current step, inputs and unsaved guard reachable inside the disclosure',()=>{
 const {course,lesson,host}=fixture(),commit=vi.fn();render(<CourseScope course={course} allowLocalDrafts={false} labHost={host} onCommit={commit}/>);
 const summary=screen.getByText('Un problema da spiegare');fireEvent.click(summary);
 fireEvent.change(screen.getByLabelText('La tua risposta o il tuo ragionamento'),{target:{value:'Una spiegazione originale del vincolo.'}});fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({activityId:'course-reasoning-v1',parameters:{},prediction:expect.stringContaining('Una spiegazione originale del vincolo.'),courseLesson:{lessonRef:lesson.lessonRef,phase:'practice',stepId:'prediction'}}));
 fireEvent.click(summary);expect((screen.getByLabelText('La tua risposta o il tuo ragionamento') as HTMLInputElement).value).toBe('Una spiegazione originale del vincolo.');const blocked=new Event('beforeunload',{cancelable:true});window.dispatchEvent(blocked);expect(blocked.defaultPrevented).toBe(true);
 fireEvent.click(summary);vi.spyOn(window,'confirm').mockReturnValue(true);fireEvent.click(screen.getByRole('button',{name:'Un problema diverso'}));expect(screen.getByRole('region',{name:'Laboratorio principale'}).getAttribute('data-phase')).toBe('transfer');
 fireEvent.change(screen.getByLabelText('La tua risposta o il tuo ragionamento'),{target:{value:'Nel trasferimento verifico il nuovo vincolo.'}});fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({courseLesson:{lessonRef:lesson.lessonRef,phase:'transfer',stepId:'prediction'}}));act(()=>commit.mock.lastCall?.[0].confirmDraft());const saved=new Event('beforeunload',{cancelable:true});window.dispatchEvent(saved);expect(saved.defaultPrevented).toBe(false);
});
it('keeps the public lesson layout and public contact unchanged',()=>{
 const {course}=fixture();render(<CourseScope course={course}/>);expect(screen.queryByText('Un problema da spiegare')).toBeNull();expect(screen.getByRole('button',{name:'Confronta la previsione'})).toBeTruthy();expect(screen.getByRole('link',{name:'Chiedi informazioni su questo percorso'})).toBeTruthy();expect(screen.queryByRole('region',{name:'Laboratorio principale'})).toBeNull();
});
