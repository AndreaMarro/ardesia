import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [previous, proposed, id] = process.argv.slice(2);
const {chromium} = createRequire(path.resolve(proposed,'package.json'))('playwright');
const boot = "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const temporary = await mkdtemp(path.join(tmpdir(),'officina-misura-lettura-'));
const browser = await chromium.launch({channel:'chrome'});
const servers = [];
try {
  for (const [label,cwd] of [['prima',previous],['dopo',proposed]]) {
    const proc = spawn('python3',['-uc',boot],{cwd,env:{...process.env,ASTRA_DATA:path.join(temporary,label)},stdio:['ignore','pipe','inherit']});
    const port = Number((await once(proc.stdout,'data'))[0]);
    const sha = execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim();
    servers.push({label,proc,base:'http://127.0.0.1:'+port,sha,samples:[]});
  }
  async function read(server) {
    const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    try {
      assert.ok((await ctx.request.post(server.base+'/api/demo',{data:{},headers:{'X-Astra-Request':'1'}})).ok());
      const page=await ctx.newPage();
      await page.goto(server.base+'/#home');
      await page.locator('main h1').waitFor();
      const start=await page.evaluate(()=>performance.now());
      await page.goto(server.base+'/#materiale/'+id+'/'+id.split('-')[0]);
      await page.waitForFunction(id=>document.querySelector('.reader .meta')?.textContent.includes(id)
        && document.querySelector('.lettura-contenuto math') && !document.querySelector('.lettura-contenuto [data-tex]'),id);
      await page.evaluate(()=>document.fonts.ready);
      return await page.evaluate(({start,id})=>{
        const entries=performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname==='/api/item/'+id);
        return {readyMs:Math.round(performance.now()-start),bytes:entries.at(-1).encodedBodySize,
          equations:document.querySelectorAll('.lettura-contenuto math').length};
      },{start,id});
    } finally {await ctx.close();}
  }
  for(let i=0;i<6;i++) for(const server of (i%2 ? [...servers].reverse() : servers)) server.samples.push(await read(server));
  console.log(JSON.stringify({browser:browser.version(),id,series:servers.map(({label,sha,samples})=>({label,sha,samples}))},null,2));
} finally {
  await browser.close();
  await Promise.all(servers.map(async ({proc})=>{const closed=once(proc,'exit');proc.kill();await closed;}));
  await rm(temporary,{force:true,recursive:true});
}
