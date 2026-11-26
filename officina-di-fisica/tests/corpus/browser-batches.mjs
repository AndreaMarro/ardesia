// The registry determines the actual batches to render; no fixed pilot-only list.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {readFile,mkdir,rm,writeFile,rename} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,validateBatchSpec,validateReport,validateCompletion,completion} from './browser-batches-resume.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const registryFile=path.join(root,'editorial/batches/registry.json');
const registryBytes=await readFile(registryFile);
const registry=JSON.parse(registryBytes);
if(registry.schemaVersion!=='1.0.0'||!Array.isArray(registry.batches)||!registry.batches.length)throw Error('Invalid batch registry');
const output=process.env.ASTRA_RESULTS||path.join(root,'var/corpus-browser');
const workers=Number(process.env.ASTRA_BROWSER_WORKERS||2);
if(!Number.isInteger(workers)||workers<1||workers>4)throw Error('Expected 1–4 bounded browser workers');
const batches=[...registry.batches.map(batch=>({id:batch.id,questionIds:batch.questionIds})),...(registry.activityBatches||[]).flatMap(batch=>batch.revisionPackage?[{id:batch.revisionPackage,activityIds:batch.activityIds}]:[])];
const seen=new Set();
for(const batch of batches){
 if(!/^[a-z][a-z0-9-]{0,63}$/.test(batch.id)||seen.has(batch.id))throw Error('Invalid or duplicate batch ID');
 seen.add(batch.id);
}
async function commonInputs(){
 const files=['browser-drafts.mjs','browser-batches.mjs','browser-batches-resume.mjs'];
 const [protocol,runner,helper]=await Promise.all(files.map(file=>readFile(path.join(root,'tests/corpus',file))));
 const runtimeFingerprint=JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:root,encoding:'utf8'}));
 return {protocolSha256:sha256(protocol),runnerSha256:sha256(runner),helperSha256:sha256(helper),runtimeFingerprint};
}
const common=await commonInputs();
let next=0,reused=0,rendered=0;
const failures=[];
async function worker(){
 while(next<batches.length){
  const batch=batches[next++];
  const directory=path.resolve(root,output,batch.id);
  const reportFile=path.join(directory,'report.json'),markerFile=path.join(directory,'completion.json');
  try{
   const packageFile=path.join(root,'editorial/batches',batch.id+'.json');
   const packageBytes=await readFile(packageFile),pkg=JSON.parse(packageBytes);
   validateBatchSpec(pkg,batch);
   const inputs={batch:batch.id,packageFileSha256:sha256(packageBytes),...common};
   try{
    const [marker,report]=await Promise.all([readFile(markerFile,'utf8'),readFile(reportFile)]);
    validateCompletion(JSON.parse(marker),report,pkg,inputs);
    reused++;continue;
   }catch{ /* Missing, stale or incomplete evidence requires a real browser process. */ }
   await mkdir(directory,{recursive:true});
   await rm(markerFile,{force:true});
   // A successful process that never writes a fresh report cannot certify an old one.
   await rm(reportFile,{force:true});
   await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[path.join(root,'tests/corpus/browser-drafts.mjs'),batch.id],{
     cwd:root,stdio:'inherit',env:{...process.env,ASTRA_RESULTS:directory}
    });
    child.once('error',reject);
    child.once('exit',(code,signal)=>code===0&&signal===null?resolve():reject(Error(`${batch.id}: exit ${code}, signal ${signal}`)));
   });
   const reportBytes=await readFile(reportFile);
   const caseCount=validateReport(JSON.parse(reportBytes),pkg,inputs);
   assert.equal(sha256(await readFile(packageFile)),inputs.packageFileSha256,'Package changed during preview');
   assert.deepEqual(await commonInputs(),common,'Runtime or preview protocol changed during preview');
   const temporary=path.join(directory,`.completion-${randomUUID()}.tmp`);
   try{
    await writeFile(temporary,JSON.stringify(completion(inputs,reportBytes,caseCount),null,2)+'\n',{flag:'wx'});
    await rename(temporary,markerFile);
   }finally{await rm(temporary,{force:true});}
   rendered++;
  }catch(error){failures.push(error);}
 }
}
await Promise.all(Array.from({length:Math.min(workers,batches.length)},()=>worker()));
// Recheck reused evidence too: a package/report may change while another worker renders.
for(const batch of batches){
 try{
  const directory=path.resolve(root,output,batch.id);
  const [packageBytes,marker,report]=await Promise.all([
   readFile(path.join(root,'editorial/batches',batch.id+'.json')),
   readFile(path.join(directory,'completion.json'),'utf8'),readFile(path.join(directory,'report.json'))
  ]);
  const pkg=JSON.parse(packageBytes);
  validateBatchSpec(pkg,batch);
  validateCompletion(JSON.parse(marker),report,pkg,{batch:batch.id,packageFileSha256:sha256(packageBytes),...common});
 }catch(error){failures.push(error);}
}
// Registry changes never confer a global PASS; unaffected per-batch markers remain useful.
try{assert.deepEqual(await commonInputs(),common,'Runtime or preview protocol changed during preview');}catch(error){failures.push(error);}
if(!registryBytes.equals(await readFile(registryFile)))failures.push(Error('Batch registry changed during preview; rerun against its new snapshot'));
if(failures.length)throw new AggregateError(failures,'Private preview batches failed');
console.log(JSON.stringify({batches:batches.length,workers,reused,rendered,failed:0,registrySha256:sha256(registryBytes)}));
