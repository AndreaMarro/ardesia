// @vitest-environment jsdom
import {beforeEach,afterEach,test,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {PublicCoursePlayer} from '../features/PublicCoursePlayer';
import {learningCourses} from '../courseLearning';
import {installPublicBrowserStorage} from './public-storage-fixture';
const url=location.href;
beforeEach(installPublicBrowserStorage);
afterEach(()=>{cleanup();localStorage.clear();history.replaceState(null,'',url);vi.unstubAllGlobals();});
test('four stable paths expose the frozen whole denominator, not four complete courses',()=>{
 history.replaceState(null,'','/corsi/');render(<PublicCoursePlayer/>);
 for(const course of learningCourses.courses){expect(screen.getByRole('link',{name:'Apri '+course.title}).getAttribute('href')).toBe('/corsi/'+course.pathId+'/');}
 expect(screen.getAllByText(/200 sotto-obiettivi/).length).toBeGreaterThan(0);
});
for(const path of ['strumenti-meccanica','fluidi-termodinamica','elettricita-magnetismo','onde-ottica-radiazioni'])test('reachable prediction and changed problem for '+path,()=>{
 history.replaceState(null,'','/corsi/'+path+'/');render(<PublicCoursePlayer/>);
 expect(screen.queryByTestId('course-result')).toBeNull();
 expect((screen.getByRole('button',{name:'Confronta la previsione'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.change(screen.getByLabelText('La tua previsione numerica'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));expect(screen.getByTestId('course-result')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Un problema diverso'}));expect((screen.getByLabelText('La tua previsione numerica') as HTMLInputElement).value).toBe('');expect(screen.queryByTestId('course-result')).toBeNull();
});
test('explicit local note reopens same revision without result and remembers assistance',()=>{
 history.replaceState(null,'','/corsi/elettricita-magnetismo/');const view=render(<PublicCoursePlayer/>);
 fireEvent.click(screen.getByRole('button',{name:'Apri la spiegazione'}));
 fireEvent.change(screen.getByLabelText('La tua previsione numerica'),{target:{value:'1'}});
 fireEvent.change(screen.getByLabelText('Il tuo quaderno: ragionamento e domande'),{target:{value:'In serie la corrente è comune.'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva bozza su questo browser'}));view.unmount();render(<PublicCoursePlayer/>);
 expect((screen.getByLabelText('La tua previsione numerica') as HTMLInputElement).value).toBe('1');expect((screen.getByLabelText('Il tuo quaderno: ragionamento e domande') as HTMLInputElement).value).toBe('In serie la corrente è comune.');
 expect(screen.getByText(/Assistenza richiesta/)).toBeTruthy();expect(screen.queryByTestId('course-result')).toBeNull();
});
test('obsolete URL revision is rejected instead of silently showing current lesson',()=>{
 history.replaceState(null,'','/corsi/strumenti-meccanica/?rev=obsolete');render(<PublicCoursePlayer/>);
 expect(screen.getByRole('heading',{name:'Riferimento non disponibile'})).toBeTruthy();expect(screen.queryByLabelText('La tua previsione numerica')).toBeNull();
});

test('changing model inputs never repeats a numerical answer from the starting scenario',()=>{
 history.replaceState(null,'','/corsi/elettricita-magnetismo/');render(<PublicCoursePlayer/>);
 fireEvent.change(screen.getByLabelText('Tensione [V]'),{target:{value:'18'}});
 expect(screen.getByText(/parametri attualmente selezionati/)).toBeTruthy();
 fireEvent.change(screen.getByLabelText('La tua previsione numerica'),{target:{value:'1.5'}});
 fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 expect(screen.getByTestId('course-result').textContent).toContain('1,5 A');
 expect(screen.queryByText('Valore atteso 1 A.')).toBeNull();
});

test('authenticated course mode avoids anonymous drafts and invalidates prepared submission on edits',async()=>{
 const {CourseScope}=await import('../features/PublicCoursePlayer');
 const course=learningCourses.courses.find(c=>c.pathId==='elettricita-magnetismo')!;
 history.replaceState(null,'','/?view=classroom&edition=electro');
 const read=vi.spyOn(localStorage,'getItem');const commit=vi.fn();
 render(<CourseScope course={course} allowLocalDrafts={false} onCommit={commit}/>);
 expect(read).not.toHaveBeenCalled();expect(screen.queryByText('Salva bozza su questo browser')).toBeNull();
 fireEvent.change(screen.getByLabelText('La tua previsione numerica'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 expect(commit.mock.calls.at(-1)?.[0]).toMatchObject({activityId:'dc-resistance-v1',parameters:{voltage:12}});
 fireEvent.change(screen.getByLabelText('Tensione [V]'),{target:{value:'18'}});
 expect(commit.mock.calls.at(-1)?.[0]).toBeNull();
});


test('editorial qualitative problem preserves its authored prompt and feedback',async()=>{
 const {CourseScope}=await import('../features/PublicCoursePlayer');
 const original=learningCourses.courses[0];
 const lesson={...original.lessons[0],id:'editorial-example',activityId:undefined,modelCases:undefined,controls:undefined,practice:{prompt:'Spiega perché il vincolo cambia il risultato.',answer:{value:'Confronta il vincolo dichiarato.',unit:'ragionamento'},feedback:['Recupera il vincolo prima del calcolo.']}};
 const course={...original,lessons:[lesson]};
 render(<CourseScope course={course} allowLocalDrafts={false}/>);
 expect(screen.getByText(lesson.practice.prompt)).toBeTruthy();
 fireEvent.change(screen.getByLabelText('La tua risposta o il tuo ragionamento'),{target:{value:'Il vincolo determina la variabile costante.'}});
 fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 expect(screen.getByText(lesson.practice.feedback[0])).toBeTruthy();
});

test('opening assistance invalidates a previously prepared unassisted submission',async()=>{
 const {CourseScope}=await import('../features/PublicCoursePlayer');const commit=vi.fn();
 render(<CourseScope course={learningCourses.courses[2]} allowLocalDrafts={false} onCommit={commit}/>);
 fireEvent.change(screen.getByLabelText('La tua previsione numerica'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
 expect(commit.mock.calls.at(-1)?.[0]).toMatchObject({activityId:'dc-resistance-v1'});
 fireEvent.click(screen.getByRole('button',{name:'Apri la spiegazione'}));
 expect(commit.mock.calls.at(-1)?.[0]).toBeNull();
});
