// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {fireEvent,render,screen,cleanup,act,waitFor} from '@testing-library/react';
import {useState} from 'react';
import {CourseDraftBoundary,createCourseDraftScope,useCourseDraft,confirmCourseExit,initializeCourseHistory,pushCourseHistory,acceptCoursePop} from '../courseExitGuard';
import {CourseAssessment} from '../components/CourseAssessment';
import {learningCourses} from '../courseLearning';
import {SubmissionPanel} from '../../../studio/src/study/SubmissionPanel';
import type {ActivityCommit} from '../course';
const scope=createCourseDraftScope();
function Editor({name,onSave}:{name:'lesson'|'laboratory'|'assessment';onSave?:(confirm:()=>void)=>void}){
 const work=useCourseDraft(name),[text,setText]=useState('');
 return <div><label>{name}<input value={text} onChange={e=>{setText(e.target.value);work.changed();}}/></label><button onClick={()=>{const c=work.checkpoint();onSave?.(()=>work.confirm(c));}}>Save {name}</button><button onClick={()=>{if(work.allowDiscard())setText('');}}>Reset {name}</button></div>;
}
const unload=()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;};
beforeEach(()=>{vi.spyOn(window,'confirm').mockReturnValue(false);localStorage.clear();});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('cancel preserves text, accept discards, and cleanup removes the unload guard',()=>{
 const view=render(<Editor name="laboratory"/>);fireEvent.change(screen.getByLabelText('laboratory'),{target:{value:'Un testo ancora aperto'}});
 expect(unload()).toBe(true);fireEvent.click(screen.getByText('Reset laboratory'));expect(screen.getByLabelText('laboratory')).toHaveProperty('value','Un testo ancora aperto');
 vi.mocked(window.confirm).mockReturnValue(true);fireEvent.click(screen.getByText('Reset laboratory'));expect(screen.getByLabelText('laboratory')).toHaveProperty('value','');expect(unload()).toBe(false);
 fireEvent.change(screen.getByLabelText('laboratory'),{target:{value:'Altro testo'}});view.unmount();expect(unload()).toBe(false);expect(confirmCourseExit()).toBe(true);
});
it('an old save cannot clear newer edits or a different editor',()=>{
 let labAck!:()=>void,assessmentAck!:()=>void;
 render(<CourseDraftBoundary scope={scope}><Editor name="laboratory" onSave={ack=>labAck=ack}/><Editor name="assessment" onSave={ack=>assessmentAck=ack}/></CourseDraftBoundary>);
 fireEvent.change(screen.getByLabelText('laboratory'),{target:{value:'Prima versione'}});fireEvent.click(screen.getByText('Save laboratory'));
 fireEvent.change(screen.getByLabelText('laboratory'),{target:{value:'Seconda versione'}});act(()=>labAck());expect(unload()).toBe(true);
 fireEvent.change(screen.getByLabelText('assessment'),{target:{value:'Risposta indipendente'}});fireEvent.click(screen.getByText('Save laboratory'));act(()=>labAck());expect(unload()).toBe(true);
 fireEvent.click(screen.getByText('Save assessment'));act(()=>assessmentAck());expect(unload()).toBe(false);
});
it('a cancelled Back restores the indexed entry without abandoning the editor',()=>{
 render(<Editor name="lesson"/>);initializeCourseHistory();pushCourseHistory('/?view=classroom');const original=history.state.ardesiaCourseExitIndex;pushCourseHistory('/?view=work');const current=history.state;history.replaceState({ardesiaCourseExitIndex:original},'','/?view=classroom');
 fireEvent.change(screen.getByLabelText('lesson'),{target:{value:'Da conservare'}});const go=vi.spyOn(history,'go').mockImplementation(()=>{});
 expect(acceptCoursePop(new PopStateEvent('popstate',{state:{ardesiaCourseExitIndex:original}}))).toBe(false);expect(go).toHaveBeenCalledWith(1);expect(screen.getByLabelText('lesson')).toHaveProperty('value','Da conservare');
 // Consume the browser's restoring event for this isolated test.
 history.replaceState(current,'','/?view=work');acceptCoursePop(new PopStateEvent('popstate',{state:current}));
});
it('a prepared assessment is clean only after its matching receipt checkpoint',()=>{
 const demo=learningCourses.courses.find(c=>c.pathId==='fluidi-termodinamica')!.lessons[0],lesson={...demo,activityId:'course-reasoning-v1'};
 const ref={id:'one',version:1,sha256:'a'.repeat(64)},item={id:'one',objectiveId:lesson.objectiveIds[0],prompt:'Motiva.',transfer:{prompt:'Trasferisci.'},assessmentRef:ref};let commit!:ActivityCommit;
 render(<CourseAssessment items={[item]} lesson={lesson} onCommit={v=>{if(v)commit=v;}} onInvalidated={()=>{}} initialContext={{lessonRef:lesson.lessonRef,phase:'practice',assessmentRef:ref}}/>);
 fireEvent.change(screen.getByLabelText('La tua risposta alla verifica'),{target:{value:'Prima risposta'}});fireEvent.click(screen.getByText('Prepara questa risposta per il docente'));const old=commit.confirmDraft!;
 fireEvent.change(screen.getByLabelText('La tua risposta alla verifica'),{target:{value:'Nuova risposta'}});act(()=>old());expect(unload()).toBe(true);
 fireEvent.click(screen.getByText('Prepara questa risposta per il docente'));act(()=>commit.confirmDraft!());expect(unload()).toBe(false);
});
it('the submission callback runs after the authoritative receipt, never before it',async()=>{
 let resolve!:(r:Response)=>void;const confirmed=vi.fn();vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(r=>resolve=r)));
 render(<SubmissionPanel me={{id:'guard-learner',role:'student',synthetic:true}} source={null} parentId={null} onUpdate={async()=>{}} onConfirmed={confirmed}/>);
 fireEvent.change(screen.getByLabelText('La tua spiegazione'),{target:{value:'Procedimento originale'}});fireEvent.click(screen.getByRole('button',{name:'Consegna'}));await waitFor(()=>expect(resolve).toBeTypeOf('function'));expect(confirmed).not.toHaveBeenCalled();
 await act(async()=>resolve(new Response(JSON.stringify({receiptId:'receipt-guard',revision:1}),{status:200})));expect(confirmed).toHaveBeenCalledTimes(1);
});

it('retrying pending A keeps its original confirmation observer after preparing B',async()=>{
 const sent:string[]=[],acknowledged:string[]=[];
 vi.stubGlobal('fetch',vi.fn(async(_path:string,options:RequestInit)=>{
  sent.push(JSON.parse(options.body as string).text);
  if(sent.length===1)throw Error('ambiguous response');
  return new Response(JSON.stringify({receiptId:'receipt-retry-a',revision:1}),{status:200});
 }));
 const props={me:{id:'retry-learner',role:'student' as const,synthetic:true as const},source:null,parentId:null,onUpdate:async()=>{}};
 let checkpoint!:()=>void;
 const editor=<Editor name="assessment" onSave={ack=>checkpoint=ack}/>;
 const panel=render(<>{editor}<SubmissionPanel {...props} prediction="A" onConfirmed={()=>{acknowledged.push('A');confirmA();}}/></>);
 fireEvent.change(screen.getByLabelText('assessment'),{target:{value:'A'}});fireEvent.click(screen.getByText('Save assessment'));const confirmA=checkpoint;
 fireEvent.change(screen.getByLabelText('La tua spiegazione'),{target:{value:'Procedimento originale'}});fireEvent.click(screen.getByRole('button',{name:'Consegna'}));
 await screen.findByText(/Invio non ancora confermato/);
 fireEvent.change(screen.getByLabelText('assessment'),{target:{value:'B'}});fireEvent.click(screen.getByText('Save assessment'));const confirmB=checkpoint;
 panel.rerender(<>{editor}<SubmissionPanel {...props} prediction="B" onConfirmed={()=>{acknowledged.push('B');confirmB();}}/></>);
 fireEvent.click(screen.getByRole('button',{name:'Consegna'}));await screen.findByText(/Consegnato · ricevuta receipt-retry-a/);
 expect(sent).toEqual(['Previsione: A\n\nProcedimento: Procedimento originale','Previsione: A\n\nProcedimento: Procedimento originale']);
 expect(acknowledged).toEqual(['A']);expect(screen.getByLabelText('assessment')).toHaveProperty('value','B');expect(unload()).toBe(true);
});

it('a remounted pending A cannot adopt the confirmation observer of B',async()=>{
 const acknowledged=vi.fn(),sent:string[]=[];
 vi.stubGlobal('fetch',vi.fn(async(_path:string,options:RequestInit)=>{
  sent.push(JSON.parse(options.body as string).text);
  if(sent.length===1)throw Error('ambiguous response');
  return new Response(JSON.stringify({receiptId:'receipt-remounted-a',revision:1}),{status:200});
 }));
 const props={me:{id:'remounted-learner',role:'student' as const,synthetic:true as const},source:null,parentId:null,onUpdate:async()=>{}};
 const panel=render(<SubmissionPanel {...props} prediction="A" onConfirmed={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('La tua spiegazione'),{target:{value:'Procedimento originale'}});fireEvent.click(screen.getByRole('button',{name:'Consegna'}));
 await screen.findByText(/Invio non ancora confermato/);panel.unmount();
 render(<SubmissionPanel {...props} prediction="B" onConfirmed={acknowledged}/>);
 fireEvent.click(screen.getByRole('button',{name:'Consegna'}));await screen.findByText(/Consegnato · ricevuta receipt-remounted-a/);
 expect(sent[1]).toBe(sent[0]);expect(acknowledged).not.toHaveBeenCalled();
});

it('a failed local confirmation observer cannot downgrade an authoritative receipt',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({receiptId:'receipt-observer',revision:1}),{status:200})));
 render(<SubmissionPanel me={{id:'observer-learner',role:'student',synthetic:true}} source={null} parentId={null} onUpdate={async()=>{}} onConfirmed={()=>{throw Error('local observer failed');}}/>);
 fireEvent.change(screen.getByLabelText('La tua spiegazione'),{target:{value:'Procedimento originale'}});fireEvent.click(screen.getByRole('button',{name:'Consegna'}));await screen.findByText(/Consegnato · ricevuta receipt-observer/);expect(screen.queryByText(/non ancora confermato/)).toBeNull();
});
