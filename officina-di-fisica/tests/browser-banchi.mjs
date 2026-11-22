import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url)),
  db = await mkdtemp(path.join(tmpdir(), 'officina-banchi-'));
const records = JSON.parse(await readFile(path.join(root, 'content/banchi.json')));
const boot =
  "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const server = spawn('python3', ['-c', boot], {
  cwd: root,
  env: { ...process.env, ASTRA_DATA: db },
  stdio: ['ignore', 'pipe', 'inherit'],
});
const url = 'http://127.0.0.1:' + String((await once(server.stdout, 'data'))[0]).trim() + '/';
const shots = process.env.ASTRA_SHOTS,
  report = [],
  errors = [],
  external = [];
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
const navigate = (page, route) =>
  page.evaluate((hash) => {
    location.hash = hash;
  }, route);
const assertShown = (sel) => sel.waitFor({ state: 'visible' });
async function context(width, height, touch = false, disable = false) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    hasTouch: touch,
    isMobile: touch,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  });
  await ctx.route('**/*', (route) => {
    if (!route.request().url().startsWith(url)) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await ctx.addInitScript((noGL) => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (noGL && type.includes('webgl')) return null;
      const gl = original.call(this, type, ...args);
      if (gl && type === 'webgl2' && !gl.benchCounter) {
        gl.benchCounter = true;
        this.dataset.draws = '0';
        const canvas = this;
        canvas.dataset.frames = '0';
        const clear = gl.clear.bind(gl);
        gl.clear = (...args) => {
          canvas.dataset.frames = String(Number(canvas.dataset.frames) + 1);
          return clear(...args);
        };
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        canvas.dataset.renderer = info
          ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
          : gl.getParameter(gl.RENDERER);
        for (const resource of ['Buffer', 'Texture', 'Program']) {
          const allocated = new Set(),
            create = gl['create' + resource].bind(gl),
            release = gl['delete' + resource].bind(gl);
          const initialTextures = new Set();
          canvas.addEventListener('webglcontextlost', () => {
            if (resource === 'Texture')
              canvas.dataset.releasedTextures = String(
                [...allocated].every((v) => initialTextures.has(v) && !gl.isTexture(v)),
              );
          });
          const update = () => (canvas.dataset[resource.toLowerCase()] = String(allocated.size));
          gl['create' + resource] = (...args) => {
            const v = create(...args);
            if (resource === 'Texture' && initialTextures.size < 4) initialTextures.add(v);
            allocated.add(v);
            update();
            return v;
          };
          gl['delete' + resource] = (v) => {
            allocated.delete(v);
            update();
            return release(v);
          };
        }
        for (const key of ['drawElements', 'drawArrays']) {
          const fn = gl[key].bind(gl);
          gl[key] = (...params) => {
            canvas.dataset.draws = String(Number(canvas.dataset.draws) + 1);
            return fn(...params);
          };
        }
        this.addEventListener('webglcontextlost', () => {
          canvas.dataset.lost = 'yes';
        });
      }
      return gl;
    };
  }, disable);
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', (e) => errors.push(String(e)));
  await ctx.request.post(url + 'api/demo', { headers: { 'X-Astra-Request': '1' }, data: {} });
  await page.goto(url + '#materiale/C1-L004/C1');
  await assertShown(page.locator('.reader'));
  assert.equal(
    await page.evaluate(() =>
      performance.getEntriesByType('resource').some((e) => /three-r180|\/scene\/|\/modelli\//.test(e.name)),
    ),
    false,
  );
  return { ctx, page };
}
async function predict(page, r) {
  await assertShown(page.locator('[data-bench="' + r.id + '"] [data-predict]'));
  await page.locator('[name=prediction]').nth(r.prediction.correct).check();
  await page.locator('[data-predict] button').click();
  await assertShown(page.locator('[data-guide]'));
  assert.match(await page.locator('[data-response]').innerText(), /corretta/);
}
const advance = (page) => page.locator('[data-next]').click();
async function set(page, name, value) {
  await page.locator('[name="' + name + '"]').evaluate((el, val) => {
    el.value = String(val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}
async function snapshot(page, name) {
  if (!shots) return;
  await mkdir(shots, { recursive: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(shots, name + '.jpg'),
    type: 'jpeg',
    quality: 82,
    animations: 'disabled',
  });
}
async function pinch(page, canvas) {
  const gestures = page.locator('[data-touch]');
  if (await gestures.isVisible() && await gestures.getAttribute('aria-pressed') !== 'true') await gestures.click();
  const cdp = await page.context().newCDPSession(page);
  const rect = await canvas.boundingBox(),
    x = rect.x + rect.width / 2,
    y = rect.y + rect.height / 2;
  for (const [type, delta] of [
    ['touchStart', 24],
    ['touchMove', 39],
    ['touchMove', 54],
    ['touchEnd', 0],
  ]) {
    await cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints:
        type === 'touchEnd'
          ? []
          : [
              { x: x - delta, y, id: 1 },
              { x: x + delta, y, id: 2 },
            ],
    });
  }
  await cdp.detach();
}
async function answers(page, r) {
  for (const [i, a] of r.assessment.entries()) {
    const form = page.locator('[data-check="' + i + '"]');
    await form.locator('input').fill('999999');
    await form.locator('button').click();
    assert.match(await form.locator('[role=status]').innerText(), /Rivedi/);
    await form.locator('input').fill(String(a.value).replace('.', ','));
    await form.locator('button').click();
    assert.match(await form.locator('[role=status]').innerText(), /^Corretto/);
  }
}
try {
  for (const [device, w, h, touch] of [
    ['desktop', 1440, 960, false],
    ['tablet', 810, 1080, true],
    ['mobile', 390, 844, true],
  ]) {
    const { ctx, page } = await context(w, h, touch);
    for (const r of records) {
      const resources = [];
      const track = (req) => resources.push(req.url());
      page.on('request', track);
      const t0 = performance.now();
      await navigate(page, 'banco/' + r.id);
      const canvas = page.locator('.bench-stage canvas');
      await assertShown(page.locator('[data-display]').filter({ hasText: '3D interattivo' }));
      await page.waitForFunction(
        () => Number(document.querySelector('.bench-stage canvas')?.dataset.draws) > 0,
      );
      const ms = Math.round(performance.now() - t0);
      assert.equal(await page.locator('[data-experiment]').isVisible(), false);
      for (const u of resources.filter((u) => /\/scene\/|\/modelli\//.test(u)))
        assert.ok(u.endsWith('/' + r.model + '.js'), u);
      page.off('request', track);
      await predict(page, r);
      await advance(page);
      await advance(page);
      if (r.model === 'piano') await set(page, 'angle', 26);
      if (r.model === 'campo') {
        await set(page, 'q2', -2);
        await set(page, 'sy', 0.5);
      }
      if (r.model === 'volo') await set(page, 'azimuth', 0);
      const timed = await page.locator('.bench-time').isVisible();
      if (timed)
        await page.locator('[data-scrub]').evaluate((el) => {
          el.value = 0.36;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
      await snapshot(page, r.id + '-' + device);
      if (r.model === 'lente' && device === 'desktop') {
        await page.locator('[data-view=side]').click();
        await snapshot(page, 'lente-laterale');
        await page.locator('[data-view=orbit]').click();
      }
      const allocated = await canvas.evaluate((el) => ({
        buffers: Number(el.dataset.buffer),
        textures: Number(el.dataset.texture),
        programs: Number(el.dataset.program),
      }));
      let animatedFps = null;
      if (timed) {
        await page.locator('[data-play]').click();
        animatedFps = await canvas.evaluate(async (el) => {
          const start = performance.now(),
            base = Number(el.dataset.frames);
          await new Promise((resolve) => setTimeout(resolve, 220));
          return Math.round(((Number(el.dataset.frames) - base) * 1000) / (performance.now() - start));
        });
        assert.ok(animatedFps > 0);
        if ((await page.locator('[data-play]').innerText()) === 'Pausa')
          await page.locator('[data-play]').click();
      }
      const reads = await page.locator('[data-readings]').innerText();
      assert.ok(reads.trim().length > 15);
      await canvas.scrollIntoViewIfNeeded();
      let draws = Number(await canvas.getAttribute('data-draws'));
      const before = await canvas.screenshot();
      if (touch) await pinch(page, canvas);
      else {
        const rect = await canvas.boundingBox();
        await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.4);
        await page.mouse.down();
        await page.mouse.move(rect.x + rect.width * 0.65, rect.y + rect.height * 0.52, { steps: 5 });
        await page.mouse.up();
        await page.mouse.wheel(0, -30);
      }
      assert.ok(!before.equals(await canvas.screenshot()), 'trascinamento o pinch ' + device + ' ' + r.id);
      await canvas.focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('+');
      assert.ok(Number(await canvas.getAttribute('data-draws')) > draws);
      assert.ok(!before.equals(await canvas.screenshot()));
      assert.equal(await page.locator('[data-readings]').innerText(), reads);
      await page.locator('[data-reset-view]').click();
      await page.locator('[data-view=top]').click();
      await page.locator('[data-view=side]').click();
      if (r.model === 'onde') await page.locator('[data-view=section]').click();
      await page.locator('[data-view=diagram]').click();
      await assertShown(page.locator('.bench-diagram'));
      await page.locator('[data-view=orbit]').click();
      await page.locator('[data-reset]').click();
      const first = page.locator('.bench-param input').first();
      const original = await first.inputValue();
      await first.focus();
      await first.press('ArrowRight');
      assert.notEqual(await first.inputValue(), original);
      await page.locator('[data-reset]').click();
      assert.equal(await first.inputValue(), original);
      if (device === 'mobile') {
        await page.setViewportSize({ width: h, height: w });
        await assertShown(canvas);
        await page.waitForTimeout(60);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.setViewportSize({ width: w, height: h });
      }
      await canvas.scrollIntoViewIfNeeded();
      const fps = await canvas.evaluate(async (el) => {
        const times = [];
        await new Promise((resolve) => {
          const next = (t) => {
            times.push(t);
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            if (times.length < 15) requestAnimationFrame(next);
            else resolve();
          };
          requestAnimationFrame(next);
        });
        return Math.round(14000 / (times.at(-1) - times[0]));
      });
      await page.locator('[data-reset-view]').click();
      if (device === 'desktop' && ['volo', 'tubo', 'onde'].includes(r.model)) {
        await page.setViewportSize({ width: w, height: 460 });
        await page.locator('[data-play]').click();
        await page.waitForTimeout(120);
        await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
        assert.ok(
          await canvas.evaluate((el) => el.getBoundingClientRect().bottom <= 0),
          'il banco deve uscire interamente dal viewport',
        );
        await page.waitForTimeout(200);
        const hidden = await canvas.getAttribute('data-draws');
        await page.waitForTimeout(160);
        assert.equal(await canvas.getAttribute('data-draws'), hidden);
        await canvas.scrollIntoViewIfNeeded();
        await page.waitForTimeout(120);
        assert.ok(Number(await canvas.getAttribute('data-draws')) > Number(hidden));
        await page.evaluate(() => {
          Object.defineProperty(document, 'hidden', { value: true, configurable: true });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        const tabHidden = await canvas.getAttribute('data-draws');
        await page.waitForTimeout(100);
        assert.equal(await canvas.getAttribute('data-draws'), tabHidden);
        await page.evaluate(() => {
          delete document.hidden;
          document.dispatchEvent(new Event('visibilitychange'));
        });
        if ((await page.locator('[data-play]').innerText()) === 'Pausa')
          await page.locator('[data-play]').click();
        await page.setViewportSize({ width: w, height: h });
      }
      await advance(page);
      await assertShown(page.locator('[data-assess]'));
      if (device === 'desktop') {
        await answers(page, r);
        if (r.model === 'piano') {
          await set(page, 'angle', 0);
          await set(page, 'F', 0);
          assert.match(await page.locator('[data-readings]').innerText(), /0 m\/s²/);
        }
        if (r.model === 'stevino') {
          await set(page, 'h', 0);
          assert.match(await page.locator('[data-readings]').innerText(), /100 kPa/);
        }
        if (r.model === 'tubo') {
          await set(page, 'mode', 'flow');
          await set(page, 'r', 0.5);
          await set(page, 'mu', 1);
          await set(page, 'flow', 12);
          await assertShown(page.locator('.bench-warning'));
          assert.equal(await page.locator('.bench-time').isVisible(), false);
        }
        if (r.model === 'calore') {
          await set(page, 'left', 20);
          await set(page, 'right', 80);
          assert.match(await page.locator('[data-readings]').innerText(), /-1,92/);
        }
        if (r.model === 'campo') {
          await set(page, 'sx', -1);
          await assertShown(page.locator('.bench-warning'));
        }
        if (r.model === 'circuito') {
          await set(page, 'mode', 'Serie');
          assert.match(await page.locator('[data-readings]').innerText(), /0,6667/);
          await snapshot(page, 'circuito-serie');
        }
        if (r.model === 'lente') {
          await set(page, 'p', 6);
          await page.locator('[data-view=side]').click();
          await snapshot(page, 'lente-virtuale');
          await set(page, 'p', 12);
          assert.match(await page.locator('[data-readings]').innerText(), /∞/);
        }
        if (r.model === 'onde') {
          await set(page, 'x', 0);
          await set(page, 'phase', 180);
          await page.locator('[data-view=top]').click();
          await snapshot(page, 'onde-pianta');
          await page.locator('[data-view=section]').click();
          await snapshot(page, 'onde-sezione');
        }
        if (r.model === 'gas') {
          await page
            .locator('.bench-note textarea')
            .fill('A temperatura fissa, dimezzare il volume raddoppia la pressione.');
          await page.locator('.bench-note button').click();
          await assertShown(page.getByText('Osservazione salvata nel quaderno.'));
        }
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const renderer = await canvas.getAttribute('data-renderer');
      const handle = await canvas.elementHandle();
      await navigate(page, 'laboratori');
      await assertShown(page.locator('.bench-collection').first());
      await page.waitForFunction((el) => el.dataset.lost === 'yes', handle);
      const closed = await handle.getAttribute('data-draws');
      await page.waitForTimeout(50);
      assert.equal(await handle.getAttribute('data-draws'), closed);
      for (const key of ['buffer', 'program'])
        assert.equal(Number(await handle.getAttribute('data-' + key)), 0, 'rilascio ' + key + ' ' + r.id);
      // r180 WebGLState owns four empty textures. Only those four may survive explicit deleteTexture;
      // losing the context invalidates each actual WebGLTexture, including those fallbacks.
      assert.equal(Number(await handle.getAttribute('data-texture')), 4);
      assert.equal(await handle.getAttribute('data-released-textures'), 'true');
      await handle.dispose();
      const bytes = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .filter((e) => e.name.includes('/three-r180/'))
          .reduce((s, e) => s + e.decodedBodySize, 0),
      );
      report.push({ device, lab: r.id, ms, fps, animatedFps, allocated, renderer, threeBytes: bytes });
      console.log(device, r.id, ms + ' ms', fps + ' fps');
    }
    await ctx.close();
  }
  const { ctx, page } = await context(390, 844, true, true);
  for (const r of records) {
    await navigate(page, 'banco/' + r.id);
    await assertShown(page.locator('[data-bench="' + r.id + '"] .bench-diagram'));
    await predict(page, r);
    await advance(page);
    await advance(page);
    await advance(page);
    await answers(page, r);
    console.log('Tavola', r.id);
    assert.ok((await page.locator('[data-graphs] svg').count()) >= 1);
    assert.equal(await page.locator('[data-view=orbit]').isEnabled(), false);
    assert.equal(
      await page.evaluate(() =>
        performance.getEntriesByType('resource').some((e) => e.name.includes('/three-r180/')),
      ),
      false,
    );
  }
  await snapshot(page, 'alternativa-mobile');
  await ctx.close();
  const desktop = await context(1440, 960);
  const p = desktop.page;
  // The lesson goal survives the round trip with its exact open paragraph.
  const topic = p.locator('.bench-topic').first();
  await topic.locator('summary').click();
  const focus = topic.locator('a').first(),
    question = (await focus.locator('span').innerText()).replace(/ →$/, '');
  await focus.click();
  await assertShown(p.locator('[data-predict]'));
  assert.equal(await p.locator('.bench-head p').innerText(), question);
  await p.getByRole('link', { name: 'Torna all’attività' }).click();
  assert.equal(await topic.getAttribute('open'), '');
  // Preserve an unsubmitted answer in a live practice session.
  await navigate(p, 'materiale/C1-Q034/C1');
  await p.locator('#single').click();
  const input = p.locator('#response input').first();
  await input.waitFor();
  const type = await input.getAttribute('type');
  if (type === 'radio') await input.check();
  else await input.fill('37');
  await p.locator('.question-shell a[href^="#banco/"]').first().click();
  await assertShown(p.locator('[data-predict]'));
  await p.getByRole('link', { name: 'Torna all’attività' }).click();
  if (type === 'radio') assert.equal(await input.isChecked(), true);
  else assert.equal(await input.inputValue(), '37');
  await navigate(p, 'corso/C2/recupero');
  await p.getByLabel('Competenza', { exact: true }).selectOption('C2-L007');
  await p.getByLabel('Situazione', { exact: true }).selectOption('C2-Q062');
  await p.getByRole('button', { name: 'Apri la scheda di recupero' }).click();
  await p.locator('#scheda-recupero details summary').click();
  await p.locator('#scheda-recupero a[href^="#banco/LAB3D-04"]').click();
  await assertShown(p.locator('[data-bench="LAB3D-04"]'));
  await p.getByRole('link', { name: 'Torna all’attività' }).click();
  assert.equal(await p.locator('[name=scenario]').inputValue(), 'C2-Q062');
  assert.equal(await p.locator('#scheda-recupero details').getAttribute('open'), '');
  await desktop.ctx.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  if (shots) await writeFile(path.join(shots, 'misure.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(
    '30 scene WebGL · 10 tavole senza WebGL · 20 problemi · ritorno alla lezione e risposta in corso · nessuna richiesta esterna',
  );
} catch (e) {
  console.error(e);
  throw e;
} finally {
  await browser.close();
  if (server.exitCode === null && server.signalCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
  await rm(db, { recursive: true, force: true });
}
