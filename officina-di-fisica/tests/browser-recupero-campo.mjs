// An isolated installation of the actual application, with the same HTTP and DOM entry points as a learner.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = await mkdtemp(path.join(tmpdir(), 'officina-ritorno-'));
const out = path.resolve(process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/recupero'));
await mkdir(out, { recursive: true });
const launch =
  "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const env = { ...process.env, ASTRA_DATA: data };
const service = spawn('python3', ['-uc', launch], { cwd: root, env, stdio: ['ignore', 'pipe', 'inherit'] });
const reports = [];
const prefix = 'officina.recupero.v1/';
const timeline = [
  [4, 12, 12],
  [9, 2, 22],
  [10, 0, 24],
  [11, -2, 26],
];
const sign = (n) => (n < 0 ? '−' : n > 0 ? '+' : '') + Math.abs(n);

function official(run) {
  const code = `from server.store import connect
import sys,json
with connect() as db:
 r=db.execute("SELECT * FROM runs WHERE id=?",(sys.argv[1],)).fetchone()
 a=db.execute("SELECT * FROM attempts WHERE run=? ORDER BY idx",(r["id"],)).fetchall()
 e=db.execute("SELECT * FROM exposed WHERE user=? ORDER BY id,v",(r["user"],)).fetchall()
 print(json.dumps([list(r),[list(row) for row in a],[list(row) for row in e]]))`;
  const result = spawnSync('python3', ['-c', code, run], { cwd: root, env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function addUnansweredItem(run) {
  // Reproduce a saved multi-question practice in the disposable database.
  const script = `import sys,json
from server.store import connect,record
from server.adapters.study_repository import SQLiteStudy
with connect() as db:
 items=json.loads(db.execute("SELECT items FROM runs WHERE id=?",(sys.argv[1],)).fetchone()[0])
 q=record(db,"C1-Q028")
 items.append({**items[0],"id":q["id"],"v":q["version"]})
 SQLiteStudy(db).save_run(sys.argv[1],items,None)`;
  const result = spawnSync('python3', ['-c', script, run], { cwd: root, env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

async function cartOnScreen(diagram) {
  const { width, height, data } = PNG.sync.read(await diagram.screenshot({ animations: 'disabled' }));
  let total = 0,
    count = 0;
  for (let y = 0; y < height * 0.65; y++)
    for (let x = 0; x < width; x++) {
      const i = 4 * (width * y + x),
        r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (g > 58 && g > 1.55 * r && b > 1.4 * r && Math.abs(g - b) < 50) {
        total += x;
        count++;
      }
    }
  assert.ok(count > 15, 'Carrello verde visibile sul fotogramma');
  return total / count / width;
}

async function audit(page, report, stage) {
  const result = await page.evaluate(async () => {
    const a = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'] },
    });
    return {
      violations: a.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]),
      manual: a.incomplete.map((v) => v.id),
    };
  });
  assert.deepEqual(result.violations, [], stage);
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    stage + ' reflow',
  );
  report.audit.push({ stage, ...result });
}
async function screenshot(page, report, name, selector) {
  await page.locator(selector).evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.screenshot({ path: path.join(out, report.name + '-' + name + '.png'), animations: 'disabled' });
}
async function journey(browser, base, { name, width, height, noGL = false }) {
  const mobile = width < 500;
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'it-IT',
    reducedMotion: 'reduce',
  });
  try {
    await context.addInitScript({ path: path.join(root, 'node_modules/axe-core/axe.min.js') });
    if (noGL)
      await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (name, ...args) {
          return /^webgl/.test(name) ? null : original.call(this, name, ...args);
        };
      });
    const page = await context.newPage(),
      errors = [];
    const report = { name, width, height, engine: browser.version(), audit: [], frames: [] };
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        !/401 \(Unauthorized\)|the server responded with a status of 401/i.test(message.text())
      )
        errors.push(message.text());
    });
    const fix = await context.request.post(base + '/api/demo', {
      data: {},
      headers: { 'X-Astra-Request': '1' },
    });
    assert.ok(fix.ok());
    await page.goto(base + '/#corso/C1');
    await page.getByRole('link', { name: 'Vai agli esercizi prioritari' }).click();
    await page.getByRole('link', { name: 'Aree di segno opposto' }).click();
    await page.locator('#single').click();
    const original = page.locator('#response');
    await original.locator('[name=value]').fill('-2');
    assert.equal(await page.locator('[data-campo-entry]').count(), 0);
    await original.getByRole('button', { name: 'Verifica risposta', exact: true }).click();
    const entry = page.getByRole('button', { name: 'Prova il ritorno di 7 s' });
    await entry.waitFor();
    assert.equal(await entry.count(), 1);
    const rid = new URL(page.url()).hash.split('/')[1];
    const before = official(rid);
    assert.equal(before[1].length, 1);
    await entry.focus();
    await page.keyboard.press('Enter');
    const panel = page.locator('.campo-recupero');
    const field = panel.getByLabel('Spostamento finale (m)', { exact: true });
    const check = panel.getByRole('button', { name: 'Verifica lo spostamento' });
    const feedback = panel.locator('#campo-riscontro');
    const bank = panel.locator('[data-banco]');
    const clock = bank.getByLabel('Istante sulla pista (s)', { exact: true });
    assert.equal(await page.locator('h1:visible').innerText(), 'Il ritorno dura 7 secondi');
    assert.match(await page.title(), /ritorno/);
    assert.equal(await page.locator('.question-shell').isVisible(), false);
    assert.equal(await panel.locator('[data-apri-pista]').isVisible(), false);
    await field.fill('+2');
    await field.press('Enter');
    assert.match(await feedback.innerText(), /Modulo corretto, segno errato/);
    await page.reload();
    await feedback.waitFor();
    assert.equal(await field.inputValue(), '+2');
    assert.equal(await field.getAttribute('aria-invalid'), 'true');
    await page.waitForFunction(() => document.activeElement?.id === 'campo-riscontro');
    assert.match(await panel.ariaSnapshot(), /textbox "Spostamento finale \(m\)"/);
    await screenshot(page, report, 'ripresa', '.campo-recupero');
    await audit(page, report, 'errore ripristinato');
    await field.fill('26');
    await check.click();
    assert.match(await feedback.innerText(), /distanza percorsa/);
    await field.fill('+2');
    await check.click();
    await panel.getByRole('button', { name: 'Rivedi questi 7 s sulla pista' }).click();
    await bank.waitFor();
    if (name === 'chromium-desktop') await bank.locator('canvas').waitFor({ state: 'visible' });
    if (noGL) await bank.locator('[data-pista-piana] svg').waitFor();
    await clock.focus();
    let previous = 0,
      turnPosition;
    for (const [time, x, distance] of timeline) {
      for (let i = previous; i < time; i++) await clock.press('ArrowRight');
      previous = time;
      const reading = await bank.locator('[data-lettura]').innerText();
      assert.equal(
        reading,
        'A ' + time + ' s · posizione ' + sign(x) + ' m · distanza percorsa ' + distance + ' m',
      );
      assert.match(
        await clock.getAttribute('aria-valuetext'),
        new RegExp('posizione ' + sign(x).replace('+', '\\+') + ' metri'),
      );
      const diagram = bank.locator('canvas:visible,[data-pista-piana] svg:visible');
      assert.ok(
        (await diagram.getAttribute('aria-label')).includes(
          'Carrello a ' + sign(x) + ' m al secondo ' + time + '.',
        ),
      );
      if (time === 4) turnPosition = await cartOnScreen(diagram);
      if (time === 11) {
        const travel = turnPosition - (await cartOnScreen(diagram));
        assert.ok(travel > 0.12, 'Il carrello torna verso sinistra sullo schermo: ' + travel);
        report.screenTravel = Number(travel.toFixed(3));
      }
      report.frames.push({ t: time, x, distance });
    }
    report.render = (await bank.locator('canvas').isVisible()) ? 'WebGL2' : '2D';
    await screenshot(page, report, 'pista', '[data-banco]');
    await audit(page, report, 'pista');
    if (report.render === 'WebGL2' && name === 'chromium-desktop') {
      await bank
        .locator('canvas')
        .evaluate((c) => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
      await bank.locator('[data-pista-piana] svg').waitFor();
      assert.match(
        await bank.locator('[data-pista-piana] svg').getAttribute('aria-label'),
        /−2 m al secondo 11/,
      );
      report.contextLoss = true;
    }
    await bank.getByRole('button', { name: 'Tabella', exact: true }).click();
    await page.reload();
    await bank.getByRole('table').waitFor();
    await page.waitForFunction(() => document.activeElement?.id === 'campo-tempo');
    assert.equal(await clock.inputValue(), '11');
    await clock.press('Home');
    previous = 0;
    for (const [t, x, distance] of timeline) {
      for (let i = previous; i < t; i++) await clock.press('ArrowRight');
      previous = t;
      assert.deepEqual(await bank.locator('tr[aria-current=true] > *').allTextContents(), [
        String(t),
        sign(x),
        String(distance),
      ]);
    }
    await screenshot(page, report, 'tabella', '[data-banco]');
    assert.match(await bank.ariaSnapshot(), /table "Misure fino all’istante scelto"/);
    await audit(page, report, 'tabella ripristinata');
    if (width === 320) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        '320 px e testo al 200%',
      );
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '';
      });
      report.reflow200 = true;
    }
    await bank.getByRole('button', { name: 'Torna alla risposta' }).click();
    assert.equal(await field.evaluate((e) => e === document.activeElement), true);
    await field.fill('−2,0');
    await page.reload();
    await field.waitFor();
    assert.equal(await field.getAttribute('aria-invalid'), null);
    assert.equal(await feedback.isVisible(), false);
    assert.match(await panel.locator('[data-bozza]').innerText(), /da verificare/);
    await panel.getByText('Ultimo invio verificato', { exact: true }).click();
    assert.match(await panel.locator('[data-precedente] p').innerText(), /\+2 .*segno errato/);
    await check.click();
    assert.match(await feedback.innerText(), /Correzione verificata.*−14 m/);
    await page.reload();
    await feedback.waitFor();
    assert.equal(await field.inputValue(), '−2,0');
    assert.match(await panel.locator('[data-aiuti]').innerText(), /pista, tabella.*prima di questo invio/);
    assert.deepEqual(official(rid), before, 'run, tentativo, esposizioni e voto invariati');
    await panel.getByRole('button', { name: 'Torna al quesito' }).click();
    assert.equal(await entry.evaluate((e) => e === document.activeElement), true);
    const second = await context.request.post(base + '/api/runs', {
      headers: { 'X-Astra-Request': '1' },
      data: { course: 'C1', mode: 'practice', item: 'C1-Q027', requestId: 'secondo-' + name },
    });
    const otherId = (await second.json()).id;
    assert.ok(otherId && otherId !== rid);
    if (name === 'chromium-desktop') addUnansweredItem(otherId);
    await page.goto(base + '/#prova/' + otherId);
    await page.locator('#response [name=value]').fill('-2');
    await page.locator('#response button.solid').click();
    await entry.click();
    assert.equal(await field.inputValue(), '');
    await field.fill('-2');
    await check.click();
    assert.equal(await panel.locator('[data-aiuti]').isVisible(), false);
    if (name === 'chromium-desktop') {
      assert.match(page.url(), /\/0$/);
      await page.reload();
      await feedback.waitFor();
      assert.equal(await field.inputValue(), '-2');
      await panel.getByRole('button', { name: 'Torna al quesito' }).click();
      assert.equal(await page.locator('[data-jump]').count(), 2);
      await page.getByRole('button', { name: 'Quesito 2', exact: true }).click();
      await page.locator('[data-jump="1"][aria-current="step"]').waitFor();
      assert.equal(await page.locator('[data-campo-entry]').count(), 0);
      await page.getByRole('button', { name: 'Quesito 1, registrato', exact: true }).click();
      await entry.waitFor();
      await entry.click();
      await feedback.waitFor();
      report.resumedMultiItem = true;
    }
    const authorizedURL = page.url();
    const otherTab = await context.newPage();
    await otherTab.goto(base + '/#studio');
    await page.evaluate(() => sessionStorage.setItem('altra-funzione', 'conservata'));
    await otherTab.locator('#logout').click();
    await otherTab.waitForURL('**/#home');
    await page.bringToFront();
    await page.getByRole('heading', { name: 'Apri il tuo quaderno' }).waitFor();
    assert.equal(await page.locator('[data-campo-entry]').count(), 0);
    assert.equal(
      await page.evaluate((p) => Object.keys(sessionStorage).some((k) => k.startsWith(p)), prefix),
      false,
    );
    assert.equal(await page.evaluate(() => sessionStorage.getItem('altra-funzione')), 'conservata');
    await page.goto(authorizedURL);
    await page.reload();
    await page.getByRole('heading', { name: 'Apri il tuo quaderno' }).waitFor();
    assert.deepEqual(errors, [], report.name);
    reports.push(report);
    console.log(
      'PASS · ' +
        name +
        ' · ' +
        report.render +
        ' · ' +
        report.audit.length +
        ' stati accessibili controllati.',
    );
  } finally {
    await context.close();
  }
}

try {
  const [port] = await once(service.stdout, 'data');
  const base = 'http://127.0.0.1:' + Number(String(port).trim());
  for (const [engine, configs] of [
    [
      chromium,
      [
        { name: 'chromium-desktop', width: 1440, height: 900 },
        { name: 'chromium-stretto', width: 320, height: 740, noGL: true },
      ],
    ],
    [
      webkit,
      [
        { name: 'webkit-desktop', width: 1440, height: 900, noGL: true },
        { name: 'webkit-mobile', width: 390, height: 844, noGL: true },
      ],
    ],
  ]) {
    const options =
      engine === chromium
        ? {
            args: ['--enable-unsafe-swiftshader'],
            ...(process.env.ASTRA_CHROME ? { executablePath: process.env.ASTRA_CHROME } : {}),
          }
        : {};
    const browser = await engine.launch(options);
    try {
      for (const config of configs) await journey(browser, base, config);
    } finally {
      await browser.close();
    }
  }
  await writeFile(path.join(out, 'esiti.json'), JSON.stringify(reports, null, 2) + '\n');
  console.log(
    'PASS · quattro percorsi, ripresa ed esclusione ospite, WebGL2/2D, tabella e storico verificati.',
  );
} finally {
  service.kill();
  await once(service, 'exit');
  await rm(data, { recursive: true, force: true });
}
