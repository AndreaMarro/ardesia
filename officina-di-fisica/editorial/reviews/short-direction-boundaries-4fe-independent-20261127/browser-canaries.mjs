// Bounded canonical bench consumer: same owner bootstrap and canonical observer.
// This is a technical canary, never a full-course or editorial approval.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {readFile,mkdir,mkdtemp,writeFile,rm,statfs} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
import {observe} from './canonical-observer.mjs';
import {assertObservedControls} from './canonical-visibility-protocol.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url)),APP='/private/tmp/cric-c1-work-axis-20261127/officina-di-fisica';
const OUT=path.resolve(process.argv[2]),sha=b=>createHash('sha256').update(b).digest('hex');
const planBytes=await readFile(path.join(HERE,'bounded-plan.json')),plan=JSON.parse(planBytes);
assert.equal(plan.cases.length,98);assert.equal(new Set(plan.cases.map(c=>c.id)).size,5);
const fingerprint=()=>JSON.parse(execFileSync('python3',['-B','-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:APP,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8'}));
const before=fingerprint();assert.equal(before.sha256,plan.runtimeSha256);
await mkdir(OUT,{recursive:false});
const data=await mkdtemp('/private/tmp/cric-electric-wave-peer-db-');
const boot=`import hashlib,json,secrets,time
from server import store
from server.web import Handler,ThreadingHTTPServer
store.initialize()
ticket=secrets.token_urlsafe(32)
with store.connect() as db:
 db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+600))
s=ThreadingHTTPServer(('127.0.0.1',0),Handler)
print(json.dumps({'port':s.server_port,'ticket':ticket}),flush=True)
s.serve_forever()`;
const server=spawn('python3',['-B','-uc',boot],{cwd:APP,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',ASTRA_DATA:data,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',ASTRA_EXTENSIONS:path.join(APP,'extensions')},stdio:['ignore','pipe','pipe']});
let stderr='',browser,exit=0;server.stderr.on('data',b=>stderr+=b);
const report={schemaVersion:'1.0.0',candidateRef:plan.candidateRef,runtimeFingerprint:before,planSha256:sha(planBytes),protocolSha256:sha(await readFile(fileURLToPath(import.meta.url))),canonicalProtocolSha256:sha(await readFile(path.join(HERE,'canonical-visibility-protocol.mjs'))),observerModuleSha256:sha(await readFile(path.join(HERE,'canonical-observer.mjs'))),scope:plan.plannedScope,expected:plan.cases.map(c=>c.key),cases:[],errors:[],technicalStatus:'INCOMPLETE',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
const sourceCompare=JSON.parse(await readFile(path.join(HERE,'actual-independent-comparison.json')));
try{
 const [line]=await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Bootstrap exited '+stderr);})]);
 const {port,ticket}=JSON.parse(line),base='http://127.0.0.1:'+port;
 browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});report.browserVersion=browser.version();
 const auth=await browser.newContext();assert.ok((await auth.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket}})).ok());
 const storageState=await auth.storageState();await auth.close();
 for(const width of [320,1280])for(const view of ['orbit','side','top','fixed_projection']){
  const selected=plan.cases.filter(c=>c.width===width&&c.view===view);if(!selected.length)continue;
  const fallback=view==='fixed_projection',profile={width,view,fallback};
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',bypassCSP:true,storageState});
  await context.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  if(fallback)await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){return k.includes('webgl')?null:get.call(this,k,...a);};});
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>report.errors.push(String(e)));
  for(const c of selected){
   const disk=await statfs(OUT);assert.ok(disk.bavail*disk.bsize>=2*1024**3,'Disk reserve below2GiB');
   let result={key:c.key,id:c.id,width,view,input:c.x,instant:c.time??null,originalNegativeCaseKeys:c.originalNegativeCaseKeys,technicalOk:false};
   try{
    const response=await context.request.get(base+'/api/item/'+c.id);assert.ok(response.ok());const published=await response.json();
    for(const field of ['control','measure','references','apparatus','course','kind'])assert.deepEqual(published[field],c.source[field]);
    await page.goto('about:blank');await page.goto(base+'/#banco/'+c.id);
    await page.locator('[data-predict]').waitFor();await page.locator('[name=prediction]').first().check();await page.locator('[data-predict] button').click();
    await page.waitForFunction(expected=>document.querySelector('[data-display]')?.textContent===expected,fallback?'Tavola di misura':'3D interattivo');
    await page.locator('[data-phase="3"]').click();if(!fallback)await page.locator('[data-view="'+view+'"]').click();
    const legend=page.locator('.scene-key');if(!await legend.evaluate(e=>e.open))await legend.locator('summary').press('Enter');
    await page.locator('[name=x]').evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},c.x);
    if(c.time!==undefined)await page.locator('[data-instant]').evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('change',{bubbles:true}));},c.time);
    const stage=page.locator('.bench-stage');await stage.scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const observed=await page.evaluate(observe,{row:c.source,profile,requestedX:c.x,requestedTime:c.time});
    assertObservedControls(observed,{kind:c.kind,index:c.index,x:c.x,time:c.time},{record:c.source,hasClock:c.hasClock,clockInput:c.clockInput});
    assert.equal(observed.actualRenderer,fallback?'Tavola di misura':'3D interattivo');assert.ok(observed.legendLayout.visible&&observed.legendLayout.scrollWidth<=observed.legendLayout.width+1);
    const removed=sourceCompare.records.find(r=>r.id===c.id).removedNames;
    assert.ok(!observed.elements.some(e=>e.kind==='label'&&removed.includes(e.text)));
    const dom=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,visibleCanvases:[...document.querySelectorAll('.bench-stage canvas')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility==='visible').length,svgTexts:[...document.querySelectorAll('.bench-stage svg text')].map(e=>e.textContent)}));
    assert.ok(dom.overflow<=1);assert.equal(dom.visibleCanvases,fallback?0:1);
    if(fallback)assert.ok(!dom.svgTexts.some(text=>removed.includes(text)));
    const image=await stage.screenshot(),imageSha256=sha(image);await writeFile(path.join(OUT,imageSha256+'.png'),image);
    result={...result,technicalOk:true,profile,observed,dom,legendText:await legend.innerText(),imageSha256,fullGlyphAcceptance:'NOT_GRANTED_FROM_SOURCE_GEOMETRY; independent raster reading follows'};
   }catch(error){result.error=String(error);try{const image=await page.locator('.bench-stage').screenshot();result.imageSha256=sha(image);await writeFile(path.join(OUT,result.imageSha256+'.png'),image);}catch{}}
   const raw=Buffer.from(JSON.stringify(result)+'\n'),file='case-'+sha(Buffer.from(c.key))+'.json';await writeFile(path.join(OUT,file),raw);report.cases.push({key:c.key,file,sha256:sha(raw),technicalOk:result.technicalOk});
   if(report.cases.length%10===0)console.log(JSON.stringify({observed:report.cases.length,planned:98}));
  }
  await context.close();
 }
 assert.equal(report.cases.length,98);assert.equal(new Set(report.cases.map(c=>c.key)).size,98);assert.ok(report.cases.every(c=>c.technicalOk));assert.deepEqual(report.errors,[]);assert.deepEqual(fingerprint(),before);
 report.technicalStatus='BOUNDED_ACTUAL_CANARY_COMPLETE_NO_APPROVAL';
}catch(error){exit=1;report.failure=String(error);report.technicalStatus='FAIL';}
finally{
 await writeFile(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();
 if(server.exitCode===null){server.kill('SIGTERM');await once(server,'exit');}
 server.stdout.destroy();server.stderr.destroy();await rm(data,{recursive:true,force:true});
}
process.exitCode=exit;
