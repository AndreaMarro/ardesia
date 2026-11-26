// Independent technical counterproofs only; no experiment or scientific credit.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const [helper,planFile]=process.argv.slice(2),api=await import(pathToFileURL(helper).href),base=JSON.parse(await fs.readFile(planFile));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const canonical=v=>JSON.stringify(Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0)));
const root=base.baselineBundleRoot,originals=new Map();
for(const name of Object.keys(base.numericalReference.files)){const rel=name.slice('officina-di-fisica/static/'.length);originals.set(rel,await fs.readFile(path.join(root,rel)));}
let checks=0;
async function plan(){
 for(const [rel,raw] of originals)await fs.writeFile(path.join(root,rel),raw);
 const value=structuredClone(base);await refresh(value);return value;
}
async function refresh(value){
 value.numericalReference.manifestSha256=sha(Buffer.from(canonical(value.numericalReference.files)));
 const raw=Buffer.from(JSON.stringify({numericalReference:value.numericalReference}));await fs.writeFile(value.requestFile,raw);value.requestSha256=sha(raw);
}
async function replace(value,rel,source){
 await fs.writeFile(path.join(root,rel),source);value.numericalReference.files['officina-di-fisica/static/'+rel]=sha(Buffer.from(source));await refresh(value);
}
function route(url){const state={aborted:false,response:null};return [state,{request:()=>({url:()=>url}),abort:async()=>state.aborted=true,fulfill:async response=>state.response=response}];}
let p=await plan(),b=await api.loadBaselineReference(p),e=await b.evidence();assert.ok(e.dependencyClosure['js/banchi/voci/modelli/C6.js']);assert.ok(e.dependencyClosure['js/banchi/voci/apparati/campi.js']);checks++;
const rel='js/banchi/voci/modelli/C4.js';let [state,call]=route('http://localhost'+b.namespace+rel);await b.route(call);assert.equal(state.response.status,200);assert.equal(sha(state.response.body),p.numericalReference.files['officina-di-fisica/static/'+rel]);checks++;
for(const suffix of ['?fresh=1','?x=../candidate']){p=await plan();b=await api.loadBaselineReference(p);[state,call]=route('http://localhost'+b.namespace+rel+suffix);await b.route(call);assert.equal(state.aborted,true);await assert.rejects(b.evidence(),/Unpinned baseline/);checks++;}
p=await plan();b=await api.loadBaselineReference(p);const unused=[...originals.keys()].find(name=>!Object.hasOwn((e.dependencyClosure),name));assert.ok(unused);[state,call]=route('http://localhost'+b.namespace+unused);await b.route(call);assert.equal(state.aborted,true);await assert.rejects(b.evidence());checks++;
p=await plan();b=await api.loadBaselineReference(p);[state,call]=route('http://localhost'+b.namespace.replace(p.numericalReference.manifestSha256,'0'.repeat(64))+rel);await b.route(call);assert.equal(state.aborted,true);await assert.rejects(b.evidence());checks++;
p=await plan();[state,call]=route('http://localhost/js/banchi/voci/esperimento.js');b=await api.loadBaselineReference(p);assert.equal(await b.route(call),false);assert.equal(state.response,null);checks++;
p=await plan();await fs.appendFile(path.join(root,rel),'\n');await assert.rejects(api.loadBaselineReference(p),/Baseline bytes drifted/);checks++;
p=await plan();b=await api.loadBaselineReference(p);await fs.appendFile(path.join(root,rel),'\n');[state,call]=route('http://localhost'+b.namespace+rel);await assert.rejects(b.route(call),/Baseline module changed/);await assert.rejects(b.evidence(),/Baseline drift/);checks++;
p=await plan();await replace(p,'js/banchi/voci/esperimento.js',originals.get('js/banchi/voci/esperimento.js').toString()+"\nexport {x} from '/js/candidate.js';\n");await assert.rejects(api.loadBaselineReference(p),/escapes namespace/);checks++;
p=await plan();await replace(p,'js/banchi/voci/esperimento.js',originals.get('js/banchi/voci/esperimento.js').toString()+"\nconst dynamic='./other.js';import(dynamic);\n");await assert.rejects(api.loadBaselineReference(p),/Unknown dynamic/);checks++;
p=await plan();const engines='js/banchi/voci/engines.js';await replace(p,engines,originals.get(engines).toString().replace("'./modelli/' + record.course + '.js'","'./modelli/' + record.unreviewed + '.js'"));await assert.rejects(api.loadBaselineReference(p),/Unreviewed dynamic/);checks++;
p=await plan();p.records=[{record:{engine:{id:'custom'}}}];await assert.rejects(api.loadBaselineReference(p),/External engines/);checks++;
p=await plan();await fs.appendFile(p.requestFile,' ');await assert.rejects(api.loadBaselineReference(p));checks++;
p=await plan();p.numericalReference.typescriptSha256='0'.repeat(64);await refresh(p);await assert.rejects(api.loadBaselineReference(p),/parser bytes drifted/);checks++;
await plan();console.log(JSON.stringify({scope:'independent pure namespace/closure counterproofs; not UI or SCI acceptance',checks,allPassed:true}));
