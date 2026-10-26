import {fileURLToPath,pathToFileURL} from 'node:url';
import {join,resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const repo=fileURLToPath(new URL('../../../../',import.meta.url));
const {chromium}=await import(pathToFileURL(join(repo,'node_modules/playwright/index.mjs')).href);
const output=resolve(process.env.ARDESIA_MEDIA_OUTPUT??'/tmp/ardesia-unlinked-browser');await mkdir(output,{recursive:true});
const studio=process.env.ARDESIA_MEDIA_STUDIO_URL??'http://127.0.0.1:5482';
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath:process.env.ARDESIA_CHROMIUM??'/tmp/ardesia-browsers/chromium-1223/chrome-linux64/chrome',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const errors=[],checks=[];let context;
const observe=page=>{page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});page.setDefaultTimeout(30000);};
try{
 for(const hidden of [false,true]){
  context=await browser.newContext({permissions:['microphone'],viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const room='unlinked-consent-'+(hidden?'hidden':'visible');
  const teacher=await context.newPage();observe(teacher);await teacher.goto(studio+'/#'+room);
  await teacher.getByRole('button',{name:'Registra e collega un passaggio'}).click();
  assert.equal(await teacher.getByRole('checkbox',{name:'Solo il mio microfono docente'}).isChecked(),false);
  assert.equal(await teacher.getByRole('button',{name:'Registra audio',exact:true}).isDisabled(),true);
  // Deliberately do not annotate/link an object. Consent still belongs to this take.
  await teacher.getByRole('checkbox',{name:'Solo il mio microfono docente'}).check();
  await teacher.getByRole('button',{name:'Registra audio',exact:true}).click();
  await teacher.getByRole('status').getByText('Registrazione in corso',{exact:true}).waitFor();
  await teacher.waitForTimeout(4500);
  await teacher.getByRole('button',{name:'Termina registrazione',exact:true}).click();
  await teacher.getByText('Audio salvato nella lezione.',{exact:true}).waitFor();
  const canonical=await teacher.evaluate(async room=>{
   const {workspaceStore}=await import('/src/store/WorkspaceStore.ts');const {loadReplayTimeline}=await import('/src/store/replayTimeline.ts');
   const {recordingSession}=await import('/src/store/audioRecording.ts');const timeline=await loadReplayTimeline(workspaceStore,room);
   const recording=timeline.recordings[0];return {identity:recordingSession(recording),recordingId:recording.recordingId,objectRefs:recording.objectRefs,sha256:recording.sha256,durationMs:recording.durationMs};
  },room);
  assert.deepEqual(canonical.objectRefs,[]);assert.ok(canonical.durationMs>=4000);
  await teacher.locator('summary').filter({hasText:'Consenso e cancellazione'}).click();
  const player=await context.newPage();observe(player);await player.goto(studio+'/?vista=replay#'+room);
  await player.locator('.st-replay-passages').getByRole('button',{name:'Registrazione 1',exact:true}).click();
  await player.getByText('Waveform pronta',{exact:true}).waitFor();
  assert.equal(await player.getByRole('heading',{name:'Registrazione audio del docente',exact:true}).count(),1);
  assert.equal(await player.getByLabel('Nota privata',{exact:true}).count(),0);
  assert.equal(await player.getByRole('navigation',{name:'Marker e capitoli della lezione'}).count(),0);
  assert.equal(await player.locator('audio').count(),1);assert.equal(await player.locator('audio').evaluate(audio=>audio.controls),false);
  await player.screenshot({path:join(output,(hidden?'hidden':'visible')+'-ready.png'),fullPage:true});
  await player.getByRole('button',{name:'Ricomincia',exact:true}).click();
  await player.waitForFunction(()=>document.querySelector('audio')?.currentTime<.1);
  await player.locator('audio').evaluate(audio=>{audio.playbackRate=.5;audio.dataset.qaNaturalEnds='0';audio.addEventListener('ended',()=>{audio.dataset.qaNaturalEnds=String(Number(audio.dataset.qaNaturalEnds)+1);});});
  await player.getByRole('button',{name:'Ascolta',exact:true}).click();
  await player.waitForFunction(()=>document.querySelector('audio')?.paused===false);
  const blob=await player.locator('audio').getAttribute('src');
  if(hidden){await player.getByRole('button',{name:'Nascondi waveform',exact:true}).click();await player.getByText('Waveform nascosta',{exact:true}).waitFor();assert.equal(await player.locator('audio').getAttribute('src'),blob);}
  const beforeRevocation=await player.locator('audio').evaluate(audio=>({paused:audio.paused,time:audio.currentTime,duration:audio.duration,rate:audio.playbackRate}));assert.equal(beforeRevocation.paused,false);
  const revokedAt=Date.now();await teacher.getByRole('button',{name:'Revoca e cancella audio',exact:true}).click();
  await teacher.getByText("Audio della sessione cancellato. Le copie già esportate restano esterne all'app.",{exact:true}).waitFor();
  await player.getByRole('alert').filter({hasText:/Audio revocato|Sessione audio modificata/}).waitFor();
  const revocationMs=Date.now()-revokedAt;
  assert.equal(await player.locator('audio').getAttribute('data-qa-natural-ends'),'0','take ended naturally before revocation stopped it');
  assert.equal(await player.locator('audio').evaluate(audio=>audio.paused&&!audio.getAttribute('src')),true);
  assert.equal(await player.getByRole('button',{name:'Ascolta',exact:true}).isDisabled(),true);
  const after=await teacher.evaluate(async identity=>{const {workspaceStore}=await import('/src/store/WorkspaceStore.ts');const {readAudioSession}=await import('/src/store/audioRecording.ts');const {sessionPaths}=await import('/src/store/sessionState.ts');return {consent:(await readAudioSession(workspaceStore,identity))?.value.audioConsent,files:(await workspaceStore.list(sessionPaths(identity).audioDir)).length};},canonical.identity);
  assert.deepEqual(after,{consent:false,files:0});
  await player.setViewportSize({width:390,height:844});assert.equal(await player.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await player.screenshot({path:join(output,(hidden?'hidden':'visible')+'-revoked-390.png'),fullPage:true});
  checks.push({mode:hidden?'waveform-hidden':'waveform-visible',status:'PASS',revocationMs,beforeRevocation,naturalEndExcluded:true,recordingId:canonical.recordingId,objectRefs:0,canonicalConsent:false,canonicalAudioFiles:0,mediaDetached:true});
  await context.close();context=null;
 }
 assert.deepEqual(errors,[]);
 const result={status:'PASS',sourceCommit,browser:browser.version(),checks,errors,limits:['Microfono sintetico Chromium; nessun ascolto umano o device fisico','Revoca osservata su entrambi i renderer usando i veri controlli Room e due viste della stessa origine','Non revoca fisicamente Blob o copie già esportate/scaricate da soggetti esterni','Chunk legacy senza identità sessione esplicita non vengono attribuiti a una sessione moderna']};
 await writeFile(join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}catch(error){await writeFile(join(output,'failure.json'),JSON.stringify({status:'FAIL',error:String(error),errors,pages:context?.pages().map(page=>page.url())},null,2)+'\n');for(const [i,page] of (context?.pages()??[]).entries()){await page.screenshot({path:join(output,'failure-'+i+'.png'),fullPage:true}).catch(()=>{});await writeFile(join(output,'failure-'+i+'.txt'),await page.locator('body').innerText().catch(()=>''));}throw error;}
finally{await context?.close();await browser.close();}
