// Browser plugin not available. Real Chromium/UI + Study API/SQLite; synthetic actors.
// The passage and .lesson must come from the separate real native capture run.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {chromium} = require(path.resolve('apps/studio/node_modules/playwright-core'));
const web = process.env.ARDESIA_WEB_ORIGIN || 'http://127.0.0.1:5320';
const accessPath = process.env.ARDESIA_DEMO_ACCESS || path.resolve('../study-qa/demo-access.json');
const passagePath = process.env.ARDESIA_PASSAGE_DESCRIPTOR || path.resolve('../studio-ui-run-3/passage.json');
const bundlePath = process.env.ARDESIA_LESSON_BUNDLE || path.resolve('../studio-ui-run-3/lesson-a.lesson');
const out = path.resolve(process.env.ARDESIA_POISEUILLE_QA_OUTPUT || '../poiseuille-ui-run-1');
fs.mkdirSync(out, {recursive: true});
function sourceManifest() {
  const roots = ['apps/web/src', 'apps/studio/src', 'packages/engine/lessonos/study', 'services/study-api/study_api',
    'apps/web/vite.config.ts', 'apps/studio/vite.config.ts', 'package-lock.json', 'apps/studio/package-lock.json'];
  const files = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', ...roots], {encoding: 'utf8'}).trim().split('\n'))]
    .filter(file => /\.(ts|tsx|css|json|py|html)$/.test(file) && fs.existsSync(file)).sort();
  const hashes = Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  return {sha256: crypto.createHash('sha256').update(JSON.stringify(hashes)).digest('hex'), files: hashes};
}
const sourceBefore = sourceManifest();
fs.writeFileSync(path.join(out, 'source-before.json'), JSON.stringify(sourceBefore, null, 2));
const descriptor = JSON.parse(fs.readFileSync(passagePath, 'utf8'));
const access = JSON.parse(fs.readFileSync(accessPath, 'utf8'));
assert.equal(access.synthetic, true);
const checks = [], errors = [], consoleMessages = [], failedRequests = [], httpFailures = [], receipts = [];
const check = (name, pass) => {checks.push({name, pass: !!pass}); assert.ok(pass, name);};
const transcript = 'Qui la portata Q resta fissata. Isoliamo Δp: il rapporto delle pressioni è il reciproco della quarta potenza del rapporto dei raggi.';
let priorTransferAvailable = false;
const marker = 'Prova sintetica browser ' + Date.now();
const procedures = [
  marker + ': a pressione fissata la portata cresce con la quarta potenza del raggio.',
  marker + ': vincolo scambiato, penso che la pressione cresca come r alla quarta.',
  marker + ': dimezzando il raggio a Q costante la pressione necessaria cresce di sedici volte.',
];
(async () => {
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, locale: 'it-IT', reducedMotion: 'reduce'});
  let tracing = false;
  const watch = page => {
    page.on('pageerror', error => errors.push({url: page.url(), message: error.message}));
    page.on('console', message => {if (['warning', 'error'].includes(message.type())) consoleMessages.push({url: page.url(), type: message.type(), text: message.text()});});
    page.on('requestfailed', request => failedRequests.push({url: request.url(), error: request.failure()?.errorText}));
    page.on('response', response => {if (response.status() >= 400) httpFailures.push({url: response.url(), status: response.status()});});
  };
  context.on('page', watch);
  const page = await context.newPage();
  async function trace(name) {if (tracing) await stopTrace(); await context.tracing.start({screenshots: true, snapshots: true, sources: true}); tracing = name;}
  async function stopTrace() {if (tracing) {await context.tracing.stop({path: path.join(out, tracing + '-trace.zip')}); tracing = false;}}
  async function login(actor) {
    // Credentials are exchanged before tracing; tokens never enter saved evidence.
    await stopTrace();
    const response = await context.request.post(web + '/study/session', {data: {token: access.tokens[actor]}});
    assert.equal(response.status(), 200);
    await page.goto(web + '/?edition=fluidi');
    await page.getByRole('button', {name: actor.startsWith('tutor') ? 'Prepara l’aula' : 'Apri il corso', exact: true}).waitFor();
  }
  async function classroom(tutor = false) {
    await page.getByRole('button', {name: tutor ? 'Prepara l’aula' : 'Apri il corso', exact: true}).click();
    await page.getByRole('button', {name: 'Apri episodio guidato', exact: true}).click();
    await page.getByRole('heading', {name: 'Il vincolo cambia il risultato', exact: true}).waitFor();
  }
  async function predict(ratio, boundary, procedure) {
    check('result hidden before prediction ' + receipts.length, await page.getByTestId('episode-ratio').count() === 0);
    await page.getByLabel('Rapporto previsto', {exact: true}).fill(ratio);
    await page.getByRole('combobox', {name: /^Grandezza che resta fissata/}).selectOption(boundary);
    await page.getByLabel('Spiega il vincolo e il procedimento', {exact: true}).fill(procedure);
    const response = page.waitForResponse(response => new URL(response.url()).pathname === '/study/submissions' && response.request().method() === 'POST');
    await page.getByRole('button', {name: 'Registra previsione e confronta', exact: true}).click();
    const received = await response;
    assert.equal(received.status(), 200);
    const receipt = await received.json();
    receipts.push(receipt);
    await page.getByTestId('episode-ratio').waitFor();
    return receipt;
  }
  try {
    await trace('import');
    const studio = await context.newPage();
    const target = new URL(descriptor.replayUrl);
    await studio.goto(target.origin + '/?vista=lezioni-salvate#' + encodeURIComponent(descriptor.lessonId));
    await studio.getByLabel('Seleziona bundle .lesson').setInputFiles(bundlePath);
    await studio.getByRole('button', {name: 'Importa il bundle', exact: true}).click();
    await studio.getByText(/Memoria didattica ripristinata|Import completato|ripristinata|importata/i).first().waitFor({timeout: 20000});
    await studio.close();
    await login('tutor-synthetic');
    await trace('teacher-author');
    await classroom(true);
    await page.getByLabel('Riferimento copiato dalla lavagna', {exact: true}).fill(JSON.stringify(descriptor));
    await page.getByLabel('Trascrizione e spiegazione del passaggio', {exact: true}).fill(transcript);
    const sharedResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/study/resources' && response.request().method() === 'POST');
    await page.getByRole('button', {name: 'Condividi passaggio con il gruppo', exact: true}).click();
    const shared = await (await sharedResponse).json();
    check('actual Studio descriptor saved as canonical versioned source', shared.kind === 'lesson-passage' && JSON.parse(shared.text).descriptor.recordingId === descriptor.recordingId);
    await page.getByText('Passaggio condiviso con il gruppo nella sua versione salvata.', {exact: true}).waitFor();
    await page.screenshot({path: path.join(out, 'teacher-source-desktop.png')});
    await login('student-01');
    const previousWorkspace = await (await context.request.get(web + '/study/workspace?editionId=fluidi')).json();
    priorTransferAvailable = previousWorkspace.submissions.some(item => item.activityEvidence?.experienceId === 'poiseuille-boundary-v1' && item.activityEvidence?.stepId === 'transfer');
    await trace('student-episode');
    await classroom();
    await page.getByRole('combobox', {name: /^Passaggio della lezione collegato/}).selectOption(shared.id);
    const first = await predict('16', 'pressure', procedures[0]);
    check('double radius fixed pressure gives Q times 16', first.activityEvidence.result.ratio === 16);
    await page.getByRole('button', {name: 'Cambia il vincolo', exact: true}).click();
    const second = await predict('16', 'pressure', procedures[1]);
    check('double radius fixed flow gives pressure divided by 16', second.activityEvidence.result.ratio === .0625);
    await page.getByText(/Hai scambiato il vincolo/).waitFor();
    await page.getByRole('button', {name: 'Recupera il passaggio della lezione', exact: true}).click();
    await page.getByText(transcript, {exact: true}).waitFor();
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', {name: 'Torna al passaggio nella lavagna', exact: true}).click();
    const popup = await popupPromise;
    await popup.getByRole('slider', {name: 'linea del tempo della lezione'}).waitFor({timeout: 30000});
    await popup.getByText('Passaggio collegato: ' + descriptor.objectRefs.map(ref => ref.label).join(', '), {exact: true}).waitFor();
    check('recovery opens the actual recording session digest and object version', popup.url() === descriptor.replayUrl);
    await popup.waitForFunction(() => [...document.querySelectorAll('audio')].some(audio => audio.readyState >= 1));
    const decoded = await popup.locator('audio').evaluate(async audio => {
      const bytes = await (await fetch(audio.currentSrc || audio.src)).arrayBuffer();
      const byteCount = bytes.byteLength;
      const ac = new AudioContext();
      try {const buffer = await ac.decodeAudioData(bytes); return {bytes: byteCount, duration: buffer.duration, htmlDuration: String(audio.duration)};}
      finally {await ac.close();}
    });
    check('real imported audio bytes decode in browser', decoded.bytes > 0 && decoded.duration > 0);
    fs.writeFileSync(path.join(out, 'linked-audio-decode.json'), JSON.stringify(decoded, null, 2));
    await popup.screenshot({path: path.join(out, 'linked-replay-desktop.png')});
    await popup.close();
    await page.screenshot({path: path.join(out, 'constraint-recovery-desktop.png')});
    await page.getByRole('button', {name: 'Affronta il problema diverso', exact: true}).click();
    const third = await predict('16', 'flow', procedures[2]);
    check('half radius fixed flow is a distinct problem with pressure times 16', third.activityEvidence.result.ratio === 16 && third.activityEvidence.exerciseRef === 'RF-04');
    check('new problem retains truthful support and previous-result availability', third.activityEvidence.assistance === (priorTransferAvailable ? 'SUPPORT_REQUESTED' : 'NO_SUPPORT_REQUESTED'));
    await page.screenshot({path: path.join(out, 'transfer-desktop.png')});

    await login('tutor-synthetic');
    await trace('teacher-review');
    await page.getByRole('button', {name: 'Da correggere', exact: true}).click();
    const candidates = page.getByRole('complementary', {name: 'Consegne del gruppo'}).getByRole('button');
    await candidates.first().waitFor();
    let selected = false;
    for (let i = 0; i < await candidates.count(); i++) {
      await candidates.nth(i).click();
      const original = page.locator('.submission-answer');
      if ((await original.textContent()).includes(procedures[1])) {selected = true; break;}
    }
    check('teacher finds the same received constraint error', selected);
    await page.getByRole('heading', {name: 'Previsione prima del risultato', exact: true}).waitFor();
    await page.getByRole('button', {name: 'Inizia la correzione', exact: true}).click();
    await page.getByLabel('Spiegazione del tutor', {exact: true}).fill('Q resta fissata. Isola Δp: il raggio doppio richiede 1/16 della pressione. Controlla ora il caso inverso.');
    await page.getByRole('button', {name: 'Restituisci la correzione', exact: true}).click();
    await page.getByText(/Intervento del tutor restituito sulla versione/).waitFor();
    await page.getByText('Collega un passaggio al diario', {exact: true}).click();
    const originalInput = page.getByRole('textbox', {name: 'Originale della fonte', exact: true});
    await originalInput.focus();
    await originalInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.getByRole('combobox', {name: /^Concetto/}).selectOption('model-selection');
    await page.getByRole('button', {name: 'Proponi il passaggio', exact: true}).click();
    await page.getByRole('button', {name: 'Apri il diario per il prossimo passo', exact: true}).click();
    await page.getByText('Verifica e prepara il prossimo passo', {exact: true}).click();
    const criterion = 'Isola Δp mantenendo Q costante e giustifica la quarta potenza del raggio.';
    await page.getByLabel('Spiegazione del tutor', {exact: true}).fill('Il vincolo scelto nella previsione non era quello del problema.');
    await page.getByLabel('Criterio della rubrica', {exact: true}).fill(criterion);
    await page.getByLabel('Prossimo passo', {exact: true}).fill('Risolvi una nuova prova con raggio dimezzato a portata fissata.');
    await page.getByLabel('Nuovo problema', {exact: true}).fill('Il raggio si dimezza, Q è costante. Quanto vale Δp/Δp₀? Spiega il procedimento.');
    await page.getByLabel('Rapporto originale r/r₀', {exact: true}).fill('2');
    await page.getByLabel('Nuovo rapporto r/r₀', {exact: true}).fill('0.5');
    await page.getByRole('combobox', {name: /^Grandezza fissata nel confronto/}).selectOption('flow');
    await page.getByRole('button', {name: 'Conferma osservazione e assegna la nuova prova', exact: true}).click();
    await page.getByText('Da riprovare', {exact: true}).last().waitFor();
    await page.screenshot({path: path.join(out, 'teacher-next-step-desktop.png')});

    await login('student-01');
    await trace('student-diary');
    await page.getByRole('button', {name: 'Il mio lavoro', exact: true}).click();
    await page.getByText('Affronta una situazione nuova', {exact: true}).click();
    const newProcedure = marker + ': a Q costante Δp è inversa a r⁴. Se r si dimezza, Δp aumenta di 16 volte.';
    await page.getByLabel('Spiega il tuo procedimento', {exact: true}).fill(newProcedure);
    await page.getByRole('button', {name: 'Consegna la nuova prova', exact: true}).click();
    await page.getByText('In pratica', {exact: true}).waitFor();
    await page.screenshot({path: path.join(out, 'student-diary-transfer-desktop.png')});
    await login('tutor-synthetic');
    await trace('teacher-verification');
    await page.getByRole('button', {name: 'Diario degli errori', exact: true}).click();
    await page.getByText('Rivedi la nuova prova', {exact: true}).click();
    await page.getByLabel('Passaggio del procedimento verificato', {exact: true}).fill(newProcedure);
    await page.getByLabel('Motivazione della verifica', {exact: true}).fill('Il procedimento esplicita il vincolo Q e isola la pressione prima di confrontare i raggi.');
    await page.getByLabel('Che cosa rende diversa questa prova', {exact: true}).fill('Il raggio è dimezzato anziché raddoppiato.');
    await page.getByRole('button', {name: 'Registra la verifica del tutor', exact: true}).click();
    await page.getByRole('button', {name: 'Verificati', exact: true}).click();
    await page.getByText('Verificato su una nuova prova', {exact: true}).last().waitFor();
    check('existing diary records explicit synthetic tutor verification', true);
    await page.screenshot({path: path.join(out, 'teacher-verified-desktop.png')});

    await login('student-02');
    await trace('mobile-keyboard');
    await page.setViewportSize({width: 390, height: 844});
    await classroom();
    await page.getByRole('combobox', {name: /^Variante del percorso/}).selectOption('poiseuille-nearby-v1');
    await page.getByRole('heading', {name: 'Piccole variazioni, stesso modello', exact: true}).waitFor();
    await page.screenshot({path: path.join(out, 'episode-mobile-first-viewport.png')});
    for (const name of ['Rapporto previsto', 'Grandezza che resta fissata', 'Spiega il vincolo e il procedimento']) {
      const control = page.getByLabel(name, {exact: false});
      await control.scrollIntoViewIfNeeded();
      const box = await control.boundingBox();
      check('mobile control visible ' + name, box && box.x >= 0 && box.width > 150 && box.x + box.width <= 390);
    }
    await page.getByLabel('Rapporto previsto', {exact: true}).fill('2.0736');
    await page.getByRole('combobox', {name: /^Grandezza che resta fissata/}).selectOption('pressure');
    await page.getByLabel('Spiega il vincolo e il procedimento', {exact: true}).fill('A pressione fissata uso il rapporto 1,2 alla quarta, mantenendo fluido e lunghezza.');
    await page.keyboard.press('Tab');
    check('keyboard reaches prediction submission', await page.getByRole('button', {name: 'Registra previsione e confronta', exact: true}).evaluate(button => button === document.activeElement));
    await page.keyboard.press('Enter');
    await page.getByTestId('episode-ratio').waitFor();
    check('second data-authored variant uses canonical model', (await page.getByTestId('episode-ratio').textContent()).includes('2,0736'));
    check('reduced motion preference applied', await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
    await page.getByTestId('episode-ratio').scrollIntoViewIfNeeded();
    await page.screenshot({path: path.join(out, 'episode-mobile-result.png')});
    check('no application page errors', errors.length === 0);
  } catch (error) {
    fs.writeFileSync(path.join(out, 'failure.txt'), String(error.stack));
    await page.screenshot({path: path.join(out, 'failure.png')}).catch(() => {});
    throw error;
  } finally {
    await stopTrace();
    const sourceAfter = sourceManifest();
    fs.writeFileSync(path.join(out, 'source-after.json'), JSON.stringify(sourceAfter, null, 2));
    checks.push({name: 'product source unchanged during browser journey', pass: sourceBefore.sha256 === sourceAfter.sha256});
    fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({checks, errors, consoleMessages, failedRequests, httpFailures, priorTransferAvailable, receipts}, null, 2));
    await browser.close();
    assert.equal(sourceBefore.sha256, sourceAfter.sha256, 'product source unchanged during browser journey');
  }
  console.log(JSON.stringify({output: out, checks: checks.length}));
})().catch(error => {console.error(error); process.exitCode = 1;});
