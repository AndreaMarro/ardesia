import assert from 'node:assert/strict';
import {execFileSync, spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {once} from 'node:events';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const app = process.cwd();
const output = process.argv[2];
assert.ok(output && path.isAbsolute(output));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const cases = {
  'SIM-C3-L04-03': [[1, 0], [1, 0.125], [1, 0.25], [1, 0.375], [2, 0.25], [3, 0.375]],
  'SIM-C3-L09-01': [[0], [5]],
  'SIM-C3-L09-02': [[0], [10]],
};
const fingerprint = () => JSON.parse(execFileSync('python3', ['-B', '-m', 'tools.corpus_engineering.runtime_fingerprint'], {cwd:app}));
const before = fingerprint();
const staging = await mkdtemp('/private/tmp/cric-local-thermal-preview-');
const boot = `from server import store
from server.web import Handler, ThreadingHTTPServer
store.initialize()
server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
print(server.server_port, flush=True)
server.serve_forever()`;
const server = spawn('python3', ['-uc', boot], {cwd:app, env:{...process.env, ASTRA_DATA:staging,
  ASTRA_HOSTED:'0', ASTRA_HTTPS:'0', ASTRA_EXTENSIONS:path.join(app,'extensions')}, stdio:['ignore','pipe','inherit']});
const report = {runtime:before, testSha256:sha(await readFile(fileURLToPath(import.meta.url))), actual:[], errors:[],
  status:'INCOMPLETE', humanApproval:'NOT_RUN', publicationAction:'NONE'};
let browser;

try {
  await mkdir(output, {recursive:true});
  const [port] = await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => {throw Error('Preview server exited');})]);
  const base = 'http://127.0.0.1:' + String(port).trim();
  browser = await chromium.launch({channel:'chrome', args:['--enable-unsafe-swiftshader']});
  report.browser = browser.version();
  for (const width of [320, 1280]) {
    for (const view of ['orbit', 'side', 'top', 'diagram']) {
      const fallback = view === 'diagram';
      const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',bypassCSP:true});
      if (fallback) {
        await context.addInitScript(() => {
          const getContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(kind,...args) {
            return kind.includes('webgl') ? null : getContext.call(this,kind,...args);
          };
        });
      }
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.on('pageerror', error => report.errors.push(String(error)));
      for (const [id, states] of Object.entries(cases)) {
        await page.goto(base + '/#banco/' + id);
        await page.locator('[data-predict]').waitFor();
        await page.locator('[name=prediction]').first().check();
        await page.locator('[data-predict] button').click();
        await page.locator('[data-phase="3"]').click();
        if (!fallback) {
          const button = page.locator('[data-view="' + view + '"]');
          await button.click();
          await page.waitForFunction(v => document.querySelector('[data-view="' + v + '"]')?.getAttribute('aria-pressed') === 'true', view);
        }
        const legend = page.locator('.scene-key');
        if (!await legend.evaluate(element => element.open)) await legend.locator('summary').press('Enter');
        const legendText = await legend.innerText();
        assert.match(legendText,/ocra.*32 volte/);
        if (fallback) assert.doesNotMatch(legendText,/Obliqua o Laterale/);
        await page.addScriptTag({path:path.join(app,'node_modules/axe-core/axe.min.js')});
        const violations = await page.locator('.bench-room').evaluate(async element => (await window.axe.run(element,
          {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(row => row.id));
        assert.deepEqual(violations, []);
        const stage = page.locator('.bench-stage');
        for (const [input, instant] of states) {
          await page.locator('[name=x]').evaluate((element,value) => {
            element.value = String(value); element.dispatchEvent(new Event('input',{bubbles:true}));
          },input);
          if (instant !== undefined) {
            await page.locator('[data-instant]').evaluate((element,value) => {
              element.value = String(value); element.dispatchEvent(new Event('change',{bubbles:true}));
            },instant);
          }
          await stage.scrollIntoViewIfNeeded();
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const observed = await page.evaluate(() => ({
            input:Number(document.querySelector('[name=x]').value),
            instant:document.querySelector('[data-instant]')?.value ?? null,
            colorArrows:[...document.querySelectorAll('.bench-stage svg path[stroke="#d49332"][stroke-width="2.7"]')].map(element => element.getAttribute('d')),
            canvasCount:document.querySelectorAll('.bench-stage canvas').length,
            overflow:document.documentElement.scrollWidth-innerWidth,
          }));
          assert.equal(observed.input,input);
          if (instant !== undefined) assert.equal(Number(observed.instant),instant);
          assert.ok(observed.overflow <= 1);
          if (fallback) {
            assert.equal(observed.canvasCount,0);
            assert.equal(observed.colorArrows.length,(instant ?? input) > 0 ? 1 : 0);
          } else {
            assert.equal(observed.canvasCount,1);
          }
          const image = await stage.screenshot();
          const imageSha = sha(image);
          await writeFile(path.join(output,imageSha+'.png'),image);
          report.actual.push({id,width,view,input,instant:instant ?? null,observed,legendText,imageSha});
        }
      }
      await context.close();
    }
  }
  assert.deepEqual(report.errors,[]);
  assert.deepEqual(fingerprint(),before);
  assert.equal(report.actual.length,80);
  report.status = 'ACTUAL_BOUNDED_PREVIEW';
} catch (error) {
  report.failure = String(error);
  throw error;
} finally {
  await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  await browser?.close();
  server.kill('SIGTERM');
  server.stdout.destroy();
  server.unref();
  await rm(staging,{recursive:true,force:true});
}
