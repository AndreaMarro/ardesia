import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs/promises';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const reviewedProfile='b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f';
const profile=()=>JSON.parse(execFileSync(process.env.PYTHON||'python3',['-c',"from pathlib import Path; from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint; import json; print(json.dumps(runtime_fingerprint(Path.cwd())))"],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8'})).sha256;
const reviewedRuntime={"static/js/banchi/voci/esperimento.js":"cc435e51b62d5b9961b32f5d9b349171f7432e3bf6a6911cd80daaa1f419767b","static/js/banchi/voci/engines.js":"09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab","static/js/banchi/voci/geometria.js":"986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08","static/js/banchi/voci/tavola.js":"cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283","static/js/banchi/voci/confronti.js":"83f1ab0d443dc93eb72c0318e32856179486643257c5bbf136e686464fdc6c39","static/js/banchi/voci/legende.js":"89730336965cc57c02580f7f10b185b35575c3dfc8b9bae37ddca8ec20831a93","static/js/banchi/voci/orologi.js":"30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6","static/js/banchi/voci/modelli/C1.js":"e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34","static/js/banchi/voci/apparati/meccanica.js":"c87e54ddc90b8cf3b75f2db350274b55cc5d9b0c74e44151190fa37d4ece3f70","static/js/banchi/banco.js":"8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9","static/js/banchi/misure.js":"46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d","static/js/banchi/grafici.js":"e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd","static/js/banchi/scena.js":"4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095","static/js/banchi/etichette.js":"455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3","static/js/banchi/aula.js":"44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967","static/js/ui.js":"77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27","static/js/banchi/voci/assessment-selection.js":"2f5435b6c9e8b76667d0a95f35860f835117cf8230a635c4c3a54c479fbc54b3","server/domain/experiment_assessment.py":"c51189c0daed89da19c943900736daa2646bd9862b68edc4c793fc882e4f06f6","server/domain/authoring.py":"bc42796627ca84424576ba189058dd6f37ddbc694d929a6e900fafb0e26dfa94","server/adapters/contracts.py":"53e1ea6c8fc912b749e5074eac7384f66ecbcfe89723e51642d3b26475bc07bc","contracts/experiment-assessment-v1.schema.json":"937df48ca60e874797cf9428a00732eaf6974d1ae7abdc162743f03ceef4ddf5","contracts/engine.d.ts":"de1760b0df0b5902d4b57aa2bb1a347c87a4520f00e4fe2d0d543bf9e972b0e6","content/esperienze-C1.json":"84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3"};
const hashes=async()=>Object.fromEntries(await Promise.all(Object.keys(reviewedRuntime).map(async name=>[name,createHash('sha256').update(await fs.readFile(root+'/'+name)).digest('hex')])));

const db=await fs.mkdtemp('/private/tmp/cric-review-experiments039-db-');
const outdir=process.env.ASTRA_SHOTS||await fs.mkdtemp('/tmp/cric-review-experiments039-proof-');await fs.mkdir(outdir,{recursive:true});
const server=spawn(process.env.PYTHON||'python3',['-c',"from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()"],{cwd:root,env:{...process.env,ASTRA_DATA:db,ASTRA_EXTENSIONS:root+'/extensions',PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','pipe']});
let errors='',browser;server.stderr.on('data',x=>errors+=x.toString());
let url;
const report={appRoot:root,sourceRef:'5d1dc8dc7b601aef959d10d564c75462be74708d',purpose:'DIAGNOSTIC_ORIGINAL_DEFECTS_NOT_SCIENTIFIC_APPROVAL',expectedSourceIssueIds:[],expectedConsumerIssueIds:[],cases:[],errors:[],publicationAction:'NONE',humanApproval:'NOT_RUN',scientificApproval:false};
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
  for(const [id,index,answers] of [['SIM-C1-L003-01',2,[3,0]],['SIM-C1-L003-02',2,[5,4.95]],['SIM-C1-L003-03',2,[4,3.75]],['SIM-C1-L003-04',2,[4,3.75]],['SIM-C1-L003-05',2,[5,4]],['SIM-C1-L003-06',1,[2,4]]]){
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
   const boundaries={'SIM-C1-L003-01':[-2,2,6],'SIM-C1-L003-02':[0,1,2],'SIM-C1-L003-03':[.25,3],'SIM-C1-L003-04':[.25,3],'SIM-C1-L003-05':[0,5],'SIM-C1-L003-06':[0,2,4]}[id];
   for(const value of boundaries){
    const control=page.locator('[name=x]');await control.fill(String(value));await control.dispatchEvent('input');await page.waitForTimeout(120);
    const screenshot=outdir+'/'+id+'-x'+value+(disable?'-2d':'-3d')+'.png';await page.screenshot({path:screenshot,fullPage:false});
    report.cases.push({id,kind:'boundary',input:value,noWebGL:disable,readings:await page.locator('[data-readings]').innerText(),screenshot});
   }
   if(['SIM-C1-L003-03','SIM-C1-L003-04'].includes(id)){
    const options=page.locator('.time-options');if(!(await options.evaluate(el=>el.open)))await options.locator('summary').click();
    for(const time of [0,1.5,3]){
     await page.locator('[data-instant]').fill(String(time));await page.locator('[data-instant]').dispatchEvent('change');await page.waitForTimeout(120);
     const readings=await page.locator('[data-readings]').innerText();const expected=['1','6,25','16'][[0,1.5,3].indexOf(time)];
     const fourth=await page.locator('[data-readings]>div').nth(3).locator('strong').innerText();if(!fourth.startsWith(expected+' '))throw Error('Clock/reading differs '+fourth);
     const screenshot=outdir+'/'+id+'-clock'+time+(disable?'-2d':'-3d')+'.png';await page.screenshot({path:screenshot,fullPage:false});
     report.cases.push({id,kind:'clock',input:3,time,noWebGL:disable,readings,screenshot});
    }
   }

   const plots=page.locator('[data-plots]');if(!(await plots.evaluate(el=>el.open)))await plots.locator('summary').click();
   const graphs=page.locator('[data-graphs]');const graphCount=await graphs.locator('.bench-plot').count();
   if(graphCount!==(['SIM-C1-L003-03','SIM-C1-L003-04'].includes(id)?2:1))throw Error('Missing expected graph '+id);
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
