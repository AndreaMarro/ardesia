// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {LessonMediaLibrary} from './LessonMediaLibrary';
import {defaultIndex,INDEX_KIND} from './model';
import {source} from './fixture';
import type {Workspace,StudyResource} from '../../api';

const me={id:'tutor',role:'teacher' as const,synthetic:true as const};
function data(resources:StudyResource[]):Workspace{return {enrolled:true,edition:{id:'fluidi',teacherId:'tutor',capacity:4,priceMinor:0,state:'running',sessions:[],timezone:'Europe/Rome'},resources,submissions:[],layouts:[],layoutSaved:false,layoutVersion:'v1'};}
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();history.replaceState(null,'','/');});

test('search, edit, save and reopen retains recording identity and exact cue times',async()=>{
  const a=source(),b=source('second','take-two');let saved:StudyResource|null=null;
  const fetch=vi.fn(async(_url:unknown,init?:RequestInit)=>{
    if(init?.method==='POST'){const body=JSON.parse(init.body as string);saved={...a,id:'index',revisionId:'index-rev',kind:INDEX_KIND,text:body.text};return Response.json(saved);}
    return Response.json(a);
  });vi.stubGlobal('fetch',fetch);
  const update=vi.fn(async()=>{});const view=render(<LessonMediaLibrary me={me} data={data([a,b])} onUpdate={update}/>);
  fireEvent.click(screen.getAllByRole('button',{name:/Il vincolo/})[0]);
  await screen.findByRole('button',{name:'Apri player e quaderno'});
  fireEvent.click(screen.getByText('Modifica capitoli e trascrizione'));
  fireEvent.change(screen.getByLabelText('Trascrizione 1'),{target:{value:'Il vincolo resta Q costante.'}});
  fireEvent.click(screen.getByRole('button',{name:'Salva indice e trascrizione'}));
  await waitFor(()=>expect(update).toHaveBeenCalledOnce());
  expect(saved).not.toBeNull();const index=JSON.parse(saved!.text);
  expect(index.cues[0]).toMatchObject({startMs:0,endMs:10000,text:'Il vincolo resta Q costante.'});
  expect(index.source.id).toBe(a.id);
  view.unmount();render(<LessonMediaLibrary me={me} data={data([a,b,saved!])} onUpdate={update}/>);
  expect(await screen.findByText('Il vincolo resta Q costante.',{selector:'p'})).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Cerca nelle trascrizioni e nei capitoli'),{target:{value:'Q costante'}});
  expect(within(screen.getByRole('navigation',{name:'Passaggi registrati'})).getAllByRole('button')).toHaveLength(1);
  expect(within(screen.getByRole('navigation',{name:'Passaggi registrati'})).getByRole('button',{name:/take-one/})).toBeTruthy();
},30000);

test('rechecks source before opening canonical player and rejects withdrawn source',async()=>{
  const a=source();let denied=false;
  const fetch=vi.fn(async()=>denied?Response.json({error:'not_found'},{status:404}):Response.json(a));vi.stubGlobal('fetch',fetch);
  const replace=vi.fn(),close=vi.fn();const popup={opener:{},location:{replace},close};vi.spyOn(window,'open').mockReturnValue(popup as unknown as Window);
  render(<LessonMediaLibrary me={me} data={data([a])} onUpdate={async()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:/Il vincolo/}));
  fireEvent.click(await screen.findByRole('button',{name:'Apri player e quaderno'}));
  await waitFor(()=>expect(replace).toHaveBeenCalledOnce());
  const url=new URL(replace.mock.calls[0][0]);expect(url.searchParams.get('recording')).toBe('take-one');expect(url.searchParams.get('at')).toBe('11000');
  denied=true;
  fireEvent.click(screen.getByRole('button',{name:'Apri player e quaderno'}));
  await screen.findByRole('alert');expect(replace).toHaveBeenCalledOnce();expect(close).toHaveBeenCalledOnce();
},30000);

test('student sees transcript but no publication editor; invalid/other-edition sources are excluded',async()=>{
  const a=source();vi.stubGlobal('fetch',vi.fn(async()=>Response.json(a)));
  render(<LessonMediaLibrary me={{id:'student',role:'student',synthetic:true}} data={data([a,{...source('foreign'),editionId:'other'},{...source('bad'),text:'{}'}])} onUpdate={async()=>{}}/>);
  expect(screen.getByText('1 passaggio')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/Il vincolo/}));
  await screen.findByRole('button',{name:'Apri player e quaderno'});
  expect(screen.queryByText('Modifica capitoli e trascrizione')).toBeNull();
},30000);

test('an unmounted delayed source cannot open a player in another edition',async()=>{
  const a=source();let resolve:((r:Response)=>void)|undefined;let count=0;
  vi.stubGlobal('fetch',vi.fn(async()=>++count===1?Response.json(a):new Promise<Response>(r=>{resolve=r;})));
  const replace=vi.fn(),close=vi.fn();vi.spyOn(window,'open').mockReturnValue({location:{replace},close} as unknown as Window);
  const view=render(<LessonMediaLibrary me={me} data={data([a])} onUpdate={async()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:/Il vincolo/}));fireEvent.click(await screen.findByRole('button',{name:'Apri player e quaderno'}));
  view.unmount();resolve!(Response.json(a));await waitFor(()=>expect(close).toHaveBeenCalledOnce());expect(replace).not.toHaveBeenCalled();
},30000);

test('a failed attachment preflight preserves an editable draft and allows removing the withdrawn link',async()=>{
  const a=source(),doc=defaultIndex(a)!;doc.links=[{resourceId:'withdrawn',revisionId:'rev-withdrawn',label:'Fonte ritirata'}];
  const indexed={...a,id:'index',revisionId:'index-rev',kind:INDEX_KIND,text:JSON.stringify(doc)};
  vi.stubGlobal('fetch',vi.fn(async(url:unknown,init?:RequestInit)=>{
    if(String(url).includes('/withdrawn/'))return Response.json({error:'not_found'},{status:404});
    if(init?.method==='POST')return Response.json({...indexed,text:JSON.parse(init.body as string).text,revisionId:'new-index-rev'});
    return Response.json(a);
  }));
  const update=vi.fn(async()=>{});render(<LessonMediaLibrary me={me} data={data([a,indexed])} onUpdate={update}/>);
  fireEvent.click(screen.getByRole('button',{name:/Il vincolo/}));await screen.findByRole('button',{name:'Apri player e quaderno'});
  fireEvent.click(screen.getByText('Modifica capitoli e trascrizione'));fireEvent.change(screen.getByLabelText('Trascrizione 1'),{target:{value:'Bozza da preservare.'}});
  fireEvent.click(screen.getByRole('button',{name:'Salva indice e trascrizione'}));await screen.findByRole('alert');
  expect(screen.getByLabelText('Trascrizione 1').matches(':disabled')).toBe(false);
  fireEvent.click(screen.getByRole('button',{name:'Rimuovi collegamento 1'}));
  expect((screen.getByLabelText('Trascrizione 1') as HTMLTextAreaElement).value).toBe('Bozza da preservare.');
  fireEvent.click(screen.getByRole('button',{name:'Salva indice e trascrizione'}));await waitFor(()=>expect(update).toHaveBeenCalledOnce());
},30000);
