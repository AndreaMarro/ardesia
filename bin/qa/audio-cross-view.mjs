#!/usr/bin/env node
// POSIX synthetic boundary fixture. Production controllers, two real browser tabs.
// Fake audio device: this is neither a hardware microphone nor a product UI test.
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const repo=fileURLToPath(new URL('../../',import.meta.url));
const studio=path.join(repo,'apps/studio');
let out,server,browser,cancelled=false;
const evidence={schemaVersion:1,backend:'origin localStorage',native:'Chromium, fake media device; real MediaRecorder, BroadcastChannel and Web Locks',checks:[],limits:['Direct source hashes are partial, not a transitive dependency manifest.','No hardware microphone, product UI or physical device proof.','FSA live capture fails closed; no cross-folder guarantee claimed.']};
function check(id,passed,detail={}){evidence.checks.push({id,passed,...detail});if(!passed)throw new Error('Failed check: '+id)}
async function ensureWithinDeadline(){
 if(!cancelled)return;
 await Promise.allSettled([browser?.close(),server?.close()]);
 throw new Error('Audio boundary scenario exceeded 45 seconds');
}
async function run(){
 if(process.platform==='win32')throw new Error('This fixture supports POSIX hosts only');
 const [{createServer},{chromium}]=await Promise.all([
  import(pathToFileURL(path.join(studio,'node_modules/vite/dist/node/index.js')).href),
  import(pathToFileURL(path.join(studio,'node_modules/@playwright/test/index.mjs')).href),
 ]);await ensureWithinDeadline();
 out=await mkdtemp(path.join(path.resolve(process.argv[2]??tmpdir()),'ardesia-audio-qa-'));await ensureWithinDeadline();
 evidence.outputDirectory=out;
 const producerSha=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
 const sourceFiles=['apps/studio/src/store/SessionAudioRecorder.ts','apps/studio/src/store/WorkspaceStore.ts','apps/studio/src/store/lessonMutationLock.ts','apps/studio/src/SessionAudioControls.tsx','apps/studio/src/__tests__/AudioV2_crossViewRevocation.test.ts','apps/studio/src/__tests__/LessonPassageAuthor.test.tsx'];
 const sourceSha256={};
 for(const name of sourceFiles)sourceSha256[name]=createHash('sha256').update(await readFile(path.join(repo,name))).digest('hex');
 await ensureWithinDeadline();
 evidence.binding={checkoutSha:producerSha,trackedDiffSha256:createHash('sha256').update(execFileSync('git',['diff','HEAD','--',...sourceFiles],{cwd:repo})).digest('hex'),sourceSha256,fixtureMediaIsSynthetic:true};
 const template=await readFile(new URL('./audio-cross-view.html',import.meta.url),'utf8');await ensureWithinDeadline();
 const html=template.replaceAll('__STUDIO_FS_PATH__',studio.split(path.sep).map(part=>encodeURIComponent(part).replaceAll("'",'%27')).join('/')).replaceAll('__PRODUCER_SHA__',producerSha);
 await writeFile(path.join(out,'native-audio.html'),html);await ensureWithinDeadline();
 server=await createServer({root:out,configFile:false,server:{host:'127.0.0.1',port:0,fs:{allow:[out,studio]}},define:{__ARDESIA_STUDIO_VERSION__:JSON.stringify('0.1.0'),__ARDESIA_GIT_SHA__:JSON.stringify(producerSha)}});await ensureWithinDeadline();
 await server.listen();await ensureWithinDeadline();
 const port=server.httpServer.address().port;
 browser=await chromium.launch({headless:true,timeout:20000,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
 await ensureWithinDeadline();
 const context=await browser.newContext({permissions:['microphone']});
 const a=await context.newPage(),b=await context.newPage();const errors=[];
 for(const page of[a,b])page.on('pageerror',error=>errors.push(error.message));
 await a.goto(`http://127.0.0.1:${port}/native-audio.html`);await a.waitForFunction(()=>Boolean(window.probe));
 await b.goto(`http://127.0.0.1:${port}/native-audio.html`);await b.waitForFunction(()=>Boolean(window.probe));
 await a.evaluate(()=>window.probe.recorder.start());
 const active=await a.evaluate(()=>window.probe.status());check('initial_native_capture',active.state.stage==='recording'&&active.tracks.at(-1)==='live');
 await b.evaluate(()=>window.probe.revoke());
 await b.evaluate(async()=>{const raw=await window.probe.store.read(window.probe.sessionPaths(window.probe.identity).session);const digest=await crypto.subtle.digest('SHA-256',await raw.arrayBuffer());window.oldOffNotice={v:1,scope:'local-storage',...window.probe.identity,sha256:[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}});
 const stopped=await a.evaluate(()=>window.probe.status());check('revocation_waits_for_other_tab_native_stop',stopped.state.stage==='idle'&&stopped.tracks.every(state=>state==='ended')&&stopped.session.audioConsent===false&&stopped.files===0,{state:stopped.state.stage,tracks:stopped.tracks,files:stopped.files});
 await a.evaluate(()=>{window.probe.delayNext();window.starting=window.probe.recorder.start()});await a.waitForFunction(()=>window.probe.permissionEntered);
 await b.evaluate(()=>window.probe.revoke());
 const beforeLate=await a.evaluate(()=>window.probe.status());check('pending_permission_does_not_hold_revocation',beforeLate.session.audioConsent===false&&beforeLate.state.stage==='idle');
 await a.evaluate(()=>{window.probe.releasePermission();return window.starting});
 const afterLate=await a.evaluate(()=>window.probe.status());check('late_permission_stopped_before_media_recorder',afterLate.nativeCreates===1&&afterLate.tracks.every(state=>state==='ended')&&afterLate.files===0,{nativeCreates:afterLate.nativeCreates,tracks:afterLate.tracks});
 await a.evaluate(()=>window.probe.recorder.start());
 await b.evaluate(()=>window.probe.otherLesson());const isolated=await a.evaluate(()=>window.probe.status());check('different_lesson_does_not_stop_capture',isolated.state.stage==='recording'&&isolated.tracks.at(-1)==='live');
 await a.evaluate(()=>{window.deliveryAck=new Promise(resolve=>{const channel=new BroadcastChannel('ardesia:canonical-audio-revocation:v1');channel.onmessage=event=>{if(event.data?.probeFence==='after-invalid-notices'){channel.close();resolve()}}})});
 await b.evaluate(()=>{const channel=new BroadcastChannel('ardesia:canonical-audio-revocation:v1');channel.postMessage(window.oldOffNotice);channel.postMessage({v:1,scope:'local-storage',...window.probe.identity,sha256:'0'.repeat(64)});channel.postMessage({v:1,scope:'local-storage',...window.probe.identity,sha256:'0'.repeat(64),audioConsent:true});channel.postMessage({probeFence:'after-invalid-notices'});channel.close()});
 // A sentinel on the same channel establishes delivery order in the receiving realm.
 await a.evaluate(()=>window.deliveryAck);
 const afterUntrusted=await a.evaluate(()=>window.probe.status());check('untrusted_notice_cannot_demote_current_on',afterUntrusted.state.stage==='recording'&&afterUntrusted.tracks.at(-1)==='live');
 await b.evaluate(()=>window.probe.revoke());
 await a.evaluate(()=>window.probe.recorder.dispose());await b.evaluate(()=>window.probe.recorder.dispose());
 const locks=await a.evaluate(()=>navigator.locks.query());check('no_capture_lifetime_locks_after_dispose',!locks.held.some(lock=>lock.name.startsWith('ardesia:audio-capture:')),{heldCaptureLocks:locks.held.filter(lock=>lock.name.startsWith('ardesia:audio-capture:')).length});
 check('no_browser_page_errors',errors.length===0,{errors});

 await ensureWithinDeadline();
}
let deadline;
try{
 await Promise.race([run(),new Promise((_,reject)=>{deadline=setTimeout(()=>{cancelled=true;reject(new Error('Audio boundary scenario exceeded 45 seconds'))},45000)})]);
 evidence.status='PASS';
}catch(error){evidence.status='FAIL';evidence.failure=error.message;process.exitCode=1}
finally{
 clearTimeout(deadline);
 const cleanup=await Promise.allSettled([browser?.close(),server?.close()]);
 if(cleanup.some(result=>result.status==='rejected')){evidence.status='FAIL';evidence.cleanup='failed';process.exitCode=1}else evidence.cleanup='closed-owned-browser-and-server';
 if(out)await writeFile(path.join(out,'native-two-tabs.json'),JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify(evidence,null,2));
}
