import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
const dossier=fileURLToPath(new URL('../',import.meta.url)),product=path.resolve(dossier,'../../../../officina-di-fisica');
const require=createRequire(path.join(process.env.OFFICINA_DEPS||product,'package.json'));
const {chromium}=require('playwright');
const out=process.argv[2]||await mkdtemp(path.join(tmpdir(),'ux-officina-'));
await mkdir(out,{recursive:true});
const data=await mkdtemp(path.join(tmpdir(),'discovery-db-')),listener=net.createServer();
listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;
listener.close();await once(listener,'close');
const url='http://127.0.0.1:'+port+'/';
const app=spawn('python3',['app.py','serve','--port',String(port)],{cwd:product,env:{...process.env,ASTRA_DATA:data},stdio:['ignore','pipe','inherit']});
let browser;const results=[];
try{
 await once(app.stdout,'data');browser=await chromium.launch();
 for(const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:width<500,isMobile:width<500});
  const p=await ctx.newPage(),obs={device,width,height,routes:[],searches:{}};
  const ready=async(selector)=>{await p.locator(selector).first().waitFor();await p.waitForFunction(()=>!document.querySelector('main')?.hasAttribute('aria-busy'));await p.evaluate(()=>document.fonts.ready)};
  const inspect=async(label)=>{
   await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   const record=await p.evaluate(()=>{
    const rect=e=>e.getBoundingClientRect();
    const controls=[...document.querySelectorAll('main :is(a,button,input,summary)')].filter(e=>{for(const closed of document.querySelectorAll('details:not([open])'))if(closed.contains(e)&&e!==closed.querySelector(':scope > summary'))return false;return e.checkVisibility()&&rect(e).width>0&&rect(e).height>0});
    return {route:location.hash,title:document.querySelector('h1')?.innerText.trim(),controls:controls.length,visibleInFirstScreen:controls.filter(e=>rect(e).top>=0&&rect(e).bottom<=innerHeight).length,
     primary:Object.fromEntries(['Studio completo','Preparazione rapida all’esame','Inizia dalle lezioni','Simulazioni 3D di C1','Vai agli esercizi prioritari'].flatMap(t=>{const e=controls.find(e=>e.innerText.trim().startsWith(t));return e?[[t,Math.round(rect(e).bottom)]]:[]}))};
   });obs.routes.push(record);if(label)await p.screenshot({path:path.join(out,'baseline-'+label+'-'+device+'.png')})
  };
  await p.goto(url+'#home');await ready('.hero');await inspect('home');
  await p.locator('a[href="#corso/C1"]').first().click();await ready('.c1-paths');await inspect('c1');
  await p.getByRole('link',{name:'Simulazioni 3D di C1',exact:true}).click();
  await ready('#cerca-simulazione');await inspect('laboratori');
  const field=p.locator('#cerca-simulazione'),count=p.locator('.sim-count');
  assert.match(await count.innerText(),/42 simulazioni in 10 lezioni/);
  for(const query of ['aree con segno','grafici cinematici','spostamento']){
   await field.fill(query);obs.searches[query]={status:await count.innerText(),links:await p.locator('.sim-results a:visible').count()};
  }
  await field.fill('');await p.getByText('Leggere il movimento nel tempo · 6',{exact:true}).click();
  const target=p.getByRole('link',{name:/Grafici cinematici/});
  obs.directLab=await target.getAttribute('href');await target.click();await p.waitForFunction(()=>location.hash.includes('SIM-C1-L003-06')&&document.querySelector('main h1')?.textContent!=='Simulazioni 3D di C1'&&!document.querySelector('main')?.hasAttribute('aria-busy'));
  obs.benchTitle=await p.locator('h1').innerText();
  for(const course of ['C2','C6']){await p.goto(url+'#corso/'+course);await ready('.method-intro');await inspect(null)}
  results.push(obs);await ctx.close();
 }
 await writeFile(path.join(out,'navigazione.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify(results));
}finally{if(browser)await browser.close();const closed=once(app,'close');app.kill();await closed;await rm(data,{recursive:true,force:true})}
