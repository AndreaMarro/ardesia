// The registry determines the actual batches to render; no fixed pilot-only list.
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const registry=JSON.parse(await readFile(path.join(root,'editorial/batches/registry.json'),'utf8'));
if(registry.schemaVersion!=='1.0.0'||!registry.batches?.length)throw Error('Invalid batch registry');
const output=process.env.ASTRA_RESULTS||path.join(root,'var/corpus-browser');
const workers=Number(process.env.ASTRA_BROWSER_WORKERS||2);
if(!Number.isInteger(workers)||workers<1||workers>4)throw Error('Expected 1–4 bounded browser workers');
const batches=[...registry.batches,...(registry.activityBatches||[]).flatMap(batch=>batch.revisionPackage?[{id:batch.revisionPackage}]:[])];
const seen=new Set();
for(const batch of batches){
 if(!/^[a-z][a-z0-9-]{0,63}$/.test(batch.id)||seen.has(batch.id))throw Error('Invalid or duplicate batch ID');
 seen.add(batch.id);
}
let next=0;
const failures=[];
async function worker(){
 while(next<batches.length){
  const batch=batches[next++];
  try{
   await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[path.join(root,'tests/corpus/browser-drafts.mjs'),batch.id],{
     cwd:root,stdio:'inherit',env:{...process.env,ASTRA_RESULTS:path.resolve(root,output,batch.id)}
    });
    child.once('error',reject);
    child.once('exit',(code,signal)=>code===0?resolve():reject(Error(`${batch.id}: exit ${code}, signal ${signal}`)));
   });
  }catch(error){failures.push(error);}
 }
}
await Promise.all(Array.from({length:Math.min(workers,batches.length)},()=>worker()));
if(failures.length)throw new AggregateError(failures,'Private preview batches failed');
console.log(JSON.stringify({batches:batches.length,workers,failed:0}));
