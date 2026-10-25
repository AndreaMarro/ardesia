// Six anonymous cold samples of the root's final Studio artifact after local-font fix.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),os=require('node:os');
const assert=require('node:assert/strict');
const {chromium}=require(path.resolve('apps/studio/node_modules/playwright-core'));
const out=__dirname,release=path.resolve(process.env.ARDESIA_PERF_RELEASE||'../deep-build/release-final-3');
const directory=path.join(release,'beta/studio'),origin='http://127.0.0.1:5412',prefix='/studio/';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const median=values=>{const sorted=values.filter(value=>value!==null).sort((a,b)=>a-b);return sorted.length?sorted[Math.floor(sorted.length/2)]:null};
const sourceBytes=fs.readFileSync(path.join(release,'source-manifest.json')),source=JSON.parse(sourceBytes);
const rows=[],assets=[],checks=[],checked=new Set();let browser;
const check=(name,value)=>{checks.push({name,pass:!!value});assert.ok(value,name)};
async function validate(context,url){
 if(checked.has(url))return;checked.add(url);
 const parsed=new URL(url);assert.equal(parsed.origin,origin);assert.ok(parsed.pathname.startsWith(prefix));
 const relative=decodeURIComponent(parsed.pathname.slice(prefix.length))||'index.html';
 const file=path.resolve(directory,relative);assert.ok(file.startsWith(directory+path.sep));
 const response=await context.request.get(url);assert.equal(response.status(),200);const bytes=await response.body();
 assert.equal(sha(bytes),sha(fs.readFileSync(file)),'HTTP bytes do not match final artifact: '+url);
 assets.push({url,relativePath:relative,bytes:bytes.length,gzipBytes:zlib.gzipSync(bytes).length,sha256:sha(bytes),contentEncoding:response.headers()['content-encoding']||null});
}
(async()=>{
 const hostAtStart={loadAverage:os.loadavg(),freeBytes:os.freemem(),cpuCount:os.cpus().length};
 browser=await chromium.launch({headless:true});const version=browser.version();
 for(const width of [390,1440])for(let sample=0;sample<3;sample++){
  const context=await browser.newContext({viewport:{width,height:1000},locale:'it-IT',reducedMotion:'reduce',deviceScaleFactor:1});
  try{
   await context.addInitScript(()=>{window.__labLCP=[];new PerformanceObserver(list=>window.__labLCP.push(...list.getEntries().map(entry=>entry.startTime))).observe({type:'largest-contentful-paint',buffered:true});});
   const page=await context.newPage(),errors=[],failedRequests=[],startedRequests=[],responses=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('requestfailed',request=>failedRequests.push({url:request.url(),error:request.failure()?.errorText}));
   page.on('request',request=>startedRequests.push({url:request.url(),type:request.resourceType()}));
   page.on('response',response=>responses.push({url:response.url(),status:response.status()}));
   const response=await page.goto(origin+prefix+'#perf-final3-empty-'+width+'-'+sample,{waitUntil:'load'});assert.equal(response.status(),200);
   await page.locator('.excalidraw').waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const measured=await page.evaluate(()=>{
    const nav=performance.getEntriesByType('navigation')[0],resources=performance.getEntriesByType('resource');
    return {domContentLoadedMs:nav.domContentLoadedEventEnd,loadMs:nav.loadEventEnd,visibleFontsTwoFrameSnapshotMs:performance.now(),lcpObservedMs:window.__labLCP.at(-1)??null,fontStatus:document.fonts.status,resourceCount:resources.length,initialAllResourceDecodedBytes:resources.reduce((n,r)=>n+r.decodedBodySize,0),initialCompletedAssets:resources.filter(r=>/\.(?:js|css|woff2?)$/.test(new URL(r.name).pathname)).map(r=>({url:r.name,decodedBodyBytes:r.decodedBodySize,encodedBodyBytes:r.encodedBodySize,transferBytes:r.transferSize})),horizontalOverflow:document.documentElement.scrollWidth>innerWidth,canvasCount:document.querySelectorAll('.excalidraw canvas').length};
   });
   const row={width,sample,...measured,errors,failedRequests,startedRequests,responses};rows.push(row);
   await validate(context,origin+prefix);
   for(const asset of measured.initialCompletedAssets)await validate(context,asset.url);
   if(sample===0)await page.screenshot({path:path.join(out,'final-studio-'+width+'.png'),fullPage:true});
  }finally{await context.close();}
 }
 check('six cold anonymous Studio contexts completed',rows.length===6);
 check('no page errors',rows.every(row=>row.errors.length===0));
 check('no failed requests',rows.every(row=>row.failedRequests.length===0));
 check('no HTTP failure statuses',rows.every(row=>row.responses.every(response=>response.status<400)));
 check('all started requests remain on the exact local origin',rows.every(row=>row.startedRequests.every(request=>new URL(request.url).origin===origin)));
 check('no user Study API requested',rows.every(row=>row.startedRequests.every(request=>!new URL(request.url).pathname.startsWith('/study/'))));
 check('canvas rendered and current font set loaded',rows.every(row=>row.canvasCount>0&&row.fontStatus==='loaded'));
 check('no horizontal overflow',rows.every(row=>!row.horizontalOverflow));
 check('final artifact source manifest unchanged',sourceBytes.equals(fs.readFileSync(path.join(release,'source-manifest.json'))));
 const summaries=[];
 for(const width of [390,1440]){
  const subset=rows.filter(row=>row.width===width),entry={target:'candidate-studio-final3',width,samples:subset.length};
  for(const field of ['domContentLoadedMs','loadMs','visibleFontsTwoFrameSnapshotMs','resourceCount','initialAllResourceDecodedBytes','lcpObservedMs'])entry[field]=median(subset.map(row=>row[field]));
  entry.lcpObservedSamples=subset.filter(row=>row.lcpObservedMs!==null).length;
  for(const extension of ['js','css','woff2']){
   const matches=subset.map(row=>row.initialCompletedAssets.filter(asset=>new URL(asset.url).pathname.endsWith('.'+extension)));
   entry[extension]={initialRequestedCompletedCount:median(matches.map(list=>list.length)),decodedBytes:median(matches.map(list=>list.reduce((n,asset)=>n+asset.decodedBodyBytes,0))),encodedBytes:median(matches.map(list=>list.reduce((n,asset)=>n+asset.encodedBodyBytes,0))),offlineGzipBytes:median(matches.map(list=>list.reduce((n,asset)=>n+assets.find(record=>record.url===asset.url).gzipBytes,0)))};
  }
  summaries.push(entry);
 }
 fs.writeFileSync(path.join(out,'final-studio-samples.json'),JSON.stringify({rows,assets},null,2)+'\n');
 fs.writeFileSync(path.join(out,'final-studio-summary.json'),JSON.stringify({status:'PASS',measuredAt:new Date().toISOString(),browser:version,node:process.version,artifactSource:source.sha256,checks,summaries,hostAtStart,hostAtEnd:{loadAverage:os.loadavg(),freeBytes:os.freemem()},limits:'Same three isolated contexts per390/1440 methodology, fonts.ready+two rAF snapshot after Excalidraw is visible. No tokens/user dataset, capture, CPU/network throttle, INP, fps or replay workload. Host shared with root gates; OS/process/font/filesystem caches uncontrolled. Initial assets are completed timing entries, offline gzip is not wire compression. Baseline had external unpinned MathLive fonts; final local pinned fonts are a product change, so load/render timing differences are not a controlled pure-JS comparison. Original24sample FAIL remains intact; this final six-sample set is separate.'},null,2)+'\n');
 await browser.close();browser=null;console.log(JSON.stringify({checks:checks.length,samples:rows.length,artifactSource:source.sha256}));
})().catch(async error=>{fs.writeFileSync(path.join(out,'final-studio-failure.json'),JSON.stringify({error:String(error.stack),rows,checks,assets},null,2));if(browser)await browser.close();console.error(error);process.exitCode=1});
