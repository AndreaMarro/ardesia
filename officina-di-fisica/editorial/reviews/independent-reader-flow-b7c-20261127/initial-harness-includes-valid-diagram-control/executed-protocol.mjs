// Existing reader/course consumers, canonical draft import, private owner transport.
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {fileURLToPath}from'node:url';import {spawn,execFileSync}from'node:child_process';import {once}from'node:events';
import {createHash}from'node:crypto';import assert from'node:assert/strict';import{chromium}from'playwright';
const B=path.dirname(fileURLToPath(import.meta.url)),app='/private/tmp/cric-method-css-748-independent-app',out=path.resolve(process.argv[2]),cohort=process.argv[3];
assert.match(cohort,/^(catalogs|C[1-6])$/);const sha=b=>createHash('sha256').update(b).digest('hex'),bytes=await fs.readFile(path.join(B,'reader-blueprint.json')),blueprint=JSON.parse(bytes);
const selected=blueprint.records.filter(r=>['C1-E021','C5-E011','C3-E019'].includes(r.id));
assert.ok(selected.length);const packageFiles=Object.keys(blueprint.packages).map(n=>path.join(B,'canonical-package-inputs',n+'.json'));
const pins=JSON.parse(await fs.readFile(path.join(B,'canonical-input-file-shas.json')));assert.equal(Object.keys(pins).length,20);const files=Object.fromEntries(Object.entries(pins).map(([name,pin])=>{assert.match(name,/^[a-z0-9-]+\.json$/);return[path.join(B,'canonical-package-inputs',name),pin];}));for(const[name,pin]of Object.entries(files))assert.equal(sha(await fs.readFile(name)),pin);
const env={...process.env,PYTHONDONTWRITEBYTECODE:'1',ASTRA_EXTENSIONS:path.join(app,'extensions')},fp=()=>JSON.parse(execFileSync(process.env.PYTHON||'python3',['-B','-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:app,env,encoding:'utf8'}));
const before=fp();assert.equal(before.sha256,blueprint.runtimeSha256);await fs.mkdir(out,{recursive:false});const data=await fs.mkdtemp(path.join(os.tmpdir(),'cric-reader-renewal-'));
const boot=`import json,secrets,hashlib,time,os
from pathlib import Path
from server import store
from server.web import Handler,ThreadingHTTPServer
from tools.corpus_engineering.draft_import import import_drafts
files=json.loads(os.environ['INPUT_SHAS']);names=json.loads(os.environ['PACKAGES'])
checked={name:Path(name).read_bytes() for name in files}
assert all(not Path(name).is_symlink() and hashlib.sha256(raw).hexdigest()==files[name] for name,raw in checked.items())
store.initialize()
with store.connect() as db:
 published=store.published(db);before=store.encode(published);assert len(published)==991
 exams=[r['id']for r in published if r.get('exam')];assert len(exams)==93
 old={(r['id'],r['v']):r['payload']for r in db.execute('SELECT id,v,payload FROM versions')}
 imports=[]
 for name in names:
  package=json.loads(checked[name]);a=import_drafts(db,{'id':'owner','role':'autore'},package);b=import_drafts(db,{'id':'owner','role':'autore'},package)
  assert a['saved']==len(package['records']) and b['saved']==0;imports.append({'package':Path(name).name,'first':a,'repeat':b})
 assert before==store.encode(store.published(db))
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',key).fetchone()[0]==value for key,value in old.items())
 ticket=secrets.token_urlsafe(32);db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+600))
s=ThreadingHTTPServer(('127.0.0.1',0),Handler)
print(json.dumps({'port':s.server_port,'ticket':ticket,'publishedCount':991,'publishedUnchanged':True,'historyUnchanged':True,'exams':exams,'imports':imports}),flush=True)
s.serve_forever()`;
const server=spawn(process.env.PYTHON||'python3',['-B','-uc',boot],{cwd:app,env:{...env,ASTRA_DATA:data,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',INPUT_SHAS:JSON.stringify(files),PACKAGES:JSON.stringify(packageFiles)},stdio:['ignore','pipe','pipe']});let browser;let stderr='';server.stderr.on('data',b=>stderr+=b);
const report={sourceCommit:blueprint.runtimeSourceCommit,runtimeFingerprint:before,blueprintSha256:sha(bytes),protocolSha256:sha(await fs.readFile(fileURLToPath(import.meta.url))),cohort,expectedIds:selected.map(r=>r.id),records:[],errors:[],activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
try{
 const[raw]=await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Bootstrap failed '+stderr);})]);const{port,ticket,exams,...integration}=JSON.parse(String(raw)),base='http://127.0.0.1:'+port;report.integration=integration;
 browser=await chromium.launch({channel:'chrome'});report.browserVersion=browser.version();const guest=await browser.newContext();
 for(const id of exams)assert.equal((await guest.request.get(base+'/api/item/'+id)).status(),403);report.protectedExamDenials=exams.length;
 const draftRows=blueprint.records.filter(r=>r.variant==='DRAFT');let denied=0;
 for(const file of packageFiles){const pkg=JSON.parse(await fs.readFile(file));for(const a of pkg.assets){assert.equal((await guest.request.get(base+'/asset/'+a.id)).status(),403);denied++;}}
 for(const row of draftRows){const response=await guest.request.get(base+'/api/item/'+row.id);assert.ok([200,403].includes(response.status()));if(response.status()===200)assert.equal((await response.json()).version,1);}
 report.draftAssetDenials=denied;report.guestDraftOriginalOrDenied=draftRows.length;await guest.close();
 const context=await browser.newContext({bypassCSP:true,reducedMotion:'reduce'});assert.ok((await context.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket}})).ok());const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>report.errors.push(String(e)));
 for(const row of selected.filter(r=>r.variant==='DRAFT')){
  const response=await context.request.get(base+'/api/author/item/'+row.id);assert.ok(response.ok());const saved=(await response.json()).record,expected={...row.effectiveRecord,version:2,review:'bozza'};delete expected.baseVersion;assert.deepEqual(saved,expected,'Complete normalized owner candidate differs');
  await page.route('**/api/item/'+row.id,route=>{assert.equal(route.request().method(),'GET');return route.fulfill({json:saved});});
 }
 for(const width of blueprint.plannedWidths){await page.setViewportSize({width,height:900});for(const row of selected){
  const stat=await fs.statfs(out);assert.ok(stat.bavail*stat.bsize>=2*1024**3,'Free disk below2GiB');const item={id:row.id,width,variant:row.variant,sourceSha256:row.source.sourceSha256,effectiveVersion:row.effectiveVersion,activityCredit:0};
  try{
   const record=row.effectiveRecord,catalog=!record.kind;
   if(catalog){const response=await context.request.get(base+'/api/course/'+row.id);assert.ok(response.ok());const course=(await response.json()).course;for(const[key,want]of Object.entries(record))assert.deepEqual(course[key],want,'Catalog metadata differs');}
   else if(row.variant!=='DRAFT'){const response=await context.request.get(base+'/api/item/'+row.id);assert.ok(response.ok());const saved=await response.json();for(const[key,want]of Object.entries(record))assert.deepEqual(saved[key],want,'Original reader field differs: '+key);}
   await page.goto(base+'/#'+(catalog?'corso/'+row.id:'materiale/'+row.id+'/'+record.course));const reader=page.locator(catalog?'main':'article.reader');await reader.getByRole('heading',{name:record.title,exact:true}).waitFor();await page.waitForFunction(()=>!document.querySelector('main [data-tex]'));await page.evaluate(()=>document.fonts.ready);
   const allBlocks=[...(record.promptBlocks||[]),...(record.blocks||[])],figures=allBlocks.filter(b=>b.type==='figure'),formulas=allBlocks.filter(b=>b.type==='formula');item.expectedFigures=figures.length;item.expectedFormulas=formulas.length;
   assert.ok(await reader.locator('img').count()>=figures.length);item.figures=[];
   for(const image of await reader.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(async e=>{await e.decode();assertImage(e);function assertImage(e){if(!e.complete||e.naturalWidth<=0||e.naturalHeight<=0)throw Error('Undecoded figure');}});const src=await image.getAttribute('src');assert.ok(src?.startsWith('/figures/')||src?.startsWith('/asset/'),'Unexpected reader figure URL');const response=await context.request.get(base+src);assert.ok(response.ok());const body=await response.body();
    const expected=src.startsWith('/asset/')?src.slice('/asset/'.length):sha(await fs.readFile(path.join(app,'static',src.slice(1))));assert.equal(sha(body),expected,'Displayed figure bytes differ');
    const png=await image.screenshot({animations:'disabled'}),imageSha=sha(png);await fs.writeFile(path.join(out,imageSha+'.png'),png);item.figures.push({src,bytesSha256:sha(body),pngSha256:imageSha,...await image.evaluate(e=>{const r=e.getBoundingClientRect();return{width:r.width,height:r.height,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,alt:e.alt};})});
   }
   await page.addScriptTag({path:path.join(app,'node_modules/axe-core/axe.min.js')});const measured=await reader.evaluate(async root=>({
    violations:(await axe.run(root,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),
    formulas:[...root.querySelectorAll('.math')].map(e=>({width:e.clientWidth,scroll:e.scrollWidth,typeset:e.querySelector('.katex-html')?.getBoundingClientRect().width??0})),
    documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,titleText:root.querySelector('h1')?.textContent??null}));Object.assign(item,measured);
   assert.ok(item.formulas.length>=formulas.length,'Source formulas omitted');assert.ok(item.formulas.every(f=>f.typeset>0&&f.scroll<=f.width+1&&f.typeset<=f.width+1),'Formula overflow');assert.ok(item.documentWidth<=width+1,'Document overflow');assert.deepEqual(item.violations,[]);
   const normalized=s=>s.replace(/\s+/gu,' ').trim(),content=normalized(await reader.innerText());for(const block of allBlocks.filter(b=>['text','heading'].includes(b.type)))assert.ok(content.includes(normalized(block.text)),'Source text block missing');
   const png=await reader.screenshot({animations:'disabled'});item.pngSha256=sha(png);await fs.writeFile(path.join(out,item.pngSha256+'.png'),png);item.technicalOk=true;item.deliveryScope=row.variant==='DRAFT'?'PRIVATE_OWNER_TRANSPORT_IN_EXISTING_READER_NO_PUBLICATION':'ACTUAL_ORIGINAL_READER_OR_CATALOG';
  }catch(error){item.technicalOk=false;item.error=String(error);item.stack=error.stack;const png=await page.screenshot({fullPage:true,animations:'disabled'});item.failureScreenshotSha256=sha(png);await fs.writeFile(path.join(out,item.failureScreenshotSha256+'.png'),png);}
  report.records.push(item);await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({id:row.id,width,ok:item.technicalOk,error:item.error}));
 }}

 report.legendCases=[];
 const fallback=await browser.newContext({storageState:await context.storageState(),reducedMotion:'reduce'});
 await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){return String(k).includes('webgl')?null:original.call(this,k,...a);};});
 const fallPage=await fallback.newPage();fallPage.setDefaultTimeout(20000);
 for(const width of[320,1280])for(const id of['SIM-C4-L09-02','SIM-C5-L09-02']){
  await fallPage.setViewportSize({width,height:1000});await fallPage.goto(base+'/#banco/'+id);
  await fallPage.locator('[data-predict]').waitFor({state:'visible'});await fallPage.locator('[name=prediction]').first().check();await fallPage.locator('[data-predict] button').click();
  await fallPage.waitForFunction(()=>document.querySelector('[data-display]')?.textContent==='Tavola di misura');await fallPage.locator('[data-phase="2"]').click();
  const key=fallPage.locator('.scene-key');await key.locator('summary').focus();if(!await key.evaluate(e=>e.open))await fallPage.keyboard.press('Enter');await fallPage.evaluate(()=>document.fonts.ready);
  const observed=await fallPage.evaluate(()=>({display:document.querySelector('[data-display]').textContent,legend:document.querySelector('.scene-key').innerText,views:[...document.querySelectorAll('[data-view]')].map(e=>({name:e.textContent,view:e.dataset.view,disabled:e.disabled})),legendVisible:document.querySelector('.scene-key').getBoundingClientRect().height>0}));
  assert.equal(observed.display,'Tavola di misura');assert.ok(observed.legendVisible);assert.ok(observed.views.length>=3);assert.ok(observed.views.every(e=>e.disabled));assert.match(observed.legend,/Obliqua o Laterale/);
  await key.scrollIntoViewIfNeeded();const png=await fallPage.screenshot({fullPage:true,animations:'disabled'}),pin=sha(png);await fs.writeFile(path.join(out,pin+'.png'),png);
  report.legendCases.push({id,width,...observed,pngSha256:pin,instructionUsabilityOk:false,classification:'ACTUAL_FALLBACK_INSTRUCTION_REQUESTS_DISABLED_3D_CONTROLS',activityCredit:0});
 }
 await fallback.close();
 assert.equal(report.records.length,selected.length*2);assert.deepEqual(report.errors,[]);assert.deepEqual(fp(),before);for(const[name,pin]of Object.entries(files))assert.equal(sha(await fs.readFile(name)),pin);report.finalRuntimeFingerprint=fp();assert.ok(report.records.every(r=>r.technicalOk));report.status='BOUNDED_ACTUAL_UI_COMPLETE_REQUIRES_INDEPENDENT_PER_ID_REVIEW';
}catch(error){report.status='FAIL';report.failure=String(error);process.exitCode=1;}finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill('SIGTERM');if(server.exitCode===null)await Promise.race([once(server,'exit'),new Promise(r=>setTimeout(r,2000))]);if(server.exitCode===null)server.kill('SIGKILL');server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(data,{recursive:true,force:true});}
