// Follow two attempts through the learner interface on a disposable installation.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = await mkdtemp(path.join(tmpdir(), 'officina-diario-'));
const out = path.resolve(process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/diario'));
await mkdir(out, { recursive: true });
const boot = "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const server = spawn('python3', ['-uc', boot], {
  cwd: root, env: { ...process.env, ASTRA_DATA: data }, stdio: ['ignore', 'pipe', 'inherit'],
});

async function inspect(page, name, stage) {
  await page.waitForFunction(() => !document.querySelector('main').hasAttribute('aria-busy'));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), stage + ' · reflow');
  const result = await page.evaluate(async () => {
    const audit = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa'] },
    });
    return { passed: audit.passes.length, violations: audit.violations.map(v => [v.id, v.nodes.map(n => n.target)]),
      manual: audit.incomplete.map(v => v.id) };
  });
  assert.deepEqual(result.violations, [], name + ' · ' + stage);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  if (stage !== 'vuoto' && await page.evaluate(() => innerWidth < 500)) {
    await page.screenshot({ path: path.join(out, name + '-' + stage + '-pagina.png'), fullPage: true, animations: 'disabled' });
    await page.locator('.diary-entry[open]').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  await page.screenshot({ path: path.join(out, name + '-' + stage + '.png'), animations: 'disabled' });
  return result;
}

async function readDiary(page) {
  await page.locator('.mast a[href="#studio"]').click();
  await page.getByRole('link', { name: 'Diario degli errori', exact: true }).click();
  await page.locator('#diary-total').waitFor();
}

async function submitAnswer(page, value, title) {
  const form = page.locator('#response');
  await form.locator('[name=value]').fill(value);
  await form.getByRole('button', { name: 'Verifica risposta', exact: true }).click();
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
}

async function journey(engine, base, width, height, scale = 1) {
  const name = engine.name() + '-' + width + (scale > 1 ? '-zoom2' : '');
  const mobile = width < 500;
  const args = engine === chromium && process.env.ASTRA_CHROME ? { executablePath: process.env.ASTRA_CHROME } : {};
  const browser = await engine.launch(args);
  let page;
  try {
    const context = await browser.newContext({ viewport: { width, height }, locale: 'it-IT', reducedMotion: 'reduce',
      deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile });
    await context.addInitScript({ path: path.join(root, 'node_modules/axe-core/axe.min.js') });
    if (mobile) await context.addInitScript(() => {
      const contextFor = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (name, ...args) {
        return /webgl/i.test(name) ? null : contextFor.call(this, name, ...args);
      };
    });
    page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [], audits = {};
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/#studio');
    await page.getByRole('button', { name: 'Apri un quaderno di prova' }).click();
    await page.getByRole('link', { name: 'Diario degli errori', exact: true }).click();
    await page.getByRole('heading', { name: 'Nessun errore registrato' }).waitFor();
    assert.ok(await page.locator('.diary-filter select, .diary-filter button').evaluateAll(nodes =>
      nodes.every(n => n.getBoundingClientRect().height >= 44)), 'selettori e invio da 44 px');
    audits.vuoto = await inspect(page, name, 'vuoto');

    await page.goto(base + '/#corso/C1');
    await page.getByRole('link', { name: 'Vai agli esercizi prioritari' }).click();
    await page.getByRole('link', { name: 'Aree di segno opposto' }).click();
    await page.locator('#single').click();
    await submitAnswer(page, '-20', 'Rivediamo il ragionamento');
    await readDiary(page);
    const course = page.getByLabel('Percorso', { exact: true });
    await course.selectOption('C1');
    await page.getByRole('button', { name: 'Aggiorna diario' }).click();
    await page.waitForFunction(() => location.hash.endsWith('C1/1/5') && document.activeElement.id === 'diary-total');
    const card = page.locator('.diary-entry[open]');
    assert.match(await card.innerText(), /C1-Q027 · edizione 2/);
    assert.match(await card.innerText(), /Per lo spostamento conserva il segno delle velocità/);
    await card.getByText('Rivedi la tua risposta', { exact: true }).press('Enter');
    assert.match(await card.innerText(), /Hai risposto -20 m/);
    const details = card.getByText('Passaggi del recupero', { exact: true });
    await details.press('Enter');
    const visual = card.locator('a[href^="#banco/"]');
    assert.equal(await visual.count(), 1);
    await visual.focus();
    const origin = await visual.getAttribute('href');
    await visual.press('Enter');
    await page.locator('.bench-room').waitFor();
    await page.getByRole('button', { name: 'Tavola 2D', exact: true }).click();
    await page.locator('[data-drawing] svg').waitFor();
    await page.getByRole('link', { name: 'Torna all’attività' }).click();
    await page.waitForFunction(link => document.activeElement.getAttribute('href') === link, origin);
    assert.equal(await visual.isVisible(), true);
    await details.press('Enter');
    await page.getByLabel('Tempo disponibile').selectOption('15');
    await page.getByRole('button', { name: 'Aggiorna diario' }).click();
    const retry = card.locator('.diary-body > [data-diario-retest]');
    await retry.waitFor();
    assert.match(await card.innerText(), /Hai scelto 15 minuti/);
    assert.match(await card.innerText(), /livello è lo stesso del primo quesito \(2 su 3\)/);
    await card.getByText('Tentativi e aiuti', { exact: true }).press('Enter');
    assert.match(await card.innerText(), /Risposta iniziale autonoma/);
    audits.errore = await inspect(page, name, 'errore');

    await retry.press('Enter');
    await page.locator('.exercise-prompt').waitFor();
    assert.match(await page.locator('.exercise-prompt').innerText(), /−12 m.*\+2,5 m\/s.*8,0 s/);
    await submitAnswer(page, String(-12 + (5 / 2) * 8), 'Risposta corretta');
    await readDiary(page);
    await page.reload();
    await card.getByText('Tentativi e aiuti', { exact: true }).press('Enter');
    assert.match(await card.innerText(), /Risposta autonoma su una famiglia diversa/);
    assert.doesNotMatch(await card.innerText(), /Un’ulteriore famiglia risolta autonomamente a distanza/);
    audits.trasferimento = await inspect(page, name, 'trasferimento');
    if (engine === chromium && width === 1440) {
      await page.goto(base + '/#materiale/C1-Q027/C1');
      await page.locator('#single').click();
      await submitAnswer(page, '20', 'Rivediamo il ragionamento');
      await readDiary(page);
      const older = page.locator('[data-diario-item="1"]');
      await older.locator(':scope > summary').press('Enter');
      await older.getByText('Passaggi del recupero', { exact: true }).press('Enter');
      const secondLink = older.locator('a[href^="#banco/"]');
      await secondLink.press('Enter');
      await page.getByRole('link', { name: 'Torna all’attività' }).click();
      await page.waitForFunction(() => document.activeElement.closest('[data-diario-item]')?.dataset.diarioItem === '1');
      assert.ok(await secondLink.evaluate(el => el === document.activeElement));
      assert.equal(await page.locator('.diary-entry[open]').count(), 1);
    }

    const peer = await context.newPage();
    await peer.goto(base + '/#studio');
    await peer.getByRole('button', { name: 'Esci', exact: true }).click();
    await page.locator('#auth').waitFor();
    assert.equal(await page.locator('.diary-entry').count(), 0);
    assert.deepEqual(errors, []);
    return { name, width, height, scale, browser: browser.version(), fallback: mobile, audits, errors };
  } catch (error) {
    console.error(name, page?.url(), await page?.locator('main').innerText().catch(() => ''));
    throw error;
  } finally {
    await browser.close();
  }
}

try {
  const [port] = await once(server.stdout, 'data');
  const base = 'http://127.0.0.1:' + String(port).trim();
  const reports = [];
  for (const item of [[chromium, 1440, 900], [webkit, 1440, 900], [chromium, 320, 740],
                      [webkit, 390, 844], [chromium, 640, 450, 2]]) {
    reports.push(await journey(item[0], base, ...item.slice(1)));
  }
  const sha = execFileSync('git', ['rev-parse','HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  await writeFile(path.join(out, 'diario.json'), JSON.stringify({ sha, reports }, null, 2) + '\n');
  console.log('PASS · cinque configurazioni, 15 scansioni axe, risposta iniziale, retest, ripresa e logout.');
} finally {
  server.kill();
  await once(server, 'exit');
  await rm(data, { recursive: true, force: true });
}
