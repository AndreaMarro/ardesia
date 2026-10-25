// Run from repository root after building baseline and combined candidate.
// Cold isolated contexts; local lab timings, not field Web Vitals or a user study.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {chromium} = require(path.resolve('apps/studio/node_modules/playwright-core'));
const out = path.resolve(process.env.ARDESIA_PERFORMANCE_OUT || '../deep-build/performance');
const current = process.env.ARDESIA_PUBLIC_ORIGIN || 'http://127.0.0.1:5414';
const baseline = process.env.ARDESIA_BASELINE_ORIGIN || 'http://127.0.0.1:5415';
const cases = [{name:'baseline-public',url:baseline+'/'},{name:'candidate-public',url:current+'/esperienza/'},{name:'candidate-landing',url:current+'/'}];
fs.mkdirSync(out,{recursive:true});
let browser;
(async()=>{
 browser=await chromium.launch({headless:true}); const rows=[];
 for(const width of [390,1440]) for(const target of cases) for(let sample=0;sample<3;sample++) {
  const context=await browser.newContext({viewport:{width,height:1000},locale:'it-IT',reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__labLCP=[]; new PerformanceObserver(list=>window.__labLCP.push(...list.getEntries().map(e=>e.startTime))).observe({type:'largest-contentful-paint',buffered:true});});
  const page=await context.newPage(),errors=[],requests=[],failures=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response',r=>requests.push({url:r.url(),status:r.status()}));
  await page.goto(target.url,{waitUntil:'load'}); await page.evaluate(()=>document.fonts.ready); await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const metrics=await page.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0]; const resources=performance.getEntriesByType('resource');return {domContentLoadedMs:nav.domContentLoadedEventEnd,loadMs:nav.loadEventEnd,lcpObservedMs:window.__labLCP.at(-1)??null,resourceCount:resources.length,decodedBodyBytes:resources.reduce((n,r)=>n+r.decodedBodySize,0),horizontalOverflow:document.documentElement.scrollWidth>innerWidth};});
  let rangeLatencyMs=null;
  if(target.name!=='candidate-landing'){
   const range=page.locator('input[type=range]').first(); const before=await range.inputValue(); await range.focus(); await page.evaluate(()=>window.__rangeStart=performance.now()); await range.press(Number(before)>=Number(await range.getAttribute('max'))?'ArrowLeft':'ArrowRight');
   rangeLatencyMs=await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(performance.now()-window.__rangeStart)))));
   if(await range.inputValue()===before)throw Error('Native keyboard range did not change');
  }
  if(sample===0)await page.screenshot({path:path.join(out,target.name+'-'+width+'.png'),fullPage:true});
  rows.push({target:target.name,width,sample,...metrics,rangeTwoFrameLatencyMs:rangeLatencyMs,errors,failures,requests});await context.close();
 }
 const result={schemaVersion:1,browser:browser.version(),measuredAt:new Date().toISOString(),baselineCommit:'f456ade218acee1a8b65f5dc24e9220681658b11',method:'3 cold isolated local Chromium contexts at390/1440, native load and two animation frames after fonts.ready. Keyboard ArrowRight→two-frame latency including automation transport is a lab proxy, not INP. No CPU/network throttle; shared host and Python servers. Audio preload=none; playback excluded from initial load. Baseline public root vs candidate /esperienza/.',rows};
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)); await browser.close();
 if(rows.some(r=>r.errors.length||r.failures.length||r.horizontalOverflow||r.requests.some(v=>v.status>=400)))throw Error('Runtime, network or overflow failure; see original result');
 console.log(JSON.stringify({samples:rows.length,checks:'PASS',out}));
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
