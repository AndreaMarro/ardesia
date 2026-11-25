import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs/promises';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const reviewedProfile='54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d';
const profile=()=>JSON.parse(execFileSync(process.env.PYTHON||'python3',['-c',"from pathlib import Path; from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint; import json; print(json.dumps(runtime_fingerprint(Path.cwd())))"],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8'})).sha256;
const reviewedRuntime={"static/js/banchi/modelli/calore.js":"83c89a3140ba5a3386eff0cff54a1aa2575c26ea1e973779b19303026c13bc23","static/js/banchi/modelli/campo.js":"3750efefa281d28712a973bea921544fb83dc5ad9eb2da7e0c09fe6fac6d50c3","static/js/banchi/modelli/circuito.js":"107b9e8defed3aaa6d04883442951ed20b7b2cdfdefb658f3ef746c24185a757","static/js/banchi/modelli/lente.js":"5488291f98987538c4fc8483a61e2c058e45605c66391a7ccbdd2b9fb8787566","static/js/banchi/modelli/onde.js":"3fb789376d62279c115c5facf666c10c39160068210585a5755ee86daa2dbb7c","static/js/banchi/scene/calore.js":"80272a42fbf7edd5a130df801c3819482aaca55471ed992e5fb411085f897f4e","static/js/banchi/scene/campo.js":"cd1728f04b9bb954c15bd555eec5c0958d96bf166f498d68d2fcb1ee051f18c4","static/js/banchi/scene/circuito.js":"049ed16c1cc2bd6d2c2662c4de38399d3b1bb00a5adabeb17bed06780df49701","static/js/banchi/scene/lente.js":"8a238ff78b82cdd796b796691e147128c00a5a0f9d089d2398896c92a4c104b5","static/js/banchi/scene/onde.js":"082076476beef18b03506417958bbec7f5d1e75c9278f8824cfde68cdf0ed139","static/js/banchi/misure.js":"46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d","static/js/banchi/banco.js":"8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9","static/js/banchi/quaderno.js":"ecc32226e0fa1781b36cac952fa926a2ac17be6b4eae491ef6ef5744fcd8885a","static/js/banchi/tavola.js":"9082781b0fbf88f421742cf8f10f3f098f51e9aac131118a5691e1b6e11cc4a8","static/js/banchi/grafici.js":"e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd","static/js/banchi/scena.js":"4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095","static/js/banchi/etichette.js":"455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3","static/js/banchi/aula.js":"44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967","static/js/models.js":"525733758bad90ae00913d497d0916ff683168370fc9a1e320dd16e0c7a9faa6","static/lab-models.json":"2e4397ef2dc7e63ad2a75eae804228221ca74506d43f1cc73ef2de78ed1b6b27","content/banchi.json":"c0494a9091cca33b7631b68df1cb7b472c63d0e5481e7dbd391ae1b46e326bdf"};
const hashes=async()=>Object.fromEntries(await Promise.all(Object.keys(reviewedRuntime).map(async name=>[name,createHash('sha256').update(await fs.readFile(root+'/'+name)).digest('hex')])));

const db=await fs.mkdtemp('/private/tmp/cric-review-bench036-db-');
const outdir=process.env.ASTRA_SHOTS||await fs.mkdtemp('/tmp/cric-review-bench036-proof-');await fs.mkdir(outdir,{recursive:true});
const server=spawn(process.env.PYTHON||'python3',['-c',"from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()"],{cwd:root,env:{...process.env,ASTRA_DATA:db,ASTRA_EXTENSIONS:root+'/extensions',PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','pipe']});
let errors='',browser;server.stderr.on('data',x=>errors+=x.toString());
let url;
const report={appRoot:root,sourceRef:'5d1dc8dc7b601aef959d10d564c75462be74708d',cases:[],errors:[],publicationAction:'NONE',humanApproval:'NOT_RUN'};
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
  for(const [id,index,answers] of [['LAB3D-06',1,[40,.5]],['LAB3D-07',1,[9,18]],['LAB3D-08',2,[2,3]],['LAB3D-09',1,[15,-10]],['LAB3D-10',2,[4,0,1,0]]]){
   await page.goto(url+'#banco/'+id);await page.locator('[data-predict]').waitFor({state:'visible'});
   await page.locator('[name=prediction]').nth(index).check();await page.locator('[data-predict] button').click();
   await page.locator('[data-guide]').waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('[data-display]')?.textContent.includes('3D interattivo')||document.querySelector('[data-display]')?.textContent.includes('Tavola di misura'));
   const observedMode=await page.locator('[data-display]').innerText();if(!(disable?observedMode.includes('Tavola di misura'):observedMode.includes('3D interattivo')))throw Error('Requested rendering mode not actually observed '+observedMode);
   const modes=[];
   for(let phase=1;phase<=4;phase++){
    await page.locator('[data-phase="'+phase+'"]').click();
    const state=await page.locator('[data-guide]').innerText();modes.push({phase,text:state,readings:await page.locator('[data-readings]').innerText()});
    if(phase===3&&id==='LAB3D-10'){
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
   const dir=outdir+'/'+id+(disable?'-2d':'-3d')+'.png';await page.screenshot({path:dir,fullPage:false});
   report.cases.push({id,noWebGL:disable,display:await page.locator('[data-display]').innerText(),modes,answerCount:answers.length,screenshot:dir});
   if(!disable)await boundaries(page,id,outdir,report);
  }
  await context.close();
 }
 const after=await hashes();if(profile()!==reviewedProfile)throw Error('Bundled runtime profile changed during review');if(JSON.stringify(after)!==JSON.stringify(reviewedRuntime))throw Error('Runtime changed during consumer review');
 report.terminalStatus=report.errors.length?'FAIL':'PASS';report.browserVersion=browser.version();
 await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({outdir,cases:report.cases.length,errors:report.errors}));
 if(report.errors.length)throw Error(report.errors.join('\n'));
} catch(error){report.terminalStatus='FAIL';report.failure=String(error);await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');throw error;} finally {await browser?.close();server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>{const timer=setTimeout(()=>{server.off('exit',done);resolve();},2000);const done=()=>{clearTimeout(timer);resolve();};server.once('exit',done);});server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(db,{recursive:true,force:true});}

async function boundaries(page,id,outdir,report){
   await page.locator('[data-phase="3"]').click();
   const cases={
    'LAB3D-06':[[{left:20,right:80},'-1,92'],[{left:20,right:20},'0 W']],
    'LAB3D-07':[[{q1:1,q2:-1},'18 N/C'],[{sx:-1},'SINGULAR'],[{q1:0,q2:0},'0 N/C']],
    'LAB3D-08':[[{U:0},'0 A'],[{mode:'Serie',R1:2,R2:4,U:12},'2 A']],
    'LAB3D-09':[[{p:10,f:10},'∞'],[{p:5,f:10,screen:10},'-10 cm'],[{p:30,f:10,screen:15},'a fuoco']],
    'LAB3D-10':[[{x:0,phase:0},'AMPLITUDE4'],[{phase:180},'AMPLITUDE0']]
   }[id];
   for(let i=0;i<cases.length;i++){
    const [changes,want]=cases[i];
    for(const [name,value]of Object.entries(changes))await page.locator('[name="'+name+'"]').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
    const readings=(await page.locator('[data-readings]').innerText()).replaceAll('−','-');
    const warning=await page.locator('.bench-warning').innerText();
    if(want==='SINGULAR'){if(!warning.includes('coincide'))throw Error(id+' missing singularitywarning');}
    else if(want.startsWith('AMPLITUDE')){
      const amp=await page.locator('[data-readings]>div').filter({hasText:'Ampiezza alla sonda'}).locator('strong').innerText();
      if(!amp.startsWith(want==='AMPLITUDE4'?'4 ':'0 '))throw Error('amplitude differs '+amp);
      if(want==='AMPLITUDE0')await page.locator('.time-options summary').click();
      if(want==='AMPLITUDE0')for(const value of ['0','0.125','0.5','1']){
        await page.locator('[data-instant]').fill(value);await page.locator('[data-instant]').dispatchEvent('change');
        const y=await page.locator('[data-readings]>div').filter({hasText:'Spostamento istantaneo'}).locator('strong').innerText();
        if(!y.startsWith('0 '))throw Error('node moved '+y);
      }
    }else if(!readings.includes(want))throw Error(id+' missing '+want+' from '+readings);
    const inputs=await page.locator('.bench-params input,.bench-params select').evaluateAll(elements=>Object.fromEntries(elements.map(el=>[el.name,el.value])));
    const image=outdir+'/'+id+'-boundary'+i+'.png';await page.screenshot({path:image,fullPage:false});
    report.cases.push({id,boundary:i,changes,want,inputs,readings,warning,screenshot:image});
   }

}
