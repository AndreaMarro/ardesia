import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, readFile, rm, appendFile } from 'node:fs/promises';
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
const engine = process.env.ASTRA_BROWSER || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engine), 'Motore browser sconosciuto');
const tmp = await mkdtemp(path.join(tmpdir(), 'officina-voci-'));
const boot =
  "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const server = spawn('python3', ['-c', boot], {
  cwd: root,
  env: { ...process.env, ASTRA_DATA: tmp },
  stdio: ['ignore', 'pipe', 'inherit'],
});
const url = 'http://127.0.0.1:' + String((await once(server.stdout, 'data'))[0]).trim() + '/';
let browser;
try {
  browser =
    engine === 'webkit'
      ? await webkit.launch()
      : await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
} catch (error) {
  server.kill();
  await rm(tmp, { recursive: true, force: true });
  throw error;
}
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
const sequenceIds = new Set([
  'SIM-C1-L004-04',
  'SIM-C2-L007-05',
  'SIM-C3-L04-03',
  'SIM-C4-L09-03',
  'SIM-C5-L05-03',
  'SIM-C6-L01-01',
]);
const only = process.env.ASTRA_CASE;
const widths = { desktop: [1440, 960], tablet: [810, 1080], mobile: [390, 844], alternativa: [390, 844] };
const courseFilter = process.env.ASTRA_COURSE;
const exerciseClocks = process.env.ASTRA_CLOCKS === '1';
const selected = records.filter(
  (r) => (!only || r.id === only) && (!courseFilter || r.course === courseFilter),
);
const startId = process.env.ASTRA_FROM;
const first = startId ? selected.findIndex((r) => r.id === startId) : 0;
assert.ok(first >= 0, 'La voce iniziale deve appartenere alla selezione');
const subset = selected.slice(first);
const available = exerciseClocks
  ? (await Promise.all(subset.map(async (r) => ((await esperienza(r)).clock ? r : null)))).filter(Boolean)
  : subset;
assert.ok(available.length, 'La selezione deve contenere almeno una simulazione');
async function navigate(p, route, selector) {
  await p.evaluate((route) => {
    location.hash = route;
  }, route);
  await p.locator(selector).first().waitFor({ state: 'visible' });
}
async function playback(row, duration, pace, noGL) {
  await row.locator('[data-rewind]').click();
  await row.locator('[data-loop]').check();
  await row.locator('.bench-stage').scrollIntoViewIfNeeded();
  const sample = await row.evaluate(async (node, diagram) => {
    const stage = node.querySelector('.bench-stage');
    const startStop = node.querySelector('[data-play]');
    const cursor = node.querySelector('[data-scrub]');
    const canvas = stage.querySelector('canvas');
    let draws = 0;
    const observer = new MutationObserver(() => { draws++; });
    if (diagram) observer.observe(stage.querySelector('[data-drawing]'), { childList: true });
    const sampleFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    await sampleFrame();
    await sampleFrame();
    const frames = Number(canvas.dataset.frames || 0);
    const start = performance.now();
    startStop.click();
    await new Promise((resolve) => setTimeout(resolve, 550));
    startStop.click();
    const elapsed = performance.now() - start;
    const simulated = cursor.valueAsNumber;
    observer.disconnect();
    const painted = diagram ? draws : Number(canvas.dataset.frames) - frames;
    await new Promise((resolve) => setTimeout(resolve, 120));
    return { elapsed, simulated, painted, paused: cursor.valueAsNumber, button: startStop.textContent };
  }, noGL);
  assert.ok(sample.painted > 1 && sample.button !== 'Pausa', 'riproduzione e pausa');
  assert.equal(sample.paused, sample.simulated, 'il tempo deve restare fermo in pausa');
  const difference = sample.simulated - (sample.elapsed * pace) / 1000;
  const errorMs = (Math.abs(difference - duration * Math.round(difference / duration)) * 1000) / pace;
  assert.ok(errorMs < 100, 'tempo simulato e tempo trascorso · scarto ' + errorMs + ' ms');
  return {
    fotogrammiAlSecondo: Math.round((1000 * sample.painted) / sample.elapsed),
    scartoMs: Math.round(errorMs),
  };
}

async function checkLessonLayout(ctx, format) {
  const phone = format === 'mobile';
  const [lesson, course, id, figure] = phone
    ? ['C1-L008', 'C1', 'SIM-C1-L008-01', 'C1-energia.svg']
    : ['C4-L07', 'C4', 'SIM-C4-L07-01', 'C4-condensatore.svg'];
  const page = await ctx.newPage();
  let showFigure;
  const delayed = new Promise((resolve) => {
    showFigure = resolve;
  });
  try {
    await page.route('**/figures/' + figure, async (route) => {
      await delayed;
      await route.continue();
    });
    await page.goto(url + '#materiale/' + lesson + '/' + course, { waitUntil: 'domcontentloaded' });
    const link = page.locator('a[href^="#banco/' + id + '/"]');
    const image = page.locator('.reader img[src$="' + figure + '"]');
    await link.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const coordinate = () => link.evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const before = await coordinate();
    const reservedHeight = await image.evaluate((el) => el.getBoundingClientRect().height);
    showFigure();
    await image.evaluate((el) => el.decode());
    assert.ok(reservedHeight > 0, 'Spazio riservato alla figura della lezione');
    assert.ok(Math.abs((await coordinate()) - before) <= 1, 'La figura sposta il collegamento al banco');
    await link.click();
    await page.locator('[data-bench="' + id + '"]').waitFor();
  } finally {
    showFigure();
    await page.close();
  }
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
      return (
        document.documentElement.scrollWidth <= innerWidth + 1 &&
        bounds.every((b, i) => b.width > 0 && b.right <= innerWidth && (!i || b.left >= bounds[i - 1].right))
      );
    });
    assert.ok(fits, 'Navigazione leggibile anche a 320 px');
    await page.setViewportSize(normal);
  }
  const featured = page.locator('.sim-featured');
  await featured.locator('summary').click();
  assert.deepEqual(await featured.locator('a').evaluateAll((links) => links.map((a) => a.hash.split('/')[1])),
    ['LAB3D-02', 'LAB3D-04', 'LAB3D-05', 'SIM-C4-L10-02', 'LAB3D-10']);
  await search.fill('lente');
  assert.equal(await featured.isVisible(), false);
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
  await page.locator('[data-phase="2"]').click();
  const distance = page.getByLabel('Valore numerico di Distanza oggetto cm');
  await distance.fill('8.5');
  await distance.press('Tab');
  await page.locator('[data-phase="4"]').click();
  const note = page.getByLabel('Che cosa hai osservato?');
  await note.fill('Osservo un’immagine virtuale.');
  await subjectLink.click();
  await destination.waitFor();
  await back.click();
  await note.waitFor();
  assert.equal(await note.inputValue(), 'Osservo un’immagine virtuale.');
  await page.locator('[data-phase="2"]').click();
  assert.equal(await distance.inputValue(), '8.5');
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
    await ctx.addInitScript(({ noGL, exerciseClocks }) => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (noGL && type.includes('webgl')) return null;
        const gl = original.call(this, type, ...args);
        if (type === 'webgl2' && gl && !gl.observed) {
          gl.observed = true;
          const canvas = this;
          if (exerciseClocks) {
            const clear = gl.clear.bind(gl);
            gl.clear = (...v) => {
              canvas.dataset.frames = String(Number(canvas.dataset.frames || 0) + 1);
              return clear(...v);
            };
          }
          for (const name of ['drawElements', 'drawArrays']) {
            const draw = gl[name].bind(gl);
            gl[name] = (...v) => {
              if (!canvas.dataset.painted) canvas.dataset.painted = 'yes';
              return draw(...v);
            };
          }
        }
        return gl;
      };
    }, { noGL, exerciseClocks });
    await ctx.request.post(url + 'api/demo', { headers: { 'X-Astra-Request': '1' }, data: {} });
    if (format === 'mobile' || format === 'tablet') await checkLessonLayout(ctx, format);
    const p = await ctx.newPage();
    p.setDefaultTimeout(30000);
    p.on('pageerror', (e) => errors.push(String(e)));
    try {
      await findLens(p, format);
    } catch (error) {
      const route = await p.evaluate(() => ({
        route: location.hash, heading: document.querySelector('main h1')?.textContent,
        bench: document.querySelector('[data-bench]')?.dataset.bench,
        search: Boolean(document.querySelector('#cerca-simulazione')),
        back: [...document.querySelectorAll('main a')].find(a => a.textContent === 'Torna all’attività')?.hash,
        busy: document.querySelector('main')?.getAttribute('aria-busy'),
      }));
      console.error('Percorso lente', format, route, errors);
      throw error;
    }
    const shelf = p.locator('.topic-shelf[data-course=C1]');
    await shelf.locator(':scope > summary').click();
    await shelf.locator('.topic-shelf-body details summary').first().click();
    await shelf.locator('a[href="#banco/SIM-C1-L001-01/laboratori"]').click();
    await p.locator('[data-bench="SIM-C1-L001-01"]').waitFor();
    await p.getByRole('link', { name: 'Torna all’attività' }).click();
    await p.locator('.topic-shelf[data-course=C1]').waitFor();
    for (const cid of ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']) {
      await navigate(p, 'corso/' + cid + '/lezioni', '.chapter-lab-link[href^="#laboratori/' + cid + '/"]');
      const referenced = cid === 'C6' ? records : records.filter((r) => r.course === cid);
      const chapterIds = [...new Set(referenced.map((r) => r.skill))].sort();
      const routes = await p
        .locator('.chapter-lab-link')
        .evaluateAll((links) => links.map((a) => a.hash).sort());
      assert.deepEqual(
        routes,
        chapterIds.map((id) => '#laboratori/' + cid + '/' + id),
        cid + ' · un accesso per capitolo',
      );
    }
    const journal = readingsDir && path.join(readingsDir, 'visite-' + format + '.jsonl');
    if (journal) {
      await mkdir(readingsDir, { recursive: true });
      await writeFile(journal, '');
    }
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
        assert.ok(await a.isVisible(), r.id + ' · voce già visibile nel paragrafo');
        await a.click();
        const row = p.locator('[data-bench="' + r.id + '"]');
        await row.waitFor();
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
        let motionChecked = false, run;
        const clock = act.clock;
        if (clock) {
          const more = row.locator('.time-options');
          const instant = row.locator('[data-instant]');
          const period = clock.duration(target, expected);
          assert.ok(period > 0);
          await more.locator('summary').click();
          const take = async (fraction) => {
            const t = Number((period * fraction).toFixed(7));
            await instant.fill(String(t));
            await instant.press('Tab');
            if (clock.input) close(parse(await read()), act.model.solve({ x: t }).y);
            else {
              close(parse(await read()), expected);
              close(
                parse(await row.locator('[data-readings] div').last().locator('strong').innerText()),
                clock.signal(target, t, expected),
              );
            }
            return row.locator('.bench-stage').screenshot();
          };
          const first = await take(0.13),
            second = await take(0.62);
          assert.ok(!first.equals(second), r.id + ' · movimento fisico a camera ferma');
          if (imgDir && format === 'desktop' && sequenceIds.has(r.id)) {
            const fractions = r.course === 'C6' ? [0, 0.5, 1] : [0, 0.13, 0.62];
            for (const [i, fraction] of fractions.entries()) {
              const shot = fraction === 0.13 ? first : fraction === 0.62 ? second : await take(fraction);
              await writeFile(path.join(imgDir, r.id + '-tempo-' + i + '.png'), shot);
            }
          }
          if (exerciseClocks) run = await playback(row, period, clock.pace, noGL);
          motionChecked = true;
          await more.locator('summary').click();
          await row.locator('[data-compare]').click();
        }
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
        const pair = row.locator('[data-comparison]');
        assert.ok(await pair.isVisible());
        assert.equal(await pair.locator('header p').innerText(), act.observe);
        const figures = pair.locator('figure');
        assert.equal(await figures.count(), 2);
        close(parse(await figures.nth(0).locator('p b').innerText()), base);
        close(parse(await figures.nth(1).locator('p b').innerText()), expected);
        assert.equal(await pair.locator('svg[role=img]').count(), 2);
        await pair.locator('[data-pin]').click();
        close(parse(await figures.nth(0).locator('p b').innerText()), expected);
        await row.locator('[data-reset]').click();
        await pair.locator('[data-pair-next]').click();
        close(parse(await figures.nth(0).locator('p b').innerText()), base);
        close(parse(await figures.nth(1).locator('p b').innerText()), expected);
        await button.click();
        if (imgDir && (format === 'desktop' || process.env.ASTRA_GALLERY || representatives.has(r.id))) {
          await row
            .locator('.bench-stage')
            .screenshot({ path: path.join(imgDir, r.id + '.jpg'), type: 'jpeg', quality: 82 });
          if (representatives.has(r.id)) {
            await pair.screenshot({
              path: path.join(imgDir, r.id + '-confronto.jpg'),
              type: 'jpeg',
              quality: 85,
            });
            await p.evaluate(() => scrollTo(0, 0));
            await p.screenshot({ path: path.join(imgDir, r.id + '-pagina.jpg'), type: 'jpeg', quality: 82 });
          }
        }
        await button.click();
        for (const [i, task] of record.assessment.entries()) {
          const form = row.locator('[data-check="' + i + '"]');
          assert.equal(await form.locator(':scope > p').first().innerText(), task.prompt,
            r.id + ' · consegna diversa dal problema della voce');
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
        const result = {
          id: r.id,
          format,
          lettura: measured,
          misureConfrontate: 2,
          movimentoVerificato: motionChecked,
          ...(run && { riproduzione: run }),
        };
        results.push(result);
        if (journal) await appendFile(journal, JSON.stringify(result) + '\n');
      } catch (error) {
        const screen = await p.locator('main h1').first().textContent({ timeout: 1000 }).catch(() => '');
        const route = new URL(p.url()).hash;
        throw new Error(format + ' ' + r.id + ' · ' + route + ' · ' + screen + ': ' + error.message, { cause: error });
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
        'risultati' + (process.env.ASTRA_VIEW ? '-' + process.env.ASTRA_VIEW : '') + (courseFilter ? '-' + courseFilter : '') + '.json',
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
