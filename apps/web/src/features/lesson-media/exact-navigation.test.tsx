// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import {LessonMediaLibrary} from './LessonMediaLibrary';
import {SourceViewer} from '../../components/SourceViewer';
import {source} from './fixture';
import type {StudyResource,Workspace} from '../../api';

const me={id:'student',role:'student' as const,synthetic:true as const};
const workspace=(resources:StudyResource[]):Workspace=>({enrolled:true,
  edition:{id:'fluidi',teacherId:'tutor',capacity:4,priceMinor:0,state:'running',sessions:[],timezone:'Europe/Rome'},
  resources,submissions:[],layouts:[],layoutSaved:false,layoutVersion:'v1'});
afterEach(()=>{cleanup();vi.unstubAllGlobals();history.replaceState(null,'','/');});

test('a passage viewer links to its exact media revision while preserving the journey checkpoint',async()=>{
  const original={...source(),revisionId:'historical'};
  history.replaceState(null,'','/?view=classroom&edition=fluidi&journey=checkpoint-one');
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json(original)));
  render(<SourceViewer reference={{resourceId:original.id,revisionId:original.revisionId,contextId:original.contextId}}/>);
  const link=await screen.findByRole('link',{name:/Apri audio e lavagna collegati/});
  expect(link.getAttribute('target')).toBe('_blank');
  expect(link.getAttribute('rel')?.split(/\s+/)).toEqual(expect.arrayContaining(['noopener','noreferrer']));
  expect(link.textContent).toContain('in un’altra scheda');
  const target=new URL(link.getAttribute('href')!,location.href);
  expect(target.origin).toBe(location.origin);
  expect(Object.fromEntries(target.searchParams)).toMatchObject({view:'materials',edition:'fluidi',mediaSource:original.id,mediaRevision:'historical',journey:'checkpoint-one'});
});

test('an exact Materials route opens the historical passage despite a different workspace head',async()=>{
  const original={...source(),revisionId:'historical'};
  const latest={...source('source','take-two'),revisionId:'current',sha256:'c'.repeat(64),text:source('source','take-two').text.replace('La portata resta fissata.','Un altro passaggio corrente.')};
  history.replaceState(null,'','/?view=materials&mediaSource=source&mediaRevision=historical');
  const fetch=vi.fn(async(path:string)=>Response.json(path.endsWith('/historical')?original:latest));vi.stubGlobal('fetch',fetch);
  render(<LessonMediaLibrary me={me} data={workspace([latest])} onUpdate={async()=>{}}/>);
  const detail=await screen.findByRole('article',{name:'Passaggio selezionato'});
  expect(within(detail).getByText('La portata resta fissata.')).toBeTruthy();
  expect(within(detail).queryByText('Un altro passaggio corrente.')).toBeNull();
  expect(fetch.mock.calls.every(([path])=>path.endsWith('/historical'))).toBe(true);
});

test.each([403,404])('an exact media %s never opens the current passage instead',async status=>{
  const latest={...source(),revisionId:'current'};
  history.replaceState(null,'','/?view=materials&mediaSource=source&mediaRevision=unavailable');
  vi.stubGlobal('fetch',vi.fn(async(path:string)=>path.endsWith('/unavailable')?Response.json({error:status===403?'forbidden':'not_found'},{status}):Response.json(latest)));
  render(<LessonMediaLibrary me={me} data={workspace([latest])} onUpdate={async()=>{}}/>);
  await screen.findByRole('alert');
  expect(screen.queryByRole('button',{name:'Apri player e quaderno'})).toBeNull();
});

test('an exact passage from another edition is rejected even when its resource and revision match',async()=>{
  history.replaceState(null,'','/?view=materials&mediaSource=source&mediaRevision=historical');
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json({...source(),revisionId:'historical',editionId:'other'})));
  render(<LessonMediaLibrary me={me} data={workspace([])} onUpdate={async()=>{}}/>);
  await screen.findByRole('alert');
  expect(screen.queryByRole('button',{name:'Apri player e quaderno'})).toBeNull();
});

test.each(['mediaSource=source&mediaRevision=', 'mediaSource=source&mediaRevision=one&mediaRevision=two', 'mediaRevision=orphan'])(
  'a malformed exact route %s cannot become an unpinned opening',async query=>{
    history.replaceState(null,'','/?view=materials&'+query);
    const fetch=vi.fn(async()=>Response.json(source()));vi.stubGlobal('fetch',fetch);
    render(<LessonMediaLibrary me={me} data={workspace([source()])} onUpdate={async()=>{}}/>);
    await screen.findByRole('alert');
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole('button',{name:'Apri player e quaderno'})).toBeNull();
  },
);
