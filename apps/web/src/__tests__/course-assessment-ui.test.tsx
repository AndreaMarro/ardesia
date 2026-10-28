// @vitest-environment jsdom
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {CourseAssessment} from '../components/CourseAssessment';
import {learningCourses} from '../courseLearning';
import {courseLessonFromContext,sameCourseLesson} from '../course';
import {scienceTimestamp} from '../features/science-library/scienceTimestamp';
const typedDemo=learningCourses.courses.find(c=>c.pathId==='fluidi-termodinamica')!.lessons[0];
const lesson={...typedDemo,activityId:'course-reasoning-v1'};
const item={id:'assessment-one',objectiveId:lesson.objectiveIds[0],prompt:'Motiva il vincolo del gas.',transfer:{prompt:'Che cosa cambia se il vincolo è diverso?'},assessmentRef:{id:'assessment-one',version:1,sha256:'a'.repeat(64)}};
beforeEach(()=>vi.spyOn(window,'confirm').mockReturnValue(true));
afterEach(()=>{cleanup();vi.restoreAllMocks();});
describe('canonical manual assessment in the existing submission flow',()=>{
 it('prepares exact practice and transfer refs and invalidates edits',async()=>{
  const commit=vi.fn(),invalidate=vi.fn();render(<CourseAssessment items={[item]} lesson={lesson} onCommit={commit} onInvalidated={invalidate}/>);
  fireEvent.click(screen.getByText(/Verifica il ragionamento/));await screen.findByLabelText('La tua risposta alla verifica');
  fireEvent.change(screen.getByLabelText('La tua risposta alla verifica'),{target:{value:'Mantengo fissi quantità e temperatura.'}});
  fireEvent.click(screen.getByRole('button',{name:'Prepara questa risposta per il docente'}));
  expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({activityId:'course-reasoning-v1',parameters:{},courseLesson:{lessonRef:lesson.lessonRef,phase:'practice',assessmentRef:item.assessmentRef}}));
  fireEvent.click(screen.getByRole('button',{name:'Problema di trasferimento'}));expect(commit).toHaveBeenLastCalledWith(null);
  expect(screen.getByText(item.transfer.prompt)).toBeTruthy();expect((screen.getByLabelText('La tua risposta alla verifica') as HTMLTextAreaElement).value).toBe('');
 });
 it('rejects a historical assessment revision without substituting another item',()=>{
  render(<CourseAssessment items={[item]} lesson={lesson} onInvalidated={()=>{}} initialContext={{lessonRef:lesson.lessonRef,phase:'transfer',assessmentRef:{...item.assessmentRef,sha256:'b'.repeat(64)}}}/>);
  expect(screen.getByRole('heading',{name:'Verifica non disponibile'})).toBeTruthy();expect(screen.queryByLabelText('La tua risposta alla verifica')).toBeNull();
 });
 it('keeps assessment identity in corrections and compares exact refs',()=>{
  const context={lessonRef:lesson.lessonRef,phase:'transfer' as const,stepId:'independent',assessmentRef:item.assessmentRef};
  expect(courseLessonFromContext({...context,modelId:null,parameters:{}})).toEqual(context);
  expect(sameCourseLesson(context,{...context,assessmentRef:{...item.assessmentRef,sha256:'b'.repeat(64)}})).toBe(false);
 });
 it('accepts assessment refs independently of object property order',()=>{
  const base={lessonRef:lesson.lessonRef,phase:'practice' as const};
  const projected={...base,assessmentRef:{id:'one',version:1,sha256:'a'.repeat(64)}};
  const receipt={...base,assessmentRef:{id:'one',sha256:'a'.repeat(64),version:1}};
  expect(sameCourseLesson(projected,receipt)).toBe(true);expect(sameCourseLesson(projected,base)).toBe(false);
 });
 it('allows explicit selection after resuming another valid assessment',async()=>{
  const other={...item,id:'assessment-two',prompt:'Un secondo problema.',assessmentRef:{...item.assessmentRef,id:'assessment-two'}};
  render(<CourseAssessment items={[item,other]} lesson={lesson} onInvalidated={()=>{}} initialContext={{lessonRef:lesson.lessonRef,phase:'practice',assessmentRef:item.assessmentRef}}/>);
  fireEvent.change(screen.getByLabelText('Problema'),{target:{value:other.id}});
  expect(screen.getByText(other.prompt)).toBeTruthy();expect(screen.queryByText('Verifica non disponibile')).toBeNull();
 });
 it('pins the current reader step after resuming an older step',()=>{
  const commit=vi.fn(),context={lessonRef:lesson.lessonRef,phase:'practice' as const,stepId:'older',assessmentRef:item.assessmentRef};
  const view=render(<CourseAssessment items={[item]} lesson={lesson} onCommit={commit} onInvalidated={()=>{}} initialContext={context} stepId="older"/>);
  fireEvent.change(screen.getByLabelText('La tua risposta alla verifica'),{target:{value:'Una spiegazione originale.'}});
  view.rerender(<CourseAssessment items={[item]} lesson={lesson} onCommit={commit} onInvalidated={()=>{}} initialContext={context} stepId="current"/>);
  fireEvent.click(screen.getByRole('button',{name:'Prepara questa risposta per il docente'}));
  expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({courseLesson:expect.objectContaining({stepId:'current'})}));
 });
 it('does not offer manual-only assessments on a typed legacy demonstration',()=>{
  render(<CourseAssessment items={[item]} lesson={typedDemo} onInvalidated={()=>{}}/>);
  expect(screen.queryByText(/Verifica il ragionamento/)).toBeNull();
 });
 it('handles authoritative Unix clocks as well as historical ISO timestamps',()=>{
  expect(scienceTimestamp(1793188800)).toBe(Date.parse('2026-10-28T12:00:00Z'));
  expect(scienceTimestamp('2026-10-28T12:00:00Z')).toBe(scienceTimestamp(1793188800));
 });
});
