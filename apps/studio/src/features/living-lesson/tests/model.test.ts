import { describe, it, expect } from 'vitest'
import { buildReplayTimeline } from '../../../store/replayTimeline'
import type { AudioRecordingRef } from '../../../store/audioRecording'
import { resolveMoment, parseEditorial, attachEditorial, mediaEpoch } from '../model'
const lessonId = 's17-test'
const sessionId = '11111111-1111-4111-8111-111111111111'
const recording: AudioRecordingRef = { v:1, recordingId:'22222222-2222-4222-8222-222222222222', assetPath:`raw/${lessonId}/${sessionId}/audio/22222222-2222-4222-8222-222222222222.wav`, mimeType:'audio/wav', sha256:'a'.repeat(64), bytes:10, startEpoch:1000,endEpoch:3000,durationMs:2000,objectRefs:[{elementId:'formula',version:1,label:'F = ma'}] }
const moment = { id:'moment-1',title:'Seconda legge',kind:'chapter' as const,lessonId,sessionId,recordingId:recording.recordingId,sha256:recording.sha256,epoch:1500,objectRefs:[...recording.objectRefs] }
const timeline = () => buildReplayTimeline([{t:1000,type:'element.add',element:{id:'formula',type:'text',version:1,text:'F = ma'}},{t:2000,type:'element.update',element:{id:'formula',type:'text',version:2,text:'F = 2ma'}},{t:3000,type:'audio.recording',recording}],lessonId)
describe('exact living lesson context',()=>{
 it('recovers the historical object rather than the corrected head',()=>{const r=resolveMoment(lessonId,timeline(),moment,{}); expect(r.elements[0]).toMatchObject({version:1,text:'F = ma'}); expect(r.offsetSeconds).toBe(.5)})
 it.each([{...moment,lessonId:'other'},{...moment,sessionId:'33333333-3333-4333-8333-333333333333'},{...moment,sha256:'b'.repeat(64)},{...moment,epoch:3500},{...moment,epoch:2500}])('rejects foreign or missing exact context %#', m=>{expect(()=>resolveMoment(lessonId,timeline(),m,{})).toThrow()})
 it('checks every reference and required image file',()=>{const t=timeline();t.events.unshift({t:1000,type:'element.add',element:{id:'image',version:1,type:'image',fileId:'missing'}});const refs=[...recording.objectRefs,{elementId:'image',version:1,label:'Pagina 2'}];t.recordings[0]={...t.recordings[0]!,objectRefs:refs};expect(()=>resolveMoment(lessonId,t,{...moment,objectRefs:refs},{})).toThrow(/file/i)})
 it('round-trips editorial data without dropping scene files',()=>{const scene={elements:[],files:{abc:{id:'abc'}},appState:{}};const out=attachEditorial(scene,{v:1,lessonId,moments:[moment]});expect(out.files).toEqual(scene.files);expect(parseEditorial(out,lessonId).moments).toEqual([moment]);expect(()=>parseEditorial(out,'foreign')).toThrow()})
 it('rejects malformed and unknown editorial data',()=>{expect(()=>parseEditorial({livingLesson:{v:2}},lessonId)).toThrow();expect(()=>attachEditorial({}, {v:1,lessonId,moments:[{...moment,epoch:NaN}]})).toThrow()})
 it('maps media seconds only inside the selected take',()=>{expect(mediaEpoch(recording,.5)).toBe(1500);expect(mediaEpoch(recording,10)).toBe(3000);expect(()=>mediaEpoch(recording,NaN)).toThrow()})
})
