// @vitest-environment jsdom
import { it,expect } from 'vitest'
import { WorkspaceStore } from '../../../store/WorkspaceStore'
import { JournalRecorder } from '../../../store/JournalRecorder'
import { studioProducerIdentity } from '../../../core/contracts/eventEnvelope'
import { audioSha256,resolveReplayRecording,type AudioRecordingRef } from '../../../store/audioRecording'
import { sessionPaths } from '../../../store/sessionState'
import { roomPaths } from '../../../store/roomPaths'
import { loadReplayTimeline } from '../../../store/replayTimeline'
import { attachEditorial,parseEditorial,resolveMoment,type LessonMoment } from '../model'

it('transports two distinct takes and exact object references in a fresh store; reports missing/revoked media',async()=>{
 const a=new WorkspaceStore();await a.init()
 const identity={lessonId:'s17-two-takes',sessionId:'11111111-1111-4111-8111-111111111111',actor:{type:'teacher' as const,id:'synthetic-teacher'}}
 const created=await a.createSessionOnce(identity,{created:1000})
 if(created.kind!=='created'&&created.kind!=='idempotent')throw Error(created.kind)
 await a.updateSessionAudioCAS(identity,{expectedSha256:created.snapshot.sha256,audioConsent:true,audioStartEpoch:1000})
 let now=1000
 const journal=new JournalRecorder({store:a,journalPath:roomPaths(identity.lessonId).journal,identity,producer:studioProducerIdentity(),now:()=>now,withExclusiveLock:async(_name,work)=>work()})
 const elements=[{id:'force',type:'text',version:1,text:'F = ma'},{id:'mass',type:'text',version:1,text:'m = 2 kg'}]
 journal.recordChange(elements);await journal.flush()
 const refs:AudioRecordingRef[]=[]
 for(let i=0;i<2;i++){
  const id=i===0?'22222222-2222-4222-8222-222222222222':'33333333-3333-4333-8333-333333333333'
  const data=new Blob([new Uint8Array([82,73,70,70,i,0,255])],{type:'audio/wav'}) // integrity fixture, not a decodable microphone recording
  const ref:AudioRecordingRef={v:1,recordingId:id,assetPath:`${sessionPaths(identity).audioDir}${id}.wav`,mimeType:'audio/wav',sha256:await audioSha256(data),bytes:data.size,startEpoch:1000+i*2000,endEpoch:2000+i*2000,durationMs:1000,objectRefs:[{elementId:i?'mass':'force',version:1,label:i?'Massa':'Forza'}]}
  await a.write(ref.assetPath,data);await journal.recordAudioRecording(ref);refs.push(ref);now+=2000
 }
 const moments:LessonMoment[]=refs.map((r,i)=>({id:`m-${i}`,title:i?'Massa':'Forza',kind:'chapter',lessonId:identity.lessonId,sessionId:identity.sessionId,recordingId:r.recordingId,sha256:r.sha256,epoch:r.startEpoch,objectRefs:[...r.objectRefs]}))
 await a.saveScene(identity.lessonId,JSON.stringify(attachEditorial({elements,files:{}},{v:1,lessonId:identity.lessonId,moments})))
 const bundle=await a.exportLesson(identity.lessonId)
 const before=await Promise.all(refs.map(r=>a.read(r.assetPath)))
 localStorage.clear();const b=new WorkspaceStore();await b.init();await b.importLessonBlobForRoom(bundle,identity.lessonId)
 const timeline=await loadReplayTimeline(b,identity.lessonId)
 expect(timeline.recordings.map(r=>r.availability)).toEqual(['available','available'])
 const restored=parseEditorial(JSON.parse((await b.loadScene(identity.lessonId))!),identity.lessonId)
 for(const [i,m] of restored.moments.entries()){
  const {recording}=resolveMoment(identity.lessonId,timeline,m,{})
  expect(await audioSha256((await b.read(recording.assetPath))!)).toBe(await audioSha256(before[i]!))
 }
 await b.delete(refs[0]!.assetPath);expect((await resolveReplayRecording(b,refs[0]!)).availability).toBe('missing')
 const session=await b.read(sessionPaths(identity).session);expect(session).not.toBeNull()
 const currentHash=await audioSha256(session!)
 await b.updateSessionAudioCAS(identity,{expectedSha256:currentHash,audioConsent:false,audioStartEpoch:null})
 expect((await resolveReplayRecording(b,refs[1]!)).availability).toBe('revoked')
})
