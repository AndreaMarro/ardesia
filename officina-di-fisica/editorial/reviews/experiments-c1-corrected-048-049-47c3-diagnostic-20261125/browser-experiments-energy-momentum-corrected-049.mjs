import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs/promises';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const reviewedProfile='47c3bed2308846b84fb069571319225fbc486fcb7c2bdaa1959979c6aeb6b4ca';
const profile=()=>JSON.parse(execFileSync(process.env.PYTHON||'python3',['-c',"from pathlib import Path; from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint; import json; print(json.dumps(runtime_fingerprint(Path.cwd())))"],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8'})).sha256;
const reviewedRuntime={"static/js/banchi/voci/esperimento.js":"cc435e51b62d5b9961b32f5d9b349171f7432e3bf6a6911cd80daaa1f419767b","static/js/banchi/voci/engines.js":"09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab","static/js/banchi/voci/assessment-selection.js":"2f5435b6c9e8b76667d0a95f35860f835117cf8230a635c4c3a54c479fbc54b3","static/js/banchi/voci/geometria.js":"986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08","static/js/banchi/voci/tavola.js":"cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283","static/js/banchi/voci/confronti.js":"83f1ab0d443dc93eb72c0318e32856179486643257c5bbf136e686464fdc6c39","static/js/banchi/voci/legende.js":"2de769cc9358c907eb30ac6b18c6bc3e06e18a1ece514a7d368ecd40bec33d1b","static/js/banchi/voci/orologi.js":"30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6","static/js/banchi/voci/modelli/C1.js":"e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34","static/js/banchi/voci/apparati/meccanica.js":"b59e779404d917f81f2fb1f022a596be5eb24ba7f6865f2046aee8546bebddd3","static/js/banchi/banco.js":"8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9","static/js/banchi/misure.js":"46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d","static/js/banchi/grafici.js":"e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd","static/js/banchi/scena.js":"4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095","static/js/banchi/etichette.js":"455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3","static/js/banchi/aula.js":"44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967","static/js/ui.js":"77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27"};
const hashes=async()=>Object.fromEntries(await Promise.all(Object.keys(reviewedRuntime).map(async name=>[name,createHash('sha256').update(await fs.readFile(root+'/'+name)).digest('hex')])));

const db=await fs.mkdtemp('/private/tmp/cric-review049-db-');
const outdir=process.env.ASTRA_SHOTS||await fs.mkdtemp('/tmp/cric-review049-proof-');await fs.mkdir(outdir,{recursive:true});
const server=spawn(process.env.PYTHON||'python3',['-c',"from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()"],{cwd:root,env:{...process.env,ASTRA_DATA:db,ASTRA_EXTENSIONS:root+'/extensions',PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','pipe']});
let errors='',browser;server.stderr.on('data',x=>errors+=x.toString());
let url;
const report={appRoot:root,sourceRef:'5d1dc8dc7b601aef959d10d564c75462be74708d',cases:[],errors:[],scientificApproval:false,reviewScope:'CORRECTED_049_OBSERVATION_ONLY_NO_SCIENTIFIC_APPROVAL',publicationAction:'NONE',humanApproval:'NOT_RUN'};
try {
 const before=await hashes();const fullProfile=profile();if(fullProfile!==reviewedProfile)throw Error('Bundled runtime profile differs from independent reading');report.runtimeProfileSha256=fullProfile;
 if(JSON.stringify(before)!==JSON.stringify(reviewedRuntime))throw Error('Runtime/source differs from independently read bytes');
 const ready=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{cleanup();reject(Error('boot timeout '+errors));},20000);
   const cleanup=()=>{clearTimeout(timer);server.stdout.off('data',onData);server.off('exit',onExit);};
   const onData=value=>{cleanup();resolve(value);};
   const onExit=()=>{cleanup();reject(Error('server ended '+errors));};
   server.stdout.once('data',onData);server.once('exit',onExit);
 });
 url='http://127.0.0.1:'+String(ready).trim()+'/';report.base=url;
 report.runtimeSha256=before;report.protocolSha256=createHash('sha256').update(await fs.readFile(fileURLToPath(import.meta.url))).digest('hex');
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
 for(const disable of [false,true]){
  const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
  if(disable)await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.includes('webgl')?null:get.call(this,kind,...args);};});
  await context.request.post(url+'api/demo',{headers:{'X-Astra-Request':'1'},data:{}});
  const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(String(e)));
  for(const [id,index,answers] of [["SIM-C1-L008-01", 0, [-8, -6]], ["SIM-C1-L008-02", 2, [150, 62.5]], ["SIM-C1-L008-03", 2, [30, 25]], ["SIM-C1-L009-01", 2, [8, 6]], ["SIM-C1-L009-02", 2, [1.5, 0]], ["SIM-C1-L010-01", 2, [3, 2.5]], ["SIM-C1-L010-02", 2, [20, 14.14]], ["SIM-C1-L010-03", 2, [3, 2]], ["SIM-C1-L010-04", 0, [4, 4.615]], ["SIM-C1-L010-05", 0, [50, 75]]]){
   await page.goto(url+'#banco/'+id);await page.locator('[data-predict]').waitFor({state:'visible'});
   await page.locator('[name=prediction]').nth(index).check();await page.locator('[data-predict] button').click();
   await page.locator('[data-guide]').waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('[data-display]')?.textContent.includes('3D interattivo')||document.querySelector('[data-display]')?.textContent.includes('Tavola di misura'));
   const observedMode=await page.locator('[data-display]').innerText();if(!(disable?observedMode.includes('Tavola di misura'):observedMode.includes('3D interattivo')))throw Error('Requested rendering mode not actually observed '+observedMode);
   const modes=[];
   for(let phase=1;phase<=4;phase++){
    await page.locator('[data-phase="'+phase+'"]').click();
    const state=await page.locator('[data-guide]').innerText();modes.push({phase,text:state,readings:await page.locator('[data-readings]').innerText()});
    if(false){
      for(let i=0;i<3;i++){await page.locator('[data-math-next]').click();modes.push({phase:'math'+i,text:await page.locator('[data-guide]').innerText()});}
    }
   }
   for(let i=0;i<answers.length;i++){
    const form=page.locator('[data-check="'+i+'"]');
    await form.locator('input').fill(String(answers[i]+9999));await form.locator('button').click();
    if((await form.locator('[role=status]').innerText()).startsWith('Corretto'))throw Error(id+' wrongly accepted');
    await form.locator('input').fill(String(answers[i]).replace('.',','));await form.locator('button').click();
    if(!(await form.locator('[role=status]').innerText()).startsWith('Corretto'))throw Error(id+' rejected independently solved answer '+i);
   }
   await page.locator('[data-phase="2"]').click();
   const guide=await page.locator('[data-guide]').innerText();
   const dir=outdir+'/'+id+(disable?'-2d':'-3d')+'.png';await page.screenshot({path:dir,fullPage:false});
   report.cases.push({id,noWebGL:disable,display:await page.locator('[data-display]').innerText(),modes,answerCount:answers.length,independentAnswers:answers,screenshot:dir});
   await boundaries(page,id,outdir,report);
  }
  await context.close();
 }
 const after=await hashes();if(profile()!==reviewedProfile)throw Error('Bundled runtime profile changed during review');if(JSON.stringify(after)!==JSON.stringify(reviewedRuntime))throw Error('Runtime changed during consumer review');
 report.terminalStatus=report.errors.length?'FAIL':'PASS';report.browserVersion=browser.version();
 if(report.cases.length!==94)throw Error('Incomplete94-case matrix');
 await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({outdir,cases:report.cases.length,errors:report.errors}));
 if(report.errors.length)throw Error(report.errors.join('\n'));
} catch(error){report.terminalStatus='FAIL';report.failure=String(error);await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');throw error;} finally {await browser?.close();server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>{const timer=setTimeout(()=>{server.off('exit',done);resolve();},2000);const done=()=>{clearTimeout(timer);resolve();};server.once('exit',done);});server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(db,{recursive:true,force:true});}

async function boundaries(page,id,outdir,report){
 const cases={
 'SIM-C1-L008-01':[[1,'-2 J'],[3,'-6 J'],[5,'-10 J']],
 'SIM-C1-L008-02':[[0,'0 mJ'],[5,'62,5 mJ'],[10,'150 mJ']],
 'SIM-C1-L008-03':[[5,'0 J'],[2.5,'25 J'],[0,'50 J']],
 'SIM-C1-L009-01':[[0,'0 N·s'],[1.5,'6 N·s'],[3,'12 N·s']],
 'SIM-C1-L009-02':[[-3,'-1,5 m/s'],[0,'0 m/s'],[3,'1,5 m/s']],
 'SIM-C1-L010-01':[[0,'1 m'],[1.5,'2,5 m'],[3,'4 m']],
 'SIM-C1-L010-02':[[0,'0 cm'],[45,'14,14 cm'],[90,'20 cm']],
 'SIM-C1-L010-03':[[0,'0 N·m'],[40,'4 N·m']],
 'SIM-C1-L010-04':[[10,'12 N'],[26,'4,615 N'],[40,'3 N']],
 'SIM-C1-L010-05':[[2,'150 N'],[4,'75 N'],[6,'50 N']]
 }[id];
 for(let i=0;i<cases.length;i++){
  const [x,want]=cases[i];await page.locator('[data-phase="2"]').click();await page.locator('[name=x]').fill(String(x));await page.locator('[name=x]').dispatchEvent('input');
  const primary=(await page.locator('[data-readings]>div').nth(1).locator('strong').innerText()).replaceAll('−','-');if(primary!==want)throw Error(id+' expected '+want+' actual '+primary);
  const text=await page.locator('[data-readings]').innerText();
  if(id==='SIM-C1-L009-02'){
   if(!text.includes(x===0?'Entrambe nulle':'0,5'))throw Error('Energy ratio boundary differs');
   if(!text.includes('(a fine prova)'))throw Error('Final velocity falsely unlabeled before collision');
  }
  await page.locator('[data-phase="3"]').click();const image=outdir+'/'+id+'-'+(await page.locator('[data-display]').innerText()).includes('Tavola di misura')+'-boundary'+i+'.png';await page.screenshot({path:image,fullPage:false});report.cases.push({id,noWebGLBoundary:await page.locator('[data-display]').innerText(),boundary:i,input:x,want,readings:text,screenshot:image});
 }
 if(id==='SIM-C1-L009-02')for(const u of[-3,3]){
  await page.locator('[data-phase="2"]').click();await page.locator('[name=x]').fill(String(u));await page.locator('[name=x]').dispatchEvent('input');
  const detail=page.locator('.time-options');if(!await detail.evaluate(el=>el.open))await detail.locator('summary').click();
  for(const [time,positive]of[[0,-2.2],[.49,-.73],[.5,-.7],[1.2,.35]]){
   await page.locator('[data-instant]').fill(String(time));await page.locator('[data-instant]').dispatchEvent('change');
   const text=await page.locator('[data-readings]>div').filter({hasText:'Posizione del centro di A'}).locator('strong').innerText();const got=Number(text.trim().split(/\s+/)[0].replace(',','.'));const want=u>0?positive:-positive;
   if(Math.abs(got-want)>1e-10)throw Error('Collision clock/current position differs '+u+' '+time+' '+text);
   const image=outdir+'/'+id+'-'+(await page.locator('[data-display]').innerText()).includes('Tavola di misura')+'-clock'+u+'-'+time+'.png';await page.screenshot({path:image,fullPage:false});report.cases.push({id,kind:'collision_clock',initialVelocity:u,time,readout:text,independentPosition:want,screenshot:image});
  }
 }
}
