import { z } from 'zod'
import { ReplayEngine } from '../../store/ReplayEngine'
import { recordingSession, type AudioRecordingRef } from '../../store/audioRecording'
import type { ReplayTimeline } from '../../store/replayTimeline'
import { validateRoomId } from '../../store/roomPaths'

const text = z.string().trim().min(1).max(240)
const epoch = z.number().int().nonnegative().safe()
const objectRef = z.object({elementId:text, version:z.number().int().positive(), label:text}).strict()
const momentSchema = z.object({
  id:text, title:text, kind:z.enum(['marker','chapter']), lessonId:text, sessionId:z.uuid(),
  recordingId:z.uuid(), sha256:z.string().regex(/^[0-9a-f]{64}$/), epoch,
  objectRefs:z.array(objectRef).min(1).max(32),
}).strict()
const editorialSchema = z.object({v:z.literal(1),lessonId:text,moments:z.array(momentSchema).max(1000)}).strict()
export type LessonMoment = z.infer<typeof momentSchema>
export type Editorial = z.infer<typeof editorialSchema>
export type SceneEnvelope = Record<string, unknown> & {elements?: readonly Record<string, unknown>[];files?: Record<string, unknown>}
export function emptyEditorial(lessonId:string):Editorial {validateRoomId(lessonId);return {v:1,lessonId,moments:[]}}
export function parseEditorial(scene:SceneEnvelope, lessonId:string):Editorial {
  validateRoomId(lessonId)
  if (scene.livingLesson === undefined) return emptyEditorial(lessonId)
  const result = editorialSchema.parse(scene.livingLesson)
  if(result.lessonId!==lessonId || result.moments.some(m=>m.lessonId!==lessonId)) throw new Error('Contesto di un’altra lezione')
  if(new Set(result.moments.map(m=>m.id)).size!==result.moments.length) throw new Error('Marker duplicato')
  return result
}
/** Preserve Excalidraw elements/files and other extensions. The host owns the scene save queue. */
export function attachEditorial<T extends SceneEnvelope>(scene:T,editorial:Editorial):T & {livingLesson:Editorial} {
  return {...scene,livingLesson:parseEditorial({livingLesson:editorial},editorial.lessonId)}
}
export function mediaEpoch(recording:AudioRecordingRef,seconds:number):number {
  if(!Number.isFinite(seconds)) throw new Error('Tempo audio non valido')
  return Math.round(recording.startEpoch+Math.max(0,Math.min(recording.durationMs,seconds*1000)))
}
export function sceneAt(timeline:ReplayTimeline,epoch:number,files:Record<string,unknown>):Record<string,unknown>[] {
  const elements = new ReplayEngine().getSceneAt([...timeline.events].sort((a,b)=>a.t-b.t),epoch)
  for(const el of elements) if(el.type==='image' && (typeof el.fileId!=='string' || !files[el.fileId])) throw new Error('File della pagina o immagine non disponibile')
  return elements
}
export function resolveMoment(lessonId:string,timeline:ReplayTimeline,input:LessonMoment,files:Record<string,unknown>) {
  const moment = momentSchema.parse(input)
  const recording = timeline.recordings.find(r=>r.recordingId===moment.recordingId)
  if(moment.lessonId!==lessonId || !recording) throw new Error('Passaggio non appartenente alla lezione')
  const identity = recordingSession(recording)
  if(identity.lessonId!==lessonId || identity.sessionId!==moment.sessionId || recording.sha256!==moment.sha256) throw new Error('Sessione o impronta del passaggio non corrispondente')
  if(moment.epoch<recording.startEpoch || moment.epoch>recording.endEpoch) throw new Error('Istante fuori dalla registrazione')
  const elements = sceneAt(timeline,moment.epoch,files)
  for(const ref of moment.objectRefs) {
    if(!recording.objectRefs.some(r=>r.elementId===ref.elementId && r.version===ref.version)) throw new Error('Riferimento non collegato alla registrazione')
    if(!elements.some(el=>el.id===ref.elementId && el.version===ref.version)) throw new Error('Revisione richiesta non disponibile in questo istante')
  }
  return {recording,elements,offsetSeconds:(moment.epoch-recording.startEpoch)/1000}
}
/** Host-provided authorization remains authoritative; this port makes no role assignments. */
export interface LessonAccess {
  allowed():boolean
  subscribe(listener:()=>void):()=>void
  authorize(moment:LessonMoment):Promise<boolean>
}
export interface PrivateNotes {
  read(moment:LessonMoment):Promise<string>
  write(moment:LessonMoment,note:string):Promise<void>
}

export function assertCursorRecording(lessonId:string,input:LessonMoment,recording:AudioRecordingRef|null):asserts recording is AudioRecordingRef {
 const moment=momentSchema.parse(input)
 if(!recording)throw Error('Registrazione richiesta non disponibile')
 const identity=recordingSession(recording)
 if(moment.lessonId!==lessonId||identity.lessonId!==lessonId||identity.sessionId!==moment.sessionId||recording.recordingId!==moment.recordingId||recording.sha256!==moment.sha256||moment.epoch<recording.startEpoch||moment.epoch>recording.endEpoch)throw Error('Il media del cursore non corrisponde al passaggio richiesto')
}
/** Principal isolation is supplied by the host note port; this key binds its exact context. */
export async function privateNoteFingerprint(input:LessonMoment):Promise<string>{
 const m=momentSchema.parse(input)
 const refs=m.objectRefs.map(r=>[r.elementId,r.version]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))||Number(a[1])-Number(b[1]))
 const bytes=new TextEncoder().encode(JSON.stringify([m.lessonId,m.sessionId,m.recordingId,m.sha256,m.epoch,m.id,refs]))
 const hash=await crypto.subtle.digest('SHA-256',bytes)
 return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('')
}
