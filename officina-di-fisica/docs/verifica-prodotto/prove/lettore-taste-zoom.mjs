import { createRequire } from 'node:module';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const [work, taste, out, url] = process.argv.slice(2);
const {chromium}=createRequire(path.join(work,'package.json'))('playwright');
const {probe,layout,app}=await import(pathToFileURL(path.join(taste,'scripts/lib/probe.mjs')));
const {judge,judgeLayout,judgeApp,APP_SKIP}=await import(pathToFileURL(path.join(taste,'scripts/lib/rules.mjs')));
const temp=await mkdtemp(path.join(tmpdir(),'officina-lettore-zoom-'));
const ext=path.join(temp,'estensione');
await mkdir(ext);
await mkdir(out,{recursive:true});
await writeFile(path.join(ext,'manifest.json'),JSON.stringify({manifest_version:3,name:'Collaudo zoom locale',version:'1.0',background:{service_worker:'zoom.js'}}));
await writeFile(path.join(ext,'zoom.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
const ctx=await chromium.launchPersistentContext(path.join(temp,'profilo'),{channel:'chromium',headless:true,viewport:null,
  args:['--window-size=1280,900','--disable-extensions-except='+ext,'--load-extension='+ext]});
try {
  const page = ctx.pages()[0];
  const headers={'X-Astra-Request':'1'};
  const demo=await ctx.request.post(url+'/api/demo',{data:{},headers});
  assert.ok(demo.ok());
  await page.goto(url+'/#materiale/C6-L01/C6');
  await page.getByText('Testo e ascolto',{exact:true}).click();
  await page.evaluate(()=>document.fonts.ready);
  const tasteReports=[];
  const worker=ctx.serviceWorkers()[0]||await ctx.waitForEvent('serviceworker');
  for(const zoom of [1,2]) {
    const actual=await worker.evaluate(async factor=>{
      const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
      await chrome.tabs.setZoom(tab.id,factor);
      return chrome.tabs.getZoom(tab.id);
    },zoom);
    assert.equal(actual,zoom);
    if(zoom===2) await page.waitForFunction(()=>innerWidth<700);
    const [m,l,a]=await Promise.all([page.evaluate(probe),page.evaluate(layout),page.evaluate(app)]);
    const width=await page.evaluate(()=>innerWidth);
    const raw=[...judge(m,{width}),...judgeLayout(l,{width}),...judgeApp(a,m,{width})]
      .filter(f=>!APP_SKIP.has(f.id)&&f.id!=='no-title'&&f.id!=='small-title');
    const layoutActual=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
      controls:[...document.querySelectorAll('.lettore-opzioni select,.lettore-opzioni > summary')].map(e=>({height:e.getBoundingClientRect().height,right:e.getBoundingClientRect().right})),
      entries:document.querySelectorAll('[data-lettore]').length}));
    assert.equal(layoutActual.entries,1);
    assert.ok(layoutActual.scroll<=width+1 && layoutActual.controls.every(c=>c.height>=44 && c.right<=width+1));
    const observations=raw.map(({level,id,message})=>({level,id,message}));
    tasteReports.push({zoom:actual,width,layout:layoutActual,raw:observations});
    await page.screenshot({path:path.join(out,'lettore-zoom-'+zoom+'.png'),animations:'disabled'});
  }
  console.log(JSON.stringify({taste:'12af471f627f866411b4bd785b19646d3672784c',reports:tasteReports},null,2));
} finally {
  await ctx.close();
  await rm(temp,{recursive:true,force:true});
}
