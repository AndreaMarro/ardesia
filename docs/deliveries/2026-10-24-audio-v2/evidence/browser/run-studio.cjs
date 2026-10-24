// Real UI + native Chromium recorder. Only getUserMedia supplies a synthetic tone.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
function sourceManifest(){const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','apps/studio/src','apps/studio/build','apps/studio/vite.config.ts','apps/studio/package.json','apps/studio/package-lock.json'],{encoding:'utf8'}).trim().split('\n').sort();return Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))}
const {chromium} = require(path.resolve('apps/studio/node_modules/playwright-core'));
const out = path.resolve(process.env.ARDESIA_QA_OUTPUT || '../studio-ui-run-1');
fs.mkdirSync(out, {recursive:true});
const origin = 'http://127.0.0.1:5197';
const errors=[],consoleMessages=[],failedRequests=[],checks=[];
const check=(name,value)=>{checks.push({name,pass:!!value});assert.ok(value,name)};
(async()=>{
 const before=sourceManifest();fs.writeFileSync(path.join(out,'source-before.json'),JSON.stringify(before,null,2));
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',locale:'it-IT'});
 await context.tracing.start({screenshots:true,snapshots:true,sources:true});
 await context.addInitScript(()=>{
   window.__syntheticAudio={calls:0,streams:[],events:[]};
   navigator.mediaDevices.getUserMedia=async()=>{
     window.__syntheticAudio.calls++;
     const ac=new AudioContext(); await ac.resume();
     const oscillator=ac.createOscillator(),gain=ac.createGain(),dest=ac.createMediaStreamDestination();
     gain.gain.value=.05;oscillator.frequency.value=440;oscillator.connect(gain).connect(dest);oscillator.start();
     window.__syntheticAudio.streams.push(dest.stream);
     return dest.stream;
   };
 });
 const watch=page=>{
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(['warning','error'].includes(m.type()))consoleMessages.push({type:m.type(),text:m.text()})});
   page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
 };
 const page=await context.newPage();watch(page);
 async function openRoom(room){
   await page.goto(origin+'/#'+room);
   await page.getByText('Registra e collega un passaggio',{exact:true}).click();
   await page.getByRole('button',{name:'Registra audio',exact:true}).waitFor();
   check(room+' does not auto capture',await page.evaluate(()=>window.__syntheticAudio.calls===0));
 }
 async function take(label){
   await page.getByLabel('Annotazione del docente',{exact:true}).fill(label);
   await page.getByRole('button',{name:'Annota passaggio',exact:true}).click();
   await page.getByText('Passaggio collegato: '+label,{exact:true}).waitFor();
   await page.getByLabel('Solo il mio microfono docente').check();
   await page.getByRole('button',{name:'Registra audio',exact:true}).click();
   await page.getByText('Registrazione in corso',{exact:true}).waitFor();
   await page.waitForTimeout(1200); // intentional physical recording duration below native timeslice
   await page.getByRole('button',{name:'Termina registrazione',exact:true}).click();
   await page.getByText('Audio salvato nella lezione.',{exact:true}).waitFor();
   check('native tracks closed after stop',await page.evaluate(()=>window.__syntheticAudio.streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))));
   await page.getByRole('button',{name:'Copia passaggio per il corso',exact:true}).click();
   const descriptor=JSON.parse(await page.getByRole('textbox',{name:'Riferimento del passaggio',exact:true}).inputValue());
   check('recording has an actual board object/version',descriptor.objectRefs.length===1&&descriptor.objectRefs[0].version>=1);
   return descriptor;
 }
 try {
   await openRoom('audio-v2-room-a');
   const first=await take('Poiseuille: qui la differenza di pressione resta fissata.');
   await page.waitForTimeout(500); // declared pause between independent media streams
   const second=await take('A portata fissata isoliamo la differenza di pressione.');
   check('two recordings are distinct',first.recordingId!==second.recordingId&&second.startEpoch>first.endEpoch);
   fs.writeFileSync(path.join(out,'passage.json'),JSON.stringify(second,null,2));
   await page.screenshot({path:path.join(out,'teacher-audio-desktop.png')});
   const media=await page.evaluate(async()=>{
     const h=window.__MAESTRO_TEST__,{loadReplayTimeline}=await import('/src/store/replayTimeline.ts');
     const tl=await loadReplayTimeline(h.store,h.room),decoded=[];
     for(const ref of tl.recordings){const bytes=await h.store.read(ref.assetPath);const ac=new AudioContext();const buffer=await ac.decodeAudioData(await bytes.arrayBuffer());decoded.push({id:ref.recordingId,bytes:bytes.size,duration:buffer.duration,mime:ref.mimeType});await ac.close()}
     // Hostile global residue must never appear in scoped replay/export.
     await h.store.write('raw/events.jsonl',new Blob(['HOSTILE LEGACY ROOM B']));
     return {decoded,recordings:tl.recordings.map(r=>({...r,data:undefined}))};
   });
   check('both native complete streams decode',media.decoded.length===2&&media.decoded.every(d=>d.bytes>0&&d.duration>0));
   fs.writeFileSync(path.join(out,'native-media.json'),JSON.stringify(media,null,2));
   await page.getByRole('link',{name:'Materiali',exact:true}).click();
   const download=page.waitForEvent('download');
   await page.getByRole('button',{name:'Esporta .lesson',exact:true}).click();
   await (await download).saveAs(path.join(out,'lesson-a.lesson'));
   await openRoom('audio-v2-room-b');
   const b=await take('Questa annotazione appartiene soltanto alla lezione B.');
   check('room B identity isolated',b.lessonId==='audio-v2-room-b'&&b.sessionId!==second.sessionId);
   await page.goto(second.replayUrl);
   await page.getByRole('slider',{name:'linea del tempo della lezione'}).waitFor();
   await page.getByRole('slider',{name:'linea del tempo della lezione'}).press('End');
   await page.screenshot({path:path.join(out,'replay-desktop.png')});
   await page.setViewportSize({width:390,height:844});
   await page.getByRole('button',{name:'Inquadra contenuto',exact:true}).click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:path.join(out,'replay-mobile.png')});
   check('mobile document fits',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check('font requests local',!failedRequests.some(r=>/woff|font|excalidraw.*cdn/.test(r.url)));
   await context.storageState({path:path.join(out,'studio-storage.json'),indexedDB:true});
   await page.reload();
   await page.getByRole('slider',{name:'linea del tempo della lezione'}).waitFor();
   check('cold replay does not request microphone',await page.evaluate(()=>window.__syntheticAudio.calls===0));
   const fresh=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',locale:'it-IT'});
   const imported=await fresh.newPage();watch(imported);
   await imported.goto(origin+'/?vista=lezioni-salvate#audio-v2-room-a');
   await imported.getByLabel('Seleziona bundle .lesson').setInputFiles(path.join(out,'lesson-a.lesson'));
   await imported.getByRole('button',{name:'Importa il bundle',exact:true}).waitFor();
   await imported.getByRole('button',{name:'Importa il bundle',exact:true}).click();
   await imported.getByText(/Memoria didattica ripristinata|Import completato|ripristinata|importata/i).first().waitFor({timeout:15000});
   await imported.goto(second.replayUrl);
   await imported.getByRole('slider',{name:'linea del tempo della lezione'}).waitFor();
   const freshResult=await imported.evaluate(async()=>{
     const {workspaceStore}=await import('/src/store/WorkspaceStore.ts');
     const {loadReplayTimeline}=await import('/src/store/replayTimeline.ts');
     const a=await loadReplayTimeline(workspaceStore,'audio-v2-room-a');
     return {ids:a.recordings.map(r=>r.recordingId),available:a.recordings.map(r=>r.availability),b:(await workspaceStore.list('raw/audio-v2-room-b/')).length};
   });
   check('fresh store recovers two original recording identities',freshResult.ids.includes(first.recordingId)&&freshResult.ids.includes(second.recordingId));
   check('fresh store has no room B',freshResult.b===0);
   check('fresh store media pass digest/consent verification',freshResult.available.every(state=>state==='available'));
   await imported.screenshot({path:path.join(out,'fresh-store-import-replay.png')});
   await imported.goto(origin+'/#audio-v2-room-a');
   await imported.getByText('Registra e collega un passaggio',{exact:true}).click();
   await imported.getByText('Audio delle aperture precedenti',{exact:true}).click();
   await imported.getByRole('button',{name:'Revoca audio della registrazione precedente',exact:true}).click();
   await imported.getByRole('button',{name:'Audio revocato',exact:true}).waitFor();
   await imported.goto(second.replayUrl);
   await imported.getByText('Audio revocato e cancellato.',{exact:true}).waitFor();
   check('historical audio can be revoked through ordinary UI after import',true);
   await imported.screenshot({path:path.join(out,'revoked-after-import.png')});
   await fresh.close();
   check('no app page errors',errors.length===0);
   const after=sourceManifest();fs.writeFileSync(path.join(out,'source-after.json'),JSON.stringify(after,null,2));check('source bytes stayed frozen throughout browser run',JSON.stringify(before)===JSON.stringify(after));
 } catch(error) {fs.writeFileSync(path.join(out,'failure.txt'),String(error.stack));await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error}
 finally {await context.tracing.stop({path:path.join(out,'trace.zip')});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({checks,errors,consoleMessages,failedRequests},null,2));await browser.close()}
 console.log(JSON.stringify({output:out,checks:checks.length}));
})().catch(e=>{console.error(e);process.exitCode=1});
