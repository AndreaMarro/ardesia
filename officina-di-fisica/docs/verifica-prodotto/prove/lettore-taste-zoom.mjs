import { createRequire } from 'node:module';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const [work, taste, out, url, item = 'C6-L01'] = process.argv.slice(2);
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
  const bench = item.startsWith('SIM-');
  await page.goto(bench ? url+'/#banco/'+item : url+'/#materiale/'+encodeURIComponent(item)+'/'+item.split('-')[0]);
  if (item.includes('-Q')) {
    await page.locator('#single').press('Enter');
    await page.locator('#reveal').press('Enter');
  }
  if (bench) {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('[name=prediction]').first().check();
    await page.locator('[data-predict] button').press('Enter');
    await page.locator('[data-view=diagram]').press('Enter');
    await page.locator('[data-drawing] svg').waitFor();
  } else await page.getByText('Testo e ascolto',{exact:true}).click();
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
    const layoutActual=await page.evaluate(bench=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
      controls:[...document.querySelectorAll(bench ? '.bench-views [data-view]' : '.lettore-opzioni select,.lettore-opzioni > summary')].map(e=>({height:e.getBoundingClientRect().height,right:e.getBoundingClientRect().right})),
      entries:document.querySelectorAll(bench ? '[data-bench]' : '[data-lettore]').length}),bench);
    assert.equal(layoutActual.entries,1);
    assert.ok(layoutActual.scroll<=width+1 && layoutActual.controls.every(c=>c.height>=(bench?24:44) && c.right<=width+1));
    if (item.includes('-Q')) {
      const formulas = await page.locator('.feedback .math').evaluateAll(nodes=>nodes.map(el=>el.scrollWidth-el.clientWidth));
      assert.ok(formulas.length>0 && formulas.every(extra=>extra<=1));
      await page.locator('.feedback figure').first().evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
    }
    if (bench) {
      const drawing = page.locator('[data-drawing] svg');
      await drawing.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
      await drawing.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
      const box = await drawing.boundingBox();
      assert.ok(box && box.y < (await page.evaluate(()=>innerHeight)) && box.y+box.height>0);
    }
    const observations=raw.map(({level,id,message})=>({level,id,message}));
    tasteReports.push({zoom:actual,width,layout:layoutActual,raw:observations});
    await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
    const session = await ctx.newCDPSession(page);
    try {
      const shot = await session.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      const prefix = bench ? 'banco' : 'lettore';
      await writeFile(path.join(out,prefix+'-zoom-'+zoom+'.png'),Buffer.from(shot.data,'base64'));
    } finally { await session.detach(); }
  }
  console.log(JSON.stringify({taste:'12af471f627f866411b4bd785b19646d3672784c',reports:tasteReports},null,2));
} finally {
  await ctx.close();
  await rm(temp,{recursive:true,force:true});
}
