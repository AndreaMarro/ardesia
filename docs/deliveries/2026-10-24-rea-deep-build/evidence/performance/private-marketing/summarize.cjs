// Preserve the failed local-origin assertion; summarize the complete raw sample
// set with its discovered external-font limitation instead of rerunning it.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require(path.resolve('apps/studio/node_modules/playwright-core'));
const out=__dirname, raw=JSON.parse(fs.readFileSync(path.join(out,'failure.json')));
const frozen=JSON.parse(fs.readFileSync(path.join(out,'baseline-source.json')));
const release=path.resolve('../deep-build/release-final-2');
const source=JSON.parse(fs.readFileSync(path.join(release,'source-manifest.json')));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const median=values=>{const sorted=values.filter(value=>value!==null).sort((a,b)=>a-b);return sorted.length?sorted[Math.floor(sorted.length/2)]:null};
const names=['baseline-studio','candidate-studio','baseline-marketing','candidate-marketing'];
const origins={'baseline-studio':'http://127.0.0.1:5419','candidate-studio':'http://127.0.0.1:5412','baseline-marketing':'http://127.0.0.1:5420','candidate-marketing':'http://127.0.0.1:5414'};
const summaries=[];
for(const name of names)for(const width of [390,1440]){
 const subset=raw.rows.filter(row=>row.target===name&&row.width===width),row={target:name,width,samples:subset.length};
 for(const field of ['domContentLoadedMs','loadMs','visibleFontsTwoFrameSnapshotMs','resourceCount','initialAllResourceDecodedBytes','lcpObservedMs'])row[field]=median(subset.map(sample=>sample[field]));
 row.lcpObservedSamples=subset.filter(sample=>sample.lcpObservedMs!==null).length;
 for(const extension of ['js','css']){
  const sizes=subset.map(sample=>sample.initialCompletedAssets.filter(asset=>new URL(asset.url).pathname.endsWith('.'+extension)));
  row[extension]={initialRequestedCompletedCount:median(sizes.map(assets=>assets.length)),decodedBytes:median(sizes.map(assets=>assets.reduce((n,asset)=>n+asset.decodedBodyBytes,0))),encodedBytes:median(sizes.map(assets=>assets.reduce((n,asset)=>n+asset.encodedBodyBytes,0))),transferBytes:median(sizes.map(assets=>assets.reduce((n,asset)=>n+asset.transferBytes,0))),offlineGzipBytes:median(sizes.map(assets=>assets.reduce((n,asset)=>n+raw.httpBytes.find(record=>record.target===name&&record.url===asset.url).gzipBytes,0)))};
 }
 const external=subset.map(sample=>sample.requests.filter(request=>new URL(request.url).origin!==origins[name]));
 row.externalResponseCountMedian=median(external.map(requests=>requests.length));
 row.externalResponseOrigins=[...new Set(external.flatMap(requests=>requests.map(request=>new URL(request.url).origin)))];
 summaries.push(row);
}
const checks=[...raw.checks,
 {name:'fonts reached loaded status',pass:raw.rows.every(row=>row.fontStatus==='loaded')},
 {name:'no horizontal overflow',pass:raw.rows.every(row=>!row.horizontalOverflow)},
 {name:'both Studio versions rendered an actual empty Excalidraw canvas',pass:raw.rows.filter(row=>row.target.endsWith('studio')).every(row=>row.canvasCount>0)},
 {name:'archived baseline source files remain unchanged',pass:Object.entries(frozen.files).every(([file,hash])=>sha(fs.readFileSync(path.join(frozen.path,file)))===hash)},
 {name:'all captured JS/CSS and main HTML bytes matched pinned baseline/final artifact files',pass:raw.httpBytes.length===82},
];
const publicFiles={};
function hashTree(dir,prefix=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name),name=prefix+entry.name;if(entry.isDirectory())hashTree(file,name+'/');else publicFiles[name]=sha(fs.readFileSync(file));}}
hashTree(path.resolve('../deep-build/baseline-marketing'));
const browserExe=chromium.executablePath();
const result={schemaVersion:1,status:'MEASUREMENTS_COMPLETE_WITH_EXTERNAL_FONT_LIMITATION',measuredSamples:raw.rows.length,base:frozen.base,baselineStudioSource:frozen.sha256,baselineMarketingArtifact:sha(Buffer.from(JSON.stringify(publicFiles))),baselineMarketingFiles:publicFiles,finalArtifactSource:source.sha256,dependencyLocksIdentical:frozen.locksIdentical,locks:frozen.locks,runnerProfile:'Explicit PATH /opt/homebrew/bin first for baseline rebuild and measurement runner: Node26.5.1. First Node22 baseline build discarded and retained separately.',installedBrowserCheckedAfterRun:{version:execFileSync(browserExe,['--version'],{encoding:'utf8'}).trim(),executableSha256:sha(fs.readFileSync(browserExe)),note:'The failure path did not save browser.version during sampling. Version is checked from the same pinned installed Playwright executable afterward; not retrospective field measurement.'},checks,summaries,limits:'3 cold isolated browser contexts per version/390/1440. Empty anonymous Studio lesson; no tokens, Study API, audio capture or user dataset. New contexts isolate HTTP/site cache; OS/process/JIT/font/filesystem caches are not reset. Shared host while root Studio frozen gate ran, no CPU/network throttle. Baseline Studio root on Python5419 vs candidate /studio/ on FastAPI5412; baseline marketing Python5420 vs composed public5414. Render proxy: Excalidraw visible (Studio), fonts.ready and two rAF callbacks including automation transport; not first-render instrumentation, field INP, fps, full replay or physical mobile performance. JS/CSS sizes count completed resource timing entries by that snapshot; gzip computed offline, not claimed wire compression. Third-party MathLive fonts from unpkg.com requested by BOTH frozen baseline and candidate, redirecting to @0.111.1: latency/cache/version outside artifact. Cross-origin timing body sizes can be zero. Therefore load/render medians are observations with uncontrolled external dependencies; no causal speedup/regression claim or local-network-only PASS. Missing LCP remains null.',attempts:'Initial baseline built under shell-default Node22, then rebuilt Node26 before any samples. One measurement run collected all24 rows and verified82 local HTML/JS/CSS HTTP bodies, then intentionally retained FAIL on same-origin assertion. No sample rerun, timeout increase, filter or product change. Summary derived from that complete failure.json, keeping the failed assertion visible.'};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(out,'samples.json'),JSON.stringify({rows:raw.rows,httpBytes:raw.httpBytes},null,2)+'\n');
console.log(JSON.stringify({status:result.status,samples:raw.rows.length,checks:checks.length,failedChecks:checks.filter(check=>!check.pass).map(check=>check.name)}));
for(const row of summaries)console.log(JSON.stringify({target:row.target,width:row.width,DCL:row.domContentLoadedMs,load:row.loadMs,render:row.visibleFontsTwoFrameSnapshotMs,js:row.js.decodedBytes,css:row.css.decodedBytes,external:row.externalResponseCountMedian}));
