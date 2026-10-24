// Anonymous local load comparison. No auth, capture, user dataset or product edits.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), zlib = require('node:zlib');
const assert = require('node:assert/strict');
const {chromium} = require(path.resolve('apps/studio/node_modules/playwright-core'));
const out = path.resolve('docs/deliveries/2026-10-24-rea-deep-build/evidence/performance/private-marketing');
const release = path.resolve(process.env.ARDESIA_PERF_RELEASE || '../deep-build/release-final-2');
const baseline = path.resolve('../deep-build/performance-baseline-studio');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const artifactSourceBefore = fs.readFileSync(path.join(release, 'source-manifest.json'));
const frozen = JSON.parse(fs.readFileSync(path.join(out, 'baseline-source.json')));
const cases = [
 {name:'baseline-studio',url:'http://127.0.0.1:5419/',prefix:'/',dir:path.join(baseline,'apps/studio/dist'),studio:true},
 {name:'candidate-studio',url:'http://127.0.0.1:5412/studio/',prefix:'/studio/',dir:path.join(release,'beta/studio'),studio:true},
 {name:'baseline-marketing',url:'http://127.0.0.1:5420/',prefix:'/',dir:path.resolve('../deep-build/baseline-marketing'),studio:false},
 {name:'candidate-marketing',url:'http://127.0.0.1:5414/',prefix:'/',dir:path.join(release,'public'),studio:false},
];
const rows=[], checks=[], httpBytes=[], artifacts=new Map(); let browser;
const median = values => {const sorted=values.filter(value=>value!==null).sort((a,b)=>a-b);return sorted.length ? sorted[Math.floor(sorted.length/2)] : null};
const check=(name,value)=>{checks.push({name,pass:!!value});assert.ok(value,name)};
function localPath(target,url) {
 const parsed=new URL(url); assert.equal(parsed.origin,new URL(target.url).origin);
 assert.ok(parsed.pathname.startsWith(target.prefix));
 const relative=decodeURIComponent(parsed.pathname.slice(target.prefix.length));
 const result=path.resolve(target.dir,relative || 'index.html');
 assert.ok(result===target.dir || result.startsWith(target.dir+path.sep));return result;
}
function bodyAsset(target,url,bytes,headers) {
 const file=localPath(target,url); assert.ok(fs.existsSync(file),file);
 const expected=fs.readFileSync(file); assert.equal(sha(bytes),sha(expected),'HTTP bytes differ from frozen artifact: '+url);
 return {target:target.name,url,relativePath:path.relative(target.dir,file),bytes:bytes.length,sha256:sha(bytes),gzipBytes:zlib.gzipSync(bytes).length,contentEncoding:headers['content-encoding']||null};
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});browser=await chromium.launch({headless:true});
 for(const width of [390,1440]) for(let sample=0;sample<3;sample++) {
  const sequence=sample%2===0 ? cases : [cases[1],cases[0],cases[3],cases[2]];
  for(const target of sequence) {
   const context=await browser.newContext({viewport:{width,height:1000},locale:'it-IT',reducedMotion:'reduce',deviceScaleFactor:1});
   await context.addInitScript(()=>{window.__labLCP=[];new PerformanceObserver(list=>window.__labLCP.push(...list.getEntries().map(entry=>entry.startTime))).observe({type:'largest-contentful-paint',buffered:true});});
   const page=await context.newPage(), errors=[], failures=[], requests=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('requestfailed',request=>failures.push({url:request.url(),error:request.failure()?.errorText}));
   page.on('response',response=>requests.push({url:response.url(),status:response.status()}));
   const room=target.studio ? '#perf-empty-'+width+'-'+sample : '';
   const started=Date.now(); const response=await page.goto(target.url+room,{waitUntil:'load'});assert.equal(response.status(),200);
   if(target.studio)await page.locator('.excalidraw').waitFor({state:'visible'});
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const metrics=await page.evaluate(()=>{
    const nav=performance.getEntriesByType('navigation')[0],resources=performance.getEntriesByType('resource');
    const assets=resources.filter(entry=>/\.(?:js|css)$/.test(new URL(entry.name).pathname)).map(entry=>({url:entry.name,decodedBodyBytes:entry.decodedBodySize,encodedBodyBytes:entry.encodedBodySize,transferBytes:entry.transferSize,responseEndMs:entry.responseEnd}));
    return {domContentLoadedMs:nav.domContentLoadedEventEnd,loadMs:nav.loadEventEnd,visibleFontsTwoFrameSnapshotMs:performance.now(),lcpObservedMs:window.__labLCP.at(-1)??null,resourceCount:resources.length,initialCompletedAssets:assets,initialAllResourceDecodedBytes:resources.reduce((n,entry)=>n+entry.decodedBodySize,0),fontStatus:document.fonts.status,horizontalOverflow:document.documentElement.scrollWidth>innerWidth,canvasCount:document.querySelectorAll('.excalidraw canvas').length};
   });
   const html=await response.body();const documentRecord=bodyAsset(target,target.url,html,response.headers());
   httpBytes.push(documentRecord);
   for(const resource of metrics.initialCompletedAssets)artifacts.set(target.name+' '+resource.url,{target,url:resource.url});
   if(sample===0)await page.screenshot({path:path.join(out,target.name+'-'+width+'.png'),fullPage:true});
   rows.push({target:target.name,width,sample,startedAt:new Date(started).toISOString(),wallElapsedMs:Date.now()-started,...metrics,errors,failures,requests});
   await context.close();
  }
 }
 for(const {target,url} of artifacts.values()){
  const response=await browser.newContext();
  try {const asset=await response.request.get(url);assert.equal(asset.status(),200);httpBytes.push(bodyAsset(target,url,await asset.body(),asset.headers()));}
  finally{await response.close();}
 }
 check('all Studio and marketing samples used three new anonymous contexts per width',rows.length===24);
 check('no page errors',rows.every(row=>row.errors.length===0));
 check('no failed requests',rows.every(row=>row.failures.length===0));
 check('no HTTP failure statuses',rows.every(row=>row.requests.every(request=>request.status<400)));
 check('no user Study API requested',rows.every(row=>row.requests.every(request=>!new URL(request.url).pathname.startsWith('/study/'))));
 check('all responses stay on the tested local origin',rows.every(row=>row.requests.every(request=>new URL(request.url).origin===new URL(cases.find(target=>target.name===row.target).url).origin)));
 check('fonts reached loaded status',rows.every(row=>row.fontStatus==='loaded'));
 check('no horizontal overflow',rows.every(row=>!row.horizontalOverflow));
 check('both Studio versions rendered an actual empty Excalidraw canvas',rows.filter(row=>row.target.endsWith('studio')).every(row=>row.canvasCount>0));
 check('final artifact source manifest remained immutable',artifactSourceBefore.equals(fs.readFileSync(path.join(release,'source-manifest.json'))));
 check('archived baseline source files remain unchanged',Object.entries(frozen.files).every(([file,hash])=>sha(fs.readFileSync(path.join(baseline,file)))===hash));
 const summaries=[];
 for(const target of cases)for(const width of [390,1440]){
  const subset=rows.filter(row=>row.target===target.name&&row.width===width);
  const dimensions={target:target.name,width,samples:subset.length};
  for(const field of ['domContentLoadedMs','loadMs','visibleFontsTwoFrameSnapshotMs','resourceCount','initialAllResourceDecodedBytes','lcpObservedMs'])dimensions[field]=median(subset.map(row=>row[field]));
  dimensions.lcpObservedSamples=subset.filter(row=>row.lcpObservedMs!==null).length;
  for(const extension of ['js','css']){
   const counts=[],raw=[],encoded=[],transfer=[],gzip=[];
   for(const row of subset){const assets=row.initialCompletedAssets.filter(asset=>new URL(asset.url).pathname.endsWith('.'+extension));counts.push(assets.length);raw.push(assets.reduce((n,asset)=>n+asset.decodedBodyBytes,0));encoded.push(assets.reduce((n,asset)=>n+asset.encodedBodyBytes,0));transfer.push(assets.reduce((n,asset)=>n+asset.transferBytes,0));gzip.push(assets.reduce((n,asset)=>n+httpBytes.find(record=>record.target===target.name&&record.url===asset.url).gzipBytes,0));}
   dimensions[extension]={initialRequestedCompletedCount:median(counts),decodedBytes:median(raw),encodedBytes:median(encoded),transferBytes:median(transfer),offlineGzipBytes:median(gzip)};
  }
  summaries.push(dimensions);
 }
 const result={schemaVersion:1,measuredAt:new Date().toISOString(),browser:browser.version(),runnerNode:process.version,base:frozen.base,baselineSourceSha256:frozen.sha256,locks:frozen.locks,artifactSource:JSON.parse(artifactSourceBefore).sha256,cases:cases.map(({name,url,dir})=>({name,url,dir})),checks,summaries,limits:'Three new isolated Chromium contexts per version/390/1440; empty Studio lesson, no tokens or user dataset; no CPU/network throttling and shared host during root Studio gate. Render proxy is visible Excalidraw (Studio only), fonts.ready and two requestAnimationFrame callbacks, including browser automation transport; it is not first-render instrumentation, INP, fps, a full replay benchmark or physical mobile performance. Initial assets are JS/CSS resource timing entries completed by that snapshot. Browser/OS font caches, process JIT, filesystem cache, server implementation and lazy loading are uncontrolled; contexts isolate HTTP/site storage, not the OS. JS/CSS gzip is computed offline, not claimed wire compression. LCP observer values may be undispatched at snapshot and missing values remain null. Baseline Studio root vs candidate /studio/; Python baseline servers vs composed Python/FastAPI candidate. Local timings alone do not establish causal speedup/regression.'};
 fs.writeFileSync(path.join(out,'samples.json'),JSON.stringify({rows,httpBytes},null,2));
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(result,null,2));
 await browser.close();browser=null;console.log(JSON.stringify({checks:checks.length,samples:rows.length,out}));
})().catch(async error=>{fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:String(error.stack),rows,checks,httpBytes},null,2));if(browser)await browser.close();console.error(error);process.exitCode=1});
