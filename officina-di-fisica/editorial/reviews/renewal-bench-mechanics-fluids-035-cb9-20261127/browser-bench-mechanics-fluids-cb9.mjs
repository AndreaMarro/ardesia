import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs/promises';
const root='/private/tmp/cric-method-css-748-independent-app';
const reviewedProfile='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49';
const profile=()=>JSON.parse(execFileSync(process.env.PYTHON||'python3',['-c',"from pathlib import Path; from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint; import json; print(json.dumps(runtime_fingerprint(Path.cwd())))"],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8'})).sha256;
const reviewedRuntime={"static/js/banchi/misure.js":"46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d","static/js/banchi/banco.js":"756f4026f1e6aea49ba7635678f1f2406743c3b5b39685b18d60dfbb417074db","static/js/banchi/quaderno.js":"ecc32226e0fa1781b36cac952fa926a2ac17be6b4eae491ef6ef5744fcd8885a","static/js/banchi/tavola.js":"9082781b0fbf88f421742cf8f10f3f098f51e9aac131118a5691e1b6e11cc4a8","static/js/banchi/scena.js":"4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095","static/js/banchi/grafici.js":"e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd","static/js/banchi/etichette.js":"455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3","static/js/banchi/aula.js":"44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967","content/banchi.json":"c0494a9091cca33b7631b68df1cb7b472c63d0e5481e7dbd391ae1b46e326bdf","static/js/banchi/modelli/piano.js":"0575020da70a7759527f307b6ba291777f79ff0a710e313b1a4cb7ee012de6e2","static/js/banchi/modelli/volo.js":"bb6280ec67bca5f07e80aa382b6a45c72717189887561090f9807493e1912713","static/js/banchi/modelli/stevino.js":"620d9363d38867ce854c0f9c567bc8c63d5519a44f1ce1dfd0dddf1f315da0af","static/js/banchi/modelli/tubo.js":"ebe96bda5301f124182d7bd6ee3042b9ecad61b46689ea26a093deac784c3cd6","static/js/banchi/modelli/gas.js":"7981d292be241bb3c7921f755072bda44ab52e5be92f9ae203958a19b7ec1a6d","static/js/banchi/scene/piano.js":"a0a2eb65280c953bd0084e6daafcfaf20e369832f59cf0df68350af7cbd8eab2","static/js/banchi/scene/volo.js":"11f7d3a7935596f7064fa91067ff837e3ca2469d178040c22e6531e86d28cc37","static/js/banchi/scene/stevino.js":"75836bd9014a1b8b23278efd3be3482dcecea533abf9c9a9d6ff3c71b9581c0c","static/js/banchi/scene/tubo.js":"a401bc41dbd89e106e01adefcec9298dabae15ad552992eef8f55e8364225667","static/js/banchi/scene/gas.js":"c39a13bb813bd6f2602a767cbf6e1e42f954092291ca320d3a61352491953223"};
const hashes=async()=>Object.fromEntries(await Promise.all(Object.keys(reviewedRuntime).map(async name=>[name,createHash('sha256').update(await fs.readFile(root+'/'+name)).digest('hex')])));

const db=await fs.mkdtemp('/private/tmp/cric-review-bench035-db-');
const outdir=process.env.ASTRA_SHOTS||await fs.mkdtemp('/tmp/cric-review-bench035-proof-');await fs.mkdir(outdir,{recursive:true});
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
  for(const [id,index,answers] of [['LAB3D-01',0,[8,3]],['LAB3D-02',1,[1,3.6,1,4]],['LAB3D-03',2,[5,2]],['LAB3D-04',2,[2,10,12,6]],['LAB3D-05',0,[180,150,80,45]]]){
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
    if(phase===3&&['LAB3D-02','LAB3D-04','LAB3D-05'].includes(id)){
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
   await page.addScriptTag({path:root+'/node_modules/axe-core/axe.min.js'});const layout=await page.locator('.bench-room').evaluate(async el=>({axe:(await axe.run(el,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary}))})),documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}));if(layout.axe.length||layout.documentWidth>layout.viewport+1){report.consumerUiFailures??=[];report.consumerUiFailures.push({id,width,view,layout});}
   report.cases.push({id,width,view,noWebGL:disable,technicalOk:!layout.axe.length&&layout.documentWidth<=layout.viewport+1,layout,display:await page.locator('[data-display]').innerText(),modes,responses,answerCount:answers.length,screenshot:dir});
   await boundaries(page,id,outdir,report,view);await clockChecks(page,id,outdir,report,view);

  }
  await context.close();
 }
 const after=await hashes();if(profile()!==reviewedProfile)throw Error('Bundled runtime profile changed during review');if(JSON.stringify(after)!==JSON.stringify(reviewedRuntime))throw Error('Runtime changed during consumer review');
 if(report.cases.length!==120||report.cases.filter(r=>!Object.hasOwn(r,'boundary')).length!==40)throw Error('Exact40base+80boundary coverage required');if(report.clockObservations?.reduce((n,r)=>n+r.observations.length,0)!==64)throw Error('Exact64 actual clock observations required');
 report.matrixComplete=true;report.terminalStatus=report.errors.length||report.consumerUiFailures?.length?'FAIL':'PASS';report.browserVersion=browser.version();
 await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({outdir,cases:report.cases.length,errors:report.errors}));
 if(report.errors.length)throw Error(report.errors.join('\n'));if(report.consumerUiFailures?.length)throw Error('Completed diagnostic matrix preserves'+report.consumerUiFailures.length+' actual consumerUI failures');
} catch(error){report.terminalStatus='FAIL';report.failure=String(error);await fs.writeFile(outdir+'/consumer.json',JSON.stringify(report,null,2)+'\n');throw error;} finally {await browser?.close();server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>{const timer=setTimeout(()=>{server.off('exit',done);resolve();},2000);const done=()=>{clearTimeout(timer);resolve();};server.once('exit',done);});server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(db,{recursive:true,force:true});}

async function boundaries(page,id,outdir,report,entryView){
 await page.locator('[data-phase="3"]').click();
 const choices={
 'LAB3D-01':[{m:2,angle:0,F:1,ms:0,mk:1},{mk:1,ms:0}],
 'LAB3D-02':[{speed:5,elevation:0,azimuth:0},{elevation:90}],
 'LAB3D-03':[{rho:1000,p0:100,h:0},{h:2}],
 'LAB3D-04':[{mode:'pressure',r:4,mu:1,length:5,dp:500},{mode:'flow',flow:.1,r:.5,mu:12,length:50,probe:1}],
 'LAB3D-05':[{mol:.1,T:300,V:3,end:6},{V:3,end:3}],
 }[id];
 for(const[index,changes]of choices.entries()){
  for(const[name,value]of Object.entries(changes))await page.locator('[name="'+name+'"]').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  const inputs=await page.locator('.bench-params input,.bench-params select').evaluateAll(a=>Object.fromEntries(a.map(el=>[el.name,el.value])));
  const readings=await page.locator('[data-readings]').innerText(),warning=await page.locator('.bench-warning').innerText();
  if(id==='LAB3D-01'&&(Number(inputs.ms)<Number(inputs.mk)||inputs.ms!==String(index===0?1:0)||inputs.mk!==String(index===0?1:0)))throw Error('Actual Coulomb UI guard differs');
  if(id==='LAB3D-03'&&!readings.includes(index===0?'100 kPa':'119,6 kPa'))throw Error('Exact hydrostatic endpoint display differs');
  if(id==='LAB3D-04'&&(index===0?!warning:!readings.includes('0 m/s')))throw Error('Flow domain warning/no-slip boundary differs');
  const image=outdir+'/'+id+'-'+page.viewportSize().width+'-'+entryView+'-boundary'+index+'.png';await page.screenshot({path:image,fullPage:false});report.cases.push({id,width:page.viewportSize().width,view:entryView,boundary:index,changes,inputs,readings,warning,screenshot:image});
 }
}

async function clockChecks(page,id,outdir,report,view){
 if(!['LAB3D-02','LAB3D-04','LAB3D-05'].includes(id))return;
 if(id==='LAB3D-05')await page.locator('[name=end]').evaluate(el=>{el.value='6';el.dispatchEvent(new Event('input',{bubbles:true}));});
 const details=page.locator('.time-options');if(!await details.evaluate(el=>el.open))await details.locator('summary').click();
 const observations=[];const times=id==='LAB3D-02'?[0,.5,1]:id==='LAB3D-04'?[0,1]:[0,3,6];
 for(const time of times){
  await page.locator('[data-instant]').fill(String(time));await page.locator('[data-instant]').dispatchEvent('change');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  if(Number(await page.locator('[data-instant]').inputValue())!==time)throw Error('Actual requested bench time differs');
  const raw=await page.locator('[data-readings]>div').evaluateAll(a=>a.map(el=>({label:el.querySelector('span')?.textContent||el.childNodes[0]?.textContent||el.textContent,display:el.querySelector('strong')?.textContent})));
  const desired=id==='LAB3D-02'?{'Quota y':[0,1.27375,.095][times.indexOf(time)],'Velocità verticale':[5,.095,-4.81][times.indexOf(time)]}:id==='LAB3D-04'?{'Velocità locale':0}:{'Volume':3+time/2,'Pressione assoluta':(.1*8.314462618*300)/(3+time/2),'Lavoro del gas':(.1*8.314462618*300)*Math.log((3+time/2)/3)};
  const units={'Quota y':'m','Velocità verticale':'m/s','Velocità locale':'m/s','Volume':'L','Pressione assoluta':'kPa','Lavoro del gas':'J'};
  const comparisons=[];for(const[label,value]of Object.entries(desired)){
   const display=await page.locator('[data-readings]>div').filter({hasText:label}).locator('strong').innerText();const expected=await page.evaluate(({value,unit})=>new Intl.NumberFormat('it-IT',{maximumSignificantDigits:4,useGrouping:false}).format(value)+' '+unit,{value,unit:units[label]});if(display!==expected)throw Error(id+' exact analytic clock + installed4sigdisplay differs '+label+':'+display+' expected:'+expected);comparisons.push({label,independentExpected:value,unit:units[label],expectedDisplay:expected,actualDisplay:display});
  }
  const image=outdir+'/'+id+'-'+page.viewportSize().width+'-'+view+'-clock'+time+'.png';await page.screenshot({path:image,fullPage:false});observations.push({time,actualInput:await page.locator('[data-instant]').inputValue(),raw,comparisons,image});
 }
 report.clockObservations??=[];report.clockObservations.push({id,width:page.viewportSize().width,view,observations,scope:'Independent analytic values plus actual installed4significant-digit display convention. Gaslog is reviewercheck of illustrative readout, not a claim student must manually evaluate every slider log. Tube wallprobe stayszero while tracersmove; noGPUintrospection claimed.'});
}
