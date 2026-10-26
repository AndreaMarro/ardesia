import {studyRequest,type StudyResource} from '../../api';
import {readLessonPassage} from '../../components/lessonPassageReference';
import {defaultIndex,INDEX_KIND,matchesSource,parseIndex,type MediaIndex} from './model';

type RevisionPin={id:string;revisionId:string;sha256:string};
export type CaptionReference={source:RevisionPin;index:RevisionPin|null};
export type PlaybackIdentity={lessonId:string;sessionId:string;recordingId:string;sha256:string;startEpoch:number;endEpoch:number};
export type CaptionDocument={index:MediaIndex;sourceRevision:string;indexRevision:string|null};
const sourceKeys=['captionSource','captionSourceRevision','captionSourceSha'] as const;
const indexKeys=['captionIndex','captionIndexRevision','captionIndexSha'] as const;
const keys=[...sourceKeys,...indexKeys];
function id(value:unknown):value is string{return typeof value==='string'&&value.length>0&&value.length<=128;}
function sha(value:unknown):value is string{return typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);}
function pin(params:URLSearchParams,names:readonly[string,string,string]):RevisionPin|null{
  const [resource,revision,hash]=names.map(k=>params.get(k));
  return id(resource)&&id(revision)&&sha(hash)?{id:resource,revisionId:revision,sha256:hash}:null;
}
/** undefined = legacy replay, null = malformed reference (never silently repaired). */
export function parseCaptionReference(search:string):CaptionReference|null|undefined{
  const p=new URLSearchParams(search);
  if(!keys.some(k=>p.has(k)))return undefined;
  if(keys.some(k=>p.getAll(k).length>1))return null;
  const source=pin(p,sourceKeys),hasIndex=indexKeys.some(k=>p.has(k)),index=hasIndex?pin(p,indexKeys):null;
  return source&&(!hasIndex||index)?{source,index}:null;
}
/** Metadata only; access remains a fresh Core decision in the consuming player. */
export function captionReplayUrl(rawUrl:string,source:StudyResource,indexResource:StudyResource|null):string{
  const passage=readLessonPassage(source);
  const index=indexResource?parseIndex(indexResource.text):defaultIndex(source);
  if(!index||!matchesSource(index,source)||!id(source.id)||!id(source.revisionId)||!sha(source.sha256)||
    (indexResource&&(indexResource.kind!==INDEX_KIND||indexResource.editionId!==source.editionId||!id(indexResource.id)||!id(indexResource.revisionId)||!sha(indexResource.sha256))))throw new Error('invalid_caption_reference');
  if(!passage)throw new Error('invalid_caption_reference');
  const url=new URL(rawUrl),canonical=new URL(passage.descriptor.replayUrl),d=passage.descriptor;
  if(url.username||url.password||url.origin!==canonical.origin||url.pathname!==canonical.pathname||url.hash!==canonical.hash||
    [['vista','replay'],['recording',d.recordingId],['session',d.sessionId],['sha',d.sha256]].some(([name,value])=>url.searchParams.getAll(name).length!==1||url.searchParams.get(name)!==value)||
    url.searchParams.getAll('at').length!==1||!/^\d+$/.test(url.searchParams.get('at')??'')||!Number.isSafeInteger(Number(url.searchParams.get('at')))||Number(url.searchParams.get('at'))<d.startEpoch||Number(url.searchParams.get('at'))>d.endEpoch)throw new Error('invalid_caption_reference');
  for(const key of keys)url.searchParams.delete(key);
  for(const [names,value] of [[sourceKeys,source],[indexKeys,indexResource]] as const){
    if(!value)continue;url.searchParams.set(names[0],value.id);url.searchParams.set(names[1],value.revisionId);url.searchParams.set(names[2],value.sha256);
  }
  return url.href;
}
function samePin(resource:StudyResource,pin:RevisionPin){return resource.id===pin.id&&resource.revisionId===pin.revisionId&&resource.sha256===pin.sha256;}
export async function readCaptionDocument(reference:CaptionReference,playback:PlaybackIdentity,signal?:AbortSignal):Promise<CaptionDocument>{
  const read=(p:RevisionPin)=>studyRequest<StudyResource>(`/resources/${encodeURIComponent(p.id)}/revisions/${encodeURIComponent(p.revisionId)}`,undefined,{signal});
  let indexed:StudyResource|null=null,index:MediaIndex|null=null;
  if(reference.index){
    indexed=await read(reference.index);
    if(!samePin(indexed,reference.index)||indexed.kind!==INDEX_KIND)throw new Error('caption_mismatch');
    index=parseIndex(indexed.text);
    if(!index||index.source.id!==reference.source.id||index.source.revisionId!==reference.source.revisionId||index.source.sha256!==reference.source.sha256)throw new Error('caption_mismatch');
  }
  // Read the primary source last, as the catalog does: an index that remains
  // readable after source withdrawal cannot authorize a new display or seek.
  const source=await read(reference.source),passage=readLessonPassage(source);
  if(!samePin(source,reference.source)||!passage)throw new Error('caption_mismatch');
  const d=passage.descriptor;
  if(d.lessonId!==playback.lessonId||d.sessionId!==playback.sessionId||d.recordingId!==playback.recordingId||
    d.sha256!==playback.sha256||d.startEpoch!==playback.startEpoch||d.endEpoch!==playback.endEpoch)throw new Error('caption_mismatch');
  index=index??defaultIndex(source);
  if(!index||(indexed&&indexed.editionId!==source.editionId)||!matchesSource(index,source))throw new Error('caption_mismatch');
  return {index,sourceRevision:source.revisionId,indexRevision:reference.index?.revisionId??null};
}
