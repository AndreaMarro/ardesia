// Existing bench replay pattern, private canonical DRAFT transport, immutable APP.
// Projected label rectangles are source-derived measurements, not internal GPU access.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),app=process.env.ASTRA_REVIEW_APP,out=process.env.ASTRA_RESULTS;
assert.ok(app&&out);
const FP='b2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46';
const sha=b=>createHash('sha256').update(b).digest('hex');
const rows=JSON.parse(await fs.readFile(path.join(here,'source-records.json')));
const ids=(process.env.ASTRA_REVIEW_IDS||'SIM-C2-L005-05').split(',');
assert.equal(new Set(ids).size,ids.length);assert.ok(ids.every(id=>rows.some(r=>r.id===id)));
const packages=['experiments-manual-support-revision-263','experiment-stevino-revision-047'].map(n=>path.join(app,'editorial/batches',n+'.json'));
const temp=await fs.mkdtemp('/private/tmp/cric-b2-owner-db-');
const boot=`import json,os,secrets,hashlib,time
from server import store
from server.web import Handler,ThreadingHTTPServer
from tools.corpus_engineering.draft_import import import_drafts
store.initialize()
with store.connect() as db:
 before=store.encode(store.published(db));count=len(store.published(db))
 old={(r['id'],r['v']):r['payload'] for r in db.execute('SELECT id,v,payload FROM versions')}
 imports=[]
 for filename in json.loads(os.environ['ASTRA_PACKAGES']):
  package=json.load(open(filename));a=import_drafts(db,{'id':'owner','role':'autore'},package);b=import_drafts(db,{'id':'owner','role':'autore'},package)
  assert a['saved']==len(package['records']) and b['saved']==0
  imports.append({'records':len(package['records']),'first':a,'second':b})
 assert before==store.encode(store.published(db))
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',k).fetchone()[0]==v for k,v in old.items())
 ticket=secrets.token_urlsafe(32);db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+600))
s=ThreadingHTTPServer(('127.0.0.1',0),Handler)
print(json.dumps({'port':s.server_port,'ticket':ticket,'publishedCount':count,'imports':imports}),flush=True)
s.serve_forever()`;
const env={...process.env,ASTRA_DATA:temp,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',ASTRA_PACKAGES:JSON.stringify(packages)};
const profile=()=>JSON.parse(execFileSync('python3',['-B','-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:app,env,encoding:'utf8'}));
const before=profile();assert.equal(before.sha256,FP);
const server=spawn('python3',['-uc',boot],{cwd:app,env,stdio:['ignore','pipe','pipe']});
let stderr='',browser;server.stderr.on('data',b=>stderr+=b);
const report={phase:'INDEPENDENT_ACTUAL_B2_UI_DIAGNOSTIC_NOT_ACTIVITY_ACCEPTANCE',runtimeFingerprint:before,
 protocolSha256:sha(await fs.readFile(fileURLToPath(import.meta.url))),cases:[],errors:[],activityCredit:0,
 originalFailuresPreserved:true,humanApproval:'NOT_RUN',publicationAction:'NONE'};
try{
 await fs.mkdir(out,{recursive:true});
 const raw=await new Promise((resolve,reject)=>{let data='';const timer=setTimeout(()=>{clean();reject(Error('boot timeout '+stderr));},30000);
  const take=b=>{data+=b;if(data.includes('\n')){clean();resolve(data.trim());}};const end=()=>{clean();reject(Error('boot exit '+stderr));};
  function clean(){clearTimeout(timer);server.stdout.off('data',take);server.off('exit',end);}server.stdout.on('data',take);server.once('exit',end);});
 const {port,ticket,publishedCount,imports}=JSON.parse(raw),base='http://127.0.0.1:'+port;report.canonicalImport={publishedCount,imports,publishedAndHistoryBytesPreserved:true};
 browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});report.browserVersion=browser.version();
 const guest=await browser.newContext();
 for(const filename of packages){const pkg=JSON.parse(await fs.readFile(filename));for(const r of pkg.records){const response=await guest.request.get(base+'/api/item/'+r.id);assert.ok([200,403].includes(response.status()));if(response.status()===200)assert.equal((await response.json()).version,r.baseVersion);}for(const a of pkg.assets)assert.equal((await guest.request.get(base+'/asset/'+a.id)).status(),403);}
 await guest.close();report.guestIsolation='ORIGINAL_ONLY_AND_DRAFT_ASSETS_403';
 let ownerState;
 const profiles=[320,1280].flatMap(width=>[{width,fallback:false,view:'orbit'},{width,fallback:false,view:'side'},{width,fallback:false,view:'top'},{width,fallback:true,view:'fixed_projection'}]);
 for(const profile of profiles){
  const context=await browser.newContext({viewport:{width:profile.width,height:1000},reducedMotion:'reduce',...(ownerState?{storageState:ownerState}:{})});
  if(profile.fallback)await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){return k.includes('webgl')?null:original.call(this,k,...a);};});
  if(!ownerState){assert.ok((await context.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket}})).ok());ownerState=await context.storageState();}
  const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>report.errors.push(String(e)));
  for(const id of ids){
   const row=rows.find(r=>r.id===id);await page.goto(base+'/#banco/'+id);
   await page.locator('[data-predict]').waitFor({state:'visible'});await page.locator('[name=prediction]').first().check();await page.locator('[data-predict] button').click();
   await page.waitForFunction(({fallback})=>document.querySelector('[data-display]')?.textContent===(fallback?'Tavola di misura':'3D interattivo'),profile);
   await page.locator('[data-phase="2"]').click();
   if(!profile.fallback)await page.locator('[data-view="'+profile.view+'"]').click();
   const key=page.locator('.scene-key');await key.locator('summary').focus();if(!await key.evaluate(e=>e.open))await page.keyboard.press('Enter');assert.ok(await key.evaluate(e=>e.open));
   const inputs=JSON.parse(process.env.ASTRA_REVIEW_VALUES||'[8]');
   for(const x of inputs){
    await page.locator('[name=x]').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},x);
    await page.evaluate(()=>document.fonts.ready);await page.locator('.bench-stage').scrollIntoViewIfNeeded();
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const measured=await page.evaluate(async({row,x,profile})=>{
     const {esperienza}=await import('/js/banchi/voci/esperimento.js');const a=await esperienza(row);
     const clockTime=a.clock?(a.clock.input?x:Number(document.querySelector('[data-instant]').value)):undefined;
     const elements=a.elements(x,1,clockTime);
     const canvas=document.querySelector('.bench-stage canvas'),rect=(profile.fallback?document.querySelector('[data-drawing]>svg'):canvas).getBoundingClientRect();
     const legend=document.querySelector('[data-legend]');const result={elements,spec:a.scene.spec,model:a.model.solve({x}),actualInput:document.querySelector('[name=x]').value,
      actualRenderer:document.querySelector('[data-display]').textContent,clockTime:clockTime??null,canvas:{width:rect.width,height:rect.height},legend:legend.textContent,
      legendLayout:{visible:legend.getBoundingClientRect().height>0,width:legend.clientWidth,scrollWidth:legend.scrollWidth},svg:profile.fallback?document.querySelector('[data-drawing]>svg').outerHTML:null};
     if(!profile.fallback){
      const T=await import('/vendor/three-r180/three.module.min.js'),{posizionaEtichetta}=await import('/js/banchi/etichette.js');
      const spec=a.scene.spec,aspect=rect.width/rect.height,span=Math.max(spec.height,spec.width/aspect),camera=new T.OrthographicCamera(-span*aspect/2,span*aspect/2,span/2,-span/2,.05,100);
      const target=new T.Vector3(...spec.target),direction=new T.Vector3(...(profile.view==='top'?[0,1,.00001]:profile.view==='side'?[0,0,1]:spec.eye));
      camera.position.copy(target).addScaledVector(direction.normalize(),14);camera.up.set(0,1,0);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();
      const project=p=>{const v=new T.Vector3(...p).project(camera);return{x:(1+v.x)*rect.width/2,y:(1-v.y)*rect.height/2,depth:v.z};};
      const occupied=[],ctx=document.createElement('canvas').getContext('2d');ctx.font='600 42px Arial';const pixels=rect.height/span;
      const labels=elements.filter(e=>e.kind==='label').map(e=>{const textureWidth=Math.ceil(ctx.measureText(e.text).width)+32,center=project(e.p),h=Math.max(20,.33*pixels),w=h*textureWidth/68;
       if(center.x<0||center.x>rect.width||center.y<0||center.y>rect.height)return{...e,notPositionedOutsideViewport:true};
       return{...e,textureWidth,center,box:posizionaEtichetta(center.x,center.y,w,h,rect.width,rect.height,occupied)};});
      const arrows=elements.map((e,i)=>({...e,elementIndex:i})).filter(e=>e.kind==='arrow').map(e=>{const tip=project(e.b);return{...e,tipPixels:tip,tipInsideOpaqueSourceLabel:labels.filter(l=>l.box&&Math.abs(tip.x-l.box.x)<l.box.w/2&&Math.abs(tip.y-l.box.y)<l.box.h/2).map(l=>({text:l.text,box:l.box}))};});
      result.sourceDerivedCamera={position:camera.position.toArray(),target:target.toArray(),view:profile.view,zoom:1,matrixWorld:camera.matrixWorld.toArray(),projectionMatrix:camera.projectionMatrix.toArray(),scope:'Preset source reconstructed from observed canvas dimensions and actual clicked view; not introspection of private GPU camera'};
      result.labels=labels;result.projectedArrows=arrows;
     }
     return result;
    },{row,x,profile});
    assert.ok(measured.legendLayout.visible);assert.ok(measured.legendLayout.scrollWidth<=measured.legendLayout.width+1);
    const stem=id+'-'+profile.width+'-'+(profile.fallback?'fallback':profile.view)+'-x'+x;
    const png=path.join(out,stem+'.png');await page.locator('.bench-stage').screenshot({path:png});
    const panel=path.join(out,stem+'-instrument.png');await page.locator('.bench-instrument').screenshot({path:panel});
    if(measured.svg){await fs.writeFile(path.join(out,stem+'.svg'),measured.svg);delete measured.svg;}
    const entry={id,variant:'ORIGINAL_PUBLISHED',sourceVersion:row.version??1,...profile,x,...measured,screenshot:stem+'.png',screenshotSha256:sha(await fs.readFile(png)),instrumentScreenshot:stem+'-instrument.png',instrumentScreenshotSha256:sha(await fs.readFile(panel))};
    report.cases.push(entry);await fs.appendFile(path.join(out,'completed-cases.jsonl'),JSON.stringify(entry)+'\n');console.log(stem);
   }
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(profile(),before);report.terminalStatus='COMPLETED_DIAGNOSTIC_NOT_ACTIVITY_ACCEPTANCE';
}catch(error){report.terminalStatus='ERROR';report.failure=String(error);throw error;}
finally{
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 await browser?.close();server.kill('SIGTERM');server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(temp,{recursive:true,force:true});
}
