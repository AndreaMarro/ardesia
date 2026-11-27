// Independent pure-model browser peer. Synthetic control fixture, not product UI.
import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';
import http from'node:http';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';import{fileURLToPath}from'node:url';import{chromium}from'playwright';
import{loadBaselineReference,createBaselineRealm,assertStrictBaselineParity}from'./frozen-baseline_browser_reference.mjs';
const B=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(B,'../../../..'),sha=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(await fs.readFile(path.join(B,'pure-model-plan.json'))),row=plan.records[0].record,controls=[{name:'x',value:'55'}];
const app='/private/tmp/cric-root-visibility-bootstrap-final-c6-20261126/candidate-app',ref='64aef05bef5ca7ebff8491060762dd4cac0cbb34',files=new Map(),requests=[];
for(const name of Object.keys(plan.numericalReference.files)){
 const relative=name.slice('officina-di-fisica/static/'.length),bytes=execFileSync('git',['show',ref+':'+name],{cwd:repo,env:{...process.env,GIT_NO_LAZY_FETCH:'1'}});
 assert.deepEqual(await fs.readFile(path.join(app,'static',relative)),bytes);files.set('/'+relative,{bytes,sha256:sha(bytes)});
}
assert.equal(files.size,80);const reference=await loadBaselineReference(plan);
const server=http.createServer((req,res)=>{requests.push(req.url);if(req.url==='/'){res.writeHead(200,{'content-type':'text/html'});res.end('<!doctype html><title>Independent candidate pure model</title>');return;}if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}const file=files.get(req.url);if(!file){res.writeHead(403);res.end();return;}res.writeHead(200,{'content-type':'text/javascript'});res.end(file.bytes);});
let browser;
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({channel:'chrome'});const candidate=await browser.newContext({serviceWorkers:'block'});await candidate.addCookies([{name:'candidate-only',value:'fixture',url:origin}]);const page=await candidate.newPage();await page.goto(origin);
 const realm=await createBaselineRealm(browser,reference),baselineContext=browser.contexts().find(c=>c!==candidate),baselinePage=baselineContext.pages()[0];
 const sample=()=>page.evaluate(async({row,controls})=>{const{esperienza}=await import('/js/banchi/voci/esperimento.js'),{piloti}=await import('/js/banchi/quaderno.js');const a=await esperienza(row),x=Number(controls[0].value);return{sourceReplayedX:x,sourceReplayedClockTime:a.clock?(a.clock.input?x:0):null,pilot:piloti[row.id]??null,actualDOMControls:controls,model:a.model.solve({x})};},{row,controls});
 const before=await sample();before.baselineReference=await realm.solve(page,row,controls);assertStrictBaselineParity(before);
 await page.evaluate(()=>{globalThis.__originalCos=Math.cos;const view=new DataView(new ArrayBuffer(8));Math.cos=x=>{const y=__originalCos(x);if(y===0)return Number.MIN_VALUE;if(!Number.isFinite(y))return y;view.setFloat64(0,y);view.setBigUint64(0,view.getBigUint64(0)+(y>0?1n:-1n));return view.getFloat64(0);};});
 const after=await sample();after.baselineReference=await realm.solve(page,row,controls);let rejection;
 try{assertStrictBaselineParity(after);}catch(e){rejection=e.message;}
 assert.ok(rejection?.includes('model drifted'));assert.notEqual(before.model.y,after.model.y);assert.deepEqual(before.baselineReference.model,after.baselineReference.model);
 await page.evaluate(()=>{Math.cos=__originalCos;delete globalThis.__originalCos;});const restored=await sample();restored.baselineReference=await realm.solve(page,row,controls);assertStrictBaselineParity(restored);assert.deepEqual(before,restored);
 await assert.rejects(realm.solve(baselinePage,row,controls),/shares the baseline context/);
 const blockedFetch=await baselinePage.evaluate(async url=>{try{await fetch(url);return false;}catch{return true;}},origin+'/forbidden-baseline-fetch');assert.equal(blockedFetch,true);assert.ok(!requests.includes('/forbidden-baseline-fetch'));
 const referenceEvidence=await realm.evidence();assert.deepEqual(await baselineContext.cookies(),[]);assert.equal((await candidate.cookies()).length,1);
 const negativeReference=await loadBaselineReference(plan);const contextsBefore=browser.contexts();const negativeRealm=await createBaselineRealm(browser,negativeReference);const negativeContext=browser.contexts().find(c=>!contextsBefore.includes(c));const negativePage=negativeContext.pages()[0];
 const unpinnedRejected=await negativePage.evaluate(async url=>{try{await import(url);return false;}catch{return true;}},negativeReference.namespace+'not-in-pinned-closure.js');assert.equal(unpinnedRejected,true);await assert.rejects(negativeRealm.evidence(),/Unpinned baseline request/);await negativeContext.close();
 for(const[name,file]of files)assert.equal(sha(await fs.readFile(path.join(app,'static',name.slice(1)))),file.sha256);
 const result={reviewedCommit:'da6c179fc382865e26a33e3fc6d410350c4c2509',candidateRef:ref,browserVersion:browser.version(),before,after,restored,rejection,referenceEvidence,
  sameContextAttemptRejected:true,baselineFetchCandidateOriginBlocked:true,baselineCookieJarEmpty:true,unpinnedScriptRejectedAndEvidenceFails:true,candidate80ExactGitBeforeAfter:true,
  interpretation:'V1 shared intrinsic drift is now rejected while isolated immutable baseline stays unchanged; no new activity/scientific/UI approval',
  syntheticControlsDisclosure:'The logical x55 control tuple is a fixture; the existing bench/DOM controls were not mounted in this pure-model test',activityCredit:0,productUI:'NOT_RUN',humanApproval:'NOT_RUN',publicationAction:'NONE'};
 await fs.writeFile(path.join(B,'actual-isolated-peer.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({candidateBefore:before.model.y,candidateAfter:after.model.y,baselineBefore:before.baselineReference.model.y,baselineAfter:after.baselineReference.model.y,rejected:true,browserVersion:browser.version()}));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
