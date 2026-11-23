import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';
import {readEdition} from './browser-copia-edizione.mjs';
import {misuraFluidi} from './browser-fluidi.mjs';

const origin = new URL(process.env.OFFICINA_BASE_URL).origin;
assert.equal(new URL(origin).protocol, 'https:');
const commit = process.env.OFFICINA_COMMIT_ATTESO;
assert.match(commit || '', /^[a-f0-9]{40}$/);
const output = path.resolve(process.env.ASTRA_RESULTS || 'var/prove-fluidi-https');
const root = fileURLToPath(new URL('../', import.meta.url));
const load = async name => JSON.parse(await readFile(path.join(root, name), 'utf8'));
const expected = new Set(Object.keys(await load('tests/fixtures/c2-edizione-v1.json')));
const texts = (await load('content/C2.json')).filter(item => expected.has(item.id));
const benches = (await load('content/esperienze-C2.json')).filter(item => expected.has(item.id));
assert.equal(texts.length, 13);
assert.equal(benches.length, 2);
await mkdir(output, {recursive:true});

async function capture(page, element, name) {
  await element.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(output, name+'.png'), animations:'disabled'});
}
async function audit(page) {
  const result = await page.evaluate(async () => {
    const report = await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
    return {violations:report.violations.map(issue => issue.id), overflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert.deepEqual(result.violations, []);
  assert.ok(result.overflow <= 1);
  return result;
}
async function health(context) {
  const response=await context.request.get(origin+'/api/health');
  assert.equal(response.status(), 200);
  assert.equal((await response.json()).commit, commit);
}
const reports=[];
for (const [engine,width,height] of [[chromium,1440,900],[webkit,320,780]]) {
  const fallback=width===320, profile=engine.name()+'-'+width;
  const browser=await engine.launch(engine===chromium ? {args:['--enable-unsafe-swiftshader']} : {});
  try {
    const ctx=await browser.newContext({viewport:{width,height},hasTouch:fallback,isMobile:fallback,locale:'it-IT',reducedMotion:'reduce'});
    const secret=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (secret) {
      await ctx.route(url => url.origin!==origin, route => route.abort());
      await ctx.setExtraHTTPHeaders({'x-vercel-protection-bypass':secret});
    }
    await ctx.addInitScript({path:path.join(root,'node_modules/axe-core/axe.min.js')});
    if (fallback) await ctx.addInitScript(() => {
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.includes('webgl') ? null : get.call(this,kind,...args)};
    });
    await health(ctx);
    const headers={'X-Astra-Request':'1'};
    assert.equal((await ctx.request.post(origin+'/api/demo',{data:{},headers})).status(),200);
    const page=await ctx.newPage();
    const errors=[];
    page.on('pageerror', e => errors.push(e.message));
    const observations=[];
    for (const bench of benches) observations.push(await misuraFluidi(page,origin,profile,bench,fallback,{capture,audit}));
    const measures={};
    for (const record of texts.filter(item => fallback || item.id==='C2-Q062')) {
      const {copy,widths}=await readEdition(page,origin,record);
      measures[record.id]=widths;
      if (record.id==='C2-Q062') {
        await copy.locator('figure img').waitFor();
        await capture(page,copy,profile+'-sezione');
      }
    }
    assert.deepEqual(errors,[]);
    await health(ctx);
    assert.equal((await ctx.request.post(origin+'/api/logout',{data:{},headers})).status(),200);
    reports.push({profile,engine:browser.version(),emulatedTouch:fallback,observations,measures,errors});
  } finally { await browser.close(); }
}
await writeFile(path.join(output,'fluidi-https.json'),JSON.stringify({origin,commit,reports},null,2)+'\n');
console.log('C2 online · due banchi · 13 svolgimenti letti a 320 px · '+commit);
