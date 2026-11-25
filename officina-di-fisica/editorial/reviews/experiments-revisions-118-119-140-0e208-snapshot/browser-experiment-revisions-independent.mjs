// Independent scientific consumer proof. Canonical DRAFT imports, owner fetches,
// and an explicitly private transport fixture; published ports are not changed.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const python=process.env.PYTHON||'python3';
const reviewedProfile='0e2083691b9233b26bc3a9e294813288d5c3eed97b29d4728431123684d8e3bd';
const names=['experiment-projection-revision-118','experiment-products-revision-119','experiment-normal-revision-140'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const profile=()=>JSON.parse(execFileSync(python,['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:root,encoding:'utf8'}));
const pkgFiles=names.map(n=>root+'/editorial/batches/'+n+'.json');
const bytes=await Promise.all(pkgFiles.map(p=>fs.readFile(p))),packages=bytes.map(b=>JSON.parse(b));
const packageFileSha256ByBatch=Object.fromEntries(names.map((n,i)=>[n,sha(bytes[i])]));
const candidates=new Map(packages.map(p=>[p.records[0].id,p.records[0]]));
const independent=[
 ['SIM-C1-L001-01',2,[2000,200]],['SIM-C1-L001-02',2,[27,64]],['SIM-C1-L001-03',2,[2.5,2.6]],['SIM-C1-L001-04',2,[8000,64000]],['SIM-C1-L001-05',2,[240,180]],['SIM-C1-L001-06',0,[0,-4]],
 ['SIM-C1-L002-01',2,[10,7.07]],['SIM-C1-L002-02',2,[5,5.83]],['SIM-C1-L002-03',2,[6,3]],['SIM-C1-L002-04',0,[0,-6]],
 ['SIM-C1-L005-01',2,[6,3.75]],['SIM-C1-L005-02',2,[3,-2]],['SIM-C1-L005-03',2,[3,0]],['SIM-C1-L005-04',0,[-8,-6]],['SIM-C1-L005-05',0,[10,20]],['SIM-C1-L005-06',2,[26,18]]
];
const data=await fs.mkdtemp('/private/tmp/cric-independent-revisions-db-');
const out=process.env.ASTRA_RESULTS||await fs.mkdtemp('/tmp/cric-independent-revisions-proof-');await fs.mkdir(out,{recursive:true});
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
 imports=[]
 for file in json.loads(os.environ['REVIEW_PACKAGES']):
  pkg=json.load(open(file));first=import_drafts(db,{'id':'owner','role':'autore'},pkg);second=import_drafts(db,{'id':'owner','role':'autore'},pkg)
  assert first['saved']==1 and second['saved']==0 and second['unchanged']==1
  imports.append({'first':first,'second':second})
 after=store.published(db);assert store.encode(before)==store.encode(after)
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',key).fetchone()[0]==value for key,value in old.items())
 ticket=secrets.token_urlsafe(32);db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+900))
 proof={'beforePublishedCount':len(before),'afterPublishedCount':len(after),'publishedSha256':digest(before),'preservedHistoricalVersions':len(old),'attemptsBefore':attempts,'imports':imports}
s=ThreadingHTTPServer(('127.0.0.1',0),Handler);print(json.dumps({'port':s.server_port,'ticket':ticket,'proof':proof}),flush=True);s.serve_forever()
`;
const env={...process.env,ASTRA_DATA:data,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',ASTRA_EXTENSIONS:root+'/extensions',REVIEW_PACKAGES:JSON.stringify(pkgFiles),PYTHONDONTWRITEBYTECODE:'1'};
const initialProfile=profile();assert.equal(initialProfile.sha256,reviewedProfile);
const server=spawn(python,['-uc',boot],{cwd:root,env,stdio:['ignore','pipe','pipe']});
let browser,stderr='';server.stderr.on('data',b=>stderr+=b);
const report={schemaVersion:'1.0.0',purpose:'INDEPENDENT_SCIENTIFIC_CONSUMER_WITH_PRIVATE_OWNER_DRAFT_TRANSPORT',
 scientificApproval:false,humanApproval:'NOT_RUN',publicationAction:'NONE',packageFileSha256ByBatch,runtimeFingerprint:initialProfile,
 protocolSha256:sha(await fs.readFile(fileURLToPath(import.meta.url))),expectedEffectiveIds:independent.map(v=>v[0]),cases:[],errors:[],accessChecks:[]};
const material=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!['version','baseVersion','review'].includes(k)));
let base;
async function openBench(page,id,prediction){
 await page.goto('about:blank');await page.goto(base+'/#banco/'+id);
 await page.locator('[data-predict]').waitFor({state:'visible'});await page.locator('[name=prediction]').nth(prediction).check();await page.locator('[data-predict] button').click();
 await page.waitForFunction(()=>/3D interattivo|Tavola di misura/.test(document.querySelector('[data-display]')?.textContent||''));
}
async function answer(page,index,value){
 const form=page.locator('[data-check="'+index+'"]');await form.locator('input').fill(String(value).replace('.',','));await form.locator('button').click();
 return (await form.locator('[role=status]').innerText()).startsWith('Corretto');
}
async function setInput(page,value){const input=page.locator('[name=x]');await input.fill(String(value));await input.dispatchEvent('input');}
async function screenshot(node,name){const file=path.join(out,name+'.png');await node.screenshot({path:file});return {screenshot:file,screenshotSha256:sha(await fs.readFile(file))};}
async function forceLengths(page){
 await page.locator('[data-view=diagram]').click();
 return page.locator('[data-drawing]>svg').evaluate(el=>Object.fromEntries(['#147979','#b94f48'].map(color=>{
  const lines=[...el.querySelectorAll('path')].filter(p=>p.getAttribute('stroke')===color);
  if(lines.length!==1)throw Error('Expected exactly one force path '+color);
  const nums=lines[0].getAttribute('d').match(/[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g).map(Number);
  if(nums.length!==4)throw Error('Expected one straight force arrow');
  return [color,{pixels:Math.hypot(nums[2]-nums[0],nums[3]-nums[1]),metric:Math.hypot((nums[2]-nums[0])/47,(nums[3]-nums[1])/44)}];
 })));
}
try{
 const ready=await new Promise((resolve,reject)=>{
  let raw='';const timer=setTimeout(()=>{cleanup();reject(Error('Disposable boot timeout '+stderr));},30000);
  const cleanup=()=>{clearTimeout(timer);server.stdout.off('data',take);server.off('exit',ended);};
  const ended=()=>{cleanup();reject(Error('Disposable server ended '+stderr));};
  const take=b=>{raw+=b;if(raw.includes('\n')){cleanup();try{resolve(JSON.parse(raw.split('\n')[0]));}catch(e){reject(e);}}};
  server.stdout.on('data',take);server.once('exit',ended);
 });
 base='http://127.0.0.1:'+ready.port;report.canonicalImport=ready.proof;
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
 const guest=await browser.newContext();
 for(const pkg of packages){const row=pkg.records[0];assert.equal((await guest.request.get(base+'/api/author/item/'+row.id)).status(),401);for(const a of pkg.assets)assert.equal((await guest.request.get(base+'/asset/'+a.id)).status(),403);}
 report.bareGuestAuthorAndDraftAssetsForbidden=true;await guest.close();
 const learner=await browser.newContext();
 assert.ok((await learner.request.post(base+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}})).ok());
 for(const pkg of packages){
  const row=pkg.records[0],reply=await learner.request.get(base+'/api/item/'+row.id);assert.equal(reply.status(),200);
  const live=await reply.json();assert.equal(live.version,row.baseVersion);assert.equal(live.assessmentSelection,undefined);
  assert.equal((await learner.request.get(base+'/api/author/item/'+row.id)).status(),403);
  const assets=[];for(const a of pkg.assets){assert.equal((await learner.request.get(base+'/asset/'+a.id)).status(),403);assets.push(a.id);}
  report.accessChecks.push({id:row.id,learnerPublishedVersion:live.version,learnerSelectionAbsent:true,authorPortForbidden:true,draftAssetsForbidden:assets});
 }
 await learner.close();
 let ownerState;
 for(const noWebGL of [false,true]){
  const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1280,height:1000},...(ownerState?{storageState:ownerState}:{})});
  await context.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  if(noWebGL)await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...rest){return kind.includes('webgl')?null:get.call(this,kind,...rest);};});
  if(!ownerState){assert.ok((await context.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket:ready.ticket}})).ok());ownerState=await context.storageState();}
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>report.errors.push(String(e)));
  const saved=new Map();for(const [id,row]of candidates){const reply=await context.request.get(base+'/api/author/item/'+id);assert.ok(reply.ok());const r=(await reply.json()).record;assert.equal(r.version,2);assert.deepEqual(material(r),material(row));saved.set(id,r);}
  const mount=async id=>{if(saved.has(id))await page.route('**/api/item/'+id,route=>route.fulfill({json:saved.get(id)}));};
  const unmount=async id=>{if(saved.has(id))await page.unroute('**/api/item/'+id);};
  for(const [id,prediction,answers]of independent){
   await mount(id);const row=candidates.get(id);
   for(const width of row?[1440,768,320]:[1280]){
    await page.setViewportSize({width,height:1000});await openBench(page,id,prediction);
    const renderMode=await page.locator('[data-display]').innerText();assert.ok(noWebGL?renderMode.includes('Tavola di misura'):renderMode.includes('3D interattivo'));
    const modes=[];const panel=page.locator('[data-authored-reading]');
    for(let phase=1;phase<=4;phase++){
     await page.locator('[data-phase="'+phase+'"]').click();const text=await page.locator('[data-guide]').innerText();modes.push({phase,text});
     if(row&&phase<3)assert.ok(await panel.isHidden());
     if(row&&phase===4)assert.ok(text.includes(row.assessmentSelection.points[1]===0?'0 °':String(row.assessmentSelection.points[1])));
    }
    for(let i=0;i<2;i++){assert.equal(await answer(page,i,answers[i]+9999),false);assert.equal(await answer(page,i,answers[i]),true);}
    let reading=null;
    if(row){
     await page.locator('[data-phase="3"]').click();await panel.waitFor({state:'visible'});await panel.locator('summary').click();
     await panel.locator('.lettura-inizia').waitFor({state:'visible'});assert.ok((await panel.innerText()).includes(row.blocks.find(b=>b.type==='text').text));
     assert.equal(await panel.locator('.copy > *').count(),row.blocks.length);assert.equal(await panel.locator('[data-tex]').count(),0);
     assert.equal(await panel.locator('img').count(),row.blocks.filter(b=>b.type==='figure').length);
     for(const img of await panel.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
     await panel.locator('.lettura-inizia').click();await panel.locator('.lettura-avanti').click();
     const before=await panel.locator('.lettura-stato').innerText();await page.locator('[data-phase="2"]').click();await setInput(page, row.control.max);await page.locator('[data-phase="3"]').click();assert.equal(await panel.locator('.lettura-stato').innerText(),before);
     await panel.locator('.lettura-indietro').click();const seen=new Set();const statuses=[];
     while(true){
      statuses.push(await panel.locator('.lettura-stato').innerText());for(const i of await panel.locator('.copy > *').evaluateAll(nodes=>nodes.flatMap((el,i)=>el.hidden?[]:[i])))seen.add(i);
      if(await panel.locator('.lettura-avanti').isDisabled())break;await panel.locator('.lettura-avanti').click();
     }
     assert.equal(seen.size,row.blocks.length);assert.equal(await panel.locator('.lettura-strumenti').count(),1);await panel.locator('.lettura-tutto').click();
     const layout=await panel.evaluate(el=>({documentOverflow:document.documentElement.scrollWidth-innerWidth,formulas:[...el.querySelectorAll('.math')].map(f=>({width:f.clientWidth,scroll:f.scrollWidth,typeset:f.querySelector('.katex-html')?.getBoundingClientRect().width}))}));
     assert.ok(layout.documentOverflow<=1);assert.equal(layout.formulas.length,row.blocks.filter(b=>b.type==='formula').length);assert.ok(layout.formulas.every(f=>f.scroll<=f.width+1&&f.typeset<=f.width+1));
     reading={authoredBlocks:row.blocks.length,allBlocksReachable:true,progressPreservedAfterInput:true,statuses,layout,...await screenshot(panel,id+'-'+width+(noWebGL?'-fallback':'-native')+'-reading')};
    }else assert.equal(await panel.count(),0);
    await page.locator('[data-phase="2"]').click();await page.locator('.setting-actions [data-reset]').click();
    report.cases.push({id,kind:'effective_bench',width,noWebGL,renderMode,draftTransport:!!row,savedVersion:row?2:null,modes,independentAnswers:answers,reading,...await screenshot(page.locator('.bench-instrument'),id+'-'+width+(noWebGL?'-fallback':'-native')+'-bench')});
   }
   await unmount(id);
  }
  await page.setViewportSize({width:1280,height:1000});
  for(const [id,label,xs,values,prediction]of [['SIM-C1-L001-01','Spessore',[-3,-4],[2000,200],2],['SIM-C1-L001-04','Massa d’acqua',[2,4],[8000,64000],2]]){
   await openBench(page,id,prediction);await page.locator('[data-phase="4"]').click();const displays=[];
   for(let i=0;i<2;i++){await page.locator('[data-phase="2"]').click();await setInput(page,xs[i]);await page.locator('[data-phase="4"]').click();const text=await page.locator('[data-readings]>div').filter({hasText:label}).locator('strong').innerText();const numeric=text.trim().split(/\s+/)[0];assert.equal(Number(numeric.replace(',','.')),values[i]);assert.equal(await answer(page,i,numeric),true);displays.push(text);}
   report.cases.push({id,kind:'formatter_roundtrip',noWebGL,displays});
  }
  await openBench(page,'SIM-C1-L002-01',2);await page.locator('[data-phase="2"]').click();await setInput(page,90);
  const zero=await page.locator('[data-readings]>div').nth(2).locator('strong').innerText();assert.equal(zero,'0 cm');report.cases.push({id:'SIM-C1-L002-01',kind:'quadrant_projection_zero',noWebGL,reading:zero});
  for(const [id,prediction,points,ratios]of [['SIM-C1-L005-06',2,[0,-3],[1,.7]],['SIM-C1-L005-05',0,[0,60],[1,.5]]]){
   await mount(id);await openBench(page,id,prediction);await page.locator('[data-phase="2"]').click();
   for(let i=0;i<points.length;i++){await setInput(page,points[i]);const lengths=await forceLengths(page);const ratio=lengths['#147979'].metric/lengths['#b94f48'].metric;assert.ok(Math.abs(ratio-ratios[i])<1e-6);report.cases.push({id,kind:'force_scale',noWebGL,view:'actual SVG toggle/fallback; x47/y44 known projection inverted for force vectors lying in z0; pixel lengths separately retained',input:points[i],lengths,ratio,...await screenshot(page.locator('.bench-instrument'),id+'-scale'+points[i]+(noWebGL?'-fallback':'-native-toggle'))});}
   await unmount(id);
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(profile(),initialProfile);assert.deepEqual(Object.fromEntries(await Promise.all(names.map(async(n,i)=>[n,sha(await fs.readFile(pkgFiles[i]))]))),packageFileSha256ByBatch);
 const post=JSON.parse(execFileSync(python,['-c',"from server import store; from tools.corpus_engineering.pipeline import digest; import json\nwith store.connect() as db: print(json.dumps({'publishedCount':len(store.published(db)),'publishedSha256':digest(store.published(db)),'attemptsAfter':db.execute('SELECT count(*) FROM attempts').fetchone()[0]}))"],{cwd:root,env,encoding:'utf8'}));
 assert.equal(post.publishedCount,report.canonicalImport.beforePublishedCount);assert.equal(post.publishedSha256,report.canonicalImport.publishedSha256);assert.equal(post.attemptsAfter,report.canonicalImport.attemptsBefore);report.afterConsumer=post;
 assert.equal(report.cases.length,58);report.terminalStatus='PASS';
 console.log(JSON.stringify({out,cases:report.cases.length,errors:report.errors}));
}catch(e){report.terminalStatus='FAIL';report.failure=String(e);throw e;}
finally{
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill('SIGTERM');server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(data,{recursive:true,force:true});
}
