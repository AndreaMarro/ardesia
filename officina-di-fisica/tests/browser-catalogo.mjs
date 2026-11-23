import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = await mkdtemp(path.join(tmpdir(), 'officina-catalogo-'));
const out = path.resolve(process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/catalogo'));
await mkdir(out, { recursive: true });
const launch = "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const service = spawn('python3', ['-uc', launch], { cwd: root, env: { ...process.env, ASTRA_DATA: data }, stdio: ['ignore','pipe','inherit'] });
const reports = [];

async function scan(page, name, stage, audits) {
  await page.waitForFunction(() => !document.querySelector('main').hasAttribute('aria-busy'));
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + ' · reflow ' + stage);
  const audit = await page.evaluate(async () => {
    const results = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] } });
    return { passed: results.passes.length, violations: results.violations.map(i => [i.id, i.nodes.map(n => n.target)]) };
  });
  assert.deepEqual(audit.violations, [], name + ' · ' + stage);
  audits[stage] = audit;
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: path.join(out, name + '-' + stage + '.png'), animations: 'disabled' });
}

async function journey(engine, base, width, height, zoom = 1) {
  const name = engine.name() + '-' + width + (zoom > 1 ? '-zoom2' : '');
  const browser = await engine.launch(engine === chromium && process.env.ASTRA_CHROME ? { executablePath: process.env.ASTRA_CHROME } : {});
  const audits = {};
  let page;
  try {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: zoom, locale: 'it-IT',
      isMobile: width < 500, hasTouch: width < 500, reducedMotion: 'reduce' });
    await ctx.addInitScript({ path: path.join(root, 'node_modules/axe-core/axe.min.js') });
    page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const search = page.getByRole('searchbox');
    async function submit(term) {
      await search.fill(term);
      await search.press('Enter');
      await page.waitForFunction(() => document.activeElement.id === 'search-result-title' && !document.querySelector('main').hasAttribute('aria-busy'));
    }
    await page.goto(base + '/#home');
    await page.locator('.hero').waitFor();
    const shortcut = page.locator('.mast-search');
    await shortcut.focus();
    await shortcut.press('Enter');
    await page.waitForFunction(() => document.activeElement.id === 'search-term');
    assert.equal(await page.locator('.course-index a').count(), 6);
    assert.ok(await page.locator('.search-sheet input, .search-sheet select, .search-sheet button').evaluateAll(els =>
      els.every(el => el.getBoundingClientRect().height >= 44)), 'bersagli di ricerca da 44 px');
    await scan(page, name, 'percorsi', audits);

    await page.getByLabel('Percorso', { exact: true }).selectOption('C6');
    await submit('C1-Q027');
    const row = page.locator('[data-result="C1-Q027"]');
    assert.equal(await row.getAttribute('href'), '#materiale/C1-Q027/C6');
    const linkKey = engine === webkit && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
    await page.keyboard.press(linkKey);
    assert.ok(await row.evaluate(el => el === document.activeElement), 'tastiera fino al risultato');
    await row.press('Enter');
    await page.getByRole('heading', { name: 'Accesso al materiale' }).waitFor();
    await page.goBack();
    await page.waitForFunction(() => document.activeElement.dataset.result === 'C1-Q027');
    await page.reload();
    await page.waitForFunction(() => document.activeElement.dataset.result === 'C1-Q027');
    assert.equal(await search.inputValue(), 'C1-Q027');
    assert.equal(await page.getByLabel('Percorso', { exact: true }).inputValue(), 'C6');
    await submit('C6-Q013');
    await page.getByRole('heading', { name: 'Nessun risultato' }).waitFor();
    await scan(page, name, 'vuota', audits);

    await submit('lente');
    const firstPage = await page.locator('[data-result]').evaluateAll(nodes => nodes.map(n => n.dataset.result));
    assert.equal(firstPage.length, 12);
    await scan(page, name, 'lente', audits);
    await page.getByRole('link', { name: 'Successiva' }).click();
    await page.getByText('Pagina 2 di 2').waitFor();
    assert.ok(await page.locator('[data-result]').evaluateAll((nodes, before) => nodes.every(n => !before.includes(n.dataset.result)), firstPage));
    await page.goBack();
    await page.getByText('Pagina 1 di 2').waitFor();
    await submit('SIM-C1-L001-01');
    const bench = page.locator('[data-result="SIM-C1-L001-01"]');
    await bench.focus();
    await bench.press('Enter');
    await page.locator('.bench-room').waitFor();
    await page.getByRole('link', { name: 'Torna all’attività' }).click();
    await page.waitForFunction(() => document.activeElement.dataset.result === 'SIM-C1-L001-01');

    await submit('C1-M-formula');
    await page.locator('[data-result="C1-M-formula"]').click();
    await page.waitForFunction(() => document.activeElement.matches('.work-area h3'));
    assert.equal(await page.locator('[data-sheet="C1-M-formula"]').getAttribute('aria-pressed'), 'true');
    if (width === 1440 && engine === chromium) {
      await page.goBack();
      await page.waitForFunction(() => document.activeElement.dataset.result === 'C1-M-formula');
      for (const [id, title] of [
        ['C6','Fisica completa'], ['C2-L001','Distribuire massa e forza'],
        ['C2-E001','Dal campione al materiale'], ['C2-Q001','Quale comportamento in condizioni ordinarie distingue un liquido da un solido elastico sotto una piccola sollecitazione tangenziale costante?'],
        ['LAB3D-03','Pressione idrostatica'], ['LAB-C2','La quarta potenza'],
      ]) {
        await submit(id);
        const result = page.locator('[data-result]').first();
        assert.equal(await result.getAttribute('data-result'), id);
        await result.click();
        await page.getByRole('heading', { name: title, exact: true, level:1 }).waitFor();
        await page.goBack();
        await page.waitForFunction(key => document.activeElement.dataset.result === key, id);
      }
    }
    assert.deepEqual(errors, []);
    reports.push({ name, viewport: {width, height}, deviceScaleFactor: zoom, linkKey, audits, errors });
  } catch (error) {
    console.error(name, page?.url(), await page?.evaluate(() => ({ title: document.title, focus: document.activeElement.outerHTML.slice(0, 160) })));
    throw error;
  } finally { await browser.close(); }
}

try {
  const [chunk] = await once(service.stdout, 'data');
  const base = 'http://127.0.0.1:' + Number(String(chunk).trim());
  for (const [browser, width, height, zoom] of [
    [chromium,1440,900,1], [chromium,320,740,1], [webkit,1440,900,1], [webkit,390,844,1], [chromium,640,450,2],
  ]) await journey(browser, base, width, height, zoom);
  const sha = execFileSync('git', ['rev-parse','HEAD'], { cwd: root, encoding:'utf8' }).trim();
  await writeFile(path.join(out, 'esiti.json'), JSON.stringify({sha, reports}, null, 2) + '\n');
  console.log('PASS · cinque configurazioni, quindici scansioni axe, ripresa del focus, paginazione, banco e metodo.');
} finally {
  service.kill();
  await once(service, 'exit');
  await rm(data, { recursive: true, force: true });
}
