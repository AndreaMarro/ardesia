const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {chromium} = require(path.resolve('node_modules/@playwright/test'));
const out = path.resolve('docs/deliveries/2026-10-24-rea-deep-build/evidence/review/C-public');
fs.mkdirSync(out, {recursive:true});
const digest = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sources = ['apps/web/src/components/PoiseuilleVisual.tsx','apps/web/src/components/PhysicsLab.tsx','apps/web/src/features/PublicExperience.tsx','apps/web/src/components/PublicLessonDemo.tsx','apps/web/src/publicPreview.ts','apps/web/src/generated/publicPreviewData.ts','apps/web/src/styles.css'];
const manifest = () => Object.fromEntries(sources.map(p=>[p,digest(p)]));
const check = (o, label, value, detail) => {o.checks.push({label,pass:Boolean(value),detail});};
(async()=>{
 const before=manifest();
 const browser=await chromium.launch({headless:true, executablePath:'/Users/andreamarro/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 const result={url:'http://127.0.0.1:5413/esperienza/',browser:browser.version(),browserPlugin:'not available in listed skills; regular package Playwright used',sourceBefore:before,viewports:[]};
 for(const [width,height] of [[360,800],[390,844],[820,1180],[1440,1000]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:width<800?'reduce':'no-preference'});
  const page=await context.newPage();const o={width,height,checks:[],console:[],pageErrors:[],failedRequests:[],httpFailures:[],requests:[]};result.viewports.push(o);
  page.on('pageerror',e=>o.pageErrors.push(e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))o.console.push({type:m.type(),text:m.text()});});
  page.on('requestfailed',r=>o.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));page.on('request',r=>o.requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)o.httpFailures.push({url:r.url(),status:r.status()});});
  try{
   await page.goto(result.url);await page.getByRole('heading',{level:1}).waitFor();
   check(o,'identity',(await page.title()).includes('Ardesia Fisica'),await page.title());
   check(o,'first use no answer',(await page.getByTestId('physics-ratio').count())===0&&(await page.locator('.flow-tracer').count())===0);
   check(o,'no early graph',(await page.getByTestId('poiseuille-graph').count())===0);
   check(o,'blank prediction disabled',await page.getByRole('button',{name:'Metti alla prova'}).isDisabled());
   await page.keyboard.press('Tab');o.firstFocus=await page.locator(':focus').textContent();await page.screenshot({path:path.join(out,`focus-${width}.png`)});
   check(o,'first tab skip link',o.firstFocus.includes('Vai all’esperimento'));
   await page.keyboard.press('Enter');check(o,'skip focuses main',await page.locator('main').evaluate(e=>e===document.activeElement));
   await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,`initial-${width}.png`)});
   o.initialText=await page.locator('body').innerText();
   await page.getByLabel('Rapporto previsto',{exact:true}).fill('9'.repeat(1000));check(o,'long invalid numeric remains disabled',await page.getByRole('button',{name:'Metti alla prova'}).isDisabled());
   check(o,'long text no page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.getByLabel('Rapporto previsto',{exact:true}).fill('4');await page.getByRole('button',{name:'Metti alla prova'}).press('Enter');
   check(o,'prediction then Core pressure result',(await page.getByTestId('physics-ratio').innerText())==='Q/Q0 = 16');
   check(o,'Core mean speed at pressure fixed',await page.getByTestId('flow-measures').getAttribute('data-speed-ratio')==='4');
   await page.getByRole('button',{name:'Guarda il grafico'}).click();check(o,'graph explicit',await page.getByTestId('poiseuille-graph').isVisible());
   await page.screenshot({path:path.join(out,`revealed-full-${width}.png`),fullPage:true});
   o.svgText=await page.locator('.discovery-model svg text').evaluateAll(es=>es.map(e=>({text:e.textContent,fontSize:getComputedStyle(e).fontSize,rect:{width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}})));
   o.focusStyle=await page.getByRole('button',{name:'Nascondi il grafico'}).evaluate(e=>({outline:getComputedStyle(e).outline,color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));
   const tracer=page.locator('.flow-tracer').first();const frame=()=>tracer.evaluate(e=>getComputedStyle(e).transform);
   if(width<800){check(o,'reduced motion disables animation',await tracer.evaluate(e=>getComputedStyle(e).animationName)==='none');}
   else {const a=await frame();await page.waitForTimeout(220);check(o,'motion progresses',await frame()!==a);await page.getByRole('button',{name:'Ferma il flusso'}).click();await page.waitForTimeout(30);const b=await frame();await page.waitForTimeout(220);check(o,'pause freezes real transform',await frame()===b);check(o,'pause accessible state',await page.getByRole('button',{name:'Anima il flusso'}).getAttribute('aria-pressed')==='true');await page.getByRole('button',{name:'Anima il flusso'}).press('Enter');await page.waitForTimeout(220);check(o,'keyboard resume progresses',await frame()!==b);}
   await page.getByRole('button',{name:'Riprendi il vincolo'}).click();await page.getByRole('heading',{name:'Un passaggio alla volta.'}).waitFor();
   check(o,'assistance disclosed',(await page.locator('.constraint-recovery').innerText()).includes('risposta assistita'));
   const audio=page.locator('audio');check(o,'audio remains user initiated',await audio.evaluate(e=>e.paused)&&await audio.getAttribute('preload')==='none');
   await page.getByRole('link',{name:'Ritrova la formula collegata'}).click();check(o,'formula linked visible',await page.locator('#poiseuille-formula').isVisible());
   await page.getByLabel('Grandezza fissata').selectOption('flow');check(o,'constraint invalidates result',(await page.getByTestId('physics-ratio').count())===0);
   await page.getByLabel('Rapporto previsto',{exact:true}).fill('0,0625');await page.getByRole('button',{name:'Metti alla prova'}).click();
   check(o,'fixed flow pressure reciprocal',(await page.getByTestId('physics-ratio').innerText())==='Δp/Δp0 = 0,0625');check(o,'fixed flow mean speed decreases',await page.getByTestId('flow-measures').getAttribute('data-speed-ratio')==='0.25');
   await page.screenshot({path:path.join(out,`flow-full-${width}.png`),fullPage:true});
   await page.getByRole('button',{name:'Un problema diverso'}).click();check(o,'new problem resets prediction',(await page.getByLabel('Rapporto previsto',{exact:true}).inputValue())===''&&(await page.getByTestId('physics-ratio').count())===0);
   await page.getByLabel('Rapporto previsto',{exact:true}).fill('16');await page.getByRole('button',{name:'Metti alla prova'}).click();check(o,'new small tube flow fixed result',(await page.getByTestId('physics-ratio').innerText())==='Δp/Δp0 = 16');
   await page.getByRole('button',{name:'Ricomincia l’esperimento'}).click();check(o,'reset restores unrevealed radius and constraint',(await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).inputValue())==='2'&&(await page.getByLabel('Grandezza fissata').inputValue())==='pressure'&&(await page.getByTestId('physics-ratio').count())===0&&(await page.locator('.flow-tracer').count())===0);
   await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).focus();await page.keyboard.press('Home');check(o,'range Home keyboard',await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).inputValue()==='0.5');await page.keyboard.press('End');check(o,'range End keyboard',await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).inputValue()==='2');
   check(o,'no final page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check(o,'no framework overlay',(await page.locator('vite-error-overlay').count())===0);
   check(o,'no runtime or HTTP errors',!o.pageErrors.length&&!o.httpFailures.length&&!o.failedRequests.length,{pageErrors:o.pageErrors,httpFailures:o.httpFailures,failedRequests:o.failedRequests});
   check(o,'no Study request',!o.requests.some(x=>x.includes('/study/')));check(o,'same origin requests',o.requests.every(x=>x.startsWith('http://127.0.0.1:5413/')));
  }catch(e){o.exception=String(e);await page.screenshot({path:path.join(out,`exception-${width}.png`),fullPage:true}).catch(()=>{});}
  await context.close();fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
 }
 result.sourceAfter=manifest();result.sourceChangedDuringRun=Object.keys(before).filter(x=>before[x]!==result.sourceAfter[x]);result.failed=result.viewports.flatMap(v=>v.checks.filter(x=>!x.pass).map(x=>({width:v.width,...x})));result.exceptions=result.viewports.filter(x=>x.exception).map(x=>({width:x.width,error:x.exception}));
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({checks:result.viewports.map(v=>({width:v.width,count:v.checks.length})),failed:result.failed,exceptions:result.exceptions,sourceChanged:result.sourceChangedDuringRun},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
