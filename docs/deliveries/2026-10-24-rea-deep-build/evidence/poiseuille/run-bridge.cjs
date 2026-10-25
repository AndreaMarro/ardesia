// Real Web teacher UI -> native synthetic Studio capture -> explicit Core share.
// No provider, hardware microphone, JSON paste, route mocking or auth in traces.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(path.resolve('apps/studio/node_modules/playwright-core'));
const origin = process.env.ARDESIA_WEB_ORIGIN || 'http://127.0.0.1:5320';
const out = path.resolve(process.env.ARDESIA_BRIDGE_OUT || '../deep-build/poiseuille/bridge-dev');
const access = JSON.parse(fs.readFileSync(process.env.ARDESIA_DEMO_ACCESS || '../study-qa/demo-access.json', 'utf8'));
assert.equal(access.synthetic, true);
fs.mkdirSync(out, {recursive: true});
const checks = [], errors = [], failedRequests = [], consoleMessages = [], shared = [], receipts = [];
const marker = "Prova sintetica candidata " + Date.now();
const check = (name, value) => {checks.push({name, pass: !!value}); assert.ok(value, name);};
(async () => {
 const browser = await chromium.launch({headless: true});
 const context = await browser.newContext({viewport: {width: 1440, height: 1000}, locale: 'it-IT', reducedMotion: 'reduce'});
 await context.addInitScript(() => {
  window.__audioQA = {calls: 0, streams: []};
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => {
   window.__audioQA.calls++;
   const ac = new AudioContext(); await ac.resume();
   const oscillator = ac.createOscillator(), gain = ac.createGain(), destination = ac.createMediaStreamDestination();
   gain.gain.value = .04; oscillator.frequency.value = 440;
   oscillator.connect(gain).connect(destination); oscillator.start();
   window.__audioQA.streams.push(destination.stream); return destination.stream;
  };
 });
 const watch = page => {
  page.on('pageerror', error => errors.push({url: page.url(), message: error.message}));
  page.on('requestfailed', request => failedRequests.push({url: request.url(), error: request.failure()?.errorText}));
  page.on('console', message => {if (['error', 'warning'].includes(message.type())) consoleMessages.push({url: page.url(), text: message.text()});});
 };
 context.on('page', watch);
 const page = await context.newPage(); let studio, tracing = false, traceName = 'teacher-trace.zip';
 async function switchActor(actor, name) {
  if (tracing) {await context.tracing.stop({path: path.join(out, traceName)}); tracing = false;}
  const login = await context.request.post(origin + '/study/session', {data: {token: access.tokens[actor]}});
  assert.equal(login.status(), 200);
  await context.tracing.start({screenshots: true, snapshots: true, sources: true}); tracing = true; traceName = name + '-trace.zip';
  await page.goto(origin + '/?edition=fluidi');
 }
 async function predict(ratio, boundary, procedure) {
  check('solution hidden before prediction ' + receipts.length, await page.getByTestId('episode-ratio').count() === 0);
  await page.getByLabel('Rapporto previsto', {exact: true}).fill(ratio);
  await page.getByRole('combobox', {name: /^Grandezza che resta fissata/}).selectOption(boundary);
  await page.getByRole('textbox', {name: /^Spiega il vincolo e il procedimento/}).fill(procedure);
  const acknowledged = page.waitForResponse(response => new URL(response.url()).pathname === '/study/submissions' && response.request().method() === 'POST');
  await page.getByRole('button', {name: 'Registra previsione e confronta', exact: true}).click();
  const response = await acknowledged; assert.equal(response.status(), 200);
  const receipt = await response.json(); receipts.push(receipt);
  await page.getByTestId('episode-ratio').waitFor(); return receipt;
 }
 try {
  const login = await context.request.post(origin + '/study/session', {data: {token: access.tokens['tutor-synthetic']}});
  assert.equal(login.status(), 200);
  // Auth finishes before tracing and before request evidence listeners.
  await context.tracing.start({screenshots: true, snapshots: true, sources: true}); tracing = true;
  page.on('request', request => {if (new URL(request.url()).pathname === '/study/resources' && request.method() === 'POST') shared.push(request.postDataJSON());});
  await page.goto(origin + '/?edition=fluidi');
  await page.getByRole('button', {name: 'Prepara l’aula', exact: true}).click();
  await page.getByRole('button', {name: 'Apri episodio guidato', exact: true}).click();
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', {name: 'Apri la lavagna', exact: true}).click(); studio = await popup;
  await studio.getByText('Aula collegata', {exact: true}).waitFor();
  check('teacher launches installed Studio with a single ephemeral channel', new URL(studio.url()).searchParams.size === 1 && new URL(studio.url()).searchParams.has('courseBridge'));
  check('opening and handshake do not start capture', await studio.evaluate(() => window.__audioQA.calls === 0));
  const annotation = 'Q resta costante: isoliamo Δp nella formula di Poiseuille. Prova sintetica ' + Date.now();
  await studio.getByRole('textbox', {name: 'Annotazione del docente', exact: true}).fill(annotation);
  await studio.getByRole('button', {name: 'Annota passaggio', exact: true}).click();
  await studio.getByLabel('Solo il mio microfono docente').check();
  await studio.getByRole('button', {name: 'Registra audio', exact: true}).click();
  await studio.getByText('Registrazione in corso', {exact: true}).waitFor();
  await studio.waitForTimeout(900); // deliberate physical clip duration
  await studio.getByRole('button', {name: 'Termina registrazione', exact: true}).click();
  await studio.getByText('Audio salvato nella lezione.', {exact: true}).waitFor();
  check('native synthetic track ended on stop', await studio.evaluate(() => window.__audioQA.calls === 1 && window.__audioQA.streams.every(stream => stream.getTracks().every(track => track.readyState === 'ended'))));
  check('capture and annotation have not published a Core source', shared.length === 0);
  await studio.getByRole('button', {name: 'Invia passaggio all’Aula', exact: true}).click();
  await page.getByText('Passaggio ricevuto dalla lavagna. Scrivi la spiegazione e conferma la condivisione con il gruppo.', {exact: true}).waitFor();
  check('proposal enters the actual Aula as an unshared draft', shared.length === 0);
  const share = page.getByRole('button', {name: 'Condividi passaggio con il gruppo', exact: true});
  check('explanation is required before explicit group confirmation', await share.isDisabled());
  const transcript = 'Qui Q resta costante. Isoliamo Δp: la quarta potenza del raggio va al denominatore. Trascrizione originale sintetica di QA, senza riconoscimento automatico.';
  await page.getByLabel('Trascrizione e spiegazione del passaggio', {exact: true}).fill(transcript);
  check('teacher explanation remains a draft', shared.length === 0);
  await page.screenshot({path: path.join(out, 'teacher-proposal-1440.png')});
  const received = page.waitForResponse(response => new URL(response.url()).pathname === '/study/resources' && response.request().method() === 'POST');
  await share.click(); const response = await received;
  assert.equal(response.status(), 200); const resource = await response.json();
  const source = JSON.parse(resource.text), descriptor = source.descriptor;
  check('only the explicit confirmation creates one canonical group source', shared.length === 1 && resource.kind === 'lesson-passage' && resource.visibility === 'group' && !!resource.revisionId);
  check('canonical source pins the actual recording and selected object', source.schema === 'ardesia.lesson-passage-source.v1' && source.transcript === transcript && descriptor.objectRefs[0].label === annotation && descriptor.workspaceId === 'local-default');
  fs.writeFileSync(path.join(out, 'passage.json'), JSON.stringify(descriptor, null, 2));
  fs.writeFileSync(path.join(out, 'source.json'), JSON.stringify(resource, null, 2));
  await page.getByText('Passaggio condiviso con il gruppo nella sua versione salvata.', {exact: true}).waitFor();
  await studio.goto(descriptor.replayUrl);
  await studio.getByRole('img', {name: 'Oggetto collegato evidenziato: ' + annotation, exact: true}).waitFor();
  await studio.getByRole('button', {name: "Ascolta registrazione dall'inizio", exact: true}).click();
  await studio.waitForTimeout(250);
  check('the exact local passage replays media and highlights the pinned object', await studio.locator('audio').evaluate(element => element.currentTime > 0));
  await studio.screenshot({path: path.join(out, 'actual-replay-1440.png')});
  await context.tracing.stop({path: path.join(out, traceName)}); tracing = false;
  const studentLogin = await context.request.post(origin + '/study/session', {data: {token: access.tokens['student-01']}});
  assert.equal(studentLogin.status(), 200);
  await context.tracing.start({screenshots: true, snapshots: true, sources: true}); tracing = true; traceName = 'student-trace.zip';
  await page.goto(origin + '/?edition=fluidi');
  await page.getByRole('button', {name: 'Apri il corso', exact: true}).click();
  await page.getByRole('button', {name: 'Apri episodio guidato', exact: true}).click();
  await page.getByRole('combobox', {name: /^Passaggio della lezione collegato/}).selectOption(resource.id);
  check('student episode still hides the numerical solution before prediction', await page.getByTestId('episode-ratio').count() === 0);
  const priorWorkspace = await (await context.request.get(origin + '/study/workspace?editionId=fluidi')).json();
  const previouslyAvailable = step => priorWorkspace.submissions.some(item => item.activityEvidence?.experienceId === 'poiseuille-boundary-v1' && item.activityEvidence?.stepId === step);
  const first = await predict('16', 'pressure', marker + ': pressione fissata, Q cresce con la quarta potenza del raggio.');
  check('fixed pressure and double radius produce Q times16 in a canonical receipt', first.activityEvidence.result.ratio === 16 && first.activityEvidence.assistance === (previouslyAvailable('fixed-pressure') ? 'SUPPORT_REQUESTED' : 'NO_SUPPORT_REQUESTED'));
  await page.getByRole('button', {name: 'Cambia il vincolo', exact: true}).click();
  const wrongProcedure = marker + ': vincolo scambiato, penso che Δp cresca con r alla quarta.';
  const wrong = await predict('16', 'pressure', wrongProcedure);
  check('the same model catches the wrong constraint at fixed Q', wrong.activityEvidence.result.ratio === .0625 && !wrong.activityEvidence.check.constraintMatches && !wrong.activityEvidence.check.ratioMatches);
  await page.getByText(/Hai scambiato il vincolo/).waitFor();
  const exactRead = page.waitForResponse(response => new URL(response.url()).pathname === '/study/resources/' + resource.id + '/revisions/' + resource.revisionId);
  await page.getByRole('button', {name: 'Recupera il passaggio della lezione', exact: true}).click();
  const authorizedRead = await exactRead; assert.equal(authorizedRead.status(), 200);
  const exactSource = await authorizedRead.json();
  check('student resolves only the exact authorized Core source and revision', exactSource.id === resource.id && exactSource.revisionId === resource.revisionId);
  const replay = page.getByRole('link', {name: 'Torna al passaggio nella lavagna', exact: true});
  check('student recovery preserves the actual recording, object and scene pins', await replay.getAttribute('href') === descriptor.replayUrl);
  await page.screenshot({path: path.join(out, 'student-recovery-1440.png')});
  const actualPopup = page.waitForEvent('popup'); await replay.click(); const recovered = await actualPopup;
  await recovered.getByRole('img', {name: 'Oggetto collegato evidenziato: ' + annotation, exact: true}).waitFor();
  check('student recovery opens the actual pinned scene', recovered.url() === descriptor.replayUrl); await recovered.close();
  await page.getByRole('button', {name: 'Correggi con il risultato visto', exact: true}).click();
  const assisted = await predict('0,0625', 'flow', marker + ': correzione assistita, isolo Δp a Q fissata; r doppio riduce Δp a 1/16.');
  check('a corrected prediction retains assistance and its original parent', assisted.parentId === wrong.submissionId && assisted.activityEvidence.assistance === 'SUPPORT_REQUESTED' && assisted.activityEvidence.supportUsed.includes('lesson-passage') && assisted.activityEvidence.supportUsed.includes('model-result') && assisted.activityEvidence.check.ratioMatches && assisted.activityEvidence.check.constraintMatches);
  await page.getByRole('button', {name: 'Affronta il problema diverso', exact: true}).click();
  const third = await predict('16', 'flow', marker + ': prova diversa, dimezzo r a Q costante; Δp aumenta di16 volte.');
  check('the distinct half-radius fixed-Q problem produces pressure times16', third.activityEvidence.result.ratio === 16 && third.activityEvidence.exerciseRef === 'RF-04' && third.activityEvidence.prediction.fixedQuantity === 'flow');
  check('the new problem reports prior availability truthfully without copying earlier requested help', third.activityEvidence.assistance === (previouslyAvailable('transfer') ? 'SUPPORT_REQUESTED' : 'NO_SUPPORT_REQUESTED'));
  check('all receipts retain the same exact lesson source', receipts.every(receipt => receipt.activityEvidence.lessonPassageRef.resourceId === resource.id && receipt.activityEvidence.lessonPassageRef.revisionId === resource.revisionId));
  await page.screenshot({path: path.join(out, 'student-distinct-proof-1440.png')});

  await switchActor('tutor-synthetic', 'teacher-review');
  await page.getByRole('button', {name: 'Da correggere', exact: true}).click();
  const candidates = page.getByRole('complementary', {name: 'Consegne del gruppo'}).getByRole('button');
  await candidates.first().waitFor(); let selected = false;
  for (let i = 0; i < await candidates.count(); i++) {
   await candidates.nth(i).click();
   if ((await page.locator('.submission-answer').textContent()).includes(wrongProcedure)) {selected = true; break;}
  }
  check('teacher finds this candidate exact received constraint error', selected);
  await page.getByRole('heading', {name: 'Previsione prima del risultato', exact: true}).waitFor();
  await page.getByRole('button', {name: 'Inizia la correzione', exact: true}).click();
  await page.getByLabel('Spiegazione del tutor', {exact: true}).fill('Q resta fissata. Isola Δp: r doppio richiede1/16 della pressione. Controlla il caso inverso.');
  await page.getByRole('button', {name: 'Restituisci la correzione', exact: true}).click();
  await page.getByText(/Intervento del tutor restituito sulla versione/).waitFor();
  await page.getByText('Collega un passaggio al diario', {exact: true}).click();
  const originalInput = page.getByRole('textbox', {name: 'Originale della fonte', exact: true});
  await originalInput.focus(); await originalInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.getByRole('combobox', {name: /^Concetto/}).selectOption('model-selection');
  await page.getByRole('button', {name: 'Proponi il passaggio', exact: true}).click();
  await page.getByRole('button', {name: 'Apri il diario per il prossimo passo', exact: true}).click();
  await page.getByText('Verifica e prepara il prossimo passo', {exact: true}).click();
  await page.getByLabel('Spiegazione del tutor', {exact: true}).fill('Il vincolo scelto nella previsione non era quello del problema.');
  await page.getByLabel('Criterio della rubrica', {exact: true}).fill('Isola Δp mantenendo Q costante e giustifica la quarta potenza del raggio.');
  await page.getByLabel('Prossimo passo', {exact: true}).fill('Risolvi una nuova prova con raggio dimezzato a portata fissata.');
  await page.getByLabel('Nuovo problema', {exact: true}).fill('Il raggio si dimezza, Q è costante. Quanto vale Δp/Δp₀? Spiega il procedimento.');
  await page.getByLabel('Rapporto originale r/r₀', {exact: true}).fill('2');
  await page.getByLabel('Nuovo rapporto r/r₀', {exact: true}).fill('0.5');
  await page.getByRole('combobox', {name: /^Grandezza fissata nel confronto/}).selectOption('flow');
  await page.getByRole('button', {name: 'Conferma osservazione e assegna la nuova prova', exact: true}).click();
  await page.getByText('Da riprovare', {exact: true}).last().waitFor();
  check('human review creates the existing diary assignment', true);
  await page.screenshot({path: path.join(out, 'teacher-diary-assignment-1440.png')});

  await switchActor('student-01', 'student-diary');
  await page.getByRole('button', {name: 'Il mio lavoro', exact: true}).click();
  await page.getByText('Affronta una situazione nuova', {exact: true}).click();
  const newProcedure = marker + ': a Q costante Δp è inversa a r⁴. Se r si dimezza, Δp aumenta di16 volte.';
  await page.getByLabel('Spiega il tuo procedimento', {exact: true}).fill(newProcedure);
  await page.getByRole('button', {name: 'Consegna la nuova prova', exact: true}).click();
  await page.getByText('In pratica', {exact: true}).waitFor();
  check('student submits a new procedure to the assigned diary transfer', true);
  await page.screenshot({path: path.join(out, 'student-diary-transfer-1440.png')});

  await switchActor('tutor-synthetic', 'teacher-verification');
  await page.getByRole('button', {name: 'Diario degli errori', exact: true}).click();
  await page.getByText('Rivedi la nuova prova', {exact: true}).click();
  await page.getByLabel('Passaggio del procedimento verificato', {exact: true}).fill(newProcedure);
  await page.getByLabel('Motivazione della verifica', {exact: true}).fill('Il procedimento esplicita il vincolo Q e isola la pressione prima di confrontare i raggi.');
  await page.getByLabel('Che cosa rende diversa questa prova', {exact: true}).fill('Il raggio è dimezzato anziché raddoppiato.');
  await page.getByRole('button', {name: 'Registra la verifica del tutor', exact: true}).click();
  await page.getByRole('button', {name: 'Verificati', exact: true}).click();
  await page.getByText('Verificato su una nuova prova', {exact: true}).last().waitFor();
  check('teacher explicitly verifies the distinct new procedure in the canonical diary', true);
  await page.screenshot({path: path.join(out, 'teacher-verified-1440.png')});
  check('no page errors', errors.length === 0);
  check('no failed network requests', failedRequests.length === 0);
  check('no console errors or warnings', consoleMessages.length === 0);
 } catch (error) {
  fs.writeFileSync(path.join(out, 'failure.txt'), String(error.stack));
  fs.writeFileSync(path.join(out, 'failure-web-dom.txt'), await page.locator('body').innerText());
  await page.screenshot({path: path.join(out, 'failure-web.png')}).catch(() => {});
  if (studio) await studio.screenshot({path: path.join(out, 'failure-studio.png')}).catch(() => {});
  throw error;
 } finally {
  if (tracing) await context.tracing.stop({path: path.join(out, traceName)});
  fs.writeFileSync(path.join(out, 'receipts.json'), JSON.stringify(receipts, null, 2));
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({checks, errors, failedRequests, consoleMessages}, null, 2));
  await browser.close();
 }
 console.log(JSON.stringify({out, checks: checks.length}));
})().catch(error => {console.error(error); process.exitCode = 1;});
