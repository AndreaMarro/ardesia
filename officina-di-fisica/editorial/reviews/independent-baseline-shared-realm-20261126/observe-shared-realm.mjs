// Independent pure-model counterexample; no app DB, rendering or activity credit.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {loadBaselineReference,assertStrictBaselineParity,REFERENCE_KIND} from './frozen-b1-helper.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../..');
const app='/private/tmp/cric-root-visibility-bootstrap-final-c6-20261126/candidate-app';
const candidateRef='64aef05bef5ca7ebff8491060762dd4cac0cbb34',sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:root,env:{...process.env,GIT_NO_LAZY_FETCH:'1'}});
const plan=JSON.parse(await fs.readFile(path.join(here,'frozen-b1-plan.json')));
const source=plan.records.find(r=>r.id==='SIM-C4-L10-01').record;
const candidateFiles=new Map();
for(const name of Object.keys(plan.numericalReference.files)){
 if(!name.endsWith('.js'))continue;
 const rel=name.slice('officina-di-fisica/static/'.length),bytes=git('show',candidateRef+':'+name);
 assert.deepEqual(await fs.readFile(path.join(app,'static',rel)),bytes,'Candidate app module differs from immutable Git');
 candidateFiles.set(rel,{bytes,sha256:sha(bytes)});
}
assert.equal(candidateFiles.size,80);
const baseline=await loadBaselineReference(plan),served=new Map(),errors=[];
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/'){res.writeHead(200,{'content-type':'text/html'});res.end('<!doctype html><title>Independent same-realm pure model</title>');return;}
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const wrapped={request:()=>({url:()=>url.href}),abort:async()=>{res.writeHead(403);res.end();},fulfill:async r=>{res.writeHead(r.status,{'content-type':r.contentType});res.end(r.body);}};
  if(await baseline.route(wrapped))return;
  const rel=url.pathname.slice(1),file=candidateFiles.get(rel);assert.ok(file,'Unpinned candidate request '+rel);
  const current=await fs.readFile(path.join(app,'static',rel));assert.equal(sha(current),file.sha256);
  served.set(rel,file.sha256);res.writeHead(200,{'content-type':'text/javascript'});res.end(current);
 }catch(e){errors.push(e.stack);res.writeHead(500);res.end('immutable input check failed');}
});
let browser,result;
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({channel:'chrome'});
 const page=await browser.newPage({serviceWorkers:'block'});await page.goto('http://127.0.0.1:'+server.address().port);
 result=await page.evaluate(async({source,namespace,kind})=>{
  const candidate=await import('/js/banchi/voci/esperimento.js'),baseline=await import(namespace+'js/banchi/voci/esperimento.js');
  const a=await candidate.esperienza(source),b=await baseline.esperienza(source);
  const distinctModuleIdentity=candidate!==baseline,distinctSolveIdentity=a.model.solve!==b.model.solve;
  const controls=[{name:'x',value:'55'}];
  const sample=()=>({sourceReplayedX:55,actualDOMControls:controls,model:a.model.solve({x:55}),baselineReference:{kind,distinctModuleIdentity,distinctSolveIdentity,observedX:55,actualDOMControls:controls,model:b.model.solve({x:55})}});
  const original=Math.cos,buffer=new ArrayBuffer(8),view=new DataView(buffer);
  const up=x=>{if(!Number.isFinite(x)||x===Infinity)return x;if(x===0)return Number.MIN_VALUE;view.setFloat64(0,x);view.setBigUint64(0,view.getBigUint64(0)+(x>0?1n:-1n));return view.getFloat64(0);};
  const angle=55*Math.PI/180,before=sample(),cosBefore=original(angle);
  let after,cosAfter;
  try{Math.cos=x=>up(original(x));cosAfter=Math.cos(angle);after=sample();}
  finally{Math.cos=original;}
  const restored=sample();
  return{before,after,restored,cosBefore,cosAfter,restoredIntrinsic:Math.cos===original,scope:'Pure model same browser realm; no bench UI'};
 },{source,namespace:baseline.namespace,kind:REFERENCE_KIND});
 assertStrictBaselineParity(result.before);assertStrictBaselineParity(result.after);assertStrictBaselineParity(result.restored);
 assert.notEqual(result.before.model.y,result.after.model.y,'Counterexample did not change candidate output');
 assert.notEqual(result.before.baselineReference.model.y,result.after.baselineReference.model.y,'Counterexample did not change baseline output');
 assert.deepEqual(result.before,result.restored);assert.equal(result.restoredIntrinsic,true);
 assert.deepEqual(errors,[]);
 result={...result,protocolCommit:'b1f566b714c9e99d2869d16d046f723bc8e51062',candidateRef,browserVersion:browser.version(),
  baselineEvidence:await baseline.evidence(),candidateManifest:Object.fromEntries([...candidateFiles].map(([k,v])=>[k,v.sha256])),servedCandidateFiles:Object.fromEntries(served),
  strictParityBefore:'PASS',strictParityAfterBothDrift:'PASS',finding:'Distinct immutable ESM module namespaces share mutable Math intrinsic in one realm',
  activityCredit:0,scientificApproval:false,productUI:'NOT_RUN',humanApproval:'NOT_RUN',publicationAction:'NONE'};
 await fs.writeFile(path.join(here,'actual-shared-realm.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({candidateBefore:result.before.model.y,candidateAfter:result.after.model.y,baselineBefore:result.before.baselineReference.model.y,baselineAfter:result.after.baselineReference.model.y,strictParityAfterBothDrift:result.strictParityAfterBothDrift,browserVersion:result.browserVersion}));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
