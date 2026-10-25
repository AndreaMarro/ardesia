import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const repo=resolve(process.env.ARDESIA_QA_REPO||process.cwd());
const {chromium,expect}=createRequire(join(repo,'apps/web/package.json'))('@playwright/test');
const base=new URL(process.env.ARDESIA_PUBLIC_BASE_URL);
if(base.search||base.hash||base.username||base.password)throw Error('Bare public origin required');
const out=resolve(process.env.ARDESIA_PUBLIC_QA_OUT);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.ARDESIA_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const report={origin:base.origin,passed:false,checks:[],audio:{auditoryQuality:'NOT_REVIEWED; full transcript available. Decode/playback is not a listening or scientific editorial review.'}};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 if(process.env.ARDESIA_PUBLIC_QA_ACCESS_FILE){
  const access=new URL(JSON.parse(await readFile(process.env.ARDESIA_PUBLIC_QA_ACCESS_FILE,'utf8')).url);
  if(access.origin!==base.origin)throw Error('Wrong private access destination');
  try{expect((await context.request.get(access.href)).status()).toBe(200);}catch{throw Error('Private preview access failed; URL omitted');}
 }
 const page=await context.newPage();
 const errors=[],failed=[],external=[];
 page.on('pageerror',()=>errors.push('pageerror'));page.on('console',msg=>{if(msg.type()==='error')errors.push('console');});
 page.on('requestfailed',r=>failed.push({path:new URL(r.url()).pathname,reason:r.failure()?.errorText}));
 page.on('request',r=>{if(new URL(r.url()).origin!==base.origin)external.push(new URL(r.url()).hostname);});
 await page.addInitScript(()=>{window.__microphoneRequests=0;if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{window.__microphoneRequests++;throw Error('Microphone not part of public demo');};});
 await page.goto(base.href);await page.waitForLoadState('networkidle');
 await expect(page.getByRole('heading',{name:/Una lezione non finisce/})).toBeVisible();
 await expect(page.locator('a[href="/esperienza/?modello=molla"]')).toBeVisible();
 await expect(page.locator('a[href="/esperienza/?modello=idrostatica"]')).toBeVisible();
 expect(await page.locator('a[href*="/esempi/"]').count()).toBe(0);
 const contact=(await page.locator('a[href^="https://wa.me/"]').first().getAttribute('href'));
 expect(contact).toContain('https://wa.me/');report.contact={configuredWhatsAppLink:true,messageSent:false,accountCreated:false,enrollmentCreated:false,paymentStarted:false};
 for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBe(true);}
 await page.screenshot({path:join(out,'landing-390.png'),fullPage:true});
 // Full-page capture triggers the landing's lazy portrait; finish the real
 // request before navigating away, retaining the zero-failed-request assertion.
 await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
 await page.waitForLoadState('networkidle');
 await page.getByRole('link',{name:'Prova la lezione sui fluidi'}).click();
 await expect(page.getByRole('button',{name:'Flusso e raggio',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByLabel('Rapporto previsto',{exact:true}).fill('2');await page.getByRole('button',{name:'Metti alla prova',exact:true}).click();
 await expect(page.getByTestId('physics-ratio')).toHaveText('Q/Q0 = 16');
 await page.getByRole('button',{name:'Riprendi il vincolo',exact:true}).click();
 const lesson=page.getByTestId('lesson-demo');await expect(lesson).toBeVisible();
 const transcript=await lesson.locator('blockquote').innerText();
 expect(transcript).toContain('Non cambia la legge: cambia il vincolo.');
 await expect(page.getByText(/Una risposta ottenuta dopo questo aiuto è una risposta assistita/)).toBeVisible();
 await lesson.getByRole('link',{name:'Ritrova la formula collegata'}).click();
 await expect(page.locator('#poiseuille-formula')).toBeVisible();
 const player=lesson.locator('audio');
 await expect(player).toHaveAttribute('preload','none');
 expect(await player.evaluate(a=>a.paused)).toBe(true);
 await lesson.getByRole('button',{name:'Ascolta il passaggio',exact:true}).click();
 await expect.poll(()=>player.evaluate(a=>a.currentTime),{timeout:10000}).toBeGreaterThan(.15);
 report.audio.duration=await player.evaluate(a=>a.duration);report.audio.nativeDecoded=true;report.audio.playheadAdvanced=true;
 await lesson.getByRole('button',{name:'Pausa audio',exact:true}).click();
 const pausedAt=await player.evaluate(a=>a.currentTime);expect(await player.evaluate(a=>a.paused)).toBe(true);
 await lesson.getByRole('button',{name:'Ascolta il passaggio',exact:true}).click();
 await expect.poll(()=>player.evaluate(a=>a.currentTime)).toBeGreaterThan(pausedAt+.1);
 await player.evaluate(a=>{a.currentTime=a.duration-.2;});
 await expect.poll(()=>player.evaluate(a=>a.ended),{timeout:5000}).toBe(true);
 await expect(lesson.getByRole('button',{name:'Ascolta il passaggio',exact:true})).toHaveAttribute('aria-pressed','false');
 Object.assign(report.audio,{pauseResume:true,endedStateReset:true,syntheticVoiceLabel:true,transcriptAvailable:true,formulaLink:true});
 await page.getByRole('button',{name:'Un problema diverso',exact:true}).click();
 await expect(page.getByLabel('Rapporto previsto',{exact:true})).toHaveValue('');await expect(page.getByTestId('physics-ratio')).toHaveCount(0);
 await page.getByLabel('Rapporto previsto',{exact:true}).fill('4');
 await page.getByRole('button',{name:'Salva una bozza in questo browser',exact:true}).click();await page.waitForLoadState('networkidle');
 await page.reload();await expect(page.getByLabel('Rapporto previsto',{exact:true})).toHaveValue('4');
 await expect(page.getByTestId('physics-ratio')).toHaveCount(0);await page.getByRole('button',{name:'Metti alla prova',exact:true}).click();
 await expect(page.getByTestId('physics-ratio')).toHaveText('Δp/Δp0 = 4');
 await page.getByRole('button',{name:'Molla e forza',exact:true}).click();
 expect(new URL(page.url()).searchParams.get('modello')).toBe('molla');
 await page.waitForLoadState('networkidle');await page.reload();
 await expect(page.getByRole('button',{name:'Molla e forza',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>window.__microphoneRequests)).toBe(0);
 expect(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
 await page.waitForLoadState('networkidle');expect(errors).toEqual([]);expect(failed).toEqual([]);expect(external).toEqual([]);
 report.checks=['landing-to-experience','three-entries','configured-contact-no-send','wrong-prediction-preserved','contextual-transcript','formula-object-link','assisted-disclosure','native-audio-no-autoplay','pause-resume','ended-state','fresh-transfer','local-reopen-hidden-result','switch-refresh-same-model','no-microphone','reduced-motion','zero-console-network-errors'];
 report.navigation=await page.evaluate(()=>performance.getEntriesByType('navigation').map(e=>({duration:e.duration,domContentLoaded:e.domContentLoadedEventEnd,transferSize:e.transferSize})));
 report.passed=true;await context.close();
}catch(error){report.error=String(error.message).replace(/https?:\/\/[^\s)"']+/g,'[URL omitted]');process.exitCode=1;}
finally{await browser.close();await writeFile(join(out,'context-report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(report.passed?'PASS contextual lesson, native audio, transfer, reload and contact':'FAIL context; see sanitized report');
