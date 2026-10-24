// Chromium native synthetic audio + actual Studio controls. Parent is an explicit
// transport harness; integrated Web/Core confirmation is a separate root proof.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(path.resolve('apps/studio/node_modules/playwright-core'));
const out = path.resolve(process.env.ARDESIA_STUDIO_QA_OUT || 'docs/deliveries/2026-10-24-rea-deep-build/evidence/studio/browser');
fs.mkdirSync(out,{recursive:true});
const channel='5fddaa15-ef31-4ac4-800c-a7ca6dafab06';
const studio='http://127.0.0.1:5197';
const parentOrigin='http://127.0.0.1:5320';
const checks=[],errors=[],consoleMessages=[],failedRequests=[];
const check=(name,value)=>{checks.push({name,pass:!!value});assert.ok(value,name)};
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',locale:'it-IT'});
 await context.tracing.start({screenshots:true,snapshots:true,sources:true});
 await context.addInitScript(()=>{
  window.__audioQA={calls:0,streams:[]};
  if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{
   window.__audioQA.calls++;
   const ac=new AudioContext();await ac.resume();const oscillator=ac.createOscillator(),gain=ac.createGain(),destination=ac.createMediaStreamDestination();
   gain.gain.value=.04;oscillator.frequency.value=440;oscillator.connect(gain).connect(destination);oscillator.start();
   window.__audioQA.streams.push(destination.stream);return destination.stream;
  };
 });
 const watch=page=>{page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(['warning','error'].includes(message.type()))consoleMessages.push({type:message.type(),text:message.text()})});page.on('requestfailed',request=>failedRequests.push({url:request.url(),error:request.failure()?.errorText}))};
 const parent=await context.newPage();watch(parent);
 await parent.route(parentOrigin+'/__studio_bridge_qa',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><title>Explicit Aula transport harness</title><button id="open">Apri Studio</button><p id="status">Non condiviso</p><script>let popup;document.querySelector('#open').onclick=()=>{popup=window.open('${studio}/?courseBridge=${channel}#studio-deep-qa')};window.addEventListener('message',event=>{if(event.origin!=='${studio}'||event.source!==popup||event.data.channel!=='${channel}')return;if(event.data.type==='ardesia.lesson-passage.ready.v1')popup.postMessage({type:'ardesia.lesson-passage.connect.v1',channel:'${channel}'},'${studio}');if(event.data.type==='ardesia.lesson-passage.proposed.v1'){window.received=event.data.descriptor;document.querySelector('#status').textContent='Bozza ricevuta, condivisione non eseguita'}});</script>`}));
 let page;
 try {
  await parent.goto(parentOrigin+'/__studio_bridge_qa');
  const popup=parent.waitForEvent('popup');await parent.getByRole('button',{name:'Apri Studio'}).click();page=await popup;watch(page);
  await page.getByText('Aula collegata',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Registra audio',exact:true}).waitFor();
  check('saved consent/bridge do not start capture',await page.evaluate(()=>window.__audioQA.calls===0));
  const label='Poiseuille: la differenza di pressione resta fissata. Collego questa formula alla spiegazione del docente, per ritrovare il vincolo prima di affrontare un problema diverso.';
  await page.getByRole('textbox',{name:'Annotazione del docente',exact:true}).fill(label);
  await page.getByRole('button',{name:'Annota passaggio',exact:true}).click();
  await page.getByText('Passaggio collegato: '+label,{exact:true}).waitFor();
  await page.getByRole('button',{name:'Collega oggetto selezionato',exact:true}).waitFor({state:'visible'});
  const count=await page.evaluate(()=>window.__MAESTRO_TEST__.apiRef.current.getSceneElements().length);
  await page.getByRole('button',{name:'Collega oggetto selezionato',exact:true}).click();
  check('link selection reuses the existing actual object',await page.evaluate(()=>window.__MAESTRO_TEST__.apiRef.current.getSceneElements().length)===count);
  await page.getByLabel('Solo il mio microfono docente').check();
  await page.getByRole('button',{name:'Registra audio',exact:true}).click();
  await page.getByText('Registrazione in corso',{exact:true}).waitFor();
  await page.waitForTimeout(900); // declared physical duration below native timeslice
  await page.getByRole('button',{name:'Termina registrazione',exact:true}).click();
  await page.getByText('Audio salvato nella lezione.',{exact:true}).waitFor();
  check('native capture tracks end before send',await page.evaluate(()=>window.__audioQA.streams.every(stream=>stream.getTracks().every(track=>track.readyState==='ended'))));
  await page.getByRole('button',{name:'Invia passaggio all’Aula',exact:true}).click();
  await parent.getByText('Bozza ricevuta, condivisione non eseguita',{exact:true}).waitFor();
  const descriptor=await parent.evaluate(()=>window.received);fs.writeFileSync(path.join(out,'passage.json'),JSON.stringify(descriptor,null,2));
  check('explicit send reaches the pinned opener without Core publication',descriptor.schema==='ardesia.lesson-passage.v1'&&descriptor.objectRefs[0].label===label);
  const native=await page.evaluate(async()=>{
   const {prepareLessonPassage}=await import('/src/store/lessonPassage.ts');
   const h=window.__MAESTRO_TEST__,ref=h.audioRecorder.getSnapshot().lastRecording;
   const bytes=await h.store.read(ref.assetPath),ac=new AudioContext(),buffer=await ac.decodeAudioData(await bytes.arrayBuffer());await ac.close();
   const descriptor=await prepareLessonPassage(h.store,ref,location.href);
   return {bytes:bytes.size,duration:buffer.duration,descriptor};
  });
  check('native short stream remains decodable',native.bytes>0&&native.duration>0);fs.writeFileSync(path.join(out,'native.json'),JSON.stringify(native,null,2));
  await page.getByText('Altri modi di trasferire il passaggio',{exact:true}).click();
  await page.getByRole('button',{name:'Copia passaggio per il corso',exact:true}).click();
  check('copy compatibility returns the same canonical descriptor',JSON.parse(await page.getByRole('textbox',{name:'Riferimento del passaggio',exact:true}).inputValue()).recordingId===descriptor.recordingId);
  for(const width of [1440,820,390,360]){
   await page.setViewportSize({width,height:width>1000?1000:844});
   await page.locator('.st-passage-panel').evaluate(element=>{element.scrollTop=0});
   await page.screenshot({path:path.join(out,`author-${width}.png`)});
   check(`panel fits ${width}`,await page.locator('.st-passage-panel').evaluate(element=>{const r=element.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}));
   check(`document fits ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.getByRole('button',{name:'Chiudi pannello passaggio',exact:true}).click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
   check(`canvas remains dominant ${width}`,await page.locator('.st-studio-canvas').evaluate(element=>element.getBoundingClientRect().height>innerHeight*.65));
   check(`actual board annotation is visible ${width}`,await page.evaluate(()=>{const api=window.__MAESTRO_TEST__.apiRef.current,s=api.getAppState(),element=api.getSceneElements()[0],zoom=s.zoom.value,left=s.offsetLeft+(element.x+s.scrollX)*zoom,top=s.offsetTop+(element.y+s.scrollY)*zoom;return left>=0&&left+element.width*zoom<=innerWidth&&top>=0&&top+element.height*zoom<=innerHeight}));
   await page.screenshot({path:path.join(out,`board-${width}.png`)});
   const trigger=page.getByRole('button',{name:'Registra e collega un passaggio',exact:true});await trigger.focus();await trigger.press('Enter');
   await page.getByRole('button',{name:'Chiudi pannello passaggio',exact:true}).focus();await page.keyboard.press('Escape');
   check(`Escape restores trigger focus ${width}`,await trigger.evaluate(element=>element===document.activeElement));
   await trigger.press('Enter');
  }
  await page.goto(descriptor.replayUrl);await page.getByRole('slider',{name:'linea del tempo della lezione'}).waitFor();
  await page.getByRole('img',{name:'Oggetto collegato evidenziato: '+label,exact:true}).waitFor();
  for(const width of [1440,820,390,360]){
   await page.setViewportSize({width,height:width>1000?1000:844});await page.getByRole('button',{name:'Inquadra contenuto',exact:true}).click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:path.join(out,`replay-${width}.png`)});
   check(`highlight remains in view ${width}`,await page.getByRole('img',{name:'Oggetto collegato evidenziato: '+label,exact:true}).evaluate(element=>{const r=element.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}));
  }
  await page.getByRole('button',{name:"Ascolta registrazione dall'inizio",exact:true}).click();await page.waitForTimeout(250);
  check('listen restarts actual media',await page.locator('audio').evaluate(element=>element.currentTime>0&&element.currentTime<element.duration));
  const stale=new URL(descriptor.replayUrl);stale.searchParams.set('objectVersion','999');await page.goto(stale.href);
  await page.getByText(/versione dell'oggetto non coincide/).waitFor();check('stale pinned object is explicit error',true);
  await page.goto(studio+'/#studio-deep-qa');await page.getByRole('button',{name:'Registra e collega un passaggio',exact:true}).click();
  await page.getByText('Audio delle aperture precedenti',{exact:true}).click();await page.getByRole('button',{name:'Revoca audio della registrazione precedente',exact:true}).click();await page.getByRole('button',{name:'Audio revocato',exact:true}).waitFor();
  await page.goto(descriptor.replayUrl);await page.getByText('Audio revocato e cancellato.',{exact:true}).waitFor();check('reopened historical session revocation survives the bridge',true);
  check('no page errors',errors.length===0);check('no failed requests',failedRequests.length===0);check('no console warnings/errors',consoleMessages.length===0);
 }catch(error){fs.writeFileSync(path.join(out,'failure.txt'),String(error.stack));if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error}
 finally{await context.tracing.stop({path:path.join(out,'trace.zip')});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({checks,errors,consoleMessages,failedRequests},null,2));await browser.close()}
 console.log(JSON.stringify({out,checks:checks.length}));
})().catch(error=>{console.error(error);process.exitCode=1});
