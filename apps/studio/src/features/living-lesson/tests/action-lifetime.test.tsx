// @vitest-environment jsdom
import { it,expect,vi } from 'vitest'
import { render,fireEvent,waitFor,cleanup } from '@testing-library/react'
import LivingLessonReplay from '../LivingLessonReplay'
import { WorkspaceStore } from '../../../store/WorkspaceStore'
import type { LessonAccess,LessonMoment } from '../model'
import type { ReplayCursor } from '../replayCursor'
import { readAudioSession, audioSha256 } from '../../../store/audioRecording'
async function fixture(){
 const store=new WorkspaceStore();await store.init()
 const identity={lessonId:'action-test',sessionId:crypto.randomUUID()}
 const created=await store.createSessionOnce(identity,{created:1000});if(created.kind!=='created'&&created.kind!=='idempotent')throw Error(created.kind)
 await store.updateSessionAudioCAS(identity,{expectedSha256:created.snapshot.sha256,audioConsent:true,audioStartEpoch:1000})
 const id=crypto.randomUUID()
 const data=new Blob(['x'],{type:'audio/wav'});const digest=await audioSha256(data)
 const assetPath=`raw/${identity.lessonId}/${identity.sessionId}/audio/${id}.wav`;await store.write(assetPath,data)
 const moment:LessonMoment={id:'a',title:'A',kind:'marker',...identity,recordingId:id,sha256:digest,epoch:2000,objectRefs:[{elementId:'x',version:1,label:'x'}]}
 const audio=document.createElement('audio');audio.src='blob:synthetic-unit';audio.pause=vi.fn();audio.play=vi.fn().mockResolvedValue(undefined)
 const cursor:ReplayCursor={media:audio,recording:{v:1,recordingId:id,assetPath,sha256:moment.sha256,mimeType:'audio/wav',bytes:1,startEpoch:1000,endEpoch:2000,durationMs:1000,objectRefs:moment.objectRefs,availability:'available',data},timeline:{events:[],recordings:[],audioChunks:[],firstEventTime:1000,lastEventTime:2000},epoch:2000,seekEpoch:vi.fn()}
 return {store,moment,audio,cursor}
}
it.each(['authorization','session'] as const)('ignores a late %s failure after selecting another passage',async phase=>{
 const f=await fixture();let delay=false,rejectOld!:(e:Error)=>void
 const access:LessonAccess={allowed:()=>true,subscribe:()=>()=>{},authorize:async()=>{if(phase==='authorization'&&delay){delay=false;return new Promise((_r,j)=>{rejectOld=j})}return true}}
 const originalRead=f.store.read.bind(f.store)
 vi.spyOn(f.store,'read').mockImplementation(async path=>{if(phase==='session'&&delay){delay=false;return new Promise((_r,j)=>{rejectOld=j})}return originalRead(path)})
 const unavailable=vi.fn()
 const props={...f,lessonId:f.moment.lessonId,editorial:{v:1 as const,lessonId:f.moment.lessonId,moments:[f.moment]},access,onUnavailable:unavailable}
 const view=render(<LivingLessonReplay {...props}/>)
 // jsdom has no AudioContext. Waveform failure must preserve the canonical audio controls.
 await waitFor(()=>expect((view.getByText('Ascolta') as HTMLButtonElement).disabled).toBe(false))
 delay=true;fireEvent.click(view.getByText('Ascolta'));await waitFor(()=>expect(rejectOld).toBeTypeOf('function'))
 const mediaB=document.createElement('audio');mediaB.pause=vi.fn();mediaB.src='blob:B'
 view.rerender(<LivingLessonReplay {...props} moment={{...f.moment,id:'b',title:'B'}} cursor={{...f.cursor,media:mediaB}}/>)
 rejectOld(Error('late A failure'));await Promise.resolve();await Promise.resolve()
 expect(unavailable).not.toHaveBeenCalled();expect(f.audio.play).not.toHaveBeenCalled();expect(view.getByText('B')).toBeDefined()
 cleanup();vi.restoreAllMocks()
})
it('restarts the canonical epoch even before media metadata exposes its end',async()=>{
 const f=await fixture();const access:LessonAccess={allowed:()=>true,subscribe:()=>()=>{},authorize:async()=>true}
 const view=render(<LivingLessonReplay {...f} lessonId={f.moment.lessonId} editorial={{v:1,lessonId:f.moment.lessonId,moments:[f.moment]}} access={access} onUnavailable={()=>{}}/>)
 await waitFor(()=>expect((view.getByText('Ascolta') as HTMLButtonElement).disabled).toBe(false))
 expect(f.audio.currentTime).toBe(0);expect(f.audio.readyState).toBe(0)
 fireEvent.click(view.getByText('Ascolta'));await waitFor(()=>expect(f.cursor.seekEpoch).toHaveBeenCalledWith(1000));expect(f.audio.play).toHaveBeenCalled()
 cleanup()
})

it('rejects cached media after an OFF/ON consent transition between polling ticks',async()=>{
 const f=await fixture();const access:LessonAccess={allowed:()=>true,subscribe:()=>()=>{},authorize:async()=>true};const unavailable=vi.fn()
 const view=render(<LivingLessonReplay {...f} lessonId={f.moment.lessonId} editorial={{v:1,lessonId:f.moment.lessonId,moments:[f.moment]}} access={access} onUnavailable={unavailable}/>)
 await waitFor(()=>expect((view.getByText('Ascolta') as HTMLButtonElement).disabled).toBe(false))
 vi.useFakeTimers()
 try{
  const identity={lessonId:f.moment.lessonId,sessionId:f.moment.sessionId}
  const initial=await readAudioSession(f.store,identity);if(!initial)throw Error('missing fixture session')
  const off=await f.store.updateSessionAudioCAS(identity,{expectedSha256:initial.sha256,audioConsent:false,audioStartEpoch:null})
  if(off.kind!=='updated')throw Error(off.kind)
  const on=await f.store.updateSessionAudioCAS(identity,{expectedSha256:off.snapshot.sha256,audioConsent:true,audioStartEpoch:1000})
  if(on.kind!=='updated')throw Error(on.kind)
  expect(on.snapshot.sha256).not.toBe(initial.sha256)
  fireEvent.click(view.getByText('Ascolta'))
  await vi.waitFor(()=>expect(unavailable).toHaveBeenCalledWith(expect.stringMatching(/sessione.*modificat/i)))
  expect(f.audio.play).not.toHaveBeenCalled()
 }finally{cleanup();vi.useRealTimers()}
})
it('rejects a cached cursor whose canonical media has been purged before mounting',async()=>{
 const f=await fixture();await f.store.delete(f.cursor.recording!.assetPath)
 const access:LessonAccess={allowed:()=>true,subscribe:()=>()=>{},authorize:async()=>true};const unavailable=vi.fn()
 render(<LivingLessonReplay {...f} lessonId={f.moment.lessonId} editorial={{v:1,lessonId:f.moment.lessonId,moments:[f.moment]}} access={access} onUnavailable={unavailable}/>)
 try{await waitFor(()=>expect(unavailable).toHaveBeenCalledWith(expect.stringMatching(/audio.*indisponibil/i)));expect(f.audio.play).not.toHaveBeenCalled()}
 finally{cleanup()}
})
