// Technical integration of canonical draft imports with the actual bench and reader.
// A private author-only transport fixture supplies the saved DRAFT to the unchanged item port.
// No published head, student API, permission, response key or grade tolerance is changed.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url));
const names=process.env.ASTRA_DRAFT_READING_BATCHES?.split(',') || ['experiment-projection-revision-118','experiment-products-revision-119','experiment-normal-revision-140'];
assert.ok(names.length && names.every(n=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(n)) && new Set(names).size===names.length);
const output=process.env.ASTRA_RESULTS||path.join(root,'var/experiment-draft-reading');
const temp=await fs.mkdtemp('/private/tmp/cric-draft-reading-');
const sha=x=>createHash('sha256').update(x).digest('hex');
const files=names.map(n=>path.join(root,'editorial/batches',n+'.json'));
const packages=await Promise.all(files.map(async f=>JSON.parse(await fs.readFile(f))));
const allRecords=packages.flatMap(pkg=>pkg.records.map(row=>({pkg,row})));
const selectedIds=process.env.ASTRA_DRAFT_READING_IDS?.split(',');
const records=selectedIds?allRecords.filter(({row})=>selectedIds.includes(row.id)):allRecords;
assert.ok(records.length);
if(selectedIds)assert.deepEqual(records.map(({row})=>row.id).sort(),[...new Set(selectedIds)].sort());
const clockCases={'SIM-C5-L01-01':[.5,.125],'SIM-C5-L02-03':[.25,.125],'SIM-C5-L08-02':[2,2.5]};
const fingerprint=()=>JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:root,encoding:'utf8'}));
const runtime=fingerprint();
const boot=`import json,os,secrets,hashlib,time
from server import store
from server.web import Handler,ThreadingHTTPServer
from tools.corpus_engineering.draft_import import import_drafts
store.initialize()
with store.connect() as db:
 before=store.encode(store.published(db))
 old={(r['id'],r['v']):r['payload'] for r in db.execute('SELECT id,v,payload FROM versions')}
 for file in json.loads(os.environ['ASTRA_READING_PACKAGES']):
  pkg=json.load(open(file));assert import_drafts(db,{'id':'owner','role':'autore'},pkg)['saved']==len(pkg['records'])
  assert import_drafts(db,{'id':'owner','role':'autore'},pkg)['saved']==0
 assert before==store.encode(store.published(db))
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',k).fetchone()[0]==v for k,v in old.items())
 ticket=secrets.token_urlsafe(32)
 db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+600))
s=ThreadingHTTPServer(('127.0.0.1',0),Handler)
print(json.dumps({'port':s.server_port,'ticket':ticket}),flush=True)
s.serve_forever()`;
const server=spawn('python3',['-uc',boot],{cwd:root,env:{...process.env,ASTRA_DATA:temp,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',ASTRA_EXTENSIONS:path.join(root,'extensions'),ASTRA_READING_PACKAGES:JSON.stringify(files)},stdio:['ignore','pipe','pipe']});
let browser,stderr='';server.stderr.on('data',x=>stderr+=x);
const report={schemaVersion:'1.0.0',scope:'TECHNICAL_PRIVATE_AUTHOR_TRANSPORT_FIXTURE_NOT_SCIENTIFIC_APPROVAL',publicationAction:'NONE',humanApproval:'NOT_RUN',runtimeFingerprint:runtime,protocolSha256:sha(await fs.readFile(fileURLToPath(import.meta.url))),cases:[],errors:[]};
try {
 await fs.mkdir(output,{recursive:true});
 const [raw]=await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('server exited '+stderr);})]);
 const {port,ticket}=JSON.parse(String(raw)),base='http://127.0.0.1:'+port;
 browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});
 const guest=await browser.newContext();
 for(const {pkg,row:r} of allRecords){
  const response=await guest.request.get(base+'/api/item/'+r.id);
  assert.ok([200,403].includes(response.status()));
  if(response.status()===200){const live=await response.json();assert.equal(live.version,r.baseVersion);assert.equal(live.assessmentSelection,undefined);}
  for(const asset of pkg.assets)assert.equal((await guest.request.get(base+'/asset/'+asset.id)).status(),403);
 }
 await guest.close();
 let ownerState;
 for(const noWebGL of [false,true]){
  const context=await browser.newContext({bypassCSP:true,reducedMotion:'reduce',...(ownerState?{storageState:ownerState}:{})});
  if(noWebGL)await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.includes('webgl')?null:original.call(this,kind,...args);};});
  if(!ownerState){assert.ok((await context.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket}})).ok());ownerState=await context.storageState();}
  const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(String(e)));
  for(const {row} of records){
   const savedResponse=await context.request.get(base+'/api/author/item/'+row.id);assert.ok(savedResponse.ok());
   const saved=(await savedResponse.json()).record;assert.equal(saved.version,row.version);assert.deepEqual(saved.assessmentSelection,row.assessmentSelection);
   await page.route('**/api/item/'+row.id,route=>route.fulfill({json:saved}));
   for(const width of [1440,320]){
    await page.goto('about:blank');await page.setViewportSize({width,height:1000});await page.goto(base+'/#banco/'+row.id);
    await page.locator('[data-predict]').waitFor({state:'visible'});await page.locator('[name=prediction]').first().check();await page.locator('[data-predict] button').click();
    await page.locator('[data-phase="3"]').click();
    const clockTransitions=[];
    if(clockCases[row.id]){
     const [assigned,unassigned]=clockCases[row.id];
     await page.locator('input[name=x]').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},assigned);
     const snapshot=()=>page.evaluate(()=>Object.fromEntries(['step-title','explain','equation'].map(key=>[key,document.querySelector('[data-'+key+']').textContent])));
     const assignedGuide=await snapshot();assert.equal(assignedGuide['step-title'],'Controlla il calcolo');
     await page.locator('.time-options > summary').click();
     for(const [value,title] of [[unassigned,'Osserva la lettura del modello'],[assigned,'Controlla il calcolo']]){
      await page.locator('[data-instant]').fill(String(value));await page.locator('[data-instant]').dispatchEvent('change');
      const after=await snapshot();clockTransitions.push({value,guide:after});
      assert.equal(after['step-title'],title,'Actual seek must update the complete guide for '+row.id+' at '+value);
      if(value===unassigned)assert.ok(!after.explain.includes('Sostituisci i dati'));
      else assert.deepEqual(after,assignedGuide);
     }
    }
    const panel=page.locator('[data-authored-reading]');await panel.waitFor({state:'visible'});await panel.locator('summary').click();
    await page.waitForFunction(()=>document.querySelector('[data-authored-reading] .lettura-inizia'));
    assert.ok((await panel.innerText()).includes(row.blocks.find(b=>b.type==='text').text));
    assert.equal(await panel.locator('img').count(),row.blocks.filter(b=>b.type==='figure').length);
    for(const img of await panel.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
    assert.equal(await panel.locator('[data-tex]').count(),0);
    await panel.locator('.lettura-inizia').click();
    assert.ok(await panel.locator('.copy > [hidden]').count());
    const status=await panel.locator('.lettura-stato').innerText();
    await page.locator('input[name=x]').evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await panel.locator('.lettura-stato').innerText(),status);
    await panel.locator('.lettura-tutto').click();
    await page.addScriptTag({path:path.join(root,'node_modules/axe-core/axe.min.js')});
    const audit=await panel.evaluate(async el=>({violations:(await axe.run(el,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>v.id),overflow:document.documentElement.scrollWidth-innerWidth,formulas:[...el.querySelectorAll('.math')].map(f=>({width:f.clientWidth,scroll:f.scrollWidth,typeset:f.querySelector('.katex-html').getBoundingClientRect().width}))}));
    assert.deepEqual(audit.violations,[]);assert.ok(audit.overflow<=1);assert.ok(audit.formulas.every(f=>f.scroll<=f.width+1&&f.typeset<=f.width+1));
    await panel.scrollIntoViewIfNeeded();const screenshot=path.join(output,row.id+'-'+width+(noWebGL?'-2d':'-3d')+'.png');await panel.screenshot({path:screenshot});
    report.cases.push({id:row.id,noWebGL,width,savedVersion:saved.version,authoredBlocks:row.blocks.length,firstParagraphRendered:true,progressiveReaderPreservedAfterInput:true,clockTransitions,audit,screenshot});
   }
   await page.unroute('**/api/item/'+row.id);
  }
  await context.close();
 }
 assert.deepEqual(fingerprint(),runtime);assert.deepEqual(report.errors,[]);report.terminalStatus='PASS';
} catch(error){report.terminalStatus='FAIL';report.failure=String(error);throw error;}
finally{await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill('SIGTERM');server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(temp,{recursive:true,force:true});}
