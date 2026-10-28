// @vitest-environment jsdom
import {useState} from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import App from '../App';
import {useCourseDraft} from '../courseExitGuard';
import {endStudySession,studySessionEpoch} from '../../../studio/src/study/sessionBoundary';
vi.mock('../features/Classroom',()=>({Classroom:()=>{
 const draft=useCourseDraft('lesson'),[text,setText]=useState('');
 return <label>Guarded response<input value={text} onChange={e=>{setText(e.target.value);draft.changed();}}/></label>;
}}));
vi.mock('../features/Work',()=>({Work:()=> <h1>Work destination</h1>}));
const me={id:'exit-learner',role:'student',synthetic:true};
const editions=['first','second'].map(id=>({id,title:'Course '+id,teacherId:'teacher',courseId:'fluidi-termodinamica',packId:'sf-fluidi-termodinamica-v1',packVersion:1,packSha256:'a'.repeat(64),state:'running',sessions:[],timezone:'Europe/Rome'}));
beforeEach(()=>{
 history.replaceState(null,'','/?view=classroom&edition=first');localStorage.clear();vi.spyOn(window,'confirm').mockReturnValue(false);vi.stubGlobal('scrollTo',vi.fn());
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>new Response(JSON.stringify(path==='/study/me'?me:path==='/study/course'?{...editions[0],capacity:10,priceMinor:3900,scope:'DRAFT'}:path.startsWith('/study/editions?')?{items:editions,nextCursor:null}:path.startsWith('/study/workspace?')?{edition:editions.find(e=>path.includes(e.id))||editions[0],enrolled:true,resources:[],submissions:[],layouts:[],layoutSaved:false,layoutVersion:'layout'}:{}))));
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('App cancellation preserves view, edition and raw response; accepting exits',async()=>{
 render(<App/>);fireEvent.change(await screen.findByLabelText('Guarded response'),{target:{value:'Non ancora confermato'}});
 fireEvent.click(screen.getByRole('button',{name:/^Il mio lavoro/}));expect(screen.getByLabelText('Guarded response')).toHaveProperty('value','Non ancora confermato');expect(location.search).toContain('view=classroom');
 fireEvent.change(screen.getByLabelText('Edizione corrente'),{target:{value:'second'}});expect(screen.getByLabelText('Edizione corrente')).toHaveProperty('value','first');expect(location.search).toContain('edition=first');
 vi.mocked(window.confirm).mockReturnValue(true);fireEvent.click(screen.getByRole('button',{name:/^Il mio lavoro/}));await screen.findByRole('heading',{name:'Work destination'});expect(location.search).toContain('view=work');
});
it('forced session rejection clears the surface without offering to retain access',async()=>{
 render(<App/>);fireEvent.change(await screen.findByLabelText('Guarded response'),{target:{value:'Testo del primo account'}});vi.mocked(window.confirm).mockClear();
 act(()=>{endStudySession('rejected',studySessionEpoch());});await waitFor(()=>expect(screen.queryByLabelText('Guarded response')).toBeNull());expect(window.confirm).not.toHaveBeenCalled();
 const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);expect(event.defaultPrevented).toBe(false);
});
