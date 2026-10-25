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
let offlineFaultActive = false;
function watch(context, actor) {
  context.on('page', page => {
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(30000);
    page.on('pageerror', error => report.errors.push({actor, message: redact(error.message)}));
    page.on('requestfailed', request => report.failedRequests.push({actor, expectedOffline: offlineFaultActive, url: redact(request.url()), error: request.failure()?.errorText}));
    page.on('console', message => {if (['error', 'warning'].includes(message.type())) report.console.push({actor, expectedOffline: offlineFaultActive, text: redact(message.text())});});
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
  report.capture = 'NOT_RUN in this delta; prior c762 native audio evidence remains separate.';
  report.scope = 'Refresh, keyboard focus and real offline/retry using one existing canonical receipt; no new submission.';
  verifyArtifact('before final focus delta');
  const manifest = JSON.parse(fs.readFileSync(candidatePath));
  assert.equal(manifest.source.commit, expectedSha);
  assert.notEqual(expectedSha, '706316f0582f88366cd3cad6c5c1227537a6c419', 'New focus commit required');
  for (const [name, sha] of Object.entries(manifest.assetsSha256))
    assert.equal(digest(fs.readFileSync(path.join(path.dirname(candidatePath), name))), sha);
  report.artifact = {commit: expectedSha, manifestSha256: digest(fs.readFileSync(candidatePath)), sourceTreeSha256: manifest.source.sourceTreeSha256};
  report.provenanceScope = 'New focus commit and immutable served assets; prior A/B and refresh RED remain attributed to their original commits.';
  const priorFolder = process.env.ARDESIA_REFRESH_UI_EVIDENCE;
  const prior = JSON.parse(fs.readFileSync(path.join(priorFolder, 'result.json')));
  const receipt = JSON.parse(fs.readFileSync(path.join(priorFolder, 'new-receipt.json')))[0];
  assert.ok(receipt);
  report.continuationOf = {directory: path.basename(priorFolder), sha256: digest(fs.readFileSync(path.join(priorFolder, 'result.json')))};
  receipts.push(receipt);
  browser = await chromium.launch({headless: true});
  const options = {viewport: {width: 1440, height: 1000}, locale: 'it-IT', reducedMotion: 'reduce'};
  teacher = await browser.newContext(options); student = await browser.newContext(options);
  await login(teacher, 'tutor-synthetic'); await login(student, studentActor);
  watch(teacher, 'teacher'); watch(student, 'student');
  tutorPage = await teacher.newPage();
  assert.deepEqual(await read(student, 'receipts/' + receipt.receiptId), receipt);
  const delivered = (await read(teacher, 'workspace?editionId=fluidi')).submissions.find(item => item.id === receipt.submissionId);
  assert.ok(delivered);
  await tutorPage.goto(origin + '/?edition=fluidi&view=review');
  await tutorPage.getByRole('button', {name: 'Aggiorna consegne', exact: true}).waitFor();
  const moduleUrl = await tutorPage.locator('script[type="module"][src]').first().getAttribute('src');
  const webAssetKey = 'beta/web/' + new URL(moduleUrl, origin).pathname.replace(/^\//, '');
  const moduleResponse = await teacher.request.get(new URL(moduleUrl, origin).href);
  assert.equal(digest(await moduleResponse.body()), manifest.assetsSha256[webAssetKey]);
  check('actual served Web module matches the new immutable artifact', true);
  const allFilter = tutorPage.getByRole('navigation', {name: 'Filtra le consegne'}).getByRole('button', {name: /^Tutte le consegne/});
  await allFilter.click();
  const queue = tutorPage.getByRole('complementary', {name: 'Consegne del gruppo'}).getByRole('button');
  await queue.first().waitFor(); let found = false;
  for (let i = 0; i < await queue.count(); i++) {
    await queue.nth(i).click();
    if ((await tutorPage.locator('.submission-answer').innerText()) === delivered.text) {found = true; break;}
  }
  assert.ok(found); const countBefore = await queue.count();
  const refresh = tutorPage.getByRole('button', {name: 'Aggiorna consegne', exact: true});
  const pending = tutorPage.waitForResponse(response => new URL(response.url()).pathname === '/study/workspace' && response.request().method() === 'GET');
  await refresh.focus(); await refresh.press('Enter'); await pending; await refresh.waitFor();
  report.activeElementAfterRefresh = await tutorPage.evaluate(() => ({tag: document.activeElement.tagName,
    text: document.activeElement.tagName === 'BODY' ? '' : document.activeElement.textContent?.slice(0,120)}));
  report.keyboardFocusPreserved = await refresh.evaluate(element => element === document.activeElement);
  assert.equal(await tutorPage.locator('.submission-answer').innerText(), delivered.text);
  offlineFaultActive = true;
  await teacher.setOffline(true); await refresh.click();
  await tutorPage.getByRole('alert').first().waitFor();
  assert.equal(await tutorPage.locator('.submission-answer').innerText(), delivered.text);
  assert.equal(await allFilter.getAttribute('aria-pressed'), 'true');
  check('real offline refresh exposes an error without losing selected original or filter', true);
  await shot(tutorPage, 'offline-original-retained-1440');
  await teacher.setOffline(false);
  const [retry] = await Promise.all([
    tutorPage.waitForResponse(response => new URL(response.url()).pathname === '/study/workspace' && response.request().method() === 'GET'),
    tutorPage.getByRole('button', {name: 'Riprova', exact: true}).last().click(),
  ]);
  assert.equal(retry.status(), 200);
  await refresh.waitFor(); await tutorPage.getByRole('alert').first().waitFor({state:'hidden'});
  offlineFaultActive = false;
  assert.equal(await tutorPage.locator('.submission-answer').innerText(), delivered.text);
  assert.equal(await queue.count(), countBefore);
  check('retry reads canonical data and retains the same selection without extra submission', true);
  await shot(tutorPage, 'retry-original-retained-390', true);
  assert.deepEqual(await read(student, 'receipts/' + receipt.receiptId), receipt);
  check('no page errors or unexpected network/console failures', report.errors.length === 0
    && report.failedRequests.every(item => item.expectedOffline && new URL(item.url).pathname === '/study/workspace' && /INTERNET_DISCONNECTED/.test(item.error || ''))
    && report.console.every(item => item.expectedOffline && /INTERNET_DISCONNECTED/.test(item.text)));
  verifyArtifact('after final focus delta');
  report.offlineRetryPassed = true;
  report.passed = report.keyboardFocusPreserved;
  report.status = report.passed ? 'PASS' : 'KNOWN_FOCUS_FAILURE_OFFLINE_RETRY_PASS';
  if (!report.passed) process.exitCode = 1;
})().catch(async error => {
  report.passed = false; report.exception = redact(error.stack || error);
  if (tutorPage && !tutorPage.isClosed()) {
    fs.writeFileSync(path.join(out, 'failure-teacher-dom.txt'), redact(await tutorPage.locator('body').innerText()), {mode:0o600});
    await tutorPage.screenshot({path:path.join(out,'failure-teacher.png'),fullPage:true});
  }
  process.exitCode = 1;
}).finally(async () => {
  write('new-receipt.json', receipts); write('result.json', report);
  if (browser) await browser.close();
  for (const name of fs.readdirSync(out)) if (fs.statSync(path.join(out,name)).isFile()) fs.chmodSync(path.join(out,name),0o600);
  console.log(JSON.stringify({out,passed:report.passed,offlineRetryPassed:report.offlineRetryPassed,focus:report.activeElementAfterRefresh,exception:report.exception}));
});
