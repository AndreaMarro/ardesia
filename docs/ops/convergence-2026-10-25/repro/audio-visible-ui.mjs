import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';
const repo=fileURLToPath(new URL('../../../../',import.meta.url));
const out=process.env.ARDESIA_QA_OUTPUT;if(!out)throw Error('Set ARDESIA_QA_OUTPUT to a fresh local output directory');
const baseURL=process.env.ARDESIA_QA_BASE_URL??'http://127.0.0.1:55343';
const target=new URL(baseURL);if(!['127.0.0.1','localhost','[::1]'].includes(target.hostname)||!['http:','https:'].includes(target.protocol)||target.username||target.password)throw Error('Synthetic QA only supports explicit loopback origins');
const code=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const {chromium,expect}=await import(pathToFileURL(path.join(repo,'apps/studio/node_modules/@playwright/test/index.mjs')).href);
import {writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const report={code,scope:'Built Studio UI, fake native microphone, two pages same origin and lesson',checks:[]};
const browser=await chromium.launch({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});let context;
function check(id,ok,detail={}){report.checks.push({id,passed:ok,...detail});if(!ok)throw Error(id)}
try{
 context=await browser.newContext({permissions:['microphone'],viewport:{width:1440,height:1000},recordVideo:{dir:out+'/audio-ui-video'}});
 await context.addInitScript(()=>{const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);window.__audioQA={calls:0,data:0,tracks:[]};navigator.mediaDevices.getUserMedia=async o=>{window.__audioQA.calls++;window.__audioQA.startedAt=performance.now();const s=await original(o);window.__audioQA.tracks.push(...s.getTracks());return s};const Native=window.MediaRecorder;window.MediaRecorder=class extends Native{constructor(...args){super(...args);this.addEventListener('dataavailable',e=>{if(e.data.size)window.__audioQA.data++})}}});
 const a=await context.newPage();await a.goto(baseURL+'/studio/#ui-audio-'+randomUUID());
 await a.getByRole('button',{name:'Registra e collega un passaggio'}).click();
 await a.getByLabel('Annotazione del docente').fill('A pressione fissata la portata cresce con la quarta potenza del raggio.');
 await a.getByRole('button',{name:'Annota passaggio',exact:true}).click();await expect(a.getByText(/Passaggio collegato:/)).toBeVisible();
 await a.getByRole('checkbox',{name:'Solo il mio microfono docente'}).check();await a.getByRole('button',{name:'Registra audio',exact:true}).click();await expect(a.getByText('Registrazione in corso',{exact:true})).toBeVisible();await a.waitForFunction(()=>performance.now()-window.__audioQA.startedAt>=1200);
 await a.getByRole('button',{name:'Termina registrazione',exact:true}).click();await expect(a.getByText('Audio salvato nella lezione.',{exact:true})).toBeVisible();check('teacher_annotation_and_take_saved_through_controls',true);
 const b=await context.newPage();await b.goto(a.url());await b.getByRole('button',{name:'Registra e collega un passaggio'}).click();await b.getByText('Audio delle aperture precedenti',{exact:true}).click();await expect(b.getByRole('button',{name:'Revoca audio della registrazione precedente',exact:true})).toBeVisible();
 check('saved_consent_does_not_start_microphone_in_new_view',await b.evaluate(()=>window.__audioQA.calls===0));
 await a.getByRole('button',{name:'Registra audio',exact:true}).click();await expect(a.getByText('Registrazione in corso',{exact:true})).toBeVisible();check('second_take_is_actively_recording',await a.evaluate(()=>window.__audioQA.tracks.some(t=>t.readyState==='live')));
 await b.getByRole('button',{name:'Revoca audio della registrazione precedente',exact:true}).click();await expect(b.getByRole('button',{name:'Audio revocato',exact:true})).toBeDisabled();
 await expect(a.getByText('Microfono spento',{exact:true})).toBeVisible();check('revocation_ui_ack_after_other_view_tracks_end',await a.evaluate(()=>window.__audioQA.tracks.every(t=>t.readyState==='ended')));
 await a.getByText('Altri modi di trasferire il passaggio',{exact:true}).click();await a.getByRole('button',{name:'Copia passaggio per il corso',exact:true}).click();await expect(a.getByRole('alert')).toContainText('non è più disponibile');await expect(a.getByLabel('Riferimento del passaggio',{exact:true})).toHaveCount(0);check('revoked_reference_cannot_be_copied',true);
 await a.screenshot({path:out+'/audio-visible-after-revoke.png'});await b.screenshot({path:out+'/audio-history-revoked.png'});report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.message;process.exitCode=1}
finally{await context?.close();await browser.close();await writeFile(out+'/audio-visible-ui.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))}
