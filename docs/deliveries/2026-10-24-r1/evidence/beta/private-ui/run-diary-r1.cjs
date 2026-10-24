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
  verifyArtifact('before review continuation');
  const priorFolder = process.env.ARDESIA_PRIOR_UI_EVIDENCE;
  assert.ok(priorFolder, 'Exact partial A/B evidence required');
  const priorReport = JSON.parse(fs.readFileSync(path.join(priorFolder, 'result.json')));
  assert.equal(priorReport.expectedSha, expectedSha);
  assert.equal(priorReport.studentActor, studentActor);
  assert.equal(priorReport.checks.filter(item => !item.pass).length, 1);
  assert.ok(priorReport.exception.includes('teacher selects the exact wrong fixed-Q procedure'));
  report.continuationOf = {directory: path.basename(priorFolder),
    resultSha256: digest(fs.readFileSync(path.join(priorFolder, 'result.json'))),
    receiptsSha256: digest(fs.readFileSync(path.join(priorFolder, 'receipts.json'))),
    reason: 'Teacher workspace loaded before student submissions; ordinary fresh page required. A/B are not rerun or recounted.'};
  receipts.push(...JSON.parse(fs.readFileSync(path.join(priorFolder, 'receipts.json'))));
  sources.push(...JSON.parse(fs.readFileSync(path.join(priorFolder, 'sources.json'))));
  assert.equal(receipts.length, 7);
  assert.equal(sources.length, 1);
  const resource = sources[0];
  const descriptor = JSON.parse(resource.text).descriptor;
  report.lessonRef = {resourceId: resource.id, revisionId: resource.revisionId};
  report.descriptor = descriptor;
  browser = await chromium.launch({headless: true});
  const options = {viewport: {width: 1440, height: 1000}, locale: 'it-IT', reducedMotion: 'reduce'};
  teacher = await browser.newContext(options); student = await browser.newContext(options);
  await login(teacher, 'tutor-synthetic'); await login(student, studentActor);
  watch(teacher, 'teacher'); watch(student, 'student');
  tutorPage = await teacher.newPage(); studentPage = await student.newPage();
  const health = await read(teacher, 'health');
  assert.equal(health.dataId, priorReport.localStore.dataId);
  report.localStore = priorReport.localStore;
  for (const receipt of receipts) assert.deepEqual(await read(student, 'receipts/' + receipt.receiptId), receipt);
  assert.deepEqual(await read(student, 'resources/' + resource.id + '/revisions/' + resource.revisionId), resource);
  check('fresh contexts read the same immutable A/B receipts and original source', true);
  const wrong = receipts.find(item => item.activityEvidence.experienceId === 'poiseuille-boundary-v2'
    && item.activityEvidence.stepId === 'fixed-flow' && !item.activityEvidence.check.constraintMatches);
  assert.ok(wrong);
  const deliveredBeforeReview = (await read(teacher, 'workspace?editionId=fluidi')).submissions.find(item => item.id === wrong.submissionId);
  const wrongProcedure = deliveredBeforeReview.text.split('Procedimento: ')[1];
  assert.ok(wrongProcedure && wrongProcedure.length > 20);
  await tutorPage.goto(origin + '/?edition=fluidi');
  await studentPage.goto(origin + '/?edition=fluidi');
  const reviewFolder = process.env.ARDESIA_REVIEW_UI_EVIDENCE;
  assert.ok(reviewFolder, 'Exact review continuation evidence required');
  const reviewedPartial = JSON.parse(fs.readFileSync(path.join(reviewFolder, 'result.json')));
  assert.equal(reviewedPartial.expectedSha, expectedSha);
  report.reviewContinuationOf = {directory: path.basename(reviewFolder), resultSha256: digest(fs.readFileSync(path.join(reviewFolder, 'result.json'))),
    reason: 'Observation was saved; harness compared an additional contextId field. Resume existing canonical thread, no duplicated publication.'};
  const originalRef = deliveredBeforeReview.source_refs[0];
  const diary = await read(teacher, 'diary?editionId=fluidi');
  const thread = diary.threads.find(item => item.studentId === studentActor && item.status === 'CANDIDATE'
    && item.source?.resourceId === originalRef.resourceId && item.source?.revisionId === originalRef.revisionId);
  assert.ok(thread, 'Exact persisted observation required');
  assert.equal(thread.source.quote, deliveredBeforeReview.text);
  assert.equal(deliveredBeforeReview.feedback[0].review.decision, 'returned');
  check('existing tutor feedback and diary quote pin the delivered original exactly', true);
  diaryCommands.push({kind: 'existing-observation', value: thread});
  report.diaryThreadId = thread.threadId;
  await tutorPage.getByRole('button', {name: 'Diario degli errori', exact: true}).click();
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
  await tutorPage.reload(); // Pull the new practice submitted in the independent student context.
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
  check('observed font requests are successful and local', report.fonts.every(item => new URL(item.url).origin === origin && item.status === 200));
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
