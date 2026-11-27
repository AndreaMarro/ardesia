// Real teacher/resource/student journey on a disposable copy of the existing app.
// ASTRA_CHROME=/usr/bin/chromium node tests/browser-resources.mjs
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const storage = await fs.mkdtemp(path.join(tmpdir(), 'cric-resource-journey-'));
const evidence = path.resolve(process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/resources'));
await fs.mkdir(evidence, {recursive:true});
const env = {...process.env, ASTRA_DATA:storage, PYTHONDONTWRITEBYTECODE:'1'};
const boot = 'from server.store import initialize; from multidiscipline.web import Handler; from http.server import ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(("127.0.0.1",0),Handler); print(s.server_port,flush=True); s.serve_forever()';
const service = spawn('python3', ['-uc', boot], {cwd:root, env, stdio:['ignore','pipe','inherit']});
const report = {checks:[], audits:[], errors:[], status:'RUNNING'};
const browsers = [];
const pages = [];
let url;

function ledger() {
  const code = `import hashlib,json
from server import store
with store.connect() as db:
 result={}
 tables={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
 for name in ('attempts','lab_events','discipline_events','discipline_skill_stats'):
  if name not in tables: continue
  rows=[tuple(row) for row in db.execute('SELECT * FROM '+name+' ORDER BY rowid')]
  result[name]={'count':len(rows),'sha256':hashlib.sha256(store.encode(rows).encode()).hexdigest()}
 print(json.dumps(result))`;
  const result = spawnSync('python3', ['-c', code], {cwd:root, env, encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

async function api(context, suffix, data, expected=200) {
  const response = data === undefined ? await context.request.get(url + suffix) :
    await context.request.post(url + suffix, {headers:{'X-Astra-Request':'1'}, data});
  assert.equal(response.status(), expected, `${suffix}: ${await response.text()}`);
  return response.json();
}

async function track(context) {
  const page = await context.newPage();
  pages.push(page);
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => report.errors.push(error.message));
  return page;
}

async function screenshot(page, name) {
  await page.evaluate(async () => { await document.fonts.ready; scrollTo({top:0,behavior:'instant'}); });
  await page.screenshot({path:path.join(evidence,name+'.png'),fullPage:true,animations:'disabled'});
}

async function audit(page, label) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({url:'/__qa__/axe.min.js'});
  const result = await page.evaluate(async () => {
    const r = await window.axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
    return {violations:r.violations.map(v => ({id:v.id,targets:v.nodes.map(n => n.target)})),
      incomplete:r.incomplete.map(v => v.id),passes:r.passes.length};
  });
  report.audits.push({label,...result});
  assert.deepEqual(result.violations, [], label + ': ' + JSON.stringify(result.violations));
  assert.ok(await page.getByRole('heading',{level:1}).isVisible(), label + ' has a visible title');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ' fits viewport');
}

async function caseState(page) {
  await page.locator('[data-bench="LAB3D-04"] [name="r"]').waitFor();
  // Rendering the scene may finish after the parameter form is inserted. Wait
  // for the requested view to be selected, then measure the real DOM state.
  await page.locator('[data-view="diagram"][aria-pressed="true"]').waitFor();
  return page.evaluate(() => ({
    r:Number(document.querySelector('[name="r"]').value),
    time:Number(document.querySelector('[data-instant]').value),
    view:document.querySelector('[data-view][aria-pressed="true"]')?.dataset.view,
  }));
}

try {
  const [port] = await once(service.stdout,'data');
  url = 'http://127.0.0.1:' + Number(String(port).trim());
  const browser = await chromium.launch({
    ...(process.env.ASTRA_CHROME ? {executablePath:process.env.ASTRA_CHROME} : {}),
    args:['--enable-unsafe-swiftshader'],
  });
  browsers.push(browser);
  report.browser = browser.version();
  const owner = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const student = await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const guest = await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const axe = await fs.readFile(path.join(root,'node_modules/axe-core/axe.min.js'),'utf8');
  for (const context of [owner,student]) {
    await context.route('**/__qa__/axe.min.js', route => route.fulfill({contentType:'text/javascript',body:axe}));
    await api(context,'/api/demo',{});
  }
  const before = ledger();
  const page = await track(owner);
  const learner = await track(student);
  await page.goto(url + '/');
  await page.getByRole('link',{name:'Risorse',exact:true}).first().click();
  await page.getByRole('heading',{name:'Risorse per capire e spiegare'}).waitFor();
  await audit(page,'resource-directory-desktop');
  await screenshot(page,'01-resources');
  await page.getByRole('link',{name:'Apri lo strumento',exact:true}).click();
  const radius = page.getByRole('slider',{name:/Raggio interno R/});
  await radius.waitFor({state:'visible'});
  assert.equal(await page.locator('[data-predict]').isVisible(),false,'free exploration does not require an answer');
  assert.ok(await page.locator('[data-controls]').isVisible());
  assert.ok(await page.locator('.bench-param input, .bench-param select').evaluateAll(
    controls => controls.every(control => [...control.labels || []].some(label => label.textContent.trim()))),
    'each parameter has a native accessible label');
  await radius.focus();
  await radius.press('Home');
  for (let i=0;i<17;i++) await radius.press('ArrowRight');
  assert.equal(Number(await radius.inputValue()),2.2);
  await page.locator('.time-options summary').click();
  await page.locator('[data-instant]').fill('0.1');
  await page.locator('[data-instant]').press('Tab');
  await page.getByRole('button',{name:'Tavola 2D',exact:true}).click();
  assert.deepEqual(await caseState(page),{r:2.2,time:0.1,view:'diagram'});
  const focus = page.getByRole('button',{name:'Concentrazione',exact:true});
  await focus.focus();
  await focus.press('Enter');
  await page.getByRole('dialog',{name:'Scena in concentrazione'}).waitFor();
  assert.ok(await page.getByRole('dialog').getByRole('slider',{name:/Raggio interno R/}).isVisible(),
    'presentation keeps the physical parameters beside the scene');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(),0);
  assert.ok(await focus.evaluate(node => node === document.activeElement),'Escape restores focus');
  report.checks.push('Free tool, keyboard parameters, 2D view and presentation controls without prediction gating');
  await page.getByRole('button',{name:'Collegamento a questo caso',exact:true}).click();
  const caseLink = await page.getByLabel('Collegamento al caso',{exact:true}).inputValue();
  const stateInLink = JSON.parse(Buffer.from(new URL(caseLink).hash.split('/').at(-1),'base64url').toString());
  assert.deepEqual(Object.keys(stateInLink).sort(),['model','parameters','resource','schema','time','view']);
  assert.equal(stateInLink.parameters.r,2.2);
  assert.equal(stateInLink.time,0.1);
  assert.equal(stateInLink.view,'diagram');
  await learner.goto(caseLink);
  assert.deepEqual(await caseState(learner),{r:2.2,time:0.1,view:'diagram'});
  const visitor = await track(guest);
  await visitor.goto(caseLink);
  assert.deepEqual(await caseState(visitor),{r:2.2,time:0.1,view:'diagram'});
  assert.ok(await visitor.getByRole('link',{name:'Accedi al tuo quaderno',exact:true}).isVisible());
  assert.equal(await visitor.getByRole('button',{name:'Salva questo caso',exact:true}).count(),0);
  report.checks.push('Self-contained model case reopens with identical parameters, time and view in a second browser context');
  report.checks.push('Public resource case is usable before login, with account access required for personal saves');
  await audit(page,'free-tool-desktop');
  await screenshot(page,'02-reproducible-case');

  await page.getByText('Salva nel quaderno e riusa in una raccolta',{exact:true}).click();
  await page.getByLabel('Nome del caso',{exact:true}).fill('Raggio 2,2 mm · prima misura');
  await page.getByLabel('Nota per ritrovarlo (facoltativa)',{exact:true}).fill('PRIVATE-NOTE: osservazione del docente');
  await page.getByRole('button',{name:'Salva questo caso',exact:true}).click();
  await page.getByRole('link',{name:'Riapri il caso',exact:true}).waitFor();
  const privateCaseRoute = await page.getByRole('link',{name:'Riapri il caso',exact:true}).getAttribute('href');
  const caseId = privateCaseRoute.split('/').at(-1);
  const endpoint = '/api/v1/resource-cases';
  await api(student,endpoint + '/cases/' + caseId,undefined,404);
  await page.getByRole('link',{name:'Riapri il caso',exact:true}).click();
  assert.deepEqual(await caseState(page),{r:2.2,time:0.1,view:'diagram'});
  await page.reload();
  assert.deepEqual(await caseState(page),{r:2.2,time:0.1,view:'diagram'});
  report.checks.push('Saved case persists across navigation/reload; a different account cannot read its private record');

  await page.getByRole('link',{name:'Le mie raccolte',exact:true}).click();
  await page.getByLabel('Nome della raccolta',{exact:true}).fill('Microcorso · raggio e portata');
  await page.getByLabel('Obiettivo o istruzione (facoltativi)',{exact:true}).fill('Confronta la portata e spiega il ruolo della quarta potenza.');
  await page.getByRole('button',{name:'Crea raccolta',exact:true}).click();
  await page.getByRole('heading',{name:'Microcorso · raggio e portata',exact:true}).waitFor();
  await page.getByLabel('Aggiungi un caso salvato',{exact:true}).selectOption(caseId);
  await page.getByRole('button',{name:'Aggiungi',exact:true}).click();
  await page.getByRole('button',{name:'Salva raccolta',exact:true}).click();
  await page.getByText('Raccolta salvata.',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('link',{name:'Apri questo caso',exact:true}).waitFor();
  const collectionUrl = page.url();
  const collectionId = new URL(collectionUrl).hash.split('/').at(-1);
  await api(student,endpoint + '/collections/' + collectionId,undefined,404);
  await page.getByRole('button',{name:'Attiva collegamento alla raccolta',exact:true}).click();
  const shareInput = page.getByLabel('Collegamento alla raccolta',{exact:true});
  await shareInput.waitFor();
  const sharedUrl = await shareInput.inputValue();
  const shareToken = new URL(sharedUrl).hash.split('/').at(-1);
  const shared = await api(student,endpoint + '/shared/' + shareToken);
  assert.ok(!JSON.stringify(shared).includes('PRIVATE-NOTE'),'private case note is not shared');
  await audit(page,'collection-desktop');
  await screenshot(page,'03-collection');
  await learner.goto(sharedUrl);
  await learner.getByRole('heading',{name:'Microcorso · raggio e portata',exact:true}).waitFor();
  assert.equal(await learner.getByText('PRIVATE-NOTE: osservazione del docente',{exact:true}).count(),0);
  const lesson = await learner.getByRole('link',{name:'Lezione collegata',exact:true}).getAttribute('href');
  assert.match(lesson,/^#materiale\//);
  await learner.getByRole('link',{name:'Apri questo caso',exact:true}).click();
  assert.deepEqual(await caseState(learner),{r:2.2,time:0.1,view:'diagram'});
  const returnToCollection = learner.getByRole('link',{name:'Torna alla raccolta',exact:true});
  assert.equal(await returnToCollection.getAttribute('href'),'#condivisione/'+shareToken);
  await returnToCollection.click();
  await learner.getByRole('heading',{name:'Microcorso · raggio e portata',exact:true}).waitFor();
  await learner.getByRole('link',{name:'Lezione collegata',exact:true}).click();
  await learner.locator('.reader').waitFor();
  report.checks.push('Teacher collection persists, shares only intended content, and student opens the same case and its real lesson');

  await page.getByRole('button',{name:'Disattiva collegamento',exact:true}).click();
  await page.getByText('Collegamento disattivato. Il vecchio indirizzo non apre più la raccolta.',{exact:true}).waitFor();
  await api(student,endpoint + '/shared/' + shareToken,undefined,404);
  await learner.goto(sharedUrl);
  await learner.locator('main').getByText(/non disponibile|non trovat|disattivat/i).first().waitFor();
  assert.equal(await learner.getByRole('link',{name:'Apri questo caso',exact:true}).count(),0);
  await page.getByRole('button',{name:'Attiva collegamento alla raccolta',exact:true}).click();
  await shareInput.waitFor();
  assert.notEqual(await shareInput.inputValue(),sharedUrl,'new sharing activation must not reactivate the revoked token');
  await api(student,endpoint + '/shared/' + shareToken,undefined,404);
  report.checks.push('Revocation denies the old shared collection and reactivation creates a different token');

  await page.setViewportSize({width:320,height:844});
  await page.goto(caseLink);
  assert.deepEqual(await caseState(page),{r:2.2,time:0.1,view:'diagram'});
  await audit(page,'free-tool-320');
  await screenshot(page,'04-case-320');
  await page.goto(collectionUrl);
  await page.getByRole('link',{name:'Apri questo caso',exact:true}).waitFor();
  await audit(page,'collection-320');
  await screenshot(page,'05-collection-320');
  const privateCase = await track(owner);
  await privateCase.goto(url + '/' + privateCaseRoute);
  await privateCase.getByText('PRIVATE-NOTE: osservazione del docente',{exact:false}).first().waitFor();
  const account = await track(owner);
  await account.goto(url + '/#studio');
  await account.getByRole('button',{name:'Esci',exact:true}).click();
  await page.locator('[data-collection-editor]').waitFor({state:'detached'});
  await privateCase.locator('.resource-saved-title').waitFor({state:'detached'});
  assert.equal(await privateCase.getByText('PRIVATE-NOTE: osservazione del docente',{exact:false}).count(),0);
  assert.equal(await page.getByRole('link',{name:'Apri questo caso',exact:true}).count(),0);
  await api(owner,endpoint+'/cases/'+caseId,undefined,401);
  report.checks.push('Logout in another tab removes private collection and saved-case content from existing tabs');
  const after = ledger();
  assert.deepEqual(after,before,'exploration, sharing and resource notes cannot create learning evidence');
  report.ledgerBefore=before;
  report.ledgerAfter=after;
  report.checks.push('320px layouts and WCAG automated audit; learning evidence ledger unchanged by tool/collection use');
  assert.deepEqual(report.errors,[]);
  report.status='PASS';
  console.log(JSON.stringify({status:report.status,checks:report.checks,audits:report.audits.length},null,2));
} catch(error) {
  report.status='FAIL';
  report.failure=String(error.stack || error);
  for (const [i,page] of pages.entries()) {
    if (!page.isClosed()) {
      await page.screenshot({path:path.join(evidence,`failure-${i}.png`),fullPage:true}).catch(()=>{});
      await fs.writeFile(path.join(evidence,`failure-${i}.txt`),page.url()+'\n'+await page.locator('main').innerText().catch(()=>''));
    }
  }
  throw error;
} finally {
  await fs.writeFile(path.join(evidence,'report.json'),JSON.stringify(report,null,2)+'\n');
  for (const browser of browsers) await browser.close();
  service.kill('SIGTERM');
  await once(service,'exit');
  await fs.rm(storage,{force:true,recursive:true});
}
