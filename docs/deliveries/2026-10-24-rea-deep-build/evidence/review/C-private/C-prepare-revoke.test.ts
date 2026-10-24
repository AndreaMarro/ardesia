import {readFileSync} from 'node:fs';
import {expect, test, vi} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/node_modules/vitest';
import {WorkspaceStore} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/WorkspaceStore';
import {importLesson} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/lessonBundle';
import {loadReplayTimeline} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/replayTimeline';
import {prepareLessonPassage} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/lessonPassage';
import {revokeStoredAudioSession} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/SessionAudioRecorder';
import {recordingSession} from '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/studio/src/store/audioRecording';
function deferred(){let resolve!:()=>void;const promise=new Promise<void>(r=>{resolve=r});return {resolve,promise}}
class MemoryDriver {readonly name='independent-probe';files=new Map<string,Blob>();available(){return true}async init(){return true}async read(p:string){return this.files.get(p)??null}async write(p:string,b:Blob){this.files.set(p,b)}async delete(p:string){this.files.delete(p)}async list(prefix=''){return [...this.files].filter(([p])=>p.startsWith(prefix)).map(([path,data])=>({path,data,mtime:0}))}}
test('revocation completed during passage prepare prevents a new descriptor being returned',async()=>{
 const driver=new MemoryDriver(),store=new WorkspaceStore();Object.assign(store,{driver});
 await importLesson(store,new Uint8Array(readFileSync('/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/deep-build/review/C-independent-native.lesson')) as unknown as Blob);
 const before=await loadReplayTimeline(store,'aula-fluidi');expect(before.recordings).toHaveLength(2);const recording=before.recordings[0]!;expect(recording.availability).toBe('available');
 const entered=deferred(),release=deferred();let blocked=false;const read=store.read.bind(store);
 vi.spyOn(store,'read').mockImplementation(async p=>{if(p==='raw/aula-fluidi/events.jsonl'&&!blocked){blocked=true;entered.resolve();await release.promise}return read(p)});
 const preparing=prepareLessonPassage(store,recording,'http://127.0.0.1:5412/studio/');await entered.promise;
 await revokeStoredAudioSession(store,recordingSession(recording));release.resolve();
 await expect(preparing).rejects.toThrow(/disponibile|revocat|passaggio/i);
});
