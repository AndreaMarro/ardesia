import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,copyFile,appendFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const app=fileURLToPath(new URL('../../',import.meta.url));
const sha=x=>createHash('sha256').update(x).digest('hex');
const childProtocol=`import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const sha=x=>createHash('sha256').update(x).digest('hex');
const root=process.cwd(),batch=process.argv[2],out=process.env.ASTRA_RESULTS;
const control=JSON.parse(await readFile('fixture-control.json','utf8'))[batch]||{};
await appendFile('fixture-events.jsonl',JSON.stringify({batch,event:'start',pid:process.pid})+'\\n');
if(control.delay)await new Promise(r=>setTimeout(r,control.delay));
const raw=await readFile(path.join('editorial/batches',batch+'.json')),pkg=JSON.parse(raw);
const runtime=JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{encoding:'utf8'}));
const records=[1440,768,320].flatMap(width=>pkg.records.map(row=>({id:row.id,width,figureCount:1,violations:[],formulas:[{width:100,scroll:100,typeset:80},{width:100,scroll:100,typeset:90}],overflow:0})));
if(control.mode==='duplicate')records[1]={...records[0]};
if(control.mode==='missing')records.pop();
if(control.mode==='overflow')records[0].overflow=2;
if(control.mode==='formula')records[0].formulas[0].typeset=102;
if(control.mode==='violation')records[0].violations=[{id:'color-contrast',targets:['p']}];
if(control.mode==='missing-formula')records[0].formulas=[];
if(control.mode==='missing-figure')records[0].figureCount=0;
if(control.mode==='unknown-id')records[0].id='unregistered';
if(control.mode==='nonfinite')records[0].formulas[0].typeset=null;
const report={schemaVersion:'1.0.0',batch,previewOnly:true,packageFileSha256:sha(raw),runtimeFingerprint:runtime,testSha256:sha(await readFile(fileURLToPath(import.meta.url))),browserVersion:'fixture-browser-1',protectedAssets:pkg.assets.map(a=>a.id),records};
await mkdir(out,{recursive:true});
if(control.mode!=='no-report')await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\\n');
if(control.changePackage){const file=path.join('editorial/batches',control.changePackage+'.json');const p=JSON.parse(await readFile(file,'utf8'));p.records[0].title+=' changed';await writeFile(file,JSON.stringify(p));}
if(control.appendRegistry){const r=JSON.parse(await readFile('editorial/batches/registry.json','utf8'));r.batches.push({id:control.appendRegistry,questionIds:[1,2].map(n=>'AR-'+control.appendRegistry+'-'+n)});await writeFile('editorial/batches/registry.json',JSON.stringify(r)+'\\n');}
if(control.holdAfterReport)await new Promise(r=>setTimeout(r,control.holdAfterReport));
await appendFile('fixture-events.jsonl',JSON.stringify({batch,event:'end',pid:process.pid})+'\\n');
process.exit(control.mode==='failed-after-report'?7:0);
`;
async function fixture(t,ids=['sample-001']){
 const root=await mkdtemp(path.join(tmpdir(),'corpus-resume-test-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 for(const folder of ['tests/corpus','tools/corpus_engineering','editorial/batches','static'])await mkdir(path.join(root,folder),{recursive:true});
 await copyFile(path.join(app,'tests/corpus/browser-batches.mjs'),path.join(root,'tests/corpus/browser-batches.mjs'));
 try{await copyFile(path.join(app,'tests/corpus/browser-batches-resume.mjs'),path.join(root,'tests/corpus/browser-batches-resume.mjs'));}catch(e){if(e.code!=='ENOENT')throw e;}
 await copyFile(path.join(app,'tools/corpus_engineering/runtime_fingerprint.py'),path.join(root,'tools/corpus_engineering/runtime_fingerprint.py'));
 await writeFile(path.join(root,'tests/corpus/browser-drafts.mjs'),childProtocol);
 await writeFile(path.join(root,'package.json'),'{"type":"module","name":"resume-test-fixture","private":true}\n');
 await writeFile(path.join(root,'fixture-control.json'),'{}\n');
 await writeFile(path.join(root,'fixture-events.jsonl'),'');
 await writeFile(path.join(root,'static/renderer.js'),'export const fixture = 1;\n');
 const asset={id:'a'.repeat(64),name:'fixture.svg',type:'image/svg+xml',data:Buffer.from('<svg/>').toString('base64')};
 async function addPackage(id){
  const pkg={schema:'astra/1',records:[1,2].map(n=>({id:`AR-${id}-${n}`,kind:'question',title:`Sample ${n}`,blocks:[{type:'formula',text:'1+1=2'},{type:'figure',src:'/asset/'+asset.id}],promptBlocks:[{type:'formula',text:'x=1'}]})),assets:[asset]};
  await writeFile(path.join(root,'editorial/batches',id+'.json'),JSON.stringify(pkg,null,2)+'\n');
 }
 for(const id of ids)await addPackage(id);
 await writeFile(path.join(root,'editorial/batches/registry.json'),JSON.stringify({schemaVersion:'1.0.0',batches:ids.map(id=>({id,questionIds:[1,2].map(n=>`AR-${id}-${n}`)})),activityBatches:[]})+'\n');
 const output=path.join(root,'results');
 const launch=(workers=2)=>{
  const child=spawn(process.execPath,[path.join(root,'tests/corpus/browser-batches.mjs')],{cwd:root,env:{...process.env,ASTRA_RESULTS:output,ASTRA_BROWSER_WORKERS:String(workers)},stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
  const timer=setTimeout(()=>child.kill('SIGKILL'),15000);
  const done=new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',(code,signal)=>{clearTimeout(timer);resolve({code,signal,stdout,stderr});});});
  return {child,done};
 };
 const run=workers=>launch(workers).done;
 const events=async()=>JSON.parse('['+(await readFile(path.join(root,'fixture-events.jsonl'),'utf8')).trim().split('\n').filter(Boolean).join(',')+']');
 const starts=async()=> (await events()).filter(x=>x.event==='start').map(x=>x.batch);
 const control=async settings=>writeFile(path.join(root,'fixture-control.json'),JSON.stringify(settings)+'\n');
 return{root,output,run,launch,starts,events,control,addPackage,marker:id=>path.join(output,id,'completion.json'),report:id=>path.join(output,id,'report.json')};
}

test('a second run reuses completed identical batches instead of spawning renderers again',async t=>{
 const f=await fixture(t);assert.equal((await f.run()).code,0);assert.equal((await f.run()).code,0);
 assert.deepEqual(await f.starts(),['sample-001']);
 const marker=JSON.parse(await readFile(f.marker('sample-001'),'utf8'));assert.equal(marker.terminalExitCode,0);
});

async function jsonFile(file,mutate){const value=JSON.parse(await readFile(file,'utf8'));mutate(value);await writeFile(file,JSON.stringify(value,null,2)+'\n');}
async function absent(file){await assert.rejects(readFile(file),{code:'ENOENT'});}
async function waitFor(file){for(let n=0;n<100;n++){try{await readFile(file);return;}catch(e){if(e.code!=='ENOENT')throw e;}await new Promise(r=>setTimeout(r,20));}throw Error('Fixture did not write '+file);}

test('a report written before terminal exit is not a completion marker',async t=>{
 const f=await fixture(t);await f.control({'sample-001':{holdAfterReport:700}});
 const running=f.launch();await waitFor(f.report('sample-001'));await absent(f.marker('sample-001'));
 assert.equal((await running.done).code,0);await readFile(f.marker('sample-001'));
});

test('absent or nonterminal markers always rerender',async t=>{
 const f=await fixture(t);assert.equal((await f.run()).code,0);
 await rm(f.marker('sample-001'));assert.equal((await f.run()).code,0);
 await jsonFile(f.marker('sample-001'),m=>m.terminalExitCode=7);assert.equal((await f.run()).code,0);
 await jsonFile(f.marker('sample-001'),m=>m.signal='SIGTERM');assert.equal((await f.run()).code,0);
 assert.equal((await f.starts()).length,4);
});

test('nonzero exit after a complete passing report never writes a marker',async t=>{
 const f=await fixture(t);await f.control({'sample-001':{mode:'failed-after-report'}});
 assert.notEqual((await f.run()).code,0);await readFile(f.report('sample-001'));await absent(f.marker('sample-001'));
 assert.notEqual((await f.run()).code,0);assert.equal((await f.starts()).length,2);
 await f.control({});assert.equal((await f.run()).code,0);assert.equal((await f.starts()).length,3);
});

test('exit zero without a fresh report cannot certify an old report',async t=>{
 const f=await fixture(t);assert.equal((await f.run()).code,0);await rm(f.marker('sample-001'));
 await f.control({'sample-001':{mode:'no-report'}});assert.notEqual((await f.run()).code,0);
 await absent(f.marker('sample-001'));await absent(f.report('sample-001'));
});

for(const mode of ['duplicate','missing','unknown-id','violation','overflow','formula','nonfinite','missing-formula','missing-figure']){
 test('terminal exit zero rejects invalid evidence: '+mode,async t=>{
  const f=await fixture(t);await f.control({'sample-001':{mode}});
  const result=await f.run();assert.notEqual(result.code,0,result.stdout+result.stderr);
  await readFile(f.report('sample-001'));await absent(f.marker('sample-001'));
 });
}

test('package changes invalidate only their own batch',async t=>{
 const f=await fixture(t,['sample-001','sample-002']);assert.equal((await f.run()).code,0);
 await jsonFile(path.join(f.root,'editorial/batches/sample-001.json'),p=>p.records[0].title+=' changed');
 assert.equal((await f.run()).code,0);const starts=await f.starts();
 assert.equal(starts.filter(x=>x==='sample-001').length,2);assert.equal(starts.filter(x=>x==='sample-002').length,1);
});

for(const file of ['static/renderer.js','tests/corpus/browser-drafts.mjs','tools/corpus_engineering/runtime_fingerprint.py','tests/corpus/browser-batches.mjs','tests/corpus/browser-batches-resume.mjs']){
 test('changed input invalidates completed batches: '+file,async t=>{
  const f=await fixture(t);assert.equal((await f.run()).code,0);
  await appendFile(path.join(f.root,file),file.endsWith('.py')?'\n# changed protocol\n':'\n// changed input\n');
  assert.equal((await f.run()).code,0);assert.equal((await f.starts()).length,2);
 });
}

test('report bytes are bound even when JSON meaning is unchanged',async t=>{
 const f=await fixture(t);assert.equal((await f.run()).code,0);await appendFile(f.report('sample-001'),'\n');
 assert.equal((await f.run()).code,0);assert.equal((await f.starts()).length,2);
});

test('rebound report hashes cannot disguise duplicate coverage',async t=>{
 const f=await fixture(t);assert.equal((await f.run()).code,0);
 await jsonFile(f.report('sample-001'),r=>r.records[1]={...r.records[0]});
 const digest=sha(await readFile(f.report('sample-001')));await jsonFile(f.marker('sample-001'),m=>m.reportSha256=digest);
 assert.equal((await f.run()).code,0);assert.equal((await f.starts()).length,2);
});

test('registry additions deny global success but retain valid individual markers',async t=>{
 const f=await fixture(t);await f.addPackage('sample-002');await f.control({'sample-001':{appendRegistry:'sample-002'}});
 const first=await f.run();assert.notEqual(first.code,0);assert.match(first.stderr,/registry changed/);
 await readFile(f.marker('sample-001'));await f.control({});assert.equal((await f.run()).code,0);
 assert.deepEqual(await f.starts(),['sample-001','sample-002']);
});

test('a cached package changed during another batch denies global success',async t=>{
 const f=await fixture(t,['sample-001','sample-002']);assert.equal((await f.run(1)).code,0);
 await rm(f.marker('sample-002'));await f.control({'sample-002':{changePackage:'sample-001'}});
 assert.notEqual((await f.run(1)).code,0);await readFile(f.marker('sample-002'));
 await f.control({});assert.equal((await f.run(1)).code,0);
 const starts=await f.starts();assert.equal(starts.filter(x=>x==='sample-001').length,2);assert.equal(starts.filter(x=>x==='sample-002').length,2);
});

test('activity revision packages use the same markers and duplicate IDs are rejected',async t=>{
 const f=await fixture(t);await f.addPackage('activity-002');
 await jsonFile(path.join(f.root,'editorial/batches/registry.json'),r=>r.activityBatches=[{revisionPackage:'activity-002',activityIds:['AR-activity-002-1','AR-activity-002-2','historical-unrevised-id']}]);
 assert.equal((await f.run()).code,0);assert.equal((await f.run()).code,0);assert.equal((await f.starts()).length,2);
 await jsonFile(path.join(f.root,'editorial/batches/registry.json'),r=>r.activityBatches.push({revisionPackage:'sample-001'}));
 assert.notEqual((await f.run()).code,0);assert.equal((await f.starts()).length,2);
});

test('bounded workers keep real processes concurrent without exceeding the chosen limit',async t=>{
 const f=await fixture(t,['sample-001','sample-002','sample-003','sample-004']);
 await f.control(Object.fromEntries([1,2,3,4].map(n=>['sample-00'+n,{delay:150}])));
 assert.equal((await f.run(2)).code,0);let active=0,maximum=0;
 for(const event of await f.events()){active+=event.event==='start'?1:-1;maximum=Math.max(maximum,active);}
 assert.equal(maximum,2);assert.equal(active,0);
 for(const workers of [0,5])assert.notEqual((await f.run(workers)).code,0);
});

for(const [name,mutate] of [
 ['package digest',r=>r.packageFileSha256='0'.repeat(64)],
 ['protocol digest',r=>r.testSha256='0'.repeat(64)],
 ['runtime file map',r=>r.runtimeFingerprint.files['static/renderer.js']='0'.repeat(64)],
 ['protected assets',r=>r.protectedAssets=[]],
 ['unsupported viewport',r=>r.records[0].width=1024],
 ['missing rendered formula',r=>r.records[0].formulas.pop()],
 ['invalid formula dimensions',r=>r.records[0].formulas[0].width=null]
]){
 test('renewing the report hash cannot hide invalid '+name,async t=>{
  const f=await fixture(t);assert.equal((await f.run()).code,0);
  await jsonFile(f.report('sample-001'),mutate);
  const digest=sha(await readFile(f.report('sample-001')));await jsonFile(f.marker('sample-001'),m=>m.reportSha256=digest);
  assert.equal((await f.run()).code,0);assert.equal((await f.starts()).length,2);
 });
}

test('all four permitted workers render and then reuse their own evidence',async t=>{
 const f=await fixture(t,['sample-001','sample-002','sample-003','sample-004']);
 await f.control(Object.fromEntries([1,2,3,4].map(n=>['sample-00'+n,{delay:300}])));
 assert.equal((await f.run(4)).code,0);let active=0,maximum=0;
 for(const event of await f.events()){active+=event.event==='start'?1:-1;maximum=Math.max(maximum,active);}
 assert.equal(maximum,4);assert.equal(active,0);assert.equal((await f.run(4)).code,0);assert.equal((await f.starts()).length,4);
});

test('question registry IDs must exactly match the package before render and on resume',async t=>{
 const f=await fixture(t);const registry=path.join(f.root,'editorial/batches/registry.json');
 await jsonFile(registry,r=>r.batches[0].questionIds.pop());
 assert.notEqual((await f.run()).code,0);assert.deepEqual(await f.starts(),[]);
 await jsonFile(registry,r=>r.batches[0].questionIds.push('AR-sample-001-2'));
 assert.equal((await f.run()).code,0);
 await jsonFile(registry,r=>r.batches[0].questionIds.push('AR-missing-record'));
 assert.notEqual((await f.run()).code,0);assert.deepEqual(await f.starts(),['sample-001']);
});

test('activity revision candidates must belong to the declared activity IDs, including on resume',async t=>{
 const f=await fixture(t);await f.addPackage('activity-002');const registry=path.join(f.root,'editorial/batches/registry.json');
 await jsonFile(registry,r=>r.activityBatches=[{revisionPackage:'activity-002',activityIds:['AR-activity-002-1','historical-unrevised-id']}]);
 assert.notEqual((await f.run()).code,0);assert.deepEqual(await f.starts(),['sample-001']);
 await jsonFile(registry,r=>r.activityBatches[0].activityIds.push('AR-activity-002-2'));
 assert.equal((await f.run()).code,0);
 await jsonFile(registry,r=>r.activityBatches[0].activityIds=['historical-unrevised-id']);
 assert.notEqual((await f.run()).code,0);assert.deepEqual(await f.starts(),['sample-001','activity-002']);
});
