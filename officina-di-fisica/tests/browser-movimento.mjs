import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { piloti, problemi } from '../static/js/banchi/quaderno.js';

const engine = process.env.ASTRA_BROWSER || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engine), 'ASTRA_BROWSER deve essere chromium o webkit');
const root = fileURLToPath(new URL('../', import.meta.url)),
  tmp = await mkdtemp(path.join(tmpdir(), 'cric-moto-'));
const output = process.env.ASTRA_SHOTS;
const benches = JSON.parse(await readFile(path.join(root, 'content/banchi.json')));
const ids = [...benches.map((r) => r.id), 'SIM-C4-L10-02'];
const server = spawn(
  'python3',
  [
    '-u',
    '-c',
    "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()",
  ],
  { cwd: root, env: { ...process.env, ASTRA_DATA: tmp }, stdio: ['ignore', 'pipe', 'inherit'] },
);
const url = 'http://127.0.0.1:' + String((await once(server.stdout, 'data'))[0]).trim() + '/';
let browser;
const reports = [],
  errors = [];
async function shot(page, file, sel) {
  if (!output) return;
  const dest = path.join(output, file);
  await mkdir(path.dirname(dest), { recursive: true });
  if (!sel)
    await page.evaluate(async () => {
      await document.fonts.ready;
      scrollTo({ top: 0, behavior: 'instant' });
    });
  await (sel || page).screenshot({ path: dest, animations: 'disabled' });
}
async function checkCapillaryPlate(b, seek) {
  const svg = b.locator('.bench-stage .bench-diagram');
  const walls = svg.locator('[aria-label="Pareti del capillare"]');
  const probe = svg.locator('[aria-label="Tracciante della sonda"] circle');
  const set = (name, value) => b.locator('[name="' + name + '"]').fill(String(value));
  const reading = async (label) => {
    const value = await b
      .locator('[data-readings] div')
      .filter({ hasText: label })
      .locator('strong')
      .innerText();
    return Number(value.split(/\s/)[0].replace(',', '.'));
  };
  const geometry = () =>
    walls.evaluate((el) => {
      const { x, y, width, height } = el.getBBox();
      return { x, y, width, height };
    });
  const coord = async (key) => Number(await probe.getAttribute(key));
  const base = await geometry(),
    baseQ = await reading('Portata'),
    basePressure = await reading('Caduta');
  await set('r', 3);
  assert.equal((await geometry()).height, 2 * base.height, 'doppio raggio, doppio diametro sullo schermo');
  assert.ok(Math.abs((await reading('Portata')) / baseQ - 16) < 0.02);
  assert.equal(await reading('Caduta'), basePressure);

  await b.locator('[name=mode]').selectOption('flow');
  const widePressure = await reading('Caduta');
  await set('r', 1.5);
  assert.equal(await reading('Portata'), 1);
  assert.ok(Math.abs((await reading('Caduta')) / widePressure - 16) < 0.02);
  await set('probe', 0.5);
  await seek(0.1);
  const v = ((2 * 1e-6) / (Math.PI * 0.0015 ** 2)) * (1 - 0.5 ** 2);
  assert.ok(Math.abs(((await coord('cx')) - base.x) / base.width - (v * 0.1) / 0.2) < 1e-5);
  assert.equal(await coord('cy'), base.y + base.height / 4);
  await set('probe', 1);
  const stationary = await coord('cx');
  await seek(0.2);
  assert.equal(await coord('cx'), stationary);
  assert.equal(await coord('cy'), base.y);
  assert.equal(await reading('Velocità locale'), 0);

  await set('r', 0.5);
  await set('mu', 1);
  await set('flow', 12);
  assert.equal(await probe.count(), 0);
  assert.ok(await b.locator('.bench-warning').isVisible());
  await b.locator('[data-reset]').click();
}
async function explore(p, id, device, noGL) {
  const b = p.locator('[data-bench="' + id + '"]'),
    pilot = piloti[id];
  const phase = (i) => b.locator('[data-phase="' + i + '"]');
  const seek = async (t) =>
    b.locator('[data-scrub]').evaluate((el, t) => {
      el.value = String(t);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, t);
  const start = performance.now();
  await p.evaluate((id) => {
    location.hash = 'banco/' + id;
  }, id);
  await b
    .locator(noGL ? '.bench-diagram' : '[data-display]')
    .filter(noGL ? {} : { hasText: '3D interattivo' })
    .waitFor();
  if (!noGL)
    await p.waitForFunction(
      () => Number(document.querySelector('.bench-stage canvas')?.dataset.frames) > 0,
    );
  const launchMs = Math.round(performance.now() - start);
  await b.locator('[name=prediction]').first().check();
  await b.locator('[data-predict] button').click();
  assert.equal(await phase(1).getAttribute('aria-current'), 'step');
  if (pilot) {
    assert.equal(await b.locator('[data-play]').innerText(), 'Avvia');
  }
  await phase(2).click();
  if (!noGL && device === 'mobile') {
    const touch = b.locator('[data-touch]');
    assert.ok(await touch.isVisible());
    await touch.click();
    assert.equal(await touch.getAttribute('aria-pressed'), 'true');
    await touch.click();
    assert.equal(await touch.getAttribute('aria-pressed'), 'false');
  }
  await b.locator('[data-focus]').click();
  assert.ok(await b.getByRole('dialog').isVisible());
  await p.keyboard.press('Escape');
  await b.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(await b.locator('[data-focus]').getAttribute('aria-pressed'), 'false');
  assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  if (!pilot) {
    await shot(p, device + '/' + id + (noGL ? '-2d' : '-3d') + '.jpg');
    reports.push({ device, id, noGL, launchMs });
    return;
  }
  const play = b.locator('[data-play]'),
    stage = b.locator('.bench-stage'),
    clock = b.locator('[data-instant]');
  const duration = Number(await b.locator('[data-scrub]').getAttribute('max'));
  assert.ok(duration > 0);
  const actual = async () => Number(await clock.inputValue());
  await seek(duration * 0.14);
  const before = await stage.screenshot();
  await shot(p, 'frames/' + device + '-' + id + (noGL ? '-2d' : '-3d') + '-a.png', stage);
  await seek(duration * 0.63);
  assert.ok(!before.equals(await stage.screenshot()), 'il fenomeno deve cambiare a camera fissa ' + id);
  await shot(p, 'frames/' + device + '-' + id + (noGL ? '-2d' : '-3d') + '-b.png', stage);
  assert.ok(Math.abs((await actual()) - duration * 0.63) < 0.00002);
  const graph = b
    .locator(
      pilot === 'gas'
        ? '[data-track="volume"]'
        : ['volo', 'onde'].includes(pilot)
          ? '.bench-cursor'
          : '[data-track="time"]',
    )
    .first();
  const graphX = await graph.evaluate((el) => ({
    x: Number(el.getAttribute('x1')),
    lo: Number(el.dataset.lo),
    hi: Number(el.dataset.hi),
  }));
  const expectedX = pilot === 'gas' ? 3 + (1.5 - 3) * 0.63 : duration * 0.63;
  assert.ok(
    Math.abs(graphX.x - (58 + ((expectedX - graphX.lo) * 389) / (graphX.hi - graphX.lo))) < 0.02,
    'cursore sincronizzato ' + id,
  );
  if (pilot === 'onde' && noGL) {
    const sel = b.locator('[data-projection]');
    await sel.selectOption('section');
    await b.locator('.bench-diagram').getByText(/z =/).waitFor();
    await sel.selectOption('probe');
    await b.locator('.bench-diagram').getByText('Somma').waitFor();
    await sel.selectOption('top');
  }
  await shot(p, device + '/' + id + (noGL ? '-2d' : '-3d') + '.jpg');
  if (id === 'LAB3D-05' && !noGL) await shot(p, 'dopo-' + device + '.jpg');
  if (id === 'SIM-C4-L10-02') {
    assert.match(await b.locator('[data-readings]').innerText(), /Corrente\s+0 A/);
    await b.locator('[name=circuit]').selectOption('closed');
    assert.match(await b.locator('[data-readings]').innerText(), /0,2 A/);
  }
  const more = b.locator('.time-options');
  await more.locator('summary').click();
  await b.locator('[data-rate]').selectOption('0.5');
  await b.locator('[data-loop]').check();
  await seek(0);
  await more.locator('summary').click();
  await play.click();
  const sample = await stage.evaluate(async (el, noGL) => {
    const canvas = el.querySelector('canvas'),
      diagram = el.querySelector('[data-drawing]');
    let changes = 0;
    const observer = new MutationObserver(() => {
      changes++;
    });
    if (noGL) observer.observe(diagram, { childList: true });
    const clock = el.closest('.bench-instrument').querySelector('[data-instant]');
    const firstTime = clock.valueAsNumber;
    const base = Number(canvas.dataset.frames || 0),
      start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 660));
    observer.disconnect();
    return {
      elapsed: performance.now() - start,
      simulated: clock.valueAsNumber - firstTime,
      changes: noGL ? changes : Number(canvas.dataset.frames) - base,
    };
  }, noGL);
  await p.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hiddenTime = await actual();
  await p.waitForTimeout(140);
  assert.equal(await actual(), hiddenTime);
  await p.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await play.click();
  assert.equal(await play.innerText(), 'Avvia');
  const paused = await actual();
  await p.waitForTimeout(115);
  assert.equal(await actual(), paused);
  assert.ok(sample.changes > 0, device + ' ' + id + ' deve disegnare durante la riproduzione');
  // The displayed time refreshes every 80 ms and may cross the end of a repeating cycle.
  const difference = sample.simulated - sample.elapsed / 2000;
  const clockErrorMs = Math.round(1000 * Math.abs(difference - duration * Math.round(difference / duration)));
  assert.ok(clockErrorMs < 90, id + ' · scarto del tempo mostrato a ½×: ' + clockErrorMs + ' ms');
  await phase(3).click();
  const drawings = new Set();
  for (let i = 0; i < 4; i++) {
    const construction = b.locator('[data-math-art] svg');
    await construction.waitFor();
    assert.equal(
      await construction.getAttribute('aria-label'),
      await b.locator('[data-step-title]').innerText(),
    );
    drawings.add(await construction.innerHTML());
    if (device === 'desktop' && !noGL)
      await shot(p, 'passaggi/' + id + '-' + (i + 1) + '.png', construction);
    assert.match(await b.locator('[data-math-count]').innerText(), new RegExp('Disegno ' + (i + 1)));
    assert.ok((await b.locator('.reading-target').count()) === 1);
    if (i < 3) await b.locator('[data-math-next]').click();
  }
  assert.equal(drawings.size, 4, 'quattro costruzioni distinte');
  await phase(4).click();
  for (const [i, q] of problemi[pilot].entries()) {
    const form = b.locator('[data-check="' + (i + 2) + '"]');
    assert.match(await form.textContent(), new RegExp(q.unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await form.locator('input').fill(String(q.value));
    await form.locator('button').click();
    assert.match(await form.getByRole('status').innerText(), /^Corretto/);
  }
  await phase(2).click();
  await b.locator('[data-reset]').click();
  assert.equal(await actual(), 0);
  if (noGL && pilot === 'tubo') await checkCapillaryPlate(b, seek);
  reports.push({
    device,
    id,
    noGL,
    launchMs,
    framesPerSecond: Number(((sample.changes * 1000) / sample.elapsed).toFixed(1)),
    clockErrorMs,
  });
}
try {
  browser =
    engine === 'webkit'
      ? await webkit.launch()
      : await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
  for (const [device, width, height] of [
    ['desktop', 1440, 960],
    ['tablet', 810, 1080],
    ['mobile', 390, 844],
  ]) {
    if (process.env.ASTRA_VIEW && device !== process.env.ASTRA_VIEW) continue;
    for (const noGL of [false, true]) {
      const ctx = await browser.newContext({
        viewport: { width, height },
        isMobile: device !== 'desktop',
        hasTouch: device !== 'desktop',
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      try {
        await ctx.addInitScript((noGL) => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            if (noGL && type.includes('webgl')) return null;
            const gl = original.call(this, type, ...args);
            if (type === 'webgl2' && gl && !gl.instrumented) {
              gl.instrumented = true;
              const clear = gl.clear.bind(gl),
                el = this;
              gl.clear = (...args) => {
                el.dataset.frames = String(Number(el.dataset.frames || 0) + 1);
                return clear(...args);
              };
            }
            return gl;
          };
        }, noGL);
        await ctx.request.post(url + 'api/demo', { headers: { 'X-Astra-Request': '1' }, data: {} });
        const p = await ctx.newPage();
        p.setDefaultTimeout(12000);
        p.on('pageerror', (e) => errors.push(String(e)));
        p.on('console', (m) => {
          if (m.type() === 'error') errors.push(m.text());
        });
        await p.goto(url);
        for (const id of ids) {
          if (process.env.ASTRA_CASE && id !== process.env.ASTRA_CASE) continue;
          try {
            await explore(p, id, device, noGL);
          } catch (e) {
            throw Error(device + ' ' + id + ' ' + (noGL ? 'tavola' : 'WebGL') + ' · ' + e.message, {
              cause: e,
            });
          }
        }
        console.log(device, noGL ? 'tavola' : 'WebGL', reports.length, 'casi cumulativi');
      } finally {
        await ctx.close();
      }
    }
  }
  assert.deepEqual(errors, []);
  if (output) {
    await mkdir(output, { recursive: true });
    await writeFile(
      path.join(output, 'misure' + (process.env.ASTRA_VIEW ? '-' + process.env.ASTRA_VIEW : '') + '.json'),
      JSON.stringify(reports, null, 2),
    );
  }
} finally {
  await browser?.close();
  const end = once(server, 'exit');
  server.kill();
  await end;
  await rm(tmp, { recursive: true, force: true });
}
