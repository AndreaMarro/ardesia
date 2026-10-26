// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {ReplayCaptions} from './ReplayCaptions';
import {captionReplayUrl,type PlaybackIdentity} from '../../../web/src/features/lesson-media/playback';
import {defaultIndex,INDEX_KIND} from '../../../web/src/features/lesson-media/model';
import {source} from '../../../web/src/features/lesson-media/fixture';
import type {StudyResource} from '../../../web/src/api';

const a=source(),doc=defaultIndex(a)!;
doc.cues=[{id:'first',startMs:125,endMs:2250,text:'Δp < 10 kPa.'},{id:'second',startMs:3500,endMs:9875,text:'0 < x < 5 e y > 2.'}];
const indexed:StudyResource={...a,id:'index',revisionId:'index-v1',kind:INDEX_KIND,sha256:'c'.repeat(64),text:JSON.stringify(doc)};
const identity:PlaybackIdentity={lessonId:'aula-fluidi',sessionId:'session-one',recordingId:'take-one',sha256:'a'.repeat(64),startEpoch:1000,endEpoch:11000};
const search=new URL(captionReplayUrl(JSON.parse(a.text).descriptor.replayUrl,a,indexed)).search;
const audioRef={current:null},seekRevision={current:0};
afterEach(()=>{seekRevision.current=0;cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});

test('legacy replay makes no Core request or caption UI',()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  const {container}=render(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={identity} search="?vista=replay" onSeek={()=>{}}/>);
  expect(container.textContent).toBe('');expect(fetch).not.toHaveBeenCalled();
});

test('reads pinned text, seeks only after another Core read and stops exposing it after withdrawal',async()=>{
  let withdrawn=false;
  const fetch=vi.fn(async(url:unknown)=>withdrawn?Response.json({error:'not_found'},{status:404}):Response.json(String(url).includes('/index/')?indexed:a));
  vi.stubGlobal('fetch',fetch);const seek=vi.fn();
  render(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={identity} search={search} onSeek={seek}/>);
  await screen.findByText('Δp < 10 kPa.');expect(fetch).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button',{name:/Apri frammento 2/}));
  await waitFor(()=>expect(seek).toHaveBeenCalledWith(4500));expect(fetch).toHaveBeenCalledTimes(4);
  withdrawn=true;fireEvent.click(screen.getByRole('button',{name:/Apri frammento 1/}));
  await screen.findByRole('alert');expect(screen.queryByText('Δp < 10 kPa.')).toBeNull();expect(seek).toHaveBeenCalledOnce();
});

test('another recording hides the earlier document immediately and late Core responses cannot restore it',async()=>{
  let resolve:((response:Response)=>void)|undefined,count=0;
  vi.stubGlobal('fetch',vi.fn(async(url:unknown)=>String(url).includes('/index/')?Response.json(indexed):++count===1?new Promise<Response>(r=>{resolve=r;}):Response.json(a)));
  const view=render(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={identity} search={search} onSeek={()=>{}}/>);
  await waitFor(()=>expect(resolve).toBeTypeOf('function'));
  view.rerender(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={{...identity,recordingId:'take-two'}} search={search} onSeek={()=>{}}/>);
  await screen.findByRole('alert');resolve!(Response.json(a));
  await waitFor(()=>expect(screen.queryByText('Δp < 10 kPa.')).toBeNull());
});

test('malformed/duplicate caption pins fail closed without enumerating Core resources',()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  render(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={identity} search={search+'&captionSource=other'} onSeek={()=>{}}/>);
  expect(screen.getByRole('alert')).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});

test('hiding the page clears text; returning rereads Core instead of restoring a local copy',async()=>{
  const fetch=vi.fn(async(url:unknown)=>Response.json(String(url).includes('/index/')?indexed:a));vi.stubGlobal('fetch',fetch);
  const visibility=vi.spyOn(document,'visibilityState','get').mockReturnValue('visible');
  render(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={identity} search={search} onSeek={()=>{}}/>);
  await screen.findByText('Δp < 10 kPa.');expect(fetch).toHaveBeenCalledTimes(2);
  visibility.mockReturnValue('hidden');fireEvent(document,new Event('visibilitychange'));
  expect(screen.queryByText('Δp < 10 kPa.')).toBeNull();
  visibility.mockReturnValue('visible');fireEvent(document,new Event('visibilitychange'));
  await screen.findByText('Δp < 10 kPa.');expect(fetch).toHaveBeenCalledTimes(4);
});

test('a delayed seek preflight cannot move a player after unmount',async()=>{
  let count=0,resolve:((response:Response)=>void)|undefined;
  vi.stubGlobal('fetch',vi.fn(async(url:unknown)=>String(url).includes('/index/')?Response.json(indexed):++count===2?new Promise<Response>(r=>{resolve=r;}):Response.json(a)));
  const seek=vi.fn(),view=render(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={identity} search={search} onSeek={seek}/>);
  await screen.findByText('Δp < 10 kPa.');fireEvent.click(screen.getByRole('button',{name:/Apri frammento 1/}));
  await waitFor(()=>expect(resolve).toBeTypeOf('function'));
  view.unmount();resolve!(Response.json(a));await new Promise(r=>setTimeout(r,0));expect(seek).not.toHaveBeenCalled();
});


test('a newer manual seek wins over an older caption preflight in the same recording',async()=>{
  let count=0,resolve:((response:Response)=>void)|undefined,position=9000;
  vi.stubGlobal('fetch',vi.fn(async(url:unknown)=>String(url).includes('/index/')?Response.json(indexed):++count===2?new Promise<Response>(r=>{resolve=r;}):Response.json(a)));
  const seek=vi.fn((epoch:number)=>{position=epoch;});
  render(<ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} identity={identity} search={search} onSeek={seek}/>);
  await screen.findByText('Δp < 10 kPa.');fireEvent.click(screen.getByRole('button',{name:/Apri frammento 1/}));
  await waitFor(()=>expect(resolve).toBeTypeOf('function'));
  seekRevision.current++;position=9000;resolve!(Response.json(a));
  await screen.findByText('La posizione è cambiata durante la verifica. Il salto precedente è stato annullato.');
  expect(position).toBe(9000);expect(seek).not.toHaveBeenCalled();
});
