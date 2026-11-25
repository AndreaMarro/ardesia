import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const storage = await fs.mkdtemp(path.join(tmpdir(), 'cric-disciplines-'));
const evidence = path.resolve(process.env.ASTRA_RESULTS || path.join(root, 'var/discipline-browser'));
await fs.mkdir(evidence, {recursive: true});
async function fixtureCatalog() {
  const directory = path.join(storage, 'fixture');
  await fs.cp(path.join(root, 'examples/discipline'), directory, {recursive:true});
  const file = path.join(directory, 'catalog.json'), catalog = JSON.parse(await fs.readFile(file));
  const courseFile = path.join(directory, catalog.courses[0].file), course = JSON.parse(await fs.readFile(courseFile));
  const first = course.units[0], rest = first.activities.splice(1);
  first.lesson.push({title:'Controlla l’unità', body:'Ogni tessera è un quadrato. La somma delle loro aree si misura in cm².'});
  first.representation = {kind:'secant', coefficients:[0,0,1], point:1};
  course.units.push({...first, id:'misura-rimanente', title:'Scomporre e ricomporre una superficie',
    representation:{kind:'riemann', coefficients:[0,0,1], interval:[0,1]}, activities:rest});
  course.formulas = [{title:'Area', body:'Il prodotto tra base e altezza conta i quadrati unitari di un rettangolo.'}];
  catalog.symbols = [{symbol:'cm²', reading:'centimetri quadrati', meaning:'Area di quadrati unitari con lato di un centimetro.'}];
  catalog.syllabi = [{id:'collaudo', title:'Programma di collaudo', year:'1', url:'https://example.org/', skills:['area']}];
  catalog.exams = [{id:'prova', title:'Verifica delle superfici', syllabusId:'collaudo', description:'Esercitazione su due problemi.',
    activityIds:[first.activities[0].id, rest[0].id], suggestedMinutes:5, mode:'practice'}];
  await fs.writeFile(courseFile, JSON.stringify(course));
  await fs.writeFile(file, JSON.stringify(catalog));
  return file;
}
const catalogFile = process.env.ASTRA_DISCIPLINE_CATALOG ? path.resolve(process.env.ASTRA_DISCIPLINE_CATALOG) : await fixtureCatalog();
const source = path.dirname(catalogFile), catalog = JSON.parse(await fs.readFile(catalogFile));
const courses = await Promise.all(catalog.courses.map(async c => JSON.parse(await fs.readFile(path.join(source, c.file)))));
const course = courses[0], first = course.units[0], quiz = first.activities[0], second = course.units[1];
const scope = '/api/v1/disciplines/' + catalog.id;
const env = {...process.env, ASTRA_DATA: storage};
const install = spawnSync('python3', ['app.py', 'install-discipline', catalogFile], {cwd: root, env, encoding: 'utf8'});
assert.equal(install.status, 0, install.stderr);
const code = 'from server.web import Handler, ThreadingHTTPServer; server=ThreadingHTTPServer(("127.0.0.1",0),Handler); print(server.server_port,flush=True); server.serve_forever()';
const service = spawn('python3', ['-uc', code], {cwd: root, env, stdio: ['ignore', 'pipe', 'inherit']});
const axe = await fs.readFile(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
const report = {statistics: [], audits: [], checks: [], errors: []};
const browsers = [];
let url;
const route = (...parts) => '#disciplina/' + [catalog.id, ...parts].map(encodeURIComponent).join('/');
const checks = label => report.checks.push(label);

async function shot(page, name) {
  await page.evaluate(async () => { await document.fonts.ready; scrollTo({top:0,behavior:'instant'}); });
  await page.screenshot({path: path.join(evidence, name + '.png'), animations: 'disabled'});
}
async function audit(page, label) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({url: '/__qa__/axe.min.js'});
  const result = await page.evaluate(async () => {
    const { violations, incomplete, passes } = await window.axe.run(document, {
      runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']},
    });
    return { violations: violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)})),
      incomplete: incomplete.map(v => v.id), passes: passes.length };
  });
  report.audits.push({label, ...result});
  assert.deepEqual(result.violations, [], label + ' ' + JSON.stringify(result.violations));
  assert.ok(await page.getByRole('heading', {level: 1}).isVisible(), label + ' non vuota');
  assert.equal(await page.locator('vite-error-overlay, nextjs-portal').count(), 0);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ' reflow');
}

async function keyboardClick(page, locator) {
  await locator.waitFor({state: 'visible'});
  for (let i = 0; i < 180; i++) {
    if (await locator.evaluate(el => el === document.activeElement)) {
      assert.ok(await locator.evaluate(el => {
        const b = el.getBoundingClientRect(), left = Math.max(0, b.left), right = Math.min(innerWidth, b.right);
        const top = Math.max(0, b.top), bottom = Math.min(innerHeight, b.bottom);
        if (right <= left || bottom <= top) return false;
        return el.contains(document.elementFromPoint((left + right) / 2, (top + bottom) / 2));
      }), 'Focus visibile e scoperto');
      await page.keyboard.press('Enter');
      return;
    }
    await page.keyboard.press('Tab');
  }
  throw Error('Controllo irraggiungibile con Tab');
}

async function journey(browser, name, width, height) {
  const context = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
  await context.route('**/__qa__/axe.min.js', route => route.fulfill({contentType:'text/javascript', body:axe}));
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  page.on('pageerror', e => report.errors.push(name + ': ' + e.message));
  page.on('console', m => { if (m.type() === 'error') report.errors.push(name + ': ' + m.text()); });
  const desktop = name === 'desktop';
  const activate = async locator => desktop ? keyboardClick(page, locator) : locator.click();
  const begin = performance.now();
  await page.goto(url);
  await page.locator('.hero-actions').getByRole('link', {name: catalog.title, exact: true}).waitFor();
  await audit(page, name + '-copertina');
  await shot(page, 'dopo-' + name);
  const untilInteraction = performance.now();
  await activate(page.locator('.hero-actions').getByRole('link', {name: catalog.title, exact: true}));
  await activate(page.locator('.discipline-course').getByRole('link', {name: course.title, exact: true}));
  await activate(page.getByRole('button', {name: 'Apri un quaderno di prova'}));
  await page.locator('.discipline-gate').waitFor({state: 'detached'});
  await activate(page.getByRole('link', {name: first.title, exact: true}));
  await page.locator('.lettore-opzioni summary').waitFor().catch(async error => {
    throw Error(error.message + '\n' + page.url() + '\n' + (await page.locator('main').innerText()).slice(0, 1000));
  });
  const toLesson = performance.now() - untilInteraction;
  if (desktop) {
    await activate(page.locator('.lettore-opzioni summary'));
    await activate(page.getByRole('button', {name: 'Leggi la trascrizione'}));
    await page.getByText('Trascrizione disponibile.').waitFor();
    await activate(page.locator('.lettore-opzioni summary'));
    await activate(page.getByRole('button', {name: 'Un passaggio alla volta'}));
    await page.getByText(/^Passaggio 1 di/).waitFor();
    await activate(page.getByRole('button', {name: 'Avanti', exact: true}));
    await activate(page.getByRole('button', {name: 'Mostra tutto', exact: true}));
    await activate(page.getByRole('button', {name: 'Segna la lettura come conclusa'}));
    await page.getByText('Lettura conclusa e salvata nel quaderno.').waitFor();
  }
  await audit(page, name + '-lezione');
  await shot(page, 'lezione-' + name);
  await activate(page.locator('[data-exercise]').first());
  await page.locator('form[data-quiz] legend').waitFor();
  assert.equal(await page.getByRole('heading', {name:'Soluzione commentata'}).count(), 0);
  await audit(page, name + '-quesito');
  await activate(page.getByRole('button', {name: 'Chiedi un suggerimento'}));
  await page.locator('[data-hints] p').waitFor();
  const wrong = quiz.options.find(opt => opt.id !== quiz.correctOptionId);
  const choice = page.getByRole('radio', {name: wrong.text, exact: true});
  if (desktop) {
    // A radiogroup is one Tab stop. Arrow keys move among the choices.
    const firstChoice = page.getByRole('radio').first();
    for (let i = 0; i < 160 && !(await firstChoice.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
    assert.ok(await firstChoice.evaluate(el => el === document.activeElement));
    for (let i = 0; i < quiz.options.findIndex(o => o.id === wrong.id); i++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
  } else await choice.check();
  assert.ok(await choice.isChecked());
  await activate(page.getByRole('button', {name: 'Verifica la risposta'}));
  await page.getByRole('heading', {name:'Rivedi il passaggio'}).waitFor();
  assert.equal(await page.locator('.discipline-alternatives details').count(), quiz.options.length);
  assert.equal(await page.locator('.discipline-steps li').count(), quiz.solution.length);
  await audit(page, name + '-correzione');
  await shot(page, 'correzione-' + name);
  if (desktop) {
    const snapshot = await page.locator('main').ariaSnapshot();
    assert.ok(snapshot.includes('Soluzione commentata') && snapshot.includes('Confronta le alternative'));
    await fs.writeFile(path.join(evidence, 'semantica-correzione.yml'), snapshot);
    await page.pdf({path: path.join(evidence, 'svolgimento-stampato.pdf'), format:'A4', printBackground:true,
      margin: {top:'14mm', right:'15mm', bottom:'15mm', left:'15mm'}});
  }
  const response = await (await page.request.get(url + scope + '/me')).json();
  assert.equal(response.skills[first.skillId].errors, 1);
  assert.equal(response.skills[first.skillId].independent, 0);
  if (desktop) assert.equal(response.skills[first.skillId].completions, 1);
  await page.reload();
  await page.getByText('Tentativo ritrovato nel quaderno.').waitFor();
  await activate(page.locator('.mast-tools').getByRole('link', {name:'Materie'}));
  await activate(page.locator('.discipline-entry').filter({hasText: catalog.title}));
  const resume = page.getByRole('link', {name:'Riprendi · ' + first.title});
  assert.equal(await resume.getAttribute('href'), route(course.id, first.id, quiz.id));
  await activate(resume);
  await page.getByText('Tentativo ritrovato nel quaderno.').waitFor();
  if (desktop) {
    const modelAfter = await (await page.request.get(url + scope + '/me')).json();
    assert.equal(modelAfter.skills[first.skillId].errors, 1);
    await page.goto(url + route(course.id, second.id, second.activities[0].id));
    const good = second.activities[0].options.find(o => o.id === second.activities[0].correctOptionId);
    await page.getByRole('radio', {name:good.text, exact:true}).check();
    await page.getByRole('button', {name:'Verifica la risposta'}).click();
    await page.getByRole('heading', {name:'Risposta corretta'}).waitFor();
    const checked = await (await page.request.get(url + scope + '/me')).json();
    assert.equal(checked.skills[second.skillId].independent, 1);
    await page.goto(url + route(course.id, first.id));
    await page.locator('.discipline-share > summary').click();
    for (const include of [false, true]) {
      await page.locator('[data-share-evidence]').setChecked(include);
      const waiting = page.waitForEvent('download');
      await page.getByRole('button', {name:'Scarica il contesto di studio'}).click();
      const packet = JSON.parse(await fs.readFile(await (await waiting).path(), 'utf8'));
      assert.equal('evidence' in packet, include);
      assert.equal(packet.unitId, first.id);
      assert.ok(!('user' in packet) && !('correctOptionId' in packet));
    }
    checks('Tastiera, ripresa idempotente, preferenze e stampa, feedback, prova autonoma e condivisione esplicita');
  }
  await page.goto(url + '#percorsi');
  await page.locator('.catalog-row').first().waitFor();
  assert.equal(await page.locator('.catalog-row').count(), 6);
  await page.locator('.catalog-row[href="#corso/C1"]').click();
  await page.getByRole('heading', {name:'Strumenti e Meccanica'}).waitFor();
  await page.getByRole('link', {name:'Inizia dalle lezioni'}).click();
  await page.locator('.topic-row').first().click();
  await page.getByRole('heading', {name:'Dare una misura alle cose'}).waitFor();
  report.statistics.push({profile: name, width, height, secondsHomeToFirstLesson: +(toLesson / 1000).toFixed(2),
    secondsIncludingAudits: +((performance.now() - begin) / 1000).toFixed(2)});
  checks(name + ' · copertina, Analisi, Fisica, ripresa e assenza di overflow orizzontale');
  return {page, context};
}

async function studyTools(page) {
  await page.goto(url + route());
  const comparator = page.locator('.discipline-compare');
  await comparator.locator('summary').click();
  const firstResponse = page.waitForResponse(r => r.url().endsWith('/v1/mathematics/compare'));
  await comparator.getByRole('button', {name:'Confronta'}).click();
  assert.equal((await (await firstResponse).json()).verdict, 'different-domain');
  await comparator.getByRole('status').getByText(/valori|dominio/i).waitFor();
  for (const operation of ['derivative', 'primitive']) {
    await comparator.getByLabel('Operazione').selectOption(operation);
    const response = page.waitForResponse(r => r.url().endsWith('/v1/mathematics/compare'));
    await comparator.getByRole('button', {name:'Confronta'}).click();
    assert.equal((await (await response).json()).verdict, 'equivalent');
  }
  for (const kind of ['secant', 'riemann']) {
    const c = courses.find(c => c.units.some(u => u.representation?.kind === kind));
    assert.ok(c, 'Unità con rappresentazione ' + kind);
    const u = c.units.find(u => u.representation?.kind === kind);
    await page.goto(url + route(c.id, u.id));
    await page.getByRole('heading', {name:u.title, exact:true}).waitFor();
    const slider = page.getByRole('slider');
    await slider.focus();
    await page.keyboard.press('Home');
    if (kind === 'secant') {
      for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
      assert.match(await page.locator('.mathlab-observation').innerText(), /denominatore zero/);
    } else {
      await page.keyboard.press('End');
      assert.match(await page.locator('.mathlab-observation').innerText(), /12 rettangoli/);
    }
    await page.getByText('Leggi i valori in tabella', {exact:true}).click();
    assert.equal(await page.locator('.mathlab-data tbody tr').count(), kind === 'secant' ? 2 : 12);
    await audit(page, 'desktop-grafico-' + kind);
    await page.locator('.discipline-mathlab').screenshot({path: path.join(evidence, kind + '.png')});
  }
  checks('Confronto simbolico e vincoli di dominio, secante degenere e somme di Riemann con alternativa tabellare');
  if (catalog.syllabi.length) {
    await page.goto(url + route());
    await page.getByLabel('Programma universitario').selectOption(catalog.syllabi[0].id);
    await page.locator('[data-syllabus-source] a').waitFor();
    assert.equal(await page.locator('[data-syllabus-source] a').getAttribute('href'), catalog.syllabi[0].url);
    await page.getByRole('searchbox', {name:'Cerca un argomento'}).fill('ZZZ-argomento-assente');
    await page.getByRole('button', {name:'Applica'}).click();
    await page.getByText('0 microcorsi', {exact:true}).waitFor();
    checks('Proiezione del programma, link ufficiale e filtro senza risultati');
  }
  if (catalog.exams?.length) {
    await page.goto(url + route());
    const exam = catalog.exams[0];
    await page.getByRole('link', {name:exam.title, exact:true}).click();
    await page.getByRole('button', {name:'Inizia l’esercitazione'}).click();
    await page.getByRole('radio').first().check();
    await page.getByRole('button', {name:'Quesito successivo'}).click();
    await page.reload();
    await page.getByText(/^Quesito 2 di/).waitFor();
    assert.equal(await page.getByRole('heading', {name:'Soluzione commentata'}).count(), 0);
    await page.getByRole('button', {name:'Rivedi e consegna'}).click();
    await page.getByRole('button', {name:'Consegna le risposte'}).click();
    await page.getByRole('heading', {name:'Esito dell’esercitazione'}).waitFor();
    assert.equal(await page.locator('.discipline-exam-result').count(), exam.activityIds.length);
    await page.locator('.discipline-exam-result > summary').first().click();
    await page.getByRole('heading', {name:'Soluzione commentata'}).waitFor();
    await audit(page, 'desktop-consegna-esame');
    checks('Esercitazione multiquesito, bozza dopo ricarica, consegna parziale e correzione differita');
  }
}

async function switchAccount(page, context) {
  await page.goto(url + route(course.id, first.id, quiz.id));
  await page.getByRole('heading', {name:'Soluzione commentata'}).waitFor();
  const account = await context.newPage();
  await account.goto(url + '#studio');
  await account.locator('.discipline-account').getByRole('heading', {name:catalog.title}).waitFor();
  await account.getByRole('button', {name:'Esci', exact:true}).click();
  await page.locator('.discipline-gate').waitFor();
  assert.equal(await page.locator('.discipline-correction').count(), 0);
  await account.close();
  checks('Il mio studio elenca i microcorsi e il logout da una seconda scheda ritira il contenuto privato');
}

try {
  const [port] = await once(service.stdout, 'data');
  url = 'http://127.0.0.1:' + Number(String(port).trim());
  const browser = await chromium.launch(process.env.ASTRA_CHROME ? {executablePath:process.env.ASTRA_CHROME} : {});
  browsers.push(browser);
  report.chromium = browser.version();
  for (const [name, width, height] of [['desktop',1440,900],['tablet',820,1180],['mobile',390,844]]) {
    const {page, context} = await journey(browser, name, width, height);
    if (name === 'desktop') {
      await studyTools(page);
      await switchAccount(page, context);
    }
    if (name === 'mobile') {
      await page.setViewportSize({width:320,height:720});
      await page.goto(url + route());
      await page.locator('.discipline-filter').waitFor();
      await audit(page,'reflow-320');
    }
    await context.close();
    console.log('PASS', name);
  }
  const safari = await webkit.launch();
  browsers.push(safari);
  report.webkit = safari.version();
  const {context} = await journey(safari, 'webkit-mobile', 390, 844);
  await context.close();
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify({checks:report.checks, audits:report.audits.length, statistics:report.statistics}, null, 2));
} finally {
  await fs.writeFile(path.join(evidence, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  for (const browser of browsers) await browser.close();
  service.kill('SIGTERM');
  await once(service, 'exit');
  await fs.rm(storage, {force:true,recursive:true});
}
