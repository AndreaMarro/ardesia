// Read-only diagnostic of real consumers; no existing protocol or approval changed.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const app='/private/tmp/cric-experiment-contract-fix/officina-di-fisica';
const out=path.dirname(fileURLToPath(import.meta.url));
const python='/private/tmp/cric-recovery-venv/bin/python';
const id='SIM-C1-L005-05';
const sha=b=>createHash('sha256').update(b).digest('hex');
const profile=()=>JSON.parse(execFileSync(python,['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:app,encoding:'utf8'}));
const initial=profile();assert.equal(initial.sha256,'b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f');
const pkgFile=app+'/editorial/batches/experiment-normal-revision-140.json';
const pkgBytes=await fs.readFile(pkgFile);const pkg=JSON.parse(pkgBytes);assert.equal(pkg.records.length,1);
const pinnedOriginal=JSON.parse(execFileSync('git',['show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/esperienze-C1.json'],{cwd:app,encoding:'utf8'})).find(r=>r.id===id);
const original=JSON.parse(await fs.readFile(app+'/content/esperienze-C1.json','utf8')).find(r=>r.id===id);
assert.deepEqual(original,pinnedOriginal);
for(const key of ['control','measure','references','apparatus','formula','substitution','course','model'])assert.deepEqual(pkg.records[0][key],original[key]);
const data=await fs.mkdtemp('/private/tmp/cric-a-normal-visibility-db-');
const boot=String.raw`
import json,os,secrets,hashlib,time
from server import store
from server.web import Handler,ThreadingHTTPServer
from tools.corpus_engineering.draft_import import import_drafts
from tools.corpus_engineering.pipeline import digest
store.initialize()
with store.connect() as db:
 before=store.published(db);old={(r['id'],r['v']):r['payload'] for r in db.execute('SELECT id,v,payload FROM versions')}
 attempts=db.execute('SELECT count(*) FROM attempts').fetchone()[0]
 pkg=json.load(open(os.environ['DIAGNOSTIC_PACKAGE']))
 first=import_drafts(db,{'id':'owner','role':'autore'},pkg);second=import_drafts(db,{'id':'owner','role':'autore'},pkg)
 assert first['saved']==1 and second['saved']==0 and second['unchanged']==1
 after=store.published(db);assert store.encode(before)==store.encode(after)
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',key).fetchone()[0]==value for key,value in old.items())
 ticket=secrets.token_urlsafe(32);db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+900))
 proof={'publishedBefore':len(before),'publishedAfter':len(after),'publishedSha256':digest(before),'historicalVersionsPreserved':len(old),'attemptsBefore':attempts,'firstImport':first,'repeatedImport':second}
s=ThreadingHTTPServer(('127.0.0.1',0),Handler);print(json.dumps({'port':s.server_port,'ticket':ticket,'proof':proof}),flush=True);s.serve_forever()
`;
const env={...process.env,ASTRA_DATA:data,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',ASTRA_EXTENSIONS:app+'/extensions',DIAGNOSTIC_PACKAGE:pkgFile,PYTHONPYCACHEPREFIX:'/private/tmp/cric-recovery-pycache',PYTHONDONTWRITEBYTECODE:'1'};
const server=spawn(python,['-uc',boot],{cwd:app,env,stdio:['ignore','pipe','pipe']});let browser,stderr='';server.stderr.on('data',b=>stderr+=b);
const report={schemaVersion:'1.0.0',purpose:'INDEPENDENT_POSTFIX_VISIBILITY_REVIEW',scientificApproval:false,humanApproval:'NOT_RUN',publicationAction:'NONE',coreHead:'b925c3c45308681943fd7e316f73b79979356807',productionFixSha:'27610cc9d625d291d9522251e18061aa755c5ab9',runtimeFingerprint:initial,sourceRef:'5d1dc8dc7b601aef959d10d564c75462be74708d',packageFileSha256:sha(pkgBytes),scriptSha256:sha(await fs.readFile(fileURLToPath(import.meta.url))),cases:[],errors:[]};
const material=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!['version','baseVersion','review'].includes(k)));
try{
 const ready=await new Promise((resolve,reject)=>{let raw='';const timer=setTimeout(()=>{done();reject(Error('Disposable boot timeout '+stderr));},30000);const ended=()=>{done();reject(Error('Disposable server ended '+stderr));};const take=b=>{raw+=b;if(raw.includes('\n')){done();try{resolve(JSON.parse(raw.split('\n')[0]));}catch(e){reject(e);}}};function done(){clearTimeout(timer);server.stdout.off('data',take);server.off('exit',ended);}server.stdout.on('data',take);server.once('exit',ended);});
 report.disposableDatabase=ready.proof;const base='http://127.0.0.1:'+ready.port;
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});report.browserVersion=browser.version();
 const owner=await browser.newContext();assert.ok((await owner.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket:ready.ticket}})).ok());const storage=await owner.storageState();
 const published=await(await owner.request.get(base+'/api/item/'+id)).json();assert.equal(published.version,1);
 const draft=(await(await owner.request.get(base+'/api/author/item/'+id)).json()).record;assert.equal(draft.version,2);assert.deepEqual(material(draft),material(pkg.records[0]));
 for(const key of ['control','measure','references','apparatus','formula','substitution'])assert.deepEqual(draft[key],published[key]);
 report.editions={publishedVersion:published.version,draftVersion:draft.version,physicalAndControlFieldsIdentical:true,publishedControl:published.control,publishedReferences:published.references,publishedFormula:published.formula,draftAssessmentSelection:draft.assessmentSelection};await owner.close();
 const geometryByAngle={};
 for(const fallback of [false,true]){
  const context=await browser.newContext({storageState:storage,viewport:{width:1280,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  if(fallback)await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...rest){return kind.includes('webgl')?null:get.call(this,kind,...rest);};});
  for(const edition of ['source-v1','draft-140-v2']){
   const row=edition==='source-v1'?published:draft;const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>report.errors.push(String(e)));
   if(edition==='draft-140-v2')await page.route('**/api/item/'+id,route=>route.fulfill({json:draft}));
   for(const width of [1280,320]){
    await page.setViewportSize({width,height:1000});await page.goto(base+'/#banco/'+id);await page.locator('[data-predict]').waitFor({state:'visible'});await page.locator('[name=prediction]').nth(0).check();await page.locator('[data-predict] button').click();
    await page.waitForFunction(()=>/3D interattivo|Tavola di misura/.test(document.querySelector('[data-display]')?.textContent||''));
    const display=await page.locator('[data-display]').innerText();assert.ok(fallback?display.includes('Tavola di misura'):display.includes('3D interattivo'));
    await page.locator('[data-phase="2"]').click();const legendDetails=page.locator('details.scene-key');if(!(await legendDetails.evaluate(el=>el.open)))await legendDetails.locator('summary').click();
    for(const angle of Array.from({length:16},(_,i)=>5*i)){
     const input=page.locator('[name=x]');await input.fill(String(angle));await input.dispatchEvent('input');await page.locator('.bench-stage').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     const stem=edition+'-'+width+'-'+(fallback?'fallback':'native')+'-'+angle;
     const stage=path.join(out,stem+'-stage.png'),instrument=path.join(out,stem+'-instrument.png');await page.locator('.bench-stage').screenshot({path:stage});await page.locator('.bench-instrument').screenshot({path:instrument});
     const actual=await page.evaluate(async({row,angle,fallback})=>{
      const{esperienza}=await import('/js/banchi/voci/esperimento.js');const activity=await esperienza(row);const elements=activity.elements(angle,1);const canvas=document.querySelector('.bench-stage canvas');const rect=canvas.getBoundingClientRect();
      const result={elements,spec:activity.scene.spec,model:activity.model.solve({x:angle}),viewControls:[...document.querySelectorAll('[data-view]')].map(b=>({view:b.dataset.view,pressed:b.getAttribute('aria-pressed')})),canvas:{width:rect.width,height:rect.height},stage:document.querySelector('.bench-stage').getBoundingClientRect().toJSON()};
      if(fallback){const svg=document.querySelector('[data-drawing]>svg');result.svg=svg.outerHTML;const box=svg.getBoundingClientRect();result.svgBox={width:box.width,height:box.height};result.forcePaths=[...svg.querySelectorAll('path')].filter(p=>['#147979','#b94f48'].includes(p.getAttribute('stroke'))).map(p=>({color:p.getAttribute('stroke'),path:p.getAttribute('d')}));}
      else{const T=await import('/vendor/three-r180/three.module.min.js');const spec=activity.scene.spec,span=Math.max(spec.height,spec.width/(rect.width/rect.height));const camera=new T.OrthographicCamera(-span*rect.width/rect.height/2,span*rect.width/rect.height/2,span/2,-span/2,.05,100);const target=new T.Vector3(...spec.target);camera.position.copy(target).addScaledVector(new T.Vector3(...spec.eye).normalize(),14);camera.up.set(0,1,0);camera.lookAt(target);camera.updateMatrixWorld();camera.updateProjectionMatrix();const project=p=>{const q=new T.Vector3(...p).project(camera);return[(q.x+1)*rect.width/2,(1-q.y)*rect.height/2];};result.projected=elements.filter(e=>e.kind==='arrow'||e.kind==='ball').map(e=>e.kind==='ball'?{kind:e.kind,c:e.c,center:project(e.p),radiusInScene:e.r}:{kind:e.kind,c:e.c,a:project(e.a),b:project(e.b)});result.pixelsPerSceneUnit=rect.height/span;}
      return result;
     },{row,angle,fallback});
     const htmlLegend=await page.locator('[data-legend]').innerText();assert.match(htmlLegend,/20\s*N/u);assert.match(htmlLegend,/linee d’azione/u);assert.match(htmlLegend,/stessa scala/u);assert.match(htmlLegend,/non è disegnata/u);const legendLayout=await page.locator('[data-legend]').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,fontSize:getComputedStyle(el).fontSize,visible:el.getBoundingClientRect().height>0}));assert.ok(legendLayout.visible&&legendLayout.scroll<=legendLayout.width+1);const expected=20*Math.cos(angle*Math.PI/180);assert.ok(Math.abs(actual.model.y-expected)<1e-12);
     const key=String(angle);if(geometryByAngle[key])assert.deepEqual(actual.elements,geometryByAngle[key]);else geometryByAngle[key]=actual.elements;
     if(fallback){await fs.writeFile(path.join(out,stem+'.svg'),actual.svg);delete actual.svg;}
     report.cases.push({id,edition,width,angle,fallback,display,reading:await page.locator('[data-readings]').innerText(),independentNormal:expected,htmlLegend,legendLayout,...actual,stageFile:path.basename(stage),stageSha256:sha(await fs.readFile(stage)),instrumentFile:path.basename(instrument),instrumentSha256:sha(await fs.readFile(instrument))});
     console.log(stem,'captured');
    }
    await page.goto('about:blank');
   }
   await page.close();
  }
  await context.close();
 }
 assert.equal(report.cases.length,128);assert.deepEqual(report.errors,[]);assert.deepEqual(profile(),initial);assert.equal(sha(await fs.readFile(pkgFile)),sha(pkgBytes));
 const after=JSON.parse(execFileSync(python,['-c',"from server import store;from tools.corpus_engineering.pipeline import digest;import json\nwith store.connect() as db: print(json.dumps({'publishedCount':len(store.published(db)),'publishedSha256':digest(store.published(db)),'attempts':db.execute('SELECT count(*) FROM attempts').fetchone()[0]}))"],{cwd:app,env,encoding:'utf8'}));
 assert.equal(after.publishedCount,report.disposableDatabase.publishedBefore);assert.equal(after.publishedSha256,report.disposableDatabase.publishedSha256);assert.equal(after.attempts,report.disposableDatabase.attemptsBefore);report.afterConsumer=after;report.geometryIdenticalAcrossEditionsAndRenderers=true;report.diagnosticStatus='COMPLETED';
}catch(error){report.diagnosticStatus='ERROR';report.error=String(error);throw error;}
finally{await fs.writeFile(path.join(out,'diagnostic.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill('SIGTERM');server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(data,{recursive:true,force:true});}
