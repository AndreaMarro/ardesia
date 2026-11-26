// Reproduce the shared Math.cos counterexample against the isolated reference
// using the immutable historical model and a disposable browser context.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {assertStrictBaselineParity,createBaselineRealm,loadBaselineReference,REFERENCE_KIND} from '../../tools/corpus_engineering/baseline_browser_reference.mjs';

const app=fileURLToPath(new URL('../../',import.meta.url));
const review=path.join(app,'editorial/reviews');
const fixture=path.join(review,'same-browser-reference-contract-20261126');
const prior=path.join(review,'independent-baseline-shared-realm-20261126');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const readJSON=async filename=>JSON.parse(await fs.readFile(filename));
const root=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'cric-baseline-realm-test-'));
let browser;
try{
 const {numericalReference}=await readJSON(path.join(fixture,'request-after-planned-state-fix.json'));
 numericalReference.kind=REFERENCE_KIND;
 const sourcePlan=await readJSON(path.join(prior,'frozen-b1-plan.json'));
 const row=sourcePlan.records.find(entry=>entry.id==='SIM-C4-L10-01').record;
 const snapshots=path.join(fixture,'baseline-git-evidence');
 const {inputs}=await readJSON(path.join(snapshots,'git-inputs.json'));
 assert.equal(inputs.length,Object.keys(numericalReference.files).length);
 const modules=new Map();
 for(const input of inputs){
  assert.equal(input.commit,numericalReference.baselineRuntimeRef);
  assert.equal(input.sha256,numericalReference.files[input.path]);
  assert.equal(input.snapshot,`blob-${input.sha256}.js`);
  const bytes=await fs.readFile(path.join(snapshots,input.snapshot));
  assert.equal(sha(bytes),input.sha256);
  const relative=input.path.slice('officina-di-fisica/static/'.length);
  const local=path.join(root,relative);
  await fs.mkdir(path.dirname(local),{recursive:true});
  await fs.writeFile(local,bytes);
  modules.set('/'+relative,bytes);
 }
 const requestFile=path.join(root,'request.json');
 const requestRaw=Buffer.from(JSON.stringify({numericalReference}));
 await fs.writeFile(requestFile,requestRaw);
 const plan={numericalReference,baselineBundleRoot:root,requestFile,requestSha256:sha(requestRaw),records:[{record:row}]};
 const reference=await loadBaselineReference(plan);
 browser=await chromium.launch(process.env.ASTRA_CHROME?{executablePath:process.env.ASTRA_CHROME}:{channel:'chrome'});
 const realm=await createBaselineRealm(browser,reference);
 const candidate=await browser.newContext({serviceWorkers:'block'});
 const candidateOrigin='https://cric-test-candidate.invalid';
 await candidate.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==candidateOrigin||url.search)return route.abort();
  if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><input name="x" value="55">'});
  const module=modules.get(url.pathname);
  if(!module)return route.abort();
  return route.fulfill({contentType:'text/javascript',body:module});
 });
 const page=await candidate.newPage();
 await page.goto(candidateOrigin+'/');
 const sample=async perturb=>{
  const measured=await page.evaluate(async ({row,perturb})=>{
   const {esperienza}=await import('/js/banchi/voci/esperimento.js');
   const activity=await esperienza(row);
   const control=document.querySelector('[name=x]');
   const actualDOMControls=[{name:control.name,value:control.value}];
   const x=Number(control.value);
   const originalCos=Math.cos;
   const bits=new DataView(new ArrayBuffer(8));
   if(perturb){
    globalThis.restoreTestCos=()=>{Math.cos=originalCos;delete globalThis.restoreTestCos;};
    Math.cos=function(angle){
     const result=originalCos(angle);
     bits.setFloat64(0,result);
     bits.setBigUint64(0,bits.getBigUint64(0)+(result>0?1n:-1n));
     return bits.getFloat64(0);
    };
   }
   return {actualDOMControls,sourceReplayedX:x,pilot:null,sourceReplayedClockTime:null,model:activity.model.solve({x})};
  },{row,perturb});
  try{
   measured.baselineReference=await realm.solve(page,row,measured.actualDOMControls);
   return measured;
  }finally{
   if(perturb)await page.evaluate(()=>globalThis.restoreTestCos());
  }
 };
 const before=await sample(false);
 assertStrictBaselineParity(before);
 const after=await sample(true);
 assert.notEqual(before.model.y,after.model.y,'Regression probe did not perturb the candidate');
 assert.deepEqual(before.baselineReference,after.baselineReference,'Candidate script changed reference result');
 assert.throws(()=>assertStrictBaselineParity(after),/baseline model drifted/);
 const restored=await sample(false);
 assert.deepEqual(restored,before);
 assertStrictBaselineParity(restored);
 const evidence=await realm.evidence();
 assert.equal(evidence.realmId,before.baselineReference.realmId);
 assert.equal(evidence.isolation,'DISTINCT_CONTEXT_AND_ORIGIN');
 assert.equal(evidence.serviceWorkers,'block');
 console.log(JSON.stringify({browserVersion:browser.version(),before:before.model.y,
  perturbed:after.model.y,isolated:after.baselineReference.model.y,restored:restored.model.y,
  parityRejectedPerturbation:true,servedReferenceModules:Object.keys(evidence.servedFiles).length,
  scope:'Actual browser model regression. Product UI and activity credit are separate.',activityCredit:0}));
}finally{
 await browser?.close();
 await fs.rm(root,{recursive:true,force:true});
}
