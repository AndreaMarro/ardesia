// Independent read-only verification of five published benches in disposable databases.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const app=fileURLToPath(new URL('../../',import.meta.url));
const results=process.env.ASTRA_RESULTS||path.join(app,'var/benches035');await mkdir(results,{recursive:true});
const cases=[['LAB3D-01',0,[8,3]],['LAB3D-02',1,[1,3.6,1,4]],['LAB3D-03',2,[5,2]],['LAB3D-04',2,[2,10,12,6]],['LAB3D-05',0,[180,150,80,45]]];
const hash=x=>createHash('sha256').update(x).digest('hex');
const instrumentFile=fileURLToPath(import.meta.url);const instrumentBefore=hash(await readFile(instrumentFile));
const runtimeBefore=JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:app,encoding:'utf8'}));const imageSha256ByName={};
const data=await mkdtemp(path.join(tmpdir(),'cric-benches035-'));
const boot="from server.store import initialize;from server.web import Handler,ThreadingHTTPServer;initialize();s=ThreadingHTTPServer(('127.0.0.1',0),Handler);print(s.server_port,flush=True);s.serve_forever()";
const server=spawn('python3',['-uc',boot],{cwd:app,env:{...process.env,ASTRA_DATA:data},stdio:['ignore','pipe','ignore']});
const url='http://127.0.0.1:'+String((await once(server.stdout,'data'))[0]).trim();
const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});const records=[];const errors=[];
try{
 for(const fallback of [false,true]){
  const context=await browser.newContext({viewport:{width:fallback?480:1100,height:900},reducedMotion:'reduce'});
  if(fallback)await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};});
  assert((await context.request.post(url+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}})).ok());
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(String(e)));
  for(const [id,choice,answers] of cases){
   await page.goto(url+'/#banco/'+id);const b=page.locator('[data-bench="'+id+'"]');await b.locator('[name=prediction][value="'+choice+'"]').check();await b.locator('[data-predict] button').click();
   await b.locator('[data-phase="2"]').click();await b.locator('[data-display]').waitFor();
   if(fallback)await b.locator('.bench-diagram').waitFor();else await page.waitForFunction(()=>document.querySelector('[data-display]')?.textContent.includes('3D interattivo'));
   const imageName=id+'-'+(fallback?'2d':'3d')+'.png';await b.locator('.bench-stage').screenshot({path:path.join(results,imageName)});imageSha256ByName[imageName]=hash(await readFile(path.join(results,imageName)));
   await b.locator('[data-phase="3"]').click();await b.locator('[data-phase="4"]').click();
   assert.equal(await b.locator('[data-check]').count(),answers.length);
   for(let i=0;i<answers.length;i++){
    const f=b.locator('[data-check="'+i+'"]');await f.locator('input[name=answer]').fill(String(answers[i]+17));await f.locator('button').click();assert((await f.locator('[role=status]').innerText()).startsWith('Rivedi il calcolo.'));
    await f.locator('input[name=answer]').fill(String(answers[i]).replace('.',','));await f.locator('button').click();assert((await f.locator('[role=status]').innerText()).startsWith('Corretto.'));
   }
   records.push({id,mode:fallback?'2D fallback':'3D WebGL',predictionChoice:choice,independentlySolvedAssessments:answers,wrongRejected:answers.length,correctAccepted:answers.length,figureCaptured:true});console.log(id,fallback?'2d':'3d');
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);const instrumentSha256=hash(await readFile(instrumentFile));assert.equal(instrumentSha256,instrumentBefore);assert.deepEqual(runtimeBefore,JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:app,encoding:'utf8'})));
 await writeFile(path.join(results,'report.json'),JSON.stringify({schemaVersion:'1.0.0',batch:'bench-mechanics-fluids-035',purpose:'read_only_current_consumers_not_completion_authority',records,pageErrors:errors,instrumentSha256,runtimeFingerprint:runtimeBefore,imageSha256ByName,database:'disposable_sqlite',humanApproval:'NOT_RUN',newPublications:0},null,2)+'\n');
}finally{await browser.close();server.kill('SIGTERM');if(server.exitCode===null)await once(server,'exit');await rm(data,{recursive:true,force:true});}
