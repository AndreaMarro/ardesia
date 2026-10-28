/// <reference types="node" />
// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {CourseScope} from '../features/PublicCoursePlayer';
import {learningCourses,type CourseLesson} from '../courseLearning';
import {scienceApi} from '../features/science-library/scienceApi';
import {getLab,newLabSnapshot,type LabId} from '../features/science-library/FluidThermoActivity';
import type {Capability,SavedScience,Snapshot} from '../features/science-library/types';
import {courseLessonFromContext,sameCourseLesson} from '../course';
const actor={id:'learner',role:'student' as const,synthetic:true as const};
function capability(id:LabId):Capability{const d=getLab(id);return{id:d.capabilityId,version:1,implementationSha256:'c'.repeat(64),title:d.title,fluidLab:{modelId:id,pluginId:'io.ardesia.fluid-thermo',pluginVersion:'1.0.0',modelVersion:1},primaryOutput:{label:'Valore',unit:'Pa'},domain:'Ideale',explanation:[],transfer:{},distribution:'BUNDLED_FIRST_PARTY',editorialStatus:'DRAFT',parameters:d.parameters.map(p=>({key:p.key,label:p.label,unit:p.unit,default:p.default,minimum:p.min,maximum:p.max}))};}
function fixture(id='ds-2026-u3-02'){
 const course=structuredClone(learningCourses.courses.find(c=>c.pathId==='fluidi-termodinamica')!);
 const lesson=structuredClone(course.lessons[0]);delete lesson.activityId;delete lesson.modelCases;delete lesson.controls;
 lesson.id=id;lesson.title='Primo fenomeno';lesson.lessonRef={id,version:1,sha256:'a'.repeat(64)};
 lesson.learningSequence=[{id:'prediction',kind:'prediction',title:'Prevedi',prompt:'Formula una previsione.'},{id:'comparison',kind:'comparison',title:'Confronta',prompt:'Confronta il fenomeno.'}];
 const second=structuredClone(lesson);second.id='second-lesson';second.title='Secondo fenomeno';second.lessonRef={id:second.id,version:1,sha256:'b'.repeat(64)};
 course.lessons=[lesson,second];return{course,lesson,second};
}
function saved(lesson:CourseLesson,model:LabId='hydrostatic'):SavedScience{const cap=capability(model),labSnapshot=newLabSnapshot(model);labSnapshot.configuration.lessonRef=lesson.lessonRef;return response({schemaVersion:1,capabilityId:cap.id,capabilityVersion:1,implementationSha256:cap.implementationSha256,parameters:labSnapshot.configuration.parameters,prediction:'',note:'',labSnapshot,courseLesson:{lessonRef:lesson.lessonRef,phase:'practice',stepId:'prediction'}});}
function response(snapshot:Snapshot):SavedScience{return{snapshot,supported:true,resource:{id:'saved-lab',revisionId:'revision-1',contextId:'context-1',ownerId:actor.id,editionId:'edition',kind:'science-resource',visibility:'private',text:JSON.stringify(snapshot),sha256:'d'.repeat(64)}};}
function host(resources:SavedScience[]=[]){return{me:actor,editionId:'edition',saved:resources,onSaved:vi.fn(),onInvalidated:vi.fn()};}
function catalog(...ids:LabId[]){vi.spyOn(scienceApi,'catalog').mockResolvedValue({schemaVersion:1,capabilities:ids.map(capability),courses:[],referenceScope:'edition'});}
afterEach(()=>{cleanup();vi.restoreAllMocks();history.replaceState(null,'','/');});

test.each([false,true])('explicit lesson URL wins over automatic saved resume (exact revision: %s)',exact=>{
 const {course,lesson,second}=fixture();catalog('hydrostatic');
 history.replaceState(null,'',`/?courseLessonPath=${course.pathId}&courseLesson=${second.id}${exact?'&courseRev='+second.lessonRef.sha256:''}`);
 render(<CourseScope course={course} allowLocalDrafts={false} labHost={host([saved(lesson)])}/>);
 expect(screen.getByRole('heading',{name:second.title})).toBeTruthy();expect(screen.queryByRole('heading',{name:'Riferimento non disponibile'})).toBeNull();
});

test.each(['comparison',undefined])('a lab correction selects the exact requested model and preserves its step (%s)',async stepId=>{
 const {course,lesson}=fixture('ds-2026-u3-04'),onCommit=vi.fn();catalog('poiseuille','hydraulic-network');
 const target={lessonRef:lesson.lessonRef,phase:'practice' as const,...(stepId?{stepId}:{})};
 render(<CourseScope course={course} allowLocalDrafts={false} labHost={host([saved(lesson,'poiseuille')])} initialActivityId="hydraulic-network-lab-v1" initialCourseLesson={target} onCommit={onCommit}/>);
 await screen.findByRole('heading',{name:getLab('hydraulic-network').title});
 expect(screen.getByLabelText('Fenomeno da esplorare')).toHaveProperty('value','hydraulic-network');
 fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'La resistenza equivalente cambia'}});fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
 expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({activityId:'hydraulic-network-lab-v1',courseLesson:target}));
});

test('an obsolete saved lesson revision is not silently resumed as current',()=>{
 const {course,lesson}=fixture(),old=saved(lesson);old.snapshot.courseLesson!.lessonRef={...lesson.lessonRef,sha256:'f'.repeat(64)};catalog('hydrostatic');
 render(<CourseScope course={course} allowLocalDrafts={false} labHost={host([old])}/>);
 expect(screen.getByRole('heading',{name:'Riferimento non disponibile'})).toBeTruthy();expect(screen.queryByRole('heading',{name:lesson.title})).toBeNull();
});

test.each(['entropy-lab-v1','invented-lab-v1'])('an unavailable or cross-lesson correction never substitutes another lab: %s',id=>{
 const {course,lesson}=fixture();catalog('hydrostatic');render(<CourseScope course={course} allowLocalDrafts={false} labHost={host()} initialActivityId={id} initialCourseLesson={{lessonRef:lesson.lessonRef,phase:'practice'}}/>);
 expect(screen.getByRole('heading',{name:'Riferimento non disponibile'})).toBeTruthy();expect(screen.queryByRole('button',{name:'Confronta la previsione'})).toBeNull();
});

test('step navigation invalidates evidence and cannot attach a late save for the old step',async()=>{
 const {course,lesson}=fixture(),labHost=host([saved(lesson)]),onCommit=vi.fn();catalog('hydrostatic');
 let resolveSave!:(value:SavedScience)=>void;let frozen!:Snapshot;
 vi.spyOn(scienceApi,'save').mockImplementation(async(_id,snapshot)=>{frozen=snapshot;return new Promise(resolve=>{resolveSave=resolve;});});
 render(<CourseScope course={course} allowLocalDrafts={false} labHost={labHost} onCommit={onCommit}/>);
 await screen.findByRole('heading',{name:getLab('hydrostatic').title});
 fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'La pressione aumenta'}});fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
 fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));await waitFor(()=>expect(resolveSave).toBeTypeOf('function'));
 onCommit.mockClear();labHost.onInvalidated.mockClear();fireEvent.click(screen.getByRole('button',{name:'2. Confronta'}));
 expect(onCommit).toHaveBeenLastCalledWith(null);expect(labHost.onInvalidated).toHaveBeenCalled();
 await act(async()=>resolveSave(response(frozen)));expect(labHost.onSaved).not.toHaveBeenCalled();expect(screen.queryByText('Salvataggio confermato dall’host.')).toBeNull();
 expect(screen.getByLabelText('La tua previsione')).toHaveProperty('value','La pressione aumenta');
 fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({courseLesson:expect.objectContaining({stepId:'comparison'})}));
});

test('correction helpers retain and compare the pinned step',()=>{
 const {lesson}=fixture(),context={modelId:'hydrostatic-lab-v1',parameters:{},lessonRef:lesson.lessonRef,phase:'practice' as const,stepId:'comparison'};
 const target=courseLessonFromContext(context);expect(target).toEqual({lessonRef:lesson.lessonRef,phase:'practice',stepId:'comparison'});
 expect(sameCourseLesson(target,{...target!,stepId:'prediction'})).toBe(false);expect(sameCourseLesson(target,{...target!})).toBe(true);
});

test('the real Core learner projection renders without reserved answers and commits manual reasoning',async()=>{
 const {execFileSync}=await import('node:child_process');const {resolve}=await import('node:path');const {existsSync}=await import('node:fs');
 const repository=existsSync(resolve(process.cwd(),'packages/engine'))?process.cwd():resolve(process.cwd(),'../..');
 const course=JSON.parse(execFileSync('python3',['-c',"import json; from lessonos.study.four_courses import course_projection; print(json.dumps(next(c for c in course_projection(synthetic=True)['courses'] if c['pathId']=='fluidi-termodinamica')))"],{cwd:repository,env:{...process.env,PYTHONPATH:resolve(repository,'packages/engine')},encoding:'utf8'}));
 const lesson=course.lessons.find((l:CourseLesson)=>l.activityId==='course-reasoning-v1') as CourseLesson;
 expect(lesson.practice).not.toHaveProperty('answer');expect(lesson.practice).not.toHaveProperty('feedback');
 const context={lessonRef:lesson.lessonRef,phase:'practice' as const},onCommit=vi.fn();catalog('hydrostatic');
 render(<CourseScope course={course} allowLocalDrafts={false} initialActivityId="course-reasoning-v1" initialCourseLesson={context} onCommit={onCommit}/>);
 expect(screen.getByRole('heading',{name:lesson.title})).toBeTruthy();
 fireEvent.change(screen.getByLabelText('La tua risposta o il tuo ragionamento'),{target:{value:'Confronto il vincolo dichiarato e giustifico il rapporto tra le grandezze.'}});fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({activityId:'course-reasoning-v1',parameters:{},courseLesson:context}));
 expect(screen.getByText(/La valutazione del ragionamento richiede revisione umana/)).toBeTruthy();expect(screen.queryByText(/Risposta proposta:/)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Un problema diverso'}));fireEvent.change(screen.getByLabelText('La tua risposta o il tuo ragionamento'),{target:{value:'Nel nuovo contesto individuo prima il vincolo e poi confronto le unità.'}});fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({activityId:'course-reasoning-v1',parameters:{},courseLesson:{lessonRef:lesson.lessonRef,phase:'transfer'}}));
});
