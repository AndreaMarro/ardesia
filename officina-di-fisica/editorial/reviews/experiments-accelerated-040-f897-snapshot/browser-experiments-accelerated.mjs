import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs/promises';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const reviewedProfile='f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5';
const profile=()=>JSON.parse(execFileSync(process.env.PYTHON||'python3',['-c',"from pathlib import Path; from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint; import json; print(json.dumps(runtime_fingerprint(Path.cwd())))"],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8'})).sha256;
const reviewedRuntime={"static/js/banchi/voci/esperimento.js":"fce66f301918483fe79d0f8dbf84c280268e48e615e9c016f2bbd32f699f5075","static/js/banchi/voci/engines.js":"09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab","static/js/banchi/voci/geometria.js":"986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08","static/js/banchi/voci/tavola.js":"cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283","static/js/banchi/voci/confronti.js":"4ee391c0841fed7e1888d2c57cfb2494f8e0be0581a6211d50d410bd172602b9","static/js/banchi/voci/legende.js":"2de769cc9358c907eb30ac6b18c6bc3e06e18a1ece514a7d368ecd40bec33d1b","static/js/banchi/voci/orologi.js":"30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6","static/js/banchi/voci/modelli/C1.js":"e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34","static/js/banchi/voci/apparati/meccanica.js":"dc005819f8f12ec48722d32b1d236328ecab75e0734c9ecd0a147751c6bb8fd7","static/js/banchi/banco.js":"682ba25fcf97b67821b8c9bb6c73a571c87559f94bbda3f64cfad65fab63cdb8","static/js/banchi/misure.js":"8d631c65b0266ece6447da07aff7a43ee61b66d0767ddc24ace3f59b31fac186","static/js/banchi/grafici.js":"e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd","static/js/banchi/scena.js":"4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095","static/js/banchi/etichette.js":"455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3","static/js/banchi/aula.js":"44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967","static/js/ui.js":"77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27","content/esperienze-C1.json":"84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3"};
const hashes=async()=>Object.fromEntries(await Promise.all(Object.keys(reviewedRuntime).map(async name=>[name,createHash('sha256').update(await fs.readFile(root+'/'+name)).digest('hex')])));

const db=await fs.mkdtemp('/private/tmp/cric-review-experiments040-db-');
const outdir=process.env.ASTRA_SHOTS||await fs.mkdtemp('/tmp/cric-review-experiments040-proof-');await fs.mkdir(outdir,{recursive:true});
const server=spawn(process.env.PYTHON||'python3',['-c',"from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()"],{cwd:root,env:{...process.env,ASTRA_DATA:db,ASTRA_EXTENSIONS:root+'/extensions',PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','pipe']});
let errors='',browser;server.stderr.on('data',x=>errors+=x.toString());
let url;
const report={appRoot:root,sourceRef:'5d1dc8dc7b601aef959d10d564c75462be74708d',purpose:'DIAGNOSTIC_ORIGINAL_DEFECTS_NOT_SCIENTIFIC_APPROVAL',expectedSourceIssueIds:[],expectedConsumerIssueIds:[],cases:[],errors:[],publicationAction:'NONE',humanApproval:'NOT_RUN'};
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
  for(const [id,index,answers] of [['SIM-C1-L004-01',2,[9,4]],['SIM-C1-L004-02',0,[0,15.95]],['SIM-C1-L004-03',2,[10,7]],['SIM-C1-L004-04',2,[8,6.125]]]){
   await page.goto(url+'#banco/'+id);await page.locator('[data-predict]').waitFor({state:'visible'});
   await page.locator('[name=prediction]').nth(index).check();await page.locator('[data-predict] button').click();
   await page.locator('[data-guide]').waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('[data-display]')?.textContent.includes('3D interattivo')||document.querySelector('[data-display]')?.textContent.includes('Tavola di misura'));
   const modes=[];
   for(let phase=1;phase<=4;phase++){
    await page.locator('[data-phase="'+phase+'"]').click();
    const state=await page.locator('[data-guide]').innerText();modes.push({phase,text:state,readings:await page.locator('[data-readings]').innerText()});
    if(phase===3&&false){
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
   await page.locator('[data-reset]').click();
   const dir=outdir+'/'+id+(disable?'-2d':'-3d')+'.png';await page.screenshot({path:dir,fullPage:false});
   report.cases.push({id,noWebGL:disable,display:await page.locator('[data-display]').innerText(),modes,answerCount:answers.length,screenshot:dir});
   const boundaries={'SIM-C1-L004-01':[0,1,2,4],'SIM-C1-L004-02':[0,1,2],'SIM-C1-L004-03':[1,6],'SIM-C1-L004-04':[1,6]}[id];
   for(const value of boundaries){
    const control=page.locator('[name=x]');await control.fill(String(value));await control.dispatchEvent('input');await page.waitForTimeout(120);
    const screenshot=outdir+'/'+id+'-x'+value+(disable?'-2d':'-3d')+'.png';await page.screenshot({path:screenshot,fullPage:false});
    report.cases.push({id,kind:'boundary',input:value,noWebGL:disable,readings:await page.locator('[data-readings]').innerText(),screenshot});
   }
   if(['SIM-C1-L004-03','SIM-C1-L004-04'].includes(id)){
    const options=page.locator('.time-options');if(!(await options.evaluate(el=>el.open)))await options.locator('summary').click();
    const times=id.endsWith('03')?[0,1,2]:[0,Math.PI/6,Math.PI/3,2*Math.PI/3];
    const answers=id.endsWith('03')?['0','5','0']:['2','0','-2','2'];
    for(let k=0;k<times.length;k++){
     const time=times[k];await page.locator('[data-instant]').fill(String(time));await page.locator('[data-instant]').dispatchEvent('change');await page.waitForTimeout(120);
     const readings=await page.locator('[data-readings]').innerText();const fourth=await page.locator('[data-readings]>div').nth(3).locator('strong').innerText();
     if(!fourth.startsWith(answers[k]+' '))throw Error('Clock/reading differs '+fourth);
     const screenshot=outdir+'/'+id+'-clock'+k+(disable?'-2d':'-3d')+'.png';await page.screenshot({path:screenshot,fullPage:false});
     report.cases.push({id,kind:'clock',input:6,time,noWebGL:disable,readings,screenshot});
    }
   }
   const plots=page.locator('[data-plots]');if(!(await plots.evaluate(el=>el.open)))await plots.locator('summary').click();
   const graphs=page.locator('[data-graphs]');const graphCount=await graphs.locator('.bench-plot').count();
   if(graphCount!==(['SIM-C1-L004-03','SIM-C1-L004-04'].includes(id)?2:1))throw Error('Missing expected graph '+id);
   const graphshot=outdir+'/'+id+'-graphs'+(disable?'-2d':'-3d')+'.png';await graphs.screenshot({path:graphshot});
   report.cases.push({id,kind:'graphs',noWebGL:disable,graphCount,text:await graphs.innerText(),screenshot:graphshot});

  }
  await context.close();
 }
 const after=await hashes();if(profile()!==reviewedProfile)throw Error('Bundled runtime profile changed during review');if(JSON.stringify(after)!==JSON.stringify(reviewedRuntime))throw Error('Runtime changed during consumer review');
 report.terminalStatus=report.errors.length?'FAIL':'PASS';report.browserVersion=browser.version();
 await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({outdir,cases:report.cases.length,errors:report.errors}));
 if(report.errors.length)throw Error(report.errors.join('\n'));
} catch(error){report.terminalStatus='FAIL';report.failure=String(error);await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');throw error;} finally {await browser?.close();server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>{const timer=setTimeout(()=>{server.off('exit',done);resolve();},2000);const done=()=>{clearTimeout(timer);resolve();};server.once('exit',done);});server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(db,{recursive:true,force:true});}
