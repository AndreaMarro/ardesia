import { chromium, expect } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(process.env.ARDESIA_COURSE_CONTEXT_EVIDENCE || 'work/course-context-proof');
const state = resolve(process.env.ARDESIA_COURSE_CONTEXT_STATE || 'work/course-context-state');
const port = Number(process.env.ARDESIA_COURSE_CONTEXT_PORT || 5491);
const origin = `http://127.0.0.1:${port}`;
const paths = ['apps/web/src/features/Classroom.tsx', 'apps/web/src/features/PublicCoursePlayer.tsx',
  'apps/web/src/features/Work.tsx', 'apps/studio/src/study/SubmissionPanel.tsx',
  'packages/engine/lessonos/study/course_lesson_context.py', 'packages/engine/lessonos/study/submissions.py',
  'services/study-api/study_api/app.py'];
const hashes = () => Object.fromEntries(paths.map(path => [path, createHash('sha256').update(readFileSync(resolve(repo, path))).digest('hex')]));
const source = {commit: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim(), files: hashes()};
mkdirSync(output, {recursive: true});
const checks = [], errors = [], external = [], timings = {};
let server, browser;
const pass = (name, details) => { checks.push({name, details}); console.log('PASS', name); };
async function start() {
  const log = createWriteStream(resolve(output, 'server.log'), {flags: 'a'});
  server = spawn(process.env.ARDESIA_STUDY_PYTHON || resolve(repo, 'services/study-api/.venv/bin/python'),
    ['-m', 'uvicorn', 'course_context_fixture:app', '--host', '127.0.0.1', '--port', String(port)],
    {cwd: repo, env: {...process.env, PYTHONPATH: 'packages/engine:services/study-api:bin/qa',
      ARDESIA_COURSE_CONTEXT_STATE: state, ARDESIA_COURSE_CONTEXT_FRONTEND: resolve(repo, 'apps/web/dist')},
    stdio: ['ignore', 'pipe', 'pipe']});
  server.stdout.pipe(log); server.stderr.pipe(log);
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(origin + '/study/me')).status === 401) return; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('owned_server_not_ready');
}
async function stop() {
  if (!server) return;
  const owned = server; server = null;
  if (owned.exitCode !== null) return;
  const closed = new Promise(r => owned.once('exit', r)); owned.kill('SIGTERM'); await closed;
}
try {
  await start();
  const identities = JSON.parse(readFileSync(resolve(state, 'identity.json'), 'utf8'));
  browser = await chromium.launch({headless: true});
  const student = await browser.newContext({viewport: {width: 1440, height: 1100}, reducedMotion: 'reduce'});
  const teacher = await browser.newContext();
  const peer = await browser.newContext();
  for (const [context, name] of [[student, 'student'], [teacher, 'teacher'], [peer, 'peer']])
    expect((await context.request.post(origin + '/study/session', {data: {token: identities[name].token}})).status()).toBe(200);
  const course = (await (await student.request.get(origin + '/study/course-learning?editionId=mechanics')).json()).course;
  const lesson = course.lessons.find(l => l.activityId === 'kinematics-v1');
  expect(lesson).toBeTruthy();
  const page = await student.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {if (/^https?:/.test(request.url()) && !request.url().startsWith(origin)) external.push(request.url());});
  const opened = performance.now();
  await page.goto(origin + '/?view=classroom&edition=mechanics');
  await page.getByRole('button', {name: new RegExp(lesson.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))}).click();
  await expect(page.locator('#course-lesson-title')).toHaveText(lesson.title);
  timings.lessonOpenMs = performance.now() - opened;
  await page.getByLabel('La tua previsione numerica').fill(String(lesson.practice.answer.value));
  await page.getByRole('button', {name: 'Confronta la previsione', exact: true}).click();
  await page.getByLabel('La tua spiegazione', {exact: true}).fill('Prima prova: distinguo posizione, spostamento e velocità usando il tempo dichiarato.');
  let lostReceipt, firstPayload, firstKey;
  await page.route('**/study/submissions', async route => {
    firstPayload = route.request().postDataJSON(); firstKey = route.request().headers()['idempotency-key'];
    const response = await route.fetch(); expect(response.status()).toBe(200); lostReceipt = await response.json();
    await route.abort('failed'); await page.unroute('**/study/submissions');
  });
  await page.getByRole('button', {name: 'Consegna', exact: true}).click();
  await expect(page.getByText(/Richiesta già inviata/)).toBeVisible();
  const replay = page.waitForResponse(r => r.url().endsWith('/study/submissions') && r.request().method() === 'POST');
  await page.getByRole('button', {name: 'Consegna', exact: true}).click();
  const retryResponse = await replay;
  expect(retryResponse.request().postDataJSON()).toEqual(firstPayload);
  expect(retryResponse.request().headers()['idempotency-key']).toBe(firstKey);
  expect(await retryResponse.json()).toEqual(lostReceipt);
  expect(lostReceipt.courseContext.lessonRef).toEqual(lesson.lessonRef);
  expect(lostReceipt.courseContext.phase).toBe('practice');
  pass('lost response retries original exact lesson and immutable command', {receiptId: lostReceipt.receiptId, lessonRef: lesson.lessonRef});
  await expect(page.getByTestId('submission-status')).toContainText('Consegnato');
  await page.getByRole('button', {name: 'Un problema diverso', exact: true}).click();
  await page.getByLabel('La tua previsione numerica').fill(String(lesson.transfer.answer.value));
  await page.getByRole('button', {name: 'Confronta la previsione', exact: true}).click();
  const transferText = 'Seconda situazione: esplicito x(t), le unità e la differenza rispetto alla prima prova.';
  await page.getByLabel('La tua spiegazione', {exact: true}).fill(transferText);
  const transferSent = page.waitForResponse(r => r.url().endsWith('/study/submissions') && r.request().method() === 'POST');
  await page.getByRole('button', {name: 'Consegna', exact: true}).click();
  const transferResponse = await transferSent; expect(transferResponse.status()).toBe(200);
  const transferReceipt = await transferResponse.json();
  expect(transferReceipt.courseContext.lessonRef).toEqual(lesson.lessonRef);
  expect(transferReceipt.courseContext.phase).toBe('transfer');
  expect(transferReceipt.courseContext.parameters).toEqual(lesson.transfer.parameters);
  pass('practice and transfer stay distinct in the actual receipt', transferReceipt.receiptId);
  const tutor = await teacher.newPage();
  await tutor.goto(origin + '/?view=review&edition=mechanics');
  await tutor.locator('.submission-list button').last().click();
  await expect(tutor.locator('.review-columns')).toContainText(transferText);
  await tutor.getByRole('button', {name: 'Inizia la correzione', exact: true}).click();
  const feedback = 'Mantieni esplicita la coordinata iniziale; riprova sulla stessa situazione di trasferimento.';
  await tutor.getByLabel('Spiegazione del tutor', {exact: true}).fill(feedback);
  await tutor.getByRole('button', {name: 'Restituisci la correzione', exact: true}).click();
  await expect(tutor.getByText('Correzione restituita allo studente.', {exact: true})).toBeVisible();
  await page.goto(origin + '/?view=work&edition=mechanics');
  await page.getByRole('button', {name: 'Consegne e feedback', exact: true}).click();
  const delivery = page.locator('.delivery-row').filter({hasText: transferText});
  await expect(delivery.getByText(feedback, {exact: true})).toBeVisible();
  pass('teacher feedback returns through actual Review and student Work', true);
  await delivery.getByRole('button', {name: 'Prepara un nuovo tentativo', exact: true}).click();
  await expect(page.locator('#course-lesson-title')).toHaveText(lesson.title);
  await expect(page.locator('.course-situation')).toHaveText(lesson.transfer.prompt);
  await page.getByLabel('La tua previsione numerica').fill(String(lesson.transfer.answer.value));
  await page.getByRole('button', {name: 'Confronta la previsione', exact: true}).click();
  await page.getByLabel('La tua spiegazione', {exact: true}).fill('Revisione: separo la coordinata iniziale dallo spostamento nel tempo assegnato.');
  const correctedSent = page.waitForResponse(r => r.url().endsWith('/study/submissions') && r.request().method() === 'POST');
  await page.getByRole('button', {name: 'Consegna', exact: true}).click();
  const correctedResponse = await correctedSent; expect(correctedResponse.status()).toBe(200);
  const corrected = await correctedResponse.json();
  expect(corrected.parentId).toBe(transferReceipt.submissionId);
  expect(corrected.revision).toBe(2);
  expect(corrected.courseContext.lessonRef).toEqual(lesson.lessonRef);
  expect(corrected.courseContext.phase).toBe('transfer');
  pass('non-entry lesson retry restores exact transfer and parent revision', corrected.receiptId);
  // Acknowledgement precedes the workspace refresh; wait for the form's
  // existing busy boundary before checking the remounted lesson layout.
  await expect(page.getByLabel('La tua spiegazione', {exact: true})).toBeEnabled();
  await expect(page.locator('#course-lesson-title')).toHaveText(lesson.title);
  for (const width of [1440, 820, 390, 360]) {
    await page.setViewportSize({width, height: 1100});
    await page.locator('#course-lesson-title').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({path: resolve(output, `course-context-${width}.png`), fullPage: true});
    pass('responsive exact lesson ' + width, {overflow: false});
  }
  const restart = performance.now(); await stop(); await start();
  const cold = await browser.newContext();
  expect((await cold.request.post(origin + '/study/session', {data: {token: identities.student.token}})).status()).toBe(200);
  for (const receipt of [lostReceipt, transferReceipt, corrected])
    expect(await (await cold.request.get(origin + '/study/receipts/' + receipt.receiptId)).json()).toEqual(receipt);
  const reopened = await cold.newPage(); await reopened.goto(origin + '/?view=work&edition=mechanics');
  await reopened.getByRole('button', {name: 'Consegne e feedback', exact: true}).click();
  await expect(reopened.getByText(feedback, {exact: true})).toBeVisible();
  timings.coldServerAndBrowserReopenMs = performance.now() - restart;
  expect((await peer.request.get(origin + '/study/receipts/' + corrected.receiptId)).status()).toBe(403);
  pass('real server restart, fresh browser, durable feedback and peer denial', {receipts: 3, peer: 403});
  expect(errors).toEqual([]); expect(external).toEqual([]); expect(hashes()).toEqual(source.files);
  pass('no page errors, external requests or product edits during proof', true);
  writeFileSync(resolve(output, 'result.json'), JSON.stringify({status: 'PASS', source, browser: browser.version(), checks, timings, errors, external}, null, 2));
} catch (error) {
  writeFileSync(resolve(output, 'result.json'), JSON.stringify({status: 'FAIL', source, browser: browser?.version(), checks, timings, errors, external, error: String(error)}, null, 2));
  throw error;
} finally { await browser?.close(); await stop(); }
