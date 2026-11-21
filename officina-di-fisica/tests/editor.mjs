// Reproduce the author workflow through its accessible browser controls.
// Run from the repository with node tests/editor.mjs after npm ci.
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const staging = await fs.mkdtemp(path.join(tmpdir(), 'officina-editor-'));
const env = { ...process.env, ASTRA_DATA: staging, ASTRA_HTTPS: '0' };
const launcher = [
  'from server.store import initialize',
  'from server.web import Handler, ThreadingHTTPServer',
  'initialize()',
  "server=ThreadingHTTPServer(('127.0.0.1',0),Handler)",
  'print(server.server_port,flush=True)',
  'server.serve_forever()',
].join('\n');
const service = spawn('python3', ['-u', '-c', launcher], {
  cwd: root,
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});
const ID = 'VERIFICA-EDITOR';
let browser;
try {
  const [data] = await Promise.race([
    once(service.stdout, 'data'),
    once(service, 'exit').then(() => {
      throw Error('Il server di prova non è partito.');
    }),
  ]);
  const port = Number(String(data).trim());
  assert.ok(port > 0);
  const base = 'http://127.0.0.1:' + port + '/';
  browser = await chromium.launch(
    process.env.ASTRA_CHROME ? { executablePath: process.env.ASTRA_CHROME } : { channel: 'chrome' },
  );
  const p = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  p.setDefaultTimeout(10000);
  await p.emulateMedia({ reducedMotion: 'reduce' });
  const js = [];
  p.on('pageerror', (err) => js.push(err.message));
  const ticket = randomBytes(32).toString('base64url'),
    hash = createHash('sha256').update(ticket).digest('hex');
  const setup = spawnSync(
    'python3',
    [
      '-c',
      "from server.store import *;import sys;d=connect();d.execute('INSERT INTO tickets VALUES(?,?)',(sys.argv[1],NOW()+120));d.commit()",
      hash,
    ],
    { cwd: root, env },
  );
  assert.equal(setup.status, 0, 'Inizializzazione del collegamento locale di prova.');
  const authentication = await p.request.post(base + 'api/owner', {
    headers: { 'X-Astra-Request': '1' },
    data: { ticket },
  });
  assert.ok(authentication.ok(), 'Accesso autore di prova.');
  const pdfSource = await browser.newPage();
  await pdfSource.setContent(
    '<html lang="it"><title>Scheda</title><p>Misura del lavoro in joule.</p></html>',
  );
  const pdf = await pdfSource.pdf({ format: 'A5' });
  await pdfSource.close();
  const go = async (r) => {
    await p.goto(base + '#' + r);
    await p.locator('main[aria-busy="true"]').waitFor({ state: 'hidden' });
  };
  const ky = (k) => p.locator(`[data-key="${k}"]`);
  const waitContent = (txt) => p.getByText(txt, { exact: true }).first().waitFor({ state: 'visible' });
  const get = async (endpoint) => {
    const response = await p.request.get(base + 'api/' + endpoint);
    assert.ok(response.ok());
    return response.json();
  };
  async function save(id) {
    await p.locator('#save-draft').click();
    await p.waitForURL('**/#autore/modifica/' + id);
    await p.locator('#review-publish').waitFor({ state: 'visible' });
  }
  async function publish() {
    await p.locator('#review-publish').click();
    await p.locator('#editor-confirm').click();
    await p.locator('#review-withdraw').waitFor({ state: 'visible' });
    await p.locator('#review-publish').waitFor({ state: 'detached' });
  }
  async function shot(name) {
    if (!process.env.ASTRA_SHOTS) return;
    await fs.mkdir(process.env.ASTRA_SHOTS, { recursive: true });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(process.env.ASTRA_SHOTS, name + '.png'), animations: 'disabled' });
  }
  await go('autore');
  await waitContent('Archivio dei materiali');
  await shot('editor-lista');
  await go('autore/modifica/C4-E018');
  await p.locator('#show-preview').click();
  const steps = p.locator('#edit-preview .lettura-strumenti');
  await steps.getByRole('button', { name: 'Un passaggio alla volta' }).click();
  assert.equal(await steps.getByRole('status').innerText(), 'Passaggio 1 di 2');
  await steps.getByRole('button', { name: 'Avanti' }).click();
  assert.equal(await steps.getByRole('status').innerText(), 'Passaggio 2 di 2');
  await steps.getByRole('button', { name: 'Mostra tutto' }).click();
  await go('autore/nuovo/course');
  await ky('title').fill('Corso di verifica ' + ID);
  await ky('id').fill(ID);
  await ky('summary').fill('Scambi di energia, segni e misure.');
  await save(ID);
  await publish();
  assert.equal((await get('author/item/' + ID)).head.live, 1);
  const section = ID + '-S';
  await go('autore/nuovo/section');
  await ky('course').selectOption(ID);
  await ky('id').fill(section);
  await ky('title').fill('Misure');
  await save(section);
  await publish();
  const lesson = ID + '-L1';
  await go('autore/nuovo/lesson');
  await ky('title').fill('La relazione potenza–tempo');
  await ky('course').selectOption(ID);
  await ky('id').fill(lesson);
  await ky('blocks.0.text').fill(
    'Un trasferimento di energia E compiuto in un intervallo t ha potenza media E/t.',
  );
  await p.locator('[data-type-for="blocks"]').selectOption('formula');
  await p.locator('[data-add-block="blocks"]').click();
  await ky('blocks.1.text').fill(String.raw`P=\frac{E}{\Delta t}`);
  await p.locator('[data-type-for="blocks"]').selectOption('figure');
  await p.locator('[data-add-block="blocks"]').click();
  await p.locator('[data-upload="blocks.2"]').setInputFiles(path.join(root, 'static/figures/C1-vettore.svg'));
  await p.getByText(/File già collegato/).waitFor();
  await ky('blocks.2.text').fill('Proiezioni sugli assi.');
  await p.locator('[data-type-for="blocks"]').selectOption('attachment');
  await p.locator('[data-add-block="blocks"]').click();
  await p
    .locator('[data-upload="blocks.3"]')
    .setInputFiles({ name: 'scheda.pdf', mimeType: 'application/pdf', buffer: pdf });
  await ky('blocks.3.text').waitFor();
  await p.waitForFunction(() => document.querySelector('[data-key="blocks.3.text"]').value === 'scheda.pdf');
  await p.locator('[data-path="blocks.3"][data-op="up"]').click();
  await p.locator('details[data-fold="struttura"] summary').click();
  await ky('section').fill('Misure');
  await p.locator('[data-pick-for="reuse"]').selectOption('C1');
  await p.locator('[data-add-to="reuse"]').click();
  await p.locator('#show-preview').click();
  assert.equal(await p.locator('#edit-preview .katex-error').count(), 0);
  assert.equal(await p.locator('#edit-preview .katex').count(), 1);
  await shot('editor-preview');
  // Resume an interrupted new draft, including an uploaded figure and attachment.
  await p.reload();
  await p.getByRole('button', { name: 'Riprendi questa copia' }).click();
  assert.equal(await ky('id').inputValue(), lesson);
  await save(lesson);
  let item = await get('author/item/' + lesson);
  assert.deepEqual(item.used.sort(), [ID, 'C1', 'C6'].sort());
  assert.equal(item.record.blocks[2].type, 'attachment');
  assert.equal(item.record.blocks[3].type, 'figure');
  await publish();
  // Save, publish, and restore a historical version.
  await ky('title').fill('La potenza media');
  await save(lesson);
  await publish();
  await p.locator('details[data-fold="storia"] summary').click();
  await p.locator('[data-restore="1"]').click();
  await p.locator('#editor-confirm').click();
  await p.waitForFunction(
    () => document.querySelector('[data-key="title"]')?.value === 'La relazione potenza–tempo',
  );
  item = await get('author/item/' + lesson);
  assert.equal(item.head.draft, 3);
  assert.equal(item.head.live, 2);
  await publish();
  const question = ID + '-Q1';
  await go('autore/nuovo/question');
  await ky('course').selectOption(ID);
  await ky('id').fill(question);
  await ky('title').fill('Misura di potenza');
  await ky('skill').fill(lesson);
  await ky('prompt').fill('Qual è l’unità SI della potenza?');
  await ky('blocks.0.text').fill('Il joule per secondo è un watt.');
  await ky('answer.options').fill('Joule\nWatt\nPascal\nNewton');
  await ky('answer.value').selectOption('Watt');
  await ky('hints').fill('Pensa a energia divisa per tempo.');
  await ky('error.message').fill('Controlla l’unità della durata.');
  await save(question);
  await publish();
  const q = await get('author/item/' + question);
  assert.equal(q.record.answer.value, 'Watt');
  assert.equal(q.record.error.target, lesson);
  await ky('answer.type').selectOption('numeric');
  await ky('answer.value').fill('2.5');
  await ky('answer.unit').fill('W');
  await ky('answer.tolerance').fill('0.01');
  await ky('prompt').fill('5 J in 2 s. Qual è la potenza media in W?');
  await ky('blocks.0.text').fill('P = 5 J / 2 s = 2,5 W.');
  await save(question);
  await publish();
  assert.equal((await get('author/item/' + question)).record.answer.tolerance, 0.01);
  await ky('answer.type').selectOption('text');
  await ky('answer.value').fill('watt');
  await ky('answer.aliases').fill('W');
  await ky('prompt').fill('Scrivi il nome dell’unità SI della potenza.');
  await ky('blocks.0.text').fill('Un joule per secondo equivale a un watt.');
  await save(question);
  await publish();
  assert.deepEqual((await get('author/item/' + question)).record.answer.aliases, ['W']);
  // Deliberately invalid data is inspected only through the intended import validator.
  await go('autore/lotti');
  const makeRow = (id, title, order) => ({
    ...item.record,
    id,
    skill: id,
    title,
    order,
    course: ID,
    reuse: [],
    baseVersion: 0,
  });
  const newId = ID + '-L2',
    row = makeRow(newId, 'Lavoro e intervallo', 12);
  const upload = async (records) =>
    p.locator('#batch-file').setInputFiles({
      name: 'lotto.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ schema: 'astra/1', records })),
    });
  await upload([row, row]);
  await p.locator('#check-batch').click();
  await p.getByText(/ID duplicato/).waitFor();
  assert.equal(await p.locator('#commit-batch').isDisabled(), true);
  await upload([row]);
  await p.locator('#check-batch').click();
  await p.locator('#commit-batch').click();
  await p.getByText(/materiale importato in bozza/).waitFor();
  await p.getByRole('link', { name: 'Apri le bozze' }).click();
  await p.locator('#filter-course').selectOption(ID);
  await p.locator('#pick-drafts').click();
  await p.locator('#publish-selection').click();
  await p.locator('#confirm-group').click();
  await p.waitForFunction(() => !document.querySelector('#confirm-group'));
  assert.equal((await get('author/item/' + newId)).head.live, 1);
  // Renaming a section stages its children in the same atomic batch.
  await go('autore/modifica/' + section);
  await ky('title').fill('Strumenti');
  await p.locator('#save-draft').click();
  await p.waitForURL('**/#autore');
  assert.equal((await get('author/item/' + lesson)).record.section, 'Strumenti');
  assert.equal((await get('author/item/' + newId)).record.section, 'Strumenti');
  await p.locator('#pick-drafts').click();
  await p.locator('#publish-selection').click();
  await p.locator('#confirm-group').click();
  await p.waitForFunction(() => !document.querySelector('#confirm-group'));
  await go('autore/ordine');
  await p.locator('#sort-course').selectOption(ID);
  await p.locator('#sort-kind').selectOption('lesson');
  await p.locator('[data-at="1"][data-move="-1"]').click();
  await p.locator('#save-order').click();
  await p.waitForURL('**/#autore');
  assert.ok((await get('author/item/' + newId)).head.draft);
  await go('autore/modifica/' + question);
  await p.locator('#review-withdraw').click();
  await p.locator('#editor-confirm').click();
  await p.locator('#review-withdraw').waitFor({ state: 'detached' });
  assert.equal((await get('author/item/' + question)).head.live, null);
  await go('autore/modifica/LAB-C2');
  await ky('prediction').fill('Prevedi la portata iniziale del banco.');
  await ky('defaults.r').fill('0.5');
  await p.locator('#show-preview').click();
  const bank = p.locator('#edit-preview .labfigure svg');
  await bank.waitFor();
  assert.equal(await p.locator('#edit-preview .meter').count(), 4);
  const radiusLabel = bank.locator('text').filter({ hasText: /^r$/ });
  // At the minimum radius the full letter sits above the top wall (124 − 14).
  assert.ok(await radiusLabel.evaluate((el) => el.getBBox().y + el.getBBox().height < 110));
  await bank.scrollIntoViewIfNeeded();
  await shot('editor-laboratorio');
  await ky('defaults.r').fill('1.5');
  await save('LAB-C2');
  assert.equal((await get('author/item/LAB-C2')).record.defaults.r, 1.5);
  await go('autore/lotti');
  const fileReady = p.waitForEvent('download');
  await p.locator('#export-all').click();
  const dl = await fileReady;
  const pkg = JSON.parse(await fs.readFile(await dl.path(), 'utf8'));
  assert.equal(pkg.schema, 'astra/1');
  assert.ok(pkg.assets.length >= 2);
  assert.ok(pkg.records.some((x) => x.id === newId && x.baseVersion === 3));
  await go('edizioni');
  for (const [view, header, evidence] of [
    ['record', 'sha256_record', newId],
    ['copertura', 'esempi_guidati_autonomi', 'UD7'],
  ]) {
    const ready = p.waitForEvent('download');
    await p.locator('a[href="/api/author/inventario/' + view + '"]').click();
    const file = await ready;
    assert.equal(file.suggestedFilename(), 'inventario-' + view + '.csv');
    const csv = await fs.readFile(await file.path(), 'utf8');
    assert.ok(csv.split('\n', 1)[0].includes(header));
    assert.ok(csv.includes(evidence));
  }
  await p.setViewportSize({ width: 390, height: 844 });
  await go('autore/modifica/' + lesson);
  await ky('title').waitFor();
  assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await shot('editor-mobile');
  assert.deepEqual(js, []);
  console.log(
    'OK: corso, bozza recuperata, figure, allegato, riuso, anteprima formula, tre versioni, quesito, ripristino, ritiro, importazione atomica, pubblicazione multipla, riordino, laboratorio, esportazione e schermata mobile.',
  );
} finally {
  await browser?.close();
  if (service.exitCode === null && service.signalCode === null) {
    const stop = once(service, 'exit');
    service.kill('SIGTERM');
    await stop;
  }
  await fs.rm(staging, { recursive: true, force: true });
}
