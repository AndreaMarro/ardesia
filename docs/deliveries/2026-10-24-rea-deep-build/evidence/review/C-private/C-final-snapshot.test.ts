import {readFileSync} from 'node:fs';
import {expect, test, vi} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/node_modules/vitest';
import {WorkspaceStore} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/WorkspaceStore';
import {importLesson} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/lessonBundle';
import {loadReplayTimeline} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/replayTimeline';
import {prepareLessonPassage} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/lessonPassage';
import {revokeStoredAudioSession} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/SessionAudioRecorder';
import {resolveReplayRecording, recordingSession} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/audioRecording';
function deferred(){let resolve!:()=>void;const promise=new Promise<void>(r=>{resolve=r});return {resolve,promise}}
class MemoryDriver {readonly name='independent-probe';files=new Map<string,Blob>();available(){return true}async init(){return true}async read(p:string){return this.files.get(p)??null}async write(p:string,b:Blob){this.files.set(p,b)}async delete(p:string){this.files.delete(p)}async list(prefix=''){return [...this.files].filter(([p])=>p.startsWith(prefix)).map(([path,data])=>({path,data,mtime:0}))}}
test('snapshot rejects reads outside lesson and exposes only frozen read capability',async()=>{
 const driver=new MemoryDriver(),store=new WorkspaceStore();Object.assign(store,{driver});
 await store.readLessonSnapshot('aula-fluidi',async reader=>{
  expect(Object.keys(reader)).toEqual(['read']);expect(Object.isFrozen(reader)).toBe(true);
  for(const p of ['raw/other/events.jsonl','raw/aula-fluidi/../other/events.jsonl','raw/aula-fluidi//events.jsonl','raw/aula-fluidi/./events.jsonl']) await expect(reader.read(p)).rejects.toThrow(/outside/i);
  expect(await reader.read('raw/aula-fluidi/events.jsonl')).toBe(null);
 });
});
test('descriptor ordered before a waiting revoke cannot authorize replay after OFF and purge',async()=>{
 const driver=new MemoryDriver(),store=new WorkspaceStore();Object.assign(store,{driver});
 await importLesson(store,new Uint8Array(readFileSync('/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/deep-build/review/C-independent-native.lesson')) as unknown as Blob);
 const before=await loadReplayTimeline(store,'aula-fluidi');const recording=before.recordings[0]!;
 const entered=deferred(),release=deferred(),casEntered=deferred();let journalReads=0;
 const read=driver.read.bind(driver);vi.spyOn(driver,'read').mockImplementation(async p=>{if(p==='raw/aula-fluidi/events.jsonl'&&++journalReads===2){entered.resolve();await release.promise}return read(p)});
 const cas=store.updateSessionAudioCAS.bind(store);vi.spyOn(store,'updateSessionAudioCAS').mockImplementation((...args)=>{casEntered.resolve();return cas(...args)});
 const preparing=prepareLessonPassage(store,recording,'http://127.0.0.1:5412/studio/');await entered.promise;
 let completed=false;const revoking=revokeStoredAudioSession(store,recordingSession(recording)).then(()=>{completed=true});await casEntered.promise;expect(completed).toBe(false);
 release.resolve();const descriptor=await preparing;expect(descriptor.recordingId).toBe(recording.recordingId);await revoking;
 expect((await resolveReplayRecording(store,recording)).availability).toBe('revoked');expect(await store.read(recording.assetPath)).toBe(null);
});
