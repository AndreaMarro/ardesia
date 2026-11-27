import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs/promises';
const root='/private/tmp/cric-method-css-748-independent-app';
const reviewedProfile='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49';
const profile=()=>JSON.parse(execFileSync(process.env.PYTHON||'python3',['-c',"from pathlib import Path; from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint; import json; print(json.dumps(runtime_fingerprint(Path.cwd())))"],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8'})).sha256;
const reviewedRuntime={"static/js/banchi/modelli/calore.js":"83c89a3140ba5a3386eff0cff54a1aa2575c26ea1e973779b19303026c13bc23","static/js/banchi/modelli/campo.js":"3750efefa281d28712a973bea921544fb83dc5ad9eb2da7e0c09fe6fac6d50c3","static/js/banchi/modelli/circuito.js":"107b9e8defed3aaa6d04883442951ed20b7b2cdfdefb658f3ef746c24185a757","static/js/banchi/modelli/lente.js":"5488291f98987538c4fc8483a61e2c058e45605c66391a7ccbdd2b9fb8787566","static/js/banchi/modelli/onde.js":"3fb789376d62279c115c5facf666c10c39160068210585a5755ee86daa2dbb7c","static/js/banchi/scene/calore.js":"80272a42fbf7edd5a130df801c3819482aaca55471ed992e5fb411085f897f4e","static/js/banchi/scene/campo.js":"cd1728f04b9bb954c15bd555eec5c0958d96bf166f498d68d2fcb1ee051f18c4","static/js/banchi/scene/circuito.js":"049ed16c1cc2bd6d2c2662c4de38399d3b1bb00a5adabeb17bed06780df49701","static/js/banchi/scene/lente.js":"8a238ff78b82cdd796b796691e147128c00a5a0f9d089d2398896c92a4c104b5","static/js/banchi/scene/onde.js":"082076476beef18b03506417958bbec7f5d1e75c9278f8824cfde68cdf0ed139","static/js/banchi/misure.js":"46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d","static/js/banchi/banco.js":"756f4026f1e6aea49ba7635678f1f2406743c3b5b39685b18d60dfbb417074db","static/js/banchi/quaderno.js":"ecc32226e0fa1781b36cac952fa926a2ac17be6b4eae491ef6ef5744fcd8885a","static/js/banchi/tavola.js":"9082781b0fbf88f421742cf8f10f3f098f51e9aac131118a5691e1b6e11cc4a8","static/js/banchi/grafici.js":"e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd","static/js/banchi/scena.js":"4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095","static/js/banchi/etichette.js":"455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3","static/js/banchi/aula.js":"44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967","static/js/models.js":"525733758bad90ae00913d497d0916ff683168370fc9a1e320dd16e0c7a9faa6","static/lab-models.json":"2e4397ef2dc7e63ad2a75eae804228221ca74506d43f1cc73ef2de78ed1b6b27","content/banchi.json":"c0494a9091cca33b7631b68df1cb7b472c63d0e5481e7dbd391ae1b46e326bdf"};
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
 const profiles=[320,1280].flatMap(width=>[{width,disable:false,view:'orbit'},{width,disable:false,view:'side'},{width,disable:false,view:'top'},{width,disable:true,view:'diagram'}]);
 for(const prof of profiles){const{width,disable,view}=prof;
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',bypassCSP:true});
  await context.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
  if(disable)await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.includes('webgl')?null:get.call(this,kind,...args);};});
  await context.request.post(url+'api/demo',{headers:{'X-Astra-Request':'1'},data:{}});
  const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(String(e)));
  for(const [id,index,answers] of [['LAB3D-06',1,[40,.5]],['LAB3D-07',1,[9,18]],['LAB3D-08',2,[2,3]],['LAB3D-09',1,[15,-10]],['LAB3D-10',2,[4,0,1,0]]]){
   if(!disable)await page.goto('about:blank');
   await page.goto(url+'#banco/'+id);await page.locator('[data-predict]').waitFor({state:'visible'});
   await page.locator('[name=prediction]').nth(index).check();await page.locator('[data-predict] button').click();
   await page.locator('[data-guide]').waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('[data-display]')?.textContent.includes('3D interattivo')||document.querySelector('[data-display]')?.textContent.includes('Tavola di misura'));
   const observedMode=await page.locator('[data-display]').innerText();if(!(disable?observedMode.includes('Tavola di misura'):observedMode.includes('3D interattivo')))throw Error('Requested rendering mode not actually observed '+observedMode);
   if(!disable)await page.locator('[data-view="'+view+'"]').click();
   await page.waitForFunction(view=>document.querySelector('[data-view="'+view+'"]')?.getAttribute('aria-pressed')==='true',view);
   const modes=[];
   for(let phase=1;phase<=4;phase++){
    await page.locator('[data-phase="'+phase+'"]').click();
    const state=await page.locator('[data-guide]').innerText();const phaseLayout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));if(phaseLayout.scroll>phaseLayout.width+1)throw Error(id+' actual phase'+phase+' overflow '+JSON.stringify(phaseLayout));modes.push({phase,text:state,readings:await page.locator('[data-readings]').innerText(),phaseLayout});
    if(phase===3&&id==='LAB3D-10'){
      for(let i=0;i<3;i++){await page.locator('[data-math-next]').click();modes.push({phase:'math'+i,text:await page.locator('[data-guide]').innerText()});}
    }
   }
   const responses=[];for(let i=0;i<answers.length;i++){
    const form=page.locator('[data-check="'+i+'"]');
    await form.locator('input').fill(String(answers[i]+9999));await form.locator('button').click();
    const rejected=await form.locator('[role=status]').innerText();if(rejected.startsWith('Corretto'))throw Error(id+' wrongly accepted');
    await form.locator('input').fill(String(answers[i]).replace('.',','));await form.locator('button').click();
    const accepted=await form.locator('[role=status]').innerText();if(!accepted.startsWith('Corretto'))throw Error(id+' rejected independently solved answer '+i);responses.push({index:i,input:String(answers[i]).replace('.',','),independentlyDerived:Number(answers[i]),rejected,accepted});
   }
   await page.locator('[data-phase="2"]').click();
   await page.evaluate(()=>document.fonts.ready);const dir=outdir+'/'+id+'-'+width+'-'+view+'.png';await page.screenshot({path:dir,fullPage:false});
   await page.addScriptTag({path:root+'/node_modules/axe-core/axe.min.js'});const layout=await page.locator('.bench-room').evaluate(async el=>({axe:(await axe.run(el,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}));if(layout.axe.length||layout.documentWidth>layout.viewport+1)throw Error('Actual bench layout/axe failed '+JSON.stringify(layout));
   report.cases.push({id,width,view,noWebGL:disable,layout,display:await page.locator('[data-display]').innerText(),modes,responses,answerCount:answers.length,screenshot:dir});
   await boundaries(page,id,outdir,report,view);
   if(id==='LAB3D-10'&&!disable){await page.locator('[data-view=section]').click();await page.waitForFunction(()=>document.querySelector('[data-view=section]')?.getAttribute('aria-pressed')==='true');await boundaries(page,id,outdir,report,view);}
  }
  await context.close();
 }
 const after=await hashes();if(profile()!==reviewedProfile)throw Error('Bundled runtime profile changed during review');if(JSON.stringify(after)!==JSON.stringify(reviewedRuntime))throw Error('Runtime changed during consumer review');
 const expectedBase=profiles.length*5,expectedBoundaries=profiles.length*12+profiles.filter(p=>!p.disable).length*2;
 if(report.cases.filter(r=>!Object.hasOwn(r,'boundary')).length!==expectedBase||report.cases.filter(r=>Object.hasOwn(r,'boundary')).length!==expectedBoundaries)throw Error('Exact40base+108boundary coverage required');
 if(report.cases.length!==148)throw Error('Expected148 actual base/boundary cases, got'+report.cases.length);if(report.clockObservations?.reduce((n,x)=>n+x.observations.length,0)!==56)throw Error('Expected56 actual clock observations');
 report.terminalStatus=report.errors.length?'FAIL':'PASS';report.browserVersion=browser.version();
 await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({outdir,cases:report.cases.length,errors:report.errors}));
 if(report.errors.length)throw Error(report.errors.join('\n'));
} catch(error){report.terminalStatus='FAIL';report.failure=String(error);await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');throw error;} finally {await browser?.close();server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>{const timer=setTimeout(()=>{server.off('exit',done);resolve();},2000);const done=()=>{clearTimeout(timer);resolve();};server.once('exit',done);});server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(db,{recursive:true,force:true});}

async function boundaries(page,id,outdir,report,entryView){
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
      if(want==='AMPLITUDE0'&&!await page.locator('.time-options').evaluate(e=>e.open))await page.locator('.time-options summary').click();
      if(want==='AMPLITUDE0')for(const value of ['0','0.125','0.5','1']){
        await page.locator('[data-instant]').fill(value);await page.locator('[data-instant]').dispatchEvent('change');
        const y=await page.locator('[data-readings]>div').filter({hasText:'Spostamento istantaneo'}).locator('strong').innerText();
        if(!y.startsWith('0 '))throw Error('node moved '+y);
      }
    }else if(!readings.includes(want))throw Error(id+' missing '+want+' from '+readings);
    const inputs=await page.locator('.bench-params input,.bench-params select').evaluateAll(elements=>Object.fromEntries(elements.map(el=>[el.name,el.value])));
    const current=await page.locator('[data-view][aria-pressed=true]').getAttribute('data-view');const image=outdir+'/'+id+'-'+page.viewportSize().width+'-'+entryView+'-'+current+'-boundary'+i+'.png';await page.screenshot({path:image,fullPage:false});
    report.cases.push({id,width:page.viewportSize().width,view:current,entryView,boundary:i,changes,want,inputs,readings,warning,screenshot:image});
    if(id==='LAB3D-10'&&want==='AMPLITUDE4'){
      // d1.2m, x=z=0 and f1Hz give r1=r2=lambda0.6m;
      // y=4cos(2pi*t)mm. Three exact extrema plus the quarter-period root.
      for(const[name,value]of Object.entries({f:1,d:1.2,x:0,z:0,phase:0}))await page.locator('[name="'+name+'"]').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
      const details=page.locator('.time-options');if(!await details.evaluate(e=>e.open))await details.locator('summary').click();const observations=[];
      for(const[time,wantY]of[[0,4],[.25,0],[.5,-4],[1,4]]){
        await page.locator('[data-instant]').fill(String(time));await page.locator('[data-instant]').dispatchEvent('change');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const text=await page.locator('[data-readings]>div').filter({hasText:'Spostamento istantaneo'}).locator('strong').innerText();const actual=Number(text.replaceAll('−','-').split(/\s/u)[0].replace(',','.'));
        if(!Number.isFinite(actual)||Math.abs(actual-wantY)>1e-12)throw Error('Independent equal-path clock y differs '+text+' vs '+wantY);
        if(Number(await page.locator('[data-instant]').inputValue())!==time)throw Error('Actual clock input differs');
        const image=outdir+'/'+id+'-'+page.viewportSize().width+'-'+entryView+'-'+current+'-clock'+time+'.png';await page.screenshot({path:image,fullPage:false});observations.push({time,expectedExactMm:wantY,actualDisplayed:text,actualInput:await page.locator('[data-instant]').inputValue(),scope:'Exact extrema and quarter-period root;1e-12mm accepts only binary64 trig residual at mathematical zero, not a new139 parity tolerance',image});
      }
      report.clockObservations??=[];report.clockObservations.push({id,width:page.viewportSize().width,view:current,entryView,setup:{f:1,d:1.2,x:0,z:0,phase:0},observations});
    }

   }

}
