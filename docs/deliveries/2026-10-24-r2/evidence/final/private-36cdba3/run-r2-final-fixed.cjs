// R2 final committed artifact QA; adapted from the R1 canonical UI journey.
// Two independent browser contexts; synthetic identity file stays in memory.
// No route mocks, product state injection, remote service, Auth trace or token log.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const repo = process.env.ARDESIA_REPO || '/private/tmp/ardesia-r2-20261024';
const {chromium} = require(path.join(repo, 'apps/studio/node_modules/playwright-core'));
const origin = process.env.ARDESIA_WEB_ORIGIN || 'http://127.0.0.1:5443';
assert.equal(origin, 'http://127.0.0.1:5443', 'R2 committed private candidate required');
const accessPath = process.env.ARDESIA_DEMO_ACCESS;
const candidatePath = process.env.ARDESIA_CANDIDATE_MANIFEST;
const expectedSha = process.env.ARDESIA_EXPECTED_SHA;
const studentActor = process.env.ARDESIA_STUDENT_ACTOR || 'student-05';
assert.ok(/^student-\d{2}$/.test(studentActor), 'Synthetic fixture student required');
assert.ok(accessPath && candidatePath && /^[0-9a-f]{40}$/.test(expectedSha || ''), 'Explicit fresh access file, candidate manifest and source SHA required');
const out = path.resolve(process.env.ARDESIA_PRIVATE_UI_OUT || '/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/r2/qa/private-final/run-' + Date.now());
assert.ok(!fs.existsSync(out), 'Fresh evidence directory required');
fs.mkdirSync(out, {recursive: true, mode: 0o700});
const access = JSON.parse(fs.readFileSync(accessPath, 'utf8'));
assert.equal(access.synthetic, true, 'Synthetic fixture required');
const secrets = Object.values(access.tokens);
const redact = value => secrets.reduce((text, secret) => text.replaceAll(secret, '[REDACTED]'), String(value))
  .replace(/courseBridge=[^&\s"']+/g, 'courseBridge=[REDACTED]');
const write = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n', {mode: 0o600});
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const report = {schema: 'ardesia.r2-private-ui.v1', synthetic: true, origin, expectedSha,
  runtime: process.version, studentActor,
  browserPath: 'Browser plugin not available; explicitly requested existing Playwright runner reused.',
  capture: 'Native MediaRecorder with a WebAudio tone; no hardware microphone, speech recognition or real learner data.',
  authEvidence: 'UI login with synthetic fixture credentials; no tokens, headers, storageState or auth trace retained.',
  remoteBeta: 'NOT_RUN', launchAllowed: false, checks: [], screenshots: [], errors: [], failedRequests: [], console: [], fonts: [], httpAssets: []};
const receipts = [], sources = [], diaryCommands = [];
let pendingAssetChecks = [];
const marker = 'R2 idrostatica ' + Date.now();
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
  assert.equal(Object.keys(inventory.files).length,manifest.source.sourceFileCount); assert.equal(Object.keys(manifest.assetsSha256).length,Number(process.env.ARDESIA_EXPECTED_ASSET_COUNT || 759));
  report.artifact = {commit: expectedSha, manifestSha256: digest(fs.readFileSync(candidatePath)),
    sourceTreeSha256: inventory.sha256, sourceCount:Object.keys(inventory.files).length, assetCount: Object.keys(manifest.assetsSha256).length};
  check('exact committed artifact and source inventory match ' + stage, true);
}
function watch(context, actor, existing) {
  const seen = new Set();
  const attach = page => {
    if (seen.has(page)) return; seen.add(page);
    page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(30000);
    page.on('pageerror', error => report.errors.push({actor,message:redact(error.message)}));
    page.on('requestfailed', request => report.failedRequests.push({actor,url:redact(request.url()),method:request.method(),resourceType:request.resourceType(),error:request.failure()?.errorText}));
    page.on('console', message => {if(['error','warning'].includes(message.type())) report.console.push({actor,text:redact(message.text())});});
    page.on('response', response => {
      const url = new URL(response.url());
      if (/\.(woff2?|otf|ttf)(?:\?|$)/i.test(response.url())) report.fonts.push({actor,url:response.url(),status:response.status()});
      const candidateName = url.pathname.startsWith('/studio/assets/') ? 'beta'+url.pathname : url.pathname.startsWith('/assets/') ? 'beta/web'+url.pathname : null;
      const manifest = JSON.parse(fs.readFileSync(candidatePath));
      if(candidateName && manifest.assetsSha256[candidateName]) pendingAssetChecks.push((async()=>{
        const bytes = await response.body();
        assert.equal(response.status(),200);assert.equal(digest(bytes),manifest.assetsSha256[candidateName]);
        report.httpAssets.push({path:url.pathname,sha256:digest(bytes),bytes:bytes.length,status:response.status()});
      })());
    });
  };
  context.on('page',attach);if(existing)attach(existing);
}
async function loginUI(context,actor) {
  const page=await context.newPage();page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(30000);
  await page.goto(origin+'/?edition=fluidi');
  await page.getByRole('button',{name:'Accedi al tuo spazio',exact:true}).click();
  await page.getByLabel('Codice di accesso sintetico').fill(access.tokens[actor]);
  await page.getByRole('button',{name:'Accedi',exact:true}).click();
  await page.getByLabel('Edizione corrente',{exact:true}).waitFor();
  await page.getByLabel('Edizione corrente',{exact:true}).selectOption('fluidi');
  const identity=await(await context.request.get(origin+'/study/me')).json();assert.equal(identity.id,actor);
  check(actor+' authenticates through the ordinary UI',true);return page;
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
async function openEpisode(page,role) {
  await page.goto(origin+'/?view=classroom&edition=fluidi');
  await page.getByRole('button',{name:'Pressione e profondità · percorso guidato',exact:true}).click();
  await page.getByRole('heading',{name:'La pressione rispetto a quale riferimento?',exact:true}).waitFor();
  check(role+' real scalar episode is reachable from the classroom',new URL(page.url()).origin===origin && /Ardesia/i.test(await page.title()));
  check(role+' no framework overlay',await page.locator('vite-error-overlay').count()===0);
}
async function predict(value,procedure,expected) {
  const step=studentPage.locator('.episode-step');
  check('scalar result hidden before prediction '+receipts.length,await step.getByTestId('scalar-episode-result').count()===0);
  await step.getByRole('textbox',{name:/Pressione prevista in Pa/}).fill(value);
  await step.getByRole('textbox',{name:/Spiega il riferimento e il procedimento/}).fill(procedure);
  const receipt=await clickReceipt(studentPage,'Registra previsione e confronta','submissions');receipts.push(receipt);
  await step.getByTestId('scalar-episode-result').waitFor();const evidence=receipt.activityEvidence;
  assert.equal(evidence.schemaVersion,2);assert.equal(evidence.experienceRef.id,'hydrostatic-reference-v1');assert.equal(evidence.stepId,expected.step);
  assert.equal(evidence.result.kind,'scalar');assert.equal(evidence.result.unit,'Pa');near(evidence.result.value,expected.result,'actual Core pressure');
  assert.equal(evidence.check.valueMatches,expected.matches);assert.equal(evidence.check.unitMatches,true);
  assert.equal(evidence.assistance,expected.assistance||'NO_SUPPORT_REQUESTED');assert.deepEqual(evidence.lessonPassageRef,report.lessonRef);
  assert.equal(await step.getByTestId('scalar-episode-result').innerText(),expected.result.toLocaleString('it-IT',{maximumFractionDigits:3})+' Pa');
  check('actual scalar receipt '+expected.step+' prediction '+value,true);
  check('scalar result does not certify reasoning or external aids', (await step.innerText()).includes('Nessun avanzamento certifica padronanza o assenza di aiuti esterni.'));
  return receipt;
}
(async () => {
  verifyArtifact('before browser');
  browser = await chromium.launch({headless:true,executablePath:'/Users/andreamarro/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
  const options={viewport:{width:1440,height:1000},locale:'it-IT',reducedMotion:'reduce',acceptDownloads:true};
  teacher=await browser.newContext(options);student=await browser.newContext(options);
  await teacher.addInitScript(()=>{
    window.__audioQA={calls:0,streams:[]};
    if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{
      window.__audioQA.calls++;const audio=new AudioContext();await audio.resume();
      const tone=audio.createOscillator(),gain=audio.createGain(),target=audio.createMediaStreamDestination();
      tone.frequency.value=554.365;gain.gain.value=.04;tone.connect(gain).connect(target);tone.start();
      window.__audioQA.streams.push(target.stream);return target.stream;
    };
  });
  tutorPage=await loginUI(teacher,'tutor-synthetic');studentPage=await loginUI(student,studentActor);
  watch(teacher,'teacher',tutorPage);watch(student,'student',studentPage);
  const health=await read(teacher,'health');check('real local synthetic API has persistent sqlite storage',health.synthetic===true&&health.persistence==='sqlite'&&Boolean(health.dataId));report.localStore={dataId:health.dataId,persistence:health.persistence};
  const prior=await read(student,'workspace?editionId=fluidi');check('student has no previous composable activity result',prior.submissions.every(item=>item.activityEvidence?.schemaVersion!==2));
  let publicationCount=0;tutorPage.on('request',request=>{if(new URL(request.url()).pathname==='/study/resources'&&request.method()==='POST')publicationCount++;});
  await openEpisode(tutorPage,'teacher');
  const popup=tutorPage.waitForEvent('popup');await tutorPage.getByRole('button',{name:'Apri la lavagna',exact:true}).click();studio=await popup;
  await studio.getByText('Aula collegata',{exact:true}).waitFor();
  assert.equal(await studio.evaluate(()=>window.__ARDESIA_BUILD__?.commitSha),expectedSha);
  check('Studio runtime build identity matches committed candidate',true);
  check('Studio bridge is ephemeral and same origin',new URL(studio.url()).origin===origin&&new URL(studio.url()).pathname==='/studio/'&&new URL(studio.url()).searchParams.size===1);
  check('opening Studio does not start capture',await studio.evaluate(()=>window.__audioQA.calls===0));
  check('capture requires explicit consent',await studio.getByRole('button',{name:'Registra audio',exact:true}).isDisabled());
  const annotation='Pressione relativa: zero alla superficie. Pressione assoluta: superficie più colonna di liquido. '+marker;
  await studio.getByLabel('Annotazione del docente',{exact:true}).fill(annotation);await studio.getByRole('button',{name:'Annota passaggio',exact:true}).click();
  await studio.getByLabel('Solo il mio microfono docente',{exact:true}).check();await studio.getByRole('button',{name:'Registra audio',exact:true}).click();await studio.getByText('Registrazione in corso',{exact:true}).waitFor();
  await studio.waitForTimeout(1100);await studio.getByRole('button',{name:'Termina registrazione',exact:true}).click();await studio.getByText('Audio salvato nella lezione.',{exact:true}).waitFor();
  check('native recorder stop drains and releases all tracks',await studio.evaluate(()=>window.__audioQA.calls===1&&window.__audioQA.streams.every(stream=>stream.getTracks().every(track=>track.readyState==='ended'))));
  check('capture and annotation alone do not publish a source',publicationCount===0);
  await studio.getByRole('button',{name:'Invia passaggio all’Aula',exact:true}).click();await tutorPage.getByText('Passaggio ricevuto dalla lavagna. Scrivi la spiegazione e conferma la condivisione con il gruppo.',{exact:true}).waitFor();
  check('proposed passage needs explicit written explanation and publication',publicationCount===0&&await tutorPage.getByRole('button',{name:'Condividi passaggio con il gruppo',exact:true}).isDisabled());
  const transcript='Prova sintetica R2: il file audio contiene un tono di test, non una voce. Spiegazione scritta originale: in un liquido fermo la pressione relativa considera l’incremento rispetto alla superficie; quella assoluta comprende anche la pressione presente alla superficie. Dichiara il riferimento e separa i due contributi, entrambi in Pa. '+marker;
  await tutorPage.getByRole('textbox',{name:/Trascrizione e spiegazione del passaggio/}).fill(transcript);
  const resource=await clickReceipt(tutorPage,'Condividi passaggio con il gruppo','resources');sources.push(resource);const source=JSON.parse(resource.text),descriptor=source.descriptor;report.lessonRef={resourceId:resource.id,revisionId:resource.revisionId};report.descriptor=descriptor;
  check('explicit confirmation publishes one exact group source',publicationCount===1&&resource.kind==='lesson-passage'&&resource.visibility==='group'&&source.transcript===transcript&&descriptor.objectRefs[0].label===annotation);
  await studio.goto(descriptor.replayUrl);await studio.getByRole('img',{name:'Oggetto collegato evidenziato: '+annotation,exact:true}).waitFor();await studio.getByRole('button',{name:"Ascolta registrazione dall'inizio",exact:true}).click();await studio.waitForFunction(()=>{const a=document.querySelector('audio');return a&&a.currentTime>.1;});
  const mediaDigest=await studio.evaluate(async()=>{const audio=document.querySelector('audio');const data=await(await fetch(audio.currentSrc)).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(v=>v.toString(16).padStart(2,'0')).join('');});assert.equal(mediaDigest,descriptor.sha256);check('actual replay media bytes match the pinned digest',true);await shot(studio,'teacher-native-replay-1440');
  await studio.getByRole('link',{name:'Torna alla lavagna',exact:true}).click();await studio.getByRole('link',{name:'Materiali',exact:true}).click();const download=studio.waitForEvent('download');await studio.getByRole('button',{name:'Esporta .lesson',exact:true}).click();const bundle=path.join(out,'private-native-r2.lesson');await(await download).saveAs(bundle);report.localBundle={name:'private-native-r2.lesson',bytes:fs.statSync(bundle).size,sha256:digest(fs.readFileSync(bundle)),distribution:'private local QA only; excluded from published selection'};
  await openEpisode(studentPage,'student');await studentPage.getByRole('combobox',{name:/Passaggio della lezione collegato/}).selectOption(JSON.stringify(report.lessonRef));
  await shot(studentPage,'student-scalar-before-390',true);
  const wrongProcedure=marker+': penso che la pressione relativa a due metri sia 2000 Pa; considero il riferimento alla superficie ma trascuro il fattore gravitazionale.';
  const wrong=await predict('2000',wrongProcedure,{step:'relative',result:19620,matches:false});check('wrong prediction remains in its immutable scalar receipt',wrong.activityEvidence.prediction.value===2000&&!wrong.activityEvidence.check.valueMatches);await shot(studentPage,'student-wrong-scalar-1440');
  const exactRead=studentPage.waitForResponse(response=>new URL(response.url()).pathname==='/study/resources/'+resource.id+'/revisions/'+resource.revisionId);await studentPage.getByRole('button',{name:'Recupera il passaggio della lezione',exact:true}).click();assert.equal((await exactRead).status(),200);await studentPage.getByRole('heading',{name:'Il passaggio del tutor',exact:true}).waitFor();assert.equal(await studentPage.getByRole('link',{name:'Torna al passaggio nella lavagna',exact:true}).getAttribute('href'),descriptor.replayUrl);await shot(studentPage,'student-exact-source-1440');
  const recoveryPopup=studentPage.waitForEvent('popup');await studentPage.getByRole('link',{name:'Torna al passaggio nella lavagna',exact:true}).click();recovered=await recoveryPopup;await recovered.getByRole('alert').getByText('Registrazione non disponibile',{exact:true}).waitFor();check('independent browser has no remote media merely from the source link',await recovered.locator('audio').count()===0);await shot(recovered,'independent-context-missing-media-1440');
  await recovered.goto(origin+'/studio/?vista=lezioni-salvate#'+descriptor.lessonId);await recovered.getByLabel('Seleziona bundle .lesson',{exact:true}).setInputFiles(bundle);await recovered.getByRole('button',{name:'Importa il bundle',exact:true}).click();await recovered.getByText(/^Import completato:/).waitFor();await recovered.goto(descriptor.replayUrl);await recovered.getByRole('img',{name:'Oggetto collegato evidenziato: '+annotation,exact:true}).waitFor();await recovered.getByRole('button',{name:"Ascolta registrazione dall'inizio",exact:true}).click();await recovered.waitForFunction(()=>{const a=document.querySelector('audio');return a&&a.currentTime>.1;});
  const importedDigest=await recovered.evaluate(async()=>{const a=document.querySelector('audio');const bytes=await(await fetch(a.currentSrc)).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');});assert.equal(importedDigest,descriptor.sha256);check('explicit bundle import restores the exact pinned object and media bytes in a new browser',true);
  await recovered.setViewportSize({width:390,height:844});
  await recovered.waitForFunction(()=>{const e=document.querySelector('.st-replay-object-focus');if(!e)return false;const b=e.getBoundingClientRect();return b.x>=0&&b.y>=0&&b.right<=innerWidth&&b.bottom<=innerHeight;});
  const automaticRect=await recovered.getByRole('img',{name:'Oggetto collegato evidenziato: '+annotation,exact:true}).boundingBox();report.mobileReplayAutomaticFit={rect:automaticRect,viewport:recovered.viewportSize(),manualFitClicked:false};
  check('native replay resize automatically keeps the exact linked object inside the viewport',Boolean(automaticRect));
  await recovered.screenshot({path:path.join(out,'imported-pinned-replay-390.png')});report.screenshots.push({name:'imported-pinned-replay-390.png',width:390,overflow:await recovered.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await recovered.close();
  await studentPage.getByRole('button',{name:'Correggi con il risultato visto',exact:true}).click();assert.equal(await studentPage.getByRole('textbox',{name:/Pressione prevista in Pa/}).inputValue(),'2000');assert.equal(await studentPage.getByRole('textbox',{name:/Spiega il riferimento e il procedimento/}).inputValue(),wrongProcedure);
  const corrected=await predict('19620',marker+': dopo il passaggio recuperato considero 1000 kg/m³, 9,81 m/s² e 2 m. La pressione relativa è 19620 Pa; non aggiungo quella della superficie.',{step:'relative',result:19620,matches:true,assistance:'SUPPORT_REQUESTED'});check('assisted correction links original and actual requested support',corrected.parentId===wrong.submissionId&&corrected.activityEvidence.supportUsed.includes('lesson-passage')&&corrected.activityEvidence.supportUsed.includes('model-result'));
  await studentPage.getByRole('button',{name:'Prosegui al prossimo problema',exact:true}).click();await predict('120945',marker+': per la pressione assoluta sommo 101325 Pa della superficie e 19620 Pa della colonna, ottenendo 120945 Pa.',{step:'absolute',result:120945,matches:true});
  await studentPage.getByRole('button',{name:'Prosegui al prossimo problema',exact:true}).click();await predict('114335',marker+': cambiano superficie e profondità. Sommo 80000 Pa a 1000 per 9,81 per 3,5 Pa, ottenendo 114335 Pa.',{step:'transfer',result:114335,matches:true});await studentPage.getByText(/Percorso consegnato/).waitFor();check('completed scalar episode has exactly four receipts without mastery claims',receipts.length===4);await shot(studentPage,'student-scalar-transfer-1440');await shot(studentPage,'student-scalar-transfer-390',true);
  await studentPage.getByRole('button',{name:'Il mio lavoro',exact:true}).click();await studentPage.getByRole('button',{name:'Consegne e feedback',exact:true}).click();const beforePublishRow=studentPage.locator('.delivery-row').filter({hasText:wrongProcedure});await beforePublishRow.waitFor();check('student workspace snapshot has no tutor feedback before publication',await beforePublishRow.getByRole('heading',{name:'Il tutor ha scritto',exact:true}).count()===0);await shot(studentPage,'student-work-before-teacher-publication-1440');
  await tutorPage.getByRole('button',{name:'Da correggere',exact:true}).click();await tutorPage.getByRole('button',{name:'Aggiorna consegne',exact:true}).click();const candidates=tutorPage.getByRole('complementary',{name:'Consegne del gruppo'}).getByRole('button');await candidates.first().waitFor();let found=false;for(let i=0;i<await candidates.count();i++){await candidates.nth(i).click();if((await tutorPage.locator('.submission-answer').innerText()).includes(wrongProcedure)){found=true;break;}}check('teacher finds the exact wrong scalar procedure',found);await tutorPage.getByRole('heading',{name:'Previsione prima del risultato',exact:true}).waitFor();check('review renders scalar units rather than Poiseuille ratio',!(await tutorPage.locator('.prediction-evidence').innerText()).includes('Vincolo indicato:')&&(await tutorPage.locator('.prediction-evidence').innerText()).includes('2000 Pa'));
  await clickReceipt(tutorPage,'Inizia la correzione','feedback/drafts');const teacherExplanation='La pressione relativa esclude il contributo della superficie. Il contributo della colonna richiede densità, accelerazione gravitazionale e profondità: 19620 Pa. Per il valore assoluto si aggiunge la pressione della superficie. '+marker;await tutorPage.getByRole('textbox',{name:/Spiegazione del tutor/}).fill(teacherExplanation);const delivered=(await read(teacher,'workspace?editionId=fluidi')).submissions.find(item=>item.id===wrong.submissionId);assert.ok(delivered);const reviewed=await clickReceipt(tutorPage,'Restituisci la correzione','feedback/'+delivered.feedback[0].id+'/publish');diaryCommands.push({kind:'feedback-publish',value:reviewed});await tutorPage.getByText(/Intervento del tutor restituito sulla versione/).waitFor();await shot(tutorPage,'teacher-scalar-feedback-1440');
  await tutorPage.getByText('Collega un passaggio al diario',{exact:true}).click();const original=tutorPage.getByRole('textbox',{name:'Originale della fonte',exact:true});await original.focus();await original.press(process.platform==='darwin'?'Meta+A':'Control+A');const quote=await original.inputValue();check('diary quote comes from the actual delivered original',quote.includes(wrongProcedure));await tutorPage.getByRole('combobox',{name:/^Concetto/}).selectOption('model-selection');const thread=await clickReceipt(tutorPage,'Proponi il passaggio','diary/observations');assert.equal(thread.status,'CANDIDATE');assert.equal(thread.source.quote,quote);assert.deepEqual({resourceId:thread.source.resourceId,revisionId:thread.source.revisionId},{resourceId:delivered.source_refs[0].resourceId,revisionId:delivered.source_refs[0].revisionId});diaryCommands.push({kind:'observation',value:thread});report.diaryThreadId=thread.threadId;check('teacher creates only a generic candidate diary observation for scalar work',thread.conceptId==='model-selection'&&thread.status==='CANDIDATE');
  await tutorPage.getByRole('button',{name:'Apri il diario per il prossimo passo',exact:true}).click();const diaryCard=tutorPage.locator('.diary-entry').filter({hasText:studentActor});await diaryCard.getByText('Da verificare',{exact:true}).waitFor();await shot(tutorPage,'teacher-scalar-diary-candidate-1440');await shot(tutorPage,'teacher-scalar-diary-candidate-390',true);const current=await read(teacher,'diary/threads/'+thread.threadId);assert.equal(current.status,'CANDIDATE');check('diary candidate is not confirmed or resolved',!current.latestVerification&&current.status==='CANDIDATE');
  report.diaryLimit={guidedTransferSupported:false,verifiedResolved:'NOT_RUN',reason:'Hydrostatic guided diary assignment is outside this candidate; observation remains CANDIDATE',guidedFormVisible:await tutorPage.getByText('Verifica e prepara il prossimo passo',{exact:true}).count()};
  check('Hydrostatic candidate does not offer the Poiseuille guided builder',await diaryCard.getByText('Verifica e prepara il prossimo passo',{exact:true}).count()===0);
  await diaryCard.getByText(/Questa osservazione resta da verificare manualmente/).waitFor();
  check('Hydrostatic candidate explains its manual verification boundary',true);
  check('existing student workspace remains a snapshot until an explicit reload',await beforePublishRow.getByRole('heading',{name:'Il tutor ha scritto',exact:true}).count()===0);await shot(studentPage,'student-work-before-reload-1440');report.manualReload={before:'Mounted workspace before tutor publication; same row still lacks feedback after publication',gesture:'Browser reload, then Il mio lavoro → Consegne e feedback',realTimeClaim:false};
  await studentPage.reload();await studentPage.getByRole('button',{name:'Il mio lavoro',exact:true}).click();await studentPage.getByRole('button',{name:'Consegne e feedback',exact:true}).click();const returnedRow=studentPage.locator('.delivery-row').filter({hasText:wrongProcedure});await returnedRow.getByRole('heading',{name:'Il tutor ha scritto',exact:true}).waitFor();assert.equal(await returnedRow.locator('.entry-explanation p').innerText(),teacherExplanation);check('independent student rereads the teacher feedback on its exact original submission',true);await shot(studentPage,'student-published-feedback-1440');
  const finalWorkspace=await read(teacher,'workspace?editionId=fluidi');const finalWrong=finalWorkspace.submissions.find(item=>item.id===wrong.submissionId);check('published feedback remains attached to the exact scalar submission',Boolean(finalWrong.feedback[0].review)&&finalWrong.feedback[0].review.text===teacherExplanation);
  check('persisted student has exactly four scalar submissions',(await read(student,'workspace?editionId=fluidi')).submissions.filter(item=>item.activityEvidence?.schemaVersion===2).length===4);check('all scalar receipts retain the exact lesson version',receipts.every(item=>item.activityEvidence.lessonPassageRef.resourceId===resource.id&&item.activityEvidence.lessonPassageRef.revisionId===resource.revisionId));check('screenshots have no horizontal overflow',report.screenshots.every(item=>!item.overflow));await Promise.all(pendingAssetChecks);check('no runtime page errors',report.errors.length===0);const knownAborts=report.failedRequests.filter(item=>{const p=new URL(item.url).pathname;return item.method==='GET'&&item.error==='net::ERR_ABORTED'&&(p==='/study/me'||(/^\/study\/resources\/[^/]+\/revisions\/[^/]+$/.test(p)&&!p.includes(report.lessonRef.resourceId)));});report.navigationAborts={count:knownAborts.length,requests:knownAborts,scope:'Retained GET/me navigation or unrelated old-card source-read selection cancellations; exact required source read was separately HTTP200',notFailureOfMutation:true};check('no failed workflow or media requests beyond retained navigation or old-card read cancellations',report.failedRequests.filter(item=>!knownAborts.includes(item)).length===0);check('no console errors or warnings after UI login',report.console.length===0);check('observed fonts are local and successful',report.fonts.length>0&&report.fonts.every(item=>new URL(item.url).origin===origin&&item.status===200));check('observed HTTP runtime assets match candidate bytes',report.httpAssets.length>0);verifyArtifact('after browser');report.passed=true;
})().catch(async error=>{
  report.passed=false;report.exception=redact(error.stack||error);for(const[name,page]of[['web-teacher',tutorPage],['web-student',studentPage],['studio',studio],['recovery',recovered]]){if(!page||page.isClosed())continue;try{fs.writeFileSync(path.join(out,'failure-'+name+'-dom.txt'),redact(await page.locator('body').innerText()),{mode:0o600});await page.screenshot({path:path.join(out,'failure-'+name+'.png'),fullPage:true});}catch{}}
  process.exitCode=1;
}).finally(async()=>{
  if(browser)await browser.close();write('receipts.json',receipts);write('sources.json',sources);write('diary-commands.json',diaryCommands);write('result.json',report);for(const name of fs.readdirSync(out))if(fs.statSync(path.join(out,name)).isFile())fs.chmodSync(path.join(out,name),0o600);console.log(JSON.stringify({out,passed:report.passed,checks:report.checks.length,exception:report.exception}));
});
