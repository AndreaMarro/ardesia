import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const records = (
  await Promise.all(
    [1, 2, 3, 4, 5, 6].map(async (i) =>
      JSON.parse(await readFile(path.join(root, 'content/esperienze-C' + i + '.json'))),
    ),
  )
).flat();
const tmp = await mkdtemp(path.join(tmpdir(), 'officina-voci-'));
const boot =
  "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const server = spawn('python3', ['-c', boot], {
  cwd: root,
  env: { ...process.env, ASTRA_DATA: tmp },
  stdio: ['ignore', 'pipe', 'inherit'],
});
const url = 'http://127.0.0.1:' + String((await once(server.stdout, 'data'))[0]).trim() + '/';
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
const errors = [],
  external = [],
  evidence = process.env.ASTRA_SHOTS,
  readingsDir = process.env.ASTRA_RESULTS || evidence,
  results = [];
const representatives = new Set([
  'SIM-C1-L002-04',
  'SIM-C2-L010-03',
  'SIM-C3-L07-01',
  'SIM-C4-L10-01',
  'SIM-C5-L10-02',
  'SIM-C6-L05-01',
]);
const only = process.env.ASTRA_CASE;
const widths = { desktop: [1440, 960], tablet: [810, 1080], mobile: [390, 844], alternativa: [390, 844] };
const available = records.filter((r) => !only || r.id === only);
async function navigate(p, route, selector) {
  await p.evaluate((route) => {
    location.hash = route;
  }, route);
  await p.locator(selector).waitFor({ state: 'visible' });
}
async function navigationShot(page, format, name) {
  if (!evidence || !['desktop', 'mobile'].includes(format)) return;
  const dir = path.join(evidence, format);
  await mkdir(dir, { recursive: true });
  await page.evaluate(async () => { await document.fonts.ready; scrollTo(0, 0); });
  await page.screenshot({ path: path.join(dir, name + '.jpg'), type: 'jpeg', quality: 82 });
}

async function findLens(page, format) {
  const lens = 'SIM-C5-L10-02';
  const destination = page.locator('[data-bench="' + lens + '"]');
  const back = page.getByRole('link', { name: 'Torna all’attività' });
  const subjectLink = page.locator('a[href^="#banco/' + lens + '/"]');
  await page.goto(url);
  await page.getByRole('navigation', { name: 'Navigazione principale' })
    .getByRole('link', { name: 'Simulazioni 3D' }).click();
  const search = page.getByRole('searchbox', { name: 'Cerca un argomento' });
  if (format === 'mobile') {
    const normal = page.viewportSize();
    await page.setViewportSize({width: 320, height: 700});
    await search.waitFor();
    const fits = await page.locator('.mast nav a').evaluateAll((links) => {
      const bounds = links.map((a) => a.getBoundingClientRect());
      return document.documentElement.scrollWidth <= innerWidth + 1 &&
        bounds.every((b, i) => b.width > 0 && b.right <= innerWidth && (!i || b.left >= bounds[i-1].right));
    });
    assert.ok(fits, 'Navigazione leggibile anche a 320 px');
    await page.setViewportSize(normal);
  }
  await search.fill('lente');
  await subjectLink.waitFor();
  assert.equal(await page.locator('.sim-collections').isVisible(), false);
  await page.locator('a[href^="#banco/SIM-C5-L10-01/"]').waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await navigationShot(page, format, 'cerca-lente');
  await subjectLink.click();
  await destination.waitFor();
  await back.click();
  await search.waitFor();
  assert.equal(await search.inputValue(), 'lente');
  assert.ok(await subjectLink.isVisible());
  await search.fill('zzzzz');
  await page.locator('#simulazioni-voci').getByText('Nessuna simulazione trovata.', {exact: false}).waitFor();
  await search.fill('');
  assert.ok(await page.locator('.sim-collections').isVisible());
  assert.ok(await page.locator('.topic-shelf[data-course=C1]').isVisible());

  await navigate(page, 'corso/C5/attivita', '.tabs');
  await page.getByRole('link', {name: 'Simulazioni 3D delle lezioni'}).click();
  await search.waitFor();
  assert.equal(await page.locator('.sim-results a').count(), records.filter((r) => r.course === 'C5').length);
  await navigate(page, 'materiale/C5-L10/C5', '.reader');
  await page.getByRole('link', {name: 'Simulazioni 3D della lezione (2)'}).click();
  const visible = page.locator('#simulazioni-voci a:visible');
  await visible.first().waitFor();
  assert.equal(await visible.count(), 2);
  await subjectLink.click();
  await destination.waitFor();
  await back.click();
  await subjectLink.waitFor();

  await navigate(page, 'lab/LAB-C5/C5', '#lab-view');
  await navigationShot(page, format, 'banco-ottico');
  const distance = page.getByLabel('Valore numerico di Distanza oggetto cm');
  await distance.fill('8.5');
  await distance.press('Tab');
  const note = page.getByLabel('Che cosa hai osservato?');
  await note.fill('Osservo un’immagine virtuale.');
  await subjectLink.click();
  await destination.waitFor();
  await back.click();
  await distance.waitFor();
  assert.equal(await distance.inputValue(), '8.5');
  assert.equal(await note.inputValue(), 'Osservo un’immagine virtuale.');
  await page.getByRole('navigation', { name: 'Navigazione principale' })
    .getByRole('link', {name: 'Simulazioni 3D'}).click();
  await search.waitFor();
}

try {
  const publishedIds = records.map((r) => r.id).sort();
  for (const course of ['', 'C5', 'C6']) {
    const response = await fetch(url + 'api/simulazioni' + (course ? '/' + course : ''));
    assert.equal(response.status, 200);
    const {lessons} = await response.json();
    const outlines = lessons.flatMap((l) => l.experiments);
    assert.ok(outlines.every((e) => Object.keys(e).sort().join() === 'id,summary,title'));
    const ids = outlines.map((e) => e.id).sort();
    assert.deepEqual(ids, course === 'C5' ? records.filter((r) => r.course === course).map((r) => r.id).sort() : publishedIds);
  }
  assert.equal((await fetch(url + 'api/item/SIM-C5-L10-02')).status, 403);
  for (const [format, [width, height]] of Object.entries(widths)) {
    if (process.env.ASTRA_VIEW && format !== process.env.ASTRA_VIEW) continue;
    const noGL = format === 'alternativa',
      ctx = await browser.newContext({
        viewport: { width, height },
        isMobile: width < 1000,
        hasTouch: width < 1000,
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
    await ctx.route('**/*', (route) => {
      if (route.request().url().startsWith(url)) return route.continue();
      external.push(route.request().url());
      return route.abort();
    });
    await ctx.addInitScript((noGL) => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (noGL && type.includes('webgl')) return null;
        const gl = original.call(this, type, ...args);
        if (type === 'webgl2' && gl && !gl.observed) {
          gl.observed = true;
          const canvas = this;
          for (const name of ['drawElements', 'drawArrays']) {
            const draw = gl[name].bind(gl);
            gl[name] = (...v) => {
              canvas.dataset.painted = 'yes';
              return draw(...v);
            };
          }
        }
        return gl;
      };
    }, noGL);
    await ctx.request.post(url + 'api/demo', { headers: { 'X-Astra-Request': '1' }, data: {} });
    const p = await ctx.newPage();
    p.setDefaultTimeout(6500);
    p.on('pageerror', (e) => errors.push(String(e)));
    await findLens(p, format);
    const shelf = p.locator('.topic-shelf[data-course=C1]');
    await shelf.locator(':scope > summary').click();
    await shelf.locator('.topic-shelf-body details summary').first().click();
    await shelf.locator('a[href="#banco/SIM-C1-L001-01/laboratori"]').click();
    await p.locator('[data-bench="SIM-C1-L001-01"]').waitFor();
    await p.getByRole('link', { name: 'Torna all’attività' }).click();
    await p.locator('.topic-shelf[data-course=C1]').waitFor();
    let lastLesson = '';
    for (const r of available) {
      const act = await esperienza(r),
        { record } = act;
      try {
        const route = 'materiale/' + r.skill + '/' + r.course,
          link = 'a[href^="#banco/' + r.id + '/"]';
        if (lastLesson !== r.skill) {
          await navigate(p, route, '.reader .meta');
          await p.locator(link).waitFor({ state: 'attached' });
          const count = await p.locator('.bench-topic a[href^="#banco/SIM-"]').count();
          assert.equal(count, records.filter((s) => s.skill === r.skill).length);
          lastLesson = r.skill;
        }
        const a = p.locator(link);
        const paragraph = await a.evaluate(
          (el) => el.closest('details').previousElementSibling?.textContent || '',
        );
        assert.ok(paragraph.startsWith(r.anchor), r.id + ' · collegamento fuori dal paragrafo della voce');
        await a.evaluate((el) => (el.closest('details').open = true));
        await a.click();
        const row = p.locator('[data-bench="' + r.id + '"]');
        await row.waitFor();
        const c = row.locator('canvas');
        if (noGL) await row.locator('.bench-diagram').waitFor();
        else await row.locator('canvas[data-painted="yes"]').waitFor();
        assert.equal(await row.locator('h1').innerText(), r.title);
        await row.locator('[name=prediction]').nth(record.prediction.correct).check();
        await row.locator('[data-predict] button').click();
        const param = row.locator('[name=x]');
        const [[, base], [target, expected]] = r.references;
        const read = () => row.locator('[data-readings] div').nth(1).locator('strong').innerText();
        const parse = (text) => Number(text.trim().split(/\s/)[0].replace(/\./g, '').replace(',', '.'));
        const close = (got, want) =>
          assert.ok(Math.abs(got - want) <= Math.max(0.000001, Math.abs(want) * 0.0007), got + ' ≠ ' + want);
        close(parse(await read()), base);
        const imgDir = evidence && path.join(evidence, format);
        if (imgDir) await mkdir(imgDir, { recursive: true });
        await row.locator('[data-compare]').click();
        close(parse(await read()), expected);
        await row.locator('[data-reset]').click();
        close(parse(await read()), base);
        if (r.control.choices) await param.selectOption(String(target));
        else await param.fill(String(target));
        const measured = parse(await read());
        close(measured, expected);
        const button = row.locator('[data-next]');
        if (!noGL) {
          await row.locator('[data-view=top]').click();
          close(parse(await read()), expected);
          await row.locator('[data-reset-view]').click();
          if (format === 'desktop' && r.id === 'SIM-C1-L003-05') {
            await row.locator('[data-play]').click();
            await p.waitForFunction((v) => Number(document.querySelector('[name=x]').value) > v, target);
            await row.locator('[data-play]').click();
            await param.fill(String(target));
          }
        } else assert.ok((await row.locator('.bench-diagram > *').count()) > 3);
        const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false);
        await button.click();
        await button.click();
        if (imgDir && (format === 'desktop' || representatives.has(r.id))) {
          await row
            .locator('.bench-stage')
            .screenshot({ path: path.join(imgDir, r.id + '.jpg'), type: 'jpeg', quality: 82 });
          if (representatives.has(r.id)) {
            await p.evaluate(() => scrollTo(0, 0));
            await p.screenshot({ path: path.join(imgDir, r.id + '-pagina.jpg'), type: 'jpeg', quality: 82 });
          }
        }
        await button.click();
        for (const [i, task] of record.assessment.entries()) {
          const form = row.locator('[data-check="' + i + '"]');
          assert.ok(
            (await form.innerText()).includes(task.prompt),
            r.id + ' · consegna diversa dal problema della voce',
          );
          if (format === 'desktop') {
            await form.locator('[name=answer]').fill(String(-Math.abs(task.value) - 123));
            await form.locator('button').click();
            assert.doesNotMatch(await form.locator('[role=status]').innerText(), /^Corretto/);
          }
          await form.locator('[name=answer]').fill(String(task.value));
          await form.locator('button').click();
          assert.match(await form.locator('[role=status]').innerText(), /^Corretto/);
        }
        await row.getByRole('link', { name: 'Torna all’attività' }).click();
        await a.waitFor({ state: 'visible' });
        assert.equal(await a.evaluate((el) => el.closest('details').open), true);
        results.push({ id: r.id, format, lettura: measured });
      } catch (error) {
        throw new Error(format + ' ' + r.id + ': ' + error.message, { cause: error });
      }
    }
    console.log(format + ' · ' + available.length + ' simulazioni, collegamenti e verifiche');
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  if (readingsDir) {
    await mkdir(readingsDir, { recursive: true });
    await writeFile(
      path.join(
        readingsDir,
        'risultati' + (process.env.ASTRA_VIEW ? '-' + process.env.ASTRA_VIEW : '') + '.json',
      ),
      JSON.stringify(results) + '\n',
    );
  }
} catch (error) {
  console.error(error);
  throw error;
} finally {
  await browser.close();
  if (server.exitCode === null && server.signalCode === null) {
    const ended = once(server, 'exit');
    server.kill();
    await ended;
  }
  await rm(tmp, { recursive: true, force: true });
}
