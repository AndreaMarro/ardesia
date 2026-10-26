import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createWriteStream,existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const proof=dirname(fileURLToPath(import.meta.url));
const repo=resolve(process.env.ARDESIA_G0_REPO??resolve(proof,'../../../..'));
const output=resolve(process.env.ARDESIA_G0_OUTPUT??'/tmp/ardesia-g0-proof-output');
const state=join(output,'private-state');
const python=process.env.ARDESIA_G0_PYTHON??join(repo,'services/study-api/.venv/bin/python');
const origin='http://127.0.0.1:5498',room='aula-fluidi';
const {chromium}=await import(pathToFileURL(join(repo,'node_modules/playwright/index.mjs')).href);
const {expect}=await import(pathToFileURL(join(repo,'node_modules/@playwright/test/index.mjs')).href);
await mkdir(output,{recursive:true});
await writeFile(join(output,'runner.mjs'),readFileSync(fileURLToPath(import.meta.url)));
await writeFile(join(output,'fixture.py'),readFileSync(join(proof,'fixture.py')));
assert(!existsSync(join(state,'study.sqlite')),'Each complete attempt must have a fresh Core and browser state.');
const sha=value=>createHash('sha256').update(value).digest('hex');
function hashTree(directory){
  const files={};
  const walk=(base,relative='')=>{for(const name of readdirSync(base).sort()){
    const file=join(base,name),key=relative?relative+'/'+name:name;
    if(statSync(file).isDirectory())walk(file,key);else files[key]=sha(readFileSync(file));
  }};
  walk(directory);return {fileCount:Object.keys(files).length,sha256:sha(JSON.stringify(files))};
}
const source={head:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
  tree:execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:repo,encoding:'utf8'}).trim(),
  web:hashTree(join(repo,'apps/web/dist')),studio:hashTree(join(repo,'apps/studio/dist')),
  composition:'ordinary compiled Web and Studio, real create_app; no source transformation, mocks or success backend',
  webFlag:'VITE_S20_LEARNING_JOURNEY=1 (private proof only; default remains OFF)'};
execFileSync('git',['diff','--exit-code'],{cwd:repo});
let server,browser;const contexts=[],checks=[],errors=[],external=[],network=[];
const pids=[];let stage='startup';
const note=(name,details={})=>{checks.push({name,status:'PASS',...details});console.log('PASS',name);};
async function start(){
  const log=createWriteStream(join(output,'core-server.log'),{flags:'a'});
  server=spawn(python,['-m','uvicorn','fixture:app','--host','127.0.0.1','--port','5498'],{cwd:repo,
    env:{...process.env,ARDESIA_G0_STATE:state,ARDESIA_G0_WEB:join(repo,'apps/web/dist'),ARDESIA_G0_STUDIO:join(repo,'apps/studio/dist'),
      PYTHONPATH:[join(repo,'packages/engine'),join(repo,'services/study-api'),join(repo,'plugins/s19-circuit-lab'),proof].join(':')},
    stdio:['ignore','pipe','pipe']});
  pids.push(server.pid);server.stdout.pipe(log);server.stderr.pipe(log);
  for(let i=0;i<150;i++){
    if(server.exitCode!==null)throw Error('Core exited during startup: '+server.exitCode);
    try{if((await fetch(origin+'/study/me')).status===401)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }throw Error('Core server did not become ready');
}
async function stop(){
  if(!server)return;const process=server;server=null;
  if(process.exitCode===null){const closed=new Promise(resolve=>process.once('exit',resolve));process.kill('SIGTERM');await closed;}
}
function observe(page){
  page.setDefaultTimeout(30000);
  page.on('pageerror',error=>errors.push({stage,message:error.message}));
  page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource|net::ERR_/.test(message.text()))errors.push({stage,message:message.text()});});
  page.on('request',request=>{if(/^https?:/.test(request.url())&&!request.url().startsWith(origin+'/'))external.push(request.url());});
  page.on('response',response=>{if(response.status()>=400)network.push({stage,status:response.status(),path:new URL(response.url()).pathname});});
}
async function context(options={}){
  const value=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce',...options});
  contexts.push(value);value.on('page',observe);return value;
}
async function login(context,identity){assert.equal((await context.request.post(origin+'/study/session',{data:{token:identity.token}})).status(),200);}
async function responseFor(page,path,kind){
  return page.waitForResponse(response=>response.url().endsWith(path)&&response.request().method()==='POST'
    &&(!kind||response.request().postDataJSON()?.kind===kind));
}
async function readWorkspace(context){const r=await context.request.get(origin+'/study/workspace?editionId=fluidi');assert.equal(r.status(),200);return r.json();}
function pair(resource){return {resourceId:resource.id,revisionId:resource.revisionId};}
function sameRefs(actual,expected){
  for(const resource of expected)assert(actual.some(ref=>ref.resourceId===resource.id&&ref.revisionId===resource.revisionId));
}
function livingLink(resource,kind){return origin+'/?'+new URLSearchParams({view:'materials',edition:'fluidi',living:JSON.stringify({...pair(resource),kind,
  lesson:{lessonId:room,activityId:'poiseuille-v1'}})});}
const screenshot=async(page,name)=>{
  await page.evaluate(()=>window.scrollTo(0,0));
  return page.screenshot({path:join(output,name+'.png'),fullPage:true,animations:'disabled'});
};
async function shellLayout(page,width){
  const value=await page.getByRole('complementary',{name:'Navigazione e account',exact:true}).evaluate(element=>{
    const style=getComputedStyle(element),rect=element.getBoundingClientRect();
    const main=document.querySelector('.app-main').getBoundingClientRect();
    return {position:style.position,maxWidth:style.maxWidth,width:rect.width,mainTop:main.y+scrollY};
  });
  assert.equal(value.maxWidth,'none');assert.equal(value.position,width>980?'fixed':'relative');
  if(width>980)assert.equal(value.mainTop,0);else assert.equal(value.width,width);
  return value;
}
const saved=page=>page.getByText('Salvato nel tuo spazio',{exact:true}).waitFor();
async function importLesson(context,bundle){
  const page=await context.newPage();await page.goto(origin+'/studio/?vista=lezioni-salvate#'+room);
  await page.getByLabel('Seleziona bundle .lesson',{exact:true}).setInputFiles(bundle);
  await page.getByRole('button',{name:'Importa il bundle',exact:true}).click();
  await page.getByText(/^Import completato:/).waitFor();return page;
}

try{
  await start();const identity=JSON.parse(readFileSync(join(state,'identity.json'),'utf8'));
  browser=await chromium.launch({headless:true,executablePath:process.env.ARDESIA_CHROMIUM,
    args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  const teacher=await context({permissions:['microphone']});await login(teacher,identity.teacher);
  const teacherPage=await teacher.newPage();
  stage='teacher original PDF';
  await teacherPage.goto(origin+'/?view=materials&edition=fluidi');
  const uploaded=responseFor(teacherPage,'/study/living-sources');
  await teacherPage.getByLabel('Apri un PDF scientifico',{exact:true}).setInputFiles(join(state,'poiseuille-originale.pdf'));
  const uploadedHttp=await uploaded;assert.equal(uploadedHttp.status(),200);const pdf=await uploadedHttp.json();
  assert.equal(pdf.document.sha256,sha(readFileSync(join(state,'poiseuille-originale.pdf'))));assert.equal(pdf.visibility,'group');
  await teacherPage.goto(livingLink(pdf,'living-source'));
  await expect(teacherPage.locator('.ls-viewport .page canvas').first()).toBeVisible({timeout:60000});
  await shellLayout(teacherPage,1440);
  note('Teacher uploads the original Poiseuille PDF through Materials; Core hash equals original bytes',{source:pair(pdf),sha256:pdf.document.sha256});

  stage='teacher PDF annotation and formula';
  const equation=teacherPage.locator('.ls-viewport .textLayer span').filter({hasText:'Q = pi r^4 Dp / (8 eta L)'}).first();
  await expect(equation).toBeVisible();await equation.scrollIntoViewIfNeeded();const box=await equation.boundingBox();
  await teacherPage.mouse.move(box.x+1,box.y+box.height/2);await teacherPage.mouse.down();
  await teacherPage.mouse.move(box.x+box.width-1,box.y+box.height/2,{steps:12});await teacherPage.mouse.up();
  await teacherPage.getByRole('button',{name:'Collega selezione testuale',exact:true}).click();
  const explanation='Poiseuille: mantieni fisso il vincolo. A Δp costante Q cresce con r⁴; a Q costante isola Δp.';
  await teacherPage.getByLabel('Contenuto blocco 1',{exact:true}).fill(explanation);
  await teacherPage.getByRole('button',{name:'Aggiungi blocco',exact:true}).click();
  await teacherPage.getByLabel('Tipo blocco 2',{exact:true}).selectOption('formula');
  await teacherPage.getByText('Codice LaTeX',{exact:true}).click();
  const formula=String.raw`Q=\frac{\pi r^4\Delta p}{8\eta L}`;
  await teacherPage.getByLabel('Codice LaTeX',{exact:true}).fill(formula);
  await teacherPage.getByLabel('Visibilità annotazione',{exact:true}).selectOption('group');
  const annotationHttp=responseFor(teacherPage,'/study/living-annotations');
  await teacherPage.getByRole('button',{name:'Salva annotazione',exact:true}).click();
  const annotationResponse=await annotationHttp;assert.equal(annotationResponse.status(),200);const annotation=await annotationResponse.json();
  assert.equal(annotation.annotation.target.resourceId,pdf.id);assert.equal(annotation.annotation.target.revisionId,pdf.revisionId);
  assert.equal(annotation.annotation.target.documentSha256,pdf.document.sha256);assert.equal(annotation.annotation.target.page,1);
  assert.equal(annotation.annotation.target.text.model,'native-pdfjs-items-concat-utf16-v1');
  assert.deepEqual(annotation.annotation.lesson,{lessonId:room,activityId:'poiseuille-v1'});
  assert(annotation.annotation.blocks.some(block=>block.kind==='formula'&&block.text===formula));
  await screenshot(teacherPage,'teacher-pdf-formula-1440');
  note('Native PDF equation selection, structured formula and lesson association saved in Core',{annotation:pair(annotation),target:annotation.annotation.target});

  stage='actual Aula to Room bridge';
  await teacherPage.goto(origin+'/?view=classroom&edition=fluidi');
  const teacherLab=teacherPage.locator('.physics-lab');await teacherLab.waitFor();
  const teacherRadius=teacherLab.getByRole('slider',{name:'Rapporto dei raggi',exact:true});
  const teacherRadiusBefore=await teacherRadius.inputValue();
  await teacherRadius.focus();await teacherPage.keyboard.press('ArrowLeft');
  assert.notEqual(await teacherRadius.inputValue(),teacherRadiusBefore);await teacherPage.keyboard.press('ArrowRight');
  const teacherRadiusMin=Number(await teacherRadius.getAttribute('min')),teacherRadiusStep=Number(await teacherRadius.getAttribute('step'));
  const teacherRadiusSteps=Math.round((2-teacherRadiusMin)/teacherRadiusStep);assert(teacherRadiusSteps>0&&teacherRadiusSteps<100);
  await teacherRadius.press('Home');for(let i=0;i<teacherRadiusSteps;i++)await teacherRadius.press('ArrowRight');
  assert.equal(Number(await teacherRadius.inputValue()),2);
  await teacherLab.getByRole('textbox',{name:'La tua previsione',exact:true}).fill('A raggio doppio, con Δp costante, Q/Q0 = 16.');
  const teacherEvaluation=responseFor(teacherPage,'/study/activities/evaluate');
  await teacherLab.getByRole('button',{name:'Metti alla prova',exact:true}).click();
  const teacherEvaluated=await teacherEvaluation;assert.equal(teacherEvaluated.status(),200);
  assert.equal((await teacherEvaluated.json()).ratio,16);
  note('Teacher opens and manipulates the same scientific object through the actual Aula and Core');
  await teacherPage.getByRole('button',{name:'Apri episodio guidato',exact:true}).click();
  const roomPromise=teacher.waitForEvent('page');await teacherPage.getByRole('button',{name:'Apri la lavagna',exact:true}).click();
  const studio=await roomPromise;await studio.getByLabel('Annotazione del docente',{exact:true}).waitFor();
  await teacherPage.getByText('Lavagna collegata. Registra e scegli “Invia passaggio all’Aula”.',{exact:true}).waitFor();
  assert.equal(new URL(studio.url()).hash,'#'+room);
  assert.equal(await studio.getByRole('checkbox',{name:'Solo il mio microfono docente'}).isChecked(),false);
  assert.equal(await studio.getByRole('button',{name:'Registra audio',exact:true}).isDisabled(),true);
  await studio.getByLabel('Annotazione del docente',{exact:true}).fill('Poiseuille: Q = π r⁴ Δp / (8 η L). Prima scegli se fissare Δp oppure Q.');
  await studio.getByRole('button',{name:'Annota passaggio',exact:true}).click();
  await studio.locator('.st-linked-source').getByText(/Passaggio collegato: Poiseuille/).waitFor();
  stage='teacher native formula editor in the same Room';
  await studio.getByRole('button',{name:'Chiudi pannello passaggio',exact:true}).click();
  await studio.getByRole('button',{name:'formula',exact:true}).click();
  const mathField=studio.locator('math-field[aria-label="Formula matematica"]');await mathField.waitFor();
  const canonicalLatex=await mathField.evaluate((field,value)=>{
    field.setValue(value,{silenceNotifications:false});field.position=field.lastOffset;field.focus();return field.value;
  },formula);
  await studio.getByRole('button',{name:'tastiera matematica',exact:true}).click();
  await expect(studio.locator('.ML__keyboard.is-visible')).toBeVisible();
  await studio.getByRole('button',{name:'tastiera matematica',exact:true}).click();
  await studio.getByRole('button',{name:'inserisci sulla lavagna',exact:true}).click();
  await expect(mathField).toHaveCount(0);
  await studio.locator('.excalidraw canvas.interactive').click({position:{x:500,y:500}});
  await studio.keyboard.press('ControlOrMeta+a');
  await studio.getByRole('button',{name:'Registra e collega un passaggio',exact:true}).click();
  await studio.getByRole('button',{name:'Collega oggetto selezionato',exact:true}).click();
  await studio.locator('.st-linked-source').getByText(/Immagine/).waitFor();
  await screenshot(studio,'teacher-native-formula-board-1440');
  note('Same teacher inserts the Poiseuille formula with native MathLive and selects its rendered board object for the recording',{canonicalLatex});
  stage='teacher explicit audio consent';
  await studio.getByRole('checkbox',{name:'Solo il mio microfono docente'}).check();
  await studio.getByRole('button',{name:'Registra audio',exact:true}).click();
  await studio.getByRole('status').getByText('Registrazione in corso',{exact:true}).waitFor();
  await studio.waitForTimeout(1200); // real MediaRecorder duration on a synthetic microphone.
  await studio.getByRole('button',{name:'Termina registrazione',exact:true}).click();
  await studio.getByText('Audio salvato nella lezione.',{exact:true}).waitFor();
  await studio.locator('summary').filter({hasText:'Dai un nome al passaggio salvato'}).click();
  await studio.getByLabel('Titolo del passaggio',{exact:true}).fill('Poiseuille: scegli il vincolo');
  await studio.getByRole('button',{name:'Salva capitolo',exact:true}).click();
  await studio.getByText('Capitolo salvato nella lezione. Lo ritrovi in Rivedi e nel file .lesson.',{exact:true}).waitFor();
  await studio.getByRole('button',{name:'Invia passaggio all’Aula',exact:true}).click();
  await teacherPage.getByText('Passaggio ricevuto dalla lavagna. Scrivi la spiegazione e conferma la condivisione con il gruppo.',{exact:true}).waitFor();
  note('Real Aula popup handshake, explicit teacher consent, Room object, recording and canonical chapter writer');

  stage='publish real passage to Core';
  const transcript='Mantieni Δp costante: a raggio doppio la portata cresce sedici volte. Mantieni invece Q costante: la differenza di pressione diventa un sedicesimo. Il PDF originale contiene la stessa legge e le ipotesi del modello.';
  await teacherPage.getByLabel('Trascrizione e spiegazione del passaggio',{exact:true}).fill(transcript);
  const passageHttp=responseFor(teacherPage,'/study/resources','lesson-passage');
  await teacherPage.getByRole('button',{name:'Condividi passaggio con il gruppo',exact:true}).click();
  const passageResponse=await passageHttp;assert.equal(passageResponse.status(),200);const passage=await passageResponse.json();
  const declared=JSON.parse(passage.text),descriptor=declared.descriptor;
  assert.equal(descriptor.lessonId,annotation.annotation.lesson.lessonId);assert(descriptor.objectRefs.length>0);
  assert(/^[a-f0-9]{64}$/.test(descriptor.sha256));assert(descriptor.endEpoch>descriptor.startEpoch);
  assert.equal(new URL(descriptor.replayUrl).origin,origin);assert.equal(new URL(descriptor.replayUrl).pathname,'/studio/');
  assert(descriptor.objectRefs.every(ref=>Number.isInteger(ref.version)&&ref.version>0));
  note('Teacher explicitly publishes the real Studio descriptor and transcript to the same Core',{passage:pair(passage),recording:descriptor.recordingId,lesson:descriptor.lessonId,objectRefs:descriptor.objectRefs,audioSha256:descriptor.sha256});

  stage='real lesson export';
  await studio.getByRole('link',{name:'Materiali',exact:true}).click();
  const downloadPromise=studio.waitForEvent('download');await studio.getByRole('button',{name:'Esporta .lesson',exact:true}).click();
  const download=await downloadPromise,bundle=join(state,'poiseuille.lesson');await download.saveAs(bundle);
  assert(statSync(bundle).size>0);
  const JSZip=(await import(pathToFileURL(join(repo,'apps/studio/node_modules/jszip/lib/index.js')).href)).default;
  const archive=await JSZip.loadAsync(readFileSync(bundle));
  const events=(await archive.file('raw/events.jsonl').async('string')).trim().split('\n').map(line=>JSON.parse(line));
  assert(events.length>=2&&events.every(event=>event.producer?.commitSha===source.head));
  const audioFiles=Object.values(archive.files).filter(file=>file.name.endsWith('.webm'));assert.equal(audioFiles.length,1);
  assert.equal(sha(await audioFiles[0].async('uint8array')),descriptor.sha256);
  const board=JSON.parse(await archive.file('raw/board.excalidraw').async('string'));
  for(const ref of descriptor.objectRefs){
    const element=board.elements.find(element=>element.id===ref.elementId);assert(element&&!element.isDeleted);assert.equal(element.version,ref.version);
    if(element.type==='text')assert.equal(element.text.replace(/\s+/g,' ').trim(),ref.label);
    else if(element.type==='image')assert.equal(ref.label,'Immagine');
  }
  const formulaObject=board.elements.find(element=>element.type==='image'&&!element.isDeleted&&descriptor.objectRefs.some(ref=>ref.elementId===element.id));
  assert(formulaObject&&Number.isFinite(formulaObject.width)&&formulaObject.width>0&&Number.isFinite(formulaObject.height)&&formulaObject.height>0);
  const formulaFile=board.files[formulaObject.fileId];assert.equal(formulaFile.mimeType,'image/svg+xml');
  assert(/^data:image\/svg\+xml;base64,/.test(formulaFile.dataURL));
  const formulaBytes=Buffer.from(formulaFile.dataURL.split(',')[1],'base64');
  assert(formulaBytes.toString('utf8').includes('<svg'));assert(formulaBytes.toString('utf8').includes('<path'));
  const mathEvent=events.find(event=>event.kind==='journal.math.insert'&&event.payload.latex===canonicalLatex);
  assert(mathEvent&&Date.parse(mathEvent.occurredAt)<=descriptor.startEpoch);
  assert(events.some(event=>event.kind==='journal.element.add'&&event.payload.element?.id===formulaObject.id&&Date.parse(event.occurredAt)<=descriptor.startEpoch));
  note('Portable lesson binds the native formula SVG and journal event to the exact recorded object before audio',{elementId:formulaObject.id,version:formulaObject.version,svgSha256:sha(formulaBytes)});
  assert(board.livingLesson.moments.some(moment=>moment.kind==='chapter'&&moment.recordingId===descriptor.recordingId&&moment.sha256===descriptor.sha256&&JSON.stringify(moment.objectRefs)===JSON.stringify(descriptor.objectRefs)));
  note('Teacher exports actual .lesson bundle after Room journal flush',{bundleSha256:sha(readFileSync(bundle)),bytes:statSync(bundle).size,producerCommit:source.head,exactAudioSha256:descriptor.sha256,exactBoardObjectVersions:true,exactChapter:true});

  stage='teacher exact PDF-media index link';
  await teacherPage.goto(origin+'/?'+new URLSearchParams({view:'materials',edition:'fluidi',mediaSource:passage.id,mediaRevision:passage.revisionId}));
  await teacherPage.getByRole('article',{name:'Passaggio selezionato'}).waitFor();
  await teacherPage.getByText('Modifica capitoli e trascrizione',{exact:true}).click();
  await teacherPage.getByLabel('Titolo del passaggio',{exact:true}).fill('Poiseuille: audio e fonte originale');
  await teacherPage.getByRole('combobox',{name:/^Collega una fonte del gruppo/}).selectOption(annotation.id);
  await teacherPage.getByRole('button',{name:'Collega la revisione selezionata',exact:true}).click();
  const indexHttp=responseFor(teacherPage,'/study/resources','lesson-media-index');
  await teacherPage.getByRole('button',{name:'Salva indice e trascrizione',exact:true}).click();
  const indexResponse=await indexHttp;assert.equal(indexResponse.status(),200);const index=await indexResponse.json(),indexData=JSON.parse(index.text);
  assert.deepEqual(indexData.source,{id:passage.id,revisionId:passage.revisionId,sha256:passage.sha256});
  assert.equal(indexData.links.length,1);assert.deepEqual({resourceId:indexData.links[0].resourceId,revisionId:indexData.links[0].revisionId},pair(annotation));
  assert(indexData.links[0].label.startsWith('Annotazione PDF · '));
  note('Actual Materials editor saves typed media index pointing to exact PDF annotation revision',{index:pair(index),source:indexData.source,link:indexData.links[0]});

  stage='fresh student local bundle import';
  const student=await context();await login(student,identity.student);
  const imported=await importLesson(student,bundle);await imported.close();
  note('Fresh student browser explicitly imports teacher .lesson using product UI; no shared OPFS or injected archive');

  stage='student source consultation retains dirty Journey';
  const page=await student.newPage();await page.goto(origin+'/?view=classroom&edition=fluidi');
  await page.getByTestId('learning-journey').waitFor();
  await page.getByRole('combobox',{name:'Fonte del percorso',exact:true}).selectOption(passage.id);
  await page.getByRole('textbox',{name:'Rapporto previsto',exact:true}).fill('16');
  await page.getByRole('combobox',{name:'Grandezza fissata',exact:true}).selectOption('pressure');
  await page.getByRole('button',{name:'Salva e riprendi',exact:true}).click();await saved(page);
  const checkpoint=new URL(page.url()).searchParams.get('journey');assert(checkpoint);const journeyURL=page.url();
  await page.getByRole('button',{name:'Apri la fonte',exact:true}).click();
  const sourceDialog=page.getByRole('dialog',{name:'La spiegazione originale',exact:true});
  await sourceDialog.getByText(transcript,{exact:true}).waitFor();
  const mediaLink=sourceDialog.getByRole('link',{name:/Apri audio e lavagna collegati.*in un’altra scheda/});
  assert.equal(await mediaLink.getAttribute('target'),'_blank');
  const mediaPromise=student.waitForEvent('page');await mediaLink.click();const media=await mediaPromise;
  await media.getByRole('article',{name:'Passaggio selezionato'}).waitFor();
  assert.equal(new URL(media.url()).searchParams.get('mediaSource'),passage.id);
  assert.equal(new URL(media.url()).searchParams.get('mediaRevision'),passage.revisionId);
  assert.equal(new URL(media.url()).searchParams.get('journey'),checkpoint);
  assert.equal(page.url(),journeyURL);await expect(sourceDialog).toBeVisible();
  note('SourceViewer opens exact Materials in a separate tab, preserving original dirty Journey and checkpoint URL');

  stage='student actual imported replay';
  const replayPromise=student.waitForEvent('page');await media.getByRole('button',{name:'Apri player e quaderno',exact:true}).click();
  const replay=await replayPromise;await replay.getByText('Waveform pronta',{exact:true}).waitFor({timeout:60000});
  const replayURL=new URL(replay.url());
  assert.equal(replayURL.searchParams.get('recording'),descriptor.recordingId);assert.equal(replayURL.searchParams.get('sha'),descriptor.sha256);
  assert.equal(replayURL.searchParams.get('captionSourceRevision'),passage.revisionId);
  assert.equal(replayURL.searchParams.get('captionIndexRevision'),index.revisionId);
  assert.equal(await replay.locator('audio').count(),1);
  await replay.getByRole('button',{name:'Ricomincia',exact:true}).click();await replay.getByRole('button',{name:'Ascolta',exact:true}).click();
  await replay.waitForFunction(()=>document.querySelector('audio')?.ended===true);
  await screenshot(replay,'student-replay-1440');
  note('Student imported archive validates pinned recording, audio bytes, board object and Core caption revisions; real playback reaches end');
  await replay.close();

  stage='return from replay to exact linked PDF';
  await media.getByRole('button',{name:indexData.links[0].label,exact:true}).click();
  const linked=media.locator('.lm-linked');
  await linked.getByRole('heading',{name:'Annotazione della lezione',exact:true}).waitFor();
  await expect(linked.locator('.ls-viewport .page canvas').first()).toBeVisible({timeout:60000});
  await linked.locator('.ls-viewport .textLayer span').filter({hasText:'Q = pi r^4 Dp / (8 eta L)'}).first().waitFor();
  await linked.getByText(explanation,{exact:true}).waitFor();assert(await linked.locator('.ls-highlight').count()>0);
  await screenshot(media,'student-linked-pdf-1440');await media.close();
  await page.bringToFront();await expect(sourceDialog).toBeVisible();await page.keyboard.press('Escape');
  await expect(page.getByRole('textbox',{name:'Rapporto previsto',exact:true})).toHaveValue('16');
  await page.getByRole('combobox',{name:'Fonte del percorso',exact:true}).selectOption(annotation.id);
  await page.getByRole('button',{name:'Salva e riprendi',exact:true}).click();await saved(page);
  let workspace=await readWorkspace(student),draft=JSON.parse(workspace.resources.find(resource=>resource.id===checkpoint).text);
  assert.deepEqual({resourceId:draft.helpSource.resourceId,revisionId:draft.helpSource.revisionId},pair(passage));
  assert.deepEqual({resourceId:draft.source.resourceId,revisionId:draft.source.revisionId},pair(annotation));
  assert(draft.support.includes('lesson-passage'));
  note('After player, student reads exact linked PDF annotation and formula; saved Journey retains distinct annotation primary plus consulted passage help');

  stage='student prediction and experiment';
  await page.getByRole('button',{name:'Sperimenta',exact:true}).click();const lab=page.locator('.physics-lab');await lab.waitFor();
  const range=lab.getByRole('slider',{name:'Rapporto dei raggi',exact:true});const before=await range.inputValue();
  await range.focus();await page.keyboard.press('ArrowLeft');assert.notEqual(await range.inputValue(),before);await page.keyboard.press('ArrowRight');
  assert.equal(await range.inputValue(),before);await lab.getByRole('textbox',{name:'Rapporto previsto',exact:true}).fill('16');
  const evaluated=responseFor(page,'/study/activities/evaluate');await lab.getByRole('button',{name:'Metti alla prova',exact:true}).click();
  const evaluatedHttp=await evaluated;assert.equal(evaluatedHttp.status(),200);assert.equal((await evaluatedHttp.json()).ratio,16);
  await lab.getByTestId('physics-ratio').waitFor();await screenshot(page,'student-experiment-1440');
  note('Prediction remains explicit; real PhysicsLab keyboard manipulation and Core numerical evaluation return ratio 16');

  stage='first assisted receipt';
  await page.getByRole('button',{name:'Torna alla tua risposta',exact:true}).click();
  const reasoning='Mantengo Δp costante e le altre proprietà uguali. Raddoppio il raggio: dalla legge letta nel PDF ottengo Q/Q0 = 2 alla quarta = 16. Il passaggio audio chiarisce quale grandezza resta fissata.';
  await page.getByRole('textbox',{name:'Il tuo ragionamento',exact:true}).fill(reasoning);
  await page.getByRole('button',{name:'Scrivi una formula',exact:true}).click();
  await page.getByText('Codice LaTeX',{exact:true}).click();
  await page.getByRole('textbox',{name:'Codice LaTeX',exact:true}).fill(String.raw`\frac{Q}{Q_0}=\left(\frac{r}{r_0}\right)^4=16`);
  await page.getByRole('button',{name:'Invia il tentativo',exact:true}).click();
  await page.getByText('Ricevuto dal Core',{exact:true}).waitFor();await saved(page);
  workspace=await readWorkspace(student);assert.equal(workspace.submissions.length,1);const first=workspace.submissions[0];
  sameRefs(first.source_refs,[annotation,passage]);assert.equal(first.source_refs.length,3);
  const attemptRef=first.source_refs.find(ref=>![annotation.id,passage.id].includes(ref.resourceId));assert(attemptRef);
  const attemptHttp=await student.request.get(origin+'/study/resources/'+attemptRef.resourceId+'/revisions/'+attemptRef.revisionId);
  assert.equal(attemptHttp.status(),200);const attempt=await attemptHttp.json();assert.equal(attempt.kind,'attempt-source');
  assert.equal(attempt.ownerId,identity.student.id);assert.equal(attempt.visibility,'private');assert.equal(attempt.text,first.text);
  assert.deepEqual(first.activityEvidence.lessonPassageRef,pair(passage));assert(first.activityEvidence.supportUsed.includes('lesson-passage'));
  assert(first.activityEvidence.supportUsed.includes('model-result'));assert.equal(first.activityEvidence.assistance,'SUPPORT_REQUESTED');
  assert.equal(first.activityEvidence.prediction.ratio,16);assert.equal(first.activityEvidence.prediction.fixedQuantity,'pressure');
  assert(first.text.includes(reasoning));await screenshot(page,'student-first-receipt-1440');
  note('First real Core receipt binds procedure, formula, prediction, exact PDF annotation and distinct exact audio help',{receiptId:first.receipt_id,sourceRefs:first.source_refs,lessonPassageRef:first.activityEvidence.lessonPassageRef});

  stage='actual teacher review';
  await teacherPage.goto(origin+'/?view=review&edition=fluidi');
  await teacherPage.getByLabel('Consegne del gruppo',{exact:true}).getByRole('button').first().click();
  await teacherPage.getByRole('button',{name:'Inizia la correzione',exact:true}).click();
  const feedback='Hai mantenuto Δp costante e collegato correttamente la quarta potenza alla fonte. Nel prossimo problema mantieni Q costante: isola Δp e spiega perché il rapporto si inverte.';
  await teacherPage.getByRole('textbox',{name:'Spiegazione del tutor',exact:true}).fill(feedback);
  await teacherPage.getByRole('button',{name:'Restituisci la correzione',exact:true}).click();
  await teacherPage.getByText('Correzione restituita allo studente.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Aggiorna il feedback',exact:true}).click();await page.getByText(feedback,{exact:true}).waitFor();
  await screenshot(page,'student-teacher-feedback-1440');
  note('Same teacher opens actual Review UI and publishes feedback; same student reads it beside original receipt');

  stage='next problem with renewed explicit source consultation';
  await page.getByRole('button',{name:'Affronta un problema diverso',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Rapporto previsto',exact:true})).toHaveValue('');
  await expect(page.getByRole('combobox',{name:'Fonte del percorso',exact:true})).toHaveValue(annotation.id);
  await saved(page); // nextStep already persists the new empty draft through Core.
  workspace=await readWorkspace(student);draft=JSON.parse(workspace.resources.find(resource=>resource.id===checkpoint).text);
  assert.equal(draft.helpSource,null);assert(!draft.support.includes('lesson-passage'));
  await page.getByRole('combobox',{name:'Fonte del percorso',exact:true}).selectOption(passage.id);
  await page.getByRole('button',{name:'Apri la fonte',exact:true}).click();
  await page.getByRole('dialog',{name:'La spiegazione originale',exact:true}).getByText(transcript,{exact:true}).waitFor();
  await page.keyboard.press('Escape');await page.getByRole('combobox',{name:'Fonte del percorso',exact:true}).selectOption(annotation.id);
  await page.getByRole('textbox',{name:'Rapporto previsto',exact:true}).fill('0,0625');
  await page.getByRole('combobox',{name:'Grandezza fissata',exact:true}).selectOption('flow');
  await page.getByRole('button',{name:'Scrivi la risposta',exact:true}).click();
  await page.getByRole('textbox',{name:'Il tuo ragionamento',exact:true}).fill('Ora Q resta costante. Isolo Δp = 8 η L Q / (π r alla quarta). Con r doppio, Δp/Δp0 = 1/16: la pressione necessaria diminuisce, come chiesto dal feedback del tutor.');
  await page.getByRole('button',{name:'Invia il tentativo',exact:true}).click();
  await page.getByText('Ricevuto dal Core',{exact:true}).waitFor();await saved(page);
  workspace=await readWorkspace(student);assert.equal(workspace.submissions.length,2);const second=workspace.submissions.find(item=>item.id!==first.id);
  assert(second);assert.notEqual(second.activityEvidence.stepId,first.activityEvidence.stepId);assert.equal(second.activityEvidence.prediction.ratio,0.0625);
  assert.equal(second.activityEvidence.prediction.fixedQuantity,'flow');sameRefs(second.source_refs,[annotation,passage]);
  assert.deepEqual(second.activityEvidence.lessonPassageRef,pair(passage));const reopenURL=page.url();
  note('Next canonical problem clears prior answer and help; explicit renewed consultation produces distinct receipt with Q fixed and ratio 1/16',{receiptId:second.receipt_id,stepId:second.activityEvidence.stepId});

  stage='real Core restart and cold student browser';
  await student.close();await teacher.close();await stop();await start();assert.equal(pids.length,2);assert.notEqual(pids[0],pids[1]);
  const cold=await context();await login(cold,identity.student);const restoredArchive=await importLesson(cold,bundle);await restoredArchive.close();
  const restored=await cold.newPage();await restored.goto(reopenURL);
  await restored.getByText('Ricevuto dal Core',{exact:true}).waitFor();assert((await restored.locator('.lj-feedback').innerText()).includes(second.receipt_id));
  workspace=await readWorkspace(cold);assert.equal(workspace.submissions.length,2);
  const firstAgain=workspace.submissions.find(item=>item.id===first.id);assert(firstAgain.feedback.some(item=>item.review?.text===feedback));sameRefs(firstAgain.source_refs,[annotation,passage]);
  assert.equal(JSON.parse(workspace.resources.find(resource=>resource.id===checkpoint).text).receiptId,second.receipt_id);
  note('New Core process and fresh browser restore second receipt, first teacher feedback and exact references from same database; explicit bundle reimport restores local archive');

  stage='cold exact originals and linked replay';
  await restored.getByText('Ricevute dei passaggi precedenti',{exact:true}).click();
  const firstHistory=restored.locator('.lj-recovery article').filter({hasText:first.receipt_id});
  await firstHistory.getByRole('button',{name:'Riapri l’originale',exact:true}).nth(first.source_refs.findIndex(ref=>ref.resourceId===annotation.id)).click();
  const originalDialog=restored.getByRole('dialog',{name:'Originale del tentativo',exact:true});
  await originalDialog.getByRole('heading',{name:'Annotazione della lezione',exact:true}).waitFor();
  await expect(originalDialog.locator('.ls-viewport .page canvas').first()).toBeVisible({timeout:60000});await restored.keyboard.press('Escape');
  await firstHistory.getByRole('button',{name:'Riapri l’originale',exact:true}).nth(first.source_refs.findIndex(ref=>ref.resourceId===passage.id)).click();
  const coldMediaPromise=cold.waitForEvent('page');await restored.getByRole('dialog',{name:'Originale del tentativo',exact:true}).getByRole('link',{name:/Apri audio e lavagna collegati/}).click();
  const coldMedia=await coldMediaPromise;await coldMedia.getByRole('article',{name:'Passaggio selezionato'}).waitFor();
  assert.equal(new URL(coldMedia.url()).searchParams.get('mediaRevision'),passage.revisionId);
  const coldReplayPromise=cold.waitForEvent('page');await coldMedia.getByRole('button',{name:'Apri player e quaderno',exact:true}).click();
  const coldReplay=await coldReplayPromise;await coldReplay.getByText('Waveform pronta',{exact:true}).waitFor({timeout:60000});
  assert.equal(new URL(coldReplay.url()).searchParams.get('captionSourceRevision'),passage.revisionId);
  await coldReplay.close();await coldMedia.close();await restored.keyboard.press('Escape');
  note('Cold historical receipt reopens its PDF annotation, exact media revision and reimported replay through canonical UI');

  stage='responsive and ACL';
  for(const width of [1440,820,390,360]){
    await restored.setViewportSize({width,height:1100});
    assert(await restored.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const shell=await shellLayout(restored,width);
    await screenshot(restored,'g0-receipt-'+width);note('Composed journey responsive at '+width+'px without body overflow or PDF CSS leak',{shell});
  }
  const peer=await context();await login(peer,identity.peer);
  assert.equal((await peer.request.get(origin+'/study/resources/'+checkpoint)).status(),403);
  assert.equal((await peer.request.get(origin+'/study/receipts/'+first.receipt_id)).status(),403);
  note('Enrolled peer cannot read student private checkpoint or receipt');
  const invalid=await cold.newPage();await invalid.goto(origin+'/?'+new URLSearchParams({view:'materials',edition:'fluidi',mediaSource:passage.id,mediaRevision:'g0-unavailable-revision'}));
  await invalid.getByRole('alert').first().waitFor();assert.equal(await invalid.getByRole('button',{name:'Apri player e quaderno',exact:true}).count(),0);await invalid.close();
  note('Actual unavailable exact media revision fails closed while a current passage exists; no latest fallback');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert(!network.some(item=>item.status>=500));
  assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),source.head);execFileSync('git',['diff','--exit-code'],{cwd:repo});
  assert.deepEqual(hashTree(join(repo,'apps/web/dist')),source.web);assert.deepEqual(hashTree(join(repo,'apps/studio/dist')),source.studio);
  note('Frozen source and production builds unchanged; no page errors, external requests or server failures');
  const result={status:'PASS',browser:browser.version(),checks,errors,external,network,product:source,
    source:pair(pdf),annotation:pair(annotation),passage:pair(passage),index:pair(index),receipts:[first.receipt_id,second.receipt_id],coreProcessIds:pids,
    limits:['Synthetic actors and original fixture, local SQLite/blob adapter only; not G1 or provider readiness',
      'Microphone device synthetic; real MediaRecorder and playback exercised, not human listening or hardware validation',
      '.lesson bytes explicitly exported/imported; textual Core reference grants no remote audio or authority',
      'S20 private rollout flag explicitly enabled; default remains OFF',
      'Receipt and feedback prove delivery/continuity, not mastery, scientific approval, course completion or public release']};
  await writeFile(join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,checks:checks.length,head:source.head}));
}catch(error){
  const result={status:'FAIL',stage,error:String(error),stack:error.stack,checks,errors,external,network,product:source,coreProcessIds:pids};
  await writeFile(join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.error(error);
  let i=0;for(const context of contexts){for(const page of context.pages()){
    const name='failure-'+i++;await screenshot(page,name).catch(()=>{});await writeFile(join(output,name+'.txt'),await page.locator('body').innerText().catch(()=>''));
  }}process.exitCode=1;
}finally{for(const context of contexts)await context.close().catch(()=>{});await browser?.close();await stop();}
