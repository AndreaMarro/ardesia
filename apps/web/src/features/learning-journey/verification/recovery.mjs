import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const origin = process.env.S20_ORIGIN;
const access = JSON.parse(await fs.readFile(path.join(process.env.S20_PRIVATE_DIR, 'access.json'), 'utf8'));
const out = process.env.S20_EVIDENCE_DIR; await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch(); const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const checks = [], errors = []; let a = await context.newPage();
const check = name => { checks.push({ name, status: 'PASS' }); console.log('PASS', name); };
const login = async (ctx, token) => assert.equal((await ctx.request.post(origin + '/study/session', { data: { token } })).status(), 200);
const ws = async () => (await context.request.get(origin + '/study/workspace?editionId=fluidi')).json();
const navigate = async p => { await p.goto(origin + '/?view=classroom&edition=fluidi'); await p.getByTestId('learning-journey').waitFor(); };
const saved = p => p.getByText('Salvato nel tuo spazio', { exact: true }).waitFor();
try {
  a.on('pageerror', e => errors.push(e.message)); await login(context, access.student); await navigate(a);
  let lost = false, deniedRead = false;
  await a.route('**/study/resources', async route => {
    if (lost) return route.continue();
    const r = await route.fetch(); assert.equal(r.status(), 200); lost = true; await route.abort('failed');
  });
  await a.route('**/study/workspace?editionId=fluidi', async route => {
    if (lost && !deniedRead) { deniedRead = true; return route.abort('failed'); }
    return route.continue();
  });
  await a.getByRole('textbox', { name: 'Rapporto previsto', exact: true }).fill('16');
  await a.getByRole('button', { name: 'Salva e riprendi', exact: true }).click();
  await a.getByText(/Salvataggio non confermato/).waitFor();
  await a.getByRole('textbox', { name: 'Rapporto previsto', exact: true }).fill('8');
  await a.getByRole('button', { name: 'Salva e riprendi', exact: true }).click(); await saved(a);
  let workspace = await ws();
  assert.equal(workspace.resources.filter(item => item.kind === 'learning-journey-checkpoint').length, 1);
  assert.equal(JSON.parse(workspace.resources.find(item => item.kind === 'learning-journey-checkpoint').text).ratio, '8');
  check('first checkpoint response lost + recovery read unavailable + edit/retry produces one resource');
  const b = await context.newPage(); await navigate(b);
  await a.getByRole('textbox', { name: 'Rapporto previsto', exact: true }).fill('7');
  await b.getByRole('textbox', { name: 'Rapporto previsto', exact: true }).fill('9');
  await b.getByRole('button', { name: 'Salva e riprendi', exact: true }).click(); await saved(b);
  await a.getByRole('button', { name: 'Materiali', exact: true }).click(); await a.locator('.lj-root').waitFor({ state: 'detached' });
  await a.getByRole('button', { name: 'Lezione', exact: true }).click();
  await a.getByText('Questo lavoro è cambiato in un’altra scheda.', { exact: true }).waitFor();
  assert.equal(await a.getByRole('textbox', { name: 'Rapporto previsto', exact: true }).inputValue(), '7');
  assert(await a.getByRole('button', { name: 'Salva e riprendi', exact: true }).isDisabled());
  // Remount again: the original dirty baseline must survive a second remount.
  await a.getByRole('button', { name: 'Materiali', exact: true }).click(); await a.locator('.lj-root').waitFor({ state: 'detached' }); await a.getByRole('button', { name: 'Lezione', exact: true }).click();
  await a.getByText('Questo lavoro è cambiato in un’altra scheda.', { exact: true }).waitFor();
  workspace = await ws(); assert.equal(JSON.parse(workspace.resources.find(item => item.kind === 'learning-journey-checkpoint').text).ratio, '9');
  await a.screenshot({ path: path.join(out, 'conflict-1440.png'), fullPage: true });
  await a.getByRole('button', { name: 'Sostituisci la bozza con la versione salvata' }).click();
  await expect(a.getByRole('textbox', { name: 'Rapporto previsto', exact: true })).toHaveValue('9');
  check('dirty cache cannot overwrite another tab after two remounts; explicit conflict resolution');
  await a.getByRole('combobox', { name: 'Fonte del percorso' }).selectOption(access.source.id);
  await a.getByRole('combobox', { name: 'Grandezza fissata', exact: true }).selectOption('pressure');
  await a.getByRole('button', { name: 'Scrivi la risposta', exact: true }).click();
  await a.getByRole('textbox', { name: 'Il tuo ragionamento' }).fill('Ragionamento di A prima del conflitto concorrente.');
  await a.getByRole('button', { name: 'Salva e riprendi', exact: true }).click(); await saved(a);
  await b.reload(); await b.getByRole('textbox', { name: 'Il tuo ragionamento' }).waitFor();
  await a.getByRole('textbox', { name: 'Il tuo ragionamento' }).fill('Nuovo ragionamento A conservato nel Core prima dell’invio di B.');
  await a.getByRole('button', { name: 'Salva e riprendi', exact: true }).click(); await saved(a);
  await b.getByRole('button', { name: 'Invia il tentativo', exact: true }).click();
  await b.getByText('Questo lavoro è cambiato in un’altra scheda.', { exact: true }).waitFor();
  assert.equal((await ws()).submissions.length, 0);
  await b.getByRole('button', { name: 'Sostituisci la bozza con la versione salvata' }).click();
  await b.getByText('Questo lavoro è cambiato in un’altra scheda.', { exact: true }).waitFor({ state: 'detached' });
  await b.close(); check('CAS failure while preparing submission opens conflict without posting a duplicate');
  const teacher = await browser.newContext(); await login(teacher, access.teacher);
  assert.equal((await teacher.request.delete(origin + '/study/resources/' + access.source.id)).status(), 200);
  await a.getByRole('button', { name: 'Invia il tentativo', exact: true }).click();
  await a.getByText(/Il Core non ha ricevuto il tentativo/).waitFor();
  assert(await a.getByRole('textbox', { name: 'Il tuo ragionamento' }).isEnabled());
  assert.equal((await ws()).submissions.length, 0);
  check('deleted source 404 is a definitive rejection; editable answer survives');
  const create = async (kind, text) => {
    const response = await teacher.request.post(origin + '/study/resources', { data: { editionId: 'fluidi', kind, visibility: 'group', text }, headers: { 'Idempotency-Key': crypto.randomUUID() } });
    assert.equal(response.status(), 200); return response.json();
  };
  const passage = await create('lesson-passage', JSON.stringify({ schema: 'ardesia.lesson-passage-source.v1',
    descriptor: { schema: 'ardesia.lesson-passage.v1', workspaceId: 'local-default', lessonId: 's20-room', sessionId: 's20-session',
      recordingId: '00000000-0000-4000-8000-000000000001', startEpoch: 1000, endEpoch: 2000, sha256: 'a'.repeat(64),
      objectRefs: [{ elementId: 's20-formula', version: 1, label: 'Il passaggio sintetico sul vincolo' }],
      replayUrl: 'http://127.0.0.1:5173/?vista=replay&at=2000&recording=00000000-0000-4000-8000-000000000001&object=s20-formula&session=s20-session&sha=' + 'a'.repeat(64) + '&objectVersion=1#s20-room' },
    transcript: 'La portata dipende dalla quarta potenza del raggio a pressione costante.' }));
  const replacement = await create('activity', 'Fonte nuova per il confronto dei raggi. Usa il vincolo dichiarato nel problema.');
  await a.getByRole('button', { name: 'Riprova', exact: true }).click();
  await a.getByRole('combobox', { name: 'Fonte del percorso' }).selectOption(passage.id);
  await a.getByRole('button', { name: 'Apri la fonte', exact: true }).click();
  await a.getByText('La portata dipende dalla quarta potenza del raggio a pressione costante.', { exact: true }).waitFor();
  await a.keyboard.press('Escape');
  await a.getByRole('combobox', { name: 'Fonte del percorso' }).selectOption(replacement.id);
  await a.getByRole('button', { name: 'Invia il tentativo', exact: true }).click();
  await a.getByText('Ricevuto dal Core', { exact: true }).waitFor(); await saved(a);
  const submission = (await ws()).submissions[0];
  assert.equal(submission.activityEvidence.lessonPassageRef.resourceId, passage.id);
  assert(submission.source_refs.some(ref => ref.resourceId === replacement.id));
  assert(submission.source_refs.some(ref => ref.resourceId === passage.id));
  check('help passage A remains the exact assistance source after selecting primary source B');
  const checkpoint = (await ws()).resources.find(item => item.kind === 'learning-journey-checkpoint');
  const original = JSON.parse(checkpoint.text);
  let response = await context.request.post(origin + '/study/resources/' + checkpoint.id + '/revise', { data: {
    expectedRevision: checkpoint.revisionId, text: JSON.stringify({ ...original, ratio: '123' }),
  } }); assert.equal(response.status(), 200);
  const changed = await response.json();
  await a.reload(); await a.getByText('La ricevuta salvata non è ancora leggibile. Il testo è conservato; rileggi il servizio per confermarla.', { exact: true }).waitFor();
  assert.equal(await a.getByText('Ricevuto dal Core', { exact: true }).count(), 0);
  response = await context.request.post(origin + '/study/resources/' + checkpoint.id + '/revise', { data: {
    expectedRevision: changed.revisionId, text: JSON.stringify(original),
  } }); assert.equal(response.status(), 200);
  await a.reload(); await a.getByText('Ricevuto dal Core', { exact: true }).waitFor();
  check('mutated checkpoint cannot display a receipt for a different prediction');
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await login(touch, access.student); const mobile = await touch.newPage(); await navigate(mobile);
  await mobile.getByRole('button', { name: 'Affronta un problema diverso' }).tap();
  await mobile.getByRole('button', { name: 'Sperimenta', exact: true }).tap();
  const slider = mobile.locator('.physics-lab').getByRole('slider', { name: 'Rapporto dei raggi' });
  await slider.scrollIntoViewIfNeeded(); const bounds = await slider.boundingBox(); const initial = await slider.inputValue();
  await mobile.touchscreen.tap(bounds.x + bounds.width * .25, bounds.y + bounds.height / 2);
  assert.notEqual(await slider.inputValue(), initial);
  assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await mobile.screenshot({ path: path.join(out, 'touch-model-390.png'), fullPage: true });
  await touch.close(); await teacher.close();
  check('touch 390: native slider responds and model layout remains inside viewport');
  assert.deepEqual(errors, []); check('recovery suite: no unexpected pageerror');
} catch (error) {
  checks.push({ name: 'run', status: 'FAIL', message: error.message, stack: error.stack });
  await a.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {}); throw error;
} finally {
  await fs.writeFile(path.join(out, 'recovery-result.json'), JSON.stringify({ checks, errors, browser: browser.version() }, null, 2));
  await context.close(); await browser.close();
}
