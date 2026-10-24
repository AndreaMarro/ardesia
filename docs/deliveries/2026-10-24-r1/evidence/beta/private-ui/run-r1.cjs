// R1 UI proof, derived selectively from #299 run-bridge.cjs.
// Two independent browser contexts; synthetic identity file stays in memory.
// No route mocks, product state injection, remote service, Auth trace or token log.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const repo = process.cwd();
const {chromium} = require(path.join(repo, 'apps/studio/node_modules/playwright-core'));
const origin = process.env.ARDESIA_WEB_ORIGIN || 'http://127.0.0.1:5417';
assert.equal(origin, 'http://127.0.0.1:5417', 'R1 fresh loopback server required; old5412 is immutable');
const accessPath = process.env.ARDESIA_DEMO_ACCESS;
const candidatePath = process.env.ARDESIA_CANDIDATE_MANIFEST;
const expectedSha = process.env.ARDESIA_EXPECTED_SHA;
const studentActor = process.env.ARDESIA_STUDENT_ACTOR || 'student-01';
assert.ok(/^student-\d{2}$/.test(studentActor), 'Synthetic fixture student required');
assert.ok(accessPath && candidatePath && /^[0-9a-f]{40}$/.test(expectedSha || ''), 'Explicit fresh access file, candidate manifest and source SHA required');
const out = path.resolve(process.env.ARDESIA_PRIVATE_UI_OUT || '../r1/beta/private-ui/run-' + Date.now());
assert.ok(!fs.existsSync(out), 'Fresh evidence directory required');
fs.mkdirSync(out, {recursive: true, mode: 0o700});
const access = JSON.parse(fs.readFileSync(accessPath, 'utf8'));
assert.equal(access.synthetic, true, 'Synthetic fixture required');
const secrets = Object.values(access.tokens);
const redact = value => secrets.reduce((text, secret) => text.replaceAll(secret, '[REDACTED]'), String(value))
  .replace(/courseBridge=[^&\s"']+/g, 'courseBridge=[REDACTED]');
const write = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n', {mode: 0o600});
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const report = {schema: 'ardesia.r1-private-ui.v1', synthetic: true, origin, expectedSha,
  runtime: process.version, studentActor,
  browserPath: 'Browser plugin not available; explicitly requested existing Playwright runner reused.',
  capture: 'Native MediaRecorder with a WebAudio tone; no hardware microphone, speech recognition or real learner data.',
  authEvidence: 'Fixture login before evidence; no tokens, headers, storageState or network trace retained.',
  remoteBeta: 'NOT_RUN', launchAllowed: false, checks: [], screenshots: [], errors: [], failedRequests: [], console: [], fonts: []};
const receipts = [], sources = [], diaryCommands = [];
const marker = 'R1 sintesi ' + Date.now();
let browser, teacher, student, tutorPage, studentPage, studio, recovered;
function check(name, value, detail) {
  report.checks.push({name, pass: Boolean(value), ...(detail ? {detail} : {})});
  assert.ok(value, name);
}
function near(actual, expected, name) {
  assert.ok(typeof actual === 'number' && Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected)), name);
}
function verifyArtifact(stage) {
  const manifest = JSON.parse(fs.readFileSync(candidatePath));
  const inventory = JSON.parse(fs.readFileSync(path.join(path.dirname(candidatePath), 'source-manifest.json')));
  assert.equal(manifest.privateBeta, true);
  assert.equal(manifest.privateDataIncluded, false);
  assert.equal(manifest.source.commit, expectedSha);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim(), expectedSha);
  assert.equal(manifest.source.trackedDiffSha256, digest(Buffer.alloc(0)), 'Committed frozen candidate required');
  assert.equal(manifest.source.sourceTreeSha256, inventory.sha256);
  for (const [name, sha] of Object.entries(inventory.files)) {
    assert.equal(digest(fs.readFileSync(path.join(repo, name))), sha, 'Source changed after build: ' + name);
  }
  for (const [name, sha] of Object.entries(manifest.assetsSha256)) {
    assert.equal(digest(fs.readFileSync(path.join(path.dirname(candidatePath), name))), sha, 'Artifact changed: ' + name);
  }
  report.artifact = {commit: expectedSha, manifestSha256: digest(fs.readFileSync(candidatePath)),
    sourceTreeSha256: inventory.sha256, assetCount: Object.keys(manifest.assetsSha256).length};
  check('exact committed artifact and source inventory match ' + stage, true);
}
function watch(context, actor) {
  context.on('page', page => {
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(30000);
    page.on('pageerror', error => report.errors.push({actor, message: redact(error.message)}));
    page.on('requestfailed', request => report.failedRequests.push({actor, url: redact(request.url()), error: request.failure()?.errorText}));
    page.on('console', message => {if (['error', 'warning'].includes(message.type())) report.console.push({actor, text: redact(message.text())});});
    page.on('response', response => {if (/\.(woff2?|otf|ttf)(?:\?|$)/i.test(response.url()))
      report.fonts.push({actor, url: response.url(), status: response.status()});});
  });
}
async function login(context, actor) {
  const reply = await context.request.post(origin + '/study/session', {data: {token: access.tokens[actor]}});
  assert.equal(reply.status(), 200, 'Synthetic fixture login failed; no response body retained');
  const identity = await (await context.request.get(origin + '/study/me')).json();
  assert.equal(identity.id, actor);
  return identity;
}
async function read(context, route) {
  const response = await context.request.get(origin + '/study/' + route);
  assert.equal(response.status(), 200, 'Canonical GET failed: ' + route);
  return response.json();
}
async function clickReceipt(page, name, route) {
  const pending = page.waitForResponse(response => new URL(response.url()).pathname === '/study/' + route
    && response.request().method() === 'POST');
  await page.getByRole('button', {name, exact: true}).click();
  const response = await pending;
  assert.equal(response.status(), 200, 'Canonical UI command failed: ' + route);
  return response.json();
}
async function shot(page, name, mobile = false) {
  if (mobile) await page.setViewportSize({width: 390, height: 844});
  await page.screenshot({path: path.join(out, name + '.png'), fullPage: true});
  report.screenshots.push({name: name + '.png', width: mobile ? 390 : 1440,
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)});
  if (mobile) await page.setViewportSize({width: 1440, height: 1000});
}
async function openEpisode(page, role) {
  await page.goto(origin + '/?edition=fluidi');
  await page.getByRole('button', {name: role === 'teacher' ? 'Prepara l’aula' : 'Apri il corso', exact: true}).click();
  await page.getByRole('button', {name: 'Apri episodio guidato', exact: true}).click();
  await page.getByRole('combobox', {name: 'Variante del percorso', exact: true}).waitFor();
  check(role + ' page identity and meaningful rendered UI', new URL(page.url()).origin === origin
    && /Ardesia/i.test(await page.title()) && (await page.locator('body').innerText()).length > 100);
  check(role + ' has no framework overlay', await page.locator('vite-error-overlay').count() === 0);
}
async function predict(ratio, boundary, procedure, expected) {
  check('result hidden before this prediction ' + receipts.length, await studentPage.getByTestId('episode-ratio').count() === 0);
  await studentPage.getByLabel('Rapporto previsto', {exact: true}).fill(ratio);
  await studentPage.getByRole('combobox', {name: 'Grandezza che resta fissata', exact: true}).selectOption(boundary);
  await studentPage.getByRole('textbox', {name: 'Spiega il vincolo e il procedimento', exact: true}).fill(procedure);
  const receipt = await clickReceipt(studentPage, 'Registra previsione e confronta', 'submissions');
  receipts.push(receipt);
  await studentPage.getByTestId('episode-ratio').waitFor();
  const evidence = receipt.activityEvidence;
  assert.equal(evidence.experienceId, expected.experience);
  assert.equal(evidence.stepId, expected.step);
  near(evidence.result.ratio, expected.ratio, 'Canonical result ratio');
  for (const [name, value] of Object.entries(expected.visual)) near(evidence.result.visual[name], value, 'Canonical visual ' + name);
  assert.deepEqual(evidence.lessonPassageRef, report.lessonRef);
  assert.equal(evidence.assistance, expected.assistance || 'NO_SUPPORT_REQUESTED');
  const visualText = await studentPage.getByTestId('flow-measures').innerText();
  for (const [label, value] of [['Q/Q₀', expected.visual.flowRatio], ['Δp/Δp₀', expected.visual.pressureRatio], ['v/v₀', expected.visual.meanSpeedRatio]]) {
    assert.ok(visualText.includes(label + ' = ' + value.toLocaleString('it-IT', {maximumFractionDigits: 4})), label + ' must match actual Core visual state');
  }
  check('prediction and visual use the exact Core receipt ' + evidence.experienceId + '/' + evidence.stepId, true);
  check('no autonomous mastery inferred ' + receipts.length,
    (await studentPage.locator('.episode-step').innerText()).includes('non attesta padronanza autonoma'));
  return receipt;
}
(async () => {
  verifyArtifact('before browser');
  browser = await chromium.launch({headless: true});
  const options = {viewport: {width: 1440, height: 1000}, locale: 'it-IT', reducedMotion: 'reduce', acceptDownloads: true};
  teacher = await browser.newContext(options); student = await browser.newContext(options);
  await teacher.addInitScript(() => {
    window.__audioQA = {calls: 0, streams: []};
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => {
      window.__audioQA.calls++;
      const audio = new AudioContext(); await audio.resume();
      const tone = audio.createOscillator(), gain = audio.createGain(), target = audio.createMediaStreamDestination();
      tone.frequency.value = 554.365; gain.gain.value = .04;
      tone.connect(gain).connect(target); tone.start();
      window.__audioQA.streams.push(target.stream); return target.stream;
    };
  });
  await login(teacher, 'tutor-synthetic'); await login(student, studentActor);
  watch(teacher, 'teacher'); watch(student, 'student');
  tutorPage = await teacher.newPage(); studentPage = await student.newPage();
  const health = await read(teacher, 'health');
  check('local synthetic API and persistent store are explicitly identified', health.synthetic === true && health.persistence === 'sqlite' && Boolean(health.dataId));
  report.localStore = {dataId: health.dataId, persistence: health.persistence};
  const previous = await read(student, 'workspace?editionId=fluidi');
  check('fresh student has no pre-existing episode result', previous.submissions.every(item => !item.activityEvidence));
  let publicationCount = 0;
  tutorPage.on('request', request => {if (new URL(request.url()).pathname === '/study/resources' && request.method() === 'POST') publicationCount++;});
  await openEpisode(tutorPage, 'teacher');
  const popup = tutorPage.waitForEvent('popup');
  await tutorPage.getByRole('button', {name: 'Apri la lavagna', exact: true}).click(); studio = await popup;
  await studio.getByText('Aula collegata', {exact: true}).waitFor();
  check('Studio shares only an ephemeral same-origin channel', new URL(studio.url()).origin === origin
    && new URL(studio.url()).pathname === '/studio/' && new URL(studio.url()).searchParams.size === 1);
  check('opening Studio does not start audio', await studio.evaluate(() => window.__audioQA.calls === 0));
  check('capture requires explicit teacher consent', await studio.getByRole('button', {name: 'Registra audio', exact: true}).isDisabled());
  const annotation = 'Q resta costante: isoliamo Δp nella legge di Poiseuille. ' + marker;
  await studio.getByLabel('Annotazione del docente', {exact: true}).fill(annotation);
  await studio.getByRole('button', {name: 'Annota passaggio', exact: true}).click();
  await studio.getByLabel('Solo il mio microfono docente', {exact: true}).check();
  await studio.getByRole('button', {name: 'Registra audio', exact: true}).click();
  await studio.getByText('Registrazione in corso', {exact: true}).waitFor();
  await studio.waitForTimeout(1000); // Physical media duration, never a mocked successful save.
  await studio.getByRole('button', {name: 'Termina registrazione', exact: true}).click();
  await studio.getByText('Audio salvato nella lezione.', {exact: true}).waitFor();
  check('native capture releases every track after a drained stop', await studio.evaluate(() => window.__audioQA.calls === 1
    && window.__audioQA.streams.every(stream => stream.getTracks().every(track => track.readyState === 'ended'))));
  check('recording and annotation have not published anything', publicationCount === 0);
  await studio.getByRole('button', {name: 'Invia passaggio all’Aula', exact: true}).click();
  await tutorPage.getByText('Passaggio ricevuto dalla lavagna. Scrivi la spiegazione e conferma la condivisione con il gruppo.', {exact: true}).waitFor();
  check('bridge proposal needs explicit transcript and publication', publicationCount === 0
    && await tutorPage.getByRole('button', {name: 'Condividi passaggio con il gruppo', exact: true}).isDisabled());
  const transcript = 'Prova sintetica R1. A Q fissata isola Δp = 8ηLQ/(πr⁴). Prima dichiara il vincolo, poi confronta separatamente raggio, viscosità e lunghezza. I rapporti sono senza unità; assumiamo moto laminare in entrambi i tubi.';
  await tutorPage.getByLabel('Trascrizione e spiegazione del passaggio', {exact: true}).fill(transcript);
  const resource = await clickReceipt(tutorPage, 'Condividi passaggio con il gruppo', 'resources');
  sources.push(resource);
  const source = JSON.parse(resource.text), descriptor = source.descriptor;
  report.lessonRef = {resourceId: resource.id, revisionId: resource.revisionId}; report.descriptor = descriptor;
  check('one explicit confirmation creates the exact group source', publicationCount === 1 && resource.kind === 'lesson-passage'
    && resource.visibility === 'group' && source.transcript === transcript && descriptor.objectRefs[0].label === annotation);
  await studio.goto(descriptor.replayUrl);
  await studio.getByRole('img', {name: 'Oggetto collegato evidenziato: ' + annotation, exact: true}).waitFor();
  await studio.getByRole('button', {name: "Ascolta registrazione dall'inizio", exact: true}).click();
  await studio.waitForFunction(() => {const audio = document.querySelector('audio'); return audio && audio.currentTime > .1;});
  check('teacher plays actual recorded bytes and sees the pinned object', true);
  await shot(studio, 'teacher-native-replay-1440');
  await studio.getByRole('link', {name: 'Torna alla lavagna', exact: true}).click();
  await studio.getByRole('link', {name: 'Materiali', exact: true}).click();
  const download = studio.waitForEvent('download');
  await studio.getByRole('button', {name: 'Esporta .lesson', exact: true}).click();
  const bundle = path.join(out, 'native-r1.lesson'); await (await download).saveAs(bundle);
  report.localBundle = {name: 'native-r1.lesson', bytes: fs.statSync(bundle).size, sha256: digest(fs.readFileSync(bundle))};

  await openEpisode(studentPage, 'student');
  assert.equal(await studentPage.getByRole('combobox', {name: 'Variante del percorso', exact: true}).inputValue(), 'poiseuille-boundary-v2');
  await studentPage.getByRole('combobox', {name: 'Passaggio della lezione collegato', exact: true}).selectOption(resource.id);
  const original = await read(student, 'resources/' + resource.id + '/revisions/' + resource.revisionId);
  check('independent student session resolves the exact authorized source', original.text === resource.text && original.revisionId === resource.revisionId);
  await shot(studentPage, 'student-a-before-390', true);
  const fixedPressure = await predict('16', 'pressure', marker + ': Δp resta fissata, r doppio porta Q a 2⁴ = 16.',
    {experience: 'poiseuille-boundary-v2', step: 'fixed-pressure', ratio: 16, visual: {flowRatio: 16, pressureRatio: 1, meanSpeedRatio: 4}});
  await studentPage.getByRole('button', {name: 'Cambia il vincolo', exact: true}).click();
  const wrongProcedure = marker + ': scambio il vincolo e penso che la pressione cresca con la quarta potenza del raggio.';
  const wrong = await predict('16', 'pressure', wrongProcedure,
    {experience: 'poiseuille-boundary-v2', step: 'fixed-flow', ratio: .0625, visual: {flowRatio: 1, pressureRatio: .0625, meanSpeedRatio: .25}});
  check('wrong constraint remains in its immutable receipt', !wrong.activityEvidence.check.constraintMatches && !wrong.activityEvidence.check.ratioMatches);
  const exactRead = studentPage.waitForResponse(response => new URL(response.url()).pathname === '/study/resources/' + resource.id + '/revisions/' + resource.revisionId);
  await studentPage.getByRole('button', {name: 'Recupera il passaggio della lezione', exact: true}).click();
  assert.equal((await exactRead).status(), 200);
  await studentPage.getByRole('heading', {name: 'Il passaggio del tutor', exact: true}).waitFor();
  assert.equal(await studentPage.getByRole('link', {name: 'Torna al passaggio nella lavagna', exact: true}).getAttribute('href'), descriptor.replayUrl);
  await shot(studentPage, 'student-exact-source-1440');
  const recoveryPopup = studentPage.waitForEvent('popup');
  await studentPage.getByRole('link', {name: 'Torna al passaggio nella lavagna', exact: true}).click();
  recovered = await recoveryPopup;
  await recovered.getByRole('alert').getByText('Registrazione non disponibile', {exact: true}).waitFor();
  check('independent browser does not silently acquire local media or another scene', await recovered.locator('audio').count() === 0);
  await shot(recovered, 'fresh-context-no-local-media-1440');
  await recovered.goto(origin + '/studio/?vista=lezioni-salvate#' + descriptor.lessonId);
  await recovered.getByLabel('Seleziona bundle .lesson', {exact: true}).setInputFiles(bundle);
  await recovered.getByRole('button', {name: 'Importa il bundle', exact: true}).click();
  await recovered.getByText(/^Import completato:/).waitFor();
  await recovered.goto(descriptor.replayUrl);
  await recovered.getByRole('img', {name: 'Oggetto collegato evidenziato: ' + annotation, exact: true}).waitFor();
  await recovered.getByRole('button', {name: "Ascolta registrazione dall'inizio", exact: true}).click();
  await recovered.waitForFunction(() => {const audio = document.querySelector('audio'); return audio && audio.currentTime > .1;});
  check('explicit native bundle import restores the same pinned audio and object', true);
  await shot(recovered, 'fresh-context-imported-replay-390', true); await recovered.close();
  await studentPage.getByRole('button', {name: 'Correggi con il risultato visto', exact: true}).click();
  const assisted = await predict('0,0625', 'flow', marker + ': correzione con fonte vista: a Q fissata Δp è inversa a r⁴, quindi r doppio richiede 1/16.',
    {experience: 'poiseuille-boundary-v2', step: 'fixed-flow', ratio: .0625,
      visual: {flowRatio: 1, pressureRatio: .0625, meanSpeedRatio: .25}, assistance: 'SUPPORT_REQUESTED'});
  check('correction retains original parent and actual requested aids', assisted.parentId === wrong.submissionId
    && assisted.activityEvidence.supportUsed.includes('lesson-passage') && assisted.activityEvidence.supportUsed.includes('model-result'));
  await studentPage.getByRole('button', {name: 'Affronta il problema diverso', exact: true}).click();
  const transferA = await predict('4', 'flow', marker + ': Q e r restano uguali; η/η₀ = 2 e L/L₀ = 2, quindi Δp/Δp₀ = 2 × 2 = 4.',
    {experience: 'poiseuille-boundary-v2', step: 'transfer', ratio: 4, visual: {flowRatio: 1, pressureRatio: 4, meanSpeedRatio: 1}});
  assert.deepEqual(transferA.courseContext.parameters, {radiusRatio: 1, viscosity: 2, length: 2, boundary: 'flow'});
  check('new transfer A composes viscosity and length while transport stays constant', true);
  await shot(studentPage, 'student-a-transfer-1440'); await shot(studentPage, 'student-a-transfer-390', true);
  await studentPage.getByRole('combobox', {name: 'Variante del percorso', exact: true}).selectOption('poiseuille-nearby-v2');
  await studentPage.getByRole('combobox', {name: 'Passaggio della lezione collegato', exact: true}).selectOption(resource.id);
  await predict('2,0736', 'pressure', marker + ': a Δp fissata il fattore sul raggio è 1,2⁴ = 2,0736.',
    {experience: 'poiseuille-nearby-v2', step: 'fixed-pressure', ratio: 2.0736, visual: {flowRatio: 2.0736, pressureRatio: 1, meanSpeedRatio: 1.44}});
  await studentPage.getByRole('button', {name: 'Cambia il vincolo', exact: true}).click();
  await predict('0,4096', 'flow', marker + ': a Q fissata isolo Δp e ottengo 1/1,25⁴ = 0,4096.',
    {experience: 'poiseuille-nearby-v2', step: 'fixed-flow', ratio: .4096, visual: {flowRatio: 1, pressureRatio: .4096, meanSpeedRatio: .64}});
  await studentPage.getByRole('button', {name: 'Affronta il problema diverso', exact: true}).click();
  const transferB = await predict('1', 'pressure', marker + ': a Δp e r fissi, η doppia e L dimezzata danno prodotto1; Q/Q₀ = 1.',
    {experience: 'poiseuille-nearby-v2', step: 'transfer', ratio: 1, visual: {flowRatio: 1, pressureRatio: 1, meanSpeedRatio: 1}});
  assert.deepEqual(transferB.courseContext.parameters, {radiusRatio: 1, viscosity: 2, length: .5, boundary: 'pressure'});
  check('new transfer B proves compensation rather than copying radius substitution', true);
  await shot(studentPage, 'student-b-compensation-1440'); await shot(studentPage, 'student-b-compensation-390', true);

  await tutorPage.getByRole('button', {name: 'Da correggere', exact: true}).click();
  const candidates = tutorPage.getByRole('complementary', {name: 'Consegne del gruppo'}).getByRole('button');
  await candidates.first().waitFor(); let selected = false;
  for (let i = 0; i < await candidates.count(); i++) {
    await candidates.nth(i).click();
    if ((await tutorPage.locator('.submission-answer').innerText()).includes(wrongProcedure)) {selected = true; break;}
  }
  check('teacher selects the exact wrong fixed-Q procedure', selected);
  await tutorPage.getByRole('heading', {name: 'Previsione prima del risultato', exact: true}).waitFor();
  await clickReceipt(tutorPage, 'Inizia la correzione', 'feedback/drafts');
  const teacherExplanation = 'Q resta fissata. Isolando Δp, r doppio richiede Δp/Δp₀ = 1/16. Il testo della previsione aveva scambiato il vincolo.';
  await tutorPage.getByLabel('Spiegazione del tutor', {exact: true}).fill(teacherExplanation);
  const reviewed = await clickReceipt(tutorPage, 'Restituisci la correzione', 'feedback/' +
    (await read(teacher, 'workspace?editionId=fluidi')).submissions.find(item => item.id === wrong.submissionId).feedback[0].id + '/publish');
  diaryCommands.push({kind: 'feedback-publish', value: reviewed});
  await tutorPage.getByText(/Intervento del tutor restituito sulla versione/).waitFor();
  await tutorPage.getByText('Collega un passaggio al diario', {exact: true}).click();
  const originalInput = tutorPage.getByRole('textbox', {name: 'Originale della fonte', exact: true});
  await originalInput.focus(); await originalInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  const selectedQuote = await originalInput.inputValue();
  check('diary observation quotes the actual delivered original', selectedQuote.includes(wrongProcedure));
  await tutorPage.getByRole('combobox', {name: 'Concetto', exact: true}).selectOption('model-selection');
  const thread = await clickReceipt(tutorPage, 'Proponi il passaggio', 'diary/observations');
  assert.equal(thread.status, 'CANDIDATE');
  assert.equal(thread.source.quote, selectedQuote);
  const delivered = (await read(teacher, 'workspace?editionId=fluidi')).submissions.find(item => item.id === wrong.submissionId);
  assert.deepEqual({resourceId: thread.source.resourceId, revisionId: thread.source.revisionId}, delivered.source_refs[0]);
  diaryCommands.push({kind: 'observation', value: thread}); report.diaryThreadId = thread.threadId;
  await tutorPage.getByRole('button', {name: 'Apri il diario per il prossimo passo', exact: true}).click();
  await tutorPage.getByText('Verifica e prepara il prossimo passo', {exact: true}).click();
  const criterion = 'Isola Δp mantenendo Q costante e giustifica la quarta potenza del raggio.';
  await tutorPage.getByLabel('Spiegazione del tutor', {exact: true}).fill('La previsione scambiava il vincolo pressione con il vincolo portata.');
  await tutorPage.getByLabel('Criterio della rubrica', {exact: true}).fill(criterion);
  await tutorPage.getByLabel('Prossimo passo', {exact: true}).fill('Affronta il caso con raggio dimezzato a Q fissata.');
  await tutorPage.getByLabel('Nuovo problema', {exact: true}).fill('Il raggio si dimezza e Q resta costante. Prevedi e giustifica Δp/Δp₀.');
  await tutorPage.getByLabel('Rapporto originale r/r₀', {exact: true}).fill('2');
  await tutorPage.getByLabel('Nuovo rapporto r/r₀', {exact: true}).fill('0.5');
  await tutorPage.getByRole('combobox', {name: 'Grandezza fissata nel confronto', exact: true}).selectOption('flow');
  const confirmed = await clickReceipt(tutorPage, 'Conferma osservazione e assegna la nuova prova', 'diary/threads/' + thread.threadId + '/confirm');
  assert.equal(confirmed.status, 'OPEN'); diaryCommands.push({kind: 'confirm', value: confirmed});
  await shot(tutorPage, 'teacher-diary-confirmed-1440');
  await studentPage.getByRole('button', {name: 'Il mio lavoro', exact: true}).click();
  await studentPage.getByText('Affronta una situazione nuova', {exact: true}).click();
  const newProcedure = marker + ': a Q costante isolo Δp = 8ηLQ/(πr⁴). Dimezzando r, il rapporto Δp/Δp₀ è 16. Assumo valide le condizioni del modello in entrambi i tubi.';
  await studentPage.getByLabel('Spiega il tuo procedimento', {exact: true}).fill(newProcedure);
  await studentPage.getByRole('button', {name: 'Consegna la nuova prova', exact: true}).click();
  await studentPage.getByText('In pratica', {exact: true}).waitFor();
  const practising = await read(student, 'diary/threads/' + thread.threadId);
  assert.equal(practising.status, 'PRACTISING');
  check('student submission cannot verify its own diary', !practising.latestVerification);
  await shot(studentPage, 'student-diary-practising-390', true);
  await tutorPage.getByRole('button', {name: 'Diario degli errori', exact: true}).click();
  await tutorPage.getByText('Rivedi la nuova prova', {exact: true}).click();
  await tutorPage.getByLabel('Passaggio del procedimento verificato', {exact: true}).fill(newProcedure);
  await tutorPage.getByLabel('Motivazione della verifica', {exact: true}).fill('Il procedimento esplicita Q fissata, isola Δp e giustifica il rapporto16. Questa è una verifica umana del solo tentativo indicato.');
  await tutorPage.getByLabel('Che cosa rende diversa questa prova', {exact: true}).fill('Il raggio viene dimezzato anziché raddoppiato.');
  const verified = await clickReceipt(tutorPage, 'Registra la verifica del tutor', 'diary/threads/' + thread.threadId + '/verify');
  diaryCommands.push({kind: 'verify', value: verified}); assert.equal(verified.status, 'VERIFIED_RESOLVED');
  await tutorPage.getByRole('button', {name: 'Verificati', exact: true}).click();
  await tutorPage.getByText('Verificato su una nuova prova', {exact: true}).last().waitFor();
  const current = await read(student, 'diary/threads/' + thread.threadId);
  assert.equal(current.status, 'VERIFIED_RESOLVED'); assert.deepEqual(current.source, verified.source);
  check('human tutor command alone verifies the exact canonical new procedure', Boolean(current.latestVerification));
  await shot(tutorPage, 'teacher-human-verification-1440');
  check('every A/B receipt preserves the exact shared lesson revision', receipts.every(item =>
    item.activityEvidence.lessonPassageRef.resourceId === resource.id && item.activityEvidence.lessonPassageRef.revisionId === resource.revisionId));
  check('all screenshots fit the viewport', report.screenshots.every(item => !item.overflow));
  check('no runtime page errors', report.errors.length === 0);
  check('no failed network requests', report.failedRequests.length === 0);
  check('no console errors or warnings', report.console.length === 0);
  check('observed font requests are successful and local', report.fonts.length > 0
    && report.fonts.every(item => new URL(item.url).origin === origin && item.status === 200));
  verifyArtifact('after browser'); report.passed = true;
})().catch(async error => {
  report.passed = false; report.exception = redact(error.stack || error);
  for (const [name, page] of [['web-teacher', tutorPage], ['web-student', studentPage], ['studio', studio], ['recovery', recovered]]) {
    if (!page || page.isClosed()) continue;
    try {fs.writeFileSync(path.join(out, 'failure-' + name + '-dom.txt'), redact(await page.locator('body').innerText()), {mode: 0o600});
      await page.screenshot({path: path.join(out, 'failure-' + name + '.png'), fullPage: true});} catch {}
  }
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  write('receipts.json', receipts); write('sources.json', sources); write('diary-commands.json', diaryCommands); write('result.json', report);
  for (const name of fs.readdirSync(out)) if (fs.statSync(path.join(out, name)).isFile()) fs.chmodSync(path.join(out, name), 0o600);
  console.log(JSON.stringify({out, passed: report.passed, checks: report.checks.length, exception: report.exception}));
});
