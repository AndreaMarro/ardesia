// @vitest-environment jsdom
import {afterEach,beforeAll,beforeEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Classroom} from '../features/Classroom';
import {learningCourses} from '../courseLearning';
import {installPublicBrowserStorage} from './public-storage-fixture';
import type {Workspace} from '../api';
vi.mock('../integrations/notebook/ScientificNotebooks',()=>({ScientificNotebooks:()=>null}));
// This contract tests correction routing; load the real lazy consumer before the test clock.
beforeAll(async()=>{await import('../components/CourseLearningWorkspace');});
beforeEach(installPublicBrowserStorage);
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
test('retry selects the original model and changing lessons cannot carry its parent into another model',async()=>{
 const course=learningCourses.courses[0];const sent:Record<string,unknown>[]=[];
 const originalLesson=course.lessons.find(l=>l.activityId==='kinematics-v1')!;
 const me={id:'student-synthetic',role:'student' as const,synthetic:true as const};
 const data={enrolled:true,edition:{id:'mechanics',teacherId:'owner',capacity:10,priceMinor:0,state:'collecting',sessions:[],timezone:'Europe/Rome',...course.packRef,entryActivityId:'hooke-v1'},resources:[],submissions:[{id:'retry-kin',student_id:me.id,activity_id:'kinematics-v1',source_refs:[],courseContext:{lessonRef:originalLesson.lessonRef,phase:'practice'}}],layouts:[],layoutSaved:true,layoutVersion:'a'.repeat(64)} as unknown as Workspace;
 vi.stubGlobal('fetch',vi.fn(async(path:string,init?:RequestInit)=>{
  if(path.startsWith('/study/course-learning'))return new Response(JSON.stringify({course}));
  if(path==='/study/submissions'){sent.push(JSON.parse(init!.body as string));return new Response(JSON.stringify({receiptId:'receipt-'+sent.length,revision:sent.length}));}
  return new Response(JSON.stringify({threads:[],confirmedOpenCount:0,candidateCount:0}));
 }));
 render(<Classroom me={me} data={data} parentId="retry-kin" onUpdate={async()=>{}}/>);
 await screen.findByLabelText('Posizione iniziale x₀ [m]');
 fireEvent.change(screen.getByLabelText('La tua previsione numerica'),{target:{value:'6'}});
 fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 fireEvent.change(screen.getByLabelText('La tua spiegazione'),{target:{value:'Uso la coordinata x e il tempo dichiarato.'}});
 fireEvent.click(screen.getByRole('button',{name:'Consegna'}));
 await waitFor(()=>expect(sent).toHaveLength(1));
 expect(sent[0]).toMatchObject({activityId:'kinematics-v1',parentId:'retry-kin',courseLesson:{lessonRef:originalLesson.lessonRef,phase:'practice'}});
 await screen.findByText(/Consegnato · ricevuta receipt-1/);
 const spring=course.lessons.find(l=>l.activityId==='hooke-v1')!;
 fireEvent.click(screen.getByRole('button',{name:'1. '+spring.title}));
 fireEvent.change(screen.getByLabelText('La tua previsione numerica'),{target:{value:'0.2'}});
 fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 fireEvent.change(screen.getByLabelText('La tua spiegazione'),{target:{value:'Qui uso il vincolo statico della molla.'}});
 fireEvent.click(screen.getByRole('button',{name:'Consegna'}));
 await waitFor(()=>expect(sent).toHaveLength(2));
 expect(sent[1]).toMatchObject({activityId:'hooke-v1',parentId:null});
});
