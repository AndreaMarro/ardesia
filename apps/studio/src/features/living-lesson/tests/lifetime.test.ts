import { it,expect } from 'vitest'
import { createIntentFence } from '../intentFence'
import { assertCursorRecording, privateNoteFingerprint } from '../model'
import type { LessonMoment } from '../model'
import type { AudioRecordingRef } from '../../../store/audioRecording'
const lessonId='lifetime'
const sessionId='11111111-1111-4111-8111-111111111111'
const recordingId='22222222-2222-4222-8222-222222222222'
const moment:LessonMoment={id:'m',title:'m',kind:'marker',lessonId,sessionId,recordingId,sha256:'a'.repeat(64),epoch:1000,objectRefs:[{elementId:'x',version:1,label:'x'}]}
const ref:AudioRecordingRef={v:1,recordingId,assetPath:`raw/${lessonId}/${sessionId}/audio/${recordingId}.wav`,sha256:moment.sha256,mimeType:'audio/wav',bytes:1,startEpoch:1000,endEpoch:2000,durationMs:1000,objectRefs:moment.objectRefs}
it('rejects delayed selection/action continuations and late errors after switch or logout',async()=>{
 const fence=createIntentFence();let finish!:(v:string)=>void;const a=fence.begin();let selected=''
 const pending=new Promise<string>(r=>{finish=r}).then(value=>{if(a())selected=value})
 const b=fence.begin();if(b())selected='B';finish('A');await pending;expect(selected).toBe('B');expect(a()).toBe(false)
 fence.invalidate();expect(b()).toBe(false)
})
it('fails closed for a different overlapping take or session',()=>{
 expect(()=>assertCursorRecording(lessonId,moment,ref)).not.toThrow()
 expect(()=>assertCursorRecording(lessonId,moment,{...ref,recordingId:'33333333-3333-4333-8333-333333333333'})).toThrow()
 expect(()=>assertCursorRecording(lessonId,moment,{...ref,assetPath:ref.assetPath.replace(sessionId,'44444444-4444-4444-8444-444444444444')})).toThrow()
 expect(()=>assertCursorRecording(lessonId,moment,{...ref,sha256:'b'.repeat(64)})).toThrow()
})
it('isolates private notes by every immutable context field',async()=>{
 const original=await privateNoteFingerprint(moment)
 for(const changed of [{...moment,epoch:1001},{...moment,sessionId:'33333333-3333-4333-8333-333333333333'},{...moment,recordingId:'33333333-3333-4333-8333-333333333333'},{...moment,objectRefs:[{elementId:'x',version:2,label:'x'}]}])expect(await privateNoteFingerprint(changed)).not.toBe(original)
 expect(await privateNoteFingerprint({...moment,title:'Renamed'})).toBe(original)
})
