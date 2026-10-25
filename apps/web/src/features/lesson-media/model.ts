import type {StudyResource} from '../../api';
import {readLessonPassage} from '../../components/lessonPassageReference';

export type Cue={id:string;startMs:number;endMs:number;text:string};
export type Chapter={id:string;atMs:number;title:string};
export type MediaIndex={schema:'ardesia.lesson-media-index.v1';source:{id:string;revisionId:string;sha256:string};title:string;durationMs:number;
  cues:Cue[];chapters:Chapter[];links:{resourceId:string;revisionId:string;label:string}[]};
export const INDEX_KIND='lesson-media-index';
function exact(v:unknown,keys:string[]):v is Record<string,unknown>{return Boolean(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join()===keys.sort().join());}
function text(v:unknown,n:number):v is string{return typeof v==='string'&&Boolean(v.trim())&&v.length<=n;}
function time(v:unknown,n:number):v is number{return typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=n;}
/** Pure, bounded projection of untrusted Core resource text; never grants access. */
export function parseIndex(raw:string):MediaIndex|null{
  if(raw.length>20000)return null;
  try{
    const d:unknown=JSON.parse(raw);
    if(!exact(d,['schema','source','title','durationMs','cues','chapters','links'])||d.schema!=='ardesia.lesson-media-index.v1'||
      !exact(d.source,['id','revisionId','sha256'])||!text(d.source.id,128)||!text(d.source.revisionId,128)||
      typeof d.source.sha256!=='string'||!/^[a-f0-9]{64}$/.test(d.source.sha256)||!text(d.title,160)||!time(d.durationMs,86400000)||d.durationMs===0||
      !Array.isArray(d.cues)||!d.cues.length||d.cues.length>100||!Array.isArray(d.chapters)||d.chapters.length>50||!Array.isArray(d.links)||d.links.length>20)return null;
    let end=0;const ids=new Set<string>();
    for(const c of d.cues){
      if(!exact(c,['id','startMs','endMs','text'])||!text(c.id,128)||ids.has(c.id)||!text(c.text,8000)||
        !time(c.startMs,d.durationMs)||!time(c.endMs,d.durationMs)||c.startMs<end||c.endMs<=c.startMs)return null;
      ids.add(c.id);end=c.endMs;
    }
    ids.clear();let at=-1;
    for(const c of d.chapters){
      if(!exact(c,['id','atMs','title'])||!text(c.id,128)||ids.has(c.id)||!text(c.title,160)||!time(c.atMs,d.durationMs-1)||c.atMs<=at)return null;
      ids.add(c.id);at=c.atMs;
    }
    ids.clear();
    for(const l of d.links){
      if(!exact(l,['resourceId','revisionId','label'])||!text(l.resourceId,128)||!text(l.revisionId,128)||!text(l.label,160))return null;
      const id=JSON.stringify([l.resourceId,l.revisionId]);if(ids.has(id))return null;ids.add(id);
    }
    return d as unknown as MediaIndex;
  }catch{return null;}
}
export function defaultIndex(source:StudyResource):MediaIndex|null{
  const passage=readLessonPassage(source);if(!passage)return null;
  const durationMs=passage.descriptor.endEpoch-passage.descriptor.startEpoch;
  const value:MediaIndex={schema:'ardesia.lesson-media-index.v1',source:{id:source.id,revisionId:source.revisionId,sha256:source.sha256},
    title:passage.descriptor.objectRefs.map(r=>r.label).join(' · ').slice(0,160),durationMs,
    cues:[{id:'cue-1',startMs:0,endMs:durationMs,text:passage.transcript}],chapters:[{id:'chapter-1',atMs:0,title:'Inizio del passaggio'}],links:[]};
  return parseIndex(JSON.stringify(value));
}
export function matchesSource(index:MediaIndex,source:StudyResource):boolean{
  const passage=readLessonPassage(source);
  return Boolean(passage&&index.source.id===source.id&&index.source.revisionId===source.revisionId&&index.source.sha256===source.sha256&&
    index.durationMs===passage.descriptor.endEpoch-passage.descriptor.startEpoch);
}
export function replayAt(source:StudyResource,atMs:number):string|null{
  const p=readLessonPassage(source);if(!p||!time(atMs,p.descriptor.endEpoch-p.descriptor.startEpoch))return null;
  const url=new URL(p.descriptor.replayUrl);
  const epoch=p.descriptor.startEpoch+atMs;
  // The descriptor pins one verified board scene. Earlier/later audio cues
  // cannot assert that the same historical object version already existed.
  if(Number(url.searchParams.get('at'))!==epoch){url.searchParams.delete('object');url.searchParams.delete('objectVersion');}
  url.searchParams.set('at',String(epoch));return url.href;
}
export function clock(ms:number):string{
  const seconds=Math.floor(ms/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
function stamp(ms:number):string{
  const seconds=Math.floor(ms/1000);return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;
}
export function toVtt(index:MediaIndex):string{
  if(!parseIndex(JSON.stringify(index)))throw new Error('invalid_media_index');
  return 'WEBVTT\n\n'+index.cues.map((c,i)=>`${i+1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n\s*\n/g,'\n')}\n`).join('\n');
}
