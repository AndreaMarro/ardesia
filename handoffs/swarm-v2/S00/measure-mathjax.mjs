// Isolated diagnostic, no changes to Vitest/gate/timeouts; real locked Vite output.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const require = createRequire(path.join(root, 'apps/studio/package.json'));
const {build} = await import(pathToFileURL(require.resolve('vite')).href);
const {equals, iterableEquality} = await import(pathToFileURL(require.resolve('@vitest/expect')).href);
const {localMathJax} = await import(pathToFileURL(path.join(root, 'apps/studio/build/localMathJax.ts')).href);
const [mode, output] = process.argv.slice(2);
assert(['deep','native'].includes(mode) && output, 'mode and output required');
const started = performance.now(), plugin = localMathJax(), readMs = performance.now() - started;
const buildStart = performance.now();
const built = await build({configFile:false, root:path.join(root,'apps/studio'), logLevel:'silent', plugins:[plugin, {
  name:'mathjax-build-probe', resolveId(id){if(id==='virtual:mathjax-probe')return id},
  load(id){if(id==='virtual:mathjax-probe')return 'export const probe = 1'},
}], build:{write:false,rollupOptions:{input:'virtual:mathjax-probe'}}});
const buildMs = performance.now() - buildStart;
const assets = (Array.isArray(built)?built:[built]).flatMap(b=>'output' in b?b.output:[]).filter(a=>a.type==='asset');
assert.deepEqual(assets.map(a=>a.fileName).sort(),['mathjax/LICENSE.txt','mathjax/tex-svg-full.js']);
const compare = mode==='deep' ? (a,b)=>equals(a,b,[iterableEquality]) : (a,b)=>a.equals(b);
const checks=[];
for(const [name, original] of [['mathjax/tex-svg-full.js','es5/tex-svg-full.js'],['mathjax/LICENSE.txt','LICENSE']]){
  const asset=assets.find(a=>a.fileName===name); assert.equal(asset.type,'asset');
  const actual=Buffer.from(asset.source), expected=readFileSync(path.join(root,'apps/studio/node_modules/mathjax-full',original));
  const before=process.memoryUsage(), begin=performance.now();
  assert.equal(compare(actual,expected),true);
  const comparisonMs=performance.now()-begin, after=process.memoryUsage();
  const corruptions=[];
  for(const index of [0,actual.length-1]){
    const changed=Buffer.from(actual);changed[index]^=1;
    assert.throws(()=>assert.equal(compare(changed,expected),true),{code:'ERR_ASSERTION'});
    corruptions.push({index,rejected:true});
  }
  checks.push({name,bytes:actual.length,comparisonMs,heapBefore:before.heapUsed,heapAfter:after.heapUsed,
    rssBefore:before.rss,rssAfter:after.rss,sha256:createHash('sha256').update(actual).digest('hex'),corruptions});
}
const report={schemaVersion:1,node:process.version,mode,matcher:mode==='deep'?'equals(a,b,[iterableEquality])':'Buffer.equals',readMs,buildMs,checks,
  maxRssKiB:process.resourceUsage().maxRSS,status:'PASS',limits:['Single isolated sample, not a production performance benchmark.','No inference that all historical latency came from this comparison.']};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
