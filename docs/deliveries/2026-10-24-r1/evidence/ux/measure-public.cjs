const {chromium}=require((process.env.UX_REPO || require('node:path').resolve(__dirname,'../../ardesia-r1'))+'/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),os=require('node:os');
const origin=process.env.UX_ORIGIN||'http://127.0.0.1:5414';
const artifact=path.resolve(process.env.UX_ARTIFACT||path.join(__dirname,'../base-public'));
const label=process.env.UX_LABEL||'baseline299';
const out=process.env.UX_PERF_OUT||path.join(__dirname,`performance-${label}`);
fs.mkdirSync(out,{recursive:true});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const profiles=[{name:'plain-loopback',cpu:1,network:null},{name:'browser-simulated-limited',cpu:4,network:{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular3g'}}].filter(profile=>!process.env.UX_PROFILE||profile.name===process.env.UX_PROFILE);
let browser;
const rows=[],checks=[];
function check(name,pass){checks.push({name,pass});if(!pass)throw Error(name);}
const metric=(entries,name)=>entries.find(x=>x.name===name)?.value??null;
async function measureInteraction(page,event,target,action,completed){
  await page.evaluate(({event,target,completed})=>{
    window.__r1Interaction=null;
    const element=document.querySelector(target);
    element.addEventListener(event,()=>{
      const started=performance.now();
      const observer=new MutationObserver(()=>{
        if(!document.querySelector(completed))return;
        observer.disconnect();
        requestAnimationFrame(()=>requestAnimationFrame(()=>{window.__r1Interaction=performance.now()-started;}));
      });
      observer.observe(document.body,{childList:true,subtree:true,attributes:true});
    },{once:true,capture:true});
  },{event,target,completed});
  await action();
  await page.waitForFunction(()=>window.__r1Interaction!==null);
  return page.evaluate(()=>window.__r1Interaction);
}
(async()=>{
  const manifest=fs.readFileSync(path.join(artifact,'candidate-manifest.json'));
  const manifestSha=sha(manifest),sourceManifestSha=sha(fs.readFileSync(path.join(artifact,'source-manifest.json')));
  browser=await chromium.launch({headless:true});
  for(const width of [390,1440])for(let sample=0;sample<3;sample++)for(const profile of sample===1?[...profiles].reverse():profiles){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    const page=await context.newPage(),cdp=await context.newCDPSession(page);
    await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpu});
    if(profile.network)await cdp.send('Network.emulateNetworkConditions',profile.network);
    await cdp.send('Performance.enable');
    const errors=[],failed=[],httpFailures=[],requested=[],bodies=[],captures=[];
    let phase='initial';
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('request',r=>requested.push({url:r.url(),phase,method:r.method()}));
    page.on('requestfailed',r=>failed.push({url:r.url(),failure:r.failure()}));
    page.on('response',r=>{if(r.status()>=400)httpFailures.push({url:r.url(),status:r.status()});
      const responsePhase=phase;
      if(new URL(r.url()).origin!==origin||r.request().method()!=='GET'||r.status()!==200)return;
      captures.push((async()=>{
        const bytes=await r.body(),relative=decodeURIComponent(new URL(r.url()).pathname).replace(/^\//,'');
        const target=path.join(artifact,'public',relative.endsWith('/')?relative+'index.html':relative);
        bodies.push({url:r.url(),phase:responsePhase,bytes:bytes.length,sha256:sha(bytes),artifactSha256:fs.existsSync(target)?sha(fs.readFileSync(target)):null});
      })().catch(e=>errors.push('response body: '+String(e))));
    });
    await page.addInitScript(()=>{window.__r1Lcp=null;new PerformanceObserver(list=>{for(const x of list.getEntries())window.__r1Lcp=x.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
    await page.goto(origin+'/esperienza/?percorso=fluidi-termodinamica',{waitUntil:'load'});
    await page.getByRole('heading',{name:'Che cosa tieni fisso?'}).waitFor();
    const initial=await page.evaluate(async()=>{
      await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      const nav=performance.getEntriesByType('navigation')[0];
      return {domContentLoadedMs:nav.domContentLoadedEventEnd,loadMs:nav.loadEventEnd,visibleFontsTwoFramesMs:performance.now(),lcpObservedMs:window.__r1Lcp,resources:performance.getEntriesByType('resource').map(r=>({url:r.name,initiator:r.initiatorType,decodedBytes:r.decodedBodySize,encodedBytes:r.encodedBodySize,transferBytes:r.transferSize})),overflow:document.documentElement.scrollWidth>innerWidth};
    });
    const before=(await cdp.send('Performance.getMetrics')).metrics;
    phase='interaction';
    await page.getByLabel('Rapporto previsto',{exact:true}).fill('4');
    const evaluateToTwoFramesMs=await measureInteraction(page,'click','.lab-controls > button.button-primary',()=>page.getByRole('button',{name:'Metti alla prova',exact:true}).click(),'[data-testid="physics-ratio"]');
    await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).focus();
    const radiusToTwoFramesMs=await measureInteraction(page,'input','input[type="range"]',()=>page.keyboard.press('ArrowLeft'),'svg[aria-label^="Due tubi cilindrici con rapporto dei raggi 1.95."]');
    const after=(await cdp.send('Performance.getMetrics')).metrics;
    await Promise.all(captures);
    check(`${width}/${sample}/${profile.name}: exact HTTP artifact bytes`,bodies.every(r=>r.sha256===r.artifactSha256));
    check(`${width}/${sample}/${profile.name}: local requests, no private API or automatic audio`,requested.every(r=>new URL(r.url).origin===origin&&!/\/study\/|\.wav(?:\?|$)/.test(r.url)));
    check(`${width}/${sample}/${profile.name}: no runtime/network/HTTP error or overflow`,errors.length+failed.length+httpFailures.length===0&&!initial.overflow);
    const row={label,width,sample,profile,initial,evaluateToTwoFramesMs,radiusToTwoFramesMs,memory:{jsHeapUsedBytes:metric(after,'JSHeapUsedSize'),jsHeapTotalBytes:metric(after,'JSHeapTotalSize')},mainThreadInteractionDeltaMs:{task:(metric(after,'TaskDuration')-metric(before,'TaskDuration'))*1000,script:(metric(after,'ScriptDuration')-metric(before,'ScriptDuration'))*1000,layout:(metric(after,'LayoutDuration')-metric(before,'LayoutDuration'))*1000},requests:requested,bodies,errors,failed,httpFailures};
    rows.push(row);fs.writeFileSync(path.join(out,'samples.json'),JSON.stringify(rows,null,2));
    await context.close();
    console.log(JSON.stringify({width,sample,profile:profile.name,loadMs:initial.loadMs,interactionMs:evaluateToTwoFramesMs}));
  }
  check('candidate manifest unchanged',sha(fs.readFileSync(path.join(artifact,'candidate-manifest.json')))===manifestSha);
  check('source manifest unchanged',sha(fs.readFileSync(path.join(artifact,'source-manifest.json')))===sourceManifestSha);
  const median=values=>{const a=[...values].sort((a,b)=>a-b);return a[Math.floor(a.length/2)];};
  const summaries=[];
  for(const width of [390,1440])for(const p of profiles){const a=rows.filter(x=>x.width===width&&x.profile.name===p.name);const resources=a[0].initial.resources;const sum=ext=>resources.filter(r=>new URL(r.url).pathname.endsWith(ext)).reduce((n,r)=>n+r.decodedBytes,0);summaries.push({width,profile:p.name,samples:a.length,domContentLoadedMs:median(a.map(x=>x.initial.domContentLoadedMs)),loadMs:median(a.map(x=>x.initial.loadMs)),visibleFontsTwoFramesMs:median(a.map(x=>x.initial.visibleFontsTwoFramesMs)),evaluateToTwoFramesMs:median(a.map(x=>x.evaluateToTwoFramesMs)),radiusToTwoFramesMs:median(a.map(x=>x.radiusToTwoFramesMs)),jsBytes:sum('.js'),cssBytes:sum('.css'),initialResources:resources.length,initialRequests:a[0].requests.filter(r=>r.phase==='initial').length,interactionRequests:a[0].requests.filter(r=>r.phase==='interaction').length,jsHeapUsedBytes:median(a.map(x=>x.memory.jsHeapUsedBytes)),taskDeltaMs:median(a.map(x=>x.mainThreadInteractionDeltaMs.task))});}
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({status:'PASS',label,origin,artifact,manifestSha,sourceManifestSha,node:process.version,browser:browser.version(),host:{loadAverage:os.loadavg(),cpuCount:os.cpus().length},checks,summaries,configuredProfiles:profiles,limits:'Shared host. Three new anonymous contexts per width/configured profile with cache disabled; OS/JIT/filesystem caches not reset. See configuredProfiles and each raw row for the exact throttle actually applied; no physical mobile/field INP/fps. Event-to-two-rAF proxy includes two frames and is not INP. CDP task/script/layout duration and JS heap are observed browser metrics, not OS CPU percent or a leak diagnosis. Fontready is current font set. Completed resource bytes differ from full artifact. No private API, token, user data, microphone, external model, contact submission or deploy.'},null,2));
})().catch(error=>{fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:String(error),rows,checks},null,2));console.error(error);process.exitCode=1;}).finally(()=>browser?.close());
