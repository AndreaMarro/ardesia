import {afterEach,expect,test,vi} from 'vitest';
import {captionReplayUrl,parseCaptionReference,readCaptionDocument,type PlaybackIdentity} from './playback';
import {defaultIndex,INDEX_KIND} from './model';
import {readLessonPassage} from '../../components/lessonPassageReference';
import {source} from './fixture';
import type {StudyResource} from '../../api';

const a=source(),descriptor=readLessonPassage(a)!.descriptor;
const identity:PlaybackIdentity={lessonId:descriptor.lessonId,sessionId:descriptor.sessionId,recordingId:descriptor.recordingId,sha256:descriptor.sha256,startEpoch:descriptor.startEpoch,endEpoch:descriptor.endEpoch};
const index=():StudyResource=>({...a,id:'index',revisionId:'index-v1',kind:INDEX_KIND,sha256:'c'.repeat(64),text:JSON.stringify(defaultIndex(a))});
const reference=(indexed:StudyResource|null=index())=>parseCaptionReference(new URL(captionReplayUrl(descriptor.replayUrl,a,indexed)).search)!;
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});

test('replay link pins exact Core revisions and preserves canonical recording/object/time',()=>{
  const url=new URL(captionReplayUrl(descriptor.replayUrl,a,index())),ref=parseCaptionReference(url.search);
  expect(ref).toEqual({source:{id:a.id,revisionId:a.revisionId,sha256:a.sha256},index:{id:'index',revisionId:'index-v1',sha256:'c'.repeat(64)}});
  for(const key of ['recording','session','sha','at','object','objectVersion'])expect(url.searchParams.get(key)).toBe(new URL(descriptor.replayUrl).searchParams.get(key));
  expect(parseCaptionReference('')).toBeUndefined();
  expect(parseCaptionReference('?captionSource=source')).toBeNull();
  expect(parseCaptionReference(url.search+'&captionIndex=other')).toBeNull();
  expect(parseCaptionReference(url.search.replace('captionIndexSha='+('c'.repeat(64)),'captionIndexSha=no'))).toBeNull();
  expect(()=>captionReplayUrl(descriptor.replayUrl.replace('127.0.0.1','outside.invalid'),a,index())).toThrow();
  expect(()=>captionReplayUrl(descriptor.replayUrl.replace('recording=take-one','recording=other'),a,index())).toThrow();
});

test('loads exact readable source/index and validates the local replay identity; no resource enumeration',async()=>{
  const fetch=vi.fn(async(url:unknown)=>Response.json(String(url).includes('/index/')?index():a));vi.stubGlobal('fetch',fetch);
  const result=await readCaptionDocument(reference(),identity);
  expect(result.index).toEqual(defaultIndex(a));expect(result.indexRevision).toBe('index-v1');
  expect(fetch.mock.calls.map(c=>c[0])).toEqual(['/study/resources/index/revisions/index-v1','/study/resources/source/revisions/rev-source']);
});

test.each([
  {...identity,recordingId:'take-two'}, {...identity,sessionId:'other'}, {...identity,lessonId:'other'},
  {...identity,sha256:'d'.repeat(64)}, {...identity,startEpoch:1001}, {...identity,endEpoch:12000},
])('another recording/session/hash or interval cannot borrow the source transcript',async other=>{
  vi.stubGlobal('fetch',vi.fn(async(url:unknown)=>Response.json(String(url).includes('/index/')?index():a)));
  await expect(readCaptionDocument(reference(),other)).rejects.toThrow();
});

test.each(['source-sha','index-sha','index-kind','index-other-source','index-other-edition'] as const)('rejects mismatched %s even if the generic Core resource is readable',async change=>{
  let fresh=a,edited=index();
  if(change==='source-sha')fresh={...a,sha256:'d'.repeat(64)};
  if(change==='index-sha')edited={...edited,sha256:'d'.repeat(64)};
  if(change==='index-kind')edited={...edited,kind:'text'};
  if(change==='index-other-edition')edited={...edited,editionId:'other'};
  if(change==='index-other-source'){const value=JSON.parse(edited.text);value.source.id='other';edited={...edited,text:JSON.stringify(value)};}
  vi.stubGlobal('fetch',vi.fn(async(url:unknown)=>Response.json(String(url).includes('/index/')?edited:fresh)));
  await expect(readCaptionDocument(reference(),identity)).rejects.toThrow();
});

test('without editorial index uses only the exact original source; withdrawal is denied by Core',async()=>{
  const fetch=vi.fn(async()=>Response.json(a));vi.stubGlobal('fetch',fetch);
  expect((await readCaptionDocument(reference(null),identity)).index).toEqual(defaultIndex(a));expect(fetch).toHaveBeenCalledOnce();
  fetch.mockImplementation(async()=>Response.json({error:'not_found'},{status:404}));
  await expect(readCaptionDocument(reference(null),identity)).rejects.toThrow('not_found');
});


test('source withdrawal during index loading denies the display even if the index remains readable',async()=>{
  let withdrawn=false;
  vi.stubGlobal('fetch',vi.fn(async(url:unknown)=>{
    if(String(url).includes('/index/')){withdrawn=true;return Response.json(index());}
    return withdrawn?Response.json({error:'not_found'},{status:404}):Response.json(a);
  }));
  await expect(readCaptionDocument(reference(),identity)).rejects.toThrow('not_found');
});
