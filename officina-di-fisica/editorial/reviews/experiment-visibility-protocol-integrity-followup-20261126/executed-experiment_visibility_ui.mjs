// Actual existing bench, ephemeral canonical imports, private owner transport.
// Evidence only: even complete observations never approve an activity.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {chromium} from 'playwright';

export function assertOwnerRecord(saved,prepared){
 const expected={...prepared,version:2,review:'bozza'};delete expected.baseVersion;
 assert.deepEqual(saved,expected,'Full normalized owner record differs from prepared candidate');
}

export function assertObservedControls(measured,state,row){
 const bounded=(actual,expected,label,step,scale=1)=>{
  assert.ok(Number.isFinite(actual)&&Number.isFinite(expected),label+' finite');
  const tolerance=Math.min(Math.abs(step)/4,8*Number.EPSILON*Math.max(scale,1,Math.abs(actual),Math.abs(expected)));
  assert.ok(Math.abs(actual-expected)<=tolerance,label+' requested/observed mismatch: '+actual+' vs '+expected);
 };
 const step=Number(row.record.control.step),min=Number(row.record.control.min);
 const effectiveX=row.clockInput&&state.time!==undefined?state.time:state.x;
 const dom=measured.actualDOMControls.find(c=>c.name==='x');assert.ok(dom,'actual x control missing');
 bounded(Number(dom.value),effectiveX,'DOM x',step);bounded(measured.sourceReplayedX,effectiveX,'source replay x',step);
 if(state.kind==='grid'||!row.clockInput){
  const expectedIndex=Math.round((state.x-min)/step),observedIndex=(measured.sourceReplayedX-min)/step;
  bounded(observedIndex,expectedIndex,'grid index',1,Math.max(1,Math.abs(min),Math.abs(measured.sourceReplayedX))/Math.abs(step));bounded(min+expectedIndex*step,state.x,'requested grid point',step);
 }
 if(state.kind==='auxiliary'){
  const middle=measured.actualDOMControls.find(c=>c.name==='middle'),circuit=measured.actualDOMControls.find(c=>c.name==='circuit');
  assert.ok(middle&&circuit,'actual auxiliary controls missing');bounded(Number(middle.value),state.middle,'middle field',Number(middle.step));assert.equal(circuit.value,state.circuit,'actual circuit state');
 }
 if(row.hasClock){
  const time=state.time??(row.clockInput?state.x:0);
  bounded(measured.sourceReplayedClockTime,time,'source clock time',Math.max(step,1));
  // The existing consumer explicitly serializes this field with toFixed(5).
  bounded(Number(measured.clockReadout),Number(time.toFixed(5)),'DOM clock readout',Math.max(step,1));
 }
}

async function main(){
const info=JSON.parse(await fs.readFile(process.argv[2])),app=info.candidateApp,out=info.output;
const preparedBytes=await fs.readFile(info.prepared),plan=JSON.parse(preparedBytes);
const sha=b=>createHash('sha256').update(b).digest('hex');
const protocolSha=sha(await fs.readFile(fileURLToPath(import.meta.url)));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'cric-visibility-db-'));
const env={...process.env,ASTRA_DATA:data,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',ASTRA_EXTENSIONS:path.join(app,'extensions'),ASTRA_PACKAGES:JSON.stringify(plan.packageFiles),ASTRA_INPUT_FILES:JSON.stringify(plan.inputFiles)};
const fingerprint=()=>JSON.parse(execFileSync('python3',['-B','-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:app,env,encoding:'utf8'}));
assert.deepEqual(fingerprint(),plan.runtimeFingerprint);
const boot=`import json,os,secrets,hashlib,time
from server import store
from server.web import Handler,ThreadingHTTPServer
from tools.corpus_engineering.draft_import import import_drafts
from pathlib import Path
files=json.loads(os.environ['ASTRA_INPUT_FILES']);names=json.loads(os.environ['ASTRA_PACKAGES'])
assert len(files)==4 and len(names)==2 and len(set(names))==2
assert set(Path(next(iter(files))).parent.iterdir())==set(map(Path,files))
checked={name:Path(name).read_bytes() for name in files}
assert all(not Path(name).is_symlink() and hashlib.sha256(raw).hexdigest()==files[name] for name,raw in checked.items())
packages=[json.loads(checked[name]) for name in names]
store.initialize()
with store.connect() as db:
 before=store.encode(store.published(db));count=len(store.published(db))
 old={(r['id'],r['v']):r['payload'] for r in db.execute('SELECT id,v,payload FROM versions')}
 results=[]
 for package in packages:
  a=import_drafts(db,{'id':'owner','role':'autore'},package);b=import_drafts(db,{'id':'owner','role':'autore'},package)
  assert a['saved']==len(package['records']) and b['saved']==0;results.append({'first':a,'second':b})
 assert before==store.encode(store.published(db))
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',k).fetchone()[0]==v for k,v in old.items())
 ticket=secrets.token_urlsafe(32);db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+600))
s=ThreadingHTTPServer(('127.0.0.1',0),Handler)
print(json.dumps({'port':s.server_port,'ticket':ticket,'publishedCount':count,'imports':results}),flush=True)
s.serve_forever()`;
const server=spawn('python3',['-uc',boot],{cwd:app,env,stdio:['ignore','pipe','pipe']});
let browser,stderr='',stopping=false;server.stderr.on('data',b=>stderr+=b);
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{stopping=true;void browser?.close();server.kill('SIGTERM');});
const report={schemaVersion:'1.0.0',phase:'PREPARATORY_REAL_UI_EVIDENCE_REQUIRES_INDEPENDENT_SCI_REVIEW',
 sourceCommit:plan.sourceCommit,requestSha256:plan.requestSha256,course:plan.course,
 runtimeFingerprint:plan.runtimeFingerprint,protocolSha256:protocolSha,preparedSha256:sha(preparedBytes),
 cases:[],errors:[],activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
const key=(r,p,kind,index)=>[r.id,r.variant,p.width,p.view,kind,...(index===undefined?[]:[index])].join('|');
await fs.mkdir(path.join(out,'cases'),{recursive:true});await fs.mkdir(path.join(out,'screens'),{recursive:true});
async function image(bytes){const h=sha(bytes),rel='screens/'+h+'.png';try{await fs.writeFile(path.join(out,rel),bytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;assert.equal(sha(await fs.readFile(path.join(out,rel))),h);}return{file:rel,sha256:h};}
async function save(caseKey,value){
 assert.ok(plan.expectedCaseKeys.includes(caseKey),'Unknown planned case');
 const record={schemaVersion:'1.0.0',caseKey,sourceCommit:plan.sourceCommit,runtimeSha256:plan.runtimeFingerprint.sha256,
  requestSha256:plan.requestSha256,protocolSha256:protocolSha,...value,
  evidenceScope:plan.scope??'COMPLETE_REQUESTED_COURSE',scientificApproval:false,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
 const raw=Buffer.from(JSON.stringify(record)+'\n'),rel='cases/'+sha(Buffer.from(caseKey))+'.json';
 await fs.writeFile(path.join(out,rel),raw);report.cases.push({caseKey,file:rel,sha256:sha(raw),technicalOk:record.technicalOk});
 await fs.appendFile(path.join(out,'completed-cases.jsonl'),JSON.stringify(report.cases.at(-1))+'\n');
 if(report.cases.length%25===0){const stat=await fs.statfs(out);assert.ok(stat.bavail*stat.bsize>=2*1024**3,'Free disk below2GiB');console.log(JSON.stringify({course:plan.course,observed:report.cases.length,planned:plan.expectedCaseKeys.length}));}
}

// This source-replay observes the model associated with the actual DOM input.
// It never claims introspection of private GPU camera/state. Raw PNGs remain.
async function observe({row,profile,requestedX,requestedTime,auxiliary}){
 const {esperienza}=await import('/js/banchi/voci/esperimento.js');
 const activity=await esperienza(row);
 const T=await import('/vendor/three-r180/three.module.min.js');
 const {posizionaEtichetta}=await import('/js/banchi/etichette.js');
 const {n}=await import('/js/banchi/misure.js');
 const {piloti}=await import('/js/banchi/quaderno.js');
 const pilot=piloti[row.id];
 const controls=[...document.querySelectorAll('.bench-params input,.bench-params select')].map(e=>({name:e.name,value:e.value,min:e.min,max:e.max,step:e.step,kind:e.tagName}));
 const xNode=controls.find(e=>e.name==='x');let x=Number(xNode.value);
 let time=activity.clock?(activity.clock.input?x:requestedTime??0):undefined;
 let model=activity.model,s=model.solve({x}),spec=activity.scene.spec,elements;
 if(pilot==='induzione'){
  const m=await import('/js/banchi/modelli/induzione.js');const scene=await import('/js/banchi/scene/induzione.js');
  const p=Object.fromEntries(controls.map(c=>[c.name,c.name==='circuit'?c.value:Number(c.value)]));
  model=m;s=m.solve(p);spec=scene.spec;time=requestedTime??0;
  // The pilot uses a separate scene, not the generic experiment apparatus.
  // Collect real scene build commands and group transforms without rendering
  // an alternate scene or mutating the consumer.
  const root=new T.Group(),commands=[];
  const add=(kind,props,parent=root)=>commands.push({kind,...props,parent});
  const b={T,base:(w,d)=>add('box',{p:[0,-.11,0],size:[w,.22,d],c:0xfff4d5,alpha:1}),
   box:(p,size,c,parent,alpha=1)=>add('box',{p,size,c,alpha},parent),ball:(p,r,c,parent,alpha=1)=>add('ball',{p,r,c,alpha},parent),
   rod:(a,b,r,c,parent,alpha=1,r2=r,openEnded=false)=>add('rod',{a,b,r,c,alpha,r2,openEnded},parent),
   arrow:(a,b,c,parent,thin=.028)=>add('arrow',{a,b,c,thin,alpha:1},parent),
   line:(points,c,parent,dash=false)=>add('line',{points,c,dash},parent),
   label:(p,text,c=0x302a3e,parent)=>add('label',{p,text,c},parent),
   group:(parent=root)=>{const g=new T.Group();parent.add(g);return g;},
   ring:(p,r,plane,c,parent)=>add('line',{points:Array.from({length:65},(_,i)=>{const a=i*Math.PI/32;return p.map((v,j)=>v+(plane==='xz'?[r*Math.cos(a),0,r*Math.sin(a)]:plane==='xy'?[r*Math.cos(a),r*Math.sin(a),0]:[0,r*Math.cos(a),r*Math.sin(a)])[j]);}),c},parent)};
  const action=scene.build(b,p,s,1);action?.(time);root.updateMatrixWorld(true);
  elements=commands.filter(e=>{let p=e.parent;while(p){if(!p.visible)return false;p=p.parent;}return true;}).map(e=>{const {parent,...value}=e;return{...value,sourceGroupMatrix:parent.matrixWorld.toArray()};});
 }else elements=activity.elements(x,1,time);
 const canvas=document.querySelector('.bench-stage canvas'),svg=document.querySelector('[data-drawing]>svg');
 const rect=(profile.fallback?svg:canvas).getBoundingClientRect(),legend=document.querySelector('[data-legend]');
 const r={requestedX,requestedTime:requestedTime??null,sourceReplayedX:x,sourceReplayedClockTime:time??null,
  actualDOMControls:controls,model:s,spec,elements,pilot:pilot??null,
  stateMeasurementScope:'Exact source replay from observed controls/interaction, not private GPU-state introspection',
  actualRenderer:document.querySelector('[data-display]').textContent,canvas:{width:rect.width,height:rect.height},
  legend:legend.textContent,legendLayout:{visible:legend.getBoundingClientRect().height>0,width:legend.clientWidth,scrollWidth:legend.scrollWidth},
  readings:document.querySelector('[data-readings]').textContent,
  guide:Object.fromEntries(['step-title','explain','equation'].map(k=>[k,document.querySelector('[data-'+k+']').textContent])),
  clockReadout:document.querySelector('[data-instant]').value,
  svg:profile.fallback?svg.outerHTML:null,
  fullGlyphAcceptance:'NOT_GRANTED; raw primitives/group transforms and native32facet source are preserved for independent checks'};
 if(!profile.fallback){
  const aspect=rect.width/rect.height,span=Math.max(spec.height,spec.width/aspect);
  const camera=new T.OrthographicCamera(-span*aspect/2,span*aspect/2,span/2,-span/2,.05,100),target=new T.Vector3(...spec.target);
  const direction=new T.Vector3(...(profile.view==='top'?[0,1,.00001]:profile.view==='side'?[0,0,1]:spec.eye));
  camera.position.copy(target).addScaledVector(direction.normalize(),14);camera.up.set(0,1,0);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  const project=p=>{const v=new T.Vector3(...p).project(camera);return{x:(1+v.x)*rect.width/2,y:(1-v.y)*rect.height/2,depth:v.z};};
  const world=(p,e)=>e.sourceGroupMatrix?new T.Vector3(...p).applyMatrix4(new T.Matrix4().fromArray(e.sourceGroupMatrix)).toArray():p;
  const occupied=[],ctx=document.createElement('canvas').getContext('2d');ctx.font='600 42px Arial';const pixels=rect.height/span;
  r.labels=elements.filter(e=>e.kind==='label').map(e=>{const center=project(world(e.p,e)),textureWidth=Math.ceil(ctx.measureText(e.text).width)+32,h=Math.max(20,.33*pixels),w=h*textureWidth/68;
   if(center.x<0||center.x>rect.width||center.y<0||center.y>rect.height)return{...e,notPositionedOutsideViewport:true};
   return{...e,center,textureWidth,box:posizionaEtichetta(center.x,center.y,w,h,rect.width,rect.height,occupied)};});
  r.nativeGlyphs=[];
  for(const [index,e]of elements.entries())if(e.kind==='arrow'){
   const a=new T.Vector3(...e.a),b=new T.Vector3(...e.b),delta=b.clone().sub(a),length=delta.length();if(length<.012)continue;
   const u=delta.clone().normalize(),joint=b.clone().addScaledVector(u,-Math.min(.24,length*.32)),thin=e.thin??.028;
   const parts=[];
   for(const [start,end,radius,topRadius]of [[a,joint,thin,thin],[joint,b,thin*2.9,0]]){
    const d=end.clone().sub(start),len=d.length(),mobile=Boolean(activity.clock)&&!pilot;
    const geo=mobile?new T.CylinderGeometry(topRadius/radius,1,1,32,1,false):new T.CylinderGeometry(topRadius,radius,Math.max(.0001,len),32,1,false);
    const matrix=new T.Matrix4().compose(start.clone().add(end).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()),mobile?new T.Vector3(radius,len,radius):new T.Vector3(1,1,1));
    if(e.sourceGroupMatrix)matrix.premultiply(new T.Matrix4().fromArray(e.sourceGroupMatrix));
    const position=geo.getAttribute('position'),vertices=[],seen=new Set();
    for(let i=0;i<position.count;i++){const p=new T.Vector3().fromBufferAttribute(position,i).applyMatrix4(matrix).toArray(),k=JSON.stringify(p);if(!seen.has(k)){seen.add(k);vertices.push(p);}}
    parts.push({vertices,primitive:'closed32radialCylinderGeometry',radius,topRadius,sourceMobileUnitGeometry:mobile});geo.dispose();
   }
   const tip=project(world(e.b,e));r.nativeGlyphs.push({elementIndex:index,tail:world(e.a,e),tip:world(e.b,e),parts,tipPixels:tip,
    tipInsideOpaqueLabel:r.labels.filter(l=>l.box&&Math.abs(tip.x-l.box.x)<l.box.w/2&&Math.abs(tip.y-l.box.y)<l.box.h/2).map(l=>({text:l.text,box:l.box})),
    vertexViewportBounds:parts.flatMap(p=>p.vertices).map(project).reduce((a,p)=>({minX:Math.min(a.minX,p.x),maxX:Math.max(a.maxX,p.x),minY:Math.min(a.minY,p.y),maxY:Math.max(a.maxY,p.y)}),{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity}),
    scope:'Full actual32facet vertex geometry; label-tip samples are not a whole-surface/camera-occlusion clearance proof'});
  }
  r.sourceDerivedCamera={view:profile.view,position:camera.position.toArray(),target:target.toArray(),zoom:1,matrixWorld:camera.matrixWorld.toArray(),projectionMatrix:camera.projectionMatrix.toArray()};
 }
 return r;
}

try{
 const raw=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>{clean();reject(Error('boot timeout '+stderr));},30000);const take=b=>{text+=b;if(text.includes('\n')){clean();resolve(text.trim());}};const end=()=>{clean();reject(Error('boot exit '+stderr));};function clean(){clearTimeout(timer);server.stdout.off('data',take);server.off('exit',end);}server.stdout.on('data',take);server.once('exit',end);});
 const {port,ticket,...importEvidence}=JSON.parse(raw),base='http://127.0.0.1:'+port;report.canonicalImport=importEvidence;
 browser=await chromium.launch({...(process.env.ASTRA_CHROME?{executablePath:process.env.ASTRA_CHROME}:{channel:'chrome'}),args:['--enable-unsafe-swiftshader']});report.browserVersion=browser.version();
 const guest=await browser.newContext();
 for(const filename of plan.packageFiles){const pkg=JSON.parse(await fs.readFile(filename));for(const r of pkg.records){const response=await guest.request.get(base+'/api/item/'+r.id);assert.ok([200,403].includes(response.status()));if(response.status()===200)assert.equal((await response.json()).version,r.baseVersion);}for(const a of pkg.assets)assert.equal((await guest.request.get(base+'/asset/'+a.id)).status(),403);}
 await guest.close();report.guestIsolation='ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403';let ownerState;
 for(const profile of plan.profiles){
  const context=await browser.newContext({viewport:{width:profile.width,height:1000},reducedMotion:'reduce',bypassCSP:true,...(ownerState?{storageState:ownerState}:{})});
  await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  if(profile.fallback)await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){return k.includes('webgl')?null:get.call(this,k,...a);};});
  if(!ownerState){
   assert.ok((await context.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket}})).ok());ownerState=await context.storageState();
   const checked=[];for(const expected of plan.draftRecords){const response=await context.request.get(base+'/api/author/item/'+expected.id);assert.ok(response.ok());const text=await response.text();assertOwnerRecord(JSON.parse(text).record,expected);checked.push({id:expected.id,version:2,responseBytesSha256:sha(Buffer.from(text))});}
   assert.equal(checked.length,9);report.fullOwnerRecordIdentity={scope:'All nine complete normalized owner records, no cross-language canonical digest',records:checked};
  }
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>report.errors.push(String(e)));
  for(const r of plan.records){
   let loaded=false;const common={id:r.id,variant:r.variant,profile,sourceSha256:r.sourceSha256,candidateSha256:r.candidateSha256,originalJudgment:r.originalJudgment};
   const live=await context.request.get(base+'/api/item/'+r.id);assert.ok(live.ok());
   const published=await live.json();for(const field of ['control','measure','references','apparatus','course','kind','engine'])assert.deepEqual(published[field],r.record[field],'Published physical identity drift: '+field);
   if(r.variant==='draft'){
    const owner=await context.request.get(base+'/api/author/item/'+r.id);assert.ok(owner.ok());const saved=(await owner.json()).record;
    assertOwnerRecord(saved,r.record);
    await page.route('**/api/item/'+r.id,route=>route.fulfill({json:saved}));
   }
   try{
    await page.goto('about:blank');await page.goto(base+'/#banco/'+r.id);await page.locator('[data-predict]').waitFor({state:'visible'});
    await page.locator('[name=prediction]').nth(r.sourcePrediction).check();await page.locator('[data-predict] button').click();
    await page.waitForFunction(f=>document.querySelector('[data-display]')?.textContent===(f?'Tavola di misura':'3D interattivo'),profile.fallback);
    if(!profile.fallback)await page.locator('[data-view="'+profile.view+'"]').click();
    const phases=[];for(let i=1;i<=4;i++){await page.locator('[data-phase="'+i+'"]').click();phases.push(await page.locator('[data-guide]').innerText());}
    const forms=page.locator('[data-check]');assert.equal(await forms.count(),r.questions.length);const questions=[];
    for(const [i,q]of r.questions.entries()){
     const form=forms.nth(i),prompt=await form.locator('p').first().textContent();if(q.prompt!==null)assert.equal(prompt,q.prompt);
     await form.locator('[name=answer]').fill(q.input.replace('.',','));await form.locator('button').click();const status=await form.locator('[role=status]').textContent();
     assert.equal(status.startsWith('Corretto. '),q.expectedAccepted);questions.push({...q,actualPrompt:prompt,status});
    }
    await page.locator('[data-phase="3"]').click();
    const panel=page.locator('[data-authored-reading]');let reading=null;
    if(await panel.count()){
     await panel.locator(':scope > summary').click();await page.waitForFunction(()=>document.querySelector('[data-authored-reading] .lettura-inizia'));
     for(const img of await panel.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}
     await panel.locator('.lettura-inizia').click();await panel.locator('.lettura-tutto').click();await page.evaluate(()=>document.fonts.ready);
     const metrics=await panel.evaluate(el=>({formulas:[...el.querySelectorAll('.math')].map(f=>({width:f.clientWidth,scroll:f.scrollWidth,typeset:f.querySelector('.katex-html')?.getBoundingClientRect().width??0})),figures:el.querySelectorAll('img').length}));
     assert.ok(metrics.formulas.length>=r.record.blocks.filter(b=>b.type==='formula').length);assert.ok(metrics.figures>=r.record.blocks.filter(b=>b.type==='figure').length);
     assert.ok(metrics.formulas.every(f=>f.typeset>0&&f.scroll<=f.width+1&&f.typeset<=f.width+1));reading=metrics;await panel.locator(':scope > summary').click();
    }
    await page.locator('[data-phase="2"]').click();const legend=page.locator('.scene-key');await legend.locator('summary').focus();if(!await legend.evaluate(e=>e.open))await page.keyboard.press('Enter');
    await page.evaluate(()=>document.fonts.ready);await page.addScriptTag({path:path.join(app,'node_modules/axe-core/axe.min.js')});
    const axe=await page.locator('.bench-room').evaluate(async el=>(await window.axe.run(el,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})));
    assert.deepEqual(axe,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1));
    await save(key(r,profile,'setup'),{...common,technicalOk:true,phases,questions,reading,axe,screenshots:[await image(await page.locator('.bench-instrument').screenshot())]});loaded=true;
   }catch(error){await save(key(r,profile,'setup'),{...common,technicalOk:false,error:String(error),screenshots:[]});}
   const states=[...r.grid.map((x,i)=>({kind:'grid',index:i,x})),...r.clockCases.map((c,i)=>({kind:'clock',index:i,x:r.grid[c.gridIndex],time:c.time})),...r.auxiliaryCases.map((c,i)=>({kind:'auxiliary',index:i,...c}))];
   for(const state of states){
    if(stopping)throw Error('Interrupted; no complete evidence');const caseKey=key(r,profile,state.kind,state.index);
    if(!loaded){await save(caseKey,{...common,technicalOk:false,error:'Setup failed; state not observed',screenshots:[]});continue;}
    try{
     await page.locator('[name=x]').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},state.x);
     if(state.kind==='auxiliary')for(const name of ['middle','circuit'])await page.locator('[name='+name+']').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},state[name]);
     if(r.hasClock){const time=state.time??(r.clockInput?state.x:0);await page.locator('[data-instant]').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('change',{bubbles:true}));},time);}
     await page.locator('.bench-stage').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     const measured=await page.evaluate(observe,{row:r.record,profile,requestedX:state.x,requestedTime:state.time,auxiliary:state.kind==='auxiliary'});
     assertObservedControls(measured,state,r);
     assert.equal(measured.actualRenderer,profile.fallback?'Tavola di misura':'3D interattivo');assert.ok(measured.legendLayout.visible&&measured.legendLayout.scrollWidth<=measured.legendLayout.width+1);
     if(state.kind==='grid')assert.ok(measured.model.y===r.expectedValues[state.index],'Frozen independently reviewed numerical state drifted');
     const screenshot=await image(await page.locator('.bench-stage').screenshot());await save(caseKey,{...common,technicalOk:true,interaction:state,...measured,screenshots:[screenshot]});
    }catch(error){await save(caseKey,{...common,technicalOk:false,interaction:state,error:String(error),screenshots:[]});}
   }
   if(r.variant==='draft')await page.unroute('**/api/item/'+r.id);
  }
  await context.close();
 }
 assert.deepEqual(fingerprint(),plan.runtimeFingerprint);assert.deepEqual(report.errors,[]);
 assert.equal(report.cases.length,plan.expectedCaseKeys.length);assert.equal(new Set(report.cases.map(c=>c.caseKey)).size,report.cases.length);
 assert.ok(report.cases.every(c=>c.technicalOk),'A requested state was not observed or failed checks');
 report.technicalStatus='ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED';
}catch(error){report.technicalStatus='FAIL';report.failure=String(error);process.exitCode=1;}
finally{
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 await browser?.close();server.kill('SIGTERM');server.stdout.destroy();server.stderr.destroy();server.unref();await fs.rm(data,{recursive:true,force:true});
}

}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
