// Private author preview only. Never publishes the candidate batch.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createHash} from 'node:crypto';

const sha=value=>createHash('sha256').update(value).digest('hex');

const root=fileURLToPath(new URL('../../',import.meta.url));
const batch=process.argv[2];
assert.ok(batch,'Usage: node tests/corpus/browser-drafts.mjs <batch-id>');
assert.match(batch,/^[a-z][a-z0-9-]{0,63}$/);
const packageFile=path.join(root,'editorial/batches',batch+'.json');
const output=process.env.ASTRA_RESULTS || path.join(root,'var/corpus-browser',batch);
const data=await mkdtemp(path.join(tmpdir(),'cric-draft-browser-'));
const packageBytes=await readFile(packageFile);
const pkg=JSON.parse(packageBytes);
const runtime=JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:root,encoding:'utf8'}));
const boot=`
import json,secrets,hashlib,time,os
from server import store
from tools.corpus_engineering.draft_import import import_drafts
from server.web import Handler,ThreadingHTTPServer
store.initialize()
with store.connect() as db:
 import_drafts(db,{'id':'owner','role':'autore'},json.load(open(os.environ['ASTRA_BATCH_FILE'])))
 ticket=secrets.token_urlsafe(32)
 db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+300))
s=ThreadingHTTPServer(('127.0.0.1',0),Handler)
print(json.dumps({'port':s.server_port,'ticket':ticket}),flush=True)
s.serve_forever()
`;
const server=spawn('python3',['-uc',boot],{cwd:root,env:{...process.env,ASTRA_DATA:data,ASTRA_HOSTED:'0',ASTRA_HTTPS:'0',ASTRA_BATCH_FILE:packageFile,ASTRA_EXTENSIONS:path.join(root,'extensions')},stdio:['ignore','pipe','inherit']});
let browser;
try {
 const [raw]=await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Preview server failed');})]);
 const {port,ticket}=JSON.parse(String(raw));
 const base='http://127.0.0.1:'+port;
 browser=await chromium.launch(process.env.ASTRA_CHROME?{executablePath:process.env.ASTRA_CHROME}:{channel:'chrome'});
 // CSP bypass is confined to the test context so axe can be injected; server policy is untouched.
 const context=await browser.newContext({reducedMotion:'reduce',bypassCSP:true});
 const page=await context.newPage();
 page.setDefaultTimeout(15000);
 const login=await page.request.post(base+'/api/owner',{headers:{'X-Astra-Request':'1'},data:{ticket}});
 assert.ok(login.ok());
 const guest=await browser.newContext();
 const denied=[];
 for(const a of pkg.assets){
  const response=await guest.request.get(base+'/asset/'+a.id);
  assert.equal(response.status(),403); denied.push(a.id);
 }
 const results=[];
 await mkdir(output,{recursive:true});
 for(const width of [1440,768,320]){
  await page.setViewportSize({width,height:900});
  for(const row of pkg.records){
   console.log('preview',width,row.id);
   await page.goto(base+'/#autore/modifica/'+row.id);
   await page.waitForFunction(title=>document.querySelector('[data-key="title"]')?.value===title,row.title);
   await page.getByRole('button',{name:'Anteprima',exact:true}).click();
   const preview=page.locator('#edit-preview');
   await preview.waitFor();
   await page.waitForFunction(()=>!document.querySelector('#edit-preview [data-tex]'),null,{timeout:15000});
   await page.evaluate(()=>document.fonts.ready);
   const images=preview.locator('img');
   const figureCount=await images.count();
   assert.ok(figureCount>=[...(row.blocks||[]),...(row.promptBlocks||[])].filter(b=>b.type==='figure').length,'Every authored figure is rendered');
   // Long lessons keep later figures lazy until the reader reaches them.
   for(const img of await images.all()){
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(async el=>{
     let timer;
     try{await Promise.race([el.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Figure decode timeout')),15000);})]);}
     finally{clearTimeout(timer);}
    });
   }
   await page.addScriptTag({path:path.join(root,'node_modules/axe-core/axe.min.js')});
   const result=await preview.evaluate(async el=>({
    violations:(await axe.run(el,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),
    formulas:[...el.querySelectorAll('.math')].map(f=>({width:f.clientWidth,scroll:f.scrollWidth,typeset:f.querySelector('.katex-html').getBoundingClientRect().width})),
    overflow:document.documentElement.scrollWidth-innerWidth
   }));
   assert.ok(result.formulas.length>=[...(row.blocks||[]),...(row.promptBlocks||[])].filter(b=>b.type==='formula').length,'Every authored formula is rendered');
   results.push({id:row.id,width,figureCount,...result});
   if([pkg.records[0]?.id,pkg.records[2]?.id,pkg.records.at(-1)?.id].includes(row.id) && width!==768){
    await preview.scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,row.id+'-'+width+'.png'),animations:'disabled'});
   }
  }
 }
 await guest.close();
 await writeFile(path.join(output,'report.json'),JSON.stringify({schemaVersion:'1.0.0',batch,previewOnly:true,
  packageFileSha256:sha(packageBytes),runtimeFingerprint:runtime,testSha256:sha(await readFile(fileURLToPath(import.meta.url))),
  browserVersion:browser.version(),protectedAssets:denied,records:results},null,2)+'\n');
 const failures=results.filter(r=>r.violations.length||r.overflow>1||r.formulas.some(f=>f.scroll>f.width+1||f.typeset>f.width+1));
 console.log(JSON.stringify({cases:results.length,failed:failures.length,failures}));
 assert.equal(failures.length,0);
} finally {
 server.kill('SIGKILL');
 server.stdout?.destroy();
 server.unref();
 let closeTimer;
 try{await Promise.race([browser?.close(),new Promise(resolve=>{closeTimer=setTimeout(resolve,5000);})]);}
 finally{clearTimeout(closeTimer);}
 await rm(data,{recursive:true,force:true});
}
